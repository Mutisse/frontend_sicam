<template>
  <q-page class="perfil-page">
    <!-- ============================================================ -->
    <!-- SKELETON — enquanto carrega pela primeira vez                 -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="perfil-page__skeleton">
      <!-- Cabeçalho -->
      <div class="skeleton-head">
        <AppFbLoader variant="card" />
      </div>

      <!-- Accordion -->
      <div class="skeleton-acc">
        <AppFbLoader variant="block" height="60px" />
        <AppFbLoader variant="block" height="60px" />
        <AppFbLoader variant="block" height="60px" />
        <AppFbLoader variant="block" height="60px" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO REAL                                                 -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="perfil-head">
        <div class="perfil-head__avatar">
          <span>{{ store.iniciais }}</span>
        </div>

        <div class="perfil-head__info">
          <h1>{{ store.nome }}</h1>
          <p>
            {{ store.perfilLabel }}
            <span v-if="store.posto !== '—'"> · {{ store.posto }}</span>
          </p>
          <span class="perfil-head__status" :class="{ 'is-on': store.online }">
            <i />
            {{ store.online ? "Online" : "Offline" }}
          </span>
        </div>
      </header>

      <!-- ACCORDION -->
      <section class="accordion">
        <!-- 1. DADOS PESSOAIS -->
        <article class="acc" :class="{ 'acc--open': aberta === 'dados' }">
          <button class="acc__head" @click="alternarSecao('dados')">
            <q-icon name="person" size="18px" />
            <b>Dados pessoais</b>
            <q-icon name="expand_more" size="20px" class="acc__chevron" />
          </button>
          <div v-show="aberta === 'dados'" class="acc__body">
            <div class="field-row">
              <label class="field">
                <span class="field__label">Nome completo</span>
                <input
                  v-model.trim="store.form.nome"
                  class="field__input"
                  type="text"
                />
              </label>
              <label class="field">
                <span class="field__label">Telefone</span>
                <input
                  v-model.trim="store.form.telefone"
                  class="field__input"
                  type="text"
                />
              </label>
            </div>

            <label class="field">
              <span class="field__label">E-mail</span>
              <input
                v-model.trim="store.form.email"
                class="field__input"
                type="email"
              />
            </label>

            <div class="field-row">
              <label class="field">
                <span class="field__label">Nº de identificação</span>
                <input
                  :value="store.numeroId"
                  class="field__input"
                  type="text"
                  disabled
                />
              </label>
              <label class="field">
                <span class="field__label">Função</span>
                <input
                  :value="store.funcao"
                  class="field__input"
                  type="text"
                  disabled
                />
              </label>
            </div>

            <label class="field">
              <span class="field__label">Posto</span>
              <input
                :value="store.posto"
                class="field__input"
                type="text"
                disabled
              />
            </label>

            <footer class="acc__foot">
              <span v-if="store.guardado" class="acc__ok">
                <q-icon name="check_circle" size="16px" /> Guardado
              </span>
              <button
                class="btn btn--primary"
                :disabled="store.aCarregar"
                @click="store.guardarDados()"
              >
                <q-icon name="save" size="16px" /> Guardar alterações
              </button>
            </footer>
          </div>
        </article>

        <!-- 2. PREFERÊNCIAS -->
        <article class="acc" :class="{ 'acc--open': aberta === 'prefs' }">
          <button class="acc__head" @click="alternarSecao('prefs')">
            <q-icon name="settings" size="18px" />
            <b>Preferências do sistema</b>
            <q-icon name="expand_more" size="20px" class="acc__chevron" />
          </button>
          <div v-show="aberta === 'prefs'" class="acc__body">
            <div class="field-row">
              <label class="field">
                <span class="field__label">Tema</span>
                <select v-model="store.preferencias.tema" class="field__input">
                  <option value="claro">Claro</option>
                  <option value="escuro">Escuro</option>
                  <option value="auto">Automático</option>
                </select>
              </label>
              <label class="field">
                <span class="field__label">Idioma</span>
                <select
                  v-model="store.preferencias.idioma"
                  class="field__input"
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>

            <label class="field">
              <span class="field__label">Densidade da interface</span>
              <select
                v-model="store.preferencias.densidade"
                class="field__input"
              >
                <option value="normal">Normal</option>
                <option value="compacta">Compacta</option>
              </select>
            </label>

            <div class="switches">
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="store.preferencias.notif_push"
                />
                <span>Notificações push</span>
              </label>
              <label class="switch">
                <input type="checkbox" v-model="store.preferencias.notif_som" />
                <span>Som de notificações</span>
              </label>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="store.preferencias.notif_email"
                />
                <span>Notificações por e-mail</span>
              </label>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="store.preferencias.modo_offline"
                />
                <span>Modo offline</span>
              </label>
            </div>

            <footer class="acc__foot">
              <button class="btn btn--ghost" @click="store.reporPreferencias()">
                <q-icon name="restart_alt" size="16px" /> Repor
              </button>
              <button
                class="btn btn--primary"
                :disabled="store.aCarregar"
                @click="store.guardarPreferencias()"
              >
                <q-icon name="save" size="16px" /> Guardar preferências
              </button>
            </footer>
          </div>
        </article>

        <!-- 3. SEGURANÇA -->
        <article class="acc" :class="{ 'acc--open': aberta === 'seg' }">
          <button class="acc__head" @click="alternarSecao('seg')">
            <q-icon name="lock" size="18px" />
            <b>Segurança</b>
            <q-icon name="expand_more" size="20px" class="acc__chevron" />
          </button>
          <div v-show="aberta === 'seg'" class="acc__body">
            <label class="field">
              <span class="field__label">Senha actual</span>
              <input
                v-model="store.senhaAtual"
                class="field__input"
                type="password"
                placeholder="Mínimo 6 caracteres"
              />
            </label>
            <label class="field">
              <span class="field__label">Nova senha</span>
              <input
                v-model="store.senhaNova"
                class="field__input"
                type="password"
                placeholder="Mínimo 8 caracteres"
              />
            </label>
            <label class="field">
              <span class="field__label">Confirmar senha</span>
              <input
                v-model="store.senhaConfirmar"
                class="field__input"
                type="password"
                placeholder="Repita a nova senha"
              />
            </label>
            <p
              v-if="store.senhaNova && store.senhaNova !== store.senhaConfirmar"
              class="field__erro"
            >
              As senhas não coincidem.
            </p>
            <footer class="acc__foot">
              <button
                class="btn btn--primary"
                :disabled="!store.senhaValida || store.aAlterarSenha"
                @click="alterarSenha"
              >
                <q-icon name="lock_reset" size="16px" /> Alterar senha
              </button>
            </footer>
          </div>
        </article>

        <!-- 4. SESSÕES -->
        <article class="acc" :class="{ 'acc--open': aberta === 'ses' }">
          <button class="acc__head" @click="alternarSecao('ses')">
            <q-icon name="devices" size="18px" />
            <b>Sessões activas</b>
            <span class="acc__badge">{{ store.sessoes.length }}</span>
            <q-icon name="expand_more" size="20px" class="acc__chevron" />
          </button>
          <div v-show="aberta === 'ses'" class="acc__body acc__body--list">
            <ul class="sessoes">
              <li v-for="s in store.sessoes" :key="s.id" class="sessao">
                <div class="sessao__info">
                  <b>{{ s.dispositivo }}</b>
                  <small>
                    {{ s.local }} · {{ s.ultimo_acesso }}
                    <span v-if="s.atual" class="sessao__atual">
                      · esta sessão</span
                    >
                  </small>
                </div>
                <button
                  v-if="!s.atual"
                  class="btn btn--ghost btn--sm"
                  @click="store.terminarSessao(s.id)"
                >
                  Terminar
                </button>
              </li>
            </ul>
            <footer class="acc__foot">
              <button
                class="btn btn--danger"
                :disabled="store.sessoes.length <= 1"
                @click="encerrarOutras"
              >
                <q-icon name="logout" size="16px" /> Terminar outras sessões
              </button>
            </footer>
          </div>
        </article>

        <!-- 5. SECÇÃO INDIVIDUAL DO PERFIL (dinâmica) -->
        <component :is="secaoIndividual" v-if="secaoIndividual" />
      </section>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, watch, computed, ref, defineAsyncComponent } from "vue";
import { useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { usePerfilStore } from "@/stores/perfil/perfil.store.js";
import AppFbLoader from "@/modules/common/AppFbLoader.vue";

const $q = useQuasar();
const auth = useAuthStore();
const store = usePerfilStore();

// ─── UI local (accordion) ─────────────────────────────────
const aberta = ref<string>("dados");
function alternarSecao(id: string) {
  aberta.value = aberta.value === id ? "" : id;
}

// ─── Mapa de secções individuais por perfil ───────────────
const SECOES: Record<string, any> = {
  issm: defineAsyncComponent(() => import("./secoes/issm.vue")),
  inatro: defineAsyncComponent(() => import("./secoes/inatro.vue")),
  prm: defineAsyncComponent(() => import("./secoes/prm.vue")),
  gestmul: defineAsyncComponent(() => import("./secoes/gestmul.vue")),
  chefe: defineAsyncComponent(() => import("./secoes/chefe.vue")),
};

const secaoIndividual = computed(() => {
  const p = auth.perfil;
  if (!p) return null;
  return SECOES[p] ?? null;
});

// ─── Carregar tudo ao montar ──────────────────────────────
onMounted(() => {
  store.carregar();
});

// ─── Recarregar quando o perfil muda ──────────────────────
watch(
  () => auth.perfil,
  () => store.carregar(),
);

async function alterarSenha() {
  const ok = await store.alterarSenha();
  $q.notify({
    type: ok ? "positive" : "negative",
    message: ok ? "Senha alterada." : (store.erro ?? "Senha inválida."),
    position: "top",
  });
}

function encerrarOutras() {
  $q.dialog({
    title: "Terminar outras sessões",
    message: "As sessões em outros dispositivos serão encerradas.",
    cancel: { label: "Cancelar", flat: true },
    ok: { label: "Terminar", color: "negative", unelevated: true },
    persistent: true,
  }).onOk(async () => {
    await store.terminarOutrasSessoes();
    $q.notify({
      type: "positive",
      message: "Outras sessões encerradas.",
      position: "top",
    });
  });
}
</script>

<style scoped lang="scss">
/* ============================================================ */
/* Página                                                        */
/* ============================================================ */
.perfil-page {
  padding: 24px 20px 48px;
  max-width: 900px;
  margin: 0 auto;
  --p-ink: var(--sicam-ink, #0f172a);
  --p-muted: var(--sicam-muted, #64748b);
  --p-line: var(--sicam-line, #e5ebe8);
  --p-line-soft: var(--sicam-line-soft, #eef2f0);
}

/* ============================================================ */
/* SKELETON                                                      */
/* ============================================================ */
.perfil-page__skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-head {
  padding: 24px;
  background: #fff;
  border: 1px solid var(--p-line);
  border-radius: 18px;
}

.skeleton-acc {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ============================================================ */
/* Cabeçalho                                                    */
/* ============================================================ */
.perfil-head {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: #fff;
  border: 1px solid var(--p-line);
  border-radius: 18px;
  margin-bottom: 20px;

  &__avatar {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, #065f46, #04261d);
    color: #facc15;
    display: grid;
    place-items: center;
    font-size: 28px;
    font-weight: 800;
    flex-shrink: 0;
    overflow: hidden;
  }

  &__info {
    flex: 1;
    min-width: 0;

    h1 {
      font-size: 22px;
      font-weight: 800;
      color: var(--p-ink);
      margin: 0 0 4px;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      margin: 0 0 10px;
      font-size: 13px;
      color: var(--p-muted);
    }
  }

  &__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--p-muted);
    background: #f6f9f8;
    padding: 5px 12px;
    border-radius: 99px;

    i {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #cbd5e1;
    }

    &.is-on i {
      background: #10b981;
    }
  }
}

/* ============================================================ */
/* Accordion                                                    */
/* ============================================================ */
.accordion {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.acc {
  background: #fff;
  border: 1px solid var(--p-line);
  border-radius: 14px;
  overflow: hidden;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:hover {
    border-color: #a7e3c8;
  }

  &--open {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
  }

  &__head {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    background: transparent;
    border: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    color: var(--p-ink);
    text-align: left;
    transition: background 0.15s;

    &:hover {
      background: #f6f9f8;
    }
    .q-icon:first-child {
      color: #065f46;
    }
    b {
      flex: 1;
    }
  }

  &__chevron {
    color: var(--p-muted);
    transition: transform 0.2s;
  }

  &--open &__chevron {
    transform: rotate(180deg);
  }

  &__badge {
    min-width: 22px;
    height: 22px;
    padding: 0 8px;
    display: inline-grid;
    place-items: center;
    border-radius: 99px;
    background: #ecfdf5;
    color: #065f46;
    font-size: 11px;
    font-weight: 700;
  }

  &__body {
    padding: 4px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    border-top: 1px solid var(--p-line-soft);

    &--list {
      padding: 0;
    }
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 8px;
    flex-wrap: wrap;
  }

  &__ok {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #059669;
  }
}

/* ============================================================ */
/* Campos                                                       */
/* ============================================================ */
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.field {
  display: block;

  &__label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--p-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }

  &__input {
    display: block;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--p-line);
    border-radius: 10px;
    font-family: inherit;
    font-size: 14px;
    color: var(--p-ink);
    background: #fff;
    box-sizing: border-box;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;

    &:focus {
      outline: 0;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }

    &:disabled {
      background: #f6f9f8;
      color: var(--p-muted);
      cursor: not-allowed;
    }
  }

  &__erro {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    color: #991b1b;

    &::before {
      content: "⚠ ";
    }
  }
}

/* ============================================================ */
/* Switches                                                     */
/* ============================================================ */
.switches {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
}

.switch {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--p-line);
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--p-ink);
  background: #fff;

  &:hover {
    border-color: #a7e3c8;
    background: #f0fdf9;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #065f46;
    cursor: pointer;
    flex-shrink: 0;
  }
}

/* ============================================================ */
/* Sessões                                                      */
/* ============================================================ */
.sessoes {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sessao {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--p-line-soft);

  &:last-child {
    border-bottom: 0;
  }

  &__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;

    b {
      font-size: 13px;
      font-weight: 700;
      color: var(--p-ink);
    }

    small {
      font-size: 12px;
      color: var(--p-muted);
    }
  }

  &__atual {
    color: #059669;
    font-weight: 600;
  }
}

/* ============================================================ */
/* Botões                                                       */
/* ============================================================ */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  border: 0;
  transition:
    background 0.15s,
    transform 0.1s;

  &--sm {
    padding: 6px 12px;
    font-size: 12px;
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

  &--ghost {
    background: #fff;
    color: var(--p-ink);
    border: 1px solid var(--p-line);

    &:hover:not(:disabled) {
      background: #f6f9f8;
    }
  }

  &--danger {
    background: #dc2626;
    color: #fff;

    &:hover:not(:disabled) {
      background: #b91c1c;
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
</style>