<template>
  <div class="sicam-login">
    <div class="sicam-login__wrapper">
      <div class="sicam-login__card">
        <!-- Logo dentro do card -->
        <div class="sicam-login__logo">
          <svg viewBox="0 0 40 40" width="52" height="52" aria-hidden="true">
            <circle cx="20" cy="20" r="19" fill="#ffffff22" />
            <path
              d="M4 20c6-9 12-12 16-12s10 3 16 12c-6 9-12 12-16 12S10 29 4 20z"
              fill="#facc15"
            />
            <circle cx="20" cy="20" r="7" fill="#065f46" />
            <circle cx="20" cy="20" r="3" fill="#fff" />
          </svg>
        </div>

        <h1 class="sicam-login__title">Olho de Águia</h1>
        <p class="sicam-login__sub">Acesso para utilizadores autorizados</p>

        <form class="sicam-login__form" novalidate @submit.prevent="entrar">
          <!-- E-mail -->
          <div class="sicam-login__field">
            <label class="sicam-login__sr" for="login-email">E-mail</label>
            <q-icon name="mail" size="20px" class="sicam-login__icon" />
            <input
              id="login-email"
              v-model.trim="email"
              type="email"
              inputmode="email"
              placeholder="E-mail"
              class="sicam-login__input"
              autocomplete="username"
              :disabled="aEntrar"
            />
          </div>

          <!-- Palavra-passe -->
          <div class="sicam-login__field sicam-login__field--password">
            <label class="sicam-login__sr" for="login-password">
              Palavra-passe
            </label>
            <q-icon name="lock" size="20px" class="sicam-login__icon" />
            <input
              id="login-password"
              v-model="password"
              :type="mostrarPassword ? 'text' : 'password'"
              placeholder="Palavra-passe"
              class="sicam-login__input sicam-login__input--password"
              autocomplete="current-password"
              :disabled="aEntrar"
              @keydown="verificarCaps"
              @keyup="verificarCaps"
              @blur="capsLock = false"
            />
            <button
              type="button"
              class="sicam-login__eye"
              :aria-label="
                mostrarPassword
                  ? 'Esconder palavra-passe'
                  : 'Mostrar palavra-passe'
              "
              :aria-pressed="mostrarPassword"
              @click="mostrarPassword = !mostrarPassword"
            >
              <q-icon
                :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                size="22px"
              />
            </button>
          </div>

          <p v-if="capsLock" class="sicam-login__caps" role="status">
            <q-icon name="keyboard_capslock" size="16px" />
            Caps Lock activado
          </p>

          <label class="sicam-login__remember">
            <input v-model="lembrar" type="checkbox" :disabled="aEntrar" />
            Lembrar-me
          </label>

          <p v-if="auth.erro" class="sicam-login__erro" role="alert">
            <q-icon name="error" size="16px" />
            {{ auth.erro }}
          </p>

          <button
            type="submit"
            class="sicam-login__btn"
            :disabled="!podeEntrar || aEntrar"
          >
            <q-spinner v-if="aEntrar" size="18px" />
            {{ aEntrar ? "A ENTRAR" : "ENTRAR" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()

// ─── Campos (vazios para o utilizador escrever) ──────────────
const email = ref('')
const password = ref('')
const lembrar = ref(false)

// ─── UI ──────────────────────────────────────────────────────
const mostrarPassword = ref(false)
const aEntrar = ref(false)
const capsLock = ref(false)

const podeEntrar = computed(
  () => email.value.length > 0 && password.value.length > 0,
)

function verificarCaps(e: KeyboardEvent) {
  capsLock.value = e.getModifierState?.('CapsLock') ?? false
}

// ─── Login (chama o backend real) ────────────────────────────
async function entrar() {
  if (!podeEntrar.value || aEntrar.value) return

  aEntrar.value = true

  try {
    const ok = await auth.login(email.value.trim(), password.value)

    if (!ok) {
      $q.notify({
        type: 'negative',
        message: auth.erro ?? 'Credenciais inválidas.',
        position: 'top',
      })
      return
    }

    $q.notify({
      type: 'positive',
      message: `Bem-vindo, ${auth.utilizador?.nome ?? 'utilizador'}`,
      position: 'top',
    })

    router.push(auth.rotaInicial)
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erro inesperado. Tente novamente.',
      position: 'top',
    })
  } finally {
    aEntrar.value = false
  }
}
</script>

<style scoped lang="scss">
// ============================================================
// Tela de Login SICAM
// ============================================================
.sicam-login {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 40px 24px 32px;
  background: #f4f8f6;
  font-family: var(
    --sicam-font-family,
    'Inter',
    system-ui,
    -apple-system,
    'Segoe UI',
    sans-serif
  );
}

// ---------- Wrapper do card ----------
.sicam-login__wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

// ---------- Card verde ----------
.sicam-login__card {
  width: 340px;
  max-width: 100%;
  background: var(
    --sicam-gradient-login,
    linear-gradient(155deg, #065f46 0%, #064e3b 100%)
  );
  color: #fff;
  border-radius: 48px 0 48px 0;
  padding: 36px 30px 32px;
  box-shadow: var(--sicam-shadow-xl, 0 24px 48px rgba(6, 78, 59, 0.28));
  text-align: center;
}

.sicam-login__logo {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #ffffff22;
  margin: 0 auto 12px;
  display: grid;
  place-items: center;
}

.sicam-login__title {
  font-size: var(--sicam-font-size-lg, 18px);
  font-weight: var(--sicam-font-weight-semibold, 600);
  letter-spacing: 0.01em;
  color: #fff;
  margin: 0 0 4px;
}

.sicam-login__sub {
  font-size: 13px;
  color: #ffffffb3;
  margin: 0 0 26px;
}

.sicam-login__form {
  text-align: left;
}

.sicam-login__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.sicam-login__field {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #ffffff66;
  margin-bottom: 16px;
  transition: border-color var(--sicam-transition-fast, 0.15s);
}

.sicam-login__field:focus-within {
  border-bottom-color: #fff;
  box-shadow: 0 1px 0 0 #fff;
}

.sicam-login__field:focus-within .sicam-login__icon {
  color: #fff;
}

.sicam-login__icon {
  color: #ffffff99;
  flex-shrink: 0;
  transition: color 0.15s;
}

.sicam-login__input {
  flex: 1;
  min-width: 0;
  background: none;
  border: 0;
  color: #fff;
  padding: 11px 4px;
  font-size: var(--sicam-font-size-md, 15px);
  font-family: inherit;
}

.sicam-login__input::placeholder {
  color: #ffffff88;
}
.sicam-login__input:focus {
  outline: 0;
}
.sicam-login__input:disabled {
  opacity: 0.6;
}
.sicam-login__input--password {
  padding-right: 40px;
}

.sicam-login__input:-webkit-autofill,
.sicam-login__input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  caret-color: #fff;
  transition: background-color 9999s ease-in-out 0s;
}

.sicam-login__eye {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: 0;
  color: #ffffffaa;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  border-radius: var(--sicam-radius-sm, 8px);
  transition: color var(--sicam-transition-fast, 0.15s);
}

.sicam-login__eye:hover {
  color: #fff;
}
.sicam-login__eye:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 1px;
}

.sicam-login__caps {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: -6px 0 14px;
  font-size: 12px;
  font-weight: 600;
  color: #fde68a;
}

.sicam-login__remember {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: var(--sicam-font-size-sm, 13px);
  margin: 4px 0 22px;
  cursor: pointer;
  width: fit-content;
}

.sicam-login__remember input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #fff;
  cursor: pointer;
}

// ---------- Erro ----------
.sicam-login__erro {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 16px;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #fca5a5;
  font-size: 13px;
  font-weight: 600;

  .q-icon {
    color: #f87171;
    flex-shrink: 0;
  }
}

// ---------- Botão ----------
.sicam-login__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: #ffffff1f;
  color: #fff;
  border: 1px solid #ffffff40;
  border-radius: var(--sicam-radius-md, 12px);
  padding: 13px;
  font-family: inherit;
  font-size: var(--sicam-font-size-md, 15px);
  font-weight: var(--sicam-font-weight-semibold, 600);
  letter-spacing: 0.14em;
  cursor: pointer;
  transition:
    background var(--sicam-transition-fast, 0.15s),
    color 0.15s,
    transform 0.1s;
}

.sicam-login__btn:hover:not(:disabled) {
  background: #fff;
  color: #065f46;
}
.sicam-login__btn:active:not(:disabled) {
  transform: scale(0.99);
}
.sicam-login__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.sicam-login__btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

// ============================================================
// MOBILE — card grande, 4 cantos redondos, fundo claro à volta
// ============================================================
@media (max-width: 600px) {
  .sicam-login {
    padding: 20px 14px;
    justify-content: center;
    background: #f4f8f6;
  }

  .sicam-login__wrapper {
    flex: 0 0 auto;
    width: 100%;
    justify-content: center;
  }

  .sicam-login__card {
    width: 100%;
    max-width: 100%;
    min-height: auto;
    border-radius: 48px;
    padding: 44px 28px 40px;
  }

  .sicam-login__logo {
    width: 96px;
    height: 96px;
    margin-bottom: 20px;
  }

  .sicam-login__title {
    font-size: 21px;
  }

  .sicam-login__sub {
    font-size: 14px;
    margin-bottom: 34px;
  }

  .sicam-login__field {
    margin-bottom: 20px;
  }

  .sicam-login__input {
    font-size: 16px;
    padding: 14px 4px;
  }

  .sicam-login__remember {
    font-size: 14px;
    margin: 6px 0 28px;
  }

  .sicam-login__remember input[type='checkbox'] {
    width: 18px;
    height: 18px;
  }

  .sicam-login__btn {
    padding: 16px;
    font-size: 16px;
  }
}
</style>