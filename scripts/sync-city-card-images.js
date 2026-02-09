#!/usr/bin/env node

const path = require('path')
const fs = require('fs/promises')
const fg = require('fast-glob')

const SOURCE_ROOT = path.join(process.cwd(), 'src', 'app', '(game)')
const DEST_ROOT = path.join(process.cwd(), 'public', 'city-cards')
const FALLBACK_IMAGE = path.join(process.cwd(), 'public', 'images', 'TM.png')

async function ensureDestDir() {
  await fs.mkdir(DEST_ROOT, { recursive: true })
}

async function copyFallback() {
  try {
    await fs.copyFile(FALLBACK_IMAGE, path.join(DEST_ROOT, '_default.jpg'))
  } catch (error) {
    console.warn('No fallback city card image found:', error?.message || error)
  }
}

async function main() {
  await ensureDestDir()

  const matches = await fg('**/opengraph-image.jpg', { cwd: SOURCE_ROOT })
  let copied = 0

  for (const relPath of matches) {
    const slug = path.basename(path.dirname(relPath))
    const src = path.join(SOURCE_ROOT, relPath)
    const dest = path.join(DEST_ROOT, `${slug}.jpg`)
    await fs.copyFile(src, dest)
    copied += 1
  }

  await copyFallback()

  console.log(`Copied ${copied} city card images to ${DEST_ROOT}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
