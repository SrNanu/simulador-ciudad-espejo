'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Grupo } from '@/lib/agregados'

function GraficoGrupo({ titulo, grupos }: { titulo: string; grupos: Grupo[] }) {
  const datos = grupos
    .filter((g) => g.n > 0)
    .map((g) => ({ clave: g.clave, favor: Math.round(g.aprobacion), contra: Math.round(g.rechazo), n: g.n }))
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium">{titulo}</h4>
      <div style={{ height: datos.length * 34 + 20 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }} barCategoryGap={6}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="clave"
              width={80}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--accent)' }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--popover-foreground)',
                fontSize: 12,
              }}
              formatter={(v, nombre) => [`${v}%`, nombre === 'favor' ? 'A favor' : 'En contra']}
            />
            <Bar dataKey="favor" stackId="a" fill="var(--favor)" />
            <Bar dataKey="contra" stackId="a" fill="var(--contra)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function Desglose({ ingreso, edad, transporte }: { ingreso: Grupo[]; edad: Grupo[]; transporte: Grupo[] }) {
  return (
    <section aria-labelledby="desglose-titulo" className="flex flex-col gap-5 rounded-lg border bg-card p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 id="desglose-titulo" className="text-base font-semibold">
          Desglose por segmento
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-favor" aria-hidden="true" /> A favor
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-contra" aria-hidden="true" /> En contra
          </span>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <GraficoGrupo titulo="Nivel de ingreso" grupos={ingreso} />
        <GraficoGrupo titulo="Edad" grupos={edad} />
        <GraficoGrupo titulo="Transporte principal" grupos={transporte} />
      </div>
    </section>
  )
}
