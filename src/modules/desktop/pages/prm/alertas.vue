<template>
  <q-page class="al-page">
    <!-- SKELETON -->
    <div v-if="!store.carregado" class="al-skeleton">
      <AppFbLoader variant="block" height="80px" />
      <div class="sk-stats">
        <AppFbLoader variant="list" :items="4" />
      </div>
      <AppFbLoader variant="block" height="42px" />
      <AppFbLoader variant="list" :items="5" />
    </div>

    <!-- CONTEÚDO -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="head">
        <div class="head__left">
          <h1 class="head__title">
            Alertas
            <span
              v-if="store.kpis.criticos + store.kpis.atencao + store.kpis.info"
              class="head__badge"
            >
              {{ store.kpis.criticos + store.kpis.atencao + store.kpis.info }}
            </span>
          </h1>
          <p class="head__sub">
            {{ store.kpis.criticos + store.kpis.atencao + store.kpis.info }} activos ·
            {{ store.kpis.lidos }} arquivados
          </p>
        </div>

        <div class="head__right">
          <button
            class="btn btn--icon"
            :class="{ 'btn--icon-active': store.somActivo }"
            :title="store.somActivo ? 'Desactivar som' : 'Activar som'"
            @click="toggleSom"
          >
            <q-icon :name="store.somActivo ? 'volume_up' : 'volume_off'" size="18px" />
          </button>

          <button
            class="btn btn--icon"
            :class="{ 'btn--icon-active': store.autoRefresh }"
            :title="store.autoRefresh ? 'Desactivar auto-refresh' : 'Activar auto-refresh'"
            @click="toggleAutoRefresh"
          >
            <q-icon name="sync" size="18px" :class="{ spinning: store.autoRefresh }" />
          </button>

          <button class="btn btn--ghost" @click="exportarCSV">
            <q-icon name="file_download" size="16px" />
            Excel
          </button>

          <button
            class="btn btn--ghost"
            :disabled="store.kpis.criticos + store.kpis.atencao + store.kpis.info === 0"
            @click="marcarTodosLidos"
          >
            <q-icon name="done_all" size="16px" />
            Marcar todos lidos
          </button>
        </div>
      </header>

      <!-- STATS -->
      <section class="stats">
        <div class="stat">
          <span class="stat__dot stat__dot--critico" />
          <div>
            <div class="stat__value">{{ store.kpis.criticos }}</div>
            <div class="stat__label">Crítico</div>
          </div>
        </div>

        <div class="stat">
          <span class="stat__dot stat__dot--atencao" />
          <div>
            <div class="stat__value">{{ store.kpis.atencao }}</div>
            <div class="stat__label">Atenção</div>
          </div>
        </div>

        <div class="stat">
          <span class="stat__dot stat__dot--info" />
          <div>
            <div class="stat__value">{{ store.kpis.info }}</div>
            <div class="stat__label">Informativo</div>
          </div>
        </div>

        <div class="stat">
          <span class="stat__dot stat__dot--regular" />
          <div>
            <div class="stat__value">{{ store.kpis.lidos }}</div>
            <div class="stat__label">Lidos</div>
          </div>
        </div>
      </section>

      <!-- TOOLBAR -->
      <section class="toolbar">
        <div class="toolbar__search">
          <q-icon name="search" size="18px" />
          <input v-model="store.pesquisa" type="text" placeholder="Pesquisar alertas…" />
        </div>

        <div class="toolbar__chips">
          <button
            class="chip"
            :class="{ 'chip--active': store.filtroNivel === '' }"
            @click="store.filtroNivel = ''"
          >
            Todos
          </button>
          <button
            v-for="n in store.NIVEIS"
            :key="n.key"
            class="chip"
            :class="{ 'chip--active': store.filtroNivel === n.key }"
            @click="store.filtroNivel = n.key"
          >
            {{ n.label }}
          </button>
        </div>

        <select v-model="store.filtroTipo" class="toolbar__select">
          <option value="">Todos os tipos</option>
          <option v-for="t in store.TIPOS" :key="t.key" :value="t.key">{{ t.label }}</option>
        </select>

        <button
          v-if="store.temFiltrosAtivos"
          class="toolbar__clear"
          title="Limpar filtros"
          @click="store.limparFiltros"
        >
          <q-icon name="close" size="14px" />
        </button>
      </section>

      <!-- LISTA -->
      <section v-if="store.filtrados.length" class="list">
        <article
          v-for="a in store.filtrados"
          :key="a.id"
          class="item"
          :class="[`item--${a.nivel}`, { 'item--read': a.lido }]"
        >
          <div class="item__icon">
            <q-icon :name="store.nivelIcone(a.nivel)" size="20px" />
          </div>

          <div class="item__body">
            <div class="item__top">
              <span class="item__type">{{ store.labelTipo(a.tipo) }}</span>
              <span class="item__dot">·</span>
              <span class="item__time">{{ a.hora }}</span>
              <span v-if="a.referencia" class="item__dot">·</span>
              <span v-if="a.referencia" class="item__ref">{{ a.referencia }}</span>
              <span v-if="store.estaSilenciado(a.tipo)" class="item__silenciado">
                <q-icon name="notifications_off" size="11px" />
                Silenciado
              </span>
            </div>

            <h3 class="item__title">{{ a.titulo }}</h3>
            <p class="item__msg">{{ a.mensagem }}</p>

            <div v-if="a.origem" class="item__origem">
              <q-icon name="person" size="12px" />
              {{ a.origem }}
            </div>
          </div>

          <div class="item__action">
            <template v-if="!a.lido">
              <button
                class="btn btn--sm btn--ghost"
                title="Silenciar tipo por 4h"
                @click="silenciar(a)"
              >
                <q-icon name="notifications_off" size="14px" />
              </button>

              <button class="btn btn--sm btn--primary" @click="marcarLido(a)">
                <q-icon name="check" size="14px" />
                Lido
              </button>
            </template>

            <button
              v-else
              class="btn btn--sm btn--ghost"
              title="Marcar como não lido"
              @click="marcarNaoLido(a)"
            >
              <q-icon name="mark_email_unread" size="14px" />
              Não lido
            </button>
          </div>
        </article>
      </section>

      <!-- EMPTY -->
      <div v-else class="empty">
        <div class="empty__illustration">
          <q-icon name="notifications_none" size="56px" />
        </div>
        <h3 class="empty__title">Sem alertas</h3>
        <p class="empty__sub">
          {{ store.temFiltrosAtivos ? 'Nenhum alerta corresponde aos filtros aplicados.' : 'Ainda não existem alertas registados.' }}
        </p>
        <button
          v-if="store.temFiltrosAtivos"
          class="btn btn--ghost"
          @click="store.limparFiltros"
        >
          <q-icon name="close" size="16px" />
          Limpar filtros
        </button>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  usePrmAlertasStore,
  type Alerta,
} from '@/stores/prm/prm-AlertasStore'
import AppFbLoader from "@/modules/common/AppFbLoader.vue";

const store = usePrmAlertasStore()
const $q = useQuasar()

// Carrega dados ao montar
onMounted(() => {
  store.carregar()
  iniciarAutoRefresh()
})

// ============================================================
// Marcar lido / não lido
// ============================================================
async function marcarLido(a: Alerta) {
  const ok = await store.marcarLido(a.id)
  if (!ok) return

  $q.notify({
    type: 'positive',
    message: 'Alerta marcado como lido.',
    position: 'top',
    timeout: 1500,
  })
}

async function marcarNaoLido(a: Alerta) {
  const ok = await store.marcarNaoLido(a.id)
  if (!ok) return

  $q.notify({
    type: 'info',
    message: 'Alerta marcado como não lido.',
    position: 'top',
    timeout: 1500,
  })
}

async function marcarTodosLidos() {
  const total = await store.marcarTodosLidos()
  if (total === 0) return

  $q.notify({
    type: 'positive',
    message: `${total} alerta${total === 1 ? '' : 's'} marcado${total === 1 ? '' : 's'} como lido${total === 1 ? '' : 's'}.`,
    position: 'top',
  })
}

// ============================================================
// Silenciar
// ============================================================
function silenciar(a: Alerta) {
  store.silenciar(a.tipo, 4)

  $q.notify({
    type: 'warning',
    message: `Alertas do tipo "${store.labelTipo(a.tipo)}" silenciados por 4 horas.`,
    position: 'top',
  })
}

// ============================================================
// Exportar CSV
// ============================================================
function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — PRM — Alertas'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['Nível', 'Tipo', 'Título', 'Mensagem', 'Hora', 'Referência', 'Origem', 'Estado'],
    ...store.filtrados.map((a) => [
      store.labelNivel(a.nivel),
      store.labelTipo(a.tipo),
      a.titulo,
      a.mensagem,
      a.hora,
      a.referencia ?? '',
      a.origem ?? '',
      a.lido ? 'Lido' : 'Activo',
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `prm-alertas-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: `${store.filtrados.length} alertas exportados.`,
    position: 'top',
  })
}

// ============================================================
// Toggle som
// ============================================================
function toggleSom() {
  store.toggleSom()
  $q.notify({
    type: store.somActivo ? 'positive' : 'info',
    message: store.somActivo ? 'Som de alerta activado.' : 'Som de alerta desactivado.',
    position: 'top',
    timeout: 1200,
  })
}

// ============================================================
// Toggle auto-refresh
// ============================================================
let intervalId: number | null = null

function iniciarAutoRefresh() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }

  if (store.autoRefresh) {
    intervalId = window.setInterval(() => {
      store.carregar()
    }, 30_000)
  }
}

function toggleAutoRefresh() {
  store.toggleAutoRefresh()
  iniciarAutoRefresh()
  $q.notify({
    type: 'info',
    message: store.autoRefresh
      ? 'Actualização automática activada.'
      : 'Actualização automática desactivada.',
    position: 'top',
    timeout: 1200,
  })
}

// ============================================================
// Ciclo de vida
// ============================================================
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped lang="scss">
.al-page {
  padding: 32px 24px 64px;
  max-width: 1080px;
  margin: 0 auto;
  background: #fafafa;
  min-height: 100vh;
}

// ─── SKELETON ────────────────────────────────────────────────
.al-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sk-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

// ============================================================
// Cabeçalho
// ============================================================
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 800px) { flex-direction: column; }

  &__title {
    font-size: 30px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 6px;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 10px;
    margin-left: 10px;
    border-radius: 99px;
    background: #111827;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  &__sub {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  &__right {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

// ============================================================
// Botões
// ============================================================
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  white-space: nowrap;

  &--sm { padding: 6px 12px; font-size: 12px; }

  &--ghost {
    background: #fff;
    color: #374151;
    border: 1px solid #e5e7eb;

    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #d1d5db;
    }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &--primary {
    background: #111827;
    color: #fff;

    &:hover:not(:disabled) { background: #1f2937; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &--icon {
    display: inline-grid;
    place-items: center;
    width: 42px;
    height: 42px;
    padding: 0;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background: #f9fafb;
      color: #111827;
      border-color: #d1d5db;
    }

    &-active {
      background: #111827;
      border-color: #111827;
      color: #fff;

      &:hover {
        background: #1f2937;
        border-color: #1f2937;
        color: #fff;
      }
    }
  }
}

.spinning {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// ============================================================
// Stats
// ============================================================
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 28px;

  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 400px) { grid-template-columns: 1fr; }
}

.stat {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 16px 18px;
  border: 1px solid #f3f4f6;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &--critico { background: #ef4444; }
    &--atencao { background: #f59e0b; }
    &--info    { background: #3b82f6; }
    &--regular { background: #10b981; }
  }

  &__value {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  &__label {
    font-size: 11px;
    color: #6b7280;
    margin-top: 2px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

// ============================================================
// Toolbar
// ============================================================
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  &__search {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0 14px;
    height: 42px;
    flex: 1;
    min-width: 220px;
    transition: all 0.15s;

    &:focus-within { border-color: #111827; }

    .q-icon { color: #9ca3af; flex-shrink: 0; }

    input {
      flex: 1;
      border: 0;
      background: transparent;
      font-size: 14px;
      color: #111827;
      font-family: inherit;

      &:focus { outline: 0; }
      &::placeholder { color: #9ca3af; }
    }
  }

  &__chips {
    display: flex;
    gap: 6px;
    padding: 4px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    height: 42px;
    align-items: center;

    @media (max-width: 700px) { display: none; }
  }

  &__select {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0 14px;
    height: 42px;
    font-size: 14px;
    color: #111827;
    font-family: inherit;
    cursor: pointer;

    &:focus { outline: 0; border-color: #111827; }
  }

  &__clear {
    display: inline-grid;
    place-items: center;
    width: 42px;
    height: 42px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
    }
  }
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  background: transparent;
  border: 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }

  &--active {
    background: #111827;
    color: #fff;
  }
}

// ============================================================
// Lista
// ============================================================
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 16px;
  align-items: start;
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;

  &:hover {
    border-color: #e5e7eb;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    transform: translateY(-1px);
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: #f9fafb;
    color: #6b7280;
  }

  &--critico &__icon { background: #fef2f2; color: #dc2626; }
  &--atencao &__icon { background: #fffbeb; color: #d97706; }
  &--info    &__icon { background: #eff6ff; color: #2563eb; }

  &__body { min-width: 0; }

  &__top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    flex-wrap: wrap;
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }

  &__type {
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 11px;
  }

  &__dot { opacity: 0.4; }
  &__time { color: #9ca3af; }

  &__ref {
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    background: #f3f4f6;
    padding: 2px 8px;
    border-radius: 6px;
    color: #374151;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  &__silenciado {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    background: #f3f4f6;
    color: #6b7280;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    .q-icon { opacity: 0.7; }
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px;
    line-height: 1.4;
  }

  &__msg {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.55;
    margin: 0;
  }

  &__origem {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 8px;
    font-weight: 500;

    .q-icon { opacity: 0.7; }
  }

  &__action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: center;
    flex-shrink: 0;

    @media (max-width: 600px) {
      grid-column: 2 / 3;
      justify-self: start;
      margin-top: 8px;
    }
  }

  &--read {
    background: #fafafa;
    border-color: #f3f4f6;

    .item__icon { background: #f3f4f6; color: #9ca3af; }
    .item__title { color: #4b5563; }
    .item__msg { color: #9ca3af; }
  }

  @media (max-width: 600px) {
    grid-template-columns: 40px 1fr;
    gap: 12px;
    padding: 14px 16px;

    &__icon { width: 40px; height: 40px; }
  }
}

// ============================================================
// Empty
// ============================================================
.empty {
  text-align: center;
  padding: 80px 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;

  &__illustration {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: #f9fafb;
    color: #d1d5db;
    display: grid;
    place-items: center;
    margin: 0 auto 20px;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 6px;
  }

  &__sub {
    margin: 0 0 24px;
    color: #6b7280;
    font-size: 14px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>