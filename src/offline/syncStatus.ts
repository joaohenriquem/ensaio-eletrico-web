import { useEffect, useState } from 'react'

let sessaoExpirada = false
type Listener = () => void
const listeners = new Set<Listener>()

export function marcarSessaoExpirada(v: boolean) {
  if (sessaoExpirada === v) return
  sessaoExpirada = v
  listeners.forEach(fn => fn())
}

export function useSessaoExpiradaNaSync(): boolean {
  const [valor, setValor] = useState(sessaoExpirada)
  useEffect(() => {
    const fn = () => setValor(sessaoExpirada)
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }, [])
  return valor
}
