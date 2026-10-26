import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  leadingIcon?: ReactNode
  trailingAction?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, error, leadingIcon, trailingAction, className, ...props },
  ref,
) {
  const inputId = id || props.name
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-200" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
            {leadingIcon}
          </span>
        )}
        <input
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className={cn(
            'min-h-12 w-full rounded-xl border bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10',
            Boolean(leadingIcon) && 'pl-11',
            Boolean(trailingAction) && 'pr-12',
            error ? 'border-rose-500/70' : 'border-slate-700/80',
            className,
          )}
          id={inputId}
          ref={ref}
          {...props}
        />
        {trailingAction && <span className="absolute inset-y-0 right-0 flex items-center pr-2">{trailingAction}</span>}
      </div>
      {error && (
        <p className="text-sm text-rose-300" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
})
