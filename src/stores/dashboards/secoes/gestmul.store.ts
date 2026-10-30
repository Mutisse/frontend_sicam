// src/stores/dashboards/secoes/gestmul.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  dashboardService,
  type GestmulKpi,
  type GestmulChartPonto,
  type GestmulCard,
  type GestmulTabelaLinha,
} from '@/services/dashboard.service'
import { extrairErro } from '@/boot/axios'

export const useGestmulDashboardStore = defineStore('gestmulDashboard', () => {
  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const kpis = ref<GestmulKpi[]>([])
  const linha = ref<GestmulChartPonto[]>([])
  const barras = ref<GestmulChartPonto[]>([])
  const donut = ref<{ label: string; valor: number; cor: string }[]>([])
  const cards = ref<GestmulCard[]>([])
  const tabela = ref<{
    titulo: string
    colunas: string[]
    linhas: GestmulTabelaLinha[]
  }>({
    titulo: 'Por província',
    colunas: ['Província', 'Emitidas', 'Pagas', 'Cobrado (MT)', 'Taxa'],
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

      const d = await dashboardService.gestmul()
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