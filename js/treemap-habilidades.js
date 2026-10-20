// Treemap "Habilidades técnicas mais valorizadas" — layout proporcional (blocos com tamanho pelo nº de vagas).
// Uso: renderTreemapHabilidades(document.getElementById('containerHabilidadesTecnicas'), dados)
// onde dados = [{ label, vagas_k, pct }, ...]
// Linhas fixas 3/3/4 no desktop e 2×5 no mobile (< 560px); largura ∝ vagas, altura da linha ∝ soma da linha.
(function () {
  'use strict';
  const PAL = ['#F7AF20', '#E07618', '#D83C15', '#CB1D4E', '#E6228C', '#951165', '#780D34', '#580704'];
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmt = (v, d) => Number(v).toLocaleString('pt-BR', d == null ? undefined : { minimumFractionDigits: d, maximumFractionDigits: d });

  function render(box, dados) {
    if (!box) return;
    dados = (dados || window.TREEMAP_HABILIDADES || []).slice().sort((a, b) => b.vagas_k - a.vagas_k);
    box._tmData = dados;
    box.innerHTML = '';
    if (!dados.length) {
      box.innerHTML = '<p style="color:#C3B1AC;padding:20px 0;">Nenhuma habilidade emergente encontrada para os filtros selecionados.</p>';
      return;
    }
    const mobile = (box.clientWidth || window.innerWidth) < 560;
    box._tmMobile = mobile;
    // Linhas fixas: maiores em cima, menores juntas embaixo (sem bloco órfão esticado)
    const sizes = mobile ? [2, 2, 2, 2, 2] : [3, 3, 4];
    const rows = []; let k = 0;
    sizes.forEach(n => { if (k < dados.length) { rows.push(dados.slice(k, k + n)); k += n; } });
    if (k < dados.length) rows[rows.length - 1].push(...dados.slice(k));
    const total = dados.reduce((s, d) => s + d.vagas_k, 0) || 1;
    Object.assign(box.style, { display: 'flex', flexDirection: 'column', gap: '4px' });
    let idx = 0;
    rows.forEach((row) => {
      const rowSum = row.reduce((s, d) => s + d.vagas_k, 0);
      const line = document.createElement('div');
      // altura mínima nos blocos (não na linha): a linha cresce se o rótulo quebrar em 3+ linhas
      Object.assign(line.style, { display: 'flex', gap: '4px', flex: (rowSum / total * 10).toFixed(2) + ' 1 auto' });
      box.appendChild(line);
      row.forEach((d) => {
        const i = idx++;
        const el = document.createElement('div');
        const darkText = i % PAL.length < 2;
        Object.assign(el.style, {
          flex: d.vagas_k + ' 1 0', minWidth: '0', minHeight: (mobile ? 96 : 104) + 'px',
          padding: mobile ? '12px' : '14px 16px', borderRadius: '10px', background: PAL[i % PAL.length],
          color: darkText ? '#1A0B06' : '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          gap: '10px', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif"
        });
        el.title = d.label + ': ' + fmt(d.vagas_k) + 'k vagas (' + fmt(d.pct) + '%)';
        el.innerHTML =
          '<span style="font-size:' + (mobile ? 12.5 : 13.5) + 'px;font-weight:700;line-height:1.25;overflow-wrap:anywhere;">' + esc(d.label) + '</span>' +
          '<span style="display:flex;align-items:baseline;gap:4px 8px;flex-wrap:wrap;">' +
            '<span style="font-family:Outfit,sans-serif;font-weight:300;font-size:' + (i < 3 && !mobile ? 30 : 22) + 'px;letter-spacing:-0.02em;line-height:1;">' + fmt(d.pct) + '%</span>' +
            '<span style="font-size:12px;font-weight:600;opacity:.85;">' + fmt(d.vagas_k) + 'k vagas</span>' +
          '</span>';
        line.appendChild(el);
      });
    });
    if (!box._tmResize) {
      box._tmResize = true;
      // Re-renderiza só quando cruza o breakpoint, sempre com os dados mais recentes (filtros)
      const check = () => {
        const m = (box.clientWidth || window.innerWidth) < 560;
        if (m !== box._tmMobile) render(box, box._tmData);
      };
      if ('ResizeObserver' in window) new ResizeObserver(check).observe(box);
      else window.addEventListener('resize', check);
    }
  }

  window.renderTreemapHabilidades = render;
})();
