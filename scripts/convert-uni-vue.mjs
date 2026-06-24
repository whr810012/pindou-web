import fs from 'node:fs'
import path from 'node:path'

const root = process.argv[2]
if (!root) {
  console.error('Usage: node convert-uni-vue.mjs <dir>')
  process.exit(1)
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.name.endsWith('.vue')) files.push(full)
  }
  return files
}

function stripIfdefs(text) {
  let out = text
  out = out.replace(/<!--\s*#ifdef[\s\S]*?-->/g, '')
  out = out.replace(/<!--\s*#ifndef[\s\S]*?-->/g, '')
  out = out.replace(/<!--\s*#endif\s*-->/g, '')
  out = out.replace(/\/\/\s*#ifdef[\s\S]*?(?=\n)/g, '')
  out = out.replace(/\/\/\s*#ifndef[\s\S]*?(?=\n)/g, '')
  out = out.replace(/\/\/\s*#endif.*\n/g, '')
  return out
}

function convert(content) {
  let text = stripIfdefs(content)
  text = text.replace(/<\/?view\b/g, (m) => m.replace('view', 'div'))
  text = text.replace(/<\/?scroll-view\b/g, (m) => m.replace('scroll-view', 'div'))
  text = text.replace(/<\/?text\b/g, (m) => m.replace('text', 'span'))
  text = text.replace(/<\/?image\b/g, (m) => m.replace('image', 'img'))
  text = text.replace(/\bmode="[^"]*"/g, '')
  text = text.replace(/uni\.navigateTo\(\{\s*url:\s*'([^']+)'\s*\}\)/g, "router.push('$1')")
  text = text.replace(/uni\.navigateTo\(\{\s*url:\s*"([^"]+)"\s*\}\)/g, 'router.push("$1")')
  text = text.replace(/uni\.redirectTo\(\{\s*url:\s*'([^']+)'\s*\}\)/g, "router.replace('$1')")
  text = text.replace(/uni\.navigateBack\(\)/g, 'router.back()')
  text = text.replace(/<u-button([^>]*)>/g, '<PButton$1>')
  text = text.replace(/<\/u-button>/g, '</PButton>')
  text = text.replace(/<u-popup([^>]*)>/g, '<PDrawer$1>')
  text = text.replace(/<\/u-popup>/g, '</PDrawer>')
  text = text.replace(/:show="/g, ':modelValue="')
  text = text.replace(/@close="/g, '@update:modelValue="')
  text = text.replace(/pages\/([a-z0-9-]+)\/([a-z0-9-]+)/g, (_m, _folder, page) => {
    const map = {
      index: '/',
      workspace: '/workspace',
      editor: '/editor',
      focus: '/focus',
      projects: '/projects',
      gallery: '/gallery',
      preview3d: '/preview3d',
      'palette-editor': '/palette',
    }
    return map[page] ?? `/${page}`
  })
  return text
}

for (const file of walk(root)) {
  const raw = fs.readFileSync(file, 'utf8')
  const next = convert(raw)
  if (next !== raw) {
    fs.writeFileSync(file, next)
    console.log('converted', file)
  }
}
