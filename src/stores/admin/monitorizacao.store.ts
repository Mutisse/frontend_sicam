// src/stores/admin/monitorizacao.store.ts
import { defineStore } from 'pinia'
import { computed, onUnmounted, ref } from 'vue'
import {
  monitorizacaoService,
  type Nivel,
  type NivelAlerta,
  type KpiRecurso,
  type Integracao,
  type MetricasSistema,
  type Alerta,
} from '@/services/admin/monitorizacao.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Nivel, NivelAlerta, KpiRecurso, Integracao, MetricasSistema, Alerta }
export type Intervalo = 10 | 30 | 60 | 0

// ============================================================
// Store
// ============================================================
export const useAdminMonitorizacaoStore = defineStore('adminMonitorizacao', () => {
  // ----------------------------------------------------------
  // Estado UI
  // ----------------------------------------------------------
  const carregando = ref(false)
  const carregado = ref(false)
  const aoVivo = ref(false)
  const intervalo = ref<Intervalo>(30)
  const ultimaActualizacao = ref('—')
  const filtroAlertas = ref<'' | NivelAlerta>('')
  const erro = ref<string | null>(null)

  // ----------------------------------------------------------
  // Dados (real)
  // ----------------------------------------------------------
  const recursos = ref<{
    cpu: KpiRecurso | null
    ram: KpiRecurso | null
    disco: KpiRecurso | null
    latencia: KpiRecurso | null
  }>({
    cpu: null,
    ram: null,
    disco: null,
    latencia: null,
  })

  const integracoes = ref<Integracao[]>([])
  const metricas = ref<MetricasSistema>({
    uptime: '—',
    uptimeDesde: '—',
    pedidosMin: 0,
    picoPedidos: 0,
    tempoMedio: 0,
    cacheHit: 0,
  })
  const alertas = ref<Alerta[]>([])
  const estadoGeralBackend = ref<Nivel>('regular')

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const estadoGeral = computed<Nivel>(() => estadoGeralBackend.value)

  const estadoGeralTexto = computed(() => {
    if (estadoGeral.value === 'critico') return 'Estado crítico'
    if (estadoGeral.value === 'atencao') return 'Atenção'
    return 'Sistema saudável'
  })

  const kpisRecursos = computed<KpiRecurso[]>(() => {
    return [recursos.value.cpu, recursos.value.ram, recursos.value.disco, recursos.value.latencia]
      .filter((r): r is KpiRecurso => r !== null)
  })

  const alertasVisiveis = computed(() =>
    alertas.value.filter((a) => {
      if (a.silenciado) return false
      if (filtroAlertas.value && a.nivel !== filtroAlertas.value) return false
      return true
    }),
  )

  const totalAlertas = computed(() => alertasVisiveis.value.length)

  const listaMetricas = computed(() => [
    {
      icon: 'timer',
      label: 'Uptime',
      valor: metricas.value.uptime,
      sub: `desde ${metricas.value.uptimeDesde}`,
    },
    {
      icon: 'swap_vert',
      label: 'Pedidos por minuto',
      valor: String(metricas.value.pedidosMin),
      sub: `pico: ${metricas.value.picoPedidos}/min`,
    },
    {
      icon: 'speed',
      label: 'Tempo médio',
      valor: `${metricas.value.tempoMedio} ms`,
      sub: 'meta: < 300 ms',
    },
    {
      icon: 'bolt',
      label: 'Cache',
      valor: `${metricas.value.cacheHit}%`,
      sub: 'taxa de acerto',
    },
  ])

  const servicosParados = computed(() =>
    integracoes.value.filter((i) => i.estado === 'critico'),
  )

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  const RAIO = 42
  const circunferencia = 2 * Math.PI * RAIO

  function offset(percentagem: number): number {
    const p = Math.min(100, Math.max(0, percentagem))
    return circunferencia * (1 - p / 100)
  }

  function labelNivel(n: Nivel): string {
    if (n === 'regular') return 'Normal'
    if (n === 'atencao') return 'Atenção'
    return 'Crítico'
  }

  function classeAlerta(n: NivelAlerta): Nivel {
    if (n === 'info') return 'regular'
    return n
  }

  // ----------------------------------------------------------
  // Carregar
  // ----------------------------------------------------------
  async function carregar() {
    if (carregando.value) return
    carregando.value = true
    erro.value = null
    carregado.value = false

    try {
      const dados = await monitorizacaoService.obter()

      recursos.value = {
        cpu: dados.recursos.cpu,
        ram: dados.recursos.ram,
        disco: dados.recursos.disco,
        latencia: dados.recursos.latencia,
      }
      integracoes.value = dados.integracoes
      metricas.value = dados.metricas
      alertas.value = dados.alertas
      estadoGeralBackend.value = dados.estadoGeral
      ultimaActualizacao.value = dados.actualizadoEm

      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      carregado.value = true
    } finally {
      carregando.value = false
    }
  }

  // ----------------------------------------------------------
  // Auto-refresh
  // ----------------------------------------------------------
  function alternarAoVivo() {
    aoVivo.value = !aoVivo.value
    if (aoVivo.value) iniciarTimer()
    else pararTimer()
  }

  function setIntervalo(v: Intervalo) {
    intervalo.value = v
    if (aoVivo.value) iniciarTimer()
  }

  let temporizador: ReturnType<typeof setInterval> | null = null

  function iniciarTimer() {
    pararTimer()
    if (intervalo.value > 0 && aoVivo.value) {
      temporizador = setInterval(carregar, intervalo.value * 1000)
    }
  }

  function pararTimer() {
    if (temporizador) {
      clearInterval(temporizador)
      temporizador = null
    }
  }

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  async function silenciarAlerta(id: string): Promise<boolean> {
    try {
      await monitorizacaoService.silenciarAlerta(id)
      const a = alertas.value.find((x) => x.id === id)
      if (a) a.silenciado = true
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function limparSilenciados(): Promise<boolean> {
    try {
      await monitorizacaoService.limparSilenciados()
      alertas.value = alertas.value.filter((a) => !a.silenciado)
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function reiniciarServico(nome: string): Promise<boolean> {
    try {
      await monitorizacaoService.reiniciarIntegracao(nome)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Snapshot CSV (frontend)
  // ----------------------------------------------------------
  function gerarSnapshotCSV(): string[][] {
    return [
      ['SICAM — ADMIN — SNAPSHOT DE MONITORIZAÇÃO'],
      [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
      [],
      ['RECURSOS'],
      ['Recurso', 'Valor', 'Unidade', 'Nível', 'Detalhe'],
      ...kpisRecursos.value.map((k) => [
        k.label,
        String(k.valor),
        k.unidade,
        labelNivel(k.nivel),
        k.detalhe,
      ]),
      [],
      ['INTEGRAÇÕES'],
      ['Nome', 'Estado', 'Latência (ms)', 'Última resposta'],
      ...integracoes.value.map((i) => [
        i.nome,
        labelNivel(i.estado),
        String(i.latencia),
        i.ultimaResposta,
      ]),
      [],
      ['ALERTAS ACTIVOS'],
      ['Nível', 'Título', 'Descrição', 'Hora'],
      ...alertasVisiveis.value.map((a) => [
        a.nivel,
        a.titulo,
        a.descricao,
        a.hora,
      ]),
    ]
  }

  onUnmounted(pararTimer)

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado UI
    carregando,
    carregado,
    aoVivo,
    intervalo,
    ultimaActualizacao,
    filtroAlertas,
    erro,

    // dados
    recursos,
    integracoes,
    metricas,
    alertas,

    // constantes
    RAIO,
    circunferencia,

    // getters
    estadoGeral,
    estadoGeralTexto,
    kpisRecursos,
    alertasVisiveis,
    totalAlertas,
    listaMetricas,
    servicosParados,

    // helpers
    offset,
    labelNivel,
    classeAlerta,

    // acções
    carregar,
    alternarAoVivo,
    setIntervalo,
    iniciarTimer,
    pararTimer,
    silenciarAlerta,
    limparSilenciados,
    reiniciarServico,
    gerarSnapshotCSV,
  }
})