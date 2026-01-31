const path = require('path')
const fs = require('fs/promises')
const fg = require('fast-glob')

const SOURCE_ROOT = path.join(process.cwd(), 'src', 'app', '(game)')
const DEST_ROOT = path.join(process.cwd(), 'public', 'city-data')

async function ensureDestDir() {
  await fs.mkdir(DEST_ROOT, { recursive: true })
}

function getSlugFromMatch(relPath) {
  // relPath looks like "north-america/usa/ny/data/routes.json"
  const segments = relPath.split('/')
  return segments[segments.length - 3]
}

async function buildCityPayload(baseDir) {
  const featuresPath = path.join(baseDir, 'features.json')
  const routesPath = path.join(baseDir, 'routes.json')

  const [featuresRaw, routesRaw] = await Promise.all([
    fs.readFile(featuresPath, 'utf-8'),
    fs.readFile(routesPath, 'utf-8'),
  ])

  return {
    features: JSON.parse(featuresRaw),
    routes: JSON.parse(routesRaw),
  }
}

async function main() {
  await ensureDestDir()

  const matches = await fg('**/data/routes.json', {
    cwd: SOURCE_ROOT,
    dot: false,
  })

  let written = 0

  for (const relPath of matches) {
    if (relPath.includes('_placeholder')) continue

    const slug = getSlugFromMatch(relPath)
    const cityDataDir = path.join(SOURCE_ROOT, path.dirname(relPath))

    try {
      const payload = await buildCityPayload(cityDataDir)
      const destPath = path.join(DEST_ROOT, `${slug}.json`)
      await fs.writeFile(destPath, JSON.stringify(payload))
      written++
    } catch (err) {
      console.warn(`Skipping ${slug}: ${err.message}`)
    }
  }

  console.log(`Exported ${written} city data files to ${DEST_ROOT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
