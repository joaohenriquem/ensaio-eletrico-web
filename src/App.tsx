import { useState, useEffect, useRef, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient } from './queryClient'
import { queryPersister } from './offline/queryPersister'
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
import Contratos from './pages/Contratos'
import AssinarContrato from './pages/AssinarContrato'
import PwaUpdatePrompt from './components/PwaUpdatePrompt'
import { iniciarSincronizacaoAutomatica } from './offline/sync'

const PERSISTED_QUERY_KEYS = ['clientes', 'relatorios', 'ordens']

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

    async function getIpGeo(): Promise<{ latitude: number; longitude: number } | null> {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        if (data.latitude && data.longitude) {
          return { latitude: Number(data.latitude), longitude: Number(data.longitude) }
        }
      } catch { /* ignora */ }
      return null
    }

    async function getGeo(): Promise<{ latitude: number; longitude: number } | null> {
      if (!navigator.geolocation) return getIpGeo()
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          async () => resolve(await getIpGeo()),
          { timeout: 8000, maximumAge: 60000 }
        )
      })
    }

    getGeo().then((geo) => {
      refreshToken(geo?.latitude, geo?.longitude)
        .then((res) => {
          localStorage.setItem('token', res.token)
          setToken(res.token)
        })
        .catch(() => {})
    })
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
  useEffect(() => iniciarSincronizacaoAutomatica(), [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 1000 * 60 * 60 * 24,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success' &&
            PERSISTED_QUERY_KEYS.includes(query.queryKey[0] as string),
        },
      }}
    >
      <PwaUpdatePrompt />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/trocar-senha" element={<TrocarSenha />} />
            <Route path="/assinar-contrato/:id" element={<AssinarContrato />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
            <Route path="/ordens" element={<PrivateRoute><OrdensServico /></PrivateRoute>} />
            <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
            <Route path="/propostas" element={<PrivateRoute><Propostas /></PrivateRoute>} />
            <Route path="/contratos" element={<PrivateRoute><Contratos /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </PersistQueryClientProvider>
  )
}
