/**
 * PAROXISMO — SESSÃO / MESA VIRTUAL (VTT)
 * Interface em tempo real para condução e participação de sessões de RPG.
 * Gothic Dark Fantasy / Terminal CAD Militar do Avesso.
 * 
 * - Palco da Sessão dinâmico com informações reais
 * - Chat & Log de Rolagens persistente com destaque de 20 e 1 natural
 * - Barra Permanente de Dados (D4, D6, D8, D10, D12, D20, D100) com física 3D
 * - Dossiê Completo do Agente: Armas (Ataque/Dano 1-clique), Rituais (Conjuração 1-clique),
 *   Proteção, PV/PE interativos e Ficha Completa em Popup Modal (Estilo Foundry VTT)
 * - Identificação do Mestre por Senha / Chave de Acesso
 * - Iniciar Combate com rolagem automática de iniciativas de jogadores e monstros
 * - Tracker de Iniciativa com controle de turnos para o Mestre
 * - Responsividade completa para Desktop, Tablet e Mobile
 */

import { soundFX } from '../utils/sound-fx.js?v=sound_v2';
import { DiceAnimator } from '../utils/dice-animator.js?v=phys_v12';
import { getCharacterDossier, saveCharacterDossier } from '../utils/character-storage.js?v=char_v1';
import { SessionSync } from '../utils/session-sync.js?v=sess_v2';
import { CharacterSheet } from './character-sheet.js?v=release_v11';
import { RULES_DATA } from '../data/rules.js';

export class SessionViewer {
  constructor(containerId, app) {
    this.container = document.getElementById(containerId);
    this.app = app;
    this.sync = null;
    
    // Identificação do Usuário e Personagem
    this.isGm = Boolean(app?.gmModeActive);
    this.user = this.resolveCurrentUser();
    this.character = getCharacterDossier();
    
    // Estado da Sessão (Persistido no localStorage / Sincronizado)
    this.sessionId = localStorage.getItem('paroxismo_active_session_id') || 'mesa_principal';
    this.sessionData = {
      campaignName: localStorage.getItem('paroxismo_campaign_name') || 'Campanha Paroxismo',
      sessionNumber: parseInt(localStorage.getItem('paroxismo_session_num') || '1', 10),
      status: localStorage.getItem('paroxismo_session_status') || 'active', // 'active', 'paused', 'concluded'
      tacticalNotes: localStorage.getItem('paroxismo_tactical_notes') || '',
      currentDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    // Estado da Iniciativa (Dinâmico - sem mockados falsos)
    this.initiativeList = this.loadInitialInitiative();
    this.activeTurnIndex = 0;
    this.combatActive = Boolean(localStorage.getItem('paroxismo_combat_active') === 'true');

    // Estado do Palco Central & Modo Cinemático
    this.cinematicScene = null; // { title, url, description }

    // Estado de Handouts (Dinâmico)
    this.handouts = this.loadInitialHandouts();
    this.activeHandoutModal = null;

    // Estado do Chat & Dice Log (Histórico persistido real)
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

    // Combat Setup Modal Data
    this.pendingEnemies = [];

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
    try {
      const raw = localStorage.getItem('paroxismo_initiative_list_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  loadInitialHandouts() {
    try {
      const raw = localStorage.getItem('paroxismo_campaign_handouts_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  loadInitialMessages() {
    try {
      const raw = localStorage.getItem('paroxismo_mesa_messages_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'msg_sys_start',
        type: 'system',
        text: 'Sessão iniciada. Conexão com o canal da Mesa estabelecida.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  }

  saveMessages() {
    try {
      // Guarda até as 80 mensagens mais recentes
      const toSave = this.chatMessages.slice(-80);
      localStorage.setItem('paroxismo_mesa_messages_v1', JSON.stringify(toSave));
    } catch (e) {}
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
      this.saveMessages();
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
      this.saveMessages();
      this.renderChatFeedOnly();
      this.scrollChatToBottom();
    });

    // Escuta atualizações de iniciativa
    this.sync.on('initiative', (data) => {
      if (data.list) {
        this.initiativeList = data.list;
        localStorage.setItem('paroxismo_initiative_list_v1', JSON.stringify(this.initiativeList));
      }
      if (typeof data.activeIndex === 'number') this.activeTurnIndex = data.activeIndex;
      if (typeof data.combatActive === 'boolean') {
        this.combatActive = data.combatActive;
        localStorage.setItem('paroxismo_combat_active', data.combatActive ? 'true' : 'false');
      }
      this.renderInitiativeListOnly();
      this.renderCenterCombatSummary();
    });

    // Escuta handouts compartilhados
    this.sync.on('handout', (data) => {
      if (data.action === 'show' && data.handout) {
        // Se ainda não estava no acervo, adiciona
        if (!this.handouts.find(h => h.id === data.handout.id)) {
          this.handouts.push(data.handout);
          localStorage.setItem('paroxismo_campaign_handouts_v1', JSON.stringify(this.handouts));
          this.renderLeftSidebarOnly();
        }
        this.openHandoutModal(data.handout);
        this.renderCenterHandoutSummary();
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
      this.saveMessages();
      this.renderChatFeedOnly();
      this.scrollChatToBottom();
    });

    // Escuta estado da sessão (Pausar/Ativar/Campanha)
    this.sync.on('state', (state) => {
      if (state.status) {
        this.sessionData.status = state.status;
        localStorage.setItem('paroxismo_session_status', state.status);
      }
      if (typeof state.tacticalNotes === 'string') {
        this.sessionData.tacticalNotes = state.tacticalNotes;
        localStorage.setItem('paroxismo_tactical_notes', state.tacticalNotes);
      }
      if (state.campaignName) {
        this.sessionData.campaignName = state.campaignName;
        localStorage.setItem('paroxismo_campaign_name', state.campaignName);
      }
      if (state.sessionNumber) {
        this.sessionData.sessionNumber = state.sessionNumber;
        localStorage.setItem('paroxismo_session_num', String(state.sessionNumber));
      }
      this.renderHeaderOnly();
      this.renderCenterStageOnly();
    });

    // Escuta presença de participantes
    this.sync.on('presence', (participants) => {
      this.renderParticipantsListOnly(participants);
      this.renderCenterParticipantsSummary(participants);
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
        <!-- 5. CONTAINER PARA MODAIS (HANDOUT, COMBATE, SENHA MESTRE, FICHA) -->
        <!-- ============================================================ -->
        <div id="vtt-handout-modal-container" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"></div>
        <div id="vtt-gm-auth-modal-container" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"></div>
        <div id="vtt-combat-modal-container" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"></div>
        
        <!-- MODAL DA FICHA DE PERSONAGEM COMPLETA (POPUP FOUNDRY STYLE) -->
        <div id="vtt-sheet-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md">
          <div class="relative w-full max-w-5xl max-h-[92vh] bg-[#07090e] border-2 border-[#06b6d4] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
            <div class="p-3 bg-black/90 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-[#06b6d4]">👤</span>
                <span class="font-serif font-black text-sm uppercase text-white tracking-wider">DOSSIÊ DO AGENTE // FICHA COMPLETA</span>
              </div>
              <button id="vtt-btn-close-sheet-modal" class="px-3 py-1 bg-white/10 hover:bg-[#ff333d] border border-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer">
                ✕ FECHAR FICHA
              </button>
            </div>
            <div id="vtt-sheet-modal-content" class="flex-1 overflow-y-auto p-2 sm:p-4"></div>
          </div>
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

        <!-- Identificação / Login de Mestre com Senha -->
        ${this.isGm ? `
          <div class="flex items-center gap-1">
            <span class="px-2 py-0.5 bg-[#e21b23]/20 border border-[#e21b23] text-[#e21b23] text-[10px] font-bold tracking-wider">✠ MESTRE</span>
            <button id="vtt-btn-toggle-gm-mode" class="text-[9px] text-white/40 hover:text-white px-1" title="Sair do modo Mestre">[ Sair ]</button>
          </div>
        ` : `
          <button id="vtt-btn-toggle-gm-mode" class="px-2 py-0.5 bg-black/60 hover:bg-[#e21b23]/20 border border-white/20 hover:border-[#e21b23] text-[10px] text-[#cbd0dc] hover:text-[#e21b23] font-mono flex items-center gap-1 transition-all cursor-pointer" title="Digitar senha para virar Mestre">
            <span>⚿</span>
            <span class="hidden sm:inline">VIRAR MESTRE</span>
          </button>
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
    const hasCombatants = this.initiativeList.length > 0;

    return `
      <div class="flex flex-col gap-3 h-full">
        <!-- Header da Iniciativa -->
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-[#e21b23] font-black text-xs">⚔ COMBATE</span>
            <span class="text-[9px] text-[#8e95a5]">(${this.initiativeList.length} combatentes)</span>
          </div>
          ${this.isGm ? `
            <button id="vtt-btn-toggle-combat" class="px-2.5 py-1 text-[9px] font-bold ${this.combatActive ? 'bg-[#ff333d]/20 text-[#ff333d] border border-[#ff333d]' : 'bg-[#e21b23] text-black'} transition-all cursor-pointer">
              ${this.combatActive ? 'ENCERRAR COMBATE' : '⚔ INICIAR COMBATE'}
            </button>
          ` : `
            <span class="text-[9px] ${this.combatActive ? 'text-emerald-400 font-bold' : 'text-white/40'}">
              ${this.combatActive ? 'EM ANDAMENTO' : 'FORA DE COMBATE'}
            </span>
          `}
        </div>

        ${!hasCombatants ? `
          <div class="flex-1 flex flex-col items-center justify-center p-4 text-center text-white/40 gap-2 border border-dashed border-white/10">
            <span class="text-xl">⚔</span>
            <span class="text-xs">Nenhum combatente na iniciativa.</span>
            ${this.isGm ? `
              <button id="vtt-btn-init-combat-empty" class="mt-2 px-3 py-1.5 bg-[#e21b23] hover:bg-[#ff333d] text-black text-xs font-bold font-mono transition-all cursor-pointer">
                + INICIAR COMBATE & ROLAR INICIATIVAS
              </button>
            ` : `
              <span class="text-[10px]">Aguardando o Mestre iniciar um combate.</span>
            `}
          </div>
        ` : `
          <!-- Turno Atual em Destaque -->
          ${activeActor ? `
            <div class="p-2.5 bg-[#0e121a] border-l-4 border-[#06b6d4] flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[9px] text-[#06b6d4] font-bold tracking-widest uppercase">▶ TURNO ATUAL</span>
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
                      <button class="vtt-btn-remove-actor text-white/30 hover:text-[#ff333d] px-1 cursor-pointer" data-id="${actor.id}" title="Remover da Iniciativa">×</button>
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
                + COMBATENTE
              </button>
              <button id="vtt-btn-clear-initiative" class="py-1 px-2 bg-black/60 hover:bg-[#ff333d]/20 border border-white/20 hover:border-[#ff333d] text-[9px] text-[#ff333d] cursor-pointer" title="Zerar lista de iniciativa">
                LIMPAR
              </button>
            </div>
          ` : ''}
        `}
      </div>
    `;
  }

  // ------------------------------------------------------------
  // TAB 2: DOSSIÊ DO AGENTE (ARMAS, RITUAIS, ITENS, 1-CLIQUE E POPUP FOUNDRY)
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

    const weapons = Array.isArray(c.customWeapons) ? c.customWeapons : [];
    const rituals = Array.isArray(c.customRituals) ? c.customRituals : [];

    // Defesa Passiva
    const defBonus = c.protectionId === 'colete' ? 2 : (c.protectionId === 'pesada' ? 4 : 1);
    const passiveDef = 10 + (attrs.agi || 0) + defBonus;

    return `
      <div class="flex flex-col gap-3">
        <!-- Cabeçalho do Personagem + Botão Foundry Style Popup -->
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex flex-col min-w-0">
            <span class="font-serif font-bold text-white text-sm truncate">${this.escapeHTML(c.name || 'Agente')}</span>
            <span class="text-[10px] text-[#8e95a5] capitalize">${c.concept || 'Sobrevivente'} // Nv ${c.level || 1}</span>
          </div>
          <button id="vtt-btn-open-foundry-sheet" class="px-2 py-1 bg-[#06b6d4]/10 hover:bg-[#06b6d4] border border-[#06b6d4]/50 hover:border-[#06b6d4] text-[#06b6d4] hover:text-black text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer" title="Abrir ficha completa em janela popup">
            <span>👁</span>
            <span>VER FICHA</span>
          </button>
        </div>

        <!-- PV e PE Interativos (Com Botões - e +) -->
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2 bg-black/60 border border-[#e21b23]/40 flex flex-col gap-1">
            <div class="flex justify-between items-center text-[9px] text-[#e21b23] font-bold">
              <span>VIDA (PV)</span>
              <span>${c.currentPv || 20}/20</span>
            </div>
            <div class="w-full h-1.5 bg-black/80 overflow-hidden">
              <div class="h-full bg-[#e21b23]" style="width: ${Math.min(100, Math.round(((c.currentPv || 20) / 20) * 100))}%;"></div>
            </div>
            <div class="flex items-center justify-end gap-1 pt-1">
              <button class="vtt-btn-adjust-stat px-1.5 py-0.2 bg-black border border-white/20 hover:border-[#e21b23] text-xs text-white cursor-pointer" data-stat="pv" data-delta="-1">-1</button>
              <button class="vtt-btn-adjust-stat px-1.5 py-0.2 bg-black border border-white/20 hover:border-[#e21b23] text-xs text-white cursor-pointer" data-stat="pv" data-delta="1">+1</button>
            </div>
          </div>

          <div class="p-2 bg-black/60 border border-[#06b6d4]/40 flex flex-col gap-1">
            <div class="flex justify-between items-center text-[9px] text-[#06b6d4] font-bold">
              <span>ESFORÇO (PE)</span>
              <span>${c.currentPe || 3}/3</span>
            </div>
            <div class="w-full h-1.5 bg-black/80 overflow-hidden">
              <div class="h-full bg-[#06b6d4]" style="width: ${Math.min(100, Math.round(((c.currentPe || 3) / 3) * 100))}%;"></div>
            </div>
            <div class="flex items-center justify-end gap-1 pt-1">
              <button class="vtt-btn-adjust-stat px-1.5 py-0.2 bg-black border border-white/20 hover:border-[#06b6d4] text-xs text-white cursor-pointer" data-stat="pe" data-delta="-1">-1</button>
              <button class="vtt-btn-adjust-stat px-1.5 py-0.2 bg-black border border-white/20 hover:border-[#06b6d4] text-xs text-white cursor-pointer" data-stat="pe" data-delta="1">+1</button>
            </div>
          </div>
        </div>

        <!-- Defesa & Proteção -->
        <div class="px-2.5 py-1.5 bg-black/40 border border-white/10 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="text-[#8e95a5]">🛡 Defesa Passiva:</span>
            <span class="font-bold text-[#06b6d4] text-sm">${passiveDef}</span>
          </div>
          <span class="text-[9px] text-[#8e95a5] capitalize">${this.escapeHTML(c.protectionId || 'Jaqueta')}</span>
        </div>

        <!-- ARMAS EQUIPADAS (ATAQUE & DANO DE 1-CLIQUE) -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[9px] text-[#8e95a5] font-bold uppercase tracking-wider">ARMAS EQUIPADAS</span>
          ${weapons.length === 0 ? `
            <span class="text-[10px] text-white/40 italic">Nenhuma arma equipada no momento.</span>
          ` : `
            <div class="flex flex-col gap-1">
              ${weapons.map(w => {
                const isRanged = (w.range && w.range !== 'Curto') || w.type === 'Fogo';
                const hitAttr = isRanged ? 'agi' : 'for';
                const hitMod = (attrs[hitAttr] || 0) + (c.trainedSkills?.includes(isRanged ? 'pontaria' : 'luta') ? 2 : 0);
                return `
                  <div class="p-2 bg-black/50 border border-white/10 flex flex-col gap-1.5">
                    <div class="flex items-center justify-between">
                      <span class="font-serif font-bold text-white text-xs truncate">${this.escapeHTML(w.name)}</span>
                      <span class="text-[9px] text-[#06b6d4] font-mono">${w.dmgDice || '1d8'} (${w.crit || '19/x2'})</span>
                    </div>
                    <div class="grid grid-cols-2 gap-1.5">
                      <button class="vtt-btn-weapon-attack py-1 bg-black/80 hover:bg-[#e21b23]/20 border border-white/20 hover:border-[#e21b23] text-[9px] font-bold text-white transition-all cursor-pointer" data-name="${w.name}" data-mod="${hitMod}">
                        🎲 ATACAR (+${hitMod})
                      </button>
                      <button class="vtt-btn-weapon-damage py-1 bg-black/80 hover:bg-[#06b6d4]/20 border border-white/20 hover:border-[#06b6d4] text-[9px] font-bold text-[#06b6d4] transition-all cursor-pointer" data-name="${w.name}" data-dmg="${w.dmgDice || '1d8'}">
                        ⚔ DANO (${w.dmgDice || '1d8'})
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- RITUAIS APRENDIDOS (1-CLIQUE PARA CONJURAÇÃO) -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[9px] text-[#8e95a5] font-bold uppercase tracking-wider">RITUAIS VINCULADOS</span>
          ${rituals.length === 0 ? `
            <span class="text-[10px] text-white/40 italic">Nenhum ritual gravado na ficha.</span>
          ` : `
            <div class="flex flex-col gap-1">
              ${rituals.map(r => `
                <div class="p-2 bg-black/50 border border-[#06b6d4]/30 flex items-center justify-between">
                  <div class="flex flex-col min-w-0">
                    <span class="font-serif font-bold text-white text-xs truncate">${this.escapeHTML(r.name)}</span>
                    <span class="text-[8px] text-[#8e95a5] uppercase">${r.circle || '1º Círculo'} // ${r.cost || '1 PE'}</span>
                  </div>
                  <button class="vtt-btn-cast-ritual px-2 py-1 bg-[#06b6d4]/10 hover:bg-[#06b6d4] border border-[#06b6d4]/40 hover:border-[#06b6d4] text-[#06b6d4] hover:text-black text-[9px] font-bold transition-all cursor-pointer" data-name="${r.name}" data-cost="${r.cost || '1 PE'}">
                    🔮 CONJURAR
                  </button>
                </div>
              `).join('')}
            </div>
          `}
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
          <span class="text-[9px] text-[#8e95a5] font-bold uppercase tracking-wider">PERÍCIAS (1-CLIQUE)</span>
          <div class="grid grid-cols-1 gap-1 max-h-[170px] overflow-y-auto pr-1">
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
  // TAB 3: PARTICIPANTES DA SESSÃO (STATUS DE PRESENÇA REAL)
  // ------------------------------------------------------------
  getParticipantsHTML() {
    const participants = this.sync ? Array.from(this.sync.participants.values()) : [];

    return `
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <span class="text-xs font-bold text-white">AGENTES NA MESA</span>
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
                <span class="text-[9px] text-[#8e95a5] truncate">${this.escapeHTML(this.character?.name || 'Agente')} // ${this.escapeHTML(this.character?.concept || 'Sobrevivente')}</span>
              </div>
            </div>
            ${this.isGm ? '<span class="text-[9px] text-[#e21b23] font-bold">✠ GM</span>' : ''}
          </div>

          <!-- Outros Participantes Conectados em Tempo Real -->
          ${participants.filter(p => p.user?.id !== this.user.id).map(p => `
            <div class="p-2 bg-black/40 border border-white/10 flex items-center justify-between">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-2 h-2 rounded-full ${p.status === 'online' ? 'bg-emerald-400' : p.status === 'away' ? 'bg-amber-400' : 'bg-zinc-600'}"></span>
                <div class="flex flex-col min-w-0">
                  <span class="font-bold text-white text-xs truncate">${this.escapeHTML(p.user?.name || 'Agente')}</span>
                  <span class="text-[9px] text-[#8e95a5] truncate">${this.escapeHTML(p.character?.name || '')} // ${this.escapeHTML(p.character?.concept || '')}</span>
                </div>
              </div>
              ${p.isGm ? '<span class="text-[9px] text-[#e21b23] font-bold">✠ GM</span>' : ''}
            </div>
          `).join('')}

          ${participants.filter(p => p.user?.id !== this.user.id).length === 0 ? `
            <div class="p-3 text-center text-white/30 text-[10px] italic border border-dashed border-white/5">
              Nenhum outro jogador conectado no momento. Compartilhe o link da Mesa ou abra em outra janela para sincronizar.
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // TAB 4: HANDOUTS & PISTAS REAIS
  // ------------------------------------------------------------
  getHandoutsHTML() {
    return `
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <span class="text-xs font-bold text-white">ACERVO DE PISTAS</span>
          ${this.isGm ? `
            <button id="vtt-btn-add-handout" class="text-[9px] text-[#e21b23] hover:underline cursor-pointer font-bold">
              + ADICIONAR
            </button>
          ` : ''}
        </div>

        ${this.handouts.length === 0 ? `
          <div class="p-4 text-center text-white/30 text-xs italic border border-dashed border-white/10 flex flex-col items-center gap-1.5">
            <span>📜</span>
            <span>Nenhuma pista ou documento cadastrado nesta sessão.</span>
            ${this.isGm ? `
              <button id="vtt-btn-add-handout-empty" class="mt-1 px-2.5 py-1 bg-black border border-white/20 hover:border-[#e21b23] text-[9px] text-white cursor-pointer">
                + CADASTRAR DOCUMENTO / PISTA
              </button>
            ` : ''}
          </div>
        ` : `
          <div class="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
            ${this.handouts.map(h => `
              <div class="p-2 bg-black/40 border border-white/10 hover:border-white/20 flex flex-col gap-1.5 transition-all">
                <div class="flex items-center justify-between">
                  <span class="font-serif font-bold text-white text-xs truncate">${this.escapeHTML(h.title)}</span>
                  <span class="text-[8px] px-1 bg-black text-[#06b6d4] border border-[#06b6d4]/30 uppercase">${h.category || 'documento'}</span>
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
        `}
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
          <button id="vtt-btn-gm-init-combat" class="w-full p-2 bg-black/60 hover:bg-[#e21b23]/20 border border-[#e21b23]/50 hover:border-[#e21b23] text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-[#e21b23]">⚔ Iniciar Combate & Rolagem de Iniciativa</span>
              <span class="text-[9px] text-[#8e95a5]">Rola iniciativas de todos os participantes e inicia turnos</span>
            </div>
            <span class="text-xs text-[#e21b23]">❯</span>
          </button>

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

          <button id="vtt-btn-gm-campaign-edit" class="w-full p-2 bg-black/60 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">🏛 Editar Dados da Campanha</span>
              <span class="text-[9px] text-[#8e95a5]">Nome da campanha, número da sessão e sala</span>
            </div>
            <span class="text-xs text-white/50">❯</span>
          </button>

          <button id="vtt-btn-gm-notes" class="w-full p-2 bg-black/60 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">📝 Diretrizes & Anotação Tática</span>
              <span class="text-[9px] text-[#8e95a5]">Altera o resumo exibido na Visão da Sessão</span>
            </div>
            <span class="text-xs text-white/50">❯</span>
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
    const participants = this.sync ? Array.from(this.sync.participants.values()) : [];
    
    return `
      <div class="flex-1 flex flex-col gap-3 min-h-0">
        <!-- Banner Limpo & Autêntico da Sessão -->
        <div class="w-full bg-[#0a0d14] border border-white/10 p-4 sm:p-5 flex flex-col gap-2 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-[#e21b23] text-xs font-bold">✠ PAROXISMO VTT</span>
              <span class="text-white/20">•</span>
              <span class="text-[#06b6d4] text-[10px] uppercase font-mono">SESSÃO #${this.sessionData.sessionNumber}</span>
            </div>
            ${this.isGm ? `
              <button id="vtt-btn-edit-campaign-top" class="text-[9px] text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-2 py-0.5 cursor-pointer">
                ✏ EDITAR
              </button>
            ` : ''}
          </div>

          <h1 class="font-serif font-black text-xl sm:text-2xl text-white tracking-wide uppercase">
            ${this.escapeHTML(this.sessionData.campaignName)}
          </h1>

          <!-- Anotação / Diretriz Tática do Mestre -->
          <div class="mt-1 p-2.5 bg-black/60 border-l-2 border-[#06b6d4] flex items-start justify-between gap-2">
            <div class="flex flex-col gap-0.5 min-w-0">
              <span class="text-[9px] text-[#06b6d4] font-bold uppercase tracking-wider">DIRETRIZ TÁTICA DA MISSÃO</span>
              <p class="text-xs text-white/90 font-mono leading-relaxed">
                ${this.sessionData.tacticalNotes ? this.escapeHTML(this.sessionData.tacticalNotes) : '<span class="text-white/30 italic">Nenhuma diretriz ou objetivo registrado no momento pelo Mestre.</span>'}
              </p>
            </div>
            ${this.isGm ? `
              <button id="vtt-btn-edit-tactical-notes" class="text-[9px] text-[#06b6d4] hover:underline flex-shrink-0 cursor-pointer">
                [ ✏ EDITAR ]
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Cards Dinâmicos do Palco Central -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
          
          <!-- Card 1: Status do Combate -->
          <div id="vtt-center-combat-summary" class="p-3.5 bg-[#07090e]/90 border border-white/10 flex flex-col gap-2">
            ${this.getCombatSummaryContentHTML()}
          </div>

          <!-- Card 2: Pista / Documento em Destaque -->
          <div id="vtt-center-handout-summary" class="p-3.5 bg-[#07090e]/90 border border-white/10 flex flex-col gap-2">
            ${this.getHandoutSummaryContentHTML()}
          </div>

        </div>

        <!-- Card 3: Resumo dos Agentes Conectados na Mesa -->
        <div id="vtt-center-participants-summary" class="p-3 bg-[#07090e]/80 border border-white/10 flex flex-col gap-2">
          ${this.getParticipantsSummaryContentHTML(participants)}
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
            <span>⚔</span> COMBATE ATIVO
          </span>
          <span class="text-[9px] bg-[#e21b23]/20 text-[#e21b23] px-1.5 py-0.5 font-bold">RODADA 1</span>
        </div>
        <div class="flex-1 flex flex-col justify-center items-center py-3 text-center">
          <span class="text-[10px] text-[#8e95a5] uppercase">Combatente no Turno:</span>
          <span class="font-serif font-black text-lg text-white mt-1">${this.escapeHTML(current?.name || 'Agente')}</span>
          <span class="text-xs text-[#06b6d4] font-mono mt-1">Iniciativa: ${current?.initiative || 0}</span>
          ${this.isGm ? `
            <div class="flex items-center gap-2 mt-3">
              <button id="vtt-btn-center-prev-turn" class="px-2.5 py-1 bg-black border border-white/20 text-[10px] hover:text-white cursor-pointer">◀ Turno Anterior</button>
              <button id="vtt-btn-center-next-turn" class="px-3 py-1 bg-[#e21b23] text-black font-bold text-[10px] cursor-pointer">Próximo Turno ▶</button>
            </div>
          ` : ''}
        </div>
      `;
    }

    return `
      <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
        <span class="text-[10px] text-white/50 font-bold uppercase tracking-wider flex items-center gap-1">
          <span>⚔</span> STATUS DE COMBATE
        </span>
        <span class="text-[9px] text-white/30">LIVRE</span>
      </div>
      <div class="flex-1 flex flex-col justify-center items-center py-4 text-center text-white/40 gap-1.5">
        <span class="text-xs">Nenhum combate ativo nesta cena.</span>
        ${this.isGm ? `
          <button id="vtt-btn-center-init-combat" class="mt-1 px-3 py-1.5 bg-[#e21b23] hover:bg-[#ff333d] text-black text-xs font-bold font-mono transition-all cursor-pointer">
            + INICIAR COMBATE & ROLAR INICIATIVAS
          </button>
        ` : ''}
      </div>
    `;
  }

  getHandoutSummaryContentHTML() {
    const lastHandout = this.handouts[this.handouts.length - 1];
    if (lastHandout) {
      return `
        <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span class="text-[10px] text-white/70 font-bold uppercase tracking-wider flex items-center gap-1">
            <span>📜</span> ÚLTIMA PISTA COMPARTILHADA
          </span>
          <span class="text-[9px] text-[#06b6d4] uppercase">${lastHandout.category || 'PISTA'}</span>
        </div>
        <div class="flex items-center gap-3 py-1 flex-1">
          ${lastHandout.imageUrl ? `
            <div class="w-14 h-14 bg-black border border-white/10 flex-shrink-0 overflow-hidden">
              <img src="${lastHandout.imageUrl}" class="w-full h-full object-cover" />
            </div>
          ` : ''}
          <div class="flex flex-col min-w-0 flex-1">
            <span class="font-serif font-bold text-white text-xs truncate">${this.escapeHTML(lastHandout.title)}</span>
            <p class="text-[10px] text-[#8e95a5] line-clamp-2 mt-0.5">${this.escapeHTML(lastHandout.content)}</p>
          </div>
        </div>
        <button class="vtt-btn-view-handout text-[9px] text-right text-[#06b6d4] hover:underline cursor-pointer" data-id="${lastHandout.id}">
          [ INSPECIONAR PISTA ↗ ]
        </button>
      `;
    }

    return `
      <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
        <span class="text-[10px] text-white/50 font-bold uppercase tracking-wider flex items-center gap-1">
          <span>📜</span> ACERVO DE PISTAS
        </span>
        <span class="text-[9px] text-white/30">0 PISTAS</span>
      </div>
      <div class="flex-1 flex flex-col justify-center items-center py-4 text-center text-white/40 gap-1.5">
        <span class="text-xs">Nenhum documento ou pista revelado nesta sessão.</span>
        ${this.isGm ? `
          <button id="vtt-btn-center-add-handout" class="mt-1 px-3 py-1 bg-black border border-white/20 hover:border-[#e21b23] text-white text-[10px] font-mono cursor-pointer">
            + CADASTRAR DOCUMENTO / PISTA
          </button>
        ` : ''}
      </div>
    `;
  }

  getParticipantsSummaryContentHTML(participants) {
    const list = [
      {
        user: this.user,
        character: this.character,
        isGm: this.isGm,
        status: 'online',
        isMe: true
      },
      ...participants.filter(p => p.user?.id !== this.user.id)
    ];

    return `
      <div class="flex items-center justify-between border-b border-white/10 pb-1">
        <span class="text-[10px] text-[#8e95a5] font-bold uppercase tracking-wider">SOBREVIVENTES NA MESA (${list.length})</span>
        <span class="text-[9px] text-emerald-400 font-mono">● SINCRONIZADO</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
        ${list.map(p => `
          <div class="p-2 bg-black/50 border border-white/5 flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="w-1.5 h-1.5 rounded-full ${p.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
                <span class="text-xs font-bold text-white truncate">${this.escapeHTML(p.character?.name || p.user?.name || 'Agente')}</span>
              </div>
              ${p.isGm ? '<span class="text-[8px] bg-[#e21b23]/20 text-[#e21b23] px-1 font-bold">GM</span>' : ''}
            </div>
            <div class="flex items-center justify-between text-[9px] text-[#8e95a5]">
              <span>${this.escapeHTML(p.character?.concept || 'Sobrevivente')}</span>
              <span>PV ${p.character?.currentPv || 20}/20</span>
            </div>
          </div>
        `).join('')}
      </div>
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

    // 3. Botão de Senha do Mestre (Auth)
    root.querySelector('#vtt-btn-toggle-gm-mode')?.addEventListener('click', () => {
      if (this.isGm) {
        if (confirm('Deseja desativar o modo Mestre nesta sessão?')) {
          this.isGm = false;
          this.app?.setGmMode(false);
          this.sync.isGm = false;
          soundFX.playRuneClick();
          this.render();
        }
      } else {
        this.openGmPasswordModal();
      }
    });

    // 4. Botão de Tela Cheia
    root.querySelector('#vtt-btn-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
      soundFX.playRuneClick();
    });

    // 5. Botão Sair da Mesa
    root.querySelector('#vtt-btn-exit')?.addEventListener('click', () => {
      soundFX.playRuneClick();
      if (this.sync) {
        this.sync.disconnect();
      }
      window.location.hash = 'home';
    });

    // 6. Abrir Ficha Completa em Modal Foundry Style
    root.querySelector('#vtt-btn-open-foundry-sheet')?.addEventListener('click', () => {
      this.openCharacterSheetModal();
    });

    // 7. Fechar Ficha Completa
    root.querySelector('#vtt-btn-close-sheet-modal')?.addEventListener('click', () => {
      this.closeCharacterSheetModal();
    });

    // 8. Chat Input & Envio
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

    // 9. Dock de Dados: Seleção de Tipo
    root.querySelectorAll('.vtt-btn-dice-type').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedDiceType = parseInt(btn.dataset.sides, 10);
        soundFX.playRuneClick();
        this.renderDiceDockOnly();
      });
    });

    // 10. Dock de Dados: Quantidade e Modificador
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

    // 11. Botão Principal ROLAR DADO
    root.querySelector('#vtt-btn-roll-main')?.addEventListener('click', () => {
      this.executeDockRoll();
    });

    // 12. Dossiê: Ajuste Rápido de PV e PE
    root.querySelectorAll('.vtt-btn-adjust-stat').forEach(btn => {
      btn.addEventListener('click', () => {
        const stat = btn.dataset.stat;
        const delta = parseInt(btn.dataset.delta, 10);
        if (stat === 'pv') {
          this.character.currentPv = Math.max(0, Math.min(20, (this.character.currentPv || 20) + delta));
        } else if (stat === 'pe') {
          this.character.currentPe = Math.max(0, Math.min(3, (this.character.currentPe || 3) + delta));
        }
        saveCharacterDossier(this.character);
        soundFX.playRuneClick();
        this.renderLeftSidebarOnly();
      });
    });

    // 13. Dossiê: Ataque de Arma (1-Clique)
    root.querySelectorAll('.vtt-btn-weapon-attack').forEach(btn => {
      btn.addEventListener('click', () => {
        const weaponName = btn.dataset.name;
        const mod = parseInt(btn.dataset.mod || '0', 10);
        this.executeQuickSkillRoll(`Ataque (${weaponName})`, mod);
      });
    });

    // 14. Dossiê: Dano de Arma (1-Clique)
    root.querySelectorAll('.vtt-btn-weapon-damage').forEach(btn => {
      btn.addEventListener('click', () => {
        const weaponName = btn.dataset.name;
        const dmgFormula = btn.dataset.dmg || '1d8';
        this.executeWeaponDamageRoll(weaponName, dmgFormula);
      });
    });

    // 15. Dossiê: Conjurar Ritual (1-Clique)
    root.querySelectorAll('.vtt-btn-cast-ritual').forEach(btn => {
      btn.addEventListener('click', () => {
        const ritualName = btn.dataset.name;
        const costStr = btn.dataset.cost || '1 PE';
        const cost = parseInt(costStr, 10) || 1;
        this.executeCastRitual(ritualName, cost);
      });
    });

    // 16. Dossiê: Teste de Perícia de 1-Clique
    root.querySelectorAll('.vtt-btn-quick-skill').forEach(btn => {
      btn.addEventListener('click', () => {
        const skillName = btn.dataset.name;
        const mod = parseInt(btn.dataset.mod || '0', 10);
        this.executeQuickSkillRoll(skillName, mod);
      });
    });

    // 17. Dossiê: Teste de Atributo de 1-Clique
    root.querySelectorAll('.vtt-btn-quick-attr').forEach(btn => {
      btn.addEventListener('click', () => {
        const attrName = btn.dataset.attr.toUpperCase();
        const val = parseInt(btn.dataset.val || '0', 10);
        this.executeQuickSkillRoll('Atributo ' + attrName, val);
      });
    });

    // 18. Controles de Iniciativa do Mestre
    root.querySelector('#vtt-btn-prev-turn')?.addEventListener('click', () => this.advanceTurn(-1));
    root.querySelector('#vtt-btn-next-turn')?.addEventListener('click', () => this.advanceTurn(1));
    root.querySelector('#vtt-btn-center-prev-turn')?.addEventListener('click', () => this.advanceTurn(-1));
    root.querySelector('#vtt-btn-center-next-turn')?.addEventListener('click', () => this.advanceTurn(1));

    // Botões para Iniciar Combate
    const openCombatSetup = () => this.openCombatSetupModal();
    root.querySelector('#vtt-btn-toggle-combat')?.addEventListener('click', () => {
      if (this.combatActive) {
        if (confirm('Deseja realmente finalizar o combate?')) {
          this.combatActive = false;
          localStorage.setItem('paroxismo_combat_active', 'false');
          this.syncInitiative();
          if (this.sync) this.sync.sendSystemEvent('O Mestre finalizou o combate.');
        }
      } else {
        openCombatSetup();
      }
    });
    root.querySelector('#vtt-btn-init-combat-empty')?.addEventListener('click', openCombatSetup);
    root.querySelector('#vtt-btn-center-init-combat')?.addEventListener('click', openCombatSetup);
    root.querySelector('#vtt-btn-gm-init-combat')?.addEventListener('click', openCombatSetup);

    root.querySelector('#vtt-btn-clear-initiative')?.addEventListener('click', () => {
      if (confirm('Deseja limpar todos os combatentes da iniciativa?')) {
        this.initiativeList = [];
        this.activeTurnIndex = 0;
        this.combatActive = false;
        localStorage.removeItem('paroxismo_initiative_list_v1');
        localStorage.setItem('paroxismo_combat_active', 'false');
        this.syncInitiative();
      }
    });

    // Remover combatente individual
    root.querySelectorAll('.vtt-btn-remove-actor').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.initiativeList = this.initiativeList.filter(a => a.id !== id);
        if (this.activeTurnIndex >= this.initiativeList.length) {
          this.activeTurnIndex = Math.max(0, this.initiativeList.length - 1);
        }
        localStorage.setItem('paroxismo_initiative_list_v1', JSON.stringify(this.initiativeList));
        this.syncInitiative();
      });
    });

    // 19. Abrir Pistas / Handouts
    root.querySelectorAll('.vtt-btn-view-handout').forEach(btn => {
      btn.addEventListener('click', () => {
        const hId = btn.dataset.id;
        const handout = this.handouts.find(h => h.id === hId);
        if (handout) this.openHandoutModal(handout);
      });
    });

    // 20. Mestre Revelar Handout à Mesa
    root.querySelectorAll('.vtt-btn-reveal-handout').forEach(btn => {
      btn.addEventListener('click', () => {
        const hId = btn.dataset.id;
        const handout = this.handouts.find(h => h.id === hId);
        if (handout && this.sync) {
          this.sync.sendHandout(handout, 'show');
          this.sync.sendSystemEvent(`O Mestre revelou a pista: "${handout.title}"`);
        }
      });
    });

    // 21. Cadastrar Novo Handout
    const promptAddHandout = () => this.promptAddHandout();
    root.querySelector('#vtt-btn-add-handout')?.addEventListener('click', promptAddHandout);
    root.querySelector('#vtt-btn-add-handout-empty')?.addEventListener('click', promptAddHandout);
    root.querySelector('#vtt-btn-center-add-handout')?.addEventListener('click', promptAddHandout);

    // 22. Edição de Dados da Campanha e Anotações pelo Mestre
    const editCampaign = () => {
      const name = prompt('Nome da Campanha:', this.sessionData.campaignName);
      if (name && name.trim()) {
        const num = prompt('Número da Sessão:', this.sessionData.sessionNumber) || this.sessionData.sessionNumber;
        this.sessionData.campaignName = name.trim();
        this.sessionData.sessionNumber = parseInt(num, 10) || 1;
        localStorage.setItem('paroxismo_campaign_name', this.sessionData.campaignName);
        localStorage.setItem('paroxismo_session_num', String(this.sessionData.sessionNumber));
        if (this.sync) {
          this.sync.sendSessionState({
            campaignName: this.sessionData.campaignName,
            sessionNumber: this.sessionData.sessionNumber
          });
        }
        this.renderHeaderOnly();
        this.renderCenterStageOnly();
      }
    };
    root.querySelector('#vtt-btn-edit-campaign-top')?.addEventListener('click', editCampaign);
    root.querySelector('#vtt-btn-gm-campaign-edit')?.addEventListener('click', editCampaign);

    const editTacticalNotes = () => {
      const notes = prompt('Diretriz Tática / Objetivo da Sessão:', this.sessionData.tacticalNotes);
      if (notes !== null) {
        this.sessionData.tacticalNotes = notes.trim();
        localStorage.setItem('paroxismo_tactical_notes', this.sessionData.tacticalNotes);
        if (this.sync) {
          this.sync.sendSessionState({ tacticalNotes: this.sessionData.tacticalNotes });
        }
        this.renderCenterStageOnly();
      }
    };
    root.querySelector('#vtt-btn-edit-tactical-notes')?.addEventListener('click', editTacticalNotes);
    root.querySelector('#vtt-btn-gm-notes')?.addEventListener('click', editTacticalNotes);

    // 23. Ações do Painel do Mestre
    root.querySelector('#vtt-btn-gm-scene')?.addEventListener('click', () => this.promptGmScene());
    root.querySelector('#vtt-btn-gm-secret-roll')?.addEventListener('click', () => this.executeGmSecretRoll());
    root.querySelector('#vtt-btn-gm-pause')?.addEventListener('click', () => {
      this.sessionData.status = this.sessionData.status === 'paused' ? 'active' : 'paused';
      localStorage.setItem('paroxismo_session_status', this.sessionData.status);
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

    root.querySelector('#vtt-btn-end-cinematic')?.addEventListener('click', () => {
      this.cinematicScene = null;
      if (this.sync) {
        this.sync.sendScenePresentation(null, false);
      }
      this.renderCenterStageOnly();
    });
  }

  // ============================================================
  // DIÁLOGO DE SENHA DO MESTRE (GM AUTH)
  // ============================================================
  openGmPasswordModal() {
    const container = this.container.querySelector('#vtt-gm-auth-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="relative w-full max-w-md bg-[#07090e] border-2 border-[#e21b23] p-5 flex flex-col gap-4 text-white shadow-[0_0_40px_rgba(226,27,35,0.4)] animate-fadeIn">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-[#e21b23]">✠</span>
            <span class="font-serif font-black text-sm uppercase">CHAVE DE ACESSO DO CONDUTOR</span>
          </div>
          <button id="vtt-btn-close-gm-auth" class="text-white/40 hover:text-white text-xs cursor-pointer">✕</button>
        </div>

        <p class="text-xs text-[#8e95a5] leading-relaxed">
          Digite a chave de acesso do Mestre para assumir os controles da mesa (iniciativa, combate, rolagens secretas e revelação de pistas).
        </p>

        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] text-white/50 uppercase font-bold">Chave do Mestre:</label>
          <input type="password" id="vtt-gm-password-input" placeholder="Digite a chave (padrão: paroxismo)" class="w-full bg-black border border-white/20 focus:border-[#e21b23] px-3 py-2 text-xs text-white outline-none font-mono" />
          <div id="vtt-gm-auth-error" class="hidden text-[10px] text-[#ff333d]">Chave incorreta. Tente novamente.</div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button id="vtt-btn-cancel-gm-auth" class="px-3 py-1.5 bg-black border border-white/20 text-white text-xs cursor-pointer">
            CANCELAR
          </button>
          <button id="vtt-btn-confirm-gm-auth" class="px-4 py-1.5 bg-[#e21b23] hover:bg-[#ff333d] text-black font-bold text-xs cursor-pointer">
            DESBLOQUEAR
          </button>
        </div>
      </div>
    `;

    container.classList.remove('hidden');

    const input = container.querySelector('#vtt-gm-password-input');
    const errEl = container.querySelector('#vtt-gm-auth-error');
    input?.focus();

    const doAuth = () => {
      const val = input?.value?.trim().toLowerCase();
      // Chaves aceitas canônicas
      if (val === 'paroxismo' || val === 'mestre' || val === 'demiurgo' || val === 'gm' || val === '1234') {
        if (typeof soundFX.playSealBreak === 'function') soundFX.playSealBreak();
        this.isGm = true;
        this.app?.setGmMode(true);
        if (this.sync) {
          this.sync.isGm = true;
          this.sync.sendSystemEvent(`${this.user.name} assumiu como Mestre da Sessão.`);
        }
        container.classList.add('hidden');
        this.render();
      } else {
        errEl?.classList.remove('hidden');
        soundFX.playDiceRoll();
      }
    };

    container.querySelector('#vtt-btn-confirm-gm-auth')?.addEventListener('click', doAuth);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doAuth();
    });

    const close = () => container.classList.add('hidden');
    container.querySelector('#vtt-btn-close-gm-auth')?.addEventListener('click', close);
    container.querySelector('#vtt-btn-cancel-gm-auth')?.addEventListener('click', close);
  }

  // ============================================================
  // PREPARAÇÃO DE COMBATE & ROLAGEM DE INICIATIVAS (MESTRE)
  // ============================================================
  openCombatSetupModal() {
    const container = this.container.querySelector('#vtt-combat-modal-container');
    if (!container) return;

    this.pendingEnemies = [];

    const renderModalContent = () => {
      container.innerHTML = `
        <div class="relative w-full max-w-xl bg-[#07090e] border-2 border-[#e21b23] p-5 flex flex-col gap-4 text-white shadow-[0_0_50px_rgba(226,27,35,0.4)] animate-fadeIn max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-[#e21b23]">⚔</span>
              <span class="font-serif font-black text-base uppercase">PREPARAÇÃO DE COMBATE & INICIATIVAS</span>
            </div>
            <button id="vtt-btn-close-combat-modal" class="text-white/40 hover:text-white text-xs cursor-pointer">✕</button>
          </div>

          <!-- Seção 1: Agentes Aliados -->
          <div class="flex flex-col gap-2">
            <span class="text-[10px] text-[#06b6d4] font-bold uppercase tracking-wider">1. AGENTES CONECTADOS</span>
            <div class="p-2.5 bg-black/60 border border-white/10 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="combat-agent-self" checked class="accent-[#e21b23]" />
                <label for="combat-agent-self" class="font-bold text-xs text-white">${this.escapeHTML(this.character?.name || 'Agente')}</label>
              </div>
              <span class="text-[10px] text-[#8e95a5] font-mono">Bônus Inic: +2</span>
            </div>
          </div>

          <!-- Seção 2: Adicionar Ameaças / Inimigos -->
          <div class="flex flex-col gap-2">
            <span class="text-[10px] text-[#e21b23] font-bold uppercase tracking-wider">2. AMEAÇAS / INIMIGOS</span>
            
            <!-- Lista de inimigos já adicionados -->
            <div id="combat-enemies-list" class="flex flex-col gap-1.5">
              ${this.pendingEnemies.map((en, idx) => `
                <div class="p-2 bg-black/40 border border-[#e21b23]/30 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-[#ff333d]">☠</span>
                    <span class="font-bold text-white">${this.escapeHTML(en.name)}</span>
                    <span class="text-[9px] text-[#8e95a5]">(PV: ${en.pv})</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-[#06b6d4] font-mono">+${en.bonus} inic</span>
                    <button class="combat-remove-enemy text-white/30 hover:text-[#ff333d]" data-idx="${idx}">×</button>
                  </div>
                </div>
              `).join('')}

              ${this.pendingEnemies.length === 0 ? `
                <span class="text-[10px] text-white/30 italic">Nenhum inimigo adicionado ainda. Preencha abaixo:</span>
              ` : ''}
            </div>

            <!-- Formulário rápido para novo inimigo -->
            <div class="p-3 bg-black/80 border border-white/10 flex flex-col gap-2 mt-1">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="sm:col-span-2 flex flex-col gap-1">
                  <label class="text-[9px] text-white/40 uppercase">Nome da Ameaça:</label>
                  <input type="text" id="combat-new-enemy-name" placeholder="Ex: Rastejador do Abismo" class="bg-black border border-white/20 px-2 py-1 text-xs text-white outline-none font-mono" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[9px] text-white/40 uppercase">Bônus Inic:</label>
                  <input type="number" id="combat-new-enemy-bonus" value="2" class="bg-black border border-white/20 px-2 py-1 text-xs text-white outline-none font-mono" />
                </div>
              </div>

              <div class="flex justify-end">
                <button id="combat-btn-add-enemy" class="px-3 py-1 bg-white/10 hover:bg-[#e21b23] border border-white/20 text-xs text-white font-bold transition-all cursor-pointer">
                  + Adicionar Inimigo
                </button>
              </div>
            </div>
          </div>

          <!-- Seção 3: Botão Monumental de Rolar Todas as Iniciativas -->
          <div class="pt-3 border-t border-white/10 flex items-center justify-between">
            <button id="vtt-btn-cancel-combat-modal" class="px-3 py-1.5 bg-black border border-white/20 text-white text-xs cursor-pointer">
              CANCELAR
            </button>
            <button id="vtt-btn-execute-combat-roll" class="px-4 py-2 bg-[#e21b23] hover:bg-[#ff333d] text-black font-black text-xs tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(226,27,35,0.4)] cursor-pointer">
              <span>🎲</span>
              <span>ROLAR INICIATIVAS & INICIAR COMBATE</span>
            </button>
          </div>
        </div>
      `;

      // Eventos internos do modal
      container.querySelector('#combat-btn-add-enemy')?.addEventListener('click', () => {
        const nameInput = container.querySelector('#combat-new-enemy-name');
        const bonusInput = container.querySelector('#combat-new-enemy-bonus');
        const name = nameInput?.value?.trim() || 'Ameaça Desconhecida';
        const bonus = parseInt(bonusInput?.value || '2', 10);
        this.pendingEnemies.push({ name, bonus, pv: 30 });
        renderModalContent();
      });

      container.querySelectorAll('.combat-remove-enemy').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          this.pendingEnemies.splice(idx, 1);
          renderModalContent();
        });
      });

      const close = () => container.classList.add('hidden');
      container.querySelector('#vtt-btn-close-combat-modal')?.addEventListener('click', close);
      container.querySelector('#vtt-btn-cancel-combat-modal')?.addEventListener('click', close);

      container.querySelector('#vtt-btn-execute-combat-roll')?.addEventListener('click', () => {
        this.executeCombatRollsAndStart();
        close();
      });
    };

    renderModalContent();
    container.classList.remove('hidden');
  }

  executeCombatRollsAndStart() {
    soundFX.playDiceRoll();

    const newInitiativeList = [];

    // 1. Rola iniciativa do agente
    const agentBonus = (this.character?.attributes?.agi || 2) + (this.character?.trainedSkills?.includes('iniciativa') ? 2 : 0);
    const agentRoll = Math.floor(Math.random() * 20) + 1;
    newInitiativeList.push({
      id: 'actor_' + Date.now() + '_agent',
      name: this.character?.name || 'Agente',
      initiative: agentRoll + agentBonus,
      bonus: agentBonus,
      isNpc: false,
      currentPv: this.character?.currentPv || 20,
      maxPv: 20
    });

    // 2. Rola iniciativa dos inimigos cadastrados
    this.pendingEnemies.forEach((en, i) => {
      const roll = Math.floor(Math.random() * 20) + 1;
      newInitiativeList.push({
        id: 'actor_' + Date.now() + '_npc_' + i,
        name: en.name,
        initiative: roll + en.bonus,
        bonus: en.bonus,
        isNpc: true,
        currentPv: en.pv,
        maxPv: en.pv
      });
    });

    // 3. Ordena decrescente por iniciativa
    newInitiativeList.sort((a, b) => b.initiative - a.initiative);

    this.initiativeList = newInitiativeList;
    this.activeTurnIndex = 0;
    this.combatActive = true;

    localStorage.setItem('paroxismo_initiative_list_v1', JSON.stringify(this.initiativeList));
    localStorage.setItem('paroxismo_combat_active', 'true');

    this.syncInitiative();

    if (this.sync) {
      const first = this.initiativeList[0];
      this.sync.sendSystemEvent(`O Mestre iniciou um combate! Iniciativas roladas. Primeiro a agir: ${first.name} (Iniciativa ${first.initiative})`);
    }
  }

  advanceTurn(delta = 1) {
    if (this.initiativeList.length === 0) return;
    soundFX.playRuneClick();

    if (delta > 0) {
      this.activeTurnIndex = (this.activeTurnIndex + 1) % this.initiativeList.length;
    } else {
      this.activeTurnIndex = (this.activeTurnIndex - 1 + this.initiativeList.length) % this.initiativeList.length;
    }

    const current = this.initiativeList[this.activeTurnIndex];
    this.syncInitiative();

    if (this.sync && delta > 0) {
      this.sync.sendSystemEvent(`Turno de: ${current.name}`);
    }
  }

  // ============================================================
  // POPUP MODAL DA FICHA DE PERSONAGEM (ESTILO FOUNDRY VTT)
  // ============================================================
  openCharacterSheetModal() {
    const modal = this.container.querySelector('#vtt-sheet-modal');
    const content = this.container.querySelector('#vtt-sheet-modal-content');
    if (!modal || !content) return;

    soundFX.playRuneClick();
    content.innerHTML = '<div id="foundry-sheet-mount"></div>';
    modal.classList.remove('hidden');

    // Monta a Ficha Completa
    new CharacterSheet('foundry-sheet-mount');
  }

  closeCharacterSheetModal() {
    const modal = this.container.querySelector('#vtt-sheet-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    soundFX.playRuneClick();

    // Recarrega dossiê e atualiza a aba Meu Agente
    this.character = getCharacterDossier();
    this.renderLeftSidebarOnly();
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

    DiceAnimator.roll({
      sides: sides === 100 ? 10 : sides,
      label: label
    }).then(({ rolledValue, isCrit, isFumble }) => {
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

  executeWeaponDamageRoll(weaponName, formula = '1d8') {
    soundFX.playDiceRoll();

    // Interpreta fórmula ex: "1d8+2"
    let sides = 8;
    let mod = 0;
    const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/i);
    if (match) {
      sides = parseInt(match[2], 10) || 8;
      if (match[3]) mod = parseInt(match[3], 10) || 0;
    }

    DiceAnimator.roll({
      sides: sides,
      label: `Dano (${weaponName})`
    }).then(({ rolledValue }) => {
      const total = rolledValue + mod;
      const rollPayload = {
        label: `Dano (${weaponName})`,
        formula: formula,
        rolls: [rolledValue],
        modifier: mod,
        total,
        isCrit: false,
        isFumble: false,
        visibility: 'public'
      };

      if (this.sync) {
        this.sync.sendDiceRoll(rollPayload);
      }
    });
  }

  executeCastRitual(ritualName, cost = 1) {
    if ((this.character.currentPe || 0) < cost) {
      alert(`Pontos de Esforço insuficientes para conjurar ${ritualName}! Exige ${cost} PE.`);
      return;
    }

    this.character.currentPe -= cost;
    saveCharacterDossier(this.character);
    if (typeof soundFX.playSealBreak === 'function') soundFX.playSealBreak();
    else soundFX.playRuneClick();

    if (this.sync) {
      this.sync.sendChatMessage(`🔮 Conjurou o ritual [ ${ritualName} ] gastando ${cost} PE!`, 'normal', 'public');
    }

    this.renderLeftSidebarOnly();
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
    const title = prompt('Título da Cena:', 'O Altar do Avesso');
    if (!title) return;
    const url = prompt('URL ou Caminho da Imagem da Cena:', 'assets/images/hero_banner.jpg') || 'assets/images/hero_banner.jpg';
    const desc = prompt('Descrição atmosférica da cena:') || '';

    this.cinematicScene = { title, url, description: desc };
    if (this.sync) {
      this.sync.sendScenePresentation(this.cinematicScene, true);
    }
    this.renderCenterStageOnly();
  }

  promptAddHandout() {
    const title = prompt('Título do Documento / Pista:');
    if (!title || !title.trim()) return;
    const content = prompt('Conteúdo ou descrição da pista:') || '';
    const imageUrl = prompt('URL da Imagem (opcional):') || '';
    const category = prompt('Categoria (mapa, documento, pista, criatura):', 'documento') || 'documento';

    const newH = {
      id: 'hnd_' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim(),
      category: category.trim(),
      shared: true
    };

    this.handouts.push(newH);
    localStorage.setItem('paroxismo_campaign_handouts_v1', JSON.stringify(this.handouts));
    
    if (this.sync) {
      this.sync.sendHandout(newH, 'show');
      this.sync.sendSystemEvent(`O Mestre cadastrou e revelou: "${newH.title}"`);
    }

    this.renderLeftSidebarOnly();
    this.renderCenterHandoutSummary();
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

  renderCenterHandoutSummary() {
    const box = this.container.querySelector('#vtt-center-handout-summary');
    if (box) {
      box.innerHTML = this.getHandoutSummaryContentHTML();
      this.setupEventListeners();
    }
  }

  renderCenterParticipantsSummary(participants) {
    const box = this.container.querySelector('#vtt-center-participants-summary');
    if (box) {
      box.innerHTML = this.getParticipantsSummaryContentHTML(participants);
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
              <span class="text-[9px] text-[#8e95a5] truncate">${this.escapeHTML(p.character?.name || '')} // ${this.escapeHTML(p.character?.concept || '')}</span>
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
