// src/stores/prm/prm-relatorios.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  relatoriosService,
  type KpiVisivel,
  type DesempenhoPosto,
  type MatriculaAbordada,
  type Nivel,
} from '@/services/prm/relatorios.service'
import { extrairErro } from '@/boot/axios'

export type {
  KpiVisivel,
  DesempenhoPosto,
  MatriculaAbordada,
  Nivel,
} from '@/services/prm/relatorios.service'

export interface Ponto {
  x: number
  y: number
}

export const useRelatoriosStore = defineStore('prmRelatorios', () => {
  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const dataDe = ref('')
  const dataAte = ref('')

  const kpis = ref({
    hotlistActiva: 0,
    abordagens30d: 0,
    detencoes: 0,
    resolvidos: 0,
    emAberto: 0,
    taxaResolucao: 0,
    tempoMedio: 0,
  })

  const kpisVisiveis = ref<KpiVisivel[]>([])
  const valores = ref<number[]>([])
  const labelsX = ref<string[]>([])
  const hotlistPorMotivo = ref<
    { nome: string; valor: number; cor: string; percentagem: number }[]
  >([])
  const desempenhoPorPosto = ref<DesempenhoPosto[]>([])
  const topMatriculas = ref<MatriculaAbordada[]>([])

  const anel = ref({ taxa: 0, resolvidos: 0, emAberto: 0 })

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))

      const d = await relatoriosService.prm(
        dataDe.value || undefined,
        dataAte.value || undefined,
      )

      kpis.value               = d.kpis
      kpisVisiveis.value       = d.kpisVisiveis
      valores.value            = d.linha.valores
      labelsX.value            = d.linha.labels
      anel.value               = d.anel
      hotlistPorMotivo.value   = d.hotlistPorMotivo
      desempenhoPorPosto.value = d.desempenhoPorPosto
      topMatriculas.value      = d.topMatriculas

      await atrasoMinimo

      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      carregado.value = true
    } finally {
      aCarregar.value = false
    }
  }

  async function aplicarFiltro() {
    await carregar()
    return true
  }

  // ----------------------------------------------------------
  // Gráfico de linha — cálculo (a partir dos valores do backend)
  // ----------------------------------------------------------
  const maxY = computed(() => {
    const max = Math.max(...valores.value, 1)
    return Math.ceil(max / 50) * 50 || 50
  })

  const labelsY = computed(() => [0, maxY.value / 2, maxY.value])
  const gridY = [20, 110, 200]

  const pontos = computed<Ponto[]>(() => {
    const n = valores.value.length
    if (!n) return []
    return valores.value.map((v, i) => ({
      x: 40 + i * (370 / Math.max(n - 1, 1)),
      y: 200 - (v / maxY.value) * 180,
    }))
  })

  const linePath = computed(() => {
    const pts = pontos.value
    if (!pts.length) return ''
    return pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')
  })

  const areaPath = computed(() => {
    const pts = pontos.value
    if (!pts.length) return ''
    const first = pts[0]!
    const last = pts[pts.length - 1]!
    const line = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')
    return `${line} L${last.x},200 L${first.x},200 Z`
  })

  // ----------------------------------------------------------
  // Anel
  // ----------------------------------------------------------
  const RAIO = 42
  const circunferencia = 2 * Math.PI * RAIO

  const offsetRing = computed(() => {
    const p = anel.value.taxa
    return circunferencia * (1 - p / 100)
  })

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function labelNivel(n: Nivel): string {
    if (n === 'alto') return 'Alto'
    if (n === 'medio') return 'Médio'
    return 'Baixo'
  }

  // ----------------------------------------------------------
  // Exportar CSV
  // ----------------------------------------------------------
  function gerarCSV(): string {
    const linhas: string[][] = [
      ['SICAM — PRM — Relatório Operacional'],
      [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
      [],
      ['RESUMO'],
      ['Hotlist activa', String(kpis.value.hotlistActiva)],
      ['Abordagens', String(kpis.value.abordagens30d)],
      ['Detenções', String(kpis.value.detencoes)],
      ['Casos resolvidos', String(kpis.value.resolvidos)],
      ['Taxa de resolução', `${kpis.value.taxaResolucao}%`],
      [],
      ['DESEMPENHO POR POSTO'],
      ['Posto', 'Província', 'Abordagens', 'Detenções', 'Autos', 'Taxa'],
      ...desempenhoPorPosto.value.map((p) => [
        p.posto,
        p.provincia,
        String(p.abordagens),
        String(p.detencoes),
        String(p.autos),
        `${p.taxa}%`,
      ]),
      [],
      ['TOP 10 MATRÍCULAS ABORDADAS'],
      ['#', 'Matrícula', 'Motivo', 'Abordagens', 'Nível'],
      ...topMatriculas.value.map((m, i) => [
        String(i + 1),
        m.matricula,
        m.motivo,
        String(m.abordagens),
        labelNivel(m.nivel),
      ]),
    ]

    return linhas
      .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\n')
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    aCarregar,
    carregado,
    erro,

    dataDe,
    dataAte,
    carregar,
    aplicarFiltro,

    kpis,
    kpisVisiveis,
    valores,
    labelsX,
    labelsY,
    gridY,
    pontos,
    linePath,
    areaPath,

    // ⭐ Anel
    anel,

    RAIO,
    circunferencia,
    offsetRing,

    hotlistPorMotivo,
    desempenhoPorPosto,
    topMatriculas,
    labelNivel,

    gerarCSV,
  }
})