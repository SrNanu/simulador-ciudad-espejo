'use client'

import { POBLACION_POR_ID } from '@/lib/agregados'
import { colorPostura } from '@/lib/hud'
import type { Respuesta } from '@/lib/tipos'

const VISIBLES = 4

export function FeedCitas({ respuestas, total }: { respuestas: Respuesta[]; total: number }) {
  const ultimas = respuestas.slice(-VISIBLES).reverse()
  const pct = total ? Math.min(100, (respuestas.length / total) * 100) : 0

  return (
    <div className="glass pointer-events-auto flex w-full flex-col gap-2 rounded-lg p-3 md:w-80">
      <div className="flex items-baseline justify-between gap-2">
        <span className="etiqueta-hud">Voces en vivo</span>
        <span className="font-mono text-sm tabular-nums text-primary" aria-live="polite">
          {`${respuestas.length.toLocaleString('es-AR')} / ${total}`}
        </span>
      </div>
      <div className="h-0.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
        <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <ul className="flex flex-col gap-1.5">
        {ultimas.map((r) => {
          const c = POBLACION_POR_ID.get(r.id)
          return (
            <li
              key={r.id}
              className="entrada-cita flex flex-col gap-0.5 border-l-2 pl-2"
              style={{ borderColor: colorPostura(r.postura) }}
            >
              <p className="line-clamp-2 text-sm leading-snug">{`“${r.cita}”`}</p>
              {c && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  {`${c.nombre}, ${c.edad} · ${c.barrio}`}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
