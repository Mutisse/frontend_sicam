<template>
  <q-page class="rel-page">
    <!-- SKELETON -->
    <div v-if="!store.carregado" class="ina-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-filters" />
      <div class="sk-kpis">
        <div v-for="i in 4" :key="i" class="sk-kpi" />
      </div>
      <div class="sk-charts">
        <div class="sk-chart" />
        <div class="sk-chart" />
      </div>
      <div class="sk-table">
        <div v-for="i in 4" :key="i" class="sk-row" />
      </div>
    </div>

    <!-- CONTEÚDO REAL -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Relatórios</h1>
          <p class="page-head__sub">
            Análise de desempenho do posto — agentes, patrulhas e conformidade
          </p>
        </div>

        <div class="page-head__actions">
          <button
            class="page-btn page-btn--outline"
            :disabled="store.aCarregar"
            @click="exportarCSV"
          >
            <q-icon name="grid_on" size="18px" />
            Excel (CSV)
          </button>
          <button
            class="page-btn page-btn--outline"
            :disabled="store.aCarregar"
            @click="exportarPDF"
          >
            <q-icon name="picture_as_pdf" size="18px" />
            PDF
          </button>
        </div>
      </header>

      <!-- PERÍODO -->
      <section class="period">
        <div class="period__field">
          <label class="period__label">De</label>
          <input v-model="store.dataDe" type="date" class="period__input" />
        </div>
        <div class="period__field">
          <label class="period__label">Até</label>
          <input v-model="store.dataAte" type="date" class="period__input" />
        </div>
        <button class="period__btn" :disabled="store.aCarregar" @click="aplicarFiltro">
          Aplicar
        </button>
      </section>

      <!-- KPIs -->
      <section class="kpi-grid">
        <article class="kpi-card kpi-card--info">
          <span class="kpi-card__glow" />
          <header class="kpi-card__head">
            <span class="kpi-card__label">Consultas</span>
          </header>
          <div class="kpi-card__body">
            <div class="kpi-card__value">
              {{ store.formatar(store.kpis.consultas) }}
            </div>
            <div class="kpi-card__icon">
              <q-icon name="search" size="26px" />
            </div>
          </div>
          <footer class="kpi-card__foot">
            <span class="kpi-card__trend kpi-card__trend--up">
              <q-icon name="trending_up" size="14px" />
              +12%
            </span>
            <span class="kpi-card__sub">No período</span>
          </footer>
        </article>

        <article class="kpi-card kpi-card--atencao">
          <span class="kpi-card__glow" />
          <header class="kpi-card__head">
            <span class="kpi-card__label">Autos emitidos</span>
          </header>
          <div class="kpi-card__body">
            <div class="kpi-card__value">{{ store.kpis.autos }}</div>
            <div class="kpi-card__icon">
              <q-icon name="receipt_long" size="26px" />
            </div>
          </div>
          <footer class="kpi-card__foot">
            <span class="kpi-card__trend kpi-card__trend--up">
              <q-icon name="trending_up" size="14px" />
              +8%
            </span>
            <span class="kpi-card__sub">No período</span>
          </footer>
        </article>

        <article class="kpi-card kpi-card--regular">
          <span class="kpi-card__glow" />
          <header class="kpi-card__head">
            <span class="kpi-card__label">Abordagens</span>
          </header>
          <div class="kpi-card__body">
            <div class="kpi-card__value">{{ store.kpis.abordagens }}</div>
            <div class="kpi-card__icon">
              <q-icon name="visibility" size="26px" />
            </div>
          </div>
          <footer class="kpi-card__foot">
            <span class="kpi-card__trend kpi-card__trend--up">
              <q-icon name="trending_up" size="14px" />
              +18%
            </span>
            <span class="kpi-card__sub">No período</span>
          </footer>
        </article>

        <article class="kpi-card kpi-card--regular">
          <span class="kpi-card__glow" />
          <header class="kpi-card__head">
            <span class="kpi-card__label">Conformidade</span>
          </header>
          <div class="kpi-card__body">
            <div class="kpi-card__value">
              {{ store.kpis.conformidade.toFixed(1).replace('.', ',') }}
              <span class="kpi-card__unid">%</span>
            </div>
            <div class="kpi-card__icon">
              <q-icon name="verified_user" size="26px" />
            </div>
          </div>
          <footer class="kpi-card__foot">
            <span class="kpi-card__trend kpi-card__trend--up">
              <q-icon name="trending_up" size="14px" />
              +2%
            </span>
            <span class="kpi-card__sub">Patrulhas concluídas</span>
          </footer>
        </article>
      </section>

      <!-- GRÁFICOS -->
      <div class="charts-grid">
        <!-- Linha — Consultas por dia -->
        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Consultas por dia</h2>
            <span class="chart-card__sub">Últimos 7 dias</span>
          </header>

          <div class="chart-card__body">
            <svg viewBox="0 0 420 220" class="line-chart">
              <line
                v-for="(y, i) in gridY"
                :key="`gy-${i}`"
                :x1="40"
                :y1="y"
                :x2="410"
                :y2="y"
                class="line-chart__grid"
              />

              <text
                v-for="(label, i) in labelsY"
                :key="`ly-${i}`"
                :x="30"
                :y="gridY[i]! + 4"
                class="line-chart__axis"
                text-anchor="end"
              >
                {{ label }}
              </text>

              <path :d="areaPath" class="line-chart__area" />
              <path :d="linePath" class="line-chart__line" />

              <circle
                v-for="(p, i) in pontos"
                :key="`p-${i}`"
                :cx="p.x"
                :cy="p.y"
                r="4"
                class="line-chart__dot"
              />

              <text
                v-for="(label, i) in labelsX"
                :key="`lx-${i}`"
                :x="40 + i * (370 / Math.max(labelsX.length - 1, 1))"
                :y="215"
                class="line-chart__axis"
                text-anchor="middle"
              >
                {{ label }}
              </text>
            </svg>
          </div>
        </section>

        <!-- Anel — Taxa de conformidade -->
        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Taxa de conformidade</h2>
            <span class="chart-card__sub">Patrulhas concluídas</span>
          </header>

          <div class="chart-card__body chart-card__body--ring">
            <div class="ring">
              <svg viewBox="0 0 100 100" class="ring__svg">
                <circle cx="50" cy="50" r="42" class="ring__track" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  class="ring__progress"
                  :stroke-dasharray="store.circunferencia"
                  :stroke-dashoffset="store.offsetRing"
                />
              </svg>
              <div class="ring__center">
                <div class="ring__value">
                  {{ store.kpis.conformidade.toFixed(1).replace('.', ',') }}
                </div>
                <div class="ring__label">%</div>
              </div>
            </div>

            <div class="ring-legend">
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--success" />
                Conformes
                <b>{{ store.formatar(store.kpis.conformes) }}</b>
              </div>
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--critical" />
                Não conformes
                <b>{{ store.formatar(store.kpis.naoConformes) }}</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- BARRAS — Consultas por agente -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Consultas por agente</h2>
          <span class="chart-card__sub">No período</span>
        </header>

        <div class="chart-card__body">
          <div v-if="store.consultasPorAgente.length" class="bar-chart">
            <div
              v-for="(b, i) in store.consultasPorAgente"
              :key="i"
              class="bar-chart__row"
            >
              <div class="bar-chart__label">{{ b.nome }}</div>
              <div class="bar-chart__bar">
                <div
                  class="bar-chart__fill"
                  :style="{ width: `${b.percentagem}%` }"
                />
              </div>
              <div class="bar-chart__value">{{ store.formatar(b.valor) }}</div>
            </div>
          </div>
          <div v-else class="chart-empty">Sem dados no período</div>
        </div>
      </section>

      <!-- TABELA — Desempenho por agente -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">Desempenho por agente</h2>
          <span class="block__sub">No período</span>
        </header>

        <table class="data-table">
          <thead>
            <tr>
              <th>Agente</th>
              <th>Consultas</th>
              <th>Autos</th>
              <th>Abordagens</th>
              <th>Regularidade</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in store.desempenhoPorAgente" :key="a.nome">
              <td>
                <div class="agente-cell">
                  <div class="agente-cell__avatar">
                    {{ store.iniciais(a.nome) }}
                  </div>
                  <b>{{ a.nome }}</b>
                </div>
              </td>
              <td>{{ store.formatar(a.consultas) }}</td>
              <td>{{ a.autos }}</td>
              <td>{{ a.abordagens }}</td>
              <td>
                <div class="taxa">
                  <div class="taxa__bar">
                    <div
                      class="taxa__fill"
                      :style="{ width: `${a.regularidade}%` }"
                    />
                  </div>
                  <span class="taxa__value">{{ a.regularidade }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="!store.desempenhoPorAgente.length">
              <td colspan="5" style="text-align:center;color:var(--sicam-muted);">
                Sem dados no período
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- TABELA — Resumo por patrulha -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">Resumo por patrulha</h2>
          <span class="block__sub">No período</span>
        </header>

        <table class="data-table">
          <thead>
            <tr>
              <th>Patrulha</th>
              <th>Data</th>
              <th>Agente</th>
              <th>Duração</th>
              <th>Veículos</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in store.resumoPatrulhas" :key="p.codigo">
              <td><b>{{ p.codigo }}</b></td>
              <td class="table-time">{{ p.data }}</td>
              <td>{{ p.agente }}</td>
              <td>{{ p.duracao }}</td>
              <td>{{ p.veiculos }}</td>
              <td>
                <span class="badge" :class="`badge--${p.estadoClasse}`">
                  {{ p.estado }}
                </span>
              </td>
            </tr>
            <tr v-if="!store.resumoPatrulhas.length">
              <td colspan="6" style="text-align:center;color:var(--sicam-muted);">
                Sem patrulhas no período
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div v-if="store.erro" class="form-error">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useChefeRelatoriosStore } from '@/stores/chefe/chefe-RelatoriosStore'
import { relatoriosChefeService } from '@/services/chefe/relatorios.service'

const store = useChefeRelatoriosStore()
const $q = useQuasar()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Gráfico de linha
// ============================================================
const valores = computed(() => store.consultasPorDia.map((d) => d.consultas))
const labelsX = computed(() => store.consultasPorDia.map((d) => d.dia))

const maxY = computed(() => {
  const max = Math.max(...valores.value, 1)
  return Math.ceil(max / 20) * 20 || 20
})

const labelsY = computed(() => [0, Math.round(maxY.value / 2), maxY.value])
const gridY = [20, 110, 200]

interface Ponto {
  x: number
  y: number
}

const pontos = computed<Ponto[]>(() =>
  valores.value.map((v, i) => ({
    x: 40 + i * (370 / Math.max(valores.value.length - 1, 1)),
    y: 200 - (v / maxY.value) * 180,
  })),
)

const linePath = computed(() => {
  const pts = pontos.value
  if (pts.length === 0) return ''
  return pts
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' ')
})

const areaPath = computed(() => {
  const pts = pontos.value
  if (pts.length === 0) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  if (!first || !last) return ''
  const line = pts
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' ')
  return `${line} L${last.x},200 L${first.x},200 Z`
})

// ============================================================
// Aplicar filtro
// ============================================================
async function aplicarFiltro() {
  await store.carregar()
  $q.notify({
    type: 'positive',
    message: 'Relatório actualizado.',
    position: 'top',
  })
}

// ============================================================
// Exportar Excel (XLSX do backend)
// ============================================================
async function exportarCSV() {
  try {
    const filtros: { data_de?: string; data_ate?: string } = {}
    if (store.dataDe) filtros.data_de = store.dataDe
    if (store.dataAte) filtros.data_ate = store.dataAte

    const blob = await relatoriosChefeService.exportarXlsx(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-chefe-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: 'Ficheiro Excel exportado.',
      position: 'top',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar Excel.',
      position: 'top',
    })
  }
}

// ============================================================
// Exportar PDF (backend)
// ============================================================
async function exportarPDF() {
  try {
    const filtros: { data_de?: string; data_ate?: string } = {}
    if (store.dataDe) filtros.data_de = store.dataDe
    if (store.dataAte) filtros.data_ate = store.dataAte

    const blob = await relatoriosChefeService.exportarPdf(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-chefe-${new Date().toISOString().slice(0, 10)}.pdf`
    a.click()
    URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: 'Ficheiro PDF exportado.',
      position: 'top',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar PDF.',
      position: 'top',
    })
  }
}
</script>

<style scoped lang="scss">
.rel-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

/* ============================================================ */
/* SKELETON                                                     */
/* ============================================================ */
@keyframes sk-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
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

.ina-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sk-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  .sk-title { @extend %sk-block; height: 28px; width: 320px; max-width: 60%; }
  .sk-sub   { @extend %sk-block; height: 16px; width: 440px; max-width: 80%; }
}

.sk-filters { @extend %sk-block; height: 90px; }

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
}

.sk-kpi { @extend %sk-block; height: 120px; }

.sk-charts {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.sk-chart { @extend %sk-block; height: 260px; }

.sk-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sk-row {
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.04) 0%,
    rgba(0, 0, 0, 0.07) 50%,
    rgba(0, 0, 0, 0.04) 100%
  );
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s infinite linear;
}

.chart-empty {
  text-align: center;
  padding: 30px 0;
  color: var(--sicam-muted);
  font-size: 13px;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--sicam-critical-bg);
  color: var(--sicam-critical-ink);
  font-size: 13px;
  margin-top: 16px;
}

/* ============================================================ */
/* Cabeçalho                                                    */
/* ============================================================ */
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 700px) { flex-direction: column; }

  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub   { font-size: 14px; color: var(--sicam-muted); margin: 0; }
  &__actions { display: flex; gap: 10px; flex-wrap: wrap; }
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sicam-ink);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: var(--sicam-surface-hover);
    border-color: var(--sicam-line-strong);
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

/* ============================================================ */
/* Período                                                      */
/* ============================================================ */
.period {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;

  &__field { flex: 1; min-width: 180px; }

  &__label {
    display: block;
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
    font-weight: 600;
  }

  &__input {
    width: 100%;
    border: 1px solid var(--sicam-line);
    border-radius: 8px;
    padding: 9px 12px;
    font-size: 14px;
    font-family: inherit;
    color: var(--sicam-ink);
    background: var(--sicam-surface-alt);

    &:focus { outline: 0; border-color: var(--sicam-primary-light); }
  }

  &__btn {
    background: var(--sicam-primary-light);
    color: #fff;
    border: 0;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;

    &:hover:not(:disabled) { background: var(--sicam-primary); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}

/* ============================================================ */
/* KPIs                                                         */
/* ============================================================ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.kpi-card {
  position: relative;
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--sicam-line-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  transition: all 0.25s ease;

  &__glow {
    position: absolute;
    top: -40px; right: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    opacity: 0.10;
    filter: blur(20px);
    transition: opacity 0.25s ease;
    pointer-events: none;
  }

  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
    .kpi-card__glow { opacity: 0.18; }
  }

  &__head { display: flex; align-items: center; justify-content: space-between; }

  &__label {
    font-size: 11px;
    color: var(--sicam-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__value {
    font-size: 28px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  &__unid { font-size: 16px; font-weight: 600; color: var(--sicam-muted); margin-left: 2px; }

  &__icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: transform 0.25s ease;

    .kpi-card:hover & { transform: scale(1.08) rotate(-3deg); }
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 12px;
    border-top: 1px solid var(--sicam-line-soft);
    margin-top: auto;
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 99px;
    flex-shrink: 0;

    &--up   { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--down { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__sub {
    font-size: 11px;
    color: var(--sicam-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
  }

  &--critico { .kpi-card__glow { background: var(--sicam-critical); } .kpi-card__icon { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); } }
  &--atencao { .kpi-card__glow { background: var(--sicam-warning); }  .kpi-card__icon { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); } }
  &--regular { .kpi-card__glow { background: var(--sicam-success); }  .kpi-card__icon { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); } }
  &--info    { .kpi-card__glow { background: #2563eb; }               .kpi-card__icon { background: #dbeafe; color: #2563eb; } }
  &--neutral { .kpi-card__glow { background: var(--sicam-neutral); }  .kpi-card__icon { background: var(--sicam-neutral-bg); color: var(--sicam-neutral-ink); } }
}

/* ============================================================ */
/* Charts                                                       */
/* ============================================================ */
.charts-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.chart-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub   { font-size: 12px; color: var(--sicam-muted); }

  &__body { width: 100%; }

  &__body--ring {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 24px;

    @media (max-width: 500px) { flex-direction: column; }
  }
}

.line-chart {
  width: 100%;
  height: auto;

  &__grid { stroke: var(--sicam-line-soft); stroke-width: 1; }
  &__axis { font-size: 10px; fill: var(--sicam-muted); }
  &__area { fill: rgba(5, 150, 105, 0.12); }
  &__line {
    fill: none;
    stroke: var(--sicam-primary-light);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  &__dot { fill: #fff; stroke: var(--sicam-primary-light); stroke-width: 2.5; }
}

.ring {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;

  &__svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  &__track { fill: none; stroke: var(--sicam-line-soft); stroke-width: 10; }
  &__progress {
    fill: none;
    stroke: var(--sicam-success);
    stroke-width: 10;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.6s ease;
  }
  &__center {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    pointer-events: none;
  }
  &__value { font-size: 30px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 14px; font-weight: 600; color: var(--sicam-muted); padding-bottom: 4px; }
}

.ring-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--sicam-ink-soft);

    b { color: var(--sicam-ink); font-weight: 700; margin-left: auto; }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;

    &--success  { background: var(--sicam-success); }
    &--critical { background: var(--sicam-critical); }
  }
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__row {
    display: grid;
    grid-template-columns: 130px 1fr 70px;
    align-items: center;
    gap: 12px;

    @media (max-width: 600px) { grid-template-columns: 100px 1fr 60px; }
  }

  &__label {
    font-size: 13px;
    color: var(--sicam-ink);
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__bar {
    height: 10px;
    background: var(--sicam-line-soft);
    border-radius: 99px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: var(--sicam-primary-light);
    border-radius: 99px;
    transition: width 0.5s ease;
  }

  &__value { font-size: 13px; font-weight: 700; color: var(--sicam-ink); text-align: right; }
}

/* ============================================================ */
/* Blocos / Tabelas                                             */
/* ============================================================ */
.block {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub   { font-size: 12px; color: var(--sicam-muted); }
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: var(--sicam-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 12px 16px;
    background: #fafbfa;
    border-bottom: 1px solid var(--sicam-line);
    white-space: nowrap;
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--sicam-ink);
    border-bottom: 1px solid var(--sicam-line-soft);
    vertical-align: middle;
  }

  tr:last-child td { border-bottom: 0; }
  tbody tr:hover { background: #fbfdfc; }
}

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }

.agente-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  b { font-weight: 600; }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }
}

.taxa {
  display: flex;
  align-items: center;
  gap: 10px;

  &__bar {
    width: 70px;
    height: 6px;
    background: var(--sicam-line-soft);
    border-radius: 99px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: var(--sicam-primary-light);
    border-radius: 99px;
    transition: width 0.4s ease;
  }

  &__value { font-size: 13px; font-weight: 600; color: var(--sicam-ink); }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--neutral { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
}

/* ============================================================ */
/* Impressão                                                    */
/* ============================================================ */
@media print {
  .page-head__actions,
  .period,
  .page-btn,
  .ina-skeleton {
    display: none !important;
  }

  .rel-page { padding: 0; max-width: 100%; }

  .chart-card,
  .block,
  .kpi-card {
    box-shadow: none;
    border: 1px solid var(--sicam-line);
    page-break-inside: avoid;
  }
}
</style>