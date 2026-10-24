import { createFileRoute } from '@tanstack/react-router'
import { env } from '@/lib/env'
import { createDb } from '@/db/client'
import { createAuth } from '@/features/auth/auth.server'

const handler = ({ request }: { request: Request }) => {
  const auth = createAuth(env, createDb(env.DB))
  return auth.handler(request)
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
})
