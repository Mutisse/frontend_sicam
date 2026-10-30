<template>
  <q-page class="perf-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="perf-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-kpis">
        <div v-for="i in 4" :key="`sk-kpi-${i}`" class="sk-kpi" />
      </div>
      <div class="sk-filters">
        <div class="sk-search" />
        <div class="sk-select" />
      </div>
      <div class="sk-grid">
        <div v-for="i in 6" :key="`sk-card-${i}`" class="sk-card" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="perf-head">
        <div>
          <h1 class="perf-head__title">Perfis e Permissões</h1>
          <p class="perf-head__sub">
            Gestão de perfis de acesso e permissões por módulo
          </p>
        </div>

        <div class="perf-head__actions">
          <button
            class="perf-btn perf-btn--outline"
            :disabled="store.aCarregar"
            @click="exportarExcel"
          >
            <q-icon name="file_download" size="18px" />
            Excel
          </button>
          <button class="perf-btn perf-btn--primary" @click="store.abrirCriar">
            <q-icon name="add" size="18px" />
            Novo perfil
          </button>
        </div>
      </header>

      <!-- ERRO -->
      <div v-if="store.erro" class="perf-erro">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- KPIs -->
      <section class="perf-kpis">
        <article class="perf-kpi perf-kpi--total">
          <div class="perf-kpi__icon"><q-icon name="shield" size="22px" /></div>
          <div class="perf-kpi__value">{{ store.totalPerfis }}</div>
          <div class="perf-kpi__label">Perfis</div>
        </article>

        <article class="perf-kpi">
          <div class="perf-kpi__icon perf-kpi__icon--success">
            <q-icon name="check_circle" size="22px" />
          </div>
          <div class="perf-kpi__value">{{ store.totalAtivos }}</div>
          <div class="perf-kpi__label">Ativos</div>
        </article>

        <article class="perf-kpi">
          <div class="perf-kpi__icon perf-kpi__icon--critical">
            <q-icon name="block" size="22px" />
          </div>
          <div class="perf-kpi__value">{{ store.totalBloqueados }}</div>
          <div class="perf-kpi__label">Bloqueados</div>
        </article>

        <article class="perf-kpi">
          <div class="perf-kpi__icon perf-kpi__icon--info">
            <q-icon name="people" size="22px" />
          </div>
          <div class="perf-kpi__value">{{ store.totalUtilizadores }}</div>
          <div class="perf-kpi__label">Utilizadores</div>
        </article>
      </section>

      <!-- FILTROS -->
      <section class="perf-filters">
        <label class="perf-search">
          <q-icon name="search" size="20px" class="perf-search__icon" />
          <input
            v-model="store.pesquisa"
            type="text"
            class="perf-search__input"
            placeholder="Pesquisar por nome ou chave…"
          />
          <button
            v-if="store.pesquisa"
            class="perf-search__clear"
            @click="store.pesquisa = ''"
          >
            <q-icon name="close" size="16px" />
          </button>
        </label>

        <select v-model="store.filtroEstado" class="perf-select">
          <option value="">Todos os estados</option>
          <option value="Ativo">Ativos</option>
          <option value="Bloqueado">Bloqueados</option>
        </select>

        <button
          v-if="temFiltros"
          class="perf-btn perf-btn--outline perf-btn--compact"
          @click="store.limparFiltros"
        >
          <q-icon name="close" size="16px" />
          Limpar
        </button>
      </section>

      <!-- LISTA DE PERFIS -->
      <section class="perf-grid">
        <article
          v-for="p in store.filtrados"
          :key="p.id"
          class="perf-card"
          :class="{ 'perf-card--bloqueado': p.estado === 'Bloqueado' }"
        >
          <header class="perf-card__head">
            <div
              class="perf-card__icon"
              :style="{ background: p.cor + '20', color: p.cor }"
            >
              <q-icon :name="p.icon" size="22px" />
            </div>

            <div class="perf-card__info">
              <b>{{ p.label }}</b>
              <small>{{ p.key }}</small>
            </div>

            <span
              class="perf-badge"
              :class="
                p.estado === 'Ativo' ? 'perf-badge--ok' : 'perf-badge--blocked'
              "
            >
              {{ p.estado }}
            </span>
          </header>

          <p class="perf-card__desc">{{ p.descricao }}</p>

          <div class="perf-card__stats">
            <div class="perf-card__stat">
              <q-icon name="people" size="16px" />
              <span>{{ p.utilizadores }} utilizador(es)</span>
            </div>
            <div class="perf-card__stat">
              <q-icon name="lock_open" size="16px" />
              <span>{{ totalPermissoes(p) }} permissões</span>
            </div>
            <div v-if="p.sistema" class="perf-card__stat perf-card__stat--sys">
              <q-icon name="verified_user" size="16px" />
              <span>Sistema</span>
            </div>
          </div>

          <footer class="perf-card__actions">
            <button
              class="perf-action"
              title="Ver detalhes"
              @click="store.abrirDetalhes(p)"
            >
              <q-icon name="visibility" size="18px" />
            </button>
            <button
              class="perf-action"
              title="Editar"
              @click="store.abrirEditar(p)"
            >
              <q-icon name="edit" size="18px" />
            </button>
            <button class="perf-action" title="Clonar" @click="clonar(p)">
              <q-icon name="content_copy" size="18px" />
            </button>
            <button
              class="perf-action"
              :class="p.estado === 'Ativo' ? 'perf-action--danger' : 'perf-action--ok'"
              :title="p.estado === 'Ativo' ? 'Bloquear' : 'Desbloquear'"
              @click="alternarEstado(p)"
            >
              <q-icon
                :name="p.estado === 'Ativo' ? 'block' : 'check_circle'"
                size="18px"
              />
            </button>
            <button
              class="perf-action perf-action--danger"
              :disabled="p.sistema || p.utilizadores > 0"
              :title="
                p.sistema
                  ? 'Perfil de sistema'
                  : p.utilizadores > 0
                    ? 'Tem utilizadores atribuídos'
                    : 'Remover'
              "
              @click="store.pedirRemover(p)"
            >
              <q-icon name="delete" size="18px" />
            </button>
          </footer>
        </article>

        <div v-if="!store.filtrados.length" class="perf-empty">
          <div class="perf-empty__icon">
            <q-icon name="shield_moon" size="32px" />
          </div>
          <b>Nenhum perfil encontrado</b>
          <p>Tente outro nome ou crie um novo perfil.</p>
        </div>
      </section>

      <!-- MODAL — CRIAR / EDITAR -->
      <q-dialog v-model="store.modalForm" persistent>
        <q-card class="modal modal--wide">
          <header class="modal__head">
            <div>
              <h2 class="modal__title">
                {{
                  store.modoForm === 'criar' ? 'Novo perfil' : 'Editar perfil'
                }}
              </h2>
              <small class="modal__sub">
                Configure o nome, identidade e permissões do perfil
              </small>
            </div>
            <button class="modal__close" @click="store.fecharForm">
              <q-icon name="close" size="20px" />
            </button>
          </header>

          <div class="modal__body">
            <div class="form-grid">
              <label class="field">
                <span class="field__label">Nome do perfil <em>*</em></span>
                <input
                  v-model.trim="store.form.label"
                  class="field__input"
                  placeholder="Ex.: Supervisor Regional"
                />
              </label>

              <label class="field">
                <span class="field__label"
                  >Chave (identificador) <em>*</em></span
                >
                <input
                  v-model.trim="store.form.key"
                  class="field__input field__input--key"
                  placeholder="supervisor-regional"
                />
              </label>

              <div class="form-row">
                <label class="field">
                  <span class="field__label">Ícone</span>
                  <select v-model="store.form.icon" class="field__input">
                    <option value="shield">Shield</option>
                    <option value="admin_panel_settings">Admin</option>
                    <option value="military_tech">Chefe</option>
                    <option value="badge">Agente</option>
                    <option value="directions_car">INATRO</option>
                    <option value="receipt_long">GESTMUL</option>
                    <option value="verified_user">ISSM</option>
                    <option value="local_police">PRM</option>
                    <option value="person">Cidadão</option>
                  </select>
                </label>

                <label class="field">
                  <span class="field__label">Cor</span>
                  <input
                    v-model="store.form.cor"
                    type="color"
                    class="field__input field__input--color"
                  />
                </label>

                <label class="field">
                  <span class="field__label">Estado</span>
                  <select v-model="store.form.estado" class="field__input">
                    <option value="Ativo">Ativo</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </label>
              </div>

              <label class="field">
                <span class="field__label">Descrição</span>
                <input
                  v-model.trim="store.form.descricao"
                  class="field__input"
                  placeholder="Breve descrição do perfil"
                />
              </label>
            </div>

            <div class="perm-section">
              <header class="perm-section__head">
                <h3>Permissões por módulo</h3>
                <p>
                  Clique no cabeçalho do módulo/grupo para ativar/desativar tudo.
                </p>
              </header>

              <div
                v-for="(modulos, grupo) in store.modulosPorGrupo"
                :key="grupo"
                class="perm-group"
              >
                <header
                  class="perm-group__head"
                  @click="store.ativarTudoGrupo(store.form.permissoes, grupo)"
                >
                  <q-icon name="folder" size="16px" />
                  <b>{{ grupo }}</b>
                  <q-icon name="select_all" size="16px" class="perm-group__all" />
                </header>

                <div class="perm-table">
                  <div class="perm-table__head">
                    <div class="perm-table__col-modulo">Módulo</div>
                    <div
                      v-for="a in store.ACOES"
                      :key="a.key"
                      class="perm-table__col-acao"
                    >
                      {{ a.label }}
                    </div>
                  </div>

                  <div
                    v-for="m in modulos"
                    :key="m.key"
                    class="perm-table__row"
                  >
                    <div
                      class="perm-table__col-modulo perm-table__col-modulo--clickable"
                      @click="store.ativarTudoModulo(store.form.permissoes, m.key)"
                    >
                      <q-icon :name="m.icon" size="16px" />
                      <span>{{ m.label }}</span>
                    </div>

                    <div
                      v-for="a in store.ACOES"
                      :key="a.key"
                      class="perm-table__col-acao"
                    >
                      <input
                        type="checkbox"
                        :checked="
                          store.getPermissao(store.form.permissoes, m.key)[a.key]
                        "
                        @change="
                          store.togglePermissao(store.form.permissoes, m.key, a.key)
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="modal__foot">
            <button class="perf-btn perf-btn--outline" @click="store.fecharForm">
              Cancelar
            </button>
            <button
              class="perf-btn perf-btn--primary"
              :disabled="!store.formValido || store.aSalvar"
              @click="guardar"
            >
              <q-icon name="save" size="16px" />
              {{
                store.aSalvar
                  ? 'A guardar…'
                  : store.modoForm === 'criar'
                    ? 'Criar perfil'
                    : 'Guardar'
              }}
            </button>
          </footer>
        </q-card>
      </q-dialog>

      <!-- MODAL — DETALHES -->
      <q-dialog v-model="store.modalDetalhes">
        <q-card v-if="store.perfilDetalhe" class="modal modal--wide">
          <header class="modal__head">
            <div class="detail-head">
              <div
                class="perf-card__icon"
                :style="{
                  background: store.perfilDetalhe.cor + '20',
                  color: store.perfilDetalhe.cor,
                }"
              >
                <q-icon :name="store.perfilDetalhe.icon" size="22px" />
              </div>
              <div>
                <h2 class="modal__title">{{ store.perfilDetalhe.label }}</h2>
                <small class="modal__sub">{{ store.perfilDetalhe.key }}</small>
              </div>
            </div>
            <button class="modal__close" @click="store.modalDetalhes = false">
              <q-icon name="close" size="20px" />
            </button>
          </header>

          <div class="modal__body">
            <p class="detail-desc">{{ store.perfilDetalhe.descricao }}</p>

            <div class="detail-summary">
              <div class="detail-summary__item">
                <span>Estado</span>
                <b>{{ store.perfilDetalhe.estado }}</b>
              </div>
              <div class="detail-summary__item">
                <span>Utilizadores</span>
                <b>{{ store.perfilDetalhe.utilizadores }}</b>
              </div>
              <div class="detail-summary__item">
                <span>Permissões</span>
                <b>{{ totalPermissoes(store.perfilDetalhe) }}</b>
              </div>
              <div class="detail-summary__item">
                <span>Tipo</span>
                <b>{{
                  store.perfilDetalhe.sistema ? 'Sistema' : 'Personalizado'
                }}</b>
              </div>
            </div>

            <h3 class="detail-title">Permissões atribuídas</h3>

            <div class="perm-table">
              <div class="perm-table__head">
                <div class="perm-table__col-modulo">Módulo</div>
                <div
                  v-for="a in store.ACOES"
                  :key="a.key"
                  class="perm-table__col-acao"
                >
                  {{ a.label }}
                </div>
              </div>

              <div
                v-for="m in store.MODULOS"
                :key="m.key"
                class="perm-table__row"
              >
                <div class="perm-table__col-modulo">
                  <q-icon :name="m.icon" size="16px" />
                  <span>{{ m.label }}</span>
                </div>

                <div
                  v-for="a in store.ACOES"
                  :key="a.key"
                  class="perm-table__col-acao"
                >
                  <q-icon
                    :name="
                      store.getPermissao(store.perfilDetalhe.permissoes, m.key)[
                        a.key
                      ]
                        ? 'check_circle'
                        : 'remove_circle_outline'
                    "
                    :color="
                      store.getPermissao(store.perfilDetalhe.permissoes, m.key)[
                        a.key
                      ]
                        ? 'positive'
                        : 'grey-5'
                    "
                    size="18px"
                  />
                </div>
              </div>
            </div>
          </div>

          <footer class="modal__foot">
            <button
              class="perf-btn perf-btn--outline"
              @click="store.modalDetalhes = false"
            >
              Fechar
            </button>
            <button class="perf-btn perf-btn--primary" @click="editarDoDetalhe">
              <q-icon name="edit" size="16px" />
              Editar
            </button>
          </footer>
        </q-card>
      </q-dialog>

      <!-- MODAL — CONFIRMAR REMOÇÃO -->
      <q-dialog v-model="store.modalConfirmRemover" persistent>
        <q-card v-if="store.perfilARemover" class="modal modal--sm">
          <header class="modal__head">
            <div>
              <h2 class="modal__title">Remover perfil</h2>
              <small class="modal__sub">{{ store.perfilARemover.label }}</small>
            </div>
            <button
              class="modal__close"
              @click="store.modalConfirmRemover = false"
            >
              <q-icon name="close" size="20px" />
            </button>
          </header>

          <div class="modal__body">
            <div class="confirm-remove">
              <div class="confirm-remove__icon">
                <q-icon name="warning_amber" size="40px" />
              </div>
              <h3 class="confirm-remove__title">Tem a certeza?</h3>
              <p class="confirm-remove__text">
                O perfil <b>{{ store.perfilARemover.label }}</b> será removido
                permanentemente. Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          <footer class="modal__foot">
            <button
              class="perf-btn perf-btn--outline"
              @click="store.modalConfirmRemover = false"
            >
              Cancelar
            </button>
            <button class="perf-btn perf-btn--danger" @click="confirmarRemover">
              <q-icon name="delete_forever" size="16px" />
              Remover
            </button>
          </footer>
        </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  useAdminPerfisStore,
  type Perfil,
} from '@/stores/admin/perfis.store'

const $q = useQuasar()
const store = useAdminPerfisStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Estado derivado
// ============================================================
const temFiltros = computed(
  () => !!store.pesquisa || !!store.filtroEstado,
)

// ============================================================
// Helpers
// ============================================================
function totalPermissoes(p: Perfil): number {
  return p.permissoes.reduce((soma, perm) => {
    return (
      soma +
      (perm.ver ? 1 : 0) +
      (perm.criar ? 1 : 0) +
      (perm.editar ? 1 : 0) +
      (perm.apagar ? 1 : 0)
    )
  }, 0)
}

// ============================================================
// Acções
// ============================================================
async function guardar() {
  const p = await store.guardar()
  if (!p) {
    if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
    return
  }
  $q.notify({
    type: 'positive',
    message:
      store.modoForm === 'criar'
        ? `Perfil «${p.label}» criado`
        : `Perfil «${p.label}» actualizado`,
    position: 'top',
  })
}

function clonar(p: Perfil) {
  $q.dialog({
    title: 'Clonar perfil',
    message: `Criar uma cópia de «${p.label}» com as mesmas permissões?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Clonar', color: 'primary', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    const novo = await store.clonar(p)
    if (novo) {
      $q.notify({
        type: 'positive',
        message: `Perfil «${novo.label}» criado`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

function alternarEstado(p: Perfil) {
  const bloquear = p.estado === 'Ativo'

  $q.dialog({
    title: bloquear ? 'Bloquear perfil' : 'Desbloquear perfil',
    message: bloquear
      ? `O perfil «${p.label}» deixará de poder ser atribuído a novos utilizadores.`
      : `O perfil «${p.label}» voltará a poder ser atribuído.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: {
      label: bloquear ? 'Bloquear' : 'Desbloquear',
      color: bloquear ? 'negative' : 'primary',
      unelevated: true,
    },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.alternarEstado(p)
    if (ok) {
      $q.notify({
        type: bloquear ? 'warning' : 'positive',
        message: bloquear
          ? `Perfil «${p.label}» bloqueado.`
          : `Perfil «${p.label}» desbloqueado.`,
        position: 'top',
      })
    }
  })
}

async function confirmarRemover() {
  const p = store.perfilARemover
  if (!p) return
  const ok = await store.confirmarRemover()
  if (ok) {
    $q.notify({
      type: 'positive',
      message: `Perfil «${p.label}» removido.`,
      position: 'top',
    })
  } else if (store.erro) {
    $q.notify({ type: 'negative', message: store.erro, position: 'top' })
  }
}

function editarDoDetalhe() {
  const p = store.perfilDetalhe
  if (!p) return
  store.modalDetalhes = false
  store.abrirEditar(p)
}

async function exportarExcel() {
  const blob = await store.exportarXlsx()
  if (!blob) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar Excel.',
      position: 'top',
    })
    return
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `admin-perfis-${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Ficheiro Excel exportado.',
    position: 'top',
  })
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

.perf-skeleton {
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
    width: 340px;
    max-width: 70%;
  }
  .sk-sub {
    @extend %sk-block;
    height: 16px;
    width: 480px;
    max-width: 90%;
  }
}

.sk-kpis {
  display: grid;
  grid-template-columns: 1.2fr repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sk-kpi {
  @extend %sk-block;
  height: 100px;
  border-radius: 18px;
}

.sk-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.sk-search {
  @extend %sk-block;
  flex: 1;
  min-width: 240px;
  height: 46px;
  border-radius: 14px;
}

.sk-select {
  @extend %sk-block;
  width: 200px;
  height: 46px;
  border-radius: 14px;
}

.sk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.sk-card {
  @extend %sk-block;
  height: 220px;
  border-radius: 18px;
}

.perf-erro {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 13px;
  margin-bottom: 16px;
}

/* ============================================================ */
/* Página                                                       */
/* ============================================================ */
.perf-page {
  --u-ink: var(--sicam-ink, #0f172a);
  --u-muted: var(--sicam-muted, #64748b);
  --u-line: var(--sicam-line, #e5ebe8);
  --u-line-soft: var(--sicam-line-soft, #eef2f0);

  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

.perf-head {
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
    color: var(--u-ink);
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 14px;
    color: var(--u-muted);
    margin: 0;
  }

  &__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
}

.perf-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  padding: 11px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, transform 0.1s;

  &--compact {
    padding: 8px 14px;
    font-size: 13px;
  }

  &--primary {
    background: #064e3b;
    color: #fff;

    &:hover:not(:disabled) {
      background: #047857;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &--outline {
    background: #fff;
    color: var(--u-ink);
    border: 1px solid var(--u-line);

    &:hover:not(:disabled) {
      background: var(--sicam-surface-hover, #f6f9f8);
    }
  }

  &--danger {
    background: #dc2626;
    color: #fff;

    &:hover:not(:disabled) {
      background: #b91c1c;
    }
  }
}

/* KPIs */
.perf-kpis {
  display: grid;
  grid-template-columns: 1.2fr repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 450px) {
    grid-template-columns: 1fr;
  }
}

.perf-kpi {
  background: #fff;
  border: 1px solid var(--u-line);
  border-radius: 18px;
  padding: 16px;

  &__icon {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    margin-bottom: 14px;
    background: #ecfdf5;
    color: #065f46;

    &--success {
      background: #ecfdf5;
      color: #065f46;
    }
    &--critical {
      background: #fef2f2;
      color: #991b1b;
    }
    &--info {
      background: #dbeafe;
      color: #1d4ed8;
    }
  }

  &__value {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--u-ink);
    font-variant-numeric: tabular-nums;
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-top: 8px;
  }

  &--total {
    background: linear-gradient(150deg, #065f46 0%, #04261d 100%);
    border-color: transparent;

    .perf-kpi__icon {
      background: rgba(250, 204, 21, 0.16);
      color: #facc15;
    }
    .perf-kpi__value {
      color: #fff;
    }
    .perf-kpi__label {
      color: #d5f0e4;
    }
  }
}

/* Filtros */
.perf-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.perf-search {
  flex: 1;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--u-line);
  border-radius: 14px;
  padding: 0 12px 0 14px;
  height: 46px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  }

  &__icon {
    color: var(--u-muted);
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    background: transparent;
    font-size: 14px;
    font-family: inherit;
    color: var(--u-ink);

    &:focus {
      outline: 0;
    }
    &::placeholder {
      color: #94a3b8;
    }
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

    &:hover {
      background: #dde5e1;
    }
  }
}

.perf-select {
  height: 46px;
  min-width: 170px;
  appearance: none;
  border: 1px solid var(--u-line);
  border-radius: 14px;
  background: #fff;
  padding: 0 16px;
  font-size: 14px;
  font-family: inherit;
  color: var(--u-ink);
  cursor: pointer;

  &:focus {
    outline: 0;
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  }
}

/* Grid de perfis */
.perf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.perf-card {
  background: #fff;
  border: 1px solid var(--u-line);
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover {
    border-color: #a7e3c8;
    box-shadow: 0 4px 16px rgba(6, 95, 70, 0.06);
  }

  &--bloqueado {
    opacity: 0.75;
    background: #fafafa;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.3;

    b {
      font-size: 15px;
      font-weight: 700;
      color: var(--u-ink);
    }
    small {
      font-size: 12px;
      color: var(--u-muted);
      font-family: monospace;
    }
  }

  &__desc {
    font-size: 13px;
    color: #475569;
    margin: 0;
    line-height: 1.5;
    min-height: 20px;
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: var(--u-muted);
  }

  &__stat {
    display: inline-flex;
    align-items: center;
    gap: 5px;

    &--sys {
      color: #065f46;
      font-weight: 600;
    }
  }

  &__actions {
    display: flex;
    gap: 4px;
    padding-top: 8px;
    border-top: 1px solid var(--u-line-soft);
    margin-top: auto;
  }
}

.perf-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;

  &--ok {
    background: #ecfdf5;
    color: #065f46;
  }
  &--blocked {
    background: #fef2f2;
    color: #991b1b;
  }
}

.perf-action {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--u-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: #ecfdf5;
    color: #065f46;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &--danger:hover:not(:disabled) {
    background: #fef2f2;
    color: #991b1b;
  }

  &--ok {
    color: #059669;
  }
}

.perf-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 20px;

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

  b {
    font-size: 16px;
    color: var(--u-ink);
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--u-muted);
  }
}

/* Modais */
.modal {
  background: #fff;
  border-radius: 16px;
  width: 90vw;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;

  &--wide {
    max-width: 780px;
  }
  &--sm {
    max-width: 440px;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid var(--u-line-soft);
    flex-shrink: 0;
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--u-ink);
    margin: 0;
  }

  &__sub {
    font-size: 12px;
    color: var(--u-muted);
  }

  &__close {
    background: none;
    border: 0;
    color: var(--u-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;

    &:hover {
      background: #f6f9f8;
      color: var(--u-ink);
    }
  }

  &__body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid var(--u-line-soft);
    background: #fafbfa;
    flex-shrink: 0;
  }
}

/* Formulário */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 22px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.field {
  display: block;

  &__label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--u-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;

    em {
      color: #dc2626;
      font-style: normal;
      margin-left: 2px;
    }
  }

  &__input {
    display: block;
    width: 100%;
    padding: 12px 14px;
    border: 2px solid var(--u-line);
    border-radius: 10px;
    background: #fff;
    color: var(--u-ink);
    font-family: inherit;
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:focus {
      outline: 0;
      border-color: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
      background: #fafefc;
    }

    &--key {
      font-family: monospace;
    }

    &--color {
      padding: 4px;
      height: 46px;
      cursor: pointer;
    }
  }
}

/* Matriz de permissões */
.perm-section {
  &__head {
    margin-bottom: 14px;

    h3 {
      font-size: 14px;
      font-weight: 700;
      color: var(--u-ink);
      margin: 0 0 4px;
    }

    p {
      font-size: 12px;
      color: var(--u-muted);
      margin: 0;
    }
  }
}

.perm-group {
  margin-bottom: 16px;
  border: 1px solid var(--u-line);
  border-radius: 12px;
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #f6f9f8;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    color: var(--u-ink);
    user-select: none;

    &:hover {
      background: #ecfdf5;
    }

    b {
      flex: 1;
    }
  }

  &__all {
    color: var(--u-muted);
    opacity: 0.6;
  }
}

.perm-table {
  background: #fff;

  &__head {
    display: grid;
    grid-template-columns: 1fr repeat(4, 60px);
    padding: 8px 14px;
    background: #fafbfa;
    border-bottom: 1px solid var(--u-line-soft);
    font-size: 11px;
    font-weight: 700;
    color: var(--u-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr repeat(4, 60px);
    padding: 8px 14px;
    border-bottom: 1px solid var(--u-line-soft);
    align-items: center;

    &:last-child {
      border-bottom: 0;
    }

    &:hover {
      background: #fafefc;
    }
  }

  &__col-modulo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--u-ink);

    &--clickable {
      cursor: pointer;
      border-radius: 6px;
      padding: 2px 6px;
      margin-left: -6px;

      &:hover {
        background: #ecfdf5;
      }
    }
  }

  &__col-acao {
    display: grid;
    place-items: center;

    input[type='checkbox'] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #065f46;
    }
  }
}

/* Detalhes */
.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-desc {
  font-size: 13px;
  color: #475569;
  margin: 0 0 16px;
  padding: 12px 14px;
  background: #f6f9f8;
  border-radius: 10px;
  line-height: 1.5;
}

.detail-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 22px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  &__item {
    background: #fff;
    border: 1px solid var(--u-line);
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      font-size: 10px;
      font-weight: 700;
      color: var(--u-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    b {
      font-size: 16px;
      font-weight: 800;
      color: var(--u-ink);
    }
  }
}

.detail-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--u-ink);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px;
}

/* Confirmação de remoção */
.confirm-remove {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 0 4px;

  &__icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #fef2f2;
    color: #dc2626;
    margin-bottom: 14px;
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--u-ink);
    margin: 0 0 8px;
  }

  &__text {
    font-size: 13px;
    color: #475569;
    line-height: 1.6;
    margin: 0;

    b {
      color: #991b1b;
    }
  }
}
</style>