import { createHash } from 'crypto'
import { promises as fs, statSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

const VALID_SLUG = /^[a-z0-9-]+$/

const ICON_ROOT_CANDIDATES = [
  path.join(process.cwd(), 'public', 'city-icons'),
  path.join(process.cwd(), '..', 'public', 'city-icons'),
]

const pickExistingPath = (candidates: string[]) => {
  for (const candidate of candidates) {
    try {
      const stats = statSync(candidate)
      if (stats.isDirectory() || stats.isFile()) {
        return candidate
      }
    } catch {
      // keep looking
    }
  }
  return candidates[0]
}

const ICON_ROOT = pickExistingPath(ICON_ROOT_CANDIDATES)
const FALLBACK_CANDIDATES = [
  path.join(ICON_ROOT, '_default.ico'),
  path.join(process.cwd(), 'public', 'favicon.ico'),
]

let fallbackCache: Buffer | null = null

async function readIconFromDisk(filePath: string) {
  try {
    return await fs.readFile(filePath)
  } catch {
    return null
  }
}

async function getFallbackIcon() {
  if (fallbackCache) {
    return fallbackCache
  }
  for (const candidate of FALLBACK_CANDIDATES) {
    const buffer = await readIconFromDisk(candidate)
    if (buffer) {
      fallbackCache = buffer
      return buffer
    }
  }
  fallbackCache = Buffer.alloc(0)
  return fallbackCache
}

const buildEtag = (buffer: Buffer) =>
  `W/"${createHash('sha1').update(buffer).digest('base64')}"`.replace(
    /=+$/,
    '',
  )

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, must-revalidate',
}

type RouteParams = {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const normalizedSlug = slug?.toLowerCase()

  if (!normalizedSlug || !VALID_SLUG.test(normalizedSlug)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const iconPath = path.join(ICON_ROOT, `${normalizedSlug}.ico`)
  const iconBuffer =
    (await readIconFromDisk(iconPath)) ??
    (await getFallbackIcon())

  if (!iconBuffer || iconBuffer.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const etag = buildEtag(iconBuffer)
  const cacheHeaders = { ...CACHE_HEADERS, ETag: etag }

  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, { status: 304, headers: cacheHeaders })
  }

  return new NextResponse(iconBuffer, {
    headers: {
      ...cacheHeaders,
      'Content-Type': 'image/x-icon',
    },
  })
}
