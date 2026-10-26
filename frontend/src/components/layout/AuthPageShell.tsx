import type { ReactNode } from 'react'
import { Brand } from '../Brand'
import { Icon } from '../ui/Icon'

const highlights = [
  'Acesso protegido por perfil e sessão JWT',
  'Fluxo rastreável do chamado à resolução',
  'Experiência responsiva para toda a equipe',
]

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d18] text-slate-100">
      <div aria-hidden="true" className="absolute inset-0 auth-grid opacity-35" />
      <div aria-hidden="true" className="absolute -left-32 top-24 size-96 rounded-full bg-cyan-400/6 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r border-slate-800/70 px-12 py-10 lg:flex lg:flex-col xl:px-20">
          <Brand link={false} />
          <div className="my-auto max-w-xl pb-10">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">Operações de TI</p>
            <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.04em] text-white xl:text-6xl">
              Atendimento claro.
              <span className="block text-slate-500">Equipes em sintonia.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
              Uma central profissional para organizar solicitações, responsabilidades e cada etapa do suporte técnico.
            </p>

            <ul className="mt-10 space-y-4">
              {highlights.map((highlight) => (
                <li className="flex items-center gap-3 text-sm text-slate-300" key={highlight}>
                  <span className="grid size-7 place-items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                    <Icon className="size-3.5" name="check" />
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-slate-600">Help Desk · Java Full Stack</p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Brand link={false} />
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
