/**
 * PAROXISMO — AAA LIVING GRIMOIRE ENGINE
 * Aplicação Principal (SPA Controller, Web Audio Diegético, Física 3D Tilt e Roda de Seleção de Jogo)
 * Inspirado em Diablo IV, Red Hook Studios, FromSoftware e Supergiant Games
 */

import { RULES_DATA } from './data/rules.js?v=rules_supreme_v1';
import { CLASSES_DATA } from './data/classes.js';
import { SKILLS_DATA, ORIGINS_DATA } from './data/skills-origins.js';
import { EMOTIONS_DATA, ELEMENTAL_CONDITIONS, HYBRID_FUSIONS } from './data/emotions.js';
import { RITUALS_DATA, RITUAL_RULES } from './data/rituals.js';
import { BESTIARY_DATA, VD_BALANCE_GUIDE } from './data/bestiary.js';
import { ADVENTURE_DATA } from './data/adventure.js';

import { SearchEngine } from './utils/search-engine.js';
import { soundFX } from './utils/sound-fx.js';
import { AtmosphericCanvas } from './components/particle-canvas.js?v=release_v8';
import { RotaryWheel } from './components/rotary-wheel.js?v=release_v8';

import { EmotionWheel } from './components/emotion-wheel.js?v=release_v8';
import { FusionMatrix } from './components/fusion-matrix.js?v=release_v8';
import { GrimoireViewer } from './components/grimoire-viewer.js?v=release_v11';
import { CharacterSheet } from './components/character-sheet.js?v=release_v11';
import { DiceRoller } from './components/dice-roller.js?v=mobile_v5';
import { ArchetypesViewer } from './components/archetypes-viewer.js?v=release_v11';
import { ForgeViewer } from './components/forge-viewer.js?v=release_v11';
import { DiscordActivity } from './utils/discord-activity.js?v=release_v11';
import { ActivitySync } from './utils/activity-sync.js?v=discord_v1';
import { SessionViewer } from './components/session-viewer.js?v=sess_v2';

class App {
  constructor() {
    this.searchEngine = new SearchEngine();
    this.currentTab = 'home';
    this.components = {};
    this.rotaryWheel = null;
    this.discord = new DiscordActivity();
    this.sync = null;
    
    // Estado de Classes & Habilidades
    this.selectedClassId = 'combate';
    this.selectedAbilityIndex = 0;
    this.classSubView = 'hero'; // 'hero', 'tree', 'emotions'
    
    // Estado do Mestre (Confidencial)
    this.gmModeActive = localStorage.getItem('paroxismo_gm_mode') === 'true';
    this.selectedBestiaryMonster = 'mimico-cobica';

    this.init();
  }

  init() {
    window.ParoxismoApp = this;
    window.ParoxismoSoundFX = soundFX;

    // Inicializa motor atmosférico de partículas (Z-0)
    new AtmosphericCanvas('particle-canvas');

    // Inicializa Roda de Opções Rotativa em Meio Círculo
    this.rotaryWheel = new RotaryWheel('rotary-nav', {
      isGmActive: this.gmModeActive,
      onSelect: (tabId) => {
        this.navigateTo(tabId, {}, false);
      }
    });

    this.setupAudioControls();
    this.setupHashListener();
    this.setupCommandPalette();
    this.setupQuickDice();
    this.setupGmAuth();
    this.updateGmUI();

    // Inicializa Discord Activity se estiver no ambiente Discord
    this.discord.init().then((res) => {
      if (res && res.isDiscord) {
        console.log('[App] Discord Activity conectada! Inicializando sincronização de rolagens...');
        this.sync = new ActivitySync(res.instanceId, res.user);
        this.sync.connect();
      }
    }).catch((e) => console.warn('[App] Discord init:', e));

    const hash = window.location.hash.replace('#', '') || 'home';
    this.navigateTo(hash, {}, true);
  }

  // ============================================================
  // SINTETIZADOR DE ÁUDIO DIEGÉTICO NO HUD
  // ============================================================
  setupAudioControls() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    const label = document.getElementById('audio-status-label');

    const updateLabel = () => {
      if (label) {
        label.textContent = soundFX.isMuted ? '[ SOM: MUDO ]' : '[ SOM: ATIVO ]';
      }
    };

    updateLabel();

    audioBtn?.addEventListener('click', () => {
      soundFX.toggleMute();
      updateLabel();
    });
  }

  // ============================================================
  // HASH LISTENER & NAVEGAÇÃO
  // ============================================================
  setupHashListener() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash !== this.currentTab) {
        this.navigateTo(hash);
      }
    });
  }

  navigateTo(tab, params = {}, syncWheel = true) {
    if ((tab === 'bestiario' || tab === 'aventura') && !this.gmModeActive) {
      this.currentTab = tab;
      window.location.hash = tab;
      this.renderGmGatekeeper();
      return;
    }

    this.currentTab = tab;
    window.location.hash = tab;

    if (syncWheel && this.rotaryWheel) {
      this.rotaryWheel.setActiveTab(tab, false);
    }

    const rotarySpacer = document.getElementById('rotary-desktop-spacer');
    if (tab === 'mesa' || tab === 'sessao') {
      if (rotarySpacer) rotarySpacer.classList.add('hidden');
      if (this.rotaryWheel && !this.rotaryWheel.isCollapsed) {
        this.rotaryWheel.toggleDrawer(true);
      }
    } else {
      if (rotarySpacer) rotarySpacer.classList.remove('hidden');
    }

    // Rolagem instantânea para o topo sem bloquear a thread do navegador
    window.scrollTo(0, 0);

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('content-fade-in');
      void mainContent.offsetWidth;
      mainContent.classList.add('content-fade-in');
    }

    requestAnimationFrame(() => {
      this.renderCurrentTab(params);
    });
  }

  renderCurrentTab(params = {}) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    switch (this.currentTab) {
      case 'home':
        this.renderHome(mainContent);
        break;
      case 'regras':
        this.renderRules(mainContent, params);
        break;
      case 'classes':
        if (params.classId) this.selectedClassId = params.classId;
        this.renderClasses(mainContent);
        break;
      case 'pericias':
      case 'skills':
        this.renderSkillsAndOrigins(mainContent, params);
        break;
      case 'emocoes':
        this.renderEmotions(mainContent, params);
        break;
      case 'arquetipos':
        this.renderArchetypes(mainContent, params);
        break;
      case 'criacao':
      case 'forja':
        this.renderForge(mainContent, params);
        break;
      case 'grimorio':
        this.renderGrimoire(mainContent, params);
        break;
      case 'bestiario':
        if (params.monsterId) this.selectedBestiaryMonster = params.monsterId;
        this.renderBestiary(mainContent);
        break;
      case 'aventura':
        this.renderAdventure(mainContent);
        break;
      case 'ficha':
        this.renderCharacterSheet(mainContent);
        break;
      case 'mesa':
      case 'sessao':
        this.renderSession(mainContent, params);
        break;
      default:
        this.renderHome(mainContent);
        break;
    }
  }

  // ============================================================
  // MESTRE / CONDUTOR: AUTH & PACTO DO DEMIURGO
  // ============================================================
  setupGmAuth() {
    const gmToggleBtn = document.getElementById('gm-toggle-btn');
    const gmAuthModal = document.getElementById('gm-auth-modal');
    const cancelBtn = document.getElementById('cancel-gm-auth-btn');
    const confirmBtn = document.getElementById('confirm-gm-auth-btn');
    const lockBackBtn = document.getElementById('gm-lock-back-btn');

    gmToggleBtn?.addEventListener('click', () => {
      if (this.gmModeActive) {
        this.setGmMode(false);
      } else {
        soundFX.playRuneClick();
        gmAuthModal?.classList.remove('hidden');
      }
    });

    cancelBtn?.addEventListener('click', () => {
      soundFX.playRuneClick();
      gmAuthModal?.classList.add('hidden');
    });

    confirmBtn?.addEventListener('click', () => {
      soundFX.playSealBreak();
      this.setGmMode(true);
      gmAuthModal?.classList.add('hidden');
    });

    lockBackBtn?.addEventListener('click', () => {
      soundFX.playRuneClick();
      this.setGmMode(false);
    });
  }

  setGmMode(active) {
    this.gmModeActive = active;
    localStorage.setItem('paroxismo_gm_mode', active ? 'true' : 'false');
    this.updateGmUI();

    if (this.rotaryWheel) {
      this.rotaryWheel.setGmMode(active);
    }

    if (!active && (this.currentTab === 'bestiario' || this.currentTab === 'aventura')) {
      this.navigateTo('home');
    } else {
      this.renderCurrentTab();
    }
  }

  updateGmUI() {
    const gmActiveBanner = document.getElementById('gm-active-banner');
    const gmLockLabel = document.getElementById('gm-lock-label');

    if (this.gmModeActive) {
      gmActiveBanner?.classList.remove('hidden');
      if (gmLockLabel) gmLockLabel.textContent = '[ BLOQUEAR MESTRE ]';
    } else {
      gmActiveBanner?.classList.add('hidden');
      if (gmLockLabel) gmLockLabel.textContent = '[ ACESSO DO MESTRE ]';
    }
  }

  renderGmGatekeeper() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="max-w-2xl mx-auto py-12 px-4">
        <div class="iron-carved-card p-8 space-y-6 text-center border border-[#e21b23] shadow-[0_0_40px_rgba(226,27,35,0.4)]">
          <span class="text-[10px] font-mono font-bold text-[#e21b23] block">[ ACESSO RESTRITO AO CONDUTOR ]</span>
          <h2 class="text-3xl font-serif font-black text-white">Selo do Demiurgo Inviolado</h2>
          <p class="text-xs font-liturgical italic text-white leading-relaxed">
            O Bestiário de Ameaças e a Aventura "O Despertar" contêm pontos de vida ocultos, enigmas de medo e segredos de enredo que não devem ser visualizados por jogadores comuns.
          </p>
          <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onclick="window.ParoxismoApp.navigateTo('home')" class="btn-ritual-steel text-xs">
              [ RETORNAR COMO JOGADOR ]
            </button>
            <button onclick="document.getElementById('gm-auth-modal').classList.remove('hidden')" class="btn-ritual-blood text-xs">
              [ ROMPER O SELO → ]
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================
  // 1. TELA INICIAL: FICHA CONCEITUAL LITÚRGICA (ESTILO SHIZUKA - 3 COLUNAS)
  // ============================================================
  renderHome(container) {
    container.innerHTML = `
      <div class="w-full lg:min-h-[calc(100vh-60px)] flex items-start lg:items-center justify-center py-6 sm:py-16 px-2 sm:px-8 relative z-10 overflow-hidden">
        
        <!-- COMPOSIÇÃO TRIPARTITE EQUILIBRADA (CENTRALIZADA VERTICALMENTE NO VIEWPORT) -->
        <div class="max-w-[1460px] w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- ============================================================ -->
          <!-- 1. COLUNA ESQUERDA: TÍTULO MONUMENTAL & SELO ESPINHOSO       -->
          <!-- ============================================================ -->
          <div class="lg:col-span-4 space-y-6 text-left">
            
            <!-- Título & Epígrafe -->
            <div class="space-y-3">
              <h1 class="text-4xl sm:text-5xl xl:text-6xl font-serif font-black tracking-[0.14em] text-white leading-none whitespace-nowrap">
                PAROXISMO
              </h1>
              <p class="text-xs sm:text-sm font-serif italic text-[#c8cbd2] leading-relaxed max-w-sm border-l-2 border-[#e21b23] pl-3 py-0.5">
                “A realidade é apenas um tecido bordado sobre o abismo de nossos traumas. Sob o peso da dor humana, as costuras romperam-se.”
              </p>
            </div>

            <!-- Selo Espinhoso Demoníaco de Atributos Cósmicos (Inspirado em Shizuka) -->
            <div class="pt-2">
              <div class="demonic-thorny-crest">
                <svg viewBox="0 0 260 260" class="w-full h-full pointer-events-none filter drop-shadow-[0_0_14px_rgba(226,27,35,0.65)]">
                  <!-- Chifres e Espinhos Agressivos Forjados em Sangue -->
                  <g stroke="#e21b23" stroke-width="2" fill="none">
                    <!-- Espinho Superior Principal -->
                    <path d="M 130 130 L 130 15 M 130 45 Q 112 30 100 10 M 130 45 Q 148 30 160 10" stroke-width="2.5"/>
                    <path d="M 118 65 L 75 35 M 142 65 L 185 35" stroke-width="1.5" stroke-dasharray="2,3"/>
                    
                    <!-- Chifres Laterais Superiores -->
                    <path d="M 130 130 L 230 70 M 185 95 Q 215 80 250 75 M 185 95 Q 205 55 225 40" stroke-width="2.2"/>
                    <path d="M 130 130 L 30 70 M 75 95 Q 45 80 10 75 M 75 95 Q 55 55 35 40" stroke-width="2.2"/>
                    
                    <!-- Chifres Laterais Inferiores -->
                    <path d="M 130 130 L 200 215 M 170 175 Q 205 205 235 230 M 170 175 Q 190 225 200 250" stroke-width="2.2"/>
                    <path d="M 130 130 L 60 215 M 90 175 Q 55 205 25 230 M 90 175 Q 70 225 60 250" stroke-width="2.2"/>

                    <!-- Teia Pentagonal Espinhosa Conectando os Nós -->
                    <polygon points="130,18 230,70 200,215 60,215 30,70" stroke="#e21b23" stroke-width="1.8" stroke-dasharray="4,4" opacity="0.8"/>
                    <polygon points="130,130 230,70 130,18" fill="rgba(226,27,35,0.06)" stroke="none"/>
                    <polygon points="130,130 60,215 200,215" fill="rgba(226,27,35,0.06)" stroke="none"/>
                    <polygon points="130,130 30,70 60,215" fill="rgba(226,27,35,0.06)" stroke="none"/>
                  </g>

                  <!-- Núcleo Central com Anel Rúnico Negro & Vermelho -->
                  <circle cx="130" cy="130" r="48" fill="#06070a" stroke="#e21b23" stroke-width="2.5" filter="drop-shadow(0 0 10px rgba(226,27,35,0.9))"/>
                  <circle cx="130" cy="130" r="42" fill="none" stroke="#e21b23" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.7"/>
                  
                  <!-- Texto Central AVESSO em Tipografia Monumental -->
                  <text x="130" y="135" font-family="'Cinzel', serif" font-size="12" font-weight="900" text-anchor="middle" fill="#ffffff" letter-spacing="2">AVESSO</text>
                </svg>

                <!-- 5 Nós em Hexágonos Góticos Demoníacos -->
                <div class="demonic-node" style="top: -4px; left: 130px; transform: translateX(-50%);" onclick="window.ParoxismoApp.navigateTo('regras')" title="O Tecido (d20)">
                  <span class="text-[12px] font-mono font-black text-white leading-none">d20</span>
                  <span class="text-[7px] font-mono text-[#e21b23] font-black tracking-wider">TECIDO</span>
                </div>

                <div class="demonic-node" style="top: 50px; right: 5px;" onclick="window.ParoxismoApp.navigateTo('classes')" title="As 10 Classes">
                  <span class="text-[12px] font-mono font-black text-white leading-none">10</span>
                  <span class="text-[7px] font-mono text-[#e21b23] font-black tracking-wider">CLASSES</span>
                </div>

                <div class="demonic-node" style="bottom: 5px; right: 36px;" onclick="window.ParoxismoApp.navigateTo('emocoes')" title="As 45 Fusões">
                  <span class="text-[12px] font-mono font-black text-white leading-none">45</span>
                  <span class="text-[7px] font-mono text-[#e21b23] font-black tracking-wider">FUSÕES</span>
                </div>

                <div class="demonic-node" style="bottom: 5px; left: 36px;" onclick="window.ParoxismoApp.navigateTo('regras')" title="Os 5 Graus de CD">
                  <span class="text-[12px] font-mono font-black text-white leading-none">05</span>
                  <span class="text-[7px] font-mono text-[#e21b23] font-black tracking-wider">GRAUS</span>
                </div>

                <div class="demonic-node" style="top: 50px; left: 5px;" onclick="window.ParoxismoApp.navigateTo('emocoes')" title="As 10 Emoções">
                  <span class="text-[12px] font-mono font-black text-white leading-none">10</span>
                  <span class="text-[7px] font-mono text-[#e21b23] font-black tracking-wider">EMOÇÕES</span>
                </div>
              </div>
            </div>

          </div>

          <!-- ============================================================ -->
          <!-- 2. COLUNA CENTRAL: DECK INCLINADO COM PROFUNDIDADE 3D REAL   -->
          <!-- ============================================================ -->
          <div class="lg:col-span-4 flex items-center justify-center py-4 relative z-30">
            <div class="shizuka-perspective-wrapper">
              <div class="shizuka-ability-deck">
                
                <!-- Habilidade 1: O TECIDO DA REALIDADE (Fita Branca Rasgada) -->
                <div class="shizuka-strip-card group" style="transform: translateZ(8px);" onclick="window.ParoxismoApp.navigateTo('regras')" title="Consultar Regras do Tecido">
                  <div class="shizuka-tape-white">
                    <span class="font-serif font-black text-sm tracking-wider uppercase text-[#0d0e12]">
                      O TECIDO DA REALIDADE
                    </span>
                    <span class="font-serif font-black text-base text-[#0d0e12]">
                      3 PE
                    </span>
                  </div>
                  <div class="shizuka-strip-body">
                    <p>
                      A membrana lógica que protege a civilização. Quando o risco é iminente, <strong>1d20 + Atributo ≥ CD</strong> decide a sobrevivência física e o horror sem barra de sanidade.
                    </p>
                  </div>
                </div>

                <!-- Habilidade 2: O DESPERTAR DUAL (Fita Branca Rasgada) -->
                <div class="shizuka-strip-card group" style="transform: translateZ(16px);" onclick="window.ParoxismoApp.navigateTo('classes')" title="Escolher Arquétipo de Agente">
                  <div class="shizuka-tape-white">
                    <span class="font-serif font-black text-sm tracking-wider uppercase text-[#0d0e12]">
                      O DESPERTAR DUAL
                    </span>
                    <span class="font-serif font-black text-base text-[#0d0e12]">
                      1 PV
                    </span>
                  </div>
                  <div class="shizuka-strip-body">
                    <p>
                      No trauma do Estrondo, duas emoções latentes despertam na carne. 10 classes de agentes com constelações de 15 habilidades anatômicas e poderes ativos.
                    </p>
                  </div>
                </div>

                <!-- Habilidade 3: O ESTRONDO DO AVESSO (Fita Vermelha Carmesim Rasgada) -->
                <div class="shizuka-strip-card group" style="transform: translateZ(24px);" onclick="window.ParoxismoApp.navigateTo('emocoes')" title="Desvendar os Rituais do Grimório">
                  <div class="shizuka-tape-crimson">
                    <span class="font-serif font-black text-sm tracking-wider uppercase text-white">
                      O ESTRONDO DO AVESSO
                    </span>
                    <span class="font-serif font-black text-base text-white">
                      5 PV
                    </span>
                  </div>
                  <div class="shizuka-strip-body">
                    <p class="text-[#f3f4f6]">
                      A fratura cósmica das emoções reprimidas por milênios. A física dos 10 sentimentos, 200 rituais arcanos e a matriz de 45 fusões híbridas do abismo.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- ============================================================ -->
          <!-- 3. COLUNA DIREITA: O SÍMBOLO OFICIAL VIVO BEM MAIOR          -->
          <!-- ============================================================ -->
          <div class="lg:col-span-4 flex flex-col items-center justify-center relative z-10">
            <div class="living-sigil-monolith-huge">
              
              <!-- Circunferências Alquímicas Concêntricas de 960px Rigorosamente Alinhadas e Retas -->
              <div class="colossal-sigil-circumferences">
                <svg viewBox="0 0 800 800" class="w-full h-full pointer-events-none">
                  <!-- Geometria Sagrada Imutável e Reta (Sem Rotação de Vértices - 100% Simétrica) -->
                  <circle cx="400" cy="400" r="390" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="4,10" opacity="0.4"/>
                  <circle cx="400" cy="400" r="365" fill="none" stroke="#e21b23" stroke-width="1.8" stroke-dasharray="12,12" opacity="0.6"/>
                  
                  <!-- Triângulo Equilátero Reto Superior (Vértice em 12h) -->
                  <polygon points="400,28 722,586 78,586" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.55"/>
                  <!-- Triângulo Equilátero Invertido (Vértice em 6h) -->
                  <polygon points="400,772 722,214 78,214" fill="none" stroke="#e21b23" stroke-width="1.2" opacity="0.55"/>

                  <!-- Eixos Cardinais Retos X e Y Perfeitamente Nivelados -->
                  <line x1="400" y1="20" x2="400" y2="780" stroke="#e21b23" stroke-width="1" stroke-dasharray="4,6" opacity="0.45"/>
                  <line x1="20" y1="400" x2="780" y2="400" stroke="#e21b23" stroke-width="1" stroke-dasharray="4,6" opacity="0.45"/>
                  
                  <!-- Runas nos 4 Vértices Cardinais -->
                  <text x="400" y="20" font-family="'Cinzel', serif" font-size="18" fill="#e21b23" text-anchor="middle">☩</text>
                  <text x="400" y="798" font-family="'Cinzel', serif" font-size="18" fill="#e21b23" text-anchor="middle">✠</text>
                  <text x="795" y="406" font-family="'Cinzel', serif" font-size="18" fill="#e21b23" text-anchor="middle">☩</text>
                  <text x="5" y="406" font-family="'Cinzel', serif" font-size="18" fill="#e21b23" text-anchor="middle">☩</text>

                  <!-- Órbitas Radiais com Rotação Circular Simétrica (Sem Inclinar os Triângulos) -->
                  <g class="alchemy-ring-outer" style="transform-origin: 400px 400px;">
                    <circle cx="400" cy="400" r="330" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="3,8" opacity="0.35"/>
                    <circle cx="400" cy="400" r="290" fill="none" stroke="#e21b23" stroke-width="1.2" stroke-dasharray="8,14" opacity="0.45"/>
                  </g>
                  <g class="alchemy-ring-inner" style="transform-origin: 400px 400px;">
                    <circle cx="400" cy="400" r="255" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="2,6" opacity="0.3"/>
                  </g>
                </svg>
              </div>

              <!-- Símbolo Oficial Livre de Paroxismo BEM Maior (540px) sem Bola Preta -->
              <div class="colossal-sigil-core sigil-breathing-aura flex items-center justify-center" onclick="window.ParoxismoApp.triggerOmen()" title="Comungar com o Sigilo de Paroxismo">
                <img src="assets/images/paroxismo_logo_transparent.png" alt="Sigilo Oficial de Paroxismo" class="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(226,27,35,0.85)] lg:drop-shadow-[0_0_35px_rgba(226,27,35,0.95)] contrast-125 brightness-110" />
              </div>

            </div>
          </div>

        </div>

      </div>
    `;
  }

  // Interação Sonora e Dinâmica do Oráculo do Avesso
  triggerOmen() {
    soundFX.playRuneClick();
    const omens = [
      "“O Rancor consome a carne antes de consumir o aço.” — Registro do Estrondo",
      "“O Vazio não perdoa memórias; ele as dissolve em silêncio absoluto.”",
      "“A Ambição conecta fios invisíveis aos membros dos incautos.”",
      "“O Pavor não rasteja nas sombras; ele habita a pupila que as vigia.”",
      "“A Culpa é o único prego que a alma humana não consegue arrancar.”",
      "“O Desespero estilhaça a mente em estilhaços afiados de vidro cósmico.”",
      "“A Soberba ergue muros dourados, mas o Avesso é mais paciente.”",
      "“A Melancolia é o gelo negro que nunca derrete sob o sol.”",
      "“A Luxúria devora as formas dos corpos até que não reste identidade.”",
      "“A Inveja rouba as faces daqueles que você mais amava.”"
    ];
    const textEl = document.getElementById('home-omen-text');
    if (textEl) {
      textEl.style.opacity = '0';
      setTimeout(() => {
        textEl.textContent = omens[Math.floor(Math.random() * omens.length)];
        textEl.style.opacity = '1';
      }, 200);
    }
  }

  // ============================================================
  // 2. REGRAS BÁSICAS & COMBATE (GRIMÓRIO MONUMENTAL DO TECIDO)
  // COMPÊNDIO SUPREMO & RESUMO OFICIAL DE REGRAS (10 CAPÍTULOS)
  // ============================================================
  renderRules(container, params = {}) {
    container.innerHTML = `
      <div class="max-w-[1400px] mx-auto py-6 sm:py-10 px-2 sm:px-6 space-y-16 animate-fadeIn">
        
        <!-- ============================================================ -->
        <!-- HEADER MONUMENTAL DO GRIMÓRIO                                -->
        <!-- ============================================================ -->
        <div class="text-left space-y-4 border-b border-[#242833] pb-6 relative">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="grimoire-stamp-badge">[ CÓDICE LITÚRGICO d20 ]</span>
              <span class="text-[10px] font-mono text-[#8e95a5] uppercase tracking-widest">TOMO I • COMPÊNDIO SUPREMO DE REGRAS</span>
            </div>
            <span class="text-xs font-mono text-[#e21b23] font-bold">[ MANUAL GERAL DE CONSULTA RÁPIDA ]</span>
          </div>

          <h1 class="text-4xl sm:text-5xl xl:text-6xl font-serif font-black tracking-[0.12em] text-white leading-tight">
            O TECIDO DA REALIDADE
          </h1>

          <p class="text-sm sm:text-base font-liturgical italic text-[#cbd0dc] leading-relaxed max-w-3xl border-l-2 border-[#e21b23] pl-4 py-1">
            “A realidade mundana é uma película frágil suspensa sobre o abismo de nossos traumas. Quando o perigo emerge, a sorte não é um favor divino: é a matemática cruel do esforço, da carne e da vontade diante do infinito.”
          </p>

          <!-- Barra de Navegação Rápida entre os 10 Capítulos -->
          <div class="pt-4 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <span class="text-white/40 font-bold mr-1 uppercase">CAPÍTULOS:</span>
            <a href="#sec-cosmologia" class="px-2 py-1 bg-[#090c14] border border-white/10 hover:border-[#e21b23] text-white/80 hover:text-white transition-all">I. Cosmologia</a>
            <a href="#sec-dados-atributos" class="px-2 py-1 bg-[#090c14] border border-white/10 hover:border-[#e21b23] text-white/80 hover:text-white transition-all">II. d20 & Atributos</a>
            <a href="#sec-pericias-inventario" class="px-2 py-1 bg-[#090c14] border border-white/10 hover:border-[#e21b23] text-white/80 hover:text-white transition-all">III. Perícias & Carga</a>
            <a href="#sec-recursos-combate" class="px-2 py-1 bg-[#090c14] border border-white/10 hover:border-[#e21b23] text-white/80 hover:text-white transition-all">IV. PV, PE & Combate</a>
            <a href="#sec-classes-guia" class="px-2 py-1 bg-[#090c14] border border-white/10 hover:border-[#e21b23] text-white/80 hover:text-white transition-all">V. 10 Classes</a>
            <a href="#sec-emocoes-dano" class="px-2 py-1 bg-[#090c14] border border-white/10 hover:border-[#e21b23] text-white/80 hover:text-white transition-all">VI. Emoções & Oposição</a>
            <a href="#sec-rituais-pratica" class="px-2 py-1 bg-[#090c14] border border-white/10 hover:border-[#e21b23] text-white/80 hover:text-white transition-all">VII. Rituais na Prática</a>
            <a href="#sec-cd-resistencias" class="px-2 py-1 bg-[#090c14] border border-white/10 hover:border-[#e21b23] text-white/80 hover:text-white transition-all">VIII. CD & Resistências</a>
            <a href="#sec-tabela-progressao" class="px-2 py-1 bg-[#090c14] border border-white/10 hover:border-[#e21b23] text-white/80 hover:text-white transition-all">IX. Nível 1 ao 20</a>
            <a href="#sec-mapa-documentos" class="px-2 py-1 bg-[#090c14] border border-white/10 hover:border-[#e21b23] text-white/80 hover:text-white transition-all">X. Os 6 Tomos</a>
          </div>

          <div class="grimoire-ritual-divider">
            <span class="text-[#e21b23] text-sm font-serif">✠ ☩ ✠</span>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- CAPÍTULO 1: COSMOLOGIA, O ESTRONDO & OS DESPERTOS             -->
        <!-- ============================================================ -->
        <section id="sec-cosmologia" class="space-y-6 pt-2">
          <div class="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ CAPÍTULO 1 ]</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white">${RULES_DATA.cosmology.title}</h2>
            </div>
            <span class="grimoire-stamp-badge hidden sm:inline-block">[ A ORIGEM DO HORROR ]</span>
          </div>

          <p class="text-xs sm:text-sm font-liturgical italic text-[#cbd0dc] max-w-3xl leading-relaxed">
            ${RULES_DATA.cosmology.intro}
          </p>

          <!-- 1.1 O Tecido e O Avesso -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            ${RULES_DATA.cosmology.planes.map(p => `
              <div class="p-5 bg-[#08090c] border-l-2 ${p.name === 'O Tecido' ? 'border-l-[#06b6d4]' : 'border-l-[#e21b23]'} border-t border-r border-b border-[#1a1d26] space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="text-base font-serif font-black text-white uppercase">${p.name}</h4>
                  <span class="text-[9px] font-mono ${p.name === 'O Tecido' ? 'text-[#06b6d4]' : 'text-[#e21b23]'} font-bold">[ ${p.tag} ]</span>
                </div>
                <p class="text-xs text-[#cbd0dc] leading-relaxed font-sans">${p.desc}</p>
              </div>
            `).join('')}
          </div>

          <!-- 1.2 O Cataclismo: O Estrondo -->
          <div class="p-6 bg-[#0c0809] border border-[#e21b23]/40 space-y-3 relative overflow-hidden shadow-[0_0_30px_rgba(226,27,35,0.15)]">
            <span class="text-[10px] font-mono text-[#e21b23] font-black uppercase tracking-widest block">[ 1.2 O CATACLISMO CÓSMICO ]</span>
            <h3 class="text-xl font-serif font-black text-white">${RULES_DATA.cosmology.cataclysm.title}</h3>
            <p class="text-xs sm:text-sm text-[#fca5a5] font-liturgical italic leading-relaxed">
              "${RULES_DATA.cosmology.cataclysm.anjoStory}"
            </p>
            <p class="text-xs text-[#cbd0dc] leading-relaxed font-sans pt-1 border-t border-white/5">
              ${RULES_DATA.cosmology.cataclysm.ruinDesc}
            </p>
          </div>

          <!-- 1.3 Os Agentes Despertos e as Duas Emoções -->
          <div class="p-5 bg-[#08090c] border border-white/10 space-y-3">
            <span class="text-[10px] font-mono text-[#06b6d4] font-black uppercase tracking-widest block">[ 1.3 A ALMA HUMANA DESPERTA ]</span>
            <h4 class="text-base font-serif font-bold text-white">${RULES_DATA.cosmology.awakenedSouls.title}</h4>
            <p class="text-xs text-[#cbd0dc] font-sans leading-relaxed">${RULES_DATA.cosmology.awakenedSouls.desc}</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div class="p-3 bg-black/50 border-l border-[#e21b23] text-xs space-y-1">
                <strong class="text-white font-mono block text-[11px] uppercase">✦ EMOÇÃO DOMINANTE (PRIMÁRIA):</strong>
                <p class="text-[#8e95a5] text-[11px] leading-relaxed">${RULES_DATA.cosmology.awakenedSouls.dominant}</p>
              </div>
              <div class="p-3 bg-black/50 border-l border-[#06b6d4] text-xs space-y-1">
                <strong class="text-white font-mono block text-[11px] uppercase">✦ EMOÇÃO LATENTE (SECUNDÁRIA):</strong>
                <p class="text-[#8e95a5] text-[11px] leading-relaxed">${RULES_DATA.cosmology.awakenedSouls.latent}</p>
              </div>
            </div>
          </div>
        </section>

        <div class="grimoire-ritual-divider"><span class="text-[#e21b23] text-sm font-serif">✠ ✠ ✠</span></div>

        <!-- ============================================================ -->
        <!-- CAPÍTULO 2: A MECÂNICA CENTRAL DE DADOS & OS 5 ATRIBUTOS       -->
        <!-- ============================================================ -->
        <section id="sec-dados-atributos" class="space-y-6 pt-2">
          <div class="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ CAPÍTULO 2 ]</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white">${RULES_DATA.coreMechanic.title}</h2>
            </div>
            <span class="grimoire-stamp-badge hidden sm:inline-block">[ RESOLUÇÃO d20 ]</span>
          </div>

          <!-- Altar da Fórmula Central -->
          <div class="grimoire-formula-altar">
            <span class="text-[11px] font-mono text-[#e21b23] font-bold tracking-[0.25em] uppercase block mb-3">
              [ AXIOMA FUNDAMENTAL DA RESOLUÇÃO DE RISCO ]
            </span>
            <div class="grimoire-formula-display my-4 py-2">
              <span class="text-[#ffffff]">1d20</span>
              <span class="text-[#e21b23] font-sans font-light mx-2">+</span>
              <span class="text-[#ffffff]">ATRIBUTO BASE</span>
              <span class="text-[#e21b23] font-sans font-light mx-2">+</span>
              <span class="text-[#ffffff]">BÔNUS TREINO</span>
              <span class="text-[#e21b23] font-sans font-light mx-3">≥</span>
              <span class="text-[#e21b23] font-mono font-black">CD ou DEFESA</span>
            </div>
            <p class="text-xs sm:text-sm font-liturgical italic text-[#8e95a5] max-w-2xl mx-auto leading-relaxed mt-3">
              ${RULES_DATA.coreMechanic.description}
            </p>

            <!-- 4 Postos de Treinamento -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#1e222e] text-left">
              ${RULES_DATA.coreMechanic.trainingRanks.map(r => `
                <div class="p-4 bg-[#08090c] border border-[#1d212c] hover:border-[#e21b23] transition-all relative overflow-hidden group">
                  <div class="flex items-baseline justify-between mb-2">
                    <span class="font-serif font-black text-xs text-white uppercase tracking-wider">${r.rank}</span>
                    <span class="stat-blood-badge">${r.bonus}</span>
                  </div>
                  <span class="text-[9px] font-mono text-[#e21b23] block mb-1 uppercase font-bold">[ ${r.levels} ]</span>
                  <p class="text-[11px] font-sans text-[#8e95a5] leading-relaxed">${r.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Regra de Criação de Atributos & Cartões dos 5 Atributos -->
          <div class="space-y-4 pt-2">
            <div class="p-4 bg-[#0a0d15] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span class="text-[10px] font-mono text-[#06b6d4] font-bold uppercase tracking-wider block">[ REGRAS DE GERAÇÃO ]</span>
                <h4 class="text-sm font-serif font-bold text-white">${RULES_DATA.coreMechanic.attributeCreationRule.rule}</h4>
              </div>
              <p class="text-xs text-[#cbd0dc] font-mono max-w-xl sm:text-right">
                ${RULES_DATA.coreMechanic.attributeCreationRule.desc}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              ${RULES_DATA.attributes.map(a => `
                <div class="p-3.5 bg-[#08090c] border border-[#1a1d26] space-y-2 flex flex-col justify-between hover:border-[#06b6d4] transition-colors">
                  <div>
                    <div class="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                      <span class="font-serif font-black text-sm text-white">${a.name}</span>
                      <span class="font-mono font-black text-xs text-[#06b6d4]">[ ${a.code} ]</span>
                    </div>
                    <p class="text-[11px] font-sans text-[#8e95a5] leading-relaxed">${a.desc}</p>
                  </div>
                  <div class="pt-2 border-t border-white/5 space-y-0.5">
                    ${a.keyStats.map(s => `<span class="text-[9px] font-mono text-white/50 block">• ${s}</span>`).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Escala Litúrgica de Dificuldades (CDs) -->
          <div class="space-y-3 pt-2">
            <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ METRAGEM DA DIFICULDADE ]</span>
            <div class="space-y-2">
              ${RULES_DATA.coreMechanic.difficultyClasses.map((d, index) => {
                const isSobrenatural = index === 4;
                return `
                  <div class="cd-ladder-step ${isSobrenatural ? 'highlight' : ''}">
                    <div class="cd-ladder-number">
                      <span class="${isSobrenatural ? 'text-[#ffffff] filter drop-shadow-[0_0_10px_#e21b23]' : 'text-[#e21b23]'} font-black">
                        ${d.cd}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-3 mb-1">
                        <h4 class="font-serif font-black text-sm text-white uppercase tracking-wider">${d.level}</h4>
                        ${isSobrenatural ? '<span class="text-[8px] font-mono font-bold bg-[#e21b23] text-black px-1.5 py-0.5 uppercase">AMEAÇA TITÂNICA</span>' : ''}
                        ${d.level === 'Difícil' ? '<span class="text-[8px] font-mono font-bold text-[#e21b23] border border-[#e21b23] px-1 py-0.2">LIMIAR DO AVESSO</span>' : ''}
                      </div>
                      <p class="text-xs text-[#cbd0dc] font-sans leading-relaxed">${d.example}</p>
                    </div>
                    <div class="hidden md:block text-right text-[10px] font-mono text-[#8e95a5]">
                      [ GRAU 0${index + 1} ]
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Acertos Críticos, Desastres & Margem de Ameaça -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs font-mono">
            <div class="p-4 bg-black/60 border border-green-500/40 space-y-1">
              <strong class="text-green-400 block font-bold text-[11px] uppercase">✦ 20 NATURAL NO d20 (CRÍTICO AUTOMÁTICO)</strong>
              <p class="text-[#cbd0dc] text-[11px] font-sans leading-relaxed">${RULES_DATA.coreMechanic.criticalRules.natural20}</p>
            </div>
            <div class="p-4 bg-black/60 border border-red-500/40 space-y-1">
              <strong class="text-red-400 block font-bold text-[11px] uppercase">✦ 1 NATURAL NO d20 (DESASTRE / FALHA CRÍTICA)</strong>
              <p class="text-[#cbd0dc] text-[11px] font-sans leading-relaxed">${RULES_DATA.coreMechanic.criticalRules.natural1}</p>
            </div>
            <div class="p-4 bg-black/60 border border-[#eab308]/40 space-y-1">
              <strong class="text-[#eab308] block font-bold text-[11px] uppercase">✦ MARGEM DE AMEAÇA & MULTIPLICADOR</strong>
              <p class="text-[#cbd0dc] text-[11px] font-sans leading-relaxed">${RULES_DATA.coreMechanic.criticalRules.threatRange}</p>
            </div>
          </div>
        </section>

        <div class="grimoire-ritual-divider"><span class="text-[#e21b23] text-sm font-serif">✠ ☩ ✠</span></div>

        <!-- ============================================================ -->
        <!-- CAPÍTULO 3: PERÍCIAS, ORIGENS & INVENTÁRIO POR ESPAÇOS        -->
        <!-- ============================================================ -->
        <section id="sec-pericias-inventario" class="space-y-6 pt-2">
          <div class="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ CAPÍTULO 3 ]</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white">Perícias, Origens & Carga de Inventário</h2>
            </div>
            <span class="grimoire-stamp-badge hidden sm:inline-block">[ PREPARAÇÃO TÁTICA ]</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Regra de Perícias na Criação -->
            <div class="p-5 bg-[#08090c] border border-white/10 space-y-3">
              <span class="text-[10px] font-mono text-[#06b6d4] font-bold uppercase tracking-wider block">[ TOTAL DE PERÍCIAS INICIAIS ]</span>
              <h4 class="text-base font-serif font-bold text-white">${RULES_DATA.skillRules.title}</h4>
              <div class="p-2 bg-black/60 border border-[#06b6d4]/30 font-mono font-bold text-xs text-[#06b6d4]">
                ${RULES_DATA.skillRules.formula}
              </div>
              <div class="space-y-2 pt-1 text-xs">
                ${RULES_DATA.skillRules.classBreakdown.map(b => `
                  <div class="p-2.5 bg-black/40 border-l border-white/10 space-y-0.5">
                    <strong class="text-white block font-sans">${b.group}:</strong>
                    <span class="text-[#8e95a5] text-[11px] block">${b.classes}</span>
                    <span class="text-[#e21b23] font-mono font-bold text-[11px] block">${b.calc}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Origens & Passado Humano -->
            <div class="p-5 bg-[#08090c] border border-white/10 space-y-3 flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-mono text-[#8b5cf6] font-bold uppercase tracking-wider block">[ ANTECEDENTES HUMANOS ]</span>
                <h4 class="text-base font-serif font-bold text-white">${RULES_DATA.originsSystem.title}</h4>
                <p class="text-xs text-[#cbd0dc] leading-relaxed font-sans mt-2">
                  ${RULES_DATA.originsSystem.desc}
                </p>
              </div>
              <div class="pt-3 border-t border-white/10">
                <button onclick="window.ParoxismoApp.navigateTo('pericias')" class="text-xs font-mono text-[#06b6d4] hover:text-white flex items-center gap-1.5 cursor-pointer">
                  <span>✠</span>
                  <span>CONSULTAR AS 16 PERÍCIAS & 4 ORIGENS NO ATLAS COMPLETO →</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Inventário por Espaços -->
          <div class="p-5 bg-[#0a0d15] border border-white/10 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span class="text-[10px] font-mono text-[#eab308] font-bold tracking-widest uppercase block">[ GESTÃO SEM QUILOS ]</span>
                <h3 class="text-lg font-serif font-black text-white">${RULES_DATA.inventorySystem.title}</h3>
              </div>
              <div class="px-3 py-1 bg-black/60 border border-[#eab308]/40 text-[#eab308] font-mono font-black text-xs">
                ${RULES_DATA.inventorySystem.capacityFormula}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              ${RULES_DATA.inventorySystem.categories.map(c => `
                <div class="p-3 bg-[#05060a] border border-white/10 space-y-1">
                  <strong class="text-white font-serif block">${c.size}</strong>
                  <p class="text-[11px] text-[#8e95a5] font-sans leading-relaxed">${c.examples}</p>
                </div>
              `).join('')}
            </div>

            <div class="p-3 bg-red-950/30 border border-red-500/30 text-xs font-mono text-[#fca5a5]">
              ⚠️ <strong>${RULES_DATA.inventorySystem.overburdened}</strong>
            </div>
          </div>
        </section>

        <div class="grimoire-ritual-divider"><span class="text-[#e21b23] text-sm font-serif">✠ ✠ ✠</span></div>

        <!-- ============================================================ -->
        <!-- CAPÍTULO 4: RECURSOS VITAIS, MORTE & COMBATE                  -->
        <!-- ============================================================ -->
        <section id="sec-recursos-combate" class="space-y-8 pt-2">
          <div class="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ CAPÍTULO 4 ]</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white">Recursos Vitais, Morte & Combate</h2>
            </div>
            <span class="grimoire-stamp-badge hidden sm:inline-block">[ A CARNE E O ESFORÇO ]</span>
          </div>

          <!-- Painel PV e PE -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- PV & Regra de 0 PV -->
            <div class="p-5 bg-[#08090c] border-l-2 border-l-[#e21b23] border-t border-r border-b border-[#1d212c] space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-base font-serif font-black text-white uppercase">${RULES_DATA.resources.pv.name}</h4>
                <span class="text-xs font-mono text-[#e21b23] font-black">[ PV ]</span>
              </div>
              <p class="text-xs text-[#cbd0dc] font-sans">${RULES_DATA.resources.pv.initial}</p>
              <p class="text-xs text-[#8e95a5] font-sans">${RULES_DATA.resources.pv.perLevel}</p>

              <div class="p-3.5 bg-black/60 border border-[#e21b23]/40 space-y-2 pt-2 mt-2">
                <span class="text-[10px] font-mono text-[#ff555d] font-bold uppercase block">⚠️ ${RULES_DATA.resources.pv.dyingRule.title}</span>
                <p class="text-[11px] text-[#fca5a5] leading-relaxed font-sans">${RULES_DATA.resources.pv.dyingRule.desc}</p>
                <div class="space-y-1 text-[10px] font-mono text-white/80 border-t border-white/5 pt-2">
                  ${RULES_DATA.resources.pv.dyingRule.rules.map(r => `<div>• ${r}</div>`).join('')}
                </div>
              </div>
            </div>

            <!-- PE & Esforço Extra -->
            <div class="p-5 bg-[#08090c] border-l-2 border-l-[#06b6d4] border-t border-r border-b border-[#1d212c] space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-base font-serif font-black text-white uppercase">${RULES_DATA.resources.pe.name}</h4>
                <span class="text-xs font-mono text-[#06b6d4] font-black">[ PE ]</span>
              </div>
              <p class="text-xs text-[#cbd0dc] font-sans">${RULES_DATA.resources.pe.initial}</p>
              <p class="text-xs text-[#8e95a5] font-sans">${RULES_DATA.resources.pe.perLevel}</p>

              <div class="p-3.5 bg-black/60 border border-[#06b6d4]/40 space-y-2 pt-2 mt-2">
                <span class="text-[10px] font-mono text-[#06b6d4] font-bold uppercase block">⚡ REGULAMENTO DE LIMITE DE PE</span>
                <p class="text-[11px] text-[#a5f3fc] leading-relaxed font-sans">${RULES_DATA.resources.pe.limit}</p>
                <div class="p-2 bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[10px] font-mono text-white">
                  <strong>✦ ESFORÇO EXTRA:</strong> ${RULES_DATA.resources.pe.extraEffort}
                </div>
              </div>
            </div>
          </div>

          <!-- As 3 Reações Ativas na Carne -->
          <div id="regras-combate" class="space-y-4">
            <div class="flex items-center justify-between border-b border-[#242833] pb-2">
              <div>
                <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ COMBATE DINÂMICO ]</span>
                <h3 class="text-xl sm:text-2xl font-serif font-black text-white">Defesa Passiva & As 3 Reações Ativas</h3>
              </div>
              <span class="text-xs font-mono text-white/60">Defesa = 10 + AGI + Proteção</span>
            </div>

            <p class="text-xs sm:text-sm font-liturgical italic text-[#8e95a5] max-w-3xl">
              Em PAROXISMO, a defesa não é um número inerte. Fora do seu turno, quando for alvo de um ataque, o agente sacrifica sua 1 Reação da rodada para escolher uma das manobras defensivas:
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <!-- Reação 1: ESQUIVA -->
              <div class="reaction-card-grimoire">
                <div class="shizuka-tape-white">
                  <span class="font-serif font-black text-sm tracking-wider uppercase text-[#0d0e12]">1. ESQUIVA</span>
                  <span class="font-mono font-black text-xs text-[#0d0e12]">+ACROBACIA</span>
                </div>
                <div class="shizuka-strip-body space-y-2">
                  <span class="text-[9px] font-mono text-[#e21b23] font-bold block uppercase">[ REAÇÃO DE MOBILIDADE ]</span>
                  <p>${RULES_DATA.combat.reactions[0].mechanism}</p>
                  <p class="text-[#86efac] text-[10px] pt-1 font-mono">${RULES_DATA.combat.reactions[0].outcome}</p>
                </div>
              </div>

              <!-- Reação 2: BLOQUEIO -->
              <div class="reaction-card-grimoire">
                <div class="shizuka-tape-white">
                  <span class="font-serif font-black text-sm tracking-wider uppercase text-[#0d0e12]">2. BLOQUEIO</span>
                  <span class="font-mono font-black text-xs text-[#0d0e12]">RD VIGOR</span>
                </div>
                <div class="shizuka-strip-body space-y-2">
                  <span class="text-[9px] font-mono text-[#e21b23] font-bold block uppercase">[ ABSORÇÃO ANATÔMICA ]</span>
                  <p>${RULES_DATA.combat.reactions[1].mechanism}</p>
                  <p class="text-[#86efac] text-[10px] pt-1 font-mono">${RULES_DATA.combat.reactions[1].outcome}</p>
                </div>
              </div>

              <!-- Reação 3: CONTRA-ATAQUE -->
              <div class="reaction-card-grimoire">
                <div class="shizuka-tape-crimson">
                  <span class="font-serif font-black text-sm tracking-wider uppercase text-white">3. CONTRA-ATAQUE</span>
                  <span class="font-mono font-black text-xs text-white">RETALIAÇÃO</span>
                </div>
                <div class="shizuka-strip-body space-y-2">
                  <span class="text-[9px] font-mono text-[#ffffff] font-bold block uppercase">[ CONTRA-GOLPE LETAL ]</span>
                  <p class="text-[#f3f4f6]">${RULES_DATA.combat.reactions[2].mechanism}</p>
                  <p class="text-[#fca5a5] text-[10px] pt-1 font-mono">${RULES_DATA.combat.reactions[2].outcome}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Economia de Ações & Medo Visceral -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            <!-- Economia de Ações (7 colunas) -->
            <div class="lg:col-span-7 space-y-4">
              <div class="border-b border-[#242833] pb-2 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono text-[#e21b23] font-bold uppercase tracking-wider block">[ ECONOMIA DO TURNO ]</span>
                  <h4 class="text-lg sm:text-xl font-serif font-black text-white">O Ritmo da Batalha (Iniciativa 1d20+AGI)</h4>
                </div>
              </div>
              <div class="space-y-2">
                ${RULES_DATA.combat.economy.map((eco, idx) => `
                  <div class="p-3 bg-[#08090c] border border-[#1d212c] flex items-start gap-4 hover:border-[#384156] transition-colors">
                    <span class="font-mono text-[#e21b23] font-black text-xs min-w-[24px]">0${idx + 1}</span>
                    <div>
                      <h5 class="text-xs font-serif font-black text-white uppercase">${eco.type}</h5>
                      <p class="text-[11px] font-sans text-[#8e95a5] leading-relaxed mt-0.5">${eco.desc}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Horror Anatômico sem Sanidade (5 colunas) -->
            <div id="regras-medo" class="lg:col-span-5 space-y-4">
              <div class="border-b border-[#242833] pb-2 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono text-[#e21b23] font-bold uppercase tracking-wider block">[ METAFÍSICA DO TRAUMA ]</span>
                  <h4 class="text-lg sm:text-xl font-serif font-black text-white">${RULES_DATA.fearSystem.title}</h4>
                </div>
                <span class="grimoire-stamp-badge">[ SEM SANIDADE ]</span>
              </div>
              <p class="text-xs font-liturgical italic text-[#cbd0dc]">
                ${RULES_DATA.fearSystem.concept}
              </p>
              <div class="space-y-2 pt-1">
                ${RULES_DATA.fearSystem.conditions.map(c => `
                  <div class="p-3 bg-[#090a0e] border-l-2 border-[#e21b23] border-t border-r border-b border-[#1a1d26]">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-serif font-black text-xs text-white uppercase tracking-wider">${c.name}</span>
                      <span class="text-[9px] font-mono font-bold text-[#e21b23] uppercase">[ ${c.tag} ]</span>
                    </div>
                    <p class="text-[11px] font-sans text-[#8e95a5] leading-relaxed">${c.effect}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </section>

        <div class="grimoire-ritual-divider"><span class="text-[#e21b23] text-sm font-serif">✠ ☩ ✠</span></div>

        <!-- ============================================================ -->
        <!-- CAPÍTULO 5: O GUIA DAS 10 CLASSES DE PERSONAGEM (RESUMO)      -->
        <!-- ============================================================ -->
        <section id="sec-classes-guia" class="space-y-6 pt-2">
          <div class="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ CAPÍTULO 5 ]</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white">O Guia das 10 Classes de Agente</h2>
            </div>
            <button onclick="window.ParoxismoApp.navigateTo('classes')" class="text-xs font-mono text-[#06b6d4] hover:text-white flex items-center gap-1 cursor-pointer">
              <span>[ ABRIR ÁRVORES COMPLETAS → ]</span>
            </button>
          </div>

          <p class="text-xs sm:text-sm font-liturgical italic text-[#cbd0dc]">
            Cada classe representa a conduta militar, técnica ou esotérica que o agente utilizava no mundo civil ou forjou na contenção das aberrações:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${RULES_DATA.classesGuideSummary.map(cls => `
              <div class="p-4 bg-[#08090c] border border-white/10 hover:border-[#06b6d4]/50 transition-all space-y-2">
                <div class="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 class="font-serif font-black text-sm text-white uppercase">${cls.name}</h4>
                  <div class="flex items-center gap-2 text-[10px] font-mono">
                    <span class="text-[#e21b23] font-bold">PV: ${cls.pv}</span>
                    <span class="text-[#06b6d4] font-bold">PE: ${cls.pe}</span>
                  </div>
                </div>
                <div class="text-[11px] font-mono space-y-1">
                  <div><span class="text-[#8e95a5]">Proficiências:</span> <span class="text-white/80">${cls.prof}</span></div>
                  <div><span class="text-[#8e95a5]">Perícias:</span> <span class="text-white/80">${cls.skills}</span></div>
                </div>
                <div class="p-2 bg-black/50 border-l border-[#e21b23] text-[11px] font-serif italic text-[#cbd0dc]">
                  ${cls.initialPower}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <div class="grimoire-ritual-divider"><span class="text-[#e21b23] text-sm font-serif">✠ ✠ ✠</span></div>

        <!-- ============================================================ -->
        <!-- CAPÍTULO 6: O SISTEMA DAS 10 EMOÇÕES & DANO ELEMENTAL         -->
        <!-- ============================================================ -->
        <section id="sec-emocoes-dano" class="space-y-6 pt-2">
          <div class="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ CAPÍTULO 6 ]</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white">${RULES_DATA.elementalSystem.title}</h2>
            </div>
            <span class="grimoire-stamp-badge hidden sm:inline-block">[ IGNORA RD FÍSICA ]</span>
          </div>

          <div class="p-4 bg-[#0a0d15] border border-[#06b6d4]/40 text-xs text-[#cbd0dc] leading-relaxed font-sans">
            <strong class="text-[#06b6d4] font-mono uppercase block mb-1">O QUE É O DANO ELEMENTAL?</strong>
            ${RULES_DATA.elementalSystem.definition}
          </div>

          <!-- Tabela das 10 Emoções com Dano e Condição Especial -->
          <div class="space-y-3">
            <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ TIPOS DE DANO & EFEITOS DE CRÍTICO ]</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              ${RULES_DATA.elementalSystem.emotionsTable.map(e => `
                <div class="p-3 bg-[#08090c] border border-white/10 space-y-2 flex flex-col justify-between">
                  <div>
                    <strong class="font-serif font-bold text-xs text-white block">${e.emotion}</strong>
                    <span class="text-[10px] font-mono text-[#06b6d4] font-bold block mt-0.5">${e.dmgType}</span>
                  </div>
                  <div class="pt-2 border-t border-white/5 text-[10px] text-[#8e95a5] leading-relaxed">
                    <strong class="text-[#e21b23] block text-[9px] font-mono uppercase">CONDIÇÃO EM CRÍTICO:</strong>
                    ${e.critCondition}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Roda de Oposição Decagonal -->
          <div class="p-5 bg-[#090b12] border border-white/10 space-y-4">
            <div class="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span class="text-[10px] font-mono text-[#06b6d4] font-bold uppercase tracking-wider block">[ DINÂMICA DECAGONAL ]</span>
                <h3 class="text-lg font-serif font-black text-white">${RULES_DATA.elementalSystem.oppositionWheel.title}</h3>
              </div>
              <div class="flex items-center gap-3 text-[10px] font-mono">
                <span class="text-green-400 font-bold">VANTAGEM: +1d6 a +3d6</span>
                <span class="text-red-400 font-bold">DESVANTAGEM: RD 5</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div class="p-3 bg-black/50 border border-green-500/30 text-white/90">
                <strong class="text-green-400 block mb-1">✦ VANTAGEM ELEMENTAL:</strong>
                <p class="text-[11px] text-[#cbd0dc] font-sans">${RULES_DATA.elementalSystem.oppositionWheel.advantage}</p>
              </div>
              <div class="p-3 bg-black/50 border border-red-500/30 text-white/90">
                <strong class="text-red-400 block mb-1">✦ DESVANTAGEM ELEMENTAL:</strong>
                <p class="text-[11px] text-[#cbd0dc] font-sans">${RULES_DATA.elementalSystem.oppositionWheel.disadvantage}</p>
              </div>
            </div>

            <!-- Ciclo Decagonal dos 10 Passos -->
            <div class="p-3.5 bg-black/60 border border-white/5 space-y-2">
              <span class="text-[10px] font-mono text-[#8e95a5] uppercase block font-bold">O CICLO OFICIAL DE VITÓRIA:</span>
              <div class="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                ${RULES_DATA.elementalSystem.oppositionWheel.cycle.map((c, i) => `
                  <span class="px-2 py-1 bg-[#121622] border border-white/10 text-white/90">${c}</span>
                  ${i < RULES_DATA.elementalSystem.oppositionWheel.cycle.length - 1 ? '<span class="text-[#e21b23] font-black">➔</span>' : ''}
                `).join('')}
              </div>
            </div>
          </div>
        </section>

        <div class="grimoire-ritual-divider"><span class="text-[#e21b23] text-sm font-serif">✠ ☩ ✠</span></div>

        <!-- ============================================================ -->
        <!-- CAPÍTULO 7: COMO FUNCIONAM OS RITUAIS NA PRÁTICA             -->
        <!-- ============================================================ -->
        <section id="sec-rituais-pratica" class="space-y-6 pt-2">
          <div class="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ CAPÍTULO 7 ]</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white">${RULES_DATA.ritualsPractical.title}</h2>
            </div>
            <button onclick="window.ParoxismoApp.navigateTo('grimorio')" class="text-xs font-mono text-[#a855f7] hover:text-white flex items-center gap-1 cursor-pointer">
              <span>[ CONSULTAR OS 200 RITUAIS NO GRIMÓRIO → ]</span>
            </button>
          </div>

          <!-- Regra de Instantaneidade em Combate -->
          <div class="p-5 bg-[#0a0d15] border-l-2 border-l-[#a855f7] border-t border-r border-b border-[#1d212c] space-y-3">
            <span class="text-[10px] font-mono text-[#a855f7] font-bold uppercase tracking-wider block">[ VELOCIDADE DE EXECUÇÃO ]</span>
            <h4 class="text-base font-serif font-bold text-white">${RULES_DATA.ritualsPractical.instantRule.title}</h4>
            <p class="text-xs sm:text-sm text-[#e9d5ff] font-sans leading-relaxed font-bold">
              ${RULES_DATA.ritualsPractical.instantRule.coreRule}
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              ${RULES_DATA.ritualsPractical.instantRule.methods.map(m => `
                <div class="p-3 bg-black/50 border border-white/5 space-y-1">
                  <strong class="text-white font-mono block text-[11px]">${m.name}</strong>
                  <p class="text-[#8e95a5] text-[11px] font-sans">${m.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Círculos e Orçamento de PE -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${RULES_DATA.ritualsPractical.circlesBudget.map(cb => `
              <div class="p-4 bg-[#08090c] border border-white/10 space-y-2 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <strong class="font-serif font-bold text-sm text-white">${cb.circle}</strong>
                    <span class="text-xs font-mono text-[#a855f7] font-black">${cb.cost}</span>
                  </div>
                  <span class="text-[10px] font-mono text-[#8e95a5] block uppercase font-bold">[ Desbloqueio: ${cb.unlock} ]</span>
                  <p class="text-[11px] font-sans text-[#cbd0dc] leading-relaxed mt-2">${cb.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Ampliação -->
          <div class="p-4 bg-black/60 border border-white/10 text-xs text-[#cbd0dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong class="text-[#a855f7] font-mono uppercase block text-[11px]">${RULES_DATA.ritualsPractical.amplificationRule.title}</strong>
              <p class="text-[11px] font-sans text-[#8e95a5] mt-0.5">${RULES_DATA.ritualsPractical.amplificationRule.desc}</p>
            </div>
          </div>
        </section>

        <div class="grimoire-ritual-divider"><span class="text-[#e21b23] text-sm font-serif">✠ ✠ ✠</span></div>

        <!-- ============================================================ -->
        <!-- CAPÍTULO 8: CÁLCULO DE CD & TESTES DE RESISTÊNCIA             -->
        <!-- ============================================================ -->
        <section id="sec-cd-resistencias" class="space-y-6 pt-2">
          <div class="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ CAPÍTULO 8 ]</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white">${RULES_DATA.resistanceRules.title}</h2>
            </div>
            <div class="px-3 py-1 bg-black/60 border border-[#eab308]/40 text-[#eab308] font-mono font-black text-xs">
              ${RULES_DATA.resistanceRules.formula}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div class="p-4 bg-[#08090c] border border-white/10 space-y-1">
              <strong class="text-[#eab308] font-mono uppercase block text-[11px]">✦ ATRIBUTO-CHAVE DA CONJURAÇÃO:</strong>
              <p class="text-[#cbd0dc] text-[11px] leading-relaxed">${RULES_DATA.resistanceRules.keyAttributesDesc}</p>
            </div>
            <div class="p-4 bg-[#08090c] border border-white/10 space-y-1">
              <strong class="text-[#eab308] font-mono uppercase block text-[11px]">✦ ESCALA DE TREINAMENTO POR NÍVEL:</strong>
              <p class="text-[#cbd0dc] text-[11px] leading-relaxed">${RULES_DATA.resistanceRules.trainingScalingDesc}</p>
            </div>
          </div>

          <!-- Os 4 Testes de Resistência -->
          <div class="space-y-3">
            <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">
              [ OS 4 TESTES DE RESISTÊNCIA: 1d20 + ATRIBUTO + TREINAMENTO VS CD ]
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              ${RULES_DATA.resistanceRules.saveTypes.map(s => `
                <div class="p-4 bg-[#08090c] border border-white/10 space-y-3 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                      <strong class="font-serif font-bold text-sm text-white uppercase">${s.name}</strong>
                      <span class="text-[10px] font-mono text-[#06b6d4] font-bold bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-1.5 py-0.5">${s.attr}</span>
                    </div>
                    <p class="text-[11px] font-sans text-[#8e95a5] leading-relaxed">${s.targets}</p>
                  </div>
                  <div class="space-y-1.5 pt-2 border-t border-white/5 text-[11px]">
                    <div class="text-[#86efac]"><strong class="font-mono">SE PASSAR:</strong> ${s.pass}</div>
                    <div class="text-[#fca5a5]"><strong class="font-mono">SE FALHAR:</strong> ${s.fail}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Críticos e Regras Especiais de Resistência -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div class="p-3 bg-black/60 border border-green-500/30 text-white/90">
              <strong class="text-green-400 block mb-0.5 font-bold">✦ 20 NATURAL NA RESISTÊNCIA:</strong>
              <p class="text-[11px] font-sans text-[#cbd0dc]">${RULES_DATA.resistanceRules.criticalSuccess}</p>
            </div>
            <div class="p-3 bg-black/60 border border-red-500/30 text-white/90">
              <strong class="text-red-400 block mb-0.5 font-bold">✦ 1 NATURAL NA RESISTÊNCIA:</strong>
              <p class="text-[11px] font-sans text-[#cbd0dc]">${RULES_DATA.resistanceRules.criticalFailure}</p>
            </div>
          </div>

          <div class="p-3.5 bg-black/60 border border-white/10 text-xs font-mono text-[#cbd0dc] space-y-1.5">
            <p><strong class="text-[#06b6d4]">LIBERAÇÃO POR RODADA:</strong> ${RULES_DATA.resistanceRules.breakFree}</p>
            <p class="pt-1 border-t border-white/5"><strong class="text-[#e21b23]">BIDIRECIONALIDADE:</strong> ${RULES_DATA.resistanceRules.bidirectional}</p>
          </div>
        </section>

        <div class="grimoire-ritual-divider"><span class="text-[#e21b23] text-sm font-serif">✠ ☩ ✠</span></div>

        <!-- ============================================================ -->
        <!-- CAPÍTULO 9: TABELA DE PROGRESSÃO & OS 6 ESTÁGIOS (NÍVEL 1-20)  -->
        <!-- ============================================================ -->
        <section id="sec-tabela-progressao" class="space-y-6 pt-2">
          <div class="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ CAPÍTULO 9 ]</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white">Tabela de Progressão & Os 6 Estágios da Alma</h2>
            </div>
            <span class="grimoire-stamp-badge hidden sm:inline-block">[ NÍVEL 1 AO 20 ]</span>
          </div>

          <!-- A Regra Sagrada das Fusões -->
          <div class="p-4 bg-[#0a0d15] border-l-2 border-l-[#e21b23] border-t border-r border-b border-white/10 space-y-1">
            <span class="text-[10px] font-mono text-[#e21b23] font-bold uppercase tracking-widest block">
              ${RULES_DATA.fusionsEvolutionRule.title}
            </span>
            <p class="text-xs sm:text-sm text-[#cbd0dc] font-sans leading-relaxed">
              ${RULES_DATA.fusionsEvolutionRule.text}
            </p>
          </div>

          <!-- Os 6 Estágios Oficiais -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${RULES_DATA.stages.map((stg, idx) => `
              <div class="p-4 bg-[#08090c] border border-white/10 space-y-2">
                <div class="flex items-center justify-between border-b border-white/5 pb-2">
                  <strong class="font-serif font-bold text-xs text-white uppercase">${stg.stage}</strong>
                  <span class="text-[9px] font-mono text-[#e21b23] font-bold">[ ESTÁGIO 0${idx + 1} ]</span>
                </div>
                <span class="text-[10px] font-mono text-[#06b6d4] block">${stg.level}</span>
                <p class="text-[11px] font-sans text-[#8e95a5] leading-relaxed">${stg.desc}</p>
              </div>
            `).join('')}
          </div>

          <!-- Tabela de Progressão Nível 1 ao 20 -->
          <div class="overflow-x-auto border border-white/10 bg-[#07090e]">
            <table class="w-full min-w-[660px] text-left border-collapse text-xs font-mono">
              <thead>
                <tr class="bg-[#0f1422] border-b border-white/10 text-[10px] text-white/60">
                  <th class="p-2.5">NÍVEL</th>
                  <th class="p-2.5">GRAU PAROXISMO</th>
                  <th class="p-2.5">TREINO</th>
                  <th class="p-2.5">LIMITE PE/ROD</th>
                  <th class="p-2.5">ATRIBUTO</th>
                  <th class="p-2.5">RITUAIS</th>
                  <th class="p-2.5">DESBLOQUEIOS DE ESTÁGIO & HABILIDADES</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                ${RULES_DATA.progressionTableOfficial.map(row => `
                  <tr class="hover:bg-white/[0.03] transition-colors ${[1, 4, 8, 12, 16, 20].includes(row.level) ? 'bg-[#0f1420]/40' : ''}">
                    <td class="p-2.5 font-bold text-white">${row.level}</td>
                    <td class="p-2.5 text-[#e21b23] font-bold">${row.paroxismo}</td>
                    <td class="p-2.5 text-white">${row.training}</td>
                    <td class="p-2.5 text-[#06b6d4] font-bold">${row.peLimit} PE</td>
                    <td class="p-2.5 text-[#eab308]">${row.attr}</td>
                    <td class="p-2.5 text-[#a855f7]">${row.ritualCircle}</td>
                    <td class="p-2.5 text-[#cbd0dc] font-sans text-[11px]">${row.general}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <div class="grimoire-ritual-divider"><span class="text-[#e21b23] text-sm font-serif">✠ ✠ ✠</span></div>

        <!-- ============================================================ -->
        <!-- CAPÍTULO 10: O MAPA DOS 6 DOCUMENTOS OFICIAIS DO SISTEMA     -->
        <!-- ============================================================ -->
        <section id="sec-mapa-documentos" class="space-y-6 pt-2 pb-12">
          <div class="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">[ CAPÍTULO 10 ]</span>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white">O Mapa dos 6 Documentos Oficiais</h2>
            </div>
            <span class="grimoire-stamp-badge hidden sm:inline-block">[ BIBLIOTECA COMPLETA ]</span>
          </div>

          <p class="text-xs sm:text-sm font-liturgical italic text-[#cbd0dc]">
            Para consulta aprofundada de qualquer capítulo específico, a biblioteca oficial de PAROXISMO está dividida nos seguintes documentos canônicos:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${RULES_DATA.documentsMap.map(doc => `
              <div class="p-4 bg-[#08090c] border border-white/10 space-y-2 hover:border-[#e21b23] transition-colors">
                <div class="flex items-center justify-between border-b border-white/5 pb-2">
                  <span class="font-mono text-[#e21b23] font-bold text-xs">[ TOMO 0${doc.num} ]</span>
                  <span class="text-[9px] font-mono text-white/40">CANÔNICO</span>
                </div>
                <h4 class="font-serif font-black text-sm text-white">${doc.title}</h4>
                <p class="text-[11px] font-sans text-[#8e95a5] leading-relaxed">${doc.content}</p>
              </div>
            `).join('')}
          </div>
        </section>

      </div>
    `;

    if (params && (params.ruleAnchor || params.targetAnchor)) {
      const anchor = params.ruleAnchor || params.targetAnchor;
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  // ============================================================
  // 3. AS 10 CLASSES — DOSSIÊ DO AGENTE AAA
  // ============================================================
  renderClasses(container) {
    if (this.selectedStyleIndex === undefined) this.selectedStyleIndex = 0;

    const selectedClass = CLASSES_DATA.find(c => c.id === this.selectedClassId) || CLASSES_DATA[0];
    const classIdx = CLASSES_DATA.findIndex(c => c.id === selectedClass.id);
    const classNumber = String(classIdx + 1).padStart(2, '0');

    // Ícones Vetoriais SVG Elegantes (Sem emojis)
    const CLASS_ICONS = {
      'combate': `<svg class="w-6 h-6 text-[#e21b23] inline-block filter drop-shadow-[0_0_8px_#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline><line x1="5" y1="14" x2="9" y2="18"></line><line x1="7" y1="17" x2="4" y2="20"></line><line x1="3" y1="19" x2="5" y2="21"></line></svg>`,
      'investigador': `<svg class="w-6 h-6 text-[#e21b23] inline-block filter drop-shadow-[0_0_8px_#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
      'ocultista': `<svg class="w-6 h-6 text-[#e21b23] inline-block filter drop-shadow-[0_0_8px_#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon><circle cx="12" cy="12" r="3"></circle></svg>`,
      'tatico': `<svg class="w-6 h-6 text-[#e21b23] inline-block filter drop-shadow-[0_0_8px_#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
      'infiltrador': `<svg class="w-6 h-6 text-[#e21b23] inline-block filter drop-shadow-[0_0_8px_#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon><line x1="12" y1="17" x2="12" y2="22"></line></svg>`,
      'metamaturgo': `<svg class="w-6 h-6 text-[#e21b23] inline-block filter drop-shadow-[0_0_8px_#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V2"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>`,
      'duelista': `<svg class="w-6 h-6 text-[#e21b23] inline-block filter drop-shadow-[0_0_8px_#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"></path><path d="m13 19 6-6"></path><path d="m16 16 4 4"></path><path d="m19 21 2-2"></path></svg>`,
      'flagelador': `<svg class="w-6 h-6 text-[#e21b23] inline-block filter drop-shadow-[0_0_8px_#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
      'receptaculo': `<svg class="w-6 h-6 text-[#e21b23] inline-block filter drop-shadow-[0_0_8px_#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
      'liturgista': `<svg class="w-6 h-6 text-[#e21b23] inline-block filter drop-shadow-[0_0_8px_#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="5" y1="8" x2="19" y2="8"></line><line x1="8" y1="14" x2="16" y2="14"></line></svg>`
    };

    const classIcon = CLASS_ICONS[selectedClass.id] || CLASS_ICONS['combate'];

    const heroImages = {
      'combate': 'assets/images/Combate.png',
      'investigador': 'assets/images/Investigador.jpeg',
      'ocultista': 'assets/images/Ocultista.png',
      'duelista': 'assets/images/Duelista.png',
      'tatico': 'assets/images/Tatico.png',
      'infiltrador': 'assets/images/Infiltrador.png',
      'metamaturgo': 'assets/images/Metamaturgo.png',
      'flagelador': 'assets/images/Flagelador.png',
      'receptaculo': 'assets/images/Receptaculo.png',
      'liturgista': 'assets/images/Liturgista.png'
    };

    const rawHeroImg = heroImages[selectedClass.id] || 'assets/images/Combate.png';
    const currentHeroImg = encodeURI(rawHeroImg);

    // Linha do tempo dos 6 Estágios de Progressão (RULES_DATA.progressionTable)
    const canonicalTimeline = [
      { lvl: '01', title: 'Estágio I: O Despertar', desc: 'Arma Grau 1 & 1º Poder Primário' },
      { lvl: '04', title: 'Estágio II: Ressonância Híbrida', desc: '1ª Fusão de Poder & +1 Atributo' },
      { lvl: '08', title: 'Estágio III: Catalisação da Alma', desc: '+1 Margem de Crítico & +1 Atributo' },
      { lvl: '12', title: 'Estágio IV: Paroxismo Menor', desc: 'Sobrecarga de Aura 6m & +1 Atributo' },
      { lvl: '16', title: 'Estágio V: Apoteose', desc: '2ª Fusão Avançada & RD Elemental 10' },
      { lvl: '20', title: 'Estágio VI: Paroxismo Total / Avatar', desc: 'Forma Divina (1d4+1 rodadas de Onipotência)' }
    ];

    // Habilidades Iniciais da Classe (Grau I • Níveis 1 a 4)
    const coreAbilities = selectedClass.abilities.slice(0, 3);

    container.innerHTML = `
      <div class="max-w-[1400px] mx-auto py-6 sm:py-8 px-2 sm:px-6 space-y-8">
        
        <!-- CABEÇALHO // DOSSIÊ DE AGENTE -->
        <div class="border-b border-[#242833] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div class="dossier-jp-tag mb-1.5 flex items-center gap-2">
              <span class="text-xs font-mono font-black text-[#8e95a5] uppercase tracking-widest">// DOSSIÊ DE AGENTE</span>
              <span class="text-[#e21b23] font-mono text-xs font-bold">[ PROTOCOLO OMEGA ]</span>
            </div>
            <h1 class="text-3xl sm:text-4xl xl:text-5xl font-serif font-black tracking-wider text-white flex items-center gap-3">
              <span>${selectedClass.name}</span>
              <span class="text-sm font-mono text-[#e21b23] font-normal border border-[#e21b23]/40 px-2 py-0.5">FILE REF: ${classNumber}-${selectedClass.id.toUpperCase().substring(0,3)}</span>
            </h1>
            <p class="text-xs sm:text-sm font-liturgical italic text-[#8e95a5] mt-1">
              ${selectedClass.subtitle}
            </p>
          </div>

          <!-- ALTERNADOR DE MODO: 1. DOSSIÊ / 2. ÁRVORE DE HABILIDADES -->
          <div class="flex items-center gap-2">
            <button class="class-mode-toggle-btn px-3 py-1.5 text-xs font-mono font-bold border transition-all ${this.classMode !== 'tree' ? 'bg-[#e21b23] text-black border-[#e21b23] shadow-[0_0_12px_rgba(226,27,35,0.4)]' : 'bg-[#08090d] text-white border-[#242833] hover:border-[#3a4254]'}" data-mode="dossier">
              [ 1. DOSSIÊ DO AGENTE ]
            </button>
            <button class="class-mode-toggle-btn px-3 py-1.5 text-xs font-mono font-bold border transition-all ${this.classMode === 'tree' ? 'bg-[#e21b23] text-black border-[#e21b23] shadow-[0_0_12px_rgba(226,27,35,0.4)]' : 'bg-[#08090d] text-white border-[#242833] hover:border-[#3a4254]'}" data-mode="tree">
              [ 2. ÁRVORE DE HABILIDADES ]
            </button>
          </div>
        </div>

        <!-- SELETOR HORIZONTAL DE CLASSES (SEM BARRA DE ROLAGEM) -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#1b1f2b] no-scrollbar" style="scrollbar-width: none; -ms-overflow-style: none;">
          ${CLASSES_DATA.map((c, i) => {
            const num = String(i + 1).padStart(2, '0');
            const isActive = c.id === selectedClass.id;
            return `
              <button class="dossier-class-tab ${isActive ? 'active' : ''} flex items-center px-3 py-1.5" data-id="${c.id}">
                <span class="font-mono text-xs font-bold tracking-wide"><strong class="text-[#e21b23] mr-1">${num}.</strong>${c.name.replace('O ', '').toUpperCase()}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- CONTEÚDO PRINCIPAL: MODO DOSSIÊ OU MODO ÁRVORE -->
        ${this.classMode === 'tree' ? this.renderSkillTree(selectedClass, { number: classNumber }, currentHeroImg) : `
          <!-- AS TRÊS GRANDES REGIÕES (ESQUERDA, CENTRO, DIREITA) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
            
            <!-- ============================================================ -->
            <!-- REGIÃO ESQUERDA: RETRATO DE ARQUIVO / TARÔ + METADADOS + TIMELINE -->
            <!-- ============================================================ -->
            <div class="lg:col-span-4 space-y-4">
              
              <!-- Metadados Acima do Retrato (Sem Nível de Ameaça) -->
              <div class="p-3.5 bg-[#08090d] border border-[#1e2330] space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-black text-[#ffffff]">${classNumber} / 10</span>
                    <span class="text-[9px] font-mono font-bold text-[#e21b23] border border-[#e21b23]/40 px-1.5 py-0.2 uppercase">[ ARQUIVO RESTRITO // GRAU OMEGA ]</span>
                  </div>
                  <div>${classIcon}</div>
                </div>

                <div class="text-[10px] font-mono text-[#8e95a5] uppercase tracking-wider font-bold pt-1 border-t border-[#191c26]">
                  ARQUÉTIPO: ${selectedClass.tacticalRole.split(',')[0]}
                </div>
              </div>

              <!-- Grande Retrato (Carta de Tarô / Fotografia de Arquivo) -->
              <div class="agent-tarot-frame group">
                <img src="${currentHeroImg}" alt="${selectedClass.name}" />
                <div class="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                  <span class="text-xs font-serif font-black tracking-widest text-white uppercase drop-shadow-[0_2px_8px_#000000]">${selectedClass.name}</span>
                  <span class="text-[10px] font-mono text-[#e21b23] font-bold drop-shadow-[0_0_6px_#e21b23]">TAROT N° ${classNumber}</span>
                </div>
              </div>

              <!-- Embaixo do Retrato: Linha do Tempo dos Desbloqueios -->
              <div class="p-4 bg-[#08090d] border border-[#1e2330] space-y-3">
                <div class="flex items-center justify-between border-b border-[#1b1f2b] pb-2">
                  <span class="text-[10px] font-mono font-bold text-[#e21b23] uppercase">[ TRAJETÓRIA DE DESBLOQUEIOS ]</span>
                  <span class="text-[9px] font-mono text-[#8e95a5]">NÍVEL 1 AO 20</span>
                </div>

                <!-- Trilhas dos 6 Estágios de Progressão -->
                <div class="space-y-2">
                  ${canonicalTimeline.map((t, idx) => `
                    <div class="flex items-center gap-3 text-xs py-1 border-b border-[#141720] last:border-0 hover:pl-1 transition-all">
                      <span class="font-mono font-black text-[#e21b23] text-[10px] min-w-[38px]">NV ${t.lvl}</span>
                      <div class="flex-1 min-w-0">
                        <span class="font-serif font-bold text-white block text-[11px]">${t.title}</span>
                        <span class="text-[10px] font-sans text-[#8e95a5] block truncate">${t.desc}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>

            <!-- ============================================================ -->
            <!-- REGIÃO CENTRAL: HABILIDADES DE CLASSE (GRAU I)                -->
            <!-- ============================================================ -->
            <div class="lg:col-span-5 space-y-4">
              
              <div class="flex items-center justify-between border-b border-[#242833] pb-2">
                <div>
                  <span class="text-[10px] font-mono text-[#e21b23] font-bold uppercase tracking-widest block">[ HABILIDADES DE CLASSE ]</span>
                  <h3 class="text-xl sm:text-2xl font-serif font-black text-white">Habilidades Fundamentais</h3>
                </div>
                <button class="open-tree-inline-btn text-[10px] font-mono text-[#e21b23] hover:underline uppercase font-bold">
                  [ VER ÁRVORE DE HABILIDADES → ]
                </button>
              </div>

              <p class="text-xs font-liturgical italic text-[#8e95a5]">
                Poderes iniciais de <strong>${selectedClass.name}</strong> (Grau I • Níveis 1 a 4).
              </p>

              <!-- As 3 Cartas Físicas da Classe -->
              <div class="space-y-4 pt-1">
                ${coreAbilities.map((a, sIdx) => {
                  const isSelected = this.selectedStyleIndex === sIdx;
                  const isCrimson = a.type.toLowerCase().includes('ataque') || a.type.toLowerCase().includes('reação') || a.cost.includes('4') || a.cost.includes('5');
                  return `
                    <div class="physical-combat-card ${isSelected ? 'active' : ''}" data-style-idx="${sIdx}">
                      
                      <!-- Fita Superior Rasgada -->
                      <div class="${isCrimson ? 'shizuka-tape-crimson' : 'shizuka-tape-white'}">
                        <span class="font-serif font-black text-xs sm:text-sm tracking-wider uppercase ${isCrimson ? 'text-white' : 'text-[#0d0e12]'}">
                          HABILIDADE #${String(a.num).padStart(2, '0')} • ${a.name}
                        </span>
                        <span class="font-mono font-black text-[11px] ${isCrimson ? 'text-white' : 'text-[#0d0e12]'}">
                          ${a.cost}
                        </span>
                      </div>

                      <!-- Corpo da Carta Física -->
                      <div class="shizuka-strip-body space-y-2.5">
                        <div class="flex items-center justify-between">
                          <span class="text-[9px] font-mono font-bold text-[#e21b23] uppercase">[ TIPO: ${a.type} ]</span>
                          ${isSelected ? '<span class="text-[8px] font-mono font-bold bg-[#e21b23] text-black px-1.5 py-0.2 uppercase">SELECIONADO</span>' : ''}
                        </div>

                        <p class="text-xs font-sans text-white leading-relaxed">
                          ${a.desc}
                        </p>

                        <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#8e95a5]">
                          <span>Classe: <strong class="text-white">${selectedClass.name}</strong></span>
                          <span class="text-[#e21b23]">Grau I • Despertar</span>
                        </div>
                      </div>

                    </div>
                  `;
                }).join('')}
              </div>

            </div>

            <!-- ============================================================ -->
            <!-- REGIÃO DIREITA: RELATÓRIO MILITAR DE CAMPO                   -->
            <!-- ============================================================ -->
            <div class="lg:col-span-3 space-y-4">
              
              <div class="military-dossier-sheet space-y-5">
                
                <!-- Cabeçalho do Relatório Militar -->
                <div class="border-b border-[#222836] pb-3 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-mono text-[#e21b23] font-black uppercase">[ DOSSIÊ MILITAR ]</span>
                    <span class="text-[9px] font-mono text-[#8e95a5]">EXP-REF #${classNumber}</span>
                  </div>
                  <h4 class="text-lg font-serif font-black text-white uppercase tracking-wider">Relatório de Campo</h4>
                  <span class="text-[10px] font-mono text-[#8e95a5] block">COMANDO GERAL DE CONTENÇÃO</span>
                </div>

                <!-- Biometria de Combate (HUD / Cockpit) -->
                <div class="space-y-3">
                  <span class="text-[10px] font-mono text-[#e21b23] font-bold block uppercase">[ RESERVAS BIOMÉTRICAS ]</span>
                  
                  <div class="p-2.5 bg-[#0a0c11] border border-[#1b1f2b] flex items-center justify-between">
                    <div>
                      <span class="text-[9px] font-mono text-[#8e95a5] block uppercase">PONTOS DE VIDA (PV)</span>
                      <strong class="text-base font-mono font-black text-white">${selectedClass.pvInitial}</strong>
                    </div>
                    <span class="text-[10px] font-mono text-[#e21b23] font-bold">${selectedClass.pvPerLevel} / nv</span>
                  </div>

                  <div class="p-2.5 bg-[#0a0c11] border border-[#1b1f2b] flex items-center justify-between">
                    <div>
                      <span class="text-[9px] font-mono text-[#8e95a5] block uppercase">PONTOS DE ESFORÇO (PE)</span>
                      <strong class="text-base font-mono font-black text-white">${selectedClass.peInitial}</strong>
                    </div>
                    <span class="text-[10px] font-mono text-[#e21b23] font-bold">${selectedClass.pePerLevel} / nv</span>
                  </div>
                </div>

                <!-- Diretriz Tática -->
                <div class="space-y-1.5">
                  <span class="text-[10px] font-mono text-[#e21b23] font-bold block uppercase">[ DIRETRIZ TÁTICA ]</span>
                  <p class="text-xs font-sans text-[#cbd0dc] leading-relaxed">
                    ${selectedClass.tacticalRole}
                  </p>
                </div>

                <!-- Armamento & Blindagem -->
                <div class="space-y-1.5">
                  <span class="text-[10px] font-mono text-[#e21b23] font-bold block uppercase">[ ARMAMENTO & BLINDAGEM ]</span>
                  <p class="text-xs font-sans text-[#cbd0dc] leading-relaxed">
                    ${selectedClass.proficiencies}
                  </p>
                </div>

                <!-- Perícias Fundamentais -->
                <div class="space-y-1.5">
                  <span class="text-[10px] font-mono text-[#e21b23] font-bold block uppercase">[ PERÍCIAS DE TREINO ]</span>
                  <p class="text-[11px] font-mono text-[#8e95a5] leading-relaxed">
                    ${selectedClass.initialSkills}
                  </p>
                </div>

                <!-- Atributos Recomendados -->
                <div class="space-y-1.5">
                  <span class="text-[10px] font-mono text-[#e21b23] font-bold block uppercase">[ ATRIBUTOS RECOMENDADOS ]</span>
                  <p class="text-[11px] font-mono text-[#e21b23] font-bold leading-relaxed">
                    ${selectedClass.recommendedAttrs || 'Vigor e Força'}
                  </p>
                </div>

                <!-- Diretriz de Esforço e Limite de PE -->
                <div class="p-3 bg-[#0d0708] border border-[#e21b23]/30 text-left space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-[#e21b23] rounded-full animate-ping"></span>
                    <span class="text-[9px] font-mono font-black text-[#e21b23] uppercase">DIRETRIZ DE ESFORÇO</span>
                  </div>
                  <p class="text-[11px] font-liturgical italic text-[#cbd0dc] leading-relaxed">
                    O limite de PE por rodada é rigorosamente igual ao Nível do Agente. Gastar 1 PE extra concede +2 em qualquer teste ou 1 Movimento extra.
                  </p>
                </div>

                <!-- Botão de Acesso para a Árvore de Habilidades (Corrigido) -->
                <button id="open-skill-tree-btn" class="w-full btn-ritual-blood mt-2 cursor-pointer">
                  [ ABRIR ÁRVORE DE HABILIDADES → ]
                </button>

              </div>

            </div>

          </div>
        `}

      </div>
    `;

    // Interatividade: Alternador de Modo (Dossiê vs Árvore)
    const openTreeMode = () => {
      soundFX.playRuneClick();
      this.classMode = 'tree';
      this.renderClasses(container);
    };

    const openDossierMode = () => {
      soundFX.playRuneClick();
      this.classMode = 'dossier';
      this.renderClasses(container);
    };

    container.querySelectorAll('.class-mode-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        if (mode === 'tree') openTreeMode();
        else openDossierMode();
      });
    });

    const openTreeBtn = container.querySelector('#open-skill-tree-btn');
    if (openTreeBtn) {
      openTreeBtn.addEventListener('click', openTreeMode);
    }

    container.querySelectorAll('.open-tree-inline-btn').forEach(btn => {
      btn.addEventListener('click', openTreeMode);
    });

    container.querySelectorAll('.back-to-dossier-btn').forEach(btn => {
      btn.addEventListener('click', openDossierMode);
    });

    // Interatividade: Seleção de Classe via Abas Confidenciais
    container.querySelectorAll('.dossier-class-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.selectedClassId = btn.getAttribute('data-id');
        this.selectedStyleIndex = 0;
        this.selectedAbilityIndex = 0;
        this.renderClasses(container);
      });
    });

    // Interatividade: Seleção de Carta Física (Modo Dossiê)
    container.querySelectorAll('.physical-combat-card').forEach(card => {
      card.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.selectedStyleIndex = parseInt(card.getAttribute('data-style-idx'));
        this.renderClasses(container);
      });
    });

    // Interatividade: Seleção de Habilidade na Árvore (Modo Árvore)
    container.querySelectorAll('.skill-tree-node-card').forEach(card => {
      card.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.selectedAbilityIndex = parseInt(card.getAttribute('data-ability-idx'));
        this.renderClasses(container);
      });
    });
  }

  // ============================================================
  // RENDERIZADOR DA ÁRVORE DE HABILIDADES
  // ============================================================
  renderSkillTree(selectedClass, extra, currentHeroImg) {
    const abilities = selectedClass.abilities;
    const activeAbility = abilities[this.selectedAbilityIndex] || abilities[0];

    const tiers = [
      {
        num: 'V',
        name: 'Grau V • Apoteose',
        levels: 'Níveis 17 a 20',
        abilities: abilities.slice(12, 15)
      },
      {
        num: 'IV',
        name: 'Grau IV • Paroxismo',
        levels: 'Níveis 13 a 16',
        abilities: abilities.slice(9, 12)
      },
      {
        num: 'III',
        name: 'Grau III • Catalisação',
        levels: 'Níveis 9 a 12',
        abilities: abilities.slice(6, 9)
      },
      {
        num: 'II',
        name: 'Grau II • Ressonância',
        levels: 'Níveis 5 a 8',
        abilities: abilities.slice(3, 6)
      },
      {
        num: 'I',
        name: 'Grau I • O Despertar',
        levels: 'Níveis 1 a 4',
        abilities: abilities.slice(0, 3)
      }
    ];

    return `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        
        <!-- ESQUERDA & CENTRO: HABILIDADES DE CLASSE (7 colunas) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="border-b border-[#242833] pb-2 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold uppercase tracking-widest block">[ PROGRESSÃO DA ALMA ]</span>
              <h3 class="text-xl sm:text-2xl font-serif font-black text-white">Árvore de Habilidades</h3>
            </div>
            <span class="text-[10px] font-mono text-[#8e95a5] uppercase">[ CLIQUE PARA INSPECIONAR ]</span>
          </div>

          <p class="text-xs font-liturgical italic text-[#8e95a5]">
            As 15 habilidades e técnicas que moldam a ascensão de ${selectedClass.name} do Nível 1 ao Nível 20.
          </p>

          <!-- Os 5 Graus de Maestria (Tier V no topo descendo até Tier I) -->
          <div class="space-y-4">
            ${tiers.map(tier => `
              <div class="skill-tier-block">
                <div class="flex items-center justify-between border-b border-[#1c202a] pb-2 mb-3">
                  <span class="skill-tier-label">
                    <span>${tier.name}</span>
                  </span>
                  <span class="text-[9px] font-mono text-[#8e95a5] uppercase">[ ${tier.levels} ]</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  ${tier.abilities.map(a => {
                    const isSelected = (a.num - 1) === this.selectedAbilityIndex;
                    const isCrimson = a.type.toLowerCase().includes('ataque') || a.type.toLowerCase().includes('reação') || a.cost.includes('4') || a.cost.includes('5');
                    return `
                      <div class="skill-tree-node-card ${isSelected ? 'active' : ''}" data-ability-idx="${a.num - 1}">
                        <div class="flex items-center justify-between mb-1.5">
                          <span class="text-[10px] font-mono font-black ${isSelected ? 'text-[#e21b23]' : 'text-white'}">#${String(a.num).padStart(2, '0')}</span>
                          <span class="text-[9px] font-mono font-bold ${isCrimson ? 'text-[#e21b23]' : 'text-[#8e95a5]'} uppercase">${a.cost}</span>
                        </div>
                        <h5 class="text-xs font-serif font-black text-white leading-tight mb-1 truncate">${a.name}</h5>
                        <span class="text-[9px] font-mono text-[#8e95a5] block truncate uppercase">${a.type}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- DIREITA: CARTA FÍSICA DE INSPEÇÃO DA HABILIDADE (5 colunas) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="border-b border-[#242833] pb-2 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold uppercase tracking-widest block">[ INSPEÇÃO DO CÓDICE ]</span>
              <h3 class="text-xl sm:text-2xl font-serif font-black text-white">Detalhes da Técnica</h3>
            </div>
            <button class="back-to-dossier-btn text-[10px] font-mono text-[#e21b23] hover:underline uppercase font-bold">
              ← VOLTAR AO DOSSIÊ
            </button>
          </div>

          <!-- Carta Física Monumental -->
          <div class="skill-inspection-monolith p-6 space-y-5">
            
            <!-- Fita Rasgada Superior -->
            <div class="${activeAbility.cost.includes('5') || activeAbility.type.toLowerCase().includes('ataque') ? 'shizuka-tape-crimson' : 'shizuka-tape-white'}">
              <span class="font-serif font-black text-sm tracking-wider uppercase ${activeAbility.cost.includes('5') || activeAbility.type.toLowerCase().includes('ataque') ? 'text-white' : 'text-[#0d0e12]'}">
                HABILIDADE #${String(activeAbility.num).padStart(2, '0')} • ${activeAbility.name}
              </span>
              <span class="font-mono font-black text-xs ${activeAbility.cost.includes('5') || activeAbility.type.toLowerCase().includes('ataque') ? 'text-white' : 'text-[#0d0e12]'}">
                ${activeAbility.cost}
              </span>
            </div>

            <!-- Dados Táticos -->
            <div class="grid grid-cols-2 gap-3 pt-2">
              <div class="p-2.5 bg-[#08090d] border border-[#1e2330]">
                <span class="text-[9px] font-mono text-[#8e95a5] block uppercase">TIPO DE EXECUÇÃO</span>
                <strong class="text-xs font-mono text-[#e21b23] font-black uppercase">${activeAbility.type}</strong>
              </div>
              <div class="p-2.5 bg-[#08090d] border border-[#1e2330]">
                <span class="text-[9px] font-mono text-[#8e95a5] block uppercase">CUSTO DE RECURSO</span>
                <strong class="text-xs font-mono text-white font-black uppercase">${activeAbility.cost}</strong>
              </div>
            </div>

            <!-- Regra Integral da Habilidade -->
            <div class="space-y-2">
              <span class="text-[10px] font-mono text-[#e21b23] font-bold block uppercase">[ EFEITO DA HABILIDADE ]</span>
              <div class="p-4 bg-[#08090d] border-l-2 border-[#e21b23] border-t border-r border-b border-[#1b1f2b]">
                <p class="text-xs sm:text-sm font-sans text-white leading-relaxed">
                  ${activeAbility.desc}
                </p>
              </div>
            </div>

            <!-- Contexto do Agente -->
            <div class="pt-3 border-t border-[#1e2330] flex items-center justify-between text-[11px] font-mono text-[#8e95a5]">
              <span>Agente: <strong class="text-white">${selectedClass.name}</strong></span>
              <span>Posição: <strong class="text-[#e21b23]">Habilidade ${activeAbility.num} de 15</strong></span>
            </div>

            <div class="pt-2 space-y-2">
              <div class="p-2.5 bg-[#0d0708] border border-[#e21b23]/30 text-center">
                <span class="text-[9px] font-mono text-[#e21b23] font-black uppercase block mb-0.5">ESTADO DA HABILIDADE</span>
                <span class="text-xs font-serif text-white font-bold">DESBLOQUEADA & DISPONÍVEL</span>
              </div>
              <button class="back-to-dossier-btn w-full btn-ritual-steel">
                [ ← RETORNAR AO DOSSIÊ DO AGENTE ]
              </button>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  // ============================================================
  // OUTRAS TELAS (PERÍCIAS, EMOÇÕES, GRIMÓRIO, FICHA, BESTIÁRIO)
  // ============================================================
  // ============================================================
  // 4. ATLAS DE CONHECIMENTOS (PERÍCIAS & ORIGENS)
  // Inspirado em: Cyberpunk RED Compendium, Disco Elysium Journal, Darkest Dungeon
  // ============================================================
  renderSkillsAndOrigins(container, params = {}) {
    const CATEGORIES = [
      {
        id: 'combate',
        name: 'Combate',
        chapter: 'CAPÍTULO I',
        subtitle: 'A arte da violência dirigida, manejo de armamento pesado e letalidade em confronto direto.',
        icon: `<svg class="w-5 h-5 text-[#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline><line x1="5" y1="14" x2="9" y2="18"></line></svg>`
      },
      {
        id: 'investigacao',
        name: 'Investigação',
        chapter: 'CAPÍTULO II',
        subtitle: 'Forense criminal, análise dedutiva, medicina de campo, engenharia de bypass e método científico.',
        icon: `<svg class="w-5 h-5 text-[#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
      },
      {
        id: 'social',
        name: 'Social',
        chapter: 'CAPÍTULO III',
        subtitle: 'Psicologia aplicada, coerção, dissimulação, leitura comportamental profunda e diplomacia.',
        icon: `<svg class="w-5 h-5 text-[#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
      },
      {
        id: 'fisica',
        name: 'Física',
        chapter: 'CAPÍTULO IV',
        subtitle: 'Motricidade extrema, potência muscular pura, cinética acrobática, evasão e condução tática.',
        icon: `<svg class="w-5 h-5 text-[#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"></path></svg>`
      },
      {
        id: 'paranormal',
        name: 'Paranormal',
        chapter: 'CAPÍTULO V',
        subtitle: 'A metafísica das 10 Emoções, os rituais do Avesso e a resiliência psíquica contra o terror.',
        icon: `<svg class="w-5 h-5 text-[#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
      }
    ];

    container.innerHTML = `
      <div class="atlas-container space-y-12 py-6 sm:py-8 px-2 sm:px-6">
        
        <!-- CABEÇALHO MONUMENTAL // ATLAS DE CONHECIMENTOS -->
        <div class="border-b border-[#242833] pb-6 space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-black text-[#8e95a5] uppercase tracking-widest">// CÓDICE TÁTICO OPERACIONAL</span>
            <span class="text-[#e21b23] font-mono text-xs font-bold">[ 18 PERÍCIAS • 4 ORIGENS ]</span>
          </div>
          
          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 class="text-3xl sm:text-4xl xl:text-5xl font-serif font-black tracking-wider text-white">
                Atlas de Conhecimentos
              </h1>
              <p class="text-xs sm:text-sm font-liturgical italic text-[#8e95a5] mt-1 max-w-3xl">
                O corpo é a ferramenta; a mente, a alavanca; a técnica, a única fronteira entre o colapso e a sobrevivência diante do Avesso.
              </p>
            </div>

            <!-- Resumo das 5 Frentes -->
            <div class="flex items-center gap-2 text-xs font-mono text-[#8e95a5]">
              <span class="border border-[#222837] px-2.5 py-1 bg-[#090b10] text-white">D20 + ATRIBUTO + TREINO</span>
            </div>
          </div>
        </div>

        <!-- BARRA DE NAVEGAÇÃO RÁPIDA DE CAPÍTULOS -->
        <div class="atlas-quick-nav-bar no-scrollbar">
          ${CATEGORIES.map(cat => `
            <button class="atlas-nav-chip" data-target="panel-${cat.id}">
              ${cat.icon}
              <span>${cat.name}</span>
            </button>
          `).join('')}
          <button class="atlas-nav-chip" data-target="panel-origens">
            <svg class="w-5 h-5 text-[#e21b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>Origens (4)</span>
          </button>
        </div>

        <!-- ============================================================ -->
        <!-- OS 5 PAINÉIS CATEGÓRICOS DO ATLAS                            -->
        <!-- ============================================================ -->
        <div class="space-y-16">
          ${CATEGORIES.map(cat => {
            const skillsInCat = SKILLS_DATA.filter(s => s.category.toLowerCase() === cat.name.toLowerCase());
            return `
              <section id="panel-${cat.id}" class="atlas-category-panel">
                
                <!-- Cabeçalho do Capítulo -->
                <div class="atlas-category-header">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span class="atlas-chapter-badge">${cat.chapter} // SETOR DE CAPACITAÇÃO</span>
                      <h2 class="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide mt-0.5 flex items-center gap-3">
                        <span>${cat.name}</span>
                        <span class="text-xs font-mono text-[#e21b23] border border-[#e21b23]/30 px-2 py-0.5 font-normal uppercase">
                          ${skillsInCat.length} ${skillsInCat.length === 1 ? 'Perícia' : 'Perícias'}
                        </span>
                      </h2>
                    </div>
                    <p class="text-xs font-sans text-[#8e95a5] max-w-md sm:text-right">
                      ${cat.subtitle}
                    </p>
                  </div>
                </div>

                <!-- Grade de Cartões Grandes (Estilo Documento Físico Grampeado) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                  ${skillsInCat.map(skill => `
                    <div id="skill-${skill.name.toLowerCase()}" class="atlas-skill-card group">
                      
                      <!-- Grampo Metálico de Dossiê -->
                      <div class="atlas-card-staple" title="Documento Fixado em Campo"></div>

                      <div class="space-y-5">
                        
                        <!-- Topo: Ilustração Monocromática + Cabeçalho da Perícia -->
                        <div class="flex items-start gap-4">
                          
                          <!-- Moldura de Xilogravura / Blueprint Monocromático -->
                          <div class="atlas-illustration-frame group-hover:border-[#e21b23] transition-colors">
                            ${skill.svgIllustration}
                          </div>

                          <!-- Metadados & Título -->
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-2 mb-1">
                              <span class="text-[10px] font-mono text-[#8e95a5] font-bold tracking-wider">${skill.code}</span>
                              <span class="text-[10px] font-mono font-black text-[#e21b23] bg-[#e21b23]/10 border border-[#e21b23]/40 px-2 py-0.5 uppercase">
                                [ ATRIBUTO: ${skill.attr} ]
                              </span>
                            </div>

                            <h3 class="text-xl sm:text-2xl font-serif font-black text-white tracking-wide group-hover:text-[#e21b23] transition-colors">
                              ${skill.name}
                            </h3>

                            <p class="text-xs font-sans text-[#b0b8ca] leading-relaxed mt-1.5">
                              ${skill.desc}
                            </p>
                          </div>

                        </div>

                        <!-- Seção: Usos Táticos em Cena -->
                        <div class="space-y-2 pt-2 border-t border-[#181d29]">
                          <span class="text-[9px] font-mono text-[#e21b23] font-bold tracking-widest uppercase block">
                            [ APLICAÇÕES PRÁTICAS EM CENA ]
                          </span>
                          <ul class="space-y-1.5">
                            ${skill.commonUses.map(use => `
                              <li class="flex items-start gap-2 text-xs font-sans text-[#cbd0dc] leading-normal">
                                <span class="text-[#e21b23] font-bold text-xs mt-0.5">▸</span>
                                <span>${use}</span>
                              </li>
                            `).join('')}
                          </ul>
                        </div>

                        <!-- Seção: Exemplos Concretos com Dificuldades (CD) -->
                        <div class="space-y-2 pt-2 border-t border-[#181d29]">
                          <span class="text-[9px] font-mono text-[#8e95a5] font-bold tracking-widest uppercase block">
                            [ EXEMPLOS DE TESTE & DIFICULDADE ]
                          </span>
                          <div class="atlas-example-box space-y-1.5">
                            ${skill.examples.map(ex => `
                              <div class="text-[11px] font-sans text-[#cbd0dc] leading-relaxed">
                                <span class="font-mono font-black text-[#e21b23] mr-1">CD ${ex.cd}:</span>
                                <span>${ex.desc}</span>
                              </div>
                            `).join('')}
                          </div>
                        </div>

                      </div>

                      <!-- Rodapé do Cartão com Selo de Dossiê -->
                      <div class="mt-4 pt-2.5 border-t border-[#141722] flex items-center justify-between text-[9px] font-mono text-[#626a7d]">
                        <span>CÓDICE PAROXISMO // ${skill.category.toUpperCase()}</span>
                        <span class="text-[#8e95a5]">REG: PROTOCOLO AT-99</span>
                      </div>

                    </div>
                  `).join('')}
                </div>

              </section>
            `;
          }).join('')}

          <!-- ============================================================ -->
          <!-- PAINEL VI: AS 4 ORIGENS (HISTÓRICO PRÉ-ESTRONDO)            -->
          <!-- ============================================================ -->
          <section id="panel-origens" class="atlas-category-panel">
            
            <div class="atlas-category-header">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span class="atlas-chapter-badge">CAPÍTULO VI // DOSSIÊ DE ANTECEDENTES</span>
                  <h2 class="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide mt-0.5 flex items-center gap-3">
                    <span>As 4 Origens</span>
                    <span class="text-xs font-mono text-[#e21b23] border border-[#e21b23]/30 px-2 py-0.5 font-normal uppercase">
                      4 Arquivos
                    </span>
                  </h2>
                </div>
                <p class="text-xs font-sans text-[#8e95a5] max-w-md sm:text-right">
                  O histórico civil ou militar do agente antes do Estrondo. Concede 2 perícias treinadas e 1 poder exclusivo.
                </p>
              </div>
            </div>

            <!-- Grade das 4 Origens -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
              ${ORIGINS_DATA.map(origin => `
                <div id="origin-${origin.id}" class="atlas-origin-card group">
                  
                  <div class="atlas-card-staple"></div>

                  <div class="space-y-4">
                    
                    <div class="flex items-center justify-between border-b border-[#1f2535] pb-2.5">
                      <div>
                        <span class="text-[10px] font-mono text-[#e21b23] font-bold uppercase tracking-wider block">${origin.code}</span>
                        <h3 class="text-2xl font-serif font-black text-white group-hover:text-[#e21b23] transition-colors">
                          ${origin.name}
                        </h3>
                      </div>
                      <span class="text-[9px] font-mono text-[#8e95a5] border border-[#1f2535] px-2 py-1 bg-[#050608] uppercase">
                        ANTECEDENTE
                      </span>
                    </div>

                    <p class="text-xs font-sans text-[#cbd0dc] leading-relaxed">
                      ${origin.desc}
                    </p>

                    <!-- Perícias Concedidas -->
                    <div class="p-3 bg-[#050608] border border-[#171b26] space-y-1.5">
                      <span class="text-[9px] font-mono text-[#8e95a5] uppercase font-bold block">
                        PERÍCIAS AUTOMATICAMENTE TREINADAS:
                      </span>
                      <div class="flex items-center gap-2">
                        ${origin.skills.map(sk => `
                          <span class="text-xs font-mono font-bold text-white bg-[#10131d] border border-[#232938] px-2.5 py-1">
                            [ ${sk} ]
                          </span>
                        `).join('')}
                      </div>
                    </div>

                    <!-- Poder Exclusivo da Origem -->
                    <div class="p-3.5 bg-[#0b0607] border-l-2 border-[#e21b23] border-t border-r border-b border-[#1f1718] space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-[9px] font-mono text-[#e21b23] font-black uppercase tracking-widest">[ PODER DE ORIGEM ]</span>
                        <span class="text-[9px] font-mono text-[#8e95a5]">PASSIVA</span>
                      </div>
                      <h4 class="text-sm font-serif font-black text-white uppercase">
                        ${origin.power.name}
                      </h4>
                      <p class="text-xs font-sans text-[#cbd0dc] leading-relaxed pt-0.5">
                        ${origin.power.desc}
                      </p>
                    </div>

                  </div>

                </div>
              `).join('')}
            </div>

          </section>
        </div>

      </div>
    `;

    // Interatividade: Navegação Rápida entre os Capítulos do Atlas
    container.querySelectorAll('.atlas-nav-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        soundFX.playRuneClick();
        const targetId = chip.getAttribute('data-target');
        const targetEl = container.querySelector(`#${targetId}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        container.querySelectorAll('.atlas-nav-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    if (params && params.targetAnchor) {
      setTimeout(() => {
        const el = document.getElementById(params.targetAnchor);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  }

  renderEmotions(container, params = {}) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="border-b border-[#242833] pb-2">
          <span class="text-xs font-mono font-bold text-[#e21b23] uppercase block">[ METAFÍSICA DOS SENTIMENTOS ]</span>
          <h1 class="text-2xl font-serif font-black text-white">As 10 Emoções & Matriz de Fusões</h1>
        </div>
        <div id="emotion-wheel-container"></div>
        <div id="fusion-matrix-container"></div>
      </div>
    `;
    this.components.emotionWheel = new EmotionWheel('emotion-wheel-container');
    if (params.emotion) this.components.emotionWheel.selectEmotion(params.emotion);
    this.components.fusionMatrix = new FusionMatrix('fusion-matrix-container');
  }

  renderArchetypes(container, params = {}) {
    container.innerHTML = `
      <div id="archetypes-viewer-container"></div>
    `;
    this.components.archetypesViewer = new ArchetypesViewer('archetypes-viewer-container');
    if (params.archetypeId) {
      this.components.archetypesViewer.activeArchetypeId = parseInt(params.archetypeId, 10);
      this.components.archetypesViewer.viewMode = 'dossier';
    }
    if (params.search) {
      this.components.archetypesViewer.searchQuery = params.search;
    }
    if (params.emotion) {
      this.components.archetypesViewer.selectedEmotion = params.emotion;
    }
    this.components.archetypesViewer.render();
  }

  renderForge(container, params = {}) {
    container.innerHTML = `
      <div id="forge-viewer-container"></div>
    `;
    this.components.forgeViewer = new ForgeViewer('forge-viewer-container');
    if (params.subtab) {
      this.components.forgeViewer.activeSubTab = params.subtab;
    }
    this.components.forgeViewer.render();
  }

  renderGrimoire(container, params = {}) {
    container.innerHTML = `
      <div class="space-y-6">
        <div id="grimoire-viewer-container"></div>
      </div>
    `;
    this.components.grimoireViewer = new GrimoireViewer('grimoire-viewer-container');
    this.components.grimoireViewer.render();
    if (params.ritualId) {
      setTimeout(() => {
        this.components.grimoireViewer.openRitualModal(params.ritualId);
      }, 50);
    } else if (params.emotion) {
      this.components.grimoireViewer.setFilter(params.emotion, params.circle || 'all');
    }
  }

  renderBestiary(container) {
    const selectedMonster = BESTIARY_DATA.find(m => m.id === this.selectedBestiaryMonster) || BESTIARY_DATA[0];
    const monsterImages = {
      'mimico-cobica': 'assets/images/mimico.jpg',
      'marionetista-ambicao': 'assets/images/marionetista.jpg',
      'espectro-rancor': 'assets/images/espectro.jpg',
      'rastejador-vazio': 'assets/images/rastejador.jpg'
    };

    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-[#e21b23] pb-2">
          <div>
            <span class="text-xs font-mono font-bold text-[#e21b23]">[ ÁREA SECRETA DO CONDUTOR ]</span>
            <h1 class="text-2xl font-serif font-black text-white">Bestiário do Avesso</h1>
          </div>
          <button onclick="window.ParoxismoApp.setGmMode(false)" class="btn-ritual-blood">[ SELAR × ]</button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${BESTIARY_DATA.map(m => `
            <button class="monster-tab-btn p-2 border ${m.id === selectedMonster.id ? 'border-[#e21b23] bg-[#e21b23] text-black font-bold' : 'border-[#242833] text-white'} text-xs font-serif" data-id="${m.id}">
              ${m.name} (VD ${m.vd})
            </button>
          `).join('')}
        </div>

        <div class="iron-carved-card space-y-4">
          <div class="relative h-64 border-b border-[#e21b23] overflow-hidden">
            <img src="${monsterImages[selectedMonster.id] || 'assets/images/mimico.jpg'}" class="w-full h-full object-cover filter contrast-125" />
            <div class="absolute bottom-2 left-2 bg-[#050505] border border-[#e21b23] p-2">
              <h3 class="text-lg font-serif font-black text-white">${selectedMonster.name}</h3>
              <span class="text-xs font-mono text-[#e21b23]">VD ${selectedMonster.vd} • ${selectedMonster.pv} PV • DEF ${selectedMonster.defense}</span>
            </div>
          </div>

          <div class="border border-[#e21b23] p-3 bg-[#050505]">
            <span class="text-[10px] font-mono text-[#e21b23] font-bold block">[ FRAQUEZA INVESTIGATIVA ]</span>
            <p class="text-xs text-white font-liturgical italic leading-relaxed">${selectedMonster.investigativeWeakness.desc}</p>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.monster-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.selectedBestiaryMonster = btn.getAttribute('data-id');
        this.renderBestiary(container);
      });
    });
  }

  renderAdventure(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-[#e21b23] pb-2">
          <div>
            <span class="text-xs font-mono font-bold text-[#e21b23]">[ ENREDO CONFIDENCIAL ]</span>
            <h1 class="text-2xl font-serif font-black text-white">${ADVENTURE_DATA.title}</h1>
          </div>
          <button onclick="window.ParoxismoApp.setGmMode(false)" class="btn-ritual-blood">[ SELAR × ]</button>
        </div>

        <div class="iron-carved-card space-y-2">
          <p class="text-xs text-white font-liturgical italic leading-relaxed">${ADVENTURE_DATA.summary}</p>
        </div>
      </div>
    `;
  }

  renderCharacterSheet(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div id="character-sheet-container"></div>
      </div>
    `;
    this.components.characterSheet = new CharacterSheet('character-sheet-container');
  }

  renderSession(container, params = {}) {
    container.innerHTML = `
      <div id="session-viewer-container" class="w-full"></div>
    `;
    this.components.sessionViewer = new SessionViewer('session-viewer-container', this);
  }

  setupCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    const input = document.getElementById('palette-input');
    const results = document.getElementById('palette-results');
    const triggerBtn = document.getElementById('palette-trigger-btn');

    let currentResults = [];
    let selectedIndex = 0;

    const open = () => {
      soundFX.playRuneClick();
      modal?.classList.remove('hidden');
      if (input) {
        input.value = '';
        input.focus();
      }
      this.updatePaletteResults('', results, (res) => {
        currentResults = res;
        selectedIndex = 0;
        this.highlightPaletteItem(results, selectedIndex);
      });
    };

    const close = () => {
      modal?.classList.add('hidden');
      if (input) input.blur();
    };

    const executeCurrent = () => {
      if (currentResults.length > 0 && selectedIndex >= 0 && selectedIndex < currentResults.length) {
        const item = currentResults[selectedIndex];
        this.executePaletteItem(item, close);
      }
    };

    triggerBtn?.addEventListener('click', open);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modal?.classList.contains('hidden')) {
          open();
        } else {
          close();
        }
      } else if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
        close();
      }
    });

    modal?.addEventListener('click', (e) => {
      if (e.target.id === 'command-palette-modal') {
        close();
      }
    });

    input?.addEventListener('input', (e) => {
      this.updatePaletteResults(e.target.value, results, (res) => {
        currentResults = res;
        selectedIndex = 0;
        this.highlightPaletteItem(results, selectedIndex);
      });
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentResults.length > 0) {
          selectedIndex = (selectedIndex + 1) % currentResults.length;
          this.highlightPaletteItem(results, selectedIndex);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentResults.length > 0) {
          selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
          this.highlightPaletteItem(results, selectedIndex);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCurrent();
      }
    });
  }

  executePaletteItem(item, closeFn) {
    if (closeFn) {
      closeFn();
    } else {
      document.getElementById('command-palette-modal')?.classList.add('hidden');
    }
    soundFX.playDiceRoll();
    this.navigateTo(item.targetTab, item.navParams || {});
  }

  highlightPaletteItem(container, index) {
    if (!container) return;
    const items = container.querySelectorAll('.palette-result-item');
    items.forEach((el, i) => {
      if (i === index) {
        el.classList.add('bg-[#141926]', 'border-[#06b6d4]', 'shadow-[0_0_15px_rgba(6,182,212,0.25)]');
        el.classList.remove('border-transparent');
        el.setAttribute('aria-selected', 'true');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('bg-[#141926]', 'border-[#06b6d4]', 'shadow-[0_0_15px_rgba(6,182,212,0.25)]');
        el.classList.add('border-transparent');
        el.setAttribute('aria-selected', 'false');
      }
    });
  }

  updatePaletteResults(q, container, callback) {
    if (!container) return;
    
    const searchQuery = q && q.trim().length > 0 ? q : '';
    let res = [];

    if (searchQuery) {
      res = this.searchEngine.search(searchQuery, 'all', 12).filter(item => {
        if ((item.targetTab === 'bestiario' || item.targetTab === 'aventura') && !this.gmModeActive) return false;
        return true;
      });
    } else {
      // Sugestões de entrada rápida quando o campo estiver em branco
      res = this.searchEngine.index.filter(item => {
        if (item.category === 'Arquétipo Híbrido' && [1, 12, 17, 28].includes(item.data?.id)) return true;
        if (item.id === 'ritual-1' || item.id === 'class-combate') return true;
        if (item.id === 'forja-armas') return true;
        return false;
      }).slice(0, 8);
    }

    if (callback) callback(res);

    if (res.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center space-y-2">
          <div class="text-[#e21b23] text-2xl font-mono">✠</div>
          <div class="text-xs font-mono text-white font-bold">Nenhum segredo correspondente aos critérios de busca.</div>
          <div class="text-[11px] font-mono text-[#8e95a5] max-w-sm mx-auto">
            Dica: Digite emoções formadoras com <span class="text-[#06b6d4] font-bold">"Pavor + Rancor"</span> para localizar o arquétipo híbrido direto, ou busque por rituais, condições e classes.
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-1 p-1">
        ${res.map((item, idx) => {
          let categoryColor = '#8e95a5';
          if (item.categoryTag.includes('Arquétipo') || item.category === 'Arquétipo Híbrido') { categoryColor = '#06b6d4'; }
          else if (item.categoryTag.includes('Círculo') || item.category === 'Ritual') { categoryColor = '#a855f7'; }
          else if (item.categoryTag.includes('Classe') || item.category === 'Classe') { categoryColor = '#e21b23'; }
          else if (item.categoryTag.includes('Regra') || item.categoryTag.includes('Condição')) { categoryColor = '#eab308'; }
          else if (item.category === 'Emoção') { categoryColor = '#ec4899'; }
          else if (item.category === 'A Forja') { categoryColor = '#f97316'; }
          else if (item.categoryTag.includes('VD')) { categoryColor = '#ef4444'; }

          return `
            <div 
              class="palette-result-item p-2.5 rounded border border-transparent cursor-pointer flex items-center justify-between gap-3 transition-all ${idx === 0 ? 'bg-[#141926] border-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.25)]' : 'hover:bg-[#121622]'}"
              data-index="${idx}"
              role="option"
              aria-selected="${idx === 0 ? 'true' : 'false'}"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 border shrink-0 uppercase tracking-wider" style="color: ${categoryColor}; border-color: ${categoryColor}40;">
                  ${item.categoryTag}
                </span>
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-serif font-bold text-white truncate flex items-center gap-2">
                    <span>${item.title}</span>
                  </div>
                  <div class="text-[10px] font-mono text-[#8e95a5] truncate">
                    ${item.subtitle || item.snippet || item.targetTab.toUpperCase()}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-[9px] font-mono text-white/40 uppercase tracking-wider hidden sm:inline">
                  IR DIRETO
                </span>
                <span class="text-xs font-mono text-[#e21b23] font-bold">↵</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const itemElements = container.querySelectorAll('.palette-result-item');
    itemElements.forEach((el, idx) => {
      el.addEventListener('click', () => {
        const item = res[idx];
        if (item) {
          this.executePaletteItem(item);
        }
      });
      el.addEventListener('mouseenter', () => {
        this.highlightPaletteItem(container, idx);
      });
    });
  }

  setupQuickDice() {
    const diceDrawer = document.getElementById('dice-drawer');
    const toggleBtn = document.getElementById('quick-dice-btn');
    const closeBtn = document.getElementById('close-dice-btn');

    this.components.diceRoller = new DiceRoller('dice-roller-container');
    toggleBtn?.addEventListener('click', () => { soundFX.playRuneClick(); diceDrawer?.classList.toggle('translate-x-full'); });
    closeBtn?.addEventListener('click', () => { soundFX.playRuneClick(); diceDrawer?.classList.add('translate-x-full'); });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
