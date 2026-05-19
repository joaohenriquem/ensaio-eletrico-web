import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarClientes, criarCliente, atualizarCliente } from '../api/clientes'
import type { Cliente } from '../types'

export function useClientes(params?: { ativo?: boolean; busca?: string }) {
  return useQuery({
    queryKey: ['clientes', params],
    queryFn: () => listarClientes(params),
  })
}

export function useCriarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Cliente, '_id' | 'criado_em'>) => criarCliente(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  })
}

export function useAtualizarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cliente> }) =>
      atualizarCliente(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  })
}
