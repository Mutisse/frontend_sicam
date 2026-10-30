// src/stores/portal/multas.store.ts
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type {
  Cidadao,
  Multa,
  EstadoMulta,
  RespostaConsulta,
  TotaisMultas,
} from '@/services/portal/cidadao.service'
import { usePortalInicioStore } from './inicio.store'

// ============================================================
// Constantes
// ============================================================
const STORAGE_CIDADAO = 'sicam.cidadao'
const STORAGE_NUMERO = 'sicam.numero-carta'

// ============================================================
// Tipos
// ============================================================
export type Metodo = 'mpesa' | 'transferencia' | 'multibanco'

export interface MetodoInfo {
  key: Metodo
  label: string
  icon: string
}

export interface Recibo {
  numero: string
  data: string
  hora: string
  multaCodigo: string
  matricula: string
  infracao: string
  metodo: string
  pagador: string
  referencia: string | undefined
  valor: string
}

// ============================================================
// Store
// ============================================================
export const usePortalMultasStore = defineStore('portalMultas', () => {
  // ----------------------------------------------------------
  // Referência ao store "dono"
  // ----------------------------------------------------------
  const inicio = usePortalInicioStore()

  // ----------------------------------------------------------
  // Estado da carta
  // ----------------------------------------------------------
  const cidadao = ref<Cidadao | null>(null)
  const numeroCarta = ref<string>('')
  const multas = ref<Multa[]>([])
  const totais = ref<TotaisMultas>({
    total: 0,
    pendentes: 0,
    pagas: 0,
    contestadas: 0,
  })

  const carregado = ref(false)
  const erro = ref<string | null>(null)

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroEstado = ref<'' | EstadoMulta>('')

  // ----------------------------------------------------------
  // Modais
  // ----------------------------------------------------------
  const modalDetalhes = ref(false)
  const modalPagamento = ref(false)
  const modalRecibo = ref(false)

  const multaSelecionada = ref<Multa | null>(null)
  const recibo = ref<Recibo | null>(null)

  // ----------------------------------------------------------
  // Pagamento
  // ----------------------------------------------------------
  const step = ref(1)
  const metodoSelecionado = ref<Metodo>('mpesa')
  const referencia = ref('')
  const nomePagador = ref('')
  const aProcessar = ref(false)

  const metodos: MetodoInfo[] = [
    { key: 'mpesa', label: 'M-Pesa', icon: 'smartphone' },
    { key: 'transferencia', label: 'Transferência', icon: 'account_balance' },
    { key: 'multibanco', label: 'Multibanco', icon: 'credit_card' },
  ]

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const filtrados = computed(() =>
    multas.value.filter((m) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !m.matricula.toLowerCase().includes(q) &&
          !m.codigo.toLowerCase().includes(q)
        )
          return false
      }
      if (filtroEstado.value && m.estado !== filtroEstado.value) return false
      return true
    }),
  )

  const filtrosEstado = computed(() => [
    { valor: '' as const, label: 'Todas', n: multas.value.length },
    {
      valor: 'Pendente' as const,
      label: 'Pendentes',
      n: multas.value.filter((m) => m.estado === 'Pendente').length,
    },
    {
      valor: 'Paga' as const,
      label: 'Pagas',
      n: multas.value.filter((m) => m.estado === 'Paga').length,
    },
    {
      valor: 'Contestada' as const,
      label: 'Contestadas',
      n: multas.value.filter((m) => m.estado === 'Contestada').length,
    },
  ])

  const iniciais = computed(() => {
    const nome = cidadao.value?.nome?.trim() ?? ''
    if (!nome) return '?'
    const partes = nome.split(/\s+/)
    const a = partes[0]?.[0] ?? ''
    const b = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : ''
    return (a + b).toUpperCase()
  })

  const podeAvancarStep2 = computed(() => {
    if (!nomePagador.value.trim()) return false
    if (
      metodoSelecionado.value === 'mpesa' ||
      metodoSelecionado.value === 'transferencia'
    ) {
      if (!referencia.value.trim()) return false
    }
    return true
  })

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function estadoClasse(estado: EstadoMulta): 'regular' | 'atencao' | 'critico' {
    if (estado === 'Paga') return 'regular'
    if (estado === 'Pendente') return 'atencao'
    return 'critico'
  }

  function iconeEstado(estado: EstadoMulta): string {
    if (estado === 'Paga') return 'check_circle'
    if (estado === 'Pendente') return 'hourglass_top'
    return 'gavel'
  }

  function labelMetodo(m: Metodo): string {
    return metodos.find((x) => x.key === m)?.label ?? m
  }

  function gerarRecibo(
    m: Multa,
    nomeCidadao: string,
    metodoLabel = 'Pagamento anterior',
  ): Recibo {
    const agora = new Date()
    return {
      numero: `RC-${agora.getFullYear()}-${String(
        Math.floor(Math.random() * 999999),
      ).padStart(6, '0')}`,
      data: agora.toLocaleDateString('pt-PT'),
      hora: agora.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      multaCodigo: m.codigo,
      matricula: m.matricula,
      infracao: m.infracao,
      metodo: metodoLabel,
      pagador: nomeCidadao || '—',
      referencia: undefined,
      valor: m.valor,
    }
  }

  // ----------------------------------------------------------
  // ⭐ Hidratar com dados do inicio.store
  // ----------------------------------------------------------
  function hidratar(dados: RespostaConsulta) {
    cidadao.value = dados.cidadao
    numeroCarta.value = dados.cidadao.numero
    multas.value = dados.multas
    totais.value = dados.totais
    carregado.value = true
    erro.value = null

    // Reset aos filtros e modais
    pesquisa.value = ''
    filtroEstado.value = ''
    multaSelecionada.value = null
    modalDetalhes.value = false
    modalPagamento.value = false
    step.value = 1
  }

  function limpar() {
    cidadao.value = null
    numeroCarta.value = ''
    multas.value = []
    totais.value = { total: 0, pendentes: 0, pagas: 0, contestadas: 0 }
    carregado.value = false
    erro.value = null
  }

  // ----------------------------------------------------------
  // ⭐ Sincronização automática com o inicio.store
  // ----------------------------------------------------------
  watch(
    () => inicio.ultimaConsulta,
    (dados) => {
      if (dados) {
        hidratar(dados)
      } else {
        limpar()
      }
    },
    { immediate: true },
  )

  // ----------------------------------------------------------
  // Fallback para refresh
  // ----------------------------------------------------------
  function carregarDaSessao(): boolean {
    if (inicio.ultimaConsulta) {
      hidratar(inicio.ultimaConsulta)
      return true
    }

    const ok = inicio.restaurar()
    if (ok && inicio.ultimaConsulta) {
      hidratar(inicio.ultimaConsulta)
      return true
    }

    // Último recurso: sessionStorage directo
    try {
      const raw = sessionStorage.getItem(STORAGE_CIDADAO)
      const num = sessionStorage.getItem(STORAGE_NUMERO)

      if (!raw || !num) {
        erro.value = 'Sem consulta activa.'
        carregado.value = true
        return false
      }

      const dados: RespostaConsulta = JSON.parse(raw)
      hidratar(dados)
      return true
    } catch {
      erro.value = 'Erro a ler os dados da sessão.'
      carregado.value = true
      return false
    }
  }

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  function abrirDetalhes(m: Multa) {
    multaSelecionada.value = m
    modalDetalhes.value = true
  }

  function abrirPagamento(nomeCidadao: string) {
    const multa = multaSelecionada.value
    if (!multa) return

    step.value = 1
    metodoSelecionado.value = 'mpesa'
    referencia.value = ''
    nomePagador.value = nomeCidadao ?? ''
    aProcessar.value = false

    modalDetalhes.value = false
    modalPagamento.value = true
  }

  function fecharPagamento() {
    modalPagamento.value = false
    step.value = 1
  }

  function marcarComoPaga(codigo: string) {
    const m = multas.value.find((x) => x.codigo === codigo)
    if (m) {
      m.estado = 'Paga'

      // Actualizar totais
      totais.value = {
        total: multas.value.length,
        pendentes: multas.value.filter((x) => x.estado === 'Pendente').length,
        pagas: multas.value.filter((x) => x.estado === 'Paga').length,
        contestadas: multas.value.filter((x) => x.estado === 'Contestada')
          .length,
      }

      // Actualizar sessionStorage + inicio.store (para sincronizar)
      try {
        const raw = sessionStorage.getItem(STORAGE_CIDADAO)
        if (raw) {
          const dados = JSON.parse(raw)
          dados.multas = multas.value
          dados.totais = totais.value
          sessionStorage.setItem(STORAGE_CIDADAO, JSON.stringify(dados))

          // Actualizar também o inicio.store
          if (inicio.ultimaConsulta) {
            inicio.ultimaConsulta.multas = multas.value
            inicio.ultimaConsulta.totais = totais.value
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  function limparFiltros() {
    pesquisa.value = ''
    filtroEstado.value = ''
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado
    cidadao,
    numeroCarta,
    multas,
    totais,
    carregado,
    erro,

    // filtros
    pesquisa,
    filtroEstado,
    filtrados,
    filtrosEstado,
    limparFiltros,

    // modais
    modalDetalhes,
    modalPagamento,
    modalRecibo,
    multaSelecionada,
    recibo,

    // pagamento
    step,
    metodoSelecionado,
    referencia,
    nomePagador,
    aProcessar,
    metodos,
    podeAvancarStep2,

    // helpers
    iniciais,
    estadoClasse,
    iconeEstado,
    labelMetodo,
    gerarRecibo,

    // acções
    carregarDaSessao,
    hidratar,
    limpar,
    abrirDetalhes,
    abrirPagamento,
    fecharPagamento,
    marcarComoPaga,
  }
})