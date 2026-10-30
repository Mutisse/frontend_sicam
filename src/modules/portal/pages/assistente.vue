<template>
  <div class="portal-assistente">
    <header class="portal-assistente__head">
      <div>
        <h1 class="portal-assistente__title">Assistente IA</h1>
        <p class="portal-assistente__sub">
          Faça perguntas sobre carta, veículo, multas, seguro ou inspecção
        </p>
      </div>

      <button
        v-if="store.mensagens.length > 1"
        type="button"
        class="portal-assistente__reset"
        :disabled="store.carregando"
        @click="store.novaConversa()"
      >
        <q-icon name="add_comment" size="18px" />
        Nova conversa
      </button>
    </header>

    <!-- CHAT -->
    <div class="portal-chat">
      <!-- Barra do assistente -->
      <div class="portal-chat__bar">
        <div class="portal-chat__bar-avatar">
          <svg viewBox="0 0 40 40" width="26" height="26" aria-hidden="true">
            <path
              d="M5 20c5.5-8 10.5-11 15-11s9.5 3 15 11c-5.5 8-10.5 11-15 11S10.5 28 5 20z"
              fill="#facc15"
            />
            <circle cx="20" cy="20" r="6.5" fill="#064e3b" />
            <circle cx="20" cy="20" r="2.6" fill="#fff" />
          </svg>
        </div>
        <div class="portal-chat__bar-info">
          <b>Assistente SICAM</b>
          <span><i class="portal-chat__dot" /> Disponível</span>
        </div>
      </div>

      <div
        ref="messagesEl"
        class="portal-chat__messages"
        role="log"
        aria-live="polite"
        aria-label="Conversa com o assistente"
      >
        <div
          v-for="(msg, i) in store.mensagens"
          :key="i"
          class="portal-chat__row"
          :class="`portal-chat__row--${msg.tipo}`"
        >
          <div
            v-if="msg.tipo === 'bot'"
            class="portal-chat__avatar"
            aria-hidden="true"
          >
            <q-icon name="smart_toy" size="18px" />
          </div>

          <div class="portal-chat__col">
            <div
              class="portal-chat__bubble"
              :class="`portal-chat__bubble--${msg.tipo}`"
            >
              {{ msg.texto }}
            </div>
            <time class="portal-chat__hora">{{ msg.hora }}</time>
          </div>
        </div>

        <div v-if="store.carregando" class="portal-chat__row portal-chat__row--bot">
          <div class="portal-chat__avatar" aria-hidden="true">
            <q-icon name="smart_toy" size="18px" />
          </div>
          <div
            class="portal-chat__bubble portal-chat__bubble--bot portal-chat__bubble--typing"
            aria-label="O assistente está a escrever"
          >
            <span /><span /><span />
          </div>
        </div>
      </div>

      <!-- Sugestões -->
      <div v-if="store.mensagens.length <= 1" class="portal-chat__sug">
        <button
          v-for="s in store.sugestoes"
          :key="s.texto"
          type="button"
          class="portal-chat__sug-item"
          @click="store.enviar(s.texto)"
        >
          <q-icon :name="s.icon" size="18px" />
          {{ s.texto }}
        </button>
      </div>

      <!-- Input -->
      <form class="portal-chat__input" @submit.prevent="store.enviar()">
        <input
          ref="inputEl"
          v-model="store.pergunta"
          type="text"
          maxlength="300"
          autocomplete="off"
          placeholder="Escreva a sua pergunta"
          aria-label="Escreva a sua pergunta"
          class="portal-chat__input-field"
        />
        <button
          type="submit"
          class="portal-chat__send"
          aria-label="Enviar pergunta"
          :disabled="!store.pergunta.trim() || store.carregando"
        >
          <q-icon name="send" size="20px" />
        </button>
      </form>

      <p class="portal-chat__aviso">
        <q-icon name="info" size="14px" />
        As respostas são informativas. Para casos específicos, confirme no posto mais próximo.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { usePortalAssistenteStore } from '@/stores/portal/assistente.store'

const store = usePortalAssistenteStore()

// ------------------------------------------------------------
// refs do DOM ligados à store
// ------------------------------------------------------------
const messagesEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

onMounted(() => {
  store.messagesEl = messagesEl.value
  store.inputEl = inputEl.value
  inputEl.value?.focus()
})

watch(messagesEl, (el) => {
  store.messagesEl = el
})
watch(inputEl, (el) => {
  store.inputEl = el
})
</script>

<style scoped lang="scss">
.portal-assistente {
  --a-ink: var(--sicam-ink, #0f172a);
  --a-muted: var(--sicam-muted, #64748b);
  --a-line: var(--p-line, #e5ebe8);

  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 230px);
  height: calc(100dvh - 230px);
  min-height: 520px;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  &__title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--a-ink);
    margin: 0 0 4px;
  }

  &__sub { font-size: 14px; color: var(--a-muted); margin: 0; }

  &__reset {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    background: #fff;
    border: 1px solid var(--a-line);
    border-radius: 99px;
    padding: 8px 14px 8px 10px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    color: #334155;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;

    &:hover:not(:disabled) { background: #ecfdf5; border-color: #a7e3c8; color: #065f46; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:focus-visible { outline: 3px solid #10b981; outline-offset: 2px; }

    @media (max-width: 520px) { font-size: 0; gap: 0; padding: 9px; }
  }
}

.portal-chat {
  flex: 1;
  min-height: 0;
  background: #fff;
  border: 1px solid var(--a-line);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // Barra do assistente
  &__bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: linear-gradient(150deg, #065f46 0%, #04261d 100%);
    color: #fff;
    flex-shrink: 0;
  }

  &__bar-avatar {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: rgba(255, 255, 255, 0.12);
  }

  &__bar-info {
    display: flex;
    flex-direction: column;
    line-height: 1.25;

    b { font-size: 15px; }
    span { font-size: 12px; color: #bfe6d6; display: inline-flex; align-items: center; gap: 6px; }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #34d399;
    display: inline-block;
  }

  // Mensagens
  &__messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #f8fbf9;

    @media (max-width: 520px) { padding: 14px; }
  }

  &__row {
    display: flex;
    align-items: flex-end;
    gap: 10px;

    &--bot { justify-content: flex-start; }
    &--user { justify-content: flex-end; }
  }

  &__avatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #ecfdf5;
    color: #065f46;
    margin-bottom: 18px;
  }

  &__col {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    min-width: 0;

    .portal-chat__row--user & { align-items: flex-end; }
  }

  &__hora {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 4px;
    padding: 0 4px;
    font-variant-numeric: tabular-nums;
  }

  &__bubble {
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-line;
    overflow-wrap: anywhere;

    &--bot {
      background: #fff;
      border: 1px solid var(--a-line);
      color: var(--a-ink);
      border-bottom-left-radius: 6px;
    }

    &--user {
      background: #064e3b;
      color: #fff;
      border-bottom-right-radius: 6px;
    }

    &--typing {
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 16px 18px;
      margin-bottom: 18px;

      span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #10b981;
        animation: bounce 1.2s infinite;

        &:nth-child(2) { animation-delay: 0.15s; }
        &:nth-child(3) { animation-delay: 0.3s; }
      }
    }
  }

  // Sugestões
  &__sug {
    padding: 14px 20px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    border-top: 1px solid var(--a-line);
    background: #fff;
    flex-shrink: 0;

    @media (max-width: 520px) { grid-template-columns: 1fr; padding: 12px 14px; }
  }

  &__sug-item {
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    background: #fff;
    border: 1px solid var(--a-line);
    border-radius: 14px;
    padding: 11px 14px;
    font-size: 13px;
    color: #064e3b;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s, border-color 0.15s;

    .q-icon { color: #10b981; flex-shrink: 0; }

    &:hover { background: #ecfdf5; border-color: #a7e3c8; }
    &:focus-visible { outline: 3px solid #10b981; outline-offset: 2px; }
  }

  // Input
  &__input {
    display: flex;
    gap: 8px;
    padding: 12px 16px 6px;
    background: #fff;
    border-top: 1px solid var(--a-line);
    flex-shrink: 0;
  }

  &__input-field {
    flex: 1;
    min-width: 0;
    border: 1px solid #d5dfda;
    border-radius: 99px;
    padding: 12px 18px;
    font-size: 14px;
    font-family: inherit;
    color: var(--a-ink);
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:focus {
      outline: 0;
      border-color: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    }
    &::placeholder { color: #94a3b8; }
  }

  &__send {
    background: #facc15;
    color: #3b2f00;
    border: 0;
    border-radius: 50%;
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, transform 0.1s;

    &:hover:not(:disabled) { background: #fde047; }
    &:active:not(:disabled) { transform: scale(0.94); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &:focus-visible { outline: 3px solid #10b981; outline-offset: 2px; }
  }

  &__aviso {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 0;
    padding: 4px 16px 12px;
    font-size: 12px;
    color: #94a3b8;
    text-align: center;
    background: #fff;
    flex-shrink: 0;
  }
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

@media (prefers-reduced-motion: reduce) {
  .portal-chat__bubble--typing span { animation: none; }
}
</style>