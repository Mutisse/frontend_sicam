<template>
  <div class="app-spinner" :class="[`app-spinner--${size}`, { 'app-spinner--inline': inline }]">
    <q-spinner-dots :size="spinnerSize" :color="color" />
    <p v-if="label" class="app-spinner__label">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  color?: string
  inline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  label: '',
  color: 'primary',
  inline: false,
})

const spinnerSize = computed(() => ({
  sm: '24px',
  md: '40px',
  lg: '56px',
}[props.size]))
</script>

<style scoped lang="scss">
.app-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sicam-space-md);
  padding: var(--sicam-space-2xl);

  &--inline {
    padding: var(--sicam-space-md);
    flex-direction: row;
  }

  &__label {
    color: var(--sicam-muted);
    font-size: var(--sicam-font-size-md);
    margin: 0;
  }
}
</style>