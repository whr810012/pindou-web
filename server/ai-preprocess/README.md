# AI 预处理服务（Netlify Functions + BYOK）

二期 AI 预处理：前端将图片与用户的火山引擎凭证发送至 Netlify Function，由服务端转发至图像生成 API，返回优化后的图片供像素化使用。

## 架构

```
浏览器 → /.netlify/functions/ai-preprocess → 火山引擎
         （用户自带凭证，仅存 localStorage）
```

支持两种鉴权：

| 类型 | 产品 | 调用接口 | 推荐 |
|------|------|----------|------|
| **IAM AccessKey** | [图像生成大模型](https://www.volcengine.com/docs/86081/1804465?lang=zh) | `visual.volcengineapi.com` · `seededit_v3.0` | ✅ 推荐 |
| **Ark API Key** | [火山方舟](https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey) | `ark.cn-beijing.volces.com` OpenAI 兼容 | 备选 |

## 预处理风格与提示词

风格定义见 `prompts.ts`。所有风格均强调：**保持原图主体与构图、大块纯色、轮廓清晰、适合拼豆像素化**。

| `style` | 面板名称 | 说明 | SeedEdit scale | 推荐场景 |
|---------|----------|------|----------------|----------|
| `enhance` | 清晰增强 | 锐化边缘、压制细节，最贴近原图 | 0.38 | 真人照片 |
| `sketch` | 线稿强化 | 加粗轮廓与色块分界 | 0.48 | 需要清晰填色边界 |
| `cartoon` | 卡通扁平 | 赛璐璐大色块，约 12 色以内 | 0.52 | 插画、可爱图案 |
| `flat` | 色块简化 | 海报化扁平，颜色更少 | 0.55 | 极简、海报风 |

scale 越低越贴近原图，越高越听从提示词（火山 SeedEdit 参数）。

## 用户配置（BYOK）

### 推荐：IAM AccessKey + 图像生成大模型

1. 阅读 [能力介绍与计费](https://www.volcengine.com/docs/86081/1804465?lang=zh)，[开通服务](https://www.volcengine.com/docs/86081/1660346?lang=zh)
2. 在 [访问控制](https://console.volcengine.com/iam/keymanage) 创建 AccessKey（建议开通服务后新建）
3. 为 AK 所属用户绑定 **`CVFullAccess`**（全局）
4. 在 Pindou「AI 预处理」点「清除」后，**只粘贴一份** `AccessKey.txt` 全文（两行，勿叠贴旧密钥）

### 备选：Ark API Key

在方舟控制台创建 API Key，粘贴单行密钥。与图像生成大模型为不同产品线，需单独开通。

调用费用由用户自己的火山账号承担。

## 凭证格式

`credentials.ts` 支持解析：

- `AccessKey.txt`（`AccessKeyId` + `SecretAccessKey` 两行）
- `ApiKey.txt`（`API Key: ...` 或单行 Ark Key）
- `AKLT...:Secret` 单行
- 多组 `SecretAccessKey` 误粘在同一行时自动拆分（取第一组）

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

# IAM AccessKey（推荐）
JIMENG_ACCESS_KEY_ID=AKLT...
JIMENG_SECRET_ACCESS_KEY=...
# JIMENG_VISUAL_REQ_KEY=seededit_v3.0

# 或 Ark API Key
# JIMENG_API_KEY=...
# JIMENG_MODEL=doubao-seedream-4-0-250828
```

在 AI 面板粘贴凭证，或依赖上述服务端环境变量。输入 `mock` 可触发原图透传。

### 方式 C — Netlify Dev

```bash
npx netlify dev
```

## API 契约

**请求** `POST /api/ai-preprocess`

```json
{
  "image": "data:image/jpeg;base64,...",
  "style": "enhance",
  "apiKey": "AccessKey.txt 全文或 Ark API Key"
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

`netlify.toml` 已配置：

- `/api/ai-preprocess` → `ai-preprocess` Function 别名
- `ai-preprocess` Function `timeout = 26`（Pro 计划）

环境变量：

| 变量 | 说明 |
|------|------|
| `VITE_SITE_URL` | 正式站点域名 |
| `ALLOWED_ORIGIN` | CORS 允许来源（可选，默认 `*`） |
| `JIMENG_VISUAL_REQ_KEY` | 覆盖 visual `req_key`（默认 `seededit_v3.0`） |
| `JIMENG_ENDPOINT` | 覆盖 Ark Endpoint（可选） |
| `JIMENG_MODEL` | 覆盖 Ark 模型 ID（可选） |

**不要**在生产环境配置 `JIMENG_ACCESS_KEY_ID` / `JIMENG_API_KEY`（BYOK 由用户提供）。

## 限制与排错

| 现象 | 可能原因 |
|------|----------|
| Access Denied | 未开通图像生成大模型 / 未绑 `CVFullAccess` / AK 在开通前创建 |
| 签名错误 | `SecretAccessKey` 粘错、多组密钥混在一行 |
| API Key 401 | 使用了 Ark Key 但未开通方舟图生图 |
| 504 超时 | Netlify 免费版 Function 约 10s 上限，图生图较慢 |

其他限制：

- 图片 base64 解码后 ≤ 4MB（服务端校验）
- 前端上传前自动压缩至最长边 ≤ 1024px

## 测试

```bash
npm run test:ai
```

覆盖凭证解析、handler 路由、提示词约束。

## 相关文件

| 文件 | 说明 |
|------|------|
| `handler.ts` | 请求校验与路由 |
| `credentials.ts` | 凭证解析与校验 |
| `prompts.ts` | 风格提示词与 scale |
| `jimeng.ts` | 火山 API 路由（Ark / visual） |
| `jimengVisual.ts` | 图像生成大模型 visual API |
| `dev-server.ts` | 本地 HTTP 服务 |
| `netlify/functions/ai-preprocess.ts` | Netlify 入口 |
