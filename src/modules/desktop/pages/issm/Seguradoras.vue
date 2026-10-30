<template>
  <q-page class="sg-page">
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
          <h1 class="page-head__title">Seguradoras</h1>
          <p class="page-head__sub">
            Registo e gestão das seguradoras autorizadas no mercado nacional
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
          <button class="page-btn page-btn--primary" @click="store.abrirNova">
            <q-icon name="add" size="18px" />
            Nova seguradora
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
            <q-icon name="shield" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Total</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Activa')">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="verified" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.activas }}</div>
            <div class="kpi__label">Activas</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Suspensa')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="pause_circle" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.suspensas }}</div>
            <div class="kpi__label">Suspensas</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Inactiva')">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="block" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.inactivas }}</div>
            <div class="kpi__label">Inactivas</div>
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
            placeholder="Pesquisar por nome, sigla, código ou NIF…"
          />
        </div>

        <select v-model="store.filtroCategoria" class="filter filter__select">
          <option value="">Todas as categorias</option>
          <option v-for="c in store.CATEGORIAS" :key="c" :value="c">{{ c }}</option>
        </select>

        <select v-model="store.filtroProvincia" class="filter filter__select">
          <option value="">Todas as províncias</option>
          <option v-for="p in store.PROVINCIAS" :key="p" :value="p">{{ p }}</option>
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
              <th>Seguradora</th>
              <th class="col-nif">NIF</th>
              <th>Categoria</th>
              <th class="col-provincia">Província</th>
              <th class="col-contacto">Contacto</th>
              <th class="col-apoles">Apólices</th>
              <th>Estado</th>
              <th class="th-actions">Acções</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in store.paginados"
              :key="s.id"
              class="row"
              @click="store.abrirDetalhes(s)"
            >
              <td>
                <div class="cell-seguradora">
                  <div class="cell-seguradora__avatar">
                    {{ store.iniciais(s.sigla) }}
                  </div>
                  <div class="cell-seguradora__info">
                    <b>{{ s.nome }}</b>
                    <small>{{ s.sigla }} · {{ s.codigo }}</small>
                  </div>
                </div>
              </td>
              <td class="col-nif">
                <span class="cell-codigo"><b>{{ s.nif }}</b></span>
              </td>
              <td>
                <span
                  class="categoria"
                  :class="`categoria--${store.categoriaClasse(s.categoria)}`"
                >
                  <q-icon :name="store.categoriaIcone(s.categoria)" size="13px" />
                  <span class="categoria__txt">{{ s.categoria }}</span>
                </span>
              </td>
              <td class="col-provincia cell-muted">{{ s.provincia }}</td>
              <td class="col-contacto">
                <div class="cell-contacto">
                  <b>{{ s.telefone }}</b>
                  <small>{{ s.email }}</small>
                </div>
              </td>
              <td class="col-apoles">
                <div class="cell-stats">
                  <span class="cell-stats__num">
                    {{ store.formatarNumero(s.numeroApoles) }}
                  </span>
                  <small>{{ s.numeroSinistros }} sinistros</small>
                </div>
              </td>
              <td>
                <span class="badge" :class="`badge--${store.estadoClasse(s.estado)}`">
                  {{ s.estado }}
                </span>
              </td>
              <td class="cell-actions" @click.stop>
                <div class="actions-group">
                  <button
                    class="row-action"
                    title="Ver detalhes"
                    @click="store.abrirDetalhes(s)"
                  >
                    <q-icon name="visibility" size="17px" />
                  </button>

                  <button class="row-action" title="Editar" @click="editar(s)">
                    <q-icon name="edit" size="17px" />
                  </button>

                  <button
                    v-if="s.estado !== 'Activa'"
                    class="row-action row-action--success"
                    title="Activar"
                    @click="activar(s)"
                  >
                    <q-icon name="play_arrow" size="17px" />
                  </button>

                  <button
                    v-if="s.estado === 'Activa'"
                    class="row-action row-action--warning"
                    title="Suspender"
                    @click="suspender(s)"
                  >
                    <q-icon name="pause" size="17px" />
                  </button>

                  <button
                    class="row-action row-action--danger"
                    title="Remover"
                    @click="pedirRemover(s)"
                  >
                    <q-icon name="delete" size="17px" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!store.paginados.length">
              <td colspan="8" class="empty">
                <q-icon name="business" size="40px" class="empty__icon" />
                <p>Nenhuma seguradora encontrada com estes filtros.</p>
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

    <!-- MODAL — DETALHES -->
    <q-dialog v-model="store.modalDetalhes">
      <div v-if="store.seguradoraDetalhe" class="modal">
        <header class="modal__head">
          <div class="detail-head">
            <div class="detail-head__icon">
              <q-icon name="business" size="20px" />
            </div>
            <div>
              <h2 class="modal__title">{{ store.seguradoraDetalhe.nome }}</h2>
              <small class="modal__sub">
                {{ store.seguradoraDetalhe.codigo }} ·
                {{ store.seguradoraDetalhe.sigla }}
              </small>
            </div>
          </div>
          <button class="modal__close" @click="store.modalDetalhes = false">
            <q-icon name="close" size="20px" />
          </button>
        </header>

        <div class="modal__body">
          <div class="detail-row">
            <span>Estado</span>
            <span
              class="badge"
              :class="`badge--${store.estadoClasse(store.seguradoraDetalhe.estado)}`"
            >
              {{ store.seguradoraDetalhe.estado }}
            </span>
          </div>
          <div class="detail-row">
            <span>Categoria</span>
            <span
              class="categoria"
              :class="`categoria--${store.categoriaClasse(store.seguradoraDetalhe.categoria)}`"
            >
              <q-icon
                :name="store.categoriaIcone(store.seguradoraDetalhe.categoria)"
                size="13px"
              />
              {{ store.seguradoraDetalhe.categoria }}
            </span>
          </div>
          <div class="detail-row">
            <span>NIF</span><b>{{ store.seguradoraDetalhe.nif }}</b>
          </div>
          <div class="detail-row">
            <span>Telefone</span><b>{{ store.seguradoraDetalhe.telefone }}</b>
          </div>
          <div class="detail-row">
            <span>Email</span><b>{{ store.seguradoraDetalhe.email }}</b>
          </div>
          <div v-if="store.seguradoraDetalhe.website" class="detail-row">
            <span>Website</span><b>{{ store.seguradoraDetalhe.website }}</b>
          </div>
          <div class="detail-row">
            <span>Endereço</span><b>{{ store.seguradoraDetalhe.endereco }}</b>
          </div>
          <div class="detail-row">
            <span>Cidade</span><b>{{ store.seguradoraDetalhe.cidade }}</b>
          </div>
          <div class="detail-row">
            <span>Província</span><b>{{ store.seguradoraDetalhe.provincia }}</b>
          </div>
          <div class="detail-row">
            <span>Responsável</span><b>{{ store.seguradoraDetalhe.responsavel }}</b>
          </div>
          <div class="detail-row">
            <span>Contacto</span
            ><b>{{ store.seguradoraDetalhe.contactoResponsavel }}</b>
          </div>
          <div class="detail-row">
            <span>Nº de apólices</span>
            <b>{{ store.formatarNumero(store.seguradoraDetalhe.numeroApoles) }}</b>
          </div>
          <div class="detail-row">
            <span>Nº de sinistros</span>
            <b>{{ store.formatarNumero(store.seguradoraDetalhe.numeroSinistros) }}</b>
          </div>
          <div class="detail-row">
            <span>Registada em</span><b>{{ store.seguradoraDetalhe.registadaEm }}</b>
          </div>
          <div
            v-if="store.seguradoraDetalhe.observacoes"
            class="detail-row detail-row--motivo"
          >
            <span>Observações</span>
            <p>{{ store.seguradoraDetalhe.observacoes }}</p>
          </div>
        </div>

        <footer class="modal__foot">
          <button
            class="page-btn page-btn--outline"
            @click="store.modalDetalhes = false"
          >
            Fechar
          </button>
          <button
            class="page-btn page-btn--primary"
            @click="editar(store.seguradoraDetalhe)"
          >
            <q-icon name="edit" size="16px" />
            Editar
          </button>
        </footer>
      </div>
    </q-dialog>

    <!-- MODAL — NOVA / EDITAR -->
    <q-dialog v-model="store.modalForm" persistent>
      <div class="modal modal--form">
        <header class="modal__head">
          <div>
            <h2 class="modal__title">
              {{ store.modoEdicao ? 'Editar seguradora' : 'Nova seguradora' }} —
              {{ store.passoForm === 1 ? 'Identificação' : 'Contacto e localização' }}
            </h2>
            <small class="modal__sub">Passo {{ store.passoForm }} de 2</small>
          </div>
          <button class="modal__close" @click="store.fecharForm">
            <q-icon name="close" size="20px" />
          </button>
        </header>

        <div class="steps">
          <div
            v-for="n in 2"
            :key="n"
            class="steps__item"
            :class="{
              'steps__item--done': n < store.passoForm,
              'steps__item--active': n === store.passoForm,
            }"
          >
            <div class="steps__dot">
              <q-icon v-if="n < store.passoForm" name="check" size="14px" />
              <span v-else>{{ n }}</span>
            </div>
            <div class="steps__label">
              {{ n === 1 ? 'Identificação' : 'Contacto' }}
            </div>
            <div v-if="n < 2" class="steps__line" />
          </div>
        </div>

        <div class="modal__body">
          <!-- PASSO 1 -->
          <div v-if="store.passoForm === 1" class="form-grid">
            <label class="field">
              <span class="field__label">Código <em>*</em></span>
              <input
                v-model.trim="store.form.codigo"
                class="field__input"
                placeholder="SEG-001"
                :disabled="store.modoEdicao"
              />
            </label>

            <label class="field">
              <span class="field__label">Sigla <em>*</em></span>
              <input
                v-model.trim="store.form.sigla"
                class="field__input field__input--placa"
                placeholder="SEG-A"
                maxlength="8"
              />
            </label>

            <label class="field field--full">
              <span class="field__label">Nome completo <em>*</em></span>
              <input
                v-model.trim="store.form.nome"
                class="field__input"
                placeholder="Ex.: Seguradora A, S.A."
              />
            </label>

            <label class="field">
              <span class="field__label">NIF <em>*</em></span>
              <input
                v-model.trim="store.form.nif"
                class="field__input"
                placeholder="400123456"
                maxlength="9"
              />
            </label>

            <label class="field">
              <span class="field__label">Categoria <em>*</em></span>
              <select v-model="store.form.categoria" class="field__input">
                <option v-for="c in store.CATEGORIAS" :key="c" :value="c">
                  {{ c }}
                </option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Estado <em>*</em></span>
              <select v-model="store.form.estado" class="field__input">
                <option v-for="e in store.ESTADOS" :key="e" :value="e">
                  {{ e }}
                </option>
              </select>
            </label>
          </div>

          <!-- PASSO 2 -->
          <div v-else class="form-grid">
            <label class="field">
              <span class="field__label">Telefone <em>*</em></span>
              <input
                v-model.trim="store.form.telefone"
                class="field__input"
                placeholder="+258 21 000 0000"
              />
            </label>

            <label class="field">
              <span class="field__label">Email <em>*</em></span>
              <input
                v-model.trim="store.form.email"
                type="email"
                class="field__input"
                placeholder="geral@seguradora.co.mz"
              />
            </label>

            <label class="field field--full">
              <span class="field__label">Website</span>
              <input
                v-model.trim="store.form.website"
                class="field__input"
                placeholder="www.seguradora.co.mz"
              />
            </label>

            <label class="field field--full">
              <span class="field__label">Endereço <em>*</em></span>
              <input
                v-model.trim="store.form.endereco"
                class="field__input"
                placeholder="Av. 25 de Setembro, 1234"
              />
            </label>

            <label class="field">
              <span class="field__label">Cidade <em>*</em></span>
              <input
                v-model.trim="store.form.cidade"
                class="field__input"
                placeholder="Maputo"
              />
            </label>

            <label class="field">
              <span class="field__label">Província <em>*</em></span>
              <select v-model="store.form.provincia" class="field__input">
                <option v-for="p in store.PROVINCIAS" :key="p" :value="p">
                  {{ p }}
                </option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Responsável <em>*</em></span>
              <input
                v-model.trim="store.form.responsavel"
                class="field__input"
                placeholder="Dr. João Machava"
              />
            </label>

            <label class="field">
              <span class="field__label">Contacto do responsável</span>
              <input
                v-model.trim="store.form.contactoResponsavel"
                class="field__input"
                placeholder="+258 84 000 0000"
              />
            </label>

            <label class="field field--full">
              <span class="field__label">Observações</span>
              <textarea
                v-model.trim="store.form.observacoes"
                class="field__input"
                rows="3"
                placeholder="Detalhes adicionais…"
              />
            </label>
          </div>
        </div>

        <footer class="modal__foot">
          <template v-if="store.passoForm === 1">
            <button class="page-btn page-btn--outline" @click="store.fecharForm">
              Cancelar
            </button>
            <button
              class="page-btn page-btn--primary"
              :disabled="!store.passo1Valido"
              @click="store.proximoPasso"
            >
              Próximo
              <q-icon name="arrow_forward" size="16px" />
            </button>
          </template>

          <template v-else>
            <button class="page-btn page-btn--outline" @click="store.passoAnterior">
              <q-icon name="arrow_back" size="16px" />
              Voltar
            </button>
            <button
              class="page-btn page-btn--primary"
              :disabled="!store.formValido || store.aSalvar"
              @click="salvar"
            >
              <q-icon name="save" size="16px" />
              {{
                store.aSalvar
                  ? 'A guardar…'
                  : store.modoEdicao
                  ? 'Guardar alterações'
                  : 'Registar seguradora'
              }}
            </button>
          </template>
        </footer>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  useIssmSeguradorasStore,
  type Seguradora,
} from '@/stores/issm/issm-SeguradorasStore'
import { seguradorasService } from '@/services/issm/seguradoras.service'

const store = useIssmSeguradorasStore()
const $q = useQuasar()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Alertas automáticos
// ============================================================
const alertas = computed(() => {
  const lista: {
    tipo: 'atencao' | 'critico'
    icon: string
    titulo: string
    descricao: string
  }[] = []

  if (store.kpis.suspensas > 0) {
    lista.push({
      tipo: 'atencao',
      icon: 'pause_circle',
      titulo: `${store.kpis.suspensas} seguradora${
        store.kpis.suspensas === 1 ? '' : 's'
      } suspensa${store.kpis.suspensas === 1 ? '' : 's'}`,
      descricao: 'Verificar situação legal e regularização',
    })
  }

  if (store.kpis.inactivas > 0) {
    lista.push({
      tipo: 'critico',
      icon: 'block',
      titulo: `${store.kpis.inactivas} seguradora${
        store.kpis.inactivas === 1 ? '' : 's'
      } inactiva${store.kpis.inactivas === 1 ? '' : 's'}`,
      descricao: 'Não podem emitir novas apólices',
    })
  }

  return lista
})

// ============================================================
// Filtros rápidos
// ============================================================
function filtrarPor(valor: 'total' | 'Activa' | 'Suspensa' | 'Inactiva') {
  store.limparFiltros()
  if (valor === 'total') return
  store.filtroEstado = valor
}

// ============================================================
// Ações
// ============================================================
function editar(s: Seguradora | null) {
  if (!s) return
  store.modalDetalhes = false
  store.abrirEditar(s)
}

function activar(s: Seguradora) {
  $q.dialog({
    title: 'Activar seguradora',
    message: `Confirmar a activação de ${s.nome}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Activar', color: 'positive' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.activar(s.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `${s.nome} activada`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

function suspender(s: Seguradora) {
  $q.dialog({
    title: 'Suspender seguradora',
    message: `Confirmar a suspensão de ${s.nome}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Suspender', color: 'warning' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.suspender(s.id)
    if (ok) {
      $q.notify({
        type: 'warning',
        message: `${s.nome} suspensa`,
        position: 'top',
      })
    }
  })
}

function pedirRemover(s: Seguradora) {
  $q.dialog({
    title: 'Remover seguradora',
    message: `Remover permanentemente ${s.nome} (${s.codigo})?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(s.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `${s.nome} removida`,
        position: 'top',
      })
    }
  })
}

async function salvar() {
  const ok = await store.salvarForm()
  if (!ok) {
    if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
    return
  }

  $q.notify({
    type: 'positive',
    message: store.modoEdicao
      ? `Seguradora ${store.form.nome} actualizada`
      : `Seguradora ${store.form.nome} registada`,
    position: 'top',
  })
  store.fecharForm()
}

// ============================================================
// Exportar Excel (XLSX via backend)
// ============================================================
async function exportarExcel() {
  try {
    const filtros: { categoria?: string; estado?: string; provincia?: string } = {}
    if (store.filtroCategoria) filtros.categoria = store.filtroCategoria
    if (store.filtroEstado) filtros.estado = store.filtroEstado
    if (store.filtroProvincia) filtros.provincia = store.filtroProvincia

    const blob = await seguradorasService.exportarXlsx(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `issm-seguradoras-${new Date().toISOString().slice(0, 10)}.xlsx`
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
    const filtros: { categoria?: string; estado?: string; provincia?: string } = {}
    if (store.filtroCategoria) filtros.categoria = store.filtroCategoria
    if (store.filtroEstado) filtros.estado = store.filtroEstado
    if (store.filtroProvincia) filtros.provincia = store.filtroProvincia

    const blob = await seguradorasService.exportarPdf(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `issm-seguradoras-${new Date().toISOString().slice(0, 10)}.pdf`
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
/* ============================================================ */
/* RESET DEFENSIVO                                              */
/* ============================================================ */
.sg-page .data-table,
.sg-page .data-table thead,
.sg-page .data-table tbody,
.sg-page .data-table tr,
.sg-page .data-table th,
.sg-page .data-table td {
  box-sizing: border-box;
}

.sg-page .data-table { display: table !important; }
.sg-page .data-table thead { display: table-header-group !important; }
.sg-page .data-table tbody { display: table-row-group !important; }
.sg-page .data-table tr { display: table-row !important; }
.sg-page .data-table th,
.sg-page .data-table td { display: table-cell !important; }

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
/* PÁGINA                                                       */
/* ============================================================ */
.sg-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

/* ============================================================ */
/* CABEÇALHO                                                    */
/* ============================================================ */
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 700px) { flex-direction: column; }

  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0; }
  &__actions { display: flex; gap: 10px; flex-wrap: wrap; }
}

/* ============================================================ */
/* BOTÕES                                                       */
/* ============================================================ */
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

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
    &:hover:not(:disabled) { background: var(--sicam-surface-hover); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &--primary {
    background: var(--sicam-primary-light);
    color: #fff;
    &:hover:not(:disabled) { background: var(--sicam-primary); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &--compact { padding: 8px 12px; font-size: 13px; }
}

/* ============================================================ */
/* ALERTAS                                                      */
/* ============================================================ */
.alertas { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }

.alerta {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;

  &--atencao {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
  }

  &--critico {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }

  &__icon { flex-shrink: 0; margin-top: 1px; }
  &__body { display: flex; flex-direction: column; gap: 2px; }
  &__body b { font-weight: 700; }
  &__body small { opacity: 0.85; }
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
  border: 1px solid var(--sicam-line-soft);
  border-radius: 14px;
  padding: 16px 18px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.15s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &:hover { border-color: var(--sicam-primary-light); transform: translateY(-1px); }

  &__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;

    &--primary  { background: var(--sicam-primary-bg);   color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);   color: var(--sicam-success-ink); }
    &--warning  { background: var(--sicam-warning-bg);   color: var(--sicam-warning-ink); }
    &--critical { background: var(--sicam-critical-bg);  color: var(--sicam-critical-ink); }
  }

  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

/* ============================================================ */
/* FILTROS                                                      */
/* ============================================================ */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.filter {
  &--search {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 260px;
    background: #fff;
    border: 1px solid var(--sicam-line);
    border-radius: 10px;
    padding: 0 14px;

    &:focus-within { border-color: var(--sicam-primary-light); }
  }

  &__icon { color: var(--sicam-muted); }

  &__input {
    flex: 1;
    border: 0;
    outline: 0;
    padding: 11px 0;
    font-size: 14px;
    font-family: inherit;
    color: var(--sicam-ink);
    background: transparent;

    &::placeholder { color: var(--sicam-muted); }
  }

  &__select {
    border: 1px solid var(--sicam-line);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 14px;
    font-family: inherit;
    color: var(--sicam-ink);
    background: #fff;
    cursor: pointer;

    &:focus { outline: 0; border-color: var(--sicam-primary-light); }
  }
}

/* ============================================================ */
/* TABELA                                                       */
/* ============================================================ */
.table-wrap {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead th {
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--sicam-muted);
    padding: 14px 16px;
    border-bottom: 1px solid var(--sicam-line-soft);
    background: var(--sicam-surface-alt);
    white-space: nowrap;
  }

  tbody td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--sicam-line-soft);
    color: var(--sicam-ink);
    vertical-align: middle;
  }

  tbody tr:last-child td { border-bottom: 0; }

  .row {
    cursor: pointer;
    transition: background 0.15s;
    &:hover { background: var(--sicam-surface-alt); }
  }
}

.cell-seguradora {
  display: flex;
  align-items: center;
  gap: 12px;

  &__avatar {
    width: 38px; height: 38px; border-radius: 10px;
    display: grid; place-items: center; flex-shrink: 0;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.03em;
  }

  &__info {
    display: flex; flex-direction: column; gap: 2px; min-width: 0;

    b { font-weight: 700; color: var(--sicam-ink); }
    small { font-size: 11px; color: var(--sicam-muted); }
  }
}

.cell-codigo {
  font-family: monospace;
  font-size: 12px;
  letter-spacing: 0.04em;

  b { font-weight: 700; }
}

.cell-muted { color: var(--sicam-muted); }

.cell-contacto {
  display: flex; flex-direction: column; gap: 2px;

  b { font-weight: 600; font-size: 13px; }
  small { font-size: 11px; color: var(--sicam-muted); }
}

.cell-stats {
  display: flex; flex-direction: column; gap: 2px;

  &__num { font-weight: 700; font-size: 14px; }
  small { font-size: 11px; color: var(--sicam-muted); }
}

.categoria {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;

  &--nacional      { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
  &--internacional { background: #e0e7ff;                  color: #4338ca; }
  &--mutua         { background: #f3e8ff;                  color: #7e22ce; }

  &__txt { line-height: 1; }
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}

.cell-actions { text-align: right; }

.actions-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.row-action {
  display: grid;
  place-items: center;
  width: 32px; height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sicam-muted);
  cursor: pointer;
  transition: all 0.15s;

  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }

  &--success:hover { background: var(--sicam-success-bg); color: var(--sicam-success-ink); }
  &--warning:hover { background: var(--sicam-warning-bg); color: var(--sicam-warning-ink); }
  &--danger:hover  { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--sicam-muted);

  &__icon { opacity: 0.4; margin-bottom: 12px; }
  p { margin: 0 0 16px; font-size: 14px; }
}

/* ============================================================ */
/* PAGINAÇÃO                                                    */
/* ============================================================ */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-top: 1px solid var(--sicam-line-soft);
  flex-wrap: wrap;

  &__info { font-size: 12px; color: var(--sicam-muted); }
  &__info b { color: var(--sicam-ink); }

  &__controls { display: flex; align-items: center; gap: 12px; }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px solid var(--sicam-line);
    background: #fff;
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    color: var(--sicam-ink);
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not(:disabled) { background: var(--sicam-surface-hover); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  &__page { font-size: 12px; color: var(--sicam-muted); }
  &__page b { color: var(--sicam-ink); }
}

/* ============================================================ */
/* MODAIS                                                       */
/* ============================================================ */
.modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

  &--form { max-width: 640px; }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 24px 18px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__title { font-size: 18px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 4px; }
  &__sub { font-size: 12px; color: var(--sicam-muted); }

  &__close {
    display: grid;
    place-items: center;
    width: 32px; height: 32px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--sicam-muted);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s;

    &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
  }

  &__body {
    padding: 22px 24px;
    overflow-y: auto;
    flex: 1;
  }

  &__foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid var(--sicam-line-soft);
  }
}

/* Detalhes */
.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;

  &__icon {
    width: 42px; height: 42px; border-radius: 11px;
    display: grid; place-items: center;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    flex-shrink: 0;
  }
}

.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--sicam-line-soft);
  font-size: 13px;

  &:last-child { border-bottom: 0; }

  > span:first-child { color: var(--sicam-muted); flex-shrink: 0; }
  > b { font-weight: 600; color: var(--sicam-ink); text-align: right; word-break: break-word; }

  &--motivo {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;

    p {
      margin: 0;
      font-size: 13px;
      color: var(--sicam-ink);
      line-height: 1.5;
      background: var(--sicam-surface-alt);
      padding: 10px 12px;
      border-radius: 8px;
    }
  }
}

/* ============================================================ */
/* FORMULÁRIO — STEPS                                           */
/* ============================================================ */
.steps {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 18px 24px 0;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }

  &__dot {
    width: 26px; height: 26px; border-radius: 50%;
    display: grid; place-items: center;
    font-size: 12px; font-weight: 700;
    background: var(--sicam-line-soft);
    color: var(--sicam-muted);
    flex-shrink: 0;
    transition: all 0.2s;
  }

  &__label {
    font-size: 12px;
    font-weight: 600;
    color: var(--sicam-muted);
  }

  &__line {
    width: 40px;
    height: 2px;
    background: var(--sicam-line-soft);
    margin: 0 12px;
  }

  &__item--active {
    .steps__dot { background: var(--sicam-primary-light); color: #fff; }
    .steps__label { color: var(--sicam-ink); }
  }

  &__item--done {
    .steps__dot { background: var(--sicam-success-bg); color: var(--sicam-success-ink); }
    .steps__label { color: var(--sicam-ink); }
    .steps__line { background: var(--sicam-success-bg); }
  }
}

/* ============================================================ */
/* FORMULÁRIO — CAMPOS                                          */
/* ============================================================ */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 560px) { grid-template-columns: 1fr; }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--full { grid-column: 1 / -1; }

  &__label {
    font-size: 12px;
    font-weight: 600;
    color: var(--sicam-muted);

    em { color: var(--sicam-critical-ink); font-style: normal; }
  }

  &__input {
    width: 100%;
    border: 1px solid var(--sicam-line);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 14px;
    font-family: inherit;
    color: var(--sicam-ink);
    background: #fff;
    transition: border-color 0.15s;

    &::placeholder { color: var(--sicam-muted); }
    &:focus { outline: 0; border-color: var(--sicam-primary-light); }
    &:disabled { background: var(--sicam-surface-alt); color: var(--sicam-muted); }

    &--placa {
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
    }
  }

  textarea.field__input { resize: vertical; min-height: 80px; }
}
</style>