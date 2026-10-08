@echo off
title Impacto da IA no Trabalho 2030 - site local
cd /d "%~dp0"
echo Instalando dependencias (so demora na primeira vez)...
python -m pip install -q -r requirements.txt uvicorn
echo.
echo Abrindo o site em http://127.0.0.1:8000
echo Deixe esta janela aberta durante a apresentacao.
python servidor_local.py
pause
