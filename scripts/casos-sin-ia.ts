// Genera casos precargados SIN IA, con reglas por arquetipo escritas a mano.
// Sirve solo como respaldo para la demo cuando no hay key de IA disponible.
// Reemplazalos por casos reales con `pnpm casos` apenas haya una key.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { generarPoblacion } from '../data/arquetipos'
import { EJEMPLOS } from '../data/ejemplos'
import type { Analisis, CasoPrecargado, Respuesta } from '../lib/tipos'

type Accion = Respuesta['accion']
type Regla = [postura: number, accion: Accion, motivo: string, citas: [string, string]]
type Tabla = Record<string, Regla>

const BOLETO: Tabla = {
  'jubilada-colectivo': [-2, 'protesta', 'La jubilación no le alcanza y viaja todos los días', ['Con la mínima ya no llego, ¿y ahora me suben el boleto? Voy a tener que dejar de ir a ver a mis nietos.', 'Siempre pagamos los mismos. Que viajen ellos en el 115 a ver si les parece caro.']],
  'jubilado-clase-media': [-1, 'se_queja', 'Usa poco el colectivo pero le parece un abuso', ['Yo me muevo caminando, pero 30% de una es una barbaridad, mirá lo que es el servicio.', 'Y no te mejoran nada, eh. Las mismas unidades destartaladas de siempre.']],
  'estudiante-unr': [-1, 'cambia_habitos', 'Va a usar más la bici para no pagar', ['Ya me muevo en bici casi siempre, pero cuando llueve el bondi era la salvación. Ahora ni eso.', 'Encima el medio boleto no cubre todo, esto me mata el presupuesto del mes.']],
  'comerciante-centro': [0, 'indiferente', 'No usa colectivo, teme menos clientes', ['A mí directamente no me toca porque voy en auto, pero si la gente gasta más en viajar, gasta menos en el local.', 'Mientras no me cierren las calles, me da un poco igual.']],
  'informal-oeste': [-2, 'protesta', 'Gasta una parte enorme de lo que gana en viajar', ['Hago changas en Fisherton y me tomo dos bondis por día. Con esto trabajo para pagar el viaje, loco.', 'Que se dejen de joder. Si no tengo trabajo fijo, ¿cómo pago un 30% más?']],
  'profesional-joven': [0, 'indiferente', 'Va en bici y trabaja híbrido', ['La verdad que no me afecta mucho, voy en bici. Entiendo que el sistema hay que bancarlo.', 'Si se traduce en mejores frecuencias, lo banco. Si no, es más de lo mismo.']],
  'familia-media-norte': [-1, 'se_queja', 'Los chicos van al colegio en colectivo', ['Yo uso el auto, pero mis dos hijos van en colectivo y suma un montón a fin de mes.', 'Todo sube menos el sueldo. Un 30% más es otro gasto que hay que recortar de algún lado.']],
  'repartidor-moto': [0, 'indiferente', 'Se mueve en moto, no le cambia', ['Yo ando en la moto todo el día, el bondi ni lo toco. Lo que me mata es la nafta.', 'Me da igual, pero mi vieja sí lo va a sentir.']],
  'docente': [-2, 'se_queja', 'Viaja entre dos escuelas cada día', ['Trabajo en dos escuelas, son cuatro boletos por día. Con lo que cobramos es un golpazo.', 'Después dicen que la educación es prioridad. Que nos den un boleto docente, por lo menos.']],
  'empleada-domestica': [-2, 'protesta', 'Viaja desde lejos y el patrón no le reconoce el aumento', ['Viajo una hora y pico hasta el centro. La señora no me va a pagar el aumento del boleto, eso seguro.', 'Somos los que más lejos vivimos y los que más pagamos. No es justo.']],
  'obrero-industrial': [-1, 'cambia_habitos', 'Se mueve en moto, pero su familia no', ['Yo voy en la moto a la fábrica, pero mi señora y los pibes usan el colectivo todos los días.', 'Va a ser más moto y menos colectivo. Ya está.']],
  'taxista': [1, 'apoya', 'Algunos pasajeros podrían pasarse al taxi', ['Si el colectivo se pone caro capaz que algunos se toman más taxi para viajes cortos.', 'No me parece mal que el sistema se pague, hace años que nadie lo arregla.']],
  'madre-barrio-popular': [-2, 'protesta', 'No puede pagar los viajes a la salita y la escuela', ['Si tengo que llevar a los cinco chicos al hospital, ¿con qué plata pago los boletos?', 'Ya casi no salimos del barrio. Con esto menos todavía.']],
  'empresario': [1, 'apoya', 'Prefiere un sistema sostenible a subsidios', ['Es una medida impopular pero necesaria. El transporte no puede vivir de subsidios eternamente.', 'Lo que pido es que se note en el servicio. Si no, no se sostiene políticamente.']],
  'enfermera': [-2, 'se_queja', 'Hace guardias nocturnas y depende del colectivo', ['Salgo de la guardia a las seis de la mañana y el colectivo es lo único que tengo. Encima ahora más caro.', 'Nosotras sostenemos la salud pública y no nos reconocen nada. Ni el boleto.']],
}

const BOLETO_AJUSTE: Tabla = {
  'jubilada-colectivo': [1, 'apoya', 'Queda exenta por cobrar la mínima', ['Si a los jubilados no nos cobran, está bien. Que paguen los que pueden.', 'Bueno, por lo menos se acordaron de nosotros esta vez.']],
  'jubilado-clase-media': [0, 'indiferente', 'Le parece más razonable en etapas', ['En dos partes es más digerible. Igual no lo uso tanto.', 'Así está mejor, sin el golpe de una.']],
  'estudiante-unr': [1, 'apoya', 'Tarifa social del 50% para estudiantes', ['Con la tarifa social me queda casi igual que antes, lo puedo bancar.', 'Mirá vos, cuando escuchan a la gente sale algo razonable.']],
  'comerciante-centro': [0, 'indiferente', 'Sigue sin afectarle directamente', ['Me sigue dando igual, pero si la gente no se funde mejor para el comercio.', 'Está bien que lo hagan escalonado.']],
  'informal-oeste': [-1, 'se_queja', 'Duda de poder acceder a la tarifa social sin recibo', ['¿Y cómo demuestro que gano poco si no tengo recibo? Siempre quedamos afuera.', 'Suena lindo, pero el trámite seguro que es un lío.']],
  'profesional-joven': [1, 'apoya', 'Le parece un esquema más justo', ['Escalonado y con tarifa social, me parece bien pensado.', 'Esto sí lo banco, que pague más el que puede.']],
  'familia-media-norte': [-1, 'se_queja', 'No califica para la tarifa social', ['Los de clase media pagamos todo y no entramos en ningún beneficio.', 'Para mis hijos sigue siendo un gasto más.']],
  'repartidor-moto': [0, 'indiferente', 'Sigue sin usar el colectivo', ['Me sigue dando igual, yo ando en moto.', 'Para mi vieja está mejor, eso sí.']],
  'docente': [0, 'se_queja', 'Mejor escalonado, pero sigue sin boleto docente', ['Es menos peor, pero sigo pagando cuatro boletos por día.', 'Un alivio a medias. Insisto con el boleto docente.']],
  'empleada-domestica': [0, 'cambia_habitos', 'La tarifa social la alivia si califica', ['Si entro en la tarifa social, me salva. Si no, estoy igual.', 'Voy a averiguar en el distrito cómo se tramita.']],
  'obrero-industrial': [0, 'indiferente', 'El aumento escalonado se siente menos en la familia', ['En dos veces se lleva mejor. Igual sigo en la moto.', 'Bueno, es un poco más razonable.']],
  'taxista': [0, 'indiferente', 'Menos efecto sobre sus viajes', ['Me da lo mismo, la verdad.', 'Bien por los jubilados, eso sí.']],
  'madre-barrio-popular': [0, 'se_queja', 'Alivio parcial, pero sigue costando', ['Con la mitad algo ayuda, pero cinco chicos son cinco boletos igual.', 'Ojalá sea fácil anotarse, porque nunca lo es.']],
  'empresario': [1, 'apoya', 'Sigue siendo sostenible y más aceptable', ['Es una forma inteligente de hacerlo. Menos costo político, mismo objetivo.', 'Bien. Focalizar el subsidio es lo correcto.']],
  'enfermera': [0, 'se_queja', 'Pide incluir a trabajadores nocturnos', ['Mejor, pero deberían pensar en los que trabajamos de noche.', 'Es un paso, pero a la salud pública todavía no la miran.']],
}

const PEATONAL: Tabla = {
  'jubilada-colectivo': [1, 'apoya', 'Le gusta caminar tranquila por el centro', ['Me encanta caminar por Córdoba, así sin autos voy más tranquila.', 'Mientras el colectivo me deje cerca, está lindo.']],
  'jubilado-clase-media': [1, 'apoya', 'Pasea por el centro casi a diario', ['Va a quedar hermoso hasta el Oroño. Yo camino todos los días por ahí.', 'Lindo para la ciudad, ojalá la mantengan limpia.']],
  'estudiante-unr': [1, 'apoya', 'Más espacio para bici y caminar', ['Buenísimo, más ciudad para la gente y menos para los autos.', 'Ojalá hagan bicisendas que conecten bien.']],
  'comerciante-centro': [-2, 'protesta', 'Teme perder clientes que llegan en auto y la carga', ['¿Y cómo descargo la mercadería? ¿Y los clientes dónde estacionan? Nos van a fundir.', 'Lo deciden desde un escritorio. Que vengan a ver cómo está el centro.']],
  'informal-oeste': [0, 'indiferente', 'Casi no va al centro', ['Ni voy al centro, la verdad. Que hagan lo que quieran.', 'Con lo que tenemos en el barrio, ¿esto es la prioridad?']],
  'profesional-joven': [2, 'apoya', 'Vive cerca y valora el espacio público', ['¡Por fin! Ciudades como Barcelona hacen esto hace años.', 'Va a mejorar un montón el barrio, más bares y más gente en la calle.']],
  'familia-media-norte': [-1, 'se_queja', 'Va al centro en auto y teme más tránsito', ['Va a ser un caos el tránsito en las paralelas. Ya está imposible.', 'Lindo para pasear el domingo, pero un día de semana es un problema.']],
  'repartidor-moto': [-1, 'se_queja', 'Le complica las entregas en la zona', ['Para repartir es un garrón, vas a tener que dejar la moto lejos.', 'Más vueltas, más nafta, y el pedido lo pagan igual.']],
  'docente': [1, 'apoya', 'Le parece bueno para la vida urbana', ['Me parece bien, el centro tiene que ser de la gente.', 'Mientras no desvíen los colectivos lejos, lo apoyo.']],
  'empleada-domestica': [-1, 'se_queja', 'Teme que desvíen los colectivos que usa', ['Si desvían el colectivo tengo que caminar diez cuadras más con el calor.', 'Esto es para los del centro, a nosotros no nos cambia nada para bien.']],
  'obrero-industrial': [0, 'indiferente', 'No va al centro', ['A mí ni me va ni me viene, yo trabajo en zona sur.', 'Que arreglen las calles del barrio primero.']],
  'taxista': [-2, 'protesta', 'Pierde una vía clave y menos pasajeros en la zona', ['Otra calle menos para trabajar. El centro ya es un embudo.', 'Después se quejan de que el taxi tarda. ¿Por dónde querés que pase?']],
  'madre-barrio-popular': [0, 'indiferente', 'No le cambia la vida diaria', ['No sé ni dónde queda eso. En el barrio no tenemos ni veredas.', 'Lindo para algunos, supongo.']],
  'empresario': [-1, 'se_queja', 'Preocupado por la logística y el valor comercial', ['Sin carga y descarga ordenada, la logística en esa zona se vuelve inviable.', 'No me opongo, pero así de golpe es improvisado.']],
  'enfermera': [0, 'indiferente', 'Le preocupa el acceso de ambulancias', ['Mientras dejen pasar a las ambulancias, me da igual.', 'Lindo, pero hay cosas más urgentes en los hospitales.']],
}

const PEATONAL_AJUSTE: Tabla = {
  ...PEATONAL,
  'comerciante-centro': [0, 'se_queja', 'La ventana de carga y la prueba lo alivian', ['Con horario de carga a la mañana es otra cosa. A ver cómo funciona la prueba.', 'Si de verdad nos van a escuchar en la evaluación, lo banco.']],
  'familia-media-norte': [0, 'indiferente', 'Un período de prueba le parece razonable', ['Tres meses de prueba está bien, después vemos.', 'Si el tránsito no se pone imposible, de acuerdo.']],
  'repartidor-moto': [0, 'indiferente', 'Con horario de carga puede entrar a la mañana', ['Si a la mañana se puede entrar, me organizo.', 'Bueno, por lo menos pensaron en los que trabajamos.']],
  'empleada-domestica': [0, 'indiferente', 'Prioridad a colectivos en las paralelas', ['Si el colectivo no se demora, me da igual.', 'Vamos a ver si es cierto que priorizan los colectivos.']],
  'taxista': [-1, 'se_queja', 'Sigue perdiendo la calle, pero hay prueba', ['Igual nos cierran una calle, pero bueno, que sea de prueba.', 'Que en la evaluación nos pregunten también a los taxistas.']],
  'empresario': [1, 'apoya', 'Con ventana logística el proyecto es viable', ['Con ventana de carga y una etapa de prueba, me parece sensato.', 'Así sí. Planificado y medible.']],
}

const PICHINCHA: Tabla = {
  'jubilada-colectivo': [0, 'indiferente', 'No tiene auto', ['Yo no tengo auto, que cobren lo que quieran.', 'Por ahí así se ordena un poco ese barrio.']],
  'jubilado-clase-media': [-1, 'se_queja', 'Vive en la zona y tendría que pagar por estacionar en su cuadra', ['¿Tengo que pagar para dejar el auto en la puerta de mi casa? Es un robo.', 'Siempre buscan sacarle plata al vecino.']],
  'estudiante-unr': [-1, 'se_queja', 'Lo ve como recaudación nocturna sobre los que salen', ['Es recaudación pura. ¿Hasta las tres de la mañana? Dale.', 'Igual yo voy en bici, pero mis amigos van a dejar de ir a Pichincha.']],
  'comerciante-centro': [1, 'apoya', 'Más rotación de autos cerca de los comercios', ['Si rota el estacionamiento, los clientes encuentran lugar. Me sirve.', 'Por fin algo de orden, los autos quedan todo el día en la misma cuadra.']],
  'informal-oeste': [0, 'indiferente', 'No va a Pichincha', ['Eso es para los chetos que salen de noche, a mí no me cambia.', 'Ni idea, nunca voy para ese lado.']],
  'profesional-joven': [-1, 'se_queja', 'Vive en Pichincha y teme pagar siendo residente', ['Vivo en Pichincha. Si no hay permiso para residentes es un despropósito.', 'Ordenar está bien, pero cobrarle al que vive ahí es ridículo.']],
  'familia-media-norte': [-1, 'se_queja', 'Sale a comer los fines de semana por la zona', ['Salir a cenar ya es caro, encima ahora pagar el estacionamiento.', 'Vamos a terminar quedándonos en casa.']],
  'repartidor-moto': [-1, 'se_queja', 'Teme que también controlen las motos', ['Si me cobran a la moto por cada entrega, estoy frito.', 'Siempre les cae a los que laburamos en la calle.']],
  'docente': [0, 'indiferente', 'No usa auto', ['Yo voy en colectivo, no me toca.', 'Mientras lo recaudado vaya a algo útil.']],
  'empleada-domestica': [0, 'indiferente', 'No tiene auto', ['No tengo auto, me da igual.', 'Que se arreglen los que tienen auto.']],
  'obrero-industrial': [0, 'indiferente', 'No frecuenta la zona', ['Nunca voy a Pichincha, ni me enteré.', 'No me afecta en nada.']],
  'taxista': [1, 'apoya', 'Más gente usaría taxi para salir de noche', ['Si cobran estacionamiento a la noche, más gente se toma un taxi. Bienvenido.', 'Y encima hay menos autos en doble fila, es un caos esa zona.']],
  'madre-barrio-popular': [0, 'indiferente', 'No tiene relación con la medida', ['No tenemos auto, eso es de otro mundo para nosotros.', 'Que pongan esa plata en el barrio.']],
  'empresario': [1, 'apoya', 'Ordena el espacio y desalienta cuidacoches', ['Es una forma de ordenar y terminar con los trapitos. Lo apoyo.', 'Bien hecho, mientras se fiscalice.']],
  'enfermera': [-1, 'se_queja', 'Trabaja de noche cerca y a veces va en auto', ['Cuando entro de guardia a la noche a veces voy en auto. ¿Tengo que pagar también?', 'Pensaron en los bares, no en los que trabajamos.']],
}

const PICHINCHA_AJUSTE: Tabla = {
  ...PICHINCHA,
  'jubilado-clase-media': [1, 'apoya', 'Permiso gratuito para residentes', ['Con permiso para los vecinos, está perfecto. Que paguen los que vienen de afuera.', 'Así sí. Pensaron en el que vive acá.']],
  'estudiante-unr': [0, 'indiferente', 'Sin tarifa nocturna, le molesta menos', ['Sin cobrar a la madrugada, ya fue, me da igual.', 'Bueno, menos recaudatorio que antes.']],
  'profesional-joven': [1, 'apoya', 'Queda exenta como residente', ['Con permiso de residente me parece bárbaro. Ordena un montón.', 'Y si la plata va a seguridad, mejor todavía.']],
  'familia-media-norte': [0, 'indiferente', 'Sin cobro nocturno, sale igual a cenar', ['Si a la noche no cobran, seguimos saliendo igual.', 'Así se puede.']],
  'enfermera': [0, 'indiferente', 'Sin cobro nocturno no la afecta', ['Si es hasta las 20, a la noche no pago. Está bien.', 'Más seguridad a la noche me viene bien para salir de la guardia.']],
}

const ANALISIS: Record<string, Analisis> = {
  boleto: {
    resumen: 'El aumento del 30% genera un rechazo amplio y concentrado en los sectores de menores ingresos que dependen del colectivo.\nEl apoyo se limita a segmentos de ingresos altos o que no usan el sistema, lo que anticipa un conflicto en los distritos Oeste, Sudoeste y Sur.',
    ganadores: [
      { segmento: 'Empresarios y profesionales de ingresos altos', motivo: 'Valoran la sostenibilidad del sistema y casi no lo usan.' },
      { segmento: 'Taxistas', motivo: 'Esperan captar viajes cortos que hoy se hacen en colectivo.' },
    ],
    perdedores: [
      { segmento: 'Jubilados de la mínima que viajan en colectivo', motivo: 'El aumento recorta directamente sus salidas y visitas familiares.' },
      { segmento: 'Trabajadores informales y empleadas domésticas de la periferia', motivo: 'Viajes largos, varios boletos por día y sin compensación salarial.' },
      { segmento: 'Docentes y personal de salud', motivo: 'Combinan varios trayectos diarios y turnos nocturnos.' },
    ],
    quejas: [
      { queja: 'El aumento es desproporcionado frente a los ingresos', porcentaje: 46 },
      { queja: 'El servicio no mejora (frecuencias, unidades)', porcentaje: 22 },
      { queja: 'Pagan más quienes viven más lejos', porcentaje: 18 },
      { queja: 'No hay compensación para trabajadores que dependen del colectivo', porcentaje: 14 },
    ],
    propuesta: {
      titulo: 'Aumento escalonado con tarifa social focalizada',
      medidaAjustada: 'Subimos el boleto de colectivo un 15% ahora y otro 15% en seis meses, con boleto gratuito para jubilados de la mínima y una tarifa social del 50% para estudiantes y trabajadores de bajos ingresos.',
      justificacion: 'Mantiene el objetivo de recaudación a mediano plazo, amortigua el impacto inmediato y protege a los segmentos con mayor rechazo.',
    },
    testimonioIds: [],
  },
  'peatonal-cordoba': {
    resumen: 'La extensión de la peatonal divide a la ciudad: es bien recibida por quienes caminan o viven en el Centro, pero genera fuerte resistencia en comerciantes, taxistas y repartidores.\nFuera del Centro predomina la indiferencia y la percepción de que no es una prioridad.',
    ganadores: [
      { segmento: 'Profesionales jóvenes y estudiantes del Centro', motivo: 'Ganan espacio público y movilidad a pie o en bici.' },
      { segmento: 'Jubilados que pasean por el centro', motivo: 'Caminan con más tranquilidad y seguridad.' },
    ],
    perdedores: [
      { segmento: 'Comerciantes del tramo afectado', motivo: 'Temen perder clientes en auto y no poder descargar mercadería.' },
      { segmento: 'Taxistas y repartidores', motivo: 'Pierden una vía clave y suman recorrido.' },
      { segmento: 'Usuarios de colectivo de la periferia', motivo: 'Temen desvíos de líneas y caminatas más largas.' },
    ],
    quejas: [
      { queja: 'Falta de carga y descarga para comercios', porcentaje: 24 },
      { queja: 'Más congestión en calles paralelas', porcentaje: 21 },
      { queja: 'No es una prioridad para los barrios', porcentaje: 19 },
      { queja: 'Desvío de colectivos', porcentaje: 12 },
    ],
    propuesta: {
      titulo: 'Peatonalización en etapas con ventana logística',
      medidaAjustada: 'Peatonalizamos Córdoba entre Plaza San Martín y Bv. Oroño en etapas: tres meses de prueba como semipeatonal, con carga y descarga de 6 a 10, prioridad para colectivos en las calles paralelas y evaluación conjunta con comerciantes.',
      justificacion: 'Reduce el impacto sobre comercio y logística, y convierte una decisión abrupta en una prueba medible.',
    },
    testimonioIds: [],
  },
  'estacionamiento-pichincha': {
    resumen: 'El estacionamiento medido en Pichincha es mayormente indiferente para la ciudad, pero genera rechazo concentrado en residentes y en quienes salen de noche.\nEl cobro hasta las 3 de la mañana se percibe como recaudatorio; el orden y la rotación son valorados por comerciantes y taxistas.',
    ganadores: [
      { segmento: 'Comerciantes y gastronómicos', motivo: 'Mayor rotación de autos y clientes que encuentran lugar.' },
      { segmento: 'Taxistas', motivo: 'Más demanda nocturna de viajes.' },
    ],
    perdedores: [
      { segmento: 'Residentes de Pichincha con auto', motivo: 'Pagarían por estacionar frente a su casa.' },
      { segmento: 'Jóvenes y familias que salen de noche', motivo: 'Suma un costo a la salida nocturna.' },
      { segmento: 'Trabajadores nocturnos de la zona', motivo: 'Pagan durante sus turnos.' },
    ],
    quejas: [
      { queja: 'Cobro nocturno percibido como recaudatorio', porcentaje: 18 },
      { queja: 'Los residentes no deberían pagar', porcentaje: 14 },
      { queja: 'Encarece las salidas', porcentaje: 10 },
    ],
    propuesta: {
      titulo: 'Medido diurno con permiso para residentes',
      medidaAjustada: 'Implementamos estacionamiento medido en Pichincha de lunes a sábado de 9 a 20, con permiso gratuito para residentes y destinando lo recaudado a seguridad y limpieza del barrio.',
      justificacion: 'Conserva la rotación diurna, elimina el principal foco de rechazo (residentes y cobro nocturno) y le da un destino visible a la recaudación.',
    },
    testimonioIds: [],
  },
}

const TABLAS: Record<string, [Tabla, Tabla]> = {
  boleto: [BOLETO, BOLETO_AJUSTE],
  'peatonal-cordoba': [PEATONAL, PEATONAL_AJUSTE],
  'estacionamiento-pichincha': [PICHINCHA, PICHINCHA_AJUSTE],
}

function rng(semilla: number) {
  let a = semilla
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function responder(tabla: Tabla, semilla: number): Respuesta[] {
  const r = rng(semilla)
  return generarPoblacion().map((c) => {
    const [base, accion, motivo, citas] = tabla[c.arquetipoId]
    let postura = base
    const azar = r()
    if (azar < 0.15) postura -= 1
    else if (azar > 0.87) postura += 1
    if (c.rasgo.includes('desconfiado') && postura > 0) postura -= 1
    postura = Math.max(-2, Math.min(2, postura))
    return {
      id: c.id,
      postura,
      afectacion: postura > 0 ? 'positiva' : postura < 0 ? 'negativa' : 'neutral',
      accion: postura > 0 ? 'apoya' : postura === 0 && accion !== 'cambia_habitos' ? 'indiferente' : accion === 'apoya' ? 'se_queja' : accion,
      motivo,
      cita: citas[r() < 0.5 ? 0 : 1],
    }
  })
}

function elegirTestimonios(respuestas: Respuesta[]) {
  const poblacion = new Map(generarPoblacion().map((c) => [c.id, c]))
  const elegidos: string[] = []
  const distritos = new Set<string>()
  const arquetipos = new Set<string>()
  for (const objetivo of [-2, 2, -1, 1, 0, -2]) {
    const r = respuestas.find((x) => {
      const c = poblacion.get(x.id)!
      return x.postura === objetivo && !distritos.has(c.distrito) && !arquetipos.has(c.arquetipoId) && !elegidos.includes(x.id)
    })
    if (r) {
      const c = poblacion.get(r.id)!
      elegidos.push(r.id)
      distritos.add(c.distrito)
      arquetipos.add(c.arquetipoId)
    }
  }
  return elegidos
}

const destino = join(process.cwd(), 'data', 'casos')
mkdirSync(destino, { recursive: true })

EJEMPLOS.forEach((ejemplo, i) => {
  const [tabla, tablaAjuste] = TABLAS[ejemplo.id]
  const respuestas = responder(tabla, 100 + i)
  const analisis = { ...ANALISIS[ejemplo.id], testimonioIds: elegirTestimonios(respuestas) }
  const caso: CasoPrecargado = {
    id: ejemplo.id,
    titulo: ejemplo.titulo,
    medida: ejemplo.medida,
    fuente: 'heuristica',
    respuestas,
    analisis,
    ajuste: { medida: analisis.propuesta.medidaAjustada, respuestas: responder(tablaAjuste, 200 + i) },
  }
  writeFileSync(join(destino, `${ejemplo.id}.json`), JSON.stringify(caso, null, 1))
  console.log(`✓ ${ejemplo.id}.json (heurístico)`)
})
