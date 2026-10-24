import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from '@/features/i18n/provider'
import { buttonVariants } from '@/components/ui/button'

function EvidenceCard() {
  return (
    <div className="rounded-2xl border border-border bg-bg-alt p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.08em] text-fg-3">Design &amp; iteration</span>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">4 / 4</span>
      </div>
      <p className="m-0 text-sm leading-relaxed text-foreground">
        <span className="mr-1.5 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[12px] text-primary">02:14</span>
        Student explains the current path from the battery through the resistor into the LED, and
        points to the jumper on the breadboard.
      </p>
      <div className="mt-4 border-t border-border pt-3 text-[12.5px] leading-relaxed text-fg-3">
        Every rating points at a timestamp, a frame, or a line in the design log. That is the
        difference between a draft you can sign and a draft you have to rewrite.
      </div>
      <div className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-[12.5px] text-amber-700">
        Testing &amp; evidence — 2 / 4 · no load-vs-deflection data recorded
      </div>
    </div>
  )
}

export function Hero({ loggedIn }: { loggedIn: boolean }) {
  const { t } = useTranslation()

  return (
    <section className="grid-bg grid items-center gap-9 px-5 py-14 md:px-7 md:grid-cols-2">
      <div className="flex flex-col gap-[18px]">
        <span className="kicker">{t('marketing.heroKicker')}</span>
        <h1 className="font-display text-[34px] font-semibold leading-[1.08] tracking-[-1.2px] sm:text-[42px]">
          {t('marketing.heroTitlePre')}
          <span className="text-primary">{t('marketing.heroTitleHl')}</span>
          {t('marketing.heroTitlePost')}
        </h1>
        <p className="m-0 max-w-[34em] text-base leading-relaxed text-fg-2">
          {t('marketing.heroSubtitle')}
        </p>
        <div className="mt-1 flex flex-wrap gap-2.5">
          {loggedIn ? (
            <Link to="/{-$locale}/app" className={buttonVariants({ size: 'lg' })}>
              {t('marketing.heroCtaPrimary')} <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/{-$locale}/register" className={buttonVariants({ size: 'lg' })}>
              {t('marketing.heroCtaPrimary')} <ArrowRight size={18} />
            </Link>
          )}
          <Link
            to="/{-$locale}"
            hash="features"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            {t('marketing.heroCtaSecondary')}
          </Link>
        </div>
      </div>
      <EvidenceCard />
    </section>
  )
}
