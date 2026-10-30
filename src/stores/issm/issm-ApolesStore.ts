// src/stores/issm/issm-ApolesStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  apolicesService,
  type Apolice,
  type ApolicesKpis,
  type EstadoApolice,
  type TipoApolice,
  type CriarApolicePayload,
} from '@/services/issm/apolices.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Apolice, EstadoApolice, TipoApolice }

// ============================================================
// Store
// ============================================================
export const useIssmApolesStore = defineStore('issmApoles', () => {
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

  const TIPOS: TipoApolice[] = [
    'Terceiros',
    'Terceiros + Roubo',
    'Todos os riscos',
  ]

  const ESTADOS: EstadoApolice[] = ['Activa', 'A expirar', 'Expirada', 'Anulada']

  const POR_PAGINA = 6

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const apolices = ref<Apolice[]>([])

  const kpisBackend = reactive<ApolicesKpis>({
    total: 0,
    activas: 0,
    aExpirar: 0,
    expiradas: 0,
    anuladas: 0,
    premioTotal: 0,
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

      const dados = await apolicesService.listar()
      apolices.value = dados.items
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
    activas: kpisBackend.activas,
    aExpirar: kpisBackend.aExpirar,
    expiradas: kpisBackend.expiradas,
    anuladas: kpisBackend.anuladas,
    premioTotal: kpisBackend.premioTotal,
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
    e: EstadoApolice,
  ): 'regular' | 'atencao' | 'critico' | 'info' {
    if (e === 'Activa') return 'regular'
    if (e === 'A expirar') return 'atencao'
    if (e === 'Anulada') return 'info'
    return 'critico'
  }

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroSeguradora = ref('')
  const filtroTipo = ref('')
  const filtroEstado = ref('')

  const temFiltrosAtivos = computed(
    () =>
      !!(
        pesquisa.value ||
        filtroSeguradora.value ||
        filtroTipo.value ||
        filtroEstado.value
      ),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroSeguradora.value = ''
    filtroTipo.value = ''
    filtroEstado.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    return apolices.value.filter((a) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !a.numero.toLowerCase().includes(q) &&
          !a.matricula.toLowerCase().includes(q) &&
          !a.segurado.toLowerCase().includes(q) &&
          !a.nif.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroSeguradora.value && a.seguradora !== filtroSeguradora.value) return false
      if (filtroTipo.value && a.tipo !== filtroTipo.value) return false
      if (filtroEstado.value && a.estado !== filtroEstado.value) return false
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
  const apoliceDetalhe = ref<Apolice | null>(null)

  function abrirDetalhes(a: Apolice) {
    apoliceDetalhe.value = a
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal Form
  // ----------------------------------------------------------
  const modalForm = ref(false)
  const passoForm = ref<1 | 2 | 3>(1)
  const modoEdicao = ref(false)
  const aSalvar = ref(false)
  const apoliceEditandoId = ref<string | null>(null)

  const form = reactive({
    numero: '',
    matricula: '',
    segurado: '',
    nif: '',
    telefone: '',
    email: '',
    seguradora: 'EMOSE',
    tipo: 'Terceiros' as TipoApolice,
    inicio: '',
    fim: '',
    premio: 0,
    estado: 'Activa' as EstadoApolice,
    observacoes: '',
  })

  const passo1Valido = computed(
    () =>
      form.numero.trim().length > 0 &&
      form.matricula.trim().length >= 6 &&
      !!form.seguradora &&
      !!form.tipo &&
      !!form.estado,
  )

  const passo2Valido = computed(
    () =>
      form.segurado.trim().length > 0 &&
      /^\d{9}$/.test(form.nif),
  )

  const passo3Valido = computed(
    () =>
      form.inicio.trim().length > 0 &&
      form.fim.trim().length > 0 &&
      form.premio >= 0,
  )

  const formValido = computed(
    () => passo1Valido.value && passo2Valido.value && passo3Valido.value,
  )

  function abrirNova() {
    const hoje = new Date()
    const proximoAno = new Date(hoje)
    proximoAno.setFullYear(hoje.getFullYear() + 1)

    const seq = String(Date.now()).slice(-6)

    Object.assign(form, {
      numero: `AP-${hoje.getFullYear()}-${seq}`,
      matricula: '',
      segurado: '',
      nif: '',
      telefone: '',
      email: '',
      seguradora: 'EMOSE',
      tipo: 'Terceiros' as TipoApolice,
      inicio: formatarInputData(hoje),
      fim: formatarInputData(proximoAno),
      premio: 0,
      estado: 'Activa' as EstadoApolice,
      observacoes: '',
    })
    modoEdicao.value = false
    apoliceEditandoId.value = null
    passoForm.value = 1
    aSalvar.value = false
    erro.value = null
    modalForm.value = true
  }

  function abrirEditar(a: Apolice) {
    Object.assign(form, {
      numero: a.numero,
      matricula: a.matricula,
      segurado: a.segurado,
      nif: a.nif,
      telefone: a.telefone ?? '',
      email: a.email ?? '',
      seguradora: a.seguradora,
      tipo: a.tipo,
      inicio: a.inicio,
      fim: a.fim,
      premio: a.premio,
      estado: a.estado,
      observacoes: a.observacoes ?? '',
    })
    modoEdicao.value = true
    apoliceEditandoId.value = a.id
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

    const payload: CriarApolicePayload = {
      numero: form.numero,
      matricula: form.matricula.toUpperCase(),
      segurado: form.segurado,
      nif: form.nif,
      telefone: form.telefone || undefined,
      email: form.email || undefined,
      seguradora: form.seguradora,
      tipo: form.tipo,
      inicio: form.inicio,
      fim: form.fim,
      premio: form.premio,
      estado: form.estado,
      observacoes: form.observacoes || undefined,
    }

    try {
      if (modoEdicao.value && apoliceEditandoId.value) {
        await apolicesService.actualizar(apoliceEditandoId.value, payload)
      } else {
        await apolicesService.criar(payload)
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
  async function remover(id: string): Promise<boolean> {
    try {
      await apolicesService.remover(id)
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
    SEGURADORAS,
    TIPOS,
    ESTADOS,
    POR_PAGINA,

    aCarregar,
    carregado,
    erro,
    carregar,

    apolices,
    kpis,

    pesquisa,
    filtroSeguradora,
    filtroTipo,
    filtroEstado,
    temFiltrosAtivos,
    filtrados,
    limparFiltros,

    pagina,
    totalPaginas,
    inicioPagina,
    fimPagina,
    paginados,

    modalDetalhes,
    apoliceDetalhe,
    abrirDetalhes,

    modalForm,
    passoForm,
    modoEdicao,
    aSalvar,
    form,
    formValido,
    passo1Valido,
    passo2Valido,
    passo3Valido,
    abrirNova,
    abrirEditar,
    fecharForm,
    proximoPasso,
    passoAnterior,
    salvarForm,

    remover,

    formatarMoeda,
    formatarInputData,
    estadoClasse,
  }
})