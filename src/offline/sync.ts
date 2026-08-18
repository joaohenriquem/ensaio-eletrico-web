import { criarOrdem, atualizarOrdem } from '../api/ordens'
import { criarRelatorio, atualizarRelatorio } from '../api/relatorios'
import { uploadImagemPendente } from '../api/uploads'
import { definirModoSync } from '../api/client'
import { queryClient } from '../queryClient'
import { isNetworkError, isAuthError } from './errors'
import { encontrarMarcadoresLocais, definirNoCaminho } from './fotos'
import { marcarSessaoExpirada } from './syncStatus'
import { listarPendentes, remover, atualizarItem, type OutboxItem } from './outbox'

type ResultadoSync = 'ok' | 'erro_servidor' | 'erro_rede' | 'erro_auth'

async function resolverFotosPendentes(item: OutboxItem): Promise<{ payload: Record<string, unknown>; resultado: ResultadoSync | null }> {
  let payload = item.payload
  const marcadores = encontrarMarcadoresLocais(payload)
  for (const { id, caminho } of marcadores) {
    try {
      const url = await uploadImagemPendente(id)
      payload = definirNoCaminho(payload, caminho, url)
      // Checkpoint: grava a URL real assim que cada foto sobe, pra não
      // reenviar a mesma foto se a conexão cair de novo no meio do item.
      await atualizarItem(item.localId, { payload })
    } catch (err) {
      if (isAuthError(err)) return { payload, resultado: 'erro_auth' }
      if (isNetworkError(err)) return { payload, resultado: 'erro_rede' }
      await atualizarItem(item.localId, {
        tentativas: item.tentativas + 1,
        ultimoErro: 'Falha ao enviar uma foto pendente.',
      })
      return { payload, resultado: 'erro_servidor' }
    }
  }
  return { payload, resultado: null }
}

async function enviarAoServidor(item: OutboxItem, payload: Record<string, unknown>): Promise<ResultadoSync> {
  const queryKey = item.entidade
  try {
    if (item.entidade === 'ordens') {
      if (item.acao === 'criar') await criarOrdem(payload as never)
      else if (item.targetId) await atualizarOrdem(item.targetId, payload as never)
    } else {
      if (item.acao === 'criar') await criarRelatorio(payload as never)
      else if (item.targetId) await atualizarRelatorio(item.targetId, payload as never)
    }
    await remover(item.localId)
    queryClient.invalidateQueries({ queryKey: [queryKey] })
    return 'ok'
  } catch (err) {
    if (isAuthError(err)) return 'erro_auth'
    if (isNetworkError(err)) return 'erro_rede'
    const mensagem = err instanceof Error ? err.message : 'Erro desconhecido'
    await atualizarItem(item.localId, { tentativas: item.tentativas + 1, ultimoErro: mensagem })
    return 'erro_servidor'
  }
}

async function sincronizarItem(item: OutboxItem): Promise<ResultadoSync> {
  if (item.entidade === 'relatorios') {
    const { payload, resultado } = await resolverFotosPendentes(item)
    if (resultado) return resultado
    return enviarAoServidor(item, payload)
  }
  return enviarAoServidor(item, item.payload)
}

let sincronizando = false

export async function sincronizarPendentes(): Promise<void> {
  if (sincronizando || !navigator.onLine) return
  sincronizando = true
  definirModoSync(true)
  try {
    const pendentes = await listarPendentes()
    let expirou = false
    for (const item of pendentes) {
      const resultado = await sincronizarItem(item)
      if (resultado === 'erro_auth') { expirou = true; break }
      if (resultado === 'erro_rede') break
    }
    marcarSessaoExpirada(expirou)
  } finally {
    definirModoSync(false)
    sincronizando = false
  }
}

const INTERVALO_RETRY_MS = 45_000

/**
 * Dispara a sincronização em toda oportunidade razoável: ao montar o app,
 * no evento 'online', ao voltar pro primeiro plano (celular desbloqueado
 * de novo) e, como reforço, num intervalo curto enquanto houver itens
 * pendentes — o evento 'online' do navegador não é confiável (ex: wifi
 * conectado numa rede sem internet de fato ainda reporta "online"). O
 * intervalo não faz nada (nem gasta rede) quando a fila está vazia.
 */
export function iniciarSincronizacaoAutomatica(): () => void {
  sincronizarPendentes()

  const aoFicarVisivel = () => {
    if (document.visibilityState === 'visible') sincronizarPendentes()
  }

  window.addEventListener('online', sincronizarPendentes)
  document.addEventListener('visibilitychange', aoFicarVisivel)

  const intervalo = window.setInterval(async () => {
    if (!navigator.onLine) return
    const pendentes = await listarPendentes()
    if (pendentes.length > 0) sincronizarPendentes()
  }, INTERVALO_RETRY_MS)

  return () => {
    window.removeEventListener('online', sincronizarPendentes)
    document.removeEventListener('visibilitychange', aoFicarVisivel)
    window.clearInterval(intervalo)
  }
}
