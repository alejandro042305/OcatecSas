(function () {
  'use strict';

  var WHATSAPP_NUMBER = '573125601208';

  /* ---------------------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------------------- */
  var burger = document.querySelector('[data-burger]');
  var overlay = document.querySelector('[data-overlay]');

  function closeMenu() {
    if (!burger || !overlay) return;
    burger.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (burger && overlay) {
    burger.addEventListener('click', function () {
      var isOpen = burger.classList.toggle('is-open');
      overlay.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    overlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------------------------------------------------------------------
     Navbar elevation on scroll
  --------------------------------------------------------------------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      nav.style.boxShadow = window.scrollY > 12 ? 'var(--shadow-lift)' : 'var(--shadow-soft)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     Scroll reveal — cascades per sibling group, Apple-style fade/settle
  --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    // Index each element relative to its own parent so grids/lists cascade
    // from 0 instead of inheriting a stray offset from earlier sections.
    var siblingCounts = new WeakMap();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      var count = siblingCounts.get(parent) || 0;
      el.style.setProperty('--i', Math.min(count, 7));
      siblingCounts.set(parent, count + 1);
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  }

  /* ---------------------------------------------------------------------
     Footer year
  --------------------------------------------------------------------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Contact form
  --------------------------------------------------------------------- */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var validators = {
      nombre: function (v) {
        var trimmed = v.trim();
        return trimmed.length >= 3 && /[a-zA-ZÀ-ÿ]/.test(trimmed) ? '' : 'Escribe tu nombre completo.';
      },
      telefono: function (v) {
        var trimmed = v.trim();
        return /^[0-9+\s()-]{7,15}$/.test(trimmed) && /[0-9]{7,}/.test(trimmed.replace(/\D/g, '')) ? '' : 'Ingresa un teléfono válido.';
      },
      email: function (v) {
        if (!v.trim()) return '';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Ingresa un correo válido.';
      },
      servicio: function (v) {
        return v ? '' : 'Selecciona un servicio.';
      },
      mensaje: function (v) {
        return v.trim().length >= 10 ? '' : 'Cuéntanos un poco más (mínimo 10 caracteres).';
      }
    };

    function showError(field, message) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.toggle('has-error', !!message);
      var errEl = wrap.querySelector('.field-error');
      if (errEl) errEl.textContent = message;
    }

    Object.keys(validators).forEach(function (name) {
      var field = form.querySelector('[name="' + name + '"]');
      if (!field) return;
      field.addEventListener('blur', function () {
        showError(field, validators[name](field.value));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var data = {};

      Object.keys(validators).forEach(function (name) {
        var field = form.querySelector('[name="' + name + '"]');
        if (!field) return;
        var message = validators[name](field.value);
        showError(field, message);
        if (message) valid = false;
        data[name] = field.value;
      });

      if (!valid) {
        var firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      var params = new URLSearchParams({
        nombre: data.nombre || '',
        servicio: data.servicio || ''
      });

      window.location.href = 'gracias.html?' + params.toString();
    });
  }

  /* ---------------------------------------------------------------------
     Thank-you page order number
  --------------------------------------------------------------------- */
  var orderEl = document.querySelector('[data-order-id]');
  if (orderEl) {
    var now = new Date();
    var stamp = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
    var rand = Math.floor(100 + Math.random() * 900);
    orderEl.textContent = 'OCA-' + stamp + '-' + rand;
  }

  /* ---------------------------------------------------------------------
     Thank-you page summary
  --------------------------------------------------------------------- */
  var summary = document.querySelector('[data-thanks-summary]');
  if (summary) {
    var qs = new URLSearchParams(window.location.search);
    var nombre = qs.get('nombre');
    var servicio = qs.get('servicio');

    if (nombre || servicio) {
      summary.classList.add('is-visible');
      var nameEl = summary.querySelector('[data-name]');
      var serviceEl = summary.querySelector('[data-service]');
      if (nameEl) nameEl.textContent = nombre || '—';
      if (serviceEl) serviceEl.textContent = servicio || '—';
    }

    var heading = document.querySelector('[data-thanks-heading]');
    if (heading && nombre) {
      heading.textContent = '¡Gracias, ' + nombre.split(' ')[0] + '!';
    }
  }

  /* ---------------------------------------------------------------------
     WhatsApp links: build href with prefilled message
  --------------------------------------------------------------------- */
  document.querySelectorAll('[data-wa]').forEach(function (link) {
    var msg = link.getAttribute('data-wa') || 'Hola, quiero solicitar un servicio técnico.';
    link.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    link.target = '_blank';
    link.rel = 'noopener';
  });

  /* ---------------------------------------------------------------------
     Before / after compare slider
  --------------------------------------------------------------------- */
  document.querySelectorAll('[data-compare]').forEach(function (el) {
    var before = el.querySelector('.compare-before');
    var handle = el.querySelector('.compare-handle');
    var dragging = false;

    function setPos(clientX) {
      var rect = el.getBoundingClientRect();
      var pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      before.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
    }

    el.addEventListener('pointerdown', function (e) {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      setPos(e.clientX);
    });
    el.addEventListener('pointermove', function (e) {
      if (dragging) setPos(e.clientX);
    });
    el.addEventListener('pointerup', function () { dragging = false; });
    el.addEventListener('pointerleave', function () { dragging = false; });
  });

  /* ---------------------------------------------------------------------
     Before / after carousel (multiple slides)
  --------------------------------------------------------------------- */
  document.querySelectorAll('[data-compare-carousel]').forEach(function (carousel) {
    var slides = carousel.querySelectorAll('[data-compare-slide]');
    var dots = carousel.querySelectorAll('[data-compare-dot]');
    var prevBtn = carousel.querySelector('[data-compare-prev]');
    var nextBtn = carousel.querySelector('[data-compare-next]');
    var current = 0;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) { slide.classList.toggle('is-active', i === current); });
      dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === current); });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });
  });

  /* ---------------------------------------------------------------------
     Back to top
  --------------------------------------------------------------------- */
  var toTop = document.querySelector('[data-to-top]');
  if (toTop) {
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------------------
     Floating action stack — stays out of the way on mobile until the
     visitor scrolls past the first fold, so it never covers the hero copy.
  --------------------------------------------------------------------- */
  var fabStack = document.querySelector('.fab-stack');
  if (fabStack) {
    var onFabScroll = function () {
      fabStack.classList.toggle('is-visible', window.scrollY > 320);
    };
    window.addEventListener('scroll', onFabScroll, { passive: true });
    onFabScroll();
  }
})();
