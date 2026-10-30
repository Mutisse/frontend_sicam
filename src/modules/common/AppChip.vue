<template>
  <span class="app-chip" :class="{ 'app-chip--warn': warn }">
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  warn?: boolean
}
withDefaults(defineProps<Props>(), { warn: false })
</script>

<style scoped lang="scss">
.app-chip {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--sicam-radius-pill);
  background: #eef0f1;
  font-size: var(--sicam-font-size-sm);
  color: #4b5563;
  margin-right: var(--sicam-space-sm);

  &--warn {
    background: #fdeedc;
    color: #b45309;
  }
}
</style>