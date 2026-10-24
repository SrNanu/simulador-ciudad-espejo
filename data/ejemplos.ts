export const EJEMPLOS = [
  {
    id: 'boleto',
    titulo: 'Boleto de colectivo +30%',
    medida: 'Subimos el boleto de colectivo urbano un 30% a partir del mes próximo para sostener el sistema de transporte.',
  },
  {
    id: 'peatonal-cordoba',
    titulo: 'Peatonalizar Córdoba hasta Oroño',
    medida: 'Extendemos la peatonal Córdoba desde Plaza San Martín hasta Bv. Oroño, cerrando ese tramo al tránsito vehicular.',
  },
  {
    id: 'estacionamiento-pichincha',
    titulo: 'Estacionamiento medido en Pichincha',
    medida: 'Implementamos estacionamiento medido pago en todo el barrio Pichincha, de lunes a sábado de 8 a 20 y viernes y sábados hasta las 3 de la mañana.',
  },
] as const

export type EjemploId = (typeof EJEMPLOS)[number]['id']
