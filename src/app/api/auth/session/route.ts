import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth'
import { normalizeUiPreferences } from '@/lib/preferences'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ user: null, progressSummaries: [] })
  }

  const progress = await prisma.progress.findMany({
    where: { userId: user.id },
  })

  const summaries = progress.map((entry: any) => {
    const raw = Array.isArray(entry.foundIds) ? entry.foundIds : []
    const foundIds = raw.filter((id: any): id is number => typeof id === 'number')
    return {
      citySlug: entry.citySlug,
      foundCount: new Set(foundIds).size,
    }
  })

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
    },
    progressSummaries: summaries,
    uiPreferences: normalizeUiPreferences(user.uiPreferences),
  })
}
