import { useLocation, useNavigate } from 'react-router-dom'
import type { AuthUser } from '../../auth/types'
import { Brand } from '../Brand'
import { RoleBadge } from '../RoleBadge'
import { Icon } from '../ui/Icon'

const pageTitles: Record<string, string> = {
  '/app': 'Visão geral',
  '/app/tickets': 'Chamados',
  '/app/dashboard': 'Dashboard',
  '/app/users': 'Usuários',
}

function getPageTitle(pathname: string): string {
  if (pathname === '/app/tickets/new') return 'Novo chamado'
  if (pathname.startsWith('/app/tickets/')) return 'Detalhes do chamado'
  return pageTitles[pathname] ?? 'Central de atendimento'
}

interface HeaderProps {
  user: AuthUser
  onMenuOpen: () => void
  onLogout: () => void
}

export function Header({ user, onMenuOpen, onLogout }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  function handleLogout() {
    onLogout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/70 bg-[#080d18]/90 backdrop-blur-xl">
      <div className="flex h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Abrir menu"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-800 text-slate-300 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
            onClick={onMenuOpen}
            type="button"
          >
            <Icon className="size-5" name="menu" />
          </button>
          <div className="sm:hidden">
            <Brand compact />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">Help Desk</p>
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">
              {getPageTitle(location.pathname)}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-44 truncate text-sm font-medium text-slate-100">{user.name}</p>
            <RoleBadge role={user.role} />
          </div>
          <div
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-cyan-200"
          >
            {initials || 'US'}
          </div>
          <button
            aria-label="Sair da conta"
            className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            onClick={handleLogout}
            title="Sair"
            type="button"
          >
            <Icon className="size-5" name="logout" />
          </button>
        </div>
      </div>
    </header>
  )
}
