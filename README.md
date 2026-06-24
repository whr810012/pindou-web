# Pindou Web

Pindou 拼豆工具 — **Web 端**（Vue 3 + Vite），独立仓库版本。

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
| `npm run build` | 生产构建（含共享包编译、SEO / 预渲染） |
| `npm run build:packages` | 仅编译 `packages/bead-core` 与 `packages/app-shared` |
| `npm run preview` | 预览 `dist` |
| `npm run type-check` | `vue-tsc` 类型检查 |
| `npm run generate:palette` | 生成色板数据 |

## 环境变量

在项目根目录创建 `.env.local`：

```env
VITE_SITE_URL=https://your-domain.com
VITE_AI_MOCK=true
# VITE_AI_PREPROCESS_URL=http://127.0.0.1:8787/api/ai-preprocess
```

## 主要路由

| 路径 | 页面 |
|------|------|
| `/` | 落地页 |
| `/home` | 功能主页 |
| `/workspace` | 工作台 |
| `/editor` | 精修编辑器 |
| `/focus` | 专心拼豆 |
| `/preview3d` | 3D 预览 |
| `/projects` | 我的项目 |
| `/gallery` | 探索画廊 |
| `/palette` | 自定义色板 |

## 目录结构

```
pindou-web/
├── packages/
│   ├── app-shared/     # 共享 store、工具、平台抽象
│   └── bead-core/      # 像素化、填充等核心算法
├── public/
├── scripts/            # SEO、预渲染、画廊页、OG 图
├── src/
│   ├── adapters/       # H5 图片加载与 Canvas 渲染
│   ├── components/
│   ├── pages/
│   ├── platform/       # Web 平台 Port 实现
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
- **Canvas 渲染**：`src/adapters/image-web.ts`、`src/components/BeadCanvas.vue`
- **设计令牌**：`src/styles/tokens.scss`（SCSS 全局注入）
- **Vite 别名**：`@pindou/app-shared`、`@pindou/bead-core` 指向 `packages/*/src`

## 构建产物

```bash
npm run build
# → dist/
```

构建流程：编译共享包 → 生成 OG 图 / 画廊页 → Vite 打包 → 注入 SEO meta → Playwright 预渲染。

## 致谢

本项目的拼豆算法思路受以下开源项目启发，在此表示感谢：

- [Zippland/perler-beads](https://github.com/Zippland/perler-beads) — 主导色像素化、BFS 区域合并、边界洪水填充背景移除、颜色排除与重映射等核心算法思路
- [liangdabiao/perler-beads-ai](https://github.com/liangdabiao/perler-beads-ai) — AI 图像预处理方案
