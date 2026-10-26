import { apiClient } from '../../api/client'
import type {
  Category,
  Comment,
  CreateCommentPayload,
  CreateTicketPayload,
  PageResponse,
  Ticket,
  TicketHistory,
  TicketListParams,
  TicketPriority,
  TicketStatus,
  TicketSummary,
  UpdateTicketPayload,
} from './types'

export const ticketsService = {
  async list(params: TicketListParams, signal?: AbortSignal): Promise<PageResponse<TicketSummary>> {
    const { data } = await apiClient.get<PageResponse<TicketSummary>>('/tickets', { params, signal })
    return data
  },

  async findById(id: string, signal?: AbortSignal): Promise<Ticket> {
    const { data } = await apiClient.get<Ticket>(`/tickets/${id}`, { signal })
    return data
  },

  async create(payload: CreateTicketPayload): Promise<Ticket> {
    const { data } = await apiClient.post<Ticket>('/tickets', payload)
    return data
  },

  async update(id: string, payload: UpdateTicketPayload): Promise<Ticket> {
    const { data } = await apiClient.put<Ticket>(`/tickets/${id}`, payload)
    return data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/tickets/${id}`)
  },

  async listCategories(signal?: AbortSignal): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories', { signal })
    return data
  },

  async changeStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/status`, { status })
    return data
  },

  async changePriority(id: string, priority: TicketPriority): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/priority`, { priority })
    return data
  },

  async assignTechnician(id: string, technicianId: string): Promise<Ticket> {
    const { data } = await apiClient.put<Ticket>(`/tickets/${id}/assignee`, { technicianId })
    return data
  },

  async removeTechnician(id: string): Promise<Ticket> {
    const { data } = await apiClient.delete<Ticket>(`/tickets/${id}/assignee`)
    return data
  },

  async listComments(
    id: string,
    page: number,
    size: number,
    signal?: AbortSignal,
  ): Promise<PageResponse<Comment>> {
    const { data } = await apiClient.get<PageResponse<Comment>>(`/tickets/${id}/comments`, {
      params: { page, size },
      signal,
    })
    return data
  },

  async createComment(id: string, payload: CreateCommentPayload): Promise<Comment> {
    const { data } = await apiClient.post<Comment>(`/tickets/${id}/comments`, payload)
    return data
  },

  async listHistory(
    id: string,
    page: number,
    size: number,
    signal?: AbortSignal,
  ): Promise<PageResponse<TicketHistory>> {
    const { data } = await apiClient.get<PageResponse<TicketHistory>>(`/tickets/${id}/history`, {
      params: { page, size },
      signal,
    })
    return data
  },
}
