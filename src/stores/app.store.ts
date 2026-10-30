// src/stores/app.store.ts
import { defineStore } from 'pinia'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  notificacoesService,
  type Notificacao,
} from '@/services/notificacoes.service'

export const useAppStore = defineStore('app', () => {
  // ─── Online/offline — automático ────────────────────────
  const online = ref(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  function sincronizarOnline() {
    online.value =
      typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  onMounted(() => {
    window.addEventListener('online', sincronizarOnline)
    window.addEventListener('offline', sincronizarOnline)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', sincronizarOnline)
    window.removeEventListener('offline', sincronizarOnline)
  })

  // ─── Notificações — VEM DO BACKEND ─────────────────────
  const notificacoes = ref(0) // só a contagem de não lidas
  const listaNotificacoes = ref<Notificacao[]>([])
  const aCarregarNotif = ref(false)

  async function carregarNotificacoes() {
    if (aCarregarNotif.value) return
    aCarregarNotif.value = true

    try {
      const { total, nao_lidas } = await notificacoesService.contagem()
      notificacoes.value = nao_lidas

      // opcional: carregar a lista completa
      listaNotificacoes.value = await notificacoesService.listar()
      // (se só quiseres o badge, remove esta linha)
      void total
    } catch {
      /* silencioso */
    } finally {
      aCarregarNotif.value = false
    }
  }

  async function marcarNotificacoesLidas() {
    try {
      await notificacoesService.marcarTodasLidas()
      notificacoes.value = 0
      listaNotificacoes.value = listaNotificacoes.value.map((n) => ({
        ...n,
        lida: true,
        lida_em: new Date().toISOString(),
      }))
    } catch {
      /* silencioso */
    }
  }

  async function marcarLida(id: number) {
    try {
      await notificacoesService.marcarLida(id)
      notificacoes.value = Math.max(0, notificacoes.value - 1)
      listaNotificacoes.value = listaNotificacoes.value.map((n) =>
        n.id === id ? { ...n, lida: true } : n,
      )
    } catch {
      /* silencioso */
    }
  }

  // ─── Versão / build ─────────────────────────────────────
  const versao = ref('1.4.2')
  const build = ref('2026.09.23')

  return {
    // online
    online,
    sincronizarOnline,

    // notificações
    notificacoes,
    listaNotificacoes,
    aCarregarNotif,
    carregarNotificacoes,
    marcarNotificacoesLidas,
    marcarLida,

    // versão
    versao,
    build,
  }
})