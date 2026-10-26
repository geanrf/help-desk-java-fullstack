export function DashboardSkeleton() {
  return (
    <div aria-label="Carregando indicadores" className="space-y-6" role="status">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => <div className="h-36 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40" key={index} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40" />
        <div className="h-96 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40" />
      </div>
      <span className="sr-only">Carregando indicadores...</span>
    </div>
  )
}
