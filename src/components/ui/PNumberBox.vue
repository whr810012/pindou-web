<script setup lang="ts">
const model = defineModel<number>({ default: 0 })
const props = defineProps<{ min?: number; max?: number }>()

function dec() {
  const next = model.value - 1
  if (props.min !== undefined && next < props.min) return
  model.value = next
}

function inc() {
  const next = model.value + 1
  if (props.max !== undefined && next > props.max) return
  model.value = next
}
</script>

<template>
  <div class="p-number">
    <button type="button" aria-label="decrease" @click="dec">-</button>
    <input v-model.number="model" type="number" :min="min" :max="max" />
    <button type="button" aria-label="increase" @click="inc">+</button>
  </div>
</template>

<style scoped lang="scss">
.p-number {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  button {
    width: 28px;
    height: 28px;
    border: 1px solid $pindou-border;
    border-radius: 4px;
    background: $pindou-bg-muted;
    cursor: pointer;
  }

  input {
    width: 48px;
    text-align: center;
    border: 1px solid $pindou-border;
    border-radius: 4px;
    padding: 4px;
  }
}
</style>
