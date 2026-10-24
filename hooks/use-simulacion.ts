'use client'

import { useCallback, useRef, useState } from 'react'
import { EJEMPLOS } from '@/data/ejemplos'
import type { Analisis, CasoPrecargado, EventoSimulacion, Respuesta } from '@/lib/tipos'

export type Fase = 'inicio' | 'simulando' | 'analizando' | 'listo'
export type Origen = 'vivo' | 'precargado'

export type Corrida = {
  medida: string
  fase: Fase
  respuestas: Respuesta[]
  fallidos: number
  origen: Origen
}

const corridaVacia = (medida = ''): Corrida => ({ medida, fase: 'inicio', respuestas: [], fallidos: 0, origen: 'vivo' })

type ResultadoVivo = { ok: true; respuestas: Respuesta[] } | { ok: false; codigo: string; mensaje: string }

async function correrEnVivo(
  medida: string,
  alLote: (r: Respuesta[]) => void,
  alFallo: (n: number) => void,
  signal: AbortSignal,
): Promise<ResultadoVivo> {
  try {
    const res = await fetch('/api/simular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medida }),
      signal,
    })
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, codigo: data.codigo ?? 'error', mensaje: data.error ?? 'La simulación falló.' }
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    const todas: Respuesta[] = []
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lineas = buffer.split('\n')
      buffer = lineas.pop() ?? ''
      for (const linea of lineas) {
        if (!linea.trim()) continue
        const evento = JSON.parse(linea) as EventoSimulacion
        if (evento.tipo === 'lote') {
          todas.push(...evento.respuestas)
          alLote(evento.respuestas)
        } else if (evento.tipo === 'lote_fallido') {
          alFallo(evento.ids.length)
        }
      }
    }
    if (todas.length === 0) return { ok: false, codigo: 'vacia', mensaje: 'Ningún lote respondió.' }
    return { ok: true, respuestas: todas }
  } catch (error) {
    if (signal.aborted) return { ok: false, codigo: 'cancelada', mensaje: 'Cancelada' }
    return { ok: false, codigo: 'red', mensaje: 'No se pudo conectar con el simulador.' }
  }
}

async function animarPintado(respuestas: Respuesta[], alLote: (r: Respuesta[]) => void, signal: AbortSignal) {
  const orden = [...respuestas].sort(() => Math.random() - 0.5)
  for (let i = 0; i < orden.length; i += 25) {
    if (signal.aborted) return
    alLote(orden.slice(i, i + 25))
    await new Promise((r) => setTimeout(r, 140 + Math.random() * 160))
  }
}

async function obtenerCaso(id: string): Promise<CasoPrecargado | null> {
  const res = await fetch(`/api/casos/${id}`)
  return res.ok ? res.json() : null
}

function casoParaMedida(medida: string) {
  return EJEMPLOS.find((e) => e.medida.trim() === medida.trim())
}

export function useSimulacion(iaDisponible: boolean) {
  const [principal, setPrincipal] = useState<Corrida>(corridaVacia())
  const [ajuste, setAjuste] = useState<Corrida | null>(null)
  const [analisis, setAnalisis] = useState<Analisis | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [fuenteCaso, setFuenteCaso] = useState<CasoPrecargado['fuente'] | null>(null)
  const casoActual = useRef<CasoPrecargado | null>(null)
  const control = useRef<AbortController | null>(null)

  const nuevoControl = () => {
    control.current?.abort()
    control.current = new AbortController()
    return control.current.signal
  }

  const ejecutar = useCallback(
    async (
      medida: string,
      setCorrida: React.Dispatch<React.SetStateAction<Corrida>> | React.Dispatch<React.SetStateAction<Corrida | null>>,
      precargadas: Respuesta[] | null,
      signal: AbortSignal,
    ): Promise<{ respuestas: Respuesta[]; origen: Origen } | null> => {
      const set = setCorrida as React.Dispatch<React.SetStateAction<Corrida | null>>
      set({ ...corridaVacia(medida), fase: 'simulando' })
      const alLote = (r: Respuesta[]) => set((c) => (c ? { ...c, respuestas: [...c.respuestas, ...r] } : c))
      const alFallo = (n: number) => set((c) => (c ? { ...c, fallidos: c.fallidos + n } : c))

      if (iaDisponible) {
        const vivo = await correrEnVivo(medida, alLote, alFallo, signal)
        if (signal.aborted) return null
        if (vivo.ok) return { respuestas: vivo.respuestas, origen: 'vivo' }
        if (!precargadas) {
          setAviso(
            vivo.codigo === 'limite'
              ? `${vivo.mensaje} Mientras tanto, probá con los casos de ejemplo.`
              : `${vivo.mensaje} Probá con uno de los casos de ejemplo, que están precargados.`,
          )
          set(corridaVacia(medida))
          return null
        }
        setAviso(
          vivo.codigo === 'limite'
            ? 'Llegaste al límite de simulaciones en vivo. Mostrando el caso precargado.'
            : 'La simulación en vivo no está disponible. Mostrando el caso precargado.',
        )
      } else if (!precargadas) {
        setAviso('No hay un proveedor de IA configurado. Por ahora solo funcionan los casos de ejemplo precargados.')
        set(corridaVacia(medida))
        return null
      }

      set({ ...corridaVacia(medida), fase: 'simulando', origen: 'precargado' })
      await animarPintado(precargadas, alLote, signal)
      if (signal.aborted) return null
      return { respuestas: precargadas, origen: 'precargado' }
    },
    [iaDisponible],
  )

  const simular = useCallback(
    async (medida: string) => {
      const signal = nuevoControl()
      setAviso(null)
      setAnalisis(null)
      setAjuste(null)
      setFuenteCaso(null)
      const ejemplo = casoParaMedida(medida)
      const caso = ejemplo ? await obtenerCaso(ejemplo.id) : null
      casoActual.current = caso

      const resultado = await ejecutar(medida, setPrincipal, caso?.respuestas ?? null, signal)
      if (!resultado) return

      if (resultado.origen === 'precargado' && caso) {
        setFuenteCaso(caso.fuente)
        setAnalisis(caso.analisis)
        setPrincipal((c) => ({ ...c, fase: 'listo' }))
        return
      }

      setPrincipal((c) => ({ ...c, fase: 'analizando' }))
      try {
        const res = await fetch('/api/analizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medida, respuestas: resultado.respuestas }),
          signal,
        })
        if (res.ok) setAnalisis(await res.json())
        else setAviso('La simulación terminó, pero el análisis no se pudo generar.')
      } catch {
        if (!signal.aborted) setAviso('La simulación terminó, pero el análisis no se pudo generar.')
      }
      if (!signal.aborted) setPrincipal((c) => ({ ...c, fase: 'listo' }))
    },
    [ejecutar],
  )

  const resimular = useCallback(
    async (medidaAjustada: string) => {
      const signal = nuevoControl()
      setAviso(null)
      const caso = casoActual.current
      const precargadas = caso?.ajuste && caso.ajuste.medida === medidaAjustada ? caso.ajuste.respuestas : null
      const resultado = await ejecutar(medidaAjustada, setAjuste, precargadas, signal)
      if (resultado) setAjuste((c) => (c ? { ...c, fase: 'listo', origen: resultado.origen } : c))
    },
    [ejecutar],
  )

  const reiniciar = useCallback(() => {
    control.current?.abort()
    setPrincipal(corridaVacia())
    setAjuste(null)
    setAnalisis(null)
    setAviso(null)
    setFuenteCaso(null)
  }, [])

  return { principal, ajuste, analisis, aviso, fuenteCaso, simular, resimular, reiniciar }
}
