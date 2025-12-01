import classNames from 'classnames'

import useTranslation from '@/hooks/useTranslation'

export default function PrivacyPanel({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <section
      className={classNames(
        'rounded-2xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed text-zinc-700 shadow-sm dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-300',
        className,
      )}
    >
      <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t('privacyTitle')}
      </h3>
      <p className="mt-3">
        {t('privacyIntro')}
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>
          <strong>{t('privacyPasswordsLabel')}</strong> {t('privacyPasswordsDesc')}
        </li>
        <li>
          <strong>{t('privacySessionsLabel')}</strong> {t('privacySessionsDesc')}
        </li>
        <li>
          <strong>{t('privacyProgressLabel')}</strong> {t('privacyProgressDesc')}
        </li>
        <li>
          <strong>{t('privacyVerificationLabel')}</strong> {t('privacyVerificationDesc')}
        </li>
      </ul>
    </section>
  )
}
