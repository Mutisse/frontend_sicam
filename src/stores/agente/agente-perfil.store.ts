// src/stores/agente/agente-perfil.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  perfilService,
  type UtilizadorPerfil,
  type Sessao,
  type Preferencias,
} from '@/services/agente/perfil.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export interface Dispositivo {
  id: string
  nome: string
  detalhe: string
  icon: string
  ligado: boolean
}

export interface StatsAgente {
  consultasHoje: number
  autosHoje: number
  anosServico: number
}

// ============================================================
// Store
// ============================================================
export const useAgentePerfilStore = defineStore('agentePerfil', () => {
  // ── Estado remoto ──────────────────────────────────
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const utilizador = ref<UtilizadorPerfil | null>(null)
  const sessoes = ref<Sessao[]>([])
  const preferencias = ref<Preferencias>({
    tema: 'auto',
    idioma: 'pt',
    densidade: 'normal',
    modo_offline: false,
    notif_push: true,
    notif_som: true,
    notif_email: false,
  })

  // ── Estado local ───────────────────────────────────
  const online = ref<boolean>(navigator.onLine)
  const aSincronizar = ref(false)
  const aGuardarPrefs = ref(false)

  // ── Stats (vêm de /api/agente/inicio) ──────────────
  const stats = ref<StatsAgente>({
    consultasHoje: 0,
    autosHoje: 0,
    anosServico: 0,
  })

  // ── Hotlist (KPIs de /api/hotlist/kpis) ────────────
  const hotlistTotal = ref(0)
  const hotlistProgresso = ref(100)
  const ultimaSync = ref('—')
  const hotlistPendente = ref(false)

  // ── Dispositivos (mock — não há endpoint) ──────────
  const dispositivos = ref<Dispositivo[]>([
    { id: 'printer',   nome: 'Impressora Bluetooth', detalhe: 'PRM-PRN-014',      icon: 'print',       ligado: true },
    { id: 'biometria', nome: 'Biometria',            detalhe: 'Impressão digital', icon: 'fingerprint', ligado: true },
    { id: 'gps',       nome: 'GPS da viatura',       detalhe: 'MAP-2290',          icon: 'my_location', ligado: true },
  ])

  // ── Versão (estática) ──────────────────────────────
  const versao = ref('1.4.2')
  const build = ref('2026.10.15')

  // ============================================================
  // Getters
  // ============================================================
  const nomeCompleto = computed(() =>
    utilizador.value?.name ? `Agente ${utilizador.value.name}` : 'Agente',
  )

  const iniciais = computed(() => {
    const nome = utilizador.value?.name ?? ''
    const partes = nome.trim().split(/\s+/)
    const p = partes[0]?.charAt(0) ?? ''
    const u = partes.length > 1 ? partes[partes.length - 1]?.charAt(0) ?? '' : ''
    return (p + u).toUpperCase() || 'AG'
  })

  const posto = computed(() => utilizador.value?.posto ?? '—')
  const funcao = computed(() => utilizador.value?.funcao ?? 'Agente')
  const numeroAgente = computed(() => utilizador.value?.numero_id ?? '—')

  const temaEscuro = computed({
    get: () => preferencias.value.tema === 'escuro',
    set: (v: boolean) => {
      preferencias.value.tema = v ? 'escuro' : 'claro'
      guardarPreferencias()
    },
  })

  const offline = computed({
    get: () => preferencias.value.modo_offline,
    set: (v: boolean) => {
      preferencias.value.modo_offline = v
      guardarPreferencias()
    },
  })

  const notificacoes = computed({
    get: () => preferencias.value.notif_push,
    set: (v: boolean) => {
      preferencias.value.notif_push = v
      guardarPreferencias()
    },
  })

  // ============================================================
  // Acções
  // ============================================================
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null

    try {
      const [u, prefs] = await Promise.all([
        perfilService.obter(),
        perfilService.obterPreferencias(),
      ])

      utilizador.value = u
      preferencias.value = prefs
      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      carregado.value = true
    } finally {
      aCarregar.value = false
    }
  }

  async function actualizar(payload: {
    nome?: string
    email?: string
    telefone?: string | null
  }) {
    try {
      const u = await perfilService.actualizar(payload)
      utilizador.value = u
      return { ok: true }
    } catch (e) {
      erro.value = extrairErro(e)
      return { ok: false, erro: erro.value }
    }
  }

  async function alterarSenha(atual: string, nova: string) {
    try {
      await perfilService.alterarSenha(atual, nova)
      return { ok: true }
    } catch (e) {
      erro.value = extrairErro(e)
      return { ok: false, erro: erro.value }
    }
  }

  async function carregarSessoes() {
    try {
      sessoes.value = await perfilService.carregarSessoes()
    } catch (e) {
      erro.value = extrairErro(e)
    }
  }

  async function terminarSessao(id: string) {
    try {
      await perfilService.terminarSessao(id)
      sessoes.value = sessoes.value.filter((s) => s.id !== id)
      return { ok: true }
    } catch (e) {
      erro.value = extrairErro(e)
      return { ok: false }
    }
  }

  async function terminarOutrasSessoes() {
    try {
      await perfilService.terminarOutrasSessoes()
      sessoes.value = sessoes.value.filter((s) => s.atual)
      return { ok: true }
    } catch (e) {
      erro.value = extrairErro(e)
      return { ok: false }
    }
  }

  async function guardarPreferencias() {
    if (aGuardarPrefs.value) return
    aGuardarPrefs.value = true
    try {
      await perfilService.guardarPreferencias(preferencias.value)
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      aGuardarPrefs.value = false
    }
  }

  async function uploadFoto(file: File) {
    try {
      const url = await perfilService.uploadFoto(file)
      if (utilizador.value) utilizador.value.foto_url = url
      return { ok: true, url }
    } catch (e) {
      erro.value = extrairErro(e)
      return { ok: false }
    }
  }

  // ── Hotlist (mock sincronização) ───────────────────
  async function sincronizar(): Promise<{ total: number }> {
    if (aSincronizar.value) return { total: hotlistTotal.value }

    aSincronizar.value = true
    hotlistProgresso.value = 0

    const interval = setInterval(() => {
      hotlistProgresso.value = Math.min(100, hotlistProgresso.value + 15)
    }, 150)

    await new Promise((r) => setTimeout(r, 1100))
    clearInterval(interval)

    hotlistProgresso.value = 100
    hotlistPendente.value = false
    ultimaSync.value = new Date().toLocaleTimeString('pt-MZ', {
      hour: '2-digit',
      minute: '2-digit',
    })
    aSincronizar.value = false

    return { total: hotlistTotal.value }
  }

  function alternarDispositivo(id: string): Dispositivo | null {
    const d = dispositivos.value.find((x) => x.id === id)
    if (!d) return null
    d.ligado = !d.ligado
    return d
  }

  // ── Reage ao estado de rede ────────────────────────
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => (online.value = true))
    window.addEventListener('offline', () => (online.value = false))
  }

  return {
    // estado
    aCarregar,
    carregado,
    erro,
    utilizador,
    sessoes,
    preferencias,
    online,
    aSincronizar,
    aGuardarPrefs,

    // stats / hotlist
    stats,
    hotlistTotal,
    hotlistProgresso,
    ultimaSync,
    hotlistPendente,

    // dispositivos / versão
    dispositivos,
    versao,
    build,

    // getters
    nomeCompleto,
    iniciais,
    posto,
    funcao,
    numeroAgente,
    temaEscuro,
    offline,
    notificacoes,

    // acções
    carregar,
    actualizar,
    alterarSenha,
    carregarSessoes,
    terminarSessao,
    terminarOutrasSessoes,
    guardarPreferencias,
    uploadFoto,
    sincronizar,
    alternarDispositivo,
  }
})