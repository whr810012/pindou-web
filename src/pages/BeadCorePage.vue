<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BeadCoreCodeDemo from '@/components/BeadCoreCodeDemo.vue'
import PButton from '@/components/ui/PButton.vue'
import { usePageSeo } from '@/utils/seo'
import {
  BEAD_CORE_GITHUB_URL,
  BEAD_CORE_INSTALL_CMD,
  BEAD_CORE_NPM_PACKAGE,
  BEAD_CORE_NPM_URL,
} from '@/constants/beadCore'
import {
  BEAD_CORE_API_ROWS,
  BEAD_CORE_CODE_BROWSER,
  BEAD_CORE_CODE_EDIT,
  BEAD_CORE_CODE_NODE,
  BEAD_CORE_CODE_PALETTE,
  BEAD_CORE_CODE_PREP,
  BEAD_CORE_CODE_PREPROCESS,
  BEAD_CORE_CODE_QUICKSTART,
  BEAD_CORE_CODE_STEPWISE,
  BEAD_CORE_DOCS_TOC,
  BEAD_CORE_FAQS,
  BEAD_CORE_HIGHLIGHTS,
  BEAD_CORE_PIPELINE_ASCII,
  BEAD_CORE_PIPELINE_PARAMS,
  BEAD_CORE_RELATED_LINKS,
} from '@/constants/beadCoreDocs'

usePageSeo('beadCore')

const router = useRouter()
const copied = ref(false)
const algorithmsUrl = `${BEAD_CORE_GITHUB_URL}/tree/main/docs/algorithms`

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
      <p class="bead-core-hero__badge">开源 · MIT · npm · 使用手册</p>
      <h1 class="craft-page-head__title">{{ BEAD_CORE_NPM_PACKAGE }}</h1>
      <p class="craft-page-head__sub">
        蛋蛋拼豆核心算法库详细使用介绍 — 从安装、色板与像素约定，到
        <code>runPipeline</code>、拼豆 Prep、编辑与统计的完整跟做示例。
      </p>
      <div class="bead-core-hero__cta">
        <PButton type="primary" text="在 npm 查看" @click="openNpm" />
        <PButton plain text="GitHub 源码" @click="openGithub" />
        <PButton plain text="打开工作台" @click="router.push('/workspace')" />
      </div>
    </header>

    <nav class="card craft-intro-card bead-core-toc" aria-label="文档目录">
      <h2 class="bead-core-section__title">目录</h2>
      <ol class="bead-core-toc__list">
        <li v-for="item in BEAD_CORE_DOCS_TOC" :key="item.id">
          <a :href="`#${item.id}`">{{ item.label }}</a>
        </li>
      </ol>
    </nav>

    <section class="bead-core-highlights" aria-label="特性">
      <article
        v-for="item in BEAD_CORE_HIGHLIGHTS"
        :key="item.label"
        class="card craft-intro-card bead-core-highlight"
      >
        <h3 class="bead-core-highlight__title">{{ item.label }}</h3>
        <p class="bead-core-highlight__desc">{{ item.desc }}</p>
      </article>
    </section>

    <section id="install" class="card craft-intro-card bead-core-section bead-core-install">
      <h2 class="bead-core-section__title">1. 安装</h2>
      <p class="bead-core-section__text">
        本包为 <strong>ESM</strong>，需 Node.js ≥ 18。请在
        <code>package.json</code> 中设置 <code>"type": "module"</code>，或在 TypeScript 中使用
        <code>"module": "ESNext"</code>。
      </p>
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

    <section id="concepts" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">2. 核心概念</h2>
      <p class="bead-core-section__text">
        库<strong>不内置色板</strong>。调用方需提供
        <code>PaletteEntry[]</code>；像素为 RGBA
        <code>Uint8ClampedArray</code>；输出为二维 <code>MappedGrid</code>（含可选
        <code>isExternal</code> 背景标记）。
      </p>
      <h3 class="bead-core-section__subtitle">色板结构</h3>
      <pre class="bead-core-code"><code>{{ BEAD_CORE_CODE_PALETTE }}</code></pre>
      <BeadCoreCodeDemo
        variant="palette"
        title="色板 Playground"
        hint="节选自落地页同款 pindou-full；左侧点选色号，右侧看当前色块。"
      />
      <p class="bead-core-section__text">
        <code>codes</code> 键为品牌体系
        <code>MARD | COCO | MANMAN | PANPAN | MIXIAOWO</code>。不用的品牌填空字符串即可。
      </p>
    </section>

    <section id="quickstart" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">3. 快速开始</h2>
      <p class="bead-core-section__text">
        完整路径：迷你色板 → 像素 → 预处理 → <code>runPipeline</code> → 裁边 → 统计。可直接复制运行逻辑。
      </p>
      <pre class="bead-core-code"><code>{{ BEAD_CORE_CODE_QUICKSTART }}</code></pre>
      <BeadCoreCodeDemo
        variant="pipeline"
        title="从像素到拼豆图纸"
        hint="左侧调 gridWidth / mode / mergeThreshold 等，右侧实时重跑流水线。"
      />
    </section>

    <section id="load-image" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">4. 读取图片</h2>
      <h3 class="bead-core-section__subtitle">浏览器 Canvas</h3>
      <pre class="bead-core-code"><code>{{ BEAD_CORE_CODE_BROWSER }}</code></pre>
      <BeadCoreCodeDemo
        variant="browser"
        title="Canvas 读图后的同类结果"
        hint="原图为落地页对比图；用 getImageData 读入后，左侧调参实时跑流水线。"
      />
      <h3 class="bead-core-section__subtitle">Node.js + sharp</h3>
      <p class="bead-core-section__text">
        <code>sharp</code> 不是本库依赖，需自行 <code>npm install sharp</code>。服务端读文件得到同样的 RGBA
        缓冲，管线输出与上图一致。
      </p>
      <pre class="bead-core-code"><code>{{ BEAD_CORE_CODE_NODE }}</code></pre>
    </section>

    <section id="pipeline" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">5. runPipeline 参数</h2>
      <pre class="bead-core-pipeline" aria-label="流水线示意"><code>{{ BEAD_CORE_PIPELINE_ASCII }}</code></pre>
      <BeadCoreCodeDemo
        variant="pipeline"
        title="流水线 Playground"
        hint="原图与成品对照均来自落地页；拖动参数看豆图块面如何变化。"
      />
      <div class="bead-core-table-wrap">
        <table class="bead-core-table">
          <thead>
            <tr>
              <th scope="col">参数</th>
              <th scope="col">类型</th>
              <th scope="col">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in BEAD_CORE_PIPELINE_PARAMS" :key="row.name">
              <td><code>{{ row.name }}</code></td>
              <td><code>{{ row.type }}</code></td>
              <td>{{ row.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="bead-core-section__text">
        配色内部使用 CIEDE2000；对外可用 <code>colorDistance</code> 与
        <code>findClosestPaletteEntry</code>。
      </p>
    </section>

    <section id="stepwise" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">6. 分步调用</h2>
      <p class="bead-core-section__text">不需要完整流水线时，可单独使用各模块：</p>
      <pre class="bead-core-code"><code>{{ BEAD_CORE_CODE_STEPWISE }}</code></pre>
      <BeadCoreCodeDemo
        variant="pipeline"
        title="分步组合 Playground"
        hint="与完整 runPipeline 同类；改 maxColors 可体会限色效果。"
      />
    </section>

    <section id="preprocess" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">7. 图像预处理</h2>
      <p class="bead-core-section__text">
        进入流水线前可选调节源图。也可用
        <code>DEFAULT_IMAGE_ADJUST</code> / <code>DEFAULT_PHOTO_OPTIMIZE</code> 作为起点。
      </p>
      <pre class="bead-core-code"><code>{{ BEAD_CORE_CODE_PREPROCESS }}</code></pre>
      <BeadCoreCodeDemo
        variant="preprocess"
        title="预处理 Playground"
        hint="以落地页原图为输入；拖动亮度 / 对比度 / 饱和度，开关锐化与降噪。"
      />
    </section>

    <section id="prep" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">8. 拼豆专用 Prep</h2>
      <p class="bead-core-section__text">
        <code>createBeadPrepPixels</code> 生成大色块硬边缘中间图，再以
        <code>flatTile: true</code> 一像素一豆进流水线；像素风可用
        <code>createPixelArtPrepPixels</code>。
      </p>
      <pre class="bead-core-code"><code>{{ BEAD_CORE_CODE_PREP }}</code></pre>
      <BeadCoreCodeDemo
        variant="prep"
        title="Prep Playground"
        hint="调节 maxGrid，观察中间图与 flatTile 豆图从细到粗的变化。"
      />
    </section>

    <section id="edit" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">9. 编辑与统计</h2>
      <p class="bead-core-section__text">
        编辑函数均返回<strong>新网格</strong>（不可变）。外部背景格会被跳过。
      </p>
      <pre class="bead-core-code"><code>{{ BEAD_CORE_CODE_EDIT }}</code></pre>
      <BeadCoreCodeDemo
        variant="edit"
        title="编辑 Playground"
        hint="选填充或画笔与颜色后，直接点画布试 fillRegion / paintRect；可重置。"
      />
    </section>

    <section id="api" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">10. API 一览</h2>
      <div class="bead-core-table-wrap">
        <table class="bead-core-table">
          <thead>
            <tr>
              <th scope="col">分类</th>
              <th scope="col">导出</th>
              <th scope="col">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in BEAD_CORE_API_ROWS" :key="`${row.category}-${row.name}`">
              <td>{{ row.category }}</td>
              <td><code>{{ row.name }}</code></td>
              <td>{{ row.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="bead-core-section__text">
        算法深挖见
        <a :href="algorithmsUrl" target="_blank" rel="noopener noreferrer">GitHub docs/algorithms</a>
        ；包内 README 与本页保持同步的使用说明。
      </p>
    </section>

    <section id="relation" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">11. 与 Pindou 网页的关系</h2>
      <ul class="bead-core-list">
        <li>本站浏览器端调用同一套算法完成「上传 → 生成 → 精修 → 导出」。</li>
        <li>色板、项目存储与 UI 在应用层；核心只处理像素与网格。</li>
        <li>工作台封装流水线与 prep；精修页使用 <code>fillRegion</code> / <code>paintRect</code> / 翻转等编辑 API。</li>
        <li>许可证：MIT，Copyright © 蛋蛋。</li>
      </ul>
    </section>

    <section id="faq" class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">12. FAQ</h2>
      <div class="bead-core-faq">
        <article v-for="item in BEAD_CORE_FAQS" :key="item.q" class="bead-core-faq__item">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </article>
      </div>
    </section>

    <section class="card craft-intro-card bead-core-section">
      <h2 class="bead-core-section__title">相关页面</h2>
      <div class="bead-core-related">
        <router-link
          v-for="link in BEAD_CORE_RELATED_LINKS"
          :key="link.path"
          class="bead-core-related__link"
          :to="link.path"
        >
          {{ link.label }}
        </router-link>
      </div>
      <p class="bead-core-section__text">
        只想快速做图可直接进
        <router-link to="/workspace">工作台</router-link>
        ；想了解拼豆流程可读
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
  scroll-behavior: smooth;
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

    code {
      font-size: 0.92em;
      color: $pindou-primary;
    }
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

.bead-core-toc {
  margin-bottom: $pindou-space-md;
  padding: 18px 18px 8px;
}

.bead-core-toc__list {
  margin: 12px 0 8px;
  padding-left: 1.35em;
  columns: 2;
  column-gap: 24px;
  font-size: $pindou-font-sm;
  line-height: 1.8;
  color: $pindou-text;

  @media (max-width: 520px) {
    columns: 1;
  }

  a {
    color: $pindou-primary;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
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
  scroll-margin-top: 16px;
}

.bead-core-section__title {
  margin: 0;
  font-size: $pindou-font-lg;
  font-weight: 700;
  color: $pindou-text;
}

.bead-core-section__subtitle {
  margin: 18px 0 0;
  font-size: $pindou-font-md;
  font-weight: 700;
  color: $pindou-text;
}

.bead-core-section__text {
  margin: 14px 0 0;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
  line-height: 1.65;

  code {
    font-size: 0.92em;
    color: $pindou-primary;
  }

  a {
    color: $pindou-primary;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
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
  white-space: pre;
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
    vertical-align: top;
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
