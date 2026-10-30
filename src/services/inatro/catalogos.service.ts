// src/services/inatro/catalogos.service.ts
import http from '@/boot/axios'

export interface Catalogos {
  marcas: Record<string, string[]>
  cores: { categoria: string; cores: string[] }[]
  provincias: { codigo: string; nome: string }[]
}

export const catalogosService = {
  async obter(): Promise<Catalogos> {
    const { data } = await http.get<Catalogos>('/api/catalogos')
    return data
  },
}