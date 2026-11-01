require('../js/datos.js');
require('../js/motor.js');
require('../js/partido.js');
require('../js/juego.js');
const D = globalThis.DATOS, M = globalThis.Motor, J = globalThis.Juego;

const store = {};
global.localStorage = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
  setItem(k, v) { store[k] = String(v); },
  removeItem(k) { delete store[k]; }
};

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
M.setRandom(mulberry32(987654));

const datos = { nombre: 'Lautaro', apellido: 'Pérez', nacionalidad: 'arg', posicion: 'DC', arquetipo: 'killer', dificultad: 'normal' };
const ofertas = J.ofertasIniciales(datos);
console.log('Ofertas iniciales:', ofertas.map(o => o.club.nombre + ' (' + o.club.fuerza + ') rol ' + o.rol.n + ' ~' + o.minutos + 'min $' + o.oferta.salario + 'K').join(' | '));
J.firmarPrimerClub(ofertas[0].oferta.id);
let j = J.estado.jugador;
console.log('Firmado con', J.clubActual().nombre, 'OVR', M.ovrJugador(j), 'pot', j.potencial, 'plata', j.dinero);

const prioridad = { killer: ['ata', 'fis', 'tec'], pibe: ['cre', 'tec', 'men'] };
const ramas = prioridad.killer;

function comprarHabilidades() {
  let compradas = 0;
  for (let intento = 0; intento < 8; intento++) {
    const disponibles = D.HABILIDADES.filter(h => J.puedeDesbloquear(h.id).ok && ramas.indexOf(h.rama) >= 0);
    if (!disponibles.length) break;
    disponibles.sort((a, b) => a.tier - b.tier || a.costo - b.costo);
    const h = disponibles[0];
    const r = J.desbloquear(h.id);
    if (r.ok) compradas++;
  }
  return compradas;
}

function elegirFoco() {
  if (j.lesion) return 'mental';
  if (j.condicion < 55) return 'recuperacion';
  return J.focoSugerido();
}

const historial = [];
for (let temp = 1; temp <= 6; temp++) {
  let partidos = 0, goles = 0, asis = 0, mvps = 0, suma = 0, mins = 0, jugados = 0;
  while (J.estado.mundo.fase === 'temporada') {
    J.estado.jugador.foco = elegirFoco();
    const tr = J.entrenar(J.estado.jugador.foco, 'normal', true);
    if (tr.error && !tr.error.includes('Ya entrenaste')) console.log('ERROR ENTRENO', tr.error);
    const p = J.simularPartido();
    if (!p) { console.log('SIN PARTIDO semana', J.estado.mundo.semana); break; }
    J.terminarPartido(p);
    partidos++;
    if (p.stats.minutos > 0) { jugados++; goles += p.stats.goles; asis += p.stats.asistencias; suma += p.rating; mins += p.stats.minutos; }
    if (p.mvp) mvps++;
    comprarHabilidades();
    J.avanzarSemana();
  }
  const res = J.estado.mundo.resumenTemporada;
  j = J.estado.jugador;
  historial.push({ temp, edad: j.edad, ovr: M.ovrJugador(j), nivel: j.nivel, pts: j.puntos, goles, asis, mvps, prom: jugados ? (suma / jugados).toFixed(2) : '-', mins, dinero: Math.round(j.dinero), valor: j.valor, pos: res ? res.posClub : '-', premios: res ? res.premios.map(p => p.nombre).join(', ') : '', balon: res ? res.balon.ganador : false });
  const h = historial[historial.length - 1];
  console.log('T' + temp, 'edad', h.edad, 'OVR', h.ovr, 'niv', h.nivel, 'G/A', h.goles + '/' + h.asis, 'MVP', h.mvps, 'nota', h.prom, 'min', h.mins, 'pos', h.pos, 'valor', h.valor, 'plata', h.dinero, h.premios ? '| ' + h.premios : '');

  // mercado
  if (res && res.ofertas && res.ofertas.length) {
    const ovr = M.ovrJugador(j);
    const actual = J.clubActual();
    const buenas = res.ofertas.filter(o => o.motivo !== 'renovacion').map(o => {
      const c = D.clubPorId(o.clubId); const rol = M.roleDe(ovr, c);
      return { o, c, rol };
    }).filter(x => x.c.prestigio > actual.prestigio + 2 && ['estrella', 'titular', 'rotacion'].indexOf(x.rol.id) >= 0)
      .sort((a, b) => b.c.prestigio - a.c.prestigio);
    if (buenas.length) {
      const { o, c, rol } = buenas[0];
      console.log('  Ficha por', c.nombre, c.fuerza, '(' + rol.n + ') desde', actual.nombre, actual.fuerza);
      J.firmarOferta(o.id);
    } else J.quedarse();
  } else J.quedarse();
  if (temp < 6) {
    J.comenzarNuevaTemporada();
    console.log('  Nueva temporada', J.estado.mundo.anyo, J.clubActual().nombre, 'OVR', M.ovrJugador(J.estado.jugador), 'pot', J.estado.jugador.potencial);
  }
}
console.log('\nHISTORIAL');
historial.forEach(h => console.log('T' + h.temp, h.edad + 'a', 'OVR ' + h.ovr, h.goles + 'G/' + h.asis + 'A', 'nota ' + h.prom, h.premios || '-'));
console.log('\nPalmares:', J.estado.jugador.palmares.map(p => p.anyo + ' ' + p.nombre).join(' | '));
console.log('Premios:', J.estado.jugador.premios.map(p => p.anyo + ' ' + p.nombre).join(' | '));
console.log('Legado:', J.legado());
console.log('Habilidades', J.estado.jugador.habilidades.length, 'rasgos', J.estado.jugador.rasgos.join(','));
