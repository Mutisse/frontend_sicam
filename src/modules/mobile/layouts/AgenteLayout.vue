<template>
  <div class="agente-shell">
    <div class="agente-phone">
      <!-- HEADER -->
      <header class="agente-header">
        <div class="agente-header__title">
          <b>SICAM</b>
          <small>Agente de Trânsito</small>
        </div>

        <div class="agente-header__spacer" />

        <!-- Online/Offline -->
        <button
          class="agente-header__pill"
          :class="{ 'agente-header__pill--on': agenteStore.online }"
          @click="agenteStore.online = !agenteStore.online"
        >
          {{ agenteStore.online ? "Online" : "Offline" }}
        </button>

        <!-- Notificações (com badge) -->
        <button
          class="agente-header__icon agente-header__icon--badge"
          @click="abrirNotificacoes"
        >
          <q-icon name="notifications" size="22px" />
          <span v-if="notifStore.naoLidas > 0" class="agente-header__badge">
            {{ notifStore.naoLidas > 99 ? "99+" : notifStore.naoLidas }}
          </span>
        </button>
      </header>

      <!-- CONTEÚDO -->
      <main class="agente-content">
        <router-view />
      </main>

      <!-- BOTTOM NAVIGATION -->
      <nav class="agente-tabs">
        <router-link
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="agente-tabs__item"
          :class="{ 'agente-tabs__item--active': isActiva(tab) }"
        >
          <q-icon :name="tab.icon" size="22px" />
          <span>{{ tab.label }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Painel de notificações -->
    <NotificacoesPanel />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useAgenteInicioStore } from "@/stores/agente/agente-inicio.store";
import { useNotificacoesStore } from "@/stores/Mobilenotificacoes.store";
import { TABS_AGENTE, type TabAgente } from "../config/tabsAgente";
import NotificacoesPanel from "../components/NotificacoesPanel.vue";

const route = useRoute();
const agenteStore = useAgenteInicioStore();
const notifStore = useNotificacoesStore();

const tabs = TABS_AGENTE;

function isActiva(tab: TabAgente): boolean {
  if (route.path === tab.to) return true;
  if (tab.rotasActivas?.includes(route.path)) return true;
  return false;
}

function abrirNotificacoes() {
  notifStore.abrir();
}

// ── Polling da contagem (30s) ─────────────────────
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // primeira leitura
  notifStore.carregarContagem();

  // atualiza a cada 30 segundos
  timer = setInterval(() => {
    notifStore.carregarContagem();
  }, 30_000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.agente-shell {
  min-height: 100vh;
  background: var(--sicam-bg);
  font-family: var(--sicam-font-family);
}

.agente-phone {
  width: 100%;
  height: 100vh;
  background: var(--sicam-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* ------------------------------------------------------------ */
/* Header                                                        */
/* ------------------------------------------------------------ */
.agente-header {
  flex-shrink: 0;
  background: linear-gradient(90deg, #064e3b, #065f46);
  color: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));

  &__title {
    display: flex;
    flex-direction: column;
    line-height: 1.1;

    b {
      font-size: 15px;
    }
    small {
      font-size: 11px;
      opacity: 0.75;
    }
  }

  &__spacer {
    flex: 1;
  }

  &__pill {
    border: 1px solid #ffffff55;
    background: #ffffff1a;
    color: #fff;
    border-radius: 99px;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &--on {
      background: #10b981;
      border-color: #10b981;
    }
  }

  &__icon {
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;

    &--badge {
      position: relative;
    }
  }

  &__badge {
    position: absolute;
    top: -2px;
    right: -4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 99px;
    background: #dc2626;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    line-height: 16px;
    text-align: center;
    border: 2px solid #065f46;
    box-sizing: content-box;
  }
}

/* ------------------------------------------------------------ */
/* Conteúdo                                                      */
/* ------------------------------------------------------------ */
.agente-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  -webkit-overflow-scrolling: touch;
}

/* ------------------------------------------------------------ */
/* Bottom tabs                                                   */
/* ------------------------------------------------------------ */
.agente-tabs {
  flex-shrink: 0;
  display: flex;
  background: #fff;
  border-top: 1px solid var(--sicam-line);
  padding: 6px 4px;
  padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 4px 0;
    color: var(--sicam-muted);
    text-decoration: none;
    font-size: 11px;
    font-weight: 500;
    transition: color var(--sicam-transition-fast);

    span {
      line-height: 1;
    }

    &--active {
      color: var(--sicam-primary);
      font-weight: 700;
    }
  }
}
</style>
