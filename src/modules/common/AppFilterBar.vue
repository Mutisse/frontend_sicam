<template>
  <div class="app-card app-filter-bar">
    <div class="app-filter-bar__grid">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Container para filtros — a grelha adapta-se automaticamente
</script>

<style scoped lang="scss">
@use '../../css/design/mixins' as *;

.app-filter-bar {
  @include card;
  margin-bottom: var(--sicam-space-lg);

  &__grid {
    display: flex;
    gap: var(--sicam-space-lg);
    flex-wrap: wrap;
    align-items: flex-end;
  }

  :deep(.q-field) {
    flex: 1;
    min-width: 130px;
  }
}
</style>