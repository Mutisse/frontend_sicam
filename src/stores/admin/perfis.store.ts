// src/stores/admin/perfis.store.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import {
  perfisService,
  type Perfil,
  type Permissao,
  type ModuloKey,
  type AcaoKey,
  type EstadoPerfil,
  type CriarPerfilPayload,
} from '@/services/admin/perfis.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos / Constantes
// ============================================================
export type { Perfil, Permissao, ModuloKey, AcaoKey }
export type ModoForm = 'criar' | 'editar'

export interface Modulo {
  key: ModuloKey
  label: string
  icon: string
  grupo: string
}

export const MODULOS: Modulo[] = [
  { key: 'dashboard',     label: 'Dashboard',      icon: 'dashboard',      grupo: 'Geral' },
  { key: 'monitorizacao', label: 'Monitorização',  icon: 'monitor_heart',  grupo: 'Geral' },
  { key: 'relatorios',    label: 'Relatórios',     icon: 'description',    grupo: 'Geral' },
  { key: 'backups',       label: 'Backups',        icon: 'backup',         grupo: 'Geral' },

  { key: 'utilizadores',  label: 'Utilizadores',   icon: 'people',         grupo: 'Administração' },
  { key: 'perfis',        label: 'Perfis',         icon: 'shield',         grupo: 'Administração' },
  { key: 'postos',        label: 'Postos',         icon: 'local_police',   grupo: 'Administração' },
  { key: 'dispositivos',  label: 'Dispositivos',   icon: 'devices',        grupo: 'Administração' },
  { key: 'integracoes',   label: 'Integrações',    icon: 'extension',      grupo: 'Administração' },
  { key: 'auditoria',     label: 'Auditoria',      icon: 'history',        grupo: 'Administração' },

  { key: 'hotlist',       label: 'Hotlist',        icon: 'local_police',   grupo: 'Operações PRM' },
  { key: 'abordagens',    label: 'Abordagens',     icon: 'directions_car', grupo: 'Operações PRM' },
  { key: 'alertas',       label: 'Alertas',        icon: 'notifications',  grupo: 'Operações PRM' },
  { key: 'mapa',          label: 'Mapa de calor',  icon: 'map',            grupo: 'Operações PRM' },
]

export const ACOES: { key: AcaoKey; label: string }[] = [
  { key: 'ver',    label: 'Ver' },
  { key: 'criar',  label: 'Criar' },
  { key: 'editar', label: 'Editar' },
  { key: 'apagar', label: 'Apagar' },
]

function permissoesVazias(): Permissao[] {
  return MODULOS.map((m) => ({
    modulo: m.key,
    ver: false,
    criar: false,
    editar: false,
    apagar: false,
  }))
}

function permissoesCompletas(): Permissao[] {
  return MODULOS.map((m) => ({
    modulo: m.key,
    ver: true,
    criar: true,
    editar: true,
    apagar: true,
  }))
}

// ============================================================
// Store
// ============================================================
export const useAdminPerfisStore = defineStore('adminPerfis', () => {
  // ----------------------------------------------------------
  // Estado backend
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const carregado = ref(false)
  const erro = ref<string | null>(null)

  const perfis = ref<Perfil[]>([])

  const pesquisa = ref('')
  const filtroEstado = ref<'' | EstadoPerfil>('')

  const modalForm = ref(false)
  const modoForm = ref<ModoForm>('criar')
  const aSalvar = ref(false)
  const editandoId = ref<string | null>(null)

  const modalDetalhes = ref(false)
  const perfilDetalhe = ref<Perfil | null>(null)

  const modalConfirmRemover = ref(false)
  const perfilARemover = ref<Perfil | null>(null)

  const form = reactive<{
    id: string | null
    key: string
    label: string
    descricao: string
    icon: string
    cor: string
    estado: EstadoPerfil
    permissoes: Permissao[]
  }>({
    id: null,
    key: '',
    label: '',
    descricao: '',
    icon: 'shield',
    cor: '#065f46',
    estado: 'Ativo',
    permissoes: permissoesVazias(),
  })

  // ----------------------------------------------------------
  // Carregar
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 500))

      const dados = await perfisService.listar()
      perfis.value = dados.items

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
    const q = pesquisa.value.toLowerCase().trim()
    return perfis.value.filter((p) => {
      if (q && !p.label.toLowerCase().includes(q) && !p.key.toLowerCase().includes(q))
        return false
      if (filtroEstado.value && p.estado !== filtroEstado.value) return false
      return true
    })
  })

  const totalPerfis = computed(() => perfis.value.length)
  const totalAtivos = computed(
    () => perfis.value.filter((p) => p.estado === 'Ativo').length,
  )
  const totalBloqueados = computed(
    () => perfis.value.filter((p) => p.estado === 'Bloqueado').length,
  )
  const totalUtilizadores = computed(() =>
    perfis.value.reduce((s, p) => s + p.utilizadores, 0),
  )

  const modulosPorGrupo = computed(() => {
    const map: Record<string, Modulo[]> = {}
    for (const m of MODULOS) {
      if (!map[m.grupo]) map[m.grupo] = []
      map[m.grupo]!.push(m)
    }
    return map
  })

  const formValido = computed(
    () => form.label.trim().length >= 3 && form.key.trim().length >= 2,
  )

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function getPermissao(permissoes: Permissao[], modulo: ModuloKey): Permissao {
    const p = permissoes.find((x) => x.modulo === modulo)
    if (p) return p
    return { modulo, ver: false, criar: false, editar: false, apagar: false }
  }

  function togglePermissao(
    permissoes: Permissao[],
    modulo: ModuloKey,
    acao: AcaoKey,
  ) {
    let p = permissoes.find((x) => x.modulo === modulo)
    if (!p) {
      p = { modulo, ver: false, criar: false, editar: false, apagar: false }
      permissoes.push(p)
    }
    p[acao] = !p[acao]
  }

  function ativarTudoModulo(permissoes: Permissao[], modulo: ModuloKey) {
    let p = permissoes.find((x) => x.modulo === modulo)
    if (!p) {
      p = { modulo, ver: false, criar: false, editar: false, apagar: false }
      permissoes.push(p)
    }
    const todas = p.ver && p.criar && p.editar && p.apagar
    p.ver = !todas
    p.criar = !todas
    p.editar = !todas
    p.apagar = !todas
  }

  function ativarTudoGrupo(permissoes: Permissao[], grupo: string) {
    const modulos = MODULOS.filter((m) => m.grupo === grupo).map((m) => m.key)
    const todas = modulos.every((k) => {
      const p = getPermissao(permissoes, k)
      return p.ver && p.criar && p.editar && p.apagar
    })
    for (const k of modulos) {
      let p = permissoes.find((x) => x.modulo === k)
      if (!p) {
        p = { modulo: k, ver: false, criar: false, editar: false, apagar: false }
        permissoes.push(p)
      }
      p.ver = !todas
      p.criar = !todas
      p.editar = !todas
      p.apagar = !todas
    }
  }

  // ----------------------------------------------------------
  // Acções — formulário
  // ----------------------------------------------------------
  function abrirCriar() {
    modoForm.value = 'criar'
    editandoId.value = null
    Object.assign(form, {
      id: null,
      key: '',
      label: '',
      descricao: '',
      icon: 'shield',
      cor: '#065f46',
      estado: 'Ativo',
      permissoes: permissoesVazias(),
    })
    erro.value = null
    modalForm.value = true
  }

  function abrirEditar(p: Perfil) {
    modoForm.value = 'editar'
    editandoId.value = p.id
    Object.assign(form, {
      id: p.id,
      key: p.key,
      label: p.label,
      descricao: p.descricao,
      icon: p.icon,
      cor: p.cor,
      estado: p.estado,
      permissoes: JSON.parse(JSON.stringify(p.permissoes)),
    })
    erro.value = null
    modalForm.value = true
  }

  function fecharForm() {
    modalForm.value = false
  }

  async function guardar(): Promise<Perfil | null> {
    if (!formValido.value || aSalvar.value) return null
    aSalvar.value = true
    erro.value = null

    try {
      if (modoForm.value === 'criar') {
        const payload: CriarPerfilPayload = {
          key: form.key.trim().toLowerCase(),
          label: form.label.trim(),
          icon: form.icon,
          cor: form.cor,
          estado: form.estado,
          permissoes: form.permissoes,
        }
        if (form.descricao.trim()) payload.descricao = form.descricao.trim()

        const r = await perfisService.criar(payload)
        await carregar()
        fecharForm()
        return r.perfil
      }

      if (!editandoId.value) return null

      const r = await perfisService.actualizar(editandoId.value, {
        key: form.key.trim().toLowerCase(),
        label: form.label.trim(),
        descricao: form.descricao.trim() || undefined,
        icon: form.icon,
        cor: form.cor,
        estado: form.estado,
        permissoes: form.permissoes,
      })
      await carregar()
      fecharForm()
      return r.perfil
    } catch (e) {
      erro.value = extrairErro(e)
      return null
    } finally {
      aSalvar.value = false
    }
  }

  // ----------------------------------------------------------
  // Acções — clonar / bloquear / remover
  // ----------------------------------------------------------
  async function clonar(p: Perfil): Promise<Perfil | null> {
    try {
      const r = await perfisService.clonar(p.id)
      await carregar()
      return r.perfil
    } catch (e) {
      erro.value = extrairErro(e)
      return null
    }
  }

  async function alternarEstado(p: Perfil): Promise<boolean> {
    try {
      if (p.estado === 'Ativo') await perfisService.bloquear(p.id)
      else await perfisService.activar(p.id)
      await carregar()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  function pedirRemover(p: Perfil) {
    perfilARemover.value = p
    modalConfirmRemover.value = true
  }

  async function confirmarRemover(): Promise<boolean> {
    const p = perfilARemover.value
    if (!p) return false

    try {
      await perfisService.remover(p.id)
      await carregar()
      perfilARemover.value = null
      modalConfirmRemover.value = false
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    }
  }

  // ----------------------------------------------------------
  // Modal — Detalhes
  // ----------------------------------------------------------
  function abrirDetalhes(p: Perfil) {
    perfilDetalhe.value = p
    modalDetalhes.value = true
  }

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  function limparFiltros() {
    pesquisa.value = ''
    filtroEstado.value = ''
  }

  // ----------------------------------------------------------
  // Export
  // ----------------------------------------------------------
  async function exportarXlsx(): Promise<Blob | null> {
    try {
      return await perfisService.exportarXlsx()
    } catch (e) {
      erro.value = extrairErro(e)
      return null
    }
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    MODULOS,
    ACOES,

    aCarregar,
    carregado,
    erro,
    carregar,

    perfis,
    pesquisa,
    filtroEstado,

    modalForm,
    modoForm,
    aSalvar,
    editandoId,
    modalDetalhes,
    perfilDetalhe,
    modalConfirmRemover,
    perfilARemover,

    form,

    filtrados,
    totalPerfis,
    totalAtivos,
    totalBloqueados,
    totalUtilizadores,
    modulosPorGrupo,
    formValido,

    getPermissao,
    togglePermissao,
    ativarTudoModulo,
    ativarTudoGrupo,

    abrirCriar,
    abrirEditar,
    fecharForm,
    guardar,
    clonar,
    alternarEstado,
    pedirRemover,
    confirmarRemover,
    abrirDetalhes,
    limparFiltros,
    exportarXlsx,
  }
})