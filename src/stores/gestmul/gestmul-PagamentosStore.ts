// src/stores/gestmul/gestmul-PagamentosStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  pagamentosService,
  type Pagamento,
  type PagamentosKpis,
  type EstadoPagamento,
  type MetodoPagamento,
  type OpcoesFiltros,
  type Recibo,
  type CriarPagamentoPayload,
} from '@/services/gestmul/pagamentos.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Pagamento, EstadoPagamento, MetodoPagamento, Recibo }

// ============================================================
// Store
// ============================================================
export const useGestmulPagamentosStore = defineStore('gestmulPagamentos', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const METODOS: MetodoPagamento[] = [
    'Dinheiro',
    'Transferência',
    'Multibanco',
    'M-Pesa',
  ]
  const ESTADOS: EstadoPagamento[] = ['Confirmado', 'Pendente', 'Anulado']
  const POR_PAGINA = 6

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const pagamentos = ref<Pagamento[]>([])

  const kpisData = reactive<PagamentosKpis>({
    total: 0,
    confirmados: 0,
    pendentes: 0,
    anulados: 0,
    valorConfirmado: 0,
    valorPendente: 0,
    valorTotal: 0,
    ticketMedio: 0,
  })

  const opcoesData = reactive<OpcoesFiltros>({
    metodo: [],
    estado: [],
  })

  const kpis = computed<PagamentosKpis>(() => ({ ...kpisData }))
  const opcoes = computed<OpcoesFiltros>(() => ({ ...opcoesData }))

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

      const dados = await pagamentosService.listar()
      pagamentos.value = dados.items
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

  function formatarInputData(d: Date): string {
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    return `${dia}/${mes}/${d.getFullYear()}`
  }

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroMetodo = ref('')
  const filtroEstado = ref('')

  const temFiltrosAtivos = computed(
    () => !!(pesquisa.value || filtroMetodo.value || filtroEstado.value),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroMetodo.value = ''
    filtroEstado.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    return pagamentos.value.filter((p) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !p.matricula.toLowerCase().includes(q) &&
          !p.recibo.toLowerCase().includes(q) &&
          !p.multaCodigo.toLowerCase().includes(q) &&
          !p.pagador.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroMetodo.value && p.metodo !== filtroMetodo.value) return false
      if (filtroEstado.value && p.estado !== filtroEstado.value) return false
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
  const pagamentoSelecionado = ref<Pagamento | null>(null)

  function abrirDetalhes(p: Pagamento) {
    pagamentoSelecionado.value = p
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal — Novo / Editar
  // ----------------------------------------------------------
  const modalForm = ref(false)
  const step = ref(1)
  const modoEdicao = ref(false)
  const aSalvar = ref(false)
  const editandoId = ref<string | null>(null)

  const form = reactive({
    recibo: '',
    matricula: '',
    multaCodigo: '',
    infracao: 'Excesso de velocidade',
    metodo: 'Dinheiro' as MetodoPagamento,
    data: '',
    valor: 0,
    pagador: '',
    referencia: '',
    estado: 'Pendente' as EstadoPagamento,
    observacoes: '',
  })

  const passo1Valido = computed(
    () =>
      form.recibo.trim().length > 0 &&
      form.matricula.trim().length >= 6 &&
      form.multaCodigo.trim().length > 0,
  )

  const passo2Valido = computed(
    () => form.pagador.trim().length > 0 && form.valor > 0,
  )

  const formValido = computed(() => passo1Valido.value && passo2Valido.value)

  function abrirNovo() {
    const agora = new Date()
    Object.assign(form, {
      recibo: `RC-${agora.getFullYear()}-${String(
        pagamentos.value.length + 1,
      ).padStart(6, '0')}`,
      matricula: '',
      multaCodigo: '',
      infracao: 'Excesso de velocidade',
      metodo: 'Dinheiro' as MetodoPagamento,
      data: formatarInputData(agora),
      valor: 0,
      pagador: '',
      referencia: '',
      estado: 'Pendente' as EstadoPagamento,
      observacoes: '',
    })
    modoEdicao.value = false
    editandoId.value = null
    step.value = 1
    aSalvar.value = false
    erro.value = null
    modalForm.value = true
  }

  function abrirEditar(p: Pagamento) {
    Object.assign(form, {
      recibo: p.recibo,
      matricula: p.matricula,
      multaCodigo: p.multaCodigo,
      infracao: p.infracao,
      metodo: p.metodo,
      data: p.data,
      valor: p.valor,
      pagador: p.pagador,
      referencia: p.referencia ?? '',
      estado: p.estado,
      observacoes: p.observacoes ?? '',
    })
    modoEdicao.value = true
    editandoId.value = p.id
    step.value = 1
    aSalvar.value = false
    erro.value = null
    modalForm.value = true
  }

  function fecharForm() {
    modalForm.value = false
    step.value = 1
  }

  function proximoPasso() {
    if (step.value < 3) step.value = step.value + 1
  }

  function passoAnterior() {
    if (step.value > 1) step.value = step.value - 1
  }

  async function salvarForm(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false
    aSalvar.value = true
    erro.value = null

    try {
      if (modoEdicao.value && editandoId.value) {
        // Actualização
        await pagamentosService.actualizar(editandoId.value, {
          metodo: form.metodo,
          pagador: form.pagador,
          referencia: form.referencia.trim() || undefined,
          estado: form.estado,
          observacoes: form.observacoes.trim() || undefined,
        })
      } else {
        // Novo registo manual
        const payload: CriarPagamentoPayload = {
          multaNumero: form.multaCodigo,
          metodo: form.metodo,
          pagador: form.pagador,
          estado: form.estado,
        }
        if (form.referencia.trim()) payload.referencia = form.referencia.trim()
        if (form.observacoes.trim()) payload.observacoes = form.observacoes.trim()

        await pagamentosService.criar(payload)
      }
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    } finally {
      aSalvar.value = false
    }
  }

  // ----------------------------------------------------------
  // Ações
  // ----------------------------------------------------------
  async function confirmar(id: string): Promise<boolean> {
    try {
      await pagamentosService.confirmar(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function anular(id: string): Promise<boolean> {
    try {
      await pagamentosService.anular(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      await pagamentosService.remover(id)
      pagamentos.value = pagamentos.value.filter((x) => x.id !== id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Modal — Recibo (visualização + PDF)
  // ----------------------------------------------------------
  const modalRecibo = ref(false)
  const recibo = ref<Recibo | null>(null)

  function abrirRecibo(p: Pagamento) {
    const agora = new Date()

    const r: Recibo = {
      numero: p.recibo,
      data: p.data,
      hora: agora.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      multaCodigo: p.multaCodigo,
      matricula: p.matricula,
      infracao: p.infracao,
      metodo: p.metodo,
      pagador: p.pagador,
      valor: p.valor,
      referencia: p.referencia ?? null,
    }

    recibo.value = r
    modalDetalhes.value = false
    modalRecibo.value = true
  }

  function fecharRecibo() {
    modalRecibo.value = false
    recibo.value = null
  }

  async function baixarReciboPdf(p: Pagamento): Promise<boolean> {
    try {
      const blob = await pagamentosService.reciboPdf(p.id)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recibo-${p.recibo}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Helpers de UI
  // ----------------------------------------------------------
  function metodoIcone(m: MetodoPagamento): string {
    if (m === 'Dinheiro') return 'payments'
    if (m === 'Transferência') return 'account_balance'
    if (m === 'Multibanco') return 'credit_card'
    return 'smartphone'
  }

  function metodoClasse(
    m: MetodoPagamento,
  ): 'cash' | 'transfer' | 'card' | 'mobile' {
    if (m === 'Dinheiro') return 'cash'
    if (m === 'Transferência') return 'transfer'
    if (m === 'Multibanco') return 'card'
    return 'mobile'
  }

  function estadoClasse(e: EstadoPagamento): 'regular' | 'atencao' | 'info' {
    if (e === 'Confirmado') return 'regular'
    if (e === 'Pendente') return 'atencao'
    return 'info'
  }

  // ----------------------------------------------------------
  // Devolver tudo
  // ----------------------------------------------------------
  return {
    METODOS,
    ESTADOS,
    POR_PAGINA,

    aCarregar,
    carregado,
    erro,
    carregar,

    pagamentos,
    kpis,
    opcoes,

    pesquisa,
    filtroMetodo,
    filtroEstado,
    temFiltrosAtivos,
    filtrados,
    limparFiltros,

    pagina,
    totalPaginas,
    inicioPagina,
    fimPagina,
    paginados,

    modalDetalhes,
    pagamentoSelecionado,
    abrirDetalhes,

    modalForm,
    step,
    modoEdicao,
    aSalvar,
    form,
    formValido,
    passo1Valido,
    passo2Valido,
    abrirNovo,
    abrirEditar,
    fecharForm,
    proximoPasso,
    passoAnterior,
    salvarForm,

    confirmar,
    anular,
    remover,

    modalRecibo,
    recibo,
    abrirRecibo,
    fecharRecibo,
    baixarReciboPdf,

    metodoIcone,
    metodoClasse,
    estadoClasse,
    formatarMoeda,
  }
})