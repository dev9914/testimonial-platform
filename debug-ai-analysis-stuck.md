# [OPEN] Debug Session: AI Analysis Stuck (🤖 Analyzing forever)

**Session ID:** ai-analysis-stuck
**Date created:** 2026-07-29
**Environment:** Backend Node.js 22 + Express + Mongoose (Atlas) + Gemini REST, Frontend React 18 Vite :5173

## 1. Problem Statement (Actual vs Expected)
- **Expected:** After POST testimonial → setImmediate fires persistAiAnalysis → Gemini returns JSON → findByIdAndUpdate writes {sentiment, confidence, summary} → Dashboard (via React Query refetch/poll or manual refresh) shows 😊 Positive + 94% + Summary.
- **Actual:** Dashboard always shows 🤖 Analyzing / Waiting for AI analysis… for every record, even after GEMINI_API_KEY added to backend/.env and Atlas connected. User reports "AI analysis never completes."

## 2. Falsifiable Hypotheses
| # | Hypothesis | Likelihood | Falsification Metric |
|---|---|---|---|
| H1 | Gemini REST API spec mismatch (bad endpoint, model name, auth, or version path) | HIGH | Instrumented HTTP status != 2xx, response body contains `error.message` about model/key/permission |
| H2 | `setImmediate` does not invoke persistAiAnalysis after return, OR unhandled rejection swallows errors before logging | MEDIUM | Log point `"[debug] AI analysis started"` never appears after create |
| H3 | MongoDB findByIdAndUpdate({runValidators:true}) throws schema validation → silently rolls back to unknown | MEDIUM | `"[debug] Updating MongoDB"` fires but `"[debug] MongoDB updated successfully"` never appears, and `.catch` logs validation error |
| H4 | Gemini candidate content is non-text / markdown-wrapped / malformed JSON → analyzeMessage returns `unknown` without proper logging | LOW | `"Gemini response received"` appears but `"Parsed JSON"` missing, with parse error logged |

## 3. Instrumentation Plan (Order)
1. **Point-0 (env load probe):** In `backend/src/server.ts` OR `src/services/ai.service.ts` startup, log one line: `[debug-00] GEMINI_API_KEY loaded? <true/false>`. Value: boolean only, NEVER log the key string.
2. **Point-1 (invoke check):** In `testimonial.service.ts` createTestimonial just inside the `setImmediate(...) => {` callback, log `[debug-01] AI analysis started for testimonialId=${id}` (ID only).
3. **Point-2 (request):** In `callGemini()` right before `fetch()`, log `[debug-02] Sending request to Gemini` — include url masked (hide key after ?key= — show key prefix+suffix 4 chars only, not whole), model=name, payloadBytes=JSON.stringify(body).length.
4. **Point-3 (response):** Right after `res.ok` branch / error branch, log `[debug-03] Gemini response received — HTTP=${status} ok=${ok} bytes=${text.length}`. If NOT ok, ALSO log `[debug-03-err] HTTP body=${text.slice(0,1500)}`.
5. **Point-4 (parse):** After `JSON.parse(cleaned)` success, log `[debug-04] Parsed JSON` with schema: {sentiment, confidence, summaryLen}. If JSON.parse fails, log `[debug-04-err] parse failed: cleaned=${cleaned.slice(0,300)} err=${e.message}`.
6. **Point-5 (DB write):** Before `findByIdAndUpdate` call, log `[debug-05] Updating MongoDB id=${id}` with patch shape {sentiment, confidence, summaryLen}. After success, log `[debug-05-ok] MongoDB updated successfully id=${id} nModified=${result?.nModified ?? 'unknown'}`. If DB write throws, log `[debug-05-err] Mongo update failed: ${e.message}`.

All logs → report via Debug Server HTTP endpoint as per TRAE-debugger logging guide; and simultaneously to console.warn so visible in server terminal (since debug server setup adds complexity). Wrap ALL instrumentation lines inside `//#region debug-point ai-analysis-stuck <id>` / `//#endregion` markers.

## 4. Evidence Log
_(to be filled after running instrumented code)_

## 5. Confirmed / Rejected Summary
_(to be filled)_
