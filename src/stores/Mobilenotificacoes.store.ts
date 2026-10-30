// src/stores/notificacoes.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  notificacoesService,
  type Notificacao,
} from '@/services/notificacoes.service'
import { extrairErro } from '@/boot/axios'

export const useNotificacoesStore = defineStore('notificacoes', () => {
  // ── Estado ─────────────────────────────────────────
  const notificacoes = ref<Notificacao[]>([])
  const naoLidas = ref<number>(0)
  const aCarregar = ref(false)
  const erro = ref<string | null>(null)
  const painelAberto = ref(false)

  // ── Getters ────────────────────────────────────────
  const temNaoLidas = computed(() => naoLidas.value > 0)

  // ── Acções ─────────────────────────────────────────

  /** Carrega contagem (usado pelo badge no header) */
  async function carregarContagem() {
    try {
      const c = await notificacoesService.contagem()
      naoLidas.value = c.nao_lidas
    } catch (e) {
      // silencioso — o badge simplesmente fica 0
      naoLidas.value = 0
    }
  }

  /** Carrega a lista completa (usado ao abrir o painel) */
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null

    try {
      notificacoes.value = await notificacoesService.listar()
      naoLidas.value = notificacoes.value.filter((n) => !n.lida).length
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      aCarregar.value = false
    }
  }

  /** Abre o painel e carrega */
  async function abrir() {
    painelAberto.value = true
    await carregar()
  }

  function fechar() {
    painelAberto.value = false
  }

  /** Marca uma notificação como lida */
  async function marcarLida(id: number) {
    const n = notificacoes.value.find((x) => x.id === id)
    if (!n || n.lida) return

    // otimista
    n.lida = true
    n.lida_em = new Date().toISOString()
    naoLidas.value = Math.max(0, naoLidas.value - 1)

    try {
      await notificacoesService.marcarLida(id)
    } catch (e) {
      // rollback
      n.lida = false
      n.lida_em = null
      naoLidas.value += 1
      erro.value = extrairErro(e)
    }
  }

  /** Marca todas como lidas */
  async function marcarTodasLidas() {
    if (naoLidas.value === 0) return

    const anteriores = notificacoes.value.map((n) => ({ id: n.id, lida: n.lida, lida_em: n.lida_em }))
    const antes = naoLidas.value

    // otimista
    notificacoes.value.forEach((n) => {
      n.lida = true
      n.lida_em = new Date().toISOString()
    })
    naoLidas.value = 0

    try {
      await notificacoesService.marcarTodasLidas()
    } catch (e) {
      // rollback
      anteriores.forEach((a) => {
        const n = notificacoes.value.find((x) => x.id === a.id)
        if (n) {
          n.lida = a.lida
          n.lida_em = a.lida_em
        }
      })
      naoLidas.value = antes
      erro.value = extrairErro(e)
    }
  }

  /** Apaga uma notificação */
  async function apagar(id: number) {
    const idx = notificacoes.value.findIndex((n) => n.id === id)
    if (idx === -1) return

    const removida = notificacoes.value[idx]!
    const eraNaoLida = !removida.lida

    // otimista
    notificacoes.value.splice(idx, 1)
    if (eraNaoLida) naoLidas.value = Math.max(0, naoLidas.value - 1)

    try {
      await notificacoesService.apagar(id)
    } catch (e) {
      // rollback
      notificacoes.value.splice(idx, 0, removida)
      if (eraNaoLida) naoLidas.value += 1
      erro.value = extrairErro(e)
    }
  }

  return {
    // estado
    notificacoes,
    naoLidas,
    aCarregar,
    erro,
    painelAberto,

    // getters
    temNaoLidas,

    // acções
    carregarContagem,
    carregar,
    abrir,
    fechar,
    marcarLida,
    marcarTodasLidas,
    apagar,
  }
})