<template>
  <q-page class="sn-page">
    <!-- SKELETON -->
    <div v-if="!store.carregado" class="ina-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-kpis">
        <div v-for="i in 4" :key="i" class="sk-kpi" />
      </div>
      <div class="sk-table">
        <div v-for="i in 6" :key="i" class="sk-row" />
      </div>
    </div>

    <!-- CONTEÚDO -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Sinistros</h1>
          <p class="page-head__sub">
            Registo de sinistros associados a apólices activas
          </p>
        </div>

        <div class="page-head__actions">
          <button
            class="page-btn page-btn--outline"
            :disabled="store.aCarregar"
            @click="exportarExcel"
          >
            <q-icon name="file_download" size="18px" />
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
          <button class="page-btn page-btn--primary" @click="store.abrirNovo()">
            <q-icon name="add" size="18px" />
            Registar sinistro
          </button>
        </div>
      </header>

      <!-- KPIs -->
      <section class="kpi-grid">
        <div class="kpi">
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="report_problem" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Total</div>
          </div>
        </div>
        <div class="kpi">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="pending" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.abertos }}</div>
            <div class="kpi__label">Abertos</div>
          </div>
        </div>
        <div class="kpi">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="autorenew" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.emAnalise }}</div>
            <div class="kpi__label">Em análise</div>
          </div>
        </div>
        <div class="kpi">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="check_circle" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.resolvidos }}</div>
            <div class="kpi__label">Resolvidos</div>
          </div>
        </div>
      </section>

      <!-- FILTROS -->
      <section class="filters">
        <div class="filter filter--search">
          <q-icon name="search" size="20px" class="filter__icon" />
          <input
            v-model="store.pesquisa"
            type="text"
            class="filter__input"
            placeholder="Pesquisar por matrícula, nº sinistro, segurado…"
          />
        </div>

        <select v-model="store.filtroTipo" class="filter filter__select">
          <option value="">Todos os tipos</option>
          <option v-for="t in store.TIPOS" :key="t" :value="t">{{ t }}</option>
        </select>

        <select v-model="store.filtroEstado" class="filter filter__select">
          <option value="">Todos os estados</option>
          <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
        </select>

        <select v-model="store.filtroGravidade" class="filter filter__select">
          <option value="">Todas as gravidades</option>
          <option v-for="g in store.GRAVIDADES" :key="g" :value="g">{{ g }}</option>
        </select>

        <select v-model="store.filtroSeguradora" class="filter filter__select">
          <option value="">Todas as seguradoras</option>
          <option v-for="s in store.SEGURADORAS" :key="s" :value="s">{{ s }}</option>
        </select>

        <button
          v-if="store.temFiltrosAtivos"
          class="page-btn page-btn--outline"
          @click="store.limparFiltros()"
        >
          <q-icon name="filter_alt_off" size="18px" />
          Limpar
        </button>
      </section>

      <!-- ERRO -->
      <div v-if="store.erro" class="form-error">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- TABELA -->
      <section class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nº Sinistro</th>
              <th>Matrícula</th>
              <th>Seguradora</th>
              <th>Tipo</th>
              <th>Gravidade</th>
              <th>Data</th>
              <th>Valor estimado</th>
              <th>Estado</th>
              <th class="data-table__th-actions" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in store.paginados" :key="s.id" class="data-table__row">
              <td><b>{{ s.numero }}</b></td>
              <td>
                <div class="placa">
                  <q-icon name="directions_car" size="14px" class="placa__icon" />
                  <b>{{ s.matricula }}</b>
                </div>
              </td>
              <td>{{ s.seguradora }}</td>
              <td>
                <span class="tipo" :class="`tipo--${store.tipoClasse(s.tipo)}`">
                  <q-icon :name="store.tipoIcone(s.tipo)" size="14px" />
                  {{ s.tipo }}
                </span>
              </td>
              <td>
                <span class="badge" :class="`badge--${store.gravidadeClasse(s.gravidade)}`">
                  {{ s.gravidade }}
                </span>
              </td>
              <td class="table-time">{{ s.data }}</td>
              <td class="cell-valor">{{ store.formatarMoeda(s.valorEstimado) }}</td>
              <td>
                <span class="badge" :class="`badge--${store.estadoClasse(s.estado)}`">
                  {{ s.estado }}
                </span>
              </td>
              <td class="data-table__actions">
                <button class="row-action" title="Ver" @click="store.abrirDetalhes(s)">
                  <q-icon name="visibility" size="18px" />
                </button>
                <button class="row-action" title="Editar" @click="store.abrirEditar(s)">
                  <q-icon name="edit" size="18px" />
                </button>
                <button
                  v-if="s.estado === 'Aberto'"
                  class="row-action row-action--success"
                  title="Marcar em análise"
                  @click="marcarEmAnalise(s.id)"
                >
                  <q-icon name="hourglass_top" size="18px" />
                </button>
              </td>
            </tr>

            <tr v-if="!store.paginados.length">
              <td colspan="9" class="data-table__empty">
                Nenhum sinistro encontrado com estes filtros.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginação -->
        <footer v-if="store.totalPaginas > 1" class="pagination">
          <div class="pagination__info">
            A mostrar
            <b>{{ store.inicioPagina + 1 }}–{{ store.fimPagina }}</b>
            de <b>{{ store.filtrados.length }}</b>
          </div>
          <div class="pagination__controls">
            <button
              class="pagination__btn"
              :disabled="store.pagina <= 1"
              @click="store.pagina--"
            >
              <q-icon name="chevron_left" size="18px" />
              Anterior
            </button>
            <span class="pagination__page">
              Página {{ store.pagina }} de {{ store.totalPaginas }}
            </span>
            <button
              class="pagination__btn"
              :disabled="store.pagina >= store.totalPaginas"
              @click="store.pagina++"
            >
              Próxima
              <q-icon name="chevron_right" size="18px" />
            </button>
          </div>
        </footer>
      </section>
    </template>

    <!-- MODAL — DETALHES -->
    <q-dialog v-model="store.modalDetalhes">
      <q-card
        v-if="store.sinistroDetalhe"
        class="form-card"
        style="min-width: 520px; max-width: 640px"
      >
        <q-card-section class="form-card__head">
          <div>
            <div class="form-card__title">{{ store.sinistroDetalhe.numero }}</div>
            <div class="form-card__sub">
              {{ store.sinistroDetalhe.matricula }} — {{ store.sinistroDetalhe.segurado }}
            </div>
          </div>
          <q-btn flat round icon="close" @click="store.modalDetalhes = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="detalhe-grid">
          <div>
            <span>Seguradora</span><b>{{ store.sinistroDetalhe.seguradora }}</b>
          </div>
          <div>
            <span>Apólice</span><b>{{ store.sinistroDetalhe.apolice }}</b>
          </div>
          <div>
            <span>Tipo</span><b>{{ store.sinistroDetalhe.tipo }}</b>
          </div>
          <div>
            <span>Gravidade</span><b>{{ store.sinistroDetalhe.gravidade }}</b>
          </div>
          <div>
            <span>Data</span><b>{{ store.sinistroDetalhe.data }}</b>
          </div>
          <div>
            <span>Responsável</span><b>{{ store.sinistroDetalhe.responsavel }}</b>
          </div>
          <div>
            <span>Local</span><b>{{ store.sinistroDetalhe.local }}</b>
          </div>
          <div>
            <span>Valor estimado</span>
            <b>{{ store.formatarMoeda(store.sinistroDetalhe.valorEstimado) }}</b>
          </div>
          <div v-if="store.sinistroDetalhe.valorAprovado">
            <span>Valor aprovado</span>
            <b>{{ store.formatarMoeda(store.sinistroDetalhe.valorAprovado) }}</b>
          </div>
          <div class="detalhe-grid__full">
            <span>Descrição</span><b>{{ store.sinistroDetalhe.descricao }}</b>
          </div>
          <div v-if="store.sinistroDetalhe.observacoes" class="detalhe-grid__full">
            <span>Observações</span><b>{{ store.sinistroDetalhe.observacoes }}</b>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- MODAL — FORMULÁRIO (3 PASSOS) -->
    <q-dialog v-model="store.modalForm" persistent>
      <q-card class="form-card" style="min-width: 520px; max-width: 620px">
        <q-card-section class="form-card__head">
          <div>
            <div class="form-card__title">
              {{ store.modoEdicao ? 'Editar sinistro' : 'Novo sinistro' }}
            </div>
            <div class="form-card__sub">Passo {{ store.passoForm }} de 3</div>
          </div>
          <q-btn flat round icon="close" @click="store.fecharForm()" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <!-- Passo 1 -->
          <div v-if="store.passoForm === 1" class="form-grid">
            <label>
              Nº Sinistro
              <input v-model="store.form.numero" :disabled="store.modoEdicao" />
            </label>
            <label>
              Matrícula
              <input v-model="store.form.matricula" placeholder="XXX-000-XX" />
            </label>
            <label>
              Apólice
              <input v-model="store.form.apolice" placeholder="AP-2026-000001" />
            </label>
            <label>
              Segurado
              <input v-model="store.form.segurado" />
            </label>
            <label>
              Seguradora
              <select v-model="store.form.seguradora">
                <option v-for="s in store.SEGURADORAS" :key="s" :value="s">{{ s }}</option>
              </select>
            </label>
          </div>

          <!-- Passo 2 -->
          <div v-else-if="store.passoForm === 2" class="form-grid">
            <label>
              Tipo
              <select v-model="store.form.tipo">
                <option v-for="t in store.TIPOS" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>
            <label>
              Gravidade
              <select v-model="store.form.gravidade">
                <option v-for="g in store.GRAVIDADES" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label>
              Data
              <input v-model="store.form.data" placeholder="dd/mm/aaaa" />
            </label>
            <label class="form-grid__full">
              Local
              <input v-model="store.form.local" />
            </label>
          </div>

          <!-- Passo 3 -->
          <div v-else class="form-grid">
            <label class="form-grid__full">
              Descrição
              <textarea v-model="store.form.descricao" rows="3" />
            </label>
            <label>
              Valor estimado (MT)
              <input v-model.number="store.form.valorEstimado" type="number" />
            </label>
            <label>
              Valor aprovado (MT)
              <input v-model.number="store.form.valorAprovado" type="number" />
            </label>
            <label>
              Estado
              <select v-model="store.form.estado">
                <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
              </select>
            </label>
            <label>
              Responsável
              <select v-model="store.form.responsavel">
                <option v-for="r in store.RESPONSAVEIS" :key="r" :value="r">
                  {{ r }}
                </option>
              </select>
            </label>
            <label class="form-grid__full">
              Observações
              <textarea v-model="store.form.observacoes" rows="2" />
            </label>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="between" class="form-card__actions">
          <button
            class="page-btn page-btn--outline"
            :disabled="store.passoForm === 1"
            @click="store.passoAnterior()"
          >
            <q-icon name="chevron_left" size="18px" />
            Anterior
          </button>

          <div class="form-card__actions-right">
            <button
              v-if="store.passoForm < 3"
              class="page-btn page-btn--primary"
              @click="store.proximoPasso()"
            >
              Próximo
              <q-icon name="chevron_right" size="18px" />
            </button>
            <button
              v-else
              class="page-btn page-btn--primary"
              :disabled="!store.formValido || store.aSalvar"
              @click="submeterForm"
            >
              <q-icon name="save" size="18px" />
              {{ store.modoEdicao ? 'Guardar' : 'Registar' }}
            </button>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useIssmSinistrosStore } from '@/stores/issm/issm-SinistrosStore'
import { sinistrosService } from '@/services/issm/sinistros.service'

const $q = useQuasar()
const store = useIssmSinistrosStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Ações
// ============================================================
async function marcarEmAnalise(id: string) {
  const ok = await store.marcarEmAnalise(id)
  if (ok) {
    $q.notify({
      type: 'info',
      message: 'Sinistro marcado em análise.',
      position: 'top',
    })
  } else if (store.erro) {
    $q.notify({
      type: 'negative',
      message: store.erro,
      position: 'top',
    })
  }
}

async function submeterForm() {
  const ok = await store.salvarForm()
  if (!ok) {
    if (store.erro) {
      $q.notify({
        type: 'negative',
        message: store.erro,
        position: 'top',
      })
    }
    return
  }

  $q.notify({
    type: 'positive',
    message: store.modoEdicao
      ? 'Sinistro actualizado com sucesso.'
      : 'Sinistro registado com sucesso.',
    position: 'top',
  })
  store.fecharForm()
}

// ============================================================
// Exportar Excel (XLSX via backend)
// ============================================================
async function exportarExcel() {
  try {
    const filtros: {
      tipo?: string
      estado?: string
      gravidade?: string
      seguradora?: string
    } = {}
    if (store.filtroTipo) filtros.tipo = store.filtroTipo
    if (store.filtroEstado) filtros.estado = store.filtroEstado
    if (store.filtroGravidade) filtros.gravidade = store.filtroGravidade
    if (store.filtroSeguradora) filtros.seguradora = store.filtroSeguradora

    const blob = await sinistrosService.exportarXlsx(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `issm-sinistros-${new Date().toISOString().slice(0, 10)}.xlsx`
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
    const filtros: {
      tipo?: string
      estado?: string
      gravidade?: string
      seguradora?: string
    } = {}
    if (store.filtroTipo) filtros.tipo = store.filtroTipo
    if (store.filtroEstado) filtros.estado = store.filtroEstado
    if (store.filtroGravidade) filtros.gravidade = store.filtroGravidade
    if (store.filtroSeguradora) filtros.seguradora = store.filtroSeguradora

    const blob = await sinistrosService.exportarPdf(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `issm-sinistros-${new Date().toISOString().slice(0, 10)}.pdf`
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
.sn-page {
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

.sk-kpis {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
  @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
}

.sk-kpi { @extend %sk-block; height: 80px; }

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
/* Cabeçalho                                                    */
/* ============================================================ */
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

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

  &--primary { background: var(--sicam-primary-light); color: #fff;
    &:hover:not(:disabled) { background: var(--sicam-primary); }
    &:disabled { opacity: 0.5; cursor: not-allowed; } }

  &--outline { background: #fff; color: var(--sicam-ink); border: 1px solid var(--sicam-line);
    &:hover:not(:disabled) { background: var(--sicam-surface-hover); }
    &:disabled { opacity: 0.5; cursor: not-allowed; } }
}

/* ============================================================ */
/* KPIs                                                         */
/* ============================================================ */
.kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 20px;
  @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.kpi {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;
    &--primary  { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }
  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

/* ============================================================ */
/* Filtros                                                      */
/* ============================================================ */
.filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }

.filter {
  display: flex; align-items: center; background: #fff;
  border: 1px solid var(--sicam-line); border-radius: 10px;
  padding: 0 14px; height: 44px; font-family: inherit;

  &--search { flex: 1; min-width: 240px; }
  &__icon { color: var(--sicam-muted); margin-right: 8px; flex-shrink: 0; }
  &__input {
    flex: 1; border: 0; background: transparent; font-size: 14px;
    color: var(--sicam-ink); height: 100%;
    &:focus { outline: 0; }
    &::placeholder { color: var(--sicam-muted); }
  }
  &__select {
    border: 0; background: transparent; font-size: 14px;
    color: var(--sicam-ink); height: 100%; cursor: pointer; min-width: 160px;
    &:focus { outline: 0; }
  }
}

/* ============================================================ */
/* Tabela                                                       */
/* ============================================================ */
.table-wrap {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
}

.data-table {
  width: 100%; border-collapse: collapse;
  min-width: 1150px;

  th {
    text-align: left; font-size: 11px; font-weight: 600; color: var(--sicam-muted);
    letter-spacing: 0.05em; text-transform: uppercase; padding: 12px 16px;
    background: #fafbfa; border-bottom: 1px solid var(--sicam-line); white-space: nowrap;
  }
  td {
    padding: 14px 16px; font-size: 14px; color: var(--sicam-ink);
    border-bottom: 1px solid var(--sicam-line-soft); vertical-align: middle;
  }
  &__row { transition: background 0.15s; &:hover { background: #fbfdfc; } &:last-child td { border-bottom: 0; } }
  &__th-actions { width: 120px; text-align: right; }
  &__actions { text-align: right; white-space: nowrap; }
  &__empty {
    text-align: center; color: var(--sicam-muted);
    padding: 40px 16px !important; font-size: 14px;
  }
}

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }
.cell-valor { font-weight: 700; color: var(--sicam-ink); white-space: nowrap; }

.placa {
  display: flex; align-items: center; gap: 6px;
  b { font-weight: 700; letter-spacing: 0.02em; }
  &__icon { color: var(--sicam-muted); }
}

.tipo {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 8px;
  font-size: 12px; font-weight: 600; white-space: nowrap;

  &--colisao     { background: #fef3c7; color: #a16207; }
  &--furto       { background: #fde8e8; color: #b91c1c; }
  &--incendio    { background: #fff1e6; color: #c2410c; }
  &--inundacao   { background: #dbeafe; color: #1e40af; }
  &--vandalismo  { background: #f3e8ff; color: #7c3aed; }
}

.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;

  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--info    { background: #e5e7eb; color: #374151; }
}

.row-action {
  display: inline-grid; place-items: center; width: 34px; height: 34px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sicam-muted);
  cursor: pointer; margin-left: 2px; transition: all 0.15s;

  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
  &--success:hover { background: var(--sicam-success-bg); color: var(--sicam-success-ink); }
}

/* ============================================================ */
/* Paginação                                                    */
/* ============================================================ */
.pagination {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 16px;
  border-top: 1px solid var(--sicam-line);
  flex-wrap: wrap;

  &__info { font-size: 13px; color: var(--sicam-muted);
    b { color: var(--sicam-ink); font-weight: 600; } }
  &__controls { display: flex; align-items: center; gap: 8px; }
  &__btn {
    display: inline-flex; align-items: center; gap: 4px;
    background: #fff; border: 1px solid var(--sicam-line); border-radius: 8px;
    padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--sicam-ink);
    cursor: pointer; font-family: inherit; transition: all 0.15s;
    &:hover:not(:disabled) { background: var(--sicam-surface-hover); border-color: var(--sicam-line-strong); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }
  &__page { font-size: 12px; color: var(--sicam-muted); font-weight: 600; padding: 0 4px; white-space: nowrap; }
}

/* ============================================================ */
/* Modal / Formulário                                           */
/* ============================================================ */
.form-card {
  border-radius: 14px;
  overflow: hidden;

  &__head {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 18px 22px !important;
  }
  &__title { font-size: 17px; font-weight: 700; color: var(--sicam-ink); }
  &__sub   { font-size: 13px; color: var(--sicam-muted); margin-top: 2px; }
  &__actions { padding: 12px 20px !important; }
  &__actions-right { display: flex; gap: 10px; }
}

.detalhe-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px;

  > div { display: flex; flex-direction: column; gap: 2px; }
  span { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sicam-muted); font-weight: 600; }
  b { font-size: 14px; color: var(--sicam-ink); font-weight: 600; }

  &__full { grid-column: 1 / -1; }
}

.form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;

  label {
    display: flex; flex-direction: column; gap: 6px;
    font-size: 12px; font-weight: 600; color: var(--sicam-muted);
  }
  input, select, textarea {
    border: 1px solid var(--sicam-line); border-radius: 8px;
    padding: 9px 12px; font-size: 14px; font-family: inherit;
    color: var(--sicam-ink); background: #fff;
    &:focus { outline: 0; border-color: var(--sicam-primary-light); }
    &:disabled { background: var(--sicam-surface-alt); color: var(--sicam-muted); cursor: not-allowed; }
  }
  &__full { grid-column: 1 / -1; }
}
</style>