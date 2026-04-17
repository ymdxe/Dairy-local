import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../lib/utils'

export function Panel({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <section
      className={cn(
        'rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] backdrop-blur',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}
