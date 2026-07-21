import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildJsonLd, DIST_DIR, loadSeoConfig, resolveSiteUrl } from './seo-shared.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mode = process.argv.includes('--post') ? 'post' : 'pre'

const config = loadSeoConfig()
const siteUrl = resolveSiteUrl(config)
const today = new Date().toISOString().slice(0, 10)
const ogImage = `${siteUrl}${config.ogImagePath}`
const ogImageAlt = config.ogImageAlt
const indexCanonical = `${siteUrl}${config.publicPages[0].path}`

function writePublicAssets() {
  const publicDir = join(root, 'public')
  mkdirSync(publicDir, { recursive: true })

  const galleryItems = JSON.parse(
    readFileSync(join(root, 'public', 'static', 'gallery', 'gallery.json'), 'utf8'),
  ).items

  const galleryUrls = galleryItems.map(
    (item) => `  <url>
    <loc>${siteUrl}${config.galleryLandingPrefix}/${item.id}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
  )

  const pageUrls = config.publicPages
    .map(
      (page) => `  <url>
    <loc>${siteUrl}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageUrls}
${galleryUrls.join('\n')}
</urlset>
`
  writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf8')

  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
  writeFileSync(join(publicDir, 'robots.txt'), robots, 'utf8')

  const manifest = {
    name: config.defaultTitle,
    short_name: config.siteName,
    description: config.ogDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    lang: 'zh-CN',
    background_color: '#FFF8EE',
    theme_color: config.themeColor,
    categories: ['design', 'utilities'],
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
  writeFileSync(join(publicDir, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  console.log(`[seo:pre] public/sitemap.xml, robots.txt for ${siteUrl}`)
}

function patchDistIndexHtml() {
  const indexPath = join(DIST_DIR, 'index.html')
  if (!existsSync(indexPath)) {
    console.warn(`[seo:post] skip: ${indexPath} not found (run vite build first)`)
    return
  }

  let html = readFileSync(indexPath, 'utf8')
  const jsonLd = JSON.stringify(buildJsonLd(config, siteUrl), null, 2)

  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${config.defaultTitle}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${config.defaultDescription}" />`,
    )
    .replace(
      /<meta name="keywords" content="[^"]*"\s*\/>/,
      `<meta name="keywords" content="${config.defaultKeywords}" />`,
    )
    .replace(
      /<meta name="robots" content="[^"]*"\s*\/>/,
      '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
    )
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${config.defaultTitle}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${config.ogDescription}" />`,
    )
    .replace(
      /<meta property="og:image" content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${ogImage}" />`,
    )
    .replace(
      /<meta property="og:image:alt" content="[^"]*"\s*\/>/,
      `<meta property="og:image:alt" content="${ogImageAlt}" />`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${config.defaultTitle}" />`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${config.ogDescription}" />`,
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${ogImage}" />`,
    )
    .replace(
      /<meta name="twitter:image:alt" content="[^"]*"\s*\/>/,
      `<meta name="twitter:image:alt" content="${ogImageAlt}" />`,
    )
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${jsonLd}\n    </script>`)

  if (!html.includes('rel="canonical"')) {
    html = html.replace(
      '<meta name="apple-mobile-web-app-title"',
      `<link rel="canonical" href="${indexCanonical}" />\n    <meta name="apple-mobile-web-app-title"`,
    )
  } else {
    html = html.replace(
      /<link rel="canonical" href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${indexCanonical}" />`,
    )
  }

  if (!html.includes('property="og:url"')) {
    html = html.replace(
      '<meta property="og:locale"',
      `<meta property="og:url" content="${indexCanonical}" />\n    <meta property="og:locale"`,
    )
  } else {
    html = html.replace(
      /<meta property="og:url" content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${indexCanonical}" />`,
    )
  }

  writeFileSync(indexPath, html, 'utf8')
  console.log(`[seo:post] patched ${indexPath}`)
}

if (mode === 'pre') {
  writePublicAssets()
} else {
  patchDistIndexHtml()
}
