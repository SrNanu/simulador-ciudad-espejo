import { TOTAL_CIUDADANOS } from '@/data/arquetipos'

export function BarraProgreso({ respondieron, fallidos }: { respondieron: number; fallidos: number }) {
  const total = TOTAL_CIUDADANOS
  const pct = ((respondieron + fallidos) / total) * 100
  return (
    <div className="flex flex-col gap-2" role="status" aria-live="polite">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span>
          <span className="font-mono font-medium">{respondieron}</span>
          {` de ${total} ciudadanos respondieron`}
        </span>
        {fallidos > 0 && <span className="text-xs text-muted-foreground">{`${fallidos} sin respuesta`}</span>}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
