import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Ocorrencia {
  id: string
  tipo: string
  viatura: string
  estado: 'Activa' | 'Encerrada' | 'Pendente'
  data: string
}

export const usePrmSecaoStore = defineStore('prmSecao', () => {
  const titulo = 'As minhas ocorrências'
  const icon = 'local_police'

  const ocorrencias = ref<Ocorrencia[]>([
    { id: 'OC-001', tipo: 'Abordagem policial', viatura: 'AA-00-AA', estado: 'Activa',    data: '22/09' },
    { id: 'OC-002', tipo: 'Alerta de hotlist',  viatura: 'BB-11-BB', estado: 'Pendente',  data: '20/09' },
    { id: 'OC-003', tipo: 'Fiscalização',       viatura: 'CC-22-CC', estado: 'Encerrada', data: '15/09' },
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

  return { titulo, icon, ocorrencias, aCarregar, carregar }
})