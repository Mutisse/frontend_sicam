// src/stores/inatro/inatro-VeiculoStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  veiculosService,
  type Veiculo,
  type CriarVeiculoPayload,
} from '@/services/inatro/veiculos.service'
import { catalogosService } from '@/services/inatro/catalogos.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export interface Inspecao {
  id: string
  matricula: string
  tipo: string
  data: string
  posto: string
  resultado: 'Aprovada' | 'Reprovada'
  estadoRegisto: 'Aprovado' | 'Falhado'
  motivoFalha?: string | undefined
  marca?: string | undefined
  modelo?: string | undefined
  ano?: number | undefined
  cor?: string | undefined
  proprietario?: string | undefined
  nif?: string | undefined
  chassis?: string | undefined
}

export interface Provincia {
  codigo: string
  nome: string
}

export interface GrupoCores {
  categoria: string
  cores: string[]
}

export interface VeiculoParaInspecao {
  matricula: string
  marca: string
  modelo: string
  ano: number
  cor: string
  proprietario: string
  nif: string
}

// ============================================================
// Store
// ============================================================
export const useInatroVeiculoStore = defineStore('inatroVeiculo', () => {
  // ----------------------------------------------------------
  // Catálogos — vêm TODOS da BD via /api/catalogos
  // ----------------------------------------------------------
  const MARCAS = ref<Record<string, string[]>>({})
  const CORES = ref<GrupoCores[]>([])
  const PROVINCIAS = ref<Provincia[]>([])

  const catalogosCarregados = ref(false)

  // ----------------------------------------------------------
  // Anos (gerado localmente)
  // ----------------------------------------------------------
  const anoAtual = new Date().getFullYear()
  const ANOS = Array.from({ length: 41 }, (_, i) => anoAtual - i)

  // ----------------------------------------------------------
  // Estado — veículos
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const inspecoesRecentes = ref<Inspecao[]>([])

  const kpisBackend = reactive({
    registados: 0,
    inspecaoOk: 0,
    inspecaoExp: 0,
    pendentes: 0,
  })

  // ----------------------------------------------------------
  // Converter Veiculo → Inspecao
  // ----------------------------------------------------------
  function converter(v: Veiculo): Inspecao {
    return {
      id: v.id,
      matricula: v.matricula,
      tipo: v.tipo,
      data: v.data,
      posto: v.posto,
      resultado: v.estado === 'critico' ? 'Reprovada' : 'Aprovada',
      estadoRegisto: 'Aprovado',
      marca: v.marca,
      modelo: v.modelo,
      ano: v.ano ?? undefined,
      cor: v.cor,
      proprietario: v.proprietario,
      nif: v.nif,
      chassis: v.chassis,
    }
  }

  // ----------------------------------------------------------
  // Carregar dados do backend (veículos + catálogos)
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))

      const [cat, d] = await Promise.all([
        catalogosService.obter(),
        veiculosService.listar(),
      ])

      MARCAS.value = cat.marcas
      CORES.value = cat.cores
      PROVINCIAS.value = cat.provincias
      catalogosCarregados.value = true

      inspecoesRecentes.value = d.items.map(converter)
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
    registados: kpisBackend.registados,
    inspecaoOk: kpisBackend.inspecaoOk,
    inspecaoExp: kpisBackend.inspecaoExp,
    pendentes: kpisBackend.pendentes,
  }))

  // ----------------------------------------------------------
  // Alertas
  // ----------------------------------------------------------
  const alertas = computed(() => [
    {
      tipo: 'critico' as const,
      icon: 'warning',
      titulo: `${kpis.value.inspecaoExp} veículos com inspecção expirada`,
      descricao: 'Notificações enviadas aos proprietários na última semana',
    },
    {
      tipo: 'atencao' as const,
      icon: 'schedule',
      titulo: `${kpis.value.pendentes} registos pendentes de validação`,
      descricao: 'Aguardam confirmação de dados do proprietário',
    },
  ])

  // ----------------------------------------------------------
  // Anel
  // ----------------------------------------------------------
  const RAIO = 42
  const circunferencia = 2 * Math.PI * RAIO

  const taxaValida = computed(() => {
    const total = kpis.value.inspecaoOk + kpis.value.inspecaoExp
    if (total === 0) return 0
    return Math.round((kpis.value.inspecaoOk / total) * 1000) / 10
  })

  const offsetRing = computed(
    () => circunferencia * (1 - taxaValida.value / 100),
  )

  // ----------------------------------------------------------
  // Barras — veículos por província
  // ----------------------------------------------------------
  const veiculosPorProvincia = computed(() => {
    const mapa: Record<string, number> = {}

    for (const v of inspecoesRecentes.value) {
      const prov = v.posto || 'Desconhecida'
      mapa[prov] = (mapa[prov] ?? 0) + 1
    }

    const dados = Object.entries(mapa)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)

    if (dados.length === 0) return []

    const max = Math.max(...dados.map((d) => d.valor), 1)
    return dados.map((d) => ({ ...d, percentagem: (d.valor / max) * 100 }))
  })

  // ----------------------------------------------------------
  // Filtros + ordenação + paginação
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroResultado = ref('')
  const filtroPosto = ref('')
  const ordenacao = ref<{ key: keyof Inspecao; dir: 'asc' | 'desc' }>({
    key: 'data',
    dir: 'desc',
  })
  const pagina = ref(1)
  const porPagina = ref(10)

  const temFiltrosAtivos = computed(
    () => !!(pesquisa.value || filtroResultado.value || filtroPosto.value),
  )

  const filtrados = computed(() => {
    const lista = inspecoesRecentes.value.filter((r) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !r.matricula.toLowerCase().includes(q) &&
          !r.posto.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroResultado.value && r.resultado !== filtroResultado.value)
        return false
      if (filtroPosto.value && r.posto !== filtroPosto.value) return false
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
    filtroPosto.value = ''
    pagina.value = 1
  }

  // ----------------------------------------------------------
  // Modal registar — form
  // ----------------------------------------------------------
  const modalRegistar = ref(false)
  const passo = ref<1 | 2>(1)
  const aSalvar = ref(false)
  const motivoFalha = ref<string | null>(null)

  const form = reactive({
    tipo: '',
    marca: '',
    modelo: '',
    ano: undefined as number | undefined,
    cor: '',
    combustivel: 'Gasolina',
    chassis: '',
    proprietario: '',
    nif: '',
    telefone: '',
    provincia: '' as string,
    endereco: '',
    posto: 'Posto Baixa',
  })

  const modelosDisponiveis = computed(() => {
    if (!form.marca) return []
    return MARCAS.value[form.marca] ?? []
  })

  const provinciaNome = computed(() => {
    const p = PROVINCIAS.value.find((x) => x.codigo === form.provincia)
    return p ? p.nome : '—'
  })

  watch(
    () => form.marca,
    () => {
      if (form.modelo && !modelosDisponiveis.value.includes(form.modelo)) {
        form.modelo = ''
      }
    },
  )

  watch(
    () => form.provincia,
    (novo) => {
      if (!novo) return
      const partes = matriculaGerada.value.split('-')
      if (partes.length === 3) {
        matriculaGerada.value = `${partes[0]}-${partes[1]}-${novo}`
      }
    },
  )

  const formValido = computed(
    () =>
      !!form.tipo &&
      !!form.provincia &&
      !!form.marca &&
      !!form.modelo &&
      !!form.ano &&
      form.ano >= 1950 &&
      form.ano <= anoAtual &&
      !!form.cor &&
      form.proprietario.trim().length > 0 &&
      /^\d{9}$/.test(form.nif),
  )

  // ----------------------------------------------------------
  // Matrícula automática
  // ----------------------------------------------------------
  const ultimaMatricula = ref('AGL-482-MC')
  const matriculaGerada = ref('')

  function gerarNovaMatricula() {
    const partes = ultimaMatricula.value.split('-')
    if (partes.length !== 3) {
      matriculaGerada.value = 'AGL-001-MC'
      return
    }
    const [letras, numero, prov] = partes
    const proximo = String(Number(numero) + 1).padStart(3, '0')
    matriculaGerada.value = `${letras}-${proximo}-${prov}`
  }

  function abrirRegistar() {
    Object.assign(form, {
      tipo: '',
      marca: '',
      modelo: '',
      ano: undefined,
      cor: '',
      combustivel: 'Gasolina',
      chassis: '',
      proprietario: '',
      nif: '',
      telefone: '',
      provincia: '',
      endereco: '',
      posto: 'Posto Baixa',
    })
    passo.value = 1
    aSalvar.value = false
    motivoFalha.value = null
    gerarNovaMatricula()
    modalRegistar.value = true
  }

  function fecharRegistar() {
    modalRegistar.value = false
  }

  // ----------------------------------------------------------
  // Código + data
  // ----------------------------------------------------------
  const codigoRegisto = computed(() => {
    const ano = String(new Date().getFullYear()).slice(-2)
    const seq = String(Math.floor(Math.random() * 900000) + 100000)
    return `INATRO-${ano}-${seq}`
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
  // SALVAR REGISTO — POST /api/veiculos
  // ----------------------------------------------------------
  async function salvarRegisto(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false

    aSalvar.value = true
    erro.value = null
    motivoFalha.value = null

    const provinciaNome =
      PROVINCIAS.value.find((p) => p.codigo === form.provincia)?.nome ??
      form.provincia

    const payload: CriarVeiculoPayload = {
      matricula: matriculaGerada.value,
      tipo: form.tipo,
      marca: form.marca,
      modelo: form.modelo,
      ano: form.ano!,
      cor: form.cor,
      combustivel: form.combustivel,
      chassis: form.chassis || undefined,
      proprietario: form.proprietario,
      nif: form.nif,
      telefone: form.telefone || undefined,
      provincia: provinciaNome,
      endereco: form.endereco || undefined,
      posto: form.posto,
    }

    try {
      await veiculosService.criar(payload)
      ultimaMatricula.value = matriculaGerada.value
      await carregar()
      return true
    } catch (e) {
      const msg = extrairErro(e)

      if (
        msg.toLowerCase().includes('chassis') ||
        msg.toLowerCase().includes('vin')
      ) {
        motivoFalha.value = msg
      } else {
        erro.value = msg
      }
      return false
    } finally {
      aSalvar.value = false
    }
  }

  // ----------------------------------------------------------
  // Modal detalhes
  // ----------------------------------------------------------
  const modalDetalhes = ref(false)
  const inspecaoDetalhe = ref<Inspecao | null>(null)

  function abrirDetalhesInspecao(r: Inspecao) {
    inspecaoDetalhe.value = r
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // HANDOFF — passar veículo para inspecção
  // ----------------------------------------------------------
  const veiculoParaInspecao = ref<VeiculoParaInspecao | null>(null)

  function enviarParaInspeccao(v: Inspecao | null): boolean {
    if (!v) return false
    if (v.estadoRegisto === 'Falhado') return false

    veiculoParaInspecao.value = {
      matricula: v.matricula,
      marca: v.marca ?? '—',
      modelo: v.modelo ?? '—',
      ano: v.ano ?? 0,
      cor: v.cor ?? '—',
      proprietario: v.proprietario ?? '—',
      nif: v.nif ?? '—',
    }

    sessionStorage.setItem(
      'sicam.veiculo-para-inspecao',
      JSON.stringify(veiculoParaInspecao.value),
    )

    return true
  }

  function limparVeiculoParaInspecao() {
    veiculoParaInspecao.value = null
    sessionStorage.removeItem('sicam.veiculo-para-inspecao')
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    MARCAS,
    CORES,
    PROVINCIAS,
    catalogosCarregados,

    ANOS,
    anoAtual,

    aCarregar,
    carregado,
    erro,
    carregar,

    kpis,
    inspecoesRecentes,
    ultimaMatricula,
    matriculaGerada,
    motivoFalha,

    alertas,
    taxaValida,
    offsetRing,
    circunferencia,
    veiculosPorProvincia,

    pesquisa,
    filtroResultado,
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

    modalRegistar,
    passo,
    aSalvar,
    form,
    modelosDisponiveis,
    provinciaNome,
    formValido,
    abrirRegistar,
    fecharRegistar,
    gerarNovaMatricula,

    codigoRegisto,
    dataEmissao,
    salvarRegisto,

    modalDetalhes,
    inspecaoDetalhe,
    abrirDetalhesInspecao,

    veiculoParaInspecao,
    enviarParaInspeccao,
    limparVeiculoParaInspecao,
  }
})