<script setup lang="ts">
defineProps<{ text?: string; plain?: boolean; size?: string }>()
</script>

<template>
  <span class="p-tag" :class="{ 'p-tag--plain': plain }">{{ text }}<slot /></span>
</template>

<style scoped lang="scss">
.p-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: $pindou-radius-pill;
  background: $pindou-primary;
  color: #fff;
  font-size: $pindou-font-sm;
  cursor: pointer;

  &--plain {
    background: $pindou-primary-light;
    color: $pindou-primary;
  }
}
</style>
