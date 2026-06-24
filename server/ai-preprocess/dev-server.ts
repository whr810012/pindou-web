import http from 'node:http'
import { handleAiPreprocess } from './handler'

const PORT = Number(process.env.AI_PREPROCESS_PORT ?? 8787)

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST' || !req.url?.includes('ai-preprocess')) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not Found' }))
    return
  }

  try {
    const body = await readJson(req)
    const result = await handleAiPreprocess(body, {
      jimengApiKey: process.env.JIMENG_API_KEY,
      jimengAccessKeyId: process.env.JIMENG_ACCESS_KEY_ID,
      jimengSecretAccessKey: process.env.JIMENG_SECRET_ACCESS_KEY,
      jimengEndpoint: process.env.JIMENG_ENDPOINT,
      jimengModel: process.env.JIMENG_MODEL,
      jimengVisualReqKey: process.env.JIMENG_VISUAL_REQ_KEY,
    })

    res.writeHead(result.status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result.body))
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'internal error' }))
  }
})

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `\n端口 ${PORT} 已被占用，AI 后端可能已在运行。\n` +
        `  → 直接访问 http://127.0.0.1:${PORT}/api/ai-preprocess 即可\n` +
        `  → 若要重启：netstat -ano | findstr :${PORT}  然后  taskkill /PID <PID> /F\n`,
    )
    process.exit(1)
  }
  throw error
})

server.listen(PORT, () => {
  console.log(`AI preprocess dev server: http://127.0.0.1:${PORT}/api/ai-preprocess`)
})

function readJson(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}
