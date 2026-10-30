// src/services/abordagens.service.ts
import http from "@/boot/axios";

export type ResultadoAbordagem = "Sem incidentes" | "Com detenção" | "Em curso";

export interface Abordagem {
  id: string;
  codigo: string;
  dataHora: string;
  matricula: string;
  agente: string;
  posto: string;
  local: string;
  resultado: ResultadoAbordagem;
  emHotlist: boolean;
  observacoes?: string | null;
  diasAtras: number;
  lat: number;
  lng: number;
}

export interface AbordagensKpis {
  total: number;
  semIncidentes: number;
  comDetencao: number;
  emCurso: number;
  hotlist: number;
}

export interface RespostaAbordagens {
  items: Abordagem[];
  kpis: AbordagensKpis;
}

export interface CriarAbordagemPayload {
  matricula: string;
  agente: string;
  posto: string;
  local: string;
  resultado: ResultadoAbordagem;
  observacoes?: string | null;
}

export const abordagensService = {
  async listar(): Promise<RespostaAbordagens> {
    const { data } = await http.get<RespostaAbordagens>("/api/abordagens");
    return data;
  },

  async criar(
    payload: CriarAbordagemPayload,
  ): Promise<{ id: string; kpis: AbordagensKpis }> {
    const { data } = await http.post<{ id: string; kpis: AbordagensKpis }>(
      "/api/abordagens",
      payload,
    );
    return data;
  },

  async remover(id: string): Promise<void> {
    await http.delete(`/api/abordagens/${id}`);
  },
};
