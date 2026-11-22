(function (LH) {
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  LH.createLetterView = function (letter) {
    var root = el('div', 'letter');
    var close = el('button', 'letter__close', '×');
    var paper = el('article', 'letter__paper');
    var blocks = [];

    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Письмо');
    root.setAttribute('aria-hidden', 'true');
    close.type = 'button';
    close.setAttribute('aria-label', 'Закрыть письмо');

    function add(tag, cls, text) {
      var node = el(tag, cls + ' reveal', text);
      paper.appendChild(node);
      blocks.push(node);
    }

    add('h2', 'letter__greeting', letter.greeting);
    letter.paragraphs.forEach(function (text) { add('p', 'letter__p', text); });
    add('div', 'letter__divider', '♥');
    add('p', 'letter__closing', letter.closing);
    add('p', 'letter__ps', letter.postscript);

    root.appendChild(close);
    root.appendChild(paper);
    document.body.appendChild(root);

    var observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      }, { root: paper, threshold: 0.2 });
    }

    function onKey(e) {
      if (e.key === 'Escape') closeLetter();
    }

    function open() {
      paper.scrollTop = 0;
      root.classList.add('is-open');
      root.setAttribute('aria-hidden', 'false');

      blocks.forEach(function (block) {
        block.classList.remove('is-in');
        if (observer) observer.observe(block);
        else block.classList.add('is-in');
      });

      document.addEventListener('keydown', onKey);
      close.focus({ preventScroll: true });
    }

    function closeLetter() {
      root.classList.remove('is-open');
      root.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', onKey);
    }

    close.addEventListener('click', closeLetter);
    root.addEventListener('click', function (e) {
      if (e.target === root) closeLetter();
    });

    return { open: open, close: closeLetter };
  };
})(window.LoveHeart);