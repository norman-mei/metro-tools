import 'server-only'

import { promises as fs } from 'fs'
import path from 'path'

const GAME_ROOT = path.join(process.cwd(), 'src', 'app', '(game)')

let cityPathCache: Map<string, string> | null = null

const toPosix = (value: string) => value.split(path.sep).join('/')

const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const buildCityPathCache = async () => {
  const map = new Map<string, string>()

  const walk = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    await Promise.all(
      entries.map(async (entry) => {
        if (!entry.isDirectory()) {
          return
        }
        const entryPath = path.join(dir, entry.name)
        const relativePath = toPosix(path.relative(GAME_ROOT, entryPath))
        if (await fileExists(path.join(entryPath, 'page.tsx'))) {
          if (!map.has(entry.name)) {
            map.set(entry.name, relativePath)
          }
          return
        }
        await walk(entryPath)
      }),
    )
  }

  await walk(GAME_ROOT)
  return map
}

export const resolveCityPath = async (slug: string) => {
  if (!cityPathCache) {
    cityPathCache = await buildCityPathCache()
  }
  return cityPathCache.get(slug) ?? null
}

export const getAllCitySlugs = async () => {
  if (!cityPathCache) {
    cityPathCache = await buildCityPathCache()
  }
  return Array.from(cityPathCache.keys())
}
