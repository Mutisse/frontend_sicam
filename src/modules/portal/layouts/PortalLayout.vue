<template>
  <div class="portal-shell">
    <a href="#conteudo" class="skip-link">Saltar para o conteúdo</a>

    <!-- ============================================================ -->
    <!-- FAIXA INSTITUCIONAL                                           -->
    <!-- ============================================================ -->
    <div class="portal-strip">
      <div class="portal-strip__inner">
        <span class="portal-strip__item">
          <q-icon name="verified_user" size="14px" />
          Serviço público de consulta, sem necessidade de conta
        </span>
        <span class="portal-strip__item portal-strip__item--end">
          <q-icon name="lock" size="14px" />
          Ligação segura
        </span>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- HEADER                                                        -->
    <!-- ============================================================ -->
    <header
      class="portal-header"
      :class="{ 'portal-header--scrolled': scrolled }"
    >
      <div class="portal-header__inner">
        <!-- Logo + nome -->
        <router-link
          to="/cidadao/portal"
          class="portal-header__brand"
          aria-label="SICAM, página inicial"
        >
          <div class="portal-header__logo">
            <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true">
              <defs>
                <linearGradient id="sicam-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#10b981" />
                  <stop offset="1" stop-color="#064e3b" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="12" fill="url(#sicam-g)" />
              <path
                d="M5 20c5.5-8 10.5-11 15-11s9.5 3 15 11c-5.5 8-10.5 11-15 11S10.5 28 5 20z"
                fill="#facc15"
              />
              <circle cx="20" cy="20" r="6.5" fill="#064e3b" />
              <circle cx="20" cy="20" r="2.6" fill="#fff" />
            </svg>
          </div>
          <div class="portal-header__text">
            <b>SICAM</b>
            <small>Portal do Cidadão</small>
          </div>
        </router-link>

        <!-- Menu (desktop) -->
        <nav
          class="portal-header__nav portal-header__nav--desktop"
          aria-label="Navegação principal"
        >
          <router-link
            v-for="t in tabsVisiveis"
            :key="t.to"
            :to="t.to"
            class="portal-header__link"
            active-class="portal-header__link--active"
          >
            <q-icon v-if="t.icon" :name="t.icon" size="18px" />
            <span>{{ t.label }}</span>
          </router-link>
        </nav>

        <!-- Cidadão consultado -->
        <div v-if="carta.temCarta" class="portal-header__cidadao">
          <span class="portal-header__avatar">{{ iniciais }}</span>
          <span class="portal-header__cidadao-nome">{{
            carta.condutor?.nome
          }}</span>
          <button
            class="portal-header__cidadao-close"
            title="Terminar consulta"
            aria-label="Terminar consulta"
            @click="terminarConsulta"
          >
            <q-icon name="close" size="14px" />
          </button>
        </div>

        <!-- Botão menu (mobile) -->
        <button
          class="portal-header__menu-btn"
          :aria-expanded="menuAberto"
          aria-label="Abrir menu"
          @click="menuAberto = !menuAberto"
        >
          <q-icon :name="menuAberto ? 'close' : 'menu'" size="24px" />
        </button>
      </div>

      <!-- Menu (mobile) -->
      <transition name="drop">
        <nav
          v-if="menuAberto"
          class="portal-header__nav portal-header__nav--mobile"
          aria-label="Navegação principal"
        >
          <div v-if="carta.temCarta" class="portal-header__mobile-cidadao">
            <span class="portal-header__avatar">{{ iniciais }}</span>
            <div class="portal-header__mobile-info">
              <b>{{ carta.condutor?.nome }}</b>
              <small>Consulta activa</small>
            </div>
            <button class="portal-header__mobile-end" @click="terminarConsulta">
              Terminar
            </button>
          </div>

          <router-link
            v-for="t in tabsVisiveis"
            :key="t.to"
            :to="t.to"
            class="portal-header__link"
            active-class="portal-header__link--active"
            @click="menuAberto = false"
          >
            <q-icon :name="t.icon" size="20px" />
            <span>{{ t.label }}</span>
          </router-link>
        </nav>
      </transition>
    </header>

    <transition name="fade">
      <div
        v-if="menuAberto"
        class="portal-overlay"
        @click="menuAberto = false"
      />
    </transition>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <main id="conteudo" class="portal-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- ============================================================ -->
    <!-- FOOTER                                                        -->
    <!-- ============================================================ -->
    <footer class="portal-footer">
      <div class="portal-footer__inner">
        <div class="portal-footer__grid">
          <section class="portal-footer__col portal-footer__col--brand">
            <div class="portal-footer__brand">
              <svg
                viewBox="0 0 40 40"
                width="30"
                height="30"
                aria-hidden="true"
              >
                <rect width="40" height="40" rx="12" fill="#10b981" />
                <path
                  d="M5 20c5.5-8 10.5-11 15-11s9.5 3 15 11c-5.5 8-10.5 11-15 11S10.5 28 5 20z"
                  fill="#facc15"
                />
                <circle cx="20" cy="20" r="6.5" fill="#064e3b" />
                <circle cx="20" cy="20" r="2.6" fill="#fff" />
              </svg>
              <b>SICAM</b>
            </div>
            <p>
              Sistema Integrado de Inteligência Tático-Policial Veicular.
              Consulte a situação do seu veículo, inspeções, seguro e multas num
              só lugar.
            </p>
          </section>

          <section class="portal-footer__col">
            <h4>Navegação</h4>
            <router-link
              v-for="t in tabsVisiveis"
              :key="t.to"
              :to="t.to"
              class="portal-footer__link"
            >
              {{ t.label }}
            </router-link>
          </section>

          <section class="portal-footer__col">
            <h4>Entidades integradas</h4>
            <span class="portal-footer__text">INATRO</span>
            <span class="portal-footer__text">PRM</span>
            <span class="portal-footer__text">Gestão de Multas</span>
            <span class="portal-footer__text">ISSM e seguradoras</span>
          </section>

          <section class="portal-footer__col">
            <h4>Privacidade</h4>
            <span class="portal-footer__text portal-footer__text--icon">
              <q-icon name="shield" size="16px" /> Dados cifrados em trânsito e
              em repouso
            </span>
            <span class="portal-footer__text portal-footer__text--icon">
              <q-icon name="visibility_off" size="16px" /> Consulta limpa ao
              terminar sessão
            </span>
          </section>
        </div>

        <div class="portal-footer__bottom">
          <p>© {{ ano }} SICAM. Todos os direitos reservados.</p>
          <p>Portal público de consulta</p>
        </div>
      </div>
    </footer>

    <!-- Voltar ao topo -->
    <transition name="fade">
      <button
        v-if="scrolled"
        class="portal-top"
        aria-label="Voltar ao topo"
        @click="voltarAoTopo"
      >
        <q-icon name="keyboard_arrow_up" size="22px" />
      </button>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { TABS_PORTAL } from '../config/tabsPortal'
import { usePortalCartaStore } from '@/stores/portal/carta.store'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// Store que sabe quem é o cidadão consultado
const carta = usePortalCartaStore()

const menuAberto = ref(false)
const scrolled = ref(false)
const ano = new Date().getFullYear()

// ============================================================
// Tabs visíveis — esconde as que requerem consulta
// ============================================================
const tabsVisiveis = computed(() =>
  TABS_PORTAL.filter((t) => !t.requerConsulta || carta.temCarta),
)

// ============================================================
// Iniciais do cidadão (avatar)
// ============================================================
const iniciais = computed(() => carta.iniciais)

// ============================================================
// Scroll, teclado e rota
// ============================================================
function onScroll() {
  scrolled.value = window.scrollY > 24
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') menuAberto.value = false
}

function voltarAoTopo() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => route.fullPath,
  () => {
    menuAberto.value = false
  },
)

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  // Se ainda não carregou a carta, tenta ler do sessionStorage
  if (!carta.carregado) {
    carta.carregarDaSessao()
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
})

// ============================================================
// Terminar consulta
// ============================================================
function terminarConsulta() {
  menuAberto.value = false

  $q.dialog({
    title: 'Terminar consulta',
    message: 'Irá limpar os dados do cidadão consultado. Continuar?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Terminar consulta', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => {
    // Limpar tudo do sessionStorage
    sessionStorage.removeItem('sicam.cidadao')
    sessionStorage.removeItem('sicam.numero-carta')

    // Reset da store local
    carta.condutor = null
    carta.numeroCarta = ''
    carta.carregado = false

    router.push('/cidadao/portal')

    $q.notify({
      type: 'info',
      message: 'Consulta terminada.',
      position: 'top',
    })
  })
}
</script>

<style scoped lang="scss">
// ============================================================
// Tokens locais
// ============================================================
.portal-shell {
  --p-green-950: #04261d;
  --p-green-900: #064e3b;
  --p-green-700: #047857;
  --p-green-600: #059669;
  --p-green-500: #10b981;
  --p-green-50: #ecfdf5;
  --p-gold: #facc15;
  --p-ink: #0f172a;
  --p-muted: #64748b;
  --p-line: #e5ebe8;
  --p-radius: 12px;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--sicam-bg, #f4f8f6);
  color: var(--p-ink);
  font-family: var(
    --sicam-font-family,
    'Inter',
    system-ui,
    -apple-system,
    'Segoe UI',
    sans-serif
  );
}

.skip-link {
  position: absolute;
  left: 12px;
  top: -48px;
  z-index: 100;
  background: var(--p-green-900);
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-decoration: none;
  transition: top 0.15s;

  &:focus {
    top: 12px;
  }
}

// ============================================================
// Faixa institucional
// ============================================================
.portal-strip {
  background: var(--p-green-950);
  color: #a7d8c6;
  font-size: 12px;

  &__inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 7px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &--end {
      margin-left: auto;
    }
  }

  @media (max-width: 700px) {
    &__item--end {
      display: none;
    }
  }
}

// ============================================================
// Header
// ============================================================
.portal-header {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(160%) blur(12px);
  -webkit-backdrop-filter: saturate(160%) blur(12px);
  border-bottom: 1px solid var(--p-line);
  position: sticky;
  top: 0;
  z-index: 30;
  transition: box-shadow 0.2s ease;

  &--scrolled {
    box-shadow: 0 6px 24px rgba(6, 78, 59, 0.1);
  }

  &__inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 11px;
    text-decoration: none;
    color: inherit;
    border-radius: 10px;
  }

  &__logo {
    display: flex;
    align-items: center;
  }

  &__text {
    display: flex;
    flex-direction: column;
    line-height: 1.15;

    b {
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: var(--p-green-900);
    }
    small {
      font-size: 12px;
      color: var(--p-muted);
      font-weight: 500;
    }
  }

  // ------------------------------------------------------------
  // Navegação
  // ------------------------------------------------------------
  &__nav--desktop {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 14px;
    border-radius: 10px;
    color: #334155;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      background: var(--p-green-50);
      color: var(--p-green-900);
    }

    &--active {
      background: var(--p-green-900);
      color: #fff;

      &:hover {
        background: var(--p-green-900);
        color: #fff;
      }
    }
  }

  // ------------------------------------------------------------
  // Cidadão consultado
  // ------------------------------------------------------------
  &__cidadao {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    background: var(--p-green-50);
    border: 1px solid #c9ecdc;
    border-radius: 99px;
    padding: 4px 6px 4px 4px;
    font-size: 13px;
    font-weight: 600;
    color: var(--p-green-900);

    @media (max-width: 1000px) {
      display: none;
    }
  }

  &__cidadao-nome {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__avatar {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--p-green-600);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  &__cidadao-close {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--p-green-900);
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: #c9ecdc;
    }
  }

  // ------------------------------------------------------------
  // Mobile
  // ------------------------------------------------------------
  &__menu-btn {
    display: none;
    margin-left: auto;
    background: var(--p-green-50);
    border: 0;
    color: var(--p-green-900);
    cursor: pointer;
    padding: 8px;
    border-radius: 10px;
  }

  &__nav--mobile {
    display: none;
    flex-direction: column;
    gap: 4px;
    padding: 4px 16px 16px;
    border-top: 1px solid var(--p-line);
    background: #fff;

    .portal-header__link {
      padding: 12px 14px;
      font-size: 15px;
    }
  }

  &__mobile-cidadao {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 12px 0 8px;
    padding: 10px 12px;
    background: var(--p-green-50);
    border-radius: var(--p-radius);
  }

  &__mobile-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    min-width: 0;
    flex: 1;

    b {
      font-size: 14px;
      color: var(--p-green-900);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    small {
      font-size: 12px;
      color: var(--p-muted);
    }
  }

  &__mobile-end {
    border: 0;
    background: #fff;
    color: #b91c1c;
    font-weight: 700;
    font-size: 12px;
    padding: 7px 12px;
    border-radius: 8px;
    cursor: pointer;
  }

  @media (max-width: 760px) {
    &__nav--desktop {
      display: none;
    }
    &__menu-btn {
      display: flex;
    }
    &__nav--mobile {
      display: flex;
    }
  }
}

.portal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 38, 29, 0.35);
  z-index: 25;

  @media (min-width: 761px) {
    display: none;
  }
}

// Foco visível
.portal-header__link:focus-visible,
.portal-header__brand:focus-visible,
.portal-header__menu-btn:focus-visible,
.portal-header__cidadao-close:focus-visible,
.portal-footer__link:focus-visible,
.portal-top:focus-visible {
  outline: 3px solid var(--p-green-500);
  outline-offset: 2px;
}

// ============================================================
// Main
// ============================================================
.portal-main {
  flex: 1;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 20px 56px;
}

// ============================================================
// Footer
// ============================================================
.portal-footer {
  background: var(--p-green-950);
  color: #a7c7ba;
  border-top: 3px solid var(--p-gold);

  &__inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 40px 20px 20px;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1.6fr 1fr 1fr 1.3fr;
    gap: 32px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr 1fr;
    }
    @media (max-width: 520px) {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 14px;

    h4 {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 700;
      color: #fff;
    }

    p {
      margin: 0;
      line-height: 1.6;
      font-size: 13px;
      max-width: 34ch;
    }
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;

    b {
      color: #fff;
      font-size: 17px;
      letter-spacing: 0.02em;
    }
  }

  &__link {
    color: #a7c7ba;
    text-decoration: none;
    width: fit-content;
    transition: color 0.15s;

    &:hover {
      color: #fff;
    }
  }

  &__text {
    font-size: 13px;

    &--icon {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      line-height: 1.4;

      .q-icon {
        margin-top: 1px;
        color: var(--p-green-500);
      }
    }
  }

  &__bottom {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;

    p {
      margin: 0;
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

// ============================================================
// Voltar ao topo
// ============================================================
.portal-top {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 20;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--p-green-900);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(6, 78, 59, 0.3);
  transition: background 0.15s;

  &:hover {
    background: var(--p-green-700);
  }
}

// ============================================================
// Transições
// ============================================================
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.18s,
    transform 0.18s;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .drop-enter-active,
  .drop-leave-active,
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>