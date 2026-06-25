<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="p-cell">
    <span class="p-cell__title">{{ title }}</span>
    <div class="p-cell__value"><slot name="value" /><slot /></div>
  </div>
</template>

<style scoped lang="scss">
.p-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid $pindou-border-light;

  &:last-child {
    border-bottom: none;
  }

  &__title {
    font-size: $pindou-font-md;
    font-weight: 600;
    color: $pindou-text;
    flex-shrink: 0;
  }

  &__value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }
}
</style>
