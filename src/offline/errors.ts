import axios from 'axios'

/**
 * Verdadeiro só quando a requisição não chegou a ter resposta do servidor
 * (falha de rede/timeout). Erros com resposta (400/401/500 etc.) são erros
 * reais que devem continuar aparecendo pro usuário normalmente, não entrar
 * na fila offline.
 */
export function isNetworkError(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response
}

export function isAuthError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 401
}
