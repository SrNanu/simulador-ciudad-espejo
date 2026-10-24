import { POBLACION_POR_ID } from '@/lib/agregados'
import type { Analisis, Respuesta } from '@/lib/tipos'

const ETIQUETA_POSTURA: Record<number, string> = {
  [-2]: 'Muy en contra',
  [-1]: 'En contra',
  0: 'Indiferente',
  1: 'A favor',
  2: 'Muy a favor',
}

function Segmentos({ titulo, items, tono }: { titulo: string; items: Analisis['ganadores']; tono: 'favor' | 'contra' }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-5">
      <h3 className={tono === 'favor' ? 'text-sm font-semibold text-favor' : 'text-sm font-semibold text-contra'}>{titulo}</h3>
      <ul className="flex flex-col gap-3">
        {items.map((s) => (
          <li key={s.segmento} className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{s.segmento}</span>
            <span className="text-sm leading-relaxed text-muted-foreground">{s.motivo}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function GanadoresPerdedores({ analisis }: { analisis: Analisis }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Segmentos titulo="Quiénes ganan" items={analisis.ganadores} tono="favor" />
      <Segmentos titulo="Quiénes pierden" items={analisis.perdedores} tono="contra" />
    </div>
  )
}

export function Quejas({ quejas }: { quejas: Analisis['quejas'] }) {
  const max = Math.max(...quejas.map((q) => q.porcentaje), 1)
  return (
    <section aria-labelledby="quejas-titulo" className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <h3 id="quejas-titulo" className="text-base font-semibold">
        Quejas principales
      </h3>
      <ul className="flex flex-col gap-3">
        {quejas.map((q) => (
          <li key={q.queja} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm leading-relaxed">{q.queja}</span>
              <span className="font-mono text-sm text-muted-foreground">{`${Math.round(q.porcentaje)}%`}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div className="h-full rounded-full bg-contra" style={{ width: `${(q.porcentaje / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Porcentaje estimado de ciudadanos que expresan cada queja.</p>
    </section>
  )
}

export function Testimonios({ ids, respuestas }: { ids: string[]; respuestas: Respuesta[] }) {
  const porId = new Map(respuestas.map((r) => [r.id, r]))
  const tarjetas = ids
    .map((id) => ({ c: POBLACION_POR_ID.get(id), r: porId.get(id) }))
    .filter((t): t is { c: NonNullable<typeof t.c>; r: Respuesta } => Boolean(t.c && t.r))

  if (!tarjetas.length) return null
  return (
    <section aria-labelledby="testimonios-titulo" className="flex flex-col gap-4">
      <h3 id="testimonios-titulo" className="text-base font-semibold">
        Testimonios
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map(({ c, r }) => (
          <figure key={c.id} className="flex flex-col justify-between gap-4 rounded-lg border bg-card p-5">
            <blockquote className="text-pretty leading-relaxed">{`“${r.cita}”`}</blockquote>
            <figcaption className="flex items-end justify-between gap-3 border-t pt-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{`${c.nombre}, ${c.edad}`}</span>
                <span className="text-xs text-muted-foreground">{`${c.ocupacion} · ${c.barrio} (${c.distrito})`}</span>
              </div>
              <span
                className={
                  r.postura > 0
                    ? 'shrink-0 rounded-sm bg-favor/15 px-2 py-0.5 text-xs text-favor'
                    : r.postura < 0
                      ? 'shrink-0 rounded-sm bg-contra/15 px-2 py-0.5 text-xs text-contra'
                      : 'shrink-0 rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground'
                }
              >
                {ETIQUETA_POSTURA[r.postura]}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
