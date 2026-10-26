export type UserRole = 'ADMIN' | 'TECNICO' | 'USUARIO'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: AuthUser
}

export interface RegisterUserPayload {
  name: string
  email: string
  password: string
}

export interface RegisteredUser {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
}

export interface AuthSession {
  accessToken: string
  expiresAt: number
  user: AuthUser
}
