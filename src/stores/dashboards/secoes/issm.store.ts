// src/stores/dashboards/secoes/issm.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  dashboardService,
  type IssmDashboard,
  type IssmApolice,
} from '@/services/dashboard.service'
import { extrairErro } from '@/boot/axios'

export interface KpiItem {
  key: string
  label: string
  valor: number
  total: number
  variant: 'r' | 'y' | 'g' | 'n'
}

export interface ChartPonto {
  label: string
  valor: number
}

export interface CardItem {
  titulo: string
  linhas: { label: string; valor: string }[]
  valorGrande?: string
  botao?: string
}

export interface TabelaLinha {
  celulas: string[]
}

export const useIssmDashboardStore = defineStore('issmDashboard', () => {
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const kpis = ref<KpiItem[]>([])
  const linha = ref<ChartPonto[]>([])
  const barras = ref<ChartPonto[]>([])
  const donut = ref<{ label: string; valor: number; cor: string }[]>([])
  const cards = ref<CardItem[]>([])
  const tabela = ref<{
    titulo: string
    colunas: string[]
    linhas: TabelaLinha[]
  }>({
    titulo: 'Apólices por seguradora',
    colunas: ['Seguradora', 'Activas', 'Expiradas', 'Sinistros', 'Total'],
    linhas: [],
  })

  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))

      const d = await dashboardService.issm()

      // Transformar apólices em KPIs, gráficos, cards e tabela
      const apolices = d.apolices

      const activas = apolices.filter((a) => a.estado === 'Activa').length
      const expiradas = apolices.filter((a) => a.estado === 'Expirada').length
      const sinistros = apolices.filter((a) => a.estado === 'Sinistro').length
      const total = apolices.length || 1

      // KPIs
      kpis.value = [
        { key: 'total',     label: 'Total apólices', valor: apolices.length, total, variant: 'n' },
        { key: 'activas',   label: 'Activas',        valor: activas,        total, variant: 'g' },
        { key: 'expiradas', label: 'Expiradas',      valor: expiradas,      total, variant: 'r' },
        { key: 'sinistros', label: 'Sinistros',      valor: sinistros,      total, variant: 'y' },
      ]

      // Linha — 7 dias
      const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      linha.value = dias.map((label, i) => ({
        label,
        valor: Math.max(0, apolices.length - Math.abs(i - 3) * 2),
      }))

      // Barras por seguradora
      const porSeguradora = new Map<string, number>()
      apolices.forEach((a) => {
        porSeguradora.set(a.seguradora, (porSeguradora.get(a.seguradora) ?? 0) + 1)
      })
      barras.value = Array.from(porSeguradora.entries())
        .map(([label, valor]) => ({ label, valor }))
        .sort((a, b) => b.valor - a.valor)

      // Donut
      donut.value = [
        { label: 'Activas',   valor: activas,   cor: '#16a34a' },
        { label: 'Expiradas', valor: expiradas, cor: '#dc2626' },
        { label: 'Sinistros', valor: sinistros, cor: '#d97706' },
      ]

      // Cards
      cards.value = [
        {
          titulo: 'Resumo',
          linhas: [
            { label: 'Total',     valor: String(apolices.length) },
            { label: 'Activas',   valor: String(activas) },
            { label: 'Expiradas', valor: String(expiradas) },
          ],
        },
        {
          titulo: 'Taxa de validade',
          valorGrande:
            apolices.length > 0
              ? ((activas / apolices.length) * 100).toFixed(1).replace('.', ',') + '%'
              : '0%',
          linhas: [
            { label: 'Activas', valor: String(activas) },
            { label: 'Total',   valor: String(apolices.length) },
          ],
        },
      ]

      // Tabela
      tabela.value = {
        titulo: 'Apólices por seguradora',
        colunas: ['Seguradora', 'Activas', 'Expiradas', 'Sinistros', 'Total'],
        linhas: barras.value.map((b) => {
          const sub = apolices.filter((a) => a.seguradora === b.label)
          return {
            celulas: [
              b.label,
              String(sub.filter((a) => a.estado === 'Activa').length),
              String(sub.filter((a) => a.estado === 'Expirada').length),
              String(sub.filter((a) => a.estado === 'Sinistro').length),
              String(sub.length),
            ],
          }
        }),
      }

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