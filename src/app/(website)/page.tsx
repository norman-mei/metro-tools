import { Container } from '@/components/Container'
import Link from 'next/link'

type ToolCard = {
  name: string
  description: string
  href: string
  actionLabel: string
}

const builtInTools: ToolCard[] = [
  {
    name: 'Metro Memory',
    description:
      'Play the map-based station memory game. This is now one part of Metro Tools.',
    href: '/metro-memory',
    actionLabel: 'Open Tool',
  },
  {
    name: 'TransitGuesser',
    description:
      'Transit station guessing game bundled directly in this repository.',
    href: '/transitguesser',
    actionLabel: 'Open Tool',
  },
  {
    name: 'Stripmap',
    description: 'Browse stripmap reference images merged into this workspace.',
    href: '/stripmap',
    actionLabel: 'Open Tool',
  },
  {
    name: 'Rail Map Toolkit',
    description:
      'Built-in toolkit module sourced from tools/railmapgen.github.io-main.',
    href: '/railmap-toolkit',
    actionLabel: 'Open Tool',
  },
  {
    name: 'RMP',
    description: 'Built-in module sourced from tools/rmp-main.',
    href: '/rmp',
    actionLabel: 'Open Tool',
  },
  {
    name: 'RMA',
    description: 'Built-in module sourced from tools/rma-main.',
    href: '/rma',
    actionLabel: 'Open Tool',
  },
  {
    name: 'RMG Palette',
    description: 'Built-in module sourced from tools/rmg-palette-main.',
    href: '/rmg-palette',
    actionLabel: 'Open Tool',
  },
  {
    name: 'RSG',
    description: 'Built-in module sourced from tools/rsg-main.',
    href: '/rsg',
    actionLabel: 'Open Tool',
  },
]

function ToolGrid({ tools }: { tools: ToolCard[] }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <Link
          key={tool.name}
          href={tool.href}
          className="group flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 transition group-hover:text-teal-600 dark:text-zinc-100 dark:group-hover:text-teal-300">
              {tool.name}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {tool.description}
            </p>
          </div>
          <div className="mt-5 inline-flex items-center text-sm font-semibold text-zinc-700 transition group-hover:text-zinc-900 dark:text-zinc-200 dark:group-hover:text-zinc-50">
            {tool.actionLabel} <span aria-hidden="true" className="ml-1">→</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function MetroToolsLandingPage() {
  return (
    <Container className="mt-12 pb-20">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-500 dark:text-teal-400">
          Metro Tools
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Choose what you want to do
        </h1>
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
          Metro Tools is now the umbrella workspace. All requested modules are
          listed below as built-in tools.
        </p>
      </header>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Built-in Tools
          </h2>
          <Link
            href="/tools"
            className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            View Tool Paths
          </Link>
        </div>
        <ToolGrid tools={builtInTools} />
      </section>
    </Container>
  )
}
