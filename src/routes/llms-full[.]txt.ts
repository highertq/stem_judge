import { createFileRoute } from '@tanstack/react-router'
import { getLLMFullText } from '@/features/docs/llm'

// `/llms-full.txt` — every docs page concatenated as plain Markdown, so an LLM
// can ingest the whole documentation in one request.
const handler = () =>
  new Response(getLLMFullText(), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  })

export const Route = createFileRoute('/llms-full.txt')({
  server: { handlers: { GET: handler } },
})
