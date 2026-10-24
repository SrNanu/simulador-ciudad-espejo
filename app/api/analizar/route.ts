import { z } from 'zod'
import { analizar } from '@/lib/analisis'
import { iaDisponible } from '@/lib/ia'
import { respuestaSchema } from '@/lib/tipos'

export const maxDuration = 120

const cuerpoSchema = z.object({
  medida: z.string().trim().min(8).max(600),
  respuestas: z.array(respuestaSchema).min(1).max(300),
})

export async function POST(req: Request) {
  const parsed = cuerpoSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 })
  if (!iaDisponible()) return Response.json({ error: 'No hay un proveedor de IA configurado.', codigo: 'sin_ia' }, { status: 503 })

  try {
    const analisis = await analizar(parsed.data.medida, parsed.data.respuestas)
    return Response.json(analisis)
  } catch (error) {
    console.error('[api/analizar]', error)
    return Response.json({ error: 'No se pudo completar el análisis.' }, { status: 502 })
  }
}
