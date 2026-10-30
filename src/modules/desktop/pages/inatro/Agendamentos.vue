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
          <h1 class="page-head__title">Agendamentos</h1>
          <p class="page-head__sub">
            Gestão de marcações para inspecção técnica
          </p>
        </div>

        <div class="page-head__actions">
          <button class="page-btn page-btn--outline" @click="exportarCSV">
            <q-icon name="file_download" size="18px" />
            Exportar
          </button>
          <button class="page-btn page-btn--primary" @click="store.abrirNovo">
            <q-icon name="add" size="18px" />
            Novo agendamento
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
        <button class="kpi" @click="filtrarHoje">
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="today" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.hoje }}</div>
            <div class="kpi__label">Hoje</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarSemana">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="event" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.semana }}</div>
            <div class="kpi__label">Esta semana</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarConfirmados">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="check_circle" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.confirmados }}</div>
            <div class="kpi__label">Confirmados</div>
          </div>
        </button>

        <button class="kpi" @click="filtrarCancelados">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="cancel" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.cancelados }}</div>
            <div class="kpi__label">Cancelados</div>
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
            placeholder="Pesquisar por matrícula, proprietário, código…"
          />
        </div>

        <select v-model="store.filtroData" class="filter filter__select">
          <option value="">Todas as datas</option>
          <option value="hoje">Hoje</option>
          <option value="amanha">Amanhã</option>
          <option value="semana">Próximos 7 dias</option>
        </select>

        <select v-model="store.filtroPosto" class="filter filter__select">
          <option value="">Todos os postos</option>
          <option v-for="p in store.POSTOS" :key="p" :value="p">{{ p }}</option>
        </select>

        <select v-model="store.filtroInspector" class="filter filter__select">
          <option value="">Todos os inspectores</option>
          <option v-for="i in store.INSPECTORES" :key="i" :value="i">{{ i }}</option>
        </select>

        <select v-model="store.filtroEstado" class="filter filter__select">
          <option value="">Todos os estados</option>
          <option value="Pendente">Pendente</option>
          <option value="Confirmado">Confirmado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Concluído">Concluído</option>
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

      <!-- LISTA DE AGENDAMENTOS -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">
            {{ store.filtrados.length }} agendamento{{ store.filtrados.length === 1 ? '' : 's' }}
          </h2>
        </header>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th @click="store.ordenarPor('data')" class="data-table__th-sort">
                  Data / Hora
                  <q-icon v-if="store.ordenacao.key === 'data'" :name="store.iconeOrdenacao" size="14px" />
                </th>
                <th>Código</th>
                <th @click="store.ordenarPor('matricula')" class="data-table__th-sort">
                  Veículo
                  <q-icon v-if="store.ordenacao.key === 'matricula'" :name="store.iconeOrdenacao" size="14px" />
                </th>
                <th>Proprietário</th>
                <th>Posto</th>
                <th>Inspector</th>
                <th @click="store.ordenarPor('estado')" class="data-table__th-sort">
                  Estado
                  <q-icon v-if="store.ordenacao.key === 'estado'" :name="store.iconeOrdenacao" size="14px" />
                </th>
                <th class="data-table__th-actions" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(a, i) in store.paginados"
                :key="i"
                class="data-table__row"
                @click="store.abrirDetalhes(a)"
              >
                <td>
                  <div class="data-hora">
                    <b>{{ a.data }}</b>
                    <span class="data-hora__hora">{{ a.hora }}</span>
                  </div>
                </td>
                <td class="table-time">{{ a.codigo ?? a.id }}</td>
                <td>
                  <div class="placa">
                    <div class="placa__icon">
                      <q-icon name="directions_car" size="16px" />
                    </div>
                    <div>
                      <b>{{ a.matricula }}</b>
                      <small>{{ a.marca }} {{ a.modelo }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="veiculo-info">
                    <b>{{ a.proprietario }}</b>
                    <small>{{ a.telefone }}</small>
                  </div>
                </td>
                <td class="table-posto">{{ a.posto }}</td>
                <td class="table-posto">{{ a.inspetor }}</td>
                <td>
                  <span class="badge" :class="`badge--${store.estadoClasse(a.estado)}`">
                    {{ a.estado }}
                  </span>
                </td>
                <td class="data-table__actions" @click.stop>
                  <button
                    v-if="a.estado === 'Pendente'"
                    class="row-action row-action--success"
                    title="Confirmar"
                    @click="confirmar(a.id)"
                  >
                    <q-icon name="check" size="18px" />
                  </button>

                  <button
                    v-if="a.estado === 'Confirmado'"
                    class="row-action row-action--success"
                    title="Concluir"
                    @click="concluir(a.id)"
                  >
                    <q-icon name="task_alt" size="18px" />
                  </button>

                  <button
                    class="row-action"
                    title="Ver detalhes"
                    @click="store.abrirDetalhes(a)"
                  >
                    <q-icon name="visibility" size="18px" />
                  </button>

                  <button
                    v-if="a.estado !== 'Cancelado' && a.estado !== 'Concluído'"
                    class="row-action row-action--danger"
                    title="Cancelar"
                    @click="pedirCancelar(a)"
                  >
                    <q-icon name="cancel" size="18px" />
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
                <td colspan="8" class="data-table__empty">
                  <q-icon name="event_busy" size="40px" class="data-table__empty-icon" />
                  <p>Nenhum agendamento encontrado com estes filtros.</p>
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
              Mostrando {{ store.inicioPagina + 1 }}–{{ store.fimPagina }} de {{ store.filtrados.length }}
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
    <!-- MODAL — NOVO AGENDAMENTO (4 PASSOS)                          -->
    <!-- ============================================================ -->
    <q-dialog v-model="store.modalNovo" persistent>
      <div class="modal modal--form">
        <header class="modal__head">
          <div>
            <h2 class="modal__title">
              {{ store.passoNovo === 1 ? 'Novo agendamento — Veículo'
                 : store.passoNovo === 2 ? 'Novo agendamento — Proprietário'
                 : store.passoNovo === 3 ? 'Novo agendamento — Detalhes'
                 : 'Novo agendamento — Confirmação' }}
            </h2>
            <small class="modal__sub">
              Passo {{ store.passoNovo }} de 4
            </small>
          </div>
          <button class="modal__close" @click="store.fecharNovo">
            <q-icon name="close" size="20px" />
          </button>
        </header>

        <!-- Barra de progresso -->
        <div class="steps">
          <div
            v-for="n in 4"
            :key="n"
            class="steps__item"
            :class="{
              'steps__item--done': n < store.passoNovo,
              'steps__item--active': n === store.passoNovo,
            }"
          >
            <div class="steps__dot">
              <q-icon v-if="n < store.passoNovo" name="check" size="14px" />
              <span v-else>{{ n }}</span>
            </div>
            <div class="steps__label">
              {{ n === 1 ? 'Veículo' : n === 2 ? 'Proprietário' : n === 3 ? 'Detalhes' : 'Confirmação' }}
            </div>
            <div v-if="n < 4" class="steps__line" />
          </div>
        </div>

        <div class="modal__body">
          <!-- PASSO 1 — Veículo -->
          <div v-if="store.passoNovo === 1" class="form-grid">
            <label class="field field--full">
              <span class="field__label">Matrícula <em>*</em></span>
              <input
                v-model.trim="store.form.matricula"
                class="field__input field__input--placa"
                placeholder="AFC-205-MC"
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

          <!-- PASSO 2 — Proprietário -->
          <div v-else-if="store.passoNovo === 2" class="form-grid">
            <label class="field field--full">
              <span class="field__label">Nome completo <em>*</em></span>
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
          </div>

          <!-- PASSO 3 — Detalhes -->
          <div v-else-if="store.passoNovo === 3" class="form-grid">
            <label class="field">
              <span class="field__label">Data <em>*</em></span>
              <input
                v-model.trim="store.form.data"
                class="field__input"
                placeholder="dd/mm/aaaa"
              />
            </label>

            <label class="field">
              <span class="field__label">Hora <em>*</em></span>
              <select v-model="store.form.hora" class="field__input">
                <option v-for="h in store.HORARIOS" :key="h" :value="h">{{ h }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Duração (min)</span>
              <select v-model.number="store.form.duracao" class="field__input">
                <option :value="30">30 min</option>
                <option :value="45">45 min</option>
                <option :value="60">60 min</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Tipo <em>*</em></span>
              <select v-model="store.form.tipo" class="field__input">
                <option v-for="t in store.TIPOS" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Posto <em>*</em></span>
              <select v-model="store.form.posto" class="field__input">
                <option v-for="p in store.POSTOS" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Inspector <em>*</em></span>
              <select v-model="store.form.inspector" class="field__input">
                <option v-for="i in store.INSPECTORES" :key="i" :value="i">{{ i }}</option>
              </select>
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

          <!-- PASSO 4 — Confirmação -->
          <div v-else class="confirmacao">
            <div class="confirmacao__icon">
              <q-icon name="event_available" size="40px" />
            </div>
            <h3 class="confirmacao__title">Confirmar agendamento</h3>
            <p class="confirmacao__sub">
              Verifique os dados antes de criar o agendamento.
            </p>

            <div class="confirmacao__grid">
              <div class="confirmacao__row">
                <span>Matrícula</span>
                <b>{{ store.form.matricula }}</b>
              </div>
              <div class="confirmacao__row">
                <span>Marca / Modelo</span>
                <b>{{ store.form.marca }} {{ store.form.modelo }}</b>
              </div>
              <div class="confirmacao__row">
                <span>Proprietário</span>
                <b>{{ store.form.proprietario }}</b>
              </div>
              <div class="confirmacao__row">
                <span>NIF</span>
                <b>{{ store.form.nif }}</b>
              </div>
              <div v-if="store.form.telefone" class="confirmacao__row">
                <span>Telefone</span>
                <b>{{ store.form.telefone }}</b>
              </div>
              <div class="confirmacao__row">
                <span>Data / Hora</span>
                <b>{{ store.form.data }} · {{ store.form.hora }}</b>
              </div>
              <div class="confirmacao__row">
                <span>Duração</span>
                <b>{{ store.form.duracao }} min</b>
              </div>
              <div class="confirmacao__row">
                <span>Tipo</span>
                <b>{{ store.form.tipo }}</b>
              </div>
              <div class="confirmacao__row">
                <span>Posto</span>
                <b>{{ store.form.posto }}</b>
              </div>
              <div class="confirmacao__row">
                <span>Inspector</span>
                <b>{{ store.form.inspector }}</b>
              </div>
              <div v-if="store.form.observacoes" class="confirmacao__row confirmacao__row--block">
                <span>Observações</span>
                <p>{{ store.form.observacoes }}</p>
              </div>
            </div>
          </div>
        </div>

        <footer class="modal__foot">
          <template v-if="store.passoNovo === 1">
            <button class="page-btn page-btn--outline" @click="store.fecharNovo">Cancelar</button>
            <button
              class="page-btn page-btn--primary"
              :disabled="!store.passo1Valido"
              @click="store.proximoPasso"
            >
              Próximo
              <q-icon name="arrow_forward" size="16px" />
            </button>
          </template>

          <template v-else-if="store.passoNovo === 2">
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

          <template v-else-if="store.passoNovo === 3">
            <button class="page-btn page-btn--outline" @click="store.passoAnterior">
              <q-icon name="arrow_back" size="16px" />
              Voltar
            </button>
            <button
              class="page-btn page-btn--primary"
              :disabled="!store.passo3Valido"
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
              @click="salvarNovo"
            >
              <q-icon name="save" size="16px" />
              {{ store.aSalvar ? 'A guardar…' : 'Confirmar agendamento' }}
            </button>
          </template>
        </footer>
      </div>
    </q-dialog>

    <!-- ============================================================ -->
    <!-- MODAL — DETALHES DO AGENDAMENTO                              -->
    <!-- ============================================================ -->
    <q-dialog v-model="store.modalDetalhes">
      <div v-if="store.agendamentoDetalhe" class="modal">
        <header class="modal__head">
          <div class="detail-head">
            <div class="detail-head__icon">
              <q-icon name="event" size="20px" />
            </div>
            <div>
              <h2 class="modal__title">
                {{ store.agendamentoDetalhe.codigo ?? store.agendamentoDetalhe.id }}
              </h2>
              <small class="modal__sub">
                {{ store.agendamentoDetalhe.data }} às {{ store.agendamentoDetalhe.hora }}
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
              :class="`badge--${store.estadoClasse(store.agendamentoDetalhe.estado)}`"
            >
              {{ store.agendamentoDetalhe.estado }}
            </span>
          </div>

          <div class="detail-row">
            <span>Tipo</span>
            <b>{{ store.agendamentoDetalhe.tipo }}</b>
          </div>

          <div class="detail-row">
            <span>Veículo</span>
            <b>
              {{ store.agendamentoDetalhe.matricula }} ·
              {{ store.agendamentoDetalhe.marca }} {{ store.agendamentoDetalhe.modelo }}
            </b>
          </div>

          <div class="detail-row">
            <span>Proprietário</span>
            <b>{{ store.agendamentoDetalhe.proprietario }}</b>
          </div>

          <div class="detail-row">
            <span>NIF</span>
            <b>{{ store.agendamentoDetalhe.nif }}</b>
          </div>

          <div v-if="store.agendamentoDetalhe.telefone" class="detail-row">
            <span>Telefone</span>
            <b>{{ store.agendamentoDetalhe.telefone }}</b>
          </div>

          <div class="detail-row">
            <span>Posto</span>
            <b>{{ store.agendamentoDetalhe.posto }}</b>
          </div>

          <div class="detail-row">
            <span>Inspector</span>
            <b>{{ store.agendamentoDetalhe.inspetor }}</b>
          </div>

          <div class="detail-row">
            <span>Duração</span>
            <b>{{ store.agendamentoDetalhe.duracao }} min</b>
          </div>

          <div class="detail-row">
            <span>Criado em</span>
            <b>{{ store.agendamentoDetalhe.criadoEm }}</b>
          </div>

          <div
            v-if="store.agendamentoDetalhe.observacoes"
            class="detail-row detail-row--motivo"
          >
            <span>Observações</span>
            <p>{{ store.agendamentoDetalhe.observacoes }}</p>
          </div>
        </div>

        <footer class="modal__foot">
          <button class="page-btn page-btn--outline" @click="store.modalDetalhes = false">
            Fechar
          </button>

          <button
            v-if="store.agendamentoDetalhe.estado === 'Pendente'"
            class="page-btn page-btn--primary"
            @click="confirmar(store.agendamentoDetalhe.id)"
          >
            <q-icon name="check" size="16px" />
            Confirmar
          </button>

          <button
            v-if="store.agendamentoDetalhe.estado === 'Confirmado'"
            class="page-btn page-btn--primary"
            @click="concluir(store.agendamentoDetalhe.id)"
          >
            <q-icon name="task_alt" size="16px" />
            Concluir
          </button>

          <button
            v-if="store.agendamentoDetalhe.estado !== 'Cancelado' && store.agendamentoDetalhe.estado !== 'Concluído'"
            class="page-btn page-btn--outline page-btn--danger"
            @click="pedirCancelar(store.agendamentoDetalhe)"
          >
            <q-icon name="cancel" size="16px" />
            Cancelar
          </button>
        </footer>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  useInatroAgendamentosStore,
  type Agendamento,
} from '@/stores/inatro/inatro-AgendamentosStore'

const store = useInatroAgendamentosStore()
const $q = useQuasar()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Filtros rápidos
// ============================================================
function filtrarHoje() {
  store.limparFiltros()
  store.filtroData = 'hoje'
}

function filtrarSemana() {
  store.limparFiltros()
  store.filtroData = 'semana'
}

function filtrarConfirmados() {
  store.limparFiltros()
  store.filtroEstado = 'Confirmado'
}

function filtrarCancelados() {
  store.limparFiltros()
  store.filtroEstado = 'Cancelado'
}

// ============================================================
// Salvar novo
// ============================================================
async function salvarNovo() {
  const ok = await store.salvarNovo()
  if (!ok) {
    if (store.erro) {
      $q.notify({
        type: 'negative',
        message: store.erro,
        position: 'top',
        timeout: 5000,
      })
    }
    return
  }

  $q.notify({
    type: 'positive',
    message: 'Agendamento criado com sucesso',
    position: 'top',
  })
  store.fecharNovo()
}

// ============================================================
// Ações
// ============================================================
async function confirmar(id: string) {
  const ok = await store.confirmar(id)
  if (!ok) return
  $q.notify({
    type: 'positive',
    message: 'Agendamento confirmado',
    position: 'top',
  })
}

async function concluir(id: string) {
  const ok = await store.concluir(id)
  if (!ok) return
  $q.notify({
    type: 'positive',
    message: 'Agendamento concluído',
    position: 'top',
  })
}

function pedirCancelar(a: Agendamento) {
  const ref = a.codigo ?? a.id
  $q.dialog({
    title: 'Cancelar agendamento',
    message: `Confirmar o cancelamento de ${ref} (${a.matricula})?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Cancelar', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.cancelar(a.id)
    if (ok) {
      $q.notify({
        type: 'warning',
        message: `Agendamento ${ref} cancelado`,
        position: 'top',
      })
    }
  })
}

function pedirRemover(a: Agendamento) {
  const ref = a.codigo ?? a.id
  $q.dialog({
    title: 'Remover agendamento',
    message: `Remover permanentemente ${ref} (${a.matricula})?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(a.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: `Agendamento ${ref} removido`,
        position: 'top',
      })
    }
  })
}

// ============================================================
// Exportar CSV
// ============================================================
function exportarCSV() {
  const headers = [
    'Código', 'Data', 'Hora', 'Duração (min)', 'Matrícula',
    'Marca', 'Modelo', 'Proprietário', 'NIF', 'Telefone',
    'Posto', 'Inspector', 'Tipo', 'Estado', 'Criado em',
  ]
  const linhas = store.filtrados.map((a) => [
    a.codigo ?? a.id,
    a.data,
    a.hora,
    String(a.duracao),
    a.matricula,
    a.marca,
    a.modelo,
    a.proprietario,
    a.nif,
    a.telefone,
    a.posto,
    a.inspetor,
    a.tipo,
    a.estado,
    a.criadoEm,
  ])
  const csv = [headers, ...linhas]
    .map((l) => l.map((c) => `"${c}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inatro-agendamentos-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado', position: 'top' })
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
/* CABEÇALHO                                                    */
/* ============================================================ */
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 700px) { flex-direction: column; }

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

/* ============================================================ */
/* BOTÕES                                                       */
/* ============================================================ */
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

    &:hover {
      background: var(--sicam-surface-hover);
      border-color: var(--sicam-line-strong);
    }
  }

  &--danger {
    color: var(--sicam-critical);
    border-color: var(--sicam-critical);

    &:hover { background: var(--sicam-critical-bg); }
  }
}

/* ============================================================ */
/* ALERTAS                                                      */
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

  &__icon { flex-shrink: 0; }

  &__body {
    flex: 1;
    min-width: 0;

    b { display: block; font-size: 13px; font-weight: 700; }
    small { display: block; font-size: 12px; margin-top: 2px; opacity: 0.85; }
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

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
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
  &:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--primary { background: var(--sicam-primary-bg); color: var(--sicam-primary); }
    &--success { background: var(--sicam-success-bg); color: var(--sicam-success-ink); }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--warning { background: var(--sicam-warning-bg); color: var(--sicam-warning-ink); }
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
/* FILTROS                                                      */
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

  &--search { flex: 1; min-width: 240px; }

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
/* TABELA                                                       */
/* ============================================================ */
.block {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }
}

.table-wrap {
  width: 100%;
  overflow: hidden;
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

  &__th-sort {
    cursor: pointer;
    user-select: none;

    &:hover { color: var(--sicam-ink); }
  }

  &__th-actions {
    width: 170px;
    text-align: right;
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

    p { margin: 0 0 16px; }
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

.data-hora {
  display: flex;
  flex-direction: column;
  gap: 2px;

  b {
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink);
  }

  &__hora {
    font-size: 12px;
    color: var(--sicam-primary);
    font-weight: 700;
  }
}

.placa {
  display: flex;
  align-items: center;
  gap: 10px;

  b {
    font-weight: 700;
    letter-spacing: 0.02em;
    font-size: 14px;
  }

  small {
    display: block;
    font-size: 11px;
    color: var(--sicam-muted);
    margin-top: 1px;
  }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
  }
}

.veiculo-info {
  b {
    display: block;
    color: var(--sicam-ink);
    font-weight: 600;
    font-size: 13px;
  }

  small {
    display: block;
    color: var(--sicam-muted);
    font-size: 11px;
    margin-top: 2px;
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

  &:hover:not(:disabled) { background: var(--sicam-surface-hover); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.pag-info {
  font-size: 13px;
  color: var(--sicam-muted);

  b { color: var(--sicam-ink); }
}

/* ============================================================ */
/* MODAIS                                                       */
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
    transition: all 0.15s;

    &:hover {
      background: var(--sicam-surface-hover);
      color: var(--sicam-ink);
    }
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
/* STEPS                                                        */
/* ============================================================ */
.steps {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(180deg, #fafbfa 0%, #fff 100%);
  border-bottom: 1px solid var(--sicam-line-soft);
  gap: 0;
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

  .q-icon { font-weight: 700; }
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

  .steps__label {
    color: var(--sicam-primary);
    font-weight: 700;
  }
}

/* ============================================================ */
/* FORMULÁRIO                                                   */
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

    &:hover { border-color: var(--sicam-line-strong); }

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
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  }
}

/* ============================================================ */
/* CONFIRMAÇÃO                                                  */
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
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
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

    &:last-child { border-bottom: 0; }

    span {
      font-size: 11px;
      color: var(--sicam-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
      flex-shrink: 0;
    }

    b {
      font-size: 14px;
      color: var(--sicam-ink);
      font-weight: 700;
      text-align: right;
      word-break: break-word;
    }

    &--block {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;

      span { text-align: left; }

      p {
        margin: 0;
        font-size: 13px;
        color: var(--sicam-ink);
        line-height: 1.6;
        background: #fff;
        padding: 12px 16px;
        border-radius: 10px;
        border: 1px solid var(--sicam-line-soft);
        width: 100%;
      }
    }
  }
}

/* ============================================================ */
/* DETALHES                                                     */
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
/* RESPONSIVO                                                   */
/* ============================================================ */
@media (max-width: 600px) {
  .modal--form {
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

  .form-grid { grid-template-columns: 1fr; }
  .steps { padding: 14px 16px; }

  .steps__dot {
    width: 26px;
    height: 26px;
    font-size: 11px;
  }

  .steps__line { margin: 0 6px; }

  .confirmacao__icon {
    width: 64px;
    height: 64px;
  }

  .confirmacao__title { font-size: 17px; }

  .page-head__actions {
    width: 100%;
    .page-btn { flex: 1; }
  }

  .data-table th,
  .data-table td {
    padding: 10px 12px;
  }

  .data-table__th-actions { width: 90px; }
}

@media (max-width: 480px) {
  .steps__label { display: none; }
}
</style>