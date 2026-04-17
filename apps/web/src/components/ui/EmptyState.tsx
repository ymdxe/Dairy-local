import type { PropsWithChildren } from 'react'

import { Panel } from './Panel'

export function EmptyState({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <Panel className="border-dashed bg-white/55 text-center">
      <div className="mx-auto max-w-md space-y-3 py-8">
        <p className="text-lg font-semibold text-slate-800">{title}</p>
        <p className="text-sm leading-7 text-slate-500">{description}</p>
        {children ? <div className="pt-2">{children}</div> : null}
      </div>
    </Panel>
  )
}
