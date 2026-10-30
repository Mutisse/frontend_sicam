<template>
  <div class="issm-dash">
    <!-- SKELETON -->
    <div v-if="!store.carregado" class="..._skeleton">
      <div class="sk-kpis">
        <AppFbLoader variant="list" :items="4" />
      </div>
      <div class="sk-charts">
        <AppFbLoader variant="block" height="200px" />
        <AppFbLoader variant="block" height="200px" />
      </div>
    </div>

    <!-- CONTEÚDO -->
    <template v-else>
      <!-- KPIs -->
      <section class="kpis">
        <article
          v-for="k in store.kpis"
          :key="k.key"
          class="kpi"
          :class="`kpi--${k.variant}`"
        >
          <div class="kpi__label">
            {{ k.label }}
            <span class="dot" />
          </div>
          <div class="kpi__valor">{{ k.valor }}</div>
          <div class="kpi__bar">
            <i :style="{ width: `${(k.valor / k.total) * 100}%` }" />
          </div>
          <div class="kpi__sub">
            {{ ((k.valor / k.total) * 100).toFixed(1).replace('.', ',') }}%
          </div>
        </article>
      </section>

      <!-- Charts linha + barras -->
      <div class="charts-row">
        <!-- Linha -->
        <section class="chart-line">
          <h3>
            Apólices emitidas
            <small>Últimos 7 dias</small>
          </h3>

          <svg viewBox="0 0 400 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#10b981" stop-opacity="0.35" />
                <stop offset="1" stop-color="#10b981" stop-opacity="0" />
              </linearGradient>
            </defs>

            <line
              v-for="(y, i) in [20, 70, 120, 170]"
              :key="`g-${i}`"
              :x1="30"
              :y1="y"
              :x2="390"
              :y2="y"
              class="grid"
            />

            <path :d="areaPath" class="area" />
            <path :d="linePath" class="line" />

            <circle
              v-for="(p, i) in pontos"
              :key="`p-${i}`"
              :cx="p.x"
              :cy="p.y"
              r="4"
              class="dot"
            >
              <title>
                {{ store.linha[i]?.label }}: {{ store.linha[i]?.valor }}
              </title>
            </circle>

            <text
              v-for="(pt, i) in store.linha"
              :key="`x-${i}`"
              :x="30 + i * (360 / Math.max(store.linha.length - 1, 1))"
              :y="175"
              text-anchor="middle"
              class="axis"
            >
              {{ pt.label }}
            </text>
          </svg>
        </section>

        <!-- Barras -->
        <section class="chart-bars">
          <h3>Apólices por seguradora</h3>
          <div
            v-for="(b, i) in store.barras"
            :key="i"
            class="chart-bars__row"
          >
            <div class="label">{{ b.label }}</div>
            <div class="track">
              <i :style="{ width: `${(b.valor / maxBarra) * 100}%` }" />
            </div>
            <div class="value">{{ b.valor }}</div>
          </div>
        </section>
      </div>

      <!-- Donut -->
      <section class="chart-donut">
        <svg
          width="140"
          height="140"
          viewBox="0 0 42 42"
          class="chart-donut__svg"
        >
          <circle
            cx="21"
            cy="21"
            r="15.9"
            fill="none"
            stroke="#f1f5f9"
            stroke-width="6"
          />
          <circle
            v-for="(d, i) in donutSegmentos"
            :key="i"
            cx="21"
            cy="21"
            r="15.9"
            fill="none"
            :stroke="d.cor"
            stroke-width="6"
            :stroke-dasharray="`${d.percent} ${100 - d.percent}`"
            :stroke-dashoffset="d.offset"
            transform="rotate(-90 21 21)"
          />
        </svg>
        <div class="chart-donut__legend">
          <div v-for="(d, i) in store.donut" :key="i" class="item">
            <div class="left">
              <i :style="{ background: d.cor }" />
              {{ d.label }}
            </div>
            <div class="right">{{ d.valor }}</div>
          </div>
        </div>
      </section>

      <!-- Cards -->
      <section class="cards">
        <article v-for="(c, i) in store.cards" :key="i" class="card">
          <h3>{{ c.titulo }}</h3>
          <div v-if="c.valorGrande" class="card__big">{{ c.valorGrande }}</div>
          <div v-for="(l, j) in c.linhas" :key="j" class="card__row">
            <span class="card__label">{{ l.label }}</span>
            <span class="card__valor">{{ l.valor }}</span>
          </div>
          <button v-if="c.botao" class="card__btn">{{ c.botao }}</button>
        </article>
      </section>

      <!-- Tabela -->
      <section class="tabela">
        <h3>{{ store.tabela.titulo }}</h3>
        <table>
          <thead>
            <tr>
              <th v-for="col in store.tabela.colunas" :key="col">
                {{ col }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(linha, i) in store.tabela.linhas" :key="i">
              <td v-for="(celula, j) in linha.celulas" :key="j">
                <b v-if="j === 0">{{ celula }}</b>
                <span v-else>{{ celula }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useIssmDashboardStore } from "@/stores/dashboards/secoes/issm.store";
import AppFbLoader from '@/modules/common/AppFbLoader.vue'

const store = useIssmDashboardStore()
onMounted(() => store.carregar())

// ── Chart linha ──────────────────────────────────────────────
const maxLinha = computed(() =>
  Math.max(...store.linha.map((p) => p.valor), 1),
)

const pontos = computed(() => {
  const n = store.linha.length
  if (!n) return []
  return store.linha.map((p, i) => ({
    x: 30 + i * (360 / Math.max(n - 1, 1)),
    y: 170 - (p.valor / maxLinha.value) * 140,
  }))
})

const linePath = computed(() =>
  pontos.value
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' '),
)

const areaPath = computed(() => {
  const pts = pontos.value
  if (!pts.length) return ''
  const first = pts[0]!
  const last = pts[pts.length - 1]!
  const line = pts
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' ')
  return `${line} L${last.x},170 L${first.x},170 Z`
})

// ── Chart barras ─────────────────────────────────────────────
const maxBarra = computed(() =>
  Math.max(...store.barras.map((b) => b.valor), 1),
)

// ── Chart donut ──────────────────────────────────────────────
const totalDonut = computed(() =>
  store.donut.reduce((s, d) => s + d.valor, 0),
)

const donutSegmentos = computed(() => {
  const total = totalDonut.value
  if (!total) return []
  let acc = 0
  return store.donut.map((d) => {
    const percent = (d.valor / total) * 100
    const offset = 25 - acc
    acc += percent
    return { cor: d.cor, percent, offset }
  })
})
</script>

<style scoped lang="scss">
@import './_chart';

</style>