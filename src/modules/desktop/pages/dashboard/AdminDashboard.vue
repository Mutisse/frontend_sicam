<template>
  <q-page class="admin-dash">
    <!-- ============================================================ -->
    <!-- SKELETON — enquanto carrega pela primeira vez                -->
    <!-- ============================================================ -->
    <div
      v-if="store.carregando && !store.totalVeiculos"
      class="admin-dash__skeleton"
    >
      <div class="skeleton-head">
        <AppFbLoader variant="text" :lines="2" />
      </div>

      <div class="skeleton-alertas">
        <AppFbLoader variant="list" :items="2" />
      </div>

      <div class="skeleton-kpis">
        <AppFbLoader variant="list" :items="5" />
      </div>

      <div class="skeleton-cols">
        <AppFbLoader variant="block" height="320px" />
        <AppFbLoader variant="block" height="320px" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO REAL                                                 -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="dash-head">
        <div>
          <h1 class="dash-head__title">
            {{ store.saudacao }}, {{ store.nomeCurto }}
          </h1>
          <p class="dash-head__sub">
            Eis o que precisa de atenção neste momento.
          </p>
        </div>

        <div class="dash-head__actions">
          <span class="dash-head__stamp">
            <q-icon name="event" size="16px" />
            {{ store.dataHoje }}
          </span>

          <button
            type="button"
            class="dash-btn"
            :disabled="store.carregando"
            aria-label="Actualizar dados"
            @click="store.carregar()"
          >
            <q-icon
              name="refresh"
              size="18px"
              :class="{ spinning: store.carregando }"
            />
            {{ store.carregando ? "A actualizar" : "Actualizar" }}
          </button>
        </div>
      </header>

      <!-- ALERTAS -->
      <section class="alertas" aria-label="Alertas">
        <div class="alerta">
          <span class="alerta__icon">
            <q-icon name="sync_problem" size="20px" />
          </span>
          <div class="alerta__body">
            <b>{{ store.semSincronizar }} dispositivos</b>
            <small>sem sincronizar</small>
          </div>
        </div>

        <div class="alerta alerta--warn">
          <span class="alerta__icon">
            <q-icon name="wifi_off" size="20px" />
          </span>
          <div class="alerta__body">
            <b>{{ store.agentesOffline }} agentes</b>
            <small>offline</small>
          </div>
        </div>
      </section>

      <!-- KPIs -->
      <section class="kpis" aria-label="Indicadores">
        <article class="kpi kpi--total">
          <div class="kpi__icon">
            <q-icon name="directions_car" size="22px" />
          </div>
          <div class="kpi__value">{{ store.totalVeiculos }}</div>
          <div class="kpi__label">Veículos</div>
          <div class="kpi__sub">monitorizados</div>
        </article>

        <article
          v-for="k in store.kpis"
          :key="k.key"
          class="kpi"
          :class="`kpi--${k.key}`"
        >
          <div class="kpi__icon">
            <q-icon :name="k.icon" size="22px" />
          </div>
          <div class="kpi__value">{{ k.valor }}</div>
          <div class="kpi__label">{{ k.label }}</div>
          <div class="kpi__sub">{{ store.percentagem(k.valor) }}% do total</div>
        </article>
      </section>

      <!-- Distribuição -->
      <section class="dist" aria-label="Distribuição por estado">
        <div
          class="dist__bar"
          role="img"
          :aria-label="store.descricaoDistribuicao"
        >
          <span
            v-for="k in store.kpis"
            :key="k.key"
            class="dist__seg"
            :class="`dist__seg--${k.key}`"
            :style="{ width: store.percentagem(k.valor) + '%' }"
          />
        </div>
        <ul class="dist__legenda">
          <li v-for="k in store.kpis" :key="k.key">
            <i class="dist__dot" :class="`dist__dot--${k.key}`" />
            {{ k.label }}
          </li>
        </ul>
      </section>

      <!-- 2 COLUNAS -->
      <div class="dash-cols">
        <!-- Principal -->
        <div class="dash-col">
          <section class="card">
            <header class="card__head">
              <div>
                <h2 class="card__title">Requer intervenção</h2>
                <p class="card__sub">
                  Veículos com score crítico, do pior para o melhor.
                </p>
              </div>
              <router-link to="/admin/relatorios" class="card__link">
                Ver todos
                <q-icon name="chevron_right" size="18px" />
              </router-link>
            </header>

            <ol v-if="store.requerIntervencao.length" class="interv">
              <li
                v-for="(v, i) in store.requerIntervencao"
                :key="v.matricula"
                class="interv__item"
              >
                <span class="interv__rank">{{ i + 1 }}</span>

                <div class="interv__info">
                  <b class="interv__placa">{{ v.matricula }}</b>
                  <small>{{ v.posto }}, {{ v.provincia }}</small>
                </div>

                <div
                  class="interv__bar"
                  role="img"
                  :aria-label="`Score ${v.score} em 100`"
                >
                  <span
                    class="interv__fill"
                    :style="{ width: v.score + '%' }"
                  />
                </div>

                <span class="badge badge--critico">Crítico {{ v.score }}</span>
              </li>
            </ol>

            <p v-else class="card__vazio">Sem veículos a requerer intervenção.</p>
          </section>
        </div>

        <!-- Lateral -->
        <div class="dash-col">
          <!-- Acções rápidas -->
          <section class="card">
            <header class="card__head">
              <h2 class="card__title">Acções rápidas</h2>
            </header>

            <div class="qa-grid">
              <button
                v-for="a in store.acoes"
                :key="a.label"
                type="button"
                class="qa"
                @click="ir(a.rota)"
              >
                <span class="qa__icon">
                  <q-icon :name="a.icon" size="22px" />
                </span>
                <span class="qa__label">{{ a.label }}</span>
              </button>
            </div>
          </section>

          <!-- Agentes em patrulha -->
          <section class="card">
            <header class="card__head">
              <div>
                <h2 class="card__title">Agentes em patrulha</h2>
                <p class="card__sub">
                  Última posição conhecida de cada viatura.
                </p>
              </div>
            </header>

            <ul v-if="store.agentes.length" class="agentes">
              <li
                v-for="a in store.agentes"
                :key="a.viatura"
                class="agente"
              >
                <span class="agente__icon">
                  <q-icon name="directions_car" size="18px" />
                </span>
                <div class="agente__info">
                  <b>{{ a.viatura }}</b>
                  <small>{{ a.agente }}, {{ a.local }}</small>
                </div>
                <span
                  class="badge"
                  :class="a.online ? 'badge--regular' : 'badge--neutro'"
                >
                  {{ a.online ? "Online" : "Offline" }}
                </span>
              </li>
            </ul>

            <p v-else class="card__vazio">Sem agentes em patrulha.</p>
          </section>

          <!-- Taxa de conformidade -->
          <section class="card card--taxa">
            <header class="card__head">
              <h2 class="card__title">Taxa de conformidade</h2>
            </header>

            <div class="taxa">
              <svg
                class="taxa__ring"
                viewBox="0 0 120 120"
                role="img"
                :aria-label="`${store.taxa}%`"
              >
                <circle class="taxa__track" cx="60" cy="60" r="52" />
                <circle
                  class="taxa__value"
                  cx="60"
                  cy="60"
                  r="52"
                  :stroke-dasharray="`${(store.taxa / 100) * store.circunferencia} ${store.circunferencia}`"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div class="taxa__num">
                {{ store.taxaTexto }}<small>%</small>
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminDashboardStore } from '@/stores/dashboards/admin-dashboard.store'
import AppFbLoader from '@/modules/common/AppFbLoader.vue'

const store = useAdminDashboardStore()
const router = useRouter()

onMounted(() => {
  store.carregar()
})

function ir(rota: string) {
  router.push(rota)
}
</script>

<style scoped lang="scss">
/* ============================================================ */
/* Página                                                        */
/* ============================================================ */
.admin-dash {
  --d-ink: var(--sicam-ink, #0f172a);
  --d-muted: var(--sicam-muted, #64748b);
  --d-line: var(--sicam-line, #e5ebe8);

  --d-crit: #dc2626;
  --d-crit-bg: var(--sicam-critical-bg, #fef2f2);
  --d-crit-ink: var(--sicam-critical-ink, #991b1b);
  --d-warn: #f59e0b;
  --d-warn-bg: var(--sicam-warning-bg, #fffbeb);
  --d-warn-ink: var(--sicam-warning-ink, #92400e);
  --d-ok: #059669;
  --d-ok-bg: var(--sicam-success-bg, #ecfdf5);
  --d-ok-ink: var(--sicam-success-ink, #065f46);
  --d-neu: #94a3b8;
  --d-neu-bg: var(--sicam-neutral-bg, #f1f5f9);
  --d-neu-ink: var(--sicam-neutral-ink, #475569);

  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

/* ============================================================ */
/* SKELETON                                                      */
/* ============================================================ */
.admin-dash__skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-head {
  max-width: 400px;
}

.skeleton-alertas {
  max-width: 500px;
}

.skeleton-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.skeleton-cols {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 18px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
}

/* ============================================================ */
/* Cabeçalho                                                     */
/* ============================================================ */
.dash-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 700px) {
    flex-direction: column;
  }

  &__title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--d-ink);
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 14px;
    color: var(--d-muted);
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
    color: var(--d-muted);
  }
}

.dash-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #064e3b;
  color: #fff;
  border: 0;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
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
/* Alertas                                                       */
/* ============================================================ */
.alertas {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.alerta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 10px;
  background: #fff;
  border: 1px solid var(--d-line);
  border-radius: 14px;

  &__icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #ecfdf5;
    color: #065f46;
  }

  &__body {
    display: flex;
    flex-direction: column;
    line-height: 1.25;

    b {
      font-size: 14px;
      color: var(--d-ink);
    }
    small {
      font-size: 12px;
      color: var(--d-muted);
    }
  }

  &--warn {
    background: var(--d-warn-bg);
    border-color: #fde68a;

    .alerta__icon {
      background: #fef3c7;
      color: var(--d-warn-ink);
    }
  }
}

/* ============================================================ */
/* KPIs                                                          */
/* ============================================================ */
.kpis {
  display: grid;
  grid-template-columns: 1.2fr repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.kpi {
  background: #fff;
  border: 1px solid var(--d-line);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;

  &__icon {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    margin-bottom: 14px;
    background: var(--d-neu-bg);
    color: var(--d-neu-ink);
  }

  &__value {
    font-size: 34px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--d-ink);
    font-variant-numeric: tabular-nums;
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin-top: 8px;
  }

  &__sub {
    font-size: 12px;
    color: var(--d-muted);
    margin-top: 2px;
  }

  &--total {
    background: linear-gradient(150deg, #065f46 0%, #04261d 100%);
    border-color: transparent;
    color: #fff;

    .kpi__icon {
      background: rgba(250, 204, 21, 0.16);
      color: #facc15;
    }
    .kpi__value {
      color: #fff;
    }
    .kpi__label {
      color: #d5f0e4;
    }
    .kpi__sub {
      color: #a9d9c5;
    }
  }

  &--critico .kpi__icon {
    background: var(--d-crit-bg);
    color: var(--d-crit-ink);
  }
  &--atencao .kpi__icon {
    background: var(--d-warn-bg);
    color: var(--d-warn-ink);
  }
  &--regular .kpi__icon {
    background: var(--d-ok-bg);
    color: var(--d-ok-ink);
  }
  &--sem-dados .kpi__icon {
    background: var(--d-neu-bg);
    color: var(--d-neu-ink);
  }

  &--critico .kpi__value {
    color: var(--d-crit-ink);
  }
  &--atencao .kpi__value {
    color: var(--d-warn-ink);
  }
  &--regular .kpi__value {
    color: var(--d-ok-ink);
  }
}

/* ============================================================ */
/* Distribuição                                                  */
/* ============================================================ */
.dist {
  background: #fff;
  border: 1px solid var(--d-line);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 18px;

  &__bar {
    display: flex;
    height: 12px;
    border-radius: 99px;
    overflow: hidden;
    background: #eef2f0;
    gap: 2px;
  }

  &__seg {
    display: block;
    height: 100%;

    &--critico {
      background: var(--d-crit);
    }
    &--atencao {
      background: var(--d-warn);
    }
    &--regular {
      background: var(--d-ok);
    }
    &--sem-dados {
      background: var(--d-neu);
    }
  }

  &__legenda {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    font-size: 12px;
    color: var(--d-muted);

    li {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--critico {
      background: var(--d-crit);
    }
    &--atencao {
      background: var(--d-warn);
    }
    &--regular {
      background: var(--d-ok);
    }
    &--sem-dados {
      background: var(--d-neu);
    }
  }
}

/* ============================================================ */
/* Colunas                                                       */
/* ============================================================ */
.dash-cols {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 18px;
  align-items: start;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
}

.dash-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.card {
  background: #fff;
  border: 1px solid var(--d-line);
  border-radius: 20px;
  padding: 20px;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--d-ink);
    margin: 0;
  }

  &__sub {
    font-size: 13px;
    color: var(--d-muted);
    margin: 4px 0 0;
    line-height: 1.4;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 600;
    color: #065f46;
    text-decoration: none;
    padding: 6px 8px 6px 12px;
    border-radius: 99px;
    background: #ecfdf5;
    transition: background 0.15s;

    &:hover {
      background: #d1fae5;
    }
    &:focus-visible {
      outline: 3px solid #10b981;
      outline-offset: 2px;
    }
  }

  &__vazio {
    margin: 0;
    padding: 16px 0;
    text-align: center;
    font-size: 13px;
    color: var(--d-muted);
  }
}

/* ============================================================ */
/* Requer intervenção                                            */
/* ============================================================ */
.interv {
  list-style: none;
  margin: 0;
  padding: 0;

  &__item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-top: 1px solid var(--sicam-line-soft, #eef2f0);

    &:first-child {
      border-top: 0;
      padding-top: 0;
    }
    &:last-child {
      padding-bottom: 0;
    }

    @media (max-width: 640px) {
      flex-wrap: wrap;
    }
  }

  &__rank {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: var(--d-crit-bg);
    color: var(--d-crit-ink);
    font-size: 13px;
    font-weight: 800;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.3;

    small {
      font-size: 12px;
      color: var(--d-muted);
    }
  }

  &__placa {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: var(--d-ink);
  }

  &__bar {
    width: 96px;
    height: 6px;
    border-radius: 99px;
    background: #fee2e2;
    overflow: hidden;
    flex-shrink: 0;

    @media (max-width: 640px) {
      order: 5;
      width: 100%;
    }
  }

  &__fill {
    display: block;
    height: 100%;
    border-radius: 99px;
    background: var(--d-crit);
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--critico {
    background: var(--d-crit-bg);
    color: var(--d-crit-ink);
  }
  &--regular {
    background: var(--d-ok-bg);
    color: var(--d-ok-ink);
  }
  &--neutro {
    background: var(--d-neu-bg);
    color: var(--d-neu-ink);
  }
}

/* ============================================================ */
/* Ações rápidas                                                 */
/* ============================================================ */
.qa-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.qa {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--d-line);
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;

  &:hover {
    background: #f0fdf7;
    border-color: #a7e3c8;
    box-shadow: 0 6px 16px rgba(6, 78, 59, 0.08);

    .qa__icon {
      background: #064e3b;
      color: #fff;
    }
  }

  &:focus-visible {
    outline: 3px solid #10b981;
    outline-offset: 2px;
  }

  &__icon {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #ecfdf5;
    color: #065f46;
    transition:
      background 0.15s,
      color 0.15s;
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: var(--d-ink);
    line-height: 1.3;
  }
}

/* ============================================================ */
/* Agentes                                                       */
/* ============================================================ */
.agentes {
  list-style: none;
  margin: 0;
  padding: 0;
}

.agente {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--sicam-line-soft, #eef2f0);

  &:first-child {
    border-top: 0;
    padding-top: 0;
  }
  &:last-child {
    padding-bottom: 0;
  }

  &__icon {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #f1f5f9;
    color: #475569;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.3;

    b {
      font-size: 14px;
      color: var(--d-ink);
      letter-spacing: 0.02em;
    }
    small {
      font-size: 12px;
      color: var(--d-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

/* ============================================================ */
/* Taxa de conformidade                                          */
/* ============================================================ */
.taxa {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 4px auto 6px;

  &__ring {
    width: 100%;
    height: 100%;
  }

  &__track {
    fill: none;
    stroke: #eef2f0;
    stroke-width: 10;
  }

  &__value {
    fill: none;
    stroke: #10b981;
    stroke-width: 10;
    stroke-linecap: round;
    transition: stroke-dasharray 0.6s ease;
  }

  &__num {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: baseline;
    justify-content: center;
    padding-top: 56px;
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #065f46;
    font-variant-numeric: tabular-nums;

    small {
      font-size: 16px;
      font-weight: 700;
      margin-left: 1px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .dash-btn .spinning {
    animation: none;
  }
  .taxa__value {
    transition: none;
  }
}
</style>