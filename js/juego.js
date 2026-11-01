/* =========================================================
   LEYENDA · estado, carrera y acciones
   ========================================================= */
(function (global) {
  'use strict';
  const D = global.DATOS;
  const M = global.Motor;
  const CLAVE = 'leyenda_save_v1';
  const VERSION = 1;

  let estado = null;
  let pendiente = null; // datos de creación a la espera de elegir club
  let memoria = null;

  function clamp(a, b, v) { return v < a ? a : v > b ? b : v; }
  function hoy() { return Date.now(); }
  function difDe(j) { return D.DIFICULTADES.find(function (d) { return d.id === j.dificultad; }) || D.DIFICULTADES[1]; }
  function clubActual() { return estado ? D.clubPorId(estado.jugador.clubId) : null; }
  function ligaActual() { const c = clubActual(); return c ? D.ligaPorId(c.liga) : null; }

  /* ---------------- storage ---------------- */
  function guardar(silencioso) {
    if (!estado) return false;
    try {
      const data = JSON.stringify({ v: VERSION, j: estado.jugador, m: estado.mundo, t: hoy() });
      if (typeof localStorage !== 'undefined') localStorage.setItem(CLAVE, data);
      else memoria = data;
      return true;
    } catch (e) {
      memoria = null;
      return false;
    }
  }
  function cargar() {
    try {
      let raw = null;
      if (typeof localStorage !== 'undefined') raw = localStorage.getItem(CLAVE);
      else raw = memoria;
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !data.j || !data.m) return null;
      estado = { version: VERSION, jugador: normalizarJugador(data.j), mundo: data.m };
      if (!estado.jugador.hitos) estado.jugador.hitos = {};
      if (!estado.mundo.noticias) estado.mundo.noticias = [];
      return estado;
    } catch (e) { return null; }
  }
  function hayGuardado() {
    try {
      return typeof localStorage !== 'undefined' ? !!localStorage.getItem(CLAVE) : !!memoria;
    } catch (e) { return false; }
  }
  function borrarGuardado() {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(CLAVE);
      memoria = null;
    } catch (e) { }
    estado = null;
  }
  function normalizarJugador(j) {
    j.habilidades = j.habilidades || [];
    j.rasgos = j.rasgos || [];
    j.premios = j.premios || [];
    j.palmares = j.palmares || [];
    j.historial = j.historial || [];
    j.forma = j.forma || [];
    j.staff = j.staff || { fisico: 0, nutri: 0, psico: 0, tecnico: 0 };
    j.seleccion = j.seleccion || { caps: 0, goles: 0, debut: false, torneos: [] };
    j.estadisticasTemporada = j.estadisticasTemporada || M.estadisticasVacias();
    j.estadisticasCarrera = j.estadisticasCarrera || { pj: 0, goles: 0, asistencias: 0, ratingSuma: 0, mvp: 0, temporadas: 0 };
    j.amarillasTemporada = j.amarillasTemporada || 0;
    j.puntos = j.puntos || 0;
    j.nivel = j.nivel || 1;
    j.xp = j.xp || 0;
    j.xpTotal = j.xpTotal || 0;
    j.lesion = j.lesion || null;
    j.sancion = j.sancion || 0;
    j.dinero = j.dinero || 0;
    j.reputacion = j.reputacion == null ? 5 : j.reputacion;
    j.condicion = j.condicion == null ? 100 : j.condicion;
    j.moral = j.moral == null ? 60 : j.moral;
    j.fanatismo = j.fanatismo == null ? 35 : j.fanatismo;
    j.confianzaDT = j.confianzaDT == null ? 45 : j.confianzaDT;
    j.capitan = !!j.capitan;
    j.dorsal = j.dorsal || null;
    if (!j.dorsal && j.clubId) j.dorsal = dorsalInicial(j.posicion);
    j.agente = j.agente || 'primo';
    j.records = j.records || { golesTemporada: 0, asistenciasTemporada: 0, notaTemporada: 0, golesCarrera: 0, partidosCarrera: 0, mvpCarrera: 0, titulos: 0 };
    if (!j.legadoClub && j.clubId) j.legadoClub = { clubId: j.clubId, desde: 2025, partidos: 0, goles: 0, asistencias: 0, titulos: 0 };
    j.contrato = j.contrato || { salario: 0, hasta: 2025, rol: 'reserva' };
    j.contrato.clausula = j.contrato.clausula || 0;
    j.contrato.primaGol = j.contrato.primaGol || 0;
    j.contrato.primaPartido = j.contrato.primaPartido || 0;
    j.contrato.primaFidelidad = j.contrato.primaFidelidad || 0;
    j.hitos = j.hitos || {};
    j.valor = M.valorMercado(j);
    return j;
  }
  function dorsalInicial(pos) {
    const map = { DC: 9, SD: 11, MCO: 10, ED: 7, EI: 11, MC: 8, MCD: 5, DFC: 4, LD: 2, LI: 3 };
    return map[pos] || M.ri(12, 30);
  }

  /* ---------------- creación ---------------- */
  function focoRecomendado(arq, pos) {
    const map = { pibe: 'creacion', artista: 'creacion', capitan: 'mental', killer: 'definicion', flecha: 'fisico', motor: 'fisico', muro: 'defensa', gladiador: 'defensa' };
    return map[arq] || 'tecnico';
  }
  function crearJugador(datos) {
    const dif = D.DIFICULTADES.find(function (d) { return d.id === datos.dificultad; }) || D.DIFICULTADES[1];
    const arq = D.ARQUETIPOS[datos.arquetipo] || D.ARQUETIPOS.pibe;
    const j = {
      nombre: (datos.nombre || 'Lautaro').trim().slice(0, 18),
      apellido: (datos.apellido || 'Pérez').trim().slice(0, 20),
      nacionalidad: datos.nacionalidad || 'arg',
      posicion: datos.posicion || 'MCO',
      arquetipo: datos.arquetipo || 'pibe',
      dificultad: dif.id,
      edad: 17, nivel: 1, xp: 0, xpTotal: 0, puntos: 0,
      atributos: M.atributosIniciales(datos.arquetipo, dif.id),
      potencial: M.potencialInicial(dif.id),
      moral: 64, condicion: 100, forma: [], reputacion: 8, dinero: 0,
      fanatismo: 35, confianzaDT: 45, capitan: false, dorsal: null, agente: 'primo',
      records: { golesTemporada: 0, asistenciasTemporada: 0, notaTemporada: 0, golesCarrera: 0, partidosCarrera: 0, mvpCarrera: 0, titulos: 0 },
      legadoClub: null,
      clubId: null, contrato: { salario: 0, hasta: 2025, rol: 'reserva' },
      estadisticasTemporada: M.estadisticasVacias(),
      estadisticasCarrera: { pj: 0, goles: 0, asistencias: 0, ratingSuma: 0, mvp: 0, temporadas: 0 },
      habilidades: [], rasgos: [], premios: [], palmares: [], historial: [],
      seleccion: { caps: 0, goles: 0, debut: false, torneos: [] },
      staff: { fisico: 0, nutri: 0, psico: 0, tecnico: 0 },
      lesion: null, sancion: 0, entrenoHecho: false, tactica: 'posesion',
      foco: focoRecomendado(datos.arquetipo, datos.posicion),
      intensidad: 'normal', retirado: false, ultimoPartido: null,
      temporada: 1, amarillasTemporada: 0, hitos: {}, focoManual: false
    };
    return normalizarJugador(j);
  }
  function ofertasIniciales(datos) {
    const j = crearJugador(datos);
    j.clubId = 'arg_0';
    const ofertas = M.ofertasIniciales({ jugador: j, mundo: {} });
    pendiente = { datos: datos, ofertas: ofertas, jugador: j, ovr: M.ovrJugador(j) };
    return ofertas.map(function (o) {
      const club = D.clubPorId(o.clubId);
      const rol = D.ROLES.find(function (r) { return r.id === o.rol; }) || D.ROLES[3];
      return {
        oferta: o, club: club, rol: rol,
        minutos: Math.round((rol.minMin + rol.maxMin) / 2),
        ovr: M.ovrJugador(j)
      };
    });
  }
  function firmarPrimerClub(ofertaId) {
    if (!pendiente) return { error: 'No hay una carrera en creación.' };
    const o = pendiente.ofertas.find(function (x) { return x.id === ofertaId; }) || pendiente.ofertas[0];
    const j = pendiente.jugador;
    const club = D.clubPorId(o.clubId);
    j.clubId = club.id;
    j.contrato = {
      salario: o.salario, hasta: 2025 + o.anos, rol: o.rol,
      clausula: o.clausula || 0, primaGol: o.primaGol || 0,
      primaPartido: o.primaPartido || 0, primaFidelidad: o.primaFidelidad || 0
    };
    j.dinero = o.prima;
    j.dorsal = dorsalInicial(j.posicion);
    j.legadoClub = { clubId: club.id, desde: 2025, partidos: 0, goles: 0, asistencias: 0, titulos: 0 };
    estado = { version: VERSION, jugador: j, mundo: { noticias: [] } };
    M.iniciarMundo(estado);
    noticia('Firmaste tu primer contrato con ' + club.nombre + ' hasta ' + j.contrato.hasta + '. Empieza el camino.', '✍️', 'contrato');
    pendiente = null;
    guardar();
    return { ok: true };
  }

  /* ---------------- noticias ---------------- */
  function noticia(texto, icono, tipo) {
    if (!estado) return;
    estado.mundo.noticias = estado.mundo.noticias || [];
    estado.mundo.noticias.unshift({
      texto: texto, icono: icono || '📰', tipo: tipo || 'info',
      anyo: estado.mundo.anyo, semana: estado.mundo.semana
    });
    if (estado.mundo.noticias.length > 50) estado.mundo.noticias.length = 50;
  }

  /* ---------------- xp ---------------- */
  function darXP(cant) {
    const j = estado.jugador;
    const dif = difDe(j);
    const staff = 1 + (j.staff.tecnico || 0) * 0.03;
    cant = Math.max(1, Math.round(cant * dif.xp * staff));
    j.xp += cant; j.xpTotal += cant;
    let subio = 0;
    while (j.xp >= M.xpNecesaria(j.nivel) && j.nivel < 60) {
      j.xp -= M.xpNecesaria(j.nivel);
      j.nivel++;
      j.puntos += 2 + (j.nivel % 5 === 0 ? 1 : 0);
      subio++;
    }
    if (subio > 0) {
      noticia('Subiste al nivel ' + j.nivel + '. Ganaste ' + (subio * 2 + Math.floor(j.nivel / 5) - Math.floor((j.nivel - subio) / 5)) + ' puntos de habilidad.', '⬆️', 'nivel');
      j.moral = clamp(0, 100, j.moral + 2);
    }
    return cant;
  }

  /* ---------------- entrenamiento ---------------- */
  function entrenar(focoId, intId, manual) {
    if (!estado) return { error: 'Sin carrera.' };
    const j = estado.jugador;
    if (j.entrenoHecho) return { error: 'Ya entrenaste esta semana.' };
    const res = M.entrenar(estado, focoId || j.foco, intId || j.intensidad);
    if (res.error) return res;
    j.foco = (focoId || j.foco);
    j.intensidad = (intId || j.intensidad);
    if (manual) j.focoManual = true;
    darXP(res.xp);
    if (res.lesion) {
      noticia('Lesión en el entrenamiento: ' + res.lesion.tipo.toLowerCase() + ' (' + res.lesion.semanas + ' semanas).', '🩹', 'lesion');
    }
    guardar();
    return res;
  }
  function focoSugerido() {
    const j = estado.jugador;
    const pos = D.POSICIONES[j.posicion];
    let mejor = 'tecnico', scoreMejor = -1;
    D.ENTRENAMIENTOS.forEach(function (f) {
      if (f.id === 'recuperacion') return;
      let s = 0;
      for (const a in f.attrs) {
        const w = pos.pesos[a] || 0;
        const gap = Math.max(0, j.potencial - (j.atributos[a] || 0));
        s += gap * (0.35 + w / 22) * f.attrs[a];
      }
      if (j.lesion && f.id === 'fisico') s *= 0.2;
      if (s > scoreMejor) { scoreMejor = s; mejor = f.id; }
    });
    return mejor;
  }
  function autoEntrenar() {
    const j = estado.jugador;
    if (j.entrenoHecho) return;
    let foco = j.focoManual ? j.foco : focoSugerido();
    let int = j.intensidad || 'normal';
    if (j.lesion && j.lesion.semanas > 0 && foco !== 'mental' && foco !== 'recuperacion') foco = 'mental';
    if (j.condicion < 25 && foco !== 'recuperacion') { foco = 'recuperacion'; int = 'suave'; }
    entrenar(foco, int, false);
  }

  /* ---------------- staff ---------------- */
  function costoStaff(id) {
    const s = D.STAFF.find(function (x) { return x.id === id; });
    const nivel = estado.jugador.staff[id] || 0;
    if (!s || nivel >= s.max) return null;
    const ovr = M.ovrJugador(estado.jugador);
    return Math.round(s.costo * Math.pow(1.9, nivel) * (1 + ovr / 45));
  }
  function comprarStaff(id) {
    const j = estado.jugador;
    const s = D.STAFF.find(function (x) { return x.id === id; });
    if (!s) return { error: 'No existe.' };
    const nivel = j.staff[id] || 0;
    if (nivel >= s.max) return { error: 'Ya está al máximo.' };
    const costo = costoStaff(id);
    if (j.dinero < costo) return { error: 'Necesitás $' + costo + 'K. Tenés $' + Math.round(j.dinero) + 'K.' };
    j.dinero -= costo;
    j.staff[id] = nivel + 1;
    noticia('Contrataste ' + s.n + ' nivel ' + (nivel + 1) + '.', '🧑‍🏫', 'staff');
    guardar();
    return { ok: true, nivel: nivel + 1 };
  }

  /* ---------------- habilidades ---------------- */
  function nodo(id) { return D.HABILIDADES.find(function (h) { return h.id === id; }); }
  function puedeDesbloquear(id) {
    const h = nodo(id), j = estado.jugador;
    if (!h) return { ok: false, motivo: 'No existe.' };
    if (j.habilidades.indexOf(id) >= 0) return { ok: false, motivo: 'Ya la aprendiste.' };
    if (j.nivel < h.nivel) return { ok: false, motivo: 'Necesitás nivel ' + h.nivel + '.' };
    if (j.puntos < h.costo) return { ok: false, motivo: 'Necesitás ' + h.costo + ' PH (tenés ' + j.puntos + ').' };
    for (let i = 0; i < h.req.length; i++) {
      if (j.habilidades.indexOf(h.req[i]) < 0) return { ok: false, motivo: 'Requiere ' + (nodo(h.req[i]) || { nombre: h.req[i] }).nombre + '.' };
    }
    return { ok: true };
  }
  function desbloquear(id) {
    const j = estado.jugador;
    const check = puedeDesbloquear(id);
    if (!check.ok) return check;
    const h = nodo(id);
    j.puntos -= h.costo;
    j.habilidades.push(id);
    for (const k in h.efectos) j.atributos[k] = clamp(1, 99, (j.atributos[k] || 0) + h.efectos[k]);
    if (h.rasgo && j.rasgos.indexOf(h.rasgo.id) < 0) j.rasgos.push(h.rasgo.id);
    noticia('Aprendiste “' + h.nombre + '”' + (h.rasgo ? ' y desbloqueaste el rasgo ' + h.rasgo.n + '.' : '.'), '✨', 'habilidad');
    j.moral = clamp(0, 100, j.moral + 1);
    guardar();
    return { ok: true };
  }

  /* ---------------- partido ---------------- */
  function proximoPartido() {
    if (!estado) return null;
    const club = clubActual(), liga = ligaActual();
    if (!liga) return null;
    const jornada = estado.mundo.semana;
    const fixtures = estado.mundo.fixtures[liga.id] && estado.mundo.fixtures[liga.id][jornada - 1];
    if (!fixtures) return null;
    const par = fixtures.find(function (f) { return f[0] === club.id || f[1] === club.id; });
    if (!par) return null;
    const local = par[0] === club.id;
    const rival = D.clubPorId(local ? par[1] : par[0]);
    return {
      rival: rival,
      local: local, jornada: jornada, liga: liga,
      estadio: local ? 'Estadio ' + club.ciudad : 'Estadio de ' + D.clubPorId(local ? par[1] : par[0]).ciudad,
      previa: M.datosPrevia ? M.datosPrevia(club, rival) : null
    };
  }
  function jugarPartido(opts) {
    if (!estado) return null;
    if (estado.mundo.partidoJugado) return null;
    if (!estado.jugador.entrenoHecho) autoEntrenar();
    const p = M.crearPartido(estado, Object.assign({ tactica: estado.jugador.tactica }, opts || {}));
    estado.partidoActual = p;
    return p;
  }
  function aplicarPartido(p) {
    if (p.aplicado) return;
    p.aplicado = true;
    const j = estado.jugador;
    const st = j.estadisticasTemporada;
    if (p.juega && p.stats.minutos > 0) {
      st.pj++;
      st.goles += p.stats.goles; st.asistencias += p.stats.asistencias;
      st.ratingSuma += p.rating || 0; st.minutos += p.stats.minutos;
      st.tiros += p.stats.tiros; st.pasesClave += p.stats.pasesClave;
      st.amarillas += p.stats.amarillas; st.rojas += p.stats.rojas;
      if (p.mvp) st.mvp++;
      j.forma.push(p.rating || 6);
      if (j.forma.length > 5) j.forma.shift();
      j.condicion = clamp(0, 100, j.condicion - p.costoFisico);
      j.moral = clamp(0, 100, j.moral + p.costoMoral);
      let rep = p.stats.goles * 0.5 + p.stats.asistencias * 0.3 + ((p.rating || 6) - 6.7) * 0.6 + (p.mvp ? 0.8 : 0);
      j.reputacion = clamp(0, 100, j.reputacion + Math.max(0, rep));
      if (p.lesion) {
        j.lesion = p.lesion;
        noticia('Lesión en el partido: ' + p.lesion.tipo.toLowerCase() + ' (' + p.lesion.semanas + ' semanas).', '🩹', 'lesion');
      }
      if (p.stats.rojas > 0) {
        j.sancion = Math.max(j.sancion, 2);
        noticia('Expulsión. Te perdés las próximas 2 fechas.', '🟥', 'sancion');
      } else if (p.stats.amarillas > 0) {
        j.amarillasTemporada += p.stats.amarillas;
        if (j.amarillasTemporada >= 5) {
          j.amarillasTemporada = 0; j.sancion = 1;
          noticia('Cinco amarillas: una fecha de suspensión.', '🟨', 'sancion');
        }
      }
      if (!j.hitos.debut) {
        j.hitos.debut = true;
        noticia('¡Debutaste en Primera con ' + p.club.nombre + '!', '🎉', 'hito');
      }
      if (p.stats.goles > 0 && !j.hitos.primerGol) {
        j.hitos.primerGol = true;
        noticia('¡Tu primer gol como profesional!', '⚽', 'hito');
        j.reputacion = clamp(0, 100, j.reputacion + 2);
      }
      if (p.mvp && !j.hitos.primerMvp) {
        j.hitos.primerMvp = true;
        noticia('¡Primera figura del partido!', '⭐', 'hito');
      }
      darXP(6 + (p.rating || 6) * 2.5 + p.stats.goles * 7 + p.stats.asistencias * 4 + (p.mvp ? 10 : 0));
    } else {
      j.moral = clamp(0, 100, j.moral - 2);
      darXP(3);
    }
    /* V2 · ánimo, primas, legado, prensa */
    const jugo = p.juega && p.stats.minutos > 0;
    let fan = p.resultado === 'V' ? 3 : p.resultado === 'D' ? -3 : 0;
    fan += p.stats.goles * 1.2 + (p.mvp ? 2 : 0) - (p.stats.rojas ? 4 : 0) - (jugo ? 0 : 1);
    if (p.derbi) fan += p.resultado === 'V' ? 7 : p.resultado === 'D' ? -7 : 1;
    if (p.charla) fan += p.charla.fan;
    j.fanatismo = clamp(0, 100, (j.fanatismo || 35) + fan);
    let dt = !jugo ? -1 : (p.rating >= 7.5 ? 2 : p.rating >= 6.8 ? 1 : p.rating < 5.8 ? -2 : 0);
    if (p.stats.rojas) dt -= 4;
    if (p.mvp) dt += 1;
    if (p.charla) dt += p.charla.dt;
    j.confianzaDT = clamp(0, 100, (j.confianzaDT || 45) + dt);
    if (p.charla) j.moral = clamp(0, 100, j.moral + p.charla.moral);
    let primas = 0;
    if (p.stats.minutos > 0) primas += j.contrato.primaPartido || 0;
    primas += (j.contrato.primaGol || 0) * p.stats.goles;
    if (primas > 0) { j.dinero += primas; p.primas = primas; }
    if (global.Vida) {
      global.Vida.actualizarLegadoClub(estado, p);
      global.Vida.registrarRecords(estado);
      global.Vida.comprobarCapitania(estado);
      estado.mundo.media = estado.mundo.media || { periodico: null, redes: [], prensa: [] };
      estado.mundo.prensaPendiente = {
        rival: p.rival, gf: p.golesFav, gc: p.golesContra,
        golesFav: p.golesFav, golesContra: p.golesContra, local: p.local,
        rating: p.rating, goles: p.stats.goles, asistencias: p.stats.asistencias,
        mvp: p.mvp, minutos: p.stats.minutos, derbi: p.derbi || null,
        clima: p.clima || null, arbitro: p.arbitro || null,
        stats: Object.assign({}, p.stats),
        preguntas: global.Vida.preguntas(estado, p)
      };
    }
    M.registrarResultadoJugador(estado, p);
    M.simularJornada(estado);
    estado.mundo.partidoJugado = true;
    j.valor = M.valorMercado(j);
    j.ultimoPartido = {
      rival: p.rival.nombre, local: p.local, gf: p.golesFav, gc: p.golesContra,
      rating: p.rating, goles: p.stats.goles, asistencias: p.stats.asistencias,
      mvp: p.mvp, mvpPartido: p.mvp, minutos: p.stats.minutos, resultado: p.resultado,
      fan: fan, dt: dt, primas: primas, clima: p.clima ? p.clima.n : null,
      arbitro: p.arbitro ? p.arbitro.n : null, varAnulados: p.varAnulados || 0,
      derbi: p.derbi ? p.derbi.n : null, charla: p.charla ? p.charla.id : null
    };
    guardar();
  }
  function terminarPartido(p) {
    const partido = p || estado.partidoActual;
    if (!partido) return null;
    M.finalizarPartido(partido);
    aplicarPartido(partido);
    estado.partidoActual = null;
    return partido;
  }
  function simularPartido(opts) {
    const p = jugarPartido(Object.assign({ auto: true }, opts || {}));
    if (!p) return null;
    M.finalizarPartido(p);
    return p;
  }

  /* ---------------- semana ---------------- */
  function pagarSemana() {
    const j = estado.jugador;
    j.dinero += j.contrato.salario || 0;
  }
  function avanzarSemana() {
    const m = estado.mundo, j = estado.jugador;
    if (m.fase === 'fin' || m.fase === 'retiro') return;
    m.semana++;
    m.partidoJugado = false;
    M.recuperarSemana(estado);
    pagarSemana();
    if (m.semana === 19 && !m.ofertasInvierno) {
      m.ofertasInvierno = M.generarOfertas(estado, 'invierno');
      m.ventanaInvierno = true;
      noticia('Se abrió el mercado de invierno. Hay clubes interesados en vos.', '🔄', 'mercado');
    }
    if (m.semana === 21) { m.ventanaInvierno = false; m.ofertasInvierno = null; }
    const liga = ligaActual();
    if (liga && m.semana > liga.jornadas) {
      finalizarTemporada();
    }
    guardar();
  }
  function finalizarTemporada() {
    const m = estado.mundo, j = estado.jugador;
    if (m.fase === 'fin') return m.resumenTemporada;
    if (global.Vida) global.Vida.registrarRecords(estado);
    const resumen = M.finTemporada(estado);
    if ((j.contrato.primaFidelidad || 0) > 0) {
      j.dinero += j.contrato.primaFidelidad;
      noticia('Cobraste la prima de fidelidad: +$' + j.contrato.primaFidelidad + 'K.', '💸', 'contrato');
    }
    if (j.legadoClub && j.legadoClub.clubId === j.clubId) {
      const clubNombre = D.clubPorId(j.clubId).nombre;
      j.legadoClub.titulos = (j.palmares || []).filter(function (p) { return p.club === clubNombre; }).length;
    }
    m.fase = 'fin';
    m.resumenTemporada = resumen;
    noticia('Terminó la temporada ' + m.anyo + '/' + String(m.anyo + 1).slice(2) + '.', '🏁', 'temporada');
    if (resumen.premios && resumen.premios.length) {
      resumen.premios.forEach(function (p) { noticia('Premio: ' + p.nombre + ' (' + p.detalle + ').', '🏅', 'premio'); });
    }
    if (resumen.balon.ganador) noticia('¡GANASTE EL BALÓN DE ORO! Sos el mejor jugador del mundo.', '🏆', 'premio');
    guardar();
    return resumen;
  }
  function entrenarYContinuar() {
    if (!estado.jugador.entrenoHecho) autoEntrenar();
    avanzarSemana();
  }

  /* ---------------- V2 · agente, prensa, medios ---------------- */
  function contratarAgente(id) {
    const j = estado.jugador;
    const a = (global.VIDA ? global.VIDA.AGENTES.find(function (x) { return x.id === id; }) : null);
    if (!a) return { error: 'Agente inválido.' };
    if (j.agente === id) return { error: 'Ya trabajás con ' + a.n + '.' };
    if ((j.dinero || 0) < a.fee) return { error: 'Necesitás $' + a.fee + 'K para contratar a ' + a.n + '.' };
    j.dinero -= a.fee;
    j.agente = id;
    j.fanatismo = clamp(0, 100, (j.fanatismo || 35) + 1);
    noticia('Contrataste a ' + a.n + '. ' + a.desc, '🕴️', 'agente');
    guardar();
    return { ok: true, agente: a };
  }
  function negociarOferta(id) {
    const m = estado.mundo, j = estado.jugador;
    const fuente = (m.fase === 'fin' && m.resumenTemporada) ? m.resumenTemporada.ofertas : (m.ofertasInvierno || []);
    const o = fuente.find(function (x) { return x.id === id; });
    if (!o) return { error: 'La oferta ya no está disponible.' };
    if (o.negociada) return { error: 'Esta oferta ya fue negociada.' };
    const agente = (global.VIDA ? global.VIDA.AGENTES.find(function (x) { return x.id === j.agente; }) : null);
    const prob = clamp(0.15, 0.88, 0.34 + (agente ? agente.negociacion : 0) + (j.reputacion || 0) / 300);
    o.negociada = true;
    if (M.rnd() < prob) {
      o.salario = Math.round(o.salario * 1.18);
      o.anos += 1;
      o.prima = Math.round(o.prima * 1.2);
      o.clausula = Math.round((o.clausula || 0) * 1.15);
      o.primaGol = Math.round((o.primaGol || 0) * 1.15);
      o.primaPartido = Math.round((o.primaPartido || 0) * 1.12);
      o.primaFidelidad = Math.round((o.primaFidelidad || 0) * 1.2);
      noticia('Tu agente negoció una mejora: ' + D.clubPorId(o.clubId).nombre + ' subió la oferta.', '📈', 'mercado');
      guardar();
      return { ok: true, mejora: true, oferta: o };
    }
    noticia('Tu agente intentó negociar, pero ' + D.clubPorId(o.clubId).nombre + ' no mejoró la oferta.', '📉', 'mercado');
    guardar();
    return { ok: true, mejora: false, oferta: o };
  }
  function responderPrensa(respuestas) {
    const m = estado.mundo;
    const pend = m.prensaPendiente;
    if (!pend) return { error: 'No hay conferencia pendiente.' };
    const efectos = global.Vida ? global.Vida.aplicarRespuestas(estado, respuestas) : { fan: 0, dt: 0, rep: 0, moral: 0 };
    const media = global.Vida ? global.Vida.generarMedia(estado, pend, respuestas) : null;
    m.media = m.media || { periodico: null, redes: [], prensa: [] };
    if (media) {
      m.media.periodico = media.periodico;
      m.media.redes = media.redes;
      m.media.prensa.unshift({
        anyo: m.anyo, semana: m.semana, club: clubActual() ? clubActual().nombre : '',
        rival: pend.rival ? pend.rival.nombre : '',
        gf: pend.gf, gc: pend.gc, respuestas: media.prensa
      });
      if (m.media.prensa.length > 8) m.media.prensa.length = 8;
    }
    m.prensaPendiente = null;
    noticia('Conferencia de prensa: ' + (efectos.fan >= 0 ? 'la gente bancó tus palabras.' : 'tus declaraciones generaron ruido.'), '🎙️', 'prensa');
    guardar();
    return { ok: true, efectos: efectos, media: media };
  }
  function saltarPrensa() {
    const m = estado.mundo;
    const pend = m.prensaPendiente;
    if (!pend) return { error: 'No hay conferencia pendiente.' };
    const media = global.Vida ? global.Vida.generarMedia(estado, pend, []) : null;
    m.media = m.media || { periodico: null, redes: [], prensa: [] };
    if (media) {
      m.media.periodico = media.periodico;
      m.media.redes = media.redes;
      m.media.prensa.unshift({ anyo: m.anyo, semana: m.semana, club: clubActual() ? clubActual().nombre : '', rival: pend.rival ? pend.rival.nombre : '', gf: pend.gf, gc: pend.gc, respuestas: [] });
      if (m.media.prensa.length > 8) m.media.prensa.length = 8;
    }
    m.prensaPendiente = null;
    guardar();
    return { ok: true, media: media };
  }

  /* ---------------- mercado ---------------- */
  function firmarOferta(ofertaId) {
    const m = estado.mundo, j = estado.jugador;
    const fuente = (m.fase === 'fin' && m.resumenTemporada) ? m.resumenTemporada.ofertas : (m.ofertasInvierno || []);
    const o = fuente.find(function (x) { return x.id === ofertaId; });
    if (!o) return { error: 'La oferta ya no está disponible.' };
    const club = D.clubPorId(o.clubId);
    if (!club) return { error: 'Club inválido.' };
    const anterior = clubActual();
    j.clubId = club.id;
    j.contrato = {
      salario: o.salario, hasta: m.anyo + o.anos, rol: o.rol,
      clausula: o.clausula || 0, primaGol: o.primaGol || 0,
      primaPartido: o.primaPartido || 0, primaFidelidad: o.primaFidelidad || 0
    };
    j.dinero += o.prima || 0;
    j.moral = clamp(0, 100, j.moral + 4);
    j.reputacion = clamp(0, 100, j.reputacion + 1);
    if (anterior && anterior.id !== club.id) {
      j.legadoClub = { clubId: club.id, desde: m.anyo, partidos: 0, goles: 0, asistencias: 0, titulos: 0 };
    }
    if (!j.dorsal) j.dorsal = dorsalInicial(j.posicion);
    noticia('Fichaste por ' + club.nombre + ' (' + D.ligaPorId(club.liga).nombre + ') por ' + o.anos + ' años. Salario: $' + o.salario + 'K/sem.', '✍️', 'mercado');
    if (anterior && anterior.id !== club.id) {
      noticia('Dejaste ' + anterior.nombre + ' después de ' + (j.temporada) + ' temporada(s).', '👋', 'mercado');
    }
    m.ofertasInvierno = null;
    m.ventanaInvierno = false;
    m.ofertaElegida = o.id;
    j.valor = M.valorMercado(j);
    guardar();
    return { ok: true, club: club };
  }
  function quedarse() {
    const m = estado.mundo, j = estado.jugador;
    const club = clubActual();
    if (!club) return { error: 'Sin club.' };
    const salario = Math.max(j.contrato.salario, M.salarioSugerido(M.ovrJugador(j), club.prestigio));
    j.contrato = Object.assign({}, j.contrato, { salario: salario, hasta: Math.max(j.contrato.hasta, m.anyo + 2), rol: j.contrato.rol });
    m.ofertaElegida = 'quedarse';
    noticia('Renovaste con ' + club.nombre + ' hasta ' + j.contrato.hasta + '.', '🤝', 'contrato');
    guardar();
    return { ok: true };
  }

  /* ---------------- temporada nueva ---------------- */
  function comenzarNuevaTemporada() {
    const m = estado.mundo, j = estado.jugador;
    if (!m.resumenTemporada) return { error: 'La temporada no terminó.' };
    if (!m.ofertaElegida) quedarse();
    j.edad++;
    j.temporada++;
    j.condicion = 100;
    j.moral = clamp(45, 100, j.moral + 6);
    j.lesion = null;
    j.sancion = 0;
    j.amarillasTemporada = 0;
    j.entrenoHecho = false;
    j.forma = [];
    if (j.edad <= 23) {
      const b = j.edad <= 19 ? 2.2 : j.edad <= 21 ? 1.5 : 0.8;
      D.ORDEN_ATRIBUTOS.forEach(function (k) {
        const tope = j.potencial + 6;
        if (j.atributos[k] < tope) j.atributos[k] = Math.min(tope, j.atributos[k] + b);
      });
      noticia('Pretemporada de desarrollo: +' + b.toFixed(1) + ' en tus atributos (hasta el techo).', '🌱', 'progreso');
    }
    if (j.edad >= 30) {
      ['ritmo', 'aceleracion', 'resistencia', 'agilidad'].forEach(function (k) {
        j.atributos[k] = clamp(25, 99, j.atributos[k] - M.ri(1, 3));
      });
      if (j.edad >= 33) j.atributos.fuerza = clamp(25, 99, j.atributos.fuerza - M.ri(1, 3));
      if (j.edad >= 35) j.atributos.salto = clamp(25, 99, j.atributos.salto - M.ri(1, 2));
    }
    j.valor = M.valorMercado(j);
    m.ofertaElegida = null;
    m.ofertasInvierno = null;
    m.ventanaInvierno = false;
    m.partidoJugado = false;
    m.prensaPendiente = null;
    m.fase = 'temporada';
    M.nuevaTemporada(estado);
    noticia('Pretemporada ' + m.anyo + '/' + String(m.anyo + 1).slice(2) + ': nuevo desafío con ' + clubActual().nombre + '.', '🌱', 'temporada');
    if (j.edad >= 39) {
      noticia('Tu carrera entra en su etapa final. Podés retirarte cuando quieras.', '🌅', 'retiro');
    }
    guardar();
    return { ok: true };
  }
  function retirarse() {
    const j = estado.jugador;
    if (j.edad < 30) return { error: 'Todavía sos muy joven para retirarte.' };
    j.retirado = true;
    estado.mundo.fase = 'retiro';
    noticia('Anunciaste tu retiro del fútbol profesional.', '🎬', 'retiro');
    guardar();
    return { ok: true };
  }
  function legado() {
    const j = estado.jugador;
    const c = j.estadisticasCarrera;
    const prom = c.pj ? c.ratingSuma / c.pj : 0;
    const puntos = Math.round(
      j.palmares.length * 16 + j.premios.length * 9 + c.goles * 0.28 + c.asistencias * 0.15 +
      j.seleccion.caps * 0.22 + (j.reputacion || 0) * 1.6 + prom * 22 + j.nivel * 0.6
    );
    const nivel = puntos >= 520 ? 'Leyenda eterna' : puntos >= 400 ? 'Ídolo mundial' : puntos >= 300 ? 'Crack de época' : puntos >= 210 ? 'Gran profesional' : puntos >= 130 ? 'Jugador de primera' : 'Carrera respetable';
    return { puntos: puntos, nivel: nivel, promedio: M.redondear(prom, 2) };
  }

  /* ---------------- vistas derivadas ---------------- */
  function promedioTemporada() {
    const s = estado.jugador.estadisticasTemporada;
    return s.pj ? M.redondear(s.ratingSuma / s.pj, 2) : 0;
  }
  function promedioCarrera() {
    const c = estado.jugador.estadisticasCarrera;
    return c.pj ? M.redondear(c.ratingSuma / c.pj, 2) : 0;
  }
  function rolActual() {
    return M.roleDe(M.ovrJugador(estado.jugador), clubActual());
  }
  function minutosPrevistos() {
    return M.minutosEsperados(estado.jugador, clubActual());
  }
  function tablaActual() {
    return M.tabla(estado, ligaActual().id);
  }
  function goleadoresActuales() {
    return M.goleadores(estado, ligaActual().id);
  }
  function xpPct() {
    const j = estado.jugador;
    return Math.round((j.xp / M.xpNecesaria(j.nivel)) * 100);
  }
  function estadoGeneral() { return estado; }
  function exportar() {
    if (!estado) return null;
    try { return JSON.stringify({ v: VERSION, j: estado.jugador, m: estado.mundo }); } catch (e) { return null; }
  }
  function importar(texto) {
    try {
      const data = JSON.parse(texto);
      if (!data || !data.j || !data.m) return { error: 'El código no tiene el formato de LEYENDA.' };
      estado = { version: VERSION, jugador: normalizarJugador(data.j), mundo: data.m };
      if (!estado.jugador.hitos) estado.jugador.hitos = {};
      if (!estado.mundo.noticias) estado.mundo.noticias = [];
      guardar();
      return { ok: true };
    } catch (e) {
      return { error: 'No se pudo leer el código.' };
    }
  }

  global.Juego = {
    get estado() { return estado; },
    get pendiente() { return pendiente; },
    crearJugador: crearJugador, ofertasIniciales: ofertasIniciales, firmarPrimerClub: firmarPrimerClub,
    cargar: cargar, guardar: guardar, hayGuardado: hayGuardado, borrarGuardado: borrarGuardado,
    noticia: noticia, darXP: darXP, entrenar: entrenar, autoEntrenar: autoEntrenar, focoSugerido: focoSugerido,
    costoStaff: costoStaff, comprarStaff: comprarStaff,
    nodo: nodo, puedeDesbloquear: puedeDesbloquear, desbloquear: desbloquear,
    proximoPartido: proximoPartido, jugarPartido: jugarPartido, terminarPartido: terminarPartido,
    simularPartido: simularPartido, avanzarSemana: avanzarSemana, entrenarYContinuar: entrenarYContinuar,
    finalizarTemporada: finalizarTemporada, firmarOferta: firmarOferta, quedarse: quedarse,
    comenzarNuevaTemporada: comenzarNuevaTemporada, retirarse: retirarse, legado: legado,
    promedioTemporada: promedioTemporada, promedioCarrera: promedioCarrera,
    rolActual: rolActual, minutosPrevistos: minutosPrevistos,
    tablaActual: tablaActual, goleadoresActuales: goleadoresActuales, xpPct: xpPct,
    estadoGeneral: estadoGeneral, difDe: difDe, clubActual: clubActual, ligaActual: ligaActual,
    exportar: exportar, importar: importar,
    contratarAgente: contratarAgente, negociarOferta: negociarOferta,
    responderPrensa: responderPrensa, saltarPrensa: saltarPrensa, dorsalInicial: dorsalInicial
  };
})(typeof window !== 'undefined' ? window : globalThis);
