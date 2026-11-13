/* AgroMarket · Hora de vender
 * Site estático: lê os CSVs da pasta data/ e calcula tudo no navegador.
 * Metodologia completa na tela "Como calculamos" (#/metodo).
 */
(function () {
  'use strict';

  // ---------- Parâmetros do método ----------
  var JANELA_DIAS = 15;          // ± dias em torno da mesma data
  var ANOS = 5;                  // anos anteriores comparados
  var FAVORAVEL = 60;            // percentil a partir do qual o sinal é favorável
  var NEUTRO = 40;               // abaixo disso, desfavorável
  var FUNDOS_ALTO = 0.15;        // fatia do mercado considerada "muito comprada"
  var FUNDOS_VENDIDOS = -0.05;   // fatia considerada "vendida"
  var TON_POR_CONTRATO = 5000 * 27.2155 / 1000; // 5.000 bushels × 27,2155 kg

  // ---------- Formatação pt-BR ----------
  var nf = function (d) { return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var F0 = nf(0), F1 = nf(1), F2 = nf(2), F3 = nf(3);
  var MINUS = '−';
  function brl(v) { return 'R$ ' + F2.format(v); }
  function usd(v) { return 'US$ ' + F2.format(v); }
  function sinal(v, f) { return (v > 0 ? '+' : v < 0 ? MINUS : '') + f.format(Math.abs(v)); }
  function pctS(v) { return sinal(v, F1) + '%'; }
  function dBR(s) { return s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4); }
  function dDM(s) { return s.slice(8, 10) + '/' + s.slice(5, 7); }
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  // ---------- Datas (UTC, strings AAAA-MM-DD) ----------
  function toT(s) { return Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)); }
  function toS(t) { return new Date(t).toISOString().slice(0, 10); }
  function addDays(s, n) { return toS(toT(s) + n * 864e5); }
  function weekday(s) { return DIAS[new Date(toT(s)).getUTCDay()]; }

  // ---------- Dados ----------
  var DB = { cepea: [], cot: [] };

  function parseCSV(txt) {
    var lines = txt.trim().split(/\r?\n/);
    var head = lines.shift().split(',');
    return lines.map(function (l) {
      var c = l.split(','), o = {};
      head.forEach(function (h, i) { o[h] = c[i]; });
      return o;
    });
  }

  function load() {
    return Promise.all([
      fetch('data/cepea_soja_paranagua.csv').then(function (r) { if (!r.ok) throw new Error('CEPEA'); return r.text(); }),
      fetch('data/cot_soja_cbot.csv').then(function (r) { if (!r.ok) throw new Error('COT'); return r.text(); })
    ]).then(function (res) {
      DB.cepea = parseCSV(res[0]).map(function (r) {
        var b = +r.preco_brl, u = +r.preco_usd;
        return { d: r.data, brl: b, usd: u, fx: b / u };
      });
      var prev = null;
      DB.cot = parseCSV(res[1]).map(function (r) {
        var o = {
          ref: r.data_referencia, pub: r.data_publicacao, oi: +r.open_interest,
          fl: +r.fundos_comprados, fs: +r.fundos_vendidos,
          cl: +r.comerciais_comprados, cs: +r.comerciais_vendidos,
          tl: +r.traders_fundos_comprados, ts: +r.traders_fundos_vendidos
        };
        o.net = o.fl - o.fs;
        o.com = o.cl - o.cs;
        o.share = o.net / o.oi;
        o.chg = prev ? o.net - prev.net : null;
        o.oiChg = prev ? o.oi - prev.oi : null;
        prev = o;
        return o;
      });
    });
  }

  // último registro com data <= s
  function lastOnOrBefore(arr, key, s) {
    var lo = 0, hi = arr.length - 1, ans = -1;
    while (lo <= hi) {
      var m = (lo + hi) >> 1;
      if (arr[m][key] <= s) { ans = m; lo = m + 1; } else hi = m - 1;
    }
    return ans;
  }

  // ---------- Análise ----------
  function analyze(dateStr) {
    var C = DB.cepea;
    var i = lastOnOrBefore(C, 'd', dateStr);
    if (i < 0) return null;
    var today = C[i];
    var Y = +today.d.slice(0, 4), md = today.d.slice(5);
    if (md === '02-29') md = '02-28';

    var years = [], W = [];
    for (var y = Y - ANOS; y <= Y - 1; y++) {
      var c = y + '-' + md, a = addDays(c, -JANELA_DIAS), b = addDays(c, JANELA_DIAS);
      var rows = C.filter(function (r) { return r.d >= a && r.d <= b; });
      if (!rows.length) continue;
      var vals = rows.map(function (r) { return r.brl; });
      var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
      years.push({ y: y, n: rows.length, min: mn, max: mx, a: a, b: b,
        res: today.brl > mx ? 'hi' : today.brl < mn ? 'lo' : 'mid' });
      W = W.concat(rows);
    }
    function pct(f) {
      if (!W.length) return null;
      var v = today[f], k = W.filter(function (r) { return r[f] < v; }).length;
      return { p: Math.round(k / W.length * 100), k: k, n: W.length,
        mean: W.reduce(function (s, r) { return s + r[f]; }, 0) / W.length };
    }
    var P = { brl: pct('brl'), usd: pct('usd'), fx: pct('fx') };

    var j = lastOnOrBefore(C, 'd', addDays(today.d, -28));
    var ago = j >= 0 ? C[j] : null;
    var d4 = ago ? {
      from: ago, brl: (today.brl / ago.brl - 1) * 100, usd: (today.usd / ago.usd - 1) * 100,
      fx: (today.fx / ago.fx - 1) * 100,
      grao: (today.usd - ago.usd) * ago.fx,
      cambio: today.usd * (today.fx - ago.fx)
    } : null;

    // COT: só o que já era público na data
    var K = DB.cot, ci = lastOnOrBefore(K, 'pub', dateStr);
    var cot = null;
    if (ci >= 0) {
      var cur = K[ci];
      var yr = cur.ref.slice(0, 4);
      var ofYear = K.slice(0, ci + 1).filter(function (r) { return r.ref.slice(0, 4) === yr; });
      var shares = ofYear.map(function (r) { return r.share; });
      var streak = 0;
      for (var q = ci; q >= 0 && K[q].chg !== null && K[q].chg < 0; q--) streak++;
      var pr = lastOnOrBefore(C, 'd', cur.ref), pp = ci > 0 ? lastOnOrBefore(C, 'd', K[ci - 1].ref) : -1;
      var pChg = pr >= 0 && pp >= 0 ? (C[pr].usd / C[pp].usd - 1) * 100 : null;
      var peak = ofYear.reduce(function (m, r) { return r.net > m.net ? r : m; }, ofYear[0]);
      cot = { cur: cur, idx: ci, ofYear: ofYear, minShare: Math.min.apply(null, shares), maxShare: Math.max.apply(null, shares),
        minRow: ofYear[shares.indexOf(Math.min.apply(null, shares))], maxRow: ofYear[shares.indexOf(Math.max.apply(null, shares))],
        streak: streak, pChg: pChg, peak: peak, age: (toT(dateStr) - toT(cur.pub)) / 864e5,
        last6: K.slice(Math.max(0, ci - 5), ci + 1).map(function (r, k, arr) {
          var a1 = lastOnOrBefore(C, 'd', r.ref);
          return { r: r, usd: a1 >= 0 ? C[a1].usd : null };
        }) };
    }

    // Sinais
    function level(p) { return p === null ? 'semdado' : p >= FAVORAVEL ? 'fav' : p >= NEUTRO ? 'neutro' : 'contra'; }
    var S = [];
    if (P.brl) S.push({ k: level(P.brl.p), t: 'Preço na época',
      d: brl(today.brl) + ' ganha de ' + P.brl.k + ' dos ' + P.brl.n + ' pregões da mesma época de ' + (Y - ANOS) + ' a ' + (Y - 1) + ' (percentil ' + P.brl.p + ').' });
    if (P.fx) S.push({ k: level(P.fx.p), t: 'Câmbio',
      d: 'Dólar a R$ ' + F2.format(today.fx) + ', no percentil ' + P.fx.p + ' da época' + (d4 ? ' e ' + pctS(d4.fx) + ' em quatro semanas.' : '.') +
        (level(P.fx.p) === 'fav' ? ' Ele está pagando parte do preço.' : '') });
    if (cot) {
      var sh = cot.cur.share, k;
      var txt;
      if (sh >= FUNDOS_ALTO && cot.cur.chg < 0) { k = 'fav'; txt = 'Fundos comprados em ' + F1.format(sh * 100) + '% do mercado e reduzindo a aposta' + (cot.streak > 1 ? ' há ' + cot.streak + ' semanas' : '') + ': risco de mais queda em Chicago.'; }
      else if (sh >= FUNDOS_ALTO) { k = 'neutro'; txt = 'Fundos comprados em ' + F1.format(sh * 100) + '% do mercado e ainda aumentando: sustentam o preço por ora, mas acumulam risco de queda.'; }
      else if (sh <= FUNDOS_VENDIDOS) { k = 'contra'; txt = 'Fundos vendidos (' + F1.format(sh * 100) + '% do mercado): uma recompra pode puxar o preço para cima.'; }
      else { k = 'neutro'; txt = 'Fundos com posição moderada (' + F1.format(sh * 100) + '% do mercado): pouco combustível para um movimento forte.'; }
      S.push({ k: k, t: 'Fundos em Chicago', d: txt });
    } else {
      S.push({ k: 'semdado', t: 'Fundos em Chicago', d: 'Ainda não há relatório COT carregado que fosse público nesta data.' });
    }
    if (P.usd) S.push({ k: level(P.usd.p), t: 'Grão em dólar',
      d: usd(today.usd) + ' no percentil ' + P.usd.p + ' da época' + (d4 ? ' e ' + pctS(d4.usd) + ' em quatro semanas.' : '.') });

    var valid = S.filter(function (s) { return s.k !== 'semdado'; });
    var score = valid.filter(function (s) { return s.k === 'fav'; }).length;
    var r = valid.length ? score / valid.length : 0;
    var verdict = r === 1 ? 'Momento muito favorável à venda' : r >= 0.66 ? 'Bom momento para vender uma parte' : r >= 0.4 ? 'Momento neutro para vender' : 'Momento desfavorável à venda';

    return { date: dateStr, today: today, Y: Y, years: years, W: W, P: P, d4: d4, cot: cot, S: S, score: score, n: valid.length, verdict: verdict };
  }

  // ---------- Pedaços de interface ----------
  var CHECK = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.5l2.5 2.5L11 4.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var DASH = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3.5 7h7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
  var CROSS = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 4l6 6M10 4l-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
  var LABEL = { fav: 'favorável', neutro: 'neutro', contra: 'desfavorável', semdado: 'sem dado' };

  function kpi(color, label, big, unit, note, noteCls) {
    return '<div class="kpi"><div class="bar" style="background:' + color + '"></div><div><div class="lbl">' + label + '</div>' +
      '<div class="big">' + big + (unit ? '<span class="unit">' + unit + '</span>' : '') + '</div>' +
      (note ? '<div class="note ' + (noteCls || '') + '">' + note + '</div>' : '') + '</div></div>';
  }
  function arrow(v) { return v > 0 ? '▲ ' : v < 0 ? '▼ ' : ''; }
  function cls(v) { return v > 0 ? 'up' : v < 0 ? 'down' : ''; }
  function card(id, title, body) { return '<section class="card" aria-labelledby="' + id + '"><h2 id="' + id + '">' + title + '</h2><div class="body">' + body + '</div></section>'; }
  function head(title, sub, A, customStamp) {
    var stamp = customStamp || '<div class="stamp"><div><small>Preço CEPEA de</small><b>' + dBR(A.today.d) + '</b></div>' +
      (A.cot ? '<div><small>Fundos (COT) de</small><b class="ok">' + dDM(A.cot.cur.ref) + ' · público ' + dDM(A.cot.cur.pub) + '</b></div>' : '<div><small>Fundos (COT)</small><b>sem dado</b></div>') + '</div>';
    return '<div class="head"><div><h1>' + title + '</h1><p class="sub">' + sub + '</p></div>' + stamp + '</div>';
  }
  function sources(extra) {
    return '<p class="sources">Fontes: CEPEA/ESALQ, Indicador da Soja Paranaguá (CC BY-NC), série diária em R$ e US$; CFTC, Commitments of Traders, Disaggregated Futures Only, soja CBOT (código 005602). ' + (extra || '') + ' Elaboração própria.</p>';
  }
  function signalsHTML(S) {
    return '<ul class="signals">' + S.map(function (s) {
      var c = s.k === 'fav' ? '' : s.k;
      var icon = s.k === 'fav' ? CHECK : s.k === 'contra' ? CROSS : DASH;
      return '<li class="signal ' + c + '"><div class="ico">' + icon + '</div><div><div class="t">' + s.t + ' · ' + LABEL[s.k] + '</div><div class="d">' + s.d + '</div></div></li>';
    }).join('') + '</ul>';
  }

  // ---------- Gráficos (SVG) ----------
  function lineChart(points, opts) {
    var W = 780, H = 250, L = 48, R = 120, T = 10, B = 28;
    var vals = points.map(function (p) { return p.v; });
    var lo = Math.floor(Math.min.apply(null, vals) / 20) * 20, hi = Math.ceil(Math.max.apply(null, vals) / 20) * 20;
    if (hi === lo) hi = lo + 20;
    var x = function (k) { return L + k / Math.max(1, points.length - 1) * (W - L - R); };
    var y = function (v) { return T + (hi - v) / (hi - lo) * (H - T - B); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + opts.aria + '">';
    for (var g = lo; g <= hi; g += 20) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="#DCE3D9"/><text x="' + (L - 8) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + g + '</text>';
    points.forEach(function (p, k) { if (p.label) s += '<text x="' + x(k) + '" y="' + (H - 6) + '">' + p.label + '</text>'; });
    s += '<polyline fill="none" stroke="#1F4D2E" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="' + points.map(function (p, k) { return x(k).toFixed(1) + ',' + y(p.v).toFixed(1); }).join(' ') + '"/>';
    var last = points[points.length - 1];
    s += '<circle cx="' + x(points.length - 1) + '" cy="' + y(last.v) + '" r="5" fill="#D32F2F"/>';
    s += '<text class="strong" x="' + (x(points.length - 1) + 10) + '" y="' + (y(last.v) + 4) + '">' + opts.lastLabel + '</text>';
    return s + '</svg>';
  }

  function histogram(W, v) {
    var vals = W.map(function (r) { return r.brl; });
    var lo = Math.floor(Math.min(Math.min.apply(null, vals), v) / 5) * 5;
    var hi = Math.floor(Math.max(Math.max.apply(null, vals), v) / 5) * 5 + 5;
    var bins = [];
    for (var b = lo; b < hi; b += 5) bins.push({ a: b, n: 0 });
    vals.forEach(function (x) { bins[Math.min(bins.length - 1, Math.floor((x - lo) / 5))].n++; });
    var todayBin = Math.min(bins.length - 1, Math.floor((v - lo) / 5));
    var max = Math.max.apply(null, bins.map(function (b) { return b.n; })) || 1;
    var Wd = 780, H = 300, T = 24, B = 26, gap = 6, bw = (Wd - gap * (bins.length - 1)) / bins.length;
    var s = '<svg viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Distribuição dos ' + vals.length + ' pregões da mesma época por faixa de preço de R$ 5; o preço de hoje está na faixa de R$ ' + bins[todayBin].a + ' a ' + (bins[todayBin].a + 5) + '">';
    bins.forEach(function (b, k) {
      var x = k * (bw + gap), h = b.n / max * (H - T - B), y = H - B - h, on = k === todayBin;
      s += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + h + '" rx="3" fill="' + (on ? '#D32F2F' : '#A9CFA0') + '"/>';
      s += '<text x="' + (x + bw / 2) + '" y="' + (y - 6) + '" text-anchor="middle"' + (on ? ' class="strong"' : '') + '>' + b.n + (on ? ' · hoje' : '') + '</text>';
      if (bins.length <= 16 || k % 2 === 0) s += '<text x="' + (x + bw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + b.a + '</text>';
    });
    return s + '</svg>';
  }

  function cotBars(A) {
    var rows = A.cot.ofYear, n = rows.length;
    var max = Math.max.apply(null, rows.map(function (r) { return Math.max(0, r.net); })) || 1;
    var min = Math.min(0, Math.min.apply(null, rows.map(function (r) { return r.net; })));
    var Wd = 780, H = 240, T = 8, B = 26, gap = 3, bw = (Wd - gap * (n - 1)) / n;
    var y = function (v) { return T + (max - v) / (max - min) * (H - T - B); };
    var peakIdx = rows.indexOf(A.cot.peak);
    var s = '<svg viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Posição líquida semanal dos fundos em ' + rows[0].ref.slice(0, 4) + ': pico de ' + F1.format(A.cot.peak.net / 1000) + ' mil contratos em ' + dDM(A.cot.peak.ref) + '; última semana ' + F1.format(rows[n - 1].net / 1000) + ' mil">';
    s += '<line x1="0" x2="' + Wd + '" y1="' + y(0) + '" y2="' + y(0) + '" stroke="#B8C4B5"/>';
    var lastMonth = -1;
    rows.forEach(function (r, k) {
      var x = k * (bw + gap), y0 = y(Math.max(0, r.net)), h = Math.abs(y(r.net) - y(0));
      var col = k === n - 1 ? '#D32F2F' : k === peakIdx ? '#1F4D2E' : k > peakIdx ? '#9CCB4F' : '#2E7D3E';
      s += '<rect x="' + x.toFixed(1) + '" y="' + y0.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, h).toFixed(1) + '" rx="2" fill="' + col + '"><title>' + dBR(r.ref) + ': ' + F0.format(r.net) + ' contratos</title></rect>';
      var mth = +r.ref.slice(5, 7) - 1;
      if (mth !== lastMonth) { s += '<text x="' + x.toFixed(1) + '" y="' + (H - 6) + '">' + MESES[mth] + '</text>'; lastMonth = mth; }
    });
    return s + '</svg>';
  }

  // ---------- Telas ----------
  function viewVisao(A) {
    var t = A.today, P = A.P, d4 = A.d4;
    var h = head('Hoje é dia de vender?', 'Soja · Indicador CEPEA/ESALQ Paranaguá · comparação com a mesma época dos últimos ' + ANOS + ' anos', A);
    h += '<div class="grid-kpi">' +
      kpi('#2E7D3E', 'Preço (R$)', brl(t.brl), '/saca', d4 ? arrow(d4.brl) + pctS(d4.brl) + ' em 4 semanas' : '', d4 ? cls(d4.brl) : '') +
      kpi('#2E86AB', 'Preço (US$)', usd(t.usd), '/saca', d4 ? arrow(d4.usd) + pctS(d4.usd) + ' em 4 semanas' : '', d4 ? cls(d4.usd) : '') +
      kpi('#F5A623', 'Posição nesta época', P.brl ? 'percentil ' + P.brl.p : '—', '', 'de 0 a 100 · em reais') +
      kpi('#E0A800', 'Média desta época', P.brl ? brl(P.brl.mean) : '—', '', P.brl ? 'hoje está ' + pctS((t.brl / P.brl.mean - 1) * 100) + (t.brl >= P.brl.mean ? ' acima' : ' abaixo') : '', P.brl ? cls(t.brl - P.brl.mean) : '') +
      '</div>';

    var expl = A.score + (A.score === 1 ? ' dos ' + A.n + ' sinais históricos favorece' : ' dos ' + A.n + ' sinais históricos favorecem') + ' vender agora.';
    if (P.brl && P.usd && P.brl.p - P.usd.p >= 10) expl += ' O preço em reais está bom para a época, mas boa parte do motivo é o dólar, não o grão.';
    else if (P.brl && P.usd && P.usd.p - P.brl.p >= 10) expl += ' Em dólares o grão está melhor que em reais: o câmbio está tirando parte do preço.';
    var termo = '<div class="verdict"><div class="score"><b>' + A.score + '/' + A.n + '</b><span>sinais</span></div><div style="flex:1 1 220px;min-width:0"><h3>' + A.verdict + '</h3><p class="muted">' + expl + '</p></div></div>' +
      signalsHTML(A.S) + '<p class="small">Leitura descritiva do histórico, não previsão. A decisão é do produtor.</p>';

    h += '<div class="grid-2">' + card('termo', 'Termômetro de venda', termo) + card('regua', 'A régua das ' + ANOS + ' colheitas', rulerHTML(A)) + '</div>';

    var orig = d4 ? '<div class="trio"><div><small>Soja em reais</small><b class="' + cls(d4.brl) + '">' + pctS(d4.brl) + '</b><span>' + brl(d4.from.brl) + ' → ' + F2.format(t.brl) + '</span></div>' +
      '<div><small>Soja em dólares</small><b class="' + cls(d4.usd) + '">' + pctS(d4.usd) + '</b><span>' + usd(d4.from.usd) + ' → ' + F2.format(t.usd) + '</span></div>' +
      '<div><small>Dólar</small><b>' + pctS(d4.fx) + '</b><span>R$ ' + F2.format(d4.from.fx) + ' → ' + F2.format(t.fx) + '</span></div></div>' +
      '<a href="' + link('cambio') + '">Ver a decomposição completa →</a>' : '<p class="muted">Sem dado de quatro semanas atrás.</p>';
    h += '<div class="grid-2">' + card('origem', 'De onde veio a variação das últimas 4 semanas', orig) + card('leituras', 'Principais leituras', readsHTML(A)) + '</div>';
    h += sources('Janela sazonal: ±' + JANELA_DIAS + ' dias em torno de ' + dDM(t.d) + ', anos de ' + (A.Y - ANOS) + ' a ' + (A.Y - 1) + '.');
    return h;
  }

  function rulerHTML(A) {
    if (!A.years.length) return '<p class="muted">Sem histórico suficiente para esta data.</p>';
    var v = A.today.brl;
    var lo = Math.floor(Math.min(v, Math.min.apply(null, A.years.map(function (y) { return y.min; }))) / 5) * 5 - 5;
    var hi = Math.ceil(Math.max(v, Math.max.apply(null, A.years.map(function (y) { return y.max; }))) / 5) * 5 + 5;
    var pos = function (x) { return (x - lo) / (hi - lo) * 100; };
    var s = '<p class="muted">Faixa de preço entre ' + dDM(A.years[0].a) + ' e ' + dDM(A.years[0].b) + ' de cada ano, em R$/saca. A linha vermelha é o preço de hoje.</p><div class="ruler">';
    A.years.forEach(function (y) {
      var res = y.res === 'hi' ? 'acima de todos' : y.res === 'lo' ? 'abaixo de todos' : 'dentro da faixa';
      s += '<div class="ruler-row"><div class="yr">' + y.y + '</div><div class="track" role="img" aria-label="' + y.y + ': de ' + brl(y.min) + ' a ' + brl(y.max) + '; hoje ' + res + '">' +
        '<div class="fill" style="left:' + pos(y.min).toFixed(1) + '%;width:' + Math.max(0.8, pos(y.max) - pos(y.min)).toFixed(1) + '%"></div>' +
        '<div class="mark" style="left:' + pos(v).toFixed(1) + '%"></div></div><div class="res ' + y.res + '">' + res + '</div></div>';
    });
    s += '<div class="axis"><span></span><div><span>R$ ' + lo + '</span><span><b>' + brl(v) + ' hoje</b></span><span>R$ ' + hi + '</span></div><span></span></div></div>';
    var above = A.years.filter(function (y) { return y.res === 'hi'; }).map(function (y) { return y.y; });
    var below = A.years.filter(function (y) { return y.res === 'lo'; }).map(function (y) { return y.y; });
    var msg = '';
    if (above.length) msg += 'Em ' + joinYears(above) + ', o preço de hoje teria superado todos os dias desta época. ';
    if (below.length) msg += 'Em ' + joinYears(below) + ', ficaria abaixo de todos.';
    if (msg) s += '<div class="callout dark">' + msg.trim() + '</div>';
    return s;
  }
  function joinYears(a) { return a.length === 1 ? String(a[0]) : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1]; }

  function readsHTML(A) {
    var items = [], t = A.today, P = A.P, d4 = A.d4;
    if (P.brl) {
      var diff = (t.brl / P.brl.mean - 1) * 100;
      var ext = Math.max.apply(null, A.years.map(function (y) { return y.max; }));
      items.push('Preço ' + F1.format(Math.abs(diff)) + '% ' + (diff >= 0 ? 'acima' : 'abaixo') + ' da média desta época (' + brl(P.brl.mean) + ')' + (t.brl < ext ? ', ainda abaixo do máximo de ' + brl(ext) + ' visto na janela.' : ', acima de todos os pregões desta época nos últimos ' + ANOS + ' anos.'));
    }
    if (d4) {
      if (d4.brl > 0 && d4.usd < 0) items.push('A alta de ' + pctS(d4.brl) + ' em reais veio do dólar; em dólares, o grão caiu ' + F1.format(-d4.usd) + '%.');
      else if (d4.brl < 0 && d4.usd > 0) items.push('O grão subiu ' + pctS(d4.usd) + ' em dólares, mas a queda do dólar levou o preço em reais a ' + pctS(d4.brl) + '.');
      else items.push('Em quatro semanas: ' + pctS(d4.brl) + ' em reais e ' + pctS(d4.usd) + ' em dólares; o câmbio variou ' + pctS(d4.fx) + '.');
    }
    if (A.cot) {
      var c = A.cot.cur;
      items.push('Fundos ' + (c.net >= 0 ? 'comprados' : 'vendidos') + ' em ' + F1.format(Math.abs(c.share) * 100) + '% do mercado e ' + (c.chg < 0 ? 'reduzindo' : 'aumentando') + ' a posição na última semana (' + sinal(c.chg, F0) + ' contratos).');
    }
    return '<ul class="reads">' + items.map(function (x) { return '<li><div class="ico">' + CHECK + '</div><span>' + x + '</span></li>'; }).join('') + '</ul>';
  }

  function viewPreco(A) {
    var t = A.today, P = A.P;
    var h = head('Preço na época', 'O preço de hoje comparado com os mesmos dias do ano nos últimos ' + ANOS + ' anos, em Paranaguá', A);
    if (!P.brl) return h + '<p class="muted">Sem histórico suficiente para esta data.</p>';
    h += '<div class="grid-kpi">' +
      kpi('#2E7D3E', 'Percentil em reais', String(P.brl.p), '', 'ganha de ' + P.brl.k + ' de ' + P.brl.n + ' pregões') +
      kpi('#2E86AB', 'Percentil em dólares', String(P.usd.p), '', 'ganha de ' + P.usd.k + ' de ' + P.usd.n + ' pregões') +
      kpi('#F5A623', 'Pregões na amostra', String(P.brl.n), '', dDM(A.years[0].a) + ' a ' + dDM(A.years[0].b) + ' · ' + (A.Y - ANOS) + ' a ' + (A.Y - 1)) +
      kpi('#E0A800', 'Média desta época', brl(P.brl.mean), '', 'hoje: ' + brl(t.brl) + ' (' + pctS((t.brl / P.brl.mean - 1) * 100) + ')', cls(t.brl - P.brl.mean)) +
      '</div>';
    var dist = '<p class="muted">Quantos pregões caíram em cada faixa de preço (R$/saca). A barra vermelha é a faixa de hoje.</p><div class="chart">' + histogram(A.W, t.brl) + '</div>';
    var bars = function (label, p, color) { return '<div class="pbar"><div class="row"><b>' + label + '</b><span>percentil ' + p + '</span></div><div class="tr"><i style="width:' + p + '%;background:' + color + '"></i></div></div>'; };
    var gap = P.brl.p - P.usd.p;
    var moedas = bars('Soja em reais', P.brl.p, '#2E7D3E') + bars('Soja em dólares', P.usd.p, '#2E86AB') + bars('Dólar', P.fx.p, '#E0A800') +
      '<p class="muted">' + (gap >= 10 ? 'Em dólares, a soja está mais perto da média da época. A vantagem em reais vem do dólar mais alto. Se o dólar voltar, a vantagem some.' : gap <= -10 ? 'Em dólares, o grão está melhor que em reais: o câmbio está tirando parte do preço.' : 'Em reais e em dólares, o preço está em posições parecidas: o câmbio não muda muito a leitura.') + '</p>' +
      '<a href="' + link('cambio') + '">Ver o efeito do câmbio →</a>';
    h += '<div class="grid-2">' + card('dist', 'Como os ' + P.brl.n + ' pregões desta época se distribuem', dist) + card('moedas', 'Em reais ou em dólares?', moedas) + '</div>';

    // série mensal desde jan de Y-5
    var start = (A.Y - ANOS) + '-01-01', months = {}, order = [];
    DB.cepea.forEach(function (r) {
      if (r.d < start || r.d > t.d) return;
      var m = r.d.slice(0, 7);
      if (!months[m]) { months[m] = { s: 0, n: 0 }; order.push(m); }
      months[m].s += r.brl; months[m].n++;
    });
    var pts = order.map(function (m) { return { v: months[m].s / months[m].n, label: m.slice(5) === '01' ? m.slice(0, 4) : '' }; });
    var lastM = order[order.length - 1];
    h += card('serie', 'Preço da soja em Paranaguá · média mensal, ' + (A.Y - ANOS) + ' a ' + A.Y + ' (R$/saca)',
      '<div class="chart">' + lineChart(pts, { aria: 'Média mensal do preço em reais de ' + start.slice(0, 4) + ' até ' + lastM, lastLabel: MESES[+lastM.slice(5) - 1] + '/' + lastM.slice(2, 4) + ': ' + brl(pts[pts.length - 1].v) }) + '</div>');
    h += card('como', 'Como o percentil é calculado', '<div class="grid-3">' +
      '<div><b>1. Pegue o preço de hoje.</b><br>' + brl(t.brl) + ' em ' + dBR(t.d) + '.</div>' +
      '<div><b>2. Separe a mesma época.</b><br>' + JANELA_DIAS + ' dias antes e ' + JANELA_DIAS + ' depois de ' + dDM(t.d) + ', de ' + (A.Y - ANOS) + ' a ' + (A.Y - 1) + ': ' + P.brl.n + ' pregões.</div>' +
      '<div><b>3. Conte de quantos hoje ganha.</b><br>' + P.brl.k + ' de ' + P.brl.n + ': percentil ' + P.brl.p + '. Estatística descritiva, sem previsão.</div></div>');
    return h + sources();
  }

  function viewFundos(A) {
    var h = head('Fundos em Chicago', 'Quanto os fundos estão apostando na alta da soja na Bolsa de Chicago, pelo relatório COT da CFTC', A);
    if (!A.cot) return h + '<div class="callout warn"><b>Sem relatório COT para esta data.</b> Os dados carregados começam em ' + dBR(DB.cot[0].ref) + ' (público em ' + dBR(DB.cot[0].pub) + '). Para analisar datas anteriores, carregue os arquivos de outros anos com scripts/atualizar_dados.py.</div>' + sources();
    var c = A.cot.cur;
    var lag = (toT(c.pub) - toT(c.ref)) / 864e5;
    h = head('Fundos em Chicago', 'Quanto os fundos estão apostando na alta da soja na Bolsa de Chicago, pelo relatório COT da CFTC', A,
      '<div class="stamp"><div><small>Posições de</small><b>' + weekday(c.ref) + ', ' + dBR(c.ref) + '</b></div><div><small>Ficou público em</small><b class="ok">' + weekday(c.pub) + ', ' + dDM(c.pub) + ' · ' + lag + ' dias depois</b></div></div>');
    h += '<div class="grid-kpi">' +
      kpi('#2E7D3E', 'Posição líquida dos fundos', F0.format(c.net), '', 'contratos ' + (c.net >= 0 ? 'comprados' : 'vendidos') + ' a mais') +
      kpi(c.chg < 0 ? '#D32F2F' : '#2E7D3E', 'Na semana', c.chg === null ? '—' : sinal(c.chg, F0), '', A.cot.streak > 1 ? A.cot.streak + 'ª semana seguida de redução' : c.chg < 0 ? 'redução da aposta' : 'aumento da aposta', c.chg < 0 ? 'down' : 'up') +
      kpi('#F5A623', 'Fatia do mercado', F1.format(c.share * 100) + '%', '', 'faixa de ' + c.ref.slice(0, 4) + ': ' + F1.format(A.cot.minShare * 100) + '% a ' + F1.format(A.cot.maxShare * 100) + '%') +
      kpi('#2E86AB', 'Em toneladas', F1.format(c.net * TON_POR_CONTRATO / 1e6) + ' mi t', '', '1 contrato ≈ ' + F0.format(TON_POR_CONTRATO) + ' t de soja') +
      '</div>';
    h += card('serie', 'Posição líquida dos fundos na soja de Chicago, semana a semana em ' + c.ref.slice(0, 4),
      '<p class="muted">Mil contratos (comprados − vendidos). <b>Pico: ' + F1.format(A.cot.peak.net / 1000) + ' mil em ' + dDM(A.cot.peak.ref) + '</b> · última: ' + F1.format(c.net / 1000) + ' mil.</p>' +
      '<div class="chart">' + cotBars(A) + '</div>' +
      '<div class="legend"><span><i style="background:#2E7D3E"></i>semanas até o pico</span><span><i style="background:#1F4D2E"></i>pico do ano</span><span><i style="background:#9CCB4F"></i>depois do pico</span><span><i style="background:#D32F2F"></i>última semana disponível</span></div>');

    var span = A.cot.maxShare - A.cot.minShare || 1, at = (c.share - A.cot.minShare) / span * 100;
    var faixa = '<div class="pbar"><div class="tr" style="height:18px;overflow:visible"><i style="width:' + at.toFixed(1) + '%;background:#F5A623"></i><i style="left:' + at.toFixed(1) + '%;width:4px;margin-left:-2px;top:-6px;bottom:-6px;background:#1A1A1A;border-radius:2px"></i></div>' +
      '<div class="row small"><span>' + F1.format(A.cot.minShare * 100) + '% (' + dDM(A.cot.minRow.ref) + ')</span><span><b style="color:#1A1A1A">' + F1.format(c.share * 100) + '% agora</b></span><span>' + F1.format(A.cot.maxShare * 100) + '% (' + dDM(A.cot.maxRow.ref) + ')</span></div></div>' +
      '<p class="muted">Quanto mais perto do topo, mais apostas na alta já foram feitas e mais vendas podem vir quando os fundos saírem. É combustível para uma queda.</p>' +
      '<p class="small">Com o histórico de outros anos carregado, esta régua pode virar percentil da época, como no preço.</p>';
    var q = '';
    if (A.cot.pChg !== null && c.oiChg !== null) {
      var up = A.cot.pChg >= 0, oiUp = c.oiChg >= 0;
      var cells = [
        [true, true, 'Preço ↑ · contratos ↑', 'Dinheiro novo comprando'],
        [true, false, 'Preço ↑ · contratos ↓', 'Vendidos recomprando para sair'],
        [false, true, 'Preço ↓ · contratos ↑', 'Vendas novas entrando'],
        [false, false, 'Preço ↓ · contratos ↓', 'Comprados vendendo para sair']
      ];
      q = '<div class="quad">' + cells.map(function (x) { var on = x[0] === up && x[1] === oiUp; return '<div class="' + (on ? 'on' : '') + '"><b>' + x[2] + (on ? ' · esta semana' : '') + '</b>' + x[3] + '</div>'; }).join('') + '</div>' +
        '<p class="muted">Na semana de ' + dDM(c.ref) + ', o preço em dólar variou ' + pctS(A.cot.pChg) + ', os contratos em aberto variaram ' + sinal(c.oiChg, F0) + ' e os fundos, ' + sinal(c.chg, F0) + ' contratos.</p>';
    } else q = '<p class="muted">É preciso ao menos duas semanas de dados.</p>';
    h += '<div class="grid-2">' + card('faixa', 'Onde os fundos estão na faixa de ' + c.ref.slice(0, 4), faixa) + card('quad', 'Leitura da semana: quem está movendo o preço', q) + '</div>';

    var rows = A.cot.last6.map(function (x, k, arr) {
      var r = x.r;
      return '<tr class="' + (k === arr.length - 1 ? 'last' : '') + '"><td>' + dDM(r.ref) + '</td><td>' + dDM(r.pub) + '</td><td>' + F0.format(r.net) + '</td><td class="' + cls(r.chg) + '">' + (r.chg === null ? '—' : sinal(r.chg, F0)) + '</td><td>' + F1.format(r.share * 100) + '%</td><td>' + F0.format(r.oi) + '</td><td>' + F0.format(r.com) + '</td><td>' + (x.usd ? F2.format(x.usd) : '—') + '</td></tr>';
    }).join('');
    h += card('tab', 'Últimos relatórios públicos até ' + dBR(A.date), '<div class="tablewrap"><table><thead><tr><th scope="col">Posições de</th><th scope="col">Público em</th><th scope="col">Fundos (líquido)</th><th scope="col">Na semana</th><th scope="col">Fatia do mercado</th><th scope="col">Contratos em aberto</th><th scope="col">Comerciais (líquido)</th><th scope="col">Preço US$/saca</th></tr></thead><tbody>' + rows + '</tbody></table></div>');
    h += '<div class="callout warn"><b>Por que este quadro não prevê o preço:</b> o relatório sai dias depois da posição. Quando você o lê, o movimento já está no preço. Em 2026, a variação dos fundos numa semana teve correlação de só 0,13 com o preço da semana seguinte. Ele serve para medir o risco, não para adivinhar o próximo passo.</div>';
    if (A.cot.age > 10) h += '<div class="callout warn"><b>Relatório antigo:</b> o último COT carregado ficou público ' + Math.round(A.cot.age) + ' dias antes desta data. Atualize os dados.</div>';
    return h + sources('Categoria Managed Money; datas de publicação pelo calendário oficial da CFTC.');
  }

  function viewCambio(A) {
    var t = A.today, P = A.P, d4 = A.d4;
    var h = head('Câmbio: grão × moeda', 'O mesmo dia medido de três maneiras: o que é preço da soja e o que é efeito do dólar', A);
    if (!P.brl) return h + '<p class="muted">Sem histórico suficiente para esta data.</p>';
    var tri = function (title, v, p, color, note) { return '<div class="kpi" style="flex-direction:column;text-align:center;gap:6px"><div class="lbl" style="font-weight:700">' + title + '</div><div class="big" style="font-size:34px">' + v + '</div><div style="font-size:22px;font-weight:900;color:' + color + '">percentil ' + p + '</div><div class="note">' + note + '</div></div>'; };
    var rel = function (p) { return p >= FAVORAVEL ? 'acima da média da época' : p >= NEUTRO ? 'na média da época' : 'abaixo da média da época'; };
    h += '<div class="grid-3">' + tri('Soja em reais', brl(t.brl), P.brl.p, '#1E6B2F', rel(P.brl.p)) + tri('Soja em dólares', usd(t.usd), P.usd.p, '#1F5F7A', rel(P.usd.p)) + tri('Dólar do dia', 'R$ ' + F2.format(t.fx), P.fx.p, '#8A5A00', rel(P.fx.p)) + '</div>';
    var gap = P.brl.p - P.usd.p;
    h += '<div class="callout dark">' + (gap >= 10 ? 'Em dólares, a soja está ' + rel(P.usd.p) + '. Em reais, está ' + rel(P.brl.p) + '. A diferença é o câmbio.' : gap <= -10 ? 'Em dólares, o grão está melhor do que em reais: o câmbio está tirando preço do produtor.' : 'Em reais e em dólares, a soja está em posições parecidas para a época: o câmbio não muda a leitura.') + '</div>';

    var ponte = '<p class="muted">Sem dado de quatro semanas atrás.</p>';
    if (d4) {
      var a = d4.from.brl, g = d4.grao, f = d4.cambio, e = t.brl;
      var pts = [a, a + g, e, 0];
      var hi = Math.max(a, a + g, e) * 1.02, lo = Math.min(a, a + g, e) * 0.85;
      var pos = function (x) { return (x - lo) / (hi - lo) * 100; };
      var seg = function (x1, x2, col) { var l = pos(Math.min(x1, x2)), w = Math.max(0.6, Math.abs(pos(x2) - pos(x1))); return '<i style="left:' + l.toFixed(1) + '%;width:' + w.toFixed(1) + '%;background:' + col + '"></i>'; };
      ponte = '<p class="muted">Variação de ' + sinal(e - a, F2).replace('+', '+R$ ').replace(MINUS, MINUS + 'R$ ') + ' por saca desde ' + dBR(d4.from.d) + ', separada em efeito do grão e efeito do dólar.</p>' +
        '<div class="wf" role="img" aria-label="' + brl(a) + ' em ' + dBR(d4.from.d) + '; grão em dólar ' + sinal(g, F2) + '; dólar ' + sinal(f, F2) + '; ' + brl(e) + ' hoje">' +
        '<div class="r"><span>Preço em ' + dDM(d4.from.d) + '</span><div class="tr">' + seg(lo, a, '#A9CFA0') + '</div><span class="v">' + brl(a) + '</span></div>' +
        '<div class="r"><span>Grão em dólar (' + pctS(d4.usd) + ')</span><div class="tr">' + seg(a, a + g, g < 0 ? '#D32F2F' : '#2E7D3E') + '</div><span class="v ' + cls(g) + '">' + sinal(g, F2) + '</span></div>' +
        '<div class="r"><span>Dólar (' + pctS(d4.fx) + ')</span><div class="tr">' + seg(a + g, e, '#E0A800') + '</div><span class="v" style="color:#8A5A00">' + sinal(f, F2) + '</span></div>' +
        '<div class="r"><b>Preço hoje</b><div class="tr">' + seg(lo, e, '#2E7D3E') + '</div><span class="v">' + brl(e) + '</span></div></div>' +
        '<p class="small">Grão: variação do preço em US$ convertida pelo dólar de ' + dDM(d4.from.d) + ' (R$ ' + F2.format(d4.from.fx) + '). Dólar: variação do câmbio aplicada ao preço em US$ de hoje. As duas partes somam a variação total.</p>';
    }
    var i = lastOnOrBefore(DB.cepea, 'd', t.d), last = DB.cepea.slice(Math.max(0, i - 9), i + 1);
    var jump = -1, jv = 0;
    for (var k = 1; k < last.length; k++) { var dj = Math.abs(last[k].fx / last[k - 1].fx - 1); if (dj > jv) { jv = dj; jump = k; } }
    var rows = last.map(function (r, k) { return '<tr class="' + (k === last.length - 1 ? 'last ' : '') + (k === jump && jv > 0.03 ? 'hl' : '') + '"><td>' + dDM(r.d) + '</td><td>' + F2.format(r.brl) + '</td><td>' + F2.format(r.usd) + '</td><td>' + F3.format(r.fx) + '</td></tr>'; }).join('');
    var note = jump > 0 && jv > 0.03 ? '<p class="small">Em ' + dDM(last[jump].d) + ', o dólar implícito ' + (last[jump].fx > last[jump - 1].fx ? 'saltou' : 'caiu') + ' de ' + F2.format(last[jump - 1].fx) + ' para ' + F2.format(last[jump].fx) + ' num só pregão: a soja variou ' + pctS((last[jump].usd / last[jump - 1].usd - 1) * 100) + ' em dólar e ' + pctS((last[jump].brl / last[jump - 1].brl - 1) * 100) + ' em reais.</p>' : '';
    h += '<div class="grid-2">' + card('ponte', d4 ? 'De ' + dDM(d4.from.d) + ' até hoje: o que mudou' : 'O que mudou', ponte) +
      card('dias', 'Últimos dez pregões', '<div class="tablewrap"><table><thead><tr><th scope="col">Data</th><th scope="col">R$/saca</th><th scope="col">US$/saca</th><th scope="col">Dólar implícito</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + note) + '</div>';
    h += '<div class="grid-2"><div class="callout warn"><b>O risco de esperar.</b> Quem olha só o preço em reais pode concluir que o mercado melhorou quando, em Chicago, o grão caiu. Se o dólar devolver a alta, o preço em reais devolve junto.</div>' +
      '<div class="callout pos"><b>O que acompanhar.</b> A PTAX do Banco Central, o preço em Chicago e a posição dos fundos. Os três juntos dizem se a alta em reais tem base no grão ou só no câmbio.</div></div>';
    return h + sources('Dólar implícito = preço em R$ ÷ preço em US$.');
  }

  // ----- Avaliar oferta -----
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('agromarket.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('agromarket.' + k, JSON.stringify(v)); } catch (e) { /* sem armazenamento: segue sem salvar */ } }
  };
  function parseNum(s) { var v = parseFloat(String(s).replace(/\./g, '').replace(',', '.')); return isNaN(v) ? null : v; }

  function viewOferta(A) {
    var h = head('Avaliar oferta', 'Compare uma oferta recebida com o seu custo e com o preço de Paranaguá do dia', A);
    var custo = store.get('custo', '');
    var form = '<div class="form">' +
      '<span class="cap" id="tipoLbl">O que aconteceu</span><div class="seg" role="group" aria-labelledby="tipoLbl"><button type="button" data-tipo="fechei" aria-pressed="false">Fechei negócio</button><button type="button" data-tipo="recebi" aria-pressed="true">Só recebi a oferta</button></div>' +
      '<label class="cap" for="oferta">Preço oferecido (R$/saca)</label><input id="oferta" class="inp" inputmode="decimal" placeholder="ex.: 152,00" autocomplete="off">' +
      '<label class="cap" for="praca">Praça</label><input id="praca" class="inp" style="font-size:17px" placeholder="ex.: Carazinho (RS)" value="' + escapeAttr(store.get('praca', '')) + '">' +
      '<label class="cap" for="custo">Seu custo (R$/saca)</label><input id="custo" class="inp" inputmode="decimal" placeholder="seu custo de produção" value="' + escapeAttr(custo) + '">' +
      '<p class="small">O custo e as ofertas ficam salvos só neste navegador.</p></div>';
    var res = '<div class="kv"><span>Margem sobre o custo</span><b id="rMargem">—</b></div>' +
      '<div class="kv"><span>Diferença para Paranaguá (' + dDM(A.today.d) + ')</span><b id="rBase" style="font-size:17px">—</b></div>' +
      '<div class="kv"><span>Oferta no percentil da época, se fosse em Paranaguá</span><b id="rPct" style="font-size:17px">—</b></div>' +
      '<p class="small">Paranaguá: ' + brl(A.today.brl) + ' (CEPEA/ESALQ). A diferença para a sua praça é, em geral, frete e custo de levar ao porto.</p>' +
      '<a href="' + link('visao') + '" class="callout pos" style="text-decoration:none;color:inherit;display:block"><b style="color:#1F4D2E">Termômetro: ' + A.verdict.toLowerCase() + ' (' + A.score + '/' + A.n + ' sinais)</b><br><span class="small">Ver detalhes →</span></a>' +
      '<button type="button" id="registrar" class="btn-primary">Registrar esta oferta</button><div id="ok" role="status" class="small"></div>';
    h += '<div class="grid-2">' + card('dados', 'Sua oferta', form) + card('resultado', 'Resultado', res) + '</div>';
    h += card('hist', 'Minhas ofertas registradas (neste navegador)', '<div id="lista"></div><p class="small">Para formar o mapa de preços da praça com ofertas de vários produtores, o app precisa de um servidor com banco de dados. Esta versão no GitHub Pages guarda as ofertas apenas no seu navegador.</p>');
    return h + sources();
  }
  function escapeAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function escapeHTML(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function bindOferta(A) {
    var tipo = 'recebi';
    var $ = function (id) { return document.getElementById(id); };
    function calc() {
      var o = parseNum($('oferta').value), c = parseNum($('custo').value);
      if (o !== null && c !== null && c > 0) { var m = o - c; $('rMargem').textContent = sinal(m, F2).replace(/^([+−]?)/, '$1R$ ') + ' (' + F0.format(m / c * 100) + '%)'; $('rMargem').className = m >= 0 ? 'up' : 'down'; }
      else { $('rMargem').textContent = '—'; $('rMargem').className = ''; }
      if (o !== null) {
        $('rBase').textContent = sinal(o - A.today.brl, F2).replace(/^([+−]?)/, '$1R$ ');
        if (A.W.length) { var k = A.W.filter(function (r) { return r.brl < o; }).length; $('rPct').textContent = 'percentil ' + Math.round(k / A.W.length * 100); }
      } else { $('rBase').textContent = '—'; $('rPct').textContent = '—'; }
    }
    function lista() {
      var L = store.get('ofertas', []);
      $('lista').innerHTML = L.length ? '<div class="tablewrap"><table><thead><tr><th scope="col">Data</th><th scope="col">Praça</th><th scope="col">Situação</th><th scope="col">Oferta R$/saca</th><th scope="col">Paranaguá no dia</th></tr></thead><tbody>' +
        L.slice().reverse().map(function (x) { return '<tr><td>' + dBR(x.d) + '</td><td>' + escapeHTML(x.praca || '—') + '</td><td>' + (x.tipo === 'fechei' ? 'negócio fechado' : 'oferta recebida') + '</td><td>' + F2.format(x.o) + '</td><td>' + F2.format(x.ref) + '</td></tr>'; }).join('') + '</tbody></table></div>'
        : '<p class="muted">Nenhuma oferta registrada ainda.</p>';
    }
    Array.prototype.forEach.call(document.querySelectorAll('.seg button'), function (b) {
      b.addEventListener('click', function () {
        tipo = b.getAttribute('data-tipo');
        Array.prototype.forEach.call(document.querySelectorAll('.seg button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    });
    $('oferta').addEventListener('input', calc);
    $('custo').addEventListener('input', function () { store.set('custo', $('custo').value); calc(); });
    $('praca').addEventListener('input', function () { store.set('praca', $('praca').value); });
    $('registrar').addEventListener('click', function () {
      var o = parseNum($('oferta').value);
      if (o === null || o <= 0) { $('ok').textContent = 'Digite o preço oferecido antes de registrar.'; $('oferta').focus(); return; }
      var L = store.get('ofertas', []);
      L.push({ d: A.today.d, o: o, tipo: tipo, praca: $('praca').value.trim().slice(0, 60), ref: A.today.brl });
      store.set('ofertas', L);
      $('ok').textContent = 'Oferta registrada neste navegador.';
      lista();
    });
    calc(); lista();
  }

  function viewMetodo(A) {
    var h = '<div class="head"><div><h1>Como calculamos</h1><p class="sub">Fontes, regras e limites de cada número do app</p></div></div>';
    h += card('m1', 'Fontes de dados', '<div class="method"><ul>' +
      '<li><b>Preço:</b> Indicador da Soja CEPEA/ESALQ – Paranaguá, diário, em R$ e US$ por saca de 60 kg. Licença CC BY-NC (atribuição obrigatória, uso não comercial). <a href="https://www.cepea.org.br/br/indicador/soja.aspx" rel="noopener">cepea.org.br</a></li>' +
      '<li><b>Fundos:</b> CFTC, Commitments of Traders, relatório Disaggregated Futures Only, soja na CBOT (código 005602), categoria Managed Money. Dado público do governo dos EUA. <a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/HistoricalCompressed/index.htm" rel="noopener">cftc.gov</a></li>' +
      '<li><b>Dados carregados:</b> CEPEA de ' + dBR(DB.cepea[0].d) + ' a ' + dBR(DB.cepea[DB.cepea.length - 1].d) + ' (' + F0.format(DB.cepea.length) + ' pregões); COT de ' + dBR(DB.cot[0].ref) + ' a ' + dBR(DB.cot[DB.cot.length - 1].ref) + ' (' + DB.cot.length + ' relatórios).</li></ul></div>');
    h += card('m2', 'Percentil da época', '<div class="method"><ol>' +
      '<li>Pega o preço do dia escolhido (ou do último pregão antes dele).</li>' +
      '<li>Separa os pregões de ' + JANELA_DIAS + ' dias antes a ' + JANELA_DIAS + ' dias depois da mesma data, em cada um dos ' + ANOS + ' anos anteriores.</li>' +
      '<li>Conta quantos desses pregões tiveram preço <i>menor</i> que o de hoje e divide pelo total: <code>percentil = menores ÷ total × 100</code>.</li>' +
      '<li>O mesmo vale para o preço em dólar e para o dólar implícito (<code>preço em R$ ÷ preço em US$</code>).</li></ol></div>');
    h += card('m3', 'Termômetro de venda', '<div class="method"><p>Quatro sinais, cada um favorável, neutro ou desfavorável à venda no dia:</p><ul>' +
      '<li><b>Preço na época (R$), câmbio e grão em dólar:</b> favorável com percentil ≥ ' + FAVORAVEL + '; neutro de ' + NEUTRO + ' a ' + (FAVORAVEL - 1) + '; desfavorável abaixo de ' + NEUTRO + '.</li>' +
      '<li><b>Fundos em Chicago:</b> favorável a vender cedo quando a posição líquida passa de ' + F0.format(FUNDOS_ALTO * 100) + '% do mercado e caiu na última semana (risco de liquidação); neutro quando está alta e ainda subindo, ou moderada; desfavorável quando os fundos estão vendidos (abaixo de ' + MINUS + F0.format(-FUNDOS_VENDIDOS * 100) + '%), porque uma recompra pode puxar o preço para cima.</li>' +
      '<li><b>Placar:</b> sinais favoráveis ÷ sinais disponíveis. 100%: muito favorável; a partir de 66%: bom momento para vender uma parte; a partir de 40%: neutro; abaixo: desfavorável.</li></ul>' +
      '<p class="small">Esta é uma regra didática do grupo, descritiva do histórico. Não é previsão nem recomendação de investimento.</p></div>');
    h += card('m4', 'Sem olhar o futuro', '<div class="method"><p>Ao escolher uma data no topo da tela, o app só usa o que já era público naquele dia. O relatório COT de uma terça só entra a partir da data de publicação (normalmente a sexta seguinte, ou a segunda depois de feriado nos EUA). Usar o número na data de referência seria <i>look-ahead bias</i>: em 2026, a correlação entre a variação dos fundos e a do preço é de 0,61 na mesma semana, mas cai para 0,13 para quem lê o relatório depois de publicado.</p></div>');
    h += card('m5', 'Separação entre grão e câmbio', '<div class="method"><ul>' +
      '<li><code>efeito do grão = (US$ hoje − US$ antes) × dólar antes</code></li>' +
      '<li><code>efeito do câmbio = US$ hoje × (dólar hoje − dólar antes)</code></li>' +
      '<li>A soma dos dois é exatamente a variação do preço em reais.</li></ul></div>');
    return h + sources();
  }

  // ---------- Roteamento ----------
  var VIEWS = { visao: viewVisao, preco: viewPreco, fundos: viewFundos, cambio: viewCambio, oferta: viewOferta, metodo: viewMetodo };
  var TITLES = { visao: 'Hoje é dia de vender?', preco: 'Preço na época', fundos: 'Fundos em Chicago', cambio: 'Câmbio', oferta: 'Avaliar oferta', metodo: 'Como calculamos' };
  var current = { route: 'visao', date: null };

  function maxDate() { return DB.cepea[DB.cepea.length - 1].d; }
  function link(route) { return '#/' + route + (current.date && current.date !== maxDate() ? '?d=' + current.date : ''); }

  function parseHash() {
    var m = location.hash.match(/^#\/(\w+)(?:\?d=(\d{4}-\d{2}-\d{2}))?/);
    var route = m && VIEWS[m[1]] ? m[1] : 'visao';
    var d = m && m[2] ? m[2] : maxDate();
    if (d > maxDate()) d = maxDate();
    if (d < DB.cepea[0].d) d = DB.cepea[0].d;
    return { route: route, date: d };
  }

  function render() {
    current = parseHash();
    var A = analyze(current.date);
    var view = document.getElementById('view');
    try {
      view.innerHTML = '<div class="view">' + VIEWS[current.route](A) + '</div>';
      if (current.route === 'oferta') bindOferta(A);
    } catch (e) {
      view.innerHTML = '<p class="error">Não foi possível montar esta tela. ' + escapeHTML(e.message) + '</p>';
      if (window.console) console.error(e);
    }
    document.title = TITLES[current.route] + ' · AgroMarket';
    Array.prototype.forEach.call(document.querySelectorAll('.nav'), function (a) {
      var r = a.getAttribute('data-route');
      a.setAttribute('href', link(r));
      a.classList.toggle('on', r === current.route);
      if (r === current.route) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.getElementById('dataAnalise').value = current.date;
  }

  function init() {
    var input = document.getElementById('dataAnalise');
    load().then(function () {
      input.min = addDays(DB.cepea[0].d, 366 * ANOS);
      input.max = maxDate();
      input.addEventListener('change', function () {
        if (!input.value) return;
        current.date = input.value < input.min ? input.min : input.value;
        location.hash = link(current.route);
      });
      document.getElementById('hoje').addEventListener('click', function () { current.date = maxDate(); location.hash = '#/' + current.route; });
      window.addEventListener('hashchange', function () { render(); document.getElementById('main').focus({ preventScroll: true }); window.scrollTo(0, 0); });
      render();
    }).catch(function (e) {
      document.getElementById('view').innerHTML = '<p class="error">Não foi possível carregar os dados (' + escapeHTML(e.message) + '). Se você abriu o arquivo direto do computador, rode um servidor local: <code>python -m http.server</code>.</p>';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
