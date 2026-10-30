<template>
  <q-page class="meu-perfil">
    <!-- ============================================================ -->
    <!-- SKELETON — enquanto carrega pela primeira vez                 -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="meu-perfil__skeleton">
      <div class="skeleton-head">
        <AppFbLoader variant="card" />
      </div>

      <div class="skeleton-grid">
        <AppFbLoader variant="block" height="280px" />
        <AppFbLoader variant="block" height="280px" />
        <AppFbLoader variant="block" height="220px" />
        <AppFbLoader variant="block" height="220px" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO REAL                                                 -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="meu-perfil__head">
        <div class="meu-perfil__avatar">{{ store.iniciais }}</div>
        <div class="meu-perfil__info">
          <h1>{{ store.nome }}</h1>
          <p>{{ store.perfilLabel }} · {{ store.posto }}</p>
          <span class="meu-perfil__status" :class="{ 'is-on': store.online }">
            <i />
            {{ store.online ? 'Online' : 'Offline' }}
          </span>
        </div>
      </header>

      <!-- GRELHA -->
      <div class="meu-perfil__grid">
        <!-- DADOS PESSOAIS -->
        <section class="card">
          <header class="card__head">
            <q-icon name="person" size="18px" />
            <h2>Dados pessoais</h2>
          </header>

          <div class="card__body">
            <label class="field">
              <span class="field__label">Nome completo</span>
              <input v-model.trim="store.form.nome" class="field__input" type="text" />
            </label>

            <label class="field">
              <span class="field__label">E-mail</span>
              <input v-model.trim="store.form.email" class="field__input" type="email" />
            </label>

            <label class="field">
              <span class="field__label">Telefone</span>
              <input v-model.trim="store.form.telefone" class="field__input" type="text" />
            </label>

            <div class="field-row">
              <label class="field">
                <span class="field__label">Nº de identificação</span>
                <input :value="store.numeroId" class="field__input" type="text" disabled />
              </label>

              <label class="field">
                <span class="field__label">Função</span>
                <input :value="store.funcao" class="field__input" type="text" disabled />
              </label>
            </div>

            <label class="field">
              <span class="field__label">Posto</span>
              <input :value="store.posto" class="field__input" type="text" disabled />
            </label>
          </div>

          <footer class="card__foot">
            <span v-if="store.guardado" class="card__ok">
              <q-icon name="check_circle" size="16px" />
              Guardado
            </span>
            <button
              class="btn btn--primary"
              :disabled="store.aCarregar"
              @click="store.guardarDados()"
            >
              <q-icon name="save" size="16px" />
              Guardar
            </button>
          </footer>
        </section>

        <!-- PREFERÊNCIAS -->
        <section class="card">
          <header class="card__head">
            <q-icon name="settings" size="18px" />
            <h2>Preferências</h2>
          </header>

          <div class="card__body">
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
              <select v-model="store.preferencias.idioma" class="field__input">
                <option value="pt">Português</option>
                <option value="en">English</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Densidade da interface</span>
              <select v-model="store.preferencias.densidade" class="field__input">
                <option value="normal">Normal</option>
                <option value="compacta">Compacta</option>
              </select>
            </label>

            <div class="switches">
              <label class="switch">
                <input type="checkbox" v-model="store.preferencias.notif_push" />
                <span>Notificações push</span>
              </label>

              <label class="switch">
                <input type="checkbox" v-model="store.preferencias.notif_som" />
                <span>Som de notificações</span>
              </label>

              <label class="switch">
                <input type="checkbox" v-model="store.preferencias.notif_email" />
                <span>Notificações por e-mail</span>
              </label>

              <label class="switch">
                <input type="checkbox" v-model="store.preferencias.modo_offline" />
                <span>Modo offline</span>
              </label>
            </div>
          </div>

          <footer class="card__foot">
            <button class="btn btn--ghost" @click="store.reporPreferencias()">
              <q-icon name="restart_alt" size="16px" />
              Repor
            </button>
            <button
              class="btn btn--primary"
              :disabled="store.aCarregar"
              @click="store.guardarPreferencias()"
            >
              <q-icon name="save" size="16px" />
              Guardar preferências
            </button>
          </footer>
        </section>

        <!-- SEGURANÇA -->
        <section class="card">
          <header class="card__head">
            <q-icon name="lock" size="18px" />
            <h2>Segurança</h2>
          </header>

          <div class="card__body">
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
          </div>

          <footer class="card__foot">
            <button
              class="btn btn--primary"
              :disabled="!store.senhaValida || store.aAlterarSenha"
              @click="alterarSenha"
            >
              <q-icon name="lock_reset" size="16px" />
              Alterar senha
            </button>
          </footer>
        </section>

        <!-- SESSÕES ACTIVAS -->
        <section class="card">
          <header class="card__head">
            <q-icon name="devices" size="18px" />
            <h2>Sessões activas</h2>
          </header>

          <div class="card__body card__body--list">
            <ul class="sessoes">
              <li v-for="s in store.sessoes" :key="s.id" class="sessao">
                <div class="sessao__info">
                  <b>{{ s.dispositivo }}</b>
                  <small>
                    {{ s.local }} · {{ s.ultimo_acesso }}
                    <span v-if="s.atual" class="sessao__atual">· esta sessão</span>
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
          </div>

          <footer class="card__foot">
            <button
              class="btn btn--danger"
              :disabled="store.sessoes.length <= 1"
              @click="encerrarOutras"
            >
              <q-icon name="logout" size="16px" />
              Terminar outras sessões
            </button>
          </footer>
        </section>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
// ⭐ AQUI mudou: useAdminPerfilStore (não usePerfilStore)
import { useAdminPerfilStore } from '@/stores/perfil/admin-perfil.store'
import AppFbLoader from '@/modules/common/AppFbLoader.vue'

const $q = useQuasar()
const store = useAdminPerfilStore()      // ⭐ AQUI também

onMounted(() => {
  store.carregar()
})

async function alterarSenha() {
  const ok = await store.alterarSenha()
  if (ok) {
    $q.notify({
      type: 'positive',
      message: 'Senha alterada com sucesso.',
      position: 'top',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: store.erro ?? 'Senha inválida. Verifique os campos.',
      position: 'top',
    })
  }
}

function encerrarOutras() {
  $q.dialog({
    title: 'Terminar outras sessões',
    message: 'As sessões em outros dispositivos serão encerradas.',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Terminar', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    await store.terminarOutrasSessoes()
    $q.notify({
      type: 'positive',
      message: 'Outras sessões encerradas.',
      position: 'top',
    })
  })
}
</script>

<style scoped lang="scss">
/* ============================================================ */
/* Página                                                        */
/* ============================================================ */
.meu-perfil {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
  --p-ink: var(--sicam-ink, #0f172a);
  --p-muted: var(--sicam-muted, #64748b);
  --p-line: var(--sicam-line, #e5ebe8);
  --p-line-soft: var(--sicam-line-soft, #eef2f0);
}

/* ============================================================ */
/* SKELETON                                                      */
/* ============================================================ */
.meu-perfil__skeleton {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.skeleton-head {
  padding: 22px;
  background: #fff;
  border: 1px solid var(--p-line);
  border-radius: 20px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 16px;
}

/* ============================================================ */
/* Cabeçalho                                                     */
/* ============================================================ */
.meu-perfil__head {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px;
  background: linear-gradient(150deg, #065f46 0%, #04261d 100%);
  border-radius: 20px;
  color: #fff;
  margin-bottom: 22px;
}

.meu-perfil__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #facc15;
  color: #3b2f00;
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 800;
  flex-shrink: 0;
}

.meu-perfil__info {
  flex: 1;
  min-width: 0;

  h1 {
    font-size: 22px;
    font-weight: 800;
    margin: 0 0 4px;
    letter-spacing: -0.02em;
    color: #fff;
  }

  p {
    margin: 0 0 8px;
    font-size: 13px;
    opacity: 0.85;
  }
}

.meu-perfil__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
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

/* ============================================================ */
/* Grelha                                                        */
/* ============================================================ */
.meu-perfil__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 16px;
}

/* ============================================================ */
/* Cards                                                         */
/* ============================================================ */
.card {
  background: #fff;
  border: 1px solid var(--p-line);
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--p-line-soft);
    background: #f6f9f8;

    .q-icon {
      color: #065f46;
    }

    h2 {
      font-size: 14px;
      font-weight: 700;
      color: var(--p-ink);
      margin: 0;
    }
  }

  &__body {
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;

    &--list {
      padding: 0;
    }
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid var(--p-line-soft);
    background: #fafbfa;
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
/* Campos                                                        */
/* ============================================================ */
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
    transition: border-color 0.15s, box-shadow 0.15s;

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
      content: '⚠ ';
    }
  }
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

/* ============================================================ */
/* Switches                                                      */
/* ============================================================ */
.switches {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--p-line-soft);
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

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: #065f46;
    cursor: pointer;
    flex-shrink: 0;
  }
}

/* ============================================================ */
/* Sessões                                                       */
/* ============================================================ */
.sessoes {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sessao {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
/* Botões                                                        */
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
  transition: background 0.15s, transform 0.1s;

  &--sm {
    padding: 6px 10px;
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