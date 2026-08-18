import { useEffect, useState } from 'react'
import { listarPendentes, subscribe, type OutboxEntidade, type OutboxItem } from './outbox'

export function useOutbox(entidade: OutboxEntidade): OutboxItem[] {
  const [itens, setItens] = useState<OutboxItem[]>([])

  useEffect(() => {
    let ativo = true
    function carregar() {
      listarPendentes(entidade).then(lista => { if (ativo) setItens(lista) })
    }
    carregar()
    const unsubscribe = subscribe(carregar)
    return () => {
      ativo = false
      unsubscribe()
    }
  }, [entidade])

  return itens
}
