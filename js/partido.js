/* =========================================================
   LEYENDA · motor de partido
   Cada ocasión se resuelve con atributos, estilo, tactica,
   moral, forma y rasgos. Las jugadas de tu jugador son
   momentos que podés decidir.
   ========================================================= */
(function (global) {
  'use strict';
  const D = global.DATOS;
  const M = global.Motor;
  const MAX_MOMENTOS = 4;

  function climaDe(ligaId) {
    return global.Vida ? global.Vida.climaAleatorio(ligaId) : { id: 'sol', n: 'Soleado', icon: '☀️', precision: 1, error: 1, fatiga: 1, cards: 1 };
  }
  function arbitroDe() {
    return global.Vida ? global.Vida.arbitroAleatorio() : { n: 'Tello', estilo: 'equilibrado', rigor: 1, desc: '' };
  }
  function derbiDe(a, b) {
    return global.Vida ? global.Vida.derbiDe(a, b) : null;
  }
  function coordChance(lado, xg) {
    const base = lado === 'fav' ? 58 + xg * 48 : 42 - xg * 48;
    return {
      x: clamp(6, 94, base + M.rf(-7, 7)),
      y: clamp(8, 92, 50 + M.rf(-34, 34) * (1 - xg * 0.45))
    };
  }
  function datosPrevia(club, rival) {
    const noche = rnd() < 0.55;
    return {
      clima: climaDe(club.liga),
      arbitro: arbitroDe(),
      derbi: derbiDe(club, rival),
      noche: noche,
      hora: noche ? pick(['20:45', '21:30', '22:00']) : pick(['16:00', '17:30', '18:30'])
    };
  }

  function clamp(a, b, v) { return v < a ? a : v > b ? b : v; }
  function rnd() { return M.rnd(); }
  function ri(a, b) { return M.ri(a, b); }
  function pick(a) { return M.pick(a); }
  function redondear(v, d) { return M.redondear(v, d); }
  function media(a) { return M.media(a); }

  function nombreJ(j) { return j.apellido || j.nombre || 'Vos'; }

  function elegirCompanero(plantilla, tipo) {
    const pesos = plantilla.map(function (p) {
      const pos = D.POSICIONES[p.pos] || D.POSICIONES.MC;
      return Math.max(0.03, tipo === 'fin' ? pos.fin : pos.cre);
    });
    let total = 0;
    pesos.forEach(function (w) { total += w; });
    let r = rnd() * total;
    for (let i = 0; i < plantilla.length; i++) {
      r -= pesos[i];
      if (r <= 0) return plantilla[i];
    }
    return plantilla[0];
  }

  function frase(lista, vars) {
    let s = pick(lista);
    for (const k in vars) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
    return s;
  }

  /* ---------------- textos ---------------- */
  function textoGolEquipo(partido, goleador, asistente, tipo) {
    const vars = { g: goleador, a: asistente || 'un compañero' };
    const porTipo = {
      centro: ['{g} se elevó en el área y clavó un cabezazo impecable.', 'Centro medido de {a} y {g} la empujó en el segundo palo.', '¡{g} le ganó a todos de arriba! Gol de cabeza.'],
      filtrado: ['{a} metió un pase filtrado y {g} definió solo ante el arquero.', 'Pase entre líneas de {a}: {g} la picó y entró.', '¡Qué asistencia de {a}! {g} solo tuvo que empujarla.'],
      mano_a_mano: ['{g} encaró, se sacó al defensor de encima y definió cruzado.', 'Mano a mano y {g} no perdonó: golazo.', '{g} la acomodó al segundo palo y el arquero no llegó.'],
      media_distancia: ['{g} sacó un latigazo desde afuera del área y la clavó en el ángulo.', '¡Bombazo de {g} desde lejos! La pelota entró como un misil.', 'Media distancia de {g}: el arquero voló y no llegó.'],
      rebote: ['{g} tomó el rebote y la mandó a guardar.', 'El arquero dio rebote y {g} estuvo ahí. Gol.', 'Segunda jugada: {g} la empujó en el área chica.'],
      jugada_individual: ['{g} se mandó una jugada individual y definió con clase.', '{g} dejó tres rivales en el camino y la puso al ángulo.', 'Magia de {g}: enganchó y definió al palo más lejano.'],
      penal: ['{g} cambió el penal por gol con sangre fría.', '{g} la colocó al lado del palo desde los doce pasos.']
    };
    const lista = porTipo[tipo] || porTipo.mano_a_mano;
    return frase(lista, vars);
  }
  function textoOcasionEquipo(goleador, tipo) {
    const vars = { g: goleador };
    const lista = tipo === 'cabezazo' || tipo === 'centro'
      ? ['{g} cabeceó y la pelota se fue por poco.', '¡Casi! {g} la peinó y el arquero salvó con lo justo.', 'El centro pasó por delante de {g} y no llegó.']
      : tipo === 'penal'
        ? ['El penal se fue afuera. Inimaginable.', 'El arquero contuvo el penal.']
        : ['{g} remató fuerte, pero el arquero respondió.', '{g} la tiró por arriba del travesaño.', '¡Gran atajada! {g} no pudo con el arquero.', '{g} definió y la pelota se fue besando el palo.'];
    return frase(lista, vars);
  }
  function textoOcasionContra(goleador, tipo) {
    const vars = { g: goleador };
    const lista = ['{g} remató y el arquero salvó el arco.', '{g} cabeceó y la pelota se fue ancha.', '¡Uff! {g} no pudo definir y se salvó el fondo.', '{g} la tiró afuera. Suspiro en la tribuna.'];
    return frase(lista, vars);
  }
  function textoGolContra(goleador, asistente, tipo) {
    const vars = { g: goleador, a: asistente || 'un compañero' };
    const lista = ['{a} habilitó a {g} y el rival no perdonó.', '{g} apareció solo en el área y definió. Gol en contra.', 'Error en la salida y {g} la mandó a guardar.', 'Contragolpe letal: {g} definió con el arco de frente.'];
    return frase(lista, vars);
  }

  /* ---------------- inicio del partido ---------------- */
  function crearPartido(estado, opts) {
    opts = opts || {};
    const j = estado.jugador;
    const club = D.clubPorId(j.clubId);
    const liga = D.ligaPorId(club.liga);
    const jornada = estado.mundo.semana;
    const fixtures = estado.mundo.fixtures[liga.id][jornada - 1];
    if (!fixtures) return null;
    const idx = fixtures.findIndex(function (f) { return f[0] === club.id || f[1] === club.id; });
    if (idx < 0) return null;
    const par = fixtures[idx];
    const local = par[0] === club.id;
    const rival = D.clubPorId(local ? par[1] : par[0]);
    const tactica = D.TACTICAS.find(function (t) { return t.id === (opts.tactica || j.tactica || 'posesion'); }) || D.TACTICAS[1];
    const previa = opts.previa || datosPrevia(club, rival);
    const clima = previa.clima || climaDe(liga.id);
    const arbitro = previa.arbitro || arbitroDe();
    const derbi = previa.derbi || derbiDe(club, rival);
    const agregado = ri(1, 5);
    const noche = previa.noche != null ? previa.noche : rnd() < 0.55;
    const hora = previa.hora || (noche ? pick(['20:45', '21:30', '22:00']) : pick(['16:00', '17:30', '18:30']));
    const fan = j.fanatismo == null ? 35 : j.fanatismo;

    const ovr = M.ovrJugador(j);
    const lesionado = !!(j.lesion && j.lesion.semanas > 0);
    const sancionado = j.sancion > 0;
    const minutos = lesionado || sancionado ? 0 : clamp(0, 90, opts.minutos != null ? opts.minutos : M.minutosEsperados(j, club));
    const juega = minutos > 0;

    let entrada = 0, salida = 90;
    if (!juega) { entrada = 999; salida = 0; }
    else if (minutos < 55) { entrada = 91 - minutos; salida = 90; }
    else { entrada = 0; salida = Math.min(90, minutos >= 86 ? 90 : minutos); }

    const partido = {
      jornada: jornada, liga: liga, club: club, rival: rival, local: local,
      competicion: liga.nombre, estadio: (local ? 'Estadio ' : 'Visita a ') + (local ? club.ciudad : rival.ciudad),
      tactica: tactica, minutos: minutos, entrada: entrada, salida: salida, juega: juega,
      lesionado: lesionado, sancionado: sancionado, expulsado: false,
      ovr: ovr, j: j, nombre: nombreJ(j),
      atributos: Object.assign({}, j.atributos), mods: M.modsJugador(j),
      eventos: [], momentos: [], plantillas: {
        fav: M.plantilla(estado, club.id),
        contra: M.plantilla(estado, rival.id)
      },
      stats: {
        minutos: 0, goles: 0, asistencias: 0, tiros: 0, tirosAlArco: 0, pasesClave: 0,
        regates: 0, duelos: 0, intercepciones: 0, faltas: 0, amarillas: 0, rojas: 0,
        errores: 0, penalesFallados: 0
      },
      xgFav: 0, xgContra: 0, tirosFav: 0, tirosContra: 0,
      lesion: null, finalizado: false, rating: null, mvp: false, auto: !!opts.auto,
      clima: clima, arbitro: arbitro, derbi: derbi, agregado: agregado, minutoFinal: 90 + agregado,
      noche: noche, hora: hora, charla: null, charlaMod: 1
    };

    const condEff = Math.max(j.condicion, partido.mods.energiaMin || 0);
    const condF = 0.9 + (condEff / 100) * 0.14;
    const moralF = 0.94 + (j.moral / 100) * 0.12 * (partido.mods.moral || 1);
    const formaF = 1 + (M.mediaForma(j) - 6.6) * 0.022;
    const fanF = 1 + clamp(-0.03, 0.03, (fan - 50) * 0.0012) * (local ? 1 : 0.35);
    const impacto = clamp(-9, 15, (ovr - club.fuerza) * 0.55) * (juega ? clamp(0, 1, minutos / 90) : 0);
    const atk = (club.fuerza + impacto + tactica.atk + (local ? 2 : 0)) * condF * moralF * formaF * fanF;
    const def = (club.fuerza + impacto * 0.48 + tactica.def + (local ? 1 : 0)) * condF * moralF * (1 + (fanF - 1) * 0.5);
    const rivalAtk = (rival.fuerza + (local ? -1 : 2)) * (0.965 + rnd() * 0.07) * (derbi ? 1.02 : 1);
    const rivalDef = (rival.fuerza + (local ? 2 : -1)) * (0.965 + rnd() * 0.07);
    const lambdaFav = clamp(0.12, 4.2, 1.24 * Math.pow(atk / rivalDef, 2.45) * tactica.goles * (local ? 1.10 : 0.92) * (1 + (partido.mods.companeros - 1) * 0.55) * (derbi ? 1.04 : 1));
    const lambdaCon = clamp(0.1, 3.9, 1.24 * Math.pow(rivalAtk / def, 2.45) * tactica.riesgo * (local ? 0.88 : 1.10) * partido.mods.xgRival * (derbi ? 1.05 : 1));
    partido.atk = atk; partido.def = def; partido.rivalAtk = rivalAtk; partido.rivalDef = rivalDef;
    partido.lambdaFav = lambdaFav; partido.lambdaCon = lambdaCon;

    /* lesión en el partido */
    if (juega && entrada === 0) {
      let riesgo = 0.009 + (100 - j.condicion) * 0.0005 + (j.edad >= 30 ? 0.003 : 0);
      riesgo *= 1 - (j.staff.fisico || 0) * 0.07;
      if (rnd() < riesgo) {
        const minL = ri(18, 82);
        if (minL < salida) {
          partido.lesion = M.lesionAleatoria();
          salida = Math.min(salida, minL);
          partido.salida = salida;
          partido.eventos.push({
            min: minL, tipo: 'lesion', lado: 'neutral',
            texto: 'Sentís un pinchazo. No podés seguir: ' + partido.lesion.tipo.toLowerCase() + '.'
          });
        }
      }
    }
    if (partido.sancionado) partido.eventos.push({ min: 0, tipo: 'info', lado: 'neutral', texto: 'Estás suspendido. Mirás el partido desde afuera.' });
    if (partido.lesionado) partido.eventos.push({ min: 0, tipo: 'info', lado: 'neutral', texto: 'Estás lesionado (' + j.lesion.tipo.toLowerCase() + '). No vas a jugar.' });

    /* ventana real */
    partido.minutosReales = juega ? Math.max(0, Math.min(90, partido.salida) - partido.entrada) : 0;
    partido.stats.minutos = partido.minutosReales;

    /* generación de ocasiones */
    const nFav = Math.min(15, Math.max(1, M.poisson(lambdaFav / 0.172)));
    const nCon = Math.min(15, Math.max(1, M.poisson(lambdaCon / 0.172)));
    const ocasiones = [];
    for (let i = 0; i < nFav; i++) {
      let xg = xgAleatorio();
      let tipo = tipoChance(xg);
      if (rnd() < 0.012) { tipo = 'penal'; xg = 0.78; }
      const co = coordChance('fav', xg);
      ocasiones.push({ lado: 'fav', min: minuto(), xg: xg, tipo: tipo, x: co.x, y: co.y });
    }
    for (let i = 0; i < nCon; i++) {
      let xg = xgAleatorio();
      let tipo = tipoChance(xg);
      if (rnd() < 0.012) { tipo = 'penal'; xg = 0.78; }
      const co = coordChance('contra', xg);
      ocasiones.push({ lado: 'contra', min: minuto(), xg: xg, tipo: tipo, x: co.x, y: co.y });
    }
    if (rnd() < 0.55) {
      const lado = rnd() < 0.5 ? 'fav' : 'contra';
      let xg = xgAleatorio();
      let tipo = tipoChance(xg);
      const co = coordChance(lado, xg);
      ocasiones.push({ lado: lado, min: 90 + ri(1, agregado), xg: xg, tipo: tipo, x: co.x, y: co.y, extra: true });
    }
    ocasiones.sort(function (a, b) { return a.min - b.min; });

    ocasiones.forEach(function (o) {
      const limite = o.min > 90 ? (partido.salida < 90 ? partido.salida : partido.minutoFinal) : partido.salida;
      const enCancha = partido.juega && !partido.expulsado && o.min >= partido.entrada && o.min <= limite;
      if (o.lado === 'fav') {
        partido.xgFav += o.xg; partido.tirosFav++;
        if (!enCancha) { chanceAuto(partido, o); return; }
        if (o.tipo === 'penal') {
          const tomaPenal = rnd() < 0.55 && partido.atributos.penales >= 62;
          if (tomaPenal) momentoPenal(partido, o);
          else chanceAuto(partido, o);
          return;
        }
        const pFin = probInvol(partido, 'fin');
        const pCre = probInvol(partido, 'cre');
        const r = rnd();
        if (r < pFin) {
          if (partido.momentos.length < MAX_MOMENTOS && !partido.auto) momentoTiro(partido, o);
          else tiroAuto(partido, o);
        } else if (r < pFin + pCre) {
          creacionJugador(partido, o);
        } else {
          chanceAuto(partido, o);
        }
      } else {
        partido.xgContra += o.xg; partido.tirosContra++;
        if (enCancha && o.tipo !== 'penal' && rnd() < probInvol(partido, 'def')) {
          if (partido.momentos.length < MAX_MOMENTOS && !partido.auto) momentoDefensivo(partido, o);
          else defensaAuto(partido, o);
        } else {
          chanceAuto(partido, o);
        }
      }
    });

    /* eventos de contexto */
    if (partido.juega) {
      if (partido.entrada > 0) {
        partido.eventos.push({ min: partido.entrada, tipo: 'cambio', lado: 'neutral', texto: 'Entrás al partido. Aprovechá los minutos.' });
      }
      if (partido.salida < 90 && !partido.lesion && !partido.expulsado) {
        partido.eventos.push({ min: partido.salida, tipo: 'cambio', lado: 'neutral', texto: 'Te reemplazan. Partido terminado para vos.' });
      }
    }
    partido.eventos.push({ min: 0, tipo: 'info', lado: 'neutral', texto: 'Arranca el partido: ' + club.nombre + ' vs ' + rival.nombre + '.' });
    partido.eventos.push({ min: 45, tipo: 'info', lado: 'neutral', texto: 'Entretiempo.' });
    partido.eventos.push({ min: 90, tipo: 'info', lado: 'neutral', texto: 'Se juegan ' + agregado + ' minutos de descuento.' });
    partido.eventos.push({ min: partido.minutoFinal, tipo: 'info', lado: 'neutral', texto: 'Final del partido.' });

    partido.eventos.sort(function (a, b) {
      return a.min - b.min || (a.tipo === 'info' ? -1 : 0);
    });
    partido.posesion = Math.round(clamp(30, 70, 50 + (atk - rivalAtk) * 0.42 + (tactica.id === 'posesion' ? 4 : 0) - (tactica.id === 'contra' ? 3 : 0)));
    if (!partido.juega) partido.posesion = Math.round(clamp(30, 70, 50 + (club.fuerza - rival.fuerza) * 0.5));
    return partido;
  }

  function minuto() { return ri(2, 90); }
  function xgAleatorio() {
    const r = rnd();
    if (r < 0.62) return M.rf(0.04, 0.14);
    if (r < 0.87) return M.rf(0.14, 0.32);
    return M.rf(0.32, 0.58);
  }
  function tipoChance(xg) {
    const r = rnd();
    if (xg > 0.42) return r < 0.5 ? 'mano_a_mano' : 'centro';
    if (xg > 0.26) return r < 0.4 ? 'centro' : r < 0.7 ? 'filtrado' : 'rebote';
    if (xg > 0.12) return r < 0.35 ? 'media_distancia' : r < 0.6 ? 'centro' : 'filtrado';
    return r < 0.55 ? 'media_distancia' : 'jugada_individual';
  }

  function probInvol(partido, tipo) {
    const j = partido.j;
    const pos = D.POSICIONES[j.posicion];
    const est = D.ARQUETIPOS[j.arquetipo].estilo;
    const base = tipo === 'fin' ? pos.fin : tipo === 'cre' ? pos.cre : pos.def;
    const mult = tipo === 'fin' ? est.fin : tipo === 'cre' ? est.cre : est.def;
    const star = clamp(0.7, 1.35, 0.9 + (partido.ovr - partido.club.fuerza) / 50);
    return clamp(0.02, 0.58, base * mult * star * clamp(0, 1, partido.minutosReales / 90) * 0.92);
  }

  function bonusEstilo(partido, accion) {
    const b = {
      pibe: { pase: 0.08 }, killer: { tiro: 0.08, cabezazo: 0.05 },
      flecha: { regate: 0.09 }, motor: { todo: 0.04 },
      muro: { defensa: 0.09 }, gladiador: { defensa: 0.08 },
      artista: { tiro: 0.05, pase: 0.05 }, capitan: { pase: 0.08, defensa: 0.05 }
    }[partido.j.arquetipo] || {};
    return 1 + (b[accion] || b.todo || 0);
  }

  function riesgoDe(p) { return clamp(1, 5, Math.round(5.7 - p * 8.5)); }

  function probTiro(xg, skill, mods, tipo, min) {
    let p = xg * (0.55 + (skill - 45) / 95) * 1.18;
    if (tipo !== 'media_distancia' && tipo !== 'penal') p *= mods.area;
    if (xg >= 0.3) p *= mods.instinto;
    if (tipo === 'falta') p *= mods.balonParado;
    if (tipo === 'penal') p = clamp(0.5, 0.95, 0.6 + (skill - 50) / 160);
    return clamp(0.02, 0.88, p);
  }
  function probRegate(a, mods) {
    return clamp(0.15, 0.88, (0.35 + (a.regate - 50) / 120 + (a.agilidad - 50) / 320) * mods.regate);
  }
  function probPase(a, mods, tipo) {
    let p = 0.55 + (a.vision - 50) / 150 + (a.paseCorto - 50) / 260;
    if (tipo === 'filtrado') p *= mods.paseFiltrado;
    p *= 1 + (1 - mods.perdidas) * 0.8;
    return clamp(0.3, 0.94, p);
  }

  function opcionesTiro(partido, xg, tipo, min) {
    const a = partido.atributos, mods = partido.mods;
    const clutch = min >= 75 ? mods.clutch : 1;
    const factor = (partido.clima ? partido.clima.precision : 1) * (min > 45 ? (partido.charlaMod || 1) : 1);
    const pCol = probTiro(xg, a.definicion * 0.62 + a.compostura * 0.38, mods, tipo, min) * clutch * bonusEstilo(partido, 'tiro') * factor;
    const pPot = probTiro(xg * 1.06, a.tiroLejano * 0.65 + a.fuerza * 0.35, mods, tipo, min) * 0.94 * clutch * bonusEstilo(partido, 'tiro') * factor;
    const pCab = probTiro(xg * 1.12, a.cabeceo * 0.6 + a.salto * 0.4, mods, tipo, min) * clutch * bonusEstilo(partido, 'cabezazo') * factor;
    const pReg = probRegate(a, mods) * bonusEstilo(partido, 'regate');
    const pPaseOk = probPase(a, mods, tipo) * bonusEstilo(partido, 'pase');
    const pComp = clamp(0.08, 0.55, xg * 1.05 + 0.04) * mods.asistencias * factor;
    const pGolTrasRegate = probTiro(xg * 1.3, a.definicion * 0.55 + a.tecnica * 0.45, mods, tipo, min) * (1 + mods.ocasionExtra * 0.5) * factor;
    const pRegGol = pReg * pGolTrasRegate;
    const pAsist = pPaseOk * pComp;
    const pLibre = probTiro(xg * 1.1, a.tiroLejano * 0.55 + a.tecnica * 0.45, mods, 'falta', min) * mods.balonParado * factor;

    const ops = [];
    function add(id, n, icon, desc, attrs, accion, p, extra) {
      ops.push(Object.assign({
        id: id, n: n, icon: icon, desc: desc, attrs: attrs, accion: accion,
        pExito: clamp(0.01, 0.95, p), riesgo: riesgoDe(p)
      }, extra || {}));
    }
    if (tipo === 'penal') {
      add('colocado', 'Colocado', '🎯', 'Pegale al rincón con el interior. Sangre fría.', ['Definición', 'Compostura'], 'penal',
        probTiro(0.78, a.definicion * 0.45 + a.compostura * 0.55, mods, 'penal', min) * clutch, { pGol: probTiro(0.78, a.definicion * 0.45 + a.compostura * 0.55, mods, 'penal', min) * clutch });
      add('potencia', 'Potencia', '💣', 'Le pegás fuerte y arriba. El arquero adivina.', ['Tiro lejano', 'Fuerza'], 'penal',
        probTiro(0.78, a.tiroLejano * 0.5 + a.fuerza * 0.5, mods, 'penal', min) * 0.96, { pGol: probTiro(0.78, a.tiroLejano * 0.5 + a.fuerza * 0.5, mods, 'penal', min) * 0.96 });
      return ops;
    }
    if (tipo === 'centro') {
      add('cabezazo', 'Cabezazo', '🗿', 'Ganá en el aire y cabeceá al segundo palo.', ['Cabeceo', 'Salto'], 'cabezazo', pCab, { pGol: pCab });
      add('volea', 'Volea', '🎯', 'Acomodate de frente y sacá el latigazo.', ['Definición', 'Técnica'], 'tiro', pCol, { pGol: pCol });
      add('pase', 'Pase atrás', '🎁', 'La dejás atrás para el que llega de frente.', ['Visión', 'Pase corto'], 'pase', pAsist, { pPase: pPaseOk, pComp: pComp });
      if (mods.acrobatico) add('chilena', 'Chilena', '🤸', 'Todo o nada: la chilena.', ['Técnica', 'Agilidad'], 'tiro', pCab * 0.55 + 0.04, { pGol: pCab * 0.55 + 0.04 });
    } else if (tipo === 'filtrado') {
      add('colocado', 'Tiro colocado', '🎯', 'Recibís entre líneas y la ponés al rincón.', ['Definición', 'Compostura'], 'tiro', pCol, { pGol: pCol });
      add('regate', 'Encarar', '🌀', 'Uno contra uno: te sacás al arquero de encima.', ['Regate', 'Agilidad'], 'regate', pRegGol, { pReg: pReg, pGolTras: pGolTrasRegate });
      add('pase', 'Asistencia', '🔑', 'El pase filtrado que deja solo a tu compañero.', ['Visión', 'Pase corto'], 'pase', pAsist, { pPase: pPaseOk, pComp: pComp });
    } else if (tipo === 'mano_a_mano') {
      add('regate', 'Encarar', '🌀', 'Lo encarás y definís cuando cae el arquero.', ['Regate', 'Agilidad'], 'regate', pRegGol, { pReg: pReg, pGolTras: pGolTrasRegate });
      add('colocado', 'Definir cruzado', '🎯', 'La abrís al segundo palo con el interior.', ['Definición', 'Compostura'], 'tiro', pCol, { pGol: pCol });
      add('potencia', 'Potencia', '💣', 'Le pegás fuerte al primer palo.', ['Tiro lejano', 'Fuerza'], 'tiro', pPot, { pGol: pPot });
    } else if (tipo === 'media_distancia') {
      add('potencia', 'Bombazo', '💣', 'Desde afuera, con alma y vida.', ['Tiro lejano', 'Fuerza'], 'tiro', pPot, { pGol: pPot });
      add('colocado', 'Colocada', '🎯', 'La ponés donde el arquero no llega.', ['Definición', 'Compostura'], 'tiro', pCol, { pGol: pCol });
      add('pase', 'Pase al área', '🎁', 'En vez de rematar, la colgás al área.', ['Visión', 'Pase corto'], 'pase', pAsist, { pPase: pPaseOk, pComp: pComp });
    } else if (tipo === 'falta') {
      add('tiro_libre', 'Tiro libre', '🎯', 'La barrera, el arquero y vos.', ['Tiro lejano', 'Técnica'], 'tiro', pLibre, { pGol: pLibre });
      add('centro', 'Centro al área', '📡', 'La colgás al segundo palo para el cabezazo.', ['Pase largo', 'Visión'], 'pase', pAsist, { pPase: pPaseOk, pComp: pComp });
      add('pase', 'Jugada ensayada', '🤝', 'Tocás corto y armás la pared.', ['Visión', 'Pase corto'], 'pase', pAsist * 0.96, { pPase: pPaseOk, pComp: pComp });
    } else {
      add('colocado', 'Tiro colocado', '🎯', 'Te perfilás y la ponés al rincón.', ['Definición', 'Compostura'], 'tiro', pCol, { pGol: pCol });
      add('potencia', 'Potencia', '💣', 'Le pegás con todo al primer palo.', ['Tiro lejano', 'Fuerza'], 'tiro', pPot, { pGol: pPot });
      add('pase', 'Asistencia', '🔑', 'La dejás servida para el gol de tu compañero.', ['Visión', 'Pase corto'], 'pase', pAsist, { pPase: pPaseOk, pComp: pComp });
    }
    return ops;
  }

  function opcionesDefensa(partido, xg, min) {
    const a = partido.atributos, mods = partido.mods;
    const factor = (partido.clima ? partido.clima.precision : 1) * (min > 45 ? (partido.charlaMod || 1) : 1);
    const pAnt = clamp(0.05, 0.95, clamp(0.2, 0.86, (0.4 + (a.anticipacion - 50) / 110 + (a.intercepcion - 50) / 230) * mods.defensa * bonusEstilo(partido, 'defensa')) * factor);
    const pAgu = clamp(0.05, 0.95, clamp(0.3, 0.9, (0.5 + (a.marca - 50) / 120 + (a.fuerza - 50) / 210) * mods.defensa * bonusEstilo(partido, 'defensa')) * factor);
    const pBar = clamp(0.05, 0.95, clamp(0.2, 0.84, (0.38 + (a.entrada - 50) / 105 + (a.agresividad - 50) / 320) * mods.defensa * bonusEstilo(partido, 'defensa')) * factor);
    return [
      { id: 'anticipar', n: 'Anticipar', icon: '🔮', desc: 'Leés el pase y lo cortás antes de que llegue.', attrs: ['Anticipación', 'Intercepción'], accion: 'defensa', modo: 'parar', pExito: pAnt, riesgo: riesgoDe(pAnt) },
      { id: 'aguantar', n: 'Aguantar', icon: '🧍', desc: 'Le cerrás el espacio y esperás su error.', attrs: ['Marca', 'Fuerza'], accion: 'defensa', modo: 'reducir', pExito: pAgu, riesgo: riesgoDe(pAgu) },
      { id: 'barrer', n: 'Barrer', icon: '🦶', desc: 'Entrada decidida. Puede ser falta.', attrs: ['Entrada', 'Agresividad'], accion: 'defensa', modo: 'barrer', pExito: pBar, riesgo: riesgoDe(pBar) }
    ];
  }

  /* ---------------- resolución ---------------- */
  function golPartido(partido, lado, min, goleador, asistente, tipo, jugador, cx, cy) {
    const ev = {
      min: min, tipo: 'gol', lado: lado, goleador: goleador, asistente: asistente,
      jugador: !!jugador, icono: '⚽', x: cx, y: cy,
      texto: lado === 'fav'
        ? (jugador ? '' : textoGolEquipo(partido, goleador, asistente, tipo))
        : textoGolContra(goleador, asistente, tipo)
    };
    if (rnd() < 0.2) ev.var = { revisado: true, anulado: rnd() < 0.16, visto: false };
    partido.eventos.push(ev);
    return ev;
  }

  function chanceAuto(partido, o) {
    const lado = o.lado;
    const plantilla = lado === 'fav' ? partido.plantillas.fav : partido.plantillas.contra;
    const creador = elegirCompanero(plantilla, 'cre');
    const finisher = elegirCompanero(plantilla, 'fin');
    let xg = o.xg * (0.88 + (creador.nivel - 65) / 240);
    let p = xg * 1.02;
    if (o.tipo === 'penal') p = 0.78;
    if (partido.clima) p *= partido.clima.precision;
    if (lado === 'contra') p *= partido.mods.rivalPrecision;
    if (lado === 'fav') p *= 1 + (partido.mods.companeros - 1) * 0.4;
    if (o.extra) p *= 0.9;
    p = clamp(0.01, 0.9, p);
    if (rnd() < p) {
      golPartido(partido, lado, o.min, finisher.nombre, rnd() < 0.68 ? creador.nombre : null, o.tipo, false, o.x, o.y);
    } else {
      partido.eventos.push({
        min: o.min, tipo: 'ocasion', lado: lado, jugador: false, icono: '🥅', x: o.x, y: o.y,
        texto: lado === 'fav' ? textoOcasionEquipo(finisher.nombre, o.tipo) : textoOcasionContra(finisher.nombre, o.tipo)
      });
    }
  }

  function creacionJugador(partido, o) {
    const s = partido.stats;
    const comp = elegirCompanero(partido.plantillas.fav, 'fin');
    const climaP = partido.clima ? partido.clima.precision : 1;
    const pPase = probPase(partido.atributos, partido.mods, o.tipo) * bonusEstilo(partido, 'pase') * climaP;
    if (rnd() >= pPase) {
      partido.eventos.push({ min: o.min, tipo: 'ocasion', lado: 'fav', jugador: true, icono: '❌', x: o.x, y: o.y, texto: 'Tu pase no llegó: la jugada se apagó.' });
      s.errores++;
      return;
    }
    s.pasesClave++;
    const pComp = clamp(0.08, 0.58, o.xg * 1.1 + 0.04) * partido.mods.asistencias * climaP;
    if (rnd() < pComp) {
      s.asistencias++;
      golPartido(partido, 'fav', o.min, comp.nombre, partido.nombre, o.tipo, false, o.x, o.y);
      const ev = partido.eventos[partido.eventos.length - 1];
      ev.jugador = true; ev.asistenteJugador = true;
      ev.texto = 'Tu pase fue un bisturí: ' + comp.nombre + ' solo tuvo que empujarla. ¡Asistencia tuya!';
    } else {
      partido.eventos.push({ min: o.min, tipo: 'ocasion', lado: 'fav', jugador: true, icono: '🔑', x: o.x, y: o.y, texto: 'Tu pase dejó solo a ' + comp.nombre + ', pero el arquero lo salvó. Pase clave.' });
    }
  }

  function tiroAuto(partido, o) {
    const opts = opcionesTiro(partido, o.xg, o.tipo, o.min);
    const best = opts.slice().sort(function (a, b) { return b.pExito - a.pExito; })[0];
    const comp = elegirCompanero(partido.plantillas.fav, 'fin').nombre;
    ejecutarOpcion(partido, best, o.xg, o.tipo, o.min, comp, true, o.x, o.y);
  }

  function defensaAuto(partido, o) {
    const opts = opcionesDefensa(partido, o.xg, o.min);
    const best = opts.slice().sort(function (a, b) { return b.pExito - a.pExito; })[0];
    const res = ejecutarDefensa(partido, best, o.xg, o.min, o.x, o.y);
    if (res) partido.eventos.push(res);
  }

  function momentoTiro(partido, o) {
    const m = {
      id: 'mom' + partido.momentos.length, min: o.min, xg: o.xg, tipo: o.tipo, lado: 'fav',
      x: o.x, y: o.y,
      resuelto: false, opciones: opcionesTiro(partido, o.xg, o.tipo, o.min),
      companero: elegirCompanero(partido.plantillas.fav, 'fin').nombre
    };
    partido.momentos.push(m);
    partido.eventos.push({
      min: o.min, tipo: 'momento', lado: 'fav', momento: m, icono: '⚡', jugador: true,
      texto: 'Tenés la pelota y el arco de frente. ¿Qué hacés?'
    });
  }

  function momentoPenal(partido, o) {
    const m = {
      id: 'mom' + partido.momentos.length, min: o.min, xg: 0.78, tipo: 'penal', lado: 'fav',
      x: 84, y: 50,
      resuelto: false, opciones: opcionesTiro(partido, 0.78, 'penal', o.min),
      companero: elegirCompanero(partido.plantillas.fav, 'fin').nombre
    };
    partido.momentos.push(m);
    partido.eventos.push({
      min: o.min, tipo: 'momento', lado: 'fav', momento: m, icono: '🎯', jugador: true,
      texto: '¡Penal para tu equipo! Agarrás la pelota. Doce pasos y el arquero.'
    });
  }

  function momentoDefensivo(partido, o) {
    const m = {
      id: 'mom' + partido.momentos.length, min: o.min, xg: o.xg, tipo: o.tipo, lado: 'contra',
      x: o.x, y: o.y,
      resuelto: false, opciones: opcionesDefensa(partido, o.xg, o.min),
      rivalNombre: elegirCompanero(partido.plantillas.contra, 'fin').nombre
    };
    partido.momentos.push(m);
    partido.eventos.push({
      min: o.min, tipo: 'momento', lado: 'contra', momento: m, icono: '🛡️', jugador: true,
      texto: m.rivalNombre + ' encara hacia tu zona. El equipo depende de vos.'
    });
  }

  function textoGolJugador(op, tipo) {
    const d = {
      colocado: 'La clavaste en el ángulo. El arquero no llegó ni con la mirada.',
      potencia: 'Le pegaste con el alma. La red todavía tiembla.',
      cabezazo: 'Te elevaste sobre todos y la pusiste contra el palo.',
      regate: 'Dejaste dos rivales en el camino y definiste con clase.',
      chilena: '¡Chilena tuya! La pelota entró y el estadio explotó.',
      colocado_penal: 'Doce pasos, sangre fría y adentro.',
      potencia_penal: 'Le pegaste al medio y el arquero se fue al costado.'
    };
    return d[op.id] || '¡La mandaste a guardar!';
  }

  function ejecutarOpcion(partido, op, xg, tipo, min, companero, esAuto, cx, cy) {
    const s = partido.stats;
    const jn = partido.nombre;
    let ev;
    if (op.accion === 'pase') {
      if (rnd() < (op.pPase || 0.6)) {
        s.pasesClave++;
        if (rnd() < (op.pComp || 0.2)) {
          s.asistencias++;
          golPartido(partido, 'fav', min, companero, jn, tipo, false, cx, cy);
          ev = partido.eventos[partido.eventos.length - 1];
          ev.asistenteJugador = true;
          ev.texto = '¡Asistencia tuya! Tu pase dejó a ' + companero + ' solo frente al arco.';
          return { tipo: 'gol', texto: ev.texto, goleador: companero, asistente: jn, icono: '🅰️', jugador: true };
        }
        partido.eventos.push({ min: min, tipo: 'ocasion', lado: 'fav', jugador: true, icono: '🔑', x: cx, y: cy, texto: 'Tu pase fue perfecto, pero ' + companero + ' no pudo definir. Pase clave.' });
        return { tipo: 'ocasion', texto: 'Pase clave tuyo, pero sin gol.', icono: '🔑' };
      }
      s.errores++;
      partido.eventos.push({ min: min, tipo: 'ocasion', lado: 'fav', jugador: true, icono: '❌', x: cx, y: cy, texto: 'El pase te salió largo. Otra oportunidad perdida.' });
      return { tipo: 'ocasion', texto: 'El pase no llegó.', icono: '❌' };
    }

    if (op.accion === 'regate') {
      if (rnd() < (op.pReg || 0.5)) {
        s.regates++;
        if (rnd() < (op.pGolTras || 0.2)) {
          s.goles++; s.tiros++; s.tirosAlArco++;
          golPartido(partido, 'fav', min, jn, null, tipo, true, cx, cy);
          ev = partido.eventos[partido.eventos.length - 1];
          ev.texto = '¡GOL TUYO! ' + textoGolJugador({ id: 'regate' }, tipo);
          return { tipo: 'gol', texto: ev.texto, goleador: jn, icono: '⚽', jugador: true };
        }
        s.tiros++; s.tirosAlArco++;
        partido.eventos.push({ min: min, tipo: 'ocasion', lado: 'fav', jugador: true, icono: '🥅', x: cx, y: cy, texto: 'Te sacaste al defensor de encima, pero el arquero te tapó el remate.' });
        return { tipo: 'ocasion', texto: 'Gran regate, remate atajado.', icono: '🥅' };
      }
      s.errores++;
      partido.eventos.push({ min: min, tipo: 'ocasion', lado: 'fav', jugador: true, icono: '❌', x: cx, y: cy, texto: 'Te la quitaron en el intento. La jugada murió.' });
      return { tipo: 'ocasion', texto: 'Perdiste la pelota en el regate.', icono: '❌' };
    }

    /* tiro, cabezazo o penal */
    s.tiros++;
    let p = op.pGol != null ? op.pGol : op.pExito;
    if (op.accion === 'penal') p *= 1;
    if (rnd() < p) {
      s.goles++; s.tirosAlArco++;
      golPartido(partido, 'fav', min, jn, null, tipo, true, cx, cy);
      ev = partido.eventos[partido.eventos.length - 1];
      ev.texto = '¡GOL TUYO! ' + textoGolJugador(op, tipo);
      return { tipo: 'gol', texto: ev.texto, goleador: jn, icono: '⚽', jugador: true };
    }
    if (op.accion === 'penal') s.penalesFallados++;
    if (rnd() < 0.62) s.tirosAlArco++;
    if (xg >= 0.38 && op.accion !== 'penal') s.errores++;
    const fallos = [
      'Tu remate se fue alto. Otra vez será.',
      'El arquero te adivinó. Gran atajada.',
      'La pelota pegó en el palo. Increíble.',
      'Te faltó precisión: la pelota se fue ancha.',
      'El defensor alcanzó a desviarla en el último momento.'
    ];
    partido.eventos.push({ min: min, tipo: 'ocasion', lado: 'fav', jugador: true, icono: '🥅', x: cx, y: cy, texto: pick(fallos) });
    return { tipo: 'ocasion', texto: 'No pudiste convertir.', icono: '🥅' };
  }

  function tarjetaJugador(partido, min, roja) {
    const s = partido.stats;
    if (roja) {
      s.rojas++;
      partido.expulsado = true;
      partido.salida = Math.min(partido.salida, min);
      partido.eventos.push({ min: min, tipo: 'tarjeta', lado: 'neutral', jugador: true, icono: '🟥', texto: 'Roja directa para vos. Te vas expulsado.' });
    } else {
      s.amarillas++;
      if (s.amarillas >= 2) {
        s.rojas++;
        partido.expulsado = true;
        partido.salida = Math.min(partido.salida, min);
        partido.eventos.push({ min: min, tipo: 'tarjeta', lado: 'neutral', jugador: true, icono: '🟨🟥', texto: 'Segunda amarilla: te expulsan.' });
      } else {
        partido.eventos.push({ min: min, tipo: 'tarjeta', lado: 'neutral', jugador: true, icono: '🟨', texto: 'Amarilla para vos por una entrada fuerte.' });
      }
    }
  }

  function ejecutarDefensa(partido, op, xg, min, cx, cy) {
    const s = partido.stats;
    const rival = partido.plantillas.contra ? elegirCompanero(partido.plantillas.contra, 'fin').nombre : 'El rival';
    const rigor = (partido.arbitro ? partido.arbitro.rigor : 1) * (partido.derbi ? 1.2 : 1) * (partido.clima ? partido.clima.cards : 1);
    const ok = rnd() < op.pExito;
    let xgFinal = xg;
    let parado = false;
    if (op.modo === 'parar') {
      if (ok) { parado = true; s.intercepciones++; s.duelos++; }
      else { xgFinal = xg * 1.18; s.errores++; }
    } else if (op.modo === 'reducir') {
      if (ok) { xgFinal = xg * 0.45; s.duelos++; }
      else { xgFinal = xg * 1.12; s.errores++; }
    } else {
      if (ok) { parado = true; s.intercepciones++; s.duelos++; }
      else {
        s.faltas++;
        const roja = rnd() < 0.035 * rigor;
        if (rnd() < 0.24 * rigor || roja) tarjetaJugador(partido, min, roja);
        if (xg > 0.3 && rnd() < 0.07 * rigor) {
          xgFinal = 0.78;
          partido.eventos.push({ min: min, tipo: 'info', lado: 'contra', icono: '⚠️', texto: '¡Penal para el rival por tu entrada!' });
        } else {
          xgFinal = xg * 1.3;
        }
        s.errores++;
      }
    }
    if (parado) {
      return { min: min, tipo: 'defensa', lado: 'fav', jugador: true, icono: '🛡️', x: cx, y: cy, texto: ok ? 'Leíste la jugada y cortaste el ataque. Gran defensa.' : 'Cortaste el ataque.' };
    }
    const p = clamp(0.02, 0.9, xgFinal * 1.05 * partido.mods.rivalPrecision);
    if (rnd() < p) {
      golPartido(partido, 'contra', min, rival, null, 'mano_a_mano', false, cx, cy);
      const ev = partido.eventos[partido.eventos.length - 1];
      ev.icono = '⚽';
      ev.texto = 'El rival te ganó la posición y definió. Gol en contra.';
      return ev;
    }
    return { min: min, tipo: 'ocasion', lado: 'contra', jugador: true, icono: '🛡️', x: cx, y: cy, texto: ok ? 'Aguantaste bien y el rival remató incómodo. Se salvó.' : 'El rival remató, pero el arquero respondió.' };
  }

  function resolverMomento(partido, id, opcionId) {
    const m = partido.momentos.find(function (x) { return x.id === id; });
    if (!m || m.resuelto) return null;
    const op = m.opciones.find(function (o) { return o.id === opcionId; }) || m.opciones[0];
    const ev = partido.eventos.find(function (e) { return e.momento === m; });
    const antes = partido.eventos.length;
    m.resuelto = true;
    m.opcion = op.id;
    let res;
    if (m.lado === 'fav') res = ejecutarOpcion(partido, op, m.xg, m.tipo, m.min, m.companero, false, m.x, m.y);
    else res = ejecutarDefensa(partido, op, m.xg, m.min, m.x, m.y);
    const nuevos = partido.eventos.slice(antes);
    const idx = partido.eventos.indexOf(ev);
    if (idx >= 0) partido.eventos.splice(idx, 1);
    const tienePrincipal = nuevos.some(function (e) { return e.tipo === 'gol' || e.tipo === 'ocasion'; });
    if (!tienePrincipal && res) {
      partido.eventos.push({
        min: res.min != null ? res.min : m.min,
        tipo: res.tipo, lado: res.lado || (m.lado === 'fav' ? 'fav' : 'contra'),
        texto: res.texto, goleador: res.goleador, asistente: res.asistente,
        icono: res.icono, jugador: true,
        x: res.x != null ? res.x : m.x, y: res.y != null ? res.y : m.y
      });
    }
    return res;
  }

  function anularGol(partido, ev) {
    if (!ev || ev.anulado) return;
    ev.anulado = true;
    ev.texto = (ev.texto || '') + ' VAR: gol anulado.';
    if (ev.goleador === partido.nombre) {
      partido.stats.goles = Math.max(0, partido.stats.goles - 1);
      partido.stats.tirosAlArco = Math.max(0, partido.stats.tirosAlArco - 1);
    }
    if (ev.asistente === partido.nombre) partido.stats.asistencias = Math.max(0, partido.stats.asistencias - 1);
  }

  function aplicarCharla(partido, id) {
    const ops = {
      tranquilo: { mod: 1.0, fan: 0, dt: -1, moral: 3, texto: 'Les pedí calma. El partido es largo.' },
      exigente: { mod: 1.08, fan: 1, dt: 3, moral: -2, texto: 'Les exigí más. No alcanza con esto.' },
      motivador: { mod: 1.05, fan: 2, dt: 1, moral: 2, texto: 'Les recordé para qué jugamos. Vamos por el triunfo.' }
    };
    const o = ops[id] || ops.tranquilo;
    partido.charla = { id: id || 'tranquilo', mod: o.mod, fan: o.fan, dt: o.dt, moral: o.moral, texto: o.texto };
    partido.charlaMod = o.mod;
    (partido.momentos || []).forEach(function (m) {
      if (m.min > 45 && !m.resuelto) {
        m.opciones = m.lado === 'fav' ? opcionesTiro(partido, m.xg, m.tipo, m.min) : opcionesDefensa(partido, m.xg, m.min);
      }
    });
    return partido.charla;
  }

  function calcularRating(partido) {
    const s = partido.stats;
    if (!partido.juega || s.minutos <= 0) return null;
    let r = 6.25;
    r += s.goles * 1.1 + s.asistencias * 0.55 + s.pasesClave * 0.08 + s.regates * 0.05 + s.duelos * 0.05 + s.intercepciones * 0.07 + s.tirosAlArco * 0.035;
    r -= s.errores * 0.15 + s.penalesFallados * 0.4 + s.amarillas * 0.12 + s.rojas * 0.7;
    const gf = partido.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'fav' && !e.anulado; }).length;
    const gc = partido.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'contra' && !e.anulado; }).length;
    const d = gf - gc;
    r += d > 0 ? 0.35 : d < 0 ? -0.12 : 0;
    if (s.minutos < 25 && s.goles === 0 && s.asistencias === 0) r = Math.min(r, 6.9);
    return redondear(clamp(4, 10, r), 1);
  }

  function finalizarPartido(partido) {
    if (partido.finalizado) return partido;
    partido.momentos.forEach(function (m) {
      if (!m.resuelto) resolverMomento(partido, m.id, m.opciones[0].id);
    });
    partido.eventos.forEach(function (e) {
      if (e.var && !e.var.visto) {
        e.var.visto = true;
        if (e.var.anulado) anularGol(partido, e);
      }
    });
    partido.varAnulados = partido.eventos.filter(function (e) { return e.anulado; }).length;
    partido.golesFav = partido.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'fav' && !e.anulado; }).length;
    partido.golesContra = partido.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'contra' && !e.anulado; }).length;
    partido.stats.minutos = partido.juega ? Math.max(0, Math.min(partido.minutoFinal || 90, partido.salida) - partido.entrada) : 0;
    partido.rating = calcularRating(partido);
    partido.mvp = partido.rating != null && partido.rating >= 7.4 && partido.stats.minutos >= 20;
    partido.resultado = partido.golesFav > partido.golesContra ? 'V' : partido.golesFav < partido.golesContra ? 'D' : 'E';
    const resist = partido.atributos.resistencia || 60;
    const fatigaClima = partido.clima ? partido.clima.fatiga : 1;
    partido.costoFisico = redondear((6 + (100 - resist) * 0.09) * (partido.stats.minutos / 90) * partido.mods.fatiga * fatigaClima * (partido.derbi ? 1.06 : 1), 1);
    partido.costoMoral = partido.resultado === 'V' ? 4 : partido.resultado === 'D' ? -4 : 1;
    if (partido.stats.goles > 0) partido.costoMoral += 2;
    if (partido.mvp) partido.costoMoral += 3;
    if (partido.stats.minutos === 0) partido.costoMoral -= 2;
    partido.finalizado = true;
    return partido;
  }

  function simularCompleto(estado, opts) {
    const p = crearPartido(estado, Object.assign({ auto: true }, opts || {}));
    if (!p) return null;
    return finalizarPartido(p);
  }

  global.Motor.crearPartido = crearPartido;
  global.Motor.resolverMomento = resolverMomento;
  global.Motor.finalizarPartido = finalizarPartido;
  global.Motor.simularCompleto = simularCompleto;
  global.Motor.calcularRating = calcularRating;
  global.Motor.opcionesTiro = opcionesTiro;
  global.Motor.opcionesDefensa = opcionesDefensa;
  global.Motor.bonusEstilo = bonusEstilo;
  global.Motor.anularGol = anularGol;
  global.Motor.aplicarCharla = aplicarCharla;
  global.Motor.datosPrevia = datosPrevia;
})(typeof window !== 'undefined' ? window : globalThis);
