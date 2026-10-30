<template>
  <div class="portal-inicio">
    <!-- SKELETON -->
    <div v-if="!store.noticiasCarregadas" class="portal-skeleton">
      <div class="sk-hero" />
      <div class="sk-atalhos">
        <div v-for="i in 3" :key="`sk-at-${i}`" class="sk-atalho" />
      </div>
      <div class="sk-news">
        <div v-for="i in 3" :key="`sk-nw-${i}`" class="sk-news-item" />
      </div>
    </div>

    <template v-else>
      <!-- HERO + CONSULTA -->
      <section class="portal-hero">
        <svg class="portal-hero__deco" viewBox="0 0 400 400" aria-hidden="true">
          <circle cx="300" cy="200" r="60" />
          <circle cx="300" cy="200" r="110" />
          <circle cx="300" cy="200" r="160" />
          <circle cx="300" cy="200" r="210" />
        </svg>

        <div class="portal-hero__main">
          <h1 class="portal-hero__title">
            Consulte o estado da sua carta de condução
          </h1>
          <p class="portal-hero__sub">
            Sem criar conta. Basta indicar o número da carta de condução.
          </p>

          <form class="portal-hero__form" @submit.prevent="consultar">
            <label class="portal-hero__label" for="numero-carta">
              Número da carta de condução
            </label>

            <div class="portal-hero__row">
              <div
                class="portal-hero__input-wrap"
                :class="{
                  'portal-hero__input-wrap--valido': store.numeroValido,
                  'portal-hero__input-wrap--erro':
                    store.numeroCarta && !store.numeroValido && !store.focado,
                }"
              >
                <q-icon
                  name="badge"
                  size="22px"
                  class="portal-hero__input-icon"
                />
                <input
                  id="numero-carta"
                  :value="store.numeroCarta"
                  class="portal-hero__input"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="9"
                  placeholder="110100234"
                  @input="onInput"
                  @focus="store.setFocado(true)"
                  @blur="store.setFocado(false)"
                />
                <button
                  v-if="store.numeroCarta"
                  type="button"
                  class="portal-hero__clear"
                  aria-label="Limpar número"
                  @click="store.limpar()"
                >
                  <q-icon name="close" size="16px" />
                </button>
                <span class="portal-hero__counter">
                  {{ store.digitos.length }}/9
                </span>
              </div>

              <button
                class="portal-hero__btn"
                type="submit"
                :disabled="store.aConsultar || !store.numeroValido"
              >
                <q-spinner v-if="store.aConsultar" size="18px" />
                <q-icon v-else name="search" size="20px" />
                {{ store.aConsultar ? 'A consultar…' : 'Consultar' }}
              </button>
            </div>

            <p
              class="portal-hero__hint"
              :class="{
                'portal-hero__hint--visible':
                  store.numeroCarta && !store.numeroValido,
              }"
              role="status"
            >
              <q-icon name="info" size="14px" />
              O número da carta tem 9 dígitos, sem hífen.
            </p>
          </form>

          <p class="portal-hero__nota">
            <q-icon name="lock" size="14px" />
            A sua informação é protegida. A consulta fica registada para
            auditoria.
          </p>
        </div>

        <aside class="portal-hero__aside" aria-label="O que pode consultar">
          <h2>O que vai encontrar</h2>
          <ul>
            <li v-for="i in store.oQueEncontra" :key="i.titulo">
              <span class="portal-hero__aside-icon">
                <q-icon :name="i.icon" size="20px" />
              </span>
              <div>
                <b>{{ i.titulo }}</b>
                <small>{{ i.desc }}</small>
              </div>
            </li>
          </ul>
        </aside>
      </section>

      <!-- ATALHOS -->
      <section class="portal-atalhos" aria-label="Atalhos">
        <router-link
          v-for="a in store.atalhos"
          :key="a.to"
          :to="a.to"
          class="portal-atalho"
        >
          <div class="portal-atalho__icon">
            <q-icon :name="a.icon" size="24px" />
          </div>
          <div class="portal-atalho__body">
            <b>{{ a.titulo }}</b>
            <span>{{ a.desc }}</span>
          </div>
          <q-icon
            name="chevron_right"
            size="20px"
            class="portal-atalho__chevron"
          />
        </router-link>
      </section>

      <!-- NOTÍCIAS -->
      <section class="portal-news">
        <header class="portal-news__head">
          <h2 class="portal-news__title">Últimas notícias</h2>
          <router-link to="/cidadao/noticias" class="portal-news__link">
            Ver todas
            <q-icon name="chevron_right" size="18px" />
          </router-link>
        </header>

        <ul v-if="store.noticias.length" class="portal-news__list">
          <li v-for="n in store.noticias" :key="n.id" class="portal-news__item">
            <div class="portal-news__date" :aria-label="n.data">
              <strong>{{ n.data.split(' ')[0] }}</strong>
              <span>{{ n.data.split(' ')[1] ?? '' }}</span>
            </div>
            <div class="portal-news__content">
              <b>{{ n.titulo }}</b>
              <p>{{ n.resumo }}</p>
            </div>
          </li>
        </ul>

        <div v-else class="portal-news__empty">
          <q-icon name="newspaper" size="32px" />
          <p>Sem notícias para mostrar.</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePortalInicioStore } from '@/stores/portal/inicio.store'

const router = useRouter()
const $q = useQuasar()
const store = usePortalInicioStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregarNoticias()
})

// ============================================================
// Input
// ============================================================
function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const v = store.onInput(el.value)
  store.numeroCarta = v
  el.value = v
}

// ============================================================
// Consultar
// ============================================================
async function consultar() {
  if (store.aConsultar) return

  if (!store.numeroValido) {
    $q.notify({
      type: 'warning',
      message: 'O número da carta tem que ter exactamente 9 dígitos.',
      position: 'top',
    })
    return
  }

  const ok = await store.consultar(store.numeroCarta)

  if (!ok) {
    $q.notify({
      type: 'negative',
      message:
        store.erro ??
        `Nenhuma carta encontrada com o nº ${store.numeroCarta}. Verifique o número.`,
      position: 'top',
    })
    return
  }

  $q.notify({
    type: 'positive',
    message: 'Carta encontrada. A carregar dados…',
    position: 'top',
    timeout: 1500,
  })

  router.push('/cidadao/carta')
}
</script>

<style scoped lang="scss">
.portal-inicio {
  max-width: 1180px;
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

.portal-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 0;
}

.sk-hero {
  @extend %sk-block;
  height: 340px;
  border-radius: 24px;
}

.sk-atalhos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.sk-atalho {
  @extend %sk-block;
  height: 82px;
  border-radius: 16px;
}

.sk-news {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sk-news-item {
  @extend %sk-block;
  height: 60px;
  border-radius: 12px;
}

/* ============================================================ */
/* HERO                                                         */
/* ============================================================ */
.portal-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 32px;
  align-items: center;
  background: linear-gradient(150deg, #065f46 0%, #064e3b 55%, #04261d 100%);
  color: #fff;
  border-radius: 24px;
  padding: 44px 40px;
  margin-bottom: 24px;
  box-shadow: 0 16px 40px rgba(6, 78, 59, 0.22);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 32px 22px;
    gap: 28px;
  }

  &__deco {
    position: absolute;
    right: -60px;
    top: 50%;
    width: 420px;
    height: 420px;
    transform: translateY(-50%);
    pointer-events: none;

    circle {
      fill: none;
      stroke: rgba(255, 255, 255, 0.07);
      stroke-width: 1.5;
    }

    @media (max-width: 900px) {
      display: none;
    }
  }

  &__main,
  &__aside {
    position: relative;
    z-index: 1;
  }

  &__title {
    color: #fff;
    font-size: 34px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin: 0 0 10px;
    max-width: 18ch;

    @media (max-width: 600px) {
      font-size: 26px;
    }
  }

  &__sub {
    font-size: 15px;
    line-height: 1.5;
    color: #bfe6d6;
    margin: 0 0 26px;
    max-width: 46ch;
  }

  &__form {
    margin: 0 0 14px;
  }

  &__label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #d5f0e4;
    margin-bottom: 8px;
  }

  &__row {
    display: flex;
    gap: 10px;

    @media (max-width: 600px) {
      flex-direction: column;
    }
  }

  &__input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 14px;
    padding: 0 12px 0 16px;
    border: 2px solid transparent;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:focus-within {
      box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.35);
    }
    &--valido {
      border-color: #34d399;
    }
    &--erro {
      border-color: #f59e0b;
    }
  }

  &__input-icon {
    color: #065f46;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    min-width: 0;
    border: 0;
    background: transparent;
    padding: 16px 10px;
    font-size: 17px;
    font-family: inherit;
    color: #0f172a;
    letter-spacing: 0.1em;
    font-weight: 600;
    font-variant-numeric: tabular-nums;

    &::placeholder {
      color: #94a3b8;
      letter-spacing: 0;
      font-weight: 400;
    }
    &:focus {
      outline: 0;
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

    &:hover {
      background: #dde5e1;
    }
  }

  &__counter {
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
    flex-shrink: 0;
    margin-left: 8px;
    font-variant-numeric: tabular-nums;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #facc15;
    color: #3b2f00;
    border: 0;
    border-radius: 14px;
    padding: 0 28px;
    min-height: 54px;
    font-size: 15px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, transform 0.1s;

    &:hover:not(:disabled) {
      background: #fde047;
    }
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__hint {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #fde68a;
    margin: 0;
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition: opacity 0.2s, max-height 0.2s, margin-top 0.2s;

    &--visible {
      opacity: 1;
      max-height: 24px;
      margin-top: 8px;
    }

    .q-icon {
      color: #fcd34d;
    }
  }

  &__nota {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #9fd3bd;
    margin: 0;
  }

  &__aside {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 18px;
    padding: 20px;
    backdrop-filter: blur(6px);

    h2 {
      font-size: 15px;
      font-weight: 700;
      margin: 0 0 14px;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 12px;
    }

    li {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    b {
      display: block;
      font-size: 14px;
      font-weight: 600;
    }
    small {
      display: block;
      font-size: 12px;
      color: #a9d9c5;
      margin-top: 1px;
    }
  }

  &__aside-icon {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: rgba(250, 204, 21, 0.16);
    color: #facc15;
  }
}

/* ============================================================ */
/* ATALHOS                                                      */
/* ============================================================ */
.portal-atalhos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.portal-atalho {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: #fff;
  border: 1px solid #e5ebe8;
  border-radius: 16px;
  text-decoration: none;
  color: #0f172a;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: #a7e3c8;
    box-shadow: 0 8px 22px rgba(6, 78, 59, 0.09);

    .portal-atalho__chevron {
      transform: translateX(3px);
      color: #065f46;
    }
    .portal-atalho__icon {
      background: #065f46;
      color: #fff;
    }
  }

  &__icon {
    width: 46px;
    height: 46px;
    border-radius: 13px;
    background: #ecfdf5;
    color: #065f46;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
  }

  &__body {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    span {
      display: block;
      font-size: 13px;
      color: #64748b;
    }
  }

  &__chevron {
    color: #b6c4be;
    flex-shrink: 0;
    transition: transform 0.15s, color 0.15s;
  }
}

/* ============================================================ */
/* NOTÍCIAS                                                     */
/* ============================================================ */
.portal-news {
  background: #fff;
  border: 1px solid #e5ebe8;
  border-radius: 16px;
  padding: 22px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 13px;
    font-weight: 600;
    color: #065f46;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    gap: 16px;
    padding: 16px 0;
    border-top: 1px solid #eef2f0;

    &:first-child {
      border-top: 0;
      padding-top: 0;
    }
    &:last-child {
      padding-bottom: 0;
    }
  }

  &__date {
    width: 52px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    border-radius: 12px;
    background: #ecfdf5;
    color: #065f46;
    line-height: 1.1;

    strong {
      font-size: 20px;
      font-weight: 800;
    }
    span {
      font-size: 12px;
      font-weight: 600;
    }
  }

  &__content {
    min-width: 0;

    b {
      display: block;
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    p {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 40px 20px;
    color: #64748b;
    font-size: 14px;

    .q-icon {
      color: #cbd5d1;
    }
    p {
      margin: 0;
    }
  }
}
</style>