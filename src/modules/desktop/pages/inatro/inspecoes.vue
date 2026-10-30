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
    <!-- CONTEÚDO REAL                                                 -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Visão Geral — INATRO</h1>
          <p class="page-head__sub">
            Estado das inspecções técnicas e veículos registados
          </p>
        </div>

        <div class="page-head__actions">
          <button class="page-btn page-btn--outline" @click="exportarCSV">
            <q-icon name="file_download" size="18px" />
            Exportar
          </button>
          <button class="page-btn page-btn--outline" @click="irVeiculos">
            <q-icon name="directions_car" size="18px" />
            Ver veículos
          </button>
          <button
            class="page-btn page-btn--primary"
            :disabled="store.veiculosPendentes.length === 0"
            @click="store.abrirInspecao()"
          >
            <q-icon name="add" size="18px" />
            Nova inspecção
            <span v-if="store.veiculosPendentes.length" class="page-btn__badge">
              {{ store.veiculosPendentes.length }}
            </span>
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
        <button class="kpi" @click="irInspecoes">
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="fact_check" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Inspecções no total</div>
          </div>
        </button>

        <button class="kpi" @click="irAprovadas">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="verified" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.aprovadas }}</div>
            <div class="kpi__label">Aprovadas</div>
          </div>
        </button>

        <button class="kpi" @click="irReprovadas">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="warning" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.reprovadas }}</div>
            <div class="kpi__label">Reprovadas</div>
          </div>
        </button>

        <button class="kpi" @click="irPendentes">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="schedule" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.veiculosPendentes.length }}</div>
            <div class="kpi__label">Por inspecionar</div>
          </div>
        </button>
      </section>

      <!-- GRÁFICOS -->
      <div class="charts-grid">
        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Distribuição de inspecções</h2>
            <span class="chart-card__tag">
              {{ store.distribuicaoInspecoes.total }} no total
            </span>
          </header>

          <div class="chart-card__body chart-card__body--pie">
            <div class="pie">
              <svg viewBox="0 0 100 100" class="pie__svg">
                <path
                  v-for="(f, i) in store.distribuicaoInspecoes.fatias"
                  :key="i"
                  :d="f.path"
                  :fill="f.cor"
                  class="pie__slice"
                />
              </svg>
              <div class="pie__center">
                <div class="pie__value">{{ store.taxaAprovacao }}</div>
                <div class="pie__label">% aprovadas</div>
              </div>
            </div>

            <div class="pie-legend">
              <div
                v-for="(f, i) in store.distribuicaoInspecoes.fatias"
                :key="i"
                class="pie-legend__item"
              >
                <span class="pie-legend__dot" :style="{ background: f.cor }" />
                <span class="pie-legend__label">{{ f.label }}</span>
                <b class="pie-legend__value">{{ f.valor }}</b>
                <span class="pie-legend__pct">{{ f.percentagem }}%</span>
              </div>
            </div>
          </div>
        </section>

        <section class="chart-card">
          <header class="chart-card__head">
            <h2 class="chart-card__title">Inspecções por posto</h2>
          </header>

          <div class="chart-card__body">
            <div class="bar-chart">
              <div
                v-for="(b, i) in store.inspecoesPorPosto"
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
              <div v-if="!store.inspecoesPorPosto.length" class="chart-empty">
                Sem dados de postos
              </div>
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
            placeholder="Pesquisar por matrícula, código, posto…"
          />
        </div>

        <select v-model="store.filtroResultado" class="filter filter__select">
          <option value="">Todos os resultados</option>
          <option value="Aprovada">Aprovada</option>
          <option value="Aprovada com observações">Aprovada com observações</option>
          <option value="Reprovada">Reprovada</option>
        </select>

        <select v-model="store.filtroTipo" class="filter filter__select">
          <option value="">Todos os tipos</option>
          <option value="Periódica">Periódica</option>
          <option value="Reinspecção">Reinspecção</option>
          <option value="Extraordinária">Extraordinária</option>
        </select>

        <select v-model="store.filtroPosto" class="filter filter__select">
          <option value="">Todos os postos</option>
          <option v-for="p in postosUnicos" :key="p" :value="p">{{ p }}</option>
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

      <!-- INSPECÇÕES RECENTES -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">Inspecções recentes</h2>
          <router-link to="/inatro/inspecoes" class="block__link">
            Ver todas →
          </router-link>
        </header>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th @click="store.ordenarPor('codigo')" class="data-table__th-sort">
                  Código
                  <q-icon
                    v-if="store.ordenacao.key === 'codigo'"
                    :name="store.iconeOrdenacao"
                    size="14px"
                  />
                </th>
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
                <th @click="store.ordenarPor('resultado')" class="data-table__th-sort">
                  Resultado
                  <q-icon
                    v-if="store.ordenacao.key === 'resultado'"
                    :name="store.iconeOrdenacao"
                    size="14px"
                  />
                </th>
                <th class="data-table__th-actions" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, i) in store.paginados"
                :key="i"
                class="data-table__row"
                @click="store.abrirDetalhes(r)"
              >
                <td class="table-time">{{ r.codigo }}</td>
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
                    class="badge"
                    :class="`badge--${store.resultadoClasse(r.resultado)}`"
                  >
                    {{ r.resultado }}
                  </span>
                </td>
                <td class="data-table__actions" @click.stop>
                  <button
                    class="row-action"
                    title="Ver"
                    @click="store.abrirDetalhes(r)"
                  >
                    <q-icon name="visibility" size="18px" />
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
                <td colspan="7" class="data-table__empty">
                  <q-icon
                    name="search_off"
                    size="40px"
                    class="data-table__empty-icon"
                  />
                  <p>Nenhuma inspecção encontrada com estes filtros.</p>
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
    <!-- MODAL — NOVA INSPECÇÃO                                       -->
    <!-- ============================================================ -->
    <q-dialog v-model="store.modalInspecao" persistent maximized>
      <div class="modal-doc">
        <header class="modal-doc__head">
          <div>
            <h2 class="modal-doc__title">
              {{
                store.passo === 1
                  ? 'Nova inspecção — escolher veículo'
                  : store.passo === 2
                  ? 'Nova inspecção — checklist'
                  : 'Certificado de inspecção'
              }}
            </h2>
            <p class="modal-doc__sub">
              {{
                store.passo === 1
                  ? 'Digite a matrícula do veículo a inspecionar'
                  : store.passo === 2
                  ? 'Verifique cada item e defina o resultado'
                  : 'Confirme os dados antes de guardar'
              }}
            </p>
          </div>
          <button class="modal-doc__close" @click="store.fecharInspecao">
            <q-icon name="close" size="22px" />
          </button>
        </header>

        <!-- PASSO 1 -->
        <div v-if="store.passo === 1" class="modal-doc__body">
          <div v-if="!store.veiculosPendentes.length" class="empty-state">
            <q-icon name="check_circle" size="56px" class="empty-state__icon" />
            <h3 class="empty-state__title">
              Todos os veículos já foram inspeccionados
            </h3>
            <p class="empty-state__sub">
              Não há veículos pendentes de inspecção de momento.
            </p>
            <button
              class="page-btn page-btn--outline"
              @click="store.fecharInspecao"
            >
              Fechar
            </button>
          </div>

          <div v-else class="form-grid">
            <label class="field field--full">
              <span class="field__label">
                Matrícula <em>*</em>
                <span class="field__hint-inline">
                  {{ veiculosFiltrados.length }} de
                  {{ store.veiculosPendentes.length }} disponíveis
                </span>
              </span>

              <div class="autocomplete">
                <div class="autocomplete__input-wrap">
                  <q-icon
                    name="directions_car"
                    size="18px"
                    class="autocomplete__icon"
                  />
                  <input
                    v-model.trim="pesquisaMatricula"
                    type="text"
                    class="field__input field__input--placa autocomplete__input"
                    placeholder="Ex.: AFC-205-MC"
                    maxlength="12"
                    @input="onPesquisaMatricula"
                    @focus="mostrarSugestoes = true"
                  />
                  <button
                    v-if="pesquisaMatricula"
                    class="autocomplete__clear"
                    @click="limparPesquisa"
                    type="button"
                    title="Limpar"
                  >
                    <q-icon name="close" size="16px" />
                  </button>
                </div>

                <ul
                  v-if="
                    mostrarSugestoes &&
                    veiculosFiltrados.length > 0 &&
                    !store.veiculoSelecionado
                  "
                  class="autocomplete__list"
                >
                  <li
                    v-for="v in veiculosFiltrados"
                    :key="v.matricula"
                    class="autocomplete__item"
                    @click="selecionarVeiculo(v.matricula)"
                  >
                    <div class="autocomplete__item-main">
                      <b>{{ v.matricula }}</b>
                      <small>
                        {{ v.marca }} {{ v.modelo }} · {{ v.cor }} · {{ v.ano }}
                      </small>
                    </div>
                    <q-icon
                      name="chevron_right"
                      size="18px"
                      class="autocomplete__item-icon"
                    />
                  </li>
                </ul>

                <div
                  v-if="
                    mostrarSugestoes &&
                    pesquisaMatricula &&
                    veiculosFiltrados.length === 0
                  "
                  class="autocomplete__empty"
                >
                  <q-icon name="search_off" size="20px" />
                  Nenhum veículo pendente encontrado com "{{ pesquisaMatricula }}"
                </div>
              </div>
            </label>
          </div>

          <div v-if="store.veiculoSelecionado" class="veiculo-card">
            <div class="veiculo-card__icon">
              <q-icon name="directions_car" size="24px" />
            </div>
            <div class="veiculo-card__body">
              <b>
                {{ store.veiculoSelecionado.marca }}
                {{ store.veiculoSelecionado.modelo }}
              </b>
              <small>
                {{ store.veiculoSelecionado.matricula }} ·
                {{ store.veiculoSelecionado.cor }} ·
                {{ store.veiculoSelecionado.ano }}
              </small>
              <small>
                Proprietário:
                <b>{{ store.veiculoSelecionado.proprietario }}</b>
              </small>
            </div>
            <div class="veiculo-card__meta">
              <small>NIF</small>
              <b>{{ store.veiculoSelecionado.nif }}</b>
            </div>
          </div>

          <div v-if="store.veiculoSelecionado" class="form-grid">
            <label class="field">
              <span class="field__label">Tipo de inspecção <em>*</em></span>
              <select v-model="store.form.tipo" class="field__input">
                <option value="Periódica">Periódica (anual)</option>
                <option value="Reinspecção">Reinspecção (após reprovação)</option>
                <option value="Extraordinária">Extraordinária</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Posto <em>*</em></span>
              <select v-model="store.form.posto" class="field__input">
                <option value="Posto Baixa">Posto Baixa</option>
                <option value="Posto Matola">Posto Matola</option>
                <option value="Posto Machava">Posto Machava</option>
                <option value="Posto KaMpfumo">Posto KaMpfumo</option>
                <option value="Posto Namaacha">Posto Namaacha</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Inspector <em>*</em></span>
              <select v-model="store.form.inspetor" class="field__input">
                <option value="Insp. Chissano">Insp. Chissano</option>
                <option value="Insp. Nhaca">Insp. Nhaca</option>
                <option value="Insp. Sitoe">Insp. Sitoe</option>
                <option value="Insp. Cumbe">Insp. Cumbe</option>
                <option value="Insp. Tembe">Insp. Tembe</option>
              </select>
            </label>
          </div>
        </div>

        <!-- PASSO 2 -->
        <div v-else-if="store.passo === 2" class="modal-doc__body">
          <div class="veiculo-mini">
            <q-icon name="directions_car" size="18px" />
            <b>{{ store.veiculoSelecionado?.matricula }}</b>
            <span>
              {{ store.veiculoSelecionado?.marca }}
              {{ store.veiculoSelecionado?.modelo }}
            </span>
          </div>

          <div class="checklist-head">
            <div>
              <b>
                {{ store.totalAprovados }} / {{ store.totalItens }} aprovados
              </b>
              <div class="progress-bar">
                <div
                  class="progress-bar__fill"
                  :style="{ width: `${store.progressoChecklist}%` }"
                />
              </div>
            </div>
            <div class="checklist-head__result">
              Resultado sugerido:
              <span
                class="badge"
                :class="`badge--${store.resultadoClasse(store.resultadoSugerido)}`"
              >
                {{ store.resultadoSugerido }}
              </span>
            </div>
          </div>

          <!-- 8 SECÇÕES DINÂMICAS DA BD -->
          <div
            v-for="(sec, si) in store.form.itens"
            :key="sec.chave"
            class="checklist-seccao"
          >
            <h3 class="checklist-seccao__titulo">
              {{ sec.label }}
              <span class="checklist-seccao__badge">
                {{
                  sec.campos.filter((c) => c.aprovado === true).length
                }}/{{ sec.campos.length }}
              </span>
            </h3>

            <ul class="checklist">
              <li
                v-for="item in sec.campos"
                :key="item.chave"
                class="checklist__item"
                :class="{ 'checklist__item--falhou': item.aprovado === false }"
              >
                <span class="checklist__label">{{ item.label }}</span>

                <!-- Booleano → OK / FALHA -->
                <div v-if="item.tipo === 'booleano'" class="checklist__switch">
                  <button
                    class="checklist__btn"
                    :class="{ 'is-active': item.valor === true }"
                    @click="marcarBooleano(item, true)"
                  >
                    <q-icon name="check" size="16px" />
                    OK
                  </button>
                  <button
                    class="checklist__btn checklist__btn--fail"
                    :class="{ 'is-active': item.valor === false }"
                    @click="marcarBooleano(item, false)"
                  >
                    <q-icon name="close" size="16px" />
                    Falha
                  </button>
                </div>

                <!-- Decimal / Número → input -->
                <div v-else-if="item.tipo === 'decimal' || item.tipo === 'numero'" class="checklist__input-wrap">
                  <input
                    v-model.number="item.valor"
                    type="number"
                    step="0.01"
                    class="checklist__input"
                    @input="validarNumerico(item)"
                  />
                  <small v-if="item.unidade" class="checklist__unidade">
                    {{ item.unidade }}
                  </small>
                  <span
                    v-if="item.aprovado !== null"
                    class="checklist__status"
                    :class="item.aprovado ? 'ok' : 'fail'"
                  >
                    {{ item.aprovado ? '✓' : '✗' }}
                  </span>
                </div>

                <!-- Texto -->
                <input
                  v-else-if="item.tipo === 'texto'"
                  v-model.trim="item.valor"
                  type="text"
                  class="checklist__input"
                  @input="validarTexto(item)"
                />

                <!-- Opções -->
                <select
                  v-else-if="item.tipo === 'opcoes'"
                  v-model="item.valor"
                  class="checklist__input"
                  @change="validarTexto(item)"
                >
                  <option value="">—</option>
                  <option v-for="opt in opcoesDoCampo(sec.chave, item.chave)" :key="opt" :value="opt">
                    {{ opt }}
                  </option>
                </select>
              </li>
            </ul>
          </div>

          <div class="form-grid">
            <label class="field field--full">
              <span class="field__label">Resultado final <em>*</em></span>
              <select v-model="store.form.resultado" class="field__input">
                <option value="">Selecione…</option>
                <option value="Aprovada">Aprovada</option>
                <option value="Aprovada com observações">Aprovada com observações</option>
                <option value="Reprovada">Reprovada</option>
              </select>
            </label>

            <label class="field field--full">
              <span class="field__label">Observações</span>
              <textarea
                v-model.trim="store.form.observacoes"
                class="field__input"
                rows="3"
                placeholder="Detalhes adicionais sobre a inspecção…"
              />
            </label>

            <div class="info-box">
              <q-icon name="event" size="18px" />
              Próxima inspecção calculada:
              <b>{{ store.proximaInspecaoCalculada }}</b>
            </div>
          </div>
        </div>

        <!-- PASSO 3 -->
        <div v-else class="modal-doc__body modal-doc__body--doc">
          <div class="documento" id="documento-print">
            <header class="documento__head">
              <div class="documento__logo">
                <q-icon name="fact_check" size="32px" />
              </div>
              <div class="documento__head-text">
                <h3>INATRO — Instituto Nacional de Transportes Rodoviários</h3>
                <p>Certificado de Inspecção Técnica</p>
              </div>
              <div class="documento__codigo">
                <small>Nº</small>
                <b>{{ store.codigoInspecao }}</b>
              </div>
            </header>

            <section class="documento__section">
              <h4>Veículo</h4>
              <div class="documento__grid">
                <div>
                  <small>Matrícula</small>
                  <b>{{ store.veiculoSelecionado?.matricula }}</b>
                </div>
                <div>
                  <small>Marca / Modelo</small>
                  <b>
                    {{ store.veiculoSelecionado?.marca }}
                    {{ store.veiculoSelecionado?.modelo }}
                  </b>
                </div>
                <div>
                  <small>Ano</small>
                  <b>{{ store.veiculoSelecionado?.ano }}</b>
                </div>
                <div>
                  <small>Cor</small>
                  <b>{{ store.veiculoSelecionado?.cor }}</b>
                </div>
                <div>
                  <small>Proprietário</small>
                  <b>{{ store.veiculoSelecionado?.proprietario }}</b>
                </div>
                <div>
                  <small>NIF</small>
                  <b>{{ store.veiculoSelecionado?.nif }}</b>
                </div>
              </div>
            </section>

            <section class="documento__section">
              <h4>Inspecção</h4>
              <div class="documento__grid">
                <div>
                  <small>Tipo</small><b>{{ store.form.tipo }}</b>
                </div>
                <div>
                  <small>Resultado</small><b>{{ store.form.resultado }}</b>
                </div>
                <div>
                  <small>Posto</small><b>{{ store.form.posto }}</b>
                </div>
                <div>
                  <small>Inspector</small><b>{{ store.form.inspetor }}</b>
                </div>
                <div>
                  <small>Data</small><b>{{ store.dataEmissao }}</b>
                </div>
                <div>
                  <small>Próxima inspecção</small>
                  <b>{{ store.proximaInspecaoCalculada }}</b>
                </div>
              </div>
            </section>

            <section class="documento__section">
              <h4>Resumo do checklist</h4>
              <ul class="documento__itens">
                <li v-for="sec in store.form.itens" :key="sec.chave">
                  <span>{{ sec.label }}</span>
                  <b>
                    {{ sec.campos.filter((c) => c.aprovado === true).length }}/{{
                      sec.campos.length
                    }}
                  </b>
                </li>
              </ul>
            </section>

            <footer class="documento__foot">
              <div class="documento__data">
                <small>Emitido em</small>
                <b>{{ store.dataEmissao }}</b>
              </div>
              <div class="documento__assinatura">
                <div class="documento__linha" />
                <small>{{ store.form.inspetor }}</small>
              </div>
            </footer>
          </div>
        </div>

        <!-- RODAPÉ -->
        <footer class="modal-doc__foot">
          <template v-if="store.passo === 1">
            <button
              class="page-btn page-btn--outline"
              @click="store.fecharInspecao"
            >
              Cancelar
            </button>
            <button
              class="page-btn page-btn--primary"
              :disabled="!store.veiculoSelecionado"
              @click="store.passo = 2"
            >
              Próximo — checklist
            </button>
          </template>
          <template v-else-if="store.passo === 2">
            <button
              class="page-btn page-btn--outline"
              @click="store.passo = 1"
            >
              <q-icon name="arrow_back" size="16px" />
              Voltar
            </button>
            <button
              class="page-btn page-btn--primary"
              :disabled="!store.formValido"
              @click="store.passo = 3"
            >
              Pré-visualizar certificado
            </button>
          </template>
          <template v-else>
            <button
              class="page-btn page-btn--outline"
              @click="store.passo = 2"
            >
              <q-icon name="arrow_back" size="16px" />
              Voltar
            </button>
            <button
              class="page-btn page-btn--outline"
              @click="imprimirCertificado"
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
              {{ store.aSalvar ? 'A guardar…' : 'Salvar inspecção' }}
            </button>
          </template>
        </footer>
      </div>
    </q-dialog>

    <!-- ============================================================ -->
    <!-- MODAL — DETALHES DA INSPECÇÃO                                -->
    <!-- ============================================================ -->
    <q-dialog v-model="store.modalDetalhes">
      <div v-if="store.inspecaoDetalhe" class="modal">
        <header class="modal__head">
          <div class="detail-head">
            <div class="detail-head__icon">
              <q-icon name="fact_check" size="20px" />
            </div>
            <div>
              <h2 class="modal__title">
                {{ store.inspecaoDetalhe.matricula }}
              </h2>
              <small class="modal__sub">
                {{ store.inspecaoDetalhe.codigo }}
              </small>
            </div>
          </div>
          <button class="modal__close" @click="store.modalDetalhes = false">
            <q-icon name="close" size="20px" />
          </button>
        </header>

        <div class="modal__body">
          <div class="detail-row">
            <span>Resultado</span>
            <span
              class="badge"
              :class="`badge--${store.resultadoClasse(store.inspecaoDetalhe.resultado)}`"
            >
              {{ store.inspecaoDetalhe.resultado }}
            </span>
          </div>
          <div class="detail-row">
            <span>Tipo</span><b>{{ store.inspecaoDetalhe.tipo }}</b>
          </div>
          <div class="detail-row">
            <span>Data</span><b>{{ store.inspecaoDetalhe.data }}</b>
          </div>
          <div class="detail-row">
            <span>Posto</span><b>{{ store.inspecaoDetalhe.posto }}</b>
          </div>
          <div class="detail-row">
            <span>Inspector</span><b>{{ store.inspecaoDetalhe.inspetor }}</b>
          </div>
          <div class="detail-row">
            <span>Próxima</span>
            <b>{{ store.inspecaoDetalhe.proximaInspecao }}</b>
          </div>

          <div v-if="store.inspecaoDetalhe.observacoes" class="detail-obs">
            <b>Observações</b>
            <p>{{ store.inspecaoDetalhe.observacoes }}</p>
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
            @click="imprimirInspecao(store.inspecaoDetalhe)"
          >
            <q-icon name="print" size="16px" />
            Imprimir
          </button>
        </footer>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import {
  useInatroInspecoesStore,
  type ChecklistItemForm,
} from '@/stores/inatro/inatro-inspecoesStore'

const store = useInatroInspecoesStore()
const router = useRouter()
const $q = useQuasar()

// ============================================================
// Autocomplete de matrícula
// ============================================================
const pesquisaMatricula = ref('')
const mostrarSugestoes = ref(false)

const veiculosFiltrados = computed(() => {
  const q = pesquisaMatricula.value.trim().toUpperCase()
  if (!q) return store.veiculosPendentes

  return store.veiculosPendentes.filter(
    (v) =>
      v.matricula.toUpperCase().includes(q) ||
      v.marca.toUpperCase().includes(q) ||
      v.modelo.toUpperCase().includes(q),
  )
})

function onPesquisaMatricula() {
  mostrarSugestoes.value = true
  if (
    store.matriculaSelecionada &&
    pesquisaMatricula.value !== store.matriculaSelecionada
  ) {
    store.veiculoSelecionado = null
    store.matriculaSelecionada = ''
  }
}

function selecionarVeiculo(matricula: string) {
  pesquisaMatricula.value = matricula
  mostrarSugestoes.value = false
  store.selecionarVeiculo(matricula)
}

function limparPesquisa() {
  pesquisaMatricula.value = ''
  mostrarSugestoes.value = false
  store.veiculoSelecionado = null
  store.matriculaSelecionada = ''
}

// ============================================================
// Postos únicos (extraídos das inspeções)
// ============================================================
const postosUnicos = computed(() => {
  const set = new Set<string>()
  for (const i of store.inspecoes) {
    if (i.posto && i.posto !== '—') set.add(i.posto)
  }
  return Array.from(set).sort()
})

// ============================================================
// Checklist helpers
// ============================================================
function marcarBooleano(item: ChecklistItemForm, valor: boolean) {
  item.valor = valor
  // Se o campo é "invertido" (ex: corrosão), true significa falha
  // → verificamos o campo na estrutura
  const campo = encontrarCampo(item.chave)
  if (campo?.invertido) {
    item.aprovado = !valor
  } else {
    item.aprovado = valor
  }
}

function validarNumerico(item: ChecklistItemForm) {
  const campo = encontrarCampo(item.chave)
  if (!campo) return

  const v = item.valor
  if (v === null || v === '' || v === undefined) {
    item.aprovado = null
    return
  }

  const num = Number(v)
  if (isNaN(num)) {
    item.aprovado = null
    return
  }

  if (campo.min !== null && num < campo.min) {
    item.aprovado = false
    return
  }
  if (campo.max !== null && num > campo.max) {
    item.aprovado = false
    return
  }
  item.aprovado = true
}

function validarTexto(item: ChecklistItemForm) {
  const v = item.valor
  item.aprovado = v !== null && v !== undefined && String(v).trim() !== ''
}

function encontrarCampo(chave: string) {
  for (const sec of store.checklistEstrutura) {
    const c = sec.campos.find((x) => x.chave === chave)
    if (c) return c
  }
  return null
}

function opcoesDoCampo(seccaoChave: string, campoChave: string): string[] {
  const sec = store.checklistEstrutura.find((s) => s.chave === seccaoChave)
  const campo = sec?.campos.find((c) => c.chave === campoChave)
  return campo?.opcoes ?? []
}

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.autocomplete')) {
      mostrarSugestoes.value = false
    }
  })
})

// Sincronizar input quando o modal abre
watch(
  () => store.modalInspecao,
  (aberto) => {
    if (aberto) {
      pesquisaMatricula.value = store.matriculaSelecionada || ''
      mostrarSugestoes.value = false
    }
  },
)

// ============================================================
// Salvar
// ============================================================
async function salvar() {
  const codigo = store.codigoInspecao
  const matricula = store.veiculoSelecionado?.matricula

  const ok = await store.salvarInspecao()
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
    message: `Inspecção ${codigo} (${matricula}) guardada`,
    position: 'top',
  })
  store.fecharInspecao()
}

// ============================================================
// Imprimir certificado
// ============================================================
function imprimirCertificado() {
  const el = document.getElementById('documento-print')
  if (!el) return
  const w = window.open('', '_blank', 'width=800,height=900')
  if (!w) return
  w.document.write(`
    <html><head><title>Certificado ${store.codigoInspecao}</title>
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
      .documento__section h4 { font-size: 12px; text-transform: uppercase; color: #065f46; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 1px solid #e5ebe8; }
      .documento__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
      .documento__grid > div small { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
      .documento__itens { list-style: none; padding: 0; margin: 0; }
      .documento__itens li { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5ebe8; font-size: 13px; }
      .documento__foot { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5ebe8; }
      .documento__assinatura { text-align: center; }
      .documento__linha { width: 220px; border-top: 1px solid #0f172a; margin: 0 auto 6px; }
    </style></head><body>${el.outerHTML}</body></html>`)
  w.document.close()
  setTimeout(() => w.print(), 250)
}

// ============================================================
// Imprimir inspecção (do detalhe)
// ============================================================
function imprimirInspecao(r: any) {
  const texto = `
INATRO — CERTIFICADO DE INSPECÇÃO
${r.codigo}

Matrícula:  ${r.matricula}
Marca/Mod:  ${r.marca} ${r.modelo}
Tipo:       ${r.tipo}
Data:       ${r.data}
Posto:      ${r.posto}
Inspector:  ${r.inspetor}
Resultado:  ${r.resultado}
Próxima:    ${r.proximaInspecao}
`.trim()
  const w = window.open('', '_blank', 'width=600,height=700')
  if (!w) return
  w.document.write(
    `<pre style="font-family: monospace; padding: 20px;">${texto}</pre>`,
  )
  w.document.close()
  w.print()
}

// ============================================================
// Exportar CSV
// ============================================================
function exportarCSV() {
  const headers = [
    'Código',
    'Matrícula',
    'Marca',
    'Modelo',
    'Tipo',
    'Data',
    'Posto',
    'Inspector',
    'Resultado',
    'Próxima',
  ]
  const linhas = store.filtrados.map((r) => [
    r.codigo,
    r.matricula,
    r.marca,
    r.modelo,
    r.tipo,
    r.data,
    r.posto,
    r.inspetor,
    r.resultado,
    r.proximaInspecao,
  ])
  const csv = [headers, ...linhas]
    .map((l) => l.map((c) => `"${c}"`).join(';'))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inatro-inspecoes-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  $q.notify({ type: 'positive', message: 'CSV exportado', position: 'top' })
}

// ============================================================
// Navegação
// ============================================================
function irInspecoes() {
  router.push('/inatro/inspecoes')
}
function irVeiculos() {
  router.push('/inatro/veiculos')
}
function irAprovadas() {
  router.push('/inatro/inspecoes?resultado=aprovada')
}
function irReprovadas() {
  router.push('/inatro/inspecoes?resultado=reprovada')
}
function irPendentes() {
  router.push('/inatro/inspecoes?estado=pendente')
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
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.sk-kpi { @extend %sk-block; height: 80px; }

.sk-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 800px) { grid-template-columns: 1fr; }
}

.sk-chart { @extend %sk-block; height: 260px; }

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
/* Cabeçalho                                                    */
/* ============================================================ */
.page-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 20px;
  @media (max-width: 700px) { flex-direction: column; }
  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0; }
  &__actions { display: flex; gap: 10px; flex-wrap: wrap; }
}

.page-btn {
  display: inline-flex; align-items: center; gap: 8px;
  border: 0; border-radius: 10px; padding: 10px 18px;
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: all 0.15s; position: relative;
  &--compact { padding: 8px 14px; font-size: 13px; }
  &--primary { background: var(--sicam-primary-light); color: #fff;
    &:hover:not(:disabled) { background: var(--sicam-primary); }
    &:disabled { opacity: 0.5; cursor: not-allowed; } }
  &--outline { background: #fff; color: var(--sicam-ink); border: 1px solid var(--sicam-line);
    &:hover { background: var(--sicam-surface-hover); } }
  &__badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 20px; height: 20px; padding: 0 6px;
    background: #fff; color: var(--sicam-primary);
    font-size: 11px; font-weight: 700; border-radius: 99px;
  }
}

/* ============================================================ */
/* Alertas / KPIs / gráficos                                    */
/* ============================================================ */
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
}
.chart-card__body--pie {
  display: flex; align-items: center; justify-content: space-around;
  gap: 28px;
  @media (max-width: 560px) { flex-direction: column; }
}
.pie {
  position: relative; width: 200px; height: 200px; flex-shrink: 0;
  &__svg { width: 100%; height: 100%; filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.08)); }
  &__slice {
    transition: opacity 0.15s, transform 0.15s;
    transform-origin: 50% 50%;
    cursor: pointer;
    &:hover { opacity: 0.85; transform: scale(1.03); }
  }
  &__center {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    pointer-events: none;
  }
  &__value { font-size: 32px; font-weight: 800; color: var(--sicam-ink); line-height: 1; letter-spacing: -0.02em; }
  &__label { font-size: 10px; font-weight: 600; color: var(--sicam-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
}
.pie-legend {
  display: flex; flex-direction: column; gap: 12px; min-width: 180px;
  &__item { display: grid; grid-template-columns: 12px 1fr auto auto; align-items: center; gap: 10px; font-size: 13px; }
  &__dot { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
  &__label { color: var(--sicam-ink-soft); font-weight: 500; }
  &__value { color: var(--sicam-ink); font-weight: 700; font-size: 14px; }
  &__pct { font-size: 11px; color: var(--sicam-muted); font-weight: 600; min-width: 42px; text-align: right; }
}
.bar-chart {
  display: flex; flex-direction: column; gap: 14px;
  &__row { display: grid; grid-template-columns: 130px 1fr 50px; align-items: center; gap: 12px; }
  &__label { font-size: 13px; color: var(--sicam-ink); text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__bar { height: 10px; background: var(--sicam-line-soft); border-radius: 99px; overflow: hidden; }
  &__fill { height: 100%; background: var(--sicam-primary-light); border-radius: 99px; transition: width 0.5s ease; }
  &__value { font-size: 13px; font-weight: 700; color: var(--sicam-ink); text-align: right; }
}
.chart-empty { text-align: center; padding: 30px 0; color: var(--sicam-muted); font-size: 13px; }

/* ============================================================ */
/* Filtros / Tabela                                             */
/* ============================================================ */
.filters { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.filter {
  display: flex; align-items: center; background: #fff;
  border: 1px solid var(--sicam-line); border-radius: 10px;
  padding: 0 14px; height: 44px; font-family: inherit;
  &--search { flex: 1; min-width: 240px; }
  &__icon { color: var(--sicam-muted); margin-right: 8px; flex-shrink: 0; }
  &__input { flex: 1; border: 0; background: transparent; font-size: 14px; color: var(--sicam-ink); height: 100%;
    &:focus { outline: 0; } &::placeholder { color: var(--sicam-muted); } }
  &__select { border: 0; background: transparent; font-size: 14px; color: var(--sicam-ink); height: 100%; cursor: pointer; min-width: 160px;
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
  &__th-actions { width: 100px; text-align: right; }
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
  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}
.row-action {
  display: inline-grid; place-items: center; width: 32px; height: 32px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sicam-muted);
  cursor: pointer; margin-left: 2px;
  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
}
.table-foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 14px 16px; background: #fafbfa;
  border-top: 1px solid var(--sicam-line); flex-wrap: wrap;
  &__info { font-size: 13px; color: var(--sicam-muted); }
  &__nav { display: flex; align-items: center; gap: 10px; }
}
.pag-btn { display: inline-grid; place-items: center; width: 32px; height: 32px;
  background: #fff; border: 1px solid var(--sicam-line); border-radius: 8px;
  color: var(--sicam-ink); cursor: pointer;
  &:hover:not(:disabled) { background: var(--sicam-surface-hover); }
  &:disabled { opacity: 0.4; cursor: not-allowed; } }
.pag-info { font-size: 13px; color: var(--sicam-muted); b { color: var(--sicam-ink); } }

/* ============================================================ */
/* Modal Nova Inspecção                                         */
/* ============================================================ */
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
  &__hint-inline {
    font-size: 10px; font-weight: 400; color: var(--sicam-muted);
    text-transform: none; letter-spacing: 0; margin-left: 6px;
  }
  &__input { display: block; width: 100%; padding: 11px 12px;
    border: 1px solid var(--sicam-line); border-radius: 10px;
    background: #fff; color: var(--sicam-ink);
    font-family: inherit; font-size: 14px;
    transition: border-color 0.15s, box-shadow 0.15s;
    &:focus { outline: 0; border-color: var(--sicam-primary-light);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12); }
    &--placa {
      font-size: 16px; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
    } }
}

.autocomplete {
  position: relative;
  &__input-wrap { position: relative; display: flex; align-items: center; }
  &__icon { position: absolute; left: 14px; color: var(--sicam-muted); pointer-events: none; z-index: 1; }
  &__input { padding-left: 42px !important; padding-right: 42px !important; }
  &__clear {
    position: absolute; right: 8px;
    background: none; border: 0; color: var(--sicam-muted);
    cursor: pointer; padding: 6px; border-radius: 6px;
    display: flex; align-items: center;
    &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
  }
  &__list {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 100;
    list-style: none; padding: 6px 0; margin: 0;
    background: #fff; border: 1px solid var(--sicam-line); border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    max-height: 280px; overflow-y: auto;
  }
  &__item {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 10px 14px; cursor: pointer; transition: background 0.12s;
    &:hover { background: var(--sicam-primary-bg); }
    &-main {
      min-width: 0; flex: 1;
      b { display: block; font-size: 14px; font-weight: 700; color: var(--sicam-ink); letter-spacing: 0.02em; }
      small { display: block; font-size: 12px; color: var(--sicam-muted); margin-top: 2px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }
    &-icon { color: var(--sicam-line-strong); flex-shrink: 0; }
  }
  &__empty {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; gap: 8px;
    padding: 14px 16px; background: #fff;
    border: 1px solid var(--sicam-line); border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    font-size: 13px; color: var(--sicam-muted);
    .q-icon { color: var(--sicam-line-strong); flex-shrink: 0; }
  }
}

.veiculo-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px; margin: 16px 0;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 2px solid var(--sicam-primary-light);
  border-radius: 12px;
  &__icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: #fff; color: var(--sicam-primary);
    display: grid; place-items: center; flex-shrink: 0;
  }
  &__body { flex: 1; min-width: 0;
    b { display: block; font-size: 15px; color: var(--sicam-ink); }
    small { display: block; font-size: 12px; color: var(--sicam-muted); margin-top: 3px;
      b { display: inline; font-size: 12px; } } }
  &__meta { text-align: right; flex-shrink: 0;
    small { display: block; font-size: 10px; color: var(--sicam-muted); text-transform: uppercase; }
    b { font-size: 13px; color: var(--sicam-ink); } }
}

.veiculo-mini {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px; margin-bottom: 16px;
  background: var(--sicam-primary-bg); color: var(--sicam-primary);
  border-radius: 99px; font-size: 13px;
  b { font-weight: 700; letter-spacing: 0.02em; }
  span { color: var(--sicam-ink-soft); }
}

.empty-state {
  text-align: center; padding: 60px 20px;
  &__icon { color: var(--sicam-success); margin-bottom: 12px; }
  &__title { font-size: 18px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0 0 20px; }
}

/* ============================================================ */
/* Checklist (8 secções)                                        */
/* ============================================================ */
.checklist-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 16px; margin-bottom: 20px;
  background: var(--sicam-surface-alt); border-radius: 12px;
  b { font-size: 14px; color: var(--sicam-ink); }
  &__result { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--sicam-muted); }
}
.progress-bar {
  margin-top: 8px; height: 6px; width: 200px;
  background: var(--sicam-line-soft); border-radius: 99px; overflow: hidden;
  &__fill { height: 100%; background: var(--sicam-success); border-radius: 99px; transition: width 0.3s; }
}

.checklist-seccao {
  margin-bottom: 24px;
  &__titulo {
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px; font-weight: 700; color: var(--sicam-primary);
    text-transform: uppercase; letter-spacing: 0.04em;
    margin: 0 0 12px; padding-bottom: 6px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }
  &__badge {
    font-size: 11px; font-weight: 700;
    background: var(--sicam-primary-bg); color: var(--sicam-primary);
    padding: 2px 10px; border-radius: 99px;
  }
}

.checklist {
  list-style: none; padding: 0; margin: 0;
  &__item {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 10px 14px;
    background: #fff; border: 1px solid var(--sicam-line);
    border-radius: 10px; margin-bottom: 6px;
    transition: border-color 0.15s, background 0.15s;
    &--falhou { border-color: var(--sicam-critical); background: rgba(220, 38, 38, 0.03); }
  }
  &__label { font-size: 13px; color: var(--sicam-ink); font-weight: 500; flex: 1; }
  &__switch { display: flex; gap: 4px; flex-shrink: 0; }
  &__btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 6px 12px; border: 1px solid var(--sicam-line);
    background: #fff; border-radius: 8px;
    font-family: inherit; font-size: 12px; font-weight: 600;
    color: var(--sicam-muted); cursor: pointer;
    transition: all 0.15s;
    &:hover { background: var(--sicam-surface-hover); }
    &.is-active { background: var(--sicam-success); color: #fff; border-color: var(--sicam-success); }
    &--fail.is-active { background: var(--sicam-critical); border-color: var(--sicam-critical); }
  }
  &__input-wrap {
    display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  }
  &__input {
    width: 110px; padding: 6px 10px;
    border: 1px solid var(--sicam-line); border-radius: 8px;
    background: #fff; font-family: inherit; font-size: 13px;
    text-align: right;
    &:focus { outline: 0; border-color: var(--sicam-primary-light); }
  }
  &__unidade { font-size: 11px; color: var(--sicam-muted); min-width: 30px; }
  &__status {
    display: inline-grid; place-items: center;
    width: 22px; height: 22px; border-radius: 50%;
    font-size: 12px; font-weight: 700;
    &.ok { background: var(--sicam-success-bg); color: var(--sicam-success-ink); }
    &.fail { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }
}

.info-box {
  grid-column: 1 / -1;
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px; background: var(--sicam-primary-bg);
  border-radius: 10px; font-size: 13px; color: var(--sicam-primary);
  b { font-weight: 700; }
}

/* ============================================================ */
/* Documento / Certificado                                      */
/* ============================================================ */
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
    small { display: block; font-size: 10px; color: var(--sicam-muted); text-transform: uppercase; }
    b { font-size: 14px; color: var(--sicam-ink); } }
  &__section { margin-bottom: 24px;
    h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--sicam-primary); margin: 0 0 12px;
      padding-bottom: 6px; border-bottom: 1px solid var(--sicam-line-soft); } }
  &__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px;
    > div small { display: block; font-size: 10px; text-transform: uppercase;
      color: var(--sicam-muted); letter-spacing: 0.04em; margin-bottom: 2px; }
    > div b { font-size: 13px; color: var(--sicam-ink); } }
  &__itens {
    list-style: none; padding: 0; margin: 0;
    li { display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; border-bottom: 1px solid var(--sicam-line-soft);
      font-size: 13px;
      &:last-child { border-bottom: 0; }
      b { color: var(--sicam-primary); font-weight: 700; } }
  }
  &__foot { display: flex; justify-content: space-between; align-items: flex-end;
    margin-top: 48px; padding-top: 24px;
    border-top: 1px solid var(--sicam-line-soft); }
  &__data { small { display: block; font-size: 10px; color: var(--sicam-muted); text-transform: uppercase; }
    b { font-size: 13px; color: var(--sicam-ink); } }
  &__assinatura { text-align: center; small { font-size: 11px; color: var(--sicam-muted); } }
  &__linha { width: 220px; border-top: 1px solid var(--sicam-ink); margin: 0 auto 6px; }
}

/* ============================================================ */
/* Modal Detalhes                                               */
/* ============================================================ */
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
  &__foot { display: flex; justify-content: flex-end; gap: 10px;
    padding: 14px 20px; border-top: 1px solid var(--sicam-line-soft);
    background: #fafbfa; }
}
.detail-head { display: flex; align-items: center; gap: 12px; h2 { margin: 0; }
  &__icon { width: 36px; height: 36px; border-radius: 10px;
    background: var(--sicam-primary-bg); color: var(--sicam-primary);
    display: grid; place-items: center; flex-shrink: 0; } }
.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 0;
  border-bottom: 1px solid var(--sicam-line-soft);
  &:last-child { border-bottom: 0; }
  > span:first-child { font-size: 12px; color: var(--sicam-muted);
    text-transform: uppercase; letter-spacing: 0.04em; }
  b { color: var(--sicam-ink); font-size: 14px; }
}
.detail-obs {
  margin-top: 16px; padding-top: 16px;
  border-top: 1px solid var(--sicam-line-soft);
  > b { display: block; font-size: 11px; text-transform: uppercase;
    color: var(--sicam-muted); letter-spacing: 0.05em; margin-bottom: 8px; }
  p { font-size: 13px; color: var(--sicam-ink); margin: 0; line-height: 1.5; }
}
</style>