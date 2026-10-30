// src/stores/agente/agente-fluxo.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  agenteInicioService,
  type VeiculoConsultado,
} from '@/services/agente/agente-inicio.service'
import {
  agenteConsultaService,
  type Entidade,
  type DetalheCompleto,
} from '@/services/agente/agente-consulta.service'
import {
  capturarDaCamera,
  lerMatriculaDeImagem,
  preProcessarImagem,
} from '@/services/agente/ocr.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type FaseFluxo = 'consulta' | 'camera' | 'resultado'

export interface AutoRecente {
  codigo: string
  matricula: string
  infracao: string
  valor: string
}

export interface HotlistItem {
  matricula: string
  motivo: string
  origem: string
  nivel: string
}

export interface VeiculoResultado {
  matricula: string
  tipo: string | null
  posto: string | null
  score: number | null
  entidades: Entidade[]
}

// ============================================================
// Helpers — só `score === null` é "sem-dados"
// ============================================================
function estadoDoScore(score: number | null): {
  key: 'regular' | 'atencao' | 'critico' | 'sem-dados'
  label: string
} {
  if (score === null) return { key: 'sem-dados', label: 'Sem dados' }
  if (score < 30) return { key: 'critico', label: 'Crítico' }
  if (score < 60) return { key: 'atencao', label: 'Atenção' }
  return { key: 'regular', label: 'Regular' }
}

function nivelDoScore(score: number | null): string {
  if (score === null) return '—'
  if (score < 30) return 'Abordagem obrigatória'
  if (score < 60) return 'Verificar documentação'
  return 'Sem intervenção necessária'
}

// ============================================================
// Store
// ============================================================
export const useAgenteFluxoStore = defineStore('agenteFluxo', () => {
  // ----------------------------------------------------------
  // Fase actual
  // ----------------------------------------------------------
  const fase = ref<FaseFluxo>('consulta')
  const carregado = ref(false)
  const aCarregar = ref(false)
  const erro = ref<string | null>(null)

  // ----------------------------------------------------------
  // Fase 1 — Dashboard
  // ----------------------------------------------------------
  const consultasHoje = ref(0)
  const autosHoje = ref(0)

  const recentes = ref<VeiculoConsultado[]>([])
  const autosRecentes = ref<AutoRecente[]>([])
  const hotlist = ref<HotlistItem[]>([])

  // ----------------------------------------------------------
  // Fase 3 — Resultado (básico)
  // ----------------------------------------------------------
  const online = ref(true)

  const veiculo = ref<VeiculoResultado>({
    matricula: '—',
    tipo: null,
    posto: null,
    score: null,
    entidades: [],
  })

  // ----------------------------------------------------------
  // Detalhe completo
  // ----------------------------------------------------------
  const detalhe = ref<DetalheCompleto | null>(null)
  const aCarregarDetalhe = ref(false)
  const erroDetalhe = ref<string | null>(null)

  // ----------------------------------------------------------
  // Carregar dashboard
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 400))

      const dados = await agenteInicioService.obter()

      consultasHoje.value = dados.kpis.consultas
      autosHoje.value = dados.kpis.autos
      recentes.value = dados.veiculos

      // Converte hotlist para o formato do template
      hotlist.value = dados.requerAtencao.map((h) => ({
        matricula: h.matricula,
        motivo: h.motivo,
        origem: 'PRM',
        nivel:
          h.perigo === 'alto'
            ? 'Alto'
            : h.perigo === 'medio'
              ? 'Médio'
              : 'Baixo',
      }))

      await atrasoMinimo
      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      carregado.value = true
    } finally {
      aCarregar.value = false
    }
  }

  // ----------------------------------------------------------
  // Getters de UI
  // ----------------------------------------------------------
  const estado = computed(() => estadoDoScore(veiculo.value.score))
  const intervencao = computed(() => nivelDoScore(veiculo.value.score))

  const variante = computed<'regular' | 'atencao' | 'critico' | 'sem-dados'>(
    () => estado.value.key,
  )

  const corScore = computed(() => {
    const key = estado.value.key
    if (key === 'critico') return 'var(--sicam-critical, #dc2626)'
    if (key === 'atencao') return 'var(--sicam-warning, #f59e0b)'
    if (key === 'regular') return 'var(--sicam-success, #059669)'
    return 'var(--sicam-neutral, #64748b)'
  })

  const entidades = computed(() => veiculo.value.entidades)

  // ----------------------------------------------------------
  // Helpers de UI
  // ----------------------------------------------------------
  function badgeVariant(
    score: number | null,
  ): 'regular' | 'atencao' | 'critico' | 'sem-dados' {
    return estadoDoScore(score).key
  }

  function nivelClasse(nivel: string): 'alto' | 'medio' | 'baixo' {
    const n = nivel.toLowerCase()
    if (n === 'alto') return 'alto'
    if (n === 'médio' || n === 'medio') return 'medio'
    return 'baixo'
  }

  // ----------------------------------------------------------
  // Consulta (básica)
  // ----------------------------------------------------------
  async function consultar(matricula: string): Promise<boolean> {
    if (!matricula) return false

    const m = matricula.toUpperCase().trim()

    try {
      aCarregar.value = true
      erro.value = null

      const r = await agenteConsultaService.consultar(m)

      veiculo.value = {
        matricula: r.matricula,
        tipo: r.tipo,
        posto: r.posto,
        score: r.score,
        entidades: r.entidades,
      }

      sessionStorage.setItem('sicam.matricula-atual', m)
      return r.encontrado
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    } finally {
      aCarregar.value = false
    }
  }

  // ----------------------------------------------------------
  // Consulta completa (detalhe)
  // ----------------------------------------------------------
  async function carregarDetalhe(matricula: string): Promise<boolean> {
    if (!matricula) return false

    const m = matricula.toUpperCase().trim()

    try {
      aCarregarDetalhe.value = true
      erroDetalhe.value = null
      detalhe.value = null

      const r = await agenteConsultaService.detalhe(m)

      if (!r.encontrado) {
        return false
      }

      detalhe.value = r
      return true
    } catch (e) {
      erroDetalhe.value = extrairErro(e)
      return false
    } finally {
      aCarregarDetalhe.value = false
    }
  }

  // ----------------------------------------------------------
  // Fase 2 — Câmara (REAL)
  // ----------------------------------------------------------
  async function capturar(): Promise<string | null> {
    try {
      // 1. Abre a câmara do dispositivo
      const ficheiro = await capturarDaCamera()
      if (!ficheiro) return null

      // 2. Pré-processa a imagem (contraste + escala)
      let imagemProcessada: Blob = ficheiro
      try {
        imagemProcessada = await preProcessarImagem(ficheiro)
      } catch {
        /* se falhar, usa a imagem original */
      }

      // 3. OCR para extrair a matrícula
      const matricula = await lerMatriculaDeImagem(imagemProcessada)

      if (!matricula) {
        return null
      }

      // 4. Consulta no backend
      await consultar(matricula)
      fase.value = 'resultado'
      return matricula
    } catch (e) {
      erro.value = extrairErro(e)
      return null
    }
  }

  // ----------------------------------------------------------
  // Escrita manual
  // ----------------------------------------------------------
  async function escreverManualmente(matricula: string) {
    if (!matricula) return
    await consultar(matricula)
    fase.value = 'resultado'
  }

  // ----------------------------------------------------------
  // Navegação
  // ----------------------------------------------------------
  function ver(matricula: string) {
    consultar(matricula).then(() => {
      fase.value = 'resultado'
    })
  }

  function irParaConsulta() {
    fase.value = 'consulta'
  }

  function irParaCamera() {
    fase.value = 'camera'
  }

  function reset() {
    fase.value = 'consulta'
    veiculo.value = {
      matricula: '—',
      tipo: null,
      posto: null,
      score: null,
      entidades: [],
    }
    detalhe.value = null
    erroDetalhe.value = null
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado
    fase,
    carregado,
    aCarregar,
    erro,

    // dashboard
    consultasHoje,
    autosHoje,
    recentes,
    autosRecentes,
    hotlist,

    // resultado (básico)
    online,
    veiculo,

    // detalhe completo
    detalhe,
    aCarregarDetalhe,
    erroDetalhe,
    carregarDetalhe,

    // getters
    estado,
    intervencao,
    variante,
    corScore,
    entidades,

    // helpers
    badgeVariant,
    nivelClasse,

    // acções
    carregar,
    consultar,
    capturar,
    escreverManualmente,
    ver,
    irParaConsulta,
    irParaCamera,
    reset,
  }
})