# PAROXISMO — Compêndio Oficial SRD & Mesa Virtual (VTT)

<div align="center">

[![Demonstração Online](https://img.shields.io/badge/Demonstração%20Online-paroxismo--srd.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://paroxismo-srd.vercel.app/)
[![Licença: MIT](https://img.shields.io/badge/Licença-MIT-amber.svg?style=for-the-badge)](LICENSE)
[![Discord Activity](https://img.shields.io/badge/Discord-Embedded%20App-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com)
[![Three.js](https://img.shields.io/badge/Engine%203D-Three.js-black?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Física](https://img.shields.io/badge/Física-Cannon.js-crimson?style=for-the-badge)](https://github.com/schteppe/cannon.js)
[![Tempo Real](https://img.shields.io/badge/Tempo%20Real-MQTT%20WebSockets-teal?style=for-the-badge)](https://mqtt.org/)

**Sistema de RPG de mesa d20 de horror cósmico, compêndio digital interativo e Mesa Virtual (VTT) multiplayer em tempo real, integrado nativamente como Discord Activity.**

---

🌐 **Idioma / Language:** **Português** | [English Version](README.md)

</div>

---

## 🌌 Visão Geral

**PAROXISMO** é um sistema de RPG de mesa (TTRPG) ambientado em um universo de terror cósmico, horror psicológico e metafísica das emoções.

Este repositório contém o **Documento de Referência do Sistema (SRD) Oficial** completo e uma aplicação web robusta projetada para jogadores e Mestres de jogo. Desenvolvido como uma Single Page Application (SPA) de alta performance e latência zero, o projeto une regras e ambientação ricas a tecnologias web modernas: **motor de dados 3D com física determinística em tempo real**, **sincronização de sessões multiplayer sem servidor dedicado**, **fichas de personagem interativas** e integração direta como **Atividade Embutida no Discord (Discord Voice Activity)**.

---

## ⚡ Destaques de Engenharia e Produto

### 🎲 Simulação 3D de Dados com Física em Tempo Real ("O Mesmo Dado")
* **Sincronização Determinística entre Múltiplos Clientes**: Quando qualquer participante (jogador ou Mestre) realiza uma rolagem (pela barra de dados, ficha, ataques de armas ou testes de perícias), o cliente emissor sorteia antecipadamente a face alvo e calcula os vetores físicos de arremesso (`position`, `velocity`, `angularVelocity`, `quaternions`), transmitindo-os via WebSockets MQTT.
* **Previsão Física em Headless World**: Utiliza um mundo isolado (`headlessWorld`) no **Cannon.js** para simular previamente o repouso e alinhar as coordenadas UV da textura do dado (`DiceManager.prepareValues`) antes de renderizar no **Three.js**.
* **Arena Física Padronizada**: Barreiras de colisão perimétricas fixas (`boundX = 50, boundZ = 75`) garantem que telas de celulares, tablets e monitores desktop processem os mesmos rebotes e parem na **exata mesma face** simultaneamente.
* **Exibição Sincronizada no Chat**: O card com o resultado numérico no feed de chat só é revelado no instante em que o dado atinge o repouso físico absoluto no feltro virtual, preservando a tensão da mesa.

### 🎮 Integração Nativa como Discord Activity (Embedded App SDK)
* **Execução Direta em Chamadas de Voz**: Roda nativamente dentro de canais de voz do Discord via **Discord Embedded App SDK**.
* **Pareamento Automático de Sala**: Identifica dinamicamente `channel_id` e instâncias do Discord para agrupar os participantes da mesma chamada na mesma mesa virtual, dispensando códigos de sala manuais.
* **Comunicação entre Clientes**: Rolagens, mensagens de chat e atualizações de ficha são transmitidas em tempo real para todos os membros ativos no canal de voz.

### 🌐 Arquitetura em Tempo Real P2P/MQTT Serverless
* **Protocolo MQTT 3.1.1 Puro em JavaScript**: Zero dependências externas pesadas; implementação de cliente binário ultraleve construída com `Uint8Array`, `TextEncoder` e `TextDecoder`.
* **Malha de Brokers de Alta Disponibilidade**: Failover automático entre brokers públicos globais baseados em WebSockets (HiveMQ, EMQX).
* **Resiliência de Conexão**: Reconexão com backoff exponencial, batimento cardíaco automático (`PINGREQ`/`PINGRESP`) e fila para mensagens offline.

### 📜 Compêndio SRD Completo e Sistemas Interativos
* **10 Classes / Arquétipos e 45 Fusões do Abismo**: Árvores de talentos e matriz interativa para explorar combinações abissais proibidas.
* **Grimório com mais de 200 Rituais**: Sistema de busca e filtros dinâmicos por círculo, emoção elemental e arquétipo.
* **Roda de Emoções Interativa**: Visualizador da Metafísica das Emoções, detalhando aflições psicológicas, estados mentais e mutações emocionais.
* **Forja de Armas e Equipamentos**: Regras completas de customização e cálculo automático de estatísticas de armas e relíquias ocultistas.

### 👤 Ficha de Personagem Dinâmica & Exportador de Imagem em Canvas
* **Cálculos Reativos**: Cálculo instantâneo de Pontos de Vida (PV), Pontos de Esforço (PE), modificadores de perícias e valores de combate.
* **Sincronização em Tempo Real com a Mesa**: Alterar o nome, conceito, avatar ou PV na ficha reflete imediatamente no token e na visualização do Mestre e dos demais jogadores.
* **Geração de Cartões Visuais**: Motor customizado em HTML5 Canvas (`sheet-image-generator.js`) para exportar fichas de personagem estilizadas em alta resolução diretamente pelo navegador.

### 🎨 Design System Dark Fantasy & Paisagem Sonora
* **UI/UX Atmosférica**: Tema gótico e ocultista em glassmorphism desenvolvido com Tailwind CSS e animações customizadas.
* **Roda de Navegação Rotativa**: Menu HUD circular customizado para alternância rápida e responsiva entre as seções do compêndio.
* **Paisagem Sonora em Web Audio API**: Efeitos sonoros dinâmicos para lançamento de dados, sucessos críticos, desastres abissais e abertura de modais litúrgicos (`sound-fx.js`).

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologias |
| :--- | :--- |
| **Frontend Core** | JavaScript Puro (Módulos ES6+), HTML5 Semântico, CSS3, Arquitetura SPA |
| **Gráficos 3D & Física** | [Three.js](https://threejs.org/) (Renderização WebGL 3D), [Cannon.js](https://github.com/schteppe/cannon.js) (Física de Corpos Rígidos) |
| **Rede em Tempo Real** | Protocolo MQTT 3.1.1 nativo sobre WebSockets (Binário, Pub/Sub, Failover de Brokers) |
| **Integração de Plataforma**| [Discord Embedded App SDK](https://discord.com/developers/docs/activities/overview) |
| **Estilização & Design** | [Tailwind CSS](https://tailwindcss.com/), Tema customizado Dark Fantasy Glassmorphism |
| **Áudio & Imagem** | Web Audio API, Motor de Renderização 2D em HTML5 Canvas |
| **Hospedagem & Deploy** | Vercel (Edge Functions e Roteamento), Netlify |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* Navegador moderno com suporte a WebGL (Chrome, Firefox, Edge, Safari).
* Node.js (opcional, para servidor de desenvolvimento) ou Python.

### Passos

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/MenezesP/paroxismo-srd.git
   cd paroxismo-srd
   ```

2. **Inicie um servidor estático**:
   ```bash
   # Com Node.js
   npx serve . -p 8080

   # Ou com Python
   python -m http.server 8080
   ```

3. Acesse `http://localhost:8080` no navegador.

---

## ☁️ Deploy e Publicação

O projeto possui configurações prontas para deploy contínuo na **Vercel** e no **Netlify**.

### Vercel (Recomendado)
```bash
npx vercel
```
Ou conecte o repositório no painel da [vercel.com](https://vercel.com) com o diretório raiz `./`.

### Netlify
```bash
npx netlify deploy --prod
```
Ou arraste a pasta do projeto diretamente para o [Netlify Drop](https://app.netlify.com/drop).

---

## 📁 Estrutura de Diretórios

```
paroxismo-srd/
├── index.html                 # Ponto de entrada SPA e layout semântico
├── vercel.json                # Roteamento SPA e cabeçalhos de cache da Vercel
├── netlify.toml & _redirects  # Regras de redirecionamento do Netlify
├── css/
│   └── paroxismo-theme.css    # Design system, tokens e estética dark fantasy
├── js/
│   ├── app.js                 # Roteador central e inicializador da aplicação
│   ├── components/            # Componentes de Interface
│   │   ├── session-viewer.js  # Mesa Virtual (Chat, Painel do Mestre, Iniciativa)
│   │   ├── character-sheet.js # Ficha de personagem com sincronização em tempo real
│   │   ├── rotary-wheel.js    # Menu de navegação circular
│   │   ├── emotion-wheel.js   # Roda interativa da metafísica das emoções
│   │   ├── grimoire-viewer.js # Grimório com mais de 200 rituais e busca
│   │   ├── fusion-matrix.js   # Matriz interativa das 45 Fusões do Abismo
│   │   ├── forge-viewer.js    # Forja de armas e equipamentos
│   │   └── particle-canvas.js # Fundo animado de partículas atmosféricas
│   ├── utils/                 # Utilitários e Serviços
│   │   ├── realtime-transport.js # Cliente WebSocket MQTT 3.1.1 puro
│   │   ├── session-sync.js    # Controle de presença, chat e estado da sala
│   │   ├── dice-animator.js   # Orquestrador físico de arremesso de dados 3D
│   │   ├── discord-activity.js# Ponte para o Discord Embedded App SDK
│   │   ├── sheet-image-generator.js # Gerador de cartões de personagem em Canvas
│   │   └── sound-fx.js        # Efeitos sonoros procedurais via Web Audio API
│   ├── data/                  # Banco de Dados e Módulos do Sistema
│   │   ├── classes.js         # 10 Classes e progressão de habilidades
│   │   ├── rituals.js         # Mais de 200 rituais e magias
│   │   ├── archetypes.js      # Lore detalhada e mecânicas das fusões
│   │   ├── bestiary.js        # Criaturas e entidades do universo
│   │   └── emotions.js        # Matriz emocional e psicológica
│   └── vendor/                # Bibliotecas de Terceiros
│       ├── three.min.js       # Renderizador 3D WebGL Three.js
│       ├── cannon.min.js      # Motor de física Cannon.js
│       └── three-dice.js      # Implementação física customizada de dados 3D
└── assets/                    # Ilustrações, ícones e brasões dos arquétipos
```

---

## Processo de Desenvolvimento

Este projeto foi desenvolvido com o auxílio de ferramentas baseadas em Inteligência Artificial durante a implementação, depuração e iteração.

A concepção do projeto, planejamento de funcionalidades, arquitetura de informação, direção visual, decisões de UI/UX e a direção geral do produto foram definidas e supervisionadas por mim.

---

## Development Process

This project was developed with the assistance of AI-based tools during
implementation, debugging, and iteration.

The project's concept, feature planning, information architecture,
visual direction, UI/UX decisions, and overall product direction were
defined and supervised by me.

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
Fique à vontade para explorar o código, criar adaptações e mergulhar no universo de terror metafísico de **Paroxismo**.

---

<div align="center">
  <sub>Desenvolvido por MenezesP · Criado para jogadores de RPG de mesa e entusiastas de horror cósmico.</sub>
</div>
