// src/stores/dashboards/secoes/inatro.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  dashboardService,
  type InatroKpi,
  type InatroChartPonto,
  type InatroCard,
  type InatroTabelaLinha,
} from '@/services/dashboard.service'
import { extrairErro } from '@/boot/axios'

export interface DonutItem {
  label: string
  valor: number
  cor: string
}

export const useInatroDashboardStore = defineStore('inatroDashboard', () => {
  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const kpis = ref<InatroKpi[]>([])
  const linha = ref<InatroChartPonto[]>([])
  const barras = ref<InatroChartPonto[]>([])
  const donut = ref<DonutItem[]>([])
  const cards = ref<InatroCard[]>([])
  const tabela = ref<{
    titulo: string
    colunas: string[]
    linhas: InatroTabelaLinha[]
  }>({
    titulo: 'Por província',
    colunas: ['Província', 'Veículos', 'Inspecções OK', 'Expiradas', 'Taxa'],
    linhas: [],
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
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))

      const d = await dashboardService.inatro()
      kpis.value   = d.kpis
      linha.value  = d.linha
      barras.value = d.barras
      donut.value  = d.donut
      cards.value  = d.cards
      tabela.value = d.tabela

      await atrasoMinimo

      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      aCarregar.value = false
    }
  }

  return {
    aCarregar,
    carregado,
    erro,
    kpis,
    linha,
    barras,
    donut,
    cards,
    tabela,
    carregar,
  }
})