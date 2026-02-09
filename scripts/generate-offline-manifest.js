const fs = require('fs/promises')
const path = require('path')

const ROOTS = [
  { dir: path.join(process.cwd(), 'public', 'city-data'), prefix: '/city-data/' },
  { dir: path.join(process.cwd(), 'public', 'city-icons'), prefix: '/city-icons/' },
  { dir: path.join(process.cwd(), 'public', 'images'), prefix: '/images/' },
]

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

async function main() {
  const assets = ['/']

  for (const root of ROOTS) {
    try {
      const files = await listFiles(root.dir)
      for (const file of files) {
        const rel = file.replace(root.dir, '')
        assets.push(`${root.prefix}${rel}`)
      }
    } catch (error) {
      console.warn(`offline manifest: skipped ${root.dir}`, error)
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    assets,
  }

  const target = path.join(process.cwd(), 'public', 'offline-manifest.json')
  await fs.writeFile(target, JSON.stringify(manifest, null, 2))
  console.log(`offline manifest wrote ${assets.length} assets to ${target}`)
}

main().catch((error) => {
  console.error('Failed to build offline manifest', error)
  process.exitCode = 1
})
