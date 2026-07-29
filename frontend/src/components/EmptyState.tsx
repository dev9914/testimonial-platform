import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

function DefaultIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-7 h-7 text-slate-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
      />
    </svg>
  );
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-2xl border border-dashed border-slate-200 bg-white/60">
      <div className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-inset ring-slate-200/80">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 opacity-80" aria-hidden />
        <div className="relative">
          {icon ?? <DefaultIcon />}
        </div>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-5">{action}</div>
      )}
    </div>
  );
}
