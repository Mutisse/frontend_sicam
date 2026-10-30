import type {
  Veiculo,
  Posto,
  Dispositivo,
  Patrulha,
  AutoNoticia,
  AlertaClonagem,
  Utilizador,
  Integracao,
  RegistoAuditoria,
} from "../../css/design/palette";

// ============================================================
// SICAM — Dados fictícios (temporários até ligar à API)
// ============================================================

// ------------------------------------------------------------
// Veículos
// ------------------------------------------------------------
export const VEICULOS_FICTICIOS: Veiculo[] = [
  {
    matricula: "AGL-482-MC",
    tipo: "Ligeiro",
    provincia: "Maputo Cidade",
    posto: "Posto Baixa",
    score: 22,
    ultimaConsulta: "22/09 23:07",
  },
  {
    matricula: "ABR-771-MP",
    tipo: "Pesado",
    provincia: "Maputo Província",
    posto: "Posto Matola",
    score: 31,
    ultimaConsulta: "22/09 18:07",
  },
  {
    matricula: "AFC-205-MC",
    tipo: "Ligeiro",
    provincia: "Maputo Cidade",
    posto: "Posto KaMpfumo",
    score: 36,
    ultimaConsulta: "22/09 20:07",
  },
  {
    matricula: "ACD-918-MP",
    tipo: "Ligeiro",
    provincia: "Maputo Província",
    posto: "Posto Machava",
    score: 41,
    ultimaConsulta: "22/09 22:07",
  },
  {
    matricula: "AHN-304-MC",
    tipo: "Pesado",
    provincia: "Maputo Cidade",
    posto: "Posto Baixa",
    score: 44,
    ultimaConsulta: "22/09 19:07",
  },
  {
    matricula: "ABX-556-MP",
    tipo: "Ligeiro",
    provincia: "Maputo Província",
    posto: "Posto Namaacha",
    score: 48,
    ultimaConsulta: "23/09 02:07",
  },
  {
    matricula: "AJK-120-MC",
    tipo: "Ligeiro",
    provincia: "Maputo Cidade",
    posto: "Posto KaMpfumo",
    score: 58,
    ultimaConsulta: "23/09 00:07",
  },
  {
    matricula: "ADT-873-MP",
    tipo: "Pesado",
    provincia: "Maputo Província",
    posto: "Posto Matola",
    score: 63,
    ultimaConsulta: "20/09 17:07",
  },
  {
    matricula: "AEF-649-MC",
    tipo: "Ligeiro",
    provincia: "Maputo Cidade",
    posto: "Posto Baixa",
    score: 74,
    ultimaConsulta: "23/09 02:07",
  },
  {
    matricula: "AGH-231-MP",
    tipo: "Ligeiro",
    provincia: "Maputo Província",
    posto: "Posto Machava",
    score: 82,
    ultimaConsulta: "22/09 21:07",
  },
  {
    matricula: "ALM-507-MC",
    tipo: "Ligeiro",
    provincia: "Maputo Cidade",
    posto: "Posto KaMpfumo",
    score: 91,
    ultimaConsulta: "22/09 19:07",
  },
  {
    matricula: "AKP-412-MP",
    tipo: "Pesado",
    provincia: "Maputo Província",
    posto: "Posto Namaacha",
    score: null,
    ultimaConsulta: "19/09 08:07",
  },
];

// ------------------------------------------------------------
// Postos
// ------------------------------------------------------------
export const POSTOS_FICTICIOS: Posto[] = [
  {
    codigo: "P-BAIXA",
    nome: "Posto Baixa",
    provincia: "Maputo Cidade",
    agentes: 14,
    criticos: 3,
    cor: "#2563eb",
  },
  {
    codigo: "P-KAMP",
    nome: "Posto KaMpfumo",
    provincia: "Maputo Cidade",
    agentes: 12,
    criticos: 2,
    cor: "#0d9488",
  },
  {
    codigo: "P-MATOLA",
    nome: "Posto Matola",
    provincia: "Maputo Província",
    agentes: 16,
    criticos: 3,
    cor: "#7c3aed",
  },
  {
    codigo: "P-MACH",
    nome: "Posto Machava",
    provincia: "Maputo Província",
    agentes: 10,
    criticos: 1,
    cor: "#b45309",
  },
  {
    codigo: "P-NAMA",
    nome: "Posto Namaacha (EN4)",
    provincia: "Maputo Província",
    agentes: 8,
    criticos: 0,
    cor: "#db2777",
  },
];

// ------------------------------------------------------------
// Dispositivos
// ------------------------------------------------------------
export const DISPOSITIVOS_FICTICIOS: Dispositivo[] = [
  {
    serie: "SN-AGT-001",
    agente: "Agente Chissano",
    estado: "Ativo",
    bateria: 93,
    ultimaSincronizacao: "22/09 17:07",
  },
  {
    serie: "SN-AGT-002",
    agente: "Agente Nhaca",
    estado: "Ativo",
    bateria: 94,
    ultimaSincronizacao: "23/09 01:07",
  },
  {
    serie: "SN-AGT-004",
    agente: "Agente Sitoe",
    estado: "Ativo",
    bateria: 95,
    ultimaSincronizacao: "22/09 19:07",
  },
  {
    serie: "SN-AGT-005",
    agente: "—",
    estado: "Por registar",
    bateria: 96,
    ultimaSincronizacao: "Nunca",
  },
  {
    serie: "SN-AGT-007",
    agente: "Agente Cumbe",
    estado: "Ativo",
    bateria: 97,
    ultimaSincronizacao: "21/09 00:07",
  },
  {
    serie: "SN-AGT-008",
    agente: "Agente Bila",
    estado: "Ativo",
    bateria: 98,
    ultimaSincronizacao: "22/09 17:07",
  },
  {
    serie: "SN-AGT-010",
    agente: "—",
    estado: "Por registar",
    bateria: 99,
    ultimaSincronizacao: "Nunca",
  },
  {
    serie: "SN-AGT-011",
    agente: "Agente Tembe",
    estado: "Ativo",
    bateria: 60,
    ultimaSincronizacao: "22/09 21:07",
  },
  {
    serie: "SN-CHF-001",
    agente: "Chefe Mabunda",
    estado: "Ativo",
    bateria: 73,
    ultimaSincronizacao: "22/09 22:07",
  },
  {
    serie: "SN-CHF-002",
    agente: "Chefe Zandamela",
    estado: "Ativo",
    bateria: 74,
    ultimaSincronizacao: "23/09 02:07",
  },
];

// ------------------------------------------------------------
// Patrulhas
// ------------------------------------------------------------
export const PATRULHAS_FICTICIAS: Patrulha[] = [
  {
    codigo: "PT-26-00008",
    nome: "Patrulha EN4 manhã",
    data: "23 Set 2026",
    agente: "Agente Sitoe",
    viatura: "MAP-4412",
    progresso: "4/10",
    estado: "Cancelada",
  },
  {
    codigo: "PT-26-00010",
    nome: "Ronda Baixa — teste",
    data: "23 Set 2026",
    agente: "—",
    viatura: "—",
    progresso: "0/5",
    estado: "Concluída",
  },
  {
    codigo: "PT-26-00007",
    nome: "Patrulha Matola manhã",
    data: "22 Set 2026",
    agente: "Agente Nhaca",
    viatura: "MAP-4413",
    progresso: "0/10",
    estado: "Planeada",
  },
  {
    codigo: "PT-26-00009",
    nome: "Controlo Machava",
    data: "22 Set 2026",
    agente: "Agente Chissano",
    viatura: "MAP-2290",
    progresso: "1/8",
    estado: "Concluída",
  },
  {
    codigo: "PT-26-00006",
    nome: "Patrulha KaMpfumo",
    data: "21 Set 2026",
    agente: "Agente Cumbe",
    viatura: "MAP-7781",
    progresso: "9/10",
    estado: "Concluída",
  },
  {
    codigo: "PT-26-00005",
    nome: "Patrulha Baixa manhã",
    data: "20 Set 2026",
    agente: "Agente Nhaca",
    viatura: "MAP-2290",
    progresso: "9/10",
    estado: "Concluída",
  },
  {
    codigo: "PT-26-00004",
    nome: "Patrulha EN4 tarde",
    data: "19 Set 2026",
    agente: "Agente Sitoe",
    viatura: "MAP-4412",
    progresso: "9/10",
    estado: "Concluída",
  },
  {
    codigo: "PT-26-00003",
    nome: "Controlo Matola",
    data: "18 Set 2026",
    agente: "Agente Nhaca",
    viatura: "MAP-4413",
    progresso: "9/10",
    estado: "Concluída",
  },
  {
    codigo: "PT-26-00001",
    nome: "Patrulha Baixa tarde",
    data: "16 Set 2026",
    agente: "Agente Nhaca",
    viatura: "MAP-2290",
    progresso: "9/10",
    estado: "Concluída",
  },
];

// ------------------------------------------------------------
// Autos de Notícia
// ------------------------------------------------------------
export const AUTOS_FICTICIOS: AutoNoticia[] = [
  {
    codigo: "AN-26-00046",
    matricula: "AGL-482-MC",
    infracao: "Seguro expirado",
    agente: "Agente Chissano",
    data: "22 Set 2026",
    estado: "Emitido",
  },
  {
    codigo: "AN-26-00045",
    matricula: "ABR-771-MP",
    infracao: "Inspeção em atraso",
    agente: "Agente Nhaca",
    data: "22 Set 2026",
    estado: "Impresso",
  },
  {
    codigo: "AN-26-00044",
    matricula: "AFC-205-MC",
    infracao: "Excesso de velocidade",
    agente: "Agente Sitoe",
    data: "21 Set 2026",
    estado: "Contestado",
  },
  {
    codigo: "AN-26-00043",
    matricula: "ACD-918-MP",
    infracao: "Documentos em falta",
    agente: "Agente Cumbe",
    data: "20 Set 2026",
    estado: "Pago",
  },
];

// ------------------------------------------------------------
// Alertas de Clonagem
// ------------------------------------------------------------
export const CLONAGEM_FICTICIA: AlertaClonagem[] = [
  {
    matricula: "AGL-482-MC",
    registoINATRO: "Toyota Hilux · Branco",
    observado: "Nissan NP300 · Cinzento",
    confianca: "96%",
    posto: "Posto Baixa",
    estado: "Aberto",
  },
  {
    matricula: "ABX-556-MP",
    registoINATRO: "Toyota Corolla · Prata",
    observado: "Toyota Corolla · Preto",
    confianca: "88%",
    posto: "Posto Namaacha",
    estado: "Aberto",
  },
  {
    matricula: "AJK-120-MC",
    registoINATRO: "Mazda 3 · Azul",
    observado: "Honda Fit · Azul",
    confianca: "81%",
    posto: "Posto KaMpfumo",
    estado: "Em análise",
  },
  {
    matricula: "ADT-873-MP",
    registoINATRO: "Isuzu D-Max · Branco",
    observado: "Isuzu D-Max · Branco",
    confianca: "—",
    posto: "Posto Matola",
    estado: "Descartado",
  },
];

// ------------------------------------------------------------
// Utilizadores
// ------------------------------------------------------------
export const UTILIZADORES_FICTICIOS: Utilizador[] = [
  {
    nome: "Agente Chissano",
    email: "chissano@sicam.gov.mz",
    perfil: "agente",
    posto: "Posto Baixa",
    estado: "Ativo",
    ultimoAcesso: "23/09 02:07",
  },
  {
    nome: "Agente Nhaca",
    email: "nhaca@sicam.gov.mz",
    perfil: "agente",
    posto: "Posto Matola",
    estado: "Ativo",
    ultimoAcesso: "22/09 22:07",
  },
  {
    nome: "Chefe Mabunda",
    email: "mabunda@sicam.gov.mz",
    perfil: "chefe",
    posto: "Posto Baixa",
    estado: "Ativo",
    ultimoAcesso: "23/09 01:07",
  },
  {
    nome: "Administrador",
    email: "admin@sicam.gov.mz",
    perfil: "admin",
    posto: "—",
    estado: "Ativo",
    ultimoAcesso: "23/09 02:30",
  },
  {
    nome: "Agente Bila",
    email: "bila@sicam.gov.mz",
    perfil: "agente",
    posto: "Posto Machava",
    estado: "Bloqueado",
    ultimoAcesso: "10/09 08:07",
  },
];

// ------------------------------------------------------------
// Integrações
// ------------------------------------------------------------
export const INTEGRACOES_FICTICIAS: Integracao[] = [
  {
    nome: "INATRO",
    descricao: "Registo, matrícula e inspeção",
    estado: "regular",
    latencia: 118,
    ultimaResposta: "há 2 min",
  },
  {
    nome: "PRM",
    descricao: "Fiscalização e Hotlist",
    estado: "regular",
    latencia: 64,
    ultimaResposta: "há 1 min",
  },
  {
    nome: "Gestão de Multas",
    descricao: "Infrações e cobranças",
    estado: "atencao",
    latencia: 412,
    ultimaResposta: "há 9 min",
  },
  {
    nome: "ISSM / Seguradoras",
    descricao: "Seguro obrigatório",
    estado: "regular",
    latencia: 187,
    ultimaResposta: "há 4 min",
  },
];

// ------------------------------------------------------------
// Auditoria
// ------------------------------------------------------------
export const AUDITORIA_FICTICIA: RegistoAuditoria[] = [
  {
    dataHora: "23/09 02:07",
    agente: "Agente Chissano",
    acao: "Consulta",
    matricula: "AGL-482-MC",
    localizacao: "Baixa, Maputo",
    resultado: "Crítico",
  },
  {
    dataHora: "23/09 01:52",
    agente: "Chefe Mabunda",
    acao: "Dados sensíveis",
    matricula: "AGL-482-MC",
    localizacao: "Posto Baixa",
    resultado: "Autorizado",
  },
  {
    dataHora: "22/09 23:07",
    agente: "Agente Sitoe",
    acao: "Consulta",
    matricula: "AFC-205-MC",
    localizacao: "EN4 — Namaacha",
    resultado: "Atenção",
  },
  {
    dataHora: "22/09 22:31",
    agente: "Agente Nhaca",
    acao: "Auto de Notícia",
    matricula: "ABR-771-MP",
    localizacao: "Matola",
    resultado: "Emitido",
  },
  {
    dataHora: "22/09 21:10",
    agente: "Agente Bila",
    acao: "Consulta",
    matricula: "AKP-412-MP",
    localizacao: "Machava",
    resultado: "Parcial",
  },
];

// ------------------------------------------------------------
// Hotlist (veículos procurados)
// ------------------------------------------------------------
export interface HotlistItem {
  matricula: string;
  motivo: string;
  origem: string;
  inseridoEm: string;
  estado: "Ativo" | "Resolvido";
}

export const HOTLIST_FICTICIA: HotlistItem[] = [
  {
    matricula: "AGL-482-MC",
    motivo: "Clonagem suspeita",
    origem: "PRM",
    inseridoEm: "20/09/2026",
    estado: "Ativo",
  },
  {
    matricula: "AEK-017-MP",
    motivo: "Furtado",
    origem: "PRM",
    inseridoEm: "18/09/2026",
    estado: "Ativo",
  },
  {
    matricula: "AHT-662-MC",
    motivo: "Mandado de captura",
    origem: "PRM",
    inseridoEm: "12/09/2026",
    estado: "Ativo",
  },
  {
    matricula: "ABM-390-GZ",
    motivo: "Furtado",
    origem: "INATRO",
    inseridoEm: "03/09/2026",
    estado: "Resolvido",
  },
];

// ------------------------------------------------------------
// Helpers para simular latência de rede
// ------------------------------------------------------------
export function delay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
