(function () {
  'use strict';
  var doc = document.documentElement;
  var header = document.querySelector('.header');
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', function (e) { if (menu.classList.contains('is-open') && !header.contains(e.target)) setMenu(false); });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var fab = document.querySelector('.wa-float');
  var heroCta = document.querySelector('.hero-actions');
  var closing = document.getElementById('contacto');
  var footer = document.querySelector('.footer');

  if (!('IntersectionObserver' in window)) {
    doc.classList.add('no-js');
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  if (fab && heroCta) {
    var state = { pastHero: false, inClosing: false };
    var update = function () { fab.classList.toggle('is-visible', state.pastHero && !state.inClosing); };
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { state.pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; });
      update();
    }).observe(heroCta);
    var watch = [closing, footer].filter(Boolean);
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
      state.inClosing = visible.size > 0; update();
    }, { threshold: 0.15 });
    watch.forEach(function (el) { io.observe(el); });
  }

  var reveals = document.querySelectorAll('.reveal');
  var ro = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  reveals.forEach(function (el) { ro.observe(el); });

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-cta]') : null;
    if (!a) return;
    var payload = { event: 'whatsapp_click', cta_location: a.getAttribute('data-cta') };
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    if (typeof window.gtag === 'function') window.gtag('event', 'whatsapp_click', { cta_location: payload.cta_location });
    if (typeof window.fbq === 'function') window.fbq('track', 'Contact');
  });

  var slider = document.querySelector('[data-banner-slider]');
  if (slider) {
    var slides = Array.from(slider.querySelectorAll('.banner-slide'));
    var dotsWrap = slider.querySelector('.banner-dots');
    var current = 0, timer;
    function showBanner(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
      if (dotsWrap) Array.from(dotsWrap.children).forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
    }
    if (dotsWrap) slides.forEach(function (_, i) {
      var d = document.createElement('button'); d.type = 'button'; d.className = 'banner-dot' + (i === 0 ? ' is-active' : '');
      d.setAttribute('aria-label', 'Ver banner ' + (i + 1)); d.addEventListener('click', function () { showBanner(i); restart(); }); dotsWrap.appendChild(d);
    });
    var prev = slider.querySelector('.banner-prev'), next = slider.querySelector('.banner-next');
    if (prev) prev.addEventListener('click', function () { showBanner(current - 1); restart(); });
    if (next) next.addEventListener('click', function () { showBanner(current + 1); restart(); });
    function restart() { clearInterval(timer); if (slides.length > 1) timer = setInterval(function () { showBanner(current + 1); }, 6000); }
    if (slides.length < 2) { if (prev) prev.hidden = true; if (next) next.hidden = true; if (dotsWrap) dotsWrap.hidden = true; }
    showBanner(0); restart();
  }

  var volume = document.getElementById('branch-volume');
  var volumeValue = document.getElementById('volume-value');
  var processed = document.getElementById('processed-volume');
  var calcWa = document.getElementById('calc-wa');
  var typeButtons = Array.from(document.querySelectorAll('.calc-type'));
  var factor = .28;
  var selectedType = 'Ramas y hojas';
  function updateCalc() {
    if (!volume || !processed) return;
    var raw = Number(volume.value);
    var finalVol = raw * factor;
    if (volumeValue) volumeValue.textContent = raw;
    processed.textContent = finalVol.toFixed(1);
    if (calcWa) {
      var msg = 'Hola ECOTRITURA, usé la calculadora de la web. Tengo aproximadamente ' + raw + ' m³ para procesar. Tipo de residuo: ' + selectedType + '. Quiero cotizar el servicio.';
      calcWa.href = 'https://wa.me/595981482510?text=' + encodeURIComponent(msg);
    }
  }
  if (volume) volume.addEventListener('input', updateCalc);
  typeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      typeButtons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active'); selectedType = btn.textContent.trim(); factor = Number(btn.getAttribute('data-factor')) || .28; updateCalc();
    });
  });
  updateCalc();
})();