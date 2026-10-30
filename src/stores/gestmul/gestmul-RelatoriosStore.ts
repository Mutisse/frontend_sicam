// src/stores/gestmul/gestmul-RelatoriosStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import {
  relatoriosService,
  type KpisRelatorio,
  type ValorMensal,
  type TopInfracao,
  type TopMetodo,
  type DesempenhoProvincia,
  type TotaisProvincias,
} from '@/services/gestmul/relatorios.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type PeriodoRapido = '7d' | '30d' | '90d' | 'ano' | 'personalizado'
export type {
  KpisRelatorio,
  ValorMensal,
  TopInfracao,
  TopMetodo,
  DesempenhoProvincia,
  TotaisProvincias,
}

// ============================================================
// Store
// ============================================================
export const useGestmulRelatoriosStore = defineStore('gestmulRelatorios', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const PROVINCIAS = [
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

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const periodoRapido = ref<PeriodoRapido>('30d')
  const dataDe = ref('')
  const dataAte = ref('')
  const filtroProvincia = ref('Todas')

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

  function limparFiltros() {
    periodoRapido.value = '30d'
    filtroProvincia.value = 'Todas'
    definirPeriodoRapido('30d')
  }

  // Inicializa já com 30d
  definirPeriodoRapido('30d')

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const kpisData = reactive<KpisRelatorio>({
    emitidas: 0,
    pagas: 0,
    pendentes: 0,
    contestadas: 0,
    cobrado: 0,
    pendenteValor: 0,
    ticketMedio: 0,
    taxaCobranca: 0,
  })

  const cobrancaMensal = ref<ValorMensal[]>([])
  const topInfracoes = ref<TopInfracao[]>([])
  const topMetodos = ref<TopMetodo[]>([])
  const desempenhoProvincia = ref<DesempenhoProvincia[]>([])
  const totaisData = reactive<TotaisProvincias>({
    emitidas: 0,
    pagas: 0,
    cobrado: 0,
  })

  const kpis = computed<KpisRelatorio>(() => ({ ...kpisData }))
  const totaisProvincias = computed<TotaisProvincias>(() => ({ ...totaisData }))

  // ----------------------------------------------------------
  // Carregar
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 500))

      const dados = await relatoriosService.obter({
        de: dataDe.value,
        ate: dataAte.value,
        provincia: filtroProvincia.value,
      })

      Object.assign(kpisData, dados.kpis)
      cobrancaMensal.value = dados.cobrancaMensal
      topInfracoes.value = dados.topInfracoes
      topMetodos.value = dados.topMetodos
      desempenhoProvincia.value = dados.desempenhoProvincia
      Object.assign(totaisData, dados.totaisProvincias)

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
  // Anel — taxa de cobrança
  // ----------------------------------------------------------
  const RAIO = 42
  const circunferencia = 2 * Math.PI * RAIO

  const offsetRing = computed(
    () => circunferencia * (1 - kpisData.taxaCobranca / 100),
  )

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function formatar(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  }

  function formatarMoeda(n: number): string {
    return formatar(n) + ' MT'
  }

  // ----------------------------------------------------------
  // Devolver tudo
  // ----------------------------------------------------------
  return {
    PROVINCIAS,

    periodoRapido,
    dataDe,
    dataAte,
    filtroProvincia,
    definirPeriodoRapido,
    limparFiltros,

    aCarregar,
    carregado,
    erro,
    carregar,

    kpis,
    cobrancaMensal,
    topInfracoes,
    topMetodos,
    desempenhoProvincia,
    totaisProvincias,

    circunferencia,
    offsetRing,

    formatar,
    formatarMoeda,
  }
})