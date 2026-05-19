import api from './client'
import type { LoginResponse, UsuarioAdmin } from '../types'

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { username, password })
  return data
}

export interface DadosCadastro {
  nome: string
  email: string
  username: string
  senha: string
  perfil?: string
}

export async function registrar(dados: DadosCadastro): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/register', dados)
  return data
}

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const { data } = await api.get<UsuarioAdmin[]>('/auth/usuarios')
  return data
}

export async function aprovarUsuario(id: string): Promise<void> {
  await api.put(`/auth/usuarios/${id}/aprovar`)
}

export async function rejeitarUsuario(id: string, motivo?: string): Promise<void> {
  await api.put(`/auth/usuarios/${id}/rejeitar`, { motivo })
}
