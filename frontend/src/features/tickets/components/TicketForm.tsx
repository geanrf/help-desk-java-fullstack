import { useState, type FormEvent } from 'react'
import { parseApiError } from '../../../api/errors'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { SelectField } from '../../../components/ui/SelectField'
import { TextareaField } from '../../../components/ui/TextareaField'
import { TextField } from '../../../components/ui/TextField'
import { priorityLabels, ticketPriorities } from '../constants'
import type { Category, CreateTicketPayload, TicketPriority } from '../types'

interface TicketFormValues {
  title: string
  description: string
  categoryId: string
  priority: TicketPriority
}

interface TicketFormProps {
  categories: Category[]
  initialValues?: TicketFormValues
  includePriority?: boolean
  submitLabel: string
  isCategoriesLoading?: boolean
  onSubmit: (values: TicketFormValues) => Promise<void>
  onCancel: () => void
}

type FieldErrors = Partial<Record<keyof CreateTicketPayload, string>>

export function TicketForm({
  categories,
  initialValues,
  includePriority = true,
  submitLabel,
  isCategoriesLoading = false,
  onSubmit,
  onCancel,
}: TicketFormProps) {
  const [values, setValues] = useState<TicketFormValues>(initialValues ?? {
    title: '',
    description: '',
    categoryId: '',
    priority: 'MEDIA',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    const title = values.title.trim()
    const description = values.description.trim()

    if (!title) errors.title = 'Informe o título do chamado.'
    else if (title.length > 160) errors.title = 'O título deve ter no máximo 160 caracteres.'
    if (!description) errors.description = 'Descreva o problema ou solicitação.'
    else if (description.length > 10_000) errors.description = 'A descrição deve ter no máximo 10.000 caracteres.'
    if (!values.categoryId) errors.categoryId = 'Selecione uma categoria.'
    if (includePriority && !values.priority) errors.priority = 'Selecione uma prioridade.'
    return errors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
      })
    } catch (submitError) {
      const parsed = parseApiError(submitError, 'Não foi possível salvar o chamado.')
      setError(parsed.message)
      setFieldErrors({
        title: parsed.fields.title,
        description: parsed.fields.description,
        categoryId: parsed.fields.categoryId,
        priority: parsed.fields.priority,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      {error && <Alert tone="error">{error}</Alert>}
      <TextField
        autoComplete="off"
        error={fieldErrors.title}
        label="Título"
        maxLength={160}
        name="title"
        onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
        placeholder="Resuma a solicitação"
        required
        value={values.title}
      />
      <TextareaField
        error={fieldErrors.description}
        hint={`${values.description.length}/10.000 caracteres`}
        label="Descrição"
        maxLength={10_000}
        name="description"
        onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
        placeholder="Inclua contexto, comportamento observado e impacto..."
        required
        rows={7}
        value={values.description}
      />
      <div className={includePriority ? 'grid gap-5 sm:grid-cols-2' : ''}>
        <SelectField
          disabled={isCategoriesLoading || categories.length === 0}
          error={fieldErrors.categoryId}
          label="Categoria"
          name="categoryId"
          onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
          required
          value={values.categoryId}
        >
          <option value="">{isCategoriesLoading ? 'Carregando categorias...' : 'Selecione uma categoria'}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </SelectField>
        {includePriority && (
          <SelectField
            error={fieldErrors.priority}
            label="Prioridade"
            name="priority"
            onChange={(event) => setValues((current) => ({ ...current, priority: event.target.value as TicketPriority }))}
            required
            value={values.priority}
          >
            {ticketPriorities.map((priority) => (
              <option key={priority} value={priority}>{priorityLabels[priority]}</option>
            ))}
          </SelectField>
        )}
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="secondary">Cancelar</Button>
        <Button disabled={categories.length === 0} isLoading={isSubmitting} type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
