import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { parseApiError } from '../api/errors'
import { useAuth } from '../auth/AuthContext'
import { AuthPageShell } from '../components/layout/AuthPageShell'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { TextField } from '../components/ui/TextField'

interface LoginErrors {
  email?: string
  password?: string
}

interface LoginLocationState {
  from?: string
  message?: string
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [requestError, setRequestError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LoginLocationState | null

  function validate(): boolean {
    const nextErrors: LoginErrors = {}
    if (!email.trim()) nextErrors.email = 'Informe seu e-mail.'
    if (!password) nextErrors.password = 'Informe sua senha.'
    else if (password.length < 8) nextErrors.password = 'A senha deve possuir pelo menos 8 caracteres.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRequestError('')
    if (!validate()) return

    setLoading(true)
    try {
      await login({ email: email.trim(), password })
      const destination = state?.from?.startsWith('/app') ? state.from : '/app'
      navigate(destination, { replace: true })
    } catch (error) {
      const parsed = parseApiError(error, 'Não foi possível entrar. Revise suas credenciais.')
      setRequestError(parsed.message)
      setErrors({ email: parsed.fields.email, password: parsed.fields.password })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">Bem-vindo de volta</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Acesse sua conta</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Use suas credenciais para entrar na central de atendimento.</p>
        </div>

        {state?.message && <div className="mb-5"><Alert tone="success">{state.message}</Alert></div>}
        {requestError && <div className="mb-5"><Alert tone="error">{requestError}</Alert></div>}

        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <TextField
            autoComplete="email"
            error={errors.email}
            inputMode="email"
            label="E-mail"
            leadingIcon={<Icon className="size-4" name="mail" />}
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@empresa.com"
            type="email"
            value={email}
          />
          <TextField
            autoComplete="current-password"
            error={errors.password}
            label="Senha"
            leadingIcon={<Icon className="size-4" name="lock" />}
            maxLength={72}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Sua senha"
            trailingAction={
              <button
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                <Icon className="size-4" name={showPassword ? 'eye-off' : 'eye'} />
              </button>
            }
            type={showPassword ? 'text' : 'password'}
            value={password}
          />

          <Button fullWidth isLoading={loading} type="submit">
            {loading ? 'Entrando...' : 'Entrar no Help Desk'}
          </Button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          Ainda não possui uma conta?{' '}
          <Link className="font-semibold text-cyan-300 underline-offset-4 hover:underline" to="/register">
            Criar conta
          </Link>
        </p>
      </div>
    </AuthPageShell>
  )
}
