const VENTANA_MS = 60 * 60 * 1000
const MAXIMO = 5
const registros = new Map<string, number[]>()

export function consumirCupo(ip: string) {
  const ahora = Date.now()
  const recientes = (registros.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS)
  if (recientes.length >= MAXIMO) {
    registros.set(ip, recientes)
    return false
  }
  recientes.push(ahora)
  registros.set(ip, recientes)
  return true
}

export function ipDe(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local'
}
