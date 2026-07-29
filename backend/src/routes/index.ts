import { Router } from "express";
import testimonialRoutes from "./testimonial.routes";

const router = Router();

router.use("/testimonials", testimonialRoutes);

export default router;
