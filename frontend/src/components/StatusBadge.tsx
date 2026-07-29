type Status = 'pending' | 'approved' | 'rejected';

interface StatusBadgeProps {
  status: Status;
  showDot?: boolean;
}

const statusStyles: Record<Status, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
};

const dotStyles: Record<Status, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-rose-500',
};

export function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 py-[2px] px-[9px] rounded-full uppercase text-[11px] font-semibold tracking-[0.08em] ${statusStyles[status]}`}
    >
      {showDot && (
        <span
          className={`relative w-1.5 h-1.5 rounded-full ${dotStyles[status]}`}
          aria-hidden="true"
        >
          {status === 'pending' && (
            <span
              className={`absolute inset-0 rounded-full ${dotStyles[status]} animate-ping opacity-60`}
              aria-hidden="true"
            />
          )}
        </span>
      )}
      {status}
    </span>
  );
}
