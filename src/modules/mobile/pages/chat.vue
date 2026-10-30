<template>
  <div class="agente-chat">
    <!-- HEADER -->
    <header class="agente-chat__head">
      <button class="agente-chat__back" aria-label="Voltar" @click="voltar">
        <q-icon name="arrow_back" size="22px" />
      </button>
      <div class="agente-chat__head-body">
        <b>Assistente SICAM</b>
        <small><span class="agente-chat__dot" /> Online · resposta imediata</small>
      </div>
      <button class="agente-chat__menu" aria-label="Menu">
        <q-icon name="more_vert" size="22px" />
      </button>
    </header>

    <!-- MENSAGENS -->
    <div ref="scrollEl" class="agente-chat__body">
      <div
        v-for="(msg, i) in store.mensagens"
        :key="i"
        class="agente-msg"
        :class="`agente-msg--${msg.autor}`"
      >
        <div class="agente-msg__bubble">
          <p class="agente-msg__text">{{ msg.texto }}</p>
        </div>
        <span class="agente-msg__hora">{{ msg.hora }}</span>
      </div>

      <div v-if="store.aEscrever" class="agente-msg agente-msg--bot">
        <div class="agente-msg__bubble agente-msg__bubble--typing">
          <span /><span /><span />
        </div>
      </div>
    </div>

    <!-- SUGESTÕES -->
    <div class="agente-chat__sugestoes">
      <button
        v-for="(s, i) in store.sugestoes"
        :key="i"
        class="agente-sugestao"
        @click="store.enviar(s)"
      >
        {{ s }}
      </button>
    </div>

    <!-- INPUT -->
    <footer class="agente-chat__input">
      <input
        v-model="store.texto"
        type="text"
        class="agente-chat__field"
        placeholder="Escreva uma mensagem…"
        @keyup.enter="store.enviar()"
      />
      <button
        class="agente-chat__send"
        :disabled="!store.texto.trim()"
        aria-label="Enviar"
        @click="store.enviar()"
      >
        <q-icon name="send" size="20px" />
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAgenteChatStore } from '@/stores/agente/agente-chat.store'

const router = useRouter()
const store = useAgenteChatStore()

// ------------------------------------------------------------
// O `ref` do DOM precisa de ser ligado à store
// para o scroll automático funcionar.
// ------------------------------------------------------------
const scrollEl = ref<HTMLElement | null>(null)

onMounted(() => {
  store.scrollEl = scrollEl.value
})

function voltar() {
  router.back()
}
</script>

<style scoped lang="scss">
// ============================================================
// Chat — ocupa todo o espaço do .agente-content
// ============================================================
.agente-chat {
  display: flex;
  flex-direction: column;
  margin: -16px;
  height: calc(100vh - 60px);
  background: var(--sicam-surface-alt);
  overflow: hidden;
}

// ============================================================
// HEADER
// ============================================================
.agente-chat__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fff;
  border-bottom: 1px solid var(--sicam-line-soft);
  flex-shrink: 0;

  &-body {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 15px;
      font-weight: 700;
      color: var(--sicam-ink);
    }

    small {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: var(--sicam-muted);
      margin-top: 1px;
    }
  }
}

.agente-chat__back,
.agente-chat__menu {
  background: none;
  border: 0;
  padding: 6px;
  cursor: pointer;
  color: var(--sicam-ink);
  border-radius: 8px;
  display: grid;
  place-items: center;

  &:active { background: var(--sicam-surface-hover); }
}

.agente-chat__dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--sicam-success);
}

// ============================================================
// BODY
// ============================================================
.agente-chat__body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.agente-msg {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 84%;

  &--bot {
    align-self: flex-start;
    align-items: flex-start;
  }

  &--user {
    align-self: flex-end;
    align-items: flex-end;
  }

  &__bubble {
    background: #fff;
    border-radius: 14px;
    padding: 10px 13px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    border: 1px solid var(--sicam-line-soft);

    .agente-msg--user & {
      background: var(--sicam-primary-light);
      color: #fff;
      border-color: transparent;
    }
  }

  &__text {
    margin: 0;
    font-size: 14px;
    line-height: 1.45;
    white-space: pre-line;
  }

  &__hora {
    font-size: 10px;
    color: var(--sicam-muted);
    padding: 0 4px;
  }
}

// ============================================================
// Indicador a escrever
// ============================================================
.agente-msg__bubble--typing {
  display: flex;
  gap: 4px;
  padding: 12px 14px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--sicam-line-strong);
    animation: agente-typing 1.2s infinite ease-in-out;

    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
}

@keyframes agente-typing {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30%           { opacity: 1;   transform: translateY(-3px); }
}

// ============================================================
// Sugestões
// ============================================================
.agente-chat__sugestoes {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  overflow-x: auto;
  background: #fff;
  border-top: 1px solid var(--sicam-line-soft);
  flex-shrink: 0;

  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.agente-sugestao {
  flex-shrink: 0;
  background: var(--sicam-surface-alt);
  border: 1px solid var(--sicam-line);
  border-radius: 99px;
  padding: 7px 14px;
  font-size: 13px;
  color: var(--sicam-ink);
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: background var(--sicam-transition-fast);

  &:active {
    background: var(--sicam-primary-bg);
    border-color: var(--sicam-primary-light);
    color: var(--sicam-primary);
  }
}

// ============================================================
// Input
// ============================================================
.agente-chat__input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
  border-top: 1px solid var(--sicam-line-soft);
  flex-shrink: 0;
}

.agente-chat__field {
  flex: 1;
  background: var(--sicam-surface-alt);
  border: 1px solid var(--sicam-line-soft);
  border-radius: 99px;
  padding: 10px 16px;
  font-size: 14px;
  font-family: inherit;
  color: var(--sicam-ink);
  outline: 0;

  &::placeholder { color: var(--sicam-muted); }

  &:focus { border-color: var(--sicam-primary-light); }
}

.agente-chat__send {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--sicam-primary-light);
  color: #fff;
  border: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--sicam-transition-fast);

  &:active { background: var(--sicam-primary); }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--sicam-line);
  }
}
</style>