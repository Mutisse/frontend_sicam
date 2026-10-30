<template>
  <q-page class="rel-page">
    <!-- SKELETON -->
    <div v-if="!store.carregado" class="rel-skeleton">
      <AppFbLoader variant="block" height="80px" />
      <div class="sk-kpis">
        <AppFbLoader variant="list" :items="5" />
      </div>
      <div class="sk-charts">
        <AppFbLoader variant="block" height="280px" />
        <AppFbLoader variant="block" height="280px" />
      </div>
      <AppFbLoader variant="block" height="200px" />
      <AppFbLoader variant="list" :items="4" />
    </div>

    <!-- CONTEÚDO -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Relatórios</h1>
          <p class="page-head__sub">
            Análise operacional — hotlist, abordagens e alertas
          </p>
        </div>

        <div class="page-head__actions">
          <button class="page-btn page-btn--outline" @click="exportarCSV">
            <q-icon name="grid_on" size="18px" />
            Excel (CSV)
          </button>
          <button class="page-btn page-btn--outline" @click="exportarPDF">
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
        <button class="period__btn" @click="aplicarFiltro">Aplicar</button>
      </section>

      <!-- KPIs -->
      <section class="kpi-grid">
        <article
          v-for="(k, i) in store.kpisVisiveis"
          :key="i"
          class="kpi-card"
          :class="`kpi-card--${k.variant}`"
        >
          <header class="kpi-card__head">
            <div class="kpi-card__icon">
              <q-icon :name="k.icon" size="22px" />
            </div>

            <span
              v-if="k.trend"
              class="kpi-card__trend"
              :class="`kpi-card__trend--${k.trend.tipo}`"
            >
              <q-icon
                :name="k.trend.tipo === 'up' ? 'trending_up' : 'trending_down'"
                size="14px"
              />
              {{ k.trend.valor }}
            </span>
          </header>

          <div class="kpi-card__body">
            <div class="kpi-card__value">
              {{ k.valor }}<span v-if="k.unidade" class="kpi-card__unid">{{ k.unidade }}</span>
            </div>
            <div class="kpi-card__label">{{ k.label }}</div>
          </div>

          <div v-if="k.percentagem != null" class="kpi-card__bar">
            <div
              class="kpi-card__bar-fill"
              :style="{ width: `${k.percentagem}%` }"
            />
          </div>

          <footer v-if="k.sub" class="kpi-card__foot">
            {{ k.sub }}
          </footer>
        </article>
      </section>

      <!-- GRÁFICOS -->
      <div class="charts-grid">
        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Abordagens por mês</h2>
            <span class="chart-card__sub">Últimos 6 meses</span>
          </header>

          <div class="chart-card__body">
            <svg viewBox="0 0 420 220" class="line-chart">
              <line
                v-for="(y, i) in store.gridY"
                :key="`gy-${i}`"
                :x1="40" :y1="y" :x2="410" :y2="y"
                class="line-chart__grid"
              />

              <text
                v-for="(label, i) in store.labelsY"
                :key="`ly-${i}`"
                :x="30" :y="store.gridY[i]! + 4"
                class="line-chart__axis"
                text-anchor="end"
              >{{ label }}</text>

              <path :d="store.areaPath" class="line-chart__area" />
              <path :d="store.linePath" class="line-chart__line" />

              <circle
                v-for="(p, i) in store.pontos"
                :key="`p-${i}`"
                :cx="p.x" :cy="p.y" r="4"
                class="line-chart__dot"
              />

              <text
                v-for="(label, i) in store.labelsX"
                :key="`lx-${i}`"
                :x="40 + i * (370 / Math.max(store.labelsX.length - 1, 1))"
                :y="215"
                class="line-chart__axis"
                text-anchor="middle"
              >{{ label }}</text>
            </svg>
          </div>
        </section>

        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Taxa de resolução</h2>
            <span class="chart-card__sub">Casos encerrados</span>
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
                <div class="ring__value">{{ store.anel.taxa }}</div>
                <div class="ring__label">%</div>
              </div>
            </div>

            <div class="ring-legend">
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--success" />
                Resolvidos
                <b>{{ store.anel.resolvidos }}</b>
              </div>
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--critical" />
                Em aberto
                <b>{{ store.anel.emAberto }}</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- BARRAS -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Hotlist por motivo</h2>
          <span class="chart-card__sub">Distribuição nacional</span>
        </header>

        <div class="chart-card__body">
          <div class="bar-chart">
            <div
              v-for="(b, i) in store.hotlistPorMotivo"
              :key="i"
              class="bar-chart__row"
            >
              <div class="bar-chart__label">{{ b.nome }}</div>
              <div class="bar-chart__bar">
                <div
                  class="bar-chart__fill"
                  :class="`bar-chart__fill--${b.cor}`"
                  :style="{ width: `${b.percentagem}%` }"
                />
              </div>
              <div class="bar-chart__value">{{ b.valor }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- TABELA — Desempenho por posto -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">Desempenho por posto</h2>
          <span class="block__sub">{{ subtituloPeriodo }}</span>
        </header>

        <table class="data-table">
          <thead>
            <tr>
              <th>Posto</th>
              <th>Província</th>
              <th>Abordagens</th>
              <th>Detenções</th>
              <th>Autos</th>
              <th>Taxa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in store.desempenhoPorPosto" :key="p.posto">
              <td><b>{{ p.posto }}</b></td>
              <td>{{ p.provincia }}</td>
              <td>{{ p.abordagens }}</td>
              <td class="text-critical">{{ p.detencoes }}</td>
              <td>{{ p.autos }}</td>
              <td>
                <div class="taxa">
                  <div class="taxa__bar">
                    <div class="taxa__fill" :style="{ width: `${p.taxa}%` }" />
                  </div>
                  <span class="taxa__value">{{ p.taxa }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="!store.desempenhoPorPosto.length">
              <td colspan="6" class="data-table__empty">Sem dados no período.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- TABELA — Top 10 matrículas -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">Top 10 matrículas abordadas</h2>
          <span class="block__sub">{{ subtituloPeriodo }}</span>
        </header>

        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Matrícula</th>
              <th>Motivo</th>
              <th>Abordagens</th>
              <th>Nível</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(m, i) in store.topMatriculas" :key="m.matricula">
              <td><b>{{ i + 1 }}</b></td>
              <td>
                <div class="placa-cell">
                  <div class="placa-cell__icon" :class="`placa-cell__icon--${m.nivel}`">
                    <q-icon name="directions_car" size="14px" />
                  </div>
                  <b>{{ m.matricula }}</b>
                </div>
              </td>
              <td>{{ m.motivo }}</td>
              <td><b>{{ m.abordagens }}</b></td>
              <td>
                <span class="nivel" :class="`nivel--${m.nivel}`">
                  {{ store.labelNivel(m.nivel) }}
                </span>
              </td>
            </tr>
            <tr v-if="!store.topMatriculas.length">
              <td colspan="5" class="data-table__empty">Sem dados no período.</td>
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
import { useRelatoriosStore } from '@/stores/prm/prm-relatorios.store'
import AppFbLoader from "@/modules/common/AppFbLoader.vue";

const store = useRelatoriosStore()
const $q = useQuasar()

// Carrega dados ao montar
onMounted(() => {
  store.carregar()
})

// ============================================================
// Subtítulo dinâmico do período
// ============================================================
const subtituloPeriodo = computed(() => {
  if (!store.dataDe && !store.dataAte) return 'Todos os registos'
  if (store.dataDe && store.dataAte) return `${store.dataDe} → ${store.dataAte}`
  if (store.dataDe) return `A partir de ${store.dataDe}`
  return `Até ${store.dataAte}`
})

// ============================================================
// Aplicar filtro
// ============================================================
async function aplicarFiltro() {
  await store.aplicarFiltro()
  $q.notify({ type: 'positive', message: 'Filtro aplicado.', position: 'top' })
}

// ============================================================
// Exportar CSV
// ============================================================
function exportarCSV() {
  const csv = store.gerarCSV()
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `prm-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
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
.rel-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

// ─── SKELETON ────────────────────────────────────────────────
.rel-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;

  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 800px)  { grid-template-columns: repeat(2, 1fr); }
}

.sk-charts {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

// ============================================================
// Cabeçalho
// ============================================================
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
  border: 0; border-radius: 10px; padding: 10px 18px;
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: all 0.15s;

  &--outline { background: #fff; color: var(--sicam-ink); border: 1px solid var(--sicam-line);
    &:hover { background: var(--sicam-surface-hover); } }
}

// ============================================================
// Período
// ============================================================
.period {
  display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;
  background: #fff; border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;

  &__field { flex: 1; min-width: 180px; }
  &__label {
    display: block; font-size: 11px; color: var(--sicam-muted);
    text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 6px; font-weight: 600;
  }
  &__input {
    width: 100%; border: 1px solid var(--sicam-line); border-radius: 8px;
    padding: 9px 12px; font-size: 14px; font-family: inherit;
    color: var(--sicam-ink); background: var(--sicam-surface-alt);
    &:focus { outline: 0; border-color: var(--sicam-primary-light); }
  }
  &__btn {
    background: var(--sicam-primary-light); color: #fff; border: 0;
    border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    &:hover { background: var(--sicam-primary); }
  }
}

// ============================================================
// KPIs
// ============================================================
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 24px;

  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 800px)  { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px)  { grid-template-columns: 1fr; }
}

.kpi-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--sicam-line-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
    transform: translateY(-3px);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    .kpi-card--critico & { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    .kpi-card--atencao & { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    .kpi-card--regular & { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    .kpi-card--info &    { background: #dbeafe;                  color: #2563eb; }
    .kpi-card--neutral & { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 99px;

    &--up { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--down { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__body { display: flex; flex-direction: column; gap: 2px; }

  &__value {
    font-size: 30px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  &__unid {
    font-size: 15px;
    font-weight: 600;
    color: var(--sicam-muted);
    margin-left: 2px;
  }

  &__label {
    font-size: 12px;
    color: var(--sicam-muted);
    font-weight: 500;
    line-height: 1.3;
  }

  &__bar {
    height: 4px;
    background: var(--sicam-line-soft);
    border-radius: 99px;
    overflow: hidden;
    margin-top: auto;
  }

  &__bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.5s ease;

    .kpi-card--critico & { background: var(--sicam-critical); }
    .kpi-card--atencao & { background: var(--sicam-warning); }
    .kpi-card--regular & { background: var(--sicam-success); }
    .kpi-card--info &    { background: #2563eb; }
    .kpi-card--neutral & { background: var(--sicam-neutral); }
  }

  &__foot {
    font-size: 11px;
    color: var(--sicam-muted);
    line-height: 1.4;
  }
}

// ============================================================
// Charts
// ============================================================
.charts-grid {
  display: grid; grid-template-columns: 1.4fr 1fr;
  gap: 20px; margin-bottom: 20px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.chart-card {
  background: #fff; border-radius: 14px; padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;

  &__head {
    display: flex; align-items: baseline; justify-content: space-between;
    margin-bottom: 16px;
  }
  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub { font-size: 12px; color: var(--sicam-muted); }
  &__body { width: 100%; }
  &__body--ring {
    display: flex; align-items: center; justify-content: space-around;
    gap: 24px;
    @media (max-width: 500px) { flex-direction: column; }
  }
}

// Linha
.line-chart {
  width: 100%; height: auto;

  &__grid { stroke: var(--sicam-line-soft); stroke-width: 1; }
  &__axis { font-size: 10px; fill: var(--sicam-muted); font-family: var(--sicam-font-family); }
  &__area { fill: rgba(220, 38, 38, 0.10); }
  &__line {
    fill: none; stroke: var(--sicam-critical); stroke-width: 2.5;
    stroke-linecap: round; stroke-linejoin: round;
  }
  &__dot { fill: #fff; stroke: var(--sicam-critical); stroke-width: 2.5; }
}

// Anel
.ring {
  position: relative; width: 160px; height: 160px; flex-shrink: 0;

  &__svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  &__track { fill: none; stroke: var(--sicam-line-soft); stroke-width: 10; }
  &__progress {
    fill: none; stroke: var(--sicam-success); stroke-width: 10;
    stroke-linecap: round; transition: stroke-dashoffset 0.6s ease;
  }
  &__center {
    position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; gap: 2px; pointer-events: none;
  }
  &__value { font-size: 34px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 16px; font-weight: 600; color: var(--sicam-muted); padding-bottom: 4px; }
}

.ring-legend {
  display: flex; flex-direction: column; gap: 12px;

  &__item {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--sicam-ink-soft);
    b { color: var(--sicam-ink); font-weight: 700; margin-left: auto; }
  }
  &__dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    &--success  { background: var(--sicam-success); }
    &--critical { background: var(--sicam-critical); }
  }
}

// Barras
.bar-chart {
  display: flex; flex-direction: column; gap: 14px;

  &__row {
    display: grid; grid-template-columns: 180px 1fr 60px;
    align-items: center; gap: 12px;
    @media (max-width: 600px) { grid-template-columns: 120px 1fr 50px; }
  }
  &__label {
    font-size: 13px; color: var(--sicam-ink); text-align: right;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  &__bar { height: 10px; background: var(--sicam-line-soft); border-radius: 99px; overflow: hidden; }
  &__fill {
    height: 100%; border-radius: 99px; transition: width 0.5s ease;

    &--critical { background: var(--sicam-critical); }
    &--warning  { background: var(--sicam-warning); }
    &--primary  { background: var(--sicam-primary-light); }
  }
  &__value { font-size: 13px; font-weight: 700; color: var(--sicam-ink); text-align: right; }
}

// ============================================================
// Blocos / Tabelas
// ============================================================
.block {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;

  &__head {
    display: flex; align-items: baseline; justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }
  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub { font-size: 12px; color: var(--sicam-muted); }
}

.data-table {
  width: 100%; border-collapse: collapse;

  th {
    text-align: left; font-size: 11px; font-weight: 600; color: var(--sicam-muted);
    letter-spacing: 0.05em; text-transform: uppercase; padding: 12px 16px;
    background: #fafbfa; border-bottom: 1px solid var(--sicam-line); white-space: nowrap;
  }
  td {
    padding: 14px 16px; font-size: 14px; color: var(--sicam-ink);
    border-bottom: 1px solid var(--sicam-line-soft); vertical-align: middle;
  }
  tr:last-child td { border-bottom: 0; }
  tbody tr:hover { background: #fbfdfc; }

  &__empty {
    text-align: center;
    color: var(--sicam-muted);
    padding: 30px 16px !important;
    font-style: italic;
  }
}

.text-success  { color: var(--sicam-success);  font-weight: 600; }
.text-critical { color: var(--sicam-critical); font-weight: 600; }

// Taxa
.taxa {
  display: flex; align-items: center; gap: 10px;

  &__bar {
    width: 70px; height: 6px; background: var(--sicam-line-soft);
    border-radius: 99px; overflow: hidden;
  }
  &__fill {
    height: 100%; background: var(--sicam-primary-light);
    border-radius: 99px; transition: width 0.4s ease;
  }
  &__value { font-size: 13px; font-weight: 600; color: var(--sicam-ink); }
}

// Placa
.placa-cell {
  display: flex; align-items: center; gap: 8px;

  b { font-weight: 700; letter-spacing: 0.02em; }

  &__icon {
    width: 26px; height: 26px; border-radius: 7px;
    display: grid; place-items: center; flex-shrink: 0;

    &--alto  { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--medio { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--baixo { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
  }
}

// Nível
.nivel {
  display: inline-block;
  padding: 3px 10px; border-radius: 99px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;

  &--alto  { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--medio { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--baixo { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
}

// ============================================================
// Impressão
// ============================================================
@media print {
  .page-head__actions, .period, .page-btn { display: none !important; }
  .rel-page { padding: 0; max-width: 100%; }
  .chart-card, .block, .kpi-card {
    box-shadow: none; border: 1px solid var(--sicam-line);
    page-break-inside: avoid;
  }
}
</style>