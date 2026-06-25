import type { Handler } from '@netlify/functions'
import { corsHeaders, handleXhsParse } from '../../server/xhs-parse/handler.js'

function resolveAllowedOrigin(requestOrigin: string | undefined): string {
  const configured = process.env.ALLOWED_ORIGIN?.trim()
  if (!configured || configured === '*') return '*'
  if (requestOrigin && configured.split(',').map((s) => s.trim()).includes(requestOrigin)) {
    return requestOrigin
  }
  return configured.split(',')[0]?.trim() || '*'
}

export const handler: Handler = async (event) => {
  const allowedOrigin = resolveAllowedOrigin(event.headers.origin)

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(allowedOrigin) }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(allowedOrigin),
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const result = await handleXhsParse(body, {
      mock: process.env.XHS_MOCK === 'true',
      allowedOrigin,
    })

    return {
      statusCode: result.status,
      headers: corsHeaders(allowedOrigin),
      body: JSON.stringify(result.body),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders(allowedOrigin),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'internal error',
      }),
    }
  }
}
