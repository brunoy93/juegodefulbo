/* =========================================================
   LEYENDA · V2 "VIDA DE CARRERA" — datos de inmersión
   ========================================================= */
(function (global) {
  'use strict';

  const CLIMAS = [
    { id: 'sol', n: 'Soleado', icon: '☀️', desc: 'Condiciones ideales. La pelota corre limpia.', precision: 1, error: 1, fatiga: 1, cards: 1 },
    { id: 'nublado', n: 'Nublado', icon: '☁️', desc: 'Tarde gris, cancha perfecta.', precision: 1, error: 1, fatiga: 1, cards: 1 },
    { id: 'lluvia', n: 'Lluvia', icon: '🌧️', desc: 'Cancha rápida y resbaladiza. Más errores y más piernas cansadas.', precision: 0.93, error: 1.08, fatiga: 1.06, cards: 1.05 },
    { id: 'nieve', n: 'Nieve', icon: '❄️', desc: 'Frío extremo. La pelota no corre y cada duelo pesa doble.', precision: 0.88, error: 1.16, fatiga: 1.12, cards: 1.0 },
    { id: 'calor', n: 'Calor', icon: '🔥', desc: 'Treinta grados. El físico se paga en el segundo tiempo.', precision: 0.97, error: 1.02, fatiga: 1.2, cards: 0.95 },
    { id: 'viento', n: 'Viento', icon: '🌬️', desc: 'Ráfagas fuertes. Los centros y los tiros largos sufren.', precision: 0.91, error: 1.05, fatiga: 1.03, cards: 1 }
  ];
  const CLIMA_ADJ = { sol: 'soleada', nublado: 'nublada', lluvia: 'lluviosa', nieve: 'nevada', calor: 'calurosa', viento: 'ventosa' };
  const CLIMA_PESO = {
    ing: { sol: 18, nublado: 28, lluvia: 30, nieve: 4, calor: 5, viento: 15 },
    esp: { sol: 38, nublado: 28, lluvia: 18, nieve: 1, calor: 12, viento: 3 },
    ita: { sol: 30, nublado: 30, lluvia: 24, nieve: 4, calor: 9, viento: 3 },
    ale: { sol: 14, nublado: 28, lluvia: 28, nieve: 14, calor: 4, viento: 12 },
    fra: { sol: 26, nublado: 30, lluvia: 24, nieve: 3, calor: 7, viento: 10 },
    arg: { sol: 38, nublado: 24, lluvia: 20, nieve: 1, calor: 12, viento: 5 }
  };

  const ARBITROS = [
    { id: 'rapallini', n: 'Rapallini', estilo: 'estricto', rigor: 1.32, desc: 'Cobra todo. Las amarillas vuelan.' },
    { id: 'tello', n: 'Tello', estilo: 'equilibrado', rigor: 1.0, desc: 'Deja jugar y cobra lo justo.' },
    { id: 'herrera', n: 'Herrera', estilo: 'permisivo', rigor: 0.76, desc: 'Prefiere el diálogo a la tarjeta.' },
    { id: 'mastrangelo', n: 'Mastrángelo', estilo: 'estricto', rigor: 1.22, desc: 'No se casa con nadie.' },
    { id: 'falcon', n: 'Falcón Pérez', estilo: 'equilibrado', rigor: 0.96, desc: 'Partidos largos y pocas polémicas.' },
    { id: 'loustau', n: 'Loustau', estilo: 'permisivo', rigor: 0.82, desc: 'Le gusta el fútbol de contacto.' },
    { id: 'taylor', n: 'Taylor', estilo: 'estricto', rigor: 1.25, desc: 'Internacional, de línea dura.' },
    { id: 'marciniak', n: 'Marciniak', estilo: 'equilibrado', rigor: 1.02, desc: 'Experiencia en finales.' },
    { id: 'orsato', n: 'Orsato', estilo: 'permisivo', rigor: 0.8, desc: 'El juego primero.' },
    { id: 'turpin', n: 'Turpin', estilo: 'equilibrado', rigor: 0.98, desc: 'Mano firme y diálogo.' }
  ];

  const DERBIS = [
    { a: 'BOC', b: 'RIV', n: 'Superclásico', int: 1.3 },
    { a: 'RAC', b: 'IND', n: 'Clásico de Avellaneda', int: 1.2 },
    { a: 'SLO', b: 'HUR', n: 'Clásico de barrio', int: 1.12 },
    { a: 'CEN', b: 'NOB', n: 'Clásico rosarino', int: 1.2 },
    { a: 'RMA', b: 'BAR', n: 'El Clásico', int: 1.3 },
    { a: 'ATM', b: 'RMA', n: 'Derbi madrileño', int: 1.2 },
    { a: 'MIL', b: 'INT', n: 'Derbi della Madonnina', int: 1.25 },
    { a: 'ROM', b: 'LAZ', n: 'Derbi romano', int: 1.22 },
    { a: 'JUV', b: 'TOR', n: 'Derbi de Turín', int: 1.15 },
    { a: 'MCI', b: 'MUN', n: 'Derbi de Manchester', int: 1.25 },
    { a: 'LIV', b: 'EVE', n: 'Merseyside', int: 1.2 },
    { a: 'ARS', b: 'TOT', n: 'North London', int: 1.2 },
    { a: 'PSG', b: 'OM', n: 'Le Classique', int: 1.2 },
    { a: 'BAY', b: 'BVB', n: 'Der Klassiker', int: 1.2 },
    { a: 'SEV', b: 'BET', n: 'Derbi sevillano', int: 1.18 },
    { a: 'ATA', b: 'MIL', n: 'Derbi lombardo', int: 1.12 }
  ];

  const AGENTES = [
    { id: 'primo', n: 'El Primo', icon: '🧢', fee: 0, desc: 'Tu primo del barrio. Sin contactos, pero te cuida.', ofertas: 0, salario: 0, negociacion: 0 },
    { id: 'representante', n: 'Representante de barrio', icon: '📱', fee: 120, desc: 'Mueve el mercado local y consigue mejores contratos.', ofertas: 1, salario: 0.05, negociacion: 0.10 },
    { id: 'super', n: 'Superagente', icon: '🕴️', fee: 600, desc: 'Llama a los grandes de Europa. Negocia como nadie.', ofertas: 2, salario: 0.12, negociacion: 0.22 }
  ];

  const PRENSA = [
    {
      id: 'v1', cond: ['victoria'], q: '¿Fue el partido que esperaban?',
      ops: [
        { t: 'Trabajamos como equipo. El mérito es del grupo.', e: { fan: 2, dt: 2, rep: 1, moral: 1 }, tono: 'humilde' },
        { t: 'Sabíamos que podíamos ganar. Somos los mejores.', e: { fan: 3, dt: -1, rep: 2, moral: 1 }, tono: 'soberbio' },
        { t: 'Importa mi actuación. El resto viene solo.', e: { fan: -3, dt: -2, rep: 0, moral: -1 }, tono: 'egoista' }
      ]
    },
    {
      id: 'v2', cond: ['victoria'], q: '¿Te sentís el líder de este equipo?',
      ops: [
        { t: 'Hay muchos líderes en el vestuario. Yo aporto desde mi lugar.', e: { fan: 1, dt: 2, rep: 1, moral: 1 }, tono: 'humilde' },
        { t: 'Cuando las cosas se complican, la pelota me busca.', e: { fan: 3, dt: 0, rep: 2, moral: 1 }, tono: 'ambicioso' },
        { t: 'El equipo no está a mi altura.', e: { fan: -4, dt: -3, rep: 1, moral: -2 }, tono: 'egoista' }
      ]
    },
    {
      id: 'v3', cond: ['goleada', 'victoria'], q: '¿Hay un mensaje para los rivales?',
      ops: [
        { t: 'Respeto a todos. Ganamos porque hicimos las cosas bien.', e: { fan: 2, dt: 2, rep: 1, moral: 0 }, tono: 'humilde' },
        { t: 'Que se preparen. Este equipo va por todo.', e: { fan: 4, dt: 0, rep: 2, moral: 1 }, tono: 'ambicioso' },
        { t: 'No me interesa lo que digan los demás.', e: { fan: -1, dt: -1, rep: 0, moral: 0 }, tono: 'evasivo' }
      ]
    },
    {
      id: 'v4', cond: ['derrota'], q: '¿Qué faltó para quedarse con el partido?',
      ops: [
        { t: 'Nos faltó contundencia. El esfuerzo estuvo.', e: { fan: 1, dt: 2, rep: 0, moral: 0 }, tono: 'sincero' },
        { t: 'El árbitro nos condicionó.', e: { fan: 2, dt: -2, rep: 1, moral: -1 }, tono: 'polemico' },
        { t: 'Yo no estuve a la altura. Asumo la responsabilidad.', e: { fan: 2, dt: 2, rep: 1, moral: -1 }, tono: 'humilde' }
      ]
    },
    {
      id: 'v5', cond: ['derrota'], q: '¿Está en riesgo tu lugar en el equipo?',
      ops: [
        { t: 'Entreno todos los días para jugar. La decisión es del técnico.', e: { fan: 1, dt: 2, rep: 0, moral: 1 }, tono: 'profesional' },
        { t: 'Merezco jugar. No lo dudo.', e: { fan: 2, dt: -2, rep: 1, moral: 1 }, tono: 'ambicioso' },
        { t: 'Si no juego, capaz que es mejor cambiar de aire.', e: { fan: -3, dt: -3, rep: 1, moral: -2 }, tono: 'polemico' }
      ]
    },
    {
      id: 'e1', cond: ['empate'], q: '¿Se escaparon dos puntos?',
      ops: [
        { t: 'El empate es justo. Seguimos sumando.', e: { fan: 1, dt: 1, rep: 0, moral: 1 }, tono: 'tranquilo' },
        { t: 'Teníamos que ganar. No me alcanza con empatar.', e: { fan: 2, dt: 1, rep: 1, moral: 0 }, tono: 'ambicioso' },
        { t: 'El equipo se conformó. Eso no me gusta.', e: { fan: 1, dt: -2, rep: 1, moral: -1 }, tono: 'polemico' }
      ]
    },
    {
      id: 'm1', cond: ['mvp'], q: '¿Cómo se siente ser la figura del partido?',
      ops: [
        { t: 'El mérito es de todos. Yo solo terminé las jugadas.', e: { fan: 2, dt: 2, rep: 1, moral: 1 }, tono: 'humilde' },
        { t: 'Estoy en un momento único. Que disfruten.', e: { fan: 3, dt: 0, rep: 2, moral: 2 }, tono: 'ambicioso' },
        { t: 'Ya era hora de que se dieran cuenta.', e: { fan: -1, dt: -2, rep: 1, moral: 0 }, tono: 'soberbio' }
      ]
    },
    {
      id: 'p1', cond: ['malpartido'], q: '¿Te preocupa tu rendimiento?',
      ops: [
        { t: 'Sí. No estoy conforme. Voy a trabajar el doble.', e: { fan: 1, dt: 3, rep: 0, moral: 0 }, tono: 'sincero' },
        { t: 'Son rachas. La calidad no se discute.', e: { fan: 0, dt: -1, rep: 0, moral: 1 }, tono: 'evasivo' },
        { t: 'El problema es cómo juega el equipo.', e: { fan: -2, dt: -2, rep: 0, moral: -1 }, tono: 'polemico' }
      ]
    },
    {
      id: 'b1', cond: ['banco'], q: '¿Por qué no tuviste minutos?',
      ops: [
        { t: 'Respeto la decisión. Voy a seguir empujando desde afuera.', e: { fan: 1, dt: 2, rep: 0, moral: 1 }, tono: 'profesional' },
        { t: 'No comparto. Estoy para jugar.', e: { fan: 2, dt: -2, rep: 1, moral: 1 }, tono: 'ambicioso' },
        { t: 'Si no juego, voy a buscar minutos en otro lado.', e: { fan: -2, dt: -3, rep: 2, moral: -1 }, tono: 'polemico' }
      ]
    },
    {
      id: 'd1', cond: ['derbi', 'victoria'], q: '¿Se puede pedir más que ganar el clásico?',
      ops: [
        { t: 'Ganar el clásico es para la gente. Se lo dedicamos.', e: { fan: 5, dt: 2, rep: 2, moral: 2 }, tono: 'humilde' },
        { t: 'Faltó golearlos. Pero lo vamos a hacer la próxima.', e: { fan: 4, dt: 0, rep: 2, moral: 1 }, tono: 'ambicioso' },
        { t: 'Es un partido más. No me cambia la vida.', e: { fan: -5, dt: -1, rep: 0, moral: -1 }, tono: 'evasivo' }
      ]
    },
    {
      id: 'd2', cond: ['derbi', 'derrota'], q: '¿Duele más perder un clásico?',
      ops: [
        { t: 'Duele el doble. Le pedimos disculpas a la gente.', e: { fan: 3, dt: 2, rep: 1, moral: 0 }, tono: 'sincero' },
        { t: 'Duele, pero la temporada es larga. Vamos a levantarnos.', e: { fan: 1, dt: 1, rep: 0, moral: 1 }, tono: 'profesional' },
        { t: 'El árbitro nos robó. No fue un partido normal.', e: { fan: 2, dt: -2, rep: 1, moral: -1 }, tono: 'polemico' }
      ]
    },
    {
      id: 't1', cond: ['transfer'], q: '¿Te ves jugando en otro club?',
      ops: [
        { t: 'Estoy feliz acá. Mi cabeza está en este club.', e: { fan: 3, dt: 2, rep: 0, moral: 1 }, tono: 'profesional' },
        { t: 'Todo jugador quiere competir al máximo. Ya veremos.', e: { fan: 0, dt: -1, rep: 2, moral: 1 }, tono: 'ambicioso' },
        { t: 'Sí. Necesito un proyecto más grande.', e: { fan: -4, dt: -3, rep: 2, moral: 0 }, tono: 'polemico' }
      ]
    },
    {
      id: 't2', cond: ['transfer', 'premio'], q: 'Los grandes preguntan por vos. ¿Cómo lo tomás?',
      ops: [
        { t: 'Es lindo, pero no me distrae. Entreno para este club.', e: { fan: 2, dt: 2, rep: 1, moral: 1 }, tono: 'profesional' },
        { t: 'Me encantaría jugar la Champions algún día.', e: { fan: 1, dt: 0, rep: 2, moral: 1 }, tono: 'ambicioso' },
        { t: 'Si llega una oferta, quiero irme ya.', e: { fan: -4, dt: -2, rep: 2, moral: -1 }, tono: 'polemico' }
      ]
    },
    {
      id: 'pr1', cond: ['premio'], q: '¿A quién le dedicás este premio?',
      ops: [
        { t: 'A mi familia y a la gente que estuvo desde el primer día.', e: { fan: 3, dt: 1, rep: 1, moral: 2 }, tono: 'humilde' },
        { t: 'A mí. Nadie sabe lo que trabajé para esto.', e: { fan: -1, dt: -1, rep: 1, moral: 1 }, tono: 'egoista' },
        { t: 'A mis compañeros. Sin ellos no existiría.', e: { fan: 2, dt: 2, rep: 1, moral: 1 }, tono: 'humilde' }
      ]
    },
    {
      id: 'l1', cond: ['lesion'], q: '¿Cómo estás de la lesión?',
      ops: [
        { t: 'Trabajando para volver más fuerte. No hay atajos.', e: { fan: 2, dt: 2, rep: 0, moral: 1 }, tono: 'profesional' },
        { t: 'Es duro, pero lo estoy llevando bien.', e: { fan: 1, dt: 1, rep: 0, moral: 0 }, tono: 'sincero' },
        { t: 'El cuerpo médico no me está ayudando.', e: { fan: -1, dt: -2, rep: 1, moral: -1 }, tono: 'polemico' }
      ]
    },
    {
      id: 'g1', cond: ['siempre'], q: '¿Cuál es el objetivo de este equipo?',
      ops: [
        { t: 'Crecer partido a partido. No prometemos lo que no podemos.', e: { fan: 1, dt: 2, rep: 0, moral: 1 }, tono: 'tranquilo' },
        { t: 'Ganar todo. No estamos para participar.', e: { fan: 3, dt: 0, rep: 1, moral: 1 }, tono: 'ambicioso' },
        { t: 'Depende de lo que haga el club en el mercado.', e: { fan: -1, dt: -2, rep: 0, moral: 0 }, tono: 'evasivo' }
      ]
    },
    {
      id: 'g2', cond: ['siempre'], q: '¿Cómo es tu relación con el entrenador?',
      ops: [
        { t: 'Es honesta. Me exige y me ayuda a crecer.', e: { fan: 1, dt: 3, rep: 0, moral: 1 }, tono: 'profesional' },
        { t: 'Hablamos poco, pero respeto su trabajo.', e: { fan: 0, dt: 1, rep: 0, moral: 0 }, tono: 'sincero' },
        { t: 'Tenemos diferencias. No siempre coincidimos.', e: { fan: 0, dt: -3, rep: 1, moral: -1 }, tono: 'polemico' }
      ]
    },
    {
      id: 'g3', cond: ['siempre'], q: '¿Qué le decís a la gente que te bancó en las malas?',
      ops: [
        { t: 'Gracias por no soltarme. Esto es de ellos.', e: { fan: 4, dt: 1, rep: 1, moral: 1 }, tono: 'humilde' },
        { t: 'Nos vemos en la cancha. Vamos a dar vuelta esto.', e: { fan: 3, dt: 0, rep: 0, moral: 1 }, tono: 'ambicioso' },
        { t: 'No leo redes sociales. No me afecta.', e: { fan: -2, dt: 0, rep: 0, moral: 0 }, tono: 'evasivo' }
      ]
    },
    {
      id: 'g4', cond: ['siempre'], q: '¿Te pesa la responsabilidad de ser el jugador más caro?',
      ops: [
        { t: 'Es un orgullo. Trabajo para devolver esa confianza.', e: { fan: 2, dt: 2, rep: 1, moral: 1 }, tono: 'profesional' },
        { t: 'No me importa el precio. Me importa ganar.', e: { fan: 2, dt: 1, rep: 1, moral: 1 }, tono: 'tranquilo' },
        { t: 'La presión es del club, no mía.', e: { fan: -2, dt: -1, rep: 0, moral: 0 }, tono: 'evasivo' }
      ]
    }
  ];

  const PERIODICO = {
    victoria: [
      { titular: '{{club}} no se detiene: {{gf}}-{{gc}} y la gente sueña', copete: '{{jugador}} fue clave en la victoria ante {{rival}}.', cuerpo: 'En una tarde {{clima}}, {{club}} se impuso {{gf}}-{{gc}} a {{rival}} y sigue prendido en la pelea. {{jugador}} fue de lo mejor con {{golesTxt}} y una actuación de {{nota}}. El árbitro {{arbitro}} tuvo un partido de perfil {{estiloArbitro}}.' },
      { titular: 'La figura de {{jugador}} ilumina el triunfo de {{club}}', copete: 'El equipo ganó {{gf}}-{{gc}} y el vestuario lo señala como bandera.', cuerpo: '{{club}} venció {{gf}}-{{gc}} a {{rival}} con una actuación consagratoria de {{jugador}}. La gente lo despidió de pie y ya lo compara con los grandes ídolos de la institución.' },
      { titular: '{{club}} respira: {{gf}}-{{gc}} para volver a creer', copete: 'Tres puntos, buen juego y una tarde ideal.', cuerpo: 'El conjunto de {{club}} encontró en {{jugador}} a su mejor argumento para superar a {{rival}} por {{gf}}-{{gc}}. La tarde {{clima}} no impidió un partido abierto y con emociones.' }
    ],
    derrota: [
      { titular: 'Golpe duro: {{club}} cayó {{gf}}-{{gc}} con {{rival}}', copete: 'El equipo no encontró respuestas y la gente se fue con bronca.', cuerpo: '{{club}} perdió {{gf}}-{{gc}} ante {{rival}} en un partido incómodo. {{jugador}} no pudo cambiar la historia y el vestuario dejó el estadio en silencio. El árbitro {{arbitro}} cobró un partido {{estiloArbitro}}.' },
      { titular: 'La noche negra de {{club}}: derrota y dudas', copete: '{{rival}} fue más y se llevó los tres puntos.', cuerpo: 'No hubo reacción. {{club}} cayó {{gf}}-{{gc}} frente a {{rival}} y acumuló otra actuación irregular. La nota de {{jugador}} ({{nota}}) no alcanzó para sostener al equipo.' }
    ],
    empate: [
      { titular: '{{club}} y {{rival}} repartieron puntos en un {{gf}}-{{gc}} con sabor a poco', copete: '{{jugador}} tuvo sus chances, pero faltó puntería.', cuerpo: 'El empate {{gf}}-{{gc}} dejó sensaciones encontradas en {{club}}. El equipo generó, pero no pudo quebrar a {{rival}}. La tarde {{clima}} y el arbitraje de {{arbitro}} fueron protagonistas.' }
    ],
    goleada: [
      { titular: 'Festival de {{club}}: {{gf}}-{{gc}} y show de {{jugador}}', copete: 'Una goleada que quedará en la memoria de la gente.', cuerpo: '{{club}} aplastó {{gf}}-{{gc}} a {{rival}} con una actuación de alto vuelo. {{jugador}} firmó una de sus mejores noches y el estadio terminó cantando con el equipo.' }
    ],
    derbi: [
      { titular: '{{club}} se quedó con el {{nombreDerbi}}: {{gf}}-{{gc}}', copete: 'El clásico fue una batalla y {{jugador}} la rompió.', cuerpo: 'En un {{nombreDerbi}} cargado de nervios, {{club}} venció {{gf}}-{{gc}} a {{rival}}. El partido tuvo de todo: pierna fuerte, una tarde {{clima}} y un árbitro {{estiloArbitro}}. La gente explotó con el gol de {{jugador}}.' }
    ],
    premio: [
      { titular: '{{jugador}}, elegido entre los mejores del mundo', copete: 'Un reconocimiento que confirma su gran presente.', cuerpo: 'El futbolista de {{club}} sumó otro premio a su carrera. La distinción llega después de una temporada enorme y lo pone en la conversación de los grandes.' }
    ],
    transfer: [
      { titular: '{{jugador}}, en el centro de todos los rumores', copete: 'Los grandes de Europa preguntan por él.', cuerpo: 'El futuro de {{jugador}} volvió a ser tema de mercado. Desde {{club}} no quieren venderlo, pero las ofertas empiezan a llegar. El jugador mantiene la calma.' }
    ]
  };

  const REDES = [
    { tipo: 'fan', handle: 'hincha_{{clubcorto}}', nombre: 'Hincha de siempre', texto: '{{jugador}} es todo lo que está bien. Denle la 10 y la cinta.', cond: ['victoria', 'mvp'] },
    { tipo: 'fan', handle: 'la_banda_{{clubcorto}}', nombre: 'La Banda', texto: 'Hoy se juega como en el barrio: con el cuchillo entre los dientes. VAMOS {{club}}.', cond: ['siempre'] },
    { tipo: 'fan', handle: 'viejo_tribuna', nombre: 'El viejo de la tribuna', texto: 'Hacía años que no veía a alguien así con la pelota. Este pibe es distinto.', cond: ['mvp', 'victoria'] },
    { tipo: 'fan', handle: 'critico_{{clubcorto}}', nombre: 'El crítico', texto: '{{jugador}} tiene calidad, pero le falta regularidad. Un partido no alcanza.', cond: ['derrota', 'empate'] },
    { tipo: 'fan', handle: 'corazon_{{clubcorto}}', nombre: 'Corazón de club', texto: 'Se perdió, pero dejaron todo. El domingo los quiero a todos en la cancha.', cond: ['derrota'] },
    { tipo: 'fan', handle: 'futbolero_ok', nombre: 'Futbolero', texto: 'El {{nombreDerbi}} es otra cosa. Esto no se explica, se siente.', cond: ['derbi'] },
    { tipo: 'prensa', handle: '{{periodistaHandle}}', nombre: '{{periodista}}', texto: 'Fuentes: {{club}} evalúa una oferta importante por {{jugador}}. En las próximas horas puede haber novedades.', cond: ['transfer'] },
    { tipo: 'prensa', handle: 'mesa_deportiva', nombre: 'Mesa Deportiva', texto: 'Lo de {{jugador}} no es casualidad: es el jugador más determinante del campeonato.', cond: ['mvp', 'victoria'] },
    { tipo: 'prensa', handle: 'el_ojo_del_scout', nombre: 'El Ojo del Scout', texto: '{{jugador}} tiene un techo enorme. Si sigue así, Europa lo va a buscar.', cond: ['siempre'] },
    { tipo: 'club', handle: '{{clubcorto}}oficial', nombre: '{{club}}', texto: '¡Vamos, equipo! {{gf}}-{{gc}} y tres puntos importantísimos. La gente fue el jugador número 12.', cond: ['victoria'] },
    { tipo: 'club', handle: '{{clubcorto}}oficial', nombre: '{{club}}', texto: 'No fue nuestra noche. A trabajar y levantar la cabeza. Esto sigue.', cond: ['derrota'] },
    { tipo: 'club', handle: '{{clubcorto}}oficial', nombre: '{{club}}', texto: 'Empate y a seguir. El equipo dejó todo en la cancha. Vamos por más.', cond: ['empate'] },
    { tipo: 'fan', handle: 'hincha_{{clubcorto}}', nombre: 'Hincha de siempre', texto: 'Un punto con sabor a poco, pero banco a muerte. Vamos {{club}}.', cond: ['empate'] },
    { tipo: 'prensa', handle: 'mesa_deportiva', nombre: 'Mesa Deportiva', texto: '{{club}} y {{rival}} no se sacaron ventajas. Partido trabado y poco fútbol.', cond: ['empate'] },
    { tipo: 'rival', handle: '{{rivalcorto}}oficial', nombre: '{{rival}}', texto: 'Se gana, se pierde y se sigue. Gracias a nuestra gente por el aguante.', cond: ['derbi', 'victoria'] },
    { tipo: 'rival', handle: 'hincha_{{rivalcorto}}', nombre: 'Hincha rival', texto: 'Suerte la próxima. Hoy la pelota fue de ustedes.', cond: ['derbi', 'derrota'] },
    { tipo: 'fan', handle: 'mercadode_pases', nombre: 'Mercado de Pases', texto: '{{jugador}} sigue siendo el nombre más buscado del mercado. Su representante ya trabaja.', cond: ['transfer'] },
    { tipo: 'fan', handle: 'seleccion_arg', nombre: 'Selección', texto: 'Ojo con {{jugador}} para la próxima convocatoria. Está para dar el salto.', cond: ['mvp'] }
  ];

  const PERIODISTAS = [
    { n: 'Román Aguirre', h: 'romanaguirre' },
    { n: 'Carla Méndez', h: 'carlamendez' },
    { n: 'Diego Barrionuevo', h: 'dbarrionuevo' },
    { n: 'Lucía Ferrer', h: 'luciaferrer' },
    { n: 'Marcos Salas', h: 'msalas' }
  ];

  const RECORDS = [
    { id: 'golesTemporada', n: 'Goles en una temporada', icon: '⚽' },
    { id: 'asistenciasTemporada', n: 'Asistencias en una temporada', icon: '🅰️' },
    { id: 'notaTemporada', n: 'Mejor nota media', icon: '⭐' },
    { id: 'golesCarrera', n: 'Goles en carrera', icon: '🎯' },
    { id: 'partidosCarrera', n: 'Partidos jugados', icon: '🏟️' },
    { id: 'mvpCarrera', n: 'Figuras del partido', icon: '🥇' },
    { id: 'titulos', n: 'Títulos ganados', icon: '🏆' }
  ];

  global.VIDA = { CLIMAS, CLIMA_ADJ, CLIMA_PESO, ARBITROS, DERBIS, AGENTES, PRENSA, PERIODICO, REDES, PERIODISTAS, RECORDS };
})(typeof window !== 'undefined' ? window : globalThis);
