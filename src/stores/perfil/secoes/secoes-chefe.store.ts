import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Patrulha {
  id: string
  turno: string
  posto: string
  estado: 'Em curso' | 'Concluída' | 'Planeada'
  hora: string
}

export const useChefeSecaoStore = defineStore('chefeSecao', () => {
  const titulo = 'As minhas patrulhas'
  const icon = 'directions_car'

  const patrulhas = ref<Patrulha[]>([
    { id: 'PT-001', turno: 'Matinal',  posto: 'Posto Baixa', estado: 'Em curso',  hora: '06:00' },
    { id: 'PT-002', turno: 'Tarde',    posto: 'Posto Baixa', estado: 'Concluída', hora: '14:00' },
    { id: 'PT-003', turno: 'Nocturna', posto: 'Posto Baixa', estado: 'Planeada',  hora: '22:00' },
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

  return { titulo, icon, patrulhas, aCarregar, carregar }
})