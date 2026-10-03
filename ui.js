/* The Last Word — DOM UI. */
(function () {
  'use strict';
  var E = window.ENGINE, G = window.GAME, ART = window.ART;

  var search = location.search || '';
  function hasParam(k) {
    try { return new URLSearchParams(search).has(k); } catch (e) { return new RegExp('[?&]' + k + '(=|&|$)').test(search); }
  }
  var NOSYNC = hasParam('nosync'), DEBUG = hasParam('debug');
  var storage = null;
  try { storage = window.localStorage; } catch (e) { storage = null; }
  var store = window.SAVE.create({ nosync: NOSYNC, storage: storage, fetch: (window.fetch && /^(192\.168\.|10\.|127\.|localhost$)/.test(location.hostname)) ? window.fetch.bind(window) : null });

  var S = null;
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function button(cls, html, onClick) {
    var b = el('button', cls, html);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  var art = new ART.Renderer($('art'));
  var ovArt = null;

  /* --------------------------------------------------------- rich text */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var GNAME = { R: 'red', A: 'amber', G: 'green', B: 'blue', W: 'white', V: 'violet' };
  function glyphs(seq) {
    seq = String(seq).trim();
    var label = seq.split(' ').map(function (w) { return w.split('').map(function (c) { return GNAME[c]; }).join('-'); }).join(', ');
    var h = '<span class="lw" role="img" aria-label="lenses: ' + label + '">';
    seq.split('').forEach(function (c) { h += c === ' ' ? '<span class="sp"></span>' : '<span class="g g' + c + '"></span>'; });
    return h + '</span>';
  }
  function gone(w) { return S ? E.isGone(S, w) : true; }
  function gapHtml(w) {
    return '<span class="gap" style="width:' + (w.length * 0.58).toFixed(2) + 'em" role="img" aria-label="a missing word, ' + w.length + ' letters"></span>';
  }
  function cased(w, before, after) {
    if (/^\s+[A-Z][A-Z]/.test(after) && !/[a-z]{2}/.test(after.slice(0, 12))) return w.toUpperCase();
    if (/(^|[.!?…]\s+|["“(]\s*|\n\s*|—\s*)$/.test(before) || before === '') return w.charAt(0).toUpperCase() + w.slice(1);
    return w;
  }
  function inline(src) {
    // handle exiled-word markers on the raw string so we can see their context
    var out = '', re = /\{([xX]):([a-z]+)\}/g, last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      var w = m[2], before = src.slice(Math.max(0, m.index - 12), m.index), after = src.slice(re.lastIndex, re.lastIndex + 14);
      var shown = esc(cased(w, before.replace(/\{[xX]:[a-z]+\}/g, 'x'), after));
      if (!gone(w)) out += '<span class="ret">' + shown + '</span>';
      else if (m[1] === 'X') out += '<span class="spoken"><span class="wt">' + shown + '</span>' + gapHtml(w) + '</span>';
      else out += gapHtml(w);
      last = re.lastIndex;
    }
    out += esc(src.slice(last));
    out = out.replace(/\[\[([RAGBWV ]+)\]\]/g, function (mm, q) { return glyphs(q); });
    out = out.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    return out;
  }
  function rich(text) {
    return String(text || '').split(/\n\n+/).map(function (p) { return '<p>' + inline(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }

  /* ------------------------------------------------------------ persist */
  var lastTick = Date.now();
  function tickTime() {
    var now = Date.now();
    if (S && !S.f.ended && !document.hidden) S.playMs += Math.min(now - lastTick, 60000);
    lastTick = now;
  }
  function persist() {
    if (!S) return;
    tickTime();
    store.save(E.serialize(S));
  }
  setInterval(function () { tickTime(); }, 10000);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { persist(); store.flush(); } else lastTick = Date.now(); });
  window.addEventListener('pagehide', function () { persist(); store.flush(); });

  /* ------------------------------------------------------------- layers */
  var layers = [], ignorePops = 0;
  function pushLayer(close) {
    layers.push(close);
    try { history.pushState({ layer: layers.length }, ''); } catch (e) { /* ignore */ }
  }
  var closing = null;
  function closeTop() {
    if (!layers.length) return;
    var top = layers[layers.length - 1];
    if (closing === top) return; // a double tap must not go back twice (and leave the page)
    closing = top;
    setTimeout(function () { if (closing === top) closing = null; }, 600);
    try { history.back(); } catch (e) { /* ignore */ }
    setTimeout(function () {
      // popstate never came: close it ourselves (only if that same layer is still on top)
      if (layers[layers.length - 1] === top) { ignorePops++; layers.pop(); top(); }
    }, 450);
  }
  window.addEventListener('popstate', function () {
    if (ignorePops > 0) { ignorePops--; return; }
    var c = layers.pop();
    if (c) c();
  });

  /* -------------------------------------------------------------- sheet */
  var sheetOpen = false;
  function openSheet(node) {
    var body = $('sheet-body');
    body.innerHTML = '';
    body.appendChild(node);
    body.scrollTop = 0;
    if (!sheetOpen) {
      sheetOpen = true;
      $('sheet').hidden = false;
      pushLayer(function () { sheetOpen = false; $('sheet').hidden = true; $('sheet-body').innerHTML = ''; render(); });
    }
  }
  $('sheet-close').addEventListener('click', closeTop);

  function textNode(text, opts) {
    opts = opts || {};
    var d = el('div', 'prose' + (opts.doc ? ' doc' : '') + (opts.speech ? ' speech' : ''), rich(text));
    return d;
  }

  /* ------------------------------------------------------------- render */
  function render() {
    if (!S) return;
    var v = E.view(S);
    $('loc-title').textContent = v.title;
    $('desc').innerHTML = rich(v.text);
    var acts = $('acts'); acts.innerHTML = '';
    if (S.f.ended) {
      $('exits').innerHTML = '';
      acts.appendChild(button('btn go', '<span class="arr">→</span><span>Back to the title</span>', function () { showTitle(); }));
      art.set(v.scene, S);
      return;
    }
    v.acts.forEach(function (a) {
      var read = !!S.seen['act:' + a.id];
      acts.appendChild(button('btn', '<span class="dot' + (read ? ' read' : '') + '"></span><span>' + esc(a.label) + '</span>', function () { doAct(a.id); }));
    });
    var ex = $('exits'); ex.innerHTML = '';
    v.exits.forEach(function (e) {
      ex.appendChild(button('btn go', '<span class="arr">→</span><span>' + esc(e.label) + '</span>', function () { doGo(e.to); }));
    });
    ex.hidden = !v.exits.length;
    art.set(v.scene, S);
    $('nb-dot').hidden = !(S.clues.length > (S.nbSeen || 0));
  }

  function doAct(id) {
    var r = E.act(S, id);
    if (r.error) { render(); return; }
    persist();
    render();
    if (r.panel) openPanel(r.panel, r.text);
    else openSheet(textNode(r.text, { doc: r.doc, speech: r.speech }));
  }
  function doGo(to) {
    var r = E.go(S, to);
    if (r.error) { render(); return; }
    persist();
    render();
    $('panel').scrollTop = 0;
  }

  /* ------------------------------------------------------------ composer */
  function composer(slots, gaps, init) {
    var toks = [];
    String(init || '').toUpperCase().split('').forEach(function (c) {
      if (c === ' ' && gaps) { if (toks.length && toks[toks.length - 1] !== ' ') toks.push(' '); }
      else if (E.GLYPHS.indexOf(c) >= 0) toks.push(c);
    });
    toks = toks.slice(0, slots);
    var wrap = el('div', 'composer');
    var slotRow = el('div', 'slots');
    slotRow.setAttribute('aria-label', 'lens slots');
    wrap.appendChild(slotRow);
    var grid = el('div', 'lenses');
    'RAGBWV'.split('').forEach(function (g) {
      var b = button('lens', '<span class="g g' + g + '"></span><span>' + GNAME[g] + '</span>', function () {
        if (toks.length < slots) { toks.push(g); draw(); }
      });
      b.setAttribute('aria-label', GNAME[g] + ' lens');
      grid.appendChild(b);
    });
    wrap.appendChild(grid);
    var ctl = el('div', 'ctlrow');
    if (gaps) ctl.appendChild(button('btn', 'Gap', function () {
      if (toks.length && toks[toks.length - 1] !== ' ' && toks.length < slots - 1) { toks.push(' '); draw(); }
    }));
    ctl.appendChild(button('btn', '⌫ Undo', function () { toks.pop(); draw(); }));
    ctl.appendChild(button('btn', 'Clear', function () { toks = []; draw(); }));
    wrap.appendChild(ctl);
    function draw() {
      slotRow.innerHTML = '';
      toks.forEach(function (t) {
        slotRow.appendChild(t === ' ' ? el('span', 'slot gapslot') : el('span', 'slot filled', '<span class="g g' + t + '"></span>'));
      });
      for (var i = toks.length; i < slots; i++) slotRow.appendChild(el('span', 'slot'));
    }
    draw();
    return {
      el: wrap,
      value: function () { var t = toks.slice(); while (t.length && t[t.length - 1] === ' ') t.pop(); return t.join(''); }
    };
  }

  /* -------------------------------------------------------------- panels */
  function openPanel(p, introText) {
    var box = el('div', '');
    if (introText) box.appendChild(textNode(introText));
    var fb = el('div', 'feedback prose');
    function feedback(text, extraCls) {
      fb.className = 'feedback prose' + (extraCls ? ' ' + extraCls : '');
      fb.innerHTML = rich(text);
      setTimeout(function () { try { fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { fb.scrollIntoView(false); } }, 30);
    }

    if (p.type === 'compose') {
      var comp = composer(p.slots, false, '');
      box.appendChild(comp.el);
      var act = el('div', 'actrow');
      act.appendChild(button('btn primary', 'Set the lenses', function () {
        var r = E.submit(S, 'cottage', comp.value());
        persist();
        if (r.error) return;
        if (r.close) { openSheet(textNode(r.text)); return; }
        feedback(r.text, 'bad');
      }));
      box.appendChild(act);
      box.appendChild(fb);
    }

    if (p.type === 'tide') {
      var row = el('div', 'notches');
      var buttons = [];
      for (var n = 1; n <= 5; n++) (function (n) {
        var b = button('notch' + (S.tide === n ? ' on' : ''), G.ROMAN[n], function () {
          var r = E.submit(S, 'tide', n);
          persist();
          buttons.forEach(function (bb, i) { bb.className = 'notch' + (S.tide === i + 1 ? ' on' : ''); });
          feedback(r.text);
          art.set(E.view(S).scene, S);
        });
        b.setAttribute('aria-label', 'notch ' + n);
        buttons.push(b); row.appendChild(b);
      })(n);
      box.appendChild(row);
      box.appendChild(fb);
    }

    if (p.type === 'letters') {
      var letters = 'AAAAA'.slice(0, p.n).split(''), sel = 0;
      var wheels = el('div', 'wheels');
      var picker = el('div', 'lenses');
      picker.style.gridTemplateColumns = 'repeat(7, 1fr)';
      var cells = [];
      function drawWheels() {
        wheels.innerHTML = '';
        letters.forEach(function (L, i) {
          var w = el('div', 'wheel');
          w.appendChild(button('', '▲', function () { letters[i] = String.fromCharCode((letters[i].charCodeAt(0) - 65 + 25) % 26 + 65); sel = i; drawWheels(); }));
          var face = button('letter', L, function () { sel = i; drawWheels(); });
          face.setAttribute('aria-label', 'wheel ' + (i + 1) + ': ' + L);
          if (i === sel) face.style.outline = '2px solid var(--amber)';
          w.appendChild(face);
          w.appendChild(button('', '▼', function () { letters[i] = String.fromCharCode((letters[i].charCodeAt(0) - 65 + 1) % 26 + 65); sel = i; drawWheels(); }));
          wheels.appendChild(w);
        });
      }
      for (var k = 0; k < 26; k++) (function (ch) {
        var b = button('lens', '<span style="font-size:20px;font-family:var(--serif);color:var(--ink)">' + ch + '</span>', function () {
          letters[sel] = ch; sel = Math.min(letters.length - 1, sel + 1); drawWheels();
        });
        b.style.height = '48px';
        b.setAttribute('aria-label', 'set wheel to ' + ch);
        cells.push(b); picker.appendChild(b);
      })(String.fromCharCode(65 + k));
      drawWheels();
      box.appendChild(wheels);
      var hint = el('p', 'small-print', 'Turn the wheels, or pick a wheel and tap letters.');
      hint.style.textAlign = 'center';
      box.appendChild(hint);
      box.appendChild(picker);
      var act2 = el('div', 'actrow');
      act2.appendChild(button('btn primary', 'Try the doors', function () {
        var r = E.submit(S, 'letters', letters.join(''));
        persist();
        if (r.error) return;
        if (r.close) { openSheet(textNode(r.text)); return; }
        feedback(r.text, 'bad');
      }));
      box.appendChild(act2);
      box.appendChild(fb);
    }

    if (p.type === 'index') {
      buildIndex(box, null);
      openSheet(box);
      return;
    }

    if (p.type === 'lamp') {
      box.appendChild(el('div', 'label', 'Turn the lamp to face'));
      var aims = el('div', 'aims'), aimBtns = {};
      Object.keys(G.AIMS).forEach(function (k) {
        var parts = G.AIMS[k].split(' — ');
        var b = button('aim' + (S.aim === k ? ' on' : ''), '<b>' + esc(parts[0]) + '</b><br>' + esc(parts[1]), function () {
          var r = E.submit(S, 'aim', k);
          persist();
          Object.keys(aimBtns).forEach(function (kk) { aimBtns[kk].className = 'aim' + (S.aim === kk ? ' on' : ''); });
          feedback(r.text);
        });
        aimBtns[k] = b; aims.appendChild(b);
      });
      box.appendChild(aims);
      box.appendChild(el('div', 'label', 'Lens slots'));
      var comp2 = composer(p.slots, true, S.seq);
      box.appendChild(comp2.el);
      var act3 = el('div', 'actrow');
      var flashBtn = button('btn primary', 'Pull the lever — FLASH', function () {
        var seq = comp2.value();
        var r = E.submit(S, 'flash', seq);
        persist();
        if (r.error) return;
        if (S.f.lampLit && E.compact(seq)) art.flash(E.tidy(seq), r.reply || null);
        if (r.ending) {
          flashBtn.disabled = true;
          feedback(`The shutters clack. The beam goes out over the water, spelling [[${E.tidy(seq)}]]…`);
          setTimeout(function () { showEnding(); }, 3200);
          return;
        }
        feedback(r.text);
        art.set('lamp', S);
      });
      act3.appendChild(flashBtn);
      box.appendChild(act3);
      box.appendChild(fb);
    }
    openSheet(box);
  }

  /* -------------------------------------------------------------- index */
  function snippet(e) {
    var t = e[3].replace(/\[\[[^\]]*\]\]/g, '…').replace(/\{[xX]:([a-z]+)\}/g, function (m, w) { return gone(w) ? '▬▬' : w; });
    return t.length > 90 ? t.slice(0, 88).replace(/\s+\S*$/, '') + '…' : t;
  }
  function buildIndex(box, last) {
    box.innerHTML = '';
    box.appendChild(textNode(`The Index wheezes awake. A brass plate explains: *Type a word. Every entry in the Keeper's log that holds it will be found, oldest first. Only the first five are shown.*`));
    var row = el('form', 'searchrow');
    var input = el('input');
    input.type = 'search'; input.placeholder = 'a word…'; input.setAttribute('aria-label', 'word to search for');
    input.autocomplete = 'off'; input.setAttribute('autocapitalize', 'off'); input.setAttribute('autocorrect', 'off'); input.spellcheck = false;
    input.setAttribute('enterkeyhint', 'search');
    if (last) input.value = last.q;
    var go = el('button', 'btn primary', 'Search'); go.type = 'submit';
    row.appendChild(input); row.appendChild(go);
    box.appendChild(row);
    var res = el('div', '');
    box.appendChild(res);
    row.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var r = E.search(S, input.value);
      persist();
      input.blur();
      showResults(res, r);
    });
    if (last) showResults(res, last);
    else if (S.searches.length) {
      var rec = el('div', 'recent', 'Recent: ');
      var uniq = [];
      for (var i = S.searches.length - 1; i >= 0 && uniq.length < 8; i--) if (uniq.indexOf(S.searches[i]) < 0) uniq.push(S.searches[i]);
      uniq.forEach(function (q) {
        rec.appendChild(button('', esc(q), function () { input.value = q; row.requestSubmit ? row.requestSubmit() : row.dispatchEvent(new Event('submit', { cancelable: true })); }));
      });
      box.appendChild(rec);
    } else {
      var tip = el('p', 'small-print', 'Try a word you have come across — a name, a place, a thing.');
      box.appendChild(tip);
    }
  }
  function showResults(res, r) {
    res.innerHTML = '';
    if (r.error) return;
    if (r.status === 'empty') { res.appendChild(el('div', 'rescount', 'The Index waits for a word.')); return; }
    if (r.status === 'exiled') {
      res.appendChild(textNode(`The Index whirs, clanks, and spits out a blank card stamped: *WORD NOT HELD — EXILED UNDER THE THRIFT.*`));
      return;
    }
    if (r.status === 'none') { res.appendChild(el('div', 'rescount', 'Nothing. The Index holds no entry with “' + esc(r.q) + '”.')); return; }
    res.appendChild(el('div', 'rescount', r.total + (r.total === 1 ? ' entry holds' : ' entries hold') + ' “' + esc(r.q) + '”.' + (r.total > 5 ? ' The Index shows the first five.' : '')));
    var list = el('div', 'results');
    r.results.forEach(function (id) {
      var e = E.entry(id), unread = S.read.indexOf(id) < 0;
      list.appendChild(button('card' + (unread ? ' unread' : ''), '<span class="date">' + esc(e[1]) + (unread ? ' · new' : '') + '</span><span class="snip">' + esc(snippet(e)) + '</span>', function () {
        openEntry(id, r);
      }));
    });
    res.appendChild(list);
  }
  function entryNode(e) {
    var d = el('div', 'doc prose');
    d.appendChild(el('div', 'entryhead', esc(e[1]) + ' · ' + esc(e[2])));
    d.insertAdjacentHTML('beforeend', rich(e[3]));
    return d;
  }
  function openEntry(id, back) {
    var r = E.readEntry(S, id);
    if (r.error) return;
    persist();
    var box = el('div', '');
    box.appendChild(entryNode(r.entry));
    var b = button('btn', '← Back to the Index', function () { var bx = el('div', ''); buildIndex(bx, back); openSheet(bx); });
    b.style.marginTop = '14px';
    box.appendChild(b);
    openSheet(box);
    render();
  }

  /* ------------------------------------------------------------ overlays */
  function showOverlay(node, opts) {
    opts = opts || {};
    var ov = $('overlay');
    ov.innerHTML = '';
    ov.appendChild(node);
    ov.hidden = false;
    ov.scrollTop = 0;
    art.paused = true;
    if (opts.layer) {
      pushLayer(function () { hideOverlay(); });
    }
  }
  function hideOverlay() {
    var ov = $('overlay');
    ov.hidden = true; ov.innerHTML = '';
    if (ovArt) { ovArt.running = false; ovArt = null; }
    art.paused = false;
    render();
  }
  function overlayCanvas(scene, st) {
    var cv = el('canvas');
    cv.setAttribute('aria-hidden', 'true');
    if (ovArt) ovArt.running = false;
    ovArt = new ART.Renderer(cv);
    ovArt.set(scene, st);
    ovArt.start();
    return cv;
  }

  function showTitle(opts) {
    opts = opts || {};
    var wrap = el('div', 'ovwrap title-screen');
    wrap.appendChild(overlayCanvas('title', { f: {}, tide: 3, lit: S && S.f.ended }));
    var body = el('div', 'tbody');
    body.appendChild(el('h1', '', 'The Last Word'));
    body.appendChild(el('p', 'sub', 'a mystery for one evening'));
    if (S) {
      body.appendChild(button('btn primary', S.f.ended ? 'Read the ending again' : 'Continue', function () {
        if (S.f.ended) showEnding(); else { hideOverlay(); render(); }
      }));
      var again = button('btn', 'Begin again', function () {
        if (again.dataset.armed) { begin(); return; }
        again.dataset.armed = '1';
        again.innerHTML = 'Tap again to erase your progress and begin again';
      });
      again.style.justifyContent = 'center';
      body.appendChild(again);
    } else if (opts.waiting) {
      var w = button('btn primary', 'Looking for a saved game…', function () {});
      w.disabled = true;
      body.appendChild(w);
    } else {
      body.appendChild(button('btn primary', 'Begin', begin));
    }
    body.appendChild(el('p', 'small-print', 'Best with sound off and the lights low. Progress saves itself.'));
    wrap.appendChild(body);
    showOverlay(wrap);
  }

  function begin() {
    layers = []; sheetOpen = false; $('sheet').hidden = true;
    S = E.newState();
    persist();
    showIntro();
  }
  function showIntro() {
    var wrap = el('div', 'ovwrap');
    var body = el('div', 'intro prose');
    G.INTRO.forEach(function (p, i) { var pe = el('p', '', inline(p)); pe.style.animationDelay = (i * 0.9) + 's'; body.appendChild(pe); });
    var b = button('btn primary', 'Row ashore', function () { hideOverlay(); render(); });
    b.style.marginTop = '20px';
    b.style.animation = 'fadeUp 0.8s ease-out ' + (G.INTRO.length * 0.9) + 's both';
    body.appendChild(b);
    wrap.appendChild(body);
    showOverlay(wrap);
  }

  /* ------------------------------------------------------------ notebook */
  var nbTab = 'notes';
  function showNotebook() {
    if (!S) return;
    S.nbSeen = S.clues.length;
    persist();
    var wrap = el('div', 'ovwrap');
    var head = el('div', 'ovhead');
    head.appendChild(el('h2', '', 'Notebook'));
    head.appendChild(button('x', '×', closeTop)).setAttribute('aria-label', 'Close notebook');
    wrap.appendChild(head);
    var tabs = el('div', 'tabs');
    var body = el('div', 'ovbody');
    var T = [['notes', 'Notes'], ['lumen', 'Lenses'], ['log', 'Log'], ['nudge', 'Nudge']];
    T.forEach(function (t) {
      tabs.appendChild(button('tab' + (nbTab === t[0] ? ' on' : ''), t[1], function () { nbTab = t[0]; drawTab(); }));
    });
    wrap.appendChild(tabs); wrap.appendChild(body);
    function drawTab() {
      Array.prototype.forEach.call(tabs.children, function (b, i) { b.className = 'tab' + (T[i][0] === nbTab ? ' on' : ''); });
      body.innerHTML = '';
      if (nbTab === 'notes') {
        if (!S.clues.length) body.appendChild(el('p', 'empty', 'Nothing yet. Things worth remembering will be written here.'));
        S.clues.forEach(function (c) { body.appendChild(el('div', 'note prose', inline(G.CLUES[c]))); });
      }
      if (nbTab === 'lumen') {
        var words = Object.keys(S.lumen).sort(function (a, b) { return a.length - b.length || ('RAGBWV'.indexOf(a[0]) - 'RAGBWV'.indexOf(b[0])) || (a < b ? -1 : 1); });
        body.appendChild(el('p', 'small-print', 'Every lens-word you have seen, and where. The space beneath each is yours.'));
        if (!words.length) body.appendChild(el('p', 'empty', 'No lenses seen yet.'));
        words.forEach(function (w) {
          var row = el('div', 'lexrow');
          row.insertAdjacentHTML('beforeend', glyphs(w));
          var ul = el('ul');
          S.lumen[w].src.forEach(function (s) { ul.appendChild(el('li', '', esc(s))); });
          row.appendChild(ul);
          var inp = el('input');
          inp.type = 'text'; inp.placeholder = 'your guess…'; inp.value = S.guesses[w] || '';
          inp.setAttribute('aria-label', 'your guess for this lens-word'); inp.setAttribute('autocapitalize', 'off');
          inp.addEventListener('input', function () { S.guesses[w] = inp.value.slice(0, 80); persist(); });
          row.appendChild(inp);
          body.appendChild(row);
        });
      }
      if (nbTab === 'log') {
        if (!S.read.length) body.appendChild(el('p', 'empty', 'No log entries read yet.'));
        var ids = S.read.slice().sort();
        ids.forEach(function (id) { var e = E.entry(id); var n = entryNode(e); n.classList.add('logentry'); body.appendChild(n); });
      }
      if (nbTab === 'nudge') {
        body.appendChild(el('div', 'prose', rich('A nudge, not an answer. Only look if you have been going round in circles.')));
        var out = el('div', 'prose speech');
        out.style.marginTop = '14px';
        var b = button('btn', 'Show a nudge', function () { out.innerHTML = rich(E.nudge(S)); b.remove(); });
        b.style.justifyContent = 'center';
        body.appendChild(b);
        body.appendChild(out);
      }
      $('overlay').scrollTop = 0;
    }
    drawTab();
    showOverlay(wrap, { layer: true });
  }
  $('btn-notebook').addEventListener('click', function () { if (!layers.length || sheetOpen) showNotebook(); });

  /* ---------------------------------------------------------------- menu */
  function showMenu() {
    var wrap = el('div', 'ovwrap menu');
    var head = el('div', 'ovhead');
    head.appendChild(el('h2', '', 'The Last Word'));
    head.appendChild(button('x', '×', closeTop)).setAttribute('aria-label', 'Close menu');
    wrap.appendChild(head);
    var body = el('div', 'ovbody');
    body.appendChild(el('div', 'prose', rich(`Tap what you want to look at; tap an arrow to go somewhere. Things you haven't looked at yet have a small amber dot.\n\nYour notebook keeps what you've learned, every lens-word you've seen, and the log entries you've read. There is no way to lose and nothing to hurry. Progress saves itself.`)));
    var large = document.documentElement.classList.contains('large');
    var tb = button('btn', large ? 'Text size: large (tap for normal)' : 'Text size: normal (tap for large)', function () {
      var on = document.documentElement.classList.toggle('large');
      try { localStorage.setItem('oneEvening.textLarge', on ? '1' : ''); } catch (e) { /* ignore */ }
      tb.textContent = on ? 'Text size: large (tap for normal)' : 'Text size: normal (tap for large)';
    });
    body.appendChild(tb);
    var rs = button('btn', 'Begin again from the start', function () {
      if (rs.dataset.armed) { layers = []; sheetOpen = false; $('sheet').hidden = true; S = E.newState(); persist(); hideOverlay(); showIntro(); return; }
      rs.dataset.armed = '1'; rs.textContent = 'Tap again to erase all progress';
    });
    body.appendChild(rs);
    if (DEBUG) body.appendChild(debugPanel());
    wrap.appendChild(body);
    showOverlay(wrap, { layer: true });
  }
  $('btn-menu').addEventListener('click', function () { if (!layers.length || sheetOpen) showMenu(); });
  try { if (localStorage.getItem('oneEvening.textLarge')) document.documentElement.classList.add('large'); } catch (e) { /* ignore */ }

  function debugPanel() {
    var d = el('div', 'dbg');
    d.appendChild(el('p', '', '<b>debug</b> — save key: ' + esc(store.key)));
    Object.keys(G.LOC).forEach(function (l) { d.appendChild(button('btn small', l, function () { S.loc = l; persist(); closeTop(); })); });
    d.appendChild(el('br'));
    [1, 2, 3, 4, 5].forEach(function (n) { d.appendChild(button('btn small', 'tide ' + n, function () { S.tide = n; persist(); })); });
    d.appendChild(el('br'));
    ['cottageOpen', 'hallOpen', 'unbarred', 'lampLit', 'jarOpened'].forEach(function (f) {
      d.appendChild(button('btn small', f, function () { S.f[f] = !S.f[f]; persist(); this.textContent = f + '=' + !!S.f[f]; }));
    });
    return d;
  }

  /* -------------------------------------------------------------- ending */
  function showEnding() {
    layers = [];
    sheetOpen = false; $('sheet').hidden = true;
    persist();
    var wrap = el('div', 'ovwrap title-screen ending');
    wrap.appendChild(overlayCanvas('ending', S));
    var body = el('div', 'tbody prose');
    wrap.appendChild(body);
    var i = 0;
    var next = button('btn primary', 'Continue', step);
    function step() {
      if (i < G.ENDING.length) {
        var p = el('p', '', inline(G.ENDING[i]));
        body.insertBefore(p, next);
        i++;
        if (i === G.ENDING.length) { next.remove(); finale(); }
        else p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
    function finale() {
      body.appendChild(el('div', 'theend', 'The End'));
      var mins = Math.round((S.playMs || 0) / 60000);
      var hm = Math.floor(mins / 60) + 'h ' + ('0' + (mins % 60)).slice(-2) + 'm';
      body.appendChild(el('p', 'stats', 'Time on the island: ' + hm + ' · Index searches: ' + S.searches.length + ' · Signals sent: ' + (S.flashes || 0) + ' · Notes: ' + S.clues.length + '/' + Object.keys(G.CLUES).length));
      body.appendChild(el('p', 'small-print', 'Every gap in your notebook has filled in. It is worth a look.'));
      body.appendChild(button('btn', 'Open the notebook', function () { showNotebook(); }));
      var again = button('btn', 'Begin again', function () {
        if (again.dataset.armed) { begin(); return; }
        again.dataset.armed = '1'; again.textContent = 'Tap again to erase everything and begin again';
      });
      body.appendChild(again);
      setTimeout(function () { body.lastChild.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, 50);
    }
    body.appendChild(next);
    showOverlay(wrap);
    step();
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    art.start();
    var st = E.deserialize(store.readLocal());
    if (st) { S = st; render(); showTitle(); return; }
    if (NOSYNC) { showTitle(); return; }
    // No local save: wait (briefly) for a server backup before offering a fresh start,
    // so a quick tap on Begin can't overwrite it.
    showTitle({ waiting: true });
    store.loadRemote(function (txt) {
      var r = E.deserialize(txt);
      if (r && !S) { S = r; store.save(E.serialize(S)); render(); }
      showTitle();
    }, 2500);
  }
  window.addEventListener('resize', function () { art.resize(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && layers.length) closeTop(); });
  if (DEBUG) window.__lastword = { get S() { return S; }, E: E, render: render };
  boot();
})();
