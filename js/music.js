(function (LH) {
  var M = (LH.CONFIG && LH.CONFIG.music) || { src: 'ily.mp3', hitSec: 5, volume: 1 };
  var audio = null;

  function unlock() {
    if (audio) return;
    try {
      audio = new Audio(M.src);
      audio.preload = 'auto';
      audio.volume = M.volume;
      audio.loop = true;
      audio.muted = true;
      var p = audio.play();
      if (p && p.catch) p.catch(function () { audio = null; });
    } catch (e) { audio = null; }
  }

  function start() {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      var p = audio.play();
      if (p && p.catch) p.catch(function () { audio = null; });
    } catch (e) { audio = null; }
  }

  function whenAtHit(callback) {
    if (!audio || audio.paused) { callback(); return; }
    var done = false;
    var guard = setTimeout(finish, (M.hitSec + 3) * 1000);

    function finish() {
      if (done) return;
      done = true;
      clearTimeout(guard);
      callback();
    }

    (function poll() {
      if (done) return;
      if (!audio || audio.currentTime >= M.hitSec) { finish(); return; }
      requestAnimationFrame(poll);
    })();
  }

  LH.music = { unlock: unlock, start: start, whenAtHit: whenAtHit, hitSec: M.hitSec };
})(window.LoveHeart = window.LoveHeart || {});