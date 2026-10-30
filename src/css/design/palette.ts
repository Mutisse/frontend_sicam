// ============================================================
// SICAM — Paleta em TypeScript
// ============================================================

export const palette = {
  // Institucional
  primaryDark:   '#064e3b',
  primary:       '#065f46',
  primaryLight:  '#059669',
  primarySoft:   '#10b981',
  primaryBg:     '#d1fae5',
  primaryBgAlt:  '#ecfdf5',

  // Estado (score)
  critical:      '#dc2626',
  criticalInk:   '#b91c1c',
  criticalBg:    '#fde8e8',
  warning:       '#d99a06',
  warningInk:    '#a16207',
  warningBg:     '#fef3c7',
  success:       '#16a34a',
  successInk:    '#15803d',
  successBg:     '#dcfce7',
  neutral:       '#6b7280',
  neutralInk:    '#4b5563',
  neutralBg:     '#f3f4f6',

  // Superfícies
  bg:            '#f4f7f5',
  surface:       '#ffffff',
  surfaceAlt:    '#fafafa',
  surfaceHover:  '#f3f4f6',

  // Texto
  ink:           '#111827',
  inkSoft:       '#374151',
  muted:         '#6b7280',
  line:          '#e5e7eb',
  lineSoft:      '#f0f1f2',
  lineStrong:    '#d1d5db',

  // Especiais
  ocean:         '#bcd9ea',
  mapBg:         '#e8efe9',
  logoYellow:    '#facc15',

  // Perfis
  role: {
    agente:    '#6b7280',
    chefe:     '#d99a06',
    admin:     '#dc2626',
    inatro:    '#2563eb',
    gestmul:   '#7c3aed',
    issm:      '#16a34a',
    prm:       '#065f46',
    cidadao:   '#6b7280',
  },

  // Postos (mapa)
  posto: {
    baixa:    '#2563eb',
    kampfumo: '#0d9488',
    matola:   '#7c3aed',
    machava:  '#b45309',
    namaacha: '#db2777',
  },
} as const

// ============================================================
// HELPERS DE ESTADO (score)
// ============================================================

export type EstadoScore = 'critico' | 'atencao' | 'regular' | 'sem-dados'

export interface EstadoInfo {
  key: EstadoScore
  label: string
  cor: string
  corInk: string
  corBg: string
  intervencao: string
}

export function estadoDoScore(score: number | null | undefined): EstadoInfo {
  if (score === null || score === undefined) {
    return {
      key: 'sem-dados',
      label: 'Sem dados',
      cor: palette.neutral,
      corInk: palette.neutralInk,
      corBg: palette.neutralBg,
      intervencao: 'Sem dados',
    }
  }
  if (score < 50) {
    return {
      key: 'critico',
      label: 'Crítico',
      cor: palette.critical,
      corInk: palette.criticalInk,
      corBg: palette.criticalBg,
      intervencao: 'Retenção imediata',
    }
  }
  if (score < 70) {
    return {
      key: 'atencao',
      label: 'Atenção',
      cor: palette.warning,
      corInk: palette.warningInk,
      corBg: palette.warningBg,
      intervencao: 'Fiscalização profunda',
    }
  }
  return {
    key: 'regular',
    label: 'Regular',
    cor: palette.success,
    corInk: palette.successInk,
    corBg: palette.successBg,
    intervencao: 'Abordagem simples',
  }
}

/**
 * Texto do nível de intervenção sugerido (usado no mobile do agente)
 * — igual ao `niv()` do HTML
 */
export function nivelDoScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'Consulta parcial'
  if (score < 50) return 'Retenção imediata'
  if (score < 70) return 'Fiscalização profunda'
  return 'Abordagem simples'
}

// ============================================================
// HELPERS DE PERFIS
// ============================================================

export type Perfil =
  | 'agente'
  | 'chefe'
  | 'admin'
  | 'inatro'
  | 'gestmul'
  | 'issm'
  | 'prm'
  | 'cidadao'

export const PERFIL_LABEL: Record<Perfil, string> = {
  agente:  'Agente de Trânsito',
  chefe:   'Chefe de Posto',
  admin:   'Administrador',
  inatro:  'INATRO',
  gestmul: 'GESTMUL',
  issm:    'ISSM',
  prm:     'PRM',
  cidadao: 'Cidadão',
}

export function corDoPerfil(perfil: Perfil): string {
  return palette.role[perfil]
}

// ============================================================
// TIPOS DE DOMÍNIO SICAM
// ============================================================

// ------------------------------------------------------------
// Veículos (completo — desktop / admin / entidades)
// ------------------------------------------------------------
export interface Veiculo {
  matricula: string
  tipo: 'Ligeiro' | 'Pesado'
  provincia: string
  posto: string
  score: number | null
  ultimaConsulta: string
  marca?: string
  modelo?: string
  cor?: string
}

// ------------------------------------------------------------
// Veículo simples (usado pelo agente no mobile)
// — só os campos que o agente vê no telemóvel
// ------------------------------------------------------------
export interface VeiculoSimples {
  matricula: string
  tipo: 'Ligeiro' | 'Pesado'
  posto: string
  score: number | null
  ultima: string
}

// ------------------------------------------------------------
// Postos
// ------------------------------------------------------------
export interface Posto {
  codigo: string
  nome: string
  provincia: string
  agentes: number
  criticos: number
  cor: string
}

// ------------------------------------------------------------
// Dispositivos
// ------------------------------------------------------------
export interface Dispositivo {
  serie: string
  agente: string
  estado: 'Ativo' | 'Por registar'
  bateria: number
  ultimaSincronizacao: string
}

// ------------------------------------------------------------
// Patrulhas
// ------------------------------------------------------------
export interface Patrulha {
  codigo: string
  nome: string
  data: string
  agente: string
  viatura: string
  progresso: string
  estado: 'Planeada' | 'Em curso' | 'Concluída' | 'Cancelada'
}

// ------------------------------------------------------------
// Auto de Notícia
// ------------------------------------------------------------
export interface AutoNoticia {
  codigo: string
  matricula: string
  infracao: string
  agente: string
  data: string
  estado: 'Emitido' | 'Impresso' | 'Pago' | 'Contestado'
}

// ------------------------------------------------------------
// Alerta de Clonagem
// ------------------------------------------------------------
export interface AlertaClonagem {
  matricula: string
  registoINATRO: string
  observado: string
  confianca: string
  posto: string
  estado: 'Aberto' | 'Em análise' | 'Descartado'
}

// ------------------------------------------------------------
// Utilizadores
// ------------------------------------------------------------
export interface Utilizador {
  nome: string
  email: string
  perfil: Perfil
  posto: string
  estado: 'Ativo' | 'Bloqueado'
  ultimoAcesso: string
}

// ------------------------------------------------------------
// Integrações
// ------------------------------------------------------------
export interface Integracao {
  nome: string
  descricao: string
  estado: 'regular' | 'atencao' | 'critico'
  latencia: number
  ultimaResposta: string
}

// ------------------------------------------------------------
// Registo de Auditoria
// ------------------------------------------------------------
export interface RegistoAuditoria {
  dataHora: string
  agente: string
  acao: string
  matricula: string
  localizacao: string
  resultado: 'Regular' | 'Atenção' | 'Crítico' | 'Autorizado' | 'Emitido' | 'Parcial'
}

// ------------------------------------------------------------
// Registo de Auditoria (usado no agente)
// ------------------------------------------------------------
export interface ConsultaHistorico {
  matricula: string
  posto: string
  ultima: string
  score: number | null
}



