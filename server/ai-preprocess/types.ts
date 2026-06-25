export type AiPreprocessStyle = 'cartoon' | 'sketch' | 'flat' | 'enhance' | 'matting'

export interface AiPreprocessRequest {
  image: string
  style: string
  apiKey?: string
}

export interface AiPreprocessResponse {
  image?: string
  imageUrl?: string
  error?: string
  mock?: boolean
  prompt?: string
}

export interface HandlerEnv {
  jimengApiKey?: string
  jimengAccessKeyId?: string
  jimengSecretAccessKey?: string
  jimengEndpoint?: string
  jimengModel?: string
  /** visual API req_key，默认 seededit_v3.0（图像生成大模型 SeedEdit 3.0） */
  jimengVisualReqKey?: string
  allowedOrigin?: string
  maxImageBytes?: number
}
