<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="p-modal" @click.self="close">
      <div class="p-modal__panel" role="dialog" aria-modal="true">
        <header v-if="title" class="p-modal__header">
          <h3>{{ title }}</h3>
          <button type="button" class="p-modal__close" aria-label="关闭" @click="close">×</button>
        </header>
        <div class="p-modal__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="p-modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.p-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba($pindou-text, 0.42);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: $pindou-space-md;
  animation: modal-fade-in 0.2s $pindou-ease-out both;

  @media (min-width: 640px) {
    align-items: center;
  }
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.p-modal__panel {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  background: $pindou-bg-card;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-lg $pindou-radius-lg 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: $pindou-shadow-dock;
  animation: modal-slide-up 0.28s $pindou-ease-out both;

  @media (min-width: 640px) {
    border-radius: $pindou-radius-lg;
  }
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.p-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $pindou-space-md $pindou-space-lg;
  border-bottom: 1px solid $pindou-border-light;
  background: $pindou-bg-subtle;

  h3 {
    margin: 0;
    font-family: $pindou-font-display;
    font-size: $pindou-font-lg;
    font-weight: 700;
  }
}

.p-modal__close {
  border: none;
  background: $pindou-bg-muted;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: $pindou-text-muted;
  transition: background $pindou-duration-fast;

  &:hover {
    background: darken($pindou-bg-muted, 4%);
    color: $pindou-text;
  }
}

.p-modal__body {
  padding: $pindou-space-lg;
  overflow: auto;
  flex: 1;
}

.p-modal__footer {
  padding: $pindou-space-md $pindou-space-lg;
  border-top: 1px solid $pindou-border-light;
  display: flex;
  gap: $pindou-space-sm;
  justify-content: flex-end;
  background: $pindou-bg-subtle;
}
</style>
