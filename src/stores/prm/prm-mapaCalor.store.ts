// src/stores/prm/prm-mapaCalor.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePrmAbordagensStore, type Abordagem } from './prm-AbordagensStore'

// ============================================================
// Tipos
// ============================================================
export type Resultado = 'Sem incidentes' | 'Com detenção' | 'Em curso'
export type Camada = 'todas' | 'detencao' | 'hotlist' | 'auto'

// Re-export para conveniência
export type { Abordagem }

// ============================================================
// Store
// ============================================================
export const useMapaCalorStore = defineStore('mapaCalor', () => {
  // ----------------------------------------------------------
  // Ligação à store de abordagens (fonte da verdade)
  // ----------------------------------------------------------
  const prm = usePrmAbordagensStore()

  // ----------------------------------------------------------
  // Estado do mapa
  // ----------------------------------------------------------
  const camadaAtiva = ref<Camada>('todas')

  // Pedido de foco (vindo de outra página)
  const focarId = ref<string | null>(null)

  // ----------------------------------------------------------
  // Camadas
  // ----------------------------------------------------------
  const camadas: { key: Camada; label: string; icon: string; cor: string }[] = [
    { key: 'todas',    label: 'Todas',      icon: 'layers',       cor: '#3b82f6' },
    { key: 'detencao', label: 'Detenções',  icon: 'gavel',        cor: '#dc2626' },
    { key: 'hotlist',  label: 'Hotlist',    icon: 'local_police', cor: '#f59e0b' },
    { key: 'auto',     label: 'Em curso',   icon: 'hourglass_top',cor: '#10b981' },
  ]

  // ----------------------------------------------------------
  // Dados partilhados (vêm da store principal)
  // ----------------------------------------------------------
  const abordagens = computed<Abordagem[]>(() => prm.abordagens)
  const filtrados = computed<Abordagem[]>(() => prm.filtrados)

  // ----------------------------------------------------------
  // Getters (pontos do mapa + estatísticas)
  // ----------------------------------------------------------
  const pontosMapa = computed(() => {
    const base = filtrados.value
    if (camadaAtiva.value === 'detencao') return base.filter((a) => a.resultado === 'Com detenção')
    if (camadaAtiva.value === 'hotlist')  return base.filter((a) => a.emHotlist)
    if (camadaAtiva.value === 'auto')     return base.filter((a) => a.resultado === 'Em curso')
    return base
  })

  const totalComDetencao = computed(() =>
    filtrados.value.filter((a) => a.resultado === 'Com detenção').length,
  )

  const zonaMaisAtiva = computed(() => {
    const c: Record<string, number> = {}
    for (const a of filtrados.value) c[a.posto] = (c[a.posto] ?? 0) + 1
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]
    return top ? top[0] : '—'
  })

  const horaPico = computed(() => {
    const c: Record<number, number> = {}
    for (const a of filtrados.value) {
      const h = Number(a.dataHora.split(' ')[1]?.split(':')[0] ?? 0)
      c[h] = (c[h] ?? 0) + 1
    }
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]
    return top ? `${String(top[0]).padStart(2, '0')}:00` : '—'
  })

  // ----------------------------------------------------------
  // Acções — camada
  // ----------------------------------------------------------
  function setCamada(c: Camada) {
    camadaAtiva.value = c
  }

  // ----------------------------------------------------------
  // Acções — pedido de foco (entre páginas)
  // ----------------------------------------------------------
  function pedirFoco(id: string) {
    focarId.value = id
  }

  function consumirFoco(): string | null {
    const id = focarId.value
    focarId.value = null
    return id
  }

  function limparFoco() {
    focarId.value = null
  }

  // ----------------------------------------------------------
  // Acções — compatibilidade
  // ----------------------------------------------------------
  function setFiltrados(_lista: Abordagem[]) {
    // no-op
  }

  function adicionarAbordagem(a: Abordagem) {
    prm.abordagens.unshift(a)
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    camadaAtiva,
    camadas,

    abordagens,
    filtrados,

    pontosMapa,
    totalComDetencao,
    zonaMaisAtiva,
    horaPico,

    focarId,
    pedirFoco,
    consumirFoco,
    limparFoco,

    setCamada,
    setFiltrados,
    adicionarAbordagem,
  }
})