import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

export function loadSeoConfig() {
  return JSON.parse(readFileSync(join(root, 'seo.config.json'), 'utf8'))
}

export function resolveSiteUrl(config) {
  return (process.env.VITE_SITE_URL || config.defaultSiteUrl).replace(/\/$/, '')
}

const PAGE_META = {
  '/gallery': {
    breadcrumb: '案例画廊',
    title: '拼豆图案例与参数推荐 - Pindou',
    description:
      '浏览像素小猫、花朵、风景等拼豆图案例与推荐参数，支持 MARD、COCO 色卡预设，一键应用到工作台快速开始拼豆创作。',
  },
  '/workspace': {
    breadcrumb: '在线工作台',
    title: '在线拼豆工作台 - 上传图片生成拼豆图纸 | Pindou',
    description:
      '免费在线拼豆工作台：上传照片生成带 MARD、COCO 色号的拼豆图纸，调整格数与色板，支持 AI 预处理、画笔精修与 PDF 导出。',
  },
  '/guide': {
    breadcrumb: '拼豆教程',
    title: '拼豆新手教程 - 选豆、做图、打印与熨烫 | Pindou',
    description:
      '拼豆入门完整指南：如何选色卡与色号、照片转拼豆图纸、29×29 分板打印、采购清单与熨烫技巧。配合 Pindou 免费在线工具使用。',
  },
  '/bead-core': {
    breadcrumb: '开源算法库',
    title: 'bead-core 使用文档 - npm @wangdandan810012/bead-core | Pindou',
    description:
      'bead-core 详细使用介绍：安装、色板与像素约定、runPipeline 参数、浏览器/Node 读图、拼豆 Prep、编辑与统计示例。CIEDE2000 配色，零 UI 依赖，MIT。',
  },
}

export function loadGalleryItems() {
  return JSON.parse(
    readFileSync(join(root, 'public', 'static', 'gallery', 'gallery.json'), 'utf8'),
  ).items
}

function buildBreadcrumbList(siteUrl, crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path === '/' ? '/' : crumb.path}`,
    })),
  }
}

export function buildPageJsonLd(config, siteUrl, routePath) {
  const graph = []
  const pageMeta = PAGE_META[routePath]
  if (!pageMeta) return null

  graph.push(
    buildBreadcrumbList(siteUrl, [
      { name: '首页', path: '/' },
      { name: pageMeta.breadcrumb, path: routePath },
    ]),
  )

  if (routePath === '/gallery') {
    const items = loadGalleryItems()
    graph.push({
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/gallery#webpage`,
      name: pageMeta.title,
      url: `${siteUrl}/gallery`,
      description: pageMeta.description,
      inLanguage: 'zh-CN',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@type': 'Thing', name: '拼豆图纸案例' },
    })
    graph.push({
      '@type': 'ItemList',
      name: 'Pindou 拼豆案例列表',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.title,
        url: `${siteUrl}${config.galleryLandingPrefix}/${item.id}/`,
        item: {
          '@type': 'CreativeWork',
          name: item.title,
          description: item.description,
          url: `${siteUrl}${config.galleryLandingPrefix}/${item.id}/`,
          image: `${siteUrl}${item.thumbnail}`,
        },
      })),
    })
  }

  if (routePath === '/workspace') {
    graph.push({
      '@type': 'WebPage',
      '@id': `${siteUrl}/workspace#webpage`,
      name: pageMeta.title,
      url: `${siteUrl}/workspace`,
      description: pageMeta.description,
      inLanguage: 'zh-CN',
      isPartOf: { '@id': `${siteUrl}/#website` },
      mainEntity: { '@id': `${siteUrl}/#webapp` },
    })
  }

  if (routePath === '/guide') {
    graph.push({
      '@type': 'Article',
      '@id': `${siteUrl}/guide#article`,
      headline: '拼豆新手教程',
      name: pageMeta.title,
      url: `${siteUrl}/guide`,
      description: pageMeta.description,
      inLanguage: 'zh-CN',
      articleSection: '拼豆教程',
      author: config.organization ? { '@id': `${siteUrl}/#organization` } : undefined,
      publisher: config.organization ? { '@id': `${siteUrl}/#organization` } : undefined,
      isPartOf: { '@id': `${siteUrl}/#website` },
    })
  }

  if (routePath === '/bead-core') {
    graph.push({
      '@type': 'SoftwareSourceCode',
      '@id': `${siteUrl}/bead-core#software`,
      name: '@wangdandan810012/bead-core',
      url: `${siteUrl}/bead-core`,
      description: pageMeta.description,
      programmingLanguage: 'TypeScript',
      codeRepository: 'https://github.com/whr810012/bead-core',
      downloadUrl: 'https://www.npmjs.com/package/@wangdandan810012/bead-core',
      license: 'https://opensource.org/licenses/MIT',
      author: config.organization ? { '@id': `${siteUrl}/#organization` } : undefined,
      isPartOf: { '@id': `${siteUrl}/#website` },
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export function buildJsonLd(config, siteUrl) {
  const faqEntities = config.faq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  }))

  const howToSteps = config.howTo.steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
  }))

  const orgConfig = config.organization
  const organization = orgConfig
    ? {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: organizationName(config),
        url: siteUrl,
        logo: orgConfig.logoPath ? `${siteUrl}${orgConfig.logoPath}` : undefined,
        email: orgConfig.email,
        areaServed: orgConfig.areaServed,
        availableLanguage: orgConfig.availableLanguage,
        contactPoint: orgConfig.email
          ? [
              {
                '@type': 'ContactPoint',
                contactType: orgConfig.contactType || 'customer support',
                email: orgConfig.email,
                availableLanguage: orgConfig.availableLanguage,
                areaServed: orgConfig.areaServed,
              },
            ]
          : undefined,
      }
    : null

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: config.siteName,
        url: `${siteUrl}/`,
        description: config.defaultDescription,
        inLanguage: 'zh-CN',
        publisher: organization ? { '@id': `${siteUrl}/#organization` } : undefined,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/gallery?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      ...(organization ? [organization] : []),
      {
        '@type': 'WebApplication',
        '@id': `${siteUrl}/#webapp`,
        name: config.siteName,
        url: `${siteUrl}/workspace`,
        description: config.defaultDescription,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: config.features,
        provider: organization ? { '@id': `${siteUrl}/#organization` } : undefined,
        inLanguage: 'zh-CN',
      },
      { '@type': 'FAQPage', mainEntity: faqEntities },
      {
        '@type': 'HowTo',
        name: config.howTo.name,
        description: config.howTo.description,
        step: howToSteps,
        provider: organization ? { '@id': `${siteUrl}/#organization` } : undefined,
      },
    ],
  }
}

function organizationName(config) {
  return config.organization?.name || config.siteName
}

export const DIST_DIR = join(root, 'dist')
