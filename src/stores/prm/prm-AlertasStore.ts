// src/stores/prm/prm-AlertasStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import {
  alertasService,
  type Alerta,
  type NivelAlerta,
  type TipoAlerta,
} from '@/services/prm/alertas.service'
import { extrairErro } from '@/boot/axios'

export type { Alerta, NivelAlerta, TipoAlerta } from '@/services/prm/alertas.service'

export const usePrmAlertasStore = defineStore('prmAlertas', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const NIVEIS: { key: NivelAlerta; label: string }[] = [
    { key: 'critico', label: 'Crítico' },
    { key: 'atencao', label: 'Atenção' },
    { key: 'info',    label: 'Informativo' },
  ]

  const TIPOS: { key: TipoAlerta; label: string }[] = [
    { key: 'hotlist',  label: 'Hotlist' },
    { key: 'clonagem', label: 'Clonagem' },
    { key: 'sinistro', label: 'Sinistro' },
    { key: 'sistema',  label: 'Sistema' },
  ]

  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const alertas = ref<Alerta[]>([])

  const kpisBackend = reactive({
    criticos: 0,
    atencao: 0,
    info: 0,
    lidos: 0,
    total: 0,
  })

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))

      const d = await alertasService.listar()
      alertas.value = d.items
      Object.assign(kpisBackend, d.kpis)

      await atrasoMinimo

      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      carregado.value = true
    } finally {
      aCarregar.value = false
    }
  }

  // ----------------------------------------------------------
  // KPIs
  // ----------------------------------------------------------
  const kpis = computed(() => ({
    criticos: kpisBackend.criticos,
    atencao: kpisBackend.atencao,
    info: kpisBackend.info,
    lidos: kpisBackend.lidos,
    total: kpisBackend.total,
  }))

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroNivel = ref('')
  const filtroTipo = ref('')

  const temFiltrosAtivos = computed(
    () => !!(pesquisa.value || filtroNivel.value || filtroTipo.value),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroNivel.value = ''
    filtroTipo.value = ''
  }

  const filtrados = computed(() => {
    return alertas.value.filter((a) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !a.titulo.toLowerCase().includes(q) &&
          !a.mensagem.toLowerCase().includes(q) &&
          !(a.referencia ?? '').toLowerCase().includes(q)
        )
          return false
      }
      if (filtroNivel.value && a.nivel !== filtroNivel.value) return false
      if (filtroTipo.value && a.tipo !== filtroTipo.value) return false
      return true
    })
  })

  // ----------------------------------------------------------
  // Extras
  // ----------------------------------------------------------
  const silenciados = ref<Record<TipoAlerta, number>>({
    hotlist: 0,
    clonagem: 0,
    sinistro: 0,
    sistema: 0,
  })

  const autoRefresh = ref(true)
  const somActivo = ref(false)

  function toggleAutoRefresh() { autoRefresh.value = !autoRefresh.value }
  function toggleSom() { somActivo.value = !somActivo.value }

  function silenciar(tipo: TipoAlerta, horas = 4) {
    silenciados.value[tipo] = Date.now() + horas * 60 * 60 * 1000
  }

  function dessilenciar(tipo: TipoAlerta) {
    silenciados.value[tipo] = 0
  }

  function estaSilenciado(tipo: TipoAlerta): boolean {
    return silenciados.value[tipo] > Date.now()
  }

  // ----------------------------------------------------------
  // Acções — backend
  // ----------------------------------------------------------
  async function marcarLido(id: string): Promise<boolean> {
    const a = alertas.value.find((x) => x.id === id)
    if (!a || a.lido) return false

    try {
      await alertasService.marcarLido(id)
      a.lido = true
      await atualizarKpis()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function marcarNaoLido(id: string): Promise<boolean> {
    const a = alertas.value.find((x) => x.id === id)
    if (!a || !a.lido) return false

    try {
      await alertasService.marcarNaoLido(id)
      a.lido = false
      await atualizarKpis()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function marcarTodosLidos(): Promise<number> {
    try {
      const { total } = await alertasService.marcarTodosLidos()
      alertas.value.forEach((a) => { a.lido = true })
      await atualizarKpis()
      return total
    } catch (e) {
      erro.value = extrairErro(e)
      return 0
    }
  }

  async function atualizarKpis() {
    try {
      const d = await alertasService.listar()
      Object.assign(kpisBackend, d.kpis)
    } catch {
      /* ignorar */
    }
  }

  // ----------------------------------------------------------
  // Helpers UI
  // ----------------------------------------------------------
  function labelTipo(t: TipoAlerta): string {
    return TIPOS.find((x) => x.key === t)?.label ?? t
  }

  function labelNivel(n: NivelAlerta): string {
    return NIVEIS.find((x) => x.key === n)?.label ?? n
  }

  function nivelIcone(n: NivelAlerta): string {
    if (n === 'critico') return 'error'
    if (n === 'atencao') return 'warning'
    return 'info'
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    NIVEIS,
    TIPOS,

    aCarregar,
    carregado,
    erro,
    alertas,
    kpis,
    carregar,

    pesquisa,
    filtroNivel,
    filtroTipo,
    temFiltrosAtivos,
    filtrados,
    limparFiltros,

    silenciados,
    autoRefresh,
    somActivo,
    toggleAutoRefresh,
    toggleSom,
    silenciar,
    dessilenciar,
    estaSilenciado,

    marcarLido,
    marcarNaoLido,
    marcarTodosLidos,

    labelTipo,
    labelNivel,
    nivelIcone,
  }
})