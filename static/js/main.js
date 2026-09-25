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
})();