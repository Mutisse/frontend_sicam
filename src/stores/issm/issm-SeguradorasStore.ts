// src/stores/issm/issm-SeguradorasStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  seguradorasService,
  type Seguradora,
  type SeguradorasKpis,
  type EstadoSeguradora,
  type CategoriaSeguradora,
  type CriarSeguradoraPayload,
} from '@/services/issm/seguradoras.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Seguradora, EstadoSeguradora, CategoriaSeguradora }

// ============================================================
// Store
// ============================================================
export const useIssmSeguradorasStore = defineStore('issmSeguradoras', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const CATEGORIAS: CategoriaSeguradora[] = ['Nacional', 'Internacional', 'Mútua']
  const ESTADOS: EstadoSeguradora[] = ['Activa', 'Suspensa', 'Inactiva']

  const PROVINCIAS = [
    'Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane',
    'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula',
    'Cabo Delgado', 'Niassa',
  ]

  const POR_PAGINA = 6

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const seguradoras = ref<Seguradora[]>([])

  const kpisBackend = reactive<SeguradorasKpis>({
    total: 0,
    activas: 0,
    suspensas: 0,
    inactivas: 0,
    totalApoles: 0,
    totalSinistros: 0,
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

      const dados = await seguradorasService.listar()
      seguradoras.value = dados.items
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
    suspensas: kpisBackend.suspensas,
    inactivas: kpisBackend.inactivas,
    totalApoles: kpisBackend.totalApoles,
    totalSinistros: kpisBackend.totalSinistros,
  }))

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function formatarNumero(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  }

  function formatarInputData(d: Date): string {
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    return `${dia}/${mes}/${d.getFullYear()}`
  }

  function estadoClasse(estado: EstadoSeguradora): 'regular' | 'atencao' | 'critico' {
    if (estado === 'Activa') return 'regular'
    if (estado === 'Suspensa') return 'atencao'
    return 'critico'
  }

  function categoriaClasse(c: CategoriaSeguradora): 'nacional' | 'internacional' | 'mutua' {
    if (c === 'Nacional') return 'nacional'
    if (c === 'Internacional') return 'internacional'
    return 'mutua'
  }

  function categoriaIcone(c: CategoriaSeguradora): string {
    if (c === 'Nacional') return 'flag'
    if (c === 'Internacional') return 'public'
    return 'groups'
  }

  function iniciais(sigla: string): string {
    return sigla.slice(0, 2).toUpperCase()
  }

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroCategoria = ref('')
  const filtroEstado = ref('')
  const filtroProvincia = ref('')

  const temFiltrosAtivos = computed(
    () =>
      !!(
        pesquisa.value ||
        filtroCategoria.value ||
        filtroEstado.value ||
        filtroProvincia.value
      ),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroCategoria.value = ''
    filtroEstado.value = ''
    filtroProvincia.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    return seguradoras.value.filter((s) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !s.nome.toLowerCase().includes(q) &&
          !s.codigo.toLowerCase().includes(q) &&
          !s.sigla.toLowerCase().includes(q) &&
          !s.nif.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroCategoria.value && s.categoria !== filtroCategoria.value) return false
      if (filtroEstado.value && s.estado !== filtroEstado.value) return false
      if (filtroProvincia.value && s.provincia !== filtroProvincia.value) return false
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
  const seguradoraDetalhe = ref<Seguradora | null>(null)

  function abrirDetalhes(s: Seguradora) {
    seguradoraDetalhe.value = s
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal Form
  // ----------------------------------------------------------
  const modalForm = ref(false)
  const passoForm = ref<1 | 2>(1)
  const modoEdicao = ref(false)
  const aSalvar = ref(false)
  const seguradoraEditandoId = ref<string | null>(null)

  const form = reactive({
    codigo: '',
    nome: '',
    sigla: '',
    nif: '',
    categoria: 'Nacional' as CategoriaSeguradora,
    email: '',
    telefone: '',
    website: '',
    endereco: '',
    cidade: '',
    provincia: 'Maputo Cidade',
    responsavel: '',
    contactoResponsavel: '',
    estado: 'Activa' as EstadoSeguradora,
    observacoes: '',
  })

  const passo1Valido = computed(
    () =>
      form.codigo.trim().length > 0 &&
      form.nome.trim().length > 0 &&
      form.sigla.trim().length > 0 &&
      /^\d{9}$/.test(form.nif),
  )

  const passo2Valido = computed(
    () =>
      form.email.trim().length > 0 &&
      form.telefone.trim().length > 0 &&
      form.endereco.trim().length > 0 &&
      form.cidade.trim().length > 0 &&
      form.responsavel.trim().length > 0,
  )

  const formValido = computed(() => passo1Valido.value && passo2Valido.value)

  function abrirNova() {
    const proximo = seguradoras.value.length + 1
    Object.assign(form, {
      codigo: `SEG-${String(proximo).padStart(3, '0')}`,
      nome: '',
      sigla: '',
      nif: '',
      categoria: 'Nacional' as CategoriaSeguradora,
      email: '',
      telefone: '',
      website: '',
      endereco: '',
      cidade: '',
      provincia: 'Maputo Cidade',
      responsavel: '',
      contactoResponsavel: '',
      estado: 'Activa' as EstadoSeguradora,
      observacoes: '',
    })
    modoEdicao.value = false
    seguradoraEditandoId.value = null
    passoForm.value = 1
    aSalvar.value = false
    erro.value = null
    modalForm.value = true
  }

  function abrirEditar(s: Seguradora) {
    Object.assign(form, {
      codigo: s.codigo,
      nome: s.nome,
      sigla: s.sigla,
      nif: s.nif,
      categoria: s.categoria,
      email: s.email,
      telefone: s.telefone,
      website: s.website ?? '',
      endereco: s.endereco,
      cidade: s.cidade,
      provincia: s.provincia,
      responsavel: s.responsavel,
      contactoResponsavel: s.contactoResponsavel === '—' ? '' : s.contactoResponsavel,
      estado: s.estado,
      observacoes: s.observacoes ?? '',
    })
    modoEdicao.value = true
    seguradoraEditandoId.value = s.id
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
    if (passoForm.value < 2) passoForm.value = 2
  }

  function passoAnterior() {
    if (passoForm.value > 1) passoForm.value = 1
  }

  async function salvarForm(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false
    aSalvar.value = true
    erro.value = null

    const payload: CriarSeguradoraPayload = {
      codigo: form.codigo,
      sigla: form.sigla.toUpperCase(),
      nome: form.nome,
      nif: form.nif,
      categoria: form.categoria,
      email: form.email,
      telefone: form.telefone,
      website: form.website || undefined,
      endereco: form.endereco,
      cidade: form.cidade,
      provincia: form.provincia,
      responsavel: form.responsavel,
      contactoResponsavel: form.contactoResponsavel || undefined,
      estado: form.estado,
      observacoes: form.observacoes || undefined,
    }

    try {
      if (modoEdicao.value && seguradoraEditandoId.value) {
        await seguradorasService.actualizar(seguradoraEditandoId.value, payload)
      } else {
        await seguradorasService.criar(payload)
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
  async function activar(id: string): Promise<boolean> {
    try {
      await seguradorasService.activar(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function suspender(id: string): Promise<boolean> {
    try {
      await seguradorasService.suspender(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function inactivar(id: string): Promise<boolean> {
    try {
      await seguradorasService.inactivar(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      await seguradorasService.remover(id)
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
    CATEGORIAS,
    ESTADOS,
    PROVINCIAS,
    POR_PAGINA,

    aCarregar,
    carregado,
    erro,
    carregar,

    seguradoras,
    kpis,

    pesquisa,
    filtroCategoria,
    filtroEstado,
    filtroProvincia,
    temFiltrosAtivos,
    filtrados,
    limparFiltros,

    pagina,
    totalPaginas,
    inicioPagina,
    fimPagina,
    paginados,

    modalDetalhes,
    seguradoraDetalhe,
    abrirDetalhes,

    modalForm,
    passoForm,
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

    activar,
    suspender,
    inactivar,
    remover,

    estadoClasse,
    categoriaClasse,
    categoriaIcone,
    iniciais,
    formatarNumero,
    formatarInputData,
  }
})