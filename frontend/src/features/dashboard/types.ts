import type { TicketPriority, TicketStatus } from '../tickets/types'

export interface DashboardPeriod {
  from: string | null
  to: string | null
}

export interface StatusCount {
  status: TicketStatus
  total: number
}

export interface PriorityCount {
  priority: TicketPriority
  total: number
}

export interface CategoryCount {
  categoryId: string
  code: string
  name: string
  total: number
}

export interface TechnicianCount {
  technicianId: string
  name: string
  active: boolean
  total: number
}

export interface DashboardSummary {
  period: DashboardPeriod
  totalActiveTickets: number
  openTickets: number
  pendingTickets: number
  resolvedTickets: number
  closedTickets: number
  completedTickets: number
  byStatus: StatusCount[]
  byPriority: PriorityCount[]
  byCategory: CategoryCount[]
  byTechnician: TechnicianCount[]
}

export interface DashboardFilters {
  from?: string
  to?: string
}
