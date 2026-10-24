'use client'

import { ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DISTRITOS } from '@/data/arquetipos'
import type { Corrida } from '@/hooks/use-simulacion'
import { agregar, type Agregados } from '@/lib/agregados'
import type { Analisis } from '@/lib/tipos'
import { BarraProgreso } from './barra-progreso'
import { MapaRosario } from './mapa-rosario'

function Delta({ antes, despues, invertido }: { antes: number; despues: number; invertido?: boolean }) {
  const d = despues - antes
  const mejora = invertido ? -d : d
  const signo = d > 0 ? '+' : ''
  return (
    <span className={mejora > 0.5 ? 'font-mono text-favor' : mejora < -0.5 ? 'font-mono text-contra' : 'font-mono text-muted-foreground'}>
      {`${signo}${d.toFixed(0)} pts`}
    </span>
  )
}

function Comparacion({ antes, despues }: { antes: Agregados; despues: Agregados }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-md bg-muted p-4">
          <span className="text-xs text-muted-foreground">Aprobación original</span>
          <span className="font-mono text-3xl font-medium">{`${antes.aprobacion.toFixed(0)}%`}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-md bg-muted p-4">
          <span className="text-xs text-muted-foreground">Con ajuste</span>
          <span className="font-mono text-3xl font-medium">{`${despues.aprobacion.toFixed(0)}%`}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-md bg-muted p-4">
          <span className="text-xs text-muted-foreground">Rechazo</span>
          <span className="flex items-center gap-2 font-mono text-3xl font-medium">
            {`${despues.rechazo.toFixed(0)}%`}
            <span className="text-sm">
              <Delta antes={antes.rechazo} despues={despues.rechazo} invertido />
            </span>
          </span>
        </div>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-[1fr_1fr_minmax(0,1fr)]">
        <MapaRosario datos={antes.porDistrito} titulo="Antes" compacto />
        <MapaRosario datos={despues.porDistrito} titulo="Después" compacto />
        <table className="w-full text-sm">
          <caption className="sr-only">Aprobación por distrito antes y después del ajuste</caption>
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 font-medium">Distrito</th>
              <th className="py-2 text-right font-medium">Antes</th>
              <th className="py-2 text-right font-medium">Después</th>
              <th className="py-2 text-right font-medium">Cambio</th>
            </tr>
          </thead>
          <tbody>
            {DISTRITOS.map((d) => (
              <tr key={d} className="border-b last:border-0">
                <td className="py-2">{d}</td>
                <td className="py-2 text-right font-mono">{`${antes.porDistrito[d].aprobacion.toFixed(0)}%`}</td>
                <td className="py-2 text-right font-mono">{`${despues.porDistrito[d].aprobacion.toFixed(0)}%`}</td>
                <td className="py-2 text-right">
                  <Delta antes={antes.porDistrito[d].aprobacion} despues={despues.porDistrito[d].aprobacion} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type Props = {
  propuesta: Analisis['propuesta']
  original: Agregados
  ajuste: Corrida | null
  onResimular: (medida: string) => void
}

export function PanelAjuste({ propuesta, original, ajuste, onResimular }: Props) {
  const simulando = ajuste?.fase === 'simulando'
  const despues = ajuste && ajuste.respuestas.length ? agregar(ajuste.respuestas) : null

  return (
    <section aria-labelledby="ajuste-titulo" className="flex flex-col gap-6 rounded-lg border border-primary/40 bg-card p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-2xl flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">Propuesta de ajuste</span>
          <h3 id="ajuste-titulo" className="text-balance text-lg font-semibold">
            {propuesta.titulo}
          </h3>
          <p className="text-pretty leading-relaxed">{propuesta.medidaAjustada}</p>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{propuesta.justificacion}</p>
        </div>
        <Button onClick={() => onResimular(propuesta.medidaAjustada)} disabled={simulando} className="shrink-0">
          <RefreshCw className={simulando ? 'animate-spin' : ''} aria-hidden="true" />
          {ajuste?.fase === 'listo' ? 'Volver a simular' : 'Re-simular con ajuste'}
        </Button>
      </div>

      {simulando && <BarraProgreso respondieron={ajuste.respuestas.length} fallidos={ajuste.fallidos} />}

      {despues && (
        <div className="flex flex-col gap-4 border-t pt-6">
          <h4 className="flex items-center gap-2 text-sm font-medium">
            Original <ArrowRight className="size-4" aria-hidden="true" /> Con ajuste
          </h4>
          <Comparacion antes={original} despues={despues} />
        </div>
      )}
    </section>
  )
}
