    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── 1. SCROLL REVEAL (stagger por grupos) ── */
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    // Stagger: el delay se reinicia por sección/grupo para que cada bloque entre escalonado
    document.querySelectorAll('section, .benefits, .hero-grid, .footer-grid').forEach(group => {
      group.querySelectorAll(':scope .reveal').forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i * 90, 360)}ms`;
      });
    });
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    /* ── 2. PARALLAX interno de imágenes (rAF, suave) ── */
    const pimgs = Array.from(document.querySelectorAll('.pimg'));
    function runParallax() {
      const vh = window.innerHeight;
      pimgs.forEach(img => {
        const frame = img.parentElement;
        const r = frame.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        // progreso -1 (marco al fondo) .. 1 (marco arriba)
        const progress = ((vh - r.top) / (vh + r.height)) * 2 - 1;
        // base -10.9% centra el 28% de overflow; ±7% de parallax
        const shift = -10.9 + progress * 7;
        img.style.transform = `translateY(${shift}%)`;
      });
    }

    /* ── 3. COUNTER animado en stats ── */
    function animateCount(el) {
      const raw = el.textContent.trim();
      const m = raw.match(/^(\D*)(\d+)(\D*)$/);
      if (!m) return;                         // "VIP" u otros → no anima
      const pre = m[1], target = parseInt(m[2], 10), suf = m[3];
      const dur = 1400, t0 = performance.now();
      function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + Math.round(target * eased) + suf;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.stat strong').forEach(el => countObs.observe(el));

    /* ── 4. Loop de scroll (rAF throttle) ── */
    if (!reduceMotion) {
      let ticking = false;
      function onScroll() {
        if (!ticking) {
          requestAnimationFrame(() => { runParallax(); ticking = false; });
          ticking = true;
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', runParallax);
      runParallax();
    }

    /* ── 5. Scroll suave en anclas + nav activo ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Resalta el link del menú según la sección visible
    const navLinks = document.querySelectorAll('.menu a[href^="#"]');
    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('main section[id], main #top').forEach(s => { if (s.id) sectionObs.observe(s); });

/* ═══════════════════════════════════════
   POP-UP COOKIES (modal) + POP-UP DESCUENTO (email)
═══════════════════════════════════════ */
(function () {
  // ── POP-UP de descuento (se muestra tras decidir cookies) ──
  function showPromo() {
    if (localStorage.getItem('nrs_promo_v2')) return;
    const ov = document.createElement('div');
    ov.className = 'promo-overlay';
    ov.innerHTML =
      '<div class="promo-card">' +
        '<button class="promo-close" aria-label="Cerrar">×</button>' +
        '<div class="promo-top">' +
          '<div class="promo-emoji">🎈</div>' +
          '<h3>-10% en tu primera fiesta</h3>' +
          '<p>Apúntate y te enviamos tu código de descuento</p>' +
        '</div>' +
        '<div class="promo-body">' +
          '<p>Déjanos tu email y recibe un <strong>10% de descuento</strong> en tu primer pedido de globos o decoración.</p>' +
          '<form class="promo-form" novalidate>' +
            '<input type="email" required placeholder="tu@email.com" aria-label="Tu email">' +
            '<button type="submit" class="btn btn-primary">Quiero mi 10%</button>' +
          '</form>' +
          '<p class="promo-legal">Al suscribirte aceptas recibir comunicaciones de Narosa Sweet Party. Puedes darte de baja cuando quieras.</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    const close = () => { ov.classList.remove('show'); localStorage.setItem('nrs_promo_v2', '1'); setTimeout(() => ov.remove(), 450); };
    requestAnimationFrame(() => setTimeout(() => ov.classList.add('show'), 50));
    ov.querySelector('.promo-close').addEventListener('click', close);
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov.querySelector('.promo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = ov.querySelector('input');
      if (!input.value || !input.value.includes('@')) { input.focus(); input.style.borderColor = '#e23'; return; }
      ov.querySelector('.promo-body').innerHTML =
        '<div class="promo-success">✅ ¡Gracias! Usa el código <strong>NAROSA10</strong> en tu primera compra.<br>Te lo hemos enviado también a tu correo.</div>';
      localStorage.setItem('nrs_promo_v2', 'subscribed');
      setTimeout(close, 3500);
    });
  }

  // ── POP-UP de cookies (modal centrado, salta al cargar en 1ª visita) ──
  if (!localStorage.getItem('nrs_ck_v2')) {
    const ov = document.createElement('div');
    ov.className = 'cookie-overlay';
    ov.innerHTML =
      '<div class="cookie-card">' +
        '<div class="cookie-top">' +
          '<div class="cookie-emoji">🍪</div>' +
          '<h3>Tu privacidad nos importa</h3>' +
        '</div>' +
        '<div class="cookie-body">' +
          '<p>Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y mostrarte ofertas relevantes. ' +
          'Consulta nuestra <a href="cookies.html">Política de cookies</a>.</p>' +
          '<div class="cookie-actions">' +
            '<button class="btn btn-light" data-ck="no">Rechazar</button>' +
            '<button class="btn btn-primary" data-ck="yes">Aceptar todas</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(() => setTimeout(() => ov.classList.add('show'), 350));
    ov.addEventListener('click', (e) => {
      const v = e.target.getAttribute('data-ck');
      if (!v) return;
      localStorage.setItem('nrs_ck_v2', v);
      ov.classList.remove('show');
      setTimeout(() => { ov.remove(); showPromo(); }, 450);  // tras decidir cookies → salta el descuento
    });
  } else {
    setTimeout(showPromo, 1000);  // cookies ya decididas → muestra descuento
  }
})();
