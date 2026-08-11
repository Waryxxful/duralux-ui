// Gate de fidelidad: prohíbe patrones que la plantilla Duralux original NO usa.
// Auditoría 2026-07-10 + 2026-07-31: outline buttons, table-striped, bg-*-100,
// y prop variant="outline*" en JSX.
import { readdirSync, readFileSync, statSync } from 'fs'
import { basename, dirname, extname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

export const BANNED = [
  { re: /btn-outline-/, why: 'la plantilla no usa btn-outline-*; usá variant="light-brand" o sólido semántico' },
  { re: /variant\s*=\s*["']outline[^"']*["']/, why: 'variant outline* está prohibido; usá light-brand o semántico sólido' },
  { re: /variant\s*=\s*\{["']outline[^"']*["']\}/, why: 'variant outline* está prohibido; usá light-brand o semántico sólido' },
  { re: /table-striped/, why: 'la plantilla usa table table-hover, nunca striped' },
  { re: /bg-(?:\$\{[^}]+\}|primary|secondary|success|danger|warning|info|dark|light)-100/, why: 'bg-*-100 no existe en el theme; el canon es bg-soft-*' },
]

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx'])
const AUDIT_SCRIPT_PATH = resolve(fileURLToPath(import.meta.url))
const IGNORED_DIRECTORIES = new Set(['node_modules', '.git', 'dist', 'coverage'])

/**
 * Remove comments while preserving strings and line breaks. Code following a
 * comment remains in the returned line, so a comment cannot bypass the gate.
 */
export function stripComments(source) {
  let output = ''
  let inBlockComment = false
  let quote = null
  let escaped = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false
        output += '  '
        index += 1
      } else {
        output += char === '\n' ? '\n' : ' '
      }
      continue
    }

    if (quote) {
      output += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') index += 1
      if (source[index] === '\n') output += '\n'
      continue
    }
    if (char === '/' && next === '*') {
      inBlockComment = true
      output += '  '
      index += 1
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char
    }
    output += char
  }

  return output
}

function testPattern(re, line) {
  // Reset state even if a future rule is changed to use the global flag.
  re.lastIndex = 0
  return re.test(line)
}

function sourceFiles(root) {
  const files = []
  const visit = (directory) => {
    let entries
    try {
      entries = readdirSync(directory, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(path)
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
        files.push(path)
      }
    }
  }
  visit(root)
  return files
}

export function collectSourceFiles(roots = ['src', 'demo/src'], cwd = process.cwd()) {
  return roots.flatMap((root) => sourceFiles(resolve(cwd, root)))
}

export function auditText(source, file = '<text>') {
  const lines = stripComments(source).split('\n')
  const violations = []

  BANNED.forEach(({ re, why, allow = [] }) => {
    if (allow.some((allowed) => file.endsWith(allowed))) return
    lines.forEach((line, index) => {
      if (!testPattern(re, line)) return
      violations.push({
        file,
        line: index + 1,
        source: line.trim().slice(0, 160),
        why,
      })
    })
  })

  return violations
}

export function auditContract({ roots = ['src', 'demo/src'], cwd = process.cwd() } = {}) {
  const files = collectSourceFiles(roots, cwd)
  const violations = files
    .filter((file) => resolve(file) !== AUDIT_SCRIPT_PATH)
    .flatMap((file) => {
      let source
      try {
        source = readFileSync(file, 'utf8')
      } catch {
        return []
      }
      return auditText(source, file)
    })
  return { files, violations }
}

function run() {
  const result = auditContract()
  result.violations.forEach(({ file, line, source, why }) => {
    console.error(`✗ ${file}:${line} — ${source}\n  → ${why}`)
  })
  if (result.violations.length) {
    console.error(`\naudit-contract: ${result.violations.length} violaciones de fidelidad con la plantilla.`)
    process.exitCode = 1
    return
  }
  console.log(`audit-contract: OK (${result.files.length} archivos, 0 violaciones)`)
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null
if (invokedPath === AUDIT_SCRIPT_PATH) run()
