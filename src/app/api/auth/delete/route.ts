import { NextResponse } from 'next/server'

import { clearSessionCookie, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.user.delete({
    where: { id: user.id },
  })

  await clearSessionCookie()

  return NextResponse.json({ ok: true })
}
