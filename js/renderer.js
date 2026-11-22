(function (LH) {
  var C = LH.CONFIG;
  var TAU = Math.PI * 2;
  var FONT = 'Inter, system-ui, "Noto Sans", "Segoe UI", sans-serif';

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function ease(x) { return 1 - Math.pow(1 - clamp01(x), 3); }

  function createDust() {
    var dust = [];
    for (var i = 0; i < C.dustCount; i++) {
      dust.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.2 + 0.3,
        speed: Math.random() * 0.04 + 0.01,
        phase: Math.random() * TAU
      });
    }
    return dust;
  }

  LH.createRenderer = function (canvas, points, controls) {
    var ctx = canvas.getContext('2d');
    var dust = createDust();
    var widths = {};
    var width = 0;
    var height = 0;
    var began = null;
    var pendingStart = false;
    var hit = null;

    points.forEach(function (p) { p.vis = 0; });

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function measure(word) {
      var w = widths[word];
      if (w === undefined) {
        ctx.font = '500 100px ' + FONT;
        w = widths[word] = ctx.measureText(word).width / 100;
      }
      return w;
    }

    function drawDust(t, dt, fadeIn) {
      ctx.fillStyle = '#ff9ab8';
      for (var i = 0; i < dust.length; i++) {
        var d = dust[i];
        d.y -= d.speed * dt;
        if (d.y < 0) d.y = 1;
        ctx.globalAlpha = (0.15 + 0.25 * Math.abs(Math.sin(t * 0.8 + d.phase))) * fadeIn;
        ctx.beginPath();
        ctx.arc(d.x * width, d.y * height, d.r, 0, TAU);
        ctx.fill();
      }
    }

    function project(radius, cx, cy, progress) {
      var s = controls;
      var cosY = Math.cos(s.ry), sinY = Math.sin(s.ry);
      var cosX = Math.cos(s.rx), sinX = Math.sin(s.rx);

      return points.map(function (p) {
        var x1 = p.x * cosY + p.z * sinY;
        var z1 = -p.x * sinY + p.z * cosY;
        var y2 = p.y * cosX - z1 * sinX;
        var z2 = p.y * sinX + z1 * cosX;
        var scale = C.camera / (C.camera - z2);
        var q = ease((progress - p.delay * 0.55) / 0.45);
        var tx = cx + x1 * radius * scale;
        var ty = cy + y2 * radius * scale;

        return {
          p: p, x: x1, y: y2, depth: z2, scale: scale, q: q,
          tx: tx, ty: ty,
          sx: tx + (1 - q) * p.from.x * radius,
          sy: ty + (1 - q) * p.from.y * radius
        };
      }).sort(function (a, b) { return a.depth - b.depth; });
    }

    function metrics(o, radius) {
      var depth = clamp01((o.depth + 0.55) / 1.1);
      var size = radius * C.fontScale * o.scale * (0.8 + 0.25 * depth) * (o.p.special ? 1.45 : 1);
      o.light = depth;
      o.size = Math.round(size * 2) / 2;
      o.w = measure(o.p.word) * size;
    }

    function resolveVisibility(items, radius, dt) {
      var fade = 1 - Math.exp(-dt * C.fadeSpeed);
      var placed = [];
      var i, j, o, r;

      for (i = 0; i < items.length; i++) {
        o = items[i];
        metrics(o, radius);
        if (!o.p.special) continue;

        var front = o.depth > 0.05;
        if (front) placed.push([o.tx, o.ty, o.w + C.wordGap * 4, o.size * 1.2 + C.wordGap * 4]);
        o.p.vis += ((front ? 1 : 0) - o.p.vis) * fade;
      }

      for (i = items.length - 1; i >= 0; i--) {
        o = items[i];
        if (o.p.special) continue;

        var w = o.w + C.wordGap;
        var h = o.size * 1.2 + C.wordGap;
        var blocked = false;

        for (j = 0; j < placed.length; j++) {
          r = placed[j];
          if (Math.abs(o.tx - r[0]) < (w + r[2]) / 2 && Math.abs(o.ty - r[1]) < (h + r[3]) / 2) {
            blocked = true;
            break;
          }
        }

        if (!blocked) placed.push([o.tx, o.ty, w, h]);
        o.p.vis += ((blocked ? 0 : 1) - o.p.vis) * fade;
      }
    }

    function drawSpecial(o, t) {
      var pulse = 0.5 + 0.5 * Math.sin(t * 2.2);

      ctx.globalAlpha = o.p.vis * o.q * (0.8 + 0.2 * pulse);
      ctx.shadowColor = 'rgba(255, 205, 140, 0.95)';
      ctx.shadowBlur = 8 + 16 * pulse;
      ctx.fillStyle = '#ffedcf';
      ctx.fillText(o.p.word, o.sx, o.sy);
      ctx.shadowBlur = 0;

      if (o.p.vis > 0.6 && o.q > 0.98) {
        hit = { x: o.sx, y: o.sy, w: o.w, h: o.size * 1.2 };
      }
    }

    function drawWords(items, t) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      hit = null;

      for (var i = 0; i < items.length; i++) {
        var o = items[i];
        if (o.p.vis < 0.02) continue;

        ctx.font = '500 ' + o.size + 'px ' + FONT;

        if (o.p.special) {
          drawSpecial(o, t);
          continue;
        }

        var wave = 0.5 + 0.5 * Math.sin(t * 1.4 + o.x * 3.4 - o.y * 2.2 + o.p.phase * 0.25);
        wave = wave * wave * wave;
        var hue = C.hue.base + C.hue.drift * Math.sin(t * 0.7 + o.p.phase) + C.hue.shimmer * wave;
        var light = 48 + 14 * o.light + 24 * wave;

        ctx.globalAlpha = o.p.vis * o.q * (0.22 + 0.78 * Math.pow(o.light, 1.3));
        ctx.fillStyle = 'hsl(' + hue.toFixed(0) + ',92%,' + light.toFixed(0) + '%)';
        ctx.fillText(o.p.word, o.sx, o.sy);
      }
      ctx.globalAlpha = 1;
    }

    function heartbeat(t) {
      var s = Math.sin(t * C.heartbeatSpeed * Math.PI) * 0.5 + 0.5;
      return Math.pow(s, 3) * C.heartbeatDepth;
    }

    function draw(ms, dt) {
      ctx.clearRect(0, 0, width, height);

      if (pendingStart) {
        began = ms;
        pendingStart = false;
      }
      if (began === null) return;

      var t = ms / 1000;
      var elapsed = (ms - began) / 1000;
      var progress = clamp01(elapsed / C.introDuration);
      var radius = Math.min(width, height * 1.05) * 0.36 * controls.zoom * (0.94 + 0.06 * ease(progress)) * (1 + heartbeat(t));

      drawDust(t, dt, ease(elapsed / 1.2));

      var items = project(radius, width / 2, height * 0.52, progress);
      resolveVisibility(items, radius, dt);
      drawWords(items, t);
    }

    function hitTest(px, py) {
      if (!hit) return false;
      var pad = 16;
      return Math.abs(px - hit.x) <= hit.w / 2 + pad && Math.abs(py - hit.y) <= hit.h / 2 + pad;
    }

    window.addEventListener('resize', resize);
    if (document.fonts) document.fonts.ready.then(function () { widths = {}; });
    resize();

    return {
      draw: draw,
      hitTest: hitTest,
      start: function () { pendingStart = true; }
    };
  };
})(window.LoveHeart);