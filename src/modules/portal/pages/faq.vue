<template>
  <div class="portal-faq">
    <!-- CABEÇALHO -->
    <header class="portal-faq__head">
      <h1 class="portal-faq__title">Leis e perguntas frequentes</h1>
      <p class="portal-faq__sub">
        Respostas rápidas sobre código de estrada, multas e documentação
      </p>
    </header>

    <!-- PESQUISA -->
    <label class="portal-search">
      <q-icon name="search" size="20px" class="portal-search__icon" />
      <input
        v-model="store.pesquisa"
        type="text"
        class="portal-search__input"
        placeholder="Pesquisar uma pergunta"
        aria-label="Pesquisar perguntas"
      />
      <button
        v-if="store.pesquisa"
        type="button"
        class="portal-search__clear"
        aria-label="Limpar pesquisa"
        @click="store.pesquisa = ''"
      >
        <q-icon name="close" size="16px" />
      </button>
    </label>

    <!-- CATEGORIAS -->
    <div
      class="portal-faq__cats"
      role="group"
      aria-label="Filtrar por categoria"
    >
      <button
        v-for="c in store.categoriasComContagem"
        :key="c.key"
        type="button"
        class="portal-faq__cat"
        :class="{ 'is-active': store.categoriaActiva === c.key }"
        :aria-pressed="store.categoriaActiva === c.key"
        @click="store.setCategoria(c.key)"
      >
        <q-icon :name="c.icon" size="16px" />
        {{ c.label }}
        <span class="portal-faq__cat-n">{{ c.n }}</span>
      </button>
    </div>

    <!-- LISTA -->
    <div class="portal-faq__list" aria-live="polite">
      <details
        v-for="item in store.filtrados"
        :key="item.pergunta"
        class="portal-faq-item"
      >
        <summary class="portal-faq-item__q">
          <span
            class="portal-faq-item__cat"
            :class="`portal-faq-item__cat--${item.cat}`"
          >
            <q-icon :name="store.iconeCategoria(item.cat)" size="18px" />
          </span>
          <span class="portal-faq-item__texto">{{ item.pergunta }}</span>
          <q-icon
            name="expand_more"
            size="22px"
            class="portal-faq-item__icon"
          />
        </summary>
        <div class="portal-faq-item__a">
          <p>{{ item.resposta }}</p>
        </div>
      </details>

      <div v-if="!store.filtrados.length" class="portal-faq__vazio">
        <div class="portal-faq__vazio-icon">
          <q-icon name="search_off" size="32px" />
        </div>
        <b>Nenhuma pergunta encontrada</b>
        <p>Tente outras palavras ou outra categoria.</p>
        <button
          type="button"
          class="portal-faq__vazio-btn"
          @click="store.limpar()"
        >
          Limpar filtros
        </button>
      </div>
    </div>

    <!-- AJUDA ADICIONAL -->
    <router-link to="/cidadao/assistente" class="portal-faq__ajuda">
      <div class="portal-faq__ajuda-icon">
        <q-icon name="chat" size="24px" />
      </div>
      <div class="portal-faq__ajuda-body">
        <b>Não encontrou a resposta?</b>
        <span>Pergunte ao Assistente IA em linguagem natural.</span>
      </div>
      <q-icon
        name="chevron_right"
        size="22px"
        class="portal-faq__ajuda-chevron"
      />
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { usePortalFaqStore } from '@/stores/portal/faq.store'

const store = usePortalFaqStore()
</script>

<style scoped lang="scss">
.portal-faq {
  --f-ink: var(--sicam-ink, #0f172a);
  --f-muted: var(--sicam-muted, #64748b);
  --f-line: var(--p-line, #e5ebe8);

  max-width: 840px;
  margin: 0 auto;

  &__head { margin-bottom: 20px; }

  &__title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--f-ink);
    margin: 0 0 6px;
  }

  &__sub { font-size: 14px; color: var(--f-muted); margin: 0; }

  // ------------------------------------------------------------
  // Categorias
  // ------------------------------------------------------------
  &__cats {
    display: flex;
    gap: 8px;
    margin: 14px 0 18px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;

    &::-webkit-scrollbar { display: none; }
  }

  &__cat {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
    background: #fff;
    border: 1px solid var(--f-line);
    border-radius: 99px;
    padding: 8px 8px 8px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    white-space: nowrap;
    font-family: inherit;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    &:hover { border-color: #a7e3c8; background: #ecfdf5; }
    &:focus-visible { outline: 3px solid #10b981; outline-offset: 2px; }

    &.is-active {
      background: #064e3b;
      border-color: #064e3b;
      color: #fff;

      .portal-faq__cat-n { background: rgba(255, 255, 255, 0.2); }
    }
  }

  &__cat-n {
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    display: inline-grid;
    place-items: center;
    border-radius: 99px;
    background: #eef2f0;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  // ------------------------------------------------------------
  // Lista
  // ------------------------------------------------------------
  &__list { display: flex; flex-direction: column; gap: 10px; }

  // ------------------------------------------------------------
  // Estado vazio
  // ------------------------------------------------------------
  &__vazio {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 44px 20px;
    background: #fff;
    border: 1px dashed #cfdad5;
    border-radius: 16px;

    b { font-size: 16px; color: var(--f-ink); margin-bottom: 4px; }
    p { margin: 0; font-size: 14px; color: var(--f-muted); }
  }

  &__vazio-icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #ecfdf5;
    color: #065f46;
    margin-bottom: 14px;
  }

  &__vazio-btn {
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

    &:hover { background: #047857; }
  }

  // ------------------------------------------------------------
  // Ajuda adicional
  // ------------------------------------------------------------
  &__ajuda {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 24px;
    padding: 18px 20px;
    background: linear-gradient(150deg, #065f46 0%, #04261d 100%);
    border-radius: 16px;
    color: #fff;
    text-decoration: none;
    box-shadow: 0 10px 26px rgba(6, 78, 59, 0.18);

    &:hover .portal-faq__ajuda-chevron { transform: translateX(3px); }
    &:focus-visible { outline: 3px solid #10b981; outline-offset: 3px; }
  }

  &__ajuda-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: #facc15;
    color: #3b2f00;
  }

  &__ajuda-body {
    flex: 1;
    min-width: 0;

    b { display: block; font-size: 16px; margin-bottom: 2px; }
    span { display: block; font-size: 13px; color: #bfe6d6; }
  }

  &__ajuda-chevron { color: #bfe6d6; transition: transform 0.15s; }
}

// ------------------------------------------------------------
// Pesquisa
// ------------------------------------------------------------
.portal-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--p-line, #e5ebe8);
  border-radius: 14px;
  padding: 0 12px 0 14px;
  height: 48px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  }

  &__icon { color: var(--sicam-muted, #64748b); flex-shrink: 0; }

  &__input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    background: transparent;
    font-size: 14px;
    font-family: inherit;
    color: var(--sicam-ink, #0f172a);

    &:focus { outline: 0; }
    &::placeholder { color: #94a3b8; }
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

    &:hover { background: #dde5e1; }
  }
}

// ------------------------------------------------------------
// Item FAQ (details/summary)
// ------------------------------------------------------------
.portal-faq-item {
  background: #fff;
  border: 1px solid var(--p-line, #e5ebe8);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover { border-color: #a7e3c8; }

  &[open] {
    border-color: #a7e3c8;
    box-shadow: 0 8px 22px rgba(6, 78, 59, 0.08);
  }

  &[open] .portal-faq-item__icon { transform: rotate(180deg); color: #065f46; }

  &__q {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    cursor: pointer;
    list-style: none;
    font-family: inherit;

    &::-webkit-details-marker { display: none; }
    &::marker { display: none; content: ''; }

    &:focus-visible {
      outline: 3px solid #10b981;
      outline-offset: -3px;
      border-radius: 16px;
    }
  }

  &__cat {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #ecfdf5;
    color: #065f46;
  }

  &__texto {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--sicam-ink, #0f172a);
  }

  &__icon {
    color: #94a3b8;
    transition: transform 0.2s, color 0.15s;
    flex-shrink: 0;
  }

  &__a {
    margin: 0 18px 18px 70px;
    padding: 2px 0 2px 16px;
    border-left: 3px solid #10b981;

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.7;
      color: var(--sicam-ink-soft, #475569);
      max-width: 62ch;
    }

    @media (max-width: 520px) { margin-left: 18px; }
  }
}

@media (prefers-reduced-motion: reduce) {
  .portal-faq-item__icon { transition: none; }
}
</style>