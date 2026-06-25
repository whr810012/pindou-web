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
        <span>支持 JPG / PNG / WebP，在浏览器本地处理</span>
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
        <strong>保存 / 导出</strong>
        <span>点底部「保存」写入「我的项目」，或导出 PNG / PDF</span>
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
  border: 1px dashed rgba($pindou-primary, 0.22);
  background: rgba($pindou-bg-card, 0.75);
  backdrop-filter: blur(4px);
}

.workflow-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.workflow-title {
  font-family: $pindou-font-display;
  font-weight: 700;
  font-size: $pindou-font-md;
  color: $pindou-text;
}

.dismiss {
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-pill;
  background: $pindou-bg-subtle;
  color: $pindou-text-muted;
  font-size: $pindou-font-xs;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 10px;
  transition: background $pindou-duration-fast;

  &:hover {
    background: $pindou-bg-muted;
    color: $pindou-text;
  }
}

.steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
  counter-reset: workflow-step;

  li {
    position: relative;
    padding-left: 40px;
    font-size: $pindou-font-sm;
    color: $pindou-text-secondary;
    counter-increment: workflow-step;

    &::before {
      content: counter(workflow-step);
      position: absolute;
      left: 0;
      top: 0;
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: $pindou-primary;
      color: #fff;
      font-family: $pindou-font-display;
      font-size: $pindou-font-xs;
      font-weight: 700;
      line-height: 26px;
      text-align: center;
      box-shadow: 0 2px 6px rgba($pindou-primary, 0.25);
    }

    strong {
      display: block;
      color: $pindou-text;
      font-size: $pindou-font-md;
      font-weight: 600;
      margin-bottom: 2px;
    }

    span {
      display: block;
      line-height: 1.5;
    }
  }
}

.link {
  margin-top: 6px;
  padding: 0;
  border: none;
  background: none;
  color: $pindou-primary;
  font-size: $pindou-font-sm;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.workflow-actions {
  margin-top: 14px;
}
</style>
