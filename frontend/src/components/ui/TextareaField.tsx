import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  { id, name, label, error, hint, className, ...props },
  ref,
) {
  const textareaId = id || name
  const descriptionId = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-200" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        className={cn(
          'min-h-32 w-full resize-y rounded-xl border bg-slate-950/70 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10',
          error ? 'border-rose-500/70' : 'border-slate-700/80',
          className,
        )}
        id={textareaId}
        name={name}
        ref={ref}
        {...props}
      />
      {error ? (
        <p className="text-sm text-rose-300" id={descriptionId}>{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500" id={descriptionId}>{hint}</p>
      ) : null}
    </div>
  )
})
