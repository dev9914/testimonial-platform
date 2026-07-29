# AGENTS.md — AI Agent Instructions for Testimonial Platform

Follow these rules when contributing code, reviews, or scaffolding to this project.

---

## 1. Project Overview

Testimonial Platform is a full-stack monorepo with two first-class apps:
- `frontend/` — React + Vite + TypeScript + Tailwind CSS SPA (runs on `:5173`)
- `backend/` — Node.js + Express + TypeScript + MongoDB/Mongoose + Cloudinary REST API (runs on `:5000`)

All source lives under `frontend/src/` and `backend/src/` respectively. Shared configuration (linting, formatting, TypeScript bases) may live at the repo root, but source code never does.

---

## 2. Tech Stack Rules

**Do not introduce additional frameworks or major libraries without an explicit decision in JOURNAL.md.**

### Allowed — Frontend
- React 18 (function components + hooks only, no class components)
- Vite as the build tool / dev server
- TypeScript
- Tailwind CSS (utility classes only, no raw CSS/SASS modules)
- React Query (@tanstack/react-query) for server state
- axios for HTTP
- react-hook-form + Zod for forms
- react-router-dom for routing
- Zustand or Context for client-only global state (pick one and stay consistent)

### Allowed — Backend
- Node.js (LTS)
- Express
- TypeScript
- MongoDB via Mongoose
- Cloudinary SDK for media
- Zod for validation
- jsonwebtoken for auth
- bcrypt for hashing
- cors, helmet, morgan, express-rate-limit as needed

### Forbidden without an explicit decision
- Next.js, Remix, SvelteKit, or any SSR/meta-framework on the frontend
- PostgreSQL, Prisma, or any ORM other than Mongoose on the backend
- Any CSS framework besides Tailwind (Bootstrap, Ant Design, MUI, etc.)
- Global state libraries other than Zustand / Context (no Redux unless approved)

---

## 3. Backend Architecture Rules

Follow a layered MVC-like architecture with an explicit **services** layer.

### Call chain (mandatory)
```
routes -> controllers -> services -> models
```

- **routes/** — Define endpoints and attach middleware. No logic. Every route must have a single controller handler.
- **controllers/** — Parse request (params/body/query), validate, call service(s), shape the JSON response. No direct Mongoose queries.
- **services/** — Pure business logic. Accept plain inputs, return plain outputs. Call models and other services. Must never import `express` types or touch `req`/`res`.
- **models/** — Mongoose schemas, statics, methods. Indexes and schema-level validation live here.

### Cross-cutting rules
- **Zod validation** — Validate every incoming body/params/query with Zod schemas in `backend/src/validation/`. Use a middleware to run validation so controllers stay clean.
- **Global error handling** — One error-handling middleware registered last in the Express app. All thrown errors route through it.
- **asyncHandler wrapper** — Wrap every route controller in an `asyncHandler(fn)` utility so rejected promises automatically forward to the error middleware. Never add `try/catch` inside controllers just to call `next(err)`.
- **ApiError class** — Define a custom `ApiError` class (in `utils/`) with `statusCode`, `message`, and optional `errors[]`. Throw `ApiError` from controllers/services. Use standard HTTP status codes.
- **No business logic in controllers** — If a controller exceeds ~15 lines, extract logic into a service.

---

## 4. Frontend Architecture Rules

### Feature-based organization
- Group code by **feature** under `src/components/features/<feature-name>/` when a feature spans multiple related components.
- Shared UI primitives go in `src/components/common/`.
- Pages live in `src/pages/` and compose features + layout.

### State & data
- **Server state = React Query only.** No `useEffect` chains for fetching. All API calls go through a query or mutation hook.
- **Client state = local hooks (useState/useReducer) first**, Zustand or Context only for genuinely cross-cutting state (auth session, theme).
- **API service layer:** `src/services/api.ts` (or split per domain) exports typed functions that use axios. React Query hooks call these, never inline `fetch`/`axios`.

### Forms
- Use `react-hook-form` with a Zod resolver for every form.
- Validation schemas live in `src/validation/` next to the feature they validate.

### Styling
- **Tailwind CSS exclusively.** No `<style>` blocks, no CSS imports besides `index.css` + Tailwind directives, no CSS modules, no inline style objects beyond dynamic values.
- Extract repeated class combinations into a small helper when used more than twice, but do not introduce a component library abstraction prematurely.

---

## 5. Git & Workflow Rules

- Branch names: `feat/<name>`, `fix/<name>`, `chore/<name>`, `docs/<name>` (kebab-case).
- Commit messages: `type(scope): message` — e.g. `feat(auth): add login endpoint`, `fix(testimonials): handle missing user id`. Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`.
- Every non-trivial change worth remembering must have a corresponding **JOURNAL.md** entry added in the same PR.
- Never commit `.env`, node_modules, build artifacts, or secrets. `.gitignore` at repo root plus per-app `.gitignore`s.
- Never commit a file containing real API keys, tokens, or production credentials. If you add a new env var, document it in README.md immediately.

---

## 6. Testing Strategy Placeholders

Backend
- Unit tests for services (Jest or Vitest — pick once, stick with it). Mock Mongoose models, do not hit a real DB.
- Integration tests for routes (supertest) against an in-memory or dedicated test DB.
- Auth middleware and validation middleware each get dedicated tests.

Frontend
- Component tests for common/shared components (React Testing Library).
- Hook tests for custom hooks and React Query hooks (msw for API mocking).
- E2E tests (Playwright or Cypress) for the critical paths: signup/login, create testimonial, embed preview.

When you implement testing, update this section with the exact tooling chosen and add a new JOURNAL.md decision.

---

## 7. Style & Conventions

### TypeScript
- **Strict mode enabled.** `strict: true` in `tsconfig.json`.
- No `any`. If truly needed, use `unknown` with a type guard or a well-commented `@ts-expect-error`.
- Prefer `type` for unions, `interface` for object shapes that may be extended.
- All exported functions, components, and public services have explicit parameter and return types — no inference leaks across module boundaries.

### Naming
- **Files and folders:** kebab-case (`testimonial-card.tsx`, `auth-service.ts`, `user-model.ts`).
- **React components + component files:** PascalCase (`TestimonialCard.tsx` exports `TestimonialCard`).
- **Functions, variables, props, keys:** camelCase.
- **Constants / enums:** UPPER_SNAKE_CASE for true constants; otherwise camelCase.
- **Types / interfaces:** PascalCase, optionally prefixed with `I` if it reduces ambiguity (e.g. `ITestimonial`).

### Formatting
- Semicolons everywhere.
- Single quotes for strings (JS/TS). Template literals for interpolation.
- Trailing commas in multi-line objects/arrays.
- 2-space indentation.
- Match the style of existing code you are editing — consistency with the file beats these rules when they conflict.
