<template>
  <div class="app-card" :class="{ 'app-card--flat': flat, 'app-card--no-pad': noPadding }">
    <div v-if="title || subtitle || $slots.header" class="app-card__header">
      <slot name="header">
        <div>
          <h3 v-if="title" class="app-card__title">{{ title }}</h3>
          <p v-if="subtitle" class="app-card__subtitle">{{ subtitle }}</p>
        </div>
        <slot name="actions" />
      </slot>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  flat?: boolean
  noPadding?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  flat: false,
  noPadding: false,
})
</script>

<style scoped lang="scss">
@use '../../css/design/mixins' as *;

.app-card {
  @include card;

  &--flat {
    box-shadow: none;
    border: 1px solid var(--sicam-line);
  }

  &--no-pad {
    padding: 0;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--sicam-space-md);
    margin-bottom: var(--sicam-space-md);
  }

  &__title {
    font-size: var(--sicam-font-size-lg);
    font-weight: var(--sicam-font-weight-semibold);
    color: var(--sicam-ink);
    margin: 0 0 2px;
  }

  &__subtitle {
    font-size: var(--sicam-font-size-sm);
    color: var(--sicam-muted);
    margin: 0;
  }
}
</style>