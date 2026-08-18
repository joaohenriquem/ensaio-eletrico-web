import { get, set, del, createStore } from 'idb-keyval'

// Banco dedicado só pra blobs de fotos tiradas offline, aguardando upload.
const fotosDb = createStore('ensaio-eletrico-fotos', 'pendentes')

// Mapeia URLs "blob:" (válidas só na sessão atual) pro id estável salvo no
// IndexedDB, pra podermos trocar blob: por local:<id> na hora de enfileirar.
const blobParaId = new Map<string, string>()

export async function salvarFotoPendente(file: File): Promise<string> {
  const id = crypto.randomUUID()
  await set(id, file, fotosDb)
  const url = URL.createObjectURL(file)
  blobParaId.set(url, id)
  return url
}

export function idDaFotoPendente(blobUrl: string): string | undefined {
  return blobParaId.get(blobUrl)
}

/**
 * O Chrome no Android às vezes invalida a URL "blob:" de uma foto (ex: ao
 * abrir a câmera e voltar), mesmo com a página ainda "viva" e o blob salvo
 * no IndexedDB. Usado no onError do <img> pra gerar uma blob: nova a partir
 * do arquivo que já está persistido, sem precisar tirar a foto de novo.
 */
export async function recuperarUrlQuebrada(urlQuebrada: string): Promise<string | null> {
  const id = blobParaId.get(urlQuebrada)
  if (!id) return null
  const novaUrl = await resolverFotoPendente(id)
  if (novaUrl) {
    blobParaId.delete(urlQuebrada)
    blobParaId.set(novaUrl, id)
  }
  return novaUrl
}

export async function resolverFotoPendente(id: string): Promise<string | null> {
  const file = await get<File>(id, fotosDb)
  if (!file) return null
  return URL.createObjectURL(file)
}

export async function arquivoDaFotoPendente(id: string): Promise<File | null> {
  const file = await get<File>(id, fotosDb)
  return file ?? null
}

export async function removerFotoPendente(id: string): Promise<void> {
  await del(id, fotosDb)
}

const MARCADOR_LOCAL = /^local:(.+)$/
const MARCADOR_BLOB = /^blob:/

export function ehMarcadorLocal(valor: string): string | null {
  const m = MARCADOR_LOCAL.exec(valor)
  return m ? m[1] : null
}

/**
 * Percorre um payload de relatório (campos de fotos por painel + anexos) e
 * troca toda URL "blob:" já conhecida por um marcador "local:<id>" estável,
 * que sobrevive a um reload (a blob: em si não sobrevive).
 */
export function substituirBlobsPorMarcadores<T>(payload: T): T {
  function substituirValor(v: unknown): unknown {
    if (typeof v === 'string' && MARCADOR_BLOB.test(v)) {
      const id = blobParaId.get(v)
      return id ? `local:${id}` : v
    }
    if (Array.isArray(v)) return v.map(substituirValor)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v)) out[k] = substituirValor(val)
      return out
    }
    return v
  }
  return substituirValor(payload) as T
}

export interface MarcadorLocal {
  id: string
  caminho: (string | number)[]
}

/** Acha todo marcador "local:<id>" restante num payload, com o caminho até ele. */
export function encontrarMarcadoresLocais(payload: unknown): MarcadorLocal[] {
  const achados: MarcadorLocal[] = []
  function visitar(v: unknown, caminho: (string | number)[]) {
    if (typeof v === 'string') {
      const id = ehMarcadorLocal(v)
      if (id) achados.push({ id, caminho })
      return
    }
    if (Array.isArray(v)) {
      v.forEach((item, i) => visitar(item, [...caminho, i]))
      return
    }
    if (v && typeof v === 'object') {
      for (const [k, val] of Object.entries(v)) visitar(val, [...caminho, k])
    }
  }
  visitar(payload, [])
  return achados
}

/** Retorna uma cópia do payload com o valor no caminho indicado substituído. */
export function definirNoCaminho<T>(payload: T, caminho: (string | number)[], valor: unknown): T {
  const copia = structuredClone(payload) as Record<string, unknown>
  let atual: Record<string, unknown> = copia
  for (let i = 0; i < caminho.length - 1; i++) {
    atual = atual[caminho[i] as string] as Record<string, unknown>
  }
  atual[caminho[caminho.length - 1] as string] = valor
  return copia as T
}
