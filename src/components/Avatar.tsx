import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

export function AvatarContainer({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={clsx(
        className,
        'rounded-full bg-white/90 p-0.5 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:ring-white/10',
      )}
      {...props}
    />
  )
}

export function Avatar({
  large = false,
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href'> & {
  large?: boolean
}) {
  return (
    <Link
      href="/metro-memory"
      aria-label="Home"
      className={clsx(className, 'pointer-events-auto')}
      {...props}
    >
      <Image
        src="/favicon.ico"
        width={531}
        height={661}
        alt=""
        sizes={large ? '5rem' : '2.25rem'}
        className={clsx(
          'h-full w-full rounded-full bg-zinc-100 object-contain dark:bg-zinc-800',
        )}
        priority
      />
    </Link>
  )
}
