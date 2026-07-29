export type SentimentLabel = "positive" | "neutral" | "negative" | "unknown";

export interface AiAnalysisResult {
  sentiment: SentimentLabel;
  confidence: number | null;
  summary: string | null;
}

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message?: string };
}

const GEMINI_MODEL = "gemini-flash-latest";
const TIMEOUT_MS = 25_000;
const MAX_MESSAGE_LEN = 1500;
const MAX_GEMINI_ATTEMPTS = 2;

const IS_DEV = process.env.NODE_ENV !== "production";
const debugWarn = (...args: unknown[]): void => {
  if (IS_DEV) console.warn(...args);
};
const debugError = (...args: unknown[]): void => {
  if (IS_DEV) console.error(...args);
};

if (IS_DEV) {
  //#region debug-point ai-analysis-stuck 00-gemini-key-probe
  const _GEMINI_KEY_LOADED: boolean = Boolean(
    typeof process !== "undefined" && process.env && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0
  );
  debugWarn(
    `[ai-debug-00] GEMINI_API_KEY loaded from env? ${_GEMINI_KEY_LOADED ? "YES" : "NO"} ` +
      `(key.length=${process.env.GEMINI_API_KEY?.trim().length ?? 0})`
  );
  //#endregion
}

const SYSTEM_PROMPT = `You are a testimonial content analyst. Analyze ONLY the testimonial message provided.

Return STRICTLY valid JSON with EXACTLY these three keys and no other text, markdown, commentary or code fences:

{
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": <integer between 0 and 100 inclusive>,
  "summary": "<one sentence max 140 chars>"
}

Rules:
- sentiment: pick one of "positive", "neutral", or "negative" based on the writer's tone.
- confidence: integer 0-100. Higher if the message is unambiguous.
- summary: one short single sentence describing the key signal. Max 140 characters.
- DO NOT include the writer's name, company, or any PII in summary.
- If the message is empty or unintelligible, sentiment="neutral", confidence=20, summary="Message lacks clear content."
`;

const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`AI request timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });

const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

const stripCodeFences = (text: string): string => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) return fenced[1].trim();
  const objStart = trimmed.indexOf("{");
  const objEnd = trimmed.lastIndexOf("}");
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    return trimmed.slice(objStart, objEnd + 1);
  }
  return trimmed;
};

const normaliseResult = (raw: unknown): AiAnalysisResult => {
  if (!raw || typeof raw !== "object") {
    return { sentiment: "unknown", confidence: null, summary: null };
  }

  const o = raw as Record<string, unknown>;

  const sentVal = typeof o.sentiment === "string" ? o.sentiment.toLowerCase() : "";
  const sentiment: SentimentLabel =
    sentVal === "positive" || sentVal === "neutral" || sentVal === "negative"
      ? sentVal
      : "unknown";

  let confidence: number | null = null;
  if (typeof o.confidence === "number" && Number.isFinite(o.confidence)) {
    confidence = Math.round(clamp(o.confidence, 0, 100));
  } else if (typeof o.confidence === "string") {
    const p = parseFloat(o.confidence);
    if (!Number.isNaN(p)) confidence = Math.round(clamp(p, 0, 100));
  }

  let summary: string | null = null;
  if (typeof o.summary === "string" && o.summary.trim().length > 0) {
    summary = o.summary.trim().slice(0, 200);
  }

  if (sentiment === "unknown") {
    return { sentiment: "unknown", confidence: null, summary: null };
  }

  return { sentiment, confidence, summary };
};

const callGemini = async (message: string): Promise<AiAnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const trimmedMessage = message.slice(0, MAX_MESSAGE_LEN);

  const body = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            text: `TESTIMONIAL MESSAGE:\n${trimmedMessage}\n\nJSON:`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      topK: 20,
      maxOutputTokens: 1024,
    },
  };

  //#region debug-point ai-analysis-stuck 02-send-request
  const maskedKey = apiKey.length > 8 ? apiKey.slice(0, 4) + "..." + apiKey.slice(-4) : "****";
  let resBodyPreview = "";
  let data: GeminiResponse | null = null;
  let finalStatus = 0;
  let finalStatusText = "";
  let candidate: GeminiCandidate | undefined;

  for (let attempt = 0; attempt < MAX_GEMINI_ATTEMPTS; attempt++) {
    debugWarn(
      `[ai-debug-02] Sending request to Gemini (attempt=${attempt + 1}/${MAX_GEMINI_ATTEMPTS}) — endpoint=${url.split("?")[0]}?key=${maskedKey} model=${GEMINI_MODEL} messageLen=${trimmedMessage.length}`
    );
    if (attempt === 0) {
      debugWarn(`[ai-debug-02-exact] ${String("Sending request to Gemini")}`);
    }
    //#endregion

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-client": "trae-testimonial-platform-p2",
      },
      body: JSON.stringify(body),
    });

    //#region debug-point ai-analysis-stuck 03-response
    resBodyPreview = await res.clone().text();
    finalStatus = res.status;
    finalStatusText = res.statusText;
    debugWarn(
      `[ai-debug-03] Gemini response received (attempt=${attempt + 1}) — HTTP_STATUS=${finalStatus} HTTP_OK=${res.ok} BODY_LEN=${resBodyPreview.length} finishReason?=pending`
    );
    if (attempt === 0) {
      debugWarn(`[ai-debug-03-exact] ${String("Gemini response received")}`);
    }
    //#endregion

    if (finalStatus === 429 && attempt < MAX_GEMINI_ATTEMPTS - 1) {
      let waitMs = 5000;
      try {
        const parsed429 = JSON.parse(resBodyPreview || "{}");
        const retrySeconds = parsed429?.error?.details?.find?.(
          (d: { "@type"?: string; retryDelay?: string }) =>
            d?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
        )?.retryDelay;
        if (retrySeconds) {
          const n = Number(String(retrySeconds).replace("s", ""));
          if (!Number.isNaN(n) && n > 0 && n < 30) waitMs = Math.round(n * 1000) + 250;
        }
      } catch { /* ignore */ }
      debugWarn(
        `[ai-debug-03b-429-retry] ℹ️ HTTP 429, sleeping ${waitMs}ms then retrying once.`
      );
      await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    if (!res.ok) {
      const detail = resBodyPreview;
      //#region debug-point ai-analysis-stuck 03b-error
      debugError(
        `[ai-debug-03b] ❌ Gemini returned HTTP error — STATUS=${finalStatus} STATUS_TEXT=${finalStatusText}`
      );
      debugError(`[ai-debug-03b] ❌ RESPONSE_BODY (full 1st 4000 chars):\n${detail.slice(0, 4000)}`);
      debugError(
        `[ai-debug-03b] ❌ Exact reason: HTTP ${finalStatus} from Google Generative Language API; see full body above.`
      );
      //#endregion
      try {
        const parsedErr = JSON.parse(detail || "{}");
        const m = parsedErr?.error?.message || "";
        const code = parsedErr?.error?.code || finalStatus;
        const status = parsedErr?.error?.status || "";
        if (String(code) === "404" || /(model not found|not found|invalid model)/i.test(m + " " + status)) {
          debugError(
            `[ai-debug-03b] ❌ Likely root cause: Model name "${GEMINI_MODEL}" does not exist under the API version used. Try model name "gemini-2.0-flash" or "gemini-1.5-flash" or stable "v1" API version.`
          );
        } else if (String(code) === "400" || /(api key|invalid key|permission|api key not valid|bad request)/i.test(m + " " + status)) {
          debugError(
            `[ai-debug-03b] ❌ Likely root cause: GEMINI_API_KEY is invalid / wrong project / not enabled API / wrong format (should be Google AI Studio aistudio.google.com/apikey). message=${m.slice(0,300)}`
          );
        } else if (String(code) === "403" || String(code) === "429" || /(quota|forbidden|billing|rate limit|resource exhausted)/i.test(m + " " + status)) {
          debugError(
            `[ai-debug-03b] ❌ Likely root cause: Quota exhausted or billing required / permissions 403 or rate-limit 429. message=${m.slice(0,300)}`
          );
        }
      } catch { /* body is not JSON */ }
      throw new Error(`Gemini HTTP ${finalStatus}: ${detail.slice(0, 500)}`);
    }

    data = (await res.json()) as GeminiResponse;
    break;
  }

  if (!data) {
    throw new Error(`Gemini request failed after ${MAX_GEMINI_ATTEMPTS} attempts`);
  }

  if (data.error?.message) {
    throw new Error(`Gemini API error: ${data.error.message}`);
  }

  candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error("Gemini returned no candidates");
  }

  if (
    candidate.finishReason &&
    candidate.finishReason !== "STOP" &&
    candidate.finishReason !== "MAX_TOKENS"
  ) {
    throw new Error(`Gemini unsafe finish reason: ${candidate.finishReason}`);
  }

  const text = candidate.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned empty content");
  }

  const cleaned = stripCodeFences(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
    //#region debug-point ai-analysis-stuck 04-parsed-json
    const s = typeof parsed === "object" && parsed ? (parsed as Record<string, unknown>).sentiment : null;
    const c = typeof parsed === "object" && parsed ? (parsed as Record<string, unknown>).confidence : null;
    const sum = typeof parsed === "object" && parsed ? String((parsed as Record<string, unknown>).summary ?? "").length : 0;
    debugWarn(
      `[ai-debug-04] Parsed JSON — sentiment=${s} confidence=${c} summaryLen=${sum}`
    );
    debugWarn(`[ai-debug-04-exact] ${String("Parsed JSON")}`);
    //#endregion
  } catch (e) {
    //#region debug-point ai-analysis-stuck 04b-parse-fail
    debugError(
      `[ai-debug-04b] ❌ JSON.parse FAILED — cleaned_text_len=${cleaned.length} cleaned_text (first 600 chars):\n${cleaned.slice(0, 600)}`
    );
    debugError(`[ai-debug-04b] ❌ Parse error: ${e instanceof Error ? e.message : String(e)}`);
    debugError(
      `[ai-debug-04b] ❌ Original Gemini raw text_len=${text.length} raw text (first 600 chars):\n${text.slice(0, 600)}`
    );
    //#endregion
    throw new Error("Gemini response failed JSON parse");
  }

  return normaliseResult(parsed);
};

const aiService = {
  analyzeMessage: async (message: string): Promise<AiAnalysisResult> => {
    try {
      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return { sentiment: "unknown", confidence: null, summary: null };
      }

      const result = await timeout(callGemini(message), TIMEOUT_MS);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      debugWarn(`[ai.service] analyzeMessage failed: ${msg}`);
      return { sentiment: "unknown", confidence: null, summary: null };
    }
  },
};

export default aiService;
