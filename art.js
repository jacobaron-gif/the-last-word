/* The Last Word — scene art. Everything is drawn in code on a 320x240
 * logical canvas (scaled to the device), night palette, moonlit from the left. */
(function (root) {
  'use strict';
  var W = 320, H = 240;

  var GLYPH_COL = { R: '#ff5a4a', A: '#ffb53a', G: '#5ed27b', B: '#4f9dff', W: '#f6f3ea', V: '#b97dff' };
  var P = {
    sky0: '#060914', sky1: '#0e1630', sky2: '#1d2b4e',
    sea0: '#142644', sea1: '#0b1629', seaHi: '#3d6aa3',
    land1: '#0a0f1a', land2: '#111827', land3: '#19223a',
    rock: '#1a202e', rockHi: '#2d3548', rockDk: '#0d1018',
    heather: '#1b1522', heather2: '#251c2e', grass: '#121b1d', grass2: '#1b2827',
    shingle: '#2b2d35', sand: '#232733', wet: '#1a2032',
    wood: '#3d2c21', woodHi: '#5c4433', woodDk: '#1f160f',
    stone: '#4b5164', stoneHi: '#737a90', stoneDk: '#2a2f3e',
    tower: '#d6d9e2', towerSh: '#9097a8', moon: '#f4ecd6',
    amber: '#f2b544', warm: '#ffd38a', brass: '#a87b32', brassHi: '#e8c26e', brassDk: '#5a3f17'
  };

  /* ---------------------------------------------------------- helpers */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function poly(c, pts, fill) {
    c.beginPath(); c.moveTo(pts[0], pts[1]);
    for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath(); c.fillStyle = fill; c.fill();
  }
  function rect(c, x, y, w, h, fill) { c.fillStyle = fill; c.fillRect(x, y, w, h); }
  function circ(c, x, y, r, fill) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); }
  function ell(c, x, y, rx, ry, fill, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); }
  function line(c, x1, y1, x2, y2, col, w) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = w || 1; c.stroke(); }
  function glow(c, x, y, r, col, a) {
    var g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexA(col, a)); g.addColorStop(1, hexA(col, 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function vgrad(c, x, y, w, h, stops) {
    var g = c.createLinearGradient(0, y, 0, y + h);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    c.fillStyle = g; c.fillRect(x, y, w, h);
  }
  function sky(c, h, stops) {
    vgrad(c, 0, 0, W, h, stops || [[0, P.sky0], [0.6, P.sky1], [1, P.sky2]]);
  }
  function stars(c, t, seed, n, yMax) {
    var r = rng(seed);
    for (var i = 0; i < n; i++) {
      var x = r() * W, y = r() * yMax, s = r(), ph = r() * 6.28;
      var a = 0.35 + 0.5 * s + 0.25 * Math.sin(t * (0.6 + s) + ph);
      c.fillStyle = 'rgba(225,232,255,' + Math.max(0, Math.min(1, a * (1 - y / (yMax * 1.25)))) + ')';
      var sz = s > 0.93 ? 1.4 : s > 0.7 ? 0.9 : 0.6;
      c.fillRect(x, y, sz, sz);
    }
  }
  function moon(c, x, y, r) {
    glow(c, x, y, r * 5, '#bfcfff', 0.16);
    glow(c, x, y, r * 2, '#fff6dc', 0.25);
    circ(c, x, y, r, P.moon);
    circ(c, x + r * 0.35, y - r * 0.2, r * 0.22, 'rgba(180,170,150,0.35)');
    circ(c, x - r * 0.3, y + r * 0.35, r * 0.15, 'rgba(180,170,150,0.3)');
  }
  function sea(c, y0, y1, t, seed, moonX) {
    vgrad(c, 0, y0, W, y1 - y0, [[0, '#1c3256'], [0.25, P.sea0], [1, P.sea1]]);
    var r = rng(seed || 7);
    for (var i = 0; i < 70; i++) {
      var yy = y0 + Math.pow(r(), 1.6) * (y1 - y0);
      var depth = (yy - y0) / (y1 - y0 + 1);
      var len = 3 + depth * 16 * r();
      var x = (r() * W + t * (2 + depth * 5) * (r() > 0.5 ? 1 : -1)) % (W + 20) - 10;
      if (x < -10) x += W + 20;
      c.fillStyle = 'rgba(120,160,220,' + (0.08 + 0.18 * r()) + ')';
      c.fillRect(x, yy, len, 0.7);
    }
    if (moonX != null) { // moon path
      for (var j = 0; j < 26; j++) {
        var yy2 = y0 + 2 + j * (y1 - y0) / 26;
        var w2 = 4 + j * 1.3 + Math.sin(t * 1.3 + j) * 3;
        c.fillStyle = 'rgba(240,232,210,' + (0.22 - j * 0.006) + ')';
        c.fillRect(moonX - w2 / 2 + Math.sin(t + j * 1.7) * 3, yy2, w2, 0.8);
      }
    }
  }
  function ridge(c, pts, baseY, fill) {
    c.beginPath(); c.moveTo(pts[0], baseY);
    for (var i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.lineTo(pts[pts.length - 2], baseY); c.closePath(); c.fillStyle = fill; c.fill();
  }
  function noiseRidge(seed, x0, x1, y, amp, step) {
    var r = rng(seed), pts = [];
    for (var x = x0; x <= x1 + 0.01; x += step) pts.push(x, y + (r() - 0.5) * amp);
    return pts;
  }
  // blinking lantern: returns colour for a Lumen sequence like 'RA RA'
  function blink(seq, t, opts) {
    opts = opts || {};
    var on = opts.on || 0.55, off = opts.off || 0.22, gap = opts.gap || 0.7, pause = opts.pause || 1.8;
    var toks = String(seq).split('');
    var dur = 0;
    toks.forEach(function (ch) { dur += ch === ' ' ? gap : on + off; });
    var total = dur + pause;
    var tt = ((t % total) + total) % total, acc = 0;
    for (var i = 0; i < toks.length; i++) {
      var ch = toks[i];
      if (ch === ' ') { acc += gap; if (tt < acc) return null; continue; }
      if (tt < acc + on) return GLYPH_COL[ch];
      acc += on + off;
      if (tt < acc) return null;
    }
    return null;
  }
  function seqDuration(seq, opts) {
    opts = opts || {};
    var on = opts.on || 0.55, off = opts.off || 0.22, gap = opts.gap || 0.7, d = 0;
    String(seq).split('').forEach(function (ch) { d += ch === ' ' ? gap : on + off; });
    return d;
  }
  function ship(c, x, y, s, t, col, reflect) {
    c.save(); c.translate(x, y); c.scale(s, s);
    poly(c, [-14, 0, 14, 0, 11, 4, -11, 4], '#05070c');
    rect(c, -6, -3, 9, 3, '#05070c');
    line(c, -2, -3, -2, -20, '#05070c', 0.9);
    line(c, 6, 0, 6, -14, '#05070c', 0.7);
    line(c, -2, -20, 13, 0, 'rgba(5,7,12,0.8)', 0.4);
    line(c, -2, -20, -14, 0, 'rgba(5,7,12,0.8)', 0.4);
    c.restore();
    var lx = x + 2 * s, ly = y - 8 * s;
    circ(c, lx, ly, 1.1 * s, '#3a3026');
    if (col) {
      glow(c, lx, ly, 14 * s, col, 0.55);
      circ(c, lx, ly, 1.4 * s, col);
      if (reflect) for (var i = 0; i < 6; i++) {
        c.fillStyle = hexA(col, 0.35 - i * 0.05);
        c.fillRect(lx - 2 + Math.sin(t * 3 + i) * 1.2, y + 3 * s + i * 2.2, 4, 0.8);
      }
    }
  }
  function lighthouse(c, x, base, h, w, lit, t, beams) {
    var top = base - h, tw = w * 0.62;
    // tower
    var g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, '#eef0f5'); g.addColorStop(0.45, P.tower); g.addColorStop(1, '#6d7487');
    c.beginPath(); c.moveTo(x - w / 2, base); c.lineTo(x - tw / 2, top + h * 0.12); c.lineTo(x + tw / 2, top + h * 0.12); c.lineTo(x + w / 2, base); c.closePath();
    c.fillStyle = g; c.fill();
    // gallery
    var gy = top + h * 0.12;
    rect(c, x - tw / 2 - w * 0.1, gy - h * 0.012 - 1, tw + w * 0.2, Math.max(1.5, h * 0.02), '#262b38');
    // lantern room
    var lh = h * 0.08, lw = tw * 0.72;
    rect(c, x - lw / 2, gy - lh - 1, lw, lh, lit ? '#ffd27a' : '#1b2131');
    for (var i = 1; i < 3; i++) line(c, x - lw / 2 + lw * i / 3, gy - lh - 1, x - lw / 2 + lw * i / 3, gy - 1, '#262b38', Math.max(0.5, w * 0.03));
    // cap
    poly(c, [x - lw / 2 - 1, gy - lh - 1, x + lw / 2 + 1, gy - lh - 1, x, gy - lh - 1 - lh * 0.8], '#262b38');
    line(c, x, gy - lh * 1.8 - 1, x, gy - lh * 2.3 - 1, '#262b38', 0.6);
    // windows
    for (var k = 0; k < 3; k++) {
      var wy = base - h * (0.25 + k * 0.22);
      rect(c, x - w * 0.05, wy, Math.max(1, w * 0.1), Math.max(1.5, h * 0.03), '#2c3242');
    }
    if (lit) {
      var ly = gy - lh / 2 - 1;
      glow(c, x, ly, h * 0.5, '#ffcf70', 0.45);
      if (beams) {
        var ang = t * 0.5;
        for (var b = 0; b < 2; b++) {
          var a = ang + b * Math.PI;
          var len = W * 1.2, spread = 0.07;
          var ex = Math.cos(a), sx = Math.sin(a) * 0.25;
          var gr = c.createLinearGradient(x, ly, x + ex * len, ly + sx * len);
          gr.addColorStop(0, 'rgba(255,220,140,0.42)'); gr.addColorStop(1, 'rgba(255,220,140,0)');
          c.beginPath(); c.moveTo(x, ly);
          c.lineTo(x + Math.cos(a - spread) * len, ly + Math.sin(a - spread) * 0.25 * len);
          c.lineTo(x + Math.cos(a + spread) * len, ly + Math.sin(a + spread) * 0.25 * len);
          c.closePath(); c.fillStyle = gr; c.fill();
        }
      }
    }
  }
  function lensDot(c, x, y, g, t, ph) {
    var col = GLYPH_COL[g];
    var a = 0.55 + 0.35 * Math.sin(t * 1.4 + (ph || 0));
    glow(c, x, y, 3.2, col, a * 0.7);
    circ(c, x, y, 0.9, col);
  }
  function lensRow(c, x, y, seq, t, ph, sp) {
    sp = sp || 2.6;
    var cx = x;
    String(seq).split('').forEach(function (ch, i) {
      if (ch === ' ') { cx += sp * 0.8; return; }
      lensDot(c, cx, y, ch, t, (ph || 0) + i);
      cx += sp;
    });
  }
  function pebbles(c, seed, y0, y1, n, cols) {
    var r = rng(seed);
    for (var i = 0; i < n; i++) {
      var y = y0 + Math.pow(r(), 0.8) * (y1 - y0), d = (y - y0) / (y1 - y0);
      ell(c, r() * W, y, 0.8 + d * 2.6 * r() + 0.4, 0.5 + d * 1.4 * r() + 0.3, cols[(r() * cols.length) | 0]);
    }
  }
  function tufts(c, seed, y0, y1, n, col, col2) {
    var r = rng(seed);
    for (var i = 0; i < n; i++) {
      var x = r() * W, y = y0 + r() * (y1 - y0), s = 1 + (y - y0) / (y1 - y0) * 3;
      c.beginPath();
      c.moveTo(x - s * 1.6, y); c.quadraticCurveTo(x - s * 0.8, y - s * 2.2, x, y - s * 1.4 * (0.6 + r()));
      c.quadraticCurveTo(x + s * 0.8, y - s * 2.4, x + s * 1.6, y);
      c.closePath(); c.fillStyle = r() > 0.8 ? col2 : col; c.fill();
    }
  }
  var grainCanvas = null;
  function grain(c) {
    if (typeof document === 'undefined') return;
    if (!grainCanvas) {
      grainCanvas = document.createElement('canvas');
      grainCanvas.width = grainCanvas.height = 96;
      var gc = grainCanvas.getContext('2d'), id = gc.createImageData(96, 96), r = rng(99);
      for (var i = 0; i < id.data.length; i += 4) {
        var v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 14;
      }
      gc.putImageData(id, 0, 0);
    }
    c.save(); c.globalCompositeOperation = 'overlay';
    var pat = c.createPattern(grainCanvas, 'repeat');
    c.fillStyle = pat; c.fillRect(0, 0, W, H);
    c.restore();
  }
  function vignette(c, a) {
    var g = c.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + (a == null ? 0.55 : a) + ')');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }

  /* ------------------------------------------------------------ scenes */
  var S = {};

  function shipCol(st, t, fx) {
    if (fx && fx.reply && fx.replyAt != null && t >= fx.replyAt && t < fx.replyAt + seqDuration(fx.reply) * 2 + 2.4) {
      return blink(fx.reply, t - fx.replyAt, { pause: 1.2 });
    }
    if (fx && fx.seq && t >= fx.t0 && fx.replyAt != null && t < fx.replyAt) return null; // she's watching
    return blink('RA RA', t);
  }

  S.title = function (c, st, t) {
    sky(c, 150);
    stars(c, t, 3, 110, 140);
    moon(c, 250, 50, 13);
    ridge(c, [150, 150, 172, 136, 196, 128, 214, 118, 236, 120, 262, 132, 290, 142, 320, 146], 170, P.land1);
    lighthouse(c, 214, 122, 52, 10, st.lit, t, st.lit);
    sea(c, 148, H, t, 5, 250);
    ship(c, 84, 150, 1, t, blink('RA RA', t), true);
    vignette(c, 0.6);
  };

  S.jetty = function (c, st, t, fx) {
    sky(c, 115);
    stars(c, t, 1, 80, 108);
    moon(c, 58, 42, 11);
    sea(c, 112, H, t, 11, 58);
    // the island
    poly(c, [112, 116, 140, 110, 160, 106, 182, 98, 205, 92, 228, 82, 252, 76, 276, 76, 300, 84, 320, 88,
      320, 150, 290, 147, 250, 149, 214, 146, 190, 149, 168, 146, 150, 132, 132, 121], P.land2);
    poly(c, [150, 132, 168, 146, 190, 149, 214, 146, 250, 149, 290, 147, 320, 150, 320, 128, 290, 124, 250, 128, 214, 126, 182, 130], P.land1);
    lighthouse(c, 262, 79, 54, 10, st.f.lampLit, t, st.f.lampLit);
    rect(c, 238, 74, 13, 7, '#1a1f2c'); poly(c, [236, 74, 253, 74, 244.5, 68], '#141824');
    ship(c, 92, 110, 0.85, t, shipCol(st, t, fx), true);
    // jetty deck in perspective
    var tide = st.dispTide;
    var nearL = 64, nearR = 250, farL = 186, farR = 210, nearY = 240, farY = 143;
    // posts (drawn first, below deck)
    for (var i = 0; i <= 7; i++) {
      var f = i / 7, y = farY + (nearY - farY) * Math.pow(f, 1.6);
      var xl = farL + (nearL - farL) * Math.pow(f, 1.6), xr = farR + (nearR - farR) * Math.pow(f, 1.6);
      var pw = 1.5 + f * 6, plen = (4 + (6 - tide) * 2.2) * (0.4 + f);
      rect(c, xl - pw * 0.6, y - 1, pw, plen + 2, P.woodDk);
      rect(c, xr - pw * 0.4, y - 1, pw, plen + 2, P.woodDk);
      if (tide <= 2) rect(c, xl - pw * 0.6, y + plen - 2, pw, 2, 'rgba(70,90,70,0.6)');
    }
    poly(c, [nearL, nearY, farL, farY, farR, farY, nearR, nearY], P.wood);
    // planks
    for (var k = 1; k < 9; k++) {
      var fk = k / 9;
      line(c, nearL + (nearR - nearL) * fk, nearY, farL + (farR - farL) * fk, farY, 'rgba(20,12,8,0.55)', 0.6);
    }
    for (var j = 0; j < 22; j++) {
      var ff = Math.pow(j / 22, 1.8), yy = farY + (nearY - farY) * ff;
      var xl2 = farL + (nearL - farL) * ff, xr2 = farR + (nearR - farR) * ff;
      line(c, xl2, yy, xr2, yy, 'rgba(15,10,6,0.5)', 0.4 + ff);
    }
    // moonlight sheen on deck
    var gd = c.createLinearGradient(nearL, 0, nearR, 0);
    gd.addColorStop(0, 'rgba(200,210,240,0.14)'); gd.addColorStop(1, 'rgba(0,0,0,0.25)');
    poly(c, [nearL, nearY, farL, farY, farR, farY, nearR, nearY], gd);
    if (tide >= 4.2) { // sea slopping over
      var a = (tide - 4.2) / 0.8;
      poly(c, [nearL - 10, nearY, farL + (nearL - farL) * 0.35, 175, farR + (nearR - farR) * 0.35, 175, nearR + 10, nearY], 'rgba(30,60,100,' + (0.25 + a * 0.35) + ')');
      for (var q = 0; q < 12; q++) line(c, 80 + q * 13 + Math.sin(t + q) * 3, 190 + (q % 4) * 12, 88 + q * 13 + Math.sin(t + q) * 3, 190 + (q % 4) * 12, 'rgba(150,190,240,0.25)', 0.7);
    }
    // the rowboat, tied up on the left
    var by = 190 + Math.sin(t * 1.2) * 1.2 + (3 - tide) * 1.5;
    poly(c, [8, by - 6, 92, by - 9, 84, by + 6, 20, by + 7], '#2a1f19');
    poly(c, [14, by - 5, 88, by - 8, 82, by + 1, 22, by + 2], '#160f0b');
    line(c, 8, by - 6, 92, by - 9, P.woodHi, 1);
    rect(c, 46, by - 7, 4, 8, P.wood);
    circ(c, 60, by - 2, 2.2, 'rgba(180,220,230,0.35)'); // the jar
    circ(c, 59.4, by - 2.6, 0.7, 'rgba(255,255,255,0.6)');
    c.beginPath(); c.moveTo(90, by - 8); c.quadraticCurveTo(100, by - 2, 106, 204); c.strokeStyle = 'rgba(160,140,110,0.6)'; c.lineWidth = 0.6; c.stroke();
    // the old sign
    rect(c, 262, 160, 3, 50, P.woodDk);
    poly(c, [240, 150, 290, 147, 290, 172, 240, 174], '#4a3d33');
    poly(c, [242, 152, 288, 149, 288, 170, 242, 172], '#5c5148');
    poly(c, [252, 163, 266, 163, 263, 167, 255, 167], 'rgba(30,30,40,0.6)'); // painted boat
    for (var p = 0; p < 4; p++) circ(c, 270 + p * 4, 158, 1.1, 'rgba(30,30,40,0.5)'); // painted crowd
    lensRow(c, 252, 170.5, 'BA GV', t, 0, 3);
    vignette(c);
  };

  S.path = function (c, st, t) {
    sky(c, 120);
    stars(c, t, 2, 90, 100);
    moon(c, 262, 36, 9);
    sea(c, 100, 122, t, 3, null);
    // far: village roofs left, graves centre, lighthouse right
    ridge(c, [0, 108, 40, 104, 80, 106, 120, 103, 160, 100, 200, 103, 240, 104, 280, 101, 320, 104], 130, P.land3);
    for (var i = 0; i < 6; i++) { var hx = 18 + i * 13; poly(c, [hx, 106, hx + 5, 101 - (i % 2) * 2, hx + 10, 106], '#0e1424'); rect(c, hx + 1, 105, 8, 4, '#0e1424'); }
    for (var g = 0; g < 6; g++) rect(c, 150 + g * 4, 97 + (g % 2), 1.6, 3.4 - (g % 3) * 0.6, '#323a52');
    lighthouse(c, 272, 104, 38, 7, st.f.lampLit, t, st.f.lampLit);
    rect(c, 255, 100, 9, 5, '#0e1424');
    // hills
    ridge(c, [0, 130, 50, 120, 110, 126, 170, 116, 230, 122, 290, 114, 320, 118], 240, P.heather2);
    ridge(c, [0, 160, 60, 150, 120, 158, 190, 148, 250, 156, 320, 146], 240, P.heather);
    // the path and its fork
    poly(c, [118, 240, 202, 240, 172, 168, 150, 168], '#3a3442');
    poly(c, [152, 170, 168, 170, 98, 128, 90, 128], '#342f3d');
    poly(c, [156, 168, 170, 168, 166, 116, 162, 116], '#312c3a');
    poly(c, [160, 170, 174, 170, 262, 122, 254, 122], '#342f3d');
    var r = rng(8);
    for (var s = 0; s < 40; s++) ell(c, 130 + r() * 60, 175 + r() * 60, 1 + r() * 2, 0.6 + r(), 'rgba(80,72,90,0.6)');
    tufts(c, 21, 160, 240, 120, '#120e18', '#2a2033');
    // marker post
    rect(c, 196, 140, 7, 52, P.wood);
    rect(c, 196, 140, 2, 52, P.woodHi);
    poly(c, [194, 140, 205, 140, 199.5, 135], P.woodDk);
    ell(c, 198, 145, 1, 1.6, '#1b120c'); ell(c, 201, 148, 1, 1.6, '#1b120c'); // footprints
    lensRow(c, 197.5, 156, 'AV', t, 1, 3.2);
    vignette(c);
  };

  function waterline(tide) { return 148 + (tide - 1) * 12.5; }

  S.beach = function (c, st, t) {
    var tide = st.dispTide, wl = waterline(tide);
    sky(c, 100);
    stars(c, t, 5, 70, 95);
    moon(c, 44, 34, 9);
    // sand + shingle base
    vgrad(c, 0, 98, W, 142, [[0, P.wet], [0.5, P.sand], [1, P.shingle]]);
    // wreck on the sand
    if (tide < 2.6) {
      var wy = 166;
      line(c, 30, wy + 4, 112, wy - 2, '#0b0d12', 2.4);
      for (var i = 0; i < 8; i++) {
        var rx = 36 + i * 10, ry = wy + 3 - i * 0.7;
        c.beginPath(); c.moveTo(rx, ry); c.quadraticCurveTo(rx - 6, ry - 12, rx + 1, ry - 18 + (i % 3) * 3);
        c.strokeStyle = '#0b0d12'; c.lineWidth = 1.6; c.stroke();
      }
    }
    // the sea, down to the waterline
    sea(c, 98, wl, t, 9, 44);
    vgrad(c, 0, wl - 3, W, 6, [[0, 'rgba(200,220,255,0)'], [0.5, 'rgba(200,220,255,0.22)'], [1, 'rgba(200,220,255,0)']]);
    for (var f = 0; f < 18; f++) line(c, f * 18 + Math.sin(t * 0.8 + f) * 6, wl + Math.sin(f) * 1.2, f * 18 + 10 + Math.sin(t * 0.8 + f) * 6, wl + Math.sin(f) * 1.2, 'rgba(220,235,255,0.35)', 0.8);
    // cliff on the right
    poly(c, [236, 240, 244, 180, 240, 140, 252, 96, 262, 60, 282, 38, 304, 30, 320, 34, 320, 240], P.rock);
    poly(c, [236, 240, 244, 180, 240, 140, 252, 96, 262, 60, 268, 58, 258, 100, 250, 140, 254, 182, 248, 240], P.rockHi);
    for (var k = 0; k < 9; k++) line(c, 256 + k * 2, 70 + k * 18, 320, 64 + k * 19, 'rgba(0,0,0,0.25)', 0.6);
    // cave mouth (only bare at the first notch)
    c.beginPath(); c.moveTo(266, 190); c.quadraticCurveTo(268, 150, 284, 148); c.quadraticCurveTo(300, 150, 302, 190); c.closePath();
    c.fillStyle = '#030406'; c.fill();
    if (tide > 1.05) {
      var a = Math.min(1, (tide - 1) * 1.4);
      vgrad(c, 238, Math.min(wl, 150) - 4, 82, 60, [[0, 'rgba(22,40,70,' + a + ')'], [1, 'rgba(12,22,40,' + a + ')']]);
      for (var fm = 0; fm < 10; fm++) ell(c, 246 + fm * 8 + Math.sin(t * 2 + fm) * 2, Math.min(wl, 150) - 3 + Math.sin(t * 3 + fm) * 1.5, 4, 1.2, 'rgba(230,240,255,' + (0.25 * a) + ')');
    }
    // the boat slip (goes under water)
    poly(c, [0, 240, 58, 240, 104, 182, 84, 182], '#3a3e4a');
    for (var s = 0; s < 8; s++) { var yy = 188 + s * 7; line(c, 84 - (yy - 182) * 1.5 + 14, yy, 104 - (yy - 182) * 0.8 + 6, yy, 'rgba(0,0,0,0.3)', 0.5); }
    // shingle foreground
    poly(c, [0, 205, 70, 196, 160, 200, 236, 194, 250, 240, 0, 240], P.shingle);
    pebbles(c, 12, 198, 240, 260, ['#3b3e48', '#2b2d35', '#474a55', '#22242b', '#55565e']);
    if (tide > 4) { // sea right up the beach
      var a2 = Math.min(1, (tide - 4));
      poly(c, [0, 196, 236, 186, 240, 205, 0, 214], 'rgba(18,34,60,' + (0.85 * a2) + ')');
      for (var w2 = 0; w2 < 14; w2++) line(c, w2 * 18 + Math.sin(t + w2) * 4, 208 + Math.sin(w2) * 3, w2 * 18 + 9, 208 + Math.sin(w2) * 3, 'rgba(220,235,255,' + (0.4 * a2) + ')', 0.8);
    }
    // slip post
    rect(c, 92, 166, 4, 22, P.wood);
    lensRow(c, 91.4, 172, 'BV', t, 2, 3);
    // THE TIDE MANGLE
    var mx = 150, my = 150;
    rect(c, mx, my + 6, 6, 58, P.woodDk); rect(c, mx + 70, my + 6, 6, 58, P.woodDk);
    poly(c, [mx - 4, my + 66, mx + 10, my + 66, mx + 3, my + 4], P.wood);
    poly(c, [mx + 66, my + 66, mx + 80, my + 66, mx + 73, my + 4], P.wood);
    rect(c, mx - 2, my + 2, 80, 5, P.woodHi);
    // rollers
    [my + 18, my + 31].forEach(function (ry, ii) {
      var gr = c.createLinearGradient(0, ry - 6, 0, ry + 6);
      gr.addColorStop(0, '#6b5640'); gr.addColorStop(0.4, '#8a7152'); gr.addColorStop(1, '#2f2419');
      c.fillStyle = gr; c.fillRect(mx + 6, ry - 6, 64, 12);
      ell(c, mx + 6, ry, 2.5, 6, '#2a2016'); ell(c, mx + 70, ry, 2.5, 6, '#4a3a2a');
      for (var gl = 0; gl < 5; gl++) line(c, mx + 12 + gl * 13 + ((t * (ii ? -4 : 4)) % 13 + 13) % 13, ry - 5, mx + 12 + gl * 13 + ((t * (ii ? -4 : 4)) % 13 + 13) % 13, ry + 5, 'rgba(30,20,10,0.35)', 0.6);
    });
    // flywheel
    var fx = mx + 92, fy = my + 26, fr = 17, ang = tide * 1.25 + (st.crankSpin || 0);
    c.beginPath(); c.arc(fx, fy, fr, 0, 6.283); c.strokeStyle = '#2b2118'; c.lineWidth = 3.2; c.stroke();
    c.beginPath(); c.arc(fx, fy, fr, 0, 6.283); c.strokeStyle = '#6a5038'; c.lineWidth = 1.2; c.stroke();
    for (var sp = 0; sp < 6; sp++) { var aa = ang + sp * 1.047; line(c, fx, fy, fx + Math.cos(aa) * fr, fy + Math.sin(aa) * fr, '#4a3826', 1.4); }
    circ(c, fx, fy, 2.5, P.brass);
    line(c, mx + 76, my + 26, fx, fy, '#3a2c20', 2);
    var cx2 = fx + Math.cos(ang) * 12, cy2 = fy + Math.sin(ang) * 12;
    line(c, cx2, cy2, cx2 + 7, cy2 + 2, '#2a2018', 2);
    rect(c, fx - 3, fy + 2, 6, 38, P.woodDk);
    // dial
    var dx = mx + 20, dy = my - 6;
    circ(c, dx, dy, 9, P.brassDk); circ(c, dx, dy, 8, P.brass); circ(c, dx, dy, 6.6, '#efe2c0');
    for (var n = 1; n <= 5; n++) { var na = Math.PI + (n - 1) * Math.PI / 4; line(c, dx + Math.cos(na) * 5, dy + Math.sin(na) * 5, dx + Math.cos(na) * 6.4, dy + Math.sin(na) * 6.4, '#3a2a12', 0.6); }
    var pa = Math.PI + (tide - 1) * Math.PI / 4;
    line(c, dx, dy, dx + Math.cos(pa) * 5.6, dy + Math.sin(pa) * 5.6, '#7a1d12', 1);
    circ(c, dx, dy, 0.9, '#3a2a12');
    rect(c, mx + 34, my - 9, 30, 7, P.brassDk); rect(c, mx + 35, my - 8, 28, 5, P.brass);
    vignette(c);
  };

  S.cave = function (c, st, t) {
    rect(c, 0, 0, W, H, '#040509');
    // receding arches
    var arches = 6;
    for (var i = 0; i < arches; i++) {
      var f = i / arches, cx = 160 + Math.sin(i * 0.9) * 8, w = 300 - i * 44, h = 230 - i * 32, by = 220 - i * 10;
      c.beginPath(); c.moveTo(cx - w / 2, by); c.quadraticCurveTo(cx - w / 2, by - h, cx, by - h); c.quadraticCurveTo(cx + w / 2, by - h, cx + w / 2, by); c.closePath();
      var l = 14 + i * 3;
      c.fillStyle = 'rgb(' + l + ',' + (l + 2) + ',' + (l + 8) + ')'; c.fill();
      c.beginPath(); c.moveTo(cx - w / 2 + 6, by); c.quadraticCurveTo(cx - w / 2 + 6, by - h + 8, cx, by - h + 8); c.quadraticCurveTo(cx + w / 2 - 6, by - h + 8, cx + w / 2 - 6, by); c.closePath();
      c.fillStyle = 'rgb(' + (l - 6) + ',' + (l - 5) + ',' + l + ')'; c.fill();
    }
    // far wall + shaft of light from the trapdoor
    var tx = 166, ty = 72;
    glow(c, tx, ty + 30, 60, '#9fb6ff', 0.12);
    rect(c, tx - 9, ty - 4, 18, 5, '#3a2b20');
    line(c, tx - 9, ty, tx + 9, ty, 'rgba(255,220,160,0.35)', 0.6);
    for (var r = 0; r < 9; r++) line(c, tx - 5, ty + 8 + r * 9, tx + 5, ty + 8 + r * 9, '#5b4f48', 1.2);
    line(c, tx - 5, ty + 4, tx - 5, ty + 90, '#3d3430', 1); line(c, tx + 5, ty + 4, tx + 5, ty + 90, '#3d3430', 1);
    // wet floor reflections
    vgrad(c, 0, 186, W, 54, [[0, 'rgba(20,30,50,0.6)'], [1, 'rgba(10,14,24,0.9)']]);
    for (var k = 0; k < 30; k++) {
      var y = 190 + (k * 37 % 48), x = (k * 53 % 300) + Math.sin(t * 0.7 + k) * 3;
      line(c, x, y, x + 8 + (k % 4) * 3, y, 'rgba(120,150,210,' + (0.12 + (k % 3) * 0.05) + ')', 0.6);
    }
    // a drip
    var dp = (t * 0.7) % 1;
    circ(c, 120, 40 + dp * 150, 0.8, 'rgba(170,200,255,' + (0.8 - dp * 0.6) + ')');
    // chalk on the left wall
    c.save(); c.translate(56, 120); c.rotate(-0.08);
    for (var ch = 0; ch < 3; ch++) for (var x2 = 0; x2 < 9 - ch * 2; x2++) line(c, x2 * 4, ch * 6, x2 * 4 + 2.6, ch * 6 - 0.6, 'rgba(220,220,210,0.55)', 0.6);
    c.restore();
    vignette(c, 0.75);
  };

  S.wreck = function (c, st, t) {
    sky(c, 125);
    stars(c, t, 6, 70, 115);
    moon(c, 270, 40, 10);
    sea(c, 120, 140, t, 4, 270);
    vgrad(c, 0, 138, W, 102, [[0, '#1b2233'], [1, '#262a35']]);
    for (var p = 0; p < 7; p++) ell(c, 30 + p * 47, 160 + (p % 3) * 22, 18 + (p % 2) * 10, 2.2, 'rgba(110,140,190,0.18)');
    // keel, broken
    poly(c, [20, 205, 150, 182, 152, 188, 22, 212], '#0b0d12');
    poly(c, [168, 186, 300, 162, 300, 168, 170, 192], '#0b0d12');
    for (var i = 0; i < 12; i++) {
      var bx = 34 + i * 23 + (i > 5 ? 10 : 0), by = 206 - i * 3.6 - (i > 5 ? 2 : 0);
      var h = 60 - Math.abs(i - 5.5) * 5;
      c.beginPath(); c.moveTo(bx, by); c.bezierCurveTo(bx - 14, by - h * 0.4, bx - 10, by - h * 0.9, bx + 4, by - h);
      c.strokeStyle = '#0d1016'; c.lineWidth = 3.4; c.stroke();
      c.beginPath(); c.moveTo(bx, by); c.bezierCurveTo(bx - 14, by - h * 0.4, bx - 10, by - h * 0.9, bx + 4, by - h);
      c.strokeStyle = 'rgba(160,175,200,0.18)'; c.lineWidth = 0.7; c.stroke();
      ell(c, bx - 6, by - h * 0.35, 2.4, 1, 'rgba(40,70,50,0.7)');
    }
    // nameboard
    c.save(); c.translate(214, 214); c.rotate(-0.12);
    rect(c, -26, -6, 52, 12, '#4a3c30'); rect(c, -25, -5, 50, 10, '#5b4b3c');
    c.fillStyle = 'rgba(225,215,190,0.75)'; c.font = 'bold 8px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('MARGERY', 0, 0.5);
    for (var b = 0; b < 6; b++) circ(c, -22 + b * 8.5, 5, 1, 'rgba(200,200,200,0.4)');
    c.restore();
    // locker
    rect(c, 96, 196, 22, 14, '#2a2019'); rect(c, 96, 196, 22, 3, '#3d2f24');
    vignette(c);
  };

  S.graves = function (c, st, t, fx) {
    var tide = st.dispTide;
    sky(c, 110);
    stars(c, t, 7, 85, 100);
    moon(c, 252, 36, 10);
    sea(c, 104, H, t, 13, 252);
    ship(c, 290, 104, 0.55, t, shipCol(st, t, fx), true);
    // the Teeth
    if (tide < 2.8) {
      var a = Math.min(1, (2.8 - tide) / 1.2);
      for (var i = 0; i < 9; i++) {
        var x = 228 + i * 9, hgt = (4 + (i * 7 % 5)) * a;
        poly(c, [x, 128, x + 3, 128 - hgt, x + 6, 128], '#05070b');
      }
    }
    for (var f = 0; f < 10; f++) ell(c, 226 + f * 9 + Math.sin(t * 2 + f) * 2, 128, 4, 0.8, 'rgba(230,240,255,' + (0.18 + 0.12 * Math.sin(t * 1.7 + f)) + ')');
    // clifftop
    poly(c, [0, 150, 70, 142, 150, 146, 210, 150, 236, 160, 248, 240, 0, 240], P.grass);
    poly(c, [236, 160, 248, 240, 262, 240, 250, 166], P.rock);
    vgrad(c, 0, 150, 240, 90, [[0, 'rgba(60,80,90,0.25)'], [1, 'rgba(0,0,0,0.3)']]);
    // stones: tall (Silas), wide (Quillers), leaning (Jory), broken boat (Gowe), clean (waiting)
    function stone(x, y, w, h, rot, col, lens, ph, round) {
      c.save(); c.translate(x, y); c.rotate(rot);
      c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -h + (round ? w / 2 : 2));
      if (round) c.arc(0, -h + w / 2, w / 2, Math.PI, 0); else { c.lineTo(-w / 2 + 2, -h); c.lineTo(w / 2 - 2, -h); }
      c.lineTo(w / 2, 0); c.closePath(); c.fillStyle = col; c.fill();
      c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -h + (round ? w / 2 : 2)); c.lineTo(-w / 2 + 1.5, -h + (round ? w / 2 : 2)); c.lineTo(-w / 2 + 1.5, 0); c.closePath();
      c.fillStyle = 'rgba(220,230,255,0.18)'; c.fill();
      lensRow(c, -(lens.length - 1) * 1.4, -h * 0.3, lens, t, ph, 2.8);
      c.restore();
    }
    stone(58, 176, 16, 46, -0.03, P.stone, 'RA', 0, true);
    stone(110, 182, 34, 24, 0.02, '#424858', 'AA', 2, false);
    stone(160, 178, 14, 30, 0.22, '#3d4352', 'BA BB', 4, true);
    stone(204, 186, 18, 26, -0.06, '#454b5c', 'BA GG', 6, false);
    stone(88, 214, 18, 34, 0, '#8d93a6', 'RA', 8, true);
    // small carvings hinted
    rect(c, 56, 141, 4, 1, 'rgba(255,220,140,0.4)');
    tufts(c, 31, 168, 240, 110, '#0c1314', '#203130');
    vignette(c);
  };

  S.yard = function (c, st, t) {
    sky(c, 200);
    stars(c, t, 9, 90, 180);
    moon(c, 40, 32, 9);
    // the lighthouse
    lighthouse(c, 214, 206, 188, 46, st.f.lampLit, t, st.f.lampLit);
    // its door
    var dx = 204, dy = 178;
    if (st.f.unbarred) {
      rect(c, dx, dy, 20, 28, '#0a0c12');
      glow(c, dx + 10, dy + 20, 16, '#7d8fb8', 0.12);
      poly(c, [dx, dy, dx - 6, dy + 2, dx - 6, dy + 28, dx, dy + 28], '#2b2f3a');
    } else {
      rect(c, dx, dy, 20, 28, '#2b2f3a');
      for (var s = 0; s < 3; s++) rect(c, dx, dy + 5 + s * 9, 20, 1.6, '#151820');
      circ(c, dx + 16, dy + 15, 0.9, '#6b6f7a');
    }
    // ground
    vgrad(c, 0, 204, W, 36, [[0, '#1a2024'], [1, '#0d1113']]);
    var r = rng(4);
    for (var i = 0; i < 70; i++) ell(c, r() * W, 208 + r() * 32, 2 + r() * 3, 1 + r(), 'rgba(60,70,80,' + (0.2 + r() * 0.3) + ')');
    // cottage
    rect(c, 24, 150, 116, 56, '#c9c6bd');
    vgrad(c, 24, 150, 116, 56, [[0, 'rgba(0,0,0,0.0)'], [1, 'rgba(0,0,0,0.35)']]);
    rect(c, 108, 150, 32, 56, 'rgba(0,0,10,0.28)');
    poly(c, [16, 152, 82, 112, 148, 152], '#262a33');
    poly(c, [16, 152, 82, 112, 84, 114, 22, 152], '#3b404c');
    rect(c, 108, 112, 10, 26, '#3b3f48'); rect(c, 106, 110, 14, 3, '#2c3038');
    // window
    rect(c, 34, 166, 20, 16, '#151a26'); line(c, 44, 166, 44, 182, '#c9c6bd', 1.2); line(c, 34, 174, 54, 174, '#c9c6bd', 1.2);
    rect(c, 35, 167, 4, 3, 'rgba(200,215,255,0.25)');
    // door with its little brass lantern
    rect(c, 70, 172, 22, 34, st.f.cottageOpen ? '#0e0c0b' : '#3c2c22');
    if (st.f.cottageOpen) poly(c, [70, 172, 64, 175, 64, 206, 70, 206], '#3c2c22');
    else for (var pl = 1; pl < 4; pl++) line(c, 70 + pl * 5.5, 172, 70 + pl * 5.5, 206, 'rgba(0,0,0,0.3)', 0.5);
    var lx = st.f.cottageOpen ? 67 : 86, ly = 188;
    rect(c, lx - 2.5, ly - 3.5, 5, 7, P.brass);
    glow(c, lx, ly, 8, '#ffcf70', st.f.cottageOpen ? 0.5 : 0.18 + 0.08 * Math.sin(t * 2));
    if (st.f.cottageOpen) { circ(c, lx - 1, ly, 0.8, GLYPH_COL.R); circ(c, lx + 1, ly, 0.8, GLYPH_COL.A); }
    vignette(c);
  };

  S.cottage = function (c, st, t) {
    vgrad(c, 0, 0, W, 190, [[0, '#17110f'], [1, '#261b16']]);
    // beams
    for (var b = 0; b < 4; b++) rect(c, 0, 8 + b * 2, W, 1, 'rgba(0,0,0,0.3)');
    rect(c, 0, 0, W, 12, '#0f0a08');
    rect(c, 0, 186, W, 54, '#120d0b');
    for (var f = 0; f < 8; f++) line(c, 0, 192 + f * 7, W, 192 + f * 7, 'rgba(0,0,0,0.35)', 0.6);
    // window with the moon
    rect(c, 18, 52, 64, 72, '#0b0f1c');
    vgrad(c, 20, 54, 60, 68, [[0, '#0d1530'], [1, '#22335a']]);
    circ(c, 60, 74, 6, P.moon); glow(c, 60, 74, 22, '#cfdcff', 0.18);
    line(c, 50, 54, 50, 122, '#2a1f1a', 2); line(c, 20, 88, 80, 88, '#2a1f1a', 2);
    rect(c, 14, 122, 72, 5, '#3a2a20');
    // moonlight on the floor
    c.fillStyle = 'rgba(170,190,240,0.07)';
    c.beginPath(); c.moveTo(20, 124); c.lineTo(80, 124); c.lineTo(180, 240); c.lineTo(60, 240); c.closePath(); c.fill();
    // perch + Ponder
    rect(c, 102, 108, 2.4, 82, '#3a2a20'); rect(c, 94, 188, 18, 3, '#2a1e16');
    rect(c, 92, 106, 22, 2.4, '#4a3628');
    var bob = Math.sin(t * 1.3) * 0.8, blinkEye = (t % 5) < 0.15;
    ell(c, 103, 96 + bob * 0.3, 7, 10, '#8b8f97');
    ell(c, 106, 98 + bob * 0.3, 4.5, 8, '#6b6f78', 0.2);
    poly(c, [104, 104, 110, 116, 100, 116], '#b32a22'); // red tail
    circ(c, 101, 85 + bob, 5.5, '#9a9ea6');
    ell(c, 99, 85.5 + bob, 3, 3.4, '#dcdde0');
    poly(c, [95.5, 85 + bob, 93, 87.5 + bob, 96.5, 88.5 + bob], '#141414');
    if (!blinkEye) circ(c, 99.5, 84.5 + bob, 0.9, '#121212');
    // sampler
    rect(c, 132, 62, 40, 42, '#4a3426'); rect(c, 135, 65, 34, 36, '#d8ccb0');
    poly(c, [140, 80, 145, 75, 150, 80], '#7a3a30'); rect(c, 141, 80, 8, 6, '#9a5a40');
    rect(c, 158, 72, 3, 14, '#e8e4dc'); rect(c, 157.5, 70, 4, 2.5, '#9a5a40');
    for (var p = 0; p < 6; p++) { circ(c, 139 + p * 5, 90, 1.1, '#3a5a8a'); rect(c, 138.4 + p * 5, 91, 1.2, 2.2, '#3a5a8a'); }
    var stitched = st.f.ended;
    for (var h = 0; h < 4; h++) circ(c, 140 + h * 3, 97, stitched ? 0.9 : 0.45, stitched ? '#3a5a8a' : 'rgba(40,30,20,0.6)');
    for (var q = 0; q < 6; q++) rect(c, 153 + q * 2.4, 96.4, 1.6, 1.2, '#3a5a8a');
    // desk
    rect(c, 112, 150, 92, 6, '#4a3628'); rect(c, 116, 156, 4, 34, '#2e2018'); rect(c, 196, 156, 4, 34, '#2e2018');
    poly(c, [124, 150, 146, 147, 150, 150], '#ddd6c8'); poly(c, [140, 150, 168, 146, 172, 150], '#cfc8b8');
    rect(c, 150, 144, 14, 6, '#bdb4a2');
    var sx = 184, sy = 147;
    for (var k = 0; k < 5; k++) { var a = -1.57 + k * 1.2566; line(c, sx, sy, sx + Math.cos(a) * 4, sy + Math.sin(a) * 4, '#c46a3a', 1.4); }
    // THE INDEX
    var ix = 214, iy = 40;
    rect(c, ix, iy + 40, 96, 112, '#3a2617');
    for (var pp = 0; pp < 9; pp++) {
      var ph = 30 + ((pp * 37) % 26) + (pp === 4 ? 14 : 0);
      var gx = ix + 6 + pp * 10;
      var gr = c.createLinearGradient(gx, 0, gx + 7, 0);
      gr.addColorStop(0, P.brassDk); gr.addColorStop(0.4, P.brassHi); gr.addColorStop(1, P.brassDk);
      c.fillStyle = gr; c.fillRect(gx, iy + 40 - ph, 7, ph);
      ell(c, gx + 3.5, iy + 40 - ph, 3.5, 1.2, '#2a1c0c');
    }
    for (var row = 0; row < 6; row++) for (var col = 0; col < 7; col++) {
      rect(c, ix + 6 + col * 12.4, iy + 48 + row * 11, 10.4, 8.4, '#5a3c22');
      rect(c, ix + 9.6 + col * 12.4, iy + 51.6 + row * 11, 3.2, 1.4, P.brassHi);
    }
    rect(c, ix + 4, iy + 118, 88, 10, '#241810');
    for (var key = 0; key < 14; key++) rect(c, ix + 6 + key * 6.1, iy + 120, 4.6, 5, key % 2 ? '#e8e0cc' : '#cfc6b0');
    rect(c, ix + 30, iy + 132, 36, 3, '#0c0806');
    glow(c, ix + 48 + Math.sin(t * 0.5) * 30, iy + 20, 10, '#ffe0a0', 0.12);
    rect(c, ix + 30, iy + 136, 36, 6, P.brass);
    vignette(c, 0.6);
  };

  S.village = function (c, st, t) {
    sky(c, 150);
    stars(c, t, 10, 80, 110);
    moon(c, 52, 32, 8);
    // square
    vgrad(c, 0, 160, W, 80, [[0, '#1a1e28'], [1, '#22252e']]);
    for (var i = -6; i < 12; i++) line(c, 160 + i * 6, 160, 160 + i * 34, 240, 'rgba(0,0,0,0.25)', 0.5);
    for (var j = 0; j < 7; j++) { var y = 162 + j * j * 1.8; line(c, 0, y, W, y, 'rgba(0,0,0,0.22)', 0.5); }
    // houses either side
    function house(x, base, w, h, roofH, col, note) {
      rect(c, x, base - h, w, h, col);
      poly(c, [x - 2, base - h, x + w / 2, base - h - roofH, x + w + 2, base - h], '#151925');
      rect(c, x + w * 0.2, base - h * 0.62, w * 0.22, h * 0.24, '#2d2620');
      rect(c, x + w * 0.58, base - h * 0.62, w * 0.22, h * 0.24, '#2d2620');
      line(c, x + w * 0.31, base - h * 0.62, x + w * 0.31, base - h * 0.38, 'rgba(0,0,0,0.5)', 0.5);
      line(c, x + w * 0.69, base - h * 0.62, x + w * 0.69, base - h * 0.38, 'rgba(0,0,0,0.5)', 0.5);
      rect(c, x + w * 0.4, base - h * 0.32, w * 0.2, h * 0.32, '#1a1512');
      if (note) rect(c, x + w * 0.44, base - h * 0.26, w * 0.12, h * 0.1, '#d8d2c2');
    }
    house(0, 172, 34, 34, 16, '#3a3d48');
    house(30, 166, 30, 28, 14, '#444754', true);
    house(58, 162, 26, 24, 12, '#3c3f4b');
    house(236, 162, 26, 24, 12, '#3c3f4b');
    house(258, 166, 30, 28, 14, '#43465a');
    house(286, 172, 36, 34, 16, '#393c47');
    // the Hall
    var hx = 96, hb = 160;
    rect(c, hx, hb - 4, 128, 6, '#5f6372'); rect(c, hx + 6, hb - 8, 116, 5, '#6c707f');
    rect(c, hx + 8, hb - 60, 112, 52, '#4d5161');
    poly(c, [hx + 2, hb - 60, hx + 64, hb - 88, hx + 126, hb - 60], '#7e8394');
    poly(c, [hx + 12, hb - 62, hx + 64, hb - 84, hx + 116, hb - 62], '#5b6070');
    for (var col = 0; col < 4; col++) {
      var cx = hx + 16 + col * 32;
      var g = c.createLinearGradient(cx, 0, cx + 9, 0);
      g.addColorStop(0, '#c2c6d2'); g.addColorStop(1, '#6a6f80');
      c.fillStyle = g; c.fillRect(cx, hb - 58, 9, 50);
      rect(c, cx - 1.5, hb - 60, 12, 3, '#9ca1b0');
    }
    rect(c, hx + 54, hb - 40, 20, 32, st.f.hallOpen ? '#0b0a0a' : '#3a2a1a');
    if (!st.f.hallOpen) { circ(c, hx + 64, hb - 24, 2.4, P.brass); for (var wh = 0; wh < 5; wh++) rect(c, hx + 59.5 + wh * 1.9, hb - 25, 1.2, 2, P.brassHi); }
    else glow(c, hx + 64, hb - 20, 14, '#f4d090', 0.1);
    for (var lt = 0; lt < 9; lt++) rect(c, hx + 40 + lt * 5.6, hb - 66, 3.6, 1.2, 'rgba(30,32,40,0.75)');
    // noticeboard
    rect(c, 212, 140, 2, 26, P.woodDk); rect(c, 232, 140, 2, 26, P.woodDk);
    rect(c, 208, 126, 30, 20, P.wood);
    rect(c, 211, 128, 24, 16, '#d8d2c0');
    for (var l = 0; l < 5; l++) rect(c, 213, 130.6 + l * 2.8, 20 - (l % 2) * 6, 0.8, 'rgba(40,40,40,0.6)');
    vignette(c);
  };

  S.hall = function (c, st, t) {
    vgrad(c, 0, 0, W, 240, [[0, '#120e0c'], [1, '#1e1714']]);
    // ledger shelves to the ceiling
    var r = rng(17), cols = ['#5a1e1b', '#2a3b2a', '#1d2a44', '#6b5638', '#3f2a3a', '#4a3b2a'];
    for (var sh = 0; sh < 6; sh++) {
      var y = 14 + sh * 22;
      rect(c, 0, y + 18, W, 3, '#2a1d14');
      for (var x = 2; x < W - 2;) {
        var w = 3 + r() * 4, h = 12 + r() * 6;
        rect(c, x, y + 18 - h, w - 0.6, h, cols[(r() * cols.length) | 0]);
        if (r() > 0.4) rect(c, x, y + 18 - h + 3, w - 0.6, 0.8, 'rgba(220,180,90,0.5)');
        x += w;
      }
    }
    // moonlight shafts
    c.fillStyle = 'rgba(160,180,230,0.06)';
    c.beginPath(); c.moveTo(60, 0); c.lineTo(100, 0); c.lineTo(200, 240); c.lineTo(130, 240); c.closePath(); c.fill();
    // floor
    rect(c, 0, 150, W, 90, '#18110e');
    for (var fl = 0; fl < 10; fl++) line(c, 160 + (fl - 5) * 14, 150, 160 + (fl - 5) * 60, 240, 'rgba(0,0,0,0.3)', 0.5);
    // the long table + chairs
    poly(c, [70, 176, 250, 176, 270, 196, 50, 196], '#3d2a1c');
    poly(c, [50, 196, 270, 196, 270, 200, 50, 200], '#24180f');
    for (var ch = 0; ch < 9; ch++) {
      var cx = 64 + ch * 24.5, pushed = ch === 4;
      var cy = pushed ? 214 : 202;
      rect(c, cx, cy - 16, 12, 16, '#2c1e14'); rect(c, cx + 1, cy - 15, 10, 3, '#3a2a1c');
      rect(c, cx, cy, 2, 10, '#1d140d'); rect(c, cx + 10, cy, 2, 10, '#1d140d');
      if (pushed) rect(c, cx + 3, cy - 10, 6, 1.6, P.brassHi);
    }
    // glass case with the Charter
    rect(c, 248, 112, 52, 40, '#2a1d14');
    rect(c, 252, 116, 44, 32, '#cfc4a6');
    for (var l = 0; l < 7; l++) rect(c, 256, 120 + l * 3.6, 36 - (l % 3) * 6, 0.8, 'rgba(50,40,30,0.6)');
    poly(c, [252, 116, 266, 116, 254, 148, 252, 148], 'rgba(255,255,255,0.12)');
    // the jar
    var jx = 34, jy = 130;
    rect(c, 20, jy + 10, 30, 3, '#2a1d14');
    c.beginPath(); c.moveTo(jx - 6, jy + 10); c.lineTo(jx - 6, jy - 4); c.quadraticCurveTo(jx - 6, jy - 7, jx - 3, jy - 7); c.lineTo(jx + 3, jy - 7); c.quadraticCurveTo(jx + 6, jy - 7, jx + 6, jy - 4); c.lineTo(jx + 6, jy + 10); c.closePath();
    c.fillStyle = 'rgba(170,200,210,0.18)'; c.fill(); c.strokeStyle = 'rgba(200,220,230,0.4)'; c.lineWidth = 0.6; c.stroke();
    if (!st.f.jarOpened) {
      rect(c, jx - 3.5, jy - 10, 7, 3.5, '#6b4a2a');
      var mxp = jx + Math.sin(t * 2.3) * 2.6, myp = jy + 1 + Math.cos(t * 3.1) * 3;
      glow(c, mxp, myp, 9, '#fff1c8', 0.4 + 0.15 * Math.sin(t * 5));
      circ(c, mxp, myp, 1, '#fff6dd');
    } else rect(c, jx + 8, jy + 7, 5, 3, '#6b4a2a');
    rect(c, jx - 3, jy + 2, 6, 4, '#e2dac4');
    vignette(c, 0.6);
  };

  S.base = function (c, st, t) {
    rect(c, 0, 0, W, H, '#0e1015');
    // curved stone courses
    for (var row = 0; row < 12; row++) {
      var y = 10 + row * 14;
      for (var k = 0; k < 14; k++) {
        var x = k * 25 + (row % 2) * 12 - 10;
        var bulge = Math.sin((x + 12) / W * Math.PI) * 6;
        rect(c, x + 1, y + bulge, 23, 12, 'rgb(' + (32 + (k * 7 + row * 3) % 10) + ',' + (34 + (k * 5 + row) % 10) + ',' + (42 + (k * 3 + row * 5) % 10) + ')');
      }
    }
    vgrad(c, 0, 0, W, 180, [[0, 'rgba(0,0,0,0.6)'], [1, 'rgba(0,0,0,0.1)']]);
    // floor flags
    vgrad(c, 0, 180, W, 60, [[0, '#1d1f26'], [1, '#262830']]);
    for (var f = 0; f < 7; f++) line(c, 0, 186 + f * f * 1.4, W, 186 + f * f * 1.4, 'rgba(0,0,0,0.3)', 0.5);
    // stair corkscrewing up on the right
    for (var s = 0; s < 14; s++) {
      var a = s * 0.33, sx = 250 - Math.sin(a) * 34 + s * 1.5, sy = 186 - s * 13;
      poly(c, [sx - 22, sy, sx + 22, sy - 3, sx + 22, sy + 4, sx - 22, sy + 7], s % 2 ? '#4a4e5c' : '#555a69');
      rect(c, sx - 22, sy + 7, 44, 3, '#22252e');
    }
    // the door on the left
    var dx = 14, dy = 104;
    rect(c, dx - 4, dy - 6, 58, 86, '#2a2c34');
    if (st.f.unbarred) {
      vgrad(c, dx, dy, 50, 80, [[0, '#101a33'], [1, '#1c2a44']]);
      for (var st2 = 0; st2 < 6; st2++) rect(c, dx + 6 + st2 * 7, dy + 6 + (st2 % 3) * 6, 0.8, 0.8, '#cfd8ff');
      rect(c, dx, dy + 60, 50, 20, '#141a1e');
      rect(c, dx + 4, 214, 50, 6, '#3a2a1c');
    } else {
      rect(c, dx, dy, 50, 80, '#3a2a1f');
      for (var p = 1; p < 5; p++) line(c, dx + p * 10, dy, dx + p * 10, dy + 80, 'rgba(0,0,0,0.3)', 0.6);
      rect(c, dx - 4, dy + 36, 58, 7, '#5a4330'); rect(c, dx - 4, dy + 36, 58, 2, '#6e563e');
      rect(c, dx - 6, dy + 33, 5, 13, '#1c1d22'); rect(c, dx + 49, dy + 33, 5, 13, '#1c1d22');
    }
    // barrels
    function barrel(x, y) {
      ell(c, x, y, 11, 15, '#3a2a1e'); rect(c, x - 11, y - 9, 22, 1.6, '#1c1d22'); rect(c, x - 11, y + 7, 22, 1.6, '#1c1d22');
      ell(c, x - 3, y - 2, 3, 10, 'rgba(255,220,180,0.06)');
    }
    barrel(84, 186); barrel(104, 190);
    // workbench + slate + dead lantern
    rect(c, 124, 160, 70, 5, '#4a3628'); rect(c, 128, 165, 3, 26, '#2e2018'); rect(c, 188, 165, 3, 26, '#2e2018');
    rect(c, 134, 136, 30, 22, '#2b2e33'); rect(c, 135.5, 137.5, 27, 19, '#22252a');
    for (var ln = 0; ln < 4; ln++) { line(c, 138, 141 + ln * 4, 152 - (ln % 2) * 4, 141 + ln * 4, 'rgba(230,230,220,0.5)', 0.6); circ(c, 156, 141 + ln * 4, 0.8, 'rgba(230,230,220,0.5)'); }
    rect(c, 172, 146, 10, 14, '#2a2b30'); rect(c, 174, 148, 6, 9, '#3a3d44'); rect(c, 175, 142, 4, 4, '#2a2b30');
    // trapdoor
    poly(c, [130, 214, 196, 214, 204, 232, 122, 232], '#0a0b0e');
    if (st.dispTide > 1.2) for (var w = 0; w < 6; w++) line(c, 134 + w * 10 + Math.sin(t * 2 + w) * 3, 220 + (w % 3) * 4, 140 + w * 10 + Math.sin(t * 2 + w) * 3, 220 + (w % 3) * 4, 'rgba(110,150,220,0.4)', 0.6);
    poly(c, [130, 214, 196, 214, 194, 200, 132, 200], '#3a2a1e');
    for (var pl = 1; pl < 5; pl++) line(c, 132 + pl * 12.4, 200, 130 + pl * 13.2, 214, 'rgba(0,0,0,0.4)', 0.5);
    vignette(c, 0.7);
  };

  S.lamp = function (c, st, t, fx) {
    rect(c, 0, 0, W, H, '#0a0d16');
    // the windows: night sea
    sky(c, 140, [[0, '#070b18'], [1, '#1a2848']]);
    stars(c, t, 14, 70, 110);
    sea(c, 122, 172, t, 8, null);
    ship(c, 160, 121, 0.9, t, shipCol(st, t, fx), true);
    // mullions
    for (var m = 0; m < 4; m++) rect(c, m * 106 - 6, 0, 12, 172, '#1a1712');
    rect(c, 0, 0, W, 10, '#1a1712'); rect(c, 0, 92, W, 4, 'rgba(26,23,18,0.8)');
    // the lens
    var lit = st.f.lampLit, lcx = 160, top = 26, bot = 170, lw = 80, lcy = 98;
    var sendCol = fx && fx.seq && t >= fx.t0 && t < fx.t0 + seqDuration(fx.seq) ? blink(fx.seq, t - fx.t0, { pause: 999 }) : null;
    var lampCol = sendCol || (lit ? '#ffcf70' : null);
    if (lampCol) glow(c, lcx, lcy, 110, lampCol, sendCol ? 0.5 : 0.28);
    c.save();
    c.beginPath(); c.ellipse(lcx, lcy, lw / 2, (bot - top) / 2, 0, 0, Math.PI * 2); c.clip();
    vgrad(c, lcx - lw / 2, top, lw, bot - top, [[0, 'rgba(120,170,170,0.25)'], [0.5, 'rgba(60,100,110,0.18)'], [1, 'rgba(120,170,170,0.25)']]);
    for (var ring = 0; ring < 13; ring++) {
      var ry = top + 6 + ring * 12.4;
      c.beginPath(); c.ellipse(lcx, ry, lw / 2 - 2, 3.4, 0, 0, Math.PI);
      c.strokeStyle = 'rgba(200,235,235,' + (0.16 + (ring % 3) * 0.06) + ')'; c.lineWidth = 1; c.stroke();
    }
    for (var vb = -2; vb <= 2; vb++) line(c, lcx + vb * 17, top, lcx + vb * 17, bot, 'rgba(180,140,60,0.5)', 1.2);
    c.beginPath(); c.arc(lcx, lcy, 18, 0, 6.283); c.fillStyle = 'rgba(200,240,240,0.12)'; c.fill();
    c.beginPath(); c.arc(lcx, lcy, 10, 0, 6.283); c.fillStyle = 'rgba(220,250,250,0.12)'; c.fill();
    if (lampCol) { glow(c, lcx, lcy, 40, lampCol, sendCol ? 0.95 : 0.7); circ(c, lcx, lcy, 5, sendCol ? lampCol : '#fff2cf'); }
    poly(c, [lcx - 30, top + 20, lcx - 18, top + 10, lcx - 26, bot - 30, lcx - 36, bot - 40], 'rgba(255,255,255,0.08)');
    c.restore();
    c.beginPath(); c.ellipse(lcx, lcy, lw / 2, (bot - top) / 2, 0, 0, Math.PI * 2); c.strokeStyle = P.brass; c.lineWidth = 2; c.stroke();
    rect(c, lcx - 50, top - 6, 100, 6, P.brassDk); rect(c, lcx - 50, bot - 2, 100, 8, P.brassDk);
    // the panel
    vgrad(c, 0, 172, W, 68, [[0, '#2b2114'], [1, '#17110a']]);
    rect(c, 70, 178, 180, 22, P.brassDk); rect(c, 72, 180, 176, 18, '#7a5a26');
    var seq = (st.seq || '').replace(/ /g, '');
    for (var sl = 0; sl < 8; sl++) {
      var sx = 86 + sl * 19;
      circ(c, sx, 189, 6, '#2a1d0c');
      var g = seq[sl];
      if (g) { circ(c, sx, 189, 4.6, GLYPH_COL[g]); glow(c, sx, 189, 8, GLYPH_COL[g], 0.3); }
    }
    rect(c, 262, 166, 5, 34, '#3a2c18'); circ(c, 264.5, 166, 4.2, '#7a1d12');
    vignette(c, 0.55);
  };

  S.ending = function (c, st, t) {
    sky(c, 150, [[0, '#0a1024'], [0.7, '#1d2a52'], [1, '#3a3a5e']]);
    stars(c, t, 21, 120, 130);
    moon(c, 60, 40, 11);
    ridge(c, [150, 120, 180, 104, 210, 96, 240, 84, 270, 80, 300, 86, 320, 90], 170, P.land2);
    lighthouse(c, 268, 83, 58, 11, true, t, true);
    sea(c, 116, H, t, 11, 60);
    // the Ballast alongside the jetty
    var sx = 120, sy = 172;
    poly(c, [sx - 70, sy, sx + 40, sy - 4, sx + 30, sy + 14, sx - 64, sy + 16], '#07090e');
    line(c, sx - 20, sy - 2, sx - 20, sy - 70, '#07090e', 2); line(c, sx + 14, sy - 3, sx + 14, sy - 50, '#07090e', 1.6);
    line(c, sx - 20, sy - 70, sx + 38, sy - 4, 'rgba(7,9,14,0.8)', 0.6);
    poly(c, [150, 240, 188, 168, 212, 168, 236, 240], P.wood);
    for (var pl = 0; pl < 9; pl++) { var fy = 168 + pl * pl; line(c, 188 - (fy - 168) * 0.53, fy, 212 + (fy - 168) * 0.33, fy, 'rgba(15,10,6,0.5)', 0.6); }
    glow(c, sx - 10, sy - 20, 22, '#ffd27a', 0.6); circ(c, sx - 10, sy - 20, 2, '#ffd27a');
    // the words, pouring out of the hold and scattering over the island
    var letters = 'abcdefghijklmnoprstuwy';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    var r = rng(77);
    for (var i = 0; i < 160; i++) {
      var speed = 0.04 + r() * 0.05, off = r(), dir = r() * 2 - 0.6, wob = 4 + r() * 10, sz = 5 + r() * 4;
      var ph = (t * speed + off) % 1;
      var e = ph * ph * (3 - 2 * ph);
      var x = sx - 10 + dir * e * 210 + Math.sin(t * (0.8 + r()) + i) * wob * ph;
      var y = sy - 12 - e * 170 + Math.cos(t * 1.1 + i * 0.7) * wob * ph;
      var a = Math.sin(ph * Math.PI) * 0.95;
      c.font = 'italic ' + sz.toFixed(1) + 'px Georgia, serif';
      c.fillStyle = 'rgba(255,228,160,' + a.toFixed(3) + ')';
      c.fillText(letters[i % letters.length], x, y);
    }
    vignette(c, 0.45);
  };

  /* ------------------------------------------------------------ driver */
  function Renderer(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scene = 'title';
    this.state = { f: {}, tide: 3, dispTide: 3, seq: '' };
    this.fx = null;
    this.t0 = performance.now();
    this.running = false;
    this.paused = false;
    this.lastFrame = 0;
  }
  Renderer.prototype.time = function () { return (performance.now() - this.t0) / 1000; };
  Renderer.prototype.set = function (scene, st) {
    var prevTide = (this.state && this.scene === scene) ? this.state.dispTide : null;
    this.scene = scene;
    var s = Object.assign({}, st);
    s.f = Object.assign({}, st.f || {});
    s.dispTide = prevTide == null ? (st.tide || 3) : prevTide;
    this.state = s;
  };
  Renderer.prototype.flash = function (seq, reply) {
    var t = this.time();
    this.fx = { seq: seq, t0: t + 0.2, reply: reply || null, replyAt: reply ? t + 0.2 + seqDuration(seq) + 1.2 : null };
  };
  Renderer.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var r = this.canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
  };
  Renderer.prototype.draw = function () {
    var c = this.ctx, cw = this.canvas.width, ch = this.canvas.height;
    if (!cw || !ch) return;
    var st = this.state;
    var target = st.tide || 3;
    if (Math.abs(st.dispTide - target) > 0.01) st.dispTide += (target - st.dispTide) * 0.06; else st.dispTide = target;
    st.crankSpin = (st.dispTide - target) * 6;
    var scale = Math.max(cw / W, ch / H);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#05070d'; c.fillRect(0, 0, cw, ch);
    c.setTransform(scale, 0, 0, scale, (cw - W * scale) / 2, (ch - H * scale) / 2);
    var fn = S[this.scene] || S.title;
    var t = this.time();
    if (this.fx && t > (this.fx.replyAt || this.fx.t0 + seqDuration(this.fx.seq)) + 12) this.fx = null;
    fn(c, st, t, this.fx);
    grain(c);
  };
  Renderer.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    var self = this;
    function frame(now) {
      if (!self.running) return;
      requestAnimationFrame(frame);
      if (self.paused || document.hidden) return;
      if (now - self.lastFrame < 40) return; // ~25fps is plenty
      self.lastFrame = now;
      self.resize();
      self.draw();
    }
    requestAnimationFrame(frame);
  };

  root.ART = { Renderer: Renderer, GLYPH_COL: GLYPH_COL, W: W, H: H };
})(this);
