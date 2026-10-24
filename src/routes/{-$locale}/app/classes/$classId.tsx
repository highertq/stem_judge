import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, UserPlus, ClipboardList, Trash2, ArrowLeft, Link2 } from 'lucide-react'
import { requireUser } from '@/features/auth/middleware'
import { getEntitlement } from '@/features/billing/middleware'
import { useTranslation } from '@/features/i18n/provider'
import { AppShell } from '@/components/app/app-shell'
import { getClassDetailFn, addStudentFn, createAssignmentFn, removeStudentFn } from '@/features/classes/actions'

export const Route = createFileRoute('/{-$locale}/app/classes/$classId')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  loader: async ({ params }) => {
    const [user, ent, detail] = await Promise.all([
      requireUser({ data: { locale: (params as { locale?: string }).locale } }),
      getEntitlement(),
      getClassDetailFn({ data: { classId: params.classId } }),
    ])
    return { user, ent, detail }
  },
  component: ClassDetailPage,
})

function ClassDetailPage() {
  const { user, ent, detail } = Route.useLoaderData()
  const { t } = useTranslation()
  const router = useRouter()
  const [studentName, setStudentName] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!detail.cls) {
    return (
      <AppShell user={user} isPro={ent.plan === 'pro'} active="classes" crumb="Not found" paymentFailed={ent.paymentFailed}>
        <h1 className="page-h">Class not found</h1>
        <p className="mt-2 text-sm text-fg-2">
          It may have been deleted, or it belongs to another account.
        </p>
        <Link to="/{-$locale}/app/classes" className="mt-4 inline-flex items-center gap-2 text-sm text-primary">
          <ArrowLeft size={14} /> Back to classes
        </Link>
      </AppShell>
    )
  }

  const cls = detail.cls
  const { students, assignments } = detail

  async function addStudent(e: React.FormEvent) {
    e.preventDefault()
    if (busy || !studentName.trim()) return
    setBusy(true)
    setErr(null)
    try {
      const r = await addStudentFn({ data: { classId: cls.id, displayName: studentName, code: studentCode } })
      if (!r.ok) setErr(r.reason === 'limit' ? 'Class is full (60 students).' : 'Enter a name.')
      else {
        setStudentName('')
        setStudentCode('')
        await router.invalidate()
      }
    } finally {
      setBusy(false)
    }
  }

  async function removeStudent(studentId: string) {
    await removeStudentFn({ data: { classId: cls.id, studentId } })
    await router.invalidate()
  }

  async function createAssignment(e: React.FormEvent) {
    e.preventDefault()
    if (busy || !title.trim()) return
    setBusy(true)
    setErr(null)
    try {
      const r = await createAssignmentFn({ data: { classId: cls.id, title, instructions } })
      if (!r.ok) setErr('Enter an assignment title.')
      else {
        setTitle('')
        setInstructions('')
        await router.invalidate()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell user={user} isPro={ent.plan === 'pro'} active="classes" crumb={cls.name} paymentFailed={ent.paymentFailed}>
      <Link to="/{-$locale}/app/classes" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-fg-2 hover:text-foreground">
        <ArrowLeft size={14} /> All classes
      </Link>

      <div className="mb-6">
        <h1 className="page-h">{cls.name}</h1>
        <p className="mt-1.5 text-[14.5px] text-fg-2">
          {[cls.subject, cls.gradeBand].filter(Boolean).join(' · ') || 'No subject set'}
        </p>
      </div>

      {err && <p className="mb-4 text-[13px] text-red-500">{err}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        {/* students */}
        <section className="rounded-[14px] border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="m-0 text-[15px] font-semibold">Students</h2>
            <span className="text-[12.5px] text-fg-3">{students.length} / 60</span>
          </div>

          <form onSubmit={addStudent} className="mb-4 flex flex-wrap gap-2">
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student name"
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-border-strong"
            />
            <input
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="Code"
              className="w-20 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-border-strong"
            />
            <button
              type="submit"
              disabled={busy || !studentName.trim()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-fg-2 hover:bg-bg-alt disabled:opacity-50"
            >
              <UserPlus size={15} /> Add
            </button>
          </form>

          {students.length === 0 ? (
            <p className="py-6 text-center text-[13px] leading-relaxed text-fg-3">
              No students yet. Names only — no email addresses, no photos.
            </p>
          ) : (
            <ul className="m-0 list-none divide-y divide-border p-0">
              {students.map((s) => (
                <li key={s.id} className="group flex items-center gap-3 py-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-alt text-[11px] font-semibold text-fg-2">
                    {s.displayName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px]">{s.displayName}</span>
                  {s.code && <span className="font-mono text-[11.5px] text-fg-3">{s.code}</span>}
                  <button
                    type="button"
                    onClick={() => removeStudent(s.id)}
                    aria-label={`Remove ${s.displayName}`}
                    className="opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* assignments */}
        <section className="rounded-[14px] border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="m-0 text-[15px] font-semibold">Assignments</h2>
            <span className="text-[12.5px] text-fg-3">{assignments.length}</span>
          </div>

          <form onSubmit={createAssignment} className="mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-border-strong"
            />
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="What should students submit? (video, photos, code, design log)"
              rows={2}
              className="mb-2 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-border-strong"
            />
            <button
              type="submit"
              disabled={busy || !title.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              <Plus size={15} /> Create assignment
            </button>
          </form>

          {assignments.length === 0 ? (
            <p className="py-6 text-center text-[13px] leading-relaxed text-fg-3">
              No assignments yet. Create one, then share a link with each student.
            </p>
          ) : (
            <ul className="m-0 list-none divide-y divide-border p-0">
              {assignments.map((a) => (
                <li key={a.id} className="py-0">
                  <Link
                    to="/{-$locale}/app/assignments/$assignmentId"
                    params={{ assignmentId: a.id }}
                    className="block py-3 transition-colors hover:bg-bg-alt/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="m-0 truncate text-[13.5px] font-medium">{a.title}</p>
                        {a.instructions && (
                          <p className="m-0 mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-fg-3">
                            {a.instructions}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-bg-alt px-2 py-0.5 text-[11px] text-fg-2">
                        {a.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[12px] text-fg-3">
                      <ClipboardList size={13} />
                      <span>Open submission links</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 rounded-[14px] border border-dashed border-border bg-card px-5 py-4">
        <p className="m-0 flex items-center gap-2 font-mono text-[12.5px] text-fg-3">
          <Link2 size={14} /> Next: per-student submission links, then the grading workbench.
        </p>
      </div>
    </AppShell>
  )
}
