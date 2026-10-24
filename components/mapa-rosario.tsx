'use client'

import { useState } from 'react'
import { DISTRITOS, type Distrito } from '@/data/arquetipos'
import type { Grupo } from '@/lib/agregados'

// Esquema simplificado de los 6 distritos municipales de Rosario (no a escala).
const FORMAS: Record<Distrito, { puntos: string; etiqueta: [number, number] }> = {
  Noroeste: { puntos: '30,70 240,40 248,175 55,195', etiqueta: [140, 120] },
  Norte: { puntos: '240,40 318,22 336,172 248,175', etiqueta: [290, 105] },
  Centro: { puntos: '248,175 336,172 346,258 252,262', etiqueta: [298, 218] },
  Oeste: { puntos: '55,195 248,175 252,262 238,298 42,310', etiqueta: [148, 248] },
  Sudoeste: { puntos: '42,310 238,298 226,412 70,400', etiqueta: [140, 356] },
  Sur: { puntos: '238,298 252,262 346,258 334,410 226,412', etiqueta: [288, 340] },
}

export function colorAprobacion(aprobacion: number) {
  const t = Math.max(0, Math.min(100, (aprobacion - 15) * (100 / 60)))
  return `color-mix(in oklch, var(--favor) ${t}%, var(--contra))`
}

type Props = {
  datos: Record<Distrito, Grupo> | null
  titulo?: string
  compacto?: boolean
}

export function MapaRosario({ datos, titulo = 'Aprobación por distrito', compacto }: Props) {
  const [activo, setActivo] = useState<Distrito | null>(null)
  const grupoActivo = activo && datos ? datos[activo] : null

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{titulo}</span>
        <span className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {grupoActivo && activo
            ? `${activo}: ${grupoActivo.aprobacion.toFixed(0)}% a favor · ${grupoActivo.rechazo.toFixed(0)}% en contra · ${grupoActivo.n} resp.`
            : 'Pasá el cursor por un distrito'}
        </span>
      </figcaption>
      <svg
        viewBox="0 0 400 430"
        className={compacto ? 'h-auto w-full max-w-xs self-center' : 'h-auto w-full max-w-md self-center'}
        role="img"
        aria-label={titulo}
      >
        <path
          d="M 338 0 C 352 90, 356 200, 362 260 C 368 330, 350 380, 340 430 L 400 430 L 400 0 Z"
          fill="var(--primary)"
          opacity="0.14"
        />
        <text x="378" y="150" fill="var(--primary)" fontSize="11" opacity="0.7" transform="rotate(90 378 150)">
          Río Paraná
        </text>
        {DISTRITOS.map((d) => {
          const g = datos?.[d]
          const tiene = g && g.n > 0
          const forma = FORMAS[d]
          return (
            <g
              key={d}
              tabIndex={0}
              role="button"
              aria-label={tiene ? `${d}: ${g.aprobacion.toFixed(0)}% de aprobación` : `${d}: sin datos todavía`}
              onMouseEnter={() => setActivo(d)}
              onMouseLeave={() => setActivo(null)}
              onFocus={() => setActivo(d)}
              onBlur={() => setActivo(null)}
              className="cursor-pointer outline-none"
            >
              <polygon
                points={forma.puntos}
                fill={tiene ? colorAprobacion(g.aprobacion) : 'var(--muted)'}
                stroke={activo === d ? 'var(--foreground)' : 'var(--background)'}
                strokeWidth={activo === d ? 3 : 2.5}
                strokeLinejoin="round"
                style={{ transition: 'fill 500ms ease' }}
              />
              <text
                x={forma.etiqueta[0]}
                y={forma.etiqueta[1]}
                textAnchor="middle"
                fill="var(--background)"
                fontSize={compacto ? 15 : 13}
                fontWeight={600}
                className="pointer-events-none"
              >
                {d}
              </text>
              {tiene && (
                <text
                  x={forma.etiqueta[0]}
                  y={forma.etiqueta[1] + 18}
                  textAnchor="middle"
                  fill="var(--background)"
                  fontSize={compacto ? 15 : 14}
                  fontFamily="var(--font-mono)"
                  className="pointer-events-none"
                >
                  {`${g.aprobacion.toFixed(0)}%`}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      {!compacto && (
        <div className="flex items-center gap-2 self-center text-xs text-muted-foreground" aria-hidden="true">
          <span>En contra</span>
          <span
            className="h-2 w-32 rounded-sm"
            style={{ background: 'linear-gradient(to right, var(--contra), color-mix(in oklch, var(--favor) 50%, var(--contra)), var(--favor))' }}
          />
          <span>A favor</span>
        </div>
      )}
    </figure>
  )
}
