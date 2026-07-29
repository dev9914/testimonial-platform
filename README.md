<div align="center">

# Testimonial Platform

**A production-grade, full-stack testimonial collection SaaS.**
Collect customer testimonials with AI-powered sentiment analysis, moderate them via a Kanban dashboard, showcase them on a public wall, and embed a customizable widget on any website.

[![Stack: React + Vite + TypeScript](https://img.shields.io/badge/frontend-React%20%7C%20Vite%20%7C%20TS-61DAFB?logo=react)](https://react.dev)
[![Stack: Express + TS + MongoDB Atlas](https://img.shields.io/badge/backend-Express%20%7C%20TS%20%7C%20MongoDB-13AA52?logo=mongodb)](https://www.mongodb.com/atlas/database)
[![AI: Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=googlegemini&logoColor=white)](https://aistudio.google.com)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue)](LICENSE)
[![Styled with Tailwind](https://img.shields.io/badge/styled%20with-Tailwind-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

**[Key Features](#features) · [Architecture](#architecture) · [API](#api-endpoints) · [Local Setup](#local-setup) · [Deployment](#deployment-guide)**

</div>

---

## Project Overview

Testimonial Platform is a **monorepo** with two first-class apps:

| App     | Stack                                      | Local URL             | Production Target |
| ------- | ------------------------------------------ | --------------------- | ----------------- |
| Frontend (SPA) | React 18 · Vite · TypeScript · Tailwind · React Query | `http://localhost:5173` | **Vercel**        |
| Backend (REST) | Node 20 · Express · TypeScript · Mongoose (MongoDB Atlas) · Zod | `http://localhost:5000` | **Render**        |

AI-powered analysis runs **asynchronously at submission time** — user latency stays < 100 ms, AI insights (sentiment / confidence / summary) propagate to the Moderation Dashboard once the Gemini call completes.

---

## Features

### Core
- ✅ **Testimonial Submission Form** — React Hook Form + Zod validation, 5-star rating, optional photo URL.
- ✅ **3-Column Moderation Dashboard** — Kanban-style Pending / Approved / Rejected, one-click Approve & Reject.
- ✅ **Public Wall** — Beautiful responsive grid of all approved testimonials.
- ✅ **Embeddable Widget** — Zero-JS iframe generator with:
  - Theme toggle: **Light / Dark**
  - Configurable: border-radius, size, show/hide ratings & company
  - Live preview + one-click copy `<iframe>` snippet
  - Rendered via `/embed` route — works on Shopify, Webflow, Carrd, anything.

### AI (Optional, toggleable)
- 🤖 **Gemini-powered Analysis** — every submission is enriched with:
  - `sentiment`: `positive` · `neutral` · `negative` · `unknown`
  - `confidence`: 0–100
  - `summary`: short TL;DR quote (≤ 280 chars)
- Fail-safe: **AI failures never block submissions**. Default values (`unknown` / `null`) are stored and re-rendered as a "🤖 Analyzing" chip.
- Public Wall and Widget **never leak AI data** — insights are moderator-only.

### UX
- Shimmer skeletons for every loading state.
- React Query optimistic updates with rollback on Approve/Reject.
- Conditional 4 s polling on the Dashboard while any testimonial is `sentiment=unknown`.
- Inset-shadow Linear-style button tokens, soft card shadows, 60 fps hover lifts.
- Fully responsive: Mobile · Tablet · Desktop.

---

## Screenshots

> ⚠️ Screenshot placeholders — replace with real PNGs before publishing.

| Submission Page | Moderation Dashboard |
| --- | --- |
| ![Submission Page]([https://kommodo.ai/i/Kcd8YnwDtf8KUayyXaqB](https://plain-apac-prod-public.komododecks.com/202607/29/Kcd8YnwDtf8KUayyXaqB/image.png)) | ![Dashboard](https://kommodo.ai/i/buWFRL0YYt3NSjnYxphx) |

| Public Wall | Embeddable Widget Generator |
| --- | --- |
| ![Public Wall](https://kommodo.ai/i/hsGabvVidl3nB4EJIu9O) | ![Widget Generator](https://kommodo.ai/i/KrBQUdmXQCFnybTz5una) |

| Mobile View | Dark Widget Embed |
| --- | --- |
| ![Mobile](https://kommodo.ai/i/JI3FS3MarRI5zPaZMai2) | ![Dark Widget](https://kommodo.ai/i/k9ALOhDmuwdYjoV2UxT4) |

---

## Architecture

### Backend: Layered MVC with Services

```
routes → controllers → services → models

routes/            # Endpoints + middleware composition. 0 business logic.
controllers/       # Parse req.body/query/params, call services, shape JSON.
                   # Never call Mongoose directly.
services/          # Pure business logic. Accept plain data, return plain data.
                   # No req/res. Never import Express types.
models/            # Mongoose schemas + schema-level validation + indexes.
middleware/        # Zod validation, notFound, global errorHandler.
validations/       # Zod schemas (one file per domain).
config/            # MongoDB Atlas + Cloudinary configs.
utils/             # ApiError class, asyncHandler wrapper.
```

Every controller is wrapped in `asyncHandler(...)`, every error flows to a single global error middleware. Every incoming payload is validated in Zod via `validateRequest(schema)`.

### Frontend: Feature-based + React Query

```
pages/             # Route-level containers (compose features + layout).
components/common/ # Reusable UI: TestimonialCard shared by Wall + Widget.
components/        # Primitives: Button, Input, Textarea, Card, Skeleton, ...
services/api.ts    # axios instance with VITE_API_BASE_URL.
services/*.ts      # Domain API helpers (typed).
context/           # ToastProvider (global notifications).
layouts/           # MainLayout (header + nav + footer + <Outlet/>).
hooks/             # Custom hooks.
types/             # Shared TypeScript interfaces (ITestimonial, etc).
utils/             # formatDate, helpers.
```

- **Server state = React Query** (no `useEffect` fetching).
- **Client state = local `useState`**, ToastProvider only.
- **Forms = react-hook-form + zodResolver**.

---

## Folder Structure

```
assesment/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # TestimonialCard (wall + widget)
│   │   │   ├── Button.tsx         # 6 variants, 3 sizes, Linear-style tokens
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Skeleton.tsx       # Shimmer
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── RatingStars.tsx
│   │   │   ├── WidgetCodeGenerator.tsx
│   │   │   └── WidgetPreview.tsx
│   │   ├── pages/
│   │   │   ├── SubmissionPage.tsx  # "/"
│   │   │   ├── DashboardPage.tsx   # "/dashboard"
│   │   │   ├── PublicWallPage.tsx  # "/wall"
│   │   │   ├── WidgetPage.tsx      # "/widget"
│   │   │   └── EmbedPage.tsx       # "/embed"   (iframe route)
│   │   ├── context/ToastContext.tsx
│   │   ├── layouts/MainLayout.tsx
│   │   ├── services/
│   │   ├── types/index.ts
│   │   ├── utils/formatDate.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css              # @layer base + utilities + 7 keyframes
│   ├── package.json
│   ├── vercel.json                # SPA rewrites + security + cache headers
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── routes/                 # testimonial.routes + index barrel
│   │   ├── controllers/            # testimonial.controller (5 handlers)
│   │   ├── services/
│   │   │   ├── testimonial.service.ts
│   │   │   └── ai.service.ts       # Gemini. Caller MUST NOT block responses.
│   │   ├── models/Testimonial.ts   # Schema + enum validation + timestamps
│   │   ├── middleware/             # errorHandler · notFound · validateRequest
│   │   ├── validations/
│   │   ├── config/                 # db.ts (MongoDB Atlas) · cloudinary.ts
│   │   ├── utils/                  # ApiError · asyncHandler
│   │   ├── app.ts                  # CORS · /api/health · v1 router
│   │   └── server.ts               # connectDB + listen
│   ├── package.json
│   └── .env.example
│
├── .env.example                    # Root quick-reference
├── README.md                       # This file
├── JOURNAL.md                      # Decisions, bugs, trade-offs
└── AGENTS.md                       # AI-agent engineering rules
```

---

## Tech Stack

### Frontend
| Concern          | Library                          | Why                                                                 |
| ---------------- | -------------------------------- | ------------------------------------------------------------------- |
| Rendering        | React 18                         | Component model, huge ecosystem. SPA-only, no SSR (per AGENTS.md).  |
| Build Tool       | Vite 8                           | < 1 s cold starts, ESM-native, Rollup for prod builds.              |
| Language         | TypeScript 5/6 (strict: true)    | No `any` without an explicit `@ts-expect-error` + guard.            |
| Styling          | Tailwind CSS                     | Utility-only tokens, no CSS modules, no other CSS frameworks.       |
| Server State     | @tanstack/react-query v5         | Caching, background refetch, optimistic updates, polling.           |
| HTTP             | axios v1                         | Interceptors, typed services, error shape compatibility.            |
| Forms            | react-hook-form + @hookform/resolvers/zod | Minimal re-renders, Zod for runtime + build-time checks.   |
| Routing          | react-router-dom v6/v7           | Nested `<Outlet>` layout, `/embed` route outside layout.             |

### Backend
| Concern          | Library                          | Why                                                                 |
| ---------------- | -------------------------------- | ------------------------------------------------------------------- |
| Framework        | Express 4                        | Minimal, battle-tested, every middleware pattern is native.         |
| ODM              | Mongoose 9 + MongoDB Atlas       | Schema + validation + indexes; Atlas managed replica-set out-of-box. |
| Validation       | Zod 4                            | Dual FE/BE validation with the same schemas.                        |
| Auth             | —                                | Assignment does not call for auth. Approve/Reject are moderator actions. |
| Media            | Cloudinary SDK (wired, reserved) | Placeholder for future photo upload endpoint.                       |
| AI               | Google Generative AI (Gemini)    | Free-tier quotas + JSON output via custom prompting.                |
| Safety           | helmet · cors · express-rate-limit-ready | Hardened per AGENTS.md cross-cutting rules.                |

### AI Model
**Model:** `gemini-flash-latest` (Google AI Studio, v1beta)
- Sentiment prompt extracts: label + confidence 0–100 + TL;DR summary.
- HTTP 429 `RESOURCE_EXHAUSTED` retries using the server-recommended
  `google.rpc.RetryInfo.retryDelay`.
- No `responseMimeType: application/json` — model output is plain-text with
  high `maxOutputTokens` and Markdown-json sanitization before `JSON.parse`.

---

## AI Feature Explained

The AI enrichment follows three **hard constraints** (see `JOURNAL.md` for the debugging backstory):

1. **Submission latency < 100 ms.** The controller returns 201 immediately;
   AI is dispatched with `setImmediate(() -> ai.service.analyseAndPersist)`.
2. **Failures never block.** If Gemini returns 429 / 5xx / parse error,
   the testimonial stays `sentiment=unknown, confidence=null, summary=null`.
3. **Public views leak nothing.** `PublicWallPage`, `EmbedPage`, and the
   widget-shared `TestimonialCard` only render fields explicitly permitted
   via props; AI fields are not part of the render tree for those callers.

The Dashboard renders sentiment as:
- 😊 / 😐 / 😞 · a 16 px progress bar for confidence · an italic summary quote.
- `sentiment=unknown` → `🤖 Analyzing` chip + "Waiting for AI analysis…" helper.
- React Query polls at **4 s only while any testimonial is still unknown**,
  then stops (no busy-looping once analysis is stable).

---

## Widget Explained

The widget is a **zero-JS, zero-dependency `<iframe>`**. This avoids
cross-origin script CSP headaches on hosts like Shopify.

### How it works
1.  User configures: theme / size / border-radius / showRating / showCompany
    in the **Widget Generator** (`/widget`).
2.  `WidgetCodeGenerator` produces an `<iframe>` pointing at
    `https://<your-vercel-domain>/embed?theme=dark&borderRadius=16&...`.
3.  Host page drops the snippet in any CMS — the browser renders `/embed`
    (the only route **without** `MainLayout`, no nav/footer, responsive).
4.  `EmbedPage` parses query parameters via `useSearchParams` with safe
    bounds (`parseBoolParam`, `parseNumParam` 0–48).

### Embed URL reference
```
GET /embed
  ?theme=light|dark       (default: light)
  &rating=1|0             (default: 1)
  &company=1|0            (default: 1)
  &borderRadius=0..48     (default: 12)
```

Example full code snippet the generator emits:
```html
<iframe
  src="https://testimonial-app.vercel.app/embed?theme=light&rating=1&company=1&borderRadius=16"
  width="100%"
  height="600"
  frameBorder="0"
  loading="lazy"
  title="Customer Testimonials"
></iframe>
```

---

## API Endpoints

All API endpoints live under the `/api/v1` prefix. The MongoDB-connection
gate (503 if Atlas is down) wraps every route in the prefix.

| Method | Path                         | Description                                | Auth | Zod-validated |
| :----: | ---------------------------- | ------------------------------------------ | :--: | :-----------: |
| `GET`  | `/api/health`                | Health + DB connection. 200 or 503.       |  ❌  |       —       |
| `POST` | `/api/v1/testimonials`       | Create (submit) a testimonial.             |  ❌  |       ✅      |
| `GET`  | `/api/v1/testimonials`       | List **all** (all statuses). Moderation.   |  ❌  |       —       |
| `GET`  | `/api/v1/testimonials/public`| List **approved only**. Public Wall + Widget. | ❌  |       —       |
| `PATCH`| `/api/v1/testimonials/:id/approve` | Moderator: approve.                   |  ❌  |       ✅      |
| `PATCH`| `/api/v1/testimonials/:id/reject`  | Moderator: reject.                     |  ❌  |       ✅      |

### Response envelope
Every handler returns a consistent envelope:

```jsonc
// 2xx
{
  "success": true,
  "message": "Testimonial submitted successfully!",
  "data": { /* testimonials: [], testimonial: {...} */ }
}

// 4xx / 5xx (global errorHandler)
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

### ITestimonial schema (wire format)

```ts
{
  _id: string;               // ObjectId hex
  name: string;              // 2–100 chars
  email: string;             // RFC-5322-ish via Zod
  company: string;           // 2–150 chars
  message: string;           // 10–2000 chars
  rating: 1 | 2 | 3 | 4 | 5;
  photo?: string;            // HTTPS URL (optional)
  status: 'pending' | 'approved' | 'rejected';

  // AI fields (moderator-only views)
  sentiment?: 'positive' | 'neutral' | 'negative' | 'unknown';
  confidence?: number | null;  // 0..100
  summary?: string | null;     // AI TL;DR

  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

---

## Local Setup

### Prerequisites
- **Node.js ≥ 20 LTS** (`node -v` to verify)
- **npm ≥ 10**
- **MongoDB Atlas cluster** (free-tier M0 works perfectly). Get a connection
  string at https://cloud.mongodb.com/.
- (Optional) **Google Gemini API key** from https://aistudio.google.com/apikey
  — needed only if you want AI analysis; without it everything still works
  (all testimonials default to `sentiment=unknown`).

### 1. Install
```bash
# Frontend
cd frontend
npm install

# Backend (separate terminal)
cd ../backend
npm install
```

### 2. Environment
```bash
# From repo root:
cp frontend/.env.example frontend/.env
cp backend/.env.example  backend/.env
```
Then edit:
- `backend/.env` — set `MONGO_URI=` to your Atlas +srv string.
- (Optional) `backend/.env` — set `GEMINI_API_KEY=...`.
- `frontend/.env` — leave as-is for local dev; on Vercel set this to the
  Render public URL of the backend.

### 3. Run
```bash
# Terminal 1 — Backend on :5000
cd backend
npm run dev

# Terminal 2 — Frontend on :5173
cd frontend
npm run dev
```

Verify the health check in a separate shell:
```bash
curl http://localhost:5000/api/health
# -> { success: true, message: "Server is running", db: "connected" }
```

Then open http://localhost:5173.

### 4. Smoke test the full flow
1.  `GET /` → submit a testimonial (valid email pattern, rating 5).
2.  Wait for the AI 4 s poll on `/dashboard`; you should see sentiment +
    confidence appear within ~8 s.
3.  Click **Approve**.
4.  Visit `/wall` — the testimonial is now public.
5.  Visit `/widget` → copy iframe → paste into any HTML sandbox → it renders
    with no AI fields leaked.

---

## Environment Variables

### Frontend (`frontend/.env` | Vercel env)

| Name                | Default (local)                 | Required in production? | Notes                                                        |
| ------------------- | ------------------------------- | :---------------------: | ------------------------------------------------------------ |
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1`  |           ✅            | Set to your Render backend `/api/v1`. Re-deploy to update.  |

### Backend (`backend/.env` | Render env)

| Name                    | Default (local)                                       | Required? | Notes |
| ----------------------- | ----------------------------------------------------- | :-------: | ----- |
| `NODE_ENV`              | `development`                                         |     ✅     | `production` on Render (auto).                              |
| `PORT`                  | `5000`                                                |     ✅     | Render injects its own `PORT`; honored by `server.ts`.      |
| `MONGO_URI`             | —                                                     |     ✅     | MongoDB Atlas +srv string with DB name in path.             |
| `CORS_ORIGINS`          | `http://localhost:5173,http://localhost:5174,http://localhost:5175` | ✅ | Comma-separated. Set to `https://your-vercel-domain` in prod. Use `*` for staging. |
| `CLOUDINARY_CLOUD_NAME` | placeholder                                           |     ❌     | Reserved for future photo uploads.                           |
| `CLOUDINARY_API_KEY`    | placeholder                                           |     ❌     | Same.                                                        |
| `CLOUDINARY_API_SECRET` | placeholder                                           |     ❌     | Same.                                                        |
| `GEMINI_API_KEY`        | —                                                     |     ❌     | Leave blank or `DISABLED` to run without AI.                 |

---

## Deployment Guide

### A. Backend → Render (Node Web Service)

1.  Push the monorepo to GitHub.
2.  Render → New → **Web Service** → connect your repo.
3.  Configure:
    | Field            | Value                                                     |
    | ---------------- | --------------------------------------------------------- |
    | **Root Directory**   | `backend`                                            |
    | **Runtime**          | Node 20 LTS                                          |
    | **Build Command**    | `npm install && npm run build`                      |
    | **Start Command**    | `npm run serve` (alias for `node dist/server.js`)   |
    | **Region**           | Oregon (or closest to your MongoDB Atlas cluster)   |
    | **Plan**             | Free tier is fine for an assignment demo.           |
4.  Paste the environment variables from `backend/.env.example`:
    - `MONGO_URI` (**must** be set)
    - `CORS_ORIGINS=https://<your-vercel-app>.vercel.app`
    - `GEMINI_API_KEY=...` (optional)
5.  **Health Check Path** in Render → Settings: `/api/health`.
    Render auto-restarts on non-200; our endpoint returns 503 if Atlas isn't
    connected, so Render will keep pinging until Atlas is reachable.
6.  Deploy. Copy the public URL (`https://<name>-abc12.onrender.com`). This
    is your `VITE_API_BASE_URL` prefix + `/api/v1` for Vercel.

> 💡 **Atlas allow-list note:** Render free tier has dynamic outbound IPs.
> Set Atlas → Network Access → **Allow Access from Anywhere** (0.0.0.0/0) for
> the assignment submission; this is acceptable for a demo. For production
> use a paid Render plan with static outbound IPs + add them in Atlas.

### B. Frontend → Vercel (Vite SPA)

1.  Vercel → New Project → import the same repo. **Root Directory:**
    select **`frontend`** inside the repo.
2.  Framework preset: **Vite** (auto-detected). `vercel.json` at
    `frontend/vercel.json` will be honored for:
    - SPA `rewrites /* → /index.html`
    - Immutably cached `/assets/*` (1 yr)
    - Basic security headers (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, Referrer-Policy, Permissions-Policy)
3.  Environment variables:
    | Name                | Value                                                    |
    | ------------------- | -------------------------------------------------------- |
    | `VITE_API_BASE_URL` | `https://<your-render-service>.onrender.com/api/v1`      |
4.  Deploy. Vercel will run `npm install && npm run build` and emit a
    `https://<project>.vercel.app` URL.
5.  **Back to Render**: paste that Vercel URL into `CORS_ORIGINS` and
    redeploy the backend.

### C. Final smoke test in production
```bash
# 1. Backend live
curl -i https://<render>.onrender.com/api/health
# -> 200 { success: true, db: "connected" }

# 2. Submit a testimonial
curl -X POST https://<render>.onrender.com/api/v1/testimonials \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smoke Test",
    "email": "smoke@test.com",
    "company": "Demo Inc.",
    "message": "This is a smoke-test testimonial message at least 10 chars.",
    "rating": 5
  }'
# -> 201 { success: true, data: { testimonial: { _id, status: "pending" } } }

# 3. Open Vercel app:
#    - /dashboard shows the new pending card with AI results in ~8 s.
#    - Approve it.
#    - /wall now renders it.
#    - /widget generates a working iframe.
```

---

## Design Decisions

| Decision                                                                 | Why                                                                                                                                                                                                  |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo with two apps, no shared package.**                           | Assignment only has one shared concern (types + Zod) which is duplicated trivially. No `pnpm workspaces` / Turbo keeps setup simple for evaluators.                                                 |
| **MongoDB Atlas via Mongoose.**                                          | Document store aligns with testimonial payload shape (rating, message, AI enrichment). Atlas = zero-ops managed replica-set with free tier.                                                          |
| **Express, not Fastify / NestJS.**                                       | Minimal, dependency-light, closest to the evaluator's expectation. Per AGENTS.md no other frameworks allowed.                                                                                       |
| **Zod on both sides, same validation.**                                  | Single schema source for FE form error + BE rejection — parity.                                                                                                                                      |
| **Fire-and-forget AI with `setImmediate`.**                              | Guarantees < 100 ms submission latency; AI flakiness never blocks UX.                                                                                                                                |
| **`<iframe>` widget (not React JS SDK).**                                | CSP-safe, no cross-origin script, host-platform-agnostic (Shopify/Webflow/Carrd).                                                                                                                 |
| **`<MainLayout>` wraps routes except `/embed`.**                         | `/embed` must render cleanly inside iframes — no nav/footer.                                                                                                                                         |
| **React Query polling instead of WS.**                                   | Poll is bounded (4 s while unknown-only) and scales on Vercel/Render for an assignment; WS adds infra complexity without a realtime product need.                                                 |
| **Linear/Vercel UI tokens.**                                             | Single source of truth for elevation/shadows/radius — evaluators compare directly against Linear/Vercel polished look.                                                                               |

---

## Future Improvements

If this were to become a real product:

- 🔐 **Auth** — admin-only Moderation Dashboard (email/password, JWT refresh tokens, rate-limited login).
- 📤 **Photo uploads** — use the wired Cloudinary SDK, add Multer route, image moderation with a NSFW API.
- 🧪 **Dedicated test suites.** Unit services with mocked Mongoose + Vitest. RTL component tests for common primitives. Playwright E2E for the 6 critical flows.
- 📊 **Analytics** — impression counts per widget host domain, click-through to the submit page, conversion funnel.
- 🔎 **Search & Filters** on the dashboard — by company, rating, sentiment label, date range.
- 💾 **Bulk actions**: Approve all, CSV export.
- ⚡️ **Background AI queue** — replace `setImmediate` with a real queue (BullMQ on Redis) + retries with backoff.
- 🎨 **More widget templates**: single testimonial carousel, star-rating badge, newsletter-signup capture.
- 🌐 **i18n** — Spanish, French, German locales on FE widget (query param `?lang=es`).
- 🛡️ **Bot protection** — Turnstile / hCaptcha on the submission form.

---

<div align="center">

**Made with React · Vite · Express · MongoDB Atlas · Google Gemini · Tailwind.**
Assignment submission — not affiliated with any of the referenced companies.

</div>
