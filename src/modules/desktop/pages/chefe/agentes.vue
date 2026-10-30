<template>
  <q-page class="ag-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
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

    <!-- ============================================================ -->
    <!-- CONTEÚDO REAL                                                 -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Agentes</h1>
          <p class="page-head__sub">
            Gestão dos agentes sob a sua supervisão
          </p>
        </div>

        <div class="page-head__actions">
          <button class="page-btn page-btn--outline" @click="exportarCSV">
            <q-icon name="file_download" size="18px" />
            Excel
          </button>
          <button class="page-btn page-btn--primary" @click="store.abrirNovo">
            <q-icon name="person_add" size="18px" />
            Novo agente
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
            <q-icon name="people" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Total</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Online')">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="wifi_tethering" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.online }}</div>
            <div class="kpi__label">Online</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Em patrulha')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="directions_car" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.emPatrulha }}</div>
            <div class="kpi__label">Em patrulha</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Offline')">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="cloud_off" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.offline }}</div>
            <div class="kpi__label">Offline</div>
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
            placeholder="Pesquisar por nome, nº série, e-mail…"
          />
        </div>

        <select v-model="store.filtroEstado" class="filter filter__select">
          <option value="">Todos os estados</option>
          <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
        </select>

        <select v-model="store.filtroTurno" class="filter filter__select">
          <option value="">Todos os turnos</option>
          <option v-for="t in store.TURNOS" :key="t" :value="t">{{ t }}</option>
        </select>

        <select v-model="store.filtroPosto" class="filter filter__select">
          <option value="">Todos os postos</option>
          <option v-for="p in store.POSTOS" :key="p" :value="p">{{ p }}</option>
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
              <th>Nº Série</th>
              <th>Turno</th>
              <th>Viatura</th>
              <th>Estado</th>
              <th>Última sinc.</th>
              <th>Consultas</th>
              <th class="data-table__th-actions">Acções</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="a in store.paginados"
              :key="a.id"
              class="data-table__row"
              @click="store.abrirDetalhes(a)"
            >
              <td>
                <div class="agente">
                  <div class="agente__avatar">{{ store.iniciais(a.nome) }}</div>
                  <div>
                    <b>{{ a.nome }}</b>
                    <small>{{ a.email }}</small>
                  </div>
                </div>
              </td>
              <td class="table-serie">
                <span class="cell-codigo"><b>{{ a.nSerie }}</b></span>
              </td>
              <td class="table-turno">{{ a.turno }}</td>
              <td>
                <span class="viatura">
                  <q-icon name="directions_car" size="14px" />
                  {{ a.viatura }}
                </span>
              </td>
              <td>
                <span class="badge" :class="`badge--${store.estadoClasse(a.estado)}`">
                  {{ a.estado }}
                </span>
              </td>
              <td class="table-time">{{ a.ultimaSinc }}</td>
              <td>
                <div class="consultas">
                  <b>{{ a.consultasHoje }}</b>
                  <small>hoje</small>
                </div>
              </td>
              <td class="data-table__actions" @click.stop>
                <div class="actions-group">
                  <button
                    class="row-action"
                    title="Ver detalhes"
                    @click="store.abrirDetalhes(a)"
                  >
                    <q-icon name="visibility" size="17px" />
                  </button>

                  <button class="row-action" title="Editar" @click="editar(a)">
                    <q-icon name="edit" size="17px" />
                  </button>

                  <button
                    v-if="a.estado === 'Offline' || a.estado === 'Inactivo'"
                    class="row-action row-action--success"
                    title="Activar"
                    @click="activar(a)"
                  >
                    <q-icon name="play_arrow" size="17px" />
                  </button>

                  <button
                    v-if="a.estado === 'Online'"
                    class="row-action row-action--warning"
                    title="Desactivar"
                    @click="desactivar(a)"
                  >
                    <q-icon name="pause" size="17px" />
                  </button>

                  <button
                    class="row-action row-action--danger"
                    title="Remover"
                    @click="pedirRemover(a)"
                  >
                    <q-icon name="delete" size="17px" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!store.paginados.length">
              <td colspan="8" class="data-table__empty">
                <q-icon name="person_off" size="40px" class="data-table__empty-icon" />
                <p>Nenhum agente encontrado com estes filtros.</p>
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

    <!-- ============================================================ -->
    <!-- MODAL — DETALHES                                              -->
    <!-- ============================================================ -->
    <q-dialog v-model="store.modalDetalhes">
      <q-card v-if="store.agenteSelecionado" class="modal-card">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div class="modal-head__avatar">
              {{ store.iniciais(store.agenteSelecionado.nome) }}
            </div>
            <div>
              <div class="modal-head__title">{{ store.agenteSelecionado.nome }}</div>
              <div class="modal-head__sub">{{ store.agenteSelecionado.nSerie }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="store.modalDetalhes = false" />
        </q-card-section>

        <q-card-section class="modal-estado">
          <span
            class="badge badge--lg"
            :class="`badge--${store.estadoClasse(store.agenteSelecionado.estado)}`"
          >
            {{ store.agenteSelecionado.estado }}
          </span>
        </q-card-section>

        <q-card-section class="modal-grid">
          <div class="modal-field">
            <div class="modal-field__label">E-mail</div>
            <div class="modal-field__value">{{ store.agenteSelecionado.email }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Telefone</div>
            <div class="modal-field__value">{{ store.agenteSelecionado.telefone }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Turno</div>
            <div class="modal-field__value">{{ store.agenteSelecionado.turno }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Viatura</div>
            <div class="modal-field__value">{{ store.agenteSelecionado.viatura }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Posto</div>
            <div class="modal-field__value">{{ store.agenteSelecionado.posto }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Última sincronização</div>
            <div class="modal-field__value">{{ store.agenteSelecionado.ultimaSinc }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Consultas hoje</div>
            <div class="modal-field__value modal-field__value--big">
              {{ store.agenteSelecionado.consultasHoje }}
            </div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Multas emitidas</div>
            <div class="modal-field__value">{{ store.agenteSelecionado.multasEmitidas }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Admissão</div>
            <div class="modal-field__value">{{ store.agenteSelecionado.admissao }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Criado em</div>
            <div class="modal-field__value">{{ store.agenteSelecionado.criadoEm }}</div>
          </div>
          <div
            v-if="store.agenteSelecionado.observacoes"
            class="modal-field modal-field--full"
          >
            <div class="modal-field__label">Observações</div>
            <div class="modal-field__value modal-field__value--text">
              {{ store.agenteSelecionado.observacoes }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat label="Fechar" @click="store.modalDetalhes = false" />
          <q-btn
            unelevated
            color="primary"
            icon="edit"
            label="Editar"
            @click="editar(store.agenteSelecionado)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============================================================ -->
    <!-- MODAL — NOVO / EDITAR AGENTE                                  -->
    <!-- ============================================================ -->
    <q-dialog v-model="store.modalForm" persistent>
      <q-card class="modal-card modal-card--wide">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div class="modal-head__icon modal-head__icon--primary">
              <q-icon name="person_add" size="24px" />
            </div>
            <div>
              <div class="modal-head__title">
                {{ store.modoEdicao ? 'Editar agente' : 'Novo agente' }}
              </div>
              <div class="modal-head__sub">Preencha os dados</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="store.fecharForm" />
        </q-card-section>

        <q-card-section class="modal-body">
          <div class="form-grid">
            <label class="field field--full">
              <span class="field__label">Nome completo <em>*</em></span>
              <input
                v-model.trim="store.form.nome"
                class="field__input"
                placeholder="Ex.: Agente Chissano"
              />
            </label>

            <label class="field">
              <span class="field__label">E-mail <em>*</em></span>
              <input
                v-model.trim="store.form.email"
                type="email"
                class="field__input"
                placeholder="nome@sicam.gov.mz"
              />
            </label>

            <label class="field">
              <span class="field__label">Telefone</span>
              <input
                v-model.trim="store.form.telefone"
                class="field__input"
                placeholder="+258 84 000 0000"
              />
            </label>

            <label class="field">
              <span class="field__label">Nº de série <em>*</em></span>
              <input
                v-model.trim="store.form.nSerie"
                class="field__input"
                placeholder="PRM-AT-0001"
              />
            </label>

            <label class="field">
              <span class="field__label">Turno</span>
              <select v-model="store.form.turno" class="field__input">
                <option v-for="t in store.TURNOS" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Viatura</span>
              <select v-model="store.form.viatura" class="field__input">
                <option v-for="v in store.VIATURAS" :key="v" :value="v">{{ v }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Posto</span>
              <select v-model="store.form.posto" class="field__input">
                <option v-for="p in store.POSTOS" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Estado</span>
              <select v-model="store.form.estado" class="field__input">
                <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
              </select>
            </label>

            <label class="field field--full">
              <span class="field__label">Observações</span>
              <textarea
                v-model.trim="store.form.observacoes"
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
          <q-btn flat label="Cancelar" @click="store.fecharForm" />
          <q-btn
            unelevated
            color="primary"
            :icon="store.modoEdicao ? 'save' : 'person_add'"
            :label="store.modoEdicao ? 'Guardar' : 'Criar agente'"
            :loading="store.aSalvar"
            :disable="!store.formValido"
            @click="salvar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  useChefeAgentesStore,
  type Agente,
} from '@/stores/chefe/chefe-AgentesStore'

const store = useChefeAgentesStore()
const $q = useQuasar()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

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

  if (store.kpis.offline > 0) {
    lista.push({
      tipo: 'atencao',
      icon: 'cloud_off',
      titulo: `${store.kpis.offline} agente${store.kpis.offline === 1 ? '' : 's'} offline`,
      descricao: 'Verificar ligação e última sincronização',
    })
  }

  if (store.kpis.emPatrulha > 0) {
    lista.push({
      tipo: 'critico',
      icon: 'directions_car',
      titulo: `${store.kpis.emPatrulha} agente${store.kpis.emPatrulha === 1 ? '' : 's'} em patrulha`,
      descricao: 'Acompanhar operação em tempo real',
    })
  }

  return lista
})

// ============================================================
// Filtros rápidos
// ============================================================
function filtrarPor(valor: 'total' | 'Online' | 'Em patrulha' | 'Offline') {
  store.limparFiltros()
  if (valor === 'total') return
  store.filtroEstado = valor
}

// ============================================================
// Ações
// ============================================================
function editar(a: Agente | null) {
  if (!a) return
  store.modalDetalhes = false
  store.abrirEditar(a)
}

function activar(a: Agente) {
  $q.dialog({
    title: 'Activar agente',
    message: `Activar ${a.nome}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Activar', color: 'positive' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.activar(a.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `${a.nome} activado`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({
        type: 'negative',
        message: store.erro,
        position: 'top',
      })
    }
  })
}

function desactivar(a: Agente) {
  $q.dialog({
    title: 'Desactivar agente',
    message: `Desactivar ${a.nome}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Desactivar', color: 'warning' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.desactivar(a.id)
    if (ok) {
      $q.notify({
        type: 'warning',
        message: `${a.nome} desactivado`,
        position: 'top',
      })
    }
  })
}

function pedirRemover(a: Agente) {
  $q.dialog({
    title: 'Remover agente',
    message: `Remover permanentemente ${a.nome} (${a.nSerie})?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(a.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `${a.nome} removido`,
        position: 'top',
      })
    }
  })
}

async function salvar() {
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
      ? `Agente ${store.form.nome} actualizado`
      : `Agente ${store.form.nome} criado`,
    position: 'top',
  })
  store.fecharForm()
}

// ============================================================
// Exportar CSV
// ============================================================
function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — CHEFE DE POSTO — Agentes'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    [
      'Nome', 'E-mail', 'Telefone', 'Nº Série', 'Turno', 'Viatura',
      'Posto', 'Estado', 'Última sinc.', 'Consultas hoje',
      'Multas emitidas', 'Admissão',
    ],
    ...store.filtrados.map((a) => [
      a.nome, a.email, a.telefone, a.nSerie, a.turno, a.viatura, a.posto,
      a.estado, a.ultimaSinc, String(a.consultasHoje),
      String(a.multasEmitidas), a.admissao,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `chefe-agentes-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.ag-page {
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
    &:hover { background: var(--sicam-surface-hover); }
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

  &:active { transform: scale(0.98); }
  &:hover  { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }

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

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }
.table-turno { color: var(--sicam-ink-soft); font-size: 13px; font-weight: 600; }
.table-serie { color: var(--sicam-ink-soft); }

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
    letter-spacing: 0.02em;
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

.viatura {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--sicam-ink-soft);
  font-size: 13px;
  font-weight: 600;

  .q-icon { color: var(--sicam-muted); }
}

.consultas {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  b {
    font-size: 16px;
    font-weight: 700;
    color: var(--sicam-primary);
    line-height: 1;
  }

  small {
    font-size: 10px;
    color: var(--sicam-muted);
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
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
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); border-color: rgba(239, 68, 68, 0.22); }
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
  border-radius: 16px;
  overflow: hidden;

  &--wide { min-width: 680px; }
  @media (max-width: 750px) { min-width: 90vw; }
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--sicam-line-soft);

  &__left { display: flex; align-items: center; gap: 12px; }

  &__avatar {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    display: grid; place-items: center;
    font-size: 15px; font-weight: 800;
    letter-spacing: 0.02em;
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

.modal-body { padding: 20px 22px !important; }

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
  padding: 12px 20px 20px !important;
  justify-content: space-between !important;
  gap: 10px;
}

/* ============================================================ */
/* Formulário                                                   */
/* ============================================================ */
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

/* ============================================================ */
/* Responsivo                                                   */
/* ============================================================ */
@media (max-width: 1000px) {
  .data-table {
    th, td {
      padding: 10px;
      &:first-child { padding-left: 14px; }
      &:last-child  { padding-right: 14px; }
    }
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