import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSeoConfig, resolveSiteUrl } from './seo-shared.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const config = loadSeoConfig()
const siteUrl = resolveSiteUrl(config)
const galleryItems = JSON.parse(
  readFileSync(join(root, 'public', 'static', 'gallery', 'gallery.json'), 'utf8'),
).items

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

for (const item of galleryItems) {
  const outDir = join(root, 'public', 'gallery', item.id)
  mkdirSync(outDir, { recursive: true })
  const pageUrl = `${siteUrl}${config.galleryLandingPrefix}/${item.id}/`
  const tags = item.tags.join('、')
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(item.title)} - 拼豆图案例 | Pindou</title>
  <meta name="description" content="${escapeHtml(item.description)}。${escapeHtml(tags)}拼豆参数推荐，一键在 Pindou 工作台应用。" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${pageUrl}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(item.title)} - Pindou 拼豆案例" />
  <meta property="og:description" content="${escapeHtml(item.description)}" />
  <meta property="og:image" content="${siteUrl}${item.thumbnail}" />
  <meta property="og:url" content="${pageUrl}" />
  <script type="application/ld+json">
${JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: item.title,
      description: item.description,
      image: `${siteUrl}${item.thumbnail}`,
      url: pageUrl,
      keywords: item.tags.join(', '),
      provider: { '@type': 'Organization', name: config.siteName },
    },
    null,
    2,
  )}
  </script>
</head>
<body>
  <main style="max-width:720px;margin:2rem auto;padding:0 1rem;font-family:system-ui,sans-serif;line-height:1.6">
    <h1>${escapeHtml(item.title)}</h1>
    <p>${escapeHtml(item.description)}</p>
    <p>标签：${escapeHtml(tags)}</p>
    <img src="${item.thumbnail}" alt="${escapeHtml(item.title)}拼豆图案例" width="320" height="320" />
    <p><a href="${siteUrl}/workspace">用此案例参数开始制作</a> · <a href="${siteUrl}/gallery">查看更多拼豆案例</a> · <a href="${siteUrl}/">返回首页</a></p>
  </main>
</body>
</html>
`
  writeFileSync(join(outDir, 'index.html'), html, 'utf8')
}

console.log(`[gallery-pages] generated ${galleryItems.length} landing pages`)
