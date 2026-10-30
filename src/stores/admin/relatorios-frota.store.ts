// src/stores/admin/relatorios-frota.store.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import {
  relatoriosFrotaService,
  type Viatura,
  type Operacao,
  type KpisFrota,
  type EstadoOperacao,
  type OpcoesFrota,
  type FiltrosFrota,
} from '@/services/admin/relatorios-frota.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Viatura, Operacao, KpisFrota, EstadoOperacao }

// ============================================================
// Store
// ============================================================
export const useAdminRelatoriosFrotaStore = defineStore(
  'adminRelatoriosFrota',
  () => {
    // ----------------------------------------------------------
    // Filtros
    // ----------------------------------------------------------
    const dataDe = ref('')
    const dataAte = ref('')
    const filtroViatura = ref('')
    const filtroEstado = ref<'' | EstadoOperacao>('')
    const apenasAnomalias = ref(false)

    // ----------------------------------------------------------
    // Estado backend
    // ----------------------------------------------------------
    const aCarregar = ref(false)
    const carregado = ref(false)
    const erro = ref<string | null>(null)

    const kpisData = reactive<KpisFrota>({
      operacoes: 0,
      concluidas: 0,
      taxaConclusao: '0%',
      noPrazo: '0%',
      distancia: '0',
      duracao: '0',
    })

    const viaturas = ref<Viatura[]>([])
    const operacoes = ref<Operacao[]>([])
    const opcoes = reactive<OpcoesFrota>({
      viaturas: [],
      estados: ['Planeada', 'Em curso', 'Concluída', 'Cancelada'],
    })

    const kpis = computed<KpisFrota>(() => ({ ...kpisData }))

    // ----------------------------------------------------------
    // Construir filtros limpos (sem undefined explícito)
    // ----------------------------------------------------------
    function construirFiltros(): FiltrosFrota {
      const f: FiltrosFrota = {}
      if (dataDe.value) f.de = dataDe.value
      if (dataAte.value) f.ate = dataAte.value
      if (filtroViatura.value) f.viatura = filtroViatura.value
      if (filtroEstado.value) f.estado = String(filtroEstado.value)
      return f
    }

    // ----------------------------------------------------------
    // Carregar
    // ----------------------------------------------------------
    async function carregar() {
      if (aCarregar.value) return
      aCarregar.value = true
      erro.value = null

      try {
        const atrasoMinimo = new Promise((r) => setTimeout(r, 400))

        const dados = await relatoriosFrotaService.obter(construirFiltros())

        Object.assign(kpisData, dados.kpis)
        viaturas.value = dados.viaturas
        operacoes.value = dados.operacoes
        opcoes.viaturas = dados.opcoes.viaturas
        opcoes.estados = dados.opcoes.estados

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
    // Opções
    // ----------------------------------------------------------
    const opcoesViaturas = computed(() => opcoes.viaturas)
    const estadosDisponiveis = computed(() => opcoes.estados)

    // ----------------------------------------------------------
    // Getters — listas filtradas (filtro local para UX imediata)
    // ----------------------------------------------------------
    const viaturasFiltradas = computed(() => {
      return viaturas.value.filter((v) => {
        if (filtroViatura.value && v.viatura !== filtroViatura.value)
          return false
        if (apenasAnomalias.value && !v.anomalia) return false
        return true
      })
    })

    const operacoesFiltradas = computed(() => {
      return operacoes.value.filter((op) => {
        if (filtroViatura.value && op.viatura !== filtroViatura.value)
          return false
        if (filtroEstado.value && op.estado !== filtroEstado.value) return false
        return true
      })
    })

    // ----------------------------------------------------------
    // Estatísticas
    // ----------------------------------------------------------
    const totalAnomalias = computed(
      () => viaturas.value.filter((v) => v.anomalia).length,
    )

    const totalOperacoesPendentes = computed(
      () =>
        operacoes.value.filter(
          (o) => o.estado === 'Planeada' || o.estado === 'Em curso',
        ).length,
    )

    // ----------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------
    function badgeEstado(
      estado: EstadoOperacao,
    ): 'regular' | 'atencao' | 'critico' | 'neutral' {
      switch (estado) {
        case 'Concluída':
          return 'regular'
        case 'Em curso':
          return 'atencao'
        case 'Cancelada':
          return 'critico'
        default:
          return 'neutral'
      }
    }

    // ----------------------------------------------------------
    // Acções
    // ----------------------------------------------------------
    function setFiltroViatura(v: string) {
      filtroViatura.value = v
    }

    function setFiltroEstado(v: '' | EstadoOperacao) {
      filtroEstado.value = v
    }

    function toggleAnomalias() {
      apenasAnomalias.value = !apenasAnomalias.value
    }

    function limparFiltros() {
      filtroViatura.value = ''
      filtroEstado.value = ''
      apenasAnomalias.value = false
    }

    // ----------------------------------------------------------
    // Export
    // ----------------------------------------------------------
    async function exportarXlsx(): Promise<Blob | null> {
      try {
        return await relatoriosFrotaService.exportarXlsx(construirFiltros())
      } catch (e) {
        erro.value = extrairErro(e)
        return null
      }
    }

    async function exportarPdf(): Promise<Blob | null> {
      try {
        return await relatoriosFrotaService.exportarPdf(construirFiltros())
      } catch (e) {
        erro.value = extrairErro(e)
        return null
      }
    }

    // ----------------------------------------------------------
    // Devolver
    // ----------------------------------------------------------
    return {
      // estado
      dataDe,
      dataAte,
      aCarregar,
      carregado,
      erro,

      // dados
      kpis,
      viaturas,
      operacoes,

      // filtros
      filtroViatura,
      filtroEstado,
      apenasAnomalias,

      // opções
      opcoesViaturas,
      estadosDisponiveis,

      // getters
      viaturasFiltradas,
      operacoesFiltradas,
      totalAnomalias,
      totalOperacoesPendentes,

      // helpers
      badgeEstado,

      // acções
      carregar,
      setFiltroViatura,
      setFiltroEstado,
      toggleAnomalias,
      limparFiltros,

      // export
      exportarXlsx,
      exportarPdf,
    }
  },
)