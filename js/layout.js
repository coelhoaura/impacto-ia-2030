/**
 * Prisma Insights • Impacto da IA no Trabalho 2030
 * Comportamentos compartilhados entre index.html e bussola.html:
 * altura do header (--header-h), link ativo da nav, fade-in ao rolar e contadores dos KPIs.
 */
(function () {
  'use strict';
  const root = document.documentElement;
  const header = document.getElementById('siteHeader');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: mede a altura real (muda com zoom, escala e quebra em 2 linhas) ---------- */
  function syncHeader() {
    if (!header) return;
    const h = header.offsetHeight;
    const fixed = getComputedStyle(header).position === 'fixed';
    root.style.setProperty('--header-h', h + 'px');
    root.style.setProperty('--header-offset', (fixed ? h : 0) + 'px');
  }
  syncHeader();
  window.addEventListener('resize', syncHeader);
  if (header && 'ResizeObserver' in window) new ResizeObserver(syncHeader).observe(header);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeader);

  /* ---------- Link ativo da navegação ---------- */
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const spySections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let spyQueued = false;
  function spy() {
    spyQueued = false;
    const y = window.scrollY + window.innerHeight * 0.3;
    let current = null;
    spySections.forEach(s => { if (s.getBoundingClientRect().top + window.scrollY <= y) current = s.id; });
    navLinks.forEach(a => {
      const on = a.getAttribute('href') === '#' + current;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  if (spySections.length) {
    window.addEventListener('scroll', () => { if (!spyQueued) { spyQueued = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
  }

  /* ---------- Contadores dos KPIs ---------- */
  function countUp(el) {
    if (el._counted) return;
    el._counted = true;
    if (reduceMotion) return;
    const final = el.textContent;
    const m = final.match(/(\d{1,3}(?:\.\d{3})+|\d+)(,\d+)?/);
    if (!m) return;
    const dec = m[2] ? m[2].length - 1 : 0;
    const target = parseFloat(m[0].replace(/\./g, '').replace(',', '.'));
    const t0 = performance.now(), dur = 1400;
    let last = final;
    const step = (t) => {
      if (el.textContent !== last) return; // um filtro mudou o valor: encerra a animação
      const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
      const v = (target * ease).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      last = p < 1 ? final.replace(m[0], v) : final; // no fim, restaura o texto original exato
      el.textContent = last;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Fade-in ao rolar ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.style.opacity = '1';
        el.style.transform = 'none';
        io.unobserve(el);
        el.querySelectorAll('[data-count]').forEach(countUp);
        if (el.hasAttribute('data-count')) countUp(el);
      });
    // rootMargin em vez de threshold proporcional: funciona mesmo quando o card é
    // mais alto que a tela (zoom de 200%+ no celular/notebook).
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    revealEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)';
      io.observe(el);
    });
  }

  window.PrismaLayout = { syncHeader, reduceMotion };
})();
