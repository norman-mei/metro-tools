#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')

const FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'citiesConfig.ts')

const toBool = (value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

const normalizeObjectLines = (lines) => {
  let disabledIndex = -1
  let disabledValue = null
  let hideIndex = -1
  let hideValue = null
  let indent = '    '

  lines.forEach((line, idx) => {
    const match = line.match(/^(\s*)(disabled|hideInStats)\s*:\s*(true|false)\s*,?\s*$/)
    if (!match) return
    if (!indent && match[1]) indent = match[1]
    const key = match[2]
    const value = toBool(match[3])
    if (key === 'disabled') {
      disabledIndex = idx
      disabledValue = value
    } else if (key === 'hideInStats') {
      hideIndex = idx
      hideValue = value
    }
  })

  const shouldEnable = disabledValue === false || hideValue === false
  if (!shouldEnable) {
    return { lines, changed: false }
  }

  let changed = false

  const updateLine = (idx, key) => {
    if (idx < 0) return
    const match = lines[idx].match(/^(\s*)/)
    const lineIndent = match ? match[1] : indent
    const newLine = `${lineIndent}${key}: false,`
    if (lines[idx] !== newLine) {
      lines[idx] = newLine
      changed = true
    }
  }

  if (disabledIndex >= 0) {
    updateLine(disabledIndex, 'disabled')
  }
  if (hideIndex >= 0) {
    updateLine(hideIndex, 'hideInStats')
  }

  const insertBeforeClose = (key) => {
    const closeIndex = lines.length - 1
    const newLine = `${indent}${key}: false,`
    lines.splice(closeIndex, 0, newLine)
    changed = true
  }

  if (disabledIndex < 0) {
    insertBeforeClose('disabled')
  }
  if (hideIndex < 0) {
    insertBeforeClose('hideInStats')
  }

  return { lines, changed }
}

const normalizeCityAvailability = () => {
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`[normalize-city-availability] Missing ${FILE_PATH}`)
    process.exit(1)
  }

  const original = fs.readFileSync(FILE_PATH, 'utf8')
  const lines = original.split('\n')
  let inRawCities = false
  let i = 0
  let changed = false

  while (i < lines.length) {
    const line = lines[i]

    if (!inRawCities) {
      if (line.includes('const rawCities')) {
        inRawCities = true
      }
      i += 1
      continue
    }

    if (inRawCities && line.trim() === ']') {
      inRawCities = false
      i += 1
      continue
    }

    if (line.trim() === '{') {
      const start = i
      let end = i + 1
      while (end < lines.length) {
        if (lines[end].trim() === '},' || lines[end].trim() === '}') {
          break
        }
        end += 1
      }
      if (end >= lines.length) {
        break
      }
      const objectLines = lines.slice(start, end + 1)
      const result = normalizeObjectLines(objectLines)
      if (result.changed) {
        changed = true
        lines.splice(start, objectLines.length, ...result.lines)
        i = start + result.lines.length
        continue
      }
      i = end + 1
      continue
    }

    i += 1
  }

  if (changed) {
    fs.writeFileSync(FILE_PATH, lines.join('\n'), 'utf8')
    console.log('[normalize-city-availability] Updated citiesConfig.ts')
  } else {
    console.log('[normalize-city-availability] No changes needed')
  }
}

normalizeCityAvailability()
