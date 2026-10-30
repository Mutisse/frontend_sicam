<template>
  <div class="sicam-404">
    <!-- Anéis decorativos -->
    <svg class="sicam-404__deco" viewBox="0 0 800 800" aria-hidden="true">
      <circle cx="400" cy="400" r="120" />
      <circle cx="400" cy="400" r="210" />
      <circle cx="400" cy="400" r="300" />
      <circle cx="400" cy="400" r="390" />
    </svg>

    <main class="sicam-404__content">
      <!-- 4 [olho] 4 -->
      <div class="sicam-404__code" role="img" aria-label="Erro 404">
        <span class="sicam-404__digit" aria-hidden="true">4</span>

        <svg class="sicam-404__eye" viewBox="0 0 40 40" aria-hidden="true">
          <path
            d="M2 20c6.500-10 12.500-13.500 18-13.500S31.500 10 38 20c-6.500 10-12.500 13.500-18 13.500S8.500 30 2 20z"
            fill="#facc15"
          />
          <g class="sicam-404__pupil">
            <circle cx="20" cy="20" r="7.500" fill="#064e3b" />
            <circle cx="20" cy="20" r="3" fill="#fff" />
          </g>
        </svg>

        <span class="sicam-404__digit" aria-hidden="true">4</span>
      </div>

      <h1 class="sicam-404__title">Página não encontrada</h1>
      <p class="sicam-404__text">
        A página que procura não existe ou foi movida. Verifique o endereço ou volte ao início.
      </p>

      <div class="sicam-404__actions">
        <button type="button" class="sicam-404__btn sicam-404__btn--primary" @click="irParaLogin">
          <q-icon name="login" size="18px" />
          Voltar ao login
        </button>

        <button type="button" class="sicam-404__btn sicam-404__btn--ghost" @click="voltarAtras">
          <q-icon name="arrow_back" size="18px" />
          Voltar atrás
        </button>
      </div>

      <router-link to="/cidadao/portal" class="sicam-404__link">
        <q-icon name="travel_explore" size="18px" />
        Consultar como cidadão
      </router-link>
    </main>

    <p class="sicam-404__footer">
      SICAM, Sistema Integrado de Inteligência Tático-Policial Veicular
    </p>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function irParaLogin() {
  router.push('/login')
}

function voltarAtras() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
// ============================================================
// Página 404 SICAM
// ============================================================
.sicam-404 {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 32px 24px;
  background: radial-gradient(ellipse at 50% 35%, #ffffff 0%, var(--sicam-bg, #f4f8f6) 70%);
  font-family: var(--sicam-font-family, 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif);

  &__deco {
    position: absolute;
    left: 50%;
    top: 42%;
    width: 900px;
    height: 900px;
    transform: translate(-50%, -50%);
    pointer-events: none;

    circle { fill: none; stroke: rgba(6, 95, 70, 0.08); stroke-width: 1.5; }
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 480px;
  }

  // ------------------------------------------------------------
  // 4 [olho] 4
  // ------------------------------------------------------------
  &__code {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 20px;
  }

  &__digit {
    font-size: 132px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #064e3b;
    font-variant-numeric: tabular-nums;

    @media (max-width: 480px) { font-size: 92px; }
  }

  &__eye {
    width: 128px;
    height: 128px;
    flex-shrink: 0;

    @media (max-width: 480px) { width: 88px; height: 88px; }
  }

  // A pupila olha para os lados uma vez ao carregar
  &__pupil {
    transform-box: fill-box;
    transform-origin: center;
    animation: olhar 2.4s ease-in-out 0.4s 1 both;
  }

  // ------------------------------------------------------------
  // Texto
  // ------------------------------------------------------------
  &__title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sicam-ink, #0f172a);
    margin: 0 0 10px;

    @media (max-width: 480px) { font-size: 24px; }
  }

  &__text {
    font-size: 15px;
    line-height: 1.6;
    color: var(--sicam-muted, #64748b);
    margin: 0 0 28px;
    max-width: 40ch;
  }

  // ------------------------------------------------------------
  // Acções
  // ------------------------------------------------------------
  &__actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 22px;
    border-radius: 14px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 700;
    border: 0;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;

    &:active { transform: scale(0.98); }
    &:focus-visible { outline: 3px solid #10b981; outline-offset: 2px; }

    &--primary {
      background: #064e3b;
      color: #fff;

      &:hover { background: #047857; }
    }

    &--ghost {
      background: #fff;
      color: #064e3b;
      border: 1px solid #d5dfda;

      &:hover { background: #ecfdf5; border-color: #a7e3c8; }
    }

    @media (max-width: 480px) { width: 100%; }
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #065f46;
    text-decoration: none;
    padding: 6px 10px;
    border-radius: 8px;

    &:hover { text-decoration: underline; }
    &:focus-visible { outline: 3px solid #10b981; outline-offset: 2px; }
  }

  &__footer {
    position: relative;
    margin: 0;
    font-size: 12px;
    color: var(--sicam-muted, #64748b);
    text-align: center;
    max-width: 44ch;
  }
}

@keyframes olhar {
  0%   { transform: translateX(0); }
  25%  { transform: translateX(-5px); }
  60%  { transform: translateX(5px); }
  100% { transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .sicam-404__pupil { animation: none; }
}
</style>