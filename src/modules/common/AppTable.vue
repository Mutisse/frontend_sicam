<template>
  <div class="app-table-wrapper">
    <table class="app-table">
      <thead>
        <tr>
          <th v-for="(col, i) in columns" :key="i" :style="{ width: col.width }">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length && !loading">
          <td :colspan="columns.length" class="app-table__empty">
            <slot name="empty">
              <AppEmpty :title="emptyTitle" :description="emptyDescription" />
            </slot>
          </td>
        </tr>
        <tr v-else-if="loading">
          <td :colspan="columns.length" class="app-table__loading">
            <AppSpinner :label="loadingLabel" />
          </td>
        </tr>
        <tr v-for="(row, i) in rows" :key="i">
          <td v-for="(col, j) in columns" :key="j">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import AppEmpty from './AppEmpty.vue'
import AppSpinner from './AppSpinner.vue'

export interface TableColumn {
  key: string
  label: string
  width?: string
}

interface Props {
  columns: TableColumn[]
  rows: T[]
  loading?: boolean
  loadingLabel?: string
  emptyTitle?: string
  emptyDescription?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  loadingLabel: 'A carregar…',
  emptyTitle: 'Sem registos',
  emptyDescription: '',
})
</script>

<style scoped lang="scss">
.app-table-wrapper {
  background: var(--sicam-surface);
  border-radius: var(--sicam-radius-lg);
  box-shadow: var(--sicam-shadow-md);
  overflow: auto;
  margin-bottom: var(--sicam-space-lg);
}

.app-table {
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    font-size: var(--sicam-font-size-xs);
    color: var(--sicam-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 10px 12px;
    background: #fafbfa;
    border-bottom: 1px solid var(--sicam-line);
    font-weight: var(--sicam-font-weight-medium);
  }

  td {
    padding: 12px;
    border-bottom: 1px solid var(--sicam-line-soft);
    font-size: var(--sicam-font-size-md);
    color: var(--sicam-ink);
    vertical-align: middle;

    b { font-weight: var(--sicam-font-weight-bold); }
    small {
      display: block;
      color: var(--sicam-muted);
      font-size: var(--sicam-font-size-sm);
    }
  }

  tbody tr:hover td {
    background: #fbfdfc;
  }

  &__empty,
  &__loading {
    padding: 0 !important;
    text-align: center;
  }
}
</style>