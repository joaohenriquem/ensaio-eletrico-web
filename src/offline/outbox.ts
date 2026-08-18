import { set, get, del, values } from 'idb-keyval'
import { outboxDb } from './db'
import { substituirBlobsPorMarcadores } from './fotos'

export type OutboxEntidade = 'ordens' | 'relatorios'
export type OutboxAcao = 'criar' | 'atualizar'

export interface OutboxItem {
  localId: string
  entidade: OutboxEntidade
  acao: OutboxAcao
  targetId?: string
  payload: Record<string, unknown>
  criadoEm: string
  tentativas: number
  ultimoErro?: string
}

type Listener = () => void
const listeners = new Set<Listener>()

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notificar() {
  listeners.forEach(fn => fn())
}

export async function enfileirar(
  item: Pick<OutboxItem, 'entidade' | 'acao' | 'payload'> & { targetId?: string }
): Promise<OutboxItem> {
  const localId = crypto.randomUUID()
  let payload = item.entidade === 'relatorios'
    ? substituirBlobsPorMarcadores(item.payload)
    : item.payload
  if (item.acao === 'criar') {
    // Mesmo id em toda tentativa de reenvio deste item — o backend usa isso
    // pra tornar a criação idempotente e não duplicar o registro se a
    // resposta de uma tentativa anterior tiver se perdido.
    payload = { ...payload, id: localId }
  }
  const full: OutboxItem = {
    ...item,
    payload,
    localId,
    criadoEm: new Date().toISOString(),
    tentativas: 0,
  }
  await set(full.localId, full, outboxDb)
  notificar()
  return full
}

export async function listarPendentes(entidade?: OutboxEntidade): Promise<OutboxItem[]> {
  const todos = await values<OutboxItem>(outboxDb)
  const ordenados = todos.sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))
  return entidade ? ordenados.filter(i => i.entidade === entidade) : ordenados
}

export async function remover(localId: string): Promise<void> {
  await del(localId, outboxDb)
  notificar()
}

export async function atualizarItem(localId: string, patch: Partial<OutboxItem>): Promise<void> {
  const atual = await get<OutboxItem>(localId, outboxDb)
  if (!atual) return
  await set(localId, { ...atual, ...patch }, outboxDb)
  notificar()
}
