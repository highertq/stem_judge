import { sqliteTable, text, integer, index, real } from 'drizzle-orm/sqlite-core'
import { user } from '@/features/auth/auth.schema'

/**
 * 领域表：班级 / 学生 / 评分标准 / 作业 / 提交 / 作品文件 / 评价。
 *
 * 归属：classes、rubrics、assignments 直接带 userId，权限过滤走 @/db/scope。
 * students / submissions / artifacts / assessments 通过父级归属，查询时 join 校验。
 *
 * 合规：students 只存显示名与编号，不存邮箱、不存人脸。
 */

export const classes = sqliteTable('classes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  subject: text('subject'),
  gradeBand: text('grade_band'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
}, (t) => [
  index('classes_userId_idx').on(t.userId),
])

export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  code: text('code'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (t) => [
  index('students_classId_idx').on(t.classId),
])

/** criteria 存 JSON：{ id, title, weight, descriptors: {1..4}, evidenceHints: string[] }[] */
export const rubrics = sqliteTable('rubrics', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  scale: integer('scale').notNull().default(4),
  criteria: text('criteria', { mode: 'json' }).notNull(),
  isTemplate: integer('is_template').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (t) => [
  index('rubrics_userId_idx').on(t.userId),
])

export const assignments = sqliteTable('assignments', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  rubricId: text('rubric_id').references(() => rubrics.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  instructions: text('instructions'),
  dueAt: integer('due_at', { mode: 'timestamp_ms' }),
  status: text('status').notNull().default('open'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (t) => [
  index('assignments_classId_idx').on(t.classId),
  index('assignments_userId_idx').on(t.userId),
])

export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  assignmentId: text('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  /** 学生免注册提交用的一次性链接 token */
  token: text('token').notNull().unique(),
  status: text('status').notNull().default('invited'),
  submittedAt: integer('submitted_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (t) => [
  index('submissions_assignmentId_idx').on(t.assignmentId),
  index('submissions_studentId_idx').on(t.studentId),
])

export const artifacts = sqliteTable('artifacts', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id').notNull().references(() => submissions.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // video | image | doc | link | code
  r2Key: text('r2_key'),
  externalUrl: text('external_url'),
  fileName: text('file_name'),
  bytes: integer('bytes'),
  transcript: text('transcript'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (t) => [
  index('artifacts_submissionId_idx').on(t.submissionId),
])

/** final / aiDraft 存 JSON：{ criterionId, level, evidence[], studentFeedback, parentFeedback, missingEvidence }[] */
export const assessments = sqliteTable('assessments', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id').notNull().unique().references(() => submissions.id, { onDelete: 'cascade' }),
  aiDraft: text('ai_draft', { mode: 'json' }),
  final: text('final', { mode: 'json' }),
  weighted: real('weighted'),
  confirmedAt: integer('confirmed_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (t) => [
  index('assessments_submissionId_idx').on(t.submissionId),
])

export type Klass = typeof classes.$inferSelect
export type Student = typeof students.$inferSelect
export type Rubric = typeof rubrics.$inferSelect
export type Assignment = typeof assignments.$inferSelect
export type Submission = typeof submissions.$inferSelect
export type Artifact = typeof artifacts.$inferSelect
export type Assessment = typeof assessments.$inferSelect
