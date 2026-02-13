import { Container } from '@/components/Container'
import Image from 'next/image'

const STRIPMAP_IMAGES = [
  'r142 r142a r143.png',
  'r160  r179.jpg',
  'r211 display 2.png',
  'r211 display.png',
  'r211.jpg',
  'r62 r62a.jpg',
]

export default function StripmapPage() {
  return (
    <Container className="mt-10 pb-20">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Stripmap
        </h1>
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
          Reference stripmap assets merged from <code>tools/stripmap</code>.
        </p>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {STRIPMAP_IMAGES.map((fileName) => (
          <figure
            key={fileName}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Image
              src={`/stripmap/${encodeURIComponent(fileName)}`}
              alt={fileName}
              width={1600}
              height={900}
              className="h-auto w-full rounded-lg object-contain"
              loading="lazy"
            />
            <figcaption className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
              {fileName}
            </figcaption>
          </figure>
        ))}
      </div>
    </Container>
  )
}
