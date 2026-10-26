import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { parseApiError } from '../api/errors'
import { authService } from '../auth/auth.service'
import { AuthPageShell } from '../components/layout/AuthPageShell'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { TextField } from '../components/ui/TextField'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>

const initialForm: RegisterForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function RegisterPage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [requestError, setRequestError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function updateField(field: keyof RegisterForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validate(): boolean {
    const nextErrors: RegisterErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Informe seu nome completo.'
    if (!form.email.trim()) nextErrors.email = 'Informe seu e-mail.'
    if (form.password.length < 8) nextErrors.password = 'Use pelo menos 8 caracteres.'
    else if (form.password.length > 72) nextErrors.password = 'Use no máximo 72 caracteres.'
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'As senhas não coincidem.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRequestError('')
    if (!validate()) return

    setLoading(true)
    try {
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/login', {
        replace: true,
        state: { message: 'Conta criada com sucesso. Entre com suas credenciais.' },
      })
    } catch (error) {
      const parsed = parseApiError(error, 'Não foi possível criar sua conta.')
      setRequestError(parsed.message)
      setErrors((current) => ({ ...current, ...parsed.fields }))
    } finally {
      setLoading(false)
    }
  }

  const passwordAction = (
    <button
      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
      className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      onClick={() => setShowPassword((visible) => !visible)}
      type="button"
    >
      <Icon className="size-4" name={showPassword ? 'eye-off' : 'eye'} />
    </button>
  )

  return (
    <AuthPageShell>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300" to="/login">
          <Icon className="size-4" name="arrow-left" />
          Voltar ao login
        </Link>
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">Novo acesso</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Crie sua conta</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            O cadastro público cria uma conta com perfil de usuário solicitante.
          </p>
        </div>

        {requestError && <div className="mb-5"><Alert tone="error">{requestError}</Alert></div>}

        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <TextField
            autoComplete="name"
            error={errors.name}
            label="Nome completo"
            leadingIcon={<Icon className="size-4" name="user" />}
            maxLength={120}
            name="name"
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Como devemos chamar você?"
            value={form.name}
          />
          <TextField
            autoComplete="email"
            error={errors.email}
            inputMode="email"
            label="E-mail"
            leadingIcon={<Icon className="size-4" name="mail" />}
            maxLength={180}
            name="email"
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="voce@empresa.com"
            type="email"
            value={form.email}
          />
          <TextField
            autoComplete="new-password"
            error={errors.password}
            label="Senha"
            leadingIcon={<Icon className="size-4" name="lock" />}
            maxLength={72}
            name="password"
            onChange={(event) => updateField('password', event.target.value)}
            placeholder="Mínimo de 8 caracteres"
            trailingAction={passwordAction}
            type={showPassword ? 'text' : 'password'}
            value={form.password}
          />
          <TextField
            autoComplete="new-password"
            error={errors.confirmPassword}
            label="Confirme a senha"
            leadingIcon={<Icon className="size-4" name="lock" />}
            maxLength={72}
            name="confirmPassword"
            onChange={(event) => updateField('confirmPassword', event.target.value)}
            placeholder="Repita sua senha"
            type={showPassword ? 'text' : 'password'}
            value={form.confirmPassword}
          />

          <Button className="mt-2" fullWidth isLoading={loading} type="submit">
            {loading ? 'Criando conta...' : 'Criar minha conta'}
          </Button>
        </form>
      </div>
    </AuthPageShell>
  )
}
