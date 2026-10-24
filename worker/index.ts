import { Hono } from 'hono'

export interface Env {
  DB: D1Database
  BUCKET: R2Bucket
  ASSETS: Fetcher
  ENVIRONMENT?: string
}

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', async (c) => {
  let db = 'unbound'
  try {
    const row = await c.env.DB.prepare('select 1 as ok').first<{ ok: number }>()
    db = row?.ok === 1 ? 'ok' : 'unexpected'
  } catch (err) {
    db = 'error: ' + (err as Error).message
  }

  let storage = 'unbound'
  try {
    await c.env.BUCKET.list({ limit: 1 })
    storage = 'ok'
  } catch (err) {
    storage = 'error: ' + (err as Error).message
  }

  return c.json({
    ok: true,
    service: 'stem-judge',
    runtime: 'cloudflare-workers',
    db,
    storage,
    ts: new Date().toISOString(),
  })
})

const RUBRICS = [
  {
    id: 'engineering-design',
    name: 'Engineering Design Process',
    criteria: 5,
    description: 'Problem definition, iteration, fabrication, testing, reflection.',
  },
  {
    id: 'maker-skills',
    name: 'Maker & Fabrication Skills',
    criteria: 4,
    description: 'Tool safety, joinery, finish, documentation of process.',
  },
  {
    id: 'scientific-inquiry',
    name: 'Scientific Inquiry',
    criteria: 4,
    description: 'Question, method, data quality, conclusion validity.',
  },
  {
    id: 'computational-thinking',
    name: 'Computational Thinking',
    criteria: 5,
    description: 'Decomposition, abstraction, code quality, debugging, iteration.',
  },
  {
    id: 'collaboration',
    name: 'Collaboration & Reflection',
    criteria: 3,
    description: 'Team contribution, conflict handling, metacognition.',
  },
]

app.get('/api/rubrics', (c) => c.json({ rubrics: RUBRICS }))

app.notFound((c) => c.json({ error: 'not_found', path: c.req.path }, 404))

app.onError((err, c) => {
  console.error('worker error', err)
  return c.json({ error: 'internal_error', message: err.message }, 500)
})

export default app
