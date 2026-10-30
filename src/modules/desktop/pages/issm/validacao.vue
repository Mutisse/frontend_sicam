<template>
  <q-page class="vl-page">
    <!-- CABEÇALHO -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Validação</h1>
        <p class="page-head__sub">
          Consulte a validade do seguro obrigatório por matrícula
        </p>
      </div>
      <div v-if="store.historico.length" class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="confirmarLimparHistorico">
          <q-icon name="delete_sweep" size="18px" />
          Limpar histórico
        </button>
      </div>
    </header>

    <!-- KPIs -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary">
          <q-icon name="fact_check" size="22px" />
        </div>
        <div>
          <div class="kpi__value">{{ store.kpis.total }}</div>
          <div class="kpi__label">Validações</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success">
          <q-icon name="verified_user" size="22px" />
        </div>
        <div>
          <div class="kpi__value">{{ store.kpis.validas }}</div>
          <div class="kpi__label">Válidas</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning">
          <q-icon name="hourglass_top" size="22px" />
        </div>
        <div>
          <div class="kpi__value">{{ store.kpis.aExpirar }}</div>
          <div class="kpi__label">A expirar</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical">
          <q-icon name="cancel" size="22px" />
        </div>
        <div>
          <div class="kpi__value">{{ store.kpis.expiradas }}</div>
          <div class="kpi__label">Expiradas</div>
        </div>
      </div>
    </section>

    <!-- GRELHA: consulta + histórico -->
    <section class="vl-grid">
      <!-- COLUNA ESQUERDA -->
      <div class="vl-grid__main">
        <!-- Caixa de consulta -->
        <div class="consult-card">
          <div class="consult-card__head">
            <q-icon name="verified_user" size="22px" />
            <div>
              <h2 class="consult-card__title">Validar seguro</h2>
              <p class="consult-card__sub">
                Introduza a matrícula para verificar o estado do seguro
              </p>
            </div>
          </div>

          <div class="consult-card__form">
            <input
              v-model="store.matricula"
              class="consult-card__input"
              placeholder="Ex.: AGL-482-MC"
              @keydown.enter="consultar"
            />
            <button
              class="page-btn page-btn--primary"
              :disabled="store.aConsultar || !store.matricula"
              @click="consultar"
            >
              <q-icon name="search" size="18px" />
              {{ store.aConsultar ? 'A validar…' : 'Validar' }}
            </button>
          </div>

          <div class="consult-card__exemplos">
            <span>Exemplos:</span>
            <button
              v-for="ex in store.EXEMPLOS"
              :key="ex"
              class="consult-card__ex"
              @click="consultarExemplo(ex)"
            >
              {{ ex }}
            </button>
          </div>
        </div>

        <!-- Resultado -->
        <div v-if="store.resultado" class="result">
          <div
            class="result__banner"
            :class="`result__banner--${store.resultado.estado}`"
          >
            <q-icon :name="store.resultado.icone" size="32px" />
            <div>
              <h3 class="result__banner-title">{{ store.resultado.titulo }}</h3>
              <p class="result__banner-sub">{{ store.resultado.subtitulo }}</p>
            </div>
          </div>

          <div class="result__grid">
            <div class="result__card">
              <div class="result__card-label">Matrícula</div>
              <div class="result__card-value">{{ store.resultado.matricula }}</div>
            </div>
            <div class="result__card">
              <div class="result__card-label">Nº Apólice</div>
              <div class="result__card-value">{{ store.resultado.apolice }}</div>
            </div>
            <div class="result__card">
              <div class="result__card-label">Seguradora</div>
              <div class="result__card-value">{{ store.resultado.seguradora }}</div>
            </div>
            <div class="result__card">
              <div class="result__card-label">Tipo</div>
              <div class="result__card-value">{{ store.resultado.tipo }}</div>
            </div>
            <div class="result__card">
              <div class="result__card-label">Início</div>
              <div class="result__card-value">{{ store.resultado.inicio }}</div>
            </div>
            <div class="result__card">
              <div class="result__card-label">Fim</div>
              <div class="result__card-value">{{ store.resultado.fim }}</div>
            </div>
            <div v-if="store.resultado.segurado" class="result__card">
              <div class="result__card-label">Segurado</div>
              <div class="result__card-value">{{ store.resultado.segurado }}</div>
            </div>
            <div v-if="store.resultado.telefone" class="result__card">
              <div class="result__card-label">Telefone</div>
              <div class="result__card-value">{{ store.resultado.telefone }}</div>
            </div>
            <div v-if="store.resultado.email" class="result__card">
              <div class="result__card-label">Email</div>
              <div class="result__card-value">{{ store.resultado.email }}</div>
            </div>
            <div
              v-if="store.resultado.diasRestantes !== undefined"
              class="result__card"
            >
              <div class="result__card-label">Dias restantes</div>
              <div class="result__card-value">{{ store.resultado.diasRestantes }}</div>
            </div>
          </div>

          <div
            v-if="store.resultado.aviso"
            class="result__aviso"
            :class="`result__aviso--${store.resultado.estado}`"
          >
            <q-icon name="info" size="18px" />
            <span>{{ store.resultado.aviso }}</span>
          </div>

          <div class="result__actions">
            <button class="page-btn page-btn--outline" @click="store.limpar()">
              <q-icon name="refresh" size="18px" />
              Nova validação
            </button>
            <button class="page-btn page-btn--outline" @click="imprimirComprovativo">
              <q-icon name="print" size="18px" />
              Imprimir
            </button>
            <button class="page-btn page-btn--outline" @click="copiarComprovativo">
              <q-icon name="content_copy" size="18px" />
              Copiar
            </button>
            <button class="page-btn page-btn--outline" @click="descarregarComprovativo">
              <q-icon name="download" size="18px" />
              Descarregar
            </button>

            <button
              v-if="
                store.resultado.estado === 'a-expirar' ||
                store.resultado.estado === 'expirada'
              "
              class="page-btn page-btn--primary"
              @click="renovar"
            >
              <q-icon name="autorenew" size="18px" />
              Renovar apólice
            </button>

            <button
              v-if="
                store.resultado.estado === 'expirada' ||
                store.resultado.estado === 'nao-encontrada'
              "
              class="page-btn page-btn--danger"
              @click="abrirDenuncia"
            >
              <q-icon name="report" size="18px" />
              Denunciar
            </button>
          </div>
        </div>
      </div>

      <!-- COLUNA DIREITA: histórico -->
      <aside class="vl-grid__side">
        <div class="historico">
          <header class="historico__head">
            <h2 class="historico__title">Recentes</h2>
            <span class="historico__count">{{ store.historico.length }}</span>
          </header>

          <div v-if="store.historico.length" class="historico__list">
            <div
              v-for="h in store.historico"
              :key="h.id"
              class="historico__item"
              @click="store.revalidarItem(h)"
            >
              <div class="historico__icon" :class="`historico__icon--${h.estado}`">
                <q-icon :name="h.icone" size="16px" />
              </div>

              <div class="historico__body">
                <b class="historico__placa">{{ h.matricula }}</b>
                <span class="historico__desc">{{ h.descricao }}</span>
              </div>

              <div class="historico__right">
                <span class="historico__hora">
                  {{ store.formatarHoraRelativa(h.timestamp) }}
                </span>
                <button
                  class="historico__remove"
                  title="Remover"
                  @click.stop="store.removerDoHistorico(h.id)"
                >
                  <q-icon name="close" size="12px" />
                </button>
              </div>
            </div>
          </div>

          <div v-else class="historico__empty">
            <q-icon name="history" size="28px" />
            <p>Sem validações.</p>
          </div>
        </div>
      </aside>
    </section>

    <!-- MODAL — DENÚNCIA -->
    <q-dialog v-model="modalDenuncia">
      <q-card style="min-width: 420px; max-width: 520px" class="denuncia-card">
        <q-card-section>
          <div class="denuncia-card__title">Denunciar veículo sem seguro</div>
          <p class="denuncia-card__sub">
            Matrícula <b>{{ store.resultado?.matricula }}</b>
          </p>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <textarea
            v-model="denunciaNotas"
            class="denuncia-card__textarea"
            rows="4"
            placeholder="Notas adicionais (opcional)"
          />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <button class="page-btn page-btn--outline" @click="modalDenuncia = false">
            Cancelar
          </button>
          <button class="page-btn page-btn--primary" @click="submeterDenuncia">
            <q-icon name="send" size="18px" />
            Enviar denúncia
          </button>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useIssmValidacaoStore } from '@/stores/issm/issm-ValidacaoStore'

const $q = useQuasar()
const store = useIssmValidacaoStore()

const modalDenuncia = ref(false)
const denunciaNotas = ref('')

// ============================================================
// Consulta
// ============================================================
async function consultar() {
  try {
    await store.consultar()
  } catch (e) {
    $q.notify({
      type: 'warning',
      message: 'Introduza uma matrícula válida.',
      position: 'top',
    })
  }
}

function consultarExemplo(ex: string) {
  store.matricula = ex
  consultar()
}

// ============================================================
// Comprovativo
// ============================================================
function imprimirComprovativo() {
  $q.notify({ type: 'info', message: 'A gerar comprovativo…', position: 'top' })
  window.print()
}

async function copiarComprovativo() {
  const ok = await store.copiarComprovativo()
  $q.notify({
    type: ok ? 'positive' : 'negative',
    message: ok ? 'Comprovativo copiado.' : 'Não foi possível copiar.',
    position: 'top',
  })
}

function descarregarComprovativo() {
  const ok = store.descarregarComprovativo()
  $q.notify({
    type: ok ? 'positive' : 'negative',
    message: ok ? 'Comprovativo descarregado.' : 'Nada para descarregar.',
    position: 'top',
  })
}

// ============================================================
// Renovação
// ============================================================
function renovar() {
  if (!store.resultado) return
  const m = store.resultado.matricula
  $q.dialog({
    title: 'Renovar apólice',
    message: `Confirmar renovação da apólice para ${m}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (store.renovarApolice(m)) {
      $q.notify({
        type: 'positive',
        message: 'Apólice renovada.',
        position: 'top',
      })
    }
  })
}

// ============================================================
// Denúncia
// ============================================================
function abrirDenuncia() {
  denunciaNotas.value = ''
  modalDenuncia.value = true
}

function submeterDenuncia() {
  if (!store.resultado) return
  const ok = store.denunciarSemSeguro(store.resultado.matricula, denunciaNotas.value)
  modalDenuncia.value = false
  $q.notify({
    type: ok ? 'positive' : 'negative',
    message: ok ? 'Denúncia registada.' : 'Falha ao registar denúncia.',
    position: 'top',
  })
}

// ============================================================
// Histórico
// ============================================================
function confirmarLimparHistorico() {
  $q.dialog({
    title: 'Limpar histórico',
    message: 'Remover todas as validações recentes?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    store.limparHistorico()
    $q.notify({ type: 'positive', message: 'Histórico limpo.', position: 'top' })
  })
}
</script>

<style scoped lang="scss">
.vl-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

/* ============================================================ */
/* Cabeçalho                                                    */
/* ============================================================ */
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0; }
  &__actions { display: flex; gap: 10px; flex-wrap: wrap; }
}

/* ============================================================ */
/* Botões                                                       */
/* ============================================================ */
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

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
    &:hover:not(:disabled) { background: var(--sicam-surface-hover); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &--primary {
    background: var(--sicam-primary-light);
    color: #fff;
    &:hover:not(:disabled) { background: var(--sicam-primary); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &--danger {
    background: #dc2626;
    color: #fff;
    &:hover:not(:disabled) { background: #b91c1c; }
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

  @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;

    &--primary  { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }
  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

/* ============================================================ */
/* Grid principal                                               */
/* ============================================================ */
.vl-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;

  @media (max-width: 900px) { grid-template-columns: 1fr; }

  &__main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
  &__side { position: sticky; top: 20px; }
}

/* ============================================================ */
/* Cartão de consulta                                           */
/* ============================================================ */
.consult-card {
  background: linear-gradient(155deg, #065f46 0%, #0b4a38 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(6, 95, 70, 0.15);

  &__head {
    display: flex; align-items: flex-start; gap: 12px;
    margin-bottom: 18px;
    .q-icon { color: rgba(255, 255, 255, 0.7); margin-top: 2px; }
  }

  &__title { font-size: 18px; font-weight: 700; margin: 0 0 2px; }
  &__sub { font-size: 13px; opacity: 0.8; margin: 0; }

  &__form {
    display: flex; gap: 10px; margin-bottom: 12px;
    @media (max-width: 500px) { flex-direction: column; }
  }

  &__input {
    flex: 1; border: 0; border-radius: 12px; padding: 14px 18px;
    font-size: 16px; font-family: inherit; color: var(--sicam-ink);
    background: #fff; letter-spacing: 0.04em; font-weight: 600;
    text-transform: uppercase;

    &::placeholder {
      color: var(--sicam-muted); font-weight: 400;
      text-transform: none; letter-spacing: 0;
    }
    &:focus { outline: 2px solid rgba(255, 255, 255, 0.5); }
  }

  &__exemplos {
    display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
    font-size: 12px; opacity: 0.75;
  }

  &__ex {
    background: rgba(255, 255, 255, 0.15); border: 0; border-radius: 99px;
    color: #fff; padding: 4px 12px; font-size: 12px; font-weight: 600;
    cursor: pointer; font-family: inherit; letter-spacing: 0.04em;
    &:hover { background: rgba(255, 255, 255, 0.25); }
  }
}

/* ============================================================ */
/* Resultado                                                    */
/* ============================================================ */
.result { display: flex; flex-direction: column; gap: 16px; }

.result__banner {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 22px; border-radius: 16px; color: #fff;

  &--valida          { background: linear-gradient(135deg, #16a34a, #15803d); box-shadow: 0 6px 20px rgba(22, 163, 74, 0.25); }
  &--a-expirar       { background: linear-gradient(135deg, #d99a06, #b45309); box-shadow: 0 6px 20px rgba(217, 154, 6, 0.25); }
  &--expirada        { background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.25); }
  &--nao-encontrada  { background: linear-gradient(135deg, #6b7280, #4b5563); box-shadow: 0 6px 20px rgba(107, 114, 128, 0.25); }
}

.result__banner-title { font-size: 18px; font-weight: 700; margin: 0 0 2px; }
.result__banner-sub   { font-size: 13px; opacity: 0.9; margin: 0; }

.result__grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.result__card {
  background: #fff; border-radius: 12px; padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--sicam-line-soft);
}

.result__card-label {
  font-size: 10px; color: var(--sicam-muted); text-transform: uppercase;
  letter-spacing: 0.05em; font-weight: 600; margin-bottom: 4px;
}

.result__card-value {
  font-size: 14px; font-weight: 700; color: var(--sicam-ink); letter-spacing: 0.02em;
  word-break: break-word;
}

.result__aviso {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px 18px; border-radius: 12px; font-size: 13px;
  line-height: 1.5;

  &--valida         { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--a-expirar      { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--expirada       { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--nao-encontrada { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }

  .q-icon { flex-shrink: 0; margin-top: 1px; }
}

.result__actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* ============================================================ */
/* Histórico lateral                                            */
/* ============================================================ */
.historico {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head {
    display: flex; align-items: baseline; gap: 10px;
    padding: 16px 18px 12px; border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__title {
    font-size: 13px; font-weight: 700; color: var(--sicam-ink);
    margin: 0; text-transform: uppercase; letter-spacing: 0.05em;
  }

  &__count {
    background: var(--sicam-line-soft); color: var(--sicam-muted);
    font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 99px;
    margin-left: auto;
  }

  &__list { display: flex; flex-direction: column; max-height: 520px; overflow-y: auto; }

  &__empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px; padding: 40px 20px; color: var(--sicam-muted); font-size: 13px;
    p { margin: 0; }
  }
}

.historico__item {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-bottom: 1px solid var(--sicam-line-soft);
  cursor: pointer; transition: background 0.15s;

  &:last-child { border-bottom: 0; }
  &:hover { background: var(--sicam-surface-alt); }
}

.historico__icon {
  width: 34px; height: 34px; border-radius: 9px;
  display: grid; place-items: center; flex-shrink: 0;

  &--valida         { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--a-expirar      { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--expirada       { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--nao-encontrada { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
}

.historico__body { flex: 1; min-width: 0; }

.historico__placa {
  display: block; font-size: 13px; font-weight: 700;
  color: var(--sicam-ink); letter-spacing: 0.02em; margin-bottom: 1px;
}

.historico__desc {
  display: block; font-size: 11px; color: var(--sicam-muted);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.historico__right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
  flex-shrink: 0;
}

.historico__hora { font-size: 10px; color: var(--sicam-muted); }

.historico__remove {
  display: grid; place-items: center;
  width: 22px; height: 22px; border: 0; border-radius: 6px;
  background: transparent; color: var(--sicam-muted); cursor: pointer;
  transition: all 0.15s;

  &:hover { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}

/* ============================================================ */
/* Denúncia                                                     */
/* ============================================================ */
.denuncia-card {
  border-radius: 14px;

  &__title { font-size: 16px; font-weight: 700; color: var(--sicam-ink); }
  &__sub { font-size: 13px; color: var(--sicam-muted); margin: 6px 0 0; }
  &__textarea {
    width: 100%; border: 1px solid var(--sicam-line); border-radius: 10px;
    padding: 10px 12px; font-size: 14px; font-family: inherit;
    resize: vertical;
    &:focus { outline: 0; border-color: var(--sicam-primary-light); }
  }
}
</style>