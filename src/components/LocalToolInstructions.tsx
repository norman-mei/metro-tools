import { Container } from '@/components/Container'

type LocalToolInstructionsProps = {
  title: string
  folder: string
  port: number
  installCommand?: string
  devCommand?: string
}

export default function LocalToolInstructions({
  title,
  folder,
  port,
  installCommand = 'npm install',
  devCommand = `npm run dev -- --port ${port}`,
}: LocalToolInstructionsProps) {
  const localUrl = `http://localhost:${port}`
  const runBlock = `cd "/mnt/c/Users/kirk/Downloads/Coding Projects/metro-tools/${folder}"
${installCommand}
${devCommand}`

  return (
    <Container className="mt-10 pb-20">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
          Built-in Metro Tools module sourced from <code>{folder}</code>.
        </p>
      </header>

      <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <iframe src={localUrl} title={title} className="h-[78vh] w-full" />
      </section>

      <details className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Tool not loading?
        </summary>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          Start this module and refresh:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-100 p-4 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
{runBlock}
        </pre>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={localUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Open Tool
          </a>
        </div>
      </details>
    </Container>
  )
}
