import { useState, type FormEvent } from 'react'
import { parseApiError } from '../../../api/errors'
import type { UserRole } from '../../../auth/types'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { SelectField } from '../../../components/ui/SelectField'
import { TextField } from '../../../components/ui/TextField'
import { usersService } from '../users.service'
import type { ManagedUser } from '../types'

interface CreateUserFormProps {
  onCancel: () => void
  onCreated: (user: ManagedUser) => void
}

interface UserForm {
  name: string
  email: string
  role: UserRole
  password: string
  confirmPassword: string
}

type UserFormErrors = Partial<Record<keyof UserForm, string>>

const initialForm: UserForm = {
  name: '',
  email: '',
  role: 'USUARIO',
  password: '',
  confirmPassword: '',
}

export function CreateUserForm({ onCancel, onCreated }: CreateUserFormProps) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<UserFormErrors>({})
  const [requestError, setRequestError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof UserForm>(field: K, value: UserForm[K]) {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validate(): boolean {
    const nextErrors: UserFormErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Informe o nome completo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Informe um e-mail válido.'
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

    setIsSubmitting(true)
    try {
      const createdUser = await usersService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      onCreated(createdUser)
    } catch (error) {
      const parsed = parseApiError(error, 'Não foi possível cadastrar o usuário.')
      setRequestError(parsed.message)
      setErrors((current) => ({ ...current, ...parsed.fields }))
    } finally {
      setIsSubmitting(false)
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
    <form className="space-y-4" noValidate onSubmit={handleSubmit}>
      {requestError && <Alert tone="error">{requestError}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          autoComplete="name"
          error={errors.name}
          label="Nome completo"
          maxLength={120}
          name="name"
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="Nome do colaborador"
          value={form.name}
        />
        <TextField
          autoComplete="email"
          error={errors.email}
          label="E-mail"
          maxLength={180}
          name="email"
          onChange={(event) => updateField('email', event.target.value)}
          placeholder="colaborador@empresa.com"
          type="email"
          value={form.email}
        />
      </div>
      <SelectField error={errors.role} label="Perfil de acesso" name="role" onChange={(event) => updateField('role', event.target.value as UserRole)} value={form.role}>
        <option value="USUARIO">Usuário</option>
        <option value="TECNICO">Técnico</option>
        <option value="ADMIN">Administrador</option>
      </SelectField>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          autoComplete="new-password"
          error={errors.password}
          label="Senha temporária"
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
          label="Confirmar senha"
          maxLength={72}
          name="confirmPassword"
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          placeholder="Repita a senha temporária"
          type={showPassword ? 'text' : 'password'}
          value={form.confirmPassword}
        />
      </div>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="ghost">Cancelar</Button>
        <Button isLoading={isSubmitting} type="submit">Cadastrar usuário</Button>
      </div>
    </form>
  )
}
