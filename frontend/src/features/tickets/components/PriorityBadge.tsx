import { cn } from '../../../lib/cn'
import { priorityLabels } from '../constants'
import type { TicketPriority } from '../types'

const styles: Record<TicketPriority, string> = {
  BAIXA: 'bg-slate-800 text-slate-300',
  MEDIA: 'bg-cyan-400/10 text-cyan-200',
  ALTA: 'bg-orange-400/10 text-orange-200',
  CRITICA: 'bg-rose-500/10 text-rose-200',
}

export function PriorityBadge({ priority, className }: { priority: TicketPriority; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold', styles[priority], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {priorityLabels[priority]}
    </span>
  )
}
