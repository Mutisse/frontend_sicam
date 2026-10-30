import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// ============================================================
// Tipos
// ============================================================
export type Cat = 'carta' | 'veiculo' | 'multas' | 'seguro' | 'inspecao'

export interface Faq {
  cat: Cat
  pergunta: string
  resposta: string
}

export interface Categoria {
  key: string
  label: string
  icon: string
}

// ============================================================
// Helpers
// ============================================================
function normalizar(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// ============================================================
// Store
// ============================================================
export const usePortalFaqStore = defineStore('portalFaq', () => {
  // ----------------------------------------------------------
  // Categorias
  // ----------------------------------------------------------
  const categorias: Categoria[] = [
    { key: 'todas',    label: 'Todas',     icon: 'apps' },
    { key: 'carta',    label: 'Carta',     icon: 'badge' },
    { key: 'veiculo',  label: 'Veículo',   icon: 'directions_car' },
    { key: 'multas',   label: 'Multas',    icon: 'receipt_long' },
    { key: 'seguro',   label: 'Seguro',    icon: 'shield' },
    { key: 'inspecao', label: 'Inspecção', icon: 'build' },
  ]

  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const categoriaActiva = ref('todas')
  const pesquisa = ref('')

  // ----------------------------------------------------------
  // Perguntas frequentes
  // ----------------------------------------------------------
  const faq: Faq[] = [
    {
      cat: 'carta',
      pergunta: 'Como renovar a carta de condução?',
      resposta:
        'Deve dirigir-se a um centro de renovação do INATRO com: carta actual, exame médico recente, 2 fotografias tipo passe e comprovativo de residência. O prazo de renovação é de 30 dias antes da data de validade.',
    },
    {
      cat: 'carta',
      pergunta: 'Qual é a validade da carta de condução?',
      resposta:
        'A carta é válida por 5 anos para condutores até aos 60 anos, e por 2 anos acima dessa idade. A validade está impressa no próprio documento.',
    },
    {
      cat: 'veiculo',
      pergunta: 'Como registar um veículo novo?',
      resposta:
        'O registo deve ser feito no INATRO em até 30 dias após a compra. Precisa de: factura, documento de identidade do proprietário, comprovativo de residência e comprovativo de pagamento do imposto.',
    },
    {
      cat: 'multas',
      pergunta: 'Como pagar uma multa?',
      resposta:
        'Pode pagar no portal do GESTMUL, em qualquer posto de atendimento, ou por transferência bancária. Após pagamento, guarde o comprovativo por pelo menos 1 ano.',
    },
    {
      cat: 'multas',
      pergunta: 'Posso contestar uma multa?',
      resposta:
        'Sim. Tem 15 dias úteis após receber a notificação para contestar. Dirija-se ao posto emissor da multa com o documento da infracção e a sua justificação por escrito.',
    },
    {
      cat: 'seguro',
      pergunta: 'Qual é o valor mínimo do seguro obrigatório?',
      resposta:
        'Os valores variam por tipo de veículo e região. Consulte a tabela actualizada no site do ISSM. A falta de seguro válido é considerada infracção grave.',
    },
    {
      cat: 'inspecao',
      pergunta: 'De quanto em quanto tempo devo fazer inspecção?',
      resposta:
        'Veículos com menos de 4 anos: a cada 2 anos. Entre 4 e 8 anos: anual. Mais de 8 anos: semestral. O resultado é registado no sistema INATRO.',
    },
    {
      cat: 'inspecao',
      pergunta: 'O que preciso para a inspecção?',
      resposta:
        'Documento único do veículo, comprovativo de seguro válido, e o veículo deve estar limpo e em condições de circulação. Alguns postos exigem marcação prévia.',
    },
  ]

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const correspondePesquisa = computed(() => {
    const q = normalizar(pesquisa.value.trim())
    if (!q) return faq
    return faq.filter((f) =>
      normalizar(f.pergunta + ' ' + f.resposta).includes(q),
    )
  })

  const categoriasComContagem = computed(() =>
    categorias.map((c) => ({
      ...c,
      n:
        c.key === 'todas'
          ? correspondePesquisa.value.length
          : correspondePesquisa.value.filter((f) => f.cat === c.key).length,
    })),
  )

  const filtrados = computed(() =>
    categoriaActiva.value === 'todas'
      ? correspondePesquisa.value
      : correspondePesquisa.value.filter((f) => f.cat === categoriaActiva.value),
  )

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function iconeCategoria(cat: Cat): string {
    return categorias.find((c) => c.key === cat)?.icon ?? 'help'
  }

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  function setCategoria(key: string) {
    categoriaActiva.value = key
  }

  function limpar() {
    pesquisa.value = ''
    categoriaActiva.value = 'todas'
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // estrutura
    categorias,
    faq,

    // estado
    categoriaActiva,
    pesquisa,

    // getters
    correspondePesquisa,
    categoriasComContagem,
    filtrados,

    // helpers
    iconeCategoria,

    // acções
    setCategoria,
    limpar,
  }
})