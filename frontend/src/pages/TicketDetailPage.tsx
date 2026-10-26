import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { parseApiError } from '../api/errors'
import { useAuth } from '../auth/AuthContext'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { SelectField } from '../components/ui/SelectField'
import { Spinner } from '../components/ui/Spinner'
import { PriorityBadge } from '../features/tickets/components/PriorityBadge'
import { StatusBadge } from '../features/tickets/components/StatusBadge'
import { TicketForm } from '../features/tickets/components/TicketForm'
import { TicketTimeline } from '../features/tickets/components/TicketTimeline'
import { priorityLabels, statusLabels, ticketPriorities } from '../features/tickets/constants'
import { formatDateTime, formatTicketCode } from '../features/tickets/formatters'
import {
  canChangePriority,
  canDeleteTicket,
  canEditTicket,
  canManageAssignment,
  canRemoveAssignment,
  getAllowedStatusTargets,
} from '../features/tickets/ticket-permissions'
import { ticketsService } from '../features/tickets/tickets.service'
import type { Category, Ticket, TicketPriority, TicketStatus } from '../features/tickets/types'
import type { Technician } from '../features/users/types'
import { usersService } from '../features/users/users.service'

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState((location.state as { message?: string } | null)?.message ?? '')
  const [activeAction, setActiveAction] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [timelineRefresh, setTimelineRefresh] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [unassignOpen, setUnassignOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('')
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority>('MEDIA')
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isTechniciansLoading, setIsTechniciansLoading] = useState(user?.role === 'ADMIN')
  const [techniciansError, setTechniciansError] = useState('')
  const [techniciansReloadKey, setTechniciansReloadKey] = useState(0)
  const [technicianId, setTechnicianId] = useState('')
  const [technicianError, setTechnicianError] = useState('')

  useEffect(() => {
    if (!ticketId) return
    const controller = new AbortController()
    setIsLoading(true)
    setError('')
    ticketsService.findById(ticketId, controller.signal)
      .then(setTicket)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(parseApiError(requestError, 'Não foi possível carregar o chamado.').message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey, ticketId])

  useEffect(() => {
    const controller = new AbortController()
    ticketsService.listCategories(controller.signal).then(setCategories).catch(() => undefined)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    const controller = new AbortController()
    setIsTechniciansLoading(true)
    setTechniciansError('')
    usersService.listActiveTechnicians(controller.signal)
      .then(setTechnicians)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setTechniciansError(parseApiError(requestError, 'Não foi possível carregar os técnicos ativos.').message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsTechniciansLoading(false)
      })
    return () => controller.abort()
  }, [techniciansReloadKey, user?.role])

  useEffect(() => {
    if (!ticket || !user) return
    const allowedTargets = getAllowedStatusTargets(ticket, user)
    setSelectedStatus(allowedTargets[0] ?? '')
    setSelectedPriority(ticket.priority)
  }, [ticket, user])

  useEffect(() => {
    const assignedId = ticket?.assignee?.id
    setTechnicianId(assignedId && technicians.some((technician) => technician.id === assignedId) ? assignedId : '')
  }, [technicians, ticket?.assignee?.id])

  if (!user) return null

  async function runTicketAction(
    actionName: string,
    operation: () => Promise<Ticket>,
    successMessage: string,
  ) {
    setActiveAction(actionName)
    setActionError('')
    setSuccess('')
    try {
      const updatedTicket = await operation()
      setTicket(updatedTicket)
      setSuccess(successMessage)
      setTimelineRefresh((value) => value + 1)
    } catch (requestError) {
      setActionError(parseApiError(requestError, 'Não foi possível concluir a operação.').message)
      throw requestError
    } finally {
      setActiveAction('')
    }
  }

  async function handleAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ticket) return
    if (!technicianId) {
      setTechnicianError('Selecione um técnico ativo.')
      return
    }
    setTechnicianError('')
    try {
      await runTicketAction('assign', () => ticketsService.assignTechnician(ticket.id, technicianId), 'Técnico atribuído com sucesso.')
    } catch {
      // O erro já foi apresentado pelo executor da ação.
    }
  }

  async function handleUnassign() {
    if (!ticket) return
    try {
      await runTicketAction('unassign', () => ticketsService.removeTechnician(ticket.id), 'Atribuição removida com sucesso.')
      setTechnicianId('')
      setUnassignOpen(false)
    } catch {
      setUnassignOpen(false)
    }
  }

  async function handleDelete() {
    if (!ticket) return
    setActiveAction('delete')
    setActionError('')
    try {
      await ticketsService.remove(ticket.id)
      navigate('/app/tickets', { replace: true, state: { message: 'Chamado excluído com sucesso.' } })
    } catch (requestError) {
      setActionError(parseApiError(requestError, 'Não foi possível excluir o chamado.').message)
      setDeleteOpen(false)
      setActiveAction('')
    }
  }

  if (isLoading) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="flex items-center gap-3 text-sm text-slate-400"><Spinner className="size-5" /> Carregando chamado...</div></div>
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-xl space-y-5 py-12">
        <Alert tone="error">{error || 'Chamado não encontrado.'}</Alert>
        <div className="flex gap-3"><Button onClick={() => setReloadKey((value) => value + 1)} type="button">Tentar novamente</Button><Button onClick={() => navigate('/app/tickets')} type="button" variant="secondary">Voltar</Button></div>
      </div>
    )
  }

  const allowedStatusTargets = getAllowedStatusTargets(ticket, user)
  const showEdit = canEditTicket(ticket, user)
  const showPriority = canChangePriority(ticket, user)
  const showAssignment = canManageAssignment(ticket, user)
  const showUnassign = canRemoveAssignment(ticket, user)
  const showDelete = canDeleteTicket(ticket, user)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white" to="/app/tickets"><Icon className="size-4" name="arrow-left" /> Voltar aos chamados</Link>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold tracking-wider text-cyan-400">{formatTicketCode(ticket.id)}</span><StatusBadge status={ticket.status} /><PriorityBadge priority={ticket.priority} /></div>
            <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">{ticket.title}</h2>
            <p className="mt-2 text-sm text-slate-500">Aberto por <span className="text-slate-300">{ticket.requester.name}</span> em {formatDateTime(ticket.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {showEdit && <Button onClick={() => setEditOpen(true)} type="button" variant="secondary"><Icon className="size-4" name="edit" />Editar</Button>}
            {showDelete && <Button onClick={() => setDeleteOpen(true)} type="button" variant="danger"><Icon className="size-4" name="trash" />Excluir</Button>}
          </div>
        </div>
      </div>

      {success && <Alert tone="success">{success}</Alert>}
      {actionError && <Alert tone="error">{actionError}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Icon className="size-4 text-cyan-300" name="ticket" />Descrição</div>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">{ticket.description}</p>
          </section>
          <TicketTimeline refreshToken={timelineRefresh} ticket={ticket} user={user} />
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-sm font-semibold text-white">Informações</h3>
            <dl className="mt-4 space-y-4 text-sm">
              <div><dt className="text-xs text-slate-500">Categoria</dt><dd className="mt-1 font-medium text-slate-200">{ticket.category.name}</dd></div>
              <div><dt className="text-xs text-slate-500">Solicitante</dt><dd className="mt-1 font-medium text-slate-200">{ticket.requester.name}</dd></div>
              <div><dt className="text-xs text-slate-500">Técnico responsável</dt><dd className="mt-1 font-medium text-slate-200">{ticket.assignee?.name ?? 'Não atribuído'}</dd></div>
              <div><dt className="text-xs text-slate-500">Última atualização</dt><dd className="mt-1 font-medium text-slate-200">{formatDateTime(ticket.updatedAt)}</dd></div>
              {ticket.resolvedAt && <div><dt className="text-xs text-slate-500">Resolvido em</dt><dd className="mt-1 font-medium text-slate-200">{formatDateTime(ticket.resolvedAt)}</dd></div>}
            </dl>
          </section>

          {allowedStatusTargets.length > 0 && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <SelectField label="Alterar status" name="status" onChange={(event) => setSelectedStatus(event.target.value as TicketStatus)} value={selectedStatus}>
                {allowedStatusTargets.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
              </SelectField>
              <Button className="mt-3" fullWidth isLoading={activeAction === 'status'} onClick={() => selectedStatus && runTicketAction('status', () => ticketsService.changeStatus(ticket.id, selectedStatus), `Status alterado para ${statusLabels[selectedStatus]}.`).catch(() => undefined)} type="button" variant="secondary">Atualizar status</Button>
            </section>
          )}

          {showPriority && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <SelectField label="Alterar prioridade" name="priority" onChange={(event) => setSelectedPriority(event.target.value as TicketPriority)} value={selectedPriority}>
                {ticketPriorities.map((priority) => <option key={priority} value={priority}>{priorityLabels[priority]}</option>)}
              </SelectField>
              <Button className="mt-3" disabled={selectedPriority === ticket.priority} fullWidth isLoading={activeAction === 'priority'} onClick={() => runTicketAction('priority', () => ticketsService.changePriority(ticket.id, selectedPriority), `Prioridade alterada para ${priorityLabels[selectedPriority]}.`).catch(() => undefined)} type="button" variant="secondary">Atualizar prioridade</Button>
            </section>
          )}

          {showAssignment && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><Icon className="size-4 text-cyan-300" name="user-check" />Atribuição técnica</div>
              {techniciansError && (
                <div className="mb-4">
                  <Alert tone="error">{techniciansError}</Alert>
                  <Button className="mt-2" fullWidth onClick={() => setTechniciansReloadKey((value) => value + 1)} type="button" variant="ghost">Tentar novamente</Button>
                </div>
              )}
              <form onSubmit={handleAssignment}>
                <SelectField
                  disabled={isTechniciansLoading || Boolean(techniciansError) || technicians.length === 0}
                  error={technicianError}
                  label="Técnico ativo"
                  name="technicianId"
                  onChange={(event) => {
                    setTechnicianId(event.target.value)
                    setTechnicianError('')
                  }}
                  value={technicianId}
                >
                  <option value="">{isTechniciansLoading ? 'Carregando técnicos...' : 'Selecione um técnico'}</option>
                  {technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.name} — {technician.email}</option>)}
                </SelectField>
                {!isTechniciansLoading && !techniciansError && technicians.length === 0 && <p className="mt-2 text-xs leading-5 text-slate-500" role="status">Nenhum técnico ativo está disponível para atribuição.</p>}
                <Button className="mt-3" disabled={isTechniciansLoading || Boolean(techniciansError) || !technicianId || ticket.assignee?.id === technicianId} fullWidth isLoading={activeAction === 'assign'} type="submit" variant="secondary">{ticket.assignee ? 'Reatribuir técnico' : 'Atribuir técnico'}</Button>
              </form>
              {showUnassign && <Button className="mt-2" fullWidth onClick={() => setUnassignOpen(true)} type="button" variant="ghost">Remover atribuição</Button>}
            </section>
          )}
        </aside>
      </div>

      <Modal description="Altere somente os dados permitidos pela API." onClose={() => setEditOpen(false)} open={editOpen} title="Editar chamado">
        <TicketForm
          categories={categories}
          includePriority={false}
          initialValues={{ title: ticket.title, description: ticket.description, categoryId: ticket.category.id, priority: ticket.priority }}
          onCancel={() => setEditOpen(false)}
          onSubmit={async (values) => {
            const updatedTicket = await ticketsService.update(ticket.id, { title: values.title, description: values.description, categoryId: values.categoryId })
            setTicket(updatedTicket)
            setEditOpen(false)
            setSuccess('Chamado atualizado com sucesso.')
            setTimelineRefresh((value) => value + 1)
          }}
          submitLabel="Salvar alterações"
        />
      </Modal>

      <ConfirmDialog confirmLabel="Excluir chamado" description="O chamado será excluído logicamente e deixará de aparecer nas consultas." isLoading={activeAction === 'delete'} onCancel={() => setDeleteOpen(false)} onConfirm={handleDelete} open={deleteOpen} title="Excluir este chamado?" />
      <ConfirmDialog confirmLabel="Remover atribuição" description="O chamado voltará a ficar sem técnico responsável. Esta ação só é permitida enquanto estiver aberto." isLoading={activeAction === 'unassign'} onCancel={() => setUnassignOpen(false)} onConfirm={handleUnassign} open={unassignOpen} title="Remover técnico responsável?" />
    </div>
  )
}
