<script setup lang="ts">
import { ref, watch } from 'vue'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'

const props = defineProps<{
  show: boolean
  name: string
  isUpdate: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [name: string]
  share: []
}>()

const draftName = ref('')

watch(
  () => props.show,
  (visible) => {
    if (visible) draftName.value = props.name
  },
)

function confirm() {
  if (props.loading) return
  const name = draftName.value.trim() || '未命名项目'
  emit('confirm', name)
}
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="craft-drawer save-sheet">
      <span class="craft-drawer__title">{{ isUpdate ? '更新项目' : '保存项目' }}</span>
      <p class="craft-hint save-sheet__hint">保存后可在顶部「项目」中查看，数据存在本机浏览器。</p>

      <label class="craft-field">
        <span class="craft-field__label">项目名称</span>
        <input v-model="draftName" class="craft-input" placeholder="未命名项目" />
      </label>

      <div class="save-sheet__share">
        <span class="craft-label">分享给他人</span>
        <p class="craft-hint">保存后可复制分享码，对方在「项目」页导入。</p>
        <PButton plain size="sm" text="复制分享码" @click="emit('share')" />
      </div>

      <div class="save-sheet__actions">
        <PButton text="取消" :disabled="loading" @click="emit('close')" />
        <PButton
          type="primary"
          :text="loading ? '保存中…' : isUpdate ? '更新' : '保存'"
          :loading="loading"
          :disabled="loading"
          @click="confirm"
        />
      </div>
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.save-sheet {
  width: min(100%, 320px);
}

.save-sheet__hint {
  margin: -8px 0 16px;
  text-align: center;
}

.save-sheet__share {
  margin: 20px 0;
  padding: 14px;
  border-radius: $pindou-radius-sm;
  background: rgba($pindou-primary-light, 0.55);
  border: 1px solid rgba($pindou-primary, 0.12);

  .craft-label {
    margin-bottom: 4px;
  }

  .craft-hint {
    margin-bottom: 10px;
  }
}

.save-sheet__actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
</style>
