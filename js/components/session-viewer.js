/**
 * PAROXISMO — SESSÃO / MESA VIRTUAL (VTT)
 * Interface em tempo real para condução e participação de sessões de RPG.
 * Gothic Dark Fantasy / Terminal CAD Militar do Avesso.
 * 
 * - Palco da Sessão dinâmico com informações reais
 * - Chat & Log de Rolagens persistente com deduplicação rigorosa
 * - Barra Permanente de Dados (D4, D6, D8, D10, D12, D20, D100) com física 3D
 * - Dossiê Completo do Agente: Armas (Ataque/Dano 1-clique), Rituais (Conjuração 1-clique),
 *   Proteção, PV/PE interativos e Ficha Completa em Popup Modal (Estilo Foundry VTT)
 * - Identificação do Mestre por Senha / Chave de Acesso
 * - Combate Interativo: Fase de Iniciativa com botão para cada jogador rolar sua própria iniciativa,
 *   opção para o Mestre rolar de todos de uma vez ou individualmente, e ordenação de turnos.
 * - Responsividade completa para Desktop, Tablet e Mobile
 */

import { soundFX } from '../utils/sound-fx.js?v=sound_v2';
import { DiceAnimator } from '../utils/dice-animator.js?v=phys_v13';
import { getCharacterDossier, saveCharacterDossier } from '../utils/character-storage.js?v=char_v2';
import { SessionSync } from '../utils/session-sync.js?v=sess_v4';
import { CharacterSheet } from './character-sheet.js?v=release_v11';
import { RULES_DATA } from '../data/rules.js';
import { SKILLS_DATA } from '../data/skills-origins.js';

const CLASS_IMAGES = {
  combate: 'assets/images/Combate.png',
  investigador: 'assets/images/Investigador.jpeg',
  ocultista: 'assets/images/Ocultista.png',
  tatico: 'assets/images/Tatico.png',
  infiltrador: 'assets/images/Infiltrador.png',
  metamaturgo: 'assets/images/Metamaturgo.png',
  duelista: 'assets/images/Duelista.png',
  flagelador: 'assets/images/Flagelador.png',
  receptaculo: 'assets/images/Receptaculo.png',
  liturgista: 'assets/images/Liturgista.png'
};

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

    // Estado da Iniciativa e Combate
    this.initiativeList = this.loadInitialInitiative();
    this.combatActive = localStorage.getItem('paroxismo_combat_active') === 'true';
    this.combatPhase = localStorage.getItem('paroxismo_combat_phase') || (this.combatActive ? 'turns' : 'initiative'); // 'initiative', 'turns'
    this.combatRound = parseInt(localStorage.getItem('paroxismo_combat_round') || '1', 10);
    this.activeTurnIndex = parseInt(localStorage.getItem('paroxismo_combat_turn') || '0', 10);
    this.pendingEnemies = [];

    // Estado de Pistas e Documentos
    this.handouts = this.loadInitialHandouts();

    // Mensagens do Chat e Rolagens
    this.chatMessages = this.loadInitialMessages();

    // UI State
    this.activeLeftTab = 'iniciativa'; // 'iniciativa', 'agente', 'jogadores', 'handouts', 'mestre'
    this.activeMobileTab = 'mesa';      // 'mesa', 'chat', 'agente', 'mestre'
    this.selectedDiceType = 20;
    this.diceQuantity = 1;
    this.diceModifier = 0;
    this.diceRollVisibility = 'public'; // 'public', 'private_gm', 'blind'
    this.cinematicScene = null;
    this.typingTimeout = null;

    this.init();
  }

  destroy() {
    document.body.classList.remove('vtt-view-active');
    const sheetModal = document.getElementById('vtt-sheet-modal');
    if (sheetModal && sheetModal.parentElement === document.body) {
      sheetModal.remove();
    }
    if (this.sync) {
      try { this.sync.disconnect(); } catch (e) {}
      this.sync = null;
    }
  }

  resolveCurrentUser() {
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
      const toSave = this.chatMessages.slice(-80);
      localStorage.setItem('paroxismo_mesa_messages_v1', JSON.stringify(toSave));
    } catch (e) {}
  }

  init() {
    if (!this.container) return;
    this.initSync();
    this.render();
  }

  initSync() {
    this.sync = new SessionSync(this.sessionId, this.user, this.character, this.isGm);
    this.sync.connect();

    // Escuta novas mensagens de chat (com proteção contra duplicatas)
    this.sync.on('chat', (chatMsg) => {
      if (chatMsg?.id && this.chatMessages.some(m => m.id === chatMsg.id)) return;
      this.chatMessages.push(chatMsg);
      this.saveMessages();
      this.renderChatFeedOnly();
      this.scrollChatToBottom();
    });

    // Escuta novas rolagens (com proteção contra duplicatas)
    this.sync.on('roll', (rollMsg) => {
      if (rollMsg?.id && this.chatMessages.some(m => m.id === rollMsg.id)) return;
      this.chatMessages.push({
        id: rollMsg.id,
        type: 'roll',
        ...rollMsg
      });
      this.saveMessages();
      this.renderChatFeedOnly();
      this.scrollChatToBottom();
    });

    // Escuta atualizações completas de iniciativa
    this.sync.on('initiative', (data) => {
      if (data.list) {
        this.initiativeList = data.list;
        localStorage.setItem('paroxismo_initiative_list_v1', JSON.stringify(this.initiativeList));
      }
      if (typeof data.activeIndex === 'number') {
        this.activeTurnIndex = data.activeIndex;
        localStorage.setItem('paroxismo_combat_turn', String(this.activeTurnIndex));
      }
      if (typeof data.combatActive === 'boolean') {
        this.combatActive = data.combatActive;
        localStorage.setItem('paroxismo_combat_active', data.combatActive ? 'true' : 'false');
      }
      if (data.phase) {
        this.combatPhase = data.phase;
        localStorage.setItem('paroxismo_combat_phase', data.phase);
      }
      if (typeof data.round === 'number') {
        this.combatRound = data.round;
        localStorage.setItem('paroxismo_combat_round', String(this.combatRound));
      }
      this.renderInitiativeListOnly();
      this.renderCenterCombatSummary();
    });

    // Escuta rolagem individual de iniciativa de um agente ou monstro
    this.sync.on('initiative_roll', (data) => {
      const actor = this.initiativeList.find(a => a.id === data.actorId);
      if (actor) {
        actor.initiative = data.initiative;
        actor.rolled = true;
        localStorage.setItem('paroxismo_initiative_list_v1', JSON.stringify(this.initiativeList));
        this.renderInitiativeListOnly();
        this.renderCenterCombatSummary();
      }
    });

    // Escuta handouts compartilhados
    this.sync.on('handout', (data) => {
      if (data.action === 'show' && data.handout) {
        if (!this.handouts.find(h => h.id === data.handout.id)) {
          this.handouts.push(data.handout);
          localStorage.setItem('paroxismo_campaign_handouts_v1', JSON.stringify(this.handouts));
        }
        this.openHandoutModal(data.handout);
        this.renderLeftSidebarOnly();
        this.renderCenterHandoutSummary();
      }
    });

    // Escuta cenas cinemáticas do Mestre
    this.sync.on('scene', (data) => {
      this.cinematicScene = data.active ? data.scene : null;
      this.renderCenterStageOnly();
    });

    // Escuta presença de participantes
    this.sync.on('presence', () => {
      this.renderParticipantsSummaryOnly();
      if (this.activeLeftTab === 'jogadores') {
        this.renderLeftSidebarOnly();
      }
    });

    // Escuta digitação
    this.sync.on('typing', (data) => {
      const typingEl = this.container.querySelector('#vtt-typing-indicator');
      if (typingEl) {
        if (data.isTyping) {
          typingEl.textContent = `${data.name} está redigindo...`;
          typingEl.classList.remove('hidden');
        } else {
          typingEl.classList.add('hidden');
        }
      }
    });

    // Escuta atualizações de estado da sessão
    this.sync.on('state', (state) => {
      if (state.status) {
        this.sessionData.status = state.status;
        localStorage.setItem('paroxismo_session_status', state.status);
      }
      if (state.tacticalNotes !== undefined) {
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

    // Escuta eventos de sistema
    this.sync.on('system', (sysMsg) => {
      this.chatMessages.push({
        id: sysMsg.id || ('sys_' + Date.now()),
        type: 'system',
        text: sysMsg.text,
        timestamp: sysMsg.timestamp
      });
      this.saveMessages();
      this.renderChatFeedOnly();
      this.scrollChatToBottom();
    });
  }

  // ============================================================
  // RENDERIZAÇÃO PRINCIPAL DO LAYOUT DA SESSÃO
  // ============================================================
  render() {
    this.container.innerHTML = `
      <div class="vtt-layout w-full h-full max-h-screen bg-[#040508] text-[#cbd0dc] flex flex-col font-sans select-none overflow-hidden relative">
        
        <!-- ============================================================ -->
        <!-- 1. SUB-HUD DA SESSÃO (BARRA SUPERIOR DE COMANDO) -->
        <!-- ============================================================ -->
        <header id="vtt-header" class="flex-shrink-0 w-full bg-[#07090e]/95 border-b border-[#e21b23]/40 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md z-30 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
          ${this.getHeaderHTML()}
        </header>

        <!-- ============================================================ -->
        <!-- 2. PALCO PRINCIPAL DE 3 COLUNAS (DESKTOP) OU TABS (MOBILE)   -->
        <!-- ============================================================ -->
        <div id="vtt-main-stage-grid" class="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 p-2 sm:p-3 min-h-0 overflow-hidden">
          
          <!-- COLUNA ESQUERDA: FERRAMENTAS DA SESSÃO (Lg: 3 cols) -->
          <aside id="vtt-left-sidebar" class="vtt-col-left ${this.activeMobileTab === 'agente' || this.activeMobileTab === 'mestre' ? 'vtt-mobile-active-flex' : ''} lg:col-span-3 xl:col-span-3 h-full max-h-full flex flex-col min-h-0 overflow-hidden gap-2 transition-all duration-300">
            ${this.getLeftSidebarHTML()}
          </aside>

          <!-- COLUNA CENTRAL: PALCO PRINCIPAL (VISÃO DA SESSÃO / CENA CINEMÁTICA) -->
          <main id="vtt-center-stage" class="${this.activeMobileTab === 'mesa' ? 'flex' : 'hidden lg:flex'} lg:col-span-6 xl:col-span-6 h-full max-h-full flex-col min-h-0 overflow-y-auto custom-scrollbar gap-3 relative pr-1">
            ${this.getCenterStageHTML()}
          </main>

          <!-- COLUNA DIREITA: CHAT & LOG DA SESSÃO (Lg: 3 cols) -->
          <aside id="vtt-right-sidebar" class="vtt-col-right ${this.activeMobileTab === 'chat' ? 'vtt-mobile-active-flex' : ''} lg:col-span-3 xl:col-span-3 h-full max-h-full flex flex-col min-h-0 overflow-hidden bg-[#07090e]/90 border border-white/10 relative">
            ${this.getRightSidebarHTML()}
          </aside>

        </div>

        <!-- ============================================================ -->
        <!-- 3. BARRA PERMANENTE DE DADOS (DOCK INFERIOR) -->
        <!-- ============================================================ -->
        <footer id="vtt-dice-dock" class="flex-shrink-0 w-full bg-[#07090e]/95 border-t border-[#e21b23]/50 backdrop-blur-lg px-2 sm:px-4 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0_-5px_25px_rgba(0,0,0,0.9)] z-30">
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
        <div id="vtt-generic-modal-container" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"></div>
        
        <!-- MODAL DA FICHA DE PERSONAGEM COMPLETA (POPUP FOUNDRY STYLE) -->
        <div id="vtt-sheet-modal" class="hidden fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
          <div class="relative w-full max-w-5xl h-[90vh] max-h-[90vh] bg-[#07090e] border-2 border-[#06b6d4] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.4)] overflow-hidden">
            <div class="p-3 bg-black/95 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-[#06b6d4]">👤</span>
                <span class="font-serif font-black text-sm uppercase text-white tracking-wider">DOSSIÊ DO AGENTE // FICHA COMPLETA</span>
              </div>
              <button id="vtt-btn-close-sheet-modal" class="px-3 py-1 bg-white/10 hover:bg-[#ff333d] border border-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer">
                ✕ FECHAR FICHA
              </button>
            </div>
            <div id="vtt-sheet-modal-content" class="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4"></div>
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
            <button id="vtt-btn-toggle-gm-mode" class="text-[9px] text-white/40 hover:text-white px-1 cursor-pointer" title="Sair do modo Mestre">[ Sair ]</button>
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
          <button class="vtt-left-tab-btn py-1 px-2 text-center transition-all cursor-pointer ${this.activeLeftTab === 'mestre' ? 'bg-[#06b6d4] text-black font-black' : 'text-[#06b6d4] hover:text-white'}" data-tab="mestre">
            MESTRE
          </button>
        ` : ''}
      </div>

      <!-- Conteúdo da Aba Selecionada -->
      <div class="flex-1 bg-[#07090e]/90 border border-white/10 p-2 sm:p-3 overflow-y-auto min-h-0 flex flex-col">
        ${this.getLeftSidebarContentHTML()}
      </div>
    `;
  }

  getLeftSidebarContentHTML() {
    switch (this.activeLeftTab) {
      case 'iniciativa':
        return this.getInitiativeHTML();
      case 'agente':
        return this.getAgentDossierHTML();
      case 'jogadores':
        return this.getPlayersListHTML();
      case 'handouts':
        return this.getHandoutsHTML();
      case 'mestre':
        return this.isGm ? this.getGmPanelHTML() : this.getInitiativeHTML();
      default:
        return this.getInitiativeHTML();
    }
  }

  // ------------------------------------------------------------
  // TAB 1: TRACKER DE INICIATIVA & COMBATE INTERATIVO
  // ------------------------------------------------------------
  getInitiativeHTML() {
    const hasCombatants = this.initiativeList.length > 0;
    const isInitiativePhase = this.combatActive && this.combatPhase === 'initiative';
    const activeActor = (this.combatActive && !isInitiativePhase && hasCombatants) ? this.initiativeList[this.activeTurnIndex] : null;

    // Encontra o actor correspondente ao jogador local
    const myActor = this.initiativeList.find(a => a.userId === this.user.id) || 
                    this.initiativeList.find(a => !a.isNpc && a.name === (this.character?.name || 'Agente'));
    const myBonus = (this.character?.attributes?.agi || 2) + (this.character?.trainedSkills?.includes('iniciativa') ? 2 : 0);

    return `
      <div class="flex flex-col gap-3 flex-1 min-h-0">
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
            <span class="text-[9px] ${this.combatActive ? (isInitiativePhase ? 'text-amber-400 font-bold animate-pulse' : 'text-emerald-400 font-bold') : 'text-white/40'}">
              ${this.combatActive ? (isInitiativePhase ? 'FASE DE INICIATIVA' : 'EM ANDAMENTO') : 'FORA DE COMBATE'}
            </span>
          `}
        </div>

        ${!hasCombatants ? `
          <div class="flex-1 flex flex-col items-center justify-center p-4 text-center text-white/40 gap-2 border border-dashed border-white/10">
            <span class="text-xl">⚔</span>
            <span class="text-xs">Nenhum combatente na iniciativa.</span>
            ${this.isGm ? `
              <button id="vtt-btn-init-combat-empty" class="mt-2 px-3 py-1.5 bg-[#e21b23] hover:bg-[#ff333d] text-black text-xs font-bold font-mono transition-all cursor-pointer">
                + INICIAR COMBATE & ABRIR INICIATIVAS
              </button>
            ` : `
              <span class="text-[10px]">Aguardando o Mestre iniciar um combate.</span>
            `}
          </div>
        ` : `
          <!-- ============================================== -->
          <!-- FASE DE INICIATIVA: BOTÃO DE ROLAR DO JOGADOR -->
          <!-- ============================================== -->
          ${isInitiativePhase ? `
            <div class="p-3 bg-[#e21b23]/10 border border-[#e21b23]/50 flex flex-col gap-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-serif font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span class="text-[#e21b23]">🎲</span> FASE DE INICIATIVAS
                </span>
                <span class="text-[9px] text-amber-400 font-mono animate-pulse">AGUARDANDO DADOS</span>
              </div>
              
              <!-- Se o jogador ainda não rolou sua iniciativa: botão pulsante -->
              ${myActor && !myActor.rolled ? `
                <button class="vtt-btn-roll-my-initiative w-full py-2 bg-[#e21b23] hover:bg-[#ff333d] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(226,27,35,0.5)] cursor-pointer">
                  <span>🎲</span>
                  <span>ROLAR MINHA INICIATIVA (${myBonus >= 0 ? '+' + myBonus : myBonus})</span>
                </button>
              ` : myActor && myActor.rolled ? `
                <div class="px-2 py-1.5 bg-black/60 border border-emerald-500/40 text-emerald-400 text-center font-mono text-xs font-bold flex items-center justify-center gap-2">
                  <span>✓</span>
                  <span>SUA INICIATIVA: ${myActor.initiative} (Definida)</span>
                </div>
              ` : ''}

              <!-- Controles exclusivos do Mestre durante a Fase de Iniciativa -->
              ${this.isGm ? `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-white/10">
                  <button id="vtt-btn-gm-roll-all" class="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer" title="Rola a iniciativa de todos os que ainda não jogaram">
                    <span>🎲</span> ROLAR DE TODOS (MESTRE)
                  </button>
                  <button id="vtt-btn-start-turns" class="py-1.5 px-2 bg-[#06b6d4] hover:bg-[#22d3ee] text-black font-black text-[10px] flex items-center justify-center gap-1 cursor-pointer" title="Ordena e começa a rodada de turnos">
                    <span>▶</span> INICIAR 1ª RODADA
                  </button>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- ============================================== -->
          <!-- FASE DE TURNOS ATIVA: TURNO ATUAL EM DESTAQUE -->
          <!-- ============================================== -->
          ${!isInitiativePhase && activeActor ? `
            <div class="p-2.5 bg-[#0e121a] border-l-4 border-[#06b6d4] flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[9px] text-[#06b6d4] font-bold tracking-widest uppercase">▶ TURNO ATUAL (RODADA ${this.combatRound})</span>
                <span class="font-serif font-bold text-white text-sm">${this.escapeHTML(activeActor.name)}</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-[#8e95a5]">INIC</span>
                <div class="text-base font-black text-[#06b6d4]">${activeActor.initiative || 0}</div>
              </div>
            </div>

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
          ` : ''}

          <!-- ============================================== -->
          <!-- LISTA DE COMBATENTES -->
          <!-- ============================================== -->
          <div class="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
            ${this.initiativeList.map((actor, idx) => {
              const isCurrent = !isInitiativePhase && idx === this.activeTurnIndex;
              const hasRolled = actor.rolled || (actor.initiative !== null && actor.initiative !== undefined);
              return `
                <div class="p-2 ${isCurrent ? 'bg-[#141a24] border border-[#06b6d4]/60' : 'bg-black/40 border border-white/5 hover:border-white/20'} flex items-center justify-between text-xs transition-all">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-4 text-center font-bold ${isCurrent ? 'text-[#06b6d4]' : 'text-white/40'}">${idx + 1}.</span>
                    <div class="flex flex-col min-w-0">
                      <span class="font-serif font-bold ${actor.isNpc ? 'text-[#ff333d]' : 'text-white'} truncate">${this.escapeHTML(actor.name)}</span>
                      <span class="text-[9px] text-[#8e95a5]">${actor.isNpc ? 'Ameaça / Inimigo' : 'Agente Aliado'} (+${actor.bonus || 0} inic)</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    ${hasRolled ? `
                      <span class="px-2 py-0.5 bg-black/80 border border-white/20 text-white font-mono text-[11px] font-bold shadow-xs">
                        ${actor.initiative}
                      </span>
                    ` : `
                      <div class="flex items-center gap-1">
                        <span class="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/40 text-amber-400 font-mono text-[9px]">
                          PENDENTE
                        </span>
                        ${this.isGm ? `
                          <button class="vtt-btn-roll-actor-inic px-1.5 py-0.5 bg-[#e21b23]/20 hover:bg-[#e21b23] text-white hover:text-black border border-[#e21b23]/60 font-mono text-[9px] font-bold transition-all cursor-pointer" data-id="${actor.id}" title="Mestre rola por este combatente">
                            🎲
                          </button>
                        ` : ''}
                      </div>
                    `}
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
  // CÁLCULO UNIFICADO DE ESTATÍSTICAS DERIVADAS (PV, PE, DEFESA)
  // ------------------------------------------------------------
  getCharacterStats(c) {
    if (!c) return { maxPv: 20, currentPv: 20, maxPe: 3, currentPe: 3, passiveDef: 10 };
    const attrs = c.attributes || {};
    let baseInitialPv = 20;
    let baseGainPv = 4;
    if (c.classId === 'combate') { baseInitialPv = 20; baseGainPv = 4; }
    else if (c.classId === 'flagelador') { baseInitialPv = 18; baseGainPv = 4; }
    else if (['investigador', 'tatico', 'infiltrador', 'duelista', 'receptaculo'].includes(c.classId)) { baseInitialPv = 16; baseGainPv = 3; }
    else if (c.classId === 'metamaturgo') { baseInitialPv = 14; baseGainPv = 3; }
    else if (['ocultista', 'liturgista'].includes(c.classId)) { baseInitialPv = 12; baseGainPv = 2; }
    
    const vig = (typeof attrs.vig === 'number' && !isNaN(attrs.vig)) ? attrs.vig : 2;
    const level = c.level || 1;
    const computedMaxPv = Math.max(1, (baseInitialPv + vig) + (level - 1) * (baseGainPv + vig));
    const maxPv = (typeof c.maxPv === 'number' && !isNaN(c.maxPv)) ? c.maxPv : computedMaxPv;

    let baseInitialPe = 2;
    let baseGainPe = 1;
    if (c.classId === 'combate') { baseInitialPe = 2; baseGainPe = 1; }
    else if (c.classId === 'infiltrador') { baseInitialPe = 3; baseGainPe = 2; }
    else if (['investigador', 'tatico', 'metamaturgo', 'flagelador'].includes(c.classId)) { baseInitialPe = 4; baseGainPe = 2; }
    else if (['duelista', 'receptaculo'].includes(c.classId)) { baseInitialPe = 5; baseGainPe = 2; }
    else if (['ocultista', 'liturgista'].includes(c.classId)) { baseInitialPe = 6; baseGainPe = 3; }
    
    const pre = (typeof attrs.pre === 'number' && !isNaN(attrs.pre)) ? attrs.pre : 1;
    const computedMaxPe = Math.max(1, (baseInitialPe + pre) + (level - 1) * (baseGainPe + pre));
    const maxPe = (typeof c.maxPe === 'number' && !isNaN(c.maxPe)) ? c.maxPe : computedMaxPe;

    const currentPv = Math.max(0, Math.min(maxPv, (typeof c.currentPv === 'number' && !isNaN(c.currentPv)) ? c.currentPv : maxPv));
    const currentPe = Math.max(0, Math.min(maxPe, (typeof c.currentPe === 'number' && !isNaN(c.currentPe)) ? c.currentPe : maxPe));

    let armorBonus = 0;
    if (c.protectionId === 'colete' || c.protectionId === 'colete_leve') armorBonus = 2;
    else if (c.protectionId === 'pesada' || c.protectionId === 'colete_pesado') armorBonus = 5;
    else armorBonus = 1; // jaqueta padrão
    const passiveDef = 10 + (attrs.agi || 0) + armorBonus + (c.classId === 'combate' ? (attrs.vig || 0) : 0);

    return { maxPv, currentPv, maxPe, currentPe, passiveDef };
  }

  // ------------------------------------------------------------
  // TAB 2: MEU AGENTE (ARMAS, RITUAIS, PROTEÇÃO, ATRIBUTOS E POPUP)
  // ------------------------------------------------------------
  getAgentDossierHTML() {
    const c = this.character;
    const attrs = c.attributes || { agi: 2, for: 2, int: 1, pre: 1, vig: 2 };
    const weapons = Array.isArray(c.customWeapons) ? c.customWeapons : [];
    const rituals = Array.isArray(c.customRituals) ? c.customRituals : [];
    
    const stats = this.getCharacterStats(c);
    const maxPv = stats.maxPv;
    const maxPe = stats.maxPe;
    const currentPv = stats.currentPv;
    const currentPe = stats.currentPe;
    const passiveDef = stats.passiveDef;

    return `
      <div class="flex flex-col gap-3 min-h-0">
        <!-- Identificação do Personagem & Botão Ver Ficha Foundry Style -->
        <div class="p-2.5 bg-black/60 border border-white/10 flex items-center justify-between gap-2">
          <div class="flex flex-col min-w-0">
            <span class="font-serif font-black text-white text-sm truncate uppercase">${this.escapeHTML(c.name || 'Agente Não Identificado')}</span>
            <span class="text-[9px] text-[#8e95a5] truncate capitalize">${this.escapeHTML(c.concept || 'Sobrevivente')} // Nv ${c.level || 1}</span>
          </div>
          <button id="vtt-btn-open-foundry-sheet" class="px-2.5 py-1 bg-[#06b6d4]/10 hover:bg-[#06b6d4] border border-[#06b6d4] text-[10px] font-bold text-white hover:text-black transition-all flex items-center gap-1 cursor-pointer flex-shrink-0" title="Abrir Dossiê Completo em Janela Suspensa">
            <span>👁</span>
            <span>VER FICHA</span>
          </button>
        </div>

        <!-- Barras Vitais: PV e PE com Ajustes de 1-Clique -->
        <div class="grid grid-cols-2 gap-2 font-mono">
          <div class="p-2 bg-black/60 border border-[#e21b23]/40 flex flex-col gap-1">
            <div class="flex justify-between items-center text-[9px] text-[#ff333d] font-bold">
              <span>VIDA (PV)</span>
              <span>${currentPv}/${maxPv}</span>
            </div>
            <div class="w-full h-1.5 bg-black/80 overflow-hidden">
              <div class="h-full bg-[#e21b23] transition-all duration-150" style="width: ${Math.min(100, Math.max(0, Math.round((currentPv / maxPv) * 100)))}%;"></div>
            </div>
            <div class="flex items-center justify-end gap-1 pt-1">
              <button class="vtt-btn-adjust-stat px-1.5 py-0.2 bg-black border border-white/20 hover:border-[#e21b23] text-xs text-white cursor-pointer" data-stat="pv" data-delta="-1" data-max="${maxPv}">-1</button>
              <button class="vtt-btn-adjust-stat px-1.5 py-0.2 bg-black border border-white/20 hover:border-[#e21b23] text-xs text-white cursor-pointer" data-stat="pv" data-delta="1" data-max="${maxPv}">+1</button>
            </div>
          </div>

          <div class="p-2 bg-black/60 border border-[#06b6d4]/40 flex flex-col gap-1">
            <div class="flex justify-between items-center text-[9px] text-[#06b6d4] font-bold">
              <span>ESFORÇO (PE)</span>
              <span>${currentPe}/${maxPe}</span>
            </div>
            <div class="w-full h-1.5 bg-black/80 overflow-hidden">
              <div class="h-full bg-[#06b6d4] transition-all duration-150" style="width: ${Math.min(100, Math.max(0, Math.round((currentPe / maxPe) * 100)))}%;"></div>
            </div>
            <div class="flex items-center justify-end gap-1 pt-1">
              <button class="vtt-btn-adjust-stat px-1.5 py-0.2 bg-black border border-white/20 hover:border-[#06b6d4] text-xs text-white cursor-pointer" data-stat="pe" data-delta="-1" data-max="${maxPe}">-1</button>
              <button class="vtt-btn-adjust-stat px-1.5 py-0.2 bg-black border border-white/20 hover:border-[#06b6d4] text-xs text-white cursor-pointer" data-stat="pe" data-delta="1" data-max="${maxPe}">+1</button>
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
                      <button class="vtt-btn-weapon-attack py-1 bg-black/80 hover:bg-[#e21b23]/20 border border-white/20 hover:border-[#e21b23] text-[9px] font-bold text-white transition-all cursor-pointer" data-name="${this.escapeHTML(w.name)}" data-mod="${hitMod}">
                        🎲 ATACAR (${hitMod >= 0 ? '+' + hitMod : hitMod})
                      </button>
                      <button class="vtt-btn-weapon-damage py-1 bg-black/80 hover:bg-[#06b6d4]/20 border border-white/20 hover:border-[#06b6d4] text-[9px] font-bold text-[#06b6d4] transition-all cursor-pointer" data-name="${this.escapeHTML(w.name)}" data-dmg="${w.dmgDice || '1d8'}">
                        ⚔ DANO (${w.dmgDice || '1d8'})
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- RITUAIS APRENDIDOS (CONJURAÇÃO DE 1-CLIQUE) -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[9px] text-[#8e95a5] font-bold uppercase tracking-wider">RITUAIS VINCULADOS</span>
          ${rituals.length === 0 ? `
            <span class="text-[10px] text-white/40 italic">Nenhum ritual gravado na ficha.</span>
          ` : `
            <div class="flex flex-col gap-1">
              ${rituals.map(r => `
                <div class="p-2 bg-black/50 border border-[#06b6d4]/30 flex items-center justify-between text-xs">
                  <div class="flex flex-col min-w-0">
                    <span class="font-serif font-bold text-[#06b6d4] truncate">${this.escapeHTML(r.name)}</span>
                    <span class="text-[9px] text-[#8e95a5]">${r.cost || '1 PE'} // ${r.range || 'Curto'}</span>
                  </div>
                  <button class="vtt-btn-cast-ritual px-2 py-1 bg-[#06b6d4]/20 hover:bg-[#06b6d4] text-[#06b6d4] hover:text-black border border-[#06b6d4] text-[9px] font-bold transition-all cursor-pointer flex-shrink-0" data-name="${this.escapeHTML(r.name)}" data-cost="${r.cost || '1 PE'}">
                    🔮 CONJURAR (-${r.cost || '1 PE'})
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- ATRIBUTOS BÁSICOS (TESTES DE 1-CLIQUE) -->
        <div class="flex flex-col gap-1 pt-1">
          <span class="text-[9px] text-[#8e95a5] font-bold uppercase tracking-wider">TESTES DE ATRIBUTO (1-CLIQUE)</span>
          <div class="grid grid-cols-5 gap-1 text-center font-mono">
            ${['agi', 'for', 'int', 'pre', 'vig'].map(attr => `
              <button class="vtt-btn-quick-attr p-1 bg-black/60 hover:bg-[#e21b23]/20 border border-white/10 hover:border-[#e21b23] flex flex-col items-center transition-all cursor-pointer" data-attr="${attr}" data-val="${attrs[attr] || 0}">
                <span class="text-[8px] text-white/40 uppercase">${attr}</span>
                <span class="text-xs font-bold text-white">${(attrs[attr] || 0) >= 0 ? '+' + (attrs[attr] || 0) : attrs[attr]}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- PERÍCIAS (ROLAGENS RÁPIDAS COM SKILLS_DATA OFICIAL) -->
        <div class="flex flex-col gap-1 pt-1 flex-1 min-h-0">
          <div class="flex items-center justify-between">
            <span class="text-[9px] text-[#8e95a5] font-bold uppercase tracking-wider">PERÍCIAS (1-CLIQUE)</span>
            <span class="text-[9px] text-white/40 font-mono">${(SKILLS_DATA || []).length} Perícias</span>
          </div>
          <div class="flex flex-col gap-1 overflow-y-auto max-h-56 pr-1 font-mono custom-scrollbar">
            ${(SKILLS_DATA || []).map(skill => {
              const isTrained = Array.isArray(c.trainedSkills) && c.trainedSkills.includes(skill.id);
              const attrKey = (skill.attr || 'for').toLowerCase();
              const attrVal = attrs[attrKey] ?? attrs[skill.attr] ?? 0;
              const bonus = attrVal + (isTrained ? 2 : 0);
              return `
                <button class="vtt-btn-quick-skill w-full p-1.5 px-2 bg-black/40 hover:bg-[#e21b23]/10 border border-white/5 hover:border-[#e21b23]/40 flex items-center justify-between text-left transition-all cursor-pointer group" data-name="${this.escapeHTML(skill.name)}" data-mod="${bonus}">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-[10px] text-white/40 group-hover:text-[#e21b23] transition-colors">🎲</span>
                    <span class="text-[11px] truncate ${isTrained ? 'text-white font-bold' : 'text-[#8e95a5] group-hover:text-white'}">${this.escapeHTML(skill.name)}</span>
                    <span class="text-[8px] text-white/30 uppercase flex-shrink-0">(${skill.attr})</span>
                  </div>
                  <span class="text-[10px] font-bold font-mono flex-shrink-0 ${isTrained ? 'text-[#06b6d4]' : 'text-white/60'}">
                    ${bonus >= 0 ? '+' + bonus : bonus}
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
  // TAB 3: LISTA DE JOGADORES CONECTADOS
  // ------------------------------------------------------------
  getPlayersListHTML() {
    const participants = this.sync ? Array.from(this.sync.participants.values()) : [];
    
    return `
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <span class="text-xs font-bold text-white">AGENTES NA MESA (${participants.length})</span>
          <span class="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            AO VIVO
          </span>
        </div>

        <div class="flex flex-col gap-2">
          ${participants.map(p => `
            <div class="p-2 bg-black/40 border border-white/10 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full ${p.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
                <div class="flex flex-col">
                  <span class="font-serif font-bold text-white text-xs">${this.escapeHTML(p.user?.name || 'Agente')}</span>
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
        <div class="flex flex-col gap-2">
          <button id="vtt-btn-gm-campaign-edit" class="w-full p-2 bg-black/60 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">✏ Nome da Campanha & Sessão</span>
              <span class="text-[9px] text-[#8e95a5]">Altera o título oficial e o número da sessão</span>
            </div>
            <span class="text-xs text-white/50">❯</span>
          </button>

          <button id="vtt-btn-gm-notes" class="w-full p-2 bg-black/60 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">📋 Editar Diretriz Tática da Missão</span>
              <span class="text-[9px] text-[#8e95a5]">Atualiza o objetivo visível para todos os jogadores</span>
            </div>
            <span class="text-xs text-white/50">❯</span>
          </button>

          <button id="vtt-btn-gm-init-combat" class="w-full p-2 bg-black/60 hover:bg-[#e21b23]/20 border border-white/10 hover:border-[#e21b23] text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-[#ff333d]">⚔ Gerenciar Combate & Iniciativas</span>
              <span class="text-[9px] text-[#8e95a5]">Adiciona monstros e abre a fase de iniciativas</span>
            </div>
            <span class="text-xs text-[#ff333d]">❯</span>
          </button>

          <button id="vtt-btn-gm-scene" class="w-full p-2 bg-black/60 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">🎬 Apresentar Cena Cinemática</span>
              <span class="text-[9px] text-[#8e95a5]">Projeta uma ilustração ou mapa tático no centro</span>
            </div>
            <span class="text-xs text-white/50">❯</span>
          </button>

          <button id="vtt-btn-gm-secret-roll" class="w-full p-2 bg-black/60 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left flex items-center justify-between transition-all cursor-pointer">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">🎲 Rolagem Oculta (Mestre)</span>
              <span class="text-[9px] text-[#8e95a5]">Rola dados cujo resultado só você visualiza</span>
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
      if (this.combatPhase === 'initiative') {
        const myActor = this.initiativeList.find(a => a.userId === this.user.id) || 
                        this.initiativeList.find(a => !a.isNpc && a.name === (this.character?.name || 'Agente'));
        const myBonus = (this.character?.attributes?.agi || 2) + (this.character?.trainedSkills?.includes('iniciativa') ? 2 : 0);

        return `
          <div class="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
            <span class="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span>⚔</span> FASE DE INICIATIVA
            </span>
            <span class="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 font-bold">RODADA 1</span>
          </div>
          <div class="flex-1 flex flex-col justify-center items-center py-3 text-center gap-2">
            <span class="text-xs text-[#cbd0dc]">Aguardando rolagens de iniciativa dos combatentes...</span>
            
            ${myActor && !myActor.rolled ? `
              <button class="vtt-btn-roll-my-initiative px-4 py-2 bg-[#e21b23] hover:bg-[#ff333d] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(226,27,35,0.4)] cursor-pointer">
                <span>🎲</span>
                <span>ROLAR MINHA INICIATIVA (${myBonus >= 0 ? '+' + myBonus : myBonus})</span>
              </button>
            ` : myActor && myActor.rolled ? `
              <span class="text-xs text-emerald-400 font-mono font-bold">✓ Sua iniciativa está definida (${myActor.initiative}). Aguardando início dos turnos.</span>
            ` : ''}

            ${this.isGm ? `
              <div class="flex items-center gap-2 mt-2">
                <button id="vtt-btn-center-roll-all" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold cursor-pointer">
                  🎲 ROLAR DE TODOS (MESTRE)
                </button>
                <button id="vtt-btn-center-start-turns" class="px-3 py-1.5 bg-[#06b6d4] hover:bg-[#22d3ee] text-black text-[10px] font-bold cursor-pointer">
                  ▶ COMEÇAR RODADA 1
                </button>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Fase de Turnos Ativa
      const current = this.initiativeList[this.activeTurnIndex];
      return `
        <div class="flex items-center justify-between border-b border-[#e21b23]/30 pb-1.5">
          <span class="text-[10px] text-[#e21b23] font-bold uppercase tracking-wider flex items-center gap-1">
            <span>⚔</span> COMBATE ATIVO
          </span>
          <span class="text-[9px] bg-[#e21b23]/20 text-[#e21b23] px-1.5 py-0.5 font-bold">RODADA ${this.combatRound}</span>
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
            + INICIAR COMBATE & ABRIR INICIATIVAS
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
          <div class="flex flex-col gap-0.5 min-w-0 flex-1">
            <span class="font-serif font-bold text-white text-xs truncate">${this.escapeHTML(lastHandout.title)}</span>
            <p class="text-[10px] text-[#8e95a5] line-clamp-2">${this.escapeHTML(lastHandout.content)}</p>
          </div>
        </div>
        <div class="flex justify-end pt-1 border-t border-white/5">
          <button class="vtt-btn-view-handout text-[9px] text-[#06b6d4] hover:underline cursor-pointer" data-id="${lastHandout.id}">
            [ ABRIR DOCUMENTO ]
          </button>
        </div>
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
          <button id="vtt-btn-center-add-handout" class="mt-1 px-2.5 py-1 bg-black border border-white/20 hover:border-[#e21b23] text-[9px] text-white cursor-pointer">
            + CADASTRAR DOCUMENTO / PISTA
          </button>
        ` : ''}
      </div>
    `;
  }

  renderStreamPortraitCardHTML(p) {
    const isMe = p.user?.id === this.user?.id;
    const char = isMe ? this.character : (p.character || {});
    const name = (isMe ? this.character?.name : (char.name || p.user?.name)) || 'Agente';
    const classId = char.classId || 'combate';
    const avatarUrl = char.customAvatar || CLASS_IMAGES[classId] || 'assets/images/Combate.png';
    const fallbackImg = CLASS_IMAGES[classId] || 'assets/images/Combate.png';

    const stats = this.getCharacterStats(char);
    const curPv = stats.currentPv;
    const maxPv = stats.maxPv;
    const curPe = stats.currentPe;
    const level = char.level || 1;

    let tag = '';
    if (p.isGm) {
      tag = '✠ CONDUTOR // GM';
    } else if (char.concept) {
      tag = `${char.concept.toUpperCase()} // NV ${level}`;
    } else {
      tag = `AGENTE // NV ${level}`;
    }

    return `
      <div class="stream-portrait-card" data-user-id="${p.user?.id || ''}" title="Clique para abrir o Dossiê do Agente">
        <div class="stream-portrait-img-box">
          <img class="stream-portrait-img" src="${avatarUrl}" alt="${this.escapeHTML(name)}" onerror="this.onerror=null; this.src='${fallbackImg}';" />
          
          <svg class="stream-portrait-slash" viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#streamSlashNeonGlow)">
              <path d="M12 55 L42 22" stroke="#ff222d" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M14 53 L40 24" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M22 26 L45 62" stroke="#e21b23" stroke-width="4" stroke-linecap="round"/>
              <path d="M24 28 L43 60" stroke="#ff9ea4" stroke-width="1.5" stroke-linecap="round"/>
            </g>
            <path d="M25 54 C45 74, 85 88, 140 85 C185 82, 215 55, 232 28 C220 54, 180 77, 135 77 C88 77, 48 64, 25 54 Z" fill="url(#streamSlashGradDark)"/>
            <path d="M28 53 C50 72, 90 85, 142 82 C184 80, 212 56, 228 32 C216 52, 178 74, 136 74 C90 74, 52 62, 28 53 Z" fill="url(#streamSlashGradBright)"/>
            <path d="M30 52 C55 70, 95 82, 145 80 C182 78, 208 58, 226 34" stroke="url(#streamSlashSpineHighlight)" stroke-width="3" stroke-linecap="round" filter="url(#streamSlashNeonGlow)"/>
            <path d="M15 65 C40 82, 85 94, 130 92 C165 90, 195 76, 215 58" stroke="#ff1a24" stroke-width="2" stroke-linecap="round" stroke-dasharray="8 5 15 4" opacity="0.85"/>
            <path d="M35 76 L30 88 M55 82 L50 94 M85 87 L82 98 M115 87 L116 99 M150 83 L155 95 M180 74 L190 86 M205 60 L218 70" stroke="#e21b23" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M100 78 C94 65, 82 60, 75 64" stroke="#ff333d" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M165 74 C175 62, 185 58, 192 63" stroke="#ff333d" stroke-width="2.5" stroke-linecap="round"/>
          </svg>

          <span class="stream-portrait-pe">${curPe}</span>
        </div>

        <div class="stream-portrait-info">
          <div class="stream-portrait-name">${this.escapeHTML(name)}</div>
          <div class="stream-portrait-pv">${curPv}/${maxPv}</div>
          <div class="stream-portrait-tag">${this.escapeHTML(tag)}</div>
        </div>
      </div>
    `;
  }

  getParticipantsSummaryContentHTML(participants) {
    const effectiveParticipants = (participants && participants.length > 0) ? participants : [{
      user: this.user,
      character: this.character,
      isGm: this.isGm,
      status: 'online'
    }];

    return `
      <!-- Defs SVG compartilhados para efeitos de neon e gradientes das garras -->
      <svg style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="streamSlashGradDark" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#4a0002" />
            <stop offset="20%" stop-color="#8a0308" />
            <stop offset="50%" stop-color="#c91018" />
            <stop offset="80%" stop-color="#99060b" />
            <stop offset="100%" stop-color="#3d0001" />
          </linearGradient>
          <linearGradient id="streamSlashGradBright" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#ff1a24" />
            <stop offset="30%" stop-color="#ff333d" />
            <stop offset="60%" stop-color="#e21b23" />
            <stop offset="100%" stop-color="#ff222d" />
          </linearGradient>
          <linearGradient id="streamSlashSpineHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
            <stop offset="40%" stop-color="#ff9ea4" />
            <stop offset="75%" stop-color="#ff222d" />
            <stop offset="100%" stop-color="#8a0308" stop-opacity="0.5" />
          </linearGradient>
          <filter id="streamSlashNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
        <span class="text-[10px] text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span>👥</span> SOBREVIVENTES NA MESA (${effectiveParticipants.length})
        </span>
        <span class="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          SINCRONIZADO
        </span>
      </div>
      <div class="stream-portrait-gallery" id="stream-portrait-gallery">
        ${effectiveParticipants.map(p => this.renderStreamPortraitCardHTML(p)).join('')}
      </div>
    `;
  }

  // ------------------------------------------------------------
  // MODO CINEMÁTICO DO MESTRE
  // ------------------------------------------------------------
  getCinematicStageHTML() {
    const s = this.cinematicScene;
    return `
      <div class="relative w-full h-full min-h-[460px] bg-black border border-[#e21b23]/50 flex flex-col justify-end p-6 overflow-hidden shadow-[0_0_50px_rgba(226,27,35,0.2)] animate-fadeIn">
        <img src="${s.url}" class="absolute inset-0 w-full h-full object-cover opacity-60 filter contrast-125" />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>

        ${this.isGm ? `
          <div class="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button id="vtt-btn-close-scene" class="px-3 py-1 bg-black/80 hover:bg-[#ff333d] border border-white/20 text-xs text-white font-mono cursor-pointer transition-all">
              ✕ ENCERRAR APRESENTAÇÃO
            </button>
          </div>
        ` : ''}

        <div class="relative z-10 flex flex-col gap-1 max-w-2xl">
          <span class="text-[10px] text-[#e21b23] font-mono uppercase tracking-widest font-bold">
            [ CENA EM TRANSMISSÃO // CONDUTOR ]
          </span>
          <h2 class="font-serif font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
            ${this.escapeHTML(s.title)}
          </h2>
          ${s.description ? `
            <p class="text-xs sm:text-sm text-[#cbd0dc] font-liturgical italic mt-1 leading-relaxed">
              "${this.escapeHTML(s.description)}"
            </p>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // COLUNA DIREITA: CHAT DA SESSÃO & HISTÓRICO DE DADOS
  // ------------------------------------------------------------
  getRightSidebarHTML() {
    return `
      <!-- Cabeçalho do Chat -->
      <div class="p-2 sm:p-2.5 bg-[#0a0d14] border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-1.5">
          <span class="text-xs">💬</span>
          <span class="font-serif font-bold text-xs uppercase text-white tracking-wide">REGISTRO DA SESSÃO</span>
        </div>
        <span class="text-[9px] text-[#8e95a5] font-mono">${this.chatMessages.length} eventos</span>
      </div>

      <!-- Feed de Mensagens Rolável -->
      <div id="vtt-chat-feed" class="flex-1 p-2 sm:p-3 overflow-y-auto space-y-2 min-h-0">
        ${this.getChatFeedHTML()}
      </div>

      <!-- Indicador de Digitação -->
      <div id="vtt-typing-indicator" class="hidden px-3 py-0.5 text-[9px] text-[#06b6d4] font-mono italic bg-black/60 border-t border-white/5"></div>

      <!-- Barra Inferior de Entrada de Mensagem -->
      <div class="p-2 bg-[#0a0d14] border-t border-white/10 flex flex-col gap-1.5 flex-shrink-0">
        <div class="flex items-center justify-between text-[9px] font-mono text-[#8e95a5]">
          <span>Canal:</span>
          <select id="vtt-chat-visibility" class="bg-black border border-white/10 text-[#cbd0dc] text-[9px] px-1 py-0.5 outline-none">
            <option value="public">Público (Todos)</option>
            <option value="private_gm">Sussurro ao Mestre</option>
            ${this.isGm ? '<option value="gm_narrative">Narrativa do Mestre</option>' : ''}
          </select>
        </div>
        <div class="flex items-center gap-1.5">
          <input 
            type="text" 
            id="vtt-chat-input" 
            placeholder="Digite sua fala ou ação..." 
            class="flex-1 bg-black border border-white/20 focus:border-[#e21b23] text-xs text-white px-2 py-1.5 outline-none font-sans"
            autocomplete="off"
          />
          <button id="vtt-btn-send-chat" class="px-3 py-1.5 bg-[#e21b23] hover:bg-[#ff333d] text-black font-bold text-xs cursor-pointer transition-all">
            ➤
          </button>
        </div>
      </div>
    `;
  }

  getChatFeedHTML() {
    return this.chatMessages.map(msg => {
      if (msg.type === 'system') {
        return `
          <div class="p-2 bg-[#0e121a] border-l-2 border-[#06b6d4] text-[10px] text-[#cbd0dc] font-mono">
            <span class="text-white/40 text-[9px] block">${msg.timestamp}</span>
            <span>${this.escapeHTML(msg.text)}</span>
          </div>
        `;
      }

      if (msg.type === 'roll') {
        const isCrit = msg.isCrit;
        const isFumble = msg.isFumble;
        const authorName = msg.author?.name || msg.author?.characterName || msg.senderName || 'Agente';
        const isGmAuthor = msg.author?.isGm || msg.isGm;

        return `
          <div class="p-2.5 bg-black/60 border ${isCrit ? 'border-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.4)]' : isFumble ? 'border-[#ff333d] shadow-[0_0_15px_rgba(255,51,61,0.4)]' : 'border-white/10'} flex flex-col gap-1.5 font-mono">
            <div class="flex items-center justify-between text-[9px] text-[#8e95a5] border-b border-white/5 pb-1">
              <div class="flex items-center gap-1">
                <span>🎲</span>
                <span class="font-bold ${isGmAuthor ? 'text-[#ff333d]' : 'text-white'}">${this.escapeHTML(authorName)}</span>
              </div>
              <span>${msg.timestamp}</span>
            </div>
            <div class="flex items-baseline justify-between gap-2">
              <span class="text-xs font-serif font-bold text-white uppercase truncate">${this.escapeHTML(msg.label || 'Rolagem')}</span>
              <span class="text-[10px] text-white/40">${msg.formula || '1d20'}</span>
            </div>
            <div class="flex items-baseline justify-between pt-1 border-t border-white/5">
              <span class="text-[10px] text-[#8e95a5]">${(msg.rolls || []).join(' + ')} ${msg.modifier ? (msg.modifier >= 0 ? '+' + msg.modifier : msg.modifier) : ''}</span>
              <span class="text-base font-black ${isCrit ? 'text-[#06b6d4]' : isFumble ? 'text-[#ff333d]' : 'text-white'}">
                ${msg.isMasked ? '???' : 'TOTAL: ' + msg.total}
              </span>
            </div>
          </div>
        `;
      }

      // Mensagem de Texto Normal ou Narrativa do Mestre
      const isGm = msg.author?.isGm || msg.isGm;
      const isNarrative = msg.messageType === 'gm_narrative';
      const author = msg.author?.characterName || msg.author?.name || msg.senderName || 'Agente';

      return `
        <div class="p-2 ${isNarrative ? 'bg-[#150a0d] border-l-2 border-[#e21b23]' : 'bg-black/40 border border-white/5'} flex flex-col gap-0.5">
          <div class="flex items-center justify-between text-[9px]">
            <span class="font-bold ${isGm ? 'text-[#ff333d]' : 'text-[#06b6d4]'}">${this.escapeHTML(author)}</span>
            <span class="text-[#8e95a5] text-[8px] font-mono">${msg.timestamp}</span>
          </div>
          <p class="text-xs ${isNarrative ? 'text-white font-serif italic text-sm' : 'text-[#cbd0dc]'} leading-relaxed break-words">
            ${this.escapeHTML(msg.text)}
          </p>
        </div>
      `;
    }).join('');
  }

  // ------------------------------------------------------------
  // DOCK INFERIOR DE DADOS
  // ------------------------------------------------------------
  getDiceDockHTML() {
    const diceTypes = [4, 6, 8, 10, 12, 20, 100];
    return `
      <div class="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
        ${diceTypes.map(sides => `
          <button class="vtt-btn-dice-type px-2.5 py-1 text-xs font-mono font-bold transition-all cursor-pointer ${this.selectedDiceType === sides ? 'bg-[#e21b23] text-black shadow-[0_0_10px_#e21b23]' : 'bg-black border border-white/20 text-[#cbd0dc] hover:border-white'}" data-sides="${sides}">
            d${sides}
          </button>
        `).join('')}
      </div>

      <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-xs font-mono">
        <!-- Quantidade -->
        <div class="flex items-center bg-black border border-white/20">
          <span class="px-2 text-[9px] text-[#8e95a5]">QTD:</span>
          <button id="vtt-btn-qty-dec" class="px-1.5 py-0.5 hover:bg-white/10 text-white cursor-pointer">-</button>
          <span id="vtt-dice-qty-val" class="px-2 font-bold text-white">${this.diceQuantity}</span>
          <button id="vtt-btn-qty-inc" class="px-1.5 py-0.5 hover:bg-white/10 text-white cursor-pointer">+</button>
        </div>

        <!-- Modificador -->
        <div class="flex items-center bg-black border border-white/20">
          <span class="px-2 text-[9px] text-[#8e95a5]">MOD:</span>
          <button id="vtt-btn-mod-dec" class="px-1.5 py-0.5 hover:bg-white/10 text-white cursor-pointer">-</button>
          <span id="vtt-dice-mod-val" class="px-2 font-bold ${this.diceModifier >= 0 ? 'text-white' : 'text-[#ff333d]'}">
            ${this.diceModifier >= 0 ? '+' + this.diceModifier : this.diceModifier}
          </span>
          <button id="vtt-btn-mod-inc" class="px-1.5 py-0.5 hover:bg-white/10 text-white cursor-pointer">+</button>
        </div>

        <!-- Visibilidade da Rolagem -->
        <div class="hidden md:flex items-center bg-black border border-white/20">
          <select id="vtt-select-visibility" class="bg-transparent text-[#cbd0dc] text-[10px] px-2 py-1 outline-none">
            <option value="public" ${this.diceRollVisibility === 'public' ? 'selected' : ''}>Pública</option>
            <option value="private_gm" ${this.diceRollVisibility === 'private_gm' ? 'selected' : ''}>Para o Mestre</option>
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

    // 1. Eventos da Coluna Esquerda (Isolados para evitar acúmulo de listeners)
    this.setupLeftSidebarEvents(root.querySelector('#vtt-left-sidebar'));

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
    root.querySelector('#vtt-btn-toggle-gm-mode')?.addEventListener('click', () => this.handleToggleGmMode());

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

    // 9. Inicializa e Anexa Eventos do Dock de Dados (Unificado)
    this.renderDiceDockOnly();

    // ============================================================
    // 18. INTERAÇÕES DE INICIATIVA & COMBATE
    // ============================================================

    // Rolagem da própria iniciativa pelo Jogador
    root.querySelectorAll('.vtt-btn-roll-my-initiative').forEach(btn => {
      btn.addEventListener('click', () => {
        this.executeRollMyInitiative();
      });
    });

    // Mestre rola para todos os combatentes pendentes
    root.querySelector('#vtt-btn-gm-roll-all')?.addEventListener('click', () => {
      this.executeGmRollAllPending();
    });
    root.querySelector('#vtt-btn-center-roll-all')?.addEventListener('click', () => {
      this.executeGmRollAllPending();
    });

    // Mestre inicia a 1ª Rodada (ordena decrescente e ativa os turnos)
    root.querySelector('#vtt-btn-start-turns')?.addEventListener('click', () => {
      this.startCombatTurns();
    });
    root.querySelector('#vtt-btn-center-start-turns')?.addEventListener('click', () => {
      this.startCombatTurns();
    });

    // Mestre rola individualmente para um combatente específico
    root.querySelectorAll('.vtt-btn-roll-actor-inic').forEach(btn => {
      btn.addEventListener('click', () => {
        const actorId = btn.dataset.id;
        if (actorId) this.executeGmRollActorInitiative(actorId);
      });
    });

    // Controles de Avanço de Turno do Mestre
    root.querySelector('#vtt-btn-prev-turn')?.addEventListener('click', () => this.advanceTurn(-1));
    root.querySelector('#vtt-btn-next-turn')?.addEventListener('click', () => this.advanceTurn(1));
    root.querySelector('#vtt-btn-center-prev-turn')?.addEventListener('click', () => this.advanceTurn(-1));
    root.querySelector('#vtt-btn-center-next-turn')?.addEventListener('click', () => this.advanceTurn(1));

    // Botões para Iniciar / Encerrar Combate
    const openCombatSetup = () => this.openCombatSetupModal();
    root.querySelector('#vtt-btn-toggle-combat')?.addEventListener('click', () => this.handleToggleCombat());
    root.querySelector('#vtt-btn-init-combat-empty')?.addEventListener('click', openCombatSetup);
    root.querySelector('#vtt-btn-center-init-combat')?.addEventListener('click', openCombatSetup);
    root.querySelector('#vtt-btn-gm-init-combat')?.addEventListener('click', openCombatSetup);

    root.querySelector('#vtt-btn-clear-initiative')?.addEventListener('click', () => this.handleClearInitiative());

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
    root.querySelector('#vtt-btn-edit-campaign-top')?.addEventListener('click', () => this.handleEditCampaign());
    root.querySelector('#vtt-btn-gm-campaign-edit')?.addEventListener('click', () => this.handleEditCampaign());
    root.querySelector('#vtt-btn-edit-tactical-notes')?.addEventListener('click', () => this.handleEditTacticalNotes());
    root.querySelector('#vtt-btn-gm-notes')?.addEventListener('click', () => this.handleEditTacticalNotes());

    // 23. Ações do Painel do Mestre
    root.querySelector('#vtt-btn-gm-scene')?.addEventListener('click', () => this.promptGmScene());
    root.querySelector('#vtt-btn-gm-secret-roll')?.addEventListener('click', () => this.executeGmSecretRoll());
    root.querySelector('#vtt-btn-gm-pause')?.addEventListener('click', () => {
      this.sessionData.status = this.sessionData.status === 'paused' ? 'active' : 'paused';
      localStorage.setItem('paroxismo_session_status', this.sessionData.status);
      if (this.sync) {
        this.sync.sendSessionState({ status: this.sessionData.status });
        this.sync.sendSystemEvent(this.sessionData.status === 'paused' ? 'O Mestre pausou a sessão.' : 'O Mestre retomou a sessão.');
      }
      this.renderHeaderOnly();
    });

    root.querySelector('#vtt-btn-gm-sys-msg')?.addEventListener('click', () => this.handleBroadcastSystemMsg());

    root.querySelector('#vtt-btn-close-scene')?.addEventListener('click', () => {
      this.cinematicScene = null;
      if (this.sync) {
        this.sync.sendScenePresentation(null, false);
      }
      this.renderCenterStageOnly();
    });

    // 24. Interações dos Portraits da Mesa
    this.setupParticipantsSummaryEvents(root.querySelector('#vtt-center-participants-summary'));
  }

  // ============================================================
  // MODAL DE AUTENTICAÇÃO DO MESTRE COM SENHA
  // ============================================================
  openGmPasswordModal() {
    const container = this.container.querySelector('#vtt-gm-auth-modal-container');
    if (!container) return;

    soundFX.playRuneClick();

    container.innerHTML = `
      <div class="relative w-full max-w-md bg-[#07090e] border-2 border-[#e21b23] p-5 flex flex-col gap-4 text-white shadow-[0_0_50px_rgba(226,27,35,0.4)] animate-fadeIn">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-[#e21b23]">✠</span>
            <span class="font-serif font-black text-base uppercase">CHAVE DE ACESSO DO CONDUTOR</span>
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
  // PREPARAÇÃO DE COMBATE (MESTRE ADICIONA AMEAÇAS & ABRE INICIATIVAS)
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

          <!-- Seção 1: Agentes Conectados -->
          <div class="flex flex-col gap-2">
            <span class="text-[10px] text-[#06b6d4] font-bold uppercase tracking-wider">1. AGENTES CONECTADOS NA MESA</span>
            <div class="p-2.5 bg-black/50 border border-white/10 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="text-emerald-400">●</span>
                <span class="font-bold text-white">${this.escapeHTML(this.character?.name || 'Agente')}</span>
                <span class="text-[9px] text-[#8e95a5]">(${this.escapeHTML(this.character?.concept || 'Sobrevivente')})</span>
              </div>
              <span class="text-[10px] text-[#8e95a5] font-mono">Bônus Inic: +${(this.character?.attributes?.agi || 2) + (this.character?.trainedSkills?.includes('iniciativa') ? 2 : 0)}</span>
            </div>
          </div>

          <!-- Seção 2: Adicionar Ameaças / Inimigos -->
          <div class="flex flex-col gap-2">
            <span class="text-[10px] text-[#e21b23] font-bold uppercase tracking-wider">2. AMEAÇAS / INIMIGOS</span>
            
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
                    <button class="combat-remove-enemy text-white/30 hover:text-[#ff333d] cursor-pointer" data-idx="${idx}">×</button>
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

          <!-- Seção 3: Botão de Abrir Fase de Iniciativas -->
          <div class="pt-3 border-t border-white/10 flex items-center justify-between">
            <button id="vtt-btn-cancel-combat-modal" class="px-3 py-1.5 bg-black border border-white/20 text-white text-xs cursor-pointer">
              CANCELAR
            </button>
            <button id="vtt-btn-open-init-phase" class="px-4 py-2 bg-[#e21b23] hover:bg-[#ff333d] text-black font-black text-xs tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(226,27,35,0.4)] cursor-pointer">
              <span>⚔</span>
              <span>INICIAR COMBATE & ABRIR INICIATIVAS</span>
            </button>
          </div>
        </div>
      `;

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

      container.querySelector('#vtt-btn-open-init-phase')?.addEventListener('click', () => {
        this.openInitiativePhase();
        close();
      });
    };

    renderModalContent();
    container.classList.remove('hidden');
  }

  // ============================================================
  // INICIAÇÃO DO COMBATE (FASE DE INICIATIVAS MANUAIS)
  // ============================================================
  openInitiativePhase() {
    soundFX.playSealBreak();

    const list = [];

    // 1. Adiciona o Agente local (sem rolar automaticamente)
    const agentBonus = (this.character?.attributes?.agi || 2) + (this.character?.trainedSkills?.includes('iniciativa') ? 2 : 0);
    list.push({
      id: 'actor_' + this.user.id,
      userId: this.user.id,
      name: this.character?.name || 'Agente',
      bonus: agentBonus,
      initiative: null, // Pendente!
      rolled: false,
      isNpc: false,
      currentPv: this.character?.currentPv || 20,
      maxPv: 20
    });

    // 2. Adiciona outros participantes conectados na sala
    if (this.sync) {
      for (const [uid, p] of this.sync.participants.entries()) {
        if (uid !== this.user.id) {
          list.push({
            id: 'actor_' + uid,
            userId: uid,
            name: p.character?.name || p.user.name || 'Agente',
            bonus: 2,
            initiative: null, // Pendente!
            rolled: false,
            isNpc: false,
            currentPv: p.character?.currentPv || 20,
            maxPv: 20
          });
        }
      }
    }

    // 3. Adiciona as ameaças/inimigos cadastrados pelo Mestre
    this.pendingEnemies.forEach((en, i) => {
      list.push({
        id: 'actor_npc_' + Date.now() + '_' + i,
        name: en.name,
        bonus: en.bonus,
        initiative: null, // Pendente!
        rolled: false,
        isNpc: true,
        currentPv: en.pv || 30,
        maxPv: en.pv || 30
      });
    });

    this.initiativeList = list;
    this.combatActive = true;
    this.combatPhase = 'initiative'; // 'initiative' = esperando rolagens
    this.combatRound = 1;
    this.activeTurnIndex = 0;

    localStorage.setItem('paroxismo_initiative_list_v1', JSON.stringify(this.initiativeList));
    localStorage.setItem('paroxismo_combat_active', 'true');
    localStorage.setItem('paroxismo_combat_phase', 'initiative');
    localStorage.setItem('paroxismo_combat_round', '1');
    localStorage.setItem('paroxismo_combat_turn', '0');

    this.syncInitiative();

    if (this.sync) {
      this.sync.sendSystemEvent('⚔ COMBATE INICIADO! A fase de iniciativas começou. Todos os jogadores devem rolar a iniciativa de seus agentes!');
    }
  }

  // ============================================================
  // ROLAGEM MANUAL DA INICIATIVA PELO PRÓPRIO JOGADOR
  // ============================================================
  executeRollMyInitiative() {
    const actor = this.initiativeList.find(a => a.userId === this.user.id) || 
                  this.initiativeList.find(a => !a.isNpc && a.name === (this.character?.name || 'Agente'));

    if (!actor || actor.rolled) return;

    soundFX.playDiceRoll();

    DiceAnimator.roll({
      sides: 20,
      label: 'Iniciativa: ' + actor.name
    }).then(({ rolledValue }) => {
      const bonus = actor.bonus || 0;
      const total = rolledValue + bonus;
      actor.initiative = total;
      actor.rolled = true;

      localStorage.setItem('paroxismo_initiative_list_v1', JSON.stringify(this.initiativeList));

      if (this.sync) {
        this.sync.sendChatMessage(`🎲 [INICIATIVA] ${actor.name} rolou 1d20 (${rolledValue}) ${bonus >= 0 ? '+' + bonus : bonus} = TOTAL: ${total}!`, 'normal', 'public');
        this.sync.sendInitiativeRoll(actor.id, total, rolledValue, bonus, actor.name);
      }

      this.renderInitiativeListOnly();
      this.renderCenterCombatSummary();
    });
  }

  // ============================================================
  // MESTRE: ROLA INICIATIVA DE UM COMBATENTE ESPECÍFICO
  // ============================================================
  executeGmRollActorInitiative(actorId) {
    const actor = this.initiativeList.find(a => a.id === actorId);
    if (!actor || actor.rolled) return;

    soundFX.playDiceRoll();

    const roll = Math.floor(Math.random() * 20) + 1;
    const bonus = actor.bonus || 0;
    const total = roll + bonus;

    actor.initiative = total;
    actor.rolled = true;

    localStorage.setItem('paroxismo_initiative_list_v1', JSON.stringify(this.initiativeList));

    if (this.sync) {
      this.sync.sendChatMessage(`🎲 [Mestre] Rolou Iniciativa para ${actor.name}: 1d20 (${roll}) ${bonus >= 0 ? '+' + bonus : bonus} = TOTAL: ${total}!`, 'normal', 'public');
    }

    this.syncInitiative();
  }

  // ============================================================
  // MESTRE: ROLA DE TODOS OS PENDENTES DE UMA VEZ
  // ============================================================
  executeGmRollAllPending() {
    const pendentes = this.initiativeList.filter(a => a.initiative === null);
    if (pendentes.length === 0) return;

    soundFX.playDiceRoll();

    pendentes.forEach(actor => {
      const roll = Math.floor(Math.random() * 20) + 1;
      const bonus = actor.bonus || 0;
      const total = roll + bonus;

      actor.initiative = total;
      actor.rolled = true;

      if (this.sync) {
        this.sync.sendChatMessage(`🎲 [Mestre] Rolou Iniciativa para ${actor.name}: 1d20 (${roll}) ${bonus >= 0 ? '+' + bonus : bonus} = TOTAL: ${total}!`, 'normal', 'public');
      }
    });

    localStorage.setItem('paroxismo_initiative_list_v1', JSON.stringify(this.initiativeList));
    this.syncInitiative();
  }

  // ============================================================
  // MESTRE: COMEÇA A RODADA DE TURNOS (ORDENA E ATIVA)
  // ============================================================
  startCombatTurns() {
    if (this.initiativeList.length === 0) return;

    // Se alguém ainda não tiver iniciativa, gera um valor fallback
    this.initiativeList.forEach(a => {
      if (a.initiative === null || a.initiative === undefined) {
        const roll = Math.floor(Math.random() * 20) + 1;
        a.initiative = roll + (a.bonus || 0);
        a.rolled = true;
      }
    });

    // Ordena decrescentemente por iniciativa
    this.initiativeList.sort((a, b) => (b.initiative || 0) - (a.initiative || 0));

    this.combatPhase = 'turns';
    this.combatRound = 1;
    this.activeTurnIndex = 0;

    localStorage.setItem('paroxismo_initiative_list_v1', JSON.stringify(this.initiativeList));
    localStorage.setItem('paroxismo_combat_phase', 'turns');
    localStorage.setItem('paroxismo_combat_round', '1');
    localStorage.setItem('paroxismo_combat_turn', '0');

    this.syncInitiative();

    if (this.sync) {
      const first = this.initiativeList[0];
      this.sync.sendSystemEvent(`⚔ 1ª Rodada iniciada! Primeiro a agir: ${first.name} (Iniciativa ${first.initiative})!`);
    }
  }

  advanceTurn(delta = 1) {
    if (this.initiativeList.length === 0) return;
    soundFX.playRuneClick();

    if (delta > 0) {
      if (this.activeTurnIndex + 1 >= this.initiativeList.length) {
        this.combatRound++;
        this.activeTurnIndex = 0;
        localStorage.setItem('paroxismo_combat_round', String(this.combatRound));
        if (this.sync) {
          this.sync.sendSystemEvent(`⚔ Rodada ${this.combatRound} iniciada!`);
        }
      } else {
        this.activeTurnIndex++;
      }
    } else {
      this.activeTurnIndex = Math.max(0, this.activeTurnIndex - 1);
    }

    localStorage.setItem('paroxismo_combat_turn', String(this.activeTurnIndex));

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
    let modal = document.getElementById('vtt-sheet-modal');
    if (!modal && this.container) {
      modal = this.container.querySelector('#vtt-sheet-modal');
    }
    if (!modal) return;

    // Garante que o modal esteja anexado diretamente ao document.body para não ser afetado por transforms do SPA
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    const content = modal.querySelector('#vtt-sheet-modal-content');
    if (!content) return;

    soundFX.playRuneClick();
    modal.classList.remove('hidden');

    content.innerHTML = '<div id="foundry-sheet-mount"></div>';

    // Monta a Ficha Completa
    new CharacterSheet('foundry-sheet-mount');

    // Listener garantido no botão de fechar mesmo após teleporte para body
    const closeBtn = modal.querySelector('#vtt-btn-close-sheet-modal');
    if (closeBtn && !closeBtn._modalCloseAttached) {
      closeBtn._modalCloseAttached = true;
      closeBtn.addEventListener('click', () => {
        this.closeCharacterSheetModal();
      });
    }
  }

  closeCharacterSheetModal() {
    const modal = document.getElementById('vtt-sheet-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    soundFX.playRuneClick();

    // Recarrega dossiê e atualiza a aba Meu Agente e o Palco Central
    this.character = getCharacterDossier();
    if (this.sync) {
      this.sync.character = this.character;
      this.sync.broadcastPresence('online');
    }
    this.renderLeftSidebarOnly();
    this.renderParticipantsSummaryOnly();
  }

  // ============================================================
  // EXECUÇÃO DE ROLAGENS COM MOTOR 3D (THREE.JS + CANNON.JS)
  // ============================================================
  executeDockRoll() {
    if (this._isRollingDock) return;
    this._isRollingDock = true;

    const sides = this.selectedDiceType;
    const qty = this.diceQuantity;
    const mod = this.diceModifier;
    const vis = this.diceRollVisibility;
    const label = `Rolagem ${qty}d${sides}`;

    soundFX.playDiceRoll();

    DiceAnimator.roll({
      sides: sides === 100 ? 10 : sides,
      quantity: qty,
      label: label
    }).then(({ rolledValue, rolls, sum, isCrit, isFumble }) => {
      const actualRolls = (Array.isArray(rolls) && rolls.length > 0) ? rolls : [rolledValue];
      const sumRolls = (typeof sum === 'number') ? sum : actualRolls.reduce((a, b) => a + b, 0);
      const total = sumRolls + mod;

      const rollPayload = {
        label,
        formula: `${qty}d${sides}${mod ? (mod >= 0 ? '+' + mod : mod) : ''}`,
        rolls: actualRolls,
        modifier: mod,
        total,
        isCrit: Boolean(isCrit || (sides === 20 && actualRolls.includes(20))),
        isFumble: Boolean(isFumble || (sides === 20 && actualRolls.every(r => r === 1))),
        visibility: vis
      };

      if (this.sync) {
        this.sync.sendDiceRoll(rollPayload);
      }
    }).finally(() => {
      setTimeout(() => {
        this._isRollingDock = false;
      }, 600);
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

    // Interpreta fórmula ex: "2d6+2" ou "1d8"
    let qty = 1;
    let sides = 8;
    let mod = 0;
    const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/i);
    if (match) {
      qty = parseInt(match[1], 10) || 1;
      sides = parseInt(match[2], 10) || 8;
      if (match[3]) mod = parseInt(match[3], 10) || 0;
    }

    DiceAnimator.roll({
      sides: sides,
      quantity: qty,
      label: `Dano (${weaponName})`
    }).then(({ rolledValue, rolls, sum }) => {
      const actualRolls = (Array.isArray(rolls) && rolls.length > 0) ? rolls : [rolledValue];
      const sumRolls = (typeof sum === 'number') ? sum : actualRolls.reduce((a, b) => a + b, 0);
      const total = sumRolls + mod;
      const rollPayload = {
        label: `Dano (${weaponName})`,
        formula: formula,
        rolls: actualRolls,
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
    const curPe = (typeof this.character.currentPe === 'number' && !isNaN(this.character.currentPe)) ? this.character.currentPe : 3;
    if (curPe < cost) {
      this.showConfirmModal({
        title: 'ESFORÇO INSUFICIENTE',
        message: `Pontos de Esforço insuficientes para conjurar ${ritualName}! Exige ${cost} PE (disponível: ${curPe} PE).`,
        confirmText: 'ENTENDIDO',
        cancelText: ''
      });
      return;
    }

    this.character.currentPe = Math.max(0, curPe - cost);
    saveCharacterDossier(this.character);
    if (this.sync) {
      this.sync.character = this.character;
      this.sync.broadcastPresence('online');
    }
    if (typeof soundFX.playSealBreak === 'function') soundFX.playSealBreak();
    else soundFX.playRuneClick();

    if (this.sync) {
      this.sync.sendChatMessage(`🔮 Conjurou o ritual [ ${ritualName} ] gastando ${cost} PE!`, 'normal', 'public');
    }

    this.renderLeftSidebarOnly();
    this.renderParticipantsSummaryOnly();
  }

  executeGmSecretRoll() {
    soundFX.playDiceRoll();

    DiceAnimator.roll({
      sides: 20,
      label: 'Rolagem Secreta (Mestre)'
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

  async promptGmScene() {
    const res = await this.showPromptModal({
      title: 'APRESENTAR CENA CINEMÁTICA',
      description: 'Projete uma cena atmosférica com banner e narrativa no palco central de todos os agentes.',
      fields: [
        { id: 'title', label: 'Título da Cena', value: this.cinematicScene?.title || 'O Altar do Avesso', placeholder: 'Ex: A Cripta Subterrânea' },
        { id: 'url', label: 'URL ou Caminho da Imagem', value: this.cinematicScene?.url || 'assets/images/hero_banner.jpg', placeholder: 'assets/images/hero_banner.jpg' },
        { id: 'desc', label: 'Descrição Atmosférica', value: this.cinematicScene?.description || '', multiline: true, placeholder: 'O ar gélido reverbera na escuridão...' }
      ],
      confirmText: 'PROJETAR CENA'
    });

    if (res && res.title && res.title.trim()) {
      this.cinematicScene = {
        title: res.title.trim(),
        url: res.url?.trim() || 'assets/images/hero_banner.jpg',
        description: res.desc?.trim() || ''
      };
      if (this.sync) {
        this.sync.sendScenePresentation(this.cinematicScene, true);
      }
      this.renderCenterStageOnly();
    }
  }

  async promptAddHandout() {
    const res = await this.showPromptModal({
      title: 'CADASTRAR NOVA PISTA / DOCUMENTO',
      description: 'Cadastre um documento, mapa ou pista física e revele imediatamente para os agentes conectados.',
      fields: [
        { id: 'title', label: 'Título do Documento / Pista', placeholder: 'Ex: Diário do Cultista' },
        { id: 'category', label: 'Categoria (documento, mapa, pista, criatura)', value: 'documento' },
        { id: 'imageUrl', label: 'URL da Imagem (Opcional)', placeholder: 'https://... ou assets/...' },
        { id: 'content', label: 'Conteúdo ou Descrição da Pista', multiline: true, placeholder: 'Digite os detalhes ou transcrição...' }
      ],
      confirmText: 'CADASTRAR E REVELAR'
    });

    if (res && res.title && res.title.trim()) {
      const newH = {
        id: 'hnd_' + Date.now(),
        title: res.title.trim(),
        category: res.category?.trim() || 'documento',
        imageUrl: res.imageUrl?.trim() || '',
        content: res.content?.trim() || '',
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
  }

  syncInitiative() {
    if (this.sync) {
      this.sync.sendInitiativeUpdate(
        this.initiativeList, 
        this.activeTurnIndex, 
        this.combatActive, 
        this.combatRound, 
        this.combatPhase
      );
    }
    this.renderInitiativeListOnly();
    this.renderCenterCombatSummary();
  }

  // ============================================================
  // MODAIS E HELPERS DE ATUALIZAÇÃO PARCIAL (SEM RECARREGAR)
  // ============================================================

  // ============================================================
  // MODAIS IN-APP PERSONALIZADOS (DARK FANTASY / TERMINAL CAD)
  // Substitui 100% dos prompts, confirms e alerts nativos do navegador
  // Compatibilidade absoluta com Discord Activities e iframes
  // ============================================================

  showConfirmModal({
    title = "CONFIRMAÇÃO",
    message = "Tem certeza?",
    confirmText = "CONFIRMAR",
    cancelText = "CANCELAR",
    danger = false
  } = {}) {
    return new Promise((resolve) => {
      let container = document.getElementById('vtt-generic-modal-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'vtt-generic-modal-container';
        container.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md';
        document.body.appendChild(container);
      }

      soundFX.playRuneClick();

      container.innerHTML = `
        <div class="relative w-full max-w-md bg-[#07090e] border-2 ${danger ? 'border-[#ff333d] shadow-[0_0_40px_rgba(255,51,61,0.3)]' : 'border-[#e21b23] shadow-[0_0_40px_rgba(226,27,35,0.3)]'} p-5 flex flex-col gap-4 text-white animate-fadeIn">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div class="flex items-center gap-2">
              <span class="${danger ? 'text-[#ff333d]' : 'text-[#e21b23]'}">⚠</span>
              <span class="font-serif font-black text-sm uppercase tracking-wider">${this.escapeHTML(title)}</span>
            </div>
            <button id="vtt-btn-modal-close-x" class="text-white/40 hover:text-white text-xs cursor-pointer font-mono">[ × ]</button>
          </div>

          <p class="text-xs text-[#cbd0dc] leading-relaxed font-mono whitespace-pre-wrap">${this.escapeHTML(message)}</p>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            ${cancelText ? `
              <button id="vtt-btn-modal-cancel" class="px-3 py-1.5 bg-black border border-white/20 hover:border-white/40 text-white font-mono text-xs cursor-pointer">
                ${this.escapeHTML(cancelText)}
              </button>
            ` : ''}
            <button id="vtt-btn-modal-confirm" class="px-4 py-1.5 ${danger ? 'bg-[#ff333d] hover:bg-red-600' : 'bg-[#e21b23] hover:bg-[#ff333d]'} text-black font-black font-mono text-xs cursor-pointer">
              ${this.escapeHTML(confirmText)}
            </button>
          </div>
        </div>
      `;

      container.classList.remove('hidden');

      const cleanup = (result) => {
        soundFX.playRuneClick();
        container.classList.add('hidden');
        container.innerHTML = '';
        resolve(result);
      };

      container.querySelector('#vtt-btn-modal-confirm')?.addEventListener('click', () => cleanup(true));
      container.querySelector('#vtt-btn-modal-cancel')?.addEventListener('click', () => cleanup(false));
      container.querySelector('#vtt-btn-modal-close-x')?.addEventListener('click', () => cleanup(false));
    });
  }

  showPromptModal({
    title = "CONFIGURAÇÃO",
    description = "",
    fields = [],
    confirmText = "CONFIRMAR",
    cancelText = "CANCELAR"
  } = {}) {
    return new Promise((resolve) => {
      let container = document.getElementById('vtt-generic-modal-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'vtt-generic-modal-container';
        container.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md';
        document.body.appendChild(container);
      }

      soundFX.playRuneClick();

      const fieldsHTML = fields.map(f => {
        const inputType = f.type || 'text';
        const val = f.value ?? '';
        if (f.multiline) {
          return `
            <div class="flex flex-col gap-1">
              <label class="text-[10px] text-white/50 uppercase font-mono font-bold">${this.escapeHTML(f.label)}</label>
              <textarea id="prompt-field-${f.id}" rows="3" placeholder="${this.escapeHTML(f.placeholder || '')}" class="w-full bg-black border border-white/20 focus:border-[#e21b23] px-3 py-1.5 text-xs text-white outline-none font-mono resize-none">${this.escapeHTML(String(val))}</textarea>
            </div>
          `;
        }
        return `
          <div class="flex flex-col gap-1">
            <label class="text-[10px] text-white/50 uppercase font-mono font-bold">${this.escapeHTML(f.label)}</label>
            <input type="${inputType}" id="prompt-field-${f.id}" value="${this.escapeHTML(String(val))}" placeholder="${this.escapeHTML(f.placeholder || '')}" class="w-full bg-black border border-white/20 focus:border-[#e21b23] px-3 py-1.5 text-xs text-white outline-none font-mono" />
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="relative w-full max-w-md bg-[#07090e] border-2 border-[#e21b23] shadow-[0_0_40px_rgba(226,27,35,0.3)] p-5 flex flex-col gap-4 text-white animate-fadeIn max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div class="flex items-center gap-2">
              <span class="${this.escapeHTML(title).includes('TRANSMISSÃO') ? 'text-amber-400' : 'text-[#e21b23]'}">⌨</span>
              <span class="font-serif font-black text-sm uppercase tracking-wider">${this.escapeHTML(title)}</span>
            </div>
            <button id="vtt-btn-prompt-close-x" class="text-white/40 hover:text-white text-xs cursor-pointer font-mono">[ × ]</button>
          </div>

          ${description ? `<p class="text-xs text-[#8e95a5] font-mono leading-relaxed">${this.escapeHTML(description)}</p>` : ''}

          <form id="vtt-prompt-form" class="flex flex-col gap-3">
            ${fieldsHTML}

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button type="button" id="vtt-btn-prompt-cancel" class="px-3 py-1.5 bg-black border border-white/20 hover:border-white/40 text-white font-mono text-xs cursor-pointer">
                ${this.escapeHTML(cancelText)}
              </button>
              <button type="submit" id="vtt-btn-prompt-submit" class="px-4 py-1.5 bg-[#e21b23] hover:bg-[#ff333d] text-black font-black font-mono text-xs cursor-pointer">
                ${this.escapeHTML(confirmText)}
              </button>
            </div>
          </form>
        </div>
      `;

      container.classList.remove('hidden');

      setTimeout(() => {
        const firstInput = container.querySelector('input, textarea');
        firstInput?.focus();
        if (firstInput && typeof firstInput.select === 'function') firstInput.select();
      }, 50);

      const cleanup = (data) => {
        soundFX.playRuneClick();
        container.classList.add('hidden');
        container.innerHTML = '';
        resolve(data);
      };

      container.querySelector('#vtt-btn-prompt-cancel')?.addEventListener('click', () => cleanup(null));
      container.querySelector('#vtt-btn-prompt-close-x')?.addEventListener('click', () => cleanup(null));

      container.querySelector('#vtt-prompt-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const results = {};
        fields.forEach(f => {
          const el = container.querySelector(`#prompt-field-${f.id}`);
          results[f.id] = el ? el.value : '';
        });
        cleanup(results);
      });
    });
  }

  async handleToggleGmMode() {
    if (this.isGm) {
      const ok = await this.showConfirmModal({
        title: 'DESATIVAR MODO MESTRE',
        message: 'Deseja realmente desativar as funções e privilégios de Mestre nesta sessão?',
        confirmText: 'DESATIVAR',
        danger: true
      });
      if (ok) {
        this.isGm = false;
        this.app?.setGmMode(false);
        if (this.sync) this.sync.isGm = false;
        soundFX.playRuneClick();
        this.render();
      }
    } else {
      this.openGmPasswordModal();
    }
  }

  async handleToggleCombat() {
    if (this.combatActive) {
      const ok = await this.showConfirmModal({
        title: 'ENCERRAR COMBATE',
        message: 'Deseja realmente finalizar o combate em andamento e pausar a rodada de turnos?',
        confirmText: 'FINALIZAR',
        danger: true
      });
      if (ok) {
        this.combatActive = false;
        this.combatPhase = 'initiative';
        localStorage.setItem('paroxismo_combat_active', 'false');
        localStorage.setItem('paroxismo_combat_phase', 'initiative');
        this.syncInitiative();
        if (this.sync) this.sync.sendSystemEvent('O Mestre finalizou o combate.');
      }
    } else {
      this.openCombatSetupModal();
    }
  }

  async handleClearInitiative() {
    const ok = await this.showConfirmModal({
      title: 'LIMPAR INICIATIVAS',
      message: 'Deseja limpar todos os combatentes da ordem de iniciativa? Esta ação resetará a fila de turnos.',
      confirmText: 'LIMPAR TUDO',
      danger: true
    });
    if (ok) {
      this.initiativeList = [];
      this.activeTurnIndex = 0;
      this.combatActive = false;
      this.combatPhase = 'initiative';
      localStorage.removeItem('paroxismo_initiative_list_v1');
      localStorage.setItem('paroxismo_combat_active', 'false');
      localStorage.setItem('paroxismo_combat_phase', 'initiative');
      this.syncInitiative();
    }
  }

  async handleEditCampaign() {
    const res = await this.showPromptModal({
      title: 'DADOS DA SESSÃO & CAMPANHA',
      description: 'Atualize as informações da sessão para sincronização com todos os jogadores.',
      fields: [
        { id: 'name', label: 'Nome da Campanha', value: this.sessionData.campaignName, placeholder: 'Ex: Paroxismo: Cinzas do Passado' },
        { id: 'num', label: 'Número da Sessão', type: 'number', value: this.sessionData.sessionNumber, placeholder: '1' }
      ],
      confirmText: 'SALVAR DADOS'
    });
    if (res && res.name && res.name.trim()) {
      this.sessionData.campaignName = res.name.trim();
      this.sessionData.sessionNumber = parseInt(res.num, 10) || 1;
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
  }

  async handleEditTacticalNotes() {
    const res = await this.showPromptModal({
      title: 'DIRETRIZ TÁTICA DA EQUIPE',
      description: 'Defina a ordem tática ou objetivo atual a ser exibido no centro da mesa.',
      fields: [
        { id: 'notes', label: 'Diretriz / Objetivo', value: this.sessionData.tacticalNotes, multiline: true, placeholder: 'Ex: Investigar o mausoléu abandonado e conter o foco de contaminação.' }
      ],
      confirmText: 'DEFINIR DIRETRIZ'
    });
    if (res !== null && res.notes !== undefined) {
      this.sessionData.tacticalNotes = res.notes.trim();
      localStorage.setItem('paroxismo_tactical_notes', this.sessionData.tacticalNotes);
      if (this.sync) {
        this.sync.sendSessionState({ tacticalNotes: this.sessionData.tacticalNotes });
      }
      this.renderCenterStageOnly();
    }
  }

  async handleBroadcastSystemMsg() {
    const res = await this.showPromptModal({
      title: 'TRANSMISSÃO DO SISTEMA (MESTRE)',
      description: 'Transmita um aviso global para todos os jogadores na mesa.',
      fields: [
        { id: 'msg', label: 'Mensagem', multiline: true, placeholder: 'Ex: Um tremor ecoa pelo solo da cripta. Todos façam teste de Reflexos!' }
      ],
      confirmText: 'TRANSMITIR'
    });
    if (res && res.msg && res.msg.trim() && this.sync) {
      this.sync.sendSystemEvent(res.msg.trim());
    }
  }

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

  renderHeaderOnly() {
    const header = this.container.querySelector('#vtt-header');
    if (header) {
      header.innerHTML = this.getHeaderHTML();
      this.setupHeaderEvents();
    }
  }

  setupHeaderEvents() {
    const header = this.container.querySelector('#vtt-header');
    if (!header) return;

    header.querySelector('#vtt-btn-toggle-gm-mode')?.addEventListener('click', () => this.handleToggleGmMode());

    header.querySelector('#vtt-btn-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
      soundFX.playRuneClick();
    });

    header.querySelector('#vtt-btn-exit')?.addEventListener('click', () => {
      soundFX.playRuneClick();
      if (this.sync) this.sync.disconnect();
      window.location.hash = 'home';
    });
  }

  renderCenterStageOnly() {
    const stage = this.container.querySelector('#vtt-center-stage');
    if (stage) {
      stage.innerHTML = this.getCenterStageHTML();
      this.setupCenterStageEvents();
    }
  }

  setupCenterStageEvents() {
    const stage = this.container.querySelector('#vtt-center-stage');
    if (!stage) return;

    stage.querySelector('#vtt-btn-close-scene')?.addEventListener('click', () => {
      this.cinematicScene = null;
      if (this.sync) this.sync.sendScenePresentation(null, false);
      this.renderCenterStageOnly();
    });

    stage.querySelector('#vtt-btn-edit-campaign-top')?.addEventListener('click', () => this.handleEditCampaign());
    stage.querySelector('#vtt-btn-edit-tactical-notes')?.addEventListener('click', () => this.handleEditTacticalNotes());

    stage.querySelectorAll('.vtt-btn-roll-my-initiative').forEach(btn => {
      btn.addEventListener('click', () => this.executeRollMyInitiative());
    });
    stage.querySelector('#vtt-btn-center-roll-all')?.addEventListener('click', () => this.executeGmRollAllPending());
    stage.querySelector('#vtt-btn-center-start-turns')?.addEventListener('click', () => this.startCombatTurns());
    stage.querySelector('#vtt-btn-center-prev-turn')?.addEventListener('click', () => this.advanceTurn(-1));
    stage.querySelector('#vtt-btn-center-next-turn')?.addEventListener('click', () => this.advanceTurn(1));
    stage.querySelector('#vtt-btn-center-init-combat')?.addEventListener('click', () => this.openCombatSetupModal());
    stage.querySelector('#vtt-btn-center-add-handout')?.addEventListener('click', () => this.promptAddHandout());
    
    stage.querySelectorAll('.vtt-btn-view-handout').forEach(btn => {
      btn.addEventListener('click', () => {
        const hId = btn.dataset.id;
        const handout = this.handouts.find(h => h.id === hId);
        if (handout) this.openHandoutModal(handout);
      });
    });

    this.setupParticipantsSummaryEvents(stage.querySelector('#vtt-center-participants-summary') || stage);
  }

  renderCenterCombatSummary() {
    const box = this.container.querySelector('#vtt-center-combat-summary');
    if (box) {
      box.innerHTML = this.getCombatSummaryContentHTML();
      box.querySelectorAll('.vtt-btn-roll-my-initiative').forEach(btn => {
        btn.addEventListener('click', () => this.executeRollMyInitiative());
      });
      box.querySelector('#vtt-btn-center-roll-all')?.addEventListener('click', () => this.executeGmRollAllPending());
      box.querySelector('#vtt-btn-center-start-turns')?.addEventListener('click', () => this.startCombatTurns());
      box.querySelector('#vtt-btn-center-prev-turn')?.addEventListener('click', () => this.advanceTurn(-1));
      box.querySelector('#vtt-btn-center-next-turn')?.addEventListener('click', () => this.advanceTurn(1));
      box.querySelector('#vtt-btn-center-init-combat')?.addEventListener('click', () => this.openCombatSetupModal());
    }
  }

  renderCenterHandoutSummary() {
    const box = this.container.querySelector('#vtt-center-handout-summary');
    if (box) {
      box.innerHTML = this.getHandoutSummaryContentHTML();
      box.querySelector('#vtt-btn-center-add-handout')?.addEventListener('click', () => this.promptAddHandout());
      box.querySelectorAll('.vtt-btn-view-handout').forEach(btn => {
        btn.addEventListener('click', () => {
          const hId = btn.dataset.id;
          const handout = this.handouts.find(h => h.id === hId);
          if (handout) this.openHandoutModal(handout);
        });
      });
    }
  }

  renderParticipantsSummaryOnly() {
    const box = this.container.querySelector('#vtt-center-participants-summary');
    if (box) {
      const participants = this.sync ? Array.from(this.sync.participants.values()) : [];
      box.innerHTML = this.getParticipantsSummaryContentHTML(participants);
      this.setupParticipantsSummaryEvents(box);
    }
  }

  setupParticipantsSummaryEvents(container) {
    if (!container) return;
    container.querySelectorAll('.stream-portrait-card').forEach(card => {
      card.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.openCharacterSheetModal();
      });
    });

    const gallery = container.querySelector('#stream-portrait-gallery') || container.querySelector('.stream-portrait-gallery');
    if (gallery && !gallery._wheelAttached) {
      gallery._wheelAttached = true;
      gallery.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0 && gallery.scrollWidth > gallery.clientWidth) {
          gallery.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive: false });
    }
  }

  renderLeftSidebarOnly() {
    const aside = this.container.querySelector('#vtt-left-sidebar');
    if (aside) {
      aside.innerHTML = this.getLeftSidebarHTML();
      this.setupLeftSidebarEvents(aside);
    }
  }

  setupLeftSidebarEvents(aside) {
    if (!aside) return;

    // 1. Alternância de Abas da Coluna Esquerda
    aside.querySelectorAll('.vtt-left-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeLeftTab = btn.dataset.tab;
        soundFX.playRuneClick();
        this.renderLeftSidebarOnly();
      });
    });

    // 2. Abrir Ficha Completa (Foundry Popup)
    aside.querySelector('#vtt-btn-open-foundry-sheet')?.addEventListener('click', () => {
      this.openCharacterSheetModal();
    });

    // 3. Dossiê: Ajuste Rápido de PV e PE
    aside.querySelectorAll('.vtt-btn-adjust-stat').forEach(btn => {
      btn.addEventListener('click', () => {
        const stat = btn.dataset.stat;
        const delta = parseInt(btn.dataset.delta, 10);
        const maxVal = parseInt(btn.dataset.max, 10) || (stat === 'pv' ? 20 : 3);
        if (stat === 'pv') {
          const cur = (typeof this.character.currentPv === 'number' && !isNaN(this.character.currentPv)) ? this.character.currentPv : maxVal;
          this.character.currentPv = Math.max(0, Math.min(maxVal, cur + delta));
        } else if (stat === 'pe') {
          const cur = (typeof this.character.currentPe === 'number' && !isNaN(this.character.currentPe)) ? this.character.currentPe : maxVal;
          this.character.currentPe = Math.max(0, Math.min(maxVal, cur + delta));
        }
        saveCharacterDossier(this.character);
        if (this.sync) {
          this.sync.character = this.character;
          this.sync.broadcastPresence('online');
        }
        soundFX.playRuneClick();
        this.renderLeftSidebarOnly();
        this.renderParticipantsSummaryOnly();
      });
    });

    // 4. Dossiê: Ataque de Arma (1-Clique)
    aside.querySelectorAll('.vtt-btn-weapon-attack').forEach(btn => {
      btn.addEventListener('click', () => {
        const weaponName = btn.dataset.name;
        const mod = parseInt(btn.dataset.mod || '0', 10);
        this.executeQuickSkillRoll(`Ataque (${weaponName})`, mod);
      });
    });

    // 5. Dossiê: Dano de Arma (1-Clique)
    aside.querySelectorAll('.vtt-btn-weapon-damage').forEach(btn => {
      btn.addEventListener('click', () => {
        const weaponName = btn.dataset.name;
        const dmgFormula = btn.dataset.dmg || '1d8';
        this.executeWeaponDamageRoll(weaponName, dmgFormula);
      });
    });

    // 6. Dossiê: Conjurar Ritual (1-Clique)
    aside.querySelectorAll('.vtt-btn-cast-ritual').forEach(btn => {
      btn.addEventListener('click', () => {
        const ritualName = btn.dataset.name;
        const costStr = btn.dataset.cost || '1 PE';
        const cost = parseInt(costStr, 10) || 1;
        this.executeCastRitual(ritualName, cost);
      });
    });

    // 7. Dossiê: Teste de Perícia de 1-Clique
    aside.querySelectorAll('.vtt-btn-quick-skill').forEach(btn => {
      btn.addEventListener('click', () => {
        const skillName = btn.dataset.name;
        const mod = parseInt(btn.dataset.mod || '0', 10);
        this.executeQuickSkillRoll(skillName, mod);
      });
    });

    // 8. Dossiê: Teste de Atributo de 1-Clique
    aside.querySelectorAll('.vtt-btn-quick-attr').forEach(btn => {
      btn.addEventListener('click', () => {
        const attrName = btn.dataset.attr.toUpperCase();
        const val = parseInt(btn.dataset.val || '0', 10);
        this.executeQuickSkillRoll('Atributo ' + attrName, val);
      });
    });

    // 9. Rolagem da própria iniciativa pelo Jogador
    aside.querySelectorAll('.vtt-btn-roll-my-initiative').forEach(btn => {
      btn.addEventListener('click', () => {
        this.executeRollMyInitiative();
      });
    });

    // 10. Mestre rola pendentes / inicia turnos no Sidebar
    aside.querySelector('#vtt-btn-gm-roll-all')?.addEventListener('click', () => {
      this.executeGmRollAllPending();
    });
    aside.querySelector('#vtt-btn-start-turns')?.addEventListener('click', () => {
      this.startCombatTurns();
    });
    aside.querySelectorAll('.vtt-btn-roll-actor-inic').forEach(btn => {
      btn.addEventListener('click', () => {
        const actorId = btn.dataset.id;
        if (actorId) this.executeGmRollActorInitiative(actorId);
      });
    });
    aside.querySelector('#vtt-btn-prev-turn')?.addEventListener('click', () => this.advanceTurn(-1));
    aside.querySelector('#vtt-btn-next-turn')?.addEventListener('click', () => this.advanceTurn(1));
    aside.querySelector('#vtt-btn-toggle-combat')?.addEventListener('click', () => this.handleToggleCombat());
    aside.querySelector('#vtt-btn-init-combat-empty')?.addEventListener('click', () => this.openCombatSetupModal());
    aside.querySelector('#vtt-btn-clear-initiative')?.addEventListener('click', () => this.handleClearInitiative());
    aside.querySelectorAll('.vtt-btn-remove-actor').forEach(btn => {
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

    // 11. Handouts no Sidebar
    aside.querySelectorAll('.vtt-btn-view-handout').forEach(btn => {
      btn.addEventListener('click', () => {
        const hId = btn.dataset.id;
        const handout = this.handouts.find(h => h.id === hId);
        if (handout) this.openHandoutModal(handout);
      });
    });
    aside.querySelectorAll('.vtt-btn-reveal-handout').forEach(btn => {
      btn.addEventListener('click', () => {
        const hId = btn.dataset.id;
        const handout = this.handouts.find(h => h.id === hId);
        if (handout && this.sync) {
          this.sync.sendHandout(handout, 'show');
          this.sync.sendSystemEvent(`O Mestre revelou a pista: "${handout.title}"`);
        }
      });
    });
    aside.querySelector('#vtt-btn-add-handout')?.addEventListener('click', () => this.promptAddHandout());
    aside.querySelector('#vtt-btn-add-handout-empty')?.addEventListener('click', () => this.promptAddHandout());

    // 12. GM Panel no Sidebar
    aside.querySelector('#vtt-btn-gm-campaign-edit')?.addEventListener('click', () => this.handleEditCampaign());
    aside.querySelector('#vtt-btn-gm-notes')?.addEventListener('click', () => this.handleEditTacticalNotes());
    aside.querySelector('#vtt-btn-gm-init-combat')?.addEventListener('click', () => this.openCombatSetupModal());
    aside.querySelector('#vtt-btn-gm-scene')?.addEventListener('click', () => this.promptGmScene());
    aside.querySelector('#vtt-btn-gm-secret-roll')?.addEventListener('click', () => this.executeGmSecretRoll());
    aside.querySelector('#vtt-btn-gm-pause')?.addEventListener('click', () => {
      this.sessionData.status = this.sessionData.status === 'paused' ? 'active' : 'paused';
      localStorage.setItem('paroxismo_session_status', this.sessionData.status);
      if (this.sync) {
        this.sync.sendSessionState({ status: this.sessionData.status });
        this.sync.sendSystemEvent(this.sessionData.status === 'paused' ? 'O Mestre pausou a sessão.' : 'O Mestre retomou a sessão.');
      }
      this.renderHeaderOnly();
    });
    aside.querySelector('#vtt-btn-gm-sys-msg')?.addEventListener('click', () => this.handleBroadcastSystemMsg());
  }

  renderInitiativeListOnly() {
    if (this.activeLeftTab === 'iniciativa') {
      this.renderLeftSidebarOnly();
    }
  }

  renderChatFeedOnly() {
    const feed = this.container.querySelector('#vtt-chat-feed');
    if (feed) {
      feed.innerHTML = this.getChatFeedHTML();
    }
  }

  renderDiceDockOnly() {
    const dock = this.container.querySelector('#vtt-dice-dock');
    if (dock) {
      dock.innerHTML = this.getDiceDockHTML();
      dock.querySelectorAll('.vtt-btn-dice-type').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectedDiceType = parseInt(btn.dataset.sides, 10);
          soundFX.playRuneClick();
          this.renderDiceDockOnly();
        });
      });
      dock.querySelector('#vtt-btn-qty-dec')?.addEventListener('click', () => {
        if (this.diceQuantity > 1) { this.diceQuantity--; this.renderDiceDockOnly(); }
      });
      dock.querySelector('#vtt-btn-qty-inc')?.addEventListener('click', () => {
        if (this.diceQuantity < 10) { this.diceQuantity++; this.renderDiceDockOnly(); }
      });
      dock.querySelector('#vtt-btn-mod-dec')?.addEventListener('click', () => {
        this.diceModifier--; this.renderDiceDockOnly();
      });
      dock.querySelector('#vtt-btn-mod-inc')?.addEventListener('click', () => {
        this.diceModifier++; this.renderDiceDockOnly();
      });
      dock.querySelector('#vtt-btn-roll-main')?.addEventListener('click', () => {
        this.executeDockRoll();
      });
    }
  }

  scrollChatToBottom() {
    requestAnimationFrame(() => {
      const feed = this.container.querySelector('#vtt-chat-feed');
      if (feed) feed.scrollTop = feed.scrollHeight;
    });
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
