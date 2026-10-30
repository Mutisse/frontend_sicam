<template>
  <q-page class="dash-page">
    <!-- Cabeçalho -->
    <header class="dash-head">
      <div>
        <h1 class="dash-head__title">{{ titulo }}</h1>
        <p class="dash-head__sub">{{ subtitulo }}</p>
      </div>
      <button class="dash-btn" @click="store.carregar()" title="Atualizar">
        <q-icon name="refresh" size="18px" />
      </button>
    </header>

    <!-- Filtros -->
    <section class="dash-filtros">
      <label class="dash-field">
        <span>De</span>
        <input v-model="store.filtros.de" type="date" />
      </label>
      <label class="dash-field">
        <span>Até</span>
        <input v-model="store.filtros.ate" type="date" />
      </label>
      <label class="dash-field">
        <span>Província</span>
        <select v-model="store.filtros.provincia">
          <option v-for="p in store.PROVINCIAS" :key="p" :value="p">
            {{ p }}
          </option>
        </select>
      </label>
      <label class="dash-field">
        <span>Posto</span>
        <select v-model="store.filtros.posto">
          <option v-for="p in store.POSTOS" :key="p" :value="p">
            {{ p }}
          </option>
        </select>
      </label>
      <button
        v-if="store.temFiltros"
        class="dash-btn dash-btn--ghost"
        @click="store.limpar()"
      >
        <q-icon name="close" size="16px" /> Limpar
      </button>
    </section>

    <!-- Secção individual do perfil -->
    <component :is="secaoIndividual" v-if="secaoIndividual" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboards/dashboard.store'

const auth = useAuthStore()
const store = useDashboardStore()

// ─── Mapa de secções por perfil ───────────────────────────
const SECOES: Record<string, any> = {
  issm:    defineAsyncComponent(() => import('./secoes/issm.vue')),
  inatro:  defineAsyncComponent(() => import('./secoes/inatro.vue')),
  prm:     defineAsyncComponent(() => import('./secoes/prm.vue')),
  gestmul: defineAsyncComponent(() => import('./secoes/gestmul.vue')),
  chefe:   defineAsyncComponent(() => import('./secoes/chefe.vue')),
}

const secaoIndividual = computed(() => {
  const p = auth.perfil
  if (!p) return null
  return SECOES[p] ?? null
})

// ─── Textos ──────────────────────────────────────────────
const titulo = computed(() => {
  const p = auth.perfil
  const map: Record<string, string> = {
    admin: 'Painel Administrativo',
    chefe: 'Painel do Posto',
    inatro: 'Painel INATRO',
    gestmul: 'Painel GESTMUL',
    issm: 'Painel ISSM',
    prm: 'Painel PRM',
  }
  return map[p ?? ''] ?? 'Painel'
})

const subtitulo = computed(() => {
  const p = auth.perfil
  const map: Record<string, string> = {
    admin: 'Gestão de utilizadores, postos e integrações.',
    chefe: 'Estado dos veículos, agentes e patrulhas.',
    inatro: 'Registo de veículos, inspecções técnicas e pendências.',
    gestmul: 'Multas emitidas, pagamentos e valores cobrados.',
    issm: 'Apólices activas, sinistros e seguradoras.',
    prm: 'Hotlist activa, abordagens e alertas operacionais.',
  }
  return map[p ?? ''] ?? ''
})
</script>

<style scoped lang="scss">
.dash-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
  --d-ink: var(--sicam-ink, #0f172a);
  --d-muted: var(--sicam-muted, #64748b);
  --d-line: var(--sicam-line, #e5ebe8);
}

.dash-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 20px;

  &__title {
    font-size: 24px; font-weight: 800; letter-spacing: -0.02em;
    color: var(--d-ink); margin: 0 0 4px;
  }
  &__sub { font-size: 13px; color: var(--d-muted); margin: 0; }
}

.dash-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 14px; border-radius: 10px; border: 0;
  background: #fff; color: var(--d-ink); cursor: pointer;
  font-family: inherit; font-size: 13px; font-weight: 600;
  border: 1px solid var(--d-line); transition: all 0.15s;

  &:hover { background: #f6f9f8; }
  &--ghost { color: var(--d-muted); }
}

.dash-filtros {
  display: flex; align-items: flex-end; gap: 12px;
  flex-wrap: wrap; padding: 16px;
  background: #fff; border: 1px solid var(--d-line);
  border-radius: 14px; margin-bottom: 18px;
}

.dash-field {
  display: flex; flex-direction: column; gap: 6px;
  flex: 1; min-width: 140px;

  span {
    font-size: 11px; font-weight: 700; color: var(--d-muted);
    text-transform: uppercase; letter-spacing: 0.05em;
  }

  input, select {
    padding: 9px 11px; border: 1px solid var(--d-line);
    border-radius: 8px; font-family: inherit; font-size: 13px;
    color: var(--d-ink); background: #fff;

    &:focus {
      outline: 0; border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }
  }
}
</style>