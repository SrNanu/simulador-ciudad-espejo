import type { CasoPrecargado } from '../../lib/tipos'
import boleto from './boleto.json'
import pichincha from './estacionamiento-pichincha.json'
import peatonal from './peatonal-cordoba.json'

export const CASOS: Record<string, CasoPrecargado> = {
  boleto: boleto as CasoPrecargado,
  'peatonal-cordoba': peatonal as CasoPrecargado,
  'estacionamiento-pichincha': pichincha as CasoPrecargado,
}
