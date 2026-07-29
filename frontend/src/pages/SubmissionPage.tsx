import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import RatingStars from '../components/RatingStars'
import { Input } from '../components/Input'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { createTestimonial } from '../services/testimonials'
import { useToast } from '../context/ToastContext'
import type { CreateTestimonialPayload } from '../types'

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  company: z.string().trim().min(2, 'Company must be at least 2 characters').max(150, 'Company must be at most 150 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be at most 2000 characters'),
  rating: z.coerce.number().int('Rating must be an integer').min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  photo: z.string().trim().url('Please enter a valid URL').optional().or(z.literal('')),
})

interface FormData {
  name: string
  email: string
  company: string
  message: string
  rating: number
  photo?: string
}

export default function SubmissionPage() {
  const { pushToast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: '',
      email: '',
      company: '',
      message: '',
      rating: 5,
      photo: '',
    },
  })

  const ratingValue = watch('rating')

  const mutation = useMutation({
    mutationFn: (payload: CreateTestimonialPayload) => createTestimonial(payload),
    onSuccess: (response) => {
      pushToast('success', response.message || 'Testimonial submitted successfully!')
      reset()
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Failed to submit testimonial. Please try again.'
      pushToast('error', message)
    },
  })

  const isPending = isSubmitting || mutation.isPending

  const onSubmit = (data: FormData) => {
    const payload: CreateTestimonialPayload = {
      name: data.name,
      email: data.email,
      company: data.company,
      message: data.message,
      rating: data.rating,
      ...(data.photo ? { photo: data.photo } : {}),
    }
    mutation.mutate(payload)
  }

  return (
    <div className="py-6 sm:py-10">
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11.5px] font-semibold tracking-wide uppercase ring-1 ring-inset ring-emerald-600/20 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
          Share Your Feedback
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-slate-900 tracking-tight leading-[1.1] mb-3">
          Share your experience
        </h1>
        <p className="text-[15px] sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Help others discover great products by leaving a testimonial. Your feedback matters.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.06),0_12px_32px_-14px_rgba(15,23,42,0.14)] border border-slate-200/80 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="p-5 sm:p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                {...register('name')}
                id="name"
                label="Name"
                placeholder="John Doe"
                error={errors.name?.message}
                required
              />

              <Input
                {...register('email')}
                id="email"
                type="email"
                label="Email"
                placeholder="john@example.com"
                error={errors.email?.message}
                required
              />
            </div>

            <Input
              {...register('company')}
              id="company"
              label="Company"
              placeholder="Acme Inc."
              error={errors.company?.message}
              required
            />

            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5 tracking-tight">
                Rating <span className="text-rose-500">*</span>
              </label>
              <div className="py-1.5 px-1">
                <RatingStars
                  value={ratingValue}
                  interactive
                  onChange={(v) => setValue('rating', v, { shouldValidate: true })}
                  size="lg"
                />
              </div>
              {errors.rating && (
                <p className="text-[12px] text-rose-600 mt-1.5 font-medium">{errors.rating.message}</p>
              )}
            </div>

            <Textarea
              {...register('message')}
              id="message"
              label="Message"
              placeholder="Tell us about your experience..."
              error={errors.message?.message}
              required
              rows={5}
              showCounter
              maxLength={2000}
            />

            <Input
              {...register('photo')}
              id="photo"
              label="Photo URL"
              placeholder="https://example.com/your-photo.jpg"
              error={errors.photo?.message}
              helperText="Optional — your profile picture"
            />

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                variant="primary"
                loading={isPending}
                className="w-full"
              >
                {isPending ? 'Submitting...' : 'Submit Testimonial'}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-[11.5px] text-slate-400 mt-4">
          By submitting, you agree to have your testimonial reviewed and shared publicly.
        </p>
      </div>
    </div>
  )
}
