// src/stores/inatro/inatro-ExportacaoStore.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import {
  exportacoesService,
  type Exportacao,
  type TipoExportacao,
  type FormatoExportacao,
  type CriarExportacaoPayload,
  type GerarFicheiroPayload,
} from '@/services/inatro/exportacoes.service'
import { veiculosService } from '@/services/inatro/veiculos.service'
import { inspecoesService } from '@/services/inatro/inspecoes.service'
import { agendamentosService } from '@/services/inatro/agendamentos.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type PresetPeriodo = '7d' | '30d' | 'mes' | 'ano'

export type { Exportacao, TipoExportacao, FormatoExportacao }

export interface OpcoesExportacao {
  incluirCabecalho: boolean
  incluirResumo: boolean
  apenasAtivos: boolean
}

// ============================================================
// Store
// ============================================================
export const useInatroExportacaoStore = defineStore('inatroExportacao', () => {
  // ----------------------------------------------------------
  // Opções de tipo
  // ----------------------------------------------------------
  const TIPOS = [
    { key: 'veiculos'     as const, label: 'Veículos',     descricao: 'Registo completo',     icon: 'directions_car' },
    { key: 'inspecoes'    as const, label: 'Inspeções',    descricao: 'Histórico técnico',    icon: 'build' },
    { key: 'agendamentos' as const, label: 'Agendamentos', descricao: 'Marcações e estados',  icon: 'event' },
    { key: 'completo'     as const, label: 'Completo',     descricao: 'Todos os dados',       icon: 'all_inbox' },
  ]

  const FORMATOS = [
    { key: 'csv'  as const, label: 'CSV',   extensao: 'csv',  icon: 'grid_on' },
    { key: 'json' as const, label: 'JSON',  extensao: 'json', icon: 'data_object' },
    { key: 'xlsx' as const, label: 'Excel', extensao: 'xlsx', icon: 'table_view' },
    { key: 'pdf'  as const, label: 'PDF',   extensao: 'pdf',  icon: 'picture_as_pdf' },
  ]

  // ----------------------------------------------------------
  // Estado — filtros / opções
  // ----------------------------------------------------------
  const tipoSelecionado = ref<TipoExportacao>('veiculos')
  const formatoSelecionado = ref<FormatoExportacao>('csv')
  const dataDe = ref('')
  const dataAte = ref('')
  const aProcessar = ref(false)

  const opcoes = reactive<OpcoesExportacao>({
    incluirCabecalho: true,
    incluirResumo: true,
    apenasAtivos: false,
  })

  // ----------------------------------------------------------
  // Estado — histórico (backend)
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const exportacoesRecentes = ref<Exportacao[]>([])

  // ----------------------------------------------------------
  // Computed
  // ----------------------------------------------------------
  const temPeriodo = computed(() => !!dataDe.value && !!dataAte.value)

  const tipoAtual = computed(
    () => TIPOS.find((t) => t.key === tipoSelecionado.value) ?? TIPOS[0]!,
  )

  const formatoAtual = computed(
    () => FORMATOS.find((f) => f.key === formatoSelecionado.value) ?? FORMATOS[0]!,
  )

  // ----------------------------------------------------------
  // Carregar histórico
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 600))

      const dados = await exportacoesService.listar()
      exportacoesRecentes.value = dados.items

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
  // Períodos
  // ----------------------------------------------------------
  function formatarDataISO(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dia}`
  }

  function definirPeriodo(preset: PresetPeriodo) {
    const hoje = new Date()
    const de = new Date()

    if (preset === '7d') de.setDate(hoje.getDate() - 7)
    else if (preset === '30d') de.setDate(hoje.getDate() - 30)
    else if (preset === 'mes') de.setDate(1)
    else if (preset === 'ano') {
      de.setMonth(0)
      de.setDate(1)
    }

    dataDe.value = formatarDataISO(de)
    dataAte.value = formatarDataISO(hoje)
  }

  function limparPeriodo() {
    dataDe.value = ''
    dataAte.value = ''
  }

  // ----------------------------------------------------------
  // Buscar dados
  // ----------------------------------------------------------
  async function buscarDados(tipo: TipoExportacao): Promise<any[]> {
    const todas: any[] = []

    if (tipo === 'veiculos' || tipo === 'completo') {
      const r = await veiculosService.listar()
      todas.push(...r.items.map((v: any) => ({ _tipo: 'veiculo', ...v })))
    }
    if (tipo === 'inspecoes' || tipo === 'completo') {
      const r = await inspecoesService.listar()
      todas.push(...r.items.map((i: any) => ({ _tipo: 'inspecao', ...i })))
    }
    if (tipo === 'agendamentos' || tipo === 'completo') {
      const r = await agendamentosService.listar()
      todas.push(...r.items.map((a: any) => ({ _tipo: 'agendamento', ...a })))
    }

    return todas
  }

  // ----------------------------------------------------------
  // Filtrar por período
  // ----------------------------------------------------------
  function dentroDoPeriodo(item: any): boolean {
    if (!temPeriodo.value) return true

    const raw = item.data_raw ?? item.criadoEm ?? item.data ?? null
    if (!raw) return true

    let iso = ''
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      iso = raw.slice(0, 10)
    } else if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
      const [d, m, y] = raw.slice(0, 10).split('/')
      iso = `${y}-${m}-${d}`
    } else {
      return true
    }

    return iso >= dataDe.value && iso <= dataAte.value
  }

  // ----------------------------------------------------------
  // Preparar tabela (cabeçalhos + linhas)
  // ----------------------------------------------------------
  const MAPA_LABELS: Record<string, string> = {
    id: 'ID',
    codigo: 'Código',
    matricula: 'Matrícula',
    marca: 'Marca',
    modelo: 'Modelo',
    ano: 'Ano',
    cor: 'Cor',
    combustivel: 'Combustível',
    chassis: 'Chassis',
    proprietario: 'Proprietário',
    nif: 'NIF',
    posto: 'Posto',
    provincia: 'Província',
    score: 'Score',
    estado: 'Estado',
    data: 'Data',
    tipo: 'Tipo',
    resultado: 'Resultado',
    inspetor: 'Inspector',
    proximaInspecao: 'Próxima inspecção',
    hora: 'Hora',
    duracao: 'Duração',
    criadoEm: 'Criado em',
  }

  function prepararTabela(dados: any[]): {
    cabecalhos: string[]
    linhas: string[][]
  } {
    const chaves = Array.from(
      new Set(
        dados.flatMap((d) =>
          Object.keys(d).filter((k) => !k.startsWith('_') && k !== 'checklist'),
        ),
      ),
    )

    const cabecalhos = chaves.map((k) => MAPA_LABELS[k] ?? k)
    const linhas = dados.map((d) => chaves.map((k) => String(d[k] ?? '')))

    return { cabecalhos, linhas }
  }

  // ----------------------------------------------------------
  // Gerar CSV
  // ----------------------------------------------------------
  function gerarCSV(dados: any[], cabecalhos: string[], linhas: string[][]): string {
    const blocos: string[][] = []

    if (opcoes.incluirCabecalho) {
      blocos.push([`SICAM — INATRO — ${tipoAtual.value.label}`])
      blocos.push([`Gerado em: ${new Date().toLocaleString('pt-PT')}`])
      if (temPeriodo.value) {
        blocos.push([`Período: ${dataDe.value} a ${dataAte.value}`])
      }
      blocos.push([])
    }

    if (opcoes.incluirResumo) {
      blocos.push(['RESUMO'])
      blocos.push(['Total de registos', String(dados.length)])
      blocos.push([])
    }

    blocos.push(['DADOS'])
    blocos.push(cabecalhos)
    for (const l of linhas) blocos.push(l)

    return (
      '\uFEFF' +
      blocos
        .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
        .join('\n')
    )
  }

  // ----------------------------------------------------------
  // Gerar JSON
  // ----------------------------------------------------------
  function gerarJSON(dados: any[]): string {
    return JSON.stringify(
      {
        meta: {
          instituicao: 'SICAM — INATRO',
          tipo: tipoAtual.value.label,
          geradoEm: new Date().toISOString(),
          periodo: temPeriodo.value
            ? { de: dataDe.value, ate: dataAte.value }
            : null,
          total: dados.length,
        },
        dados,
      },
      null,
      2,
    )
  }

  // ----------------------------------------------------------
  // Descarregar
  // ----------------------------------------------------------
  function descarregarConteudo(conteudo: string, nome: string, mime: string) {
    const blob = new Blob([conteudo], { type: mime })
    descarregarBlob(blob, nome)
  }

  function descarregarBlob(blob: Blob, nome: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nome
    a.click()
    URL.revokeObjectURL(url)
  }

  // ----------------------------------------------------------
  // Exportação principal
  // ----------------------------------------------------------
  async function exportar(): Promise<{
    ok: boolean
    tipo: TipoExportacao
    formato: FormatoExportacao
    registos: number
    tamanho: number
    mensagem?: string
  }> {
    if (aProcessar.value) {
      return {
        ok: false,
        tipo: tipoSelecionado.value,
        formato: formatoSelecionado.value,
        registos: 0,
        tamanho: 0,
      }
    }

    aProcessar.value = true
    erro.value = null

    try {
      // 1. Buscar dados reais
      let dados = await buscarDados(tipoSelecionado.value)
      dados = dados.filter(dentroDoPeriodo)

      if (opcoes.apenasAtivos) {
        dados = dados.filter((d) => {
          const estado = String(d.estado ?? '').toLowerCase()
          return estado !== 'cancelado' && estado !== 'expirada'
        })
      }

      // 2. Preparar tabela
      const { cabecalhos, linhas } = prepararTabela(dados)

      const formato = formatoSelecionado.value
      const detalhe = temPeriodo.value
        ? `Período: ${dataDe.value} a ${dataAte.value}`
        : 'Todo o histórico'
      const dataHoje = new Date().toISOString().slice(0, 10)
      const slug = tipoSelecionado.value

      let tamanho = 0

      // 3. Gerar conforme formato
      if (formato === 'csv') {
        const conteudo = gerarCSV(dados, cabecalhos, linhas)
        const nome = `inatro-${slug}-${dataHoje}.csv`
        descarregarConteudo(conteudo, nome, 'text/csv;charset=utf-8;')
        tamanho = new Blob([conteudo]).size
      } else if (formato === 'json') {
        const conteudo = gerarJSON(dados)
        const nome = `inatro-${slug}-${dataHoje}.json`
        descarregarConteudo(conteudo, nome, 'application/json;charset=utf-8;')
        tamanho = new Blob([conteudo]).size
      } else if (formato === 'xlsx') {
        const payload: GerarFicheiroPayload = {
          titulo: tipoAtual.value.label,
          cabecalhos,
          linhas,
          resumo: opcoes.incluirResumo
            ? { 'Total de registos': dados.length }
            : undefined,
        }
        const blob = await exportacoesService.gerarXlsx(payload)
        const nome = `inatro-${slug}-${dataHoje}.xlsx`
        descarregarBlob(blob, nome)
        tamanho = blob.size
      } else {
        // PDF — único formato que resta
        const payload: GerarFicheiroPayload = {
          titulo: tipoAtual.value.label,
          subtitulo: detalhe,
          cabecalhos,
          linhas,
          resumo: opcoes.incluirResumo
            ? { 'Total de registos': dados.length }
            : undefined,
        }
        const blob = await exportacoesService.gerarPdf(payload)
        const nome = `inatro-${slug}-${dataHoje}.pdf`
        descarregarBlob(blob, nome)
        tamanho = blob.size
      }

      // 4. Registar no backend
      const payloadRegisto: CriarExportacaoPayload = {
        tipo: tipoSelecionado.value,
        formato,
        titulo: `${tipoAtual.value.label} — Exportação`,
        detalhe,
        data_de: dataDe.value || undefined,
        data_ate: dataAte.value || undefined,
        incluir_cabecalho: opcoes.incluirCabecalho,
        incluir_resumo: opcoes.incluirResumo,
        apenas_ativos: opcoes.apenasAtivos,
        total_registos: dados.length,
        tamanho_bytes: tamanho,
      }

      await exportacoesService.criar(payloadRegisto)
      await carregar()

      return {
        ok: true,
        tipo: tipoSelecionado.value,
        formato,
        registos: dados.length,
        tamanho,
      }
    } catch (e) {
      erro.value = extrairErro(e)
      return {
        ok: false,
        tipo: tipoSelecionado.value,
        formato: formatoSelecionado.value,
        registos: 0,
        tamanho: 0,
        mensagem: erro.value ?? 'Erro desconhecido',
      }
    } finally {
      aProcessar.value = false
    }
  }

  // ----------------------------------------------------------
  // Remover
  // ----------------------------------------------------------
  async function remover(id: string): Promise<boolean> {
    try {
      await exportacoesService.remover(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Helpers UI
  // ----------------------------------------------------------
  function iconeFormato(formato: string): string {
    if (formato === 'csv') return 'grid_on'
    if (formato === 'xlsx') return 'table_view'
    if (formato === 'pdf') return 'picture_as_pdf'
    if (formato === 'json') return 'data_object'
    return 'description'
  }

  function tamanhoLegivel(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    TIPOS,
    FORMATOS,

    tipoSelecionado,
    formatoSelecionado,
    dataDe,
    dataAte,
    aProcessar,
    opcoes,

    aCarregar,
    carregado,
    erro,
    carregar,
    exportacoesRecentes,

    temPeriodo,
    tipoAtual,
    formatoAtual,

    definirPeriodo,
    limparPeriodo,
    exportar,
    remover,

    iconeFormato,
    tamanhoLegivel,
    formatarDataISO,
  }
})