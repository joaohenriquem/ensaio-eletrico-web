import api from './client'
import type { OrdemServico } from '../types'

export async function listarOrdens(params?: {
  status?: string
  tipo?: string
  cliente?: string
}): Promise<OrdemServico[]> {
  const { data } = await api.get<OrdemServico[]>('/ordens', { params })
  return data
}

export async function criarOrdem(payload: Omit<OrdemServico, '_id' | 'numero' | 'criado_em'>): Promise<{ id: string; numero: string }> {
  const { data } = await api.post<{ id: string; numero: string }>('/ordens', payload)
  return data
}

export async function atualizarOrdem(id: string, payload: Partial<OrdemServico> & { _email_conclusao?: string }): Promise<void> {
  await api.put(`/ordens/${id}`, payload)
}

export async function enviarEmailOS(id: string, destinatario: string, tipo: 'aprovacao' | 'conclusao'): Promise<void> {
  await api.post(`/ordens/${id}/email`, { destinatario, tipo })
}
