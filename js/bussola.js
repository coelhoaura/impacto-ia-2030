/**
 * Bússola 2030 • Prisma Insights
 * Entrada do currículo → máscara LGPD → pipeline de 5 passos → API da Bússola → diagnóstico.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const DIMS = ['Pensamento Analítico', 'Orquestração de IA', 'Criatividade', 'Liderança', 'Resiliência', 'Especialização Estratégica'];

  const STEPS = [
    ['Esconde dados pessoais', 'Nome, e-mail, telefone, CPF e endereço são mascarados (LGPD).'],
    ['Lê o currículo', 'Identifica cargo, senioridade, ferramentas e tarefas do dia a dia.'],
    ['Compara com 50+ profissões', 'Cruza seu perfil com tendências do WEF, McKinsey e O*NET.'],
    ['Calcula o risco', 'Estima automação, ganho de produtividade e lacunas de competência.'],
    ['Monta o plano', 'Gera o que desaprender, o que aprender e o roadmap até 2030.']
  ];

  // [rótulo, cargo, anos, texto de exemplo]
  const PRESETS = [
    ['Desenvolvedor Júnior', 'Desenvolvedor Júnior', 1, 'Desenvolvedor Front-end Júnior há 1 ano. Crio telas em React e JavaScript a partir de layouts do Figma, corrijo bugs reportados pelo QA, escrevo testes unitários simples e faço integrações com APIs REST. Uso Git, VS Code e GitHub Copilot ocasionalmente. Graduando em Ciência da Computação.'],
    ['Tech Lead Sênior', 'Tech Lead', 12, 'Tech Lead com 12 anos de experiência. Lidero squad de 8 engenheiros, defino arquitetura de microsserviços em AWS, conduzo code reviews, mentoria e planejamento técnico com produto. Implantei pipeline de CI/CD e observabilidade. Experiência com Kubernetes, Go, Python e adoção de assistentes de código com IA no time.'],
    ['Assistente Administrativo', 'Assistente Administrativo', 6, 'Assistente Administrativo há 6 anos. Controlo agenda da diretoria, lanço notas fiscais no ERP, organizo planilhas de contas a pagar, arquivo documentos, atendo telefone e e-mails, emito relatórios mensais de despesas e faço cotações com fornecedores. Pacote Office intermediário.'],
    ['Analista Financeiro', 'Analista Financeiro', 5, 'Analista Financeiro Pleno com 5 anos de experiência. Faço conciliações bancárias, fechamento contábil mensal, relatórios gerenciais em Excel, acompanhamento de orçamento vs. realizado e projeções de fluxo de caixa. Uso SAP, Excel avançado e Power BI básico. Apresento resultados ao gerente financeiro.'],
    ['Advogado', 'Advogado', 8, 'Advogado empresarial com 8 anos de atuação. Reviso e redijo contratos comerciais, faço due diligence, pesquisa de jurisprudência, pareceres e acompanho processos. Negocio cláusulas com clientes e oriento a diretoria em riscos regulatórios. OAB ativa, pós em Direito Contratual.'],
    ['Designer Gráfico', 'Designer Gráfico', 4, 'Designer Gráfico há 4 anos em agência. Crio peças para redes sociais, banners, apresentações e identidades visuais. Uso Photoshop, Illustrator, Figma e já testei Midjourney. Faço adaptações de formatos, tratamento de imagens e participo de brainstorms de campanha.'],
    ['Atendente de SAC', 'Atendente de SAC', 3, 'Atendente de SAC há 3 anos em e-commerce. Respondo chamados por chat, e-mail e telefone, sigo scripts de atendimento, registro ocorrências no CRM, faço trocas e devoluções e escalo casos complexos para a supervisão. Meta de TMA e NPS.'],
    ['Gerente de Projetos', 'Gerente de Projetos', 10, 'Gerente de Projetos com 10 anos em TI. Conduzo projetos de implantação de ERP, gerencio cronograma, orçamento e riscos, faço status reports, coordeno fornecedores e equipes multidisciplinares. Certificação PMP, uso Jira, MS Project e metodologias ágeis.']
  ];

  // Resultado de exemplo exibido antes da 1ª análise
  const SAMPLE = {
    profissao: 'Analista Financeiro', area: 'Serviços Financeiros', senioridade: 'Pleno', anos_experiencia: 5,
    rotina_pct: 62, estrategica_pct: 38, score: 54,
    risco_automacao: 64, nivel_risco: 'Alto', ganho_produtividade: 47, multiplicador: 2.1,
    radar_atual: [62, 28, 45, 40, 55, 50], radar_2030: [85, 82, 65, 62, 75, 80],
    desaprender: [
      { item: 'Conciliação bancária manual', motivo: 'Agentes de IA já cruzam extratos e lançamentos em segundos.', urgencia: 'Alta' },
      { item: 'Montar relatórios copiando planilhas', motivo: 'Dashboards automáticos substituem o fechamento manual.', urgencia: 'Alta' },
      { item: 'Conferir dados linha a linha', motivo: 'Regras de validação e detecção de anomalias fazem a checagem.', urgencia: 'Média' }
    ],
    aprender: [
      { competencia: 'Orquestração de IA para FP&A', aplicacao: 'Automatizar forecast, cenários e fechamento com copilotos.', ferramentas: 'Copilot no Excel, Python, Power Automate', certificacoes: 'Microsoft PL-300' },
      { competencia: 'Análise preditiva financeira', aplicacao: 'Prever fluxo de caixa e risco de crédito com modelos simples.', ferramentas: 'Power BI, Python (pandas)', certificacoes: 'CFA Data Science (módulo)' },
      { competencia: 'Storytelling com dados', aplicacao: 'Transformar números em decisões para a diretoria.', ferramentas: 'Power BI, PowerPoint', certificacoes: 'Google Data Analytics' }
    ],
    roadmap: [
      { periodo: '2026', tema: 'Automatizar a rotina', meta: 'Eliminar 50% das tarefas manuais.', acao: 'Mapear tarefas repetitivas e criar fluxos com Copilot e Power Automate.', ferramentas: 'Copilot, Power Query' },
      { periodo: '2027-2028', tema: 'Virar analista aumentado', meta: 'Entregar previsões e cenários semanais.', acao: 'Aprender Python e modelos preditivos; liderar um projeto piloto.', ferramentas: 'Python, Power BI, Azure ML' },
      { periodo: '2029-2030', tema: 'Decidir junto com a diretoria', meta: 'Assumir papel de parceiro estratégico.', acao: 'Migrar para FP&A estratégico ou auditoria de modelos de IA.', ferramentas: 'Plataformas de IA generativa, governança de dados' }
    ],
    transicoes: ['Auditor de Risco e Conformidade', 'Analista de FP&A com IA', 'Product Owner de Dados Financeiros', 'Gestor de Portfólio Quantitativo'],
    mensagem: 'Seu cargo está na zona de risco, mas sua base analítica é forte. Quem trocar a rotina manual por orquestração de IA nos próximos 24 meses passa do lado que perde para o lado que ganha.'
  };

  const LEVELS = ['Vulnerável', 'Em Transição', 'Pronto para 2030', 'Super-Trabalhador'];
  const CLASS_COLORS = { 'Vulnerável': '#F0457A', 'Em Transição': '#E07618', 'Pronto para 2030': '#F7AF20', 'Super-Trabalhador': '#F27DBD' };
  const classify = (s) => s >= 80 ? 'Super-Trabalhador' : s >= 60 ? 'Pronto para 2030' : s >= 40 ? 'Em Transição' : 'Vulnerável';
  const ROADMAP_COLORS = ['#F7AF20', '#E07618', '#E6228C'];
  const URGENCY_CLASS = { 'Alta': 'alta', 'Média': 'media', 'Baixa': 'baixa' };

  // API: na Vercel (ou no servidor_local.py) fica no mesmo endereço do site.
  // Abrindo o arquivo direto (file://), procura o servidor local em http://127.0.0.1:8000
  const API_BASE = (new URLSearchParams(location.search).get('api') || window.BUSSOLA_API ||
    (location.protocol.indexOf('http') === 0 ? '' : 'http://127.0.0.1:8000')).replace(/\/$/, '');

  /* ---------------- Utilitários ---------------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const list = (v) => Array.isArray(v) ? v : [];
  // Quebra rótulos longos em 2 linhas equilibradas (radar em telas estreitas)
  function splitLabel(label) {
    const w = String(label).split(' ');
    if (label.length <= 14 || w.length < 2) return label;
    let best = 1, bestLen = Infinity;
    for (let i = 1; i < w.length; i++) {
      const len = Math.max(w.slice(0, i).join(' ').length, w.slice(i).join(' ').length);
      if (len < bestLen) { bestLen = len; best = i; }
    }
    return [w.slice(0, best).join(' '), w.slice(best).join(' ')];
  }

  // Mascaramento LGPD (no navegador, antes de enviar)
  function maskPII(t) {
    let n = 0;
    const rep = (re, tag) => { t = t.replace(re, () => { n++; return tag; }); };
    rep(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[EMAIL]');
    rep(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF]');
    rep(/(\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/g, '[TELEFONE]');
    rep(/\b\d{5}-?\d{3}\b/g, '[CEP]');
    rep(/https?:\/\/\S+|(www\.)?(linkedin|github)\.com\/\S+/gi, '[LINK]');
    rep(/\b(rua|r\.|av\.?|avenida|travessa|alameda|rodovia|estrada|praça)\s[^\n,]+/gi, '[ENDEREÇO]');
    return { text: t, count: n };
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector('script[src="' + src + '"]')) return res();
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error('não carregou ' + src));
      document.head.appendChild(s);
    });
  }

  // Leitura do arquivo no navegador: TXT nativo, PDF com pdf.js, DOCX com mammoth
  async function readFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.txt') || name.endsWith('.md')) return await file.text();
    if (name.endsWith('.pdf')) {
      const lib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs');
      lib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';
      const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
      let out = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const c = await (await pdf.getPage(i)).getTextContent();
        out += c.items.map(it => it.str).join(' ') + '\n';
      }
      return out;
    }
    if (name.endsWith('.docx')) {
      await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js');
      const r = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return r.value;
    }
    throw new Error('Formato não suportado. Use PDF, DOCX ou TXT.');
  }

  async function callApi(path, options) {
    const res = await fetch(API_BASE + path, options);
    let data = null;
    try { data = await res.json(); } catch (e) { /* resposta sem JSON */ }
    if (!res.ok) throw Object.assign(new Error((data && data.detail) || ('Erro ' + res.status)), { http: true });
    return data;
  }

  // Garante o formato esperado mesmo se a API devolver campos faltando
  function normalize(r) {
    const o = Object.assign({}, SAMPLE, r || {});
    o.score = clamp(Math.round(num(o.score)), 0, 100);
    o.risco_automacao = clamp(Math.round(num(o.risco_automacao)), 0, 100);
    o.ganho_produtividade = Math.round(num(o.ganho_produtividade));
    o.rotina_pct = clamp(Math.round(num(o.rotina_pct, 50)), 0, 100);
    o.estrategica_pct = clamp(Math.round(num(o.estrategica_pct, 100 - o.rotina_pct)), 0, 100);
    o.anos_experiencia = Math.max(0, Math.round(num(o.anos_experiencia)));
    o.multiplicador = num(o.multiplicador, 1);
    const fix6 = (a, fb) => DIMS.map((_, i) => clamp(num(list(a)[i], fb[i]), 0, 100));
    o.radar_atual = fix6(o.radar_atual, SAMPLE.radar_atual);
    o.radar_2030 = fix6(o.radar_2030, SAMPLE.radar_2030);
    ['desaprender', 'aprender', 'roadmap', 'transicoes'].forEach(k => { o[k] = list(o[k]); });
    return o;
  }

  /* ---------------- Estado ---------------- */
  const state = { tab: 'upload', file: null, preset: '', busy: false, step: -1, result: normalize(SAMPLE), isSample: true };

  /* ---------------- Entrada ---------------- */
  const tabUpload = $('tabUpload'), tabText = $('tabText');
  const panelUpload = $('panelUpload'), panelText = $('panelText');
  const drop = $('dropzone'), fileInput = $('fileInput'), dropTitle = $('dropTitle');
  const textArea = $('resumeText'), inCargo = $('inCargo'), inAnos = $('inAnos');
  const btnAnalyze = $('btnAnalyze'), btnLabel = $('btnAnalyzeLabel'), errorBox = $('analyzeError');

  function setTab(tab, focus) {
    state.tab = tab;
    const up = tab === 'upload';
    tabUpload.setAttribute('aria-selected', String(up));
    tabText.setAttribute('aria-selected', String(!up));
    tabUpload.tabIndex = up ? 0 : -1;
    tabText.tabIndex = up ? -1 : 0;
    panelUpload.hidden = !up;
    panelText.hidden = up;
    if (focus) (up ? tabUpload : tabText).focus();
  }
  tabUpload.addEventListener('click', () => setTab('upload'));
  tabText.addEventListener('click', () => setTab('text'));
  [tabUpload, tabText].forEach(t => t.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); setTab(state.tab === 'upload' ? 'text' : 'upload', true); }
  }));

  function setError(msg) {
    errorBox.textContent = msg || '';
    errorBox.hidden = !msg;
  }

  function setFile(file) {
    if (!file) return;
    if (!/\.(pdf|docx|txt|md)$/i.test(file.name)) { setError('Formato não suportado. Use PDF, DOCX ou TXT.'); return; }
    state.file = file;
    state.preset = '';
    dropTitle.textContent = '✓ ' + file.name;
    drop.classList.add('has-file');
    setError('');
  }
  drop.addEventListener('click', () => fileInput.click());
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
  fileInput.addEventListener('change', () => setFile(fileInput.files[0]));
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('is-drag'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-drag'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('is-drag'); setFile(e.dataTransfer.files[0]); });
  textArea.addEventListener('input', () => { state.preset = ''; });

  const presetBox = $('presetList');
  PRESETS.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'b-preset';
    b.textContent = p[0];
    // Clicar preenche o formulário e já dispara a análise
    b.addEventListener('click', () => {
      setTab('text');
      textArea.value = p[3];
      inCargo.value = p[1];
      inAnos.value = String(p[2]);
      state.preset = p[0];
      analyze();
    });
    presetBox.appendChild(b);
  });

  /* ---------------- Pipeline de 5 passos ---------------- */
  const stepList = $('stepList'), stepLabel = $('stepLabel');
  stepList.innerHTML = STEPS.map((s, i) =>
    '<li class="b-step"><div class="b-step__rail"><span class="b-step__dot" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span><span class="b-step__line"></span></div>' +
    '<div class="b-step__body"><span class="b-step__title">' + (i + 1) + '. ' + esc(s[0]) + '</span><p class="b-step__desc">' + esc(s[1]) + '</p></div></li>'
  ).join('');
  const stepEls = Array.from(stepList.children);

  function setStep(step) {
    state.step = step;
    stepList.classList.toggle('is-running', step >= 0 && step < 5);
    stepEls.forEach((el, i) => {
      const done = step === 5 || step > i, active = step === i;
      el.classList.toggle('is-done', done);
      el.classList.toggle('is-active', active);
      el.querySelector('.b-step__dot').textContent = done ? '✓' : String(i + 1).padStart(2, '0');
    });
    stepLabel.textContent = step === 5 ? 'Concluído' : step >= 0 ? 'Passo ' + (step + 1) + ' de 5' : '5 passos';
  }
  setStep(-1);

  function setBusy(busy) {
    state.busy = busy;
    btnAnalyze.disabled = busy;
    btnLabel.textContent = busy ? 'Analisando…' : 'Analisar currículo';
    presetBox.querySelectorAll('button').forEach(b => { b.disabled = busy; });
  }

  /* ---------------- Análise ---------------- */
  async function analyze() {
    if (state.busy) return;
    setError('');
    const cargo = inCargo.value.trim() || null;
    const anos = inAnos.value !== '' && !isNaN(+inAnos.value) ? parseInt(inAnos.value, 10) : null;
    const useFile = state.tab === 'upload';

    if (useFile && !state.file) { setError('Escolha um arquivo de currículo (PDF, DOCX ou TXT) ou use a aba "Colar texto".'); return; }
    if (!useFile && textArea.value.trim().length < 40) { setError('Cole pelo menos algumas linhas sobre a sua experiência.'); return; }

    setBusy(true);
    setStep(0);
    const t0 = Date.now();
    const tick = setInterval(() => { if (state.step < 3) setStep(state.step + 1); }, 900);
    let json = null, errMsg = '';

    try {
      let text = useFile ? '' : textArea.value;
      if (useFile) {
        try { text = await readFile(state.file); } catch (e) { text = ''; }
      }
      if (text && text.trim().length >= 40) {
        // Dados pessoais mascarados aqui, antes de qualquer envio
        json = await callApi('/api/v1/bussola/analisar', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto: maskPII(text).text, cargo, anos })
        });
      } else if (useFile) {
        // Não deu para ler no navegador (ex.: sem internet para o pdf.js): o servidor extrai e mascara
        const fd = new FormData();
        fd.append('file', state.file);
        if (cargo) fd.append('cargo', cargo);
        if (anos !== null) fd.append('anos', String(anos));
        json = await callApi('/api/v1/bussola/analisar-arquivo', { method: 'POST', body: fd });
      } else {
        throw Object.assign(new Error('Não encontrei texto suficiente no currículo.'), { http: true });
      }
    } catch (e) {
      const presets = window.BUSSOLA_PRESET_RESULTS || {};
      if (!e.http && state.preset && presets[state.preset]) json = presets[state.preset];
      else if (e.http) errMsg = e.message;
      else errMsg = API_BASE
        ? 'Não consegui falar com o servidor da Bússola (' + API_BASE + '). Abra o site pelo "INICIAR_LOCAL.bat" e tente de novo.'
        : 'O servidor da Bússola não respondeu. Tente de novo em alguns segundos.';
    }

    // Deixa a animação dos passos aparecer mesmo quando a resposta é instantânea
    if (!reduceMotion) await wait(Math.max(0, 3600 - (Date.now() - t0)));
    clearInterval(tick);

    if (!json) {
      setBusy(false);
      setStep(-1);
      setError(errMsg || 'A análise falhou. Tente novamente em alguns segundos.');
      return;
    }
    setStep(4);
    if (!reduceMotion) await wait(700);
    state.result = normalize(json);
    state.isSample = false;
    setStep(5);
    setBusy(false);
    renderResult();
    const el = $('resultado');
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
  $('bForm').addEventListener('submit', (e) => { e.preventDefault(); analyze(); });

  /* ---------------- Resultado ---------------- */
  let radar = null;
  function drawRadar(r) {
    const el = $('chartRadar');
    if (!el || !window.Chart) return;
    const ds = [
      { label: 'Atual', data: r.radar_atual, borderColor: '#E6228C', backgroundColor: 'rgba(230,34,140,0.22)', pointBackgroundColor: '#E6228C', borderWidth: 2 },
      { label: 'Exigido em 2030', data: r.radar_2030, borderColor: '#F7AF20', backgroundColor: 'rgba(247,175,32,0.10)', pointBackgroundColor: '#F7AF20', borderWidth: 2, borderDash: [5, 4] }
    ];
    if (radar) { radar.data.datasets = ds; radar.update(); return; }
    Chart.defaults.color = '#D6C6C1';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.plugins.tooltip.backgroundColor = '#3A272B';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.14)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    if (reduceMotion) Chart.defaults.animation = false;
    radar = new Chart(el, {
      type: 'radar',
      data: { labels: DIMS, datasets: ds },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { display: false, stepSize: 25 },
            grid: { color: 'rgba(255,255,255,0.08)' },
            angleLines: { color: 'rgba(255,255,255,0.08)' },
            // Rótulos quebram em 2 linhas e diminuem em telas estreitas
            pointLabels: {
              color: '#E8DAD6',
              font: (ctx) => ({ size: ctx.chart.width < 420 ? 10.5 : 12, weight: 600 }),
              callback: (label) => splitLabel(label)
            }
          }
        }
      }
    });
  }

  function renderResult() {
    const r = state.result;
    $('sampleBadge').hidden = !state.isSample;

    // Score
    const cls = classify(r.score);
    $('gaugeArc').setAttribute('stroke-dashoffset', (527.8 * (1 - r.score / 100)).toFixed(1));
    $('scoreNum').textContent = r.score;
    const sc = $('scoreClass');
    sc.textContent = cls;
    sc.style.color = CLASS_COLORS[cls];
    $('scoreScale').innerHTML = LEVELS.map(l => {
      const on = l === cls;
      return '<div class="' + (on ? 'is-on' : '') + '"><span class="b-scale__bar"' + (on ? ' style="background:' + CLASS_COLORS[l] + '"' : '') + '></span><span class="b-scale__label">' + esc(l) + '</span></div>';
    }).join('');

    // Perfil
    $('rProfissao').textContent = r.profissao;
    $('rArea').textContent = r.area;
    $('rSenioridade').textContent = r.senioridade;
    $('rAnos').textContent = r.anos_experiencia + (r.anos_experiencia === 1 ? ' ano' : ' anos');
    $('rRotina').textContent = r.rotina_pct + '% rotina operacional';
    $('rEstrategica').textContent = r.estrategica_pct + '% estratégica';
    $('rRotinaBar').style.width = r.rotina_pct + '%';

    // Projeção
    $('rRisco').textContent = r.risco_automacao + '%';
    $('rNivel').textContent = 'Risco ' + r.nivel_risco;
    $('rGanho').textContent = '+' + r.ganho_produtividade + '%';
    $('rMult').textContent = String(r.multiplicador).replace('.', ',') + 'x produtividade';

    // Lacunas (maior distância primeiro)
    $('gapList').innerHTML = DIMS
      .map((d, i) => ({ label: d, now: r.radar_atual[i], need: r.radar_2030[i], gap: r.radar_2030[i] - r.radar_atual[i] }))
      .sort((a, b) => b.gap - a.gap)
      .map(g => {
        const color = g.gap > 25 ? '#FF8AAE' : g.gap > 10 ? '#F7AF20' : '#E8DCD8';
        return '<div><div class="b-gap__top"><span>' + esc(g.label) + '</span><span style="color:' + color + '">' + (g.gap > 0 ? '−' + g.gap + ' pts' : 'ok') + '</span></div>' +
          '<div class="b-gap__track"><span class="b-gap__need" style="width:' + g.need + '%"></span><span class="b-gap__now" style="width:' + g.now + '%"></span></div></div>';
      }).join('');

    $('desaprenderList').innerHTML = r.desaprender.map(d => {
      const u = URGENCY_CLASS[d.urgencia] || 'media';
      return '<div class="b-item"><div class="b-item__top"><span class="b-item__title">' + esc(d.item) + '</span><span class="b-urg b-urg--' + u + '">' + esc(d.urgencia || 'Média') + '</span></div><p>' + esc(d.motivo) + '</p></div>';
    }).join('');

    $('aprenderList').innerHTML = r.aprender.map(a =>
      '<div class="b-item"><span class="b-item__title b-item__title--gold">' + esc(a.competencia) + '</span><p>' + esc(a.aplicacao) + '</p>' +
      '<div class="b-item__meta"><span><strong>Ferramentas:</strong> ' + esc(a.ferramentas) + '</span><span><strong>Certificações:</strong> ' + esc(a.certificacoes) + '</span></div></div>'
    ).join('');

    $('roadmapList').innerHTML = r.roadmap.map((m, i) =>
      '<div class="b-milestone" style="--m:' + ROADMAP_COLORS[i % 3] + '"><span class="b-milestone__node"></span>' +
      '<span class="b-milestone__period">' + esc(m.periodo) + '</span><span class="b-milestone__theme">' + esc(m.tema) + '</span>' +
      '<div class="b-milestone__box"><span><strong>Meta:</strong> <span>' + esc(m.meta) + '</span></span>' +
      '<span><strong>Plano de ação:</strong> <span>' + esc(m.acao) + '</span></span>' +
      '<span><strong>Ferramentas:</strong> <span>' + esc(m.ferramentas) + '</span></span></div></div>'
    ).join('');

    $('transicoesList').innerHTML = r.transicoes.map(t => '<span class="b-chip">' + esc(t) + ' →</span>').join('');
    $('rMensagem').textContent = r.mensagem;

    drawRadar(r);
  }

  /* ---------------- Dossiê (.md) ---------------- */
  function download() {
    const r = state.result;
    const lines = [
      '# Dossiê Bússola 2030 — Prisma Insights', '',
      '**Profissão:** ' + r.profissao + ' • ' + r.area + ' • ' + r.senioridade + ' • ' + r.anos_experiencia + ' anos', '',
      '## Score de prontidão 2030: ' + r.score + '/100 (' + classify(r.score) + ')',
      '- Risco de automação: ' + r.risco_automacao + '% (' + r.nivel_risco + ')',
      '- Ganho de produtividade com IA: ' + r.ganho_produtividade + '% (' + r.multiplicador + 'x)',
      '- Rotina operacional: ' + r.rotina_pct + '% • Estratégica: ' + r.estrategica_pct + '%', '',
      '## Radar de competências (atual → 2030)', ...DIMS.map((d, i) => '- ' + d + ': ' + r.radar_atual[i] + ' → ' + r.radar_2030[i]), '',
      '## O que desaprender', ...r.desaprender.map(d => '- **' + d.item + '** (' + d.urgencia + '): ' + d.motivo), '',
      '## O que aprender agora', ...r.aprender.map(a => '- **' + a.competencia + '**: ' + a.aplicacao + ' | Ferramentas: ' + a.ferramentas + ' | Certificações: ' + a.certificacoes), '',
      '## Roadmap', ...r.roadmap.map(m => '### ' + m.periodo + ' — ' + m.tema + '\n- Meta: ' + m.meta + '\n- Plano de ação: ' + m.acao + '\n- Ferramentas: ' + m.ferramentas), '',
      '## Transições de carreira possíveis', ...r.transicoes.map(t => '- ' + t), '',
      '## Mensagem executiva', r.mensagem, '', '---', 'Gerado pela Bússola 2030 • Uma pesquisa Prisma Insights'
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dossie-bussola-2030.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  document.querySelectorAll('[data-action="download"]').forEach(b => b.addEventListener('click', download));

  renderResult();
})();
