import { ShieldCheck, CreditCard, LayoutDashboard, HardDrive, Mail, Languages, Search, Lock } from 'lucide-react'
import { useTranslation } from '@/features/i18n/provider'
import { Card } from '@/components/ui/card'

// Icon + structure here; titles/bodies live in the dictionary (translatable).
const ITEMS = [
  { Icon: ShieldCheck, title: 'features.f1Title', body: 'features.f1Body' },
  { Icon: CreditCard, title: 'features.f2Title', body: 'features.f2Body' },
  { Icon: LayoutDashboard, title: 'features.f3Title', body: 'features.f3Body' },
  { Icon: HardDrive, title: 'features.f4Title', body: 'features.f4Body' },
  { Icon: Mail, title: 'features.f5Title', body: 'features.f5Body' },
  { Icon: Languages, title: 'features.f6Title', body: 'features.f6Body' },
  { Icon: Search, title: 'features.f7Title', body: 'features.f7Body' },
  { Icon: Lock, title: 'features.f8Title', body: 'features.f8Body' },
] as const

export function FeatureGrid() {
  const { t } = useTranslation()
  return (
    <section className="border-t border-border px-5 md:px-7 py-12">
      <span className="kicker">{t('features.kicker')}</span>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ Icon, title, body }) => (
          <Card key={title} className="p-5">
            <div className="flex items-center gap-2.5">
              <span className="icon-tile">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="m-0 text-[17px] font-semibold">{t(title)}</h3>
            </div>
            <p className="mb-0 mt-2.5 text-[13.5px] leading-relaxed text-fg-2">{t(body)}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
