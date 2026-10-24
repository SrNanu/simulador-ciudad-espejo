import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { LanguageModel } from 'ai'

type Proveedor = 'anthropic' | 'google' | 'gateway'

const MODELOS_POR_DEFECTO: Record<Proveedor, { simulacion: string; analisis: string }> = {
  anthropic: { simulacion: 'claude-haiku-5-5', analisis: 'claude-sonnet-5-5' },
  google: { simulacion: 'gemini-3.5-flash', analisis: 'gemini-3.1-pro-preview' },
  gateway: { simulacion: 'anthropic/claude-haiku-5.5', analisis: 'anthropic/claude-sonnet-5.5' },
}

function detectarProveedor(): Proveedor | null {
  const explicito = process.env.AI_PROVIDER?.toLowerCase()
  if (explicito === 'anthropic' && process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (explicito === 'google' && process.env.GOOGLE_GENERATIVE_AI_API_KEY) return 'google'
  if (explicito === 'gateway') return 'gateway'
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return 'google'
  if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) return 'gateway'
  return null
}

export function iaDisponible() {
  return detectarProveedor() !== null
}

export function obtenerModelo(uso: 'simulacion' | 'analisis'): LanguageModel {
  const proveedor = detectarProveedor()
  if (!proveedor) throw new Error('No hay proveedor de IA configurado')

  const envModelo = uso === 'simulacion' ? process.env.AI_MODEL_SIMULACION : process.env.AI_MODEL_ANALISIS
  const id = envModelo || MODELOS_POR_DEFECTO[proveedor][uso]

  if (proveedor === 'anthropic') return createAnthropic()(id)
  if (proveedor === 'google') return createGoogleGenerativeAI()(id)
  return id
}
