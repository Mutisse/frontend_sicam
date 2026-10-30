<template>
  <q-page class="pt-page">
    <!-- CABEÇALHO -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Patrulhas</h1>
        <p class="page-head__sub">
          Planeamento e acompanhamento das patrulhas do posto
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
        <button class="page-btn page-btn--primary" @click="store.abrirNova">
          <q-icon name="add" size="18px" />
          Nova patrulha
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
        <div class="kpi__icon kpi__icon--info"><q-icon name="event" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ store.kpis.total }}</div>
          <div class="kpi__label">Total</div>
        </div>
      </button>

      <button class="kpi" @click="filtrarPor('Planeada')">
        <div class="kpi__icon kpi__icon--primary"><q-icon name="event" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ store.kpis.planeadas }}</div>
          <div class="kpi__label">Planeadas</div>
        </div>
      </button>

      <button class="kpi" @click="filtrarPor('Em curso')">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="play_circle" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ store.kpis.emCurso }}</div>
          <div class="kpi__label">Em curso</div>
        </div>
      </button>

      <button class="kpi" @click="filtrarPor('Concluída')">
        <div class="kpi__icon kpi__icon--success"><q-icon name="check_circle" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ store.kpis.concluidas }}</div>
          <div class="kpi__label">Concluídas</div>
        </div>
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
          placeholder="Pesquisar por código, agente, viatura, zona…"
        />
      </div>

      <select v-model="store.filtroEstado" class="filter filter__select">
        <option value="">Todos os estados</option>
        <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
      </select>

      <select v-model="store.filtroAgente" class="filter filter__select">
        <option value="">Todos os agentes</option>
        <option v-for="a in store.AGENTES" :key="a.id" :value="a.nome">{{ a.nome }}</option>
      </select>

      <select v-model="store.filtroPrioridade" class="filter filter__select">
        <option value="">Todas as prioridades</option>
        <option v-for="p in store.PRIORIDADES" :key="p" :value="p">{{ p }}</option>
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
            <th>Código</th>
            <th>Nome</th>
            <th>Data / Hora</th>
            <th>Agente</th>
            <th>Viatura</th>
            <th>Progresso</th>
            <th>Prioridade</th>
            <th>Estado</th>
            <th class="data-table__th-actions">Acções</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in store.paginados"
            :key="p.id"
            class="data-table__row"
            @click="store.abrirDetalhes(p)"
          >
            <td class="cell-codigo"><b>{{ p.codigo }}</b></td>
            <td>
              <div class="cell-nome">
                <b>{{ p.nome }}</b>
                <small>{{ p.zona }} · {{ p.turno }}</small>
              </div>
            </td>
            <td class="table-time">
              <div>{{ p.data }}</div>
              <small>{{ p.horaInicio }} — {{ p.horaFim }}</small>
            </td>
            <td>
              <div class="agente">
                <div class="agente__avatar">{{ store.iniciais(p.agente) }}</div>
                <span>{{ p.agente }}</span>
              </div>
            </td>
            <td>
              <span v-if="p.viatura !== '—'" class="viatura">
                <q-icon name="directions_car" size="14px" />
                {{ p.viatura }}
              </span>
              <span v-else class="viatura viatura--empty">—</span>
            </td>
            <td>
              <div class="progress">
                <div class="progress__bar">
                  <div
                    class="progress__fill"
                    :class="`progress__fill--${store.progressoClasse(p)}`"
                    :style="{ width: `${store.progressoPercent(p)}%` }"
                  />
                </div>
                <span class="progress__value">{{ p.pontosConcluidos }}/{{ p.pontosPrevistos }}</span>
              </div>
            </td>
            <td>
              <span class="badge" :class="`badge--${store.prioridadeClasse(p.prioridade)}`">
                {{ p.prioridade }}
              </span>
            </td>
            <td>
              <span class="badge" :class="`badge--${store.estadoClasse(p.estado)}`">
                {{ p.estado }}
              </span>
            </td>
            <td class="data-table__actions" @click.stop>
              <div class="actions-group">
                <button class="row-action" title="Ver detalhes" @click="store.abrirDetalhes(p)">
                  <q-icon name="visibility" size="17px" />
                </button>

                <button class="row-action" title="Editar" @click="editar(p)">
                  <q-icon name="edit" size="17px" />
                </button>

                <button
                  v-if="p.estado === 'Planeada'"
                  class="row-action row-action--success"
                  title="Iniciar patrulha"
                  @click="iniciar(p)"
                >
                  <q-icon name="play_arrow" size="17px" />
                </button>

                <button
                  v-if="p.estado === 'Em curso'"
                  class="row-action row-action--success"
                  title="Concluir patrulha"
                  @click="concluir(p)"
                >
                  <q-icon name="check_circle" size="17px" />
                </button>

                <button
                  v-if="p.estado !== 'Concluída' && p.estado !== 'Cancelada'"
                  class="row-action row-action--warning"
                  title="Cancelar patrulha"
                  @click="pedirCancelar(p)"
                >
                  <q-icon name="cancel" size="17px" />
                </button>

                <button
                  class="row-action row-action--danger"
                  title="Remover"
                  @click="pedirRemover(p)"
                >
                  <q-icon name="delete" size="17px" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!store.paginados.length">
            <td colspan="9" class="data-table__empty">
              <q-icon name="shield" size="40px" class="data-table__empty-icon" />
              <p>Nenhuma patrulha encontrada com estes filtros.</p>
              <button
                v-if="store.temFiltrosAtivos"
                class="page-btn page-btn--outline"
                @click="store.limparFiltros"
              >
                Limpar filtros
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação -->
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

    <!-- ============================================================ -->
    <!-- MODAL — DETALHES                                              -->
    <!-- ============================================================ -->
    <q-dialog v-model="store.modalDetalhes">
      <q-card v-if="store.patrulhaSelecionada" class="modal-card">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div class="modal-head__icon" :class="`modal-head__icon--${store.estadoClasse(store.patrulhaSelecionada.estado)}`">
              <q-icon name="shield" size="22px" />
            </div>
            <div>
              <div class="modal-head__title">{{ store.patrulhaSelecionada.nome }}</div>
              <div class="modal-head__sub">
                {{ store.patrulhaSelecionada.codigo }} · {{ store.patrulhaSelecionada.data }}
              </div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="store.modalDetalhes = false" />
        </q-card-section>

        <q-card-section class="modal-estado">
          <span class="badge badge--lg" :class="`badge--${store.estadoClasse(store.patrulhaSelecionada.estado)}`">
            {{ store.patrulhaSelecionada.estado }}
          </span>
          <span class="badge badge--lg" :class="`badge--${store.prioridadeClasse(store.patrulhaSelecionada.prioridade)}`">
            {{ store.patrulhaSelecionada.prioridade }}
          </span>
        </q-card-section>

        <q-card-section class="modal-grid">
          <div class="modal-field">
            <div class="modal-field__label">Agente</div>
            <div class="modal-field__value">{{ store.patrulhaSelecionada.agente }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Viatura</div>
            <div class="modal-field__value">{{ store.patrulhaSelecionada.viatura }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Zona</div>
            <div class="modal-field__value">{{ store.patrulhaSelecionada.zona }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Turno</div>
            <div class="modal-field__value">{{ store.patrulhaSelecionada.turno }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Início</div>
            <div class="modal-field__value">{{ store.patrulhaSelecionada.horaInicio }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Fim</div>
            <div class="modal-field__value">{{ store.patrulhaSelecionada.horaFim }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Progresso</div>
            <div class="modal-field__value modal-field__value--big">
              {{ store.patrulhaSelecionada.pontosConcluidos }}/{{ store.patrulhaSelecionada.pontosPrevistos }}
            </div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Criado em</div>
            <div class="modal-field__value">{{ store.patrulhaSelecionada.criadoEm }}</div>
          </div>

          <div v-if="store.patrulhaSelecionada.notas" class="modal-field modal-field--full">
            <div class="modal-field__label">Notas</div>
            <div class="modal-field__value modal-field__value--text">
              {{ store.patrulhaSelecionada.notas }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat label="Fechar" @click="store.modalDetalhes = false" />
          <div class="modal-actions__right">
            <q-btn
              v-if="store.patrulhaSelecionada.estado === 'Planeada'"
              unelevated
              color="primary"
              icon="play_arrow"
              label="Iniciar"
              @click="iniciar(store.patrulhaSelecionada); store.modalDetalhes = false"
            />
            <q-btn
              v-if="store.patrulhaSelecionada.estado === 'Em curso'"
              unelevated
              color="positive"
              icon="check_circle"
              label="Concluir"
              @click="concluir(store.patrulhaSelecionada); store.modalDetalhes = false"
            />
            <q-btn
              flat
              color="primary"
              icon="edit"
              label="Editar"
              @click="editar(store.patrulhaSelecionada)"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============================================================ -->
    <!-- MODAL — NOVA / EDITAR PATRULHA (2 PASSOS)                     -->
    <!-- ============================================================ -->
    <q-dialog v-model="store.modalForm" persistent>
      <q-card class="modal-card modal-card--wide modal-card--steps">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div class="modal-head__icon modal-head__icon--primary">
              <q-icon name="shield" size="24px" />
            </div>
            <div>
              <div class="modal-head__title">
                {{ store.modoEdicao ? 'Editar patrulha' : 'Nova patrulha' }}
              </div>
              <div class="modal-head__sub">Passo {{ store.passo }} de 2</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="store.fecharForm" />
        </q-card-section>

        <!-- Barra de progresso -->
        <div class="steps">
          <div
            v-for="n in 2"
            :key="n"
            class="steps__item"
            :class="{
              'steps__item--done': n < store.passo,
              'steps__item--active': n === store.passo,
            }"
          >
            <div class="steps__dot">
              <q-icon v-if="n < store.passo" name="check" size="14px" />
              <span v-else>{{ n }}</span>
            </div>
            <div class="steps__label">
              {{ n === 1 ? 'Identificação' : 'Turno & Pontos' }}
            </div>
            <div v-if="n < 2" class="steps__line" />
          </div>
        </div>

        <q-card-section class="modal-body">
          <!-- PASSO 1 -->
          <div v-if="store.passo === 1" class="form-grid">
            <label class="field field--full">
              <span class="field__label">Nome da patrulha <em>*</em></span>
              <input
                v-model.trim="store.form.nome"
                class="field__input"
                placeholder="Ex.: Patrulha Baixa manhã"
              />
            </label>

            <label class="field">
              <span class="field__label">Data <em>*</em></span>
              <input
                v-model.trim="store.form.data"
                class="field__input"
                placeholder="dd/mm/aaaa"
              />
            </label>

            <label class="field">
              <span class="field__label">Zona <em>*</em></span>
              <select v-model="store.form.zona" class="field__input">
                <option v-for="z in store.ZONAS" :key="z" :value="z">{{ z }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Agente <em>*</em></span>
              <select v-model="store.form.agenteId" class="field__input">
                <option v-for="a in store.AGENTES" :key="a.id" :value="a.id">
                  {{ a.nome }} — {{ a.nSerie }}
                </option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Viatura</span>
              <select v-model="store.form.viatura" class="field__input">
                <option v-for="v in store.VIATURAS" :key="v" :value="v">{{ v }}</option>
              </select>
            </label>
          </div>

          <!-- PASSO 2 -->
          <div v-else class="form-grid">
            <label class="field">
              <span class="field__label">Turno <em>*</em></span>
              <select v-model="store.form.turno" class="field__input">
                <option v-for="t in store.TURNOS" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Prioridade <em>*</em></span>
              <select v-model="store.form.prioridade" class="field__input">
                <option v-for="p in store.PRIORIDADES" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Hora de início <em>*</em></span>
              <input
                v-model.trim="store.form.horaInicio"
                class="field__input"
                placeholder="08:00"
              />
            </label>

            <label class="field">
              <span class="field__label">Hora de fim <em>*</em></span>
              <input
                v-model.trim="store.form.horaFim"
                class="field__input"
                placeholder="12:00"
              />
            </label>

            <label class="field">
              <span class="field__label">Pontos previstos <em>*</em></span>
              <input
                v-model.number="store.form.pontosPrevistos"
                type="number"
                min="1"
                class="field__input"
                placeholder="10"
              />
            </label>

            <label class="field">
              <span class="field__label">Estado</span>
              <select v-model="store.form.estado" class="field__input">
                <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
              </select>
            </label>

            <label class="field field--full">
              <span class="field__label">Notas</span>
              <textarea
                v-model.trim="store.form.notas"
                class="field__input"
                rows="2"
                placeholder="Notas internas (opcional)…"
              />
            </label>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <template v-if="store.passo === 1">
            <q-btn flat label="Cancelar" @click="store.fecharForm" />
            <q-btn
              unelevated
              color="primary"
              label="Próximo"
              icon-right="arrow_forward"
              :disable="!store.passo1Valido"
              @click="store.proximoPasso"
            />
          </template>

          <template v-else>
            <q-btn flat label="Voltar" icon="arrow_back" @click="store.passoAnterior" />
            <q-btn
              unelevated
              color="primary"
              icon="save"
              :label="store.modoEdicao ? 'Guardar' : 'Criar patrulha'"
              :loading="store.aSalvar"
              :disable="!store.formValido"
              @click="salvar"
            />
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import {
  useChefePatrulhasStore,
  type Patrulha,
} from '@/stores/chefe/chefe-PatrulhasStore'

const store = useChefePatrulhasStore()
const $q = useQuasar()

// ============================================================
// Alertas
// ============================================================
const alertas = computed(() => {
  const lista: { tipo: 'atencao' | 'critico'; icon: string; titulo: string; descricao: string }[] = []

  if (store.kpis.emCurso > 0) {
    lista.push({
      tipo: 'atencao',
      icon: 'play_circle',
      titulo: `${store.kpis.emCurso} patrulha${store.kpis.emCurso === 1 ? '' : 's'} em curso`,
      descricao: 'Acompanhe em tempo real',
    })
  }

  if (store.kpis.planeadas > 0) {
    lista.push({
      tipo: 'atencao',
      icon: 'event',
      titulo: `${store.kpis.planeadas} patrulha${store.kpis.planeadas === 1 ? '' : 's'} planeada${store.kpis.planeadas === 1 ? '' : 's'}`,
      descricao: 'Confirmar atribuições antes do início',
    })
  }

  return lista
})

// ============================================================
// Filtros rápidos
// ============================================================
function filtrarPor(valor: 'total' | 'Planeada' | 'Em curso' | 'Concluída') {
  store.limparFiltros()
  if (valor === 'total') return
  store.filtroEstado = valor
}

// ============================================================
// Ações
// ============================================================
function editar(p: Patrulha | null) {
  if (!p) return
  store.modalDetalhes = false
  store.abrirEditar(p)
}

function iniciar(p: Patrulha) {
  $q.dialog({
    title: 'Iniciar patrulha',
    message: `Iniciar a patrulha "${p.nome}"?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Iniciar', color: 'positive' },
    persistent: true,
  }).onOk(() => {
    store.iniciar(p.id)
    $q.notify({
      type: 'positive',
      message: `Patrulha "${p.nome}" iniciada`,
      position: 'top',
    })
  })
}

function concluir(p: Patrulha) {
  $q.dialog({
    title: 'Concluir patrulha',
    message: `Marcar a patrulha "${p.nome}" como concluída?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Concluir', color: 'positive' },
    persistent: true,
  }).onOk(() => {
    store.concluir(p.id)
    $q.notify({
      type: 'positive',
      message: `Patrulha "${p.nome}" concluída`,
      position: 'top',
    })
  })
}

function pedirCancelar(p: Patrulha) {
  $q.dialog({
    title: 'Cancelar patrulha',
    message: `Cancelar a patrulha "${p.nome}"?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Cancelar patrulha', color: 'warning' },
    persistent: true,
  }).onOk(() => {
    store.cancelar(p.id)
    $q.notify({
      type: 'warning',
      message: `Patrulha "${p.nome}" cancelada`,
      position: 'top',
    })
  })
}

function pedirRemover(p: Patrulha) {
  $q.dialog({
    title: 'Remover patrulha',
    message: `Remover permanentemente a patrulha "${p.nome}"?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(() => {
    store.remover(p.id)
    $q.notify({
      type: 'positive',
      message: `Patrulha "${p.nome}" removida`,
      position: 'top',
    })
  })
}

function salvar() {
  const ok = store.salvarForm()
  if (!ok) return

  $q.notify({
    type: 'positive',
    message: store.modoEdicao
      ? 'Patrulha actualizada'
      : 'Patrulha criada com sucesso',
    position: 'top',
  })
  store.fecharForm()
}

// ============================================================
// Exportar CSV
// ============================================================
function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — CHEFE DE POSTO — Patrulhas'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['Código', 'Nome', 'Data', 'Início', 'Fim', 'Turno', 'Agente', 'Viatura', 'Zona', 'Progresso', 'Prioridade', 'Estado'],
    ...store.filtrados.map((p) => [
      p.codigo, p.nome, p.data, p.horaInicio, p.horaFim, p.turno,
      p.agente, p.viatura, p.zona,
      `${p.pontosConcluidos}/${p.pontosPrevistos}`,
      p.prioridade, p.estado,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `chefe-patrulhas-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.pt-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

// ============================================================
// Cabeçalho
// ============================================================
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
    &:hover { background: var(--sicam-surface-hover); }
  }
}

// ============================================================
// Alertas
// ============================================================
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

// ============================================================
// KPIs
// ============================================================
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

  &:active { transform: scale(0.98); }
  &:hover  { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }

  &__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;

    &--primary  { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--info     { background: #dbeafe; color: #2563eb; }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

// ============================================================
// Filtros
// ============================================================
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

// ============================================================
// Tabela
// ============================================================
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

  &__th-actions { text-align: right; width: 220px; }
  &__actions { text-align: right; white-space: nowrap; width: 220px; }

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

.table-time {
  color: var(--sicam-muted);
  font-size: 13px;

  small { display: block; font-size: 11px; color: var(--sicam-line-strong); margin-top: 2px; }
}

.cell-codigo {
  b {
    display: inline-block;
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--sicam-ink);
    background: #f6f8f7;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid var(--sicam-line-soft);
    white-space: nowrap;
  }
}

.cell-nome {
  b {
    display: block;
    font-size: 13.5px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1.3;
    white-space: nowrap;
  }
  small {
    display: block;
    font-size: 11px;
    color: var(--sicam-muted);
    margin-top: 2px;
    white-space: nowrap;
  }
}

.agente {
  display: flex;
  align-items: center;
  gap: 8px;

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }

  span {
    font-size: 13px;
    color: var(--sicam-ink-soft);
    white-space: nowrap;
  }
}

.viatura {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--sicam-ink-soft);
  font-size: 13px;
  font-weight: 600;

  .q-icon { color: var(--sicam-muted); }

  &--empty { color: var(--sicam-muted); }
}

.progress {
  display: flex;
  align-items: center;
  gap: 10px;

  &__bar {
    width: 70px;
    height: 6px;
    background: var(--sicam-line-soft);
    border-radius: 99px;
    overflow: hidden;
    flex-shrink: 0;
  }

  &__fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.4s ease;

    &--regular { background: var(--sicam-success); }
    &--atencao { background: var(--sicam-warning); }
    &--critico { background: var(--sicam-critical); }
  }

  &__value {
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink);
    letter-spacing: 0.02em;
  }
}

// ============================================================
// Badge
// ============================================================
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
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); border-color: rgba(239, 68, 68, 0.22); }
  &--neutral { background: #dbeafe; color: #2563eb; border-color: rgba(59, 130, 246, 0.22); }
}

// ============================================================
// Acções
// ============================================================
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

  &--warning:hover {
    background: var(--sicam-warning-bg);
    border-color: rgba(245, 158, 11, 0.3);
    color: var(--sicam-warning-ink);
  }

  &--danger:hover {
    background: var(--sicam-critical-bg);
    border-color: rgba(239, 68, 68, 0.3);
    color: var(--sicam-critical-ink);
  }
}

// ============================================================
// Paginação
// ============================================================
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

// ============================================================
// Modal
// ============================================================
.modal-card {
  min-width: 520px;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &--wide { min-width: 700px; }
  @media (max-width: 800px) { min-width: 90vw; }
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

  &__icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: grid; place-items: center;
    flex-shrink: 0;

    &--regular { background: var(--sicam-success-bg); color: var(--sicam-success-ink); }
    &--atencao { background: var(--sicam-warning-bg); color: var(--sicam-warning-ink); }
    &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--neutral { background: #dbeafe; color: #2563eb; }
    &--primary { background: var(--sicam-primary-bg); color: var(--sicam-primary); }
  }

  &__title { font-size: 16px; font-weight: 700; color: var(--sicam-ink); }
  &__sub   { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

.modal-estado {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 12px 20px 0;
  flex-wrap: wrap;
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

// ============================================================
// Steps (barra de progresso)
// ============================================================
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

// ============================================================
// Formulário
// ============================================================
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
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

// ============================================================
// Responsivo
// ============================================================
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