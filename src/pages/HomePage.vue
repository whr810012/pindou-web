<script setup lang="ts">
import { useRouter } from 'vue-router'
import seoConfig from '../../seo.config.json'
import { usePageSeo } from '@/utils/seo'
import PButton from '@/components/ui/PButton.vue'

const router = useRouter()
usePageSeo('home')
const faqItems = seoConfig.faq

const quickActions = [
  {
    title: '开始制作',
    desc: '上传图片，生成拼豆图纸',
    icon: 'grid',
    primary: true,
    path: '/workspace',
  },
  {
    title: '我的项目',
    desc: '继续未完成的创作',
    icon: 'folder',
    path: '/projects',
  },
  {
    title: '探索画廊',
    desc: '案例与参数推荐',
    icon: 'gallery',
    path: '/gallery',
  },
  {
    title: '自定义色板',
    desc: '管理专属色号',
    icon: 'palette',
    path: '/palette',
  },
  {
    title: '像素文字',
    desc: '文字转像素图制作',
    icon: 'text',
    path: '/text',
  },
  {
    title: '拼豆教程',
    desc: '新手入门与熨烫技巧',
    icon: 'guide',
    path: '/guide',
  },
  {
    title: '开源算法库',
    desc: 'npm @wangdandan810012/bead-core',
    icon: 'code',
    path: '/bead-core',
  },
]

function go(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="page page--app home">
    <section class="home-hero">
      <div class="home-hero__glow" aria-hidden="true" />
      <div class="home-hero__content">
        <p class="home-hero__eyebrow">拼豆创作工坊</p>
        <h1 class="home-hero__title">今天想拼什么？</h1>
        <p class="home-hero__sub">上传照片、调整参数、精修色号，在浏览器里完成整套拼豆流程</p>
        <PButton type="primary" size="lg" text="进入工作台" @click="go('/workspace')" />
      </div>
      <div class="home-hero__beads" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>
    </section>

    <section class="home-grid" aria-label="快捷入口">
      <button
        v-for="item in quickActions"
        :key="item.path"
        type="button"
        class="home-tile"
        :class="{ 'home-tile--primary': item.primary }"
        @click="go(item.path)"
      >
        <span class="home-tile__icon" :class="`home-tile__icon--${item.icon}`" aria-hidden="true" />
        <span class="home-tile__title">{{ item.title }}</span>
        <span class="home-tile__desc">{{ item.desc }}</span>
        <span class="home-tile__arrow" aria-hidden="true">→</span>
      </button>
    </section>

    <section class="card card--flat home-steps" aria-label="制作步骤">
      <h2 class="section-title">制作流程</h2>
      <div class="step-row">
        <div class="step-item">
          <span class="step-num">1</span>
          <div>
            <span class="step-title">上传图片</span>
            <span class="step-desc">本地处理，保护隐私</span>
          </div>
        </div>
        <div class="step-connector" aria-hidden="true" />
        <div class="step-item">
          <span class="step-num">2</span>
          <div>
            <span class="step-title">生成与精修</span>
            <span class="step-desc">参数调优、画笔改色</span>
          </div>
        </div>
        <div class="step-connector" aria-hidden="true" />
        <div class="step-item">
          <span class="step-num">3</span>
          <div>
            <span class="step-title">导出图纸</span>
            <span class="step-desc">色号图 + 采购清单</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card card--flat home-faq">
      <h2 class="section-title">常见问题</h2>
      <div v-for="item in faqItems" :key="item.q" class="faq-item">
        <span class="faq-q">{{ item.q }}</span>
        <span class="faq-a">{{ item.a }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 22px;
  margin-bottom: $pindou-space-md;
  border-radius: $pindou-radius-lg;
  border: 1px solid rgba($pindou-primary, 0.15);
  background: linear-gradient(135deg, $pindou-bg-card 0%, rgba($pindou-primary-light, 0.65) 100%);
  box-shadow: $pindou-shadow-md;
}

.home-hero__glow {
  position: absolute;
  top: -40%;
  right: -10%;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba($pindou-accent, 0.2), transparent 70%);
  pointer-events: none;
}

.home-hero__content {
  position: relative;
  z-index: 1;
  max-width: 420px;
}

.home-hero__eyebrow {
  margin: 0 0 8px;
  font-size: $pindou-font-xs;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $pindou-accent;
}

.home-hero__title {
  margin: 0;
  font-family: $pindou-font-display;
  font-size: clamp(24px, 5vw, 30px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.home-hero__sub {
  margin: 10px 0 18px;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
  line-height: 1.55;
  max-width: 340px;
}

.home-hero__beads {
  display: none;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 88px;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  align-content: center;
  opacity: 0.85;

  span {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.1);

    &:nth-child(1) { background: $pindou-primary; transform: rotate(8deg); }
    &:nth-child(2) { background: $pindou-accent; transform: rotate(-6deg); }
    &:nth-child(3) { background: #7eb89a; transform: rotate(4deg); }
    &:nth-child(4) { background: #e8c468; transform: rotate(-10deg); }
    &:nth-child(5) { background: #9b8ec4; transform: rotate(6deg); }
    &:nth-child(6) { background: #e8919a; transform: rotate(-4deg); }
  }
}

@media (min-width: 560px) {
  .home-hero__beads {
    display: grid;
  }
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: $pindou-space-md;
}

.home-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 16px 14px 14px;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-md;
  background: $pindou-bg-card;
  box-shadow: $pindou-shadow-sm;
  cursor: pointer;
  transition: border-color $pindou-duration-fast, box-shadow $pindou-duration-fast,
    transform $pindou-duration-normal $pindou-ease-out;

  &:hover {
    border-color: rgba($pindou-primary, 0.35);
    box-shadow: $pindou-shadow-md;
    transform: translateY(-2px);

    .home-tile__arrow {
      opacity: 1;
      transform: translateX(2px);
    }
  }

  &--primary {
    border-color: rgba($pindou-primary, 0.28);
    background: linear-gradient(160deg, #fff 0%, rgba($pindou-primary-light, 0.8) 100%);
  }
}

.home-tile__icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  margin-bottom: 10px;
  background: $pindou-bg-muted;
  border: 1px solid $pindou-border-light;

  &--grid {
    background: linear-gradient(135deg, $pindou-primary-light, #fff);
    box-shadow: inset 0 0 0 2px rgba($pindou-primary, 0.15);
  }

  &--folder {
    background: linear-gradient(180deg, #fff 40%, $pindou-accent-soft);
  }

  &--gallery {
    background: linear-gradient(135deg, #e8f5ee, #fff);
  }

  &--palette {
    background: linear-gradient(135deg, #fceee8, #eef1fc);
  }

  &--text {
    background: linear-gradient(135deg, $pindou-primary-light, #fff);
  }

  &--guide {
    background: linear-gradient(135deg, #fef3e2, #fff);
  }

  &--code {
    background: linear-gradient(135deg, #1e2230, #4a62d6);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  }
}

.home-tile__title {
  font-weight: 700;
  font-size: $pindou-font-md;
  color: $pindou-text;
}

.home-tile__desc {
  margin-top: 4px;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
  line-height: 1.45;
  padding-right: 16px;
}

.home-tile__arrow {
  position: absolute;
  right: 12px;
  bottom: 14px;
  font-size: 14px;
  color: $pindou-primary;
  opacity: 0;
  transition: opacity $pindou-duration-fast, transform $pindou-duration-fast;
}

.section-title {
  margin: 0 0 16px;
  font-family: $pindou-font-display;
  font-size: $pindou-font-lg;
  font-weight: 700;
}

.step-row {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.step-connector {
  display: none;
}

.step-item {
  display: flex;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid $pindou-border-light;

  &:last-child {
    border-bottom: none;
  }
}

.step-num {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 9px;
  background: $pindou-primary;
  color: #fff;
  font-family: $pindou-font-display;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba($pindou-primary, 0.3);
}

.step-title {
  display: block;
  font-weight: 600;
  font-size: $pindou-font-md;
}

.step-desc {
  display: block;
  margin-top: 2px;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
}

.faq-item {
  padding: 14px 0;
  border-bottom: 1px solid $pindou-border-light;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.faq-q {
  display: block;
  font-weight: 600;
  font-size: $pindou-font-md;
}

.faq-a {
  display: block;
  margin-top: 6px;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  line-height: 1.65;
}

@media (min-width: 640px) {
  .home-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .home-tile:first-child {
    grid-column: span 1;
  }

  .step-row {
    flex-direction: row;
    align-items: flex-start;
    gap: 8px;
  }

  .step-connector {
    display: block;
    flex: 0 0 24px;
    height: 2px;
    margin-top: 28px;
    background: linear-gradient(90deg, $pindou-border, rgba($pindou-primary, 0.35), $pindou-border);
  }

  .step-item {
    flex: 1;
    flex-direction: column;
    border-bottom: none;
    padding: 0;
    text-align: center;
    align-items: center;
  }
}

@media (min-width: 900px) {
  .home-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
