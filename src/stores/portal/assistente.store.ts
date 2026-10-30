import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'

// ============================================================
// Tipos
// ============================================================
export interface Mensagem {
  tipo: 'bot' | 'user'
  texto: string
  hora: string
}

export interface Sugestao {
  icon: string
  texto: string
}

// ============================================================
// Helpers
// ============================================================
function agora(): string {
  return new Date().toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function mensagemInicial(): Mensagem {
  return {
    tipo: 'bot',
    texto:
      'Olá! Sou o assistente do SICAM. Em que posso ajudar? Pode perguntar sobre carta de condução, veículos, multas, seguro ou inspecção.',
    hora: agora(),
  }
}

// Ignora acentos e maiúsculas
function normalizar(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// ============================================================
// Store
// ============================================================
export const usePortalAssistenteStore = defineStore('portalAssistente', () => {
  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const pergunta = ref('')
  const carregando = ref(false)
  const messagesEl = ref<HTMLElement | null>(null)
  const inputEl = ref<HTMLInputElement | null>(null)

  const mensagens = ref<Mensagem[]>([mensagemInicial()])

  const sugestoes: Sugestao[] = [
    { icon: 'badge', texto: 'Como renovar a carta?' },
    { icon: 'receipt_long', texto: 'Como pagar uma multa?' },
    { icon: 'shield', texto: 'Qual a validade do seguro?' },
    { icon: 'build', texto: 'Quando é a próxima inspecção?' },
  ]

  // ----------------------------------------------------------
  // Motor de respostas (mock)
  // ----------------------------------------------------------
  function respostaMock(t: string): string {
    const q = normalizar(t)

    if (q.includes('carta')) {
      return 'Para renovar a carta de condução deve dirigir-se a um centro do INATRO com: carta actual, exame médico, 2 fotografias e comprovativo de residência. O prazo é 30 dias antes da validade.'
    }

    if (q.includes('multa')) {
      return 'Pode pagar multas no portal do GESTMUL, em postos de atendimento ou por transferência bancária. Tem 15 dias para contestar. Guarde sempre o comprovativo.'
    }

    if (q.includes('seguro')) {
      return 'O seguro obrigatório deve estar sempre válido. Sem seguro é considerada infracção grave. Verifique a data de validade na sua apólice.'
    }

    if (q.includes('inspec')) {
      return 'A inspecção é: a cada 2 anos (até 4 anos), anual (4 a 8 anos) e semestral (mais de 8 anos). Leve documento do veículo, seguro válido e o veículo limpo.'
    }

    return 'Não tenho ainda informação específica sobre isso. Experimente perguntar sobre carta, multas, seguro ou inspecção. Para questões mais detalhadas, contacte o posto mais próximo.'
  }

  // ----------------------------------------------------------
  // Scroll
  // ----------------------------------------------------------
  function scrollFim() {
    nextTick(() => {
      messagesEl.value?.scrollTo({
        top: messagesEl.value.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  async function enviar(texto?: string) {
    const t = (texto ?? pergunta.value).trim()
    if (!t || carregando.value) return

    mensagens.value.push({ tipo: 'user', texto: t, hora: agora() })
    pergunta.value = ''
    carregando.value = true
    scrollFim()

    await new Promise((r) => setTimeout(r, 800))

    mensagens.value.push({
      tipo: 'bot',
      texto: respostaMock(t),
      hora: agora(),
    })
    carregando.value = false
    scrollFim()
    inputEl.value?.focus()
  }

  function novaConversa() {
    mensagens.value = [mensagemInicial()]
    pergunta.value = ''
    nextTick(() => inputEl.value?.focus())
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado
    pergunta,
    carregando,
    messagesEl,
    inputEl,
    mensagens,
    sugestoes,

    // acções
    enviar,
    novaConversa,
    scrollFim,
  }
})