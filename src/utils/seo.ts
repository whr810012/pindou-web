import { onMounted } from 'vue'
import seoConfig from '../../seo.config.json'

export const SITE_NAME = seoConfig.siteName
export const DEFAULT_TITLE = seoConfig.defaultTitle
export const DEFAULT_DESCRIPTION = seoConfig.defaultDescription
export const DEFAULT_KEYWORDS = seoConfig.defaultKeywords
export const OG_IMAGE_PATH = seoConfig.ogImagePath
export const OG_IMAGE_ALT = seoConfig.ogImageAlt

export interface PageSeoOptions {
  title?: string
  description?: string
  keywords?: string
  path?: string
  noindex?: boolean
}

export type PageSeoKey =
  | 'hub'
  | 'pindouLanding'
  | 'home'
  | 'gallery'
  | 'workspace'
  | 'editor'
  | 'focus'
  | 'projects'
  | 'preview3d'
  | 'paletteEditor'
  | 'guide'
  | 'beadCore'
  | 'toolbox'

const PAGE_ROUTES: Record<
  PageSeoKey,
  Required<Pick<PageSeoOptions, 'title' | 'description' | 'path'>> & {
    keywords?: string
    noindex?: boolean
  }
> = {
  hub: {
    path: '/',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  pindouLanding: {
    path: '/pindou',
    title: 'Pindou 拼豆 - 免费在线照片转拼豆图纸生成器',
    description:
      'Pindou 免费在线拼豆图纸生成器：上传照片一键转拼豆像素图，支持 MARD、COCO、漫漫等主流色号，在线编辑画笔精修、导出 PDF 采购清单。',
    keywords:
      '拼豆,拼豆图纸,拼豆图纸生成器,照片转拼豆,图片转拼豆,像素豆,perler beads,拼豆工具,拼豆色号,MARD色号,COCO色号,在线拼豆',
  },
  home: {
    path: '/home',
    title: '功能主页 - Pindou 拼豆',
    description: '拼豆创作入口：工作台、我的项目、画廊与色板管理。',
    noindex: true,
  },
  gallery: {
    path: '/gallery',
    title: '拼豆图案例与参数推荐 - Pindou',
    description:
      '浏览像素小猫、花朵、风景、头像等拼豆案例与推荐参数，支持 MARD、COCO 色卡预设，一键应用到工作台生成带色号拼豆图纸。',
  },
  workspace: {
    path: '/workspace',
    title: '在线拼豆工作台 - 上传图片生成拼豆图纸 | Pindou',
    description:
      '免费在线拼豆工作台：上传照片生成带 MARD、COCO 色号的拼豆图纸，调整格数与色板，支持 AI 预处理、画笔精修与 PDF 导出。',
  },
  editor: {
    path: '/editor',
    title: '拼豆图纸编辑 - Pindou',
    description: '在线精修拼豆图纸：画笔、填充、换色与历史回退。',
    noindex: true,
  },
  focus: {
    path: '/focus',
    title: '专心拼豆模式 - Pindou',
    description: '分区拼豆进度追踪，按颜色批量标记完成。',
    noindex: true,
  },
  projects: {
    path: '/projects',
    title: '我的拼豆项目 - Pindou',
    description: '本地保存的拼豆项目列表，支持重命名、复制与继续编辑。',
    noindex: true,
  },
  preview3d: {
    path: '/preview3d',
    title: '拼豆 3D 预览 - Pindou',
    description: 'Three.js 立体预览拼豆效果，辅助创作与展示。',
    noindex: true,
  },
  paletteEditor: {
    path: '/palette',
    title: '自定义拼豆色板 - Pindou',
    description: '创建与管理自定义拼豆色号，支持导入、分享与从项目提取色板。',
    noindex: true,
  },
  guide: {
    path: '/guide',
    title: '拼豆新手教程 - 选豆、做图、打印与熨烫 | Pindou',
    description:
      '拼豆入门完整指南：如何选色卡与色号、照片转拼豆图纸、29×29 分板打印、采购清单与熨烫技巧。配合 Pindou 免费在线工具使用。',
  },
  beadCore: {
    path: '/bead-core',
    title: 'bead-core 使用文档 - npm @wangdandan810012/bead-core | Pindou',
    description:
      'bead-core 详细使用介绍：安装、色板与像素约定、runPipeline 参数、浏览器/Node 读图、拼豆 Prep、编辑与统计示例。CIEDE2000 配色，零 UI 依赖，MIT。',
  },
  toolbox: {
    path: '/toolbox',
    title: '蛋蛋工具箱 - 免费实用小工具下载',
    description:
      '蛋蛋工具箱收录轻量实用的小工具。下载蛋蛋便签 Windows 桌面版，支持便签待办、桌面置顶、标签分类与本地数据保存。',
  },
}

export function siteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return seoConfig.defaultSiteUrl.replace(/\/$/, '')
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(href: string) {
  if (typeof document === 'undefined') return
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

export function setPageSeo(options: PageSeoOptions = {}) {
  const title = options.title ?? DEFAULT_TITLE
  const description = options.description ?? DEFAULT_DESCRIPTION
  const origin = siteOrigin()
  const routePath = options.path ?? window.location.pathname
  const canonical = origin ? `${origin}${routePath}` : routePath

  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'keywords', options.keywords ?? DEFAULT_KEYWORDS)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:type', 'website')
  setMeta('property', 'og:site_name', SITE_NAME)
  setMeta('property', 'og:locale', 'zh_CN')
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)

  if (origin) {
    setMeta('property', 'og:url', canonical)
    setCanonical(canonical)
    const ogImage = `${origin}${OG_IMAGE_PATH}`
    setMeta('property', 'og:image', ogImage)
    setMeta('name', 'twitter:image', ogImage)
  }

  setMeta('property', 'og:image:alt', OG_IMAGE_ALT)
  setMeta('name', 'twitter:image:alt', OG_IMAGE_ALT)

  const robots = options.noindex
    ? 'noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  setMeta('name', 'robots', robots)
}

export function usePageSeo(key: PageSeoKey) {
  const config = PAGE_ROUTES[key]
  onMounted(() => {
    setPageSeo({
      title: config.title,
      description: config.description,
      keywords: config.keywords,
      path: config.path,
      noindex: config.noindex,
    })
  })
}
