import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { id, name, label, error, className, children, ...props },
  ref,
) {
  const selectId = id || name
  const errorId = error ? `${selectId}-error` : undefined

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-200" htmlFor={selectId}>
        {label}
      </label>
      <select
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={cn(
          'min-h-12 w-full rounded-xl border bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-rose-500/70' : 'border-slate-700/80',
          className,
        )}
        id={selectId}
        name={name}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-rose-300" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
})
