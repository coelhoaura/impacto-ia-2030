/**
 * Data Visualizations & Charts matching Modern Clean SaaS Design
 * Impacto da IA no Trabalho 2030 • Prisma Insights (tema escuro)
 * Executive Light Theme & Custom 9-Color Palette
 */

class DashboardCharts {
  constructor() {
    this.charts = {};
    // Set global Chart.js defaults for Executive Light Theme
    if (typeof Chart !== 'undefined') {
      Chart.defaults.color = '#D6C6C1';
      Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
      Chart.defaults.font.family = "'Plus Jakarta Sans', 'Outfit', sans-serif";
      Chart.defaults.font.size = 12;
      Chart.defaults.plugins.tooltip.backgroundColor = '#3A272B';
      Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
      Chart.defaults.plugins.tooltip.bodyColor = '#E2E8F0';
      Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.15)';
      Chart.defaults.plugins.tooltip.borderWidth = 1;
      Chart.defaults.plugins.tooltip.padding = 12;
      Chart.defaults.plugins.tooltip.cornerRadius = 8;
      Chart.defaults.plugins.tooltip.boxPadding = 4;
    }
  }

  destroyChart(id) {
    if (this.charts[id]) {
      this.charts[id].destroy();
      delete this.charts[id];
    }
  }

  // 1. Saldo Líquido de Vagas por Indústria (Diverging Bar Chart)
  renderNetJobsDivergingChart(canvasId, filteredSectors, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const sectors = filteredSectors || AI_WORKSHIFT_DATA.dim_setor;
    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;

    const sectorNet = {};
    sectors.forEach(s => sectorNet[s.Setor_ID] = 0);
    jobs.forEach(j => {
        if (sectorNet[j.Setor_ID] !== undefined) {
            sectorNet[j.Setor_ID] += (j.Job_Volume_2030_k - j.Job_Volume_Pre_AI_k);
        }
    });
    
    const enrichedSectors = sectors.map(s => ({
        ...s,
        net_jobs_k: sectorNet[s.Setor_ID] || 0
    }));

    const sorted = enrichedSectors.sort((a, b) => b.net_jobs_k - a.net_jobs_k);

    const labels = sorted.map(s => s.Industry);
    const data = sorted.map(s => s.net_jobs_k);
    const backgroundColors = data.map(v => v >= 5000 ? '#F7AF20' : v >= 0 ? '#E07618' : v > -3000 ? '#CB1D4E' : '#951165');
    const borderColors = backgroundColors;

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Saldo Líquido de Vagas (Mil)',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 6
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
              label: (ctx) => ` Saldo: ${ctx.parsed.x > 0 ? '+' : ''}${(ctx.parsed.x / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mil vagas`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: {
              color: '#C3B1AC',
              callback: (v) => `${v > 0 ? '+' : ''}${(v / 1000).toLocaleString('pt-BR')} Mil`
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#E8DAD6', font: { weight: '600' } }
          }
        }
      }
    });
  }

  // 2. Donut Chart - Distribuição de Vagas por Categoria de Risco
  renderRiskDonutChart(canvasId, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    const totalVolume = jobs.length;
    
    let low = 0, med = 0, high = 0;
    if (totalVolume > 0) {
      low = (jobs.filter(j => j.Risk_Category && (j.Risk_Category.includes('Baixo') || j.Risk_Category.includes('Amplificação'))).length / totalVolume) * 100;
      med = (jobs.filter(j => j.Risk_Category && (j.Risk_Category.includes('Médio') || j.Risk_Category.includes('Transição'))).length / totalVolume) * 100;
      high = (jobs.filter(j => j.Risk_Category && j.Risk_Category.includes('Alto')).length / totalVolume) * 100;
    }

    const labels = [
      'Baixo Risco (Amplificação)',
      'Médio Risco (Transição Híbrida)',
      'Alto Risco de Automação'
    ];
    const data = [low.toFixed(1), med.toFixed(1), high.toFixed(1)];
    const colors = ['#F7AF20', '#E07618', '#CB1D4E'];

    this.charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#2F1F22',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, padding: 12, font: { size: 11 }, color: '#D6C6C1' }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}% dos postos monitorados`
            }
          }
        }
      }
    });
  }

  // 3. Matriz de Disrupção Salarial (2x2 Scatter Plot)
  renderSalaryDisruptionScatter(canvasId, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;

    const sectorMap = {};
    AI_WORKSHIFT_DATA.dim_setor.forEach(s => sectorMap[s.Setor_ID] = s);
    const cargoMap = {};
    AI_WORKSHIFT_DATA.dim_cargo.forEach(c => cargoMap[c.Cargo_ID] = c);

    const datasets = [];
    const secIds = [...new Set(jobs.map(j => j.Setor_ID))];

    secIds.forEach(secId => {
      const secObj = sectorMap[secId];
      if(!secObj) return;
      const secLabel = secObj.Industry.replace('\\xad', 'í');
      const secColor = ({'#580704':'#FF8AAE','#780D34':'#F0457A'})[secObj.color] || secObj.color || '#C3B1AC';
      const secJobs = jobs.filter(j => j.Setor_ID === secId);
      
      // AGGREGATE BY CARGO_ID
      const cargoAgg = {};
      secJobs.forEach(j => {
          if (!cargoAgg[j.Cargo_ID]) {
              cargoAgg[j.Cargo_ID] = {
                  probSum: 0,
                  growthSum: 0,
                  volSum: 0,
                  salPostSum: 0,
                  count: 0,
                  workModel: j.Work_Model // Just pick one
              };
          }
          cargoAgg[j.Cargo_ID].probSum += j.Automation_Probability_2030;
          cargoAgg[j.Cargo_ID].growthSum += j.Salary_Growth_Pct;
          cargoAgg[j.Cargo_ID].volSum += j.Job_Volume_2030_k;
          cargoAgg[j.Cargo_ID].salPostSum += j.Salary_Post_AI_USD;
          cargoAgg[j.Cargo_ID].count += 1;
      });

      const aggregatedData = Object.keys(cargoAgg).map(cId => {
          const agg = cargoAgg[cId];
          const cObj = cargoMap[cId] || {};
          return {
            x: +((agg.probSum / agg.count) * 100).toFixed(1),
            y: +(agg.growthSum / agg.count).toFixed(2),
            r: Math.max(7, Math.min(24, Math.sqrt(agg.volSum) * 1.15)),
            jobTitle: cObj.Job_Title || 'N/A',
            volume: agg.volSum,
            salPost: agg.salPostSum / agg.count,
            workModel: agg.workModel
          };
      });
      
      datasets.push({
        label: secLabel,
        data: aggregatedData,
        backgroundColor: secColor + 'CC',
        borderColor: secColor,
        borderWidth: 1.5
      });
    });

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bubble',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, font: { size: 11 }, color: '#D6C6C1' } },
          tooltip: {
            callbacks: {
              title: (items) => items[0].raw.jobTitle,
              label: (ctx) => [
                `Setor: ${ctx.dataset.label} (${ctx.raw.workModel})`,
                `Prob. Automação: ${ctx.raw.x}%`,
                `Variação Salarial: ${ctx.raw.y > 0 ? '+' : ''}${ctx.raw.y}%`,
                `Salário Projetado: $${ctx.raw.salPost.toLocaleString()}/ano`,
                `Volume de Vagas: ${ctx.raw.volume}k postos`
              ]
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Probabilidade de Automação de Tarefas (%)', color: '#D6C6C1', font: { weight: '600' } },
            min: 0,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#C3B1AC' }
          },
          y: {
            title: { display: true, text: 'Variação Salarial Projetada 2020-2030 (%)', color: '#D6C6C1', font: { weight: '600' } },
            min: -25,
            max: 50,
            grid: { color: (ctx) => ctx.tick.value === 0 ? 'rgba(247,175,32,0.45)' : 'rgba(255,255,255,0.06)' },
            ticks: { color: '#C3B1AC', callback: (v) => `${v > 0 ? '+' : ''}${v}%` }
          }
        }
      }
    });
  }

  // 4. Stacked Column Chart - Nível de Ensino vs Categoria de Risco
  renderEducationRiskStackedChart(canvasId, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    
    
    
        const levelMap = {
        'ESC_01': 0,
        'ESC_02': 1,
        'ESC_03': 2,
        'ESC_04': 3,
        'ESC_05': 4
    };
    const labels = AI_WORKSHIFT_DATA.dim_escolaridade.map(e => e.Nivel_Escolaridade);
    
    const dataLowRisk = [0,0,0,0,0];
    const dataMedRisk = [0,0,0,0,0];
    const dataHighRisk = [0,0,0,0,0];
    const totals = [0,0,0,0,0];
    
    jobs.forEach(j => {
        let idx = -1;
        for (let key in levelMap) {
            if (j.Escolaridade_Pos_ID && j.Escolaridade_Pos_ID.includes(key)) idx = levelMap[key];
        }
        if (idx === -1) idx = 2; // default fallback
        
        let vol = 1; // Count rows!
        totals[idx] += vol;
        if (j.Risk_Category && (j.Risk_Category.includes('Baixo') || j.Risk_Category.includes('Amplificação'))) dataLowRisk[idx] += vol;
        else if (j.Risk_Category && (j.Risk_Category.includes('Médio') || j.Risk_Category.includes('Transição'))) dataMedRisk[idx] += vol;
        else if (j.Risk_Category && j.Risk_Category.includes('Alto')) dataHighRisk[idx] += vol;
    });
    
    for (let i = 0; i < 5; i++) {
        if (totals[i] > 0) {
            dataLowRisk[i] = (dataLowRisk[i] / totals[i] * 100).toFixed(1);
            dataMedRisk[i] = (dataMedRisk[i] / totals[i] * 100).toFixed(1);
            dataHighRisk[i] = (dataHighRisk[i] / totals[i] * 100).toFixed(1);
        }
    }

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Baixo Risco (Amplificação)', data: dataLowRisk, backgroundColor: '#F7AF20', borderRadius: 4 },
          { label: 'Médio Risco (Transição)', data: dataMedRisk, backgroundColor: '#E07618', borderRadius: 4 },
          { label: 'Alto Risco (Automação)', data: dataHighRisk, backgroundColor: '#CB1D4E', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#D6C6C1' } },
          y: { stacked: true, max: 100, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#C3B1AC', callback: (v) => `${v}%` } }
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#D6C6C1', font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`
            }
          }
        }
      }
    });
  }

  // 5. Quartiles Comparison Chart
  renderQuartilesChart(canvasId, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    const sorted = [...jobs].sort((a,b) => a.AI_Exposure_Index - b.AI_Exposure_Index);
    const quartiles = [];
    
    if (sorted.length === 0) {
      for(let i=0; i<4; i++) quartiles.push({ avg_salary_post_usd: 0, avg_salary_growth_pct: 0 });
    } else {
      const qSize = Math.max(1, Math.ceil(sorted.length / 4));
      for(let i=0; i<4; i++) {
          const slice = sorted.slice(i*qSize, (i+1)*qSize);
          if(slice.length === 0) {
              quartiles.push({ avg_salary_post_usd: 0, avg_salary_growth_pct: 0 });
              continue;
          }
          const avg_sal = slice.reduce((sum, j) => sum + j.Salary_Post_AI_USD, 0) / slice.length;
          const avg_pre = slice.reduce((sum, j) => sum + j.Salary_Pre_AI_USD, 0) / slice.length;
          const avg_growth = avg_pre > 0 ? ((avg_sal - avg_pre)/avg_pre * 100) : 0;
          quartiles.push({ avg_salary_post_usd: avg_sal, avg_salary_growth_pct: avg_growth.toFixed(2) });
      }
    }
    const labels = ['Q1: Baixa Exp. (0-0.52)', 'Q2: Mod. Exp. (0.53-0.81)', 'Q3: Alta Exp. (0.82-0.89)', 'Q4: Altíssima (0.90-1.0)'];
    const avgSalaries = quartiles.map(q => q.avg_salary_post_usd);
    const growthPcts = quartiles.map(q => q.avg_salary_growth_pct);

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: 'Salário Médio 2030 ($)',
            data: avgSalaries,
            backgroundColor: '#E07618',
            borderColor: '#F7AF20',
            borderWidth: 1.5,
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Variação Salarial (%)',
            data: growthPcts,
            borderColor: '#E6228C',
            backgroundColor: '#E6228C',
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: '#E6228C',
            pointBorderColor: '#2F1F22',
            pointBorderWidth: 1.5,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Salário Médio Projetado (USD)', color: '#D6C6C1' },
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#C3B1AC', callback: (v) => `$${(v / 1000).toFixed(0)}k` }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Variação Salarial (%)', color: '#D6C6C1' },
            grid: { drawOnChartArea: false },
            ticks: { color: '#E6228C', callback: (v) => `${v}%` }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#D6C6C1' }
          }
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#D6C6C1', font: { size: 11 } } }
        }
      }
    });
  }

  // 6. Taxa de Elevação de Escolaridade por Industry (Power BI Reference)
  renderTaxaElevacaoPorSetorChart(canvasId, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    const sectorMap = {};
    AI_WORKSHIFT_DATA.dim_setor.forEach(s => sectorMap[s.Setor_ID] = s);
    const sectorStats = {};
    jobs.forEach(j => {
        const secLabel = (sectorMap[j.Setor_ID] ? sectorMap[j.Setor_ID].Industry : 'Outros').replace('\xad', 'í');
        if(!sectorStats[secLabel]) sectorStats[secLabel] = { total: 0, upgraded: 0 };
        sectorStats[secLabel].total++;
        if(j.Education_Shift_Type && j.Education_Shift_Type.includes('Elevada')) {
            sectorStats[secLabel].upgraded++;
        }
    });
    
    const dataObj = Object.keys(sectorStats).map(ind => ({
        industry: ind,
        ratePct: sectorStats[ind].total > 0 ? (sectorStats[ind].upgraded / sectorStats[ind].total) * 100 : 0
    })).sort((a,b) => b.ratePct - a.ratePct);
    const labels = dataObj.map(d => d.industry);
    const dataVals = dataObj.map(d => d.ratePct);

    // Custom dotted benchmark plugin for 45%
    const benchmarkPlugin = {
      id: 'benchmarkLine45',
      afterDraw(chart) {
        const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
        const xPos = x.getPixelForValue(45);
        ctx.save();
        ctx.strokeStyle = '#E6228C';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xPos, top);
        ctx.lineTo(xPos, bottom);
        ctx.stroke();

        ctx.fillStyle = '#F27DBD';
        ctx.font = '600 11px JetBrains Mono, monospace';
        ctx.fillText('META 45%', xPos + 6, top + 12);
        ctx.restore();
      }
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Taxa de Elevação (%)',
          data: dataVals,
          backgroundColor: dataVals.map(v => v >= 45 ? '#F7AF20' : '#E07618'),
          borderWidth: 0,
          borderRadius: 6
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
              label: (ctx) => ` Taxa de Elevação: ${ctx.parsed.x}% dos cargos`
            }
          }
        },
        scales: {
          x: {
            max: 85,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#C3B1AC', callback: (v) => `${v}%` }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#E8DAD6', font: { weight: '600', size: 11 } }
          }
        }
      },
      plugins: [benchmarkPlugin]
    });
  }

  // 7. Vagas por Nível por Período e Nível de Escolaridade (100% Stacked Column)
  renderVagasPorNivelPeriodoChart(canvasId, jobsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    
    const levels = ['Ensino Médio', 'Tecnólogo', 'Bacharelado', 'Mestrado', 'Doutorado (PhD)'];
    const colors = ['#CB1D4E', '#951165', '#E07618', '#F7AF20', '#D83C15'];
    const preCounts = [0,0,0,0,0];
    const postCounts = [0,0,0,0,0];
    let totalPre = 0, totalPost = 0;
    
        const levelMap = {
        'ESC_01': 0,
        'ESC_02': 1,
        'ESC_03': 2,
        'ESC_04': 3,
        'ESC_05': 4
    };
    const labels = AI_WORKSHIFT_DATA.dim_escolaridade.map(e => e.Nivel_Escolaridade);
    
    jobs.forEach(j => {
        let preIdx = 2; // fallback
        let postIdx = 2; // fallback
        for (let key in levelMap) {
            if (j.Escolaridade_Pre_ID && j.Escolaridade_Pre_ID.includes(key)) preIdx = levelMap[key];
            if (j.Escolaridade_Pos_ID && j.Escolaridade_Pos_ID.includes(key)) postIdx = levelMap[key];
        }
        preCounts[preIdx] += 1; // Count rows!
        postCounts[postIdx] += 1;
        totalPre += 1;
        totalPost += 1;
    });

    const periods = ["2030", "Pré-IA"];
    const datasets = levels.map((lvl, idx) => ({
      label: lvl,
      data: [
        totalPost > 0 ? +(postCounts[idx]/totalPost*100).toFixed(1) : 0, 
        totalPre > 0 ? +(preCounts[idx]/totalPre*100).toFixed(1) : 0
      ],
      backgroundColor: colors[idx],
      borderRadius: 2
    }));

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: periods,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#E8DAD6', font: { weight: '700', size: 12 } }
          },
          y: {
            stacked: true,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#C3B1AC', callback: (v) => `${v}%` }
          }
        },
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 10, padding: 8, font: { size: 10 }, color: '#D6C6C1' }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`
            }
          }
        }
      }
    });
  }

  // 8. Nível de Ensino vs Categoria de Risco (Single Stacked Column)
  renderNivelEnsinoRiscoChart(canvasId) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const items = AI_WORKSHIFT_DATA.degreeEscalationAnalysis.nivelEnsinoVsRisco;
    const datasets = items.map(it => ({
      label: it.level,
      data: [it.count],
      backgroundColor: it.color,
      borderRadius: 2
    }));

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Contagem'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            display: false
          },
          y: {
            stacked: true,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#C3B1AC', callback: (v) => `${v}%` }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, padding: 6, font: { size: 9 }, color: '#D6C6C1' }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`
            }
          }
        }
      }
    });
  }

  // 9. Habilidades Técnicas Mais Valorizadas (Interactive Treemap Grid)
  renderHabilidadesTecnicasGrid(containerId, jobsData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const jobs = jobsData || AI_WORKSHIFT_DATA.fato_ai_job_impact;
    
    const skillMap = {};
    const cargoDict = {};
    AI_WORKSHIFT_DATA.dim_cargo.forEach(c => cargoDict[c.Cargo_ID] = c);
    const sectorColors = {};
    AI_WORKSHIFT_DATA.dim_setor.forEach(s => sectorColors[s.Setor_ID] = s.color);

    jobs.forEach(j => {
        const cargo = cargoDict[j.Cargo_ID];
        if (cargo && cargo.Primary_Emerging_Skill) {
            const s = cargo.Primary_Emerging_Skill.replace('\xad', 'í');
            if(!skillMap[s]) skillMap[s] = { name: s, volume_k: 0, color: sectorColors[j.Setor_ID] || '#951165' };
            skillMap[s].volume_k += j.Job_Volume_2030_k;
        }
    });
    
    let skills = Object.values(skillMap).sort((a,b) => b.volume_k - a.volume_k).slice(0, 10);
    const totalVol = skills.reduce((acc, s) => acc + s.volume_k, 0);
    
    if (skills.length === 0) {
        container.innerHTML = '<p style="color: #C3B1AC; padding: 20px;">Nenhuma habilidade emergente encontrada para os filtros selecionados.</p>';
        return;
    }

    let html = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
    `;

    skills.forEach(skill => {
      const pct = ((skill.volume_k / totalVol) * 100).toFixed(1);
      html += `
        <div style="background: ${skill.color}; color: #FFFFFF; border-radius: 10px; padding: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.35); transition: transform 0.2s;" title="${skill.name}: ${skill.volume_k}k vagas (${pct}%)">
          <span style="display: block; font-weight: 700; font-size: 13px; line-height: 1.3; margin-bottom: 4px;">${skill.name}</span>
          <span style="font-size: 11px; opacity: 0.9; font-weight: 600;">${skill.volume_k}k vagas (${pct}%)</span>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }
}

window.DashboardCharts = DashboardCharts;
