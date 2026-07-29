import { Schema, model, Document, Types } from "mongoose";

export type TestimonialStatus = "pending" | "approved" | "rejected";
export type SentimentLabel = "positive" | "neutral" | "negative" | "unknown";

export interface ITestimonial extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  company: string;
  message: string;
  rating: number;
  photo?: string;
  status: TestimonialStatus;
  sentiment: SentimentLabel;
  confidence: number | null;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      maxlength: [150, "Company cannot exceed 150 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    photo: {
      type: String,
      trim: true,
      default: undefined,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be one of: pending, approved, rejected",
      },
      default: "pending",
    },
    sentiment: {
      type: String,
      enum: {
        values: ["positive", "neutral", "negative", "unknown"],
        message: "Sentiment must be one of: positive, neutral, negative, unknown",
      },
      default: "unknown",
    },
    confidence: {
      type: Number,
      min: [0, "Confidence must be between 0 and 100"],
      max: [100, "Confidence must be between 0 and 100"],
      default: null,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [200, "Summary cannot exceed 200 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

TestimonialSchema.index({ status: 1 });
TestimonialSchema.index({ sentiment: 1 });
TestimonialSchema.index({ email: 1 });
TestimonialSchema.index({ createdAt: -1 });

const Testimonial = model<ITestimonial>("Testimonial", TestimonialSchema);

export default Testimonial;
