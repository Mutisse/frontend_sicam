<template>
  <component
    :is="clickable ? 'button' : 'div'"
    class="app-kpi"
    :class="[
      `app-kpi--${variant}`,
      { 'app-kpi--selected': selected, 'app-kpi--clickable': clickable },
    ]"
    @click="clickable && $emit('click')"
  >
    <small class="app-kpi__label">
      <span class="app-kpi__label-text">
        <q-icon v-if="icon" :name="icon" size="14px" class="q-mr-xs" />
        {{ label }}
      </span>
      <span v-if="variant !== 'sem-dados'" class="app-kpi__dot" />
    </small>

    <div class="app-kpi__row">
      <div class="app-kpi__value">{{ value }}</div>
      <div
        v-if="trend && variacao"
        class="app-kpi__trend"
        :class="`app-kpi__trend--${trend}`"
      >
        <q-icon
          :name="
            trend === 'up'
              ? 'arrow_upward'
              : trend === 'down'
                ? 'arrow_downward'
                : 'remove'
          "
          size="12px"
        />
        {{ variacao }}
      </div>
    </div>

    <AppScoreBar
      v-if="percentage != null"
      :value="percentage"
      :variant="variant"
    />
    <div v-if="subtitle" class="app-kpi__subtitle">{{ subtitle }}</div>
  </component>
</template>

<script setup lang="ts">
import AppScoreBar from "./AppScoreBar.vue";
import type { ScoreVariant } from "./AppScoreBar.vue";

type Trend = "up" | "down" | "flat";

interface Props {
  label: string;
  value: string | number;
  subtitle?: string | undefined;
  variant?: ScoreVariant | undefined;
  percentage?: number | null | undefined;
  selected?: boolean | undefined;
  icon?: string | undefined;
  clickable?: boolean | undefined;
  trend?: Trend | undefined;
  variacao?: string | undefined;
}

withDefaults(defineProps<Props>(), {
  variant: "sem-dados",
  subtitle: "",
  percentage: null,
  selected: false,
  icon: "",
  clickable: false,
  trend: "flat",
  variacao: "",
});

defineEmits<{ (e: "click"): void }>();
</script>

<style scoped lang="scss">
@use "../../css/design/mixins" as *;

.app-kpi {
  @include card;
  padding: 16px 18px;
  border: 1px solid transparent;
  text-align: left;
  font-family: inherit;
  transition:
    border-color var(--sicam-transition-fast),
    transform 0.1s;

  &--clickable {
    cursor: pointer;
    &:active {
      transform: scale(0.98);
    }
  }

  &--selected {
    border-color: #5eb59a;
  }

  &__label {
    font-size: var(--sicam-font-size-xs);
    color: var(--sicam-muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 6px;
  }

  &__label-text {
    display: inline-flex;
    align-items: center;
  }

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  &__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin: 4px 0 2px;
  }

  &__value {
    font-size: var(--sicam-font-size-2xl);
    font-weight: var(--sicam-font-weight-bold);
    color: var(--sicam-ink);
    line-height: 1;
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 99px;

    &--up {
      background: rgba(220, 38, 38, 0.1);
      color: var(--sicam-critical);
    }
    &--down {
      background: rgba(34, 197, 94, 0.1);
      color: var(--sicam-success);
    }
    &--flat {
      background: var(--sicam-surface-alt);
      color: var(--sicam-muted);
    }
  }

  &__subtitle {
    font-size: var(--sicam-font-size-sm);
    color: var(--sicam-muted);
    margin-top: 4px;
  }

  &--regular {
    .app-kpi__value,
    .app-kpi__dot {
      color: var(--sicam-success);
    }
  }
  &--atencao {
    .app-kpi__value,
    .app-kpi__dot {
      color: var(--sicam-warning);
    }
  }
  &--critico {
    .app-kpi__value,
    .app-kpi__dot {
      color: var(--sicam-critical);
    }
  }
  &--sem-dados {
    .app-kpi__value,
    .app-kpi__dot {
      color: var(--sicam-neutral);
    }
  }
  &--info {
    .app-kpi__value,
    .app-kpi__dot {
      color: var(--sicam-primary-light);
    }
  }
}
</style>
