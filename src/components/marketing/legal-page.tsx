import { Link } from '@tanstack/react-router'
import { useTranslation } from '@/features/i18n/provider'
import { SiteNav } from '@/components/marketing/site-nav'
import { Footer } from '@/components/marketing/footer'

/** Shared shell for the placeholder legal pages (/terms, /privacy). */
export function LegalPage({
  theme,
  loggedIn,
  title,
}: {
  theme: 'light' | 'dark'
  loggedIn: boolean
  title: string
}) {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav theme={theme} loggedIn={loggedIn} />
      <main className="mx-auto max-w-[680px] px-5 md:px-7 py-16">
        <h1 className="page-h">{title}</h1>
        <p className="mt-4 leading-relaxed text-fg-2">{t('legal.placeholder')}</p>
        <p className="mt-8">
          <Link to="/{-$locale}" className="font-semibold text-primary">
            ← {t('common.appName')}
          </Link>
        </p>
      </main>
      <Footer theme={theme} />
    </div>
  )
}
