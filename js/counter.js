(function (LH) {
  var C = LH.CONFIG;

  var UNITS = [
    { key: 'months',  forms: ['месяц', 'месяца', 'месяцев'],   pad: false },
    { key: 'days',    forms: ['день', 'дня', 'дней'],          pad: false },
    { key: 'hours',   forms: ['час', 'часа', 'часов'],         pad: true },
    { key: 'minutes', forms: ['минута', 'минуты', 'минут'],    pad: true },
    { key: 'seconds', forms: ['секунда', 'секунды', 'секунд'], pad: true }
  ];

  function plural(n, forms) {
    var m10 = n % 10;
    var m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return forms[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
    return forms[2];
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function addMonths(d, n) {
    return new Date(d.getFullYear(), d.getMonth() + n, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  }

  function elapsed(start, now) {
    if (now < start) return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

    var months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
    var anchor = addMonths(start, months);
    if (anchor > now) {
      months--;
      anchor = addMonths(start, months);
    }

    var rest = Math.floor((now - anchor) / 1000);
    return {
      months: months,
      days: Math.floor(rest / 86400),
      hours: Math.floor(rest % 86400 / 3600),
      minutes: Math.floor(rest % 3600 / 60),
      seconds: rest % 60
    };
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  LH.createCounter = function (root) {
    var start = new Date(C.startDate.year, C.startDate.month - 1, C.startDate.day, 0, 0, 0);
    var row = el('div', 'counter__row');

    var cells = UNITS.map(function (unit) {
      var cell = el('div', 'counter__cell');
      var num = el('span', 'counter__num', '0');
      var label = el('span', 'counter__label');
      cell.appendChild(num);
      cell.appendChild(label);
      row.appendChild(cell);
      return { unit: unit, num: num, label: label };
    });

    root.appendChild(el('div', 'counter__title', 'Мы вместе'));
    root.appendChild(row);

    function render() {
      var e = elapsed(start, new Date());

      cells.forEach(function (c) {
        var value = e[c.unit.key];
        var text = c.unit.pad ? pad(value) : String(value);
        var label = plural(value, c.unit.forms);

        if (c.num.textContent !== text) c.num.textContent = text;
        if (c.label.textContent !== label) c.label.textContent = label;
      });
    }

    render();
    setInterval(render, 1000);

    return {
      show: function () { root.classList.add('is-visible'); }
    };
  };
})(window.LoveHeart);