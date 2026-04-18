import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const baseClassName =
  'inline-flex items-center justify-center rounded-full font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300'

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    'bg-stone-700/88 text-stone-50 shadow-[0_14px_34px_-20px_rgba(68,64,60,0.7)] hover:bg-stone-700',
  secondary: 'bg-white/82 text-slate-700 ring-1 ring-stone-200 hover:bg-white',
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
