// src/stores/inatro/inatro-AgendamentosStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  agendamentosService,
  type Agendamento,
  type AgendamentosKpis,
  type CriarAgendamentoPayload,
  type EstadoAgendamento,
} from '@/services/inatro/agendamentos.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Reexportar tipos do service (para quem importa do store)
// ============================================================
export type {
  Agendamento,
  EstadoAgendamento,
  AgendamentosKpis,
  CriarAgendamentoPayload,
} from '@/services/inatro/agendamentos.service'

// ============================================================
// Tipos locais do store
// ============================================================
export type TipoInspecao =
  | 'Periódica'
  | 'Reinspecção'
  | 'Extraordinária'

export interface SlotHorario {
  hora: string
  disponivel: boolean
  agendamento?: Agendamento | undefined
}

// ============================================================
// Store
// ============================================================
export const useInatroAgendamentosStore = defineStore('inatroAgendamentos', () => {
  // ----------------------------------------------------------
  // Constantes (estáticas — não precisam ir à BD)
  // ----------------------------------------------------------
  const POSTOS = [
    'Posto Baixa',
    'Posto Matola',
    'Posto Machava',
    'Posto KaMpfumo',
    'Posto Namaacha',
  ]

  const INSPECTORES = [
    'Insp. Chissano',
    'Insp. Nhaca',
    'Insp. Sitoe',
    'Insp. Cumbe',
    'Insp. Tembe',
  ]

  const TIPOS: TipoInspecao[] = ['Periódica', 'Reinspecção', 'Extraordinária']

  const HORARIOS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00',
  ]

  // ----------------------------------------------------------
  // Estado — backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const agendamentos = ref<Agendamento[]>([])

  const kpisBackend = reactive<AgendamentosKpis>({
    hoje: 0,
    semana: 0,
    confirmados: 0,
    cancelados: 0,
    concluidos: 0,
    pendentes: 0,
  })

  // ----------------------------------------------------------
  // Carregar do backend
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))

      const dados = await agendamentosService.listar()
      agendamentos.value = dados.items
      Object.assign(kpisBackend, dados.kpis)

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
  // Helpers Data / Hora
  // ----------------------------------------------------------
  function parseData(data: string): Date {
    const partes = data.split('/')
    const dia = Number(partes[0] ?? 0)
    const mes = Number(partes[1] ?? 1)
    const ano = Number(partes[2] ?? 2000)
    return new Date(ano, mes - 1, dia)
  }

  function parseHora(hora: string): number {
    const partes = hora.split(':')
    const h = Number(partes[0] ?? 0)
    const m = Number(partes[1] ?? 0)
    return (h * 60 + m) * 60 * 1000
  }

  function formatarData(d: Date): string {
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    return `${dia}/${mes}/${d.getFullYear()}`
  }

  const hoje = new Date()
  const hojeStr = formatarData(hoje)

  // ----------------------------------------------------------
  // KPIs (vindos do backend)
  // ----------------------------------------------------------
  const kpis = computed(() => ({
    hoje: kpisBackend.hoje,
    semana: kpisBackend.semana,
    confirmados: kpisBackend.confirmados,
    cancelados: kpisBackend.cancelados,
    concluidos: kpisBackend.concluidos,
    pendentes: kpisBackend.pendentes,
  }))

  // ----------------------------------------------------------
  // Alertas
  // ----------------------------------------------------------
  const alertas = computed(() => {
    const lista: {
      tipo: 'critico' | 'atencao'
      icon: string
      titulo: string
      descricao: string
    }[] = []

    if (kpis.value.pendentes > 0) {
      lista.push({
        tipo: 'atencao',
        icon: 'pending_actions',
        titulo: `${kpis.value.pendentes} agendamento${kpis.value.pendentes === 1 ? '' : 's'} pendente${kpis.value.pendentes === 1 ? '' : 's'} de confirmação`,
        descricao: 'Confirme ou cancele para libertar os horários',
      })
    }

    if (kpis.value.cancelados > 0) {
      lista.push({
        tipo: 'atencao',
        icon: 'cancel',
        titulo: `${kpis.value.cancelados} agendamento${kpis.value.cancelados === 1 ? '' : 's'} cancelado${kpis.value.cancelados === 1 ? '' : 's'}`,
        descricao: 'Pode remover ou remarcar estes agendamentos',
      })
    }

    return lista
  })

  // ----------------------------------------------------------
  // Filtros + ordenação + paginação
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroData = ref('')
  const filtroPosto = ref('')
  const filtroInspector = ref('')
  const filtroEstado = ref('')

  const ordenacao = ref<{ key: keyof Agendamento; dir: 'asc' | 'desc' }>({
    key: 'data',
    dir: 'asc',
  })
  const pagina = ref(1)
  const porPagina = ref(10)

  const temFiltrosAtivos = computed(
    () =>
      !!(
        pesquisa.value ||
        filtroData.value ||
        filtroPosto.value ||
        filtroInspector.value ||
        filtroEstado.value
      ),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroData.value = ''
    filtroPosto.value = ''
    filtroInspector.value = ''
    filtroEstado.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    const lista = agendamentos.value.filter((a) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !a.matricula.toLowerCase().includes(q) &&
          !a.proprietario.toLowerCase().includes(q) &&
          !(a.codigo ?? a.id).toLowerCase().includes(q)
        )
          return false
      }

      if (filtroData.value === 'hoje' && a.data !== hojeStr) return false

      if (filtroData.value === 'amanha') {
        const amanha = new Date(hoje)
        amanha.setDate(hoje.getDate() + 1)
        const amanhaStr = formatarData(amanha)
        if (a.data !== amanhaStr) return false
      }

      if (filtroData.value === 'semana') {
        const d = parseData(a.data)
        const diff = (d.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
        if (diff < 0 || diff > 7) return false
      }

      if (filtroPosto.value && a.posto !== filtroPosto.value) return false
      if (filtroInspector.value && a.inspetor !== filtroInspector.value)
        return false
      if (filtroEstado.value && a.estado !== filtroEstado.value) return false

      return true
    })

    const { key, dir } = ordenacao.value
    const mult = dir === 'asc' ? 1 : -1
    return [...lista].sort((a, b) => {
      if (key === 'data') {
        const da = parseData(a.data).getTime() + parseHora(a.hora)
        const db = parseData(b.data).getTime() + parseHora(b.hora)
        return (da - db) * mult
      }

      const va = String((a as any)[key] ?? '')
      const vb = String((b as any)[key] ?? '')
      return va.localeCompare(vb) * mult
    })
  })

  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(filtrados.value.length / porPagina.value)),
  )
  const inicioPagina = computed(() => (pagina.value - 1) * porPagina.value)
  const fimPagina = computed(() =>
    Math.min(inicioPagina.value + porPagina.value, filtrados.value.length),
  )
  const paginados = computed(() =>
    filtrados.value.slice(inicioPagina.value, fimPagina.value),
  )

  watch(filtrados, () => {
    if (pagina.value > totalPaginas.value) pagina.value = 1
  })

  const iconeOrdenacao = computed(() =>
    ordenacao.value.dir === 'asc' ? 'arrow_upward' : 'arrow_downward',
  )

  function ordenarPor(key: keyof Agendamento) {
    if (ordenacao.value.key === key) {
      ordenacao.value.dir = ordenacao.value.dir === 'asc' ? 'desc' : 'asc'
    } else {
      ordenacao.value = { key, dir: 'asc' }
    }
  }

  // ----------------------------------------------------------
  // Modal — Novo agendamento (4 passos)
  // ----------------------------------------------------------
  const modalNovo = ref(false)
  const passoNovo = ref<1 | 2 | 3 | 4>(1)
  const aSalvar = ref(false)

  const form = reactive({
    matricula: '',
    marca: '',
    modelo: '',
    proprietario: '',
    nif: '',
    telefone: '',
    data: '',
    hora: '',
    duracao: 30,
    posto: 'Posto Baixa',
    inspector: 'Insp. Chissano',
    tipo: 'Periódica' as TipoInspecao,
    observacoes: '',
  })

  const passo1Valido = computed(
    () =>
      form.matricula.trim().length >= 6 &&
      form.marca.trim().length > 0 &&
      form.modelo.trim().length > 0,
  )

  const passo2Valido = computed(
    () => form.proprietario.trim().length > 0 && /^\d{9}$/.test(form.nif),
  )

  const passo3Valido = computed(
    () =>
      form.data.length > 0 &&
      form.hora.length > 0 &&
      !!form.posto &&
      !!form.inspector &&
      !!form.tipo,
  )

  const formValido = computed(
    () => passo1Valido.value && passo2Valido.value && passo3Valido.value,
  )

  function abrirNovo() {
    const amanha = new Date(hoje)
    amanha.setDate(hoje.getDate() + 1)

    Object.assign(form, {
      matricula: '',
      marca: '',
      modelo: '',
      proprietario: '',
      nif: '',
      telefone: '',
      data: formatarData(amanha),
      hora: '09:00',
      duracao: 30,
      posto: 'Posto Baixa',
      inspector: 'Insp. Chissano',
      tipo: 'Periódica' as TipoInspecao,
      observacoes: '',
    })
    passoNovo.value = 1
    aSalvar.value = false
    erro.value = null
    modalNovo.value = true
  }

  function fecharNovo() {
    modalNovo.value = false
  }

  function proximoPasso() {
    if (passoNovo.value < 4) {
      passoNovo.value = (passoNovo.value + 1) as 1 | 2 | 3 | 4
    }
  }

  function passoAnterior() {
    if (passoNovo.value > 1) {
      passoNovo.value = (passoNovo.value - 1) as 1 | 2 | 3 | 4
    }
  }

  function dataParaISO(data: string): string {
    const partes = data.split('/')
    if (partes.length !== 3) return data
    return `${partes[2]}-${partes[1]}-${partes[0]}`
  }

  async function salvarNovo(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false
    aSalvar.value = true
    erro.value = null

    const payload: CriarAgendamentoPayload = {
      matricula: form.matricula.toUpperCase(),
      marca: form.marca,
      modelo: form.modelo,
      proprietario: form.proprietario,
      nif: form.nif,
      telefone: form.telefone || undefined,
      data: dataParaISO(form.data),
      hora: form.hora,
      duracao: form.duracao,
      tipo: form.tipo,
      posto: form.posto,
      inspetor: form.inspector,
      observacoes: form.observacoes || undefined,
    }

    try {
      const res = await agendamentosService.criar(payload)
      Object.assign(kpisBackend, res.kpis)
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
  // Modal — Detalhes
  // ----------------------------------------------------------
  const modalDetalhes = ref(false)
  const agendamentoDetalhe = ref<Agendamento | null>(null)
  const modoEdicao = ref(false)

  function abrirDetalhes(a: Agendamento) {
    agendamentoDetalhe.value = a
    modoEdicao.value = false
    modalDetalhes.value = true
  }

  function abrirEditar(a: Agendamento) {
    agendamentoDetalhe.value = a
    modoEdicao.value = true
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Ações
  // ----------------------------------------------------------
  async function confirmar(id: string): Promise<boolean> {
    try {
      const res = await agendamentosService.confirmar(id)
      Object.assign(kpisBackend, res.kpis)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function concluir(id: string): Promise<boolean> {
    try {
      const res = await agendamentosService.concluir(id)
      Object.assign(kpisBackend, res.kpis)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function cancelar(id: string): Promise<boolean> {
    try {
      const res = await agendamentosService.cancelar(id)
      Object.assign(kpisBackend, res.kpis)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      const res = await agendamentosService.remover(id)
      Object.assign(kpisBackend, res.kpis)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Slots de horários
  // ----------------------------------------------------------
  function slotsDisponiveis(data: string, posto: string): SlotHorario[] {
    return HORARIOS.map((hora) => {
      const existente = agendamentos.value.find(
        (a) =>
          a.data === data &&
          a.hora === hora &&
          a.posto === posto &&
          a.estado !== 'Cancelado',
      )

      return {
        hora,
        disponivel: !existente,
        agendamento: existente ?? undefined,
      }
    })
  }

  // ----------------------------------------------------------
  // Helpers UI
  // ----------------------------------------------------------
  function estadoClasse(
    estado: EstadoAgendamento,
  ): 'regular' | 'atencao' | 'critico' | 'info' {
    if (estado === 'Confirmado') return 'regular'
    if (estado === 'Pendente') return 'atencao'
    if (estado === 'Cancelado') return 'critico'
    return 'info'
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    POSTOS,
    INSPECTORES,
    TIPOS,
    HORARIOS,

    aCarregar,
    carregado,
    erro,
    carregar,

    agendamentos,
    kpis,
    alertas,

    pesquisa,
    filtroData,
    filtroPosto,
    filtroInspector,
    filtroEstado,
    ordenacao,
    pagina,
    porPagina,
    temFiltrosAtivos,
    filtrados,
    totalPaginas,
    inicioPagina,
    fimPagina,
    paginados,
    iconeOrdenacao,
    ordenarPor,
    limparFiltros,

    modalNovo,
    passoNovo,
    aSalvar,
    form,
    formValido,
    passo1Valido,
    passo2Valido,
    passo3Valido,
    abrirNovo,
    fecharNovo,
    proximoPasso,
    passoAnterior,
    salvarNovo,

    modalDetalhes,
    agendamentoDetalhe,
    modoEdicao,
    abrirDetalhes,
    abrirEditar,

    confirmar,
    cancelar,
    concluir,
    remover,

    slotsDisponiveis,

    estadoClasse,
    parseData,
    formatarData,
  }
})