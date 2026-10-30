// src/stores/gestmul/gestmul-ExportacaoStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import {
  exportacaoService,
  type FormatoExportacao,
  type TipoExportacao,
  type ExportacaoRecente,
} from '@/services/gestmul/exportacao.service'
import { multasService } from '@/services/gestmul/multas.service'
import { pagamentosService } from '@/services/gestmul/pagamentos.service'
import { contestacoesService } from '@/services/gestmul/contestacoes.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export interface TipoOpcao {
  key: TipoExportacao
  label: string
  descricao: string
  icon: string
}

export interface FormatoOpcao {
  key: FormatoExportacao
  label: string
  extensao: string
  icon: string
}

export interface OpcoesExportacao {
  incluirCabecalho: boolean
  incluirResumo: boolean
  apenasActivos: boolean
}

// ============================================================
// Store
// ============================================================
export const useGestmulExportacaoStore = defineStore('gestmulExportacao', () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const TIPOS: TipoOpcao[] = [
    {
      key: 'multas',
      label: 'Multas',
      descricao: 'Todas as multas registadas',
      icon: 'receipt_long',
    },
    {
      key: 'pagamentos',
      label: 'Pagamentos',
      descricao: 'Recibos e pagamentos',
      icon: 'payments',
    },
    {
      key: 'contestacoes',
      label: 'Contestações',
      descricao: 'Contestações submetidas',
      icon: 'gavel',
    },
    {
      key: 'veiculos',
      label: 'Veículos',
      descricao: 'Base de veículos registados',
      icon: 'directions_car',
    },
    {
      key: 'apolices',
      label: 'Apólices',
      descricao: 'Apólices de seguro',
      icon: 'shield',
    },
  ]

  const FORMATOS: FormatoOpcao[] = [
    { key: 'csv',  label: 'CSV',   extensao: 'csv',  icon: 'description' },
    { key: 'xlsx', label: 'Excel', extensao: 'xlsx', icon: 'grid_on' },
    { key: 'pdf',  label: 'PDF',   extensao: 'pdf',  icon: 'picture_as_pdf' },
    { key: 'json', label: 'JSON',  extensao: 'json', icon: 'code' },
  ]

  const PROVINCIAS = [
    'Todas',
    'Maputo Cidade',
    'Maputo Província',
    'Gaza',
    'Inhambane',
    'Sofala',
    'Manica',
    'Tete',
    'Zambézia',
    'Nampula',
    'Cabo Delgado',
    'Niassa',
  ]

  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const tipoSelecionado = ref<TipoExportacao>('multas')
  const formatoSelecionado = ref<FormatoExportacao>('csv')
  const filtroProvincia = ref('Todas')
  const dataDe = ref('')
  const dataAte = ref('')

  const opcoes = reactive<OpcoesExportacao>({
    incluirCabecalho: true,
    incluirResumo: true,
    apenasActivos: false,
  })

  const aProcessar = ref(false)
  const aCarregarHistorico = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const exportacoesRecentes = ref<ExportacaoRecente[]>([])

  // ----------------------------------------------------------
  // Computed
  // ----------------------------------------------------------
  const tipoAtual = computed(
    () => TIPOS.find((t) => t.key === tipoSelecionado.value) ?? TIPOS[0]!,
  )

  const formatoAtual = computed(
    () => FORMATOS.find((f) => f.key === formatoSelecionado.value) ?? FORMATOS[0]!,
  )

  const temPeriodo = computed(() => !!(dataDe.value && dataAte.value))

  // Total de registos (estimativa para UX — o real vem do backend na exportação)
  const totalRegistos = computed(() => {
    // Se já tiver um histórico recente do mesmo tipo, usa esse valor
    const ultima = exportacoesRecentes.value.find(
      (e) => e.tipo === tipoSelecionado.value,
    )
    if (ultima) return ultima.totalRegistos

    // Caso contrário, valor padrão por tipo
    switch (tipoSelecionado.value) {
      case 'multas':       return 40
      case 'pagamentos':   return 10
      case 'contestacoes': return 6
      case 'veiculos':     return 11
      case 'apolices':     return 11
      default:             return 0
    }
  })

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function formatarTamanho(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function iconeFormato(formato: FormatoExportacao | string): string {
    const f = FORMATOS.find((x) => x.key === formato)
    return f?.icon ?? 'description'
  }

  function formatarInputData(d: Date): string {
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    return `${d.getFullYear()}-${mes}-${dia}`
  }

  // ----------------------------------------------------------
  // Períodos rápidos
  // ----------------------------------------------------------
  function definirPeriodo(p: '7d' | '30d' | '90d' | 'ano') {
    const hoje = new Date()
    const de = new Date(hoje)

    if (p === '7d') de.setDate(hoje.getDate() - 7)
    else if (p === '30d') de.setDate(hoje.getDate() - 30)
    else if (p === '90d') de.setDate(hoje.getDate() - 90)
    else if (p === 'ano') de.setFullYear(hoje.getFullYear() - 1)

    dataDe.value = formatarInputData(de)
    dataAte.value = formatarInputData(hoje)
  }

  function limparPeriodo() {
    dataDe.value = ''
    dataAte.value = ''
  }

  // ----------------------------------------------------------
  // Carregar histórico
  // ----------------------------------------------------------
  async function carregarHistorico() {
    if (aCarregarHistorico.value) return
    aCarregarHistorico.value = true
    erro.value = null

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 400))

      const dados = await exportacaoService.listar()

      exportacoesRecentes.value = dados.items.map((e) => ({
        id: e.id,
        codigo: e.codigo,
        tipo: e.tipo,
        formato: e.formato as FormatoExportacao,
        titulo: e.titulo,
        detalhe: e.detalhe ?? '',
        data: e.criadoEm,
        tamanho: formatarTamanho(e.tamanho_bytes),
        tamanhoBytes: e.tamanho_bytes,
        totalRegistos: e.total_registos,
        criadoPor: e.criadoPor,
      }))

      await atrasoMinimo
      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
      carregado.value = true
    } finally {
      aCarregarHistorico.value = false
    }
  }

  // ----------------------------------------------------------
  // Buscar dados conforme o tipo
  // ----------------------------------------------------------
  async function buscarDados(): Promise<{
    cabecalhos: string[]
    linhas: (string | number)[][]
    resumo: Record<string, string | number>
  }> {
    switch (tipoSelecionado.value) {
      case 'multas': {
        const dados = await multasService.listar()
        const itens = filtroProvincia.value === 'Todas'
          ? dados.items
          : dados.items.filter((m) => m.provincia === filtroProvincia.value)

        return {
          cabecalhos: [
            'Código', 'Matrícula', 'Infração', 'Agente',
            'Província', 'Data', 'Valor (MT)', 'Estado',
          ],
          linhas: itens.map((m) => [
            m.codigo,
            m.matricula,
            m.infracao,
            m.agente,
            m.provincia,
            m.data,
            m.valor,
            m.estado,
          ]),
          resumo: {
            Total: itens.length,
            Emitidas: itens.length,
            Pagas: itens.filter((m) => m.estado === 'Paga').length,
            Pendentes: itens.filter((m) => m.estado === 'Pendente').length,
            Contestadas: itens.filter((m) => m.estado === 'Contestada').length,
          },
        }
      }

      case 'pagamentos': {
        const dados = await pagamentosService.listar()
        const itens = dados.items

        return {
          cabecalhos: [
            'Recibo', 'Matrícula', 'Multa', 'Método',
            'Data', 'Valor (MT)', 'Pagador', 'Estado',
          ],
          linhas: itens.map((p) => [
            p.recibo,
            p.matricula,
            p.multaCodigo,
            p.metodo,
            p.data,
            p.valor,
            p.pagador,
            p.estado,
          ]),
          resumo: {
            Total: itens.length,
            Confirmados: itens.filter((p) => p.estado === 'Confirmado').length,
            Pendentes: itens.filter((p) => p.estado === 'Pendente').length,
          },
        }
      }

      case 'contestacoes': {
        const dados = await contestacoesService.listar()
        const itens = dados.items

        return {
          cabecalhos: [
            'Nº Contestação', 'Multa', 'Matrícula', 'Contestante',
            'NIF', 'Motivo', 'Prioridade', 'Data', 'Estado',
          ],
          linhas: itens.map((c) => [
            c.numero,
            c.multaCodigo,
            c.matricula,
            c.contestante,
            c.nif,
            c.motivo,
            c.prioridade,
            c.dataSubmissao,
            c.estado,
          ]),
          resumo: {
            Total: itens.length,
            Pendentes: itens.filter((c) => c.estado === 'Pendente').length,
            Aceites: itens.filter((c) => c.estado === 'Aceite').length,
            Rejeitadas: itens.filter((c) => c.estado === 'Rejeitada').length,
          },
        }
      }

      case 'veiculos': {
        // Não há endpoint directo de veículos — usamos multas para extrair matrículas únicas
        const dados = await multasService.listar()
        const matriculasUnicas = new Set<string>()
        const linhas: (string | number)[][] = []

        for (const m of dados.items) {
          if (!m.matricula || matriculasUnicas.has(m.matricula)) continue
          matriculasUnicas.add(m.matricula)

          linhas.push([
            m.matricula,
            m.marca ?? '—',
            m.modelo ?? '—',
            m.proprietario ?? '—',
            m.provincia ?? '—',
          ])
        }

        return {
          cabecalhos: ['Matrícula', 'Marca', 'Modelo', 'Proprietário', 'Província'],
          linhas,
          resumo: { Total: linhas.length },
        }
      }

      case 'apolices': {
        // Usa o endpoint de relatórios ISSM (já existe)
        const { default: http } = await import('@/boot/axios')
        const { data } = await http.get('/api/relatorios/issm')
        const itens = (data.desempenhoPorSeguradora ?? []) as Array<Record<string, unknown>>

        return {
          cabecalhos: ['Seguradora', 'Apólices', 'Sinistros', 'Taxa', 'Valor médio', 'Estado'],
          linhas: itens.map((s) => [
            String(s.nome ?? ''),
            Number(s.apolices ?? 0),
            Number(s.sinistros ?? 0),
            `${s.taxa ?? 0}%`,
            String(s.valorMedio ?? ''),
            String(s.estadoLabel ?? ''),
          ]),
          resumo: { Total: itens.length },
        }
      }

      default:
        return { cabecalhos: [], linhas: [], resumo: {} }
    }
  }

  // ----------------------------------------------------------
  // Exportar (núcleo)
  // ----------------------------------------------------------
  async function exportar(): Promise<boolean> {
    if (aProcessar.value) return false
    aProcessar.value = true
    erro.value = null

    try {
      // 1. Buscar dados
      const { cabecalhos, linhas, resumo } = await buscarDados()

      // 2. Gerar ficheiro conforme o formato
      const formato = formatoSelecionado.value
      let blob: Blob
      let nomeFicheiro: string

      const hoje = new Date().toISOString().slice(0, 10)
      const baseNome = `gestmul-${tipoSelecionado.value}-${hoje}`

      if (formato === 'csv') {
        const csvLinhas: string[][] = []

        if (opcoes.incluirCabecalho) {
          csvLinhas.push([`SICAM — GESTMUL — ${tipoAtual.value.label}`])
          csvLinhas.push([`Gerado em: ${new Date().toLocaleString('pt-PT')}`])
          if (temPeriodo.value) {
            csvLinhas.push([`Período: ${dataDe.value} a ${dataAte.value}`])
          }
          if (filtroProvincia.value !== 'Todas') {
            csvLinhas.push([`Província: ${filtroProvincia.value}`])
          }
          csvLinhas.push([])
        }

        if (opcoes.incluirResumo) {
          csvLinhas.push(['RESUMO'])
          for (const [k, v] of Object.entries(resumo)) {
            csvLinhas.push([k, String(v)])
          }
          csvLinhas.push([])
        }

        csvLinhas.push(cabecalhos)
        for (const l of linhas) csvLinhas.push(l.map((c) => String(c)))

        const csv = csvLinhas
          .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
          .join('\n')

        blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        nomeFicheiro = `${baseNome}.csv`
      } else if (formato === 'json') {
        const payload = {
          tipo: tipoSelecionado.value,
          geradoEm: new Date().toISOString(),
          periodo: temPeriodo.value ? { de: dataDe.value, ate: dataAte.value } : null,
          provincia: filtroProvincia.value,
          resumo,
          cabecalhos,
          linhas,
        }

        blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: 'application/json',
        })
        nomeFicheiro = `${baseNome}.json`
      } else if (formato === 'xlsx') {
        blob = await exportacaoService.gerarXlsx({
          titulo: `${tipoAtual.value.label} — Exportação`,
          cabecalhos,
          linhas,
          resumo: opcoes.incluirResumo ? resumo : {},
        })
        nomeFicheiro = `${baseNome}.xlsx`
      } else {
        blob = await exportacaoService.gerarPdf({
          titulo: `${tipoAtual.value.label} — Exportação`,
          subtitulo: temPeriodo.value
            ? `Período: ${dataDe.value} a ${dataAte.value}`
            : 'Todo o histórico',
          cabecalhos,
          linhas,
          resumo: opcoes.incluirResumo ? resumo : {},
        })
        nomeFicheiro = `${baseNome}.pdf`
      }

      // 3. Download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomeFicheiro
      a.click()
      URL.revokeObjectURL(url)

      // 4. Registar metadata
      await exportacaoService.registar({
        tipo: tipoSelecionado.value,
        formato: formatoSelecionado.value,
        titulo: `${tipoAtual.value.label} — Exportação`,
        detalhe: temPeriodo.value
          ? `${linhas.length} registos · ${dataDe.value} a ${dataAte.value}`
          : filtroProvincia.value !== 'Todas'
          ? `${linhas.length} registos · ${filtroProvincia.value}`
          : `${linhas.length} registos · Todo o histórico`,
        data_de: dataDe.value || null,
        data_ate: dataAte.value || null,
        incluir_cabecalho: opcoes.incluirCabecalho,
        incluir_resumo: opcoes.incluirResumo,
        apenas_ativos: opcoes.apenasActivos,
        total_registos: linhas.length,
        tamanho_bytes: blob.size,
      })

      // 5. Recarregar histórico
      await carregarHistorico()

      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    } finally {
      aProcessar.value = false
    }
  }

  // ----------------------------------------------------------
  // Remover do histórico
  // ----------------------------------------------------------
  async function removerExportacao(id: string): Promise<boolean> {
    try {
      await exportacaoService.remover(id)
      exportacoesRecentes.value = exportacoesRecentes.value.filter(
        (e) => e.id !== id,
      )
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Devolver tudo
  // ----------------------------------------------------------
  return {
    TIPOS,
    FORMATOS,
    PROVINCIAS,

    tipoSelecionado,
    formatoSelecionado,
    filtroProvincia,
    dataDe,
    dataAte,
    opcoes,

    tipoAtual,
    formatoAtual,
    temPeriodo,
    totalRegistos,

    aProcessar,
    aCarregarHistorico,
    carregado,
    erro,
    exportacoesRecentes,

    definirPeriodo,
    limparPeriodo,
    carregarHistorico,
    exportar,
    removerExportacao,

    iconeFormato,
    formatarTamanho,
  }
})