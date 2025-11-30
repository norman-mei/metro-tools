import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

type RouteParams = {
  params: Promise<{
    citySlug: string
  }>
}

const progressSchema = z.object({
  foundIds: z.array(z.number().int().nonnegative()).max(10000),
  foundTimestamps: z.record(z.string(), z.string()).optional(),
})

const isRecordOfStrings = (value: unknown): value is Record<string, string> => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return Object.values(value as Record<string, unknown>).every(
    (entry): entry is string => typeof entry === 'string',
  )
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { citySlug } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!citySlug) {
    return NextResponse.json({ error: 'Missing city' }, { status: 400 })
  }

  const record = await prisma.progress.findUnique({
    where: {
      userId_citySlug: {
        userId: user.id,
        citySlug,
      },
    },
  })

  if (!record) {
    return NextResponse.json({ progress: null })
  }

  const storedTimestamps = isRecordOfStrings(record.foundTimestamps)
    ? record.foundTimestamps
    : {}

  return NextResponse.json({
    progress: {
      foundIds: Array.isArray(record.foundIds)
        ? record.foundIds.filter((id): id is number => typeof id === 'number')
        : [],
      foundTimestamps: storedTimestamps,
    },
  })
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { citySlug } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!citySlug) {
    return NextResponse.json({ error: 'Missing city' }, { status: 400 })
  }

  const json = await request.json().catch(() => null)
  const parsed = progressSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const uniqueIds = Array.from(
    new Set(parsed.data.foundIds.filter((id) => Number.isFinite(id))),
  )
  const foundTimestamps: Record<string, string> = parsed.data.foundTimestamps ?? {}

  await prisma.progress.upsert({
    where: {
      userId_citySlug: {
        userId: user.id,
        citySlug,
      },
    },
    update: {
      foundIds: uniqueIds,
      foundTimestamps,
    },
    create: {
      userId: user.id,
      citySlug,
      foundIds: uniqueIds,
      foundTimestamps,
    },
  })

  return NextResponse.json({ ok: true, foundCount: uniqueIds.length })
}
