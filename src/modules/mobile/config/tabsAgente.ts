// ============================================================
// SICAM — Tabs do Agente (bottom navigation)
// ============================================================

export interface TabAgente {
  to: string
  label: string
  icon: string
  /** Rotas que também devem marcar esta tab como activa */
  rotasActivas?: string[]
}

export const TABS_AGENTE: TabAgente[] = [
  {
    to: '/agente/inicio',
    label: 'Início',
    icon: 'home',
  },
  {
    to: '/agente/consulta',
    label: 'Consultar',
    icon: 'search',
    rotasActivas: ['/agente/camera', '/agente/resultado'],
  },
  {
    to: '/agente/autos',
    label: 'Autos',
    icon: 'receipt_long',
  },
  {
    to: '/agente/historico',
    label: 'Histórico',
    icon: 'history',
  },
  {
    to: '/agente/perfil',
    label: 'Perfil',
    icon: 'person',
  },
]