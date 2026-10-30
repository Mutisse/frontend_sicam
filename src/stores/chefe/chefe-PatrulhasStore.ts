import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'

// ============================================================
// Tipos
// ============================================================
export type EstadoPatrulha = 'Planeada' | 'Em curso' | 'Concluída' | 'Cancelada'
export type PrioridadePatrulha = 'Baixa' | 'Média' | 'Alta'
export type TurnoPatrulha = 'Manhã' | 'Tarde' | 'Noite'

export interface ParagemPatrulha {
  id: string
  local: string
  hora: string
  resultado: string
}

export interface Patrulha {
  id: string
  codigo: string
  nome: string
  data: string
  horaInicio: string
  horaFim: string
  turno: TurnoPatrulha
  agente: string
  agenteId: string
  viatura: string
  zona: string
  pontosPrevistos: number
  pontosConcluidos: number
  prioridade: PrioridadePatrulha
  estado: EstadoPatrulha
  paragens: ParagemPatrulha[]
  notas?: string
  criadoEm: string
}

// ============================================================
// Store
// ============================================================
export const useChefePatrulhasStore = defineStore('chefePatrulhas', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const ESTADOS: EstadoPatrulha[] = ['Planeada', 'Em curso', 'Concluída', 'Cancelada']
  const TURNOS: TurnoPatrulha[] = ['Manhã', 'Tarde', 'Noite']
  const PRIORIDADES: PrioridadePatrulha[] = ['Baixa', 'Média', 'Alta']

  const AGENTES = [
    { id: 'AG-001', nome: 'Agente Chissano', nSerie: 'SN-AGT-001' },
    { id: 'AG-002', nome: 'Agente Nhaca',    nSerie: 'SN-AGT-002' },
    { id: 'AG-004', nome: 'Agente Sitoe',    nSerie: 'SN-AGT-004' },
    { id: 'AG-007', nome: 'Agente Cumbe',    nSerie: 'SN-AGT-007' },
    { id: 'AG-008', nome: 'Agente Bila',     nSerie: 'SN-AGT-008' },
    { id: 'AG-011', nome: 'Agente Tembe',    nSerie: 'SN-AGT-011' },
  ]

  const VIATURAS = ['MAP-2290', 'MAP-4413', 'MAP-4412', 'MAP-7781', '—']

  const ZONAS = [
    'Posto Baixa',
    'Posto Central',
    'Posto Matola',
    'Posto Machava',
    'Posto KaMpfumo',
    'Posto Namaacha',
    'EN4',
    'Av. Julius Nyerere',
    'Av. 25 de Setembro',
  ]

  const POR_PAGINA = 6

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function formatarInputData(d: Date): string {
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    return `${dia}/${mes}/${d.getFullYear()}`
  }

  // ----------------------------------------------------------
  // Dados (mock)
  // ----------------------------------------------------------
  const patrulhas = ref<Patrulha[]>([
    { id: 'PT-020', codigo: 'PT-26-00020', nome: 'Patrulha Baixa manhã',   data: '23/09/2026', horaInicio: '08:00', horaFim: '12:00', turno: 'Manhã', agente: 'Agente Chissano', agenteId: 'AG-001', viatura: 'MAP-2290', zona: 'Posto Baixa',          pontosPrevistos: 10, pontosConcluidos: 5,  prioridade: 'Média', estado: 'Em curso',  paragens: [], criadoEm: '23/09/2026 07:30' },
    { id: 'PT-019', codigo: 'PT-26-00019', nome: 'Patrulha EN4 manhã',     data: '23/09/2026', horaInicio: '09:00', horaFim: '13:00', turno: 'Manhã', agente: 'Agente Sitoe',    agenteId: 'AG-004', viatura: 'MAP-4412', zona: 'EN4',                 pontosPrevistos: 10, pontosConcluidos: 0,  prioridade: 'Alta',  estado: 'Planeada', paragens: [], criadoEm: '23/09/2026 07:00' },
    { id: 'PT-018', codigo: 'PT-26-00018', nome: 'Ronda KaMpfumo',         data: '23/09/2026', horaInicio: '10:00', horaFim: '14:00', turno: 'Manhã', agente: 'Agente Nhaca',    agenteId: 'AG-002', viatura: 'MAP-4413', zona: 'Posto KaMpfumo',      pontosPrevistos: 8,  pontosConcluidos: 0,  prioridade: 'Média', estado: 'Planeada', paragens: [], criadoEm: '23/09/2026 07:15' },
    { id: 'PT-017', codigo: 'PT-26-00017', nome: 'Controlo Machava',       data: '22/09/2026', horaInicio: '14:00', horaFim: '18:00', turno: 'Tarde', agente: 'Agente Cumbe',    agenteId: 'AG-007', viatura: 'MAP-7781', zona: 'Posto Machava',       pontosPrevistos: 10, pontosConcluidos: 9,  prioridade: 'Média', estado: 'Concluída',paragens: [], criadoEm: '22/09/2026 13:00' },
    { id: 'PT-016', codigo: 'PT-26-00016', nome: 'Patrulha Matola manhã',  data: '22/09/2026', horaInicio: '08:00', horaFim: '12:00', turno: 'Manhã', agente: 'Agente Nhaca',    agenteId: 'AG-002', viatura: 'MAP-4413', zona: 'Posto Matola',        pontosPrevistos: 10, pontosConcluidos: 8,  prioridade: 'Baixa', estado: 'Concluída',paragens: [], criadoEm: '22/09/2026 07:30' },
    { id: 'PT-015', codigo: 'PT-26-00015', nome: 'Ronda Baixa — teste',    data: '22/09/2026', horaInicio: '16:00', horaFim: '18:00', turno: 'Tarde', agente: 'Agente Chissano', agenteId: 'AG-001', viatura: 'MAP-2290', zona: 'Posto Baixa',          pontosPrevistos: 5,  pontosConcluidos: 3,  prioridade: 'Baixa', estado: 'Concluída',paragens: [], criadoEm: '22/09/2026 15:00' },
    { id: 'PT-014', codigo: 'PT-26-00014', nome: 'Patrulha EN4 tarde',     data: '21/09/2026', horaInicio: '14:00', horaFim: '18:00', turno: 'Tarde', agente: 'Agente Sitoe',    agenteId: 'AG-004', viatura: 'MAP-4412', zona: 'EN4',                 pontosPrevistos: 10, pontosConcluidos: 9,  prioridade: 'Alta',  estado: 'Concluída',paragens: [], criadoEm: '21/09/2026 13:00' },
    { id: 'PT-013', codigo: 'PT-26-00013', nome: 'Controlo Matola',        data: '21/09/2026', horaInicio: '08:00', horaFim: '12:00', turno: 'Manhã', agente: 'Agente Nhaca',    agenteId: 'AG-002', viatura: 'MAP-4413', zona: 'Posto Matola',        pontosPrevistos: 10, pontosConcluidos: 10, prioridade: 'Média', estado: 'Concluída',paragens: [], criadoEm: '21/09/2026 07:00' },
    { id: 'PT-012', codigo: 'PT-26-00012', nome: 'Patrulha Baixa tarde',   data: '20/09/2026', horaInicio: '14:00', horaFim: '18:00', turno: 'Tarde', agente: 'Agente Cumbe',    agenteId: 'AG-007', viatura: 'MAP-7781', zona: 'Posto Baixa',          pontosPrevistos: 10, pontosConcluidos: 9,  prioridade: 'Baixa', estado: 'Concluída',paragens: [], criadoEm: '20/09/2026 13:30' },
    { id: 'PT-011', codigo: 'PT-26-00011', nome: 'Patrulha EN4 especial',  data: '19/09/2026', horaInicio: '20:00', horaFim: '23:00', turno: 'Noite', agente: '—',               agenteId: '',       viatura: '—',        zona: 'EN4',                 pontosPrevistos: 10, pontosConcluidos: 0,  prioridade: 'Alta',  estado: 'Cancelada',paragens: [], criadoEm: '19/09/2026 18:00' },
  ])

  // ----------------------------------------------------------
  // KPIs
  // ----------------------------------------------------------
  const kpis = computed(() => {
    const lista = patrulhas.value
    return {
      total: lista.length,
      planeadas: lista.filter((p) => p.estado === 'Planeada').length,
      emCurso: lista.filter((p) => p.estado === 'Em curso').length,
      concluidas: lista.filter((p) => p.estado === 'Concluída').length,
      canceladas: lista.filter((p) => p.estado === 'Cancelada').length,
    }
  })

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroEstado = ref('')
  const filtroAgente = ref('')
  const filtroPrioridade = ref('')

  const temFiltrosAtivos = computed(
    () => !!(pesquisa.value || filtroEstado.value || filtroAgente.value || filtroPrioridade.value)
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroEstado.value = ''
    filtroAgente.value = ''
    filtroPrioridade.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    return patrulhas.value.filter((p) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !p.codigo.toLowerCase().includes(q) &&
          !p.nome.toLowerCase().includes(q) &&
          !p.agente.toLowerCase().includes(q) &&
          !p.viatura.toLowerCase().includes(q) &&
          !p.zona.toLowerCase().includes(q)
        ) return false
      }
      if (filtroEstado.value && p.estado !== filtroEstado.value) return false
      if (filtroAgente.value && p.agente !== filtroAgente.value) return false
      if (filtroPrioridade.value && p.prioridade !== filtroPrioridade.value) return false
      return true
    })
  })

  // ----------------------------------------------------------
  // Paginação — 6/página
  // ----------------------------------------------------------
  const pagina = ref(1)

  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(filtrados.value.length / POR_PAGINA))
  )
  const inicioPagina = computed(() => (pagina.value - 1) * POR_PAGINA)
  const fimPagina = computed(() =>
    Math.min(inicioPagina.value + POR_PAGINA, filtrados.value.length)
  )
  const paginados = computed(() =>
    filtrados.value.slice(inicioPagina.value, fimPagina.value)
  )

  watch(filtrados, () => {
    if (pagina.value > totalPaginas.value) pagina.value = 1
  })

  // ----------------------------------------------------------
  // Modal — Detalhes
  // ----------------------------------------------------------
  const modalDetalhes = ref(false)
  const patrulhaSelecionada = ref<Patrulha | null>(null)

  function abrirDetalhes(p: Patrulha) {
    patrulhaSelecionada.value = p
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal — Nova / Editar (2 passos)
  // ----------------------------------------------------------
  const modalForm = ref(false)
  const passo = ref<1 | 2>(1)
  const modoEdicao = ref(false)
  const aSalvar = ref(false)

  const form = reactive({
    nome: '',
    data: '',
    horaInicio: '08:00',
    horaFim: '12:00',
    turno: 'Manhã' as TurnoPatrulha,
    agenteId: 'AG-001',
    viatura: 'MAP-2290',
    zona: 'Posto Baixa',
    pontosPrevistos: 10,
    prioridade: 'Média' as PrioridadePatrulha,
    estado: 'Planeada' as EstadoPatrulha,
    notas: '',
  })

  const passo1Valido = computed(() =>
    form.nome.trim().length > 0 &&
    form.data.trim().length > 0 &&
    form.agenteId.trim().length > 0 &&
    form.zona.trim().length > 0
  )

  const passo2Valido = computed(() =>
    form.horaInicio.trim().length > 0 &&
    form.horaFim.trim().length > 0 &&
    form.pontosPrevistos > 0
  )

  const formValido = computed(() => passo1Valido.value && passo2Valido.value)

  function abrirNova() {
    const agora = new Date()
    Object.assign(form, {
      nome: '',
      data: formatarInputData(agora),
      horaInicio: '08:00',
      horaFim: '12:00',
      turno: 'Manhã' as TurnoPatrulha,
      agenteId: 'AG-001',
      viatura: 'MAP-2290',
      zona: 'Posto Baixa',
      pontosPrevistos: 10,
      prioridade: 'Média' as PrioridadePatrulha,
      estado: 'Planeada' as EstadoPatrulha,
      notas: '',
    })
    modoEdicao.value = false
    passo.value = 1
    aSalvar.value = false
    modalForm.value = true
  }

  function abrirEditar(p: Patrulha) {
    Object.assign(form, {
      nome: p.nome,
      data: p.data,
      horaInicio: p.horaInicio,
      horaFim: p.horaFim,
      turno: p.turno,
      agenteId: p.agenteId || 'AG-001',
      viatura: p.viatura,
      zona: p.zona,
      pontosPrevistos: p.pontosPrevistos,
      prioridade: p.prioridade,
      estado: p.estado,
      notas: p.notas ?? '',
    })
    modoEdicao.value = true
    passo.value = 1
    aSalvar.value = false
    modalForm.value = true
  }

  function fecharForm() {
    modalForm.value = false
    passo.value = 1
  }

  function proximoPasso() {
    if (passo.value < 2) passo.value = 2
  }

  function passoAnterior() {
    if (passo.value > 1) passo.value = 1
  }

  function salvarForm(): boolean {
    if (!formValido.value || aSalvar.value) return false
    aSalvar.value = true

    const agente = AGENTES.find((a) => a.id === form.agenteId)
    const agora = new Date()
    const dataCriacao = `${formatarInputData(agora)} ${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`

    if (modoEdicao.value && patrulhaSelecionada.value) {
      const idx = patrulhas.value.findIndex((x) => x.id === patrulhaSelecionada.value?.id)
      if (idx >= 0) {
        const atual = patrulhas.value[idx]!

        const atualizada: Patrulha = {
          ...atual,
          nome: form.nome,
          data: form.data,
          horaInicio: form.horaInicio,
          horaFim: form.horaFim,
          turno: form.turno,
          agente: agente?.nome ?? '—',
          agenteId: form.agenteId,
          viatura: form.viatura,
          zona: form.zona,
          pontosPrevistos: form.pontosPrevistos,
          prioridade: form.prioridade,
          estado: form.estado,
        }

        if (form.notas.trim().length > 0) atualizada.notas = form.notas
        else delete atualizada.notas

        patrulhas.value[idx] = atualizada
      }
    } else {
      const proximo = patrulhas.value.length + 1
      const nova: Patrulha = {
        id: `PT-${String(proximo).padStart(3, '0')}`,
        codigo: `PT-26-${String(proximo).padStart(5, '0')}`,
        nome: form.nome,
        data: form.data,
        horaInicio: form.horaInicio,
        horaFim: form.horaFim,
        turno: form.turno,
        agente: agente?.nome ?? '—',
        agenteId: form.agenteId,
        viatura: form.viatura,
        zona: form.zona,
        pontosPrevistos: form.pontosPrevistos,
        pontosConcluidos: 0,
        prioridade: form.prioridade,
        estado: form.estado,
        paragens: [],
        criadoEm: dataCriacao,
      }

      if (form.notas.trim().length > 0) nova.notas = form.notas

      patrulhas.value.unshift(nova)
    }

    aSalvar.value = false
    return true
  }

  // ----------------------------------------------------------
  // Ações
  // ----------------------------------------------------------
  function iniciar(id: string): boolean {
    const p = patrulhas.value.find((x) => x.id === id)
    if (!p) return false
    p.estado = 'Em curso'
    return true
  }

  function concluir(id: string): boolean {
    const p = patrulhas.value.find((x) => x.id === id)
    if (!p) return false
    p.estado = 'Concluída'
    p.pontosConcluidos = p.pontosPrevistos
    return true
  }

  function cancelar(id: string): boolean {
    const p = patrulhas.value.find((x) => x.id === id)
    if (!p) return false
    p.estado = 'Cancelada'
    return true
  }

  function remover(id: string) {
    patrulhas.value = patrulhas.value.filter((x) => x.id !== id)
  }

  // ----------------------------------------------------------
  // Helpers de UI
  // ----------------------------------------------------------
  function iniciais(nome: string): string {
    if (!nome || nome === '—') return '—'
    const partes = nome.trim().split(/\s+/)
    const p = partes[0]?.[0] ?? ''
    const u = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
    return (p + u).toUpperCase()
  }

  function estadoClasse(e: EstadoPatrulha): 'regular' | 'atencao' | 'critico' | 'neutral' {
    if (e === 'Concluída') return 'regular'
    if (e === 'Em curso') return 'atencao'
    if (e === 'Cancelada') return 'critico'
    return 'neutral'
  }

  function prioridadeClasse(p: PrioridadePatrulha): 'regular' | 'atencao' | 'critico' {
    if (p === 'Baixa') return 'regular'
    if (p === 'Média') return 'atencao'
    return 'critico'
  }

  function progressoPercent(p: Patrulha): number {
    if (p.pontosPrevistos === 0) return 0
    return Math.round((p.pontosConcluidos / p.pontosPrevistos) * 100)
  }

  function progressoClasse(p: Patrulha): 'regular' | 'atencao' | 'critico' {
    if (p.estado === 'Cancelada') return 'critico'
    const perc = progressoPercent(p)
    if (perc === 100) return 'regular'
    if (perc >= 50) return 'atencao'
    return 'critico'
  }

  // ----------------------------------------------------------
  // Devolver tudo
  // ----------------------------------------------------------
  return {
    ESTADOS,
    TURNOS,
    PRIORIDADES,
    AGENTES,
    VIATURAS,
    ZONAS,
    POR_PAGINA,

    patrulhas,
    kpis,

    pesquisa,
    filtroEstado,
    filtroAgente,
    filtroPrioridade,
    temFiltrosAtivos,
    filtrados,
    limparFiltros,

    pagina,
    totalPaginas,
    inicioPagina,
    fimPagina,
    paginados,

    modalDetalhes,
    patrulhaSelecionada,
    abrirDetalhes,

    modalForm,
    passo,
    modoEdicao,
    aSalvar,
    form,
    formValido,
    passo1Valido,
    passo2Valido,
    abrirNova,
    abrirEditar,
    fecharForm,
    proximoPasso,
    passoAnterior,
    salvarForm,

    iniciar,
    concluir,
    cancelar,
    remover,

    iniciais,
    estadoClasse,
    prioridadeClasse,
    progressoPercent,
    progressoClasse,
  }
})