// src/stores/portal/carta.store.ts
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Cidadao, RespostaConsulta } from '@/services/portal/cidadao.service'
import { usePortalInicioStore } from './inicio.store'

// ============================================================
// Constantes (mesmas do inicio.store)
// ============================================================
const STORAGE_CIDADAO = 'sicam.cidadao'
const STORAGE_NUMERO = 'sicam.numero-carta'

// ============================================================
// Store
// ============================================================
export const usePortalCartaStore = defineStore('portalCarta', () => {
  // ----------------------------------------------------------
  // Referência ao store "dono" dos dados
  // ----------------------------------------------------------
  const inicio = usePortalInicioStore()

  // ----------------------------------------------------------
  // Estado local (espelho do inicio.store)
  // ----------------------------------------------------------
  const cidadao = ref<Cidadao | null>(null)
  const numeroCarta = ref<string>('')
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const temCarta = computed(() => carregado.value && cidadao.value !== null)

  const condutor = computed(() => cidadao.value)

  const iniciais = computed(() => {
    const nome = cidadao.value?.nome?.trim() ?? ''
    if (!nome) return '?'
    const partes = nome.split(/\s+/)
    const a = partes[0]?.[0] ?? ''
    const b = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : ''
    return (a + b).toUpperCase()
  })

  const validadeClass = computed(() => {
    const d = cidadao.value?.diasParaExpirar
    if (d === null || d === undefined) return 'sem-dados'
    if (d < 0) return 'critico'
    if (d <= 30) return 'atencao'
    return 'regular'
  })

  const validadeTexto = computed(() => {
    const d = cidadao.value?.diasParaExpirar
    if (d === null || d === undefined) return 'Sem informação de validade'
    if (d < 0) return `Expirou há ${Math.abs(d)} dia${Math.abs(d) === 1 ? '' : 's'}`
    if (d === 0) return 'Expira hoje'
    if (d <= 30) return `Expira em ${d} dia${d === 1 ? '' : 's'}`
    if (d <= 365) return `Válida por mais ${d} dias`
    const anos = Math.floor(d / 365)
    const resto = d % 365
    if (resto === 0) return `Válida por mais ${anos} ano${anos === 1 ? '' : 's'}`
    return `Válida por mais ${anos} ano${anos === 1 ? '' : 's'} e ${resto} dias`
  })

  const estadoClasse = computed(() => {
    const e = cidadao.value?.estado
    if (e === 'Válida') return 'regular'
    if (e === 'Expirada') return 'critico'
    if (e === 'Suspensa') return 'atencao'
    if (e === 'Cancelada') return 'critico'
    return 'sem-dados'
  })

  const estadoLabel = computed(() => cidadao.value?.estado ?? 'Sem dados')

  // ----------------------------------------------------------
  // Hidratar com dados do inicio.store
  // ----------------------------------------------------------
  function hidratar(dados: RespostaConsulta) {
    cidadao.value = dados.cidadao
    numeroCarta.value = dados.cidadao.numero
    carregado.value = true
    erro.value = null
  }

  function limpar() {
    cidadao.value = null
    numeroCarta.value = ''
    carregado.value = false
    erro.value = null
  }

  // ----------------------------------------------------------
  // ⭐ Sincronização automática com o inicio.store
  // Sempre que o inicio.store publica uma nova consulta,
  // este store recebe e actualiza
  // ----------------------------------------------------------
  watch(
    () => inicio.ultimaConsulta,
    (dados) => {
      if (dados) {
        hidratar(dados)
      } else {
        limpar()
      }
    },
    { immediate: true },
  )

  // ----------------------------------------------------------
  // Fallback: se a página for recarregada, restaura do sessionStorage
  // ----------------------------------------------------------
  function carregarDaSessao(): boolean {
    // Primeiro tenta pelo inicio.store
    if (inicio.ultimaConsulta) {
      hidratar(inicio.ultimaConsulta)
      return true
    }

    // Se ainda não está no inicio.store, tenta restaurar do sessionStorage
    const ok = inicio.restaurar()
    if (ok && inicio.ultimaConsulta) {
      hidratar(inicio.ultimaConsulta)
      return true
    }

    erro.value = 'Sem consulta activa.'
    carregado.value = true
    return false
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado
    cidadao,
    numeroCarta,
    carregado,
    erro,

    // getters
    temCarta,
    condutor,
    iniciais,
    validadeClass,
    validadeTexto,
    estadoClasse,
    estadoLabel,

    // ações
    carregarDaSessao,
    hidratar,
    limpar,
  }
})