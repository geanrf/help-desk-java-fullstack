import { EmptyState } from '../../../components/ui/EmptyState'

export interface DonutItem {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  items: DonutItem[]
  centerLabel: string
}

export function DonutChart({ items, centerLabel }: DonutChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return <EmptyState description="Não há chamados no período selecionado." icon="chart" title="Sem dados por status" />
  }

  let currentAngle = 0
  const stops = items.filter((item) => item.value > 0).map((item) => {
    const start = currentAngle
    currentAngle += (item.value / total) * 360
    return `${item.color} ${start}deg ${currentAngle}deg`
  })

  return (
    <div className="grid items-center gap-7 p-5 sm:grid-cols-[180px_1fr] sm:p-6">
      <div
        aria-label={`${centerLabel}: ${total}`}
        className="relative mx-auto grid size-44 place-items-center rounded-full"
        role="img"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
      >
        <div className="grid size-28 place-items-center rounded-full border border-slate-800 bg-[#0d1422] text-center shadow-inner">
          <div><p className="text-3xl font-bold text-white">{total.toLocaleString('pt-BR')}</p><p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">{centerLabel}</p></div>
        </div>
      </div>
      <ul className="space-y-3">
        {items.map((item) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
          return (
            <li className="flex items-center justify-between gap-4" key={item.label}>
              <span className="flex min-w-0 items-center gap-2.5 text-sm text-slate-300"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="truncate">{item.label}</span></span>
              <span className="shrink-0 text-xs text-slate-500"><strong className="text-slate-200">{item.value}</strong> · {percentage}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
