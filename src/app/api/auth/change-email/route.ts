import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser, normalizeEmail, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/mailer'
import { hashValue } from '@/lib/auth'
import crypto from 'crypto'

const changeEmailSchema = z.object({
  newEmail: z.string().email(),
  currentPassword: z.string().min(1),
})

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = changeEmailSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const normalizedEmail = normalizeEmail(parsed.data.newEmail)

  if (normalizedEmail === user.email) {
    return NextResponse.json({ error: 'Email is unchanged' }, { status: 400 })
  }

  const isPasswordValid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  )

  if (!isPasswordValid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 403 })
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Email is already in use' },
      { status: 409 },
    )
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { pendingEmail: normalizedEmail },
  })

  // Keep the current email active until the new one is verified.
  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, type: 'EMAIL' },
  })

  const rawToken = crypto.randomBytes(48).toString('hex')
  const tokenHash = hashValue(`${rawToken}:${normalizedEmail}`)

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      type: 'EMAIL',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  })

  await sendVerificationEmail(normalizedEmail, rawToken, normalizedEmail)

  return NextResponse.json({
    message:
      'Check your inbox to verify the new email. Your current email stays active until you confirm.',
    user: {
      id: user.id,
      email: user.email,
    },
  })
}
