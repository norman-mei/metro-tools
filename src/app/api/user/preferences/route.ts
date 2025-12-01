import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/auth'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'
import { prisma } from '@/lib/prisma'
import {
  mergeCollapsedSections,
  normalizeUiPreferences,
} from '@/lib/preferences'

type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

const SUPPORTED_LANGUAGE_CODES = new Set<LanguageCode>(
  SUPPORTED_LANGUAGES.map((lang) => lang.code),
)

const isSupportedLanguage = (val: string) =>
  SUPPORTED_LANGUAGE_CODES.has(val as LanguageCode)

const preferencesSchema = z.object({
  collapsedSections: z.record(z.string(), z.boolean()).optional(),
  language: z
    .string()
    .refine(isSupportedLanguage, 'Unsupported language')
    .optional(),
})

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = preferencesSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const existingPreferences = normalizeUiPreferences(user.uiPreferences)

  const nextPreferences = {
    ...existingPreferences,
    ...(parsed.data.collapsedSections
      ? {
          collapsedSections: mergeCollapsedSections(
            existingPreferences.collapsedSections,
            parsed.data.collapsedSections,
          ),
        }
      : {}),
    ...(parsed.data.language
      ? { language: parsed.data.language }
      : {}),
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      uiPreferences: nextPreferences,
    },
  })

  return NextResponse.json({
    preferences: normalizeUiPreferences(updated.uiPreferences),
  })
}
