<template>
  <q-page class="ab-page">
    <!-- SKELETON -->
    <div v-if="!store.carregado" class="ab-skeleton">
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
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Abordagens</h1>
          <p class="page-head__sub">
            Histórico de abordagens policiais e registo de novas ocorrências
          </p>
        </div>

        <div class="page-head__actions">
          <button class="page-btn page-btn--outline" @click="exportarCSV">
            <q-icon name="file_download" size="18px" />
            Excel
          </button>
          <button class="page-btn page-btn--primary" @click="store.abrirNova">
            <q-icon name="add" size="18px" />
            Nova abordagem
          </button>
        </div>
      </header>

      <!-- KPIs -->
      <section class="kpi-grid">
        <button class="kpi" @click="filtrarPor('total')">
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="visibility" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.total }}</div>
            <div class="kpi__label">Total</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Sem incidentes')">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="check_circle" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.semIncidentes }}</div>
            <div class="kpi__label">Sem incidentes</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Com detenção')">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="gavel" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.comDetencao }}</div>
            <div class="kpi__label">Com detenção</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarPor('Hotlist')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="local_police" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.hotlist }}</div>
            <div class="kpi__label">Veículos em Hotlist</div>
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
            placeholder="Pesquisar por matrícula, agente, local…"
          />
        </div>

        <select v-model="store.filtroResultado" class="filter filter__select">
          <option value="">Todos os resultados</option>
          <option v-for="r in store.RESULTADOS" :key="r" :value="r">
            {{ r }}
          </option>
        </select>

        <select v-model="store.filtroPosto" class="filter filter__select">
          <option value="">Todos os postos</option>
          <option v-for="p in store.POSTOS" :key="p" :value="p">{{ p }}</option>
        </select>

        <select v-model="store.filtroPeriodo" class="filter filter__select">
          <option v-for="p in store.PERIODOS" :key="p.key" :value="p.key">
            {{ p.label }}
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

      <!-- BARRA DE RESULTADOS -->
      <div class="results-bar">
        <span class="results-bar__count">
          <b>{{ store.filtrados.length }}</b>
          {{ store.filtrados.length === 1 ? "abordagem" : "abordagens" }}
          <span v-if="store.selecionados.length" class="results-bar__sel">
            · {{ store.selecionados.length }} selecionado(s)
          </span>
        </span>

        <div v-if="store.selecionados.length" class="results-bar__bulk">
          <button class="bulk-btn" @click="exportarSelecionados">
            <q-icon name="file_download" size="16px" />
            Exportar
          </button>
          <button class="bulk-btn bulk-btn--danger" @click="removerSelecionados">
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
              <th @click="store.ordenarPor('dataHora')" class="data-table__th-sort">
                Data e hora
                <q-icon
                  v-if="store.ordenacao.key === 'dataHora'"
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
              <th @click="store.ordenarPor('agente')" class="data-table__th-sort">
                Agente
                <q-icon
                  v-if="store.ordenacao.key === 'agente'"
                  :name="store.iconeOrdenacao"
                  size="14px"
                />
              </th>
              <th>Posto</th>
              <th>Local</th>
              <th @click="store.ordenarPor('resultado')" class="data-table__th-sort">
                Resultado
                <q-icon
                  v-if="store.ordenacao.key === 'resultado'"
                  :name="store.iconeOrdenacao"
                  size="14px"
                />
              </th>
              <th class="data-table__th-actions">Acções</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="a in store.paginados"
              :key="a.id"
              class="data-table__row"
              :class="{ 'data-table__row--selected': store.selecionados.includes(a.id) }"
              @click="store.abrirDetalhes(a)"
            >
              <td class="data-table__td-check" @click.stop>
                <input
                  type="checkbox"
                  :checked="store.selecionados.includes(a.id)"
                  @change="store.toggleSelecionado(a.id)"
                />
              </td>

              <td class="table-time">{{ a.dataHora }}</td>

              <td>
                <div class="placa">
                  <div
                    class="placa__icon"
                    :class="`placa__icon--${a.emHotlist ? 'critico' : 'neutral'}`"
                  >
                    <q-icon name="directions_car" size="16px" />
                  </div>
                  <b>{{ a.matricula }}</b>
                  <span v-if="a.emHotlist" class="placa__hot">
                    <q-icon name="local_police" size="12px" />
                    Hotlist
                  </span>
                </div>
              </td>

              <td>{{ a.agente }}</td>
              <td class="table-posto">{{ a.posto }}</td>
              <td class="table-local">{{ a.local }}</td>

              <td>
                <span
                  class="badge"
                  :class="`badge--${store.resultadoClasse(a.resultado)}`"
                >
                  {{ a.resultado }}
                </span>
              </td>

              <td class="data-table__actions" @click.stop>
                <div class="actions-group">
                  <button
                    class="row-action"
                    title="Ver detalhes"
                    @click="store.abrirDetalhes(a)"
                  >
                    <q-icon name="visibility" size="17px" />
                  </button>
                  <button class="row-action" title="Ver no mapa" @click="verNoMapa(a)">
                    <q-icon name="my_location" size="17px" />
                  </button>
                  <button class="row-action" title="Imprimir" @click="imprimir(a)">
                    <q-icon name="print" size="17px" />
                  </button>
                  <button
                    class="row-action row-action--danger"
                    title="Remover"
                    @click="pedirRemover(a)"
                  >
                    <q-icon name="delete" size="17px" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!store.paginados.length">
              <td colspan="8" class="data-table__empty">
                <q-icon name="search_off" size="40px" class="data-table__empty-icon" />
                <p>Nenhuma abordagem encontrada com estes filtros.</p>
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
              <select v-model.number="store.porPagina" @change="store.pagina = 1">
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

    <!-- MODAL — NOVA ABORDAGEM -->
    <q-dialog v-model="store.modalForm" persistent>
      <div class="modal modal--steps">
        <header class="modal__head">
          <div>
            <h2 class="modal__title">Nova abordagem</h2>
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
              {{ n === 1 ? "Veículo" : n === 2 ? "Ocorrência" : "Confirmação" }}
            </div>
            <div v-if="n < 3" class="steps__line" />
          </div>
        </div>

        <div class="modal__body">
          <div v-if="store.passo === 1" class="form-grid">
            <label
              class="field field--full"
              :class="{ 'field--erro': store.erros.matricula }"
            >
              <span class="field__label">Matrícula <em>*</em></span>
              <input
                v-model.trim="store.form.matricula"
                type="text"
                class="field__input field__input--placa"
                placeholder="Ex.: AGL-482-MC"
                maxlength="12"
              />
              <small v-if="store.erros.matricula" class="field__erro">
                {{ store.erros.matricula }}
              </small>
            </label>

            <label
              class="field field--full"
              :class="{ 'field--erro': store.erros.agente }"
            >
              <span class="field__label">Agente responsável <em>*</em></span>
              <select v-model="store.form.agente" class="field__input">
                <option value="">Selecione um agente…</option>
                <option v-for="a in store.AGENTES" :key="a" :value="a">
                  {{ a }}
                </option>
              </select>
              <small v-if="store.erros.agente" class="field__erro">
                {{ store.erros.agente }}
              </small>
            </label>

            <label class="field field--full field--check">
              <input type="checkbox" v-model="store.form.emHotlist" />
              <span>Veículo consta na Hotlist</span>
            </label>
          </div>

          <div v-else-if="store.passo === 2" class="form-grid">
            <label
              class="field field--full"
              :class="{ 'field--erro': store.erros.posto }"
            >
              <span class="field__label">Posto <em>*</em></span>
              <select v-model="store.form.posto" class="field__input">
                <option value="">Selecione um posto…</option>
                <option v-for="p in store.POSTOS" :key="p" :value="p">
                  {{ p }}
                </option>
              </select>
              <small v-if="store.erros.posto" class="field__erro">
                {{ store.erros.posto }}
              </small>
            </label>

            <label
              class="field field--full"
              :class="{ 'field--erro': store.erros.local }"
            >
              <span class="field__label">Local <em>*</em></span>
              <input
                v-model.trim="store.form.local"
                type="text"
                class="field__input"
                placeholder="Ex.: Av. 25 de Setembro"
              />
              <small v-if="store.erros.local" class="field__erro">
                {{ store.erros.local }}
              </small>
            </label>

            <div
              class="field field--full"
              :class="{ 'field--erro': store.erros.resultado }"
            >
              <span class="field__label">Resultado <em>*</em></span>
              <div class="resultado-picker">
                <button
                  v-for="r in store.RESULTADOS"
                  :key="r"
                  type="button"
                  class="resultado-btn"
                  :class="[
                    `resultado-btn--${store.resultadoClasse(r)}`,
                    { 'resultado-btn--active': store.form.resultado === r },
                  ]"
                  @click="store.form.resultado = r"
                >
                  <q-icon :name="store.resultadoIcone(r)" size="16px" />
                  {{ r }}
                </button>
              </div>
              <small v-if="store.erros.resultado" class="field__erro">
                {{ store.erros.resultado }}
              </small>
            </div>
          </div>

          <div v-else class="confirmacao">
            <div class="confirmacao__icon">
              <q-icon name="fact_check" size="40px" />
            </div>
            <h3 class="confirmacao__title">Confirmar abordagem</h3>
            <p class="confirmacao__sub">Reveja os dados antes de registar.</p>

            <div class="confirmacao__grid">
              <div class="confirmacao__row">
                <span>Matrícula</span>
                <b>{{ store.form.matricula }}</b>
              </div>
              <div class="confirmacao__row">
                <span>Agente</span>
                <b>{{ store.form.agente }}</b>
              </div>
              <div class="confirmacao__row">
                <span>Posto</span>
                <b>{{ store.form.posto }}</b>
              </div>
              <div class="confirmacao__row">
                <span>Local</span>
                <b>{{ store.form.local }}</b>
              </div>
              <div class="confirmacao__row">
                <span>Resultado</span>
                <span
                  class="badge"
                  :class="`badge--${store.form.resultado ? store.resultadoClasse(store.form.resultado as any) : 'info'}`"
                >
                  {{ store.form.resultado || "—" }}
                </span>
              </div>
              <div class="confirmacao__row">
                <span>Hotlist</span>
                <b>{{ store.form.emHotlist ? "Sim" : "Não" }}</b>
              </div>

              <div class="confirmacao__row confirmacao__row--block">
                <span>Observações</span>
                <textarea
                  v-model.trim="store.form.observacoes"
                  class="confirmacao__textarea"
                  rows="3"
                  placeholder="Detalhes adicionais (opcional)…"
                />
              </div>
            </div>
          </div>
        </div>

        <footer class="modal__foot">
          <template v-if="store.passo === 1">
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

          <template v-else-if="store.passo === 2">
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
              @click="guardar"
            >
              <q-icon name="save" size="16px" />
              {{ store.aSalvar ? "A guardar…" : "Registar abordagem" }}
            </button>
          </template>
        </footer>
      </div>
    </q-dialog>

    <!-- MODAL — DETALHES -->
    <q-dialog v-model="store.modalDetalhes">
      <div v-if="store.abordagemDetalhe" class="modal modal--details">
        <header class="modal__head">
          <div class="detail-head">
            <div
              class="placa__icon"
              :class="`placa__icon--${store.abordagemDetalhe.emHotlist ? 'critico' : 'neutral'}`"
            >
              <q-icon name="directions_car" size="20px" />
            </div>
            <div>
              <h2 class="modal__title">
                {{ store.abordagemDetalhe.matricula }}
              </h2>
              <small class="modal__sub">{{ store.abordagemDetalhe.dataHora }}</small>
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
              :class="`badge--${store.resultadoClasse(store.abordagemDetalhe.resultado)}`"
            >
              {{ store.abordagemDetalhe.resultado }}
            </span>
          </div>
          <div class="detail-row">
            <span>Agente</span>
            <b>{{ store.abordagemDetalhe.agente }}</b>
          </div>
          <div class="detail-row">
            <span>Posto</span>
            <b>{{ store.abordagemDetalhe.posto }}</b>
          </div>
          <div class="detail-row">
            <span>Local</span>
            <b>{{ store.abordagemDetalhe.local }}</b>
          </div>
          <div
            v-if="store.abordagemDetalhe.observacoes"
            class="detail-row detail-row--block"
          >
            <span>Observações</span>
            <p>{{ store.abordagemDetalhe.observacoes }}</p>
          </div>
          <div class="detail-row">
            <span>Hotlist</span>
            <b>{{ store.abordagemDetalhe.emHotlist ? "Sim" : "Não" }}</b>
          </div>
        </div>

        <footer class="modal__foot">
          <button class="page-btn page-btn--outline" @click="store.modalDetalhes = false">
            Fechar
          </button>

          <div class="modal__foot-actions">
            <button
              class="page-btn page-btn--outline"
              @click="verNoMapa(store.abordagemDetalhe!)"
            >
              <q-icon name="my_location" size="16px" />
              Ver no mapa
            </button>
            <button
              class="page-btn page-btn--primary"
              @click="imprimir(store.abordagemDetalhe)"
            >
              <q-icon name="print" size="16px" />
              Imprimir
            </button>
          </div>
        </footer>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import {
  usePrmAbordagensStore,
  type Abordagem,
} from "@/stores/prm/prm-AbordagensStore";
import { useMapaCalorStore } from "@/stores/prm/prm-mapaCalor.store";
import AppFbLoader from "@/modules/common/AppFbLoader.vue";

const store = usePrmAbordagensStore();
const mapaStore = useMapaCalorStore();
const $q = useQuasar();
const router = useRouter();

// ============================================================
// Carregar dados ao montar
// ============================================================
onMounted(() => {
  store.carregar();
});

// ============================================================
// Filtros rápidos (KPIs)
// ============================================================
function filtrarPor(
  valor: "total" | "Sem incidentes" | "Com detenção" | "Hotlist",
) {
  store.limparFiltros();
  if (valor === "total") return;
  if (valor === "Hotlist") return;
  store.filtroResultado = valor;
}

// ============================================================
// Ver no mapa
// ============================================================
function verNoMapa(a: Abordagem) {
  store.modalDetalhes = false;

  const cb =
    (window as any).__prmFocarAbordagem ?? (window as any).__prmFocarMapa;
  if (typeof cb === "function") {
    cb(a);
    return;
  }

  mapaStore.pedirFoco(a.id);
  router.push("/prm/mapa");
}

// ============================================================
// Guardar
// ============================================================
async function guardar() {
  const ok = await store.salvarForm();
  if (!ok) {
    $q.notify({
      type: "negative",
      message: store.erro ?? "Erro ao registar abordagem",
      position: "top",
    });
    return;
  }
  $q.notify({
    type: "positive",
    message: "Abordagem registada",
    position: "top",
  });
  store.fecharForm();
}

// ============================================================
// Remover
// ============================================================
function pedirRemover(a: Abordagem) {
  $q.dialog({
    title: "Remover abordagem",
    message: `Remover permanentemente a abordagem de ${a.matricula}?`,
    cancel: { label: "Voltar", flat: true },
    ok: { label: "Remover", color: "negative" },
    persistent: true,
  }).onOk(async () => {
    await store.remover(a.id);
    $q.notify({
      type: "positive",
      message: "Abordagem removida",
      position: "top",
    });
  });
}

function removerSelecionados() {
  if (!store.selecionados.length) return;
  $q.dialog({
    title: "Remover selecionados",
    message: `Remover ${store.selecionados.length} abordagem(ns)?`,
    cancel: { label: "Voltar", flat: true },
    ok: { label: "Remover", color: "negative" },
    persistent: true,
  }).onOk(async () => {
    await store.removerSelecionados();
    $q.notify({
      type: "positive",
      message: "Abordagens removidas",
      position: "top",
    });
  });
}

// ============================================================
// Imprimir
// ============================================================
function imprimir(a: Abordagem | null) {
  if (!a) return;

  const texto = `
========================================
      SICAM — PRM
      REGISTO DE ABORDAGEM
========================================

Data/Hora:      ${a.dataHora}
Matrícula:      ${a.matricula}
Agente:         ${a.agente}
Posto:          ${a.posto}
Local:          ${a.local}
Resultado:      ${a.resultado}
Hotlist:        ${a.emHotlist ? "Sim" : "Não"}
${a.observacoes ? `Observações:    ${a.observacoes}` : ""}

========================================
Documento gerado automaticamente.
========================================
`.trim();

  const w = window.open("", "_blank", "width=600,height=700");
  if (!w) return;
  w.document.write(
    `<pre style="font-family: monospace; font-size: 13px; padding: 20px;">${texto}</pre>`,
  );
  w.document.close();
  w.print();
}

// ============================================================
// Exportar CSV
// ============================================================
function exportarCSV() {
  exportarLista(store.filtrados);
}

function exportarSelecionados() {
  const lista = store.abordagens.filter((a) =>
    store.selecionados.includes(a.id),
  );
  exportarLista(lista);
}

function exportarLista(lista: Abordagem[]) {
  const linhas: string[][] = [
    ["SICAM — PRM — Abordagens"],
    [`Gerado em: ${new Date().toLocaleString("pt-PT")}`],
    [],
    [
      "Data e hora",
      "Matrícula",
      "Agente",
      "Posto",
      "Local",
      "Resultado",
      "Hotlist",
    ],
    ...lista.map((a) => [
      a.dataHora,
      a.matricula,
      a.agente,
      a.posto,
      a.local,
      a.resultado,
      a.emHotlist ? "Sim" : "Não",
    ]),
  ];

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `prm-abordagens-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  $q.notify({
    type: "positive",
    message: `${lista.length} registos exportados`,
    position: "top",
  });
}
</script>

<style scoped lang="scss">
.ab-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

// ─── SKELETON ────────────────────────────────────────────────
.ab-skeleton {
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

    &--primary {
      background: var(--sicam-primary-bg);
      color: var(--sicam-primary);
    }
    &--success {
      background: var(--sicam-success-bg);
      color: var(--sicam-success-ink);
    }
    &--critical {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
    &--warning {
      background: var(--sicam-warning-bg);
      color: var(--sicam-warning-ink);
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
    min-width: 170px;

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
    width: 170px;
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
}
.table-posto {
  color: var(--sicam-ink-soft);
  font-size: 13px;
}
.table-local {
  color: var(--sicam-muted);
  font-size: 13px;
}

// Placa
.placa {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  b {
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  &__icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--critico {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
    &--neutral {
      background: var(--sicam-neutral-bg);
      color: var(--sicam-neutral-ink);
    }
  }

  &__hot {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
}

// Badge
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

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
  &--atencao {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
  }
  &--info {
    background: #dbeafe;
    color: #2563eb;
  }
}

// Acções
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

  &__size label {
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
  max-width: 560px;
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

  &__foot-actions {
    display: flex;
    gap: 10px;
  }
}

// ============================================================
// Steps
// ============================================================
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

// ============================================================
// Formulário
// ============================================================
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.field {
  display: block;
  margin-bottom: 0;

  &--full {
    grid-column: 1 / -1;
  }

  &--check {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);
    cursor: pointer;
    padding: 12px 14px;
    border: 1px solid var(--sicam-line);
    border-radius: 10px;
    background: #fff;
    transition: all 0.15s;

    &:hover {
      border-color: var(--sicam-primary-light);
      background: #f0fdf9;
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--sicam-primary);
      cursor: pointer;
      flex-shrink: 0;
    }
  }

  &__label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--sicam-ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;

    em {
      color: var(--sicam-critical);
      font-style: normal;
      margin-left: 2px;
    }
  }

  &__input {
    display: block;
    width: 100%;
    padding: 12px 14px;
    border: 2px solid var(--sicam-line);
    border-radius: 10px;
    background: #fff;
    color: var(--sicam-ink);
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
    box-sizing: border-box;
    appearance: none;
    -webkit-appearance: none;

    &::placeholder {
      color: var(--sicam-muted);
      opacity: 0.8;
      font-weight: 400;
    }

    &:hover {
      border-color: var(--sicam-line-strong);
    }

    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
      background: #fafefc;
    }
  }

  select.field__input {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 40px;
    cursor: pointer;
  }

  textarea.field__input {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    line-height: 1.5;
  }

  &__input--placa {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-align: center;
    padding: 16px 14px;
    background: #fafbfa;
    border-color: var(--sicam-line);

    &:focus {
      background: #fafefc;
    }
  }

  &__erro {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--sicam-critical-ink);
    display: flex;
    align-items: center;
    gap: 4px;

    &::before {
      content: "⚠";
      font-size: 13px;
    }
  }

  &--erro {
    .field__input {
      border-color: var(--sicam-critical);
      background: #fff5f5;

      &:focus {
        border-color: var(--sicam-critical);
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
      }
    }
  }
}

// ============================================================
// Seletor de resultado
// ============================================================
.resultado-picker {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.resultado-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 14px;
  border: 2px solid transparent;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;

  &--regular {
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
    &.resultado-btn--active {
      border-color: var(--sicam-success);
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    }
  }

  &--critico {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
    &.resultado-btn--active {
      border-color: var(--sicam-critical);
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
    }
  }

  &--atencao {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
    &.resultado-btn--active {
      border-color: var(--sicam-warning);
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
    }
  }

  &--info {
    background: #dbeafe;
    color: #2563eb;
    &.resultado-btn--active {
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
    }
  }

  &:hover {
    filter: brightness(0.97);
  }
}

// ============================================================
// Confirmação (passo 3)
// ============================================================
.confirmacao {
  text-align: center;
  padding: 8px 0;

  &__icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    color: var(--sicam-primary);
    display: grid;
    place-items: center;
    margin: 0 auto 12px;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 4px;
  }

  &__sub {
    font-size: 13px;
    color: var(--sicam-muted);
    margin: 0 0 20px;
  }

  &__grid {
    background: var(--sicam-surface-alt);
    border-radius: 12px;
    padding: 4px 16px;
    text-align: left;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--sicam-line-soft);

    &:last-child {
      border-bottom: 0;
    }

    span:first-child {
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

    &--block {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;

      span {
        text-align: left;
      }
    }
  }

  &__textarea {
    width: 100%;
    padding: 12px 14px;
    border: 2px solid var(--sicam-line);
    border-radius: 10px;
    background: #fff;
    font-family: inherit;
    font-size: 13px;
    color: var(--sicam-ink);
    resize: vertical;
    box-sizing: border-box;

    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    }

    &::placeholder {
      color: var(--sicam-muted);
      opacity: 0.7;
    }
  }
}

// ============================================================
// Detalhes
// ============================================================
.modal--details .modal__body {
  padding: 8px 20px 18px;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;

  h2 {
    margin: 0;
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

  &--block {
    flex-direction: column;
    align-items: flex-start;

    p {
      margin: 6px 0 0;
      font-size: 13px;
      color: var(--sicam-ink);
      line-height: 1.5;
    }
  }
}

// ============================================================
// Responsivo
// ============================================================
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