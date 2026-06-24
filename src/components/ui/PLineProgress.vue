<script setup lang="ts">
defineProps<{ percentage?: number; height?: number }>()
</script>

<template>
  <div class="p-progress" :style="{ height: `${height ?? 8}px` }">
    <div class="p-progress__bar" :style="{ width: `${Math.min(100, percentage ?? 0)}%` }" />
  </div>
</template>

<style scoped lang="scss">
.p-progress {
  width: 100%;
  background: $pindou-border-light;
  border-radius: 999px;
  overflow: hidden;

  &__bar {
    height: 100%;
    background: $pindou-primary;
    transition: width 0.2s;
  }
}
</style>
