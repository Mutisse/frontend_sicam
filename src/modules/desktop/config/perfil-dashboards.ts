// src/modules/desktop/config/perfil-dashboards.ts
import type { DashboardConfig } from './dashboards'

export const PERFIL_PAINEL: Record<string, string> = {
  admin:   '/admin/dashboard',
  chefe:   '/chefe/dashboard',
  inatro:  '/inatro/painel',
  gestmul: '/gestmul/painel',
  issm:    '/issm/painel',
  prm:     '/prm/painel',
}

export const PERFIL_DASHBOARD: Record<string, string> = {
  admin:   'admin',
  chefe:   'chefe',
  inatro:  'inatro',
  gestmul: 'gestmul',
  issm:    'issm',
  prm:     'prm',
}

export const DASHBOARDS_SUPORTADOS = [
  'admin',
  'chefe',
  'inatro',
  'gestmul',
  'issm',
  'prm',
] as const

export type DashboardKey = (typeof DASHBOARDS_SUPORTADOS)[number]

export function temDashboardConfig(perfil: string | null): perfil is DashboardKey {
  if (!perfil) return false
  return DASHBOARDS_SUPORTADOS.includes(perfil as DashboardKey)
}