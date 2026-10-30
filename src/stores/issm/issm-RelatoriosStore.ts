// src/stores/issm/issm-RelatoriosStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import {
  relatoriosService,
  type KpisRelatorio,
  type ValorMensal,
  type ApolicesSeguradora,
  type DesempenhoSeguradora,
  type TopTipoSeguro,
} from '@/services/issm/relatorios.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type PeriodoRapido = '7d' | '30d' | '90d' | 'ano'
export type {
  KpisRelatorio,
  ValorMensal,
  ApolicesSeguradora,
  DesempenhoSeguradora,
  TopTipoSeguro,
}

// ============================================================
// Store
// ============================================================
export const useIssmRelatoriosStore = defineStore('issmRelatorios', () => {
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
    const ate = new Date(hoje)
    const de = new Date(hoje)

    if (p === '7d') de.setDate(hoje.getDate() - 7)
    else if (p === '30d') de.setDate(hoje.getDate() - 30)
    else if (p === '90d') de.setDate(hoje.getDate() - 90)
    else if (p === 'ano') de.setFullYear(hoje.getFullYear() - 1)

    dataDe.value = formatarInputData(de)
    dataAte.value = formatarInputData(ate)
  }

  // Inicializa com 30d
  definirPeriodoRapido('30d')

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const kpisData = reactive<KpisRelatorio>({
    apolicesActivas: 0,
    sinistrosAbertos: 0,
    taxaCobertura: 0,
    aExpirar: 0,
    premioMedio: 0,
    taxaSinistralidade: 0,
  })

  const apolicesPorMes = ref<ValorMensal[]>([])
  const apolicesPorSeguradora = ref<ApolicesSeguradora[]>([])
  const desempenhoPorSeguradora = ref<DesempenhoSeguradora[]>([])
  const topTipos = ref<TopTipoSeguro[]>([])

  // ----------------------------------------------------------
  // KPIs (computed para o template)
  // ----------------------------------------------------------
  const kpis = computed<KpisRelatorio>(() => ({ ...kpisData }))

  // ----------------------------------------------------------
  // Carregar (com atraso mínimo para o skeleton aparecer)
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      // ⏱️ atraso mínimo de 600ms para o skeleton aparecer
      const atrasoMinimo = new Promise((r) => setTimeout(r, 600))

      const dados = await relatoriosService.obter({
        de: dataDe.value,
        ate: dataAte.value,
      })

      Object.assign(kpisData, dados.kpis)
      apolicesPorMes.value = dados.apolicesPorMes
      apolicesPorSeguradora.value = dados.apolicesPorSeguradora
      desempenhoPorSeguradora.value = dados.desempenhoPorSeguradora
      topTipos.value = dados.topTipos

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
  // Anel — Taxa de sinistralidade
  // ----------------------------------------------------------
  const RAIO = 42
  const circunferencia = 2 * Math.PI * RAIO

  const offsetRing = computed(() => {
    const p = kpisData.taxaSinistralidade
    return circunferencia * (1 - p / 100)
  })

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function formatar(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  }

  // ----------------------------------------------------------
  // Devolver tudo
  // ----------------------------------------------------------
  return {
    // filtros
    periodoRapido,
    dataDe,
    dataAte,
    definirPeriodoRapido,

    // estado
    aCarregar,
    carregado,
    erro,
    carregar,

    // dados
    kpis,
    apolicesPorMes,
    apolicesPorSeguradora,
    desempenhoPorSeguradora,
    topTipos,

    // anel
    circunferencia,
    offsetRing,

    // helpers
    formatar,
    formatarInputData,
  }
})