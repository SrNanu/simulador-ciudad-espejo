import { z } from 'zod'

export const ACCIONES = ['apoya', 'indiferente', 'se_queja', 'cambia_habitos', 'protesta'] as const
export const AFECTACIONES = ['positiva', 'neutral', 'negativa'] as const

export const respuestaSchema = z.object({
  id: z.string(),
  postura: z.number().int().min(-2).max(2),
  afectacion: z.enum(AFECTACIONES),
  accion: z.enum(ACCIONES),
  motivo: z.string().min(1),
  cita: z.string().min(1),
})
export type Respuesta = z.infer<typeof respuestaSchema>

export const analisisSchema = z.object({
  resumen: z.string().describe('Resumen en exactamente 2 líneas'),
  ganadores: z.array(z.object({ segmento: z.string(), motivo: z.string() })),
  perdedores: z.array(z.object({ segmento: z.string(), motivo: z.string() })),
  quejas: z.array(z.object({ queja: z.string(), porcentaje: z.number() })),
  propuesta: z.object({
    titulo: z.string(),
    medidaAjustada: z.string().describe('La medida reescrita con el ajuste, lista para volver a simular'),
    justificacion: z.string(),
  }),
  testimonioIds: z.array(z.string()).describe('4 a 6 ids de ciudadanos cuyas citas se destacan'),
})
export type Analisis = z.infer<typeof analisisSchema>

export type EventoSimulacion =
  | { tipo: 'inicio'; total: number; lotes: number }
  | { tipo: 'lote'; respuestas: Respuesta[] }
  | { tipo: 'lote_fallido'; ids: string[] }
  | { tipo: 'fin' }

export type CasoPrecargado = {
  id: string
  titulo: string
  medida: string
  fuente: 'ia' | 'heuristica'
  respuestas: Respuesta[]
  analisis: Analisis | null
  ajuste: { medida: string; respuestas: Respuesta[] } | null
}
