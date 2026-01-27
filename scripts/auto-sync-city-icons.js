#!/usr/bin/env node
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const WATCH_ROOT = path.join(process.cwd(), 'src', 'app', '(game)')
const PATTERN = /\.(ico)$/i
const DEBOUNCE_MS = 300
let timer = null
let running = false

function log(msg) {
  console.log(`[auto-sync-icons] ${msg}`)
}

function runSync() {
  if (running) {
    log('sync already running, skipping trigger')
    return
  }
  running = true
  const proc = spawn('node', ['scripts/sync-city-icons.js'], {
    stdio: 'inherit',
    env: process.env,
  })
  proc.on('exit', (code) => {
    running = false
    if (code === 0) {
      log('sync complete')
    } else {
      log(`sync exited with code ${code}`)
    }
  })
}

function queueSync(reason) {
  log(`change detected (${reason}), scheduling sync...`)
  clearTimeout(timer)
  timer = setTimeout(runSync, DEBOUNCE_MS)
}

function watchRecursive(dir) {
  fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
    if (err) return
    entries.forEach((entry) => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        watchRecursive(full)
      }
    })
  })

  try {
    const watcher = fs.watch(dir, { persistent: true }, (event, filename) => {
      if (!filename) return
      const lower = filename.toLowerCase()
      if (PATTERN.test(lower)) {
        queueSync(`${event}:${filename}`)
      }
    })
    watcher.on('error', (err) => log(`watch error in ${dir}: ${err.message}`))
  } catch (err) {
    log(`failed to watch ${dir}: ${err.message}`)
  }
}

log(`watching ${WATCH_ROOT} for icon.ico / favicon.ico changes...`)
watchRecursive(WATCH_ROOT)
runSync()
