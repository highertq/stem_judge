export type ChangelogRaw = {
  info: { path: string }
  title: string
  description?: string
  date: string
  version: string
  published?: boolean
}

export type ChangelogMeta = {
  path: string
  title: string
  description?: string
  date: string
  version: string
}

/** Filter a fumadocs changelog collection by locale (.zh filename), drop unpublished, sort newest first. */
export function selectChangelog(entries: ChangelogRaw[], locale: string): ChangelogMeta[] {
  const zh = locale === 'zh'
  return entries
    .filter((e) => (zh ? e.info.path.includes('.zh') : !e.info.path.includes('.zh')))
    .filter((e) => e.published !== false)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((e) => ({ path: e.info.path, title: e.title, description: e.description, date: e.date, version: e.version }))
}
