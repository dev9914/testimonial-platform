export type TestimonialStatus = "pending" | "approved" | "rejected"
export type SentimentLabel = "positive" | "neutral" | "negative" | "unknown"

export interface ITestimonial {
  _id: string
  name: string
  email: string
  company: string
  message: string
  rating: number
  photo?: string
  status: TestimonialStatus
  sentiment: SentimentLabel
  confidence: number | null
  summary: string | null
  createdAt: string
  updatedAt: string
}

export type CreateTestimonialPayload = Omit<
  ITestimonial,
  '_id' | 'status' | 'createdAt' | 'updatedAt' | 'sentiment' | 'confidence' | 'summary'
> & {
  photo?: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  count?: number
  data?: T
}
