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

const normalizeIcon = (fileName, continent, country, city) => {
  const normalizedPath = [continent, country, city, fileName].join('/')
  return { fileName, normalizedPath }
}

const findFallbackIcon = async (lineId) => {
  const candidates = [
    `${lineId}.svg`,
    `${lineId}.png`,
    `${lineId}.jpg`,
    `${lineId}.jpeg`,
  ]
  for (const fileName of candidates) {
    const candidatePath = path.join(IMAGES_ROOT, fileName)
    if (await exists(candidatePath)) {
      return fileName
    }
  }
  return null
}

const ensureCopied = async (icon, fileName, normalizedPath) => {
  const targetPath = path.join(IMAGES_ROOT, normalizedPath)
  if (await exists(targetPath)) {
    return { copied: false, targetPath }
  }

  const candidatePaths = [
    path.join(IMAGES_ROOT, icon),
    path.join(IMAGES_ROOT, fileName),
  ]

  let sourcePath = null
  for (const candidate of candidatePaths) {
    if (await exists(candidate)) {
      sourcePath = candidate
      break
    }
  }

  if (!sourcePath) {
    return { copied: false, targetPath, missing: true }
  }

  if (!DRY_RUN) {
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    await fs.copyFile(sourcePath, targetPath)
  }

  return { copied: true, targetPath }
}

const run = async () => {
  const linesFiles = await findLinesJson(GAME_ROOT)
  const configFiles = await findConfigFiles(GAME_ROOT)
  let updatedFiles = 0
  let copiedCount = 0
  const missingFiles = new Set()

  for (const filePath of linesFiles) {
    const relative = path.relative(GAME_ROOT, filePath)
    const parts = relative.split(path.sep)
    if (parts.length < 5) {
      continue
    }

    const [continent, country, city] = parts
    if (!continent || !country || !city) {
      continue
    }

    const raw = await fs.readFile(filePath, 'utf8')
    let data
    try {
      data = JSON.parse(raw)
    } catch (error) {
      console.warn(`Skipping invalid JSON: ${filePath}`)
      continue
    }

    let changed = false
    for (const [lineId, line] of Object.entries(data)) {
      if (!line || typeof line !== 'object') {
        continue
      }

      let icon = typeof line.icon === 'string' ? line.icon.trim() : ''
      let fileName = icon ? path.basename(icon) : null

      if (!fileName) {
        fileName = await findFallbackIcon(lineId)
        if (fileName) {
          const normalized = normalizeIcon(fileName, continent, country, city)
          line.icon = normalized.normalizedPath
          icon = normalized.normalizedPath
          changed = true
        }
      }

      if (!fileName) {
        continue
      }

      const { normalizedPath } = normalizeIcon(fileName, continent, country, city)
      if (icon !== normalizedPath) {
        line.icon = normalizedPath
        changed = true
      }

      const result = await ensureCopied(fileName, fileName, normalizedPath)
      if (result.missing) {
        missingFiles.add(`${fileName} (missing from ${filePath})`)
      } else if (result.copied) {
        copiedCount += 1
      }
    }

    if (changed) {
      updatedFiles += 1
      if (!DRY_RUN) {
        await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
      }
    }
  }

  for (const filePath of configFiles) {
    const relative = path.relative(GAME_ROOT, filePath)
    const parts = relative.split(path.sep)
    if (parts.length < 4) {
      continue
    }
    const [continent, country, city] = parts
    if (!continent || !country || !city) {
      continue
    }

    const raw = await fs.readFile(filePath, 'utf8')
    const lineIds = parseLineIdsFromConfig(raw)
    const iconValues = parseIconsFromConfig(raw)
    if (lineIds.length === 0) {
      if (iconValues.length === 0) {
        continue
      }
    }

    for (const iconValue of iconValues) {
      if (iconValue.includes('/')) {
        continue
      }
      const fileName = path.basename(iconValue)
      const { normalizedPath } = normalizeIcon(fileName, continent, country, city)
      const result = await ensureCopied(fileName, fileName, normalizedPath)
      if (result.missing) {
        missingFiles.add(`${fileName} (missing from ${filePath})`)
      } else if (result.copied) {
        copiedCount += 1
      }
    }

    for (const lineId of lineIds) {
      const fileName = await findFallbackIcon(lineId)
      if (!fileName) {
        missingFiles.add(`${lineId}.* (missing from ${filePath})`)
        continue
      }

      const { normalizedPath } = normalizeIcon(fileName, continent, country, city)
      const result = await ensureCopied(fileName, fileName, normalizedPath)
      if (result.missing) {
        missingFiles.add(`${fileName} (missing from ${filePath})`)
      } else if (result.copied) {
        copiedCount += 1
      }
    }
  }

  console.log(`Updated lines.json files: ${updatedFiles}`)
  console.log(`Copied icons: ${copiedCount}`)
  if (missingFiles.size > 0) {
    console.log('Missing icons:')
    for (const missing of missingFiles) {
      console.log(`- ${missing}`)
    }
  }

  if (DRY_RUN) {
    console.log('Dry run only; no files were written.')
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
