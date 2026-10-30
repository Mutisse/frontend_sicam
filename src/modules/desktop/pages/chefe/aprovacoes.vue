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
      <div class="sk-list">
        <div v-for="i in 3" :key="i" class="sk-card" />
      </div>
    </div>

    <!-- CONTEÚDO -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Aprovações</h1>
          <p class="page-head__sub">
            Autos de Notícia e pedidos à espera da sua validação
          </p>
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
        <button class="kpi" @click="irPara('pendentes')">
          <div class="kpi__icon kpi__icon--warning">
            <q-icon name="pending_actions" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.pendentes }}</div>
            <div class="kpi__label">Aguarda aprovação</div>
          </div>
        </button>

        <button class="kpi" @click="irPara('aprovados')">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="check_circle" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.aprovadosHoje }}</div>
            <div class="kpi__label">Aprovados hoje</div>
          </div>
        </button>

        <button class="kpi" @click="irPara('rejeitados')">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="cancel" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.kpis.rejeitadosHoje }}</div>
            <div class="kpi__label">Rejeitados hoje</div>
          </div>
        </button>

        <div class="kpi kpi--static">
          <div class="kpi__icon kpi__icon--info">
            <q-icon name="schedule" size="22px" />
          </div>
          <div>
            <div class="kpi__value">
              {{ store.kpis.tempoMedio }}<span class="kpi__unid"> min</span>
            </div>
            <div class="kpi__label">Tempo médio</div>
          </div>
        </div>
      </section>

      <!-- TABS -->
      <section class="tabs">
        <button
          v-for="t in store.tabs"
          :key="t.key"
          class="tabs__btn"
          :class="{ 'tabs__btn--active': store.tabActivo === t.key }"
          @click="store.tabActivo = t.key"
        >
          <q-icon :name="t.icon" size="16px" />
          {{ t.label }}
          <span v-if="t.count" class="tabs__count">{{ t.count }}</span>
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
            placeholder="Pesquisar por título, matrícula, agente…"
          />
        </div>

        <select v-model="store.filtroTipo" class="filter filter__select">
          <option value="">Todos os tipos</option>
          <option v-for="t in store.TIPOS" :key="t" :value="t">
            {{ store.labelTipo(t) }}
          </option>
        </select>

        <select v-model="store.filtroPrioridade" class="filter filter__select">
          <option value="">Todas as prioridades</option>
          <option v-for="p in store.PRIORIDADES" :key="p" :value="p">{{ p }}</option>
        </select>

        <button
          v-if="store.temFiltrosAtivos"
          class="page-btn page-btn--outline page-btn--compact"
          @click="store.limparFiltros"
        >
          <q-icon name="close" size="16px" />
          Limpar
        </button>

        <button class="page-btn page-btn--outline page-btn--compact" @click="exportarCSV">
          <q-icon name="grid_on" size="16px" />
          Excel
        </button>
      </section>

      <!-- ERRO -->
      <div v-if="store.erro" class="form-error">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- LISTA -->
      <section class="lista">
        <article
          v-for="a in store.paginados"
          :key="a.id"
          class="aprovacao"
          :class="`aprovacao--${a.estado}`"
        >
          <!-- Cabeçalho -->
          <header class="aprovacao__head">
            <div class="aprovacao__icon" :class="`aprovacao__icon--${a.tipo}`">
              <q-icon :name="store.iconeTipo(a.tipo)" size="20px" />
            </div>

            <div class="aprovacao__info">
              <div class="aprovacao__row">
                <span
                  class="aprovacao__tipo-tag"
                  :class="`aprovacao__tipo-tag--${a.tipo}`"
                >
                  {{ store.labelTipo(a.tipo) }}
                </span>
                <span
                  class="aprovacao__estado"
                  :class="`aprovacao__estado--${a.estado}`"
                >
                  {{ store.labelEstado(a.estado) }}
                </span>
                <span
                  class="badge"
                  :class="`badge--${store.prioridadeClasse(a.prioridade)}`"
                >
                  {{ a.prioridade }}
                </span>
              </div>
              <h3 class="aprovacao__titulo">{{ a.titulo }}</h3>
            </div>

            <span class="aprovacao__hora">{{ a.hora }}</span>
          </header>

          <!-- Detalhes -->
          <div class="aprovacao__detalhes">
            <div v-for="d in a.detalhes" :key="d.label" class="aprovacao__det">
              <span class="aprovacao__det-label">{{ d.label }}</span>
              <span class="aprovacao__det-valor">{{ d.valor }}</span>
            </div>
          </div>

          <!-- Motivo da rejeição -->
          <div v-if="a.motivoRejeicao" class="aprovacao__rejeicao">
            <q-icon name="info" size="14px" />
            <span><b>Motivo da rejeição:</b> {{ a.motivoRejeicao }}</span>
          </div>

          <!-- Decisão -->
          <div v-if="a.decididoPor && a.decididoEm" class="aprovacao__decisao">
            <q-icon
              :name="a.estado === 'aprovado' ? 'check_circle' : 'cancel'"
              size="14px"
            />
            <span>
              Decidido por <b>{{ a.decididoPor }}</b> em {{ a.decididoEm }}
            </span>
          </div>

          <!-- Rodapé -->
          <footer v-if="a.estado === 'pendente'" class="aprovacao__foot">
            <button
              class="aprovacao__btn aprovacao__btn--rejeitar"
              @click="store.abrirRejeicao(a)"
            >
              <q-icon name="close" size="16px" />
              Rejeitar
            </button>

            <button
              class="aprovacao__btn aprovacao__btn--detalhes"
              @click="store.abrirDetalhes(a)"
            >
              <q-icon name="visibility" size="16px" />
              Ver completo
            </button>

            <button
              class="aprovacao__btn aprovacao__btn--aprovar"
              @click="aprovar(a)"
            >
              <q-icon name="check" size="16px" />
              Aprovar
            </button>
          </footer>
        </article>

        <!-- Vazio -->
        <div v-if="!store.paginados.length" class="lista-vazia">
          <q-icon name="check_circle" size="48px" />
          <p>Nada por aprovar neste separador.</p>
        </div>

        <!-- Paginação -->
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

    <!-- MODAL — DETALHES -->
    <q-dialog v-model="store.modalDetalhes">
      <q-card v-if="store.aprovacaoDetalhe" class="modal-card">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div
              class="modal-head__icon"
              :class="`modal-head__icon--${store.aprovacaoDetalhe.tipo}`"
            >
              <q-icon :name="store.iconeTipo(store.aprovacaoDetalhe.tipo)" size="22px" />
            </div>
            <div>
              <div class="modal-head__title">{{ store.aprovacaoDetalhe.titulo }}</div>
              <div class="modal-head__sub">{{ store.aprovacaoDetalhe.hora }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="store.modalDetalhes = false" />
        </q-card-section>

        <q-card-section class="modal-estado">
          <span
            class="aprovacao__tipo-tag"
            :class="`aprovacao__tipo-tag--${store.aprovacaoDetalhe.tipo}`"
          >
            {{ store.labelTipo(store.aprovacaoDetalhe.tipo) }}
          </span>
          <span
            class="aprovacao__estado"
            :class="`aprovacao__estado--${store.aprovacaoDetalhe.estado}`"
          >
            {{ store.labelEstado(store.aprovacaoDetalhe.estado) }}
          </span>
          <span
            class="badge"
            :class="`badge--${store.prioridadeClasse(store.aprovacaoDetalhe.prioridade)}`"
          >
            {{ store.aprovacaoDetalhe.prioridade }}
          </span>
        </q-card-section>

        <q-card-section class="modal-grid">
          <div
            v-for="d in store.aprovacaoDetalhe.detalhes"
            :key="d.label"
            class="modal-field"
          >
            <div class="modal-field__label">{{ d.label }}</div>
            <div class="modal-field__value">{{ d.valor }}</div>
          </div>

          <div class="modal-field modal-field--full">
            <div class="modal-field__label">Criado em</div>
            <div class="modal-field__value">{{ store.aprovacaoDetalhe.criadoEm }}</div>
          </div>

          <div
            v-if="store.aprovacaoDetalhe.decididoPor"
            class="modal-field modal-field--full"
          >
            <div class="modal-field__label">Decisão</div>
            <div class="modal-field__value">
              {{ store.labelEstado(store.aprovacaoDetalhe.estado) }} por
              <b>{{ store.aprovacaoDetalhe.decididoPor }}</b>
              em {{ store.aprovacaoDetalhe.decididoEm }}
            </div>
          </div>

          <div
            v-if="store.aprovacaoDetalhe.motivoRejeicao"
            class="modal-field modal-field--full"
          >
            <div class="modal-field__label">Motivo da rejeição</div>
            <div class="modal-field__value modal-field__value--text">
              {{ store.aprovacaoDetalhe.motivoRejeicao }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat label="Fechar" @click="store.modalDetalhes = false" />
          <div class="modal-actions__right">
            <q-btn
              v-if="store.aprovacaoDetalhe.estado === 'pendente'"
              flat
              label="Rejeitar"
              icon="close"
              color="negative"
              @click="store.modalDetalhes = false; store.abrirRejeicao(store.aprovacaoDetalhe)"
            />
            <q-btn
              v-if="store.aprovacaoDetalhe.estado === 'pendente'"
              unelevated
              color="primary"
              icon="check"
              label="Aprovar"
              @click="aprovar(store.aprovacaoDetalhe); store.modalDetalhes = false"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG — REJEIÇÃO -->
    <q-dialog v-model="store.dialogRejeicao" persistent>
      <q-card class="modal-card">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div class="modal-head__icon modal-head__icon--critico">
              <q-icon name="cancel" size="22px" />
            </div>
            <div>
              <div class="modal-head__title">Rejeitar aprovação</div>
              <div class="modal-head__sub">
                {{ store.aprovacaoSelecionada?.titulo }}
              </div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="store.fecharRejeicao" />
        </q-card-section>

        <q-card-section class="modal-body">
          <p class="modal-hint">
            Indique o motivo da rejeição (mínimo 10 caracteres). O agente responsável
            será notificado.
          </p>

          <label class="field field--full">
            <span class="field__label">Motivo <em>*</em></span>
            <textarea
              v-model.trim="store.motivoRejeicao"
              class="field__input"
              rows="4"
              placeholder="Ex.: Documentação incompleta, valor da infração incorreto…"
            />
            <span class="field__hint">
              {{ store.motivoRejeicao.length }} caracteres
            </span>
          </label>

          <label class="field field--full" style="margin-top: 16px;">
            <span class="field__label">Responsável pela decisão <em>*</em></span>
            <select v-model="store.responsavel" class="field__input">
              <option v-for="r in store.RESPONSAVEIS" :key="r" :value="r">{{ r }}</option>
            </select>
          </label>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat label="Cancelar" @click="store.fecharRejeicao" />
          <q-btn
            unelevated
            color="negative"
            icon="cancel"
            label="Confirmar rejeição"
            :disable="store.motivoRejeicao.trim().length < 10"
            @click="confirmarRejeicao"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  useChefeAprovacoesStore,
  type Aprovacao,
} from '@/stores/chefe/chefe-AprovacoesStore'

const store = useChefeAprovacoesStore()
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
      icon: 'pending_actions',
      titulo: `${store.kpis.pendentes} pedido${store.kpis.pendentes === 1 ? '' : 's'} à espera de aprovação`,
      descricao: 'Priorize autos e apreensões de prioridade alta',
    })
  }

  return lista
})

// ============================================================
// Filtros rápidos (KPIs)
// ============================================================
function irPara(tab: 'pendentes' | 'aprovados' | 'rejeitados') {
  store.tabActivo = tab
  store.limparFiltros()
}

// ============================================================
// Aprovar
// ============================================================
function aprovar(a: Aprovacao) {
  $q.dialog({
    title: 'Aprovar pedido',
    message: `Confirmar a aprovação de "${a.titulo}"?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Aprovar', color: 'positive' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.aprovar(a.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: 'Aprovação registada com sucesso.',
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

// ============================================================
// Confirmar rejeição
// ============================================================
async function confirmarRejeicao() {
  const ok = await store.confirmarRejeicao()
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
    type: 'info',
    message: 'Rejeição registada. Agente notificado.',
    position: 'top',
  })
}

// ============================================================
// Exportar CSV
// ============================================================
function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — CHEFE DE POSTO — Aprovações'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    [
      'ID', 'Tipo', 'Título', 'Matrícula', 'Agente', 'Posto',
      'Prioridade', 'Estado', 'Criado em', 'Decidido em',
      'Decidido por', 'Motivo rejeição',
    ],
    ...store.filtrados.map((a) => [
      a.id,
      store.labelTipo(a.tipo),
      a.titulo,
      a.matricula,
      a.agente,
      a.posto,
      a.prioridade,
      store.labelEstado(a.estado),
      a.criadoEm,
      a.decididoEm ?? '',
      a.decididoPor ?? '',
      a.motivoRejeicao ?? '',
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `chefe-aprovacoes-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
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

.sk-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sk-card {
  @extend %sk-block;
  height: 180px;
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
  margin-bottom: 20px;

  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub   { font-size: 14px; color: var(--sicam-muted); margin: 0; }
}

/* ============================================================ */
/* Botões                                                       */
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
    &:hover:not(:disabled) { background: var(--sicam-primary); }
  }

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
    &:hover { background: var(--sicam-surface-hover); }
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

  &--static { cursor: default; }

  &:active:not(.kpi--static) { transform: scale(0.98); }
  &:hover  { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }

  &__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;

    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--info     { background: #dbeafe; color: #2563eb; }
  }

  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__unid { font-size: 14px; font-weight: 500; color: var(--sicam-muted); }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

/* ============================================================ */
/* Tabs                                                         */
/* ============================================================ */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 4px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
}

.tabs__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sicam-muted);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover { background: var(--sicam-surface-hover); }

  &--active {
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    font-weight: 700;
  }
}

.tabs__count {
  background: var(--sicam-primary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 99px;
  padding: 2px 7px;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ============================================================ */
/* Filtros                                                      */
/* ============================================================ */
.filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }

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
/* Lista                                                        */
/* ============================================================ */
.lista { display: flex; flex-direction: column; gap: 14px; }

.aprovacao {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--sicam-line-soft);
  transition: all 0.2s;

  &:hover { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06); }

  &--aprovado  { opacity: 0.85; background: #fafdfa; }
  &--rejeitado { opacity: 0.85; background: #fdfafa; }

  &__head {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;

    @media (max-width: 600px) { flex-wrap: wrap; }
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--auto            { background: #dbeafe; color: #2563eb; }
    &--dados-sensiveis { background: #fef3c7; color: #a16207; }
    &--apreensao       { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__info { flex: 1; min-width: 0; }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }

  &__tipo-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    &--auto            { background: #dbeafe; color: #2563eb; }
    &--dados-sensiveis { background: #fef3c7; color: #a16207; }
    &--apreensao       { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__estado {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    &--pendente  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--aprovado  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--rejeitado { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__titulo {
    font-size: 16px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
    line-height: 1.3;
  }

  &__hora {
    font-size: 12px;
    color: var(--sicam-muted);
    flex-shrink: 0;
    white-space: nowrap;
  }

  &__detalhes {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    padding: 14px 16px;
    background: var(--sicam-surface-alt);
    border-radius: 12px;
    margin-bottom: 16px;

    @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 400px) { grid-template-columns: 1fr; }
  }

  &__det { display: flex; flex-direction: column; gap: 3px; }

  &__det-label {
    font-size: 10px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  &__det-valor {
    font-size: 13px;
    color: var(--sicam-ink);
    font-weight: 600;
  }

  &__rejeicao {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 14px;
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
    border-radius: 10px;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;

    .q-icon { flex-shrink: 0; margin-top: 1px; }
  }

  &__decisao {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #f0fdf9;
    color: var(--sicam-success-ink);
    border-radius: 10px;
    font-size: 12px;
    margin-bottom: 16px;

    .q-icon { flex-shrink: 0; }
    b { font-weight: 700; }
  }

  &__foot {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid var(--sicam-line-soft);

    @media (max-width: 500px) { flex-direction: column-reverse; }
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 0;
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;

    @media (max-width: 500px) {
      justify-content: center;
      width: 100%;
    }

    &--rejeitar {
      background: #fff;
      color: var(--sicam-critical);
      border: 1px solid rgba(239, 68, 68, 0.2);
      &:hover { background: var(--sicam-critical-bg); }
    }

    &--detalhes {
      background: #fff;
      color: var(--sicam-ink);
      border: 1px solid var(--sicam-line);
      &:hover { background: var(--sicam-surface-hover); }
    }

    &--aprovar {
      background: var(--sicam-success);
      color: #fff;
      &:hover { background: #15803d; }
    }
  }
}

/* ============================================================ */
/* Empty state                                                  */
/* ============================================================ */
.lista-vazia {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .q-icon { color: var(--sicam-success); margin-bottom: 12px; }
  p { margin: 0; color: var(--sicam-muted); font-size: 14px; }
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
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid transparent;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
  }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); border-color: rgba(16, 185, 129, 0.18); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); border-color: rgba(245, 158, 11, 0.22); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); border-color: rgba(239, 68, 68, 0.22); }
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
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-top: 4px;
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

  @media (max-width: 800px) {
    min-width: 90vw;
    max-width: 95vw;
  }
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

    &--auto            { background: #dbeafe; color: #2563eb; }
    &--dados-sensiveis { background: #fef3c7; color: #a16207; }
    &--apreensao       { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--critico         { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
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

.modal-hint {
  font-size: 13px;
  color: var(--sicam-muted);
  line-height: 1.5;
  margin: 0 0 16px;
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
/* Formulário                                                   */
/* ============================================================ */
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