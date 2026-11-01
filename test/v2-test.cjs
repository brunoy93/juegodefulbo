require('../js/datos.js');
require('../js/vida-datos.js');
require('../js/motor.js');
require('../js/partido.js');
require('../js/vida.js');
require('../js/juego.js');
const D = globalThis.DATOS, M = globalThis.Motor, J = globalThis.Juego, V = globalThis.VIDA, Vida = globalThis.Vida;

const store = {};
global.localStorage = { getItem(k) { return store[k] || null; }, setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
M.setRandom(mulberry32(424242));

const ofertas = J.ofertasIniciales({ nombre: 'Lautaro', apellido: 'Pérez', nacionalidad: 'arg', posicion: 'DC', arquetipo: 'killer', dificultad: 'normal' });
J.firmarPrimerClub(ofertas[0].oferta.id);
let j = J.estado.jugador;
console.log('inicio', J.clubActual().nombre, 'OVR', M.ovrJugador(j), 'dorsal', j.dorsal, 'agente', j.agente, 'fan', j.fanatismo, 'dt', j.confianzaDT, 'legado', j.legadoClub);
console.log('ofertas clausulas', ofertas[0].oferta.clausula, ofertas[0].oferta.primaGol, ofertas[0].oferta.primaPartido, ofertas[0].oferta.primaFidelidad);

for (let w = 1; w <= 6; w++) {
  J.entrenar(j.foco, 'normal', true);
  const p = J.jugarPartido({ auto: false });
  if (!p) { console.log('sin partido', w); break; }
  if (p.momentos.length) M.aplicarCharla(p, w % 2 ? 'exigente' : 'motivador');
  p.momentos.forEach(function (m) {
    if (!m.resuelto) M.resolverMomento(p, m.id, m.opciones[Math.floor(M.rnd() * m.opciones.length)].id);
  });
  M.finalizarPartido(p);
  console.log('P' + w, p.club.corto + '-' + p.rival.corto, p.golesFav + '-' + p.golesContra,
    'clima', p.clima.n, 'arb', p.arbitro.n, 'derbi', p.derbi ? p.derbi.n : '-', 'agregado', p.agregado,
    'var', p.varAnulados, 'goles', p.stats.goles, 'rating', p.rating, 'charla', p.charla ? p.charla.id : '-');
  const conVar = p.eventos.filter(e => e.var && e.var.revisado).length;
  const conXY = p.eventos.filter(e => e.tipo === 'gol' || e.tipo === 'ocasion').every(e => e.x != null && e.y != null);
  if (conVar) console.log('  VAR revisados:', conVar);
  if (!conXY) console.log('  FALTA XY');
  J.terminarPartido(p);
  const pend = J.estado.mundo.prensaPendiente;
  if (pend) {
    const resp = pend.preguntas.map(function (q) { return { qid: q.id, op: 0 }; });
    const r = J.responderPrensa(resp);
    console.log('  prensa', r.ok, JSON.stringify(r.efectos), r.media ? r.media.periodico.titular : '-');
    console.log('  redes', J.estado.mundo.media.redes.length, 'fan', Math.round(j.fanatismo), 'dt', Math.round(j.confianzaDT));
  }
  J.avanzarSemana();
}
console.log('records', J.estado.jugador.records);
console.log('legado', J.estado.jugador.legadoClub, Vida.nivelLeyenda(J.estado));
console.log('media', J.estado.mundo.media ? J.estado.mundo.media.periodico.titular : 'no');

// agente
j.dinero += 1000;
console.log('agente', J.contratarAgente('representante'));
// negociación sobre ofertas de invierno
J.estado.mundo.ofertasInvierno = M.generarOfertas(J.estado, 'invierno');
J.estado.mundo.ventanaInvierno = true;
const of = J.estado.mundo.ofertasInvierno.find(o => o.motivo !== 'renovacion') || J.estado.mundo.ofertasInvierno[0];
console.log('oferta antes', of.clubId, of.salario, of.anos, of.clausula, of.primaGol);
console.log('negociar', J.negociarOferta(of.id));
console.log('oferta despues', of.salario, of.anos, of.clausula, of.primaGol);

// VAR: anulación directa
const pv = M.crearPartido(J.estado, { auto: true });
const evv = { min: 10, tipo: 'gol', lado: 'fav', goleador: pv.nombre, asistente: null, jugador: true, texto: 'test', var: { revisado: true, anulado: true, visto: false }, anulado: false, x: 50, y: 50 };
pv.eventos.push(evv); pv.stats.goles = 1;
M.finalizarPartido(pv);
console.log('VAR anulado', evv.anulado, 'golesFav', pv.golesFav, 'statsGoles', pv.stats.goles, 'varAnulados', pv.varAnulados);
console.log('errores', globalThis.window ? globalThis.window.__errores : 'n/a');
