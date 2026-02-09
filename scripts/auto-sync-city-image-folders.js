#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const WATCH_ROOTS = [
  path.join(process.cwd(), 'src', 'app', '(game)'),
  path.join(process.cwd(), 'public', 'images'),
]
const DEBOUNCE_MS = 300
let timer = null
let running = false
let runningRegistry = false
let pending = false
const watchedDirs = new Set()

function log(msg) {
  console.log(`[auto-sync-image-folders] ${msg}`)
}

function runRegistryGeneration() {
  if (runningRegistry) {
    log('registry generation already running, skipping trigger')
    return
  }
  runningRegistry = true
  const proc = spawn(
    'node',
    ['scripts/run-ts.js', 'scripts/metro-sync/generate-registries.ts'],
    {
      stdio: 'inherit',
      env: process.env,
    },
  )
  proc.on('exit', (code) => {
    runningRegistry = false
    if (code === 0) {
      log('registry generation complete')
    } else {
      log(`registry generation exited with code ${code}`)
    }
    if (pending) {
      pending = false
      runAll()
    }
  })
}

function runAll() {
  if (running || runningRegistry) {
    pending = true
    log('sync already running, queued another run')
    return
  }
  running = true
  const proc = spawn('node', ['scripts/sync-city-image-folders.js'], {
    stdio: 'inherit',
    env: process.env,
  })
  proc.on('exit', (code) => {
    running = false
    if (code === 0) {
      log('image folder sync complete')
    } else {
      log(`image folder sync exited with code ${code}`)
    }
    runRegistryGeneration()
  })
}

function queueSync(reason) {
  log(`change detected (${reason}), scheduling sync...`)
  clearTimeout(timer)
  timer = setTimeout(runAll, DEBOUNCE_MS)
}

function watchDir(dir) {
  if (watchedDirs.has(dir)) return
  watchedDirs.add(dir)

  try {
    const watcher = fs.watch(dir, { persistent: true }, (event, filename) => {
      const label = filename ? `${event}:${filename}` : event
      queueSync(label)

      if (!filename) return
      const fullPath = path.join(dir, filename)
      fs.stat(fullPath, (err, stat) => {
        if (!err && stat.isDirectory()) {
          watchDir(fullPath)
        }
      })
    })
    watcher.on('error', (err) => log(`watch error in ${dir}: ${err.message}`))
  } catch (err) {
    log(`failed to watch ${dir}: ${err.message}`)
  }

  fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
    if (err) return
    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        watchDir(path.join(dir, entry.name))
      }
    })
  })
}

WATCH_ROOTS.forEach((root) => {
  log(`watching ${root} for changes...`)
  watchDir(root)
})
runAll()
