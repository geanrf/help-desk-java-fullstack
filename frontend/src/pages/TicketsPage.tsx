import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { parseApiError } from '../api/errors'
import { Alert } from '../components/ui/Alert'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { Pagination } from '../components/ui/Pagination'
import { Spinner } from '../components/ui/Spinner'
import { PriorityBadge } from '../features/tickets/components/PriorityBadge'
import { StatusBadge } from '../features/tickets/components/StatusBadge'
import {
  priorityLabels,
  statusLabels,
  ticketPriorities,
  ticketSortOptions,
  ticketStatuses,
} from '../features/tickets/constants'
import { formatShortDate, formatTicketCode } from '../features/tickets/formatters'
import { ticketsService } from '../features/tickets/tickets.service'
import type { Category, PageResponse, TicketPriority, TicketStatus, TicketSummary } from '../features/tickets/types'

const PAGE_SIZE = 10

function isStatus(value: string | null): value is TicketStatus {
  return ticketStatuses.includes(value as TicketStatus)
}

function isPriority(value: string | null): value is TicketPriority {
  return ticketPriorities.includes(value as TicketPriority)
}

export function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const [tickets, setTickets] = useState<PageResponse<TicketSummary> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoriesError, setCategoriesError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const pageParam = Number(searchParams.get('page') ?? '0')
  const page = Number.isInteger(pageParam) && pageParam >= 0 ? pageParam : 0
  const statusParam = searchParams.get('status')
  const priorityParam = searchParams.get('priority')
  const status = isStatus(statusParam) ? statusParam : undefined
  const priority = isPriority(priorityParam) ? priorityParam : undefined
  const categoryId = searchParams.get('categoryId') || undefined
  const requestedSort = searchParams.get('sort') ?? 'createdAt,desc'
  const sort = ticketSortOptions.some((option) => option.value === requestedSort) ? requestedSort : 'createdAt,desc'
  const successMessage = (location.state as { message?: string } | null)?.message

  useEffect(() => {
    const controller = new AbortController()
    ticketsService.listCategories(controller.signal)
      .then(setCategories)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setCategoriesError(parseApiError(requestError, 'Não foi possível carregar as categorias.').message)
        }
      })
    return () => controller.abort()
  }, [reloadKey])

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError('')
    ticketsService.list({ page, size: PAGE_SIZE, status, priority, categoryId, sort }, controller.signal)
      .then(setTickets)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(parseApiError(requestError, 'Não foi possível carregar os chamados.').message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [categoryId, page, priority, reloadKey, sort, status])

  function updateFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    next.delete('page')
    setSearchParams(next)
  }

  function setPage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    if (nextPage === 0) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  function clearFilters() {
    const next = new URLSearchParams()
    if (sort !== 'createdAt,desc') next.set('sort', sort)
    setSearchParams(next)
  }

  const hasFilters = Boolean(status || priority || categoryId)

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">Central de atendimento</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Chamados</h2>
          <p className="mt-2 text-sm text-slate-400">Acompanhe solicitações e organize a fila de atendimento.</p>
        </div>
        <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,0.16)] transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" to="/app/tickets/new">
          <Icon className="size-4" name="plus" />
          Novo chamado
        </Link>
      </section>

      {successMessage && <Alert tone="success">{successMessage}</Alert>}
      {categoriesError && <Alert tone="error">{categoriesError}</Alert>}

      <section aria-label="Filtros de chamados" className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Icon className="size-4 text-cyan-300" name="filter" />
          Filtros e ordenação
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-xs font-medium text-slate-400">
            <span>Status</span>
            <select className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-cyan-400" onChange={(event) => updateFilter('status', event.target.value)} value={status ?? ''}>
              <option value="">Todos os status</option>
              {ticketStatuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-xs font-medium text-slate-400">
            <span>Prioridade</span>
            <select className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-cyan-400" onChange={(event) => updateFilter('priority', event.target.value)} value={priority ?? ''}>
              <option value="">Todas as prioridades</option>
              {ticketPriorities.map((item) => <option key={item} value={item}>{priorityLabels[item]}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-xs font-medium text-slate-400">
            <span>Categoria</span>
            <select className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-cyan-400" onChange={(event) => updateFilter('categoryId', event.target.value)} value={categoryId ?? ''}>
              <option value="">Todas as categorias</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-xs font-medium text-slate-400">
            <span>Ordenar por</span>
            <select className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-cyan-400" onChange={(event) => updateFilter('sort', event.target.value)} value={sort}>
              {ticketSortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
        {hasFilters && (
          <button className="mt-4 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200" onClick={clearFilters} type="button">Limpar filtros</button>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 sm:px-5">
          <div>
            <h3 className="font-semibold text-white">Fila de chamados</h3>
            <p className="mt-1 text-xs text-slate-500">{tickets ? `${tickets.totalElements} chamados encontrados` : 'Consultando a API...'}</p>
          </div>
          <button aria-label="Atualizar chamados" className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white" onClick={() => setReloadKey((value) => value + 1)} type="button">
            <Icon className="size-4" name="refresh" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center"><div className="flex items-center gap-3 text-sm text-slate-400"><Spinner className="size-5" /> Carregando chamados...</div></div>
        ) : error ? (
          <div className="p-5"><Alert tone="error"><div className="flex flex-wrap items-center gap-3"><span>{error}</span><button className="font-semibold underline" onClick={() => setReloadKey((value) => value + 1)} type="button">Tentar novamente</button></div></Alert></div>
        ) : !tickets || tickets.content.length === 0 ? (
          <EmptyState
            action={hasFilters ? <button className="text-sm font-semibold text-cyan-300" onClick={clearFilters} type="button">Remover filtros</button> : undefined}
            description={hasFilters ? 'Nenhum chamado corresponde aos filtros selecionados.' : 'Abra o primeiro chamado para iniciar o atendimento.'}
            title="Nenhum chamado encontrado"
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-950/35 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  <tr><th className="px-5 py-3 font-semibold">Chamado</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Prioridade</th><th className="px-4 py-3 font-semibold">Responsável</th><th className="px-4 py-3 font-semibold">Criado em</th><th className="px-5 py-3 text-right font-semibold">Ação</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {tickets.content.map((ticket) => (
                    <tr className="transition hover:bg-slate-800/25" key={ticket.id}>
                      <td className="px-5 py-4"><Link className="block max-w-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" to={`/app/tickets/${ticket.id}`}><span className="text-[10px] font-semibold tracking-wider text-cyan-400">{formatTicketCode(ticket.id)}</span><span className="mt-1 block truncate text-sm font-semibold text-slate-100">{ticket.title}</span><span className="mt-1 block text-xs text-slate-500">{ticket.category.name}</span></Link></td>
                      <td className="px-4 py-4"><StatusBadge status={ticket.status} /></td>
                      <td className="px-4 py-4"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-4 py-4 text-sm text-slate-300">{ticket.assignee?.name ?? <span className="text-slate-600">Não atribuído</span>}</td>
                      <td className="px-4 py-4 text-xs text-slate-400">{formatShortDate(ticket.createdAt)}</td>
                      <td className="px-5 py-4 text-right"><Link aria-label={`Ver chamado ${ticket.title}`} className="inline-grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-cyan-300" to={`/app/tickets/${ticket.id}`}><Icon className="size-4" name="chevron-right" /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-800 md:hidden">
              {tickets.content.map((ticket) => (
                <Link className="block p-4 transition hover:bg-slate-800/30" key={ticket.id} to={`/app/tickets/${ticket.id}`}>
                  <div className="flex items-start justify-between gap-3"><span className="text-[10px] font-semibold tracking-wider text-cyan-400">{formatTicketCode(ticket.id)}</span><PriorityBadge priority={ticket.priority} /></div>
                  <h4 className="mt-2 font-semibold leading-6 text-white">{ticket.title}</h4>
                  <p className="mt-1 text-xs text-slate-500">{ticket.category.name} · {formatShortDate(ticket.createdAt)}</p>
                  <div className="mt-4 flex items-center justify-between gap-3"><StatusBadge status={ticket.status} /><span className="truncate text-xs text-slate-500">{ticket.assignee?.name ?? 'Não atribuído'}</span></div>
                </Link>
              ))}
            </div>
            <Pagination onPageChange={setPage} page={tickets.page} totalElements={tickets.totalElements} totalPages={tickets.totalPages} />
          </>
        )}
      </section>
    </div>
  )
}
