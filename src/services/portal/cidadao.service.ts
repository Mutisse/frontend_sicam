// src/services/portal/cidadao.service.ts
import http from '@/boot/axios'

export type EstadoMulta = 'Paga' | 'Pendente' | 'Contestada'

export interface Multa {
  codigo: string
  matricula: string
  infracao: string
  agente: string
  posto: string
  data: string
  valor: string
  estado: EstadoMulta
}

export interface Cidadao {
  numero: string
  nomes: string
  nome: string
  nif: string | null
  categoria: string
  categorias: string[]
  sexo: 'M' | 'F' | null
  nacionalidade: string
  dataNascimento: string | null
  dataEmissao: string | null
  dataValidade: string | null
  codigoCarta: string | null
  estado: 'Válida' | 'Expirada' | 'Suspensa' | 'Cancelada'
  diasParaExpirar: number | null
}

export interface TotaisMultas {
  total: number
  pendentes: number
  pagas: number
  contestadas: number
}

export interface RespostaConsulta {
  cidadao: Cidadao
  multas: Multa[]
  totais: TotaisMultas
}

export interface Noticia {
  id: string
  titulo: string
  resumo: string
  categoria: string
  autor: string | null
  data: string
  destaque: boolean
}

export const cidadaoService = {
  async consultarCarta(numero: string): Promise<RespostaConsulta> {
    const { data } = await http.get<RespostaConsulta>(
      `/api/portal/cartas/${encodeURIComponent(numero)}`,
    )
    return data
  },

  async listarNoticias(): Promise<{ items: Noticia[] }> {
    const { data } = await http.get<{ items: Noticia[] }>(
      '/api/portal/noticias',
    )
    return data
  },
}