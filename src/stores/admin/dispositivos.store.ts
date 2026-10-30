// src/stores/admin/dispositivos.store.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  dispositivosService,
  type Dispositivo,
  type DispositivosKpis,
  type EstadoDispositivo,
  type CriarDispositivoPayload,
} from '@/services/admin/dispositivos.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Dispositivo, EstadoDispositivo }

export const VERSAO_ATUAL = '2.5.0'

export const AGENTES_DISPONIVEIS = [
  'Agente Chissano',
  'Agente Nhaca',
  'Agente Sitoe',
  'Agente Cumbe',
  'Agente Tembe',
  'Agente Bila',
  'Chefe Mabunda',
  'Chefe Zandamela',
]

// ============================================================
// Store
// ============================================================
export const useAdminDispositivosStore = defineStore(
  'adminDispositivos',
  () => {
    // ----------------------------------------------------------
    // Estado backend
    // ----------------------------------------------------------
    const aCarregar = ref(false)
    const carregado = ref(false)
    const erro = ref<string | null>(null)

    const dispositivos = ref<Dispositivo[]>([])
    const versaoBackend = ref(VERSAO_ATUAL)

    const kpisData = reactive<DispositivosKpis>({
      total: 0,
      activos: 0,
      porRegistar: 0,
      desatualizados: 0,
    })

    const kpis = computed<DispositivosKpis>(() => ({ ...kpisData }))

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

        const dados = await dispositivosService.listar()
        dispositivos.value = dados.items
        Object.assign(kpisData, dados.kpis)
        versaoBackend.value = dados.versao

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
    // Filtros
    // ----------------------------------------------------------
    const pesquisa = ref('')
    const filtroEstado = ref<'' | 'Ativo' | 'Por registar' | 'Desatualizados'>('')
    const pagina = ref(1)
    const porPagina = ref(10)

    watch([pesquisa, filtroEstado], () => {
      pagina.value = 1
    })

    // ----------------------------------------------------------
    // Getters KPIs (computed, mantemos o mesmo padrão)
    // ----------------------------------------------------------
    const totalActivos = computed(() => kpisData.activos)
    const totalPorRegistar = computed(() => kpisData.porRegistar)
    const totalDesatualizados = computed(() => kpisData.desatualizados)

    // ----------------------------------------------------------
    // Getters filtrados
    // ----------------------------------------------------------
    const filtrados = computed(() => {
      return dispositivos.value.filter((d) => {
        if (filtroEstado.value === 'Ativo' && d.estado !== 'Ativo') return false
        if (
          filtroEstado.value === 'Por registar' &&
          d.estado !== 'Por registar'
        )
          return false
        if (
          filtroEstado.value === 'Desatualizados' &&
          d.versaoApp === versaoBackend.value
        )
          return false

        if (pesquisa.value) {
          const q = pesquisa.value.toLowerCase()
          if (
            !d.serie.toLowerCase().includes(q) &&
            !d.agente.toLowerCase().includes(q) &&
            !d.modelo.toLowerCase().includes(q)
          )
            return false
        }
        return true
      })
    })

    const totalPaginas = computed(() =>
      Math.max(1, Math.ceil(filtrados.value.length / porPagina.value)),
    )
    const inicioPagina = computed(() => (pagina.value - 1) * porPagina.value)
    const fimPagina = computed(() =>
      Math.min(inicioPagina.value + porPagina.value, filtrados.value.length),
    )
    const paginados = computed(() =>
      filtrados.value.slice(inicioPagina.value, fimPagina.value),
    )

    // ----------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------
    function versaoAtualizada(v: string): boolean {
      return v === versaoBackend.value
    }

    function haQuantoTempo(ts: number | null): string {
      if (!ts) return 'Nunca'
      const diff = Date.now() - ts
      const min = Math.floor(diff / 60000)
      if (min < 60) return `há ${min} min`
      const h = Math.floor(min / 60)
      if (h < 24) return `há ${h} h`
      const d = Math.floor(h / 24)
      return `há ${d} d`
    }

    // ----------------------------------------------------------
    // Acções
    // ----------------------------------------------------------
    async function registar(dados: {
      serie: string
      agente: string
      modelo: string
      notas?: string | undefined
    }): Promise<Dispositivo | null> {
      try {
        const payload: CriarDispositivoPayload = {
          serie: dados.serie.trim().toUpperCase(),
          modelo: dados.modelo.trim(),
        }
        if (dados.agente) payload.agente = dados.agente
        if (dados.notas) payload.notas = dados.notas

        const r = await dispositivosService.criar(payload)
        await carregar()
        return r.dispositivo
      } catch (e) {
        erro.value = extrairErro(e)
        return null
      }
    }

    async function marcarComoAtualizado(id: string): Promise<boolean> {
      try {
        await dispositivosService.marcarAtualizado(id)
        await carregar()
        return true
      } catch (e) {
        erro.value = extrairErro(e)
        return false
      }
    }

    async function desassociar(id: string): Promise<boolean> {
      try {
        await dispositivosService.desassociar(id)
        await carregar()
        return true
      } catch (e) {
        erro.value = extrairErro(e)
        return false
      }
    }

    async function remover(id: string): Promise<boolean> {
      try {
        await dispositivosService.remover(id)
        await carregar()
        return true
      } catch (e) {
        erro.value = extrairErro(e)
        return false
      }
    }

    function limparFiltros() {
      pesquisa.value = ''
      filtroEstado.value = ''
      pagina.value = 1
    }

    // ----------------------------------------------------------
    // Export
    // ----------------------------------------------------------
    async function exportarXlsx(): Promise<Blob | null> {
      try {
        return await dispositivosService.exportarXlsx()
      } catch (e) {
        erro.value = extrairErro(e)
        return null
      }
    }

    // ----------------------------------------------------------
    // Devolver
    // ----------------------------------------------------------
    return {
      VERSAO_ATUAL,
      AGENTES_DISPONIVEIS,

      // estado
      dispositivos,
      aCarregar,
      carregado,
      erro,
      kpis,
      versaoBackend,

      // filtros
      pesquisa,
      filtroEstado,
      pagina,
      porPagina,

      // KPIs
      totalActivos,
      totalPorRegistar,
      totalDesatualizados,

      // listas
      filtrados,
      totalPaginas,
      inicioPagina,
      fimPagina,
      paginados,

      // helpers
      versaoAtualizada,
      haQuantoTempo,

      // acções
      carregar,
      registar,
      marcarComoAtualizado,
      desassociar,
      remover,
      limparFiltros,
      exportarXlsx,
    }
  },
)