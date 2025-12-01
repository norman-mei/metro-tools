'use client'

import { useSettings } from '@/context/SettingsContext'
import { i18n } from '@/lib/i18n'

const useTranslation = () => {
  const { settings } = useSettings()
  i18n.locale(settings.language)

  return i18n
}

export default useTranslation
