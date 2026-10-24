import { CiudadEspejo } from '@/components/ciudad-espejo'
import { iaDisponible } from '@/lib/ia'

export const dynamic = 'force-dynamic'

export default function Page() {
  const ia = iaDisponible()
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-sm bg-primary font-mono text-sm font-medium text-primary-foreground" aria-hidden="true">
              CE
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold">Ciudad Espejo</span>
              <span className="text-xs text-muted-foreground">Simulador de políticas públicas · Rosario</span>
            </div>
          </div>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={ia ? 'size-2 rounded-full bg-favor' : 'size-2 rounded-full bg-muted-foreground'} aria-hidden="true" />
            {ia ? 'Simulación en vivo disponible' : 'Modo casos precargados'}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 md:px-6">
        <div className="flex max-w-3xl flex-col gap-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Antes de anunciar una medida, mirá cómo la recibiría la ciudad.
          </h1>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Escribí una medida en lenguaje natural. 300 ciudadanos sintéticos de los seis distritos de Rosario reaccionan
            desde su bolsillo, su trabajo y su forma de moverse. Después te proponemos un ajuste y lo volvés a simular.
          </p>
        </div>
        <CiudadEspejo iaDisponible={ia} />
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground md:px-6">
          <p>Simulación orientativa con ciudadanos sintéticos. No reemplaza la consulta ciudadana real.</p>
          <p className="text-xs">
            Pesos poblacionales estimados, inspirados en el Censo 2022. No son datos oficiales.
          </p>
        </div>
      </footer>
    </div>
  )
}
