import { useState, useEffect, useRef, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext, type AuthContextValue } from './hooks/useAuth'
import { buscarMeuPerfil, refreshToken } from './api/auth'
import { useAuth } from './hooks/useAuth'
import type { Usuario } from './types'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import EsqueciSenha from './pages/EsqueciSenha'
import RedefinirSenha from './pages/RedefinirSenha'
import TrocarSenha from './pages/TrocarSenha'
import Usuarios from './pages/Usuarios'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import OrdensServico from './pages/OrdensServico'
import Relatorios from './pages/Relatorios'
import Propostas from './pages/Propostas'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? (JSON.parse(stored) as Usuario) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const refreshedRef = useRef(false)

  const authLogin = (t: string, u: Usuario, lembrar?: boolean) => {
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    if (lembrar) localStorage.setItem('lembrar', '1')
    else localStorage.removeItem('lembrar')
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('lembrar')
    setToken(null)
    setUser(null)
    queryClient.clear()
  }

  const updateUser = (partial: Partial<Usuario>) => {
    const updated = user ? { ...user, ...partial } : null
    if (updated) {
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
    }
  }

  // Renova o token na inicialização se "manter conectado" estiver ativo
  useEffect(() => {
    const currentToken = localStorage.getItem('token')
    if (!currentToken || refreshedRef.current) return
    if (localStorage.getItem('lembrar') !== '1') return
    refreshedRef.current = true
    refreshToken()
      .then((res) => {
        localStorage.setItem('token', res.token)
        setToken(res.token)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!token) return
    buscarMeuPerfil()
      .then((perfil) => setUser((u) => u ? { ...u, ...perfil } : perfil))
      .catch(() => {})
  }, [token])

  const value: AuthContextValue = { user, token, login: authLogin, logout, updateUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token')
  const { updateUser } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <Layout onFotoChange={(url) => updateUser({ foto_url: url })}>{children}</Layout>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/trocar-senha" element={<TrocarSenha />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
            <Route path="/ordens" element={<PrivateRoute><OrdensServico /></PrivateRoute>} />
            <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
            <Route path="/propostas" element={<PrivateRoute><Propostas /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
