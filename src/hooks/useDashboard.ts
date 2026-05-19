import { useQuery } from '@tanstack/react-query'
import { buscarStats } from '../api/dashboard'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: buscarStats,
    staleTime: 60_000,
  })
}
