/**
 * Interactive SQL Query Engine & Case Challenges Runner
 */

class SQLEngine {
  constructor(data) {
    this.data = data;
  }

  runOfficialChallenge(challengeId) {
    const challenge = this.data.sqlChallenges.find(c => c.id === challengeId);
    if (!challenge) return { error: "Desafio não encontrado" };
    
    const startTime = performance.now();
    // Simulate query execution timing
    const execTime = (Math.random() * 2.5 + 1.2).toFixed(2);
    
    return {
      challengeId: challenge.id,
      title: challenge.title,
      sql: challenge.sql_code,
      summary: challenge.resultSummary,
      headers: this.getChallengeHeaders(challenge.id),
      rows: challenge.results,
      executionTimeMs: execTime,
      rowCount: challenge.results.length,
      plan: this.getQueryExecutionPlan(challenge.id)
    };
  }

  getChallengeHeaders(challengeId) {
    switch (challengeId) {
      case "desafio_1":
        return [
          { key: "rank", label: "Ranking" },
          { key: "setor", label: "Setor Econômico" },
          { key: "total_vagas", label: "Total Vagas (Amostra)" },
          { key: "vagas_escaladas", label: "Vagas c/ Degree Escalation" },
          { key: "taxa_pct", label: "Taxa de Elevação (%)" },
          { key: "exposicao", label: "Score Exposição IA" }
        ];
      case "desafio_2":
        return [
          { key: "type", label: "Classificação" },
          { key: "rank", label: "Posição" },
          { key: "cargo", label: "Ocupação Profissional" },
          { key: "setor", label: "Setor" },
          { key: "sal_pre", label: "Salário Pré-IA" },
          { key: "sal_pos", label: "Salário Pós-IA" },
          { key: "sal_growth", label: "Variação Salarial (%)" },
          { key: "job_growth", label: "Saldo Vagas (%)" },
          { key: "risco", label: "Categoria de Risco" }
        ];
      case "desafio_3":
        return [
          { key: "quartil", label: "Quartil de Exposição" },
          { key: "faixa", label: "Faixa Índice IA" },
          { key: "sal_pre", label: "Média Salarial Pré-IA" },
          { key: "sal_pos", label: "Média Salarial Pós-IA" },
          { key: "sal_growth", label: "Variação Salarial (%)" },
          { key: "job_growth", label: "Variação Vagas (%)" },
          { key: "volume_2030", label: "Headcount Projetado 2030" }
        ];
      case "desafio_4":
        return [
          { key: "modelo", label: "Modelo de Trabalho" },
          { key: "qtd", label: "Qtd Funções" },
          { key: "volume_2030", label: "Volume Vagas (k)" },
          { key: "prob_automacao", label: "Prob. Média Automação" },
          { key: "sal_pre", label: "Salário Médio Pré-IA" },
          { key: "sal_pos", label: "Salário Médio Pós-IA" },
          { key: "sal_growth", label: "Variação Salarial Média" },
          { key: "vagas_growth", label: "Variação Headcount" }
        ];
      default:
        return [];
    }
  }

  getQueryExecutionPlan(challengeId) {
    const plans = {
      desafio_1: [
        "1. Scan [fato_ai_job_impact] (Index Seek on setor_id) -> Cost: 24%",
        "2. Hash Join with [dim_setor] on setor_id -> Cost: 18%",
        "3. Stream Aggregate (GROUP BY s.industry, SUM, COUNT, AVG) -> Cost: 32%",
        "4. Window Spool & DENSE_RANK() OVER (ORDER BY taxa DESC) -> Cost: 16%",
        "5. Sort by taxa_elevacao_pct DESC -> Cost: 10%"
      ],
      desafio_2: [
        "1. Index Scan on [fato_ai_job_impact] -> Cost: 20%",
        "2. Inner Join [dim_setor] on setor_id -> Cost: 15%",
        "3. Segment & Sequence Project: ROW_NUMBER() OVER (ORDER BY salary_growth_pct DESC / ASC) -> Cost: 45%",
        "4. Filter (rank_top_vencedores <= 5 OR rank_top_vulneraveis <= 5) -> Cost: 12%",
        "5. Output Stream & Text Formatting -> Cost: 8%"
      ],
      desafio_3: [
        "1. Full Table Scan on [fato_ai_job_impact] -> Cost: 15%",
        "2. Analytic Function: NTILE(4) OVER (ORDER BY ai_exposure_index ASC) -> Cost: 40%",
        "3. Hash Aggregate by quartil_exposicao -> Cost: 30%",
        "4. Sort & Projection -> Cost: 15%"
      ],
      desafio_4: [
        "1. Nested Loop Join [fato_ai_job_impact] <-> [dim_cargo] on cargo_id -> Cost: 28%",
        "2. Hash Aggregate (GROUP BY work_model, AVG, SUM) -> Cost: 42%",
        "3. Compute Scalar (Formatting % and $) -> Cost: 18%",
        "4. Sort by avg_salary_growth DESC -> Cost: 12%"
      ]
    };
    return plans[challengeId] || ["Query otimizada pelo otimizador de consultas com VertiPaq / In-Memory Index."];
  }

  executeCustomQuery(sqlQuery) {
    const startTime = performance.now();
    const query = sqlQuery.trim().toUpperCase();
    
    // Check if matching any challenge
    if (query.includes("NTILE") || query.includes("QUARTIL")) {
      return this.runOfficialChallenge("desafio_3");
    }
    if (query.includes("ROW_NUMBER") || query.includes("TOP 5") || query.includes("RANKING")) {
      return this.runOfficialChallenge("desafio_2");
    }
    if (query.includes("WORK_MODEL") || query.includes("MODELO_TRABALHO") || query.includes("PRESENCIAL")) {
      return this.runOfficialChallenge("desafio_4");
    }
    if (query.includes("EDUCATION_SHIFT") || query.includes("ESCOLARIDADE") || query.includes("UPGRADED")) {
      return this.runOfficialChallenge("desafio_1");
    }

    // Default dynamic filter on fact table
    let records = [...this.data.fato_ai_job_impact];
    if (query.includes("WHERE")) {
      if (query.includes("TECHNOLOGY")) records = records.filter(r => r.industry === "Technology");
      else if (query.includes("HEALTHCARE")) records = records.filter(r => r.industry === "Healthcare");
      else if (query.includes("FINANCIAL")) records = records.filter(r => r.industry === "Financial Services");
    }

    const execTime = (performance.now() - startTime + Math.random() * 2 + 1).toFixed(2);

    return {
      title: "Resultado da Consulta Personalizada",
      sql: sqlQuery,
      summary: `Executado com sucesso. ${records.length} registros retornados.`,
      headers: [
        { key: "job_title", label: "Cargo" },
        { key: "industry", label: "Setor" },
        { key: "work_model", label: "Modelo" },
        { key: "salary_pre_ai_usd", label: "Salário Pré-IA ($)" },
        { key: "salary_post_ai_usd", label: "Salário Pós-IA ($)" },
        { key: "salary_growth_pct", label: "Variação Salarial (%)" },
        { key: "risk_category", label: "Risco de Automação" }
      ],
      rows: records.map(r => ({
        job_title: r.job_title,
        industry: r.industry,
        work_model: r.work_model,
        salary_pre_ai_usd: `$${r.salary_pre_ai_usd.toLocaleString()}`,
        salary_post_ai_usd: `$${r.salary_post_ai_usd.toLocaleString()}`,
        salary_growth_pct: `${r.salary_growth_pct > 0 ? '+' : ''}${r.salary_growth_pct.toFixed(2)}%`,
        risk_category: r.risk_category
      })),
      executionTimeMs: execTime,
      rowCount: records.length,
      plan: [
        "1. Dynamic Parser & AST Evaluation -> Cost: 20%",
        "2. Table Scan [fato_ai_job_impact] with in-memory predicates -> Cost: 50%",
        "3. Result projection and type serialization -> Cost: 30%"
      ]
    };
  }
}

window.SQLEngine = SQLEngine;
