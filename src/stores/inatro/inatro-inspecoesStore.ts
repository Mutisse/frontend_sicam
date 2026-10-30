// src/stores/inatro/inatro-inspecoesStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  inspecoesService,
  type Inspecao,
  type InspecoesKpis,
  type ChecklistSeccao,
  type CriarInspecaoPayload,
} from '@/services/inatro/inspecoes.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos locais
// ============================================================
export interface VeiculoPendente {
  id: string
  matricula: string
  marca: string
  modelo: string
  ano: number
  cor: string
  proprietario: string
  nif: string
  chassis: string
}

/**
 * Item do checklist no formulário.
 * Carrega as regras do campo (min/max/invertido/opcoes/unidade)
 * para não andar a fazer lookups durante a inspecção.
 */
export interface ChecklistItemForm {
  chave: string
  label: string
  tipo: string
  valor: any
  aprovado: boolean | null

  // Regras copiadas do ChecklistCampo
  min: number | null
  max: number | null
  invertido: boolean
  opcoes: string[] | null
  unidade: string | null
  so_se_gasolina: boolean
  so_se_diesel: boolean
}

export interface ChecklistSeccaoForm {
  chave: string
  label: string
  campos: ChecklistItemForm[]
}

// ============================================================
// Store
// ============================================================
export const useInatroInspecoesStore = defineStore('inatroInspecoes', () => {
  // ----------------------------------------------------------
  // Estado base
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const inspecoes = ref<Inspecao[]>([])
  const checklistEstrutura = ref<ChecklistSeccao[]>([])

  const kpisBackend = reactive<InspecoesKpis>({
    total: 0,
    aprovadas: 0,
    reprovadas: 0,
    pendentes: 0,
    taxaAprovacao: 0,
  })

  // ----------------------------------------------------------
  // Carregar tudo do backend
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))

      const [checklist, dados, veiculosPend] = await Promise.all([
        inspecoesService.checklist(),
        inspecoesService.listar(),
        inspecoesService.veiculosPendentes(),
      ])

      checklistEstrutura.value = checklist
      inspecoes.value = dados.items
      Object.assign(kpisBackend, dados.kpis)

      veiculosPendentes.value = veiculosPend.map((v: any) => ({
        id: String(v.id),
        matricula: v.matricula,
        marca: v.marca ?? '—',
        modelo: v.modelo ?? '—',
        ano: v.ano ?? 0,
        cor: v.cor ?? '—',
        proprietario: v.proprietario ?? '—',
        nif: v.nif ?? '—',
        chassis: v.chassis ?? '—',
      }))

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
    aprovadas: kpisBackend.aprovadas,
    reprovadas: kpisBackend.reprovadas,
    pendentes: kpisBackend.pendentes,
    taxaAprovacao: kpisBackend.taxaAprovacao,
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

    if (kpis.value.reprovadas > 0) {
      lista.push({
        tipo: 'critico',
        icon: 'warning',
        titulo: `${kpis.value.reprovadas} inspecções reprovadas`,
        descricao: 'Veículos requerem reinspecção nos próximos 30 dias',
      })
    }
    if (veiculosPendentes.value.length > 0) {
      lista.push({
        tipo: 'atencao',
        icon: 'schedule',
        titulo: `${veiculosPendentes.value.length} veículos por inspecionar`,
        descricao: 'Sem inspecção registada no sistema',
      })
    }
    return lista
  })

  // ----------------------------------------------------------
  // Pie chart
  // ----------------------------------------------------------
  const distribuicaoInspecoes = computed(() => {
    const total = kpis.value.total
    if (total === 0) {
      return { total: 0, fatias: [] as any[] }
    }

    const dados = [
      { label: 'Aprovadas', valor: kpis.value.aprovadas, cor: '#22c55e' },
      { label: 'Reprovadas', valor: kpis.value.reprovadas, cor: '#dc2626' },
      { label: 'Pendentes', valor: kpis.value.pendentes, cor: '#f59e0b' },
    ].filter((d) => d.valor > 0)

    const R = 40
    const C = 50
    let anguloInicial = -90

    const fatias = dados.map((d) => {
      const percentagem = (d.valor / total) * 100
      const angulo = (d.valor / total) * 360
      const anguloFinal = anguloInicial + angulo

      const rad1 = (anguloInicial * Math.PI) / 180
      const rad2 = (anguloFinal * Math.PI) / 180

      const x1 = C + R * Math.cos(rad1)
      const y1 = C + R * Math.sin(rad1)
      const x2 = C + R * Math.cos(rad2)
      const y2 = C + R * Math.sin(rad2)

      const largeArc = angulo > 180 ? 1 : 0

      const path =
        total === 1
          ? `M ${C} ${C} m -${R} 0 a ${R} ${R} 0 1 0 ${R * 2} 0 a ${R} ${R} 0 1 0 -${R * 2} 0`
          : `M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`

      anguloInicial = anguloFinal

      return { ...d, percentagem: Math.round(percentagem), path }
    })

    return { total, fatias }
  })

  const taxaAprovacao = computed(() => kpis.value.taxaAprovacao)

  // ----------------------------------------------------------
  // Barras por posto
  // ----------------------------------------------------------
  const inspecoesPorPosto = computed(() => {
    const mapa: Record<string, number> = {}
    for (const i of inspecoes.value) {
      const p = i.posto || '—'
      mapa[p] = (mapa[p] ?? 0) + 1
    }

    const dados = Object.entries(mapa)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6)

    if (dados.length === 0) return []

    const max = Math.max(...dados.map((d) => d.valor), 1)
    return dados.map((d) => ({
      ...d,
      percentagem: Math.round((d.valor / max) * 100),
    }))
  })

  // ----------------------------------------------------------
  // Filtros + ordenação + paginação
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroResultado = ref('')
  const filtroTipo = ref('')
  const filtroPosto = ref('')
  const ordenacao = ref<{ key: keyof Inspecao; dir: 'asc' | 'desc' }>({
    key: 'data',
    dir: 'desc',
  })
  const pagina = ref(1)
  const porPagina = ref(10)

  const temFiltrosAtivos = computed(
    () =>
      !!(
        pesquisa.value ||
        filtroResultado.value ||
        filtroTipo.value ||
        filtroPosto.value
      ),
  )

  const filtrados = computed(() => {
    const lista = inspecoes.value.filter((i) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        const bateu =
          i.matricula.toLowerCase().includes(q) ||
          i.codigo.toLowerCase().includes(q) ||
          i.posto.toLowerCase().includes(q)
        if (!bateu) return false
      }
      if (filtroResultado.value && i.resultado !== filtroResultado.value)
        return false
      if (filtroTipo.value && i.tipo !== filtroTipo.value) return false
      if (filtroPosto.value && i.posto !== filtroPosto.value) return false
      return true
    })

    const { key, dir } = ordenacao.value
    const mult = dir === 'asc' ? 1 : -1
    return [...lista].sort((a, b) => {
      const va = String(a[key] ?? '')
      const vb = String(b[key] ?? '')
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

  function ordenarPor(key: keyof Inspecao) {
    if (ordenacao.value.key === key) {
      ordenacao.value.dir = ordenacao.value.dir === 'asc' ? 'desc' : 'asc'
    } else {
      ordenacao.value = { key, dir: 'asc' }
    }
  }

  function limparFiltros() {
    pesquisa.value = ''
    filtroResultado.value = ''
    filtroTipo.value = ''
    filtroPosto.value = ''
    pagina.value = 1
  }

  function resultadoClasse(
    r: string,
  ): 'regular' | 'atencao' | 'critico' {
    if (r === 'Aprovada') return 'regular'
    if (r === 'Aprovada com observações') return 'atencao'
    return 'critico'
  }

  // ----------------------------------------------------------
  // Modal Nova Inspecção
  // ----------------------------------------------------------
  const modalInspecao = ref(false)
  const passo = ref<1 | 2 | 3>(1)
  const aSalvar = ref(false)

  const veiculosPendentes = ref<VeiculoPendente[]>([])
  const veiculoSelecionado = ref<VeiculoPendente | null>(null)
  const matriculaSelecionada = ref('')

  const form = reactive({
    tipo: 'Periódica',
    posto: 'Posto Baixa',
    inspetor: 'Insp. Chissano',
    resultado: '',
    observacoes: '',
    itens: [] as ChecklistSeccaoForm[],
    data: new Date().toISOString().slice(0, 10),
  })

  // ----------------------------------------------------------
  // Construir checklist form com as regras copiadas
  // ----------------------------------------------------------
  function construirChecklistForm(): ChecklistSeccaoForm[] {
    return checklistEstrutura.value.map((sec) => ({
      chave: sec.chave,
      label: sec.label,
      campos: sec.campos.map<ChecklistItemForm>((c) => ({
        chave: c.chave,
        label: c.label,
        tipo: c.tipo,
        valor:
          c.tipo === 'booleano'
            ? null
            : c.tipo === 'opcoes' || c.tipo === 'texto'
            ? ''
            : null,
        aprovado: null,

        // Regras do campo
        min: c.min,
        max: c.max,
        invertido: c.invertido,
        opcoes: c.opcoes,
        unidade: c.unidade,
        so_se_gasolina: c.so_se_gasolina,
        so_se_diesel: c.so_se_diesel,
      })),
    }))
  }

  // ----------------------------------------------------------
  // Cálculos derivados
  // ----------------------------------------------------------
  const totalItens = computed(() =>
    form.itens.reduce((s, sec) => s + sec.campos.length, 0),
  )

  const totalAprovados = computed(() =>
    form.itens.reduce(
      (s, sec) => s + sec.campos.filter((c) => c.aprovado === true).length,
      0,
    ),
  )

  const progressoChecklist = computed(() =>
    totalItens.value > 0
      ? Math.round((totalAprovados.value / totalItens.value) * 100)
      : 0,
  )

  const resultadoSugerido = computed(() => {
    const falhas = totalItens.value - totalAprovados.value
    if (falhas === 0) return 'Aprovada'
    if (falhas <= 2) return 'Aprovada com observações'
    return 'Reprovada'
  })

  const formValido = computed(
    () =>
      !!veiculoSelecionado.value &&
      !!form.tipo &&
      !!form.posto &&
      !!form.inspetor &&
      !!form.resultado,
  )

  const proximaInspecaoCalculada = computed(() => {
    const d = new Date(form.data)
    if (form.resultado === 'Reprovada') {
      d.setDate(d.getDate() + 30)
    } else {
      d.setFullYear(d.getFullYear() + 1)
    }
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    return `${dia}/${mes}/${d.getFullYear()}`
  })

  // ----------------------------------------------------------
  // Abrir / fechar modal
  // ----------------------------------------------------------
  function abrirInspecao() {
    passo.value = 1
    aSalvar.value = false
    veiculoSelecionado.value = null
    matriculaSelecionada.value = ''
    form.tipo = 'Periódica'
    form.posto = 'Posto Baixa'
    form.inspetor = 'Insp. Chissano'
    form.resultado = ''
    form.observacoes = ''
    form.data = new Date().toISOString().slice(0, 10)
    form.itens = construirChecklistForm()
    modalInspecao.value = true
  }

  function fecharInspecao() {
    modalInspecao.value = false
  }

  function selecionarVeiculo(matricula: string) {
    const v = veiculosPendentes.value.find((x) => x.matricula === matricula)
    if (!v) return
    veiculoSelecionado.value = v
    matriculaSelecionada.value = matricula
  }

  // ----------------------------------------------------------
  // SALVAR
  // ----------------------------------------------------------
  async function salvarInspecao(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false
    if (!veiculoSelecionado.value) return false

    aSalvar.value = true
    erro.value = null

    const checklist: Record<string, any> = {}
    for (const sec of form.itens) {
      checklist[sec.chave] = {}
      for (const c of sec.campos) {
        checklist[sec.chave][c.chave] = c.valor
      }
    }

    const payload: CriarInspecaoPayload = {
      veiculo_id: veiculoSelecionado.value.id,
      posto: form.posto,
      data: form.data,
      tipo: form.tipo,
      resultado: form.resultado,
      inspetor: form.inspetor,
      observacoes: form.observacoes || undefined,
      checklist,
    }

    try {
      const res = await inspecoesService.criar(payload)
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
  // Modal Detalhes
  // ----------------------------------------------------------
  const modalDetalhes = ref(false)
  const inspecaoDetalhe = ref<Inspecao | null>(null)

  function abrirDetalhes(i: Inspecao) {
    inspecaoDetalhe.value = i
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Certificado
  // ----------------------------------------------------------
  const codigoInspecao = computed(() => {
    const ano = new Date().getFullYear()
    const seq = String(inspecoes.value.length + 1).padStart(6, '0')
    return `INS-${ano}-${seq}`
  })

  const dataEmissao = computed(() => {
    const d = new Date()
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${dia}/${mes}/${d.getFullYear()} ${h}:${m}`
  })

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    aCarregar,
    carregado,
    erro,
    carregar,

    inspecoes,
    checklistEstrutura,
    veiculosPendentes,

    kpis,
    alertas,
    distribuicaoInspecoes,
    taxaAprovacao,
    inspecoesPorPosto,
    resultadoClasse,

    pesquisa,
    filtroResultado,
    filtroTipo,
    filtroPosto,
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

    modalInspecao,
    passo,
    aSalvar,
    form,
    veiculoSelecionado,
    matriculaSelecionada,
    totalItens,
    totalAprovados,
    progressoChecklist,
    resultadoSugerido,
    formValido,
    proximaInspecaoCalculada,
    abrirInspecao,
    fecharInspecao,
    selecionarVeiculo,
    salvarInspecao,

    modalDetalhes,
    inspecaoDetalhe,
    abrirDetalhes,

    codigoInspecao,
    dataEmissao,
  }
})