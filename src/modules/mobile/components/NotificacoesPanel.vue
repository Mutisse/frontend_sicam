<template>
  <q-dialog v-model="aberto" position="top">
    <div class="notif-panel">
      <!-- HEADER -->
      <header class="notif-panel__head">
        <div>
          <h3>Notificações</h3>
          <small v-if="store.naoLidas">
            {{ store.naoLidas }} não lida{{ store.naoLidas > 1 ? "s" : "" }}
          </small>
          <small v-else>Tudo em ordem</small>
        </div>
        <button
          v-if="store.temNaoLidas"
          class="notif-panel__marcar"
          @click="store.marcarTodasLidas()"
        >
          Marcar todas
        </button>
      </header>

      <!-- SKELETON -->
      <div
        v-if="store.aCarregar && !store.notificacoes.length"
        class="notif-panel__skeleton"
      >
        <div v-for="i in 3" :key="i" class="sk-row" />
      </div>

      <!-- VAZIO -->
      <div v-else-if="!store.notificacoes.length" class="notif-panel__vazio">
        <q-icon name="notifications_off" size="40px" />
        <b>Sem notificações</b>
        <p>Não há nada de novo para si.</p>
      </div>

      <!-- LISTA -->
      <ul v-else class="notif-panel__list">
        <li
          v-for="n in store.notificacoes"
          :key="n.id"
          class="notif-item"
          :class="[`notif-item--${n.tipo}`, { 'notif-item--lida': n.lida }]"
          @click="abrirNotificacao(n)"
        >
          <div class="notif-item__icon">
            <q-icon :name="icone(n.tipo)" size="20px" />
          </div>

          <div class="notif-item__body">
            <div class="notif-item__top">
              <b>{{ n.titulo }}</b>
              <span v-if="!n.lida" class="notif-item__dot" />
            </div>
            <p>{{ n.mensagem }}</p>
            <small>{{ tempoRelativo(n.created_at) }}</small>
          </div>

          <button
            class="notif-item__close"
            aria-label="Apagar"
            @click.stop="store.apagar(n.id)"
          >
            <q-icon name="close" size="16px" />
          </button>
        </li>
      </ul>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useNotificacoesStore } from "@/stores/Mobilenotificacoes.store";
import type { Notificacao } from "@/services/notificacoes.service";

const router = useRouter();
const store = useNotificacoesStore();

// Controla abertura/fecho pelo store
const aberto = computed({
  get: () => store.painelAberto,
  set: (v) => {
    if (v) store.abrir();
    else store.fechar();
  },
});

// ── Ícones por tipo ────────────────────────────────
function icone(tipo: Notificacao["tipo"]): string {
  return (
    {
      info: "info",
      sucesso: "check_circle",
      aviso: "warning",
      erro: "error",
    }[tipo] ?? "info"
  );
}

// ── Tempo relativo ─────────────────────────────────
function tempoRelativo(iso: string): string {
  const d = new Date(iso);
  const agora = new Date();
  const diff = Math.floor((agora.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `há ${Math.floor(diff / 86400)} d`;

  return d.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short" });
}

// ── Abrir notificação (navegar se tiver URL) ──────
async function abrirNotificacao(n: Notificacao) {
  if (!n.lida) await store.marcarLida(n.id);

  if (n.url) {
    store.fechar();
    router.push(n.url);
  }
}
</script>

<style scoped lang="scss">
.notif-panel {
  background: #fff;
  border-radius: 0 0 20px 20px;
  width: 100vw;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);

  // safe area iPhone
  padding-top: env(safe-area-inset-top, 0px);
}

.notif-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--sicam-line-soft, #eef2f0);
  flex-shrink: 0;

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--sicam-ink, #0f172a);
    margin: 0;
  }
  small {
    display: block;
    font-size: 12px;
    color: var(--sicam-muted, #64748b);
    margin-top: 2px;
  }
}

.notif-panel__marcar {
  background: #ecfdf5;
  color: #065f46;
  border: 0;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;

  &:active {
    background: #d1fae5;
  }
}

.notif-panel__skeleton {
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@keyframes sk-shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.sk-row {
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.05) 100%
  );
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s infinite linear;
}

.notif-panel__vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
  gap: 6px;

  .q-icon {
    color: #cbd5e1;
    margin-bottom: 6px;
  }
  b {
    font-size: 15px;
    color: var(--sicam-ink, #0f172a);
  }
  p {
    font-size: 13px;
    color: var(--sicam-muted, #64748b);
    margin: 0;
  }
}

.notif-panel__list {
  list-style: none;
  padding: 8px 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 18px;
  cursor: pointer;
  transition: background 0.15s;

  &:active {
    background: #f6f9f8;
  }

  &--lida {
    opacity: 0.65;
  }

  &--info .notif-item__icon {
    background: #dbeafe;
    color: #1d4ed8;
  }
  &--sucesso .notif-item__icon {
    background: #ecfdf5;
    color: #059669;
  }
  &--aviso .notif-item__icon {
    background: #fffbeb;
    color: #d97706;
  }
  &--erro .notif-item__icon {
    background: #fef2f2;
    color: #dc2626;
  }
}

.notif-item__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.notif-item__body {
  flex: 1;
  min-width: 0;

  p {
    font-size: 13px;
    color: #475569;
    margin: 2px 0 4px;
    line-height: 1.4;
    word-break: break-word;
  }

  small {
    font-size: 11px;
    color: var(--sicam-muted, #64748b);
  }
}

.notif-item__top {
  display: flex;
  align-items: center;
  gap: 6px;

  b {
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink, #0f172a);
  }
}

.notif-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc2626;
  flex-shrink: 0;
}

.notif-item__close {
  background: none;
  border: 0;
  color: #cbd5e1;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  flex-shrink: 0;

  &:active {
    background: #fef2f2;
    color: #dc2626;
  }
}
</style>
