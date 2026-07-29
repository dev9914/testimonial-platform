import type { HTMLAttributes } from 'react';

type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: LoaderSize;
}

const sizeMap: Record<LoaderSize, string> = {
  sm: 'w-[13px] h-[13px] border-[2px]',
  md: 'w-[16px] h-[16px] border-2',
  lg: 'w-6 h-6 border-[2.5px]',
};

export function Loader({ size = 'md', className = '', ...props }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      {...props}
      className={`inline-block rounded-full border-current border-t-transparent animate-spin text-slate-600 ${sizeMap[size]} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
