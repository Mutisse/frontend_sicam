// src/stores/perfil.store.ts
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  perfilService,
  type Preferencias,
  type SessaoActiva,
} from '@/services/perfil.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Defaults
// ============================================================
function preferenciasIniciais(): Preferencias {
  return {
    tema: 'auto',
    idioma: 'pt',
    densidade: 'normal',
    modo_offline: false,
    notif_push: true,
    notif_som: true,
    notif_email: false,
  }
}

// ============================================================
// Store — perfil comum (ligado ao backend)
// ============================================================
export const usePerfilStore = defineStore('perfil', () => {
  const auth = useAuthStore()

  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const guardado = ref(false)
  const erro = ref<string | null>(null)
  const carregado = ref(false)

  // Dados pessoais (form)
  const form = reactive({
    nome: '',
    email: '',
    telefone: '',
  })

  // Preferências
  const preferencias = reactive<Preferencias>(preferenciasIniciais())

  // Segurança
  const senhaAtual = ref('')
  const senhaNova = ref('')
  const senhaConfirmar = ref('')
  const aAlterarSenha = ref(false)

  // Sessões
  const sessoes = ref<SessaoActiva[]>([])

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const nome = computed(() => auth.utilizador?.nome ?? 'Utilizador')
  const email = computed(() => auth.utilizador?.email ?? '')
  const telefone = computed(() => auth.utilizador?.telefone ?? '')
  const numeroId = computed(() => auth.utilizador?.numero_id ?? '—')
  const funcao = computed(() => auth.utilizador?.funcao ?? '—')
  const posto = computed(() => auth.utilizador?.posto ?? '—')
  const online = computed(() => true)
  const iniciais = computed(() => auth.iniciais)
  const perfilLabel = computed(() => auth.utilizador?.perfil?.label ?? '—')

  const senhaValida = computed(
    () =>
      senhaAtual.value.length >= 6 &&
      senhaNova.value.length >= 8 &&
      senhaNova.value === senhaConfirmar.value,
  )

  // ----------------------------------------------------------
  // Acções — Dados pessoais
  // ----------------------------------------------------------
  async function carregar() {
    aCarregar.value = true
    erro.value = null
    carregado.value = false

    try {
      // Atraso mínimo de 800ms para o skeleton ser visível
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800))

      const u = await perfilService.obter()
      auth.setUtilizador(u)

      form.nome = u.nome ?? ''
      form.email = u.email ?? ''
      form.telefone = u.telefone ?? ''

      await carregarPreferencias()
      await carregarSessoes()

      await atrasoMinimo

      carregado.value = true
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      aCarregar.value = false
    }
  }

  async function guardarDados() {
    aCarregar.value = true
    erro.value = null

    try {
      const u = await perfilService.actualizar({
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim() || null,
      })

      auth.setUtilizador(u)
      guardado.value = true
      setTimeout(() => (guardado.value = false), 2000)
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      aCarregar.value = false
    }
  }

  // ----------------------------------------------------------
  // Acções — Preferências
  // ----------------------------------------------------------
  async function carregarPreferencias() {
    try {
      const prefs = await perfilService.obterPreferencias()
      Object.assign(preferencias, prefs)
    } catch {
      /* usar defaults */
    }
  }

  async function guardarPreferencias() {
    aCarregar.value = true
    erro.value = null

    try {
      await perfilService.guardarPreferencias(preferencias)

      if (preferencias.tema === 'escuro') {
        document.body.classList.add('tema-escuro')
      } else {
        document.body.classList.remove('tema-escuro')
      }

      localStorage.setItem('sicam.prefs', JSON.stringify(preferencias))

      guardado.value = true
      setTimeout(() => (guardado.value = false), 2000)
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      aCarregar.value = false
    }
  }

  function reporPreferencias() {
    Object.assign(preferencias, preferenciasIniciais())
  }

  // ----------------------------------------------------------
  // Acções — Senha
  // ----------------------------------------------------------
  function limparSenha() {
    senhaAtual.value = ''
    senhaNova.value = ''
    senhaConfirmar.value = ''
  }

  async function alterarSenha(): Promise<boolean> {
    if (!senhaValida.value) return false
    aAlterarSenha.value = true
    erro.value = null

    try {
      await perfilService.alterarSenha({
        senha_atual: senhaAtual.value,
        senha_nova: senhaNova.value,
        senha_nova_confirmation: senhaConfirmar.value,
      })
      limparSenha()
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    } finally {
      aAlterarSenha.value = false
    }
  }

  // ----------------------------------------------------------
  // Acções — Sessões
  // ----------------------------------------------------------
  async function carregarSessoes() {
    try {
      sessoes.value = await perfilService.listarSessoes()
    } catch {
      sessoes.value = []
    }
  }

  async function terminarSessao(id: string) {
    try {
      await perfilService.terminarSessao(id)
      sessoes.value = sessoes.value.filter((s) => s.id !== id)
    } catch {
      /* ignorar */
    }
  }

  async function terminarOutrasSessoes() {
    try {
      await perfilService.terminarOutrasSessoes()
      sessoes.value = sessoes.value.filter((s) => s.atual)
    } catch {
      /* ignorar */
    }
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado
    aCarregar,
    guardado,
    erro,
    carregado,

    // form (dados pessoais editáveis)
    form,

    // preferências
    preferencias,

    // segurança
    senhaAtual,
    senhaNova,
    senhaConfirmar,
    aAlterarSenha,

    // sessões
    sessoes,

    // getters
    nome,
    email,
    telefone,
    numeroId,
    funcao,
    posto,
    online,
    iniciais,
    perfilLabel,
    senhaValida,

    // acções
    carregar,
    guardarDados,
    carregarPreferencias,
    guardarPreferencias,
    reporPreferencias,
    limparSenha,
    alterarSenha,
    carregarSessoes,
    terminarSessao,
    terminarOutrasSessoes,
  }
})