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

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: config.siteName,
        url: `${siteUrl}/`,
        description: '免费在线拼豆图纸生成器，图片转像素豆图纸，支持多品牌色卡、在线编辑与 PDF 导出。',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web, iOS, Android, WeChat',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        featureList: config.features,
      },
      { '@type': 'FAQPage', mainEntity: faqEntities },
      {
        '@type': 'HowTo',
        name: config.howTo.name,
        description: config.howTo.description,
        step: howToSteps,
      },
    ],
  }
}

export const DIST_DIR = join(root, 'dist')
