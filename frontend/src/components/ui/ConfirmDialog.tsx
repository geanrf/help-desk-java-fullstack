import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  isLoading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal description={description} onClose={onCancel} open={open} title={title}>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button disabled={isLoading} onClick={onCancel} type="button" variant="secondary">Cancelar</Button>
        <Button isLoading={isLoading} onClick={onConfirm} type="button" variant="danger">{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
