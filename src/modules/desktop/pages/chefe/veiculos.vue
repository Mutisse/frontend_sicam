<template>
  <q-page class="vc-page">
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
          <h1 class="page-head__title">Veículos Críticos</h1>
          <p class="page-head__sub">
            Veículos com situações que requerem intervenção imediata
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
            Registar veículo
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
            <q-icon name="directions_car" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Total activos</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Hotlist PRM')">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="local_police" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.hotlist }}</div>
            <div class="kpi__label">Hotlist</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Seguro expirado')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="shield" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.seguroExpirado }}</div>
            <div class="kpi__label">Seguro expirado</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Em averiguação')">
          <div class="kpi__icon kpi__icon--info">
            <q-icon name="search" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.emAveriguacao }}</div>
            <div class="kpi__label">Em averiguação</div>
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
            placeholder="Pesquisar por matrícula, proprietário, marca…"
          />
        </div>

        <select v-model="store.filtroMotivo" class="filter filter__select">
          <option value="">Todos os motivos</option>
          <option v-for="m in store.MOTIVOS" :key="m" :value="m">{{ m }}</option>
        </select>

        <select v-model="store.filtroPrioridade" class="filter filter__select">
          <option value="">Todas as prioridades</option>
          <option v-for="p in store.PRIORIDADES" :key="p" :value="p">{{ p }}</option>
        </select>

        <select v-model="store.filtroEstado" class="filter filter__select">
          <option value="">Todos os estados</option>
          <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
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
              <th>Veículo</th>
              <th>Proprietário</th>
              <th>Motivo</th>
              <th>Prioridade</th>
              <th>Posto</th>
              <th>Multas</th>
              <th>Estado</th>
              <th class="data-table__th-actions">Acções</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="v in store.paginados"
              :key="v.id"
              class="data-table__row"
              @click="store.abrirDetalhes(v)"
            >
              <td>
                <div class="cell-veiculo">
                  <div class="placa">
                    <q-icon name="directions_car" size="14px" class="placa__icon" />
                    <b>{{ v.matricula }}</b>
                  </div>
                  <small>{{ v.marca }} {{ v.modelo }}</small>
                </div>
              </td>
              <td>
                <div class="cell-proprietario">
                  <b>{{ v.proprietario }}</b>
                  <small>{{ v.telefone }}</small>
                </div>
              </td>
              <td>
                <span class="motivo" :class="`motivo--${store.motivoClasse(v.motivo)}`">
                  <q-icon :name="store.motivoIcone(v.motivo)" size="13px" />
                  {{ v.motivo }}
                </span>
              </td>
              <td>
                <span class="badge" :class="`badge--${store.prioridadeClasse(v.prioridade)}`">
                  {{ v.prioridade }}
                </span>
              </td>
              <td class="cell-muted">{{ v.posto }}</td>
              <td>
                <div class="cell-multas">
                  <b>{{ v.multasPendentes }}</b>
                  <small v-if="v.valorMultas > 0">{{ store.formatarMoeda(v.valorMultas) }}</small>
                  <small v-else>—</small>
                </div>
              </td>
              <td>
                <span class="badge" :class="`badge--${store.estadoClasse(v.estado)}`">
                  {{ v.estado }}
                </span>
              </td>
              <td class="data-table__actions" @click.stop>
                <div class="actions-group">
                  <button class="row-action" title="Ver detalhes" @click="store.abrirDetalhes(v)">
                    <q-icon name="visibility" size="17px" />
                  </button>

                  <button class="row-action" title="Editar" @click="editar(v)">
                    <q-icon name="edit" size="17px" />
                  </button>

                  <button
                    v-if="v.motivo === 'Hotlist PRM' && v.estado !== 'Resolvido'"
                    class="row-action row-action--success"
                    title="Abater hotlist"
                    @click="abaterHotlist(v)"
                  >
                    <q-icon name="check_circle" size="17px" />
                  </button>

                  <button
                    v-if="v.motivo === 'Seguro expirado' && v.estado !== 'Resolvido'"
                    class="row-action row-action--success"
                    title="Regularizar seguro"
                    @click="regularizarSeguro(v)"
                  >
                    <q-icon name="verified_user" size="17px" />
                  </button>

                  <button
                    class="row-action row-action--danger"
                    title="Remover"
                    @click="pedirRemover(v)"
                  >
                    <q-icon name="delete" size="17px" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!store.paginados.length">
              <td colspan="8" class="data-table__empty">
                <q-icon name="directions_car" size="40px" class="data-table__empty-icon" />
                <p>Nenhum veículo crítico encontrado com estes filtros.</p>
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
                  Registar primeiro veículo
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
      <q-card v-if="store.veiculoSelecionado" class="modal-card modal-card--wide">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div
              class="modal-head__icon"
              :class="`modal-head__icon--${store.estadoClasse(store.veiculoSelecionado.estado)}`"
            >
              <q-icon name="directions_car" size="22px" />
            </div>
            <div>
              <div class="modal-head__title">{{ store.veiculoSelecionado.matricula }}</div>
              <div class="modal-head__sub">
                {{ store.veiculoSelecionado.marca }} {{ store.veiculoSelecionado.modelo }}
              </div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="store.modalDetalhes = false" />
        </q-card-section>

        <q-card-section class="modal-estado">
          <span
            class="motivo modal-motivo"
            :class="`motivo--${store.motivoClasse(store.veiculoSelecionado.motivo)}`"
          >
            <q-icon :name="store.motivoIcone(store.veiculoSelecionado.motivo)" size="13px" />
            {{ store.veiculoSelecionado.motivo }}
          </span>
          <span
            class="badge badge--lg"
            :class="`badge--${store.prioridadeClasse(store.veiculoSelecionado.prioridade)}`"
          >
            {{ store.veiculoSelecionado.prioridade }}
          </span>
          <span
            class="badge badge--lg"
            :class="`badge--${store.estadoClasse(store.veiculoSelecionado.estado)}`"
          >
            {{ store.veiculoSelecionado.estado }}
          </span>
        </q-card-section>

        <q-card-section class="modal-grid">
          <div class="modal-field">
            <div class="modal-field__label">Proprietário</div>
            <div class="modal-field__value">{{ store.veiculoSelecionado.proprietario }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">NIF</div>
            <div class="modal-field__value">{{ store.veiculoSelecionado.nif }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Telefone</div>
            <div class="modal-field__value">{{ store.veiculoSelecionado.telefone }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Posto</div>
            <div class="modal-field__value">{{ store.veiculoSelecionado.posto }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Zona</div>
            <div class="modal-field__value">{{ store.veiculoSelecionado.zona }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Agente</div>
            <div class="modal-field__value">{{ store.veiculoSelecionado.agente }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Multas pendentes</div>
            <div class="modal-field__value modal-field__value--big">
              {{ store.veiculoSelecionado.multasPendentes }}
            </div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Valor em multas</div>
            <div class="modal-field__value">
              {{ store.formatarMoeda(store.veiculoSelecionado.valorMultas) }}
            </div>
          </div>

          <div v-if="store.veiculoSelecionado.observacoes" class="modal-field modal-field--full">
            <div class="modal-field__label">Observações</div>
            <div class="modal-field__value modal-field__value--text">
              {{ store.veiculoSelecionado.observacoes }}
            </div>
          </div>

          <div class="modal-field modal-field--full">
            <div class="modal-field__label">Histórico</div>
            <div class="historico">
              <div
                v-for="(h, i) in store.veiculoSelecionado.historico"
                :key="i"
                class="historico__item"
              >
                <div class="historico__dot" />
                <div class="historico__body">
                  <b>{{ h.acao }}</b>
                  <small>{{ h.data }} · {{ h.responsavel }}</small>
                </div>
              </div>
              <div
                v-if="!store.veiculoSelecionado.historico.length"
                class="historico__empty"
              >
                Sem registos
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat label="Fechar" @click="store.modalDetalhes = false" />
          <div class="modal-actions__right">
            <q-btn
              v-if="store.veiculoSelecionado.motivo === 'Hotlist PRM' && store.veiculoSelecionado.estado !== 'Resolvido'"
              flat
              color="positive"
              icon="check_circle"
              label="Abater hotlist"
              @click="abaterHotlist(store.veiculoSelecionado); store.modalDetalhes = false"
            />
            <q-btn
              v-if="store.veiculoSelecionado.motivo === 'Seguro expirado' && store.veiculoSelecionado.estado !== 'Resolvido'"
              flat
              color="positive"
              icon="verified_user"
              label="Regularizar seguro"
              @click="regularizarSeguro(store.veiculoSelecionado); store.modalDetalhes = false"
            />
            <q-btn
              unelevated
              color="primary"
              icon="edit"
              label="Editar"
              @click="editar(store.veiculoSelecionado)"
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
              <q-icon name="directions_car" size="22px" />
            </div>
            <div>
              <div class="modal-head__title">
                {{ store.modoEdicao ? 'Editar veículo crítico' : 'Registar veículo crítico' }}
              </div>
              <div class="modal-head__sub">Passo {{ store.passo }} de 2</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="store.fecharForm" />
        </q-card-section>

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
              {{ n === 1 ? 'Veículo' : 'Motivo & Proprietário' }}
            </div>
            <div v-if="n < 2" class="steps__line" />
          </div>
        </div>

        <q-card-section class="modal-body">
          <!-- PASSO 1 -->
          <div v-if="store.passo === 1" class="form-grid">
            <label class="field field--full">
              <span class="field__label">Matrícula <em>*</em></span>
              <input
                v-model.trim="store.form.matricula"
                class="field__input field__input--placa"
                placeholder="AGL-482-MC"
                maxlength="12"
              />
            </label>

            <label class="field">
              <span class="field__label">Marca <em>*</em></span>
              <input
                v-model.trim="store.form.marca"
                class="field__input"
                placeholder="Ex.: Mazda"
              />
            </label>

            <label class="field">
              <span class="field__label">Modelo <em>*</em></span>
              <input
                v-model.trim="store.form.modelo"
                class="field__input"
                placeholder="Ex.: 3"
              />
            </label>
          </div>

          <!-- PASSO 2 -->
          <div v-else class="form-grid">
            <label class="field field--full">
              <span class="field__label">Proprietário <em>*</em></span>
              <input
                v-model.trim="store.form.proprietario"
                class="field__input"
                placeholder="Ex.: Carlos Nhaca"
              />
            </label>

            <label class="field">
              <span class="field__label">NIF <em>*</em></span>
              <input
                v-model.trim="store.form.nif"
                class="field__input"
                placeholder="345678901"
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

            <label class="field">
              <span class="field__label">Motivo <em>*</em></span>
              <select v-model="store.form.motivo" class="field__input">
                <option v-for="m in store.MOTIVOS" :key="m" :value="m">{{ m }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Prioridade <em>*</em></span>
              <select v-model="store.form.prioridade" class="field__input">
                <option v-for="p in store.PRIORIDADES" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Posto <em>*</em></span>
              <select v-model="store.form.posto" class="field__input">
                <option v-for="p in store.POSTOS" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Agente responsável <em>*</em></span>
              <select v-model="store.form.agente" class="field__input">
                <option v-for="a in store.AGENTES" :key="a" :value="a">{{ a }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Zona</span>
              <input
                v-model.trim="store.form.zona"
                class="field__input"
                placeholder="Ex.: Av. Julius Nyerere"
              />
            </label>

            <label class="field">
              <span class="field__label">Multas pendentes</span>
              <input
                v-model.number="store.form.multasPendentes"
                type="number"
                min="0"
                class="field__input"
                placeholder="0"
              />
            </label>

            <label class="field">
              <span class="field__label">Valor em multas (MT)</span>
              <input
                v-model.number="store.form.valorMultas"
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
                rows="2"
                placeholder="Detalhes adicionais…"
              />
            </label>
          </div>

          <div v-if="store.erro" class="form-error">
            <q-icon name="error" size="18px" />
            {{ store.erro }}
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
              :label="store.modoEdicao ? 'Guardar' : 'Registar'"
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
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  useChefeVeiculosCriticosStore,
  type VeiculoCritico,
} from '@/stores/chefe/chefe-VeiculosCriticosStore'
import { veiculosCriticosService } from '@/services/chefe/veiculos-criticos.service'

const store = useChefeVeiculosCriticosStore()
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

  if (store.kpis.urgentes > 0) {
    lista.push({
      tipo: 'critico',
      icon: 'warning',
      titulo: `${store.kpis.urgentes} veículo${store.kpis.urgentes === 1 ? '' : 's'} com prioridade URGENTE`,
      descricao: 'Requer intervenção imediata',
    })
  }

  if (store.kpis.hotlist > 0) {
    lista.push({
      tipo: 'critico',
      icon: 'local_police',
      titulo: `${store.kpis.hotlist} veículo${store.kpis.hotlist === 1 ? '' : 's'} na Hotlist PRM`,
      descricao: 'Contacte o PRM para instruções',
    })
  }

  return lista
})

// ============================================================
// Filtros rápidos
// ============================================================
function filtrarPor(valor: 'total' | 'Hotlist PRM' | 'Seguro expirado' | 'Em averiguação') {
  store.limparFiltros()
  if (valor === 'total') return
  if (valor === 'Em averiguação') {
    store.filtroEstado = valor
    return
  }
  store.filtroMotivo = valor
}

// ============================================================
// Ações
// ============================================================
function editar(v: VeiculoCritico | null) {
  if (!v) return
  store.modalDetalhes = false
  store.abrirEditar(v)
}

function abaterHotlist(v: VeiculoCritico) {
  $q.dialog({
    title: 'Abater hotlist',
    message: `Abater a hotlist do veículo ${v.matricula}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Abater', color: 'positive' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.abaterHotlist(v.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Hotlist de ${v.matricula} abatida`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

function regularizarSeguro(v: VeiculoCritico) {
  $q.dialog({
    title: 'Regularizar seguro',
    message: `Marcar o seguro do veículo ${v.matricula} como regularizado?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Regularizar', color: 'positive' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.regularizarSeguro(v.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Seguro de ${v.matricula} regularizado`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

function pedirRemover(v: VeiculoCritico) {
  $q.dialog({
    title: 'Remover veículo',
    message: `Remover permanentemente o veículo ${v.matricula}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(v.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Veículo ${v.matricula} removido`,
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
      ? 'Veículo actualizado'
      : 'Veículo registado com sucesso',
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
      motivo?: string
      prioridade?: string
      estado?: string
      posto?: string
    } = {}
    if (store.filtroMotivo) filtros.motivo = store.filtroMotivo
    if (store.filtroPrioridade) filtros.prioridade = store.filtroPrioridade
    if (store.filtroEstado) filtros.estado = store.filtroEstado
    if (store.filtroPosto) filtros.posto = store.filtroPosto

    const blob = await veiculosCriticosService.exportarXlsx(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chefe-veiculos-criticos-${new Date().toISOString().slice(0, 10)}.xlsx`
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
      motivo?: string
      prioridade?: string
      estado?: string
      posto?: string
    } = {}
    if (store.filtroMotivo) filtros.motivo = store.filtroMotivo
    if (store.filtroPrioridade) filtros.prioridade = store.filtroPrioridade
    if (store.filtroEstado) filtros.estado = store.filtroEstado
    if (store.filtroPosto) filtros.posto = store.filtroPosto

    const blob = await veiculosCriticosService.exportarPdf(filtros)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chefe-veiculos-criticos-${new Date().toISOString().slice(0, 10)}.pdf`
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
.vc-page {
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

.cell-veiculo {
  .placa {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px 3px 5px;
    background: #f6f8f7;
    border: 1px solid var(--sicam-line-soft);
    border-radius: 7px;
    margin-bottom: 3px;

    b {
      font-weight: 800;
      letter-spacing: 0.03em;
      font-size: 12.5px;
      color: var(--sicam-ink);
    }

    &__icon { color: var(--sicam-primary); flex-shrink: 0; }
  }

  small {
    display: block;
    font-size: 11px;
    color: var(--sicam-muted);
    margin-top: 2px;
  }
}

.cell-proprietario {
  b { display: block; font-size: 13px; font-weight: 700; color: var(--sicam-ink); }
  small { display: block; font-size: 11px; color: var(--sicam-muted); margin-top: 2px; }
}

.cell-multas {
  b { display: block; font-size: 14px; font-weight: 700; color: var(--sicam-ink); }
  small { display: block; font-size: 11px; color: var(--sicam-muted); margin-top: 2px; }
}

/* ============================================================ */
/* Chip de motivo                                               */
/* ============================================================ */
.motivo {
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

  &--hotlist  { background: #fce7f3; color: #be185d; border-color: rgba(190, 24, 93, 0.15); }
  &--seguro   { background: #fef3c7; color: #a16207; border-color: rgba(161, 98, 7, 0.15); }
  &--inspecao { background: #dbeafe; color: #1e40af; border-color: rgba(30, 64, 175, 0.15); }
  &--multas   { background: #fed7aa; color: #9a3412; border-color: rgba(154, 52, 18, 0.15); }
  &--doc      { background: #e0e7ff; color: #3730a3; border-color: rgba(55, 48, 163, 0.15); }
  &--roubo    { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); border-color: rgba(239, 68, 68, 0.22); }
  &--clonagem { background: #f3e8ff; color: #7c3aed; border-color: rgba(124, 58, 237, 0.15); }
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
    &--info    { background: #dbeafe; color: #2563eb; }
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

  .modal-motivo { font-size: 12px; }
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
/* Histórico                                                    */
/* ============================================================ */
.historico {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;

  &__item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--sicam-primary);
    flex-shrink: 0;
    margin-top: 5px;
  }

  &__body {
    flex: 1;

    b {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: var(--sicam-ink);
    }

    small {
      display: block;
      font-size: 11px;
      color: var(--sicam-muted);
      margin-top: 2px;
    }
  }

  &__empty {
    font-size: 13px;
    color: var(--sicam-muted);
    text-align: center;
    padding: 12px 0;
  }
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
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  }
}

/* ============================================================ */
/* Responsivo                                                   */
/* ============================================================ */
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