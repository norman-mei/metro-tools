const path = require('path')
const fs = require('fs/promises')
const fg = require('fast-glob')

const SOURCE_ROOT = path.join(process.cwd(), 'src', 'app', '(game)')
const DEST_ROOT = path.join(process.cwd(), 'public', 'city-icons')
const FALLBACK_CANDIDATES = [
  path.join(process.cwd(), 'public', 'favicon.ico'),
  path.join(SOURCE_ROOT, 'favicon.ico'),
]

async function ensureDestDir() {
  await fs.mkdir(DEST_ROOT, { recursive: true })
}

async function findFallback() {
  for (const candidate of FALLBACK_CANDIDATES) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // continue
    }
  }
  return null
}

async function main() {
  await ensureDestDir()

  const matches = await fg('**/{icon,favicon}.ico', { cwd: SOURCE_ROOT })
  const bySlug = new Map()

  for (const relPath of matches) {
    const slug = path.basename(path.dirname(relPath))
    const filename = path.basename(relPath)
    const current = bySlug.get(slug) ?? {}
    if (filename === 'icon.ico') {
      current.icon = relPath
    } else if (!current.icon) {
      current.favicon = relPath
    }
    bySlug.set(slug, current)
  }

  let copied = 0
  for (const [slug, files] of bySlug.entries()) {
    const chosenRel = files.icon ?? files.favicon
    if (!chosenRel) continue

    const src = path.join(SOURCE_ROOT, chosenRel)
    const dest = path.join(DEST_ROOT, `${slug}.ico`)
    await fs.copyFile(src, dest)
    copied++
  }

  const fallback = await findFallback()
  if (fallback) {
    await fs.copyFile(fallback, path.join(DEST_ROOT, '_default.ico'))
  }

  console.log(`Copied ${copied} icons to ${DEST_ROOT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
