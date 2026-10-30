<template>
  <div class="agente-perfil">
    <!-- SKELETON -->
    <div v-if="!store.carregado" class="agente-skeleton">
      <div class="sk-hero" />
      <div class="sk-stats" />
      <div class="sk-card" />
      <div class="sk-card" />
    </div>

    <template v-else>
      <!-- ERRO -->
      <div v-if="store.erro" class="agente-erro">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- CARTÃO DO AGENTE -->
      <div class="agente-card agente-card--center agente-perfil__hero">
        <div class="agente-avatar" @click="selecionarFoto">
          <img
            v-if="store.utilizador?.foto_url"
            :src="store.utilizador.foto_url"
            :alt="store.nomeCompleto"
            class="agente-avatar__img"
          />
          <template v-else>{{ store.iniciais }}</template>
          <span
            class="agente-avatar__status"
            :class="{ 'agente-avatar__status--off': !store.online }"
          />
          <input
            ref="fotoInput"
            type="file"
            accept="image/*"
            class="agente-avatar__input"
            @change="onFotoSelecionada"
          />
        </div>

        <h3 class="agente-nome">{{ store.nomeCompleto }}</h3>
        <small class="agente-sub">
          {{ store.funcao }} · {{ store.posto }}
        </small>

        <div class="agente-perfil__id">
          <q-icon name="badge" size="14px" />
          {{ store.numeroAgente }}
        </div>
      </div>

      <!-- STATS RÁPIDAS -->
      <div class="agente-stats">
        <div class="agente-stat">
          <div class="agente-stat__value">{{ store.stats.consultasHoje }}</div>
          <div class="agente-stat__label">Consultas hoje</div>
        </div>
        <div class="agente-stat__divider" />
        <div class="agente-stat">
          <div class="agente-stat__value">{{ store.stats.autosHoje }}</div>
          <div class="agente-stat__label">Autos hoje</div>
        </div>
        <div class="agente-stat__divider" />
        <div class="agente-stat">
          <div class="agente-stat__value">{{ store.stats.anosServico }}</div>
          <div class="agente-stat__label">Anos serviço</div>
        </div>
      </div>

      <!-- HOTLIST -->
      <div class="agente-card">
        <div class="agente-card__head">
          <h3>
            <q-icon name="local_police" size="18px" />
            Hotlist
          </h3>
          <AppBadge
            :variant="store.hotlistPendente ? 'atencao' : 'regular'"
            :label="store.hotlistPendente ? 'Desatualizada' : 'Atualizada'"
          />
        </div>

        <p class="agente-card__desc">
          {{ store.hotlistTotal }} veículos · última sincronização
          {{ store.ultimaSync }}
        </p>

        <div class="agente-progress">
          <div
            class="agente-progress__bar"
            :style="{ width: store.hotlistProgresso + '%' }"
          />
        </div>

        <button
          class="agente-btn agente-btn--outline"
          :disabled="store.aSincronizar"
          @click="sincronizar"
        >
          <q-icon
            :name="store.aSincronizar ? 'sync' : 'refresh'"
            size="18px"
            :class="{ 'agente-spin': store.aSincronizar }"
            class="q-mr-xs"
          />
          {{ store.aSincronizar ? 'A sincronizar…' : 'Sincronizar agora' }}
        </button>
      </div>

      <!-- DISPOSITIVOS -->
      <div class="agente-card">
        <div class="agente-card__head">
          <h3>
            <q-icon name="devices" size="18px" />
            Dispositivos
          </h3>
        </div>

        <div v-for="d in store.dispositivos" :key="d.id" class="agente-row">
          <div class="agente-row__left">
            <q-icon :name="d.icon" size="20px" class="agente-row__icon" />
            <div>
              <b>{{ d.nome }}</b>
              <small>{{ d.detalhe }}</small>
            </div>
          </div>
          <div class="agente-row__right">
            <AppBadge
              :variant="d.ligado ? 'regular' : 'critico'"
              :label="d.ligado ? 'Ligado' : 'Desligado'"
            />
            <button
              class="agente-row__action"
              @click="alternarDispositivo(d.id)"
            >
              <q-icon :name="d.ligado ? 'link_off' : 'link'" size="16px" />
            </button>
          </div>
        </div>
      </div>

      <!-- PREFERÊNCIAS -->
      <div class="agente-card">
        <div class="agente-card__head">
          <h3>
            <q-icon name="settings" size="18px" />
            Preferências
          </h3>
        </div>

        <div class="agente-row agente-row--sem-border">
          <div class="agente-row__left">
            <q-icon name="cloud_off" size="20px" class="agente-row__icon" />
            <div>
              <b>Modo offline</b>
              <small>Guardar consultas localmente</small>
            </div>
          </div>
          <q-toggle v-model="store.offline" color="primary" />
        </div>

        <div class="agente-row agente-row--sem-border">
          <div class="agente-row__left">
            <q-icon name="dark_mode" size="20px" class="agente-row__icon" />
            <div>
              <b>Tema escuro</b>
              <small>Aparência da aplicação</small>
            </div>
          </div>
          <q-toggle v-model="store.temaEscuro" color="primary" />
        </div>

        <div class="agente-row agente-row--sem-border">
          <div class="agente-row__left">
            <q-icon name="notifications" size="20px" class="agente-row__icon" />
            <div>
              <b>Notificações</b>
              <small>Alertas de hotlist em tempo real</small>
            </div>
          </div>
          <q-toggle v-model="store.notificacoes" color="primary" />
        </div>
      </div>

      <!-- SEGURANÇA -->
      <div class="agente-card">
        <div class="agente-card__head">
          <h3>
            <q-icon name="shield" size="18px" />
            Segurança
          </h3>
        </div>

        <button class="agente-menu" @click="editarDados">
          <q-icon name="person" size="20px" />
          <span>Dados pessoais</span>
          <q-icon
            name="chevron_right"
            size="20px"
            class="agente-menu__chevron"
          />
        </button>

        <button class="agente-menu" @click="abrirAlterarSenha">
          <q-icon name="password" size="20px" />
          <span>Alterar PIN</span>
          <q-icon
            name="chevron_right"
            size="20px"
            class="agente-menu__chevron"
          />
        </button>

        <button class="agente-menu" @click="abrirSessoes">
          <q-icon name="devices_other" size="20px" />
          <span>Sessões ativas</span>
          <q-icon
            name="chevron_right"
            size="20px"
            class="agente-menu__chevron"
          />
        </button>

        <button class="agente-menu" @click="abrirAuditoria">
          <q-icon name="history" size="20px" />
          <span>Histórico de auditoria</span>
          <q-icon
            name="chevron_right"
            size="20px"
            class="agente-menu__chevron"
          />
        </button>
      </div>

      <!-- SOBRE -->
      <div class="agente-card agente-about" @click="abrirSobre">
        <q-icon name="info" size="20px" />
        <div class="agente-about__text">
          <b>SICAM · Olho de Águia</b>
          <small>Versão {{ store.versao }} · build {{ store.build }}</small>
        </div>
        <q-icon
          name="chevron_right"
          size="20px"
          class="agente-menu__chevron"
        />
      </div>

      <!-- TERMINAR SESSÃO -->
      <button class="agente-btn agente-btn--danger" @click="confirmarSair">
        <q-icon name="logout" size="18px" class="q-mr-xs" />
        Terminar sessão
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { useAgentePerfilStore } from '@/stores/agente/agente-perfil.store'
import AppBadge from '@/modules/common/AppBadge.vue'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const store = useAgentePerfilStore()

const fotoInput = ref<HTMLInputElement | null>(null)

// ============================================================
// Helpers
// ============================================================
function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Tema escuro real
// ============================================================
watch(
  () => store.temaEscuro,
  (v) => $q.dark.set(v),
  { immediate: true },
)

// ============================================================
// Foto
// ============================================================
function selecionarFoto() {
  fotoInput.value?.click()
}

async function onFotoSelecionada(e: Event) {
  const el = e.target as HTMLInputElement
  const file = el.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    $q.notify({
      type: 'warning',
      message: 'A foto deve ter menos de 2 MB.',
      position: 'top',
    })
    el.value = ''
    return
  }

  const res = await store.uploadFoto(file)
  if (res.ok) {
    $q.notify({ type: 'positive', message: 'Foto atualizada', position: 'top' })
  } else {
    $q.notify({
      type: 'negative',
      message: store.erro ?? 'Erro ao enviar foto',
      position: 'top',
    })
  }
  el.value = ''
}

// ============================================================
// Sincronizar hotlist
// ============================================================
async function sincronizar() {
  const { total } = await store.sincronizar()
  $q.notify({
    type: 'positive',
    message: `Hotlist sincronizada: ${total} veículos`,
    position: 'top',
  })
}

// ============================================================
// Dispositivos
// ============================================================
function alternarDispositivo(id: string) {
  const d = store.alternarDispositivo(id)
  if (!d) return
  $q.notify({
    type: d.ligado ? 'positive' : 'warning',
    message: `${d.nome} ${d.ligado ? 'ligado' : 'desligado'}`,
    position: 'top',
  })
}

// ============================================================
// Editar dados pessoais
// ============================================================
function editarDados() {
  const u = store.utilizador
  if (!u) return

  const htmlForm = `
    <div style="display:flex;flex-direction:column;gap:12px;padding:8px 0">
      <label style="display:block">
        <span style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">Nome</span>
        <input id="pf-nome" type="text" value="${esc(u.name)}" style="width:100%;padding:10px;border:1px solid #e5ebe8;border-radius:8px;font-size:14px;box-sizing:border-box" />
      </label>
      <label style="display:block">
        <span style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">Email</span>
        <input id="pf-email" type="email" value="${esc(u.email)}" style="width:100%;padding:10px;border:1px solid #e5ebe8;border-radius:8px;font-size:14px;box-sizing:border-box" />
      </label>
      <label style="display:block">
        <span style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">Telefone</span>
        <input id="pf-telefone" type="text" value="${esc(u.telefone)}" style="width:100%;padding:10px;border:1px solid #e5ebe8;border-radius:8px;font-size:14px;box-sizing:border-box" />
      </label>
    </div>
  `

  $q.dialog({
    title: 'Dados pessoais',
    message: htmlForm,
    html: true,
    ok: { label: 'Guardar', color: 'primary', unelevated: true },
    cancel: { label: 'Cancelar', flat: true },
    persistent: true,
  }).onOk(async () => {
    const nome = (
      document.getElementById('pf-nome') as HTMLInputElement
    )?.value?.trim()
    const email = (
      document.getElementById('pf-email') as HTMLInputElement
    )?.value?.trim()
    const telefone = (
      document.getElementById('pf-telefone') as HTMLInputElement
    )?.value?.trim()

    if (!nome || nome.length < 3) {
      $q.notify({ type: 'warning', message: 'Nome inválido', position: 'top' })
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $q.notify({ type: 'warning', message: 'Email inválido', position: 'top' })
      return
    }

    const res = await store.actualizar({
      nome,
      email,
      telefone: telefone || null,
    })

    if (res.ok) {
      $q.notify({
        type: 'positive',
        message: 'Dados atualizados',
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: res.erro ?? 'Erro ao guardar',
        position: 'top',
      })
    }
  })
}

// ============================================================
// Alterar senha
// ============================================================
function abrirAlterarSenha() {
  const htmlForm = `
    <div style="display:flex;flex-direction:column;gap:12px;padding:8px 0">
      <label style="display:block">
        <span style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">Senha atual</span>
        <input id="pf-senha-atual" type="password" style="width:100%;padding:10px;border:1px solid #e5ebe8;border-radius:8px;font-size:14px;box-sizing:border-box" />
      </label>
      <label style="display:block">
        <span style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">Nova senha (mín. 8 caracteres)</span>
        <input id="pf-senha-nova" type="password" style="width:100%;padding:10px;border:1px solid #e5ebe8;border-radius:8px;font-size:14px;box-sizing:border-box" />
      </label>
      <label style="display:block">
        <span style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">Confirmar nova senha</span>
        <input id="pf-senha-conf" type="password" style="width:100%;padding:10px;border:1px solid #e5ebe8;border-radius:8px;font-size:14px;box-sizing:border-box" />
      </label>
    </div>
  `

  $q.dialog({
    title: 'Alterar PIN',
    message: htmlForm,
    html: true,
    ok: { label: 'Alterar', color: 'primary', unelevated: true },
    cancel: { label: 'Cancelar', flat: true },
    persistent: true,
  }).onOk(async () => {
    const atual =
      (document.getElementById('pf-senha-atual') as HTMLInputElement)?.value ?? ''
    const nova =
      (document.getElementById('pf-senha-nova') as HTMLInputElement)?.value ?? ''
    const conf =
      (document.getElementById('pf-senha-conf') as HTMLInputElement)?.value ?? ''

    if (nova.length < 8) {
      $q.notify({
        type: 'warning',
        message: 'A nova senha deve ter no mínimo 8 caracteres.',
        position: 'top',
      })
      return
    }
    if (nova !== conf) {
      $q.notify({
        type: 'warning',
        message: 'As senhas não coincidem.',
        position: 'top',
      })
      return
    }

    const res = await store.alterarSenha(atual, nova)
    if (res.ok) {
      $q.notify({
        type: 'positive',
        message: 'Senha alterada com sucesso',
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: res.erro ?? 'Erro ao alterar senha',
        position: 'top',
      })
    }
  })
}

// ============================================================
// Sessões ativas
// ============================================================
async function abrirSessoes() {
  await store.carregarSessoes()

  if (!store.sessoes.length) {
    $q.notify({
      type: 'info',
      message: 'Sem sessões registadas',
      position: 'top',
    })
    return
  }

  const linhas = store.sessoes
    .map(
      (s) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #eef2f0;gap:10px">
        <div style="flex:1;min-width:0">
          <b style="font-size:13px;color:#0f172a">${esc(s.dispositivo)}${s.atual ? ' <span style="color:#059669;font-size:10px">(esta)</span>' : ''}</b>
          <small style="display:block;color:#64748b;font-size:11px;margin-top:2px">${esc(s.local)} · ${esc(s.ultimo_acesso)}</small>
        </div>
        ${
          s.atual
            ? ''
            : `<button onclick="window.__terminarSessao('${esc(s.id)}')" style="background:#fef2f2;color:#991b1b;border:0;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;flex-shrink:0">Terminar</button>`
        }
      </div>`,
    )
    .join('')

  const outras = store.sessoes.filter((s) => !s.atual).length

  const htmlSessoes = `
    <div style="font-size:13px;color:#64748b;margin-bottom:8px">
      ${store.sessoes.length} sessão(ões)
    </div>
    <div style="max-height:300px;overflow-y:auto;padding:4px 0">${linhas}</div>
    ${
      outras > 0
        ? `<button onclick="window.__terminarOutras()" style="margin-top:12px;width:100%;background:#fff;color:#dc2626;border:1px solid #dc2626;border-radius:10px;padding:10px;font-weight:600;font-size:13px;cursor:pointer">Terminar outras sessões (${outras})</button>`
        : ''
    }
  `

  $q.dialog({
    title: 'Sessões ativas',
    message: htmlSessoes,
    html: true,
    ok: { label: 'Fechar', flat: true, color: 'primary' },
    persistent: true,
  })
}

// Handlers globais para os botões inline dos diálogos
declare global {
  interface Window {
    __terminarSessao?: (id: string) => Promise<void>
    __terminarOutras?: () => Promise<void>
  }
}

if (typeof window !== 'undefined') {
  window.__terminarSessao = async (id: string) => {
    const res = await store.terminarSessao(id)
    if (res.ok) {
      $q.notify({
        type: 'positive',
        message: 'Sessão terminada',
        position: 'top',
      })
      $q.dialog({}).hide()
      setTimeout(() => abrirSessoes(), 250)
    }
  }

  window.__terminarOutras = async () => {
    const res = await store.terminarOutrasSessoes()
    if (res.ok) {
      $q.notify({
        type: 'positive',
        message: 'Outras sessões terminadas',
        position: 'top',
      })
      $q.dialog({}).hide()
      setTimeout(() => abrirSessoes(), 250)
    }
  }
}

// ============================================================
// Auditoria → abre o histórico
// ============================================================
function abrirAuditoria() {
  router.push('/agente/historico')
}

// ============================================================
// Sobre
// ============================================================
function abrirSobre() {
  const htmlSobre = `
    <div style="text-align:center;padding:8px 0">
      <div style="font-size:14px;color:#0f172a;font-weight:700">SICAM · Olho de Águia</div>
      <div style="font-size:12px;color:#64748b;margin-top:6px">Versão ${esc(store.versao)} · build ${esc(store.build)}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:12px">Sistema Integrado de Controlo Automóvel de Moçambique</div>
    </div>
  `

  $q.dialog({
    title: 'Sobre',
    message: htmlSobre,
    html: true,
    ok: { label: 'Fechar', flat: true, color: 'primary' },
  })
}

// ============================================================
// Terminar sessão
// ============================================================
function confirmarSair() {
  $q.dialog({
    title: 'Terminar sessão',
    message: 'Tem a certeza que quer terminar a sessão?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Terminar', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    await auth.logout()
    router.push('/login')
  })
}
</script>

<style scoped lang="scss">
.agente-perfil {
  padding: 0 0 24px;
}

// ============================================================
// SKELETON
// ============================================================
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

.agente-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-hero {
  @extend %sk-block;
  height: 200px;
  border-radius: 14px;
}
.sk-stats {
  @extend %sk-block;
  height: 90px;
  border-radius: 12px;
}
.sk-card {
  @extend %sk-block;
  height: 120px;
  border-radius: 12px;
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

// ============================================================
// CARTÃO
// ============================================================
.agente-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 14px;
  margin-bottom: 12px;

  &--center {
    text-align: center;
  }

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;

    .q-icon {
      color: var(--sicam-primary-light);
    }
  }
}

.agente-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.agente-card__desc {
  font-size: 12px;
  color: var(--sicam-muted);
  margin: 0 0 10px;
}

.agente-perfil__hero {
  padding: 20px 14px 16px;
}

// ============================================================
// AVATAR
// ============================================================
.agente-avatar {
  position: relative;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--sicam-primary-bg);
  color: var(--sicam-primary);
  font-size: 32px;
  font-weight: 700;
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
  cursor: pointer;
  overflow: hidden;
  transition: opacity 0.15s;

  &:active {
    opacity: 0.85;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  &__input {
    display: none;
  }

  &__status {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--sicam-success);
    border: 3px solid #fff;

    &--off {
      background: var(--sicam-muted);
    }
  }
}

.agente-nome {
  font-size: 17px;
  font-weight: 700;
  color: var(--sicam-ink);
  margin: 0 0 4px;
}

.agente-sub {
  color: var(--sicam-muted);
  font-size: 12px;
  display: block;
}

.agente-perfil__id {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--sicam-primary);
  background: var(--sicam-primary-bg, #ecfdf5);
  padding: 4px 10px;
  border-radius: 99px;
  margin-top: 10px;
  letter-spacing: 0.04em;
}

// ============================================================
// STATS
// ============================================================
.agente-stats {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.agente-stat {
  flex: 1;
  text-align: center;

  &__value {
    font-size: 20px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
  }

  &__label {
    font-size: 10px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 4px;
  }

  &__divider {
    width: 1px;
    height: 30px;
    background: var(--sicam-line-soft);
  }
}

// ============================================================
// PROGRESSO
// ============================================================
.agente-progress {
  height: 6px;
  background: var(--sicam-surface-alt);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 12px;

  &__bar {
    height: 100%;
    background: var(--sicam-primary-light);
    border-radius: 99px;
    transition: width 0.2s ease;
  }
}

// ============================================================
// LINHAS
// ============================================================
.agente-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--sicam-line-soft);

  &:last-child {
    border-bottom: 0;
  }
  &--sem-border {
    border-bottom: 0;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  &__icon {
    color: var(--sicam-primary-light);
    flex-shrink: 0;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__action {
    background: none;
    border: 0;
    color: var(--sicam-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    &:active {
      background: var(--sicam-surface-hover);
    }
  }

  small {
    display: block;
    color: var(--sicam-muted);
    font-size: 12px;
    font-weight: 400;
  }

  b {
    color: var(--sicam-ink);
    font-size: 14px;
  }
}

// ============================================================
// MENU
// ============================================================
.agente-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: none;
  border: 0;
  padding: 12px 0;
  font-family: inherit;
  font-size: 14px;
  color: var(--sicam-ink);
  cursor: pointer;
  border-bottom: 1px solid var(--sicam-line-soft);
  text-align: left;

  &:last-child {
    border-bottom: 0;
  }

  .q-icon:first-child {
    color: var(--sicam-primary-light);
  }

  span {
    flex: 1;
    font-weight: 500;
  }

  &__chevron {
    color: var(--sicam-line-strong);
  }

  &:active {
    opacity: 0.7;
  }
}

// ============================================================
// SOBRE
// ============================================================
.agente-about {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  .q-icon:first-child {
    color: var(--sicam-primary-light);
  }

  &__text {
    flex: 1;
    b {
      font-size: 13px;
      color: var(--sicam-ink);
    }
    small {
      font-size: 11px;
      color: var(--sicam-muted);
      display: block;
    }
  }

  &:active {
    background: var(--sicam-surface-hover);
  }
}

// ============================================================
// BOTÕES
// ============================================================
.agente-btn {
  display: flex;
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
  margin-bottom: 10px;
  text-decoration: none;
  text-align: center;
  font-family: inherit;

  &:active:not(:disabled) {
    background: var(--sicam-primary);
  }
  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
  }

  &--danger {
    background: #fff;
    color: var(--sicam-critical);
    border: 1px solid var(--sicam-critical);
    margin-top: 8px;

    &:active {
      background: var(--sicam-critical-bg);
    }
  }
}

.agente-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>