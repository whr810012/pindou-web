<script setup lang="ts">
import { useRouter } from 'vue-router'
import seoConfig from '../../seo.config.json'
import PButton from '@/components/ui/PButton.vue'
import { usePageSeo } from '@/utils/seo'

const router = useRouter()
usePageSeo('landing')

const features = seoConfig.features

function enterApp() {
  router.push('/home')
}

function goGallery() {
  router.push('/gallery')
}
</script>

<template>
  <div class="landing">
    <div class="landing__bg" aria-hidden="true">
      <div class="landing__orb landing__orb--a" />
      <div class="landing__orb landing__orb--b" />
      <div class="landing__grid" />
    </div>

    <header class="landing__header">
      <div class="landing__brand">
        <span class="landing__logo" aria-hidden="true">◆</span>
        <span>Pindou 拼豆</span>
      </div>
      <button type="button" class="landing__link" @click="goGallery">案例画廊</button>
    </header>

    <main class="landing__main">
      <section class="landing__hero">
        <p class="landing__eyebrow">免费 · 本地处理 · 网页可用</p>
        <h1 class="landing__title">把照片变成<br />可拼的豆图纸</h1>
        <p class="landing__lead">
          上传图片，一键映射 MARD / COCO 等主流色号，在线精修、导出 PDF，全程在浏览器本地完成。
        </p>
        <div class="landing__cta">
          <PButton type="primary" size="lg" text="进入应用，开始制作" @click="enterApp" />
          <PButton plain size="lg" text="先看看案例" @click="goGallery" />
        </div>
        <ul class="landing__stats">
          <li><strong>本地隐私</strong><span>图片不上传服务器</span></li>
          <li><strong>多品牌色卡</strong><span>MARD · COCO · 自定义</span></li>
          <li><strong>完整流程</strong><span>生成 · 精修 · 导出</span></li>
        </ul>
      </section>

      <section class="landing__features" aria-label="核心功能">
        <h2 class="landing__section-title">你能用它做什么</h2>
        <div class="landing__feature-grid">
          <article v-for="item in features" :key="item" class="landing__feature-card">
            <span class="landing__feature-dot" aria-hidden="true" />
            <h3>{{ item }}</h3>
          </article>
        </div>
      </section>

      <section class="landing__steps" aria-label="使用步骤">
        <h2 class="landing__section-title">三步完成</h2>
        <ol class="landing__step-list">
          <li>
            <span class="landing__step-num">1</span>
            <div>
              <strong>上传图片</strong>
              <p>相册或文件选择，自动压缩后本地像素化</p>
            </div>
          </li>
          <li>
            <span class="landing__step-num">2</span>
            <div>
              <strong>生成与精修</strong>
              <p>调整格数色板，画笔改色，对比原图找差异</p>
            </div>
          </li>
          <li>
            <span class="landing__step-num">3</span>
            <div>
              <strong>导出开拼</strong>
              <p>带色号图纸、采购清单 PDF，专心拼豆打勾</p>
            </div>
          </li>
        </ol>
        <PButton type="primary" block size="lg" text="进入应用" @click="enterApp" />
      </section>
    </main>

    <footer class="landing__footer">
      <span>© Pindou · 拼豆图纸生成工具</span>
      <button type="button" class="landing__link" @click="enterApp">进入功能主页</button>
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
  background: linear-gradient(165deg, #f8f6ff 0%, #f5f6fa 42%, #eef4ff 100%);
}

.landing__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.55;
}

.landing__orb--a {
  width: 320px;
  height: 320px;
  top: -80px;
  right: -60px;
  background: rgba($pindou-primary, 0.22);
}

.landing__orb--b {
  width: 280px;
  height: 280px;
  bottom: 10%;
  left: -80px;
  background: rgba(255, 152, 120, 0.18);
}

.landing__grid {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    linear-gradient(rgba($pindou-primary, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba($pindou-primary, 0.06) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(to bottom, #000 0%, transparent 85%);
}

.landing__header,
.landing__main,
.landing__footer {
  position: relative;
  z-index: 1;
}

.landing__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px $pindou-space-lg;
  max-width: $pindou-content-wide;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.landing__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
}

.landing__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, $pindou-primary, $pindou-accent);
  color: #fff;
  font-size: 14px;
  box-shadow: 0 4px 14px rgba($pindou-primary, 0.35);
}

.landing__link {
  border: none;
  background: transparent;
  color: $pindou-text-secondary;
  font-size: $pindou-font-md;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: $pindou-radius-sm;
  transition: color 0.15s, background 0.15s;

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
  padding: 12px $pindou-space-lg 48px;
  box-sizing: border-box;
}

.landing__hero {
  padding: 24px 0 40px;
  max-width: 640px;
}

.landing__eyebrow {
  margin: 0 0 12px;
  font-size: $pindou-font-sm;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: $pindou-primary;
}

.landing__title {
  margin: 0;
  font-size: clamp(32px, 8vw, 44px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.landing__lead {
  margin: 16px 0 0;
  font-size: $pindou-font-lg;
  line-height: 1.65;
  color: $pindou-text-secondary;
  max-width: 520px;
}

.landing__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.landing__stats {
  list-style: none;
  margin: 32px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;

  li {
    padding: 14px 16px;
    border-radius: $pindou-radius-md;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: $pindou-shadow-sm;
    backdrop-filter: blur(8px);
  }

  strong {
    display: block;
    font-size: $pindou-font-md;
    margin-bottom: 4px;
  }

  span {
    font-size: $pindou-font-sm;
    color: $pindou-text-muted;
  }
}

.landing__section-title {
  margin: 0 0 20px;
  font-size: $pindou-font-xl;
  font-weight: 700;
}

.landing__features {
  margin-top: 16px;
  padding-top: 8px;
}

.landing__feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.landing__feature-card {
  padding: 18px 16px;
  border-radius: $pindou-radius-md;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid $pindou-border;
  box-shadow: $pindou-shadow-sm;

  h3 {
    margin: 10px 0 0;
    font-size: $pindou-font-md;
    font-weight: 600;
    line-height: 1.4;
  }
}

.landing__feature-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, $pindou-primary, $pindou-accent);
}

.landing__steps {
  margin-top: 48px;
  padding: 28px 24px;
  border-radius: $pindou-radius-lg;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid $pindou-border;
  box-shadow: $pindou-shadow-md;
}

.landing__step-list {
  list-style: none;
  margin: 0 0 24px;
  padding: 0;

  li {
    display: flex;
    gap: 14px;
    padding: 16px 0;
    border-bottom: 1px solid $pindou-border-light;

    &:last-child {
      border-bottom: none;
    }

    strong {
      display: block;
      font-size: $pindou-font-md;
      margin-bottom: 4px;
    }

    p {
      margin: 0;
      font-size: $pindou-font-sm;
      color: $pindou-text-muted;
      line-height: 1.5;
    }
  }
}

.landing__step-num {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 50%;
  background: $pindou-primary-light;
  color: $pindou-primary;
  font-weight: 700;
  font-size: 14px;
}

.landing__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px $pindou-space-lg calc(24px + var(--pindou-safe-bottom));
  max-width: $pindou-content-wide;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  border-top: 1px solid $pindou-border-light;
}
</style>
