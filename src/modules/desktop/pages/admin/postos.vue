<template>
  <q-page class="postos-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="postos-skeleton">
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
        <div v-for="i in 5" :key="`sk-row-${i}`" class="sk-row" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Postos</h1>
          <p class="page-head__sub">
            Áreas de fiscalização dentro de cada província
          </p>
        </div>

        <div class="page-head__actions">
          <button
            type="button"
            class="page-btn page-btn--outline"
            :disabled="store.aCarregar"
            @click="exportarExcel"
          >
            <q-icon name="file_download" size="18px" />
            Excel
          </button>
          <button
            type="button"
            class="page-btn page-btn--primary"
            @click="store.abrirCriar"
          >
            <q-icon name="add" size="18px" />
            Novo posto
          </button>
        </div>
      </header>

      <!-- ERRO -->
      <div v-if="store.erro" class="postos-erro">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- KPIs -->
      <section class="kpi-grid" aria-label="Resumo">
        <article class="kpi kpi--total">
          <div class="kpi__icon">
            <q-icon name="location_city" size="22px" />
          </div>
          <div class="kpi__value">{{ store.kpis.total }}</div>
          <div class="kpi__label">Total de postos</div>
        </article>

        <article class="kpi">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="verified" size="22px" />
          </div>
          <div class="kpi__value">{{ store.kpis.agentes }}</div>
          <div class="kpi__label">Agentes</div>
        </article>

        <article class="kpi">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="warning" size="22px" />
          </div>
          <div class="kpi__value kpi__value--critical">
            {{ store.kpis.criticos }}
          </div>
          <div class="kpi__label">Veículos críticos</div>
        </article>

        <article class="kpi">
          <div class="kpi__icon kpi__icon--info">
            <q-icon name="map" size="22px" />
          </div>
          <div class="kpi__value">{{ store.kpis.provincias }}</div>
          <div class="kpi__label">Províncias</div>
        </article>
      </section>

      <!-- FILTROS + VISTA -->
      <section class="filters" aria-label="Filtros">
        <label class="search">
          <q-icon name="search" size="20px" class="search__icon" />
          <input
            v-model="store.pesquisa"
            type="text"
            class="search__input"
            placeholder="Pesquisar por nome ou código"
          />
          <button
            v-if="store.pesquisa"
            type="button"
            class="search__clear"
            @click="store.pesquisa = ''"
          >
            <q-icon name="close" size="16px" />
          </button>
        </label>

        <label class="select">
          <q-icon name="map" size="18px" class="select__icon" />
          <select v-model="store.filtroProvincia" class="select__field">
            <option value="">Todas as províncias</option>
            <option v-for="p in store.PROVINCIAS" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
          <q-icon name="expand_more" size="18px" class="select__chevron" />
        </label>

        <button
          v-if="temFiltros"
          type="button"
          class="page-btn page-btn--outline page-btn--compact"
          @click="store.limparFiltros"
        >
          <q-icon name="close" size="16px" />
          Limpar
        </button>

        <div class="vista" role="group">
          <button
            type="button"
            class="vista__btn"
            :class="{ 'vista__btn--active': vista === 'tabela' }"
            @click="vista = 'tabela'"
          >
            <q-icon name="table_rows" size="18px" />
            <span class="vista__txt">Tabela</span>
          </button>
          <button
            type="button"
            class="vista__btn"
            :class="{ 'vista__btn--active': vista === 'cartoes' }"
            @click="vista = 'cartoes'"
          >
            <q-icon name="grid_view" size="18px" />
            <span class="vista__txt">Cartões</span>
          </button>
        </div>
      </section>

      <!-- CONTEÚDO -->
      <section class="table-wrap">
        <!-- Vista em tabela -->
        <div
          v-if="vista === 'tabela' && store.paginaVisivel.length"
          class="table-scroll"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Província</th>
                <th>Agentes</th>
                <th>Críticos</th>
                <th class="data-table__th-actions">
                  <span class="sr">Acções</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in store.paginaVisivel"
                :key="p.id"
                class="data-table__row"
              >
                <td>
                  <div class="posto-code">
                    <span
                      class="posto-code__dot"
                      :style="{ background: p.cor }"
                    />
                    <b>{{ p.codigo }}</b>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    class="link-nome"
                    @click="store.abrirDetalhes(p)"
                  >
                    {{ p.nome }}
                  </button>
                </td>
                <td>{{ p.provincia }}</td>
                <td class="num">{{ p.agentes }}</td>
                <td>
                  <span class="crit" :class="{ 'crit--ativo': p.criticos > 0 }">
                    <q-icon v-if="p.criticos > 0" name="warning" size="14px" />
                    {{ p.criticos }}
                  </span>
                </td>
                <td class="data-table__actions">
                  <button
                    type="button"
                    class="row-action"
                    @click="store.abrirDetalhes(p)"
                  >
                    <q-icon name="visibility" size="18px" />
                    <q-tooltip>Ver</q-tooltip>
                  </button>
                  <button
                    type="button"
                    class="row-action"
                    @click="store.abrirEditar(p)"
                  >
                    <q-icon name="edit" size="18px" />
                    <q-tooltip>Editar</q-tooltip>
                  </button>
                  <button
                    type="button"
                    class="row-action row-action--danger"
                    :class="{ 'row-action--bloqueado': p.agentes > 0 }"
                    @click="pedirRemover(p)"
                  >
                    <q-icon name="delete" size="18px" />
                    <q-tooltip>
                      {{ p.agentes > 0 ? 'Tem agentes atribuídos' : 'Remover' }}
                    </q-tooltip>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vista em cartões -->
        <div
          v-else-if="vista === 'cartoes' && store.paginaVisivel.length"
          class="cards"
        >
          <article
            v-for="p in store.paginaVisivel"
            :key="p.id"
            class="pcard"
          >
            <span class="pcard__faixa" :style="{ background: p.cor }" />

            <header class="pcard__head">
              <span class="pcard__code">{{ p.codigo }}</span>

              <div class="pcard__actions">
                <button
                  type="button"
                  class="row-action"
                  @click="store.abrirEditar(p)"
                >
                  <q-icon name="edit" size="18px" />
                  <q-tooltip>Editar</q-tooltip>
                </button>
                <button
                  type="button"
                  class="row-action row-action--danger"
                  :class="{ 'row-action--bloqueado': p.agentes > 0 }"
                  @click="pedirRemover(p)"
                >
                  <q-icon name="delete" size="18px" />
                  <q-tooltip>
                    {{ p.agentes > 0 ? 'Tem agentes atribuídos' : 'Remover' }}
                  </q-tooltip>
                </button>
              </div>
            </header>

            <button
              type="button"
              class="pcard__nome"
              @click="store.abrirDetalhes(p)"
            >
              {{ p.nome }}
            </button>

            <p class="pcard__prov">
              <q-icon name="place" size="15px" />
              {{ p.provincia }}
            </p>

            <div class="pcard__stats">
              <div class="pstat">
                <span class="pstat__icon">
                  <q-icon name="badge" size="18px" />
                </span>
                <div>
                  <b>{{ p.agentes }}</b>
                  <small>agentes</small>
                </div>
              </div>
              <div
                class="pstat"
                :class="{ 'pstat--critico': p.criticos > 0 }"
              >
                <span class="pstat__icon">
                  <q-icon name="warning" size="18px" />
                </span>
                <div>
                  <b>{{ p.criticos }}</b>
                  <small>críticos</small>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Estado vazio -->
        <div v-else class="empty">
          <div class="empty__icon">
            <q-icon name="location_off" size="32px" />
          </div>
          <b>Nenhum posto encontrado</b>
          <p>Tente outro nome, código ou província.</p>
          <button type="button" class="empty__btn" @click="store.limparFiltros">
            Limpar filtros
          </button>
        </div>

        <!-- Paginação -->
        <footer v-if="store.filtrados.length" class="pagination">
          <div class="pagination__info">
            A mostrar
            <b>{{ store.inicioPagina + 1 }}–{{ store.fimPagina }}</b>
            de <b>{{ store.filtrados.length }}</b>
          </div>

          <nav class="pagination__controls">
            <button
              type="button"
              class="pagination__btn"
              :disabled="store.paginaActual <= 1"
              @click="store.paginaActual--"
            >
              <q-icon name="chevron_left" size="18px" />
              <span class="pagination__txt">Anterior</span>
            </button>

            <button
              v-for="p in store.paginasVisiveis"
              :key="p"
              type="button"
              class="pagination__num"
              :class="{ 'pagination__num--active': p === store.paginaActual }"
              @click="store.paginaActual = p"
            >
              {{ p }}
            </button>

            <button
              type="button"
              class="pagination__btn"
              :disabled="store.paginaActual >= store.totalPaginas"
              @click="store.paginaActual++"
            >
              <span class="pagination__txt">Próxima</span>
              <q-icon name="chevron_right" size="18px" />
            </button>
          </nav>
        </footer>
      </section>

      <!-- MODAL: CRIAR / EDITAR -->
      <q-dialog v-model="store.modalForm" persistent>
        <q-card class="modal">
          <header class="modal__head">
            <div class="modal__head-left">
              <span class="modal__icon">
                <q-icon
                  :name="
                    store.modoForm === 'criar'
                      ? 'add_location_alt'
                      : 'edit_location_alt'
                  "
                  size="22px"
                />
              </span>
              <div>
                <h2 class="modal__title">
                  {{
                    store.modoForm === 'criar'
                      ? 'Novo posto'
                      : 'Editar posto'
                  }}
                </h2>
                <small class="modal__sub">
                  Preencha os dados do posto de fiscalização
                </small>
              </div>
            </div>
            <button
              type="button"
              class="modal__close"
              @click="store.fecharForm"
            >
              <q-icon name="close" size="20px" />
            </button>
          </header>

          <div class="modal__body">
            <div class="form-grid">
              <label class="field">
                <span class="field__label">Nome do posto <em>*</em></span>
                <input
                  v-model.trim="store.form.nome"
                  class="field__input"
                  placeholder="Ex.: Posto Baixa"
                />
              </label>

              <div class="form-row">
                <label class="field">
                  <span class="field__label">Código</span>
                  <input
                    v-model.trim="store.form.codigo"
                    class="field__input field__input--key"
                    placeholder="Gerado automaticamente"
                  />
                </label>

                <div class="field">
                  <span class="field__label">Cor</span>
                  <div class="cores" role="group">
                    <button
                      v-for="c in coresSugeridas"
                      :key="c"
                      type="button"
                      class="cores__sw"
                      :class="{ 'cores__sw--active': store.form.cor === c }"
                      :style="{ background: c }"
                      @click="store.form.cor = c"
                    />
                    <input
                      v-model="store.form.cor"
                      type="color"
                      class="cores__picker"
                    />
                  </div>
                </div>
              </div>

              <label class="field">
                <span class="field__label">Província <em>*</em></span>
                <select v-model="store.form.provincia" class="field__input">
                  <option value="">Seleccione…</option>
                  <option v-for="p in store.PROVINCIAS" :key="p" :value="p">
                    {{ p }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span class="field__label">Endereço</span>
                <input
                  v-model.trim="store.form.endereco"
                  class="field__input"
                  placeholder="Rua, número, referência"
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
                <span class="field__label">Notas</span>
                <textarea
                  v-model.trim="store.form.notas"
                  class="field__input field__input--area"
                  rows="3"
                  placeholder="Observações sobre o posto"
                />
              </label>
            </div>
          </div>

          <footer class="modal__foot">
            <p v-if="!store.formValido && faltas.length" class="modal__faltas">
              <q-icon name="info" size="16px" />
              Falta: {{ faltas.join(', ') }}
            </p>
            <span v-else class="modal__espaco" />

            <div class="modal__botoes">
              <button
                type="button"
                class="page-btn page-btn--outline"
                @click="store.fecharForm"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="page-btn page-btn--primary"
                :disabled="!store.formValido || store.aSalvar"
                @click="guardar"
              >
                <q-icon name="save" size="16px" />
                {{
                  store.aSalvar
                    ? 'A guardar…'
                    : store.modoForm === 'criar'
                      ? 'Criar posto'
                      : 'Guardar'
                }}
              </button>
            </div>
          </footer>
        </q-card>
      </q-dialog>

      <!-- MODAL: DETALHES -->
      <q-dialog v-model="store.modalDetalhes">
        <q-card v-if="store.postoDetalhe" class="modal">
          <header class="modal__head">
            <div class="detail-head">
              <div
                class="detail-head__dot"
                :style="{ background: store.postoDetalhe.cor }"
              >
                <q-icon name="location_city" size="22px" />
              </div>
              <div>
                <h2 class="modal__title">{{ store.postoDetalhe.nome }}</h2>
                <small class="modal__sub">{{ store.postoDetalhe.codigo }}</small>
              </div>
            </div>
            <button
              type="button"
              class="modal__close"
              @click="store.modalDetalhes = false"
            >
              <q-icon name="close" size="20px" />
            </button>
          </header>

          <div class="modal__body">
            <div class="detail-stats">
              <div class="detail-stat">
                <q-icon name="badge" size="20px" />
                <b>{{ store.postoDetalhe.agentes }}</b>
                <small>agentes</small>
              </div>
              <div
                class="detail-stat"
                :class="{
                  'detail-stat--critico': store.postoDetalhe.criticos > 0,
                }"
              >
                <q-icon name="warning" size="20px" />
                <b>{{ store.postoDetalhe.criticos }}</b>
                <small>veículos críticos</small>
              </div>
            </div>

            <ul class="detail-list">
              <li>
                <q-icon name="map" size="18px" />
                <div>
                  <small>Província</small>
                  <b>{{ store.postoDetalhe.provincia }}</b>
                </div>
              </li>
              <li v-if="store.postoDetalhe.distrito">
                <q-icon name="place" size="18px" />
                <div>
                  <small>Distrito</small>
                  <b>{{ store.postoDetalhe.distrito }}</b>
                </div>
              </li>
              <li v-if="store.postoDetalhe.endereco">
                <q-icon name="home" size="18px" />
                <div>
                  <small>Endereço</small>
                  <b>{{ store.postoDetalhe.endereco }}</b>
                </div>
              </li>
              <li v-if="store.postoDetalhe.telefone">
                <q-icon name="call" size="18px" />
                <div>
                  <small>Telefone</small>
                  <b>{{ store.postoDetalhe.telefone }}</b>
                </div>
              </li>
              <li v-if="store.postoDetalhe.notas">
                <q-icon name="notes" size="18px" />
                <div>
                  <small>Notas</small>
                  <p>{{ store.postoDetalhe.notas }}</p>
                </div>
              </li>
            </ul>
          </div>

          <footer class="modal__foot">
            <span class="modal__espaco" />
            <div class="modal__botoes">
              <button
                type="button"
                class="page-btn page-btn--outline"
                @click="store.modalDetalhes = false"
              >
                Fechar
              </button>
              <button
                type="button"
                class="page-btn page-btn--primary"
                @click="editarDoDetalhe"
              >
                <q-icon name="edit" size="16px" />
                Editar
              </button>
            </div>
          </footer>
        </q-card>
      </q-dialog>

      <!-- MODAL: CONFIRMAR REMOÇÃO -->
      <q-dialog v-model="store.modalConfirmRemover" persistent>
        <q-card v-if="store.postoARemover" class="modal modal--sm">
          <header class="modal__head">
            <div>
              <h2 class="modal__title">Remover posto</h2>
              <small class="modal__sub">{{ store.postoARemover.nome }}</small>
            </div>
            <button
              type="button"
              class="modal__close"
              @click="store.modalConfirmRemover = false"
            >
              <q-icon name="close" size="20px" />
            </button>
          </header>

          <div class="modal__body">
            <div class="confirm-remove">
              <div class="confirm-remove__icon">
                <q-icon name="warning_amber" size="40px" />
              </div>
              <h3 class="confirm-remove__title">Tem a certeza?</h3>
              <p class="confirm-remove__text">
                O posto <b>{{ store.postoARemover.nome }}</b> será removido
                permanentemente. Esta acção não pode ser desfeita.
              </p>
            </div>
          </div>

          <footer class="modal__foot">
            <span class="modal__espaco" />
            <div class="modal__botoes">
              <button
                type="button"
                class="page-btn page-btn--outline"
                @click="store.modalConfirmRemover = false"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="page-btn page-btn--danger"
                @click="confirmarRemover"
              >
                <q-icon name="delete_forever" size="16px" />
                Remover
              </button>
            </div>
          </footer>
        </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAdminPostosStore, type Posto } from '@/stores/admin/postos.store'

const $q = useQuasar()
const store = useAdminPostosStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Estado da página
// ============================================================
const vista = ref<'tabela' | 'cartoes'>('tabela')

const temFiltros = computed(() => !!store.pesquisa || !!store.filtroProvincia)

const coresSugeridas = [
  '#059669',
  '#0ea5e9',
  '#6366f1',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
]

const faltas = computed(() => {
  const f: string[] = []
  if (!store.form.nome?.trim()) f.push('nome')
  if (!store.form.provincia) f.push('província')
  return f
})

// ============================================================
// Acções
// ============================================================
async function guardar() {
  const p = await store.guardar()
  if (!p) {
    if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Não foi possível guardar. Verifique os dados.',
        position: 'top',
      })
    }
    return
  }
  $q.notify({
    type: 'positive',
    message:
      store.modoForm === 'criar'
        ? `Posto «${p.nome}» criado`
        : `Posto «${p.nome}» actualizado`,
    position: 'top',
  })
}

function editarDoDetalhe() {
  const p = store.postoDetalhe
  if (!p) return
  store.modalDetalhes = false
  store.abrirEditar(p)
}

function pedirRemover(p: Posto) {
  if (p.agentes > 0) {
    $q.notify({
      type: 'warning',
      message: `«${p.nome}» tem ${p.agentes} agente(s) atribuído(s). Reatribua antes de remover.`,
      position: 'top',
    })
    return
  }
  store.pedirRemover(p)
}

async function confirmarRemover() {
  const p = store.postoARemover
  if (!p) return
  const ok = await store.confirmarRemover()
  if (ok) {
    $q.notify({
      type: 'positive',
      message: `Posto «${p.nome}» removido.`,
      position: 'top',
    })
  } else if (store.erro) {
    $q.notify({ type: 'negative', message: store.erro, position: 'top' })
  }
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
  a.download = `admin-postos-${new Date().toISOString().slice(0, 10)}.xlsx`
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

.postos-skeleton {
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
    height: 30px;
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
  grid-template-columns: 1.2fr repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sk-kpi {
  @extend %sk-block;
  height: 100px;
  border-radius: 18px;
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
  height: 46px;
  border-radius: 14px;
}

.sk-select {
  @extend %sk-block;
  width: 200px;
  height: 46px;
  border-radius: 14px;
}

.sk-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sk-row {
  @extend %sk-block;
  height: 52px;
  border-radius: 10px;
}

.postos-erro {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 13px;
  margin-bottom: 16px;
}

/* ============================================================ */
/* Página                                                       */
/* ============================================================ */
.postos-page {
  --u-ink: var(--sicam-ink, #0f172a);
  --u-muted: var(--sicam-muted, #64748b);
  --u-line: var(--sicam-line, #e5ebe8);
  --u-line-soft: var(--sicam-line-soft, #eef2f0);

  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;

  @media (max-width: 700px) {
    flex-direction: column;
  }

  &__title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--u-ink);
    margin: 0 0 6px;
  }
  &__sub {
    font-size: 14px;
    color: var(--u-muted);
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
  border-radius: 12px;
  padding: 11px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, transform 0.1s;

  &--compact {
    padding: 8px 14px;
    font-size: 13px;
  }

  &--primary {
    background: #064e3b;
    color: #fff;

    &:hover:not(:disabled) {
      background: #047857;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &--outline {
    background: #fff;
    color: var(--u-ink);
    border: 1px solid var(--u-line);

    &:hover:not(:disabled) {
      background: #ecfdf5;
      border-color: #a7e3c8;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &--danger {
    background: #dc2626;
    color: #fff;

    &:hover:not(:disabled) {
      background: #b91c1c;
    }
  }
}

/* KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: 1.2fr repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 450px) {
    grid-template-columns: 1fr;
  }
}

.kpi {
  background: #fff;
  border: 1px solid var(--u-line);
  border-radius: 18px;
  padding: 16px;

  &__icon {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    margin-bottom: 14px;
    background: #ecfdf5;
    color: #065f46;

    &--success {
      background: #ecfdf5;
      color: #065f46;
    }
    &--critical {
      background: #fef2f2;
      color: #991b1b;
    }
    &--info {
      background: #dbeafe;
      color: #1d4ed8;
    }
  }

  &__value {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--u-ink);
    line-height: 1;
    font-variant-numeric: tabular-nums;

    &--critical {
      color: #b91c1c;
    }
  }

  &__label {
    font-size: 13px;
    color: #334155;
    margin-top: 8px;
    font-weight: 600;
  }

  &--total {
    background: linear-gradient(150deg, #065f46 0%, #04261d 100%);
    border-color: transparent;

    .kpi__icon {
      background: rgba(250, 204, 21, 0.16);
      color: #facc15;
    }
    .kpi__value {
      color: #fff;
    }
    .kpi__label {
      color: #d5f0e4;
    }
  }
}

/* Filtros */
.filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search {
  flex: 1;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--u-line);
  border-radius: 14px;
  padding: 0 12px 0 14px;
  height: 46px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  }

  &__icon {
    color: var(--u-muted);
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    background: transparent;
    font-size: 14px;
    font-family: inherit;
    color: var(--u-ink);

    &:focus {
      outline: 0;
    }
    &::placeholder {
      color: #94a3b8;
    }
  }

  &__clear {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: #eef2f0;
    color: #475569;
    cursor: pointer;

    &:hover {
      background: #dde5e1;
    }
  }
}

.select {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--u-line);
  border-radius: 14px;
  height: 46px;
  min-width: 200px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  }

  &__icon {
    position: absolute;
    left: 14px;
    color: var(--u-muted);
    pointer-events: none;
  }
  &__chevron {
    position: absolute;
    right: 12px;
    color: var(--u-muted);
    pointer-events: none;
  }

  &__field {
    width: 100%;
    height: 100%;
    appearance: none;
    border: 0;
    background: transparent;
    padding: 0 36px 0 40px;
    font-size: 14px;
    font-family: inherit;
    color: var(--u-ink);
    cursor: pointer;

    &:focus {
      outline: 0;
    }
  }
}

.vista {
  display: inline-flex;
  padding: 3px;
  background: #f1f5f4;
  border-radius: 12px;
  gap: 2px;
  margin-left: auto;

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 0;
    background: transparent;
    color: #475569;
    border-radius: 9px;
    padding: 9px 14px;
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

  &__txt {
    @media (max-width: 520px) {
      display: none;
    }
  }
}

/* Tabela */
.table-wrap {
  background: #fff;
  border: 1px solid var(--u-line);
  border-radius: 20px;
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;

  th {
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: var(--u-muted);
    padding: 14px 16px;
    background: #f6f9f8;
    border-bottom: 1px solid var(--u-line);
    white-space: nowrap;
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--u-ink);
    border-bottom: 1px solid var(--u-line-soft);
    vertical-align: middle;
  }

  &__row {
    transition: background 0.15s;

    &:hover {
      background: #f8fcfa;
    }
    &:last-child td {
      border-bottom: 0;
    }
  }

  &__th-actions {
    width: 140px;
  }
  &__actions {
    text-align: right;
    white-space: nowrap;
  }
}

.num {
  font-variant-numeric: tabular-nums;
}

.posto-code {
  display: flex;
  align-items: center;
  gap: 8px;

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  b {
    font-weight: 700;
    letter-spacing: 0.02em;
  }
}

.link-nome {
  border: 0;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: var(--u-ink);
  cursor: pointer;
  text-align: left;

  &:hover {
    color: #065f46;
    text-decoration: underline;
  }
}

.crit {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  background: #f1f5f9;
  color: #475569;

  &--ativo {
    background: #fef2f2;
    color: #991b1b;
  }
}

.row-action {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--u-muted);
  cursor: pointer;
  margin-left: 2px;
  transition: background 0.15s, color 0.15s;

  &:hover:not(.row-action--bloqueado) {
    background: #ecfdf5;
    color: #065f46;
  }

  &--danger:hover:not(.row-action--bloqueado) {
    background: #fef2f2;
    color: #991b1b;
  }

  &--bloqueado {
    opacity: 0.35;
    cursor: not-allowed;

    &:hover {
      background: transparent;
      color: var(--u-muted);
    }
  }
}

/* Vista em cartões */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  padding: 18px;
}

.pcard {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--u-line);
  border-radius: 18px;
  padding: 18px 18px 16px;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover {
    box-shadow: 0 10px 26px rgba(6, 78, 59, 0.1);
    border-color: #a7e3c8;
  }

  &__faixa {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 5px;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 4px 0 10px;
  }

  &__code {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.05em;
    padding: 3px 10px;
    border-radius: 99px;
    background: #f1f5f9;
    color: #334155;
  }

  &__actions {
    display: flex;
  }

  &__nome {
    border: 0;
    background: none;
    padding: 0;
    text-align: left;
    font-family: inherit;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--u-ink);
    cursor: pointer;

    &:hover {
      color: #065f46;
    }
  }

  &__prov {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 6px 0 16px;
    font-size: 13px;
    color: var(--u-muted);

    .q-icon {
      color: #10b981;
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: auto;
  }
}

.pstat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f6f9f8;
  border-radius: 14px;

  &__icon {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #fff;
    color: #065f46;
    flex-shrink: 0;
  }

  div {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }
  b {
    font-size: 18px;
    font-weight: 800;
    color: var(--u-ink);
    font-variant-numeric: tabular-nums;
  }
  small {
    font-size: 12px;
    color: var(--u-muted);
  }

  &--critico {
    background: #fef2f2;

    .pstat__icon {
      color: #dc2626;
    }
    b {
      color: #991b1b;
    }
  }
}

/* Estado vazio */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 52px 20px;

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
    color: var(--u-ink);
    margin-bottom: 4px;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: var(--u-muted);
  }

  &__btn {
    margin-top: 16px;
    border: 0;
    background: #064e3b;
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
      background: #047857;
    }
  }
}

/* Paginação */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-top: 1px solid var(--u-line);
  flex-wrap: wrap;

  &__info {
    font-size: 13px;
    color: var(--u-muted);
    b {
      color: var(--u-ink);
      font-weight: 700;
    }
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background: #fff;
    border: 1px solid var(--u-line);
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--u-ink);
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s, border-color 0.15s;

    &:hover:not(:disabled) {
      background: #ecfdf5;
      border-color: #a7e3c8;
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @media (max-width: 520px) {
      padding: 8px;
    }
  }

  &__txt {
    @media (max-width: 520px) {
      display: none;
    }
  }

  &__num {
    min-width: 36px;
    height: 36px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    color: #334155;
    cursor: pointer;
    font-variant-numeric: tabular-nums;

    &:hover {
      background: #ecfdf5;
    }

    &--active {
      background: #064e3b;
      color: #fff;
      &:hover {
        background: #064e3b;
      }
    }
  }
}

/* Modais */
.modal {
  background: #fff;
  border-radius: 20px;
  width: 90vw;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(4, 38, 29, 0.25);
  overflow: hidden;

  &--sm {
    max-width: 440px;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 20px;
    border-bottom: 1px solid var(--u-line-soft);
    flex-shrink: 0;
  }

  &__head-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  &__icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: #ecfdf5;
    color: #065f46;
    flex-shrink: 0;
  }

  &__title {
    font-size: 18px;
    font-weight: 800;
    color: var(--u-ink);
    margin: 0;
  }
  &__sub {
    font-size: 13px;
    color: var(--u-muted);
  }

  &__close {
    background: none;
    border: 0;
    color: var(--u-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: 10px;
    display: flex;
    align-items: center;

    &:hover {
      background: #f1f5f4;
      color: var(--u-ink);
    }
  }

  &__body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-top: 1px solid var(--u-line-soft);
    background: #f8fbfa;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  &__botoes {
    display: flex;
    gap: 10px;
    margin-left: auto;
  }
  &__espaco {
    flex: 1;
  }

  &__faltas {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: 13px;
    color: #92400e;

    .q-icon {
      color: #f59e0b;
    }
  }
}

/* Formulário */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.field {
  display: block;

  &__label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 8px;

    em {
      color: #dc2626;
      font-style: normal;
      margin-left: 2px;
    }
  }

  &__input {
    display: block;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #d5dfda;
    border-radius: 12px;
    background: #fff;
    color: var(--u-ink);
    font-family: inherit;
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:focus {
      outline: 0;
      border-color: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    }

    &--key {
      font-family: ui-monospace, Menlo, Consolas, monospace;
    }
    &--area {
      resize: vertical;
      min-height: 84px;
    }
  }

  &__erro {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: -6px 0 0;
    font-size: 13px;
    font-weight: 600;
    color: #991b1b;

    .q-icon {
      color: #dc2626;
    }
  }
}

.cores {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 46px;

  &__sw {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #d5dfda;
    cursor: pointer;
    transition: transform 0.1s;

    &:hover {
      transform: scale(1.1);
    }

    &--active {
      box-shadow: 0 0 0 2px #064e3b;
    }
  }

  &__picker {
    width: 30px;
    height: 30px;
    padding: 0;
    border: 1px solid #d5dfda;
    border-radius: 50%;
    background: none;
    cursor: pointer;
  }
}

/* Detalhes */
.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  &__dot {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    color: #fff;
    flex-shrink: 0;
  }

  h2 {
    margin: 0;
  }
}

.detail-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.detail-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px;
  background: #f6f9f8;
  border-radius: 16px;

  .q-icon {
    color: #065f46;
    margin-bottom: 6px;
  }
  b {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--u-ink);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  small {
    font-size: 12px;
    color: var(--u-muted);
  }

  &--critico {
    background: #fef2f2;

    .q-icon {
      color: #dc2626;
    }
    b {
      color: #991b1b;
    }
  }
}

.detail-list {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-top: 1px solid var(--u-line-soft);

    &:first-child {
      border-top: 0;
    }

    .q-icon {
      color: #10b981;
      margin-top: 2px;
      flex-shrink: 0;
    }
  }

  small {
    display: block;
    font-size: 12px;
    color: var(--u-muted);
    margin-bottom: 2px;
  }
  b {
    font-size: 14px;
    color: var(--u-ink);
  }
  p {
    margin: 0;
    font-size: 14px;
    color: #334155;
    line-height: 1.5;
  }
}

/* Confirmação de remoção */
.confirm-remove {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 0 4px;

  &__icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #fef2f2;
    color: #dc2626;
    margin-bottom: 14px;
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--u-ink);
    margin: 0 0 8px;
  }

  &__text {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
    margin: 0;
    b {
      color: #991b1b;
    }
  }
}
</style>