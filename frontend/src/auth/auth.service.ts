import { apiClient } from '../api/client'
import type {
  LoginCredentials,
  LoginResponse,
  RegisteredUser,
  RegisterUserPayload,
} from './types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials)
    return data
  },

  async register(payload: RegisterUserPayload): Promise<RegisteredUser> {
    const { data } = await apiClient.post<RegisteredUser>('/auth/register', payload)
    return data
  },
}
