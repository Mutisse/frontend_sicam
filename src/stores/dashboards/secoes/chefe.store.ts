// src/stores/dashboards/secoes/chefe.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  dashboardService,
  type ChefeKpi,
  type ChefeChartPonto,
  type ChefeCard,
  type ChefeTabelaLinha,
} from '@/services/dashboard.service'
import { extrairErro } from '@/boot/axios'

export const useChefeDashboardStore = defineStore('chefeDashboard', () => {
  const aCarregar = ref(false)
  const erro = ref<string | null>(null)

  const kpis = ref<ChefeKpi[]>([])
  const linha = ref<ChefeChartPonto[]>([])
  const barras = ref<ChefeChartPonto[]>([])
  const donut = ref<{ label: string; valor: number; cor: string }[]>([])
  const cards = ref<ChefeCard[]>([])
  const tabela = ref<{
    titulo: string
    colunas: string[]
    linhas: ChefeTabelaLinha[]
  }>({
    titulo: 'Por agente',
    colunas: ['Agente', 'Patrulhas', 'Concluídas', 'Em curso', 'Regularidade'],
    linhas: [],
  })

  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null

    try {
      const d = await dashboardService.chefe()
      kpis.value   = d.kpis
      linha.value  = d.linha
      barras.value = d.barras
      donut.value  = d.donut
      cards.value  = d.cards
      tabela.value = d.tabela
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      aCarregar.value = false
    }
  }

  return {
    aCarregar,
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