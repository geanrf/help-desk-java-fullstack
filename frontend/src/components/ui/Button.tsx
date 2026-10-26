import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  isLoading?: boolean
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_8px_30px_rgba(34,211,238,0.16)]',
  secondary: 'border border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-600 hover:bg-slate-800',
  ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
  danger: 'border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
}

export function Button({
  children,
  className,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  )
}
