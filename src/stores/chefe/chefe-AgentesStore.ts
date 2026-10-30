// src/stores/chefe/chefe-AgentesStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  agentesService,
  type Agente,
  type AgentesKpis,
  type CriarAgentePayload,
} from '@/services/chefe/agentes.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type EstadoAgente = 'Online' | 'Em patrulha' | 'Offline' | 'Inactivo'
export type TurnoAgente = 'Manhã' | 'Tarde' | 'Noite'

export type { Agente }

// ============================================================
// Store
// ============================================================
export const useChefeAgentesStore = defineStore('chefeAgentes', () => {
  // ----------------------------------------------------------
  // Constantes (para os selects)
  // ----------------------------------------------------------
  const ESTADOS: EstadoAgente[] = ['Online', 'Em patrulha', 'Offline', 'Inactivo']
  const TURNOS: TurnoAgente[] = ['Manhã', 'Tarde', 'Noite']
  const VIATURAS = ['MAP-2290', 'MAP-4413', 'MAP-4412', 'MAP-7781', 'MAP-5511', '—']
  const POSTOS = [
    'Posto Central',
    'Posto Baixa',
    'Posto Matola',
    'Posto Machava',
    'Posto KaMpfumo',
    'Posto Namaacha',
  ]
  const POR_PAGINA = 6

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const agentes = ref<Agente[]>([])

  const kpisBackend = reactive<AgentesKpis>({
    total: 0,
    online: 0,
    emPatrulha: 0,
    offline: 0,
    inactivos: 0,
  })

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/)
    const p = partes[0]?.[0] ?? ''
    const u = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
    return (p + u).toUpperCase()
  }

  // ----------------------------------------------------------
  // Carregar do backend
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 600))

      const dados = await agentesService.listar()
      agentes.value = dados.items
      Object.assign(kpisBackend, dados.kpis)

      await atrasoMinimo
      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      carregado.value = true
    } finally {
      aCarregar.value = false
    }
  }

  // ----------------------------------------------------------
  // KPIs
  // ----------------------------------------------------------
  const kpis = computed(() => ({
    total: kpisBackend.total,
    online: kpisBackend.online,
    emPatrulha: kpisBackend.emPatrulha,
    offline: kpisBackend.offline,
    inactivos: kpisBackend.inactivos,
    consultasHoje: agentes.value.reduce((s, a) => s + a.consultasHoje, 0),
    multasHoje: agentes.value.reduce((s, a) => s + a.multasEmitidas, 0),
  }))

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroEstado = ref('')
  const filtroTurno = ref('')
  const filtroPosto = ref('')

  const temFiltrosAtivos = computed(
    () => !!(pesquisa.value || filtroEstado.value || filtroTurno.value || filtroPosto.value),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroEstado.value = ''
    filtroTurno.value = ''
    filtroPosto.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    return agentes.value.filter((a) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !a.nome.toLowerCase().includes(q) &&
          !a.nSerie.toLowerCase().includes(q) &&
          !a.email.toLowerCase().includes(q) &&
          !a.telefone.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroEstado.value && a.estado !== filtroEstado.value) return false
      if (filtroTurno.value && a.turno !== filtroTurno.value) return false
      if (filtroPosto.value && a.posto !== filtroPosto.value) return false
      return true
    })
  })

  // ----------------------------------------------------------
  // Paginação
  // ----------------------------------------------------------
  const pagina = ref(1)

  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(filtrados.value.length / POR_PAGINA)),
  )
  const inicioPagina = computed(() => (pagina.value - 1) * POR_PAGINA)
  const fimPagina = computed(() =>
    Math.min(inicioPagina.value + POR_PAGINA, filtrados.value.length),
  )
  const paginados = computed(() =>
    filtrados.value.slice(inicioPagina.value, fimPagina.value),
  )

  watch(filtrados, () => {
    if (pagina.value > totalPaginas.value) pagina.value = 1
  })

  // ----------------------------------------------------------
  // Modal — Detalhes
  // ----------------------------------------------------------
  const modalDetalhes = ref(false)
  const agenteSelecionado = ref<Agente | null>(null)

  function abrirDetalhes(a: Agente) {
    agenteSelecionado.value = a
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal — Novo / Editar
  // ----------------------------------------------------------
  const modalForm = ref(false)
  const modoEdicao = ref(false)
  const aSalvar = ref(false)
  const agenteEditandoId = ref<string | null>(null)

  const form = reactive({
    nome: '',
    email: '',
    telefone: '',
    nSerie: '',
    turno: 'Manhã' as TurnoAgente,
    viatura: 'MAP-2290',
    posto: 'Posto Central',
    estado: 'Offline' as EstadoAgente,
    observacoes: '',
  })

  const formValido = computed(
    () =>
      form.nome.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.nSerie.trim().length > 0,
  )

  function abrirNovo() {
    const proximo = agentes.value.length + 1
    Object.assign(form, {
      nome: '',
      email: '',
      telefone: '',
      nSerie: `PRM-AT-${String(proximo).padStart(4, '0')}`,
      turno: 'Manhã' as TurnoAgente,
      viatura: 'MAP-2290',
      posto: 'Posto Central',
      estado: 'Offline' as EstadoAgente,
      observacoes: '',
    })
    modoEdicao.value = false
    agenteEditandoId.value = null
    aSalvar.value = false
    modalForm.value = true
  }

  function abrirEditar(a: Agente) {
    Object.assign(form, {
      nome: a.nome,
      email: a.email,
      telefone: a.telefone,
      nSerie: a.nSerie,
      turno: (a.turno as TurnoAgente) || 'Manhã',
      viatura: a.viatura || 'MAP-2290',
      posto: a.posto,
      estado: a.estado,
      observacoes: a.observacoes ?? '',
    })
    modoEdicao.value = true
    agenteEditandoId.value = a.id
    aSalvar.value = false
    modalForm.value = true
  }

  function fecharForm() {
    modalForm.value = false
  }

  async function salvarForm(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false
    aSalvar.value = true
    erro.value = null

    const payload: CriarAgentePayload = {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone || undefined,
      nSerie: form.nSerie,
      posto: form.posto,
    }

    try {
      if (modoEdicao.value && agenteEditandoId.value) {
        await agentesService.actualizar(agenteEditandoId.value, payload)
      } else {
        await agentesService.criar(payload)
      }
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    } finally {
      aSalvar.value = false
    }
  }

  // ----------------------------------------------------------
  // Ações
  // ----------------------------------------------------------
  async function activar(id: string): Promise<boolean> {
    try {
      await agentesService.activar(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function desactivar(id: string): Promise<boolean> {
    try {
      await agentesService.desactivar(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      await agentesService.remover(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Helpers de UI
  // ----------------------------------------------------------
  function estadoClasse(estado: EstadoAgente): 'regular' | 'atencao' | 'critico' | 'info' {
    if (estado === 'Online') return 'regular'
    if (estado === 'Em patrulha') return 'atencao'
    if (estado === 'Inactivo') return 'info'
    return 'critico'
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    ESTADOS,
    TURNOS,
    VIATURAS,
    POSTOS,
    POR_PAGINA,

    aCarregar,
    carregado,
    erro,
    carregar,

    agentes,
    kpis,

    pesquisa,
    filtroEstado,
    filtroTurno,
    filtroPosto,
    temFiltrosAtivos,
    filtrados,
    limparFiltros,

    pagina,
    totalPaginas,
    inicioPagina,
    fimPagina,
    paginados,

    modalDetalhes,
    agenteSelecionado,
    abrirDetalhes,

    modalForm,
    modoEdicao,
    aSalvar,
    form,
    formValido,
    abrirNovo,
    abrirEditar,
    fecharForm,
    salvarForm,

    activar,
    desactivar,
    remover,

    estadoClasse,
    iniciais,
  }
})