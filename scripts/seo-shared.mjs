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
        '@type': 'WebSite',
        name: config.siteName,
        url: `${siteUrl}/`,
        description: config.defaultDescription,
        inLanguage: 'zh-CN',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/gallery?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebApplication',
        name: config.siteName,
        url: `${siteUrl}/workspace`,
        description: config.defaultDescription,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript',
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
