from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DesaprenderItem(BaseModel):
    item: str = Field(..., description="Hábito, ferramenta ou rotina que perdeu valor")
    motivo_obsolescencia: str = Field(..., description="Por que essa prática está sendo automatizada ou superada até 2030")
    impacto_risco: str = Field(..., description="Nível de urgência para descontinuar (Alto, Médio, Crítico)")


class AprenderItem(BaseModel):
    competencia: str = Field(..., description="Competência ou tecnologia emergente da área")
    aplicacao_pratica_2030: str = Field(..., description="Como aplicar na rotina da profissão até 2030")
    ferramentas_recomendadas: List[str] = Field(default_factory=list, description="Ferramentas e copilotos específicos da área")
    certificacoes_sugeridas: List[str] = Field(default_factory=list, description="Cursos e certificações renomadas do setor")


class RoadmapPhase(BaseModel):
    periodo: str = Field(..., description="Ano ou horizonte (ex: 2026, 2027-2028, 2029-2030)")
    tema: str = Field(..., description="Tema central da fase de upskilling")
    meta: str = Field(..., description="Objetivo quantitativo ou qualitativo")
    plano_de_acao: str = Field(..., description="Ações práticas detalhadas")
    ferramentas_chave: List[str] = Field(default_factory=list, description="Ferramentas a adotar nessa fase")


class CandidateProfile(BaseModel):
    nome_detectado: Optional[str] = Field(None, description="Nome do candidato se identificado")
    profissao_identificada: str = Field(..., description="Cargo ou função inferida do currículo")
    area_atuacao: str = Field(..., description="Cluster/Setor profissional (ex: Saúde, Economia, Jurídico)")
    senioridade: str = Field(..., description="Júnior, Pleno, Sênior ou Liderança")
    anos_experiencia_estimados: int = Field(..., description="Tempo estimado de mercado")
    taxa_rotina_operacional_pct: int = Field(..., description="Percentual estimado de tarefas repetitivas")
    taxa_estrategica_cognitiva_pct: int = Field(..., description="Percentual estimado de tarefas analíticas")
    literacia_ia_atual: bool = Field(..., description="Se já demonstra uso prévio de IA/automação")


class Projecao2030(BaseModel):
    visao_futuro_setor: str = Field(..., description="Diagnóstico prospectivo do setor no horizonte 2030")
    indice_risco_automacao_pct: int = Field(..., description="Probabilidade de automação de rotinas (0-100%)")
    nivel_risco: str = Field(..., description="Baixo, Moderado, Alto ou Crítico")
    potencial_aumento_produtividade_pct: int = Field(..., description="Ganho de produtividade com copilotos de IA")
    multiplicador_produtividade: str = Field(..., description="Ex: 1.8x, 2.5x")


class CurriculumAnalysisResponse(BaseModel):
    status: str = Field("success", description="Status da resposta")
    score_prontidao_2030: int = Field(..., ge=0, le=100, description="Score global de prontidão para o mercado 2030 (0 a 100)")
    classificacao_prontidao: str = Field(..., description="Ex: Vulnerável, Em Transição, Pronto para 2030, Super-Trabalhador")
    perfil_candidato: CandidateProfile
    projecao_mercado_2030: Projecao2030
    o_que_desaprender: List[DesaprenderItem] = Field(..., description="Lista de práticas a descontinuar no setor")
    o_que_aprender_urgente: List[AprenderItem] = Field(..., description="Lista de competências essenciais a dominar até 2030")
    roadmap_estrategico: List[RoadmapPhase] = Field(..., description="Plano de requalificação ano a ano")
    transicoes_carreira_pivots: List[str] = Field(default_factory=list, description="Cargos futuros de alto valor no setor")
    mensagem_executiva: str = Field(..., description="Resumo executivo do diagnóstico")


class TextAnalysisRequest(BaseModel):
    curriculo_texto: str = Field(..., min_length=20, description="Texto completo do currículo ou perfil LinkedIn")
    cargo_manual: Optional[str] = Field(None, description="Cargo ou área informada manualmente (opcional)")
    anos_experiencia_manual: Optional[int] = Field(None, description="Anos de experiência informados manualmente (opcional)")