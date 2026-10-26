import { cn } from '../../../lib/cn'
import { statusLabels } from '../constants'
import type { TicketStatus } from '../types'

const styles: Record<TicketStatus, string> = {
  ABERTO: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
  EM_ATENDIMENTO: 'border-violet-400/25 bg-violet-400/10 text-violet-200',
  AGUARDANDO_USUARIO: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
  RESOLVIDO: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
  FECHADO: 'border-slate-600 bg-slate-800 text-slate-300',
}

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold', styles[status], className)}>
      {statusLabels[status]}
    </span>
  )
}
