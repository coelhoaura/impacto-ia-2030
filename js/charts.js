/**
 * Gráficos do dashboard (Chart.js) — Impacto da IA no Trabalho 2030 • Prisma Insights
 * Tema v2: fundo grafite quente, dourado/âmbar = ganho, carmim/magenta/vinho = risco.
 * Os dados e os tipos de gráfico são os mesmos da versão anterior; muda só o estilo.
 */

const fmtBR = (v, d = 2) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

/* Rótulo de valor ao lado de cada barra horizontal */
const valueLabelsPlugin = (format) => ({
  id: 'valueLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const data = chart.data.datasets[0].data;
    ctx.save();
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#E8DAD6';
    ctx.textBaseline = 'middle';
    const area = chart.chartArea;
    meta.data.forEach((bar, i) => {
      const v = Number(data[i]);
      const text = format(v);
      const w = ctx.measureText(text).width;
      if (v >= 0) {
        // sem espaço à direita (telas estreitas): escreve dentro da barra
        const fits = bar.x + 6 + w <= area.right + 4;
        ctx.textAlign = fits ? 'left' : 'right';
        ctx.fillStyle = fits ? '#E8DAD6' : '#1A0B06';
        ctx.fillText(text, fits ? bar.x + 6 : bar.x - 6, bar.y);
      } else {
        // sem espaço à esquerda: escreve do outro lado da linha do zero
        const fits = bar.x - 6 - w >= area.left;
        ctx.textAlign = fits ? 'right' : 'left';
        ctx.fillStyle = '#E8DAD6';
        ctx.fillText(text, fits ? bar.x - 6 : bar.base + 6, bar.y);
      }
    });
    ctx.restore();
  }
});

/* Legenda à direita no desktop e embaixo em telas estreitas (zoom alto / mobile) */
const responsiveLegend = (wide, narrow = 'bottom', breakpoint = 460) => (chart, size) => {
  const pos = size.width < breakpoint ? narrow : wide;
  const legend = chart.options.plugins.legend;
  if (legend.position !== pos) { legend.position = pos; chart.update('none'); }
};

class DashboardCharts {
  constructor() {
    this.charts = {};
    if (typeof Chart !== 'undefined') {
      Chart.defaults.color = '#D6C6C1';
      Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
      Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
      Chart.defaults.font.size = 12;
      Chart.defaults.plugins.tooltip.backgroundColor = '#3A272B';
      Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
      Chart.defaults.plugins.tooltip.bodyColor = '#E8DCD8';
      Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.14)';
      Chart.defaults.plugins.tooltip.borderWidth = 1;
      Chart.defaults.plugins.tooltip.padding = 10;
      Chart.defaults.plugins.tooltip.cornerRadius = 8;
      Chart.defaults.plugins.tooltip.boxPadding = 4;
      Chart.defaults.plugins.legend.labels.boxWidth = 10;
      Chart.defaults.plugins.legend.labels.boxHeight = 10;
      Chart.defaults.plugins.legend.labels.usePointStyle = true;
      if (window.PrismaLayout && window.PrismaLayout.reduceMotion) Chart.defaults.animation = false;
    }
  }

  destroyChart(id) {
    if (this.charts[id]) {
      this.charts[id].destroy();
      delete this.charts[id];
    }
  }

  // 1. Saldo Líquido de Vagas por Indústria (tornado)
  renderNetJobsDivergingChart(canvasId, filteredSectors, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const sectors = filteredSectors || AI_WORKSHIFT_DATA.dim_setor;
    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;

    const sectorNet = {};
    sectors.forEach(s => { sectorNet[s.Setor_ID] = 0; });
    jobs.forEach(j => {
      if (sectorNet[j.Setor_ID] !== undefined) sectorNet[j.Setor_ID] += (j.Job_Volume_2030_k - j.Job_Volume_Pre_AI_k);
    });

    const sorted = sectors
      .map(s => ({ ...s, net_jobs_k: sectorNet[s.Setor_ID] || 0 }))
      .sort((a, b) => b.net_jobs_k - a.net_jobs_k);

    const labels = sorted.map(s => s.Industry);
    const data = sorted.map(s => s.net_jobs_k);
    const colors = data.map(v => v >= 5000 ? '#F7AF20' : v >= 0 ? '#E07618' : v > -3000 ? '#CB1D4E' : '#951165');
    const maxAbs = Math.max(1, ...data.map(Math.abs));

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Saldo Líquido de Vagas (Mil)',
          data,
          backgroundColor: colors,
          borderRadius: 6,
          maxBarThickness: 22
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => ` Saldo: ${c.parsed.x > 0 ? '+' : ''}${fmtBR(c.parsed.x / 1000)} Mil vagas`
            }
          }
        },
        scales: {
          x: {
            // folga para os rótulos de valor ao lado das barras
            suggestedMin: Math.min(0, ...data) - maxAbs * 0.28,
            suggestedMax: Math.max(0, ...data) + maxAbs * 0.28,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#C3B1AC', maxTicksLimit: 7, callback: (v) => `${v > 0 ? '+' : ''}${(v / 1000).toLocaleString('pt-BR')} Mil` }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#E8DAD6', font: { weight: '600' } }
          }
        }
      },
      plugins: [valueLabelsPlugin(v => `${v > 0 ? '+' : ''}${fmtBR(v / 1000)} Mil`)]
    });
  }

  // 2. Rosca — distribuição dos postos por categoria de risco
  renderRiskDonutChart(canvasId, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    const total = jobs.length;
    let low = 0, med = 0, high = 0;
    if (total > 0) {
      low = jobs.filter(j => j.Risk_Category && (j.Risk_Category.includes('Baixo') || j.Risk_Category.includes('Amplificação'))).length / total * 100;
      med = jobs.filter(j => j.Risk_Category && (j.Risk_Category.includes('Médio') || j.Risk_Category.includes('Transição'))).length / total * 100;
      high = jobs.filter(j => j.Risk_Category && j.Risk_Category.includes('Alto')).length / total * 100;
    }

    this.charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Baixo Risco (Amplificação)', 'Médio Risco (Transição Híbrida)', 'Alto Risco de Automação'],
        datasets: [{
          data: [low.toFixed(1), med.toFixed(1), high.toFixed(1)],
          backgroundColor: ['#F7AF20', '#E07618', '#CB1D4E'],
          borderWidth: 4,
          borderColor: '#2F1F22',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 }, color: '#D6C6C1' } },
          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${fmtBR(c.parsed, 1)}% dos postos monitorados` } }
        }
      }
    });
  }

  // 3. Matriz de Disrupção Salarial (bolhas 2×2)
  renderSalaryDisruptionScatter(canvasId, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    const sectorMap = {};
    AI_WORKSHIFT_DATA.dim_setor.forEach(s => { sectorMap[s.Setor_ID] = s; });
    const cargoMap = {};
    AI_WORKSHIFT_DATA.dim_cargo.forEach(c => { cargoMap[c.Cargo_ID] = c; });

    // Cor pelo quadrante: ganho (dourado/âmbar) x perda (carmim/vinho)
    const quadColor = (x, y) => y >= 0
      ? (x < 50 ? 'rgba(247,175,32,0.8)' : 'rgba(224,118,24,0.8)')
      : (x >= 70 ? 'rgba(203,29,78,0.8)' : 'rgba(149,17,101,0.8)');

    const datasets = [];
    [...new Set(jobs.map(j => j.Setor_ID))].forEach(secId => {
      const secObj = sectorMap[secId];
      if (!secObj) return;
      const cargoAgg = {};
      jobs.filter(j => j.Setor_ID === secId).forEach(j => {
        const a = cargoAgg[j.Cargo_ID] || (cargoAgg[j.Cargo_ID] = { probSum: 0, growthSum: 0, volSum: 0, salPostSum: 0, count: 0, workModel: j.Work_Model });
        a.probSum += j.Automation_Probability_2030;
        a.growthSum += j.Salary_Growth_Pct;
        a.volSum += j.Job_Volume_2030_k;
        a.salPostSum += j.Salary_Post_AI_USD;
        a.count += 1;
      });
      datasets.push({
        label: secObj.Industry,
        data: Object.keys(cargoAgg).map(cId => {
          const a = cargoAgg[cId];
          return {
            x: +((a.probSum / a.count) * 100).toFixed(1),
            y: +(a.growthSum / a.count).toFixed(2),
            r: Math.max(7, Math.min(24, Math.sqrt(a.volSum) * 1.15)),
            jobTitle: (cargoMap[cId] || {}).Job_Title || 'N/A',
            volume: a.volSum,
            salPost: a.salPostSum / a.count,
            workModel: a.workModel
          };
        }),
        backgroundColor: (c) => c.raw ? quadColor(c.raw.x, c.raw.y) : 'rgba(247,175,32,0.8)',
        borderColor: 'rgba(14,8,8,0.8)',
        borderWidth: 1
      });
    });

    const quadrants = {
      id: 'quadrants',
      beforeDatasetsDraw(chart) {
        const { ctx: g, chartArea: a, scales: { x, y } } = chart;
        g.save();
        g.setLineDash([5, 5]);
        g.strokeStyle = 'rgba(247,175,32,0.45)';
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(a.left, y.getPixelForValue(0)); g.lineTo(a.right, y.getPixelForValue(0)); g.stroke();
        g.beginPath(); g.moveTo(x.getPixelForValue(50), a.top); g.lineTo(x.getPixelForValue(50), a.bottom); g.stroke();
        g.setLineDash([]);
        g.font = `600 ${a.width < 420 ? 9.5 : 11}px "JetBrains Mono", monospace`;
        g.fillStyle = 'rgba(255,255,255,0.4)';
        g.textAlign = 'left'; g.fillText('AMPLIFICAÇÃO', a.left + 10, a.top + 16);
        g.textAlign = 'right'; g.fillText('SUPERVISÃO', a.right - 10, a.top + 16);
        g.fillText('COMPRESSÃO', a.right - 10, a.bottom - 10);
        g.restore();
      }
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bubble',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0].raw.jobTitle,
              label: (c) => [
                `Setor: ${c.dataset.label} (${c.raw.workModel})`,
                `Prob. Automação: ${fmtBR(c.raw.x, 1)}%`,
                `Variação Salarial: ${c.raw.y > 0 ? '+' : ''}${fmtBR(c.raw.y)}%`,
                `Salário Projetado: $${Math.round(c.raw.salPost).toLocaleString('pt-BR')}/ano`,
                `Volume de Vagas: ${c.raw.volume.toLocaleString('pt-BR')}k postos`
              ]
            }
          }
        },
        scales: {
          x: {
            min: 0, max: 100,
            title: { display: true, text: 'Probabilidade de automação até 2030 (%)', color: '#D6C6C1', font: { weight: '600' } },
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#C3B1AC', callback: (v) => `${v}%` }
          },
          y: {
            min: -25, max: 50,
            title: { display: true, text: 'Variação salarial projetada (%)', color: '#D6C6C1', font: { weight: '600' } },
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#C3B1AC', callback: (v) => `${v > 0 ? '+' : ''}${v}%` }
          }
        }
      },
      plugins: [quadrants]
    });
  }

  // 4. Taxa de Elevação de Escolaridade por indústria (meta 45%)
  renderTaxaElevacaoPorSetorChart(canvasId, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    const sectorMap = {};
    AI_WORKSHIFT_DATA.dim_setor.forEach(s => { sectorMap[s.Setor_ID] = s; });
    const stats = {};
    jobs.forEach(j => {
      const label = sectorMap[j.Setor_ID] ? sectorMap[j.Setor_ID].Industry : 'Outros';
      const s = stats[label] || (stats[label] = { total: 0, upgraded: 0 });
      s.total++;
      if (j.Education_Shift_Type && j.Education_Shift_Type.includes('Elevada')) s.upgraded++;
    });
    const rows = Object.keys(stats)
      .map(ind => ({ industry: ind, ratePct: stats[ind].total > 0 ? stats[ind].upgraded / stats[ind].total * 100 : 0 }))
      .sort((a, b) => b.ratePct - a.ratePct);

    const meta45 = {
      id: 'meta45',
      afterDatasetsDraw(chart) {
        const { ctx: g, chartArea: { top, bottom }, scales: { x } } = chart;
        const px = x.getPixelForValue(45);
        g.save();
        g.strokeStyle = '#E6228C';
        g.lineWidth = 1.5;
        g.setLineDash([4, 4]);
        g.beginPath(); g.moveTo(px, top); g.lineTo(px, bottom); g.stroke();
        g.setLineDash([]);
        g.fillStyle = '#F27DBD';
        g.font = '600 11px "JetBrains Mono", monospace';
        g.textAlign = 'left';
        g.textBaseline = 'bottom';
        g.fillText('META 45%', px + 6, top - 2);
        g.restore();
      }
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: rows.map(r => r.industry),
        datasets: [{
          label: 'Taxa de Elevação (%)',
          data: rows.map(r => r.ratePct),
          backgroundColor: rows.map(r => r.ratePct >= 45 ? '#F7AF20' : '#E07618'),
          borderRadius: 6,
          maxBarThickness: 20
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 18, right: 40 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => ' Taxa de Elevação: ' + c.parsed.x.toFixed(1).replace('.', ',') + '% dos cargos'
            }
          }
        },
        scales: {
          x: {
            min: 0, max: 80,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#C3B1AC', callback: (v) => `${v}%` }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#E8DAD6', font: { weight: '600', size: 11 } }
          }
        }
      },
      plugins: [meta45, valueLabelsPlugin(v => fmtBR(v, 1) + '%')]
    });
  }

  // 5. Vagas por nível de escolaridade — Pré-IA vs 2030 (100% empilhado)
  renderVagasPorNivelPeriodoChart(canvasId, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    const levels = ['Ensino Médio', 'Tecnólogo', 'Bacharelado', 'Mestrado', 'Doutorado (PhD)'];
    const colors = ['#CB1D4E', '#951165', '#E07618', '#F7AF20', '#D83C15'];
    const levelMap = { ESC_01: 0, ESC_02: 1, ESC_03: 2, ESC_04: 3, ESC_05: 4 };
    const preCounts = [0, 0, 0, 0, 0];
    const postCounts = [0, 0, 0, 0, 0];

    jobs.forEach(j => {
      let preIdx = 2, postIdx = 2; // fallback
      Object.keys(levelMap).forEach(key => {
        if (j.Escolaridade_Pre_ID && j.Escolaridade_Pre_ID.includes(key)) preIdx = levelMap[key];
        if (j.Escolaridade_Pos_ID && j.Escolaridade_Pos_ID.includes(key)) postIdx = levelMap[key];
      });
      preCounts[preIdx] += 1;
      postCounts[postIdx] += 1;
    });
    const total = jobs.length;

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Pré-IA', '2030'],
        datasets: levels.map((lvl, i) => ({
          label: lvl,
          data: [
            total > 0 ? +(preCounts[i] / total * 100).toFixed(1) : 0,
            total > 0 ? +(postCounts[i] / total * 100).toFixed(1) : 0
          ],
          backgroundColor: colors[i],
          borderColor: '#2F1F22',
          borderWidth: 1,
          barPercentage: 0.6
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onResize: responsiveLegend('right'),
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: '#E8DAD6', font: { weight: '700', size: 13 } } },
          y: { stacked: true, max: 100, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#C3B1AC', callback: (v) => `${v}%` } }
        },
        plugins: {
          legend: { position: ctx.parentElement && ctx.parentElement.clientWidth < 460 ? 'bottom' : 'right', labels: { padding: 12, font: { size: 11 }, color: '#D6C6C1' } },
          tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${fmtBR(c.parsed.y, 1)}%` } }
        }
      }
    });
  }

  // 6. Habilidades técnicas mais valorizadas (treemap proporcional)
  renderHabilidadesTecnicasGrid(containerId, jobsData) {
    const container = document.getElementById(containerId);
    if (!container || typeof window.renderTreemapHabilidades !== 'function') return;

    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    const cargoDict = {};
    AI_WORKSHIFT_DATA.dim_cargo.forEach(c => { cargoDict[c.Cargo_ID] = c; });
    const skillMap = {};
    jobs.forEach(j => {
      const cargo = cargoDict[j.Cargo_ID];
      if (!cargo || !cargo.Primary_Emerging_Skill) return;
      const name = cargo.Primary_Emerging_Skill;
      skillMap[name] = (skillMap[name] || 0) + j.Job_Volume_2030_k;
    });
    const top = Object.keys(skillMap)
      .map(label => ({ label, vagas_k: skillMap[label] }))
      .sort((a, b) => b.vagas_k - a.vagas_k)
      .slice(0, 10);
    const total = top.reduce((s, d) => s + d.vagas_k, 0) || 1;
    window.renderTreemapHabilidades(container, top.map(d => ({ ...d, pct: +(d.vagas_k / total * 100).toFixed(1) })));
  }
}

window.DashboardCharts = DashboardCharts;
