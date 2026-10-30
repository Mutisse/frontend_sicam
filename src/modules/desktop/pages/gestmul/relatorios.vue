<template>
  <q-page class="rl-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="rl-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-filters">
        <div class="sk-pill" />
        <div class="sk-pill" />
        <div class="sk-pill" />
      </div>
      <div class="sk-kpis">
        <div v-for="i in 4" :key="`sk-kpi-${i}`" class="sk-kpi" />
      </div>
      <div class="sk-charts">
        <div class="sk-chart" />
        <div class="sk-chart" />
      </div>
      <div class="sk-block" />
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Relatórios</h1>
          <p class="page-head__sub">
            Análise de cobrança, infrações e desempenho por província
          </p>
        </div>

        <div class="page-head__actions">
          <button
            class="page-btn page-btn--outline"
            :disabled="store.aCarregar"
            @click="exportarCSV"
          >
            <q-icon name="grid_on" size="18px" />
            Excel
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

      <!-- ERRO -->
      <div v-if="store.erro" class="form-error">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

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
              <option v-for="p in store.PROVINCIAS" :key="p" :value="p">
                {{ p }}
              </option>
            </select>
          </div>

          <button
            class="filter-apply"
            :disabled="store.aCarregar"
            @click="aplicarFiltro"
          >
            <q-icon name="filter_alt" size="18px" />
            {{ store.aCarregar ? 'A carregar…' : 'Aplicar' }}
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
            <q-icon name="receipt_long" size="20px" />
          </div>
          <div>
            <div class="kpi__label">Multas emitidas</div>
            <div class="kpi__value">
              {{ store.formatar(store.kpis.emitidas) }}
            </div>
            <div class="kpi__sub">
              <q-icon name="schedule" size="12px" />
              Período seleccionado
            </div>
          </div>
        </div>

        <div class="kpi">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="check_circle" size="20px" />
          </div>
          <div>
            <div class="kpi__label">Pagas</div>
            <div class="kpi__value">
              {{ store.formatar(store.kpis.pagas) }}
            </div>
            <div class="kpi__sub">
              {{ store.kpis.taxaCobranca }}% do total
            </div>
          </div>
        </div>

        <div class="kpi">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="hourglass_top" size="20px" />
          </div>
          <div>
            <div class="kpi__label">Pendentes</div>
            <div class="kpi__value">
              {{ store.formatar(store.kpis.pendentes) }}
            </div>
            <div class="kpi__sub">
              {{ store.formatarMoeda(store.kpis.pendenteValor) }}
            </div>
          </div>
        </div>

        <div class="kpi">
          <div class="kpi__icon kpi__icon--info">
            <q-icon name="attach_money" size="20px" />
          </div>
          <div>
            <div class="kpi__label">Cobrado</div>
            <div class="kpi__value">
              {{ store.formatarMoeda(store.kpis.cobrado) }}
            </div>
            <div class="kpi__sub">
              Ticket médio {{ store.formatarMoeda(store.kpis.ticketMedio) }}
            </div>
          </div>
        </div>
      </section>

      <!-- TABELA — Desempenho por província -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">Desempenho por província</h2>
          <span class="block__sub">Este período</span>
        </header>

        <table class="data-table">
          <thead>
            <tr>
              <th>Província</th>
              <th>Emitidas</th>
              <th>Pagas</th>
              <th>Cobrado (MT)</th>
              <th>Taxa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in store.desempenhoProvincia" :key="p.provincia">
              <td>
                <b>{{ p.provincia }}</b>
              </td>
              <td>{{ store.formatar(p.emitidas) }}</td>
              <td class="text-success">{{ store.formatar(p.pagas) }}</td>
              <td class="text-bold">{{ store.formatar(p.cobrado) }}</td>
              <td>
                <div class="taxa">
                  <div class="taxa__bar">
                    <div class="taxa__fill" :style="{ width: `${p.taxa}%` }" />
                  </div>
                  <span class="taxa__value">{{ p.taxa }}%</span>
                </div>
              </td>
            </tr>

            <tr v-if="!store.desempenhoProvincia.length">
              <td colspan="5" class="empty">
                Sem dados para o período seleccionado.
              </td>
            </tr>

            <tr v-else class="data-table__total">
              <td><b>Total</b></td>
              <td>
                <b>{{ store.formatar(store.totaisProvincias.emitidas) }}</b>
              </td>
              <td class="text-success">
                <b>{{ store.formatar(store.totaisProvincias.pagas) }}</b>
              </td>
              <td class="text-bold">
                <b>{{ store.formatar(store.totaisProvincias.cobrado) }}</b>
              </td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- GRID — Top infrações + Métodos -->
      <div class="split-grid">
        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Top infrações</h2>
            <span class="chart-card__sub">Distribuição percentual</span>
          </header>

          <div class="chart-card__body">
            <div class="bar-chart">
              <div
                v-for="(b, i) in store.topInfracoes"
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
                <div class="bar-chart__value">{{ b.percentagem }}%</div>
              </div>

              <div v-if="!store.topInfracoes.length" class="chart-empty">
                Sem dados.
              </div>
            </div>
          </div>
        </section>

        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Métodos de pagamento</h2>
            <span class="chart-card__sub">Distribuição dos pagamentos</span>
          </header>

          <div class="chart-card__body">
            <div class="bar-chart">
              <div
                v-for="(m, i) in store.topMetodos"
                :key="i"
                class="bar-chart__row"
              >
                <div class="bar-chart__label">
                  <q-icon
                    :name="iconeMetodo(m.metodo)"
                    size="14px"
                    class="bar-chart__icon"
                  />
                  {{ m.metodo }}
                </div>
                <div class="bar-chart__bar">
                  <div
                    class="bar-chart__fill bar-chart__fill--primary"
                    :style="{ width: `${m.percentagem}%` }"
                  />
                </div>
                <div class="bar-chart__value">{{ m.percentagem }}%</div>
              </div>

              <div v-if="!store.topMetodos.length" class="chart-empty">
                Sem dados.
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- GRÁFICOS — Linha + Anel -->
      <div class="charts-grid">
        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Cobrança mensal</h2>
            <span class="chart-card__sub">Últimos 6 meses (mil MT)</span>
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
            <h2 class="chart-card__title">Taxa de cobrança</h2>
            <span class="chart-card__sub">Este período</span>
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
                <div class="ring__value">{{ store.kpis.taxaCobranca }}</div>
                <div class="ring__label">%</div>
              </div>
            </div>

            <div class="ring-legend">
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--success" />
                Cobrado
                <b>{{ store.formatar(store.kpis.pagas) }}</b>
              </div>
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--critical" />
                Pendente
                <b>{{ store.formatar(store.kpis.pendentes) }}</b>
              </div>
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--warning" />
                Contestadas
                <b>{{ store.formatar(store.kpis.contestadas) }}</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TABELA — Resumo mensal -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">Resumo mensal</h2>
          <span class="block__sub">Últimos 6 meses</span>
        </header>

        <table class="data-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Emitidas</th>
              <th>Cobrado (mil MT)</th>
              <th>Média por multa (MT)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in store.cobrancaMensal" :key="m.mes">
              <td>
                <b>{{ m.mes }}</b>
              </td>
              <td>{{ store.formatar(m.emitidas) }}</td>
              <td class="text-bold">{{ store.formatar(m.cobrado) }}</td>
              <td>
                {{
                  m.emitidas > 0
                    ? store.formatar(Math.round((m.cobrado * 1000) / m.emitidas))
                    : '—'
                }}
              </td>
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
import { useGestmulRelatoriosStore } from '@/stores/gestmul/gestmul-RelatoriosStore'
import { relatoriosService } from '@/services/gestmul/relatorios.service'

const store = useGestmulRelatoriosStore()
const $q = useQuasar()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Períodos rápidos
// ============================================================
const periodosRapidos: {
  key: '7d' | '30d' | '90d' | 'ano'
  label: string
}[] = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: 'ano', label: 'Último ano' },
]

// ============================================================
// Ícone do método
// ============================================================
function iconeMetodo(m: string): string {
  if (m === 'Dinheiro') return 'payments'
  if (m === 'M-Pesa') return 'smartphone'
  if (m === 'Transferência') return 'account_balance'
  if (m === 'Multibanco') return 'credit_card'
  return 'payment'
}

// ============================================================
// Gráfico de linha
// ============================================================
const valores = computed(() => store.cobrancaMensal.map((m) => m.cobrado))
const labelsX = computed(() => store.cobrancaMensal.map((m) => m.mes))

const maxY = computed(() => {
  const max = Math.max(...valores.value, 1)
  return Math.ceil(max / 200) * 200 || 200
})

const labelsY = computed(() => [0, maxY.value / 2, maxY.value])
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
// Aplicar / Limpar
// ============================================================
async function aplicarFiltro() {
  await store.carregar()
  $q.notify({
    type: 'positive',
    message: 'Relatório actualizado.',
    position: 'top',
  })
}

function limparFiltro() {
  store.limparFiltros()
  store.carregar()
  $q.notify({
    type: 'info',
    message: 'Filtros limpos.',
    position: 'top',
  })
}

// ============================================================
// Exportar Excel (XLSX via backend)
// ============================================================
async function exportarCSV() {
  try {
    const blob = await relatoriosService.exportarXlsx({
      de: store.dataDe,
      ate: store.dataAte,
      provincia: store.filtroProvincia,
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gestmul-relatorio-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`
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
    const blob = await relatoriosService.exportarPdf({
      de: store.dataDe,
      ate: store.dataAte,
      provincia: store.filtroProvincia,
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gestmul-relatorio-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`
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

.rl-skeleton {
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
    height: 28px;
    width: 320px;
    max-width: 60%;
  }
  .sk-sub {
    @extend %sk-block;
    height: 16px;
    width: 440px;
    max-width: 80%;
  }
}

.sk-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .sk-pill {
    @extend %sk-block;
    width: 120px;
    height: 40px;
    border-radius: 8px;
  }
}

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sk-kpi {
  @extend %sk-block;
  height: 100px;
}

.sk-charts {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.sk-chart {
  @extend %sk-block;
  height: 260px;
}

.sk-block {
  @extend %sk-block;
  height: 300px;
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
  margin-bottom: 16px;
}

.chart-empty,
.empty {
  text-align: center;
  padding: 30px 20px;
  color: var(--sicam-muted);
  font-size: 13px;
}

/* ============================================================ */
/* Página                                                       */
/* ============================================================ */
.rl-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

/* Cabeçalho */
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 700px) {
    flex-direction: column;
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 6px;
  }
  &__sub {
    font-size: 14px;
    color: var(--sicam-muted);
    margin: 0;
  }
  &__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
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
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* ============================================================ */
/* Filtros                                                      */
/* ============================================================ */
.filters-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

.quick-periods {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.quick-period {
  padding: 7px 14px;
  border-radius: 99px;
  background: var(--sicam-surface-alt);
  border: 1px solid var(--sicam-line);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--sicam-ink-soft);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--sicam-surface-hover);
  }

  &--active {
    background: var(--sicam-primary-light);
    color: #fff;
    border-color: var(--sicam-primary-light);
  }
}

.filters-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-field {
  flex: 1;
  min-width: 160px;
}

.filter-label {
  display: block;
  font-size: 11px;
  color: var(--sicam-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
  font-weight: 600;
}

.filter-input {
  width: 100%;
  border: 1px solid var(--sicam-line);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--sicam-ink);
  background: var(--sicam-surface-alt);

  &:focus {
    outline: 0;
    border-color: var(--sicam-primary-light);
  }
}

.filter-apply {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--sicam-primary-light);
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: var(--sicam-primary);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.filter-clear {
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--sicam-muted);
  cursor: pointer;

  &:hover {
    background: var(--sicam-surface-hover);
    color: var(--sicam-ink);
  }
}

/* ============================================================ */
/* KPIs                                                         */
/* ============================================================ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 450px) {
    grid-template-columns: 1fr;
  }
}

.kpi {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: transform 0.1s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--primary {
      background: var(--sicam-primary-bg);
      color: var(--sicam-primary);
    }
    &--success {
      background: var(--sicam-success-bg);
      color: var(--sicam-success-ink);
    }
    &--warning {
      background: var(--sicam-warning-bg);
      color: var(--sicam-warning-ink);
    }
    &--info {
      background: #dbeafe;
      color: #2563eb;
    }
  }

  &__label {
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    margin-bottom: 6px;
  }

  &__value {
    font-size: 20px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1.1;
  }

  &__sub {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--sicam-muted);
    margin-top: 4px;
  }
}

/* ============================================================ */
/* Charts                                                       */
/* ============================================================ */
.charts-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.split-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }

  .chart-card {
    margin-bottom: 0;
    height: 100%;
    display: flex;
    flex-direction: column;

    .chart-card__body {
      flex: 1;
    }
  }
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

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }
  &__sub {
    font-size: 12px;
    color: var(--sicam-muted);
  }

  &__body {
    width: 100%;
  }

  &__body--ring {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 24px;

    @media (max-width: 500px) {
      flex-direction: column;
    }
  }
}

.line-chart {
  width: 100%;
  height: auto;

  &__grid {
    stroke: var(--sicam-line-soft);
    stroke-width: 1;
  }
  &__axis {
    font-size: 10px;
    fill: var(--sicam-muted);
  }
  &__area {
    fill: rgba(16, 185, 129, 0.12);
  }
  &__line {
    fill: none;
    stroke: var(--sicam-primary-light);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  &__dot {
    fill: #fff;
    stroke: var(--sicam-primary-light);
    stroke-width: 2.5;
  }
}

.ring {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;

  &__svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  &__track {
    fill: none;
    stroke: var(--sicam-line-soft);
    stroke-width: 10;
  }
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
  &__value {
    font-size: 34px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
  }
  &__label {
    font-size: 16px;
    font-weight: 600;
    color: var(--sicam-muted);
    padding-bottom: 4px;
  }
}

.ring-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 160px;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--sicam-ink-soft);

    b {
      color: var(--sicam-ink);
      font-weight: 700;
      margin-left: auto;
    }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;

    &--success {
      background: var(--sicam-success);
    }
    &--critical {
      background: var(--sicam-critical);
    }
    &--warning {
      background: var(--sicam-warning);
    }
  }
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__row {
    display: grid;
    grid-template-columns: 200px 1fr 60px;
    align-items: center;
    gap: 12px;

    @media (max-width: 600px) {
      grid-template-columns: 130px 1fr 50px;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    font-size: 13px;
    color: var(--sicam-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__icon {
    color: var(--sicam-muted);
    flex-shrink: 0;
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

    &--primary {
      background: var(--sicam-primary-light);
    }
  }

  &__value {
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink);
    text-align: right;
  }
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

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }
  &__sub {
    font-size: 12px;
    color: var(--sicam-muted);
  }
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

  tr:last-child td {
    border-bottom: 0;
  }
  tbody tr:hover {
    background: #fbfdfc;
  }

  &__total {
    background: var(--sicam-surface-alt);

    td {
      border-top: 2px solid var(--sicam-line);
      padding-top: 14px;
      padding-bottom: 14px;
    }
  }
}

.text-success {
  color: var(--sicam-success);
  font-weight: 600;
}
.text-bold {
  font-weight: 700;
}

/* Taxa bar */
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

  &__value {
    font-size: 13px;
    font-weight: 600;
    color: var(--sicam-ink);
    min-width: 36px;
    text-align: right;
  }
}

/* ============================================================ */
/* Impressão                                                    */
/* ============================================================ */
@media print {
  .page-head__actions,
  .filters-card,
  .quick-periods,
  .filter-apply,
  .filter-clear,
  .page-btn,
  .rl-skeleton {
    display: none !important;
  }

  .rl-page {
    padding: 0;
    max-width: 100%;
  }

  .chart-card,
  .block,
  .kpi {
    box-shadow: none;
    border: 1px solid var(--sicam-line);
    page-break-inside: avoid;
  }
}
</style>