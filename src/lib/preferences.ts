import { SUPPORTED_LANGUAGES } from '@/lib/i18n'

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export type CollapsedSections = Record<string, boolean>

export type UiPreferences = {
  collapsedSections?: CollapsedSections
  language?: string
}

export function normalizeCollapsedSections(
  value: unknown,
): CollapsedSections | undefined {
  if (!isRecord(value)) {
    return undefined
  }
  const entries = Object.entries(value).reduce<CollapsedSections>(
    (acc, [sectionId, raw]) => {
      if (typeof raw === 'boolean') {
        acc[sectionId] = raw
      }
      return acc
    },
    {},
  )
  return Object.keys(entries).length > 0 ? entries : undefined
}

export function normalizeLanguage(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  return SUPPORTED_LANGUAGES.some((lang) => lang.code === value)
    ? value
    : undefined
}

export function normalizeUiPreferences(value: unknown): UiPreferences {
  if (!isRecord(value)) {
    return {}
  }

  const collapsedSections = normalizeCollapsedSections(
    value.collapsedSections,
  )
  const language = normalizeLanguage(value.language)

  return {
    ...(collapsedSections ? { collapsedSections } : {}),
    ...(language ? { language } : {}),
  }
}

export function mergeCollapsedSections(
  current: CollapsedSections | undefined,
  updates: Record<string, boolean>,
): CollapsedSections {
  return {
    ...(current ?? {}),
    ...updates,
  }
}
