import crypto from 'node:crypto'
import { NextResponse } from 'next/server'

import { normalizeEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function verifySignature(rawBody: string, signature: string | null, secret?: string) {
  if (!secret || !signature) return false
  const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const sigBuf = Buffer.from(signature)
  const cmpBuf = Buffer.from(computed)
  if (sigBuf.length !== cmpBuf.length) return false
  return crypto.timingSafeEqual(sigBuf, cmpBuf)
}

export async function POST(request: Request) {
  const secret = process.env.KOFI_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'Server misconfigured: set KOFI_WEBHOOK_SECRET' },
      { status: 500 },
    )
  }

  const rawBody = await request.text()
  const signature = request.headers.get('X-Signature') || request.headers.get('x-signature')

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let parsed: any
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data = (() => {
    if (parsed?.data) {
      if (typeof parsed.data === 'string') {
        try {
          return JSON.parse(parsed.data)
        } catch {
          return null
        }
      }
      if (typeof parsed.data === 'object') {
        return parsed.data
      }
    }
    return parsed
  })()

  if (!data || typeof data !== 'object') {
    return NextResponse.json({ error: 'Missing payload' }, { status: 400 })
  }

  const emailRaw =
    data.email || data.email_address || data.payer_email || data.from_email || ''
  const normalizedEmail =
    typeof emailRaw === 'string' && emailRaw.trim().length > 0
      ? normalizeEmail(emailRaw)
      : null

  if (!normalizedEmail) {
    return NextResponse.json(
      { error: 'Email not provided in Ko-fi payload' },
      { status: 400 },
    )
  }

  const amountRaw = data.amount ?? data.total ?? data.value ?? 0
  const amount = typeof amountRaw === 'string' ? parseFloat(amountRaw) : Number(amountRaw)
  const isEligible = Number.isFinite(amount) && amount >= 1

  if (!isEligible) {
    return NextResponse.json(
      { updated: 0, message: 'Donation below $1 threshold; skipping ad-free' },
      { status: 200 },
    )
  }

  const result = await prisma.user.updateMany({
    where: { email: normalizedEmail },
    data: { adFree: true },
  })

  return NextResponse.json({ updated: result.count })
}
