// src/stores/dashboards/dashboard.store.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { dashboardService, type DashboardKpi } from '@/services/dashboard.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Filtros comuns
// ============================================================
export interface FiltrosDashboard {
  de: string
  ate: string
  provincia: string
  posto: string
}

export const PROVINCIAS = [
  'Todas',
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Cabo Delgado',
  'Niassa',
]

export const POSTOS = [
  'Todos',
  'Posto Baixa',
  'Posto KaMpfumo',
  'Posto Matola',
  'Posto Machava',
  'Posto Namaacha (EN4)',
]

// ============================================================
// Store
// ============================================================
export const useDashboardStore = defineStore('dashboard', () => {
  const filtros = reactive<FiltrosDashboard>({
    de: '',
    ate: '',
    provincia: 'Todas',
    posto: 'Todos',
  })

  const aCarregar = ref(false)
  const erro = ref<string | null>(null)
  const kpis = ref<DashboardKpi[]>([])
  const total = ref(0)

  const temFiltros = computed(
    () =>
      !!filtros.de ||
      !!filtros.ate ||
      filtros.provincia !== 'Todas' ||
      filtros.posto !== 'Todos',
  )

  function limpar() {
    filtros.de = ''
    filtros.ate = ''
    filtros.provincia = 'Todas'
    filtros.posto = 'Todos'
  }

  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null

    try {
      const d = await dashboardService.comum()
      kpis.value = d.kpis
      total.value = d.total
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      aCarregar.value = false
    }
  }

  return {
    PROVINCIAS,
    POSTOS,
    filtros,
    aCarregar,
    erro,
    kpis,
    total,
    temFiltros,
    limpar,
    carregar,
  }
})