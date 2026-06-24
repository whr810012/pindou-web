<script setup lang="ts">
import type { EditorTool } from '@/types/app'
import { EDITOR_TOOL_META } from '@/utils/editorHints'

defineProps<{
  tool: EditorTool
  canUndo?: boolean
  canRedo?: boolean
  historyCount?: number
}>()

const emit = defineEmits<{
  change: [tool: EditorTool]
  undo: []
  redo: []
  history: []
}>()

const tools = Object.entries(EDITOR_TOOL_META).map(([key, meta]) => ({
  key: key as EditorTool,
  ...meta,
}))
</script>

<template>
  <div class="toolbar">
    <div class="tool-row">
      <button
        v-for="item in tools"
        :key="item.key"
        type="button"
        class="tool"
        :class="{ active: tool === item.key }"
        :title="`${item.label}（${item.shortcut}）— ${item.hint}`"
        @click="emit('change', item.key)"
      >
        <span class="tool-icon">{{ item.icon }}</span>
        <span class="tool-label">{{ item.label }}</span>
      </button>
    </div>
    <div class="history-row">
      <button
        type="button"
        class="tool tool--sm"
        :class="{ disabled: !canUndo }"
        title="撤销（Ctrl+Z）"
        @click="canUndo && emit('undo')"
      >
        ↩ 撤销
      </button>
      <button
        type="button"
        class="tool tool--sm"
        :class="{ disabled: !canRedo }"
        title="重做（Ctrl+Y）"
        @click="canRedo && emit('redo')"
      >
        ↪ 重做
      </button>
      <button type="button" class="tool tool--sm" title="查看编辑历史" @click="emit('history')">
        历史{{ historyCount ? ` (${historyCount})` : '' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  position: fixed;
  left: $pindou-space-md;
  right: $pindou-space-md;
  bottom: calc(#{$pindou-space-lg} + var(--pindou-safe-bottom, 0px));
  background: rgba(255, 255, 255, 0.97);
  border-radius: $pindou-radius-md;
  padding: $pindou-space-sm;
  box-shadow: $pindou-shadow-md;
  z-index: 100;
}

.tool-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.history-row {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 48px;
  padding: 6px 4px;
  border: none;
  border-radius: $pindou-radius-sm;
  font-size: $pindou-font-sm;
  background: $pindou-bg-muted;
  color: $pindou-text;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tool--sm {
  flex: 1;
  flex-direction: row;
  min-height: 36px;
  font-size: $pindou-font-xs;
}

.tool-icon {
  font-size: 16px;
  line-height: 1;
}

.tool-label {
  font-size: 11px;
  line-height: 1.2;
}

.tool.active {
  background: $pindou-primary;
  color: #fff;
}

.tool.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
