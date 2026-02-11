#!/usr/bin/env node
/* eslint-disable no-console */

const { spawn } = require('child_process')

const run = (cmd, args, name, onExit) => {
  const proc = spawn(cmd, args, { stdio: 'inherit', env: process.env })
  proc.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[dev-with-watchers] ${name} exited with code ${code}`)
    }
    if (onExit) onExit(code)
  })
  return proc
}

const bootstrap = () => {
  // keep existing dev behavior
  run(
    'node',
    ['scripts/sync-city-card-images.js'],
    'sync-city-card-images',
    () => {
      // start watcher for images + registries
      run('node', ['scripts/auto-sync-city-image-folders.js'], 'auto-sync-image-folders')
      // start next dev (turbo by default)
      run('next', ['dev', '--turbo'], 'next-dev')
    },
  )
}

bootstrap()
