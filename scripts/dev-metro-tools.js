const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

const TOOL_SERVERS = [
  {
    name: 'railmap-toolkit',
    cwd: path.join(ROOT, 'tools', 'railmapgen.github.io-main'),
    args: ['run', 'dev', '--', '--host', '--port', '3200'],
  },
  {
    name: 'rmp',
    cwd: path.join(ROOT, 'tools', 'rmp-main'),
    args: ['run', 'dev', '--', '--port', '3201'],
  },
  {
    name: 'rma',
    cwd: path.join(ROOT, 'tools', 'rma-main'),
    args: ['run', 'dev', '--', '--port', '3202'],
  },
  {
    name: 'rmg-palette',
    cwd: path.join(ROOT, 'tools', 'rmg-palette-main'),
    args: ['run', 'dev', '--', '--host', '--port', '3203'],
  },
  {
    name: 'rsg',
    cwd: path.join(ROOT, 'tools', 'rsg-main'),
    args: ['run', 'dev', '--', '--host', '--port', '3204'],
  },
]

const children = []
let shuttingDown = false

function log(name, msg) {
  process.stdout.write(`[${name}] ${msg}`)
}

function listMissingNodeModules() {
  return TOOL_SERVERS.filter(({ cwd }) => !fs.existsSync(path.join(cwd, 'node_modules')))
}

function spawnWithPrefix(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    env: process.env,
    shell: process.platform === 'win32',
  })
  children.push(child)

  child.stdout.on('data', (chunk) => log(name, chunk.toString()))
  child.stderr.on('data', (chunk) => log(name, chunk.toString()))

  child.on('exit', (code) => {
    if (shuttingDown) return
    if (code && code !== 0) {
      log(name, `exited with code ${code}\n`)
      shutdown(code)
    }
  })

  return child
}

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    try {
      child.kill('SIGTERM')
    } catch (_) {
      // ignore
    }
  }
  setTimeout(() => {
    for (const child of children) {
      try {
        child.kill('SIGKILL')
      } catch (_) {
        // ignore
      }
    }
    process.exit(code)
  }, 800)
}

async function main() {
  const missing = listMissingNodeModules()
  if (missing.length > 0) {
    console.error('Missing dependencies for integrated tool servers:')
    for (const tool of missing) {
      const rel = path.relative(ROOT, tool.cwd)
      console.error(`- ${rel}`)
    }
    console.error('\nRun npm install in each folder above, then run npm run dev again.')
    process.exit(1)
  }

  for (const tool of TOOL_SERVERS) {
    spawnWithPrefix(tool.name, 'npm', tool.args, tool.cwd)
  }

  spawnWithPrefix('metro-tools', 'npm', ['run', 'dev:core'], ROOT)

  process.on('SIGINT', () => shutdown(0))
  process.on('SIGTERM', () => shutdown(0))
}

main().catch((err) => {
  console.error(err)
  shutdown(1)
})
