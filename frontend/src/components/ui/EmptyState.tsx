import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

interface EmptyStateProps {
  icon?: IconName
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon = 'ticket', title, description, action }: EmptyStateProps) {
  return (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-slate-700 bg-slate-800/60 text-slate-400">
        <Icon className="size-6" name={icon} />
      </div>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
