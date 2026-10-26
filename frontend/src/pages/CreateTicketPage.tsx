import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { parseApiError } from '../api/errors'
import { Alert } from '../components/ui/Alert'
import { Icon } from '../components/ui/Icon'
import { TicketForm } from '../features/tickets/components/TicketForm'
import { ticketsService } from '../features/tickets/tickets.service'
import type { Category } from '../features/tickets/types'

export function CreateTicketPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoadingCategories(true)
    setCategoriesError('')
    ticketsService.listCategories(controller.signal)
      .then(setCategories)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setCategoriesError(parseApiError(requestError, 'Não foi possível carregar as categorias.').message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingCategories(false)
      })
    return () => controller.abort()
  }, [reloadKey])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white" to="/app/tickets">
          <Icon className="size-4" name="arrow-left" /> Voltar aos chamados
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">Nova solicitação</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Abrir chamado</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Forneça informações claras para agilizar o atendimento da equipe.</p>
      </div>

      {categoriesError && (
        <Alert tone="error"><div className="flex flex-wrap items-center gap-3"><span>{categoriesError}</span><button className="font-semibold underline" onClick={() => setReloadKey((value) => value + 1)} type="button">Tentar novamente</button></div></Alert>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
        <TicketForm
          categories={categories}
          isCategoriesLoading={isLoadingCategories}
          onCancel={() => navigate('/app/tickets')}
          onSubmit={async (values) => {
            const ticket = await ticketsService.create(values)
            navigate(`/app/tickets/${ticket.id}`, { replace: true, state: { message: 'Chamado aberto com sucesso.' } })
          }}
          submitLabel="Abrir chamado"
        />
      </section>
    </div>
  )
}
