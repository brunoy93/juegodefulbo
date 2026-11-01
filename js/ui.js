/* =========================================================
   LEYENDA · interfaz — núcleo, inicio, carrera, árbol, entreno, mundo
   ========================================================= */
(function (global) {
  'use strict';
  const D = global.DATOS, M = global.Motor, J = global.Juego;

  const UI = {
    vista: 'inicio',
    haySave: false,
    creacion: null,
    previews: {},
    ofertasInicio: null,
    nodoSel: null,
    mundoLiga: null,
    ultimoEntreno: null,
    modalAbierto: false,
    modalBloqueado: false,
    partido: null,
    reloj: 0,
    pausado: false,
    velocidad: 1,
    timer: null,
    feedSig: '',
    acciones: {},
    vistas: {}
  };
  global.UI = UI;

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clamp(a, b, v) { return v < a ? a : v > b ? b : v; }
  function media(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }
  function fDinero(k) {
    k = Number(k) || 0;
    if (k >= 1000) return '$' + (k / 1000).toFixed(k >= 10000 ? 0 : 1).replace('.', ',') + 'M';
    return '$' + Math.round(k) + 'K';
  }
  function fValor(v) { return '€' + (Number(v) || 0).toFixed(1).replace('.', ',') + 'M'; }
  function fNota(n) { return (Number(n) || 0).toFixed(1).replace('.', ','); }
  function colorNota(n) {
    if (n == null) return 'var(--muted2)';
    if (n >= 8) return 'var(--lime)';
    if (n >= 7) return 'var(--green)';
    if (n >= 6.5) return 'var(--gold)';
    if (n >= 5.5) return 'var(--naranja)';
    return 'var(--red)';
  }
  function estrellas(p) {
    const n = M.potencialEstrellas(p);
    let out = '';
    for (let i = 0; i < 5; i++) out += '<span style="color:' + (i < n ? 'var(--gold)' : '#33453a') + '">★</span>';
    return out;
  }
  function hexLum(hex) {
    const h = String(hex || '#333').replace('#', '');
    if (h.length < 6) return 0.3;
    const r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  function escudo(club, size, cls) {
    const s = size || 40;
    if (!club) return '<span class="crest ' + (cls || '') + '" style="display:inline-block;width:' + s + 'px;height:' + Math.round(s * 1.15) + 'px"></span>';
    const light = hexLum(club.c1) > 0.62;
    const txt = light ? '#0a110b' : '#ffffff';
    return '<svg class="crest ' + (cls || '') + '" viewBox="0 0 64 74" style="width:' + s + 'px;height:' + Math.round(s * 1.15) + 'px" aria-hidden="true">' +
      '<path d="M32 2 60 12v24c0 18-12 30-28 36C16 66 4 54 4 36V12z" fill="' + club.c1 + '" stroke="#050805" stroke-width="1.6"/>' +
      '<path d="M32 2 60 12v24c0 18-12 30-28 36V2z" fill="' + club.c2 + '" opacity=".82"/>' +
      '<path d="M32 7 55 15v21c0 15-10 25-23 30C19 61 9 51 9 36V15z" fill="#080c09" opacity=".2"/>' +
      '<path d="M32 7 55 15v21c0 15-10 25-23 30" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1"/>' +
      '<text x="32" y="43" text-anchor="middle" font-family="Bahnschrift,\'Arial Narrow\',sans-serif" font-size="16" font-weight="800" fill="' + txt + '" letter-spacing="1">' + esc(club.corto) + '</text>' +
      '</svg>';
  }
  function nacion(j) { return D.NACIONES_MAP[j.nacionalidad] || { n: 'Argentina', bandera: '🇦🇷' }; }
  function nombreCompleto(j) { return (j.nombre + ' ' + j.apellido).trim(); }
  function datos() { return J.estado; }
  function jugador() { return J.estado.jugador; }
  function club() { return J.clubActual(); }
  function liga() { return J.ligaActual(); }
  function miLiga() { return liga(); }

  /* ---------------- radar ---------------- */
  function radar(j) {
    const a = j.atributos;
    const vals = [
      media([a.ritmo, a.aceleracion]),
      media([a.fuerza, a.salto, a.resistencia]),
      media([a.tecnica, a.control, a.regate]),
      media([a.vision, a.paseCorto, a.paseLargo]),
      media([a.definicion, a.tiroLejano, a.penales, a.cabeceo]),
      media([a.marca, a.entrada, a.intercepcion, a.anticipacion])
    ];
    const labels = ['VELOCIDAD', 'FÍSICO', 'TÉCNICA', 'CREACIÓN', 'GOL', 'DEFENSA'];
    const cx = 150, cy = 140, rMax = 88;
    let svg = '<svg class="radar" viewBox="0 0 300 290" role="img" aria-label="Perfil de atributos">';
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const ang = -Math.PI / 2 + i * Math.PI / 3;
        pts.push((cx + Math.cos(ang) * rMax * f).toFixed(1) + ',' + (cy + Math.sin(ang) * rMax * f).toFixed(1));
      }
      svg += '<polygon class="grid-line" points="' + pts.join(' ') + '"/>';
    });
    for (let i = 0; i < 6; i++) {
      const ang = -Math.PI / 2 + i * Math.PI / 3;
      const x = cx + Math.cos(ang) * rMax, y = cy + Math.sin(ang) * rMax;
      svg += '<line class="eje" x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>';
      const lx = cx + Math.cos(ang) * (rMax + 24), ly = cy + Math.sin(ang) * (rMax + 24);
      svg += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 3).toFixed(1) + '" text-anchor="middle">' + labels[i] + '</text>';
    }
    const pts = vals.map(function (v, i) {
      const ang = -Math.PI / 2 + i * Math.PI / 3;
      const r = rMax * clamp(0, 100, v) / 100;
      return (cx + Math.cos(ang) * r).toFixed(1) + ',' + (cy + Math.sin(ang) * r).toFixed(1);
    });
    svg += '<polygon class="area" points="' + pts.join(' ') + '"/>';
    pts.forEach(function (p) {
      const xy = p.split(',');
      svg += '<circle class="punto" cx="' + xy[0] + '" cy="' + xy[1] + '" r="2.6"/>';
    });
    svg += '</svg>';
    return svg;
  }

  function barra(v, cls) {
    return '<div class="barra ' + (cls || '') + '"><i style="width:' + clamp(0, 100, v) + '%"></i></div>';
  }
  function dot(icon, label, val, extra) {
    return '<div class="dato ' + (extra || '') + '"><span class="di">' + icon + '</span><div class="dt"><span>' + label + '</span><b>' + val + '</b></div></div>';
  }

  /* ---------------- toasts / modal ---------------- */
  function toast(titulo, texto, tipo) {
    const capa = document.getElementById('toasts');
    if (!capa) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (tipo || '');
    const ico = tipo === 'oro' ? '🏆' : tipo === 'rojo' ? '⚠️' : tipo === 'lima' ? '✅' : '📰';
    el.innerHTML = '<div class="tico">' + ico + '</div><div><b>' + esc(titulo) + '</b>' + (texto ? '<span>' + esc(texto) + '</span>' : '') + '</div>';
    capa.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity .3s';
      setTimeout(function () { el.remove(); }, 320);
    }, 4300);
  }
  function abrirModal(html, opts) {
    const capa = document.getElementById('capa-modal');
    capa.innerHTML = html;
    capa.classList.remove('oculto');
    UI.modalAbierto = true;
    UI.modalBloqueado = !!(opts && opts.bloqueado);
    capa.scrollTop = 0;
  }
  function cerrarModal() {
    const capa = document.getElementById('capa-modal');
    if (!capa) return;
    if (UI.modalBloqueado) return;
    capa.classList.add('oculto');
    capa.innerHTML = '';
    UI.modalAbierto = false;
    UI.modalBloqueado = false;
  }

  /* ---------------- inicio ---------------- */
  function renderInicio() {
    const cont = document.getElementById('inicio');
    const hay = J.hayGuardado();
    UI.haySave = hay;
    document.getElementById('app').classList.add('oculto');
    cont.classList.remove('oculto');
    cont.innerHTML =
      '<div class="inicio-wrap">' +
        '<div>' +
          '<div class="inicio-marca">' +
            '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4 58 13v19c0 14-10 24-26 28C16 56 6 46 6 32V13z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M26 21h7v13h9v7H26z" fill="currentColor"/></svg>' +
            '<span>Fútbol · carrera · legado</span>' +
          '</div>' +
          '<h1 class="logo-grande">LEYENDA<span class="l2">CARRERA</span></h1>' +
          '<div class="inicio-tag">Del potrero al mundo. Tu historia empieza con un balón.</div>' +
          '<p class="inicio-desc">Creá tu jugador, entrená cada semana, desbloqueá un árbol de 78 habilidades y jugá partidos donde cada decisión depende de tu estilo. Clubes reales, seis ligas, mercado, selección y Balón de Oro.</p>' +
          '<div class="inicio-bullets">' +
            '<div class="ib"><b>78</b><span>habilidades</span></div>' +
            '<div class="ib"><b>116</b><span>clubes</span></div>' +
            '<div class="ib"><b>6</b><span>ligas reales</span></div>' +
            '<div class="ib"><b>8</b><span>estilos</span></div>' +
          '</div>' +
          '<div class="inicio-acciones">' +
            (hay ? '<button class="btn primario xl" data-accion="continuar">Continuar carrera →</button>' : '') +
            '<button class="btn ' + (hay ? 'ghost' : 'primario') + ' xl" data-accion="nueva">Nueva carrera</button>' +
            '<button class="btn ghost" data-accion="como">Cómo funciona</button>' +
          '</div>' +
          '<div class="inicio-pie"><span>Sin descargas. Se juega en el navegador.</span><span class="punto"></span><span>Guardado automático</span><span class="punto"></span><span>v1.0</span></div>' +
        '</div>' +
        '<div class="preview">' +
          '<div class="preview-head"><span>PERFIL DE CARRERA</span><span class="vivo"><i></i>EN JUEGO</span></div>' +
          '<div class="preview-jug">' +
            '<div class="pj-avatar">MR</div>' +
            '<div><b>Mateo Ríos</b><span>Enganche · 19 años · River Plate</span></div>' +
            '<div class="preview-ovr"><b>87</b><span>OVR</span></div>' +
          '</div>' +
          '<div class="preview-attrs">' +
            '<div class="pa"><span>Visión</span>' + barra(94) + '<b>94</b></div>' +
            '<div class="pa"><span>Pase</span>' + barra(91) + '<b>91</b></div>' +
            '<div class="pa"><span>Regate</span>' + barra(88) + '<b>88</b></div>' +
            '<div class="pa"><span>Técnica</span>' + barra(90) + '<b>90</b></div>' +
          '</div>' +
          '<div class="preview-skill"><div class="ps-ico">✨</div><div><b>Mago del balón</b><span>Cada regate puede ser una ocasión</span></div><span class="ps-mas">✓</span></div>' +
          '<div class="preview-pie"><span>Liga Profesional · Fecha 12</span><b>7.8</b><span>última nota</span></div>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- creación ---------------- */
  function nuevaCreacion() {
    UI.creacion = { nombre: '', apellido: '', nacionalidad: 'arg', posicion: 'MCO', arquetipo: 'pibe', dificultad: 'normal' };
    UI.previews = {};
    renderCreacion();
  }
  function fit(posId, arqId) {
    const arq = D.ARQUETIPOS[arqId];
    if (arq.ideal.indexOf(posId) >= 0) return 100;
    const grupo = D.POSICIONES[posId].grupo;
    const grupos = arq.ideal.map(function (p) { return D.POSICIONES[p].grupo; });
    return grupos.indexOf(grupo) >= 0 ? 78 : 55;
  }
  function previewJugador() {
    const c = UI.creacion;
    const key = c.arquetipo + '|' + c.dificultad;
    if (!UI.previews[key]) {
      try { UI.previews[key] = J.crearJugador({ nombre: 'Vista', apellido: 'Previa', nacionalidad: c.nacionalidad, posicion: c.posicion, arquetipo: c.arquetipo, dificultad: c.dificultad }); }
      catch (e) { UI.previews[key] = null; }
    }
    return UI.previews[key];
  }
  function leerCreacion() {
    const n = document.getElementById('cr-nombre');
    const a = document.getElementById('cr-apellido');
    const nac = document.getElementById('cr-nac');
    if (n) UI.creacion.nombre = n.value;
    if (a) UI.creacion.apellido = a.value;
    if (nac) UI.creacion.nacionalidad = nac.value;
  }
  function renderCreacion() {
    const c = UI.creacion;
    const prev = previewJugador();
    const ovr = prev ? M.ovrJugador(prev) : 60;
    const pos = D.POSICIONES[c.posicion];
    const arq = D.ARQUETIPOS[c.arquetipo];
    const top = Object.keys(pos.pesos).sort(function (a, b) { return pos.pesos[b] - pos.pesos[a]; }).slice(0, 5);
    const html =
      '<div class="capa" id="capa-creacion">' +
      '<div class="modal ancho">' +
        '<div class="modal-cabeza">' +
          '<div class="mc-ico">🪪</div>' +
          '<div><h2>Creá tu jugador</h2><p>Todo empieza acá. Nombre, posición y estilo: el motor va a leer cada decisión.</p></div>' +
          '<button class="cerrar" data-accion="cerrar-modal" title="Cerrar">✕</button>' +
        '</div>' +
        '<div class="modal-cuerpo">' +
          '<div class="crear">' +
            '<div class="paso">' +
              '<div class="paso-cab"><span class="paso-num">1</span><b>Identidad</b><span>¿Quién sos?</span></div>' +
              '<div class="inputs">' +
                '<div class="campo"><label>Nombre</label><input id="cr-nombre" maxlength="18" placeholder="Lautaro" value="' + esc(c.nombre) + '"></div>' +
                '<div class="campo"><label>Apellido</label><input id="cr-apellido" maxlength="20" placeholder="Pérez" value="' + esc(c.apellido) + '"></div>' +
              '</div>' +
              '<div class="campo"><label>Nacionalidad</label><select id="cr-nac" data-accion="set-nac">' +
                D.NACIONES.map(function (n) { return '<option value="' + n.id + '"' + (n.id === c.nacionalidad ? ' selected' : '') + '>' + n.bandera + ' ' + n.n + '</option>'; }).join('') +
              '</select></div>' +
            '</div>' +
            '<div class="paso">' +
              '<div class="paso-cab"><span class="paso-num">2</span><b>Posición</b><span>Elegí tu lugar en la cancha</span></div>' +
              '<div class="pos-grid">' +
                D.ORDEN_POSICIONES.map(function (p) {
                  const pp = D.POSICIONES[p];
                  return '<button class="pos-op ' + (p === c.posicion ? 'activo' : '') + '" data-accion="set-pos" data-pos="' + p + '"><b>' + pp.corto + '</b><span>' + pp.n + '</span></button>';
                }).join('') +
              '</div>' +
            '</div>' +
            '<div class="paso">' +
              '<div class="paso-cab"><span class="paso-num">3</span><b>Estilo</b><span>Tu ADN futbolístico</span></div>' +
              '<div class="arqs">' +
                D.ORDEN_ARQUETIPOS.map(function (a) {
                  const aa = D.ARQUETIPOS[a];
                  const f = fit(c.posicion, a);
                  return '<button class="arq ' + (a === c.arquetipo ? 'activo' : '') + '" data-accion="set-arq" data-arq="' + a + '">' +
                    '<span class="fit ' + (f < 70 ? 'bajo' : '') + '">' + f + '%</span>' +
                    '<span class="a-ico">' + aa.icon + '</span><b>' + aa.n + '</b><span>' + aa.desc + '</span></button>';
                }).join('') +
              '</div>' +
            '</div>' +
            '<div class="paso">' +
              '<div class="paso-cab"><span class="paso-num">4</span><b>Dificultad</b><span>El viaje</span></div>' +
              '<div class="difs">' +
                D.DIFICULTADES.map(function (d) {
                  return '<button class="dif ' + (d.id === c.dificultad ? 'activo' : '') + '" data-accion="set-dif" data-dif="' + d.id + '"><b>' + d.n + '</b><span>' + d.desc + '</span></button>';
                }).join('') +
              '</div>' +
            '</div>' +
            '<div class="preview-creado">' +
              '<div class="pc-ovr">' + ovr + '</div>' +
              '<div class="pc-txt"><b>' + esc((c.nombre || 'Tu') + ' ' + (c.apellido || 'jugador')) + '</b><span>' + pos.n + ' · ' + arq.n + '</span></div>' +
              '<div class="pc-attrs">' +
                top.map(function (k) { return '<span>' + D.ATRIBUTOS[k].ab + ' ' + (prev ? Math.round(prev.atributos[k]) : 60) + '</span>'; }).join('') +
                '<span>POT ' + (prev ? estrellas(prev.potencial) : '') + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="aviso azul">Ramas recomendadas para este estilo: <b>' + arq.ramas.map(function (r) { return D.RAMAS[r].n; }).join(' · ') + '</b>. El resto del árbol también está disponible: podés construir un jugador único.</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-pie">' +
          '<button class="btn ghost" data-accion="cerrar-modal">Cancelar</button>' +
          '<button class="btn primario" data-accion="crear-ofertas">Ver ofertas de clubes →</button>' +
        '</div>' +
      '</div></div>';
    const capa = document.getElementById('capa-modal');
    capa.innerHTML = html;
    capa.classList.remove('oculto');
    UI.modalAbierto = true;
    UI.modalBloqueado = false;
    capa.scrollTop = 0;
  }
  function ofertasInicio() {
    const lista = UI.ofertasInicio || [];
    if (!lista.length) { toast('Sin ofertas', 'No encontramos clubes disponibles.', 'rojo'); return; }
    const html =
      '<div class="capa"><div class="modal ancho">' +
        '<div class="modal-cabeza"><div class="mc-ico">📨</div><div><h2>Tu primer contrato</h2><p>Elegí dónde empezar. Más minutos = más crecimiento; más club = más vidriera.</p></div><button class="cerrar" data-accion="cerrar-modal">✕</button></div>' +
        '<div class="modal-cuerpo"><div class="ofertas-ini">' +
          lista.map(function (o, i) {
            const c = o.club;
            const l = D.ligaPorId(c.liga);
            const rec = i === 0;
            return '<button class="oferta-ini" data-accion="firmar-inicial" data-id="' + o.oferta.id + '">' +
              escudo(c, 40) +
              '<div class="oi-txt"><b>' + esc(c.nombre) + (rec ? ' <span class="cinta">recomendado</span>' : '') + '</b>' +
                '<span>' + l.bandera + ' ' + l.nombre + ' · Fuerza ' + c.fuerza + ' · Prestigio ' + c.prestigio + '</span>' +
                '<span>' + o.rol.icon + ' ' + o.rol.n + ' · ~' + o.minutos + ' min por partido · ' + fDinero(o.oferta.salario) + '/sem · Prima ' + fDinero(o.oferta.prima) + '</span>' +
              '</div>' +
              '<span class="oi-rol">' + o.rol.n + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
        '<div class="aviso" style="margin-top:14px">Tu OVR inicial es <b>' + (lista[0] ? lista[0].ovr : 60) + '</b>. Si el club es muy grande, vas a pelear por minutos: el entrenamiento y las actuaciones definen todo.</div>' +
        '</div>' +
        '<div class="modal-pie"><button class="btn ghost" data-accion="volver-creacion">← Volver</button></div>' +
      '</div></div>';
    abrirModal(html);
  }

  /* ---------------- shell ---------------- */
  const NAV = [
    { id: 'inicio', icon: '🏠', n: 'Inicio' },
    { id: 'habilidades', icon: '🌳', n: 'Habilidades' },
    { id: 'entreno', icon: '🏋️', n: 'Entreno' },
    { id: 'partido', icon: '⚽', n: 'Partido' },
    { id: 'mundo', icon: '🌍', n: 'Mundo' },
    { id: 'vida', icon: '📰', n: 'Vida' },
    { id: 'perfil', icon: '👤', n: 'Perfil' },
    { id: 'motor', icon: '⚙️', n: 'Motor' }
  ];
  function renderNav() {
    const j = jugador(), m = datos().mundo;
    const ofertas = (m.ventanaInvierno && m.ofertasInvierno ? m.ofertasInvierno.length : 0) + (m.fase === 'fin' && !m.ofertaElegida ? 1 : 0);
    document.getElementById('nav').innerHTML = NAV.map(function (n) {
      let badge = '';
      if (n.id === 'habilidades' && j.puntos > 0) badge = '<span class="badge-nav">' + j.puntos + '</span>';
      if (n.id === 'mundo' && ofertas > 0) badge = '<span class="badge-nav">' + ofertas + '</span>';
      if (n.id === 'vida' && m.prensaPendiente) badge = '<span class="badge-nav">!</span>';
      if (n.id === 'partido' && m.fase === 'fin') badge = '<span class="badge-nav">!</span>';
      return '<button class="nav-item ' + (UI.vista === n.id ? 'activo' : '') + '" data-accion="ir" data-vista="' + n.id + '"><span class="ni">' + n.icon + '</span><span>' + n.n + '</span>' + badge + '</button>';
    }).join('');
  }
  function renderTopbar() {
    const j = jugador(), m = datos().mundo, c = club(), l = liga();
    const faseFin = m.fase === 'fin';
    const fecha = faseFin ? 'Temporada finalizada' : 'Fecha ' + m.semana + ' de ' + l.jornadas;
    document.getElementById('topbar').innerHTML =
      '<div class="top-izq">' +
        '<div class="top-fecha"><span class="etiqueta">Temporada ' + m.anyo + '/' + String(m.anyo + 1).slice(2) + '</span><b>' + fecha + '</b></div>' +
        '<div class="top-jugador"><div class="avatar">' + esc((j.nombre[0] || '') + (j.apellido[0] || '')) + '</div><div class="tj-txt"><b>' + esc(nombreCompleto(j)) + '</b><span>' + esc(c.nombre) + ' · ' + D.POSICIONES[j.posicion].corto + '</span></div></div>' +
      '</div>' +
      '<div class="top-datos">' +
        dot('📈', 'OVR', M.ovrJugador(j), 'destacado') +
        dot('💎', 'Valor', fValor(j.valor), 'opcional') +
        dot('💰', 'Caja', fDinero(j.dinero), 'opcional') +
        dot('✨', 'PH', j.puntos, j.puntos > 0 ? 'destacado' : '') +
        (faseFin ? '<button class="btn primario sm" data-accion="ver-resumen">Ver resumen</button>' : '') +
      '</div>';
  }
  function actualizar(conservar) {
    if (!J.estado) { renderInicio(); return; }
    if (datos().mundo.fase === 'retiro') { UI.vista = 'retiro'; }
    const y = window.scrollY;
    document.getElementById('inicio').classList.add('oculto');
    document.getElementById('app').classList.remove('oculto');
    renderNav();
    renderTopbar();
    const fn = UI.vistas[UI.vista] || UI.vistas.inicio;
    document.getElementById('vista').innerHTML = fn();
    if (conservar) setTimeout(function () { window.scrollTo(0, y); }, 0);
  }
  function ir(vista) {
    if (!UI.vistas[vista]) vista = 'inicio';
    UI.vista = vista;
    if (vista === 'mundo' && !UI.mundoLiga) UI.mundoLiga = liga().id;
    actualizar();
    window.scrollTo(0, 0);
  }

  /* ---------------- dashboard ---------------- */
  function vInicio() {
    const j = jugador(), m = datos().mundo, c = club(), l = liga();
    const st = j.estadisticasTemporada;
    const prom = J.promedioTemporada();
    const prox = J.proximoPartido();
    const rol = J.rolActual();
    const min = J.minutosPrevistos();
    const lesion = j.lesion && j.lesion.semanas > 0;
    const sanc = j.sancion > 0;
    const jugado = !!m.partidoJugado;
    const n = nacion(j);
    const ovr = M.ovrJugador(j);
    const faseFin = m.fase === 'fin';

    const form = j.forma && j.forma.length
      ? j.forma.map(function (r) { return '<span class="chip" style="color:' + colorNota(r) + ';border-color:' + colorNota(r) + '55">' + fNota(r) + '</span>'; }).join('')
      : '<span class="mini muted">Sin partidos todavía</span>';

    const hero =
      '<div class="hero">' +
        '<div class="hero-top">' +
          escudo(c, 74, 'hero-crest') +
          '<div class="hero-id">' +
            '<div class="eyebrow"><span class="punto"></span>' + D.POSICIONES[j.posicion].n + ' · ' + D.ARQUETIPOS[j.arquetipo].n + '</div>' +
            '<div class="hero-nombre">' + esc(j.nombre) + '<br>' + esc(j.apellido) + '</div>' +
            '<div class="hero-club">' + esc(c.nombre) + ' <span>·</span> ' + l.bandera + ' ' + l.nombre + ' <span>·</span> ' + j.edad + ' años</div>' +
            '<div class="hero-tags">' +
              '<span class="chip lima">' + rol.icon + ' ' + rol.n + '</span>' +
              '<span class="chip">Nivel ' + j.nivel + '</span>' +
              '<span class="chip">' + n.bandera + ' ' + n.n + '</span>' +
              (lesion ? '<span class="chip rojo">🩹 ' + esc(j.lesion.tipo) + ' · ' + j.lesion.semanas + ' sem</span>' : '') +
              (sanc ? '<span class="chip rojo">🟥 Suspendido · ' + j.sancion + '</span>' : '') +
              (j.contrato.hasta <= m.anyo ? '<span class="chip oro">Contrato por vencer</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="hero-ovr"><div class="anillo" style="--p:' + ovr + '"><div class="val"><b>' + ovr + '</b><span>OVR</span></div></div><span class="etiqueta">' + estrellas(j.potencial) + '</span></div>' +
        '</div>' +
        '<div class="hero-pie">' +
          '<div class="hstat"><span>Partidos</span><b>' + st.pj + '</b><small>esta temporada</small></div>' +
          '<div class="hstat"><span>Goles</span><b>' + st.goles + '</b><small>' + (st.pj ? (st.goles / st.pj).toFixed(2) : '0,00') + ' por partido</small></div>' +
          '<div class="hstat"><span>Asistencias</span><b>' + st.asistencias + '</b><small>' + st.mvp + ' MVP</small></div>' +
          '<div class="hstat"><span>Nota media</span><b style="color:' + (prom ? colorNota(prom) : 'var(--muted2)') + '">' + (prom ? fNota(prom) : '—') + '</b><small>' + (j.forma.length ? 'últimos ' + j.forma.length : 'sin nota') + '</small></div>' +
        '</div>' +
      '</div>';

    const bannerPuntos = j.puntos > 0
      ? '<div class="card" style="border-color:rgba(184,255,46,.4);background:linear-gradient(120deg,rgba(184,255,46,.12),rgba(184,255,46,.02))"><div class="fila entre wrap" style="gap:12px"><div class="fila"><div style="font-size:24px">🌳</div><div><b style="font-size:14px">Tenés ' + j.puntos + ' punto' + (j.puntos > 1 ? 's' : '') + ' de habilidad</b><div class="mini muted">Invertilos en el árbol para cambiar tu estilo de juego.</div></div></div><button class="btn primario sm" data-accion="ir" data-vista="habilidades">Abrir árbol →</button></div></div>'
      : '';

    let proxHTML = '';
    if (jugado) {
      proxHTML = '<div class="prox"><div class="prox-head"><span class="prox-comp">Fecha ' + m.semana + ' disputada</span><span class="chip lima">✅ PARTIDO JUGADO</span></div><div style="padding:22px 8px;text-align:center"><div style="font-family:var(--display);font-size:26px;text-transform:uppercase;line-height:1">La fecha ya está jugada</div><p class="mini muted" style="margin-top:6px">Cerrá la semana para recuperar energía y preparar el próximo partido.</p><button class="btn primario" style="margin-top:14px" data-accion="continuar-semana">Continuar semana →</button></div></div>';
    } else if (faseFin) {
      proxHTML = '<div class="prox"><div class="prox-head"><span class="prox-comp">Temporada terminada</span><span class="chip oro">🏁</span></div><div style="padding:26px 8px;text-align:center"><div style="font-family:var(--display);font-size:26px;text-transform:uppercase;line-height:1">La temporada llegó a su fin</div><p class="mini muted" style="margin-top:6px">Revisá el resumen, los premios y las ofertas de tu próximo club.</p><button class="btn primario" style="margin-top:14px" data-accion="ver-resumen">Ver resumen de temporada →</button></div></div>';
    } else if (prox) {
      proxHTML =
        '<div class="prox">' +
          '<div class="prox-head"><span class="prox-comp">' + l.nombre + ' · Fecha ' + m.semana + '</span><span class="chip">' + (prox.local ? '🏠 Local' : '✈️ Visitante') + '</span></div>' +
          '<div class="prox-cuerpo">' +
            '<div class="prox-eq">' + escudo(c, 56) + '<b>' + esc(c.nombre) + '</b><span>' + esc(c.ciudad) + '</span></div>' +
            '<div class="prox-vs">VS</div>' +
            '<div class="prox-eq">' + escudo(prox.rival, 56) + '<b>' + esc(prox.rival.nombre) + '</b><span>' + esc(prox.rival.ciudad) + '</span></div>' +
          '</div>' +
          '<div class="prox-meta">' +
            '<span class="chip lima">' + rol.icon + ' ' + rol.n + '</span>' +
            '<span class="chip">⏱ ' + (lesion || sanc ? '0' : min) + ' min estimados</span>' +
            '<span class="chip">' + (j.condicion >= 70 ? '🔋' : '🪫') + ' ' + Math.round(j.condicion) + '% condición</span>' +
            '<span class="chip">📋 ' + D.TACTICAS.find(function (t) { return t.id === (j.tactica || 'posesion'); }).n + '</span>' +
          '</div>' +
          (lesion || sanc
            ? '<div class="aviso rojo" style="margin-top:12px">' + (lesion ? 'Estás lesionado (' + esc(j.lesion.tipo.toLowerCase()) + '). Te quedan ' + j.lesion.semanas + ' semanas.' : 'Estás suspendido por ' + j.sancion + ' fecha(s).') + ' El equipo juega igual: podés simular el partido.</div>'
            : '') +
          '<div class="prox-pie">' +
            '<div class="minutos-est">' + (j.entrenoHecho ? '✅ Entrenamiento de la semana completado' : '⚠️ Todavía no entrenaste esta semana') + '</div>' +
            '<div class="fila wrap">' +
              (j.entrenoHecho ? '' : '<button class="btn ghost sm" data-accion="ir" data-vista="entreno">Entrenar</button>') +
              '<button class="btn primario" data-accion="abrir-partido">' + (lesion || sanc ? 'Simular partido' : 'Jugar partido') + ' →</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    const kpis =
      '<div class="kpis">' +
        '<div class="kpi lima"><div class="k-top"><span>Valor de mercado</span><span>💎</span></div><div class="k-val">' + fValor(j.valor) + '</div><div class="k-sub">' + J.rolActual().n + ' · hasta ' + j.contrato.hasta + '</div></div>' +
        '<div class="kpi"><div class="k-top"><span>Salario</span><span>💰</span></div><div class="k-val">' + fDinero(j.contrato.salario) + '<small>/sem</small></div><div class="k-sub">Caja: ' + fDinero(j.dinero) + '</div></div>' +
        '<div class="kpi"><div class="k-top"><span>Reputación</span><span>🌟</span></div><div class="k-val">' + Math.round(j.reputacion) + '<small>/100</small></div><div class="k-sub">' + (j.reputacion > 80 ? 'Ídolo mundial' : j.reputacion > 55 ? 'Reconocido' : j.reputacion > 30 ? 'Promesa' : 'Desconocido') + '</div></div>' +
        '<div class="kpi"><div class="k-top"><span>Experiencia</span><span>⬆️</span></div><div class="k-val">Nv. ' + j.nivel + '</div><div class="k-sub">' + J.xpPct() + '% para el próximo nivel</div></div>' +
      '</div>';

    const noticias = (m.noticias || []).slice(0, 6);
    const newsHTML = noticias.length
      ? noticias.map(function (nw) {
          return '<div class="news-item"><div class="news-ico">' + (nw.icono || '📰') + '</div><div><div class="news-txt">' + esc(nw.texto) + '</div><div class="news-fecha">' + (nw.anyo || '') + ' · Semana ' + (nw.semana || '') + '</div></div></div>';
        }).join('')
      : '<div class="det-vacio">Todavía no hay noticias. Jugá y entrená para escribir tu historia.</div>';

    return '' +
      (bannerPuntos ? bannerPuntos : '') +
      '<div class="dash">' +
        '<div class="pila">' +
          hero +
          kpis +
          '<div class="card">' +
            '<div class="card-titulo"><h3><span class="ico">📈</span>Rendimiento</h3><button class="accion" data-accion="ir" data-vista="perfil">Ver perfil →</button></div>' +
            '<div class="fila entre wrap" style="margin-bottom:10px"><span class="etiqueta">Últimos 5 partidos</span><div class="fila" style="gap:4px">' + form + '</div></div>' +
            '<div class="fila entre wrap" style="margin-bottom:6px"><span class="mini muted">Progreso al nivel ' + (j.nivel + 1) + '</span><span class="mini num">' + j.xp + ' / ' + M.xpNecesaria(j.nivel) + ' XP</span></div>' +
            barra(J.xpPct(), 'fina') +
            '<div class="grid g3" style="margin-top:14px">' +
              '<div><div class="etiqueta">PJ</div><div class="num" style="font-size:20px">' + st.pj + '</div></div>' +
              '<div><div class="etiqueta">MINUTOS</div><div class="num" style="font-size:20px">' + st.minutos + '</div></div>' +
              '<div><div class="etiqueta">MVP</div><div class="num" style="font-size:20px">' + st.mvp + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="pila">' +
          proxHTML +
          '<div class="card">' +
            '<div class="card-titulo"><h3><span class="ico">📰</span>Vida de carrera</h3><button class="accion" data-accion="ir" data-vista="vida">Abrir →</button></div>' +
            (m.media && m.media.periodico
              ? '<div style="font-family:var(--display);font-size:16px;text-transform:uppercase;line-height:1.1">' + esc(m.media.periodico.titular) + '</div><div class="mini muted" style="margin-top:5px">' + esc(m.media.periodico.copete) + '</div>'
              : '<div class="mini muted">Todavía no hay tapa. Jugá un partido para que los medios hablen de vos.</div>') +
            (m.media && m.media.redes && m.media.redes.length ? '<div class="sep"></div><div class="mini" style="line-height:1.4">📱 <b>' + esc(m.media.redes[0].handle) + '</b> ' + esc(m.media.redes[0].texto) + '</div>' : '') +
            (m.prensaPendiente ? '<button class="btn primario sm bloque" style="margin-top:9px" data-accion="abrir-prensa">🎙️ Responder conferencia</button>' : '') +
          '</div>' +
          '<div class="card">' +
            '<div class="card-titulo"><h3><span class="ico">🫀</span>Estado físico</h3><span class="tag-mini ' + (j.condicion >= 70 ? 'lima' : 'oro') + '">' + Math.round(j.condicion) + '%</span></div>' +
            '<div class="cond"><div class="cond-top"><span>Condición</span><b>' + Math.round(j.condicion) + '</b></div>' + barra(j.condicion, j.condicion >= 70 ? '' : j.condicion >= 40 ? 'oro' : 'rojo') + '</div>' +
            '<div class="cond" style="margin-top:10px"><div class="cond-top"><span>Moral</span><b>' + Math.round(j.moral) + '</b></div>' + barra(j.moral, 'azul') + '</div>' +
            '<div class="cond" style="margin-top:10px"><div class="cond-top"><span>Reputación</span><b>' + Math.round(j.reputacion) + '</b></div>' + barra(j.reputacion, 'oro') + '</div>' +
            '<div class="cond" style="margin-top:10px"><div class="cond-top"><span>Fanatismo</span><b>' + Math.round(j.fanatismo || 35) + '</b></div>' + barra(j.fanatismo || 35, '') + '</div>' +
            '<div class="cond" style="margin-top:10px"><div class="cond-top"><span>Confianza del DT</span><b>' + Math.round(j.confianzaDT || 45) + '</b></div>' + barra(j.confianzaDT || 45, 'azul') + '</div>' +
            '<div class="sep"></div>' +
            '<div class="fila entre"><span class="mini muted">Techo de carrera</span><b class="oro" style="letter-spacing:2px">' + estrellas(j.potencial) + '</b></div>' +
            '<div class="fila entre" style="margin-top:5px"><span class="mini muted">Contrato</span><b class="mini">' + fDinero(j.contrato.salario) + '/sem · ' + j.contrato.hasta + '</b></div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-titulo"><h3><span class="ico">📰</span>Últimas noticias</h3></div>' +
            '<div class="news">' + newsHTML + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- habilidades ---------------- */
  function nodoEstado(h) {
    const j = jugador();
    if (j.habilidades.indexOf(h.id) >= 0) return 'desb';
    const reqOk = h.req.every(function (r) { return j.habilidades.indexOf(r) >= 0; });
    if (!reqOk) return 'bloq';
    if (J.puedeDesbloquear(h.id).ok) return 'disp';
    if (j.nivel >= h.nivel) return 'req';
    return 'bloq';
  }
  function nodoHTML(h) {
    const est = nodoEstado(h);
    const r = D.RAMAS[h.rama];
    const sel = UI.nodoSel === h.id ? ' sel' : '';
    return '<button class="nodo ' + est + sel + '" style="--c:' + r.color + '" data-accion="ver-nodo" data-id="' + h.id + '" title="' + esc(h.nombre) + ' · ' + h.costo + ' PH">' +
      '<span class="nodo-icono">' + h.icono + (est === 'desb' ? '' : '<span class="nodo-costo">' + h.costo + '</span>') + '</span>' +
      '<span class="nodo-nombre">' + esc(h.nombre) + '</span>' +
    '</button>';
  }
  function detalleNodo() {
    const j = jugador();
    if (!UI.nodoSel) {
      return '<div class="det-rama">ÁRBOL DE HABILIDADES</div><div class="det-nombre" style="font-size:20px;margin-top:6px">Elegí un nodo</div>' +
        '<p class="det-desc">Cada nodo cuesta puntos de habilidad (PH), requiere nivel y desbloquea atributos o rasgos que el motor usa en el partido. No vas a poder tener todo: construí tu identidad.</p>' +
        '<div class="det-efectos">' +
          D.ORDEN_RAMAS.map(function (r) { const rr = D.RAMAS[r]; return '<div class="efecto"><span>' + rr.icon + ' ' + rr.n + '</span><b>' + j.habilidades.filter(function (id) { return D.HABILIDADES.find(function (h) { return h.id === id; }).rama === r; }).length + ' / 13</b></div>'; }).join('') +
        '</div>' +
        '<div class="aviso azul" style="margin-top:12px">Puntos disponibles: <b>' + j.puntos + ' PH</b> · Nivel ' + j.nivel + '</div>';
    }
    const h = D.HABILIDADES.find(function (x) { return x.id === UI.nodoSel; });
    if (!h) { UI.nodoSel = null; return detalleNodo(); }
    const r = D.RAMAS[h.rama];
    const aprendida = j.habilidades.indexOf(h.id) >= 0;
    const check = J.puedeDesbloquear(h.id);
    const reqs = h.req.map(function (id) {
      const ok = j.habilidades.indexOf(id) >= 0;
      const rr = D.HABILIDADES.find(function (x) { return x.id === id; });
      return '<div class="' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓' : '✗') + ' ' + (rr ? rr.nombre : id) + '</div>';
    }).join('');
    const nivelOk = j.nivel >= h.nivel;
    return '<div class="det-rama" style="color:' + r.color + '">' + r.icon + ' ' + r.n + ' · Tier ' + h.tier + '</div>' +
      '<div class="det-ico" style="border-color:' + r.color + '55">' + h.icono + '</div>' +
      '<div class="det-nombre">' + esc(h.nombre) + '</div>' +
      '<p class="det-desc">' + esc(h.desc) + '</p>' +
      '<div class="det-efectos">' +
        Object.keys(h.efectos).map(function (k) { return '<div class="efecto"><span>' + D.ATRIBUTOS[k].n + '</span><b>+' + h.efectos[k] + '</b></div>'; }).join('') +
        (h.rasgo ? '<div class="efecto rasgo"><b>Rasgo · ' + h.rasgo.n + '</b><br>' + h.rasgo.d + '</div>' : '') +
      '</div>' +
      '<div class="det-req"><span class="' + (nivelOk ? 'ok' : 'no') + '">' + (nivelOk ? '✓' : '✗') + ' Nivel ' + h.nivel + ' (tenés ' + j.nivel + ')</span>' + reqs + '</div>' +
      '<div class="det-pie">' +
        (aprendida
          ? '<button class="btn bloque" disabled>✓ Habilidad aprendida</button>'
          : '<button class="btn primario bloque" data-accion="desbloquear" data-id="' + h.id + '"' + (check.ok ? '' : ' disabled') + '>Aprender · ' + h.costo + ' PH</button>' +
            (check.ok ? '' : '<div class="mini muted centro" style="margin-top:7px">' + esc(check.motivo) + '</div>')) +
      '</div>';
  }
  function actualizarDetalleNodo() {
    const el = document.getElementById('detalle-nodo');
    if (el) el.innerHTML = detalleNodo();
    document.querySelectorAll('.nodo').forEach(function (n) {
      n.classList.toggle('sel', n.getAttribute('data-id') === UI.nodoSel);
    });
  }
  function vHabilidades() {
    const j = jugador();
    const total = D.HABILIDADES.length;
    const unlocked = j.habilidades.length;
    const pct = Math.round(unlocked / total * 100);
    const lanes = D.ORDEN_RAMAS.map(function (rid) {
      const r = D.RAMAS[rid];
      const nodos = D.HABILIDADES.filter(function (h) { return h.rama === rid; }).sort(function (a, b) { return a.tier - b.tier; });
      const u = nodos.filter(function (h) { return j.habilidades.indexOf(h.id) >= 0; }).length;
      return '<div class="lane" style="--c:' + r.color + '">' +
        '<div class="lane-head"><div class="lh-ico">' + r.icon + '</div><b>' + r.n + '</b><span>' + u + ' / ' + nodos.length + '</span><div class="lane-prog"><i style="width:' + Math.round(u / nodos.length * 100) + '%"></i></div></div>' +
        nodos.map(nodoHTML).join('') +
      '</div>';
    }).join('');
    return '<div class="skill-cabeza">' +
        '<div><h1 class="titulo-vista">Árbol de <em>habilidades</em></h1><p class="sub-vista">78 nodos en 6 ramas. Cada punto cambia cómo te lee el motor: atributos, rasgos y decisiones en el área.</p></div>' +
        '<div class="skill-resumen">' +
          '<div class="dato destacado"><span class="di">✨</span><div class="dt"><span>Puntos</span><b>' + j.puntos + '</b></div></div>' +
          '<div class="dato"><span class="di">⬆️</span><div class="dt"><span>Nivel</span><b>' + j.nivel + '</b></div></div>' +
          '<div class="dato"><span class="di">🌳</span><div class="dt"><span>Aprendidas</span><b>' + unlocked + '/' + total + '</b></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="card" style="padding:14px 16px;margin-bottom:14px">' +
        '<div class="fila entre wrap"><span class="mini muted">Progreso del árbol</span><span class="mini num">' + pct + '% · ' + unlocked + ' de ' + total + '</span></div>' +
        barra(pct, 'oro fina') +
        '<div class="mini muted" style="margin-top:7px">' + (j.puntos > 0 ? 'Tenés <b class="verde">' + j.puntos + ' PH</b> para invertir. Elegí bien: los nodos de tier alto piden nivel y prerrequisitos.' : 'Ganás PH al subir de nivel y con hitos de carrera.') + '</div>' +
      '</div>' +
      '<div class="mini muted skill-hint" style="margin-bottom:7px">Deslizá el árbol para ver las 6 ramas →</div>' +
      '<div class="skill-wrap">' +
        '<div class="skill-lanes">' + lanes + '</div>' +
        '<div class="card skill-detalle" id="detalle-nodo">' + detalleNodo() + '</div>' +
      '</div>';
  }

  /* ---------------- entrenamiento ---------------- */
  function vEntreno() {
    const j = jugador();
    const foco = j.foco || 'tecnico';
    const int = j.intensidad || 'normal';
    const sugerido = J.focoSugerido();
    const lesion = j.lesion && j.lesion.semanas > 0;
    const heco = j.entrenoHecho;
    const focoData = D.ENTRENAMIENTOS.find(function (f) { return f.id === foco; }) || D.ENTRENAMIENTOS[0];
    const focos = D.ENTRENAMIENTOS.map(function (f) {
      const bloqueado = lesion && f.id !== 'mental' && f.id !== 'recuperacion';
      const attrs = Object.keys(f.attrs).sort(function (a, b) { return f.attrs[b] - f.attrs[a]; }).slice(0, 3);
      return '<button class="foco ' + (foco === f.id ? 'activo' : '') + '" data-accion="set-foco" data-foco="' + f.id + '"' + (bloqueado ? ' disabled title="Lesionado: no podés hacer trabajo físico"' : '') + '>' +
        '<span class="chk">✓</span><div class="fi">' + f.icon + '</div><b>' + f.n + (f.id === sugerido ? ' <span class="tag-mini lima">sugerido</span>' : '') + '</b>' +
        '<span>' + f.desc + '</span>' +
        '<span style="color:var(--muted2);margin-top:5px">' + attrs.map(function (a) { return D.ATRIBUTOS[a].ab; }).join(' · ') + '</span>' +
      '</button>';
    }).join('');
    const ints = D.INTENSIDADES.map(function (i) {
      return '<button class="int-op ' + (int === i.id ? 'activo' : '') + '" data-accion="set-int" data-int="' + i.id + '">' + i.n + '<small>' + i.desc + '</small></button>';
    }).join('');
    const staff = D.STAFF.map(function (s) {
      const nivel = j.staff[s.id] || 0;
      const costo = J.costoStaff(s.id);
      const dots = Array.from({ length: s.max }, function (_, i) { return '<i style="width:14px;height:5px;border-radius:3px;background:' + (i < nivel ? 'var(--lime)' : '#26362b') + '"></i>'; }).join('');
      return '<div class="card plano" style="padding:12px">' +
        '<div class="fila entre"><div class="fila"><span style="font-size:18px">' + s.icon + '</span><div><b class="mini">' + s.n + '</b><div class="mini muted" style="font-size:10px">' + s.desc + '</div></div></div></div>' +
        '<div class="fila entre" style="margin-top:8px"><div class="fila" style="gap:3px">' + dots + '</div>' +
          (costo == null ? '<span class="tag-mini lima">MÁX</span>' : '<button class="btn sm" data-accion="comprar-staff" data-staff="' + s.id + '"' + (j.dinero < costo ? ' disabled' : '') + '>' + fDinero(costo) + '</button>') +
        '</div>' +
      '</div>';
    }).join('');
    const res = UI.ultimoEntreno;
    const resHTML = res && !res.error
      ? '<div class="card" style="margin-top:12px"><div class="card-titulo"><h3><span class="ico">📋</span>Última sesión</h3><span class="tag-mini lima">+' + res.total + '</span></div>' +
        '<div class="mini muted" style="margin-bottom:8px">' + res.foco.n + ' · ' + res.intensidad.n + ' · +' + res.xp + ' XP</div>' +
        Object.keys(res.ganancias).map(function (k) {
          return '<div class="fila entre" style="font-size:11px;padding:2px 0"><span class="muted">' + D.ATRIBUTOS[k].n + '</span><b class="verde">+' + res.ganancias[k].toFixed(2) + '</b></div>';
        }).join('') +
        (res.lesion ? '<div class="aviso rojo" style="margin-top:8px">Lesión: ' + esc(res.lesion.tipo) + ' · ' + res.lesion.semanas + ' semanas</div>' : '') +
      '</div>'
      : '';
    return '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:18px">' +
        '<div><h1 class="titulo-vista">Entrenamiento</h1><p class="sub-vista">Una sesión por semana. La constancia construye atributos; la intensidad acelera y también lesiona.</p></div>' +
        '<div class="fila"><div class="chip ' + (heco ? 'lima' : 'oro') + '">' + (heco ? '✅ Sesión completada' : '⚠️ Sesión pendiente') + '</div><div class="chip">🔋 ' + Math.round(j.condicion) + '%</div></div>' +
      '</div>' +
      '<div class="entreno">' +
        '<div class="card">' +
          '<div class="card-titulo"><h3><span class="ico">🎯</span>Plan semanal</h3><button class="accion" data-accion="usar-recomendado">Usar sugerido</button></div>' +
          (lesion ? '<div class="aviso rojo" style="margin-bottom:10px">Lesionado: solo podés hacer trabajo mental o recuperación.</div>' : '') +
          '<div class="focos">' + focos + '</div>' +
          '<div class="etiqueta-linea"><b>Intensidad</b><div class="hr"></div></div>' +
          '<div class="intensidad">' + ints + '</div>' +
          '<div class="sep"></div>' +
          '<button class="btn primario bloque" data-accion="entrenar"' + (heco ? ' disabled' : '') + '>' + (heco ? '✓ Ya entrenaste esta semana' : 'Entrenar · ' + focoData.n) + '</button>' +
          '<div class="mini muted centro" style="margin-top:7px">Costo: ' + D.INTENSIDADES.find(function (i) { return i.id === int; }).fatiga + ' de condición · Riesgo de lesión ' + (int === 'suave' ? 'bajo' : int === 'intensa' ? 'alto' : 'normal') + '</div>' +
          '<div class="sep"></div>' +
          '<div class="fila entre wrap"><div class="mini muted">Atributos que entrena <b style="color:var(--txt)">' + focoData.n + '</b></div><span class="tag-mini">' + Object.keys(focoData.attrs).length + ' atributos</span></div>' +
          '<div class="det-efectos" style="margin-top:8px">' +
            Object.keys(focoData.attrs).map(function (k) { return '<div class="efecto"><span>' + D.ATRIBUTOS[k].n + '</span><b>' + Math.round(j.atributos[k]) + ' / ' + j.potencial + '</b></div>'; }).join('') +
          '</div>' +
        '</div>' +
        '<div class="pila">' +
          '<div class="card">' +
            '<div class="card-titulo"><h3><span class="ico">🫀</span>Estado</h3></div>' +
            '<div class="cond"><div class="cond-top"><span>Condición</span><b>' + Math.round(j.condicion) + '</b></div>' + barra(j.condicion, j.condicion >= 70 ? '' : j.condicion >= 40 ? 'oro' : 'rojo') + '</div>' +
            '<div class="cond" style="margin-top:9px"><div class="cond-top"><span>Moral</span><b>' + Math.round(j.moral) + '</b></div>' + barra(j.moral, 'azul') + '</div>' +
            (lesion ? '<div class="aviso rojo" style="margin-top:10px">🩹 ' + esc(j.lesion.tipo) + ' · ' + j.lesion.semanas + ' semanas de baja</div>' : '') +
            (j.sancion > 0 ? '<div class="aviso rojo" style="margin-top:8px">🟥 Suspendido ' + j.sancion + ' fecha(s)</div>' : '') +
            '<div class="sep"></div>' +
            '<div class="fila entre"><span class="mini muted">Nivel</span><b>' + j.nivel + ' · ' + J.xpPct() + '%</b></div>' +
            '<div class="fila entre" style="margin-top:5px"><span class="mini muted">Puntos de habilidad</span><b class="verde">' + j.puntos + ' PH</b></div>' +
          '</div>' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">🧑‍🏫</span>Tu equipo de trabajo</h3><span class="tag-mini">' + fDinero(j.dinero) + '</span></div>' + staff + '</div>' +
          resHTML +
        '</div>' +
      '</div>';
  }

  /* ---------------- mundo ---------------- */
  function tablaHTML(tabla, ligaId, compacta) {
    const j = jugador();
    const ligaObj = D.ligaPorId(ligaId);
    const filas = tabla.map(function (r) {
      const mio = r.club.id === j.clubId;
      let franja = '';
      if (r.pos <= 4) franja = 'cl';
      else if (r.pos <= 6) franja = 'el';
      else if (r.pos > tabla.length - 3) franja = 'desc';
      return '<tr class="' + (mio ? 'mio' : '') + '">' +
        '<td class="pos">' + r.pos + '</td>' +
        '<td><div class="eq"><span class="franja ' + franja + '"></span>' + escudo(r.club, 18, 'esc-mini') + '<b>' + esc(r.club.nombre) + '</b></div></td>' +
        '<td class="num">' + r.pj + '</td>' +
        '<td class="num">' + (r.dg > 0 ? '+' : '') + r.dg + '</td>' +
        '<td class="num">' + r.gf + '</td>' +
        '<td class="pts">' + r.pts + '</td>' +
      '</tr>';
    }).join('');
    return '<table class="tabla"><thead><tr><th></th><th>' + ligaObj.nombre + '</th><th style="text-align:center">PJ</th><th style="text-align:center">DG</th><th style="text-align:center">GF</th><th style="text-align:right">PTS</th></tr></thead><tbody>' + filas + '</tbody></table>';
  }
  function vMundo() {
    const j = jugador(), m = datos().mundo, c = club();
    const lid = UI.mundoLiga || c.liga;
    const l = D.ligaPorId(lid);
    const tabla = M.tabla(datos(), lid);
    const goleo = M.goleadores(datos(), lid);
    const esMiLiga = lid === c.liga;
    const filaMia = tabla.find(function (r) { return r.club.id === j.clubId; });
    const ofertas = m.ventanaInvierno && m.ofertasInvierno ? m.ofertasInvierno : [];
    const selector = D.LIGAS.map(function (lg) {
      return '<button class="liga-item ' + (lg.id === lid ? 'activo' : '') + '" data-accion="tab-liga" data-liga="' + lg.id + '"><span class="flag">' + lg.bandera + '</span>' + lg.nombre + '<b>' + (lg.id === c.liga ? 'TU LIGA' : lg.pais) + '</b></button>';
    }).join('');
    return '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:18px">' +
        '<div><h1 class="titulo-vista">El <em>mundo</em> del fútbol</h1><p class="sub-vista">Seis ligas reales, 116 clubes, mercados y selección. Tu carrera compite contra todo esto.</p></div>' +
        '<div class="chip lima">' + l.bandera + ' ' + l.nombre + ' · ' + l.pais + '</div>' +
      '</div>' +
      '<div class="mundo-grid">' +
        '<div class="pila">' +
          '<div class="card">' +
            '<div class="card-titulo"><h3><span class="ico">🏆</span>Tabla de posiciones</h3><span class="tag-mini">' + (filaMia ? 'Tu club: ' + filaMia.pos + 'º' : '') + '</span></div>' +
            '<div style="overflow-x:auto">' + tablaHTML(tabla, lid) + '</div>' +
            '<div class="mini muted" style="margin-top:10px"><span class="franja cl" style="display:inline-block;vertical-align:middle;margin-right:4px"></span> Champions / Libertadores · <span class="franja el" style="display:inline-block;vertical-align:middle;margin:0 4px"></span> Europa · <span class="franja desc" style="display:inline-block;vertical-align:middle;margin:0 4px"></span> Descenso</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-titulo"><h3><span class="ico">⚽</span>Goleadores</h3><span class="tag-mini">' + l.nombre + '</span></div>' +
            '<div style="overflow-x:auto"><table class="tabla"><thead><tr><th>#</th><th>Jugador</th><th>Club</th><th style="text-align:center">G</th><th style="text-align:center">A</th></tr></thead><tbody>' +
              goleo.slice(0, 10).map(function (g, i) {
                return '<tr class="' + (g.esJugador ? 'mio' : '') + '"><td class="pos">' + (i + 1) + '</td><td><b style="font-size:11.5px">' + esc(g.nombre) + '</b></td><td><div class="eq" style="min-width:0">' + escudo(D.clubPorId(g.clubId), 16, 'esc-mini') + '<span class="mini muted">' + esc(D.clubPorId(g.clubId) ? D.clubPorId(g.clubId).corto : '') + '</span></div></td><td class="num">' + g.goles + '</td><td class="num">' + g.asist + '</td></tr>';
              }).join('') +
            '</tbody></table></div>' +
          '</div>' +
        '</div>' +
        '<div class="pila">' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">🌍</span>Ligas</h3></div><div class="ligas-lista">' + selector + '</div></div>' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">🏟️</span>Tu club</h3></div>' +
            '<div class="fila" style="gap:11px">' + escudo(c, 44) + '<div><b style="font-size:14px">' + esc(c.nombre) + '</b><div class="mini muted">' + esc(c.ciudad) + ' · ' + l.nombre + '</div></div></div>' +
            '<div class="sep"></div>' +
            '<div class="kv"><span>Fuerza del plantel</span><b>' + c.fuerza + '</b></div>' +
            '<div class="kv"><span>Prestigio</span><b>' + c.prestigio + '</b></div>' +
            '<div class="kv"><span>Tu rol</span><b>' + J.rolActual().n + '</b></div>' +
            '<div class="kv"><span>Contrato</span><b>' + j.contrato.hasta + ' · ' + fDinero(j.contrato.salario) + '/sem</b></div>' +
          '</div>' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">🔄</span>Mercado</h3>' + (ofertas.length ? '<span class="tag-mini lima">ABIERTO</span>' : '<span class="tag-mini">CERRADO</span>') + '</div>' +
            (ofertas.length
              ? '<div class="mini muted" style="margin-bottom:8px">Ofertas de invierno. Podés cambiar de club ahora mismo.</div>' + ofertas.slice(0, 3).map(function (o) {
                  const cc = D.clubPorId(o.clubId);
                  const ll = D.ligaPorId(cc.liga);
                  const rol = D.ROLES.find(function (r) { return r.id === o.rol; }) || D.ROLES[3];
                  return '<div class="oferta" style="margin-bottom:8px"><div class="o-top">' + escudo(cc, 32) + '<div><b>' + esc(cc.nombre) + '</b><span>' + ll.bandera + ' ' + ll.nombre + ' · ' + cc.fuerza + ' de fuerza</span></div></div>' +
                    '<div class="o-datos"><div>Rol<b>' + rol.n + '</b></div><div>Salario<b>' + fDinero(o.salario) + '</b></div><div>Años<b>' + o.anos + '</b></div></div>' +
                    '<button class="btn primario sm bloque" data-accion="firmar-oferta" data-id="' + o.id + '">Firmar contrato</button></div>';
                }).join('')
              : '<div class="det-vacio" style="padding:18px 6px">El mercado está cerrado. Las ofertas llegan al terminar la temporada o en la ventana de invierno (fecha 19).</div>') +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- acciones ---------------- */
  UI.acciones['nueva'] = function () {
    if (J.hayGuardado()) {
      abrirModal('<div class="capa"><div class="modal angosto"><div class="modal-cabeza"><div class="mc-ico">⚠️</div><div><h2>Empezar de cero</h2><p>Vas a borrar la carrera guardada. Esta acción no se puede deshacer.</p></div></div><div class="modal-pie"><button class="btn ghost" data-accion="cerrar-modal">Cancelar</button><button class="btn peligro" data-accion="nueva-confirmada">Sí, borrar y empezar</button></div></div></div>');
      return;
    }
    nuevaCreacion();
  };
  UI.acciones['nueva-confirmada'] = function () {
    J.borrarGuardado();
    cerrarModal();
    nuevaCreacion();
  };
  UI.acciones['continuar'] = function () {
    const est = J.cargar();
    if (!est) { toast('No pudimos cargar', 'El guardado está dañado o no existe.', 'rojo'); renderInicio(); return; }
    cerrarModal();
    UI.vista = est.mundo.fase === 'retiro' ? 'retiro' : 'inicio';
    actualizar();
    toast('Carrera cargada', 'Bienvenido de vuelta, ' + est.jugador.nombre + '.', 'lima');
  };
  UI.acciones['como'] = function () {
    abrirModal('<div class="capa"><div class="modal ancho"><div class="modal-cabeza"><div class="mc-ico">🎮</div><div><h2>Cómo funciona</h2><p>Un juego de carrera, no un simulador de escritorio: cada semana importa.</p></div><button class="cerrar" data-accion="cerrar-modal">✕</button></div><div class="modal-cuerpo">' +
      '<div class="grid g3" style="gap:10px">' +
        '<div class="card plano"><div style="font-size:22px">🏋️</div><b style="font-size:13px;display:block;margin-top:4px">1. Entrená</b><div class="mini muted">Una sesión por semana. Elegí foco e intensidad. La condición y las lesiones son reales.</div></div>' +
        '<div class="card plano"><div style="font-size:22px">🌳</div><b style="font-size:13px;display:block;margin-top:4px">2. Construí</b><div class="mini muted">78 habilidades en 6 ramas. Subís de nivel, ganás PH y desbloqueás atributos y rasgos.</div></div>' +
        '<div class="card plano"><div style="font-size:22px">⚽</div><b style="font-size:13px;display:block;margin-top:4px">3. Jugá</b><div class="mini muted">Las jugadas se resuelven con tus atributos, estilo, táctica, moral y forma. Las ocasiones importantes las decidís vos.</div></div>' +
      '</div>' +
      '<div class="etiqueta-linea"><b>El motor en una frase</b><div class="hr"></div></div>' +
      '<p class="mini muted">Tu estilo (El Pibe, El Killer, La Flecha…) define cuántas jugadas te tocan y qué tan bien las resolvés. Tus atributos definen la probabilidad de gol, asistencia o quite. La táctica cambia el volumen de ocasiones y el riesgo. Nada está guionado: cada partido se simula con esas variables.</p>' +
      '<div class="aviso azul" style="margin-top:10px">Podés jugar partidos completos con decisiones o simularlos para avanzar rápido. El guardado es automático en este navegador.</div>' +
      '</div><div class="modal-pie"><button class="btn primario" data-accion="cerrar-modal">Entendido</button></div></div></div>');
  };
  UI.acciones['cerrar-modal'] = function () { cerrarModal(); };
  UI.acciones['set-pos'] = function (el) {
    leerCreacion(); UI.creacion.posicion = el.getAttribute('data-pos'); renderCreacion();
  };
  UI.acciones['set-arq'] = function (el) {
    leerCreacion(); UI.creacion.arquetipo = el.getAttribute('data-arq'); renderCreacion();
  };
  UI.acciones['set-dif'] = function (el) {
    leerCreacion(); UI.creacion.dificultad = el.getAttribute('data-dif'); renderCreacion();
  };
  UI.acciones['set-nac'] = function (el) {
    UI.creacion.nacionalidad = el.value;
  };
  UI.acciones['crear-ofertas'] = function () {
    leerCreacion();
    const n = (UI.creacion.nombre || '').trim();
    const a = (UI.creacion.apellido || '').trim();
    if (!n || !a) { toast('Faltan datos', 'Completá nombre y apellido para continuar.', 'rojo'); return; }
    UI.creacion.nombre = n; UI.creacion.apellido = a;
    const ofertas = J.ofertasIniciales(UI.creacion);
    UI.ofertasInicio = ofertas;
    ofertasInicio();
  };
  UI.acciones['volver-creacion'] = function () { renderCreacion(); };
  UI.acciones['firmar-inicial'] = function (el) {
    const r = J.firmarPrimerClub(el.getAttribute('data-id'));
    if (r.error) { toast('No pudimos firmar', r.error, 'rojo'); return; }
    cerrarModal();
    UI.ofertasInicio = null;
    UI.vista = 'inicio';
    actualizar();
    const c = club();
    toast('¡Empieza la carrera!', 'Firmaste con ' + c.nombre + '. Entrená y jugá para ganarte un lugar.', 'lima');
  };
  UI.acciones['continuar-semana'] = function () {
    if (!J.estado || !J.estado.mundo.partidoJugado) { UI.actualizar(); return; }
    if (J.estado.mundo.prensaPendiente && UI.abrirPrensa) {
      UI.abrirPrensa(function () {
        J.avanzarSemana();
        UI.ir('inicio');
        if (J.estado.mundo.fase === 'fin') setTimeout(function () { UI.abrirResumen(); }, 280);
      });
      return;
    }
    J.avanzarSemana();
    if (J.estado.mundo.fase === 'fin') {
      UI.ir('inicio');
      setTimeout(function () { UI.abrirResumen(); }, 280);
    } else {
      UI.actualizar();
    }
  };
  UI.acciones['ir'] = function (el) { ir(el.getAttribute('data-vista')); };
  UI.acciones['guardar'] = function () {
    if (!J.estado) return;
    if (J.guardar()) toast('Partida guardada', 'Tu carrera quedó a salvo en este navegador.', 'lima');
    else toast('No se pudo guardar', 'El almacenamiento del navegador está bloqueado.', 'rojo');
  };
  UI.acciones['set-foco'] = function (el) {
    const j = jugador();
    if (j.entrenoHecho) { toast('Sesión completada', 'El próximo entrenamiento es la semana que viene.', 'oro'); return; }
    j.foco = el.getAttribute('data-foco');
    j.focoManual = true;
    J.guardar();
    actualizar(true);
  };
  UI.acciones['set-int'] = function (el) {
    const j = jugador();
    j.intensidad = el.getAttribute('data-int');
    J.guardar();
    actualizar(true);
  };
  UI.acciones['usar-recomendado'] = function () {
    const j = jugador();
    j.foco = J.focoSugerido();
    j.focoManual = false;
    J.guardar();
    toast('Foco sugerido', 'El motor eligió la mayor carencia para tu posición.', 'lima');
    actualizar(true);
  };
  UI.acciones['entrenar'] = function () {
    const j = jugador();
    const r = J.entrenar(j.foco, j.intensidad, true);
    if (r.error) { toast('No pudimos entrenar', r.error, 'rojo'); return; }
    UI.ultimoEntreno = r;
    if (r.lesion) toast('Lesión en el entrenamiento', r.lesion.tipo + ' · ' + r.lesion.semanas + ' semanas', 'rojo');
    else toast('Entrenamiento completado', r.foco.n + ' · +' + r.total + ' atributos · +' + r.xp + ' XP', 'lima');
    actualizar(true);
  };
  UI.acciones['comprar-staff'] = function (el) {
    const r = J.comprarStaff(el.getAttribute('data-staff'));
    if (r.error) { toast('No se pudo contratar', r.error, 'rojo'); return; }
    toast('Staff mejorado', 'Nivel ' + r.nivel + ' contratado.', 'lima');
    actualizar(true);
  };
  UI.acciones['ver-nodo'] = function (el) {
    UI.nodoSel = el.getAttribute('data-id');
    if (window.innerWidth < 1180) {
      const h = D.HABILIDADES.find(function (x) { return x.id === UI.nodoSel; });
      UI.modalBloqueado = false;
      UI.abrirModal('<div class="capa"><div class="modal angosto"><div class="modal-cabeza"><div class="mc-ico">' + (h ? D.RAMAS[h.rama].icon : '🌳') + '</div><div><h2>Habilidad</h2><p>Atributos, rasgo y requisitos</p></div><button class="cerrar" data-accion="cerrar-modal">✕</button></div><div class="modal-cuerpo" id="detalle-nodo">' + detalleNodo() + '</div></div></div>');
    } else {
      actualizarDetalleNodo();
    }
  };
  UI.acciones['desbloquear'] = function (el) {
    const r = J.desbloquear(el.getAttribute('data-id'));
    if (r.error) { toast('No pudimos aprenderla', r.error, 'rojo'); return; }
    toast('Habilidad aprendida', 'Tus atributos y rasgos se actualizaron.', 'lima');
    if (UI.modalAbierto && window.innerWidth < 1180) { UI.modalBloqueado = false; cerrarModal(); }
    actualizar(true);
  };
  UI.acciones['tab-liga'] = function (el) {
    UI.mundoLiga = el.getAttribute('data-liga');
    actualizar(true);
  };
  UI.acciones['menu'] = function () {
    const j = jugador();
    abrirModal('<div class="capa"><div class="modal"><div class="modal-cabeza"><div class="mc-ico">☰</div><div><h2>Menú</h2><p>' + esc(nombreCompleto(j)) + ' · ' + esc(club().nombre) + '</p></div><button class="cerrar" data-accion="cerrar-modal">✕</button></div><div class="modal-cuerpo">' +
      '<div class="pila" style="gap:8px">' +
        '<button class="btn bloque" data-accion="guardar">💾 Guardar ahora</button>' +
        '<button class="btn bloque" data-accion="exportar">📤 Exportar carrera (código)</button>' +
        '<button class="btn bloque" data-accion="importar">📥 Importar carrera</button>' +
        '<button class="btn bloque" data-accion="como">🎮 Cómo funciona</button>' +
        '<button class="btn bloque peligro" data-accion="borrar-carrera">🗑️ Borrar carrera</button>' +
        '<button class="btn ghost bloque" data-accion="salir-inicio">🏠 Volver al inicio</button>' +
      '</div>' +
      '<div class="aviso azul" style="margin-top:12px">El progreso se guarda automáticamente después de cada acción importante. Exportá el código si querés llevarte la carrera a otro dispositivo.</div>' +
      '</div></div></div>');
  };
  UI.acciones['salir-inicio'] = function () {
    cerrarModal();
    J.guardar();
    renderInicio();
  };
  UI.acciones['borrar-carrera'] = function () {
    abrirModal('<div class="capa"><div class="modal angosto"><div class="modal-cabeza"><div class="mc-ico">🗑️</div><div><h2>Borrar carrera</h2><p>Se elimina el guardado de este navegador. No se puede deshacer.</p></div></div><div class="modal-pie"><button class="btn ghost" data-accion="cerrar-modal">Cancelar</button><button class="btn peligro" data-accion="borrar-confirmado">Borrar todo</button></div></div></div>');
  };
  UI.acciones['borrar-confirmado'] = function () {
    J.borrarGuardado();
    cerrarModal();
    UI.vista = 'inicio';
    renderInicio();
    toast('Carrera borrada', 'Podés empezar una nueva cuando quieras.', 'oro');
  };
  UI.acciones['exportar'] = function () {
    const txt = J.exportar();
    if (!txt) { toast('No se pudo exportar', 'Intentá guardar primero.', 'rojo'); return; }
    abrirModal('<div class="capa"><div class="modal"><div class="modal-cabeza"><div class="mc-ico">📤</div><div><h2>Exportar carrera</h2><p>Copiá este código y guardalo. Sirve para restaurar tu carrera.</p></div><button class="cerrar" data-accion="cerrar-modal">✕</button></div><div class="modal-cuerpo"><textarea id="txt-export" class="campo" style="width:100%;height:180px;background:#0c130e;color:#cfe0d4;border:1px solid var(--line2);border-radius:9px;padding:10px;font-family:monospace;font-size:10px">' + esc(txt) + '</textarea><div class="fila" style="margin-top:10px"><button class="btn primario sm" data-accion="copiar-export">Copiar código</button><span class="mini muted">' + Math.round(txt.length / 1024) + ' KB</span></div></div></div></div>');
  };
  UI.acciones['copiar-export'] = function () {
    const t = document.getElementById('txt-export');
    if (!t) return;
    t.select();
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(t.value);
      else document.execCommand('copy');
      toast('Copiado', 'El código está en tu portapapeles.', 'lima');
    } catch (e) { toast('Copiá manualmente', 'Seleccioná el texto y copialo.', 'oro'); }
  };
  UI.acciones['importar'] = function () {
    abrirModal('<div class="capa"><div class="modal"><div class="modal-cabeza"><div class="mc-ico">📥</div><div><h2>Importar carrera</h2><p>Pegá un código de LEYENDA. Reemplaza la carrera actual.</p></div><button class="cerrar" data-accion="cerrar-modal">✕</button></div><div class="modal-cuerpo"><textarea id="txt-import" placeholder="Pegá el código acá..." style="width:100%;height:150px;background:#0c130e;color:#cfe0d4;border:1px solid var(--line2);border-radius:9px;padding:10px;font-family:monospace;font-size:10px"></textarea><div class="fila" style="margin-top:10px"><button class="btn primario sm" data-accion="importar-confirmar">Importar</button></div></div></div></div>');
  };
  UI.acciones['importar-confirmar'] = function () {
    const t = document.getElementById('txt-import');
    if (!t || !t.value.trim()) { toast('Falta el código', 'Pegá el texto exportado.', 'rojo'); return; }
    const r = J.importar(t.value.trim());
    if (r.error) { toast('No se pudo importar', r.error, 'rojo'); return; }
    cerrarModal();
    UI.vista = 'inicio';
    actualizar();
    toast('Carrera importada', 'Tu partida fue restaurada.', 'lima');
  };

  /* ---------------- init ---------------- */
  function init() {
    UI.creacion = { nombre: '', apellido: '', nacionalidad: 'arg', posicion: 'MCO', arquetipo: 'pibe', dificultad: 'normal' };
    document.addEventListener('click', function (ev) {
      const el = ev.target.closest('[data-accion]');
      if (!el) return;
      const accion = el.getAttribute('data-accion');
      const fn = UI.acciones[accion];
      if (!fn) return;
      if (el.tagName === 'A') ev.preventDefault();
      fn(el, ev);
    });
    document.getElementById('capa-modal').addEventListener('click', function (ev) {
      if (ev.target.id === 'capa-modal' && !UI.modalBloqueado) cerrarModal();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && UI.modalAbierto && !UI.modalBloqueado) cerrarModal();
    });
    renderInicio();
    setTimeout(function () {
      const c = document.getElementById('carga');
      if (c) c.classList.add('fuera');
    }, 420);
  }

  UI.init = init;
  UI.renderInicio = renderInicio;
  UI.actualizar = actualizar;
  UI.ir = ir;
  UI.toast = toast;
  UI.abrirModal = abrirModal;
  UI.cerrarModal = cerrarModal;
  UI.escudo = escudo;
  UI.radar = radar;
  UI.barra = barra;
  UI.fDinero = fDinero;
  UI.fValor = fValor;
  UI.fNota = fNota;
  UI.colorNota = colorNota;
  UI.estrellas = estrellas;
  UI.nombreCompleto = nombreCompleto;
  UI.vistas.inicio = vInicio;
  UI.vistas.habilidades = vHabilidades;
  UI.vistas.entreno = vEntreno;
  UI.vistas.mundo = vMundo;
  UI.vistas.partido = function () { return '<div class="card"><div class="det-vacio">Cargando partido…</div></div>'; };
  UI.vistas.perfil = function () { return '<div class="card"><div class="det-vacio">Perfil no disponible.</div></div>'; };
  UI.vistas.motor = function () { return '<div class="card"><div class="det-vacio">Motor no disponible.</div></div>'; };
  UI.vistas.retiro = function () { return '<div class="card"><div class="det-vacio">Cargando legado…</div></div>'; };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
