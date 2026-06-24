<script setup lang="ts">
import { ref, watch } from 'vue'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'

const props = defineProps<{
  show: boolean
  name: string
  isUpdate: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [name: string]
}>()

const draftName = ref('')

watch(
  () => props.show,
  (visible) => {
    if (visible) draftName.value = props.name
  },
)

function confirm() {
  const name = draftName.value.trim() || '未命名项目'
  emit('confirm', name)
}
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="sheet">
      <span class="title">{{ isUpdate ? '更新项目' : '保存项目' }}</span>
      <input v-model="draftName" class="input" placeholder="项目名称" />
      <div class="actions">
        <PButton text="取消" @click="emit('close')" />
        <PButton type="primary" :text="isUpdate ? '更新' : '保存'" @click="confirm" />
      </div>
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.sheet {
  width: 300px;
  padding: 20px;
}

.title {
  display: block;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: center;
}

.input {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  margin-bottom: 16px;
}

.actions {
  display: flex;
  gap: 12px;
}
</style>
