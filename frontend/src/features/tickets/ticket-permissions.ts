import type { AuthUser } from '../../auth/types'
import { statusTransitions } from './constants'
import type { Ticket, TicketStatus } from './types'

function isRequester(ticket: Ticket, user: AuthUser): boolean {
  return ticket.requester.id === user.id
}

function isAssignee(ticket: Ticket, user: AuthUser): boolean {
  return ticket.assignee?.id === user.id
}

export function canEditTicket(ticket: Ticket, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return true
  if (user.role === 'TECNICO') return isAssignee(ticket, user) && ticket.status !== 'FECHADO'
  return isRequester(ticket, user) && ticket.status === 'ABERTO'
}

export function getAllowedStatusTargets(ticket: Ticket, user: AuthUser): TicketStatus[] {
  const targets = statusTransitions[ticket.status].filter((target) => {
    const requiresAssignee = target === 'EM_ATENDIMENTO' || target === 'AGUARDANDO_USUARIO' || target === 'RESOLVIDO'
    return !requiresAssignee || ticket.assignee !== null
  })
  if (user.role === 'ADMIN') return targets
  if (user.role === 'TECNICO') return isAssignee(ticket, user) ? targets : []
  if (isRequester(ticket, user) && ticket.status === 'RESOLVIDO') {
    return targets.filter((status) => status === 'FECHADO' || status === 'EM_ATENDIMENTO')
  }
  return []
}

export function canChangePriority(ticket: Ticket, user: AuthUser): boolean {
  if (ticket.status === 'FECHADO') return false
  return user.role === 'ADMIN' || (user.role === 'TECNICO' && isAssignee(ticket, user))
}

export function canManageAssignment(ticket: Ticket, user: AuthUser): boolean {
  return user.role === 'ADMIN' && ticket.status !== 'FECHADO'
}

export function canRemoveAssignment(ticket: Ticket, user: AuthUser): boolean {
  return user.role === 'ADMIN' && ticket.status === 'ABERTO' && ticket.assignee !== null
}

export function canComment(ticket: Ticket, user: AuthUser): boolean {
  if (ticket.status === 'FECHADO') return false
  if (user.role === 'ADMIN') return true
  if (user.role === 'TECNICO') return isAssignee(ticket, user)
  return isRequester(ticket, user)
}

export function canDeleteTicket(ticket: Ticket, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return true
  return user.role === 'USUARIO' && isRequester(ticket, user) && ticket.status === 'ABERTO'
}
