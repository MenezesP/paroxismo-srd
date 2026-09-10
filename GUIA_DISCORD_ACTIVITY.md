# 🎮 Guia de Configuração: Discord Activity — Paroxismo SRD

O site **PAROXISMO SRD** (`https://paroxismo-srd.vercel.app/`) agora é oficialmente uma **Discord Activity (Embedded App)**!

Os jogadores podem abrir o site completo (Grimório, Ficha de Personagem, Dados 3D com Física, Rituais e Bestiário) diretamente dentro de qualquer canal de voz do seu servidor no Discord.

---

## ⚡ Passo 1: Configurar no Discord Developer Portal

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique na sua aplicação (ou crie uma nova se ainda não tiver: **Paroxismo RPG**).
3. Na aba **General Information**:
   - Copie o **APPLICATION ID** (Client ID).
4. Na aba **OAuth2**:
   - Em **Client Secret**: copie o seu secret.
   - Em **Redirects**: adicione a URL:
     `https://paroxismo-srd.vercel.app/`
5. Na aba **Activities**:
   - Ative o botão **Activities** para habilitar Embedded Apps.
   - Em **URL Mappings**:
     - `Prefix`: `/`
     - `Target`: `paroxismo-srd.vercel.app` (sem `https://` e sem barra no final).
   - Clique em **Save Changes** no rodapé.

---

## 🔑 Passo 2: Adicionar as Variáveis na Vercel

No painel da sua Vercel no projeto **paroxismo-srd**:
1. Vá em **Settings** ➔ **Environment Variables**.
2. Adicione:
   - `VITE_DISCORD_CLIENT_ID`: Seu Application ID do Discord.
   - `DISCORD_CLIENT_SECRET`: Seu Client Secret do Discord.
3. Isso garante que a rota `/api/token` faça a troca de autenticação com segurança.

---

## 🎲 Passo 3: Jogar no Discord!

1. Entre em qualquer **Canal de Voz** no seu servidor do Discord.
2. Na barra inferior (onde tem o ícone de microfone e fone de ouvido), clique no ícone de **Foguete** (🎮 *Iniciar uma Atividade* / *Start an Activity*).
3. Selecione a sua aplicação **Paroxismo RPG**.
4. O site abrirá completo na tela de todo mundo na chamada:
   - Cada jogador tem sua ficha salva independentemente com o seu ID do Discord.
   - Ao rolar dados 3D na mesa ou fazer testes na ficha, a rolagem é transmitida e aparece como uma notificação em tempo real na tela de todos os participantes da chamada!