import { Container } from '@/components/Container'
import Link from 'next/link'

type ProjectInfo = {
  name: string
  folder: string
  devCommand: string
  launchHref?: string
  launchLabel?: string
  external?: boolean
}

const projects: ProjectInfo[] = [
  {
    name: 'Metro Memory',
    folder: '.',
    devCommand: 'npm run dev',
    launchHref: '/metro-memory',
    launchLabel: 'Open in Metro Tools',
  },
  {
    name: 'TransitGuesser',
    folder: 'tools/transitguesser',
    devCommand: 'Static single-file app (index.html)',
    launchHref: '/transitguesser',
    launchLabel: 'Open in Metro Tools',
  },
  {
    name: 'Stripmap',
    folder: 'tools/stripmap',
    devCommand: 'Static image set',
    launchHref: '/stripmap',
    launchLabel: 'Open in Metro Tools',
  },
  {
    name: 'Rail Map Toolkit',
    folder: 'tools/railmapgen.github.io-main',
    devCommand: 'npm install && npm run dev -- --port 3200',
    launchHref: '/railmap-toolkit',
    launchLabel: 'Open Tool',
  },
  {
    name: 'RMP',
    folder: 'tools/rmp-main',
    devCommand: 'npm install && npm run dev -- --port 3201',
    launchHref: '/rmp',
    launchLabel: 'Open Tool',
  },
  {
    name: 'RMA',
    folder: 'tools/rma-main',
    devCommand: 'npm install && npm run dev -- --port 3202',
    launchHref: '/rma',
    launchLabel: 'Open Tool',
  },
  {
    name: 'RMG Palette',
    folder: 'tools/rmg-palette-main',
    devCommand: 'npm install && npm run dev -- --port 3203',
    launchHref: '/rmg-palette',
    launchLabel: 'Open Tool',
  },
  {
    name: 'RSG',
    folder: 'tools/rsg-main',
    devCommand: 'npm install && npm run dev -- --port 3204',
    launchHref: '/rsg',
    launchLabel: 'Open Tool',
  },
]

function LaunchButton({
  href,
  label,
  external,
}: {
  href: string
  label: string
  external?: boolean
}) {
  const className =
    'inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}

export default function ToolsIndexPage() {
  return (
    <Container className="mt-10 pb-20">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Built-in Tool Index
        </h1>
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
          All requested repositories are merged under <code>metro-tools/tools</code>.
          Use this index to see folder paths and startup commands for each built-in module.
        </p>
      </header>

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full border-collapse bg-white text-left text-sm dark:bg-zinc-900">
          <thead className="bg-zinc-50 dark:bg-zinc-800/80">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200">Project</th>
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200">Folder</th>
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200">Run</th>
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200">Launch</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.name}
                className="border-t border-zinc-100 align-top dark:border-zinc-800"
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {project.name}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  <code>{project.folder}</code>
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  <code>{project.devCommand}</code>
                </td>
                <td className="px-4 py-3">
                  {project.launchHref && project.launchLabel ? (
                    <LaunchButton
                      href={project.launchHref}
                      label={project.launchLabel}
                      external={project.external}
                    />
                  ) : (
                    <span className="text-zinc-500 dark:text-zinc-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  )
}
