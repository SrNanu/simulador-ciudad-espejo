import type { Distrito } from './arquetipos'

// Límites APROXIMADOS de los 6 distritos municipales de Rosario, trazados a mano
// sobre la costa del Paraná y las grandes avenidas (Francia, 27 de Febrero,
// Provincias Unidas). Sirven para visualizar, no para análisis catastral.
type Punto = [number, number]

const COSTA: Punto[] = [
  [-60.7, -32.865],
  [-60.682, -32.885],
  [-60.666, -32.905],
  [-60.65, -32.921],
  [-60.636, -32.932],
  [-60.628, -32.946],
  [-60.624, -32.962],
  [-60.627, -32.985],
  [-60.633, -33.005],
  [-60.642, -33.025],
]

const N1: Punto = [-60.662, -32.93]
const N2: Punto = [-60.697, -32.926]
const N3: Punto = [-60.714, -32.869]
const W1: Punto = [-60.79, -32.882]
const O1: Punto = [-60.792, -32.938]
const C2: Punto = [-60.665, -32.964]
const O3: Punto = [-60.668, -32.977]
const O4: Punto = [-60.788, -32.98]
const U1: Punto = [-60.673, -33.03]
const U2: Punto = [-60.758, -33.016]

export const POLIGONOS: Record<Distrito, Punto[]> = {
  Norte: [...COSTA.slice(0, 5), N1, N2, N3],
  Centro: [N1, COSTA[4], COSTA[5], COSTA[6], C2],
  Noroeste: [W1, N3, N2, O1],
  Oeste: [O1, N2, N1, C2, O3, O4],
  Sur: [C2, COSTA[6], COSTA[7], COSTA[8], COSTA[9], U1, O3],
  Sudoeste: [O4, O3, U1, U2],
}

export const CODIGO_DISTRITO: Record<Distrito, string> = {
  Centro: 'D-01',
  Norte: 'D-02',
  Noroeste: 'D-03',
  Oeste: 'D-04',
  Sudoeste: 'D-05',
  Sur: 'D-06',
}

export const CENTRO_ROSARIO: Punto = [-60.6393, -32.9468]
export const ENCUADRE_ROSARIO: Punto = [-60.69, -32.952]

export function centroide(poligono: Punto[]): Punto {
  const n = poligono.length
  return [poligono.reduce((s, p) => s + p[0], 0) / n, poligono.reduce((s, p) => s + p[1], 0) / n]
}

function dentro([x, y]: Punto, poligono: Punto[]) {
  let adentro = false
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [xi, yi] = poligono[i]
    const [xj, yj] = poligono[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) adentro = !adentro
  }
  return adentro
}

function semilla(texto: string) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

export function ubicarEnDistrito(id: string, distrito: Distrito): Punto {
  const poligono = POLIGONOS[distrito]
  const xs = poligono.map((p) => p[0])
  const ys = poligono.map((p) => p[1])
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const azar = semilla(id)
  for (let intento = 0; intento < 200; intento++) {
    const p: Punto = [minX + azar() * (maxX - minX), minY + azar() * (maxY - minY)]
    if (dentro(p, poligono)) return p
  }
  return centroide(poligono)
}
