#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Auto-translates UI strings into all supported languages using Google Translate.
 * - Scans TS/TSX for JSX text + selected attributes + string literals in JSX expressions.
 * - Skips strings wrapped in quotes, paths/URLs, and non-text tokens.
 * - Protects proper nouns, station names, and brand names from translation.
 * - Writes per-language JSON files into src/lib/translations.
 * - Marks auto translations in output.
 */

const fs = require('fs')
const path = require('path')
const ts = require('typescript')
const fg = require('fast-glob')

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY

const ROOT = process.cwd()
const DEFAULT_OUT_DIR = path.join(ROOT, 'src', 'lib', 'translations')
const SOURCE_LANG = 'en'

const ATTRIBUTE_WHITELIST = new Set([
  'title',
  'aria-label',
  'aria-description',
  'aria-describedby',
  'aria-placeholder',
  'placeholder',
  'alt',
  'label',
])

const PROPERTY_WHITELIST = new Set([
  'title',
  'description',
  'label',
  'message',
  'subtitle',
  'heading',
  'cta',
  'helperText',
  'emptyMessage',
  'buttonLabel',
])

const QUOTE_CHARS = ['"', "'", '“', '”', '‘', '’']

const BRAND_TERMS = [
  'Metro Memory',
  'Mapbox',
  'MapLibre',
  'OpenAI',
  'GitHub',
  'Ko-fi',
  'KoFi',
  'YouTube',
  'Twitter',
  'X',
  'Google',
]

const DEFAULT_SCAN_GLOBS = [
  'src/app/**/*.{ts,tsx}',
  'src/components/**/*.{ts,tsx}',
  'src/lib/**/*.{ts,tsx}',
]

const DEFAULT_IGNORE_GLOBS = [
  '**/*.d.ts',
  '**/node_modules/**',
  '**/.next/**',
  '**/translations/**',
  '**/data/**',
  '**/i18n.tsx',
]

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalizeWhitespace = (value) => value.replace(/\s+/g, ' ').trim()

const looksLikeUrlOrPath = (value) =>
  /^https?:\/\//i.test(value) ||
  /^www\./i.test(value) ||
  /\/.+\//.test(value) ||
  /\.(png|jpg|jpeg|svg|webp|gif|ico|mp4|mp3|pdf|json|css|js|ts|tsx)$/i.test(value)

const isWrappedInQuotes = (value) => {
  if (value.length < 2) return false
  const start = value[0]
  const end = value[value.length - 1]
  return QUOTE_CHARS.includes(start) && QUOTE_CHARS.includes(end)
}

const hasLetters = (value) => /[A-Za-z\u00C0-\u024F\u0370-\u1FFF\u4E00-\u9FFF]/.test(value)

const shouldSkipText = (value) => {
  if (!value || value.length < 2) return true
  if (!hasLetters(value)) return true
  if (isWrappedInQuotes(value)) return true
  if (looksLikeUrlOrPath(value)) return true
  return false
}

const getSupportedLanguageCodes = () => {
  const i18nPath = path.join(ROOT, 'src', 'lib', 'i18n.tsx')
  const raw = fs.readFileSync(i18nPath, 'utf8')
  const match = raw.match(/SUPPORTED_LANGUAGES\s*=\s*\[([\s\S]*?)\]/m)
  if (!match) {
    throw new Error('Could not find SUPPORTED_LANGUAGES in src/lib/i18n.tsx')
  }
  const block = match[1]
  const codes = []
  const regex = /code:\s*'([^']+)'/g
  let m
  while ((m = regex.exec(block)) !== null) {
    codes.push(m[1])
  }
  return Array.from(new Set(codes))
}

const extractCityTerms = () => {
  const citiesPath = path.join(ROOT, 'src', 'lib', 'citiesConfig.ts')
  const raw = fs.readFileSync(citiesPath, 'utf8')
  const names = []
  const regex = /name:\s*'([^']+)'/g
  let m
  while ((m = regex.exec(raw)) !== null) {
    const name = m[1]
    if (!name) continue
    const beforeComma = name.split(',')[0].trim()
    if (beforeComma) names.push(beforeComma)
    const englishPart = beforeComma.split('(')[0].trim()
    if (englishPart) names.push(englishPart)
    const parenMatch = beforeComma.match(/\(([^)]+)\)/)
    if (parenMatch) names.push(parenMatch[1])
  }
  return names
}

const extractStationTerms = () => {
  const files = fg.sync('src/app/**/data/features.json', {
    cwd: ROOT,
    absolute: true,
    ignore: DEFAULT_IGNORE_GLOBS,
  })
  const terms = []
  files.forEach((file) => {
    try {
      const raw = fs.readFileSync(file, 'utf8')
      const json = JSON.parse(raw)
      if (!json?.features) return
      json.features.forEach((feature) => {
        const name = feature?.properties?.name
        if (!name || typeof name !== 'string') return
        const normalized = name.trim()
        if (normalized) terms.push(normalized)
        const englishPart = normalized.split('(')[0].trim()
        if (englishPart) terms.push(englishPart)
        const parenMatch = normalized.match(/\(([^)]+)\)/)
        if (parenMatch) terms.push(parenMatch[1])
      })
    } catch {
      // ignore malformed data
    }
  })
  return terms
}

const buildProtectedTerms = () => {
  const terms = new Set()
  BRAND_TERMS.forEach((term) => terms.add(term))
  extractCityTerms().forEach((term) => terms.add(term))
  extractStationTerms().forEach((term) => terms.add(term))
  return Array.from(terms)
    .map((term) => term.trim())
    .filter((term) => term.length > 1)
    .sort((a, b) => b.length - a.length)
}

const protectTerms = (text, terms) => {
  let result = text
  const replacements = []
  let idx = 0
  terms.forEach((term) => {
    if (!result.includes(term)) return
    const placeholder = `__TERM_${idx}__`
    idx += 1
    const regex = new RegExp(escapeRegExp(term), 'g')
    result = result.replace(regex, placeholder)
    replacements.push([placeholder, term])
  })
  return { text: result, replacements }
}

const restoreTerms = (text, replacements) => {
  let result = text
  replacements.forEach(([placeholder, term]) => {
    const regex = new RegExp(escapeRegExp(placeholder), 'g')
    result = result.replace(regex, term)
  })
  return result
}

const extractStringsFromFile = (filePath) => {
  const sourceText = fs.readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )

  const strings = []

  const addString = (raw, node) => {
    const normalized = normalizeWhitespace(raw)
    if (!normalized || shouldSkipText(normalized)) return
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart())
    strings.push({
      text: normalized,
      file: filePath,
      line: line + 1,
      column: character + 1,
    })
  }

  const isInTranslationCall = (node) => {
    let current = node.parent
    while (current) {
      if (ts.isCallExpression(current)) {
        const expr = current.expression
        if (ts.isIdentifier(expr) && expr.text === 't') {
          return true
        }
      }
      current = current.parent
    }
    return false
  }

  const getJsxAttributeName = (node) => {
    let current = node.parent
    while (current) {
      if (ts.isJsxAttribute(current)) {
        return current.name?.text ?? null
      }
      if (ts.isJsxElement(current) || ts.isJsxFragment(current)) {
        return null
      }
      current = current.parent
    }
    return null
  }

  const isJsxChildExpression = (node) => {
    const parent = node.parent
    if (!parent) return false
    if (ts.isJsxExpression(parent)) {
      const grand = parent.parent
      return ts.isJsxElement(grand) || ts.isJsxFragment(grand)
    }
    return false
  }

  const shouldIncludeAttribute = (name) =>
    ATTRIBUTE_WHITELIST.has(name) || name?.startsWith('aria-')

  const shouldIncludeProperty = (name) => PROPERTY_WHITELIST.has(name)

  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      return
    }

    if (ts.isJsxText(node)) {
      addString(node.text, node)
    }

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const raw = node.text
      if (!raw || isInTranslationCall(node)) {
        // skip i18n keys or empty strings
      } else {
        const attrName = getJsxAttributeName(node)
        if (attrName && shouldIncludeAttribute(attrName)) {
          addString(raw, node)
        } else if (isJsxChildExpression(node)) {
          addString(raw, node)
        } else if (ts.isPropertyAssignment(node.parent)) {
          const nameNode = node.parent.name
          const propName = ts.isIdentifier(nameNode)
            ? nameNode.text
            : ts.isStringLiteral(nameNode)
              ? nameNode.text
              : null
          if (propName && shouldIncludeProperty(propName)) {
            addString(raw, node)
          }
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return strings
}

const collectStrings = () => {
  const files = fg.sync(DEFAULT_SCAN_GLOBS, {
    cwd: ROOT,
    absolute: true,
    ignore: DEFAULT_IGNORE_GLOBS,
  })

  const seen = new Map()
  files.forEach((file) => {
    const entries = extractStringsFromFile(file)
    entries.forEach((entry) => {
      if (!seen.has(entry.text)) {
        seen.set(entry.text, { text: entry.text, sources: [] })
      }
      seen.get(entry.text).sources.push({
        file: path.relative(ROOT, entry.file),
        line: entry.line,
        column: entry.column,
      })
    })
  })

  return Array.from(seen.values())
}

const chunk = (arr, size) => {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

const translateBatch = async (texts, target) => {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        source: SOURCE_LANG,
        target,
        format: 'text',
      }),
    },
  )
  if (!response.ok) {
    const msg = await response.text()
    throw new Error(`Translation API error (${response.status}): ${msg}`)
  }
  const data = await response.json()
  const translations = data?.data?.translations
  if (!Array.isArray(translations)) {
    throw new Error('Unexpected translation response')
  }
  return translations.map((entry) => entry.translatedText)
}

const writeJson = (filePath, data) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
}

const main = async () => {
  if (!API_KEY) {
    console.error('Missing GOOGLE_TRANSLATE_API_KEY in environment.')
    process.exit(1)
  }

  const languages = getSupportedLanguageCodes()
  const entries = collectStrings()
  const protectedTerms = buildProtectedTerms()

  console.log(`Found ${entries.length} unique strings to translate.`)

  const now = new Date().toISOString()

  for (const lang of languages) {
    const output = {
      _meta: {
        generatedAt: now,
        sourceLanguage: SOURCE_LANG,
        targetLanguage: lang,
        auto: true,
      },
      translations: {},
    }

    if (lang === SOURCE_LANG) {
      entries.forEach((entry) => {
        output.translations[entry.text] = {
          text: entry.text,
          auto: false,
          sources: entry.sources,
        }
      })
      writeJson(path.join(DEFAULT_OUT_DIR, `${lang}.json`), output)
      continue
    }

    const batches = chunk(entries, 50)
    for (const batch of batches) {
      const prepared = batch.map((entry) => {
        const { text, replacements } = protectTerms(entry.text, protectedTerms)
        return { entry, text, replacements }
      })

      const translatable = prepared.map((item) => item.text)
      const translated = await translateBatch(translatable, lang)

      translated.forEach((translatedText, idx) => {
        const item = prepared[idx]
        let finalText = restoreTerms(translatedText, item.replacements)

        const stripped = finalText
          .replace(/__TERM_\\d+__/g, '')
          .replace(/\s+/g, '')

        const auto = stripped.length > 0
        if (!auto) {
          finalText = item.entry.text
        }

        output.translations[item.entry.text] = {
          text: finalText,
          auto,
          sources: item.entry.sources,
        }
      })

      console.log(`Translated ${lang}: ${Object.keys(output.translations).length}/${entries.length}`)
    }

    writeJson(path.join(DEFAULT_OUT_DIR, `${lang}.json`), output)
  }

  console.log(`Done. Wrote translations to ${DEFAULT_OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
