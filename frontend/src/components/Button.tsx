import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader } from './Loader';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_1px_3px_rgba(15,23,42,0.16),0_0_0_1px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.08)] focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-600 shadow-[0_1px_2px_rgba(5,150,105,0.2),0_0_0_1px_rgba(5,150,105,0.12)] hover:shadow-[0_1px_3px_rgba(5,150,105,0.28),0_0_0_1px_rgba(5,150,105,0.16)] focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2',
  danger:
    'bg-white text-rose-600 hover:bg-rose-50 active:bg-rose-100 border border-rose-200 hover:border-rose-300 shadow-sm focus-visible:ring-2 focus-visible:ring-rose-500/30 focus-visible:ring-offset-2',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200/80 active:bg-slate-200 border border-slate-200 shadow-sm focus-visible:ring-2 focus-visible:ring-slate-400/30 focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200/70 focus-visible:ring-2 focus-visible:ring-slate-400/30 focus-visible:ring-offset-2',
  outline:
    'bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-sm focus-visible:ring-2 focus-visible:ring-slate-400/30 focus-visible:ring-offset-2',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-md gap-1.5',
  md: 'h-9 px-4 text-sm rounded-lg gap-1.5',
  lg: 'h-11 px-5 text-[15px] rounded-lg gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  children,
  onClick,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center whitespace-nowrap
        font-semibold tracking-tight
        select-none
        transition-all duration-150 ease-out
        focus-visible:outline-none
        disabled:opacity-60 disabled:pointer-events-none
        active:scale-[0.99]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader size="sm" className="text-current opacity-80" />}
      {children}
    </button>
  );
}
