'use client'

import { Info, Loader2, Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EJEMPLOS } from '@/data/ejemplos'
import { useSimulacion } from '@/hooks/use-simulacion'
import { agregar } from '@/lib/agregados'
import { BarraProgreso } from './barra-progreso'
import { Desglose } from './desglose'
import { MapaRosario } from './mapa-rosario'
import { PanelAjuste } from './panel-ajuste'
import { GanadoresPerdedores, Quejas, Testimonios } from './panel-analisis'

const ACCIONES: Record<string, string> = {
  apoya: 'Apoya',
  indiferente: 'Indiferente',
  se_queja: 'Se queja',
  cambia_habitos: 'Cambia hábitos',
  protesta: 'Protesta',
}

export function CiudadEspejo({ iaDisponible }: { iaDisponible: boolean }) {
  const [medida, setMedida] = useState('')
  const { principal, ajuste, analisis, aviso, fuenteCaso, simular, resimular, reiniciar } = useSimulacion(iaDisponible)
  const ocupado = principal.fase === 'simulando' || principal.fase === 'analizando'
  const ag = principal.respuestas.length ? agregar(principal.respuestas) : null

  const lanzar = (texto: string) => {
    const t = texto.trim()
    if (t.length < 8 || ocupado) return
    simular(t)
  }

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="medida-titulo" className="flex flex-col gap-4">
        <label htmlFor="medida" id="medida-titulo" className="text-sm font-medium">
          Medida a evaluar
        </label>
        <textarea
          id="medida"
          value={medida}
          onChange={(e) => setMedida(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              lanzar(medida)
            }
          }}
          maxLength={600}
          rows={3}
          placeholder="Ej: Subimos el boleto de colectivo un 30% a partir del mes que viene."
          className="w-full resize-none rounded-md border bg-card px-4 py-3 text-base leading-relaxed placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
        />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Ejemplos:</span>
            {EJEMPLOS.map((e) => (
              <Button
                key={e.id}
                variant="outline"
                size="sm"
                disabled={ocupado}
                onClick={() => {
                  setMedida(e.medida)
                  lanzar(e.medida)
                }}
              >
                {e.titulo}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {principal.fase !== 'inicio' && (
              <Button variant="ghost" size="sm" onClick={reiniciar}>
                <RotateCcw aria-hidden="true" />
                Reiniciar
              </Button>
            )}
            <Button onClick={() => lanzar(medida)} disabled={ocupado || medida.trim().length < 8}>
              {ocupado ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}
              Simular
            </Button>
          </div>
        </div>
        {aviso && (
          <p role="alert" className="flex items-start gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {aviso}
          </p>
        )}
      </section>

      {principal.fase !== 'inicio' && (
        <section aria-labelledby="resultado-titulo" className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="resultado-titulo" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Resultado de la simulación
              </h2>
              {principal.origen === 'precargado' && (
                <span className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {fuenteCaso === 'heuristica' ? 'Caso precargado (modelo heurístico)' : 'Caso precargado'}
                </span>
              )}
            </div>
            <p className="text-pretty text-lg leading-relaxed">{principal.medida}</p>
          </div>

          {principal.fase === 'simulando' && (
            <BarraProgreso respondieron={principal.respuestas.length} fallidos={principal.fallidos} />
          )}

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div className="flex flex-col gap-6 rounded-lg border bg-card p-5 md:p-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Aprobación general</span>
                <span className="font-mono text-7xl font-medium tracking-tight md:text-8xl">
                  {ag ? `${ag.aprobacion.toFixed(0)}%` : '—'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {ag
                    ? `${ag.respondieron} ciudadanos sintéticos, representando ~${Math.round(ag.habitantes / 1000).toLocaleString('es-AR')} mil habitantes`
                    : 'Esperando respuestas…'}
                </span>
              </div>
              {ag && (
                <>
                  <div className="flex h-3 overflow-hidden rounded-sm" aria-hidden="true">
                    <div className="bg-favor transition-[width] duration-500" style={{ width: `${ag.aprobacion}%` }} />
                    <div className="bg-muted-foreground/40 transition-[width] duration-500" style={{ width: `${ag.indiferencia}%` }} />
                    <div className="bg-contra transition-[width] duration-500" style={{ width: `${ag.rechazo}%` }} />
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">A favor</dt>
                      <dd className="font-mono text-favor">{`${ag.aprobacion.toFixed(0)}%`}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Indiferentes</dt>
                      <dd className="font-mono">{`${ag.indiferencia.toFixed(0)}%`}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">En contra</dt>
                      <dd className="font-mono text-contra">{`${ag.rechazo.toFixed(0)}%`}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-col gap-2 border-t pt-4">
                    <span className="text-xs text-muted-foreground">Qué harían</span>
                    <ul className="flex flex-wrap gap-2">
                      {Object.entries(ACCIONES).map(([k, etiqueta]) => (
                        <li key={k} className="rounded-sm bg-muted px-2 py-1 text-xs">
                          {`${etiqueta} `}
                          <span className="font-mono text-muted-foreground">{`${(ag.acciones[k] ?? 0).toFixed(0)}%`}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              {analisis && <p className="border-t pt-4 text-pretty leading-relaxed">{analisis.resumen}</p>}
              {principal.fase === 'analizando' && (
                <p className="flex items-center gap-2 border-t pt-4 text-sm text-muted-foreground" role="status">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Analizando resultados…
                </p>
              )}
            </div>
            <div className="rounded-lg border bg-card p-5 md:p-6">
              <MapaRosario datos={ag?.porDistrito ?? null} />
            </div>
          </div>

          {ag && principal.fase === 'listo' && (
            <>
              {analisis && <GanadoresPerdedores analisis={analisis} />}
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                {analisis && <Quejas quejas={analisis.quejas} />}
                <div className={analisis ? '' : 'lg:col-span-2'}>
                  <Desglose ingreso={ag.porIngreso} edad={ag.porEdad} transporte={ag.porTransporte} />
                </div>
              </div>
              {analisis && <Testimonios ids={analisis.testimonioIds} respuestas={principal.respuestas} />}
              {analisis && (
                <PanelAjuste propuesta={analisis.propuesta} original={ag} ajuste={ajuste} onResimular={resimular} />
              )}
            </>
          )}
        </section>
      )}
    </div>
  )
}
