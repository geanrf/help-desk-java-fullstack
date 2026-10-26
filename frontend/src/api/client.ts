import axios from 'axios'
import { clearAuthSession, getAccessToken } from '../auth/auth-storage'

export const AUTH_UNAUTHORIZED_EVENT = 'help-desk:auth-unauthorized'

const baseURL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL,
  timeout: 12_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const endpoint = error.config?.url ?? ''
      const isPublicAuthRequest = endpoint.includes('/auth/login') || endpoint.includes('/auth/register')

      if (!isPublicAuthRequest) {
        clearAuthSession()
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
      }
    }

    return Promise.reject(error)
  },
)
