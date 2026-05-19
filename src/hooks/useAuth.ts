import { createContext, useContext } from 'react'
import type { Usuario } from '../types'

export interface AuthContextValue {
  user: Usuario | null
  token: string | null
  login: (token: string, user: Usuario) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}
