// src/stores/chefe/chefe-RelatoriosStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import {
  relatoriosChefeService,
  type RelatorioKpis,
  type ValorDiario,
  type ConsultaAgente,
  type DesempenhoAgente,
  type ResumoPatrulha,
} from '@/services/chefe/relatorios.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type PeriodoRapido = '7d' | '30d' | '90d' | 'ano'

export type {
  RelatorioKpis as KpisRelatorio,
  ValorDiario,
  ConsultaAgente,
  DesempenhoAgente,
  ResumoPatrulha,
}

// ============================================================
// Store
// ============================================================
export const useChefeRelatoriosStore = defineStore('chefeRelatorios', () => {
  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const periodoRapido = ref<PeriodoRapido>('30d')
  const dataDe = ref('')
  const dataAte = ref('')

  function formatarInputData(d: Date): string {
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    return `${d.getFullYear()}-${mes}-${dia}`
  }

  function definirPeriodoRapido(p: PeriodoRapido) {
    periodoRapido.value = p

    const hoje = new Date()
    const ate  = new Date(hoje)
    const de   = new Date(hoje)

    if (p === '7d') de.setDate(hoje.getDate() - 7)
    else if (p === '30d') de.setDate(hoje.getDate() - 30)
    else if (p === '90d') de.setDate(hoje.getDate() - 90)
    else if (p === 'ano') de.setFullYear(hoje.getFullYear() - 1)

    dataDe.value  = formatarInputData(de)
    dataAte.value = formatarInputData(ate)
  }

  function limparFiltros() {
    periodoRapido.value = '30d'
    definirPeriodoRapido('30d')
  }

  definirPeriodoRapido('30d')

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const kpis = reactive<RelatorioKpis>({
    consultas: 0,
    autos: 0,
    abordagens: 0,
    conformidade: 0,
    conformes: 0,
    naoConformes: 0,
  })

  const consultasPorDia = ref<ValorDiario[]>([])
  const consultasPorAgente = ref<ConsultaAgente[]>([])
  const desempenhoPorAgente = ref<DesempenhoAgente[]>([])
  const resumoPatrulhas = ref<ResumoPatrulha[]>([])

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

      const filtros: { data_de?: string; data_ate?: string } = {}
      if (dataDe.value) filtros.data_de = dataDe.value
      if (dataAte.value) filtros.data_ate = dataAte.value

      const dados = await relatoriosChefeService.obter(filtros)

      Object.assign(kpis, dados.kpis)
      consultasPorDia.value = dados.consultasPorDia
      consultasPorAgente.value = dados.consultasPorAgente
      desempenhoPorAgente.value = dados.desempenhoPorAgente
      resumoPatrulhas.value = dados.resumoPatrulhas

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
  // Anel
  // ----------------------------------------------------------
  const RAIO = 42
  const circunferencia = 2 * Math.PI * RAIO

  const offsetRing = computed(() => {
    const p = kpis.conformidade
    return circunferencia * (1 - p / 100)
  })

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function formatar(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  }

  function iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/)
    const p = partes[0]?.[0] ?? ''
    const u = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
    return (p + u).toUpperCase()
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    periodoRapido,
    dataDe,
    dataAte,
    definirPeriodoRapido,
    limparFiltros,

    aCarregar,
    carregado,
    erro,
    carregar,

    kpis,
    consultasPorDia,
    consultasPorAgente,
    desempenhoPorAgente,
    resumoPatrulhas,

    circunferencia,
    offsetRing,

    formatar,
    iniciais,
  }
})