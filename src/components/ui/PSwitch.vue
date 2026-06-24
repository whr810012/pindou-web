<script setup lang="ts">
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="p-switch">
    <input v-model="model" type="checkbox" />
    <span class="p-switch__track" />
  </label>
</template>

<style scoped lang="scss">
.p-switch {
  display: inline-flex;
  cursor: pointer;

  input {
    display: none;
  }

  &__track {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: #ccc;
    position: relative;
    transition: background 0.2s;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.2s;
    }
  }

  input:checked + .p-switch__track {
    background: $pindou-primary;

    &::after {
      transform: translateX(20px);
    }
  }
}
</style>
