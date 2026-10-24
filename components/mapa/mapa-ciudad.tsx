'use client'

import { Map as MapaGL, Marker, type GeoJSONSource, type MapLayerMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DISTRITOS, type Ciudadano, type Distrito } from '@/data/arquetipos'
import { CODIGO_DISTRITO, ENCUADRE_ROSARIO, POLIGONOS, centroide, ubicarEnDistrito } from '@/data/geo-distritos'
import { POBLACION_POR_ID, type Grupo } from '@/lib/agregados'
import { COLOR } from '@/lib/hud'
import type { Respuesta } from '@/lib/tipos'
import { TarjetaCiudadano } from './tarjeta-ciudadano'

const ESTILO = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const ALTURA_MAX = 2600
const DURACION_PULSO = 1100

const POBLACION = [...POBLACION_POR_ID.values()]
const INDICE = new Map(POBLACION.map((c, i) => [c.id, i]))

type Seleccion = { ciudadano: Ciudadano; respuesta: Respuesta | null; x: number; y: number; fijada: boolean }

type Props = {
  respuestas: Respuesta[]
  porDistrito: Record<Distrito, Grupo> | null
  orbitar: boolean
}

function geojsonDistritos(valores: Record<Distrito, { altura: number; score: number; activo: number }>) {
  return {
    type: 'FeatureCollection' as const,
    features: DISTRITOS.map((d, i) => ({
      type: 'Feature' as const,
      id: i,
      properties: { nombre: d, ...valores[d] },
      geometry: { type: 'Polygon' as const, coordinates: [[...POLIGONOS[d], POLIGONOS[d][0]]] },
    })),
  }
}

function objetivoDistritos(porDistrito: Props['porDistrito']) {
  return Object.fromEntries(
    DISTRITOS.map((d) => {
      const g = porDistrito?.[d]
      if (!g || g.n === 0) return [d, { altura: 0, score: 0, activo: 0 }]
      const intensidad = Math.max(g.aprobacion, g.rechazo) / 100
      return [d, { altura: 120 + intensidad * ALTURA_MAX, score: (g.aprobacion - g.rechazo) / 100, activo: 1 }]
    }),
  ) as Record<Distrito, { altura: number; score: number; activo: number }>
}

export default function MapaCiudad({ respuestas, porDistrito, orbitar }: Props) {
  const contenedor = useRef<HTMLDivElement>(null)
  const mapa = useRef<MapaGL | null>(null)
  const listo = useRef(false)
  const encendidos = useRef(new Set<string>())
  const pulsos = useRef(new Map<number, number>())
  const actual = useRef(objetivoDistritos(null))
  const objetivo = useRef(objetivoDistritos(null))
  const etiquetas = useRef<Partial<Record<Distrito, HTMLSpanElement>>>({})
  const orbitarRef = useRef(orbitar)
  const usuarioMovio = useRef(false)
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null)
  const respuestasPorId = useMemo(() => new Map(respuestas.map((r) => [r.id, r])), [respuestas])
  const respuestasRef = useRef(respuestasPorId)
  respuestasRef.current = respuestasPorId

  useEffect(() => {
    if (!contenedor.current) return
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const movil = window.innerWidth < 768
    const m = new MapaGL({
      container: contenedor.current,
      style: ESTILO,
      center: [-63.5, -34],
      zoom: 3.4,
      pitch: 0,
      attributionControl: { compact: true },
      maxPitch: 70,
    })
    mapa.current = m

    m.on('load', () => {
      m.addSource('distritos', { type: 'geojson', data: geojsonDistritos(actual.current) })
      m.addSource('ciudadanos', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: POBLACION.map((c, i) => ({
            type: 'Feature',
            id: i,
            properties: { cid: c.id },
            geometry: { type: 'Point', coordinates: ubicarEnDistrito(c.id, c.distrito) },
          })),
        },
      })

      m.addLayer({
        id: 'distritos-base',
        type: 'fill',
        source: 'distritos',
        paint: { 'fill-color': COLOR.linea, 'fill-opacity': 0.04 },
      })
      m.addLayer({
        id: 'distritos-3d',
        type: 'fill-extrusion',
        source: 'distritos',
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'score'],
            -0.6,
            COLOR.contra,
            0,
            COLOR.neutro,
            0.6,
            COLOR.favor,
          ],
          'fill-extrusion-height': ['get', 'altura'],
          'fill-extrusion-opacity': 0.42,
        },
      })
      m.addLayer({
        id: 'distritos-borde',
        type: 'line',
        source: 'distritos',
        paint: { 'line-color': COLOR.linea, 'line-width': 1.2, 'line-opacity': 0.55 },
      })

      const estado = ['coalesce', ['feature-state', 's'], -9]
      const pulso = ['coalesce', ['feature-state', 'p'], 0]
      const colorPunto = [
        'case',
        ['==', estado, -9],
        COLOR.apagado,
        ['>', estado, 0],
        COLOR.favor,
        ['<', estado, 0],
        COLOR.contra,
        COLOR.neutro,
      ]
      m.addLayer({
        id: 'ciudadanos-halo',
        type: 'circle',
        source: 'ciudadanos',
        paint: {
          // @ts-expect-error expresiones dinámicas de feature-state
          'circle-color': colorPunto,
          // @ts-expect-error expresiones dinámicas de feature-state
          'circle-radius': ['+', 3, ['*', ['-', 1, pulso], 18]],
          // @ts-expect-error expresiones dinámicas de feature-state
          'circle-opacity': ['*', pulso, 0.55],
          'circle-blur': 0.6,
        },
      })
      m.addLayer({
        id: 'ciudadanos',
        type: 'circle',
        source: 'ciudadanos',
        paint: {
          // @ts-expect-error expresiones dinámicas de feature-state
          'circle-color': colorPunto,
          // @ts-expect-error expresiones dinámicas de feature-state
          'circle-radius': ['+', 2.8, ['*', pulso, 2.4]],
          // @ts-expect-error expresiones dinámicas de feature-state
          'circle-opacity': ['case', ['==', estado, -9], 0.55, 1],
          'circle-stroke-width': ['case', ['boolean', ['feature-state', 'hover'], false], 1.5, 0],
          'circle-stroke-color': '#ffffff',
        },
      })

      for (const d of DISTRITOS) {
        const el = document.createElement('div')
        el.className = 'pointer-events-none flex flex-col items-center gap-0.5 font-mono text-[10px] uppercase tracking-[0.14em]'
        el.innerHTML = `<span style="color:${COLOR.linea};opacity:.7">${CODIGO_DISTRITO[d]}</span><span style="color:#e6f4f8">${d}</span>`
        const valor = document.createElement('span')
        valor.className = 'text-[11px] tabular-nums'
        valor.style.color = '#e6f4f8'
        el.appendChild(valor)
        etiquetas.current[d] = valor
        new Marker({ element: el }).setLngLat(centroide(POLIGONOS[d])).addTo(m)
      }

      listo.current = true
      const { clientWidth, clientHeight } = m.getContainer()
      const escala = Math.min(clientWidth / 1040, clientHeight / 844)
      const zoom = Math.min(11.55, Math.max(10, 11.55 + Math.log2(escala)))
      const destino = { center: ENCUADRE_ROSARIO, zoom: movil ? Math.min(zoom, 10.6) : zoom, pitch: movil ? 35 : 48, bearing: -16 }
      if (reducido) m.jumpTo(destino)
      else m.flyTo({ ...destino, duration: 5200, curve: 1.6, essential: true })
    })

    const marcarHover = (id: number | null) => {
      m.removeFeatureState({ source: 'ciudadanos' }, 'hover')
      if (id !== null) m.setFeatureState({ source: 'ciudadanos', id }, { hover: true })
    }

    const alMover = (e: MapLayerMouseEvent) => {
      const f = e.features?.[0]
      if (!f) return
      const c = POBLACION_POR_ID.get(f.properties.cid as string)
      if (!c) return
      m.getCanvas().style.cursor = 'pointer'
      marcarHover(f.id as number)
      setSeleccion((s) =>
        s?.fijada ? s : { ciudadano: c, respuesta: respuestasRef.current.get(c.id) ?? null, x: e.point.x, y: e.point.y, fijada: false },
      )
    }
    const alSalir = () => {
      m.getCanvas().style.cursor = ''
      setSeleccion((s) => (s?.fijada ? s : null))
      marcarHover(null)
    }
    const alClick = (e: MapLayerMouseEvent) => {
      const f = e.features?.[0]
      const c = f && POBLACION_POR_ID.get(f.properties.cid as string)
      if (!c) return
      setSeleccion({ ciudadano: c, respuesta: respuestasRef.current.get(c.id) ?? null, x: e.point.x, y: e.point.y, fijada: true })
    }
    m.on('mousemove', 'ciudadanos', alMover)
    m.on('mouseleave', 'ciudadanos', alSalir)
    m.on('click', 'ciudadanos', alClick)
    m.on('click', (e) => {
      const tocados = m.queryRenderedFeatures(e.point, { layers: ['ciudadanos'] })
      if (!tocados.length) setSeleccion(null)
    })
    const pausarOrbita = () => {
      usuarioMovio.current = true
    }
    m.on('dragstart', pausarOrbita)
    m.on('wheel', pausarOrbita)
    m.on('touchstart', pausarOrbita)

    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!listo.current) return
      const ahora = performance.now()

      for (const [id, inicio] of pulsos.current) {
        const t = (ahora - inicio) / DURACION_PULSO
        if (t < 0) continue
        const p = Math.max(0, 1 - t)
        m.setFeatureState({ source: 'ciudadanos', id }, { p })
        if (p === 0) pulsos.current.delete(id)
      }

      let cambio = false
      for (const d of DISTRITOS) {
        const a = actual.current[d]
        const o = objetivo.current[d]
        const altura = a.altura + (o.altura - a.altura) * 0.08
        const score = a.score + (o.score - a.score) * 0.1
        if (Math.abs(altura - a.altura) > 0.5 || Math.abs(score - a.score) > 0.001 || a.activo !== o.activo) {
          actual.current[d] = { altura, score, activo: o.activo }
          cambio = true
        }
      }
      if (cambio) (m.getSource('distritos') as GeoJSONSource | undefined)?.setData(geojsonDistritos(actual.current))

      if (orbitarRef.current && !usuarioMovio.current && !reducido && !m.isMoving()) {
        m.setBearing(m.getBearing() + 0.045)
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      listo.current = false
      m.remove()
      mapa.current = null
    }
  }, [])

  useEffect(() => {
    orbitarRef.current = orbitar
    if (orbitar) usuarioMovio.current = false
  }, [orbitar])

  useEffect(() => {
    const m = mapa.current
    objetivo.current = objetivoDistritos(porDistrito)
    for (const d of DISTRITOS) {
      const el = etiquetas.current[d]
      const g = porDistrito?.[d]
      if (!el) continue
      if (!g || g.n === 0) {
        el.textContent = ''
        continue
      }
      el.textContent = `${g.aprobacion.toFixed(0)}% ▲  ${g.rechazo.toFixed(0)}% ▼`
    }
    if (!m) return
  }, [porDistrito])

  useEffect(() => {
    const m = mapa.current
    if (!m || !listo.current) return
    if (respuestas.length < encendidos.current.size) {
      m.removeFeatureState({ source: 'ciudadanos' })
      encendidos.current.clear()
      pulsos.current.clear()
    }
    const ahora = performance.now()
    for (const r of respuestas) {
      if (encendidos.current.has(r.id)) continue
      const id = INDICE.get(r.id)
      if (id === undefined) continue
      encendidos.current.add(r.id)
      const retraso = Math.random() * 650
      pulsos.current.set(id, ahora + retraso)
      window.setTimeout(() => mapa.current?.setFeatureState({ source: 'ciudadanos', id }, { s: r.postura, p: 1 }), retraso)
    }
  }, [respuestas])

  return (
    <div className="absolute inset-0">
      <div ref={contenedor} className="h-full w-full" aria-label="Mapa de Rosario con la reacción de cada ciudadano sintético" role="region" />
      {seleccion && <TarjetaCiudadano {...seleccion} onCerrar={() => setSeleccion(null)} />}
    </div>
  )
}
