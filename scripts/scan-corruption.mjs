import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src')

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(vue|ts)$/.test(e.name)) out.push(p)
  }
  return out
}

const bad = []
for (const file of walk(root)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((line, i) => {
    // literal ?? in user-facing strings
    const m1 = line.match(/["'`]([^"'`]*\?{2,}[^"'`]*)["'`]/)
    const m2 = line.match(/>([^<>{}\n]*\?{2,}[^<>{}\n]*)</)
    const m3 = line.match(/text="([^"]*\?+[^"]*)"/)
    const m4 = line.match(/title="([^"]*\?+[^"]*)"/)
    const hit = m1?.[1] || m2?.[1]?.trim() || m3?.[1] || m4?.[1]
    if (hit && !hit.includes('??') === false) {
      if (/\?{2,}/.test(hit)) {
        bad.push({ file: path.relative(root, file), line: i + 1, text: hit.slice(0, 80) })
      }
    }
  })
}

if (!bad.length) console.log('No ?? corruption found')
else {
  console.log(`Found ${bad.length} corrupted lines:`)
  for (const b of bad) console.log(`${b.file}:${b.line}: ${b.text}`)
}
