import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toasts: Toast[]
  pushToast: (type: ToastType, message: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const cardStyles: Record<ToastType, string> = {
  success: 'ring-1 ring-inset ring-emerald-600/10',
  error: 'ring-1 ring-inset ring-rose-600/10',
  info: 'ring-1 ring-inset ring-blue-600/10',
}

const iconWrapperStyles: Record<ToastType, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  error: 'bg-rose-50 text-rose-600',
  info: 'bg-blue-50 text-blue-600',
}

const closeIconStyles: Record<ToastType, string> = {
  success: 'text-emerald-500 hover:bg-emerald-50',
  error: 'text-rose-500 hover:bg-rose-50',
  info: 'text-blue-500 hover:bg-blue-50',
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Math.random().toString(36).slice(2, 11)
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3500)
    },
    []
  )

  const icons = {
    success: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
      </svg>
    ),
  }

  return (
    <ToastContext.Provider value={{ toasts, pushToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] flex flex-col gap-2.5 w-full max-w-[92%] sm:max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white rounded-xl shadow-[0_10px_38px_-10px_rgba(15,23,42,0.25),0_10px_20px_-15px_rgba(15,23,42,0.1)] ${cardStyles[toast.type]} px-3.5 py-3 flex items-start gap-3 animate-in fade-in slide-in-from-right-16 zoom-in-95 duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]`}
            role="alert"
          >
            <div className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center ${iconWrapperStyles[toast.type]}`}>
              {icons[toast.type]}
            </div>
            <p className="flex-1 text-[13.5px] leading-5 text-slate-800 font-medium pt-0.5">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-md flex items-center justify-center transition-colors ${closeIconStyles[toast.type]}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
