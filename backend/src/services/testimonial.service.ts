import { Types } from "mongoose";
import Testimonial, { ITestimonial, TestimonialStatus } from "../models/Testimonial";
import { ApiError } from "../utils/ApiError";
import { CreateTestimonialInput } from "../validations/testimonial.validation";
import aiService, { AiAnalysisResult } from "./ai.service";

const IS_DEV = process.env.NODE_ENV !== "production";
const debugWarn = (...args: unknown[]): void => {
  if (IS_DEV) console.warn(...args);
};
const debugError = (...args: unknown[]): void => {
  if (IS_DEV) console.error(...args);
};

export interface CreateTestimonialData extends CreateTestimonialInput {}

const persistAiAnalysis = async (
  id: Types.ObjectId | string,
  message: string
): Promise<void> => {
  let analysis: AiAnalysisResult;
  try {
    analysis = await aiService.analyzeMessage(message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[testimonial.service] aiService.analyzeMessage failed for ${id}: ${msg}`
    );
    analysis = { sentiment: "unknown", confidence: null, summary: null };
  }

  try {
    //#region debug-point ai-analysis-stuck 05-updating-mongodb
    console.warn(
      `[ai-debug-05] Updating MongoDB id=${String(id)} patch={ sentiment:${analysis.sentiment}, confidence:${analysis.confidence}, summaryLen:${String(analysis.summary ?? "").length} }`
    );
    console.warn(`[ai-debug-05-exact] ${String("Updating MongoDB")}`);
    //#endregion
    const result = await Testimonial.findByIdAndUpdate(
      id,
      {
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        summary: analysis.summary,
      },
      { runValidators: true, timestamps: true, rawResult: true, new: true, returnOriginal: false }
    );
    //#region debug-point ai-analysis-stuck 05ok
    const ok = (result as unknown as { ok?: number; value?: unknown })?.ok ?? 1;
    const leo = (result as unknown as { lastErrorObject?: { updatedExisting?: boolean; n?: number } })?.lastErrorObject;
    const modified = leo?.n ?? 0;
    const raw = (result as unknown as { value?: unknown })?.value as
      | { sentiment?: unknown; confidence?: unknown; summary?: unknown }
      | undefined;
    console.warn(
      `[ai-debug-05-ok] MongoDB updated successfully id=${String(id)} mongo_ok=${ok} documentsAffected=${modified} leo.updatedExisting=${leo?.updatedExisting} value.sentiment=${raw?.sentiment} value.confidence=${raw?.confidence} value.summaryLen=${String(raw?.summary ?? "").length}`
    );
    console.warn(`[ai-debug-05-ok-exact] ${String("MongoDB updated successfully")}`);
    //#endregion
    try {
      const readBack = await Testimonial.findById(id).select("sentiment confidence summary").lean();
      console.warn(
        `[ai-debug-05-readback] 🔍 READBACK ${String(id)} → sentiment=${readBack?.sentiment} confidence=${readBack?.confidence} summaryLen=${String(readBack?.summary ?? "").length}`
      );
    } catch (rbErr) {
      const rbmsg = rbErr instanceof Error ? rbErr.message : String(rbErr);
      console.warn(`[ai-debug-05-readback] 🔍 READBACK FAILED id=${String(id)} err=${rbmsg}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    //#region debug-point ai-analysis-stuck 05err-mongo-fail
    debugError(
      `[ai-debug-05-err] ❌ MongoDB update FAILED id=${String(id)} error=${msg}`
    );
    debugError(
      `[ai-debug-05-err] ❌ Sent patch: sentiment=${analysis.sentiment} confidence=${analysis.confidence} summary[first 200]=${String(analysis.summary ?? "").slice(0, 200)}`
    );
    //#endregion
    console.warn(`[testimonial.service] persistAiAnalysis storage write failed for ${id}: ${msg}`);
    try {
      await Testimonial.findByIdAndUpdate(
        id,
        { sentiment: "unknown", confidence: null, summary: null },
        { runValidators: true, timestamps: false }
      );
    } catch (rollbackErr) {
      const rmsg = rollbackErr instanceof Error ? rollbackErr.message : String(rollbackErr);
      debugError(
        `[testimonial.service] persistAiAnalysis rollback failed for ${id}: ${rmsg}`
      );
    }
  }
};

const testimonialService = {
  createTestimonial: async (
    data: CreateTestimonialData
  ): Promise<ITestimonial> => {
    const testimonial = await Testimonial.create({
      name: data.name,
      email: data.email,
      company: data.company,
      message: data.message,
      rating: data.rating,
      photo: data.photo,
      status: "pending",
      sentiment: "unknown",
      confidence: null,
      summary: null,
    });

    setImmediate(() => {
      //#region debug-point ai-analysis-stuck 01-started
      console.warn(`[ai-debug-01] AI analysis started for testimonialId=${String(testimonial._id)} messageLen=${testimonial.message.length}`);
      console.warn(`[ai-debug-01-exact] ${String("AI analysis started")}`);
      //#endregion
      void persistAiAnalysis(testimonial._id, testimonial.message);
    });

    return testimonial;
  },

  getAllTestimonials: async (): Promise<ITestimonial[]> => {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .select("-email")
      .lean();

    return testimonials as ITestimonial[];
  },

  getApprovedTestimonials: async (): Promise<ITestimonial[]> => {
    const testimonials = await Testimonial.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .select("-email")
      .lean();

    return testimonials as ITestimonial[];
  },

  updateStatus: async (
    id: string,
    status: TestimonialStatus
  ): Promise<ITestimonial> => {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid testimonial ID format");
    }

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      throw new ApiError(404, "Testimonial not found");
    }

    if (testimonial.status === status) {
      return testimonial;
    }

    testimonial.status = status;
    const updated = await testimonial.save();

    return updated;
  },

  approveTestimonial: async (id: string): Promise<ITestimonial> => {
    return testimonialService.updateStatus(id, "approved");
  },

  rejectTestimonial: async (id: string): Promise<ITestimonial> => {
    return testimonialService.updateStatus(id, "rejected");
  },

  refreshAiAnalysis: async (id: string): Promise<ITestimonial> => {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid testimonial ID format");
    }

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      throw new ApiError(404, "Testimonial not found");
    }

    testimonial.sentiment = "unknown";
    testimonial.confidence = null;
    testimonial.summary = null;
    const reset = await testimonial.save();

    setImmediate(() => {
      debugWarn(`[ai-refresh] Manual AI re-analysis started for testimonialId=${String(id)} messageLen=${testimonial.message.length}`);
      void persistAiAnalysis(id, testimonial.message);
    });

    return reset as ITestimonial;
  },
};

export default testimonialService;
