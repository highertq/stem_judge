import { Link } from '@tanstack/react-router'
import { useTranslation } from '@/features/i18n/provider'
import { buttonVariants } from '@/components/ui/button'

export function CTA({ loggedIn }: { loggedIn: boolean }) {
  const { t } = useTranslation()

  return (
    <section className="grid-bg border-t border-border px-5 py-14 text-center md:px-7">
      <h2 className="font-display text-[28px] font-semibold tracking-[-0.6px]">{t('marketing.ctaTitle')}</h2>
      <p className="mx-auto mb-6 mt-2.5 max-w-[32em] text-[15px] text-fg-2">{t('marketing.ctaBody')}</p>
      <Link
        to={loggedIn ? '/{-$locale}/app' : '/{-$locale}/register'}
        className={buttonVariants({ size: 'lg' })}
      >
        {t('marketing.ctaButton')}
      </Link>
      <p className="mx-auto mt-4 max-w-[34em] text-[12.5px] leading-relaxed text-fg-3">
        No card, no seat licence, no setup fee. Use one class for as long as you like.
      </p>
    </section>
  )
}
