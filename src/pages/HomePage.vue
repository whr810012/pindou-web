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
    icon: '✨',
    primary: true,
    path: '/workspace',
  },
  {
    title: '我的项目',
    desc: '继续未完成的创作',
    icon: '📁',
    path: '/projects',
  },
  {
    title: '探索画廊',
    desc: '案例与参数推荐',
    icon: '🖼',
    path: '/gallery',
  },
  {
    title: '自定义色板',
    desc: '管理专属色号',
    icon: '🎨',
    path: '/palette',
  },
]

function go(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="page page--app home">
    <section class="home-hero card">
      <div class="home-hero__text">
        <h1 class="home-hero__title">功能主页</h1>
        <p class="home-hero__sub">选择下方入口，开始或继续你的拼豆创作</p>
      </div>
      <PButton type="primary" text="进入工作台" @click="go('/workspace')" />
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
        <span class="home-tile__icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="home-tile__title">{{ item.title }}</span>
        <span class="home-tile__desc">{{ item.desc }}</span>
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
        <div class="step-item">
          <span class="step-num">2</span>
          <div>
            <span class="step-title">生成与精修</span>
            <span class="step-desc">参数调优、画笔改色</span>
          </div>
        </div>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px $pindou-space-lg;
  background: linear-gradient(135deg, rgba($pindou-primary, 0.08), rgba($pindou-accent, 0.06));
  border: 1px solid rgba($pindou-primary, 0.12);
}

.home-hero__title {
  margin: 0;
  font-size: $pindou-font-xl;
  font-weight: 700;
}

.home-hero__sub {
  margin: 6px 0 0;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: $pindou-space-md;
}

.home-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 18px 16px;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-md;
  background: $pindou-bg-card;
  box-shadow: $pindou-shadow-sm;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;

  &:hover {
    border-color: rgba($pindou-primary, 0.35);
    box-shadow: $pindou-shadow-md;
    transform: translateY(-1px);
  }

  &--primary {
    border-color: rgba($pindou-primary, 0.25);
    background: linear-gradient(145deg, #fff, rgba($pindou-primary-light, 0.5));
  }
}

.home-tile__icon {
  font-size: 22px;
  margin-bottom: 8px;
}

.home-tile__title {
  font-weight: 600;
  font-size: $pindou-font-md;
  color: $pindou-text;
}

.home-tile__desc {
  margin-top: 4px;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
  line-height: 1.4;
}

.section-title {
  margin: 0 0 14px;
  font-size: $pindou-font-lg;
  font-weight: 600;
}

.step-row {
  display: flex;
  flex-direction: column;
  gap: 0;
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
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 50%;
  background: $pindou-primary;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
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
  line-height: 1.6;
}

@media (min-width: 640px) {
  .home-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .step-row {
    flex-direction: row;
    gap: 16px;
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
</style>
