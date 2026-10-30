<template>
  <div class="multas-page">
    <!-- SKELETON -->
    <div v-if="!store.carregado" class="multas-skeleton">
      <div class="sk-head">
        <div class="sk-line sk-line--title" />
        <div class="sk-line sk-line--text" />
      </div>
      <div class="sk-card" />
      <div class="sk-filters" />
      <div class="sk-list">
        <div v-for="i in 3" :key="`sk-${i}`" class="sk-item" />
      </div>
    </div>

    <template v-else>
      <!-- Topo -->
      <div class="multas-page__topo">
        <router-link to="/cidadao/carta" class="portal-back">
          <q-icon name="badge" size="18px" />
          Ver dados da carta
        </router-link>

        <router-link to="/cidadao/portal" class="portal-back">
          <q-icon name="arrow_back" size="18px" />
          Nova consulta
        </router-link>
      </div>

      <!-- Cabeçalho -->
      <header class="portal-page-head">
        <h1 class="portal-page-head__title">Minhas multas</h1>
        <p class="portal-page-head__sub">
          <b>{{ store.multas.length }}</b>
          {{ store.multas.length === 1 ? 'multa encontrada' : 'multas encontradas' }}
          para a carta
          <b>{{ store.numeroCarta }}</b>
        </p>
      </header>

      <!-- Cartão do cidadão -->
      <section class="cidadao-card">
        <svg class="cidadao-card__deco" viewBox="0 0 300 300" aria-hidden="true">
          <circle cx="230" cy="150" r="50" />
          <circle cx="230" cy="150" r="95" />
          <circle cx="230" cy="150" r="140" />
        </svg>

        <div class="cidadao-card__avatar">{{ store.iniciais }}</div>

        <div class="cidadao-card__info">
          <div class="cidadao-card__nome">{{ store.cidadao?.nome }}</div>
          <div class="cidadao-card__tags">
            <span class="cidadao-card__tag">
              <q-icon name="badge" size="14px" />
              Carta {{ store.cidadao?.numero }}
            </span>
            <span class="cidadao-card__tag">
              <q-icon name="drive_eta" size="14px" />
              Categoria {{ store.cidadao?.categoria }}
            </span>
          </div>
        </div>

        <div class="cidadao-card__stats">
          <div class="cidadao-card__stat">
            <div class="cidadao-card__stat-value cidadao-card__stat-value--warn">
              {{ store.totais.pendentes }}
            </div>
            <div class="cidadao-card__stat-label">Pendentes</div>
          </div>
          <div class="cidadao-card__stat">
            <div class="cidadao-card__stat-value cidadao-card__stat-value--success">
              {{ store.totais.pagas }}
            </div>
            <div class="cidadao-card__stat-label">Pagas</div>
          </div>
        </div>
      </section>

      <!-- Filtros -->
      <section class="portal-filters">
        <label class="portal-search">
          <q-icon name="search" size="20px" class="portal-search__icon" />
          <input
            v-model="store.pesquisa"
            type="text"
            class="portal-search__input"
            placeholder="Pesquisar por código ou matrícula"
          />
          <button
            v-if="store.pesquisa"
            type="button"
            class="portal-search__clear"
            @click="store.pesquisa = ''"
          >
            <q-icon name="close" size="16px" />
          </button>
        </label>

        <div class="portal-chips" role="group">
          <button
            v-for="f in store.filtrosEstado"
            :key="f.valor"
            type="button"
            class="portal-chip"
            :class="{ 'portal-chip--active': store.filtroEstado === f.valor }"
            @click="store.filtroEstado = f.valor"
          >
            {{ f.label }}
            <span class="portal-chip__n">{{ f.n }}</span>
          </button>
        </div>
      </section>

      <!-- Lista -->
      <section class="multas-list">
        <article
          v-for="m in store.filtrados"
          :key="m.codigo"
          class="multa-card"
          :class="`multa-card--${store.estadoClasse(m.estado)}`"
          role="button"
          tabindex="0"
          @click="store.abrirDetalhes(m)"
          @keydown.enter.prevent="store.abrirDetalhes(m)"
        >
          <div
            class="multa-card__icon"
            :class="`multa-card__icon--${store.estadoClasse(m.estado)}`"
          >
            <q-icon :name="store.iconeEstado(m.estado)" size="22px" />
          </div>

          <div class="multa-card__body">
            <div class="multa-card__top">
              <span class="multa-card__codigo">{{ m.codigo }}</span>
              <span class="badge" :class="`badge--${store.estadoClasse(m.estado)}`">
                {{ m.estado }}
              </span>
            </div>

            <div class="multa-card__infracao">{{ m.infracao }}</div>

            <div class="multa-card__bottom">
              <span class="multa-card__meta">
                <q-icon name="directions_car" size="15px" />
                {{ m.matricula }}
              </span>
              <span class="multa-card__meta">
                <q-icon name="event" size="15px" />
                {{ m.data }}
              </span>
            </div>
          </div>

          <div class="multa-card__side">
            <span class="multa-card__valor">{{ m.valor }}</span>
            <q-icon name="chevron_right" size="20px" class="multa-card__chevron" />
          </div>
        </article>

        <div v-if="!store.filtrados.length" class="multas-empty">
          <div class="multas-empty__icon">
            <q-icon
              :name="store.multas.length ? 'search_off' : 'check_circle'"
              size="32px"
            />
          </div>
          <template v-if="store.multas.length">
            <b>Nenhuma multa corresponde aos filtros</b>
            <p>Tente outro código, matrícula ou estado.</p>
            <button
              type="button"
              class="multas-empty__btn"
              @click="store.limparFiltros()"
            >
              Limpar filtros
            </button>
          </template>
          <template v-else>
            <b>Sem multas registadas</b>
            <p>Não existem multas associadas a esta carta.</p>
          </template>
        </div>
      </section>
    </template>

    <!-- MODAL DE DETALHES -->
    <q-dialog v-model="store.modalDetalhes" persistent>
      <q-card v-if="store.multaSelecionada" class="modal-card">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div
              class="modal-head__icon"
              :class="`modal-head__icon--${store.estadoClasse(store.multaSelecionada.estado)}`"
            >
              <q-icon name="receipt_long" size="24px" />
            </div>
            <div>
              <div class="modal-head__title">{{ store.multaSelecionada.codigo }}</div>
              <div class="modal-head__sub">Detalhes da multa</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="modal-resumo">
          <div class="modal-resumo__valor">
            <span>Valor da multa</span>
            <b>{{ store.multaSelecionada.valor }}</b>
          </div>
          <span
            class="badge badge--lg"
            :class="`badge--${store.estadoClasse(store.multaSelecionada.estado)}`"
          >
            {{ store.multaSelecionada.estado }}
          </span>
        </q-card-section>

        <q-card-section class="modal-grid">
          <div class="modal-field">
            <div class="modal-field__label">Matrícula</div>
            <div class="modal-field__value">{{ store.multaSelecionada.matricula }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Data</div>
            <div class="modal-field__value">{{ store.multaSelecionada.data }}</div>
          </div>
          <div class="modal-field modal-field--full">
            <div class="modal-field__label">Infracção</div>
            <div class="modal-field__value">{{ store.multaSelecionada.infracao }}</div>
          </div>
          <div class="modal-field">
            <div class="modal-field__label">Agente</div>
            <div class="modal-field__value">{{ store.multaSelecionada.agente }}</div>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn flat no-caps label="Fechar" v-close-popup />
          <q-btn
            v-if="store.multaSelecionada.estado === 'Pendente'"
            unelevated
            no-caps
            label="Pagar agora"
            icon="payments"
            color="primary"
            @click="store.abrirPagamento(store.cidadao?.nome ?? '')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL DE PAGAMENTO -->
    <q-dialog v-model="store.modalPagamento" persistent>
      <q-card v-if="store.multaSelecionada" class="modal-card modal-card--wide">
        <q-card-section class="modal-head">
          <div class="modal-head__left">
            <div class="modal-head__icon modal-head__icon--primary">
              <q-icon name="payments" size="24px" />
            </div>
            <div>
              <div class="modal-head__title">Pagar multa</div>
              <div class="modal-head__sub">
                {{ store.multaSelecionada.codigo }}
              </div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="store.fecharPagamento()" />
        </q-card-section>

        <q-stepper v-model="store.step" vertical color="primary" animated>
          <q-step :name="1" title="Método" icon="credit_card">
            <div class="metodos">
              <button
                v-for="met in store.metodos"
                :key="met.key"
                type="button"
                class="metodo"
                :class="{ 'metodo--active': store.metodoSelecionado === met.key }"
                @click="store.metodoSelecionado = met.key"
              >
                <q-icon :name="met.icon" size="22px" />
                <span>{{ met.label }}</span>
              </button>
            </div>

            <q-stepper-navigation>
              <q-btn unelevated color="primary" label="Continuar" @click="store.step = 2" />
            </q-stepper-navigation>
          </q-step>

          <q-step :name="2" title="Dados" icon="person">
            <div v-if="store.metodoSelecionado !== 'multibanco'" class="step-section">
              <label class="pagamento-label">
                {{ store.metodoSelecionado === 'mpesa' ? 'Nº M-Pesa' : 'IBAN' }}
              </label>
              <input v-model="store.referencia" class="pagamento-input" />
            </div>

            <div class="step-section">
              <label class="pagamento-label">Nome do pagador</label>
              <input v-model="store.nomePagador" class="pagamento-input" />
            </div>

            <q-stepper-navigation>
              <q-btn
                unelevated
                color="primary"
                label="Confirmar"
                :disable="!store.podeAvancarStep2"
                @click="confirmarPagamento"
              />
              <q-btn flat label="Voltar" @click="store.step = 1" />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePortalMultasStore } from '@/stores/portal/multas.store'

const router = useRouter()
const $q = useQuasar()
const store = usePortalMultasStore()

onMounted(() => {
  if (!store.carregado) {
    const ok = store.carregarDaSessao()
    if (!ok) {
      router.push('/cidadao/portal')
    }
  }
})

function confirmarPagamento() {
  const multa = store.multaSelecionada
  if (!multa || store.aProcessar) return

  store.aProcessar = true

  setTimeout(() => {
    store.marcarComoPaga(multa.codigo)

    store.aProcessar = false
    store.modalPagamento = false

    $q.notify({
      type: 'positive',
      message: `Multa ${multa.codigo} paga com sucesso.`,
      position: 'top',
    })
  }, 1000)
}
</script>

<style scoped lang="scss">
.multas-page {
  --m-ink: #0f172a;
  --m-muted: #64748b;
  --m-line: #e5ebe8;
  --m-primary: #065f46;
  --m-primary-bg: #ecfdf5;
  --m-ok: #059669;
  --m-ok-bg: #ecfdf5;
  --m-ok-ink: #065f46;
  --m-warn: #f59e0b;
  --m-warn-bg: #fffbeb;
  --m-warn-ink: #92400e;
  --m-bad: #dc2626;
  --m-bad-bg: #fef2f2;
  --m-bad-ink: #991b1b;

  max-width: 900px;
  margin: 0 auto;
}

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

.multas-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 0;
}

.sk-head {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .sk-line {
    @extend %sk-block;

    &--title {
      height: 28px;
      width: 300px;
      max-width: 60%;
    }
    &--text {
      height: 16px;
      width: 420px;
      max-width: 80%;
    }
  }
}

.sk-card {
  @extend %sk-block;
  height: 120px;
  border-radius: 20px;
}

.sk-filters {
  @extend %sk-block;
  height: 48px;
  border-radius: 14px;
}

.sk-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-item {
  @extend %sk-block;
  height: 96px;
  border-radius: 16px;
}

/* ============================================================ */
/* Topo                                                         */
/* ============================================================ */
.multas-page__topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.portal-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid var(--m-line);
  border-radius: 99px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 14px 8px 10px;
  text-decoration: none;

  &:hover {
    background: #ecfdf5;
    border-color: #a7e3c8;
    color: #065f46;
  }
}

/* ============================================================ */
/* Cabeçalho                                                    */
/* ============================================================ */
.portal-page-head {
  margin-bottom: 22px;

  &__title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--m-ink);
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 14px;
    color: var(--m-muted);
    margin: 0;

    b {
      color: var(--m-ink);
    }
  }
}

/* ============================================================ */
/* Cartão cidadão                                               */
/* ============================================================ */
.cidadao-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(150deg, #065f46 0%, #064e3b 60%, #04261d 100%);
  color: #fff;
  border-radius: 20px;
  padding: 22px 26px;
  margin-bottom: 20px;
  box-shadow: 0 12px 30px rgba(6, 78, 59, 0.2);

  @media (max-width: 600px) {
    padding: 18px;
  }

  &__deco {
    position: absolute;
    right: -40px;
    top: 50%;
    width: 300px;
    height: 300px;
    transform: translateY(-50%);
    pointer-events: none;

    circle {
      fill: none;
      stroke: rgba(255, 255, 255, 0.07);
      stroke-width: 1.5;
    }
  }

  &__avatar {
    position: relative;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    background: #facc15;
    color: #3b2f00;
    font-size: 19px;
    font-weight: 800;
  }

  &__info {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  &__nome {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.12);
    color: #d5f0e4;
  }

  &__stats {
    position: relative;
    display: flex;
    gap: 12px;

    @media (max-width: 600px) {
      display: none;
    }
  }

  &__stat {
    min-width: 84px;
    text-align: center;
    padding: 10px 14px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.1);
  }

  &__stat-value {
    font-size: 24px;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;

    &--warn {
      color: #fde047;
    }
    &--success {
      color: #86efac;
    }
  }

  &__stat-label {
    font-size: 12px;
    color: #a9d9c5;
    margin-top: 4px;
    font-weight: 600;
  }
}

/* ============================================================ */
/* Filtros                                                      */
/* ============================================================ */
.portal-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.portal-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--m-line);
  border-radius: 14px;
  padding: 0 12px 0 14px;
  height: 48px;

  &:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  }

  &__icon {
    color: var(--m-muted);
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    background: transparent;
    font-size: 14px;
    font-family: inherit;
    color: var(--m-ink);

    &:focus {
      outline: 0;
    }
    &::placeholder {
      color: #94a3b8;
    }
  }

  &__clear {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: #eef2f0;
    color: #475569;
    cursor: pointer;
    flex-shrink: 0;
  }
}

.portal-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.portal-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border: 1px solid var(--m-line);
  background: #fff;
  color: #334155;
  border-radius: 99px;
  padding: 8px 8px 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: #a7e3c8;
    background: var(--m-primary-bg);
  }

  &__n {
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    display: inline-grid;
    place-items: center;
    border-radius: 99px;
    background: #eef2f0;
    font-size: 12px;
  }

  &--active {
    background: #064e3b;
    border-color: #064e3b;
    color: #fff;

    .portal-chip__n {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

/* ============================================================ */
/* Lista de multas                                              */
/* ============================================================ */
.multas-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.multa-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--m-line);
  border-left: 4px solid transparent;
  border-radius: 16px;
  padding: 16px 18px;
  cursor: pointer;
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: 0 8px 22px rgba(6, 78, 59, 0.09);

    .multa-card__chevron {
      transform: translateX(3px);
      color: var(--m-primary);
    }
  }

  &--regular {
    border-left-color: var(--m-ok);
  }
  &--atencao {
    border-left-color: var(--m-warn);
  }
  &--critico {
    border-left-color: var(--m-bad);
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--regular {
      background: var(--m-ok-bg);
      color: var(--m-ok-ink);
    }
    &--atencao {
      background: var(--m-warn-bg);
      color: var(--m-warn-ink);
    }
    &--critico {
      background: var(--m-bad-bg);
      color: var(--m-bad-ink);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }

  &__codigo {
    font-size: 14px;
    font-weight: 700;
    color: var(--m-ink);
  }

  &__infracao {
    font-size: 14px;
    color: #334155;
    margin-bottom: 8px;
  }

  &__bottom {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__meta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    color: var(--m-muted);
  }

  &__side {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  &__valor {
    font-size: 17px;
    font-weight: 800;
    color: var(--m-primary);
    white-space: nowrap;
  }

  &__chevron {
    color: #b6c4be;
    transition: transform 0.15s, color 0.15s;
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

  &--lg {
    padding: 6px 14px;
    font-size: 13px;
  }

  &--regular {
    background: var(--m-ok-bg);
    color: var(--m-ok-ink);
  }
  &--atencao {
    background: var(--m-warn-bg);
    color: var(--m-warn-ink);
  }
  &--critico {
    background: var(--m-bad-bg);
    color: var(--m-bad-ink);
  }
}

/* ============================================================ */
/* Estado vazio                                                 */
/* ============================================================ */
.multas-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 20px;
  background: #fff;
  border: 1px dashed #cfdad5;
  border-radius: 16px;

  &__icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--m-primary-bg);
    color: var(--m-primary);
    margin-bottom: 14px;
  }

  b {
    font-size: 16px;
    color: var(--m-ink);
    margin-bottom: 4px;
  }
  p {
    margin: 0;
    color: var(--m-muted);
    font-size: 14px;
  }

  &__btn {
    margin-top: 16px;
    border: 0;
    background: #064e3b;
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: 10px;
    cursor: pointer;
  }
}

/* ============================================================ */
/* Modal                                                        */
/* ============================================================ */
.modal-card {
  width: 560px;
  max-width: 94vw;
  border-radius: 20px;
  overflow: hidden;

  &--wide {
    width: 640px;
  }
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--m-line);

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--regular {
      background: var(--m-ok-bg);
      color: var(--m-ok-ink);
    }
    &--atencao {
      background: var(--m-warn-bg);
      color: var(--m-warn-ink);
    }
    &--critico {
      background: var(--m-bad-bg);
      color: var(--m-bad-ink);
    }
    &--primary {
      background: var(--m-primary-bg);
      color: var(--m-primary);
    }
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--m-ink);
  }
  &__sub {
    font-size: 12px;
    color: var(--m-muted);
    margin-top: 2px;
  }
}

.modal-resumo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 20px 0;
  padding: 16px 18px;
  background: var(--m-primary-bg);
  border-radius: 14px;

  &__valor {
    display: flex;
    flex-direction: column;

    span {
      font-size: 12px;
      color: var(--m-muted);
      font-weight: 600;
    }
    b {
      font-size: 26px;
      font-weight: 800;
      color: var(--m-primary);
      line-height: 1.2;
    }
  }
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px 16px;
  padding: 20px;
}

.modal-field {
  &--full {
    grid-column: 1 / -1;
  }

  &__label {
    font-size: 12px;
    color: var(--m-muted);
    font-weight: 600;
    margin-bottom: 4px;
  }

  &__value {
    font-size: 14px;
    font-weight: 600;
    color: var(--m-ink);
  }
}

.modal-actions {
  padding: 12px 20px 20px;
  justify-content: space-between;
  gap: 10px;
}

/* ============================================================ */
/* Stepper                                                      */
/* ============================================================ */
.metodos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.metodo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 10px;
  background: #fff;
  border: 2px solid var(--m-line);
  border-radius: 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;

  &--active {
    border-color: #10b981;
    background: var(--m-primary-bg);
    color: var(--m-primary);
  }
}

.step-section {
  margin-bottom: 16px;
}

.pagamento-label {
  display: block;
  font-size: 13px;
  color: #334155;
  font-weight: 600;
  margin-bottom: 8px;
}

.pagamento-input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #d5dfda;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: 0;
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  }
}
</style>