import type { UserRole } from '../auth/types'
import { cn } from '../lib/cn'

const labels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  TECNICO: 'Técnico',
  USUARIO: 'Usuário',
}

const styles: Record<UserRole, string> = {
  ADMIN: 'border-violet-400/20 bg-violet-400/10 text-violet-200',
  TECNICO: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  USUARIO: 'border-slate-600 bg-slate-800/80 text-slate-300',
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', styles[role])}>
      {labels[role]}
    </span>
  )
}
