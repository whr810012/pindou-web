import type { PlatformPorts } from './types.js'

let platform: PlatformPorts | null = null

export function initPlatform(ports: PlatformPorts): void {
  platform = ports
}

export function getPlatform(): PlatformPorts {
  if (!platform) {
    throw new Error('@pindou/app-shared: platform not initialized. Call initPlatform() first.')
  }
  return platform
}
