import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Multa {
  id: string
  infracao: string
  viatura: string
  estado: 'Paga' | 'Pendente' | 'Contestada'
  valor: string
}

export const useGestmulSecaoStore = defineStore('gestmulSecao', () => {
  const titulo = 'As minhas multas'
  const icon = 'receipt_long'

  const multas = ref<Multa[]>([
    { id: 'MU-001', infracao: 'Excesso de velocidade', viatura: 'AA-00-AA', estado: 'Pendente',   valor: '2 500 MT' },
    { id: 'MU-002', infracao: 'Seguro expirado',       viatura: 'BB-11-BB', estado: 'Paga',       valor: '1 200 MT' },
    { id: 'MU-003', infracao: 'Inspecção atrasada',    viatura: 'CC-22-CC', estado: 'Contestada', valor: '1 800 MT' },
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

  return { titulo, icon, multas, aCarregar, carregar }
})