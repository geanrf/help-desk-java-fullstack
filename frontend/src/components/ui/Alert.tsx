import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

interface AlertProps {
  children: ReactNode
  tone?: 'error' | 'success' | 'info'
}

const tones = {
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
}

export function Alert({ children, tone = 'info' }: AlertProps) {
  return (
    <div
      aria-live="polite"
      className={cn('flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6', tones[tone])}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 size-4 shrink-0" name={tone === 'error' ? 'x' : 'check'} />
      <div>{children}</div>
    </div>
  )
}
