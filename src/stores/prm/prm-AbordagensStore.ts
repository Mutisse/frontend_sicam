// src/stores/prm/prm-AbordagensStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  abordagensService,
  type Abordagem,
  type ResultadoAbordagem,
} from '@/services/prm/abordagens.service'
import { extrairErro } from '@/boot/axios'

// Re-export para o `.vue` poder importar daqui
export type { Abordagem, ResultadoAbordagem } from '@/services/prm/abordagens.service'

// Coordenadas por posto (usadas no mapa)
export const POSTO_COORDS: Record<string, { lat: number; lng: number }> = {
  'Posto Baixa':          { lat: -25.9683, lng: 32.5758 },
  'Posto KaMpfumo':       { lat: -25.9722, lng: 32.5733 },
  'Posto Matola':         { lat: -25.9622, lng: 32.4589 },
  'Posto Machava':        { lat: -25.9218, lng: 32.4812 },
  'Posto Namaacha (EN4)': { lat: -26.0164, lng: 32.0297 },
}

export const usePrmAbordagensStore = defineStore('prmAbordagens', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const RESULTADOS: ResultadoAbordagem[] = [
    'Sem incidentes',
    'Com detenção',
    'Em curso',
  ]

  const AGENTES = [
    'Agente Chissano', 'Agente Nhaca', 'Agente Sitoe',
    'Agente Cumbe', 'Agente Tembe',
  ]

  const POSTOS = [
    'Posto Baixa', 'Posto KaMpfumo', 'Posto Matola',
    'Posto Machava', 'Posto Namaacha (EN4)',
  ]

  const PERIODOS = [
    { key: '1',   label: 'Hoje' },
    { key: '7',   label: 'Últimos 7 dias' },
    { key: '30',  label: 'Últimos 30 dias' },
    { key: 'all', label: 'Tudo' },
  ]

  const POR_PAGINA_PADRAO = 6

  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const abordagens = ref<Abordagem[]>([])

  const kpisBackend = reactive({
    total: 0,
    semIncidentes: 0,
    comDetencao: 0,
    emCurso: 0,
    hotlist: 0,
  })

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      // Atraso mínimo para o skeleton ser visível
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))

      const d = await abordagensService.listar()
      abordagens.value = d.items
      Object.assign(kpisBackend, d.kpis)

      await atrasoMinimo

      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      // Mesmo com erro, marca como carregado para sair do skeleton
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
    semIncidentes: kpisBackend.semIncidentes,
    comDetencao: kpisBackend.comDetencao,
    emCurso: kpisBackend.emCurso,
    hotlist: kpisBackend.hotlist,
  }))

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroResultado = ref('')
  const filtroPosto = ref('')
  const filtroPeriodo = ref('30')

  const temFiltrosAtivos = computed(
    () =>
      !!(pesquisa.value || filtroResultado.value || filtroPosto.value) ||
      filtroPeriodo.value !== '30',
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroResultado.value = ''
    filtroPosto.value = ''
    filtroPeriodo.value = '30'
    pagina.value = 1
  }

  // ----------------------------------------------------------
  // Ordenação
  // ----------------------------------------------------------
  const ordenacao = ref<{ key: keyof Abordagem; dir: 'asc' | 'desc' }>({
    key: 'dataHora',
    dir: 'desc',
  })

  function ordenarPor(key: keyof Abordagem) {
    if (ordenacao.value.key === key) {
      ordenacao.value.dir = ordenacao.value.dir === 'asc' ? 'desc' : 'asc'
    } else {
      ordenacao.value = { key, dir: 'asc' }
    }
  }

  const iconeOrdenacao = computed(() =>
    ordenacao.value.dir === 'asc' ? 'arrow_upward' : 'arrow_downward',
  )

  // ----------------------------------------------------------
  // Filtrados + ordenados
  // ----------------------------------------------------------
  const filtrados = computed(() => {
    let lista = abordagens.value.filter((a) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !a.matricula.toLowerCase().includes(q) &&
          !a.agente.toLowerCase().includes(q) &&
          !a.local.toLowerCase().includes(q) &&
          !a.posto.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroResultado.value && a.resultado !== filtroResultado.value) return false
      if (filtroPosto.value && a.posto !== filtroPosto.value) return false

      if (filtroPeriodo.value !== 'all') {
        const dias = Number(filtroPeriodo.value)
        if (a.diasAtras > dias) return false
      }

      return true
    })

    const { key, dir } = ordenacao.value
    const mult = dir === 'asc' ? 1 : -1

    lista = [...lista].sort((a, b) => {
      let cmp = 0
      if (key === 'dataHora') {
        cmp = a.diasAtras === b.diasAtras ? 0 : (a.diasAtras > b.diasAtras ? -1 : 1)
      } else if (typeof a[key] === 'boolean') {
        cmp = Number(a[key]) - Number(b[key])
      } else {
        cmp = String(a[key] ?? '').localeCompare(String(b[key] ?? ''))
      }
      return cmp * mult
    })

    return lista
  })

  // ----------------------------------------------------------
  // Paginação
  // ----------------------------------------------------------
  const pagina = ref(1)
  const porPagina = ref(POR_PAGINA_PADRAO)

  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(filtrados.value.length / porPagina.value)),
  )
  const inicioPagina = computed(() => (pagina.value - 1) * porPagina.value)
  const fimPagina = computed(() =>
    Math.min(inicioPagina.value + porPagina.value, filtrados.value.length),
  )
  const paginados = computed(() =>
    filtrados.value.slice(inicioPagina.value, fimPagina.value),
  )

  watch(filtrados, () => {
    if (pagina.value > totalPaginas.value) pagina.value = 1
  })

  // ----------------------------------------------------------
  // Seleção
  // ----------------------------------------------------------
  const selecionados = ref<string[]>([])

  const todosSelecionados = computed(
    () =>
      paginados.value.length > 0 &&
      paginados.value.every((a) => selecionados.value.includes(a.id)),
  )

  function toggleSelecionado(id: string) {
    const i = selecionados.value.indexOf(id)
    if (i >= 0) selecionados.value.splice(i, 1)
    else selecionados.value.push(id)
  }

  function toggleTodos() {
    if (todosSelecionados.value) selecionados.value = []
    else selecionados.value = paginados.value.map((a) => a.id)
  }

  function limparSelecao() {
    selecionados.value = []
  }

  // ----------------------------------------------------------
  // Modal — Detalhes
  // ----------------------------------------------------------
  const modalDetalhes = ref(false)
  const abordagemDetalhe = ref<Abordagem | null>(null)

  function abrirDetalhes(a: Abordagem) {
    abordagemDetalhe.value = a
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal — Nova abordagem
  // ----------------------------------------------------------
  const modalForm = ref(false)
  const passo = ref<1 | 2 | 3>(1)
  const aSalvar = ref(false)

  const form = reactive({
    matricula: '',
    agente: '',
    posto: '',
    local: '',
    resultado: '' as ResultadoAbordagem | '',
    emHotlist: false,
    observacoes: '',
  })

  const erros = computed<Record<string, string>>(() => {
    const e: Record<string, string> = {}
    if (form.matricula.trim().length === 0) e.matricula = 'Matrícula é obrigatória'
    else if (form.matricula.trim().length < 6) e.matricula = 'Deve ter pelo menos 6 caracteres'
    if (form.agente.length === 0) e.agente = 'Agente é obrigatório'
    if (form.posto.length === 0) e.posto = 'Posto é obrigatório'
    if (form.local.trim().length === 0) e.local = 'Local é obrigatório'
    if (form.resultado.length === 0) e.resultado = 'Resultado é obrigatório'
    return e
  })

  const passo1Valido = computed(() => !erros.value.matricula && !erros.value.agente)
  const passo2Valido = computed(() => !erros.value.posto && !erros.value.local && !erros.value.resultado)
  const passo3Valido = computed(() => true)
  const formValido = computed(() => passo1Valido.value && passo2Valido.value && passo3Valido.value)

  function abrirNova() {
    passo.value = 1
    aSalvar.value = false
    Object.assign(form, {
      matricula: '',
      agente: '',
      posto: '',
      local: '',
      resultado: '',
      emHotlist: false,
      observacoes: '',
    })
    modalForm.value = true
  }

  function fecharForm() {
    modalForm.value = false
    passo.value = 1
  }

  function proximoPasso() {
    if (passo.value < 3) passo.value = (passo.value + 1) as 1 | 2 | 3
  }

  function passoAnterior() {
    if (passo.value > 1) passo.value = (passo.value - 1) as 1 | 2 | 3
  }

  async function salvarForm(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false
    if (form.resultado === '') return false

    aSalvar.value = true
    erro.value = null

    try {
      await abordagensService.criar({
        matricula: form.matricula.toUpperCase(),
        agente: form.agente,
        posto: form.posto,
        local: form.local,
        resultado: form.resultado,
        observacoes: form.observacoes || null,
      })

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
  async function remover(id: string) {
    try {
      await abordagensService.remover(id)
      abordagens.value = abordagens.value.filter((a) => a.id !== id)
      selecionados.value = selecionados.value.filter((x) => x !== id)
    } catch (e) {
      erro.value = extrairErro(e)
    }
  }

  async function removerSelecionados() {
    if (!selecionados.value.length) return
    try {
      await Promise.all(selecionados.value.map((id) => abordagensService.remover(id)))
      abordagens.value = abordagens.value.filter((a) => !selecionados.value.includes(a.id))
      selecionados.value = []
    } catch (e) {
      erro.value = extrairErro(e)
    }
  }

  // ----------------------------------------------------------
  // Helpers UI
  // ----------------------------------------------------------
  function resultadoClasse(r: ResultadoAbordagem): 'regular' | 'critico' | 'atencao' | 'info' {
    if (r === 'Sem incidentes') return 'regular'
    if (r === 'Com detenção') return 'critico'
    if (r === 'Em curso') return 'atencao'
    return 'info'
  }

  function resultadoIcone(r: ResultadoAbordagem): string {
    if (r === 'Sem incidentes') return 'check_circle'
    if (r === 'Com detenção') return 'gavel'
    if (r === 'Em curso') return 'hourglass_top'
    return 'help'
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    RESULTADOS, AGENTES, POSTOS, PERIODOS, POSTO_COORDS,

    aCarregar,
    carregado,
    erro,
    abordagens,
    kpis,
    carregar,

    pesquisa, filtroResultado, filtroPosto, filtroPeriodo,
    temFiltrosAtivos, filtrados, limparFiltros,

    ordenacao, ordenarPor, iconeOrdenacao,

    pagina, porPagina, totalPaginas, inicioPagina, fimPagina, paginados,

    selecionados, todosSelecionados,
    toggleSelecionado, toggleTodos, limparSelecao,

    modalDetalhes, abordagemDetalhe, abrirDetalhes,

    modalForm, passo, aSalvar, form,
    formValido, passo1Valido, passo2Valido, passo3Valido, erros,
    abrirNova, fecharForm, proximoPasso, passoAnterior, salvarForm,

    remover, removerSelecionados,

    resultadoClasse, resultadoIcone,
  }
})