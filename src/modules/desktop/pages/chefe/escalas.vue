<template>
  <q-page class="es-page">
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
        <div v-for="i in 5" :key="i" class="sk-row" />
      </div>
    </div>

    <!-- CONTEÚDO -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Escalas de Turno</h1>
          <p class="page-head__sub">
            Atribuição de turnos e folgas para os agentes de trânsito
          </p>
        </div>

        <div class="page-head__actions">
          <button
            class="page-btn page-btn--outline"
            :disabled="store.aCarregar"
            @click="exportarExcel"
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
          <button class="page-btn page-btn--primary" @click="store.abrirNova">
            <q-icon name="add" size="18px" />
            Nova escala
          </button>
        </div>
      </header>

      <!-- ALERTAS -->
      <div v-if="alertas.length" class="alertas">
        <div
          v-for="(a, i) in alertas"
          :key="i"
          class="alerta"
          :class="`alerta--${a.tipo}`"
        >
          <q-icon :name="a.icon" size="20px" class="alerta__icon" />
          <div class="alerta__body">
            <b>{{ a.titulo }}</b>
            <small>{{ a.descricao }}</small>
          </div>
        </div>
      </div>

      <!-- KPIs -->
      <section class="kpi-grid">
        <button class="kpi" @click="filtrarPor('total')">
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="event_note" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Total escalas</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Publicada')">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="check_circle" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.publicadas }}</div>
            <div class="kpi__label">Publicadas</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Rascunho')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="edit_note" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.rascunhos }}</div>
            <div class="kpi__label">Rascunhos</div>
          </div>
        </button>

        <div class="kpi kpi--static">
          <div class="kpi__icon kpi__icon--info">
            <q-icon name="analytics" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.cobertura }}%</div>
            <div class="kpi__label">Cobertura semanal</div>
          </div>
        </div>
      </section>

      <!-- SEMANA -->
      <section class="week-bar">
        <button class="week-btn" @click="mudarSemana('anterior')">
          <q-icon name="chevron_left" size="18px" />
        </button>
        <div class="week-info">
          <q-icon name="calendar_month" size="18px" />
          <span>{{ store.semanaAtual }}</span>
        </div>
        <button class="week-btn" @click="mudarSemana('seguinte')">
          <q-icon name="chevron_right" size="18px" />
        </button>
      </section>

      <!-- FILTROS -->
      <section class="filters">
        <div class="filter filter--search">
          <q-icon name="search" size="20px" class="filter__icon" />
          <input
            v-model="store.pesquisa"
            type="text"
            class="filter__input"
            placeholder="Pesquisar por agente, nº série…"
          />
        </div>

        <select v-model="store.filtroTurno" class="filter filter__select">
          <option value="">Todos os turnos</option>
          <option v-for="t in store.TURNOS" :key="t" :value="t">{{ t }}</option>
        </select>

        <select v-model="store.filtroPosto" class="filter filter__select">
          <option value="">Todos os postos</option>
          <option v-for="p in store.POSTOS" :key="p" :value="p">{{ p }}</option>
        </select>

        <select v-model="store.filtroEstado" class="filter filter__select">
          <option value="">Todos os estados</option>
          <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
        </select>

        <button
          v-if="store.temFiltrosAtivos"
          class="page-btn page-btn--outline page-btn--compact"
          @click="store.limparFiltros"
        >
          <q-icon name="close" size="16px" />
          Limpar
        </button>
      </section>

      <!-- TABELA -->
      <section class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Agente</th>
              <th>Posto</th>
              <th>Turno</th>
              <th>Dias activos</th>
              <th>Cobertura</th>
              <th>Estado</th>
              <th class="data-table__th-actions">Acções</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="e in store.paginados"
              :key="e.id"
              class="data-table__row"
              @click="store.abrirDetalhes(e)"
            >
              <td>
                <div class="agente">
                  <div class="agente__avatar">{{ store.iniciais(e.agente) }}</div>
                  <div>
                    <b>{{ e.agente }}</b>
                    <small>{{ e.nSerie }}</small>
                  </div>
                </div>
              </td>
              <td class="cell-muted">{{ e.posto }}</td>
              <td>
                <span
                  class="turno"
                  :class="`turno--${store.turnoClasse(store.turnoPredominante(e))}`"
                >
                  <q-icon :name="iconeTurno(store.turnoPredominante(e))" size="13px" />
                  {{ store.turnoPredominante(e) }}
                </span>
              </td>
              <td>
                <div class="cell-dias">
                  <span
                    v-for="dia in e.atribuicoes"
                    :key="dia.dia"
                    class="cell-dias__dot"
                    :class="{ 'cell-dias__dot--active': dia.ativo }"
                    :title="`${dia.dia} — ${dia.ativo ? dia.turno : 'Folga'}`"
                  >
                    {{ dia.dia[0] }}
                  </span>
                </div>
              </td>
              <td>
                <div class="cell-stats">
                  <span class="cell-stats__num">
                    {{ store.totalAtribuicoesAtivas(e) }}/7
                  </span>
                  <small>dias</small>
                </div>
              </td>
              <td>
                <span class="badge" :class="`badge--${store.estadoClasse(e.estado)}`">
                  {{ e.estado }}
                </span>
              </td>
              <td class="data-table__actions" @click.stop>
                <div class="actions-group">
                  <button
                    class="row-action"
                    title="Ver detalhes"
                    @click="store.abrirDetalhes(e)"
                  >
                    <q-icon name="visibility" size="17px" />
                  </button>

                  <button class="row-action" title="Editar" @click="editar(e)">
                    <q-icon name="edit" size="17px" />
                  </button>

                  <button
                    v-if="e.estado === 'Rascunho'"
                    class="row-action row-action--success"
                    title="Publicar"
                    @click="publicar(e)"
                  >
                    <q-icon name="check_circle" size="17px" />
                  </button>

                  <button
                    class="row-action row-action--danger"
                    title="Remover"
                    @click="pedirRemover(e)"
                  >
                    <q-icon name="delete" size="17px" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!store.paginados.length">
              <td colspan="7" class="data-table__empty">
                <q-icon name="event_busy" size="40px" class="data-table__empty-icon" />
                <p>Nenhuma escala encontrada com estes filtros.</p>
                <button
                  v-if="store.temFiltrosAtivos"
                  class="page-btn page-btn--outline"
                  @click="store.limparFiltros"
                >
                  Limpar filtros
                </button>
                <button
                  v-else
                  class="page-btn page-btn--primary"
                  @click="store.abrirNova"
                >
                  <q-icon name="add" size="16px" />
                  Criar primeira escala
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <footer v-if="store.filtrados.length > 0" class="pagination">
          <div class="pagination__info">
            A mostrar <b>{{ store.inicioPagina + 1 }}–{{ store.fimPagina }}</b>
            de <b>{{ store.filtrados.length }}</b>
            <span class="pagination__per">· {{ store.POR_PAGINA }} por página</span>
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
              Página <b>{{ store.pagina }}</b> / <b>{{ store.totalPaginas }}</b>
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

    <!-- MODAL DETALHES -->
    <q-dialog v-model="store.modalDetalhes">
      <q-card v-if="store.escalaSelecionada" class="modal-card modal-card--wide">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div class="modal-head__avatar">
              {{ store.iniciais(store.escalaSelecionada.agente) }}
            </div>
            <div>
              <div class="modal-head__title">{{ store.escalaSelecionada.agente }}</div>
              <div class="modal-head__sub">
                {{ store.escalaSelecionada.posto }} · {{ store.escalaSelecionada.semana }}
              </div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="store.modalDetalhes = false" />
        </q-card-section>

        <q-card-section class="modal-estado">
          <span
            class="badge badge--lg"
            :class="`badge--${store.estadoClasse(store.escalaSelecionada.estado)}`"
          >
            {{ store.escalaSelecionada.estado }}
          </span>
        </q-card-section>

        <q-card-section class="modal-grid">
          <div class="modal-field">
            <div class="modal-field__label">Nº de série</div>
            <div class="modal-field__value">{{ store.escalaSelecionada.nSerie }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Turno predominante</div>
            <div class="modal-field__value">
              {{ store.turnoPredominante(store.escalaSelecionada) }}
            </div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Dias activos</div>
            <div class="modal-field__value modal-field__value--big">
              {{ store.totalAtribuicoesAtivas(store.escalaSelecionada) }}/7
            </div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Criada em</div>
            <div class="modal-field__value">{{ store.escalaSelecionada.criadoEm }}</div>
          </div>

          <div class="modal-field modal-field--full">
            <div class="modal-field__label">Distribuição semanal</div>
            <div class="week-grid">
              <div
                v-for="dia in store.escalaSelecionada.atribuicoes"
                :key="dia.dia"
                class="week-grid__day"
                :class="{ 'week-grid__day--off': !dia.ativo }"
              >
                <div class="week-grid__label">{{ dia.dia }}</div>
                <div
                  class="week-grid__turno"
                  :class="dia.ativo ? `turno--${store.turnoClasse(dia.turno)}` : ''"
                >
                  {{ dia.ativo ? dia.turno : 'Folga' }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="store.escalaSelecionada.notas" class="modal-field modal-field--full">
            <div class="modal-field__label">Notas</div>
            <div class="modal-field__value modal-field__value--text">
              {{ store.escalaSelecionada.notas }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat label="Fechar" @click="store.modalDetalhes = false" />
          <div class="modal-actions__right">
            <q-btn
              unelevated
              color="primary"
              icon="edit"
              label="Editar"
              @click="editar(store.escalaSelecionada)"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL NOVO / EDITAR -->
    <q-dialog v-model="store.modalForm" persistent>
      <q-card class="modal-card modal-card--wide modal-card--steps">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div class="modal-head__icon modal-head__icon--primary">
              <q-icon name="event_note" size="24px" />
            </div>
            <div>
              <div class="modal-head__title">
                {{ store.modoEdicao ? 'Editar escala' : 'Nova escala' }}
              </div>
              <div class="modal-head__sub">Passo {{ passo }} de 2</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="fecharModalForm" />
        </q-card-section>

        <div class="steps">
          <div
            v-for="n in 2"
            :key="n"
            class="steps__item"
            :class="{
              'steps__item--done': n < passo,
              'steps__item--active': n === passo,
            }"
          >
            <div class="steps__dot">
              <q-icon v-if="n < passo" name="check" size="14px" />
              <span v-else>{{ n }}</span>
            </div>
            <div class="steps__label">
              {{ n === 1 ? 'Identificação' : 'Grelha Semanal' }}
            </div>
            <div v-if="n < 2" class="steps__line" />
          </div>
        </div>

        <q-card-section class="modal-body">
          <div v-if="passo === 1">
            <div class="form-grid">
              <label class="field field--full">
                <span class="field__label">Agente <em>*</em></span>
                <select v-model="store.form.agenteId" class="field__input">
                  <option value="">— Selecione o agente —</option>
                  <option v-for="a in store.AGENTES" :key="a.id" :value="a.id">
                    {{ a.nome }} — {{ a.nSerie }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span class="field__label">Posto <em>*</em></span>
                <select v-model="store.form.posto" class="field__input">
                  <option v-for="p in store.POSTOS" :key="p" :value="p">{{ p }}</option>
                </select>
              </label>

              <label class="field">
                <span class="field__label">Estado <em>*</em></span>
                <select v-model="store.form.estado" class="field__input">
                  <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
                </select>
              </label>

              <label class="field field--full">
                <span class="field__label">Semana <em>*</em></span>
                <input
                  v-model.trim="store.form.semana"
                  class="field__input"
                  placeholder="dd/mm — dd/mm aaaa"
                />
              </label>
            </div>
          </div>

          <div v-else>
            <p class="step-desc">
              Marque os dias activos e defina o turno para cada dia.
            </p>

            <div class="week-form">
              <div class="week-form__head">
                <span>Dia</span>
                <span>Activo</span>
                <span>Turno</span>
              </div>

              <div
                v-for="atr in store.form.atribuicoes"
                :key="atr.dia"
                class="week-form__row"
              >
                <span class="week-form__day">{{ atr.dia }}</span>

                <label class="week-form__check">
                  <input v-model="atr.ativo" type="checkbox" />
                  <span>{{ atr.ativo ? 'Sim' : 'Folga' }}</span>
                </label>

                <select
                  v-model="atr.turno"
                  class="week-form__select"
                  :disabled="!atr.ativo"
                >
                  <option v-for="t in store.TURNOS" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>

            <label class="field field--full" style="margin-top: 18px;">
              <span class="field__label">Notas</span>
              <textarea
                v-model.trim="store.form.notas"
                class="field__input"
                rows="2"
                placeholder="Notas internas (opcional)…"
              />
            </label>
          </div>

          <div v-if="store.erro" class="form-error">
            <q-icon name="error" size="18px" />
            {{ store.erro }}
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <template v-if="passo === 1">
            <q-btn flat label="Cancelar" @click="fecharModalForm" />
            <q-btn
              unelevated
              color="primary"
              label="Próximo"
              icon-right="arrow_forward"
              :disable="!store.formValido"
              @click="passo = 2"
            />
          </template>

          <template v-else>
            <q-btn flat label="Voltar" icon="arrow_back" @click="passo = 1" />

            <div class="modal-actions__right">
              <q-btn
                flat
                icon="save"
                label="Guardar rascunho"
                color="primary"
                :loading="store.aSalvar"
                :disable="!store.formValido"
                @click="salvarRascunho"
              />

              <q-btn
                unelevated
                color="primary"
                icon="check_circle"
                label="Confirmar e publicar"
                :loading="store.aSalvar"
                :disable="!store.formValido"
                @click="confirmarPublicar"
              />
            </div>
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import {
  useChefeEscalasStore,
  type Escala,
  type TurnoEscala,
} from '@/stores/chefe/chefe-EscalasStore'
import { escalasService } from '@/services/chefe/escalas.service'

const store = useChefeEscalasStore()
const $q = useQuasar()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Passo do modal
// ============================================================
const passo = ref<1 | 2>(1)

watch(
  () => store.modalForm,
  (aberto) => {
    if (aberto) passo.value = 1
  },
)

function fecharModalForm() {
  store.fecharForm()
  passo.value = 1
}

// ============================================================
// Alertas
// ============================================================
const alertas = computed(() => {
  const lista: {
    tipo: 'atencao' | 'critico'
    icon: string
    titulo: string
    descricao: string
  }[] = []

  if (store.kpis.rascunhos > 0) {
    lista.push({
      tipo: 'atencao',
      icon: 'edit_note',
      titulo: `${store.kpis.rascunhos} escala${store.kpis.rascunhos === 1 ? '' : 's'} em rascunho`,
      descricao: 'Publicar antes do início da semana',
    })
  }

  if (store.kpis.cobertura > 0 && store.kpis.cobertura < 70) {
    lista.push({
      tipo: 'critico',
      icon: 'warning',
      titulo: `Cobertura semanal em ${store.kpis.cobertura}%`,
      descricao: 'Considere reforçar a equipa em turnos em falta',
    })
  }

  return lista
})

// ============================================================
// Ícone do turno
// ============================================================
function iconeTurno(t: TurnoEscala): string {
  if (t === 'Manhã') return 'wb_sunny'
  if (t === 'Tarde') return 'wb_twilight'
  return 'nights_stay'
}

// ============================================================
// Filtros rápidos
// ============================================================
function filtrarPor(valor: 'total' | 'Publicada' | 'Rascunho') {
  store.limparFiltros()
  if (valor === 'total') return
  store.filtroEstado = valor
}

// ============================================================
// Mudar de semana
// ============================================================
function mudarSemana(dir: 'anterior' | 'seguinte') {
  const nova = dir === 'anterior' ? store.semanaAnterior() : store.semanaSeguinte()

  $q.notify({
    type: 'info',
    message: `Semana: ${nova}`,
    position: 'top',
  })
}

// ============================================================
// Ações
// ============================================================
function editar(e: Escala | null) {
  if (!e) return
  store.modalDetalhes = false
  store.abrirEditar(e)
  passo.value = 1
}

function publicar(e: Escala) {
  $q.dialog({
    title: 'Publicar escala',
    message: `Publicar escala de ${e.agente}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Publicar', color: 'positive' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.publicar(e.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Escala de ${e.agente} publicada`,
        position: 'top',
      })
    }
  })
}

function pedirRemover(e: Escala) {
  $q.dialog({
    title: 'Remover escala',
    message: `Remover permanentemente a escala de ${e.agente}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(e.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Escala removida`,
        position: 'top',
      })
    }
  })
}

// ============================================================
// Guardar rascunho
// ============================================================
async function salvarRascunho() {
  store.form.estado = 'Rascunho'

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
    type: 'info',
    message: store.modoEdicao
      ? 'Escala actualizada como rascunho'
      : 'Escala guardada como rascunho',
    position: 'top',
  })
  fecharModalForm()
}

// ============================================================
// Confirmar e publicar
// ============================================================
function confirmarPublicar() {
  const agenteNome = agenteSelecionadoNome()

  $q.dialog({
    title: 'Confirmar e publicar',
    message: `Confirmar e publicar a escala de ${agenteNome}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Confirmar', color: 'positive' },
    persistent: true,
  }).onOk(async () => {
    store.form.estado = 'Publicada'

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
      message: `Escala de ${agenteNome} publicada com sucesso`,
      position: 'top',
    })
    fecharModalForm()
  })
}

function agenteSelecionadoNome(): string {
  const a = store.AGENTES.find((x) => x.id === store.form.agenteId)
  return a?.nome ?? '—'
}

// ============================================================
// Exportar Excel (XLSX)
// ============================================================
async function exportarExcel() {
  try {
    const filtros: { estado?: string; posto?: string } = {}
    if (store.filtroEstado) filtros.estado = store.filtroEstado
    if (store.filtroPosto) filtros.posto = store.filtroPosto

    const blob = await escalasService.exportarXlsx(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `escalas-turno-${new Date().toISOString().slice(0, 10)}.xlsx`
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
// Exportar PDF
// ============================================================
async function exportarPDF() {
  try {
    const filtros: { estado?: string; posto?: string } = {}
    if (store.filtroEstado) filtros.estado = store.filtroEstado
    if (store.filtroPosto) filtros.posto = store.filtroPosto

    const blob = await escalasService.exportarPdf(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `escalas-turno-${new Date().toISOString().slice(0, 10)}.pdf`
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
.es-page {
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

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
}

.sk-kpi { @extend %sk-block; height: 80px; }

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
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  white-space: nowrap;

  &--compact { padding: 8px 14px; font-size: 13px; }

  &--primary {
    background: var(--sicam-primary-light);
    color: #fff;
    &:hover:not(:disabled) { background: var(--sicam-primary); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
    &:hover:not(:disabled) { background: var(--sicam-surface-hover); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}

/* ============================================================ */
/* Alertas                                                      */
/* ============================================================ */
.alertas { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }

.alerta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;

  &__icon { flex-shrink: 0; }
  &__body {
    flex: 1;
    min-width: 0;
    b     { display: block; font-size: 13px; font-weight: 700; }
    small { display: block; font-size: 12px; margin-top: 2px; opacity: 0.85; }
  }

  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
}

/* ============================================================ */
/* KPIs                                                         */
/* ============================================================ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;

  @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 0;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.1s, box-shadow 0.15s;

  &--static { cursor: default; }

  &:active:not(.kpi--static) { transform: scale(0.98); }
  &:hover  { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }

  &__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;

    &--primary  { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--info     { background: #dbeafe; color: #2563eb; }
  }

  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

/* ============================================================ */
/* Semana                                                       */
/* ============================================================ */
.week-bar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 10px;
  padding: 6px 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.week-btn {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sicam-muted);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--sicam-surface-hover);
    color: var(--sicam-ink);
  }
}

.week-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--sicam-ink);

  .q-icon { color: var(--sicam-primary); }
}

/* ============================================================ */
/* Filtros                                                      */
/* ============================================================ */
.filters { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }

.filter {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 10px;
  padding: 0 14px;
  height: 44px;
  font-family: inherit;

  &--search { flex: 1; min-width: 240px; }
  &__icon { color: var(--sicam-muted); margin-right: 8px; flex-shrink: 0; }

  &__input {
    flex: 1;
    border: 0;
    background: transparent;
    font-size: 14px;
    color: var(--sicam-ink);
    height: 100%;

    &:focus { outline: 0; }
    &::placeholder { color: var(--sicam-muted); }
  }

  &__select {
    border: 0;
    background: transparent;
    font-size: 14px;
    color: var(--sicam-ink);
    height: 100%;
    cursor: pointer;
    min-width: 150px;

    &:focus { outline: 0; }
  }
}

/* ============================================================ */
/* Tabela                                                       */
/* ============================================================ */
.table-wrap {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 16px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--sicam-line-soft);
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;

  thead { background: linear-gradient(180deg, #f8faf9 0%, #f1f4f2 100%); }

  th {
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: var(--sicam-ink-soft);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 12px 14px;
    white-space: nowrap;
    border-bottom: 1px solid var(--sicam-line);

    &:first-child { padding-left: 20px; }
    &:last-child  { padding-right: 20px; text-align: right; }
  }

  td {
    padding: 14px;
    font-size: 13.5px;
    color: var(--sicam-ink);
    border-bottom: 1px solid var(--sicam-line-soft);
    vertical-align: middle;
    transition: background 0.12s ease;
    white-space: nowrap;

    &:first-child { padding-left: 20px; }
    &:last-child  { padding-right: 20px; }
  }

  tbody tr:last-child td { border-bottom: 0; }
  tbody tr:nth-child(even) td { background: #fcfdfd; }

  &__row {
    cursor: pointer;
    &:hover td { background: #f0fdf9; }
    &:hover td:first-child { box-shadow: inset 3px 0 0 var(--sicam-primary-light); }
  }

  &__th-actions { text-align: right; width: 200px; }
  &__actions { text-align: right; white-space: nowrap; width: 200px; }

  &__empty {
    text-align: center;
    color: var(--sicam-muted);
    padding: 56px 24px !important;
    font-size: 14px;
    background: #fff !important;

    &-icon {
      color: var(--sicam-line-strong);
      margin-bottom: 12px;
      opacity: 0.7;
    }

    p { margin: 0 0 18px; font-size: 14px; color: var(--sicam-muted); }
  }
}

.cell-muted { color: var(--sicam-muted); font-size: 13px; }

.agente {
  display: flex;
  align-items: center;
  gap: 10px;

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  b {
    display: block;
    font-size: 13.5px;
    color: var(--sicam-ink);
    font-weight: 700;
  }

  small {
    display: block;
    font-size: 11px;
    color: var(--sicam-muted);
    margin-top: 1px;
  }
}

.cell-dias {
  display: flex;
  gap: 3px;

  &__dot {
    display: inline-grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: var(--sicam-line-soft);
    color: var(--sicam-muted);
    font-size: 10px;
    font-weight: 700;
    transition: all 0.15s;

    &--active {
      background: var(--sicam-primary-bg);
      color: var(--sicam-primary);
    }
  }
}

.cell-stats {
  &__num {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: var(--sicam-ink);
    font-variant-numeric: tabular-nums;
  }
  small {
    display: block;
    font-size: 11px;
    color: var(--sicam-muted);
    margin-top: 2px;
  }
}

/* ============================================================ */
/* Chip de turno                                                */
/* ============================================================ */
.turno {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid transparent;

  .q-icon { font-size: 13px; flex-shrink: 0; }

  &--manha { background: #fef3c7; color: #a16207; border-color: rgba(161, 98, 7, 0.15); }
  &--tarde { background: #fed7aa; color: #9a3412; border-color: rgba(154, 52, 18, 0.15); }
  &--noite { background: #e0e7ff; color: #3730a3; border-color: rgba(55, 48, 163, 0.15); }
}

/* ============================================================ */
/* Badge                                                        */
/* ============================================================ */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid transparent;

  &--lg { padding: 6px 14px; font-size: 13px; }

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6);
  }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); border-color: rgba(16, 185, 129, 0.18); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); border-color: rgba(245, 158, 11, 0.22); }
  &--info    { background: #dbeafe; color: #2563eb; border-color: rgba(59, 130, 246, 0.22); }
}

/* ============================================================ */
/* Acções                                                       */
/* ============================================================ */
.actions-group {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
}

.row-action {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--sicam-muted);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--sicam-surface-hover);
    border-color: var(--sicam-line);
    color: var(--sicam-ink);
  }

  &--success:hover {
    background: var(--sicam-success-bg);
    border-color: rgba(16, 185, 129, 0.3);
    color: var(--sicam-success-ink);
  }

  &--danger:hover {
    background: var(--sicam-critical-bg);
    border-color: rgba(239, 68, 68, 0.3);
    color: var(--sicam-critical-ink);
  }
}

/* ============================================================ */
/* Paginação                                                    */
/* ============================================================ */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  background: linear-gradient(180deg, #fafbfa 0%, #f6f8f7 100%);
  border-top: 1px solid var(--sicam-line);
  flex-wrap: wrap;

  &__info {
    font-size: 13px;
    color: var(--sicam-muted);
    b { color: var(--sicam-ink); font-weight: 700; }
  }

  &__per { color: var(--sicam-line-strong); margin-left: 6px; }
  &__controls { display: flex; align-items: center; gap: 10px; }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #fff;
    border: 1px solid var(--sicam-line);
    border-radius: 9px;
    padding: 7px 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--sicam-ink);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;

    &:hover:not(:disabled) {
      background: var(--sicam-surface-hover);
      border-color: var(--sicam-line-strong);
    }
    &:disabled { opacity: 0.35; cursor: not-allowed; }
  }

  &__page {
    font-size: 12px;
    color: var(--sicam-muted);
    font-weight: 600;
    padding: 6px 10px;
    background: #fff;
    border: 1px solid var(--sicam-line-soft);
    border-radius: 8px;
    white-space: nowrap;

    b { color: var(--sicam-ink); font-weight: 700; }
  }
}

/* ============================================================ */
/* Modal                                                        */
/* ============================================================ */
.modal-card {
  min-width: 520px;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &--wide { min-width: 700px; }

  @media (max-width: 800px) {
    min-width: 90vw;
    max-width: 95vw;
  }
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--sicam-line-soft);
  flex-shrink: 0;

  &__left { display: flex; align-items: center; gap: 12px; }

  &__avatar {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    display: grid; place-items: center;
    font-size: 15px; font-weight: 800;
    flex-shrink: 0;
  }

  &__icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: grid; place-items: center;
    flex-shrink: 0;

    &--primary { background: var(--sicam-primary-bg); color: var(--sicam-primary); }
  }

  &__title { font-size: 16px; font-weight: 700; color: var(--sicam-ink); }
  &__sub   { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

.modal-estado {
  display: flex;
  justify-content: center;
  padding: 12px 20px 0;
}

.modal-body {
  padding: 20px 22px !important;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
}

.modal-field {
  &--full { grid-column: 1 / -1; }

  &__label {
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    margin-bottom: 4px;
  }

  &__value {
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);

    &--big { font-size: 20px; font-weight: 700; color: var(--sicam-primary); }

    &--text {
      font-weight: 500;
      line-height: 1.6;
      background: var(--sicam-surface-alt);
      padding: 10px 14px;
      border-radius: 8px;
      white-space: pre-wrap;
    }
  }
}

.modal-actions {
  padding: 14px 20px !important;
  justify-content: space-between !important;
  gap: 10px;
  background: #fafbfa;
  border-top: 1px solid var(--sicam-line-soft);
  flex-shrink: 0;

  &__right { display: flex; gap: 10px; }
}

/* ============================================================ */
/* Steps                                                        */
/* ============================================================ */
.steps {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(180deg, #fafbfa 0%, #fff 100%);
  border-bottom: 1px solid var(--sicam-line-soft);
  flex-shrink: 0;
}

.steps__item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.steps__dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--sicam-line);
  color: var(--sicam-muted);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.steps__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--sicam-muted);
  white-space: nowrap;
  transition: color 0.2s;

  @media (max-width: 600px) { display: none; }
}

.steps__line {
  flex: 1;
  height: 2px;
  background: var(--sicam-line);
  margin: 0 10px;
  border-radius: 2px;
  transition: background 0.25s;
}

.steps__item--done {
  .steps__dot {
    background: var(--sicam-success);
    border-color: var(--sicam-success);
    color: #fff;
  }
  .steps__label { color: var(--sicam-success); }
  .steps__line  { background: var(--sicam-success); }
}

.steps__item--active {
  .steps__dot {
    background: var(--sicam-primary-light);
    border-color: var(--sicam-primary-light);
    color: #fff;
    transform: scale(1.1);
  }
  .steps__label { color: var(--sicam-primary); font-weight: 700; }
}

/* ============================================================ */
/* Grelha semanal (detalhes)                                    */
/* ============================================================ */
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;

  @media (max-width: 600px) { grid-template-columns: repeat(4, 1fr); }

  &__day {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 6px;
    border-radius: 8px;
    background: var(--sicam-surface-alt);
    border: 1px solid var(--sicam-line-soft);

    &--off {
      opacity: 0.5;
      background: #fafbfa;
    }
  }

  &__label {
    font-size: 10px;
    font-weight: 700;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__turno {
    font-size: 12px;
    font-weight: 700;
    padding: 3px 6px;
    border-radius: 6px;
    text-align: center;
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line-soft);

    &.turno--manha { background: #fef3c7; color: #a16207; border-color: transparent; }
    &.turno--tarde { background: #fed7aa; color: #9a3412; border-color: transparent; }
    &.turno--noite { background: #e0e7ff; color: #3730a3; border-color: transparent; }
  }
}

/* ============================================================ */
/* Formulário                                                   */
/* ============================================================ */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}

.step-desc {
  font-size: 13px;
  color: var(--sicam-muted);
  margin: 0 0 16px;
  line-height: 1.5;
}

.field {
  display: block;

  &--full { grid-column: 1 / -1; }

  &__label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;

    em { color: var(--sicam-critical); font-style: normal; font-weight: 700; }
  }

  &__input {
    display: block;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--sicam-line);
    border-radius: 10px;
    background: #fff;
    color: var(--sicam-ink);
    font-family: inherit;
    font-size: 14px;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:hover { border-color: var(--sicam-line-strong); }

    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }

    &::placeholder { color: var(--sicam-muted); opacity: 0.7; }
  }
}

/* ============================================================ */
/* Formulário semanal                                           */
/* ============================================================ */
.week-form {
  margin-top: 8px;
  border: 1px solid var(--sicam-line);
  border-radius: 12px;
  overflow: hidden;

  &__head {
    display: grid;
    grid-template-columns: 1fr 100px 140px;
    gap: 12px;
    padding: 10px 14px;
    background: var(--sicam-surface-alt);
    font-size: 11px;
    font-weight: 700;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--sicam-line);
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 100px 140px;
    gap: 12px;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);

    &:last-child { border-bottom: 0; }
  }

  &__day {
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink);
  }

  &__check {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--sicam-ink-soft);
    cursor: pointer;

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      accent-color: var(--sicam-primary);
      cursor: pointer;
    }
  }

  &__select {
    border: 1px solid var(--sicam-line);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 13px;
    font-family: inherit;
    color: var(--sicam-ink);
    background: #fff;
    cursor: pointer;

    &:disabled {
      background: var(--sicam-surface-alt);
      color: var(--sicam-muted);
      cursor: not-allowed;
    }

    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
    }
  }
}

/* ============================================================ */
/* Impressão                                                    */
/* ============================================================ */
@media print {
  .page-head__actions,
  .filters,
  .week-bar,
  .pagination,
  .actions-group,
  .page-btn,
  .ina-skeleton {
    display: none !important;
  }

  .es-page { padding: 0; max-width: 100%; }

  .table-wrap, .modal-card {
    box-shadow: none;
    border: 1px solid var(--sicam-line);
  }
}

@media (max-width: 700px) {
  .pagination {
    padding: 12px 14px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;

    &__controls { justify-content: space-between; }
    &__btn { flex: 1; justify-content: center; }
  }
}
</style>