// src/boot/axios.ts
import axios, { type AxiosInstance, type AxiosError } from 'axios'

// ============================================================
// URL da API
// ============================================================
const API_PADRAO = 'http://localhost:8000'

const baseURL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? API_PADRAO

if (import.meta.env.DEV) {
  console.log('[axios] baseURL =', baseURL)
}

// ============================================================
// Instância Axios — Sanctum SPA
// ============================================================
const http: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout: 60000,
})

// ------------------------------------------------------------
// Interceptor REQUEST — log de debug
// ------------------------------------------------------------
http.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      const method = (config.method ?? 'get').toUpperCase()
      console.log(`[API] ${method} ${config.baseURL}${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ------------------------------------------------------------
// Interceptor RESPONSE — trata 401 (sessão expirada)
// ------------------------------------------------------------
let aRedirecionar = false  // ⭐ evita loops

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401 — sessão expirada
    if (error.response?.status === 401) {
      // Não redirecionar em rotas públicas
      const url = error.config?.url ?? ''
      if (url.includes('/auth/login') || url.includes('/auth/me')) {
        // Login falhou OU me() sem sessão → é normal, deixar passar
        return Promise.reject(error)
      }

      // Outras rotas com 401 → sessão expirou, redirecionar
      if (!aRedirecionar && !window.location.hash.includes('/login')) {
        aRedirecionar = true

        // Limpar dados locais
        localStorage.removeItem('sicam.user')

        // Ir para login
        window.location.hash = '#/login'

        // Reset após 1s
        setTimeout(() => (aRedirecionar = false), 1000)
      }
    }

    return Promise.reject(error)
  },
)

export default http

// ============================================================
// CSRF
// ============================================================
let csrfObtido = false

export async function garantirCsrf(): Promise<void> {
  if (csrfObtido) return

  try {
    await http.get('/sanctum/csrf-cookie')
    csrfObtido = true
    await new Promise((r) => setTimeout(r, 100))
  } catch (e) {
    console.error('Erro ao obter CSRF cookie:', e)
    throw e
  }
}

export function resetCsrf(): void {
  csrfObtido = false
}

// ============================================================
// Tipos de erro do Laravel
// ============================================================
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// ============================================================
// Helper — extrair mensagem de erro
// ============================================================
export function extrairErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined

    if (data?.errors) {
      const primeiro = Object.values(data.errors)[0]
      if (Array.isArray(primeiro) && primeiro[0]) return primeiro[0]
    }

    if (data?.message) return data.message

    const status = error.response?.status
    if (status === 401) return 'Sessão expirada. Faça login novamente.'
    if (status === 403) return 'Sem permissão para esta acção.'
    if (status === 404) return 'Recurso não encontrado.'
    if (status === 419) return 'CSRF token expirado. Recarregue a página.'
    if (status === 422) return 'Dados inválidos.'
    if (status === 500) return 'Erro no servidor. Tente novamente.'

    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Erro desconhecido'
}