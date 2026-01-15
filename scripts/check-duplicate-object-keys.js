#!/usr/bin/env node
/**
 * Scans all game config files for duplicate property names inside
 * object literals. Exits with a non-zero status if any are found.
 */
const fs = require('fs')
const path = require('path')
const fg = require('fast-glob')
const ts = require('typescript')

const gameDir = path.join(__dirname, '..', 'src', 'app', '(game)')
const configPaths = fg.sync('*/config.ts', { cwd: gameDir, absolute: true })

if (configPaths.length === 0) {
  console.error('No config files found under src/app/(game).')
  process.exit(1)
}

const allIssues = []

function getPropName(name, sourceFile) {
  if (!name) return null
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) {
    return name.text
  }
  if (ts.isComputedPropertyName(name)) {
    const expr = name.expression
    if (ts.isStringLiteralLike(expr) || ts.isNumericLiteral(expr)) {
      return expr.text
    }
    const pos = sourceFile.getLineAndCharacterOfPosition(name.getStart())
    console.warn(
      `Skipping non-literal computed property at ${sourceFile.fileName}:${pos.line + 1}:${
        pos.character + 1
      }`
    )
  }
  return null
}

function collectDuplicates(node, sourceFile, issues) {
  if (!ts.isObjectLiteralExpression(node)) return
  const seen = new Map()

  for (const prop of node.properties) {
    if (!('name' in prop)) continue
    const propName = getPropName(prop.name, sourceFile)
    if (!propName) continue

    const { line, character } = sourceFile.getLineAndCharacterOfPosition(prop.name.getStart())
    const entry = { line: line + 1, column: character + 1 }
    if (!seen.has(propName)) {
      seen.set(propName, [entry])
    } else {
      seen.get(propName).push(entry)
    }
  }

  for (const [name, occurrences] of seen) {
    if (occurrences.length > 1) {
      issues.push({ name, occurrences })
    }
  }
}

for (const filePath of configPaths) {
  const source = fs.readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true)

  const fileIssues = []
  function visit(node) {
    collectDuplicates(node, sourceFile, fileIssues)
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

  if (fileIssues.length > 0) {
    allIssues.push({ filePath, issues: fileIssues })
  }
}

if (allIssues.length === 0) {
  console.log('No duplicate property names found in game config files.')
  process.exit(0)
}

console.error('Duplicate property names found:')
for (const { filePath, issues } of allIssues) {
  const relativePath = path.relative(process.cwd(), filePath)
  console.error(`\n${relativePath}`)
  for (const issue of issues) {
    const locations = issue.occurrences.map(loc => `${loc.line}:${loc.column}`).join(', ')
    console.error(`  "${issue.name}" at ${locations}`)
  }
}

process.exit(1)
