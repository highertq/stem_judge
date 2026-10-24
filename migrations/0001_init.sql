-- Rubricly / stem_judge — initial schema (Cloudflare D1)
-- 设计原则：Student 表只存显示名与编号，不存邮箱、不存人脸，
-- 尽量把 COPPA / GDPR-K 的暴露面降到最低。

CREATE TABLE IF NOT EXISTS teachers (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  school        TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',
  credits       INTEGER NOT NULL DEFAULT 20,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS classes (
  id            TEXT PRIMARY KEY,
  teacher_id    TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  subject       TEXT,
  grade_band    TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
  id            TEXT PRIMARY KEY,
  class_id      TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  display_name  TEXT NOT NULL,
  code          TEXT
);

CREATE TABLE IF NOT EXISTS rubrics (
  id            TEXT PRIMARY KEY,
  teacher_id    TEXT REFERENCES teachers(id),
  name          TEXT NOT NULL,
  scale         INTEGER NOT NULL DEFAULT 4,
  criteria      TEXT NOT NULL,
  is_template   INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assignments (
  id            TEXT PRIMARY KEY,
  class_id      TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  rubric_id     TEXT REFERENCES rubrics(id),
  title         TEXT NOT NULL,
  instructions  TEXT,
  due_at        TEXT,
  status        TEXT NOT NULL DEFAULT 'open',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id            TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id    TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'submitted',
  submitted_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS artifacts (
  id            TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,
  r2_key        TEXT,
  external_url  TEXT,
  bytes         INTEGER,
  transcript    TEXT,
  frames        TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assessments (
  id            TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  ai_draft      TEXT,
  final         TEXT,
  weighted      REAL,
  confirmed_at  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher   ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class    ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_subs_assignment   ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_sub     ON artifacts(submission_id);
