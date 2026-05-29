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
