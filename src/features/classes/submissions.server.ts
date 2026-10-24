/**
 * 提交与作品：老师侧生成一次性链接，学生侧免注册贴链接提交。
 *
 * 存储策略：当前走 externalUrl（YouTube / Drive / B站 等外链），不需要 R2。
 * 将来开通 R2 后，artifacts.r2Key 这条路径可直接启用，表结构无需改动。
 */
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import type { DB } from '@/db/client'
import type { Scope } from '@/db/scope'
import { assignments, classes, students, submissions, artifacts, type Artifact } from './classes.schema'

export type SubmitResult =
  | { ok: true; submissionId: string }
  | { ok: false; reason: 'notfound' | 'closed' | 'url' | 'kind' }

export interface InviteRow {
  studentId: string
  displayName: string
  code: string | null
  token: string
  status: string
  artifactCount: number
  submittedAt: Date | null
}

/** 为班级里还没有 submission 的学生补齐一次性 token（幂等）。 */
export async function ensureInvites(db: DB, assignmentId: string, now: number): Promise<void> {
  const [row] = await db
    .select({ classId: assignments.classId })
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1)
  if (!row) return

  const roster = await db.select({ id: students.id }).from(students).where(eq(students.classId, row.classId))
  if (roster.length === 0) return

  const existing = await db
    .select({ studentId: submissions.studentId })
    .from(submissions)
    .where(eq(submissions.assignmentId, assignmentId))
  const have = new Set(existing.map((e) => e.studentId))

  const missing = roster.filter((s) => !have.has(s.id))
  if (missing.length === 0) return

  await db.insert(submissions).values(
    missing.map((s) => ({
      id: crypto.randomUUID(),
      assignmentId,
      studentId: s.id,
      token: crypto.randomUUID().replace(/-/g, '').slice(0, 20),
      status: 'invited',
      createdAt: new Date(now),
    })),
  )
}

export async function listInvites(db: DB, assignmentId: string): Promise<InviteRow[]> {
  const rows = await db
    .select({
      studentId: students.id,
      displayName: students.displayName,
      code: students.code,
      token: submissions.token,
      status: submissions.status,
      submittedAt: submissions.submittedAt,
      submissionId: submissions.id,
    })
    .from(submissions)
    .innerJoin(students, eq(students.id, submissions.studentId))
    .where(eq(submissions.assignmentId, assignmentId))
    .orderBy(asc(students.displayName))

  if (rows.length === 0) return []

  const counts = await db
    .select({ submissionId: artifacts.submissionId, id: artifacts.id })
    .from(artifacts)
    .where(inArray(artifacts.submissionId, rows.map((r) => r.submissionId)))
  const bySubmission = new Map<string, number>()
  for (const c of counts) bySubmission.set(c.submissionId, (bySubmission.get(c.submissionId) ?? 0) + 1)

  return rows.map((r) => ({
    studentId: r.studentId,
    displayName: r.displayName,
    code: r.code,
    token: r.token,
    status: r.status,
    submittedAt: r.submittedAt,
    artifactCount: bySubmission.get(r.submissionId) ?? 0,
  }))
}

export interface PublicSubmissionView {
  assignmentTitle: string
  instructions: string | null
  className: string
  studentName: string
  status: string
  submittedAt: Date | null
  items: Artifact[]
}

/** 公开读取（凭 token），不校验登录。 */
export async function getSubmissionByToken(db: DB, token: string): Promise<PublicSubmissionView | null> {
  const [row] = await db
    .select({
      submissionId: submissions.id,
      status: submissions.status,
      submittedAt: submissions.submittedAt,
      assignmentTitle: assignments.title,
      instructions: assignments.instructions,
      assignmentStatus: assignments.status,
      className: classes.name,
      studentName: students.displayName,
    })
    .from(submissions)
    .innerJoin(assignments, eq(assignments.id, submissions.assignmentId))
    .innerJoin(classes, eq(classes.id, assignments.classId))
    .innerJoin(students, eq(students.id, submissions.studentId))
    .where(eq(submissions.token, token))
    .limit(1)

  if (!row) return null

  const items = await db
    .select()
    .from(artifacts)
    .where(eq(artifacts.submissionId, row.submissionId))
    .orderBy(desc(artifacts.createdAt))

  return {
    assignmentTitle: row.assignmentTitle,
    instructions: row.instructions,
    className: row.className,
    studentName: row.studentName,
    status: row.status,
    submittedAt: row.submittedAt,
    items,
  }
}

const ALLOWED_KINDS = new Set(['video', 'image', 'doc', 'link', 'code'])

/** 学生侧提交：只接受外链。 */
export async function addExternalArtifact(
  db: DB,
  token: string,
  input: { kind: string; url: string },
  now: number,
): Promise<SubmitResult> {
  const [sub] = await db
    .select({ id: submissions.id, assignmentStatus: assignments.status })
    .from(submissions)
    .innerJoin(assignments, eq(assignments.id, submissions.assignmentId))
    .where(eq(submissions.token, token))
    .limit(1)
  if (!sub) return { ok: false, reason: 'notfound' }
  if (sub.assignmentStatus !== 'open') return { ok: false, reason: 'closed' }
  if (!ALLOWED_KINDS.has(input.kind)) return { ok: false, reason: 'kind' }

  const url = input.url.trim()
  if (!/^https?:\/\/\S+$/i.test(url) || url.length > 2048) return { ok: false, reason: 'url' }

  await db.insert(artifacts).values({
    id: crypto.randomUUID(),
    submissionId: sub.id,
    kind: input.kind,
    externalUrl: url,
    createdAt: new Date(now),
  })
  await db
    .update(submissions)
    .set({ status: 'submitted', submittedAt: new Date(now) })
    .where(eq(submissions.id, sub.id))
  return { ok: true, submissionId: sub.id }
}

/** 老师侧校验作业归属，供页面 loader 使用。 */
export async function getAssignmentForTeacher(db: DB, scope: Scope, assignmentId: string) {
  const [row] = await db
    .select()
    .from(assignments)
    .where(and(eq(assignments.id, assignmentId), eq(assignments.userId, scope.ownerId)))
    .limit(1)
  return row ?? null
}
