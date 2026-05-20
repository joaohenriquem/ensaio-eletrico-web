import api from './client'
import type { Proposta } from '../types'

export async function listarPropostas(params?: { status?: string; cliente?: string }): Promise<Proposta[]> {
  const { data } = await api.get<Proposta[]>('/propostas', { params })
  return data
}

export async function buscarProposta(id: string): Promise<Proposta> {
  const { data } = await api.get<Proposta>(`/propostas/${id}`)
  return data
}

export async function criarProposta(payload: Omit<Proposta, '_id' | 'numero' | 'criado_em'>): Promise<{ id: string; numero: string }> {
  const { data } = await api.post<{ id: string; numero: string }>('/propostas', payload)
  return data
}

export async function atualizarProposta(id: string, payload: Partial<Proposta>): Promise<void> {
  await api.put(`/propostas/${id}`, payload)
}

export async function baixarPdfProposta(id: string, numero: string): Promise<void> {
  const { data } = await api.get(`/propostas/${id}/pdf`, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${numero}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export async function excluirProposta(id: string): Promise<void> {
  await api.delete(`/propostas/${id}`)
}
