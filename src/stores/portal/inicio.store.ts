// src/stores/portal/inicio.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  cidadaoService,
  type Noticia,
  type RespostaConsulta,
} from '@/services/portal/cidadao.service'
import { extrairErro } from '@/boot/axios'

// ============================================================
// Constantes
// ============================================================
const STORAGE_CIDADAO = 'sicam.cidadao'
const STORAGE_NUMERO = 'sicam.numero-carta'

// ============================================================
// Tipos
// ============================================================
export interface ItemEncontra {
  icon: string
  titulo: string
  desc: string
}

export interface Atalho {
  to: string
  icon: string
  titulo: string
  desc: string
}

// ============================================================
// Store
// ============================================================
export const usePortalInicioStore = defineStore('portalInicio', () => {
  // ----------------------------------------------------------
  // Estado do formulário
  // ----------------------------------------------------------
  const numeroCarta = ref('')
  const aConsultar = ref(false)
  const focado = ref(false)
  const erro = ref<string | null>(null)

  // ----------------------------------------------------------
  // ⭐ ESTADO PARTILHADO — fonte única de verdade
  // ----------------------------------------------------------
  const ultimaConsulta = ref<RespostaConsulta | null>(null)

  // ----------------------------------------------------------
  // Estado notícias
  // ----------------------------------------------------------
  const noticias = ref<Noticia[]>([])
  const aCarregarNoticias = ref(false)
  const noticiasCarregadas = ref(false)

  // ----------------------------------------------------------
  // Validação
  // ----------------------------------------------------------
  const digitos = computed(() => numeroCarta.value.replace(/\D/g, ''))
  const numeroValido = computed(() => digitos.value.length === 9)

  // ----------------------------------------------------------
  // Conteúdo estático
  // ----------------------------------------------------------
  const oQueEncontra: ItemEncontra[] = [
    { icon: 'directions_car', titulo: 'Os seus veículos',  desc: 'Matrícula, marca e estado' },
    { icon: 'fact_check',     titulo: 'Inspecção técnica', desc: 'Validade e próxima data' },
    { icon: 'verified_user',  titulo: 'Seguro obrigatório',desc: 'Apólice e vencimento' },
    { icon: 'receipt_long',   titulo: 'Multas',            desc: 'Pendentes e pagas' },
  ]

  const atalhos: Atalho[] = [
    { to: '/cidadao/noticias',   icon: 'newspaper', titulo: 'Notícias',                 desc: 'Campanhas e avisos do sector' },
    { to: '/cidadao/faq',        icon: 'gavel',     titulo: 'Leis e perguntas frequentes', desc: 'Código de estrada, multas, seguro' },
    { to: '/cidadao/assistente', icon: 'chat',      titulo: 'Assistente IA',            desc: 'Tire dúvidas em linguagem natural' },
  ]

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function onInput(valor: string): string {
    return valor.replace(/\D/g, '').slice(0, 9)
  }

  function limpar() {
    numeroCarta.value = ''
    erro.value = null
  }

  function setFocado(v: boolean) {
    focado.value = v
  }

  function setAConsultar(v: boolean) {
    aConsultar.value = v
  }

  // ----------------------------------------------------------
  // ⭐ CONSULTA — o único sítio que fala com o backend
  // ----------------------------------------------------------
  async function consultar(numero: string): Promise<boolean> {
    const digitosConsulta = numero.replace(/\D/g, '')

    if (digitosConsulta.length !== 9) {
      erro.value = 'O número da carta tem de ter 9 dígitos.'
      return false
    }

    aConsultar.value = true
    erro.value = null

    try {
      const r: RespostaConsulta = await cidadaoService.consultarCarta(digitosConsulta)

      // 1. Guardar em sessionStorage (para sobreviver a refresh)
      sessionStorage.setItem(STORAGE_CIDADAO, JSON.stringify(r))
      sessionStorage.setItem(STORAGE_NUMERO, digitosConsulta)

      // 2. ⭐ Publicar para os stores dependentes (carta + multas)
      //    O `watch` que está no carta.store e no multas.store apanha isto
      ultimaConsulta.value = r

      numeroCarta.value = digitosConsulta
      return true
    } catch (e) {
      erro.value = extrairErro(e)
      return false
    } finally {
      aConsultar.value = false
    }
  }

  // ----------------------------------------------------------
  // Restaurar sessão anterior (ex: F5 na página /cidadao/carta)
  // ----------------------------------------------------------
  function restaurar(): boolean {
    if (ultimaConsulta.value) return true
    try {
      const raw = sessionStorage.getItem(STORAGE_CIDADAO)
      if (!raw) return false
      const dados: RespostaConsulta = JSON.parse(raw)
      ultimaConsulta.value = dados
      numeroCarta.value = dados.cidadao.numero
      return true
    } catch {
      return false
    }
  }

  // ----------------------------------------------------------
  // Notícias
  // ----------------------------------------------------------
  async function carregarNoticias() {
    if (aCarregarNoticias.value) return
    aCarregarNoticias.value = true

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 300))
      const r = await cidadaoService.listarNoticias()
      noticias.value = r.items
      await atrasoMinimo
      noticiasCarregadas.value = true
    } catch {
      noticiasCarregadas.value = true
    } finally {
      aCarregarNoticias.value = false
    }
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado formulário
    numeroCarta,
    aConsultar,
    focado,
    erro,

    // ⭐ estado partilhado
    ultimaConsulta,

    // notícias
    noticias,
    aCarregarNoticias,
    noticiasCarregadas,

    // validação
    digitos,
    numeroValido,

    // conteúdo estático
    oQueEncontra,
    atalhos,

    // ações
    onInput,
    limpar,
    setFocado,
    setAConsultar,
    consultar,
    restaurar,
    carregarNoticias,
  }
})