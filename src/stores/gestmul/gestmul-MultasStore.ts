// src/stores/gestmul/gestmul-MultasStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  multasService,
  type Multa,
  type MultasKpis,
  type EstadoMulta,
  type MetodoPagamento,
  type OpcoesFiltros,
  type Recibo,
  type PagarPayload,
} from '@/services/gestmul/multas.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Multa, EstadoMulta, MetodoPagamento, Recibo }

// ============================================================
// Store
// ============================================================
export const useGestmulMultasStore = defineStore('gestmulMultas', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const ESTADOS: EstadoMulta[] = [
    'Paga',
    'Pendente',
    'Contestada',
    'Anulada',
  ]

  const METODOS_PAGAMENTO: MetodoPagamento[] = [
    'Dinheiro',
    'M-Pesa',
    'Transferência',
    'Multibanco',
  ]

  const POR_PAGINA = 6

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const multas = ref<Multa[]>([])

  const kpisData = reactive<MultasKpis>({
    total: 0,
    pagas: 0,
    pendentes: 0,
    contestadas: 0,
    anuladas: 0,
    valorTotal: 0,
    valorPago: 0,
    valorPendente: 0,
  })

  const opcoesData = reactive<OpcoesFiltros>({
    infracao: [],
    agente: [],
  })

  const kpis = computed<MultasKpis>(() => ({ ...kpisData }))
  const opcoes = computed<OpcoesFiltros>(() => ({ ...opcoesData }))

  // Compat: TIPOS_INFRACAO e AGENTES lidos do backend
  const TIPOS_INFRACAO = computed(() => opcoesData.infracao)
  const AGENTES = computed(() => opcoesData.agente)

  // ----------------------------------------------------------
  // Carregar
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 500))

      const dados = await multasService.listar()
      multas.value = dados.items
      Object.assign(kpisData, dados.kpis)
      Object.assign(opcoesData, dados.opcoes)

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
  // Helpers
  // ----------------------------------------------------------
  function formatarMoeda(valor: number): string {
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + ' MT'
  }

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroEstado = ref('')
  const filtroInfracao = ref('')
  const filtroAgente = ref('')

  const temFiltrosAtivos = computed(
    () =>
      !!(
        pesquisa.value ||
        filtroEstado.value ||
        filtroInfracao.value ||
        filtroAgente.value
      ),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroEstado.value = ''
    filtroInfracao.value = ''
    filtroAgente.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    return multas.value.filter((m) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !m.matricula.toLowerCase().includes(q) &&
          !m.codigo.toLowerCase().includes(q) &&
          !m.local.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroEstado.value && m.estado !== filtroEstado.value) return false
      if (filtroInfracao.value && m.infracao !== filtroInfracao.value)
        return false
      if (filtroAgente.value && m.agente !== filtroAgente.value) return false
      return true
    })
  })

  // ----------------------------------------------------------
  // Paginação
  // ----------------------------------------------------------
  const pagina = ref(1)

  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(filtrados.value.length / POR_PAGINA)),
  )
  const inicioPagina = computed(() => (pagina.value - 1) * POR_PAGINA)
  const fimPagina = computed(() =>
    Math.min(inicioPagina.value + POR_PAGINA, filtrados.value.length),
  )
  const paginados = computed(() =>
    filtrados.value.slice(inicioPagina.value, fimPagina.value),
  )

  watch(filtrados, () => {
    if (pagina.value > totalPaginas.value) pagina.value = 1
  })

  // ----------------------------------------------------------
  // Modal — Detalhes
  // ----------------------------------------------------------
  const modalDetalhes = ref(false)
  const multaSelecionada = ref<Multa | null>(null)

  function abrirDetalhes(m: Multa) {
    multaSelecionada.value = m
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal — Pagamento
  // ----------------------------------------------------------
  const modalPagamento = ref(false)
  const step = ref(1)
  const metodoSelecionado = ref<MetodoPagamento>('Dinheiro')
  const referencia = ref('')
  const nomePagador = ref('')
  const aProcessar = ref(false)

  const podeAvancarStep2 = computed(() => {
    if (!nomePagador.value.trim()) return false
    if (
      metodoSelecionado.value === 'M-Pesa' ||
      metodoSelecionado.value === 'Transferência'
    ) {
      if (!referencia.value.trim()) return false
    }
    return true
  })

  function abrirPagamento() {
    if (!multaSelecionada.value) return
    step.value = 1
    metodoSelecionado.value = 'Dinheiro'
    referencia.value = ''
    nomePagador.value = ''
    aProcessar.value = false
    modalDetalhes.value = false
    modalPagamento.value = true
  }

  function fecharPagamento() {
    modalPagamento.value = false
    step.value = 1
  }

  // ----------------------------------------------------------
  // Modal — Recibo
  // ----------------------------------------------------------
  const modalRecibo = ref(false)
  const recibo = ref<Recibo | null>(null)

  function fecharRecibo() {
    modalRecibo.value = false
    recibo.value = null
    multaSelecionada.value = null
  }

  // ----------------------------------------------------------
  // Confirmar pagamento (backend)
  // ----------------------------------------------------------
  async function confirmarPagamento(): Promise<boolean> {
    if (!multaSelecionada.value || !podeAvancarStep2.value) return false

    aProcessar.value = true
    erro.value = null

    const payload: PagarPayload = {
      metodo: metodoSelecionado.value,
      pagador: nomePagador.value,
    }
    if (referencia.value.trim()) payload.referencia = referencia.value.trim()

    try {
      // pequeno atraso para UX
      const atraso = new Promise((r) => setTimeout(r, 800))

      const dados = await multasService.pagar(
        multaSelecionada.value.id,
        payload,
      )

      await atraso

      recibo.value = dados.recibo
      Object.assign(kpisData, dados.kpis)

      // Actualiza lista local
      const idx = multas.value.findIndex((x) => x.id === dados.multa.id)
      if (idx >= 0) multas.value[idx] = dados.multa

      modalPagamento.value = false
      modalRecibo.value = true
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    } finally {
      aProcessar.value = false
    }
  }

  // ----------------------------------------------------------
  // Recibo PDF (backend)
  // ----------------------------------------------------------
  async function baixarReciboPdf(m: Multa): Promise<boolean> {
    try {
      const blob = await multasService.reciboPdf(m.id)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recibo-${m.codigo}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Ações de estado
  // ----------------------------------------------------------
  async function contestar(id: string): Promise<boolean> {
    try {
      const dados = await multasService.contestar(id)
      Object.assign(kpisData, dados.kpis)
      const idx = multas.value.findIndex((x) => x.id === dados.multa.id)
      if (idx >= 0) multas.value[idx] = dados.multa
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function anular(id: string): Promise<boolean> {
    try {
      const dados = await multasService.anular(id)
      Object.assign(kpisData, dados.kpis)
      const idx = multas.value.findIndex((x) => x.id === dados.multa.id)
      if (idx >= 0) multas.value[idx] = dados.multa
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      const dados = await multasService.remover(id)
      multas.value = multas.value.filter((x) => x.id !== id)
      Object.assign(kpisData, dados.kpis)
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // Compat: `pagar(codigo)` antigo agora chama contestar/anular via ID
  // (a página nova usa `store.confirmarPagamento`)

  // ----------------------------------------------------------
  // Helpers de UI
  // ----------------------------------------------------------
  function estadoClasse(
    estado: EstadoMulta,
  ): 'regular' | 'atencao' | 'critico' | 'info' {
    if (estado === 'Paga') return 'regular'
    if (estado === 'Pendente') return 'atencao'
    if (estado === 'Anulada') return 'info'
    return 'critico'
  }

  // ----------------------------------------------------------
  // Devolver tudo
  // ----------------------------------------------------------
  return {
    ESTADOS,
    METODOS_PAGAMENTO,
    POR_PAGINA,

    // compat com template
    TIPOS_INFRACAO,
    AGENTES,

    aCarregar,
    carregado,
    erro,
    carregar,

    multas,
    kpis,
    opcoes,

    pesquisa,
    filtroEstado,
    filtroInfracao,
    filtroAgente,
    temFiltrosAtivos,
    filtrados,
    limparFiltros,

    pagina,
    totalPaginas,
    inicioPagina,
    fimPagina,
    paginados,

    modalDetalhes,
    multaSelecionada,
    abrirDetalhes,

    modalPagamento,
    step,
    metodoSelecionado,
    referencia,
    nomePagador,
    aProcessar,
    podeAvancarStep2,
    abrirPagamento,
    fecharPagamento,
    confirmarPagamento,

    modalRecibo,
    recibo,
    fecharRecibo,
    baixarReciboPdf,

    contestar,
    anular,
    remover,

    estadoClasse,
    formatarMoeda,
  }
})