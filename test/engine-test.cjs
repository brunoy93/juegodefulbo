require('../js/datos.js');
require('../js/motor.js');
require('../js/partido.js');
const D = globalThis.DATOS, M = globalThis.Motor;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
M.setRandom(mulberry32(12345));

function crearJugador(arq, pos, dif) {
  return {
    nombre: 'Lautaro', apellido: 'Pérez', nacionalidad: 'arg', posicion: pos, arquetipo: arq, dificultad: dif,
    edad: 17, nivel: 1, xp: 0, xpTotal: 0, puntos: 0,
    atributos: M.atributosIniciales(arq, dif), potencial: M.potencialInicial(dif),
    moral: 60, condicion: 100, forma: [], reputacion: 5, dinero: 0,
    clubId: 'arg_19', contrato: { salario: 5, hasta: 2026, rol: 'suplente' },
    estadisticasTemporada: M.estadisticasVacias(),
    estadisticasCarrera: { pj: 0, goles: 0, asistencias: 0, ratingSuma: 0, mvp: 0, temporadas: 0 },
    habilidades: [], rasgos: [], premios: [], palmares: [], historial: [],
    seleccion: { caps: 0, goles: 0, debut: false, torneos: [] },
    staff: { fisico: 0, nutri: 0, psico: 0, tecnico: 0 },
    lesion: null, sancion: 0, entrenoHecho: false, tactica: 'posesion', retirado: false
  };
}

function simularTemporada(j, verbose) {
  const estado = { jugador: j, mundo: {} };
  M.iniciarMundo(estado);
  const ratings = [];
  let goles = 0, asis = 0, pj = 0, mvp = 0, minutos = 0;
  for (let w = 1; w <= 38; w++) {
    estado.mundo.semana = w;
    const p = M.crearPartido(estado, { auto: true });
    if (!p) { console.log('sin partido en semana', w); break; }
    M.finalizarPartido(p);
    M.registrarResultadoJugador(estado, p);
    M.simularJornada(estado);
    if (p.stats.minutos > 0) { pj++; ratings.push(p.rating); minutos += p.stats.minutos; }
    goles += p.stats.goles; asis += p.stats.asistencias; if (p.mvp) mvp++;
    j.condicion = Math.max(0, j.condicion - p.costoFisico);
    j.moral = Math.max(0, Math.min(100, j.moral + p.costoMoral));
    if (p.lesion) j.lesion = p.lesion;
    if (p.stats.rojas) j.sancion = 2;
    M.recuperarSemana(estado);
    if (verbose) console.log('J' + w, p.club.corto + '-' + p.rival.corto, p.golesFav + '-' + p.golesContra,
      'min', p.stats.minutos, 'rating', p.rating, 'goles', p.stats.goles,
      'xg', p.xgFav.toFixed(2) + '/' + p.xgContra.toFixed(2), p.mvp ? 'MVP' : '');
  }
  const tabla = M.tabla(estado, 'arg');
  const fila = tabla.find(r => r.club.id === j.clubId);
  if (verbose) {
    console.log('\nTabla arg top 6:');
    tabla.slice(0, 6).forEach(r => console.log(r.pos, r.club.nombre, r.pj, r.pts, r.dg));
    console.log('Tu club:', fila.pos, fila.pts, 'pts');
  }
  const goleadores = M.goleadores(estado, 'arg').slice(0, 6);
  if (verbose) console.log('Goleadores:', goleadores.map(g => g.nombre + ' ' + g.goles).join(' | '));
  console.log('RESUMEN', { pj, goles, asis, mvp, minutos, prom: (ratings.reduce((a, b) => a + b, 0) / Math.max(1, ratings.length)).toFixed(2), cond: Math.round(j.condicion), moral: Math.round(j.moral), lesion: j.lesion ? j.lesion.tipo + '/' + j.lesion.semanas : '-' });
  return { estado, tabla, fila, ratings, goles, asis };
}

console.log('=== KILLER DC normal ===');
console.log('OVR inicial', M.ovrJugador(crearJugador('killer', 'DC', 'normal')), 'potencial', crearJugador('killer', 'DC', 'normal').potencial);
simularTemporada(crearJugador('killer', 'DC', 'normal'), true);

console.log('\n=== PIBE MCO facil ===');
simularTemporada(crearJugador('pibe', 'MCO', 'facil'), false);

console.log('\n=== MURO DFC dificil ===');
simularTemporada(crearJugador('muro', 'DFC', 'dificil'), false);

console.log('\n=== gol promedio por partido en 20 ligas simuladas ===');
let tg = 0, tp = 0;
for (const l of D.LIGAS) {
  let g = 0, p = 0;
  for (let md = 0; md < l.jornadas; md++) for (const f of [0]) { }
  // usar la tabla ya simulada del ultimo estado no es global; simulamos 200 partidos
  for (let i = 0; i < 200; i++) {
    const a = l.clubes[Math.floor(Math.random() * l.clubes.length)];
    const b = l.clubes[Math.floor(Math.random() * l.clubes.length)];
    if (a.id === b.id) continue;
    const r = M.simularPartidoClub(a.id, b.id);
    g += r[0] + r[1]; p++;
  }
  console.log(l.id, 'goles/partido', (g / p).toFixed(2));
  tg += g; tp += p;
}
console.log('global', (tg / tp).toFixed(2));
