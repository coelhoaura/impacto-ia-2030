from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from bussola_api.schemas.analysis import CurriculumAnalysisResponse, TextAnalysisRequest
from bussola_api.services.document_extractor import DocumentExtractorService
from bussola_api.services.curriculum_analyzer_service import CurriculumAnalyzerService

router = APIRouter(prefix="/api/v1/curriculo", tags=["Análise de Currículo 2030"])


@router.post(
    "/analisar-arquivo",
    response_model=CurriculumAnalysisResponse,
    summary="Upload e análise de currículo (.pdf, .docx, .txt)",
    description="Recebe um arquivo de currículo, extrai o texto, infere dinamicamente a área e gera o diagnóstico 2030 (O que Desaprender vs O que Aprender)."
)
async def analisar_arquivo_curriculo(
    file: UploadFile = File(..., description="Arquivo de currículo em formato PDF, DOCX ou TXT"),
    cargo_manual: Optional[str] = Form(None, description="Cargo ou profissão informada opcionalmente"),
    anos_experiencia: Optional[int] = Form(None, description="Anos de experiência informados opcionalmente")
):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Arquivo sem nome fornecido.")
    
    ext = file.filename.lower().split(".")[-1]
    if ext not in ["pdf", "docx", "doc", "txt", "md"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato '.{ext}' não suportado. Envie um arquivo .pdf, .docx ou .txt."
        )

    try:
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O arquivo enviado está vazio.")

        extracted_text, detected_format = DocumentExtractorService.extract_from_bytes(file_bytes, file.filename)
        
        if len(extracted_text.strip()) < 20:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Não foi possível extrair texto legível suficiente do documento. Verifique se o arquivo não é uma imagem escaneada."
            )

        analysis = CurriculumAnalyzerService.analyze_curriculum(
            text=extracted_text,
            manual_role=cargo_manual,
            manual_experience_years=anos_experiencia
        )
        return analysis

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno no processamento: {str(e)}")


@router.post(
    "/analisar-texto",
    response_model=CurriculumAnalysisResponse,
    summary="Análise direta via texto (JSON payload)",
    description="Recebe o texto puro do currículo ou perfil do LinkedIn e retorna o diagnóstico completo para 2030."
)
async def analisar_texto_curriculo(payload: TextAnalysisRequest):
    try:
        analysis = CurriculumAnalyzerService.analyze_curriculum(
            text=payload.curriculo_texto,
            manual_role=payload.cargo_manual,
            manual_experience_years=payload.anos_experiencia_manual
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro na análise: {str(e)}")


@router.get("/dominios-suportados", summary="Lista os domínios mapeados nativamente")
async def listar_dominios():
    return {
        "dominios_especializados": list(CurriculumAnalyzerService.DOMINIOS_BASE.keys()),
        "suporte_universal": "Qualquer outra profissão é analisada dinamicamente pelo sintetizador de domínio isolado."
    }