// src/stores/inatro/inatro-RelatoriosStore.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  relatoriosService,
  type DashboardRelatorio,
  type RelatorioKpis,
  type RegistroMes,
  type RegistroProvincia,
  type TopMarca,
  type TopInfracao,
  type InspecaoPosto,
  type FiltrosRelatorio,
} from '@/services/inatro/relatorios.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type PresetRelatorio = '7d' | '30d' | '90d' | 'ano'

// ============================================================
// Store
// ============================================================
export const useInatroRelatoriosStore = defineStore('inatroRelatorios', () => {
  // ----------------------------------------------------------
  // Estado — carregamento
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  // ----------------------------------------------------------
  // Dados (backend)
  // ----------------------------------------------------------
  const kpis = ref<RelatorioKpis>({
    total: 0,
    validas: 0,
    expiradas: 0,
    pendentes: 0,
    aExpirar: 0,
    taxa: 0,
    tempoMedio: 0,
  })

  const registosPorMes = ref<RegistroMes[]>([])
  const registosPorProvincia = ref<RegistroProvincia[]>([])
  const topMarcas = ref<TopMarca[]>([])
  const topInfracoes = ref<TopInfracao[]>([])
  const inspecoesPorPosto = ref<InspecaoPosto[]>([])

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const dataDe = ref('')
  const dataAte = ref('')
  const filtroProvincia = ref('')
  const filtroPosto = ref('')
  const periodoRapido = ref<PresetRelatorio | ''>('')

  // ----------------------------------------------------------
  // Constantes (para os selects)
  // ----------------------------------------------------------
  const PROVINCIAS = [
    'Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane',
    'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula',
    'Cabo Delgado', 'Niassa',
  ]

  const POSTOS = [
    'Posto Baixa', 'Posto Matola', 'Posto Machava',
    'Posto KaMpfumo', 'Posto Namaacha',
  ]

  // ----------------------------------------------------------
  // Carregar do backend
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))

      const filtros: FiltrosRelatorio = {}
      if (dataDe.value) filtros.data_de = dataDe.value
      if (dataAte.value) filtros.data_ate = dataAte.value
      if (filtroProvincia.value) filtros.provincia = filtroProvincia.value
      if (filtroPosto.value) filtros.posto = filtroPosto.value

      const d: DashboardRelatorio = await relatoriosService.dashboard(filtros)

      kpis.value = d.kpis
      registosPorMes.value = d.registosPorMes
      registosPorProvincia.value = d.registosPorProvincia
      topMarcas.value = d.topMarcas
      topInfracoes.value = d.topInfracoes
      inspecoesPorPosto.value = d.inspecoesPorPosto

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
  // Períodos rápidos
  // ----------------------------------------------------------
  function definirPeriodoRapido(preset: PresetRelatorio) {
    const hoje = new Date()
    const de = new Date()

    if (preset === '7d')  de.setDate(hoje.getDate() - 7)
    if (preset === '30d') de.setDate(hoje.getDate() - 30)
    if (preset === '90d') de.setDate(hoje.getDate() - 90)
    if (preset === 'ano') { de.setMonth(0); de.setDate(1) }

    dataDe.value = de.toISOString().slice(0, 10)
    dataAte.value = hoje.toISOString().slice(0, 10)
    periodoRapido.value = preset
  }

  function limparFiltros() {
    dataDe.value = ''
    dataAte.value = ''
    filtroProvincia.value = ''
    filtroPosto.value = ''
    periodoRapido.value = ''
    carregar()
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function formatar(n: number | undefined | null): string {
    return new Intl.NumberFormat('pt-PT').format(Number(n ?? 0))
  }

  // Registos por província com % (para as barras)
  const registosPorProvinciaComPercentagem = computed(() => {
    if (registosPorProvincia.value.length === 0) return []
    const max = Math.max(...registosPorProvincia.value.map((r) => r.valor), 1)
    return registosPorProvincia.value.map((r) => ({
      ...r,
      percentagem: Math.round((r.valor / max) * 100),
    }))
  })

  // Anel
  const RAIO = 42
  const circunferencia = 2 * Math.PI * RAIO

  const offsetRing = computed(
    () => circunferencia * (1 - (kpis.value.taxa || 0) / 100),
  )

  // Totais por posto
  const totaisPostos = computed(() => ({
    realizadas: inspecoesPorPosto.value.reduce((s, p) => s + p.realizadas, 0),
    aprovadas:  inspecoesPorPosto.value.reduce((s, p) => s + p.aprovadas, 0),
    reprovadas: inspecoesPorPosto.value.reduce((s, p) => s + p.reprovadas, 0),
  }))

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado
    aCarregar,
    carregado,
    erro,
    carregar,

    // dados
    kpis,
    registosPorMes,
    registosPorProvincia,
    registosPorProvinciaComPercentagem,
    topMarcas,
    topInfracoes,
    inspecoesPorPosto,
    totaisPostos,

    // filtros
    dataDe,
    dataAte,
    filtroProvincia,
    filtroPosto,
    periodoRapido,
    definirPeriodoRapido,
    limparFiltros,

    // constantes
    PROVINCIAS,
    POSTOS,

    // helpers
    formatar,

    // anel
    circunferencia,
    offsetRing,
  }
})