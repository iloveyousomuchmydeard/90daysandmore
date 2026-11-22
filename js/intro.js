(function (LH) {
  var T = LH.CONFIG.intro;

  var LINES = [
    'Привет, любимая',
    'Я кое-что для тебя приготовил',
    'Слова, которые я готов говорить каждый день',
    'Сотни раз, на всех языках мира',
    'Смотри'
  ];

  function skipRequested() {
    return /[?&]skip(=|&|$)/.test(window.location.search);
  }

  LH.runIntro = function (onReveal) {
    var root = document.getElementById('intro');
    var text = root.querySelector('.intro__text');
    var started = false;

    if (skipRequested()) {
      root.hidden = true;
      document.body.classList.remove('is-intro');
      onReveal();
      return;
    }

    var BEGIN_DELAY = 900;
    var LEAD = BEGIN_DELAY + LINES.length * (T.fadeIn + T.hold + T.fadeOut + T.gap);

    function show(index) {
      if (index >= LINES.length) {
        LH.music.whenAtHit(reveal);
        return;
      }

      text.textContent = LINES[index];
      text.style.transitionDuration = T.fadeIn + 'ms';
      void text.offsetWidth;
      text.classList.add('is-on');

      setTimeout(function () {
        text.style.transitionDuration = T.fadeOut + 'ms';
        text.classList.remove('is-on');
        setTimeout(function () { show(index + 1); }, T.fadeOut + T.gap);
      }, T.fadeIn + T.hold);
    }

    function reveal() {
      root.classList.add('is-leaving');
      document.body.classList.remove('is-intro');
      onReveal();
      setTimeout(function () { root.hidden = true; }, T.leaveDuration);
    }

    function begin() {
      if (started) return;
      started = true;
      root.classList.add('is-started');
      LH.music.unlock();
      setTimeout(function () { show(0); }, BEGIN_DELAY);
      setTimeout(LH.music.start, Math.max(0, LEAD - LH.music.hitSec * 1000));
    }

    root.addEventListener('click', begin);
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        begin();
      }
    });
    root.focus();
  };
})(window.LoveHeart);