import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AUTH_UNAUTHORIZED_EVENT } from '../api/client'
import { authService } from './auth.service'
import { clearAuthSession, readAuthSession, writeAuthSession } from './auth-storage'
import type { AuthSession, AuthUser, LoginCredentials } from './types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession())

  const logout = useCallback(() => {
    clearAuthSession()
    setSession(null)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials)
    const nextSession: AuthSession = {
      accessToken: response.accessToken,
      expiresAt: Date.now() + response.expiresIn * 1_000,
      user: response.user,
    }

    writeAuthSession(nextSession)
    setSession(nextSession)
  }, [])

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, logout)
  }, [logout])

  useEffect(() => {
    if (!session) return

    const remainingTime = session.expiresAt - Date.now()
    if (remainingTime <= 0) {
      logout()
      return
    }

    const timer = window.setTimeout(logout, Math.min(remainingTime, 2_147_483_647))
    return () => window.clearTimeout(timer)
  }, [logout, session])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [login, logout, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
