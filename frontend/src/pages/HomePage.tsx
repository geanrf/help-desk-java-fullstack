import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { UserRole } from '../auth/types'
import { RoleBadge } from '../components/RoleBadge'
import { Icon, type IconName } from '../components/ui/Icon'

interface AccessCard {
  icon: IconName
  title: string
  description: string
  roles: UserRole[]
  to: string
}

const accessCards: AccessCard[] = [
  {
    icon: 'ticket',
    title: 'Chamados',
    description: 'Acompanhe solicitações, interações e o histórico completo de atendimento.',
    roles: ['ADMIN', 'TECNICO', 'USUARIO'],
    to: '/app/tickets',
  },
  {
    icon: 'chart',
    title: 'Indicadores',
    description: 'Visualize a operação de suporte conforme o escopo permitido ao seu perfil.',
    roles: ['ADMIN', 'TECNICO'],
    to: '/app/dashboard',
  },
  {
    icon: 'users',
    title: 'Gestão de acesso',
    description: 'Administre usuários, técnicos e permissões com segurança.',
    roles: ['ADMIN'],
    to: '/app/users',
  },
]

const roleDescription: Record<UserRole, string> = {
  ADMIN: 'Você possui acesso administrativo à operação do Help Desk.',
  TECNICO: 'Você possui acesso à fila de atendimento e aos seus indicadores.',
  USUARIO: 'Você pode abrir e acompanhar suas solicitações de suporte.',
}

export function HomePage() {
  const { user } = useAuth()
  if (!user) return null

  const firstName = user.name.trim().split(' ')[0]
  const visibleCards = accessCards.filter((card) => card.roles.includes(user.role))

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/55 p-6 sm:p-8">
        <div aria-hidden="true" className="absolute right-0 top-0 size-52 translate-x-16 -translate-y-20 rounded-full bg-cyan-400/8 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-400" />
              Sessão autenticada
            </span>
            <RoleBadge role={user.role} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Olá, {firstName}.</h2>
          <p className="mt-3 text-base leading-7 text-slate-400">{roleDescription[user.role]}</p>
        </div>
      </section>

      <section aria-labelledby="workspace-heading">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">Seu espaço</p>
          <h2 className="mt-2 text-xl font-semibold text-white" id="workspace-heading">Recursos disponíveis</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCards.map((card) => (
            <article className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900/70" key={card.title}>
              <div className="grid size-10 place-items-center rounded-xl border border-cyan-400/15 bg-cyan-400/8 text-cyan-300">
                <Icon className="size-5" name={card.icon} />
              </div>
              <h3 className="mt-5 text-base font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{card.description}</p>
              <Link className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200" to={card.to}>Acessar módulo <Icon className="size-3.5" name="chevron-right" /></Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
