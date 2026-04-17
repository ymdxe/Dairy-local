import { Button } from './Button'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = '再想想',
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm leading-7 text-slate-500">{description}</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? '处理中…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
