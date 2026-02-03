#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs/promises')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const GAME_ROOT = path.join(ROOT, 'src', 'app', '(game)')
const IMAGES_ROOT = path.join(ROOT, 'public', 'images')
const DRY_RUN = process.argv.includes('--dry-run')

const exists = async (target) => {
  try {
    await fs.access(target)
    return true
  } catch {
    return false
  }
}

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/\.(svg|png|jpg|jpeg)$/i, '')
    .replace(/[^a-z0-9]/g, '')

const variantsFromFile = (baseName) => {
  const norm = normalize(baseName)
  const variants = new Set([norm])
  const suffixes = ['icon', 'logo', 'line', 'symbol']
  for (const suffix of suffixes) {
    if (norm.endsWith(suffix) && norm.length > suffix.length) {
      variants.add(norm.slice(0, -suffix.length))
    }
  }
  const prefixes = ['line', 'metro', 'tram', 'lightrail']
  for (const prefix of prefixes) {
    if (norm.startsWith(prefix) && norm.length > prefix.length) {
      variants.add(norm.slice(prefix.length))
    }
  }
  return Array.from(variants).filter(Boolean)
}

const findLinesJson = async (dir, results = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await findLinesJson(fullPath, results)
    } else if (entry.isFile() && entry.name === 'lines.json') {
      results.push(fullPath)
    }
  }
  return results
}

const findConfigFiles = async (dir, results = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await findConfigFiles(fullPath, results)
    } else if (entry.isFile() && entry.name === 'config.ts') {
      results.push(fullPath)
    }
  }
  return results
}

const parseLineIdsFromConfig = (content) => {
  if (!content.includes('export const LINES')) {
    return []
  }
  if (content.includes('linesData')) {
    return []
  }

  const lines = content.split(/\r?\n/)
  let active = false
  let depth = 0
  const ids = []

  for (const rawLine of lines) {
    const line = rawLine
    if (!active) {
      if (line.includes('export const LINES')) {
        active = true
      } else {
        continue
      }
    }

    const cleaned = line.replace(/(['"]).*?\1/g, '')
    if (depth === 1) {
      const match = cleaned.match(/^\s*([A-Za-z0-9_]+)\s*:\s*{/)
      if (match) {
        ids.push(match[1])
      }
    }

    const opens = (cleaned.match(/{/g) || []).length
    const closes = (cleaned.match(/}/g) || []).length
    depth += opens - closes

    if (active && depth === 0 && opens + closes > 0) {
      break
    }
  }

  return ids
}

const parseIconsFromConfig = (content) => {
  const icons = new Set()
  const regex = /icon\s*:\s*['"]([^'"]+)['"]/g
  let match
  while ((match = regex.exec(content))) {
    const value = match[1]?.trim()
    if (!value) continue
    icons.add(path.basename(value))
  }
  return Array.from(icons)
}

const buildCityIndex = async () => {
  const linesFiles = await findLinesJson(GAME_ROOT)
  const configFiles = await findConfigFiles(GAME_ROOT)
  const cityIndex = new Map()

  const ensureCity = (cityPath) => {
    if (!cityIndex.has(cityPath)) {
      cityIndex.set(cityPath, {
        lineIds: new Set(),
        iconNames: new Set(),
      })
    }
    return cityIndex.get(cityPath)
  }

  for (const filePath of linesFiles) {
    const relative = path.relative(GAME_ROOT, filePath)
    const parts = relative.split(path.sep)
    if (parts.length < 5) continue
    const [continent, country, city] = parts
    const cityPath = [continent, country, city].join('/')
    const entry = ensureCity(cityPath)

    let data
    try {
      data = JSON.parse(await fs.readFile(filePath, 'utf8'))
    } catch {
      continue
    }

    for (const [lineId, line] of Object.entries(data)) {
      entry.lineIds.add(lineId)
      if (line && typeof line === 'object' && typeof line.icon === 'string') {
        entry.iconNames.add(path.basename(line.icon))
      }
    }
  }

  for (const filePath of configFiles) {
    const relative = path.relative(GAME_ROOT, filePath)
    const parts = relative.split(path.sep)
    if (parts.length < 4) continue
    const [continent, country, city] = parts
    const cityPath = [continent, country, city].join('/')
    const entry = ensureCity(cityPath)

    let content = ''
    try {
      content = await fs.readFile(filePath, 'utf8')
    } catch {
      continue
    }

    parseLineIdsFromConfig(content).forEach((id) => entry.lineIds.add(id))
    parseIconsFromConfig(content).forEach((icon) => entry.iconNames.add(icon))
  }

  return cityIndex
}

const run = async () => {
  const cityIndex = await buildCityIndex()
  const entries = await fs.readdir(IMAGES_ROOT, { withFileTypes: true })
  const rootFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(svg|png|jpg|jpeg)$/i.test(name))

  let moved = 0
  const unresolved = []

  const manualMappings = [
    { pattern: /^calgary/i, cityPath: 'north-america/canada/calgary' },
    { pattern: /^hamburg/i, cityPath: 'europe/germany/hamburg' },
    { pattern: /^vienna/i, cityPath: 'europe/austria/vienna' },
    { pattern: /^singapore/i, cityPath: 'asia/singapore' },
    { pattern: /^translink/i, cityPath: 'north-america/canada/vancouver' },
    { pattern: /^soundtransit/i, cityPath: 'north-america/usa/seattle' },
    { pattern: /^newyork/i, cityPath: 'north-america/usa/ny' },
    { pattern: /(morristown|montclair|gladstone|mainline)/i, cityPath: 'north-america/usa/ny' },
    { pattern: /^baltimore/i, cityPath: 'north-america/usa/dc' },
    { pattern: /^istanbul/i, cityPath: 'europe/turkey/istanbul' },
  ]

  for (const fileName of rootFiles) {
    const baseName = path.basename(fileName)
    let matchedCity = null
    let matchedScore = 0
    let ambiguous = false

    for (const rule of manualMappings) {
      if (rule.pattern.test(baseName)) {
        matchedCity = rule.cityPath
        matchedScore = Number.MAX_SAFE_INTEGER
        break
      }
    }

    for (const [cityPath, data] of cityIndex.entries()) {
      if (data.iconNames.has(baseName)) {
        if (matchedCity && matchedCity !== cityPath) {
          ambiguous = true
          break
        }
        matchedCity = cityPath
        matchedScore = Number.MAX_SAFE_INTEGER
      }
    }

    if (ambiguous) {
      unresolved.push(fileName)
      continue
    }

    if (!matchedCity) {
      const fileVariants = variantsFromFile(baseName)
      for (const [cityPath, data] of cityIndex.entries()) {
        for (const lineId of data.lineIds) {
          const normLine = normalize(lineId)
          for (const variant of fileVariants) {
            if (!variant || !normLine) continue
            if (normLine.includes(variant) || variant.includes(normLine)) {
              const score = Math.min(normLine.length, variant.length)
              if (score > matchedScore) {
                matchedScore = score
                matchedCity = cityPath
                ambiguous = false
              } else if (score === matchedScore && matchedCity !== cityPath) {
                ambiguous = true
              }
            }
          }
        }
      }
    }

    if (ambiguous || !matchedCity || matchedScore < 4) {
      unresolved.push(fileName)
      continue
    }

    const targetDir = path.join(IMAGES_ROOT, matchedCity)
    const targetPath = path.join(targetDir, fileName)
    const sourcePath = path.join(IMAGES_ROOT, fileName)

    if (!DRY_RUN) {
      await fs.mkdir(targetDir, { recursive: true })
      if (await exists(targetPath)) {
        await fs.unlink(sourcePath)
      } else {
        await fs.rename(sourcePath, targetPath)
      }
    }
    moved += 1
  }

  console.log(`Moved root icons: ${moved}`)
  if (unresolved.length > 0) {
    console.log('Unresolved icons:')
    unresolved.forEach((name) => console.log(`- ${name}`))
  }
  if (DRY_RUN) {
    console.log('Dry run only; no files were moved.')
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
