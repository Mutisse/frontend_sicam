<template>
  <q-page class="ap-page">
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
          <h1 class="page-head__title">Apólices</h1>
          <p class="page-head__sub">
            Registo de apólices de seguro obrigatório e estados de validade
          </p>
        </div>

        <div class="page-head__actions">
          <button
            class="page-btn page-btn--outline"
            :disabled="store.aCarregar"
            @click="exportarCSV"
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
            Nova apólice
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

        <button class="kpi" @click="filtrarPor('A expirar')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="hourglass_top" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.aExpirar }}</div>
            <div class="kpi__label">A expirar (30d)</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Expirada')">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="cancel" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.expiradas }}</div>
            <div class="kpi__label">Expiradas</div>
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
            placeholder="Pesquisar por matrícula, nº de apólice, segurado…"
          />
        </div>

        <select v-model="store.filtroSeguradora" class="filter filter__select">
          <option value="">Todas as seguradoras</option>
          <option v-for="s in store.SEGURADORAS" :key="s" :value="s">{{ s }}</option>
        </select>

        <select v-model="store.filtroTipo" class="filter filter__select">
          <option value="">Todos os tipos</option>
          <option v-for="t in store.TIPOS" :key="t" :value="t">{{ t }}</option>
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
              <th>Nº Apólice</th>
              <th>Matrícula</th>
              <th>Segurado</th>
              <th>Seguradora</th>
              <th>Tipo</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Prémio</th>
              <th>Estado</th>
              <th class="data-table__th-actions" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="a in store.paginados"
              :key="a.id"
              class="data-table__row"
              @click="store.abrirDetalhes(a)"
            >
              <td><b>{{ a.numero }}</b></td>
              <td>
                <div class="placa">
                  <q-icon name="directions_car" size="14px" class="placa__icon" />
                  <b>{{ a.matricula }}</b>
                </div>
              </td>
              <td>
                <div class="cell-segurado">
                  <b>{{ a.segurado }}</b>
                  <small>NIF {{ a.nif }}</small>
                </div>
              </td>
              <td>{{ a.seguradora }}</td>
              <td class="cell-tipo">{{ a.tipo }}</td>
              <td class="table-time">{{ a.inicio }}</td>
              <td class="table-time">{{ a.fim }}</td>
              <td class="cell-valor">{{ store.formatarMoeda(a.premio) }}</td>
              <td>
                <span
                  class="badge"
                  :class="`badge--${store.estadoClasse(a.estado)}`"
                >
                  {{ a.estado }}
                </span>
              </td>
              <td class="data-table__actions" @click.stop>
                <button class="row-action" title="Ver" @click="store.abrirDetalhes(a)">
                  <q-icon name="visibility" size="18px" />
                </button>
                <button class="row-action" title="Editar" @click="editar(a)">
                  <q-icon name="edit" size="18px" />
                </button>
                <button
                  class="row-action row-action--danger"
                  title="Remover"
                  @click="pedirRemover(a)"
                >
                  <q-icon name="delete" size="18px" />
                </button>
              </td>
            </tr>

            <tr v-if="!store.paginados.length">
              <td colspan="10" class="data-table__empty">
                <q-icon name="shield_moon" size="40px" class="data-table__empty-icon" />
                <p>Nenhuma apólice encontrada com estes filtros.</p>
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
                  Criar primeira apólice
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
      <div v-if="store.apoliceDetalhe" class="modal">
        <header class="modal__head">
          <div class="detail-head">
            <div class="detail-head__icon">
              <q-icon name="shield" size="20px" />
            </div>
            <div>
              <h2 class="modal__title">{{ store.apoliceDetalhe.numero }}</h2>
              <small class="modal__sub">{{ store.apoliceDetalhe.seguradora }}</small>
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
              :class="`badge--${store.estadoClasse(store.apoliceDetalhe.estado)}`"
            >
              {{ store.apoliceDetalhe.estado }}
            </span>
          </div>
          <div class="detail-row">
            <span>Matrícula</span><b>{{ store.apoliceDetalhe.matricula }}</b>
          </div>
          <div class="detail-row">
            <span>Segurado</span><b>{{ store.apoliceDetalhe.segurado }}</b>
          </div>
          <div class="detail-row">
            <span>NIF</span><b>{{ store.apoliceDetalhe.nif }}</b>
          </div>
          <div v-if="store.apoliceDetalhe.telefone" class="detail-row">
            <span>Telefone</span><b>{{ store.apoliceDetalhe.telefone }}</b>
          </div>
          <div v-if="store.apoliceDetalhe.email" class="detail-row">
            <span>Email</span><b>{{ store.apoliceDetalhe.email }}</b>
          </div>
          <div class="detail-row">
            <span>Tipo</span><b>{{ store.apoliceDetalhe.tipo }}</b>
          </div>
          <div class="detail-row">
            <span>Seguradora</span><b>{{ store.apoliceDetalhe.seguradora }}</b>
          </div>
          <div class="detail-row">
            <span>Início</span><b>{{ store.apoliceDetalhe.inicio }}</b>
          </div>
          <div class="detail-row">
            <span>Fim</span><b>{{ store.apoliceDetalhe.fim }}</b>
          </div>
          <div class="detail-row">
            <span>Prémio</span>
            <b>{{ store.formatarMoeda(store.apoliceDetalhe.premio) }}</b>
          </div>
          <div class="detail-row">
            <span>Criado em</span><b>{{ store.apoliceDetalhe.criadoEm }}</b>
          </div>
          <div
            v-if="store.apoliceDetalhe.observacoes"
            class="detail-row detail-row--motivo"
          >
            <span>Observações</span>
            <p>{{ store.apoliceDetalhe.observacoes }}</p>
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
            @click="editar(store.apoliceDetalhe)"
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
              {{ store.modoEdicao ? 'Editar apólice' : 'Nova apólice' }} —
              {{
                store.passoForm === 1
                  ? 'Dados da apólice'
                  : store.passoForm === 2
                  ? 'Segurado'
                  : 'Vigência e prémio'
              }}
            </h2>
            <small class="modal__sub">Passo {{ store.passoForm }} de 3</small>
          </div>
          <button class="modal__close" @click="store.fecharForm">
            <q-icon name="close" size="20px" />
          </button>
        </header>

        <div class="steps">
          <div
            v-for="n in 3"
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
              {{ n === 1 ? 'Apólice' : n === 2 ? 'Segurado' : 'Vigência' }}
            </div>
            <div v-if="n < 3" class="steps__line" />
          </div>
        </div>

        <div class="modal__body">
          <!-- PASSO 1 -->
          <div v-if="store.passoForm === 1" class="form-grid">
            <label class="field field--full">
              <span class="field__label">Nº de apólice <em>*</em></span>
              <input
                v-model.trim="store.form.numero"
                class="field__input"
                placeholder="AP-2026-000001"
                :disabled="store.modoEdicao"
              />
            </label>

            <label class="field">
              <span class="field__label">Matrícula <em>*</em></span>
              <input
                v-model.trim="store.form.matricula"
                class="field__input field__input--placa"
                placeholder="AGL-482-MC"
                maxlength="12"
              />
            </label>

            <label class="field">
              <span class="field__label">Seguradora <em>*</em></span>
              <select v-model="store.form.seguradora" class="field__input">
                <option v-for="s in store.SEGURADORAS" :key="s" :value="s">{{ s }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Tipo de cobertura <em>*</em></span>
              <select v-model="store.form.tipo" class="field__input">
                <option v-for="t in store.TIPOS" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Estado <em>*</em></span>
              <select v-model="store.form.estado" class="field__input">
                <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
              </select>
            </label>
          </div>

          <!-- PASSO 2 -->
          <div v-else-if="store.passoForm === 2" class="form-grid">
            <label class="field field--full">
              <span class="field__label">Nome do segurado <em>*</em></span>
              <input
                v-model.trim="store.form.segurado"
                class="field__input"
                placeholder="Ex.: Carlos Nhaca"
              />
            </label>

            <label class="field">
              <span class="field__label">NIF <em>*</em></span>
              <input
                v-model.trim="store.form.nif"
                class="field__input"
                placeholder="123456789"
                maxlength="9"
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

            <label class="field field--full">
              <span class="field__label">Email</span>
              <input
                v-model.trim="store.form.email"
                type="email"
                class="field__input"
                placeholder="exemplo@email.com"
              />
            </label>
          </div>

          <!-- PASSO 3 -->
          <div v-else class="form-grid">
            <label class="field">
              <span class="field__label">Início <em>*</em></span>
              <input
                v-model.trim="store.form.inicio"
                class="field__input"
                placeholder="dd/mm/aaaa"
              />
            </label>

            <label class="field">
              <span class="field__label">Fim <em>*</em></span>
              <input
                v-model.trim="store.form.fim"
                class="field__input"
                placeholder="dd/mm/aaaa"
              />
            </label>

            <label class="field">
              <span class="field__label">Prémio (MT) <em>*</em></span>
              <input
                v-model.number="store.form.premio"
                type="number"
                min="0"
                class="field__input"
                placeholder="0"
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

          <template v-else-if="store.passoForm === 2">
            <button class="page-btn page-btn--outline" @click="store.passoAnterior">
              <q-icon name="arrow_back" size="16px" />
              Voltar
            </button>
            <button
              class="page-btn page-btn--primary"
              :disabled="!store.passo2Valido"
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
                  : 'Criar apólice'
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
import { useIssmApolesStore, type Apolice } from '@/stores/issm/issm-ApolesStore'
import { apolicesService } from '@/services/issm/apolices.service'

const store = useIssmApolesStore()
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

  if (store.kpis.aExpirar > 0) {
    lista.push({
      tipo: 'atencao',
      icon: 'hourglass_top',
      titulo: `${store.kpis.aExpirar} apólice${store.kpis.aExpirar === 1 ? '' : 's'} a expirar nos próximos 30 dias`,
      descricao: 'Notifique os segurados para renovação',
    })
  }

  if (store.kpis.expiradas > 0) {
    lista.push({
      tipo: 'critico',
      icon: 'gpp_bad',
      titulo: `${store.kpis.expiradas} apólice${store.kpis.expiradas === 1 ? '' : 's'} expirada${store.kpis.expiradas === 1 ? '' : 's'}`,
      descricao: 'Veículos sem seguro obrigatório válido',
    })
  }

  return lista
})

// ============================================================
// Filtros rápidos
// ============================================================
function filtrarPor(valor: 'total' | 'Activa' | 'A expirar' | 'Expirada') {
  store.limparFiltros()
  if (valor === 'total') return
  store.filtroEstado = valor
}

// ============================================================
// Editar / Remover / Salvar
// ============================================================
function editar(a: Apolice | null) {
  if (!a) return
  store.modalDetalhes = false
  store.abrirEditar(a)
}

function pedirRemover(a: Apolice) {
  $q.dialog({
    title: 'Remover apólice',
    message: `Remover permanentemente ${a.numero} (${a.matricula})?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(a.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Apólice ${a.numero} removida`,
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
      ? `Apólice ${store.form.numero} actualizada`
      : `Apólice ${store.form.numero} criada`,
    position: 'top',
  })
  store.fecharForm()
}

// ============================================================
// Exportar Excel (XLSX via backend)
// ============================================================
async function exportarCSV() {
  try {
    const filtros: { seguradora?: string; tipo?: string; estado?: string } = {}
    if (store.filtroSeguradora) filtros.seguradora = store.filtroSeguradora
    if (store.filtroTipo) filtros.tipo = store.filtroTipo
    if (store.filtroEstado) filtros.estado = store.filtroEstado

    const blob = await apolicesService.exportarXlsx(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `issm-apolices-${new Date().toISOString().slice(0, 10)}.xlsx`
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
// Exportar PDF via backend
// ============================================================
async function exportarPDF() {
  try {
    const filtros: { seguradora?: string; tipo?: string; estado?: string } = {}
    if (store.filtroSeguradora) filtros.seguradora = store.filtroSeguradora
    if (store.filtroTipo) filtros.tipo = store.filtroTipo
    if (store.filtroEstado) filtros.estado = store.filtroEstado

    const blob = await apolicesService.exportarPdf(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `issm-apolices-${new Date().toISOString().slice(0, 10)}.pdf`
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
.ap-page {
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

    &:hover:not(:disabled) {
      background: var(--sicam-primary);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }
    &:active:not(:disabled) { transform: translateY(0); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);

    &:hover:not(:disabled) {
      background: var(--sicam-surface-hover);
      border-color: var(--sicam-line-strong);
    }
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
    min-width: 160px;

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
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;

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
    cursor: pointer;
    transition: background 0.15s;

    &:hover { background: #fbfdfc; }
    &:last-child td { border-bottom: 0; }
  }

  &__th-actions { width: 130px; text-align: right; }
  &__actions { text-align: right; white-space: nowrap; }

  &__empty {
    text-align: center;
    color: var(--sicam-muted);
    padding: 40px 16px !important;
    font-size: 14px;

    &-icon {
      color: var(--sicam-line-strong);
      margin-bottom: 8px;
    }
    p { margin: 0 0 16px; }
  }
}

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }
.cell-tipo  { color: var(--sicam-ink-soft); font-size: 13px; }
.cell-valor { font-weight: 700; color: var(--sicam-ink); white-space: nowrap; }

.cell-segurado {
  b     { display: block; font-size: 13px; font-weight: 600; color: var(--sicam-ink); }
  small { display: block; font-size: 11px; color: var(--sicam-muted); margin-top: 2px; }
}

.placa {
  display: flex;
  align-items: center;
  gap: 6px;

  b { font-weight: 700; letter-spacing: 0.02em; }
  &__icon { color: var(--sicam-muted); }
}

/* ============================================================ */
/* Badge                                                        */
/* ============================================================ */
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

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--info    { background: #dbeafe;                  color: #2563eb; }
}

/* ============================================================ */
/* Acções por linha                                             */
/* ============================================================ */
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

  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }

  &--danger:hover { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}

/* ============================================================ */
/* Paginação                                                    */
/* ============================================================ */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: #fafbfa;
  border-top: 1px solid var(--sicam-line);
  flex-wrap: wrap;

  &__info {
    font-size: 13px;
    color: var(--sicam-muted);
    b { color: var(--sicam-ink); font-weight: 600; }
  }

  &__controls { display: flex; align-items: center; gap: 8px; }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #fff;
    border: 1px solid var(--sicam-line);
    border-radius: 8px;
    padding: 8px 14px;
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
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  &__page {
    font-size: 12px;
    color: var(--sicam-muted);
    font-weight: 600;
    padding: 0 4px;
    white-space: nowrap;
  }
}

/* ============================================================ */
/* Modal                                                        */
/* ============================================================ */
.modal {
  background: #fff;
  border-radius: 16px;
  width: 90vw;
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;

  &--form { max-width: 720px; }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__title { font-size: 17px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub   { font-size: 12px; color: var(--sicam-muted); }

  &__close {
    background: none;
    border: 0;
    color: var(--sicam-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    transition: all 0.15s;

    &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
  }

  &__body {
    padding: 20px 22px;
    max-height: 70vh;
    overflow-y: auto;
  }

  &__foot {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    border-top: 1px solid var(--sicam-line-soft);
    background: #fafbfa;
    flex-wrap: wrap;
  }
}

/* ============================================================ */
/* Steps                                                        */
/* ============================================================ */
.steps {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(180deg, #fafbfa 0%, #fff 100%);
  border-bottom: 1px solid var(--sicam-line-soft);
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
  overflow: hidden;
  text-overflow: ellipsis;
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
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  }
  .steps__label { color: var(--sicam-success); }
  .steps__line  { background: var(--sicam-success); }
}

.steps__item--active {
  .steps__dot {
    background: var(--sicam-primary-light);
    border-color: var(--sicam-primary-light);
    color: #fff;
    box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
    transform: scale(1.1);
  }
  .steps__label { color: var(--sicam-primary); font-weight: 700; }
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

    &--placa {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    &:disabled {
      background: var(--sicam-surface-alt);
      color: var(--sicam-muted);
      cursor: not-allowed;
    }
  }
}

/* ============================================================ */
/* Detalhes                                                     */
/* ============================================================ */
.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;

  h2 { margin: 0; }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--sicam-line-soft);

  &:last-child { border-bottom: 0; }

  > span:first-child {
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    flex-shrink: 0;
  }

  b {
    color: var(--sicam-ink);
    font-size: 14px;
    font-weight: 700;
    text-align: right;
    word-break: break-word;
  }

  &--motivo {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    p {
      margin: 0;
      font-size: 13px;
      color: var(--sicam-ink);
      line-height: 1.6;
      background: var(--sicam-surface-alt);
      padding: 12px 16px;
      border-radius: 10px;
      width: 100%;
    }
  }
}

/* ============================================================ */
/* Responsivo                                                   */
/* ============================================================ */
@media (max-width: 600px) {
  .modal {
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }

  .modal--form .modal__body {
    flex: 1;
    max-height: none;
  }

  .page-head__actions {
    width: 100%;
    .page-btn { flex: 1; }
  }

  .form-grid { grid-template-columns: 1fr; }
  .steps { padding: 14px 16px; }
  .steps__dot { width: 26px; height: 26px; font-size: 11px; }
  .steps__line { margin: 0 6px; }

  .data-table {
    th, td { padding: 10px 12px; }
  }
  .data-table__th-actions { width: 100px; }
}
</style>