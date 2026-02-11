#!/usr/bin/env node

const fs = require('fs/promises')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const GAME_ROOT = path.join(ROOT, 'src', 'app', '(game)')
const IMAGES_ROOT = path.join(ROOT, 'public', 'images')
const DRY_RUN = process.argv.includes('--dry-run')

const findFiles = async (dir, targetName, results = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await findFiles(fullPath, targetName, results)
    } else if (entry.isFile() && entry.name === targetName) {
      results.push(fullPath)
    }
  }
  return results
}

const isValidCityPath = (parts) => {
  if (parts.length < 3) return false
  const [continent, country, city] = parts
  if (!continent || !country || !city) return false
  if (continent.startsWith('_') || country.startsWith('_') || city.startsWith('_')) return false
  if (continent.startsWith('(') || country.startsWith('(') || city.startsWith('(')) return false
  if (continent.startsWith('[') || country.startsWith('[') || city.startsWith('[')) return false
  return true
}

const collectCityDirs = async () => {
  const cityDirs = []
  const continents = await fs.readdir(GAME_ROOT, { withFileTypes: true })
  for (const continent of continents) {
    if (!continent.isDirectory()) continue
    if (continent.name.startsWith('_') || continent.name.startsWith('(') || continent.name.startsWith('[')) {
      continue
    }
    const continentPath = path.join(GAME_ROOT, continent.name)
    const countries = await fs.readdir(continentPath, { withFileTypes: true })
    for (const country of countries) {
      if (!country.isDirectory()) continue
      if (country.name.startsWith('_') || country.name.startsWith('(') || country.name.startsWith('[')) {
        continue
      }
      const countryPath = path.join(continentPath, country.name)
      const cities = await fs.readdir(countryPath, { withFileTypes: true })
      for (const city of cities) {
        if (!city.isDirectory()) continue
        const parts = [continent.name, country.name, city.name]
        if (!isValidCityPath(parts)) continue
        cityDirs.push(path.join(...parts))
      }
    }
  }
  return cityDirs
}

const run = async () => {
  const configFiles = await findFiles(GAME_ROOT, 'config.ts')
  const linesFiles = await findFiles(GAME_ROOT, 'lines.json')
  const cityPaths = new Set()

  for (const filePath of [...configFiles, ...linesFiles]) {
    const relative = path.relative(GAME_ROOT, filePath)
    const parts = relative.split(path.sep)
    if (!isValidCityPath(parts)) {
      continue
    }
    const [continent, country, city] = parts
    cityPaths.add(path.join(continent, country, city))
  }
  const discoveredDirs = await collectCityDirs()
  discoveredDirs.forEach((cityPath) => cityPaths.add(cityPath))

  let created = 0
  for (const cityPath of cityPaths) {
    const target = path.join(IMAGES_ROOT, cityPath)
    try {
      await fs.access(target)
    } catch {
      if (!DRY_RUN) {
        await fs.mkdir(target, { recursive: true })
      }
      created += 1
    }
  }

  console.log(`Image folders created: ${created}`)
  if (DRY_RUN) {
    console.log('Dry run only; no folders were created.')
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
