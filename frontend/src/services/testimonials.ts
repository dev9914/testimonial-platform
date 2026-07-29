import api from './api'
import type {
  CreateTestimonialPayload,
  ITestimonial,
  ApiResponse,
} from '../types'

export const createTestimonial = (payload: CreateTestimonialPayload) =>
  api
    .post<ApiResponse<{ testimonial: ITestimonial }>>('/testimonials', payload)
    .then((r) => r.data)

export const getAllTestimonials = () =>
  api
    .get<ApiResponse<{ testimonials: ITestimonial[] }>>('/testimonials')
    .then((r) => r.data)

export const getApprovedTestimonials = () =>
  api
    .get<ApiResponse<{ testimonials: ITestimonial[] }>>('/testimonials/public')
    .then((r) => r.data)

export const approveTestimonial = (id: string) =>
  api
    .patch<ApiResponse<{ testimonial: ITestimonial }>>(
      `/testimonials/${id}/approve`
    )
    .then((r) => r.data)

export const rejectTestimonial = (id: string) =>
  api
    .patch<ApiResponse<{ testimonial: ITestimonial }>>(
      `/testimonials/${id}/reject`
    )
    .then((r) => r.data)

export const refreshTestimonialAi = (id: string) =>
  api
    .patch<ApiResponse<{ testimonial: ITestimonial }>>(
      `/testimonials/${id}/refresh-ai`
    )
    .then((r) => r.data)
