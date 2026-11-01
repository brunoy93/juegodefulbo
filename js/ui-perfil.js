/* =========================================================
   LEYENDA · interfaz — perfil, legado y motor
   ========================================================= */
(function (global) {
  'use strict';
  const D = global.DATOS, M = global.Motor, J = global.Juego, UI = global.UI;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fNota(n) { return (Number(n) || 0).toFixed(1).replace('.', ','); }
  function fDinero(k) { return UI.fDinero(k); }
  function fValor(v) { return UI.fValor(v); }
  function colorNota(n) { return UI.colorNota(n); }
  function estrellas(p) { return UI.estrellas(p); }
  function clamp(a, b, v) { return v < a ? a : v > b ? b : v; }

  /* ---------------- perfil ---------------- */
  function vPerfil() {
    const j = J.estado.jugador, m = J.estado.mundo, c = J.clubActual(), l = J.ligaActual();
    const n = D.NACIONES_MAP[j.nacionalidad] || { n: 'Argentina', bandera: '🇦🇷' };
    const ovr = M.ovrJugador(j);
    const st = j.estadisticasTemporada;
    const ca = j.estadisticasCarrera;
    const prom = J.promedioTemporada();
    const promC = J.promedioCarrera();
    const hist = (j.historial || []).slice().reverse();
    const palmares = j.palmares || [];
    const premios = j.premios || [];
    const lesion = j.lesion && j.lesion.semanas > 0;

    const atributos = D.CATEGORIAS.map(function (cat) {
      const keys = D.ORDEN_ATRIBUTOS.filter(function (k) { return D.ATRIBUTOS[k].cat === cat.id; });
      return '<div class="etiqueta-linea"><b>' + cat.icon + ' ' + cat.n + '</b><div class="hr"></div></div>' +
        '<div class="attrs">' + keys.map(function (k) {
          const v = Math.round(j.atributos[k]);
          return '<div class="attr ' + (v >= 85 ? 'alto' : '') + '"><div class="a-top"><span>' + D.ATRIBUTOS[k].n + '</span><b>' + v + '</b></div>' + UI.barra(v) + '</div>';
        }).join('') + '</div>';
    }).join('');

    const histHTML = hist.length
      ? '<div style="overflow-x:auto"><table class="tabla historial"><thead><tr><th>Temp.</th><th>Club</th><th>Liga</th><th>Pos</th><th style="text-align:center">PJ</th><th style="text-align:center">G</th><th style="text-align:center">A</th><th style="text-align:center">Nota</th><th style="text-align:center">OVR</th></tr></thead><tbody>' +
        hist.map(function (h) {
          return '<tr><td class="num">' + h.temporada + '</td><td><b style="font-size:11px">' + esc(h.club) + '</b></td><td class="mini muted">' + esc(h.liga) + '</td><td class="num">' + h.pos + 'º</td><td class="num">' + h.pj + '</td><td class="num">' + h.goles + '</td><td class="num">' + h.asistencias + '</td><td class="num" style="color:' + colorNota(h.promedio) + '">' + fNota(h.promedio) + '</td><td class="num">' + h.ovr + '</td></tr>';
        }).join('') + '</tbody></table></div>'
      : '<div class="det-vacio">Tu primera temporada está en curso.</div>';

    const palHTML = palmares.length
      ? '<div class="palmares">' + palmares.map(function (p) {
          const ico = p.tipo === 'liga' ? '🏆' : p.tipo === 'copa' ? '🏅' : p.tipo === 'continental' ? '🌎' : p.tipo === 'seleccion' ? '🌍' : '🏆';
          return '<div class="trofeo"><div class="ti">' + ico + '</div><b>' + esc(p.nombre) + '</b><span>' + p.anyo + (p.club ? ' · ' + esc(p.club) : '') + '</span></div>';
        }).join('') + '</div>'
      : '<div class="det-vacio">Todavía no levantaste un trofeo. El camino recién empieza.</div>';

    const premHTML = premios.length
      ? '<div class="palmares">' + premios.map(function (p) {
          const ico = p.id === 'balon' ? '🥇' : p.id === 'goleador' || p.id.indexOf('goleador') === 0 ? '👟' : p.id === 'mvp' || p.id.indexOf('mvp') === 0 ? '⭐' : p.id === 'joven' ? '🌟' : p.id === 'equipo' ? '📋' : '🏅';
          return '<div class="trofeo" style="border-color:rgba(245,196,81,.35);background:rgba(245,196,81,.08)"><div class="ti">' + ico + '</div><b>' + esc(p.nombre) + '</b><span>' + p.anyo + (p.detalle ? ' · ' + esc(p.detalle) : '') + '</span></div>';
        }).join('') + '</div>'
      : '<div class="det-vacio">Los premios individuales llegan con las grandes temporadas.</div>';

    return '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:18px">' +
        '<div><h1 class="titulo-vista">Tu <em>perfil</em></h1><p class="sub-vista">La ficha completa: atributos, contrato, historial y todo lo que dejaste en el camino.</p></div>' +
        '<div class="fila wrap"><button class="btn ghost sm" data-accion="guardar">💾 Guardar</button><button class="btn ghost sm" data-accion="exportar">📤 Exportar</button>' + (j.edad >= 30 ? '<button class="btn peligro sm" data-accion="retirarse">🎬 Retirarse</button>' : '') + '</div>' +
      '</div>' +
      '<div class="card perfil-hero" style="margin-bottom:16px">' +
        '<div class="avatar-j" style="width:64px;height:64px;font-size:26px">' + esc((j.nombre[0] || '') + (j.apellido[0] || '')) + '</div>' +
        '<div><div class="eyebrow" style="font-size:9.5px;letter-spacing:.14em;color:var(--muted2);text-transform:uppercase;font-weight:800">' + D.POSICIONES[j.posicion].n + ' · ' + D.ARQUETIPOS[j.arquetipo].n + '</div>' +
          '<div style="font-family:var(--display);font-size:32px;text-transform:uppercase;line-height:1;margin:3px 0">' + esc(j.nombre) + ' ' + esc(j.apellido) + '</div>' +
          '<div class="mini muted">' + n.bandera + ' ' + n.n + ' · ' + j.edad + ' años · ' + esc(c.nombre) + ' · ' + l.bandera + ' ' + l.nombre + '</div>' +
          '<div class="hero-tags" style="margin-top:8px"><span class="chip lima">Nivel ' + j.nivel + '</span><span class="chip">' + estrellas(j.potencial) + ' techo</span><span class="chip">' + fValor(j.valor) + '</span><span class="chip">#' + (j.dorsal || '—') + '</span>' + (j.capitan ? '<span class="chip oro">🎖️ Capitán</span>' : '') + (lesion ? '<span class="chip rojo">🩹 ' + j.lesion.semanas + ' sem</span>' : '') + '</div>' +
        '</div>' +
        '<div class="hero-ovr"><div class="anillo" style="--p:' + ovr + '"><div class="val"><b>' + ovr + '</b><span>OVR</span></div></div></div>' +
      '</div>' +
      '<div class="grid g2" style="align-items:start">' +
        '<div class="card"><div class="card-titulo"><h3><span class="ico">🕸️</span>Perfil de atributos</h3><span class="tag-mini">' + j.potencial + ' potencial</span></div><div class="radar-wrap">' + UI.radar(j) + '</div>' +
          '<div class="kpis" style="margin-top:10px"><div class="kpi"><div class="k-top"><span>Nota temp.</span></div><div class="k-val" style="color:' + (prom ? colorNota(prom) : 'var(--muted2)') + '">' + (prom ? fNota(prom) : '—') + '</div></div><div class="kpi"><div class="k-top"><span>Nota carrera</span></div><div class="k-val" style="color:' + (promC ? colorNota(promC) : 'var(--muted2)') + '">' + (promC ? fNota(promC) : '—') + '</div></div></div>' +
        '</div>' +
        '<div class="card"><div class="card-titulo"><h3><span class="ico">📊</span>Temporada actual</h3><span class="tag-mini lima">' + m.anyo + '/' + String(m.anyo + 1).slice(2) + '</span></div>' +
          '<div class="kpis"><div class="kpi"><div class="k-top"><span>Partidos</span></div><div class="k-val">' + st.pj + '</div></div><div class="kpi"><div class="k-top"><span>Goles</span></div><div class="k-val">' + st.goles + '</div></div><div class="kpi"><div class="k-top"><span>Asist.</span></div><div class="k-val">' + st.asistencias + '</div></div><div class="kpi"><div class="k-top"><span>MVP</span></div><div class="k-val">' + st.mvp + '</div></div></div>' +
          '<div class="sep"></div>' +
          '<div class="kv"><span>Minutos jugados</span><b>' + st.minutos + '</b></div>' +
          '<div class="kv"><span>Tiros</span><b>' + st.tiros + '</b></div>' +
          '<div class="kv"><span>Pases clave</span><b>' + st.pasesClave + '</b></div>' +
          '<div class="kv"><span>Amarillas / rojas</span><b>' + st.amarillas + ' / ' + st.rojas + '</b></div>' +
          '<div class="sep"></div>' +
          '<div class="kv"><span>Contrato</span><b>' + j.contrato.hasta + '</b></div>' +
          '<div class="kv"><span>Salario</span><b>' + fDinero(j.contrato.salario) + '/sem</b></div>' +
          '<div class="kv"><span>Valor de mercado</span><b>' + fValor(j.valor) + '</b></div>' +
          '<div class="kv"><span>Reputación</span><b>' + Math.round(j.reputacion) + ' / 100</b></div>' +
        '</div>' +
      '</div>' +
      '<div class="card" style="margin-top:16px"><div class="card-titulo"><h3><span class="ico">🧬</span>Atributos</h3><span class="tag-mini">' + (j.habilidades.length) + ' habilidades</span></div>' + atributos + '</div>' +
      '<div class="card" style="margin-top:16px"><div class="card-titulo"><h3><span class="ico">📜</span>Historial de temporadas</h3></div>' + histHTML + '</div>' +
      '<div class="grid g2" style="margin-top:16px;align-items:start"><div class="card"><div class="card-titulo"><h3><span class="ico">🏆</span>Palmarés</h3><span class="tag-mini oro">' + palmares.length + ' títulos</span></div>' + palHTML + '</div>' +
        '<div class="card"><div class="card-titulo"><h3><span class="ico">🏅</span>Premios individuales</h3><span class="tag-mini oro">' + premios.length + '</span></div>' + premHTML + '</div></div>' +
      '<div class="card" style="margin-top:16px"><div class="card-titulo"><h3><span class="ico">🌍</span>Selección</h3></div>' +
        '<div class="kpis"><div class="kpi"><div class="k-top"><span>Partidos</span></div><div class="k-val">' + j.seleccion.caps + '</div></div><div class="kpi"><div class="k-top"><span>Goles</span></div><div class="k-val">' + j.seleccion.goles + '</div></div><div class="kpi"><div class="k-top"><span>Debut</span></div><div class="k-val" style="font-size:16px">' + (j.seleccion.debut ? 'Sí' : 'Todavía no') + '</div></div><div class="kpi"><div class="k-top"><span>Torneos</span></div><div class="k-val">' + j.seleccion.torneos.length + '</div></div></div>' +
        (j.seleccion.torneos.length ? '<div class="sep"></div><div class="mini muted">' + j.seleccion.torneos.map(function (t) { return t.anyo + ' · ' + t.nombre + ' · ' + (t.campeon ? '🏆 Campeón' : 'Participación'); }).join('<br>') + '</div>' : '') +
      '</div>' +
      '<div class="card" style="margin-top:16px"><div class="card-titulo"><h3><span class="ico">👑</span>Legado y vínculo con el club</h3><button class="accion" data-accion="ir" data-vista="vida">Abrir Vida →</button></div>' +
        (function () {
          const l = global.Vida ? global.Vida.nivelLeyenda(J.estado) : { nivel: 'Promesa', puntos: 0 };
          return '<div class="fila entre" style="margin-bottom:5px"><span class="mini muted">Nivel de ídolo en ' + esc(J.clubActual().nombre) + '</span><b class="mini">' + l.nivel + ' · ' + l.puntos + ' / 420</b></div>' + UI.barra(Math.min(100, l.puntos / 420 * 100), 'oro') +
            '<div class="kpis" style="margin-top:10px">' +
              '<div class="kpi"><div class="k-top"><span>Fanatismo</span></div><div class="k-val">' + Math.round(j.fanatismo || 35) + '</div></div>' +
              '<div class="kpi"><div class="k-top"><span>Confianza DT</span></div><div class="k-val">' + Math.round(j.confianzaDT || 45) + '</div></div>' +
              '<div class="kpi"><div class="k-top"><span>Dorsal</span></div><div class="k-val">#' + (j.dorsal || '—') + '</div></div>' +
              '<div class="kpi"><div class="k-top"><span>Cinta</span></div><div class="k-val" style="font-size:15px">' + (j.capitan ? 'Capitán' : '—') + '</div></div>' +
            '</div>' +
            '<div class="mini muted" style="margin-top:8px">Récords: ' + (j.records.golesTemporada || 0) + ' goles en una temporada · ' + (j.records.partidosCarrera || 0) + ' partidos en carrera · ' + (j.palmares || []).length + ' títulos.</div>';
        })() +
      '</div>';
  }

  /* ---------------- motor ---------------- */
  function vMotor() {
    const j = J.estado.jugador, c = J.clubActual();
    const arq = D.ARQUETIPOS[j.arquetipo];
    const est = arq.estilo;
    const pos = D.POSICIONES[j.posicion];
    const ovr = M.ovrJugador(j);
    const star = clamp(0.7, 1.35, 0.9 + (ovr - c.fuerza) / 50);
    const fin = clamp(0.02, 0.58, pos.fin * est.fin * star * 0.92);
    const cre = clamp(0.02, 0.58, pos.cre * est.cre * star * 0.92);
    const def = clamp(0.02, 0.58, pos.def * est.def * star * 0.92);
    const mods = M.modsJugador(j);
    const fake = { atributos: j.atributos, mods: mods, j: j, arquetipo: j.arquetipo, club: c };
    let opsT = [], opsD = [];
    try { opsT = M.opcionesTiro(fake, 0.28, 'filtrado', 60); } catch (e) { }
    try { opsD = M.opcionesDefensa(fake, 0.25, 60); } catch (e) { }
    const rasgos = (j.rasgos || []).map(function (id) { return D.RASGOS[id]; }).filter(Boolean);

    return '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:18px">' +
        '<div><h1 class="titulo-vista">El <em>motor</em></h1><p class="sub-vista">Nada está guionado: cada ocasión se resuelve con tus atributos, tu estilo, la táctica y el contexto. Acá ves los números que el juego usa para vos.</p></div>' +
        '<div class="chip lima">⚙️ Motor v1.0 · determinístico por atributos</div>' +
      '</div>' +
      '<div class="grid g2" style="align-items:start">' +
        '<div class="pila">' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">🧬</span>Tu estilo en el motor</h3><span class="tag-mini lima">' + esc(arq.n) + '</span></div>' +
            '<p class="mini muted" style="margin-bottom:10px">' + esc(arq.lema) + '</p>' +
            '<div class="kv"><span>Participación como finalizador</span><b>' + Math.round(fin * 100) + '% de las ocasiones</b></div>' +
            '<div class="kv"><span>Participación como creador</span><b>' + Math.round(cre * 100) + '%</b></div>' +
            '<div class="kv"><span>Participación defensiva</span><b>' + Math.round(def * 100) + '%</b></div>' +
            '<div class="sep"></div>' +
            '<div class="fila entre"><span class="mini muted">Multiplicador de definición</span><b class="verde">×' + est.fin.toFixed(2) + '</b></div>' +
            '<div class="fila entre" style="margin-top:4px"><span class="mini muted">Multiplicador de creación</span><b class="verde">×' + est.cre.toFixed(2) + '</b></div>' +
            '<div class="fila entre" style="margin-top:4px"><span class="mini muted">Multiplicador defensivo</span><b class="verde">×' + est.def.toFixed(2) + '</b></div>' +
            '<div class="aviso azul" style="margin-top:10px">Tu posición define la base; tu estilo la multiplica. Si tu OVR supera la fuerza del club, el motor te da más peso en las jugadas.</div>' +
          '</div>' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">🎲</span>Tus probabilidades ahora</h3><span class="tag-mini">xG 0,28 · 60\'</span></div>' +
            '<div class="etiqueta">Ocasión clara · opciones de tiro</div>' +
            opsT.map(function (o) {
              return '<div style="margin:9px 0"><div class="fila entre"><span class="mini"><b>' + o.icon + ' ' + o.n + '</b></span><b class="num" style="color:var(--lime)">' + Math.round(o.pExito * 100) + '%</b></div>' + UI.barra(o.pExito * 100, 'fina') + '<div class="mini muted" style="font-size:9.5px;margin-top:2px">' + o.attrs.join(' · ') + ' · riesgo ' + o.riesgo + '/5</div></div>';
            }).join('') +
            '<div class="etiqueta" style="margin-top:14px">Duelo defensivo · opciones</div>' +
            opsD.map(function (o) {
              return '<div style="margin:9px 0"><div class="fila entre"><span class="mini"><b>' + o.icon + ' ' + o.n + '</b></span><b class="num" style="color:var(--cian)">' + Math.round(o.pExito * 100) + '%</b></div>' + UI.barra(o.pExito * 100, 'fina') + '<div class="mini muted" style="font-size:9.5px;margin-top:2px">' + o.attrs.join(' · ') + ' · riesgo ' + o.riesgo + '/5</div></div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="pila">' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">⚙️</span>Cómo se juega una jugada</h3></div>' +
            '<div class="timeline">' +
              '<div class="tl-item"><div class="tl-año">01</div><div class="tl-pt"><div class="tl-dot"></div><div class="tl-line"></div></div><div class="tl-txt"><b>Se genera la ocasión.</b> El motor calcula cuántas chances crea cada equipo según ataque, defensa, táctica y localía.</div></div>' +
              '<div class="tl-item"><div class="tl-año">02</div><div class="tl-pt"><div class="tl-dot"></div><div class="tl-line"></div></div><div class="tl-txt"><b>Se reparte la participación.</b> Posición, estilo, minutos y tu peso frente al plantel definen si la jugada es tuya, de un compañero o del rival.</div></div>' +
              '<div class="tl-item"><div class="tl-año">03</div><div class="tl-pt"><div class="tl-dot"></div><div class="tl-line"></div></div><div class="tl-txt"><b>Elegís o se resuelve.</b> Tiro, pase, regate o quite: cada opción usa atributos distintos y tiene una probabilidad propia.</div></div>' +
              '<div class="tl-item"><div class="tl-año">04</div><div class="tl-pt"><div class="tl-dot"></div></div><div class="tl-txt"><b>Se actualiza todo.</b> Gol, asistencia, nota, moral, fitness, tabla y mercado. La temporada sigue.</div></div>' +
            '</div>' +
          '</div>' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">📐</span>Las fórmulas</h3></div>' +
            '<div class="mini muted" style="line-height:1.7">' +
              '<b style="color:var(--txt)">Ataque:</b> fuerza del club + impacto de tu OVR + táctica + localía.<br>' +
              '<b style="color:var(--txt)">Ocasiones:</b> λ = 1,24 × (ataque/defensa)^2,45 × táctica × localía. Se sortea con Poisson.<br>' +
              '<b style="color:var(--txt)">xG:</b> cada ocasión recibe un valor entre 0,04 y 0,58; las claras pesan más.<br>' +
              '<b style="color:var(--txt)">Conversión:</b> xG × (0,55 + (atributo − 45)/95) × rasgos × estilo.<br>' +
              '<b style="color:var(--txt)">Nota:</b> base 6,25 + goles, asistencias, pases clave, duelos, errores y resultado.<br>' +
              '<b style="color:var(--txt)">Progresión:</b> margen hasta el potencial × edad × intensidad × staff × dificultad.' +
            '</div>' +
          '</div>' +
          '<div class="card"><div class="card-titulo"><h3><span class="ico">✨</span>Rasgos activos</h3><span class="tag-mini oro">' + rasgos.length + '</span></div>' +
            (rasgos.length ? rasgos.map(function (r) { return '<div class="efecto rasgo" style="margin-bottom:5px"><b>' + esc(r.n) + '</b><br>' + esc(r.d) + '</div>'; }).join('') : '<div class="det-vacio" style="padding:16px">Todavía no desbloqueaste rasgos. Los nodos de tier alto del árbol los otorgan.</div>') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="card" style="margin-top:16px"><div class="card-titulo"><h3><span class="ico">🔬</span>Transparencia total</h3></div>' +
        '<p class="mini muted">Este panel usa exactamente las mismas funciones que el partido. Si subís Definición, las probabilidades de tiro cambian; si cambiás de estilo, cambia tu participación. No hay dados ocultos: hay atributos, contexto y azar controlado.</p>' +
      '</div>';
  }

  /* ---------------- retiro ---------------- */
  function vRetiro() {
    const j = J.estado.jugador;
    const leg = J.legado();
    const c = J.clubActual();
    const ca = j.estadisticasCarrera;
    const prom = J.promedioCarrera();
    const palmares = j.palmares || [];
    return '<div style="max-width:900px;margin:0 auto">' +
      '<div class="reporte-hero" style="border-color:rgba(245,196,81,.35)">' +
        '<div class="etiqueta" style="color:var(--gold)">CARRERA FINALIZADA</div>' +
        '<div style="font-family:var(--display);font-size:clamp(42px,8vw,78px);line-height:.85;text-transform:uppercase;margin:8px 0">' + esc(j.nombre) + '<br><span style="color:var(--gold)">' + esc(j.apellido) + '</span></div>' +
        '<div class="mini muted">' + j.edad + ' años · ' + D.POSICIONES[j.posicion].n + ' · ' + D.ARQUETIPOS[j.arquetipo].n + '</div>' +
        '<div class="mvp-tag" style="border-color:rgba(245,196,81,.45)">🏆 ' + esc(leg.nivel) + ' · ' + leg.puntos + ' pts de legado</div>' +
      '</div>' +
      '<div class="kpis" style="margin-top:16px">' +
        '<div class="kpi"><div class="k-top"><span>Partidos</span></div><div class="k-val">' + ca.pj + '</div></div>' +
        '<div class="kpi"><div class="k-top"><span>Goles</span></div><div class="k-val">' + ca.goles + '</div></div>' +
        '<div class="kpi"><div class="k-top"><span>Asistencias</span></div><div class="k-val">' + ca.asistencias + '</div></div>' +
        '<div class="kpi oro"><div class="k-top"><span>Nota media</span></div><div class="k-val">' + (prom ? fNota(prom) : '—') + '</div></div>' +
      '</div>' +
      '<div class="grid g2" style="margin-top:16px;align-items:start">' +
        '<div class="card"><div class="card-titulo"><h3><span class="ico">🏆</span>Palmarés</h3></div>' + (palmares.length ? '<div class="palmares">' + palmares.map(function (p) { return '<div class="trofeo"><div class="ti">' + (p.tipo === 'seleccion' ? '🌍' : p.tipo === 'continental' ? '🌎' : '🏆') + '</div><b>' + esc(p.nombre) + '</b><span>' + p.anyo + '</span></div>'; }).join('') + '</div>' : '<div class="det-vacio">Sin títulos.</div>') + '</div>' +
        '<div class="card"><div class="card-titulo"><h3><span class="ico">📜</span>Últimos años</h3></div>' +
          (j.historial || []).slice(-5).reverse().map(function (h) { return '<div class="kv"><span>' + h.temporada + ' · ' + esc(h.club) + '</span><b>' + h.goles + 'G · ' + fNota(h.promedio) + '</b></div>'; }).join('') +
          '<div class="sep"></div><div class="kv"><span>Selección</span><b>' + j.seleccion.caps + ' PJ · ' + j.seleccion.goles + ' G</b></div>' +
          '<div class="kv"><span>Reputación final</span><b>' + Math.round(j.reputacion) + ' / 100</b></div>' +
        '</div>' +
      '</div>' +
      '<div class="fila centro" style="justify-content:center;margin-top:22px"><button class="btn primario xl" data-accion="nueva-carrera-final">Empezar una nueva leyenda →</button></div>' +
    '</div>';
  }

  UI.vistas.perfil = vPerfil;
  UI.vistas.motor = vMotor;
  UI.vistas.retiro = vRetiro;

  UI.acciones['retirarse'] = function () {
    UI.abrirModal('<div class="capa"><div class="modal angosto"><div class="modal-cabeza"><div class="mc-ico">🎬</div><div><h2>¿Colgar los botines?</h2><p>Vas a cerrar tu carrera y ver el legado completo. No hay vuelta atrás.</p></div></div><div class="modal-pie"><button class="btn ghost" data-accion="cerrar-modal">Seguir jugando</button><button class="btn peligro" data-accion="retirarse-confirmar">Sí, retirarme</button></div></div></div>');
  };
  UI.acciones['retirarse-confirmar'] = function () {
    const r = J.retirarse();
    if (r.error) { UI.toast('Todavía no', r.error, 'rojo'); return; }
    UI.cerrarModal();
    UI.ir('retiro');
  };
  UI.acciones['nueva-carrera-final'] = function () {
    UI.abrirModal('<div class="capa"><div class="modal angosto"><div class="modal-cabeza"><div class="mc-ico">🌱</div><div><h2>Nueva leyenda</h2><p>Se borra esta carrera y su legado. ¿Empezamos otra historia?</p></div></div><div class="modal-pie"><button class="btn ghost" data-accion="cerrar-modal">Cancelar</button><button class="btn primario" data-accion="borrar-final">Sí, empezar de cero</button></div></div></div>');
  };
  UI.acciones['borrar-final'] = function () {
    J.borrarGuardado();
    UI.cerrarModal();
    UI.renderInicio();
  };
})(typeof window !== 'undefined' ? window : globalThis);
