import { useAppStore } from '../../store/useAppStore'

const toneClassNames = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-slate-200 bg-white text-slate-700',
}

export function ToastViewport() {
  const toasts = useAppStore((state) => state.toasts)

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg ${toneClassNames[toast.tone ?? 'info']}`}
        >
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-sm opacity-80">{toast.description}</p> : null}
        </div>
      ))}
    </div>
  )
}
