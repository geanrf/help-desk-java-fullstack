import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'
import { Icon } from './ui/Icon'

export function Brand({ compact = false, link = true }: { compact?: boolean; link?: boolean }) {
  const content = (
    <span className="inline-flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-300 shadow-[inset_0_0_18px_rgba(34,211,238,0.08)]">
        <Icon className="size-5" name="shield" />
      </span>
      {!compact && (
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400">Central de TI</span>
          <span className="block text-lg font-bold tracking-tight text-white">Help Desk</span>
        </span>
      )}
    </span>
  )

  return link ? (
    <Link className={cn('inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300')} to="/app">
      {content}
    </Link>
  ) : content
}
