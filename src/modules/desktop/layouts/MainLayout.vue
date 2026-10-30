<template>
  <q-layout view="hHh Lpr lFf" class="sicam-layout">
    <a href="#conteudo-principal" class="sicam-skip">Saltar para o conteúdo</a>

    <!-- ============================================================ -->
    <!-- HEADER                                                        -->
    <!-- ============================================================ -->
    <q-header class="sicam-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="sicam-header__icon-btn"
          :aria-label="
            ehDesktop ? 'Recolher ou expandir o menu' : 'Abrir ou fechar o menu'
          "
          @click="alternarMenu"
        >
          <q-tooltip v-if="ehDesktop">
            {{ mini ? 'Expandir menu' : 'Recolher menu' }}
          </q-tooltip>
        </q-btn>

        <div class="sicam-header__brand">
          <div class="sicam-header__logo">
            <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
              <circle cx="20" cy="20" r="19" fill="#ffffff22" />
              <path
                d="M4 20c6-9 12-12 16-12s10 3 16 12c-6 9-12 12-16 12S10 29 4 20z"
                fill="#facc15"
              />
              <circle cx="20" cy="20" r="7" fill="#065f46" />
              <circle cx="20" cy="20" r="3" fill="#fff" />
            </svg>
          </div>

          <div class="sicam-header__title">
            <b>SICAM</b>
            <small>Fiscalização · Score de regularidade · Auditoria</small>
          </div>
        </div>

        <q-space />

        <!-- Estado online/offline — AUTOMÁTICO -->
        <span
          class="sicam-header__pill"
          :class="{ 'sicam-header__pill--on': online }"
          :title="online ? 'Ligado à internet' : 'Sem ligação à internet'"
        >
          <span class="sicam-header__pill-dot" />
          {{ online ? 'Online' : 'Offline' }}
        </span>

        <span class="sicam-header__lang">
          PT
          <q-icon name="expand_more" size="16px" />
        </span>

        <!-- ============================================================ -->
        <!-- NOTIFICAÇÕES                                                  -->
        <!-- ============================================================ -->
        <q-btn
          flat
          dense
          round
          icon="notifications"
          class="sicam-header__icon-btn"
          aria-label="Notificações"
        >
          <q-badge
            v-if="notifStore.naoLidas > 0"
            color="negative"
            floating
            rounded
          >
            {{ notifStore.naoLidas > 9 ? '9+' : notifStore.naoLidas }}
          </q-badge>
          <q-tooltip>
            Notificações ({{ notifStore.naoLidas }} por ler)
          </q-tooltip>

          <q-menu
            anchor="bottom right"
            self="top right"
            :offset="[0, 8]"
            class="sicam-notif"
            @show="onAbrirNotif"
          >
            <!-- HEAD -->
            <div class="sicam-notif__head">
              <b>Notificações</b>
              <button
                v-if="notifStore.naoLidas > 0"
                type="button"
                class="sicam-notif__mark"
                @click="notifStore.marcarTodasLidas()"
              >
                Marcar como lidas
              </button>
            </div>

            <!-- SKELETON -->
            <div
              v-if="notifStore.aCarregar && !notifStore.notificacoes.length"
              class="sicam-notif__skeleton"
            >
              <div v-for="i in 3" :key="i" class="sicam-notif__sk-row" />
            </div>

            <!-- VAZIO -->
            <div
              v-else-if="!notifStore.notificacoes.length"
              class="sicam-notif__vazio"
            >
              <span class="sicam-notif__icon">
                <q-icon name="done_all" size="22px" />
              </span>
              <b>Tudo em dia</b>
              <small>Sem notificações novas.</small>
            </div>

            <!-- LISTA -->
            <ul v-else class="sicam-notif__list">
              <li
                v-for="n in notifStore.notificacoes.slice(0, 8)"
                :key="n.id"
                class="sicam-notif__item"
                :class="[`sicam-notif__item--${n.tipo}`, { 'is-lida': n.lida }]"
                @click="abrirNotificacao(n)"
              >
                <span class="sicam-notif__item-icon">
                  <q-icon :name="iconeNotif(n.tipo)" size="18px" />
                </span>

                <div class="sicam-notif__item-body">
                  <div class="sicam-notif__item-top">
                    <b>{{ n.titulo }}</b>
                    <span v-if="!n.lida" class="sicam-notif__item-dot" />
                  </div>
                  <p>{{ n.mensagem }}</p>
                  <small>{{ tempoRelativo(n.created_at) }}</small>
                </div>

                <button
                  type="button"
                  class="sicam-notif__item-close"
                  aria-label="Apagar"
                  @click.stop="notifStore.apagar(n.id)"
                >
                  <q-icon name="close" size="14px" />
                </button>
              </li>
            </ul>

            <!-- FOOTER -->
            <div
              v-if="notifStore.notificacoes.length > 8"
              class="sicam-notif__footer"
            >
              <button
                type="button"
                class="sicam-notif__ver-todas"
                @click="verTodasNotificacoes"
              >
                Ver todas ({{ notifStore.total }})
                <q-icon name="arrow_forward" size="16px" />
              </button>
            </div>
          </q-menu>
        </q-btn>

        <!-- Menu do utilizador -->
        <q-btn
          flat
          no-caps
          class="sicam-header__user-btn"
          aria-label="Menu do utilizador"
        >
          <div class="sicam-header__avatar">{{ auth.iniciais }}</div>
          <span class="sicam-header__user">{{ auth.utilizador?.nome }}</span>
          <q-icon
            name="expand_more"
            size="18px"
            class="sicam-header__user-chevron"
          />

          <q-menu
            anchor="bottom right"
            self="top right"
            :offset="[0, 8]"
            class="sicam-user-menu"
          >
            <div class="sicam-user-menu__head">
              <div class="sicam-user-menu__avatar">{{ auth.iniciais }}</div>
              <div class="sicam-user-menu__info">
                <b>{{ auth.utilizador?.nome }}</b>
                <small>{{ perfilLabel }}</small>
                <span class="sicam-user-menu__status">
                  <i :class="{ 'is-on': online }" />
                  {{ online ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>

            <q-separator />

            <q-list padding>
              <q-item v-close-popup clickable @click="irParaPerfil">
                <q-item-section avatar>
                  <q-icon name="person" size="20px" />
                </q-item-section>
                <q-item-section>Meu perfil</q-item-section>
              </q-item>

              <q-separator spaced />

              <q-item
                v-close-popup
                clickable
                class="sicam-user-menu__logout"
                :disable="aSair"
                @click="sair"
              >
                <q-item-section avatar>
                  <q-spinner v-if="aSair" size="20px" />
                  <q-icon v-else name="logout" size="20px" />
                </q-item-section>
                <q-item-section>
                  {{ aSair ? 'A terminar…' : 'Terminar sessão' }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- ============================================================ -->
    <!-- DRAWER                                                        -->
    <!-- ============================================================ -->
    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      :width="272"
      :mini="miniActivo"
      :mini-width="76"
      class="sicam-drawer"
      :class="{ 'is-mini': miniActivo }"
    >
      <div class="sicam-drawer__inner">
        <div class="sicam-drawer__header">
          <div class="sicam-drawer__perfil">
            <q-icon name="shield" size="18px" />
            <span>{{ perfilLabel }}</span>
            <q-tooltip
              v-if="miniActivo"
              anchor="center right"
              self="center left"
              :offset="[10, 0]"
            >
              {{ perfilLabel }}
            </q-tooltip>
          </div>
        </div>

        <div
          class="sicam-drawer__search"
          :role="miniActivo ? 'button' : undefined"
          :tabindex="miniActivo ? 0 : undefined"
          :aria-label="miniActivo ? 'Pesquisar no menu' : undefined"
          @click="miniActivo && abrirBusca()"
          @keydown.enter="miniActivo && abrirBusca()"
        >
          <q-icon name="search" size="18px" class="sicam-drawer__search-icon" />
          <input
            ref="buscaEl"
            v-model.trim="busca"
            class="sicam-drawer__search-input"
            placeholder="Pesquisar no menu"
            type="search"
            autocomplete="off"
            aria-label="Pesquisar no menu"
            :tabindex="miniActivo ? -1 : 0"
            @keydown.esc="busca = ''"
          />
          <button
            v-if="busca"
            type="button"
            class="sicam-drawer__search-clear"
            aria-label="Limpar pesquisa"
            @click="busca = ''"
          >
            <q-icon name="close" size="16px" />
          </button>
          <kbd v-else class="sicam-drawer__kbd sicam-drawer__search-kbd">
            {{ atalhoBusca }}
          </kbd>
          <q-tooltip
            v-if="miniActivo"
            anchor="center right"
            self="center left"
            :offset="[10, 0]"
          >
            Pesquisar ({{ atalhoBusca }})
          </q-tooltip>
        </div>

        <nav class="sicam-drawer__nav" aria-label="Navegação principal">
          <template v-if="menuFiltrado.length">
            <template v-for="(grupo, i) in menuFiltrado" :key="i">
              <p class="sicam-drawer__group-title">
                <span>{{ grupo.titulo }}</span>
              </p>

              <router-link
                v-for="item in grupo.items"
                :key="item.to"
                :to="item.to"
                class="sicam-drawer__link"
                :class="{ 'sicam-drawer__link--disabled': item.disabled }"
                active-class="sicam-drawer__link--active"
                :aria-disabled="item.disabled ? 'true' : undefined"
                :tabindex="item.disabled ? -1 : undefined"
              >
                <q-icon
                  :name="item.icon"
                  size="20px"
                  class="sicam-drawer__icon"
                />
                <span class="sicam-drawer__label">{{ item.label }}</span>

                <span
                  v-if="item.badge !== undefined"
                  class="sicam-drawer__badge"
                  :class="`sicam-drawer__badge--${item.badgeVariant ?? 'info'}`"
                >
                  {{ item.badge }}
                </span>

                <kbd v-if="item.shortcut" class="sicam-drawer__kbd">
                  {{ item.shortcut }}
                </kbd>

                <q-tooltip
                  v-if="miniActivo"
                  anchor="center right"
                  self="center left"
                  :offset="[10, 0]"
                >
                  {{ item.label }}
                </q-tooltip>
                <q-tooltip
                  v-else-if="item.shortcut"
                  anchor="center right"
                  self="center left"
                  :offset="[8, 0]"
                >
                  Atalho: {{ item.shortcut }}
                </q-tooltip>
              </router-link>
            </template>
          </template>

          <p v-else class="sicam-drawer__empty">
            Sem resultados para "{{ busca }}"
          </p>
        </nav>

        <div class="sicam-drawer__footer">
          <p class="sicam-drawer__version">v{{ versao }} · build {{ build }}</p>
        </div>
      </div>
    </q-drawer>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <q-page-container id="conteudo-principal" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition name="sicam-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app.store'
import { useNotificacoesStore } from '@/stores/Desktopnotificacoes.store'
import type { Notificacao } from '@/services/notificacoes.service'
import { menuDoPerfil, type MenuGroup } from '@/modules/desktop/config/menus'
import { PERFIL_LABEL } from '@/css/design/palette'

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const app = useAppStore()
const notifStore = useNotificacoesStore()

const drawer = ref(true)
const busca = ref('')
const buscaEl = ref<HTMLInputElement | null>(null)
const aSair = ref(false)

// ─── Valores que vêm da app store ───────────────────────────
const online = computed(() => app.online)
const versao = computed(() => app.versao)
const build = computed(() => app.build)

// ─── Sincronizar online/offline ao montar ───────────────────
function aoMudarOnline() {
  app.sincronizarOnline()
}

// ─── Notificações ───────────────────────────────────────────
function onAbrirNotif() {
  notifStore.carregar()
}

function iconeNotif(tipo: Notificacao['tipo']): string {
  return (
    {
      info: 'info',
      sucesso: 'check_circle',
      aviso: 'warning',
      erro: 'error',
    }[tipo] ?? 'info'
  )
}

function tempoRelativo(iso: string): string {
  const d = new Date(iso)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)

  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `há ${Math.floor(diff / 86400)} d`

  return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })
}

async function abrirNotificacao(n: Notificacao) {
  if (!n.lida) await notifStore.marcarLida(n.id)

  if (n.url) {
    router.push(n.url)
  }
}

function verTodasNotificacoes() {
  router.push('/notificacoes')
}

// ─── Polling da contagem ────────────────────────────────────
let notifTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  app.sincronizarOnline()
  window.addEventListener('online', aoMudarOnline)
  window.addEventListener('offline', aoMudarOnline)

  // primeira leitura + polling 30s
  notifStore.carregarContagem()
  notifTimer = setInterval(() => {
    notifStore.carregarContagem()
  }, 30_000)

  window.addEventListener('keydown', aoTeclar)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', aoMudarOnline)
  window.removeEventListener('offline', aoMudarOnline)
  window.removeEventListener('keydown', aoTeclar)

  if (notifTimer) clearInterval(notifTimer)
})

// ------------------------------------------------------------
// Menu recolhível
// ------------------------------------------------------------
const MINI_KEY = 'sicam.drawer-mini'

function lerMini(): boolean {
  try {
    return localStorage.getItem(MINI_KEY) === '1'
  } catch {
    return false
  }
}

const mini = ref(lerMini())
const ehDesktop = computed(() => $q.screen.gt.sm)
const miniActivo = computed(() => mini.value && ehDesktop.value)

function alternarMenu() {
  if (ehDesktop.value) {
    mini.value = !mini.value
    try {
      localStorage.setItem(MINI_KEY, mini.value ? '1' : '0')
    } catch {
      /* ignorar */
    }
  } else {
    drawer.value = !drawer.value
  }
}

// ------------------------------------------------------------
// Estado derivado
// ------------------------------------------------------------
const perfilLabel = computed(() => {
  if (!auth.perfil) return 'SICAM'
  return PERFIL_LABEL[auth.perfil] ?? 'SICAM'
})

const menuGrupos = computed(() => menuDoPerfil(auth.perfil))

function normalizar(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const menuFiltrado = computed<MenuGroup[]>(() => {
  if (!busca.value) return menuGrupos.value
  const q = normalizar(busca.value)

  return menuGrupos.value
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => normalizar(i.label).includes(q)),
    }))
    .filter((g) => g.items.length > 0)
})

// ------------------------------------------------------------
// Pesquisa Ctrl+K
// ------------------------------------------------------------
const atalhoBusca = computed(() =>
  typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
    ? '⌘K'
    : 'Ctrl K',
)

function abrirBusca() {
  if (!ehDesktop.value) drawer.value = true
  mini.value = false
  nextTick(() => buscaEl.value?.focus())
}

function aoTeclar(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    abrirBusca()
  }
}

// ------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------
async function sair() {
  if (aSair.value) return
  aSair.value = true

  try {
    await auth.logout()
  } catch {
    /* mesmo com erro, limpamos localmente */
  } finally {
    await router.replace({ name: 'login' })
    aSair.value = false
  }
}

// ─── Meu perfil → admin vai para /admin/perfil, outros para /perfil ───
function irParaPerfil() {
  if (auth.perfil === 'admin') {
    router.push({ name: 'admin-perfil' })
  } else {
    router.push({ name: 'perfil' })
  }
}
</script>

<style scoped lang="scss">
/* ────────────────────────────────────────────────────────────── */
/* Layout SICAM                                                  */
/* ────────────────────────────────────────────────────────────── */
.sicam-layout {
  background: var(--sicam-bg, #f4f8f6);
}

.sicam-skip {
  position: fixed;
  left: 12px;
  top: -52px;
  z-index: 3000;
  background: #064e3b;
  color: #fff;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: top 0.15s;

  &:focus {
    top: 12px;
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Header                                                        */
/* ────────────────────────────────────────────────────────────── */
.sicam-header {
  background: var(
    --sicam-gradient-header,
    linear-gradient(90deg, #064e3b, #065f46)
  );
  color: #fff;
  height: 60px;
  box-shadow: 0 4px 18px rgba(4, 38, 29, 0.18);

  .q-toolbar {
    min-height: 60px;
    gap: 12px;
    padding: 0 20px;

    @media (max-width: 600px) {
      padding: 0 12px;
      gap: 8px;
    }
  }

  &__icon-btn {
    color: #fff;
    &:hover {
      background: #ffffff22;
    }
    &:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 1px;
    }
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  &__logo {
    display: flex;
    align-items: center;
  }

  &__title {
    display: flex;
    flex-direction: column;
    line-height: 1.2;

    b {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.02em;
    }
    small {
      font-size: 11px;
      opacity: 0.75;
      @media (max-width: 1100px) {
        display: none;
      }
    }
  }

  &__pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid #ffffff55;
    background: #ffffff1a;
    color: #fff;
    border-radius: 99px;
    padding: 5px 12px 5px 10px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    transition:
      background 0.15s,
      border-color 0.15s;

    &--on {
      background: #10b981;
      border-color: #10b981;
    }
  }

  &__pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fca5a5;

    .sicam-header__pill--on & {
      background: #fff;
    }
  }

  &__lang {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 13px;
    font-weight: 600;
    opacity: 0.85;

    @media (max-width: 600px) {
      display: none;
    }
  }

  &__user-btn {
    color: #fff;
    padding: 4px 8px 4px 4px;
    border-radius: 99px;

    :deep(.q-btn__content) {
      gap: 8px;
      flex-wrap: nowrap;
    }
    &:hover {
      background: #ffffff22;
    }
    &:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 1px;
    }
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #facc15;
    color: #3b2f00;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 800;
    flex-shrink: 0;
  }

  &__user {
    font-size: 13px;
    font-weight: 600;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 900px) {
      display: none;
    }
  }

  &__user-chevron {
    opacity: 0.8;
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Notificações                                                  */
/* ────────────────────────────────────────────────────────────── */
.sicam-notif {
  width: 340px;
  max-width: 92vw;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(6, 78, 59, 0.18);
  overflow: hidden;
  background: #fff;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--sicam-line, #e5ebe8);

    b {
      font-size: 15px;
      color: var(--sicam-ink, #0f172a);
    }
  }

  &__mark {
    border: 0;
    background: none;
    color: var(--sicam-primary, #065f46);
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 8px;

    &:hover {
      background: #ecfdf5;
    }
  }

  /* SKELETON */
  &__skeleton {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 16px;
  }

  &__sk-row {
    height: 56px;
    border-radius: 12px;
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.05) 0%,
      rgba(0, 0, 0, 0.08) 50%,
      rgba(0, 0, 0, 0.05) 100%
    );
    background-size: 800px 100%;
    animation: sicam-notif-shimmer 1.4s infinite linear;
  }

  /* VAZIO */
  &__vazio {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 26px 16px;

    b {
      font-size: 14px;
      color: var(--sicam-ink, #0f172a);
      margin-top: 10px;
    }
    small {
      font-size: 12px;
      color: var(--sicam-muted, #64748b);
      margin-top: 2px;
    }
  }

  &__icon {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: #ecfdf5;
    color: #065f46;
  }

  /* LISTA */
  &__list {
    list-style: none;
    padding: 6px 0;
    margin: 0;
    max-height: 420px;
    overflow-y: auto;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: #f6f9f8;
    }

    &.is-lida {
      opacity: 0.6;
    }

    &--info .sicam-notif__item-icon {
      background: #dbeafe;
      color: #1d4ed8;
    }
    &--sucesso .sicam-notif__item-icon {
      background: #ecfdf5;
      color: #059669;
    }
    &--aviso .sicam-notif__item-icon {
      background: #fffbeb;
      color: #d97706;
    }
    &--erro .sicam-notif__item-icon {
      background: #fef2f2;
      color: #dc2626;
    }
  }

  &__item-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: #f1f5f9;
    color: #475569;
  }

  &__item-body {
    flex: 1;
    min-width: 0;

    p {
      font-size: 12px;
      color: #475569;
      margin: 2px 0 3px;
      line-height: 1.4;
      word-break: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    small {
      font-size: 11px;
      color: var(--sicam-muted, #64748b);
    }
  }

  &__item-top {
    display: flex;
    align-items: center;
    gap: 6px;

    b {
      font-size: 13px;
      font-weight: 700;
      color: var(--sicam-ink, #0f172a);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
  }

  &__item-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #dc2626;
    flex-shrink: 0;
  }

  &__item-close {
    background: none;
    border: 0;
    color: #cbd5e1;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    flex-shrink: 0;

    &:hover {
      background: #fef2f2;
      color: #dc2626;
    }
  }

  /* FOOTER */
  &__footer {
    border-top: 1px solid var(--sicam-line-soft, #eef2f0);
    padding: 8px;
  }

  &__ver-todas {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: none;
    border: 0;
    color: var(--sicam-primary, #065f46);
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
      background: #ecfdf5;
    }
  }
}

@keyframes sicam-notif-shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Menu do utilizador                                           */
/* ────────────────────────────────────────────────────────────── */
.sicam-user-menu {
  min-width: 260px;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(6, 78, 59, 0.18);
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: #ecfdf5;
  }

  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #064e3b;
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 15px;
    font-weight: 800;
    flex-shrink: 0;
  }

  &__info {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
    min-width: 0;
    gap: 2px;

    b {
      font-size: 14px;
      color: var(--sicam-ink, #0f172a);
    }
    small {
      font-size: 12px;
      color: var(--sicam-muted, #64748b);
    }
  }

  &__status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--sicam-muted, #64748b);
    margin-top: 2px;

    i {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #cbd5e1;
      &.is-on {
        background: #10b981;
      }
    }
  }

  &__logout {
    color: #991b1b;
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Drawer                                                       */
/* ────────────────────────────────────────────────────────────── */
.sicam-drawer {
  background: var(--sicam-surface, #fff);

  &__inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 14px 12px 12px;
    overflow: hidden;
  }

  &__header {
    padding: 0 0 8px;
  }

  &__perfil {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 12px;
    background: var(--sicam-primary-bg, #ecfdf5);
    color: var(--sicam-primary, #065f46);
    font-size: 13px;
    font-weight: 700;

    .q-icon {
      flex-shrink: 0;
    }
    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--sicam-surface-alt, #f6f9f8);
    border: 1px solid transparent;
    border-radius: 10px;
    margin: 8px 0 4px;
    transition:
      border-color 0.15s,
      box-shadow 0.15s,
      background 0.15s;

    &:focus-within {
      background: #fff;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }
  }

  &__search-icon {
    color: var(--sicam-muted, #64748b);
    flex-shrink: 0;
  }

  &__search-input {
    flex: 1;
    border: 0;
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    color: var(--sicam-ink, #0f172a);
    outline: 0;
    min-width: 0;

    &::placeholder {
      color: var(--sicam-muted, #64748b);
    }
    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__search-clear {
    background: none;
    border: 0;
    color: var(--sicam-muted, #64748b);
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    border-radius: 6px;
    &:hover {
      background: rgba(0, 0, 0, 0.06);
    }
  }

  &__nav {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 2px;
    scrollbar-width: thin;
  }

  &__group-title {
    font-size: 11px;
    color: var(--sicam-muted, #64748b);
    margin: 16px 12px 6px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    color: #334155;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 2px;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      background: var(--sicam-primary-bg-alt, #f0fdf7);
      color: var(--sicam-primary, #065f46);
    }
    &:focus-visible {
      outline: 3px solid #10b981;
      outline-offset: -2px;
    }

    &--active {
      background: var(--sicam-primary-bg, #ecfdf5);
      color: var(--sicam-primary, #065f46);
      font-weight: 700;

      &::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 8px;
        bottom: 8px;
        width: 4px;
        border-radius: 0 4px 4px 0;
        background: #10b981;
      }
    }

    &--disabled {
      opacity: 0.45;
      pointer-events: none;
    }
  }

  &__icon {
    color: inherit;
    flex-shrink: 0;
  }

  &__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    border-radius: 99px;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    flex-shrink: 0;

    &--regular {
      background: var(--sicam-success-bg, #ecfdf5);
      color: var(--sicam-success-ink, #065f46);
    }
    &--atencao {
      background: var(--sicam-warning-bg, #fffbeb);
      color: var(--sicam-warning-ink, #92400e);
    }
    &--critico {
      background: var(--sicam-critical-bg, #fef2f2);
      color: var(--sicam-critical-ink, #991b1b);
    }
    &--info {
      background: var(--sicam-primary-bg, #ecfdf5);
      color: var(--sicam-primary, #065f46);
    }
  }

  &__kbd {
    font-family: ui-monospace, monospace;
    font-size: 10px;
    padding: 2px 5px;
    background: #fff;
    border: 1px solid var(--sicam-line, #e5ebe8);
    border-radius: 5px;
    color: var(--sicam-muted, #64748b);
    flex-shrink: 0;
    white-space: nowrap;
  }

  &__empty {
    text-align: center;
    color: var(--sicam-muted, #64748b);
    font-size: 13px;
    padding: 24px 12px;
  }

  &__footer {
    border-top: 1px solid var(--sicam-line, #e5ebe8);
    padding-top: 12px;
    margin-top: 8px;
  }

  &__version {
    text-align: center;
    font-size: 11px;
    color: var(--sicam-muted, #64748b);
    margin: 0;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  &.is-mini {
    .sicam-drawer__inner {
      padding: 14px 10px 12px;
    }

    .sicam-drawer__perfil {
      justify-content: center;
      padding: 10px 0;
      span {
        display: none;
      }
    }

    .sicam-drawer__search {
      justify-content: center;
      padding: 10px 0;
      cursor: pointer;
      &:hover {
        background: var(--sicam-primary-bg-alt, #f0fdf7);
      }
    }
    .sicam-drawer__search-input,
    .sicam-drawer__search-kbd,
    .sicam-drawer__search-clear {
      display: none;
    }

    .sicam-drawer__group-title {
      height: 1px;
      margin: 12px 14px;
      background: var(--sicam-line, #e5ebe8);
      span {
        display: none;
      }
    }

    .sicam-drawer__link {
      justify-content: center;
      padding: 12px 0;
      &--active::before {
        left: -10px;
      }
    }
    .sicam-drawer__label,
    .sicam-drawer__kbd {
      display: none;
    }

    .sicam-drawer__badge {
      position: absolute;
      top: 8px;
      right: 14px;
      min-width: 9px;
      width: 9px;
      height: 9px;
      padding: 0;
      font-size: 0;
      background: #ef4444;
      border: 2px solid #fff;
      box-sizing: content-box;
    }

    .sicam-drawer__version {
      font-size: 0;
    }
    .sicam-drawer__empty {
      display: none;
    }
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Páginas                                                      */
/* ────────────────────────────────────────────────────────────── */
:deep(.q-page-container) {
  background: var(--sicam-bg, #f4f8f6);
}

.sicam-page-enter-active,
.sicam-page-leave-active {
  transition: opacity 0.15s ease;
}
.sicam-page-enter-from,
.sicam-page-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .sicam-page-enter-active,
  .sicam-page-leave-active {
    transition: none;
  }
}
</style>