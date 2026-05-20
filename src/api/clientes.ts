import api from './client'
import type { Cliente } from '../types'

export async function listarClientes(params?: { ativo?: boolean; busca?: string }): Promise<Cliente[]> {
  const { data } = await api.get<Cliente[]>('/clientes', { params })
  return data
}

export async function criarCliente(payload: Omit<Cliente, '_id' | 'criado_em'>): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>('/clientes', payload)
  return data
}

export async function atualizarCliente(id: string, payload: Partial<Cliente>): Promise<void> {
  await api.put(`/clientes/${id}`, payload)
}

export async function excluirCliente(id: string): Promise<void> {
  await api.delete(`/clientes/${id}`)
}
