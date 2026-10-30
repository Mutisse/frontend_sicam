import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// ============================================================
// Tipos
// ============================================================
export type Categoria = 'inspeccao' | 'seguro' | 'multas' | 'avisos'

export interface Noticia {
  id: number
  data: string
  categoria: Categoria
  categoriaLabel: string
  titulo: string
  resumo: string
}

export interface CategoriaInfo {
  label: string
  icon: string
}

export interface CategoriaChip {
  valor: '' | Categoria
  label: string
  icon: string
  n: number
}

// ============================================================
// Info por categoria (ícone + label)
// ============================================================
const INFO: Record<Categoria, CategoriaInfo> = {
  inspeccao: { label: 'Inspecção', icon: 'fact_check' },
  seguro:    { label: 'Seguro',    icon: 'verified_user' },
  multas:    { label: 'Multas',    icon: 'receipt_long' },
  avisos:    { label: 'Avisos',    icon: 'campaign' },
}

// ============================================================
// Helpers
// ============================================================
function partesData(data: string) {
  const [dia = '', mes = '', ano = ''] = data.split(' ')
  return { dia, mes, ano }
}

// ============================================================
// Store
// ============================================================
export const usePortalNoticiasStore = defineStore('portalNoticias', () => {
  // ----------------------------------------------------------
  // Dados
  // ----------------------------------------------------------
  const noticias: Noticia[] = [
    {
      id: 1,
      data: '23 Set 2026',
      categoria: 'inspeccao',
      categoriaLabel: 'Inspecção',
      titulo: 'Nova campanha de inspecção em Maputo',
      resumo:
        'Postos móveis vão estar em 5 locais da cidade durante Outubro. Consulte o calendário e evite filas.',
    },
    {
      id: 2,
      data: '20 Set 2026',
      categoria: 'seguro',
      categoriaLabel: 'Seguro',
      titulo: 'Seguro obrigatório: prazos 2026',
      resumo:
        'Novos valores e datas de renovação já disponíveis. Confirme se o seu seguro está válido.',
    },
    {
      id: 3,
      data: '15 Set 2026',
      categoria: 'multas',
      categoriaLabel: 'Multas',
      titulo: 'Multas: como pagar online',
      resumo: 'Passo-a-passo para liquidar multas pela plataforma SICAM sem sair de casa.',
    },
    {
      id: 4,
      data: '10 Set 2026',
      categoria: 'avisos',
      categoriaLabel: 'Avisos',
      titulo: 'Alterações no código de estrada',
      resumo: 'Novas regras para transporte de crianças entraram em vigor este mês.',
    },
  ]

  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const filtro = ref<'' | Categoria>('')

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const categorias = computed<CategoriaChip[]>(() => [
    { valor: '', label: 'Todas', icon: '', n: noticias.length },
    ...(Object.keys(INFO) as Categoria[]).map((k) => ({
      valor: k,
      label: INFO[k].label,
      icon: INFO[k].icon,
      n: noticias.filter((n) => n.categoria === k).length,
    })),
  ])

  const filtradas = computed(() =>
    noticias.filter((n) => !filtro.value || n.categoria === filtro.value),
  )

  const destaque = computed(() => filtradas.value[0] ?? null)
  const restantes = computed(() => filtradas.value.slice(1))

  // ----------------------------------------------------------
  // Helpers expostos
  // ----------------------------------------------------------
  function infoCategoria(c: Categoria): CategoriaInfo {
    return INFO[c]
  }

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  function setFiltro(v: '' | Categoria) {
    filtro.value = v
  }

  function limparFiltro() {
    filtro.value = ''
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    // dados
    noticias,

    // estado
    filtro,

    // getters
    categorias,
    filtradas,
    destaque,
    restantes,

    // helpers
    infoCategoria,
    partesData,

    // acções
    setFiltro,
    limparFiltro,
  }
})