import type { UserRole } from '../../auth/types'

export type TicketStatus =
  | 'ABERTO'
  | 'EM_ATENDIMENTO'
  | 'AGUARDANDO_USUARIO'
  | 'RESOLVIDO'
  | 'FECHADO'

export type TicketPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'

export type HistoryEventType =
  | 'CRIACAO'
  | 'ATUALIZACAO'
  | 'ALTERACAO_STATUS'
  | 'ATRIBUICAO'
  | 'REMOCAO_ATRIBUICAO'
  | 'COMENTARIO'
  | 'EXCLUSAO'
  | 'RESTAURACAO'

export interface TicketUser {
  id: string
  name: string
  role: UserRole
}

export interface Category {
  id: string
  code: string
  name: string
  description: string | null
}

export interface TicketSummary {
  id: string
  title: string
  category: Category
  priority: TicketPriority
  status: TicketStatus
  requester: TicketUser
  assignee: TicketUser | null
  createdAt: string
  updatedAt: string
}

export interface Ticket extends TicketSummary {
  description: string
  version: number
  resolvedAt: string | null
}

export interface Comment {
  id: string
  content: string
  author: TicketUser
  createdAt: string
}

export interface TicketHistory {
  id: string
  eventType: HistoryEventType
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  description: string
  actor: TicketUser
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface TicketListParams {
  page: number
  size: number
  status?: TicketStatus
  priority?: TicketPriority
  categoryId?: string
  sort: string
}

export interface CreateTicketPayload {
  title: string
  description: string
  categoryId: string
  priority: TicketPriority
}

export type UpdateTicketPayload = Omit<CreateTicketPayload, 'priority'>

export interface CreateCommentPayload {
  content: string
}
