// src/stores/chefe/chefe-EscalasStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  escalasService,
  type Escala,
  type EscalasKpis,
  type TurnoEscala,
  type Atribuicao,
  type CriarEscalaPayload,
} from '@/services/chefe/escalas.service'
import { agentesService, type Agente } from '@/services/chefe/agentes.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type EstadoEscala = 'Rascunho' | 'Publicada'
export type { Escala, TurnoEscala, Atribuicao }

// ============================================================
// Store
// ============================================================
export const useChefeEscalasStore = defineStore('chefeEscalas', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const TURNOS: TurnoEscala[] = ['Manhã', 'Tarde', 'Noite']
  const ESTADOS: EstadoEscala[] = ['Rascunho', 'Publicada']
  const POSTOS = [
    'Posto Central',
    'Posto Baixa',
    'Posto Matola',
    'Posto Machava',
    'Posto KAMpfumo',
    'Posto Namaacha',
  ]
  const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  const POR_PAGINA = 6

  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const escalas = ref<Escala[]>([])
  const agentesDisponiveis = ref<Agente[]>([])

  const kpisBackend = reactive<EscalasKpis>({
    total: 0,
    publicadas: 0,
    rascunhos: 0,
    cobertura: 0,
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
      const atrasoMinimo = new Promise((r) => setTimeout(r, 600))

      const [escalasResp, agentesResp] = await Promise.all([
        escalasService.listar(),
        agentesService.listar(),
      ])

      escalas.value = escalasResp.items
      Object.assign(kpisBackend, escalasResp.kpis)
      agentesDisponiveis.value = agentesResp.items

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
    total: kpisBackend.total,
    publicadas: kpisBackend.publicadas,
    rascunhos: kpisBackend.rascunhos,
    cobertura: kpisBackend.cobertura,
  }))

  // Compatibilidade com a página
  const AGENTES = computed(() =>
    agentesDisponiveis.value.map((a) => ({
      id: a.id,
      nome: a.nome,
      nSerie: a.nSerie,
      posto: a.posto,
    })),
  )

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/)
    const p = partes[0]?.[0] ?? ''
    const u = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
    return (p + u).toUpperCase()
  }

  function turnoClasse(t: string): string {
    if (t === 'Manhã') return 'manha'
    if (t === 'Tarde') return 'tarde'
    return 'noite'
  }

  function turnoPredominante(e: Escala): TurnoEscala {
    const ativos = e.atribuicoes.filter((a) => a.ativo)
    if (ativos.length === 0) return 'Manhã'

    const contagem: Record<TurnoEscala, number> = {
      Manhã: 0,
      Tarde: 0,
      Noite: 0,
    }
    for (const a of ativos) contagem[a.turno]++

    return (Object.entries(contagem).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0] ?? 'Manhã') as TurnoEscala
  }

  function totalAtribuicoesAtivas(e: Escala): number {
    return e.atribuicoes.filter((a) => a.ativo).length
  }

  function estadoClasse(estado: EstadoEscala): 'regular' | 'atencao' {
    return estado === 'Publicada' ? 'regular' : 'atencao'
  }

  // ----------------------------------------------------------
  // Semana atual
  // ----------------------------------------------------------
  function calcularSemana(offset = 0): string {
    const hoje = new Date()
    const dia = hoje.getDay()
    const diff = dia === 0 ? -6 : 1 - dia
    const segunda = new Date(hoje)
    segunda.setDate(hoje.getDate() + diff + offset * 7)

    const domingo = new Date(segunda)
    domingo.setDate(segunda.getDate() + 6)

    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`

    return `${fmt(segunda)} — ${fmt(domingo)} ${domingo.getFullYear()}`
  }

  const semanaAtual = ref(calcularSemana(0))
  const semanaOffset = ref(0)

  function semanaAnterior(): string {
    semanaOffset.value--
    semanaAtual.value = calcularSemana(semanaOffset.value)
    return semanaAtual.value
  }

  function semanaSeguinte(): string {
    semanaOffset.value++
    semanaAtual.value = calcularSemana(semanaOffset.value)
    return semanaAtual.value
  }

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroTurno = ref('')
  const filtroPosto = ref('')
  const filtroEstado = ref('')

  const temFiltrosAtivos = computed(
    () =>
      !!(
        pesquisa.value ||
        filtroTurno.value ||
        filtroPosto.value ||
        filtroEstado.value
      ),
  )

  function limparFiltros() {
    pesquisa.value = ''
    filtroTurno.value = ''
    filtroPosto.value = ''
    filtroEstado.value = ''
    pagina.value = 1
  }

  const filtrados = computed(() => {
    return escalas.value.filter((e) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !e.agente.toLowerCase().includes(q) &&
          !e.nSerie.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroTurno.value && turnoPredominante(e) !== filtroTurno.value)
        return false
      if (filtroPosto.value && e.posto !== filtroPosto.value) return false
      if (filtroEstado.value && e.estado !== filtroEstado.value) return false
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
  const escalaSelecionada = ref<Escala | null>(null)

  function abrirDetalhes(e: Escala) {
    escalaSelecionada.value = e
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Modal — Novo / Editar
  // ----------------------------------------------------------
  const modalForm = ref(false)
  const modoEdicao = ref(false)
  const aSalvar = ref(false)
  const escalaEditandoId = ref<string | null>(null)

  const form = reactive({
    agenteId: '',
    posto: 'Posto Central',
    semana: semanaAtual.value,
    estado: 'Rascunho' as EstadoEscala,
    atribuicoes: DIAS.map((dia) => ({
      dia,
      ativo: false,
      turno: 'Manhã' as TurnoEscala,
    })),
    notas: '',
  })

  const formValido = computed(
    () =>
      !!form.agenteId &&
      !!form.posto &&
      !!form.semana &&
      form.atribuicoes.length === 7,
  )

  function abrirNova() {
    Object.assign(form, {
      agenteId: AGENTES.value[0]?.id ?? '',
      posto: 'Posto Central',
      semana: semanaAtual.value,
      estado: 'Rascunho' as EstadoEscala,
      atribuicoes: DIAS.map((dia) => ({
        dia,
        ativo: false,
        turno: 'Manhã' as TurnoEscala,
      })),
      notas: '',
    })
    modoEdicao.value = false
    escalaEditandoId.value = null
    aSalvar.value = false
    modalForm.value = true
  }

  function abrirEditar(e: Escala) {
    Object.assign(form, {
      agenteId: e.agenteId,
      posto: e.posto,
      semana: e.semana,
      estado: e.estado,
      atribuicoes: e.atribuicoes.map((a) => ({ ...a })),
      notas: e.notas ?? '',
    })
    modoEdicao.value = true
    escalaEditandoId.value = e.id
    aSalvar.value = false
    modalForm.value = true
  }

  function fecharForm() {
    modalForm.value = false
  }

  async function salvarForm(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false
    aSalvar.value = true
    erro.value = null

    const payload: CriarEscalaPayload = {
      agente_id: form.agenteId,
      posto: form.posto,
      semana: form.semana,
      estado: form.estado,
      atribuicoes: form.atribuicoes.map((a) => ({
        dia: a.dia,
        ativo: a.ativo,
        turno: a.ativo ? a.turno : 'Manhã',
      })),
      notas: form.notas || undefined,
    }

    try {
      if (modoEdicao.value && escalaEditandoId.value) {
        await escalasService.actualizar(escalaEditandoId.value, payload)
      } else {
        await escalasService.criar(payload)
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
  async function publicar(id: string): Promise<boolean> {
    try {
      await escalasService.publicar(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      await escalasService.remover(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    TURNOS,
    ESTADOS,
    POSTOS,
    DIAS,
    POR_PAGINA,
    AGENTES,

    aCarregar,
    carregado,
    erro,
    carregar,

    escalas,
    kpis,
    semanaAtual,
    semanaAnterior,
    semanaSeguinte,

    pesquisa,
    filtroTurno,
    filtroPosto,
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
    escalaSelecionada,
    abrirDetalhes,

    modalForm,
    modoEdicao,
    aSalvar,
    form,
    formValido,
    abrirNova,
    abrirEditar,
    fecharForm,
    salvarForm,

    publicar,
    remover,

    iniciais,
    turnoClasse,
    turnoPredominante,
    totalAtribuicoesAtivas,
    estadoClasse,
  }
})