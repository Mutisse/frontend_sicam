// src/services/agente/autos.service.ts
import http from '@/boot/axios'

export type EstadoAuto = 'Emitido' | 'Impresso' | 'Anulado'

export interface Infracao {
  codigo: string
  label: string
  valor: number
}

export interface AutoNoticia {
  id: string
  codigo: string
  matricula: string
  infracaoCodigo: string
  infracaoLabel: string
  valor: number
  local: string | null
  observacoes: string | null
  posto: string
  estado: EstadoAuto
  hora: string
  data: string
}

export interface ListaAutosResposta {
  items: AutoNoticia[]
  totalHoje: number
  infracoes: Infracao[]
}

export interface CriarAutoPayload {
  matricula: string
  infracao_codigo: string
  local?: string
  observacoes?: string
}

export interface CriarAutoResposta {
  auto: AutoNoticia
  texto: string
}

export const autosService = {
  async listar(): Promise<ListaAutosResposta> {
    const { data } = await http.get<ListaAutosResposta>('/api/agente/autos')
    return data
  },

  async criar(payload: CriarAutoPayload): Promise<CriarAutoResposta> {
    const { data } = await http.post<CriarAutoResposta>(
      '/api/agente/autos',
      payload,
    )
    return data
  },

  async imprimir(id: string): Promise<{ auto: AutoNoticia }> {
    const { data } = await http.put<{ auto: AutoNoticia }>(
      `/api/agente/autos/${id}/imprimir`,
    )
    return data
  },
}