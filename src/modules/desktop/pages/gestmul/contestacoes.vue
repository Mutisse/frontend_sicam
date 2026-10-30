<template>
  <q-page class="ct-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="ct-skeleton">
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

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Contestações</h1>
          <p class="page-head__sub">
            Gestão de contestações de multas submetidas pelos cidadãos
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
          <button class="page-btn page-btn--primary" @click="store.abrirNova">
            <q-icon name="add" size="18px" />
            Nova contestação
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

      <!-- ERRO -->
      <div v-if="store.erro" class="form-error">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- KPIs -->
      <section class="kpi-grid">
        <button class="kpi" @click="filtrarPor('total')">
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="gavel" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Total</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Pendente')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="pending" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.pendentes }}</div>
            <div class="kpi__label">Pendentes</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Aceite')">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="check_circle" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.aceites }}</div>
            <div class="kpi__label">Aceites</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Rejeitada')">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="cancel" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.rejeitadas }}</div>
            <div class="kpi__label">Rejeitadas</div>
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
            placeholder="Pesquisar por nº contestação, multa, matrícula, contestante…"
          />
        </div>

        <select v-model="store.filtroEstado" class="filter filter__select">
          <option value="">Todos os estados</option>
          <option v-for="e in store.ESTADOS" :key="e" :value="e">{{ e }}</option>
        </select>

        <select v-model="store.filtroMotivo" class="filter filter__select">
          <option value="">Todos os motivos</option>
          <option v-for="m in store.MOTIVOS" :key="m" :value="m">{{ m }}</option>
        </select>

        <select v-model="store.filtroPrioridade" class="filter filter__select">
          <option value="">Todas as prioridades</option>
          <option v-for="p in store.PRIORIDADES" :key="p" :value="p">
            {{ p }}
          </option>
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
              <th>Nº Contestação</th>
              <th>Multa</th>
              <th>Matrícula</th>
              <th>Contestante</th>
              <th>Motivo</th>
              <th>Prazo</th>
              <th>Estado</th>
              <th class="data-table__th-actions">Acções</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in store.paginados"
              :key="c.id"
              class="data-table__row"
              @click="store.abrirDetalhes(c)"
            >
              <td class="cell-codigo"><b>{{ c.numero }}</b></td>
              <td class="cell-multa">{{ c.multaCodigo }}</td>
              <td>
                <div class="placa">
                  <q-icon
                    name="directions_car"
                    size="14px"
                    class="placa__icon"
                  />
                  <b>{{ c.matricula }}</b>
                </div>
              </td>
              <td>
                <div class="cell-contestante">
                  <b>{{ c.contestante }}</b>
                  <small>{{ c.contacto }}</small>
                </div>
              </td>
              <td class="cell-motivo">
                <span class="motivo">{{ c.motivo }}</span>
              </td>
              <td>
                <div class="cell-prazo" :class="classePrazo(c.prazoLimite)">
                  <b>{{ c.prazoLimite }}</b>
                  <small>{{
                    store.diasRestantesFormatado(c.prazoLimite)
                  }}</small>
                </div>
              </td>
              <td>
                <span
                  class="badge"
                  :class="`badge--${store.estadoClasse(c.estado)}`"
                >
                  {{ c.estado }}
                </span>
              </td>
              <td class="data-table__actions" @click.stop>
                <div class="actions-group">
                  <button
                    class="row-action"
                    title="Ver detalhes"
                    @click="store.abrirDetalhes(c)"
                  >
                    <q-icon name="visibility" size="17px" />
                  </button>

                  <button
                    v-if="c.estado === 'Pendente'"
                    class="row-action row-action--warning"
                    title="Marcar em análise"
                    @click="marcarEmAnalise(c)"
                  >
                    <q-icon name="hourglass_top" size="17px" />
                  </button>

                  <button
                    v-if="c.estado === 'Pendente' || c.estado === 'Em análise'"
                    class="row-action row-action--success"
                    title="Aceitar contestação"
                    @click="store.abrirDecisao(c, 'Aceite')"
                  >
                    <q-icon name="check" size="17px" />
                  </button>

                  <button
                    v-if="c.estado === 'Pendente' || c.estado === 'Em análise'"
                    class="row-action row-action--danger"
                    title="Rejeitar contestação"
                    @click="store.abrirDecisao(c, 'Rejeitada')"
                  >
                    <q-icon name="close" size="17px" />
                  </button>

                  <button
                    class="row-action row-action--danger"
                    title="Remover"
                    @click="pedirRemover(c)"
                  >
                    <q-icon name="delete" size="17px" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!store.paginados.length">
              <td colspan="8" class="data-table__empty">
                <q-icon
                  name="gavel"
                  size="40px"
                  class="data-table__empty-icon"
                />
                <p>Nenhuma contestação encontrada com estes filtros.</p>
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
        <q-card
          v-if="store.contestacaoSelecionada"
          class="modal-card modal-card--wide"
        >
          <q-card-section class="modal-head">
            <div class="modal-head__left">
              <div
                class="modal-head__icon"
                :class="`modal-head__icon--${store.estadoClasse(
                  store.contestacaoSelecionada.estado,
                )}`"
              >
                <q-icon name="gavel" size="24px" />
              </div>
              <div>
                <div class="modal-head__title">
                  {{ store.contestacaoSelecionada.numero }}
                </div>
                <div class="modal-head__sub">Detalhes da contestação</div>
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
                store.contestacaoSelecionada.estado,
              )}`"
            >
              {{ store.contestacaoSelecionada.estado }}
            </span>
            <span
              class="badge badge--lg"
              :class="`badge--${store.prioridadeClasse(
                store.contestacaoSelecionada.prioridade,
              )}`"
            >
              Prioridade {{ store.contestacaoSelecionada.prioridade }}
            </span>
          </q-card-section>

          <q-card-section class="modal-grid">
            <div class="modal-field">
              <div class="modal-field__label">Multa</div>
              <div class="modal-field__value">
                {{ store.contestacaoSelecionada.multaCodigo }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Valor da multa</div>
              <div class="modal-field__value modal-field__value--big">
                {{
                  store.formatarMoeda(store.contestacaoSelecionada.valorMulta)
                }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Matrícula</div>
              <div class="modal-field__value">
                {{ store.contestacaoSelecionada.matricula }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Infração</div>
              <div class="modal-field__value">
                {{ store.contestacaoSelecionada.infracao }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Contestante</div>
              <div class="modal-field__value">
                {{ store.contestacaoSelecionada.contestante }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">NIF</div>
              <div class="modal-field__value">
                {{ store.contestacaoSelecionada.nif }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Contacto</div>
              <div class="modal-field__value">
                {{ store.contestacaoSelecionada.contacto }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Motivo</div>
              <div class="modal-field__value">
                {{ store.contestacaoSelecionada.motivo }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Data de submissão</div>
              <div class="modal-field__value">
                {{ store.contestacaoSelecionada.dataSubmissao }}
              </div>
            </div>

            <div class="modal-field">
              <div class="modal-field__label">Prazo limite</div>
              <div class="modal-field__value">
                {{ store.contestacaoSelecionada.prazoLimite }}
              </div>
            </div>

            <div class="modal-field modal-field--full">
              <div class="modal-field__label">Descrição</div>
              <div class="modal-field__value modal-field__value--text">
                {{ store.contestacaoSelecionada.descricao }}
              </div>
            </div>

            <div
              v-if="store.contestacaoSelecionada.decisao"
              class="modal-field modal-field--full modal-field--decisao"
            >
              <div class="modal-field__label">Decisão</div>
              <div class="modal-field__value modal-field__value--text">
                {{ store.contestacaoSelecionada.decisao }}
              </div>
              <div class="modal-field__meta">
                Por <b>{{ store.contestacaoSelecionada.decisaoPor }}</b> em
                {{ store.contestacaoSelecionada.decisaoEm }}
              </div>
            </div>

            <div
              v-if="store.contestacaoSelecionada.observacoes"
              class="modal-field modal-field--full"
            >
              <div class="modal-field__label">Observações</div>
              <div class="modal-field__value modal-field__value--text">
                {{ store.contestacaoSelecionada.observacoes }}
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="modal-actions">
            <q-btn flat label="Fechar" @click="store.modalDetalhes = false" />

            <div class="modal-actions__right">
              <template
                v-if="
                  store.contestacaoSelecionada.estado === 'Pendente' ||
                  store.contestacaoSelecionada.estado === 'Em análise'
                "
              >
                <q-btn
                  flat
                  label="Rejeitar"
                  icon="close"
                  color="negative"
                  @click="
                    store.abrirDecisao(
                      store.contestacaoSelecionada,
                      'Rejeitada',
                    )
                  "
                />
                <q-btn
                  unelevated
                  label="Aceitar"
                  icon="check"
                  color="primary"
                  @click="
                    store.abrirDecisao(store.contestacaoSelecionada, 'Aceite')
                  "
                />
              </template>
            </div>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- MODAL — NOVA / EDITAR -->
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
                      ? 'Editar contestação'
                      : 'Nova contestação'
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
                  n === 1 ? 'Identificação' : n === 2 ? 'Motivo' : 'Detalhes'
                }}
              </div>
              <div v-if="n < 3" class="steps__line" />
            </div>
          </div>

          <q-card-section class="modal-body">
            <!-- PASSO 1 -->
            <div v-if="store.step === 1" class="form-grid">
              <label class="field field--full">
                <span class="field__label">Nº de contestação <em>*</em></span>
                <input
                  v-model.trim="store.form.numero"
                  class="field__input"
                  placeholder="CT-2026-000001"
                  :disabled="store.modoEdicao"
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
                <span class="field__label">Infração</span>
                <input
                  v-model.trim="store.form.infracao"
                  class="field__input"
                  placeholder="Ex.: Excesso de velocidade"
                />
              </label>

              <label class="field">
                <span class="field__label">Valor da multa (MT)</span>
                <input
                  v-model.number="store.form.valorMulta"
                  type="number"
                  min="0"
                  class="field__input"
                  placeholder="0"
                />
              </label>

              <label class="field field--full">
                <span class="field__label">Nome do contestante <em>*</em></span>
                <input
                  v-model.trim="store.form.contestante"
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
                <span class="field__label">Contacto</span>
                <input
                  v-model.trim="store.form.contacto"
                  class="field__input"
                  placeholder="+258 84 000 0000"
                />
              </label>
            </div>

            <!-- PASSO 2 -->
            <div v-else-if="store.step === 2" class="form-grid">
              <label class="field field--full">
                <span class="field__label"
                  >Motivo da contestação <em>*</em></span
                >
                <select v-model="store.form.motivo" class="field__input">
                  <option v-for="m in store.MOTIVOS" :key="m" :value="m">
                    {{ m }}
                  </option>
                </select>
              </label>

              <label class="field field--full">
                <span class="field__label">Descrição detalhada <em>*</em></span>
                <textarea
                  v-model.trim="store.form.descricao"
                  class="field__input"
                  rows="5"
                  placeholder="Explique detalhadamente o motivo da contestação (mínimo 20 caracteres)…"
                />
                <span class="field__hint">
                  {{ store.form.descricao.length }} / mínimo 20 caracteres
                </span>
              </label>
            </div>

            <!-- PASSO 3 -->
            <div v-else class="form-grid">
              <label class="field">
                <span class="field__label">Prioridade <em>*</em></span>
                <select v-model="store.form.prioridade" class="field__input">
                  <option v-for="p in store.PRIORIDADES" :key="p" :value="p">
                    {{ p }}
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
                <span class="field__label">Prazo limite <em>*</em></span>
                <input
                  v-model.trim="store.form.prazoLimite"
                  class="field__input"
                  placeholder="dd/mm/aaaa"
                />
              </label>

              <label class="field field--full">
                <span class="field__label">Observações</span>
                <textarea
                  v-model.trim="store.form.observacoes"
                  class="field__input"
                  rows="3"
                  placeholder="Notas internas (opcional)…"
                />
              </label>
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
                :label="store.modoEdicao ? 'Guardar' : 'Submeter'"
                :loading="store.aSalvar"
                :disable="!store.formValido"
                @click="salvar"
              />
            </template>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- MODAL — DECISÃO -->
      <q-dialog v-model="store.modalDecisao" persistent>
        <q-card v-if="store.contestacaoSelecionada" class="modal-card">
          <q-card-section class="modal-head">
            <div class="modal-head__left">
              <div
                class="modal-head__icon"
                :class="
                  store.tipoDecisao === 'Aceite'
                    ? 'modal-head__icon--regular'
                    : 'modal-head__icon--critico'
                "
              >
                <q-icon
                  :name="store.tipoDecisao === 'Aceite' ? 'check' : 'close'"
                  size="24px"
                />
              </div>
              <div>
                <div class="modal-head__title">
                  {{
                    store.tipoDecisao === 'Aceite'
                      ? 'Aceitar contestação'
                      : 'Rejeitar contestação'
                  }}
                </div>
                <div class="modal-head__sub">
                  {{ store.contestacaoSelecionada.numero }}
                </div>
              </div>
            </div>
            <q-btn flat round dense icon="close" @click="store.fecharDecisao" />
          </q-card-section>

          <q-card-section class="modal-body">
            <div
              class="decisao-aviso"
              :class="
                store.tipoDecisao === 'Aceite'
                  ? 'decisao-aviso--success'
                  : 'decisao-aviso--danger'
              "
            >
              <q-icon
                :name="store.tipoDecisao === 'Aceite' ? 'info' : 'warning'"
                size="18px"
              />
              <span v-if="store.tipoDecisao === 'Aceite'">
                A multa
                <b>{{ store.contestacaoSelecionada.multaCodigo }}</b> será
                <b>anulada</b> e o cidadão notificado.
              </span>
              <span v-else>
                A multa
                <b>{{ store.contestacaoSelecionada.multaCodigo }}</b>
                permanecerá <b>activa</b> e o cidadão será notificado.
              </span>
            </div>

            <label class="field field--full">
              <span class="field__label">Fundamento da decisão <em>*</em></span>
              <textarea
                v-model.trim="store.fundamento"
                class="field__input"
                rows="4"
                placeholder="Descreva o fundamento legal/técnico da decisão (mínimo 10 caracteres)…"
              />
              <span class="field__hint">
                {{ store.fundamento.length }} / mínimo 10 caracteres
              </span>
            </label>

            <label class="field field--full">
              <span class="field__label"
                >Responsável pela decisão <em>*</em></span
              >
              <select v-model="store.responsavel" class="field__input">
                <option v-for="r in store.RESPONSAVEIS" :key="r" :value="r">
                  {{ r }}
                </option>
              </select>
            </label>
          </q-card-section>

          <q-card-actions class="modal-actions">
            <q-btn flat label="Cancelar" @click="store.fecharDecisao" />
            <q-btn
              unelevated
              :color="store.tipoDecisao === 'Aceite' ? 'primary' : 'negative'"
              :icon="store.tipoDecisao === 'Aceite' ? 'check' : 'close'"
              :label="
                store.tipoDecisao === 'Aceite'
                  ? 'Aceitar contestação'
                  : 'Rejeitar contestação'
              "
              :loading="store.aDecidir"
              :disable="store.fundamento.trim().length < 10"
              @click="confirmarDecisao"
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
  useGestmulContestacoesStore,
  type Contestacao,
} from '@/stores/gestmul/gestmul-ContestacoesStore'
import { contestacoesService } from '@/services/gestmul/contestacoes.service'

const store = useGestmulContestacoesStore()
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

  if (store.kpis.aExpirar > 0) {
    lista.push({
      tipo: 'critico',
      icon: 'schedule',
      titulo: `${store.kpis.aExpirar} contestação${
        store.kpis.aExpirar === 1 ? '' : 'ões'
      } a expirar nos próximos 7 dias`,
      descricao: 'Priorize a análise para não perder o prazo legal',
    })
  }

  if (store.kpis.pendentes > 0) {
    lista.push({
      tipo: 'atencao',
      icon: 'pending',
      titulo: `${store.kpis.pendentes} contestação${
        store.kpis.pendentes === 1 ? '' : 'ões'
      } pendente${store.kpis.pendentes === 1 ? '' : 's'} de análise`,
      descricao: `Valor em causa: ${store.formatarMoeda(
        store.kpis.valorEmCausa,
      )}`,
    })
  }

  return lista
})

// ============================================================
// Filtros rápidos
// ============================================================
function filtrarPor(valor: 'total' | 'Pendente' | 'Aceite' | 'Rejeitada') {
  store.limparFiltros()
  if (valor === 'total') return
  store.filtroEstado = valor
}

// ============================================================
// Classe do prazo
// ============================================================
function classePrazo(prazo: string): string {
  const d = store.diasRestantes(prazo)
  if (d < 0) return 'prazo--expirado'
  if (d <= 3) return 'prazo--urgente'
  if (d <= 7) return 'prazo--atencao'
  return 'prazo--ok'
}

// ============================================================
// Ações
// ============================================================
async function marcarEmAnalise(c: Contestacao) {
  const ok = await store.marcarEmAnalise(c.id)
  if (ok) {
    $q.notify({
      type: 'info',
      message: `Contestação ${c.numero} marcada em análise`,
      position: 'top',
    })
  } else if (store.erro) {
    $q.notify({ type: 'negative', message: store.erro, position: 'top' })
  }
}

function pedirRemover(c: Contestacao) {
  $q.dialog({
    title: 'Remover contestação',
    message: `Remover permanentemente ${c.numero}?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(c.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Contestação ${c.numero} removida`,
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
      ? `Contestação ${store.form.numero} actualizada`
      : `Contestação ${store.form.numero} submetida`,
    position: 'top',
  })
  store.fecharForm()
}

async function confirmarDecisao() {
  const ok = await store.confirmarDecisao()
  if (!ok) {
    if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
    return  }

  const tipo = store.tipoDecisao === 'Aceite' ? 'aceite' : 'rejeitada'
  $q.notify({
    type: store.tipoDecisao === 'Aceite' ? 'positive' : 'warning',
    message: `Contestação ${tipo} com sucesso`,
    position: 'top',
  })
  store.fecharDecisao()
}

// ============================================================
// Exportar Excel (XLSX via backend)
// ============================================================
async function exportarExcel() {
  try {
    const blob = await contestacoesService.exportarXlsx()

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gestmul-contestacoes-${new Date()
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

.ct-skeleton {
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

/* ============================================================ */
/* Página                                                       */
/* ============================================================ */
.ct-page {
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
    min-width: 150px;

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
    width: 200px;
  }
  &__actions {
    text-align: right;
    white-space: nowrap;
    width: 200px;
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

.cell-multa {
  color: var(--sicam-ink-soft);
  font-size: 13px;
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

.cell-contestante {
  b {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink);
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

.cell-motivo {
  max-width: 200px;

  .motivo {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    color: var(--sicam-ink-soft);
    background: var(--sicam-surface-alt);
    padding: 4px 10px;
    border-radius: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
}

.cell-prazo {
  b {
    display: block;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
  }
  small {
    display: block;
    font-size: 11px;
    margin-top: 2px;
    white-space: nowrap;
  }

  &.prazo--ok b {
    color: var(--sicam-ink);
  }
  &.prazo--ok small {
    color: var(--sicam-muted);
  }

  &.prazo--atencao b {
    color: var(--sicam-warning-ink);
  }
  &.prazo--atencao small {
    color: var(--sicam-warning-ink);
    font-weight: 600;
  }

  &.prazo--urgente b {
    color: var(--sicam-critical-ink);
  }
  &.prazo--urgente small {
    color: var(--sicam-critical-ink);
    font-weight: 700;
  }

  &.prazo--expirado b {
    color: var(--sicam-critical-ink);
    text-decoration: line-through;
  }
  &.prazo--expirado small {
    color: var(--sicam-critical-ink);
    font-weight: 700;
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

  &--lg {
    padding: 6px 14px;
    font-size: 13px;
  }

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
    min-width: 700px;
  }
  @media (max-width: 800px) {
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
  gap: 8px;
  justify-content: center;
  padding: 12px 20px 0;
  flex-wrap: wrap;
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
  &--decisao {
    background: #f0fdf9;
    border-radius: 10px;
    padding: 12px 14px;
    border: 1px solid rgba(16, 185, 129, 0.15);
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

    &--text {
      font-weight: 500;
      line-height: 1.6;
      background: var(--sicam-surface-alt);
      padding: 10px 14px;
      border-radius: 8px;
      white-space: pre-wrap;
    }
  }

  &__meta {
    font-size: 11px;
    color: var(--sicam-muted);
    margin-top: 6px;

    b {
      color: var(--sicam-ink);
      font-weight: 700;
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

  &__hint {
    display: block;
    font-size: 11px;
    color: var(--sicam-muted);
    margin-top: 6px;
    font-weight: 500;
  }
}

/* ============================================================ */
/* Decisão — aviso                                              */
/* ============================================================ */
.decisao-aviso {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 20px;

  .q-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  b {
    font-weight: 700;
  }

  &--success {
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
  }

  &--danger {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }
}
</style>