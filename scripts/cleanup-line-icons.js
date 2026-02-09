#!/usr/bin/env node

const fs = require('fs/promises')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const GAME_ROOT = path.join(ROOT, 'src', 'app', '(game)')
const IMAGES_ROOT = path.join(ROOT, 'public', 'images')
const DRY_RUN = process.argv.includes('--dry-run')

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
    icons.add(value)
  }
  return Array.from(icons)
}

const run = async () => {
  const linesFiles = await findLinesJson(GAME_ROOT)
  const configFiles = await findConfigFiles(GAME_ROOT)
  const iconNames = new Set()

  for (const filePath of linesFiles) {
    let data
    try {
      data = JSON.parse(await fs.readFile(filePath, 'utf8'))
    } catch {
      console.warn(`Skipping invalid JSON: ${filePath}`)
      continue
    }

    for (const line of Object.values(data)) {
      if (!line || typeof line !== 'object') continue
      const icon = line.icon
      if (typeof icon !== 'string' || icon.trim() === '') continue
      iconNames.add(path.basename(icon))
    }
  }

  for (const filePath of configFiles) {
    let data
    try {
      data = await fs.readFile(filePath, 'utf8')
    } catch {
      continue
    }

    const lineIds = parseLineIdsFromConfig(data)
    const iconValues = parseIconsFromConfig(data)

    for (const iconValue of iconValues) {
      if (iconValue.includes('/')) {
        continue
      }
      const fileName = path.basename(iconValue)
      iconNames.add(fileName)
    }
    for (const lineId of lineIds) {
      const candidates = [
        `${lineId}.svg`,
        `${lineId}.png`,
        `${lineId}.jpg`,
        `${lineId}.jpeg`,
      ]
      for (const fileName of candidates) {
        iconNames.add(fileName)
      }
    }
  }

  let removed = 0
  for (const iconName of iconNames) {
    const target = path.join(IMAGES_ROOT, iconName)
    try {
      const stat = await fs.stat(target)
      if (!stat.isFile()) continue
      if (!DRY_RUN) {
        await fs.unlink(target)
      }
      removed += 1
    } catch {
      // ignore missing
    }
  }

  console.log(`Removed originals: ${removed}`)
  if (DRY_RUN) {
    console.log('Dry run only; no files were deleted.')
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
