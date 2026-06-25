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
    <button type="button" aria-label="减少" @click="dec">−</button>
    <input v-model.number="model" type="number" :min="min" :max="max" />
    <button type="button" aria-label="增加" @click="inc">+</button>
  </div>
</template>

<style scoped lang="scss">
.p-number {
  display: inline-flex;
  align-items: center;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-sm;
  overflow: hidden;
  background: $pindou-bg-subtle;

  button {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: $pindou-primary;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: background $pindou-duration-fast;

    &:hover {
      background: rgba($pindou-primary, 0.08);
    }
  }

  input {
    width: 44px;
    text-align: center;
    border: none;
    border-left: 1px solid $pindou-border-light;
    border-right: 1px solid $pindou-border-light;
    background: #fff;
    padding: 6px 4px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
}
</style>
