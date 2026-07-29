import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import testimonialService from "../services/testimonial.service";

const sanitizeTestimonial = <T>(doc: T): Omit<T, "email"> => {
  const d = doc as unknown as Record<string, unknown>;
  const obj =
    d && typeof d === "object" && typeof d.toObject === "function"
      ? (d.toObject as () => Record<string, unknown>)()
      : d;
  const { email: _email, ...rest } = obj;
  return rest as Omit<T, "email">;
};

export const createTestimonial = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const testimonial = await testimonialService.createTestimonial(req.body);

    res.status(201).json({
      success: true,
      message: "Testimonial submitted successfully and is awaiting moderation",
      data: {
        testimonial: sanitizeTestimonial(testimonial),
      },
    });
  }
);

export const getAllTestimonials = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const testimonials = await testimonialService.getAllTestimonials();

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: {
        testimonials,
      },
    });
  }
);

export const getApprovedTestimonials = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const testimonials = await testimonialService.getApprovedTestimonials();

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: {
        testimonials,
      },
    });
  }
);

export const approveTestimonial = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const testimonial = await testimonialService.approveTestimonial(id);

    res.status(200).json({
      success: true,
      message: "Testimonial approved successfully",
      data: {
        testimonial: sanitizeTestimonial(testimonial),
      },
    });
  }
);

export const rejectTestimonial = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const testimonial = await testimonialService.rejectTestimonial(id);

    res.status(200).json({
      success: true,
      message: "Testimonial rejected successfully",
      data: {
        testimonial: sanitizeTestimonial(testimonial),
      },
    });
  }
);

export const refreshAiAnalysis = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const testimonial = await testimonialService.refreshAiAnalysis(id);

    res.status(200).json({
      success: true,
      message: "AI analysis scheduled; check back in a few seconds.",
      data: {
        testimonial: sanitizeTestimonial(testimonial),
      },
    });
  }
);
