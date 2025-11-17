import { NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import {
  clearVerificationTokensForUser,
  createVerificationToken,
  getCurrentUser,
  normalizeEmail,
} from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/mailer'

const bodySchema = z.object({
  email: z.string().email().optional(),
})

export async function POST(request: Request) {
  const authUser = await getCurrentUser()
  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)

  let targetEmail: string | null = null
  if (authUser) {
    targetEmail = authUser.email
  } else if (parsed.success && parsed.data.email) {
    targetEmail = normalizeEmail(parsed.data.email)
  }

  if (!targetEmail) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  })

  if (!user) {
    return NextResponse.json({
      message: 'If that account exists, a verification email was sent.',
    })
  }

  if (user.emailVerifiedAt) {
    return NextResponse.json({
      message: 'That account is already verified.',
    })
  }

  await clearVerificationTokensForUser(user.id)
  const { token } = await createVerificationToken(user.id)
  await sendVerificationEmail(user.email, token)

  return NextResponse.json({
    message: 'Verification email sent. Please check your inbox.',
  })
}
