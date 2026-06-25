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
    width: 46px;
    height: 26px;
    border-radius: $pindou-radius-pill;
    background: $pindou-bg-muted;
    border: 1px solid $pindou-border;
    position: relative;
    transition: background $pindou-duration-fast, border-color $pindou-duration-fast;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      transition: transform $pindou-duration-normal $pindou-ease-out;
    }
  }

  input:checked + .p-switch__track {
    background: $pindou-primary;
    border-color: darken($pindou-primary, 6%);

    &::after {
      transform: translateX(20px);
    }
  }
}
</style>
