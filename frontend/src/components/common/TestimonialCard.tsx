import RatingStars from '../RatingStars'
import { formatDate } from '../../utils/formatDate'
import type { ITestimonial } from '../../types'

export interface TestimonialCardProps {
  testimonial: ITestimonial
  showRating?: boolean
  showCompany?: boolean
  theme?: 'light' | 'dark'
  borderRadius?: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const gradientBgs = [
  'bg-gradient-to-br from-violet-500 to-fuchsia-500',
  'bg-gradient-to-br from-blue-500 to-cyan-500',
  'bg-gradient-to-br from-emerald-500 to-teal-500',
  'bg-gradient-to-br from-orange-500 to-rose-500',
  'bg-gradient-to-br from-amber-500 to-yellow-500',
  'bg-gradient-to-br from-slate-600 to-slate-800',
]

function getGradientForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradientBgs[Math.abs(hash) % gradientBgs.length]
}

export default function TestimonialCard({
  testimonial,
  showRating = true,
  showCompany = true,
  theme = 'light',
  borderRadius = 16,
}: TestimonialCardProps) {
  const isDark = theme === 'dark'

  return (
    <div
      className={`relative ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80'} rounded-2xl p-5 sm:p-6 flex flex-col gap-4 transition-all duration-250 ease-out border shadow-[0_1px_2px_rgba(15,23,42,0.04),0_0_0_1px_rgba(15,23,42,0.02)] hover:shadow-[0_14px_40px_-14px_rgba(15,23,42,0.18),0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-slate-300/80`}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {testimonial.photo ? (
          <img
            src={testimonial.photo}
            alt={testimonial.name}
            className="w-12 h-12 object-cover flex-shrink-0 rounded-full ring-2 ring-slate-100 shadow-sm"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div
            className={`w-12 h-12 flex items-center justify-center text-white font-semibold text-[15px] flex-shrink-0 rounded-full shadow-[0_1px_3px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.2)] ${getGradientForName(testimonial.name)}`}
          >
            {getInitials(testimonial.name)}
          </div>
        )}
        <div className="min-w-0 flex-1 pt-0.5">
          <h4
            className={`font-semibold tracking-tight truncate ${
              isDark ? 'text-white text-[15px]' : 'text-slate-900 text-[15px]'
            }`}
          >
            {testimonial.name}
          </h4>
          {showCompany && (
            <p
              className={`text-sm truncate mt-0.5 ${
                isDark ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {testimonial.company}
            </p>
          )}
          {showRating && (
            <div className="mt-2">
              <RatingStars value={testimonial.rating} size="sm" />
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-1">
        <svg
          className={`absolute -top-0.5 left-0 w-6 h-6 ${
            isDark ? 'text-slate-500' : 'text-slate-200 opacity-60'
          }`}
          fill="currentColor"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
        <p
          className={`text-sm sm:text-[15px] leading-relaxed pl-5 relative z-10 ${
            isDark ? 'text-slate-100' : 'text-slate-700'
          }`}
        >
          {testimonial.message}
        </p>
      </div>

      <p
        className={`text-[11.5px] pt-3 border-t ${
          isDark ? 'text-slate-300 border-slate-700' : 'text-slate-400 border-slate-100'
        }`}
      >
        {formatDate(testimonial.createdAt)}
      </p>
    </div>
  )
}
