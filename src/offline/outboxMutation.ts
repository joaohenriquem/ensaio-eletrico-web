import { isNetworkError } from './errors'
import { enfileirar, type OutboxEntidade, type OutboxAcao } from './outbox'

export interface Enfileirado {
  queued: true
  localId: string
}

export type ResultadoOffline<T> = T | Enfileirado

export function foiEnfileirado<T>(res: ResultadoOffline<T>): res is Enfileirado {
  return typeof res === 'object' && res !== null && 'queued' in res && res.queued === true
}

/**
 * Tenta a chamada online normal; se falhar por problema de rede (não por
 * erro do servidor), enfileira localmente em vez de propagar o erro.
 * Erros com resposta do servidor continuam sendo lançados normalmente,
 * pra não esconder validações reais atrás do fluxo offline.
 */
export async function comSuporteOffline<T>(
  entidade: OutboxEntidade,
  acao: OutboxAcao,
  payload: Record<string, unknown>,
  targetId: string | undefined,
  chamar: () => Promise<T>,
): Promise<ResultadoOffline<T>> {
  try {
    return await chamar()
  } catch (err) {
    if (!isNetworkError(err)) throw err
    const item = await enfileirar({ entidade, acao, targetId, payload })
    return { queued: true, localId: item.localId }
  }
}
