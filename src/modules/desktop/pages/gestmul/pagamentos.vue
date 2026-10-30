<template>
  <q-page class="pg-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="pg-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-kpis">
        <div v-for="i in 4" :key="`sk-kpi-${i}`" class="sk-kpi" />
      </div>
      <div class="sk-filters">
        <div class="sk-search" />
        <div v-for="i in 2" :key="`sk-sel-${i}`" class="sk-select" />
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
          <h1 class="page-head__title">Pagamentos</h1>
          <p class="page-head__sub">
            Recepção e cobrança de multas de trânsito
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
          <button class="page-btn page-btn--primary" @click="store.abrirNovo">
            <q-icon name="add" size="18px" />
            Registar pagamento
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
            <q-icon name="payments" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Total</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Confirmado')">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="check_circle" size="22px" />
          </div>
          <div>
            <div class="kpi__value">
              {{ store.formatarMoeda(store.kpis.valorConfirmado) }}
            </div>
            <div class="kpi__label">Cobrado</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Pendente')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="hourglass_top" size="22px" />
          </div>
          <div>
            <div class="kpi__value">
              {{ store.formatarMoeda(store.kpis.valorPendente) }}
            </div>
            <div class="kpi__label">Pendente</div>
          </div>
        </button>

        <div class="kpi kpi--static">
          <div class="kpi__icon kpi__icon--info">
            <q-icon name="receipt" size="22px" />
          </div>
          <div>
            <div class="kpi__value">
              {{ store.formatarMoeda(store.kpis.ticketMedio) }}
            </div>
            <div class="kpi__label">Ticket médio</div>
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
            placeholder="Pesquisar por matrícula, recibo, multa, pagador…"
          />
        </div>

        <select v-model="store.filtroMetodo" class="filter filter__select">
          <option value="">Todos os métodos</option>
          <option v-for="m in store.METODOS" :key="m" :value="m">
            {{ m }}
          </option>
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
              <th>Recibo</th>
              <th>Matrícula</th>
              <th>Multa</th>
              <th>Método</th>
              <th>Data</th>
              <th>Valor</th>
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
              <td class="cell-codigo"><b>{{ p.recibo }}</b></td>
              <td>
                <div class="placa">
                  <q-icon
                    name="directions_car"
                    size="14px"
                    class="placa__icon"
                  />
                  <b>{{ p.matricula }}</b>
                </div>
              </td>
              <td class="cell-multa">{{ p.multaCodigo }}</td>
              <td>
                <span
                  class="metodo"
                  :class="`metodo--${store.metodoClasse(p.metodo)}`"
                >
                  <q-icon :name="store.metodoIcone(p.metodo)" size="13px" />
                  {{ p.metodo }}
                </span>
              </td>
              <td class="table-time">{{ p.data }}</td>
              <td class="cell-valor">{{ store.formatarMoeda(p.valor) }}</td>
              <td>
                <span
                  class="badge"
                  :class="`badge--${store.estadoClasse(p.estado)}`"
                >
                  {{ p.estado }}
                </span>
              </td>
              <td class="data-table__actions" @click.stop>
                <div class="actions-group">
                  <button
                    class="row-action"
                    title="Ver detalhes"
                    @click="store.abrirDetalhes(p)"
                  >
                    <q-icon name="visibility" size="17px" />
                  </button>

                  <button
                    class="row-action"
                    title="Baixar recibo PDF"
                    @click="baixarRecibo(p)"
                  >
                    <q-icon name="picture_as_pdf" size="17px" />
                  </button>

                  <button
                    v-if="p.estado === 'Pendente'"
                    class="row-action row-action--success"
                    title="Confirmar pagamento"
                    @click="confirmar(p)"
                  >
                    <q-icon name="check_circle" size="17px" />
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
              <td colspan="8" class="data-table__empty">
                <q-icon
                  name="payments"
                  size="40px"
                  class="data-table__empty-icon"
                />
                <p>Nenhum pagamento encontrado com estes filtros.</p>
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
      <q-dialog v-model="store.modalDetalhes">
        <q-card v-if="store.pagamentoSelecionado" class="modal-card">
          <q-card-section class="modal-head">
            <div class="modal-head__left">
              <div
                class="modal-head__icon"
                :class="`modal-head__icon--${store.estadoClasse(
                  store.pagamentoSelecionado.estado,
                )}`"
              >
                <q-icon name="payments" size="24px" />
              </div>
              <div>
                <div class="modal-head__title">
                  {{ store.pagamentoSelecionado.recibo }}
                </div>
                <div class="modal-head__sub">Detalhes do pagamento</div>
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

          <q-card-section class="modal-grid">
            <div class="modal-field">
              <div class="modal-field__label">Estado</div>
              <div class="modal-field__value">
                <span
                  class="badge"
                  :class="`badge--${store.estadoClasse(
                    store.pagamentoSelecionado.estado,
                  )}`"
                >
                  {{ store.pagamentoSelecionado.estado }}
                </span>
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Valor</div>
              <div class="modal-field__value modal-field__value--big">
                {{ store.formatarMoeda(store.pagamentoSelecionado.valor) }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Matrícula</div>
              <div class="modal-field__value">
                {{ store.pagamentoSelecionado.matricula }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Multa</div>
              <div class="modal-field__value">
                {{ store.pagamentoSelecionado.multaCodigo }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Infração</div>
              <div class="modal-field__value">
                {{ store.pagamentoSelecionado.infracao }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Método</div>
              <div class="modal-field__value">
                {{ store.pagamentoSelecionado.metodo }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Data</div>
              <div class="modal-field__value">
                {{ store.pagamentoSelecionado.data }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Pagador</div>
              <div class="modal-field__value">
                {{ store.pagamentoSelecionado.pagador }}
              </div>
            </div>

            <div
              v-if="store.pagamentoSelecionado.referencia"
              class="modal-field modal-field--full"
            >
              <div class="modal-field__label">Referência</div>
              <div class="modal-field__value">
                {{ store.pagamentoSelecionado.referencia }}
              </div>
            </div>

            <div
              v-if="store.pagamentoSelecionado.observacoes"
              class="modal-field modal-field--full"
            >
              <div class="modal-field__label">Observações</div>
              <div class="modal-field__value">
                {{ store.pagamentoSelecionado.observacoes }}
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="modal-actions">
            <q-btn flat label="Fechar" @click="store.modalDetalhes = false" />
            <div class="modal-actions__right">
              <q-btn
                flat
                label="Baixar PDF"
                icon="picture_as_pdf"
                color="primary"
                @click="baixarPdfDetalhe"
              />
              <q-btn
                v-if="store.pagamentoSelecionado.estado === 'Pendente'"
                unelevated
                label="Confirmar"
                icon="check_circle"
                color="primary"
                @click="confirmar(store.pagamentoSelecionado)"
              />
            </div>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- MODAL — REGISTAR PAGAMENTO (STEPPER) -->
      <q-dialog v-model="store.modalForm" persistent>
        <q-card class="modal-card modal-card--wide">
          <q-card-section class="modal-head">
            <div class="modal-head__left">
              <div class="modal-head__icon modal-head__icon--primary">
                <q-icon name="add_circle" size="24px" />
              </div>
              <div>
                <div class="modal-head__title">
                  {{
                    store.modoEdicao
                      ? 'Editar pagamento'
                      : 'Registar pagamento'
                  }}
                </div>
                <div class="modal-head__sub">Passo {{ store.step }} de 3</div>
              </div>
            </div>
            <q-btn flat round dense icon="close" @click="store.fecharForm" />
          </q-card-section>

          <div class="steps">
            <div
              v-for="n in 3"
              :key="n"
              class="steps__item"
              :class="{
                'steps__item--done': n < store.step,
                'steps__item--active': n === store.step,
              }"
            >
              <div class="steps__dot">
                <q-icon v-if="n < store.step" name="check" size="14px" />
                <span v-else>{{ n }}</span>
              </div>
              <div class="steps__label">
                {{
                  n === 1
                    ? 'Identificação'
                    : n === 2
                    ? 'Pagamento'
                    : 'Confirmação'
                }}
              </div>
              <div v-if="n < 3" class="steps__line" />
            </div>
          </div>

          <q-card-section class="modal-body">
            <!-- PASSO 1 -->
            <div v-if="store.step === 1" class="form-grid">
              <label class="field field--full">
                <span class="field__label">Nº do recibo <em>*</em></span>
                <input
                  v-model.trim="store.form.recibo"
                  class="field__input"
                  placeholder="RC-2026-000001"
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
                <span class="field__label">Nº da multa <em>*</em></span>
                <input
                  v-model.trim="store.form.multaCodigo"
                  class="field__input"
                  placeholder="MT-26-000123"
                />
              </label>

              <label class="field field--full">
                <span class="field__label">Infração</span>
                <input
                  v-model.trim="store.form.infracao"
                  class="field__input"
                  placeholder="Ex.: Excesso de velocidade"
                />
              </label>
            </div>

            <!-- PASSO 2 -->
            <div v-else-if="store.step === 2" class="form-grid">
              <label class="field">
                <span class="field__label">Método <em>*</em></span>
                <select v-model="store.form.metodo" class="field__input">
                  <option v-for="m in store.METODOS" :key="m" :value="m">
                    {{ m }}
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

              <label class="field">
                <span class="field__label">Data <em>*</em></span>
                <input
                  v-model.trim="store.form.data"
                  class="field__input"
                  placeholder="dd/mm/aaaa"
                />
              </label>

              <label class="field">
                <span class="field__label">Valor (MT) <em>*</em></span>
                <input
                  v-model.number="store.form.valor"
                  type="number"
                  min="0"
                  class="field__input"
                  placeholder="0"
                />
              </label>

              <label class="field field--full">
                <span class="field__label">Nome do pagador <em>*</em></span>
                <input
                  v-model.trim="store.form.pagador"
                  class="field__input"
                  placeholder="Ex.: João Chissano"
                />
              </label>

              <label
                v-if="
                  store.form.metodo === 'M-Pesa' ||
                  store.form.metodo === 'Transferência'
                "
                class="field field--full"
              >
                <span class="field__label">
                  {{ store.form.metodo === 'M-Pesa' ? 'Nº M-Pesa' : 'IBAN' }}
                </span>
                <input
                  v-model.trim="store.form.referencia"
                  class="field__input"
                  :placeholder="
                    store.form.metodo === 'M-Pesa'
                      ? '+258 84 123 4567'
                      : 'MZ59 0000 0000 0000 0000'
                  "
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

            <!-- PASSO 3 -->
            <div v-else class="confirmacao">
              <div class="confirmacao__icon">
                <q-icon name="receipt_long" size="40px" />
              </div>
              <h3 class="confirmacao__title">Confirmar pagamento</h3>
              <p class="confirmacao__sub">
                Verifique os dados antes de guardar.
              </p>

              <div class="confirmacao__grid">
                <div class="confirmacao__row">
                  <span>Recibo</span>
                  <b>{{ store.form.recibo }}</b>
                </div>
                <div class="confirmacao__row">
                  <span>Matrícula</span>
                  <b>{{ store.form.matricula }}</b>
                </div>
                <div class="confirmacao__row">
                  <span>Multa</span>
                  <b>{{ store.form.multaCodigo }}</b>
                </div>
                <div class="confirmacao__row">
                  <span>Infração</span>
                  <b>{{ store.form.infracao }}</b>
                </div>
                <div class="confirmacao__row">
                  <span>Método</span>
                  <b>{{ store.form.metodo }}</b>
                </div>
                <div class="confirmacao__row">
                  <span>Data</span>
                  <b>{{ store.form.data }}</b>
                </div>
                <div class="confirmacao__row">
                  <span>Pagador</span>
                  <b>{{ store.form.pagador }}</b>
                </div>
                <div v-if="store.form.referencia" class="confirmacao__row">
                  <span>Referência</span>
                  <b>{{ store.form.referencia }}</b>
                </div>
                <div class="confirmacao__row confirmacao__row--total">
                  <span>Total</span>
                  <b>{{ store.formatarMoeda(store.form.valor) }}</b>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="modal-actions">
            <template v-if="store.step === 1">
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

            <template v-else-if="store.step === 2">
              <q-btn
                flat
                label="Voltar"
                icon="arrow_back"
                @click="store.passoAnterior"
              />
              <q-btn
                unelevated
                color="primary"
                label="Próximo"
                icon-right="arrow_forward"
                :disable="!store.passo2Valido"
                @click="store.proximoPasso"
              />
            </template>

            <template v-else>
              <q-btn
                flat
                label="Voltar"
                icon="arrow_back"
                @click="store.passoAnterior"
              />
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

      <!-- MODAL — RECIBO -->
      <q-dialog v-model="store.modalRecibo" persistent>
        <q-card v-if="store.recibo" class="modal-card modal-card--wide recibo">
          <q-card-section class="recibo__head">
            <div class="recibo__head-icon">
              <q-icon name="check_circle" size="34px" />
            </div>
            <h2 class="recibo__head-title">Recibo de pagamento</h2>
            <p class="recibo__head-sub">Pode imprimir ou guardar em PDF.</p>
          </q-card-section>

          <q-card-section class="recibo__body">
            <div class="recibo__doc-head">
              <div class="recibo__doc-brand">
                <div class="recibo__doc-logo">SICAM</div>
                <div>
                  <div class="recibo__doc-title">GESTMUL</div>
                  <div class="recibo__doc-sub">Comprovativo de pagamento</div>
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
                <span class="recibo__info-label">Multa</span>
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
              label="Imprimir PDF"
              icon="picture_as_pdf"
              color="primary"
              @click="imprimirRecibo"
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
  useGestmulPagamentosStore,
  type Pagamento,
} from '@/stores/gestmul/gestmul-PagamentosStore'
import { pagamentosService } from '@/services/gestmul/pagamentos.service'

const store = useGestmulPagamentosStore()
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
      titulo: `${store.kpis.pendentes} pagamento${
        store.kpis.pendentes === 1 ? '' : 's'
      } pendente${store.kpis.pendentes === 1 ? '' : 's'}`,
      descricao: `Valor pendente: ${store.formatarMoeda(
        store.kpis.valorPendente,
      )}`,
    })
  }

  return lista
})

// ============================================================
// Filtros rápidos
// ============================================================
function filtrarPor(valor: 'total' | 'Confirmado' | 'Pendente') {
  store.limparFiltros()
  if (valor === 'total') return
  store.filtroEstado = valor
}

// ============================================================
// Ações
// ============================================================
async function confirmar(p: Pagamento) {
  $q.dialog({
    title: 'Confirmar pagamento',
    message: `Confirmar o pagamento ${p.recibo} (${store.formatarMoeda(
      p.valor,
    )})?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Confirmar', color: 'positive' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.confirmar(p.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Pagamento ${p.recibo} confirmado`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

function pedirRemover(p: Pagamento) {
  $q.dialog({
    title: 'Remover pagamento',
    message: `Remover permanentemente o recibo ${p.recibo}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(p.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Recibo ${p.recibo} removido`,
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
      ? `Pagamento ${store.form.recibo} actualizado`
      : `Pagamento ${store.form.recibo} registado`,
    position: 'top',
  })
  store.fecharForm()
}

// ============================================================
// Recibo PDF
// ============================================================
async function baixarRecibo(p: Pagamento) {
  const ok = await store.baixarReciboPdf(p)
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

async function baixarPdfDetalhe() {
  if (!store.pagamentoSelecionado) return
  const ok = await store.baixarReciboPdf(store.pagamentoSelecionado)
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

async function imprimirRecibo() {
  if (!store.recibo) return

  // Encontra o pagamento correspondente pelo número do recibo
  const p = store.pagamentos.find((x) => x.recibo === store.recibo?.numero)
  if (!p) return

  const ok = await store.baixarReciboPdf(p)
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

// ============================================================
// Exportar Excel
// ============================================================
async function exportarExcel() {
  try {
    const blob = await pagamentosService.exportarXlsx()

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gestmul-pagamentos-${new Date()
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

.pg-skeleton {
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
.pg-page {
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

  &--static {
    cursor: default;
  }

  &:active:not(.kpi--static) {
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
    &--info {
      background: #dbeafe;
      color: #2563eb;
    }
  }

  &__value {
    font-size: 20px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1.1;
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

.table-time {
  color: var(--sicam-muted);
  font-size: 13px;
  white-space: nowrap;
}
.cell-multa {
  color: var(--sicam-ink-soft);
  font-size: 13px;
}
.cell-valor {
  font-weight: 700;
  color: var(--sicam-ink);
  white-space: nowrap;
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
/* Chip de método                                               */
/* ============================================================ */
.metodo {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid transparent;

  .q-icon {
    font-size: 13px;
    flex-shrink: 0;
  }

  &--cash {
    background: #fef3c7;
    color: #a16207;
    border-color: rgba(161, 98, 7, 0.15);
  }
  &--transfer {
    background: #dbeafe;
    color: #1e40af;
    border-color: rgba(30, 64, 175, 0.15);
  }
  &--card {
    background: #f3e8ff;
    color: #7c3aed;
    border-color: rgba(124, 58, 237, 0.15);
  }
  &--mobile {
    background: #dcfce7;
    color: #15803d;
    border-color: rgba(21, 128, 61, 0.15);
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
    min-width: 640px;
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

.modal-body {
  padding: 20px 22px !important;
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
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);

    &--big {
      font-size: 20px;
      font-weight: 700;
      color: var(--sicam-primary);
    }
  }
}

.modal-actions {
  padding: 12px 20px 20px !important;
  justify-content: space-between !important;
  gap: 10px;

  &__right {
    display: flex;
    gap: 10px;
  }
}

/* ============================================================ */
/* Steps (form)                                                 */
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
  transition: color 0.2s;

  @media (max-width: 600px) {
    display: none;
  }
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
  .steps__label {
    color: var(--sicam-success);
  }
  .steps__line {
    background: var(--sicam-success);
  }
}

.steps__item--active {
  .steps__dot {
    background: var(--sicam-primary-light);
    border-color: var(--sicam-primary-light);
    color: #fff;
    transform: scale(1.1);
  }
  .steps__label {
    color: var(--sicam-primary);
    font-weight: 700;
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

.field {
  display: block;

  &--full {
    grid-column: 1 / -1;
  }

  &__label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;

    em {
      color: var(--sicam-critical);
      font-style: normal;
      font-weight: 700;
    }
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

    &:hover {
      border-color: var(--sicam-line-strong);
    }

    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }

    &::placeholder {
      color: var(--sicam-muted);
      opacity: 0.7;
    }

    &--placa {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.06em;
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
/* Confirmação (passo 3)                                        */
/* ============================================================ */
.confirmacao {
  text-align: center;
  padding: 8px 0;

  &__icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    color: var(--sicam-primary);
    display: grid;
    place-items: center;
    margin: 0 auto 16px;
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 13px;
    color: var(--sicam-muted);
    margin: 0 0 24px;
  }

  &__grid {
    background: var(--sicam-surface-alt);
    border-radius: 14px;
    padding: 6px 18px;
    text-align: left;
    border: 1px solid var(--sicam-line-soft);
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid var(--sicam-line-soft);

    &:last-child {
      border-bottom: 0;
    }

    span {
      font-size: 11px;
      color: var(--sicam-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
    }

    b {
      font-size: 14px;
      color: var(--sicam-ink);
      font-weight: 700;
      text-align: right;
    }

    &--total {
      background: #ecfdf5;
      padding-left: 14px;
      padding-right: 14px;
      margin: 4px -18px 4px -18px;

      span {
        color: var(--sicam-primary);
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

/* ============================================================ */
/* Impressão                                                    */
/* ============================================================ */
@media print {
  body * {
    visibility: hidden;
  }
  .recibo,
  .recibo * {
    visibility: visible;
  }
  .recibo {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    box-shadow: none;
  }
  .modal-actions {
    display: none !important;
  }
}
</style>