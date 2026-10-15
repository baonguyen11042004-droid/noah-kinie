// Thêm ảnh vào khung in: mỗi khung là vùng ảnh dọc 55 × 80 mm trong khung in chuyên dụng của Kinie.
// Khách chọn ảnh, kéo để chỉnh, xoay, phóng to; trình duyệt cắt sẵn đúng khung ở 300 dpi (650 × 945 px)
// rồi tải lên server. Ảnh gốc không rời máy khách.
(function () {
  var root = document.getElementById('frx');
  if (!root) return;

  var OUT_W = 650, OUT_H = 945;      // ảnh in: 55 × 80 mm ở 300 dpi
  var PREV_W = 220, PREV_H = 320;    // ảnh xem trước, cùng tỉ lệ 55 : 80
  var MAX_SIDE = 1800;               // thu nhỏ ảnh gốc khi giải mã cho nhẹ máy
  var MAX_ZOOM = 4, CACHE = 12, UPLOADS = 2;

  var uid = root.dataset.uid;
  var total = parseInt(root.dataset.frames, 10);
  var csrf = root.dataset.csrf;
  var T = JSON.parse(root.dataset.i18n);
  var grid = root.querySelector('[data-grid]');
  var input = root.querySelector('[data-file]');
  var progress = root.querySelector('[data-progress]');
  var msg = root.querySelector('[data-msg]');
  var next = document.querySelector('[data-next]');
  var base = '/gio-hang/anh/' + uid + '/';

  var fmt = function (s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); };
  var pad = function (n) { return ('00' + n).slice(-3); };

  // Trạng thái từng khung. src: File/Blob ảnh gốc, hoặc URL ảnh đã lưu trên server.
  var frames = [];
  for (var i = 0; i < total; i++) {
    frames.push({ slot: i, src: null, turn: false, fit: 'cover', zoom: 1, px: 50, py: 50, status: 'empty', dirty: false, timer: 0 });
  }
  JSON.parse(root.dataset.saved).forEach(function (s) {
    if (frames[s]) { frames[s].src = base + pad(s) + '.jpg'; frames[s].status = 'saved'; }
  });

  // ---- giải mã ảnh, giữ tối đa CACHE ảnh trong bộ nhớ ----
  var cache = new Map();
  function bitmapOf(f) {
    if (cache.has(f.slot)) {
      var hit = cache.get(f.slot);
      cache.delete(f.slot); cache.set(f.slot, hit);
      return hit;
    }
    var src = f.src;
    var p = (typeof src === 'string' ? fetch(src, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('fetch');
      return r.blob();
    }) : Promise.resolve(src)).then(function (blob) {
      return createImageBitmap(blob);
    }).then(function (bmp) {
      var long = Math.max(bmp.width, bmp.height);
      if (long <= MAX_SIDE) return bmp;
      var k = MAX_SIDE / long;
      return createImageBitmap(bmp, { resizeWidth: Math.round(bmp.width * k), resizeHeight: Math.round(bmp.height * k), resizeQuality: 'high' })
        .then(function (small) { bmp.close(); return small; });
    });
    cache.set(f.slot, p);
    p.catch(function () { cache.delete(f.slot); });
    while (cache.size > CACHE) {
      var oldest = cache.keys().next().value;
      var old = cache.get(oldest);
      cache.delete(oldest);
      old.then(function (b) { b.close(); }, function () {});
    }
    return p;
  }
  function forget(f) {
    var p = cache.get(f.slot);
    if (p) { cache.delete(f.slot); p.then(function (b) { b.close(); }, function () {}); }
  }

  // ---- vẽ: cùng một công thức cho ảnh xem trước và ảnh in ----
  function layout(f, bmp, W, H) {
    var iw = bmp.width, ih = bmp.height;
    var sw = f.turn ? ih : iw, sh = f.turn ? iw : ih;
    var s = (f.fit === 'contain' ? Math.min(W / sw, H / sh) : Math.max(W / sw, H / sh)) * f.zoom;
    var dw = sw * s, dh = sh * s;
    return { s: s, dw: dw, dh: dh, dx: (W - dw) * f.px / 100, dy: (H - dh) * f.py / 100 };
  }
  function draw(ctx, f, bmp, W, H) {
    var L = layout(f, bmp, W, H);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(L.dx + L.dw / 2, L.dy + L.dh / 2);
    if (f.turn) ctx.rotate(Math.PI / 2);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, -bmp.width * L.s / 2, -bmp.height * L.s / 2, bmp.width * L.s, bmp.height * L.s);
    ctx.restore();
  }

  // ---- giao diện từng khung ----
  function button(label, act) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'frx__b'; b.textContent = label; b.dataset.act = act;
    return b;
  }
  frames.forEach(function (f) {
    var el = document.createElement('div');
    el.className = 'fr';
    var box = document.createElement('div');
    box.className = 'fr__box';
    var cv = document.createElement('canvas');
    cv.width = PREV_W; cv.height = PREV_H;
    cv.setAttribute('aria-label', T.frame + ' ' + (f.slot + 1));
    var num = document.createElement('span');
    num.className = 'fr__n'; num.textContent = f.slot + 1;
    var st = document.createElement('span');
    st.className = 'fr__st';
    box.append(cv, num, st);
    var tools = document.createElement('div');
    tools.className = 'fr__tools';
    tools.append(button(T.rotate, 'rotate'), button(T.fit, 'fit'), button('−', 'out'), button('+', 'in'),
      button(T.replace, 'replace'), button(T.remove, 'remove'));
    tools.querySelector('[data-act=out]').title = T.zoomOut;
    tools.querySelector('[data-act=in]').title = T.zoomIn;
    el.append(box, tools);
    grid.appendChild(el);
    f.el = el; f.cv = cv; f.st = st; f.tools = tools;
    box.addEventListener('click', function () { if (!f.src) pick(f.slot); });
    tools.addEventListener('click', function (e) {
      var act = e.target.dataset && e.target.dataset.act;
      if (act) action(f, act);
    });
    enablePan(f);
  });

  function paintEmpty(f) {
    var ctx = f.cv.getContext('2d');
    ctx.clearRect(0, 0, PREV_W, PREV_H);
  }
  function paint(f) {
    if (!f.src) { paintEmpty(f); refresh(f); return Promise.resolve(); }
    return bitmapOf(f).then(function (bmp) {
      draw(f.cv.getContext('2d'), f, bmp, PREV_W, PREV_H);
      refresh(f);
    }, function () {
      f.status = 'error'; refresh(f);
    });
  }
  function refresh(f) {
    f.el.classList.toggle('is-empty', !f.src);
    f.tools.hidden = !f.src;
    f.tools.querySelector('[data-act=fit]').textContent = f.fit === 'cover' ? T.fit : T.fill;
    var label = { empty: T.empty, saving: T.saving, saved: T.saved, error: T.error }[f.status] || '';
    f.st.textContent = label;
    f.st.className = 'fr__st fr__st--' + f.status;
    updateProgress();
  }
  function updateProgress() {
    var done = frames.filter(function (f) { return f.status === 'saved'; }).length;
    progress.textContent = fmt(T.progress, { n: done, m: total });
    var ready = done === total;
    next.setAttribute('aria-disabled', ready ? 'false' : 'true');
    next.classList.toggle('is-off', !ready);
  }
  function say(text) {
    msg.textContent = text || '';
    msg.hidden = !text;
  }

  // ---- chọn ảnh: lấp các khung trống theo thứ tự, hoặc thay một khung cụ thể ----
  var target = -1;
  function pick(slot) { target = slot; input.click(); }
  root.querySelector('[data-pick]').addEventListener('click', function () { pick(-1); });
  input.addEventListener('change', function () {
    var files = Array.prototype.slice.call(input.files);
    input.value = '';
    var order = [];
    if (target >= 0) order.push(frames[target]);
    frames.forEach(function (f) { if (!f.src && order.indexOf(f) < 0) order.push(f); });
    var extra = Math.max(0, files.length - order.length);
    say(extra ? fmt(T.extra, { n: extra }) : '');
    var jobs = files.slice(0, order.length).map(function (file, k) { return [order[k], file]; });
    // Giải mã lần lượt để điện thoại không bị đầy bộ nhớ.
    jobs.reduce(function (chain, job) {
      return chain.then(function () { return place(job[0], job[1]); });
    }, Promise.resolve());
  });

  function place(f, file) {
    var prev = { src: f.src, status: f.status };
    forget(f);
    f.src = file; f.fit = 'cover'; f.zoom = 1; f.px = 50; f.py = 50;
    return bitmapOf(f).then(function (bmp) {
      f.turn = bmp.width > bmp.height; // ảnh ngang: xoay cho vừa khung dọc
      return paint(f).then(function () { save(f, 0); });
    }, function () {
      f.src = prev.src; f.status = prev.status;
      say(fmt(T.badFile, { f: file.name || '' }));
      return paint(f);
    });
  }

  function action(f, act) {
    if (act === 'replace') return pick(f.slot);
    if (act === 'remove') return removeFrame(f);
    if (act === 'rotate') f.turn = !f.turn;
    if (act === 'fit') { f.fit = f.fit === 'cover' ? 'contain' : 'cover'; f.zoom = 1; }
    if (act === 'in') f.zoom = Math.min(MAX_ZOOM, f.zoom * 1.2);
    if (act === 'out') f.zoom = Math.max(1, f.zoom / 1.2);
    paint(f).then(function () { save(f); });
  }

  // Kéo để dời ảnh trong khung (chuột hoặc ngón tay).
  function enablePan(f) {
    var start = null;
    f.cv.addEventListener('pointerdown', function (e) {
      if (!f.src) return;
      e.preventDefault();
      f.cv.setPointerCapture(e.pointerId);
      start = { x: e.clientX, y: e.clientY, px: f.px, py: f.py, L: null };
      bitmapOf(f).then(function (bmp) { if (start) start.L = layout(f, bmp, PREV_W, PREV_H); });
    });
    f.cv.addEventListener('pointermove', function (e) {
      if (!start || !start.L) return;
      var k = PREV_W / f.cv.getBoundingClientRect().width;
      var ddx = (e.clientX - start.x) * k, ddy = (e.clientY - start.y) * k;
      var spanX = PREV_W - start.L.dw, spanY = PREV_H - start.L.dh;
      if (Math.abs(spanX) > 0.5) f.px = Math.min(100, Math.max(0, start.px + ddx * 100 / spanX));
      if (Math.abs(spanY) > 0.5) f.py = Math.min(100, Math.max(0, start.py + ddy * 100 / spanY));
      paint(f);
    });
    var end = function () {
      if (!start) return;
      var moved = start.px !== f.px || start.py !== f.py;
      start = null;
      if (moved) save(f);
    };
    f.cv.addEventListener('pointerup', end);
    f.cv.addEventListener('pointercancel', end);
  }

  // ---- lưu lên server: chờ khách ngừng chỉnh một chút rồi mới cắt ảnh và tải lên ----
  var queue = [], running = 0, sessionLost = false;
  function save(f, delay) {
    f.dirty = true;
    f.status = 'saving'; refresh(f);
    clearTimeout(f.timer);
    f.timer = setTimeout(function () { if (queue.indexOf(f) < 0) queue.push(f); pump(); }, delay === undefined ? 700 : delay);
  }
  function pump() {
    while (running < UPLOADS && queue.length) upload(queue.shift());
  }
  function upload(f) {
    running++;
    f.dirty = false;
    bitmapOf(f).then(function (bmp) {
      var cv = document.createElement('canvas');
      cv.width = OUT_W; cv.height = OUT_H;
      draw(cv.getContext('2d'), f, bmp, OUT_W, OUT_H);
      return new Promise(function (res) { cv.toBlob(res, 'image/jpeg', 0.9); });
    }).then(function (blob) {
      return fetch(base + f.slot, {
        method: 'POST', credentials: 'same-origin', body: blob,
        headers: { 'Content-Type': 'image/jpeg', 'X-CSRF-Token': csrf },
      });
    }).then(function (r) {
      if (r.status === 403) { sessionLost = true; throw new Error('session'); }
      if (!r.ok) throw new Error('upload');
      if (!f.dirty) f.status = 'saved';
    }).catch(function () {
      f.status = 'error';
      if (sessionLost) say(T.session);
    }).then(function () {
      running--;
      refresh(f);
      pump();
    });
  }
  function removeFrame(f) {
    clearTimeout(f.timer);
    var i = queue.indexOf(f);
    if (i >= 0) queue.splice(i, 1);
    forget(f);
    f.src = null; f.status = 'empty'; f.dirty = false;
    paint(f);
    fetch(base + f.slot, { method: 'DELETE', credentials: 'same-origin', headers: { 'X-CSRF-Token': csrf } });
  }

  // Thử lưu lại khi bấm vào nhãn "Lưu lỗi".
  grid.addEventListener('click', function (e) {
    if (!e.target.classList.contains('fr__st--error')) return;
    var f = frames.find(function (x) { return x.st === e.target; });
    if (f && f.src) save(f, 0);
  });

  var busy = function () { return running > 0 || queue.length > 0 || frames.some(function (f) { return f.status === 'saving'; }); };
  next.addEventListener('click', function (e) {
    if (next.getAttribute('aria-disabled') === 'true' || busy()) {
      e.preventDefault();
      say(busy() ? T.leave : '');
      var first = frames.find(function (f) { return f.status !== 'saved'; });
      if (first) first.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  window.addEventListener('beforeunload', function (e) {
    if (busy()) { e.preventDefault(); e.returnValue = T.leave; }
  });

  // Vẽ khung trống trước, rồi lần lượt nạp các ảnh đã lưu.
  frames.forEach(refresh);
  frames.filter(function (f) { return f.src; }).reduce(function (chain, f) {
    return chain.then(function () { return paint(f); });
  }, Promise.resolve());
})();
