import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarRelatorios, criarRelatorio, atualizarRelatorio, excluirRelatorio } from '../api/relatorios'
import { comSuporteOffline } from '../offline/outboxMutation'
import type { Relatorio } from '../types'

export function useRelatorios(params?: { status?: string }) {
  return useQuery({
    queryKey: ['relatorios', params],
    queryFn: () => listarRelatorios(params),
    gcTime: 1000 * 60 * 60 * 24,
  })
}

export function useCriarRelatorio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Relatorio, '_id' | 'numero' | 'criado_em'>) =>
      comSuporteOffline('relatorios', 'criar', data, undefined, () => criarRelatorio(data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relatorios'] }),
  })
}

export function useAtualizarRelatorio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Relatorio> }) =>
      comSuporteOffline('relatorios', 'atualizar', data, id, () => atualizarRelatorio(id, data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relatorios'] }),
  })
}

export function useExcluirRelatorio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => excluirRelatorio(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relatorios'] }),
  })
}
