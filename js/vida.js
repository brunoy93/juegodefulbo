/* =========================================================
   LEYENDA · V2 — prensa, medios, récords y capitanía
   ========================================================= */
(function (global) {
  'use strict';
  const D = global.DATOS, V = global.VIDA, M = global.Motor;
  if (!V) return;

  function clamp(a, b, v) { return v < a ? a : v > b ? b : v; }
  function rnd() { return M.rnd(); }
  function ri(a, b) { return M.ri(a, b); }
  function pick(a) { return M.pick(a); }
  function fill(txt, vars) {
    return String(txt || '').replace(/\{\{(\w+)\}\}/g, function (m, k) { return vars[k] != null ? vars[k] : ''; });
  }
  function jugador(estado) { return estado.jugador; }
  function club(estado) { return D.clubPorId(estado.jugador.clubId); }

  /* ---------------- clima / árbitro / clásico ---------------- */
  function climaAleatorio(ligaId) {
    const pesos = V.CLIMA_PESO[ligaId] || V.CLIMA_PESO.arg;
    let total = 0;
    V.CLIMAS.forEach(function (c) { total += pesos[c.id] || 0; });
    let r = rnd() * total;
    for (let i = 0; i < V.CLIMAS.length; i++) {
      r -= pesos[V.CLIMAS[i].id] || 0;
      if (r <= 0) return V.CLIMAS[i];
    }
    return V.CLIMAS[0];
  }
  function arbitroAleatorio() { return pick(V.ARBITROS); }
  function derbiDe(clubA, clubB) {
    if (!clubA || !clubB) return null;
    for (let i = 0; i < V.DERBIS.length; i++) {
      const d = V.DERBIS[i];
      if ((d.a === clubA.corto && d.b === clubB.corto) || (d.a === clubB.corto && d.b === clubA.corto)) return d;
    }
    return null;
  }

  /* ---------------- prensa ---------------- */
  function condiciones(estado, p) {
    const j = jugador(estado);
    const c = { siempre: true };
    if (p.golesFav > p.golesContra) c.victoria = true;
    else if (p.golesFav < p.golesContra) c.derrota = true;
    else c.empate = true;
    if (p.golesFav - p.golesContra >= 3) c.goleada = true;
    if (p.derbi) c.derbi = true;
    if (p.mvp) c.mvp = true;
    if (p.stats && p.stats.minutos < 25) c.banco = true;
    if (p.rating != null && p.rating < 6) c.malpartido = true;
    if (p.lesion) c.lesion = true;
    if ((j.reputacion || 0) >= 55 || (estado.mundo.ofertasInvierno && estado.mundo.ofertasInvierno.length)) c.transfer = true;
    if ((j.premios || []).some(function (x) { return x.anyo === estado.mundo.anyo + 1; })) c.premio = true;
    return c;
  }
  function preguntas(estado, p) {
    const conds = condiciones(estado, p);
    const candidatas = V.PRENSA.filter(function (q) {
      return q.cond.some(function (c) { return conds[c]; });
    });
    const especificas = candidatas.filter(function (q) { return q.cond.indexOf('siempre') < 0; });
    const generales = V.PRENSA.filter(function (q) { return q.cond.indexOf('siempre') >= 0; });
    const out = [];
    const usadas = {};
    function tomar(lista) {
      const libres = lista.filter(function (q) { return !usadas[q.id]; });
      if (!libres.length) return;
      const q = pick(libres);
      usadas[q.id] = true;
      out.push(q);
    }
    tomar(especificas);
    while (out.length < 2) tomar(especificas.concat(generales));
    return out.slice(0, 2);
  }
  function aplicarRespuestas(estado, respuestas) {
    const j = jugador(estado);
    const total = { fan: 0, dt: 0, rep: 0, moral: 0 };
    (respuestas || []).forEach(function (r) {
      const q = V.PRENSA.find(function (x) { return x.id === r.qid; });
      if (!q) return;
      const op = q.ops[r.op];
      if (!op) return;
      total.fan += op.e.fan || 0;
      total.dt += op.e.dt || 0;
      total.rep += op.e.rep || 0;
      total.moral += op.e.moral || 0;
    });
    total.fan = clamp(-5, 5, total.fan);
    total.dt = clamp(-2, 2, total.dt);
    total.rep = clamp(-2, 3, total.rep);
    total.moral = clamp(-3, 3, total.moral);
    j.fanatismo = clamp(0, 100, (j.fanatismo || 35) + total.fan);
    j.confianzaDT = clamp(0, 100, (j.confianzaDT || 45) + total.dt);
    j.reputacion = clamp(0, 100, (j.reputacion || 0) + total.rep);
    j.moral = clamp(0, 100, (j.moral || 60) + total.moral);
    return total;
  }
  function fraseDe(estado, respuestas) {
    if (!respuestas || !respuestas.length) return 'El equipo trabaja para pelear arriba.';
    const r = respuestas[0];
    const q = V.PRENSA.find(function (x) { return x.id === r.qid; });
    return q && q.ops[r.op] ? q.ops[r.op].t : 'El equipo trabaja para pelear arriba.';
  }
  function varsDe(estado, p, respuestas) {
    const j = jugador(estado), c = club(estado);
    const periodista = pick(V.PERIODISTAS);
    const goles = p.stats ? p.stats.goles : 0;
    return {
      club: c ? c.nombre : '', rival: p.rival ? p.rival.nombre : '',
      clubcorto: c ? c.corto : '', rivalcorto: p.rival ? p.rival.corto : '',
      jugador: j.nombre + ' ' + j.apellido, goles: goles,
      golesTxt: goles === 1 ? '1 gol' : goles + ' goles',
      gf: p.golesFav, gc: p.golesContra, nota: p.rating != null ? p.rating.toFixed(1).replace('.', ',') : '—',
      clima: p.clima ? (V.CLIMA_ADJ && V.CLIMA_ADJ[p.clima.id] ? V.CLIMA_ADJ[p.clima.id] : p.clima.n.toLowerCase()) : 'ideal', arbitro: p.arbitro ? p.arbitro.n : '',
      estiloArbitro: p.arbitro ? p.arbitro.estilo : 'equilibrado',
      nombreDerbi: p.derbi ? p.derbi.n : 'clásico',
      periodista: periodista.n, periodistaHandle: periodista.h,
      frase: fraseDe(estado, respuestas)
    };
  }
  function generarPeriodico(estado, p, respuestas) {
    let tipo = 'victoria';
    if (p.derbi && p.golesFav > p.golesContra) tipo = 'derbi';
    else if (p.golesFav > p.golesContra) tipo = (p.golesFav - p.golesContra >= 3) ? 'goleada' : 'victoria';
    else if (p.golesFav < p.golesContra) tipo = 'derrota';
    else tipo = 'empate';
    const j = jugador(estado);
    const reciente = (j.premios || []).find(function (x) { return x.anyo === estado.mundo.anyo + 1; });
    if (reciente && tipo === 'victoria') tipo = 'premio';
    if (!V.PERIODICO[tipo]) tipo = 'victoria';
    const t = pick(V.PERIODICO[tipo]);
    const vars = varsDe(estado, p, respuestas);
    return {
      tipo: tipo,
      titular: fill(t.titular, vars),
      copete: fill(t.copete, vars),
      cuerpo: fill(t.cuerpo, vars) + (respuestas && respuestas.length ? ' “' + fill(vars.frase, vars) + '”, dijo la figura.' : ''),
      autor: vars.periodista,
      handle: vars.periodistaHandle,
      anyo: estado.mundo.anyo,
      semana: estado.mundo.semana
    };
  }
  function generarRedes(estado, p, respuestas) {
    const conds = condiciones(estado, p);
    const vars = varsDe(estado, p, respuestas);
    let pool = V.REDES.filter(function (r) { return r.cond.some(function (c) { return conds[c]; }); });
    const vistos = {};
    const out = [];
    function add(r) {
      if (!r || vistos[r.handle + r.texto]) return;
      vistos[r.handle + r.texto] = true;
      const likes = Math.round(ri(40, 9000) * (1 + (jugador(estado).fanatismo || 35) / 70));
      out.push({
        tipo: r.tipo, handle: '@' + fill(r.handle, vars), nombre: fill(r.nombre, vars),
        texto: fill(r.texto, vars), likes: likes
      });
    }
    // un post oficial y uno de hincha siempre
    add(V.REDES.find(function (r) { return r.tipo === 'club' && r.cond.some(function (c) { return conds[c]; }); }));
    add(V.REDES.find(function (r) { return r.tipo === 'fan' && r.cond.some(function (c) { return conds[c]; }); }));
    while (out.length < 6 && pool.length) {
      const r = pick(pool);
      add(r);
      pool = pool.filter(function (x) { return x !== r; });
    }
    let generales = V.REDES.filter(function (r) { return r.cond.indexOf('siempre') >= 0; });
    while (out.length < 6 && generales.length) {
      const r = pick(generales);
      add(r);
      generales = generales.filter(function (x) { return x !== r; });
    }
    return out.slice(0, 7);
  }
  function generarMedia(estado, p, respuestas) {
    return {
      periodico: generarPeriodico(estado, p, respuestas),
      redes: generarRedes(estado, p, respuestas),
      prensa: (respuestas || []).map(function (r) {
        const q = V.PRENSA.find(function (x) { return x.id === r.qid; });
        return { q: q ? q.q : '', op: q && q.ops[r.op] ? q.ops[r.op].t : '' };
      })
    };
  }

  /* ---------------- récords / legado ---------------- */
  function registrarRecords(estado) {
    const j = jugador(estado);
    if (!j.records) j.records = {};
    const st = j.estadisticasTemporada || {};
    const ca = j.estadisticasCarrera || {};
    const r = j.records;
    r.golesTemporada = Math.max(r.golesTemporada || 0, st.goles || 0);
    r.asistenciasTemporada = Math.max(r.asistenciasTemporada || 0, st.asistencias || 0);
    if (st.pj >= 5) r.notaTemporada = Math.max(r.notaTemporada || 0, M.redondear(st.ratingSuma / st.pj, 2));
    r.golesCarrera = Math.max(r.golesCarrera || 0, (ca.goles || 0) + (st.goles || 0));
    r.partidosCarrera = Math.max(r.partidosCarrera || 0, (ca.pj || 0) + (st.pj || 0));
    r.mvpCarrera = Math.max(r.mvpCarrera || 0, (ca.mvp || 0) + (st.mvp || 0));
    r.titulos = (j.palmares || []).length;
    return r;
  }
  function actualizarLegadoClub(estado, p) {
    const j = jugador(estado);
    if (!j.legadoClub || j.legadoClub.clubId !== j.clubId) {
      j.legadoClub = { clubId: j.clubId, desde: estado.mundo.anyo, partidos: 0, goles: 0, asistencias: 0, titulos: 0 };
    }
    if (p.stats && p.stats.minutos > 0) {
      j.legadoClub.partidos++;
      j.legadoClub.goles += p.stats.goles;
      j.legadoClub.asistencias += p.stats.asistencias;
    }
    return j.legadoClub;
  }
  function nivelLeyenda(estado) {
    const j = jugador(estado);
    const l = j.legadoClub || { partidos: 0, goles: 0, titulos: 0 };
    let puntos = l.partidos * 1.2 + l.goles * 2.4 + (l.titulos || 0) * 25;
    const nivel = puntos >= 420 ? 'Leyenda' : puntos >= 240 ? 'Ídolo' : puntos >= 120 ? 'Referente' : puntos >= 45 ? 'Querido' : 'Promesa';
    return { puntos: Math.round(puntos), nivel: nivel, partidos: l.partidos, goles: l.goles, titulos: l.titulos || 0 };
  }
  function comprobarCapitania(estado) {
    const j = jugador(estado);
    if (j.capitan) return false;
    const l = j.legadoClub || { desde: estado.mundo.anyo };
    const temporadas = Math.max(1, estado.mundo.anyo - (l.desde || estado.mundo.anyo) + 1);
    if (j.edad >= 23 && (j.confianzaDT || 45) >= 78 && (j.atributos.liderazgo || 0) >= 75 && temporadas >= 2) {
      j.capitan = true;
      j.atributos.liderazgo = Math.min(99, (j.atributos.liderazgo || 0) + 2);
      j.fanatismo = clamp(0, 100, (j.fanatismo || 35) + 3);
      j.confianzaDT = clamp(0, 100, (j.confianzaDT || 45) + 3);
      if (global.Juego && global.Juego.noticia) global.Juego.noticia('¡Sos el nuevo capitán de ' + club(estado).nombre + '! El vestuario te eligió.', '🎖️', 'hito');
      return true;
    }
    return false;
  }

  global.Vida = {
    climaAleatorio: climaAleatorio, arbitroAleatorio: arbitroAleatorio, derbiDe: derbiDe,
    condiciones: condiciones, preguntas: preguntas, aplicarRespuestas: aplicarRespuestas,
    generarPeriodico: generarPeriodico, generarRedes: generarRedes, generarMedia: generarMedia,
    registrarRecords: registrarRecords, actualizarLegadoClub: actualizarLegadoClub,
    nivelLeyenda: nivelLeyenda, comprobarCapitania: comprobarCapitania, fill: fill
  };
})(typeof window !== 'undefined' ? window : globalThis);
