// src/stores/admin/backups.store.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import {
  backupsService,
  type Backup,
  type TipoBackupConfig,
  type BackupsKpis,
  type TipoBackup,
  type EstadoBackup,
  type OrigemBackup,
  type Periodicidade,
} from '@/services/admin/backups.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type {
  Backup,
  TipoBackupConfig,
  TipoBackup,
  EstadoBackup,
  OrigemBackup,
  Periodicidade,
}

// ============================================================
// Store
// ============================================================
export const useAdminBackupsStore = defineStore('adminBackups', () => {
  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const aCriar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const backups = ref<Backup[]>([])
  const tipos = ref<TipoBackupConfig[]>([])

  const kpisData = reactive<BackupsKpis>({
    total: 0,
    ultimo: '—',
    tamanho: 0,
    falhas: 0,
  })

  const kpis = computed<BackupsKpis>(() => ({ ...kpisData }))

  const ultimaActualizacao = ref('—')

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref('')
  const filtroEstado = ref<'' | EstadoBackup>('')
  const filtroTipo = ref<'' | TipoBackup>('')

  // ----------------------------------------------------------
  // Opções
  // ----------------------------------------------------------
  const estadosDisponiveis: EstadoBackup[] = [
    'Concluído',
    'Em curso',
    'Falhou',
  ]
  const tiposDisponiveis: TipoBackup[] = ['Automático', 'Manual']
  const periodicidades: Periodicidade[] = [
    'Diário',
    'Semanal',
    'Mensal',
    'Nunca',
  ]

  // ----------------------------------------------------------
  // Carregar
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 400))

      const dados = await backupsService.listar()
      backups.value = dados.items
      tipos.value = dados.tipos
      Object.assign(kpisData, dados.kpis)

      ultimaActualizacao.value = new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      })

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
  // Getters
  // ----------------------------------------------------------
  const filtrados = computed(() => {
    return backups.value.filter((b) => {
      if (filtroEstado.value && b.estado !== filtroEstado.value) return false
      if (filtroTipo.value && b.tipo !== filtroTipo.value) return false
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase()
        if (
          !b.codigo.toLowerCase().includes(q) &&
          !b.ficheiro.toLowerCase().includes(q) &&
          !b.autor.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  })

  const totalBackups = computed(() => kpisData.total)
  const totalFalhas = computed(() => kpisData.falhas)
  const ultimoBackup = computed(() => backups.value[0] ?? null)
  const tamanhoTotal = computed(() => kpisData.tamanho)
  const tiposAtivos = computed(() => tipos.value.filter((t) => t.ativo).length)

  const proximoAutomatico = computed(() => {
    const ativo = tipos.value.find(
      (t) => t.ativo && t.periodicidade !== 'Nunca',
    )
    if (!ativo) return null
    return {
      label: ativo.label,
      hora: ativo.horaExecucao,
      periodicidade: ativo.periodicidade,
    }
  })

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function formatarTamanhoTotal(mb: number): string {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2).replace('.', ',')} GB`
    return `${mb.toFixed(0)} MB`
  }

  function estadoClasse(
    e: EstadoBackup,
  ): 'regular' | 'atencao' | 'critico' {
    if (e === 'Concluído') return 'regular'
    if (e === 'Em curso') return 'atencao'
    return 'critico'
  }

  function iconeEstado(e: EstadoBackup): string {
    if (e === 'Concluído') return 'check_circle'
    if (e === 'Em curso') return 'sync'
    return 'error'
  }

  // ----------------------------------------------------------
  // Acções — tipos
  // ----------------------------------------------------------
  async function toggleTipo(key: OrigemBackup) {
    const t = tipos.value.find((x) => x.key === key)
    if (!t) return

    const novoAtivo = !t.ativo
    t.ativo = novoAtivo // update optimista

    try {
      await backupsService.actualizarTipo(key, { ativo: novoAtivo })
    } catch (e) {
      t.ativo = !novoAtivo // rollback
      erro.value = extrairErro(e)
    }
  }

  async function setPeriodicidade(key: OrigemBackup, p: Periodicidade) {
    const t = tipos.value.find((x) => x.key === key)
    if (!t) return

    const anterior = t.periodicidade
    t.periodicidade = p

    try {
      await backupsService.actualizarTipo(key, { periodicidade: p })
    } catch (e) {
      t.periodicidade = anterior
      erro.value = extrairErro(e)
    }
  }

  async function setHora(key: OrigemBackup, hora: string) {
    const t = tipos.value.find((x) => x.key === key)
    if (!t) return

    const anterior = t.horaExecucao
    t.horaExecucao = hora

    try {
      await backupsService.actualizarTipo(key, { horaExecucao: hora })
    } catch (e) {
      t.horaExecucao = anterior
      erro.value = extrairErro(e)
    }
  }

  // ----------------------------------------------------------
  // Acções — backups
  // ----------------------------------------------------------
  async function criarBackup(
    origem: OrigemBackup = 'Completo',
    tipo: TipoBackup = 'Manual',
  ): Promise<Backup | null> {
    if (aCriar.value) return null
    aCriar.value = true
    erro.value = null

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 1200))

      const r = await backupsService.criar({ origem, tipo })
      Object.assign(kpisData, r.kpis)

      await atrasoMinimo
      await carregar()
      return r.backup
    } catch (e) {
      erro.value = extrairErro(e)
      return null
    } finally {
      aCriar.value = false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      await backupsService.remover(id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  async function restaurar(id: string): Promise<string | null> {
    try {
      const r = await backupsService.restaurar(id)
      return r.mensagem
    } catch (e) {
      erro.value = extrairErro(e)
      return null
    }
  }

  async function descarregar(b: Backup): Promise<boolean> {
    try {
      await backupsService.descarregar(b.id, b.ficheiro)
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  function limparFiltros() {
    pesquisa.value = ''
    filtroEstado.value = ''
    filtroTipo.value = ''
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado
    aCarregar,
    aCriar,
    carregado,
    erro,
    ultimaActualizacao,

    // dados
    backups,
    tipos,
    kpis,

    // filtros
    pesquisa,
    filtroEstado,
    filtroTipo,

    // opções
    estadosDisponiveis,
    tiposDisponiveis,
    periodicidades,

    // getters
    filtrados,
    totalBackups,
    ultimoBackup,
    totalFalhas,
    tamanhoTotal,
    tiposAtivos,
    proximoAutomatico,

    // helpers
    estadoClasse,
    iconeEstado,
    formatarTamanhoTotal,

    // acções — tipos
    toggleTipo,
    setPeriodicidade,
    setHora,

    // acções — backups
    carregar,
    criarBackup,
    remover,
    restaurar,
    descarregar,
    limparFiltros,
  }
})