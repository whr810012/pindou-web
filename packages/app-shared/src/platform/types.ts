export interface StoragePort {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface NavigationPort {
  push(url: string): void
  replace(url: string): void
  back(): void
}

export interface LoadedImage {
  width: number
  height: number
  pixels: Uint8ClampedArray
  previewUrl?: string
}

export interface ImagePickerPort {
  pickImage(): Promise<string>
}

export interface ImageLoaderPort {
  loadFromPath(path: string): Promise<LoadedImage>
}

export interface CodecPort {
  toBase64(str: string): string
  fromBase64(encoded: string): string
}

export interface HttpPort {
  fetchJson<T>(url: string): Promise<T>
}

export interface PlatformPorts {
  storage: StoragePort
  navigation: NavigationPort
  imagePicker: ImagePickerPort
  imageLoader: ImageLoaderPort
  codec: CodecPort
  http: HttpPort
  getMaxGridWidth(): number
}
