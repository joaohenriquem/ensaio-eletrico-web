import { get, set, del, createStore } from 'idb-keyval'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

// Cada área offline usa seu próprio banco IndexedDB (via createStore), em vez de
// múltiplos object stores num único banco — o idb-keyval só cria stores novos
// durante o onupgradeneeded do PRIMEIRO createStore de um dado nome de banco,
// então misturar stores no mesmo nome de banco quebra silenciosamente o segundo.
const offlineDb = createStore('ensaio-eletrico-cache', 'react-query')

const storage = {
  getItem: (key: string) => get(key, offlineDb),
  setItem: (key: string, value: string) => set(key, value, offlineDb),
  removeItem: (key: string) => del(key, offlineDb),
}

export const queryPersister = createAsyncStoragePersister({
  storage,
  key: 'react-query-cache',
})
