import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'
import { localeHead } from '@/features/seo/seo'
import { getOrigin } from '@/features/seo/seo.fns'
import { getOptionalUser } from '@/features/auth/middleware'
import { SiteNav } from '@/components/marketing/site-nav'
import { Footer } from '@/components/marketing/footer'
import { buttonVariants } from '@/components/ui/button'
import type { Locale } from '@/features/i18n/locale'

const rootRoute = getRouteApi('__root__')

export const Route = createFileRoute('/{-$locale}/pricing')({
  loader: async () => {
    const [origin, user] = await Promise.all([getOrigin(), getOptionalUser()])
    return { origin, loggedIn: !!user }
  },
  head: ({ loaderData, params }) => {
    const origin = loaderData?.origin ?? ''
    const locale = ((params as { locale?: string }).locale ?? 'en') as Locale
    const { meta, links } = localeHead({
      origin,
      locale,
      path: '/pricing',
      title: locale === 'zh' ? '定价 — Rubricly' : 'Pricing — Rubricly',
      description:
        locale === 'zh'
          ? '内测期间全部免费，无需绑定任何支付方式。'
          : 'Free while in beta. No card required.',
    })
    return { meta, links }
  },
  component: Pricing,
})

const TIERS = [
  {
    name: 'Beta',
    price: 'Free',
    note: 'While we are in beta',
    items: ['1 class', '20 assessments / month', 'Full exports, no watermark', 'Direct line to the person building it'],
    cta: 'Start free',
  },
  {
    name: 'Teacher',
    price: 'Announced later',
    note: 'Pricing is not set yet',
    items: ['Unlimited classes', 'Higher assessment volume', 'Student portfolios', 'Priority processing'],
    cta: 'Join the waitlist',
  },
  {
    name: 'Department',
    price: 'Announced later',
    note: 'Pricing is not set yet',
    items: ['Several teachers', 'Shared rubric library', 'Cross-class consistency report'],
    cta: 'Join the waitlist',
  },
]

function Pricing() {
  const { loggedIn } = Route.useLoaderData()
  const { theme } = rootRoute.useLoaderData()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav theme={theme} loggedIn={loggedIn} />

      <section className="mx-auto max-w-5xl px-5 py-14 md:px-7">
        <span className="kicker">// pricing</span>
        <h1 className="m-0 mt-3 font-display text-[32px] font-semibold tracking-[-1px] sm:text-[38px]">
          Free while we are building this.
        </h1>
        <p className="m-0 mt-4 max-w-[38em] text-base leading-relaxed text-fg-2">
          Rubricly is in beta. Everything is free, nothing asks for a card. When paid plans arrive,
          teachers who joined during the beta keep their usage at no cost.
        </p>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div key={tier.name} className="rounded-2xl border border-border bg-bg-alt p-5">
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-3">
                {tier.name}
              </div>
              <div className="mt-2 font-display text-[24px] font-semibold tracking-[-0.6px]">
                {tier.price}
              </div>
              <div className="mt-1 text-[12.5px] text-fg-3">{tier.note}</div>
              <ul className="mt-4 border-t border-border pt-3">
                {tier.items.map((item) => (
                  <li key={item} className="py-1.5 text-[13.5px] leading-relaxed text-fg-2">
                    <span className="mr-2 inline-block h-1 w-1 rounded-full bg-primary align-middle" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={tier.name === 'Beta' ? '/{-$locale}/register' : '/{-$locale}/waitlist'}
                className={buttonVariants({
                  variant: tier.name === 'Beta' ? 'default' : 'outline',
                  size: 'sm',
                  className: 'mt-4 w-full',
                })}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[12.5px] leading-relaxed text-fg-3">
          No subscription is required to use Rubricly today. There is no template licence, no
          seat fee and no setup charge.
        </p>
      </section>

      <Footer theme={theme} />
    </div>
  )
}
