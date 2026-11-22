(function (LH) {
  var C = LH.CONFIG;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  LH.createControls = function (canvas, hint) {
    var state = {
      ry: 0,
      rx: C.tilt.initial,
      vy: C.autoRotateSpeed,
      vx: 0,
      zoom: 1,
      targetZoom: 1,
      dragging: false
    };
    var pointers = {};
    var last = { x: 0, y: 0, time: 0 };
    var pinchDistance = 0;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setZoom(value) {
      state.targetZoom = clamp(value, C.zoom.min, C.zoom.max);
    }

    function release(e) {
      delete pointers[e.pointerId];
      pinchDistance = 0;
      if (Object.keys(pointers).length) return;

      state.dragging = false;
      canvas.classList.remove('is-dragging');
      if (performance.now() - last.time > 80) {
        state.vy = 0;
        state.vx = 0;
      }
    }

    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = [e.clientX, e.clientY];
      last.x = e.clientX;
      last.y = e.clientY;
      last.time = performance.now();
      state.dragging = true;
      canvas.classList.add('is-dragging');
      hint.classList.add('is-hidden');
    });

    canvas.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = [e.clientX, e.clientY];

      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        var a = pointers[ids[0]];
        var b = pointers[ids[1]];
        var distance = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (pinchDistance) setZoom(state.targetZoom * distance / pinchDistance);
        pinchDistance = distance;
        return;
      }

      var now = performance.now();
      var dt = Math.max(0.001, (now - last.time) / 1000);
      var dy = (e.clientX - last.x) * 0.0065;
      var dx = (e.clientY - last.y) * 0.0045;

      state.ry += dy;
      state.rx = clamp(state.rx + dx, -C.tilt.limit, C.tilt.limit);
      state.vy += (clamp(dy / dt, -10, 10) - state.vy) * 0.3;
      state.vx += (clamp(dx / dt, -10, 10) - state.vx) * 0.3;

      last.x = e.clientX;
      last.y = e.clientY;
      last.time = now;
    });

    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      setZoom(state.targetZoom * (e.deltaY > 0 ? 0.93 : 1.07));
    }, { passive: false });

    state.update = function (dt) {
      state.zoom += (state.targetZoom - state.zoom) * (1 - Math.exp(-dt * C.zoomSmoothing));
      if (state.dragging) return;

      var target = reduced ? 0 : C.autoRotateSpeed;
      state.vy += (target - state.vy) * (1 - Math.exp(-dt * C.inertiaDamping));
      state.vx *= Math.exp(-dt * 4);
      state.ry += state.vy * dt;
      state.rx = clamp(state.rx + state.vx * dt, -C.tilt.limit, C.tilt.limit);
      state.rx += (C.tilt.initial - state.rx) * (1 - Math.exp(-dt * C.tilt.returnSpeed));
    };

    return state;
  };
})(window.LoveHeart);