<template>
  <q-page class="disp-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="disp-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-kpis">
        <div v-for="i in 4" :key="`sk-kpi-${i}`" class="sk-kpi" />
      </div>
      <div class="sk-filters">
        <div class="sk-search" />
        <div class="sk-select" />
      </div>
      <div class="sk-table">
        <div v-for="i in 6" :key="`sk-row-${i}`" class="sk-row" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Dispositivos</h1>
          <p class="page-head__sub">Terminais móveis atribuídos aos agentes</p>
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

          <button class="page-btn page-btn--primary" @click="abrirRegistar">
            <q-icon name="add" size="18px" />
            Registar dispositivo
          </button>
        </div>
      </header>

      <!-- ERRO -->
      <div v-if="store.erro" class="disp-erro">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- KPIs clicáveis (filtram) -->
      <section class="kpi-grid">
        <button
          class="kpi kpi--clicavel"
          :class="{ 'kpi--activo': store.filtroEstado === '' }"
          @click="store.filtroEstado = ''"
        >
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="devices" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Total</div>
          </div>
        </button>

        <button
          class="kpi kpi--clicavel"
          :class="{ 'kpi--activo': store.filtroEstado === 'Ativo' }"
          @click="store.filtroEstado = 'Ativo'"
        >
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="wifi" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.totalActivos }}</div>
            <div class="kpi__label">Activos</div>
          </div>
        </button>

        <button
          class="kpi kpi--clicavel"
          :class="{ 'kpi--activo': store.filtroEstado === 'Por registar' }"
          @click="store.filtroEstado = 'Por registar'"
        >
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="pending" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.totalPorRegistar }}</div>
            <div class="kpi__label">Por registar</div>
          </div>
        </button>

        <button
          class="kpi kpi--clicavel"
          :class="{ 'kpi--activo': store.filtroEstado === 'Desatualizados' }"
          @click="store.filtroEstado = 'Desatualizados'"
        >
          <div class="kpi__icon kpi__icon--info">
            <q-icon name="system_update_alt" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.totalDesatualizados }}</div>
            <div class="kpi__label">Desatualizados</div>
          </div>
        </button>
      </section>

      <!-- FILTROS -->
      <section class="filters">
        <label class="filter filter--search">
          <q-icon name="search" size="20px" class="filter__icon" />
          <input
            v-model="store.pesquisa"
            type="text"
            class="filter__input"
            placeholder="Pesquisar por nº de série, agente ou modelo…"
          />
          <button
            v-if="store.pesquisa"
            class="filter__clear"
            aria-label="Limpar"
            @click="store.pesquisa = ''"
          >
            <q-icon name="close" size="16px" />
          </button>
        </label>

        <select v-model="store.filtroEstado" class="filter filter__select">
          <option value="">Todos os estados</option>
          <option value="Ativo">Activos</option>
          <option value="Por registar">Por registar</option>
          <option value="Desatualizados">Desatualizados</option>
        </select>

        <button
          v-if="temFiltros"
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
              <th>Nº de série</th>
              <th>Modelo</th>
              <th>Agente</th>
              <th>Estado</th>
              <th>Versão da app</th>
              <th>Última sincronização</th>
              <th class="data-table__th-actions">Acções</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="d in store.paginados"
              :key="d.id"
              class="data-table__row"
            >
              <td>
                <b>{{ d.serie }}</b>
              </td>
              <td class="table-model">{{ d.modelo }}</td>
              <td>{{ d.agente }}</td>
              <td>
                <span
                  class="badge"
                  :class="
                    d.estado === 'Ativo' ? 'badge--success' : 'badge--warning'
                  "
                >
                  {{ d.estado }}
                </span>
              </td>
              <td>
                <span
                  class="versao"
                  :class="{
                    'versao--ok': store.versaoAtualizada(d.versaoApp),
                    'versao--desatualizada': !store.versaoAtualizada(d.versaoApp),
                  }"
                >
                  <q-icon
                    :name="
                      store.versaoAtualizada(d.versaoApp)
                        ? 'check_circle'
                        : 'system_update_alt'
                    "
                    size="14px"
                  />
                  {{ d.versaoApp }}
                </span>
              </td>
              <td class="table-time">
                {{ d.ultimaSincronizacao }}
                <small v-if="d.ultimaSincronizacaoTs">
                  · {{ store.haQuantoTempo(d.ultimaSincronizacaoTs) }}
                </small>
              </td>
              <td class="data-table__actions">
                <button
                  class="row-action"
                  title="Ver detalhes"
                  @click="abrirDetalhes(d)"
                >
                  <q-icon name="visibility" size="18px" />
                </button>

                <button
                  v-if="!store.versaoAtualizada(d.versaoApp)"
                  class="row-action"
                  title="Marcar como atualizado"
                  @click="marcarAtualizado(d)"
                >
                  <q-icon name="system_update_alt" size="18px" />
                </button>

                <button
                  v-if="d.estado === 'Ativo'"
                  class="row-action"
                  title="Desassociar do agente"
                  @click="pedirDesassociar(d)"
                >
                  <q-icon name="link_off" size="18px" />
                </button>

                <button
                  class="row-action row-action--danger"
                  title="Remover"
                  @click="pedirRemover(d)"
                >
                  <q-icon name="delete" size="18px" />
                </button>
              </td>
            </tr>

            <tr v-if="!store.paginados.length">
              <td colspan="7" class="data-table__empty">
                <q-icon
                  name="search_off"
                  size="40px"
                  class="data-table__empty-icon"
                />
                <p>Nenhum dispositivo corresponde aos filtros.</p>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginação -->
        <footer v-if="store.filtrados.length > 0" class="table-foot">
          <div class="table-foot__info">
            Mostrando {{ store.inicioPagina + 1 }}–{{ store.fimPagina }} de
            {{ store.filtrados.length }}
          </div>

          <div class="table-foot__size">
            <label>
              Por página:
              <select
                v-model.number="store.porPagina"
                @change="store.pagina = 1"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </label>
          </div>

          <div class="table-foot__nav">
            <button
              class="pag-btn"
              :disabled="store.pagina === 1"
              @click="store.pagina--"
            >
              <q-icon name="chevron_left" size="18px" />
            </button>
            <span class="pag-info">
              Página <b>{{ store.pagina }}</b> / {{ store.totalPaginas }}
            </span>
            <button
              class="pag-btn"
              :disabled="store.pagina === store.totalPaginas"
              @click="store.pagina++"
            >
              <q-icon name="chevron_right" size="18px" />
            </button>
          </div>
        </footer>
      </section>

      <!-- MODAL — REGISTAR DISPOSITIVO -->
      <q-dialog v-model="modalRegistar" persistent>
        <q-card class="modal-card">
          <header class="modal-head">
            <div class="modal-head__left">
              <div class="modal-head__icon">
                <q-icon name="add_circle" size="22px" />
              </div>
              <div>
                <h2 class="modal-head__title">Registar dispositivo</h2>
                <p class="modal-head__sub">
                  Adicione um novo terminal ao parque
                </p>
              </div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="modalRegistar = false"
            />
          </header>

          <div class="modal-body">
            <label class="field">
              <span class="field__label">Nº de série <em>*</em></span>
              <input
                v-model="form.serie"
                class="field__input field__input--serie"
                placeholder="SN-AGT-012"
                maxlength="20"
              />
            </label>

            <label class="field">
              <span class="field__label">Modelo <em>*</em></span>
              <input
                v-model="form.modelo"
                class="field__input"
                placeholder="Zebra TC22"
              />
            </label>

            <label class="field">
              <span class="field__label">Agente (opcional)</span>
              <select v-model="form.agente" class="field__input">
                <option value="">— Não atribuído —</option>
                <option
                  v-for="a in store.AGENTES_DISPONIVEIS"
                  :key="a"
                  :value="a"
                >
                  {{ a }}
                </option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Notas</span>
              <textarea
                v-model="form.notas"
                class="field__input"
                rows="2"
                placeholder="Observações sobre o dispositivo…"
              />
            </label>
          </div>

          <footer class="modal-foot">
            <button
              class="page-btn page-btn--outline"
              @click="modalRegistar = false"
            >
              Cancelar
            </button>
            <button
              class="page-btn page-btn--primary"
              :disabled="!formValido"
              @click="guardarRegisto"
            >
              Registar
            </button>
          </footer>
        </q-card>
      </q-dialog>

      <!-- MODAL — DETALHES -->
      <q-dialog v-model="modalDetalhes">
        <q-card v-if="dispositivoDetalhe" class="modal-card">
          <header class="modal-head">
            <div class="modal-head__left">
              <div
                class="modal-head__icon"
                :class="
                  dispositivoDetalhe.estado === 'Ativo'
                    ? 'modal-head__icon--ok'
                    : 'modal-head__icon--warn'
                "
              >
                <q-icon name="devices" size="22px" />
              </div>
              <div>
                <h2 class="modal-head__title">
                  {{ dispositivoDetalhe.serie }}
                </h2>
                <p class="modal-head__sub">{{ dispositivoDetalhe.modelo }}</p>
              </div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="modalDetalhes = false"
            />
          </header>

          <div class="modal-body">
            <div class="detail-row">
              <span>Estado</span>
              <span
                class="badge"
                :class="
                  dispositivoDetalhe.estado === 'Ativo'
                    ? 'badge--success'
                    : 'badge--warning'
                "
              >
                {{ dispositivoDetalhe.estado }}
              </span>
            </div>

            <div class="detail-row">
              <span>Agente</span>
              <b>{{ dispositivoDetalhe.agente }}</b>
            </div>

            <div class="detail-row">
              <span>Versão da app</span>
              <span
                class="versao"
                :class="{
                  'versao--ok': store.versaoAtualizada(
                    dispositivoDetalhe.versaoApp,
                  ),
                  'versao--desatualizada': !store.versaoAtualizada(
                    dispositivoDetalhe.versaoApp,
                  ),
                }"
              >
                <q-icon
                  :name="
                    store.versaoAtualizada(dispositivoDetalhe.versaoApp)
                      ? 'check_circle'
                      : 'system_update_alt'
                  "
                  size="14px"
                />
                {{ dispositivoDetalhe.versaoApp }}
              </span>
            </div>

            <div class="detail-row">
              <span>Última sincronização</span>
              <b>
                {{ dispositivoDetalhe.ultimaSincronizacao }}
                <small
                  v-if="dispositivoDetalhe.ultimaSincronizacaoTs"
                  class="detail-hint"
                >
                  ({{
                    store.haQuantoTempo(
                      dispositivoDetalhe.ultimaSincronizacaoTs,
                    )
                  }})
                </small>
              </b>
            </div>

            <div
              v-if="dispositivoDetalhe.notas"
              class="detail-row detail-row--block"
            >
              <span>Notas</span>
              <p>{{ dispositivoDetalhe.notas }}</p>
            </div>
          </div>

          <footer class="modal-foot">
            <button
              class="page-btn page-btn--outline"
              @click="modalDetalhes = false"
            >
              Fechar
            </button>
            <button
              v-if="!store.versaoAtualizada(dispositivoDetalhe.versaoApp)"
              class="page-btn page-btn--primary"
              @click="marcarAtualizadoEDetalhe"
            >
              <q-icon name="system_update_alt" size="16px" />
              Marcar como atualizado
            </button>
          </footer>
        </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  useAdminDispositivosStore,
  type Dispositivo,
} from '@/stores/admin/dispositivos.store'

const $q = useQuasar()
const store = useAdminDispositivosStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Estado dos modais
// ============================================================
const modalRegistar = ref(false)
const modalDetalhes = ref(false)
const dispositivoDetalhe = ref<Dispositivo | null>(null)

const form = reactive({
  serie: '',
  modelo: '',
  agente: '',
  notas: '',
})

// ============================================================
// Estado derivado
// ============================================================
const temFiltros = computed(() => !!store.pesquisa || !!store.filtroEstado)

const formValido = computed(
  () => form.serie.trim().length >= 4 && form.modelo.trim().length >= 2,
)

// ============================================================
// Acções
// ============================================================
function abrirRegistar() {
  Object.assign(form, { serie: '', modelo: '', agente: '', notas: '' })
  modalRegistar.value = true
}

async function guardarRegisto() {
  if (!formValido.value) return

  const novo = await store.registar({
    serie: form.serie,
    modelo: form.modelo,
    agente: form.agente,
    notas: form.notas,
  })

  if (!novo) {
    if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
    return
  }

  modalRegistar.value = false
  $q.notify({
    type: 'positive',
    message: `Dispositivo ${novo.serie} registado`,
    position: 'top',
  })
}

function abrirDetalhes(d: Dispositivo) {
  dispositivoDetalhe.value = d
  modalDetalhes.value = true
}

async function marcarAtualizado(d: Dispositivo) {
  const ok = await store.marcarComoAtualizado(d.id)
  if (ok) {
    $q.notify({
      type: 'positive',
      message: `${d.serie} marcado como atualizado (${store.versaoBackend})`,
      position: 'top',
    })
  } else if (store.erro) {
    $q.notify({ type: 'negative', message: store.erro, position: 'top' })
  }
}

async function marcarAtualizadoEDetalhe() {
  if (!dispositivoDetalhe.value) return
  await marcarAtualizado(dispositivoDetalhe.value)
  modalDetalhes.value = false
}

function pedirDesassociar(d: Dispositivo) {
  $q.dialog({
    title: 'Desassociar dispositivo',
    message: `Desassociar ${d.serie} de ${d.agente}? O terminal volta ao parque.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Desassociar', color: 'warning' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.desassociar(d.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `${d.serie} desassociado`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

function pedirRemover(d: Dispositivo) {
  $q.dialog({
    title: 'Remover dispositivo',
    message: `Remover permanentemente ${d.serie}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(d.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `${d.serie} removido`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

async function exportarExcel() {
  const blob = await store.exportarXlsx()
  if (!blob) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar Excel.',
      position: 'top',
    })
    return
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `admin-dispositivos-${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Ficheiro Excel exportado.',
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

.disp-skeleton {
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
    width: 300px;
    max-width: 60%;
  }
  .sk-sub {
    @extend %sk-block;
    height: 16px;
    width: 420px;
    max-width: 80%;
  }
}

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sk-kpi {
  @extend %sk-block;
  height: 76px;
  border-radius: 14px;
}

.sk-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.sk-search {
  @extend %sk-block;
  flex: 1;
  min-width: 240px;
  height: 44px;
  border-radius: 10px;
}

.sk-select {
  @extend %sk-block;
  width: 170px;
  height: 44px;
  border-radius: 10px;
}

.sk-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sk-row {
  @extend %sk-block;
  height: 48px;
  border-radius: 8px;
}

.disp-erro {
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
.disp-page {
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

  @media (max-width: 900px) {
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
  border: 0;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &--compact {
    padding: 8px 14px;
    font-size: 13px;
  }

  &--primary {
    background: var(--sicam-primary-light);
    color: #fff;
    &:hover:not(:disabled) {
      background: var(--sicam-primary);
    }
    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }
  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
    &:hover:not(:disabled) {
      background: var(--sicam-surface-hover);
    }
    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }
}

/* KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 450px) {
    grid-template-columns: 1fr;
  }
}

.kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1.5px solid transparent;
  text-align: left;
  font-family: inherit;
  transition: transform 0.1s, border-color 0.15s;

  &--clicavel {
    cursor: pointer;
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
    &:active {
      transform: scale(0.98);
    }
  }

  &--activo {
    border-color: var(--sicam-primary-light);
    background: #f9fdfb;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
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

  &__value {
    font-size: 22px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
  }
  &__label {
    font-size: 12px;
    color: var(--sicam-muted);
    margin-top: 2px;
  }
}

/* Filtros */
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.filter {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 10px;
  padding: 0 14px;
  height: 44px;
  font-family: inherit;

  &--search {
    flex: 1;
    min-width: 240px;
  }
  &__icon {
    color: var(--sicam-muted);
    margin-right: 8px;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    border: 0;
    background: transparent;
    font-size: 14px;
    color: var(--sicam-ink);
    height: 100%;

    &:focus {
      outline: 0;
    }
    &::placeholder {
      color: var(--sicam-muted);
    }
  }

  &__select {
    border: 0;
    background: transparent;
    font-size: 14px;
    color: var(--sicam-ink);
    height: 100%;
    cursor: pointer;
    min-width: 170px;

    &:focus {
      outline: 0;
    }
  }

  &__clear {
    background: none;
    border: 0;
    padding: 4px;
    color: var(--sicam-muted);
    cursor: pointer;
    display: grid;
    place-items: center;
    border-radius: 6px;
    &:hover {
      background: var(--sicam-surface-hover);
    }
  }
}

/* Tabela */
.table-wrap {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
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

  &__row {
    transition: background 0.15s;
    &:hover {
      background: #fbfdfc;
    }
    &:last-child td {
      border-bottom: 0;
    }
  }

  &__th-actions {
    width: 170px;
    text-align: right;
  }
  &__actions {
    text-align: right;
    white-space: nowrap;
  }

  &__empty {
    text-align: center;
    color: var(--sicam-muted);
    padding: 40px 16px !important;
    font-size: 14px;

    &-icon {
      color: var(--sicam-line-strong);
      margin-bottom: 8px;
    }
    p {
      margin: 0;
    }
  }
}

.table-time {
  color: var(--sicam-muted);
  font-size: 13px;
  white-space: nowrap;
}
.table-model {
  color: var(--sicam-ink-soft);
  font-size: 13px;
}

/* Badges / versão */
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

  &--success {
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
  }
  &--warning {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
  }
}

.versao {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;

  &--ok {
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
  }
  &--desatualizada {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
  }
}

/* Acções */
.row-action {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sicam-muted);
  cursor: pointer;
  margin-left: 2px;
  transition: all 0.15s;

  &:hover {
    background: var(--sicam-surface-hover);
    color: var(--sicam-ink);
  }
  &--danger:hover {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }
}

/* Paginação */
.table-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  background: #fafbfa;
  border-top: 1px solid var(--sicam-line);
  flex-wrap: wrap;

  &__info {
    font-size: 13px;
    color: var(--sicam-muted);
  }

  &__size label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--sicam-muted);

    select {
      padding: 4px 8px;
      border: 1px solid var(--sicam-line);
      border-radius: 6px;
      background: #fff;
      font-family: inherit;
      font-size: 13px;
      color: var(--sicam-ink);
      cursor: pointer;
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.pag-btn {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 8px;
  color: var(--sicam-ink);
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: var(--sicam-surface-hover);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.pag-info {
  font-size: 13px;
  color: var(--sicam-muted);
  b {
    color: var(--sicam-ink);
  }
}

/* Modais */
.modal-card {
  background: #fff;
  border-radius: 16px;
  width: 90vw;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--sicam-line-soft);

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);

    &--ok {
      background: var(--sicam-success-bg);
      color: var(--sicam-success-ink);
    }
    &--warn {
      background: var(--sicam-warning-bg);
      color: var(--sicam-warning-ink);
    }
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }
  &__sub {
    font-size: 12px;
    color: var(--sicam-muted);
    margin: 2px 0 0;
  }
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--sicam-line-soft);
  background: #fafbfa;
}

/* Formulário */
.field {
  display: block;
  margin-bottom: 14px;

  &__label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;

    em {
      color: var(--sicam-critical);
      font-style: normal;
    }
  }

  &__input {
    display: block;
    width: 100%;
    padding: 11px 12px;
    border: 1px solid var(--sicam-line);
    border-radius: 10px;
    background: #fff;
    color: var(--sicam-ink);
    font-family: inherit;
    font-size: 14px;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }

    &--serie {
      font-family: ui-monospace, monospace;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  }
}

/* Detalhes */
.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--sicam-line-soft);

  &:last-child {
    border-bottom: 0;
  }

  > span:first-child {
    font-size: 12px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  b {
    color: var(--sicam-ink);
    font-size: 14px;
    text-align: right;
  }

  &--block {
    flex-direction: column;
    align-items: flex-start;
    p {
      margin: 6px 0 0;
      font-size: 13px;
      color: var(--sicam-ink);
      line-height: 1.5;
    }
  }
}

.detail-hint {
  color: var(--sicam-muted);
  font-weight: 400;
  font-size: 12px;
}
</style>