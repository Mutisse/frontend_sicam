import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Inspeccao {
  id: string
  tipo: string
  viatura: string
  resultado: 'Aprovada' | 'Reprovada' | 'Pendente'
  proxima: string
}

export const useInatroSecaoStore = defineStore('inatroSecao', () => {
  const titulo = 'As minhas inspecções'
  const icon = 'fact_check'

  const inspeccoes = ref<Inspeccao[]>([
    { id: 'IN-001', tipo: 'Inspecção periódica',      viatura: 'AA-00-AA', resultado: 'Aprovada',  proxima: '03/2026' },
    { id: 'IN-002', tipo: 'Inspecção extraordinária', viatura: 'BB-11-BB', resultado: 'Reprovada', proxima: '—' },
    { id: 'IN-003', tipo: 'Inspecção periódica',      viatura: 'CC-22-CC', resultado: 'Pendente',  proxima: '—' },
  ])

  const aCarregar = ref(false)

  async function carregar() {
    aCarregar.value = true
    try {
      await new Promise((r) => setTimeout(r, 150))
    } finally {
      aCarregar.value = false
    }
  }

  return { titulo, icon, inspeccoes, aCarregar, carregar }
})