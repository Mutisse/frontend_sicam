<template>
  <q-page class="monitor-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="mon-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-kpis">
        <div v-for="i in 4" :key="`sk-kpi-${i}`" class="sk-kpi" />
      </div>
      <div class="sk-grid">
        <div class="sk-card" />
        <div class="sk-card" />
      </div>
      <div class="sk-block" />
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="monitor-head">
        <div>
          <h1 class="monitor-head__title">Monitorização do Sistema</h1>
          <p class="monitor-head__sub">
            Estado dos serviços, recursos e integrações em tempo real
          </p>
        </div>

        <div class="monitor-head__actions">
          <span
            class="monitor-status"
            :class="`monitor-status--${store.estadoGeral}`"
            role="status"
          >
            <span class="monitor-status__dot" />
            {{ store.estadoGeralTexto }}
          </span>

          <!-- Auto-refresh -->
          <div class="monitor-auto">
            <label
              class="monitor-live"
              :class="{ 'monitor-live--on': store.aoVivo }"
            >
              <input
                type="checkbox"
                class="monitor-live__input"
                :checked="store.aoVivo"
                @change="store.alternarAoVivo()"
              />
              <span class="monitor-live__track">
                <span class="monitor-live__thumb" />
              </span>
              Ao vivo
            </label>

            <select
              class="monitor-auto__select"
              :value="store.intervalo"
              :disabled="!store.aoVivo"
              @change="
                (e) =>
                  store.setIntervalo(
                    Number((e.target as HTMLSelectElement).value) as any,
                  )
              "
            >
              <option :value="10">10s</option>
              <option :value="30">30s</option>
              <option :value="60">60s</option>
              <option :value="0">off</option>
            </select>
          </div>

          <button
            type="button"
            class="monitor-refresh"
            :disabled="store.carregando"
            @click="store.carregar"
          >
            <q-icon
              name="refresh"
              size="18px"
              :class="{ spinning: store.carregando }"
            />
            {{ store.carregando ? 'A actualizar' : 'Actualizar' }}
          </button>

          <button type="button" class="monitor-export" @click="exportarSnapshot">
            <q-icon name="file_download" size="18px" />
            Snapshot
          </button>
        </div>
      </header>

      <p class="monitor-stamp">
        <q-icon name="schedule" size="14px" />
        Actualizado às {{ store.ultimaActualizacao }}
        <template v-if="store.aoVivo && store.intervalo > 0">
          · auto a cada {{ store.intervalo }}s
        </template>
      </p>

      <!-- ERRO -->
      <div v-if="store.erro" class="form-error">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- KPIs DE RECURSOS -->
      <section class="monitor-kpis" aria-label="Recursos">
        <article
          v-for="kpi in store.kpisRecursos"
          :key="kpi.key"
          class="monitor-kpi"
          :class="`monitor-kpi--${kpi.nivel}`"
        >
          <header class="monitor-kpi__head">
            <span class="monitor-kpi__icon">
              <q-icon :name="kpi.icon" size="20px" />
            </span>
            <span class="monitor-kpi__label">{{ kpi.label }}</span>
            <span class="monitor-kpi__nivel">{{
              store.labelNivel(kpi.nivel)
            }}</span>
          </header>

          <div
            class="monitor-kpi__ring"
            role="img"
            :aria-label="`${kpi.label}: ${kpi.valor}${kpi.unidade}`"
          >
            <svg viewBox="0 0 100 100" class="monitor-kpi__svg">
              <circle cx="50" cy="50" r="42" class="monitor-kpi__track" />
              <circle
                cx="50"
                cy="50"
                r="42"
                class="monitor-kpi__progress"
                :class="`monitor-kpi__progress--${kpi.nivel}`"
                :stroke-dasharray="store.circunferencia"
                :stroke-dashoffset="store.offset(kpi.percentagem)"
              />
            </svg>

            <div class="monitor-kpi__center">
              <span class="monitor-kpi__value">{{ kpi.valor }}</span>
              <span class="monitor-kpi__unidade">{{ kpi.unidade }}</span>
            </div>
          </div>

          <!-- Sparkline do histórico -->
          <svg
            class="monitor-kpi__spark"
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
            :aria-label="`Histórico de ${kpi.label}`"
          >
            <polyline
              :points="sparklinePontos(kpi.historico)"
              class="monitor-kpi__spark-line"
            />
          </svg>

          <div class="monitor-kpi__foot">
            {{ kpi.detalhe }}
            <small>
              alerta ≥ {{ kpi.limiarAtencao }}{{ kpi.unidade }} · crítico ≥
              {{ kpi.limiarCritico }}{{ kpi.unidade }}
            </small>
          </div>
        </article>
      </section>

      <!-- INTEGRAÇÕES + ACTIVIDADE -->
      <div class="monitor-grid">
        <section class="monitor-card">
          <header class="monitor-card__head">
            <h2 class="monitor-card__title">Integrações</h2>
            <span class="monitor-card__count">
              {{ store.integracoes.length }} conectores
            </span>
          </header>

          <ul class="monitor-integ">
            <li
              v-for="i in store.integracoes"
              :key="i.nome"
              class="monitor-integ__item"
            >
              <span
                class="monitor-integ__icon"
                :class="`monitor-integ__icon--${i.estado}`"
              >
                <q-icon :name="i.icon" size="20px" />
              </span>

              <div class="monitor-integ__info">
                <b>{{ i.nome }}</b>
                <small>{{ i.descricao }}</small>
              </div>

              <div class="monitor-integ__right">
                <span
                  class="monitor-integ__lat"
                  :class="`monitor-integ__lat--${i.estado}`"
                >
                  <i class="monitor-integ__dot" />
                  {{ i.latencia }} ms
                </span>
                <small class="monitor-integ__time">{{
                  i.ultimaResposta
                }}</small>
              </div>

              <button
                v-if="i.estado === 'critico'"
                class="monitor-integ__restart"
                title="Reiniciar serviço"
                @click="reiniciar(i.nome)"
              >
                <q-icon name="restart_alt" size="18px" />
              </button>
            </li>
          </ul>
        </section>

        <section class="monitor-card">
          <header class="monitor-card__head">
            <h2 class="monitor-card__title">Actividade</h2>
          </header>

          <div class="monitor-metrics">
            <article
              v-for="m in store.listaMetricas"
              :key="m.label"
              class="monitor-metric"
            >
              <span class="monitor-metric__icon">
                <q-icon :name="m.icon" size="18px" />
              </span>
              <div class="monitor-metric__label">{{ m.label }}</div>
              <div class="monitor-metric__value">{{ m.valor }}</div>
              <div class="monitor-metric__sub">{{ m.sub }}</div>
            </article>
          </div>
        </section>
      </div>

      <!-- ALERTAS -->
      <section class="monitor-card">
        <header class="monitor-card__head">
          <h2 class="monitor-card__title">Alertas activos</h2>

          <div class="monitor-alerts-actions">
            <div class="monitor-alerts-filtro">
              <button
                v-for="f in filtrosAlerta"
                :key="f.valor"
                type="button"
                class="monitor-alerts-chip"
                :class="{ 'is-active': store.filtroAlertas === f.valor }"
                @click="store.filtroAlertas = f.valor"
              >
                {{ f.label }}
              </button>
            </div>

            <button
              v-if="temSilenciados"
              type="button"
              class="monitor-alerts-clear"
              @click="limparSilenciados"
            >
              Limpar silenciados
            </button>
          </div>
        </header>

        <ul v-if="store.alertasVisiveis.length" class="monitor-alertas">
          <li
            v-for="a in store.alertasVisiveis"
            :key="a.id"
            class="monitor-alerta"
            :class="`monitor-alerta--${a.nivel}`"
          >
            <span class="monitor-alerta__icon">
              <q-icon :name="a.icon" size="20px" />
            </span>

            <div class="monitor-alerta__body">
              <b>{{ a.titulo }}</b>
              <span>{{ a.descricao }}</span>
            </div>

            <div class="monitor-alerta__right">
              <span class="monitor-alerta__time">{{ a.hora }}</span>
              <button
                class="monitor-alerta__silence"
                title="Silenciar alerta"
                @click="silenciar(a.id)"
              >
                <q-icon name="notifications_off" size="16px" />
              </button>
            </div>
          </li>
        </ul>

        <div v-else class="monitor-vazio">
          <div class="monitor-vazio__icon">
            <q-icon name="check_circle" size="32px" />
          </div>
          <b>Sem alertas activos</b>
          <p>O sistema está a funcionar normalmente.</p>
        </div>
      </section>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  useAdminMonitorizacaoStore,
  type NivelAlerta,
} from '@/stores/admin/monitorizacao.store'

const $q = useQuasar()
const store = useAdminMonitorizacaoStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Filtros de alertas
// ============================================================
const filtrosAlerta: { valor: '' | NivelAlerta; label: string }[] = [
  { valor: '', label: 'Todos' },
  { valor: 'critico', label: 'Críticos' },
  { valor: 'atencao', label: 'Atenção' },
  { valor: 'info', label: 'Info' },
]

const temSilenciados = computed(() =>
  store.alertas.some((a) => a.silenciado),
)

// ============================================================
// Sparkline — converte array de valores em pontos SVG
// ============================================================
function sparklinePontos(valores: number[]): string {
  if (!valores.length) return ''
  const max = Math.max(...valores, 100)
  const passoX = 100 / Math.max(1, valores.length - 1)
  return valores
    .map((v, i) => {
      const x = i * passoX
      const y = 24 - (v / max) * 24
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

// ============================================================
// Acções
// ============================================================
function reiniciar(nome: string) {
  $q.dialog({
    title: 'Reiniciar serviço',
    message: `Reiniciar o conector "${nome}"? Pode causar indisponibilidade momentânea.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Reiniciar', color: 'primary' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.reiniciarServico(nome)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `${nome} reiniciado`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({
        type: 'negative',
        message: store.erro,
        position: 'top',
      })
    }
  })
}

async function silenciar(id: string) {
  const ok = await store.silenciarAlerta(id)
  if (ok) {
    $q.notify({
      type: 'info',
      message: 'Alerta silenciado',
      position: 'top',
    })
  }
}

function limparSilenciados() {
  $q.dialog({
    title: 'Limpar alertas silenciados',
    message: 'Remover permanentemente todos os alertas silenciados?',
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Limpar', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.limparSilenciados()
    if (ok) {
      $q.notify({
        type: 'positive',
        message: 'Silenciados removidos',
        position: 'top',
      })
    }
  })
}

function exportarSnapshot() {
  const linhas = store.gerarSnapshotCSV()
  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `admin-monitorizacao-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Snapshot exportado',
    position: 'top',
  })
}
</script>

<style scoped lang="scss">
.monitor-page {
  --m-ink: var(--sicam-ink, #0f172a);
  --m-muted: var(--sicam-muted, #64748b);
  --m-line: var(--sicam-line, #e5ebe8);

  --m-ok: #059669;
  --m-ok-bg: var(--sicam-success-bg, #ecfdf5);
  --m-ok-ink: var(--sicam-success-ink, #065f46);
  --m-warn: #f59e0b;
  --m-warn-bg: var(--sicam-warning-bg, #fffbeb);
  --m-warn-ink: var(--sicam-warning-ink, #92400e);
  --m-bad: #dc2626;
  --m-bad-bg: var(--sicam-critical-bg, #fef2f2);
  --m-bad-ink: var(--sicam-critical-ink, #991b1b);

  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
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

.mon-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 0;
}

.sk-head {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .sk-title {
    @extend %sk-block;
    height: 30px;
    width: 380px;
    max-width: 70%;
  }
  .sk-sub {
    @extend %sk-block;
    height: 16px;
    width: 480px;
    max-width: 90%;
  }
}

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.sk-kpi {
  @extend %sk-block;
  height: 260px;
  border-radius: 20px;
}

.sk-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.sk-card {
  @extend %sk-block;
  height: 320px;
  border-radius: 20px;
}

.sk-block {
  @extend %sk-block;
  height: 220px;
  border-radius: 20px;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--m-bad-bg);
  color: var(--m-bad-ink);
  font-size: 13px;
  margin-bottom: 16px;
}

/* ============================================================ */
/* Cabeçalho                                                    */
/* ============================================================ */
.monitor-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;

  @media (max-width: 700px) {
    flex-direction: column;
  }

  &__title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--m-ink);
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 14px;
    color: var(--m-muted);
    margin: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.monitor-stamp {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--m-muted);
  margin: 0 0 20px;
  font-variant-numeric: tabular-nums;
  flex-wrap: wrap;
}

.monitor-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 2s infinite;
  }

  &--regular {
    background: var(--m-ok-bg);
    color: var(--m-ok-ink);
  }
  &--atencao {
    background: var(--m-warn-bg);
    color: var(--m-warn-ink);
  }
  &--critico {
    background: var(--m-bad-bg);
    color: var(--m-bad-ink);
  }
}

.monitor-auto {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &__select {
    border: 1px solid var(--m-line);
    border-radius: 8px;
    padding: 6px 10px;
    font-family: inherit;
    font-size: 13px;
    color: var(--m-ink);
    background: #fff;
    cursor: pointer;

    &:focus {
      outline: 0;
      border-color: #10b981;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.monitor-live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  user-select: none;

  &__input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;

    &:focus-visible + .monitor-live__track {
      outline: 3px solid #10b981;
      outline-offset: 2px;
    }
  }

  &__track {
    position: relative;
    width: 38px;
    height: 22px;
    border-radius: 99px;
    background: #cbd5e1;
    transition: background 0.15s;
  }

  &__thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    transition: transform 0.15s;
  }

  &--on {
    .monitor-live__track {
      background: #10b981;
    }
    .monitor-live__thumb {
      transform: translateX(16px);
    }
  }
}

.monitor-refresh,
.monitor-export {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;

  .spinning {
    animation: spin 1s linear infinite;
  }

  &:focus-visible {
    outline: 3px solid #10b981;
    outline-offset: 2px;
  }
}

.monitor-refresh {
  background: #064e3b;
  color: #fff;
  &:hover:not(:disabled) {
    background: #047857;
  }
  &:disabled {
    opacity: 0.7;
    cursor: progress;
  }
}

.monitor-export {
  background: #fff;
  color: var(--m-ink);
  border: 1px solid var(--m-line);
  &:hover {
    background: var(--sicam-surface-hover, #f6f9f8);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================ */
/* KPIs com anel                                                */
/* ============================================================ */
.monitor-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.monitor-kpi {
  background: #fff;
  border: 1px solid var(--m-line);
  border-radius: 20px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &--atencao {
    border-color: #fde68a;
  }
  &--critico {
    border-color: #fecaca;
  }

  &__head {
    align-self: stretch;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  &__icon {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: var(--m-ok-bg);
    color: var(--m-ok-ink);
  }

  &--atencao &__icon {
    background: var(--m-warn-bg);
    color: var(--m-warn-ink);
  }
  &--critico &__icon {
    background: var(--m-bad-bg);
    color: var(--m-bad-ink);
  }

  &__label {
    flex: 1;
    font-size: 14px;
    font-weight: 700;
    color: var(--m-ink);
  }

  &__nivel {
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 99px;
    background: var(--m-ok-bg);
    color: var(--m-ok-ink);
  }

  &--atencao &__nivel {
    background: var(--m-warn-bg);
    color: var(--m-warn-ink);
  }
  &--critico &__nivel {
    background: var(--m-bad-bg);
    color: var(--m-bad-ink);
  }

  &__ring {
    position: relative;
    width: 124px;
    height: 124px;
    margin-bottom: 12px;
  }

  &__svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  &__track {
    fill: none;
    stroke: #eef2f0;
    stroke-width: 9;
  }

  &__progress {
    fill: none;
    stroke-width: 9;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.6s ease;

    &--regular {
      stroke: var(--m-ok);
    }
    &--atencao {
      stroke: var(--m-warn);
    }
    &--critico {
      stroke: var(--m-bad);
    }
  }

  &__center {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: baseline;
    justify-content: center;
    padding-top: 46px;
    pointer-events: none;
  }

  &__value {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--m-ink);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  &__unidade {
    font-size: 13px;
    font-weight: 700;
    color: var(--m-muted);
    margin-left: 2px;
  }

  &__spark {
    width: 100%;
    height: 24px;
    margin: 4px 0 8px;
    opacity: 0.9;
  }

  &__spark-line {
    fill: none;
    stroke: #10b981;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &--atencao &__spark-line {
    stroke: var(--m-warn);
  }
  &--critico &__spark-line {
    stroke: var(--m-bad);
  }

  &__foot {
    font-size: 12px;
    color: var(--m-muted);
    text-align: center;

    small {
      display: block;
      margin-top: 2px;
      font-size: 11px;
      opacity: 0.8;
    }
  }
}

/* ============================================================ */
/* Grid                                                         */
/* ============================================================ */
.monitor-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

/* ============================================================ */
/* Card                                                         */
/* ============================================================ */
.monitor-card {
  background: #fff;
  border: 1px solid var(--m-line);
  border-radius: 20px;
  padding: 22px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--m-ink);
    margin: 0;
  }

  &__count {
    font-size: 12px;
    font-weight: 600;
    color: #065f46;
    background: #ecfdf5;
    padding: 4px 12px;
    border-radius: 99px;
  }
}

/* ============================================================ */
/* Integrações                                                  */
/* ============================================================ */
.monitor-integ {
  list-style: none;
  padding: 0;
  margin: 0;

  &__item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 0;
    border-top: 1px solid var(--sicam-line-soft, #eef2f0);

    &:first-child {
      border-top: 0;
      padding-top: 0;
    }
    &:last-child {
      padding-bottom: 0;
    }
  }

  &__icon {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 13px;

    &--regular {
      background: var(--m-ok-bg);
      color: var(--m-ok-ink);
    }
    &--atencao {
      background: var(--m-warn-bg);
      color: var(--m-warn-ink);
    }
    &--critico {
      background: var(--m-bad-bg);
      color: var(--m-bad-ink);
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.3;

    b {
      font-size: 15px;
      color: var(--m-ink);
    }
    small {
      font-size: 13px;
      color: var(--m-muted);
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }

  &__lat {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 99px;
    font-variant-numeric: tabular-nums;

    &--regular {
      background: var(--m-ok-bg);
      color: var(--m-ok-ink);
    }
    &--atencao {
      background: var(--m-warn-bg);
      color: var(--m-warn-ink);
    }
    &--critico {
      background: var(--m-bad-bg);
      color: var(--m-bad-ink);
    }
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &__time {
    font-size: 12px;
    color: var(--m-muted);
  }

  &__restart {
    display: inline-grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--m-bad);
    cursor: pointer;
    margin-left: 4px;
    transition: background 0.15s;

    &:hover {
      background: var(--m-bad-bg);
    }
  }
}

/* ============================================================ */
/* Actividade                                                   */
/* ============================================================ */
.monitor-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.monitor-metric {
  padding: 14px;
  background: #f6f9f8;
  border-radius: 16px;

  &__icon {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #fff;
    color: #065f46;
    margin-bottom: 12px;
  }

  &__label {
    font-size: 12px;
    font-weight: 600;
    color: var(--m-muted);
    margin-bottom: 4px;
  }

  &__value {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--m-ink);
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  &__sub {
    font-size: 12px;
    color: var(--m-muted);
    margin-top: 4px;
  }
}

/* ============================================================ */
/* Alertas                                                      */
/* ============================================================ */
.monitor-alerts-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.monitor-alerts-filtro {
  display: inline-flex;
  background: #f6f9f8;
  border-radius: 99px;
  padding: 3px;
}

.monitor-alerts-chip {
  border: 0;
  background: transparent;
  padding: 6px 12px;
  border-radius: 99px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--m-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &.is-active {
    background: #064e3b;
    color: #fff;
  }
}

.monitor-alerts-clear {
  border: 0;
  background: transparent;
  color: var(--m-muted);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;

  &:hover {
    color: var(--m-bad);
    background: var(--m-bad-bg);
  }
}

.monitor-alertas {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.monitor-alerta {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid transparent;

  &--atencao {
    background: var(--m-warn-bg);
    border-color: #fde68a;
    .monitor-alerta__icon {
      background: #fef3c7;
      color: var(--m-warn-ink);
    }
    b {
      color: var(--m-warn-ink);
    }
  }

  &--critico {
    background: var(--m-bad-bg);
    border-color: #fecaca;
    .monitor-alerta__icon {
      background: #fee2e2;
      color: var(--m-bad-ink);
    }
    b {
      color: var(--m-bad-ink);
    }
  }

  &--info {
    background: #f6f9f8;
    border-color: var(--m-line);
    .monitor-alerta__icon {
      background: #fff;
      color: #475569;
    }
    b {
      color: var(--m-ink);
    }
  }

  &__icon {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 11px;
  }

  &__body {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 14px;
      margin-bottom: 2px;
    }
    span {
      display: block;
      font-size: 13px;
      color: #475569;
      line-height: 1.5;
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }

  &__time {
    font-size: 12px;
    color: var(--m-muted);
  }

  &__silence {
    display: inline-grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s, background 0.15s;

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.6);
    }
  }
}

.monitor-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 30px 20px;

  &__icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--m-ok-bg);
    color: var(--m-ok-ink);
    margin-bottom: 14px;
  }

  b {
    font-size: 16px;
    color: var(--m-ink);
    margin-bottom: 4px;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: var(--m-muted);
  }
}

@media (prefers-reduced-motion: reduce) {
  .monitor-status__dot,
  .monitor-refresh .spinning {
    animation: none;
  }
  .monitor-kpi__progress,
  .monitor-live__thumb,
  .monitor-live__track {
    transition: none;
  }
}
</style>