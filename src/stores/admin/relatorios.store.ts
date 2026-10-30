// src/stores/admin/relatorios.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  relatoriosOperacoesService,
  type Operacao,
  type Viatura,
  type SeriePonto,
  type PostoBar,
  type DistEstado,
  type KpisOperacoes,
  type FiltrosOperacoes,
} from '@/services/admin/relatorios-operacoes.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Operacao, Viatura, EstadoOperacao } from '@/services/admin/relatorios-operacoes.service'

export interface Preset {
  label: string
  dias: number | 'mes-atual' | 'mes-passado'
}

export interface SegmentoDonut {
  label: string
  valor: number
  cor: string
  percent: number
  offset: number
}

// ============================================================
// Helpers
// ============================================================
function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}

function formatarData(s: string): string {
  const [a, m, d] = s.split('-')
  return a && m && d ? `${d}/${m}/${a}` : s
}

// Cores dos segmentos do donut
const CORES: Record<string, string> = {
  Concluída: '#16a34a',
  'Em curso': '#d97706',
  Planeada: '#2563eb',
  Cancelada: '#dc2626',
}
const LABELS: Record<string, string> = {
  Concluída: 'Concluídas',
  'Em curso': 'Em curso',
  Planeada: 'Planeadas',
  Cancelada: 'Canceladas',
}

// ============================================================
// Store
// ============================================================
export const useAdminRelatoriosStore = defineStore('adminRelatorios', () => {
  // ----------------------------------------------------------
  // Estado — filtros
  // ----------------------------------------------------------
  const dataDe = ref('')
  const dataAte = ref('')
  const filtroPosto = ref('')

  const presets: Preset[] = [
    { label: 'Hoje', dias: 0 },
    { label: 'Últimos 7 dias', dias: 6 },
    { label: 'Últimos 30 dias', dias: 29 },
    { label: 'Este mês', dias: 'mes-atual' },
    { label: 'Mês passado', dias: 'mes-passado' },
  ]

  // ----------------------------------------------------------
  // Estado — backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)
  const geradoEm = ref('—')

  const kpisData = ref<KpisOperacoes>({
    operacoes: 0,
    concluidas: 0,
    canceladas: 0,
    taxa: 0,
  })

  const serieDias = ref<SeriePonto[]>([])
  const porPosto = ref<PostoBar[]>([])
  const distEstado = ref<DistEstado[]>([])
  const operacoes = ref<Operacao[]>([])
  const viaturas = ref<Viatura[]>([])
  const postos = ref<string[]>([])

  // ----------------------------------------------------------
  // Construir filtros limpos
  // ----------------------------------------------------------
  function construirFiltros(): FiltrosOperacoes {
    const f: FiltrosOperacoes = {}
    if (dataDe.value) f.de = dataDe.value
    if (dataAte.value) f.ate = dataAte.value
    if (filtroPosto.value) f.posto = filtroPosto.value
    return f
  }

  // ----------------------------------------------------------
  // Carregar
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 400))

      const d = await relatoriosOperacoesService.obter(construirFiltros())

      kpisData.value = d.kpis
      serieDias.value = d.serieDias
      porPosto.value = d.porPosto
      distEstado.value = d.distEstado
      operacoes.value = d.operacoes
      viaturas.value = d.viaturas
      postos.value = d.postos

      geradoEm.value = new Date().toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

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
  // Getters — período
  // ----------------------------------------------------------
  const periodoInvalido = computed(
    () => !!dataDe.value && !!dataAte.value && dataDe.value > dataAte.value,
  )

  const presetActivo = computed(() => {
    for (const p of presets) {
      const { de, ate } = calcularPreset(p.dias)
      if (dataDe.value === de && dataAte.value === ate) return p.label
    }
    return ''
  })

  const periodoTexto = computed(() => {
    if (!dataDe.value && !dataAte.value) return 'Todo o período'
    const de = dataDe.value ? formatarData(dataDe.value) : '…'
    const ate = dataAte.value ? formatarData(dataAte.value) : '…'
    return `${de} a ${ate}`
  })

  // ----------------------------------------------------------
  // Getters — KPIs
  // ----------------------------------------------------------
  const kpis = computed(() => [
    {
      icon: 'assignment',
      label: 'Operações',
      valor: String(kpisData.value.operacoes),
    },
    {
      icon: 'task_alt',
      label: 'Concluídas',
      valor: String(kpisData.value.concluidas),
      sub: kpisData.value.operacoes
        ? `${kpisData.value.taxa}% do total`
        : '—',
      barra: kpisData.value.taxa,
    },
    {
      icon: 'cancel',
      label: 'Canceladas',
      valor: String(kpisData.value.canceladas),
    },
  ])

  // ----------------------------------------------------------
  // Getters — série diária (gráfico linha)
  // ----------------------------------------------------------
  const valores = computed(() => serieDias.value.map((d) => d.valor))
  const labelsX = computed(() => serieDias.value.map((d) => d.label))
  const maxY = computed(() => Math.max(1, ...valores.value))

  const pontos = computed(() => {
    const n = valores.value.length
    if (n <= 1)
      return valores.value.map((v, i) => ({
        x: 30 + i * 360,
        y: 180 - (v / maxY.value) * 160,
      }))
    return valores.value.map((v, i) => ({
      x: 30 + i * (360 / (n - 1)),
      y: 180 - (v / maxY.value) * 160,
    }))
  })

  const linePath = computed(() => {
    const pts = pontos.value
    if (!pts.length) return ''
    return pts
      .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
      .join(' ')
  })

  const areaPath = computed(() => {
    const pts = pontos.value
    if (!pts.length) return ''
    const first = pts[0]!
    const last = pts[pts.length - 1]!
    const line = pts
      .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
      .join(' ')
    return `${line} L${last.x},180 L${first.x},180 Z`
  })

  // ----------------------------------------------------------
  // Getters — donut estado
  // ----------------------------------------------------------
  const distribuicaoEstado = computed<SegmentoDonut[]>(() => {
    const total = distEstado.value.reduce((s, d) => s + d.valor, 0)
    let acc = 0
    return distEstado.value.map((d) => {
      const offset = 25 - acc
      acc += d.percent
      return {
        label: LABELS[d.estado] ?? d.estado,
        valor: d.valor,
        cor: CORES[d.estado] ?? '#64748b',
        percent: d.percent,
        offset,
      }
    })
  })

  const totalOperacoes = computed(() => kpisData.value.operacoes)

  // ----------------------------------------------------------
  // Getters — barras por posto
  // ----------------------------------------------------------
  const operacoesPorPosto = computed(() => porPosto.value)

  // ----------------------------------------------------------
  // Getters — viaturas (sem GPS/odómetro/anomalia)
  // ----------------------------------------------------------
  const viaturasVista = computed(() =>
    viaturas.value.map((v) => ({
      ...v,
      operacoes: `${v.operacoesConcluidas}/${v.operacoesTotal}`,
    })),
  )

  // ----------------------------------------------------------
  // Getters — destaque do gráfico
  // ----------------------------------------------------------
  const destaques = computed(() => {
    const v = valores.value
    if (!v.length || Math.max(...v) === 0) return null

    const total = v.reduce((s, n) => s + n, 0)
    const pico = Math.max(...v)
    const idx = v.indexOf(pico)

    return {
      pico,
      diaPico: labelsX.value[idx] ?? '',
      total,
      media: (total / v.length).toLocaleString('pt-PT', {
        maximumFractionDigits: 1,
      }),
    }
  })

  // ----------------------------------------------------------
  // Acções — período
  // ----------------------------------------------------------
  function calcularPreset(
    dias: number | 'mes-atual' | 'mes-passado',
  ): { de: string; ate: string } {
    const hoje = new Date()

    if (dias === 'mes-atual') {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      return { de: iso(inicio), ate: iso(hoje) }
    }
    if (dias === 'mes-passado') {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
      const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
      return { de: iso(inicio), ate: iso(fim) }
    }

    const fim = new Date(hoje)
    const ini = new Date(hoje)
    ini.setDate(fim.getDate() - dias)
    return { de: iso(ini), ate: iso(fim) }
  }

  async function usarPreset(p: Preset) {
    const { de, ate } = calcularPreset(p.dias)
    dataDe.value = de
    dataAte.value = ate
    await carregar()
  }

  function limparPeriodo() {
    dataDe.value = ''
    dataAte.value = ''
  }

  async function limparFiltros() {
    limparPeriodo()
    filtroPosto.value = ''
    await carregar()
  }

  // ----------------------------------------------------------
  // Export
  // ----------------------------------------------------------
  async function exportarXlsx(): Promise<Blob | null> {
    try {
      return await relatoriosOperacoesService.exportarXlsx(construirFiltros())
    } catch (e) {
      erro.value = extrairErro(e)
      return null
    }
  }

  async function exportarPdf(): Promise<Blob | null> {
    try {
      return await relatoriosOperacoesService.exportarPdf(construirFiltros())
    } catch (e) {
      erro.value = extrairErro(e)
      return null
    }
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // filtros
    presets,
    dataDe,
    dataAte,
    filtroPosto,

    // estado
    aCarregar,
    carregado,
    erro,
    geradoEm,

    // dados
    kpis,
    serieDias,
    porPosto,
    distEstado,
    operacoes,
    viaturas,
    postos,

    // getters período
    periodoInvalido,
    presetActivo,
    periodoTexto,

    // getters gráficos
    valores,
    labelsX,
    maxY,
    pontos,
    linePath,
    areaPath,

    // getters diversos
    distribuicaoEstado,
    totalOperacoes,
    operacoesPorPosto,
    viaturasVista,
    destaques,

    // acções
    carregar,
    usarPreset,
    limparPeriodo,
    limparFiltros,
    exportarXlsx,
    exportarPdf,
  }
})