<template>
  <div class="portal-noticias">
    <!-- CABEÇALHO -->
    <header class="portal-noticias__head">
      <h1 class="portal-noticias__title">Notícias</h1>
      <p class="portal-noticias__sub">
        Campanhas, avisos e actualizações do sector de trânsito
      </p>
    </header>

    <!-- FILTROS POR CATEGORIA -->
    <div class="portal-chips" role="group" aria-label="Filtrar por categoria">
      <button
        v-for="c in store.categorias"
        :key="c.valor"
        type="button"
        class="portal-chip"
        :class="{ 'portal-chip--active': store.filtro === c.valor }"
        :aria-pressed="store.filtro === c.valor"
        @click="store.setFiltro(c.valor)"
      >
        <q-icon v-if="c.icon" :name="c.icon" size="16px" />
        {{ c.label }}
        <span class="portal-chip__n">{{ c.n }}</span>
      </button>
    </div>

    <!-- DESTAQUE -->
    <article
      v-if="store.destaque"
      class="destaque"
      :class="`destaque--${store.destaque.categoria}`"
    >
      <svg class="destaque__deco" viewBox="0 0 300 300" aria-hidden="true">
        <circle cx="230" cy="150" r="50" />
        <circle cx="230" cy="150" r="95" />
        <circle cx="230" cy="150" r="140" />
      </svg>

      <div class="destaque__icon">
        <q-icon :name="store.infoCategoria(store.destaque.categoria).icon" size="30px" />
      </div>

      <div class="destaque__body">
        <div class="destaque__meta">
          <span class="destaque__flag">Mais recente</span>
          <span class="destaque__cat">{{ store.destaque.categoriaLabel }}</span>
          <time class="destaque__date">{{ store.destaque.data }}</time>
        </div>
        <h2 class="destaque__title">{{ store.destaque.titulo }}</h2>
        <p class="destaque__resumo">{{ store.destaque.resumo }}</p>
      </div>
    </article>

    <!-- LISTA -->
    <ul v-if="store.restantes.length" class="portal-noticias__list">
      <li
        v-for="n in store.restantes"
        :key="n.id"
        class="portal-noticia"
        :class="`portal-noticia--${n.categoria}`"
      >
        <div class="portal-noticia__data" :aria-label="n.data">
          <strong>{{ store.partesData(n.data).dia }}</strong>
          <span>{{ store.partesData(n.data).mes }}</span>
          <small>{{ store.partesData(n.data).ano }}</small>
        </div>

        <div class="portal-noticia__body">
          <div class="portal-noticia__meta">
            <span
              class="portal-noticia__tag"
              :class="`portal-noticia__tag--${n.categoria}`"
            >
              <q-icon :name="store.infoCategoria(n.categoria).icon" size="14px" />
              {{ n.categoriaLabel }}
            </span>
          </div>
          <h2 class="portal-noticia__title">{{ n.titulo }}</h2>
          <p class="portal-noticia__resumo">{{ n.resumo }}</p>
        </div>
      </li>
    </ul>

    <!-- Estado vazio -->
    <div v-if="!store.filtradas.length" class="noticias-empty">
      <div class="noticias-empty__icon">
        <q-icon name="newspaper" size="32px" />
      </div>
      <b>Sem notícias nesta categoria</b>
      <p>Volte mais tarde ou veja todas as notícias.</p>
      <button
        type="button"
        class="noticias-empty__btn"
        @click="store.limparFiltro()"
      >
        Ver todas
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePortalNoticiasStore } from '@/stores/portal/noticias.store'

const store = usePortalNoticiasStore()
</script>

<style scoped lang="scss">
.portal-noticias {
  // Cores por categoria
  --c-inspeccao: #1d4ed8;
  --c-inspeccao-bg: #dbeafe;
  --c-seguro: #047857;
  --c-seguro-bg: #d1fae5;
  --c-multas: #b45309;
  --c-multas-bg: #fef3c7;
  --c-avisos: #6d28d9;
  --c-avisos-bg: #ede9fe;

  max-width: 840px;
  margin: 0 auto;

  &__head { margin-bottom: 20px; }

  &__title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sicam-ink, #0f172a);
    margin: 0 0 6px;
  }

  &__sub { font-size: 14px; color: var(--sicam-muted, #64748b); margin: 0; }

  &__list {
    list-style: none;
    padding: 0;
    margin: 16px 0 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

// ============================================================
// Chips
// ============================================================
.portal-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  margin-bottom: 18px;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
}

.portal-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  border: 1px solid var(--p-line, #e5ebe8);
  background: #fff;
  color: #334155;
  border-radius: 99px;
  padding: 8px 8px 8px 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover { border-color: #a7e3c8; background: #ecfdf5; }
  &:focus-visible { outline: 3px solid #10b981; outline-offset: 2px; }

  &__n {
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

  &--active {
    background: #064e3b;
    border-color: #064e3b;
    color: #fff;

    &:hover { background: #064e3b; }
    .portal-chip__n { background: rgba(255, 255, 255, 0.2); }
  }
}

// ============================================================
// Destaque
// ============================================================
.destaque {
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  background: linear-gradient(150deg, #065f46 0%, #064e3b 60%, #04261d 100%);
  color: #fff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 12px 30px rgba(6, 78, 59, 0.2);

  @media (max-width: 600px) { flex-direction: column; padding: 22px; gap: 14px; }

  &__deco {
    position: absolute;
    right: -50px;
    top: 50%;
    width: 300px;
    height: 300px;
    transform: translateY(-50%);
    pointer-events: none;

    circle { fill: none; stroke: rgba(255, 255, 255, 0.07); stroke-width: 1.5; }
  }

  &__icon {
    position: relative;
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 18px;
    background: #facc15;
    color: #3b2f00;
  }

  &__body { position: relative; min-width: 0; }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    margin-bottom: 12px;
  }

  &__flag {
    font-size: 12px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 99px;
    background: #facc15;
    color: #3b2f00;
  }

  &__cat { font-size: 13px; font-weight: 600; color: #d5f0e4; }
  &__date { font-size: 13px; color: #a9d9c5; }

  &__title {
    font-size: 24px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.01em;
    line-height: 1.25;
    margin: 0 0 10px;

    @media (max-width: 600px) { font-size: 20px; }
  }

  &__resumo {
    font-size: 15px;
    line-height: 1.6;
    color: #cfeadf;
    margin: 0;
    max-width: 60ch;
  }
}

// ============================================================
// Cartões
// ============================================================
.portal-noticia {
  display: flex;
  gap: 18px;
  background: #fff;
  border: 1px solid var(--p-line, #e5ebe8);
  border-radius: 16px;
  padding: 18px 20px;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover {
    border-color: #a7e3c8;
    box-shadow: 0 8px 22px rgba(6, 78, 59, 0.09);
  }

  @media (max-width: 520px) { flex-direction: column; gap: 12px; }

  // Data em formato de calendário
  &__data {
    width: 64px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    padding: 10px 0;
    border-radius: 14px;
    background: #ecfdf5;
    color: #065f46;
    line-height: 1.1;

    strong { font-size: 24px; font-weight: 800; }
    span { font-size: 13px; font-weight: 700; }
    small { font-size: 11px; opacity: 0.75; margin-top: 2px; }

    @media (max-width: 520px) {
      flex-direction: row;
      width: auto;
      gap: 6px;
      padding: 6px 12px;
      align-self: flex-start;

      strong { font-size: 16px; }
      small { margin-top: 0; }
    }
  }

  &__body { min-width: 0; flex: 1; }

  &__meta { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px 3px 8px;
    border-radius: 99px;

    &--inspeccao { background: var(--c-inspeccao-bg); color: var(--c-inspeccao); }
    &--seguro { background: var(--c-seguro-bg); color: var(--c-seguro); }
    &--multas { background: var(--c-multas-bg); color: var(--c-multas); }
    &--avisos { background: var(--c-avisos-bg); color: var(--c-avisos); }
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--sicam-ink, #0f172a);
    margin: 0 0 6px;
    line-height: 1.3;
  }

  &__resumo {
    font-size: 14px;
    color: var(--sicam-ink-soft, #475569);
    line-height: 1.6;
    margin: 0;
    max-width: 62ch;
  }
}

// ============================================================
// Estado vazio
// ============================================================
.noticias-empty {
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
    background: #ecfdf5;
    color: #065f46;
    margin-bottom: 14px;
  }

  b { font-size: 16px; color: var(--sicam-ink, #0f172a); margin-bottom: 4px; }
  p { margin: 0; color: var(--sicam-muted, #64748b); font-size: 14px; }

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

    &:hover { background: #047857; }
  }
}
</style>