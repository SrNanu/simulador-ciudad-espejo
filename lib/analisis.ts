import { generateText, Output } from 'ai'
import { agregar, POBLACION_POR_ID } from './agregados'
import { obtenerModelo } from './ia'
import { analisisSchema, type Analisis, type Respuesta } from './tipos'

const pct = (n: number) => `${n.toFixed(0)}%`

export async function analizar(medida: string, respuestas: Respuesta[]): Promise<Analisis> {
  const ag = agregar(respuestas)
  const resumenGrupos = (titulo: string, grupos: { clave: string; aprobacion: number; rechazo: number }[]) =>
    `${titulo}: ${grupos.map((g) => `${g.clave} ${pct(g.aprobacion)} a favor / ${pct(g.rechazo)} en contra`).join('; ')}`

  const lineas = respuestas
    .map((r) => {
      const c = POBLACION_POR_ID.get(r.id)
      if (!c) return null
      return `${r.id}|${c.distrito}|${c.ingreso}|${c.edad}|${c.transporte}|${c.ocupacion}|postura ${r.postura}|${r.accion}|${r.motivo}|"${r.cita}"`
    })
    .filter(Boolean)

  const { output } = await generateText({
    model: obtenerModelo('analisis'),
    output: Output.object({ schema: analisisSchema }),
    system: `Sos analista de políticas públicas de la Municipalidad de Rosario. Analizás resultados de una simulación con ciudadanos sintéticos. Sos directo, concreto y no endulzás los resultados. Escribís en español rioplatense neutro y profesional.`,
    prompt: `Medida simulada: "${medida}"

Resultados agregados (ponderados por habitantes representados):
- Aprobación general ${pct(ag.aprobacion)}, rechazo ${pct(ag.rechazo)}, indiferencia ${pct(ag.indiferencia)}.
- ${resumenGrupos('Por distrito', Object.values(ag.porDistrito))}
- ${resumenGrupos('Por ingreso', ag.porIngreso)}
- ${resumenGrupos('Por edad', ag.porEdad)}
- ${resumenGrupos('Por transporte', ag.porTransporte)}

Respuestas individuales (id|distrito|ingreso|edad|transporte|ocupación|postura|acción|motivo|cita):
${lineas.join('\n')}

Devolvé:
- resumen: 2 líneas.
- ganadores y perdedores: 2 a 4 segmentos concretos cada uno (ej. "jubilados del Sur que usan colectivo").
- quejas: 3 a 5 quejas principales agrupadas, con el porcentaje estimado de ciudadanos que la expresan (0-100).
- propuesta: un ajuste concreto y aplicable de la medida que reduzca el rechazo sin desnaturalizarla. "medidaAjustada" debe ser la medida completa reescrita en una o dos oraciones.
- testimonioIds: 4 a 6 ids REALES de la lista, variados en distrito y postura (incluí a favor y en contra).`,
  })
  return { ...output, testimonioIds: output.testimonioIds.filter((id) => POBLACION_POR_ID.has(id)).slice(0, 6) }
}
