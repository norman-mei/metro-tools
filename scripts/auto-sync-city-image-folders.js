#!/usr/bin/env node
/* eslint-disable no-console */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const WATCH_ROOT = path.join(process.cwd(), 'src', 'app', '(game)')
const DEBOUNCE_MS = 300
let timer = null
let running = false
const watchedDirs = new Set()

function log(msg) {
  console.log(`[auto-sync-image-folders] ${msg}`)
}

function runSync() {
  if (running) {
    log('sync already running, skipping trigger')
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

log(`watching ${WATCH_ROOT} for changes...`)
watchDir(WATCH_ROOT)
runSync()
