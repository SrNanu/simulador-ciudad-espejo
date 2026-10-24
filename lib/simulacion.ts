import { generateText, Output } from 'ai'
import { z } from 'zod'
import { generarPoblacion, TOTAL_CIUDADANOS, type Ciudadano } from '../data/arquetipos'
import { obtenerModelo } from './ia'
import { ACCIONES, AFECTACIONES, respuestaSchema, type EventoSimulacion, type Respuesta } from './tipos'

const TAMANO_LOTE = 25

const SISTEMA = `Sos un motor de simulación social. Vas a encarnar a varios ciudadanos reales de Rosario, Santa Fe, Argentina, y reaccionar a una medida municipal.

Reglas:
- Cada ciudadano razona SOLO desde su propio perfil y sus intereses concretos: su bolsillo, su tiempo, cómo se mueve, su trabajo, su familia. No conoce estudios técnicos ni piensa en "el bien común" salvo que su perfil lo justifique.
- NO seas complaciente con la medida. Reaccioná como una persona real de ese perfil: con enojo, bronca, indiferencia, desconfianza hacia la política o, si de verdad le conviene, apoyo. A mucha gente las medidas le dan igual; reflejalo.
- No todos opinan igual aunque compartan arquetipo: el rasgo personal y el barrio cambian la reacción.
- postura: entero de -2 (muy en contra) a 2 (muy a favor). 0 es indiferente.
- motivo: frase corta (máx. 12 palabras) en tercera persona explicando el porqué concreto.
- cita: una frase en primera persona, en español rioplatense coloquial (voseo, modismos rosarinos si cuadran), como la diría en la parada del colectivo o en un audio de WhatsApp. Máx. 30 palabras. Nada de lenguaje institucional.
- Devolvé exactamente un elemento por ciudadano, con su mismo id.`

const elementoModelo = z.object({
  id: z.string(),
  postura: z.number(),
  afectacion: z.enum(AFECTACIONES),
  accion: z.enum(ACCIONES),
  motivo: z.string(),
  cita: z.string(),
})

function describir(c: Ciudadano) {
  return `- id ${c.id}: ${c.nombre}, ${c.edad} años, ${c.barrio} (distrito ${c.distrito}). ${c.ocupacion}. Ingreso ${c.ingreso}. Se mueve en ${c.transporte}. ${c.familia}. Rasgo: ${c.rasgo}.`
}

async function simularLoteUnaVez(medida: string, lote: Ciudadano[], signal?: AbortSignal) {
  const { output } = await generateText({
    model: obtenerModelo('simulacion'),
    system: SISTEMA,
    output: Output.array({ element: elementoModelo }),
    prompt: `Medida anunciada por la Municipalidad de Rosario:\n"${medida}"\n\nCiudadanos:\n${lote.map(describir).join('\n')}`,
    maxRetries: 1,
    abortSignal: signal,
  })

  const ids = new Set(lote.map((c) => c.id))
  const validas: Respuesta[] = []
  for (const item of output) {
    const normalizado = { ...item, postura: Math.max(-2, Math.min(2, Math.round(item.postura))) }
    const parsed = respuestaSchema.safeParse(normalizado)
    if (parsed.success && ids.has(parsed.data.id)) {
      validas.push(parsed.data)
      ids.delete(parsed.data.id)
    }
  }
  if (validas.length < lote.length * 0.8) throw new Error(`Lote incompleto: ${validas.length}/${lote.length}`)
  return validas
}

async function simularLote(medida: string, lote: Ciudadano[], signal?: AbortSignal) {
  try {
    return await simularLoteUnaVez(medida, lote, signal)
  } catch (error) {
    console.error('[simulacion] lote falló, reintentando:', (error as Error).message)
    return await simularLoteUnaVez(medida, lote, signal)
  }
}

export async function simular(medida: string, emitir: (e: EventoSimulacion) => void, signal?: AbortSignal) {
  const poblacion = generarPoblacion().slice(0, TOTAL_CIUDADANOS)
  const lotes: Ciudadano[][] = []
  for (let i = 0; i < poblacion.length; i += TAMANO_LOTE) lotes.push(poblacion.slice(i, i + TAMANO_LOTE))

  emitir({ tipo: 'inicio', total: poblacion.length, lotes: lotes.length })
  const todas: Respuesta[] = []

  await Promise.all(
    lotes.map(async (lote) => {
      try {
        const respuestas = await simularLote(medida, lote, signal)
        todas.push(...respuestas)
        emitir({ tipo: 'lote', respuestas })
      } catch (error) {
        console.error('[simulacion] lote descartado:', (error as Error).message)
        emitir({ tipo: 'lote_fallido', ids: lote.map((c) => c.id) })
      }
    }),
  )

  emitir({ tipo: 'fin' })
  return todas
}
