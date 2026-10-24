import { createFileRoute } from '@tanstack/react-router'
import { env } from '@/lib/env'
import { buildSitemap } from '@/features/seo/seo'
import { source } from '@/features/docs/source'

const handler = () => {
  const docsPaths = source.getPages().map((p) => p.url)
  return new Response(buildSitemap(new URL(env.BETTER_AUTH_URL).origin, docsPaths), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
}

export const Route = createFileRoute('/sitemap.xml')({
  server: { handlers: { GET: handler } },
})
