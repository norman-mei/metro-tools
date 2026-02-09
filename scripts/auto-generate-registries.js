#!/usr/bin/env node
/* eslint-disable no-console */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const WATCH_ROOTS = [
  path.join(process.cwd(), 'src', 'app', '(game)'),
  path.join(process.cwd(), 'public', 'images'),
]
const DEBOUNCE_MS = 500
let timer = null
let running = false
const watchedDirs = new Set()

function log(msg) {
  console.log(`[auto-generate-registries] ${msg}`)
}

function runSync() {
  if (running) {
    log('generator already running, skipping trigger')
    return
  }
  running = true
  const proc = spawn('node', ['scripts/run-ts.js', 'scripts/metro-sync/generate-registries.ts'], {
    stdio: 'inherit',
    env: process.env,
  })
  proc.on('exit', (code) => {
    running = false
    if (code === 0) {
      log('registry generation complete')
    } else {
      log(`registry generation exited with code ${code}`)
    }
  })
}

function queueSync(reason) {
  log(`change detected (${reason}), scheduling registry generation...`)
  clearTimeout(timer)
  timer = setTimeout(runSync, DEBOUNCE_MS)
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

runSync()
