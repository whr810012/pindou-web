# Pindou Web

Pindou 拼豆工具 — **Web 端**（Vue 3 + Vite），独立仓库版本。

在线演示：<https://dandanpindou.netlify.app>

## 快速开始

```bash
npm install
npm run dev
```

开发地址默认：<http://localhost:5173>

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run dev:ai` | 本地 AI 预处理 API（端口 8787） |
| `npm run dev:xhs` | 本地小红书解析 API（端口 8788） |
| `npm run build` | 生产构建（含共享包编译、SEO / 预渲染） |
| `npm run build:packages` | 仅编译 `packages/app-shared` |
| `npm run preview` | 预览 `dist` |
| `npm run type-check` | `vue-tsc` 类型检查 |
| `npm run test` | 运行 `bead-core` 与根目录单元测试 |
| `npm run test:ai` | 运行 AI 预处理服务单元测试 |
| `npm run test:xhs` | 运行小红书解析单元测试 |
| `npm run generate:palette` | 生成色板数据 |
| `npm run generate:landing-compare` | 生成落地页原图/拼豆对比图 |
| `npm run generate:gallery-projects` | 生成画廊完整案例 JSON |

## 环境变量

复制 `.env.example` 为 `.env.local`（勿提交）：

```env
# 构建与 SEO（Netlify 环境变量中同样配置）
VITE_SITE_URL=https://dandanpindou.netlify.app

# 开发：Canvas 本地模拟 AI（无需后端与凭证）
# VITE_AI_MOCK=true

# 开发：联调本地 AI 服务（npm run dev:ai）
# VITE_AI_PREPROCESS_URL=http://127.0.0.1:8787/api/ai-preprocess

# 开发：联调本地小红书解析（npm run dev:xhs）
# VITE_XHS_PARSE_URL=http://127.0.0.1:8788/api/xhs-parse

# 可选：Plausible 访问统计（填你的站点域名，不含 https://）
# VITE_ANALYTICS_DOMAIN=dandanpindou.netlify.app
```

生产环境（Netlify）前端默认同域 `/.netlify/functions/ai-preprocess`，一般无需配置 `VITE_AI_PREPROCESS_URL`。

### AI 预处理（二期，BYOK）

默认拼豆流程在浏览器本地完成。启用 **AI 预处理** 时：

1. 在火山引擎开通 [图像生成大模型](https://www.volcengine.com/docs/86081/1804465?lang=zh)，创建 IAM AccessKey（绑定 `CVFullAccess`）
2. 在工作台「AI 预处理」面板粘贴 `AccessKey.txt` 全文（仅存本机 `localStorage`）
3. 图片经 Netlify Function 转发至火山 SeedEdit 图生图 API 处理

| 风格 | 说明 | 适用场景 |
|------|------|----------|
| `enhance` | 清晰增强，最贴近原图 | 真人照片（推荐首选） |
| `sketch` | 线稿强化，轮廓清晰 | 需要明显填色边界 |
| `cartoon` | 卡通扁平，大色块 | 插画、可爱图案 |
| `flat` | 色块简化，颜色更少 | 海报风、极简图案 |
| `matting` | AI 去背景，透明底 | 人物/主体抠图后拼豆 |

详见 [server/ai-preprocess/README.md](server/ai-preprocess/README.md)。

## 第三期功能（Wave 1～3）

| 模块 | 能力 |
|------|------|
| **上传体验** | 拖拽 / 粘贴 / WebP；素材库与示例图一键试 |
| **生成参数** | 亮度·对比度·饱和度；最大颜色数；照片降噪/锐化 |
| **导出** | 29×29 拼板线；PDF 分板多页导出；采购清单包数估算 |
| **AI** | 去背景（matting）风格 |
| **编辑** | 自动裁边；编辑器水平/垂直翻转 |
| **项目流转** | 分享码导入导出 |
| **小红书** | 粘贴分享文案解析图集（Netlify Function） |
| **工具** | 像素文字生成 `/text`；落地页原图对比滑块 |

小红书解析详见 [server/xhs-parse/README.md](server/xhs-parse/README.md)。

## 第四期功能（体验补全）

| 模块 | 能力 |
|------|------|
| **AI 体验** | 处理进度条；504 超时自动缩小重试；手动「缩小重试」 |
| **画廊** | 完整可编辑案例（含 grid），一键进工作台 |
| **参数预设** | `pindou-params-v1:` 分享码导入导出 |
| **教程** | `/guide` 拼豆入门、分板打印、熨烫技巧（SEO 索引） |
| **统计** | 可选 Plausible（`VITE_ANALYTICS_DOMAIN`） |

生成画廊完整案例：`npm run generate:gallery-projects`（需 Playwright + 已编译 `bead-core`）。

## 第五期功能（清晰度升级）

| 模块 | 能力 |
|------|------|
| **转换引擎** | 独立 `convertImageToPattern` 管线：预处理 → 保边降采样 → CIEDE2000 感知配色 |
| **配色算法** | 色板匹配由 Oklab 升级为 CIEDE2000（ΔE），与主流拼豆工具一致 |
| **采样策略** | 最近邻格心采样 + Canvas 关闭平滑，避免边缘被区域平均抹糊 |
| **智能参数** | 上传后自动识别照片/卡通：照片尽量 1 像素 → 1 格、合并阈值 0、轻锐化；卡通适度降格 |
| **上限提升** | 最大格宽 256、源图边长 4096；默认格数 100、合并阈值 0 |
| **预览交互** | 图纸预览支持 Ctrl+滚轮 / 双指捏合缩放与复位 |
| **渲染** | 拼豆 Canvas 像素化显示；上传换图时自动清除上一张的排除色号 |

`bead-core` 已拆为独立 npm 包 [@wangdandan810012/bead-core](https://www.npmjs.com/package/@wangdandan810012/bead-core)（源码：[GitHub](https://github.com/whr810012/bead-core)），含 `conversion/` 模块及单元测试。详见 [docs/BEAD_CORE_SPLIT.md](docs/BEAD_CORE_SPLIT.md)。

## Netlify 部署

1. 在 [Netlify](https://app.netlify.com/) 导入 GitHub 仓库 `whr810012/pindou-web`，分支 `main`
2. `netlify.toml` 已配置构建与 Functions，一般无需手改：
   - **Build command**: `npx playwright install chromium && npm run build`
   - **Publish directory**: `dist`
   - **Functions**: `netlify/functions`
3. **环境变量**（Site configuration → Environment variables）：

| 变量 | 说明 |
|------|------|
| `VITE_SITE_URL` | 正式站点 URL，如 `https://dandanpindou.netlify.app` |
| `ALLOWED_ORIGIN` | CORS 来源（可选，默认 `*`） |

**不要**在生产环境配置 `JIMENG_ACCESS_KEY_ID` / `JIMENG_API_KEY`（BYOK 由用户提供凭证）。

改环境变量后需 **Trigger deploy → Clear cache and deploy site** 重新构建。

### Function 超时说明

AI 图生图可能需 10～25 秒。`netlify.toml` 中 `ai-preprocess` 已设 `timeout = 26`（**Pro 计划**生效）。免费版上限约 10 秒，可能出现 504。

## SEO

站点 SEO 由 `seo.config.json` + `scripts/generate-seo.mjs` + Playwright 预渲染共同完成。

**构建时生成：**

- `public/sitemap.xml`、`public/robots.txt`
- `dist/index.html` 注入 meta / JSON-LD
- 预渲染 `/`、`/gallery`、`/workspace` 静态 HTML

**关键配置：**

- `seo.config.json` → `defaultSiteUrl`、标题、描述、关键词、FAQ
- `VITE_SITE_URL` → 构建时覆盖 `defaultSiteUrl`（sitemap、canonical、OG 图）

**上线后提交收录（新站通常需 1～4 周）：**

1. [Google Search Console](https://search.google.com/search-console) → 添加资源 → 提交 `https://你的域名/sitemap.xml`
2. [Bing Webmaster](https://www.bing.com/webmasters) → 同样提交 sitemap

绑定自定义域名后，同步更新 `VITE_SITE_URL` 与 `seo.config.json` 中的 `defaultSiteUrl`。

## 主要路由

| 路径 | 页面 | SEO |
|------|------|-----|
| `/` | 落地页 | 索引 |
| `/gallery` | 探索画廊 | 索引 |
| `/workspace` | 工作台 | 索引 |
| `/home` | 功能主页 | noindex |
| `/editor` | 精修编辑器 | noindex |
| `/focus` | 专心拼豆 | noindex |
| `/preview3d` | 3D 预览 | noindex |
| `/projects` | 我的项目 | noindex |
| `/palette` | 自定义色板 | noindex |
| `/text` | 像素文字生成 | noindex |
| `/guide` | 拼豆新手教程 | 索引 |

画廊案例另有静态落地页：`/gallery/demo-cat/` 等。

## 目录结构

```
pindou-web/
├── netlify/
│   ├── functions/          # Netlify Functions（AI 预处理）
│   └── netlify.toml
├── server/
│   ├── ai-preprocess/      # AI 服务端逻辑、提示词、本地 dev-server
│   └── xhs-parse/          # 小红书分享解析、本地 dev-server
├── packages/
│   ├── app-shared/         # 共享 store、工具、平台抽象
│   └── bead-core/          # 已拆至 github.com/whr810012/bead-core
├── public/
├── scripts/                # SEO、预渲染、画廊页、OG 图
├── src/
│   ├── adapters/           # H5 图片加载与 Canvas 渲染
│   ├── components/
│   ├── pages/
│   ├── platform/           # Web 平台 Port 实现
│   ├── router/
│   ├── stores/
│   ├── styles/
│   └── utils/
├── seo.config.json
├── vite.config.ts
└── package.json
```

## 技术要点

- **平台注入**：`src/platform/web.ts` → `initPlatform()`
- **转换管线**：[@wangdandan810012/bead-core](https://www.npmjs.com/package/@wangdandan810012/bead-core) → `convertImageToPattern` → `runPipeline`
- **感知配色**：`@wangdandan810012/bead-core` — CIEDE2000（ΔE2000 色板匹配）
- **智能参数**：`packages/app-shared/src/utils/suggestParams.ts`（照片/卡通识别与一键建议）
- **Canvas 渲染**：`src/adapters/image-web.ts`、`src/components/BeadCanvas.vue`（`imageSmoothingEnabled: false`、像素化 CSS）
- **设计令牌**：`src/styles/tokens.scss`（SCSS 全局注入，`pindou-lighten` / `pindou-darken`）
- **Vite 别名**：`@pindou/app-shared` → `packages/app-shared/src`
- **页面 SEO**：`src/utils/seo.ts` 运行时更新 title / meta / canonical

## 构建产物

```bash
npm run build
# → dist/
```

构建流程：编译共享包 → Playwright 生成 OG 图 → 画廊静态页 → sitemap/robots → Vite 打包 → 注入 SEO meta → Playwright 预渲染关键路由。

## 联系方式

- 邮箱：[1028943406@qq.com](mailto:1028943406@qq.com)
- 微信：www133595

## 致谢

本项目的拼豆算法思路受以下开源项目启发，在此表示感谢：

- [Zippland/perler-beads](https://github.com/Zippland/perler-beads) — 主导色像素化、BFS 区域合并、边界洪水填充背景移除、颜色排除与重映射等核心算法思路
- [liangdabiao/perler-beads-ai](https://github.com/liangdabiao/perler-beads-ai) — AI 图像预处理方案
