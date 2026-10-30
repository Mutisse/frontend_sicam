<template>
  <q-page class="hl-page">
    <!-- CABEÇALHO -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Hotlist</h1>
        <p class="page-head__sub">
          Veículos procurados — sincronizado de forma cifrada para os
          dispositivos
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="sincronizar">
          <q-icon name="sync" size="18px" :class="{ spinning: aSincronizar }" />
          {{ aSincronizar ? "A sincronizar…" : "Sincronizar agora" }}
        </button>
        <button class="page-btn page-btn--outline" @click="exportar">
          <q-icon name="download" size="18px" />
          Exportar
        </button>
        <button
          class="page-btn page-btn--primary"
          @click="store.abrirAdicionar"
        >
          <q-icon name="add" size="18px" />
          Adicionar à Hotlist
        </button>
      </div>
    </header>

    <!-- SKELETON -->
    <div v-if="!store.carregado" class="hl-skeleton">
      <div class="sk-kpis">
        <AppFbLoader variant="list" :items="4" />
      </div>
      <div class="sk-filters">
        <AppFbLoader variant="block" height="60px" />
      </div>
      <AppFbLoader variant="list" :items="5" />
    </div>

    <!-- CONTEÚDO -->
    <template v-else>
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
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="local_police" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Veículos procurados</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Furtado')">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="report" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.furtados }}</div>
            <div class="kpi__label">Furtados</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Clonagem suspeita')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="content_copy" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.clonagem }}</div>
            <div class="kpi__label">Clonagem</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Mandado de captura')">
          <div class="kpi__icon kpi__icon--info">
            <q-icon name="gavel" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.mandados }}</div>
            <div class="kpi__label">Mandados de captura</div>
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
            placeholder="Pesquisar por matrícula, motivo, marca…"
          />
        </div>

        <select v-model="store.filtroMotivo" class="filter filter__select">
          <option value="">Todos os motivos</option>
          <option v-for="m in store.MOTIVOS" :key="m" :value="m">
            {{ m }}
          </option>
        </select>

        <select v-model="store.filtroNivel" class="filter filter__select">
          <option value="">Todos os níveis</option>
          <option v-for="n in store.NIVEIS" :key="n" :value="n">{{ n }}</option>
        </select>

        <select v-model="store.filtroEstado" class="filter filter__select">
          <option value="">Todos os estados</option>
          <option v-for="e in store.ESTADOS" :key="e" :value="e">
            {{ e }}
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

      <!-- Barra de resultados -->
      <div class="results-bar">
        <span class="results-bar__count">
          <b>{{ store.filtrados.length }}</b>
          {{ store.filtrados.length === 1 ? "resultado" : "resultados" }}
          <span v-if="store.selecionados.length" class="results-bar__sel">
            · {{ store.selecionados.length }} selecionado(s)
          </span>
        </span>

        <div v-if="store.selecionados.length" class="results-bar__bulk">
          <button class="bulk-btn" @click="exportarSelecionados">
            <q-icon name="download" size="16px" />
            Exportar
          </button>
          <button
            class="bulk-btn bulk-btn--danger"
            @click="removerSelecionados"
          >
            <q-icon name="delete" size="16px" />
            Remover
          </button>
          <button class="bulk-btn bulk-btn--ghost" @click="store.limparSelecao">
            Cancelar
          </button>
        </div>
      </div>

      <!-- TABELA -->
      <section class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th class="data-table__th-check">
                <input
                  type="checkbox"
                  :checked="store.todosSelecionados"
                  @change="store.toggleTodos"
                />
              </th>
              <th
                @click="store.ordenarPor('matricula')"
                class="data-table__th-sort"
              >
                Matrícula
                <q-icon
                  v-if="store.ordenacao.key === 'matricula'"
                  :name="store.iconeOrdenacao"
                  size="14px"
                />
              </th>
              <th>Motivo</th>
              <th
                @click="store.ordenarPor('nivel')"
                class="data-table__th-sort"
              >
                Nível
                <q-icon
                  v-if="store.ordenacao.key === 'nivel'"
                  :name="store.iconeOrdenacao"
                  size="14px"
                />
              </th>
              <th>Origem</th>
              <th
                @click="store.ordenarPor('dataInsercao')"
                class="data-table__th-sort"
              >
                Inserido em
                <q-icon
                  v-if="store.ordenacao.key === 'dataInsercao'"
                  :name="store.iconeOrdenacao"
                  size="14px"
                />
              </th>
              <th
                @click="store.ordenarPor('abordagens')"
                class="data-table__th-sort"
              >
                Abordagens
                <q-icon
                  v-if="store.ordenacao.key === 'abordagens'"
                  :name="store.iconeOrdenacao"
                  size="14px"
                />
              </th>
              <th>Estado</th>
              <th class="data-table__th-actions">Acções</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="v in store.paginados"
              :key="v.id"
              class="data-table__row"
              :class="{
                'data-table__row--selected': store.selecionados.includes(v.id),
              }"
              @click="store.abrirDetalhes(v)"
            >
              <td class="data-table__td-check" @click.stop>
                <input
                  type="checkbox"
                  :checked="store.selecionados.includes(v.id)"
                  @change="store.toggleSelecionado(v.id)"
                />
              </td>

              <td>
                <div class="placa">
                  <div
                    class="placa__icon"
                    :class="`placa__icon--${store.nivelClasse(v.nivel)}`"
                  >
                    <q-icon name="directions_car" size="18px" />
                  </div>
                  <div class="placa__info">
                    <b>{{ v.matricula }}</b>
                    <small>{{ v.marca }} {{ v.modelo }} · {{ v.cor }}</small>
                  </div>
                </div>
              </td>

              <td>
                <span class="motivo-chip">
                  <q-icon :name="store.motivoIcone(v.motivo)" size="13px" />
                  {{ v.motivo }}
                </span>
              </td>

              <td>
                <span
                  class="nivel"
                  :class="`nivel--${store.nivelClasse(v.nivel)}`"
                >
                  {{ v.nivel }}
                </span>
              </td>

              <td class="cell-muted">{{ v.origem }}</td>

              <td class="table-time">
                <div>{{ v.dataInsercao }}</div>
                <small>{{ v.horaInsercao }}</small>
              </td>

              <td>
                <div class="abordagens">
                  <q-icon name="visibility" size="16px" />
                  <b>{{ v.abordagens }}</b>
                </div>
              </td>

              <td>
                <span
                  class="badge"
                  :class="`badge--${v.estado === 'Ativo' ? 'critico' : 'regular'}`"
                >
                  {{ v.estado }}
                </span>
              </td>

              <td class="data-table__actions" @click.stop>
                <div class="actions-group">
                  <button
                    class="row-action"
                    title="Ver"
                    @click="store.abrirDetalhes(v)"
                  >
                    <q-icon name="visibility" size="17px" />
                  </button>
                  <button class="row-action" title="Editar" @click="editar(v)">
                    <q-icon name="edit" size="17px" />
                  </button>
                  <button
                    v-if="v.estado === 'Ativo'"
                    class="row-action row-action--success"
                    title="Marcar como resolvido"
                    @click="marcarResolvido(v)"
                  >
                    <q-icon name="check_circle" size="17px" />
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
              <td colspan="9" class="data-table__empty">
                <q-icon
                  name="search_off"
                  size="40px"
                  class="data-table__empty-icon"
                />
                <p>Nenhum veículo encontrado com estes filtros.</p>
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
                <option :value="6">6</option>
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
    </template>

    <!-- MODAL — ADICIONAR / EDITAR (3 PASSOS) -->
    <q-dialog v-model="store.modalForm" persistent>
      <div class="modal modal--steps">
        <header class="modal__head">
          <div>
            <h2 class="modal__title">
              {{ store.modoEdicao ? "Editar veículo" : "Adicionar à Hotlist" }}
            </h2>
            <small class="modal__sub">Passo {{ store.passo }} de 3</small>
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
              'steps__item--done': n < store.passo,
              'steps__item--active': n === store.passo,
            }"
          >
            <div class="steps__dot">
              <q-icon v-if="n < store.passo" name="check" size="14px" />
              <span v-else>{{ n }}</span>
            </div>
            <div class="steps__label">
              {{ n === 1 ? "Veículo" : n === 2 ? "Origem" : "Motivo" }}
            </div>
            <div v-if="n < 3" class="steps__line" />
          </div>
        </div>

        <div class="modal__body">
          <!-- PASSO 1 -->
          <div v-if="store.passo === 1" class="form-grid">
            <label
              class="field field--full"
              :class="{ 'field--erro': store.erros.matricula }"
            >
              <span class="field__label">Matrícula <em>*</em></span>
              <input
                v-model.trim="store.form.matricula"
                class="field__input field__input--placa"
                placeholder="AGL-482-MC"
                maxlength="12"
                :disabled="store.modoEdicao"
              />
              <small v-if="store.erros.matricula" class="field__erro">
                {{ store.erros.matricula }}
              </small>
            </label>

            <label class="field" :class="{ 'field--erro': store.erros.marca }">
              <span class="field__label">Marca <em>*</em></span>
              <select
                v-model="store.form.marca"
                class="field__input"
                @change="store.form.modelo = ''"
              >
                <option value="">Selecione…</option>
                <option v-for="m in store.MARCAS" :key="m" :value="m">
                  {{ m }}
                </option>
              </select>
              <small v-if="store.erros.marca" class="field__erro">
                {{ store.erros.marca }}
              </small>
            </label>

            <label class="field" :class="{ 'field--erro': store.erros.modelo }">
              <span class="field__label">Modelo <em>*</em></span>
              <select
                v-model="store.form.modelo"
                class="field__input"
                :disabled="!store.form.marca"
              >
                <option value="">Selecione…</option>
                <option
                  v-for="m in store.MODELOS[store.form.marca] ?? []"
                  :key="m"
                  :value="m"
                >
                  {{ m }}
                </option>
              </select>
              <small v-if="store.erros.modelo" class="field__erro">
                {{ store.erros.modelo }}
              </small>
            </label>

            <label
              class="field field--full"
              :class="{ 'field--erro': store.erros.cor }"
            >
              <span class="field__label">Cor <em>*</em></span>
              <select v-model="store.form.cor" class="field__input">
                <option value="">Selecione…</option>
                <option v-for="c in store.CORES" :key="c" :value="c">
                  {{ c }}
                </option>
              </select>
              <small v-if="store.erros.cor" class="field__erro">
                {{ store.erros.cor }}
              </small>
            </label>
          </div>

          <!-- PASSO 2 -->
          <div v-else-if="store.passo === 2" class="form-grid">
            <label
              class="field field--full"
              :class="{ 'field--erro': store.erros.origem }"
            >
              <span class="field__label">Origem do alerta <em>*</em></span>
              <select v-model="store.form.origem" class="field__input">
                <option v-for="o in store.ORIGENS" :key="o" :value="o">
                  {{ o }}
                </option>
              </select>
            </label>

            <label
              class="field"
              :class="{ 'field--erro': store.erros.dataInsercao }"
            >
              <span class="field__label">Data de inserção <em>*</em></span>
              <input
                v-model.trim="store.form.dataInsercao"
                class="field__input"
                placeholder="dd/mm/aaaa"
              />
              <small v-if="store.erros.dataInsercao" class="field__erro">
                {{ store.erros.dataInsercao }}
              </small>
            </label>

            <label
              class="field"
              :class="{ 'field--erro': store.erros.horaInsercao }"
            >
              <span class="field__label">Hora <em>*</em></span>
              <input
                v-model.trim="store.form.horaInsercao"
                class="field__input"
                placeholder="HH:MM"
              />
              <small v-if="store.erros.horaInsercao" class="field__erro">
                {{ store.erros.horaInsercao }}
              </small>
            </label>

            <label class="field" :class="{ 'field--erro': store.erros.local }">
              <span class="field__label">Local / Província <em>*</em></span>
              <select v-model="store.form.local" class="field__input">
                <option value="">Selecione…</option>
                <option v-for="l in store.LOCAIS" :key="l" :value="l">
                  {{ l }}
                </option>
              </select>
              <small v-if="store.erros.local" class="field__erro">
                {{ store.erros.local }}
              </small>
            </label>

            <label class="field">
              <span class="field__label">Posto</span>
              <select v-model="store.form.posto" class="field__input">
                <option v-for="p in store.POSTOS" :key="p" :value="p">
                  {{ p }}
                </option>
              </select>
            </label>

            <label
              class="field field--full"
              :class="{ 'field--erro': store.erros.agente }"
            >
              <span class="field__label">Agente responsável <em>*</em></span>
              <select v-model="store.form.agente" class="field__input">
                <option v-for="a in store.AGENTES" :key="a" :value="a">
                  {{ a }}
                </option>
              </select>
            </label>
          </div>

          <!-- PASSO 3 -->
          <div v-else class="form-grid">
            <label
              class="field field--full"
              :class="{ 'field--erro': store.erros.motivo }"
            >
              <span class="field__label">Motivo <em>*</em></span>
              <select v-model="store.form.motivo" class="field__input">
                <option value="">Selecione…</option>
                <option v-for="m in store.MOTIVOS" :key="m" :value="m">
                  {{ m }}
                </option>
              </select>
              <small v-if="store.erros.motivo" class="field__erro">
                {{ store.erros.motivo }}
              </small>
            </label>

            <label
              class="field field--full"
              :class="{ 'field--erro': store.erros.nivel }"
            >
              <span class="field__label">Nível <em>*</em></span>
              <div class="nivel-picker">
                <button
                  v-for="n in store.NIVEIS"
                  :key="n"
                  type="button"
                  class="nivel-btn"
                  :class="[
                    `nivel-btn--${store.nivelClasse(n)}`,
                    { 'nivel-btn--active': store.form.nivel === n },
                  ]"
                  @click="store.form.nivel = n"
                >
                  {{ n }}
                </button>
              </div>
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
          <template v-if="store.passo === 1">
            <button
              class="page-btn page-btn--outline"
              @click="store.fecharForm"
            >
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

          <template v-else-if="store.passo === 2">
            <button
              class="page-btn page-btn--outline"
              @click="store.passoAnterior"
            >
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
            <button
              class="page-btn page-btn--outline"
              @click="store.passoAnterior"
            >
              <q-icon name="arrow_back" size="16px" />
              Voltar
            </button>
            <button
              class="page-btn page-btn--primary"
              :disabled="!store.formValido || store.aSalvar"
              @click="guardar"
            >
              <q-icon name="save" size="16px" />
              {{
                store.aSalvar
                  ? "A guardar…"
                  : store.modoEdicao
                    ? "Guardar alterações"
                    : "Adicionar"
              }}
            </button>
          </template>
        </footer>
      </div>
    </q-dialog>

    <!-- MODAL — DETALHES -->
    <q-dialog v-model="store.modalDetalhes">
      <div v-if="store.veiculoDetalhe" class="modal modal--details">
        <header class="modal__head">
          <div class="detail-head">
            <div
              class="placa__icon"
              :class="`placa__icon--${store.nivelClasse(store.veiculoDetalhe.nivel)}`"
            >
              <q-icon name="directions_car" size="20px" />
            </div>
            <div>
              <h2 class="modal__title">{{ store.veiculoDetalhe.matricula }}</h2>
              <span
                class="nivel"
                :class="`nivel--${store.nivelClasse(store.veiculoDetalhe.nivel)}`"
              >
                {{ store.veiculoDetalhe.nivel }}
              </span>
            </div>
          </div>
          <button class="modal__close" @click="store.modalDetalhes = false">
            <q-icon name="close" size="20px" />
          </button>
        </header>

        <div class="modal__body">
          <div class="detail-row">
            <span>Marca / Modelo</span>
            <b
              >{{ store.veiculoDetalhe.marca }}
              {{ store.veiculoDetalhe.modelo }}</b
            >
          </div>
          <div class="detail-row">
            <span>Cor</span>
            <b>{{ store.veiculoDetalhe.cor || "—" }}</b>
          </div>
          <div class="detail-row">
            <span>Motivo</span>
            <b>{{ store.veiculoDetalhe.motivo }}</b>
          </div>
          <div class="detail-row">
            <span>Origem</span>
            <b>{{ store.veiculoDetalhe.origem }}</b>
          </div>
          <div class="detail-row">
            <span>Data de inserção</span>
            <b
              >{{ store.veiculoDetalhe.dataInsercao }} ·
              {{ store.veiculoDetalhe.horaInsercao }}</b
            >
          </div>
          <div class="detail-row">
            <span>Local</span>
            <b>{{ store.veiculoDetalhe.local }}</b>
          </div>
          <div class="detail-row">
            <span>Posto</span>
            <b>{{ store.veiculoDetalhe.posto || "—" }}</b>
          </div>
          <div class="detail-row">
            <span>Agente</span>
            <b>{{ store.veiculoDetalhe.agente }}</b>
          </div>
          <div class="detail-row">
            <span>Abordagens</span>
            <b>{{ store.veiculoDetalhe.abordagens }}</b>
          </div>
          <div class="detail-row">
            <span>Estado</span>
            <span
              class="badge"
              :class="`badge--${store.veiculoDetalhe.estado === 'Ativo' ? 'critico' : 'regular'}`"
            >
              {{ store.veiculoDetalhe.estado }}
            </span>
          </div>
          <div
            v-if="store.veiculoDetalhe.observacoes"
            class="detail-row detail-row--motivo"
          >
            <span>Observações</span>
            <p>{{ store.veiculoDetalhe.observacoes }}</p>
          </div>
        </div>

        <footer class="modal__foot">
          <button
            class="page-btn page-btn--outline"
            @click="store.modalDetalhes = false"
          >
            Fechar
          </button>
          <button class="page-btn page-btn--primary" @click="editarDoDetalhe">
            <q-icon name="edit" size="16px" />
            Editar
          </button>
        </footer>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { usePrmHotlistStore } from "@/stores/prm/prm-HotlistStore";
import type { VeiculoHotlist } from "@/services/prm/hotlist.service";
import AppFbLoader from "@/modules/common/AppFbLoader.vue";

const store = usePrmHotlistStore();
const $q = useQuasar();

const aSincronizar = ref(false);

// Carrega os dados ao montar
onMounted(() => {
  store.carregar();
});

// ============================================================
// Alertas
// ============================================================
const alertas = computed(() => {
  const lista: {
    tipo: "atencao" | "critico";
    icon: string;
    titulo: string;
    descricao: string;
  }[] = [];

  if (store.kpis.altos > 0) {
    lista.push({
      tipo: "critico",
      icon: "local_police",
      titulo: `${store.kpis.altos} veículo${store.kpis.altos === 1 ? "" : "s"} com nível ALTO`,
      descricao: "Prioridade máxima em abordagens",
    });
  }

  if (store.kpis.ativos > 0) {
    lista.push({
      tipo: "atencao",
      icon: "sync",
      titulo: `${store.kpis.ativos} veículo${store.kpis.ativos === 1 ? "" : "s"} activos na hotlist`,
      descricao: "Sincronize regularmente com os dispositivos",
    });
  }

  return lista;
});

// ============================================================
// Filtros rápidos (KPIs)
// ============================================================
function filtrarPor(
  valor: "total" | "Furtado" | "Clonagem suspeita" | "Mandado de captura",
) {
  store.limparFiltros();
  if (valor === "total") return;
  store.filtroMotivo = valor;
}

// ============================================================
// Sincronizar
// ============================================================
function sincronizar() {
  aSincronizar.value = true;
  setTimeout(() => {
    aSincronizar.value = false;
    $q.notify({
      type: "positive",
      message: `Hotlist sincronizada: ${store.kpis.total} veículos`,
      position: "top",
    });
  }, 1200);
}

// ============================================================
// Editar
// ============================================================
function editar(v: VeiculoHotlist) {
  store.abrirEditar(v);
}

function editarDoDetalhe() {
  if (!store.veiculoDetalhe) return;
  const v = store.veiculoDetalhe;
  store.modalDetalhes = false;
  store.abrirEditar(v);
}

// ============================================================
// Guardar
// ============================================================
async function guardar() {
  const ok = await store.salvarForm();
  if (!ok) {
    $q.notify({
      type: "negative",
      message: store.erro ?? "Erro ao guardar",
      position: "top",
    });
    return;
  }

  $q.notify({
    type: "positive",
    message: store.modoEdicao
      ? "Veículo actualizado"
      : "Veículo adicionado à Hotlist",
    position: "top",
  });
  store.fecharForm();
}

// ============================================================
// Remover
// ============================================================
function pedirRemover(v: VeiculoHotlist) {
  $q.dialog({
    title: "Remover da Hotlist",
    message: `Confirmar a remoção de ${v.matricula} da Hotlist?`,
    cancel: { label: "Voltar", flat: true },
    ok: { label: "Remover", color: "negative" },
    persistent: true,
  }).onOk(async () => {
    await store.remover(v.id);
    $q.notify({
      type: "positive",
      message: `${v.matricula} removido da Hotlist.`,
      position: "top",
    });
  });
}

function removerSelecionados() {
  if (!store.selecionados.length) return;
  $q.dialog({
    title: "Remover selecionados",
    message: `Confirmar a remoção de ${store.selecionados.length} veículo(s)?`,
    cancel: { label: "Voltar", flat: true },
    ok: { label: "Remover", color: "negative" },
    persistent: true,
  }).onOk(async () => {
    await store.removerSelecionados();
    $q.notify({
      type: "positive",
      message: "Veículos removidos",
      position: "top",
    });
  });
}

function marcarResolvido(v: VeiculoHotlist) {
  $q.dialog({
    title: "Marcar como resolvido",
    message: `Marcar ${v.matricula} como resolvido?`,
    cancel: { label: "Voltar", flat: true },
    ok: { label: "Resolver", color: "positive" },
    persistent: true,
  }).onOk(async () => {
    await store.marcarResolvido(v.id);
    $q.notify({
      type: "positive",
      message: `${v.matricula} marcado como resolvido`,
      position: "top",
    });
  });
}

// ============================================================
// Exportar
// ============================================================
function exportar() {
  exportarLista(store.filtrados);
}

function exportarSelecionados() {
  const lista = store.veiculos.filter((v) => store.selecionados.includes(v.id));
  exportarLista(lista);
}

function exportarLista(lista: VeiculoHotlist[]) {
  const headers = [
    "Matrícula",
    "Marca",
    "Modelo",
    "Cor",
    "Motivo",
    "Nível",
    "Origem",
    "Data",
    "Hora",
    "Local",
    "Posto",
    "Agente",
    "Abordagens",
    "Estado",
  ];
  const linhas = lista.map((v) => [
    v.matricula,
    v.marca,
    v.modelo,
    v.cor,
    v.motivo,
    v.nivel,
    v.origem,
    v.dataInsercao,
    v.horaInsercao,
    v.local,
    v.posto,
    v.agente,
    String(v.abordagens),
    v.estado,
  ]);
  const csv = [headers, ...linhas].map((l) => l.join(",")).join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hotlist-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  $q.notify({
    type: "positive",
    message: `${lista.length} registos exportados`,
    position: "top",
  });
}
</script>

<style scoped lang="scss">
.hl-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

// ─── SKELETON ────────────────────────────────────────────────
.hl-skeleton {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.sk-filters {
  max-width: 500px;
}

// ============================================================
// Cabeçalho
// ============================================================
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
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
    &:hover {
      background: var(--sicam-surface-hover);
    }
  }

  .spinning {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// ============================================================
// Alertas
// ============================================================
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

// ============================================================
// KPIs
// ============================================================
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
  transition:
    transform 0.1s,
    box-shadow 0.15s;

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

    &--critical {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
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

// ============================================================
// Filtros
// ============================================================
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

// ============================================================
// Barra de resultados
// ============================================================
.results-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 0 4px;

  &__count {
    font-size: 13px;
    color: var(--sicam-muted);
    b {
      color: var(--sicam-ink);
      font-weight: 700;
    }
  }

  &__sel {
    color: var(--sicam-primary);
    font-weight: 600;
  }
  &__bulk {
    display: flex;
    gap: 8px;
  }
}

.bulk-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--sicam-line);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--sicam-ink);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--sicam-surface-hover);
  }

  &--danger {
    color: var(--sicam-critical-ink);
    border-color: rgba(239, 68, 68, 0.25);
    &:hover {
      background: var(--sicam-critical-bg);
    }
  }

  &--ghost {
    background: transparent;
    border-color: transparent;
    color: var(--sicam-muted);
    &:hover {
      color: var(--sicam-ink);
    }
  }
}

// ============================================================
// Tabela
// ============================================================
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

  &__th-check,
  &__td-check {
    width: 40px;
    padding-right: 0;
  }
  &__th-check input,
  &__td-check input {
    cursor: pointer;
  }

  &__th-sort {
    cursor: pointer;
    user-select: none;
    &:hover {
      color: var(--sicam-ink);
    }
  }

  &__row {
    transition: background 0.15s;
    cursor: pointer;
    &:hover {
      background: #fbfdfc;
    }
    &--selected {
      background: #ecfdf5;
    }
    &:last-child td {
      border-bottom: 0;
    }
  }

  &__th-actions {
    width: 180px;
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
      margin: 0 0 16px;
    }
  }
}

.table-time {
  color: var(--sicam-muted);
  font-size: 13px;
  white-space: nowrap;

  small {
    display: block;
    font-size: 11px;
    color: var(--sicam-line-strong);
    margin-top: 2px;
  }
}

.cell-muted {
  color: var(--sicam-muted);
  font-size: 13px;
}

.placa {
  display: flex;
  align-items: center;
  gap: 10px;

  &__info {
    b {
      display: block;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    small {
      display: block;
      font-size: 11px;
      color: var(--sicam-muted);
      margin-top: 2px;
    }
  }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--alto {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
    &--medio {
      background: var(--sicam-warning-bg);
      color: var(--sicam-warning-ink);
    }
    &--baixo {
      background: var(--sicam-neutral-bg);
      color: var(--sicam-neutral-ink);
    }
  }
}

.motivo-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  background: var(--sicam-surface-alt);
  color: var(--sicam-ink-soft);
  white-space: nowrap;

  .q-icon {
    color: var(--sicam-muted);
    font-size: 13px;
  }
}

.nivel {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &--alto {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }
  &--medio {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
  }
  &--baixo {
    background: var(--sicam-neutral-bg);
    color: var(--sicam-neutral-ink);
  }
}

.abordagens {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--sicam-muted);
  b {
    color: var(--sicam-ink);
    font-weight: 700;
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--regular {
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
  }
  &--critico {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }
}

.actions-group {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
}

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
  transition: all 0.15s;

  &:hover {
    background: var(--sicam-surface-hover);
    color: var(--sicam-ink);
  }
  &--success:hover {
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
  }
  &--danger:hover {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }
}

// ============================================================
// Paginação
// ============================================================
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

  &__size {
    label {
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

// ============================================================
// Modais
// ============================================================
.modal {
  background: #fff;
  border-radius: 16px;
  width: 90vw;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;

  &--steps {
    max-width: 620px;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid var(--sicam-line-soft);
    flex-shrink: 0;
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }
  &__sub {
    font-size: 12px;
    color: var(--sicam-muted);
  }

  &__close {
    background: none;
    border: 0;
    color: var(--sicam-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    &:hover {
      background: var(--sicam-surface-hover);
      color: var(--sicam-ink);
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
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid var(--sicam-line-soft);
    background: #fafbfa;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
}

// Steps
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

// Formulário
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
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
    transition:
      border-color 0.15s,
      box-shadow 0.15s;

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
      font-size: 18px;
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

  &__erro {
    display: block;
    margin-top: 6px;
    font-size: 11px;
    font-weight: 600;
    color: var(--sicam-critical-ink);
  }

  &--erro {
    .field__input {
      border-color: var(--sicam-critical);
      background: #fff5f5;
      &:focus {
        border-color: var(--sicam-critical);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
      }
    }
  }
}

.nivel-picker {
  display: flex;
  gap: 8px;
}

.nivel-btn {
  flex: 1;
  padding: 12px 14px;
  border: 2px solid transparent;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &--alto {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
    &.nivel-btn--active {
      border-color: var(--sicam-critical);
    }
  }

  &--medio {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
    &.nivel-btn--active {
      border-color: var(--sicam-warning);
    }
  }

  &--baixo {
    background: var(--sicam-neutral-bg);
    color: var(--sicam-neutral-ink);
    &.nivel-btn--active {
      border-color: var(--sicam-neutral);
    }
  }

  &:hover {
    filter: brightness(0.97);
  }
}

// Detalhes
.modal--details .modal__body {
  padding: 8px 20px 18px;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  h2 {
    margin: 0 0 4px;
  }
}

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
      padding: 10px 14px;
      border-radius: 8px;
    }
  }
}

@media (max-width: 700px) {
  .table-foot {
    padding: 12px 14px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    &__nav {
      justify-content: space-between;
    }
  }
}
</style>
