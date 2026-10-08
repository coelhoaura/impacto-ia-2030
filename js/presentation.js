/**
 * Interactive Presentation & Slide Deck Mode for Course Final Defense
 * Inspired by Modern & Clean SaaS Design (Figma SaaS Community Reference)
 */

class PresentationMode {
  constructor() {
    this.currentSlide = 0;
    this.isFullscreen = false;
    this.slides = [
      {
        id: "slide_1",
        category: "01 / 07 • Abertura Executiva",
        title: "Impacto da IA no Trabalho 2030",
        subtitle: "Diagnóstico Empírico de People Analytics & Decisão Estratégica de R$ 15 Milhões",
        speakerNote: "Bom dia a todos os membros da banca examinadora. Hoje apresentamos a pesquisa 'Impacto da IA no Trabalho 2030', desenvolvida pela Prisma Insights para orientar uma multinacional de 35.000 colaboradores a tomar decisões baseadas em dados frente às transformações da Inteligência Artificial.",
        render: () => `
          <div class="saas-slide-hero">
            <div class="saas-badge-pill">
              <span class="saas-badge-dot"></span> PRISMA INSIGHTS &bull; PEOPLE ANALYTICS
            </div>
            
            <h1 class="saas-slide-title">
              Impacto da IA no Trabalho <span class="saas-gradient-text">2030</span>
            </h1>
            
            <p class="saas-slide-lead">
              Modelagem quantitativa sobre <strong>3.755 salários reais</strong> e <strong>3.200 postos de trabalho</strong> para desmistificar o pânico corporativo, comprovar a bifurcação salarial e otimizar o capital de requalificação.
            </p>

            <div style="max-width: 780px; margin: 0 auto 24px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-glass); height: 180px;">
              <img src="assets/images/hero-ai-workforce.jpg" alt="Impacto da IA no Trabalho 2030" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.9);">
            </div>

            <div class="saas-kpi-grid">
              <div class="saas-kpi-card green">
                <span class="saas-kpi-val">+6,33 Mil</span>
                <span class="saas-kpi-lbl">Saldo Líquido de Vagas</span>
                <span class="saas-kpi-trend">↑ Expansão Tech & Saúde</span>
              </div>
              <div class="saas-kpi-card amber">
                <span class="saas-kpi-val">+18,0%</span>
                <span class="saas-kpi-lbl">Variação Salarial Média</span>
                <span class="saas-kpi-trend">↑ Bônus de Produtividade</span>
              </div>
              <div class="saas-kpi-card terracotta">
                <span class="saas-kpi-val">39,28%</span>
                <span class="saas-kpi-lbl">Degree Escalation</span>
                <span class="saas-kpi-trend">↑ Exigência Formal</span>
              </div>
            </div>
          </div>
        `
      },
      {
        id: "slide_2",
        category: "02 / 07 • Contexto & Dilema",
        title: "1. O Dilema de Negócio do Cliente",
        subtitle: "Multinacional de 35.000 Colaboradores: Pânico vs. Decisão Baseada em Dados",
        speakerNote: "O cenário de partida: nosso cliente corporativo enfrentava forte instabilidade interna gerada por notícias de que a IA eliminaria metade dos empregos. O Comitê de Pessoas aprovou R$ 15 milhões para capacitação, mas estava rachado entre investir em MBAs tradicionais lentos de 2 anos ou pulverizar tudo em cursos rápidos sem comprovação. Nossa missão foi fornecer um diagnóstico quantitativo irrefutável.",
        render: () => `
          <div class="saas-two-col">
            <div class="saas-card-box">
              <div class="saas-card-tag danger">⚠️ O PÂNICO ORGANIZACIONAL</div>
              <h3 class="saas-box-title">Incerteza & Paralisia Orçamentária</h3>
              <ul class="saas-feature-list">
                <li><strong>Ansiedade e Turnover:</strong> Equipes temendo substituição sumária por LLMs e agentes autônomos.</li>
                <li><strong>R$ 15M Aprovados sem Direcionamento:</strong> Risco iminente de alocação ineficiente do capital de T&D.</li>
                <li><strong>Duelo Interno no Board:</strong> Pós-Graduações de 2 anos (RH tradicional) <em>versus</em> Microcredenciais pontuais de IA (CDO).</li>
              </ul>
            </div>

            <div class="saas-card-box highlight">
              <div style="height: 120px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 14px; border: 1px solid var(--border-glass);">
                <img src="assets/images/ai-human-collaboration.jpg" alt="IA e People Analytics" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <div class="saas-card-tag success">🎯 A MISSÃO DO ANALISTA</div>
              <h3 class="saas-box-title">Abordagem Empírica & Modelagem</h3>
              <p class="saas-box-text">
                Cruzamento analítico de <strong>3.755 salários reais</strong> com <strong>3.200 ocupações</strong> mapeadas por risco de automação, nível de escolaridade e modelo de trabalho.
              </p>
              <div class="saas-badge-cluster">
                <span class="saas-chip">People Analytics</span>
                <span class="saas-chip">What-If Simulator</span>
                <span class="saas-chip">Disruption Matrix</span>
                <span class="saas-chip">Degree Escalation</span>
              </div>
            </div>
          </div>
        `
      },
      {
        id: "slide_3",
        category: "03 / 07 • Hipóteses Científicas",
        title: "2. As 4 Hipóteses de Negócio Confrontadas",
        subtitle: "Avaliando as Suposições do Mercado contra a Base Empírica",
        speakerNote: "Estruturamos a investigação científica em 4 hipóteses centrais de mercado. Três delas foram refutadas pelos dados e uma foi confirmada, desmistificando as falácias mais comuns sobre a IA no trabalho.",
        render: () => `
          <div class="saas-grid-4">
            <div class="saas-hypo-card rejected">
              <div class="saas-hypo-header">
                <span class="saas-hypo-num">H1</span>
                <span class="saas-status-badge red">REFUTADA</span>
              </div>
              <h4>Destruição Líquida de Vagas</h4>
              <p>O mercado gera saldo positivo (+6,33k vagas). A perda em Varejo e Mídia é superada pelo crescimento acelerado em Tecnologia (+12,9k) e Saúde (+2,8k).</p>
            </div>

            <div class="saas-hypo-card rejected">
              <div class="saas-hypo-header">
                <span class="saas-hypo-num">H2</span>
                <span class="saas-status-badge red">REFUTADA</span>
              </div>
              <h4>Compressão Salarial Ampla</h4>
              <p>Ocorre forte <em>bifurcação salarial</em>: cargos amplificados ganham +21,95%, enquanto apenas tarefas puramente rotineiras sofrem retração (-11,21%).</p>
            </div>

            <div class="saas-hypo-card rejected">
              <div class="saas-hypo-header">
                <span class="saas-hypo-num">H3</span>
                <span class="saas-status-badge red">REFUTADA</span>
              </div>
              <h4>Desvalorização dos Diplomas</h4>
              <p>Em 39,28% das posições ocorreu <strong>Degree Escalation</strong>. O diploma formal de nível superior tornou-se barreira de entrada para supervisão e auditoria de IA.</p>
            </div>

            <div class="saas-hypo-card verified">
              <div class="saas-hypo-header">
                <span class="saas-hypo-num">H4</span>
                <span class="saas-status-badge green">CONFIRMADA</span>
              </div>
              <h4>Imunidade das Funções Físicas</h4>
              <p>Funções com contato humano presencial e destreza física direta mantêm probabilidade de automação abaixo de 25% e headcount estável.</p>
            </div>
          </div>
        `
      },
      {
        id: "slide_4",
        category: "04 / 07 • Matriz de Disrupção",
        title: "3. Matriz de Disrupção 2x2 & Teoria Econômica",
        subtitle: "Efeito Deslocamento vs. Efeito Amplificação (Autor & Acemoglu)",
        speakerNote: "A matriz de 4 quadrantes ilustra com clareza o comportamento econômico: o cluster de amplificação combina baixa probabilidade de substituição com salto na remuneração. Já o quadrante de substituição exige reskilling imediato para evitar custos trabalhistas.",
        render: () => `
          <div class="saas-quad-grid">
            <div class="saas-quad-box q-amplification">
              <div class="saas-quad-header">
                <span class="saas-quad-pill green">QUADRANTE 1</span>
                <strong>AMPLIFICAÇÃO COGNITIVA</strong>
              </div>
              <p class="saas-quad-stat">+21,95% Salário &bull; Automação &lt; 20%</p>
              <span class="saas-quad-examples">ML Engineer, Quant Manager, AI Solutions Architect, Biomedical Scientist</span>
            </div>

            <div class="saas-quad-box q-transition">
              <div class="saas-quad-header">
                <span class="saas-quad-pill amber">QUADRANTE 2</span>
                <strong>TRANSIÇÃO HÍBRIDA</strong>
              </div>
              <p class="saas-quad-stat">+12,40% Salário &bull; Automação 20% a 50%</p>
              <span class="saas-quad-examples">Full Stack Developer, Financial Analyst, People Analytics, AI Ethics Officer</span>
            </div>

            <div class="saas-quad-box q-substitution">
              <div class="saas-quad-header">
                <span class="saas-quad-pill red">QUADRANTE 3</span>
                <strong>SUBSTITUIÇÃO ROTINEIRA</strong>
              </div>
              <p class="saas-quad-stat">-11,21% Salário &bull; Automação &gt; 50%</p>
              <span class="saas-quad-examples">Bank Teller, Data Entry, Copywriter, Customer Support Tier 1</span>
            </div>

            <div class="saas-quad-box q-stability">
              <div class="saas-quad-header">
                <span class="saas-quad-pill blue">QUADRANTE 4</span>
                <strong>RESILIÊNCIA FÍSICA</strong>
              </div>
              <p class="saas-quad-stat">+7,10% Salário &bull; Automação &lt; 25%</p>
              <span class="saas-quad-examples">Clinical Nurse Specialist, Physical Therapist, Industrial Systems Tech</span>
            </div>
          </div>
        `
      },
      {
        id: "slide_5",
        category: "05 / 07 • Capital Humano",
        title: "4. O Novo Filtro Educacional & Degree Escalation",
        subtitle: "39,28% dos Cargos Exigem Elevação Formal de Escolaridade",
        speakerNote: "Um dos achados mais contraintuitivos do estudo: a IA não tornou os diplomas obsoletos. Pelo contrário, para operar ferramentas avançadas e supervisionar algoritmos críticos em Saúde e Tecnologia, 39.28% dos cargos passaram a exigir nível superior ou pós-graduação.",
        render: () => `
          <div class="saas-two-col">
            <div class="saas-card-box highlight">
              <div class="saas-card-tag terracotta">📊 ACHADO CENTRAL: DEGREE ESCALATION</div>
              <h3 class="saas-box-title">Por que a Exigência Subiu?</h3>
              <p class="saas-box-text">
                Diferente da automação fabril clássica que simplificava tarefas, a IA Generativa assume tarefas básicas e deixa para o humano a <strong>auditoria, formulação de hipóteses e validação de segurança ética</strong>.
              </p>
              <div class="saas-stat-bar-group" style="margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700;">
                  <span>Saúde & Biotecnologia</span>
                  <span style="color: var(--color-success);">48,2% Upgraded</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-top: 8px;">
                  <span>Tecnologia & Dados</span>
                  <span style="color: var(--secondary-amber);">46,8% Upgraded</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-top: 8px;">
                  <span>Serviços Financeiros</span>
                  <span style="color: var(--primary-terracotta);">42,0% Upgraded</span>
                </div>
              </div>
            </div>

            <div class="saas-card-box">
              <div class="saas-card-tag blue">💡 DIRETRIZ ESTRATÉGICA PARA T&D</div>
              <h3 class="saas-box-title">O Fim da Dicotomia Diploma vs Cursos Rápidos</h3>
              <ul class="saas-feature-list">
                <li><strong>Microcredenciais Práticas:</strong> Fundamentais para velocidade de adoção (Prompting, MLOps, Automação).</li>
                <li><strong>Pós-Graduações Especializadas:</strong> Indispensáveis para cargos que exigem conformidade regulatória e validação algorítmica.</li>
                <li><strong>A Solução Ótima:</strong> Uma grade modularizada que combina aplicação imediata com titulação acadêmica.</li>
              </ul>
            </div>
          </div>
        `
      },
      {
        id: "slide_6",
        category: "06 / 07 • Decisão Estratégica",
        title: "5. Otimização do Orçamento de R$ 15 Milhões",
        subtitle: "Alocação Balanceada nos 4 Pilares Estratégicos com Payback de 8,4 meses",
        speakerNote: "Com esses dados, respondemos com segurança à diretoria da multinacional: aprovamos a divisão do orçamento em 4 pilares estratégicos, equilibrando agilidade prática, formação de alta liderança técnica, requalificação dos cargos vulneráveis e infraestrutura de governança de dados.",
        render: () => `
          <div class="saas-grid-4">
            <div class="saas-budget-card b-amber">
              <div class="saas-budget-header">
                <span class="saas-pct-tag">43,3%</span>
                <span class="saas-val-tag">R$ 6,5 Mi</span>
              </div>
              <h4>Pilar 1: Microcredenciais & Labs</h4>
              <p>4.200 colaboradores em Prompt Engineering, MLOps e Automação de Agentes com payback rápido de 2,2 meses.</p>
            </div>

            <div class="saas-budget-card b-terracotta">
              <div class="saas-budget-header">
                <span class="saas-pct-tag">26,7%</span>
                <span class="saas-val-tag">R$ 4,0 Mi</span>
              </div>
              <h4>Pilar 2: Pós-Graduação Executiva</h4>
              <p>350 especialistas em AI Governance, Bioinformática e Arquitetura de Dados em programas de 18 meses.</p>
            </div>

            <div class="saas-budget-card b-green">
              <div class="saas-budget-header">
                <span class="saas-pct-tag">20,0%</span>
                <span class="saas-val-tag">R$ 3,0 Mi</span>
              </div>
              <h4>Pilar 3: Academias de Reskilling</h4>
              <p>Trilhas imersivas de 6 meses para migrar profissionais de Alto Risco (Varejo, Suporte) para Analistas de Operações IA.</p>
            </div>

            <div class="saas-budget-card b-blue">
              <div class="saas-budget-header">
                <span class="saas-pct-tag">10,0%</span>
                <span class="saas-val-tag">R$ 1,5 Mi</span>
              </div>
              <h4>Pilar 4: Learning Analytics</h4>
              <p>Plataforma de People Analytics, auditoria contínua de competências e medição de ROI em tempo real.</p>
            </div>
          </div>
        `
      },
      {
        id: "slide_7",
        category: "07 / 07 • Defesa Final (STAR)",
        title: "6. Conclusão & Defesa pelo Método STAR",
        subtitle: "Síntese Executiva de Entrega de Alto Impacto para a Banca",
        speakerNote: "Para concluir minha defesa, sintetizo todo o projeto pelo método STAR: Situação de pânico e indefinição orçamentária, Tarefa de conduzir um diagnóstico quantitativo rigoroso, Ação com modelagem em People Analytics e simulador What-If, e Resultado comprovando saldo positivo (+6.33k), bifurcação salarial (+21.9% vs -11.2%), Degree Escalation (39.3%) e alocação precisa de R$ 15 milhões com payback em 8,4 meses. Muito obrigado e estou pronto para a arguição!",
        render: () => `
          <div class="saas-star-deck">
            <div class="saas-star-card s">
              <div class="saas-star-badge">S</div>
              <h4>SITUAÇÃO</h4>
              <p>Multinacional de 35.000 colaboradores em pânico por manchetes alarmistas de demissões em massa e com R$ 15M travados no Comitê de Pessoas.</p>
            </div>

            <div class="saas-star-card t">
              <div class="saas-star-badge">T</div>
              <h4>TAREFA</h4>
              <p>Conduzir um diagnóstico quantitativo rigoroso em People Analytics, desmistificando mitos através da modelagem de 3.755 salários e 3.200 ocupações.</p>
            </div>

            <div class="saas-star-card a">
              <div class="saas-star-badge">A</div>
              <h4>AÇÃO</h4>
              <p>Modelagem empírica de People Analytics, Matriz de Disrupção 2x2, Simulador de Decisão What-If e Plano de Alocação Orçamentária.</p>
            </div>

            <div class="saas-star-card r">
              <div class="saas-star-badge">R</div>
              <h4>RESULTADO</h4>
              <p>Comprovação de saldo positivo (+6,33k vagas), identificação de bifurcação (+21,9% vs -11,2%), Degree Escalation (39,3%) e alocação de R$ 15M com payback em 8,4 meses.</p>
            </div>
          </div>
        `
      }
    ];
  }

  open() {
    const modal = document.getElementById('presentationModal');
    if (!modal) return;
    modal.classList.add('active');
    this.currentSlide = 0;
    this.renderSlide();
    this.initThumbnails();
    if (!this._kh) this._kh = this.handleKeyPress.bind(this);
    document.addEventListener('keydown', this._kh);
  }

  close() {
    const modal = document.getElementById('presentationModal');
    if (!modal) return;
    modal.classList.remove('active');
    if (this.isFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (this._kh) document.removeEventListener('keydown', this._kh);
  }

  toggleFullscreen() {
    const modal = document.getElementById('presentationModal');
    if (!modal) return;
    if (!document.fullscreenElement) {
      modal.requestFullscreen().then(() => {
        this.isFullscreen = true;
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen = false;
      }).catch(() => {});
    }
  }

  next() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
      this.renderSlide();
    }
  }

  prev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.renderSlide();
    }
  }

  goTo(index) {
    if (index >= 0 && index < this.slides.length) {
      this.currentSlide = index;
      this.renderSlide();
    }
  }

  handleKeyPress(e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      this.next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      this.prev();
    } else if (e.key === 'Escape') {
      this.close();
    } else if (e.key === 'f' || e.key === 'F') {
      this.toggleFullscreen();
    }
  }

  initThumbnails() {
    const thumbContainer = document.getElementById('deckStepDots');
    if (!thumbContainer) return;
    thumbContainer.innerHTML = '';

    this.slides.forEach((slide, idx) => {
      const dot = document.createElement('button');
      dot.className = `deck-step-dot ${idx === this.currentSlide ? 'active' : ''}`;
      dot.title = `Slide ${idx + 1}: ${slide.title}`;
      dot.addEventListener('click', () => this.goTo(idx));
      thumbContainer.appendChild(dot);
    });
  }

  renderSlide() {
    const slide = this.slides[this.currentSlide];
    const container = document.getElementById('presentationContent');
    const headerTitle = document.getElementById('slideHeaderTitle');
    const headerSub = document.getElementById('slideHeaderSub');
    const headerCat = document.getElementById('slideCategoryPill');
    const progressEl = document.getElementById('slideProgressFill');
    const counterEl = document.getElementById('slideCounter');
    const noteEl = document.getElementById('speakerNoteText');

    if (headerTitle) headerTitle.textContent = slide.title;
    if (headerSub) headerSub.textContent = slide.subtitle;
    if (headerCat) headerCat.textContent = slide.category;
    if (container) {
      container.innerHTML = slide.render();
      container.scrollTop = 0;
    }
    if (progressEl) progressEl.style.width = `${((this.currentSlide + 1) / this.slides.length) * 100}%`;
    if (counterEl) counterEl.textContent = `${this.currentSlide + 1} / ${this.slides.length}`;
    if (noteEl) noteEl.textContent = slide.speakerNote;

    // Update Step Dots
    const dots = document.querySelectorAll('.deck-step-dot');
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === this.currentSlide);
    });
  }
}

window.PresentationMode = PresentationMode;
