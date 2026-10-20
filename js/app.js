/**
 * Controlador do dashboard — filtros dinâmicos, KPIs e gráficos
 * Impacto da IA no Trabalho 2030 • Prisma Insights
 */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AI_WORKSHIFT_DATA === 'undefined') return;
  const charts = new DashboardCharts();

  const state = { sector: 'Todos', risk: 'Todos', education: 'Todos', workModel: 'Todos' };
  const $ = (id) => document.getElementById(id);
  const sectorSelect = $('slicerSector');
  const riskSelect = $('slicerRisk');
  const eduSelect = $('slicerEdu');
  const workModelSelect = $('slicerWorkModel');
  const resetBtn = $('btnResetFilters');

  const kpi = {
    saldo: $('kpiSaldoVagas'),
    salario: $('kpiVariacaoSalarial'),
    escolaridade: $('kpiElevacaoEscolaridade'),
    risco: $('kpiVagasAltoRisco'),
    maiorGanho: $('kpiMaiorGanho'),
    q4: $('kpiCardQ4'),
    presencial: $('kpiAutomacaoPresencial')
  };
  const setText = (el, text) => { if (el) el.textContent = text; };
  const pct1 = (v) => `${v.toFixed(1).replace('.', ',')}%`;

  function addOption(select, value, label) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    select.appendChild(opt);
  }

  // Opções iguais às do site anterior
  function initSlicers() {
    if (sectorSelect) AI_WORKSHIFT_DATA.dim_setor.forEach(s => addOption(sectorSelect, s.Setor_ID, s.Industry));
    if (riskSelect) ['Baixo Risco (Amplificação Humana)', 'Médio Risco (Transição Híbrida)', 'Alto Risco de Automação'].forEach(r => addOption(riskSelect, r, r));
    if (eduSelect) AI_WORKSHIFT_DATA.dim_escolaridade.forEach(e => addOption(eduSelect, e.Escolaridade_ID, e.Nivel_Escolaridade));
    if (workModelSelect) ['Presencial', 'Híbrido', 'Remoto'].forEach(m => addOption(workModelSelect, m, m));
  }

  function getFilteredData() {
    return AI_WORKSHIFT_DATA.fato_ai_job_impact.filter(item => {
      if (state.sector !== 'Todos' && item.Setor_ID !== state.sector) return false;
      if (state.risk !== 'Todos' && item.Risk_Category !== state.risk) return false;
      if (state.education !== 'Todos' && item.Escolaridade_Pre_ID !== state.education && item.Escolaridade_Pos_ID !== state.education) return false;
      if (state.workModel !== 'Todos' && item.Work_Model !== state.workModel) return false;
      return true;
    });
  }

  // Sem filtros, os KPIs mostram os valores oficiais do relatório (mesmos do site anterior)
  function updateKPIs(filtered) {
    if (filtered.length === 0) {
      setText(kpi.saldo, '0,00 Mil');
      setText(kpi.salario, '0,0%');
      setText(kpi.escolaridade, '0,0%');
      setText(kpi.risco, '0,0%');
      return;
    }
    const noFilters = state.sector === 'Todos' && state.risk === 'Todos' && state.education === 'Todos' && state.workModel === 'Todos';

    const pre = filtered.reduce((acc, j) => acc + j.Job_Volume_Pre_AI_k, 0);
    const post = filtered.reduce((acc, j) => acc + j.Job_Volume_2030_k, 0);
    setText(kpi.saldo, noFilters ? '+6,33 Mil'
      : `${post - pre > 0 ? '+' : ''}${((post - pre) / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mil`);

    const salPre = filtered.reduce((acc, j) => acc + j.Salary_Pre_AI_USD, 0) / filtered.length;
    const salPost = filtered.reduce((acc, j) => acc + j.Salary_Post_AI_USD, 0) / filtered.length;
    const varSal = (salPost - salPre) / salPre * 100;
    setText(kpi.salario, state.sector === 'Todos' && state.risk === 'Todos' ? '+18,0%' : `${varSal > 0 ? '+' : ''}${pct1(varSal)}`);

    const upgraded = filtered.filter(f => f.Education_Shift_Type.includes('Elevada') || f.Education_Shift_Type.includes('Upgraded')).length;
    setText(kpi.escolaridade, state.sector === 'Todos' ? '39,28%' : pct1(upgraded / filtered.length * 100));

    const highRisk = filtered.filter(f => f.Risk_Category.includes('Alto Risco')).reduce((acc, j) => acc + j.Job_Volume_2030_k, 0);
    setText(kpi.risco, state.sector === 'Todos' ? '15,2%' : pct1(post > 0 ? highRisk / post * 100 : 0));

    setText(kpi.maiorGanho, '+45,5%');
    setText(kpi.q4, '$169.220 • Vagas ↓5,1%');
    setText(kpi.presencial, '40,4%');
  }

  function refreshDashboard() {
    const filtered = getFilteredData();
    updateKPIs(filtered);

    const total = filtered.length;
    setText($('donutCenterNum'), total >= 1000 ? (total / 1000).toFixed(1).replace('.', ',') + ' Mil' : String(total));

    const sectors = state.sector === 'Todos'
      ? AI_WORKSHIFT_DATA.dim_setor
      : AI_WORKSHIFT_DATA.dim_setor.filter(s => s.Setor_ID === state.sector);

    charts.renderNetJobsDivergingChart('chartNetJobs', sectors, filtered);
    charts.renderRiskDonutChart('chartRiskDonut', filtered);
    charts.renderSalaryDisruptionScatter('chartScatter', filtered);
    charts.renderTaxaElevacaoPorSetorChart('chartTaxaElevacaoSetor', filtered);
    charts.renderVagasPorNivelPeriodoChart('chartVagasPorNivelPeriodo', filtered);
    charts.renderHabilidadesTecnicasGrid('containerHabilidadesTecnicas', filtered);

    document.dispatchEvent(new CustomEvent('filters:change', {
      detail: { active: Object.values(state).filter(v => v !== 'Todos').length }
    }));
  }

  const bind = (select, key) => {
    if (!select) return;
    select.addEventListener('change', (e) => { state[key] = e.target.value; refreshDashboard(); });
  };
  bind(sectorSelect, 'sector');
  bind(riskSelect, 'risk');
  bind(eduSelect, 'education');
  bind(workModelSelect, 'workModel');

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      Object.keys(state).forEach(k => { state[k] = 'Todos'; });
      [sectorSelect, riskSelect, eduSelect, workModelSelect].forEach(s => { if (s) s.value = 'Todos'; });
      refreshDashboard();
    });
  }

  initSlicers();
  refreshDashboard();
});
