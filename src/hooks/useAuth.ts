import { createContext, useContext } from 'react'
import type { Usuario } from '../types'

export interface AuthContextValue {
  user: Usuario | null
  token: string | null
  login: (token: string, user: Usuario, lembrar?: boolean) => void
  logout: () => void
  updateUser: (partial: Partial<Usuario>) => void
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}
