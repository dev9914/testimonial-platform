import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getApprovedTestimonials } from '../services/testimonials'
import TestimonialCard from '../components/common/TestimonialCard'
import { Button } from '../components/Button'
import type { ITestimonial } from '../types'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_0_0_1px_rgba(15,23,42,0.02)] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 rounded-full shimmer bg-slate-200/70" />
        <div className="flex-1 space-y-1.5 pt-0.5">
          <div className="h-4 rounded-md shimmer bg-slate-200/70 w-1/2" />
          <div className="h-3 rounded-md shimmer bg-slate-200/70 w-1/3" />
          <div className="h-3 rounded-md shimmer bg-slate-200/70 w-24 mt-1.5" />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-3.5 rounded-md shimmer bg-slate-200/60" />
        <div className="h-3.5 rounded-md shimmer bg-slate-200/60" />
        <div className="h-3.5 rounded-md shimmer bg-slate-200/60 w-5/6" />
      </div>
      <div className="h-3 rounded-md shimmer bg-slate-200/50 w-1/4 mt-auto" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-16 px-6 bg-white rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.06),0_12px_32px_-14px_rgba(15,23,42,0.12)] border border-slate-200/80 max-w-xl mx-auto">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mb-5 ring-1 ring-inset ring-slate-200/70">
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight mb-2">
        No testimonials yet
      </h3>
      <p className="text-[14px] sm:text-[15px] text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
        Be the first to share your experience and help others discover great products.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          Submit a Testimonial
        </Button>
      </Link>
    </div>
  )
}

export default function PublicWallPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['testimonials', 'public'],
    queryFn: getApprovedTestimonials,
  })

  const testimonials = data?.data?.testimonials || []

  return (
    <div className="pt-2 pb-14 sm:pb-20">
      <div className="text-center mb-10 sm:mb-12 lg:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-slate-600 text-[11.5px] font-semibold tracking-wide uppercase ring-1 ring-inset ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
          Social Proof
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[56px] font-bold tracking-tight leading-[1.08] mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent px-1">
          Loved by teams worldwide
        </h1>
        <p className="text-[15px] sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Hear what our customers have to say about their experience.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">Failed to load testimonials.</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : testimonials.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t: ITestimonial) => (
              <TestimonialCard
                key={t._id}
                testimonial={t}
                borderRadius={16}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
