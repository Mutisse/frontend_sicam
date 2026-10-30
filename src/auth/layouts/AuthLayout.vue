<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="auth-container">
      <div class="auth-shell">
        <!-- ============================================================ -->
        <!-- PAINEL DA MARCA                                               -->
        <!-- ============================================================ -->
        <aside class="auth-brand">
          <svg class="auth-brand__deco" viewBox="0 0 600 600" aria-hidden="true">
            <circle cx="420" cy="300" r="80" />
            <circle cx="420" cy="300" r="150" />
            <circle cx="420" cy="300" r="220" />
            <circle cx="420" cy="300" r="290" />
            <circle cx="420" cy="300" r="360" />
          </svg>

          <div class="auth-brand__top">
            <div class="auth-brand__logo">
              <svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true">
                <defs>
                  <linearGradient id="auth-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#10b981" />
                    <stop offset="1" stop-color="#047857" />
                  </linearGradient>
                </defs>
                <rect width="40" height="40" rx="12" fill="url(#auth-g)" />
                <path
                  d="M5 20c5.5-8 10.5-11 15-11s9.5 3 15 11c-5.5 8-10.5 11-15 11S10.5 28 5 20z"
                  fill="#facc15"
                />
                <circle cx="20" cy="20" r="6.5" fill="#064e3b" />
                <circle cx="20" cy="20" r="2.6" fill="#fff" />
              </svg>
              <div class="auth-brand__name">
                <b>SICAM</b>
                <small>Olho de Águia</small>
              </div>
            </div>
          </div>

          <div class="auth-brand__main">
            <h1 class="auth-brand__title">
              Inteligência tático-policial para o trânsito em Moçambique
            </h1>
            <p class="auth-brand__text">
              Consulte veículos, detecte clonagens e registe autos num só sistema, ligado às
              entidades que gerem a informação.
            </p>

            <ul class="auth-brand__features">
              <li v-for="f in funcionalidades" :key="f.titulo">
                <span class="auth-brand__feature-icon">
                  <q-icon :name="f.icon" size="20px" />
                </span>
                <div>
                  <b>{{ f.titulo }}</b>
                  <small>{{ f.desc }}</small>
                </div>
              </li>
            </ul>
          </div>

          <p class="auth-brand__foot">© {{ ano }} SICAM. Todos os direitos reservados.</p>
        </aside>

        <!-- ============================================================ -->
        <!-- ÁREA DO FORMULÁRIO                                            -->
        <!-- ============================================================ -->
        <main class="auth-main">
  

          <div class="auth-main__content">
            <router-view v-slot="{ Component }">
              <transition name="auth-fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>

          <p class="auth-main__nota">
            <q-icon name="lock" size="14px" />
            Acesso restrito a utilizadores autorizados. Todos os acessos ficam registados.
          </p>
        </main>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Layout de autenticação: painel da marca + área do formulário (sem header/drawer)
const ano = new Date().getFullYear()

const funcionalidades = [
  {
    icon: 'search',
    titulo: 'Consulta integrada',
    desc: 'Dados de INATRO, PRM, multas e seguro em simultâneo',
  },
  {
    icon: 'gpp_maybe',
    titulo: 'Alertas de clonagem',
    desc: 'Comparação visual e verificação da hotlist',
  },
  {
    icon: 'fact_check',
    titulo: 'Auditoria completa',
    desc: 'Cada consulta fica registada e rastreável',
  },
]
</script>

<style scoped lang="scss">
.auth-container { padding: 0 !important; }

.auth-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(380px, 1.05fr) 1fr;
  background: var(--sicam-bg, #f4f8f6);
  font-family: var(--sicam-font-family, 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif);

  @media (max-width: 960px) { grid-template-columns: 1fr; }
}

// ============================================================
// Painel da marca
// ============================================================
.auth-brand {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
  padding: 40px 48px;
  background: linear-gradient(155deg, #065f46 0%, #064e3b 50%, #04261d 100%);
  color: #fff;

  @media (max-width: 960px) { display: none; }

  &__deco {
    position: absolute;
    right: -180px;
    top: 50%;
    width: 600px;
    height: 600px;
    transform: translateY(-50%);
    pointer-events: none;

    circle { fill: none; stroke: rgba(255, 255, 255, 0.06); stroke-width: 1.5; }
  }

  &__top,
  &__main,
  &__foot { position: relative; }

  &__logo { display: flex; align-items: center; gap: 12px; }

  &__name {
    display: flex;
    flex-direction: column;
    line-height: 1.15;

    b { font-size: 20px; font-weight: 800; letter-spacing: 0.02em; }
    small { font-size: 13px; color: #a9d9c5; }
  }

  &__title {
    font-size: 34px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin: 0 0 14px;
    max-width: 17ch;
    color: #fff;
  }

  &__text {
    font-size: 15px;
    line-height: 1.6;
    color: #bfe6d6;
    margin: 0 0 32px;
    max-width: 44ch;
  }

  &__features {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 16px;

    li { display: flex; align-items: center; gap: 14px; }

    b { display: block; font-size: 15px; font-weight: 600; }
    small { display: block; font-size: 13px; color: #a9d9c5; margin-top: 2px; }
  }

  &__feature-icon {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: rgba(250, 204, 21, 0.14);
    color: #facc15;
  }

  &__foot { margin: 0; font-size: 12px; color: #7fb9a2; }
}

// ============================================================
// Área do formulário
// ============================================================
.auth-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 24px;
  min-width: 0;

  &__mobile-brand {
    display: none;
    align-items: center;
    gap: 10px;

    b { display: block; font-size: 18px; font-weight: 800; color: #064e3b; letter-spacing: 0.02em; }
    small { display: block; font-size: 12px; color: var(--sicam-muted, #64748b); }

    @media (max-width: 960px) { display: flex; }
  }

  &__content {
    width: 100%;
    max-width: 440px;
  }

  &__nota {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 6px;
    max-width: 440px;
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
    color: var(--sicam-muted, #64748b);

    .q-icon { margin-top: 2px; color: #065f46; flex-shrink: 0; }
  }
}

// ============================================================
// Transição entre páginas de autenticação
// ============================================================
.auth-fade-enter-active,
.auth-fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.auth-fade-enter-from { opacity: 0; transform: translateY(8px); }
.auth-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .auth-fade-enter-active, .auth-fade-leave-active { transition: none; }
}
</style>