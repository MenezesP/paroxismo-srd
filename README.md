# PAROXISMO — Compêndio Oficial SRD (Sistema d20)

Sistema de RPG de Horror Cósmico, Metafísica das Emoções, 10 Classes, 45 Fusões do Abismo, Árvores de Talentos e Grimório de 200 Rituais.

---

## Como Rodar Localmente

```bash
# Usando Node.js (serve)
npx serve . -p 8080

# Ou usando Python
python -m http.server 8080
```

Acesse em: `http://localhost:8080`

---

## Como Fazer o Deploy

Este projeto é uma aplicação web estática moderna (SPA pura com ES Modules, Tailwind e Three.js). Ele já está 100% pré-configurado com regras de roteamento e cache para **Vercel** e **Netlify**.

### Opção 1: Vercel (Recomendado)

#### Via GitHub:
1. Suba este projeto para um repositório no seu GitHub (público ou privado).
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New... > Project**.
3. Importe o repositório `paroxismo-srd`.
4. Deixe o Framework Preset como **Other** (ou deixe em branco).
5. O Root Directory é `./` (a raiz).
6. Clique em **Deploy**.

#### Via Linha de Comando (CLI):
```bash
npx vercel
```
Siga os prompts na tela para publicar diretamente.

---

### Opção 2: Netlify

#### Via GitHub:
1. Suba este projeto para o GitHub.
2. Acesse [app.netlify.com](https://app.netlify.com) e clique em **Add new site > Import an existing project**.
3. Conecte ao GitHub e selecione o repositório.
4. Em **Publish directory**, coloque `.` (ou deixe vazio).
5. Clique em **Deploy paroxismo-srd**.

#### Via Arrastar e Soltar (Netlify Drop - Sem Git):
1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arraste a pasta `paroxismo-srd` inteira para dentro do navegador.
3. O site estará online em segundos!

#### Via Linha de Comando (CLI):
```bash
npx netlify deploy --prod
```

---

## Estrutura do Projeto

* `index.html` — Ponto de entrada SPA.
* `vercel.json` — Roteamento SPA e cabeçalhos de cache para a Vercel.
* `netlify.toml` & `_redirects` — Roteamento SPA e cabeçalhos para o Netlify.
* `css/` — Sistema de design dark fantasy ocultista (`paroxismo-theme.css`).
* `js/` — Módulos ES6 (App, Roda de Navegação, Roda de Emoções, Grimório, Ficha, Forja).
* `assets/` — Imagens dos arquétipos, classes e selos em formato web-safe.
