'use client'

import { X } from 'lucide-react'
import { motion } from 'motion/react'
import type { Ciudadano } from '@/data/arquetipos'
import { colorPostura, iniciales } from '@/lib/hud'
import type { Respuesta } from '@/lib/tipos'

const POSTURA: Record<number, string> = {
  2: 'Muy a favor',
  1: 'A favor',
  0: 'Neutral',
  [-1]: 'En contra',
  [-2]: 'Muy en contra',
}

type Props = {
  ciudadano: Ciudadano
  respuesta: Respuesta | null
  x: number
  y: number
  fijada: boolean
  onCerrar: () => void
}

export function TarjetaCiudadano({ ciudadano: c, respuesta: r, x, y, fijada, onCerrar }: Props) {
  const color = r ? colorPostura(r.postura) : undefined
  const izquierda = x > 360

  return (
    <motion.div
      key={c.id}
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="glass pointer-events-auto absolute z-20 w-72 rounded-lg p-4"
      style={{
        left: izquierda ? x - 300 : x + 16,
        top: Math.max(8, y - 40),
        borderColor: color ? `${color}66` : undefined,
      }}
      role="dialog"
      aria-label={`Ciudadano ${c.nombre}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-md font-mono text-sm font-medium"
          style={{ background: color ? `${color}22` : 'var(--muted)', color: color ?? 'var(--muted-foreground)' }}
          aria-hidden="true"
        >
          {iniciales(c.nombre)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-medium leading-tight">{c.nombre}</span>
          <span className="font-mono text-xs text-muted-foreground">{`${c.edad} años · ${c.id.toUpperCase()}`}</span>
        </div>
        {fijada && (
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
            aria-label="Cerrar tarjeta"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <dt className="etiqueta-hud">Barrio</dt>
        <dd className="truncate">{`${c.barrio} · ${c.distrito}`}</dd>
        <dt className="etiqueta-hud">Ocupación</dt>
        <dd className="line-clamp-2">{c.ocupacion}</dd>
      </dl>
      {r ? (
        <div className="mt-3 flex flex-col gap-2 border-t pt-3">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color }}>
            <span className="size-1.5 rounded-full" style={{ background: color }} aria-hidden="true" />
            {POSTURA[r.postura]}
          </span>
          <p className="text-pretty text-sm leading-relaxed">{`“${r.cita}”`}</p>
        </div>
      ) : (
        <p className="mt-3 border-t pt-3 font-mono text-xs text-muted-foreground">Sin respuesta todavía</p>
      )}
    </motion.div>
  )
}
