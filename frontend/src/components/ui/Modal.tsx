import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, description, children, onClose }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-sm" role="presentation">
      <button aria-label="Fechar janela" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <section
        aria-describedby={description ? 'modal-description' : undefined}
        aria-labelledby="modal-title"
        aria-modal="true"
        className="relative my-8 w-full max-w-2xl rounded-3xl border border-slate-700/80 bg-[#0d1422] p-5 shadow-2xl shadow-black/40 sm:p-7"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white" id="modal-title">{title}</h2>
            {description && <p className="mt-2 text-sm leading-6 text-slate-400" id="modal-description">{description}</p>}
          </div>
          <button
            aria-label="Fechar"
            className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <Icon className="size-5" name="x" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  )
}
