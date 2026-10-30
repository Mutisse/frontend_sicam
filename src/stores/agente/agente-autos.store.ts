// src/stores/agente/agente-autos.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  autosService,
  type AutoNoticia,
  type Infracao,
  type CriarAutoPayload,
} from '@/services/agente/autos.service'
import { extrairErro } from '@/boot/axios'

export type { AutoNoticia, Infracao }

export const useAgenteAutosStore = defineStore('agenteAutos', () => {
  // ----------------------------------------------------------
  // Estado remoto
  // ----------------------------------------------------------
  const aCarregar = ref(false)
  const aGerar = ref(false)
  const erro = ref<string | null>(null)

  const autosHoje = ref<AutoNoticia[]>([])
  const infracoes = ref<Infracao[]>([])

  // ----------------------------------------------------------
  // Formulário
  // ----------------------------------------------------------
  const matricula = ref<string>(
    sessionStorage.getItem('sicam.matricula-atual') ?? '',
  )
  const infracaoCodigo = ref<string>('')
  const local = ref<string>('')
  const observacoes = ref<string>('')

  // ----------------------------------------------------------
  // Pré-visualização (após gerar)
  // ----------------------------------------------------------
  const preview = ref<boolean>(false)
  const codigoPreview = ref<string>('')
  const textoPreview = ref<string>('')

  // ----------------------------------------------------------
  // Agente (vem do auth, mas guardamos aqui)
  // ----------------------------------------------------------
  const agenteNome = ref<string>('Agente')
  const postoActual = ref<string>(
    sessionStorage.getItem('sicam.posto-atual') ?? 'Posto',
  )

  // ----------------------------------------------------------
  // Getters
  // ----------------------------------------------------------
  const podeGerar = computed<boolean>(
    () =>
      matricula.value.trim().length >= 6 &&
      infracaoCodigo.value.length > 0 &&
      !aGerar.value,
  )

  const infracaoSelecionada = computed<Infracao | null>(
    () => infracoes.value.find((i) => i.codigo === infracaoCodigo.value) ?? null,
  )

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return
    aCarregar.value = true
    erro.value = null

    try {
      const dados = await autosService.listar()
      autosHoje.value = dados.items
      infracoes.value = dados.infracoes
      totalHoje.value = dados.totalHoje

      // Só define a primeira infracção se ainda não houver nenhuma
      if (!infracaoCodigo.value && dados.infracoes.length > 0) {
        infracaoCodigo.value = dados.infracoes[0]!.codigo
      }
    } catch (e) {
      erro.value = extrairErro(e)
    } finally {
      aCarregar.value = false
    }
  }

  const totalHoje = ref<number>(0)

  function setAgente(nome: string) {
    agenteNome.value = nome || 'Agente'
  }

  function onMatriculaInput(valor: string): string {
    return valor.toUpperCase().replace(/[^A-Z0-9-]/g, '')
  }

  async function gerar(): Promise<{ ok: boolean; codigo?: string }> {
    if (!podeGerar.value) return { ok: false }

    aGerar.value = true
    erro.value = null

    try {
      const payload: CriarAutoPayload = {
        matricula: matricula.value.trim().toUpperCase(),
        infracao_codigo: infracaoCodigo.value,
      }
      if (local.value.trim()) payload.local = local.value.trim()
      if (observacoes.value.trim()) payload.observacoes = observacoes.value.trim()

      const res = await autosService.criar(payload)

      // Atualiza preview
      preview.value = true
      codigoPreview.value = res.auto.codigo
      textoPreview.value = res.texto

      // Insere no topo da lista
      autosHoje.value.unshift(res.auto)
      totalHoje.value = autosHoje.value.length

      return { ok: true, codigo: res.auto.codigo }
    } catch (e) {
      erro.value = extrairErro(e)
      return { ok: false }
    } finally {
      aGerar.value = false
    }
  }

  async function imprimir(id: string) {
    try {
      const res = await autosService.imprimir(id)
      // Substitui na lista
      const idx = autosHoje.value.findIndex((a) => a.id === id)
      if (idx !== -1) autosHoje.value[idx] = res.auto
    } catch (e) {
      erro.value = extrairErro(e)
    }
  }

  function gerarTextoParaCopiar(): string {
    if (textoPreview.value) return textoPreview.value

    const mat = matricula.value.toUpperCase()
    const inf = infracaoSelecionada.value?.label ?? '—'
    const partes = [
      `AUTO DE NOTÍCIA — ${codigoPreview.value || '(rascunho)'}`,
      '',
      `Matrícula: ${mat || '—'}`,
      `Infração: ${inf}`,
      local.value ? `Local: ${local.value}` : '',
      observacoes.value ? `Observações: ${observacoes.value}` : '',
    ]
    return partes.filter(Boolean).join('\n')
  }

  function reset() {
    matricula.value = sessionStorage.getItem('sicam.matricula-atual') ?? ''
    infracaoCodigo.value = infracoes.value[0]?.codigo ?? ''
    local.value = ''
    observacoes.value = ''
    preview.value = false
    codigoPreview.value = ''
    textoPreview.value = ''
    erro.value = null
  }

  function formatarMT(valor: number): string {
    return `${valor.toLocaleString('pt-MZ')} MT`
  }

  return {
    // estado
    aCarregar,
    aGerar,
    erro,

    // listas
    autosHoje,
    infracoes,
    totalHoje,

    // form
    matricula,
    infracaoCodigo,
    local,
    observacoes,

    // preview
    preview,
    codigoPreview,
    textoPreview,

    // agente
    agenteNome,
    postoActual,

    // getters
    podeGerar,
    infracaoSelecionada,

    // acções
    carregar,
    setAgente,
    onMatriculaInput,
    gerar,
    imprimir,
    gerarTextoParaCopiar,
    reset,

    // helpers
    formatarMT,
  }
})