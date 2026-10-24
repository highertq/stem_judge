import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Users, ClipboardList, ArrowRight } from 'lucide-react'
import { requireUser } from '@/features/auth/middleware'
import { getEntitlement } from '@/features/billing/middleware'
import { useTranslation } from '@/features/i18n/provider'
import { AppShell } from '@/components/app/app-shell'
import { listClassesFn, createClassFn } from '@/features/classes/actions'

export const Route = createFileRoute('/{-$locale}/app/classes/')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  loader: async ({ params }) => {
    const [user, ent, classRows] = await Promise.all([
      requireUser({ data: { locale: (params as { locale?: string }).locale } }),
      getEntitlement(),
      listClassesFn(),
    ])
    return { user, ent, classRows }
  },
  component: ClassesPage,
})

function ClassesPage() {
  const { user, ent, classRows } = Route.useLoaderData()
  const { t } = useTranslation()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [gradeBand, setGradeBand] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const r = await createClassFn({ data: { name, subject, gradeBand } })
      if (!r.ok) {
        setError(r.reason === 'limit' ? 'You have reached the class limit on this plan.' : 'Enter a class name.')
        return
      }
      setName('')
      setSubject('')
      setGradeBand('')
      setOpen(false)
      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell
      user={user}
      isPro={ent.plan === 'pro'}
      active="classes"
      crumb={t('app.classes')}
      paymentFailed={ent.paymentFailed}
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-h">{t('app.classes')}</h1>
          <p className="mt-1.5 max-w-[46em] text-[14.5px] text-fg-2">
            Each class holds its students and the project work you assess.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Plus size={16} /> New class
          </button>
        )}
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="mb-6 rounded-[14px] border border-border bg-card p-5"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-fg-3">
                Class name
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Grade 9 · Design & Technology"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-border-strong"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-fg-3">
                Subject
              </span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Design Technology"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-border-strong"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-fg-3">
                Grade band
              </span>
              <input
                value={gradeBand}
                onChange={(e) => setGradeBand(e.target.value)}
                placeholder="Grades 9–10"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-border-strong"
              />
            </label>
          </div>
          {error && <p className="mt-3 text-[13px] text-red-500">{error}</p>}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create class'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setError(null)
              }}
              className="rounded-md border border-border px-4 py-2 text-sm text-fg-2 transition-colors hover:bg-bg-alt"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {classRows.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="icon-tile mx-auto">
            <Users size={20} />
          </span>
          <h2 className="mt-4 text-[16px] font-semibold">No classes yet</h2>
          <p className="mx-auto mb-4 mt-1.5 max-w-[34em] text-[13.5px] leading-relaxed text-fg-3">
            Create one, add the students in it, then set an assignment. About ten seconds of setup
            before you can hand out your first submission link.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus size={16} /> Create your first class
          </button>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {classRows.map((c) => (
            <Link
              key={c.id}
              to="/{-$locale}/app/classes/$classId"
              params={{ classId: c.id }}
              className="block rounded-[14px] border border-border bg-card p-[18px] transition-colors hover:border-border-strong"
            >
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <h3 className="m-0 text-[15px] font-semibold text-foreground">{c.name}</h3>
                <ArrowRight size={15} className="mt-1 shrink-0 text-fg-3" />
              </div>
              <p className="m-0 text-[13px] text-fg-3">
                {[c.subject, c.gradeBand].filter(Boolean).join(' · ') || 'No subject set'}
              </p>
              <div className="mt-3.5 flex items-center gap-4 border-t border-border pt-3 text-[12.5px] text-fg-2">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} className="text-fg-3" /> {c.studentCount} students
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClipboardList size={14} className="text-fg-3" /> {c.assignmentCount} assignments
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  )
}
