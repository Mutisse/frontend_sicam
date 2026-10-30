// src/stores/issm/issm-SinistrosStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  sinistrosService,
  type Sinistro,
  type SinistrosKpis,
  type EstadoSinistro,
  type TipoSinistro,
  type GravidadeSinistro,
  type CriarSinistroPayload,
} from '@/services/issm/sinistros.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Sinistro, EstadoSinistro, TipoSinistro, GravidadeSinistro }

// ============================================================
// Store
// ============================================================
export const useIssmSinistrosStore = defineStore('issmSinistros', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const SEGURADORAS = [
    'EMOSE',
    'Hollard Moçambique',
    'Seguradora A',
    'Seguradora B',
    'Seguradora C',
    'Seguradora D',
  ]

  const TIPOS: TipoSinistro[] = [
    'Colisão', 'Furto', 'Incêndio', 'Inundação', 'Vandalismo',
  ]

  const ESTADOS: EstadoSinistro[] = [
    'Aberto', 'Em análise', 'Resolvido', 'Recusado',
  ]

  const GRAVIDADES: GravidadeSinistro[] = ['Leve', 'Moderado', 'Grave']

  const RESPONSAVEIS = [
    'Insp. Chissano', 'Insp. Nhaca', 'Insp. Sitoe', 'Insp. Cumbe', 'Insp. Tembe',
  ]

  const POR_PAGINA = 6

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const sinistros = ref<Sinistro[]>([])

  const kpisBackend = reactive<SinistrosKpis>({
    total: 0,
    abertos: 0,
    emAnalise: 0,
    resolvidos: 0,
    recusados: 0,
    valorTotal: 0,
    valorAprovado: 0,
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

      const dados = await sinistrosService.listar()
      sinistros.value = dados.items
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
    abertos: kpisBackend.abertos,
    emAnalise: kpisBackend.emAnalise,
    resolvidos: kpisBackend.resolvidos,
    recusados: kpisBackend.recusados,
    valorTotal: kpisBackend.valorTotal,
    valorAprovado: kpisBackend.valorAprovado,
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

  function estadoClasse(
    estado: EstadoSinistro,
  ): 'regular' | 'atencao' | 'critico' | 'info' {
    if (estado === 'Resolvido') return 'regular'
    if (estado === 'Em análise') return 'atencao'
    if (estado === 'Recusado') return 'info'
    return 'critico'
  }

  function tipoIcone(t: TipoSinistro): string {
    if (t === 'Colisão') return 'car_crash'
    if (t === 'Furto') return 'local_police'
    if (t === 'Incêndio') return 'local_fire_department'
    if (t === 'Inundação') return 'water'
    return 'gavel'
  }

  function tipoClasse(
    t: TipoSinistro,
  ): 'colisao' | 'furto' | 'incendio' | 'inundacao' | 'vandalismo' {
    if (t === 'Colisão') return 'colisao'
    if (t === 'Furto') return 'furto'
    if (t === 'Incêndio') return 'incendio'
    if (t === 'Inundação') return 'inundacao'
    return 'vandalismo'
  }

  function gravidadeClasse(
    g: GravidadeSinistro,
  ): 'regular' | 'atencao' | 'critico' {
    if (g === 'Leve') return 'regular'
    if (g === 'Moderado') return 'atencao'
    return 'critico'
  }

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroTipo = ref('')
  const filtroEstado = ref('')
  const filtroSeguradora = ref('')
  const filtroGravidade = ref('')

  const temFiltrosAtivos = computed(
    () =>
      !!(
        pesquisa.value ||
        filtroTipo.value ||
        filtroEstado.value ||
        filtroSeguradora.value ||
        filtroGravidade.value
      ),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroTipo.value = ''
    filtroEstado.value = ''
    filtroSeguradora.value = ''
    filtroGravidade.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    return sinistros.value.filter((s) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !s.matricula.toLowerCase().includes(q) &&
          !s.numero.toLowerCase().includes(q) &&
          !s.segurado.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroTipo.value && s.tipo !== filtroTipo.value) return false
      if (filtroEstado.value && s.estado !== filtroEstado.value) return false
      if (filtroSeguradora.value && s.seguradora !== filtroSeguradora.value) return false
      if (filtroGravidade.value && s.gravidade !== filtroGravidade.value) return false
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
  // Modal Detalhes
  // ----------------------------------------------------------
  const modalDetalhes = ref(false)
  const sinistroDetalhe = ref<Sinistro | null>(null)

  function abrirDetalhes(s: Sinistro) {
    sinistroDetalhe.value = s
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal Form
  // ----------------------------------------------------------
  const modalForm = ref(false)
  const passoForm = ref<1 | 2 | 3>(1)
  const modoEdicao = ref(false)
  const aSalvar = ref(false)
  const sinistroEditandoId = ref<string | null>(null)

  const form = reactive({
    numero: '',
    matricula: '',
    apolice: '',
    segurado: '',
    seguradora: 'EMOSE',
    tipo: 'Colisão' as TipoSinistro,
    gravidade: 'Moderado' as GravidadeSinistro,
    data: '',
    local: '',
    descricao: '',
    valorEstimado: 0,
    valorAprovado: 0,
    estado: 'Aberto' as EstadoSinistro,
    responsavel: 'Insp. Chissano',
    observacoes: '',
  })

  const passo1Valido = computed(
    () =>
      form.numero.trim().length > 0 &&
      form.matricula.trim().length >= 6 &&
      form.seguradora.length > 0 &&
      form.segurado.trim().length > 0,
  )

  const passo2Valido = computed(
    () =>
      form.tipo.length > 0 &&
      form.gravidade.length > 0 &&
      form.data.length > 0 &&
      form.local.trim().length > 0,
  )

  const passo3Valido = computed(
    () =>
      form.descricao.trim().length > 0 &&
      form.valorEstimado > 0 &&
      form.responsavel.length > 0,
  )

  const formValido = computed(
    () => passo1Valido.value && passo2Valido.value && passo3Valido.value,
  )

  function abrirNovo() {
    const hoje = new Date()
    Object.assign(form, {
      numero: `SN-${hoje.getFullYear()}-${String(Date.now()).slice(-6)}`,
      matricula: '',
      apolice: '',
      segurado: '',
      seguradora: 'EMOSE',
      tipo: 'Colisão' as TipoSinistro,
      gravidade: 'Moderado' as GravidadeSinistro,
      data: formatarInputData(hoje),
      local: '',
      descricao: '',
      valorEstimado: 0,
      valorAprovado: 0,
      estado: 'Aberto' as EstadoSinistro,
      responsavel: 'Insp. Chissano',
      observacoes: '',
    })
    modoEdicao.value = false
    sinistroEditandoId.value = null
    passoForm.value = 1
    aSalvar.value = false
    erro.value = null
    modalForm.value = true
  }

  function abrirEditar(s: Sinistro) {
    Object.assign(form, {
      numero: s.numero,
      matricula: s.matricula,
      apolice: s.apolice === '—' ? '' : s.apolice,
      segurado: s.segurado,
      seguradora: s.seguradora,
      tipo: s.tipo,
      gravidade: s.gravidade,
      data: s.data,
      local: s.local,
      descricao: s.descricao,
      valorEstimado: s.valorEstimado,
      valorAprovado: s.valorAprovado ?? 0,
      estado: s.estado,
      responsavel: s.responsavel,
      observacoes: s.observacoes ?? '',
    })
    modoEdicao.value = true
    sinistroEditandoId.value = s.id
    passoForm.value = 1
    aSalvar.value = false
    erro.value = null
    modalForm.value = true
  }

  function fecharForm() {
    modalForm.value = false
    passoForm.value = 1
  }

  function proximoPasso() {
    if (passoForm.value < 3) passoForm.value = (passoForm.value + 1) as 1 | 2 | 3
  }

  function passoAnterior() {
    if (passoForm.value > 1) passoForm.value = (passoForm.value - 1) as 1 | 2 | 3
  }

  async function salvarForm(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false
    aSalvar.value = true
    erro.value = null

    const payload: CriarSinistroPayload = {
      numero: form.numero,
      matricula: form.matricula.toUpperCase(),
      apolice: form.apolice || undefined,
      segurado: form.segurado,
      seguradora: form.seguradora,
      tipo: form.tipo,
      gravidade: form.gravidade,
      data: form.data,
      local: form.local,
      descricao: form.descricao,
      valorEstimado: form.valorEstimado,
      valorAprovado: form.valorAprovado || undefined,
      estado: form.estado,
      responsavel: form.responsavel,
      observacoes: form.observacoes || undefined,
    }

    try {
      if (modoEdicao.value && sinistroEditandoId.value) {
        await sinistrosService.actualizar(sinistroEditandoId.value, payload)
      } else {
        await sinistrosService.criar(payload)
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
  // Ações de estado
  // ----------------------------------------------------------
  async function marcarEmAnalise(id: string): Promise<boolean> {
    try {
      await sinistrosService.marcarEmAnalise(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function marcarResolvido(id: string, valorAprovado?: number): Promise<boolean> {
    try {
      await sinistrosService.marcarResolvido(id, valorAprovado)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function recusar(id: string): Promise<boolean> {
    try {
      await sinistrosService.recusar(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      await sinistrosService.remover(id)
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
    SEGURADORAS, TIPOS, ESTADOS, GRAVIDADES, RESPONSAVEIS, POR_PAGINA,

    aCarregar,
    carregado,
    erro,
    carregar,

    sinistros, kpis,

    pesquisa, filtroTipo, filtroEstado, filtroSeguradora, filtroGravidade,
    temFiltrosAtivos, filtrados, limparFiltros,

    pagina, totalPaginas, inicioPagina, fimPagina, paginados,

    modalDetalhes, sinistroDetalhe, abrirDetalhes,

    modalForm, passoForm, modoEdicao, aSalvar, form, formValido,
    passo1Valido, passo2Valido, passo3Valido,
    abrirNovo, abrirEditar, fecharForm, proximoPasso, passoAnterior, salvarForm,

    marcarEmAnalise, marcarResolvido, recusar, remover,

    estadoClasse, tipoIcone, tipoClasse, gravidadeClasse,
    formatarMoeda, formatarInputData,
  }
})