import { Icon } from './Icon'

interface PaginationProps {
  page: number
  totalPages: number
  totalElements?: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginação" className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 px-4 py-4 sm:flex-row sm:px-5">
      <p className="text-xs text-slate-500">
        Página <span className="font-semibold text-slate-300">{page + 1}</span> de {totalPages}
        {typeof totalElements === 'number' && ` · ${totalElements} registros`}
      </p>
      <div className="flex items-center gap-2">
        <button
          aria-label="Página anterior"
          className="grid size-10 place-items-center rounded-xl border border-slate-700 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <Icon className="size-4" name="chevron-left" />
        </button>
        <span className="min-w-12 text-center text-sm font-semibold text-white">{page + 1}</span>
        <button
          aria-label="Próxima página"
          className="grid size-10 place-items-center rounded-xl border border-slate-700 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <Icon className="size-4" name="chevron-right" />
        </button>
      </div>
    </nav>
  )
}
