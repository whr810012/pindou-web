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
  background: rgba($pindou-border, 0.5);
  border-radius: $pindou-radius-pill;
  overflow: hidden;

  &__bar {
    height: 100%;
    background: linear-gradient(90deg, $pindou-primary 0%, pindou-lighten($pindou-primary, 12%) 100%);
    border-radius: $pindou-radius-pill;
    transition: width $pindou-duration-normal $pindou-ease-out;
  }
}
</style>
