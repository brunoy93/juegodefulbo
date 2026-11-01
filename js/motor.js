/* =========================================================
   LEYENDA · motor de mundo, progresión y mercado
   ========================================================= */
(function (global) {
  'use strict';
  const D = global.DATOS;

  /* ---------------- RNG ---------------- */
  let _rand = Math.random;
  function setRandom(fn) { _rand = fn || Math.random; }
  function rnd() { return _rand(); }
  function ri(a, b) { return Math.floor(rnd() * (b - a + 1)) + a; }
  function rf(a, b) { return a + rnd() * (b - a); }
  function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
  function prob(p) { return rnd() < p; }
  function clamp(a, b, v) { return v < a ? a : v > b ? b : v; }
  function sumar(arr) { return arr.reduce(function (a, b) { return a + b; }, 0); }
  function media(arr) { return arr.length ? sumar(arr) / arr.length : 0; }
  function poisson(l) {
    if (l <= 0) return 0;
    const L = Math.exp(-l);
    let k = 0, p = 1;
    do { k++; p *= rnd(); } while (p > L);
    return k - 1;
  }
  function barajar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const k = Math.floor(rnd() * (i + 1));
      const t = a[i]; a[i] = a[k]; a[k] = t;
    }
    return a;
  }
  function redondear(v, d) {
    const f = Math.pow(10, d == null ? 1 : d);
    return Math.round(v * f) / f;
  }

  /* ---------------- jugador ---------------- */
  function ovrJugador(j) {
    const pos = D.POSICIONES[j.posicion];
    let s = 0, t = 0;
    for (const k in pos.pesos) {
      s += (j.atributos[k] || 0) * pos.pesos[k];
      t += pos.pesos[k];
    }
    return Math.round(s / t);
  }
  function mediaForma(j) {
    return j.forma && j.forma.length ? media(j.forma) : 6.5;
  }
  function arqEstilo(j) {
    return D.ARQUETIPOS[j.arquetipo].estilo;
  }
  function potencialEstrellas(p) {
    return clamp(1, 5, Math.round((p - 65) / 6.2));
  }
  function valorMercado(j) {
    const ovr = ovrJugador(j);
    const edad = j.edad;
    let f = 0.55;
    if (edad <= 20) f = 1.25;
    else if (edad <= 23) f = 1.18;
    else if (edad <= 27) f = 1.08;
    else if (edad <= 30) f = 0.9;
    else if (edad <= 33) f = 0.62;
    else f = 0.32;
    const rep = 0.8 + (j.reputacion || 0) / 250;
    const v = 0.42 * Math.exp((ovr - 55) / 5.5) * f * rep;
    return Math.max(0.1, redondear(v, 1));
  }
  function salarioSugerido(ovr, prestigio) {
    const base = 3 + Math.pow(Math.max(0, ovr - 45), 2.05) / 25;
    const factor = 0.4 + Math.pow((prestigio || 60) / 100, 2) * 1.3;
    return Math.max(2, Math.round(base * factor));
  }
  function modsJugador(j) {
    const m = {
      regate: 1, perdidas: 1, recuperacion: 1, duelos: 1, fatiga: 1, energiaMin: 0,
      presion: 1, companeros: 1, clutch: 1, moral: 1, defensa: 1, rivalPrecision: 1,
      xgRival: 1, area: 1, acrobatico: false, instinto: 1, balonParado: 1,
      asistencias: 1, paseFiltrado: 1, paseImposible: false, ocasionExtra: 0
    };
    (j.rasgos || []).forEach(function (id) {
      const r = D.RASGOS[id];
      if (!r) return;
      for (const k in r.mods) {
        const v = r.mods[k];
        if (typeof v === 'boolean') m[k] = v;
        else if (k === 'energiaMin') m[k] = Math.max(m[k], v);
        else if (k === 'ocasionExtra') m[k] += v;
        else m[k] *= v;
      }
    });
    return m;
  }
  function roleDe(ovr, club) {
    const diff = ovr - club.fuerza;
    for (let i = 0; i < D.ROLES.length; i++) if (diff >= D.ROLES[i].min) return D.ROLES[i];
    return D.ROLES[D.ROLES.length - 1];
  }
  function minutosEsperados(j, club) {
    if (j.lesion && j.lesion.semanas > 0) return 0;
    if (j.sancion > 0) return 0;
    const ovr = ovrJugador(j);
    const rol = roleDe(ovr, club);
    let m = ri(rol.minMin, rol.maxMin);
    m += Math.round(clamp(-3, 3, ((j.confianzaDT == null ? 45 : j.confianzaDT) - 50) / 18));
    if (j.capitan) m += 2;
    if (mediaForma(j) >= 7.3) m += 5;
    if (j.moral < 38) m -= 6;
    if (j.condicion < 55) m -= 8;
    return Math.round(clamp(0, 90, m) / 5) * 5;
  }
  function atributosIniciales(arqId, difId) {
    const arq = D.ARQUETIPOS[arqId];
    const dif = D.DIFICULTADES.find(function (d) { return d.id === difId; }) || D.DIFICULTADES[1];
    const a = {};
    D.ORDEN_ATRIBUTOS.forEach(function (k) { a[k] = 62 + ri(-3, 3); });
    for (const k in arq.bono) a[k] += arq.bono[k];
    D.ORDEN_ATRIBUTOS.forEach(function (k) { a[k] = clamp(42, 84, a[k] + dif.bonus); });
    return a;
  }
  function potencialInicial(difId) {
    const extra = difId === 'facil' ? 5 : difId === 'dificil' ? -5 : 0;
    return clamp(68, 96, 75 + ri(0, 13) + extra);
  }
  function xpNecesaria(nivel) {
    return Math.round(30 * Math.pow(nivel, 1.3));
  }
  function edadFactor(edad) {
    if (edad <= 19) return 1.35;
    if (edad <= 22) return 1.2;
    if (edad <= 25) return 1.0;
    if (edad <= 28) return 0.72;
    if (edad <= 30) return 0.48;
    if (edad <= 32) return 0.3;
    return 0.16;
  }

  /* ---------------- mundo ---------------- */
  function nombreSintetico(poolId) {
    const pool = D.NOMBRES[poolId] || D.NOMBRES.esp;
    return pick(pool.n) + ' ' + pick(pool.a);
  }
  function poolDeLiga(ligaId) {
    return { ing: 'ing', esp: 'esp', ita: 'ita', ale: 'ale', fra: 'fra', arg: 'arg' }[ligaId] || 'esp';
  }
  function generarEstrellas(club, ligaId) {
    const pool = poolDeLiga(ligaId);
    return [
      { id: club.id + '_e0', nombre: nombreSintetico(pool), pos: 'DC', rating: clamp(44, 96, club.fuerza + ri(-1, 7)) },
      { id: club.id + '_e1', nombre: nombreSintetico(pool), pos: 'MCO', rating: clamp(42, 95, club.fuerza + ri(-5, 3)) },
      { id: club.id + '_e2', nombre: nombreSintetico(pool), pos: 'ED', rating: clamp(40, 94, club.fuerza + ri(-8, 0)) }
    ];
  }
  function plantilla(estado, clubId) {
    const m = estado.mundo;
    if (!m.plantillas) m.plantillas = {};
    if (!m.plantillas[clubId]) {
      const club = D.clubPorId(clubId);
      const pool = poolDeLiga(club.liga);
      const posis = ['DFC', 'LD', 'DFC', 'MCD', 'MC', 'MCO', 'ED', 'DC', 'EI', 'SD', 'MC'];
      const arr = [];
      for (let i = 0; i < 11; i++) {
        arr.push({
          id: clubId + '_p' + i,
          nombre: nombreSintetico(pool),
          pos: posis[i],
          nivel: clamp(38, 96, club.fuerza + ri(-9, 7) + (i === 7 ? 4 : 0))
        });
      }
      m.plantillas[clubId] = arr;
    }
    return m.plantillas[clubId];
  }

  function iniciarMundo(estado) {
    const m = estado.mundo;
    m.temporada = 1; m.anyo = 2025; m.semana = 1; m.fase = 'temporada';
    m.resultados = {}; m.goleadores = {}; m.estrellas = {}; m.plantillas = {}; m.fixtures = {};
    m.resumenTemporada = null; m.premios = []; m.noticias = m.noticias || [];
    D.LIGAS.forEach(function (l) {
      m.fixtures[l.id] = generarFixture(l.clubes.map(function (c) { return c.id; }));
      m.resultados[l.id] = Array.from({ length: l.jornadas }, function () { return []; });
      m.goleadores[l.id] = [];
      l.clubes.forEach(function (c) { m.estrellas[c.id] = generarEstrellas(c, l.id); });
    });
  }
  function nuevaTemporada(estado) {
    const m = estado.mundo;
    m.temporada += 1; m.anyo += 1; m.semana = 1; m.fase = 'temporada';
    m.resultados = {}; m.goleadores = {}; m.estrellas = {}; m.plantillas = {};
    m.fixtures = {}; m.resumenTemporada = null;
    D.LIGAS.forEach(function (l) {
      m.fixtures[l.id] = generarFixture(l.clubes.map(function (c) { return c.id; }));
      m.resultados[l.id] = Array.from({ length: l.jornadas }, function () { return []; });
      m.goleadores[l.id] = [];
      l.clubes.forEach(function (c) { m.estrellas[c.id] = generarEstrellas(c, l.id); });
    });
    const j = estado.jugador;
    j.estadisticasTemporada = estadisticasVacias();
    j.forma = [];
    j.entrenoHecho = false;
    j.lesion = j.lesion && j.lesion.semanas > 0 ? j.lesion : null;
  }
  function estadisticasVacias() {
    return { pj: 0, goles: 0, asistencias: 0, ratingSuma: 0, mvp: 0, minutos: 0, amarillas: 0, rojas: 0, tiros: 0, pasesClave: 0 };
  }

  function generarFixture(ids) {
    const arr = barajar(ids);
    const n = arr.length;
    const rondas = [];
    for (let r = 0; r < n - 1; r++) {
      const md = [];
      for (let i = 0; i < n / 2; i++) {
        const a = arr[i], b = arr[n - 1 - i];
        md.push(r % 2 === 0 ? [a, b] : [b, a]);
      }
      rondas.push(md);
      arr.splice(1, 0, arr.pop());
    }
    const vuelta = rondas.map(function (md) {
      return md.map(function (p) { return [p[1], p[0]]; });
    });
    return rondas.concat(vuelta);
  }

  function simularPartidoClub(aId, bId) {
    const a = D.clubPorId(aId), b = D.clubPorId(bId);
    if (!a || !b) return [0, 0];
    const fa = 0.94 + rnd() * 0.12, fb = 0.94 + rnd() * 0.12;
    const la = clamp(0.12, 3.9, 1.27 * Math.pow((a.fuerza * fa + 2.4) / (b.fuerza * fb), 2.55));
    const lb = clamp(0.1, 3.7, 1.27 * Math.pow((b.fuerza * fb) / (a.fuerza * fa + 2.4), 2.55) * 0.93);
    return [Math.min(7, poisson(la)), Math.min(7, poisson(lb))];
  }

  function getGoleador(estado, ligaId, id, nombre, clubId) {
    const arr = estado.mundo.goleadores[ligaId];
    let e = arr.find(function (x) { return x.id === id; });
    if (!e) { e = { id: id, nombre: nombre, clubId: clubId, goles: 0, asist: 0 }; arr.push(e); }
    return e;
  }
  function repartirGoles(estado, clubId, goles, ligaId) {
    const stars = estado.mundo.estrellas[clubId];
    if (!stars || goles <= 0) return;
    for (let i = 0; i < goles; i++) {
      const r = rnd();
      const idx = r < 0.47 ? 0 : r < 0.73 ? 1 : r < 0.88 ? 2 : -1;
      if (idx >= 0) {
        const s = stars[idx];
        const e = getGoleador(estado, ligaId, s.id, s.nombre, clubId);
        e.goles++;
        if (rnd() < 0.34) e.asist++;
      }
    }
  }
  function goleadores(estado, ligaId) {
    const arr = (estado.mundo.goleadores[ligaId] || []).map(function (x) { return Object.assign({}, x); });
    const j = estado.jugador;
    const club = D.clubPorId(j.clubId);
    if (club && club.liga === ligaId) {
      arr.push({
        id: 'jugador', nombre: j.nombre + ' ' + j.apellido, clubId: club.id,
        goles: j.estadisticasTemporada.goles, asist: j.estadisticasTemporada.asistencias, esJugador: true
      });
    }
    arr.sort(function (a, b) { return b.goles - a.goles || b.asist - a.asist; });
    return arr;
  }

  function tabla(estado, ligaId) {
    const liga = D.ligaPorId(ligaId);
    const filas = new Map();
    liga.clubes.forEach(function (c) {
      filas.set(c.id, { club: c, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 });
    });
    const fixtures = estado.mundo.fixtures[ligaId] || [];
    const resultados = estado.mundo.resultados[ligaId] || [];
    for (let md = 0; md < fixtures.length; md++) {
      const res = resultados[md] || [];
      fixtures[md].forEach(function (par, i) {
        const r = res[i];
        if (!r) return;
        const A = filas.get(par[0]), B = filas.get(par[1]);
        if (!A || !B) return;
        A.pj++; B.pj++;
        A.gf += r[0]; A.gc += r[1]; B.gf += r[1]; B.gc += r[0];
        if (r[0] > r[1]) { A.g++; B.p++; A.pts += 3; }
        else if (r[0] < r[1]) { B.g++; A.p++; B.pts += 3; }
        else { A.e++; B.e++; A.pts++; B.pts++; }
      });
    }
    const arr = Array.from(filas.values()).map(function (r) {
      r.dg = r.gf - r.gc;
      return r;
    });
    arr.sort(function (a, b) {
      return b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.club.nombre.localeCompare(b.club.nombre);
    });
    arr.forEach(function (r, i) { r.pos = i + 1; });
    return arr;
  }

  function simularJornadaEn(estado, jornada) {
    const m = estado.mundo;
    D.LIGAS.forEach(function (l) {
      if (jornada > l.jornadas) return;
      const fixtures = m.fixtures[l.id][jornada - 1];
      if (!fixtures) return;
      const res = m.resultados[l.id][jornada - 1] || [];
      for (let i = 0; i < fixtures.length; i++) {
        if (res[i]) continue;
        const par = fixtures[i];
        const marcador = simularPartidoClub(par[0], par[1]);
        res[i] = marcador;
        repartirGoles(estado, par[0], marcador[0], l.id);
        repartirGoles(estado, par[1], marcador[1], l.id);
      }
      m.resultados[l.id][jornada - 1] = res;
    });
  }
  function simularJornada(estado) {
    simularJornadaEn(estado, estado.mundo.semana);
  }
  function completarTemporada(estado) {
    const maxJ = Math.max.apply(null, D.LIGAS.map(function (l) { return l.jornadas; }));
    for (let j = 1; j <= maxJ; j++) simularJornadaEn(estado, j);
  }

  function registrarResultadoJugador(estado, partido) {
    const j = estado.jugador;
    const club = D.clubPorId(j.clubId);
    const liga = D.ligaPorId(club.liga);
    const md = estado.mundo.semana - 1;
    const fixtures = estado.mundo.fixtures[liga.id][md];
    if (!fixtures) return;
    const idx = fixtures.findIndex(function (f) { return f[0] === club.id || f[1] === club.id; });
    if (idx < 0) return;
    const local = fixtures[idx][0] === club.id;
    const marcador = local ? [partido.golesFav, partido.golesContra] : [partido.golesContra, partido.golesFav];
    const res = estado.mundo.resultados[liga.id][md] || [];
    res[idx] = marcador;
    estado.mundo.resultados[liga.id][md] = res;
    const rival = D.clubPorId(local ? fixtures[idx][1] : fixtures[idx][0]);
    const golesJugador = partido.stats ? partido.stats.goles : 0;
    repartirGoles(estado, club.id, Math.max(0, partido.golesFav - golesJugador), liga.id);
    repartirGoles(estado, rival.id, partido.golesContra, rival.liga);
  }

  /* ---------------- entrenamiento ---------------- */
  function entrenar(estado, focoId, intId) {
    const j = estado.jugador;
    if (j.entrenoHecho) return { error: 'Ya entrenaste esta semana.' };
    const foco = D.ENTRENAMIENTOS.find(function (f) { return f.id === focoId; }) || D.ENTRENAMIENTOS[0];
    const int = D.INTENSIDADES.find(function (i) { return i.id === intId; }) || D.INTENSIDADES[1];
    const dif = D.DIFICULTADES.find(function (d) { return d.id === j.dificultad; }) || D.DIFICULTADES[1];
    if (j.lesion && j.lesion.semanas > 0 && foco.id !== 'mental' && foco.id !== 'recuperacion') {
      return { error: 'Estás lesionado: solo podés hacer trabajo mental o recuperación.' };
    }
    if (j.condicion < 18 && foco.id !== 'recuperacion') return { error: 'Estás agotado. Necesitás recuperar.' };

    const ganancias = {};
    let total = 0;
    for (const attr in foco.attrs) {
      const actual = j.atributos[attr] || 0;
      const margen = Math.max(0, j.potencial - actual);
      let g = (0.03 + margen * 0.0042) * foco.attrs[attr];
      g *= int.mult;
      g *= edadFactor(j.edad);
      g *= dif.xp;
      if (foco.id === 'fisico') g *= 1 + (j.staff.fisico || 0) * 0.07;
      if (foco.id === 'tecnico' || foco.id === 'creacion' || foco.id === 'definicion') g *= 1 + (j.staff.tecnico || 0) * 0.06;
      if (foco.id === 'mental') g *= 1 + (j.staff.psico || 0) * 0.06;
      if (foco.id === 'mental' && j.lesion) g *= 0.6;
      g *= 0.82 + rnd() * 0.36;
      g = Math.min(g, Math.max(0, j.potencial - actual));
      if (g <= 0) continue;
      ganancias[attr] = (ganancias[attr] || 0) + g;
      j.atributos[attr] = clamp(1, 99, actual + g);
      total += g;
    }

    let xp = Math.round((5 + int.mult * 4) * (1 + (j.staff.tecnico || 0) * 0.03) * dif.xp * (foco.id === 'recuperacion' ? 0.45 : 1));
    if (j.lesion) xp = Math.round(xp * 0.5);
    j.entrenoHecho = true;

    let cond = int.fatiga * (foco.id === 'recuperacion' ? -0.9 : 1);
    cond *= 1 - (j.staff.fisico || 0) * 0.04;
    j.condicion = clamp(0, 100, j.condicion - cond);

    let lesion = null;
    let riesgo = 0.009 * int.riesgo * (foco.id === 'recuperacion' ? 0.15 : 1);
    riesgo *= 1 + (100 - j.condicion) / 260;
    riesgo *= 1 - (j.staff.fisico || 0) * 0.08;
    if (foco.id === 'mental') riesgo *= 0.4;
    if (rnd() < riesgo) {
      lesion = lesionAleatoria();
      j.lesion = lesion;
      j.condicion = clamp(0, 100, j.condicion - 12);
    }
    return {
      foco: foco, intensidad: int, ganancias: ganancias, total: redondear(total, 2),
      xp: xp, condicion: j.condicion, lesion: lesion
    };
  }

  const LESIONES = [
    { n: 'Sobrecarga muscular', p: 34, min: 1, max: 2 },
    { n: 'Esguince de tobillo', p: 24, min: 2, max: 4 },
    { n: 'Desgarro isquiotibial', p: 20, min: 3, max: 6 },
    { n: 'Rotura fibrilar', p: 12, min: 4, max: 8 },
    { n: 'Fractura por estrés', p: 6, min: 6, max: 12 },
    { n: 'Lesión de rodilla', p: 4, min: 8, max: 16 }
  ];
  function lesionAleatoria() {
    let r = rnd() * 100;
    for (let i = 0; i < LESIONES.length; i++) {
      r -= LESIONES[i].p;
      if (r <= 0) {
        const l = LESIONES[i];
        return { tipo: l.n, semanas: ri(l.min, l.max) };
      }
    }
    return { tipo: LESIONES[0].n, semanas: 1 };
  }

  function recuperarSemana(estado) {
    const j = estado.jugador;
    let rec = 23 + (j.staff.nutri || 0) * 4;
    rec *= modsJugador(j).recuperacion;
    if (j.lesion && j.lesion.semanas > 0) rec *= 0.7;
    j.condicion = clamp(0, 100, j.condicion + rec);
    if (j.lesion) {
      j.lesion.semanas = Math.max(0, j.lesion.semanas - 1);
      if (j.lesion.semanas === 0) j.lesion = null;
    }
    if (j.sancion > 0) j.sancion = Math.max(0, j.sancion - 1);
    j.entrenoHecho = false;
    const moralBase = 52 + (j.staff.psico || 0) * 3;
    if (j.moral < moralBase) j.moral = Math.min(moralBase, j.moral + 1);
    j.condicion = Math.min(100, j.condicion);
  }

  /* ---------------- ofertas ---------------- */
  function crearOferta(estado, club, motivo) {
    const j = estado.jugador;
    const ovr = ovrJugador(j);
    const rol = roleDe(ovr, club);
    const agente = (global.VIDA && global.VIDA.AGENTES ? global.VIDA.AGENTES.find(function (a) { return a.id === j.agente; }) : null);
    const salario = salarioSugerido(ovr, club.prestigio) * (1 + (agente ? agente.salario : 0));
    const factor = motivo === 'renovacion' ? 1.12 : 1;
    return {
      id: 'of_' + club.id + '_' + ri(1000, 9999),
      clubId: club.id, salario: Math.round(salario * factor),
      anos: ri(2, 5), rol: rol.id, prima: Math.round(salario * factor * ri(4, 10)),
      clausula: Math.max(1, Math.round(valorMercado(j) * (1.6 + rnd() * 0.9))),
      primaGol: Math.round(salario * (0.12 + rnd() * 0.18)),
      primaPartido: Math.round(salario * (0.03 + rnd() * 0.035)),
      primaFidelidad: Math.round(salario * (2 + rnd() * 2)),
      motivo: motivo || 'temporada'
    };
  }
  function generarOfertas(estado, motivo) {
    const j = estado.jugador;
    const ovr = ovrJugador(j);
    const actual = D.clubPorId(j.clubId);
    const dif = D.DIFICULTADES.find(function (d) { return d.id === j.dificultad; }) || D.DIFICULTADES[1];
    const agente = (global.VIDA && global.VIDA.AGENTES ? global.VIDA.AGENTES.find(function (a) { return a.id === j.agente; }) : null);
    const extraAgente = agente ? agente.ofertas : 0;
    const hi = ovr + Math.round(12 * dif.mercado);
    const lo = ovr - 12;
    const candidatos = Object.keys(D.CLUBES).map(function (id) { return D.CLUBES[id]; }).filter(function (c) {
      return c.id !== actual.id && c.fuerza >= lo && c.fuerza <= hi;
    }).map(function (c) {
      return {
        club: c,
        score: c.prestigio * 0.55 + (46 - Math.abs(c.fuerza - ovr)) * 1.5 + rnd() * 34 + (j.reputacion || 0) * 0.25
      };
    }).sort(function (a, b) { return b.score - a.score; });

    const elegidos = candidatos.slice(0, 5 + extraAgente).map(function (x) { return x.club; });
    const ofertas = elegidos.map(function (c) { return crearOferta(estado, c, motivo); });
    if (motivo !== 'invierno') ofertas.unshift(crearOferta(estado, actual, 'renovacion'));
    return ofertas;
  }
  function ofertasIniciales(estado) {
    const j = estado.jugador;
    const ligaId = D.LIGA_DE_NACION[j.nacionalidad] || (rnd() < 0.55 ? 'arg' : pick(['esp', 'ita', 'fra', 'ale', 'ing']));
    const liga = D.ligaPorId(ligaId);
    const ovr = ovrJugador(j);
    const candidatos = liga.clubes.slice().sort(function (a, b) { return a.fuerza - b.fuerza; }).slice(0, 6);
    const elegidos = barajar(candidatos).slice(0, 3);
    const dif = D.DIFICULTADES.find(function (d) { return d.id === j.dificultad; }) || D.DIFICULTADES[1];
    return elegidos.map(function (c) {
      const rol = roleDe(ovr + (dif.id === 'facil' ? 2 : 0), c);
      return {
        id: 'ini_' + c.id, clubId: c.id,
        salario: salarioSugerido(ovr, c.prestigio),
        anos: ri(2, 4), rol: rol.id,
        prima: Math.round(salarioSugerido(ovr, c.prestigio) * ri(2, 4)),
        clausula: Math.max(1, Math.round(valorMercado(j) * (1.8 + rnd() * 1.2))),
        primaGol: Math.round(salarioSugerido(ovr, c.prestigio) * 0.15),
        primaPartido: Math.round(salarioSugerido(ovr, c.prestigio) * 0.04),
        primaFidelidad: Math.round(salarioSugerido(ovr, c.prestigio) * 2),
        motivo: 'inicial'
      };
    });
  }

  /* ---------------- premios y temporada ---------------- */
  function agregarPalmares(j, tipo, nombre, anyo, club) {
    j.palmares.push({ tipo: tipo, nombre: nombre, anyo: anyo, club: club || null });
  }
  function agregarPremio(j, id, nombre, anyo, detalle) {
    j.premios.push({ id: id, nombre: nombre, anyo: anyo, detalle: detalle || '' });
  }

  function simularCopa(estado, ligaId, posClub) {
    const club = D.clubPorId(estado.jugador.clubId);
    const liga = D.ligaPorId(ligaId);
    const rondas = ['16avos de final', 'Octavos de final', 'Cuartos de final', 'Semifinal', 'Final'];
    const rivales = barajar(liga.clubes.filter(function (c) { return c.id !== club.id; }));
    let ronda = 0;
    let campeon = false;
    for (ronda = 0; ronda < 5; ronda++) {
      const rival = rivales[ronda % rivales.length];
      let p = 0.5 + (club.fuerza - rival.fuerza) / 75;
      if (posClub <= 6) p += 0.06;
      p = clamp(0.14, 0.86, p);
      if (rnd() < p) {
        if (ronda === 4) campeon = true;
      } else {
        break;
      }
    }
    return {
      nombre: 'Copa de ' + liga.pais,
      campeon: campeon,
      ronda: campeon ? 'Campeón' : rondas[Math.min(4, ronda)],
      eliminado: !campeon
    };
  }
  function simularContinental(estado, ligaId, posClub) {
    const club = D.clubPorId(estado.jugador.clubId);
    const liga = D.ligaPorId(ligaId);
    let nombre = null, cupo = false;
    if (liga.id === 'arg') {
      if (posClub <= 6) { nombre = 'Copa Libertadores'; cupo = true; }
    } else {
      if (posClub <= 4) { nombre = 'Champions League'; cupo = true; }
      else if (posClub <= 6) { nombre = 'Europa League'; cupo = true; }
    }
    if (!cupo) return { nombre: null, clasificado: false, campeon: false, ronda: null };
    const rondas = ['Fase de liga', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];
    let ronda = 0, campeon = false;
    for (ronda = 0; ronda < 5; ronda++) {
      const rivalFuerza = 76 + ronda * 3 + ri(-4, 4);
      let p = 0.5 + (club.fuerza - rivalFuerza) / 65 + (ovrJugador(estado.jugador) - 75) / 220;
      p = clamp(0.12, 0.86, p);
      if (rnd() < p) {
        if (ronda === 4) campeon = true;
      } else break;
    }
    return { nombre: nombre, clasificado: true, campeon: campeon, ronda: campeon ? 'Campeón' : rondas[Math.min(4, ronda)] };
  }
  function simularSeleccion(estado) {
    const j = estado.jugador;
    const s = j.estadisticasTemporada;
    const ovr = ovrJugador(j);
    const nacion = D.NACIONES_MAP[j.nacionalidad] || D.NACIONES_MAP.arg;
    const añoFinal = estado.mundo.anyo + 1;
    const elegible = ovr >= 74 || j.reputacion >= 55;
    if (!elegible) return { convocado: false, torneo: null, campeon: false, caps: 0, goles: 0, nacion: nacion };
    const caps = ri(2, 6);
    const goles = Math.max(0, Math.round(caps * (s.goles / Math.max(6, s.pj)) * 0.55));
    j.seleccion.caps += caps;
    j.seleccion.goles += goles;
    if (!j.seleccion.debut && caps > 0) {
      j.seleccion.debut = true;
      j.reputacion = clamp(0, 100, j.reputacion + 2);
    }
    let torneo = null, campeon = false;
    const participa = ovr >= 78 || j.reputacion >= 68;
    if (participa && (añoFinal % 4 === 2 || añoFinal % 4 === 0)) {
      torneo = añoFinal % 4 === 2 ? 'Copa del Mundo' : (['arg', 'bra', 'uru', 'col', 'chi', 'ecu', 'uru2'].indexOf(nacion.id) >= 0 ? 'Copa América' : 'Eurocopa');
      const fuerza = nacion.fuerza + clamp(-4, 6, (ovr - 75) * 0.35);
      let ronda = 0;
      for (ronda = 0; ronda < 4; ronda++) {
        const rival = 82 + ronda * 2 + ri(-3, 4);
        const p = clamp(0.15, 0.9, 1 / (1 + Math.pow(10, (rival - fuerza) / 13)));
        if (rnd() < p) { if (ronda === 3) campeon = true; } else break;
      }
      j.seleccion.torneos.push({ nombre: torneo, anyo: añoFinal, campeon: campeon });
      if (campeon) {
        agregarPalmares(j, 'seleccion', torneo, añoFinal, nacion.n);
        j.reputacion = clamp(0, 100, j.reputacion + 9);
      }
    }
    return { convocado: true, torneo: torneo, campeon: campeon, caps: caps, goles: goles, nacion: nacion };
  }

  function calcularPremios(estado, tablaFinal) {
    const j = estado.jugador;
    const s = j.estadisticasTemporada;
    const club = D.clubPorId(j.clubId);
    const liga = D.ligaPorId(club.liga);
    const prom = s.pj ? s.ratingSuma / s.pj : 0;
    const fila = tablaFinal.find(function (r) { return r.club.id === club.id; });
    const pos = fila ? fila.pos : 10;
    const lista = goleadores(estado, liga.id);
    const maxGoles = lista.length ? Math.max.apply(null, lista.map(function (g) { return g.goles; })) : 0;
    const premios = [];
    const año = estado.mundo.anyo + 1;
    if (s.goles > 0 && s.goles >= maxGoles) {
      premios.push({ id: 'goleador', nombre: 'Máximo goleador · ' + liga.nombre, detalle: s.goles + ' goles' });
      agregarPremio(j, 'goleador_' + liga.id, 'Máximo goleador', año, liga.nombre);
    }
    if (prom >= 7.0 && pos <= 6 && s.pj >= 20) {
      premios.push({ id: 'mvp', nombre: 'MVP · ' + liga.nombre, detalle: prom.toFixed(2) + ' de media' });
      agregarPremio(j, 'mvp_' + liga.id, 'MVP de la liga', año, liga.nombre);
    }
    if (j.edad <= 21 && prom >= 6.75 && s.pj >= 15) {
      premios.push({ id: 'joven', nombre: 'Mejor jugador joven', detalle: 'Promesa del año' });
      agregarPremio(j, 'joven', 'Mejor jugador joven', año, liga.nombre);
    }
    if (prom >= 6.85 && s.pj >= 20) {
      premios.push({ id: 'equipo', nombre: 'Equipo ideal de la temporada', detalle: liga.nombre });
      agregarPremio(j, 'equipo', 'Equipo ideal', año, liga.nombre);
    }
    premios.forEach(function (p) { j.reputacion = clamp(0, 100, j.reputacion + (p.id === 'mvp' ? 4 : p.id === 'goleador' ? 3 : 1.5)); });
    return premios;
  }

  function calcularBalon(estado, trofeos) {
    const j = estado.jugador;
    const s = j.estadisticasTemporada;
    const prom = s.pj ? s.ratingSuma / s.pj : 0;
    const club = D.clubPorId(j.clubId);
    const liga = D.ligaPorId(club.liga);
    const año = estado.mundo.anyo + 1;
    const top = [];
    Object.keys(D.CLUBES).forEach(function (id) {
      const c = D.CLUBES[id];
      if (c.prestigio < 84) return;
      const stars = estado.mundo.estrellas[c.id];
      if (!stars) return;
      const st = stars[0];
      const g = (estado.mundo.goleadores[c.liga].find(function (x) { return x.id === st.id; }) || {}).goles || 0;
      top.push({
        nombre: st.nombre, club: c.nombre, liga: c.liga,
        score: 7.35 * 8 + g * 1.35 + c.prestigio * 0.05 + ri(0, 18)
      });
    });
    top.sort(function (a, b) { return b.score - a.score; });
    const mejor = top[0] || { nombre: 'Un crack', score: 80 };
    const score = prom * 8 + s.goles * 1.35 + s.asistencias * 0.8 + (j.reputacion || 0) * 0.14 + trofeos * 9 + liga.prestigio * 0.12;
    if (j.reputacion >= 65 && prom >= 7.1 && score >= mejor.score) {
      agregarPremio(j, 'balon', 'Balón de Oro', año, 'Mejor jugador del mundo');
      j.reputacion = clamp(0, 100, j.reputacion + 10);
      return { ganador: true, nombre: j.nombre + ' ' + j.apellido, score: score, rival: mejor };
    }
    return { ganador: false, nombre: mejor.nombre, club: mejor.club, score: score, rival: mejor };
  }

  function finTemporada(estado) {
    const m = estado.mundo;
    if (m.resumenTemporada) return m.resumenTemporada;
    const j = estado.jugador;
    const club = D.clubPorId(j.clubId);
    const liga = D.ligaPorId(club.liga);
    completarTemporada(estado);
    const tablaFinal = tabla(estado, liga.id);
    const fila = tablaFinal.find(function (r) { return r.club.id === club.id; });
    const posClub = fila ? fila.pos : 10;
    const premios = calcularPremios(estado, tablaFinal);
    const copa = simularCopa(estado, liga.id, posClub);
    const continental = simularContinental(estado, liga.id, posClub);
    const año = m.anyo + 1;

    if (posClub === 1) {
      agregarPalmares(j, 'liga', liga.nombre, año, club.nombre);
      j.reputacion = clamp(0, 100, j.reputacion + 8);
    }
    if (copa.campeon) {
      agregarPalmares(j, 'copa', copa.nombre, año, club.nombre);
      j.reputacion = clamp(0, 100, j.reputacion + 5);
    }
    if (continental.campeon) {
      agregarPalmares(j, 'continental', continental.nombre, año, club.nombre);
      j.reputacion = clamp(0, 100, j.reputacion + 9);
    }
    const seleccion = simularSeleccion(estado);
    let trofeos = (posClub === 1 ? 1 : 0) + (copa.campeon ? 1 : 0) + (continental.campeon ? 1 : 0) + (seleccion.campeon ? 1 : 0);
    const balon = calcularBalon(estado, trofeos);
    if (balon.ganador) trofeos += 1;

    const prom = j.estadisticasTemporada.pj ? j.estadisticasTemporada.ratingSuma / j.estadisticasTemporada.pj : 0;
    j.historial.push({
      temporada: m.temporada, anyo: m.anyo + '/' + String(m.anyo + 1).slice(2),
      club: club.nombre, liga: liga.nombre, pos: posClub,
      pj: j.estadisticasTemporada.pj, goles: j.estadisticasTemporada.goles,
      asistencias: j.estadisticasTemporada.asistencias, promedio: redondear(prom, 2),
      ovr: ovrJugador(j), edad: j.edad
    });
    j.estadisticasCarrera.pj += j.estadisticasTemporada.pj;
    j.estadisticasCarrera.goles += j.estadisticasTemporada.goles;
    j.estadisticasCarrera.asistencias += j.estadisticasTemporada.asistencias;
    j.estadisticasCarrera.ratingSuma += j.estadisticasTemporada.ratingSuma;
    j.estadisticasCarrera.mvp += j.estadisticasTemporada.mvp;
    j.estadisticasCarrera.temporadas += 1;

    const ofertas = generarOfertas(estado, 'temporada');
    const resumen = {
      temporada: m.temporada, anyo: m.anyo, liga: liga.nombre, club: club.nombre,
      tablaFinal: tablaFinal, posClub: posClub, premios: premios, copa: copa,
      continental: continental, seleccion: seleccion, balon: balon, ofertas: ofertas,
      trofeos: trofeos, promedio: redondear(prom, 2)
    };
    m.resumenTemporada = resumen;
    return resumen;
  }

  global.Motor = {
    setRandom: setRandom, rnd: rnd, ri: ri, rf: rf, pick: pick, prob: prob, clamp: clamp,
    media: media, poisson: poisson, barajar: barajar, redondear: redondear,
    ovrJugador: ovrJugador, mediaForma: mediaForma, arqEstilo: arqEstilo,
    potencialEstrellas: potencialEstrellas, valorMercado: valorMercado,
    salarioSugerido: salarioSugerido, modsJugador: modsJugador,
    roleDe: roleDe, minutosEsperados: minutosEsperados,
    atributosIniciales: atributosIniciales, potencialInicial: potencialInicial,
    xpNecesaria: xpNecesaria, edadFactor: edadFactor,
    nombreSintetico: nombreSintetico, plantilla: plantilla,
    iniciarMundo: iniciarMundo, nuevaTemporada: nuevaTemporada,
    estadisticasVacias: estadisticasVacias,
    generarFixture: generarFixture, simularPartidoClub: simularPartidoClub,
    repartirGoles: repartirGoles, goleadores: goleadores, tabla: tabla,
    simularJornada: simularJornada, simularJornadaEn: simularJornadaEn,
    completarTemporada: completarTemporada, registrarResultadoJugador: registrarResultadoJugador,
    entrenar: entrenar, lesionAleatoria: lesionAleatoria, recuperarSemana: recuperarSemana,
    generarOfertas: generarOfertas, ofertasIniciales: ofertasIniciales,
    finTemporada: finTemporada, lesionTipo: LESIONES,
    agregarPalmares: agregarPalmares, agregarPremio: agregarPremio
  };
})(typeof window !== 'undefined' ? window : globalThis);
