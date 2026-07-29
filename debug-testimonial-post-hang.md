# Debug Session: testimonial-post-hang

**Session ID:** testimonial-post-hang
**Status:** [OPEN]
**Date:** 2026-07-28
**Bug Reported:**
> Submitting a testimonial from frontend POST http://localhost:5000/api/v1/testimonials fails. Chrome DevTools shows "Provisional headers are shown"; request never completes. Frontend :5173, Backend :5000.

---

## Step 1 – 5: Hypotheses & Evidence

### Hypotheses (Falsifiable)
| # | Hypothesis |
|---|---|
| H1 | Backend `process.exit(1)` on startup because MONGO_URI contains `<username>` placeholder → server never starts listening on :5000. |
| H2 | Backend starts, but Mongoose hangs (Atlas Network Access not whitelisted) → `Testimonial.create()` never resolves. |
| H3 | CORS preflight (OPTIONS) stall/misconfiguration → Browser blocks POST. |
| H4 | Zod schema mismatch for `photo` empty string → validation hang/crash. |
| H5 | `configureCloudinary()` throws and crashes process before `app.listen`. |

---

## Evidence Log

| Timestamp | Observation | Supports / Rejects |
|---|---|---|
| TBD | TBD | TBD |

---

## Instrumentation Plan
(Non-logic changes only. Minimal.)
- Backend: wrap `connectDB` + `app.listen` + `configureCloudinary` with try/catch and structured log markers.
- Backend: add `req` entry/exit + Zod errors to `createTestimonial` route chain.
- Frontend: log axios baseURL, payload, before/after mutation call.

## Root Cause Determined
*(TBD)*

## Fix Applied
*(TBD)*

## Post-Fix Verification
*(TBD)*
