require('../js/datos.js');
require('../js/motor.js');
require('../js/partido.js');
require('../js/juego.js');
const D = globalThis.DATOS, M = globalThis.Motor, J = globalThis.Juego;
const store = {};
global.localStorage = { getItem(k) { return store[k] || null; }, setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
M.setRandom(mulberry32(555));

const ofertas = J.ofertasIniciales({ nombre: 'Lautaro', apellido: 'Pérez', nacionalidad: 'arg', posicion: 'DC', arquetipo: 'killer', dificultad: 'normal' });
J.firmarPrimerClub(ofertas[0].oferta.id);

let totalMomentos = 0, golesMomentos = 0, partidos = 0;
for (let w = 0; w < 20; w++) {
  J.autoEntrenar();
  const p = J.jugarPartido({ auto: false });
  if (!p) break;
  partidos++;
  const pendientes = p.momentos.slice();
  const elegidas = [];
  for (const m of pendientes) {
    const op = m.opciones[Math.floor(Math.random() * m.opciones.length)];
    const res = M.resolverMomento(p, m.id, op.id);
    if (!res) { console.log('RES NULL', m.id); continue; }
    totalMomentos++;
    if (res.tipo === 'gol') golesMomentos++;
    elegidas.push(m.tipo + ':' + op.id + ':' + res.tipo);
  }
  M.finalizarPartido(p);
  const gf = p.eventos.filter(e => e.tipo === 'gol' && e.lado === 'fav' && !e.anulado).length;
  const gc = p.eventos.filter(e => e.tipo === 'gol' && e.lado === 'contra' && !e.anulado).length;
  const evGoles = p.eventos.filter(e => e.tipo === 'gol' && !e.anulado).length;
  if (gf !== p.golesFav || gc !== p.golesContra) console.log('MISMATCH', gf, p.golesFav, gc, p.golesContra);
  if (gf + gc !== evGoles) console.log('DUP GOLES', gf, gc, evGoles);
  if (p.momentos.some(m => !m.resuelto)) console.log('MOMENTO SIN RESOLVER');
  if (w < 4) console.log('P' + (w + 1), p.club.corto + '-' + p.rival.corto, p.golesFav + '-' + p.golesContra, 'min', p.stats.minutos, 'rating', p.rating, 'momentos', pendientes.length, elegidas.join(' | '));
  J.terminarPartido(p);
  J.avanzarSemana();
}
console.log('Partidos', partidos, 'momentos', totalMomentos, 'goles por momentos', golesMomentos);
console.log('Estado', J.estado.mundo.semana, J.estado.mundo.fase, 'OVR', M.ovrJugador(J.estado.jugador));
console.log('Guardado ok', J.guardar(), 'cargar ok', !!J.cargar());
