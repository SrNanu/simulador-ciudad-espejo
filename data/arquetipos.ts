// Población sintética de Rosario.
// IMPORTANTE: las poblaciones por distrito y los pesos de cada arquetipo son
// ESTIMACIONES APROXIMADAS inspiradas en el Censo 2022 (INDEC) y en la
// distribución general conocida de la ciudad. No son datos oficiales y están
// pensadas para ser ajustadas por quien use la herramienta.

export const DISTRITOS = ['Centro', 'Norte', 'Noroeste', 'Oeste', 'Sudoeste', 'Sur'] as const
export type Distrito = (typeof DISTRITOS)[number]

export type Ingreso = 'bajo' | 'medio' | 'alto'
export type Transporte = 'colectivo' | 'auto' | 'moto' | 'bicicleta' | 'a pie'

// Habitantes estimados por distrito (suman ~1.000.000). Ajustables.
export const POBLACION_DISTRITO: Record<Distrito, number> = {
  Centro: 260_000,
  Norte: 150_000,
  Noroeste: 160_000,
  Oeste: 140_000,
  Sudoeste: 130_000,
  Sur: 160_000,
}

export const BARRIOS: Record<Distrito, string[]> = {
  Centro: ['Barrio Centro', 'Pichincha', 'Barrio Martin', 'República de la Sexta', 'Abasto', 'Lourdes', 'Parque España'],
  Norte: ['Alberdi', 'Arroyito', 'La Florida', 'Refinería', 'Lisandro de la Torre', 'Parque Field'],
  Noroeste: ['Fisherton', 'Empalme Graneros', 'Ludueña', 'Barrio Belgrano', 'Cristalería', 'Barrio Industrial'],
  Oeste: ['Echesortu', 'Bella Vista', 'Godoy', 'Barrio Toba', 'Villa Urquiza', 'Barrio Triángulo'],
  Sudoeste: ['Barrio Tango', 'Moderno', 'Antártida Argentina', 'Hostal del Sol', 'Barrio Acindar', 'Parque Casas'],
  Sur: ['Saladillo', 'Las Flores', 'Tablada', 'Villa Manuelita', 'La Granada', 'Barrio Plata'],
}

export type Arquetipo = {
  id: string
  etiqueta: string
  edad: [number, number]
  ingreso: Ingreso
  ocupacion: string
  transporte: Transporte
  familia: string
  // Peso relativo del arquetipo dentro de cada distrito (estimación ajustable).
  peso: Record<Distrito, number>
}

export const ARQUETIPOS: Arquetipo[] = [
  {
    id: 'jubilada-colectivo',
    etiqueta: 'Jubilada que usa colectivo',
    edad: [66, 84],
    ingreso: 'bajo',
    ocupacion: 'jubilada con la mínima',
    transporte: 'colectivo',
    familia: 'viuda, vive sola, ayuda con los nietos',
    peso: { Centro: 8, Norte: 9, Noroeste: 8, Oeste: 9, Sudoeste: 8, Sur: 10 },
  },
  {
    id: 'jubilado-clase-media',
    etiqueta: 'Jubilado de clase media',
    edad: [65, 80],
    ingreso: 'medio',
    ocupacion: 'jubilado, ex empleado administrativo',
    transporte: 'a pie',
    familia: 'casado, hijos grandes',
    peso: { Centro: 10, Norte: 8, Noroeste: 5, Oeste: 5, Sudoeste: 3, Sur: 5 },
  },
  {
    id: 'estudiante-unr',
    etiqueta: 'Estudiante universitario',
    edad: [19, 25],
    ingreso: 'bajo',
    ocupacion: 'estudiante de la UNR, trabaja part-time',
    transporte: 'bicicleta',
    familia: 'alquila con compañeros, vino del interior',
    peso: { Centro: 12, Norte: 4, Noroeste: 3, Oeste: 5, Sudoeste: 3, Sur: 4 },
  },
  {
    id: 'comerciante-centro',
    etiqueta: 'Comerciante del centro con auto',
    edad: [42, 63],
    ingreso: 'medio',
    ocupacion: 'dueño de un local comercial en el microcentro',
    transporte: 'auto',
    familia: 'casado, dos hijos adolescentes',
    peso: { Centro: 7, Norte: 4, Noroeste: 3, Oeste: 3, Sudoeste: 2, Sur: 3 },
  },
  {
    id: 'informal-oeste',
    etiqueta: 'Trabajador informal',
    edad: [24, 50],
    ingreso: 'bajo',
    ocupacion: 'changarín y albañil sin registrar',
    transporte: 'colectivo',
    familia: 'en pareja, tres hijos',
    peso: { Centro: 1, Norte: 4, Noroeste: 9, Oeste: 12, Sudoeste: 11, Sur: 8 },
  },
  {
    id: 'profesional-joven',
    etiqueta: 'Profesional joven',
    edad: [26, 36],
    ingreso: 'alto',
    ocupacion: 'desarrolladora de software, trabaja híbrido',
    transporte: 'bicicleta',
    familia: 'soltera, alquila un monoambiente',
    peso: { Centro: 10, Norte: 5, Noroeste: 3, Oeste: 2, Sudoeste: 1, Sur: 2 },
  },
  {
    id: 'familia-media-norte',
    etiqueta: 'Familia de clase media',
    edad: [35, 50],
    ingreso: 'medio',
    ocupacion: 'empleado bancario',
    transporte: 'auto',
    familia: 'casado, dos hijos en primaria',
    peso: { Centro: 6, Norte: 11, Noroeste: 7, Oeste: 5, Sudoeste: 4, Sur: 6 },
  },
  {
    id: 'repartidor-moto',
    etiqueta: 'Repartidor en moto',
    edad: [20, 34],
    ingreso: 'bajo',
    ocupacion: 'repartidor de aplicaciones, monotributista',
    transporte: 'moto',
    familia: 'vive con la madre, mantiene a un hijo',
    peso: { Centro: 3, Norte: 5, Noroeste: 7, Oeste: 7, Sudoeste: 7, Sur: 6 },
  },
  {
    id: 'docente',
    etiqueta: 'Docente',
    edad: [30, 58],
    ingreso: 'medio',
    ocupacion: 'maestra de escuela pública, trabaja en dos escuelas',
    transporte: 'colectivo',
    familia: 'separada, un hijo',
    peso: { Centro: 6, Norte: 7, Noroeste: 6, Oeste: 6, Sudoeste: 5, Sur: 6 },
  },
  {
    id: 'empleada-domestica',
    etiqueta: 'Empleada doméstica',
    edad: [28, 60],
    ingreso: 'bajo',
    ocupacion: 'empleada doméstica por horas en casas del centro',
    transporte: 'colectivo',
    familia: 'jefa de hogar, cuatro hijos',
    peso: { Centro: 1, Norte: 4, Noroeste: 8, Oeste: 9, Sudoeste: 10, Sur: 9 },
  },
  {
    id: 'obrero-industrial',
    etiqueta: 'Obrero industrial',
    edad: [28, 55],
    ingreso: 'medio',
    ocupacion: 'operario metalúrgico en el cordón industrial',
    transporte: 'moto',
    familia: 'casado, tres hijos',
    peso: { Centro: 1, Norte: 6, Noroeste: 7, Oeste: 6, Sudoeste: 9, Sur: 9 },
  },
  {
    id: 'taxista',
    etiqueta: 'Taxista',
    edad: [38, 64],
    ingreso: 'medio',
    ocupacion: 'taxista, alquila la licencia',
    transporte: 'auto',
    familia: 'casado, hijos grandes',
    peso: { Centro: 3, Norte: 3, Noroeste: 3, Oeste: 3, Sudoeste: 3, Sur: 3 },
  },
  {
    id: 'madre-barrio-popular',
    etiqueta: 'Madre en barrio popular',
    edad: [22, 40],
    ingreso: 'bajo',
    ocupacion: 'ama de casa, cobra un plan social, hace changas de costura',
    transporte: 'a pie',
    familia: 'cinco hijos, pareja con trabajo inestable',
    peso: { Centro: 0, Norte: 3, Noroeste: 8, Oeste: 10, Sudoeste: 10, Sur: 8 },
  },
  {
    id: 'empresario',
    etiqueta: 'Empresario',
    edad: [45, 66],
    ingreso: 'alto',
    ocupacion: 'dueño de una pyme de logística',
    transporte: 'auto',
    familia: 'casado, hijos en colegio privado',
    peso: { Centro: 4, Norte: 3, Noroeste: 4, Oeste: 1, Sudoeste: 1, Sur: 1 },
  },
  {
    id: 'enfermera',
    etiqueta: 'Trabajadora de la salud',
    edad: [27, 52],
    ingreso: 'medio',
    ocupacion: 'enfermera en hospital público, hace guardias nocturnas',
    transporte: 'colectivo',
    familia: 'en pareja, dos hijos',
    peso: { Centro: 5, Norte: 5, Noroeste: 5, Oeste: 5, Sudoeste: 5, Sur: 5 },
  },
]

const NOMBRES_F = ['María', 'Lucía', 'Graciela', 'Sofía', 'Valeria', 'Norma', 'Carla', 'Micaela', 'Silvia', 'Florencia', 'Rosa', 'Agustina', 'Marta', 'Daniela', 'Julieta', 'Elena', 'Brenda', 'Camila', 'Liliana', 'Romina']
const NOMBRES_M = ['Juan', 'Carlos', 'Diego', 'Matías', 'Jorge', 'Lautaro', 'Hugo', 'Sergio', 'Facundo', 'Rubén', 'Nicolás', 'Walter', 'Franco', 'Alberto', 'Gonzalo', 'Ezequiel', 'Raúl', 'Tomás', 'Héctor', 'Leandro']
const APELLIDOS = ['González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Gómez', 'Pérez', 'Sánchez', 'Romero', 'Benítez', 'Acosta', 'Medina', 'Herrera', 'Suárez', 'Aguirre', 'Ferreyra', 'Ríos', 'Ojeda', 'Paz', 'Vera', 'Coronel', 'Ledesma']
const RASGOS = [
  'muy desconfiado/a de la política',
  'votó al oficialismo municipal',
  'votó a la oposición',
  'no sigue las noticias',
  'muy activo/a en el grupo de WhatsApp del barrio',
  'llega justo a fin de mes',
  'tiene deudas con la tarjeta',
  'participa en una vecinal',
  'le preocupa mucho la inseguridad',
  'cuida cada peso',
  'es optimista con la ciudad',
  'está pensando en irse del país',
  'hace changas extra los fines de semana',
  'tiene un familiar con discapacidad a cargo',
  'trabaja muy lejos de su casa',
]

const FEMENINOS = new Set(['jubilada-colectivo', 'profesional-joven', 'docente', 'empleada-domestica', 'madre-barrio-popular', 'enfermera'])
const MASCULINOS = new Set(['jubilado-clase-media', 'comerciante-centro', 'informal-oeste', 'familia-media-norte', 'obrero-industrial', 'taxista', 'empresario'])

export type Ciudadano = {
  id: string
  nombre: string
  edad: number
  distrito: Distrito
  barrio: string
  arquetipoId: string
  ocupacion: string
  ingreso: Ingreso
  transporte: Transporte
  familia: string
  rasgo: string
  factor: number
}

// PRNG determinístico (mulberry32) para que la población sea siempre la misma.
function crearRng(semilla: number) {
  let a = semilla
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const TOTAL_CIUDADANOS = 300

export function generarPoblacion(total = TOTAL_CIUDADANOS, semilla = 2026): Ciudadano[] {
  const rng = crearRng(semilla)
  const elegir = <T,>(lista: T[]) => lista[Math.floor(rng() * lista.length)]
  const habitantes = Object.values(POBLACION_DISTRITO).reduce((a, b) => a + b, 0)
  const poblacion: Ciudadano[] = []

  for (const distrito of DISTRITOS) {
    const n = Math.round((total * POBLACION_DISTRITO[distrito]) / habitantes)
    const factor = Math.round(POBLACION_DISTRITO[distrito] / n)
    const pesos = ARQUETIPOS.map((a) => a.peso[distrito])
    const sumaPesos = pesos.reduce((a, b) => a + b, 0)

    for (let i = 0; i < n; i++) {
      let r = rng() * sumaPesos
      let idx = 0
      while (r > pesos[idx]) {
        r -= pesos[idx]
        idx++
      }
      const arq = ARQUETIPOS[idx]
      const femenino = FEMENINOS.has(arq.id) ? true : MASCULINOS.has(arq.id) ? false : rng() < 0.5
      const nombre = `${elegir(femenino ? NOMBRES_F : NOMBRES_M)} ${elegir(APELLIDOS)}`
      const edad = arq.edad[0] + Math.floor(rng() * (arq.edad[1] - arq.edad[0] + 1))
      poblacion.push({
        id: `c${String(poblacion.length + 1).padStart(3, '0')}`,
        nombre,
        edad,
        distrito,
        barrio: elegir(BARRIOS[distrito]),
        arquetipoId: arq.id,
        ocupacion: arq.ocupacion,
        ingreso: arq.ingreso,
        transporte: arq.transporte,
        familia: arq.familia,
        rasgo: elegir(RASGOS),
        factor,
      })
    }
  }
  return poblacion.slice(0, total)
}

export function grupoEdad(edad: number) {
  if (edad < 30) return '18–29'
  if (edad < 45) return '30–44'
  if (edad < 65) return '45–64'
  return '65+'
}
