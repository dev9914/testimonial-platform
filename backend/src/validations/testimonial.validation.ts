import { z } from "zod";

const createTestimonialBody = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
  company: z
    .string()
    .trim()
    .min(2, "Company must be at least 2 characters")
    .max(150, "Company must not exceed 150 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must not exceed 2000 characters"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not exceed 5")
    .or(z.string().regex(/^\d+$/).transform(Number)),
  photo: z
    .string()
    .trim()
    .url("Photo must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

const testimonialIdParam = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid testimonial ID format"),
});

export const createTestimonialSchema = z.object({
  body: createTestimonialBody,
});

export const testimonialIdParamSchema = z.object({
  params: testimonialIdParam,
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialBody>;
export type TestimonialIdParam = z.infer<typeof testimonialIdParam>;
