// src/stores/chefe/chefe-AprovacoesStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  aprovacoesService,
  type Aprovacao,
  type AprovacoesKpis,
  type EstadoAprovacao,
  type TipoAprovacao,
  type TabAprovacao,
  type PrioridadeAprovacao,
} from '@/services/chefe/aprovacoes.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type {
  Aprovacao,
  EstadoAprovacao,
  TipoAprovacao,
  TabAprovacao,
  PrioridadeAprovacao,
}

// ============================================================
// Store
// ============================================================
export const useChefeAprovacoesStore = defineStore('chefeAprovacoes', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const TIPOS: TipoAprovacao[] = ['auto', 'dados-sensiveis', 'apreensao']
  const ESTADOS: EstadoAprovacao[] = ['pendente', 'aprovado', 'rejeitado']
  const PRIORIDADES: PrioridadeAprovacao[] = ['Baixa', 'Média', 'Alta', 'Urgente']
  const RESPONSAVEIS = [
    'Chefe Chissano',
    'Chefe Nhaca',
    'Chefe Sitoe',
    'Chefe Cumbe',
  ]
  const POR_PAGINA = 6

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const aprovacoes = ref<Aprovacao[]>([])

  const kpisBackend = reactive<AprovacoesKpis>({
    pendentes: 0,
    aprovadosHoje: 0,
    rejeitadosHoje: 0,
    tempoMedio: 0,
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

      const dados = await aprovacoesService.listar()
      aprovacoes.value = dados.items
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
    pendentes: kpisBackend.pendentes,
    aprovadosHoje: kpisBackend.aprovadosHoje,
    rejeitadosHoje: kpisBackend.rejeitadosHoje,
    tempoMedio: kpisBackend.tempoMedio,
  }))

  // ----------------------------------------------------------
  // Tabs
  // ----------------------------------------------------------
  const tabActivo = ref<TabAprovacao>('pendentes')

  const tabs = computed(() => {
    const lista = aprovacoes.value
    return [
      {
        key: 'pendentes' as const,
        label: 'Pendentes',
        icon: 'pending_actions',
        count: lista.filter((a) => a.estado === 'pendente').length,
      },
      {
        key: 'aprovados' as const,
        label: 'Aprovados',
        icon: 'check_circle',
        count: lista.filter((a) => a.estado === 'aprovado').length,
      },
      {
        key: 'rejeitados' as const,
        label: 'Rejeitados',
        icon: 'cancel',
        count: lista.filter((a) => a.estado === 'rejeitado').length,
      },
    ]
  })

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroTipo = ref('')
  const filtroPrioridade = ref('')

  const temFiltrosAtivos = computed(
    () => !!(pesquisa.value || filtroTipo.value || filtroPrioridade.value),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroTipo.value = ''
    filtroPrioridade.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    // 1) filtra por tab
    let lista = aprovacoes.value
    if (tabActivo.value === 'pendentes')
      lista = lista.filter((a) => a.estado === 'pendente')
    else if (tabActivo.value === 'aprovados')
      lista = lista.filter((a) => a.estado === 'aprovado')
    else lista = lista.filter((a) => a.estado === 'rejeitado')

    // 2) filtros extra
    return lista.filter((a) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !a.titulo.toLowerCase().includes(q) &&
          !a.matricula.toLowerCase().includes(q) &&
          !a.agente.toLowerCase().includes(q) &&
          !a.posto.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroTipo.value && a.tipo !== filtroTipo.value) return false
      if (filtroPrioridade.value && a.prioridade !== filtroPrioridade.value)
        return false
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

  watch([filtrados, tabActivo], () => {
    if (pagina.value > totalPaginas.value) pagina.value = 1
  })

  // ----------------------------------------------------------
  // Modal — Detalhes
  // ----------------------------------------------------------
  const modalDetalhes = ref(false)
  const aprovacaoDetalhe = ref<Aprovacao | null>(null)

  function abrirDetalhes(a: Aprovacao) {
    aprovacaoDetalhe.value = a
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal — Rejeição
  // ----------------------------------------------------------
  const dialogRejeicao = ref(false)
  const motivoRejeicao = ref('')
  const aprovacaoSelecionada = ref<Aprovacao | null>(null)
  const responsavel = ref(RESPONSAVEIS[0]!)

  function abrirRejeicao(a: Aprovacao) {
    aprovacaoSelecionada.value = a
    motivoRejeicao.value = ''
    responsavel.value = RESPONSAVEIS[0]!
    dialogRejeicao.value = true
  }

  function fecharRejeicao() {
    dialogRejeicao.value = false
    motivoRejeicao.value = ''
  }

  async function confirmarRejeicao(): Promise<boolean> {
    if (!aprovacaoSelecionada.value) return false
    if (motivoRejeicao.value.trim().length < 10) return false

    try {
      await aprovacoesService.rejeitar(
        aprovacaoSelecionada.value.id,
        motivoRejeicao.value,
        responsavel.value,
      )
      await carregar()
      fecharRejeicao()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Aprovar
  // ----------------------------------------------------------
  async function aprovar(id: string): Promise<boolean> {
    try {
      await aprovacoesService.aprovar(id, 'Chefe de Posto')
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
  function iconeTipo(t: TipoAprovacao): string {
    if (t === 'auto') return 'receipt_long'
    if (t === 'dados-sensiveis') return 'lock'
    return 'gavel'
  }

  function labelTipo(t: TipoAprovacao): string {
    if (t === 'auto') return 'Auto de Notícia'
    if (t === 'dados-sensiveis') return 'Dados sensíveis'
    return 'Apreensão'
  }

  function labelEstado(e: EstadoAprovacao): string {
    if (e === 'pendente') return 'Aguarda'
    if (e === 'aprovado') return 'Aprovado'
    return 'Rejeitado'
  }

  function prioridadeClasse(
    p: PrioridadeAprovacao,
  ): 'regular' | 'atencao' | 'critico' {
    if (p === 'Baixa') return 'regular'
    if (p === 'Média') return 'atencao'
    return 'critico'
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    TIPOS,
    ESTADOS,
    PRIORIDADES,
    RESPONSAVEIS,
    POR_PAGINA,

    aCarregar,
    carregado,
    erro,
    carregar,

    aprovacoes,
    kpis,
    tabs,
    tabActivo,

    pesquisa,
    filtroTipo,
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
    aprovacaoDetalhe,
    abrirDetalhes,

    dialogRejeicao,
    motivoRejeicao,
    aprovacaoSelecionada,
    responsavel,
    abrirRejeicao,
    fecharRejeicao,
    confirmarRejeicao,

    aprovar,

    iconeTipo,
    labelTipo,
    labelEstado,
    prioridadeClasse,
  }
})