import { kv } from '@vercel/kv'
import { zip, sortBy, filter } from 'lodash'
import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest } from 'next/server'

export const revalidate = 600 // 10 minutes

export const generateStaticParams = async () => {
  try {
    const gameDir = path.join(process.cwd(), 'src/app/(game)')
    const entries = await fs.readdir(gameDir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({ slug: entry.name }))
  } catch (error) {
    console.warn('Unable to generate static params for stats API:', error)
    return []
  }
}

type RouteParams = {
  params: Promise<{ slug: string }>
}

export const GET = async (req: NextRequest, { params }: RouteParams) => {
  const { slug } = await params
  let data: [string, number][] = []

  const hasKvCredentials =
    Boolean(process.env.KV_REST_API_URL) ||
    Boolean(process.env.UPSTASH_REDIS_REST_URL)

  if (hasKvCredentials) {
    try {
      const [_cursor, keys] = await kv.scan(0, {
        match: `${slug}-*`,
        count: 10000,
      })

      const counts = zip(
        keys,
        await Promise.all(
          keys.map(async (key) => (await kv.get(key)) as number),
        ),
      ) as [string, number][]

      data = sortBy(
        filter(counts, ([key]) => key!.startsWith(`${slug}`)),
        ([_, v]) => -v!,
      ) as [string, number][]
    } catch (error) {
      console.warn(`Falling back to cached stats for ${slug}:`, error)
    }
  }

  if (data.length === 0) {
    try {
      const cachePath = path.join(process.cwd(), 'public', 'stats', `${slug}.json`)
      const cached = await fs.readFile(cachePath, { encoding: 'utf-8' })
      data = JSON.parse(cached) as [string, number][]
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`No cached stats found for ${slug}:`, error)
      }
      data = []
    }
  }

  // cache in dev
  if (process.env.NODE_ENV !== 'production' && data.length > 0) {
    const cacheDir = path.join(process.cwd(), 'public', 'stats')
    try {
      await fs.mkdir(cacheDir, { recursive: true })
      await fs.writeFile(
        path.join(cacheDir, `${slug}.json`),
        JSON.stringify(data, null, 2),
      )
    } catch (error) {
      console.warn(`Failed to write cache for ${slug}:`, error)
    }
  }

  return new Response(JSON.stringify(data))
}
