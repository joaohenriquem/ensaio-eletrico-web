import api from './client'
import { isNetworkError } from '../offline/errors'
import { salvarFotoPendente, arquivoDaFotoPendente, removerFotoPendente } from '../offline/fotos'

async function enviar(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ url: string }>('/uploads', form, {
    headers: { 'Content-Type': undefined },
  })
  return data.url
}

/**
 * Sobe o arquivo e devolve a URL pública. Offline (ou falha de rede), guarda
 * o blob localmente e devolve uma URL "blob:" válida pra preview imediato —
 * quem chama essa função não precisa saber a diferença.
 */
export async function uploadImagem(file: File): Promise<string> {
  if (!navigator.onLine) return salvarFotoPendente(file)
  try {
    return await enviar(file)
  } catch (err) {
    if (!isNetworkError(err)) throw err
    return salvarFotoPendente(file)
  }
}

/**
 * Usado só pelo motor de sincronização: sobe uma foto que ficou pendente
 * (guardada localmente com o id retornado por salvarFotoPendente) e, se
 * der certo, remove o blob local — usada apenas quando já se sabe que há
 * conexão (o próprio motor só roda nesse caso).
 */
export async function uploadImagemPendente(id: string): Promise<string> {
  const file = await arquivoDaFotoPendente(id)
  if (!file) throw new Error(`Foto pendente ${id} não encontrada no armazenamento local`)
  const url = await enviar(file)
  await removerFotoPendente(id)
  return url
}
