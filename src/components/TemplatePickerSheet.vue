<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import { assetUrl } from '@/utils/assetUrl'

interface TemplateItem {
  id: string
  title: string
  thumbnail: string
  image: string
}

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
  close: []
  pick: [imagePath: string]
}>()

const items = ref<TemplateItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(assetUrl('/static/templates/templates.json'))
    const data = (await res.json()) as { items: TemplateItem[] }
    items.value = (data.items ?? []).map((item) => ({
      ...item,
      thumbnail: assetUrl(item.thumbnail),
      image: assetUrl(item.image),
    }))
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})

function onPick(item: TemplateItem) {
  emit('pick', item.image)
  emit('close')
}
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="craft-drawer">
      <h2 class="craft-drawer__title">素材库</h2>
      <p class="craft-hint">选择模板图片，一键进入工作台生成</p>
      <div v-if="loading" class="template-loading">加载中…</div>
      <div v-else class="template-grid">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="template-item"
          @click="onPick(item)"
        >
          <img class="template-item__thumb" :src="item.thumbnail" :alt="item.title" />
          <span class="template-item__label">{{ item.title }}</span>
        </button>
      </div>
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.template-loading {
  padding: 24px;
  text-align: center;
  color: $pindou-text-muted;
  font-size: $pindou-font-sm;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.template-item {
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-sm;
  padding: 8px;
  background: $pindou-bg-card;
  cursor: pointer;
  transition: border-color $pindou-duration-fast, box-shadow $pindou-duration-fast,
    transform $pindou-duration-fast;

  &:hover {
    border-color: rgba($pindou-primary, 0.35);
    box-shadow: $pindou-shadow-sm;
    transform: translateY(-1px);
  }
}

.template-item__thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: $pindou-radius-sm;
  display: block;
  border: 1px solid $pindou-border-light;
}

.template-item__label {
  display: block;
  margin-top: 6px;
  font-size: $pindou-font-xs;
  font-weight: 600;
  text-align: center;
  color: $pindou-text-secondary;
}
</style>
