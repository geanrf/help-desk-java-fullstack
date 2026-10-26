import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseApiError } from '../api/errors'
import { useAuth } from '../auth/AuthContext'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { DashboardSkeleton } from '../features/dashboard/components/DashboardSkeleton'
import { DonutChart, type DonutItem } from '../features/dashboard/components/DonutChart'
import { HorizontalBarChart, type BarItem } from '../features/dashboard/components/HorizontalBarChart'
import { MetricCard } from '../features/dashboard/components/MetricCard'
import { dashboardService } from '../features/dashboard/dashboard.service'
import type { DashboardSummary } from '../features/dashboard/types'
import { priorityLabels, statusLabels } from '../features/tickets/constants'
import type { TicketPriority, TicketStatus } from '../features/tickets/types'

const statusColors: Record<TicketStatus, string> = {
  ABERTO: '#38bdf8',
  EM_ATENDIMENTO: '#a78bfa',
  AGUARDANDO_USUARIO: '#fbbf24',
  RESOLVIDO: '#34d399',
  FECHADO: '#64748b',
}

const priorityColors: Record<TicketPriority, string> = {
  BAIXA: '#64748b',
  MEDIA: '#22d3ee',
  ALTA: '#fb923c',
  CRITICA: '#fb7185',
}

const categoryColors = ['#22d3ee', '#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#facc15', '#34d399']

function isValidDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function DashboardPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const fromParam = isValidDate(searchParams.get('from')) ? searchParams.get('from') ?? '' : ''
  const toParam = isValidDate(searchParams.get('to')) ? searchParams.get('to') ?? '' : ''
  const [fromInput, setFromInput] = useState(fromParam)
  const [toInput, setToInput] = useState(toParam)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterError, setFilterError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    setFromInput(fromParam)
    setToInput(toParam)
  }, [fromParam, toParam])

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError('')
    setSummary(null)
    dashboardService.getSummary(
      { from: fromParam || undefined, to: toParam || undefined },
      controller.signal,
    )
      .then((response) => {
        setSummary(response)
        setLastUpdated(new Date())
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(parseApiError(requestError, 'Não foi possível carregar os indicadores.').message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [fromParam, reloadKey, toParam])

  if (!user) return null

  function applyPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFilterError('')
    if (fromInput && toInput && fromInput > toInput) {
      setFilterError('A data inicial não pode ser posterior à data final.')
      return
    }

    const next = new URLSearchParams()
    if (fromInput) next.set('from', fromInput)
    if (toInput) next.set('to', toInput)
    setSearchParams(next)
  }

  function clearPeriod() {
    setFilterError('')
    setFromInput('')
    setToInput('')
    setSearchParams(new URLSearchParams())
  }

  const statusItems: DonutItem[] = summary?.byStatus.map((item) => ({
    label: statusLabels[item.status],
    value: item.total,
    color: statusColors[item.status],
  })) ?? []

  const priorityItems: BarItem[] = summary?.byPriority.map((item) => ({
    id: item.priority,
    label: priorityLabels[item.priority],
    value: item.total,
    color: priorityColors[item.priority],
  })) ?? []

  const categoryItems: BarItem[] = summary?.byCategory
    .filter((item) => item.total > 0)
    .sort((first, second) => second.total - first.total || first.name.localeCompare(second.name, 'pt-BR'))
    .map((item, index) => ({
      id: item.categoryId,
      label: item.name,
      detail: item.code,
      value: item.total,
      color: categoryColors[index % categoryColors.length],
    })) ?? []

  const technicianItems: BarItem[] = summary?.byTechnician
    .slice()
    .sort((first, second) => second.total - first.total || first.name.localeCompare(second.name, 'pt-BR'))
    .map((item) => ({
      id: item.technicianId,
      label: item.name,
      detail: item.active ? 'Técnico ativo' : 'Técnico inativo',
      value: item.total,
      color: item.active ? '#22d3ee' : '#64748b',
    })) ?? []

  const periodLabel = fromParam || toParam
    ? `${fromParam ? new Date(`${fromParam}T00:00:00`).toLocaleDateString('pt-BR') : 'Sem limite inicial'} — ${toParam ? new Date(`${toParam}T00:00:00`).toLocaleDateString('pt-BR') : 'Sem limite final'}`
    : 'Todo o histórico'

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">Indicadores operacionais</p>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{user.role === 'ADMIN' ? 'Visão geral' : 'Meus chamados'}</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Dashboard de atendimento</h2>
          <p className="mt-2 text-sm text-slate-400">{user.role === 'ADMIN' ? 'Acompanhe o panorama completo da operação de suporte.' : 'Indicadores restritos aos chamados atribuídos a você.'}</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="hidden text-xs text-slate-600 sm:inline">Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
          <Button disabled={isLoading} onClick={() => setReloadKey((value) => value + 1)} type="button" variant="secondary"><Icon className={isLoading ? 'size-4 animate-spin' : 'size-4'} name="refresh" />Atualizar</Button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4 sm:p-5">
        <form className="flex flex-col gap-4 xl:flex-row xl:items-end" onSubmit={applyPeriod}>
          <div className="flex items-center gap-2 xl:mr-2 xl:pb-3"><Icon className="size-4 text-cyan-300" name="calendar" /><div><p className="text-sm font-semibold text-white">Período de análise</p><p className="mt-0.5 text-xs text-slate-500">{periodLabel}</p></div></div>
          <label className="flex-1 space-y-2 text-xs font-medium text-slate-400"><span>Data inicial</span><input className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-cyan-400" max={toInput || undefined} onChange={(event) => setFromInput(event.target.value)} type="date" value={fromInput} /></label>
          <label className="flex-1 space-y-2 text-xs font-medium text-slate-400"><span>Data final</span><input className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-cyan-400" min={fromInput || undefined} onChange={(event) => setToInput(event.target.value)} type="date" value={toInput} /></label>
          <div className="flex gap-2"><Button type="submit">Aplicar período</Button>{(fromParam || toParam) && <Button onClick={clearPeriod} type="button" variant="ghost">Limpar</Button>}</div>
        </form>
        {filterError && <p className="mt-3 text-sm text-rose-300" role="alert">{filterError}</p>}
      </section>

      {error && <Alert tone="error"><div className="flex flex-wrap items-center gap-3"><span>{error}</span><button className="font-semibold underline" onClick={() => setReloadKey((value) => value + 1)} type="button">Tentar novamente</button></div></Alert>}

      {isLoading ? <DashboardSkeleton /> : summary ? (
        <>
          <section aria-label="Resumo dos chamados" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard description="Registros não excluídos" featured icon="chart" label="Total de chamados" tone="cyan" value={summary.totalActiveTickets} />
            <MetricCard description="Aguardando início" icon="ticket" label="Abertos" tone="sky" value={summary.openTickets} />
            <MetricCard description="Em atendimento ou aguardando usuário" icon="clock" label="Pendentes" tone="amber" value={summary.pendingTickets} />
            <MetricCard description="Atendimento concluído" icon="check" label="Resolvidos" tone="emerald" value={summary.resolvedTickets} />
            <MetricCard description="Ciclo encerrado" icon="lock" label="Fechados" tone="slate" value={summary.closedTickets} />
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3 text-sm">
            <span className="text-slate-400">Chamados concluídos no período</span>
            <strong className="text-emerald-300">{summary.completedTickets.toLocaleString('pt-BR')} resolvidos ou fechados</strong>
          </div>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="border-b border-slate-800 px-5 py-4"><h3 className="font-semibold text-white">Chamados por status</h3><p className="mt-1 text-xs text-slate-500">Distribuição do fluxo de atendimento</p></div>
              <DonutChart centerLabel="Chamados" items={statusItems} />
            </article>
            <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="border-b border-slate-800 px-5 py-4"><h3 className="font-semibold text-white">Chamados por prioridade</h3><p className="mt-1 text-xs text-slate-500">Volume agrupado por nível de urgência</p></div>
              <HorizontalBarChart emptyDescription="Não há chamados no período selecionado." emptyTitle="Sem dados por prioridade" items={priorityItems} />
            </article>
          </section>

          <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="border-b border-slate-800 px-5 py-4"><h3 className="font-semibold text-white">Chamados por categoria</h3><p className="mt-1 text-xs text-slate-500">Áreas com maior demanda de suporte</p></div>
            <HorizontalBarChart emptyDescription="Nenhuma categoria possui chamados no período selecionado." emptyTitle="Sem dados por categoria" items={categoryItems} />
          </article>

          {user.role === 'ADMIN' && (
            <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-white">Produtividade por técnico</h3><p className="mt-1 text-xs text-slate-500">Chamados atribuídos a cada profissional</p></div><span className="w-fit rounded-full border border-cyan-400/15 bg-cyan-400/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">Somente ADMIN</span></div>
              <HorizontalBarChart emptyDescription="Não há chamados atribuídos a técnicos no período." emptyTitle="Sem dados de produtividade" items={technicianItems} />
            </article>
          )}
        </>
      ) : null}
    </div>
  )
}
