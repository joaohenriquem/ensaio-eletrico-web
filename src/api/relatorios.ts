import api from './client'
import type { Relatorio } from '../types'

export async function listarRelatorios(params?: { status?: string }): Promise<Relatorio[]> {
  const { data } = await api.get<Relatorio[]>('/relatorios', { params })
  return data
}

export async function buscarRelatorio(id: string): Promise<Relatorio> {
  const { data } = await api.get<Relatorio>(`/relatorios/${id}`)
  return data
}

export async function criarRelatorio(payload: Omit<Relatorio, '_id' | 'numero' | 'criado_em'>): Promise<{ id: string; numero: string }> {
  const { data } = await api.post<{ id: string; numero: string }>('/relatorios', payload)
  return data
}

export async function atualizarRelatorio(id: string, payload: Partial<Relatorio>): Promise<void> {
  await api.put(`/relatorios/${id}`, payload)
}

export async function baixarPdfRelatorio(id: string, numero: string): Promise<void> {
  const { data } = await api.get(`/relatorios/${id}/pdf`, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${numero}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
