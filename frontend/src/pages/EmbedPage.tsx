import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import TestimonialCard from '../components/common/TestimonialCard'
import { getApprovedTestimonials } from '../services/testimonials'
import type { ITestimonial } from '../types'

function parseBoolParam(v: string | null, fallback: boolean): boolean {
  if (v === null) return fallback
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return fallback
}

function parseNumParam(v: string | null, fallback: number, min: number, max: number): number {
  if (v === null) return fallback
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.min(Math.max(n, min), max)
}

export default function EmbedPage() {
  const [searchParams] = useSearchParams()

  const theme = searchParams.get('theme') === 'dark' ? 'dark' : 'light'
  const showRating = parseBoolParam(searchParams.get('rating'), true)
  const showCompany = parseBoolParam(searchParams.get('company'), true)
  const borderRadius = parseNumParam(searchParams.get('borderRadius'), 12, 0, 48)

  const { data, isLoading, error } = useQuery({
    queryKey: ['testimonials', 'embed', 'public'],
    queryFn: getApprovedTestimonials,
  })

  const testimonials = useMemo<ITestimonial[]>(
    () => data?.data?.testimonials || [],
    [data]
  )

  const containerBg = theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
  const loadingColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  const emptyText = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  const errorText = theme === 'dark' ? 'text-rose-400' : 'text-rose-600'

  return (
    <div
      className={`min-h-screen w-full ${containerBg}`}
      style={{ margin: 0, padding: '16px' }}
    >
      <div className="max-w-full mx-auto">
        {error && (
          <div className="text-center py-8">
            <p className={`${errorText} font-medium text-sm`}>
              Failed to load testimonials.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <SkeletonRow theme={theme} />
            <SkeletonRow theme={theme} />
            <SkeletonRow theme={theme} />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <svg
                className={`w-8 h-8 ${emptyText}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className={`text-sm font-medium ${emptyText}`}>
              No testimonials yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-32px)] pr-1">
            {testimonials.map((t: ITestimonial) => (
              <TestimonialCard
                key={t._id}
                testimonial={t}
                theme={theme}
                showRating={showRating}
                showCompany={showCompany}
                borderRadius={borderRadius}
              />
            ))}
          </div>
        )}

        {!isLoading && testimonials.length > 0 && (
          <p className={`text-center text-[11px] mt-5 ${loadingColor}`}>
            Powered by Testimonial Platform
          </p>
        )}
      </div>
    </div>
  )
}

function SkeletonRow({ theme }: { theme: 'light' | 'dark' }) {
  const row = theme === 'dark' ? 'bg-slate-800' : 'bg-white'
  const pulse = theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
  return (
    <div className={`${row} p-5 shadow-sm border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}
      style={{ borderRadius: '12px' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full ${pulse} animate-pulse`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 ${pulse} rounded animate-pulse w-1/2`} />
          <div className={`h-3 ${pulse} rounded animate-pulse w-1/3`} />
        </div>
      </div>
      <div className={`h-3 ${pulse} rounded animate-pulse`} />
      <div className={`h-3 ${pulse} rounded animate-pulse w-5/6 mt-2`} />
    </div>
  )
}
