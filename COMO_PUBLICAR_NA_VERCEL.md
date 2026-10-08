# Impacto da IA no Trabalho 2030 • Prisma Insights

Site da pesquisa (landing page, dashboard e simulador) + a ferramenta **Bússola 2030**.
Esta pasta tem tudo o que é preciso para publicar na Vercel.

## O que tem aqui

| Pasta / arquivo | Para que serve |
| --- | --- |
| `index.html` | Landing page com os gráficos, filtros, simulador e Power BI |
| `bussola.html` | Ferramenta Bússola 2030 (análise de currículo) |
| `css/`, `js/`, `vendor/`, `assets/` | Estilo, scripts, bibliotecas e imagens do site |
| `downloads/BI_Final_v2.pbix` | Arquivo do Power BI (botão "Baixar .PBIX") |
| `api/index.py` | API da Bússola (vira uma função Python na Vercel) |
| `backend/` | Os 5 agentes e a base WEF/McKinsey usados pela API |
| `requirements.txt` | Bibliotecas Python que a Vercel instala |
| `vercel.json` | Configuração da Vercel (manda `/api/...` para a API) |
| `INICIAR_LOCAL.bat` + `servidor_local.py` | Rodar tudo no seu computador, sem internet |

## Publicar na Vercel (pelo site, sem programar)

1. Crie uma conta grátis em **github.com** e outra em **vercel.com** (use "Continue with GitHub").
2. No GitHub, clique em **New repository**. Dê um nome (ex.: `impacto-ia-2030`), deixe **Public** e clique em **Create repository**.
3. Na página do repositório vazio, clique em **uploading an existing file**.
4. Abra esta pasta no Windows, selecione **todo o conteúdo dela** (Ctrl+A) e arraste para a página do GitHub.
   Importante: arraste o que está **dentro** da pasta, não a pasta em si. O `index.html` precisa ficar na raiz do repositório.
5. Espere o upload terminar e clique em **Commit changes**.
6. Na Vercel, clique em **Add New… → Project**, escolha o repositório e clique em **Import**.
7. Na tela de configuração, deixe assim:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command** e **Output Directory:** deixe vazios / padrão
8. Clique em **Deploy**. Em 1 a 2 minutos a Vercel mostra o link do site (algo como `impacto-ia-2030.vercel.app`).

## Conferir se deu certo

- Abra `https://SEU-LINK.vercel.app` → a landing page deve aparecer com os gráficos.
- Abra `https://SEU-LINK.vercel.app/api/health` → deve aparecer `{"status":"healthy", ...}`.
- Abra a Bússola, clique num perfil de teste (ex.: "Atendente de SAC") e depois cole um texto seu: o diagnóstico deve aparecer.

## Atualizar o site depois

Altere os arquivos no repositório do GitHub (botão **Add file → Upload files**, ou editando direto no GitHub).
A Vercel publica a nova versão sozinha em cerca de 1 minuto.

## Rodar no computador (plano B para a apresentação)

1. Precisa ter o **Python** instalado (python.org → marque "Add Python to PATH" na instalação).
2. Dê dois cliques em **INICIAR_LOCAL.bat**.
3. O site abre em `http://127.0.0.1:8000`. Deixe a janela preta aberta enquanto apresenta.

## Observações

- As fontes e as fotos da equipe vêm da internet; sem conexão o site funciona com fonte padrão.
- O botão "Abrir relatório interativo" do Power BI pede login na conta Microsoft dona do relatório.
- A primeira análise da Bússola depois de um tempo parado pode levar alguns segundos a mais na Vercel (a função "acorda").
