/**
 * Classes / Students / Assignments 纯函数层。
 * 归属过滤一律走 @/db/scope；不 import react-start，workers 池可直接测。
 */
import { and, asc, count, desc, eq } from 'drizzle-orm'
import type { DB } from '@/db/client'
import { ownedBy, withOwner, type Scope } from '@/db/scope'
import { assignments, classes, students, type Assignment, type Klass, type Student } from './classes.schema'

export const CLASS_NAME_MAX = 80
export const STUDENT_NAME_MAX = 60
export const ASSIGNMENT_TITLE_MAX = 120
export const MAX_STUDENTS_PER_CLASS = 60

export type CreateClassResult = { ok: true; id: string } | { ok: false; reason: 'name' | 'limit' }
export type AddStudentResult = { ok: true; id: string } | { ok: false; reason: 'name' | 'limit' | 'notfound' }
export type CreateAssignmentResult = { ok: true; id: string } | { ok: false; reason: 'title' | 'notfound' }

export interface ClassRow extends Klass {
  studentCount: number
  assignmentCount: number
}

export async function listClasses(db: DB, scope: Scope): Promise<ClassRow[]> {
  const rows = await db
    .select({
      cls: classes,
      studentCount: count(students.id),
    })
    .from(classes)
    .leftJoin(students, eq(students.classId, classes.id))
    .where(ownedBy(classes, scope))
    .groupBy(classes.id)
    .orderBy(desc(classes.createdAt))

  // 作业数单查一次再拼接，避免多表 group by 造成学生数被作业数放大
  const assignmentCounts = await db
    .select({ classId: assignments.classId, c: count() })
    .from(assignments)
    .where(ownedBy(assignments, scope))
    .groupBy(assignments.classId)
  const byClass = new Map(assignmentCounts.map((r) => [r.classId, Number(r.c)]))

  return rows.map((r) => ({
    ...r.cls,
    studentCount: Number(r.studentCount),
    assignmentCount: byClass.get(r.cls.id) ?? 0,
  }))
}

export async function createClass(
  db: DB,
  scope: Scope,
  input: { name: string; subject?: string; gradeBand?: string },
  now: number,
): Promise<CreateClassResult> {
  const name = input.name.trim()
  if (!name || name.length > CLASS_NAME_MAX) return { ok: false, reason: 'name' }
  const [{ c }] = await db.select({ c: count() }).from(classes).where(ownedBy(classes, scope))
  if (Number(c) >= 30) return { ok: false, reason: 'limit' }
  const id = crypto.randomUUID()
  await db.insert(classes).values(
    withOwner(scope, {
      id,
      name,
      subject: input.subject?.trim() || null,
      gradeBand: input.gradeBand?.trim() || null,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    }),
  )
  return { ok: true, id }
}

export async function getClass(db: DB, scope: Scope, classId: string): Promise<Klass | null> {
  const [row] = await db
    .select()
    .from(classes)
    .where(and(ownedBy(classes, scope), eq(classes.id, classId)))
    .limit(1)
  return row ?? null
}

export async function listStudents(db: DB, classId: string): Promise<Student[]> {
  return db.select().from(students).where(eq(students.classId, classId)).orderBy(asc(students.createdAt))
}

export async function addStudent(
  db: DB,
  scope: Scope,
  classId: string,
  input: { displayName: string; code?: string },
  now: number,
): Promise<AddStudentResult> {
  const cls = await getClass(db, scope, classId)
  if (!cls) return { ok: false, reason: 'notfound' }
  const displayName = input.displayName.trim()
  if (!displayName || displayName.length > STUDENT_NAME_MAX) return { ok: false, reason: 'name' }
  const [{ c }] = await db
    .select({ c: count() })
    .from(students)
    .where(eq(students.classId, classId))
  if (Number(c) >= MAX_STUDENTS_PER_CLASS) return { ok: false, reason: 'limit' }
  const id = crypto.randomUUID()
  await db.insert(students).values({
    id,
    classId,
    displayName,
    code: input.code?.trim() || null,
    createdAt: new Date(now),
  })
  return { ok: true, id }
}

export async function removeStudent(db: DB, scope: Scope, classId: string, studentId: string): Promise<boolean> {
  const cls = await getClass(db, scope, classId)
  if (!cls) return false
  const res = await db
    .delete(students)
    .where(and(eq(students.classId, classId), eq(students.id, studentId)))
    .returning({ id: students.id })
  return res.length > 0
}

export async function listAssignments(db: DB, scope: Scope, classId: string): Promise<Assignment[]> {
  return db
    .select()
    .from(assignments)
    .where(and(ownedBy(assignments, scope), eq(assignments.classId, classId)))
    .orderBy(desc(assignments.createdAt))
}

export async function createAssignment(
  db: DB,
  scope: Scope,
  classId: string,
  input: { title: string; instructions?: string; rubricId?: string },
  now: number,
): Promise<CreateAssignmentResult> {
  const cls = await getClass(db, scope, classId)
  if (!cls) return { ok: false, reason: 'notfound' }
  const title = input.title.trim()
  if (!title || title.length > ASSIGNMENT_TITLE_MAX) return { ok: false, reason: 'title' }
  const id = crypto.randomUUID()
  await db.insert(assignments).values(
    withOwner(scope, {
      id,
      classId,
      rubricId: input.rubricId || null,
      title,
      instructions: input.instructions?.trim() || null,
      status: 'open',
      createdAt: new Date(now),
    }),
  )
  return { ok: true, id }
}

export interface DashboardStats {
  classCount: number
  studentCount: number
  assignmentCount: number
}

export async function getStats(db: DB, scope: Scope): Promise<DashboardStats> {
  const rows = await listClasses(db, scope)
  return {
    classCount: rows.length,
    studentCount: rows.reduce((n, r) => n + r.studentCount, 0),
    assignmentCount: rows.reduce((n, r) => n + r.assignmentCount, 0),
  }
}
