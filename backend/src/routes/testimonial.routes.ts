import { Router, Request, Response } from "express";
import validateRequest from "../middleware/validateRequest";
import {
  createTestimonialSchema,
  testimonialIdParamSchema,
} from "../validations/testimonial.validation";
import {
  createTestimonial,
  getAllTestimonials,
  getApprovedTestimonials,
  approveTestimonial,
  rejectTestimonial,
  refreshAiAnalysis,
} from "../controllers/testimonial.controller";

const router = Router();

const methodNotAllowed = (allowed: string[]) => (_req: Request, res: Response) => {
  res.set("Allow", allowed.join(", "));
  res.status(405).json({
    success: false,
    message: `Method Not Allowed. Use one of: ${allowed.join(", ")}.`,
  });
};

router
  .route("/")
  .post(validateRequest(createTestimonialSchema), createTestimonial)
  .get(getAllTestimonials)
  .all(methodNotAllowed(["POST", "GET"]));

router
  .route("/public")
  .get(getApprovedTestimonials)
  .all(methodNotAllowed(["GET"]));

router
  .route("/:id/approve")
  .patch(validateRequest(testimonialIdParamSchema), approveTestimonial)
  .all(methodNotAllowed(["PATCH"]));

router
  .route("/:id/reject")
  .patch(validateRequest(testimonialIdParamSchema), rejectTestimonial)
  .all(methodNotAllowed(["PATCH"]));

router
  .route("/:id/refresh-ai")
  .patch(validateRequest(testimonialIdParamSchema), refreshAiAnalysis)
  .all(methodNotAllowed(["PATCH"]));

export default router;
