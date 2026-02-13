const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const tools = [
  'railmapgen.github.io-main',
  'rmp-main',
  'rma-main',
  'rmg-palette-main',
  'rsg-main',
]

let copied = 0

for (const tool of tools) {
  const source = path.join(root, 'tools', tool, 'info.json')
  const targetDir = path.join(root, 'tools', tool, 'public')
  const target = path.join(targetDir, 'info.json')

  if (!fs.existsSync(source)) {
    continue
  }

  fs.mkdirSync(targetDir, { recursive: true })
  fs.copyFileSync(source, target)
  copied += 1
  console.log(`[sync-tool-info-json] ${source} -> ${target}`)
}

if (copied === 0) {
  console.log('[sync-tool-info-json] No info.json files copied')
}
