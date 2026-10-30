import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'

// ============================================================
// Tipos
// ============================================================
export type Autor = 'bot' | 'user'

export interface Mensagem {
  autor: Autor
  texto: string
  hora: string
}

// ============================================================
// Helpers
// ============================================================
function hora(): string {
  const d = new Date()
  return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

// ============================================================
// Store
// ============================================================
export const useAgenteChatStore = defineStore('agenteChat', () => {
  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const texto = ref('')
  const aEscrever = ref(false)
  const scrollEl = ref<HTMLElement | null>(null)

  const sugestoes = ref<string[]>([
    'Consultar AGL-482-MC',
    'Ver hotlist',
    'Gerar auto',
  ])

  const mensagens = ref<Mensagem[]>([
    {
      autor: 'bot',
      texto: 'Olá Chissano! Sou o assistente SICAM. Em que posso ajudar?',
      hora: hora(),
    },
  ])

  // ----------------------------------------------------------
  // Scroll
  // ----------------------------------------------------------
  async function scrollParaFim() {
    await nextTick()
    scrollEl.value?.scrollTo({
      top: scrollEl.value.scrollHeight,
      behavior: 'smooth',
    })
  }

  // ----------------------------------------------------------
  // Motor de respostas
  // ----------------------------------------------------------
  function responder(pergunta: string): Mensagem {
    const t = pergunta.toLowerCase()

    if (t.includes('hotlist')) {
      return {
        autor: 'bot',
        texto: 'Há 4 veículos na hotlist activa.',
        hora: hora(),
      }
    }

    if (t.includes('auto')) {
      return {
        autor: 'bot',
        texto: 'Posso ajudar a gerar um auto. Quer abrir o formulário?',
        hora: hora(),
      }
    }

    if (t.includes('ajuda')) {
      return {
        autor: 'bot',
        texto:
          'Posso ajudar com:\n• Consultar matrículas\n• Ver a hotlist\n• Gerar autos',
        hora: hora(),
      }
    }

    return {
      autor: 'bot',
      texto:
        'Não entendi. Tente: "Consultar AGL-482-MC", "Ver hotlist" ou "Gerar auto".',
      hora: hora(),
    }
  }

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  function enviar(conteudo?: string) {
    const t = (conteudo ?? texto.value).trim()
    if (!t) return

    mensagens.value.push({ autor: 'user', texto: t, hora: hora() })
    texto.value = ''
    scrollParaFim()

    aEscrever.value = true
    setTimeout(() => {
      aEscrever.value = false
      mensagens.value.push(responder(t))
      scrollParaFim()
    }, 700)
  }

  function reset() {
    texto.value = ''
    aEscrever.value = false
    mensagens.value = [
      {
        autor: 'bot',
        texto: 'Olá Chissano! Sou o assistente SICAM. Em que posso ajudar?',
        hora: hora(),
      },
    ]
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estado
    texto,
    aEscrever,
    scrollEl,
    mensagens,
    sugestoes,

    // acções
    enviar,
    scrollParaFim,
    reset,
    responder,
  }
})