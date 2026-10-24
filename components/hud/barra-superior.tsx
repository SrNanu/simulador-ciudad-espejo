'use client'

import { useEffect, useState } from 'react'
import { hora } from '@/lib/hud'

export function BarraSuperior({ ia }: { ia: boolean }) {
  const [reloj, setReloj] = useState<string | null>(null)

  useEffect(() => {
    const actualizar = () => setReloj(hora())
    actualizar()
    const id = window.setInterval(actualizar, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <span
          className="brillo-cian flex size-8 items-center justify-center rounded-md border border-primary/50 font-mono text-xs font-medium text-primary"
          aria-hidden="true"
        >
          CE
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-wide">CIUDAD ESPEJO</span>
          <span className="etiqueta-hud hidden sm:block">Centro de simulación urbana · Rosario</span>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <span className="etiqueta-hud hidden md:inline">{'32°56′S  60°38′O'}</span>
        <span className="etiqueta-hud hidden tabular-nums md:inline" suppressHydrationWarning>
          {reloj ? `ART ${reloj}` : 'ART --:--:--'}
        </span>
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          <span
            className={ia ? 'parpadeo size-2 rounded-full bg-favor' : 'size-2 rounded-full bg-neutro'}
            aria-hidden="true"
          />
          <span className={ia ? 'text-favor' : 'text-neutro'}>{ia ? 'Live' : 'Precargado'}</span>
        </span>
      </div>
    </header>
  )
}
