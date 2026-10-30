<template>
  <q-page class="int-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="int-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-resumo" />
      <div class="sk-grid">
        <div v-for="i in 4" :key="`sk-card-${i}`" class="sk-card" />
      </div>
      <div class="sk-perf" />
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Integrações</h1>
          <p class="page-head__sub">
            Estado dos conectores das entidades parceiras
          </p>
        </div>

        <div class="page-head__actions">
          <span class="page-head__stamp">
            <q-icon name="schedule" size="16px" />
            Actualizado às {{ store.ultimaActualizacao }}
          </span>

          <button
            type="button"
            class="page-btn"
            :disabled="store.carregando"
            @click="store.carregar"
          >
            <q-icon
              name="refresh"
              size="18px"
              :class="{ spinning: store.carregando }"
            />
            {{ store.carregando ? 'A actualizar' : 'Actualizar' }}
          </button>
        </div>
      </header>

      <!-- RESUMO GERAL -->
      <section
        class="resumo"
        :class="`resumo--${store.estadoGeral}`"
        role="status"
        aria-live="polite"
      >
        <svg class="resumo__deco" viewBox="0 0 300 300" aria-hidden="true">
          <circle cx="230" cy="150" r="50" />
          <circle cx="230" cy="150" r="95" />
          <circle cx="230" cy="150" r="140" />
        </svg>

        <div class="resumo__icon">
          <q-icon :name="store.iconeGeral" size="30px" />
        </div>

        <div class="resumo__body">
          <h2 class="resumo__title">{{ store.tituloGeral }}</h2>
          <p class="resumo__text">{{ store.textoGeral }}</p>
        </div>

        <ul class="resumo__chips" aria-label="Resumo por estado">
          <li class="resumo__chip">
            <i class="resumo__dot resumo__dot--regular" />
            <b>{{ store.contagem.regular }}</b>
            Operacionais
          </li>
          <li class="resumo__chip">
            <i class="resumo__dot resumo__dot--atencao" />
            <b>{{ store.contagem.atencao }}</b>
            Degradadas
          </li>
          <li class="resumo__chip">
            <i class="resumo__dot resumo__dot--critico" />
            <b>{{ store.contagem.critico }}</b>
            Críticas
          </li>
        </ul>
      </section>

      <!-- CONECTORES -->
      <section class="int-grid" aria-label="Conectores">
        <article
          v-for="i in store.integracoes"
          :key="i.nome"
          class="int-card"
          :class="`int-card--${i.estado}`"
        >
          <header class="int-card__head">
            <div class="int-card__icon" :class="`int-card__icon--${i.estado}`">
              <q-icon :name="i.icon" size="22px" />
            </div>

            <span
              class="int-card__status"
              :class="`int-card__status--${i.estado}`"
            >
              <i class="int-card__dot" />
              {{ store.labelEstado(i.estado) }}
            </span>
          </header>

          <h3 class="int-card__name">{{ i.nome }}</h3>
          <p class="int-card__desc">{{ i.descricao }}</p>

          <div class="int-card__lat">
            <span class="int-card__lat-value">
              {{ i.latencia }}<small>ms</small>
            </span>
            <span class="int-card__lat-label">latência</span>
          </div>

          <!-- Barra de latência com marca da meta -->
          <div
            class="bar"
            role="img"
            :aria-label="`Latência ${i.latencia} ms, meta ${store.META_MS} ms`"
          >
            <span
              class="bar__fill"
              :class="`bar__fill--${i.estado}`"
              :style="{ width: store.larguraBarra(i.latencia) + '%' }"
            />
            <span
              class="bar__meta"
              :style="{ left: (store.META_MS / store.ESCALA_MS) * 100 + '%' }"
            />
          </div>
          <div class="bar__legenda">
            <span>0</span>
            <span
              class="bar__legenda-meta"
              :style="{ left: (store.META_MS / store.ESCALA_MS) * 100 + '%' }"
            >
              meta {{ store.META_MS }} ms
            </span>
          </div>

          <footer class="int-card__foot">
            <q-icon name="history" size="14px" />
            {{ i.ultimaResposta }}
          </footer>
        </article>
      </section>

      <!-- DESEMPENHO -->
      <section class="perf-card">
        <header class="perf-card__head">
          <h2 class="perf-card__title">Desempenho das consultas</h2>
          <span class="perf-card__periodo">Últimos 30 dias</span>
        </header>

        <div class="perf-grid">
          <article v-for="p in store.desempenho" :key="p.label" class="perf">
            <div class="perf__top">
              <span class="perf__icon">
                <q-icon :name="p.icon" size="20px" />
              </span>
              <span class="perf__label">{{ p.label }}</span>
            </div>

            <div class="perf__value">{{ p.valor }}</div>
            <div class="perf__sub">{{ p.sub }}</div>

            <div
              class="perf__bar"
              role="img"
              :aria-label="`${p.label}: ${p.valor}`"
            >
              <span
                class="perf__fill"
                :class="`perf__fill--${p.tom}`"
                :style="{ width: p.barra + '%' }"
              />
            </div>
          </article>
        </div>
      </section>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminIntegracoesStore } from '@/stores/admin/integracoes.store'

const store = useAdminIntegracoesStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})
</script>

<style scoped lang="scss">
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

.int-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 0;
}

.sk-head {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .sk-title {
    @extend %sk-block;
    height: 30px;
    width: 320px;
    max-width: 60%;
  }
  .sk-sub {
    @extend %sk-block;
    height: 16px;
    width: 420px;
    max-width: 80%;
  }
}

.sk-resumo {
  @extend %sk-block;
  height: 130px;
  border-radius: 20px;
}

.sk-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
}

.sk-card {
  @extend %sk-block;
  height: 240px;
  border-radius: 18px;
}

.sk-perf {
  @extend %sk-block;
  height: 220px;
  border-radius: 20px;
}

/* ============================================================ */
/* Página                                                       */
/* ============================================================ */
.int-page {
  --i-ink: var(--sicam-ink, #0f172a);
  --i-muted: var(--sicam-muted, #64748b);
  --i-line: var(--sicam-line, #e5ebe8);

  --i-ok: #059669;
  --i-ok-bg: var(--sicam-success-bg, #ecfdf5);
  --i-ok-ink: var(--sicam-success-ink, #065f46);
  --i-warn: #f59e0b;
  --i-warn-bg: var(--sicam-warning-bg, #fffbeb);
  --i-warn-ink: var(--sicam-warning-ink, #92400e);
  --i-bad: #dc2626;
  --i-bad-bg: var(--sicam-critical-bg, #fef2f2);
  --i-bad-ink: var(--sicam-critical-ink, #991b1b);

  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

/* ============================================================ */
/* Cabeçalho                                                    */
/* ============================================================ */
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;

  @media (max-width: 700px) {
    flex-direction: column;
  }

  &__title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--i-ink);
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 14px;
    color: var(--i-muted);
    margin: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__stamp {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--i-muted);
    font-variant-numeric: tabular-nums;
  }
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #064e3b;
  border: 0;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: #047857;
  }
  &:disabled {
    opacity: 0.7;
    cursor: progress;
  }
  &:focus-visible {
    outline: 3px solid #10b981;
    outline-offset: 2px;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================ */
/* Resumo geral                                                 */
/* ============================================================ */
.resumo {
  --r-accent: #34d399;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 18px;
  background: linear-gradient(150deg, #065f46 0%, #064e3b 55%, #04261d 100%);
  color: #fff;
  border-radius: 20px;
  padding: 24px 28px;
  margin-bottom: 18px;
  box-shadow: 0 12px 30px rgba(6, 78, 59, 0.2);

  @media (max-width: 800px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  &--atencao {
    --r-accent: #fbbf24;
  }
  &--critico {
    --r-accent: #f87171;
  }

  &__deco {
    position: absolute;
    right: -40px;
    top: 50%;
    width: 300px;
    height: 300px;
    transform: translateY(-50%);
    pointer-events: none;

    circle {
      fill: none;
      stroke: rgba(255, 255, 255, 0.07);
      stroke-width: 1.5;
    }
  }

  &__icon {
    position: relative;
    width: 58px;
    height: 58px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--r-accent);
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.05);
  }

  &__body {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 20px;
    font-weight: 800;
    margin: 0 0 4px;
    color: #fff;
  }
  &__text {
    font-size: 14px;
    color: #bfe6d6;
    margin: 0;
    line-height: 1.5;
  }

  &__chips {
    position: relative;
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 12px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.1);
    font-size: 13px;
    color: #d5f0e4;

    b {
      color: #fff;
      font-variant-numeric: tabular-nums;
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--regular {
      background: #34d399;
    }
    &--atencao {
      background: #fbbf24;
    }
    &--critico {
      background: #f87171;
    }
  }
}

/* ============================================================ */
/* Cards de integrações                                         */
/* ============================================================ */
.int-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
}

.int-card {
  background: #fff;
  border: 1px solid var(--i-line);
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover {
    box-shadow: 0 10px 26px rgba(6, 78, 59, 0.09);
    border-color: #a7e3c8;
  }

  &--atencao {
    border-color: #fde68a;
    &:hover {
      border-color: #fcd34d;
    }
  }
  &--critico {
    border-color: #fecaca;
    &:hover {
      border-color: #fca5a5;
    }
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 14px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 13px;

    &--regular {
      background: var(--i-ok-bg);
      color: var(--i-ok-ink);
    }
    &--atencao {
      background: var(--i-warn-bg);
      color: var(--i-warn-ink);
    }
    &--critico {
      background: var(--i-bad-bg);
      color: var(--i-bad-ink);
    }
  }

  &__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 99px;

    &--regular {
      background: var(--i-ok-bg);
      color: var(--i-ok-ink);
    }
    &--atencao {
      background: var(--i-warn-bg);
      color: var(--i-warn-ink);
    }
    &--critico {
      background: var(--i-bad-bg);
      color: var(--i-bad-ink);
    }
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &__name {
    font-size: 16px;
    font-weight: 700;
    color: var(--i-ink);
    margin: 0 0 4px;
  }

  &__desc {
    font-size: 13px;
    color: var(--i-muted);
    margin: 0 0 16px;
    line-height: 1.4;
  }

  &__lat {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__lat-value {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--i-ink);
    line-height: 1;
    font-variant-numeric: tabular-nums;

    small {
      font-size: 14px;
      font-weight: 600;
      color: var(--i-muted);
      margin-left: 3px;
      letter-spacing: 0;
    }
  }

  &__lat-label {
    font-size: 12px;
    color: var(--i-muted);
  }

  &__foot {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--i-muted);
    border-top: 1px solid var(--sicam-line-soft, #eef2f0);
    padding-top: 12px;
    margin-top: auto;
  }
}

/* Barra de latência */
.bar {
  position: relative;
  height: 8px;
  border-radius: 99px;
  background: #eef2f0;
  overflow: visible;

  &__fill {
    display: block;
    height: 100%;
    border-radius: 99px;
    transition: width 0.4s ease;

    &--regular {
      background: var(--i-ok);
    }
    &--atencao {
      background: var(--i-warn);
    }
    &--critico {
      background: var(--i-bad);
    }
  }

  &__meta {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 2px;
    border-radius: 2px;
    background: #064e3b;
    transform: translateX(-1px);
  }

  &__legenda {
    position: relative;
    display: flex;
    height: 16px;
    margin: 6px 0 14px;
    font-size: 11px;
    color: var(--i-muted);
  }

  &__legenda-meta {
    position: absolute;
    transform: translateX(-50%);
    white-space: nowrap;
    color: #064e3b;
    font-weight: 600;
  }
}

/* ============================================================ */
/* Desempenho                                                   */
/* ============================================================ */
.perf-card {
  background: #fff;
  border: 1px solid var(--i-line);
  border-radius: 20px;
  padding: 22px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--i-ink);
    margin: 0;
  }

  &__periodo {
    font-size: 12px;
    font-weight: 600;
    color: #065f46;
    background: #ecfdf5;
    padding: 4px 12px;
    border-radius: 99px;
  }
}

.perf-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.perf {
  padding: 16px;
  border-radius: 16px;
  background: #f6f9f8;

  &__top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  &__icon {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #fff;
    color: #065f46;
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  &__value {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--i-ink);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  &__sub {
    font-size: 12px;
    color: var(--i-muted);
    margin: 6px 0 12px;
  }

  &__bar {
    height: 6px;
    border-radius: 99px;
    background: #e2e9e6;
    overflow: hidden;
  }

  &__fill {
    display: block;
    height: 100%;
    border-radius: 99px;

    &--regular {
      background: var(--i-ok);
    }
    &--atencao {
      background: var(--i-warn);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-btn .spinning {
    animation: none;
  }
  .bar__fill {
    transition: none;
  }
}
</style>