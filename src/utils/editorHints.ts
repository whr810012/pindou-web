import type { EditorTool } from '@/types/app'

export const EDITOR_TOOL_META: Record<
  EditorTool,
  { icon: string; label: string; hint: string; shortcut?: string }
> = {
  brush: {
    icon: '✏️',
    label: '画笔',
    hint: '先在下方色板选色，再点击或拖动格子绘制',
    shortcut: 'B',
  },
  fill: {
    icon: '🪣',
    label: '填充',
    hint: '点击相连的同色区域，一键替换为当前色',
    shortcut: 'F',
  },
  rect: {
    icon: '▢',
    label: '框选',
    hint: '在画布上拖动框出矩形，松手后用当前色填充',
    shortcut: 'M',
  },
  eraser: {
    icon: '🧹',
    label: '橡皮',
    hint: '点击或拖动擦除格子，变为灰色空白（不计入用豆）',
    shortcut: 'E',
  },
  picker: {
    icon: '🎯',
    label: '吸色',
    hint: '点击图纸上的格子，吸取色号到色板',
    shortcut: 'I',
  },
  replace: {
    icon: '🔄',
    label: '换色',
    hint: '先点图纸上的旧色，再选新色，最后点一下完成全图替换',
    shortcut: 'R',
  },
}
