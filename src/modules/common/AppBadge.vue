<template>
  <span class="app-badge" :class="`app-badge--${variant}`">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
export type BadgeVariant =
  | 'regular' | 'atencao' | 'critico' | 'sem-dados'
  | 'ativo' | 'inativo' | 'pendente'

interface Props {
  variant?: BadgeVariant
  label: string
}

withDefaults(defineProps<Props>(), {
  variant: 'sem-dados',
})
</script>

<style scoped lang="scss">
.app-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;

  // Score de regularidade
  &--regular   { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao   { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico   { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--sem-dados { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }

  // Estados genéricos
  &--ativo     { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--inativo   { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--pendente  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
}
</style>