// src/services/agente/agente-consulta.service.ts
import http from '@/boot/axios'

// ============================================================
// Tipos — consulta básica
// ============================================================
export interface Entidade {
  nome: string
  descricao: string
  ok: boolean
  okTexto: string
  erroTexto: string
}

export interface ResultadoConsulta {
  matricula: string
  encontrado: boolean
  score: number | null
  tipo: string | null
  posto: string | null
  entidades: Entidade[]
}

// ============================================================
// Tipos — consulta completa
// ============================================================
export interface VeiculoDetalhe {
  id: string
  matricula: string
  marca: string
  modelo: string
  ano: number | null
  cor: string
  chassis: string
  combustivel: string
  tipo: string
  provincia: string
  score: number
  estado: string
}

export interface ProprietarioDetalhe {
  nome: string
  numeroId: string
  contacto: string
  email: string
}

export interface Inspecao {
  codigo: string
  data: string
  validade: string
  proxima: string
  resultado: string
  estado: string
  inspetor: string
  observacoes: string | null
  valida: boolean
}

export interface Apolice {
  numero: string
  seguradora: string
  tipo: string
  inicio: string
  validade: string
  premio: number
  estado: string
  valida: boolean
  observacoes: string | null
}

export interface Multa {
  numero: string
  infracao: string
  valor: number
  data: string
  dataPagamento: string | null
  estado: string
  provincia: string | null
}

export interface MultasDetalhe {
  pendentes: number
  pagas: number
  total: number
  valorTotal: number
  valorPendente: number
  lista: Multa[]
}

export interface HotlistDetalhe {
  activo: boolean
  motivo: string
  perigo: string
  prioridade: string
  posto: string
  zona: string
  descricao: string
  detectadoEm: string
  estado: string
}

export interface EntidadeResumo {
  nome: string
  ok: boolean
  texto: string
  detalhe: string
}

export interface ResumoDetalhe {
  score: number
  estado: string
  entidades: EntidadeResumo[]
}

export interface DetalheCompleto {
  encontrado: boolean
  veiculo: VeiculoDetalhe
  proprietario: ProprietarioDetalhe
  inspecoes: Inspecao[]
  apolices: Apolice[]
  multas: MultasDetalhe
  hotlist: HotlistDetalhe | null
  resumo: ResumoDetalhe
}

// ============================================================
// Service
// ============================================================
export const agenteConsultaService = {
  async consultar(matricula: string): Promise<ResultadoConsulta> {
    const { data } = await http.get<ResultadoConsulta>(
      `/api/agente/consulta/${encodeURIComponent(matricula)}`,
    )
    return data
  },

  async detalhe(matricula: string): Promise<DetalheCompleto> {
    const { data } = await http.get<DetalheCompleto>(
      `/api/agente/consulta/${encodeURIComponent(matricula)}/detalhe`,
    )
    return data
  },
}