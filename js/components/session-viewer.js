/**
 * PAROXISMO — SESSÃO / MESA VIRTUAL (VTT)
 * Interface em tempo real para condução e participação de sessões de RPG.
 * Gothic Dark Fantasy / Terminal CAD Militar do Avesso.
 * 
 * - Palco da Sessão (Visão tática & Modo Cinemático 'Apresentar Cena')
 * - Chat & Log de Rolagens persistente com destaque de 20 e 1 natural
 * - Barra Permanente de Dados (D4, D6, D8, D10, D12, D20, D100) com física 3D
 * - Dossiê Rápido do Agente com rolagens de perícias de 1 clique
 * - Tracker de Iniciativa com controle de turnos para o Mestre
 * - Biblioteca e compartilhamento de Handouts / Pistas
 * - Controles exclusivos do Mestre
 * - Responsividade completa para Desktop, Tablet e Mobile
 */

import { soundFX } from '../utils/sound-fx.js?v=sound_v2';
import { DiceAnimator } from '../utils/dice-animator.js?v=phys_v12';
import { getCharacterDossier } from '../utils/character-storage.js?v=char_v1';
import { SessionSync } from '../utils/session-sync.js?v=sess_v1';
import { RULES_DATA } from '../data/rules.js';

export class SessionViewer {
  constructor(containerId, app) {
    this.container = document.getElementById(containerId);
    this.app = app;
    this.sync = null;
    
    // Identificação do Usuário e Personagem
    this.isGm = Boolean(app.gmModeActive);
    this.user = this.resolveCurrentUser();
    this.character = getCharacterDossier();
    
    // Estado da Sessão
    this.sessionId = localStorage.getItem('paroxismo_active_session_id') || 'necropole_setor_7';
    this.sessionData = {
      campaignName: localStorage.getItem('paroxismo_campaign_name') || 'Operação Necrópole',
      sessionNumber: parseInt(localStorage.getItem('paroxismo_session_num') || '12', 10),
      status: localStorage.getItem('paroxismo_session_status') || 'active', // 'active', 'paused', 'concluded'
      tacticalNotes: localStorage.getItem('paroxismo_tactical_notes') || 'Restaurar os 3 disjuntores mestres no Setor 7 para reativar o elevador de carga.',
      currentDate: '13 de Setembro // Ciclo 04'
    };

    // Estado da Iniciativa
    this.initiativeList = this.loadInitialInitiative();
    this.activeTurnIndex = 0;
    this.combatActive = false;

    // Estado do Palco Central & Modo Cinemático
    this.cinematicScene = null; // { title, url, description }

    // Estado de Handouts
    this.handouts = this.loadInitialHandouts();
    this.activeHandoutModal = null;

    // Estado do Chat & Dice Log
    this.chatMessages = this.loadInitialMessages();
    this.typingUsers = new Map();
    this.typingTimeout = null;

    // Estado do Dock de Dados
    this.selectedDiceType = 20; // d20 padrão
    this.diceQuantity = 1;
    this.diceModifier = 0;
    this.diceRollVisibility = 'public'; // 'public', 'private_gm', 'blind'

    // Estado de Interface / Mobile
    this.activeMobileTab = 'mesa'; // 'mesa', 'chat', 'dados', 'agente', 'mestre'
    this.activeLeftTab = 'iniciativa'; // 'jogadores', 'iniciativa', 'agente', 'handouts', 'mestre'
    this.isLeftSidebarCollapsed = false;
    this.isRightSidebarCollapsed = false;

    this.init();
  }

  resolveCurrentUser() {
    if (this.app?.discord?.user) {
      return {
        id: this.app.discord.user.id,
        name: this.app.discord.user.global_name || this.app.discord.user.username,
        avatar: this.app.discord.user.avatar,
        role: this.isGm ? 'GM' : 'PLAYER'
      };
    }

    let stableId = localStorage.getItem('paroxismo_discord_user_id') || 
                   localStorage.getItem('paroxismo_stable_user_id');
    let stableName = localStorage.getItem('paroxismo_discord_user_name');

    if (!stableId) {
      stableId = 'agente_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1000);
      try { localStorage.setItem('paroxismo_stable_user_id', stableId); } catch (e) {}
    }

    return {
      id: stableId,
      name: stableName || (this.isGm ? 'Condutor' : 'Agente ' + stableId.slice(-4)),
      avatar: null,
      role: this.isGm ? 'GM' : 'PLAYER'
    };
  }

  loadInitialInitiative() {
    return [
      { id: 'ini_1', name: this.character?.name || 'Vane', initiative: 22, bonus: 4, isNpc: false, currentPv: this.character?.currentPv || 22, maxPv: 22, active: true },
      { id: 'ini_2', name: 'Rastejador do Abismo', initiative: 18, bonus: 3, isNpc: true, currentPv: 34, maxPv: 34, active: false },
      { id: 'ini_3', name: 'JM', initiative: 15, bonus: 2, isNpc: false, currentPv: 19, maxPv: 20, active: false },
      { id: 'ini_4', name: 'Saklas', initiative: 9, bonus: 1, isNpc: false, currentPv: 25, maxPv: 25, active: false }
    ];
  }

  loadInitialHandouts() {
    return [
      {
        id: 'hnd_1',
        title: 'Diagrama do Gerador Industrial',
        imageUrl: 'assets/images/hero_banner.jpg',
        category: 'mapa',
        content: 'Esquema de fiação de alta tensão recuperado da sala de controle do Setor 7. Indica que os disjuntores precisam ser ativados em sequência direta.',
        shared: true
      },
      {
        id: 'hnd_2',
        title: 'Relatório Confidencial: Incidente 09',
        imageUrl: 'assets/images/scroll_banner.jpg',
        category: 'documento',
        content: '“A manifestação ocorreu no 3º nível do subsolo. As vítimas apresentavam calcificação muscular acelerada e pupilas dilatadas em tom carmesim.”',
        shared: false
      },
      {
        id: 'hnd_3',
        title: 'Símbolo Gravado na Rocha Selada',
        imageUrl: 'assets/images/paroxismo_logo_tight.png',
        category: 'simbolo',
        content: 'Um sigilo octogonal entalhado com precisão milimétrica. Emite um pulso térmico fraco quando tocado por carne viva.',
        shared: false
      }
    ];
  }

  loadInitialMessages() {
    return [
      {
        id: 'msg_0',
        type: 'system',
        text: 'Sessão iniciada. Conexão criptografada estabelecida com o canal tático da Mesa.',
        timestamp: '14:00'
      },
      {
        id: 'msg_1',
        type: 'gm_narrative',
        author: { name: 'Mestre', role: 'GM' },
        text: 'O ar dentro do túnel de manutenção é denso e carrega um odor persistente de ozônio e ferrugem úmida. À frente, os cabos do gerador pendem como artérias cortadas.',
        timestamp: '14:02'
      },
      {
        id: 'msg_2',
        type: 'normal',
        author: { name: 'Paulo', characterName: 'Vane' },
        text: 'Avanço com a lanterna baixa para não chamar atenção, examinando as marcas de sangue nas paredes.',
        timestamp: '14:05'
      }
    ];
  }

  init() {
    if (!this.container) return;
    
    // Inicializa a conexão de tempo real com a sala da sessão
    this.initSync();
    
    // Renderiza a estrutura da mesa virtual e anexa eventos
    this.render();
  }

  initSync() {
    this.sync = new SessionSync(this.sessionId, this.user, this.character, this.isGm);
    this.sync.connect();

    // Escuta novas mensagens de chat
    this.sync.on('chat', (chatMsg) => {
      this.chatMessages.push(chatMsg);
      this.renderChatFeedOnly();
      this.scrollChatToBottom();
    });

    // Escuta novas rolagens
    this.sync.on('roll', (rollMsg) => {
      this.chatMessages.push({
        id: rollMsg.id,
        type: 'roll',
        ...rollMsg
      });
      this.renderChatFeedOnly();
      this.scrollChatToBottom();
    });

    // Escuta atualizações de iniciativa
    this.sync.on('initiative', (data) => {
      if (data.list) this.initiativeList = data.list;
      if (typeof data.activeIndex === 'number') this.activeTurnIndex = data.activeIndex;
      if (typeof data.combatActive === 'boolean') this.combatActive = data.combatActive;
      this.renderInitiativeListOnly();
      this.renderCenterCombatSummary();
    });

    // Escuta handouts compartilhados
    this.sync.on('handout', (data) => {
      if (data.action === 'show' && data.handout) {
        this.openHandoutModal(data.handout);
      } else if (data.action === 'close') {
        this.closeHandoutModal();
      }
    });

    // Escuta modo cinemático (Apresentar Cena)
    this.sync.on('scene', (data) => {
      if (data.active && data.scene) {
        this.cinematicScene = data.scene;
      } else {
        this.cinematicScene = null;
      }
      this.renderCenterStageOnly();
    });

    // Escuta eventos de sistema
    this.sync.on('system', (data) => {
      this.chatMessages.push({
        id: data.id,
        type: 'system',
        text: data.message,
        timestamp: data.timestamp || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });
      this.renderChatFeedOnly();
      this.scrollChatToBottom();
    });

    // Escuta estado da sessão (Pausar/Ativar)
    this.sync.on('state', (state) => {
      if (state.status) this.sessionData.status = state.status;
      if (state.tacticalNotes) this.sessionData.tacticalNotes = state.tacticalNotes;
      if (state.campaignName) this.sessionData.campaignName = state.campaignName;
      this.renderHeaderOnly();
      this.renderCenterStageOnly();
    });

    // Escuta presença de participantes
    this.sync.on('presence', (participants) => {
      this.renderParticipantsListOnly(participants);
    });

    // Escuta digitando
    this.sync.on('typing', (data) => {
      if (data.isTyping) {
        this.typingUsers.set(data.userId, data.name);
      } else {
        this.typingUsers.delete(data.userId);
      }
      this.updateTypingIndicator();
    });
  }

  // ============================================================
  // RENDERIZAÇÃO COMPLETA DA INTERFACE
  // ============================================================
  render() {
    this.container.innerHTML = `
      <div id="paroxismo-vtt-root" class="w-full flex flex-col min-h-[calc(100vh-80px)] pb-24 lg:pb-20 text-white font-mono select-none">
        
        <!-- ============================================================ -->
        <!-- 1. SUB-HUD DA SESSÃO (BARRA SUPERIOR DE COMANDO) -->
        <!-- ============================================================ -->
        <header id="vtt-header" class="w-full bg-[#07090e]/95 border-b border-[#e21b23]/40 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
          ${this.getHeaderHTML()}
        </header>

        <!-- ============================================================ -->
        <!-- 2. PALCO PRINCIPAL DE 3 COLUNAS (DESKTOP) OU TABS (MOBILE)   -->
        <!-- ============================================================ -->
        <div class="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 p-2 sm:p-4 min-h-0">
          
          <!-- COLUNA ESQUERDA: FERRAMENTAS DA SESSÃO (Lg: 3 cols) -->
          <aside id="vtt-left-sidebar" class="vtt-col-left ${this.activeMobileTab === 'agente' || this.activeMobileTab === 'mestre' ? 'vtt-mobile-active-flex' : ''} lg:col-span-3 xl:col-span-3 flex-col gap-3 min-h-0 transition-all duration-300">
            ${this.getLeftSidebarHTML()}
          </aside>

          <!-- COLUNA CENTRAL: PALCO PRINCIPAL (VISÃO DA SESSÃO / CENA CINEMÁTICA) -->
          <main id="vtt-center-stage" class="${this.activeMobileTab === 'mesa' ? 'flex' : 'hidden lg:flex'} lg:col-span-6 xl:col-span-6 flex-col gap-3 min-h-[460px] relative">
            ${this.getCenterStageHTML()}
          </main>

          <!-- COLUNA DIREITA: CHAT & LOG DA SESSÃO (Lg: 3 cols) -->
          <aside id="vtt-right-sidebar" class="vtt-col-right ${this.activeMobileTab === 'chat' ? 'vtt-mobile-active-flex' : ''} lg:col-span-3 xl:col-span-3 flex-col min-h-[500px] lg:min-h-0 bg-[#07090e]/90 border border-white/10 relative">
            ${this.getRightSidebarHTML()}
          </aside>

        </div>

        <!-- ============================================================ -->
        <!-- 3. BARRA PERMANENTE DE DADOS (DOCK INFERIOR) -->
        <!-- ============================================================ -->
        <footer id="vtt-dice-dock" class="fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 border-t border-[#e21b23]/50 backdrop-blur-lg px-2 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0_-5px_25px_rgba(0,0,0,0.9)]">
          ${this.getDiceDockHTML()}
        </footer>

        <!-- ============================================================ -->
        <!-- 4. NAVEGAÇÃO MOBILE INFERIOR (TÁTIL PARA DISPOSITIVOS MÓVEIS) -->
        <!-- ============================================================ -->
        <div id="vtt-mobile-nav" class="lg:hidden fixed bottom-14 left-0 right-0 z-40 bg-[#050505]/95 border-t border-white/10 px-2 py-1 flex items-center justify-around text-[10px] font-mono">
          ${this.getMobileNavHTML()}
        </div>

        <!-- ============================================================ -->
        <!-- 5. CONTAINER PARA MODAIS DE HANDOUT & IMAGEM (Z-50) -->
        <!-- ============================================================ -->
        <div id="vtt-handout-modal-container" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <!-- Renderizado dinamicamente -->
        </div>

      </div>
    `;

    this.setupEventListeners();
    this.scrollChatToBottom();
  }

  // ============================================================
  // COMPONENTES HTML INTERNOS
  // ============================================================

  getHeaderHTML() {
    const isPaused = this.sessionData.status === 'paused';
    return `
      <div class="flex items-center gap-2 sm:gap-3 min-w-0 max-w-full">
        <span class="text-[#e21b23] text-xs sm:text-base font-black tracking-wider flex-shrink-0">✠ MESA</span>
        <span class="text-white/20 hidden sm:inline">|</span>
        <div class="flex flex-col min-w-0 flex-1">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="font-serif font-bold text-white text-xs sm:text-sm tracking-wide truncate">${this.escapeHTML(this.sessionData.campaignName)}</span>
            <span class="text-[9px] text-[#8e95a5] font-mono flex-shrink-0">[#${this.sessionData.sessionNumber}]</span>
          </div>
          <span class="text-[9px] text-white/40 font-mono hidden sm:inline">${this.sessionData.currentDate} // Sala: ${this.sessionId}</span>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <!-- Status da Sessão -->
        <div class="flex items-center gap-1.5 px-2 py-0.5 border ${isPaused ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'} text-[10px] font-mono">
          <span class="inline-block w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}"></span>
          <span>${isPaused ? 'PAUSADA' : 'EM ANDAMENTO'}</span>
        </div>

        <!-- Identificação de Papel (GM / Jogador) -->
        ${this.isGm ? `
          <span class="px-2 py-0.5 bg-[#e21b23]/20 border border-[#e21b23] text-[#e21b23] text-[10px] font-bold tracking-wider">✠ MESTRE</span>
        ` : `
          <span class="px-2 py-0.5 bg-[#06b6d4]/10 border border-[#06b6d4]/40 text-[#06b6d4] text-[10px]">AGENTE: ${this.escapeHTML(this.character?.name || 'Vane')}</span>
        `}

        <!-- Botão Fullscreen -->
        <button id="vtt-btn-fullscreen" class="px-2 py-1 bg-black/60 hover:bg-white/10 border border-white/20 text-[11px] text-[#cbd0dc] hover:text-white transition-all cursor-pointer" title="Modo Tela Cheia (F11)">
          ⛶
        </button>

        <!-- Botão Sair da Mesa -->
        <button id="vtt-btn-exit" class="px-2.5 py-1 bg-[#e21b23]/10 hover:bg-[#e21b23] border border-[#e21b23]/60 hover:border-[#e21b23] text-[10px] font-bold text-white transition-all cursor-pointer" title="Sair da Sessão e Retornar ao Compêndio">
          ✕ SAIR
        </button>
      </div>
    `;
  }

  getLeftSidebarHTML() {
    return `
      <!-- Barra de Abas da Ferramenta Esquerda -->
      <div class="flex items-center bg-[#07090e] border border-white/10 p-1 gap-1 text-[10px] font-mono overflow-x-auto scrollbar-none">
        <button class="vtt-left-tab-btn flex-1 py-1 px-1.5 text-center transition-all cursor-pointer ${this.activeLeftTab === 'iniciativa' ? 'bg-[#e21b23] text-black font-black' : 'text-[#8e95a5] hover:text-white'}" data-tab="iniciativa">
          INICIATIVA
        </button>
        <button class="vtt-left-tab-btn flex-1 py-1 px-1.5 text-center transition-all cursor-pointer ${this.activeLeftTab === 'agente' ? 'bg-[#e21b23] text-black font-black' : 'text-[#8e95a5] hover:text-white'}" data-tab="agente">
          MEU AGENTE
        </button>
        <button class="vtt-left-tab-btn flex-1 py-1 px-1.5 text-center transition-all cursor-pointer ${this.activeLeftTab === 'jogadores' ? 'bg-[#e21b23] text-black font-black' : 'text-[#8e95a5] hover:text-white'}" data-tab="jogadores">
          JOGADORES
        </button>
        <button class="vtt-left-tab-btn flex-1 py-1 px-1.5 text-center transition-all cursor-pointer ${this.activeLeftTab === 'handouts' ? 'bg-[#e21b23] text-black font-black' : 'text-[#8e95a5] hover:text-white'}" data-tab="handouts">
          PISTAS
        </button>
        ${this.isGm ? `
          <button class="vtt-left-tab-btn py-1 px-2 text-center transition-all cursor-pointer ${this.activeLeftTab === 'mestre' ? 'bg-[#06b6d4] text-black font-black' : 'text-[#06b6d4] hover:bg-[#06b6d4]/10'}" data-tab="mestre" title="Painel Exclusivo do Mestre">
            MESTRE
          </button>
        ` : ''}
      </div>

      <!-- Container do Conteúdo da Ferramenta -->
      <div id="vtt-left-content" class="flex-1 bg-[#07090e]/90 border border-white/10 p-3 overflow-y-auto flex flex-col gap-3 min-h-[380px] max-h-[calc(100vh-220px)]">
        ${this.getLeftTabContentHTML()}
      </div>
    `;
  }

  getLeftTabContentHTML() {
    switch (this.activeLeftTab) {
      case 'iniciativa':
        return this.getInitiativeHTML();
      case 'agente':
        return this.getQuickDossierHTML();
      case 'jogadores':
        return this.getParticipantsHTML();
      case 'handouts':
        return this.getHandoutsHTML();
      case 'mestre':
        return this.getGmPanelHTML();
      default:
        return this.getInitiativeHTML();
    }
  }

  // ------------------------------------------------------------
  // TAB 1: TRACKER DE INICIATIVA
  // ------------------------------------------------------------
  getInitiativeHTML() {
    const activeActor = this.initiativeList[this.activeTurnIndex];
    return `
      <div class="flex flex-col gap-3 h-full">
        <!-- Header da Iniciativa -->
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-[#e21b23] font-black text-xs">⚔ COMBATE</span>
            <span class="text-[9px] text-[#8e95a5]">(${this.initiativeList.length} combatentes)</span>
          </div>
          ${this.isGm ? `
            <div class="flex items-center gap-1">
              <button id="vtt-btn-toggle-combat" class="px-2 py-0.5 text-[9px] ${this.combatActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-white/10 text-white/70 border border-white/20'} hover:text-white cursor-pointer">
                ${this.combatActive ? 'COMBATE ATIVO' : 'INICIAR'}
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Turno Atual em Destaque -->
        ${activeActor ? `
          <div class="p-2.5 bg-[#0e121a] border-l-4 border-[#06b6d4] flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[9px] text-[#06b6d4] font-bold tracking-widest uppercase">▶ TURNO ATUAL (RODADA 1)</span>
              <span class="font-serif font-bold text-white text-sm">${this.escapeHTML(activeActor.name)}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-[#8e95a5]">INIC</span>
              <div class="text-base font-black text-[#06b6d4]">${activeActor.initiative}</div>
            </div>
          </div>
        ` : ''}

        <!-- Controles de Avanço de Turno (Apenas Mestre) -->
        ${this.isGm ? `
          <div class="grid grid-cols-2 gap-1.5">
            <button id="vtt-btn-prev-turn" class="py-1 px-2 bg-black/60 hover:bg-white/10 border border-white/20 text-[10px] text-[#cbd0dc] hover:text-white flex items-center justify-center gap-1 cursor-pointer">
              <span>◀</span> ANTERIOR
            </button>
            <button id="vtt-btn-next-turn" class="py-1 px-2 bg-[#e21b23]/20 hover:bg-[#e21b23] border border-[#e21b23] text-[10px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer">
              PRÓXIMO <span>▶</span>
            </button>
          </div>
        ` : ''}

        <!-- Lista Ordenada de Iniciativa -->
        <div class="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
          ${this.initiativeList.map((actor, idx) => {
            const isCurrent = idx === this.activeTurnIndex;
            return `
              <div class="p-2 ${isCurrent ? 'bg-[#141a24] border border-[#06b6d4]/60' : 'bg-black/40 border border-white/5 hover:border-white/20'} flex items-center justify-between text-xs transition-all">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-4 text-center font-bold ${isCurrent ? 'text-[#06b6d4]' : 'text-white/40'}">${idx + 1}.</span>
                  <div class="flex flex-col min-w-0">
                    <span class="font-serif font-bold ${actor.isNpc ? 'text-[#ff333d]' : 'text-white'} truncate">${this.escapeHTML(actor.name)}</span>
                    <span class="text-[9px] text-[#8e95a5]">${actor.isNpc ? 'Ameaça / Inimigo' : 'Agente Aliado'}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="px-1.5 py-0.5 bg-black/80 border border-white/10 text-white font-mono text-[11px] font-bold">${actor.initiative}</span>
                  ${this.isGm ? `
                    <button class="vtt-btn-remove-actor text-white/30 hover:text-[#ff333d] px-1" data-id="${actor.id}" title="Remover da Iniciativa">×</button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Ações Adicionais do Mestre -->
        ${this.isGm ? `
          <div class="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <button id="vtt-btn-add-combatant" class="flex-1 py-1 bg-black/60 hover:bg-white/10 border border-white/20 text-[9px] text-[#cbd0dc] hover:text-white cursor-pointer">
              + NOVO COMBATENTE
            </button>
            <button id="vtt-btn-clear-initiative" class="py-1 px-2 bg-black/60 hover:bg-[#ff333d]/20 border border-white/20 hover:border-[#ff333d] text-[9px] text-[#ff333d] cursor-pointer" title="Zerar lista de iniciativa">
              LIMPAR
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  // ------------------------------------------------------------
  // TAB 2: DOSSIÊ RÁPIDO DO AGENTE (1-CLIQUE PARA ROLAGEM)
  // ------------------------------------------------------------
  getQuickDossierHTML() {
    const c = this.character;
    const attrs = c.attributes || { agi: 2, for: 2, int: 1, pre: 1, vig: 2 };
    
    // Perícias oficiais com atributo base correspondente
    const officialSkills = [
      { id: 'luta', name: 'Luta', attr: 'for' },
      { id: 'pontaria', name: 'Pontaria', attr: 'agi' },
      { id: 'percepcao', name: 'Percepção', attr: 'pre' },
      { id: 'investigacao', name: 'Investigação', attr: 'int' },
      { id: 'atletismo', name: 'Atletismo', attr: 'for' },
      { id: 'furtividade', name: 'Furtividade', attr: 'agi' },
      { id: 'iniciativa', name: 'Iniciativa', attr: 'agi' },
      { id: 'vontade', name: 'Vontade', attr: 'pre' },
      { id: 'medicina', name: 'Medicina', attr: 'int' },
      { id: 'ocultismo', name: 'Ocultismo', attr: 'int' },
      { id: 'reflexos', name: 'Reflexos', attr: 'agi' },
      { id: 'fortitude', name: 'Fortitude', attr: 'vig' }
    ];

    return `
      <div class="flex flex-col gap-3">
        <!-- Cabeçalho do Personagem -->
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex flex-col min-w-0">
            <span class="font-serif font-bold text-white text-sm truncate">${this.escapeHTML(c.name || 'Agente')}</span>
            <span class="text-[10px] text-[#8e95a5] capitalize">${c.concept || 'Sobrevivente'} // Nv ${c.level || 1}</span>
          </div>
          <a href="#ficha" class="text-[9px] text-[#06b6d4] hover:underline flex items-center gap-1">
            [ VER FICHA ↗ ]
          </a>
        </div>

        <!-- PV e PE Rápidos -->
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2 bg-black/60 border border-[#e21b23]/40 flex flex-col">
            <div class="flex justify-between items-center text-[9px] text-[#e21b23] font-bold">
              <span>PONTOS DE VIDA</span>
              <span>${c.currentPv || 22}/22</span>
            </div>
            <div class="w-full h-1.5 bg-black/80 mt-1.5 overflow-hidden">
              <div class="h-full bg-[#e21b23]" style="width: ${Math.min(100, Math.round(((c.currentPv || 22) / 22) * 100))}%;"></div>
            </div>
          </div>
          <div class="p-2 bg-black/60 border border-[#06b6d4]/40 flex flex-col">
            <div class="flex justify-between items-center text-[9px] text-[#06b6d4] font-bold">
              <span>PONTOS DE ESFORÇO</span>
              <span>${c.currentPe || 3}/3</span>
            </div>
            <div class="w-full h-1.5 bg-black/80 mt-1.5 overflow-hidden">
              <div class="h-full bg-[#06b6d4]" style="width: ${Math.min(100, Math.round(((c.currentPe || 3) / 3) * 100))}%;"></div>
            </div>
          </div>
        </div>

        <!-- Testes Rápidos de Atributos (1d20 + Atributo) -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[9px] text-[#8e95a5] font-bold uppercase tracking-wider">TESTES DE ATRIBUTO (1-CLIQUE)</span>
          <div class="grid grid-cols-5 gap-1">
            ${Object.entries(attrs).map(([key, val]) => `
              <button class="vtt-btn-quick-attr py-1.5 bg-black/50 hover:bg-[#e21b23]/20 border border-white/10 hover:border-[#e21b23] text-center transition-all cursor-pointer" data-attr="${key}" data-val="${val}" title="Rolar 1d20 + ${val}">
                <div class="text-[9px] text-white/50 uppercase">${key}</div>
                <div class="text-xs font-bold text-white">+${val}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Perícias Principais (1-Clique) -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[9px] text-[#8e95a5] font-bold uppercase tracking-wider">PERÍCIAS & TESTES DIRETOS</span>
          <div class="grid grid-cols-1 gap-1 max-h-[190px] overflow-y-auto pr-1">
            ${officialSkills.map(skill => {
              const isTrained = (c.trainedSkills || []).includes(skill.id);
              const attrVal = attrs[skill.attr] || 0;
              const bonus = attrVal + (isTrained ? 2 : 0);
              return `
                <button class="vtt-btn-quick-skill w-full px-2 py-1.5 ${isTrained ? 'bg-[#0f141d] border border-[#06b6d4]/40 hover:border-[#06b6d4]' : 'bg-black/30 border border-white/5 hover:border-white/20'} flex items-center justify-between text-left transition-all cursor-pointer" data-name="${skill.name}" data-mod="${bonus}">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[#e21b23]">🎲</span>
                    <span class="text-xs ${isTrained ? 'text-white font-bold' : 'text-white/70'}">${skill.name}</span>
                    <span class="text-[8px] text-white/30 uppercase">(${skill.attr})</span>
                  </div>
                  <span class="px-1.5 py-0.2 bg-black/80 border border-white/10 text-[10px] font-mono font-bold ${isTrained ? 'text-[#06b6d4]' : 'text-white/50'}">
                    +${bonus}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // TAB 3: PARTICIPANTES DA SESSÃO (STATUS DE PRESENÇA)
  // ------------------------------------------------------------
  getParticipantsHTML() {
    return `
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <span class="text-xs font-bold text-white">AGENTES CONECTADOS</span>
          <span class="text-[9px] text-[#06b6d4] font-mono">[ SALA: ${this.sessionId} ]</span>
        </div>

        <div id="vtt-participants-list" class="flex flex-col gap-2">
          <!-- Participante Local (Você) -->
          <div class="p-2 bg-black/50 border border-[#06b6d4]/40 flex items-center justify-between">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-white text-xs truncate">${this.escapeHTML(this.user.name)}</span>
                  <span class="text-[8px] text-[#06b6d4] border border-[#06b6d4]/40 px-1">VOCÊ</span>
                </div>
                <span class="text-[9px] text-[#8e95a5] truncate">${this.escapeHTML(this.character?.name || 'Vane')} // ${this.character?.concept || 'Sobrevivente'}</span>
              </div>
            </div>
            ${this.isGm ? '<span class="text-[9px] text-[#e21b23] font-bold">✠ GM</span>' : ''}
          </div>

          <!-- Mock/Simulação de Outros Participantes da Mesa -->
          <div class="p-2 bg-black/30 border border-white/5 flex items-center justify-between">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-white text-xs">Nick</span>
                <span class="text-[9px] text-[#8e95a5]">JM // Militar Tático</span>
              </div>
            </div>
          </div>

          <div class="p-2 bg-black/30 border border-white/5 flex items-center justify-between">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-white/80 text-xs">Daniel</span>
                <span class="text-[9px] text-[#8e95a5]">Saklas // Ocultista</span>
              </div>
            </div>
            <span class="text-[8px] text-amber-400">AUSENTE</span>
          </div>

          <div class="p-2 bg-black/20 border border-white/5 opacity-60 flex items-center justify-between">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-2 h-2 rounded-full bg-zinc-600"></span>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-white/50 text-xs">Xamps</span>
                <span class="text-[9px] text-[#8e95a5]">Eve // Infiltradora</span>
              </div>
            </div>
            <span class="text-[8px] text-zinc-500">OFFLINE</span>
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // TAB 4: HANDOUTS & PISTAS
  // ------------------------------------------------------------
  getHandoutsHTML() {
    return `
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <span class="text-xs font-bold text-white">ACERVO DE PISTAS</span>
          ${this.isGm ? `
            <button id="vtt-btn-add-handout" class="text-[9px] text-[#e21b23] hover:underline cursor-pointer">
              + ADICIONAR
            </button>
          ` : ''}
        </div>

        <div class="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
          ${this.handouts.map(h => `
            <div class="p-2 bg-black/40 border border-white/10 hover:border-white/20 flex flex-col gap-1.5 transition-all">
              <div class="flex items-center justify-between">
                <span class="font-serif font-bold text-white text-xs truncate">${this.escapeHTML(h.title)}</span>
                <span class="text-[8px] px-1 bg-black text-[#06b6d4] border border-[#06b6d4]/30 uppercase">${h.category}</span>
              </div>
              <p class="text-[10px] text-[#8e95a5] line-clamp-2">${this.escapeHTML(h.content)}</p>
              <div class="flex items-center justify-between pt-1 border-t border-white/5">
                <button class="vtt-btn-view-handout text-[9px] text-white/70 hover:text-white cursor-pointer" data-id="${h.id}">
                  [ 👁 ABRIR PISTA ]
                </button>
                ${this.isGm ? `
                  <button class="vtt-btn-reveal-handout text-[9px] text-[#e21b23] hover:underline font-bold cursor-pointer" data-id="${h.id}">
                    [ TRANSMITIR À MESA ]
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // TAB 5: PAINEL EXCLUSIVO DO MESTRE
  // ------------------------------------------------------------
  getGmPanelHTML() {
    return `
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-[#06b6d4]/30 pb-2">
          <span class="text-xs font-bold text-[#06b6d4] tracking-wider">✠ CONTROLES DO CONDUTOR</span>
          <span class="text-[8px] bg-[#06b6d4]/20 text-[#06b6d4] px-1 py-0.5 font-mono">SECRETO</span>
        </div>

        <!-- Ações do Mestre -->
        <div class="flex flex-col gap-1.5">
          <button id="vtt-btn-gm-scene" class="w-full p-2 bg-black/60 hover:bg-[#06b6d4]/10 border border-[#06b6d4]/40 hover:border-[#06b6d4] text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">🎬 Apresentar Cena (Cinemático)</span>
              <span class="text-[9px] text-[#8e95a5]">Projeta arte de local ou monstro no palco central</span>
            </div>
            <span class="text-xs text-[#06b6d4]">❯</span>
          </button>

          <button id="vtt-btn-gm-secret-roll" class="w-full p-2 bg-black/60 hover:bg-[#e21b23]/10 border border-[#e21b23]/40 hover:border-[#e21b23] text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">🎲 Rolagem Oculta do Mestre</span>
              <span class="text-[9px] text-[#8e95a5]">Jogadores sabem que rolou, mas não veem o resultado</span>
            </div>
            <span class="text-xs text-[#e21b23]">❯</span>
          </button>

          <button id="vtt-btn-gm-pause" class="w-full p-2 bg-black/60 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">❚❚ Pausar / Retomar Sessão</span>
              <span class="text-[9px] text-[#8e95a5]">Alterna o estado da sessão para todos os clientes</span>
            </div>
            <span class="text-xs text-white/50">❯</span>
          </button>

          <button id="vtt-btn-gm-sys-msg" class="w-full p-2 bg-black/60 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">📢 Mensagem do Sistema</span>
              <span class="text-[9px] text-[#8e95a5]">Emite anúncio global no chat em destaque</span>
            </div>
            <span class="text-xs text-white/50">❯</span>
          </button>

          <button id="vtt-btn-gm-notes" class="w-full p-2 bg-black/60 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">📝 Atualizar Objetivo Tático</span>
              <span class="text-[9px] text-[#8e95a5]">Altera o resumo exibido na Visão da Sessão</span>
            </div>
            <span class="text-xs text-white/50">❯</span>
          </button>
        </div>
      </div>
    `;
  }

  // ============================================================
  // PALCO CENTRAL: VISÃO DA SESSÃO OU MODO CINEMÁTICO
  // ============================================================
  getCenterStageHTML() {
    if (this.cinematicScene) {
      return this.getCinematicStageHTML();
    }
    return this.getSessionOverviewHTML();
  }

  getSessionOverviewHTML() {
    return `
      <div class="flex-1 flex flex-col gap-3 min-h-0">
        <!-- Banner Atmosférico do Setor / Campanha -->
        <div class="relative w-full h-44 sm:h-52 bg-[#0a0d14] border border-white/10 overflow-hidden flex flex-col justify-end p-4 sm:p-6 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
          <div class="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity" style="background-image: url('assets/images/hero_banner.jpg');"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent"></div>

          <div class="relative z-10 flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <span class="text-[#e21b23] text-xs font-mono font-bold">[ LOCAL TÁTICO // SETOR 7 ]</span>
              <span class="text-white/30 text-xs">•</span>
              <span class="text-[#06b6d4] text-xs font-mono">PROFUNDIDADE: -120 METROS</span>
            </div>
            <h2 class="font-serif font-black text-xl sm:text-2xl text-white tracking-wide uppercase">
              ${this.escapeHTML(this.sessionData.campaignName)}
            </h2>
            <p class="text-xs text-[#8e95a5] max-w-xl font-mono">
              O metrô subterrâneo desmoronou sob a pressão das entidades emocionais. Os trilhos foram corroídos por ácido do Rancor.
            </p>
          </div>
        </div>

        <!-- Cards Táticos da Visão da Sessão -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
          
          <!-- Card 1: Objetivo Tático Atual -->
          <div class="p-3.5 bg-[#07090e]/90 border border-white/10 flex flex-col gap-2">
            <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span class="text-[10px] text-[#06b6d4] font-bold uppercase tracking-wider flex items-center gap-1">
                <span>🎯</span> OBJETIVO DA SESSÃO
              </span>
              <span class="text-[9px] text-white/30 font-mono">EM PROGRESSO</span>
            </div>
            <p class="text-xs text-white/90 leading-relaxed font-mono flex-1">
              ${this.escapeHTML(this.sessionData.tacticalNotes)}
            </p>
            <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-[#8e95a5]">
              <span>Disjuntores: 1 de 3 armados</span>
              <span class="text-[#e21b23]">Perigo: Iminente</span>
            </div>
          </div>

          <!-- Card 2: Status do Combate / Último Handout -->
          <div id="vtt-center-combat-summary" class="p-3.5 bg-[#07090e]/90 border border-white/10 flex flex-col gap-2">
            ${this.getCombatSummaryContentHTML()}
          </div>

        </div>
      </div>
    `;
  }

  getCombatSummaryContentHTML() {
    if (this.combatActive && this.initiativeList.length > 0) {
      const current = this.initiativeList[this.activeTurnIndex];
      return `
        <div class="flex items-center justify-between border-b border-[#e21b23]/30 pb-1.5">
          <span class="text-[10px] text-[#e21b23] font-bold uppercase tracking-wider flex items-center gap-1">
            <span>⚔</span> COMBATE ATIVO — RODADA 1
          </span>
          <span class="text-[9px] bg-[#e21b23]/20 text-[#e21b23] px-1 py-0.5 font-bold">EM TURNO</span>
        </div>
        <div class="flex-1 flex flex-col justify-center items-center py-2 text-center">
          <span class="text-[10px] text-[#8e95a5] uppercase">Combatente Ativo:</span>
          <span class="font-serif font-black text-lg text-white mt-0.5">${this.escapeHTML(current?.name || 'Inimigo')}</span>
          <span class="text-xs text-[#06b6d4] font-mono mt-1">Iniciativa: ${current?.initiative || 0}</span>
        </div>
      `;
    }

    const firstHandout = this.handouts[0];
    return `
      <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
        <span class="text-[10px] text-white/70 font-bold uppercase tracking-wider flex items-center gap-1">
          <span>📜</span> DOCUMENTO REVELADO RECENTE
        </span>
        <span class="text-[9px] text-[#06b6d4]">PISTA</span>
      </div>
      <div class="flex items-center gap-3 py-1 flex-1">
        <div class="w-16 h-16 bg-black border border-white/10 flex-shrink-0 overflow-hidden">
          <img src="${firstHandout?.imageUrl || 'assets/images/hero_banner.jpg'}" class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="font-serif font-bold text-white text-xs truncate">${firstHandout?.title}</span>
          <p class="text-[10px] text-[#8e95a5] line-clamp-2 mt-0.5">${firstHandout?.content}</p>
        </div>
      </div>
      <button class="vtt-btn-view-handout text-[9px] text-right text-[#06b6d4] hover:underline cursor-pointer" data-id="${firstHandout?.id}">
        [ INSPECIONAR DOCUMENTO ↗ ]
      </button>
    `;
  }

  getCinematicStageHTML() {
    const s = this.cinematicScene;
    return `
      <div class="flex-1 w-full h-full min-h-[460px] bg-black border-2 border-[#e21b23]/60 relative overflow-hidden flex flex-col justify-between p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-fadeIn">
        <!-- Imagem de Fundo em Alta Resolução -->
        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${s.url}');"></div>
        <div class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60"></div>

        <!-- Header da Cena -->
        <div class="relative z-10 flex items-center justify-between">
          <span class="px-2 py-0.5 bg-[#e21b23] text-black text-[10px] font-mono font-black tracking-widest uppercase">
            🎬 APRESENTAÇÃO DE CENA PELO MESTRE
          </span>
          ${this.isGm ? `
            <button id="vtt-btn-end-cinematic" class="px-3 py-1 bg-black/80 hover:bg-[#e21b23] border border-[#e21b23] text-white text-[10px] font-mono font-bold transition-all cursor-pointer">
              ✕ ENCERRAR APRESENTAÇÃO
            </button>
          ` : ''}
        </div>

        <!-- Conteúdo Monumental da Cena -->
        <div class="relative z-10 max-w-2xl flex flex-col gap-2">
          <h1 class="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
            ${this.escapeHTML(s.title)}
          </h1>
          <p class="text-xs sm:text-sm text-[#cbd0dc] leading-relaxed font-mono drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            ${this.escapeHTML(s.description || '')}
          </p>
        </div>
      </div>
    `;
  }

  // ============================================================
  // COLUNA DIREITA: CHAT PERSISTENTE & LOG DE ROLAGENS
  // ============================================================
  getRightSidebarHTML() {
    return `
      <!-- Header do Chat -->
      <div class="p-2.5 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div class="flex items-center gap-1.5">
          <span class="text-[#e21b23]">💬</span>
          <span class="text-xs font-bold text-white tracking-wider">REGISTRO DA SESSÃO</span>
        </div>
        <span class="text-[9px] text-[#8e95a5] font-mono">${this.chatMessages.length} eventos</span>
      </div>

      <!-- Feed de Mensagens com Rolagem -->
      <div id="vtt-chat-feed" class="flex-1 p-3 overflow-y-auto flex flex-col gap-2.5 text-xs max-h-[calc(100vh-270px)]">
        ${this.getChatMessagesHTML()}
      </div>

      <!-- Indicador de Jogador Digitando -->
      <div id="vtt-typing-indicator" class="px-3 py-0.5 text-[9px] text-[#06b6d4] italic min-h-[16px]">
        <!-- Preenchido dinamicamente -->
      </div>

      <!-- Input de Mensagem -->
      <div class="p-2 border-t border-white/10 bg-[#050505] flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-[9px] text-[#8e95a5]">
          <div class="flex items-center gap-1">
            <span>Canal:</span>
            <select id="vtt-chat-visibility" class="bg-black text-white border border-white/20 px-1 py-0.5 text-[9px] font-mono cursor-pointer">
              <option value="public">Público (Todos)</option>
              <option value="private_gm">Para o Mestre</option>
              ${this.isGm ? '<option value="gm_narrative">Narrativa do Mestre</option>' : ''}
            </select>
          </div>
          <span class="hidden sm:inline text-white/30">[Enter para enviar]</span>
        </div>

        <div class="flex items-center gap-1.5">
          <input type="text" id="vtt-chat-input" placeholder="Digite sua fala ou ação..." class="flex-1 bg-black/80 border border-white/20 focus:border-[#e21b23] px-2.5 py-1.5 text-xs text-white placeholder-white/30 outline-none font-mono" />
          <button id="vtt-btn-send-chat" class="px-3 py-1.5 bg-[#e21b23]/20 hover:bg-[#e21b23] border border-[#e21b23] text-white text-xs font-bold transition-all cursor-pointer">
            ➤
          </button>
        </div>
      </div>
    `;
  }

  getChatMessagesHTML() {
    return this.chatMessages.map(msg => {
      // 1. Mensagem de Rolagem de Dados
      if (msg.type === 'roll') {
        const is20 = msg.isCrit || (msg.rolls && msg.rolls.includes(20));
        const is1 = msg.isFumble || (msg.rolls && msg.rolls.includes(1));
        
        let borderClass = 'border-white/10';
        let glowClass = '';
        if (is20) {
          borderClass = 'border-[#06b6d4]';
          glowClass = 'shadow-[0_0_15px_rgba(6,182,212,0.3)]';
        } else if (is1) {
          borderClass = 'border-[#ff333d]';
          glowClass = 'shadow-[0_0_15px_rgba(255,51,61,0.3)]';
        }

        // Se for rolagem oculta mascarada para jogador comum
        if (msg.isMasked && !this.isGm) {
          return `
            <div class="p-2 bg-black/60 border border-white/10 flex flex-col gap-1 text-[11px]">
              <div class="flex items-center justify-between text-[9px] text-[#8e95a5]">
                <span>🎲 ${this.escapeHTML(msg.author?.name || 'Mestre')}</span>
                <span>${msg.timestamp}</span>
              </div>
              <div class="text-[#8e95a5] italic font-serif">
                O Mestre realizou uma rolagem secreta.
              </div>
            </div>
          `;
        }

        return `
          <div class="p-2 bg-[#090d14] border ${borderClass} ${glowClass} flex flex-col gap-1 text-[11px] animate-fadeIn">
            <div class="flex items-center justify-between text-[9px] text-[#8e95a5]">
              <span class="font-bold ${msg.author?.isGm ? 'text-[#e21b23]' : 'text-white'}">🎲 ${this.escapeHTML(msg.author?.name || 'Agente')}</span>
              <span>${msg.timestamp}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-white/80 font-serif">${this.escapeHTML(msg.label || 'Rolagem')}</span>
              <span class="text-[9px] text-white/40 font-mono">${msg.formula}</span>
            </div>

            <div class="flex items-baseline justify-between pt-1 border-t border-white/5">
              <div class="text-[10px] text-[#8e95a5]">
                ${msg.rolls ? msg.rolls.join(' + ') : ''} ${msg.modifier >= 0 ? '+' + msg.modifier : msg.modifier}
              </div>
              <div class="flex items-center gap-1.5">
                ${is20 ? '<span class="text-[8px] bg-[#06b6d4]/20 text-[#06b6d4] px-1 font-bold">20 NAT</span>' : ''}
                ${is1 ? '<span class="text-[8px] bg-[#ff333d]/20 text-[#ff333d] px-1 font-bold">1 NAT</span>' : ''}
                <span class="text-sm font-black ${is20 ? 'text-[#06b6d4]' : is1 ? 'text-[#ff333d]' : 'text-white'}">
                  TOTAL: ${msg.total}
                </span>
              </div>
            </div>
          </div>
        `;
      }

      // 2. Mensagem do Sistema
      if (msg.type === 'system') {
        return `
          <div class="py-1 px-2 bg-black/40 border-l-2 border-[#06b6d4] text-[10px] text-white/60 font-mono">
            ${this.escapeHTML(msg.text)}
          </div>
        `;
      }

      // 3. Mensagem Narrativa do Mestre
      if (msg.type === 'gm_narrative') {
        return `
          <div class="p-2.5 bg-[#12080a] border-l-2 border-[#e21b23] flex flex-col gap-1">
            <div class="flex items-center justify-between text-[9px]">
              <span class="text-[#e21b23] font-black tracking-wider">✠ MESTRE</span>
              <span class="text-white/30">${msg.timestamp}</span>
            </div>
            <p class="font-serif italic text-white text-xs leading-relaxed">
              ${this.escapeHTML(msg.text)}
            </p>
          </div>
        `;
      }

      // 4. Mensagem Normal de Jogador
      const isMe = msg.author?.id === this.user.id;
      return `
        <div class="flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}">
          <div class="flex items-center gap-1.5 text-[9px] text-[#8e95a5]">
            <span class="font-bold ${isMe ? 'text-[#06b6d4]' : 'text-white'}">${this.escapeHTML(msg.author?.name || 'Agente')}</span>
            <span>${msg.timestamp}</span>
          </div>
          <div class="p-2 ${isMe ? 'bg-[#0f141f] border border-[#06b6d4]/30 text-white' : 'bg-black/60 border border-white/10 text-white/90'} max-w-[85%] text-xs leading-relaxed break-words">
            ${this.escapeHTML(msg.text)}
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================================
  // DOCK INFERIOR: BARRA PERMANENTE DE POLIEDROS & AÇÕES RÁPIDAS
  // ============================================================
  getDiceDockHTML() {
    const diceTypes = [4, 6, 8, 10, 12, 20, 100];
    return `
      <!-- Seleção do Poliedro -->
      <div class="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
        <span class="text-[9px] text-[#8e95a5] font-bold uppercase mr-1 hidden sm:inline">DADOS:</span>
        ${diceTypes.map(d => `
          <button class="vtt-btn-dice-type px-2.5 py-1 ${this.selectedDiceType === d ? 'bg-[#e21b23] text-black font-black' : 'bg-black/60 text-white/80 hover:text-white border border-white/10 hover:border-white/30'} text-xs font-mono transition-all cursor-pointer" data-sides="${d}">
            d${d}
          </button>
        `).join('')}
      </div>

      <!-- Controles de Quantidade & Modificador -->
      <div class="flex items-center gap-3">
        <!-- Quantidade -->
        <div class="flex items-center gap-1 bg-black/60 border border-white/10 px-1.5 py-0.5">
          <span class="text-[9px] text-white/40 uppercase">Qtd:</span>
          <button id="vtt-btn-qty-dec" class="px-1 text-xs text-[#8e95a5] hover:text-white cursor-pointer">-</button>
          <span id="vtt-dice-qty" class="text-xs font-bold text-white px-1">${this.diceQuantity}</span>
          <button id="vtt-btn-qty-inc" class="px-1 text-xs text-[#8e95a5] hover:text-white cursor-pointer">+</button>
        </div>

        <!-- Modificador -->
        <div class="flex items-center gap-1 bg-black/60 border border-white/10 px-1.5 py-0.5">
          <span class="text-[9px] text-white/40 uppercase">Mod:</span>
          <button id="vtt-btn-mod-dec" class="px-1 text-xs text-[#8e95a5] hover:text-white cursor-pointer">-</button>
          <span id="vtt-dice-mod" class="text-xs font-bold text-white px-1">${this.diceModifier >= 0 ? '+' + this.diceModifier : this.diceModifier}</span>
          <button id="vtt-btn-mod-inc" class="px-1 text-xs text-[#8e95a5] hover:text-white cursor-pointer">+</button>
        </div>

        <!-- Visibilidade da Rolagem -->
        <div class="hidden sm:flex items-center gap-1">
          <select id="vtt-roll-visibility-select" class="bg-black text-white border border-white/20 px-1.5 py-1 text-[10px] font-mono cursor-pointer">
            <option value="public" ${this.diceRollVisibility === 'public' ? 'selected' : ''}>Pública</option>
            <option value="private_gm" ${this.diceRollVisibility === 'private_gm' ? 'selected' : ''}>Privada (GM)</option>
            ${this.isGm ? `<option value="blind" ${this.diceRollVisibility === 'blind' ? 'selected' : ''}>Oculta (Secreta)</option>` : ''}
          </select>
        </div>

        <!-- Botão ROLAR DADO -->
        <button id="vtt-btn-roll-main" class="px-4 py-1.5 bg-[#e21b23] hover:bg-[#ff333d] text-black font-black text-xs tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(226,27,35,0.4)] cursor-pointer">
          <span>🎲</span>
          <span>ROLAR ${this.diceQuantity}d${this.selectedDiceType}${this.diceModifier ? (this.diceModifier >= 0 ? '+' + this.diceModifier : this.diceModifier) : ''}</span>
        </button>
      </div>
    `;
  }

  // ============================================================
  // NAVEGAÇÃO MOBILE INFERIOR
  // ============================================================
  getMobileNavHTML() {
    return `
      <button class="vtt-mobile-tab-btn flex flex-col items-center gap-0.5 py-1 px-2 ${this.activeMobileTab === 'mesa' ? 'text-[#e21b23] font-bold' : 'text-[#8e95a5]'}" data-tab="mesa">
        <span>🏛</span>
        <span>Mesa</span>
      </button>
      <button class="vtt-mobile-tab-btn flex flex-col items-center gap-0.5 py-1 px-2 ${this.activeMobileTab === 'chat' ? 'text-[#e21b23] font-bold' : 'text-[#8e95a5]'}" data-tab="chat">
        <span>💬</span>
        <span>Chat</span>
      </button>
      <button class="vtt-mobile-tab-btn flex flex-col items-center gap-0.5 py-1 px-2 ${this.activeMobileTab === 'agente' ? 'text-[#e21b23] font-bold' : 'text-[#8e95a5]'}" data-tab="agente">
        <span>👤</span>
        <span>Dossiê</span>
      </button>
      ${this.isGm ? `
        <button class="vtt-mobile-tab-btn flex flex-col items-center gap-0.5 py-1 px-2 ${this.activeMobileTab === 'mestre' ? 'text-[#06b6d4] font-bold' : 'text-[#06b6d4]/60'}" data-tab="mestre">
          <span>✠</span>
          <span>Mestre</span>
        </button>
      ` : ''}
    `;
  }

  // ============================================================
  // EVENT LISTENERS & AÇÕES TÁTEIS
  // ============================================================
  setupEventListeners() {
    const root = this.container;
    if (!root) return;

    // 1. Alternância de Abas da Coluna Esquerda
    root.querySelectorAll('.vtt-left-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeLeftTab = btn.dataset.tab;
        soundFX.playRuneClick();
        this.renderLeftSidebarOnly();
      });
    });

    // 2. Navegação Mobile por Abas
    root.querySelectorAll('.vtt-mobile-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeMobileTab = btn.dataset.tab;
        if (this.activeMobileTab === 'agente') {
          this.activeLeftTab = 'agente';
        } else if (this.activeMobileTab === 'mestre') {
          this.activeLeftTab = 'mestre';
        }
        soundFX.playRuneClick();
        this.render();
      });
    });

    // 3. Botão de Tela Cheia
    const fsBtn = root.querySelector('#vtt-btn-fullscreen');
    fsBtn?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
      soundFX.playRuneClick();
    });

    // 4. Botão Sair da Mesa
    const exitBtn = root.querySelector('#vtt-btn-exit');
    exitBtn?.addEventListener('click', () => {
      soundFX.playRuneClick();
      if (this.sync) {
        this.sync.disconnect();
      }
      window.location.hash = 'home';
    });

    // 5. Chat Input & Envio
    const chatInput = root.querySelector('#vtt-chat-input');
    const chatSendBtn = root.querySelector('#vtt-btn-send-chat');
    const visibilitySelect = root.querySelector('#vtt-chat-visibility');

    const handleSend = () => {
      const text = chatInput?.value?.trim();
      if (!text) return;
      const vis = visibilitySelect?.value || 'public';
      const msgType = vis === 'gm_narrative' ? 'gm_narrative' : 'normal';

      if (this.sync) {
        this.sync.sendChatMessage(text, msgType, vis);
      }
      chatInput.value = '';
      if (this.sync) this.sync.sendTypingIndicator(false);
    };

    chatSendBtn?.addEventListener('click', handleSend);
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      } else {
        if (this.sync) {
          this.sync.sendTypingIndicator(true);
          clearTimeout(this.typingTimeout);
          this.typingTimeout = setTimeout(() => {
            this.sync.sendTypingIndicator(false);
          }, 2500);
        }
      }
    });

    // 6. Dock de Dados: Seleção de Tipo
    root.querySelectorAll('.vtt-btn-dice-type').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedDiceType = parseInt(btn.dataset.sides, 10);
        soundFX.playRuneClick();
        this.renderDiceDockOnly();
      });
    });

    // 7. Dock de Dados: Quantidade e Modificador
    root.querySelector('#vtt-btn-qty-dec')?.addEventListener('click', () => {
      if (this.diceQuantity > 1) {
        this.diceQuantity--;
        this.renderDiceDockOnly();
      }
    });
    root.querySelector('#vtt-btn-qty-inc')?.addEventListener('click', () => {
      if (this.diceQuantity < 10) {
        this.diceQuantity++;
        this.renderDiceDockOnly();
      }
    });
    root.querySelector('#vtt-btn-mod-dec')?.addEventListener('click', () => {
      this.diceModifier--;
      this.renderDiceDockOnly();
    });
    root.querySelector('#vtt-btn-mod-inc')?.addEventListener('click', () => {
      this.diceModifier++;
      this.renderDiceDockOnly();
    });

    // 8. Botão Principal ROLAR DADO
    root.querySelector('#vtt-btn-roll-main')?.addEventListener('click', () => {
      this.executeDockRoll();
    });

    // 9. Dossiê Rápido: Teste de 1-Clique de Perícia
    root.querySelectorAll('.vtt-btn-quick-skill').forEach(btn => {
      btn.addEventListener('click', () => {
        const skillName = btn.dataset.name;
        const mod = parseInt(btn.dataset.mod || '0', 10);
        this.executeQuickSkillRoll(skillName, mod);
      });
    });

    // 10. Dossiê Rápido: Teste de 1-Clique de Atributo
    root.querySelectorAll('.vtt-btn-quick-attr').forEach(btn => {
      btn.addEventListener('click', () => {
        const attrName = btn.dataset.attr.toUpperCase();
        const val = parseInt(btn.dataset.val || '0', 10);
        this.executeQuickSkillRoll('Atributo ' + attrName, val);
      });
    });

    // 11. Controles de Iniciativa do Mestre
    root.querySelector('#vtt-btn-prev-turn')?.addEventListener('click', () => {
      if (this.activeTurnIndex > 0) {
        this.activeTurnIndex--;
      } else {
        this.activeTurnIndex = this.initiativeList.length - 1;
      }
      this.syncInitiative();
    });

    root.querySelector('#vtt-btn-next-turn')?.addEventListener('click', () => {
      if (this.activeTurnIndex < this.initiativeList.length - 1) {
        this.activeTurnIndex++;
      } else {
        this.activeTurnIndex = 0;
      }
      this.syncInitiative();
    });

    root.querySelector('#vtt-btn-toggle-combat')?.addEventListener('click', () => {
      this.combatActive = !this.combatActive;
      this.syncInitiative();
      if (this.sync) {
        this.sync.sendSystemEvent(this.combatActive ? 'O Mestre iniciou um combate!' : 'O Mestre encerrou o combate.');
      }
    });

    root.querySelector('#vtt-btn-clear-initiative')?.addEventListener('click', () => {
      this.initiativeList = [];
      this.activeTurnIndex = 0;
      this.combatActive = false;
      this.syncInitiative();
    });

    // 12. Abrir Pistas / Handouts
    root.querySelectorAll('.vtt-btn-view-handout').forEach(btn => {
      btn.addEventListener('click', () => {
        const hId = btn.dataset.id;
        const handout = this.handouts.find(h => h.id === hId);
        if (handout) this.openHandoutModal(handout);
      });
    });

    // 13. Mestre Revelar Handout à Mesa
    root.querySelectorAll('.vtt-btn-reveal-handout').forEach(btn => {
      btn.addEventListener('click', () => {
        const hId = btn.dataset.id;
        const handout = this.handouts.find(h => h.id === hId);
        if (handout && this.sync) {
          this.sync.sendHandout(handout, 'show');
          this.sync.sendSystemEvent(`O Mestre revelou o documento: "${handout.title}"`);
        }
      });
    });

    // 14. Ações Exclusivas do Mestre (Tab Mestre)
    root.querySelector('#vtt-btn-gm-scene')?.addEventListener('click', () => {
      this.promptGmScene();
    });

    root.querySelector('#vtt-btn-gm-secret-roll')?.addEventListener('click', () => {
      this.executeGmSecretRoll();
    });

    root.querySelector('#vtt-btn-gm-pause')?.addEventListener('click', () => {
      this.sessionData.status = this.sessionData.status === 'paused' ? 'active' : 'paused';
      if (this.sync) {
        this.sync.sendSessionState({ status: this.sessionData.status });
        this.sync.sendSystemEvent(this.sessionData.status === 'paused' ? 'Sessão pausada pelo Mestre.' : 'Sessão retomada pelo Mestre.');
      }
      this.render();
    });

    root.querySelector('#vtt-btn-gm-sys-msg')?.addEventListener('click', () => {
      const msg = prompt('Digite o aviso global do sistema para todos os jogadores:');
      if (msg && msg.trim() && this.sync) {
        this.sync.sendSystemEvent(msg.trim());
      }
    });

    root.querySelector('#vtt-btn-gm-notes')?.addEventListener('click', () => {
      const notes = prompt('Atualizar Objetivo Tático da Missão:', this.sessionData.tacticalNotes);
      if (notes !== null && this.sync) {
        this.sessionData.tacticalNotes = notes.trim();
        this.sync.sendSessionState({ tacticalNotes: this.sessionData.tacticalNotes });
        this.renderCenterStageOnly();
      }
    });

    root.querySelector('#vtt-btn-end-cinematic')?.addEventListener('click', () => {
      this.cinematicScene = null;
      if (this.sync) {
        this.sync.sendScenePresentation(null, false);
      }
      this.renderCenterStageOnly();
    });
  }

  // ============================================================
  // EXECUÇÃO DE ROLAGENS COM MOTOR 3D (THREE.JS + CANNON.JS)
  // ============================================================

  executeDockRoll() {
    const sides = this.selectedDiceType;
    const qty = this.diceQuantity;
    const mod = this.diceModifier;
    const vis = this.diceRollVisibility;
    const label = `Rolagem ${qty}d${sides}`;

    soundFX.playDiceRoll();

    // Rola usando o motor 3D DiceAnimator
    DiceAnimator.roll({
      sides: sides === 100 ? 10 : sides,
      label: label
    }).then(({ rolledValue, isCrit, isFumble }) => {
      // Simula dados adicionais se qty > 1
      let rolls = [rolledValue];
      for (let i = 1; i < qty; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }

      const sumRolls = rolls.reduce((a, b) => a + b, 0);
      const total = sumRolls + mod;

      const rollPayload = {
        label,
        formula: `${qty}d${sides}${mod ? (mod >= 0 ? '+' + mod : mod) : ''}`,
        rolls,
        modifier: mod,
        total,
        isCrit: Boolean(isCrit || (sides === 20 && rolls.includes(20))),
        isFumble: Boolean(isFumble || (sides === 20 && rolls.includes(1))),
        visibility: vis
      };

      if (this.sync) {
        this.sync.sendDiceRoll(rollPayload);
      }
    });
  }

  executeQuickSkillRoll(skillName, bonus = 0) {
    soundFX.playDiceRoll();

    DiceAnimator.roll({
      sides: 20,
      label: `Teste de ${skillName}`
    }).then(({ rolledValue, isCrit, isFumble }) => {
      const total = rolledValue + bonus;
      const rollPayload = {
        label: `Teste de ${skillName}`,
        formula: `1d20${bonus ? (bonus >= 0 ? '+' + bonus : bonus) : ''}`,
        rolls: [rolledValue],
        modifier: bonus,
        total,
        isCrit: Boolean(isCrit || rolledValue === 20),
        isFumble: Boolean(isFumble || rolledValue === 1),
        visibility: 'public'
      };

      if (this.sync) {
        this.sync.sendDiceRoll(rollPayload);
      }
    });
  }

  executeGmSecretRoll() {
    soundFX.playDiceRoll();

    DiceAnimator.roll({
      sides: 20,
      label: 'Rolagem Secreta do Mestre'
    }).then(({ rolledValue }) => {
      const rollPayload = {
        label: 'Rolagem Secreta do Mestre',
        formula: '1d20',
        rolls: [rolledValue],
        modifier: 0,
        total: rolledValue,
        isCrit: rolledValue === 20,
        isFumble: rolledValue === 1,
        visibility: 'blind'
      };

      if (this.sync) {
        this.sync.sendDiceRoll(rollPayload);
      }
    });
  }

  promptGmScene() {
    const title = prompt('Título da Cena:', 'O Altar de Sacrifício Desperto');
    if (!title) return;
    const url = prompt('Caminho ou URL da Imagem da Cena:', 'assets/images/hero_banner.jpg') || 'assets/images/hero_banner.jpg';
    const desc = prompt('Descrição atmosférica da cena:', 'Chamas carmesins sobem pelas frestas de pedra. O som de respiração colossal ecoa no túnel.') || '';

    this.cinematicScene = { title, url, description: desc };
    if (this.sync) {
      this.sync.sendScenePresentation(this.cinematicScene, true);
    }
    this.renderCenterStageOnly();
  }

  syncInitiative() {
    if (this.sync) {
      this.sync.sendInitiativeUpdate(this.initiativeList, this.activeTurnIndex, this.combatActive);
    }
    this.renderInitiativeListOnly();
    this.renderCenterCombatSummary();
  }

  // ============================================================
  // MODAIS E HELPERS DE ATUALIZAÇÃO PARCIAL (SEM RECARREGAR)
  // ============================================================
  openHandoutModal(handout) {
    const modalContainer = this.container.querySelector('#vtt-handout-modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="relative w-full max-w-2xl bg-[#07090e] border-2 border-[#e21b23] p-5 flex flex-col gap-4 text-white shadow-[0_0_50px_rgba(226,27,35,0.4)] animate-fadeIn">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-[#e21b23]">📜</span>
            <span class="font-serif font-black text-base uppercase">${this.escapeHTML(handout.title)}</span>
          </div>
          <button id="vtt-btn-close-handout" class="text-[#8e95a5] hover:text-white font-mono text-sm px-2 cursor-pointer">
            [ FECHAR × ]
          </button>
        </div>

        ${handout.imageUrl ? `
          <div class="w-full max-h-72 bg-black border border-white/10 overflow-hidden flex items-center justify-center">
            <img src="${handout.imageUrl}" class="w-full h-full object-contain" />
          </div>
        ` : ''}

        <p class="text-xs text-[#cbd0dc] leading-relaxed font-mono whitespace-pre-wrap">
          ${this.escapeHTML(handout.content)}
        </p>

        <div class="pt-2 border-t border-white/10 flex justify-end">
          <button id="vtt-btn-modal-dismiss" class="px-4 py-1.5 bg-[#e21b23] hover:bg-[#ff333d] text-black font-mono font-bold text-xs cursor-pointer">
            CIENTE
          </button>
        </div>
      </div>
    `;

    modalContainer.classList.remove('hidden');

    const closeHandler = () => {
      modalContainer.classList.add('hidden');
    };
    modalContainer.querySelector('#vtt-btn-close-handout')?.addEventListener('click', closeHandler);
    modalContainer.querySelector('#vtt-btn-modal-dismiss')?.addEventListener('click', closeHandler);
  }

  closeHandoutModal() {
    const modalContainer = this.container.querySelector('#vtt-handout-modal-container');
    if (modalContainer) modalContainer.classList.add('hidden');
  }

  scrollChatToBottom() {
    const feed = this.container.querySelector('#vtt-chat-feed');
    if (feed) {
      feed.scrollTop = feed.scrollHeight;
    }
  }

  renderChatFeedOnly() {
    const feed = this.container.querySelector('#vtt-chat-feed');
    if (feed) {
      feed.innerHTML = this.getChatMessagesHTML();
    }
  }

  renderInitiativeListOnly() {
    const leftContent = this.container.querySelector('#vtt-left-content');
    if (leftContent && this.activeLeftTab === 'iniciativa') {
      leftContent.innerHTML = this.getInitiativeHTML();
      this.setupEventListeners();
    }
  }

  renderCenterCombatSummary() {
    const box = this.container.querySelector('#vtt-center-combat-summary');
    if (box) {
      box.innerHTML = this.getCombatSummaryContentHTML();
      this.setupEventListeners();
    }
  }

  renderCenterStageOnly() {
    const center = this.container.querySelector('#vtt-center-stage');
    if (center) {
      center.innerHTML = this.getCenterStageHTML();
      this.setupEventListeners();
    }
  }

  renderLeftSidebarOnly() {
    const left = this.container.querySelector('#vtt-left-sidebar');
    if (left) {
      left.innerHTML = this.getLeftSidebarHTML();
      this.setupEventListeners();
    }
  }

  renderDiceDockOnly() {
    const dock = this.container.querySelector('#vtt-dice-dock');
    if (dock) {
      dock.innerHTML = this.getDiceDockHTML();
      this.setupEventListeners();
    }
  }

  renderHeaderOnly() {
    const header = this.container.querySelector('#vtt-header');
    if (header) {
      header.innerHTML = this.getHeaderHTML();
      this.setupEventListeners();
    }
  }

  renderParticipantsListOnly(participants) {
    const list = this.container.querySelector('#vtt-participants-list');
    if (list && participants && participants.length > 0) {
      list.innerHTML = participants.map(p => `
        <div class="p-2 bg-black/40 border border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-2 h-2 rounded-full ${p.status === 'online' ? 'bg-emerald-400' : p.status === 'away' ? 'bg-amber-400' : 'bg-zinc-600'}"></span>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-white text-xs truncate">${this.escapeHTML(p.user?.name || 'Agente')}</span>
              <span class="text-[9px] text-[#8e95a5] truncate">${this.escapeHTML(p.character?.name || '')} // ${p.character?.concept || ''}</span>
            </div>
          </div>
          ${p.isGm ? '<span class="text-[9px] text-[#e21b23] font-bold">✠ GM</span>' : ''}
        </div>
      `).join('');
    }
  }

  updateTypingIndicator() {
    const el = this.container.querySelector('#vtt-typing-indicator');
    if (!el) return;
    if (this.typingUsers.size === 0) {
      el.textContent = '';
    } else {
      const names = Array.from(this.typingUsers.values()).join(', ');
      el.textContent = `● ${names} está digitando...`;
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
