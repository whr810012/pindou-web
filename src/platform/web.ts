import type { Router } from 'vue-router'
import type { PlatformPorts } from '@pindou/app-shared'
import { h5ImageAdapter } from '@/adapters/image-web'
import { MAX_GRID_WIDTH } from '@/adapters/types'

export function createWebPlatform(router: Router): PlatformPorts {
  const storage: PlatformPorts['storage'] = {
    getItem(key) {
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem(key, value) {
      try {
        localStorage.setItem(key, value)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'storage write failed'
        throw new Error(message)
      }
    },
    removeItem(key) {
      localStorage.removeItem(key)
    },
  }

  const navigation: PlatformPorts['navigation'] = {
    push(url) {
      router.push(url)
    },
    replace(url) {
      router.replace(url)
    },
    back() {
      router.back()
    },
  }

  const imagePicker: PlatformPorts['imagePicker'] = {
    async pickImage() {
      return new Promise((resolve, reject) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/jpeg,image/png,image/webp,image/gif'
        input.onchange = () => {
          const file = input.files?.[0]
          if (!file) {
            reject(new Error('未选择图片'))
            return
          }
          resolve(URL.createObjectURL(file))
        }
        input.click()
      })
    },
  }

  const imageLoader: PlatformPorts['imageLoader'] = {
    async loadFromPath(path) {
      const loaded = await h5ImageAdapter.loadFromPath(path)
      return {
        width: loaded.width,
        height: loaded.height,
        pixels: loaded.pixels,
        previewUrl: path,
      }
    },
  }

  const codec: PlatformPorts['codec'] = {
    toBase64(str) {
      return btoa(unescape(encodeURIComponent(str)))
    },
    fromBase64(encoded) {
      return decodeURIComponent(escape(atob(encoded)))
    },
  }

  const http: PlatformPorts['http'] = {
    async fetchJson<T>(url: string): Promise<T> {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as Promise<T>
    },
  }

  return {
    storage,
    navigation,
    imagePicker,
    imageLoader,
    codec,
    http,
    getMaxGridWidth: () => MAX_GRID_WIDTH,
  }
}
