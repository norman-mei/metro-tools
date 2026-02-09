#!/usr/bin/env node

const fs = require('fs/promises')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const GAME_ROOT = path.join(ROOT, 'src', 'app', '(game)')
const DRY_RUN = process.argv.includes('--dry-run')
const SKIP_CITY_SLUGS = new Set(['sapporo'])

const listDirs = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}

const isValidSegment = (name) => {
  if (!name) return false
  if (name.startsWith('_') || name.startsWith('(') || name.startsWith('[')) return false
  if (name.startsWith('.')) return false
  return true
}

const run = async () => {
  const cityPaths = new Set()
  const continents = (await listDirs(GAME_ROOT)).filter(isValidSegment)

  for (const continent of continents) {
    const continentPath = path.join(GAME_ROOT, continent)
    const countries = (await listDirs(continentPath)).filter(isValidSegment)

    for (const country of countries) {
      const countryPath = path.join(continentPath, country)
      const cities = (await listDirs(countryPath)).filter(isValidSegment)

      for (const city of cities) {
        if (SKIP_CITY_SLUGS.has(city)) {
          continue
        }
        cityPaths.add(path.join(continent, country, city))
      }
    }
  }

  let created = 0
  for (const cityPath of cityPaths) {
    const target = path.join(GAME_ROOT, cityPath, 'data')
    try {
      const stat = await fs.stat(target)
      if (!stat.isDirectory()) {
        if (!DRY_RUN) {
          await fs.mkdir(target, { recursive: true })
        }
        created += 1
      }
    } catch {
      if (!DRY_RUN) {
        await fs.mkdir(target, { recursive: true })
      }
      created += 1
    }
  }

  console.log(`Data folders created: ${created}`)
  if (DRY_RUN) {
    console.log('Dry run only; no folders were created.')
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
