// src/stores/dashboards/secoes/prm.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  dashboardService,
  type PrmKpi,
  type PrmChartPonto,
  type PrmCard,
  type PrmTabelaLinha,
} from '@/services/dashboard.service'
import { extrairErro } from '@/boot/axios'

export const usePrmDashboardStore = defineStore('prmDashboard', () => {
  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const kpis = ref<PrmKpi[]>([])
  const linha = ref<PrmChartPonto[]>([])
  const barras = ref<PrmChartPonto[]>([])
  const donut = ref<{ label: string; valor: number; cor: string }[]>([])
  const cards = ref<PrmCard[]>([])
  const tabela = ref<{
    titulo: string
    colunas: string[]
    linhas: PrmTabelaLinha[]
  }>({
    titulo: 'Hotlist por motivo',
    colunas: ['Motivo', 'Activos', 'Resolvidos', 'Total'],
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

      const d = await dashboardService.prm()
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