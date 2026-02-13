import { Container } from '@/components/Container'
import Link from 'next/link'

export default function TransitGuesserPage() {
  return (
    <Container className="mt-10 pb-20">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          TransitGuesser
        </h1>
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
          Embedded from <code>tools/transitguesser/index.html</code>. If maps do not
          load, edit the Mapbox token in that file and in{' '}
          <code>public/transitguesser/index.html</code>.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/transitguesser/index.html"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Open Fullscreen
        </a>
        <Link
          href="/tools"
          className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Back to Local Project Index
        </Link>
      </div>

      <div className="mt-6 h-[75vh] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <iframe
          src="/transitguesser/index.html"
          title="TransitGuesser"
          className="h-full w-full"
        />
      </div>
    </Container>
  )
}
