import axios from 'axios'
import api from './client'
import type { Contrato, ContratoPublico } from '../types'

export async function listarContratos(params?: { status?: string; cliente?: string }): Promise<Contrato[]> {
  const { data } = await api.get<Contrato[]>('/contratos', { params })
  return data
}

export async function buscarContrato(id: string): Promise<Contrato> {
  const { data } = await api.get<Contrato>(`/contratos/${id}`)
  return data
}

export async function criarContrato(payload: Omit<Contrato, '_id' | 'numero' | 'criado_em'>): Promise<{ id: string; numero: string }> {
  const { data } = await api.post<{ id: string; numero: string }>('/contratos', payload)
  return data
}

export async function atualizarContrato(id: string, payload: Partial<Contrato>): Promise<void> {
  await api.put(`/contratos/${id}`, payload)
}

export async function excluirContrato(id: string): Promise<void> {
  await api.delete(`/contratos/${id}`)
}

export async function baixarPdfContrato(id: string, numero: string): Promise<void> {
  const { data } = await api.get(`/contratos/${id}/pdf`, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${numero}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export async function gerarLinkAssinatura(id: string): Promise<string> {
  const { data } = await api.get<{ token: string }>(`/contratos/${id}/link`)
  return `${window.location.origin}/assinar-contrato/${id}?token=${data.token}`
}

export async function enviarEmailContrato(id: string, destinatario: string): Promise<void> {
  await api.post(`/contratos/${id}/email`, { destinatario })
}

// ── API pública (página de assinatura do cliente — sem login) ─────────────

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
})

export async function buscarContratoPublico(id: string, token: string): Promise<ContratoPublico> {
  const { data } = await publicApi.get<ContratoPublico>(`/contratos/${id}/publico`, { params: { token } })
  return data
}

export async function assinarContratoPublico(id: string, token: string, nome: string, assinatura: string): Promise<void> {
  await publicApi.post(`/contratos/${id}/assinar`, { nome, assinatura }, { params: { token } })
}

export async function baixarPdfContratoPublico(id: string, token: string, numero: string): Promise<void> {
  const { data } = await publicApi.get(`/contratos/${id}/pdf-publico`, { params: { token }, responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${numero}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
