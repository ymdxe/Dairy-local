import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const baseClassName =
  'inline-flex items-center justify-center rounded-full font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50'

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-slate-900 text-white shadow-sm hover:bg-slate-800',
  secondary: 'bg-white/80 text-slate-800 ring-1 ring-slate-200 hover:bg-white',
  ghost: 'bg-transparent text-slate-600 hover:bg-white/60',
  danger: 'bg-rose-500 text-white hover:bg-rose-600',
}

const sizeClassNames: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(baseClassName, variantClassNames[variant], sizeClassNames[size], className)
}

export type { ButtonSize, ButtonVariant }
