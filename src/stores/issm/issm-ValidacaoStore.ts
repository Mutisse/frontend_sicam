// src/stores/issm/issm-ValidacaoStore.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  validacaoService,
  type ResultadoValidacao,
  type EstadoValidacao,
} from '@/services/issm/validacao.service'

// ============================================================
// Tipos
// ============================================================
export type { ResultadoValidacao, EstadoValidacao } from '@/services/issm/validacao.service'

export interface HistoricoItem {
  id: string
  matricula: string
  descricao: string
  estado: EstadoValidacao
  estadoLabel: string
  icone: string
  hora: string
  timestamp: number
  resultado: ResultadoValidacao
}

export interface DenunciaSemSeguro {
  matricula: string
  notas: string
  data: string
}

// ============================================================
// Store
// ============================================================
export const useIssmValidacaoStore = defineStore('issmValidacao', () => {
  // ----------------------------------------------------------
  // Exemplos (matrículas que existem na BD)
  // ----------------------------------------------------------
  const EXEMPLOS = [
    'AGL-482-MC',
    'ABR-771-MP',
    'AFC-205-MC',
    'ABX-556-MP',
  ]

  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const matricula = ref('')
  const aConsultar = ref(false)
  const resultado = ref<ResultadoValidacao | null>(null)

  // ----------------------------------------------------------
  // Histórico (persiste em localStorage)
  // ----------------------------------------------------------
  const STORAGE_KEY = 'issm-validacao-historico'
  const DENUNCIAS_KEY = 'issm-denuncias-sem-seguro'

  function carregarHistorico(): HistoricoItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as HistoricoItem[]
    } catch {
      return []
    }
  }

  const historico = ref<HistoricoItem[]>(carregarHistorico())

  function persistirHistorico() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historico.value))
    } catch {
      /* ignore */
    }
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function normalizar(m: string): string {
    return m.toUpperCase().trim().replace(/\s+/g, '')
  }

  function formatarHoraRelativa(timestamp: number): string {
    const diff = Date.now() - timestamp
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'agora'
    if (min < 60) return `há ${min} min`
    const h = Math.floor(min / 60)
    if (h < 24) return `há ${h} h`
    const d = Math.floor(h / 24)
    return `há ${d} d`
  }

  function parseData(d: string): Date {
    const [dia, mes, ano] = d.split('/').map(Number)
    return new Date(ano!, (mes ?? 1) - 1, dia)
  }

  function calcularDiasRestantes(fim: string): number {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const fimDate = parseData(fim)
    return Math.round((fimDate.getTime() - hoje.getTime()) / 86400000)
  }

  function calcularEstado(fim: string): EstadoValidacao {
    const dias = calcularDiasRestantes(fim)
    if (dias < 0) return 'expirada'
    if (dias <= 30) return 'a-expirar'
    return 'valida'
  }

  // ----------------------------------------------------------
  // KPIs do histórico
  // ----------------------------------------------------------
  const kpis = computed(() => {
    const h = historico.value
    return {
      total: h.length,
      validas: h.filter((x) => x.estado === 'valida').length,
      aExpirar: h.filter((x) => x.estado === 'a-expirar').length,
      expiradas: h.filter((x) => x.estado === 'expirada').length,
    }
  })

  // ----------------------------------------------------------
  // Consulta — via backend
  // ----------------------------------------------------------
  async function consultar(matriculaOverride?: string): Promise<ResultadoValidacao> {
    const m = normalizar(matriculaOverride ?? matricula.value)
    if (!m) throw new Error('Matrícula vazia')

    aConsultar.value = true
    resultado.value = null

    try {
      // atraso mínimo para UX (skeleton)
      const atraso = new Promise((r) => setTimeout(r, 600))

      const r = await validacaoService.consultar(m)

      await atraso

      resultado.value = r
      registarHistorico(r)
      return r
    } finally {
      aConsultar.value = false
    }
  }

  // ----------------------------------------------------------
  // Histórico
  // ----------------------------------------------------------
  function registarHistorico(r: ResultadoValidacao) {
    const estadoLabel =
      r.estado === 'valida'
        ? 'Válida'
        : r.estado === 'a-expirar'
        ? 'A expirar'
        : r.estado === 'expirada'
        ? 'Expirada'
        : 'Não encontrada'

    const descricao =
      r.estado === 'nao-encontrada'
        ? 'Sem seguro registado'
        : `${r.seguradora} · ${r.tipo}`

    // evitar duplicados consecutivos
    const primeiro = historico.value[0]
    if (
      primeiro &&
      primeiro.matricula === r.matricula &&
      primeiro.estado === r.estado &&
      Date.now() - primeiro.timestamp < 60_000
    ) {
      primeiro.timestamp = Date.now()
      primeiro.hora = 'agora'
      persistirHistorico()
      return
    }

    historico.value.unshift({
      id: `${r.matricula}-${Date.now()}`,
      matricula: r.matricula,
      descricao,
      estado: r.estado,
      estadoLabel,
      icone: r.icone,
      hora: 'agora',
      timestamp: Date.now(),
      resultado: r,
    })

    if (historico.value.length > 20) historico.value.pop()
    persistirHistorico()
  }

  function limparHistorico() {
    historico.value = []
    persistirHistorico()
  }

  function removerDoHistorico(id: string) {
    historico.value = historico.value.filter((x) => x.id !== id)
    persistirHistorico()
  }

  function revalidarItem(item: HistoricoItem) {
    matricula.value = item.matricula
    consultar(item.matricula)
  }

  // ----------------------------------------------------------
  // Reset
  // ----------------------------------------------------------
  function limpar() {
    matricula.value = ''
    resultado.value = null
  }

  // ----------------------------------------------------------
  // Comprovativo
  // ----------------------------------------------------------
  function gerarComprovativo(): string {
    if (!resultado.value) return ''
    const r = resultado.value
    const linhas: string[] = [
      'SICAM — ISSM — Comprovativo de Validação de Seguro',
      `Gerado em: ${new Date().toLocaleString('pt-PT')}`,
      '--------------------------------------------',
      `Matrícula:    ${r.matricula}`,
      `Nº Apólice:   ${r.apolice}`,
      `Seguradora:   ${r.seguradora}`,
      `Tipo:         ${r.tipo}`,
      `Início:       ${r.inicio}`,
      `Fim:          ${r.fim}`,
      `Estado:       ${r.titulo}`,
    ]

    if (r.segurado) linhas.push(`Segurado:     ${r.segurado}`)
    if (r.telefone) linhas.push(`Telefone:     ${r.telefone}`)
    if (r.email) linhas.push(`Email:        ${r.email}`)

    linhas.push('--------------------------------------------')
    if (r.aviso) linhas.push(r.aviso)

    return linhas.join('\n')
  }

  function descarregarComprovativo(): boolean {
    const txt = gerarComprovativo()
    if (!txt) return false
    const blob = new Blob(['\uFEFF' + txt], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comprovativo-${resultado.value?.matricula}-${new Date()
      .toISOString()
      .slice(0, 10)}.txt`
    link.click()
    URL.revokeObjectURL(url)
    return true
  }

  function copiarComprovativo(): Promise<boolean> {
    const txt = gerarComprovativo()
    if (!txt) return Promise.resolve(false)
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(txt).then(() => true).catch(() => false)
    }
    return Promise.resolve(false)
  }

  // ----------------------------------------------------------
  // Renovação (local — só para demo)
  // ----------------------------------------------------------
  function renovarApolice(matriculaAlvo: string): boolean {
    const m = normalizar(matriculaAlvo)
    if (!m) return false

    // Atualiza apenas o resultado local
    if (resultado.value?.matricula === m) {
      const r = resultado.value
      const hoje = new Date()
      const novoFim = new Date(hoje)
      novoFim.setFullYear(hoje.getFullYear() + 1)

      const fmt = (d: Date) =>
        `${String(d.getDate()).padStart(2, '0')}/${String(
          d.getMonth() + 1,
        ).padStart(2, '0')}/${d.getFullYear()}`

      resultado.value = {
        ...r,
        estado: 'valida',
        icone: 'verified_user',
        titulo: 'Seguro válido',
        subtitulo: `Válido até ${fmt(novoFim)}`,
        inicio: fmt(hoje),
        fim: fmt(novoFim),
        diasRestantes: 365,
        aviso: 'Apólice renovada por 1 ano.',
        apolice: `AP-${novoFim.getFullYear()}-${String(
          Math.floor(Math.random() * 999999),
        ).padStart(6, '0')}`,
      }

      registarHistorico(resultado.value)
    }

    return true
  }

  // ----------------------------------------------------------
  // Denúncia (local)
  // ----------------------------------------------------------
  function denunciarSemSeguro(matriculaAlvo: string, notas?: string): boolean {
    const m = normalizar(matriculaAlvo)
    if (!m) return false

    try {
      const raw = localStorage.getItem(DENUNCIAS_KEY)
      const lista: DenunciaSemSeguro[] = raw
        ? (JSON.parse(raw) as DenunciaSemSeguro[])
        : []
      lista.unshift({
        matricula: m,
        notas: notas ?? '',
        data: new Date().toISOString(),
      })
      localStorage.setItem(DENUNCIAS_KEY, JSON.stringify(lista))
    } catch {
      /* ignore */
    }
    return true
  }

  function listarDenuncias(): DenunciaSemSeguro[] {
    try {
      const raw = localStorage.getItem(DENUNCIAS_KEY)
      return raw ? (JSON.parse(raw) as DenunciaSemSeguro[]) : []
    } catch {
      return []
    }
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // dados
    EXEMPLOS,

    // estado
    matricula,
    aConsultar,
    resultado,

    // histórico
    historico,
    kpis,
    limparHistorico,
    removerDoHistorico,
    revalidarItem,

    // acções
    consultar,
    limpar,
    gerarComprovativo,
    descarregarComprovativo,
    copiarComprovativo,
    renovarApolice,
    denunciarSemSeguro,
    listarDenuncias,

    // helpers
    formatarHoraRelativa,
    calcularDiasRestantes,
    calcularEstado,
  }
})