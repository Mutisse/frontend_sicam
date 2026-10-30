<template>
  <q-page class="mt-page">
    <!-- SKELETON -->
    <div v-if="!store.carregado" class="mt-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-kpis">
        <div v-for="i in 4" :key="`sk-kpi-${i}`" class="sk-kpi" />
      </div>
      <div class="sk-filters">
        <div class="sk-search" />
        <div v-for="i in 3" :key="`sk-sel-${i}`" class="sk-select" />
      </div>
      <div class="sk-table">
        <div v-for="i in 6" :key="`sk-row-${i}`" class="sk-row" />
      </div>
    </div>

    <!-- CONTEÚDO -->
    <template v-else>
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Multas</h1>
          <p class="page-head__sub">
            Registo de infrações, valores e estados de pagamento
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
        </div>
      </header>

      <!-- ERRO -->
      <div v-if="store.erro" class="form-error">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

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
            <q-icon name="receipt_long" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Total</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Paga')">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="payments" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.pagas }}</div>
            <div class="kpi__label">Pagas</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Pendente')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="hourglass_top" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.pendentes }}</div>
            <div class="kpi__label">Pendentes</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Contestada')">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="gavel" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.contestadas }}</div>
            <div class="kpi__label">Contestadas</div>
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
            placeholder="Pesquisar por matrícula, código, local…"
          />
        </div>

        <select v-model="store.filtroEstado" class="filter filter__select">
          <option value="">Todos os estados</option>
          <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
        </select>

        <select v-model="store.filtroInfracao" class="filter filter__select">
          <option value="">Todas as infrações</option>
          <option v-for="t in store.TIPOS_INFRACAO" :key="t" :value="t">
            {{ t }}
          </option>
        </select>

        <select v-model="store.filtroAgente" class="filter filter__select">
          <option value="">Todos os agentes</option>
          <option v-for="a in store.AGENTES" :key="a" :value="a">{{ a }}</option>
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
              <th>Matrícula</th>
              <th>Infração</th>
              <th>Agente</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Estado</th>
              <th class="data-table__th-actions">Acções</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in store.paginados"
              :key="m.id"
              class="data-table__row"
              @click="store.abrirDetalhes(m)"
            >
              <td class="cell-codigo"><b>{{ m.codigo }}</b></td>
              <td>
                <div class="placa">
                  <q-icon
                    name="directions_car"
                    size="14px"
                    class="placa__icon"
                  />
                  <b>{{ m.matricula }}</b>
                </div>
              </td>
              <td class="cell-infracao">{{ m.infracao }}</td>
              <td class="cell-muted">{{ m.agente }}</td>
              <td class="table-time">{{ m.data }}</td>
              <td class="cell-valor">{{ store.formatarMoeda(m.valor) }}</td>
              <td>
                <span
                  class="badge"
                  :class="`badge--${store.estadoClasse(m.estado)}`"
                >
                  {{ m.estado }}
                </span>
              </td>
              <td class="data-table__actions" @click.stop>
                <div class="actions-group">
                  <button
                    class="row-action"
                    title="Ver detalhes"
                    @click="store.abrirDetalhes(m)"
                  >
                    <q-icon name="visibility" size="17px" />
                  </button>

                  <button
                    v-if="m.estado === 'Pendente'"
                    class="row-action row-action--warning"
                    title="Contestar"
                    @click="pedirContestar(m)"
                  >
                    <q-icon name="gavel" size="17px" />
                  </button>

                  <button
                    class="row-action"
                    :disabled="m.estado !== 'Paga'"
                    :title="
                      m.estado === 'Paga'
                        ? 'Baixar recibo PDF'
                        : 'Só para multas pagas'
                    "
                    @click="baixarRecibo(m)"
                  >
                    <q-icon name="picture_as_pdf" size="17px" />
                  </button>

                  <button
                    class="row-action row-action--danger"
                    title="Remover"
                    @click="pedirRemover(m)"
                  >
                    <q-icon name="delete" size="17px" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!store.paginados.length">
              <td colspan="8" class="data-table__empty">
                <q-icon
                  name="receipt_long"
                  size="40px"
                  class="data-table__empty-icon"
                />
                <p>Nenhuma multa encontrada com estes filtros.</p>
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
            A mostrar <b>{{ store.inicioPagina + 1 }}–{{ store.fimPagina }}</b> de
            <b>{{ store.filtrados.length }}</b>
            <span class="pagination__per"
              >· {{ store.POR_PAGINA }} por página</span
            >
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

      <!-- MODAL — DETALHES -->
      <q-dialog v-model="store.modalDetalhes" persistent>
        <q-card v-if="store.multaSelecionada" class="modal-card">
          <q-card-section class="modal-head">
            <div class="modal-head__left">
              <div
                class="modal-head__icon"
                :class="`modal-head__icon--${store.estadoClasse(
                  store.multaSelecionada.estado,
                )}`"
              >
                <q-icon name="receipt_long" size="24px" />
              </div>
              <div>
                <div class="modal-head__title">
                  {{ store.multaSelecionada.codigo }}
                </div>
                <div class="modal-head__sub">Detalhes da multa</div>
              </div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="store.modalDetalhes = false"
            />
          </q-card-section>

          <q-card-section class="modal-estado">
            <span
              class="badge badge--lg"
              :class="`badge--${store.estadoClasse(
                store.multaSelecionada.estado,
              )}`"
            >
              {{ store.multaSelecionada.estado }}
            </span>
          </q-card-section>

          <q-card-section class="modal-grid">
            <div class="modal-field">
              <div class="modal-field__label">Matrícula</div>
              <div class="modal-field__value">
                <q-icon
                  name="directions_car"
                  size="16px"
                  class="modal-field__icon"
                />
                {{ store.multaSelecionada.matricula }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Valor</div>
              <div class="modal-field__value modal-field__value--big">
                {{ store.formatarMoeda(store.multaSelecionada.valor) }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Infração</div>
              <div class="modal-field__value">
                {{ store.multaSelecionada.infracao }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Data</div>
              <div class="modal-field__value">
                {{ store.multaSelecionada.data }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Agente</div>
              <div class="modal-field__value">
                {{ store.multaSelecionada.agente }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Posto</div>
              <div class="modal-field__value">
                {{ store.multaSelecionada.posto }}
              </div>
            </div>

            <div class="modal-field modal-field--full">
              <div class="modal-field__label">Local</div>
              <div class="modal-field__value">
                {{ store.multaSelecionada.local }}
              </div>
            </div>

            <div
              v-if="store.multaSelecionada.dataPagamento"
              class="modal-field modal-field--full"
            >
              <div class="modal-field__label">Pago em</div>
              <div class="modal-field__value">
                {{ store.multaSelecionada.dataPagamento }}
              </div>
            </div>
          </q-card-section>

          <q-card-section
            v-if="store.multaSelecionada.estado === 'Pendente'"
            class="modal-aviso"
          >
            <q-icon name="info" size="18px" />
            <span
              >Esta multa está pendente. Efectue o pagamento dentro do prazo
              para evitar coimas adicionais.</span
            >
          </q-card-section>

          <q-card-section
            v-else-if="store.multaSelecionada.estado === 'Paga'"
            class="modal-aviso modal-aviso--success"
          >
            <q-icon name="check_circle" size="18px" />
            <span>Multa paga. Pode baixar o comprovativo em PDF.</span>
          </q-card-section>

          <q-card-section
            v-else-if="store.multaSelecionada.estado === 'Contestada'"
            class="modal-aviso modal-aviso--warning"
          >
            <q-icon name="gavel" size="18px" />
            <span>Multa em processo de contestação. Aguarda resolução.</span>
          </q-card-section>

          <q-card-actions class="modal-actions">
            <q-btn flat label="Fechar" @click="store.modalDetalhes = false" />

            <q-btn
              v-if="store.multaSelecionada.estado === 'Pendente'"
              unelevated
              label="Efectuar pagamento"
              icon="payments"
              color="primary"
              @click="store.abrirPagamento"
            />

            <q-btn
              v-else-if="store.multaSelecionada.estado === 'Paga'"
              unelevated
              label="Baixar recibo PDF"
              icon="picture_as_pdf"
              color="primary"
              @click="baixarRecibo(store.multaSelecionada)"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- MODAL — PAGAMENTO -->
      <q-dialog v-model="store.modalPagamento" persistent>
        <q-card
          v-if="store.multaSelecionada"
          class="modal-card modal-card--wide"
        >
          <q-card-section class="modal-head">
            <div class="modal-head__left">
              <div class="modal-head__icon modal-head__icon--primary">
                <q-icon name="payments" size="24px" />
              </div>
              <div>
                <div class="modal-head__title">Efectuar pagamento</div>
                <div class="modal-head__sub">
                  {{ store.multaSelecionada.codigo }} ·
                  {{ store.multaSelecionada.matricula }}
                </div>
              </div>
            </div>
            <q-btn flat round dense icon="close" @click="store.fecharPagamento" />
          </q-card-section>

          <q-stepper
            v-model="store.step"
            vertical
            color="primary"
            animated
            class="stepper"
          >
            <q-step
              :name="1"
              title="Confirmar dados"
              icon="fact_check"
              :done="store.step > 1"
            >
              <div class="step-content">
                <p class="step-desc">
                  Confirme os dados da multa antes de continuar.
                </p>

                <div class="step-info-grid">
                  <div class="step-info">
                    <span class="step-info__label">Código</span>
                    <span class="step-info__value">{{
                      store.multaSelecionada.codigo
                    }}</span>
                  </div>
                  <div class="step-info">
                    <span class="step-info__label">Matrícula</span>
                    <span class="step-info__value">{{
                      store.multaSelecionada.matricula
                    }}</span>
                  </div>
                  <div class="step-info">
                    <span class="step-info__label">Infração</span>
                    <span class="step-info__value">{{
                      store.multaSelecionada.infracao
                    }}</span>
                  </div>
                  <div class="step-info">
                    <span class="step-info__label">Data</span>
                    <span class="step-info__value">{{
                      store.multaSelecionada.data
                    }}</span>
                  </div>
                  <div class="step-info">
                    <span class="step-info__label">Agente</span>
                    <span class="step-info__value">{{
                      store.multaSelecionada.agente
                    }}</span>
                  </div>
                  <div class="step-info">
                    <span class="step-info__label">Valor</span>
                    <span class="step-info__value step-info__value--big">
                      {{ store.formatarMoeda(store.multaSelecionada.valor) }}
                    </span>
                  </div>
                </div>
              </div>

              <q-stepper-navigation>
                <q-btn
                  color="primary"
                  label="Continuar"
                  icon-right="arrow_forward"
                  @click="store.step = 2"
                />
              </q-stepper-navigation>
            </q-step>

            <q-step
              :name="2"
              title="Método de pagamento"
              icon="credit_card"
              :done="store.step > 2"
            >
              <div class="step-content">
                <div class="step-section">
                  <div class="pagamento-label">Método de pagamento</div>
                  <div class="metodos">
                    <button
                      v-for="met in store.METODOS_PAGAMENTO"
                      :key="met"
                      class="metodo"
                      :class="{
                        'metodo--active': store.metodoSelecionado === met,
                      }"
                      @click="store.metodoSelecionado = met"
                    >
                      <q-icon :name="iconeMetodo(met)" size="22px" />
                      <span>{{ met }}</span>
                    </button>
                  </div>
                </div>

                <div
                  v-if="
                    store.metodoSelecionado === 'M-Pesa' ||
                    store.metodoSelecionado === 'Transferência'
                  "
                  class="step-section"
                >
                  <div class="pagamento-label">
                    {{
                      store.metodoSelecionado === 'M-Pesa'
                        ? 'Número M-Pesa'
                        : 'IBAN'
                    }}
                  </div>
                  <input
                    v-model="store.referencia"
                    type="text"
                    class="pagamento-input"
                    :placeholder="
                      store.metodoSelecionado === 'M-Pesa'
                        ? 'Ex.: 84 123 4567'
                        : 'Ex.: MZ59 0000 0000 0000 0000'
                    "
                  />
                </div>

                <div class="step-section">
                  <div class="pagamento-label">Nome do pagador</div>
                  <input
                    v-model="store.nomePagador"
                    type="text"
                    class="pagamento-input"
                    placeholder="Ex.: João Manuel Chissano"
                  />
                </div>
              </div>

              <q-stepper-navigation>
                <q-btn
                  color="primary"
                  label="Continuar"
                  icon-right="arrow_forward"
                  :disable="!store.podeAvancarStep2"
                  @click="store.step = 3"
                />
                <q-btn flat label="Voltar" @click="store.step = 1" />
              </q-stepper-navigation>
            </q-step>

            <q-step :name="3" title="Confirmação" icon="check_circle">
              <div class="step-content">
                <p class="step-desc">
                  Reveja os dados do pagamento antes de confirmar.
                </p>

                <div class="step-resumo">
                  <div class="step-resumo__linha">
                    <span>Código da multa</span>
                    <b>{{ store.multaSelecionada.codigo }}</b>
                  </div>
                  <div class="step-resumo__linha">
                    <span>Matrícula</span>
                    <b>{{ store.multaSelecionada.matricula }}</b>
                  </div>
                  <div class="step-resumo__linha">
                    <span>Método</span>
                    <b>{{ store.metodoSelecionado }}</b>
                  </div>
                  <div v-if="store.referencia" class="step-resumo__linha">
                    <span>Referência</span>
                    <b>{{ store.referencia }}</b>
                  </div>
                  <div class="step-resumo__linha">
                    <span>Pagador</span>
                    <b>{{ store.nomePagador }}</b>
                  </div>
                  <div
                    class="step-resumo__linha step-resumo__linha--total"
                  >
                    <span>Total a pagar</span>
                    <b>{{
                      store.formatarMoeda(store.multaSelecionada.valor)
                    }}</b>
                  </div>
                </div>
              </div>

              <q-stepper-navigation>
                <q-btn
                  color="primary"
                  label="Confirmar pagamento"
                  icon="check"
                  :loading="store.aProcessar"
                  @click="confirmarPagamento"
                />
                <q-btn flat label="Voltar" @click="store.step = 2" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card>
      </q-dialog>

      <!-- MODAL — RECIBO -->
      <q-dialog v-model="store.modalRecibo" persistent>
        <q-card
          v-if="store.recibo"
          class="modal-card modal-card--wide recibo"
        >
          <q-card-section class="recibo__head">
            <div class="recibo__head-icon">
              <q-icon name="check_circle" size="34px" />
            </div>
            <h2 class="recibo__head-title">Recibo gerado com sucesso</h2>
            <p class="recibo__head-sub">
              Pode baixar em PDF ou fechar esta janela.
            </p>
          </q-card-section>

          <q-card-section class="recibo__body">
            <div class="recibo__doc-head">
              <div class="recibo__doc-brand">
                <div class="recibo__doc-logo">SICAM</div>
                <div>
                  <div class="recibo__doc-title">GESTMUL</div>
                  <div class="recibo__doc-sub">
                    Recibo de pagamento de multa
                  </div>
                </div>
              </div>
              <div class="recibo__doc-num">
                <div class="recibo__doc-num-label">Recibo</div>
                <div class="recibo__doc-num-value">
                  {{ store.recibo.numero }}
                </div>
              </div>
            </div>

            <div class="recibo__info-grid">
              <div class="recibo__info">
                <span class="recibo__info-label">Data</span>
                <span class="recibo__info-value">{{ store.recibo.data }}</span>
              </div>
              <div class="recibo__info">
                <span class="recibo__info-label">Hora</span>
                <span class="recibo__info-value">{{ store.recibo.hora }}</span>
              </div>
              <div class="recibo__info">
                <span class="recibo__info-label">Código da multa</span>
                <span class="recibo__info-value">{{
                  store.recibo.multaCodigo
                }}</span>
              </div>
              <div class="recibo__info">
                <span class="recibo__info-label">Matrícula</span>
                <span class="recibo__info-value">{{
                  store.recibo.matricula
                }}</span>
              </div>
              <div class="recibo__info">
                <span class="recibo__info-label">Infração</span>
                <span class="recibo__info-value">{{
                  store.recibo.infracao
                }}</span>
              </div>
              <div class="recibo__info">
                <span class="recibo__info-label">Método</span>
                <span class="recibo__info-value">{{
                  store.recibo.metodo
                }}</span>
              </div>
              <div class="recibo__info">
                <span class="recibo__info-label">Pagador</span>
                <span class="recibo__info-value">{{
                  store.recibo.pagador
                }}</span>
              </div>
              <div v-if="store.recibo.referencia" class="recibo__info">
                <span class="recibo__info-label">Referência</span>
                <span class="recibo__info-value">{{
                  store.recibo.referencia
                }}</span>
              </div>
            </div>

            <div class="recibo__total">
              <span class="recibo__total-label">Total pago</span>
              <span class="recibo__total-value">{{
                store.formatarMoeda(store.recibo.valor)
              }}</span>
            </div>

            <p class="recibo__foot">
              Este documento serve como comprovativo oficial de pagamento.<br />
              Guarde-o por pelo menos 1 ano.
            </p>
          </q-card-section>

          <q-card-actions class="modal-actions">
            <q-btn flat label="Fechar" @click="store.fecharRecibo" />
            <q-btn
              unelevated
              label="Baixar recibo PDF"
              icon="picture_as_pdf"
              color="primary"
              @click="baixarReciboDoPagamento"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  useGestmulMultasStore,
  type Multa,
  type MetodoPagamento,
} from '@/stores/gestmul/gestmul-MultasStore'
import { multasService } from '@/services/gestmul/multas.service'

const store = useGestmulMultasStore()
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

  if (store.kpis.pendentes > 0) {
    lista.push({
      tipo: 'atencao',
      icon: 'hourglass_top',
      titulo: `${store.kpis.pendentes} multa${
        store.kpis.pendentes === 1 ? '' : 's'
      } pendente${store.kpis.pendentes === 1 ? '' : 's'}`,
      descricao: `Valor pendente: ${store.formatarMoeda(
        store.kpis.valorPendente,
      )}`,
    })
  }

  if (store.kpis.contestadas > 0) {
    lista.push({
      tipo: 'critico',
      icon: 'gavel',
      titulo: `${store.kpis.contestadas} multa${
        store.kpis.contestadas === 1 ? '' : 's'
      } em contestação`,
      descricao: 'Aguarda decisão judicial',
    })
  }

  return lista
})

// ============================================================
// Filtros rápidos
// ============================================================
function filtrarPor(valor: 'total' | 'Paga' | 'Pendente' | 'Contestada') {
  store.limparFiltros()
  if (valor === 'total') return
  store.filtroEstado = valor
}

// ============================================================
// Ícone do método
// ============================================================
function iconeMetodo(m: MetodoPagamento): string {
  if (m === 'Dinheiro') return 'payments'
  if (m === 'M-Pesa') return 'smartphone'
  if (m === 'Transferência') return 'account_balance'
  return 'credit_card'
}

// ============================================================
// Ações de estado
// ============================================================
function pedirContestar(m: Multa) {
  $q.dialog({
    title: 'Contestar multa',
    message: `Marcar a multa ${m.codigo} como contestada?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Contestar', color: 'warning' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.contestar(m.id)
    if (ok) {
      $q.notify({
        type: 'warning',
        message: `Multa ${m.codigo} contestada`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

function pedirRemover(m: Multa) {
  $q.dialog({
    title: 'Remover multa',
    message: `Remover permanentemente ${m.codigo} (${m.matricula})?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(m.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Multa ${m.codigo} removida`,
        position: 'top',
      })
    }
  })
}

// ============================================================
// Confirmar pagamento
// ============================================================
async function confirmarPagamento() {
  const ok = await store.confirmarPagamento()
  if (ok) {
    $q.notify({
      type: 'positive',
      message: 'Pagamento confirmado.',
      position: 'top',
    })
  } else if (store.erro) {
    $q.notify({ type: 'negative', message: store.erro, position: 'top' })
  }
}

// ============================================================
// Recibo
// ============================================================
async function baixarRecibo(m: Multa) {
  if (m.estado !== 'Paga') {
    $q.notify({
      type: 'negative',
      message: 'Apenas multas pagas têm recibo.',
      position: 'top',
    })
    return
  }

  const ok = await store.baixarReciboPdf(m)
  if (ok) {
    $q.notify({
      type: 'positive',
      message: 'Recibo PDF descarregado.',
      position: 'top',
    })
  } else if (store.erro) {
    $q.notify({ type: 'negative', message: store.erro, position: 'top' })
  }
}

async function baixarReciboDoPagamento() {
  if (!store.recibo) return

  // Encontra a multa correspondente para obter o ID
  const m = store.multas.find((x) => x.codigo === store.recibo?.multaCodigo)
  if (!m) return

  const ok = await store.baixarReciboPdf(m)
  if (ok) {
    $q.notify({
      type: 'positive',
      message: 'Recibo PDF descarregado.',
      position: 'top',
    })
  }
}

// ============================================================
// Exportar Excel (XLSX via backend)
// ============================================================
async function exportarExcel() {
  try {
    const blob = await multasService.exportarXlsx()

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gestmul-multas-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`
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

.mt-skeleton {
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
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 450px) {
    grid-template-columns: 1fr;
  }
}

.sk-kpi {
  @extend %sk-block;
  height: 76px;
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
}

.sk-select {
  @extend %sk-block;
  width: 170px;
  height: 44px;
}

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
  @extend %sk-block;
  height: 42px;
  border-radius: 8px;
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
.mt-page {
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
  }
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
      opacity: 0.5;
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
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

/* ============================================================ */
/* Alertas                                                      */
/* ============================================================ */
.alertas {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.alerta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;

  &__icon {
    flex-shrink: 0;
  }
  &__body {
    flex: 1;
    min-width: 0;
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
  }

  &--critico {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }
  &--atencao {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
  }
}

/* ============================================================ */
/* KPIs                                                         */
/* ============================================================ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;

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
  border: 0;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.1s, box-shadow 0.15s;

  &:active {
    transform: scale(0.98);
  }
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
    &--critical {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
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

/* ============================================================ */
/* Filtros                                                      */
/* ============================================================ */
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
    min-width: 160px;

    &:focus {
      outline: 0;
    }
  }
}

/* ============================================================ */
/* Tabela                                                       */
/* ============================================================ */
.table-wrap {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--sicam-line-soft);
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;

  thead {
    background: linear-gradient(180deg, #f8faf9 0%, #f1f4f2 100%);
  }

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

    &:first-child {
      padding-left: 20px;
    }
    &:last-child {
      padding-right: 20px;
      text-align: right;
    }
  }

  td {
    padding: 14px;
    font-size: 13.5px;
    color: var(--sicam-ink);
    border-bottom: 1px solid var(--sicam-line-soft);
    vertical-align: middle;
    transition: background 0.12s ease;
    white-space: nowrap;

    &:first-child {
      padding-left: 20px;
    }
    &:last-child {
      padding-right: 20px;
    }
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
  tbody tr:nth-child(even) td {
    background: #fcfdfd;
  }

  &__row {
    cursor: pointer;

    &:hover td {
      background: #f0fdf9;
    }
    &:hover td:first-child {
      box-shadow: inset 3px 0 0 var(--sicam-primary-light);
    }
  }

  &__th-actions {
    text-align: right;
    width: 180px;
  }
  &__actions {
    text-align: right;
    white-space: nowrap;
    width: 180px;
  }

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

    p {
      margin: 0 0 18px;
      font-size: 14px;
      color: var(--sicam-muted);
    }
  }
}

.cell-muted {
  color: var(--sicam-muted);
  font-size: 13px;
  white-space: nowrap;
}
.cell-infracao {
  color: var(--sicam-ink-soft);
  font-size: 13px;
}
.cell-valor {
  font-weight: 700;
  color: var(--sicam-ink);
  white-space: nowrap;
}
.table-time {
  color: var(--sicam-muted);
  font-size: 13px;
  white-space: nowrap;
}

.cell-codigo {
  b {
    display: inline-block;
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.01em;
    color: var(--sicam-ink);
    background: #f6f8f7;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid var(--sicam-line-soft);
    white-space: nowrap;
  }
}

.placa {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px 3px 5px;
  background: #f6f8f7;
  border: 1px solid var(--sicam-line-soft);
  border-radius: 7px;

  b {
    font-weight: 800;
    letter-spacing: 0.03em;
    font-size: 12.5px;
    color: var(--sicam-ink);
    white-space: nowrap;
  }

  &__icon {
    color: var(--sicam-primary);
    flex-shrink: 0;
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

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6);
  }

  &--lg {
    padding: 6px 14px;
    font-size: 13px;
  }

  &--regular {
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
    border-color: rgba(16, 185, 129, 0.18);
  }
  &--atencao {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
    border-color: rgba(245, 158, 11, 0.22);
  }
  &--critico {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
    border-color: rgba(239, 68, 68, 0.22);
  }
  &--info {
    background: #dbeafe;
    color: #2563eb;
    border-color: rgba(59, 130, 246, 0.22);
  }
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

  &:hover:not(:disabled) {
    background: var(--sicam-surface-hover);
    border-color: var(--sicam-line);
    color: var(--sicam-ink);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &--success:hover:not(:disabled) {
    background: var(--sicam-success-bg);
    border-color: rgba(16, 185, 129, 0.3);
    color: var(--sicam-success-ink);
  }

  &--warning:hover:not(:disabled) {
    background: var(--sicam-warning-bg);
    border-color: rgba(245, 158, 11, 0.3);
    color: var(--sicam-warning-ink);
  }

  &--danger:hover:not(:disabled) {
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
    b {
      color: var(--sicam-ink);
      font-weight: 700;
    }
  }

  &__per {
    color: var(--sicam-line-strong);
    margin-left: 6px;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

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
    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
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

    b {
      color: var(--sicam-ink);
      font-weight: 700;
    }
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

  &--wide {
    min-width: 600px;
  }
  @media (max-width: 700px) {
    min-width: 90vw;
  }
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
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

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
    &--info {
      background: #dbeafe;
      color: #2563eb;
    }
    &--primary {
      background: var(--sicam-primary-bg);
      color: var(--sicam-primary);
    }
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--sicam-ink);
  }
  &__sub {
    font-size: 12px;
    color: var(--sicam-muted);
    margin-top: 2px;
  }
}

.modal-estado {
  display: flex;
  justify-content: center;
  padding: 12px 20px 0;
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
}

.modal-field {
  &--full {
    grid-column: 1 / -1;
  }

  &__label {
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    margin-bottom: 4px;
  }

  &__value {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);

    &--big {
      font-size: 20px;
      font-weight: 700;
      color: var(--sicam-primary);
    }
  }

  &__icon {
    color: var(--sicam-muted);
  }
}

.modal-aviso {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 20px 20px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--sicam-muted);

  .q-icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--sicam-primary);
  }

  &--success {
    color: var(--sicam-success-ink);
    .q-icon {
      color: var(--sicam-success);
    }
  }

  &--warning {
    color: var(--sicam-warning-ink);
    .q-icon {
      color: var(--sicam-warning);
    }
  }
}

.modal-actions {
  padding: 12px 20px 20px !important;
  justify-content: space-between !important;
  gap: 10px;
}

/* ============================================================ */
/* Stepper                                                      */
/* ============================================================ */
.stepper {
  box-shadow: none !important;
  background: transparent !important;

  :deep(.q-stepper__title) {
    font-weight: 700;
    color: var(--sicam-ink);
  }
  :deep(.q-stepper__caption) {
    color: var(--sicam-muted);
    font-size: 12px;
  }
  :deep(.q-stepper__dot) {
    background: var(--sicam-primary);
  }
}

.step-content {
  padding: 8px 0;
}

.step-desc {
  font-size: 13px;
  color: var(--sicam-muted);
  margin: 0 0 16px;
  line-height: 1.5;
}

.step-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.step-info {
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
  background: var(--sicam-surface-alt);
  border-radius: 10px;

  &__label {
    font-size: 10px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    margin-bottom: 3px;
  }

  &__value {
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);

    &--big {
      font-size: 18px;
      font-weight: 700;
      color: var(--sicam-primary);
    }
  }
}

.step-section {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}

.pagamento-label {
  font-size: 12px;
  color: var(--sicam-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  margin-bottom: 10px;
}

.metodos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.metodo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: var(--sicam-surface-alt);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--sicam-ink);
  transition: all 0.15s;

  .q-icon {
    color: var(--sicam-muted);
  }

  &:hover {
    background: var(--sicam-surface-hover);
  }

  &--active {
    border-color: var(--sicam-primary-light);
    background: #ecfdf5;
    color: var(--sicam-primary);

    .q-icon {
      color: var(--sicam-primary);
    }
  }
}

.pagamento-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--sicam-line);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: var(--sicam-ink);
  background: #fff;

  &:focus {
    outline: 0;
    border-color: var(--sicam-primary-light);
  }
  &::placeholder {
    color: var(--sicam-muted);
  }
}

.step-resumo {
  background: var(--sicam-surface-alt);
  border-radius: 12px;
  overflow: hidden;

  &__linha {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    font-size: 13px;
    border-bottom: 1px solid var(--sicam-line-soft);

    &:last-child {
      border-bottom: 0;
    }

    span {
      color: var(--sicam-muted);
    }
    b {
      color: var(--sicam-ink);
      font-weight: 600;
    }

    &--total {
      padding-top: 16px;
      padding-bottom: 16px;
      background: #ecfdf5;

      span {
        color: var(--sicam-primary);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-size: 12px;
      }
      b {
        font-size: 20px;
        color: var(--sicam-primary);
      }
    }
  }
}

/* ============================================================ */
/* Recibo                                                       */
/* ============================================================ */
.recibo {
  overflow: hidden;

  &__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 28px 20px 20px;
    background: linear-gradient(155deg, #065f46 0%, #0b4a38 100%);
    color: #fff;
  }

  &__head-icon {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
    display: grid;
    place-items: center;
    margin-bottom: 12px;
  }

  &__head-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 4px;
  }
  &__head-sub {
    font-size: 13px;
    opacity: 0.85;
    margin: 0;
  }

  &__body {
    padding: 20px 24px;
    background: #fff;
  }

  &__doc-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--sicam-line);
    margin-bottom: 20px;
  }

  &__doc-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__doc-logo {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: #065f46;
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
  }

  &__doc-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--sicam-primary);
    margin-bottom: 2px;
  }
  &__doc-sub {
    font-size: 12px;
    color: var(--sicam-muted);
  }

  &__doc-num {
    text-align: right;
  }

  &__doc-num-label {
    font-size: 10px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
  }

  &__doc-num-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--sicam-ink);
  }

  &__info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin-bottom: 20px;

    @media (max-width: 500px) {
      grid-template-columns: 1fr;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;

    &-label {
      font-size: 10px;
      color: var(--sicam-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
      margin-bottom: 3px;
    }

    &-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--sicam-ink);
    }
  }

  &__total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #ecfdf5;
    border-radius: 12px;
    margin-bottom: 20px;
  }

  &__total-label {
    font-size: 12px;
    color: var(--sicam-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
  }

  &__total-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--sicam-primary);
    line-height: 1;
  }

  &__foot {
    font-size: 11px;
    color: var(--sicam-muted);
    text-align: center;
    line-height: 1.6;
    margin: 0;
    padding-top: 12px;
    border-top: 1px dashed var(--sicam-line);
  }
}
</style>