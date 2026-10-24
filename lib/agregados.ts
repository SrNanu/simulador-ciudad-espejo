import { DISTRITOS, generarPoblacion, grupoEdad, type Ciudadano, type Distrito } from '../data/arquetipos'
import type { Respuesta } from './tipos'

export type Grupo = { clave: string; aprobacion: number; rechazo: number; n: number; habitantes: number }

export type Agregados = {
  respondieron: number
  habitantes: number
  aprobacion: number
  rechazo: number
  indiferencia: number
  posturaMedia: number
  porDistrito: Record<Distrito, Grupo>
  porIngreso: Grupo[]
  porEdad: Grupo[]
  porTransporte: Grupo[]
  acciones: Record<string, number>
}

const POBLACION = generarPoblacion()
export const POBLACION_POR_ID = new Map<string, Ciudadano>(POBLACION.map((c) => [c.id, c]))

function agrupar(pares: { c: Ciudadano; r: Respuesta }[], clave: (c: Ciudadano) => string, orden?: string[]): Grupo[] {
  const mapa = new Map<string, { a: number; rz: number; peso: number; n: number }>()
  for (const { c, r } of pares) {
    const k = clave(c)
    const g = mapa.get(k) ?? { a: 0, rz: 0, peso: 0, n: 0 }
    g.peso += c.factor
    g.n += 1
    if (r.postura > 0) g.a += c.factor
    if (r.postura < 0) g.rz += c.factor
    mapa.set(k, g)
  }
  const claves = orden ?? [...mapa.keys()]
  return claves.map((k) => {
    const g = mapa.get(k)
    return {
      clave: k,
      n: g?.n ?? 0,
      habitantes: g?.peso ?? 0,
      aprobacion: g && g.peso ? (g.a / g.peso) * 100 : 0,
      rechazo: g && g.peso ? (g.rz / g.peso) * 100 : 0,
    }
  })
}

export function agregar(respuestas: Respuesta[]): Agregados {
  const pares = respuestas
    .map((r) => ({ r, c: POBLACION_POR_ID.get(r.id) }))
    .filter((p): p is { r: Respuesta; c: Ciudadano } => Boolean(p.c))

  let peso = 0
  let a = 0
  let rz = 0
  let suma = 0
  const acciones: Record<string, number> = {}
  for (const { c, r } of pares) {
    peso += c.factor
    suma += r.postura * c.factor
    if (r.postura > 0) a += c.factor
    if (r.postura < 0) rz += c.factor
    acciones[r.accion] = (acciones[r.accion] ?? 0) + c.factor
  }
  for (const k of Object.keys(acciones)) acciones[k] = peso ? (acciones[k] / peso) * 100 : 0

  const distritos = agrupar(pares, (c) => c.distrito, [...DISTRITOS])
  const porDistrito = Object.fromEntries(distritos.map((g) => [g.clave, g])) as Record<Distrito, Grupo>

  return {
    respondieron: pares.length,
    habitantes: peso,
    aprobacion: peso ? (a / peso) * 100 : 0,
    rechazo: peso ? (rz / peso) * 100 : 0,
    indiferencia: peso ? ((peso - a - rz) / peso) * 100 : 0,
    posturaMedia: peso ? suma / peso : 0,
    porDistrito,
    porIngreso: agrupar(pares, (c) => c.ingreso, ['bajo', 'medio', 'alto']),
    porEdad: agrupar(pares, (c) => grupoEdad(c.edad), ['18–29', '30–44', '45–64', '65+']),
    porTransporte: agrupar(pares, (c) => c.transporte, ['colectivo', 'auto', 'moto', 'bicicleta', 'a pie']),
    acciones,
  }
}
