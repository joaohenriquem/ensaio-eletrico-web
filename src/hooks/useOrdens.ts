import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarOrdens, criarOrdem, atualizarOrdem, enviarEmailOS, excluirOrdem } from '../api/ordens'
import { comSuporteOffline } from '../offline/outboxMutation'
import type { OrdemServico } from '../types'

export function useOrdens(params?: { status?: string; tipo?: string; cliente?: string }) {
  return useQuery({
    queryKey: ['ordens', params],
    queryFn: () => listarOrdens(params),
    gcTime: 1000 * 60 * 60 * 24,
  })
}

export function useCriarOrdem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<OrdemServico, '_id' | 'numero' | 'criado_em'>) =>
      comSuporteOffline('ordens', 'criar', data, undefined, () => criarOrdem(data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordens'] }),
  })
}

export function useAtualizarOrdem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrdemServico> & { _email_conclusao?: string } }) =>
      comSuporteOffline('ordens', 'atualizar', data, id, () => atualizarOrdem(id, data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordens'] }),
  })
}

export function useEnviarEmailOS() {
  return useMutation({
    mutationFn: ({ id, destinatario, tipo }: { id: string; destinatario: string; tipo: 'aprovacao' | 'conclusao' }) =>
      enviarEmailOS(id, destinatario, tipo),
  })
}

export function useExcluirOrdem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => excluirOrdem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordens'] }),
  })
}
