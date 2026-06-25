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
  background: $pindou-bg-elevated;
  color: $pindou-text;
  font-family: $pindou-font-body;
  font-size: $pindou-font-md;
  font-weight: 600;
  padding: 9px 16px;
  cursor: pointer;
  transition: background $pindou-duration-fast, border-color $pindou-duration-fast,
    transform $pindou-duration-fast, box-shadow $pindou-duration-fast;

  &:hover:not(:disabled) {
    border-color: darken($pindou-border, 6%);
    background: $pindou-bg-card;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.48;
    cursor: not-allowed;
  }

  &--block {
    width: 100%;
  }

  &--primary {
    background: linear-gradient(180deg, lighten($pindou-primary, 4%), $pindou-primary);
    border-color: darken($pindou-primary, 4%);
    color: #fff;
    box-shadow: $pindou-shadow-glow;

    &:hover:not(:disabled) {
      background: linear-gradient(180deg, $pindou-primary, $pindou-primary-dark);
      border-color: $pindou-primary-dark;
    }
  }

  &--text {
    border-color: transparent;
    background: transparent;
    color: $pindou-primary;
    box-shadow: none;

    &:hover:not(:disabled) {
      background: rgba($pindou-primary, 0.06);
    }
  }

  &--success {
    background: $pindou-success;
    border-color: $pindou-success;
    color: #fff;
    box-shadow: none;
  }

  &--error {
    background: #c0392b;
    border-color: #c0392b;
    color: #fff;
    box-shadow: none;
  }

  &--plain {
    background: transparent;
    box-shadow: none;

    &.p-btn--primary {
      color: $pindou-primary;
      border-color: rgba($pindou-primary, 0.35);
      background: rgba($pindou-primary, 0.06);

      &:hover:not(:disabled) {
        background: rgba($pindou-primary, 0.12);
      }
    }

    &.p-btn--error {
      color: #c0392b;
      border-color: rgba(#c0392b, 0.3);
    }
  }

  &--sm {
    font-size: $pindou-font-sm;
    padding: 6px 12px;
    border-radius: 8px;
  }

  &--lg {
    font-size: $pindou-font-lg;
    padding: 13px 22px;
    border-radius: $pindou-radius-md;
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
