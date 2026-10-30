<template>
  <div class="app-page-header">
    <div>
      <h1 class="app-page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="app-page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="app-page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
})
</script>

<style scoped lang="scss">
@use '../../css/design/mixins' as *;

.app-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sicam-space-md);
  margin-bottom: var(--sicam-space-md);

  @include below-desktop {
    flex-direction: column;
  }

  &__title {
    font-size: var(--sicam-font-size-xl);
    font-weight: var(--sicam-font-weight-bold);
    color: var(--sicam-ink);
    margin: 0 0 2px;
  }

  &__subtitle {
    color: var(--sicam-muted);
    font-size: var(--sicam-font-size-md);
    margin: 0 0 var(--sicam-space-lg);
  }

  &__actions {
    display: flex;
    gap: var(--sicam-space-sm);
    flex-wrap: wrap;
  }
}
</style>