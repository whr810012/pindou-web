<script setup lang="ts">
import { useRouter } from 'vue-router'
import PButton from '@/components/ui/PButton.vue'
import { usePageSeo } from '@/utils/seo'
import { CONTACT_EMAIL, CONTACT_WECHAT } from '@/constants/contact'

usePageSeo('guide')

const router = useRouter()

interface GuideSection {
  id: string
  title: string
  summary: string
  points: string[]
  tip?: string
}

const sections: GuideSection[] = [
  {
    id: 'start',
    title: '入门：拼豆需要什么',
    summary: '拼豆（Perler Beads）是用统一规格的小色豆在底板上拼出图案，再熨烫固定的手工。图纸上的每一格对应一颗豆子。',
    points: [
      '色豆：常见 2.6mm 融合豆，品牌如 MARD、COCO、漫漫等，色号体系不同',
      '底板：透明可钉板，拼完可整体熨烫；也可直接在硅胶垫上拼',
      '工具：镊子、熨斗（或直发夹）、烘焙纸/熨烫纸',
      '图纸：带色号标注的像素格图——这正是 Pindou 要帮你生成的',
    ],
    tip: '新手建议从 32～48 格宽的小图开始，颜色种类控制在 12 色以内更容易完成。',
  },
  {
    id: 'palette',
    title: '选色与色卡',
    summary: 'Pindou 支持多品牌色号映射。生成前在「参数」里选择色板规格与品牌显示。',
    points: [
      '96 色 / 168 色 / 全色系：色板越大细节越多，但采购颜色也越多',
      '主导色模式：适合卡通、插画，色块边界清晰',
      '平均色模式：适合风景、渐变，过渡更自然',
      '最大颜色数：可限制图纸用到的颜色种类，降低采购成本',
      '排除色号：生成后可在色板面板临时排除家里没有的豆子',
    ],
    tip: '真人照片建议先开「照片优化」降噪，或将最大颜色数设为 16～24。',
  },
  {
    id: 'workflow',
    title: '从照片到图纸',
    summary: '推荐流程：上传 → 调参生成 → 必要时精修 → 导出打印。',
    points: [
      '上传：支持拖拽、粘贴、JPG/PNG/WebP；也可从画廊加载完整案例学习',
      '裁剪：框选主体区域，减少无效背景格',
      'AI 预处理（可选）：卡通化、线稿、去背景等，需自备火山引擎凭证',
      '参数：格数越大细节越多；照片合并阈值建议 0；色板选 168 色或全色系；配色使用 ΔE 感知色差',
      '精修：画笔换色、填充、橡皮，适合修正自动识别错误的格子',
    ],
  },
  {
    id: 'export',
    title: '导出与分板打印',
    summary: '大图需要按拼板尺寸拆分，才能对照图纸逐块拼豆。',
    points: [
      'PNG 导出：带网格与色号，适合屏幕对照或自行排版打印',
      'PDF 整图：单页高清图纸，适合中小型作品',
      'PDF 分板（29×29）：按常见拼板格数切多页，每页含板坐标，打印后拼接',
      '采购清单：统计各色豆子用量，可按每 1000 颗估算包数',
      '项目分享码：保存图纸参数与进度，可备份或发给朋友导入',
    ],
    tip: '打印时选择「实际大小」或 100% 缩放，确保每格与真实豆子对齐。',
  },
  {
    id: 'build',
    title: '拼豆与熨烫技巧',
    summary: '拼完后用烘焙纸覆盖，中低温熨烫至豆子表面微熔粘连。冷却后再撕纸。',
    points: [
      '拼豆顺序：建议按颜色分批，或从外向内，减少碰倒',
      '专心模式：Pindou 可按颜色分区标记进度，适合大图',
      '熨烫单面：保留豆子颗粒感；双面熨烫更平整，适合杯垫等小物',
      '大图拼接：分板拼完后可在背面再烫一条连接带，或整体转移到更大底板',
      '翘曲处理：重物压平冷却；严重翘曲可低温再烫一次',
    ],
  },
]

const toc = sections.map((s) => ({ id: s.id, title: s.title }))

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function go(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="page guide-page page-enter">
    <header class="craft-page-head">
      <h1 class="craft-page-head__title">拼豆新手教程</h1>
      <p class="craft-page-head__sub">
        从选豆、做图、打印到熨烫的完整指南。配合 Pindou 工作台，把照片变成可拼的带色号图纸。
      </p>
      <div class="guide-hero__cta">
        <PButton type="primary" text="打开工作台" @click="go('/workspace')" />
        <PButton plain text="浏览案例" @click="go('/gallery')" />
      </div>
    </header>

    <nav class="card craft-intro-card guide-toc" aria-label="教程目录">
      <span class="guide-toc__label">目录</span>
      <ul class="guide-toc__list">
        <li v-for="item in toc" :key="item.id">
          <button type="button" class="guide-toc__link" @click="scrollTo(item.id)">
            {{ item.title }}
          </button>
        </li>
      </ul>
    </nav>

    <article
      v-for="(section, index) in sections"
      :id="section.id"
      :key="section.id"
      class="card guide-section"
    >
      <span class="guide-section__num" aria-hidden="true">{{ index + 1 }}</span>
      <h2 class="guide-section__title">{{ section.title }}</h2>
      <p class="guide-section__summary">{{ section.summary }}</p>
      <ul class="guide-section__points">
        <li v-for="(point, i) in section.points" :key="i">{{ point }}</li>
      </ul>
      <p v-if="section.tip" class="guide-section__tip">
        <strong>提示：</strong>{{ section.tip }}
      </p>
    </article>

    <footer class="card craft-intro-card guide-footer">
      <h2 class="guide-footer__title">准备好开始了吗？</h2>
      <p class="guide-footer__text">
        上传一张照片，或从画廊打开「可编辑案例」体验完整流程。全部核心功能免费，图片默认在浏览器本地处理。
      </p>
      <p class="guide-footer__contact">
        反馈与建议：
        <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>
        <span class="guide-footer__sep">·</span>
        微信：{{ CONTACT_WECHAT }}
      </p>
      <div class="guide-footer__actions">
        <PButton type="primary" text="免费开始制作" @click="go('/workspace')" />
        <PButton plain text="返回首页" @click="go('/home')" />
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.guide-hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.guide-toc {
  padding: 16px 18px;
  margin-bottom: $pindou-space-md;
}

.guide-toc__label {
  display: block;
  font-size: $pindou-font-xs;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $pindou-text-muted;
  margin-bottom: 10px;
}

.guide-toc__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.guide-toc__link {
  border: none;
  background: none;
  padding: 6px 0;
  text-align: left;
  font-size: $pindou-font-sm;
  font-weight: 600;
  color: $pindou-primary;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.guide-section {
  position: relative;
  padding: 20px 18px 20px 52px;
  margin-bottom: $pindou-space-md;
  scroll-margin-top: 72px;
}

.guide-section__num {
  position: absolute;
  left: 16px;
  top: 20px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba($pindou-primary, 0.12);
  color: $pindou-primary;
  font-size: $pindou-font-sm;
  font-weight: 800;
}

.guide-section__title {
  margin: 0;
  font-size: $pindou-font-lg;
  font-weight: 700;
  color: $pindou-text;
  line-height: 1.35;
}

.guide-section__summary {
  margin: 10px 0 0;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
  line-height: 1.65;
}

.guide-section__points {
  margin: 14px 0 0;
  padding-left: 1.2em;
  font-size: $pindou-font-sm;
  color: $pindou-text;
  line-height: 1.7;

  li + li {
    margin-top: 8px;
  }
}

.guide-section__tip {
  margin: 14px 0 0;
  padding: 10px 12px;
  border-radius: $pindou-radius-sm;
  background: rgba($pindou-accent, 0.08);
  border-left: 3px solid $pindou-accent;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
  line-height: 1.55;

  strong {
    color: $pindou-text;
  }
}

.guide-footer {
  padding: 24px 20px;
  text-align: center;
  margin-top: 8px;
}

.guide-footer__title {
  margin: 0;
  font-size: $pindou-font-lg;
  font-weight: 700;
}

.guide-footer__text {
  margin: 10px auto 0;
  max-width: 480px;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  line-height: 1.6;
}

.guide-footer__contact {
  margin: 12px 0 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;

  a {
    color: $pindou-primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.guide-footer__sep {
  margin: 0 6px;
  opacity: 0.5;
}

.guide-footer__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}
</style>
