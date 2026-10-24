# Ciudad Espejo

Simulador de políticas públicas para municipios. Un funcionario escribe una medida en lenguaje natural y la app simula cómo reaccionaría la población de Rosario usando 300 ciudadanos sintéticos generados con IA.

**Track:** Social & Sector Público — Shippear, Rosario.

## El problema

Las decisiones públicas se toman lejos de su impacto real, y ese impacto se suele descubrir demasiado tarde: cuando la medida ya se anunció, hay quejas en la calle o hay que dar marcha atrás.

## Cómo funciona

1. **Población** — `data/arquetipos.ts` define 14 arquetipos (edad, ingreso, ocupación, transporte, familia) con pesos por cada uno de los 6 distritos. Se generan 300 ciudadanos determinísticos con nombre, edad, barrio y un rasgo personal; cada uno tiene un factor de expansión para representar ~1 millón de habitantes. Los pesos son estimaciones inspiradas en el Censo 2022, no datos oficiales.
2. **Simulación** (`POST /api/simular`) — los ciudadanos se agrupan en lotes de 25 que se mandan en paralelo al modelo rápido. Cada uno reacciona solo desde su perfil, con instrucción explícita anti-complacencia. Las respuestas se validan con zod (un reintento por lote) y se streamean por NDJSON para pintar el mapa en vivo.
3. **Análisis** (`POST /api/analizar`) — el modelo de análisis recibe los agregados y una muestra de citas, y devuelve resumen, ganadores/perdedores, quejas principales, testimonios y una propuesta de ajuste.
4. **Ajuste y re-simulación** — la medida ajustada se vuelve a simular y se compara antes/después, en general y por distrito.

### Casos precargados

Los 3 ejemplos están guardados en `data/casos/*.json`. Si no hay key, la API falla o se alcanza el límite, los botones de ejemplo cargan el caso al instante con una animación de pintado.

- `npm run casos` — genera los casos con IA (requiere key).
- `npm run casos:sin-ia` — genera versiones con un modelo heurístico determinístico (se marcan como tales en la UI).

### Protección de costos

Máximo 5 simulaciones nuevas por IP por hora (en memoria) y tope duro de 300 ciudadanos por simulación.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Vercel AI SDK (`ai`) con Anthropic o Google · zod · recharts · Vercel.

## Correrlo local

```bash
npm install
cp .env.example .env.local   # completá ANTHROPIC_API_KEY (o AI_PROVIDER=google + GOOGLE_GENERATIVE_AI_API_KEY)
npm run dev
```

Variables: `AI_PROVIDER` (`anthropic` | `google`), `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, y opcionalmente `AI_MODEL_SIMULACION` / `AI_MODEL_ANALISIS`.

## Capturas

<!-- Agregar capturas acá -->

## Demo

<!-- Link a la demo en Vercel -->

---

Simulación orientativa con ciudadanos sintéticos. No reemplaza la consulta ciudadana real.
