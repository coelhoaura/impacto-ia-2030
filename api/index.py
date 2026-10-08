"""
Bússola 2030 — API (FastAPI) publicada como função Python na Vercel.
Todas as rotas /api/... do site chegam aqui (ver vercel.json).
O código dos 5 agentes fica na pasta /backend.
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND = os.path.join(ROOT, "backend")
if BACKEND not in sys.path:
    sys.path.insert(0, BACKEND)

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from bussola_api.routers.bussola_router import router as bussola_router  # noqa: E402
from bussola_api.routers.analysis_router import router as analysis_router  # noqa: E402

app = FastAPI(
    title="Bússola 2030 API • Prisma Insights",
    version="2.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(bussola_router)
app.include_router(analysis_router)


@app.get("/api/health", tags=["Health Check"])
def health():
    return {"status": "healthy", "service": "Bússola 2030 API"}
