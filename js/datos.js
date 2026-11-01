/* =========================================================
   LEYENDA · datos del mundo
   ========================================================= */
(function (global) {
  'use strict';

  /* ---------------- atributos ---------------- */
  const ATRIBUTOS = {
    ritmo:          { n: 'Ritmo',            ab: 'RIT', cat: 'fisico' },
    aceleracion:    { n: 'Aceleración',      ab: 'ACE', cat: 'fisico' },
    resistencia:    { n: 'Resistencia',      ab: 'RES', cat: 'fisico' },
    fuerza:         { n: 'Fuerza',           ab: 'FUE', cat: 'fisico' },
    salto:          { n: 'Salto',            ab: 'SAL', cat: 'fisico' },
    agilidad:       { n: 'Agilidad',         ab: 'AGI', cat: 'fisico' },
    tecnica:        { n: 'Técnica',          ab: 'TEC', cat: 'tecnico' },
    control:        { n: 'Control',          ab: 'CTR', cat: 'tecnico' },
    regate:         { n: 'Regate',           ab: 'REG', cat: 'tecnico' },
    paseCorto:      { n: 'Pase corto',       ab: 'PCO', cat: 'tecnico' },
    paseLargo:      { n: 'Pase largo',       ab: 'PLA', cat: 'tecnico' },
    definicion:     { n: 'Definición',       ab: 'DEF', cat: 'tecnico' },
    tiroLejano:     { n: 'Tiro lejano',      ab: 'TLE', cat: 'tecnico' },
    penales:        { n: 'Penales',          ab: 'PEN', cat: 'tecnico' },
    cabeceo:        { n: 'Cabeceo',          ab: 'CAB', cat: 'tecnico' },
    vision:         { n: 'Visión',           ab: 'VIS', cat: 'mental' },
    anticipacion:   { n: 'Anticipación',     ab: 'ANT', cat: 'defensa' },
    intercepcion:   { n: 'Intercepción',     ab: 'INT', cat: 'defensa' },
    marca:          { n: 'Marca',            ab: 'MAR', cat: 'defensa' },
    entrada:        { n: 'Entrada',          ab: 'ENT', cat: 'defensa' },
    posicionamiento:{ n: 'Posicionamiento',  ab: 'POS', cat: 'defensa' },
    compostura:     { n: 'Compostura',       ab: 'CMP', cat: 'mental' },
    decision:       { n: 'Decisión',         ab: 'DEC', cat: 'mental' },
    concentracion:  { n: 'Concentración',    ab: 'CON', cat: 'mental' },
    liderazgo:      { n: 'Liderazgo',        ab: 'LID', cat: 'mental' },
    agresividad:    { n: 'Agresividad',      ab: 'AGR', cat: 'mental' },
    trabajoEquipo:  { n: 'Trabajo en equipo',ab: 'TRA', cat: 'mental' }
  };
  const ORDEN_ATRIBUTOS = Object.keys(ATRIBUTOS);
  const CATEGORIAS = [
    { id: 'fisico',  n: 'Físico',  icon: '⚡' },
    { id: 'tecnico', n: 'Técnico', icon: '🪄' },
    { id: 'mental',  n: 'Mental',  icon: '🧠' },
    { id: 'defensa', n: 'Defensa', icon: '🛡️' }
  ];

  /* ---------------- posiciones ---------------- */
  const POSICIONES = {
    DFC: {
      n: 'Defensor central', corto: 'DFC', grupo: 'Defensa', icon: '🛡️',
      desc: 'Manda en el área, gana duelos y saca desde atrás.',
      pesos: { marca: 17, entrada: 15, intercepcion: 13, posicionamiento: 12, anticipacion: 10, fuerza: 11, salto: 8, concentracion: 6, compostura: 4, liderazgo: 4 },
      fin: 0.04, cre: 0.05, def: 0.42
    },
    LD: {
      n: 'Lateral derecho', corto: 'LD', grupo: 'Defensa', icon: '➡️',
      desc: 'Recorre la banda, defiende y llega como apoyo.',
      pesos: { ritmo: 14, resistencia: 11, marca: 12, entrada: 11, paseCorto: 9, control: 7, anticipacion: 7, trabajoEquipo: 8, agilidad: 8, posicionamiento: 6, concentracion: 4, tecnica: 3 },
      fin: 0.07, cre: 0.16, def: 0.27
    },
    LI: {
      n: 'Lateral izquierdo', corto: 'LI', grupo: 'Defensa', icon: '⬅️',
      desc: 'Recorre la banda, defiende y llega como apoyo.',
      pesos: { ritmo: 14, resistencia: 11, marca: 12, entrada: 11, paseCorto: 9, control: 7, anticipacion: 7, trabajoEquipo: 8, agilidad: 8, posicionamiento: 6, concentracion: 4, tecnica: 3 },
      fin: 0.07, cre: 0.16, def: 0.27
    },
    MCD: {
      n: 'Mediocampista defensivo', corto: 'MCD', grupo: 'Medio', icon: '🧱',
      desc: 'El equilibrio del equipo: corta, cubre y distribuye.',
      pesos: { intercepcion: 15, marca: 13, posicionamiento: 10, paseCorto: 12, resistencia: 10, fuerza: 9, anticipacion: 8, compostura: 7, decision: 7, trabajoEquipo: 5, concentracion: 4 },
      fin: 0.05, cre: 0.12, def: 0.32
    },
    MC: {
      n: 'Mediocampista central', corto: 'MC', grupo: 'Medio', icon: '🎛️',
      desc: 'Conecta todo: recupera, conduce y asiste.',
      pesos: { paseCorto: 14, vision: 11, control: 10, resistencia: 11, tecnica: 8, decision: 8, trabajoEquipo: 8, paseLargo: 7, regate: 6, compostura: 5, anticipacion: 4, tiroLejano: 3, definicion: 2, marca: 3 },
      fin: 0.11, cre: 0.26, def: 0.18
    },
    MCO: {
      n: 'Enganche', corto: 'MCO', grupo: 'Medio', icon: '🪄',
      desc: 'Vive entre líneas. El último pase es su firma.',
      pesos: { vision: 15, paseCorto: 14, tecnica: 11, regate: 10, control: 10, decision: 8, compostura: 7, tiroLejano: 6, definicion: 6, paseLargo: 5, agilidad: 4, ritmo: 4 },
      fin: 0.19, cre: 0.42, def: 0.06
    },
    ED: {
      n: 'Extremo derecho', corto: 'ED', grupo: 'Ataque', icon: '⚡',
      desc: 'Uno contra uno permanente. Desborde y gol.',
      pesos: { ritmo: 14, regate: 13, agilidad: 10, tecnica: 9, aceleracion: 9, paseCorto: 8, control: 8, definicion: 7, vision: 6, compostura: 4, trabajoEquipo: 3, paseLargo: 3, resistencia: 3, fuerza: 3 },
      fin: 0.27, cre: 0.33, def: 0.06
    },
    EI: {
      n: 'Extremo izquierdo', corto: 'EI', grupo: 'Ataque', icon: '💫',
      desc: 'Uno contra uno permanente. Desborde y gol.',
      pesos: { ritmo: 14, regate: 13, agilidad: 10, tecnica: 9, aceleracion: 9, paseCorto: 8, control: 8, definicion: 7, vision: 6, compostura: 4, trabajoEquipo: 3, paseLargo: 3, resistencia: 3, fuerza: 3 },
      fin: 0.27, cre: 0.33, def: 0.06
    },
    DC: {
      n: 'Delantero centro', corto: 'DC', grupo: 'Ataque', icon: '🎯',
      desc: 'Vive del gol. Una que tenga, la manda a guardar.',
      pesos: { definicion: 18, posicionamiento: 14, compostura: 10, cabeceo: 9, control: 8, fuerza: 7, ritmo: 7, tecnica: 5, salto: 5, tiroLejano: 4, paseCorto: 3, regate: 3, anticipacion: 3, agilidad: 2, trabajoEquipo: 2 },
      fin: 0.43, cre: 0.13, def: 0.03
    },
    SD: {
      n: 'Segundo delantero', corto: 'SD', grupo: 'Ataque', icon: '🔥',
      desc: 'Aparece por todo el frente: define, asiste y arrastra.',
      pesos: { definicion: 13, tecnica: 11, vision: 10, regate: 9, control: 9, compostura: 8, posicionamiento: 8, paseCorto: 7, tiroLejano: 6, agilidad: 5, ritmo: 5, aceleracion: 4, fuerza: 3, cabeceo: 2 },
      fin: 0.32, cre: 0.24, def: 0.04
    }
  };
  const ORDEN_POSICIONES = ['DFC', 'LD', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC', 'SD'];

  /* ---------------- arquetipos ---------------- */
  const ARQUETIPOS = {
    pibe: {
      n: 'El Pibe', icon: '✨', lema: 'La pelota no se discute: se acaricia.',
      desc: 'Enganche de barrio. Ve lo que otros no ven y la pone donde duele.',
      bono: { vision: 8, paseCorto: 7, tecnica: 7, regate: 6, control: 5, compostura: 3, ritmo: -2, fuerza: -4 },
      estilo: { fin: 0.85, cre: 1.32, def: 0.5 },
      ideal: ['MCO', 'MC', 'SD'], ramas: ['cre', 'tec']
    },
    killer: {
      n: 'El Killer', icon: '🎯', lema: 'El área es mi casa. Y no dejo entrar a nadie.',
      desc: 'Definidor de raza. Vive para el último toque y no perdona.',
      bono: { definicion: 9, posicionamiento: 8, compostura: 5, cabeceo: 5, salto: 3, control: 3, paseCorto: -3, marca: -4 },
      estilo: { fin: 1.3, cre: 0.78, def: 0.45 },
      ideal: ['DC', 'SD'], ramas: ['ata', 'fis']
    },
    flecha: {
      n: 'La Flecha', icon: '⚡', lema: 'Si corro, no me ves. Si me ves, ya es tarde.',
      desc: 'Extremo vertical. Explota en el espacio y desordena cualquier línea.',
      bono: { ritmo: 10, aceleracion: 9, regate: 7, agilidad: 5, tecnica: 3, fuerza: -4, marca: -3 },
      estilo: { fin: 1.05, cre: 1.08, def: 0.55 },
      ideal: ['ED', 'EI', 'SD'], ramas: ['fis', 'tec']
    },
    motor: {
      n: 'El Motor', icon: '🔋', lema: 'Corro por mí, por vos y por el que se cansó.',
      desc: 'Box to box. Llega al área y vuelve a la propia en la misma jugada.',
      bono: { resistencia: 10, fuerza: 6, trabajoEquipo: 7, paseCorto: 5, paseLargo: 4, decision: 3, definicion: -2, agilidad: -2 },
      estilo: { fin: 0.95, cre: 1.05, def: 1.05 },
      ideal: ['MC', 'MCD', 'LD'], ramas: ['fis', 'men']
    },
    muro: {
      n: 'El Muro', icon: '🛡️', lema: 'Por acá no pasa nada. Ni la pelota ni el miedo.',
      desc: 'Central de hierro. Gana de arriba, de abajo y de costado.',
      bono: { marca: 9, entrada: 8, anticipacion: 7, fuerza: 7, salto: 6, compostura: 4, tecnica: -5, regate: -5 },
      estilo: { fin: 0.42, cre: 0.58, def: 1.32 },
      ideal: ['DFC', 'MCD'], ramas: ['def', 'fis']
    },
    gladiador: {
      n: 'El Gladiador', icon: '⚔️', lema: 'La pelota se gana. Siempre.',
      desc: 'Volante destructor. Corta, presiona y le deja el equipo servido.',
      bono: { intercepcion: 8, entrada: 8, agresividad: 8, marca: 6, resistencia: 5, fuerza: 5, tecnica: -3, vision: -2 },
      estilo: { fin: 0.68, cre: 0.82, def: 1.18 },
      ideal: ['MCD', 'DFC', 'MC'], ramas: ['def', 'men']
    },
    artista: {
      n: 'El Artista', icon: '🎨', lema: 'El fútbol es un cuadro. Yo pinto el último trazo.',
      desc: 'Delantero técnico. Falso nueve, mediapunta, lo que pida la noche.',
      bono: { tecnica: 9, control: 8, definicion: 6, regate: 5, vision: 4, compostura: 4, fuerza: -5 },
      estilo: { fin: 1.12, cre: 1.12, def: 0.48 },
      ideal: ['SD', 'MCO', 'DC'], ramas: ['tec', 'ata']
    },
    capitan: {
      n: 'El Capitán', icon: '🎖️', lema: 'No hace falta gritar. El equipo escucha mis pies.',
      desc: 'Organizador y líder. Maneja los tiempos y aguanta la presión.',
      bono: { liderazgo: 10, compostura: 7, paseLargo: 7, decision: 6, concentracion: 5, vision: 5, trabajoEquipo: 5, ritmo: -4, agilidad: -3 },
      estilo: { fin: 0.8, cre: 1.08, def: 1.02 },
      ideal: ['MC', 'MCD', 'DFC', 'LD'], ramas: ['men', 'cre']
    }
  };
  const ORDEN_ARQUETIPOS = ['pibe', 'killer', 'flecha', 'motor', 'muro', 'gladiador', 'artista', 'capitan'];

  /* ---------------- ramas de habilidad ---------------- */
  const RAMAS = {
    tec: { id: 'tec', n: 'Pies de seda', corto: 'Técnica', icon: '✨', color: '#B8FF2E', desc: 'El dominio del balón: control, regate y magia.' },
    fis: { id: 'fis', n: 'Motor físico', corto: 'Físico', icon: '⚡', color: '#FF9A4D', desc: 'Velocidad, potencia y una reserva infinita.' },
    men: { id: 'men', n: 'Lectura de juego', corto: 'Mental', icon: '🧠', color: '#7C9BFF', desc: 'Decisión, temple y liderazgo en la cabeza.' },
    def: { id: 'def', n: 'Muro de acero', corto: 'Defensa', icon: '🛡️', color: '#38D9C6', desc: 'Cortar, marcar y apagar incendios.' },
    ata: { id: 'ata', n: 'Instinto asesino', corto: 'Ataque', icon: '🎯', color: '#FF6E9C', desc: 'El gol como obsesión: remate, área y sangre fría.' },
    cre: { id: 'cre', n: 'Ojo de halcón', corto: 'Creación', icon: '👁️', color: '#F5C451', desc: 'Ver el pase que nadie ve y ejecutarlo.' }
  };
  const ORDEN_RAMAS = ['tec', 'fis', 'men', 'def', 'ata', 'cre'];
  const COSTO_TIER = [0, 1, 1, 2, 2, 3, 4];
  const NIVEL_TIER = [0, 1, 3, 7, 11, 16, 22];

  const RASGOS = {
    regate_imprevisible: { n: 'Imprevisible', d: '+6% de éxito en el 1 contra 1.', mods: { regate: 0.06 } },
    mago: { n: 'Mago del balón', d: 'Cada 10 regates exitosos genera una ocasión extra.', mods: { ocasionExtra: 0.10 } },
    seda: { n: 'Pies de seda', d: 'Sufrís un 15% menos de pérdidas de balón.', mods: { perdidas: 0.85 } },
    recuperacion: { n: 'Recuperación exprés', d: '+25% de recuperación física entre partidos.', mods: { recuperacion: 1.25 } },
    duelos: { n: 'Duelista', d: '+10% en duelos físicos.', mods: { duelos: 1.10 } },
    incansable: { n: 'Incansable', d: 'Tu fatiga baja un 20%.', mods: { fatiga: 0.80 } },
    motor: { n: 'Motor inagotable', d: 'Nunca jugás por debajo del 80% de energía.', mods: { energiaMin: 80 } },
    temple: { n: 'Temple', d: '+8% en penales y jugadas de presión.', mods: { presion: 1.08 } },
    general: { n: 'General', d: 'Tus compañeros rinden un 8% más.', mods: { companeros: 1.08 } },
    clutch: { n: 'Frío como el hielo', d: '+12% en los últimos 15 minutos.', mods: { clutch: 1.12 } },
    leyenda: { n: 'Mentalidad de leyenda', d: '+15% de moral propia y del equipo.', mods: { moral: 1.15 } },
    muro: { n: 'Muro', d: '+10% en duelos defensivos.', mods: { defensa: 1.10 } },
    rival_precision: { n: 'Implacable', d: 'La precisión rival baja un 8%.', mods: { rivalPrecision: 0.92 } },
    candado: { n: 'Candado', d: 'El xG rival baja un 10%.', mods: { xgRival: 0.90 } },
    killer: { n: 'Killer', d: '+12% de conversión dentro del área.', mods: { area: 1.12 } },
    acrobatico: { n: 'Acróbata', d: 'Desbloquea remates acrobáticos.', mods: { acrobatico: true } },
    instinto: { n: 'Instinto asesino', d: '+15% de conversión en ocasiones claras.', mods: { instinto: 1.15 } },
    balon_parado: { n: 'Especialista', d: '+12% en balón parado.', mods: { balonParado: 1.12 } },
    asistencias: { n: 'Asistente', d: '+12% de conversión de tus compañeros tras tu pase.', mods: { asistencias: 1.12 } },
    pase_imposible: { n: 'Pase imposible', d: 'Desbloquea el pase filtrado imposible.', mods: { paseImposible: true } },
    pase_filtrado: { n: 'Ojo de halcón', d: '+15% de éxito en pases filtrados.', mods: { paseFiltrado: 1.15 } }
  };

  function H(rama, tier, id, nombre, icono, desc, req, efectos, rasgo) {
    return {
      id, rama, tier, nombre, icono, desc,
      req: req || [], efectos: efectos || {},
      rasgo: rasgo ? { id: rasgo, n: RASGOS[rasgo].n, d: RASGOS[rasgo].d } : null,
      costo: COSTO_TIER[tier], nivel: NIVEL_TIER[tier]
    };
  }

  const HABILIDADES = [
    /* ---- TEC ---- */
    H('tec', 1, 'control_orientado', 'Control orientado', '🦶', 'Recibís y ya estás perfilado para el siguiente pase.', [], { control: 3, tecnica: 2 }),
    H('tec', 1, 'toque_primera', 'Toque de primera', '👟', 'Un toque, un pase. El balón no te frena.', [], { tecnica: 3, compostura: 2 }),
    H('tec', 2, 'regate_corto', 'Regate en corto', '🌀', 'Cambios de dirección en espacios mínimos.', ['control_orientado'], { regate: 3, agilidad: 2 }),
    H('tec', 2, 'amague', 'Amague', '💫', 'Amagás con el cuerpo y te llevás la pelota.', ['toque_primera'], { regate: 2, aceleracion: 2, agilidad: 1 }),
    H('tec', 3, 'conduccion', 'Conducción pegada', '🏃', 'La pelota atada al pie a máxima velocidad.', ['regate_corto'], { control: 3, regate: 2, tecnica: 1 }),
    H('tec', 3, 'proteccion', 'Juego de cuerpo', '💪', 'Protegés la pelota con el cuerpo y ganás la posición.', ['amague'], { fuerza: 3, tecnica: 2, compostura: 1 }),
    H('tec', 3, 'filigrana', 'Filigrana', '✨', 'Lo que para otros es imposible, para vos es normal.', ['regate_corto'], { tecnica: 3, regate: 2 }),
    H('tec', 4, 'ruleta', 'Ruleta', '🔃', 'El giro que deja al defensor mirando la tribuna.', ['conduccion'], { agilidad: 3, regate: 3 }),
    H('tec', 4, 'sombrero', 'Sombrero', '🎩', 'La tocás por arriba y pasás por abajo.', ['filigrana'], { tecnica: 2, regate: 2, compostura: 2 }),
    H('tec', 5, 'malabarista', 'Malabarista', '🤹', 'Dominio total: el balón hace lo que querés.', ['ruleta', 'sombrero'], { tecnica: 4, control: 3 }),
    H('tec', 5, 'imprevisible', 'Imprevisible', '🎭', 'No hay scouting que te lea.', ['ruleta'], { regate: 2, agilidad: 2 }, 'regate_imprevisible'),
    H('tec', 6, 'mago', 'Mago del balón', '✨', 'Cada regate puede terminar en una ocasión de gol.', ['malabarista'], { tecnica: 5, regate: 4 }, 'mago'),
    H('tec', 6, 'seda', 'Pies de seda', '🎵', 'Nunca perdés la pelota: la acariciás.', ['imprevisible'], { control: 4, tecnica: 4 }, 'seda'),

    /* ---- FIS ---- */
    H('fis', 1, 'base_fisica', 'Base física', '🧱', 'El trabajo invisible que sostiene todo.', [], { resistencia: 3, fuerza: 2 }),
    H('fis', 1, 'arranque', 'Arranque explosivo', '💥', 'Los primeros tres metros son tuyos.', [], { aceleracion: 3, ritmo: 2 }),
    H('fis', 2, 'pulmones', 'Pulmones de acero', '💨', 'Llegás al minuto 90 como al minuto 1.', ['base_fisica'], { resistencia: 4 }),
    H('fis', 2, 'zancada', 'Zancada larga', '🏃', 'Cada paso te lleva más lejos que al rival.', ['arranque'], { ritmo: 3, aceleracion: 2 }),
    H('fis', 3, 'core', 'Core de acero', '⚙️', 'Equilibrio, salto y estabilidad en el duelo.', ['pulmones'], { fuerza: 3, salto: 3, agilidad: 2 }),
    H('fis', 3, 'velocidad_punta', 'Velocidad punta', '🚀', 'Cuando abrís el acelerador no hay vuelta.', ['zancada'], { ritmo: 4, aceleracion: 1 }),
    H('fis', 3, 'recuperacion', 'Recuperación exprés', '❄️', 'Tu cuerpo se regenera más rápido que el del resto.', ['pulmones'], { resistencia: 3, compostura: 2 }, 'recuperacion'),
    H('fis', 4, 'potencia', 'Potencia de piernas', '⚙️', 'Remate y salto con motores de más cilindrada.', ['core'], { fuerza: 3, tiroLejano: 3 }),
    H('fis', 4, 'sprint', 'Sprint sostenido', '🏁', 'No es un pique: es una carrera de 60 metros.', ['velocidad_punta'], { ritmo: 3, resistencia: 3 }),
    H('fis', 5, 'tanque', 'El Tanque', '🏋️', 'En el duelo físico, el rival necesita ayuda.', ['potencia'], { fuerza: 4, salto: 3 }, 'duelos'),
    H('fis', 5, 'incansable', 'Incansable', '🔋', 'El cansancio es una decisión que no tomás.', ['sprint', 'recuperacion'], { resistencia: 4, ritmo: 2 }, 'incansable'),
    H('fis', 6, 'atleta', 'Atleta total', '🏅', 'Velocidad, fuerza y fondo: el paquete completo.', ['tanque', 'incansable'], { ritmo: 4, fuerza: 4, resistencia: 4 }),
    H('fis', 6, 'motor', 'Motor inagotable', '♾️', 'Setenta minutos de intensidad, noventa de pie.', ['incansable'], { resistencia: 5, ritmo: 3 }, 'motor'),

    /* ---- MEN ---- */
    H('men', 1, 'concentracion', 'Concentración', '🎯', 'Un segundo de distracción es un gol en contra.', [], { concentracion: 3, compostura: 2 }),
    H('men', 1, 'caracter', 'Carácter', '🦁', 'Cuando el partido se pone feo, aparecés vos.', [], { compostura: 3, decision: 2 }),
    H('men', 2, 'vision_periferica', 'Visión periférica', '👁️', 'Ves el campo entero antes de recibir.', ['concentracion'], { vision: 3, decision: 2 }),
    H('men', 2, 'sangre_fria', 'Sangre fría', '❄️', 'El minuto 90 pesa menos si estás tranquilo.', ['caracter'], { compostura: 3, penales: 2 }),
    H('men', 3, 'anticipacion', 'Anticipación', '🔮', 'Llegás antes que la jugada.', ['vision_periferica'], { anticipacion: 3, intercepcion: 2 }),
    H('men', 3, 'liderazgo', 'Liderazgo', '🎖️', 'El equipo juega distinto cuando estás en cancha.', ['sangre_fria'], { liderazgo: 3, compostura: 2, decision: 2 }),
    H('men', 3, 'mentalidad', 'Mentalidad ganadora', '🏆', 'No negociás el resultado. Nunca.', ['sangre_fria'], { decision: 3, concentracion: 2 }),
    H('men', 4, 'temple', 'Temple de acero', '🗿', 'Los momentos grandes te agrandan.', ['liderazgo'], { compostura: 4, penales: 2 }, 'temple'),
    H('men', 4, 'ojo_tactico', 'Ojo táctico', '📋', 'Leés el partido como un entrenador.', ['anticipacion'], { decision: 3, posicionamiento: 3 }),
    H('men', 5, 'general', 'General en el campo', '🎺', 'Tus compañeros juegan mejor a tu lado.', ['temple'], { liderazgo: 4, vision: 3 }, 'general'),
    H('men', 5, 'frio', 'Frío como el hielo', '❄️', 'El último minuto tiene dueño.', ['temple'], { compostura: 5, decision: 3 }, 'clutch'),
    H('men', 6, 'cerebro', 'Cerebro del equipo', '🧠', 'Pensás dos jugadas adelante de todos.', ['general', 'ojo_tactico'], { vision: 4, decision: 4, liderazgo: 4 }),
    H('men', 6, 'leyenda', 'Mentalidad de leyenda', '👑', 'Los vestuarios cambian cuando entrás.', ['frio'], { compostura: 5, liderazgo: 5 }, 'leyenda'),

    /* ---- DEF ---- */
    H('def', 1, 'postura', 'Postura defensiva', '🧍', 'Perfilado, agachado, listo. Nada de regalos.', [], { posicionamiento: 3, marca: 2 }),
    H('def', 1, 'quite', 'Quite básico', '🦶', 'La pelota es tuya. El rival solo la tenía prestada.', [], { entrada: 3, intercepcion: 2 }),
    H('def', 2, 'marca_hombre', 'Marca al hombre', '🥊', 'No lo soltás ni en el túnel.', ['postura'], { marca: 3, anticipacion: 2 }),
    H('def', 2, 'barrido', 'Barrida', '🧹', 'Entrada limpia, pelota al lateral.', ['quite'], { entrada: 3, fuerza: 2 }),
    H('def', 3, 'intercepcion', 'Lectura de intercepción', '✂️', 'Cortás el pase antes de que salga.', ['marca_hombre'], { intercepcion: 3, anticipacion: 2 }),
    H('def', 3, 'duelo', 'Duelo cuerpo a cuerpo', '💪', 'Ganás la posición y la pelota.', ['barrido'], { fuerza: 3, marca: 2 }),
    H('def', 3, 'cobertura', 'Cobertura', '🧯', 'Siempre hay un compañero cubierto.', ['marca_hombre'], { posicionamiento: 3, trabajoEquipo: 2 }),
    H('def', 4, 'despeje', 'Despeje seguro', '🗑️', 'Lejos, alto y sin riesgo.', ['intercepcion'], { entrada: 3, salto: 3 }),
    H('def', 4, 'lider_def', 'Líder de la zaga', '📢', 'Organizás la línea y el offside.', ['duelo'], { liderazgo: 3, posicionamiento: 3 }),
    H('def', 5, 'muro', 'Muro', '🧱', 'Por tu sector no se pasa. Punto.', ['despeje', 'cobertura'], { marca: 4, entrada: 4 }, 'muro'),
    H('def', 5, 'implacable', 'Implacable', '💢', 'El rival siente tu presencia antes de recibir.', ['lider_def'], { fuerza: 4, agresividad: 3 }, 'rival_precision'),
    H('def', 6, 'bunker', 'Búnker', '🏰', 'Cerrás el área con llave.', ['muro', 'implacable'], { marca: 5, entrada: 5, posicionamiento: 4 }),
    H('def', 6, 'candado', 'Candado', '🔒', 'El delantero rival se va sin tocarla.', ['muro'], { intercepcion: 4, anticipacion: 4 }, 'candado'),

    /* ---- ATA ---- */
    H('ata', 1, 'definicion_basica', 'Definición básica', '⚽', 'Lo simple, bien hecho: pegarle al arco.', [], { definicion: 3, compostura: 2 }),
    H('ata', 1, 'remate', 'Remate de primera', '🥅', 'Sin acomodarte: golpeás y la pelota va.', [], { definicion: 3, tecnica: 2 }),
    H('ata', 2, 'tiro_colocado', 'Tiro colocado', '🎯', 'El rincón, siempre el rincón.', ['definicion_basica'], { definicion: 3, tiroLejano: 2 }),
    H('ata', 2, 'potencia_tiro', 'Potencia de disparo', '💣', 'El arquero la ve. No llega.', ['remate'], { tiroLejano: 3, fuerza: 2 }),
    H('ata', 3, 'cabeceo', 'Cabezazo', '🗿', 'El área es tuya por arriba.', ['tiro_colocado'], { cabeceo: 3, salto: 2 }),
    H('ata', 3, 'definidor_area', 'Definidor de área', '🎯', 'Olfato puro: estás donde cae la pelota.', ['potencia_tiro'], { posicionamiento: 3, definicion: 2 }),
    H('ata', 3, 'penales', 'Especialista en penales', '🎯', 'Doce pasos. El arquero adivina.', ['tiro_colocado'], { penales: 4, compostura: 2 }),
    H('ata', 4, 'media_vuelta', 'Media vuelta', '🌀', 'Te acomodás en un giro y sacás el latigazo.', ['cabeceo'], { tecnica: 3, definicion: 3 }),
    H('ata', 4, 'desmarque', 'Desmarque letal', '🏃', 'Te escapás cuando el defensor parpadea.', ['definidor_area'], { posicionamiento: 3, ritmo: 2 }),
    H('ata', 5, 'killer', 'Killer', '🎯', 'Una sola ocasión te alcanza.', ['media_vuelta', 'desmarque'], { definicion: 4, compostura: 3 }, 'killer'),
    H('ata', 5, 'chilena', 'Chilena', '🤸', 'La pelota arriba y el cuerpo en el aire.', ['media_vuelta'], { tecnica: 3, agilidad: 3, salto: 2 }, 'acrobatico'),
    H('ata', 6, 'goleador', 'Goleador nato', '🥇', 'El gol no es suerte: es costumbre.', ['killer'], { definicion: 5, posicionamiento: 4, compostura: 3 }),
    H('ata', 6, 'instinto', 'Instinto asesino', '🐺', 'En el área no pensás: ejecutás.', ['killer', 'chilena'], { definicion: 4, posicionamiento: 4 }, 'instinto'),

    /* ---- CRE ---- */
    H('cre', 1, 'pase_corto', 'Pase corto', '🎯', 'El pase justo, al pie correcto.', [], { paseCorto: 3, tecnica: 2 }),
    H('cre', 1, 'pase_largo', 'Pase largo', '📡', 'Cambiás el frente de juego en un toque.', [], { paseLargo: 3, vision: 2 }),
    H('cre', 2, 'pared', 'Pared', '🤝', 'La sociedad que rompe líneas.', ['pase_corto'], { paseCorto: 3, vision: 2, trabajoEquipo: 1 }),
    H('cre', 2, 'cambio_banda', 'Cambio de banda', '🌐', 'Abrís el campo y el rival corre de espaldas.', ['pase_largo'], { paseLargo: 3, tecnica: 2 }),
    H('cre', 3, 'ultimo_pase', 'Último pase', '🔑', 'La asistencia empieza en tu cabeza.', ['pared'], { vision: 3, paseCorto: 2 }),
    H('cre', 3, 'centro', 'Centro medido', '🎯', 'El área está llena de cabezas. La tuya sabe cuál.', ['cambio_banda'], { paseLargo: 2, tecnica: 2, vision: 1 }),
    H('cre', 3, 'ritmo_juego', 'Ritmo de juego', '🎛️', 'Acelerás o frenás cuando el partido lo pide.', ['pared'], { decision: 3, paseCorto: 2 }),
    H('cre', 4, 'asistencia', 'Asistencia letal', '🅰️', 'Tus pases terminan en gol.', ['ultimo_pase'], { vision: 3, paseCorto: 3 }),
    H('cre', 4, 'lanzador', 'Lanzador a balón parado', '🎯', 'Tiros libres y córners con firma propia.', ['centro'], { paseLargo: 3, tecnica: 2 }, 'balon_parado'),
    H('cre', 5, 'vision_total', 'Visión total', '🦅', 'Ves el pase que ni el compañero sabía que existía.', ['asistencia', 'ritmo_juego'], { vision: 4, paseLargo: 4 }, 'asistencias'),
    H('cre', 5, 'enganche', 'El Enganche', '🎩', 'Entre líneas, de espaldas, de frente. Siempre libre.', ['asistencia'], { tecnica: 4, vision: 3, regate: 2 }, 'pase_imposible'),
    H('cre', 6, 'arquitecto', 'Arquitecto', '📐', 'El equipo juega a tu ritmo y a tu gusto.', ['vision_total', 'enganche'], { vision: 5, paseCorto: 5, paseLargo: 4 }),
    H('cre', 6, 'ojo_halcon', 'Ojo de halcón', '👁️', 'El pase filtrado es un bisturí.', ['vision_total'], { vision: 4, tecnica: 4 }, 'pase_filtrado')
  ];

  /* ---------------- ligas y clubes ---------------- */
  const LIGAS = [
    {
      id: 'ing', nombre: 'Premier League', pais: 'Inglaterra', bandera: '🏴', prestigio: 100, nivel: 5,
      clubes: [
        ['Manchester City', 'MCI', 89, 97, '#6CABDD', '#1C2C5B', 'Manchester'],
        ['Arsenal', 'ARS', 88, 94, '#EF0107', '#063672', 'Londres'],
        ['Liverpool', 'LIV', 88, 95, '#C8102E', '#00B2A9', 'Liverpool'],
        ['Chelsea', 'CHE', 84, 91, '#034694', '#DBA111', 'Londres'],
        ['Manchester United', 'MUN', 82, 96, '#DA291C', '#FBE122', 'Manchester'],
        ['Tottenham Hotspur', 'TOT', 82, 89, '#132257', '#FFFFFF', 'Londres'],
        ['Newcastle United', 'NEW', 82, 86, '#241F20', '#FFFFFF', 'Newcastle'],
        ['Aston Villa', 'AVL', 81, 84, '#670E36', '#95BFE5', 'Birmingham'],
        ['Brighton', 'BHA', 78, 79, '#0057B8', '#FFFFFF', 'Brighton'],
        ['West Ham United', 'WHU', 77, 82, '#7A263A', '#1BB1E7', 'Londres'],
        ['Crystal Palace', 'CRY', 77, 78, '#1B458F', '#C4122E', 'Londres'],
        ['Nottingham Forest', 'NFO', 77, 78, '#DD0000', '#FFFFFF', 'Nottingham'],
        ['Fulham', 'FUL', 76, 76, '#FFFFFF', '#000000', 'Londres'],
        ['Bournemouth', 'BOU', 76, 74, '#DA291C', '#000000', 'Bournemouth'],
        ['Brentford', 'BRE', 75, 73, '#E30613', '#FFFFFF', 'Londres'],
        ['Everton', 'EVE', 75, 78, '#003399', '#FFFFFF', 'Liverpool'],
        ['Wolverhampton', 'WOL', 74, 75, '#FDB913', '#231F20', 'Wolverhampton'],
        ['Leeds United', 'LEE', 72, 75, '#FFFFFF', '#1D428A', 'Leeds'],
        ['Sunderland', 'SUN', 71, 71, '#EB172B', '#FFFFFF', 'Sunderland'],
        ['Burnley', 'BUR', 70, 70, '#6C1D45', '#99D6EA', 'Burnley']
      ]
    },
    {
      id: 'esp', nombre: 'LaLiga', pais: 'España', bandera: '🇪🇸', prestigio: 98, nivel: 5,
      clubes: [
        ['Real Madrid', 'RMA', 91, 99, '#FFFFFF', '#FEBE10', 'Madrid'],
        ['FC Barcelona', 'BAR', 89, 98, '#A50044', '#004D98', 'Barcelona'],
        ['Atlético de Madrid', 'ATM', 85, 93, '#CB3524', '#FFFFFF', 'Madrid'],
        ['Athletic Club', 'ATH', 80, 85, '#EE2523', '#FFFFFF', 'Bilbao'],
        ['Villarreal', 'VIL', 79, 81, '#FFE667', '#005187', 'Villarreal'],
        ['Real Betis', 'BET', 78, 83, '#00954C', '#FFFFFF', 'Sevilla'],
        ['Real Sociedad', 'RSO', 78, 83, '#0067B1', '#FFFFFF', 'San Sebastián'],
        ['Sevilla FC', 'SEV', 76, 87, '#FFFFFF', '#D4001A', 'Sevilla'],
        ['Valencia CF', 'VAL', 75, 84, '#FFFFFF', '#F18E00', 'Valencia'],
        ['Girona FC', 'GIR', 75, 75, '#CD2534', '#FFFFFF', 'Girona'],
        ['Celta de Vigo', 'CEL', 73, 75, '#8AC3EE', '#FFFFFF', 'Vigo'],
        ['Osasuna', 'OSA', 73, 73, '#D91A21', '#0A346F', 'Pamplona'],
        ['Rayo Vallecano', 'RAY', 72, 71, '#FFFFFF', '#E53027', 'Madrid'],
        ['Mallorca', 'MLL', 72, 71, '#E20613', '#000000', 'Palma'],
        ['Getafe', 'GET', 71, 71, '#005999', '#FFFFFF', 'Getafe'],
        ['Espanyol', 'ESP', 71, 73, '#FFFFFF', '#007FC8', 'Barcelona'],
        ['Deportivo Alavés', 'ALA', 71, 70, '#0761AF', '#FFFFFF', 'Vitoria'],
        ['Elche', 'ELC', 68, 68, '#FFFFFF', '#05642C', 'Elche'],
        ['Levante', 'LEV', 67, 67, '#004E9E', '#B4053B', 'Valencia'],
        ['Real Oviedo', 'OVI', 66, 66, '#003DA5', '#FFFFFF', 'Oviedo']
      ]
    },
    {
      id: 'ita', nombre: 'Serie A', pais: 'Italia', bandera: '🇮🇹', prestigio: 92, nivel: 4,
      clubes: [
        ['Inter de Milán', 'INT', 87, 93, '#0068A8', '#000000', 'Milán'],
        ['Napoli', 'NAP', 85, 90, '#12A0D7', '#FFFFFF', 'Nápoles'],
        ['AC Milan', 'MIL', 83, 92, '#FB090B', '#000000', 'Milán'],
        ['Juventus', 'JUV', 83, 93, '#000000', '#FFFFFF', 'Turín'],
        ['Atalanta', 'ATA', 82, 85, '#1E71B8', '#000000', 'Bérgamo'],
        ['AS Roma', 'ROM', 81, 89, '#8E1F2F', '#F0BC42', 'Roma'],
        ['Lazio', 'LAZ', 78, 87, '#87D8F7', '#FFFFFF', 'Roma'],
        ['Fiorentina', 'FIO', 78, 81, '#482E92', '#FFFFFF', 'Florencia'],
        ['Bologna', 'BOL', 77, 79, '#1A2F48', '#A21C26', 'Bolonia'],
        ['Torino', 'TOR', 74, 76, '#8A1E03', '#FFFFFF', 'Turín'],
        ['Udinese', 'UDI', 73, 74, '#000000', '#FFFFFF', 'Údine'],
        ['Como', 'COM', 73, 73, '#003366', '#FFFFFF', 'Como'],
        ['Genoa', 'GEN', 72, 74, '#A21C26', '#1A2F48', 'Génova'],
        ['Cagliari', 'CAG', 70, 71, '#A21C26', '#1A2F48', 'Cagliari'],
        ['Parma', 'PAR', 69, 70, '#FFD700', '#003399', 'Parma'],
        ['Lecce', 'LEC', 69, 69, '#FFD700', '#A21C26', 'Lecce'],
        ['Sassuolo', 'SAS', 69, 70, '#00A752', '#000000', 'Sassuolo'],
        ['Hellas Verona', 'VER', 68, 69, '#FFD700', '#003399', 'Verona'],
        ['Pisa', 'PIS', 66, 66, '#000000', '#0055A4', 'Pisa'],
        ['Cremonese', 'CRE', 66, 65, '#A21C26', '#808080', 'Cremona']
      ]
    },
    {
      id: 'ale', nombre: 'Bundesliga', pais: 'Alemania', bandera: '🇩🇪', prestigio: 91, nivel: 4,
      clubes: [
        ['Bayern Múnich', 'BAY', 91, 97, '#DC052D', '#FFFFFF', 'Múnich'],
        ['Bayer Leverkusen', 'LEV', 84, 87, '#E32221', '#000000', 'Leverkusen'],
        ['Borussia Dortmund', 'BVB', 83, 91, '#FDE100', '#000000', 'Dortmund'],
        ['RB Leipzig', 'RBL', 81, 85, '#DD0741', '#FFFFFF', 'Leipzig'],
        ['VfB Stuttgart', 'STU', 79, 81, '#FFFFFF', '#E32219', 'Stuttgart'],
        ['Eintracht Frankfurt', 'SGE', 78, 81, '#E1000F', '#000000', 'Fráncfort'],
        ['SC Freiburg', 'SCF', 75, 76, '#000000', '#E2001A', 'Friburgo'],
        ['VfL Wolfsburg', 'WOB', 75, 78, '#65B32E', '#FFFFFF', 'Wolfsburgo'],
        ['Borussia Mönchengladbach', 'BMG', 74, 79, '#000000', '#FFFFFF', 'Mönchengladbach'],
        ['Mainz 05', 'M05', 73, 73, '#C3141E', '#FFFFFF', 'Maguncia'],
        ['Werder Bremen', 'SVW', 72, 75, '#1D9053', '#FFFFFF', 'Bremen'],
        ['Hoffenheim', 'TSG', 72, 74, '#1961B0', '#FFFFFF', 'Sinsheim'],
        ['Augsburg', 'FCA', 71, 72, '#BA3733', '#FFFFFF', 'Augsburgo'],
        ['Union Berlin', 'FCU', 71, 74, '#D4011D', '#FFFFFF', 'Berlín'],
        ['FC Colonia', 'KOE', 69, 73, '#ED1C24', '#FFFFFF', 'Colonia'],
        ['Hamburgo SV', 'HSV', 69, 75, '#0A3F86', '#FFFFFF', 'Hamburgo'],
        ['Heidenheim', 'FCH', 67, 68, '#E1000F', '#003D7C', 'Heidenheim'],
        ['St. Pauli', 'STP', 66, 67, '#6B3F23', '#FFFFFF', 'Hamburgo']
      ]
    },
    {
      id: 'fra', nombre: 'Ligue 1', pais: 'Francia', bandera: '🇫🇷', prestigio: 88, nivel: 4,
      clubes: [
        ['Paris Saint-Germain', 'PSG', 90, 96, '#004170', '#DA291C', 'París'],
        ['Olympique de Marsella', 'OM', 81, 87, '#2FAEE0', '#FFFFFF', 'Marsella'],
        ['AS Mónaco', 'ASM', 80, 84, '#E63312', '#FFFFFF', 'Mónaco'],
        ['Olympique de Lyon', 'OL', 78, 85, '#FFFFFF', '#0046A6', 'Lyon'],
        ['Lille', 'LOSC', 78, 81, '#E01E26', '#1A2F48', 'Lille'],
        ['Niza', 'NIC', 76, 79, '#C4122E', '#000000', 'Niza'],
        ['Lens', 'RCL', 76, 79, '#FFD100', '#E30613', 'Lens'],
        ['Rennes', 'REN', 75, 80, '#E23030', '#000000', 'Rennes'],
        ['Estrasburgo', 'RCS', 74, 75, '#0066B3', '#FFFFFF', 'Estrasburgo'],
        ['Toulouse', 'TFC', 73, 73, '#5B3F98', '#FFFFFF', 'Toulouse'],
        ['Brest', 'BRE', 71, 72, '#E30613', '#FFFFFF', 'Brest'],
        ['Nantes', 'NAN', 71, 74, '#FFDD00', '#008C45', 'Nantes'],
        ['Auxerre', 'AJA', 69, 70, '#FFFFFF', '#004A9F', 'Auxerre'],
        ['Lorient', 'FCL', 67, 68, '#F58220', '#000000', 'Lorient'],
        ['Angers', 'SCO', 66, 67, '#000000', '#FFFFFF', 'Angers'],
        ['Le Havre', 'HAC', 66, 67, '#003D7C', '#87CEEB', 'El Havre'],
        ['Metz', 'FCM', 65, 66, '#8B0000', '#FFFFFF', 'Metz'],
        ['Paris FC', 'PFC', 65, 65, '#003D7C', '#FFFFFF', 'París']
      ]
    },
    {
      id: 'arg', nombre: 'Liga Profesional', pais: 'Argentina', bandera: '🇦🇷', prestigio: 80, nivel: 3,
      clubes: [
        ['River Plate', 'RIV', 80, 91, '#FFFFFF', '#E30613', 'Buenos Aires'],
        ['Boca Juniors', 'BOC', 79, 94, '#003D7C', '#FFD700', 'Buenos Aires'],
        ['Racing Club', 'RAC', 77, 85, '#8AC3EE', '#FFFFFF', 'Avellaneda'],
        ['Independiente', 'IND', 76, 85, '#E30613', '#FFFFFF', 'Avellaneda'],
        ['Vélez Sarsfield', 'VEL', 76, 81, '#FFFFFF', '#003D7C', 'Buenos Aires'],
        ['Estudiantes', 'EST', 75, 81, '#E30613', '#FFFFFF', 'La Plata'],
        ['Talleres', 'TAL', 75, 79, '#003D7C', '#FFFFFF', 'Córdoba'],
        ['Rosario Central', 'CEN', 74, 81, '#003D7C', '#FFD700', 'Rosario'],
        ['San Lorenzo', 'SLO', 73, 83, '#003D7C', '#E30613', 'Buenos Aires'],
        ['Lanús', 'LAN', 73, 78, '#8B0000', '#FFFFFF', 'Lanús'],
        ['Newell\'s Old Boys', 'NOB', 72, 79, '#E30613', '#000000', 'Rosario'],
        ['Huracán', 'HUR', 72, 76, '#FFFFFF', '#E30613', 'Buenos Aires'],
        ['Argentinos Juniors', 'AAAJ', 71, 74, '#E30613', '#FFFFFF', 'Buenos Aires'],
        ['Defensa y Justicia', 'DYJ', 71, 73, '#FFD700', '#008C45', 'Florencio Varela'],
        ['Belgrano', 'BEL', 70, 73, '#8AC3EE', '#FFFFFF', 'Córdoba'],
        ['Gimnasia', 'GIM', 69, 75, '#FFFFFF', '#003D7C', 'La Plata'],
        ['Banfield', 'BAN', 69, 72, '#008C45', '#FFFFFF', 'Banfield'],
        ['Godoy Cruz', 'GOD', 69, 71, '#003D7C', '#FFFFFF', 'Mendoza'],
        ['Instituto', 'INS', 68, 70, '#E30613', '#FFFFFF', 'Córdoba'],
        ['Platense', 'PLA', 67, 69, '#FFFFFF', '#8B4513', 'Buenos Aires']
      ]
    }
  ];

  const CLUBES = {};
  const LIGAS_MAP = {};
  LIGAS.forEach(function (l) {
    l.clubes = l.clubes.map(function (c, i) {
      const club = {
        id: l.id + '_' + i, nombre: c[0], corto: c[1], fuerza: c[2], prestigio: c[3],
        c1: c[4], c2: c[5], ciudad: c[6], liga: l.id, pais: l.pais
      };
      CLUBES[club.id] = club;
      return club;
    });
    l.nClubes = l.clubes.length;
    l.jornadas = (l.nClubes - 1) * 2;
    LIGAS_MAP[l.id] = l;
  });

  function clubPorId(id) { return CLUBES[id] || null; }
  function ligaPorId(id) { return LIGAS_MAP[id] || null; }

  /* ---------------- naciones ---------------- */
  const NACIONES = [
    { id: 'arg', n: 'Argentina', bandera: '🇦🇷', fuerza: 94 },
    { id: 'fra', n: 'Francia', bandera: '🇫🇷', fuerza: 93 },
    { id: 'esp', n: 'España', bandera: '🇪🇸', fuerza: 92 },
    { id: 'ing', n: 'Inglaterra', bandera: '🏴', fuerza: 91 },
    { id: 'bra', n: 'Brasil', bandera: '🇧🇷', fuerza: 90 },
    { id: 'por', n: 'Portugal', bandera: '🇵🇹', fuerza: 89 },
    { id: 'hol', n: 'Países Bajos', bandera: '🇳🇱', fuerza: 88 },
    { id: 'ale', n: 'Alemania', bandera: '🇩🇪', fuerza: 87 },
    { id: 'ita', n: 'Italia', bandera: '🇮🇹', fuerza: 86 },
    { id: 'bel', n: 'Bélgica', bandera: '🇧🇪', fuerza: 85 },
    { id: 'cro', n: 'Croacia', bandera: '🇭🇷', fuerza: 84 },
    { id: 'uru', n: 'Uruguay', bandera: '🇺🇾', fuerza: 83 },
    { id: 'col', n: 'Colombia', bandera: '🇨🇴', fuerza: 82 },
    { id: 'mar', n: 'Marruecos', bandera: '🇲🇦', fuerza: 81 },
    { id: 'sen', n: 'Senegal', bandera: '🇸🇳', fuerza: 80 },
    { id: 'jpn', n: 'Japón', bandera: '🇯🇵', fuerza: 79 },
    { id: 'mex', n: 'México', bandera: '🇲🇽', fuerza: 79 },
    { id: 'nga', n: 'Nigeria', bandera: '🇳🇬', fuerza: 79 },
    { id: 'usa', n: 'Estados Unidos', bandera: '🇺🇸', fuerza: 78 },
    { id: 'srb', n: 'Serbia', bandera: '🇷🇸', fuerza: 78 },
    { id: 'chi', n: 'Chile', bandera: '🇨🇱', fuerza: 76 },
    { id: 'egy', n: 'Egipto', bandera: '🇪🇬', fuerza: 76 },
    { id: 'uru2', n: 'Paraguay', bandera: '🇵🇾', fuerza: 74 },
    { id: 'ecu', n: 'Ecuador', bandera: '🇪🇨', fuerza: 77 }
  ];
  const NACIONES_MAP = {};
  NACIONES.forEach(function (n) { NACIONES_MAP[n.id] = n; });
  const LIGA_DE_NACION = { arg: 'arg', esp: 'esp', ing: 'ing', ita: 'ita', ale: 'ale', fra: 'fra' };

  /* ---------------- tácticas ---------------- */
  const TACTICAS = [
    { id: 'presion', n: 'Presión alta', icon: '🔥', desc: 'Recuperás rápido, pero dejás espacios.', atk: 3, def: -2, goles: 1.06, riesgo: 1.10, invol: 1.06 },
    { id: 'posesion', n: 'Posesión', icon: '🎛️', desc: 'Dominás la pelota y generás juego.', atk: 2, def: 2, goles: 0.99, riesgo: 0.94, invol: 1.12 },
    { id: 'contra', n: 'Contraataque', icon: '⚡', desc: 'Espacios para correr: menos volumen, más daño.', atk: 1, def: 1, goles: 1.04, riesgo: 1.00, invol: 0.96 },
    { id: 'bloque', n: 'Bloque bajo', icon: '🛡️', desc: 'Cerrás el arco y apostás al error rival.', atk: -3, def: 5, goles: 0.85, riesgo: 0.80, invol: 0.90 }
  ];

  /* ---------------- entrenamiento ---------------- */
  const ENTRENAMIENTOS = [
    { id: 'fisico', n: 'Físico', icon: '🏃', desc: 'Ritmo, fuerza y fondo.', attrs: { ritmo: 1, aceleracion: 1, resistencia: 1.3, fuerza: 1, salto: .8, agilidad: .7 } },
    { id: 'tecnico', n: 'Técnico', icon: '🎾', desc: 'Control, regate y técnica.', attrs: { tecnica: 1.25, control: 1.15, regate: 1, agilidad: .8, paseCorto: .6 } },
    { id: 'definicion', n: 'Definición', icon: '🎯', desc: 'Remate, cabeza y sangre fría.', attrs: { definicion: 1.35, tiroLejano: 1, cabeceo: .9, penales: .7, compostura: .6 } },
    { id: 'creacion', n: 'Creación', icon: '✨', desc: 'Pase, visión y decisión.', attrs: { paseCorto: 1.2, paseLargo: 1.1, vision: 1.25, decision: .9, tecnica: .5 } },
    { id: 'defensa', n: 'Defensa', icon: '🛡️', desc: 'Marca, quite y anticipación.', attrs: { marca: 1.25, entrada: 1.15, intercepcion: 1.05, anticipacion: .9, posicionamiento: .8, fuerza: .6 } },
    { id: 'mental', n: 'Mental', icon: '🧠', desc: 'Cabeza fuerte para los momentos grandes.', attrs: { compostura: 1.1, decision: 1, liderazgo: .9, concentracion: 1, trabajoEquipo: .7 }, riesgo: -0.25 },
    { id: 'recuperacion', n: 'Recuperación', icon: '❄️', desc: 'Descanso activo: recuperás energía y bajás el riesgo.', attrs: { resistencia: .35 }, recupera: true }
  ];
  const INTENSIDADES = [
    { id: 'suave', n: 'Suave', desc: 'Poco riesgo', mult: 0.65, fatiga: 4, riesgo: 0.4 },
    { id: 'normal', n: 'Normal', desc: 'Equilibrado', mult: 1, fatiga: 9, riesgo: 1 },
    { id: 'intensa', n: 'Intensa', desc: 'Máximo riesgo', mult: 1.38, fatiga: 16, riesgo: 2.1 }
  ];

  /* ---------------- staff ---------------- */
  const STAFF = [
    { id: 'fisico', n: 'Preparador físico', icon: '🏋️', desc: '+7% de ganancia física y -8% de lesiones por nivel.', costo: 140, max: 5 },
    { id: 'nutri', n: 'Nutricionista', icon: '🥗', desc: '+8% de recuperación física por nivel.', costo: 110, max: 5 },
    { id: 'psico', n: 'Psicólogo', icon: '🧘', desc: '+3 de moral por nivel y +6% de entrenamiento mental.', costo: 95, max: 5 },
    { id: 'tecnico', n: 'Entrenador personal', icon: '📋', desc: '+6% de ganancia técnica y +3% de XP por nivel.', costo: 165, max: 5 }
  ];

  /* ---------------- dificultad y roles ---------------- */
  const DIFICULTADES = [
    { id: 'facil', n: 'Semilla', desc: 'Más atributos y progresión. Para disfrutar la historia.', bonus: 5, xp: 1.20, mercado: 1.15 },
    { id: 'normal', n: 'Profesional', desc: 'La experiencia equilibrada. Cada decisión pesa.', bonus: 0, xp: 1.00, mercado: 1.00 },
    { id: 'dificil', n: 'Leyenda', desc: 'Sin regalos. Cada punto de OVR se suda.', bonus: -5, xp: 0.86, mercado: 0.90 }
  ];
  const ROLES = [
    { min: 8, id: 'estrella', n: 'Estrella', icon: '⭐', minMin: 85, maxMin: 90, color: '#F5C451' },
    { min: 3, id: 'titular', n: 'Titular', icon: '🟢', minMin: 72, maxMin: 90, color: '#25E06E' },
    { min: -3, id: 'rotacion', n: 'Rotación', icon: '🟡', minMin: 48, maxMin: 80, color: '#B8FF2E' },
    { min: -9, id: 'suplente', n: 'Suplente', icon: '🟠', minMin: 16, maxMin: 44, color: '#FF9A4D' },
    { min: -99, id: 'reserva', n: 'Reserva', icon: '🔴', minMin: 0, maxMin: 14, color: '#FF5F6D' }
  ];

  /* ---------------- nombres sintéticos ---------------- */
  const NOMBRES = {
    esp: {
      n: ['Sergio', 'Álvaro', 'Pablo', 'Iker', 'Marco', 'Hugo', 'Diego', 'Javier', 'Rodrigo', 'Adrián', 'Unai', 'Nico', 'Aitor', 'Iago', 'Bruno', 'Mateo', 'Gonzalo', 'Víctor', 'Raúl', 'Luis'],
      a: ['García', 'Martínez', 'López', 'Sánchez', 'Rodríguez', 'Fernández', 'Pérez', 'Gómez', 'Ruiz', 'Díaz', 'Torres', 'Navarro', 'Moreno', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez', 'Serrano', 'Blanco', 'Molina']
    },
    ing: {
      n: ['Harry', 'Jack', 'Callum', 'Ollie', 'Mason', 'Phil', 'Declan', 'Bukayo', 'Cole', 'James', 'Tyler', 'Ethan', 'Lewis', 'Aaron', 'Reece', 'Ben', 'Conor', 'Jude', 'Marcus', 'Kai'],
      a: ['Walker', 'Bennett', 'Foster', 'Hughes', 'Turner', 'Collins', 'Wright', 'Baker', 'Hall', 'Young', 'King', 'Scott', 'Green', 'Adams', 'Nelson', 'Clarke', 'Mitchell', 'Roberts', 'Carter', 'Phillips']
    },
    ita: {
      n: ['Luca', 'Marco', 'Alessandro', 'Matteo', 'Davide', 'Federico', 'Lorenzo', 'Nicolò', 'Andrea', 'Gianluca', 'Riccardo', 'Tommaso', 'Filippo', 'Simone', 'Gabriele', 'Edoardo', 'Pietro', 'Stefano', 'Antonio', 'Michele'],
      a: ['Rossi', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri']
    },
    ale: {
      n: ['Lukas', 'Jonas', 'Tim', 'Florian', 'Maximilian', 'Felix', 'Nico', 'Leon', 'Julian', 'David', 'Marvin', 'Tobias', 'Sebastian', 'Philipp', 'Fabian', 'Moritz', 'Jannik', 'Elias', 'Noah', 'Paul'],
      a: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Schulz', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger']
    },
    fra: {
      n: ['Hugo', 'Théo', 'Lucas', 'Enzo', 'Nathan', 'Mathis', 'Noah', 'Jules', 'Adam', 'Yanis', 'Rayan', 'Ethan', 'Gabriel', 'Louis', 'Arthur', 'Baptiste', 'Clément', 'Maxime', 'Antoine', 'Kylian'],
      a: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier']
    },
    arg: {
      n: ['Lautaro', 'Julián', 'Enzo', 'Alejandro', 'Thiago', 'Valentín', 'Franco', 'Nicolás', 'Facundo', 'Santiago', 'Matías', 'Agustín', 'Tomás', 'Joaquín', 'Benjamín', 'Lucas', 'Máximo', 'Ignacio', 'Ramiro', 'Emiliano'],
      a: ['González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Pérez', 'Gómez', 'Díaz', 'Álvarez', 'Romero', 'Sosa', 'Torres', 'Ruiz', 'Ramírez', 'Flores', 'Acosta', 'Benítez', 'Medina', 'Herrera', 'Aguirre']
    }
  };

  const NACION_A_POOL = {
    esp: 'esp', arg: 'arg', uru: 'arg', chi: 'arg', col: 'arg', par: 'arg', ecu: 'arg', mex: 'arg',
    ing: 'ing', ita: 'ita', ale: 'ale', fra: 'fra', bel: 'fra', por: 'fra', bra: 'fra',
    hol: 'ale', cro: 'ale', srb: 'ale', mar: 'fra', sen: 'fra', nga: 'fra', egy: 'fra',
    jpn: 'esp', usa: 'ing', uru2: 'arg'
  };

  global.DATOS = {
    ATRIBUTOS, ORDEN_ATRIBUTOS, CATEGORIAS,
    POSICIONES, ORDEN_POSICIONES,
    ARQUETIPOS, ORDEN_ARQUETIPOS,
    RAMAS, ORDEN_RAMAS, HABILIDADES, RASGOS, COSTO_TIER, NIVEL_TIER,
    LIGAS, LIGAS_MAP, CLUBES, clubPorId, ligaPorId,
    NACIONES, NACIONES_MAP, LIGA_DE_NACION,
    TACTICAS, ENTRENAMIENTOS, INTENSIDADES, STAFF, DIFICULTADES, ROLES,
    NOMBRES, NACION_A_POOL
  };
})(typeof window !== 'undefined' ? window : globalThis);
