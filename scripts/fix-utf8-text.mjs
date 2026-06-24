import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '../src')

function patch(file, pairs) {
  const full = path.join(root, file)
  let s = fs.readFileSync(full, 'utf8')
  for (const [from, to] of pairs) {
    if (!s.includes(from)) {
      console.warn(`skip missing in ${file}:`, from)
      continue
    }
    s = s.split(from).join(to)
  }
  fs.writeFileSync(full, s, 'utf8')
  console.log('patched', file)
}

const indexPath = path.join(root, 'pages/IndexPage.vue')
const indexTpl = fs.readFileSync(indexPath, 'utf8')
const indexScript = indexTpl.match(/<script[\s\S]*?<\/script>/)[0]
const indexStyle = indexTpl.match(/<style[\s\S]*<\/style>/)[0]
const indexBody = `<template>
  <div class="page page--hero">
    <div class="hero">
      <h1 class="text-display seo-h1">Pindou \u62FC\u8C46</h1>
      <p class="text-subtitle hero-sub">\u56FE\u7247\u8F6C\u62FC\u8C46\u56FE\u7EB8 \u00B7 \u672C\u5730\u5904\u7406 \u00B7 \u7F51\u9875\u53EF\u7528</p>
    </div>

    <section class="card card--flat steps" aria-label="\u62FC\u8C46\u56FE\u7EB8\u5236\u4F5C\u6B65\u9AA4">
      <h2 class="section-heading visually-hidden">\u5236\u4F5C\u6B65\u9AA4</h2>
      <div class="step">
        <span class="step-num">1</span>
        <div>
          <span class="step-title">\u4E0A\u4F20\u56FE\u7247</span>
          <span class="step-desc">\u652F\u6301\u76F8\u518C\u4E0E\u62CD\u7167\uFF0C\u81EA\u52A8\u538B\u7F29\u540E\u672C\u5730\u5904\u7406</span>
        </div>
      </div>
      <div class="step">
        <span class="step-num">2</span>
        <div>
          <span class="step-title">\u751F\u6210\u4E0E\u7F16\u8F91</span>
          <span class="step-desc">\u667A\u80FD\u50CF\u7D20\u5316\u3001\u591A\u54C1\u724C\u8272\u5361\u3001\u5728\u7EBF\u7CBE\u4FEE</span>
        </div>
      </div>
      <div class="step">
        <span class="step-num">3</span>
        <div>
          <span class="step-title">\u5BFC\u51FA\u56FE\u7EB8</span>
          <span class="step-desc">\u5E26\u8272\u53F7\u9AD8\u6E05\u56FE\u7EB8\u4E0E\u91C7\u8D2D\u6E05\u5355</span>
        </div>
      </div>
    </section>

    <div class="actions">
      <PButton type="primary" block text="\u5F00\u59CB\u5236\u4F5C" @click="goWorkspace" />
      <PButton plain block text="\u63A2\u7D22\u753B\u5ECA" @click="goGallery" />
      <PButton plain block text="\u81EA\u5B9A\u4E49\u8272\u677F" @click="goPaletteEditor" />
      <PButton plain block text="\u6211\u7684\u9879\u76EE" @click="goProjects" />
    </div>

    <nav class="text-links" aria-label="\u7AD9\u5185\u5BFC\u822A">
      <a class="text-link" href="/gallery" @click.prevent="goGallery">\u67E5\u770B\u62FC\u8C46\u56FE\u6848\u4F8B\u4E0E MARD \u53C2\u6570\u63A8\u8350</a>
      <a class="text-link" href="/workspace" @click.prevent="goWorkspace">\u8FDB\u5165\u62FC\u8C46\u5DE5\u4F5C\u53F0\u5F00\u59CB\u5236\u4F5C</a>
    </nav>

    <section class="card card--flat features">
      <h2 class="section-heading">\u4E3A\u4EC0\u4E48\u9009\u62E9 Pindou</h2>
      <div class="feature">
        <span class="feature-title">\u672C\u5730\u9690\u79C1\u5904\u7406</span>
        <span class="feature-desc">\u56FE\u7247\u5728\u6D4F\u89C8\u5668\u672C\u5730\u5B8C\u6210\u50CF\u7D20\u5316\u4E0E\u8272\u53F7\u6620\u5C04\uFF0C\u9ED8\u8BA4\u4E0D\u4E0A\u4F20\u670D\u52A1\u5668\uFF0C\u4FDD\u62A4\u521B\u4F5C\u9690\u79C1\u3002</span>
      </div>
      <div class="feature">
        <span class="feature-title">\u591A\u54C1\u724C\u8272\u5361\u652F\u6301</span>
        <span class="feature-desc">\u5185\u7F6E MARD\u3001COCO\u3001\u6F2B\u6F2B\u3001\u76FC\u76FC\u3001\u5495\u5C0F\u7A9D\u7B49\u4E3B\u6D41\u62FC\u8C46\u8272\u53F7\uFF0C\u4E5F\u53EF\u81EA\u5B9A\u4E49\u8272\u677F\u4E0E\u626B\u7801\u5206\u4EAB\u3002</span>
      </div>
      <div class="feature">
        <span class="feature-title">\u4E13\u4E1A\u5BFC\u51FA\u80FD\u529B</span>
        <span class="feature-desc">\u5BFC\u51FA\u5E26\u8272\u53F7\u9AD8\u6E05\u56FE\u7EB8\u3001\u91C7\u8D2D\u6E05\u5355 CSV/PNG\uFF0C\u7F51\u9875\u7AEF\u652F\u6301 PDF \u62FC\u8C46\u56FE\u7EB8\u6253\u5370\u3002</span>
      </div>
      <div class="feature">
        <span class="feature-title">\u5B8C\u6574\u521B\u4F5C\u6D41\u7A0B</span>
        <span class="feature-desc">\u4ECE\u56FE\u7247\u8F6C\u62FC\u8C46\u3001\u5728\u7EBF\u7F16\u8F91\u30013D \u9884\u89C8\u5230\u4E13\u5FC3\u62FC\u8C46\u5206\u533A\u6A21\u5F0F\uFF0C\u8986\u76D6\u62FC\u8C46\u56FE\u7EB8\u5236\u4F5C\u5168\u6D41\u7A0B\u3002</span>
      </div>
    </section>

    <section class="card card--flat faq">
      <h2 class="faq-heading">\u5E38\u89C1\u95EE\u9898</h2>
      <div v-for="item in faqItems" :key="item.q" class="faq-item">
        <span class="faq-q">{{ item.q }}</span>
        <span class="faq-a">{{ item.a }}</span>
      </div>
    </section>
  </div>
</template>`
fs.writeFileSync(indexPath, `${indexScript}\n\n${indexBody}\n\n${indexStyle}`, 'utf8')
console.log('patched pages/IndexPage.vue')

patch('components/EditorHistorySheet.vue', [
  ["label: '??'", "label: '\u5F53\u524D'"],
  ["time: '??'", "time: '\u73B0\u5728'"],
  ['title="????"', 'title="\u7F16\u8F91\u5386\u53F2"'],
  ['?????{{ editor.snapshotCount }} ??', '\u7F16\u8F91\u5386\u53F2\uFF08{{ editor.snapshotCount }} \u6B65\uFF09'],
  ['text="??"', 'text="\u6E05\u7A7A"'],
  ['?????????????', '\u70B9\u51FB\u4EFB\u4E00\u6B65\u9AA4\u53EF\u56DE\u9000\u5230\u8BE5\u72B6\u6001'],
  ["step.label === '??'", "step.label === '\u5F53\u524D'"],
])

patch('components/PaletteShareSheet.vue', [
  ["title: '??????'", "title: '\u5DF2\u590D\u5236\u5206\u4EAB\u7801'"],
  ["message || '????'", "message || '\u89E3\u6790\u5931\u8D25'"],
  ['title="?? / ????"', 'title="\u5206\u4EAB / \u5BFC\u5165\u8272\u677F"'],
  [
    '??????????????????',
    '\u590D\u5236\u5206\u4EAB\u7801\u6216\u7C98\u8D34\uFF0C\u53EF\u5728\u53E6\u4E00\u8BBE\u5907\u5BFC\u5165\u76F8\u540C\u8272\u677F',
  ],
  ['>?????<', '>\u590D\u5236\u5206\u4EAB\u7801<'],
  ['<label>?????</label>', '<label>\u7C98\u8D34\u5206\u4EAB\u7801\u5BFC\u5165</label>'],
  ['placeholder="?? pindou', 'placeholder="\u7C98\u8D34 pindou'],
  ['@click="importFromPaste">??<', '@click="importFromPaste">\u89E3\u6790\u5BFC\u5165<'],
])

patch('components/ImageCropperModal.vue', [
  ['<p class="hint">??????????????</p>', '<p class="hint">\u62D6\u52A8\u6216\u53CC\u6307\u7F29\u653E\uFF0C\u8C03\u6574\u88C1\u526A\u533A\u57DF</p>'],
  ["title: '????'", "title: '\u88C1\u526A\u5931\u8D25'"],
  ['title="????"', 'title="\u88C1\u526A\u56FE\u7247"'],
  ['@click="emit(\'close\')">??</PButton>', '@click="emit(\'close\')">\u53D6\u6D88</PButton>'],
  ['@click="confirmCrop">??</PButton>', '@click="confirmCrop">\u786E\u5B9A</PButton>'],
])

const layoutPath = path.join(root, 'components/AppLayout.vue')
let layout = fs.readFileSync(layoutPath, 'utf8')
layout = layout
  .replaceAll('Pindou ??', 'Pindou \u62FC\u8C46')
  .replace("label: '\u9996\u9875'", "label: '\u9996\u9875'") // noop guard
fs.writeFileSync(
  layoutPath,
  layout
    .replace("{ path: '/', label: '\u9996\u9875', exact: true }", "{ path: '/', label: '\u9996\u9875', exact: true }")
    .replace("label: '\u5DE5\u4F5C\u53F0'", "label: '\u5DE5\u4F5C\u53F0'"),
  'utf8',
)

// rewrite AppLayout nav labels if still broken
if (layout.includes('??')) {
  const fixed = `const navItems = [
  { path: '/', label: '\u9996\u9875', exact: true },
  { path: '/workspace', label: '\u5DE5\u4F5C\u53F0' },
  { path: '/projects', label: '\u9879\u76EE' },
  { path: '/gallery', label: '\u753B\u5ECA' },
  { path: '/palette', label: '\u8272\u677F' },
]`
  fs.writeFileSync(
    layoutPath,
    layout.replace(/const navItems = \[[\s\S]*?\]/, fixed).replace('Pindou ??', 'Pindou \u62FC\u8C46'),
    'utf8',
  )
  console.log('patched components/AppLayout.vue')
}

console.log('done')

// rewrite PaletteShareSheet with real UTF-8 in template
const shareTitle = '\u5206\u4EAB / \u5BFC\u5165\u8272\u677F'
const shareHint =
  '\u590D\u5236\u5206\u4EAB\u7801\u6216\u7C98\u8D34\uFF0C\u53EF\u5728\u53E6\u4E00\u8BBE\u5907\u5BFC\u5165\u76F8\u540C\u8272\u677F'
const shareSheet = fs.readFileSync(path.join(root, 'components/PaletteShareSheet.vue'), 'utf8')
const shareStyle = shareSheet.match(/<style[\s\S]*<\/style>/)[0]
const shareScript = shareSheet.match(/<script[\s\S]*?<\/script>/)[0]
const shareBody = `<template>
  <PDrawer :model-value="show" title="${shareTitle}" @update:model-value="(v) => !v && emit('close')">
    <p class="hint">${shareHint}</p>
    <div v-if="entries.length" class="code-box">
      <textarea readonly :value="shareCode" rows="4" />
      <PButton size="sm" @click="copyShareCode">\u590D\u5236\u5206\u4EAB\u7801</PButton>
    </div>
    <div class="section">
      <label>\u7C98\u8D34\u5206\u4EAB\u7801\u5BFC\u5165</label>
      <textarea v-model="pasteCode" class="paste-area" placeholder="\u7C98\u8D34 pindou-palette-v1:..." />
      <PButton type="primary" block @click="importFromPaste">\u89E3\u6790\u5BFC\u5165</PButton>
    </div>
  </PDrawer>
</template>`
fs.writeFileSync(
  path.join(root, 'components/PaletteShareSheet.vue'),
  `${shareScript}\n\n${shareBody}\n\n${shareStyle}`,
  'utf8',
)
console.log('rewrote components/PaletteShareSheet.vue')
