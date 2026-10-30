<template>
  <div class="app-fb-loader" :class="[`app-fb-loader--${variant}`]">
    <!-- Variação: Texto -->
    <template v-if="variant === 'text'">
      <div
        v-for="i in lines"
        :key="i"
        class="app-fb-loader__line"
        :style="{ width: larguraLinha(i) }"
      />
    </template>

    <!-- Variação: Card (avatar + linhas) -->
    <template v-else-if="variant === 'card'">
      <div class="app-fb-loader__row">
        <div class="app-fb-loader__avatar" />
        <div class="app-fb-loader__col">
          <div class="app-fb-loader__line" style="width: 60%" />
          <div class="app-fb-loader__line" style="width: 40%" />
        </div>
      </div>
    </template>

    <!-- Variação: Tabela -->
    <template v-else-if="variant === 'table'">
      <div
        v-for="i in rows"
        :key="i"
        class="app-fb-loader__line"
        :style="{ width: larguraLinha(i, 'table') }"
      />
    </template>

    <!-- Variação: Lista (KPI, cards) -->
    <template v-else-if="variant === 'list'">
      <div class="app-fb-loader__grid">
        <div
          v-for="i in items"
          :key="i"
          class="app-fb-loader__block"
        />
      </div>
    </template>

    <!-- Variação: Bloco simples -->
    <template v-else>
      <div class="app-fb-loader__block" :style="{ height: height }" />
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** Tipo de skeleton a mostrar */
  variant?: 'text' | 'card' | 'table' | 'list' | 'block'
  /** Número de linhas (text/table) ou items (list) */
  lines?: number
  rows?: number
  items?: number
  /** Altura para variant='block' */
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  lines: 3,
  rows: 5,
  items: 4,
  height: '120px',
})

/**
 * Devolve larguras variadas para parecer natural
 * (como o Facebook faz — nem todas as linhas têm o mesmo tamanho)
 */
function larguraLinha(i: number, tipo: 'text' | 'table' = 'text'): string {
  if (tipo === 'table') {
    return ['100%', '85%', '92%', '78%', '88%'][i % 5] ?? '100%'
  }
  return ['100%', '95%', '88%', '92%', '75%'][i % 5] ?? '100%'
}
</script>

<style scoped lang="scss">
// ------------------------------------------------------------
// Animação shimmer (brilho que atravessa)
// ------------------------------------------------------------
@keyframes app-fb-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@mixin skeleton-base {
  background: linear-gradient(
    90deg,
    var(--sicam-line-soft) 25%,
    var(--sicam-line) 50%,
    var(--sicam-line-soft) 75%
  );
  background-size: 200% 100%;
  animation: app-fb-shimmer 1.4s ease-in-out infinite;
  border-radius: var(--sicam-radius-sm);
}

.app-fb-loader {
  width: 100%;

  &__line {
    @include skeleton-base;
    height: 14px;
    margin-bottom: 10px;

    &:last-child { margin-bottom: 0; }
  }

  &__row {
    display: flex;
    align-items: center;
    gap: var(--sicam-space-md);
  }

  &__col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__avatar {
    @include skeleton-base;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__block {
    @include skeleton-base;
    width: 100%;
    border-radius: var(--sicam-radius-lg);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--sicam-space-lg);

    .app-fb-loader__block {
      height: 96px;
    }
  }

  // Ajustes por variante
  &--card .app-fb-loader__line { height: 12px; }

  &--table .app-fb-loader__line {
    height: 16px;
    margin-bottom: 16px;
  }

  &--list .app-fb-loader__grid { margin-bottom: var(--sicam-space-md); }
}

// Respeita utilizadores com preferência de movimento reduzido
@media (prefers-reduced-motion: reduce) {
  .app-fb-loader__line,
  .app-fb-loader__avatar,
  .app-fb-loader__block {
    animation: none;
  }
}
</style>