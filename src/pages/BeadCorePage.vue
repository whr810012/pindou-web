<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PButton from '@/components/ui/PButton.vue'
import { usePageSeo } from '@/utils/seo'
import {
  BEAD_CORE_GITHUB_URL,
  BEAD_CORE_INSTALL_CMD,
  BEAD_CORE_NPM_PACKAGE,
  BEAD_CORE_NPM_URL,
} from '@/constants/beadCore'

usePageSeo('beadCore')

const router = useRouter()
const copied = ref(false)
const developerFaqs = [
  {
    q: 'bead-core 适合什么场景？',
    a: '适合需要把图片转成拼豆色号网格的 Web、小程序、Node 批处理项目，库本身不包含 UI。',
  },
  {
    q: 'Pindou 网页和 bead-core 是什么关系？',
    a: 'Pindou 网页端使用同一套核心算法完成上传、生成、精修与导出；bead-core 则独立发布，方便开发者集成。',
  },
  {
    q: '如何安装 bead-core？',
    a: `执行 ${BEAD_CORE_INSTALL_CMD} 即可安装，MIT 开源，可在 npm 与 GitHub 查看文档与源码。`,
  },
]
const relatedLinks = [
  { label: '免费在线工作台', path: '/workspace' },
  { label: '拼豆新手教程', path: '/guide' },
  { label: '案例画廊', path: '/gallery' },
]

const highlights = [
  { label: '零运行时依赖', desc: '不绑定 Vue / Canvas，Node 与浏览器均可使用' },
  { label: 'CIEDE2000 配色', desc: '感知色差 ΔE，与主流拼豆工具一致的色板匹配' },
  { label: '照片清晰度优化', desc: '最近邻降采样 + 可调合并阈值，保留边缘细节' },
  { label: '完整流水线', desc: '转换 → 合并 → 限色 → 背景标记 → 排除色重映射' },
]

const apiRows = [
  { name: 'runPipeline', desc: '主流水线入口' },
  { name: 'convertImageToPattern', desc: '图片 → 拼豆网格' },
  { name: 'prepareSourcePixels', desc: '亮度 / 对比度 / 锐化 / 降噪' },
  { name: 'mergeSimilarRegions', desc: '相似色区域合并' },
  { name: 'markExternalBackground', desc: '贴边背景洪水填充' },
  { name: 'computeColorStats', desc: '色号用量统计' },
]

const exampleCode = `import { prepareSourcePixels, runPipeline } from '${BEAD_CORE_NPM_PACKAGE}'

const adjusted = prepareSourcePixels(pixels, width, height, imageAdjust, photoOptimize)
const { grid } = runPipeline(adjusted, width, height, {
  gridWidth: 100,
  mode: 'average',
  mergeThreshold: 0,
  maxColors: 0,
  palette,
  backgroundPaletteIds: ['neutral-001'],
  excludedPaletteIds: [],
})`

async function copyInstall() {
  try {
    await navigator.clipboard.writeText(BEAD_CORE_INSTALL_CMD)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    /* ignore */
  }
}

function openNpm() {
  window.open(BEAD_CORE_NPM_URL, '_blank', 'noopener')
}

function openGithub() {
  window.open(BEAD_CORE_GITHUB_URL, '_blank', 'noopener')
}
</script>

<template>
  <div class="page bead-core-page page-enter">
    <header class="craft-page-head bead-core-hero">
      <p class="bead-core-hero__badge">开源 · MIT · npm</p>
      <h1 class="craft-page-head__title">@wangdandan810012/bead-core</h1>
      <p class="craft-page-head__sub">
        蛋蛋拼豆核心算法库 — Pindou 网页端背后的图片转图纸引擎。将 RGBA 像素映射为拼豆色号网格，供开发者集成到自己的应用。
      </p>
      <div class="bead-core-hero__cta">
        <PButton type="primary" text="在 npm 查看" @click="openNpm" />
        <PButton plain text="GitHub 源码" @click="openGithub" />
        <PButton plain text="打开工作台" @click="router.push('/workspace')" />
      </div>
    </header>

    <section class="card craft-intro-card bead-core-install" aria-label="安装">
      <h2 class="bead-core-section__title">安装</h2>
      <div class="bead-core-install__row">
        <code class="bead-core-install__cmd">{{ BEAD_CORE_INSTALL_CMD }}</code>
        <button type="button" class="bead-core-install__copy" @click="copyInstall">
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
      <p class="bead-core-install__hint">
        包页面：
        <a :href="BEAD_CORE_NPM_URL" target="_blank" rel="noopener noreferrer">{{ BEAD_CORE_NPM_URL }}</a>
      </p>
    </section>

    <section class="bead-core-highlights" aria-label="特性">
      <article
        v-for="item in highlights"
        :key="item.label"
        class="card craft-intro-card bead-core-highlight"
      >
        <h3 class="bead-core-highlight__title">{{ item.label }}</h3>
        <p class="bead-core-highlight__desc">{{ item.desc }}</p>
      </article>
    </section>

    <section class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">处理流水线</h2>
      <pre class="bead-core-pipeline" aria-label="流水线示意"><code>prepareSourcePixels
       ↓
runPipeline
  ├─ convertImageToPattern（降采样 + CIEDE2000 配色）
  ├─ mergeSimilarRegions
  ├─ limitGridColors
  ├─ markExternalBackground
  └─ remapExcludedColors</code></pre>
      <p class="bead-core-section__text">
        色板数据由调用方传入（支持 MARD、COCO 等多品牌色号映射），库本身不包含 UI，适合 Web、小程序或 Node 批处理场景。
      </p>
    </section>

    <section class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">主要 API</h2>
      <div class="bead-core-table-wrap">
        <table class="bead-core-table">
          <thead>
            <tr>
              <th scope="col">导出</th>
              <th scope="col">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in apiRows" :key="row.name">
              <td><code>{{ row.name }}</code></td>
              <td>{{ row.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">快速示例</h2>
      <pre class="bead-core-code"><code>{{ exampleCode }}</code></pre>
    </section>

    <section class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">与 Pindou 网页的关系</h2>
      <ul class="bead-core-list">
        <li>本站在浏览器中调用同一套算法完成「上传 → 生成 → 精修 → 导出」。</li>
        <li>算法库独立发布，便于其他开发者复用或二次集成。</li>
        <li>详细算法说明见 GitHub 仓库 <code>docs/algorithms/</code> 目录。</li>
        <li>许可证：MIT，Copyright © 蛋蛋。</li>
      </ul>
    </section>

    <section class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">开发者常见问题</h2>
      <div class="bead-core-faq">
        <article v-for="item in developerFaqs" :key="item.q" class="bead-core-faq__item">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </article>
      </div>
    </section>

    <section class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">相关页面</h2>
      <div class="bead-core-related">
        <router-link v-for="link in relatedLinks" :key="link.path" class="bead-core-related__link" :to="link.path">
          {{ link.label }}
        </router-link>
      </div>
      <p class="bead-core-section__text">
        如果你只是想快速做图，直接进入工作台即可；如果想了解拼豆流程，可阅读
        <router-link to="/guide">拼豆教程</router-link>
        。
      </p>
    </section>

    <footer class="card craft-intro-card bead-core-footer">
      <h2 class="bead-core-footer__title">开始使用</h2>
      <p class="bead-core-footer__text">在 npm 安装包，或直接在 Pindou 体验生成效果。</p>
      <div class="bead-core-footer__actions">
        <PButton type="primary" text="npm 包页面" @click="openNpm" />
        <PButton plain text="免费在线制作" @click="router.push('/workspace')" />
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.bead-core-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px 48px;
}

.bead-core-hero {
  text-align: center;
  margin-bottom: $pindou-space-lg;

  .craft-page-head__title {
    font-size: clamp(1.35rem, 4vw, 1.75rem);
    word-break: break-all;
  }

  .craft-page-head__sub {
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
  }
}

.bead-core-hero__badge {
  display: inline-block;
  margin: 0 0 10px;
  padding: 4px 12px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-primary, 0.1);
  color: $pindou-primary;
  font-size: $pindou-font-xs;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.bead-core-hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 18px;
}

.bead-core-install {
  margin-bottom: $pindou-space-md;
}

.bead-core-install__row {
  display: flex;
  align-items: stretch;
  gap: 8px;
  margin-top: 12px;
}

.bead-core-install__cmd {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-muted;
  border: 1px solid $pindou-border-light;
  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  font-size: $pindou-font-xs;
  color: $pindou-text;
  overflow-x: auto;
  white-space: nowrap;
}

.bead-core-install__copy {
  flex-shrink: 0;
  padding: 0 14px;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-card;
  color: $pindou-text-secondary;
  font-size: $pindou-font-sm;
  cursor: pointer;

  &:hover {
    border-color: $pindou-primary;
    color: $pindou-primary;
  }
}

.bead-core-install__hint {
  margin: 12px 0 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
  word-break: break-all;

  a {
    color: $pindou-primary;
  }
}

.bead-core-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $pindou-space-sm;
  margin-bottom: $pindou-space-md;
}

.bead-core-highlight {
  padding: 16px;
}

.bead-core-highlight__title {
  margin: 0;
  font-size: $pindou-font-md;
  font-weight: 700;
  color: $pindou-text;
}

.bead-core-highlight__desc {
  margin: 8px 0 0;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
  line-height: 1.55;
}

.bead-core-section {
  margin-bottom: $pindou-space-md;
  padding: 20px 18px;
}

.bead-core-section__title {
  margin: 0;
  font-size: $pindou-font-lg;
  font-weight: 700;
  color: $pindou-text;
}

.bead-core-section__text {
  margin: 14px 0 0;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
  line-height: 1.65;
}

.bead-core-pipeline,
.bead-core-code {
  margin: 14px 0 0;
  padding: 14px 16px;
  border-radius: $pindou-radius-sm;
  background: #1e2230;
  color: #e8eaef;
  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  overflow-x: auto;
}

.bead-core-table-wrap {
  margin-top: 14px;
  overflow-x: auto;
}

.bead-core-table {
  width: 100%;
  border-collapse: collapse;
  font-size: $pindou-font-sm;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid $pindou-border-light;
  }

  th {
    color: $pindou-text-muted;
    font-weight: 600;
  }

  code {
    font-family: ui-monospace, Consolas, monospace;
    font-size: 0.92em;
    color: $pindou-primary;
  }
}

.bead-core-list {
  margin: 14px 0 0;
  padding-left: 1.2em;
  font-size: $pindou-font-sm;
  color: $pindou-text;
  line-height: 1.7;

  li + li {
    margin-top: 8px;
  }

  code {
    font-size: 0.92em;
    color: $pindou-primary;
  }
}

.bead-core-faq {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.bead-core-faq__item {
  padding: 14px;
  border-radius: $pindou-radius-md;
  background: rgba($pindou-bg-card, 0.9);
  border: 1px solid $pindou-border-light;

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

.bead-core-related {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.bead-core-related__link {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-primary, 0.08);
  border: 1px solid rgba($pindou-primary, 0.14);
  color: $pindou-primary;
  font-size: $pindou-font-xs;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: rgba($pindou-primary, 0.14);
  }
}

.bead-core-section__text a {
  color: $pindou-primary;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.bead-core-footer {
  text-align: center;
  padding: 24px 20px;
}

.bead-core-footer__title {
  margin: 0;
  font-size: $pindou-font-lg;
  font-weight: 700;
}

.bead-core-footer__text {
  margin: 10px 0 0;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
}

.bead-core-footer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 16px;
}
</style>
