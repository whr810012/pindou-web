<script setup lang="ts">
defineProps<{
  scale: number
  panEnabled: boolean
}>()

const emit = defineEmits<{
  zoomIn: []
  zoomOut: []
  reset: []
  togglePan: []
}>()
</script>

<template>
  <div class="bar">
    <div class="group">
      <button type="button" class="btn" title="缩小（滚轮也可缩放）" @click="emit('zoomOut')">−</button>
      <span class="scale">{{ Math.round(scale * 100) }}%</span>
      <button type="button" class="btn" title="放大" @click="emit('zoomIn')">+</button>
    </div>
    <button type="button" class="btn text" title="恢复默认缩放与位置" @click="emit('reset')">复位</button>
    <button
      type="button"
      class="btn text"
      :class="{ active: panEnabled }"
      :title="panEnabled ? '当前可拖动画布，再次点击退出' : '开启后拖动画布查看，不会绘制'"
      @click="emit('togglePan')"
    >
      {{ panEnabled ? '平移中' : '平移' }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.bar {
  display: flex;
  align-items: center;
  gap: $pindou-space-sm;
  padding: $pindou-space-sm 10px;
  background: $pindou-bg-card;
  border-radius: 10px;
  margin-bottom: $pindou-space-sm;
  box-shadow: $pindou-shadow-sm;
}

.group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn {
  min-width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border: none;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-muted;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn.text {
  font-size: $pindou-font-sm;
  font-weight: 500;
  padding: 0 10px;
}

.btn.active {
  background: $pindou-primary;
  color: #fff;
}

.scale {
  min-width: 44px;
  text-align: center;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
}
</style>
