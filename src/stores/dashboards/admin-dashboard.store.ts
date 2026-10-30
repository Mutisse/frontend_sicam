// src/stores/dashboards/admin-dashboard.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  dashboardService,
  type DashboardKpi,
  type VeiculoIntervencao,
  type AgentePatrulha,
} from '@/services/dashboard.service'
import { extrairErro } from '@/boot/axios'

export interface AccaoRapida {
  icon: string
  label: string
  rota: string
}

export const useAdminDashboardStore = defineStore('adminDashboard', () => {
  const auth = useAuthStore()

  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const carregando = ref(false)
  const erro = ref<string | null>(null)

  const semSincronizar = ref(0)
  const agentesOffline = ref(0)
  const totalVeiculos = ref(0)
  const kpis = ref<DashboardKpi[]>([])
  const requerIntervencao = ref<VeiculoIntervencao[]>([])
  const agentes = ref<AgentePatrulha[]>([])
  const taxa = ref(0)

  // Acções rápidas (navegação — não vêm do backend)
  const acoes = ref<AccaoRapida[]>([
    { icon: 'people',        label: 'Utilizadores',  rota: '/admin/utilizadores' },
    { icon: 'local_police',  label: 'Postos',        rota: '/admin/postos' },
    { icon: 'devices',       label: 'Dispositivos',  rota: '/admin/dispositivos' },
    { icon: 'monitor_heart', label: 'Monitorização', rota: '/admin/monitorizacao' },
  ])

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const somaEstados = computed(() =>
    kpis.value.reduce((s, k) => s + k.valor, 0),
  )

  const CIRCUNFERENCIA = 2 * Math.PI * 52
  const circunferencia = computed(() => CIRCUNFERENCIA)

  const taxaTexto = computed(() =>
    taxa.value.toLocaleString('pt-PT', { minimumFractionDigits: 1 }),
  )

  const saudacao = computed(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 19) return 'Boa tarde'
    return 'Boa noite'
  })

  const nomeCurto = computed(
    () => auth.utilizador?.nome?.split(' ')[0] ?? 'Administrador',
  )

  const dataHoje = computed(() => {
    const d = new Date().toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    return d.charAt(0).toUpperCase() + d.slice(1)
  })

  const descricaoDistribuicao = computed(() =>
    kpis.value.map((k) => `${k.label} ${percentagem(k.valor)}%`).join(', '),
  )

  function percentagem(valor: number): number {
    return somaEstados.value
      ? Math.round((valor / somaEstados.value) * 100)
      : 0
  }

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  async function carregar() {
    if (carregando.value) return
    carregando.value = true
    erro.value = null

    try {
      const d = await dashboardService.admin()

      semSincronizar.value    = d.alertas.sem_sincronizar
      agentesOffline.value    = d.alertas.agentes_offline
      totalVeiculos.value     = d.total_veiculos
      kpis.value              = d.kpis
      requerIntervencao.value = d.requer_intervencao
      agentes.value           = d.agentes
      taxa.value              = d.taxa
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      carregando.value = false
    }
  }

  return {
    // estado
    carregando,
    erro,
    semSincronizar,
    agentesOffline,
    totalVeiculos,
    kpis,
    requerIntervencao,
    acoes,
    agentes,
    taxa,

    // getters
    somaEstados,
    circunferencia,
    taxaTexto,
    saudacao,
    nomeCurto,
    dataHoje,
    descricaoDistribuicao,

    // helpers
    percentagem,

    // acções
    carregar,
  }
})