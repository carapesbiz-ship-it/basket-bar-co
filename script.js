// custom cursor
(function () {
  const c = document.getElementById('cursor');
  if (!c) return;
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let tx = x, ty = y;
  window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
  function tick() {
    x += (tx - x) * 0.25; y += (ty - y) * 0.25;
    c.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();

  const interactive = 'a, button, .basket, .occasion, .g-tile, [type=submit]';
  document.querySelectorAll(interactive).forEach(el => {
    el.addEventListener('mouseenter', () => c.classList.add('big'));
    el.addEventListener('mouseleave', () => c.classList.remove('big'));
  });
  document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('mouseenter', () => c.classList.add('text'));
    el.addEventListener('mouseleave', () => c.classList.remove('text'));
  });
})();

// nav scroll state + hero parallax
(function () {
  const nav = document.getElementById('nav');
  const hero = document.querySelector('.hero');
  const bg = document.getElementById('heroBg');
  function onScroll() {
    const s = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', s > 40);
    if (bg) bg.style.transform = `scale(1.02) translateY(${s * 0.08}px)`;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// gentle reveal on scroll
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = 1;
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.basket, .step, .g-tile, .occasion, .inquire-form').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 1s cubic-bezier(.2,.8,.2,1), transform 1s cubic-bezier(.2,.8,.2,1)';
    io.observe(el);
  });
})();

// MOBILE HAMBURGER MENU
(function () {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  const backdrop = document.getElementById('mobileMenuBackdrop');
  if (!toggle || !menu) return;

  function open() {
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    menu.setAttribute('aria-hidden', 'false');
  }
  function close() {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    menu.setAttribute('aria-hidden', 'true');
  }
  toggle.addEventListener('click', () => {
    document.body.classList.contains('menu-open') ? close() : open();
  });
  if (backdrop) backdrop.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// CTA PREFILL — clicking a basket card sets the inquiry form's basket-style select
(function () {
  const styleSelect = document.getElementById('f-style');
  if (!styleSelect) return;

  document.querySelectorAll('.basket[data-style]').forEach(card => {
    card.addEventListener('click', (e) => {
      const value = card.getAttribute('data-style');
      if (!value) return;
      // Try to find an exact match in the select; fall back to "Custom Request"
      const match = [...styleSelect.options].find(o => o.value === value || o.text === value);
      if (match) {
        styleSelect.value = match.value || match.text;
      } else {
        const fallback = [...styleSelect.options].find(o => /custom request/i.test(o.text));
        if (fallback) styleSelect.value = fallback.value || fallback.text;
      }
      // Trigger change for any listeners
      styleSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
})();

// CONDITIONAL DELIVERY CITY FIELD
(function () {
  const fulfillment = document.getElementById('f-fulfillment');
  const cityField = document.getElementById('city-field');
  const cityInput = document.getElementById('f-city');
  if (!fulfillment || !cityField) return;

  function sync() {
    const showing = fulfillment.value === 'Delivery';
    if (showing) {
      cityField.hidden = false;
      if (cityInput) cityInput.required = true;
    } else {
      cityField.hidden = true;
      if (cityInput) {
        cityInput.required = false;
        cityInput.value = '';
      }
    }
  }
  fulfillment.addEventListener('change', sync);
  sync();
})();

// QUICK INQUIRY FORM — AJAX submit to Formspree + inline confirmation
(function () {
  const form = document.getElementById('quickForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.innerHTML = '<p class="quick-success" style="text-align:center; padding:24px 0; font-family: var(--serif); font-size:18px; line-height:1.5; color: var(--ink-soft);">✿ Thank you — your note is in. We&rsquo;ll reply within 24 hours.</p>';
      } else {
        throw new Error('Formspree returned ' + res.status);
      }
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      alert('Sorry — something went wrong sending your note. Please email basketbarco@gmail.com directly.');
    }
  });
})();

