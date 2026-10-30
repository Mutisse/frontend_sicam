<template>
  <div class="app-empty">
    <q-icon :name="icon" class="app-empty__icon" />
    <h3 class="app-empty__title">{{ title }}</h3>
    <p v-if="description" class="app-empty__desc">{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  title: 'Sem dados',
  description: '',
})
</script>

<style scoped lang="scss">
.app-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sicam-space-3xl) var(--sicam-space-xl);
  text-align: center;

  &__icon {
    font-size: 56px;
    color: var(--sicam-line-strong);
    margin-bottom: var(--sicam-space-lg);
  }

  &__title {
    font-size: var(--sicam-font-size-lg);
    font-weight: var(--sicam-font-weight-semibold);
    color: var(--sicam-ink);
    margin: 0 0 var(--sicam-space-sm);
  }

  &__desc {
    font-size: var(--sicam-font-size-md);
    color: var(--sicam-muted);
    margin: 0 0 var(--sicam-space-lg);
    max-width: 400px;
  }
}
</style>