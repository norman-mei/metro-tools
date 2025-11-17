import classNames from 'classnames'

export default function PrivacyPanel({ className }: { className?: string }) {
  return (
    <section
      className={classNames(
        'rounded-2xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed text-zinc-700 shadow-sm dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-300',
        className,
      )}
    >
      <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Privacy &amp; Security
      </h3>
      <p className="mt-3">
        Metro Memory now supports accounts so you can sync progress and achievements across devices.
        Here&apos;s how your data is handled:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>
          <strong>Passwords</strong> are hashed with bcrypt before they ever touch the database. We never
          store or log plain-text passwords.
        </li>
        <li>
          <strong>Sessions</strong> are maintained with short-lived, server-side tokens. Logging out or
          resetting your password revokes them immediately.
        </li>
        <li>
          <strong>Progress data</strong> (found stations + timestamps) is only saved to your account when
          you opt in by creating one. Guests continue to use local browser storage.
        </li>
        <li>
          <strong>Email verification and password resets</strong> are required during sign up to prevent
          abuse and to keep your achievements tied to your inbox.
        </li>
      </ul>
    </section>
  )
}
