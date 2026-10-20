/**
 * Prisma Insights • Impacto da IA no Trabalho 2030 — interações da landing page
 * Modal Engenharia & SQL, barra de filtros (colapso no mobile), simulador dos R$ 15M e vídeo do dashboard.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;

  /* ---------------- Modal Engenharia & SQL ---------------- */
  const modal = $('codeModal');
  let lastFocus = null;
  function openCode() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const card = modal.querySelector('.code-modal__card');
    if (card) card.focus();
  }
  function closeCode() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-action="openCode"]').forEach(b => b.addEventListener('click', openCode));
  document.querySelectorAll('[data-action="closeCode"]').forEach(b => b.addEventListener('click', closeCode));
  if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeCode(); });
    // Mantém o foco do teclado dentro do modal
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = Array.from(modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCode(); });
  if (location.hash === '#engenharia-sql') openCode();

  /* ---------------- Barra de filtros ---------------- */
  const bar = $('filterBar');
  const toggle = $('filtersToggle');
  const badge = $('filtersBadge');
  if (bar) {
    const syncFiltersH = () => root.style.setProperty('--filters-h', bar.offsetHeight + 'px');
    syncFiltersH();
    if ('ResizeObserver' in window) new ResizeObserver(syncFiltersH).observe(bar);
    else window.addEventListener('resize', syncFiltersH);
  }
  if (toggle && bar) {
    toggle.addEventListener('click', () => {
      const open = !bar.classList.contains('is-open');
      bar.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  document.addEventListener('filters:change', (e) => {
    const n = e.detail ? e.detail.active : 0;
    if (!badge) return;
    badge.textContent = n ? String(n) : '';
    badge.classList.toggle('is-on', n > 0);
    badge.setAttribute('aria-label', n + (n === 1 ? ' filtro ativo' : ' filtros ativos'));
  });

  /* ---------------- Simulador "Onde investir os R$ 15 milhões" ---------------- */
  // Base real do projeto (data.js): por cargo, média de Salary_Pre_AI_USD, Salary_Post_AI_USD (2030)
  // e Automation_Probability_2030; habilidade = Primary_Emerging_Skill.
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
      return {
        id: c.Cargo_ID, cargo: c.Job_Title, setor: c.Industry, skill: c.Primary_Emerging_Skill,
        salPre: a.pre / a.n, sal2030: a.post / a.n, auto: Math.round(a.auto / a.n * 100)
      };
    }).sort((x, y) => x.cargo.localeCompare(y.cargo, 'pt-BR'));
    const byId = Object.fromEntries(cargos.map(c => [c.id, c]));

    // score = min(30, Δauto) + (mesmo setor ? 40 : 0) − |ln(sal2030_alvo / sal2030_origem)| × 20
    const recommend = (o) => cargos
      .filter(t => t.id !== o.id && t.auto < o.auto)
      .map(t => ({ t, score: Math.min(30, o.auto - t.auto) + (t.setor === o.setor ? 40 : 0) - Math.abs(Math.log(t.sal2030 / o.sal2030)) * 20 }))
      .sort((a, b) => b.score - a.score)
      .map(x => x.t);

    const usd = (v) => (v < 0 ? '-$' : '$') + Math.abs(Math.round(v)).toLocaleString('pt-BR');
    const brl = (v) => 'R$ ' + (v >= 1e6 ? (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + 'M' : Math.round(v).toLocaleString('pt-BR'));
    const opt = (value, label) => { const o = document.createElement('option'); o.value = value; o.textContent = label; return o; };
    const set = (id, text) => { const el = $(id); if (el) el.textContent = text; };

    if (selSector) {
      selSector.innerHTML = '';
      selSector.appendChild(opt('Todos', 'Todos os setores'));
      Array.from(new Set(cargos.map(c => c.setor))).sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach(s => selSector.appendChild(opt(s, s)));
    }

    function fillOrig() {
      const sec = selSector ? selSector.value : 'Todos';
      selOrig.innerHTML = '';
      cargos.filter(c => sec === 'Todos' || c.setor === sec).forEach(c => selOrig.appendChild(opt(c.id, `${c.cargo} • ${c.auto}% risco`)));
    }
    // Ao trocar a origem, seleciona automaticamente o 1º recomendado
    function fillTarget() {
      const o = byId[selOrig.value];
      selTarget.innerHTML = '';
      if (!o) return;
      const rec = recommend(o);
      rec.forEach((t, i) => selTarget.appendChild(opt(t.id, `${i < 5 ? '★ ' : ''}${t.cargo} • ${t.auto}% risco`)));
      if (!rec.length) selTarget.appendChild(opt('', 'Nenhum cargo com risco menor'));
      selTarget.selectedIndex = 0;
    }

    let chart = null;
    function drawChart(o, t) {
      const el = $('simChart');
      if (!el || !window.Chart) return;
      const d0 = [Math.round(o.salPre), Math.round(o.sal2030)], d1 = [Math.round(t.salPre), Math.round(t.sal2030)];
      if (chart) { chart.data.datasets[0].data = d0; chart.data.datasets[1].data = d1; chart.update(); return; }
      chart = new Chart(el, {
        type: 'bar',
        data: {
          labels: ['Salário pré-IA', 'Salário 2030'],
          datasets: [
            { label: 'Cargo atual', data: d0, backgroundColor: '#CB1D4E', borderRadius: 6, barPercentage: 0.7 },
            { label: 'Cargo-alvo', data: d1, backgroundColor: '#F7AF20', borderRadius: 6, barPercentage: 0.7 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } },
            tooltip: { callbacks: { label: c => c.dataset.label + ': $' + c.raw.toLocaleString('pt-BR') } }
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { maxTicksLimit: 5, callback: v => '$' + (v / 1000).toLocaleString('pt-BR') + ' Mil' } }
          }
        }
      });
    }

    function run() {
      const o = byId[selOrig.value], t = byId[selTarget.value];
      const people = Math.max(0, +($('simPeople') || {}).value || 0);
      const cost = Math.max(0, +($('simCost') || {}).value || 0);
      const fx = Math.max(0.1, +String(($('simFx') || {}).value || '5').replace(',', '.') || 0.1);
      set('simPeopleLabel', people.toLocaleString('pt-BR'));
      if (!o || !t) return;

      const diff = t.sal2030 - o.sal2030;
      const diffPct = diff / o.sal2030 * 100;

      set('simTrackTitle', t.skill || t.cargo);
      set('simOrigSalary', usd(o.sal2030));
      set('simNewSalary', usd(t.sal2030));
      const gain = $('simGainUsd');
      if (gain) {
        gain.textContent = `${diff >= 0 ? '+' : ''}${usd(diff)} (${diffPct >= 0 ? '+' : ''}${diffPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%)`;
        gain.style.color = diff >= 0 ? '#E07618' : '#F0457A';
      }
      const rm = $('simRiskMitigation');
      if (rm) {
        rm.textContent = '-' + (o.auto - t.auto) + '%';
        rm.title = `de ${o.auto}% para ${t.auto}%`;
      }
      set('simOrigAuto', o.auto + '%');
      set('simTgtAuto', t.auto + '%');
      const ob = $('simOrigAutoBar'), tb = $('simTgtAutoBar');
      if (ob) ob.style.width = o.auto + '%';
      if (tb) tb.style.width = t.auto + '%';

      const sk = $('simSkillsList');
      if (sk) {
        sk.innerHTML = '';
        [t.skill, 'Supervisão de IA', t.setor === o.setor ? 'Mobilidade interna' : 'Transição de setor: ' + t.setor]
          .filter(Boolean)
          .forEach(s => { const span = document.createElement('span'); span.className = 'skill-tag'; span.textContent = s; sk.appendChild(span); });
      }

      const invest = people * cost, fund = invest / 15e6 * 100;
      set('simInvest', brl(invest));
      set('simFundPct', fund.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%');
      const fp = $('simFundPct'); if (fp) fp.style.color = fund > 100 ? '#F0457A' : '#FFFFFF';
      const fw = $('simFundBarWrap'); if (fw) fw.classList.toggle('is-over', fund > 100);
      const fb = $('simFundBar'); if (fb) fb.style.width = Math.min(100, fund) + '%';
      // payback = custo ÷ (ganho mensal em US$ × câmbio)
      const monthlyBRL = diff / 12 * fx;
      const payback = diff > 0 ? cost / monthlyBRL : null;
      set('simPayback', payback == null ? 'Sem ganho salarial' : payback < 1 ? '< 1 mês' : payback.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' meses');
      set('simAggGain', (diff >= 0 ? '+' : '') + usd(diff * people));
      drawChart(o, t);
    }

    fillOrig();
    const start = cargos.find(c => /^analista financeiro$/i.test(c.cargo)) || cargos[0];
    if (start) selOrig.value = start.id;
    fillTarget();
    run();

    if (selSector) selSector.addEventListener('change', () => { fillOrig(); selOrig.selectedIndex = 0; fillTarget(); run(); });
    selOrig.addEventListener('change', () => { fillTarget(); run(); });
    selTarget.addEventListener('change', run);
    ['simPeople', 'simCost', 'simFx'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', run); });
  }

  function init() { initSimulator(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
