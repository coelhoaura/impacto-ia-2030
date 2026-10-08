import re
from typing import Dict, Any, Optional
from bussola_api.schemas.analysis import (
    CurriculumAnalysisResponse,
    CandidateProfile,
    Projecao2030,
    DesaprenderItem,
    AprenderItem,
    RoadmapPhase
)


class CurriculumAnalyzerService:
    """
    Serviço Central de Análise de Currículos 2030.
    Garante classificação dinâmica de área, zero contaminação de domínio e rigor Pydantic.
    """

    DOMINIOS_BASE = {
        "Economia, Finanças & Investimentos": {
            "keywords": [
                "economista", "economia", "macroeconomia", "microeconomia", "econometria",
                "cfa", "anbima", "fp&a", "valuation", "investimentos", "tesouraria",
                "cbdc", "tokenização", "esg", "risco financeiro", "mercado de capitais",
                "derivativos", "planejamento financeiro", "gestão de carteiras", "controladoria",
                "contábil", "contador", "auditoria fiscal", "tributário", "finanças", "banco"
            ],
            "default_role": "Economista / Especialista Financeiro",
            "risk": 42,
            "augmentation": 94,
            "visao_2030": (
                "Até 2030, a Economia e as Finanças migram da contabilidade retrospectiva e planilhas manuais "
                "para a modelagem econométrica preditiva em tempo real, auditoria de ativos tokenizados (CBDCs), "
                "precificação quantitativa de risco climático/ESG e orquestração de algoritmos de investimento."
            ),
            "desaprender": [
                DesaprenderItem(
                    item="Consolidação manual de balanços e fórmulas estáticas em planilhas Excel",
                    motivo_obsolescencia="Pipelines automatizados e APIs de dados cruzam demonstrativos contábeis instantaneamente sem erros de digitação.",
                    impacto_risco="Alto"
                ),
                DesaprenderItem(
                    item="Projeções financeiras lineares e estáticas sem simulação estocástica",
                    motivo_obsolescencia="Mercados voláteis exigem simulações de Monte Carlo em tempo real e análise de cenários não-lineares assistidos por IA.",
                    impacto_risco="Médio"
                ),
                DesaprenderItem(
                    item="Elaboração manual de relatórios descritivos mensais de fechamento",
                    motivo_obsolescencia="LLMs financeiras (FinLLMs) redigem memórias de cálculo e sínteses executivas automaticamente.",
                    impacto_risco="Alto"
                )
            ],
            "aprender": [
                AprenderItem(
                    competencia="Modelagem Econométrica Preditiva com Machine Learning & Python",
                    aplicacao_pratica_2030="Construir modelos de previsão de inflação, inadimplência e cenários de juros com dados alternativos de alta frequência.",
                    ferramentas_recomendadas=["Python (Pandas, Statsmodels, Scikit-Learn)", "BloombergGPT", "FinChat AI"],
                    certificacoes_sugeridas=["AI in Financial Markets (Oxford / MIT)", "CFA Quantitative Methods"]
                ),
                AprenderItem(
                    competencia="Tokenização de Ativos & Infraestrutura de Moedas Digitais (CBDCs / Drex)",
                    aplicacao_pratica_2030="Auditar e precificar ativos digitais, contratos financeiros autoexecutáveis e liquidação em DLT.",
                    ferramentas_recomendadas=["Plataformas de On-Chain Analytics", "Frameworks de Smart Contracts Financeiros"],
                    certificacoes_sugeridas=["Digital Assets & Blockchain Economics (Wharton Online)"]
                ),
                AprenderItem(
                    competencia="Análise Quantitativa de Risco ESG e Transição Climática",
                    aplicacao_pratica_2030="Integrar métricas de pegada de carbono e estresse climático aos modelos de risco de crédito e valuation.",
                    ferramentas_recomendadas=["Bancos de Dados ESG Preditivos", "Modelos de Precificação de Carbono"],
                    certificacoes_sugeridas=["Certificate in ESG Investing (CFA Institute)"]
                )
            ],
            "pivots": [
                "Economista Chefe de Ativos Digitais & Inteligência Preditiva",
                "Diretor(a) de Riscos Quantitativos & Governança ESG",
                "Consultor(a) Sênior em Tokenização e Estratégia de Capital"
            ],
            "roadmap": [
                RoadmapPhase(
                    periodo="2026",
                    tema="Automação de Rotinas e Adoção de Copilotos Financeiros",
                    meta="Eliminar 60% do tempo gasto em consolidação manual de planilhas e relatórios.",
                    plano_de_acao="Adotar assistentes generativos para leitura de demonstrações e automação de scripts no dia a dia.",
                    ferramentas_chave=["BloombergGPT / FinChat", "Python/Pandas", "PowerBI com IA"]
                ),
                RoadmapPhase(
                    periodo="2027 - 2028",
                    tema="Econometria Aumentada & Mercados Digitais",
                    meta="Tornar-se o profissional que desenha e valida cenários estocásticos com IA.",
                    plano_de_acao="Integrar fontes de dados alternativos e modelagem de moedas digitais aos relatórios de estratégia.",
                    ferramentas_chave=["Machine Learning Financeiro", "On-Chain Analytics"]
                ),
                RoadmapPhase(
                    periodo="2029 - 2030",
                    tema="Conselheiro Estratégico e Julgamento Fiduciário",
                    meta="Consolidar autoridade na tomada de decisão institucional sob alta incerteza.",
                    plano_de_acao="Liderar comitês de alocação de capital e governança de risco na interface homem-algoritmo.",
                    ferramentas_chave=["Governança de Risco Sistêmico", "Estratégia Macro Global"]
                )
            ]
        },
        "Saúde, Medicina & Biociências": {
            "keywords": [
                "médico", "médica", "medicina", "crm", "clínica", "hospital", "diagnóstico",
                "cirurgia", "paciente", "prontuário", "anamnese", "telemedicina",
                "genômica", "farmacologia", "biomarcadores", "epidemiologia", "enfermagem",
                "nutrição", "nutricionista", "fisioterapia", "fisioterapeuta", "psicologia",
                "psicólogo", "terapêutico", "saúde pública", "odontologia", "dentista", "veterinária"
            ],
            "default_role": "Médico(a) / Especialista em Saúde",
            "risk": 28,
            "augmentation": 96,
            "visao_2030": (
                "A Medicina até 2030 torna-se hiperpersonalizada, preventiva e contínua. "
                "A burocracia clínica é absorvida por inteligências ambientais e escribas de voz, "
                "permitindo ao médico focar na escuta humanizada, bioética, decisões em casos atípicos "
                "e integração de biossensores com medicina genômica de precisão."
            ),
            "desaprender": [
                DesaprenderItem(
                    item="Preenchimento manual e digitação de prontuários durante a consulta médica",
                    motivo_obsolescencia="Escribas clínicos por IA (ambient voice AI) documentam anamnese e evolução médica em tempo real com maior rigor.",
                    impacto_risco="Alto"
                ),
                DesaprenderItem(
                    item="Memorização passiva de tabelas de dosagem e interações medicamentosas",
                    motivo_obsolescencia="Sistemas de Apoio à Decisão Clínica (CDSS) validam interações farmacológicas instantaneamente.",
                    impacto_risco="Médio"
                ),
                DesaprenderItem(
                    item="Atendimento focado apenas em episódios agudos reativos",
                    motivo_obsolescencia="Dispositivos wearables e monitoramento contínuo exigem cuidado longitudinal preventivo.",
                    impacto_risco="Alto"
                )
            ],
            "aprender": [
                AprenderItem(
                    competencia="Auditoria e Interpretação de Diagnósticos Multimodais por IA",
                    aplicacao_pratica_2030="Avaliar criticamente achados radiológicos, laboratoriais e predições algorítmicas mitigando falsos positivos.",
                    ferramentas_recomendadas=["Sistemas CDSS Multimodais", "Visão Computacional Diagnóstica"],
                    certificacoes_sugeridas=["AI in Clinical Medicine (Harvard Medical School)", "Stanford AI in Healthcare"]
                ),
                AprenderItem(
                    competencia="Medicina de Precisão, Genômica & Farmacogenética",
                    aplicacao_pratica_2030="Prescrever tratamentos e terapias sob medida correlacionando painéis genéticos aos biomarcadores do paciente.",
                    ferramentas_recomendadas=["Plataformas de Análise Genômica Clínica", "Painéis de Biomarcadores"],
                    certificacoes_sugeridas=["Genomics and Precision Medicine (Johns Hopkins / Stanford)"]
                ),
                AprenderItem(
                    competencia="Comunicação Clínica Empática, Escuta Ativa e Bioética Digital",
                    aplicacao_pratica_2030="Conduzir conversas sensíveis de diagnóstico difícil, adesão ao tratamento e decisões de fim de vida.",
                    ferramentas_recomendadas=["Protocolos de Comunicação Clínica (SPIKES)", "Comitês de Bioética"],
                    certificacoes_sugeridas=["Comunicação Empática em Saúde e Relação Médico-Paciente"]
                )
            ],
            "pivots": [
                "Médico(a) Especialista em Saúde Digital & Medicina de Precisão",
                "Diretor(a) Clínico(a) de Inovação em HealthTechs",
                "Perito(a) e Consultor(a) de Auditoria Médica em Inteligência Artificial"
            ],
            "roadmap": [
                RoadmapPhase(
                    periodo="2026",
                    tema="Eliminação da Sobrecarga Burocrática",
                    meta="Recuperar 2 horas diárias antes gastas em digitação e prontuário.",
                    plano_de_acao="Implementar escribas de voz por IA nas consultas e prescrição digital inteligente.",
                    ferramentas_chave=["Nuance DAX / Nabla Copilot", "Prontuário Eletrônico Inteligente"]
                ),
                RoadmapPhase(
                    periodo="2027 - 2028",
                    tema="Saúde Conectada & Dados Contínuos",
                    meta="Integrar biossensores e monitoramento de pacientes em tempo real.",
                    plano_de_acao="Acompanhar indicadores de glicemia, sono e arritmias via telemonitoramento preventivo.",
                    ferramentas_chave=["Dashboards de Telemetria Clínica", "CDSS Preditivo"]
                ),
                RoadmapPhase(
                    periodo="2029 - 2030",
                    tema="Liderança Médica Humanizada e de Precisão",
                    meta="Tornar-se autoridade clínica na intersecção entre ciência de dados e acolhimento humano.",
                    plano_de_acao="Comandar condutas de alta complexidade e liderar equipes multiprofissionais de saúde.",
                    ferramentas_chave=["Medicina Genômica", "Liderança Clínica de Alta Performance"]
                )
            ]
        },
        "Jurídico, Contratos & Compliance": {
            "keywords": [
                "advogado", "advogada", "direito", "oab", "jurídico", "contratos",
                "contencioso", "compliance", "lgpd", "processo civil", "parecer jurídico",
                "tributário", "societário", "jurisprudência", "petição", "magistratura", "promotoria"
            ],
            "default_role": "Advogado(a) / Especialista Jurídico",
            "risk": 54,
            "augmentation": 92,
            "visao_2030": (
                "O Direito até 2030 transforma advogados em arquitetos de governança e estrategistas de resolução de litígios. "
                "Pesquisas jurisprudenciais e redações mecânicas de petições padronizadas são automatizadas, "
                "valorizando a jurimetria preditiva, o design legal, a regulação de IA e negociações bilaterais de alto valor."
            ),
            "desaprender": [
                DesaprenderItem(
                    item="Revisão manual linha a linha de contratos padrão e minutas repetitivas",
                    motivo_obsolescencia="LLMs especializadas em Direito comparam cláusulas e identificam riscos de conformidade em segundos.",
                    impacto_risco="Alto"
                ),
                DesaprenderItem(
                    item="Pesquisa jurisprudencial manual e artesanal em múltiplos tribunais",
                    motivo_obsolescencia="Sistemas de jurimetria preditiva agregam tendências de juízes e câmaras automaticamente.",
                    impacto_risco="Alto"
                ),
                DesaprenderItem(
                    item="Cobrança por horas faturáveis em atividades operacionais de redação",
                    motivo_obsolescencia="Clientes corporativos exigem precificação por valor agregado e rapidez resolutiva.",
                    impacto_risco="Crítico"
                )
            ],
            "aprender": [
                AprenderItem(
                    competencia="Jurimetria Preditiva e Análise Estatística de Decisões Judiciais",
                    aplicacao_pratica_2030="Calcular probabilidades de êxito e orientar acordos extrajudiciais antes do ajuizamento de ações.",
                    ferramentas_recomendadas=["Plataformas de Jurimetria", "Legal Analytics"],
                    certificacoes_sugeridas=["Jurimetria e Ciência de Dados Aplicada ao Direito (Insper / FGV)"]
                ),
                AprenderItem(
                    competencia="Governança de IA, Proteção de Dados e Regulação Tecnológica",
                    aplicacao_pratica_2030="Desenvolver termos de conformidade e auditoria de algoritmos corporativos sob marcos regulatórios.",
                    ferramentas_recomendadas=["Frameworks de AI Governance", "Softwares de Mapeamento LGPD"],
                    certificacoes_sugeridas=["Certified Information Privacy Professional (IAPP - CIPP/E / CDPO)"]
                ),
                AprenderItem(
                    competencia="Negociação Estratégica, Mediação Complexa e Visual Law",
                    aplicacao_pratica_2030="Construir contratos claros centrados no usuário e conduzir mediações corporativas de alto impacto.",
                    ferramentas_recomendadas=["Metodologias de Legal Design", "Harvard Negotiation Framework"],
                    certificacoes_sugeridas=["Program on Negotiation (Harvard Law School)"]
                )
            ],
            "pivots": [
                "Chief Legal Officer (CLO) / Estrategista de Risco Corporativo",
                "Especialista em Regulação de IA, Dados e Compliance Tecnológico",
                "Consultor(a) de Jurimetria e Resolução Eficiente de Conflitos"
            ],
            "roadmap": [
                RoadmapPhase(
                    periodo="2026",
                    tema="Adoção de Inteligência Artificial Jurídica",
                    meta="Reduzir em 70% o tempo dedicado a minutas e triagem de jurisprudência.",
                    plano_de_acao="Implementar Legal LLMs para revisão inicial e automação de rotinas do escritório.",
                    ferramentas_chave=["Legal LLMs", "Visual Law", "Softwares de Jurimetria"]
                ),
                RoadmapPhase(
                    periodo="2027 - 2028",
                    tema="Consultoria Preventiva e Direito de Fronteira",
                    meta="Atuar como parceiro de conformidade ética e tecnológica para empresas.",
                    plano_de_acao="Estruturar práticas de governança de algoritmos e segurança da informação.",
                    ferramentas_chave=["Governança de Dados", "Legal Design"]
                ),
                RoadmapPhase(
                    periodo="2029 - 2030",
                    tema="Negociador Sênior e Conselheiro Estratégico",
                    meta="Liderar acordos bilaterais e decisões institucionais de alta relevância.",
                    plano_de_acao="Consolidar autoridade em mediações onde a reputação pessoal é o fiel da balança.",
                    ferramentas_chave=["Negociação Avançada", "Estratégia Societária"]
                )
            ]
        }
    }

    @classmethod
    def analyze_curriculum(cls, text: str, manual_role: Optional[str] = None, manual_experience_years: Optional[int] = None) -> CurriculumAnalysisResponse:
        text_clean = text.strip()
        text_lower = text_clean.lower()

        # 1. Classificação Dinâmica de Área e Cargo
        detected_domain = None
        matched_data = None
        max_matches = 0

        if manual_role and len(manual_role.strip()) > 2:
            query = manual_role.lower()
            for dom, data in cls.DOMINIOS_BASE.items():
                if any(kw in query for kw in data["keywords"]):
                    detected_domain = dom
                    matched_data = data
                    break

        if not matched_data:
            for dom, data in cls.DOMINIOS_BASE.items():
                matches = sum(1 for kw in data["keywords"] if re.search(rf"\b{re.escape(kw)}\b", text_lower))
                if matches > max_matches:
                    max_matches = matches
                    detected_domain = dom
                    matched_data = data

        if not matched_data:
            detected_domain = "Área Especializada / Multissetorial"
            inferred_role = manual_role.strip() if manual_role else "Profissional de Mercado"
            matched_data = cls._generate_universal_domain_data(inferred_role, text_clean)
        else:
            inferred_role = manual_role.strip() if manual_role else matched_data["default_role"]
            title_patterns = [
                r"(?:cargo|objetivo|função|título|atuação)\s*[:\-]?\s*([^\n\r,]{3,40})",
                r"\b(?:economista|médico|médica|advogado|advogada|contador|engenheiro|arquiteto|psicólogo|nutricionista)\b[^\n\r,]*"
            ]
            for pat in title_patterns:
                m = re.search(pat, text_clean, re.IGNORECASE)
                if m:
                    inferred_role = m.group(0).strip().title()
                    break

        # 2. Senioridade e Experiência
        seniority = "Pleno"
        years_exp = manual_experience_years if manual_experience_years is not None else 3
        
        if re.search(r"\b(júnior|junior|estagiário|estágio|trainee|residente|iniciante)\b", text_lower):
            seniority = "Júnior / Iniciante"
            if manual_experience_years is None: years_exp = 1
        elif re.search(r"\b(sênior|senior|especialista|coordenador|gerente|diretor|doutor|chefe|titular)\b", text_lower):
            seniority = "Sênior / Liderança"
            if manual_experience_years is None: years_exp = 7

        # 3. Divisão de Tarefas Rotineiras vs Estratégicas
        rot_keywords = ["digitação", "planilha", "alimentação", "arquivo", "relatórios", "agendamento", "cadastro", "triagem", "notas fiscais", "repetitivo", "rotina", "preenchimento"]
        strat_keywords = ["arquitetura", "liderança", "estratégia", "negociação", "tomada de decisão", "diagnóstico", "auditoria", "gestão", "inovação", "mentoria", "planejamento", "governança"]
        
        rot_count = sum(1 for kw in rot_keywords if kw in text_lower)
        strat_count = sum(1 for kw in strat_keywords if kw in text_lower)
        total_signals = rot_count + strat_count
        
        if total_signals > 0:
            rot_pct = round((rot_count / total_signals) * 100)
        else:
            rot_pct = 60 if "Júnior" in seniority else (40 if "Pleno" in seniority else 20)
        strat_pct = 100 - rot_pct

        # 4. Literacia de IA
        has_ai = any(t in text_lower for t in ["ia", "inteligência artificial", "chatgpt", "copilot", "machine learning", "telemedicina", "prompt", "automação", "escriba"])

        # 5. Cálculo do Score de Prontidão 2030 (0 a 100)
        base_score = 50
        if "Sênior" in seniority: base_score += 15
        elif "Júnior" in seniority: base_score -= 10
        
        if has_ai: base_score += 20
        if strat_pct >= 60: base_score += 15
        elif rot_pct >= 70: base_score -= 15

        readiness_score = max(15, min(98, base_score))

        if readiness_score >= 80:
            classificacao = "Super-Trabalhador (Alta Prontidão 2030)"
        elif readiness_score >= 60:
            classificacao = "Pronto para Simbiose com IA"
        elif readiness_score >= 40:
            classificacao = "Em Transição (Requer Upskilling)"
        else:
            classificacao = "Vulnerável à Automação (Requer Reskilling Urgente)"

        risk_score = matched_data["risk"]
        aug_score = matched_data["augmentation"]
        
        if rot_pct > 60: risk_score = min(95, risk_score + 10)
        if has_ai: risk_score = max(10, risk_score - 10)

        risk_level = "Baixo" if risk_score <= 35 else ("Moderado" if risk_score <= 60 else ("Alto" if risk_score <= 80 else "Crítico"))

        return CurriculumAnalysisResponse(
            status="success",
            score_prontidao_2030=readiness_score,
            classificacao_prontidao=classificacao,
            perfil_candidato=CandidateProfile(
                nome_detectado=cls._extract_name(text_clean),
                profissao_identificada=inferred_role,
                area_atuacao=detected_domain,
                senioridade=seniority,
                anos_experiencia_estimados=years_exp,
                taxa_rotina_operacional_pct=rot_pct,
                taxa_estrategica_cognitiva_pct=strat_pct,
                literacia_ia_atual=has_ai
            ),
            projecao_mercado_2030=Projecao2030(
                visao_futuro_setor=matched_data["visao_2030"],
                indice_risco_automacao_pct=risk_score,
                nivel_risco=risk_level,
                potencial_aumento_produtividade_pct=aug_score,
                multiplicador_produtividade=f"{round(1 + (aug_score / 60), 1)}x"
            ),
            o_que_desaprender=matched_data["desaprender"],
            o_que_aprender_urgente=matched_data["aprender"],
            roadmap_estrategico=matched_data["roadmap"],
            transicoes_carreira_pivots=matched_data["pivots"],
            mensagem_executiva=(
                f"No setor de {detected_domain}, a IA não vai substituir o {inferred_role}; "
                f"no entanto, o profissional que dominar a orquestração de IA e o julgamento crítico "
                f"substituirá aquele que permanecer apenas na execução manual de rotinas."
            )
        )

    @staticmethod
    def _extract_name(text: str) -> Optional[str]:
        first_line = text.split("\n")[0].strip()
        words = first_line.split()
        if 2 <= len(words) <= 5 and not any(char in first_line for char in [":", "@", "/", "\\", "(", ")", "0", "1", "2"]):
            return first_line
        return None

    @staticmethod
    def _generate_universal_domain_data(role: str, text: str) -> Dict[str, Any]:
        return {
            "risk": 45,
            "augmentation": 90,
            "visao_2030": (
                f"Até 2030, a área de {role} passará por uma transição em direção à automação de rotinas burocráticas "
                f"e hipervalorização do julgamento ético, resolução de problemas não estruturados e liderança humana."
            ),
            "desaprender": [
                DesaprenderItem(
                    item=f"Execução mecânica de relatórios e formulários repetitivos em {role}",
                    motivo_obsolescencia="Sistemas inteligentes geram sínteses descritivas e preenchimentos em segundos.",
                    impacto_risco="Alto"
                ),
                DesaprenderItem(
                    item="Processamento manual de dados sem auxílio de ferramentas digitais",
                    motivo_obsolescencia="Ferramentas conectadas a IA realizam cruzamento de informações com precisão superior.",
                    impacto_risco="Médio"
                )
            ],
            "aprender": [
                AprenderItem(
                    competencia=f"Orquestração de Inteligência Artificial Aplicada a {role}",
                    aplicacao_pratica_2030="Adotar assistentes e fluxos automatizados para acelerar entregas técnicas da área.",
                    ferramentas_recomendadas=["Copilotos Setoriais", "ChatGPT / Gemini Corporativo"],
                    certificacoes_sugeridas=["AI Applied to Business & Professional Productivity"]
                ),
                AprenderItem(
                    competencia="Pensamento Crítico, Julgamento Ético e Tomada de Decisão",
                    aplicacao_pratica_2030="Validar saídas de IA, identificar alucinações de dados e tomar decisões em cenários de alta complexidade.",
                    ferramentas_recomendadas=["Frameworks de Qualidade & Decisão"],
                    certificacoes_sugeridas=["Liderança Estratégica e Resolução de Problemas Complexos"]
                )
            ],
            "pivots": [
                f"Líder / Coordenador(a) Estratégico(a) de {role}",
                f"Consultor(a) de Inovação e Eficiência em {role}",
                "Especialista em Transformação Digital da Área"
            ],
            "roadmap": [
                RoadmapPhase(
                    periodo="2026",
                    tema="Adoção de Copilotos e Eliminação de Burocracia",
                    meta="Reduzir em 50% tarefas mecânicas diárias.",
                    plano_de_acao="Integrar copilotos para redação e organização de dados da rotina.",
                    ferramentas_chave=["Copilotos de IA", "Automação No-Code"]
                ),
                RoadmapPhase(
                    periodo="2027 - 2028",
                    tema="Análise Orientada por Dados",
                    meta="Evoluir de executor para analista e supervisor de processos inteligentes.",
                    plano_de_acao="Utilizar dashboards e indicadores para embasar decisões com dados.",
                    ferramentas_chave=["Dashboards Analíticos", "Frameworks de Qualidade"]
                ),
                RoadmapPhase(
                    periodo="2029 - 2030",
                    tema="Liderança Estratégica e Diferencial Humano",
                    meta="Consolidar autoridade na condução de pessoas e visão de longo prazo.",
                    plano_de_acao="Comandar a área unindo o melhor da inteligência algorítmica à empatia e ética humana.",
                    ferramentas_chave=["Liderança Estratégica", "Governança"]
                )
            ]
        }