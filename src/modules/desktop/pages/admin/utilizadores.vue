<template>
  <q-page class="util-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="util-skeleton">
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
      <div class="sk-table">
        <div v-for="i in 8" :key="`sk-row-${i}`" class="sk-row" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="util-head">
        <div>
          <h1 class="util-head__title">Utilizadores</h1>
          <p class="util-head__sub">
            Contas, perfis e permissões de acesso ao sistema
          </p>
        </div>

        <div class="util-head__actions">
          <button
            type="button"
            class="util-btn util-btn--outline"
            :disabled="store.aCarregar"
            @click="exportarExcel"
          >
            <q-icon name="file_download" size="18px" />
            Excel
          </button>
          <button
            type="button"
            class="util-btn util-btn--primary"
            @click="store.abrirCriar"
          >
            <q-icon name="person_add" size="18px" />
            Novo utilizador
          </button>
        </div>
      </header>

      <!-- ERRO -->
      <div v-if="store.erro" class="util-erro">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- KPIs -->
      <section class="util-kpis" aria-label="Resumo">
        <article class="util-kpi util-kpi--total">
          <div class="util-kpi__icon"><q-icon name="people" size="22px" /></div>
          <div class="util-kpi__value">{{ store.kpis.total }}</div>
          <div class="util-kpi__label">Total de utilizadores</div>
        </article>

        <article class="util-kpi">
          <div class="util-kpi__icon util-kpi__icon--success">
            <q-icon name="check_circle" size="22px" />
          </div>
          <div class="util-kpi__value">{{ store.kpis.activos }}</div>
          <div class="util-kpi__label">Activos</div>
        </article>

        <article class="util-kpi">
          <div class="util-kpi__icon util-kpi__icon--critical">
            <q-icon name="block" size="22px" />
          </div>
          <div class="util-kpi__value">{{ store.kpis.bloqueados }}</div>
          <div class="util-kpi__label">Bloqueados</div>
        </article>

        <article class="util-kpi">
          <div class="util-kpi__icon util-kpi__icon--info">
            <q-icon name="wifi_tethering" size="22px" />
          </div>
          <div class="util-kpi__value">{{ store.kpis.online }}</div>
          <div class="util-kpi__label">Online agora</div>
        </article>
      </section>

      <!-- FILTROS -->
      <section class="util-filters" aria-label="Filtros">
        <label class="util-search">
          <q-icon name="search" size="20px" class="util-search__icon" />
          <input
            v-model="store.pesquisa"
            type="text"
            class="util-search__input"
            placeholder="Pesquisar por nome ou e-mail"
          />
          <button
            v-if="store.pesquisa"
            type="button"
            class="util-search__clear"
            @click="store.pesquisa = ''"
          >
            <q-icon name="close" size="16px" />
          </button>
        </label>

        <label class="util-select">
          <q-icon name="shield" size="18px" class="util-select__icon" />
          <select v-model="store.filtroPerfil" class="util-select__field">
            <option value="">Todos os perfis</option>
            <option v-for="p in store.perfis" :key="p.key" :value="p.key">
              {{ p.label }}
            </option>
          </select>
          <q-icon name="expand_more" size="18px" class="util-select__chevron" />
        </label>

        <div class="util-chips" role="group">
          <button
            v-for="f in store.filtrosEstado"
            :key="f.valor"
            type="button"
            class="util-chip"
            :class="{ 'util-chip--active': store.filtroEstado === f.valor }"
            @click="store.filtroEstado = f.valor"
          >
            {{ f.label }}
            <span class="util-chip__n">{{ f.n }}</span>
          </button>
        </div>

        <button
          v-if="temFiltros"
          type="button"
          class="util-btn util-btn--outline util-btn--compact"
          @click="store.limparFiltros"
        >
          <q-icon name="close" size="16px" />
          Limpar
        </button>
      </section>

      <!-- TABELA -->
      <section class="util-table-wrap">
        <div class="util-table-scroll">
          <table class="util-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Perfil</th>
                <th>Posto</th>
                <th>Estado</th>
                <th>Último acesso</th>
                <th class="util-table__th-actions">
                  <span class="util-sr">Acções</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="u in store.paginaVisivel"
                :key="u.id"
                class="util-table__row"
                :class="{
                  'util-table__row--bloqueado': u.estado === 'Bloqueado',
                }"
              >
                <td>
                  <div class="util-user">
                    <div
                      class="util-user__avatar"
                      :class="`util-user__avatar--${u.perfil}`"
                    >
                      {{ store.iniciaisUtilizador(u.nome) }}
                    </div>
                    <div class="util-user__info">
                      <b>{{ u.nome }}</b>
                      <small>{{ u.email }}</small>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="util-badge" :class="`util-badge--${u.perfil}`">
                    {{ u.perfilLabel }}
                  </span>
                </td>

                <td class="util-table__posto">{{ u.posto }}</td>

                <td>
                  <span
                    class="util-estado"
                    :class="`util-estado--${u.estado === 'Ativo' ? 'regular' : 'critico'}`"
                  >
                    {{ u.estado === 'Ativo' ? 'Activo' : 'Bloqueado' }}
                  </span>
                </td>

                <td class="util-table__time">{{ u.ultimoAcesso }}</td>

                <td class="util-table__actions">
                  <button
                    type="button"
                    class="util-action"
                    @click="store.abrirDetalhes(u)"
                  >
                    <q-icon name="visibility" size="18px" />
                    <q-tooltip>Ver</q-tooltip>
                  </button>

                  <button
                    type="button"
                    class="util-action"
                    @click="store.abrirEditar(u)"
                  >
                    <q-icon name="edit" size="18px" />
                    <q-tooltip>Editar</q-tooltip>
                  </button>

                  <button
                    type="button"
                    class="util-action"
                    @click="store.abrirAlterarSenha(u)"
                  >
                    <q-icon name="lock_reset" size="18px" />
                    <q-tooltip>Alterar senha</q-tooltip>
                  </button>

                  <button
                    type="button"
                    class="util-action"
                    :class="u.estado === 'Ativo' ? 'util-action--danger' : 'util-action--ok'"
                    @click="pedirAlternarEstado(u)"
                  >
                    <q-icon
                      :name="u.estado === 'Ativo' ? 'block' : 'check_circle'"
                      size="18px"
                    />
                    <q-tooltip>{{
                      u.estado === 'Ativo' ? 'Bloquear' : 'Desbloquear'
                    }}</q-tooltip>
                  </button>
                </td>
              </tr>

              <tr v-if="!store.paginaVisivel.length">
                <td colspan="6">
                  <div class="util-empty">
                    <div class="util-empty__icon">
                      <q-icon name="person_search" size="32px" />
                    </div>
                    <b>Nenhum utilizador encontrado</b>
                    <p>Tente outro nome, perfil ou estado.</p>
                    <button
                      type="button"
                      class="util-empty__btn"
                      @click="store.limparFiltros"
                    >
                      Limpar filtros
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <footer v-if="store.filtrados.length" class="util-pagination">
          <div class="util-pagination__info">
            A mostrar
            <b>{{ store.inicioPagina + 1 }}–{{ store.fimPagina }}</b>
            de <b>{{ store.filtrados.length }}</b>
          </div>

          <nav class="util-pagination__controls">
            <button
              type="button"
              class="util-pagination__btn"
              :disabled="store.paginaActual <= 1"
              @click="store.paginaActual--"
            >
              <q-icon name="chevron_left" size="18px" />
              <span class="util-pagination__txt">Anterior</span>
            </button>

            <button
              v-for="p in store.paginasVisiveis"
              :key="p"
              type="button"
              class="util-pagination__num"
              :class="{ 'util-pagination__num--active': p === store.paginaActual }"
              @click="store.paginaActual = p"
            >
              {{ p }}
            </button>

            <button
              type="button"
              class="util-pagination__btn"
              :disabled="store.paginaActual >= store.totalPaginas"
              @click="store.paginaActual++"
            >
              <span class="util-pagination__txt">Próxima</span>
              <q-icon name="chevron_right" size="18px" />
            </button>
          </nav>
        </footer>
      </section>

      <!-- MODAL — CRIAR/EDITAR -->
      <q-dialog v-model="store.modalForm" persistent>
        <q-card class="modal modal--steps">
          <header class="modal__head">
            <div>
              <h2 class="modal__title">
                {{
                  store.modoForm === 'criar'
                    ? 'Novo utilizador'
                    : 'Editar utilizador'
                }}
              </h2>
              <small class="modal__sub">
                Passo {{ store.passo }} de 3 ·
                {{
                  store.passo === 1
                    ? 'Dados pessoais'
                    : store.passo === 2
                      ? 'Segurança'
                      : 'Confirmação'
                }}
              </small>
            </div>
            <button class="modal__close" @click="store.fecharForm">
              <q-icon name="close" size="20px" />
            </button>
          </header>

          <div class="steps">
            <div
              v-for="n in 3"
              :key="n"
              class="steps__item"
              :class="{
                'steps__item--done': n < store.passo,
                'steps__item--active': n === store.passo,
              }"
            >
              <div class="steps__dot">
                <q-icon v-if="n < store.passo" name="check" size="14px" />
                <span v-else>{{ n }}</span>
              </div>
              <div class="steps__label">
                {{ n === 1 ? 'Dados' : n === 2 ? 'Segurança' : 'Resumo' }}
              </div>
              <div v-if="n < 3" class="steps__line" />
            </div>
          </div>

          <div class="modal__body">
            <!-- PASSO 1 -->
            <div v-if="store.passo === 1" class="form-grid">
              <label class="field">
                <span class="field__label">Nome completo <em>*</em></span>
                <input
                  v-model.trim="store.form.nome"
                  class="field__input"
                  placeholder="Ex.: Agente Chissano"
                />
              </label>

              <label class="field">
                <span class="field__label">E-mail <em>*</em></span>
                <input
                  v-model.trim="store.form.email"
                  type="email"
                  class="field__input"
                  placeholder="nome@sicam.gov.mz"
                />
              </label>

              <label class="field">
                <span class="field__label">Telefone</span>
                <input
                  v-model.trim="store.form.telefone"
                  class="field__input"
                  placeholder="+258 84 000 0000"
                />
              </label>

              <div class="form-row">
                <label class="field">
                  <span class="field__label">Perfil <em>*</em></span>
                  <select v-model="store.form.perfil" class="field__input">
                    <option value="">Selecione…</option>
                    <option v-for="p in store.perfis" :key="p.key" :value="p.key">
                      {{ p.label }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span class="field__label">Posto <em>*</em></span>
                  <select v-model="store.form.posto" class="field__input">
                    <option value="">Selecione…</option>
                    <option v-for="p in store.postos" :key="p" :value="p">
                      {{ p }}
                    </option>
                  </select>
                </label>
              </div>
            </div>

            <!-- PASSO 2 -->
            <div v-else-if="store.passo === 2" class="form-grid">
              <template v-if="store.modoForm === 'criar'">
                <label class="field">
                  <span class="field__label">Senha inicial <em>*</em></span>
                  <input
                    v-model="store.form.senha"
                    type="password"
                    class="field__input"
                    placeholder="Mínimo 8 caracteres"
                  />
                </label>

                <label class="field">
                  <span class="field__label">Confirmar senha <em>*</em></span>
                  <input
                    v-model="store.form.confirmar"
                    type="password"
                    class="field__input"
                    placeholder="Repita a senha"
                  />
                </label>

                <p
                  v-if="
                    store.form.senha &&
                    store.form.senha !== store.form.confirmar
                  "
                  class="field__erro"
                >
                  As senhas não coincidem.
                </p>
              </template>

              <p v-else class="info-box">
                <q-icon name="info" size="18px" />
                Para alterar a senha use o botão <b>Alterar senha</b> na tabela.
              </p>

              <label class="field field--check">
                <input
                  type="checkbox"
                  v-model="store.form.forcarAlteracao"
                />
                <span>Forçar alteração de senha no primeiro login</span>
              </label>

              <label class="field">
                <span class="field__label">Estado</span>
                <select v-model="store.form.estado" class="field__input">
                  <option value="Ativo">Activo</option>
                  <option value="Bloqueado">Bloqueado</option>
                </select>
              </label>
            </div>

            <!-- PASSO 3 -->
            <div v-else class="confirmacao">
              <div class="confirmacao__icon">
                <q-icon name="fact_check" size="40px" />
              </div>
              <h3 class="confirmacao__title">
                {{
                  store.modoForm === 'criar'
                    ? 'Confirmar novo utilizador'
                    : 'Confirmar alterações'
                }}
              </h3>

              <div class="confirmacao__grid">
                <div class="confirmacao__row">
                  <span>Nome</span>
                  <b>{{ store.form.nome || '—' }}</b>
                </div>
                <div class="confirmacao__row">
                  <span>E-mail</span>
                  <b>{{ store.form.email || '—' }}</b>
                </div>
                <div v-if="store.form.telefone" class="confirmacao__row">
                  <span>Telefone</span>
                  <b>{{ store.form.telefone }}</b>
                </div>
                <div class="confirmacao__row">
                  <span>Perfil</span>
                  <b>{{
                    store.form.perfil ? store.labelPerfil(store.form.perfil) : '—'
                  }}</b>
                </div>
                <div class="confirmacao__row">
                  <span>Posto</span>
                  <b>{{ store.form.posto || '—' }}</b>
                </div>
                <div class="confirmacao__row">
                  <span>Estado</span>
                  <b>{{ store.form.estado }}</b>
                </div>
              </div>
            </div>
          </div>

          <footer class="modal__foot">
            <button
              v-if="store.passo === 1"
              class="util-btn util-btn--outline"
              @click="store.fecharForm"
            >
              Cancelar
            </button>
            <button
              v-else
              class="util-btn util-btn--outline"
              @click="store.passoAnterior"
            >
              <q-icon name="arrow_back" size="16px" />
              Voltar
            </button>

            <button
              v-if="store.passo < 3"
              class="util-btn util-btn--primary"
              :disabled="
                store.passo === 1 ? !store.passo1Valido : !store.passo2Valido
              "
              @click="store.proximoPasso"
            >
              Próximo
              <q-icon name="arrow_forward" size="16px" />
            </button>

            <button
              v-else
              class="util-btn util-btn--primary"
              :disabled="!store.formValido || store.aSalvar"
              @click="guardar"
            >
              <q-icon name="save" size="16px" />
              {{
                store.aSalvar
                  ? 'A guardar…'
                  : store.modoForm === 'criar'
                    ? 'Criar utilizador'
                    : 'Guardar'
              }}
            </button>
          </footer>
        </q-card>
      </q-dialog>

      <!-- MODAL — DETALHES -->
      <q-dialog v-model="store.modalDetalhes">
        <q-card v-if="store.utilizadorDetalhe" class="modal">
          <header class="modal__head">
            <div class="detail-head">
              <div
                class="util-user__avatar"
                :class="`util-user__avatar--${store.utilizadorDetalhe.perfil}`"
              >
                {{ store.iniciaisUtilizador(store.utilizadorDetalhe.nome) }}
              </div>
              <div>
                <h2 class="modal__title">
                  {{ store.utilizadorDetalhe.nome }}
                </h2>
                <small class="modal__sub">{{
                  store.utilizadorDetalhe.email
                }}</small>
              </div>
            </div>
            <button class="modal__close" @click="store.modalDetalhes = false">
              <q-icon name="close" size="20px" />
            </button>
          </header>

          <div class="modal__body">
            <div class="detail-row">
              <span>Perfil</span>
              <span
                class="util-badge"
                :class="`util-badge--${store.utilizadorDetalhe.perfil}`"
              >
                {{ store.utilizadorDetalhe.perfilLabel }}
              </span>
            </div>
            <div class="detail-row">
              <span>Nº ID</span>
              <b>{{ store.utilizadorDetalhe.numeroId }}</b>
            </div>
            <div class="detail-row">
              <span>Posto</span>
              <b>{{ store.utilizadorDetalhe.posto }}</b>
            </div>
            <div class="detail-row">
              <span>Função</span>
              <b>{{ store.utilizadorDetalhe.funcao }}</b>
            </div>
            <div class="detail-row">
              <span>Estado</span>
              <span
                class="util-estado"
                :class="`util-estado--${store.utilizadorDetalhe.estado === 'Ativo' ? 'regular' : 'critico'}`"
              >
                {{ store.utilizadorDetalhe.estado }}
              </span>
            </div>
            <div class="detail-row">
              <span>Último acesso</span>
              <b>{{ store.utilizadorDetalhe.ultimoAcesso }}</b>
            </div>
            <div v-if="store.utilizadorDetalhe.telefone" class="detail-row">
              <span>Telefone</span>
              <b>{{ store.utilizadorDetalhe.telefone }}</b>
            </div>
          </div>

          <footer class="modal__foot">
            <button
              class="util-btn util-btn--outline"
              @click="store.modalDetalhes = false"
            >
              Fechar
            </button>
            <button
              class="util-btn util-btn--primary"
              @click="
                store.modalDetalhes = false;
                store.abrirEditar(store.utilizadorDetalhe!)
              "
            >
              <q-icon name="edit" size="16px" />
              Editar
            </button>
          </footer>
        </q-card>
      </q-dialog>

      <!-- MODAL — ALTERAR SENHA -->
      <q-dialog v-model="store.modalSenha" persistent>
        <q-card v-if="store.utilizadorSenha" class="modal">
          <header class="modal__head">
            <div>
              <h2 class="modal__title">Alterar senha</h2>
              <small class="modal__sub">{{ store.utilizadorSenha.nome }}</small>
            </div>
            <button class="modal__close" @click="store.fecharSenha">
              <q-icon name="close" size="20px" />
            </button>
          </header>

          <div class="modal__body">
            <label class="field">
              <span class="field__label">Nova senha <em>*</em></span>
              <input
                v-model="store.form.senha"
                type="password"
                class="field__input"
                placeholder="Mínimo 8 caracteres"
              />
            </label>

            <label class="field">
              <span class="field__label">Confirmar senha <em>*</em></span>
              <input
                v-model="store.form.confirmar"
                type="password"
                class="field__input"
                placeholder="Repita a senha"
              />
            </label>

            <label class="field field--check">
              <input type="checkbox" v-model="store.form.forcarAlteracao" />
              <span>Forçar alteração no próximo login</span>
            </label>
          </div>

          <footer class="modal__foot">
            <button class="util-btn util-btn--outline" @click="store.fecharSenha">
              Cancelar
            </button>
            <button
              class="util-btn util-btn--primary"
              :disabled="
                store.form.senha.length < 8 ||
                store.form.senha !== store.form.confirmar ||
                store.aAlterarSenha
              "
              @click="guardarSenha"
            >
              <q-icon name="lock_reset" size="16px" />
              {{ store.aAlterarSenha ? 'A alterar…' : 'Alterar senha' }}
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
  useAdminUtilizadoresStore,
  type Utilizador,
} from '@/stores/admin/utilizadores.store'

const $q = useQuasar()
const store = useAdminUtilizadoresStore()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Filtros
// ============================================================
const temFiltros = computed(
  () => !!store.pesquisa || !!store.filtroPerfil || !!store.filtroEstado,
)

// ============================================================
// Acções
// ============================================================
async function pedirAlternarEstado(u: Utilizador) {
  const bloquear = u.estado === 'Ativo'

  $q.dialog({
    title: bloquear ? 'Bloquear utilizador' : 'Desbloquear utilizador',
    message: bloquear
      ? `${u.nome} deixará de poder entrar no sistema.`
      : `${u.nome} voltará a poder entrar no sistema.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: {
      label: bloquear ? 'Bloquear' : 'Desbloquear',
      color: bloquear ? 'negative' : 'primary',
      unelevated: true,
    },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.alternarEstado(u)
    if (ok) {
      $q.notify({
        type: bloquear ? 'warning' : 'positive',
        message: bloquear
          ? `${u.nome} foi bloqueado.`
          : `${u.nome} foi desbloqueado.`,
        position: 'top',
      })
    } else if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
  })
}

async function guardar() {
  const u = await store.guardar()
  if (!u) {
    if (store.erro) {
      $q.notify({ type: 'negative', message: store.erro, position: 'top' })
    }
    return
  }
  $q.notify({
    type: 'positive',
    message:
      store.modoForm === 'criar'
        ? `Utilizador ${u.nome} criado`
        : `Utilizador ${u.nome} actualizado`,
    position: 'top',
  })
}

async function guardarSenha() {
  const u = store.utilizadorSenha
  if (!u) return
  const ok = await store.guardarSenha()
  if (!ok) {
    $q.notify({
      type: 'negative',
      message: store.erro ?? 'Senha inválida (mínimo 8 caracteres).',
      position: 'top',
    })
    return
  }
  $q.notify({
    type: 'positive',
    message: `Senha de ${u.nome} alterada`,
    position: 'top',
  })
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
  a.download = `admin-utilizadores-${new Date().toISOString().slice(0, 10)}.xlsx`
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

.util-skeleton {
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
    width: 440px;
    max-width: 80%;
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

.sk-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sk-row {
  @extend %sk-block;
  height: 52px;
  border-radius: 10px;
}

.util-erro {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--sicam-critical-bg, #fef2f2);
  color: var(--sicam-critical-ink, #991b1b);
  font-size: 13px;
  margin-bottom: 16px;
}

/* ============================================================ */
/* Página                                                       */
/* ============================================================ */
.util-page {
  --u-ink: var(--sicam-ink, #0f172a);
  --u-muted: var(--sicam-muted, #64748b);
  --u-line: var(--sicam-line, #e5ebe8);
  --u-line-soft: var(--sicam-line-soft, #eef2f0);

  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

.util-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.util-head {
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

.util-btn {
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
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &:focus-visible {
    outline: 3px solid #10b981;
    outline-offset: 2px;
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
}

/* KPIs */
.util-kpis {
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

.util-kpi {
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
    background: var(--sicam-primary-bg, #ecfdf5);
    color: var(--sicam-primary, #065f46);

    &--success {
      background: var(--sicam-success-bg, #ecfdf5);
      color: var(--sicam-success-ink, #065f46);
    }
    &--critical {
      background: var(--sicam-critical-bg, #fef2f2);
      color: var(--sicam-critical-ink, #991b1b);
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

    .util-kpi__icon {
      background: rgba(250, 204, 21, 0.16);
      color: #facc15;
    }
    .util-kpi__value {
      color: #fff;
    }
    .util-kpi__label {
      color: #d5f0e4;
    }
  }
}

/* Filtros */
.util-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.util-search {
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

.util-select {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--u-line);
  border-radius: 14px;
  height: 46px;
  min-width: 190px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  }

  &__icon {
    position: absolute;
    left: 14px;
    color: var(--u-muted);
    pointer-events: none;
  }
  &__chevron {
    position: absolute;
    right: 12px;
    color: var(--u-muted);
    pointer-events: none;
  }

  &__field {
    width: 100%;
    height: 100%;
    appearance: none;
    border: 0;
    background: transparent;
    padding: 0 36px 0 40px;
    font-size: 14px;
    font-family: inherit;
    color: var(--u-ink);
    cursor: pointer;

    &:focus {
      outline: 0;
    }
  }
}

.util-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.util-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--u-line);
  background: #fff;
  color: #334155;
  border-radius: 99px;
  padding: 8px 8px 8px 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    border-color: #a7e3c8;
    background: #ecfdf5;
  }

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
    &:hover {
      background: #064e3b;
    }
    .util-chip__n {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

/* Tabela */
.util-table-wrap {
  background: #fff;
  border: 1px solid var(--u-line);
  border-radius: 20px;
  overflow: hidden;
}

.util-table-scroll {
  overflow-x: auto;
}

.util-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;

  th {
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: var(--u-muted);
    padding: 14px 16px;
    background: #f6f9f8;
    border-bottom: 1px solid var(--u-line);
    white-space: nowrap;
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--u-ink);
    border-bottom: 1px solid var(--u-line-soft);
    vertical-align: middle;
  }

  &__row {
    transition: background 0.15s;
    &:hover {
      background: #f8fcfa;
    }
    &:last-child td {
      border-bottom: 0;
    }

    &--bloqueado .util-user__avatar,
    &--bloqueado .util-user__info b {
      opacity: 0.6;
    }
  }

  &__posto {
    color: #334155;
    white-space: nowrap;
  }
  &__time {
    color: var(--u-muted);
    font-size: 13px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  &__th-actions {
    width: 150px;
  }
  &__actions {
    text-align: right;
    white-space: nowrap;
  }
}

.util-user {
  display: flex;
  align-items: center;
  gap: 12px;

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 800;
    flex-shrink: 0;

    &--admin {
      background: var(--sicam-critical-bg, #fef2f2);
      color: var(--sicam-critical-ink, #991b1b);
    }
    &--chefe {
      background: var(--sicam-warning-bg, #fffbeb);
      color: var(--sicam-warning-ink, #92400e);
    }
    &--agente {
      background: var(--sicam-neutral-bg, #f1f5f9);
      color: var(--sicam-neutral-ink, #475569);
    }
    &--inatro {
      background: #dbeafe;
      color: #1d4ed8;
    }
    &--gestmul {
      background: #f3e8ff;
      color: #6d28d9;
    }
    &--issm {
      background: var(--sicam-success-bg, #ecfdf5);
      color: var(--sicam-success-ink, #065f46);
    }
    &--prm {
      background: var(--sicam-primary-bg, #ecfdf5);
      color: var(--sicam-primary, #065f46);
    }
    &--cidadao {
      background: var(--sicam-neutral-bg, #f1f5f9);
      color: var(--sicam-neutral-ink, #475569);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
    min-width: 0;

    b {
      font-weight: 700;
      color: var(--u-ink);
    }
    small {
      font-size: 12px;
      color: var(--u-muted);
    }
  }
}

.util-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &--admin {
    background: var(--sicam-critical-bg, #fef2f2);
    color: var(--sicam-critical-ink, #991b1b);
  }
  &--chefe {
    background: var(--sicam-warning-bg, #fffbeb);
    color: var(--sicam-warning-ink, #92400e);
  }
  &--agente {
    background: var(--sicam-neutral-bg, #f1f5f9);
    color: var(--sicam-neutral-ink, #475569);
  }
  &--inatro {
    background: #dbeafe;
    color: #1d4ed8;
  }
  &--gestmul {
    background: #f3e8ff;
    color: #6d28d9;
  }
  &--issm {
    background: var(--sicam-success-bg, #ecfdf5);
    color: var(--sicam-success-ink, #065f46);
  }
  &--prm {
    background: var(--sicam-primary-bg, #ecfdf5);
    color: var(--sicam-primary, #065f46);
  }
  &--cidadao {
    background: var(--sicam-neutral-bg, #f1f5f9);
    color: var(--sicam-neutral-ink, #475569);
  }
}

.util-estado {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--regular {
    background: var(--sicam-success-bg, #ecfdf5);
    color: var(--sicam-success-ink, #065f46);
  }
  &--critico {
    background: var(--sicam-critical-bg, #fef2f2);
    color: var(--sicam-critical-ink, #991b1b);
  }
}

.util-action {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--u-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  margin-left: 2px;

  &:hover {
    background: #ecfdf5;
    color: #065f46;
  }

  &--danger:hover {
    background: var(--sicam-critical-bg, #fef2f2);
    color: var(--sicam-critical-ink, #991b1b);
  }
  &--ok {
    color: #059669;
  }
}

.util-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 44px 20px;

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

    &:hover {
      background: #047857;
    }
  }
}

.util-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-top: 1px solid var(--u-line);
  flex-wrap: wrap;

  &__info {
    font-size: 13px;
    color: var(--u-muted);
    b {
      color: var(--u-ink);
      font-weight: 700;
    }
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background: #fff;
    border: 1px solid var(--u-line);
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--u-ink);
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s, border-color 0.15s;

    &:hover:not(:disabled) {
      background: #ecfdf5;
      border-color: #a7e3c8;
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @media (max-width: 520px) {
      padding: 8px;
    }
  }

  &__txt {
    @media (max-width: 520px) {
      display: none;
    }
  }

  &__num {
    min-width: 36px;
    height: 36px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    color: #334155;
    cursor: pointer;
    font-variant-numeric: tabular-nums;

    &:hover {
      background: #ecfdf5;
    }

    &--active {
      background: #064e3b;
      color: #fff;
      &:hover {
        background: #064e3b;
      }
    }
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

  &--steps {
    max-width: 620px;
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
      background: var(--sicam-surface-hover, #f6f9f8);
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

.steps {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(180deg, #fafbfa 0%, #fff 100%);
  border-bottom: 1px solid var(--u-line-soft);
  flex-shrink: 0;
}

.steps__item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.steps__dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--u-line);
  color: var(--u-muted);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.steps__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--u-muted);
  white-space: nowrap;
  @media (max-width: 600px) {
    display: none;
  }
}

.steps__line {
  flex: 1;
  height: 2px;
  background: var(--u-line);
  margin: 0 10px;
  border-radius: 2px;
}

.steps__item--done {
  .steps__dot {
    background: var(--sicam-success, #059669);
    border-color: var(--sicam-success, #059669);
    color: #fff;
  }
  .steps__label {
    color: var(--sicam-success, #059669);
  }
  .steps__line {
    background: var(--sicam-success, #059669);
  }
}

.steps__item--active {
  .steps__dot {
    background: #064e3b;
    border-color: #064e3b;
    color: #fff;
    transform: scale(1.1);
  }
  .steps__label {
    color: #064e3b;
    font-weight: 700;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.field {
  display: block;

  &--check {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--u-ink);
    cursor: pointer;
    padding: 12px 14px;
    border: 1px solid var(--u-line);
    border-radius: 10px;
    background: #fff;

    &:hover {
      border-color: #10b981;
      background: #f0fdf9;
    }

    input[type='checkbox'] {
      width: 18px;
      height: 18px;
      accent-color: #065f46;
      cursor: pointer;
      flex-shrink: 0;
    }
  }

  &__label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--u-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;

    em {
      color: var(--sicam-critical, #dc2626);
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
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;

    &:focus {
      outline: 0;
      border-color: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
      background: #fafefc;
    }
  }

  &__erro {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--sicam-critical-ink, #991b1b);
    &::before {
      content: '⚠ ';
    }
  }
}

.info-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f6f9f8;
  border: 1px solid var(--u-line);
  border-radius: 12px;
  padding: 14px;
  font-size: 13px;
  color: #475569;
  margin: 0;

  .q-icon {
    color: #065f46;
    flex-shrink: 0;
  }
  b {
    color: var(--u-ink);
  }
}

.confirmacao {
  text-align: center;
  padding: 8px 0;

  &__icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    color: #065f46;
    display: grid;
    place-items: center;
    margin: 0 auto 12px;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--u-ink);
    margin: 0 0 16px;
  }

  &__grid {
    background: var(--sicam-surface-alt, #f6f9f8);
    border-radius: 12px;
    padding: 4px 16px;
    text-align: left;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--u-line-soft);
    &:last-child {
      border-bottom: 0;
    }

    span:first-child {
      font-size: 11px;
      color: var(--u-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
    }
    b {
      font-size: 14px;
      color: var(--u-ink);
      font-weight: 700;
      text-align: right;
    }
  }
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  h2 {
    margin: 0;
  }
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--u-line-soft);

  &:last-child {
    border-bottom: 0;
  }

  > span:first-child {
    font-size: 12px;
    color: var(--u-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  b {
    color: var(--u-ink);
    font-size: 14px;
    text-align: right;
  }
}
</style>