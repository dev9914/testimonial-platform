import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllTestimonials,
  approveTestimonial,
  rejectTestimonial,
  refreshTestimonialAi,
} from '../services/testimonials'
import RatingStars from '../components/RatingStars'
import { Button } from '../components/Button'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/formatDate'
import type { ITestimonial, TestimonialStatus, ApiResponse, SentimentLabel } from '../types'

const SENTIMENT_META: Record<
  SentimentLabel,
  { emoji: string; label: string; chipBg: string; chipText: string; confBg: string }
> = {
  positive: {
    emoji: '😊',
    label: 'Positive',
    chipBg: 'bg-emerald-50',
    chipText: 'text-emerald-700',
    confBg: 'bg-emerald-600',
  },
  neutral: {
    emoji: '😐',
    label: 'Neutral',
    chipBg: 'bg-slate-100',
    chipText: 'text-slate-700',
    confBg: 'bg-slate-500',
  },
  negative: {
    emoji: '😞',
    label: 'Negative',
    chipBg: 'bg-rose-50',
    chipText: 'text-rose-700',
    confBg: 'bg-rose-600',
  },
  unknown: {
    emoji: '🤖',
    label: 'Analyzing',
    chipBg: 'bg-slate-50',
    chipText: 'text-slate-500',
    confBg: 'bg-slate-400',
  },
}

function AiInsights({
  testimonial,
}: {
  testimonial: ITestimonial
}) {
  const sentiment = testimonial.sentiment ?? 'unknown'
  const meta = SENTIMENT_META[sentiment]
  const hasSummary = Boolean(testimonial.summary && testimonial.summary.trim().length > 0)

  return (
    <div className="rounded-xl bg-slate-50/80 ring-1 ring-inset ring-slate-200/70 px-3.5 py-2.5 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 py-[2px] px-[9px] rounded-full text-[11px] font-semibold tracking-wide ${meta.chipBg} ${meta.chipText}`}
        >
          <span aria-hidden>{meta.emoji}</span>
          <span>{meta.label}</span>
        </span>
        {sentiment !== 'unknown' && testimonial.confidence != null ? (
          <div className="inline-flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full ${meta.confBg}`}
                style={{ width: `${Math.max(0, Math.min(100, testimonial.confidence))}%` }}
                aria-hidden
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
              {testimonial.confidence}%
            </span>
          </div>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">
            Waiting for AI analysis…
          </span>
        )}
      </div>

      {hasSummary ? (
        <p className="text-xs leading-relaxed text-slate-600 italic">
          “{testimonial.summary}”
        </p>
      ) : null}
    </div>
  )
}

interface ColumnConfig {
  key: TestimonialStatus
  title: string
  bg: string
  badgeBg: string
  badgeText: string
}

const columns: ColumnConfig[] = [
  {
    key: 'pending',
    title: 'Pending',
    bg: 'bg-amber-50/60',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
  },
  {
    key: 'approved',
    title: 'Approved',
    bg: 'bg-emerald-50/60',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
  },
  {
    key: 'rejected',
    title: 'Rejected',
    bg: 'bg-rose-50/60',
    badgeBg: 'bg-rose-500',
    badgeText: 'text-white',
  },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_0_0_1px_rgba(15,23,42,0.02)] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full shimmer bg-slate-200/70" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 rounded-md shimmer bg-slate-200/70 w-3/4" />
          <div className="h-3 rounded-md shimmer bg-slate-200/70 w-1/2" />
        </div>
      </div>
      <div className="h-[88px] rounded-xl shimmer bg-slate-200/50" />
      <div className="h-3 rounded-md shimmer bg-slate-200/70 w-28" />
      <div className="space-y-1.5">
        <div className="h-3 rounded-md shimmer bg-slate-200/70" />
        <div className="h-3 rounded-md shimmer bg-slate-200/70 w-5/6" />
      </div>
      <div className="h-3 rounded-md shimmer bg-slate-200/70 w-1/3" />
    </div>
  )
}

function EmptyState({ status }: { status: TestimonialStatus }) {
  const messages: Record<TestimonialStatus, { title: string; desc: string }> = {
    pending: { title: 'Inbox zero', desc: 'No pending reviews. All caught up!' },
    approved: { title: 'Nothing live yet', desc: 'No approved testimonials yet.' },
    rejected: { title: 'No rejects', desc: 'Everything passes your quality bar.' },
  }
  const m = messages[status]
  return (
    <div className="py-10 px-4 rounded-2xl border border-dashed border-slate-200 bg-white/50">
      <div className="relative mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-white ring-1 ring-inset ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="mt-3.5 text-center text-[13.5px] font-semibold tracking-tight text-slate-800">{m.title}</p>
      <p className="mt-1 text-center text-[12px] text-slate-500 leading-relaxed">{m.desc}</p>
    </div>
  )
}

function TestimonialCard({
  testimonial,
  onApprove,
  onReject,
  onRefreshAi,
  approveLoading,
  rejectLoading,
  refreshAiLoading,
}: {
  testimonial: ITestimonial
  onApprove: () => void
  onReject: () => void
  onRefreshAi: () => void
  approveLoading: boolean
  rejectLoading: boolean
  refreshAiLoading: boolean
}) {
  const isLong = testimonial.message.length > 140
  const preview = isLong ? testimonial.message.slice(0, 140) : testimonial.message

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_0_0_1px_rgba(15,23,42,0.02)] p-4 flex flex-col gap-3 transition-all duration-200 ease-out hover:shadow-[0_6px_22px_-12px_rgba(15,23,42,0.16)] hover:border-slate-300/80">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-[13px] flex-shrink-0 ring-1 ring-inset ring-slate-200/60">
            {getInitials(testimonial.name)}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-semibold text-slate-900 tracking-tight truncate text-[14px]">{testimonial.name}</p>
            <p className="text-[12.5px] text-slate-500 truncate">{testimonial.company}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefreshAi}
          disabled={refreshAiLoading}
          aria-label="Refresh AI summary"
          title={testimonial.sentiment === 'unknown' ? 'Retry AI analysis' : 'Regenerate AI summary'}
          className="flex-shrink-0 w-7 h-7 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 ${refreshAiLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <AiInsights testimonial={testimonial} />

      <div className="py-0.5">
        <RatingStars value={testimonial.rating} size="sm" />
      </div>

      <div>
        <p className="text-[13.5px] text-slate-600 leading-relaxed line-clamp-2">
          {preview}
          {isLong && '...'}
        </p>
      </div>

      <p className="text-[11px] text-slate-400 -mt-1">{formatDate(testimonial.createdAt)}</p>

      {testimonial.status === 'pending' && (
        <div className="flex gap-2 pt-2 mt-1 border-t border-slate-100">
          <Button
            variant="success"
            size="sm"
            onClick={onApprove}
            loading={approveLoading}
            className="flex-1"
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onReject}
            loading={rejectLoading}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const { pushToast } = useToast()

  const { data, isLoading, error } = useQuery({
    queryKey: ['testimonials'],
    queryFn: getAllTestimonials,
    refetchInterval: (query) => {
      const current = query.state.data?.data?.testimonials
      if (!current) return 3000
      const anyUnknown = current.some((t) => t.sentiment === 'unknown')
      return anyUnknown ? 4000 : false
    },
    staleTime: 1000,
  })

  const testimonials = data?.data?.testimonials || []

  const grouped = testimonials.reduce<Record<TestimonialStatus, ITestimonial[]>>(
    (acc, t) => {
      acc[t.status].push(t)
      return acc
    },
    { pending: [], approved: [], rejected: [] }
  )

  const previousData = queryClient.getQueryData<ApiResponse<{ testimonials: ITestimonial[] }>>(['testimonials'])

  const updateCacheOptimistically = (id: string, newStatus: TestimonialStatus) => {
    queryClient.setQueryData<ApiResponse<{ testimonials: ITestimonial[] }>>(
      ['testimonials'],
      (old) => {
        if (!old?.data?.testimonials) return old
        return {
          ...old,
          data: {
            ...old.data,
            testimonials: old.data.testimonials.map((t) =>
              t._id === id
                ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
                : t
            ),
          },
        }
      }
    )
  }

  const resetAiOptimistically = (id: string) => {
    queryClient.setQueryData<ApiResponse<{ testimonials: ITestimonial[] }>>(
      ['testimonials'],
      (old) => {
        if (!old?.data?.testimonials) return old
        return {
          ...old,
          data: {
            ...old.data,
            testimonials: old.data.testimonials.map((t) =>
              t._id === id
                ? { ...t, sentiment: 'unknown', confidence: null, summary: null, updatedAt: new Date().toISOString() }
                : t
            ),
          },
        }
      }
    )
  }

  const approveMutation = useMutation({
    mutationFn: approveTestimonial,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['testimonials'] })
      updateCacheOptimistically(id, 'approved')
      return { previousData }
    },
    onSuccess: (response, id) => {
      pushToast('success', response.message || 'Testimonial approved!')
      const updated = response?.data?.testimonial
      if (updated) {
        queryClient.setQueryData<ApiResponse<{ testimonials: ITestimonial[] }>>(
          ['testimonials'],
          (old) => {
            if (!old?.data?.testimonials) return old
            return {
              ...old,
              data: {
                ...old.data,
                testimonials: old.data.testimonials.map((t) =>
                  t._id === id ? updated : t
                ),
              },
            }
          }
        )
      }
      void queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
    onError: (error, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['testimonials'], context.previousData)
      }
      const err = error as { response?: { data?: { message?: string } } }
      pushToast('error', err.response?.data?.message || 'Failed to approve testimonial.')
      void queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectTestimonial,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['testimonials'] })
      updateCacheOptimistically(id, 'rejected')
      return { previousData }
    },
    onSuccess: (response, id) => {
      pushToast('success', response.message || 'Testimonial rejected.')
      const updated = response?.data?.testimonial
      if (updated) {
        queryClient.setQueryData<ApiResponse<{ testimonials: ITestimonial[] }>>(
          ['testimonials'],
          (old) => {
            if (!old?.data?.testimonials) return old
            return {
              ...old,
              data: {
                ...old.data,
                testimonials: old.data.testimonials.map((t) =>
                  t._id === id ? updated : t
                ),
              },
            }
          }
        )
      }
      void queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
    onError: (error, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['testimonials'], context.previousData)
      }
      const err = error as { response?: { data?: { message?: string } } }
      pushToast('error', err.response?.data?.message || 'Failed to reject testimonial.')
      void queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })

  const refreshAiMutation = useMutation({
    mutationFn: refreshTestimonialAi,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['testimonials'] })
      resetAiOptimistically(id)
      return { previousData }
    },
    onSuccess: (response, id) => {
      pushToast('success', response.message || 'AI analysis scheduled.')
      const updated = response?.data?.testimonial
      if (updated) {
        queryClient.setQueryData<ApiResponse<{ testimonials: ITestimonial[] }>>(
          ['testimonials'],
          (old) => {
            if (!old?.data?.testimonials) return old
            return {
              ...old,
              data: {
                ...old.data,
                testimonials: old.data.testimonials.map((t) =>
                  t._id === id ? updated : t
                ),
              },
            }
          }
        )
      }
      void queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
    onError: (error, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['testimonials'], context.previousData)
      }
      const err = error as { response?: { data?: { message?: string } } }
      pushToast('error', err.response?.data?.message || 'Failed to refresh AI summary.')
      void queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center px-6 py-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-900 font-semibold tracking-tight">Unable to load</p>
          <p className="mt-1 text-sm text-slate-500">Failed to load testimonials.</p>
        </div>
      </div>
    )
  }

  const total = grouped.pending.length + grouped.approved.length + grouped.rejected.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-[28px] sm:text-3xl font-bold text-slate-900 tracking-tight leading-[1.15]">
            Moderation Dashboard
          </h2>
          <p className="mt-1 text-[14px] sm:text-[15px] text-slate-600 leading-relaxed">
            Review and manage submitted testimonials
          </p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white ring-1 ring-inset ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" aria-hidden />
            Total: <span className="font-semibold text-slate-700 tabular-nums">{total}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {columns.map((col) => {
          const items = grouped[col.key]
          return (
            <div key={col.key} className={`${col.bg} rounded-2xl p-4 sm:p-5 ring-1 ring-inset ring-black/[0.02]`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 tracking-tight text-[15px]">{col.title}</h3>
                <span
                  className={`${col.badgeBg} ${col.badgeText} text-[11.5px] font-semibold py-[2px] px-[9px] rounded-full min-w-[24px] text-center tabular-nums shadow-[0_1px_2px_rgba(15,23,42,0.08)]`}
                >
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : items.length === 0 ? (
                  <EmptyState status={col.key} />
                ) : (
                  items.map((t) => (
                    <TestimonialCard
                      key={t._id}
                      testimonial={t}
                      onApprove={() => approveMutation.mutate(t._id)}
                      onReject={() => rejectMutation.mutate(t._id)}
                      onRefreshAi={() => refreshAiMutation.mutate(t._id)}
                      approveLoading={approveMutation.isPending && approveMutation.variables === t._id}
                      rejectLoading={rejectMutation.isPending && rejectMutation.variables === t._id}
                      refreshAiLoading={refreshAiMutation.isPending && refreshAiMutation.variables === t._id}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
