import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = changePasswordSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const isPasswordValid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  )

  if (!isPasswordValid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 403 })
  }

  const passwordHash = await hashPassword(parsed.data.newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
    },
  })

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  })

  return NextResponse.json({ message: 'Password updated successfully.' })
}
