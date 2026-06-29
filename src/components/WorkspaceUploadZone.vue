<script setup lang="ts">
import { computed } from 'vue'

interface SampleImage {
  label: string
  path: string
}

defineProps<{
  dragOver?: boolean
  samples: SampleImage[]
}>()

const emit = defineEmits<{
  pick: []
  template: []
  ai: []
  xhs: []
  pixelText: []
  sample: [path: string]
}>()

const pasteShortcut = computed(() => {
  if (typeof navigator === 'undefined') return 'Ctrl+V'
  return /Mac|iPhone|iPad/i.test(navigator.userAgent) ? '⌘V' : 'Ctrl+V'
})

const altSources = [
  { key: 'template', label: '素材库', icon: '▦', tone: 'primary' },
  { key: 'ai', label: 'AI 预处理', icon: '✦', tone: 'violet' },
  { key: 'xhs', label: '小红书', icon: '红', tone: 'rose' },
  { key: 'text', label: '像素文字', icon: 'A', tone: 'amber' },
] as const

function onAltSource(key: (typeof altSources)[number]['key']) {
  if (key === 'template') emit('template')
  else if (key === 'ai') emit('ai')
  else if (key === 'xhs') emit('xhs')
  else emit('pixelText')
}
</script>

<template>
  <div
    class="upload-zone"
    :class="{ 'upload-zone--drag': dragOver }"
    role="button"
    tabindex="0"
    aria-label="上传图片：支持拖拽、点击选择或粘贴"
    @click="emit('pick')"
    @keydown.enter="emit('pick')"
  >
    <div class="upload-zone__aura" aria-hidden="true" />
    <div class="upload-zone__ring" aria-hidden="true" />

    <div class="upload-zone__layout">
      <header class="upload-zone__hero">
        <div class="upload-zone__visual" aria-hidden="true">
          <div class="upload-zone__frame">
            <span class="upload-zone__bead upload-zone__bead--tl" />
            <span class="upload-zone__bead upload-zone__bead--tr" />
            <span class="upload-zone__bead upload-zone__bead--bl" />
            <span class="upload-zone__bead upload-zone__bead--br" />
            <span class="upload-zone__icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 15V9m0 0-2.5 2.5M12 9l2.5 2.5M4 18h16a1 1 0 0 0 1-1V7l-4-4H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>

        <span class="upload-zone__badge">本地处理 · 隐私安全</span>
        <span class="upload-zone__eyebrow">{{ dragOver ? '松开鼠标' : '第一步' }}</span>
        <h2 class="upload-zone__title">{{ dragOver ? '松开即可上传' : '上传你的图片' }}</h2>
        <p class="upload-zone__desc">JPG · PNG · WebP · GIF</p>

        <div class="upload-zone__methods" aria-label="上传方式">
          <span class="upload-method">
            <span class="upload-method__icon" aria-hidden="true">↧</span>
            拖入
          </span>
          <span class="upload-method">
            <span class="upload-method__icon" aria-hidden="true">◎</span>
            点击
          </span>
          <span class="upload-method">
            <span class="upload-method__icon" aria-hidden="true">{{ pasteShortcut }}</span>
            粘贴
          </span>
        </div>
      </header>

      <div class="upload-zone__panel" @click.stop>
        <button type="button" class="upload-cta" @click="emit('pick')">
          <span class="upload-cta__shine" aria-hidden="true" />
          <span class="upload-cta__row">
            <span class="upload-cta__glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.6" />
                <path d="M8 14l2.5-2.5a1 1 0 0 1 1.4 0L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <circle cx="9" cy="9" r="1.2" fill="currentColor" />
              </svg>
            </span>
            <span class="upload-cta__copy">
              <span class="upload-cta__text">选择图片</span>
              <span class="upload-cta__sub">从相册或文件夹导入</span>
            </span>
            <span class="upload-cta__arrow" aria-hidden="true">→</span>
          </span>
        </button>

        <p class="upload-zone__or">或其他方式开始</p>

        <div class="upload-alt" aria-label="其他导入方式">
          <button
            v-for="item in altSources"
            :key="item.key"
            type="button"
            class="upload-alt__btn"
            :class="`upload-alt__btn--${item.tone}`"
            @click="onAltSource(item.key)"
          >
            <span class="upload-alt__icon" aria-hidden="true">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </div>
      </div>

      <footer class="upload-zone__footer" @click.stop>
        <div class="upload-samples__head">
          <span class="upload-samples__label">快速试用示例</span>
          <span class="upload-samples__hint">无需准备图片</span>
        </div>
        <div class="upload-samples__grid">
          <button
            v-for="sample in samples"
            :key="sample.path"
            type="button"
            class="sample-card"
            @click="emit('sample', sample.path)"
          >
            <span class="sample-card__frame">
              <img class="sample-card__thumb" :src="sample.path" :alt="sample.label" loading="lazy" />
            </span>
            <span class="sample-card__label">{{ sample.label }}</span>
          </button>
        </div>
      </footer>
    </div>

    <div v-if="dragOver" class="upload-zone__drop-layer" aria-hidden="true">
      <div class="upload-zone__drop-ring">
        <span class="upload-zone__drop-icon">↧</span>
      </div>
      <span class="upload-zone__drop-text">松开鼠标，导入图片</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.upload-zone {
  position: relative;
  padding: 3px;
  border-radius: calc(#{$pindou-radius-lg} + 4px);
  cursor: pointer;
  isolation: isolate;
  transition: transform $pindou-duration-fast $pindou-ease-out;

  &:hover:not(.upload-zone--drag) {
    .upload-zone__ring {
      opacity: 0.9;
    }

    .upload-zone__frame {
      transform: translateY(-3px);
      box-shadow: $pindou-shadow-md;
    }

    .upload-cta__arrow {
      transform: translateX(3px);
    }
  }

  &:focus-visible {
    outline: none;

    .upload-zone__layout {
      box-shadow: 0 0 0 3px rgba($pindou-primary, 0.22);
    }
  }

  &--drag {
    .upload-zone__layout {
      border-color: transparent;
      background-color: rgba($pindou-primary-light, 0.55);
    }

    .upload-zone__drop-layer {
      opacity: 1;
      pointer-events: none;
    }

    .upload-zone__ring {
      opacity: 1;
      animation-duration: 0.6s;
    }
  }
}

.upload-zone__aura {
  position: absolute;
  inset: 8% 12%;
  background: radial-gradient(ellipse at 30% 20%, rgba($pindou-primary, 0.12), transparent 65%);
  pointer-events: none;
  z-index: 0;
}

.upload-zone__ring {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(
    125deg,
    rgba($pindou-primary, 0.55),
    rgba($pindou-accent, 0.4),
    rgba($pindou-primary, 0.45)
  );
  background-size: 220% 220%;
  animation: upload-ring-shift 5s ease infinite;
  opacity: 0.65;
  pointer-events: none;
  transition: opacity $pindou-duration-normal;

  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border-radius: calc(#{$pindou-radius-lg} + 2px);
    background: $pindou-bg-page;
  }
}

.upload-zone__layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 22px 18px 20px;
  border: 2px dashed rgba($pindou-primary, 0.2);
  border-radius: $pindou-radius-lg;
  background-color: rgba($pindou-bg-card, 0.94);
  background-image:
    linear-gradient(45deg, rgba($pindou-border, 0.22) 25%, transparent 25%),
    linear-gradient(-45deg, rgba($pindou-border, 0.22) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba($pindou-border, 0.22) 75%),
    linear-gradient(-45deg, transparent 75%, rgba($pindou-border, 0.22) 75%);
  background-size: 14px 14px;
  background-position: 0 0, 0 7px, 7px -7px, -7px 0;
  transition:
    border-color $pindou-duration-normal $pindou-ease-out,
    background-color $pindou-duration-normal $pindou-ease-out,
    box-shadow $pindou-duration-normal $pindou-ease-out;

  &::after {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: calc(#{$pindou-radius-lg} - 4px);
    border: 1px dashed rgba($pindou-primary, 0.08);
    pointer-events: none;
  }

  @media (min-width: 640px) {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    grid-template-rows: auto auto;
    padding: 24px 22px 20px;
    gap: 20px 24px;
  }
}

.upload-zone__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;

  @media (min-width: 640px) {
    align-items: flex-start;
    text-align: left;
    padding-right: 8px;
  }
}

.upload-zone__visual {
  margin-bottom: 14px;
}

.upload-zone__frame {
  position: relative;
  width: 76px;
  height: 76px;
  border: 2px solid rgba($pindou-primary, 0.28);
  border-radius: $pindou-radius-md;
  background: linear-gradient(160deg, #fff 0%, $pindou-bg-subtle 100%);
  box-shadow: $pindou-shadow-sm;
  transition:
    border-color $pindou-duration-normal,
    transform $pindou-duration-normal $pindou-ease-out,
    box-shadow $pindou-duration-normal;

  @media (prefers-reduced-motion: no-preference) {
    animation: upload-float 3.4s ease-in-out infinite;
  }
}

.upload-zone__bead {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);

  &--tl {
    top: -5px;
    left: -5px;
    background: $pindou-primary;
  }

  &--tr {
    top: -5px;
    right: -5px;
    background: $pindou-accent;
  }

  &--bl {
    bottom: -5px;
    left: -5px;
    background: pindou-lighten($pindou-primary, 10%);
  }

  &--br {
    bottom: -5px;
    right: -5px;
    background: pindou-darken($pindou-accent, 4%);
  }
}

.upload-zone__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: $pindou-primary;

  svg {
    width: 32px;
    height: 32px;
  }
}

.upload-zone__badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 9px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-success-bg, 0.95);
  border: 1px solid rgba($pindou-success, 0.22);
  color: $pindou-success;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.03em;

  @media (min-width: 640px) {
    top: 2px;
    right: 2px;
  }
}

.upload-zone__eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $pindou-primary;
}

.upload-zone__title {
  margin: 5px 0 0;
  font-family: $pindou-font-display;
  font-size: clamp(18px, 4.5vw, 22px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: $pindou-text;
  line-height: 1.2;
}

.upload-zone__desc {
  margin: 6px 0 0;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
}

.upload-zone__methods {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;

  @media (min-width: 640px) {
    justify-content: flex-start;
  }
}

.upload-method {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: $pindou-radius-pill;
  background: rgba(#fff, 0.88);
  border: 1px solid $pindou-border-light;
  font-size: 10px;
  font-weight: 600;
  color: $pindou-text-secondary;
  backdrop-filter: blur(4px);
}

.upload-method__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 3px;
  border-radius: 50%;
  background: rgba($pindou-primary, 0.1);
  color: $pindou-primary;
  font-size: 9px;
  font-weight: 700;
}

.upload-zone__panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: $pindou-radius-md;
  background: rgba(#fff, 0.82);
  border: 1px solid rgba($pindou-border, 0.85);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);

  @media (min-width: 640px) {
    align-self: center;
  }
}

.upload-cta {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: 0;
  border: none;
  border-radius: $pindou-radius-md;
  background: linear-gradient(135deg, $pindou-primary 0%, pindou-lighten($pindou-primary, 8%) 55%, $pindou-primary-dark 100%);
  color: #fff;
  cursor: pointer;
  box-shadow: $pindou-shadow-glow;
  transition:
    transform $pindou-duration-fast $pindou-ease-out,
    box-shadow $pindou-duration-fast;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba($pindou-primary, 0.38);
  }

  &:active {
    transform: translateY(0);
  }
}

.upload-cta__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.18) 50%,
    transparent 60%
  );
  transform: translateX(-120%);
  transition: transform 0.55s $pindou-ease-out;

  .upload-cta:hover & {
    transform: translateX(120%);
  }
}

.upload-cta__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  text-align: left;
}

.upload-cta__glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.16);
  flex-shrink: 0;

  svg {
    width: 22px;
    height: 22px;
  }
}

.upload-cta__copy {
  flex: 1;
  min-width: 0;
}

.upload-cta__text {
  display: block;
  font-size: $pindou-font-lg;
  font-weight: 700;
  line-height: 1.2;
}

.upload-cta__sub {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  opacity: 0.88;
  font-weight: 500;
}

.upload-cta__arrow {
  font-size: 18px;
  font-weight: 300;
  opacity: 0.9;
  transition: transform $pindou-duration-fast $pindou-ease-out;
}

.upload-zone__or {
  margin: 0;
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  color: $pindou-text-hint;
  letter-spacing: 0.04em;
}

.upload-alt {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 7px;
}

.upload-alt__btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-subtle;
  color: $pindou-text-secondary;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color $pindou-duration-fast,
    color $pindou-duration-fast,
    background $pindou-duration-fast,
    transform $pindou-duration-fast;

  &:hover {
    transform: translateY(-1px);
    background: #fff;
  }

  &--primary:hover {
    border-color: rgba($pindou-primary, 0.4);
    color: $pindou-primary;
  }

  &--violet:hover {
    border-color: rgba(#7c6fd6, 0.4);
    color: #6b5fc7;
  }

  &--rose:hover {
    border-color: rgba(#e25555, 0.35);
    color: #d44;
  }

  &--amber:hover {
    border-color: rgba(#c98a2e, 0.4);
    color: #b07a22;
  }
}

.upload-alt__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: rgba($pindou-primary, 0.08);
  font-size: 10px;
  color: $pindou-primary;
  flex-shrink: 0;

  .upload-alt__btn--violet & {
    background: rgba(#7c6fd6, 0.12);
    color: #6b5fc7;
  }

  .upload-alt__btn--rose & {
    background: rgba(#e25555, 0.1);
    color: #d44;
  }

  .upload-alt__btn--amber & {
    background: rgba(#c98a2e, 0.12);
    color: #b07a22;
  }
}

.upload-zone__footer {
  grid-column: 1 / -1;
  padding-top: 4px;
  border-top: 1px solid rgba($pindou-border, 0.65);
}

.upload-samples__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.upload-samples__label {
  font-size: $pindou-font-xs;
  font-weight: 700;
  color: $pindou-text-secondary;
}

.upload-samples__hint {
  font-size: 10px;
  color: $pindou-text-hint;
}

.upload-samples__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  @media (max-width: 420px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sample-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 5px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: center;
  transition: transform $pindou-duration-fast;

  &:hover {
    transform: translateY(-2px);

    .sample-card__frame {
      border-color: rgba($pindou-primary, 0.45);
      box-shadow: $pindou-shadow-sm;
    }

    .sample-card__label {
      color: $pindou-primary;
    }
  }
}

.sample-card__frame {
  aspect-ratio: 1;
  padding: 6px;
  border-radius: $pindou-radius-sm;
  border: 1px solid $pindou-border-light;
  background-color: #ece8e1;
  background-image:
    linear-gradient(45deg, #e0dbd3 25%, transparent 25%),
    linear-gradient(-45deg, #e0dbd3 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0dbd3 75%),
    linear-gradient(-45deg, transparent 75%, #e0dbd3 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0;
  transition:
    border-color $pindou-duration-fast,
    box-shadow $pindou-duration-fast;
}

.sample-card__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  display: block;
  background: $pindou-bg-muted;
  image-rendering: pixelated;
}

.sample-card__label {
  font-size: 10px;
  font-weight: 600;
  color: $pindou-text-muted;
  transition: color $pindou-duration-fast;
}

.upload-zone__drop-layer {
  position: absolute;
  inset: 3px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: $pindou-radius-lg;
  background: rgba($pindou-primary-light, 0.88);
  backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity $pindou-duration-fast;
}

.upload-zone__drop-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px dashed $pindou-primary;
  background: rgba(#fff, 0.75);
  animation: upload-drop-pulse 1.2s ease-in-out infinite;
}

.upload-zone__drop-icon {
  font-size: 28px;
  font-weight: 700;
  color: $pindou-primary;
  line-height: 1;
}

.upload-zone__drop-text {
  font-family: $pindou-font-display;
  font-size: $pindou-font-lg;
  font-weight: 800;
  color: $pindou-primary-dark;
}

@keyframes upload-ring-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes upload-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes upload-drop-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba($pindou-primary, 0.2);
  }
  50% {
    transform: scale(1.04);
    box-shadow: 0 0 0 8px rgba($pindou-primary, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .upload-zone__ring,
  .upload-zone__frame,
  .upload-zone__drop-ring {
    animation: none;
  }

  .upload-cta__shine {
    display: none;
  }
}
</style>
