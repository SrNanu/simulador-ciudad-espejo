export const COLOR = {
  favor: '#2ee6f5',
  neutro: '#f5b83d',
  contra: '#ff2e7e',
  apagado: '#3a4660',
  linea: '#5fd4e6',
} as const

export function simId(medida: string) {
  let h = 0
  for (let i = 0; i < medida.length; i++) h = (h * 31 + medida.charCodeAt(i)) >>> 0
  return `SIM-${String(h % 10000).padStart(4, '0')}`
}

export function hora(fecha = new Date()) {
  return fecha.toLocaleTimeString('es-AR', { hour12: false, timeZone: 'America/Argentina/Buenos_Aires' })
}

export function colorPostura(postura: number) {
  if (postura > 0) return COLOR.favor
  if (postura < 0) return COLOR.contra
  return COLOR.neutro
}

export function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
