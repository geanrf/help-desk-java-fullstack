import type { HistoryEventType, TicketPriority, TicketStatus } from './types'

export const ticketStatuses: TicketStatus[] = [
  'ABERTO',
  'EM_ATENDIMENTO',
  'AGUARDANDO_USUARIO',
  'RESOLVIDO',
  'FECHADO',
]

export const ticketPriorities: TicketPriority[] = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']

export const statusLabels: Record<TicketStatus, string> = {
  ABERTO: 'Aberto',
  EM_ATENDIMENTO: 'Em atendimento',
  AGUARDANDO_USUARIO: 'Aguardando usuário',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
}

export const priorityLabels: Record<TicketPriority, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
}

export const historyEventLabels: Record<HistoryEventType, string> = {
  CRIACAO: 'Criação',
  ATUALIZACAO: 'Atualização',
  ALTERACAO_STATUS: 'Alteração de status',
  ATRIBUICAO: 'Atribuição',
  REMOCAO_ATRIBUICAO: 'Remoção de atribuição',
  COMENTARIO: 'Comentário',
  EXCLUSAO: 'Exclusão',
  RESTAURACAO: 'Restauração',
}

export const statusTransitions: Record<TicketStatus, TicketStatus[]> = {
  ABERTO: ['EM_ATENDIMENTO'],
  EM_ATENDIMENTO: ['AGUARDANDO_USUARIO', 'RESOLVIDO'],
  AGUARDANDO_USUARIO: ['EM_ATENDIMENTO', 'RESOLVIDO'],
  RESOLVIDO: ['EM_ATENDIMENTO', 'FECHADO'],
  FECHADO: [],
}

export const ticketSortOptions = [
  { value: 'createdAt,desc', label: 'Mais recentes' },
  { value: 'createdAt,asc', label: 'Mais antigos' },
  { value: 'updatedAt,desc', label: 'Atualizados recentemente' },
  { value: 'priority,desc', label: 'Maior prioridade' },
  { value: 'title,asc', label: 'Título de A a Z' },
] as const
