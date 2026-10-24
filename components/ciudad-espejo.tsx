'use client'

import { Clapperboard, Info, Loader2, Play, RotateCcw } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { POBLACION_POR_ID } from '@/lib/agregados'
import { FeedCitas } from './feed-citas'
import { Button } from '@/components/ui/button'
import { EJEMPLOS } from '@/data/ejemplos'
import { useSimulacion } from '@/hooks/use-simulacion'
import { agregar } from '@/lib/agregados'
import { simId } from '@/lib/hud'
import { BarraProgreso } from './barra-progreso'
import { Desglose } from './desglose'
import { PanelAjuste } from './panel-ajuste'
import { GanadoresPerdedores, Quejas, Testimonios } from './panel-analisis'

const MapaCiudad = dynamic(() => import('./mapa/mapa-ciudad'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="etiqueta-hud parpadeo">Inicializando cartografía…</span>
    </div>
  ),
})

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

  const [demo, setDemo] = useState(false)
  const resultadoRef = useRef<HTMLElement>(null)
  const ajusteRef = useRef<HTMLDivElement>(null)

  const lanzar = (texto: string) => {
    const t = texto.trim()
    if (t.length < 8 || ocupado) return
    setDemo(false)
    simular(t)
  }

  const iniciarDemo = () => {
    const boleto = EJEMPLOS.find((e) => e.id === 'boleto')
    if (!boleto) return
    setMedida(boleto.medida)
    setDemo(true)
    simular(boleto.medida, true)
  }

  const iniciarDemoRef = useRef(iniciarDemo)
  iniciarDemoRef.current = iniciarDemo
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('demo')) {
      const t = window.setTimeout(() => iniciarDemoRef.current(), 2500)
      return () => window.clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!demo || principal.fase !== 'listo' || !analisis || ajuste) return
    const t1 = window.setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 2500)
    const t2 = window.setTimeout(() => {
      ajusteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      resimular(analisis.propuesta.medidaAjustada, true)
    }, 9000)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [demo, principal.fase, analisis, ajuste, resimular])

  useEffect(() => {
    if (demo && ajuste?.fase === 'listo') setDemo(false)
  }, [demo, ajuste?.fase])

  const alReiniciar = () => {
    setDemo(false)
    reiniciar()
  }

  return (
    <div className="flex flex-col">
      <div className="grid md:h-[calc(100dvh-3.5rem)] md:grid-cols-[340px_minmax(0,1fr)] lg:grid-cols-[400px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 overflow-y-auto border-b p-4 md:border-r md:border-b-0 md:p-5">
          <section aria-labelledby="medida-titulo" className="glass flex flex-col gap-3 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="medida" id="medida-titulo" className="etiqueta-hud">
                Medida a evaluar
              </label>
              <span className="font-mono text-[11px] text-primary/80">
                {principal.medida ? simId(principal.medida) : 'SIM-····'}
              </span>
            </div>
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
              rows={4}
              placeholder="Ej: Subimos el boleto de colectivo un 30% a partir del mes que viene."
              className="w-full resize-none rounded-md border bg-background/60 px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              {principal.fase !== 'inicio' ? (
                <Button variant="ghost" size="sm" onClick={alReiniciar}>
                  <RotateCcw aria-hidden="true" />
                  Reiniciar
                </Button>
              ) : (
                <span className="font-mono text-[11px] text-muted-foreground">{'Ctrl + Enter'}</span>
              )}
              <Button onClick={() => lanzar(medida)} disabled={ocupado || medida.trim().length < 8} className="brillo-cian">
                {ocupado ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}
                Simular
              </Button>
            </div>
          </section>

          <Button variant="outline" onClick={iniciarDemo} disabled={ocupado || demo} className="justify-between">
            <span className="flex items-center gap-2">
              <Clapperboard aria-hidden="true" />
              {demo ? 'Demo en curso…' : 'Modo demo automático'}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">Boleto +30%</span>
          </Button>

          <section aria-labelledby="ejemplos-titulo" className="flex flex-col gap-2">
            <h2 id="ejemplos-titulo" className="etiqueta-hud">
              Escenarios precargados
            </h2>
            <ul className="flex flex-col gap-1.5">
              {EJEMPLOS.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => {
                      setMedida(e.medida)
                      lanzar(e.medida)
                    }}
                    className="group flex w-full items-center justify-between gap-3 rounded-md border bg-card/40 px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                  >
                    <span>{e.titulo}</span>
                    <span className="font-mono text-[11px] text-muted-foreground group-hover:text-primary">
                      {simId(e.medida)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {aviso && (
            <p role="alert" className="flex items-start gap-2 rounded-md border border-neutro/30 bg-neutro/5 px-3 py-2 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-neutro" aria-hidden="true" />
              {aviso}
            </p>
          )}

          {principal.fase !== 'inicio' && (
            <section aria-labelledby="aprobacion-titulo" className="glass flex flex-col gap-4 rounded-lg p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 id="aprobacion-titulo" className="etiqueta-hud">
                  Aprobación general
                </h2>
                {principal.origen === 'precargado' && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutro">
                    {fuenteCaso === 'heuristica' ? 'Precargado · heurístico' : 'Precargado'}
                  </span>
                )}
              </div>
              <span className="font-mono text-6xl font-medium tracking-tight tabular-nums text-primary">
                {ag ? `${ag.aprobacion.toFixed(0)}%` : '—'}
              </span>
              {ag && (
                <>
                  <div className="flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
                    <div className="bg-favor transition-[width] duration-500" style={{ width: `${ag.aprobacion}%` }} />
                    <div className="bg-neutro transition-[width] duration-500" style={{ width: `${ag.indiferencia}%` }} />
                    <div className="bg-contra transition-[width] duration-500" style={{ width: `${ag.rechazo}%` }} />
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground">A favor</dt>
                      <dd className="font-mono text-sm text-favor">{`${ag.aprobacion.toFixed(0)}%`}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground">Neutrales</dt>
                      <dd className="font-mono text-sm text-neutro">{`${ag.indiferencia.toFixed(0)}%`}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground">En contra</dt>
                      <dd className="font-mono text-sm text-contra">{`${ag.rechazo.toFixed(0)}%`}</dd>
                    </div>
                  </dl>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {`${ag.respondieron} ciudadanos · ~${Math.round(ag.habitantes / 1000).toLocaleString('es-AR')} mil habitantes`}
                  </p>
                </>
              )}
              {principal.fase === 'analizando' && (
                <p className="flex items-center gap-2 border-t pt-3 text-sm text-muted-foreground" role="status">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Analizando resultados…
                </p>
              )}
            </section>
          )}
        </aside>

        <section aria-label="Mapa de la simulación" className="relative h-[70vh] overflow-hidden md:h-full">
          <MapaCiudad
            respuestas={principal.respuestas}
            porDistrito={ag?.porDistrito ?? null}
            orbitar={principal.fase === 'listo'}
          />
          <div className="pointer-events-none absolute top-4 left-4 flex flex-col gap-1">
            <span className="etiqueta-hud text-primary/80">
              {principal.medida ? `${simId(principal.medida)} · ${principal.fase.toUpperCase()}` : 'STANDBY'}
            </span>
            <span className="etiqueta-hud">{'Rosario · 6 distritos · 300 agentes'}</span>
          </div>
          {principal.fase === 'simulando' && (
            <div className="glass absolute top-4 right-4 left-4 rounded-lg p-3 md:left-auto md:w-80">
              <BarraProgreso respondieron={principal.respuestas.length} fallidos={principal.fallidos} />
            </div>
          )}
          {principal.respuestas.length > 0 && principal.fase !== 'listo' && (
            <div className="pointer-events-none absolute right-4 bottom-8 left-4 hidden sm:block md:left-auto">
              <FeedCitas respuestas={principal.respuestas} total={POBLACION_POR_ID.size} />
            </div>
          )}
          <ul className="glass pointer-events-none absolute bottom-8 left-4 flex flex-col gap-1.5 rounded-md px-3 py-2.5 font-mono text-[11px]">
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-favor" aria-hidden="true" />A favor
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-neutro" aria-hidden="true" />
              Neutral
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-contra" aria-hidden="true" />
              En contra
            </li>
            <li className="text-muted-foreground">{'Altura = intensidad'}</li>
          </ul>
        </section>
      </div>

      {ag && principal.fase === 'listo' && (
        <section ref={resultadoRef} aria-labelledby="resultado-titulo" className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-10 md:px-6">
          <div className="flex flex-col gap-2">
            <h2 id="resultado-titulo" className="etiqueta-hud">
              Resultado de la simulación
            </h2>
            <p className="text-pretty text-lg leading-relaxed">{principal.medida}</p>
            {analisis && <p className="text-pretty leading-relaxed text-muted-foreground">{analisis.resumen}</p>}
            <ul className="flex flex-wrap gap-2">
              {Object.entries(ACCIONES).map(([k, etiqueta]) => (
                <li key={k} className="rounded-sm border bg-card/40 px-2 py-1 text-xs">
                  {`${etiqueta} `}
                  <span className="font-mono text-muted-foreground">{`${(ag.acciones[k] ?? 0).toFixed(0)}%`}</span>
                </li>
              ))}
            </ul>
          </div>
          {analisis && <GanadoresPerdedores analisis={analisis} />}
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            {analisis && <Quejas quejas={analisis.quejas} />}
            <div className={analisis ? '' : 'lg:col-span-2'}>
              <Desglose ingreso={ag.porIngreso} edad={ag.porEdad} transporte={ag.porTransporte} />
            </div>
          </div>
          {analisis && <Testimonios ids={analisis.testimonioIds} respuestas={principal.respuestas} />}
          {analisis && (
            <div ref={ajusteRef} className="scroll-mt-20">
              <PanelAjuste propuesta={analisis.propuesta} original={ag} ajuste={ajuste} onResimular={(m) => resimular(m)} />
            </div>
          )}
        </section>
      )}
    </div>
  )
}
