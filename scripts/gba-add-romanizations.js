#!/usr/bin/env node

/**
 * Auto-generates Traditional Chinese, Pinyin, and Jyutping aliases for every
 * GBA station that has a Chinese name. Existing alternates are preserved and
 * deduplicated; stations lacking a Chinese name are left untouched.
 */

const fs = require('fs')
const path = require('path')
const OpenCC = require('opencc-js')
const { pinyin } = require('pinyin-pro')
const { getJyutpingText } = require('to-jyutping')

const featuresPath = path.join(
  __dirname,
  '..',
  'src',
  'app',
  '(game)',
  'asia',
  'china',
  'gba',
  'data',
  'features.json',
)

const converter = OpenCC.Converter({ from: 'cn', to: 'hk' })

const normalize = (value) => value.trim().toLowerCase()

const extractChinese = (value) => {
  const matches = value.match(/[\u3400-\u9fff]+/g)
  if (!matches || matches.length === 0) {
    return ''
  }
  return matches.sort((a, b) => b.length - a.length)[0] || ''
}

const addIfMissing = (set, list, value) => {
  const normalized = normalize(value)
  if (!normalized || set.has(normalized)) {
    return false
  }
  set.add(normalized)
  list.push(value)
  return true
}

const data = JSON.parse(fs.readFileSync(featuresPath, 'utf8'))

let featuresUpdated = 0
let tradAdded = 0
let pinyinAdded = 0
let jyutpingAdded = 0

for (const feature of data.features) {
  if (!feature?.properties) continue

  const props = feature.properties
  const alternates = Array.isArray(props.alternate_names)
    ? [...props.alternate_names]
    : []
  const altSet = new Set(alternates.map((value) => normalize(value)))

  const candidates = []
  ;[props.name, props.long_name, props.display_name, props.short_name].forEach(
    (value) => {
      if (typeof value === 'string') {
        candidates.push(value)
      }
    },
  )

  if (Array.isArray(props.alternate_names)) {
    for (const value of props.alternate_names) {
      if (typeof value === 'string') {
        candidates.push(value)
      }
    }
  }

  let chinese = ''
  for (const candidate of candidates) {
    const extracted = extractChinese(candidate)
    if (extracted && extracted.length > chinese.length) {
      chinese = extracted
    }
  }

  if (!chinese) {
    continue
  }

  const trad = converter(chinese)
  const pinyinValue = pinyin(chinese, { toneType: 'none', type: 'array' })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  const jyutpingValue = getJyutpingText(trad)
    .replace(/\s+/g, ' ')
    .trim()

  let updated = false
  if (addIfMissing(altSet, alternates, trad)) {
    tradAdded++
    updated = true
  }
  if (pinyinValue && addIfMissing(altSet, alternates, pinyinValue)) {
    pinyinAdded++
    updated = true
  }
  if (jyutpingValue && addIfMissing(altSet, alternates, jyutpingValue)) {
    jyutpingAdded++
    updated = true
  }

  if (updated) {
    props.alternate_names = alternates
    featuresUpdated++
  }
}

fs.writeFileSync(featuresPath, JSON.stringify(data, null, 2) + '\n')

console.log(
  `Updated ${featuresUpdated} features; added ${tradAdded} trad, ${pinyinAdded} pinyin, ${jyutpingAdded} jyutping entries.`,
)
