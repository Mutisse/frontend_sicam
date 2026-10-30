<template>
  <div class="agente-fluxo">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="agente-skeleton">
      <div class="sk-stats" />
      <div class="sk-btn" />
      <div class="sk-block" />
      <div class="sk-block" />
    </div>

    <template v-else>
      <!-- ============================================================ -->
      <!-- FASE 1 — DASHBOARD                                            -->
      <!-- ============================================================ -->
      <div v-if="store.fase === 'consulta'" class="agente-consulta">
        <div class="agente-stats">
          <div class="agente-stat">
            <q-icon
              name="local_police"
              size="18px"
              class="agente-stat__icon agente-stat__icon--critical"
            />
            <div>
              <div class="agente-stat__value">{{ store.hotlist.length }}</div>
              <div class="agente-stat__label">Hotlist</div>
            </div>
          </div>
          <div class="agente-stat__divider" />
          <div class="agente-stat">
            <q-icon name="search" size="18px" class="agente-stat__icon" />
            <div>
              <div class="agente-stat__value">{{ store.consultasHoje }}</div>
              <div class="agente-stat__label">Hoje</div>
            </div>
          </div>
          <div class="agente-stat__divider" />
          <div class="agente-stat">
            <q-icon
              name="receipt_long"
              size="18px"
              class="agente-stat__icon agente-stat__icon--regular"
            />
            <div>
              <div class="agente-stat__value">{{ store.autosHoje }}</div>
              <div class="agente-stat__label">Autos</div>
            </div>
          </div>
        </div>

        <div class="agente-acoes">
          <button
            class="agente-btn agente-btn--ler"
            @click="store.irParaCamera()"
          >
            <q-icon name="photo_camera" size="20px" class="agente-btn__icon" />
            <span class="agente-btn__text">Ler matrícula</span>
          </button>
        </div>

        <section class="agente-section">
          <header class="agente-section__head">
            <h2 class="agente-section__title">Consultas recentes</h2>
            <button class="agente-section__link" @click="irHistorico">
              Ver todas
            </button>
          </header>

          <ul v-if="store.recentes.length" class="agente-list">
            <li
              v-for="v in store.recentes"
              :key="v.matricula"
              class="agente-list__item"
              @click="store.ver(v.matricula)"
            >
              <div
                class="agente-list__avatar"
                :class="`agente-list__avatar--${store.badgeVariant(v.score)}`"
              >
                {{ v.matricula.slice(0, 2) }}
              </div>
              <div class="agente-list__body">
                <div class="agente-list__top">
                  <b>{{ v.matricula }}</b>
                  <span
                    class="agente-list__score"
                    :class="`agente-list__score--${store.badgeVariant(v.score)}`"
                  >
                    {{ v.score }}
                  </span>
                </div>
                <div class="agente-list__meta">
                  {{ v.posto }} · {{ v.ultima }}
                </div>
              </div>
              <q-icon
                name="chevron_right"
                size="20px"
                class="agente-list__chevron"
              />
            </li>
          </ul>

          <p v-else class="agente-empty-msg">
            Sem consultas hoje. Clique em "Ler matrícula" para começar.
          </p>
        </section>

        <section class="agente-hotlist">
          <header class="agente-hotlist__head">
            <q-icon name="local_police" size="20px" />
            <h2 class="agente-hotlist__title">Hotlist activa</h2>
            <span class="agente-hotlist__badge">{{ store.hotlist.length }}</span>
          </header>
          <p class="agente-hotlist__sub">
            Veículos procurados — toque para consultar
          </p>

          <ul v-if="store.hotlist.length" class="agente-hotlist__list">
            <li
              v-for="h in store.hotlist"
              :key="h.matricula"
              class="agente-hotlist__item"
              @click="store.ver(h.matricula)"
            >
              <div class="agente-hotlist__body">
                <b>{{ h.matricula }}</b>
                <span>{{ h.motivo }} · {{ h.origem }}</span>
              </div>
              <span
                class="agente-hotlist__nivel"
                :class="`agente-hotlist__nivel--${store.nivelClasse(h.nivel)}`"
              >
                {{ h.nivel }}
              </span>
            </li>
          </ul>

          <p v-else class="agente-empty-msg">
            Nenhum veículo em hotlist do seu posto.
          </p>
        </section>

        <button class="agente-chat-bar" @click="abrirChat">
          <q-icon
            name="chat_bubble_outline"
            size="20px"
            class="agente-chat-bar__icon"
          />
          <span class="agente-chat-bar__text">Perguntar ao assistente…</span>
        </button>
      </div>

      <!-- ============================================================ -->
      <!-- FASE 2 — CÂMARA                                               -->
      <!-- ============================================================ -->
      <div v-else-if="store.fase === 'camera'" class="agente-camera">
        <header class="agente-camera__head">
          <button
            class="agente-camera__back"
            :disabled="store.aCarregar"
            @click="store.irParaConsulta()"
          >
            <q-icon name="arrow_back" size="22px" />
          </button>
          <div>
            <h1 class="agente-camera__title">Fotografar matrícula</h1>
            <p class="agente-camera__sub">
              Enquadre a matrícula. A leitura é automática.
            </p>
          </div>
        </header>

        <div class="agente-camera__preview">
          <div v-if="store.aCarregar" class="agente-camera__loading">
            <q-spinner color="white" size="48px" />
            <p>A ler matrícula…</p>
          </div>

          <div v-else class="agente-camera__frame">
            <div class="agente-camera__corners">
              <span class="agente-camera__corner agente-camera__corner--tl" />
              <span class="agente-camera__corner agente-camera__corner--tr" />
              <span class="agente-camera__corner agente-camera__corner--bl" />
              <span class="agente-camera__corner agente-camera__corner--br" />
            </div>
            <p class="agente-camera__dots">···</p>
          </div>
        </div>

        <div class="agente-camera__actions">
          <button
            class="agente-camera__btn agente-camera__btn--capturar"
            :disabled="store.aCarregar"
            @click="capturar"
          >
            <q-icon name="photo_camera" size="20px" />
            {{ store.aCarregar ? 'A processar…' : 'Capturar' }}
          </button>
          <button
            class="agente-camera__btn agente-camera__btn--manual"
            :disabled="store.aCarregar"
            @click="escreverManualmente"
          >
            <q-icon name="keyboard" size="20px" />
            Escrever manualmente
          </button>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- FASE 3 — RESULTADO                                            -->
      <!-- ============================================================ -->
      <div v-else-if="store.fase === 'resultado'" class="agente-resultado">
        <!-- Sem dados: SÓ quando o score é null (veículo não encontrado) -->
        <template v-if="store.veiculo.score === null">
          <div class="agente-card">
            <h3>
              {{ store.veiculo.matricula }}
              <AppBadge variant="sem-dados" label="Sem dados" />
            </h3>
            <p class="agente-sub">
              Veículo não consta na base de dados. Registe uma ocorrência se
              aplicável.
            </p>
          </div>
          <button
            class="agente-btn agente-btn--outline"
            @click="store.irParaConsulta()"
          >
            Nova consulta
          </button>
        </template>

        <!-- Com dados (score >= 0) -->
        <template v-else>
          <div class="agente-card agente-card--center">
            <div class="agente-placa">{{ store.veiculo.matricula }}</div>
            <small class="agente-sub">
              {{ store.veiculo.tipo }} ·
              {{
                store.online
                  ? 'consulta completa'
                  : 'consulta parcial (offline)'
              }}
            </small>

            <div class="agente-big" :style="{ color: store.corScore }">
              {{ store.veiculo.score }}
            </div>

            <AppScoreBar
              :value="store.veiculo.score!"
              :variant="store.variante"
            />

            <p class="agente-resultado__estado">
              <AppBadge :variant="store.variante" :label="store.estado.label" />
              <b class="q-ml-sm">{{ store.intervencao }}</b>
            </p>
          </div>

          <div class="agente-card">
            <div
              v-for="ent in store.entidades"
              :key="ent.nome"
              class="agente-row"
            >
              <div>
                <b>{{ ent.nome }}</b>
                <small>{{ ent.descricao }}</small>
              </div>
              <AppBadge
                :variant="ent.ok ? 'regular' : 'critico'"
                :label="ent.ok ? ent.okTexto : ent.erroTexto"
              />
            </div>
          </div>

          <p class="agente-sub">
            Dados do proprietário: apenas Chefe de Posto. Consulta registada em
            auditoria.
          </p>

          <!-- ⬇️ NOVO — Ver detalhes completos do veículo -->
          <button
            class="agente-btn agente-btn--detalhes"
            @click="verDetalhes"
          >
            <q-icon name="visibility" size="20px" class="agente-btn__icon" />
            <span class="agente-btn__text">Ver detalhes do veículo</span>
          </button>

          <button class="agente-btn agente-btn--multa" @click="aplicarMulta">
            <q-icon name="gavel" size="20px" class="agente-btn__icon" />
            <span class="agente-btn__text">Aplicar multa</span>
          </button>

          <button class="agente-btn" @click="irAutos">
            Gerar Auto de Notícia
          </button>

          <button
            class="agente-btn agente-btn--outline"
            @click="store.irParaConsulta()"
          >
            Nova consulta
          </button>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAgenteFluxoStore } from '@/stores/agente/agente-fluxo.store'
import AppBadge from '@/modules/common/AppBadge.vue'
import AppScoreBar from '@/modules/common/AppScoreBar.vue'

const router = useRouter()
const $q = useQuasar()
const store = useAgenteFluxoStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Navegação
// ============================================================
function irHistorico() {
  router.push('/agente/historico')
}
function irAutos() {
  router.push('/agente/autos')
}
function abrirChat() {
  router.push('/agente/chat')
}
function verAuto(codigo: string) {
  router.push(`/agente/auto/${codigo}`)
}

// ⬇️ NOVO — Ver detalhes do veículo
function verDetalhes() {
  const matricula = store.veiculo.matricula

  if (!matricula) {
    $q.notify({
      type: 'warning',
      message: 'Matrícula indisponível.',
      position: 'top',
    })
    return
  }

  // guarda a matrícula atual para o detalhe poder reler se necessário
  sessionStorage.setItem('sicam.matricula-atual', matricula)

  // ⚠️ Ajusta aqui o path/nome conforme as tuas rotas reais
  router.push(`/agente/veiculo/${matricula}`)
}

function aplicarMulta() {
  const mat = sessionStorage.getItem('sicam.matricula-atual')
  if (mat) {
    router.push({ path: '/agente/multa/nova', query: { matricula: mat } })
  } else {
    router.push('/agente/multa/nova')
  }
}

// ============================================================
// Capturar matrícula
// ============================================================
async function capturar() {
  $q.notify({
    type: 'info',
    message: 'A abrir câmara…',
    position: 'top',
  })

  const matricula = await store.capturar()

  if (!matricula) {
    $q.notify({
      type: 'warning',
      message:
        'Não foi possível ler a matrícula. Tente novamente ou escreva manualmente.',
      position: 'top',
    })
    return
  }

  $q.notify({
    type: 'positive',
    message: `Matrícula lida: ${matricula}`,
    position: 'top',
  })
}

// ============================================================
// Escrita manual
// ============================================================
function escreverManualmente() {
  $q.dialog({
    title: 'Escrever matrícula',
    message: 'Introduza a matrícula do veículo',
    prompt: {
      model: '',
      type: 'text',
      placeholder: 'Ex.: AGL-482-MC',
    },
    cancel: true,
    persistent: true,
  }).onOk((val: string) => {
    store.escreverManualmente(val)
  })
}
</script>

<style scoped lang="scss">
.agente-fluxo {
  padding: 0;
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

.agente-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.sk-stats {
  @extend %sk-block;
  height: 80px;
  border-radius: 14px;
}
.sk-btn {
  @extend %sk-block;
  height: 54px;
  border-radius: 12px;
}
.sk-block {
  @extend %sk-block;
  height: 140px;
  border-radius: 14px;
}

.agente-empty-msg {
  text-align: center;
  font-size: 13px;
  color: var(--sicam-muted);
  padding: 20px;
  margin: 0;
}

/* ============================================================ */
/* FASE 1 — DASHBOARD                                           */
/* ============================================================ */
.agente-consulta {
  padding: 0;
}

.agente-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--sicam-line-soft);
}

.agente-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;

  &__icon {
    color: var(--sicam-primary-light);
    &--critical {
      color: var(--sicam-critical);
    }
    &--regular {
      color: var(--sicam-success);
    }
  }
  &__value {
    font-size: 20px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
  }
  &__label {
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 2px;
  }
  &__divider {
    width: 1px;
    height: 32px;
    background: var(--sicam-line-soft);
    margin: 0 8px;
  }
}

.agente-acoes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.agente-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 14px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  font-family: inherit;
  margin-bottom: 10px;
  transition: background 0.15s;
  background: var(--sicam-primary-light);
  color: #fff;

  &__icon {
    flex-shrink: 0;
  }
  &__text {
    line-height: 1;
  }

  &:active {
    background: var(--sicam-primary);
  }

  &--ler {
    background: var(--sicam-primary-light);
    color: #fff;
    &:active {
      background: var(--sicam-primary);
    }
  }
  &--multa {
    background: var(--sicam-critical);
    color: #fff;
    &:active {
      background: #a00;
    }
  }
  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
  }
  /* ⬇️ NOVO — botão "Ver detalhes" */
  &--detalhes {
    background: var(--sicam-primary);
    color: #fff;
    &:active {
      background: var(--sicam-primary-light);
    }
  }
}

.agente-section {
  margin-bottom: 18px;
  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 10px;
    padding: 0 4px;
  }
  &__title {
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }
  &__link {
    background: none;
    border: 0;
    color: var(--sicam-primary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    &:active {
      opacity: 0.7;
    }
  }
}

.agente-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    cursor: pointer;
    border-bottom: 1px solid var(--sicam-line-soft);
    transition: background 0.15s;
    &:last-child {
      border-bottom: 0;
    }
    &:active {
      background: var(--sicam-surface-hover);
    }
  }
  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.05em;
    flex-shrink: 0;

    &--critico {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
    &--atencao {
      background: var(--sicam-warning-bg);
      color: var(--sicam-warning-ink);
    }
    &--regular {
      background: var(--sicam-success-bg);
      color: var(--sicam-success-ink);
    }
    &--sem-dados {
      background: var(--sicam-neutral-bg);
      color: var(--sicam-neutral-ink);
    }
  }
  &__body {
    flex: 1;
    min-width: 0;
  }
  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    b {
      font-size: 14px;
      font-weight: 700;
      color: var(--sicam-ink);
      letter-spacing: 0.02em;
    }
  }
  &__score {
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 99px;

    &--critico {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
    &--atencao {
      background: var(--sicam-warning-bg);
      color: var(--sicam-warning-ink);
    }
    &--regular {
      background: var(--sicam-success-bg);
      color: var(--sicam-success-ink);
    }
    &--sem-dados {
      background: var(--sicam-neutral-bg);
      color: var(--sicam-neutral-ink);
    }
  }
  &__meta {
    font-size: 12px;
    color: var(--sicam-muted);
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__chevron {
    color: var(--sicam-line-strong);
    flex-shrink: 0;
  }
}

.agente-hotlist {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 18px;

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    .q-icon {
      color: var(--sicam-critical);
    }
  }
  &__title {
    flex: 1;
    font-size: 14px;
    font-weight: 700;
    color: var(--sicam-critical);
    margin: 0;
    letter-spacing: 0.02em;
  }
  &__badge {
    background: var(--sicam-critical);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 99px;
    min-width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
  }
  &__sub {
    font-size: 12px;
    color: var(--sicam-muted);
    margin: 0 0 10px;
    padding-left: 28px;
  }
  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 11px 0;
    border-top: 1px solid var(--sicam-line-soft);
    cursor: pointer;
    &:active {
      opacity: 0.7;
    }
  }
  &__body {
    min-width: 0;
    b {
      display: block;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--sicam-ink);
    }
    span {
      display: block;
      font-size: 11px;
      color: var(--sicam-muted);
      margin-top: 1px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &__nivel {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 99px;
    flex-shrink: 0;
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
}

.agente-chat-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 99px;
  padding: 12px 16px;
  margin-top: 18px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 14px;
  color: var(--sicam-muted);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: border-color 0.15s, background 0.15s;

  &:active {
    background: var(--sicam-surface-hover);
    border-color: var(--sicam-primary-light);
  }
  &__icon {
    color: var(--sicam-primary-light);
    flex-shrink: 0;
  }
  &__text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* ============================================================ */
/* FASE 2 — CÂMARA                                              */
/* ============================================================ */
.agente-camera {
  padding: 0 0 24px;
  background: var(--sicam-bg, #f4f8f6);
  min-height: 100dvh;
}

.agente-camera__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 12px;
  background: #fff;
  border-bottom: 1px solid var(--sicam-line-soft);
}

.agente-camera__back {
  background: none;
  border: 0;
  color: var(--sicam-ink);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  &:active {
    background: var(--sicam-surface-hover);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.agente-camera__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--sicam-ink);
  margin: 0;
  line-height: 1.2;
}

.agente-camera__sub {
  font-size: 12px;
  color: var(--sicam-muted);
  margin: 1px 0 0;
}

.agente-camera__preview {
  background: #0f172a;
  margin: 16px;
  border-radius: 16px;
  padding: 40px 20px;
  display: grid;
  place-items: center;
  min-height: 260px;
}

.agente-camera__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;

  p {
    margin: 0;
    font-weight: 600;
  }
}

.agente-camera__frame {
  width: 100%;
  max-width: 320px;
  aspect-ratio: 2 / 0.9;
  border: 2px dashed rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  position: relative;
  display: grid;
  place-items: center;
}

.agente-camera__corners {
  position: absolute;
  inset: -2px;
  pointer-events: none;
}

.agente-camera__corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border: 3px solid var(--sicam-primary-light);
  &--tl {
    top: 0;
    left: 0;
    border-right: 0;
    border-bottom: 0;
    border-top-left-radius: 8px;
  }
  &--tr {
    top: 0;
    right: 0;
    border-left: 0;
    border-bottom: 0;
    border-top-right-radius: 8px;
  }
  &--bl {
    bottom: 0;
    left: 0;
    border-right: 0;
    border-top: 0;
    border-bottom-left-radius: 8px;
  }
  &--br {
    bottom: 0;
    right: 0;
    border-left: 0;
    border-top: 0;
    border-bottom-right-radius: 8px;
  }
}

.agente-camera__dots {
  color: rgba(255, 255, 255, 0.6);
  font-size: 32px;
  letter-spacing: 8px;
  margin: 0;
}

.agente-camera__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 16px;
}

.agente-camera__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--capturar {
    background: var(--sicam-primary-light);
    color: #fff;
    &:active:not(:disabled) {
      background: var(--sicam-primary);
    }
  }
  &--manual {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
  }
}

/* ============================================================ */
/* FASE 3 — RESULTADO                                           */
/* ============================================================ */
.agente-resultado {
  padding: 0;
}

.agente-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 14px;
  margin-bottom: 12px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &--center {
    text-align: center;
  }
}

.agente-placa {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sicam-ink);
}
.agente-sub {
  color: var(--sicam-muted);
  font-size: 13px;
  margin: 4px 0 0;
  display: block;
}
.agente-big {
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  margin: 14px 0 6px;
}
.agente-resultado__estado {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agente-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--sicam-line-soft);

  &:last-child {
    border-bottom: 0;
  }
  small {
    display: block;
    color: var(--sicam-muted);
    font-size: 12px;
    font-weight: 400;
  }
  b {
    color: var(--sicam-ink);
    font-size: 14px;
  }
}
</style>