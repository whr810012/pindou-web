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
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: $pindou-space-md;

  @media (min-width: 640px) {
    align-items: center;
  }
}

.p-modal__panel {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  background: $pindou-bg-card;
  border-radius: $pindou-radius-lg $pindou-radius-lg 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (min-width: 640px) {
    border-radius: $pindou-radius-lg;
  }
}

.p-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $pindou-space-md $pindou-space-lg;
  border-bottom: 1px solid $pindou-border;

  h3 {
    margin: 0;
    font-size: $pindou-font-lg;
  }
}

.p-modal__close {
  border: none;
  background: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: $pindou-text-muted;
}

.p-modal__body {
  padding: $pindou-space-lg;
  overflow: auto;
  flex: 1;
}

.p-modal__footer {
  padding: $pindou-space-md $pindou-space-lg;
  border-top: 1px solid $pindou-border;
  display: flex;
  gap: $pindou-space-sm;
  justify-content: flex-end;
}
</style>
