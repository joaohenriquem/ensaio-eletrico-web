import api from './client'
import type { LoginResponse, MfaResponse, UsuarioAdmin, LoginLog } from '../types'

export async function login(username: string, password: string): Promise<MfaResponse> {
  const { data } = await api.post<MfaResponse>('/auth/login', { username, password })
  return data
}

export async function verifyOtp(userId: string, otp: string, latitude?: number, longitude?: number, lembrar?: boolean): Promise<LoginResponse & { trocarSenha?: boolean }> {
  const { data } = await api.post<LoginResponse & { trocarSenha?: boolean }>('/auth/verify-otp', { userId, otp, latitude, longitude, lembrar })
  return data
}

export async function refreshToken(): Promise<{ token: string }> {
  const { data } = await api.post<{ token: string }>('/auth/refresh')
  return data
}

export async function changePassword(novaSenha: string): Promise<void> {
  await api.post('/auth/change-password', { novaSenha })
}

export async function buscarMeuPerfil(): Promise<import('../types').Usuario> {
  const { data } = await api.get<import('../types').Usuario>('/auth/me')
  return data
}

export async function atualizarFotoPerfil(foto_url: string): Promise<void> {
  await api.put('/auth/me/foto', { foto_url })
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

export interface DadosEdicaoUsuario {
  nome?: string
  email?: string
  username?: string
  perfil?: string
  novaSenha?: string
  trocar_senha?: boolean
  foto_url?: string
}

export interface DadosCriacaoUsuarioAdmin {
  nome: string
  email: string
  username: string
  senha: string
  perfil?: string
  trocar_senha?: boolean
}

export async function criarUsuarioAdmin(dados: DadosCriacaoUsuarioAdmin): Promise<void> {
  await api.post('/auth/usuarios', dados)
}

export async function editarUsuario(id: string, dados: DadosEdicaoUsuario): Promise<void> {
  await api.put(`/auth/usuarios/${id}`, dados)
}

export async function aprovarUsuario(id: string): Promise<void> {
  await api.put(`/auth/usuarios/${id}/aprovar`)
}

export async function rejeitarUsuario(id: string, motivo?: string): Promise<void> {
  await api.put(`/auth/usuarios/${id}/rejeitar`, { motivo })
}

export async function esqueceuSenha(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email })
}

export async function redefinirSenha(token: string, novaSenha: string): Promise<void> {
  await api.post('/auth/reset-password', { token, novaSenha })
}

export async function listarLoginLogs(): Promise<LoginLog[]> {
  const { data } = await api.get<LoginLog[]>('/auth/login-logs')
  return data
}
