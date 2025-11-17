import nodemailer from 'nodemailer'

const {
  BREVO_HOST,
  BREVO_PORT,
  BREVO_USER,
  BREVO_PASS,
  MAIL_FROM_NAME,
  MAIL_FROM_EMAIL,
  APP_BASE_URL,
  NEXT_PUBLIC_BASE_URL,
} = process.env

const transporter = nodemailer.createTransport({
  host: BREVO_HOST,
  port: Number(BREVO_PORT ?? 587),
  secure: Number(BREVO_PORT ?? 587) === 465,
  auth: {
    user: BREVO_USER,
    pass: BREVO_PASS,
  },
})

function resolveBaseUrl() {
  return APP_BASE_URL ?? NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
}

function buildFromAddress() {
  if (MAIL_FROM_NAME && MAIL_FROM_EMAIL) {
    return `"${MAIL_FROM_NAME}" <${MAIL_FROM_EMAIL}>`
  }
  if (MAIL_FROM_EMAIL) {
    return MAIL_FROM_EMAIL
  }
  return 'Metro Memory <no-reply@metromemory.com>'
}

export async function sendVerificationEmail(to: string, token: string, newEmail?: string) {
  if (!BREVO_HOST || !BREVO_USER || !BREVO_PASS) {
    throw new Error('SMTP credentials are missing. Check your environment variables.')
  }

  const baseUrl = resolveBaseUrl()
  const verifyUrl = new URL('/api/auth/verify-email', baseUrl)
  verifyUrl.searchParams.set('token', token)
  if (newEmail) {
    verifyUrl.searchParams.set('newEmail', newEmail)
  }

  const from = buildFromAddress()

  const isEmailChange = Boolean(newEmail)
  const subject = isEmailChange
    ? 'Confirm your new Metro Memory email'
    : 'Verify your Metro Memory account'
  const text = isEmailChange
    ? [
        'You requested to change your Metro Memory sign-in email.',
        '',
        'Click the link below to confirm this new address:',
        verifyUrl.toString(),
        '',
        'If you did not request this, you can safely ignore this message and your account email will stay the same.',
      ].join('\n')
    : [
        'Welcome to Metro Memory!',
        '',
        'Click the link below to verify your email address and activate your account:',
        verifyUrl.toString(),
        '',
        'If you did not create this account, you can safely ignore this message.',
      ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="color: #0ea5e9; margin-bottom: 16px;">One quick step left</h2>
      <p>${
        isEmailChange
          ? 'Tap the button below to confirm your new sign-in email for Metro Memory.'
          : 'Tap the button below to verify your email address and finish setting up your Metro Memory account.'
      }</p>
      <p style="margin: 24px 0;">
        <a
          href="${verifyUrl.toString()}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #0ea5e9;
            color: #ffffff;
            text-decoration: none;
            border-radius: 999px;
            font-weight: 600;
          "
        >
          Verify email
        </a>
      </p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">
        <a href="${verifyUrl.toString()}" style="color: #0ea5e9;">
          ${verifyUrl.toString()}
        </a>
      </p>
      <p style="margin-top: 24px;">You can ignore this email if you did not create an account.</p>
    </div>
  `

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })
}
