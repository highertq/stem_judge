import { createFileRoute } from '@tanstack/react-router'
import { env } from '@/lib/env'
import { createDb } from '@/db/client'
import { assertAdmin } from '@/features/admin/assert-admin.server'
import { listSponsorships } from '@/features/sponsor/sponsor.server'
import { sponsorsToCsv } from '@/features/sponsor/admin-csv'

const handler = async () => {
  // 与 admin server fn 共用同一道门（fresh session + 撤权即降权）；自建的弱化判据
  // 会让被撤权的旧管理员继续导出全量邮箱。
  try {
    await assertAdmin()
  } catch {
    return new Response('Not Found', { status: 404 })
  }
  const { rows } = await listSponsorships(createDb(env.DB), { page: 0, pageSize: 100000 })
  return new Response(sponsorsToCsv(rows), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="sponsors.csv"',
      'cache-control': 'no-store',
    },
  })
}

export const Route = createFileRoute('/admin/sponsors.csv')({
  server: { handlers: { GET: handler } },
})
