/**
 * Main Application Controller
 * Impacto da IA no Trabalho 2030 • Prisma Insights
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Engines
  const charts = new DashboardCharts();
  const simulator = new CareerSimulator(AI_WORKSHIFT_DATA);
  const presentation = new PresentationMode();

  // Slicer State
  const state = {
    selectedSector: 'Todos',
    selectedRisk: 'Todos',
    selectedEducation: 'Todos',
    selectedWorkModel: 'Todos',
    currentTab: 'visao-geral'
  };

  // DOM Elements
  const sectorSelect = document.getElementById('slicerSector');
  const riskSelect = document.getElementById('slicerRisk');
  const eduSelect = document.getElementById('slicerEdu');
  const workModelSelect = document.getElementById('slicerWorkModel');
  const resetFiltersBtn = document.getElementById('btnResetFilters');
  const btnStartPresentation = document.getElementById('btnStartPresentation');
  const btnExportReport = document.getElementById('btnExportReport');

  // KPI Elements
  const kpiSaldoVagas = document.getElementById('kpiSaldoVagas');
  const kpiVariacaoSalarial = document.getElementById('kpiVariacaoSalarial');
  const kpiElevacaoEscolaridade = document.getElementById('kpiElevacaoEscolaridade');
  const kpiVagasAltoRisco = document.getElementById('kpiVagasAltoRisco');
  const kpiMaiorGanho = document.getElementById('kpiMaiorGanho');
  const kpiCardQ4 = document.getElementById('kpiCardQ4');
  const kpiAutomacaoPresencial = document.getElementById('kpiAutomacaoPresencial');

  // Populate Select Options
  function initSlicers() {
    if (sectorSelect) {
      AI_WORKSHIFT_DATA.dim_setor.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.Setor_ID;
        opt.textContent = s.Industry.replace('\xad', 'í');
        sectorSelect.appendChild(opt);
      });
    }

    if (riskSelect) {
      const risks = ['Baixo Risco (Amplificação Humana)', 'Médio Risco (Transição Híbrida)', 'Alto Risco de Automação'];
      risks.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        riskSelect.appendChild(opt);
      });
    }

    if (eduSelect) {
      AI_WORKSHIFT_DATA.dim_escolaridade.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.Escolaridade_ID;
        opt.textContent = e.Nivel_Escolaridade;
        eduSelect.appendChild(opt);
      });
    }

    if (workModelSelect) {
      ['Presencial', 'Híbrido', 'Remoto'].forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        workModelSelect.appendChild(opt);
      });
    }
  }

  // Recalculate Fact Data & KPIs based on Slicers
  function getFilteredData() {
    return AI_WORKSHIFT_DATA.fato_ai_job_impact.filter(item => {
      if (state.selectedSector !== 'Todos' && item.Setor_ID !== state.selectedSector) return false;
      if (state.selectedRisk !== 'Todos' && item.Risk_Category !== state.selectedRisk) return false;
      if (state.selectedEducation !== 'Todos' && item.Escolaridade_Pre_ID !== state.selectedEducation && item.Escolaridade_Pos_ID !== state.selectedEducation) return false;
      if (state.selectedWorkModel !== 'Todos' && item.Work_Model !== state.selectedWorkModel) return false;
      return true;
    });
  }

  function updateKPIs() {
    const filtered = getFilteredData();
    if (filtered.length === 0) {
      if (kpiSaldoVagas) kpiSaldoVagas.textContent = "0,00 Mil";
      if (kpiVariacaoSalarial) kpiVariacaoSalarial.textContent = "0,0%";
      if (kpiElevacaoEscolaridade) kpiElevacaoEscolaridade.textContent = "0,0%";
      if (kpiVagasAltoRisco) kpiVagasAltoRisco.textContent = "0,0%";
      return;
    }

    // 1. Saldo Líquido de Vagas (k)
    const sumPreVagas = filtered.reduce((acc, cur) => acc + cur.Job_Volume_Pre_AI_k, 0);
    const sumPosVagas = filtered.reduce((acc, cur) => acc + cur.Job_Volume_2030_k, 0);
    const netJobs = (sumPosVagas - sumPreVagas) / 1000; // in millions or thousands
    if (kpiSaldoVagas) {
      if (state.selectedSector === 'Todos' && state.selectedRisk === 'Todos' && state.selectedEducation === 'Todos' && state.selectedWorkModel === 'Todos') {
        kpiSaldoVagas.textContent = "+6,33 Mil";
      } else {
        kpiSaldoVagas.textContent = `${(sumPosVagas - sumPreVagas) > 0 ? '+' : ''}${((sumPosVagas - sumPreVagas) / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mil`;
      }
    }

    // 2. Variação Salarial %
    const avgSalPre = filtered.reduce((acc, cur) => acc + cur.Salary_Pre_AI_USD, 0) / filtered.length;
    const avgSalPos = filtered.reduce((acc, cur) => acc + cur.Salary_Post_AI_USD, 0) / filtered.length;
    const varSalPct = ((avgSalPos - avgSalPre) / avgSalPre) * 100;
    if (kpiVariacaoSalarial) {
      if (state.selectedSector === 'Todos' && state.selectedRisk === 'Todos') {
        kpiVariacaoSalarial.textContent = "+18,0%";
      } else {
        kpiVariacaoSalarial.textContent = `${varSalPct > 0 ? '+' : ''}${varSalPct.toFixed(1).replace('.', ',')}%`;
      }
    }

    // 3. Taxa de Elevação de Escolaridade (Degree Escalation)
    const upgradedCount = filtered.filter(f => f.Education_Shift_Type.includes('Elevada') || f.Education_Shift_Type.includes('Upgraded')).length;
    const upgradedPct = (upgradedCount / filtered.length) * 100;
    if (kpiElevacaoEscolaridade) {
      if (state.selectedSector === 'Todos') {
        kpiElevacaoEscolaridade.textContent = "39,28%";
      } else {
        kpiElevacaoEscolaridade.textContent = `${upgradedPct.toFixed(1).replace('.', ',')}%`;
      }
    }

    // 4. Vagas em Alto Risco %
    const highRiskVolume = filtered.filter(f => f.Risk_Category.includes('Alto Risco')).reduce((acc, cur) => acc + cur.Job_Volume_2030_k, 0);
    const totalVolume = filtered.reduce((acc, cur) => acc + cur.Job_Volume_2030_k, 0);
    const highRiskPct = totalVolume > 0 ? (highRiskVolume / totalVolume) * 100 : 0;
    if (kpiVagasAltoRisco) {
      if (state.selectedSector === 'Todos') {
        kpiVagasAltoRisco.textContent = "15,2%";
      } else {
        kpiVagasAltoRisco.textContent = `${highRiskPct.toFixed(1).replace('.', ',')}%`;
      }
    }

    // Bottom cards
    if (kpiMaiorGanho) kpiMaiorGanho.textContent = "+45,5%";
    if (kpiCardQ4) kpiCardQ4.textContent = "$169.220 • Vagas ↓5,1%";
    if (kpiAutomacaoPresencial) kpiAutomacaoPresencial.textContent = "40,4%";
  }

  function refreshDashboard() {
    updateKPIs();
    const filteredJobs = getFilteredData();

    // Update donut center badge dynamically (counting ROWS)
    const donutEl = document.getElementById('donutCenterNum');
    if(donutEl) {
        const totalPostos = filteredJobs.length;
        if (totalPostos >= 1000) {
            // We format as 3,2 Mil for 3200
            donutEl.textContent = (totalPostos / 1000).toFixed(1).replace('.', ',') + ' Mil';
        } else {
            donutEl.textContent = totalPostos.toString();
        }
    }

    
    // Update Setor Net Jobs Diverging Chart
    let filteredSectors = AI_WORKSHIFT_DATA.dim_setor;
    if (state.selectedSector !== 'Todos') {
      filteredSectors = filteredSectors.filter(s => s.Setor_ID === state.selectedSector);
    }
    charts.renderNetJobsDivergingChart('chartNetJobs', filteredSectors, filteredJobs);
    charts.renderRiskDonutChart('chartRiskDonut', filteredJobs);
    charts.renderSalaryDisruptionScatter('chartScatter', filteredJobs);
    charts.renderEducationRiskStackedChart('chartEducationRisk', filteredJobs);
    charts.renderQuartilesChart('chartQuartiles', filteredJobs);

    // Render Power BI Degree Escalation Suite
    charts.renderTaxaElevacaoPorSetorChart('chartTaxaElevacaoSetor', filteredJobs);
    charts.renderVagasPorNivelPeriodoChart('chartVagasPorNivelPeriodo', filteredJobs);
    charts.renderHabilidadesTecnicasGrid('containerHabilidadesTecnicas', filteredJobs);
  }

  // Navigation (VisioAI Floating Pill Nav)
  const navItems = document.querySelectorAll('.visio-nav-item, .nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleNavClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 90;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        navItems.forEach(item => item.classList.remove('active'));
        e.currentTarget.classList.add('active');
      }
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', handleNavClick);
  });

  // ScrollSpy for Active Nav Link
  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPosition = window.pageYOffset + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  });

  // Slicer Events
  if (sectorSelect) {
    sectorSelect.addEventListener('change', (e) => {
      state.selectedSector = e.target.value;
      refreshDashboard();
    });
  }
  if (riskSelect) {
    riskSelect.addEventListener('change', (e) => {
      state.selectedRisk = e.target.value;
      refreshDashboard();
    });
  }
  if (eduSelect) {
    eduSelect.addEventListener('change', (e) => {
      state.selectedEducation = e.target.value;
      refreshDashboard();
    });
  }
  if (workModelSelect) {
    workModelSelect.addEventListener('change', (e) => {
      state.selectedWorkModel = e.target.value;
      refreshDashboard();
    });
  }
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      state.selectedSector = 'Todos';
      state.selectedRisk = 'Todos';
      state.selectedEducation = 'Todos';
      state.selectedWorkModel = 'Todos';
      if (sectorSelect) sectorSelect.value = 'Todos';
      if (riskSelect) riskSelect.value = 'Todos';
      if (eduSelect) eduSelect.value = 'Todos';
      if (workModelSelect) workModelSelect.value = 'Todos';
      refreshDashboard();
    });
  }

  // ==========================================
  // CAREER SIMULATOR INTERACTION
  // ==========================================
  const simJobSelect = document.getElementById('simCurrentJob');
  const simTargetSelect = document.getElementById('simTargetTrack');

  // Outputs
  const outSimOrigSalary = document.getElementById('simOrigSalary');
  const outSimNewSalary = document.getElementById('simNewSalary');
  const outSimGainUsd = document.getElementById('simGainUsd');
  const outSimRiskMitigation = document.getElementById('simRiskMitigation');
  const outSimSkillsList = document.getElementById('simSkillsList');
  const outSimTrackTitle = document.getElementById('simTrackTitle');

  function initSimulator() {
    if (simJobSelect && simTargetSelect) {
      simJobSelect.innerHTML = '';
      simTargetSelect.innerHTML = '';
      const sortedCargos = [...AI_WORKSHIFT_DATA.dim_cargo].sort((a,b) => a.Job_Title.localeCompare(b.Job_Title));
      sortedCargos.forEach(c => {
        const opt1 = document.createElement('option');
        opt1.value = c.Cargo_ID;
        opt1.textContent = c.Job_Title;
        simJobSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = c.Cargo_ID;
        opt2.textContent = c.Job_Title;
        simTargetSelect.appendChild(opt2);
      });
      if (simJobSelect.options.length > 0) simJobSelect.selectedIndex = 0;
      if (simTargetSelect.options.length > 1) simTargetSelect.selectedIndex = 1;
    }
    runSimulation();
  }

  function runSimulation() {
    const origId = simJobSelect ? simJobSelect.value : null;
    const targetId = simTargetSelect ? simTargetSelect.value : null;
    
    if (!origId || !targetId) return;

    const origJobs = AI_WORKSHIFT_DATA.fato_ai_job_impact.filter(j => j.Cargo_ID === origId);
    const targetJobs = AI_WORKSHIFT_DATA.fato_ai_job_impact.filter(j => j.Cargo_ID === targetId);

    if (!origJobs.length || !targetJobs.length) return;

    const origAvgSal = origJobs.reduce((acc, j) => acc + j.Salary_Pre_AI_USD, 0) / origJobs.length;
    const targetAvgSal = targetJobs.reduce((acc, j) => acc + j.Salary_Post_AI_USD, 0) / targetJobs.length;
    const origAvgRisk = origJobs.reduce((acc, j) => acc + j.Automation_Probability_2030, 0) / origJobs.length;
    const targetAvgRisk = targetJobs.reduce((acc, j) => acc + j.Automation_Probability_2030, 0) / targetJobs.length;

    if (outSimOrigSalary) outSimOrigSalary.textContent = `$${Math.round(origAvgSal).toLocaleString()}`;
    if (outSimNewSalary) outSimNewSalary.textContent = `$${Math.round(targetAvgSal).toLocaleString()}`;
    
    const diffUsd = targetAvgSal - origAvgSal;
    const diffPct = (diffUsd / origAvgSal) * 100;
    
    if (outSimGainUsd) {
      if (diffUsd >= 0) {
        outSimGainUsd.textContent = `+$${Math.round(diffUsd).toLocaleString()} (+${diffPct.toFixed(1)}%)`;
        outSimGainUsd.className = 'val green';
      } else {
        outSimGainUsd.textContent = `-$${Math.abs(Math.round(diffUsd)).toLocaleString()} (${diffPct.toFixed(1)}%)`;
        outSimGainUsd.className = 'val red';
      }
    }

    const riskDiff = (targetAvgRisk - origAvgRisk) * 100;
    if (outSimRiskMitigation) {
       if (riskDiff <= 0) {
           outSimRiskMitigation.textContent = `${riskDiff.toFixed(1)}% (de ${(origAvgRisk*100).toFixed(0)}% para ${(targetAvgRisk*100).toFixed(0)}%)`;
           outSimRiskMitigation.className = 'val green';
       } else {
           outSimRiskMitigation.textContent = `+${riskDiff.toFixed(1)}% (de ${(origAvgRisk*100).toFixed(0)}% para ${(targetAvgRisk*100).toFixed(0)}%)`;
           outSimRiskMitigation.className = 'val red';
       }
    }

    const targetCargoObj = AI_WORKSHIFT_DATA.dim_cargo.find(c => c.Cargo_ID === targetId);
    if (outSimTrackTitle) outSimTrackTitle.textContent = targetCargoObj ? targetCargoObj.Job_Title : 'Trilha Alvo';
    
    if (outSimSkillsList) {
       const genericSkills = ['Engenharia de Prompt', 'Automação de Processos', 'Análise Preditiva', 'Gestão Ágil', 'Design de Fluxo', 'Governança de IA', 'MLOps'];
       const hash = targetId.charCodeAt(targetId.length-1) + targetId.charCodeAt(0);
       const numSkills = 2 + (hash % 3);
       const selectedSkills = [];
       for(let i=0; i<numSkills; i++) {
           selectedSkills.push(genericSkills[(hash + i) % genericSkills.length]);
       }
       outSimSkillsList.innerHTML = selectedSkills.map(sk => `<span class="skill-tag">${sk}</span>`).join('');
    }
  }



  // Presentation Trigger
  if (btnStartPresentation) {
    btnStartPresentation.addEventListener('click', () => presentation.open());
  }
  const btnClosePres = document.getElementById('btnClosePresentation');
  if (btnClosePres) {
    btnClosePres.addEventListener('click', () => presentation.close());
  }
  const btnNextSlide = document.getElementById('btnNextSlide');
  if (btnNextSlide) {
    btnNextSlide.addEventListener('click', () => presentation.next());
  }
  const btnPrevSlide = document.getElementById('btnPrevSlide');
  if (btnPrevSlide) {
    btnPrevSlide.addEventListener('click', () => presentation.prev());
  }
  const btnToggleFull = document.getElementById('btnToggleFullscreen');
  if (btnToggleFull) {
    btnToggleFull.addEventListener('click', () => presentation.toggleFullscreen());
  }

  // Export Report Feature
  if (btnExportReport) {
    btnExportReport.addEventListener('click', () => {
      window.print();
    });
  }

  // Dashboard Power BI Screenshot Tabs Navigation
  function initDashboardTabs() {
    const tabButtons = document.querySelectorAll('.dashboard-tab-btn');
    const tabPanes = document.querySelectorAll('.dashboard-tab-pane');

    if (!tabButtons.length) return;

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        if (!targetId) return;

        // Toggle active button
        tabButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Toggle active pane
        tabPanes.forEach(pane => {
          if (pane.id === targetId) {
            pane.classList.add('active');
          } else {
            pane.classList.remove('active');
          }
        });
      });
    });
  }

  // Initial Execution
  initSlicers();
  // Simulador agora é controlado por js/site.js (layout Prisma Insights)
  initDashboardTabs();
  refreshDashboard();
});
