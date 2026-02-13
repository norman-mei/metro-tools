const { spawn } = require('child_process')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

const child = spawn('npm', ['run', 'dev:core'], {
  cwd: ROOT,
  env: process.env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
