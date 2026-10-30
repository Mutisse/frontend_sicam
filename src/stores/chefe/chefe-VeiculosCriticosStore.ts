// src/stores/chefe/chefe-VeiculosCriticosStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  veiculosCriticosService,
  type VeiculoCritico,
  type VeiculosCriticosKpis,
  type MotivoCritico,
  type PrioridadeCritico,
  type EstadoCritico,
  type CriarVeiculoCriticoPayload,
} from '@/services/chefe/veiculos-criticos.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { VeiculoCritico, MotivoCritico, PrioridadeCritico, EstadoCritico }

// ============================================================
// Store
// ============================================================
export const useChefeVeiculosCriticosStore = defineStore('chefeVeiculosCriticos', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const MOTIVOS: MotivoCritico[] = [
    'Hotlist PRM',
    'Seguro expirado',
    'Inspecção em atraso',
    'Multas em atraso',
    'Documentação irregular',
    'Veículo roubado',
    'Suspeita de clonagem',
  ]

  const PRIORIDADES: PrioridadeCritico[] = ['Baixa', 'Média', 'Alta', 'Urgente']
  const ESTADOS: EstadoCritico[] = ['Activo', 'Em averiguação', 'Resolvido', 'Arquivado']

  const POSTOS = [
    'Posto Central',
    'Posto Baixa',
    'Posto Matola',
    'Posto Machava',
    'Posto KaMpfumo',
    'Posto Namaacha',
  ]

  const AGENTES = [
    'Agente Chissano',
    'Agente Nhaca',
    'Agente Sitoe',
    'Agente Cumbe',
    'Agente Bila',
    'Agente Tembe',
  ]

  const POR_PAGINA = 6

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const veiculos = ref<VeiculoCritico[]>([])

  const kpisBackend = reactive<VeiculosCriticosKpis>({
    total: 0,
    hotlist: 0,
    seguroExpirado: 0,
    emAveriguacao: 0,
    urgentes: 0,
    resolvidos: 0,
  })

  // ----------------------------------------------------------
  // Carregar
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 600))

      const dados = await veiculosCriticosService.listar()
      veiculos.value = dados.items
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
    hotlist: kpisBackend.hotlist,
    seguroExpirado: kpisBackend.seguroExpirado,
    emAveriguacao: kpisBackend.emAveriguacao,
    urgentes: kpisBackend.urgentes,
    resolvidos: kpisBackend.resolvidos,
  }))

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function formatarMoeda(valor: number): string {
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + ' MT'
  }

  function formatarInputData(d: Date): string {
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    return `${dia}/${mes}/${d.getFullYear()}`
  }

  function iniciais(nome: string): string {
    if (!nome || nome === '—') return '—'
    const partes = nome.trim().split(/\s+/)
    const p = partes[0]?.[0] ?? ''
    const u = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
    return (p + u).toUpperCase()
  }

  function estadoClasse(e: EstadoCritico): 'regular' | 'atencao' | 'critico' | 'info' {
    if (e === 'Resolvido') return 'regular'
    if (e === 'Em averiguação') return 'atencao'
    if (e === 'Arquivado') return 'info'
    return 'critico'
  }

  function prioridadeClasse(p: PrioridadeCritico): 'regular' | 'atencao' | 'critico' | 'info' {
    if (p === 'Baixa') return 'regular'
    if (p === 'Média') return 'atencao'
    if (p === 'Alta') return 'critico'
    return 'info'
  }

  function motivoClasse(m: MotivoCritico): string {
    if (m === 'Hotlist PRM') return 'hotlist'
    if (m === 'Seguro expirado') return 'seguro'
    if (m === 'Inspecção em atraso') return 'inspecao'
    if (m === 'Multas em atraso') return 'multas'
    if (m === 'Documentação irregular') return 'doc'
    if (m === 'Veículo roubado') return 'roubo'
    return 'clonagem'
  }

  function motivoIcone(m: MotivoCritico): string {
    if (m === 'Hotlist PRM') return 'local_police'
    if (m === 'Seguro expirado') return 'shield'
    if (m === 'Inspecção em atraso') return 'build'
    if (m === 'Multas em atraso') return 'receipt_long'
    if (m === 'Documentação irregular') return 'description'
    if (m === 'Veículo roubado') return 'gavel'
    return 'content_copy'
  }

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroMotivo = ref('')
  const filtroPrioridade = ref('')
  const filtroEstado = ref('')
  const filtroPosto = ref('')

  const temFiltrosAtivos = computed(
    () =>
      !!(
        pesquisa.value ||
        filtroMotivo.value ||
        filtroPrioridade.value ||
        filtroEstado.value ||
        filtroPosto.value
      ),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroMotivo.value = ''
    filtroPrioridade.value = ''
    filtroEstado.value = ''
    filtroPosto.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    return veiculos.value.filter((v) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !v.matricula.toLowerCase().includes(q) &&
          !v.proprietario.toLowerCase().includes(q) &&
          !v.marca.toLowerCase().includes(q) &&
          !v.modelo.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroMotivo.value && v.motivo !== filtroMotivo.value) return false
      if (filtroPrioridade.value && v.prioridade !== filtroPrioridade.value) return false
      if (filtroEstado.value && v.estado !== filtroEstado.value) return false
      if (filtroPosto.value && v.posto !== filtroPosto.value) return false
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
  const veiculoSelecionado = ref<VeiculoCritico | null>(null)

  function abrirDetalhes(v: VeiculoCritico) {
    veiculoSelecionado.value = v
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal — Novo / Editar
  // ----------------------------------------------------------
  const modalForm = ref(false)
  const passo = ref<1 | 2>(1)
  const modoEdicao = ref(false)
  const aSalvar = ref(false)
  const veiculoEditandoId = ref<string | null>(null)

  const form = reactive({
    matricula: '',
    marca: '',
    modelo: '',
    proprietario: '',
    nif: '',
    telefone: '',
    motivo: 'Hotlist PRM' as MotivoCritico,
    prioridade: 'Média' as PrioridadeCritico,
    estado: 'Activo' as EstadoCritico,
    posto: 'Posto Central',
    zona: '',
    agente: 'Agente Chissano',
    multasPendentes: 0,
    valorMultas: 0,
    observacoes: '',
  })

  const passo1Valido = computed(
    () =>
      form.matricula.trim().length >= 6 &&
      form.marca.trim().length > 0 &&
      form.modelo.trim().length > 0,
  )

  const passo2Valido = computed(
    () =>
      form.proprietario.trim().length > 0 &&
      /^\d{9}$/.test(form.nif) &&
      form.agente.trim().length > 0 &&
      form.posto.trim().length > 0,
  )

  const formValido = computed(() => passo1Valido.value && passo2Valido.value)

  function abrirNova() {
    Object.assign(form, {
      matricula: '',
      marca: '',
      modelo: '',
      proprietario: '',
      nif: '',
      telefone: '',
      motivo: 'Hotlist PRM' as MotivoCritico,
      prioridade: 'Média' as PrioridadeCritico,
      estado: 'Activo' as EstadoCritico,
      posto: 'Posto Central',
      zona: '',
      agente: 'Agente Chissano',
      multasPendentes: 0,
      valorMultas: 0,
      observacoes: '',
    })
    modoEdicao.value = false
    veiculoEditandoId.value = null
    passo.value = 1
    aSalvar.value = false
    erro.value = null
    modalForm.value = true
  }

  function abrirEditar(v: VeiculoCritico) {
    Object.assign(form, {
      matricula: v.matricula,
      marca: v.marca,
      modelo: v.modelo,
      proprietario: v.proprietario,
      nif: v.nif,
      telefone: v.telefone === '—' ? '' : v.telefone,
      motivo: v.motivo,
      prioridade: v.prioridade,
      estado: v.estado,
      posto: v.posto === '—' ? 'Posto Central' : v.posto,
      zona: v.zona === '—' ? '' : v.zona,
      agente: v.agente === '—' ? 'Agente Chissano' : v.agente,
      multasPendentes: v.multasPendentes,
      valorMultas: v.valorMultas,
      observacoes: v.observacoes ?? '',
    })
    modoEdicao.value = true
    veiculoEditandoId.value = v.id
    passo.value = 1
    aSalvar.value = false
    erro.value = null
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

  async function salvarForm(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false
    aSalvar.value = true
    erro.value = null

    const payload: CriarVeiculoCriticoPayload = {
      matricula: form.matricula.toUpperCase(),
      marca: form.marca,
      modelo: form.modelo,
      proprietario: form.proprietario,
      nif: form.nif,
      telefone: form.telefone || undefined,
      motivo: form.motivo,
      prioridade: form.prioridade,
      estado: form.estado,
      posto: form.posto || undefined,
      zona: form.zona || undefined,
      agente: form.agente || undefined,
      multas_pendentes: form.multasPendentes,
      valor_multas: form.valorMultas,
      observacoes: form.observacoes || undefined,
    }

    try {
      if (modoEdicao.value && veiculoEditandoId.value) {
        await veiculosCriticosService.actualizar(veiculoEditandoId.value, payload)
      } else {
        await veiculosCriticosService.criar(payload)
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
  async function abaterHotlist(id: string): Promise<boolean> {
    try {
      await veiculosCriticosService.abaterHotlist(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function regularizarSeguro(id: string): Promise<boolean> {
    try {
      await veiculosCriticosService.regularizarSeguro(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      await veiculosCriticosService.remover(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    MOTIVOS,
    PRIORIDADES,
    ESTADOS,
    POSTOS,
    AGENTES,
    POR_PAGINA,

    // Estado backend
    aCarregar,
    carregado,
    erro,
    carregar,

    veiculos,
    kpis,

    // Filtros
    pesquisa,
    filtroMotivo,
    filtroPrioridade,
    filtroEstado,
    filtroPosto,
    temFiltrosAtivos,
    filtrados,
    limparFiltros,

    // Paginação
    pagina,
    totalPaginas,
    inicioPagina,
    fimPagina,
    paginados,

    // Detalhes
    modalDetalhes,
    veiculoSelecionado,
    abrirDetalhes,

    // Form
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

    // Ações
    abaterHotlist,
    regularizarSeguro,
    remover,

    // Helpers
    iniciais,
    estadoClasse,
    prioridadeClasse,
    motivoClasse,
    motivoIcone,
    formatarMoeda,
    formatarInputData,
  }
})