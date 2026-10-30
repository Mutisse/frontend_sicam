<template>
  <q-page class="bk-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="bk-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-kpis">
        <div v-for="i in 4" :key="`sk-kpi-${i}`" class="sk-kpi" />
      </div>
      <div class="sk-tipos">
        <div v-for="i in 3" :key="`sk-tipo-${i}`" class="sk-tipo" />
      </div>
      <div class="sk-table">
        <div v-for="i in 5" :key="`sk-row-${i}`" class="sk-row" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Backups</h1>
          <p class="page-head__sub">
            Cópias de segurança do sistema, tipos configurados e histórico
          </p>
        </div>

        <div class="page-head__actions">
          <span class="page-head__stamp">
            <q-icon name="schedule" size="16px" />
            Actualizado às {{ store.ultimaActualizacao }}
          </span>

          <button
            type="button"
            class="page-btn page-btn--outline"
            :disabled="store.aCarregar"
            @click="store.carregar"
          >
            <q-icon
              name="refresh"
              size="18px"
              :class="{ spinning: store.aCarregar }"
            />
            Actualizar
          </button>

          <button
            type="button"
            class="page-btn page-btn--primary"
            :disabled="store.aCriar"
            @click="abrirNovo"
          >
            <q-icon name="backup" size="18px" />
            Criar backup
          </button>
        </div>
      </header>

      <!-- ERRO -->
      <div v-if="store.erro" class="form-error">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- KPIs -->
      <section class="kpi-grid">
        <div class="kpi">
          <div class="kpi__icon kpi__icon--primary">
            <q-icon name="inventory_2" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.totalBackups }}</div>
            <div class="kpi__label">Total</div>
          </div>
        </div>
        <div class="kpi">
          <div class="kpi__icon kpi__icon--success">
            <q-icon name="history" size="22px" />
          </div>
          <div>
            <div class="kpi__value">
              {{ store.ultimoBackup?.criadoEm ?? '—' }}
            </div>
            <div class="kpi__label">Último backup</div>
          </div>
        </div>
        <div class="kpi">
          <div class="kpi__icon kpi__icon--info">
            <q-icon name="storage" size="22px" />
          </div>
          <div>
            <div class="kpi__value">
              {{ store.formatarTamanhoTotal(store.tamanhoTotal) }}
            </div>
            <div class="kpi__label">Tamanho total</div>
          </div>
        </div>
        <div class="kpi" :class="{ 'kpi--alerta': store.totalFalhas > 0 }">
          <div class="kpi__icon kpi__icon--critical">
            <q-icon name="error" size="22px" />
          </div>
          <div>
            <div class="kpi__value">{{ store.totalFalhas }}</div>
            <div class="kpi__label">Falhas</div>
          </div>
        </div>
      </section>

      <!-- TIPOS -->
      <section class="tipos-wrap">
        <header class="tipos-head">
          <div>
            <h2 class="tipos-title">Tipos de backup</h2>
            <p class="tipos-sub">
              Active, agende e configure cada tipo de cópia de segurança.
            </p>
          </div>

          <span class="tipos-count">
            <b>{{ store.tiposAtivos }}</b> de {{ store.tipos.length }} activos
          </span>
        </header>

        <div class="tipos-grid">
          <article
            v-for="t in store.tipos"
            :key="t.key"
            class="tipo-card"
            :class="{ 'tipo-card--ativo': t.ativo }"
          >
            <header class="tipo-card__head">
              <div class="tipo-card__icon">
                <q-icon :name="t.icon" size="22px" />
              </div>

              <q-toggle
                :model-value="t.ativo"
                color="primary"
                @update:model-value="store.toggleTipo(t.key)"
              />
            </header>

            <h3 class="tipo-card__name">{{ t.label }}</h3>
            <p class="tipo-card__desc">{{ t.descricao }}</p>

            <div class="tipo-card__row">
              <span class="tipo-card__label">Tamanho aprox.</span>
              <b>{{ t.tamanhoAprox }}</b>
            </div>

            <div class="tipo-card__row">
              <span class="tipo-card__label">Ficheiro</span>
              <code>{{ t.prefixo }}_*.{{ t.extensao }}</code>
            </div>

            <div class="tipo-card__row">
              <span class="tipo-card__label">Periodicidade</span>
              <select
                class="tipo-card__select"
                :value="t.periodicidade"
                :disabled="!t.ativo"
                @change="
                  (e) =>
                    store.setPeriodicidade(
                      t.key,
                      (e.target as HTMLSelectElement).value as any,
                    )
                "
              >
                <option v-for="p in store.periodicidades" :key="p" :value="p">
                  {{ p }}
                </option>
              </select>
            </div>

            <div class="tipo-card__row">
              <span class="tipo-card__label">Hora de execução</span>
              <input
                type="time"
                class="tipo-card__input"
                :value="t.horaExecucao"
                :disabled="!t.ativo || t.periodicidade === 'Nunca'"
                @change="
                  (e) =>
                    store.setHora(t.key, (e.target as HTMLInputElement).value)
                "
              />
            </div>
          </article>
        </div>
      </section>

      <!-- FILTROS -->
      <section class="filters">
        <label class="filter filter--search">
          <q-icon name="search" size="20px" class="filter__icon" />
          <input
            v-model="store.pesquisa"
            type="text"
            class="filter__input"
            placeholder="Pesquisar por ID, ficheiro ou autor…"
          />
        </label>

        <select v-model="store.filtroEstado" class="filter filter__select">
          <option value="">Todos os estados</option>
          <option v-for="e in store.estadosDisponiveis" :key="e" :value="e">
            {{ e }}
          </option>
        </select>

        <select v-model="store.filtroTipo" class="filter filter__select">
          <option value="">Todos os tipos</option>
          <option v-for="t in store.tiposDisponiveis" :key="t" :value="t">
            {{ t }}
          </option>
        </select>

        <button
          v-if="temFiltros"
          class="page-btn page-btn--outline page-btn--compact"
          @click="store.limparFiltros"
        >
          <q-icon name="close" size="16px" />
          Limpar
        </button>
      </section>

      <!-- HISTÓRICO -->
      <section class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ficheiro</th>
              <th>Tipo</th>
              <th>Origem</th>
              <th>Tamanho</th>
              <th>Estado</th>
              <th>Criado em</th>
              <th class="data-table__th-actions" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="b in store.filtrados"
              :key="b.id"
              class="data-table__row"
            >
              <td><b>{{ b.codigo }}</b></td>
              <td class="table-file">{{ b.ficheiro }}</td>
              <td>
                <span
                  class="tag"
                  :class="b.tipo === 'Automático' ? 'tag--auto' : 'tag--manual'"
                >
                  {{ b.tipo }}
                </span>
              </td>
              <td>{{ b.origem }}</td>
              <td class="table-size">{{ b.tamanho }}</td>
              <td>
                <span
                  class="badge"
                  :class="`badge--${store.estadoClasse(b.estado)}`"
                >
                  <q-icon
                    :name="store.iconeEstado(b.estado)"
                    size="12px"
                    :class="{ spinning: b.estado === 'Em curso' }"
                  />
                  {{ b.estado }}
                </span>
              </td>
              <td class="table-time">
                {{ b.criadoEm }}
                <small v-if="b.autor !== 'sistema'">· {{ b.autor }}</small>
              </td>
              <td class="data-table__actions">
                <button
                  class="row-action"
                  title="Restaurar"
                  :disabled="b.estado !== 'Concluído'"
                  @click="pedirRestaurar(b)"
                >
                  <q-icon name="restore" size="18px" />
                </button>
                <button
                  class="row-action"
                  title="Descarregar"
                  :disabled="b.estado !== 'Concluído'"
                  @click="descarregar(b)"
                >
                  <q-icon name="download" size="18px" />
                </button>
                <button
                  class="row-action row-action--danger"
                  title="Remover"
                  @click="pedirRemover(b)"
                >
                  <q-icon name="delete" size="18px" />
                </button>
              </td>
            </tr>

            <tr v-if="!store.filtrados.length">
              <td colspan="8" class="data-table__empty">
                <q-icon
                  name="search_off"
                  size="40px"
                  class="data-table__empty-icon"
                />
                <p>Nenhum backup corresponde aos filtros.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- MODAL — CRIAR BACKUP -->
      <q-dialog v-model="modalNovo" persistent>
        <q-card class="modal-card">
          <header class="modal-head">
            <div class="modal-head__left">
              <div class="modal-head__icon">
                <q-icon name="backup" size="22px" />
              </div>
              <div>
                <h2 class="modal-head__title">Criar backup</h2>
                <p class="modal-head__sub">
                  Escolha o tipo de backup a executar
                </p>
              </div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="modalNovo = false"
            />
          </header>

          <div class="modal-body">
            <p class="modal-label">Tipo de backup</p>

            <div class="modal-opcoes">
              <button
                v-for="t in store.tipos"
                :key="t.key"
                type="button"
                class="modal-opcao"
                :class="{
                  'modal-opcao--active': origemSelecionada === t.key,
                }"
                @click="origemSelecionada = t.key"
              >
                <span class="modal-opcao__icon">
                  <q-icon :name="t.icon" size="20px" />
                </span>
                <span class="modal-opcao__body">
                  <b>{{ t.label }}</b>
                  <small>{{ t.descricao }} · ≈ {{ t.tamanhoAprox }}</small>
                </span>
                <q-icon
                  v-if="origemSelecionada === t.key"
                  name="check_circle"
                  size="20px"
                  class="modal-opcao__check"
                />
              </button>
            </div>
          </div>

          <footer class="modal-foot">
            <button
              type="button"
              class="page-btn page-btn--outline"
              @click="modalNovo = false"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="page-btn page-btn--primary"
              :disabled="!origemSelecionada || store.aCriar"
              @click="confirmarCriar"
            >
              <q-icon
                name="backup"
                size="16px"
                :class="{ spinning: store.aCriar }"
              />
              {{ store.aCriar ? 'A criar…' : 'Iniciar backup' }}
            </button>
          </footer>
        </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  useAdminBackupsStore,
  type Backup,
  type OrigemBackup,
} from '@/stores/admin/backups.store'

const $q = useQuasar()
const store = useAdminBackupsStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Estado do modal
// ============================================================
const modalNovo = ref(false)
const origemSelecionada = ref<OrigemBackup | null>(null)

// ============================================================
// Estado derivado
// ============================================================
const temFiltros = computed(
  () => !!store.pesquisa || !!store.filtroEstado || !!store.filtroTipo,
)

// ============================================================
// Acções
// ============================================================
function abrirNovo() {
  origemSelecionada.value = 'Completo'
  modalNovo.value = true
}

async function confirmarCriar() {
  if (!origemSelecionada.value) return

  const origem = origemSelecionada.value
  modalNovo.value = false

  const b = await store.criarBackup(origem, 'Manual')

  if (b) {
    $q.notify({
      type: 'positive',
      message: `Backup ${b.codigo} criado com sucesso`,
      position: 'top',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: store.erro ?? 'Não foi possível concluir o backup.',
      position: 'top',
    })
  }
}

function pedirRemover(b: Backup) {
  $q.dialog({
    title: 'Remover backup',
    message: `Remover permanentemente "${b.ficheiro}"?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(b.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: 'Backup removido',
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

function pedirRestaurar(b: Backup) {
  $q.dialog({
    title: 'Restaurar backup',
    message: `Restaurar o sistema a partir de "${b.ficheiro}"? Esta acção substitui os dados actuais.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Restaurar', color: 'primary' },
    persistent: true,
  }).onOk(async () => {
    const msg = await store.restaurar(b.id)
    if (msg) {
      $q.notify({
        type: 'info',
        message: msg,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

async function descarregar(b: Backup) {
  $q.notify({
    type: 'info',
    message: `A preparar ${b.ficheiro}…`,
    position: 'top',
  })

  const ok = await store.descarregar(b)
  if (ok) {
    $q.notify({
      type: 'positive',
      message: 'Download iniciado.',
      position: 'top',
    })
  } else if (store.erro) {
    $q.notify({ type: 'negative', message: store.erro, position: 'top' })
  }
}
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

.bk-skeleton {
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
    height: 28px;
    width: 320px;
    max-width: 60%;
  }
  .sk-sub {
    @extend %sk-block;
    height: 16px;
    width: 440px;
    max-width: 80%;
  }
}

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sk-kpi {
  @extend %sk-block;
  height: 76px;
  border-radius: 14px;
}

.sk-tipos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.sk-tipo {
  @extend %sk-block;
  height: 240px;
  border-radius: 14px;
}

.sk-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sk-row {
  @extend %sk-block;
  height: 52px;
  border-radius: 8px;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--sicam-critical-bg);
  color: var(--sicam-critical-ink);
  font-size: 13px;
  margin-bottom: 16px;
}

/* ============================================================ */
/* Página                                                       */
/* ============================================================ */
.bk-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    flex-direction: column;
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 6px;
  }
  &__sub {
    font-size: 14px;
    color: var(--sicam-muted);
    margin: 0;
  }
  &__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  &__stamp {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--sicam-muted);
    font-variant-numeric: tabular-nums;
  }
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &--compact {
    padding: 8px 14px;
    font-size: 13px;
  }
  &--primary {
    background: var(--sicam-primary-light);
    color: #fff;
    &:hover:not(:disabled) {
      background: var(--sicam-primary);
    }
    &:disabled {
      opacity: 0.55;
      cursor: progress;
    }
  }
  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
    &:hover:not(:disabled) {
      background: var(--sicam-surface-hover);
    }
    &:disabled {
      opacity: 0.55;
      cursor: progress;
    }
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

/* KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 450px) {
    grid-template-columns: 1fr;
  }
}

.kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &--alerta {
    border: 1px solid var(--sicam-critical);
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--primary {
      background: var(--sicam-primary-bg);
      color: var(--sicam-primary);
    }
    &--success {
      background: var(--sicam-success-bg);
      color: var(--sicam-success-ink);
    }
    &--info {
      background: #dbeafe;
      color: #2563eb;
    }
    &--critical {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
  }

  &__value {
    font-size: 22px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  &__label {
    font-size: 12px;
    color: var(--sicam-muted);
    margin-top: 2px;
  }
}

/* Tipos */
.tipos-wrap {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

.tipos-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tipos-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--sicam-ink);
  margin: 0;
}
.tipos-sub {
  font-size: 13px;
  color: var(--sicam-muted);
  margin: 3px 0 0;
}

.tipos-count {
  font-size: 13px;
  color: var(--sicam-muted);
  background: var(--sicam-surface-alt);
  padding: 6px 12px;
  border-radius: 99px;

  b {
    color: var(--sicam-ink);
  }
}

.tipos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.tipo-card {
  border: 1.5px solid var(--sicam-line);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.15s, background 0.15s;

  &--ativo {
    border-color: #a7e3c8;
    background: #f9fdfb;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
  }

  &__name {
    font-size: 15px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }
  &__desc {
    font-size: 12px;
    color: var(--sicam-muted);
    margin: 0;
    line-height: 1.4;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 13px;
  }

  &__label {
    color: var(--sicam-muted);
  }

  &__select,
  &__input {
    border: 1px solid var(--sicam-line);
    border-radius: 8px;
    padding: 5px 10px;
    font-family: inherit;
    font-size: 13px;
    color: var(--sicam-ink);
    background: #fff;
    cursor: pointer;

    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  code {
    font-family: ui-monospace, monospace;
    font-size: 11px;
    color: var(--sicam-ink);
    background: var(--sicam-surface-alt);
    padding: 3px 6px;
    border-radius: 6px;
  }
}

/* Filtros */
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.filter {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 10px;
  padding: 0 14px;
  height: 44px;
  font-family: inherit;

  &--search {
    flex: 1;
    min-width: 240px;
  }
  &__icon {
    color: var(--sicam-muted);
    margin-right: 8px;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    border: 0;
    background: transparent;
    font-size: 14px;
    color: var(--sicam-ink);
    height: 100%;
    &:focus {
      outline: 0;
    }
    &::placeholder {
      color: var(--sicam-muted);
    }
  }

  &__select {
    border: 0;
    background: transparent;
    font-size: 14px;
    color: var(--sicam-ink);
    height: 100%;
    cursor: pointer;
    min-width: 170px;
    &:focus {
      outline: 0;
    }
  }
}

/* Tabela */
.table-wrap {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: var(--sicam-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 12px 16px;
    background: #fafbfa;
    border-bottom: 1px solid var(--sicam-line);
    white-space: nowrap;
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--sicam-ink);
    border-bottom: 1px solid var(--sicam-line-soft);
    vertical-align: middle;
  }

  &__row {
    transition: background 0.15s;
    &:hover {
      background: #fbfdfc;
    }
    &:last-child td {
      border-bottom: 0;
    }
  }

  &__th-actions {
    width: 130px;
    text-align: right;
  }
  &__actions {
    text-align: right;
    white-space: nowrap;
  }

  &__empty {
    text-align: center;
    color: var(--sicam-muted);
    padding: 40px 16px !important;
    font-size: 14px;

    &-icon {
      color: var(--sicam-line-strong);
      margin-bottom: 8px;
    }
    p {
      margin: 0;
    }
  }
}

.table-file {
  font-family: ui-monospace, monospace;
  font-size: 13px;
}
.table-size {
  color: var(--sicam-ink);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.table-time {
  color: var(--sicam-muted);
  font-size: 13px;
  white-space: nowrap;
  small {
    display: block;
    font-size: 11px;
    opacity: 0.85;
    margin-top: 1px;
  }
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;

  &--auto {
    background: #dbeafe;
    color: #2563eb;
  }
  &--manual {
    background: var(--sicam-neutral-bg);
    color: var(--sicam-neutral-ink);
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;

  &--regular {
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
  }
  &--atencao {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
  }
  &--critico {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }

  .spinning {
    animation: spin 1s linear infinite;
  }
}

.row-action {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sicam-muted);
  cursor: pointer;
  margin-left: 2px;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: var(--sicam-surface-hover);
    color: var(--sicam-ink);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &--danger:hover:not(:disabled) {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }
}

/* Modal */
.modal-card {
  width: 560px;
  max-width: 94vw;
  border-radius: 20px;
  overflow: hidden;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--sicam-line);

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }
  &__sub {
    font-size: 12px;
    color: var(--sicam-muted);
    margin: 2px 0 0;
  }
}

.modal-body {
  padding: 20px;
}

.modal-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--sicam-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 10px;
}

.modal-opcoes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-opcao {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1.5px solid var(--sicam-line);
  border-radius: 12px;
  padding: 12px 14px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #a7e3c8;
    background: #f9fdfb;
  }

  &--active {
    border-color: var(--sicam-primary-light);
    background: var(--sicam-primary-bg);
  }

  &__icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
  }

  &__body {
    flex: 1;
    min-width: 0;
    b {
      display: block;
      font-size: 14px;
      color: var(--sicam-ink);
    }
    small {
      display: block;
      font-size: 12px;
      color: var(--sicam-muted);
      margin-top: 2px;
    }
  }

  &__check {
    color: var(--sicam-primary);
    flex-shrink: 0;
  }
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--sicam-line);
  background: #fafbfa;
}

@media (prefers-reduced-motion: reduce) {
  .spinning {
    animation: none !important;
  }
}
</style>