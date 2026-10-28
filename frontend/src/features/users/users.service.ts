import { apiClient } from '../../api/client'
import type { CreateUserPayload, ManagedUser, Technician, UpdateUserPayload, UserListParams, UserPage } from './types'

export const usersService = {
  async list(params: UserListParams, signal?: AbortSignal): Promise<UserPage> {
    const { data } = await apiClient.get<UserPage>('/users', { params, signal })
    return data
  },

  async create(payload: CreateUserPayload): Promise<ManagedUser> {
    const { data } = await apiClient.post<ManagedUser>('/users', payload)
    return data
  },

  async update(id: string, payload: UpdateUserPayload): Promise<ManagedUser> {
    const { data } = await apiClient.put<ManagedUser>(`/users/${id}`, payload)
    return data
  },

  async listActiveTechnicians(signal?: AbortSignal): Promise<Technician[]> {
    const { data } = await apiClient.get<Technician[]>('/users/technicians', { signal })
    return data
  },
}
