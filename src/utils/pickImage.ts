const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function isImageFile(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) return true
  return file.type.startsWith('image/')
}

export function loadImageFromFile(file: File): string {
  if (!isImageFile(file)) {
    throw new Error('请选择图片文件（JPG / PNG / WebP）')
  }
  return URL.createObjectURL(file)
}

export function pickImageFileFromClipboard(items: DataTransferItemList): File | null {
  for (const item of items) {
    if (item.kind !== 'file') continue
    const file = item.getAsFile()
    if (file && isImageFile(file)) return file
  }
  return null
}
