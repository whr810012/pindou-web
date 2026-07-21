import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DIST_DIR, buildPageJsonLd, loadSeoConfig, resolveSiteUrl } from './seo-shared.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const ROUTES = [
  { path: '/', outFile: 'index.html', injectSelector: '#app' },
  {
    path: '/pindou',
    outDir: 'pindou',
    outFile: 'index.html',
    injectSelector: '#app',
    title: 'Pindou 拼豆 - 免费在线照片转拼豆图纸生成器',
    description:
      'Pindou 免费在线拼豆图纸生成器：上传照片一键转拼豆像素图，支持 MARD、COCO、漫漫等主流色号，在线编辑画笔精修、导出 PDF 采购清单。',
    keywords:
      '拼豆,拼豆图纸,拼豆图纸生成器,照片转拼豆,图片转拼豆,像素豆,拼豆工具,拼豆色号,MARD色号,COCO色号,在线拼豆',
  },
  {
    path: '/gallery',
    outDir: 'gallery',
    outFile: 'index.html',
    injectSelector: '#app',
    title: '拼豆图案例与参数推荐 - Pindou',
    description:
      '浏览像素小猫、花朵、风景等拼豆图案例与推荐参数，支持 MARD、COCO 色卡预设，一键应用到工作台快速开始拼豆创作。',
  },
  {
    path: '/workspace',
    outDir: 'workspace',
    outFile: 'index.html',
    injectSelector: '#app',
    title: '在线拼豆工作台 - 上传图片生成拼豆图纸 | Pindou',
    description:
      '免费在线拼豆工作台：上传照片生成带 MARD、COCO 色号的拼豆图纸，调整格数与色板，支持 AI 预处理、画笔精修与 PDF 导出。',
  },
  {
    path: '/guide',
    outDir: 'guide',
    outFile: 'index.html',
    injectSelector: '#app',
    title: '拼豆新手教程 - 选豆、做图、打印与熨烫 | Pindou',
    description:
      '拼豆入门完整指南：如何选色卡与色号、照片转拼豆图纸、29×29 分板打印、采购清单与熨烫技巧。配合 Pindou 免费在线工具使用。',
  },
  {
    path: '/bead-core',
    outDir: 'bead-core',
    outFile: 'index.html',
    injectSelector: '#app',
    title: 'bead-core 使用文档 - npm @wangdandan810012/bead-core | Pindou',
    description:
      'bead-core 详细使用介绍：安装、色板与像素约定、runPipeline 参数、浏览器/Node 读图、拼豆 Prep、编辑与统计示例。CIEDE2000 配色，零 UI 依赖，MIT。',
  },
  {
    path: '/toolbox',
    outDir: 'toolbox',
    outFile: 'index.html',
    injectSelector: '#app',
    title: '蛋蛋工具箱 - 免费实用小工具下载',
    description:
      '蛋蛋工具箱收录轻量实用的小工具。下载蛋蛋便签 Windows 桌面版，支持便签待办、桌面置顶、标签分类与本地数据保存。',
  },
]

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'application/javascript'
  if (filePath.endsWith('.css')) return 'text/css'
  if (filePath.endsWith('.json')) return 'application/json'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  if (filePath.endsWith('.png')) return 'image/png'
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg'
  if (filePath.endsWith('.webp')) return 'image/webp'
  if (filePath.endsWith('.gif')) return 'image/gif'
  if (filePath.endsWith('.ico')) return 'image/x-icon'
  if (filePath.endsWith('.woff2')) return 'font/woff2'
  return 'application/octet-stream'
}

function createStaticServer(distDir, port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
      let filePath = join(distDir, urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, ''))
      if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        const indexInDir = join(filePath, 'index.html')
        filePath = existsSync(indexInDir) ? indexInDir : join(distDir, 'index.html')
      } else if (!existsSync(filePath) || urlPath.endsWith('/')) {
        filePath = join(distDir, 'index.html')
      }
      if (!existsSync(filePath)) {
        res.writeHead(404)
        res.end('Not found')
        return
      }
      res.writeHead(200, { 'Content-Type': contentType(filePath) })
      res.end(readFileSync(filePath))
    })
    server.listen(port, () => resolve(server))
  })
}

function pathCanonical(siteUrl, routePath) {
  return routePath === '/' ? `${siteUrl}/` : `${siteUrl}${routePath}`
}

function mergePrerenderedHtml(baseHtml, appHtml, route, siteUrl, config) {
  const canonical = pathCanonical(siteUrl, route.path)
  let html = baseHtml

  if (route.title) {
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
      .replace(
        /<meta name="description" content="[^"]*"\s*\/>/,
        `<meta name="description" content="${route.description}" />`,
      )
      .replace(
        /<meta name="robots" content="[^"]*"\s*\/>/,
        '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
      )
      .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${route.title}" />`)
      .replace(
        /<meta property="og:description" content="[^"]*"\s*\/>/,
        `<meta property="og:description" content="${route.description}" />`,
      )
      .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${route.title}" />`)
      .replace(
        /<meta name="twitter:description" content="[^"]*"\s*\/>/,
        `<meta name="twitter:description" content="${route.description}" />`,
      )
  }

  if (route.keywords) {
    html = html.replace(
      /<meta name="keywords" content="[^"]*"\s*\/>/,
      `<meta name="keywords" content="${route.keywords}" />`,
    )
  }

  html = html
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)

  const pageJsonLd = buildPageJsonLd(config, siteUrl, route.path)
  if (pageJsonLd) {
    html = html.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n${JSON.stringify(pageJsonLd, null, 2)}\n    </script>`,
    )
  }

  const prerenderBlock = `\n    <div id="prerender" data-prerender-route="${route.path}">\n${appHtml}\n    </div>\n`
  html = html.replace('<div id="app"><!--app-html--></div>', `<div id="app"><!--app-html-->${prerenderBlock}</div>`)
  return html
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.warn('[prerender] skip: dist not found')
    return
  }

  const { chromium } = await import('playwright')
  const port = 4173 + Math.floor(Math.random() * 200)
  const server = await createStaticServer(DIST_DIR, port)
  const baseHtml = readFileSync(join(DIST_DIR, 'index.html'), 'utf8')
  const config = loadSeoConfig()
  const siteUrl = resolveSiteUrl(config)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  try {
    for (const route of ROUTES) {
      const url = `http://127.0.0.1:${port}${route.path}`
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(2000)

      const appHtml = await page.$eval(route.injectSelector, (el) => el.innerHTML)
      const merged = mergePrerenderedHtml(baseHtml, appHtml, route, siteUrl, config)

      const outPath = route.outDir
        ? join(DIST_DIR, route.outDir, route.outFile)
        : join(DIST_DIR, route.outFile)

      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, merged, 'utf8')
      console.log(`[prerender] ${route.path} -> ${outPath.replace(DIST_DIR, '')}`)
    }
  } finally {
    await browser.close()
    server.close()
  }
}

main().catch((error) => {
  console.error('[prerender] failed:', error.message)
  process.exit(1)
})
