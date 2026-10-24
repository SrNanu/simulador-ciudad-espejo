import { CiudadEspejo } from '@/components/ciudad-espejo'
import { BarraSuperior } from '@/components/hud/barra-superior'
import { iaDisponible } from '@/lib/ia'

export const dynamic = 'force-dynamic'

export default function Page() {
  const ia = iaDisponible()
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="fondo-grilla" aria-hidden="true" />
      <BarraSuperior ia={ia} />
      <main className="flex flex-1 flex-col">
        <h1 className="sr-only">Ciudad Espejo — simulador de políticas públicas para Rosario</h1>
        <CiudadEspejo iaDisponible={ia} />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-1 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p>Simulación orientativa con ciudadanos sintéticos. No reemplaza la consulta ciudadana real.</p>
          <p className="font-mono text-xs">Pesos poblacionales estimados, inspirados en el Censo 2022. No son datos oficiales.</p>
        </div>
      </footer>
    </div>
  )
}
