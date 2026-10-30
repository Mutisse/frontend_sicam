import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

// ============================================================
// Tipos
// ============================================================
export type KpiVariant = 'regular' | 'atencao' | 'critico' | 'info'
export type Tendencia = 'up' | 'down' | 'flat'

export interface KpiConfig {
  key: string
  label: string
  variant: KpiVariant
  icon: string
  clickable?: boolean
  rota?: string
}

export interface KpiValor {
  valor: number
  percentagem: string
  barra: number | null
  tendencia?: Tendencia
  variacao?: string
}

export interface FiltroConfig {
  key: string
  label: string
  tipo: 'date' | 'select'
  opcoes?: string[]
}

export interface LinhaCardConfig {
  key: string
  label: string
  icon?: string
  destaque?: 'positive' | 'negative'
}

export interface CardConfig {
  titulo: string
  icon?: string
  action?: { label: string; rota: string }
  linhas: LinhaCardConfig[]
}

export interface AlertaConfig {
  tipo: 'critico' | 'atencao' | 'info'
  titulo: string
  descricao: string
  rota?: string
}

export interface QuickAction {
  label: string
  icon: string
  rota: string
  variant?: 'primary' | 'neutral'
}

// ============================================================
// Store do Perfil — ISSM
// ============================================================
export const useIssmPerfilStore = defineStore('issmPerfil', () => {
  // ----------------------------------------------------------
  // Identificação
  // ----------------------------------------------------------
  const perfil = 'issm'
  const titulo = 'Painel ISSM'
  const subtitulo = 'Apólices activas, sinistros e seguradoras licenciadas.'

  // ----------------------------------------------------------
  // Estado dinâmico
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const kpiSelecionado = ref<string | null>(null)
  const filtros = reactive<Record<string, string>>({
    de: '',
    ate: '',
    seguradora: 'Todas',
    estado: 'Todos',
  })

  // ----------------------------------------------------------
  // Estrutura — KPIs
  // ----------------------------------------------------------
  const kpis: KpiConfig[] = [
    { key: 'activas',     label: 'Activas',     variant: 'regular', icon: 'verified_user', clickable: true, rota: '/issm/apolices?estado=activa' },
    { key: 'expiradas',   label: 'Expiradas',   variant: 'critico', icon: 'gpp_bad',       clickable: true, rota: '/issm/apolices?estado=expirada' },
    { key: 'sinistros',   label: 'Sinistros',   variant: 'atencao', icon: 'car_crash',     clickable: true, rota: '/issm/sinistros' },
    { key: 'seguradoras', label: 'Seguradoras', variant: 'info',    icon: 'business',      clickable: true, rota: '/issm/seguradoras' },
  ]

  // ----------------------------------------------------------
  // Valores dos KPIs (mock — futuramente API)
  // ----------------------------------------------------------
  const valoresKpi = ref<Record<string, KpiValor>>({
    activas:     { valor: 412, percentagem: '82%', barra: 82,   tendencia: 'up',   variacao: '+18' },
    expiradas:   { valor: 58,  percentagem: '12%', barra: 12,   tendencia: 'down', variacao: '-5' },
    sinistros:   { valor: 24,  percentagem: '5%',  barra: 5,    tendencia: 'up',   variacao: '+3' },
    seguradoras: { valor: 8,   percentagem: '—',   barra: null, tendencia: 'flat', variacao: '0' },
  })

  // ----------------------------------------------------------
  // Estrutura — Filtros
  // ----------------------------------------------------------
  const filtrosConfig: FiltroConfig[] = [
    { key: 'de',         label: 'De',         tipo: 'date' },
    { key: 'ate',        label: 'Até',        tipo: 'date' },
    {
      key: 'seguradora',
      label: 'Seguradora',
      tipo: 'select',
      opcoes: ['Todas', 'Seguradora A', 'Seguradora B', 'Seguradora C'],
    },
    {
      key: 'estado',
      label: 'Estado',
      tipo: 'select',
      opcoes: ['Todos', 'Activa', 'Expirada', 'Sinistro'],
    },
  ]

  // ----------------------------------------------------------
  // Alertas
  // ----------------------------------------------------------
  const alertas: AlertaConfig[] = [
    {
      tipo: 'atencao',
      titulo: '58 apólices a expirar nos próximos 30 dias',
      descricao: 'Notificações automáticas enviadas aos proprietários',
      rota: '/issm/apolices?estado=a-expirar',
    },
  ]

  // ----------------------------------------------------------
  // Quick actions
  // ----------------------------------------------------------
  const quickActions: QuickAction[] = [
    { label: 'Nova apólice', icon: 'add_circle', rota: '/issm/apolices',     variant: 'primary' },
    { label: 'Sinistros',    icon: 'car_crash',  rota: '/issm/sinistros' },
    { label: 'Seguradoras',  icon: 'business',   rota: '/issm/seguradoras' },
  ]

  // ----------------------------------------------------------
  // Cards secundários
  // ----------------------------------------------------------
  const cards: CardConfig[] = [
    {
      titulo: 'Apólices',
      icon: 'description',
      linhas: [
        { key: 'emitidas',  label: 'Emitidas este mês', icon: 'add_circle' },
        { key: 'aExpirar',  label: 'A expirar (30d)',   icon: 'schedule',  destaque: 'negative' },
        { key: 'renovadas', label: 'Renovadas',         icon: 'autorenew', destaque: 'positive' },
      ],
    },
    {
      titulo: 'Sinistros',
      icon: 'car_crash',
      linhas: [
        { key: 'abertos',    label: 'Abertos',     icon: 'error_outline', destaque: 'negative' },
        { key: 'resolvidos', label: 'Resolvidos',  icon: 'check_circle',  destaque: 'positive' },
        { key: 'valorMedio', label: 'Valor médio', icon: 'attach_money' },
      ],
    },
  ]

  // ----------------------------------------------------------
  // Valores dos cards (mock — futuramente API)
  // ----------------------------------------------------------
  const valoresCards = ref<Record<string, string>>({
    emitidas: '342',
    aExpirar: '58',
    renovadas: '201',
    abertos: '24',
    resolvidos: '87',
    valorMedio: '45 300 MT',
  })

  // ----------------------------------------------------------
  // Tabela
  // ----------------------------------------------------------
  const tabelaTitulo = 'Por seguradora'
  const tabelaColunas = ['Seguradora', 'Apólices', 'Sinistros', 'Activas', 'Taxa']

  const linhasTabela = ref<string[][]>([
    ['Seguradora A', '180', '12', '158', '88%'],
    ['Seguradora B', '142', '8',  '128', '90%'],
    ['Seguradora C', '90',  '4',  '78',  '87%'],
  ])

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const totalRegistos = computed(() =>
    Object.values(valoresKpi.value).reduce((acc, k) => acc + k.valor, 0),
  )

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  function selecionarKpi(k: KpiConfig) {
    kpiSelecionado.value = kpiSelecionado.value === k.key ? null : k.key
  }

  function setFiltro(key: string, valor: string) {
    filtros[key] = valor
  }

  function limparFiltros() {
    filtros.de = ''
    filtros.ate = ''
    filtros.seguradora = 'Todas'
    filtros.estado = 'Todos'
  }

  async function carregar() {
    aCarregar.value = true
    try {
      // ponto de ligação à API (mock)
      await new Promise((r) => setTimeout(r, 200))
    } finally {
      aCarregar.value = false
    }
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // identificação
    perfil,
    titulo,
    subtitulo,

    // estado
    aCarregar,
    kpiSelecionado,
    filtros,

    // estrutura
    kpis,
    filtrosConfig,
    alertas,
    quickActions,
    cards,
    tabelaTitulo,
    tabelaColunas,

    // valores
    valoresKpi,
    valoresCards,
    linhasTabela,

    // getters
    totalRegistos,

    // acções
    selecionarKpi,
    setFiltro,
    limparFiltros,
    carregar,
  }
})