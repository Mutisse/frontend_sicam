// ============================================================
// SICAM — Configuração ESTRUTURAL dos Dashboards por perfil
// (só descreve o que existe; os valores vivem na store)
// ============================================================

export type KpiVariant = 'regular' | 'atencao' | 'critico' | 'sem-dados' | 'info'
export type Tendencia = 'up' | 'down' | 'flat'

export interface KpiConfig {
  key: string
  label: string
  variant: KpiVariant
  icon?: string
  clickable?: boolean
  rota?: string
}

export interface FiltroConfig {
  key: string
  label: string
  tipo: 'date' | 'select'
  opcoes?: string[]
}

export interface LinhaCardConfig {
  key: string          // chave para a store fornecer o valor
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

export interface DashboardConfig {
  titulo: string
  subtitulo: string
  kpis: KpiConfig[]
  filtros: FiltroConfig[]
  cards: CardConfig[]
  tabelaTitulo: string
  tabelaColunas: string[]
  legendaTipo: 'score' | 'generico'
  alertas?: AlertaConfig[]
  quickActions?: QuickAction[]
}

// ============================================================
// CHEFE
// ============================================================
const CHEFE: DashboardConfig = {
  titulo: 'Painel do Posto',
  subtitulo: 'Estado dos veículos, desempenho dos agentes e patrulhas em curso.',
  kpis: [
    { key: 'critico',   label: 'Crítico',    variant: 'critico', icon: 'warning',       clickable: true, rota: '/chefe/veiculos?estado=critico' },
    { key: 'atencao',   label: 'Atenção',    variant: 'atencao', icon: 'error_outline', clickable: true, rota: '/chefe/veiculos?estado=atencao' },
    { key: 'regular',   label: 'Regular',    variant: 'regular', icon: 'check_circle',  clickable: true, rota: '/chefe/veiculos?estado=regular' },
    { key: 'agentesOn', label: 'Agentes on', variant: 'info',    icon: 'groups',        clickable: true, rota: '/chefe/agentes' },
  ],
  filtros: [
    { key: 'de',     label: 'De',     tipo: 'date' },
    { key: 'ate',    label: 'Até',    tipo: 'date' },
    { key: 'agente', label: 'Agente', tipo: 'select', opcoes: ['Todos', 'Agente Chissano', 'Agente Nhaca', 'Agente Sitoe', 'Agente Cumbe'] },
  ],
  alertas: [
    { tipo: 'critico', titulo: '3 veículos críticos no posto', descricao: 'Requerem verificação imediata · Última deteção há 12 min', rota: '/chefe/veiculos?estado=critico' },
  ],
  quickActions: [
    { label: 'Nova consulta', icon: 'search',       rota: '/chefe/veiculos',   variant: 'primary' },
    { label: 'Ver hotlist',   icon: 'local_police', rota: '/chefe/veiculos' },
    { label: 'Relatório',     icon: 'description',  rota: '/chefe/relatorios' },
  ],
  cards: [
    {
      titulo: 'Patrulhas de hoje', icon: 'directions_car',
      action: { label: 'Ver todas', rota: '/chefe/patrulhas' },
      linhas: [
        { key: 'planeadas',  label: 'Planeadas',  icon: 'event' },
        { key: 'emCurso',    label: 'Em curso',   icon: 'play_circle' },
        { key: 'concluidas', label: 'Concluídas', icon: 'check_circle', destaque: 'positive' },
      ],
    },
    {
      titulo: 'Agentes do posto', icon: 'groups',
      action: { label: 'Gerir', rota: '/chefe/agentes' },
      linhas: [
        { key: 'total',    label: 'Total',    icon: 'people' },
        { key: 'online',   label: 'On-line',  icon: 'wifi',     destaque: 'positive' },
        { key: 'offline',  label: 'Off-line', icon: 'wifi_off', destaque: 'negative' },
      ],
    },
  ],
  tabelaTitulo: 'Por agente',
  tabelaColunas: ['Agente', 'Consultas', 'Autos', 'Patrulhas', 'Regularidade'],
  legendaTipo: 'score',
}

// ============================================================
// INATRO
// ============================================================
const INATRO: DashboardConfig = {
  titulo: 'Painel INATRO',
  subtitulo: 'Registo de veículos, inspecções técnicas e pendências.',
  kpis: [
    { key: 'registados',  label: 'Registados',         variant: 'info',    icon: 'directions_car', clickable: true, rota: '/inatro/veiculos' },
    { key: 'inspecaoOk',  label: 'Inspecção válida',   variant: 'regular', icon: 'verified',       clickable: true, rota: '/inatro/inspecoes' },
    { key: 'inspecaoExp', label: 'Inspecção expirada', variant: 'critico', icon: 'gpp_bad',        clickable: true, rota: '/inatro/inspecoes?estado=expirada' },
    { key: 'pendentes',   label: 'Pendentes',          variant: 'atencao', icon: 'hourglass_top',  clickable: true, rota: '/inatro/inspecoes?estado=pendente' },
  ],
  filtros: [
    { key: 'de',        label: 'De',        tipo: 'date' },
    { key: 'ate',       label: 'Até',       tipo: 'date' },
    { key: 'provincia', label: 'Província', tipo: 'select', opcoes: ['Todas', 'Maputo Cidade', 'Maputo Província'] },
    { key: 'estado',    label: 'Estado',    tipo: 'select', opcoes: ['Todos', 'Válida', 'Expirada', 'Pendente'] },
  ],
  alertas: [
    { tipo: 'atencao', titulo: '32 inspecções expiradas esta semana', descricao: 'Aumento de 8% comparado à semana anterior', rota: '/inatro/inspecoes?estado=expirada' },
  ],
  quickActions: [
    { label: 'Novo registo',      icon: 'add_circle', rota: '/inatro/veiculos',      variant: 'primary' },
    { label: 'Agendar inspecção', icon: 'event',      rota: '/inatro/agendamentos' },
    { label: 'Exportar',          icon: 'download',   rota: '/inatro/exportacao' },
  ],
  cards: [
    {
      titulo: 'Inspecções este mês', icon: 'fact_check',
      linhas: [
        { key: 'aprovadas',  label: 'Aprovadas',  icon: 'check_circle', destaque: 'positive' },
        { key: 'reprovadas', label: 'Reprovadas', icon: 'cancel',       destaque: 'negative' },
        { key: 'agendadas',  label: 'Agendadas',  icon: 'event' },
      ],
    },
    {
      titulo: 'Registos', icon: 'assignment',
      linhas: [
        { key: 'novosVeiculos', label: 'Novos veículos',      icon: 'add_circle' },
        { key: 'alteracoes',    label: 'Alterações prop.',    icon: 'edit' },
        { key: 'pendentesVal',  label: 'Pendentes validação', icon: 'pending', destaque: 'negative' },
      ],
    },
  ],
  tabelaTitulo: 'Por província',
  tabelaColunas: ['Província', 'Veículos', 'Inspecções OK', 'Expiradas', 'Taxa'],
  legendaTipo: 'generico',
}

// ============================================================
// GESTMUL
// ============================================================
const GESTMUL: DashboardConfig = {
  titulo: 'Painel GESTMUL',
  subtitulo: 'Multas emitidas, pagamentos e valores cobrados.',
  kpis: [
    { key: 'emitidas',  label: 'Emitidas',    variant: 'info',    icon: 'receipt_long', clickable: true, rota: '/gestmul/multas' },
    { key: 'pagas',     label: 'Pagas',       variant: 'regular', icon: 'payments',     clickable: true, rota: '/gestmul/pagamentos' },
    { key: 'pendentes', label: 'Pendentes',   variant: 'atencao', icon: 'schedule',     clickable: true, rota: '/gestmul/multas?estado=pendente' },
    { key: 'contesta',  label: 'Contestadas', variant: 'critico', icon: 'gavel',        clickable: true, rota: '/gestmul/contestacoes' },
  ],
  filtros: [
    { key: 'de',        label: 'De',        tipo: 'date' },
    { key: 'ate',       label: 'Até',       tipo: 'date' },
    { key: 'provincia', label: 'Província', tipo: 'select', opcoes: ['Todas', 'Maputo Cidade', 'Maputo Província'] },
    { key: 'estado',    label: 'Estado',    tipo: 'select', opcoes: ['Todos', 'Emitida', 'Paga', 'Pendente', 'Contestada'] },
  ],
  alertas: [
    { tipo: 'critico', titulo: '35 multas contestadas', descricao: '10% do total emitido · Requer atenção do supervisor', rota: '/gestmul/contestacoes' },
  ],
  quickActions: [
    { label: 'Nova multa',     icon: 'add_circle', rota: '/gestmul/multas',      variant: 'primary' },
    { label: 'Ver pagamentos', icon: 'payments',   rota: '/gestmul/pagamentos' },
    { label: 'Exportar',       icon: 'download',   rota: '/gestmul/exportacao' },
  ],
  cards: [
    {
      titulo: 'Valores (este mês)', icon: 'attach_money',
      linhas: [
        { key: 'cobrado',     label: 'Cobrado',      icon: 'trending_up',   destaque: 'positive' },
        { key: 'pendente',    label: 'Pendente',     icon: 'trending_down', destaque: 'negative' },
        { key: 'ticketMedio', label: 'Ticket médio', icon: 'calculate' },
      ],
    },
    {
      titulo: 'Top infracções', icon: 'bar_chart',
      linhas: [
        { key: 'excessoVel', label: 'Excesso velocidade', icon: 'speed' },
        { key: 'seguroExp',  label: 'Seguro expirado',    icon: 'shield' },
        { key: 'inspecao',   label: 'Inspecção atraso',   icon: 'event_busy' },
      ],
    },
  ],
  tabelaTitulo: 'Por província',
  tabelaColunas: ['Província', 'Emitidas', 'Pagas', 'Cobrado (MT)', 'Taxa'],
  legendaTipo: 'generico',
}

// ============================================================
// ISSM
// ============================================================
const ISSM: DashboardConfig = {
  titulo: 'Painel ISSM',
  subtitulo: 'Apólices activas, sinistros e seguradoras licenciadas.',
  kpis: [
    { key: 'activas',     label: 'Activas',     variant: 'regular', icon: 'verified_user', clickable: true, rota: '/issm/apolices?estado=activa' },
    { key: 'expiradas',   label: 'Expiradas',   variant: 'critico', icon: 'gpp_bad',       clickable: true, rota: '/issm/apolices?estado=expirada' },
    { key: 'sinistros',   label: 'Sinistros',   variant: 'atencao', icon: 'car_crash',     clickable: true, rota: '/issm/sinistros' },
    { key: 'seguradoras', label: 'Seguradoras', variant: 'info',    icon: 'business',      clickable: true, rota: '/issm/seguradoras' },
  ],
  filtros: [
    { key: 'de',         label: 'De',         tipo: 'date' },
    { key: 'ate',        label: 'Até',        tipo: 'date' },
    { key: 'seguradora', label: 'Seguradora', tipo: 'select', opcoes: ['Todas', 'Seguradora A', 'Seguradora B', 'Seguradora C'] },
    { key: 'estado',     label: 'Estado',     tipo: 'select', opcoes: ['Todos', 'Activa', 'Expirada', 'Sinistro'] },
  ],
  alertas: [
    { tipo: 'atencao', titulo: '58 apólices a expirar nos próximos 30 dias', descricao: 'Notificações automáticas enviadas aos proprietários', rota: '/issm/apolices?estado=a-expirar' },
  ],
  quickActions: [
    { label: 'Nova apólice', icon: 'add_circle', rota: '/issm/apolices',     variant: 'primary' },
    { label: 'Sinistros',    icon: 'car_crash',  rota: '/issm/sinistros' },
    { label: 'Seguradoras',  icon: 'business',   rota: '/issm/seguradoras' },
  ],
  cards: [
    {
      titulo: 'Apólices', icon: 'description',
      linhas: [
        { key: 'emitidas',   label: 'Emitidas este mês', icon: 'add_circle' },
        { key: 'aExpirar',   label: 'A expirar (30d)',   icon: 'schedule',  destaque: 'negative' },
        { key: 'renovadas',  label: 'Renovadas',         icon: 'autorenew', destaque: 'positive' },
      ],
    },
    {
      titulo: 'Sinistros', icon: 'car_crash',
      linhas: [
        { key: 'abertos',    label: 'Abertos',     icon: 'error_outline', destaque: 'negative' },
        { key: 'resolvidos', label: 'Resolvidos',  icon: 'check_circle',  destaque: 'positive' },
        { key: 'valorMedio', label: 'Valor médio', icon: 'attach_money' },
      ],
    },
  ],
  tabelaTitulo: 'Por seguradora',
  tabelaColunas: ['Seguradora', 'Apólices', 'Sinistros', 'Activas', 'Taxa'],
  legendaTipo: 'generico',
}

// ============================================================
// PRM
// ============================================================
const PRM: DashboardConfig = {
  titulo: 'Painel PRM',
  subtitulo: 'Hotlist activa, abordagens policiais e alertas operacionais.',
  kpis: [
    { key: 'hotlist',    label: 'Hotlist activa',   variant: 'critico', icon: 'local_police',   clickable: true, rota: '/prm/hotlist' },
    { key: 'abordagens', label: 'Abordagens (12m)', variant: 'info',    icon: 'directions_car', clickable: true, rota: '/prm/abordagens' },
    { key: 'alertas',    label: 'Alertas abertos',  variant: 'atencao', icon: 'notifications',  clickable: true, rota: '/prm/alertas' },
    { key: 'perigoAlto', label: 'Perigo alto',      variant: 'critico', icon: 'dangerous',      clickable: true, rota: '/prm/hotlist?nivel=alto' },
  ],
  filtros: [
    { key: 'de',     label: 'De',     tipo: 'date' },
    { key: 'ate',    label: 'Até',    tipo: 'date' },
    { key: 'motivo', label: 'Motivo', tipo: 'select', opcoes: ['Todos', 'Furtado', 'Clonagem suspeita', 'Mandado de captura'] },
    { key: 'nivel',  label: 'Nível',  tipo: 'select', opcoes: ['Todos', 'Alto', 'Médio', 'Baixo'] },
  ],
  alertas: [
    { tipo: 'critico', titulo: '34 veículos em perigo alto', descricao: '72 furtados · 34 clonagem suspeita · 22 mandados de captura', rota: '/prm/hotlist?nivel=alto' },
  ],
  quickActions: [
    { label: 'Nova hotlist', icon: 'add_alert',      rota: '/prm/hotlist',    variant: 'primary' },
    { label: 'Ver mapa',     icon: 'map',            rota: '/prm/mapa' },
    { label: 'Abordagens',   icon: 'directions_car', rota: '/prm/abordagens' },
  ],
  cards: [
    {
      titulo: 'Hotlist', icon: 'local_police',
      action: { label: 'Ver tudo', rota: '/prm/hotlist' },
      linhas: [
        { key: 'furtados',   label: 'Furtados',          icon: 'car_crash',    destaque: 'negative' },
        { key: 'clonagem',   label: 'Clonagem suspeita', icon: 'content_copy', destaque: 'negative' },
        { key: 'mandados',   label: 'Mandados captura',  icon: 'gavel' },
      ],
    },
    {
      titulo: 'Abordagens (últimos 30d)', icon: 'directions_car',
      linhas: [
        { key: 'realizadas',     label: 'Realizadas',     icon: 'check_circle' },
        { key: 'comDetencao',    label: 'Com detenção',   icon: 'lock',        destaque: 'negative' },
        { key: 'semIncidentes',  label: 'Sem incidentes', icon: 'verified',    destaque: 'positive' },
      ],
    },
  ],
  tabelaTitulo: 'Hotlist por motivo',
  tabelaColunas: ['Motivo', 'Activos', 'Resolvidos', 'Tempo médio', 'Taxa'],
  legendaTipo: 'generico',
}

// ============================================================
// Mapa final + accessor
// ============================================================
export const DASHBOARDS: Record<string, DashboardConfig> = {
  chefe:   CHEFE,
  inatro:  INATRO,
  gestmul: GESTMUL,
  issm:    ISSM,
  prm:     PRM,
}

export function getDashboard(perfil: string): DashboardConfig | null {
  return DASHBOARDS[perfil] ?? null
}