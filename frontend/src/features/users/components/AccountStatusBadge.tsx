import { cn } from '../../../lib/cn'

export function AccountStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        active
          ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
          : 'border-slate-600 bg-slate-800 text-slate-400',
      )}
    >
      <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-400' : 'bg-slate-500')} />
      {active ? 'Ativa' : 'Inativa'}
    </span>
  )
}
