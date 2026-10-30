// src/stores/admin/integracoes.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  integracoesService,
  type Integracao,
  type DesempenhoItem,
  type EstadoIntegracao,
} from '@/services/admin/integracoes.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Integracao, DesempenhoItem, EstadoIntegracao }

// ============================================================
// Store
// ============================================================
export const useAdminIntegracoesStore = defineStore('adminIntegracoes', () => {
  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const carregando = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const integracoes = ref<Integracao[]>([])
  const desempenho = ref<DesempenhoItem[]>([])
  const ultimaActualizacao = ref('—')

  const meta = ref(300)
  const escala = ref(500)

  // ----------------------------------------------------------
  // Carregar
  // ----------------------------------------------------------
  async function carregar() {
    if (carregando.value) return
    carregando.value = true
    erro.value = null

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 400))

      const dados = await integracoesService.listar()
      integracoes.value = dados.integracoes
      desempenho.value = dados.desempenho
      meta.value = dados.meta
      escala.value = dados.escala
      ultimaActualizacao.value = dados.ultimaActualizacao

      await atrasoMinimo
      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      carregado.value = true
    } finally {
      carregando.value = false
    }
  }

  // ----------------------------------------------------------
  // Constantes (compatibilidade com a página)
  // ----------------------------------------------------------
  const META_MS = computed(() => meta.value)
  const ESCALA_MS = computed(() => escala.value)

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const contagem = computed(() => ({
    regular: integracoes.value.filter((i) => i.estado === 'regular').length,
    atencao: integracoes.value.filter((i) => i.estado === 'atencao').length,
    critico: integracoes.value.filter((i) => i.estado === 'critico').length,
  }))

  const estadoGeral = computed<EstadoIntegracao>(() => {
    if (contagem.value.critico > 0) return 'critico'
    if (contagem.value.atencao > 0) return 'atencao'
    return 'regular'
  })

  const iconeGeral = computed(() => {
    if (estadoGeral.value === 'critico') return 'error'
    if (estadoGeral.value === 'atencao') return 'warning'
    return 'check_circle'
  })

  const tituloGeral = computed(() => {
    if (estadoGeral.value === 'critico') return 'Há integrações com falha'
    if (estadoGeral.value === 'atencao') return 'Há integrações degradadas'
    return 'Todas as integrações operacionais'
  })

  const textoGeral = computed(() => {
    const total = integracoes.value.length
    const ok = contagem.value.regular
    if (estadoGeral.value === 'regular') {
      return `Os ${total} conectores estão a responder dentro do esperado.`
    }
    return `${ok} de ${total} conectores estão operacionais. Verifique os que precisam de atenção.`
  })

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function labelEstado(e: EstadoIntegracao): string {
    if (e === 'regular') return 'Operacional'
    if (e === 'atencao') return 'Degradado'
    return 'Crítico'
  }

  function larguraBarra(ms: number): number {
    return Math.min(100, Math.max(2, (ms / escala.value) * 100))
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // constantes
    META_MS,
    ESCALA_MS,

    // estado
    carregando,
    carregado,
    erro,
    ultimaActualizacao,

    // dados
    integracoes,
    desempenho,

    // getters
    contagem,
    estadoGeral,
    iconeGeral,
    tituloGeral,
    textoGeral,

    // helpers
    labelEstado,
    larguraBarra,

    // acções
    carregar,
  }
})