import type { AiPreprocessStyle } from './types'

/** 拼豆预处理共用约束：尽量保留主体，便于后续像素化 */
const BEAD_CONSTRAINT =
  '保持原图主体、构图与人物五官不变，不要添加新物体或文字。输出需适合拼豆图纸：大块纯色、轮廓清晰、颜色种类少、无复杂渐变与噪点。'

export const STYLE_PROMPTS: Record<AiPreprocessStyle, string> = {
  cartoon: [
    BEAD_CONSTRAINT,
    '风格：扁平卡通插画，赛璐璐上色，色块边界明确，颜色控制在约12种以内，轻微描边，适合后续按格拼豆。',
  ].join(' '),
  sketch: [
    BEAD_CONSTRAINT,
    '风格：清晰线稿与色块分界，加粗外轮廓，减少灰阶过渡与皮肤细纹，保留主要形状，像可填色的拼豆底稿。',
  ].join(' '),
  flat: [
    BEAD_CONSTRAINT,
    '风格：海报化扁平设计，大面积纯色填充，去除纹理与复杂阴影，分区色彩对比鲜明，适合手工拼豆配色。',
  ].join(' '),
  enhance: [
    BEAD_CONSTRAINT,
    '风格：适度锐化边缘、提高对比度，压制高频细节与背景杂色，保留可识别的大色块区域，轻微去噪，不要过度风格化。',
  ].join(' '),
}

/** SeedEdit scale：越低越贴近原图，越高越听从提示词 */
export const STYLE_EDIT_SCALE: Record<AiPreprocessStyle, number> = {
  enhance: 0.38,
  sketch: 0.48,
  cartoon: 0.52,
  flat: 0.55,
}

export function styleToPrompt(style: string): string {
  return STYLE_PROMPTS[style as AiPreprocessStyle] ?? STYLE_PROMPTS.cartoon
}

export function styleEditScale(style: string): number {
  return STYLE_EDIT_SCALE[style as AiPreprocessStyle] ?? STYLE_EDIT_SCALE.cartoon
}
