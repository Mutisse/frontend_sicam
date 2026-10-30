// src/services/admin/backups.service.ts
import http from '@/boot/axios'

export type TipoBackup = 'Automático' | 'Manual'
export type EstadoBackup = 'Concluído' | 'Em curso' | 'Falhou'
export type OrigemBackup = 'Base de dados' | 'Ficheiros' | 'Completo'
export type Periodicidade = 'Diário' | 'Semanal' | 'Mensal' | 'Nunca'

export interface Backup {
  id: string
  codigo: string
  ficheiro: string
  tipo: TipoBackup
  origem: OrigemBackup
  tamanho: string
  estado: EstadoBackup
  autor: string
  duracao: string
  criadoEm: string
}

export interface TipoBackupConfig {
  key: OrigemBackup
  label: string
  descricao: string
  icon: string
  extensao: string
  prefixo: string
  tamanhoAprox: string
  periodicidade: Periodicidade
  horaExecucao: string
  ativo: boolean
}

export interface BackupsKpis {
  total: number
  ultimo: string
  tamanho: number
  falhas: number
}

export interface RespostaBackups {
  items: Backup[]
  tipos: TipoBackupConfig[]
  kpis: BackupsKpis
}

export interface CriarBackupPayload {
  origem: OrigemBackup
  tipo?: TipoBackup | undefined
}

export interface ActualizarTipoPayload {
  ativo?: boolean | undefined
  periodicidade?: Periodicidade | undefined
  horaExecucao?: string | undefined
}

export const backupsService = {
  async listar(): Promise<RespostaBackups> {
    const { data } = await http.get<RespostaBackups>('/api/admin/backups')
    return data
  },

  async criar(
    payload: CriarBackupPayload,
  ): Promise<{ backup: Backup; kpis: BackupsKpis }> {
    const { data } = await http.post<{ backup: Backup; kpis: BackupsKpis }>(
      '/api/admin/backups',
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean; kpis: BackupsKpis }> {
    const { data } = await http.delete<{ ok: boolean; kpis: BackupsKpis }>(
      `/api/admin/backups/${id}`,
    )
    return data
  },

  async restaurar(
    id: string,
  ): Promise<{ ok: boolean; backup: Backup; mensagem: string }> {
    const { data } = await http.put<{
      ok: boolean
      backup: Backup
      mensagem: string
    }>(`/api/admin/backups/${id}/restaurar`)
    return data
  },

  async descarregar(id: string, nomeFicheiro: string): Promise<void> {
    const { data } = await http.get(`/api/admin/backups/${id}/download`, {
      responseType: 'blob',
    })

    const url = URL.createObjectURL(data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nomeFicheiro
    a.click()
    URL.revokeObjectURL(url)
  },

  async actualizarTipo(
    key: string,
    payload: ActualizarTipoPayload,
  ): Promise<{ ok: boolean }> {
    const { data } = await http.put<{ ok: boolean }>(
      `/api/admin/backups/tipos/${encodeURIComponent(key)}`,
      payload,
    )
    return data
  },
}