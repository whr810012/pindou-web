# 小红书分享解析（Netlify Functions）

三期 Wave 2.5：用户粘贴小红书分享文案或短链，由服务端解析笔记图集并代理下载，前端选图后进入拼豆工作台。

## 为何需要后端

浏览器无法跨域请求 `xhslink.com` / 笔记页；`xhscdn` 图片有 Referer/CORS 限制，无法直接画入 Canvas。因此采用与 AI 预处理相同的 **Netlify Function 代理** 模式。

## 架构

```
浏览器 → /.netlify/functions/xhs-parse → 小红书 / xhscdn
```

## 本地开发

```bash
npm run dev:xhs
# 默认 http://127.0.0.1:8788/api/xhs-parse
```

`.env.local`：

```env
VITE_XHS_PARSE_URL=http://127.0.0.1:8788/api/xhs-parse
# 可选：XHS_MOCK=true 返回 mock 图片，无需真实请求小红书
```

## API

`POST /api/xhs-parse`

```json
{ "text": "分享文案或链接…" }
```

成功响应：

```json
{
  "images": [
    { "id": "0", "preview": "data:image/jpeg;base64,…", "dataUrl": "data:image/jpeg;base64,…" }
  ]
}
```

## 安全

- SSRF 防护：仅允许 `xiaohongshu.com`、`xhslink.com`、`*.xhscdn.com`
- 单图大小上限 4MB（与 AI 预处理一致）
- UI 明示：解析时链接与图片经本站 Function 转发，仅供个人学习创作

## 稳定性

小红书页面结构变更可能导致解析失败。当前解析器会：

- 同时尝试 `discovery/item` 与 `explore` 链接（保留 `xsec_token`）
- 桌面端与移动端 UA 各抓取一次
- 从 `__INITIAL_STATE__`、`__SETUP_SERVER_STATE__`、JSON-LD、meta、转义 CDN 字符串中提取图片

失败时请用户手动保存图片后上传。

## 测试

```bash
npm run test:xhs
```
