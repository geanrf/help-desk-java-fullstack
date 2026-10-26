import { priorityLabels, statusLabels } from './constants'
import type { TicketPriority, TicketStatus } from './types'

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value))
}

export function formatShortDate(value: string): string {
  return shortDateFormatter.format(new Date(value))
}

export function formatTicketCode(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

export function formatHistoryValue(fieldName: string | null, value: string | null): string | null {
  if (!value) return null
  if (fieldName === 'status' && value in statusLabels) return statusLabels[value as TicketStatus]
  if (fieldName === 'priority' && value in priorityLabels) return priorityLabels[value as TicketPriority]
  if (fieldName === 'assignee') return value.replace(/\s+\([0-9a-f-]{36}\)$/i, '')
  return value
}
