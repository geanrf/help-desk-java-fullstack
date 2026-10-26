import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseApiError } from '../api/errors'
import type { UserRole } from '../auth/types'
import { RoleBadge } from '../components/RoleBadge'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { SelectField } from '../components/ui/SelectField'
import { Spinner } from '../components/ui/Spinner'
import { TextField } from '../components/ui/TextField'
import { AccountStatusBadge } from '../features/users/components/AccountStatusBadge'
import { CreateUserForm } from '../features/users/components/CreateUserForm'
import { usersService } from '../features/users/users.service'
import type { ManagedUser, UserPage } from '../features/users/types'

const PAGE_SIZE = 10
const userRoles: UserRole[] = ['ADMIN', 'TECNICO', 'USUARIO']
const createdAtFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function isUserRole(value: string | null): value is UserRole {
  return userRoles.includes(value as UserRole)
}

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState<UserPage | null>(null)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const pageParam = Number(searchParams.get('page') ?? '0')
  const page = Number.isInteger(pageParam) && pageParam >= 0 ? pageParam : 0
  const search = searchParams.get('search')?.trim() || undefined
  const roleParam = searchParams.get('role')
  const role = isUserRole(roleParam) ? roleParam : undefined
  const hasFilters = Boolean(search || role)

  useEffect(() => {
    setSearchInput(search ?? '')
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError('')
    usersService.list(
      { page, size: PAGE_SIZE, sort: 'createdAt,desc', search, role },
      controller.signal,
    )
      .then(setUsers)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(parseApiError(requestError, 'Não foi possível carregar os usuários.').message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [page, reloadKey, role, search])

  function updateFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    next.delete('page')
    setSearchParams(next)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateFilter('search', searchInput.trim())
  }

  function setPage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    if (nextPage === 0) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  function clearFilters() {
    setSearchInput('')
    setSearchParams(new URLSearchParams())
  }

  function handleCreated(createdUser: ManagedUser) {
    setCreateOpen(false)
    setSuccess(`${createdUser.name} foi cadastrado com sucesso.`)
    if (page === 0) setReloadKey((value) => value + 1)
    else setPage(0)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">Administração</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Gestão de usuários</h2>
          <p className="mt-2 text-sm text-slate-400">Consulte contas e conceda o perfil adequado a novos colaboradores.</p>
        </div>
        <Button onClick={() => { setSuccess(''); setCreateOpen(true) }} type="button">
          <Icon className="size-4" name="plus" />
          Novo usuário
        </Button>
      </section>

      {success && <Alert tone="success">{success}</Alert>}

      <section aria-label="Filtros de usuários" className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Icon className="size-4 text-cyan-300" name="filter" />
          Busca e filtros
        </div>
        <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px_auto] lg:items-end" onSubmit={handleSearch}>
          <TextField
            label="Nome ou e-mail"
            leadingIcon={<Icon className="size-4" name="search" />}
            name="userSearch"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar usuário..."
            value={searchInput}
          />
          <SelectField label="Perfil" name="role" onChange={(event) => updateFilter('role', event.target.value)} value={role ?? ''}>
            <option value="">Todos os perfis</option>
            <option value="ADMIN">Administrador</option>
            <option value="TECNICO">Técnico</option>
            <option value="USUARIO">Usuário</option>
          </SelectField>
          <Button type="submit" variant="secondary"><Icon className="size-4" name="search" />Buscar</Button>
        </form>
        {hasFilters && <button className="mt-4 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200" onClick={clearFilters} type="button">Limpar filtros</button>}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 sm:px-5">
          <div>
            <h3 className="font-semibold text-white">Contas cadastradas</h3>
            <p className="mt-1 text-xs text-slate-500">{users ? `${users.totalElements} usuários encontrados` : 'Consultando a API...'}</p>
          </div>
          <button aria-label="Atualizar usuários" className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white" onClick={() => setReloadKey((value) => value + 1)} type="button">
            <Icon className="size-4" name="refresh" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center"><div className="flex items-center gap-3 text-sm text-slate-400"><Spinner className="size-5" /> Carregando usuários...</div></div>
        ) : error ? (
          <div className="p-5"><Alert tone="error"><div className="flex flex-wrap items-center gap-3"><span>{error}</span><button className="font-semibold underline" onClick={() => setReloadKey((value) => value + 1)} type="button">Tentar novamente</button></div></Alert></div>
        ) : !users || users.content.length === 0 ? (
          <EmptyState
            action={hasFilters ? <button className="text-sm font-semibold text-cyan-300" onClick={clearFilters} type="button">Remover filtros</button> : undefined}
            description={hasFilters ? 'Nenhuma conta corresponde aos critérios informados.' : 'Cadastre o primeiro usuário administrativo.'}
            icon="users"
            title="Nenhum usuário encontrado"
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-950/35 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  <tr><th className="px-5 py-3 font-semibold">Usuário</th><th className="px-4 py-3 font-semibold">Perfil</th><th className="px-4 py-3 font-semibold">Situação</th><th className="px-5 py-3 font-semibold">Cadastrado em</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {users.content.map((managedUser) => (
                    <tr className="transition hover:bg-slate-800/25" key={managedUser.id}>
                      <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-100">{managedUser.name}</p><p className="mt-1 text-xs text-slate-500">{managedUser.email}</p></td>
                      <td className="px-4 py-4"><RoleBadge role={managedUser.role} /></td>
                      <td className="px-4 py-4"><AccountStatusBadge active={managedUser.active} /></td>
                      <td className="px-5 py-4 text-xs text-slate-400">{createdAtFormatter.format(new Date(managedUser.createdAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-800 md:hidden">
              {users.content.map((managedUser) => (
                <article className="p-4" key={managedUser.id}>
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="truncate font-semibold text-white">{managedUser.name}</h4><p className="mt-1 truncate text-xs text-slate-500">{managedUser.email}</p></div><AccountStatusBadge active={managedUser.active} /></div>
                  <div className="mt-4 flex items-center justify-between gap-3"><RoleBadge role={managedUser.role} /><time className="text-xs text-slate-600">{createdAtFormatter.format(new Date(managedUser.createdAt))}</time></div>
                </article>
              ))}
            </div>
            <Pagination onPageChange={setPage} page={users.page} totalElements={users.totalElements} totalPages={users.totalPages} />
          </>
        )}
      </section>

      <Modal description="A nova conta será criada com o perfil selecionado e ficará ativa imediatamente." onClose={() => setCreateOpen(false)} open={createOpen} title="Cadastrar usuário">
        <CreateUserForm onCancel={() => setCreateOpen(false)} onCreated={handleCreated} />
      </Modal>
    </div>
  )
}
