import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarContratos, criarContrato, atualizarContrato, excluirContrato } from '../api/contratos'
import type { Contrato } from '../types'

export function useContratos(params?: { status?: string; cliente?: string }) {
  return useQuery({
    queryKey: ['contratos', params],
    queryFn: () => listarContratos(params),
  })
}

export function useCriarContrato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Contrato, '_id' | 'numero' | 'criado_em'>) => criarContrato(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contratos'] }),
  })
}

export function useAtualizarContrato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contrato> }) =>
      atualizarContrato(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contratos'] }),
  })
}

export function useExcluirContrato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => excluirContrato(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contratos'] }),
  })
}
