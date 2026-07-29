import { useState, useRef } from 'react';
import type { SVGProps, KeyboardEvent } from 'react';

type RatingSize = 'sm' | 'md' | 'lg';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: RatingSize;
  displayOnly?: boolean;
  interactive?: boolean;
}

const sizeMap: Record<RatingSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function RatingStars({
  value,
  onChange,
  size = 'md',
  displayOnly = false,
  interactive,
}: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const isInteractive =
    (typeof onChange === 'function' || interactive === true) && !displayOnly;
  const displayValue = hoverValue ?? value;
  const clampedValue = Math.max(0, Math.min(5, displayValue));
  const groupRef = useRef<HTMLDivElement>(null);

  const handleClick = (index: number) => {
    if (isInteractive && onChange) {
      onChange(index);
    }
  };

  const focusStar = (star: number) => {
    const node = groupRef.current;
    if (!node) return;
    const el = node.querySelectorAll<HTMLElement>('[data-rating-star]')[star - 1];
    if (el) el.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>, star: number) => {
    if (!isInteractive || !onChange) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        const nextUp = Math.min(5, star + 1);
        onChange(nextUp);
        focusStar(nextUp);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        const nextDown = Math.max(1, star - 1);
        onChange(nextDown);
        focusStar(nextDown);
        break;
      case 'Home':
        e.preventDefault();
        onChange(1);
        focusStar(1);
        break;
      case 'End':
        e.preventDefault();
        onChange(5);
        focusStar(5);
        break;
    }
  };

  return (
    <div
      ref={groupRef}
      className={`inline-flex items-center ${isInteractive ? 'cursor-pointer' : ''}`}
      onMouseLeave={() => isInteractive && setHoverValue(null)}
      role={isInteractive ? 'radiogroup' : undefined}
      aria-label={isInteractive ? 'Rating' : undefined}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= clampedValue;
        const isSelected = star === clampedValue;
        const shouldBeTabbable = isInteractive && (isSelected || (clampedValue === 0 && star === 1));
        return (
          <button
            key={star}
            data-rating-star
            type="button"
            disabled={!isInteractive}
            onClick={() => handleClick(star)}
            onMouseEnter={() => isInteractive && setHoverValue(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            className={`p-0.5 transition-transform ${
              isInteractive
                ? 'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded'
                : ''
            } ${!isInteractive ? 'cursor-default' : ''}`}
            tabIndex={shouldBeTabbable ? 0 : -1}
            role={isInteractive ? 'radio' : undefined}
            aria-checked={isInteractive ? isSelected : undefined}
            aria-label={isInteractive ? `${star} star${star > 1 ? 's' : ''}, ${star} out of 5}` : `${star} star${star > 1 ? 's' : ''}`}
          >
            <StarIcon
              className={`${sizeMap[size]} ${
                isFilled ? 'text-amber-400' : 'text-slate-200'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default RatingStars;
