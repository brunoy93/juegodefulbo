/* =========================================================
   LEYENDA · interfaz — partido en vivo, reporte y temporada
   ========================================================= */
(function (global) {
  'use strict';
  const D = global.DATOS, M = global.Motor, J = global.Juego, UI = global.UI;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clamp(a, b, v) { return v < a ? a : v > b ? b : v; }
  function fNota(n) { return (Number(n) || 0).toFixed(1).replace('.', ','); }
  function fDinero(k) { return UI.fDinero(k); }
  function colorNota(n) { return UI.colorNota(n); }
  function jugador() { return J.estado.jugador; }
  function mundo() { return J.estado.mundo; }

  function formaClub(ligaId, clubId) {
    const fx = mundo().fixtures[ligaId] || [];
    const rs = mundo().resultados[ligaId] || [];
    const out = [];
    for (let md = 0; md < fx.length; md++) {
      const idx = (fx[md] || []).findIndex(function (f) { return f[0] === clubId || f[1] === clubId; });
      if (idx < 0) continue;
      const r = rs[md] && rs[md][idx];
      if (!r) continue;
      const local = fx[md][idx][0] === clubId;
      const gf = local ? r[0] : r[1], gc = local ? r[1] : r[0];
      out.push(gf > gc ? 'V' : gf < gc ? 'D' : 'E');
    }
    return out.slice(-5);
  }
  function formaHTML(forma) {
    if (!forma.length) return '<span class="mini muted">Sin datos</span>';
    return forma.map(function (r) {
      return '<span class="tag-mini ' + (r === 'V' ? 'lima' : r === 'D' ? 'rojo' : '') + '">' + r + '</span>';
    }).join(' ');
  }
  function posClub(ligaId, clubId) {
    const t = M.tabla(J.estado, ligaId);
    const f = t.find(function (x) { return x.club.id === clubId; });
    return f ? f.pos : '—';
  }

  /* ---------------- pre-partido ---------------- */
  function vPartido() {
    const j = jugador(), m = mundo(), c = J.clubActual(), l = J.ligaActual();
    const prox = J.proximoPartido();
    const lesion = j.lesion && j.lesion.semanas > 0;
    const sanc = j.sancion > 0;
    if (m.fase === 'fin') {
      return '<div class="card" style="max-width:640px;margin:40px auto;text-align:center;padding:34px"><div style="font-size:36px">🏁</div><div style="font-family:var(--display);font-size:32px;text-transform:uppercase;line-height:1;margin:8px 0">Temporada terminada</div><p class="mini muted">Revisá el resumen, los premios y las ofertas para la próxima temporada.</p><button class="btn primario" style="margin-top:16px" data-accion="ver-resumen">Ver resumen →</button></div>';
    }
    if (m.partidoJugado) {
      return '<div class="card" style="max-width:640px;margin:40px auto;text-align:center;padding:34px"><div style="font-size:36px">✅</div><div style="font-family:var(--display);font-size:30px;text-transform:uppercase;line-height:1;margin:8px 0">Fecha jugada</div><p class="mini muted">Ya disputaste el partido de esta semana. Cerrá la fecha para seguir.</p><button class="btn primario" style="margin-top:16px" data-accion="continuar-semana">Continuar semana →</button></div>';
    }
    if (!prox) {
      return '<div class="card"><div class="det-vacio">No hay próximo partido disponible.</div></div>';
    }
    const rival = prox.rival;
    if (!UI.previaPartido || UI.previaPartido.jornada !== prox.jornada || UI.previaPartido.rivalId !== rival.id || UI.previaPartido.anyo !== m.anyo) {
      UI.previaPartido = prox.previa || (M.datosPrevia ? M.datosPrevia(c, rival) : null);
      if (UI.previaPartido) { UI.previaPartido.jornada = prox.jornada; UI.previaPartido.rivalId = rival.id; UI.previaPartido.anyo = m.anyo; }
    }
    const previa = UI.previaPartido;
    const rol = J.rolActual();
    const min = J.minutosPrevistos();
    const tabla = M.tabla(J.estado, l.id);
    const filaMia = tabla.find(function (r) { return r.club.id === c.id; });
    const rivalPos = posClub(l.id, rival.id);
    const rivalForma = formaClub(l.id, rival.id);
    const miForma = formaClub(l.id, c.id);
    const goleo = M.goleadores(J.estado, l.id);
    const goleadorRival = goleo.find(function (g) { return g.clubId === rival.id; });
    const tact = D.TACTICAS.find(function (t) { return t.id === (j.tactica || 'posesion'); }) || D.TACTICAS[1];

    const tacticas = D.TACTICAS.map(function (t) {
      return '<button class="tactica ' + (t.id === tact.id ? 'activo' : '') + '" data-accion="set-tactica" data-tac="' + t.id + '"><b>' + t.icon + ' ' + t.n + '</b><span>' + t.desc + '</span></button>';
    }).join('');

    return '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:18px">' +
        '<div><h1 class="titulo-vista">Día de <em>partido</em></h1><p class="sub-vista">La previa, tu rol y la táctica. Después, 90 minutos que se resuelven con lo que construiste.</p></div>' +
        '<div class="chip lima">' + l.bandera + ' ' + l.nombre + ' · Fecha ' + m.semana + ' de ' + l.jornadas + '</div>' +
      '</div>' +
      '<div class="prepartido">' +
        '<div class="pila">' +
          '<div class="card">' +
            '<div class="card-titulo"><h3><span class="ico">⚽</span>' + (prox.local ? 'De local' : 'De visitante') + '</h3><span class="tag-mini">' + esc(prox.estadio) + '</span></div>' +
            '<div class="duelo">' +
              '<div class="eq">' + UI.escudo(c, 72) + '<b>' + esc(c.nombre) + '</b><span>' + (prox.local ? 'LOCAL' : 'VISITANTE') + ' · ' + (filaMia ? filaMia.pos + 'º' : '—') + '</span></div>' +
              '<div class="vs">VS<small>FECHA ' + m.semana + '</small></div>' +
              '<div class="eq">' + UI.escudo(rival, 72) + '<b>' + esc(rival.nombre) + '</b><span>' + (prox.local ? 'VISITANTE' : 'LOCAL') + ' · ' + rivalPos + 'º</span></div>' +
            '</div>' +
            '<div class="prox-meta">' +
              '<span class="chip lima">' + rol.icon + ' ' + rol.n + '</span>' +
              '<span class="chip">⏱ ' + (lesion || sanc ? 0 : min) + ' min</span>' +
              '<span class="chip">🔋 ' + Math.round(j.condicion) + '%</span>' +
              '<span class="chip">📋 ' + tact.n + '</span>' +
              (previa ? '<span class="chip">' + previa.clima.icon + ' ' + previa.clima.n + ' · ' + previa.hora + '</span>' : '') +
              (previa ? '<span class="chip">🧑‍⚖️ ' + esc(previa.arbitro.n) + '</span>' : '') +
              (previa && previa.derbi ? '<span class="chip oro">🔥 ' + esc(previa.derbi.n) + '</span>' : '') +
            '</div>' +
            (previa && previa.derbi ? '<div class="aviso oro" style="margin-top:10px">🔥 <b>' + esc(previa.derbi.n) + '</b>: clásico. La gente no perdona; el estadio va a estar a full.</div>' : '') +
            (lesion || sanc
              ? '<div class="aviso rojo" style="margin-top:12px">' + (lesion ? '🩹 ' + esc(j.lesion.tipo) + ' · ' + j.lesion.semanas + ' semanas de baja.' : '🟥 Suspendido por ' + j.sancion + ' fecha(s).') + ' No vas a poder jugar este partido.</div>'
              : '') +
            '<div class="sep"></div>' +
            '<div class="fila entre wrap"><div class="mini muted">Tu forma</div><div class="fila" style="gap:3px">' + formaHTML(miForma) + '</div></div>' +
            '<div class="fila entre wrap" style="margin-top:6px"><div class="mini muted">Forma del rival</div><div class="fila" style="gap:3px">' + formaHTML(rivalForma) + '</div></div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-titulo"><h3><span class="ico">📋</span>Táctica</h3><span class="tag-mini">Elegí el plan</span></div>' +
            '<div class="tacticas">' + tacticas + '</div>' +
            '<div class="mini muted" style="margin-top:10px">La táctica cambia cuántas ocasiones generás, cuánto riesgo asumís y tu participación. No hay una correcta: hay una que te sirve.</div>' +
          '</div>' +
        '</div>' +
        '<div class="pila">' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">🔎</span>Scouting</h3></div>' +
            '<div class="fila" style="gap:10px">' + UI.escudo(rival, 38) + '<div><b style="font-size:13px">' + esc(rival.nombre) + '</b><div class="mini muted">' + esc(rival.ciudad) + ' · Fuerza ' + rival.fuerza + '</div></div></div>' +
            '<div class="sep"></div>' +
            '<div class="kv"><span>Posición</span><b>' + rivalPos + 'º</b></div>' +
            '<div class="kv"><span>Prestigio</span><b>' + rival.prestigio + '</b></div>' +
            (goleadorRival ? '<div class="kv"><span>Goleador rival</span><b>' + esc(goleadorRival.nombre) + ' (' + goleadorRival.goles + ')</b></div>' : '') +
            '<div class="kv"><span>Últimos 5</span><b>' + (rivalForma.join(' ') || '—') + '</b></div>' +
            '<div class="sep"></div>' +
            '<div class="mini muted">Tu club: <b style="color:var(--txt)">' + c.fuerza + '</b> de fuerza · Posición <b style="color:var(--txt)">' + (filaMia ? filaMia.pos + 'º' : '—') + '</b> con ' + (filaMia ? filaMia.pts : 0) + ' pts.</div>' +
          '</div>' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">🎮</span>Salir a la cancha</h3></div>' +
            '<p class="mini muted" style="margin-bottom:12px">' + (lesion || sanc ? 'El equipo juega sin vos. Podés simular el partido para seguir la temporada.' : 'Jugá el partido con decisiones en las jugadas clave, o simulado entero si querés avanzar rápido.') + '</p>' +
            '<div class="pila" style="gap:8px">' +
              (lesion || sanc
                ? '<button class="btn primario bloque" data-accion="empezar-partido" data-auto="1">Simular partido →</button>'
                : '<button class="btn primario bloque" data-accion="empezar-partido" data-auto="0">Jugar partido →</button><button class="btn ghost bloque" data-accion="empezar-partido" data-auto="1">Simular rápido</button>') +
              (m.prensaPendiente ? '<button class="btn ghost bloque" data-accion="abrir-prensa">🎙️ Conferencia pendiente</button>' : '') +
            '</div>' +
            '<div class="sep"></div>' +
            (previa ? '<div class="kv"><span>Clima</span><b>' + previa.clima.icon + ' ' + esc(previa.clima.n) + '</b></div><div class="kv"><span>Árbitro</span><b>' + esc(previa.arbitro.n) + ' · ' + esc(previa.arbitro.estilo) + '</b></div>' : '') +
            '<div class="kv"><span>Entrenamiento semanal</span><b>' + (j.entrenoHecho ? '✅ Listo' : '⚠️ Pendiente') + '</b></div>' +
            '<div class="kv"><span>Condición</span><b>' + Math.round(j.condicion) + '%</b></div>' +
            '<div class="kv"><span>Moral</span><b>' + Math.round(j.moral) + '%</b></div>' +
            (j.entrenoHecho ? '' : '<div class="mini muted" style="margin-top:8px">Si jugás sin entrenar, el entrenamiento se aplica automáticamente.</div>') +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- partido en vivo ---------------- */
  function particulas(clima) {
    if (!clima) return '';
    if (clima.id === 'lluvia') return Array.from({ length: 26 }, function () { return '<i style="left:' + M.ri(0, 100) + '%;animation-delay:' + (M.rnd() * 1.2).toFixed(2) + 's;animation-duration:' + (0.45 + M.rnd() * 0.45).toFixed(2) + 's"></i>'; }).join('');
    if (clima.id === 'nieve') return Array.from({ length: 22 }, function () { return '<i style="left:' + M.ri(0, 100) + '%;animation-delay:' + (M.rnd() * 2).toFixed(2) + 's;animation-duration:' + (2 + M.rnd() * 2).toFixed(2) + 's"></i>'; }).join('');
    if (clima.id === 'viento') return '<i class="racha" style="top:20%"></i><i class="racha" style="top:48%;animation-delay:.7s"></i><i class="racha" style="top:72%;animation-delay:1.3s"></i>';
    return '';
  }
  function plantillaLive() {
    const p = UI.partido;
    if (!p) return '';
    const cl = p.clima || { icon: '☀️', n: 'Soleado', id: 'sol' };
    return '<div class="partido">' +
      '<div class="partido-top"><div class="comp">' + esc(p.liga.nombre) + ' · <b>Fecha ' + p.jornada + '</b> · ' + cl.icon + ' ' + esc(cl.n) + ' · ' + esc(p.hora || '20:45') + '</div>' +
        '<div class="fila"><div class="velocidad">' +
          [1, 2, 4].map(function (v) { return '<button class="vel ' + (UI.velocidad === v ? 'activo' : '') + '" data-accion="vel" data-v="' + v + '">' + v + 'x</button>'; }).join('') +
        '</div><button class="btn-icono" id="btn-pausa" data-accion="pausa" title="Pausa">⏸</button><button class="btn-icono" data-accion="saltar" title="Saltar al final">⏭</button></div>' +
      '</div>' +
      '<div class="marcador ' + (p.noche ? 'noche' : '') + '">' +
        '<div class="eq">' + UI.escudo(p.club, 52) + '<div class="nom"><b>' + esc(p.club.nombre) + '</b><span>' + (p.local ? 'LOCAL' : 'VISITANTE') + '</span></div></div>' +
        '<div class="score"><b><span id="pv-gf">0</span><i>–</i><span id="pv-gc">0</span></b><div class="min"><span class="vivo"></span><span id="pv-min">0\'</span></div></div>' +
        '<div class="eq der">' + UI.escudo(p.rival, 52) + '<div class="nom"><b>' + esc(p.rival.nombre) + '</b><span>' + (p.local ? 'VISITANTE' : 'LOCAL') + '</span></div></div>' +
      '</div>' +
      '<div class="tablero">' +
        '<div class="campo ' + (p.noche ? 'noche' : '') + '"><div class="clima-capa ' + cl.id + '" id="pv-clima">' + particulas(cl) + '</div><div class="campo-marca" id="pv-marca">0\'</div><div class="campo-centro"></div><div class="campo-arco izq"></div><div class="campo-arco der"></div><div class="campo-feed" id="pv-feed"></div></div>' +
        '<div class="live-side">' +
          '<div class="live-jug"><div class="lj-top"><b>Tu partido</b><span class="rating-live" id="pv-rating">6,0</span></div>' +
            '<div class="mini muted" id="pv-minutos" style="margin-top:2px">En cancha: 0\'</div>' +
            '<div class="live-stats" id="pv-stats"></div>' +
            '<div class="pos-barra" title="Posesión"><i id="pv-pos-a" style="width:50%;background:var(--lime)"></i><i id="pv-pos-b" style="width:50%;background:var(--red)"></i></div>' +
            '<div class="fila entre" style="margin-top:4px"><span class="mini muted">Posesión</span><span class="mini num" id="pv-pos-txt">50% – 50%</span></div>' +
          '</div>' +
          '<div class="live-jug"><div class="lj-top"><b style="font-size:12px">Jugadas decisivas</b><span class="tag-mini" id="pv-mom-n">0</span></div><div class="momentos-lista" id="pv-momentos" style="margin-top:8px"><div class="mini muted">Todavía no hubo ocasiones tuyas.</div></div></div>' +
          '<div class="live-jug"><div class="lj-top"><b style="font-size:12px">El partido</b></div>' +
            '<div class="kv" style="padding:4px 0"><span>Goles</span><b id="pv-goles2">0 – 0</b></div>' +
            '<div class="kv" style="padding:4px 0"><span>Remates</span><b id="pv-tiros2">0 – 0</b></div>' +
            '<div class="kv" style="padding:4px 0"><span>Posesión</span><b id="pv-pos2">50% – 50%</b></div>' +
            '<div class="momentum" title="Momentum"><i id="pv-mom-a" style="width:50%"></i><i id="pv-mom-b" style="width:50%"></i></div>' +
            '<div class="fila entre" style="margin-top:4px"><span class="mini muted">Momentum</span><span class="mini num" id="pv-mom-txt">50 – 50</span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="partido-pie"><span class="mini muted">' + esc(p.arbitro ? 'Árbitro: ' + p.arbitro.n + ' · ' + p.arbitro.estilo : '') + (p.derbi ? ' · 🔥 ' + esc(p.derbi.n) : '') + ' · Las jugadas con ⚡ son tuyas: ahí decidís vos.</span></div>' +
    '</div>';
  }

  function ratingLive(p) {
    if (!p.juega) return null;
    const s = statsLive(p);
    if (!s.minutos) return null;
    return Math.round(clamp(4, 10, 6.25 + s.goles * 1.1 + s.asistencias * 0.55) * 10) / 10;
  }
  function statsLive(p) {
    const nombre = p.nombre;
    let goles = 0, asistencias = 0;
    p.eventos.forEach(function (e) {
      if (e.min > UI.reloj || e.tipo !== 'gol' || e.lado !== 'fav' || e.anulado) return;
      if (e.goleador === nombre) goles++;
      if (e.asistente === nombre) asistencias++;
    });
    const fin = p.minutoFinal || 90;
    const minutos = p.juega && UI.reloj >= p.entrada ? Math.max(0, Math.min(UI.reloj, p.salida, fin) - p.entrada) : 0;
    return { goles: goles, asistencias: asistencias, minutos: minutos };
  }

  function eventosVisibles(p) {
    return p.eventos.filter(function (e) {
      return e.min <= UI.reloj && e.tipo !== 'momento' && e.min >= 0;
    }).sort(function (a, b) {
      return a.min - b.min;
    });
  }

  function actualizarLive(forzar) {
    const p = UI.partido;
    if (!p) return;
    const capa = document.getElementById('capa-partido');
    if (!capa || capa.classList.contains('oculto')) return;
    const gf = p.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'fav' && e.min <= UI.reloj && !e.anulado; }).length;
    const gc = p.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'contra' && e.min <= UI.reloj && !e.anulado; }).length;
    const elGf = document.getElementById('pv-gf');
    if (elGf) elGf.textContent = gf;
    const elGc = document.getElementById('pv-gc');
    if (elGc) elGc.textContent = gc;
    const elMin = document.getElementById('pv-min');
    if (elMin) elMin.textContent = UI.reloj > 90 ? '90+' + (UI.reloj - 90) + '\'' : UI.reloj + '\'';
    const r = ratingLive(p);
    const elR = document.getElementById('pv-rating');
    if (elR) {
      elR.textContent = r == null ? '—' : fNota(r);
      elR.style.fontSize = r == null ? '18px' : '';
      elR.style.color = r == null ? 'var(--muted2)' : '';
      elR.className = 'rating-live' + (r == null ? '' : r < 5.5 ? ' malo' : r < 6.5 ? ' bajo' : '');
    }
    const elMinJ = document.getElementById('pv-minutos');
    const sl = statsLive(p);
    if (elMinJ) {
      if (!p.juega) elMinJ.textContent = 'No jugás este partido';
      else if (UI.reloj < p.entrada) elMinJ.textContent = 'En el banco · entrás ~' + p.entrada + '\'';
      else elMinJ.textContent = 'En cancha: ' + sl.minutos + '\' · ' + p.stats.minutos + '\' planificados';
    }
    const marca = document.getElementById('pv-marca');
    if (marca) marca.textContent = UI.reloj > 90 ? '90+' + (UI.reloj - 90) + '\'' : UI.reloj + '\'';
    const st = document.getElementById('pv-stats');
    if (st) {
      st.innerHTML =
        '<div class="ls"><span>Goles</span><b>' + sl.goles + '</b></div>' +
        '<div class="ls"><span>Asist.</span><b>' + sl.asistencias + '</b></div>' +
        '<div class="ls"><span>Minutos</span><b>' + sl.minutos + '\'</b></div>' +
        '<div class="ls"><span>Jugadas</span><b>' + (p.momentos || []).filter(function (m) { return m.min <= UI.reloj || m.resuelto; }).length + '</b></div>';
    }
    const pa = document.getElementById('pv-pos-a'), pb = document.getElementById('pv-pos-b'), pt = document.getElementById('pv-pos-txt');
    const pos = p.posesion || 50;
    if (pa && pb && pt) {
      pa.style.width = pos + '%'; pb.style.width = (100 - pos) + '%';
      pt.textContent = pos + '% – ' + (100 - pos) + '%';
    }
    const tirosFav = p.eventos.filter(function (e) { return e.min <= UI.reloj && (e.tipo === 'gol' || e.tipo === 'ocasion') && e.lado === 'fav' && !e.anulado; }).length;
    const tirosCon = p.eventos.filter(function (e) { return e.min <= UI.reloj && (e.tipo === 'gol' || e.tipo === 'ocasion') && e.lado === 'contra' && !e.anulado; }).length;
    const elG2 = document.getElementById('pv-goles2');
    if (elG2) elG2.textContent = gf + ' – ' + gc;
    const elT2 = document.getElementById('pv-tiros2');
    if (elT2) elT2.textContent = tirosFav + ' – ' + tirosCon;
    const elP2 = document.getElementById('pv-pos2');
    if (elP2) elP2.textContent = pos + '% – ' + (100 - pos) + '%';
    let ma = 50, mb = 50;
    p.eventos.filter(function (e) { return e.min <= UI.reloj && (e.tipo === 'gol' || e.tipo === 'ocasion') && !e.anulado; }).slice(-8).forEach(function (e) {
      const v = e.tipo === 'gol' ? 12 : 5;
      if (e.lado === 'fav') ma += v; else mb += v;
    });
    const totalMom = ma + mb, pctA = Math.round(ma / totalMom * 100);
    const elMa = document.getElementById('pv-mom-a'), elMb = document.getElementById('pv-mom-b');
    if (elMa) elMa.style.width = pctA + '%';
    if (elMb) elMb.style.width = (100 - pctA) + '%';
    const elMt = document.getElementById('pv-mom-txt');
    if (elMt) elMt.textContent = pctA + ' – ' + (100 - pctA);
    const lista = (p.momentos || []).filter(function (m) { return m.min <= UI.reloj || m.resuelto; });
    const mn = document.getElementById('pv-mom-n');
    if (mn) mn.textContent = lista.length;
    const mm = document.getElementById('pv-momentos');
    if (mm) {
      mm.innerHTML = lista.length
        ? lista.map(function (m) {
            const res = m.resuelto ? (m.resultado || null) : null;
            let cls = '', ico = '⚡', texto = 'Pendiente';
            if (m.resuelto) {
              const ev = p.eventos.find(function (e) { return e.min === m.min && (e.jugador || e.asistenteJugador) && (e.tipo === 'gol' || e.tipo === 'ocasion' || e.tipo === 'defensa'); });
              if (ev && ev.anulado) { cls = 'no'; ico = '📺'; texto = 'VAR: anulado'; }
              else if (ev && ev.asistenteJugador && ev.tipo === 'gol') { cls = 'ok'; ico = '🅰️'; texto = 'Asistencia'; }
              else if (ev && ev.tipo === 'gol') { cls = 'ok'; ico = '⚽'; texto = 'Gol'; }
              else if (ev && ev.tipo === 'defensa') { cls = 'ok'; ico = '🛡️'; texto = 'Cortaste'; }
              else if (m.lado === 'contra' && p.eventos.some(function (e) { return e.min === m.min && e.tipo === 'gol' && e.lado === 'contra'; })) { cls = 'no'; ico = '⚽'; texto = 'Gol rival'; }
              else { cls = 'no'; ico = '🥅'; texto = 'Sin gol'; }
            }
            return '<div class="mom-mini ' + cls + '"><b>' + m.min + '\'</b> <span>' + ico + '</span><span>' + texto + '</span></div>';
          }).join('')
        : '<div class="mini muted">Todavía no hubo ocasiones tuyas.</div>';
    }
    const feed = document.getElementById('pv-feed');
    if (feed) {
      const evs = eventosVisibles(p);
      const sig = evs.map(function (e) { return e.min + '|' + e.tipo + '|' + e.texto; }).join('~');
      if (forzar || sig !== UI.feedSig) {
        UI.feedSig = sig;
        feed.innerHTML = evs.map(function (e) {
          const ico = e.tipo === 'gol' ? '⚽' : e.tipo === 'defensa' ? '🛡️' : e.tipo === 'lesion' ? '🩹' : e.tipo === 'cambio' ? '🔄' : e.tipo === 'tarjeta' ? (e.icono || '🟨') : e.tipo === 'info' ? '⏱️' : '🥅';
          const cls = e.tipo === 'gol' ? 'gol' : e.lado === 'contra' ? 'contra' : '';
          return '<div class="evento ' + cls + '"><div class="ev-min">' + e.min + '\'</div><div class="ev-ico">' + ico + '</div><div class="ev-txt">' + esc(e.texto) + (e.jugador ? ' <span class="tag-mini lima">VOS</span>' : '') + '</div></div>';
        }).join('');
        feed.scrollTop = feed.scrollHeight;
      }
    }
  }

  function programar(ms) {
    if (UI.timer) clearTimeout(UI.timer);
    if (UI.pausado || !UI.partido) return;
    const base = ms != null ? ms : 110 / UI.velocidad;
    UI.timer = setTimeout(tick, base);
  }
  function tick() {
    if (!UI.partido || UI.pausado) return;
    const p = UI.partido;
    const fin = p.minutoFinal || 90;
    if (UI.reloj >= fin) { terminarLive(); return; }
    UI.reloj++;
    actualizarLive(false);
    if (revisarVAR()) return;
    const pend = p.eventos.find(function (e) {
      return e.min === UI.reloj && e.tipo === 'momento' && e.momento && !e.momento.resuelto;
    });
    if (pend) {
      UI.pausado = true;
      UI.enMomento = true;
      abrirMomento(pend.momento);
      return;
    }
    if (UI.reloj >= 46 && !p.charlaOfrecida) {
      p.charlaOfrecida = true;
      UI.pausado = true;
      abrirCharla();
      return;
    }
    const goles = p.eventos.filter(function (e) { return e.min === UI.reloj && e.tipo === 'gol'; }).length;
    if (UI.reloj >= fin) { actualizarLive(true); setTimeout(terminarLive, 500 / UI.velocidad); return; }
    programar(goles ? 950 / UI.velocidad : 110 / UI.velocidad);
  }

  function revisarVAR() {
    const p = UI.partido;
    if (!p) return false;
    const ev = p.eventos.find(function (e) { return e.var && !e.var.visto && e.min <= UI.reloj; });
    if (!ev) return false;
    UI.pausado = true;
    UI.enVAR = true;
    abrirVAR(ev);
    return true;
  }
  function abrirVAR(ev) {
    const p = UI.partido;
    const gf = p.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'fav' && e.min <= UI.reloj && !e.anulado; }).length;
    const gc = p.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'contra' && e.min <= UI.reloj && !e.anulado; }).length;
    UI.modalBloqueado = true;
    UI.abrirModal('<div style="position:fixed;inset:0;z-index:132;display:flex;align-items:center;justify-content:center;padding:18px"><div class="var-box">' +
      '<div class="var-head"><div class="var-ico">📺</div><div><div class="et">VAR · REVISIÓN</div><h3>Revisando el gol...</h3><p>El VAR chequea una posible infracción en la jugada. El estadio contiene la respiración.</p></div></div>' +
      '<div class="var-spinner" id="var-spin"><i></i><i></i><i></i></div>' +
      '<div id="var-resultado" class="oculto"></div>' +
      '<button class="btn primario bloque oculto" style="margin-top:12px" id="var-btn" data-accion="cerrar-var">Continuar →</button>' +
      '<div class="mini muted" style="margin-top:8px">Marcador al momento: ' + gf + ' – ' + gc + '</div>' +
    '</div></div>', { bloqueado: true });
    UI.varEvento = ev;
    setTimeout(function () {
      const spin = document.getElementById('var-spin');
      if (spin) spin.classList.add('oculto');
      const h = document.querySelector('.var-head h3');
      if (h) h.textContent = ev.var.anulado ? 'Gol anulado' : 'Gol confirmado';
      const res = document.getElementById('var-resultado');
      const btn = document.getElementById('var-btn');
      if (res) {
        res.classList.remove('oculto');
        res.innerHTML = ev.var.anulado
          ? '<div class="var-res anulado"><b>GOL ANULADO</b><span>El VAR detectó una infracción previa. La jugada queda sin efecto.</span></div>'
          : '<div class="var-res confirmado"><b>GOL CONFIRMADO</b><span>El VAR revisó la jugada y el gol vale. El estadio explota.</span></div>';
      }
      if (btn) btn.classList.remove('oculto');
    }, 1300 / Math.max(1, UI.velocidad * 0.8));
  }
  function cerrarVAR() {
    const ev = UI.varEvento;
    if (!ev) return;
    ev.var.visto = true;
    if (ev.var.anulado) M.anularGol(UI.partido, ev);
    UI.varEvento = null;
    UI.enVAR = false;
    UI.modalBloqueado = false;
    UI.cerrarModal();
    UI.pausado = false;
    actualizarLive(true);
    if (!revisarVAR()) programar(450);
  }

  function abrirCharla() {
    const p = UI.partido;
    if (!p) return;
    const gf = p.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'fav' && e.min <= UI.reloj && !e.anulado; }).length;
    const gc = p.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'contra' && e.min <= UI.reloj && !e.anulado; }).length;
    UI.modalBloqueado = true;
    UI.abrirModal('<div style="position:fixed;inset:0;z-index:131;display:flex;align-items:center;justify-content:center;padding:18px"><div class="charla-box">' +
      '<div class="momento-cabeza"><div class="mic">🗣️</div><div><div class="et">ENTRETIEMPO · 45\'</div><h3>Charla técnica</h3><p>Vas ' + gf + '-' + gc + '. Elegí cómo hablarle al grupo en el vestuario.</p></div></div>' +
      '<div class="charla-ops">' +
        '<button class="opcion" data-accion="elegir-charla" data-id="tranquilo"><div class="oi">🧘</div><b>Tranquilos</b><div class="mini muted">Bajar la revolución y sostener el plan.</div><div class="o-atrs"><span>Moral +3</span><span>DT -1</span></div></button>' +
        '<button class="opcion" data-accion="elegir-charla" data-id="exigente"><div class="oi">🔥</div><b>Exigir más</b><div class="mini muted">Subir la intensidad y el riesgo.</div><div class="o-atrs"><span>DT +3</span><span>Moral -2</span><span>2T +8%</span></div></button>' +
        '<button class="opcion" data-accion="elegir-charla" data-id="motivador"><div class="oi">💪</div><b>Motivar</b><div class="mini muted">Recordar para qué juegan y soltar las piernas.</div><div class="o-atrs"><span>Fans +2</span><span>Moral +2</span></div></button>' +
      '</div>' +
      '<button class="btn ghost sm" style="margin:0 22px 16px" data-accion="saltar-charla">Seguir sin charla</button>' +
    '</div></div>', { bloqueado: true });
  }
  function elegirCharla(id) {
    M.aplicarCharla(UI.partido, id);
    UI.modalBloqueado = false;
    UI.cerrarModal();
    UI.pausado = false;
    const t = id === 'exigente' ? 'Les exigiste más. El equipo sale a morder.' : id === 'motivador' ? 'Los motivaste. El vestuario sale con el pecho inflado.' : 'Les pediste calma. El plan sigue igual.';
    UI.toast('Charla de entretiempo', t, 'lima');
    actualizarLive(true);
    programar(500);
  }

  function abrirCapaPartido() {
    const capa = document.getElementById('capa-partido');
    capa.classList.remove('oculto');
    capa.innerHTML = plantillaLive();
    UI.feedSig = '';
    UI.pausado = false;
    UI.enMomento = false;
    UI.enVAR = false;
    UI.varEvento = null;
    if (UI.partido) UI.partido.charlaOfrecida = false;
    actualizarLive(true);
    programar(300);
  }

  function abrirMomento(m) {
    const p = UI.partido;
    const esDef = m.lado === 'contra';
    const titulo = m.tipo === 'penal' ? 'Penal para tu equipo' : esDef ? 'Duelo defensivo' : m.tipo === 'centro' ? 'Centro al área' : m.tipo === 'filtrado' ? 'Pase entre líneas' : m.tipo === 'mano_a_mano' ? 'Mano a mano' : m.tipo === 'rebote' ? 'Rebote en el área' : m.tipo === 'falta' ? 'Tiro libre' : m.tipo === 'media_distancia' ? 'Media distancia' : m.tipo === 'jugada_individual' ? 'Jugada individual' : m.xg >= 0.35 ? 'Ocasión clara' : 'Ocasión de gol';
    const sub = esDef
      ? (m.rivalNombre || 'El rival') + ' encara hacia tu zona. Un duelo puede cambiar el partido.'
      : m.tipo === 'penal' ? 'Doce pasos. El arquero, la tribuna y vos.' : 'Tenés la pelota y el arco de frente. Elegí cómo resolver.'
    ;
    const ops = m.opciones.map(function (o) {
      const risk = Array.from({ length: 5 }, function (_, i) { return '<i class="' + (i < o.riesgo ? 'on' : '') + '"></i>'; }).join('');
      return '<button class="opcion" data-accion="opcion" data-id="' + m.id + '" data-op="' + o.id + '">' +
        '<div class="oi">' + o.icon + '</div><b>' + esc(o.n) + '</b>' +
        '<div class="mini muted" style="margin-top:3px;line-height:1.3">' + esc(o.desc) + '</div>' +
        '<div class="o-atrs">' + o.attrs.map(function (a) { return '<span>' + a + '</span>'; }).join('') + '</div>' +
        '<div class="o-riesgo">' + risk + '<small>' + (o.riesgo >= 4 ? 'riesgo alto' : o.riesgo >= 3 ? 'riesgo medio' : 'riesgo bajo') + '</small></div>' +
      '</button>';
    }).join('');
    UI.modalBloqueado = true;
    UI.abrirModal('<div style="position:fixed;inset:0;z-index:130;display:flex;align-items:center;justify-content:center;padding:18px"><div class="momento" style="width:min(760px,100%)">' +
      '<div class="momento-cabeza"><div class="mic">' + (esDef ? '🛡️' : m.tipo === 'penal' ? '🎯' : '⚡') + '</div><div><div class="et">' + (esDef ? 'DUELO DEFENSIVO' : 'JUGADA DECISIVA') + ' · MINUTO ' + m.min + '\'</div><h3>' + titulo + '</h3><p>' + sub + '</p></div></div>' +
      '<div class="momento-ops' + (m.opciones.length === 2 ? ' dos' : '') + '">' + ops + '</div>' +
      '<div style="padding:0 22px 18px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><span class="mini muted">Tu estilo: <b>' + esc(D.ARQUETIPOS[jugador().arquetipo].n) + '</b> · atributos y rasgos definen la probabilidad</span><span class="mini muted">Elegí una opción</span></div>' +
    '</div></div>', { bloqueado: true });
    UI.actualizarLive = actualizarLive;
  }

  function resolverOpcionUI(id, opId) {
    const p = UI.partido;
    if (!p) return;
    const m = p.momentos.find(function (x) { return x.id === id; });
    if (!m || m.resuelto) return;
    const op = m.opciones.find(function (o) { return o.id === opId; });
    const res = M.resolverMomento(p, id, opId);
    if (!res) return;
    m.resultado = res;
    const esGol = res.tipo === 'gol';
    const esDef = res.tipo === 'defensa';
    const esAsist = res.asistenteJugador || (res.asistente && res.asistente === jugador().nombre + ' ' + jugador().apellido) || (esGol && m.lado === 'fav' && res.asistente);
    const titulo = esGol ? '¡GOL!' : esDef ? '¡Cortaste!' : esAsist ? '¡ASISTENCIA!' : 'No pudo ser';
    const color = esGol || esDef ? 'var(--lime)' : esAsist ? 'var(--gold)' : 'var(--naranja)';
    const ico = esGol ? '⚽' : esDef ? '🛡️' : esAsist ? '🅰️' : '🥅';
    const gf = p.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'fav' && e.min <= UI.reloj && !e.anulado; }).length;
    const gc = p.eventos.filter(function (e) { return e.tipo === 'gol' && e.lado === 'contra' && e.min <= UI.reloj && !e.anulado; }).length;
    UI.abrirModal('<div style="position:fixed;inset:0;z-index:130;display:flex;align-items:center;justify-content:center;padding:18px"><div class="momento" style="width:min(560px,100%);border-color:' + color + '55">' +
      '<div class="momento-cabeza"><div class="mic" style="border-color:' + color + '55;background:' + color + '18">' + ico + '</div><div><div class="et" style="color:' + color + '">' + (m.min) + '\' · ' + esc(op ? op.n : '') + '</div><h3 style="font-size:30px">' + titulo + '</h3><p>' + esc(res.texto || '') + '</p></div></div>' +
      '<div style="padding:4px 22px 20px">' +
      '<div class="kv"><span>Marcador</span><b>' + gf + ' – ' + gc + '</b></div>' +
      '<div class="kv"><span>Minuto</span><b>' + m.min + '\'</b></div>' +
      '<div class="kv"><span>Tu estilo</span><b>' + esc(D.ARQUETIPOS[jugador().arquetipo].n) + '</b></div>' +
      '<button class="btn primario bloque" style="margin-top:12px" data-accion="seguir-momento">Continuar el partido →</button></div>' +
    '</div></div>', { bloqueado: true });
    actualizarLive(true);
  }

  function seguirMomento() {
    UI.modalBloqueado = false;
    UI.cerrarModal();
    UI.enMomento = false;
    UI.pausado = false;
    actualizarLive(true);
    if (revisarVAR()) return;
    const p = UI.partido;
    if (!p) return;
    const otro = p.eventos.find(function (e) {
      return e.min === UI.reloj && e.tipo === 'momento' && e.momento && !e.momento.resuelto;
    });
    if (otro) {
      UI.pausado = true;
      UI.enMomento = true;
      abrirMomento(otro.momento);
      return;
    }
    programar(450);
  }

  function terminarLive() {
    if (!UI.partido || UI.partido.finalizado) { if (UI.partido) mostrarReporte(UI.partido); return; }
    if (UI.timer) clearTimeout(UI.timer);
    const p = UI.partido;
    M.finalizarPartido(p);
    J.terminarPartido(p);
    mostrarReporte(p);
  }

  /* ---------------- reporte ---------------- */
  function mostrarReporte(p) {
    if (UI.timer) clearTimeout(UI.timer);
    UI.partido = p;
    UI.pausado = true;
    const capa = document.getElementById('capa-partido');
    capa.classList.remove('oculto');
    const esV = p.golesFav > p.golesContra, esE = p.golesFav === p.golesContra;
    const tabla = J.tablaActual();
    const fila = tabla.find(function (r) { return r.club.id === J.clubActual().id; });
    const resColor = esV ? 'var(--lime)' : esE ? 'var(--gold)' : 'var(--red)';
    const resTxt = esV ? 'VICTORIA' : esE ? 'EMPATE' : 'DERROTA';
    const stats = p.stats;
    const jugo = p.juega && stats.minutos > 0;
    const tirosMapa = p.eventos.filter(function (e) { return e.x != null && (e.tipo === 'gol' || e.tipo === 'ocasion'); }).map(function (e) {
      const clase = e.anulado ? 'anulado' : (e.tipo === 'gol' ? (e.lado === 'fav' ? 'gol' : 'gol-rival') : (e.lado === 'fav' ? 'tiro' : 'tiro-rival'));
      return '<i class="tiro-mapa ' + clase + (e.jugador ? ' propio' : '') + '" style="left:' + e.x + '%;top:' + e.y + '%" title="' + e.min + '\'"></i>';
    }).join('');
    capa.innerHTML = '<div class="partido"><div class="reporte">' +
      '<div class="reporte-hero">' +
        '<div class="etiqueta" style="color:' + resColor + '">' + resTxt + ' · ' + esc(p.liga.nombre) + '</div>' +
        '<div class="reporte-res">' +
          UI.escudo(p.club, 40) +
          '<span class="sc">' + p.golesFav + ' <i style="color:var(--muted2);font-weight:400">–</i> ' + p.golesContra + '</span>' +
          UI.escudo(p.rival, 40) +
        '</div>' +
        '<div class="mini muted" style="margin-top:6px">' + esc(p.club.nombre) + ' vs ' + esc(p.rival.nombre) + ' · Fecha ' + p.jornada + ' · ' + esc(p.estadio) + '</div>' +
        '<div class="reporte-rating">' +
          (jugo
            ? '<div><div class="rr ' + (p.rating < 6 ? 'malo' : p.rating < 7 ? 'rr-medio' : '') + '" style="color:' + colorNota(p.rating) + '">' + fNota(p.rating) + '</div><div class="etiqueta">TU NOTA</div></div>'
            : '<div><div class="rr" style="color:var(--muted2);font-size:24px">—</div><div class="etiqueta">NO JUGÁS</div></div>') +
          (p.mvp ? '<div class="mvp-tag">⭐ FIGURA DEL PARTIDO</div>' : '') +
        '</div>' +
        '<div class="reporte-stats">' +
          '<div class="rs"><b>' + stats.goles + '</b><span>Goles</span></div>' +
          '<div class="rs"><b>' + stats.asistencias + '</b><span>Asist.</span></div>' +
          '<div class="rs"><b>' + stats.tiros + '</b><span>Tiros</span></div>' +
          '<div class="rs"><b>' + stats.pasesClave + '</b><span>Pases clave</span></div>' +
          '<div class="rs"><b>' + stats.regates + '</b><span>Regates</span></div>' +
          '<div class="rs"><b>' + stats.duelos + '</b><span>Duelos</span></div>' +
          '<div class="rs"><b>' + stats.minutos + '\'</b><span>Minutos</span></div>' +
          '<div class="rs"><b>' + (p.mvp ? 'Sí' : '—') + '</b><span>MVP</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="grid g2">' +
        '<div class="card"><div class="card-titulo"><h3><span class="ico">📊</span>El partido</h3></div>' +
          '<div class="kv"><span>xG de tu equipo</span><b>' + p.xgFav.toFixed(2).replace('.', ',') + '</b></div>' +
          '<div class="kv"><span>xG del rival</span><b>' + p.xgContra.toFixed(2).replace('.', ',') + '</b></div>' +
          '<div class="kv"><span>Posesión</span><b>' + p.posesion + '% – ' + (100 - p.posesion) + '%</b></div>' +
          '<div class="kv"><span>Remates</span><b>' + p.tirosFav + ' – ' + p.tirosContra + '</b></div>' +
          '<div class="kv"><span>Tu táctica</span><b>' + p.tactica.n + '</b></div>' +
          '<div class="kv"><span>Posición en la tabla</span><b>' + (fila ? fila.pos + 'º · ' + fila.pts + ' pts' : '—') + '</b></div>' +
        '</div>' +
        '<div class="card"><div class="card-titulo"><h3><span class="ico">📝</span>Lo que dejó</h3></div>' +
          (p.lesion ? '<div class="aviso rojo">🩹 Lesión: ' + esc(p.lesion.tipo) + ' · ' + p.lesion.semanas + ' semanas de baja.</div>' : '') +
          (stats.rojas > 0 ? '<div class="aviso rojo">🟥 Expulsión: te perdés las próximas fechas.</div>' : '') +
          (stats.amarillas > 0 ? '<div class="aviso" style="margin-top:6px">🟨 ' + stats.amarillas + ' amarilla(s).</div>' : '') +
          (!jugo ? '<div class="aviso azul">No sumaste minutos. El equipo jugó sin vos: seguí entrenando para ganarte un lugar.</div>' : '') +
          (jugo && !p.lesion && stats.rojas === 0 ? '<div class="mini muted" style="margin-top:8px">' + (p.mvp ? 'Partidazo. El vestuario te reconoce.' : p.rating >= 6.8 ? 'Buen partido. Sumaste confianza y reputación.' : p.resultado === 'D' ? 'El equipo sufrió. La temporada es larga: hay que levantarse.' : p.rating >= 6 ? 'Partido correcto. Hay margen de mejora.' : 'No fue tu día. La temporada es larga.') + '</div>' : '') +
          '<div class="sep"></div>' +
          '<div class="kv"><span>Experiencia</span><b>+' + (jugo ? 6 + Math.round((p.rating || 6) * 2.5) + stats.goles * 7 + stats.asistencias * 4 + (p.mvp ? 10 : 0) : 3) + ' XP</b></div>' +
          '<div class="kv"><span>Condición</span><b>-' + p.costoFisico + '</b></div>' +
          '<div class="kv"><span>Moral</span><b>' + (p.costoMoral >= 0 ? '+' : '') + p.costoMoral + '</b></div>' +
          (p.primas ? '<div class="kv"><span>Primas cobradas</span><b>+' + fDinero(p.primas) + '</b></div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="grid g2" style="margin-top:14px">' +
        '<div class="card"><div class="card-titulo"><h3><span class="ico">🎯</span>Mapa de remates</h3><span class="tag-mini">' + p.tirosFav + ' – ' + p.tirosContra + '</span></div>' +
          '<div class="tiros-mapa">' + tirosMapa + '</div>' +
          '<div class="mini muted" style="margin-top:7px"><span class="tag-mini lima">Gol</span> <span class="tag-mini oro">Remate</span> <span class="tag-mini rojo">Rival</span> <span class="tag-mini">VAR</span></div>' +
        '</div>' +
        '<div class="card"><div class="card-titulo"><h3><span class="ico">🌦️</span>Contexto</h3></div>' +
          '<div class="kv"><span>Clima</span><b>' + (p.clima ? p.clima.icon + ' ' + esc(p.clima.n) : '—') + '</b></div>' +
          '<div class="kv"><span>Árbitro</span><b>' + (p.arbitro ? esc(p.arbitro.n) + ' · ' + esc(p.arbitro.estilo) : '—') + '</b></div>' +
          (p.derbi ? '<div class="kv"><span>Clásico</span><b>' + esc(p.derbi.n) + '</b></div>' : '') +
          '<div class="kv"><span>Tiempo agregado</span><b>+' + (p.agregado || 0) + '\'</b></div>' +
          (p.varAnulados ? '<div class="kv"><span>VAR</span><b>' + p.varAnulados + ' gol(es) anulado(s)</b></div>' : '') +
          (p.charla ? '<div class="aviso azul" style="margin-top:8px">🗣️ ' + esc(p.charla.texto) + '</div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="fila centro" style="justify-content:center"><button class="btn primario xl" data-accion="continuar-reporte">Continuar →</button></div>' +
    '</div></div>';
    capa.scrollTop = 0;
  }

  /* ---------------- resumen de temporada ---------------- */
  function abrirResumen() {
    const m = mundo(), r = m.resumenTemporada;
    if (!r) return;
    const j = jugador();
    const fila = r.tablaFinal.find(function (x) { return x.club.id === j.clubId; });
    const top = r.tablaFinal.slice(0, 6);
    const enTabla = top.some(function (x) { return x.club.id === j.clubId; });
    const elegido = m.ofertaElegida;
    const ofertas = (r.ofertas || []).map(function (o) {
      const c = D.clubPorId(o.clubId);
      const l = D.ligaPorId(c.liga);
      const rol = D.ROLES.find(function (x) { return x.id === o.rol; }) || D.ROLES[3];
      const sel = elegido === o.id;
      return '<div class="oferta" style="' + (sel ? 'border-color:rgba(184,255,46,.55);background:rgba(184,255,46,.06)' : '') + '">' +
        '<div class="o-top">' + UI.escudo(c, 34) + '<div style="flex:1"><b>' + esc(c.nombre) + '</b><span>' + l.bandera + ' ' + l.nombre + ' · Fuerza ' + c.fuerza + ' · Prestigio ' + c.prestigio + '</span></div>' +
          (o.motivo === 'renovacion' ? '<span class="tag-mini lima">RENOVAR</span>' : '') + '</div>' +
        '<div class="o-datos"><div>Rol<b>' + rol.icon + ' ' + rol.n + '</b></div><div>Salario<b>' + fDinero(o.salario) + '/sem</b></div><div>Años<b>' + o.anos + '</b></div></div>' +
        '<div class="o-datos" style="margin-top:6px;grid-template-columns:repeat(3,1fr)"><div>Cláusula<b>€' + (o.clausula || 0) + 'M</b></div><div>Prima gol<b>' + fDinero(o.primaGol || 0) + '</b></div><div>Prima partido<b>' + fDinero(o.primaPartido || 0) + '</b></div></div>' +
        '<div class="mini muted" style="margin-top:3px">Prima de fidelidad: ' + fDinero(o.primaFidelidad || 0) + ' al cerrar la temporada.</div>' +
        '<div class="fila entre" style="margin-top:8px"><span class="mini muted">Prima de fichaje: ' + fDinero(o.prima) + '</span>' +
          '<div class="fila" style="gap:6px">' +
            (!o.negociada && !sel ? '<button class="btn ghost sm" data-accion="negociar-oferta" data-id="' + o.id + '">Negociar</button>' : (o.negociada ? '<span class="tag-mini">Negociada</span>' : '')) +
            (sel ? '<span class="chip lima">✓ Elegido</span>' : '<button class="btn primario sm" data-accion="firmar-oferta" data-id="' + o.id + '">Firmar</button>') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    const premios = (r.premios || []).length
      ? r.premios.map(function (p) { return '<span class="chip oro">🏅 ' + esc(p.nombre) + '</span>'; }).join(' ')
      : '<span class="mini muted">Sin premios individuales esta temporada.</span>';
    const balon = r.balon || {};
    UI.abrirModal('<div class="capa"><div class="modal ancho" style="width:min(860px,100%)">' +
      '<div class="modal-cabeza"><div class="mc-ico">🏁</div><div><h2>Temporada ' + r.temporada + ' · ' + r.anyo + '/' + String(r.anyo + 1).slice(2) + '</h2><p>' + esc(r.club) + ' · ' + esc(r.liga) + ' · ' + r.posClub + 'º puesto · ' + fNota(r.promedio) + ' de media</p></div><button class="cerrar" data-accion="cerrar-modal">✕</button></div>' +
      '<div class="modal-cuerpo">' +
        '<div class="kpis" style="margin-bottom:14px">' +
          '<div class="kpi lima"><div class="k-top"><span>Posición</span></div><div class="k-val">' + r.posClub + 'º</div><div class="k-sub">' + (fila ? fila.pts + ' puntos' : '') + '</div></div>' +
          '<div class="kpi"><div class="k-top"><span>Récord</span></div><div class="k-val" style="font-size:20px">' + (fila ? fila.g + 'G ' + fila.e + 'E ' + fila.p + 'D' : '—') + '</div></div>' +
          '<div class="kpi oro"><div class="k-top"><span>Trofeos</span></div><div class="k-val">' + r.trofeos + '</div><div class="k-sub">' + (r.balon.ganador ? '¡Balón de Oro!' : '') + '</div></div>' +
          '<div class="kpi"><div class="k-top"><span>Nota media</span></div><div class="k-val" style="color:' + colorNota(r.promedio) + '">' + fNota(r.promedio) + '</div></div>' +
        '</div>' +
        '<div class="etiqueta-linea"><b>Premios</b><div class="hr"></div></div><div class="fila wrap" style="gap:5px">' + premios + '</div>' +
        '<div class="etiqueta-linea"><b>Copas y selección</b><div class="hr"></div></div>' +
        '<div class="grid g2" style="gap:10px">' +
          '<div class="card plano"><div class="mini"><b>' + esc(r.copa.nombre) + ':</b> ' + (r.copa.campeon ? '🏆 Campeón' : r.copa.ronda) + '</div></div>' +
          '<div class="card plano"><div class="mini"><b>' + (r.continental.nombre || 'Continental') + ':</b> ' + (r.continental.clasificado ? (r.continental.campeon ? '🏆 Campeón' : r.continental.ronda) : 'No clasificaste') + '</div></div>' +
        '</div>' +
        '<div class="card plano" style="margin-top:10px"><div class="mini"><b>Selección ' + esc(r.seleccion.nacion.n) + ':</b> ' + (r.seleccion.convocado ? r.seleccion.caps + ' partidos · ' + r.seleccion.goles + ' goles' + (r.seleccion.torneo ? ' · ' + r.seleccion.torneo + (r.seleccion.campeon ? ' 🏆 CAMPEÓN' : '') : '') : 'Sin convocatoria') + '</div></div>' +
        (balon.ganador ? '<div class="aviso oro" style="margin-top:10px;border-color:rgba(245,196,81,.45);background:rgba(245,196,81,.1);color:#f4dfa8"><b>🥇 BALÓN DE ORO.</b> ' + esc(j.nombre) + ' ' + esc(j.apellido) + ' es el mejor jugador del mundo.</div>' : '<div class="mini muted" style="margin-top:10px">Balón de Oro: <b>' + esc(balon.nombre || '—') + '</b>' + (balon.club ? ' (' + esc(balon.club) + ')' : '') + '</div>') +
        '<div class="etiqueta-linea"><b>Tabla final</b><div class="hr"></div></div>' +
        '<div style="overflow-x:auto"><table class="tabla"><thead><tr><th>#</th><th>Club</th><th style="text-align:center">PJ</th><th style="text-align:center">DG</th><th style="text-align:right">PTS</th></tr></thead><tbody>' +
          (enTabla ? top : top.concat([fila])).map(function (x) {
            return '<tr class="' + (x.club.id === j.clubId ? 'mio' : '') + '"><td class="pos">' + x.pos + '</td><td><div class="eq">' + UI.escudo(x.club, 17, 'esc-mini') + '<b>' + esc(x.club.nombre) + '</b></div></td><td class="num">' + x.pj + '</td><td class="num">' + (x.dg > 0 ? '+' : '') + x.dg + '</td><td class="pts">' + x.pts + '</td></tr>';
          }).join('') +
        '</tbody></table></div>' +
        '<div class="etiqueta-linea"><b>Tu próximo paso</b><div class="hr"></div></div>' +
        '<p class="mini muted" style="margin-bottom:9px">Elegí club para la próxima temporada. Si no elegís, renovás con ' + esc(r.club) + '.</p>' +
        '<div class="pila" style="gap:9px">' + ofertas + '</div>' +
        '<div class="fila wrap" style="margin-top:12px">' + (elegido === 'quedarse' || !elegido ? '<button class="btn ' + (elegido === 'quedarse' ? 'primario' : 'ghost') + '" data-accion="quedarse">🤝 Quedarme en ' + esc(r.club) + '</button>' : '') +
          '<button class="btn primario" data-accion="comenzar-temporada"' + (elegido ? '' : ' disabled') + '>Comenzar temporada ' + (r.anyo + 1) + '/' + String(r.anyo + 2).slice(2) + ' →</button>' +
        '</div>' +
        (elegido ? '' : '<div class="mini muted" style="margin-top:7px">Firmá una oferta o renová para continuar.</div>') +
      '</div>' +
    '</div></div>');
  }

  /* ---------------- acciones ---------------- */
  UI.acciones['set-tactica'] = function (el) {
    const j = jugador();
    j.tactica = el.getAttribute('data-tac');
    J.guardar();
    UI.actualizar(true);
  };
  UI.acciones['empezar-partido'] = function (el) {
    const j = jugador();
    const auto = el.getAttribute('data-auto') === '1';
    const p = J.jugarPartido({ auto: auto, tactica: j.tactica, previa: UI.previaPartido || null });
    if (!p) { UI.toast('No hay partido', 'No encontramos un encuentro para esta fecha.', 'rojo'); return; }
    UI.partido = p;
    UI.reloj = 0;
    UI.velocidad = 1;
    UI.feedSig = '';
    UI.enMomento = false;
    UI.enVAR = false;
    UI.varEvento = null;
    if (auto) {
      M.finalizarPartido(p);
      J.terminarPartido(p);
      mostrarReporte(p);
      return;
    }
    abrirCapaPartido();
  };
  UI.acciones['vel'] = function (el) {
    UI.velocidad = Number(el.getAttribute('data-v')) || 1;
    document.querySelectorAll('.vel').forEach(function (b) { b.classList.toggle('activo', Number(b.getAttribute('data-v')) === UI.velocidad); });
    programar(120);
  };
  UI.acciones['pausa'] = function () {
    if (UI.enMomento) return;
    UI.pausado = !UI.pausado;
    const b = document.getElementById('btn-pausa');
    if (b) b.textContent = UI.pausado ? '▶' : '⏸';
    if (!UI.pausado) programar(120);
  };
  UI.acciones['saltar'] = function () {
    if (!UI.partido) return;
    const p = UI.partido;
    if (UI.enMomento || UI.enVAR) { UI.modalBloqueado = false; UI.cerrarModal(); UI.enMomento = false; UI.enVAR = false; }
    p.momentos.forEach(function (m) {
      if (!m.resuelto) {
        const best = m.opciones.slice().sort(function (a, b) { return b.pExito - a.pExito; })[0];
        M.resolverMomento(p, m.id, best.id);
      }
    });
    UI.reloj = p.minutoFinal || 90;
    actualizarLive(true);
    terminarLive();
  };
  UI.acciones['cerrar-var'] = function () { cerrarVAR(); };
  UI.acciones['elegir-charla'] = function (el) { elegirCharla(el.getAttribute('data-id')); };
  UI.acciones['saltar-charla'] = function () {
    UI.modalBloqueado = false;
    UI.cerrarModal();
    UI.pausado = false;
    actualizarLive(true);
    programar(300);
  };
  UI.acciones['opcion'] = function (el) {
    resolverOpcionUI(el.getAttribute('data-id'), el.getAttribute('data-op'));
  };
  UI.acciones['seguir-momento'] = function () { seguirMomento(); };
  UI.acciones['continuar-reporte'] = function () {
    if (!UI.partido) return;
    if (mundo().prensaPendiente && UI.abrirPrensa) {
      UI.abrirPrensa(function () { finalizarSemanaPostPartido(); });
    } else {
      finalizarSemanaPostPartido();
    }
  };
  function finalizarSemanaPostPartido() {
    const p = UI.partido;
    J.avanzarSemana();
    UI.partido = null;
    UI.pausado = false;
    UI.previaPartido = null;
    const capa = document.getElementById('capa-partido');
    capa.classList.add('oculto');
    capa.innerHTML = '';
    if (mundo().fase === 'fin') {
      UI.ir('inicio');
      setTimeout(abrirResumen, 320);
    } else {
      UI.ir('inicio');
      if (p && p.lesion) UI.toast('Lesión', p.lesion.tipo + ' · ' + p.lesion.semanas + ' semanas', 'rojo');
      else if (p && p.mvp) UI.toast('Figura del partido', 'Tu actuación quedó en la historia de la fecha.', 'oro');
    }
  }
  UI.acciones['ver-resumen'] = function () { abrirResumen(); };
  UI.acciones['firmar-oferta'] = function (el) {
    const r = J.firmarOferta(el.getAttribute('data-id'));
    if (r.error) { UI.toast('No se pudo firmar', r.error, 'rojo'); return; }
    UI.toast('Nuevo club', 'Firmaste con ' + r.club.nombre + '.', 'lima');
    if (mundo().fase === 'fin') abrirResumen();
    else UI.actualizar(true);
  };
  UI.acciones['quedarse'] = function () {
    const r = J.quedarse();
    if (r.error) { UI.toast('No se pudo renovar', r.error, 'rojo'); return; }
    UI.toast('Renovación', 'Seguís en ' + J.clubActual().nombre + '.', 'lima');
    abrirResumen();
  };
  UI.acciones['comenzar-temporada'] = function () {
    const r = J.comenzarNuevaTemporada();
    if (r.error) { UI.toast('No se pudo comenzar', r.error, 'rojo'); return; }
    UI.cerrarModal();
    UI.vista = 'inicio';
    UI.actualizar();
    UI.toast('Nueva temporada', 'Arranca ' + mundo().anyo + '/' + String(mundo().anyo + 1).slice(2) + '. A entrenar.', 'lima');
  };

  UI.vistas.partido = vPartido;
  UI.abrirResumen = abrirResumen;
  UI.mostrarReporte = mostrarReporte;
})(typeof window !== 'undefined' ? window : globalThis);
