# AI 预处理服务（Netlify Functions + BYOK）

二期 AI 预处理：前端将图片与用户的火山引擎凭证发送至 Netlify Function，由服务端转发至即梦图像生成 API。

## 架构

```
浏览器 → /.netlify/functions/ai-preprocess → 火山引擎
         （用户自带凭证，仅存 localStorage）
```

支持两种鉴权：

| 类型 | 产品 | 调用接口 |
|------|------|----------|
| **IAM AccessKey** | [图像生成大模型](https://www.volcengine.com/docs/86081/1804465?lang=zh) | `visual.volcengineapi.com` · `seededit_v3.0` |
| **Ark API Key** | 火山方舟 | `ark.cn-beijing.volces.com` OpenAI 兼容 |

## 用户配置（BYOK）

**推荐（与你提供的文档一致）：IAM AccessKey + 图像生成大模型**

1. 阅读 [能力介绍与计费](https://www.volcengine.com/docs/86081/1804465?lang=zh)，开通「智能绘图」服务
2. 在 [访问控制](https://console.volcengine.com/iam/keymanage) 创建 AccessKey，绑定 **CVFullAccess**
3. 粘贴 `AccessKey.txt` 全文并开始处理

**备选：Ark API Key**（火山方舟，需单独开通）

调用费用由用户自己的火山账号承担。

## 开发者：本地联调

### 方式 A — Canvas Mock（无需后端）

```env
# .env.local
VITE_AI_MOCK=true
```

### 方式 B — 本地 dev-server

```bash
npm run dev:ai
# → http://127.0.0.1:8787/api/ai-preprocess
```

```env
# .env.local
VITE_AI_PREPROCESS_URL=http://127.0.0.1:8787/api/ai-preprocess
```

在 AI 面板粘贴凭证，或于 `.env.local` 配置服务端环境变量：

```env
# IAM AccessKey（图生图 visual API）
JIMENG_ACCESS_KEY_ID=AKLT...
JIMENG_SECRET_ACCESS_KEY=...

# 或 Ark API Key
# JIMENG_API_KEY=...
# JIMENG_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/images/generations
# JIMENG_MODEL=doubao-seedream-4-0
```

开发时可输入 Key `mock` 触发原图透传（不调用火山 API）。

### 方式 C — Netlify Dev

```bash
npx netlify dev
```

## API 契约

**请求** `POST /api/ai-preprocess`

```json
{
  "image": "data:image/jpeg;base64,...",
  "style": "cartoon",
  "apiKey": "用户火山 API Key"
}
```

**响应**

```json
{ "imageUrl": "https://..." }
```

或

```json
{ "image": "data:image/png;base64,..." }
```

**风格** `style`：`cartoon` | `sketch` | `flat` | `enhance`

## Netlify 部署

1. 连接 Git 仓库，构建命令 `npm run build`，发布目录 `dist`
2. 环境变量：

| 变量 | 说明 |
|------|------|
| `VITE_SITE_URL` | 正式站点域名 |
| `VITE_AI_PREPROCESS_URL` | `/.netlify/functions/ai-preprocess`（生产默认可不配，前端 PROD 自动使用） |
| `ALLOWED_ORIGIN` | CORS 允许来源，如 `https://pindou.app`（可选，默认 `*`） |
| `JIMENG_ENDPOINT` | 覆盖默认火山 Endpoint（可选） |
| `JIMENG_MODEL` | 覆盖默认模型 ID（可选） |

**不要**在生产环境配置 `JIMENG_API_KEY`（BYOK 模式由用户提供）。

## 限制

- 图片 base64 解码后 ≤ 4MB（服务端校验）
- 前端上传前自动压缩至最长边 ≤ 1024px
- Netlify Function 同步超时约 10s，大图或慢速 API 可能超时

## 相关文件

- `handler.ts` — 请求校验与路由
- `jimeng.ts` — 火山引擎 API 适配
- `dev-server.ts` — 本地 HTTP 服务
- `netlify/functions/ai-preprocess.ts` — Netlify 入口
