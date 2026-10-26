import type { UserRole } from '../../auth/types'

export interface Technician {
  id: string
  name: string
  email: string
}

export interface ManagedUser {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
}

export interface UserPage {
  content: ManagedUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface UserListParams {
  page: number
  size: number
  sort: string
  search?: string
  role?: UserRole
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
}
