// src/stores/agente/agente-multa.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// ============================================================
// Tipos
// ============================================================
export interface Infracao {
  codigo: string
  label: string
  valor: number
}

export interface AutoAplicado {
  codigo: string
  matricula: string
  infracao: string
  valor: string
  chapa: string
  data: string
}

// ============================================================
// Tabela de infracções
// ============================================================
export const INFRACOES: Infracao[] = [
  { codigo: 'EXCESSO_VELOCIDADE', label: 'Excesso de velocidade', valor: 3500 },
  { codigo: 'SEGURO_EXPIRADO',    label: 'Seguro expirado',       valor: 2800 },
  { codigo: 'INSPECAO_ATRASO',    label: 'Inspecção em atraso',   valor: 2200 },
  { codigo: 'DOCUMENTOS_FALTA',   label: 'Documentos em falta',   valor: 1800 },
]

// ============================================================
// Helpers
// ============================================================
function formatarMT(valor: number): string {
  return `${valor.toLocaleString('pt-MZ')} MT`
}

function gerarCodigoAuto(): string {
  const ano = String(new Date().getFullYear()).slice(-2)
  const seq = String(Math.floor(Math.random() * 900000) + 100000)
  return `MT-${ano}-${seq}`
}

function agora(): string {
  const d = new Date()
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${dia}/${mes} ${h}:${m}`
}

// ============================================================
// Store
// ============================================================
export const useAgenteMultaStore = defineStore('agenteMulta', () => {
  // ----------------------------------------------------------
  // Dados do veículo (vêm da consulta anterior)
  // ----------------------------------------------------------
  const matricula = ref('')
  const proprietario = ref('')
  const postoActual = ref('Posto Baixa')

  // ----------------------------------------------------------
  // Formulário
  // ----------------------------------------------------------
  const infracaoSelecionada = ref('')
  const chapa = ref('')
  const observacoes = ref('')

  // ----------------------------------------------------------
  // Estado de submissão
  // ----------------------------------------------------------
  const aAplicar = ref(false)
  const mostrarSucesso = ref(false)
  const autoAplicado = ref<AutoAplicado | null>(null)

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const valorFormatado = computed(() => {
    if (!infracaoSelecionada.value) return '—'
    const inf = INFRACOES.find((i) => i.codigo === infracaoSelecionada.value)
    return inf ? formatarMT(inf.valor) : '—'
  })

  const podeAplicar = computed(
    () => infracaoSelecionada.value.length > 0 && chapa.value.length > 0,
  )

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  function carregarDadosVeiculo(opts: {
    matricula?: string | undefined
    proprietario?: string | undefined
    posto?: string | undefined
  }) {
    matricula.value =
      opts.matricula ||
      sessionStorage.getItem('sicam.matricula-atual') ||
      '—'

    proprietario.value =
      opts.proprietario ||
      sessionStorage.getItem('sicam.proprietario-atual') ||
      'João da Silva'

    postoActual.value =
      opts.posto ||
      sessionStorage.getItem('sicam.posto-atual') ||
      'Posto Baixa'
  }

  async function aplicarMulta(
    agenteNome: string,
  ): Promise<AutoAplicado | null> {
    if (!podeAplicar.value || aAplicar.value) return null

    aAplicar.value = true

    try {
      // simulação de chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const inf = INFRACOES.find(
        (i) => i.codigo === infracaoSelecionada.value,
      )!

      const auto: AutoAplicado = {
        codigo: gerarCodigoAuto(),
        matricula: matricula.value,
        infracao: inf.label,
        valor: formatarMT(inf.valor),
        chapa: chapa.value,
        data: agora(),
      }

      autoAplicado.value = auto

      // histórico em sessão
      try {
        const historico = JSON.parse(
          sessionStorage.getItem('sicam.autos') || '[]',
        )
        historico.unshift(auto)
        sessionStorage.setItem('sicam.autos', JSON.stringify(historico))
      } catch {
        /* sem storage */
      }

      mostrarSucesso.value = true
      return auto
    } finally {
      aAplicar.value = false
    }
  }

  function fecharSucesso() {
    mostrarSucesso.value = false
    autoAplicado.value = null
  }

  function reset() {
    infracaoSelecionada.value = ''
    chapa.value = ''
    observacoes.value = ''
    autoAplicado.value = null
    mostrarSucesso.value = false
  }

  function gerarConteudoAuto(agenteNome: string): string {
    if (!autoAplicado.value) return ''
    const a = autoAplicado.value

    return `
=====================================================
        SICAM — OLHO DE ÁGUIA
        AUTO DE NOTÍCIA / MULTA
=====================================================

Código do auto:  ${a.codigo}
Data/Hora:       ${a.data}

--- VEÍCULO ----------------------------------------
Matrícula:       ${a.matricula}
Nº chapa:        ${a.chapa}

--- INFRAÇÃO ---------------------------------------
Tipo:            ${a.infracao}
Valor:           ${a.valor}

--- AGENTE -----------------------------------------
Nome:            Agente ${agenteNome}
Posto:           ${postoActual.value}

=====================================================
Documento gerado automaticamente pelo SICAM.
Todos os acessos ficam registados.
=====================================================
`.trim()
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estrutura
    INFRACOES,

    // dados do veículo
    matricula,
    proprietario,
    postoActual,

    // formulário
    infracaoSelecionada,
    chapa,
    observacoes,

    // estado
    aAplicar,
    mostrarSucesso,
    autoAplicado,

    // getters
    valorFormatado,
    podeAplicar,

    // acções
    carregarDadosVeiculo,
    aplicarMulta,
    fecharSucesso,
    reset,
    gerarConteudoAuto,

    // helpers expostos
    formatarMT,
  }
})