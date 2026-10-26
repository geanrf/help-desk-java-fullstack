import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { UserRole } from './types'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/app" replace /> : children
}

interface RoleRouteProps {
  allowedRoles: UserRole[]
  children: ReactNode
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user } = useAuth()
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/app" replace />
}
