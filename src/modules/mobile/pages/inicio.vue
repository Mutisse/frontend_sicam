<template>
  <div class="agente-inicio">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="ag-skeleton">
      <div class="sk-head" />
      <div class="sk-kpis">
        <div v-for="i in 3" :key="`sk-kpi-${i}`" class="sk-kpi" />
      </div>
      <div class="sk-block" />
      <div class="sk-block" />
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="agente-inicio__head">
        <div>
          <h1 class="agente-h1">
            {{ store.saudacao }}, {{ store.primeiroNome }}
          </h1>
          <p class="agente-sub">
            {{ store.patrulhaNome }} · {{ store.dataHora }}
          </p>
        </div>
        <button
          class="agente-inicio__refresh"
          type="button"
          aria-label="Atualizar painel"
          :disabled="store.aAtualizar"
          @click="store.atualizar"
        >
          <q-icon
            :name="store.aAtualizar ? 'sync' : 'refresh'"
            size="22px"
            :class="{ 'agente-spin': store.aAtualizar }"
          />
        </button>
      </header>

      <!-- CHIPS DE ESTADO -->
      <div class="agente-chips">
        <AppChip>
          <q-icon name="verified" size="14px" class="q-mr-xs" />
          Hotlist sincronizada
        </AppChip>
        <AppChip v-if="!store.online" warn>
          <q-icon name="cloud_off" size="14px" class="q-mr-xs" />
          Modo offline
        </AppChip>
        <AppChip v-else>
          <q-icon name="cloud_done" size="14px" class="q-mr-xs" />
          Online
        </AppChip>
      </div>

      <!-- ERRO -->
      <div v-if="store.erro" class="agente-erro">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- KPIs -->
      <div class="agente-grid3">
        <button class="agente-kpi" @click="irConsulta">
          <q-icon name="search" size="18px" class="agente-kpi__icon" />
          <small>Consultas</small>
          <div class="agente-kpi__value">{{ store.kpis.consultas }}</div>
        </button>

        <button class="agente-kpi agente-kpi--critico" @click="irHotlist">
          <q-icon name="warning" size="18px" class="agente-kpi__icon" />
          <small>Críticos</small>
          <div class="agente-kpi__value">{{ store.kpis.criticos }}</div>
        </button>

        <button class="agente-kpi agente-kpi--regular" @click="irAutos">
          <q-icon name="receipt_long" size="18px" class="agente-kpi__icon" />
          <small>Autos</small>
          <div class="agente-kpi__value">{{ store.kpis.autos }}</div>
        </button>
      </div>

      <!-- ACÇÕES RÁPIDAS -->
      <div class="agente-quick">
        <button
          class="agente-quick__item agente-quick__item--primary"
          @click="irConsulta"
        >
          <q-icon name="search" size="22px" />
          <span>Consultar matrícula</span>
        </button>

        <div class="agente-quick__grid">
          <button class="agente-quick__small" @click="irCamera">
            <q-icon name="photo_camera" size="20px" />
            <span>Câmara</span>
          </button>
          <button class="agente-quick__small" @click="irAutos">
            <q-icon name="description" size="20px" />
            <span>Auto</span>
          </button>
          <button class="agente-quick__small" @click="irChat">
            <q-icon name="chat_bubble_outline" size="20px" />
            <span>Assistente</span>
          </button>
          <button class="agente-quick__small" @click="irHistorico">
            <q-icon name="history" size="20px" />
            <span>Histórico</span>
          </button>
        </div>
      </div>

      <!-- ÚLTIMA CONSULTA -->
      <div
        v-if="store.ultimaConsulta"
        class="agente-card agente-card--destaque"
        @click="ver(store.ultimaConsulta.matricula)"
      >
        <div class="agente-card__head">
          <h3>Última consulta</h3>
          <span class="agente-tag">há {{ store.ultimaConsulta.tempo }}</span>
        </div>
        <div class="agente-ultima">
          <div class="agente-ultima__placa">
            {{ store.ultimaConsulta.matricula }}
          </div>
          <AppBadge
            :variant="badgeVariant(store.ultimaConsulta.score)"
            :label="`${estadoDoScore(store.ultimaConsulta.score).label} ${store.ultimaConsulta.score}`"
          />
        </div>
        <small class="agente-ultima__meta">
          {{ store.ultimaConsulta.posto }} · {{ store.ultimaConsulta.ultima }}
        </small>
      </div>

      <!-- REQUER ATENÇÃO -->
      <div class="agente-card">
        <div class="agente-card__head">
          <h3>Requer atenção</h3>
          <span class="agente-count">{{ store.requerAtencao.length }}</span>
        </div>

        <p v-if="store.requerAtencao.length === 0" class="agente-empty">
          Nenhum veículo crítico. Bom trabalho! 🚔
        </p>

        <div
          v-for="v in store.requerAtencao"
          :key="v.matricula"
          class="agente-row"
          @click="ver(v.matricula)"
        >
          <div>
            <b>{{ v.matricula }}</b>
            <small>{{ v.posto }} · {{ v.ultima }}</small>
          </div>
          <AppBadge
            :variant="badgeVariant(v.score)"
            :label="`${estadoDoScore(v.score).label} ${v.score}`"
          />
        </div>
      </div>

      <!-- PATRULHA EM CURSO -->
      <div class="agente-card">
        <div class="agente-card__head">
          <h3>Patrulha em curso</h3>
          <span class="agente-tag">{{ store.patrulhaNome }}</span>
        </div>

        <template v-if="store.patrulha">
          <div class="agente-row agente-row--sem-border">
            <span class="agente-row__label">Veículos abordados</span>
            <b>{{ store.patrulhaProgresso }}/{{ store.patrulhaTotal }}</b>
          </div>
          <AppScoreBar :value="store.patrulhaPercentagem" variant="regular" />

          <div class="agente-row agente-row--sem-border">
            <span class="agente-row__label">Tempo de patrulha</span>
            <b>{{ store.tempoPatrulha }}</b>
          </div>
        </template>

        <p v-else class="agente-empty">Sem patrulha activa</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAgenteInicioStore } from '@/stores/agente/agente-inicio.store'
import { estadoDoScore } from '@/css/design/palette'
import AppChip from '@/modules/common/AppChip.vue'
import AppBadge from '@/modules/common/AppBadge.vue'
import AppScoreBar from '@/modules/common/AppScoreBar.vue'

const router = useRouter()
const auth = useAuthStore()
const store = useAgenteInicioStore()

// ------------------------------------------------------------
// Estado do agente → store
// ------------------------------------------------------------
const nomeAgente = computed(() => auth.utilizador?.nome ?? 'Agente')

onMounted(() => {
  store.setAgente(nomeAgente.value)
  store.iniciarRelogio(30_000)
  store.carregar()
})

onUnmounted(() => {
  store.pararRelogio()
})

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function badgeVariant(score: number): 'regular' | 'atencao' | 'critico' {
  const key = estadoDoScore(score).key
  if (key === 'critico') return 'critico'
  if (key === 'atencao') return 'atencao'
  return 'regular'
}

// ------------------------------------------------------------
// Navegação
// ------------------------------------------------------------
function ver(matricula: string) {
  sessionStorage.setItem('sicam.matricula-atual', matricula)
  router.push('/agente/resultado')
}

function irConsulta() {
  router.push('/agente/consulta')
}
function irCamera() {
  router.push('/agente/camera')
}
function irAutos() {
  router.push('/agente/autos')
}
function irChat() {
  router.push('/agente/chat')
}
function irHistorico() {
  router.push('/agente/historico')
}
function irHotlist() {
  router.push('/agente/consulta')
}
</script>

<style scoped lang="scss">
.agente-inicio {
  padding: 0;
}

/* ============================================================ */
/* SKELETON                                                     */
/* ============================================================ */
@keyframes sk-shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

%sk-block {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.05) 100%
  );
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s infinite linear;
  border-radius: 12px;
}

.ag-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.sk-head {
  @extend %sk-block;
  height: 120px;
  border-radius: 0 0 22px 22px;
  margin: -16px -16px 16px;
}

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
}

.sk-kpi {
  @extend %sk-block;
  height: 112px;
}

.sk-block {
  @extend %sk-block;
  height: 140px;
}

.agente-erro {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--sicam-critical-bg, #fef2f2);
  color: var(--sicam-critical-ink, #991b1b);
  font-size: 13px;
  margin-bottom: 12px;
}

/* ============================================================ */
/* CABEÇALHO                                                    */
/* ============================================================ */
.agente-inicio__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin: -16px -16px 16px;
  padding: 24px 16px 20px;
  color: #fff;
  background:
    radial-gradient(
      circle at 92% 0%,
      rgba(110, 231, 183, 0.22),
      transparent 34%
    ),
    linear-gradient(135deg, var(--sicam-primary-dark), var(--sicam-primary));
  border-radius: 0 0 22px 22px;
}

.agente-h1 {
  font-size: clamp(21px, 6vw, 25px);
  font-weight: 700;
  color: inherit;
  margin: 0;
  letter-spacing: -0.025em;
}

.agente-sub {
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  margin: 5px 0 0;
}

.agente-inicio__refresh {
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 14px;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s;

  &:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.24);
    transform: scale(0.96);
  }
  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
  &:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }
}

.agente-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================ */
/* CHIPS                                                        */
/* ============================================================ */
.agente-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

/* ============================================================ */
/* KPIs                                                         */
/* ============================================================ */
.agente-grid3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin-bottom: 16px;
}

.agente-kpi {
  min-width: 0;
  min-height: 112px;
  background: var(--sicam-surface, #fff);
  border: 1px solid var(--sicam-line-soft, #eef2f0);
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.045);
  padding: 12px 10px;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.2s,
    border-color 0.2s;

  &:active {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 1px 5px rgba(15, 23, 42, 0.04);
  }
  &:focus-visible {
    outline: 3px solid var(--sicam-primary-soft, rgba(16, 185, 129, 0.3));
    outline-offset: 2px;
  }

  &__icon {
    display: grid;
    width: 32px;
    height: 32px;
    margin-bottom: 9px;
    place-items: center;
    color: var(--sicam-primary);
    background: var(--sicam-primary-bg-alt, #ecfdf5);
    border-radius: 10px;
  }

  small {
    display: block;
    font-size: 10px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  &__value {
    font-size: clamp(21px, 6vw, 25px);
    font-weight: 700;
    color: var(--sicam-ink);
    margin-top: 4px;
    line-height: 1;
  }

  &--critico {
    .agente-kpi__icon {
      color: var(--sicam-critical, #dc2626);
      background: var(--sicam-critical-bg, #fef2f2);
    }
    .agente-kpi__value {
      color: var(--sicam-critical, #dc2626);
    }
  }
  &--regular {
    .agente-kpi__icon {
      color: var(--sicam-success, #059669);
      background: var(--sicam-success-bg, #ecfdf5);
    }
    .agente-kpi__value {
      color: var(--sicam-success, #059669);
    }
  }
}

/* ============================================================ */
/* ACÇÕES RÁPIDAS                                               */
/* ============================================================ */
.agente-quick {
  margin-bottom: 12px;
}

.agente-quick__item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  border: 0;
  min-height: 54px;
  border-radius: 15px;
  padding: 15px 16px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
  box-shadow: 0 5px 14px rgba(6, 95, 70, 0.16);
  transition:
    background 0.15s,
    transform 0.15s;

  &--primary {
    background: var(--sicam-primary-light, #059669);
    color: #fff;
    &:active {
      background: var(--sicam-primary, #065f46);
      transform: scale(0.99);
    }
    &:focus-visible {
      outline: 3px solid var(--sicam-primary-soft, rgba(16, 185, 129, 0.3));
      outline-offset: 2px;
    }
  }
}

.agente-quick__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.agente-quick__small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 76px;
  background: var(--sicam-surface, #fff);
  border: 1px solid var(--sicam-line-soft, #eef2f0);
  border-radius: 15px;
  padding: 11px 5px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  color: var(--sicam-ink);
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s,
    border-color 0.15s;

  .q-icon {
    color: var(--sicam-primary-light, #059669);
  }

  &:active {
    background: var(--sicam-surface-hover, #f6f9f8);
    transform: scale(0.96);
  }
  &:focus-visible {
    outline: 3px solid var(--sicam-primary-soft, rgba(16, 185, 129, 0.3));
    outline-offset: 2px;
  }
}

/* ============================================================ */
/* CARDS                                                        */
/* ============================================================ */
.agente-card {
  background: var(--sicam-surface, #fff);
  border: 1px solid var(--sicam-line-soft, #eef2f0);
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
  padding: 15px;
  margin-bottom: 14px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);
    margin: 0;
  }

  &--destaque {
    cursor: pointer;
    border-color: rgba(5, 150, 105, 0.35);
    box-shadow: 0 5px 16px rgba(6, 95, 70, 0.07);
    &:active {
      background: var(--sicam-surface-hover, #f6f9f8);
    }
  }
}

.agente-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.agente-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--sicam-muted);
  background: var(--sicam-surface-alt, #f6f9f8);
  padding: 3px 8px;
  border-radius: 99px;
  letter-spacing: 0.02em;
}

.agente-count {
  background: var(--sicam-critical, #dc2626);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 99px;
  min-width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

/* ============================================================ */
/* ÚLTIMA CONSULTA                                              */
/* ============================================================ */
.agente-ultima {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.agente-ultima__placa {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--sicam-ink);
  font-variant-numeric: tabular-nums;
}

.agente-ultima__meta {
  display: block;
  font-size: 12px;
  color: var(--sicam-muted);
}

/* ============================================================ */
/* LINHAS                                                       */
/* ============================================================ */
.agente-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--sicam-line-soft, #eef2f0);
  cursor: pointer;

  &:last-child {
    border-bottom: 0;
  }
  &--sem-border {
    cursor: default;
  }

  &__label {
    font-size: 13px;
    color: var(--sicam-muted);
  }

  small {
    display: block;
    color: var(--sicam-muted);
    font-size: 12px;
    font-weight: 400;
  }

  b {
    color: var(--sicam-ink);
    font-size: 14px;
  }
}

.agente-empty {
  font-size: 13px;
  color: var(--sicam-muted);
  text-align: center;
  margin: 12px 0 4px;
}

@media (max-width: 360px) {
  .agente-grid3 {
    gap: 6px;
  }

  .agente-kpi {
    padding-right: 7px;
    padding-left: 7px;

    small {
      font-size: 9px;
    }
  }

  .agente-quick__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .agente-inicio__refresh,
  .agente-kpi,
  .agente-quick__item,
  .agente-quick__small {
    transition: none;
  }
}
</style>