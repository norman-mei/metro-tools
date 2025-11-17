import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { clearVerificationTokensForUser, hashValue, normalizeEmail } from '@/lib/auth'

function buildRedirect(requestUrl: string, status: 'success' | 'error') {
  const url = new URL(requestUrl)
  url.pathname = '/'
  url.search = ''
  url.searchParams.set('tab', 'account')
  url.searchParams.set('verified', status)
  url.hash = ''
  return NextResponse.redirect(url, { status: status === 'success' ? 302 : 303 })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const newEmailParam = url.searchParams.get('newEmail')

  if (!token) {
    return buildRedirect(request.url, 'error')
  }

  if (newEmailParam) {
    const normalizedEmail = normalizeEmail(newEmailParam)

    const tokenHash = hashValue(`${token}:${normalizedEmail}`)
    const record = await prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })

    if (!record || record.expiresAt < new Date()) {
      if (record) {
        await prisma.verificationToken.delete({
          where: { id: record.id },
        })
      }
      return buildRedirect(request.url, 'error')
    }

    if (!record.user.pendingEmail || record.user.pendingEmail !== normalizedEmail) {
      await prisma.verificationToken.delete({
        where: { id: record.id },
      })
      return buildRedirect(request.url, 'error')
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingEmail) {
      await prisma.verificationToken.delete({
        where: { id: record.id },
      })
      return buildRedirect(request.url, 'error')
    }

    await prisma.user.update({
      where: { id: record.userId },
      data: {
        email: normalizedEmail,
        pendingEmail: null,
        emailVerifiedAt: new Date(),
      },
    })

    await clearVerificationTokensForUser(record.userId)

    return buildRedirect(request.url, 'success')
  }

  const tokenHash = hashValue(token)
  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.verificationToken.delete({
        where: { id: record.id },
      })
    }
    return buildRedirect(request.url, 'error')
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: {
      emailVerifiedAt: new Date(),
    },
  })

  await clearVerificationTokensForUser(record.userId)

  return buildRedirect(request.url, 'success')
}
