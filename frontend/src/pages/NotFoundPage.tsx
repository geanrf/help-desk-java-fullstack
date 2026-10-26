import { Link } from 'react-router-dom'
import { Brand } from '../components/Brand'

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080d18] px-4 text-center text-slate-100">
      <div>
        <div className="mb-10 flex justify-center"><Brand link={false} /></div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">Erro 404</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Página não encontrada</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-400">O endereço informado não existe ou não está disponível para sua sessão.</p>
        <Link className="mt-8 inline-flex min-h-11 items-center rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950" to="/">
          Ir para o início
        </Link>
      </div>
    </main>
  )
}
