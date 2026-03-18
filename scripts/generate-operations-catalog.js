#!/usr/bin/env node

/**
 * Generates an operations catalog from all manifest.ttl files in the barnard59 monorepo.
 * Zero external dependencies — parses Turtle using a lightweight approach.
 *
 * Usage:
 *   node scripts/generate-operations-catalog.js > docs/operations-catalog.md
 */

import fs from 'fs'
import path from 'path'

const REPO_ROOT = path.resolve(new URL('..', import.meta.url).pathname)

// Known pipeline ontology type IRIs
const TYPE_MAP = {
  'https://pipeline.described.at/Readable': 'Readable',
  'https://pipeline.described.at/ReadableObjectMode': 'ReadableObjectMode',
  'https://pipeline.described.at/Writable': 'Writable',
  'https://pipeline.described.at/WritableObjectMode': 'WritableObjectMode',
  'https://pipeline.described.at/Operation': 'Operation',
}

/**
 * Minimal Turtle parser that extracts operation blocks from manifest.ttl files.
 * Handles @base, @prefix, multi-line blocks, and nested blank nodes.
 */
function parseManifest(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const operations = []
  const cliCommands = []

  // Extract prefixes and base
  const prefixes = {}
  let base = ''

  for (const match of content.matchAll(/@prefix\s+(\w+):\s+<([^>]+)>\s*\./g)) {
    prefixes[match[1]] = match[2]
  }
  const baseMatch = content.match(/@base\s+<([^>]+)>\s*\./)
  if (baseMatch) base = baseMatch[1]

  // Split into blocks (separated by dots at end of line/statement)
  // We'll use a state machine approach instead
  const blocks = splitIntoBlocks(content)

  for (const block of blocks) {
    // Skip prefix/base declarations
    if (block.trim().startsWith('@prefix') || block.trim().startsWith('@base')) continue

    const types = extractTypes(block, prefixes, base)
    const isOperation = types.includes('Operation')
    const isCliCommand = types.some(t => t === 'CliCommand')

    if (isOperation) {
      const iri = extractSubjectIri(block, prefixes, base)
      const label = extractStringProperty(block, 'rdfs:label', prefixes) ||
                    extractStringProperty(block, 'label', prefixes)
      const comment = extractStringProperty(block, 'rdfs:comment', prefixes) ||
                      extractStringProperty(block, 'comment', prefixes)
      const codeLink = extractCodeLink(block, prefixes, base)
      const streamTypes = types.filter(t => TYPE_MAP[`https://pipeline.described.at/${t}`])

      operations.push({
        iri,
        label: label || '',
        comment: comment || '',
        codeLink: codeLink || '',
        streamTypes,
      })
    }

    if (isCliCommand) {
      const iri = extractSubjectIri(block, prefixes, base)
      const label = extractStringProperty(block, 'rdfs:label', prefixes) || ''
      const command = extractStringProperty(block, 'b59:command', prefixes) || ''
      const source = extractStringProperty(block, 'b59:source', prefixes) || ''

      cliCommands.push({ iri, label, command, source })
    }
  }

  return { operations, cliCommands }
}

function splitIntoBlocks(content) {
  const blocks = []
  let current = ''
  let depth = 0
  let inString = false
  let stringChar = ''
  let inLongString = false
  let inIri = false

  for (let i = 0; i < content.length; i++) {
    const c = content[i]
    const next3 = content.slice(i, i + 3)

    // Handle long strings (triple-quoted)
    if (!inString && !inIri && (next3 === '"""' || next3 === "'''")) {
      inString = true
      inLongString = true
      stringChar = next3
      current += next3
      i += 2
      continue
    }

    if (inLongString && content.slice(i, i + 3) === stringChar) {
      inString = false
      inLongString = false
      current += stringChar
      i += 2
      continue
    }

    if (inLongString) {
      current += c
      continue
    }

    // Handle IRIs in angle brackets
    if (!inString && !inIri && c === '<') {
      inIri = true
      current += c
      continue
    }
    if (inIri && c === '>') {
      inIri = false
      current += c
      continue
    }
    if (inIri) {
      current += c
      continue
    }

    // Handle regular strings
    if (!inString && (c === '"' || c === "'")) {
      inString = true
      stringChar = c
      current += c
      continue
    }
    if (inString && c === stringChar) {
      inString = false
      current += c
      continue
    }
    if (inString) {
      current += c
      continue
    }

    // Handle comments
    if (c === '#') {
      // Skip to end of line
      while (i < content.length && content[i] !== '\n') i++
      current += '\n'
      continue
    }

    if (c === '[' || c === '(') depth++
    if (c === ']' || c === ')') depth--

    if (c === '.' && depth === 0) {
      current += c
      if (current.trim().length > 0) {
        blocks.push(current.trim())
      }
      current = ''
    } else {
      current += c
    }
  }

  if (current.trim().length > 0) {
    blocks.push(current.trim())
  }

  return blocks
}

function resolveIri(ref, prefixes, base) {
  if (ref.startsWith('<') && ref.endsWith('>')) {
    const iri = ref.slice(1, -1)
    if (iri.startsWith('http://') || iri.startsWith('https://') || iri.startsWith('urn:')) {
      return iri
    }
    return base + iri
  }
  // Prefixed name
  const colonIdx = ref.indexOf(':')
  if (colonIdx !== -1) {
    const prefix = ref.slice(0, colonIdx)
    const local = ref.slice(colonIdx + 1)
    if (prefixes[prefix]) {
      return prefixes[prefix] + local
    }
  }
  return ref
}

function extractSubjectIri(block, prefixes, base) {
  const trimmed = block.trim()
  const match = trimmed.match(/^(<[^>]+>|[\w]+:[\w/.*#-]*)/)
  if (match) return resolveIri(match[1], prefixes, base)
  return ''
}

function extractTypes(block, prefixes, base) {
  const types = []
  // Match "a Type1, Type2, Type3" or "rdf:type Type1"
  const typeMatch = block.match(/(?:^[^;]*?\ba\s+)([\w:,\s/<>.#-]+?)(?:\s*[;.])/m)
  if (typeMatch) {
    const typeStr = typeMatch[1]
    for (const t of typeStr.split(',')) {
      const trimmed = t.trim()
      if (!trimmed) continue
      const iri = resolveIri(trimmed, prefixes, base)
      // Extract last path component as type name
      const parts = iri.split('/')
      const typeName = parts[parts.length - 1]
      types.push(typeName)
    }
  }
  return types
}

function extractStringProperty(block, prop, prefixes) {
  // Handle prefixed property name - escape special regex characters
  const escapedProp = prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`${escapedProp}\\s+"([^"]*)"`, 'm')
  const match = block.match(pattern)
  if (match) return match[1]
  return null
}

function extractCodeLink(block, prefixes, base) {
  const match = block.match(/code:link\s+(<[^>]+>|[\w]+:[\w/.*#-]*)/)
  if (match) return resolveIri(match[1], prefixes, base)
  return null
}

function getPackageName(manifestPath) {
  const parts = manifestPath.split(path.sep)
  const pkgIdx = parts.indexOf('packages')
  if (pkgIdx !== -1 && pkgIdx + 1 < parts.length) {
    return `barnard59-${parts[pkgIdx + 1]}`
  }
  return path.basename(path.dirname(manifestPath))
}

function operationToSimplifiedPrefix(iri) {
  // Most operations: https://barnard59.zazuko.com/operations/base/map -> op:base/map
  const opsMatch = iri.match(/barnard59\.zazuko\.com\/operations\/(.+)$/)
  if (opsMatch) return `op:${opsMatch[1]}`

  // Cube, graph-store etc: https://barnard59.zazuko.com/operations/cube/buildCubeShape
  const altMatch = iri.match(/barnard59\.zazuko\.com\/(.+)$/)
  if (altMatch) return `op:${altMatch[1].replace(/^operations\//, '')}`

  return iri
}

function formatSignature(streamTypes) {
  const inputs = streamTypes.filter(t => t.startsWith('Writable'))
  const outputs = streamTypes.filter(t => t.startsWith('Readable'))

  if (inputs.length === 0 && outputs.length === 0) return '(no stream metadata)'
  if (inputs.length === 0) return `→ ${outputs.join(', ')}`
  if (outputs.length === 0) return `${inputs.join(', ')} →`
  return `${inputs.join(', ')} → ${outputs.join(', ')}`
}

function generateMarkdown(catalog) {
  const lines = []

  lines.push('<!-- AUTO-GENERATED from manifest.ttl files. Do not edit manually. -->')
  lines.push('<!-- Run: node scripts/generate-operations-catalog.js > docs/operations-catalog.md -->')
  lines.push('')
  lines.push('# barnard59 Operations Catalog')
  lines.push('')
  lines.push('## Stream Type Legend')
  lines.push('')
  lines.push('| Type | Meaning |')
  lines.push('|------|---------|')
  lines.push('| `Readable` | Produces raw byte chunks |')
  lines.push('| `ReadableObjectMode` | Produces objects (typically RDF/JS Quads) |')
  lines.push('| `Writable` | Consumes raw byte chunks |')
  lines.push('| `WritableObjectMode` | Consumes objects (typically RDF/JS Quads) |')
  lines.push('')
  lines.push('## Compatibility Rules')
  lines.push('')
  lines.push('Two consecutive steps are compatible when:')
  lines.push('- `Readable` output connects to `Writable` input')
  lines.push('- `ReadableObjectMode` output connects to `WritableObjectMode` input')
  lines.push('')
  lines.push('**Invalid:** `Readable` → `WritableObjectMode` or `ReadableObjectMode` → `Writable`')
  lines.push('')

  const allOps = []

  for (const [pkg, data] of Object.entries(catalog)) {
    if (data.operations.length === 0 && data.cliCommands.length === 0) continue

    lines.push(`## ${pkg}`)
    lines.push('')

    if (data.operations.length > 0) {
      lines.push('| Operation | Simplified Syntax | Signature | Description |')
      lines.push('|-----------|-------------------|-----------|-------------|')

      for (const op of data.operations) {
        const simplified = operationToSimplifiedPrefix(op.iri)
        const sig = formatSignature(op.streamTypes)
        const desc = (op.comment || '').replace(/\n/g, ' ').replace(/\|/g, '\\|')
        lines.push(`| ${op.label} | \`${simplified}\` | \`${sig}\` | ${desc} |`)
        allOps.push({ ...op, pkg, simplified })
      }
      lines.push('')
    }

    if (data.cliCommands.length > 0) {
      lines.push('### CLI Commands')
      lines.push('')
      for (const cmd of data.cliCommands) {
        lines.push(`- \`barnard59 ${cmd.command}\` — ${cmd.label}`)
      }
      lines.push('')
    }
  }

  // Categorized summary
  lines.push('## Operations by Role')
  lines.push('')

  const starters = allOps.filter(op => {
    const hasOutput = op.streamTypes.some(t => t.startsWith('Readable'))
    const hasInput = op.streamTypes.some(t => t.startsWith('Writable'))
    return hasOutput && !hasInput
  })
  const enders = allOps.filter(op => {
    const hasOutput = op.streamTypes.some(t => t.startsWith('Readable'))
    const hasInput = op.streamTypes.some(t => t.startsWith('Writable'))
    return hasInput && !hasOutput
  })
  const transforms = allOps.filter(op => {
    const hasOutput = op.streamTypes.some(t => t.startsWith('Readable'))
    const hasInput = op.streamTypes.some(t => t.startsWith('Writable'))
    return hasInput && hasOutput
  })

  lines.push('### Source Operations (can START a pipeline)')
  lines.push('')
  for (const op of starters) {
    const outputs = op.streamTypes.filter(t => t.startsWith('Readable')).join(', ')
    lines.push(`- \`${op.simplified}\` → ${outputs} — ${op.label}`)
  }
  lines.push('')

  lines.push('### Sink Operations (can END a pipeline)')
  lines.push('')
  for (const op of enders) {
    const inputs = op.streamTypes.filter(t => t.startsWith('Writable')).join(', ')
    lines.push(`- ${inputs} → \`${op.simplified}\` — ${op.label}`)
  }
  lines.push('')

  lines.push('### Transform Operations (middle of pipeline)')
  lines.push('')
  for (const op of transforms) {
    const sig = formatSignature(op.streamTypes)
    lines.push(`- \`${op.simplified}\`: ${sig} — ${op.label}`)
  }
  lines.push('')

  return lines.join('\n')
}

// Main
const packagesDir = path.join(REPO_ROOT, 'packages')
const manifestFiles = fs.readdirSync(packagesDir)
  .filter(dir => {
    const manifestPath = path.join(packagesDir, dir, 'manifest.ttl')
    return fs.existsSync(manifestPath)
  })
  .map(dir => path.join(packagesDir, dir, 'manifest.ttl'))
  .sort()

const catalog = {}

for (const manifestPath of manifestFiles) {
  const pkgName = getPackageName(manifestPath)
  try {
    catalog[pkgName] = parseManifest(manifestPath)
  } catch (err) {
    process.stderr.write(`Warning: failed to parse ${manifestPath}: ${err.message}\n`)
    catalog[pkgName] = { operations: [], cliCommands: [] }
  }
}

process.stdout.write(generateMarkdown(catalog))
