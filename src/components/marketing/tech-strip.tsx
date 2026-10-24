import { useTranslation } from '@/features/i18n/provider'

const PROMISES = [
  'Works on Chromebooks and iPads',
  'Nothing for students to install',
  'Your rubric stays your rubric',
  'Student data kept minimal',
] as const

export function TechStrip() {
  const { t } = useTranslation()
  return (
    <section className="border-t border-border px-5 py-4 md:px-7">
      <p className="m-0 text-center text-[12.5px] text-fg-3">
        <span className="text-primary">{t('marketing.builtOn')}</span> {PROMISES.join(' · ')}
      </p>
    </section>
  )
}
