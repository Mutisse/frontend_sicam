// src/services/dashboard.service.ts
import http from "@/boot/axios";

// ============================================================
// Tipos — Dashboard Admin
// ============================================================
export interface DashboardKpi {
  key: string;
  label: string;
  valor: number;
  icon: string;
}

export interface VeiculoIntervencao {
  matricula: string;
  score: number;
  posto: string;
  provincia: string;
}

export interface AgentePatrulha {
  viatura: string;
  agente: string;
  local: string;
  online: boolean;
}

export interface DashboardAdmin {
  alertas: {
    sem_sincronizar: number;
    agentes_offline: number;
  };
  total_veiculos: number;
  kpis: DashboardKpi[];
  requer_intervencao: VeiculoIntervencao[];
  agentes: AgentePatrulha[];
  taxa: number;
}

// ============================================================
// Tipos — Dashboard Comum
// ============================================================
export interface DashboardComum {
  kpis: DashboardKpi[];
  total: number;
}

// ============================================================
// Tipos — Dashboard INATRO
// ============================================================
export interface InatroKpi {
  key: string;
  label: string;
  valor: number;
  total: number;
  variant: "r" | "y" | "g" | "n";
}

export interface InatroChartPonto {
  label: string;
  valor: number;
}

export interface InatroCard {
  titulo: string;
  linhas: { label: string; valor: string }[];
  valorGrande?: string;
  botao?: string;
}

export interface InatroTabelaLinha {
  celulas: string[];
}

export interface InatroDashboard {
  kpis: InatroKpi[];
  linha: InatroChartPonto[];
  barras: InatroChartPonto[];
  donut: { label: string; valor: number; cor: string }[];
  cards: InatroCard[];
  tabela: {
    titulo: string;
    colunas: string[];
    linhas: InatroTabelaLinha[];
  };
}

// ============================================================
// Tipos — ISSM
// ============================================================
export interface IssmApolice {
  id: string;
  seguradora: string;
  viatura: string;
  estado: "Activa" | "Expirada" | "Sinistro";
  validade: string;
}

export interface IssmDashboard {
  titulo: string;
  icon: string;
  apolices: IssmApolice[];
}

// ============================================================
// Tipos — PRM
// ============================================================
export interface PrmKpi {
  key: string;
  label: string;
  valor: number;
  total: number;
  variant: "r" | "y" | "g" | "n";
}

export interface PrmChartPonto {
  label: string;
  valor: number;
}

export interface PrmCard {
  titulo: string;
  linhas: { label: string; valor: string }[];
  valorGrande?: string;
  botao?: string;
}

export interface PrmTabelaLinha {
  celulas: string[];
}

export interface PrmDashboard {
  kpis: PrmKpi[];
  linha: PrmChartPonto[];
  barras: PrmChartPonto[];
  donut: { label: string; valor: number; cor: string }[];
  cards: PrmCard[];
  tabela: {
    titulo: string;
    colunas: string[];
    linhas: PrmTabelaLinha[];
  };
}

// ============================================================
// Tipos — GESTMUL
// ============================================================
export interface GestmulKpi {
  key: string;
  label: string;
  valor: number;
  total: number;
  variant: "r" | "y" | "g" | "n";
}

export interface GestmulChartPonto {
  label: string;
  valor: number;
}

export interface GestmulCard {
  titulo: string;
  linhas: { label: string; valor: string }[];
  valorGrande?: string;
  botao?: string;
}

export interface GestmulTabelaLinha {
  celulas: string[];
}

export interface GestmulDashboard {
  kpis: GestmulKpi[];
  linha: GestmulChartPonto[];
  barras: GestmulChartPonto[];
  donut: { label: string; valor: number; cor: string }[];
  cards: GestmulCard[];
  tabela: {
    titulo: string;
    colunas: string[];
    linhas: GestmulTabelaLinha[];
  };
}

// ============================================================
// Tipos — Chefe de Posto
// ============================================================
export interface ChefeKpi {
  key: string;
  label: string;
  valor: number;
  total: number;
  variant: "r" | "y" | "g" | "n";
}

export interface ChefeChartPonto {
  label: string;
  valor: number;
}

export interface ChefeCard {
  titulo: string;
  linhas: { label: string; valor: string }[];
  valorGrande?: string;
  botao?: string;
}

export interface ChefeTabelaLinha {
  celulas: string[];
}

export interface ChefeDashboard {
  kpis: ChefeKpi[];
  linha: ChefeChartPonto[];
  barras: ChefeChartPonto[];
  donut: { label: string; valor: number; cor: string }[];
  cards: ChefeCard[];
  tabela: {
    titulo: string;
    colunas: string[];
    linhas: ChefeTabelaLinha[];
  };
}

// ============================================================
// Serviço
// ============================================================
export const dashboardService = {
  // ─── Admin ───────────────────────────────────────────
  async admin(): Promise<DashboardAdmin> {
    const { data } = await http.get<DashboardAdmin>("/api/dashboard/admin");
    return data;
  },

  // ─── Comum (chefe, inatro, gestmul, issm, prm) ───────
  async comum(): Promise<DashboardComum> {
    const { data } = await http.get<DashboardComum>("/api/dashboard/comum");
    return data;
  },

  // ─── INATRO ──────────────────────────────────────────
  async inatro(): Promise<InatroDashboard> {
    const { data } = await http.get<InatroDashboard>("/api/dashboard/inatro");
    return data;
  },

  // ─── ISSM ────────────────────────────────────────────
  async issm(): Promise<IssmDashboard> {
    const { data } = await http.get<IssmDashboard>("/api/dashboard/issm");
    return data;
  },

  // ─── PRM ─────────────────────────────────────────────
  async prm(): Promise<PrmDashboard> {
    const { data } = await http.get<PrmDashboard>("/api/dashboard/prm");
    return data;
  },

  // ─── GESTMUL ─────────────────────────────────────────
  async gestmul(): Promise<GestmulDashboard> {
    const { data } = await http.get<GestmulDashboard>("/api/dashboard/gestmul");
    return data;
  },

  // ─── CHEFE ───────────────────────────────────────────
  async chefe(): Promise<ChefeDashboard> {
    const { data } = await http.get<ChefeDashboard>('/api/dashboard/chefe')
    return data
  },
};