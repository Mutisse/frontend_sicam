// src/stores/admin/postos.store.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  postosService,
  type Posto,
  type PostosKpis,
  type CriarPostoPayload,
} from '@/services/admin/postos.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos / Constantes
// ============================================================
export type { Posto }

export const PROVINCIAS = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Cabo Delgado',
  'Niassa',
] as const

export const POR_PAGINA = 10

// ============================================================
// Helpers
// ============================================================
function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function gerarCodigo(nome: string): string {
  const base = nome
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 10)
  return `PS-${base || 'NOVO'}`
}

// ============================================================
// Store
// ============================================================
export const useAdminPostosStore = defineStore('adminPostos', () => {
  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const postos = ref<Posto[]>([])
  const kpisData = reactive<PostosKpis>({
    total: 0,
    agentes: 0,
    criticos: 0,
    provincias: 0,
  })

  const kpis = computed<PostosKpis>(() => ({ ...kpisData }))

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroProvincia = ref<'' | string>('')
  const paginaActual = ref(1)

  const modalForm = ref(false)
  const modoForm = ref<'criar' | 'editar'>('criar')
  const aSalvar = ref(false)
  const editandoId = ref<string | null>(null)

  const modalDetalhes = ref(false)
  const postoDetalhe = ref<Posto | null>(null)

  const modalConfirmRemover = ref(false)
  const postoARemover = ref<Posto | null>(null)

  const form = reactive<{
    id: string | null
    codigo: string
    nome: string
    provincia: string
    cor: string
    endereco: string
    telefone: string
    notas: string
  }>({
    id: null,
    codigo: '',
    nome: '',
    provincia: '',
    cor: '#2563eb',
    endereco: '',
    telefone: '',
    notas: '',
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
      const atrasoMinimo = new Promise((r) => setTimeout(r, 500))

      const dados = await postosService.listar()
      postos.value = dados.items
      Object.assign(kpisData, dados.kpis)

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
  // Getters
  // ----------------------------------------------------------
  const filtrados = computed(() => {
    const q = normalizar(pesquisa.value.trim())
    return postos.value.filter((p) => {
      if (
        q &&
        !normalizar(p.nome).includes(q) &&
        !normalizar(p.codigo).includes(q)
      )
        return false
      if (filtroProvincia.value && p.provincia !== filtroProvincia.value)
        return false
      return true
    })
  })

  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(filtrados.value.length / POR_PAGINA)),
  )
  const inicioPagina = computed(() => (paginaActual.value - 1) * POR_PAGINA)
  const fimPagina = computed(() =>
    Math.min(paginaActual.value * POR_PAGINA, filtrados.value.length),
  )
  const paginaVisivel = computed(() =>
    filtrados.value.slice(inicioPagina.value, fimPagina.value),
  )

  const paginasVisiveis = computed(() => {
    const total = totalPaginas.value
    const janela = 5
    let ini = Math.max(1, paginaActual.value - Math.floor(janela / 2))
    const fim = Math.min(total, ini + janela - 1)
    ini = Math.max(1, fim - janela + 1)
    return Array.from({ length: fim - ini + 1 }, (_, i) => ini + i)
  })

  watch([pesquisa, filtroProvincia], () => {
    paginaActual.value = 1
  })

  watch(totalPaginas, (t) => {
    if (paginaActual.value > t) paginaActual.value = t
  })

  const formValido = computed(
    () =>
      form.nome.trim().length >= 3 &&
      form.provincia.trim().length > 0 &&
      form.codigo.trim().length > 0,
  )

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  function limparFiltros() {
    pesquisa.value = ''
    filtroProvincia.value = ''
    paginaActual.value = 1
  }

  function abrirCriar() {
    modoForm.value = 'criar'
    editandoId.value = null
    Object.assign(form, {
      id: null,
      codigo: '',
      nome: '',
      provincia: '',
      cor: '#2563eb',
      endereco: '',
      telefone: '',
      notas: '',
    })
    erro.value = null
    modalForm.value = true
  }

  function abrirEditar(p: Posto) {
    modoForm.value = 'editar'
    editandoId.value = p.id
    Object.assign(form, {
      id: p.id,
      codigo: p.codigo,
      nome: p.nome,
      provincia: p.provincia,
      cor: p.cor,
      endereco: p.endereco ?? '',
      telefone: p.telefone ?? '',
      notas: p.notas ?? '',
    })
    erro.value = null
    modalForm.value = true
  }

  function fecharForm() {
    modalForm.value = false
  }

  async function guardar(): Promise<Posto | null> {
    if (!formValido.value || aSalvar.value) return null
    aSalvar.value = true
    erro.value = null

    try {
      // Se o código estiver vazio, gera um automático
      const codigoFinal = form.codigo.trim()
        ? form.codigo.trim().toUpperCase()
        : gerarCodigo(form.nome)

      if (modoForm.value === 'criar') {
        const payload: CriarPostoPayload = {
          codigo: codigoFinal,
          nome: form.nome.trim(),
          provincia: form.provincia,
          cor: form.cor,
        }
        if (form.endereco.trim()) payload.endereco = form.endereco.trim()
        if (form.telefone.trim()) payload.telefone = form.telefone.trim()
        if (form.notas.trim()) payload.notas = form.notas.trim()

        const r = await postosService.criar(payload)
        await carregar()
        fecharForm()
        return r.posto
      }

      if (!editandoId.value) return null

      const r = await postosService.actualizar(editandoId.value, {
        codigo: codigoFinal,
        nome: form.nome.trim(),
        provincia: form.provincia,
        cor: form.cor,
        endereco: form.endereco.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        notas: form.notas.trim() || undefined,
      })
      await carregar()
      fecharForm()
      return r.posto
    } catch (e) {
      erro.value = extrairErro(e)
      return null
    } finally {
      aSalvar.value = false
    }
  }

  function abrirDetalhes(p: Posto) {
    postoDetalhe.value = p
    modalDetalhes.value = true
  }

  function pedirRemover(p: Posto) {
    postoARemover.value = p
    modalConfirmRemover.value = true
  }

  async function confirmarRemover(): Promise<boolean> {
    const p = postoARemover.value
    if (!p) return false

    try {
      await postosService.remover(p.id)
      await carregar()
      postoARemover.value = null
      modalConfirmRemover.value = false
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Export
  // ----------------------------------------------------------
  async function exportarXlsx(): Promise<Blob | null> {
    try {
      return await postosService.exportarXlsx()
    } catch (e) {
      erro.value = extrairErro(e)
      return null
    }
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    PROVINCIAS,
    POR_PAGINA,

    // estado
    aCarregar,
    carregado,
    erro,
    postos,
    kpis,

    // UI
    pesquisa,
    filtroProvincia,
    paginaActual,

    // modais
    modalForm,
    modoForm,
    aSalvar,
    editandoId,
    modalDetalhes,
    postoDetalhe,
    modalConfirmRemover,
    postoARemover,

    // form
    form,

    // getters
    filtrados,
    totalPaginas,
    inicioPagina,
    fimPagina,
    paginaVisivel,
    paginasVisiveis,
    formValido,

    // acções
    carregar,
    limparFiltros,
    abrirCriar,
    abrirEditar,
    fecharForm,
    guardar,
    abrirDetalhes,
    pedirRemover,
    confirmarRemover,
    exportarXlsx,
  }
})