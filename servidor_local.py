"""
Roda o site + a API no seu computador, do mesmo jeito que a Vercel faz.
Uso:  python servidor_local.py   (depois abra http://127.0.0.1:8000)
"""
import os
import sys
import webbrowser

import uvicorn
from fastapi.staticfiles import StaticFiles

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
from api.index import app  # noqa: E402

app.mount("/", StaticFiles(directory=ROOT, html=True), name="site")

if __name__ == "__main__":
    url = "http://127.0.0.1:8000"
    print("Site + Bússola 2030 rodando em", url, "(feche esta janela para parar)")
    if "--sem-navegador" not in sys.argv:
        webbrowser.open(url)
    uvicorn.run(app, host="127.0.0.1", port=8000)
