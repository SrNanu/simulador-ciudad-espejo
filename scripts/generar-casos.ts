// Genera los casos precargados en data/casos/*.json.
// Uso: pnpm casos   (requiere una key de IA en .env.local o .env.development.local)
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { EJEMPLOS } from '../data/ejemplos'
import { analizar } from '../lib/analisis'
import { simular } from '../lib/simulacion'
import type { CasoPrecargado } from '../lib/tipos'

for (const archivo of ['.env.local', '.env.development.local', '.env']) {
  if (existsSync(archivo)) process.loadEnvFile(archivo)
}

const destino = join(process.cwd(), 'data', 'casos')
mkdirSync(destino, { recursive: true })

const soloId = process.argv[2]

async function generar(ejemplo: (typeof EJEMPLOS)[number]) {
  console.log(`▶ ${ejemplo.titulo}: simulando…`)
  const respuestas = await simular(ejemplo.medida, () => {})
  console.log(`  ${respuestas.length} respuestas. Analizando…`)
  const analisis = await analizar(ejemplo.medida, respuestas)
  console.log(`  Ajuste: ${analisis.propuesta.medidaAjustada}\n  Re-simulando ajuste…`)
  const ajustadas = await simular(analisis.propuesta.medidaAjustada, () => {})

  const caso: CasoPrecargado = {
    id: ejemplo.id,
    titulo: ejemplo.titulo,
    medida: ejemplo.medida,
    fuente: 'ia',
    respuestas,
    analisis,
    ajuste: { medida: analisis.propuesta.medidaAjustada, respuestas: ajustadas },
  }
  writeFileSync(join(destino, `${ejemplo.id}.json`), JSON.stringify(caso, null, 1))
  console.log(`✓ ${ejemplo.id}.json guardado`)
}

const seleccion = EJEMPLOS.filter((e) => !soloId || e.id === soloId)
Promise.all(seleccion.map(generar)).catch((error) => {
  console.error(error)
  process.exit(1)
})
