import { Icon, type IconName } from '../../../components/ui/Icon'
import { cn } from '../../../lib/cn'

interface MetricCardProps {
  label: string
  value: number
  icon: IconName
  tone: 'cyan' | 'sky' | 'amber' | 'emerald' | 'slate'
  description: string
  featured?: boolean
}

const tones = {
  cyan: 'border-cyan-400/20 bg-cyan-400/8 text-cyan-300',
  sky: 'border-sky-400/20 bg-sky-400/8 text-sky-300',
  amber: 'border-amber-400/20 bg-amber-400/8 text-amber-300',
  emerald: 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300',
  slate: 'border-slate-700 bg-slate-800/70 text-slate-300',
}

export function MetricCard({ label, value, icon, tone, description, featured = false }: MetricCardProps) {
  return (
    <article className={cn('relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/45 p-5', featured && 'sm:col-span-2 xl:col-span-1')}>
      {featured && <div aria-hidden="true" className="absolute -right-8 -top-10 size-28 rounded-full bg-cyan-400/8 blur-2xl" />}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value.toLocaleString('pt-BR')}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <div className={cn('grid size-10 shrink-0 place-items-center rounded-xl border', tones[tone])}>
          <Icon className="size-5" name={icon} />
        </div>
      </div>
    </article>
  )
}
