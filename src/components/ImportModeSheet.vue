<script setup lang="ts">
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  choose: [mode: 'direct' | 'bead-prep']
}>()
</script>

<template>
  <PDrawer :model-value="show" title="选择生成方式" @update:model-value="emit('close')">
    <p class="import-mode__lead">
      照片细节多时，直接用原图生成往往需要很高格数才不易失真。拼豆专用图会把照片简化为大色块、少渐变的参考图（类似 AI 卡通扁平预处理），再用较低格数快速出建议图纸。
    </p>

    <div class="import-mode__options">
      <button type="button" class="import-mode__card" @click="emit('choose', 'direct')">
        <span class="import-mode__badge import-mode__badge--primary">方式一</span>
        <strong>直接生成图纸</strong>
        <p>用裁剪后的原图直接像素化，细节保留更多，适合愿意提高格数的场景。</p>
      </button>

      <button type="button" class="import-mode__card import-mode__card--accent" @click="emit('choose', 'bead-prep')">
        <span class="import-mode__badge">方式二 · 推荐</span>
        <strong>先生成拼豆专用图，再生成图纸</strong>
        <p>简化为大色块参考图（非图纸），再交给正式管线匹配色板并生成建议图纸。</p>
      </button>
    </div>

    <template #footer>
      <PButton block plain text="取消" @click="emit('close')" />
    </template>
  </PDrawer>
</template>

<style scoped lang="scss">
.import-mode__lead {
  margin: 0 0 16px;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
  line-height: 1.65;
}

.import-mode__options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.import-mode__card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-md;
  background: $pindou-bg-subtle;
  text-align: left;
  cursor: pointer;
  transition:
    border-color $pindou-duration-fast,
    box-shadow $pindou-duration-fast,
    transform $pindou-duration-fast;

  strong {
    font-size: $pindou-font-md;
    color: $pindou-text;
    line-height: 1.4;
  }

  p {
    margin: 0;
    font-size: $pindou-font-sm;
    color: $pindou-text-muted;
    line-height: 1.6;
  }

  &:hover {
    border-color: rgba($pindou-primary, 0.28);
    box-shadow: $pindou-shadow-sm;
    transform: translateY(-1px);
  }

  &--accent {
    background: rgba($pindou-primary, 0.05);
    border-color: rgba($pindou-primary, 0.18);
  }
}

.import-mode__badge {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-accent, 0.12);
  color: $pindou-accent;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;

  &--primary {
    background: rgba($pindou-primary, 0.1);
    color: $pindou-primary;
  }
}
</style>
