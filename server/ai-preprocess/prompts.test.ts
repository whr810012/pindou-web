import { describe, expect, it } from 'vitest'
import { STYLE_EDIT_SCALE, styleEditScale, styleToPrompt } from './prompts'

describe('styleToPrompt', () => {
  it('includes bead constraints for cartoon', () => {
    const prompt = styleToPrompt('cartoon')
    expect(prompt).toContain('拼豆')
    expect(prompt).toContain('保持原图主体')
  })

  it('uses lower scale for enhance to preserve original', () => {
    expect(styleEditScale('enhance')).toBeLessThan(styleEditScale('flat'))
    expect(STYLE_EDIT_SCALE.enhance).toBe(0.38)
  })
})
