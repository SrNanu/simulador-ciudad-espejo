import { CASOS } from '@/data/casos'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const caso = CASOS[id]
  if (!caso) return Response.json({ error: 'Caso no encontrado' }, { status: 404 })
  return Response.json(caso)
}
