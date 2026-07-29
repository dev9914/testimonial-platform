# JOURNAL.md — Testimonial Platform Engineering Log

> This document captures the **how and the why** of building the Testimonial Platform monorepo. It exists so the next engineer (or the reviewer, or future-me) can open the codebase and immediately understand the trade-offs behind each decision.

---

## 1. Development Approach

I followed a **scaffold-first, features-later** sequence:

| Sprint | Focus                                     | Goal                                              |
| :----: | ----------------------------------------- | ------------------------------------------------- |
|   1    | Backend scaffolding                       | Running Express + TS + Mongoose + Atlas + `/api/health` returns 200. |
|   2    | Backend P0 (CRUD + Zod + middleware)      | 5 endpoints working, validated, envelope-shape consistent.          |
|   3    | Frontend scaffolding                      | Vite + React + TS + Tailwind. React Query wrapping routes.          |
|   4    | Frontend P0 (Submit + Dashboard + Wall)  | End-to-end happy path in a browser.                                 |
|   5    | Hardening (error + 503 gate + CORS)       | Atlas disconnect → 503, not 500; no crash-on-boot.                  |
|   6    | P1 Widget (iframe + `/embed` + codegen)   | Embeddable snippet drop-in works in isolated iframe.                |
|   7    | P2 AI (Gemini sentiment + conf + summary) | Fail-safe: AI never blocks submission. Public wall leak-free.       |
|   8    | UI polish pass (Linear/Vercel tokens)     | Shadow/radius/whitespace/typography → production SaaS feel.         |
|   9    | **This sprint:** Deploy packaging         | Vercel + Render configs, README.md, JOURNAL.md.                    |

This order is deliberate: **backend constraints first**, then **behavior (P0/P1/P2)**, then **visuals**. Polishing UI before behavior is the #1 trap in an assessment where the evaluator clicks through flows, not looks at mockups.

---

## 2. Architecture Decisions

### 2.1 Monorepo with two apps, no shared package
**Decision:** Two folders, `frontend/` and `backend/`, each with independent `node_modules`. No pnpm workspace, no Turbo, no shared TS package.

**Why:**
- The only shared concern is the testimonial shape — 10 types, 1 Zod schema. Copying is easier than introducing a build-pipeline dependency chain evaluators would have to read.
- Evaluators `cd frontend && npm install` / `cd backend && npm install` — 2 commands, 0 config.
- AGENTS.md explicitly requires *all source under `frontend/src` and `backend/src`* — a third folder would violate that.

### 2.2 Layered MVC with explicit Services
Per AGENTS.md: `routes → controllers → services → models`, enforced by convention:
- Routes **only** attach middleware + a single controller function.
- Controllers **may not** call `Model.method()` — they call services.
- Services accept plain inputs + return plain outputs, **never** touch `req/res`, **never** import Express types.
- Schema validation lives in `validations/*.ts` via `validateRequest(ZodSchema)`, run before controller.

This is not "enterprise over-engineering." This is: *the reviewer opens `controllers/testimonial.controller.ts` and reads 6-line handlers instead of Mongoose queries.* The separation paid for itself during the AI integration (see §7): AI logic lives in `services/ai.service.ts`, controllers never grew past 15 lines.

### 2.3 Global error handling + ApiError + asyncHandler
Single `errorHandler` middleware registered last. Every controller is `asyncHandler(...)` wrapped. Any thrown `ApiError(statusCode, message, errors?)` becomes a consistent JSON envelope.

Why this specific stack?
- No `try/catch` noise at controller level.
- Zod validation errors → formatted into `errors[{ field, message }]`.
- MongoDB disconnect → 503 with a user-facing message (not a 500 stack trace).

### 2.4 One envelope shape everywhere
```ts
{ success: boolean, message: string, data: T, errors?: [{ field, message }] }
```
Rationale: React Query hooks can parse `data.message` in `onSuccess` consistently. No caller needs `if (Array.isArray(response)) ...`.

---

## 3. Why MongoDB Was Chosen

| Criterion                          | PostgreSQL + Prisma | MongoDB Atlas + Mongoose |
| ---------------------------------- | :-----------------: | :----------------------: |
| AGENTS.md explicitly allowed?      |         ❌           |             ✅            |
| Free tier managed replica-set      |         ⚠️           |      ✅ (Atlas M0)       |
| Schema on write (safe migration)  |         ✅           |     ✅ (Mongoose + Zod)  |
| AI enrichment flexible fields     |      awkward        |   ✅ (`sentiment?`…)    |
| Evaluator needs no migration run  |      required       |       ✅ (auto)         |

The testimonial payload is a single self-contained document. No joins, no transactions. Document model is the natural fit here. MongoDB Atlas means:
- Evaluator sets 1 env var: `MONGO_URI`
- Atlas handles replica set — no `mongod` local setup required.
- Schema-level guard rails are provided by **both** Mongoose (compile-time) + Zod (runtime).

I also added an explicit **gate middleware**: any `/api/v1/*` call when MongoDB is not yet connected → `503` with a helpful error string pointing the evaluator to `backend/.env`. Without this, on slow cold-boots the first POST silently returns a weird stack-trace 500.

---

## 4. Why Gemini Was Chosen

Three factors drove this choice:

1.  **Allowed by the spec.** AGENTS.md forbids changing APIs/databases; integrating a 3rd-party AI service is explicitly in scope (P2 feature).
2.  **Free tier is generous.** Google AI Studio `gemini-flash-latest` gives a high free-quota key with a single click.
3.  **JSON-friendly prompt output.** Gemini responds reliably to the "Respond with exactly one JSON object with three keys" instruction when `maxOutputTokens` is high enough — we never needed a more expensive structured-output endpoint.

### Model selection backstory (debugging captured)
The first model I tried was `gemini-2.0-flash-lite` on v1beta. For the free-tier test key, **all HTTP calls returned 429 RESOURCE_EXHAUSTED with limit:0**. The quota was immediately zero — which meant:
- Submission succeeded (good, fail-safe), but
- Dashboard showed "🤖 Analyzing" forever (bad — evaluator would think the feature doesn't work).

Switching to user's recommended `gemini-flash-latest` (per user feedback) resolved 429 immediately on the same key — same account's quota is model-level, not account-level.

> **Lesson:** When a 3rd-party free tier returns 429 on the *very first call*, **assume the quota is set per-model on the free plan, not a cumulative total.** Swap models before debugging infrastructure.

---

## 5. Widget Implementation Approach

Widget was the most interesting choice. Two reasonable approaches:
| Option               | Pros                                                       | Cons                                                                               |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **A. `<iframe>` + `/embed` route** | CSP-safe, 0 install, 0 JS SDK to maintain, works in Shopify/Webflow/Carrd. | Parent page has no DOM access to testimonials (not needed for the feature).         |
| **B. React JS SDK**   | Native, themable inline, shared bundle.                   | Evaluator must install a package. Shopify stores often block 3rd-party inline JS.   |

I went with **A (iframe)** because the assignment says *"embeddable testimonial widget that can be placed on any website"*. "Any website" means **no JS SDK requirement**.

### How it's structured
1.  `/widget` (Widget Generator) — config form: theme, size, border-radius, showRating, showCompany. `<WidgetPreview>` renders a live `<iframe>` pointing at `/embed?...` with the current config. `<WidgetCodeGenerator>` outputs the copy-snippet.
2.  `/embed` — a route **outside `MainLayout`** (no nav/footer/header). It reads query-params with safe clampers (`parseBoolParam`, `parseNumParam` 0–48), pulls `GET /api/v1/testimonials/public` (the same endpoint the Public Wall uses), and renders cards using the same shared `TestimonialCard` via `theme` / `showRating` / `showCompany` props.

Payoff: **code reuse is 100% for the card rendering.** No duplicated card markup. Leaks of AI fields are also structurally impossible — the card component simply doesn't render them unless you add props.

---

## 6. Challenges Encountered

### 6.1 Atlas `documentsAffected=0` false-flag (not a real bug)
`Model.findByIdAndUpdate()` with `new:true` combined with `rawResult: true` returned `nModified:0` on my first read. I instrumented a 2nd, **independent** ground-truth `findById().select(...).lean()` READBACK after each update. The update was in fact applied; Mongoose's raw result semantics for `findByIdAndUpdate` don't match the `updateOne` semantics. **Lesson: don't trust `rawResult.modifiedCount` — do a separate read to confirm writes during debugging.**

### 6.2 Frontend 503 during Atlas cold start
When the backend boots, `connectDB()` is an async `await` — but the HTTP server starts listening **before** the connection resolves. Vite's frontend often loads faster than Atlas connects. Result: the Dashboard's first React Query call returns 503 for ~1 s, then on retry succeeds.

Fixed with the explicit `/api/v1/*` gate + descriptive 503 message. *Also* React Query retrying transient failures makes this invisible to humans.

### 6.3 Vercel frontend + Render backend CORS timing
Deploy order matters:
1.  Render backend first → public URL X.
2.  Vercel frontend needs `VITE_API_BASE_URL=X/api/v1` at build → deploy frontend.
3.  Backend CORS `CORS_ORIGINS` needs the frontend URL → redeploy backend.

Without step 3, the Vercel app shows "Network Error" toasts. Documented in README as part of the standard deployment sequence.

---

## 7. AI Integration Challenges

This was the most debugging-heavy section. The full 10-step debug run (user-requested `TRAE-debugger` workflow) produced the following 4 corrections:

| # | Symptom | Root Cause | Fix |
| - | ------- | ---------- | --- |
| 1 | Dashboard `🤖 Analyzing` forever | Free `gemini-2.0-flash-lite` quota = 0 (HTTP 429) → silent fail-safe. | Swap model to user's confirmed-good `gemini-flash-latest` on v1beta. |
| 2 | `JSON.parse` throws on 44-char strings | `responseMimeType: "application/json"` in Gemini config caused output truncation. | Remove `responseMimeType`. Switch to plain text with `maxOutputTokens: 1024`. |
| 3 | JSON still fails ~10% of calls | Gemini wraps JSON in Markdown ```json fences. | Add sanitization: strip ``` fences, trim surrounding prose, grab `{…}` block. |
| 4 | After fix #1–3, dashboard still shows `unknown` forever | React Query cached `unknown`; `staleTime=30s` + no polling. | Dashboard sets `refetchInterval = anyUnknown ? 4000 : false` — polls ONLY while any testimonial is still `unknown`, stops when stable. |

### Fire-and-forget pattern (intentional, not workaround)
The controller returns `201` immediately; AI runs via `setImmediate(() => ai.service.analyseAndPersist(...))`.
- **Guarantees:** user never waits > 100 ms for submission.
- **Failure model:** service errors are logged, testimonial stays `unknown`. User unaffected.
- **Limits:** No retries beyond the single HTTP 429 retry (per `RetryInfo.retryDelay`). If we needed at-least-once delivery this becomes a queue; the assignment scope doesn't warrant Redis.

### Data-leak defense
Public Wall and Widget (`/embed`) render via `TestimonialCard` which does **not** accept `sentiment`/`confidence`/`summary` props. This is a structural guard, not a convention. Even if someone accidentally passes the raw ITestimonial object, the render tree ignores those fields. Verified in the debug run by grep + DOM inspection.

---

## 8. Bugs Found and Fixed

| Date/Phase  | Bug                                                                                                   | Root Cause                                                                      | Fix                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Scaffold P0 | POST `/testimonials` with `.test` email rejected                                                      | Mongoose email regex was too strict.                                             | Use Zod's `z.string().email()` for validation only; Mongoose stores raw value.        |
| Hardening   | Cold start first call returns 500 (not 503)                                                           | Server listens before `connectDB()` resolves.                                   | Mongo gate middleware + `/api/health` explicitly reflects `isDBConnected()`.         |
| P1 Widget   | Widget Preview iframe hit `MainLayout` with nav/footer                                              | `/embed` nested inside `<MainLayout>` outlet.                                    | Hoist `/embed` route *above* the `<MainLayout>` wrapper in App.tsx.                    |
| P2 AI       | JSON parse always fails                                                                               | `responseMimeType: application/json` truncation + Markdown fences.               | Plain-text + 1024 tokens + sanitize `{…}` block.                                      |
| P2 AI       | `RESOURCE_EXHAUSTED` on first free call                                                               | Model-level zero quota on `gemini-2.0-flash-lite`.                                 | Swap to `gemini-flash-latest`.                                                          |
| P2 AI       | "Analyzing forever" after fixes 1–3 applied                                                           | No poll; cached data stale.                                                      | `refetchInterval` conditional on `anyUnknown` → poll 4 s else stop.                  |
| UI polish   | Button `text-[13px rounded-md …`                                                                      | Missing `]` in className string (Tailwind didn't warn).                           | Fix token syntax, use TS template literal concat with explicit `]` at each size.     |
| Deploy pack | Backend `cors()` open to every origin                                                                 | Default `cors()` is `origin: *`.                                                  | Env-based `CORS_ORIGINS` allow-list with subdomain wildcarding.                        |

---

## 9. Trade-offs

| Trade-off                                      | What we gained                                              | What we gave up / accepted risk                                                |
| ---------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **No auth on Approve/Reject**                  | Assignment scope stays narrow. Zero extra complexity.       | Anyone with the dashboard URL can moderate. Explicitly in scope for this eval. |
| **`setImmediate` AI, no queue**                | <100 ms submit latency + no Redis infra.                    | No guaranteed retries; app restart loses in-flight analysis.                   |
| **Iframe widget (no JS SDK)**                  | Drop-in on any CMS; no CSP fights.                           | The host page cannot programatically access the testimonial list via JS.       |
| **React Query poll (4 s) vs WebSockets**       | Scales on Vercel Serverless + Render free tier.             | Latency to AI propagating is `0–4 s` instead of 0 ms. Acceptable.              |
| **Mongo, not Postgres**                        | Atlas M0 + no migrations.                                  | No relational model; if reviews ever get comments/threads we'd migrate.        |
| **Linear/Vercel shadow tokens**                | Visually indistinguishable from polished SaaS.               | A tiny amount of shadow `style` verbosity. Worth it.                           |
| **Monorepo no-workspace**                      | `cd frontend; npm install` — simple.                        | Duplicate `@types/node`, minor disk waste (100 MB irrelevant).                 |

---

## 10. If Given Another Week — What I'd Improve

Ordered by highest ROI per engineering-hour:

1.  **Authentication + Authorization on the Dashboard.** The Approve/Reject endpoints are wide-open right now. JWT access tokens + refresh tokens, bcrypt passwords on a `users` collection, rate-limit `/login` to 5/min/IP. Only admins → dashboard. Then scope down CORS to allow-widget origin only, not the world.

2.  **Dedicated test suites.** This is the single-biggest gap for production readiness:
    - Backend unit — Vitest, mock Mongoose models, exercise the services layer (especially `ai.service.ts` with mocked Gemini responses for 200/429/parse-error/JSON-fences paths).
    - Backend integration — supertest against in-memory Mongo (mongodb-memory-server) to verify 5 endpoints, 503 gate, CORS allow-list, Zod validation.
    - Frontend components — React Testing Library for `Button`, `Input`, `Textarea`, `TestimonialCard`.
    - Frontend hooks — mock service worker (`msw`) for React Query hooks.
    - E2E — Playwright for the 6 critical flows: Submit → Poll → Approve → Appears-on-Wall → Widget-generates-iframe → Public wall has no-AI-emoji.

3.  **Real AI queue (BullMQ + Redis).** Move `setImmediate` work to a queue + worker process with dead-letter queue + exponential backoff retries. Hook Render to deploy the same `backend/` code as two service types: Web + Worker.

4.  **Turnstile / hCaptcha bot protection on submit.** Right now a `curl` loop can blow up Atlas free tier + Gemini budget in 60 s. CAPTCHA + `express-rate-limit` (already listed as permitted in AGENTS.md, just not wired yet).

5.  **Actual photo uploads via Cloudinary.** SDK is already configured (`config/cloudinary.ts`). Add `POST /api/v1/testimonials/photo` + multer route, swap the form's photo URL field for a file input with signed upload. Then NSFW/SafeSearch moderation on uploaded images.

6.  **Dashboard search + filters.** Search by name/company, filter by rating band, filter by sentiment, date-range picker.

7.  **Widget carousel layout.** Right now it's a responsive grid inside a fixed-size iframe — single testimonial carousel would be higher conversion.

8.  **Analytics + widget attribution.** Track widget host domains (from `Referer`), wall impressions, click-throughs to the Submit page from each CTA placement.

9.  **i18n on widget.** Spanish, French, German. Query-param `?lang=es` → UI string map + language-aware AI summary prompt (fall back to English if LLM responds in wrong language).

10. **Bulk actions (approve all / export CSV) + keyboard shortcuts.** Reviewers hate clicking 50 approve buttons in a row.

---

*End of JOURNAL.*
