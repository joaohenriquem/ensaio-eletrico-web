import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarPropostas, criarProposta, atualizarProposta, excluirProposta } from '../api/propostas'
import type { Proposta } from '../types'

export function usePropostas(params?: { status?: string; cliente?: string }) {
  return useQuery({
    queryKey: ['propostas', params],
    queryFn: () => listarPropostas(params),
  })
}

export function useCriarProposta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Proposta, '_id' | 'numero' | 'criado_em'>) => criarProposta(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['propostas'] }),
  })
}

export function useAtualizarProposta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Proposta> }) =>
      atualizarProposta(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['propostas'] }),
  })
}

export function useExcluirProposta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => excluirProposta(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['propostas'] }),
  })
}
