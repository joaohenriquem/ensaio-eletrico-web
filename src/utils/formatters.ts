const TZ = 'America/Sao_Paulo'

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function dataBr(dt: string | Date | null | undefined): string {
  if (!dt) return ''
  if (dt instanceof Date) return dt.toLocaleDateString('pt-BR', { timeZone: TZ })
  if (/^\d{4}-\d{2}-\d{2}/.test(dt)) {
    const [y, m, d] = dt.split('T')[0].split('-')
    return `${d}/${m}/${y}`
  }
  return String(dt)
}

export function dataParaInput(dt: string | null | undefined): string {
  if (!dt) return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
  if (/^\d{4}-\d{2}-\d{2}/.test(dt)) return dt.split('T')[0]
  return dt
}
