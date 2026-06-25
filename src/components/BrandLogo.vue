<script setup lang="ts">
withDefaults(
  defineProps<{
    /** stack：应用顶栏双行；inline：落地页单行 */
    layout?: 'stack' | 'inline'
    showText?: boolean
  }>(),
  {
    layout: 'stack',
    showText: true,
  },
)
</script>

<template>
  <span class="pindou-brand" :class="`pindou-brand--${layout}`">
    <span class="pindou-brand__mark" aria-hidden="true">
      <span class="pindou-brand__bead pindou-brand__bead--1" />
      <span class="pindou-brand__bead pindou-brand__bead--2" />
      <span class="pindou-brand__bead pindou-brand__bead--3" />
    </span>
    <span v-if="showText" class="pindou-brand__text">
      <template v-if="layout === 'stack'">
        <span class="pindou-brand__name">Pindou</span>
        <span class="pindou-brand__tag">拼豆工坊</span>
      </template>
      <span v-else class="pindou-brand__inline">Pindou · 拼豆工坊</span>
    </span>
  </span>
</template>

<style scoped lang="scss">
.pindou-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.pindou-brand__mark {
  position: relative;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(145deg, $pindou-primary-light, rgba($pindou-accent-soft, 0.9));
  border: 1px solid rgba($pindou-primary, 0.15);
  box-shadow: $pindou-shadow-sm;
}

.pindou-brand__bead {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1.5px solid #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  &--1 {
    top: 7px;
    left: 7px;
    background: $pindou-primary;
  }

  &--2 {
    top: 14px;
    left: 16px;
    background: $pindou-accent;
  }

  &--3 {
    bottom: 7px;
    right: 8px;
    background: lighten($pindou-primary, 12%);
  }
}

.pindou-brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.pindou-brand--inline .pindou-brand__text {
  display: block;
  line-height: 1.2;
}

.pindou-brand__name,
.pindou-brand__inline {
  font-family: $pindou-font-display;
  font-weight: 800;
  font-size: 15px;
  color: $pindou-text;
  letter-spacing: -0.02em;
}

.pindou-brand--inline .pindou-brand__inline {
  font-size: 17px;
}

.pindou-brand__tag {
  font-size: 10px;
  font-weight: 600;
  color: $pindou-text-muted;
  letter-spacing: 0.08em;
}
</style>
