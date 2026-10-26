import axios from 'axios'

interface ApiErrorBody {
  detail?: string
  message?: string
  errors?: Record<string, string>
}

export interface ParsedApiError {
  message: string
  fields: Record<string, string>
}

export function parseApiError(error: unknown, fallback: string): ParsedApiError {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return { message: fallback, fields: {} }
  }

  if (!error.response) {
    return {
      message: 'Não foi possível conectar ao servidor. Verifique se a API está disponível.',
      fields: {},
    }
  }

  const body = error.response.data
  return {
    message: body?.detail || body?.message || fallback,
    fields: body?.errors ?? {},
  }
}
