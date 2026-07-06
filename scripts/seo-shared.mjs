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
