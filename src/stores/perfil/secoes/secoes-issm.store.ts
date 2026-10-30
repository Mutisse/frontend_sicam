// src/stores/perfil/secoes/issm.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dashboardService } from '@/services/dashboard.service'
import { extrairErro } from '@/boot/axios'

export interface Apolice {
  id: string
  seguradora: string
  viatura: string
  estado: string
  validade: string
}

export const useIssmSecaoStore = defineStore('issmSecao', () => {
  const titulo = ref('Apólices ISSM')
  const apolices = ref<Apolice[]>([])
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))
      const d = await dashboardService.issm()

      apolices.value = (d.apolices ?? []).map((a: any) => ({
        id: String(a.id ?? ''),
        seguradora: String(a.seguradora ?? ''),
        viatura: String(a.viatura ?? ''),
        estado: String(a.estado ?? ''),
        validade: String(a.validade ?? ''),
      }))

      await atrasoMinimo
      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      aCarregar.value = false
    }
  }

  return {
    titulo,
    apolices,
    aCarregar,
    carregado,
    erro,
    carregar,
  }
})