import { NavLink } from 'react-router-dom'
import type { AuthUser, UserRole } from '../../auth/types'
import { cn } from '../../lib/cn'
import { Brand } from '../Brand'
import { Icon, type IconName } from '../ui/Icon'

interface NavigationItem {
  label: string
  to: string
  icon: IconName
  roles: UserRole[]
}

const navigation: NavigationItem[] = [
  { label: 'Visão geral', to: '/app', icon: 'home', roles: ['ADMIN', 'TECNICO', 'USUARIO'] },
  { label: 'Chamados', to: '/app/tickets', icon: 'ticket', roles: ['ADMIN', 'TECNICO', 'USUARIO'] },
  { label: 'Dashboard', to: '/app/dashboard', icon: 'chart', roles: ['ADMIN', 'TECNICO'] },
  { label: 'Usuários', to: '/app/users', icon: 'users', roles: ['ADMIN'] },
]

interface SidebarProps {
  user: AuthUser
  open: boolean
  onClose: () => void
}

export function Sidebar({ user, open, onClose }: SidebarProps) {
  const visibleNavigation = navigation.filter((item) => item.roles.includes(user.role))

  return (
    <>
      <button
        aria-label="Fechar menu"
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition lg:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        onClick={onClose}
        type="button"
      />

      <aside
        aria-label="Navegação principal"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800/80 bg-[#080d18] px-4 py-5 transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Brand />
          <button
            aria-label="Fechar menu"
            className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <Icon className="size-5" name="x" />
          </button>
        </div>

        <div className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600">
          Espaço de trabalho
        </div>
        <nav className="mt-3 space-y-1">
          {visibleNavigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-inset ring-cyan-400/15'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100',
                )
              }
              end={item.to === '/app'}
              key={item.to}
              onClick={onClose}
              to={item.to}
            >
              <Icon className="size-5 shrink-0" name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/55 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.65)]" />
            Sessão protegida
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Sua sessão utiliza autenticação JWT e expira automaticamente.
          </p>
        </div>
      </aside>
    </>
  )
}
