<template>
  <q-page class="rel-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="rel-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-kpis">
        <div v-for="i in 5" :key="`sk-kpi-${i}`" class="sk-kpi" />
      </div>
      <div class="sk-block" />
      <div class="sk-block" />
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Relatórios · Frota</h1>
          <p class="page-head__sub">
            Operações, frota e utilização de viaturas
          </p>
        </div>

        <div class="page-head__actions">
          <q-btn
            flat
            round
            icon="refresh"
            :loading="store.aCarregar"
            @click="store.carregar"
          />
          <button class="page-btn" @click="exportarExcel">
            <q-icon name="file_download" size="18px" />
            Excel
          </button>
          <button class="page-btn" @click="exportarPDF">
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

      <!-- ALERTAS ADMIN -->
      <div
        v-if="store.totalAnomalias > 0 || store.totalOperacoesPendentes > 0"
        class="alerts"
      >
        <div
          v-if="store.totalAnomalias > 0"
          class="alert alert--critico"
          @click="store.toggleAnomalias()"
        >
          <q-icon name="warning" size="20px" />
          <div>
            <b>{{ store.totalAnomalias }} viatura(s) com variação anómala</b>
            <small>Toque para filtrar apenas estas viaturas.</small>
          </div>
          <q-icon name="chevron_right" size="20px" class="alert__chevron" />
        </div>

        <div
          v-if="store.totalOperacoesPendentes > 0"
          class="alert alert--atencao"
        >
          <q-icon name="error_outline" size="20px" />
          <div>
            <b>{{ store.totalOperacoesPendentes }} operação(ões) pendente(s)</b>
            <small>Planeadas ou em curso no período selecionado.</small>
          </div>
        </div>
      </div>

      <!-- PERÍODO + FILTROS -->
      <section class="period">
        <div class="period__field">
          <label class="period__label">De</label>
          <input v-model="store.dataDe" type="date" class="period__input" />
        </div>
        <div class="period__field">
          <label class="period__label">Até</label>
          <input v-model="store.dataAte" type="date" class="period__input" />
        </div>

        <div class="period__field">
          <label class="period__label">Viatura</label>
          <select
            :value="store.filtroViatura"
            class="period__input"
            @change="
              (e) =>
                store.setFiltroViatura((e.target as HTMLSelectElement).value)
            "
          >
            <option value="">Todas</option>
            <option v-for="v in store.opcoesViaturas" :key="v" :value="v">
              {{ v }}
            </option>
          </select>
        </div>

        <button class="period__btn" @click="store.carregar">Aplicar</button>

        <button
          v-if="temFiltros"
          class="period__btn period__btn--ghost"
          @click="limparFiltrosEAplicar"
        >
          Limpar
        </button>
      </section>

      <!-- KPIs -->
      <section class="kpi-grid">
        <div class="kpi">
          <div class="kpi__label">Operações</div>
          <div class="kpi__value">{{ store.kpis.operacoes }}</div>
        </div>
        <div class="kpi">
          <div class="kpi__label">Concluídas</div>
          <div class="kpi__value">{{ store.kpis.concluidas }}</div>
          <div class="kpi__sub">{{ store.kpis.taxaConclusao }}</div>
        </div>
        <div class="kpi">
          <div class="kpi__label">No prazo</div>
          <div class="kpi__value">{{ store.kpis.noPrazo }}</div>
        </div>
        <div class="kpi">
          <div class="kpi__label">Distância</div>
          <div class="kpi__value">
            {{ store.kpis.distancia }}<span class="kpi__unid"> km</span>
          </div>
        </div>
        <div class="kpi">
          <div class="kpi__label">Duração</div>
          <div class="kpi__value">
            {{ store.kpis.duracao }}<span class="kpi__unid"> min</span>
          </div>
        </div>
      </section>

      <!-- VIATURAS -->
      <section class="block">
        <header class="block__head">
          <div class="block__head-row">
            <div>
              <h2 class="block__title">Utilização de viaturas</h2>
              <p class="block__sub">
                Distância GPS vs odómetro — diferenças grandes merecem
                verificação
              </p>
            </div>

            <label class="block__toggle">
              <input
                type="checkbox"
                :checked="store.apenasAnomalias"
                @change="store.toggleAnomalias()"
              />
              <span>Apenas anomalias</span>
            </label>
          </div>
        </header>

        <table class="data-table">
          <thead>
            <tr>
              <th>Viatura</th>
              <th>Operações</th>
              <th>GPS</th>
              <th>Odómetro</th>
              <th>Variação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in store.viaturasFiltradas" :key="v.viatura">
              <td>
                <b>{{ v.viatura }}</b>
              </td>
              <td>{{ v.operacoes }}</td>
              <td>{{ v.gps }}</td>
              <td>{{ v.odometro }}</td>
              <td>
                <span
                  class="variacao"
                  :class="v.anomalia ? 'variacao--critico' : ''"
                >
                  {{ v.variacao }}
                </span>
              </td>
            </tr>

            <tr v-if="!store.viaturasFiltradas.length">
              <td colspan="5" class="data-table__empty">
                Sem viaturas para os filtros aplicados.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- OPERAÇÕES -->
      <section class="block">
        <header class="block__head">
          <div class="block__head-row">
            <h2 class="block__title">Operações</h2>

            <select
              :value="store.filtroEstado"
              class="block__filter"
              @change="
                (e) =>
                  store.setFiltroEstado(
                    (e.target as HTMLSelectElement).value as any,
                  )
              "
            >
              <option value="">Todos os estados</option>
              <option v-for="e in store.estadosDisponiveis" :key="e" :value="e">
                {{ e }}
              </option>
            </select>
          </div>
        </header>

        <table class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Viatura</th>
              <th>Agendada</th>
              <th>Distância</th>
              <th>Responsável</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="op in store.operacoesFiltradas" :key="op.codigo">
              <td>
                <b>{{ op.codigo }}</b>
              </td>
              <td>{{ op.tipo }}</td>
              <td>{{ op.viatura }}</td>
              <td class="table-time">{{ op.agendada }}</td>
              <td>{{ op.distancia }}</td>
              <td>{{ op.responsavel ?? '—' }}</td>
              <td>
                <span
                  class="badge"
                  :class="`badge--${store.badgeEstado(op.estado)}`"
                >
                  {{ op.estado }}
                </span>
              </td>
            </tr>

            <tr v-if="!store.operacoesFiltradas.length">
              <td colspan="7" class="data-table__empty">
                Sem operações para os filtros aplicados.
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
import { useAdminRelatoriosFrotaStore } from '@/stores/admin/relatorios-frota.store'

const $q = useQuasar()
const store = useAdminRelatoriosFrotaStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Estado derivado
// ============================================================
const temFiltros = computed(
  () =>
    !!store.filtroViatura ||
    !!store.filtroEstado ||
    store.apenasAnomalias ||
    !!store.dataDe ||
    !!store.dataAte,
)

// ============================================================
// Acções
// ============================================================
function limparFiltrosEAplicar() {
  store.limparFiltros()
  store.carregar()
}

// ============================================================
// Export — Excel
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
  a.download = `admin-frota-${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Ficheiro Excel exportado.',
    position: 'top',
  })
}

// ============================================================
// Export — PDF
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
  a.download = `admin-frota-${new Date().toISOString().slice(0, 10)}.pdf`
  a.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Ficheiro PDF exportado.',
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

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sk-kpi {
  @extend %sk-block;
  height: 100px;
  border-radius: 14px;
}

.sk-block {
  @extend %sk-block;
  height: 280px;
  border-radius: 14px;
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

/* ============================================================ */
/* Página                                                       */
/* ============================================================ */
.rel-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

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
    align-items: center;
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
  &:hover {
    background: var(--sicam-surface-hover);
  }
}

/* Alertas */
.alerts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: default;

  &__chevron {
    margin-left: auto;
    opacity: 0.6;
  }

  b {
    display: block;
    font-size: 13px;
    font-weight: 700;
  }
  small {
    display: block;
    font-size: 12px;
    margin-top: 2px;
    opacity: 0.85;
  }

  &--critico {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
    cursor: pointer;
    &:hover {
      filter: brightness(0.98);
    }
  }
  &--atencao {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
  }
}

/* Período */
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

  &__field {
    flex: 1;
    min-width: 160px;
  }

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
    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
    }
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
    &:hover {
      background: var(--sicam-primary);
    }

    &--ghost {
      background: #fff;
      color: var(--sicam-ink);
      border: 1px solid var(--sicam-line);
      &:hover {
        background: var(--sicam-surface-hover);
      }
    }
  }
}

/* KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 24px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 450px) {
    grid-template-columns: 1fr;
  }
}

.kpi {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__label {
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    margin-bottom: 8px;
  }

  &__value {
    font-size: 24px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
  }

  &__unid {
    font-size: 14px;
    font-weight: 500;
    color: var(--sicam-muted);
  }

  &__sub {
    font-size: 11px;
    color: var(--sicam-muted);
    margin-top: 4px;
  }
}

/* Blocos */
.block {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;

  &__head {
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__head-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
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
    margin: 4px 0 0;
    line-height: 1.4;
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--sicam-ink);
    cursor: pointer;
    user-select: none;
    padding: 6px 12px;
    border: 1px solid var(--sicam-line);
    border-radius: 99px;

    input {
      accent-color: var(--sicam-primary);
      cursor: pointer;
    }
    &:hover {
      background: var(--sicam-surface-hover);
    }
  }

  &__filter {
    border: 1px solid var(--sicam-line);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    font-family: inherit;
    color: var(--sicam-ink);
    background: #fff;
    cursor: pointer;

    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
    }
  }
}

/* Tabela */
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

  &__empty {
    text-align: center;
    color: var(--sicam-muted);
    padding: 32px 16px !important;
    font-size: 14px;
  }
}

.table-time {
  color: var(--sicam-muted);
  font-size: 13px;
  white-space: nowrap;
}

.variacao {
  font-weight: 600;
  color: var(--sicam-ink);
  &--critico {
    color: var(--sicam-critical);
  }
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
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
  }
  &--atencao {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
  }
  &--critico {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }
  &--neutral {
    background: var(--sicam-neutral-bg);
    color: var(--sicam-neutral-ink);
  }
}

/* Impressão */
@media print {
  .page-head__actions,
  .period,
  .page-btn,
  .block__toggle,
  .block__filter {
    display: none !important;
  }
  .rel-page {
    padding: 0;
    max-width: 100%;
  }
  .block,
  .kpi {
    box-shadow: none;
    border: 1px solid var(--sicam-line);
    page-break-inside: avoid;
  }
}
</style>