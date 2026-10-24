import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Check, ExternalLink, Link2 } from 'lucide-react'
import { getPublicSubmissionFn, submitArtifactFn } from '@/features/classes/actions'

export const Route = createFileRoute('/submit/$token')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  loader: async ({ params }) => {
    const view = await getPublicSubmissionFn({ data: { token: params.token } })
    return { view }
  },
  component: SubmitPage,
})

const KINDS = [
  { id: 'video', label: 'Video' },
  { id: 'image', label: 'Photos' },
  { id: 'doc', label: 'Design log' },
  { id: 'code', label: 'Code' },
  { id: 'link', label: 'Other link' },
] as const

function SubmitPage() {
  const { view } = Route.useLoaderData()
  const { token } = Route.useParams()
  const router = useRouter()
  const [kind, setKind] = useState<string>('video')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!view) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-[22px] font-semibold">This link is not valid</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-fg-2">
          Ask your teacher for a new submission link.
        </p>
      </div>
    )
  }

  const done = view.status === 'submitted'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const r = await submitArtifactFn({ data: { token, kind, url } })
      if (!r.ok) {
        setError(
          r.reason === 'url'
            ? 'That does not look like a link. It should start with https://'
            : r.reason === 'closed'
              ? 'This assignment is closed.'
              : 'Something went wrong. Try again.',
        )
        return
      }
      setUrl('')
      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-[560px] px-5 py-10">
      <div className="mb-7">
        <p className="m-0 text-[12px] uppercase tracking-[0.08em] text-fg-3">{view.className}</p>
        <h1 className="mt-1.5 font-display text-[24px] font-semibold tracking-[-0.6px]">
          {view.assignmentTitle}
        </h1>
        <p className="mt-1.5 text-[13.5px] text-fg-2">Submitting as {view.studentName}</p>
        {view.instructions && (
          <p className="mt-3 rounded-lg bg-bg-alt px-3.5 py-3 text-[13.5px] leading-relaxed text-fg-2">
            {view.instructions}
          </p>
        )}
      </div>

      {done && (
        <div className="mb-6 rounded-[14px] border border-border bg-card px-5 py-4">
          <p className="m-0 flex items-center gap-2 text-[13.5px] font-medium text-primary">
            <Check size={15} /> Submitted. You can still add more.
          </p>
        </div>
      )}

      <form onSubmit={submit} className="rounded-[14px] border border-border bg-card p-5">
        <h2 className="m-0 text-[14.5px] font-semibold">Add a link to your work</h2>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-3">
          Upload your video to YouTube (unlisted is fine), your photos to Drive, your code to GitHub
          — then paste the link here. Nothing to install.
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={
                kind === k.id
                  ? 'rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground'
                  : 'rounded-full border border-border px-3 py-1.5 text-[12.5px] text-fg-2 transition-colors hover:bg-bg-alt'
              }
            >
              {k.label}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-fg-3">
            Link
          </span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            inputMode="url"
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-border-strong"
          />
        </label>

        {error && <p className="mt-2.5 text-[13px] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={busy || !url.trim()}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          <Link2 size={15} /> {busy ? 'Saving…' : 'Add this link'}
        </button>
      </form>

      {view.items.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-[13px] font-medium uppercase tracking-[0.06em] text-fg-3">
            What you have submitted
          </h2>
          <ul className="m-0 list-none divide-y divide-border rounded-[14px] border border-border bg-card p-0">
            {view.items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 px-4 py-3">
                <span className="rounded bg-bg-alt px-2 py-0.5 text-[11px] uppercase text-fg-2">
                  {it.kind}
                </span>
                <a
                  href={it.externalUrl ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate text-[12.5px] text-primary hover:underline"
                >
                  {it.externalUrl}
                </a>
                <ExternalLink size={13} className="shrink-0 text-fg-3" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-8 text-center text-[11.5px] leading-relaxed text-fg-3">
        Only your teacher can see this page. Your name and this link are all that is stored.
      </p>
    </div>
  )
}
