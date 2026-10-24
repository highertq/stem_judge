import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'

/** 未登录抛 redirect（而非 Error），保证 loader 里与 requireUser 竞争时也落到登录页。 */
async function currentUser() {
  const { readUser } = await import('@/features/auth/readUser.server')
  const user = await readUser()
  if (!user) throw redirect({ to: '/{-$locale}/login' })
  return user
}

export const listClassesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { createDb } = await import('@/db/client')
  const { env } = await import('@/lib/env')
  const { scopeFromUser } = await import('@/db/scope')
  const { listClasses } = await import('./classes.server')
  const user = await currentUser()
  return listClasses(createDb(env.DB), scopeFromUser(user.id))
})

export const createClassFn = createServerFn({ method: 'POST' })
  .validator((d: { name: string; subject?: string; gradeBand?: string }) => d)
  .handler(async ({ data }) => {
    const { createDb } = await import('@/db/client')
    const { env } = await import('@/lib/env')
    const { scopeFromUser } = await import('@/db/scope')
    const { createClass } = await import('./classes.server')
    const user = await currentUser()
    return createClass(createDb(env.DB), scopeFromUser(user.id), data, Date.now())
  })

export const getClassDetailFn = createServerFn({ method: 'GET' })
  .validator((d: { classId: string }) => d)
  .handler(async ({ data }) => {
    const { createDb } = await import('@/db/client')
    const { env } = await import('@/lib/env')
    const { scopeFromUser } = await import('@/db/scope')
    const { getClass, listStudents, listAssignments } = await import('./classes.server')
    const user = await currentUser()
    const db = createDb(env.DB)
    const scope = scopeFromUser(user.id)
    const cls = await getClass(db, scope, data.classId)
    if (!cls) return { cls: null, students: [], assignments: [] }
    const [studentRows, assignmentRows] = await Promise.all([
      listStudents(db, cls.id),
      listAssignments(db, scope, cls.id),
    ])
    return { cls, students: studentRows, assignments: assignmentRows }
  })

export const addStudentFn = createServerFn({ method: 'POST' })
  .validator((d: { classId: string; displayName: string; code?: string }) => d)
  .handler(async ({ data }) => {
    const { createDb } = await import('@/db/client')
    const { env } = await import('@/lib/env')
    const { scopeFromUser } = await import('@/db/scope')
    const { addStudent } = await import('./classes.server')
    const user = await currentUser()
    return addStudent(
      createDb(env.DB),
      scopeFromUser(user.id),
      data.classId,
      { displayName: data.displayName, code: data.code },
      Date.now(),
    )
  })

export const removeStudentFn = createServerFn({ method: 'POST' })
  .validator((d: { classId: string; studentId: string }) => d)
  .handler(async ({ data }): Promise<{ removed: boolean }> => {
    const { createDb } = await import('@/db/client')
    const { env } = await import('@/lib/env')
    const { scopeFromUser } = await import('@/db/scope')
    const { removeStudent } = await import('./classes.server')
    const user = await currentUser()
    return { removed: await removeStudent(createDb(env.DB), scopeFromUser(user.id), data.classId, data.studentId) }
  })

export const createAssignmentFn = createServerFn({ method: 'POST' })
  .validator((d: { classId: string; title: string; instructions?: string; rubricId?: string }) => d)
  .handler(async ({ data }) => {
    const { createDb } = await import('@/db/client')
    const { env } = await import('@/lib/env')
    const { scopeFromUser } = await import('@/db/scope')
    const { createAssignment } = await import('./classes.server')
    const user = await currentUser()
    return createAssignment(
      createDb(env.DB),
      scopeFromUser(user.id),
      data.classId,
      { title: data.title, instructions: data.instructions, rubricId: data.rubricId },
      Date.now(),
    )
  })

/** 老师侧：打开作业详情时补齐每个学生的一次性提交 token，并返回名册状态。 */
export const getAssignmentInvitesFn = createServerFn({ method: 'GET' })
  .validator((d: { assignmentId: string }) => d)
  .handler(async ({ data }) => {
    const { createDb } = await import('@/db/client')
    const { env } = await import('@/lib/env')
    const { scopeFromUser } = await import('@/db/scope')
    const { ensureInvites, listInvites, getAssignmentForTeacher } = await import('./submissions.server')
    const user = await currentUser()
    const db = createDb(env.DB)
    const scope = scopeFromUser(user.id)
    const assignment = await getAssignmentForTeacher(db, scope, data.assignmentId)
    if (!assignment) return { assignment: null, invites: [] }
    await ensureInvites(db, assignment.id, Date.now())
    return { assignment, invites: await listInvites(db, assignment.id) }
  })

/** 公开：学生凭 token 读取自己的提交页，不需要登录。 */
export const getPublicSubmissionFn = createServerFn({ method: 'GET' })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    const { createDb } = await import('@/db/client')
    const { env } = await import('@/lib/env')
    const { getSubmissionByToken } = await import('./submissions.server')
    return getSubmissionByToken(createDb(env.DB), data.token)
  })

/** 公开：学生贴作品外链。 */
export const submitArtifactFn = createServerFn({ method: 'POST' })
  .validator((d: { token: string; kind: string; url: string }) => d)
  .handler(async ({ data }) => {
    const { createDb } = await import('@/db/client')
    const { env } = await import('@/lib/env')
    const { addExternalArtifact } = await import('./submissions.server')
    return addExternalArtifact(createDb(env.DB), data.token, { kind: data.kind, url: data.url }, Date.now())
  })
