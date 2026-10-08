"""
Bússola 2030 — endpoint usado pela página bussola.html do site.

Roda o pipeline dos 5 agentes (o mesmo do app Streamlit) e devolve o JSON no
formato que a página espera (score, risco, radar, o que desaprender/aprender, roadmap).
Devolve o JSON no formato que a página espera.
"""
import re
from typing import Optional, Dict, Any

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field

from agents import (
    SecurityReviewerAgent,
    ResumeParserAgent,
    ResearcherAgent,
    AIEvaluatorAgent,
    CareerStrategistAgent,
)
from bussola_api.services.document_extractor import DocumentExtractorService

router = APIRouter(prefix="/api/v1/bussola", tags=["Bússola 2030"])

_security = SecurityReviewerAgent()
_parser = ResumeParserAgent()
_researcher = ResearcherAgent()
_evaluator = AIEvaluatorAgent()
_strategist = CareerStrategistAgent()

RADAR_KEYS = [
    "pensamento_analitico",
    "orquestracao_ia",
    "criatividade_inovacao",
    "lideranca_influencia",
    "resiliencia_adaptabilidade",
    "especializacao_estrategica",
]


class BussolaTextRequest(BaseModel):
    texto: str = Field(..., min_length=20)
    cargo: Optional[str] = None
    anos: Optional[int] = None


def _nivel(risk: int, fallback: str) -> str:
    if fallback:
        return fallback
    if risk >= 80:
        return "Crítico"
    if risk >= 60:
        return "Alto"
    if risk >= 35:
        return "Moderado"
    return "Baixo"


def _periodo_curto(p: str) -> str:
    p = (p or "").replace(" ", "")
    for key in ("2029-2030", "2027-2028", "2026"):
        if key in p:
            return key
    return p


def _score_prontidao(profile: Dict[str, Any], risk: int) -> int:
    """Mesma regra do CurriculumAnalyzerService (senioridade, uso de IA, % rotina/estratégica),
    aplicada ao perfil lido pelos agentes, com um ajuste pelo risco de automação."""
    seniority = str(profile.get("seniority", ""))
    score = 50
    if "Sênior" in seniority or "Liderança" in seniority or "Especialista" in seniority:
        score += 15
    elif "Júnior" in seniority:
        score -= 10
    if profile.get("has_ai_experience"):
        score += 20
    if int(profile.get("strategic_tasks_ratio", 0)) >= 60:
        score += 15
    elif int(profile.get("routine_tasks_ratio", 0)) >= 70:
        score -= 15
    if risk >= 80:
        score -= 10
    elif risk <= 35:
        score += 10
    return max(15, min(98, score))


def _role_from_text(text: str) -> str:
    """Quando o cargo não foi informado e o parser pegou o cabeçalho (nome/contato),
    tenta achar o cargo na frase de apresentação: "Enfermeira com 7 anos..." -> "Enfermeira"."""
    for line in text.splitlines():
        line = line.strip()
        if not line or re.search(r"\[|@|protegid|cpf|telefone", line, re.I):
            continue
        m = re.match(r"^([A-Za-zÀ-ÿ/&\- ]{3,60}?)\s+(com|há|ha|desde|de)\s+\d", line)
        if m:
            role = re.sub(r"^(eu\s+)?(sou|atuo como|trabalho como)\s+(um|uma)?\s*", "", m.group(1).strip(), flags=re.I)
            return role[:1].upper() + role[1:] if role else "Profissional"
        if len(line) <= 60 and not re.search(r"\d", line):
            return line
    return "Profissional"


def run_bussola(text: str, cargo: Optional[str], anos: Optional[int]) -> Dict[str, Any]:
    # 1. Segurança / LGPD
    sanitized, audit = _security.audit_and_sanitize(text)
    # 2. Parser
    if anos is None:  # tenta ler "5 anos" do próprio currículo
        m = re.search(r"(\d{1,2})\s*(?:\+\s*)?anos", sanitized, re.I)
        anos = int(m.group(1)) if m else 3
    profile = _parser.parse_profile(sanitized, manual_role=cargo or "", manual_experience_years=anos)
    if not cargo:
        parsed_role = str(profile.get("role", ""))
        guess = _role_from_text(sanitized)
        looks_bad = (re.search(r"\[|@|protegid|\.", parsed_role, re.I) or len(parsed_role) > 60
                     or not parsed_role[:1].isalpha())
        if guess != "Profissional" and (looks_bad or len(guess) < len(parsed_role)):
            profile["role"] = guess
    # 3. Pesquisa WEF / McKinsey / O*NET
    bench = _researcher.match_occupation(role=profile["role"], domain=profile.get("domain", ""), cv_text=sanitized)
    # 4. Avaliação de risco e radar
    ev = _evaluator.evaluate_profile(profile, bench)
    # 5. Estratégia
    strat = _strategist.generate_strategy(profile, bench, ev)

    risk = int(ev.get("final_automation_risk", 0))
    mult_raw = str(ev.get("productivity_multiplier", "1.0x")).lower().replace("x", "").replace(",", ".")
    try:
        mult = round(float(mult_raw), 1)
    except ValueError:
        mult = 1.0

    radar_atual = [int(ev["radar_current"].get(k, 5)) * 10 for k in RADAR_KEYS]
    radar_2030 = [int(ev["radar_ideal"].get(k, 5)) * 10 for k in RADAR_KEYS]

    # O que desaprender: tarefas em declínio da ocupação (base WEF/McKinsey/O*NET do ResearcherAgent)
    declining = list(bench.get("declining_tasks", []))[:3]
    augmented = list(bench.get("augmented_tasks", []))
    urg_order = ["Alta", "Alta", "Média"] if risk >= 60 else (["Alta", "Média", "Média"] if risk >= 35 else ["Média", "Média", "Baixa"])
    desaprender = [
        {
            "item": item,
            "motivo": ("Com IA: " + augmented[i]) if i < len(augmented) else "Sistemas de IA já executam essa tarefa com mais velocidade.",
            "urgencia": urg_order[i],
        }
        for i, item in enumerate(declining)
    ]

    # O que aprender agora: competências emergentes 2030 da ocupação
    emerging = list(bench.get("emerging_skills_2030", []))[:3]
    core = list(bench.get("human_core_tasks", [])) + augmented
    tools = list(bench.get("recommended_tools_2030", []))
    certs = list(bench.get("recommended_certifications", []))
    aprender = [
        {
            "competencia": comp,
            "aplicacao": core[i] if i < len(core) else "",
            "ferramentas": ", ".join(tools[i:i + 2] or tools[:2]),
            "certificacoes": certs[i] if i < len(certs) else (certs[0] if certs else ""),
        }
        for i, comp in enumerate(emerging)
    ]
    roadmap = [
        {
            "periodo": _periodo_curto(r.get("period", "")),
            "tema": r.get("theme", ""),
            "meta": r.get("goal", ""),
            "acao": r.get("action", ""),
            "ferramentas": ", ".join(r.get("key_tools", [])),
        }
        for r in strat.get("roadmap", [])[:3]
    ]

    return {
        "profissao": profile.get("role", "Profissional"),
        "area": bench.get("category") or profile.get("domain", ""),
        "senioridade": profile.get("seniority", "Pleno"),
        "anos_experiencia": int(profile.get("years_experience", anos or 0)),
        "rotina_pct": int(profile.get("routine_tasks_ratio", 50)),
        "estrategica_pct": int(profile.get("strategic_tasks_ratio", 50)),
        "score": _score_prontidao(profile, risk),
        "risco_automacao": risk,
        "nivel_risco": _nivel(risk, ev.get("risk_level", "")),
        "ganho_produtividade": int(ev.get("final_augmentation_potential", 0)),
        "multiplicador": mult,
        "radar_atual": radar_atual,
        "radar_2030": radar_2030,
        "desaprender": desaprender,
        "aprender": aprender,
        "roadmap": roadmap,
        "transicoes": list(strat.get("career_pivots", []))[:5],
        "mensagem": strat.get("critical_advice", ""),
        "lgpd": {
            "cpf": audit.get("cpf_masked", 0),
            "emails": audit.get("emails_masked", 0),
            "telefones": audit.get("phones_masked", 0),
        },
        "benchmark": bench.get("title", ""),
    }


@router.post("/analisar", summary="Bússola 2030 — análise por texto")
async def analisar_texto(payload: BussolaTextRequest):
    try:
        return run_bussola(payload.texto, payload.cargo, payload.anos)
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro na análise: {e}")


@router.post("/analisar-arquivo", summary="Bússola 2030 — upload de PDF, DOCX ou TXT")
async def analisar_arquivo(
    file: UploadFile = File(...),
    cargo: Optional[str] = Form(None),
    anos: Optional[int] = Form(None),
):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="O arquivo enviado está vazio.")
    try:
        text, _fmt = DocumentExtractorService.extract_from_bytes(data, file.filename or "curriculo.txt")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Não consegui ler o arquivo: {e}")
    if len((text or "").strip()) < 20:
        raise HTTPException(status_code=422, detail="Não encontrei texto suficiente no arquivo (ele pode ser uma imagem escaneada).")
    try:
        return run_bussola(text, cargo, anos)
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro na análise: {e}")
