<template>
  <q-page class="rel-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="ina-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-filters" />
      <div class="sk-kpis">
        <div v-for="i in 5" :key="i" class="sk-kpi" />
      </div>
      <div class="sk-charts">
        <div class="sk-chart" />
        <div class="sk-chart" />
      </div>
      <div class="sk-table">
        <div v-for="i in 5" :key="i" class="sk-row" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO REAL                                                 -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Relatórios</h1>
          <p class="page-head__sub">
            Análise de registos, inspecções e cobertura por província
          </p>
        </div>

        <div class="page-head__actions">
          <button class="page-btn" @click="exportarCSV">
            <q-icon name="grid_on" size="18px" />
            Excel (CSV)
          </button>
          <button class="page-btn" @click="exportarPDF">
            <q-icon name="picture_as_pdf" size="18px" />
            PDF
          </button>
        </div>
      </header>

      <!-- FILTROS -->
      <section class="filters-card">
        <div class="quick-periods">
          <button
            v-for="p in periodosRapidos"
            :key="p.key"
            class="quick-period"
            :class="{ 'quick-period--active': store.periodoRapido === p.key }"
            @click="store.definirPeriodoRapido(p.key)"
          >
            {{ p.label }}
          </button>
        </div>

        <div class="filters-row">
          <div class="filter-field">
            <label class="filter-label">De</label>
            <input v-model="store.dataDe" type="date" class="filter-input" />
          </div>

          <div class="filter-field">
            <label class="filter-label">Até</label>
            <input v-model="store.dataAte" type="date" class="filter-input" />
          </div>

          <div class="filter-field">
            <label class="filter-label">Província</label>
            <select v-model="store.filtroProvincia" class="filter-input">
              <option value="">Todas</option>
              <option v-for="p in store.PROVINCIAS" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <div class="filter-field">
            <label class="filter-label">Posto</label>
            <select v-model="store.filtroPosto" class="filter-input">
              <option value="">Todos</option>
              <option v-for="p in store.POSTOS" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <button class="filter-apply" @click="aplicarFiltro">
            <q-icon name="filter_alt" size="18px" />
            Aplicar
          </button>

          <button class="filter-clear" @click="limparFiltro" title="Limpar">
            <q-icon name="close" size="18px" />
          </button>
        </div>
      </section>

      <!-- KPIs -->
      <section class="kpi-grid">
        <div class="kpi">
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="directions_car" size="20px" />
          </div>
          <div>
            <div class="kpi__label">Total registados</div>
            <div class="kpi__value">{{ store.formatar(store.kpis.total) }}</div>
            <div class="kpi__sub">
              <q-icon name="trending_up" size="12px" />
              activos no sistema
            </div>
          </div>
        </div>

        <div class="kpi">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="verified" size="20px" />
          </div>
          <div>
            <div class="kpi__label">Inspecção válida</div>
            <div class="kpi__value">{{ store.formatar(store.kpis.validas) }}</div>
            <div class="kpi__sub">{{ store.kpis.taxa }}% do total</div>
          </div>
        </div>

        <div class="kpi">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="warning" size="20px" />
          </div>
          <div>
            <div class="kpi__label">Inspecção expirada</div>
            <div class="kpi__value kpi__value--critico">{{ store.formatar(store.kpis.expiradas) }}</div>
            <div class="kpi__sub">requer contacto</div>
          </div>
        </div>

        <div class="kpi">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="hourglass_top" size="20px" />
          </div>
          <div>
            <div class="kpi__label">A expirar (30d)</div>
            <div class="kpi__value">{{ store.formatar(store.kpis.aExpirar) }}</div>
            <div class="kpi__sub">notificar proprietários</div>
          </div>
        </div>

        <div class="kpi">
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="schedule" size="20px" />
          </div>
          <div>
            <div class="kpi__label">Tempo médio</div>
            <div class="kpi__value">
              {{ store.kpis.tempoMedio }}<span class="kpi__unid"> min</span>
            </div>
            <div class="kpi__sub">por inspecção</div>
          </div>
        </div>
      </section>

      <!-- GRÁFICOS -->
      <div class="charts-grid">
        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Registos por mês</h2>
            <span class="chart-card__sub">Últimos 6 meses</span>
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

        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Estado das inspecções</h2>
          </header>

          <div class="chart-card__body chart-card__body--ring">
            <div class="ring">
              <svg viewBox="0 0 100 100" class="ring__svg">
                <circle cx="50" cy="50" r="42" class="ring__track" />
                <circle
                  cx="50" cy="50" r="42"
                  class="ring__progress"
                  :stroke-dasharray="store.circunferencia"
                  :stroke-dashoffset="store.offsetRing"
                />
              </svg>
              <div class="ring__center">
                <div class="ring__value">{{ store.kpis.taxa }}</div>
                <div class="ring__label">%</div>
              </div>
            </div>

            <div class="ring-legend">
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--success" />
                Válidas
                <b>{{ store.formatar(store.kpis.validas) }}</b>
              </div>
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--critical" />
                Expiradas
                <b>{{ store.formatar(store.kpis.expiradas) }}</b>
              </div>
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--warning" />
                A expirar
                <b>{{ store.formatar(store.kpis.aExpirar) }}</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- BARRAS -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Registos por província</h2>
          <span class="chart-card__sub">Distribuição nacional</span>
        </header>

        <div class="chart-card__body">
          <div class="bar-chart">
            <div
              v-for="(b, i) in store.registosPorProvinciaComPercentagem"
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

            <div v-if="!store.registosPorProvinciaComPercentagem.length" class="bar-chart__empty">
              Sem dados de províncias
            </div>
          </div>
        </div>
      </section>

      <!-- TABELAS -->
      <div class="tables-grid">
        <section class="block">
          <header class="block__head">
            <h2 class="block__title">Top marcas registadas</h2>
            <span class="block__sub">Top 5</span>
          </header>

          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Marca</th>
                <th>Veículos</th>
                <th>% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(m, i) in store.topMarcas" :key="m.marca">
                <td><b>{{ i + 1 }}</b></td>
                <td><b>{{ m.marca }}</b></td>
                <td>{{ store.formatar(m.veiculos) }}</td>
                <td>{{ m.percentagem }}%</td>
              </tr>
              <tr v-if="!store.topMarcas.length">
                <td colspan="4" style="text-align:center;color:var(--sicam-muted);">
                  Sem dados
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="block">
          <header class="block__head">
            <h2 class="block__title">Top infrações</h2>
            <span class="block__sub">Este mês</span>
          </header>

          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Total</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(inf, i) in store.topInfracoes" :key="inf.tipo">
                <td><b>{{ i + 1 }}</b></td>
                <td><b>{{ inf.tipo }}</b></td>
                <td>{{ store.formatar(inf.total) }}</td>
                <td>{{ inf.percentagem }}%</td>
              </tr>
              <tr v-if="!store.topInfracoes.length">
                <td colspan="4" style="text-align:center;color:var(--sicam-muted);">
                  Sem dados
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <!-- INSPECÇÕES POR POSTO -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">Inspecções por posto</h2>
          <span class="block__sub">Este mês</span>
        </header>

        <table class="data-table">
          <thead>
            <tr>
              <th>Posto</th>
              <th>Província</th>
              <th>Realizadas</th>
              <th>Aprovadas</th>
              <th>Reprovadas</th>
              <th>Taxa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in store.inspecoesPorPosto" :key="p.posto">
              <td><b>{{ p.posto }}</b></td>
              <td>{{ p.provincia }}</td>
              <td>{{ p.realizadas }}</td>
              <td class="text-success">{{ p.aprovadas }}</td>
              <td class="text-critical">{{ p.reprovadas }}</td>
              <td>
                <div class="taxa">
                  <div class="taxa__bar">
                    <div class="taxa__fill" :style="{ width: `${p.taxa}%` }" />
                  </div>
                  <span class="taxa__value">{{ p.taxa }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="!store.inspecoesPorPosto.length">
              <td colspan="6" style="text-align:center;color:var(--sicam-muted);">
                Sem inspecções registadas
              </td>
            </tr>
            <tr v-else class="data-table__total">
              <td><b>Total</b></td>
              <td>—</td>
              <td><b>{{ store.totaisPostos.realizadas }}</b></td>
              <td class="text-success"><b>{{ store.totaisPostos.aprovadas }}</b></td>
              <td class="text-critical"><b>{{ store.totaisPostos.reprovadas }}</b></td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useInatroRelatoriosStore } from '@/stores/inatro/inatro-RelatoriosStore'

const store = useInatroRelatoriosStore()
const $q = useQuasar()

// ============================================================
// Períodos rápidos
// ============================================================
const periodosRapidos: { key: '7d' | '30d' | '90d' | 'ano'; label: string }[] = [
  { key: '7d',  label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: 'ano', label: 'Último ano' },
]

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Aplicar / Limpar filtros
// ============================================================
async function aplicarFiltro() {
  await store.carregar()
  $q.notify({
    type: 'positive',
    message: 'Relatório actualizado',
    position: 'top',
  })
}

function limparFiltro() {
  store.limparFiltros()
  $q.notify({
    type: 'info',
    message: 'Filtros limpos',
    position: 'top',
  })
}

// ============================================================
// Gráfico de linha
// ============================================================
const valores = computed(() => store.registosPorMes.map((m) => m.valor))
const labelsX = computed(() => store.registosPorMes.map((m) => m.mes))

const maxY = computed(() => {
  const max = Math.max(...valores.value, 1)
  return Math.ceil(max / 50) * 50 || 50
})

const labelsY = computed(() => [0, Math.round(maxY.value / 2), maxY.value])
const gridY = [20, 110, 200]

interface Ponto { x: number; y: number }

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
// Exportar CSV
// ============================================================
function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — INATRO — Relatório de Registos e Inspecções'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['RESUMO'],
    ['Total registados', String(store.kpis.total)],
    ['Inspecção válida', String(store.kpis.validas)],
    ['Inspecção expirada', String(store.kpis.expiradas)],
    ['A expirar (30d)', String(store.kpis.aExpirar)],
    ['Taxa de regularidade', `${store.kpis.taxa}%`],
    ['Tempo médio (min)', String(store.kpis.tempoMedio)],
    [],
    ['INSPECÇÕES POR POSTO'],
    ['Posto', 'Província', 'Realizadas', 'Aprovadas', 'Reprovadas', 'Taxa'],
    ...store.inspecoesPorPosto.map((p) => [
      p.posto, p.provincia, String(p.realizadas),
      String(p.aprovadas), String(p.reprovadas), `${p.taxa}%`,
    ]),
    [],
    ['TOP MARCAS'],
    ['#', 'Marca', 'Veículos', '% do total'],
    ...store.topMarcas.map((m, i) => [
      String(i + 1), m.marca, String(m.veiculos), `${m.percentagem}%`,
    ]),
    [],
    ['TOP INFRAÇÕES'],
    ['#', 'Tipo', 'Total', '%'],
    ...store.topInfracoes.map((inf, i) => [
      String(i + 1), inf.tipo, String(inf.total), `${inf.percentagem}%`,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inatro-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}

// ============================================================
// Exportar PDF
// ============================================================
function exportarPDF() {
  window.print()
  $q.notify({
    type: 'info',
    message: 'Escolha "Guardar como PDF" no destino de impressão.',
    position: 'top',
  })
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

.ina-skeleton { display: flex; flex-direction: column; gap: 20px; }

.sk-head {
  display: flex; flex-direction: column; gap: 8px;
  .sk-title { @extend %sk-block; height: 28px; width: 320px; max-width: 60%; }
  .sk-sub   { @extend %sk-block; height: 16px; width: 440px; max-width: 80%; }
}

.sk-filters { @extend %sk-block; height: 120px; }

.sk-kpis {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px;
  @media (max-width: 1000px) { grid-template-columns: repeat(2, 1fr); }
}

.sk-kpi { @extend %sk-block; height: 100px; }

.sk-charts {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.sk-chart { @extend %sk-block; height: 260px; }

.sk-table {
  display: flex; flex-direction: column; gap: 12px;
  padding: 20px; background: #fff; border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sk-row {
  height: 40px; border-radius: 8px;
  background: linear-gradient(90deg,
    rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.07) 50%, rgba(0, 0, 0, 0.04) 100%);
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s infinite linear;
}

.bar-chart__empty {
  text-align: center;
  color: var(--sicam-muted);
  font-size: 13px;
  padding: 20px 0;
}

/* ============================================================ */
/* Cabeçalho                                                    */
/* ============================================================ */
.page-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 20px;
  @media (max-width: 700px) { flex-direction: column; }
  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0; }
  &__actions { display: flex; gap: 10px; flex-wrap: wrap; }
}

.page-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; border: 1px solid var(--sicam-line); border-radius: 10px;
  padding: 10px 18px; font-size: 14px; font-weight: 600; color: var(--sicam-ink);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  &:hover { background: var(--sicam-surface-hover); border-color: var(--sicam-line-strong); }
}

/* ============================================================ */
/* Filtros                                                      */
/* ============================================================ */
.filters-card {
  background: #fff; border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;
}

.quick-periods { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }

.quick-period {
  padding: 7px 14px; border-radius: 99px;
  background: var(--sicam-surface-alt); border: 1px solid var(--sicam-line);
  font-family: inherit; font-size: 13px; font-weight: 600;
  color: var(--sicam-ink-soft); cursor: pointer; transition: all 0.15s;
  &:hover { background: var(--sicam-surface-hover); }
  &--active {
    background: var(--sicam-primary-light); color: #fff;
    border-color: var(--sicam-primary-light);
  }
}

.filters-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
.filter-field { flex: 1; min-width: 160px; }
.filter-label {
  display: block; font-size: 11px; color: var(--sicam-muted);
  text-transform: uppercase; letter-spacing: 0.05em;
  margin-bottom: 6px; font-weight: 600;
}
.filter-input {
  width: 100%; border: 1px solid var(--sicam-line); border-radius: 8px;
  padding: 9px 12px; font-size: 14px; font-family: inherit;
  color: var(--sicam-ink); background: var(--sicam-surface-alt);
  &:focus { outline: 0; border-color: var(--sicam-primary-light); }
}
.filter-apply {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--sicam-primary-light); color: #fff; border: 0;
  border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  &:hover { background: var(--sicam-primary); }
}
.filter-clear {
  background: #fff; border: 1px solid var(--sicam-line); border-radius: 8px;
  width: 40px; height: 40px; display: grid; place-items: center;
  color: var(--sicam-muted); cursor: pointer;
  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
}

/* ============================================================ */
/* KPIs                                                         */
/* ============================================================ */
.kpi-grid {
  display: grid; grid-template-columns: repeat(5, 1fr);
  gap: 14px; margin-bottom: 20px;
  @media (max-width: 1000px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px)  { grid-template-columns: 1fr; }
}
.kpi {
  display: flex; align-items: flex-start; gap: 12px;
  background: #fff; border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: transform 0.1s, box-shadow 0.15s;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); }
  &__icon {
    width: 40px; height: 40px; border-radius: 10px; display: grid;
    place-items: center; flex-shrink: 0;
    &--primary  { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  }
  &__label {
    font-size: 11px; color: var(--sicam-muted);
    text-transform: uppercase; letter-spacing: 0.05em;
    font-weight: 600; margin-bottom: 6px;
  }
  &__value {
    font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1;
    &--critico { color: var(--sicam-critical); }
  }
  &__unid { font-size: 13px; font-weight: 500; color: var(--sicam-muted); }
  &__sub {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; color: var(--sicam-muted); margin-top: 4px;
  }
}

/* ============================================================ */
/* Charts                                                       */
/* ============================================================ */
.charts-grid {
  display: grid; grid-template-columns: 1.4fr 1fr;
  gap: 20px; margin-bottom: 20px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}
.chart-card {
  background: #fff; border-radius: 14px; padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;
  &__head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub { font-size: 12px; color: var(--sicam-muted); }
  &__body { width: 100%; }
  &__body--ring {
    display: flex; align-items: center; justify-content: space-around; gap: 24px;
    @media (max-width: 500px) { flex-direction: column; }
  }
}
.line-chart {
  width: 100%; height: auto;
  &__grid { stroke: var(--sicam-line-soft); stroke-width: 1; }
  &__axis { font-size: 10px; fill: var(--sicam-muted); }
  &__area { fill: rgba(16, 185, 129, 0.12); }
  &__line { fill: none; stroke: var(--sicam-primary-light); stroke-width: 2.5;
    stroke-linecap: round; stroke-linejoin: round; }
  &__dot { fill: #fff; stroke: var(--sicam-primary-light); stroke-width: 2.5; }
}
.ring {
  position: relative; width: 160px; height: 160px; flex-shrink: 0;
  &__svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  &__track { fill: none; stroke: var(--sicam-line-soft); stroke-width: 10; }
  &__progress { fill: none; stroke: var(--sicam-success); stroke-width: 10;
    stroke-linecap: round; transition: stroke-dashoffset 0.6s ease; }
  &__center { position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; gap: 2px; pointer-events: none; }
  &__value { font-size: 34px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 16px; font-weight: 600; color: var(--sicam-muted); padding-bottom: 4px; }
}
.ring-legend {
  display: flex; flex-direction: column; gap: 12px; min-width: 160px;
  &__item {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--sicam-ink-soft);
    b { color: var(--sicam-ink); font-weight: 700; margin-left: auto; }
  }
  &__dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    &--success  { background: var(--sicam-success); }
    &--critical { background: var(--sicam-critical); }
    &--warning  { background: var(--sicam-warning); }
  }
}
.bar-chart {
  display: flex; flex-direction: column; gap: 14px;
  &__row { display: grid; grid-template-columns: 160px 1fr 60px;
    align-items: center; gap: 12px;
    @media (max-width: 600px) { grid-template-columns: 100px 1fr 50px; } }
  &__label { font-size: 13px; color: var(--sicam-ink); text-align: right;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__bar { height: 10px; background: var(--sicam-line-soft);
    border-radius: 99px; overflow: hidden; }
  &__fill { height: 100%; background: var(--sicam-primary-light);
    border-radius: 99px; transition: width 0.5s ease; }
  &__value { font-size: 13px; font-weight: 700; color: var(--sicam-ink); text-align: right; }
}

/* ============================================================ */
/* Tabelas                                                      */
/* ============================================================ */
.tables-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  @media (max-width: 800px) { grid-template-columns: 1fr; }
}
.block {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;
  &__head { display: flex; align-items: baseline; justify-content: space-between;
    padding: 18px 20px 14px; border-bottom: 1px solid var(--sicam-line-soft); }
  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub { font-size: 12px; color: var(--sicam-muted); }
}
.data-table {
  width: 100%; border-collapse: collapse;
  th { text-align: left; font-size: 11px; font-weight: 600; color: var(--sicam-muted);
    letter-spacing: 0.05em; text-transform: uppercase; padding: 12px 16px;
    background: #fafbfa; border-bottom: 1px solid var(--sicam-line); white-space: nowrap; }
  td { padding: 14px 16px; font-size: 14px; color: var(--sicam-ink);
    border-bottom: 1px solid var(--sicam-line-soft); vertical-align: middle; }
  tr:last-child td { border-bottom: 0; }
  tbody tr:hover { background: #fbfdfc; }
  &__total {
    background: var(--sicam-surface-alt);
    td { border-top: 2px solid var(--sicam-line); padding-top: 14px; padding-bottom: 14px; }
  }
}
.text-success { color: var(--sicam-success); font-weight: 600; }
.text-critical { color: var(--sicam-critical); font-weight: 600; }
.taxa {
  display: flex; align-items: center; gap: 10px;
  &__bar { width: 70px; height: 6px; background: var(--sicam-line-soft);
    border-radius: 99px; overflow: hidden; }
  &__fill { height: 100%; background: var(--sicam-primary-light);
    border-radius: 99px; transition: width 0.4s ease; }
  &__value { font-size: 13px; font-weight: 600; color: var(--sicam-ink);
    min-width: 36px; text-align: right; }
}

@media print {
  .page-head__actions, .filters-card, .quick-periods,
  .filter-apply, .filter-clear, .page-btn, .ina-skeleton { display: none !important; }
  .rel-page { padding: 0; max-width: 100%; }
  .chart-card, .block, .kpi { box-shadow: none; border: 1px solid var(--sicam-line);
    page-break-inside: avoid; }
}
</style>