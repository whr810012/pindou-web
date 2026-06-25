import http from 'node:http'
import { loadEnvLocal } from '../loadEnvLocal.js'
import { handleXhsParse } from './handler.js'

loadEnvLocal()

const PORT = Number(process.env.XHS_PARSE_PORT ?? 8788)

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST' || !req.url?.includes('xhs-parse')) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not Found' }))
    return
  }

  try {
    const body = await readJson(req)
    const result = await handleXhsParse(body, {
      mock: process.env.XHS_MOCK === 'true',
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
      `\n端口 ${PORT} 已被占用，小红书解析后端可能已在运行。\n` +
        `  → 直接访问 http://127.0.0.1:${PORT}/api/xhs-parse 即可\n`,
    )
    process.exit(1)
  }
  throw error
})

server.listen(PORT, () => {
  console.log(`XHS parse dev server: http://127.0.0.1:${PORT}/api/xhs-parse`)
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
