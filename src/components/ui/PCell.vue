<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="p-cell">
    <span class="p-cell__title">{{ title }}</span>
    <div class="p-cell__value"><slot /></div>
  </div>
</template>

<style scoped lang="scss">
.p-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid $pindou-border-light;

  &__title {
    font-size: $pindou-font-md;
    color: $pindou-text;
  }

  &__value {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
