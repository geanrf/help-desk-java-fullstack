import { useEffect, useState, type FormEvent } from 'react'
import { parseApiError } from '../../../api/errors'
import type { AuthUser } from '../../../auth/types'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Icon } from '../../../components/ui/Icon'
import { Pagination } from '../../../components/ui/Pagination'
import { Spinner } from '../../../components/ui/Spinner'
import { TextareaField } from '../../../components/ui/TextareaField'
import { cn } from '../../../lib/cn'
import { historyEventLabels } from '../constants'
import { formatDateTime, formatHistoryValue } from '../formatters'
import { canComment } from '../ticket-permissions'
import { ticketsService } from '../tickets.service'
import type { Comment, PageResponse, Ticket, TicketHistory } from '../types'

const PAGE_SIZE = 10

interface TicketTimelineProps {
  ticket: Ticket
  user: AuthUser
  refreshToken: number
}

export function TicketTimeline({ ticket, user, refreshToken }: TicketTimelineProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments')
  const [comments, setComments] = useState<PageResponse<Comment> | null>(null)
  const [history, setHistory] = useState<PageResponse<TicketHistory> | null>(null)
  const [commentPage, setCommentPage] = useState(0)
  const [historyPage, setHistoryPage] = useState(0)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [commentError, setCommentError] = useState('')
  const [success, setSuccess] = useState('')
  const [localRefresh, setLocalRefresh] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError('')

    const request = activeTab === 'comments'
      ? ticketsService.listComments(ticket.id, commentPage, PAGE_SIZE, controller.signal).then(setComments)
      : ticketsService.listHistory(ticket.id, historyPage, PAGE_SIZE, controller.signal).then(setHistory)

    request
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(parseApiError(requestError, `Não foi possível carregar ${activeTab === 'comments' ? 'os comentários' : 'o histórico'}.`).message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [activeTab, commentPage, historyPage, localRefresh, refreshToken, ticket.id])

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCommentError('')
    setSuccess('')
    const normalizedContent = content.trim()
    if (!normalizedContent) {
      setCommentError('Escreva um comentário antes de enviar.')
      return
    }

    setIsSubmitting(true)
    try {
      await ticketsService.createComment(ticket.id, { content: normalizedContent })
      const nextLastPage = Math.floor((comments?.totalElements ?? 0) / PAGE_SIZE)
      setContent('')
      setCommentPage(nextLastPage)
      setSuccess('Comentário adicionado com sucesso.')
      setLocalRefresh((value) => value + 1)
    } catch (requestError) {
      const parsed = parseApiError(requestError, 'Não foi possível adicionar o comentário.')
      setCommentError(parsed.fields.content || parsed.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const userCanComment = canComment(ticket, user)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
      <div className="flex border-b border-slate-800 p-1.5">
        <button
          className={cn('flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition', activeTab === 'comments' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-200')}
          onClick={() => setActiveTab('comments')}
          type="button"
        >
          <Icon className="size-4" name="message" /> Comentários
        </button>
        <button
          className={cn('flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition', activeTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-200')}
          onClick={() => setActiveTab('history')}
          type="button"
        >
          <Icon className="size-4" name="history" /> Histórico
        </button>
      </div>

      {activeTab === 'comments' && userCanComment && (
        <form className="space-y-3 border-b border-slate-800 p-4 sm:p-5" onSubmit={handleComment}>
          {success && <Alert tone="success">{success}</Alert>}
          <TextareaField
            error={commentError}
            hint={`${content.length}/4.000 caracteres`}
            label="Adicionar comentário"
            maxLength={4_000}
            name="comment"
            onChange={(event) => setContent(event.target.value)}
            placeholder="Registre uma atualização ou responda ao atendimento..."
            rows={4}
            value={content}
          />
          <div className="flex justify-end"><Button isLoading={isSubmitting} type="submit">Enviar comentário</Button></div>
        </form>
      )}

      {activeTab === 'comments' && !userCanComment && (
        <div className="border-b border-slate-800 px-5 py-4 text-sm text-slate-500">
          {ticket.status === 'FECHADO' ? 'Chamados fechados não recebem novos comentários.' : 'Seu perfil não pode comentar neste chamado.'}
        </div>
      )}

      {isLoading ? (
        <div className="grid min-h-52 place-items-center"><Spinner className="size-5" /></div>
      ) : error ? (
        <div className="p-5"><Alert tone="error">{error}</Alert></div>
      ) : activeTab === 'comments' ? (
        !comments || comments.content.length === 0 ? (
          <EmptyState description="As interações do atendimento aparecerão aqui." icon="message" title="Nenhum comentário" />
        ) : (
          <>
            <div className="divide-y divide-slate-800">
              {comments.content.map((comment) => (
                <article className="p-4 sm:p-5" key={comment.id}>
                  <div className="flex items-start gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-800 text-xs font-bold text-cyan-200">{comment.author.name.slice(0, 2).toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-sm font-semibold text-slate-100">{comment.author.name}</p><time className="text-xs text-slate-600">{formatDateTime(comment.createdAt)}</time></div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{comment.content}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <Pagination onPageChange={setCommentPage} page={comments.page} totalElements={comments.totalElements} totalPages={comments.totalPages} />
          </>
        )
      ) : !history || history.content.length === 0 ? (
        <EmptyState description="As alterações importantes serão registradas automaticamente." icon="history" title="Nenhum evento registrado" />
      ) : (
        <>
          <div className="p-4 sm:p-5">
            <ol className="space-y-5">
              {history.content.map((event) => {
                const oldValue = formatHistoryValue(event.fieldName, event.oldValue)
                const newValue = formatHistoryValue(event.fieldName, event.newValue)
                return (
                  <li className="relative pl-8 before:absolute before:left-[11px] before:top-7 before:h-[calc(100%+0.25rem)] before:w-px before:bg-slate-800 last:before:hidden" key={event.id}>
                    <span className="absolute left-0 top-1 grid size-6 place-items-center rounded-full border border-cyan-400/25 bg-cyan-400/10"><span className="size-1.5 rounded-full bg-cyan-300" /></span>
                    <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-semibold text-slate-100">{historyEventLabels[event.eventType]}</p><p className="mt-1 text-sm text-slate-400">{event.description}</p></div><time className="text-xs text-slate-600">{formatDateTime(event.createdAt)}</time></div>
                    {(oldValue || newValue) && <p className="mt-2 text-xs text-slate-500">{oldValue && <><span className="line-through">{oldValue}</span><span className="mx-2">→</span></>}{newValue && <span className="font-medium text-slate-300">{newValue}</span>}</p>}
                    <p className="mt-2 text-xs text-slate-600">por {event.actor.name}</p>
                  </li>
                )
              })}
            </ol>
          </div>
          <Pagination onPageChange={setHistoryPage} page={history.page} totalElements={history.totalElements} totalPages={history.totalPages} />
        </>
      )}
    </section>
  )
}
