import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarRelatorios, criarRelatorio, atualizarRelatorio } from '../api/relatorios'
import type { Relatorio } from '../types'

export function useRelatorios(params?: { status?: string }) {
  return useQuery({
    queryKey: ['relatorios', params],
    queryFn: () => listarRelatorios(params),
  })
}

export function useCriarRelatorio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Relatorio, '_id' | 'numero' | 'criado_em'>) => criarRelatorio(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relatorios'] }),
  })
}

export function useAtualizarRelatorio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Relatorio> }) =>
      atualizarRelatorio(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relatorios'] }),
  })
}
