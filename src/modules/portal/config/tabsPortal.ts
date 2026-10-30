// ============================================================
// SICAM — Portal do Cidadão (menu topo)
// ============================================================

export interface TabPortal {
  to: string
  label: string
  icon: string
  /** Se true → só aparece no menu depois de o cidadão consultar */
  requerConsulta?: boolean
}

export const TABS_PORTAL: TabPortal[] = [
  { to: '/cidadao/portal',     label: 'Início',         icon: 'home' },
  { to: '/cidadao/multas',     label: 'Minhas Multas',  icon: 'receipt_long', requerConsulta: true },
  { to: '/cidadao/noticias',   label: 'Notícias',       icon: 'newspaper' },
  { to: '/cidadao/faq',        label: 'Leis & FAQ',     icon: 'gavel' },
  { to: '/cidadao/assistente', label: 'Assistente',     icon: 'chat' },
]