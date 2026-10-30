<template>
  <div class="app-row">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Componente linha com separador inferior
</script>

<style scoped lang="scss">
.app-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--sicam-line-soft);

  &:last-child { border-bottom: 0; }
}
</style>