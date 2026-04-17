import { cn } from '../../lib/utils'

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: 'success' | 'warning' | 'neutral' | 'danger'
}) {
  const className = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    neutral: 'bg-slate-100 text-slate-600',
    danger: 'bg-rose-100 text-rose-700',
  }[tone]

  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-medium', className)}>{label}</span>
}
