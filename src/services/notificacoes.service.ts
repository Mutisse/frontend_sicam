// src/services/notificacoes.service.ts
import http from '@/boot/axios'

export interface Notificacao {
  id: number
  user_id: number
  titulo: string
  mensagem: string
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro'
  url?: string | null | undefined
  lida: boolean
  lida_em?: string | null | undefined
  created_at: string
  updated_at: string
}

export interface ContagemResposta {
  total: number
  nao_lidas: number
}

export const notificacoesService = {
  async listar(): Promise<Notificacao[]> {
    const { data } = await http.get<{ notificacoes: Notificacao[] }>(
      '/api/notificacoes',
    )
    return (data.notificacoes ?? []).map((n) => ({
      ...n,
      lida: Boolean(n.lida),
    }))
  },

  async contagem(): Promise<ContagemResposta> {
    const { data } = await http.get<ContagemResposta>(
      '/api/notificacoes/contagem',
    )
    return {
      total: data.total ?? 0,
      nao_lidas: data.nao_lidas ?? 0,
    }
  },

  async marcarLida(id: number): Promise<void> {
    await http.put(`/api/notificacoes/${id}/ler`)
  },

  async marcarTodasLidas(): Promise<void> {
    await http.put('/api/notificacoes/ler-todas')
  },

  async apagar(id: number): Promise<void> {
    await http.delete(`/api/notificacoes/${id}`)
  },
}