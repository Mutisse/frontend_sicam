// src/services/issm/validacao.service.ts
import http from '@/boot/axios'

export type EstadoValidacao =
  | 'valida'
  | 'a-expirar'
  | 'expirada'
  | 'nao-encontrada'

export interface ResultadoValidacao {
  estado: EstadoValidacao
  icone: string
  titulo: string
  subtitulo: string
  matricula: string
  apolice: string
  seguradora: string
  tipo: string
  inicio: string
  fim: string
  diasRestantes?: number | undefined
  aviso?: string | undefined
  segurado?: string | undefined
  telefone?: string | undefined
  email?: string | undefined
}

export const validacaoService = {
  async consultar(matricula: string): Promise<ResultadoValidacao> {
    const { data } = await http.get<ResultadoValidacao>(
      `/api/issm/validacao/${encodeURIComponent(matricula)}`,
    )
    return data
  },
}