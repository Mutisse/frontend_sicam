// src/stores/admin/utilizadores.store.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import {
  utilizadoresService,
  type Utilizador,
  type Perfil,
  type UtilizadoresKpis,
  type EstadoUtilizador,
  type PerfilKey,
  type CriarUtilizadorPayload,
} from '@/services/admin/utilizadores.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type { Utilizador, Perfil, EstadoUtilizador, PerfilKey }
export type ModoForm = 'criar' | 'editar'

const POR_PAGINA = 10

// ============================================================
// Store
// ============================================================
export const useAdminUtilizadoresStore = defineStore(
  'adminUtilizadores',
  () => {
    // ----------------------------------------------------------
    // Estado backend
    // ----------------------------------------------------------
    const aCarregar = ref(false)
    const carregado = ref(false)
    const erro = ref<string | null>(null)

    const utilizadores = ref<Utilizador[]>([])
    const perfis = ref<Perfil[]>([])
    const postos = ref<string[]>([])

    const kpisData = reactive<UtilizadoresKpis>({
      total: 0,
      activos: 0,
      bloqueados: 0,
      online: 0,
    })

    const kpis = computed<UtilizadoresKpis>(() => ({ ...kpisData }))

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

        const dados = await utilizadoresService.listar()
        utilizadores.value = dados.items
        perfis.value = dados.perfis
        postos.value = dados.postos
        Object.assign(kpisData, dados.kpis)

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
    // Filtros
    // ----------------------------------------------------------
    const pesquisa = ref('')
    const filtroPerfil = ref('')
    const filtroEstado = ref<'' | EstadoUtilizador>('')
    const paginaActual = ref(1)

    watch([pesquisa, filtroPerfil, filtroEstado], () => {
      paginaActual.value = 1
    })

    const filtrosEstado = computed(() => [
      { valor: '' as const, label: 'Todos', n: kpis.value.total },
      { valor: 'Ativo' as const, label: 'Activos', n: kpis.value.activos },
      {
        valor: 'Bloqueado' as const,
        label: 'Bloqueados',
        n: kpis.value.bloqueados,
      },
    ])

    const filtrados = computed(() => {
      const q = pesquisa.value.trim().toLowerCase()
      return utilizadores.value.filter((u) => {
        if (q && !u.nome.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q))
          return false
        if (filtroPerfil.value && u.perfil !== filtroPerfil.value) return false
        if (filtroEstado.value && u.estado !== filtroEstado.value) return false
        return true
      })
    })

    const totalPaginas = computed(() =>
      Math.max(1, Math.ceil(filtrados.value.length / POR_PAGINA)),
    )
    const inicioPagina = computed(() => (paginaActual.value - 1) * POR_PAGINA)
    const fimPagina = computed(() =>
      Math.min(paginaActual.value * POR_PAGINA, filtrados.value.length),
    )
    const paginaVisivel = computed(() =>
      filtrados.value.slice(inicioPagina.value, fimPagina.value),
    )

    const paginasVisiveis = computed(() => {
      const total = totalPaginas.value
      const janela = 5
      let ini = Math.max(1, paginaActual.value - Math.floor(janela / 2))
      const fim = Math.min(total, ini + janela - 1)
      ini = Math.max(1, fim - janela + 1)
      return Array.from({ length: fim - ini + 1 }, (_, i) => ini + i)
    })

    watch(totalPaginas, (t) => {
      if (paginaActual.value > t) paginaActual.value = t
    })

    function limparFiltros() {
      pesquisa.value = ''
      filtroPerfil.value = ''
      filtroEstado.value = ''
      paginaActual.value = 1
    }

    // ----------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------
    function labelPerfil(key: string): string {
      return perfis.value.find((p) => p.key === key)?.label ?? key
    }

    function iniciaisUtilizador(nome: string): string {
      const partes = nome.trim().split(/\s+/)
      const p = partes[0]?.[0] ?? ''
      const u = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : ''
      return (p + u).toUpperCase()
    }

    // ----------------------------------------------------------
    // Modal — Detalhes
    // ----------------------------------------------------------
    const modalDetalhes = ref(false)
    const utilizadorDetalhe = ref<Utilizador | null>(null)

    function abrirDetalhes(u: Utilizador) {
      utilizadorDetalhe.value = u
      modalDetalhes.value = true
    }

    // ----------------------------------------------------------
    // Modal — Criar / Editar (3 passos)
    // ----------------------------------------------------------
    const modalForm = ref(false)
    const modoForm = ref<ModoForm>('criar')
    const passo = ref<1 | 2 | 3>(1)
    const aSalvar = ref(false)
    const editandoId = ref<string | null>(null)

    const form = reactive<{
      id: string | null
      nome: string
      email: string
      telefone: string
      perfil: string
      posto: string
      estado: EstadoUtilizador
      senha: string
      confirmar: string
      forcarAlteracao: boolean
    }>({
      id: null,
      nome: '',
      email: '',
      telefone: '',
      perfil: '',
      posto: '',
      estado: 'Ativo',
      senha: '',
      confirmar: '',
      forcarAlteracao: true,
    })

    const passo1Valido = computed(
      () =>
        form.nome.trim().length >= 3 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
        form.perfil !== '' &&
        form.posto !== '',
    )

    const passo2Valido = computed(() => {
      if (modoForm.value === 'editar') return true
      return form.senha.length >= 8 && form.senha === form.confirmar
    })

    const formValido = computed(() => passo1Valido.value && passo2Valido.value)

    function abrirCriar() {
      modoForm.value = 'criar'
      passo.value = 1
      editandoId.value = null
      Object.assign(form, {
        id: null,
        nome: '',
        email: '',
        telefone: '',
        perfil: '',
        posto: '',
        estado: 'Ativo',
        senha: '',
        confirmar: '',
        forcarAlteracao: true,
      })
      erro.value = null
      modalForm.value = true
    }

    function abrirEditar(u: Utilizador) {
      modoForm.value = 'editar'
      passo.value = 1
      editandoId.value = u.id
      Object.assign(form, {
        id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone ?? '',
        perfil: u.perfil,
        posto: u.posto,
        estado: u.estado,
        senha: '',
        confirmar: '',
        forcarAlteracao: true,
      })
      erro.value = null
      modalForm.value = true
    }

    function fecharForm() {
      modalForm.value = false
      passo.value = 1
    }

    function proximoPasso() {
      if (passo.value < 3) passo.value = (passo.value + 1) as 1 | 2 | 3
    }

    function passoAnterior() {
      if (passo.value > 1) passo.value = (passo.value - 1) as 1 | 2 | 3
    }

    async function guardar(): Promise<Utilizador | null> {
      if (!formValido.value || aSalvar.value) return null
      aSalvar.value = true
      erro.value = null

      try {
        if (modoForm.value === 'criar') {
          const payload: CriarUtilizadorPayload = {
            nome: form.nome.trim(),
            email: form.email.trim().toLowerCase(),
            perfil: form.perfil as PerfilKey,
            posto: form.posto,
            estado: form.estado,
            senha: form.senha,
            forcarAlteracao: form.forcarAlteracao,
          }
          if (form.telefone.trim()) payload.telefone = form.telefone.trim()

          const r = await utilizadoresService.criar(payload)
          await carregar()
          fecharForm()
          return r.utilizador
        }

        // Editar
        if (!editandoId.value) return null

        const payload: Record<string, string> = {
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          perfil: form.perfil,
          posto: form.posto,
          estado: form.estado,
        }
        if (form.telefone.trim()) payload.telefone = form.telefone.trim()

        const r = await utilizadoresService.actualizar(editandoId.value, payload)
        await carregar()
        fecharForm()
        return r.utilizador
      } catch (e) {
        erro.value = extrairErro(e)
        return null
      } finally {
        aSalvar.value = false
      }
    }

    // ----------------------------------------------------------
    // Acções — bloquear / activar / remover
    // ----------------------------------------------------------
    async function alternarEstado(u: Utilizador): Promise<boolean> {
      try {
        if (u.estado === 'Ativo') {
          await utilizadoresService.bloquear(u.id)
        } else {
          await utilizadoresService.activar(u.id)
        }
        await carregar()
        return true
      } catch (e) {
        erro.value = extrairErro(e)
        return false
      }
    }

    async function remover(id: string): Promise<boolean> {
      try {
        await utilizadoresService.remover(id)
        await carregar()
        return true
      } catch (e) {
        erro.value = extrairErro(e)
        return false
      }
    }

    // ----------------------------------------------------------
    // Acções — senha
    // ----------------------------------------------------------
    const modalSenha = ref(false)
    const utilizadorSenha = ref<Utilizador | null>(null)
    const aAlterarSenha = ref(false)

    function abrirAlterarSenha(u: Utilizador) {
      utilizadorSenha.value = u
      form.senha = ''
      form.confirmar = ''
      form.forcarAlteracao = true
      erro.value = null
      modalSenha.value = true
    }

    function fecharSenha() {
      modalSenha.value = false
      utilizadorSenha.value = null
    }

    async function guardarSenha(): Promise<boolean> {
      if (!utilizadorSenha.value) return false
      if (form.senha.length < 8 || form.senha !== form.confirmar) return false
      if (aAlterarSenha.value) return false

      aAlterarSenha.value = true
      erro.value = null

      try {
        await utilizadoresService.alterarSenha(
          utilizadorSenha.value.id,
          form.senha,
          form.forcarAlteracao,
        )
        fecharSenha()
        return true
      } catch (e) {
        erro.value = extrairErro(e)
        return false
      } finally {
        aAlterarSenha.value = false
      }
    }

    // ----------------------------------------------------------
    // Export
    // ----------------------------------------------------------
    async function exportarXlsx(): Promise<Blob | null> {
      try {
        return await utilizadoresService.exportarXlsx()
      } catch (e) {
        erro.value = extrairErro(e)
        return null
      }
    }

    // ----------------------------------------------------------
    // Devolver
    // ----------------------------------------------------------
    return {
      // constantes
      POR_PAGINA,

      // estado
      aCarregar,
      carregado,
      erro,
      utilizadores,
      perfis,
      postos,
      kpis,

      // filtros
      pesquisa,
      filtroPerfil,
      filtroEstado,
      filtrosEstado,
      filtrados,
      limparFiltros,

      // paginação
      paginaActual,
      totalPaginas,
      inicioPagina,
      fimPagina,
      paginaVisivel,
      paginasVisiveis,

      // modais
      modalDetalhes,
      utilizadorDetalhe,
      abrirDetalhes,

      modalForm,
      modoForm,
      passo,
      aSalvar,
      form,
      passo1Valido,
      passo2Valido,
      formValido,
      abrirCriar,
      abrirEditar,
      fecharForm,
      proximoPasso,
      passoAnterior,
      guardar,

      modalSenha,
      utilizadorSenha,
      aAlterarSenha,
      abrirAlterarSenha,
      fecharSenha,
      guardarSenha,

      // acções
      alternarEstado,
      remover,
      exportarXlsx,
      carregar,

      // helpers
      labelPerfil,
      iniciaisUtilizador,
    }
  },
)