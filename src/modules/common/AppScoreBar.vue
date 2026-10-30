<template>
  <div class="app-score-bar" :class="`app-score-bar--${variant}`">
    <div
      class="app-score-bar__fill"
      :style="{ width: `${clampedValue}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type ScoreVariant = 'regular' | 'atencao' | 'critico' | 'sem-dados' | 'info'

interface Props {
  value: number
  variant?: ScoreVariant
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'sem-dados',
})

const clampedValue = computed(() =>
  Math.max(0, Math.min(100, props.value))
)
</script>

<style scoped lang="scss">
.app-score-bar {
  width: 100%;
  height: 6px;
  background: var(--sicam-surface-alt, #f1f5f4);
  border-radius: 99px;
  overflow: hidden;
  margin: 8px 0 4px;

  &__fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.3s ease;
    background: var(--sicam-neutral);
  }

  &--regular   .app-score-bar__fill { background: var(--sicam-success); }
  &--atencao   .app-score-bar__fill { background: var(--sicam-warning); }
  &--critico   .app-score-bar__fill { background: var(--sicam-critical); }
  &--sem-dados .app-score-bar__fill { background: var(--sicam-neutral); }
  &--info      .app-score-bar__fill { background: var(--sicam-primary-light); }
}
</style>