import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// O motor de sincronização offline (src/offline/sync.ts) liga esse modo
// enquanto drena a fila: um 401 nesse contexto não deve tirar o usuário da
// tela em que está (pode ter passado horas offline em campo) — o sync.ts
// trata esse caso separadamente e avisa pela UI em vez de redirecionar.
let modoSync = false
export function definirModoSync(ativo: boolean) {
  modoSync = ativo
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !modoSync) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('lembrar')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
