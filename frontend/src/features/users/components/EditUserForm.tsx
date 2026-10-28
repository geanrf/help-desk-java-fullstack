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

interface EditUserFormProps {
  user: ManagedUser
  onCancel: () => void
  onUpdated: (user: ManagedUser) => void
}

interface UserForm {
  name: string
  email: string
  role: UserRole
  active: 'true' | 'false'
  password: string
  confirmPassword: string
}

type UserFormErrors = Partial<Record<keyof UserForm, string>>

export function EditUserForm({ user, onCancel, onUpdated }: EditUserFormProps) {
  const [form, setForm] = useState<UserForm>({
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active ? 'true' : 'false',
    password: '',
    confirmPassword: '',
  })
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
    if (form.password && form.password.length < 8) nextErrors.password = 'Use pelo menos 8 caracteres.'
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
      const updatedUser = await usersService.update(user.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        active: form.active === 'true',
        ...(form.password ? { password: form.password } : {}),
      })
      onUpdated(updatedUser)
    } catch (error) {
      const parsed = parseApiError(error, 'Não foi possível atualizar o usuário.')
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
        <TextField autoComplete="name" error={errors.name} label="Nome completo" maxLength={120} name="editName" onChange={(event) => updateField('name', event.target.value)} value={form.name} />
        <TextField autoComplete="email" error={errors.email} label="E-mail" maxLength={180} name="editEmail" onChange={(event) => updateField('email', event.target.value)} type="email" value={form.email} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Perfil de acesso" name="editRole" onChange={(event) => updateField('role', event.target.value as UserRole)} value={form.role}>
          <option value="USUARIO">Usuário</option><option value="TECNICO">Técnico</option><option value="ADMIN">Administrador</option>
        </SelectField>
        <SelectField label="Situação" name="editActive" onChange={(event) => updateField('active', event.target.value as 'true' | 'false')} value={form.active}>
          <option value="true">Ativo</option><option value="false">Inativo</option>
        </SelectField>
      </div>
      <p className="text-xs text-slate-500">Deixe os campos de senha vazios para manter a senha atual.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField autoComplete="new-password" error={errors.password} label="Nova senha (opcional)" maxLength={72} name="editPassword" onChange={(event) => updateField('password', event.target.value)} trailingAction={passwordAction} type={showPassword ? 'text' : 'password'} value={form.password} />
        <TextField autoComplete="new-password" error={errors.confirmPassword} label="Confirmar nova senha" maxLength={72} name="editConfirmPassword" onChange={(event) => updateField('confirmPassword', event.target.value)} type={showPassword ? 'text' : 'password'} value={form.confirmPassword} />
      </div>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="ghost">Cancelar</Button>
        <Button isLoading={isSubmitting} type="submit">Salvar alterações</Button>
      </div>
    </form>
  )
}
