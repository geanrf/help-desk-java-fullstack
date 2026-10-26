import { EmptyState } from '../../../components/ui/EmptyState'

export interface BarItem {
  id: string
  label: string
  value: number
  color: string
  detail?: string
}

interface HorizontalBarChartProps {
  items: BarItem[]
  emptyTitle: string
  emptyDescription: string
}

export function HorizontalBarChart({ items, emptyTitle, emptyDescription }: HorizontalBarChartProps) {
  const max = Math.max(0, ...items.map((item) => item.value))
  if (max === 0) return <EmptyState description={emptyDescription} icon="chart" title={emptyTitle} />

  return (
    <div className="space-y-5 p-5 sm:p-6">
      {items.map((item) => {
        const width = Math.max(item.value > 0 ? 4 : 0, (item.value / max) * 100)
        return (
          <div key={item.id}>
            <div className="mb-2 flex items-end justify-between gap-4">
              <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-200">{item.label}</p>{item.detail && <p className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-slate-600">{item.detail}</p>}</div>
              <span className="shrink-0 text-sm font-bold text-white">{item.value.toLocaleString('pt-BR')}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800" role="img" aria-label={`${item.label}: ${item.value}`}>
              <div className="h-full rounded-full transition-[width] duration-500" style={{ backgroundColor: item.color, width: `${width}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
