<template>
  <q-page class="ina-page">
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

      <div class="sk-charts">
        <div class="sk-chart" />
        <div class="sk-chart" />
      </div>

      <div class="sk-table">
        <div v-for="i in 6" :key="i" class="sk-row" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Visão Geral — INATRO</h1>
          <p class="page-head__sub">
            Estado do registo de veículos e inspecções técnicas
          </p>
        </div>

        <div class="page-head__actions">
          <button class="page-btn page-btn--outline" @click="exportarCSV">
            <q-icon name="file_download" size="18px" />
            Exportar
          </button>
          <button class="page-btn page-btn--outline" @click="irPendentes">
            <q-icon name="pending_actions" size="18px" />
            Pendentes ({{ store.kpis.pendentes }})
          </button>
          <button class="page-btn page-btn--primary" @click="store.abrirRegistar">
            <q-icon name="add" size="18px" />
            Registar veículo
          </button>
        </div>
      </header>

      <!-- ALERTAS -->
      <div v-if="store.alertas.length" class="alertas">
        <div
          v-for="(a, i) in store.alertas"
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
        <button class="kpi" @click="irVeiculos">
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="directions_car" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.registados }}</div>
            <div class="kpi__label">Veículos registados</div>
          </div>
        </button>

        <button class="kpi" @click="irValidas">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="verified" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.inspecaoOk }}</div>
            <div class="kpi__label">Inspecção válida</div>
          </div>
        </button>

        <button class="kpi" @click="irExpiradas">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="warning" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.inspecaoExp }}</div>
            <div class="kpi__label">Inspecção expirada</div>
          </div>
        </button>

        <button class="kpi" @click="irPendentes">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="pending_actions" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.pendentes }}</div>
            <div class="kpi__label">Pendentes</div>
          </div>
        </button>
      </section>

      <!-- GRÁFICOS -->
      <div class="charts-grid">
        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Taxa de inspecção válida</h2>
            <span class="chart-card__tag">
              {{ store.kpis.inspecaoOk + store.kpis.inspecaoExp }} processos
            </span>
          </header>

          <div class="chart-card__body chart-card__body--ring">
            <div class="ring">
              <svg viewBox="0 0 100 100" class="ring__svg">
                <circle cx="50" cy="50" r="42" class="ring__track" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  class="ring__progress"
                  :stroke-dasharray="store.circunferencia"
                  :stroke-dashoffset="store.offsetRing"
                />
              </svg>
              <div class="ring__center">
                <div class="ring__value">{{ store.taxaValida }}</div>
                <div class="ring__label">%</div>
              </div>
            </div>

            <div class="ring-legend">
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--success" />
                Válidas: <b>{{ store.kpis.inspecaoOk }}</b>
              </div>
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--critical" />
                Expiradas: <b>{{ store.kpis.inspecaoExp }}</b>
              </div>
              <div class="ring-legend__item">
                <span class="ring-legend__dot ring-legend__dot--warning" />
                Pendentes: <b>{{ store.kpis.pendentes }}</b>
              </div>
            </div>
          </div>
        </section>

        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Veículos por província</h2>
          </header>

          <div class="chart-card__body">
            <div v-if="store.veiculosPorProvincia.length" class="bar-chart">
              <div
                v-for="(b, i) in store.veiculosPorProvincia"
                :key="i"
                class="bar-chart__row"
              >
                <div class="bar-chart__label">{{ b.nome }}</div>
                <div class="bar-chart__bar">
                  <div
                    class="bar-chart__fill"
                    :style="{ width: `${b.percentagem}%` }"
                  />
                </div>
                <div class="bar-chart__value">{{ b.valor }}</div>
              </div>
            </div>
            <div v-else class="chart-card__empty">
              Sem dados de províncias
            </div>
          </div>
        </section>
      </div>

      <!-- FILTROS -->
      <section class="filters">
        <div class="filter filter--search">
          <q-icon name="search" size="20px" class="filter__icon" />
          <input
            v-model="store.pesquisa"
            type="text"
            class="filter__input"
            placeholder="Pesquisar por matrícula, posto…"
          />
        </div>

        <select v-model="store.filtroResultado" class="filter filter__select">
          <option value="">Todos os resultados</option>
          <option value="Aprovada">Aprovada</option>
          <option value="Reprovada">Reprovada</option>
        </select>

        <select v-model="store.filtroPosto" class="filter filter__select">
          <option value="">Todos os postos</option>
          <option
            v-for="p in postosUnicos"
            :key="p"
            :value="p"
          >
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

      <!-- REGISTOS RECENTES -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">Registos recentes</h2>
          <router-link to="/inatro/inspecoes" class="block__link">
            Ver todos →
          </router-link>
        </header>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th @click="store.ordenarPor('matricula')" class="data-table__th-sort">
                  Matrícula
                  <q-icon
                    v-if="store.ordenacao.key === 'matricula'"
                    :name="store.iconeOrdenacao"
                    size="14px"
                  />
                </th>
                <th>Tipo</th>
                <th @click="store.ordenarPor('data')" class="data-table__th-sort">
                  Data
                  <q-icon
                    v-if="store.ordenacao.key === 'data'"
                    :name="store.iconeOrdenacao"
                    size="14px"
                  />
                </th>
                <th>Posto</th>
                <th>Resultado</th>
                <th class="data-table__th-actions" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, i) in store.paginados"
                :key="i"
                class="data-table__row"
                @click="store.abrirDetalhesInspecao(r)"
              >
                <td>
                  <div class="placa">
                    <div class="placa__icon">
                      <q-icon name="directions_car" size="16px" />
                    </div>
                    <b>{{ r.matricula }}</b>
                  </div>
                </td>
                <td>{{ r.tipo }}</td>
                <td class="table-time">{{ r.data }}</td>
                <td>{{ r.posto }}</td>
                <td>
                  <span
                    v-if="r.estadoRegisto === 'Falhado'"
                    class="badge badge--falhado"
                    :title="r.motivoFalha"
                  >
                    Não passou
                  </span>
                  <span v-else class="badge badge--regular">
                    Aprovado
                  </span>
                </td>
                <td class="data-table__actions" @click.stop>
                  <button
                    class="row-action"
                    title="Ver detalhes"
                    @click="store.abrirDetalhesInspecao(r)"
                  >
                    <q-icon name="visibility" size="18px" />
                  </button>

                  <button
                    v-if="r.estadoRegisto === 'Aprovado'"
                    class="row-action row-action--inspecao"
                    title="Fazer inspecção"
                    @click="irParaInspeccao(r)"
                  >
                    <q-icon name="fact_check" size="18px" />
                  </button>

                  <button
                    class="row-action"
                    title="Imprimir"
                    @click="imprimirInspecao(r)"
                  >
                    <q-icon name="print" size="18px" />
                  </button>
                </td>
              </tr>

              <tr v-if="!store.paginados.length">
                <td colspan="6" class="data-table__empty">
                  <q-icon name="search_off" size="40px" class="data-table__empty-icon" />
                  <p>Nenhum registo encontrado com estes filtros.</p>
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

          <footer v-if="store.filtrados.length > 0" class="table-foot">
            <div class="table-foot__info">
              Mostrando {{ store.inicioPagina + 1 }}–{{ store.fimPagina }} de
              {{ store.filtrados.length }}
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
        </div>
      </section>
    </template>

    <!-- ============================================================ -->
    <!-- MODAL — REGISTAR VEÍCULO                                      -->
    <!-- ============================================================ -->
    <q-dialog v-model="store.modalRegistar" persistent maximized>
      <div class="modal-doc">
        <header class="modal-doc__head">
          <div>
            <h2 class="modal-doc__title">
              {{ store.passo === 1 ? "Registar veículo" : "Comprovativo de registo" }}
            </h2>
            <p class="modal-doc__sub">
              {{
                store.passo === 1
                  ? "Preencha os dados do veículo e do proprietário"
                  : "Verifique os dados antes de guardar"
              }}
            </p>
          </div>
          <button class="modal-doc__close" @click="store.fecharRegistar">
            <q-icon name="close" size="22px" />
          </button>
        </header>

        <!-- Passo 1 -->
        <div v-if="store.passo === 1" class="modal-doc__body">
          <h3 class="form-section">Veículo</h3>
          <div class="form-grid">
            <label class="field">
              <span class="field__label">
                Matrícula
                <q-icon name="auto_awesome" size="12px" class="field__auto" />
              </span>
              <div class="matricula-box">
                <b class="matricula-box__value">{{ store.matriculaGerada }}</b>
                <button
                  class="matricula-box__refresh"
                  @click="store.gerarNovaMatricula"
                  title="Gerar outra"
                  type="button"
                >
                  <q-icon name="refresh" size="16px" />
                </button>
              </div>
              <small class="field__hint">
                Gerada automaticamente com base no último registo ({{
                  store.ultimaMatricula
                }})
              </small>
            </label>

            <label class="field">
              <span class="field__label">Tipo <em>*</em></span>
              <select v-model="store.form.tipo" class="field__input">
                <option value="">Selecione…</option>
                <option value="Ligeiro">Ligeiro</option>
                <option value="Pesado">Pesado</option>
                <option value="Motociclo">Motociclo</option>
                <option value="Reboque">Reboque</option>
                <option value="Autocarro">Autocarro</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Província <em>*</em></span>
              <select v-model="store.form.provincia" class="field__input">
                <option value="">Selecione…</option>
                <option
                  v-for="p in store.PROVINCIAS"
                  :key="p.codigo"
                  :value="p.codigo"
                >
                  {{ p.nome }}
                </option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Marca <em>*</em></span>
              <select v-model="store.form.marca" class="field__input">
                <option value="">Selecione a marca…</option>
                <option
                  v-for="m in Object.keys(store.MARCAS).sort()"
                  :key="m"
                  :value="m"
                >
                  {{ m }}
                </option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Modelo <em>*</em></span>
              <select
                v-model="store.form.modelo"
                class="field__input"
                :disabled="!store.form.marca"
              >
                <option value="">
                  {{
                    store.form.marca
                      ? "Selecione o modelo…"
                      : "Escolha primeiro a marca"
                  }}
                </option>
                <option
                  v-for="m in store.modelosDisponiveis"
                  :key="m"
                  :value="m"
                >
                  {{ m }}
                </option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Ano <em>*</em></span>
              <select v-model.number="store.form.ano" class="field__input">
                <option :value="undefined">Selecione o ano…</option>
                <option v-for="a in store.ANOS" :key="a" :value="a">
                  {{ a }}
                </option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Cor <em>*</em></span>
              <select v-model="store.form.cor" class="field__input">
                <option value="">Selecione a cor…</option>
                <optgroup
                  v-for="g in store.CORES"
                  :key="g.categoria"
                  :label="g.categoria"
                >
                  <option v-for="c in g.cores" :key="c" :value="c">
                    {{ c }}
                  </option>
                </optgroup>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Combustível</span>
              <select v-model="store.form.combustivel" class="field__input">
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diesel</option>
                <option value="Elétrico">Elétrico</option>
                <option value="Híbrido">Híbrido</option>
                <option value="GPL">GPL</option>
                <option value="GNV">GNV (Gás Natural)</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Nº de chassis (VIN)</span>
              <input
                v-model.trim="store.form.chassis"
                class="field__input"
                placeholder="Ex.: JTDBR32E930123456"
                maxlength="17"
              />
            </label>

            <label class="field">
              <span class="field__label">Posto de registo</span>
              <select v-model="store.form.posto" class="field__input">
                <option value="Posto Baixa">Posto Baixa</option>
                <option value="Posto Matola">Posto Matola</option>
                <option value="Posto Machava">Posto Machava</option>
                <option value="Posto KaMpfumo">Posto KaMpfumo</option>
              </select>
            </label>
          </div>

          <h3 class="form-section">Proprietário</h3>
          <div class="form-grid">
            <label class="field">
              <span class="field__label">Nome completo <em>*</em></span>
              <input
                v-model.trim="store.form.proprietario"
                class="field__input"
                placeholder="Ex.: João da Silva"
              />
            </label>

            <label class="field">
              <span class="field__label">NIF <em>*</em></span>
              <input
                v-model.trim="store.form.nif"
                class="field__input"
                placeholder="Ex.: 123456789"
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
              <span class="field__label">Endereço</span>
              <input
                v-model.trim="store.form.endereco"
                class="field__input"
                placeholder="Av. 25 de Setembro, nº 123"
              />
            </label>
          </div>

          <div v-if="store.erro" class="ina-erro">
            <q-icon name="error" /> {{ store.erro }}
          </div>
        </div>

        <!-- Passo 2 -->
        <div v-else class="modal-doc__body modal-doc__body--doc">
          <div class="documento" id="documento-print">
            <header class="documento__head">
              <div class="documento__logo">
                <q-icon name="directions_car" size="32px" />
              </div>
              <div class="documento__head-text">
                <h3>INATRO — Instituto Nacional de Transportes Rodoviários</h3>
                <p>Comprovativo de Registo de Veículo</p>
              </div>
              <div class="documento__codigo">
                <small>Nº</small>
                <b>{{ store.codigoRegisto }}</b>
              </div>
            </header>

            <section class="documento__section">
              <h4>Dados do Veículo</h4>
              <div class="documento__grid">
                <div>
                  <small>Matrícula</small><b>{{ store.matriculaGerada }}</b>
                </div>
                <div>
                  <small>Tipo</small><b>{{ store.form.tipo }}</b>
                </div>
                <div>
                  <small>Marca</small><b>{{ store.form.marca }}</b>
                </div>
                <div>
                  <small>Modelo</small><b>{{ store.form.modelo }}</b>
                </div>
                <div>
                  <small>Ano</small><b>{{ store.form.ano }}</b>
                </div>
                <div>
                  <small>Cor</small><b>{{ store.form.cor }}</b>
                </div>
                <div>
                  <small>Combustível</small><b>{{ store.form.combustivel }}</b>
                </div>
                <div>
                  <small>Chassis</small><b>{{ store.form.chassis || "—" }}</b>
                </div>
              </div>
            </section>

            <section class="documento__section">
              <h4>Proprietário</h4>
              <div class="documento__grid">
                <div class="documento__grid--full">
                  <small>Nome</small><b>{{ store.form.proprietario }}</b>
                </div>
                <div>
                  <small>NIF</small><b>{{ store.form.nif }}</b>
                </div>
                <div>
                  <small>Telefone</small><b>{{ store.form.telefone || "—" }}</b>
                </div>
                <div>
                  <small>Província</small><b>{{ store.provinciaNome }}</b>
                </div>
                <div>
                  <small>Endereço</small><b>{{ store.form.endereco || "—" }}</b>
                </div>
              </div>
            </section>

            <footer class="documento__foot">
              <div class="documento__data">
                <small>Data de emissão</small>
                <b>{{ store.dataEmissao }}</b>
              </div>
              <div class="documento__assinatura">
                <div class="documento__linha" />
                <small>Assinatura e selo do funcionário</small>
              </div>
            </footer>

            <p class="documento__aviso">
              Este documento é provisório e válido por 30 dias. O documento
              definitivo será emitido após validação pelos serviços centrais do
              INATRO.
            </p>
          </div>

          <div v-if="store.motivoFalha" class="ina-erro ina-erro--doc">
            <q-icon name="error" /> {{ store.motivoFalha }}
          </div>
        </div>

        <footer class="modal-doc__foot">
          <template v-if="store.passo === 1">
            <button
              class="page-btn page-btn--outline"
              @click="store.fecharRegistar"
            >
              Cancelar
            </button>
            <button
              class="page-btn page-btn--primary"
              :disabled="!store.formValido"
              @click="store.passo = 2"
            >
              Pré-visualizar documento
            </button>
          </template>
          <template v-else>
            <button class="page-btn page-btn--outline" @click="store.passo = 1">
              <q-icon name="arrow_back" size="16px" />
              Voltar
            </button>
            <button
              class="page-btn page-btn--outline"
              @click="descarregarDocumento"
            >
              <q-icon name="download" size="16px" />
              Descarregar
            </button>
            <button
              class="page-btn page-btn--outline"
              @click="imprimirDocumento"
            >
              <q-icon name="print" size="16px" />
              Imprimir
            </button>
            <button
              class="page-btn page-btn--primary"
              :disabled="store.aSalvar"
              @click="salvar"
            >
              <q-icon name="save" size="16px" />
              {{ store.aSalvar ? "A guardar…" : "Salvar registo" }}
            </button>
          </template>
        </footer>
      </div>
    </q-dialog>

    <!-- ============================================================ -->
    <!-- MODAL — DETALHES DO REGISTO                                  -->
    <!-- ============================================================ -->
    <q-dialog v-model="store.modalDetalhes">
      <div v-if="store.inspecaoDetalhe" class="modal">
        <header class="modal__head">
          <div class="detail-head">
            <div class="placa__icon">
              <q-icon name="directions_car" size="20px" />
            </div>
            <div>
              <h2 class="modal__title">
                {{ store.inspecaoDetalhe.matricula }}
              </h2>
              <small class="modal__sub">{{ store.inspecaoDetalhe.data }}</small>
            </div>
          </div>
          <button class="modal__close" @click="store.modalDetalhes = false">
            <q-icon name="close" size="20px" />
          </button>
        </header>

        <div class="modal__body">
          <div class="detail-row">
            <span>Estado do registo</span>
            <span
              v-if="store.inspecaoDetalhe.estadoRegisto === 'Falhado'"
              class="badge badge--falhado"
            >
              Não passou
            </span>
            <span v-else class="badge badge--regular">
              Aprovado
            </span>
          </div>

          <div
            v-if="store.inspecaoDetalhe.motivoFalha"
            class="detail-row detail-row--motivo"
          >
            <span>Motivo da falha</span>
            <p>{{ store.inspecaoDetalhe.motivoFalha }}</p>
          </div>

          <div class="detail-row">
            <span>Tipo</span>
            <b>{{ store.inspecaoDetalhe.tipo }}</b>
          </div>
          <div v-if="store.inspecaoDetalhe.marca" class="detail-row">
            <span>Marca / Modelo</span>
            <b>
              {{ store.inspecaoDetalhe.marca }}
              {{ store.inspecaoDetalhe.modelo ?? "" }}
            </b>
          </div>
          <div v-if="store.inspecaoDetalhe.ano" class="detail-row">
            <span>Ano</span>
            <b>{{ store.inspecaoDetalhe.ano }}</b>
          </div>
          <div v-if="store.inspecaoDetalhe.cor" class="detail-row">
            <span>Cor</span>
            <b>{{ store.inspecaoDetalhe.cor }}</b>
          </div>
          <div v-if="store.inspecaoDetalhe.proprietario" class="detail-row">
            <span>Proprietário</span>
            <b>{{ store.inspecaoDetalhe.proprietario }}</b>
          </div>
          <div v-if="store.inspecaoDetalhe.nif" class="detail-row">
            <span>NIF</span>
            <b>{{ store.inspecaoDetalhe.nif }}</b>
          </div>
          <div class="detail-row">
            <span>Posto</span>
            <b>{{ store.inspecaoDetalhe.posto }}</b>
          </div>
          <div class="detail-row">
            <span>Data</span>
            <b>{{ store.inspecaoDetalhe.data }}</b>
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
            class="page-btn page-btn--outline"
            @click="imprimirInspecao(store.inspecaoDetalhe)"
          >
            <q-icon name="print" size="16px" />
            Imprimir
          </button>

          <button
            v-if="store.inspecaoDetalhe.estadoRegisto === 'Aprovado'"
            class="page-btn page-btn--primary"
            @click="irParaInspeccao(store.inspecaoDetalhe)"
          >
            <q-icon name="fact_check" size="16px" />
            Fazer inspecção
          </button>
        </footer>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import {
  useInatroVeiculoStore,
  type Inspecao,
} from "@/stores/inatro/inatro-VeiculoStore";

const store = useInatroVeiculoStore();
const router = useRouter();
const $q = useQuasar();

// Carregar do backend ao montar
onMounted(() => {
  store.carregar();
});

// Lista de postos únicos (extraída dos registos carregados)
const postosUnicos = computed(() => {
  const set = new Set<string>();
  for (const r of store.inspecoesRecentes) {
    if (r.posto) set.add(r.posto);
  }
  return Array.from(set).sort();
});

// ============================================================
// IR PARA INSPECÇÃO
// ============================================================
function irParaInspeccao(r: Inspecao | null) {
  if (!r) {
    $q.notify({
      type: "negative",
      message: "Nenhum veículo selecionado",
      position: "top",
    });
    return;
  }

  if (r.estadoRegisto === "Falhado") {
    $q.notify({
      type: "negative",
      message: `Registo ${r.matricula} não passou — não pode ir para inspecção`,
      caption: r.motivoFalha ?? "",
      position: "top",
      timeout: 5000,
    });
    return;
  }

  const ok = store.enviarParaInspeccao(r);
  if (!ok) {
    $q.notify({
      type: "warning",
      message: `Não foi possível enviar ${r.matricula}`,
      position: "top",
    });
    return;
  }

  store.modalDetalhes = false;

  $q.notify({
    type: "positive",
    message: `Veículo ${r.matricula} enviado para inspecção`,
    position: "top",
  });

  router.push("/inatro/inspecoes");
}

// ============================================================
// SALVAR REGISTO
// ============================================================
async function salvar() {
  const matricula = store.matriculaGerada;
  const ok = await store.salvarRegisto();

  if (!ok) {
    if (store.motivoFalha) {
      $q.notify({
        type: "warning",
        message: `Registo ${matricula} — não passou`,
        caption: store.motivoFalha,
        position: "top",
        timeout: 6000,
      });
    } else if (store.erro) {
      $q.notify({
        type: "negative",
        message: store.erro,
        position: "top",
        timeout: 6000,
      });
    }
    return;
  }

  $q.notify({
    type: "positive",
    message: `Registo ${matricula} guardado com sucesso`,
    position: "top",
  });

  store.fecharRegistar();
}

// ============================================================
// IMPRESSÃO DO COMPROVATIVO
// ============================================================
function imprimirDocumento() {
  const el = document.getElementById("documento-print");
  if (!el) return;

  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;

  w.document.write(`
    <html>
      <head>
        <title>Comprovativo ${store.codigoRegisto}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 30px; color: #0f172a; }
          .documento__head { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #065f46; padding-bottom: 14px; margin-bottom: 20px; }
          .documento__logo { width: 56px; height: 56px; border-radius: 12px; background: #ecfdf5; color: #065f46; display: grid; place-items: center; }
          .documento__head-text h3 { margin: 0 0 4px; font-size: 16px; }
          .documento__head-text p { margin: 0; color: #64748b; font-size: 13px; }
          .documento__codigo { margin-left: auto; text-align: right; }
          .documento__codigo small { display: block; color: #64748b; font-size: 10px; text-transform: uppercase; }
          .documento__codigo b { font-size: 14px; }
          .documento__section { margin-bottom: 20px; }
          .documento__section h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #065f46; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 1px solid #e5ebe8; }
          .documento__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
          .documento__grid--full { grid-column: 1 / -1; }
          .documento__grid > div small { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.04em; margin-bottom: 2px; }
          .documento__grid > div b { font-size: 13px; }
          .documento__foot { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5ebe8; }
          .documento__data small { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; }
          .documento__data b { font-size: 13px; }
          .documento__assinatura { text-align: center; }
          .documento__linha { width: 220px; border-top: 1px solid #0f172a; margin: 0 auto 6px; }
          .documento__assinatura small { font-size: 11px; color: #64748b; }
          .documento__aviso { font-size: 11px; color: #64748b; margin-top: 24px; font-style: italic; text-align: center; }
        </style>
      </head>
      <body>${el.outerHTML}</body>
    </html>
  `);
  w.document.close();
  setTimeout(() => {
    w.print();
  }, 250);
}

// ============================================================
// DESCARREGAR COMPROVATIVO
// ============================================================
function descarregarDocumento() {
  const f = store.form;
  const conteudo = `
========================================
   INATRO — COMPROVATIVO DE REGISTO
========================================

Código:          ${store.codigoRegisto}
Data de emissão: ${store.dataEmissao}

--- VEÍCULO ---
Matrícula:       ${store.matriculaGerada}
Tipo:            ${f.tipo}
Marca:           ${f.marca}
Modelo:          ${f.modelo}
Ano:             ${f.ano}
Cor:             ${f.cor}
Combustível:     ${f.combustivel}
Chassis (VIN):   ${f.chassis || "—"}

--- PROPRIETÁRIO ---
Nome:            ${f.proprietario}
NIF:             ${f.nif}
Telefone:        ${f.telefone || "—"}
Província:       ${store.provinciaNome}
Endereço:        ${f.endereco || "—"}

========================================
Documento provisório — válido por 30 dias.
========================================
`.trim();

  const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${store.codigoRegisto}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  $q.notify({
    type: "positive",
    message: "Documento descarregado",
    position: "top",
  });
}

// ============================================================
// IMPRIMIR REGISTO
// ============================================================
function imprimirInspecao(r: Inspecao) {
  const estado = r.estadoRegisto === "Falhado"
    ? "FALHADO — Não passou no registo"
    : "Aprovado";

  const texto = `
INATRO — REGISTO DE VEÍCULO

Matrícula:      ${r.matricula}
Marca/Modelo:   ${r.marca ?? "—"} ${r.modelo ?? ""}
Tipo:           ${r.tipo}
Data:           ${r.data}
Posto:          ${r.posto}
Estado:         ${estado}
${r.motivoFalha ? `Motivo:         ${r.motivoFalha}\n` : ""}Proprietário:   ${r.proprietario ?? "—"}
NIF:            ${r.nif ?? "—"}
`.trim();

  const w = window.open("", "_blank", "width=600,height=700");
  if (!w) return;
  w.document.write(
    `<pre style="font-family: monospace; padding: 20px;">${texto}</pre>`,
  );
  w.document.close();
  w.print();
}

// ============================================================
// EXPORTAR CSV
// ============================================================
function exportarCSV() {
  const headers = ["Matrícula", "Marca", "Modelo", "Tipo", "Data", "Posto", "Estado", "Motivo"];
  const linhas = store.filtrados.map((r) => [
    r.matricula,
    r.marca ?? "—",
    r.modelo ?? "—",
    r.tipo,
    r.data,
    r.posto,
    r.estadoRegisto === "Falhado" ? "Não passou" : "Aprovado",
    r.motivoFalha ?? "—",
  ]);
  const csv = [headers, ...linhas]
    .map((l) => l.map((c) => `"${c}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inatro-registos-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  $q.notify({ type: "positive", message: "CSV exportado", position: "top" });
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
function irVeiculos() {
  router.push("/inatro/veiculos");
}
function irValidas() {
  router.push("/inatro/inspecoes?estado=valida");
}
function irExpiradas() {
  router.push("/inatro/inspecoes?estado=expirada");
}
function irPendentes() {
  router.push("/inatro/inspecoes?estado=pendente");
}
</script>

<style scoped lang="scss">
.ina-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

/* ============================================================ */
/* SKELETON                                                     */
/* ============================================================ */
.ina-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.sk-kpi {
  @extend %sk-block;
  height: 80px;
}

.sk-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 800px) { grid-template-columns: 1fr; }
}

.sk-chart {
  @extend %sk-block;
  height: 260px;
}

.sk-table {
  @extend %sk-block;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  animation: none;
}

.sk-row {
  height: 36px;
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

/* ============================================================ */
/* ERRO                                                         */
/* ============================================================ */
.ina-erro {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  margin-top: 16px;
  border-radius: 10px;
  background: var(--sicam-critical-bg);
  color: var(--sicam-critical-ink);
  font-size: 13px;

  &--doc {
    max-width: 720px;
    margin: 20px auto 0;
  }
}

.chart-card__empty {
  text-align: center;
  color: var(--sicam-muted);
  font-size: 13px;
  padding: 40px 0;
}

/* ============================================================ */
/* Resto dos estilos (mantidos do original)                     */
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

  &--compact { padding: 8px 14px; font-size: 13px; }
  &--primary { background: var(--sicam-primary-light); color: #fff;
    &:hover { background: var(--sicam-primary); }
    &:disabled { opacity: 0.5; cursor: not-allowed; } }
  &--outline { background: #fff; color: var(--sicam-ink); border: 1px solid var(--sicam-line);
    &:hover { background: var(--sicam-surface-hover); } }
}

.alertas { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }

.alerta {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  &__icon { flex-shrink: 0; }
  &__body b { display: block; font-size: 13px; font-weight: 700; }
  &__body small { display: block; font-size: 12px; margin-top: 2px; opacity: 0.85; }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--atencao { background: var(--sicam-warning-bg); color: var(--sicam-warning-ink); }
}

.kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 20px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.kpi {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 0; border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  text-align: left; cursor: pointer; font-family: inherit;
  transition: transform 0.1s, box-shadow 0.15s;

  &:active { transform: scale(0.98); }
  &:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }

  &__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;
    &--primary  { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  }
  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

.charts-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 20px; margin-bottom: 20px;
  @media (max-width: 800px) { grid-template-columns: 1fr; }
}

.chart-card {
  background: #fff; border-radius: 14px; padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__tag { font-size: 11px; color: var(--sicam-muted); background: var(--sicam-surface-alt); padding: 3px 8px; border-radius: 99px; }
  &__body { width: 100%; }
  &__body--ring { display: flex; align-items: center; justify-content: space-around; gap: 24px;
    @media (max-width: 500px) { flex-direction: column; } }
}

.ring {
  position: relative; width: 180px; height: 180px; flex-shrink: 0;
  &__svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  &__track { fill: none; stroke: var(--sicam-line-soft); stroke-width: 10; }
  &__progress { fill: none; stroke: var(--sicam-success); stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease; }
  &__center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 2px; pointer-events: none; }
  &__value { font-size: 36px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 16px; font-weight: 600; color: var(--sicam-muted); align-self: center; padding-bottom: 4px; }
}

.ring-legend {
  display: flex; flex-direction: column; gap: 12px;
  &__item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--sicam-ink-soft);
    b { color: var(--sicam-ink); font-weight: 700; margin-left: 4px; } }
  &__dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    &--success  { background: var(--sicam-success); }
    &--critical { background: var(--sicam-critical); }
    &--warning  { background: var(--sicam-warning); } }
}

.bar-chart {
  display: flex; flex-direction: column; gap: 14px;
  &__row { display: grid; grid-template-columns: 130px 1fr 50px; align-items: center; gap: 12px; }
  &__label { font-size: 13px; color: var(--sicam-ink); text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__bar { height: 10px; background: var(--sicam-line-soft); border-radius: 99px; overflow: hidden; }
  &__fill { height: 100%; background: var(--sicam-primary-light); border-radius: 99px; transition: width 0.5s ease; }
  &__value { font-size: 13px; font-weight: 700; color: var(--sicam-ink); text-align: right; }
}

.filters { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }

.filter {
  display: flex; align-items: center; background: #fff;
  border: 1px solid var(--sicam-line); border-radius: 10px;
  padding: 0 14px; height: 44px; font-family: inherit;

  &--search { flex: 1; min-width: 240px; }
  &__icon { color: var(--sicam-muted); margin-right: 8px; flex-shrink: 0; }
  &__input { flex: 1; border: 0; background: transparent; font-size: 14px; color: var(--sicam-ink); height: 100%;
    &:focus { outline: 0; } &::placeholder { color: var(--sicam-muted); } }
  &__select { border: 0; background: transparent; font-size: 14px; color: var(--sicam-ink); height: 100%; cursor: pointer; min-width: 170px;
    &:focus { outline: 0; } }
}

.block {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  &__head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 14px; border-bottom: 1px solid var(--sicam-line-soft); }
  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__link { font-size: 13px; color: var(--sicam-primary); font-weight: 600; text-decoration: none; }
}

.table-wrap { width: 100%; overflow: hidden; }

.data-table {
  width: 100%; border-collapse: collapse;
  th { text-align: left; font-size: 11px; font-weight: 600; color: var(--sicam-muted);
    letter-spacing: 0.05em; text-transform: uppercase; padding: 12px 16px;
    background: #fafbfa; border-bottom: 1px solid var(--sicam-line); white-space: nowrap; }
  &__th-sort { cursor: pointer; user-select: none; &:hover { color: var(--sicam-ink); } }
  &__th-actions { width: 140px; text-align: right; }
  td { padding: 14px 16px; font-size: 14px; color: var(--sicam-ink);
    border-bottom: 1px solid var(--sicam-line-soft); vertical-align: middle; }
  &__row { cursor: pointer; transition: background 0.15s; &:hover { background: #fbfdfc; } &:last-child td { border-bottom: 0; } }
  &__actions { text-align: right; white-space: nowrap; }
  &__empty { text-align: center; color: var(--sicam-muted); padding: 40px 16px !important; font-size: 14px;
    &-icon { color: var(--sicam-line-strong); margin-bottom: 8px; } p { margin: 0 0 16px; } }
}

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }

.placa {
  display: flex; align-items: center; gap: 8px;
  b { font-weight: 700; letter-spacing: 0.02em; }
  &__icon { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; flex-shrink: 0;
    background: var(--sicam-primary-bg); color: var(--sicam-primary); }
}

.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
  &::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--falhado { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
}

.row-action {
  display: inline-grid; place-items: center; width: 32px; height: 32px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sicam-muted);
  cursor: pointer; margin-left: 2px;
  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }

  &--inspecao {
    color: var(--sicam-primary-light);
    background: var(--sicam-primary-bg);
    border: 1px solid var(--sicam-primary-light);

    &:hover {
      background: var(--sicam-primary);
      color: #fff;
      border-color: var(--sicam-primary);
    }
  }
}

.table-foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 14px 16px; background: #fafbfa;
  border-top: 1px solid var(--sicam-line); flex-wrap: wrap;
  &__info { font-size: 13px; color: var(--sicam-muted); }
  &__nav { display: flex; align-items: center; gap: 10px; }
}

.pag-btn {
  display: inline-grid; place-items: center; width: 32px; height: 32px;
  background: #fff; border: 1px solid var(--sicam-line); border-radius: 8px;
  color: var(--sicam-ink); cursor: pointer;
  &:hover:not(:disabled) { background: var(--sicam-surface-hover); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.pag-info { font-size: 13px; color: var(--sicam-muted); b { color: var(--sicam-ink); } }

.modal-doc {
  background: #fff; width: 100%; height: 100%;
  max-width: 100vw; max-height: 100vh;
  display: flex; flex-direction: column;
  &__head { display: flex; align-items: center; justify-content: space-between;
    padding: 18px 28px; border-bottom: 1px solid var(--sicam-line-soft); flex-shrink: 0; }
  &__title { font-size: 18px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub { font-size: 13px; color: var(--sicam-muted); margin: 2px 0 0; }
  &__close { background: none; border: 0; color: var(--sicam-muted);
    cursor: pointer; padding: 8px; border-radius: 8px; display: flex; align-items: center;
    &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); } }
  &__body { flex: 1; overflow-y: auto; padding: 24px 28px; }
  &__body--doc { background: #f4f8f6; display: grid; place-items: start center; padding: 40px 20px; }
  &__foot { display: flex; justify-content: flex-end; gap: 10px;
    padding: 16px 28px; border-top: 1px solid var(--sicam-line-soft);
    background: #fafbfa; flex-shrink: 0; flex-wrap: wrap; }
}

.form-section {
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--sicam-primary);
  margin: 20px 0 12px; padding-bottom: 6px;
  border-bottom: 1px solid var(--sicam-line-soft);
  &:first-child { margin-top: 0; }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.field {
  display: block;
  &--full { grid-column: 1 / -1; }
  &__label { display: block; font-size: 11px; font-weight: 700;
    color: var(--sicam-muted); text-transform: uppercase;
    letter-spacing: 0.05em; margin-bottom: 6px;
    em { color: var(--sicam-critical); font-style: normal; } }
  &__auto { color: var(--sicam-primary); vertical-align: middle; margin-left: 4px; }
  &__hint { display: block; font-size: 11px; color: var(--sicam-muted); margin-top: 6px; font-style: italic; }
  &__input { display: block; width: 100%; padding: 11px 12px;
    border: 1px solid var(--sicam-line); border-radius: 10px;
    background: #fff; color: var(--sicam-ink);
    font-family: inherit; font-size: 14px;
    transition: border-color 0.15s, box-shadow 0.15s;
    &:focus { outline: 0; border-color: var(--sicam-primary-light);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12); }
    &:disabled { background: var(--sicam-surface-alt); color: var(--sicam-muted); cursor: not-allowed; } }
}

.matricula-box {
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 2px solid var(--sicam-primary-light);
  border-radius: 10px; padding: 10px 14px;
  &__value { flex: 1; font-size: 22px; font-weight: 800;
    letter-spacing: 0.12em; color: var(--sicam-primary); text-align: center; }
  &__refresh { background: rgba(255, 255, 255, 0.8); border: 0;
    width: 32px; height: 32px; border-radius: 8px;
    display: grid; place-items: center; color: var(--sicam-primary);
    cursor: pointer; transition: all 0.15s;
    &:hover { background: #fff; transform: rotate(90deg); } }
}

.documento {
  background: #fff; width: 100%; max-width: 720px;
  border-radius: 12px; padding: 40px 48px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  &__head { display: flex; align-items: center; gap: 16px;
    border-bottom: 3px solid var(--sicam-primary);
    padding-bottom: 16px; margin-bottom: 24px; }
  &__logo { width: 56px; height: 56px; border-radius: 12px;
    background: var(--sicam-primary-bg); color: var(--sicam-primary);
    display: grid; place-items: center; flex-shrink: 0; }
  &__head-text { flex: 1;
    h3 { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 4px; }
    p { font-size: 13px; color: var(--sicam-muted); margin: 0; } }
  &__codigo { text-align: right;
    small { display: block; font-size: 10px; color: var(--sicam-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    b { font-size: 14px; color: var(--sicam-ink); } }
  &__section { margin-bottom: 24px;
    h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--sicam-primary); margin: 0 0 12px;
      padding-bottom: 6px; border-bottom: 1px solid var(--sicam-line-soft); } }
  &__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px;
    &--full { grid-column: 1 / -1; }
    > div small { display: block; font-size: 10px; text-transform: uppercase;
      color: var(--sicam-muted); letter-spacing: 0.04em; margin-bottom: 2px; }
    > div b { font-size: 13px; color: var(--sicam-ink); } }
  &__foot { display: flex; justify-content: space-between; align-items: flex-end;
    margin-top: 48px; padding-top: 24px;
    border-top: 1px solid var(--sicam-line-soft); }
  &__data { small { display: block; font-size: 10px; color: var(--sicam-muted); text-transform: uppercase; }
    b { font-size: 13px; color: var(--sicam-ink); } }
  &__assinatura { text-align: center; small { font-size: 11px; color: var(--sicam-muted); } }
  &__linha { width: 220px; border-top: 1px solid var(--sicam-ink); margin: 0 auto 6px; }
  &__aviso { font-size: 11px; color: var(--sicam-muted);
    margin-top: 28px; font-style: italic; text-align: center; line-height: 1.5; }
}

.modal {
  background: #fff; border-radius: 16px;
  width: 90vw; max-width: 520px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  &__head { display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px; border-bottom: 1px solid var(--sicam-line-soft); }
  &__title { font-size: 17px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub { font-size: 12px; color: var(--sicam-muted); }
  &__close { background: none; border: 0; color: var(--sicam-muted);
    cursor: pointer; padding: 6px; border-radius: 8px; display: flex; align-items: center;
    &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); } }
  &__body { padding: 12px 20px; max-height: 65vh; overflow-y: auto; }
  &__foot { display: flex; justify-content: flex-end; align-items: center; gap: 10px;
    padding: 14px 20px; border-top: 1px solid var(--sicam-line-soft);
    background: #fafbfa; flex-wrap: wrap; }
}

.detail-head { display: flex; align-items: center; gap: 12px; h2 { margin: 0; } }

.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 0;
  border-bottom: 1px solid var(--sicam-line-soft);
  &:last-child { border-bottom: 0; }
  > span:first-child { font-size: 12px; color: var(--sicam-muted);
    text-transform: uppercase; letter-spacing: 0.04em; }
  b { color: var(--sicam-ink); font-size: 14px; }

  &--motivo {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;

    p {
      margin: 0;
      font-size: 13px;
      color: var(--sicam-critical);
      line-height: 1.5;
      background: var(--sicam-critical-bg);
      padding: 10px 14px;
      border-radius: 8px;
      width: 100%;
    }
  }
}
</style>