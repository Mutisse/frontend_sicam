// src/stores/agente/agente-historico.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  historicoService,
  type ConsultaHistorico,
  type HistoricoKpis,
  type EstadoConsulta,
} from '@/services/agente/historico.service'
import { extrairErro } from '@/boot/axios'

export type { ConsultaHistorico, HistoricoKpis }

export interface Grupo {
  titulo: string
  itens: ConsultaHistorico[]
}

export const FILTROS = ['Todas', 'Crítico', 'Atenção', 'Regular', 'Sem dados'] as const
export const PERIODOS = ['Hoje', '7 dias', '30 dias', 'Tudo'] as const

export type FiltroActivo = (typeof FILTROS)[number]
export type PeriodoActivo = (typeof PERIODOS)[number]

// Mapeia label ↔ estado do backend
const LABEL_PARA_ESTADO: Record<string, EstadoConsulta | null> = {
  Todas: null,
  Crítico: 'critico',
  Atenção: 'atencao',
  Regular: 'regular',
  'Sem dados': 'sem-dados',
}

const PERIODO_PARA_API: Record<PeriodoActivo, 'hoje' | '7d' | '30d' | 'tudo'> = {
  Hoje: 'hoje',
  '7 dias': '7d',
  '30 dias': '30d',
  Tudo: 'tudo',
}

// ============================================================
// Store
// ============================================================
export const useAgenteHistoricoStore = defineStore('agenteHistorico', () => {
  // ----------------------------------------------------------
  // Estado remoto
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const historico = ref<ConsultaHistorico[]>([])
  const kpisData = ref<HistoricoKpis>({
    total: 0,
    hoje: 0,
    criticos: 0,
    atencao: 0,
    regulares: 0,
  })

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const filtroActivo = ref<FiltroActivo>('Todas')
  const periodoActivo = ref<PeriodoActivo>('Tudo')
  const busca = ref('')

  // ----------------------------------------------------------
  // Carregar do backend
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null

    try {
      const estado = LABEL_PARA_ESTADO[filtroActivo.value]

      const dados = await historicoService.listar({
        periodo: PERIODO_PARA_API[periodoActivo.value],
        ...(estado ? { estado } : {}),
        ...(busca.value ? { q: busca.value } : {}),
      })

      historico.value = dados.items
      kpisData.value = dados.kpis
      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      historico.value = []
      carregado.value = true
    } finally {
      aCarregar.value = false
    }
  }

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const filtrados = computed<ConsultaHistorico[]>(() => historico.value)

  const grupos = computed<Grupo[]>(() => {
    const map: Record<string, ConsultaHistorico[]> = {
      Hoje: [],
      Ontem: [],
      'Esta semana': [],
      'Mais antigo': [],
    }

    for (const c of filtrados.value) {
      if (c.diasAtras === 0) map['Hoje']!.push(c)
      else if (c.diasAtras === 1) map['Ontem']!.push(c)
      else if (c.diasAtras <= 7) map['Esta semana']!.push(c)
      else map['Mais antigo']!.push(c)
    }

    return Object.entries(map)
      .filter(([, itens]) => itens.length > 0)
      .map(([titulo, itens]) => ({ titulo, itens }))
  })

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function contarPorFiltro(f: FiltroActivo): number {
    if (f === 'Todas') return kpisData.value.total
    if (f === 'Crítico') return kpisData.value.criticos
    if (f === 'Atenção') return kpisData.value.atencao
    if (f === 'Regular') return kpisData.value.regulares
    if (f === 'Sem dados') return 0 // backend não devolve, contar do array
    return 0
  }

  function badgeVariant(
    score: number | null,
  ): 'regular' | 'atencao' | 'critico' | 'sem-dados' {
    if (score === null) return 'sem-dados'
    if (score < 30) return 'critico'
    if (score < 60) return 'atencao'
    return 'regular'
  }

  function badgeLabel(score: number | null): string {
    if (score === null) return 'Sem dados'
    if (score < 30) return `Crítico ${score}`
    if (score < 60) return `Atenção ${score}`
    return `Regular ${score}`
  }

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  function limparFiltros() {
    filtroActivo.value = 'Todas'
    periodoActivo.value = 'Tudo'
    busca.value = ''
    carregar()
  }

  function setFiltro(f: FiltroActivo) {
    filtroActivo.value = f
    carregar()
  }

  function setPeriodo(p: PeriodoActivo) {
    periodoActivo.value = p
    carregar()
  }

  // Debounce para a busca
  let buscaTimer: ReturnType<typeof setTimeout> | null = null
  function setBusca(valor: string) {
    busca.value = valor
    if (buscaTimer) clearTimeout(buscaTimer)
    buscaTimer = setTimeout(() => carregar(), 300)
  }

  return {
    // estrutura
    FILTROS,
    PERIODOS,

    // estado
    aCarregar,
    carregado,
    erro,
    filtroActivo,
    periodoActivo,
    busca,

    // dados
    historico,
    kpisData,

    // getters
    filtrados,
    grupos,

    // helpers
    contarPorFiltro,
    badgeVariant,
    badgeLabel,

    // acções
    carregar,
    setFiltro,
    setPeriodo,
    setBusca,
    limparFiltros,
  }
})