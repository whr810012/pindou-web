<script setup lang="ts">
import { useRouter } from 'vue-router'
import seoConfig from '../../seo.config.json'
import BrandLogo from '@/components/BrandLogo.vue'
import PButton from '@/components/ui/PButton.vue'
import BeforeAfterSlider from '@/components/BeforeAfterSlider.vue'
import { usePageSeo } from '@/utils/seo'
import compareMeta from '../../public/static/gallery/landing-compare-meta.json'
import { CONTACT_EMAIL, CONTACT_WECHAT } from '@/constants/contact'
import { assetUrl } from '@/utils/assetUrl'

const router = useRouter()
usePageSeo('pindouLanding')

const features = seoConfig.features
const faqPreview = seoConfig.faq.slice(0, 6)
const relatedPages = [
  {
    label: '在线拼豆工作台',
    path: '/workspace',
    desc: '上传照片，生成带 MARD/COCO 色号的拼豆图纸',
  },
  {
    label: '拼豆案例画廊',
    path: '/gallery',
    desc: '浏览卡通、花卉、风景等案例与推荐参数',
  },
  {
    label: '拼豆新手教程',
    path: '/guide',
    desc: '从选豆、做图、打印到熨烫的完整入门',
  },
  {
    label: '开源算法库',
    path: '/bead-core',
    desc: '了解 bead-core 核心算法与 npm 集成方式',
  },
]
const quickAnswerTitles = ['Pindou 是什么？', '如何把照片变成拼豆图纸？', '拼豆图纸生成器免费吗？', '图片会上传到服务器吗？']
const geoAnswers = quickAnswerTitles
  .map((question) => seoConfig.faq.find((item) => item.q === question))
  .filter((item): item is (typeof seoConfig.faq)[number] => Boolean(item))

const compareBefore = assetUrl('/static/gallery/landing-compare-before.jpg')
const compareAfter = assetUrl('/static/gallery/landing-compare-after.png')
const compareAspect =
  compareMeta.width && compareMeta.height
    ? compareMeta.width / compareMeta.height
    : 800 / 1221

const featureIcons = ['◆', '▦', '◎', '⤓', '▤', '⊞', '↧', '☼', '◐', '红', 'A', '🔒', '✦']

function enterApp() {
  router.push('/home')
}

function goWorkspace() {
  router.push('/workspace')
}

function goGallery() {
  router.push('/gallery')
}
</script>

<template>
  <div class="landing page-enter">
    <div class="landing__bg" aria-hidden="true">
      <div class="landing__orb landing__orb--a" />
      <div class="landing__orb landing__orb--b" />
      <div class="landing__grid" />
    </div>

    <header class="landing__header">
      <router-link class="landing__brand" to="/">
        <BrandLogo layout="inline" />
      </router-link>
      <nav class="landing__nav" aria-label="落地页导航">
        <a class="landing__link" href="/">蛋蛋中心</a>
        <button type="button" class="landing__link" @click="goGallery">案例画廊</button>
        <button type="button" class="landing__link" @click="router.push('/guide')">拼豆教程</button>
        <button type="button" class="landing__link" @click="router.push('/bead-core')">开源库</button>
        <PButton size="sm" type="primary" text="开始制作" @click="goWorkspace" />
      </nav>
    </header>

    <main class="landing__main">
      <section class="landing__hero">
        <div class="landing__hero-copy">
          <p class="landing__eyebrow">免费 · 本地处理 · 网页可用</p>
          <h1 class="landing__title">
            把照片变成
            <span class="landing__title-accent">可拼的拼豆图纸</span>
          </h1>
          <p class="landing__lead">
            上传照片一键转像素豆图，映射 MARD / COCO 等主流色号。在线精修、导出 PDF，默认在浏览器本地完成。
          </p>
          <div class="landing__cta">
            <PButton type="primary" size="lg" text="免费开始制作" @click="goWorkspace" />
            <PButton plain size="lg" text="进入应用主页" @click="enterApp" />
          </div>
          <ul class="landing__stats">
            <li>
              <span class="landing__stat-icon" aria-hidden="true">🔒</span>
              <div>
                <strong>本地隐私</strong>
                <span>图片不上传服务器</span>
              </div>
            </li>
            <li>
              <span class="landing__stat-icon" aria-hidden="true">◎</span>
              <div>
                <strong>多品牌色卡</strong>
                <span>MARD · COCO · 自定义</span>
              </div>
            </li>
            <li>
              <span class="landing__stat-icon" aria-hidden="true">⤓</span>
              <div>
                <strong>完整流程</strong>
                <span>生成 · 精修 · 导出</span>
              </div>
            </li>
          </ul>
        </div>

        <div class="landing__hero-visual" aria-hidden="true">
          <div class="landing__beads">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>
      </section>

      <section class="landing__compare card craft-intro-card" aria-label="效果对比">
        <div class="landing__compare-head">
          <div>
            <h2 class="landing__section-title">真实效果对比</h2>
            <p class="landing__section-sub">拖动滑块查看原图与拼豆图纸生成效果</p>
          </div>
          <div class="landing__compare-tags">
            <span class="landing__tag">原图</span>
            <span class="landing__tag landing__tag--primary">拼豆图</span>
          </div>
        </div>
        <div class="landing__compare-frame craft-preview-frame">
          <BeforeAfterSlider
            :before-src="compareBefore"
            :after-src="compareAfter"
            :aspect-ratio="compareAspect"
          />
        </div>
      </section>

      <section class="landing__features" aria-label="核心功能">
        <div class="landing__section-head">
          <h2 class="landing__section-title">你能用它做什么</h2>
          <p class="landing__section-sub">从上传到导出，覆盖拼豆创作全流程</p>
        </div>
        <div class="landing__feature-grid">
          <article
            v-for="(item, index) in features"
            :key="item"
            class="landing__feature-card"
          >
            <span class="landing__feature-icon" aria-hidden="true">
              {{ featureIcons[index % featureIcons.length] }}
            </span>
            <h3>{{ item }}</h3>
          </article>
        </div>
      </section>

      <section class="landing__steps card" aria-label="使用步骤">
        <h2 class="landing__section-title">三步完成</h2>
        <ol class="landing__step-row">
          <li class="landing__step-card">
            <span class="landing__step-num">1</span>
            <strong>上传图片</strong>
            <p>拖拽、点击或粘贴，本地像素化处理</p>
          </li>
          <li class="landing__step-connector" aria-hidden="true" />
          <li class="landing__step-card">
            <span class="landing__step-num">2</span>
            <strong>生成与精修</strong>
            <p>调整格数色板，画笔改色对比原图</p>
          </li>
          <li class="landing__step-connector" aria-hidden="true" />
          <li class="landing__step-card">
            <span class="landing__step-num">3</span>
            <strong>导出开拼</strong>
            <p>带色号图纸、采购清单 PDF</p>
          </li>
        </ol>
        <PButton type="primary" block size="lg" text="进入工作台" @click="goWorkspace" />
      </section>

      <section class="landing__answers" aria-label="核心问题速答">
        <div class="landing__section-head">
          <h2 class="landing__section-title">先回答你最关心的问题</h2>
          <p class="landing__section-sub">围绕免费、隐私、上手流程与工具定位，方便搜索与快速判断是否适合你。</p>
        </div>
        <div class="landing__answers-grid">
          <article v-for="item in geoAnswers" :key="item.q" class="landing__answer-card">
            <h3>{{ item.q }}</h3>
            <p>{{ item.a }}</p>
          </article>
        </div>
      </section>

      <section class="landing__related" aria-label="相关页面">
        <div class="landing__section-head">
          <h2 class="landing__section-title">从这里继续</h2>
          <p class="landing__section-sub">按你的目标进入工作台、案例、教程或开源库，帮助用户与搜索引擎更快理解站点结构。</p>
        </div>
        <div class="landing__related-grid">
          <router-link v-for="page in relatedPages" :key="page.path" class="landing__related-card" :to="page.path">
            <h3>{{ page.label }}</h3>
            <p>{{ page.desc }}</p>
          </router-link>
        </div>
      </section>

      <section class="landing__faq" aria-label="常见问题">
        <h2 class="landing__section-title">常见问题</h2>
        <p class="landing__faq-intro">
          更多入门与打印技巧可查看
          <button type="button" class="landing__inline-link" @click="router.push('/guide')">拼豆新手教程</button>
          。
        </p>
        <div class="landing__faq-list">
          <details v-for="item in faqPreview" :key="item.q" class="landing__faq-item">
            <summary>{{ item.q }}</summary>
            <p>{{ item.a }}</p>
          </details>
        </div>
      </section>
    </main>

    <footer class="landing__footer">
      <div class="landing__footer-brand">
        <span class="landing__footer-dot" aria-hidden="true" />
        <span>© Pindou · 拼豆图纸生成工具</span>
        <a class="landing__contact" :href="`mailto:${CONTACT_EMAIL}`">邮箱：{{ CONTACT_EMAIL }}</a>
        <span class="landing__contact landing__contact--wechat">微信：{{ CONTACT_WECHAT }}</span>
      </div>
      <div class="landing__footer-links">
        <button type="button" class="landing__link" @click="goGallery">案例画廊</button>
        <button type="button" class="landing__link" @click="router.push('/guide')">拼豆教程</button>
        <button type="button" class="landing__link" @click="router.push('/bead-core')">开源库</button>
        <button type="button" class="landing__link" @click="enterApp">功能主页</button>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.landing {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  color: $pindou-text;
}

.landing__bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(168deg, #faf6f0 0%, $pindou-bg-page 42%, #ebe6f8 100%);
}

.landing__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  opacity: 0.5;
}

.landing__orb--a {
  width: min(380px, 55vw);
  height: min(380px, 55vw);
  top: -100px;
  right: -80px;
  background: rgba($pindou-primary, 0.2);
}

.landing__orb--b {
  width: min(300px, 45vw);
  height: min(300px, 45vw);
  bottom: 8%;
  left: -90px;
  background: rgba($pindou-accent, 0.16);
}

.landing__grid {
  position: absolute;
  inset: 0;
  opacity: 0.4;
  background-image:
    linear-gradient(rgba($pindou-text, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba($pindou-text, 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: linear-gradient(to bottom, #000 0%, transparent 88%);
}

.landing__header,
.landing__main,
.landing__footer {
  position: relative;
  z-index: 1;
}

.landing__header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px $pindou-space-lg;
  max-width: $pindou-content-wide;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  background: rgba($pindou-bg-page, 0.78);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: border-color $pindou-duration-fast;

  &::after {
    content: '';
    position: absolute;
    left: $pindou-space-lg;
    right: $pindou-space-lg;
    bottom: 0;
    height: 1px;
    background: $pindou-border-light;
    opacity: 0.6;
  }
}

.landing__brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.landing__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.landing__link {
  display: inline-flex;
  align-items: center;
  border: none;
  background: transparent;
  color: $pindou-text-secondary;
  font-size: $pindou-font-sm;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: $pindou-radius-pill;
  transition: color $pindou-duration-fast, background $pindou-duration-fast;

  &:hover {
    color: $pindou-primary;
    background: rgba($pindou-primary, 0.08);
  }
}

.landing__main {
  flex: 1;
  width: 100%;
  max-width: $pindou-content-wide;
  margin: 0 auto;
  padding: 8px $pindou-space-lg 56px;
  box-sizing: border-box;
}

.landing__hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 28px 0 36px;

  @media (min-width: 768px) {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.5fr);
    align-items: center;
    padding: 40px 0 48px;
  }
}

.landing__hero-copy {
  max-width: 600px;
}

.landing__hero-visual {
  display: none;

  @media (min-width: 768px) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.landing__beads {
  display: grid;
  grid-template-columns: repeat(3, 28px);
  gap: 10px;
  transform: rotate(-8deg);

  span {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.85);
    box-shadow: $pindou-shadow-sm;
    animation: landing-bead-float 3s ease-in-out infinite;

    &:nth-child(1) {
      background: $pindou-primary;
    }
    &:nth-child(2) {
      background: $pindou-accent;
      animation-delay: 0.4s;
    }
    &:nth-child(3) {
      background: pindou-lighten($pindou-primary, 14%);
      animation-delay: 0.8s;
    }
    &:nth-child(4) {
      background: pindou-darken($pindou-accent, 6%);
      animation-delay: 0.2s;
    }
    &:nth-child(5) {
      background: $pindou-primary-dark;
      animation-delay: 0.6s;
    }
    &:nth-child(6) {
      background: $pindou-accent;
      animation-delay: 1s;
    }
  }
}

.landing__eyebrow {
  margin: 0 0 12px;
  font-size: $pindou-font-xs;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $pindou-primary;
}

.landing__title {
  margin: 0;
  font-family: $pindou-font-display;
  font-size: clamp(30px, 7.5vw, 48px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.landing__title-accent {
  display: block;
  background: linear-gradient(120deg, $pindou-primary 0%, pindou-darken($pindou-accent, 8%) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.landing__lead {
  margin: 18px 0 0;
  font-size: clamp(15px, 2.5vw, 17px);
  line-height: 1.65;
  color: $pindou-text-secondary;
  max-width: 520px;
}

.landing__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 26px;
}

.landing__stats {
  list-style: none;
  margin: 28px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 520px) {
    grid-template-columns: repeat(3, 1fr);
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: $pindou-radius-md;
    background: rgba($pindou-bg-card, 0.88);
    border: 1px solid $pindou-border-light;
    box-shadow: $pindou-shadow-sm;
    backdrop-filter: blur(6px);
  }

  strong {
    display: block;
    font-size: $pindou-font-sm;
    margin-bottom: 2px;
  }

  span:not(.landing__stat-icon) {
    font-size: $pindou-font-xs;
    color: $pindou-text-muted;
    line-height: 1.4;
  }
}

.landing__stat-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: rgba($pindou-primary, 0.1);
  font-size: 14px;
}

.landing__section-head {
  margin-bottom: 20px;
}

.landing__section-title {
  margin: 0;
  font-family: $pindou-font-display;
  font-size: $pindou-font-xl;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.landing__section-sub {
  margin: 6px 0 0;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  line-height: 1.5;
}

.landing__compare {
  padding: 22px 20px 20px;
  margin-bottom: 8px;
}

.landing__compare-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.landing__compare-tags {
  display: flex;
  gap: 8px;
}

.landing__tag {
  padding: 4px 10px;
  border-radius: $pindou-radius-pill;
  background: $pindou-bg-subtle;
  border: 1px solid $pindou-border-light;
  font-size: 10px;
  font-weight: 700;
  color: $pindou-text-muted;

  &--primary {
    background: rgba($pindou-primary, 0.1);
    border-color: rgba($pindou-primary, 0.2);
    color: $pindou-primary;
  }
}

.landing__compare-frame {
  padding: 12px;

  :deep(.compare-slider) {
    border-radius: $pindou-radius-sm;
    box-shadow: $pindou-shadow-sm;
  }
}

.landing__features {
  margin-top: 36px;
}

.landing__feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 10px;
}

.landing__feature-card {
  padding: 16px 14px;
  border-radius: $pindou-radius-md;
  background: rgba($pindou-bg-card, 0.9);
  border: 1px solid $pindou-border-light;
  box-shadow: $pindou-shadow-sm;
  transition:
    border-color $pindou-duration-fast,
    box-shadow $pindou-duration-fast,
    transform $pindou-duration-fast;

  &:hover {
    border-color: rgba($pindou-primary, 0.28);
    box-shadow: $pindou-shadow-md;
    transform: translateY(-2px);
  }

  h3 {
    margin: 10px 0 0;
    font-size: $pindou-font-sm;
    font-weight: 600;
    line-height: 1.45;
    color: $pindou-text;
  }
}

.landing__feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba($pindou-primary, 0.14), rgba($pindou-accent, 0.12));
  color: $pindou-primary;
  font-size: 12px;
  font-weight: 700;
}

.landing__steps {
  margin-top: 40px;
  padding: 24px 20px;
}

.landing__step-row {
  list-style: none;
  margin: 0 0 22px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 720px) {
    flex-direction: row;
    align-items: stretch;
    gap: 0;
  }
}

.landing__step-card {
  flex: 1;
  padding: 16px 14px;
  border-radius: $pindou-radius-md;
  background: $pindou-bg-subtle;
  border: 1px solid $pindou-border-light;

  strong {
    display: block;
    margin-top: 10px;
    font-size: $pindou-font-md;
  }

  p {
    margin: 6px 0 0;
    font-size: $pindou-font-sm;
    color: $pindou-text-muted;
    line-height: 1.5;
  }
}

.landing__step-connector {
  display: none;

  @media (min-width: 720px) {
    display: block;
    width: 24px;
    flex-shrink: 0;
    align-self: center;
    height: 2px;
    background: linear-gradient(90deg, $pindou-border, rgba($pindou-primary, 0.35), $pindou-border);
  }
}

.landing__step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: linear-gradient(135deg, $pindou-primary, $pindou-primary-dark);
  color: #fff;
  font-family: $pindou-font-display;
  font-weight: 800;
  font-size: 13px;
  box-shadow: 0 3px 10px rgba($pindou-primary, 0.28);
}

.landing__faq {
  margin-top: 40px;
}

.landing__faq-intro {
  margin: 8px 0 0;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  line-height: 1.6;
}

.landing__inline-link {
  border: none;
  background: none;
  padding: 0;
  color: $pindou-primary;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.landing__related {
  margin-top: 40px;
}

.landing__related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.landing__related-card {
  display: block;
  min-height: 72px;
  padding: 16px;
  border-radius: $pindou-radius-md;
  background: rgba($pindou-bg-card, 0.9);
  border: 1px solid $pindou-border-light;
  box-shadow: $pindou-shadow-sm;
  text-decoration: none;
  transition:
    border-color $pindou-duration-fast,
    box-shadow $pindou-duration-fast,
    transform $pindou-duration-fast;

  h3 {
    margin: 0;
    color: $pindou-primary;
    font-size: $pindou-font-sm;
    font-weight: 700;
    line-height: 1.45;
  }

  p {
    margin: 8px 0 0;
    color: $pindou-text-muted;
    font-size: $pindou-font-xs;
    line-height: 1.55;
  }

  &:hover {
    border-color: rgba($pindou-primary, 0.28);
    box-shadow: $pindou-shadow-md;
    transform: translateY(-2px);
  }
}

.landing__answers {
  margin-top: 40px;
}

.landing__answers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.landing__answer-card {
  padding: 18px 16px;
  border-radius: $pindou-radius-md;
  background: rgba($pindou-bg-card, 0.9);
  border: 1px solid $pindou-border-light;
  box-shadow: $pindou-shadow-sm;

  h3 {
    margin: 0;
    font-size: $pindou-font-md;
    line-height: 1.45;
  }

  p {
    margin: 10px 0 0;
    font-size: $pindou-font-sm;
    color: $pindou-text-muted;
    line-height: 1.65;
  }
}

.landing__faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.landing__faq-item {
  border-radius: $pindou-radius-md;
  background: rgba($pindou-bg-card, 0.88);
  border: 1px solid $pindou-border-light;
  overflow: hidden;

  summary {
    padding: 14px 16px;
    font-size: $pindou-font-sm;
    font-weight: 600;
    color: $pindou-text;
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      content: '+';
      float: right;
      color: $pindou-primary;
      font-weight: 700;
    }
  }

  &[open] summary::after {
    content: '−';
  }

  p {
    margin: 0;
    padding: 0 16px 14px;
    font-size: $pindou-font-sm;
    color: $pindou-text-muted;
    line-height: 1.6;
    border-top: 1px solid $pindou-border-light;
    padding-top: 12px;
  }
}

.landing__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 22px $pindou-space-lg calc(22px + var(--pindou-safe-bottom));
  max-width: $pindou-content-wide;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  border-top: 1px solid $pindou-border-light;
  background: rgba($pindou-bg-page, 0.6);
  backdrop-filter: blur(8px);
}

.landing__footer-brand {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 14px;
}

.landing__contact {
  color: $pindou-text-muted;
  text-decoration: none;
  font-size: $pindou-font-xs;

  &:hover {
    color: $pindou-primary;
    text-decoration: underline;
  }

  &--wechat {
    cursor: default;

    &:hover {
      color: $pindou-text-muted;
      text-decoration: none;
    }
  }
}

.landing__footer-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, $pindou-primary, $pindou-accent);
}

.landing__footer-links {
  display: flex;
  gap: 4px;
}

@keyframes landing-bead-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing__beads span {
    animation: none;
  }
}
</style>
