import AccountDashboard from '@/app/(website)/account/panel'
import { Suspense } from 'react'

export const metadata = {
  title: 'Account | Metro Memory',
  description:
    'Create an account to sync your Metro Memory progress and achievements across devices.',
}

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Suspense fallback={<div>Loading...</div>}>
        <AccountDashboard />
      </Suspense>
    </div>
  )
}
