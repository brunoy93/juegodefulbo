/* =========================================================
   LEYENDA · V2 — interfaz de Vida: prensa, redes, agente, legado
   ========================================================= */
(function (global) {
  'use strict';
  const D = global.DATOS, V = global.VIDA, M = global.Motor, J = global.Juego, UI = global.UI;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fDinero(k) { return UI.fDinero(k); }
  function fNota(n) { return UI.fNota(n); }
  function colorNota(n) { return UI.colorNota(n); }
  function barra(v, cls) { return UI.barra(v, cls); }
  function jugador() { return J.estado.jugador; }
  function mundo() { return J.estado.mundo; }
  function agenteDe(id) { return (V.AGENTES || []).find(function (a) { return a.id === id; }) || V.AGENTES[0]; }
  function nivelFan(v) { return v >= 80 ? 'Ídolo de la gente' : v >= 60 ? 'Muy querido' : v >= 40 ? 'Aceptado' : v >= 20 ? 'En duda' : 'Cuestionado'; }
  function nivelDT(v) { return v >= 80 ? 'Intocable' : v >= 60 ? 'Titular fijo' : v >= 40 ? 'Rotación' : v >= 20 ? 'En la cuerda floja' : 'Al borde de la salida'; }

  function medidores() {
    const j = jugador();
    return '<div class="card"><div class="card-titulo"><h3><span class="ico">📊</span>Tu relación con el club</h3></div>' +
      '<div class="medidor"><div class="medidor-top"><span>🔥 Fanatismo</span><b>' + Math.round(j.fanatismo || 35) + ' · ' + nivelFan(j.fanatismo || 35) + '</b></div>' + barra(j.fanatismo || 35, '') + '</div>' +
      '<div class="medidor" style="margin-top:9px"><div class="medidor-top"><span>🧠 Confianza del DT</span><b>' + Math.round(j.confianzaDT || 45) + ' · ' + nivelDT(j.confianzaDT || 45) + '</b></div>' + barra(j.confianzaDT || 45, 'azul') + '</div>' +
      '<div class="medidor" style="margin-top:9px"><div class="medidor-top"><span>🎖️ Capitán</span><b>' + (j.capitan ? 'Sí, llevás la cinta' : 'Todavía no') + '</b></div></div>' +
      '<div class="fila entre" style="margin-top:8px"><span class="mini muted">Dorsal</span><b class="num">#' + (j.dorsal || '—') + '</b></div>' +
      '<div class="fila entre" style="margin-top:4px"><span class="mini muted">Agente</span><b class="mini">' + esc(agenteDe(j.agente).icon + ' ' + agenteDe(j.agente).n) + '</b></div>' +
    '</div>';
  }

  function periodicoHTML() {
    const p = mundo().media && mundo().media.periodico;
    if (!p) {
      return '<div class="card"><div class="card-titulo"><h3><span class="ico">📰</span>El Deportivo</h3></div><div class="det-vacio">Jugá un partido para que los medios hablen de vos. La primera tapa se escribe en la cancha.</div></div>';
    }
    return '<div class="periodico">' +
      '<div class="periodico-masthead"><span>EL DEPORTIVO</span><span>' + (p.anyo || '') + ' · Fecha ' + (p.semana || '') + '</span></div>' +
      '<div class="periodico-titular">' + esc(p.titular) + '</div>' +
      '<div class="periodico-copete">' + esc(p.copete) + '</div>' +
      '<div class="periodico-cuerpo">' + esc(p.cuerpo) + '</div>' +
      '<div class="periodico-firma">Por ' + esc(p.autor || 'Redacción') + ' · @' + esc(p.handle || 'eldeportivo') + '</div>' +
    '</div>';
  }

  function redesHTML(limite) {
    const redes = (mundo().media && mundo().media.redes) || [];
    if (!redes.length) {
      return '<div class="card"><div class="card-titulo"><h3><span class="ico">📱</span>Redes</h3></div><div class="det-vacio">Todavía no hay reacciones. Ganate a la gente.</div></div>';
    }
    const lista = limite ? redes.slice(0, limite) : redes;
    return '<div class="card"><div class="card-titulo"><h3><span class="ico">📱</span>Redes</h3><span class="tag-mini">' + redes.length + ' posts</span></div><div class="redes">' +
      lista.map(function (r) {
        const ini = (r.nombre || r.handle || '?').replace('@', '').slice(0, 2).toUpperCase();
        return '<div class="post post-' + r.tipo + '"><div class="post-avatar">' + esc(ini) + '</div><div class="post-cuerpo"><div class="post-head"><b>' + esc(r.handle) + '</b><span>' + esc(r.nombre) + '</span></div><div class="post-texto">' + esc(r.texto) + '</div><div class="post-likes">❤️ ' + (r.likes || 0).toLocaleString('es-AR') + ' · 💬 ' + Math.max(1, Math.round((r.likes || 0) / 90)) + '</div></div></div>';
      }).join('') +
    '</div></div>';
  }

  function prensaHTML() {
    const m = mundo();
    const pend = m.prensaPendiente;
    const ultima = (m.media && m.media.prensa && m.media.prensa[0]) || null;
    let html = '<div class="card"><div class="card-titulo"><h3><span class="ico">🎙️</span>Sala de prensa</h3>' + (pend ? '<span class="tag-mini lima">PENDIENTE</span>' : '') + '</div>';
    if (pend) {
      html += '<div class="aviso azul" style="margin-bottom:9px">Tenés una conferencia pendiente después del último partido. Tus respuestas mueven el fanatismo, la confianza del DT y tu reputación.</div>' +
        '<button class="btn primario sm bloque" data-accion="abrir-prensa">Responder conferencia →</button>';
    }
    if (ultima) {
      html += '<div style="margin-top:' + (pend ? '12px' : '0') + '">' +
        '<div class="mini muted" style="margin-bottom:4px">Última conferencia · ' + ultima.anyo + ' · Fecha ' + ultima.semana + ' · ' + esc(ultima.club || J.clubActual().nombre) + ' ' + ultima.gf + '-' + ultima.gc + ' ' + esc(ultima.rival || '') + '</div>' +
        (ultima.respuestas || []).map(function (r) { return '<div class="pregunta"><b>P:</b> ' + esc(r.q) + '</div><div class="respuesta">“' + esc(r.op) + '”</div>'; }).join('') +
      '</div>';
    }
    if (!pend && !ultima) html += '<div class="det-vacio">Las conferencias llegan después de los partidos. Lo que digas tiene consecuencias.</div>';
    html += '</div>';
    return html;
  }

  function agenteHTML() {
    const j = jugador();
    const actual = agenteDe(j.agente);
    return '<div class="card"><div class="card-titulo"><h3><span class="ico">🕴️</span>Representante</h3><span class="tag-mini lima">' + esc(actual.n) + '</span></div>' +
      '<div class="agente-actual"><div class="agente-icono">' + actual.icon + '</div><div><b>' + esc(actual.n) + '</b><div class="mini muted">' + esc(actual.desc) + '</div></div></div>' +
      '<div class="mini muted" style="margin-top:9px">Mejores agentes consiguen más ofertas, mejores salarios y negocian mejor. La comisión se paga una vez.</div>' +
      '<div class="pila" style="gap:7px;margin-top:10px">' +
        V.AGENTES.map(function (a) {
          const es = a.id === j.agente;
          const puede = (j.dinero || 0) >= a.fee;
          return '<div class="agente-card ' + (es ? 'actual' : '') + '"><div class="fila entre"><div><b class="mini">' + a.icon + ' ' + esc(a.n) + '</b><div class="mini muted" style="font-size:10px">+' + a.ofertas + (a.ofertas === 1 ? ' oferta' : ' ofertas') + ' · +' + Math.round(a.salario * 100) + '% salario · +' + Math.round(a.negociacion * 100) + '% negociación</div></div>' +
            (es ? '<span class="tag-mini lima">ACTUAL</span>' : '<button class="btn sm" data-accion="contratar-agente" data-id="' + a.id + '"' + (puede ? '' : ' disabled') + '>' + (a.fee ? fDinero(a.fee) : 'Gratis') + '</button>') +
          '</div></div>';
        }).join('') +
      '</div></div>';
  }

  function legadoHTML() {
    const j = jugador();
    const l = (global.Vida ? global.Vida.nivelLeyenda(J.estado) : { nivel: 'Promesa', puntos: 0, partidos: 0, goles: 0, titulos: 0 });
    const recs = [
      { n: 'Goles en una temporada', v: j.records.golesTemporada || 0, i: '⚽' },
      { n: 'Asistencias en una temporada', v: j.records.asistenciasTemporada || 0, i: '🅰️' },
      { n: 'Mejor nota media', v: j.records.notaTemporada ? fNota(j.records.notaTemporada) : '—', i: '⭐' },
      { n: 'Goles en carrera', v: j.records.golesCarrera || 0, i: '🎯' },
      { n: 'Partidos en carrera', v: j.records.partidosCarrera || 0, i: '🏟️' },
      { n: 'Figuras del partido', v: j.records.mvpCarrera || 0, i: '🥇' },
      { n: 'Títulos', v: (j.palmares || []).length, i: '🏆' }
    ];
    const pct = Math.min(100, Math.round(l.puntos / 420 * 100));
    return '<div class="card"><div class="card-titulo"><h3><span class="ico">👑</span>Legado en ' + esc(J.clubActual().nombre) + '</h3><span class="tag-mini oro">' + l.nivel + '</span></div>' +
      '<div class="fila entre" style="margin-bottom:5px"><span class="mini muted">Nivel de ídolo</span><b class="mini">' + l.puntos + ' / 420</b></div>' +
      barra(pct, 'oro') +
      '<div class="kpis" style="margin-top:10px">' +
        '<div class="kpi"><div class="k-top"><span>Partidos</span></div><div class="k-val">' + l.partidos + '</div></div>' +
        '<div class="kpi"><div class="k-top"><span>Goles</span></div><div class="k-val">' + l.goles + '</div></div>' +
        '<div class="kpi"><div class="k-top"><span>Títulos</span></div><div class="k-val">' + l.titulos + '</div></div>' +
      '</div>' +
      '<div class="records-grid">' +
        recs.map(function (r) { return '<div class="record"><span>' + r.i + '</span><b>' + r.v + '</b><small>' + r.n + '</small></div>'; }).join('') +
      '</div>' +
      '<div class="aviso ' + (j.capitan ? 'oro' : 'azul') + '" style="margin-top:10px">' + (j.capitan ? '🎖️ Sos el capitán del equipo. El vestuario te sigue.' : 'Para ser capitán necesitás confianza del DT, liderazgo, edad y temporadas en el club.') + '</div>' +
    '</div>';
  }

  function vVida() {
    const j = jugador(), m = mundo(), c = J.clubActual();
    return '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:18px">' +
        '<div><h1 class="titulo-vista">Vida de <em>carrera</em></h1><p class="sub-vista">Lo que pasa fuera de la cancha también cuenta: prensa, redes, representante, capitanía y legado.</p></div>' +
        '<div class="chip lima">' + esc(c.nombre) + ' · Dorsal #' + (j.dorsal || '—') + '</div>' +
      '</div>' +
      '<div class="vida-grid">' +
        '<div class="pila">' + periodicoHTML() + redesHTML(0) + '</div>' +
        '<div class="pila">' + medidores() + prensaHTML() + agenteHTML() + legadoHTML() + '</div>' +
      '</div>';
  }

  /* ---------------- conferencia de prensa ---------------- */
  let prensaState = { respuestas: {}, callback: null };

  function abrirPrensa(callback) {
    const pend = mundo().prensaPendiente;
    if (!pend) { UI.toast('Sin conferencia', 'No hay una conferencia pendiente.', 'oro'); if (callback) callback(); return; }
    prensaState = { respuestas: {}, callback: callback || null };
    renderPrensa(pend);
  }
  function renderPrensa(pend) {
    const preguntas = pend.preguntas || [];
    const html = '<div class="capa"><div class="modal ancho"><div class="modal-cabeza"><div class="mc-ico">🎙️</div><div><h2>Conferencia de prensa</h2><p>' + esc(J.clubActual().nombre) + ' ' + pend.gf + '-' + pend.gc + ' ' + esc(pend.rival ? pend.rival.nombre : '') + ' · ' + (pend.minutos || 0) + '\' jugados · nota ' + (pend.rating != null ? fNota(pend.rating) : '—') + '</p></div></div>' +
      '<div class="modal-cuerpo"><div class="prensa">' +
        '<div class="aviso azul" style="margin-bottom:12px">Dos preguntas. Cada respuesta mueve el fanatismo, la confianza del DT, la reputación y la moral. No hay respuestas gratis.</div>' +
        preguntas.map(function (q) {
          return '<div class="pregunta-bloque" data-qid="' + q.id + '"><div class="pregunta"><b>P:</b> ' + esc(q.q) + '</div><div class="respuestas">' +
            q.ops.map(function (op, i) {
              return '<button class="respuesta-op" data-accion="op-prensa" data-qid="' + q.id + '" data-op="' + i + '"><span class="tono">' + esc(op.tono || '') + '</span><span>' + esc(op.t) + '</span></button>';
            }).join('') +
          '</div></div>';
        }).join('') +
      '</div></div>' +
      '<div class="modal-pie"><button class="btn ghost" data-accion="saltar-prensa">Enviar al vocero</button><button class="btn primario" id="btn-enviar-prensa" data-accion="enviar-prensa" disabled>Enviar declaraciones →</button></div>' +
    '</div></div>';
    UI.abrirModal(html, { bloqueado: true });
  }
  function opPrensa(qid, op) {
    prensaState.respuestas[qid] = op;
    const bloques = document.querySelectorAll('.pregunta-bloque');
    bloques.forEach(function (b) {
      if (b.getAttribute('data-qid') !== qid) return;
      b.querySelectorAll('.respuesta-op').forEach(function (btn, i) { btn.classList.toggle('elegida', i === op); });
    });
    const total = (mundo().prensaPendiente ? mundo().prensaPendiente.preguntas.length : 0);
    const btn = document.getElementById('btn-enviar-prensa');
    if (btn) btn.disabled = Object.keys(prensaState.respuestas).length < total;
  }
  function enviarPrensa() {
    const pend = mundo().prensaPendiente;
    if (!pend) { UI.cerrarModal(); return; }
    const respuestas = (pend.preguntas || []).map(function (q) { return { qid: q.id, op: prensaState.respuestas[q.id] }; });
    if (respuestas.some(function (r) { return r.op == null; })) { UI.toast('Faltan respuestas', 'Contestá las dos preguntas.', 'rojo'); return; }
    const r = J.responderPrensa(respuestas);
    if (r.error) { UI.toast('No se pudo enviar', r.error, 'rojo'); return; }
    const ef = r.efectos || {};
    const media = r.media;
    UI.abrirModal('<div class="capa"><div class="modal"><div class="modal-cabeza"><div class="mc-ico">🗞️</div><div><h2>Mañana en los diarios</h2><p>Así quedó tu conferencia.</p></div></div><div class="modal-cuerpo">' +
      (media && media.periodico ? '<div class="periodico compacto"><div class="periodico-masthead"><span>EL DEPORTIVO</span><span>TAPA</span></div><div class="periodico-titular">' + esc(media.periodico.titular) + '</div><div class="periodico-copete">' + esc(media.periodico.copete) + '</div></div>' : '') +
      '<div class="prensa-efectos">' +
        '<span class="chip ' + (ef.fan >= 0 ? 'lima' : 'rojo') + '">🔥 Fanatismo ' + (ef.fan >= 0 ? '+' : '') + Math.round(ef.fan || 0) + '</span>' +
        '<span class="chip ' + (ef.dt >= 0 ? 'azul' : 'rojo') + '">🧠 DT ' + (ef.dt >= 0 ? '+' : '') + Math.round(ef.dt || 0) + '</span>' +
        '<span class="chip oro">⭐ Reputación ' + (ef.rep >= 0 ? '+' : '') + Math.round(ef.rep || 0) + '</span>' +
        '<span class="chip">🙂 Moral ' + (ef.moral >= 0 ? '+' : '') + Math.round(ef.moral || 0) + '</span>' +
      '</div>' +
      '<div class="aviso azul" style="margin-top:12px">Tus palabras ya están en boca de todos. La próxima vez que hables, la gente va a recordar esta.</div>' +
    '</div><div class="modal-pie"><button class="btn primario" data-accion="cerrar-prensa">Continuar →</button></div></div></div>', { bloqueado: true });
  }
  function cerrarPrensa() {
    const cb = prensaState.callback;
    prensaState = { respuestas: {}, callback: null };
    UI.modalBloqueado = false;
    UI.cerrarModal();
    if (cb) cb();
    else UI.actualizar();
  }
  function saltarPrensa() {
    const r = J.saltarPrensa();
    if (r.error) { UI.toast('Sin conferencia', r.error, 'oro'); }
    const cb = prensaState.callback;
    prensaState = { respuestas: {}, callback: null };
    UI.modalBloqueado = false;
    UI.cerrarModal();
    if (cb) cb();
    else UI.actualizar();
  }

  /* ---------------- acciones ---------------- */
  UI.acciones['contratar-agente'] = function (el) {
    const r = J.contratarAgente(el.getAttribute('data-id'));
    if (r.error) { UI.toast('No se pudo contratar', r.error, 'rojo'); return; }
    UI.toast('Nuevo representante', r.agente.n + ' trabaja para vos.', 'lima');
    UI.actualizar(true);
  };
  UI.acciones['abrir-prensa'] = function () { abrirPrensa(null); };
  UI.acciones['op-prensa'] = function (el) { opPrensa(el.getAttribute('data-qid'), Number(el.getAttribute('data-op'))); };
  UI.acciones['enviar-prensa'] = function () { enviarPrensa(); };
  UI.acciones['cerrar-prensa'] = function () { cerrarPrensa(); };
  UI.acciones['saltar-prensa'] = function () { saltarPrensa(); };
  UI.acciones['negociar-oferta'] = function (el) {
    const r = J.negociarOferta(el.getAttribute('data-id'));
    if (r.error) { UI.toast('No se pudo negociar', r.error, 'rojo'); return; }
    UI.toast(r.mejora ? 'Tu agente consiguió una mejora' : 'El club no mejoró la oferta', r.mejora ? 'Salario y años actualizados.' : 'La oferta queda como estaba.', r.mejora ? 'lima' : 'oro');
    if (mundo().fase === 'fin') UI.abrirResumen();
    else UI.actualizar(true);
  };

  UI.vistas.vida = vVida;
  UI.abrirPrensa = abrirPrensa;
  UI.prensaState = prensaState;
})(typeof window !== 'undefined' ? window : globalThis);
