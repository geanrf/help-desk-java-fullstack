import type { AuthSession, UserRole } from './types'

const STORAGE_KEY = 'help-desk:auth-session'

const validRoles: UserRole[] = ['ADMIN', 'TECNICO', 'USUARIO']

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false

  const session = value as Partial<AuthSession>
  return Boolean(
    typeof session.accessToken === 'string' &&
      typeof session.expiresAt === 'number' &&
      session.user &&
      typeof session.user.id === 'string' &&
      typeof session.user.name === 'string' &&
      typeof session.user.email === 'string' &&
      validRoles.includes(session.user.role as UserRole),
  )
}

export function readAuthSession(): AuthSession | null {
  try {
    const rawSession = sessionStorage.getItem(STORAGE_KEY)
    if (!rawSession) return null

    const session: unknown = JSON.parse(rawSession)
    if (!isAuthSession(session) || session.expiresAt <= Date.now()) {
      clearAuthSession()
      return null
    }

    return session
  } catch {
    clearAuthSession()
    return null
  }
}

export function writeAuthSession(session: AuthSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function getAccessToken(): string | null {
  return readAuthSession()?.accessToken ?? null
}
