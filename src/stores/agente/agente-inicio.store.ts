// src/stores/agente/agente-inicio.store.ts
import { defineStore } from 'pinia'
import { computed, onUnmounted, ref } from 'vue'
import {
  agenteInicioService,
  type Kpis,
  type VeiculoConsultado,
  type VeiculoHotlist,
  type Patrulha,
} from '@/services/agente/agente-inicio.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Kpis, VeiculoConsultado, VeiculoHotlist, Patrulha }

// ============================================================
// Store
// ============================================================
export const useAgenteInicioStore = defineStore('agenteInicio', () => {
  // ----------------------------------------------------------
  // Estado base
  // ----------------------------------------------------------
  const online = ref(true)
  const aAtualizar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)
  const agora = ref(new Date())
  const agenteNome = ref('Agente')

  let timer: number | undefined

  // ----------------------------------------------------------
  // Dados backend
  // ----------------------------------------------------------
  const kpis = ref<Kpis>({
    consultas: 0,
    criticos: 0,
    autos: 0,
  })

  const veiculos = ref<VeiculoConsultado[]>([])
  const requerAtencaoList = ref<VeiculoHotlist[]>([])
  const patrulha = ref<Patrulha | null>(null)
  const dataHoraBackend = ref('—')

  // ----------------------------------------------------------
  // Patrulha fallback (para o template)
  // ----------------------------------------------------------
  const patrulhaNome = computed(() => patrulha.value?.nome ?? 'Sem patrulha')
  const patrulhaTotal = computed(() => patrulha.value?.total ?? 0)
  const patrulhaProgresso = computed(() => patrulha.value?.progresso ?? 0)
  const tempoPatrulha = computed(() => patrulha.value?.tempo ?? '—')

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const primeiroNome = computed(() => {
    const nome = agenteNome.value || 'Agente'
    return nome.split(' ')[0]
  })

  const saudacao = computed(() => {
    const h = agora.value.getHours()
    if (h < 12) return 'Bom dia'
    if (h < 19) return 'Boa tarde'
    return 'Boa noite'
  })

  const dataHora = computed(() => dataHoraBackend.value || '—')

  const patrulhaPercentagem = computed(() =>
    patrulhaTotal.value > 0
      ? Math.round((patrulhaProgresso.value / patrulhaTotal.value) * 100)
      : 0,
  )

  const requerAtencao = computed(() => requerAtencaoList.value)

  const ultimaConsulta = computed<VeiculoConsultado | null>(
    () => veiculos.value[0] ?? null,
  )

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  function setAgente(nome: string) {
    agenteNome.value = nome || 'Agente'
  }

  function iniciarRelogio(intervalo = 30_000) {
    pararRelogio()
    timer = window.setInterval(() => {
      agora.value = new Date()
    }, intervalo)
  }

  function pararRelogio() {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  }

  async function carregar() {
    if (aAtualizar.value) return
    aAtualizar.value = true
    erro.value = null

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 400))

      const dados = await agenteInicioService.obter()

      kpis.value = dados.kpis
      veiculos.value = dados.veiculos
      requerAtencaoList.value = dados.requerAtencao
      patrulha.value = dados.patrulha
      dataHoraBackend.value = dados.dataHora

      await atrasoMinimo
      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      carregado.value = true
    } finally {
      aAtualizar.value = false
    }
  }

  async function atualizar() {
    await carregar()
  }

  // ----------------------------------------------------------
  onUnmounted(pararRelogio)

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado
    online,
    aAtualizar,
    carregado,
    erro,
    agora,
    agenteNome,

    // dados
    kpis,
    veiculos,
    requerAtencao,
    patrulha,

    // patrulha (compat)
    patrulhaNome,
    patrulhaTotal,
    patrulhaProgresso,
    tempoPatrulha,
    patrulhaPercentagem,

    // getters
    primeiroNome,
    saudacao,
    dataHora,
    ultimaConsulta,

    // acções
    setAgente,
    iniciarRelogio,
    pararRelogio,
    carregar,
    atualizar,
  }
})