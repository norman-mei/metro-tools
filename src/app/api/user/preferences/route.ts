import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/auth'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'
import { prisma } from '@/lib/prisma'
import {
  mergeCollapsedSections,
  mergeMapViewByCity,
  normalizeUiPreferences,
  mergeHomeScrollPositions,
  type HomeActiveTab,
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
  timezone: z.string().min(1).optional(),
  hourFormat: z.enum(['12h', '24h']).optional(),
  cityViewMode: z
    .enum(['globe', 'map', 'comfortable', 'compact', 'cover', 'list'])
    .optional(),
  cityViewSatellite: z.boolean().optional(),
  continentNavOpen: z.boolean().optional(),
  homeActiveTab: z
    .enum([
      'cities',
      'achievements',
      'updateLog',
      'credits',
      'testimonials',
      'press',
      'settings',
      'account',
      'globalStats',
      'privacy',
      'support',
    ])
    .optional(),
  homeScrollPositions: z
    .record(
      z.enum([
        'cities',
        'achievements',
        'updateLog',
        'credits',
        'testimonials',
        'press',
        'settings',
        'account',
        'globalStats',
        'privacy',
        'support',
      ]),
      z.number().nonnegative(),
    )
    .optional(),
  mapViewByCity: z
    .record(
      z.string(),
      z.object({
        zoom: z.number().finite(),
        center: z.tuple([z.number().finite(), z.number().finite()]),
      }),
    )
    .optional(),
  speedrunByCity: z.record(z.string(), z.boolean()).optional(),
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
    ...(parsed.data.timezone ? { timezone: parsed.data.timezone } : {}),
    ...(parsed.data.hourFormat ? { hourFormat: parsed.data.hourFormat } : {}),
    ...(parsed.data.cityViewMode ? { cityViewMode: parsed.data.cityViewMode } : {}),
    ...(typeof parsed.data.cityViewSatellite === 'boolean'
      ? { cityViewSatellite: parsed.data.cityViewSatellite }
      : {}),
    ...(typeof parsed.data.continentNavOpen === 'boolean'
      ? { continentNavOpen: parsed.data.continentNavOpen }
      : {}),
    ...(parsed.data.homeActiveTab ? { homeActiveTab: parsed.data.homeActiveTab as HomeActiveTab } : {}),
    ...(parsed.data.homeScrollPositions
      ? {
          homeScrollPositions: mergeHomeScrollPositions(
            existingPreferences.homeScrollPositions,
            parsed.data.homeScrollPositions,
          ),
        }
      : {}),
    ...(parsed.data.mapViewByCity
      ? {
          mapViewByCity: mergeMapViewByCity(
            existingPreferences.mapViewByCity,
            parsed.data.mapViewByCity,
          ),
        }
      : {}),
    ...(parsed.data.speedrunByCity
      ? {
          speedrunByCity: {
            ...(existingPreferences.speedrunByCity ?? {}),
            ...parsed.data.speedrunByCity,
          },
        }
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
