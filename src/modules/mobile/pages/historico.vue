<template>
  <div class="agente-historico">
    <!-- CABEÇALHO -->
    <header class="agente-historico__head">
      <div>
        <h1 class="agente-h1">Histórico</h1>
        <p class="agente-sub">
          {{ store.kpisData.total }} consultas registadas
        </p>
      </div>
      <button
        class="agente-historico__export"
        title="Exportar CSV"
        :disabled="store.aCarregar"
        @click="exportar"
      >
        <q-icon name="download" size="20px" />
      </button>
    </header>

    <!-- BUSCA -->
    <div class="agente-search">
      <q-icon name="search" size="18px" class="agente-search__icon" />
      <input
        :value="store.busca"
        class="agente-search__input"
        type="search"
        placeholder="Buscar por matrícula ou posto…"
        @input="onBuscaInput"
      />
      <button
        v-if="store.busca"
        class="agente-search__clear"
        @click="store.setBusca('')"
      >
        <q-icon name="close" size="16px" />
      </button>
    </div>

    <!-- FILTROS DE ESTADO -->
    <div class="agente-seg">
      <button
        v-for="f in store.FILTROS"
        :key="f"
        :class="{ 'is-active': store.filtroActivo === f }"
        @click="store.setFiltro(f)"
      >
        {{ f }}
        <span class="agente-seg__count">{{ store.contarPorFiltro(f) }}</span>
      </button>
    </div>

    <!-- FILTROS DE DATA -->
    <div class="agente-seg agente-seg--secundario">
      <button
        v-for="p in store.PERIODOS"
        :key="p"
        :class="{ 'is-active': store.periodoActivo === p }"
        @click="store.setPeriodo(p)"
      >
        {{ p }}
      </button>
    </div>

    <!-- ERRO -->
    <div v-if="store.erro" class="agente-erro">
      <q-icon name="error" size="18px" />
      {{ store.erro }}
    </div>

    <!-- SKELETON -->
    <div v-if="store.aCarregar && !store.carregado" class="agente-skeleton">
      <div class="sk-line sk-line--md" />
      <div class="sk-card" />
      <div class="sk-card" />
    </div>

    <!-- LISTA AGRUPADA -->
    <div v-else-if="store.grupos.length" class="agente-historico__list">
      <section v-for="g in store.grupos" :key="g.titulo" class="agente-grupo">
        <div class="agente-grupo__titulo">
          <span>{{ g.titulo }}</span>
          <span class="agente-grupo__count">{{ g.itens.length }}</span>
        </div>

        <div class="agente-card">
          <div
            v-for="c in g.itens"
            :key="c.id"
            class="agente-row"
            @click="ver(c.matricula)"
          >
            <div
              class="agente-row__avatar"
              :class="`agente-row__avatar--${store.badgeVariant(c.score)}`"
            >
              {{ c.matricula.slice(0, 2) }}
            </div>

            <div class="agente-row__body">
              <div class="agente-row__top">
                <b>{{ c.matricula }}</b>
              </div>
              <small>{{ c.posto }} · {{ c.dataHora }}</small>
            </div>

            <AppBadge
              :variant="store.badgeVariant(c.score)"
              :label="store.badgeLabel(c.score)"
            />
          </div>
        </div>
      </section>
    </div>

    <!-- VAZIO -->
    <div v-else-if="store.carregado" class="agente-card agente-vazio">
      <q-icon name="search_off" size="40px" class="agente-vazio__icon" />
      <p class="agente-vazio__title">Nenhum resultado</p>
      <p class="agente-vazio__sub">
        Nenhuma consulta corresponde aos filtros selecionados.
      </p>
      <button
        class="agente-btn agente-btn--outline"
        @click="store.limparFiltros()"
      >
        <q-icon name="restart_alt" size="18px" class="q-mr-xs" />
        Limpar filtros
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAgenteHistoricoStore } from '@/stores/agente/agente-historico.store'
import { historicoService } from '@/services/agente/historico.service'
import AppBadge from '@/modules/common/AppBadge.vue'

const router = useRouter()
const $q = useQuasar()
const store = useAgenteHistoricoStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Busca (com debounce na store)
// ============================================================
function onBuscaInput(e: Event) {
  const el = e.target as HTMLInputElement
  store.setBusca(el.value)
}

// ============================================================
// Navegação — VER DETALHES (corrigido: antes ia p/ /agente/resultado)
// ============================================================
function ver(matricula: string) {
  sessionStorage.setItem('sicam.matricula-atual', matricula)
  router.push(`/agente/veiculo/${matricula}`)
}

// ============================================================
// Exportar CSV
// ============================================================
async function exportar() {
  try {
    const blob = await historicoService.exportarCsv()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historico-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: `Exportados ${store.filtrados.length} registos`,
      position: 'top',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar.',
      position: 'top',
    })
  }
}
</script>

<style scoped lang="scss">
.agente-historico {
  padding: 0 0 24px;
}

// ============================================================
// CABEÇALHO
// ============================================================
.agente-historico__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.agente-h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--sicam-ink);
  margin: 0;
}

.agente-sub {
  color: var(--sicam-muted);
  font-size: 13px;
  margin: 2px 0 0;
}

.agente-historico__export {
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--sicam-ink);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;

  &:active:not(:disabled) {
    background: var(--sicam-surface-hover);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// ============================================================
// BUSCA
// ============================================================
.agente-search {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--sicam-line-soft);
  border-radius: 12px;
  padding: 0 12px;
  margin-bottom: 12px;

  &__icon {
    color: var(--sicam-muted);
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    border: 0;
    background: transparent;
    padding: 12px 10px;
    font-family: inherit;
    font-size: 14px;
    color: var(--sicam-ink);
    outline: 0;

    &::placeholder {
      color: var(--sicam-muted);
    }
  }

  &__clear {
    background: none;
    border: 0;
    color: var(--sicam-muted);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: 6px;
    &:active {
      background: var(--sicam-surface-hover);
    }
  }
}

// ============================================================
// FILTROS (segmentos)
// ============================================================
.agente-seg {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--sicam-line);
    background: #fff;
    border-radius: 99px;
    padding: 6px 14px;
    cursor: pointer;
    white-space: nowrap;
    font-size: 13px;
    color: var(--sicam-ink);
    font-family: inherit;
    transition: background 0.15s, border-color 0.15s;

    &.is-active {
      background: var(--sicam-primary-bg);
      border-color: #6ee7b7;
      color: var(--sicam-primary);
      font-weight: 700;
    }
  }

  &--secundario button {
    font-size: 12px;
    padding: 5px 12px;

    &.is-active {
      background: var(--sicam-surface-alt);
      border-color: var(--sicam-ink);
      color: var(--sicam-ink);
      font-weight: 700;
    }
  }

  &__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    background: var(--sicam-surface-alt);
    border-radius: 99px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;

    .is-active & {
      background: var(--sicam-primary);
      color: #fff;
    }
  }
}

// ============================================================
// LISTA
// ============================================================
.agente-historico__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agente-grupo {
  &__titulo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 700;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0 4px 6px;
  }

  &__count {
    background: var(--sicam-surface-alt);
    color: var(--sicam-muted);
    border-radius: 99px;
    min-width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    font-size: 10px;
  }
}

.agente-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 4px 14px;
}

// ============================================================
// LINHA
// ============================================================
.agente-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--sicam-line-soft);
  cursor: pointer;

  &:last-child {
    border-bottom: 0;
  }
  &:active {
    opacity: 0.7;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.05em;
    flex-shrink: 0;

    &--critico {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
    &--atencao {
      background: var(--sicam-warning-bg);
      color: var(--sicam-warning-ink);
    }
    &--regular {
      background: var(--sicam-success-bg);
      color: var(--sicam-success-ink);
    }
    &--sem-dados {
      background: var(--sicam-neutral-bg);
      color: var(--sicam-neutral-ink);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 8px;

    b {
      font-size: 14px;
      font-weight: 700;
      color: var(--sicam-ink);
      letter-spacing: 0.02em;
    }
  }

  small {
    display: block;
    color: var(--sicam-muted);
    font-size: 12px;
    font-weight: 400;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ============================================================
// VAZIO
// ============================================================
.agente-vazio {
  text-align: center;
  padding: 32px 16px;

  &__icon {
    color: var(--sicam-line-strong);
    margin-bottom: 8px;
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 4px;
  }

  &__sub {
    font-size: 13px;
    color: var(--sicam-muted);
    margin: 0 0 16px;
  }
}

// ============================================================
// BOTÃO
// ============================================================
.agente-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  background: var(--sicam-primary-light);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 13px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  font-family: inherit;

  &:active {
    background: var(--sicam-primary);
  }

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
    width: auto;
    padding: 10px 18px;
  }
}

// ============================================================
// SKELETON
// ============================================================
@keyframes sk-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
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

.agente-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-line {
  @extend %sk-block;
  height: 14px;

  &--md { width: 40%; height: 18px; }
}

.sk-card {
  @extend %sk-block;
  height: 90px;
  border-radius: 14px;
}

// ============================================================
// ERRO
// ============================================================
.agente-erro {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--sicam-critical-bg, #fef2f2);
  color: var(--sicam-critical-ink, #991b1b);
  font-size: 13px;
  margin-bottom: 12px;
}
</style>