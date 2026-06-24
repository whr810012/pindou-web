/** 裁剪视口与导出共用的坐标换算，保证「所见即所得」 */

export function baseFitScale(imgW: number, imgH: number, viewport: number): number {
  if (imgW <= 0 || imgH <= 0) return 1
  return Math.min(viewport / imgW, viewport / imgH)
}

export function displayScale(imgW: number, imgH: number, viewport: number, userScale: number): number {
  return baseFitScale(imgW, imgH, viewport) * userScale
}

export function drawCropToCanvas(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  imgW: number,
  imgH: number,
  userScale: number,
  offX: number,
  offY: number,
  viewport: number,
  outSize: number,
) {
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, outSize, outSize)

  const scale = displayScale(imgW, imgH, viewport, userScale)
  const ratio = outSize / viewport
  const drawW = imgW * scale * ratio
  const drawH = imgH * scale * ratio
  const x = (outSize - drawW) / 2 + offX * ratio
  const y = (outSize - drawH) / 2 + offY * ratio
  ctx.drawImage(img, x, y, drawW, drawH)
}

export function previewImageStyle(
  imgW: number,
  imgH: number,
  userScale: number,
  offX: number,
  offY: number,
  viewport: number,
): Record<string, string> {
  const scale = displayScale(imgW, imgH, viewport, userScale)
  const w = imgW * scale
  const h = imgH * scale
  return {
    width: `${w}px`,
    height: `${h}px`,
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: `${-w / 2 + offX}px`,
    marginTop: `${-h / 2 + offY}px`,
  }
}
