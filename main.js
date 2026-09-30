/* R&M Automotive concept. No network requests, no storage. */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  /* Header rule once scrolled */
  var head = document.querySelector('.site-head');
  if (head) {
    var onScroll = function () { head.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Open-now line from the posted hours, in shop time */
  var el = document.getElementById('status');
  if (el) {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var day = o.weekday;
      var mins = (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10);
      var weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(day) > -1;
      var t;
      if (weekday && mins >= 480 && mins < 1020) { t = 'Open now until 5PM.'; }
      else if (weekday && mins < 480) { t = 'Closed now. Opens today at 8AM.'; }
      else if (weekday && day !== 'Fri') { t = 'Closed now. Opens tomorrow at 8AM.'; }
      else if (day === 'Fri') { t = 'Closed now. Open Saturday, call for times.'; }
      else if (day === 'Sat') { t = 'Open Saturdays. Call for today\u2019s hours.'; }
      else { t = 'Closed today. Opens Monday at 8AM.'; }
      el.textContent = t;
      el.hidden = false;
    } catch (e) {}
  }

  /* Warranty odometer: each drum spins whole turns and lands on its own digit,
     so the reading is 24,000 before, after and without the animation. */
  var odo = document.querySelector('.odo');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!odo || reduce || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  var H = 1.12; /* matches --h in styles.css, in em */

  function roll() {
    var strips = odo.querySelectorAll('.strip');
    strips.forEach(function (s, i) {
      var d = parseInt(s.textContent, 10) || 0;
      var n = 10 * (i + 1);
      s.textContent = '';
      for (var k = 0; k <= n; k++) {
        var sp = document.createElement('span');
        sp.textContent = String((d + k) % 10);
        s.appendChild(sp);
      }
      var a = s.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-n * H) + 'em)' }],
        { duration: 1500 + i * 280, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
      );
      a.onfinish = function () { s.textContent = String(d); a.cancel(); };
    });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { io.disconnect(); roll(); }
    });
  }, { threshold: 0.6 });
  io.observe(odo);
});