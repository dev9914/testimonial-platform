import { createElement } from 'react';
import type { HTMLAttributes } from 'react';

type SkeletonAs = 'div' | 'p' | 'span';

interface SkeletonProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  as?: SkeletonAs;
}

export function Skeleton({
  className = 'h-4 w-full',
  as = 'div',
  ...props
}: SkeletonProps) {
  const baseClassName = `relative overflow-hidden bg-slate-200/70 rounded-md shimmer ${className}`;

  return createElement(
    as,
    { className: baseClassName, ...props },
    '\u200c'
  );
}
