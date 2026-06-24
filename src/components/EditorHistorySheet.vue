<script setup lang="ts">
import { computed } from 'vue'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import { useEditorStore } from '@/stores/editor'

defineProps<{ show: boolean }>()

const emit = defineEmits<{
  close: []
  jump: [index: number]
  clear: []
}>()

const editor = useEditorStore()

const steps = computed(() => {
  const items = editor.historySteps.map((step) => ({
    ...step,
    time: formatTime(step.at),
  }))
  items.push({
    index: editor.history.length,
    at: Date.now(),
    label: '当前',
    time: '现在',
  })
  return items
})

function formatTime(ts: number) {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}
</script>

<template>
  <PDrawer :model-value="show" title="编辑历史" @update:model-value="(v) => !v && emit('close')">
    <div class="header">
      <span class="title">编辑历史（{{ editor.snapshotCount }} 步）</span>
      <PButton size="sm" plain text="清空" @click="emit('clear')" />
    </div>
    <p class="hint">点击任一步骤可回退到该状态</p>
    <div class="list">
      <div
        v-for="step in steps"
        :key="step.index"
        class="row"
        :class="{ current: step.label === '当前' }"
        @click="emit('jump', step.index)"
      >
        <span class="label">{{ step.label }}</span>
        <span class="time">{{ step.time }}</span>
      </div>
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.title {
  font-weight: 600;
}

.hint {
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
}

.list {
  max-height: 50vh;
  overflow: auto;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.row.current {
  background: #f0f7ff;
}

.label {
  font-size: 14px;
}

.time {
  font-size: 12px;
  color: #999;
}
</style>
