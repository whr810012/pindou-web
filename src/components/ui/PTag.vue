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
  padding: 6px 12px;
  border-radius: $pindou-radius-pill;
  background: $pindou-primary;
  color: #fff;
  font-size: $pindou-font-sm;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background $pindou-duration-fast, border-color $pindou-duration-fast,
    transform $pindou-duration-fast;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &--plain {
    background: $pindou-bg-subtle;
    border-color: $pindou-border;
    color: $pindou-text-secondary;

    &:hover {
      border-color: rgba($pindou-primary, 0.3);
      color: $pindou-primary;
      background: rgba($pindou-primary, 0.06);
    }
  }
}
</style>
