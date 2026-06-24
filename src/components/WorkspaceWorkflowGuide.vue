<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PButton from '@/components/ui/PButton.vue'

defineProps<{
  hasGrid: boolean
}>()

const emit = defineEmits<{
  pickImage: []
  goEditor: []
  openSettings: []
}>()

const dismissed = ref(false)
const STORAGE_KEY = 'pindou.workspace.guide.dismissed'

onMounted(() => {
  dismissed.value = localStorage.getItem(STORAGE_KEY) === '1'
})

function dismiss() {
  dismissed.value = true
  localStorage.setItem(STORAGE_KEY, '1')
}
</script>

<template>
  <div v-if="!dismissed" class="workflow card card--flat">
    <div class="workflow-head">
      <span class="workflow-title">{{ hasGrid ? '接下来可以这样做' : '三步做出拼豆图纸' }}</span>
      <button type="button" class="dismiss" @click="dismiss">知道了</button>
    </div>

    <ol v-if="!hasGrid" class="steps">
      <li>
        <strong>上传图片</strong>
        <span>支持 JPG / PNG，在浏览器本地处理</span>
      </li>
      <li>
        <strong>裁剪构图</strong>
        <span>框选主体区域，决定图纸比例</span>
      </li>
      <li>
        <strong>自动生成</strong>
        <span>系统映射拼豆色号，可再精修</span>
      </li>
    </ol>

    <ol v-else class="steps">
      <li>
        <strong>调参数</strong>
        <span>格数越大细节越多；可点「对比」看与原图差异</span>
        <button type="button" class="link" @click="emit('openSettings')">打开参数 ›</button>
      </li>
      <li>
        <strong>精修图纸</strong>
        <span>用画笔、填充、换色等工具修改单个格子</span>
        <PButton size="mini" type="primary" text="进入精修" @click="emit('goEditor')" />
      </li>
      <li>
        <strong>导出 / 拼豆</strong>
        <span>导出带色号图纸，或进入「专心拼豆」按格打勾</span>
      </li>
    </ol>

    <div v-if="!hasGrid" class="workflow-actions">
      <PButton type="primary" size="small" text="选择图片" @click="emit('pickImage')" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.workflow {
  margin-bottom: $pindou-space-md;
  border: 1px solid rgba($pindou-primary, 0.15);
  background: linear-gradient(135deg, rgba($pindou-primary, 0.06), rgba($pindou-primary, 0.02));
}

.workflow-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.workflow-title {
  font-weight: 600;
  font-size: $pindou-font-md;
  color: $pindou-text;
}

.dismiss {
  border: none;
  background: transparent;
  color: $pindou-text-muted;
  font-size: $pindou-font-sm;
  cursor: pointer;
  padding: 4px 8px;
}

.steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  counter-reset: workflow-step;

  li {
    position: relative;
    padding-left: 36px;
    font-size: $pindou-font-sm;
    color: $pindou-text-secondary;
    counter-increment: workflow-step;

    &::before {
      content: counter(workflow-step);
      position: absolute;
      left: 0;
      top: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba($pindou-primary, 0.12);
      color: $pindou-primary;
      font-size: $pindou-font-xs;
      font-weight: 700;
      line-height: 24px;
      text-align: center;
    }

    strong {
      display: block;
      color: $pindou-text;
      font-size: $pindou-font-md;
      margin-bottom: 2px;
    }

    span {
      display: block;
      line-height: 1.45;
    }
  }
}

.link {
  margin-top: 4px;
  padding: 0;
  border: none;
  background: none;
  color: $pindou-primary;
  font-size: $pindou-font-sm;
  cursor: pointer;
}

.workflow-actions {
  margin-top: 12px;
}
</style>
