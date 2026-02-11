#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const WATCH_ROOTS = [
  path.join(process.cwd(), 'src', 'app', '(game)'),
  path.join(process.cwd(), 'public', 'images'),
  path.join(process.cwd(), 'public', 'city-data'),
]
const CITY_CONFIG_PATH = path.join(process.cwd(), 'src', 'lib', 'citiesConfig.ts')
const DEBOUNCE_MS = 300
let timer = null
let running = false
let runningRegistry = false
let runningAvailability = false
let runningAvailableCityData = false
let pending = false
let pendingAvailability = false
let pendingAvailableCityData = false
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

function runAvailabilityNormalization() {
  if (runningAvailability) {
    log('availability normalization already running, skipping trigger')
    return
  }
  runningAvailability = true
  const proc = spawn('node', ['scripts/normalize-city-availability.js'], {
    stdio: 'inherit',
    env: process.env,
  })
  proc.on('exit', (code) => {
    runningAvailability = false
    if (code === 0) {
      log('availability normalization complete')
    } else {
      log(`availability normalization exited with code ${code}`)
    }
    if (pending) {
      pending = false
      runAll()
      return
    }
    if (pendingAvailability) {
      pendingAvailability = false
      runAvailabilityNormalization()
    }
  })
}

function runAvailableCityDataGeneration() {
  if (runningAvailableCityData) {
    log('available city data generation already running, skipping trigger')
    return
  }
  runningAvailableCityData = true
  const proc = spawn('node', ['scripts/generate-available-city-data.js'], {
    stdio: 'inherit',
    env: process.env,
  })
  proc.on('exit', (code) => {
    runningAvailableCityData = false
    if (code === 0) {
      log('available city data generation complete')
    } else {
      log(`available city data generation exited with code ${code}`)
    }
    if (pending) {
      pending = false
      runAll()
      return
    }
    if (pendingAvailableCityData) {
      pendingAvailableCityData = false
      runAvailableCityDataGeneration()
    }
  })
}

function runAll() {
  if (running || runningRegistry || runningAvailability || runningAvailableCityData) {
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
    runAvailabilityNormalization()
    runAvailableCityDataGeneration()
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

function watchFile(filePath) {
  try {
    fs.watch(filePath, { persistent: true }, (event) => {
      if (event === 'rename' || event === 'change') {
        log(`city config change detected (${event}), normalizing availability...`)
        if (runningAvailability) {
          pendingAvailability = true
          return
        }
        runAvailabilityNormalization()
      }
    })
  } catch (err) {
    log(`failed to watch ${filePath}: ${err.message}`)
  }
}

WATCH_ROOTS.forEach((root) => {
  log(`watching ${root} for changes...`)
  watchDir(root)
})
watchFile(CITY_CONFIG_PATH)
runAll()
