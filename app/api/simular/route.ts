import { z } from 'zod'
import { iaDisponible } from '@/lib/ia'
import { consumirCupo, ipDe } from '@/lib/limite'
import { simular } from '@/lib/simulacion'

export const maxDuration = 300

const cuerpoSchema = z.object({ medida: z.string().trim().min(8).max(600) })

export async function POST(req: Request) {
  const parsed = cuerpoSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: 'Escribí una medida de entre 8 y 600 caracteres.', codigo: 'invalida' }, { status: 400 })
  }
  if (!iaDisponible()) {
    return Response.json({ error: 'No hay un proveedor de IA configurado.', codigo: 'sin_ia' }, { status: 503 })
  }
  if (!consumirCupo(ipDe(req))) {
    return Response.json({ error: 'Llegaste al límite de 5 simulaciones por hora.', codigo: 'limite' }, { status: 429 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await simular(parsed.data.medida, (evento) => controller.enqueue(encoder.encode(JSON.stringify(evento) + '\n')), req.signal)
      } catch (error) {
        console.error('[api/simular]', error)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' },
  })
}
