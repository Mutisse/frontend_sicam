// src/stores/gestmul/gestmul-ContestacoesStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  contestacoesService,
  type Contestacao,
  type ContestacoesKpis,
  type EstadoContestacao,
  type MotivoContestacao,
  type PrioridadeContestacao,
  type CriarContestacaoPayload,
  type DecidirPayload,
} from '@/services/gestmul/contestacoes.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type {
  Contestacao,
  EstadoContestacao,
  MotivoContestacao,
  PrioridadeContestacao,
}

// ============================================================
// Store
// ============================================================
export const useGestmulContestacoesStore = defineStore(
  'gestmulContestacoes',
  () => {
    // ----------------------------------------------------------
    // Constantes
    // ----------------------------------------------------------
    const ESTADOS: EstadoContestacao[] = [
      'Pendente',
      'Em análise',
      'Aceite',
      'Rejeitada',
      'Cancelada',
    ]

    const MOTIVOS: MotivoContestacao[] = [
      'Erro de identificação do veículo',
      'Multa duplicada',
      'Não era o condutor',
      'Veículo vendido',
      'Erro de dados na multa',
      'Prescrição',
      'Outro',
    ]

    const PRIORIDADES: PrioridadeContestacao[] = ['Baixa', 'Média', 'Alta']

    const RESPONSAVEIS = [
      'Dr. Carlos Nhaca',
      'Dra. Rita Tembe',
      'Dr. Pedro Cumbe',
      'Dra. Sofia Macuácua',
    ]

    const POR_PAGINA = 6

    // ----------------------------------------------------------
    // Estado backend
    // ----------------------------------------------------------
    const aCarregar = ref(false)
    const carregado = ref(false)
    const erro = ref<string | null>(null)

    const contestacoes = ref<Contestacao[]>([])

    const kpisData = reactive<ContestacoesKpis>({
      total: 0,
      pendentes: 0,
      emAnalise: 0,
      aceites: 0,
      rejeitadas: 0,
      canceladas: 0,
      valorEmCausa: 0,
      aExpirar: 0,
    })

    const kpis = computed<ContestacoesKpis>(() => ({ ...kpisData }))

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

        const dados = await contestacoesService.listar()
        contestacoes.value = dados.items
        Object.assign(kpisData, dados.kpis)

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
      return (
        valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + ' MT'
      )
    }

    function formatarInputData(d: Date): string {
      const dia = String(d.getDate()).padStart(2, '0')
      const mes = String(d.getMonth() + 1).padStart(2, '0')
      return `${dia}/${mes}/${d.getFullYear()}`
    }

    function parseData(s: string): Date {
      const [dia, mes, ano] = s.split('/').map(Number)
      return new Date(ano ?? 2000, (mes ?? 1) - 1, dia ?? 1)
    }

    function diasRestantes(prazo: string): number {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const d = parseData(prazo)
      d.setHours(0, 0, 0, 0)
      return Math.floor((d.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    }

    function diasRestantesFormatado(prazo: string): string {
      const d = diasRestantes(prazo)
      if (d < 0)
        return `Expirado há ${Math.abs(d)} dia${Math.abs(d) === 1 ? '' : 's'}`
      if (d === 0) return 'Expira hoje'
      if (d === 1) return 'Expira amanhã'
      return `${d} dias restantes`
    }

    // ----------------------------------------------------------
    // Filtros
    // ----------------------------------------------------------
    const pesquisa = ref('')
    const filtroEstado = ref('')
    const filtroMotivo = ref('')
    const filtroPrioridade = ref('')

    const temFiltrosAtivos = computed(
      () =>
        !!(
          pesquisa.value ||
          filtroEstado.value ||
          filtroMotivo.value ||
          filtroPrioridade.value
        ),
    )

    function limparFiltros() {
      pesquisa.value = ''
      filtroEstado.value = ''
      filtroMotivo.value = ''
      filtroPrioridade.value = ''
      pagina.value = 1
    }

    const filtrados = computed(() => {
      return contestacoes.value.filter((c) => {
        if (pesquisa.value) {
          const q = pesquisa.value.toLowerCase()
          if (
            !c.numero.toLowerCase().includes(q) &&
            !c.multaCodigo.toLowerCase().includes(q) &&
            !c.matricula.toLowerCase().includes(q) &&
            !c.contestante.toLowerCase().includes(q)
          )
            return false
        }
        if (filtroEstado.value && c.estado !== filtroEstado.value) return false
        if (filtroMotivo.value && c.motivo !== filtroMotivo.value) return false
        if (filtroPrioridade.value && c.prioridade !== filtroPrioridade.value)
          return false
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
    const contestacaoSelecionada = ref<Contestacao | null>(null)

    function abrirDetalhes(c: Contestacao) {
      contestacaoSelecionada.value = c
      modalDetalhes.value = true
    }

    // ----------------------------------------------------------
    // Modal — Nova / Editar (3 passos)
    // ----------------------------------------------------------
    const modalForm = ref(false)
    const step = ref(1)
    const modoEdicao = ref(false)
    const aSalvar = ref(false)
    const editandoId = ref<string | null>(null)

    const form = reactive({
      numero: '',
      multaCodigo: '',
      matricula: '',
      infracao: '',
      valorMulta: 0,
      contestante: '',
      nif: '',
      contacto: '',
      motivo: 'Erro de identificação do veículo' as MotivoContestacao,
      descricao: '',
      prioridade: 'Média' as PrioridadeContestacao,
      prazoLimite: '',
      estado: 'Pendente' as EstadoContestacao,
      observacoes: '',
    })

    const passo1Valido = computed(
      () =>
        form.multaCodigo.trim().length > 0 &&
        form.matricula.trim().length >= 6 &&
        form.contestante.trim().length > 0 &&
        /^\d{9}$/.test(form.nif),
    )

    const passo2Valido = computed(
      () => form.motivo.length > 0 && form.descricao.trim().length >= 20,
    )

    const passo3Valido = computed(
      () =>
        form.prioridade.length > 0 &&
        form.prazoLimite.length > 0 &&
        form.estado.length > 0,
    )

    const formValido = computed(
      () => passo1Valido.value && passo2Valido.value && passo3Valido.value,
    )

    function abrirNova() {
      const agora = new Date()
      const prazo = new Date(agora)
      prazo.setDate(agora.getDate() + 30)

      Object.assign(form, {
        numero: `CT-${agora.getFullYear()}-${String(
          contestacoes.value.length + 1,
        ).padStart(6, '0')}`,
        multaCodigo: '',
        matricula: '',
        infracao: '',
        valorMulta: 0,
        contestante: '',
        nif: '',
        contacto: '',
        motivo: 'Erro de identificação do veículo' as MotivoContestacao,
        descricao: '',
        prioridade: 'Média' as PrioridadeContestacao,
        prazoLimite: formatarInputData(prazo),
        estado: 'Pendente' as EstadoContestacao,
        observacoes: '',
      })
      modoEdicao.value = false
      editandoId.value = null
      step.value = 1
      aSalvar.value = false
      erro.value = null
      modalForm.value = true
    }

    function abrirEditar(c: Contestacao) {
      Object.assign(form, {
        numero: c.numero,
        multaCodigo: c.multaCodigo,
        matricula: c.matricula,
        infracao: c.infracao,
        valorMulta: c.valorMulta,
        contestante: c.contestante,
        nif: c.nif,
        contacto: c.contacto === '—' ? '' : c.contacto,
        motivo: c.motivo,
        descricao: c.descricao,
        prioridade: c.prioridade,
        prazoLimite: c.prazoLimite,
        estado: c.estado,
        observacoes: c.observacoes ?? '',
      })
      modoEdicao.value = true
      editandoId.value = c.id
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

      const payload: CriarContestacaoPayload = {
        multaCodigo: form.multaCodigo,
        matricula: form.matricula.toUpperCase(),
        valorMulta: form.valorMulta,
        contestante: form.contestante,
        nif: form.nif,
        motivo: form.motivo,
        descricao: form.descricao,
        prazoLimite: form.prazoLimite,
        prioridade: form.prioridade,
        estado: form.estado,
      }

      if (form.infracao.trim()) payload.infracao = form.infracao
      if (form.contacto.trim()) payload.contacto = form.contacto
      if (form.observacoes.trim()) payload.observacoes = form.observacoes

      try {
        if (modoEdicao.value && editandoId.value) {
          await contestacoesService.actualizar(editandoId.value, payload)
        } else {
          await contestacoesService.criar(payload)
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
    // Modal — Decisão
    // ----------------------------------------------------------
    const modalDecisao = ref(false)
    const tipoDecisao = ref<'Aceite' | 'Rejeitada'>('Aceite')
    const fundamento = ref('')
    const responsavel = ref<string>(RESPONSAVEIS[0]!)
    const aDecidir = ref(false)

    function abrirDecisao(c: Contestacao, tipo: 'Aceite' | 'Rejeitada') {
      contestacaoSelecionada.value = c
      tipoDecisao.value = tipo
      fundamento.value = ''
      responsavel.value = RESPONSAVEIS[0]!
      erro.value = null
      modalDecisao.value = true
    }

    function fecharDecisao() {
      modalDecisao.value = false
      fundamento.value = ''
    }

    async function confirmarDecisao(): Promise<boolean> {
      if (!contestacaoSelecionada.value) return false
      if (fundamento.value.trim().length < 10) return false
      if (aDecidir.value) return false

      aDecidir.value = true
      erro.value = null

      const payload: DecidirPayload = {
        tipo: tipoDecisao.value,
        fundamento: fundamento.value,
        responsavel: responsavel.value,
      }

      try {
        await contestacoesService.decidir(
          contestacaoSelecionada.value.id,
          payload,
        )
        await carregar()
        return true
      } catch (e) {
        erro.value = extrairErro(e)
        return false
      } finally {
        aDecidir.value = false
      }
    }

    // ----------------------------------------------------------
    // Acções
    // ----------------------------------------------------------
    async function marcarEmAnalise(id: string): Promise<boolean> {
      try {
        await contestacoesService.marcarEmAnalise(id)
        await carregar()
        return true
      } catch (e) {
        erro.value = extrairErro(e)
        return false
      }
    }

    async function cancelar(id: string): Promise<boolean> {
      try {
        await contestacoesService.cancelar(id)
        await carregar()
        return true
      } catch (e) {
        erro.value = extrairErro(e)
        return false
      }
    }

    async function remover(id: string): Promise<boolean> {
      try {
        await contestacoesService.remover(id)
        await carregar()
        return true
      } catch (e) {
        erro.value = extrairErro(e)
        return false
      }
    }

    // ----------------------------------------------------------
    // Helpers de UI
    // ----------------------------------------------------------
    function estadoClasse(
      e: EstadoContestacao,
    ): 'regular' | 'atencao' | 'critico' | 'info' {
      if (e === 'Aceite') return 'regular'
      if (e === 'Em análise') return 'atencao'
      if (e === 'Rejeitada') return 'critico'
      return 'info'
    }

    function prioridadeClasse(
      p: PrioridadeContestacao,
    ): 'regular' | 'atencao' | 'critico' {
      if (p === 'Baixa') return 'regular'
      if (p === 'Média') return 'atencao'
      return 'critico'
    }

    // ----------------------------------------------------------
    // Devolver
    // ----------------------------------------------------------
    return {
      ESTADOS,
      MOTIVOS,
      PRIORIDADES,
      RESPONSAVEIS,
      POR_PAGINA,

      aCarregar,
      carregado,
      erro,
      carregar,

      contestacoes,
      kpis,

      pesquisa,
      filtroEstado,
      filtroMotivo,
      filtroPrioridade,
      temFiltrosAtivos,
      filtrados,
      limparFiltros,

      pagina,
      totalPaginas,
      inicioPagina,
      fimPagina,
      paginados,

      modalDetalhes,
      contestacaoSelecionada,
      abrirDetalhes,

      modalForm,
      step,
      modoEdicao,
      aSalvar,
      form,
      formValido,
      passo1Valido,
      passo2Valido,
      passo3Valido,
      abrirNova,
      abrirEditar,
      fecharForm,
      proximoPasso,
      passoAnterior,
      salvarForm,

      modalDecisao,
      tipoDecisao,
      fundamento,
      responsavel,
      aDecidir,
      abrirDecisao,
      fecharDecisao,
      confirmarDecisao,

      marcarEmAnalise,
      cancelar,
      remover,

      estadoClasse,
      prioridadeClasse,
      diasRestantes,
      diasRestantesFormatado,
      formatarMoeda,
      formatarInputData,
    }
  },
)