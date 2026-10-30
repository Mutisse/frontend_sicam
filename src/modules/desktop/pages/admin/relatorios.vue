<template>
  <q-page class="rel-page">
    <!-- Cabeçalho que só aparece ao imprimir -->
    <header class="print-head">
      <b>SICAM — Relatório de Operações</b>
      <span>Gerado em {{ store.geradoEm }}</span>
      <span>Período: {{ store.periodoTexto }}</span>
      <span v-if="store.filtroPosto">Posto: {{ store.filtroPosto }}</span>
    </header>

    <!-- SKELETON -->
    <div v-if="!store.carregado" class="rel-skeleton">
      <div class="sk-hero" />
      <div class="sk-controls" />
      <div class="sk-grid-2">
        <div class="sk-card" />
        <div class="sk-card" />
      </div>
      <div class="sk-grid-1">
        <div class="sk-card" />
      </div>
    </div>

    <!-- CONTEÚDO -->
    <template v-else>
      <!-- ============================================================ -->
      <!-- FAIXA DE DESTAQUE (título, exportação e KPIs)                 -->
      <!-- ============================================================ -->
      <section class="hero">
        <svg class="hero__deco" viewBox="0 0 600 600" aria-hidden="true">
          <circle cx="480" cy="260" r="80" />
          <circle cx="480" cy="260" r="150" />
          <circle cx="480" cy="260" r="220" />
          <circle cx="480" cy="260" r="290" />
        </svg>

        <div class="hero__top">
          <div>
            <h1 class="hero__title">Relatórios</h1>
            <p class="hero__sub">Análise de operações, frota e desempenho</p>

            <p class="hero__ambito">
              <span class="hero__tag">
                <q-icon name="event" size="15px" />
                {{
                  store.dataDe || store.dataAte
                    ? store.periodoTexto
                    : 'Todo o período'
                }}
              </span>
              <span class="hero__tag">
                <q-icon name="flag" size="15px" />
                {{ store.filtroPosto || 'Todos os postos' }}
              </span>
            </p>
          </div>

          <div class="hero__actions">
            <button type="button" class="hbtn" @click="exportarExcel">
              <q-icon name="grid_on" size="18px" />
              Exportar Excel
            </button>
            <button type="button" class="hbtn hbtn--gold" @click="exportarPDF">
              <q-icon name="picture_as_pdf" size="18px" />
              Exportar PDF
            </button>
          </div>
        </div>

        <div class="hero__kpis" role="list" aria-label="Indicadores">
          <article
            v-for="k in store.kpis"
            :key="k.label"
            class="hk"
            role="listitem"
          >
            <div class="hk__top">
              <span class="hk__icon">
                <q-icon :name="k.icon" size="18px" />
              </span>
              <span class="hk__label">{{ k.label }}</span>
            </div>

            <div class="hk__value">
              {{ k.valor
              }}<span v-if="k.unid" class="hk__unid"> {{ k.unid }}</span>
            </div>

            <div v-if="k.sub" class="hk__sub">{{ k.sub }}</div>

            <div
              v-if="k.barra !== undefined"
              class="hk__bar"
              role="img"
              :aria-label="`${k.label}: ${k.barra}%`"
            >
              <span class="hk__fill" :style="{ width: k.barra + '%' }" />
            </div>
          </article>
        </div>
      </section>

      <!-- ERRO -->
      <div v-if="store.erro" class="form-error">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- ============================================================ -->
      <!-- BARRA DE CONTROLOS                                            -->
      <!-- ============================================================ -->
      <div class="controlos">
        <div class="controlos__filtros" aria-label="Filtros">
          <div class="seg" role="group" aria-label="Atalhos de período">
            <button
              v-for="p in store.presets"
              :key="p.label"
              type="button"
              class="seg__btn"
              :class="{ 'seg__btn--active': store.presetActivo === p.label }"
              :aria-pressed="store.presetActivo === p.label"
              @click="store.usarPreset(p)"
            >
              {{ p.label }}
            </button>
          </div>

          <label class="mini">
            <span class="mini__label">De</span>
            <input
              v-model="store.dataDe"
              type="date"
              class="mini__input"
              :max="store.dataAte || undefined"
              @change="store.carregar()"
            />
          </label>

          <label class="mini">
            <span class="mini__label">Até</span>
            <input
              v-model="store.dataAte"
              type="date"
              class="mini__input"
              :min="store.dataDe || undefined"
              @change="store.carregar()"
            />
          </label>

          <label class="mini mini--select">
            <span class="mini__label">Posto</span>
            <select
              v-model="store.filtroPosto"
              class="mini__input"
              @change="store.carregar()"
            >
              <option value="">Todos</option>
              <option v-for="p in store.postos" :key="p" :value="p">
                {{ p }}
              </option>
            </select>
            <q-icon name="expand_more" size="16px" class="mini__chevron" />
          </label>

          <button
            v-if="temFiltros"
            type="button"
            class="controlos__limpar"
            @click="store.limparFiltros()"
          >
            <q-icon name="close" size="16px" />
            Limpar
          </button>
        </div>

        <p v-if="store.periodoInvalido" class="controlos__erro" role="alert">
          <q-icon name="error" size="16px" />
          A data inicial não pode ser posterior à data final.
        </p>

        <nav class="secoes" aria-label="Secções do relatório">
          <button
            v-for="s in secoes"
            :key="s.id"
            type="button"
            class="secoes__item"
            @click="irParaSeccao(s.id)"
          >
            <q-icon :name="s.icon" size="16px" />
            {{ s.label }}
          </button>
        </nav>
      </div>

      <!-- ============================================================ -->
      <!-- SECÇÃO 1: TENDÊNCIA                                           -->
      <!-- ============================================================ -->
      <section id="sec-tendencia" class="seccao">
        <header class="seccao__head">
          <span class="seccao__num">1</span>
          <div>
            <h2 class="seccao__title">Tendência</h2>
            <p class="seccao__sub">
              Como evoluiu a actividade ao longo do período
            </p>
          </div>
        </header>

        <div class="duo">
          <!-- Linha -->
          <article class="card">
            <header class="card__head">
              <h3 class="card__title">Operações por dia</h3>
              <span class="card__tag">
                {{ store.serieDias.length }} dia(s)
              </span>
            </header>

            <svg
              v-if="store.valores.length"
              viewBox="0 0 400 200"
              class="line-chart"
              role="img"
              aria-label="Operações por dia"
            >
              <defs>
                <linearGradient id="rel-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#10b981" stop-opacity="0.3" />
                  <stop offset="1" stop-color="#10b981" stop-opacity="0" />
                </linearGradient>
              </defs>

              <line
                v-for="(y, i) in [20, 100, 180]"
                :key="`gy-${i}`"
                :x1="30"
                :y1="y"
                :x2="390"
                :y2="y"
                class="line-chart__grid"
              />

              <text
                v-for="(label, i) in [
                  0,
                  Math.round(store.maxY / 2),
                  store.maxY,
                ]"
                :key="`ly-${i}`"
                :x="22"
                :y="[20, 100, 180][i]! + 4"
                class="line-chart__axis"
                text-anchor="end"
              >
                {{ label }}
              </text>

              <path :d="store.areaPath" class="line-chart__area" />
              <path :d="store.linePath" class="line-chart__line" />

              <circle
                v-for="(p, i) in store.pontos"
                :key="`p-${i}`"
                :cx="p.x"
                :cy="p.y"
                r="4.5"
                class="line-chart__dot"
              >
                <title>
                  Dia {{ store.labelsX[i] }}:
                  {{ store.valores[i] }} operações
                </title>
              </circle>

              <text
                v-for="(label, i) in store.labelsX"
                :key="`lx-${i}`"
                :x="
                  store.labelsX.length === 1
                    ? 210
                    : 30 + i * (360 / (store.labelsX.length - 1))
                "
                :y="195"
                class="line-chart__axis"
                text-anchor="middle"
              >
                {{ label }}
              </text>
            </svg>

            <div v-else class="vazio-mini">
              <q-icon name="show_chart" size="28px" />
              <span>Sem dados no período</span>
            </div>
          </article>

          <!-- Coluna lateral: donut -->
          <div class="duo__lado">
            <article class="card">
              <header class="card__head">
                <h3 class="card__title">Estado das operações</h3>
              </header>

              <div v-if="store.totalOperacoes" class="donut">
                <div class="donut__ring">
                  <svg
                    width="124"
                    height="124"
                    viewBox="0 0 42 42"
                    role="img"
                    aria-label="Estado das operações"
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
                      v-for="(s, i) in store.distribuicaoEstado"
                      :key="i"
                      cx="21"
                      cy="21"
                      r="15.9"
                      fill="none"
                      :stroke="s.cor"
                      stroke-width="6"
                      :stroke-dasharray="`${s.percent} ${100 - s.percent}`"
                      :stroke-dashoffset="s.offset"
                      transform="rotate(-90 21 21)"
                    />
                  </svg>
                  <div class="donut__centro">
                    <b>{{ store.totalOperacoes }}</b>
                    <small>operações</small>
                  </div>
                </div>

                <ul class="donut__legend">
                  <li v-for="(s, i) in store.distribuicaoEstado" :key="i">
                    <span class="donut__dot" :style="{ background: s.cor }" />
                    <span class="donut__label">{{ s.label }}</span>
                    <b class="donut__valor">{{ s.valor }}</b>
                  </li>
                </ul>
              </div>

              <div v-else class="vazio-mini">
                <q-icon name="donut_large" size="28px" />
                <span>Sem operações</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- SECÇÃO 2: DISTRIBUIÇÃO                                        -->
      <!-- ============================================================ -->
      <section id="sec-distribuicao" class="seccao">
        <header class="seccao__head">
          <span class="seccao__num">2</span>
          <div>
            <h2 class="seccao__title">Distribuição</h2>
            <p class="seccao__sub">
              Onde se concentra o trabalho operacional
            </p>
          </div>
        </header>

        <article class="card">
          <header class="card__head">
            <h3 class="card__title">Operações por posto</h3>
            <span class="card__tag">Top postos</span>
          </header>

          <div v-if="store.operacoesPorPosto.length" class="bars">
            <div
              v-for="(b, i) in store.operacoesPorPosto"
              :key="i"
              class="bars__row"
            >
              <div class="bars__label">{{ b.nome }}</div>
              <div
                class="bars__track"
                role="img"
                :aria-label="`${b.nome}: ${b.valor}`"
              >
                <div
                  class="bars__fill"
                  :style="{ width: `${b.percentagem}%` }"
                />
              </div>
              <div class="bars__value">{{ b.valor }}</div>
            </div>
          </div>

          <div v-else class="vazio-mini">
            <q-icon name="bar_chart" size="28px" />
            <span>Sem operações</span>
          </div>
        </article>
      </section>

      <!-- ============================================================ -->
      <!-- SECÇÃO 3: DETALHE                                             -->
      <!-- ============================================================ -->
      <section id="sec-detalhe" class="seccao">
        <header class="seccao__head seccao__head--linha">
          <div class="seccao__head-txt">
            <span class="seccao__num">3</span>
            <div>
              <h2 class="seccao__title">Detalhe</h2>
              <p class="seccao__sub">
                Registos que sustentam os números acima
              </p>
            </div>
          </div>

          <label class="pesquisa">
            <q-icon name="search" size="18px" />
            <input
              v-model="pesquisa"
              type="text"
              placeholder="Pesquisar nas tabelas"
              aria-label="Pesquisar nas tabelas"
            />
            <button
              v-if="pesquisa"
              type="button"
              class="pesquisa__x"
              aria-label="Limpar pesquisa"
              @click="pesquisa = ''"
            >
              <q-icon name="close" size="16px" />
            </button>
          </label>
        </header>

        <!-- Operações -->
        <article class="card card--tabela">
          <header class="tabela__head">
            <h3 class="card__title">Operações</h3>
            <span class="card__tag">
              {{ operacoesVista.length }} registos
            </span>
          </header>

          <div v-if="operacoesVista.length" class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Turno</th>
                  <th>Viatura</th>
                  <th>Posto</th>
                  <th>Início</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="op in operacoesVista" :key="op.codigo">
                  <td><b class="codigo">{{ op.codigo }}</b></td>
                  <td>{{ op.tipo }}</td>
                  <td><b class="placa">{{ op.viatura }}</b></td>
                  <td>{{ op.posto }}</td>
                  <td class="table-time">{{ op.agendada }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="`badge--${badgeEstado(op.estado)}`"
                    >
                      {{ op.estado }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="vazio">
            <div class="vazio__icon">
              <q-icon name="assignment" size="30px" />
            </div>
            <b>Nenhuma operação encontrada</b>
            <p>Ajuste o período, o posto ou a pesquisa.</p>
          </div>
        </article>

        <!-- Viaturas -->
        <article class="card card--tabela">
          <header class="tabela__head">
            <h3 class="card__title">Utilização de viaturas</h3>
            <span class="card__tag">
              {{ viaturasVista.length }} viaturas
            </span>
          </header>

          <p class="nota-gps">
            <q-icon name="info" size="16px" />
            {{ viaturasVista.length }} viatura(s) com operações no período
            seleccionado.
          </p>

          <div v-if="viaturasVista.length" class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Viatura</th>
                  <th>Posto</th>
                  <th>Operações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in viaturasVista" :key="v.viatura">
                  <td><b class="placa">{{ v.viatura }}</b></td>
                  <td>{{ v.posto }}</td>
                  <td class="num">{{ v.operacoes }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="vazio">
            <div class="vazio__icon">
              <q-icon name="directions_car" size="30px" />
            </div>
            <b>Nenhuma viatura encontrada</b>
            <p>Ajuste o posto ou a pesquisa.</p>
          </div>
        </article>
      </section>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  useAdminRelatoriosStore,
  type EstadoOperacao,
} from '@/stores/admin/relatorios.store'

const $q = useQuasar()
const store = useAdminRelatoriosStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Estado local
// ============================================================
const pesquisa = ref('')

const temFiltros = computed(
  () => !!store.dataDe || !!store.dataAte || !!store.filtroPosto,
)

// ============================================================
// Navegação por secções
// ============================================================
const secoes = [
  { id: 'sec-tendencia', label: 'Tendência', icon: 'show_chart' },
  { id: 'sec-distribuicao', label: 'Distribuição', icon: 'bar_chart' },
  { id: 'sec-detalhe', label: 'Detalhe', icon: 'table_rows' },
]

function irParaSeccao(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ============================================================
// Pesquisa nas tabelas
// ============================================================
function normalizar(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const operacoesVista = computed(() => {
  const q = normalizar(pesquisa.value.trim())
  if (!q) return store.operacoes

  return store.operacoes.filter((o) =>
    normalizar(
      [o.codigo, o.tipo, o.viatura, o.posto, o.estado].join(' '),
    ).includes(q),
  )
})

const viaturasVista = computed(() => {
  const q = normalizar(pesquisa.value.trim())
  if (!q) return store.viaturasVista

  return store.viaturasVista.filter((v) =>
    normalizar([v.viatura, v.posto].join(' ')).includes(q),
  )
})

// ============================================================
// Estado → cor do badge
// ============================================================
function badgeEstado(
  estado: EstadoOperacao,
): 'regular' | 'atencao' | 'critico' | 'neutral' {
  if (estado === 'Concluída') return 'regular'
  if (estado === 'Cancelada') return 'critico'
  if (estado === 'Em curso') return 'atencao'
  return 'neutral'
}

// ============================================================
// Exportar Excel
// ============================================================
async function exportarExcel() {
  const blob = await store.exportarXlsx()
  if (!blob) {
    $q.notify({
      type: 'negative',
      message: store.erro ?? 'Erro ao exportar Excel.',
      position: 'top',
    })
    return
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sicam-relatorio-${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Relatório Excel exportado.',
    position: 'top',
  })
}

// ============================================================
// Exportar PDF
// ============================================================
async function exportarPDF() {
  const blob = await store.exportarPdf()
  if (!blob) {
    $q.notify({
      type: 'negative',
      message: store.erro ?? 'Erro ao exportar PDF.',
      position: 'top',
    })
    return
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sicam-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`
  a.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Relatório PDF exportado.',
    position: 'top',
  })
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

.rel-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 0;
}

.sk-hero {
  @extend %sk-block;
  height: 260px;
  border-radius: 24px;
}

.sk-controls {
  @extend %sk-block;
  height: 96px;
  border-radius: 18px;
}

.sk-grid-2 {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
}

.sk-grid-1 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.sk-card {
  @extend %sk-block;
  height: 320px;
  border-radius: 20px;
}

/* ============================================================ */
/* Página                                                       */
/* ============================================================ */
.rel-page {
  --r-ink: var(--sicam-ink, #0f172a);
  --r-muted: var(--sicam-muted, #64748b);
  --r-line: var(--sicam-line, #e5ebe8);

  padding: 20px 20px 56px;
  max-width: 1180px;
  margin: 0 auto;
}

.print-head {
  display: none;
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
  margin: 16px 0;
}

/* ============================================================ */
/* Faixa de destaque                                            */
/* ============================================================ */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, #065f46 0%, #064e3b 55%, #04261d 100%);
  color: #fff;
  border-radius: 24px;
  padding: 28px 30px 26px;
  box-shadow: 0 16px 40px rgba(6, 78, 59, 0.22);

  @media (max-width: 640px) {
    padding: 22px 18px;
    border-radius: 20px;
  }

  &__deco {
    position: absolute;
    right: -120px;
    top: 50%;
    width: 600px;
    height: 600px;
    transform: translateY(-50%);
    pointer-events: none;

    circle {
      fill: none;
      stroke: rgba(255, 255, 255, 0.06);
      stroke-width: 1.5;
    }
  }

  &__top {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;

    @media (max-width: 760px) {
      flex-direction: column;
    }
  }

  &__title {
    font-size: 30px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
  }
  &__sub {
    font-size: 14px;
    color: #bfe6d6;
    margin: 0 0 14px;
  }

  &__ambito {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 0;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.12);
    color: #d5f0e4;
    font-size: 13px;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__kpis {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 620px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 380px) {
      grid-template-columns: 1fr;
    }
  }
}

.hbtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
  &:focus-visible {
    outline: 3px solid #fff;
    outline-offset: 2px;
  }

  &--gold {
    background: #facc15;
    border-color: #facc15;
    color: #3b2f00;

    &:hover {
      background: #fde047;
    }
  }
}

.hk {
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;

  &__top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__icon {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: rgba(250, 204, 21, 0.16);
    color: #facc15;
    flex-shrink: 0;
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #bfe6d6;
  }

  &__value {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  &__unid {
    font-size: 13px;
    font-weight: 600;
    color: #bfe6d6;
    letter-spacing: 0;
  }
  &__sub {
    font-size: 12px;
    color: #a9d9c5;
    margin-top: 4px;
  }

  &__bar {
    height: 5px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.16);
    overflow: hidden;
    margin-top: 10px;
  }
  &__fill {
    display: block;
    height: 100%;
    border-radius: 99px;
    background: #34d399;
  }
}

/* ============================================================ */
/* Barra de controlos                                           */
/* ============================================================ */
.controlos {
  margin: 16px 0 6px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--r-line);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__filtros {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__limpar {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 40px;
    padding: 0 14px;
    border: 0;
    border-radius: 12px;
    background: #ecfdf5;
    color: #065f46;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
      background: #d1fae5;
    }
  }

  &__erro {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #991b1b;

    .q-icon {
      color: #dc2626;
    }
  }
}

.seg {
  display: inline-flex;
  padding: 3px;
  background: #f1f5f4;
  border-radius: 12px;
  gap: 2px;
  flex-wrap: wrap;

  &__btn {
    border: 0;
    background: transparent;
    color: #475569;
    border-radius: 9px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    &:hover {
      color: #065f46;
    }

    &--active {
      background: #064e3b;
      color: #fff;
      &:hover {
        color: #fff;
      }
    }
  }
}

.mini {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__label {
    font-size: 12px;
    font-weight: 600;
    color: var(--r-muted);
  }

  &__input {
    height: 40px;
    border: 1px solid #d5dfda;
    border-radius: 12px;
    padding: 0 12px;
    font-size: 14px;
    font-family: inherit;
    color: var(--r-ink);
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:focus {
      outline: 0;
      border-color: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    }
  }

  &--select &__input {
    appearance: none;
    padding-right: 32px;
    min-width: 150px;
    cursor: pointer;
  }

  &__chevron {
    position: absolute;
    right: 10px;
    bottom: 12px;
    color: var(--r-muted);
    pointer-events: none;
  }
}

.secoes {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-top: 10px;
  border-top: 1px solid var(--sicam-line-soft, #eef2f0);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    border: 0;
    background: transparent;
    color: #334155;
    border-radius: 99px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    .q-icon {
      color: #10b981;
    }

    &:hover {
      background: #ecfdf5;
      color: #065f46;
    }
  }
}

/* ============================================================ */
/* Secções                                                      */
/* ============================================================ */
.seccao {
  scroll-margin-top: 170px;
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head {
    display: flex;
    align-items: center;
    gap: 14px;

    &--linha {
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }

  &__head-txt {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__num {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #064e3b;
    color: #facc15;
    font-size: 16px;
    font-weight: 800;
  }

  &__title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--r-ink);
    margin: 0;
  }
  &__sub {
    font-size: 14px;
    color: var(--r-muted);
    margin: 2px 0 0;
  }
}

.duo {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }

  &__lado {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
}

/* ============================================================ */
/* Cartão base                                                  */
/* ============================================================ */
.card {
  background: #fff;
  border: 1px solid var(--r-line);
  border-radius: 20px;
  padding: 22px;
  min-width: 0;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--r-ink);
    margin: 0;
  }

  &__tag {
    font-size: 12px;
    font-weight: 600;
    color: #065f46;
    background: #ecfdf5;
    padding: 4px 12px;
    border-radius: 99px;
    white-space: nowrap;
  }

  &--tabela {
    padding: 0;
    overflow: hidden;
  }
}

.tabela__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--r-line);
}

.vazio-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 160px;
  color: var(--r-muted);
  font-size: 13px;

  .q-icon {
    color: #a7e3c8;
  }
}

/* Linha */
.line-chart {
  width: 100%;
  height: auto;
  display: block;

  &__grid {
    stroke: #eef2f0;
    stroke-width: 1;
    stroke-dasharray: 3 4;
  }
  &__axis {
    font-size: 10px;
    fill: var(--r-muted);
  }
  &__area {
    fill: url(#rel-area);
  }

  &__line {
    fill: none;
    stroke: #059669;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &__dot {
    fill: #fff;
    stroke: #059669;
    stroke-width: 2.5;
  }
}

/* Donut */
.donut {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: center;

  &__ring {
    position: relative;
    width: 124px;
    height: 124px;
    flex-shrink: 0;
  }

  &__centro {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1.1;
    pointer-events: none;

    b {
      font-size: 24px;
      font-weight: 800;
      color: var(--r-ink);
      letter-spacing: -0.02em;
    }
    small {
      font-size: 11px;
      color: var(--r-muted);
    }
  }

  &__legend {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    min-width: 130px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  &__label {
    flex: 1;
    color: #475569;
  }
  &__valor {
    font-weight: 800;
    color: var(--r-ink);
    font-variant-numeric: tabular-nums;
  }
}

/* Barras horizontais */
.bars {
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__row {
    display: grid;
    grid-template-columns: 140px 1fr 64px;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-size: 13px;
    color: #334155;
    font-weight: 600;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__track {
    height: 12px;
    background: #eef2f0;
    border-radius: 99px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    border-radius: 99px;
    transition: width 0.5s ease;
  }

  &__value {
    font-size: 13px;
    font-weight: 800;
    color: var(--r-ink);
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  @media (max-width: 520px) {
    &__row {
      grid-template-columns: 100px 1fr 50px;
      gap: 8px;
    }
  }
}

/* Pesquisa */
.pesquisa {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--r-line);
  border-radius: 14px;
  padding: 0 10px 0 14px;
  height: 44px;
  min-width: 260px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  }

  .q-icon {
    color: var(--r-muted);
    flex-shrink: 0;
  }

  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    background: transparent;
    font-size: 14px;
    font-family: inherit;
    color: var(--r-ink);

    &:focus {
      outline: 0;
    }
    &::placeholder {
      color: #94a3b8;
    }
  }

  &__x {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: #e2e9e6;
    color: #475569;
    cursor: pointer;

    &:hover {
      background: #d0dad6;
    }
  }

  @media (max-width: 560px) {
    width: 100%;
    min-width: 0;
  }
}

.nota-gps {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 22px 4px;
  font-size: 13px;
  color: var(--r-muted);

  .q-icon {
    color: #065f46;
  }
}

/* ============================================================ */
/* Tabelas                                                      */
/* ============================================================ */
.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;

  th {
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: var(--r-muted);
    padding: 13px 22px;
    background: #f6f9f8;
    border-bottom: 1px solid var(--r-line);
    white-space: nowrap;
  }

  td {
    padding: 14px 22px;
    font-size: 14px;
    color: var(--r-ink);
    border-bottom: 1px solid var(--sicam-line-soft, #eef2f0);
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: 0;
  }
  tbody tr:hover {
    background: #f8fcfa;
  }
}

.num {
  font-variant-numeric: tabular-nums;
}
.table-time {
  color: var(--r-muted);
  font-size: 13px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.placa {
  font-weight: 800;
  letter-spacing: 0.04em;
}
.codigo {
  font-weight: 700;
  letter-spacing: 0.02em;
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

  &--regular {
    background: #ecfdf5;
    color: #065f46;
  }
  &--atencao {
    background: #fffbeb;
    color: #92400e;
  }
  &--critico {
    background: #fef2f2;
    color: #991b1b;
  }
  &--neutral {
    background: #f1f5f9;
    color: #475569;
  }
}

.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 44px 20px;

  &__icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #ecfdf5;
    color: #065f46;
    margin-bottom: 14px;
  }

  b {
    font-size: 16px;
    color: var(--r-ink);
    margin-bottom: 4px;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: var(--r-muted);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bars__fill {
    transition: none;
  }
}

/* ============================================================ */
/* Impressão                                                    */
/* ============================================================ */
@media print {
  .print-head {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-bottom: 12px;
    margin-bottom: 16px;
    border-bottom: 2px solid #064e3b;
    font-size: 12px;
    color: #475569;

    b {
      font-size: 18px;
      color: #064e3b;
    }
  }

  .rel-page {
    padding: 0;
    max-width: 100%;
  }

  .hero {
    background: #fff;
    color: #064e3b;
    border: 2px solid #064e3b;
    box-shadow: none;
    padding: 16px;
    break-inside: avoid;

    &__deco,
    &__actions,
    &__title,
    &__sub,
    &__ambito {
      display: none !important;
    }

    &__top {
      margin-bottom: 12px;
    }
  }

  .hk {
    background: #fff;
    border: 1px solid #cbd5d1;

    &__label,
    &__unid,
    &__sub {
      color: #475569;
    }
    &__value {
      color: #064e3b;
    }
    &__icon {
      background: #ecfdf5;
      color: #065f46;
    }
    &__bar {
      background: #e2e9e6;
    }
    &__fill {
      background: #059669;
    }
  }

  .controlos,
  .rel-skeleton {
    display: none !important;
  }

  .seccao {
    margin-top: 18px;
    scroll-margin-top: 0;
  }
  .seccao__num {
    background: #064e3b;
    color: #fff;
  }

  .duo {
    display: block;
  }
  .duo__lado,
  .duo > .card {
    margin-bottom: 12px;
  }

  .pesquisa {
    display: none !important;
  }

  .card {
    box-shadow: none;
    border: 1px solid #cbd5d1;
    break-inside: avoid;
  }

  .table-scroll {
    overflow: visible;
  }
  .data-table {
    min-width: 0;
  }
}
</style>

<style lang="scss">
@media print {
  .q-header,
  .q-drawer,
  .q-drawer-container,
  .sicam-skip {
    display: none !important;
  }

  .q-page-container {
    padding: 0 !important;
  }

  body {
    background: #fff !important;
  }
}
</style>