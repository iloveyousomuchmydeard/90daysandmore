(function (LH) {
  var C = LH.CONFIG;
  var canvas = document.getElementById('scene');
  var hint = document.getElementById('hint');
  var counterRoot = document.getElementById('counter');

  var count = Math.min(C.maxPoints, Math.round(window.innerWidth * window.innerHeight / C.pixelsPerPoint) + C.basePoints);
  var points = LH.createHeartPoints(count, LH.LANGUAGES, C.specialWord);
  var controls = LH.createControls(canvas, hint);
  var renderer = LH.createRenderer(canvas, points, controls);
  var counter = LH.createCounter(counterRoot);
  var letter = LH.createLetterView(LH.LETTER);

  var previous = null;
  var tap = null;
  var letterOpened = false;

  function openLetter() {
    letterOpened = true;
    hint.classList.add('is-hidden');
    letter.open();
  }

  function offerSecret() {
    if (letterOpened) return;
    hint.classList.add('is-hidden');
    setTimeout(function () {
      if (letterOpened) return;
      hint.textContent = 'Одно слово здесь особенное — найди его';
      hint.classList.remove('is-hidden');
    }, 1700);
  }

  function reveal() {
    renderer.start();
    setTimeout(counter.show, 2600);
    setTimeout(function () { hint.classList.remove('is-hidden'); }, 3800);
    setTimeout(offerSecret, C.specialHintDelay * 1000);
  }

  canvas.addEventListener('pointerdown', function (e) {
    tap = { x: e.clientX, y: e.clientY, time: performance.now() };
  });

  canvas.addEventListener('pointerup', function (e) {
    if (!tap) return;
    var moved = Math.hypot(e.clientX - tap.x, e.clientY - tap.y);
    var quick = performance.now() - tap.time < 450;
    tap = null;

    if (moved < 8 && quick && renderer.hitTest(e.clientX, e.clientY)) openLetter();
  });

  canvas.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    canvas.classList.toggle('is-link', renderer.hitTest(e.clientX, e.clientY));
  });

  function frame(ms) {
    var dt = previous === null ? 0.016 : Math.min(0.05, (ms - previous) / 1000);
    previous = ms;

    controls.update(dt);
    renderer.draw(ms, dt);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  LH.runIntro(reveal);
})(window.LoveHeart);