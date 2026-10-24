import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Check, Copy, ExternalLink, Users } from 'lucide-react'
import { requireUser } from '@/features/auth/middleware'
import { getEntitlement } from '@/features/billing/middleware'
import { AppShell } from '@/components/app/app-shell'
import { getAssignmentInvitesFn } from '@/features/classes/actions'

export const Route = createFileRoute('/{-$locale}/app/assignments/$assignmentId')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  loader: async ({ params }) => {
    const [user, ent, detail] = await Promise.all([
      requireUser({ data: { locale: (params as { locale?: string }).locale } }),
      getEntitlement(),
      getAssignmentInvitesFn({ data: { assignmentId: params.assignmentId } }),
    ])
    return { user, ent, detail }
  },
  component: AssignmentPage,
})

function AssignmentPage() {
  const { user, ent, detail } = Route.useLoaderData()
  const [copied, setCopied] = useState<string | null>(null)

  if (!detail.assignment) {
    return (
      <AppShell user={user} isPro={ent.plan === 'pro'} active="classes" crumb="Not found" paymentFailed={ent.paymentFailed}>
        <h1 className="page-h">Assignment not found</h1>
        <Link to="/{-$locale}/app/classes" className="mt-4 inline-flex items-center gap-2 text-sm text-primary">
          <ArrowLeft size={14} /> Back to classes
        </Link>
      </AppShell>
    )
  }

  const a = detail.assignment
  const invites = detail.invites

  function linkFor(token: string) {
    const origin = typeof window === 'undefined' ? '' : window.location.origin
    return `${origin}/submit/${token}`
  }

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(linkFor(token))
      setCopied(token)
      setTimeout(() => setCopied(null), 1600)
    } catch {
      setCopied(null)
    }
  }

  const submitted = invites.filter((i) => i.status === 'submitted').length

  return (
    <AppShell user={user} isPro={ent.plan === 'pro'} active="classes" crumb={a.title} paymentFailed={ent.paymentFailed}>
      <Link to="/{-$locale}/app/classes" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-fg-2 hover:text-foreground">
        <ArrowLeft size={14} /> All classes
      </Link>

      <div className="mb-6">
        <h1 className="page-h">{a.title}</h1>
        {a.instructions && (
          <p className="mt-1.5 max-w-[52em] text-[14px] leading-relaxed text-fg-2">{a.instructions}</p>
        )}
        <p className="mt-2.5 flex items-center gap-4 text-[12.5px] text-fg-3">
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} /> {invites.length} students
          </span>
          <span>
            {submitted} of {invites.length} submitted
          </span>
        </p>
      </div>

      <div className="mb-4 rounded-[14px] border border-border bg-card px-5 py-4">
        <p className="m-0 text-[13px] leading-relaxed text-fg-2">
          Each student has a private link. Send it to them however you already talk to them — class
          chat, email, LMS. They paste a link to their video, photos or design log. No account
          needed, nothing to install.
        </p>
      </div>

      {invites.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="m-0 text-[13.5px] text-fg-3">
            Add students to this class first — each one gets their own submission link.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-alt">
                <th className="px-4 py-2.5 text-left text-[11.5px] font-medium uppercase tracking-[0.06em] text-fg-3">
                  Student
                </th>
                <th className="px-4 py-2.5 text-left text-[11.5px] font-medium uppercase tracking-[0.06em] text-fg-3">
                  Status
                </th>
                <th className="px-4 py-2.5 text-right text-[11.5px] font-medium uppercase tracking-[0.06em] text-fg-3">
                  Link
                </th>
              </tr>
            </thead>
            <tbody>
              {invites.map((s) => (
                <tr key={s.studentId} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-alt text-[11px] font-semibold text-fg-2">
                        {s.displayName.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="text-[13.5px]">{s.displayName}</span>
                      {s.code && <span className="font-mono text-[11.5px] text-fg-3">{s.code}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.status === 'submitted' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11.5px] font-medium text-primary">
                        <Check size={12} /> {s.artifactCount} item{s.artifactCount === 1 ? '' : 's'}
                      </span>
                    ) : (
                      <span className="rounded-full bg-bg-alt px-2.5 py-0.5 text-[11.5px] text-fg-2">Invited</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => copy(s.token)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12px] text-fg-2 transition-colors hover:bg-bg-alt"
                      >
                        {copied === s.token ? <Check size={13} /> : <Copy size={13} />}
                        {copied === s.token ? 'Copied' : 'Copy'}
                      </button>
                      <a
                        href={linkFor(s.token)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open submission page for ${s.displayName}`}
                        className="inline-flex items-center rounded-md border border-border p-1.5 text-fg-2 transition-colors hover:bg-bg-alt"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  )
}
