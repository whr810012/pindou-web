import type { Handler } from '@netlify/functions'
import { corsHeaders, handleAiPreprocess } from '../../server/ai-preprocess/handler'

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
    const result = await handleAiPreprocess(body, {
      jimengApiKey: process.env.JIMENG_API_KEY,
      jimengAccessKeyId: process.env.JIMENG_ACCESS_KEY_ID,
      jimengSecretAccessKey: process.env.JIMENG_SECRET_ACCESS_KEY,
      jimengEndpoint: process.env.JIMENG_ENDPOINT,
      jimengModel: process.env.JIMENG_MODEL,
      jimengVisualReqKey: process.env.JIMENG_VISUAL_REQ_KEY,
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
