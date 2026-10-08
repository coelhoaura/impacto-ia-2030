/**
 * Prisma Insights • Impacto da IA no Trabalho 2030
 * Interações do novo layout: header, modais, Power BI, animações e
 * o simulador "Onde investir os R$ 15 milhões" (com os dados reais do data.js).
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  /* ---------------- Header: altura (para o scroll) e link ativo ---------------- */
  const header = $('siteHeader');
  function syncHeader() {
    if (header) document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  syncHeader();
  window.addEventListener('resize', syncHeader);
  if (header && 'ResizeObserver' in window) new ResizeObserver(syncHeader).observe(header);

  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const spySections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function spy() {
    const y = window.scrollY + window.innerHeight * 0.3;
    let current = null;
    spySections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---------------- Ações (botões do layout) ---------------- */
  const codeModal = $('codeModal');
  const actions = {
    openCode: () => { if (codeModal) { codeModal.style.display = 'flex'; document.body.style.overflow = 'hidden'; } },
    closeCode: () => { if (codeModal) { codeModal.style.display = 'none'; document.body.style.overflow = ''; } },
    codeBackdrop: (e) => { if (e.target === e.currentTarget) actions.closeCode(); },
    maximizePbi: () => {
      const el = $('pbiFrame');
      if (!el) return;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen();
    },
    pbiLive: (e) => showPbi('live', e.currentTarget),
    resetFilters: () => {} // tratado pelo app.js (btnResetFilters)
  };
  document.querySelectorAll('[data-action]').forEach(el => {
    const fn = actions[el.getAttribute('data-action')];
    if (fn) el.addEventListener('click', fn);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && codeModal && codeModal.style.display !== 'none') actions.closeCode();
  });

  /* ---------------- Power BI: prints por página + relatório interativo ---------------- */
  const pbiShot = $('pbiShot');
  const pbiIframe = $('pbiIframe');
  function showPbi(key, btn) {
    document.querySelectorAll('.pbi-tab').forEach(b => b.classList.toggle('active', b === btn));
    if (key === 'live') {
      if (pbiIframe && !pbiIframe.src) pbiIframe.src = pbiIframe.getAttribute('data-src');
      if (pbiIframe) pbiIframe.style.display = 'block';
      if (pbiShot) pbiShot.style.display = 'none';
    } else {
      if (pbiIframe) pbiIframe.style.display = 'none';
      if (pbiShot) { pbiShot.style.display = 'block'; pbiShot.src = 'assets/pbi/' + key + '.png'; }
    }
  }
  document.querySelectorAll('.pbi-tab[data-pbi]').forEach(b => b.addEventListener('click', () => showPbi(b.getAttribute('data-pbi'), b)));

  /* ---------------- Animações: fade-in ao rolar + contadores ---------------- */
  function countUp(el) {
    if (el._counted) return;
    el._counted = true;
    const final = el.textContent;
    const m = final.match(/(\d{1,3}(?:\.\d{3})+|\d+)(,\d+)?/);
    if (!m) return;
    const dec = m[2] ? m[2].length - 1 : 0;
    const target = parseFloat(m[0].replace(/\./g, '').replace(',', '.'));
    const t0 = performance.now(), dur = 1400;
    let last = final;
    const step = (t) => {
      if (el.textContent !== last) return; // um filtro mudou o valor: para a animação
      const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
      const v = (target * ease).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      last = p < 1 ? final.replace(m[0], v) : final;
      el.textContent = last;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
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
    }, { threshold: 0.12 });
    revealEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)';
      io.observe(el);
    });
  }

  /* ---------------- Simulador do fundo de R$ 15 milhões ---------------- */
  // Mesmas fórmulas do simulador original: salário atual = média Salary_Pre_AI_USD do cargo de origem;
  // novo salário = média Salary_Post_AI_USD do cargo-alvo; risco = média Automation_Probability_2030.
  function initSimulator() {
    const D = (typeof AI_WORKSHIFT_DATA !== 'undefined') ? AI_WORKSHIFT_DATA : null;
    const selSector = $('simSector'), selOrig = $('simCurrentJob'), selTarget = $('simTargetTrack');
    if (!D || !selOrig || !selTarget) return;

    const agg = {};
    D.fato_ai_job_impact.forEach(j => {
      const a = agg[j.Cargo_ID] || (agg[j.Cargo_ID] = { n: 0, pre: 0, post: 0, auto: 0 });
      a.n++; a.pre += j.Salary_Pre_AI_USD; a.post += j.Salary_Post_AI_USD; a.auto += j.Automation_Probability_2030;
    });
    const cargos = D.dim_cargo.filter(c => agg[c.Cargo_ID]).map(c => {
      const a = agg[c.Cargo_ID];
      return { id: c.Cargo_ID, title: c.Job_Title, setor: (c.Industry || '').replace('\xad', 'í'), skill: c.Primary_Emerging_Skill,
               pre: a.pre / a.n, post: a.post / a.n, risk: a.auto / a.n };
    }).sort((x, y) => x.title.localeCompare(y.title, 'pt-BR'));
    const byId = Object.fromEntries(cargos.map(c => [c.id, c]));

    const recommend = (o) => cargos
      .filter(t => t.id !== o.id && t.risk < o.risk)
      .map(t => ({ t, score: Math.min(30, (o.risk - t.risk) * 100) + (t.setor === o.setor ? 40 : 0) - Math.abs(Math.log(t.post / o.post)) * 20 }))
      .sort((a, b) => b.score - a.score).map(x => x.t);

    const pct = (v) => Math.round(v * 100) + '%';
    const usd = (v) => (v < 0 ? '-$' : '$') + Math.abs(Math.round(v)).toLocaleString();
    const brl = (v) => 'R$ ' + (v >= 1e6 ? (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + 'M' : Math.round(v).toLocaleString('pt-BR'));
    const opt = (value, label, rec) => { const o = document.createElement('option'); o.value = value; o.textContent = label; if (rec) o.dataset.rec = '1'; return o; };

    // setores
    const sectors = Array.from(new Set(cargos.map(c => c.setor))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    if (selSector) {
      selSector.innerHTML = '';
      selSector.appendChild(opt('Todos', 'Todos os setores'));
      sectors.forEach(s => selSector.appendChild(opt(s, s)));
    }

    function fillOrig(keepId) {
      const sec = selSector ? selSector.value : 'Todos';
      selOrig.innerHTML = '';
      cargos.filter(c => sec === 'Todos' || c.setor === sec)
        .forEach(c => selOrig.appendChild(opt(c.id, c.title + ' • ' + pct(c.risk) + ' risco')));
      if (keepId && Array.from(selOrig.options).some(o => o.value === keepId)) selOrig.value = keepId;
    }
    function fillTarget() {
      const o = byId[selOrig.value];
      selTarget.innerHTML = '';
      if (!o) return;
      const rec = recommend(o);
      const top = new Set(rec.slice(0, 5).map(t => t.id));
      rec.forEach(t => selTarget.appendChild(opt(t.id, (top.has(t.id) ? '★ ' : '') + t.title + ' • ' + pct(t.risk) + ' risco', top.has(t.id))));
      if (!rec.length) selTarget.appendChild(opt('', 'Nenhum cargo com risco menor'));
    }

    let chart = null;
    function drawChart(o, t) {
      const el = $('simChart');
      if (!el || !window.Chart) return;
      const d0 = [Math.round(o.pre), Math.round(o.post)], d1 = [Math.round(t.pre), Math.round(t.post)];
      if (chart) { chart.data.datasets[0].data = d0; chart.data.datasets[1].data = d1; chart.update(); return; }
      chart = new Chart(el, {
        type: 'bar',
        data: { labels: ['Salário pré-IA', 'Salário 2030'], datasets: [
          { label: 'Cargo atual', data: d0, backgroundColor: '#CB1D4E', borderRadius: 6, barPercentage: 0.7 },
          { label: 'Cargo-alvo', data: d1, backgroundColor: '#F7AF20', borderRadius: 6, barPercentage: 0.7 }] },
        options: { maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } },
                     tooltip: { callbacks: { label: c => c.dataset.label + ': $' + c.raw.toLocaleString('pt-BR') } } },
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: v => '$' + (v / 1000) + ' Mil' } } } }
      });
    }

    function set(id, text) { const el = $(id); if (el) el.textContent = text; }
    function run() {
      const o = byId[selOrig.value], t = byId[selTarget.value];
      if (!o || !t) return;
      const diff = t.post - o.pre, diffPct = diff / o.pre * 100;
      const riskDiff = (t.risk - o.risk) * 100;

      set('simTrackTitle', t.title);
      set('simOrigSalary', usd(o.pre));
      set('simNewSalary', usd(t.post));
      const gain = $('simGainUsd');
      if (gain) {
        gain.textContent = diff >= 0 ? `+${usd(diff)} (+${diffPct.toFixed(1)}%)` : `${usd(diff)} (${diffPct.toFixed(1)}%)`;
        gain.className = diff >= 0 ? 'val amber' : 'val red';
      }
      const rm = $('simRiskMitigation');
      if (rm) {
        rm.textContent = `${riskDiff <= 0 ? '' : '+'}${riskDiff.toFixed(1)}%`;
        rm.title = `de ${pct(o.risk)} para ${pct(t.risk)}`;
        rm.className = riskDiff <= 0 ? 'val green' : 'val red';
      }
      set('simOrigAuto', pct(o.risk)); set('simTgtAuto', pct(t.risk));
      const ob = $('simOrigAutoBar'), tb = $('simTgtAutoBar');
      if (ob) ob.style.width = pct(o.risk);
      if (tb) tb.style.width = pct(t.risk);

      const skills = [t.skill, 'Supervisão de IA', t.setor === o.setor ? 'Mobilidade interna' : 'Transição de setor: ' + t.setor].filter(Boolean);
      const sk = $('simSkillsList');
      if (sk) sk.innerHTML = skills.map(s => `<span class="skill-tag">${s}</span>`).join('');

      // premissas do fundo
      const people = +($('simPeople') || {}).value || 0;
      const cost = Math.max(0, +($('simCost') || {}).value || 0);
      const fx = Math.max(0.1, +String(($('simFx') || {}).value || '5.2').replace(',', '.'));
      set('simPeopleLabel', people.toLocaleString('pt-BR'));
      const invest = people * cost, fund = invest / 15e6 * 100;
      set('simInvest', brl(invest));
      set('simFundPct', fund.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%');
      const fp = $('simFundPct'); if (fp) fp.style.color = fund > 100 ? '#F0457A' : '#FFFFFF';
      const fb = $('simFundBar'); if (fb) fb.style.width = Math.min(100, fund) + '%';
      const monthly = diff * fx / 12;
      set('simPayback', diff > 0 ? (cost / monthly < 1 ? '< 1 mês' : (cost / monthly).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' meses') : 'Sem ganho salarial');
      set('simAggGain', (diff >= 0 ? '+' : '') + usd(diff * people));
      drawChart(o, t);
    }

    fillOrig();
    const start = cargos.find(c => /analista financeiro/i.test(c.title)) || cargos[0];
    if (start) selOrig.value = start.id;
    fillTarget();
    run();

    if (selSector) selSector.addEventListener('change', () => { fillOrig(); fillTarget(); run(); });
    selOrig.addEventListener('change', () => { fillTarget(); run(); });
    selTarget.addEventListener('change', run);
    ['simPeople', 'simCost', 'simFx'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', run); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSimulator);
  else initSimulator();
})();
