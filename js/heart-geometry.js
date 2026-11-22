(function (LH) {
  var GOLDEN_ANGLE = 2.399963;
  var DEPTH = 0.52;

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0;
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function heartOutline(t) {
    return {
      x: 16 * Math.pow(Math.sin(t), 3),
      y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    };
  }

  function scatterOffset() {
    var angle = Math.random() * Math.PI * 2;
    var distance = 1.4 + Math.random() * 1.8;
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  }

  LH.createHeartPoints = function (count, words, specialWord) {
    var pool = shuffle(words);
    var points = [];

    for (var i = 0; i < count; i++) {
      var v = Math.acos(1 - 2 * (i + 0.5) / count);
      var t = i * GOLDEN_ANGLE;
      var k = Math.sin(v);
      var o = heartOutline(t);

      points.push({
        x: k * o.x / 17,
        y: -k * (o.y + 2.5) / 17,
        z: Math.cos(v) * DEPTH,
        word: pool[i % pool.length],
        phase: Math.random() * Math.PI * 2,
        from: scatterOffset(),
        delay: Math.random(),
        special: false
      });
    }

    if (points.length) {
      points[0].special = true;
      points[0].word = specialWord;
    }

    return points;
  };
})(window.LoveHeart);