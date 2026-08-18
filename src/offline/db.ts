import { createStore } from 'idb-keyval'

// Banco dedicado só pra fila de envios pendentes (outbox). Ver queryPersister.ts
// pra explicação de por que cada área offline usa seu próprio banco IndexedDB.
export const outboxDb = createStore('ensaio-eletrico-outbox', 'itens')
