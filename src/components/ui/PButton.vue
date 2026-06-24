<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    type?: 'primary' | 'default' | 'text' | 'success' | 'error'
    size?: 'sm' | 'md' | 'lg' | 'small' | 'mini'
    block?: boolean
    disabled?: boolean
    loading?: boolean
    plain?: boolean
    text?: string
  }>(),
  { type: 'default', size: 'md', block: false, disabled: false, loading: false, plain: false },
)

const sizeClass = computed(() => {
  if (props.size === 'sm' || props.size === 'small' || props.size === 'mini') return 'sm'
  if (props.size === 'lg') return 'lg'
  return 'md'
})
</script>

<template>
  <button
    class="p-btn"
    :class="[
      `p-btn--${type}`,
      `p-btn--${sizeClass}`,
      { 'p-btn--block': block, 'p-btn--plain': plain },
    ]"
    :disabled="disabled || loading"
    type="button"
  >
    <span v-if="loading" class="p-btn__spinner" />
    <slot>{{ text }}</slot>
  </button>
</template>

<style scoped lang="scss">
.p-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-card;
  color: $pindou-text;
  font-size: $pindou-font-md;
  font-weight: 500;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;

  &:hover:not(:disabled) {
    filter: brightness(0.98);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--block {
    width: 100%;
  }

  &--primary {
    background: $pindou-primary;
    border-color: $pindou-primary;
    color: #fff;

    &:hover:not(:disabled) {
      background: $pindou-primary-dark;
      border-color: $pindou-primary-dark;
    }
  }

  &--text {
    border-color: transparent;
    background: transparent;
    color: $pindou-primary;
  }

  &--success {
    background: $pindou-success;
    border-color: $pindou-success;
    color: #fff;
  }

  &--error {
    background: #e74c3c;
    border-color: #e74c3c;
    color: #fff;
  }

  &--plain {
    background: transparent;

    &.p-btn--primary {
      color: $pindou-primary;
      background: transparent;
    }

    &.p-btn--error {
      color: #e74c3c;
      background: transparent;
    }
  }

  &--sm {
    font-size: $pindou-font-sm;
    padding: 4px 10px;
  }

  &--lg {
    font-size: $pindou-font-lg;
    padding: 12px 18px;
  }
}

.p-btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
