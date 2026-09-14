/**
 * PAROXISMO - SRD COMPENDIUM
 * Componente: Biblioteca Arcana — Grimório dos 200 Rituais
 * Estilo: Estante de Manuscritos, Terminal Analógico, Cartas com Papel Rasgado e Selos de Emoção
 */

import { RITUALS_DATA } from '../data/rituals.js';
import { EMOTIONS_DATA } from '../data/emotions.js';
import { soundFX } from '../utils/sound-fx.js';
import { showLiturgicalToast } from '../utils/liturgical-modal.js?v=modal_v1';
import { getCharacterDossier, saveCharacterDossier } from '../utils/character-storage.js?v=char_v2';

const ICONS8 = {
  clock: 'https://img.icons8.com/?id=H0JqzxqGxPQm&format=png&size=48&color=8E95A5',
  target: 'https://img.icons8.com/?id=1304&format=png&size=48&color=8E95A5',
  hourglass: 'https://img.icons8.com/?id=15849&format=png&size=48&color=8E95A5',
  shield: 'https://img.icons8.com/?id=852&format=png&size=48&color=E21B23',
  skull: 'https://img.icons8.com/?id=4009&format=png&size=48&color=E21B23',
  skullRed: 'https://img.icons8.com/?id=4009&format=png&size=48&color=FF333D',
  star: 'https://img.icons8.com/?id=104&format=png&size=48&color=E21B23',
  starLight: 'https://img.icons8.com/?id=104&format=png&size=48&color=FF555D',
  book: 'https://img.icons8.com/?id=42763&format=png&size=48&color=E21B23',
  bookActive: 'https://img.icons8.com/?id=42763&format=png&size=48&color=000000',
  bookInactive: 'https://img.icons8.com/?id=42763&format=png&size=48&color=CBD0DC',
  listActive: 'https://img.icons8.com/?id=774&format=png&size=48&color=000000',
  listInactive: 'https://img.icons8.com/?id=774&format=png&size=48&color=CBD0DC',
  search: 'https://img.icons8.com/?id=132&format=png&size=48&color=E21B23',
  lock: 'https://img.icons8.com/?id=94&format=png&size=48&color=E21B23',
  allEmotions: 'https://img.icons8.com/?id=104&format=png&size=48&color=8E95A5',
  emotions: {
    rancor: 'assets/images/Rancor.png',
    vazio: 'assets/images/Vazio.png',
    ambicao: 'assets/images/Ambicao.png',
    inveja: 'assets/images/Inveja.png',
    soberba: 'assets/images/Soberba.png',
    pavor: 'assets/images/Pavor.png',
    desespero: 'assets/images/Desespero.png',
    melancolia: 'assets/images/Melancolia.png',
    luxuria: 'assets/images/Luxuria.png',
    culpa: 'assets/images/Culpa.png'
  }
};

const ARCHIVIST_NOTES = [
  "— Transcrição do Códice de Cinzas, Tomo IV",
  "— Anotado por V. Faust em 1923, após o 1º Contato",
  "— Fragmento resgatado da Câmara Proibida",
  "— Fórmula litúrgica homologada sob Édito Ômega",
  "— Manuscrito com sangue de cultista fossilizado",
  "— Guardado sob selo de quarentena mística",
  "— Registro do Liturgista Valente (1984)",
  "— Advertência: o uso contínuo consome a sanidade"
];

export class GrimoireViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.searchQuery = "";
    this.selectedEmotion = "all";
    this.selectedCircle = "all";
    this.selectedExecution = "all";
    this.sortBy = "circle-asc"; // circle-asc, circle-desc, name, rare-first
    this.viewMode = "cards"; // cards, list
    this.activeRitualModal = null;
    this.visibleCount = 24; // Paginação inteligente de 24 em 24 rituais (render em < 10ms)
    this.hasCardListener = false;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  setFilter(emotion = "all", circle = "all") {
    this.selectedEmotion = emotion;
    this.selectedCircle = circle;
    this.visibleCount = 24;
    this.render();
  }

  openRitualModal(ritualId) {
    soundFX.playRuneClick();
    this.activeRitualModal = RITUALS_DATA.find(r => r.id === ritualId);
    this.renderModal();
  }

  closeRitualModal() {
    this.activeRitualModal = null;
    const modalEl = document.getElementById('ritual-detail-modal');
    if (modalEl) modalEl.remove();
  }

  getCharacterDossier() {
    return getCharacterDossier();
  }

  saveCharacterDossier(char) {
    saveCharacterDossier(char);
  }

  isRitualBound(ritualId, ritualName) {
    const char = this.getCharacterDossier();
    return (char.customRituals || []).some(r => r.id === ritualId || r.name === ritualName);
  }

  toggleBindRitual(ritual) {
    const char = this.getCharacterDossier();
    char.customRituals = char.customRituals || [];
    const existingIdx = char.customRituals.findIndex(r => r.id === ritual.id || r.name === ritual.name);

    if (existingIdx >= 0) {
      char.customRituals.splice(existingIdx, 1);
      this.saveCharacterDossier(char);
      soundFX.playRuneClick();
      showLiturgicalToast({
        title: "RITUAL DESVINCULADO",
        subtitle: ritual.name,
        message: "Removido da sua Ficha de Personagem.",
        type: "info"
      });
      return false;
    } else {
      const ritualObj = {
        id: ritual.id || ('rit-' + Date.now()),
        name: ritual.name,
        circle: ritual.circle,
        peCost: ritual.peCost,
        emotion: ritual.emotion,
        emotionName: ritual.emotionName,
        execution: ritual.execution,
        range: ritual.range,
        duration: ritual.duration,
        save: ritual.save,
        amplification: ritual.amplification,
        effect: ritual.effect,
        dmgType: ritual.dmgType || "Avesso",
        dmgDice: ritual.dmgDice || null
      };
      char.customRituals.push(ritualObj);
      this.saveCharacterDossier(char);
      soundFX.playDiceRoll();
      showLiturgicalToast({
        title: "RITUAL GRAVADO NA FICHA",
        subtitle: ritual.name,
        message: `Vinculado com sucesso! (${ritual.circle}º Círculo • ${ritual.peCost} PE).`,
        type: "success"
      });
      return true;
    }
  }

  getFilteredRituals() {
    let filtered = RITUALS_DATA.filter(ritual => {
      if (this.selectedEmotion !== "all" && ritual.emotion !== this.selectedEmotion) return false;
      if (this.selectedCircle !== "all" && ritual.circle !== parseInt(this.selectedCircle)) return false;
      if (this.selectedExecution !== "all" && !ritual.execution.toLowerCase().includes(this.selectedExecution.toLowerCase())) return false;
      if (this.searchQuery.trim() !== "") {
        const q = this.searchQuery.toLowerCase();
        const haystack = `${ritual.name} ${ritual.emotionName} ${ritual.dmgType} ${ritual.effect} ${ritual.amplification} ${ritual.execution} ${ritual.range} ${ritual.save}`.toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });

    // Ordenação
    if (this.sortBy === "circle-asc") {
      filtered.sort((a, b) => a.circle - b.circle || a.name.localeCompare(b.name));
    } else if (this.sortBy === "circle-desc") {
      filtered.sort((a, b) => b.circle - a.circle || a.name.localeCompare(b.name));
    } else if (this.sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === "rare-first") {
      filtered.sort((a, b) => b.circle - a.circle);
    }

    return filtered;
  }

  render() {
    const rituals = this.getFilteredRituals();

    this.container.innerHTML = `
      <div class="space-y-8 max-w-[1500px] mx-auto py-4">
        
        <!-- ============================================================ -->
        <!-- 1. GRANDE TERMINAL ANALÓGICO DE PESQUISA (TOPO)              -->
        <!-- ============================================================ -->
        <div class="arcane-terminal-console p-5 sm:p-7 rounded-sm">
          
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#212838] pb-4 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#e21b23] animate-pulse"></span>
                <span class="text-[10px] font-mono font-black text-[#e21b23] tracking-widest uppercase">
                  TERMINAL LITÚRGICO // ÍNDICE DA BIBLIOTECA ARCANA
                </span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide">
                Compêndio dos 200 Rituais
              </h2>
            </div>

            <!-- Contadores de Status do Terminal -->
            <div class="flex items-center gap-3 font-mono text-xs">
              <div class="px-3 py-1.5 bg-[#090b10] border border-[#1d2332] text-[#8e95a5]">
                TOMOS NO ACERVO: <strong class="text-white font-bold">200</strong>
              </div>
              <div class="px-3 py-1.5 bg-[#140b0d] border border-[#e21b23]/40 text-[#cbd0dc]">
                LOCALIZADOS: <strong class="text-[#e21b23] font-black">${rituals.length}</strong>
              </div>
            </div>
          </div>

          <!-- Barra de Busca do Terminal Antigo -->
          <div class="space-y-3">
            <div class="relative flex items-center">
              <span class="absolute left-3.5 text-[#e21b23] font-mono font-black text-sm select-none">&gt;</span>
              <input type="text" id="grimoire-search" value="${this.searchQuery}"
                     placeholder="INQUIRIR_MANUSCRITO: Digite o nome do ritual, efeito, elemento, dano ou ampliação..." 
                     class="w-full bg-[#040508] border-2 border-[#1f2537] focus:border-[#e21b23] pl-9 pr-4 py-3 text-xs sm:text-sm text-white placeholder-[#555e73] font-mono tracking-wider focus:outline-none transition-colors shadow-inner" />
              ${this.searchQuery ? `
                <button id="clear-search-btn" class="absolute right-3 text-xs font-mono text-[#8e95a5] hover:text-[#e21b23]">
                  [ LIMPAR × ]
                </button>
              ` : ''}
            </div>

            <!-- Controles do Terminal: Visualização & Ordenação -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-mono">
              <div class="flex items-center gap-2">
                <span class="text-[#8e95a5] text-[11px] uppercase">EXIBIÇÃO:</span>
                <button id="view-cards-btn" class="px-3 py-1 border transition-all flex items-center gap-1.5 ${this.viewMode === 'cards' ? 'bg-[#e21b23] text-black border-[#e21b23] font-black shadow-[0_0_12px_rgba(226,27,35,0.4)]' : 'bg-[#07090e] text-[#cbd0dc] border-[#1d2332] hover:border-[#e21b23]'}">
                  <img src="${this.viewMode === 'cards' ? ICONS8.bookActive : ICONS8.bookInactive}" class="w-3.5 h-3.5 object-contain" alt="Estante" />
                  <span>ESTANTE (CARTAS)</span>
                </button>
                <button id="view-list-btn" class="px-3 py-1 border transition-all flex items-center gap-1.5 ${this.viewMode === 'list' ? 'bg-[#e21b23] text-black border-[#e21b23] font-black shadow-[0_0_12px_rgba(226,27,35,0.4)]' : 'bg-[#07090e] text-[#cbd0dc] border-[#1d2332] hover:border-[#e21b23]'}">
                  <img src="${this.viewMode === 'list' ? ICONS8.listActive : ICONS8.listInactive}" class="w-3.5 h-3.5 object-contain" alt="Catálogo" />
                  <span>CATÁLOGO (LISTA)</span>
                </button>
              </div>

              <!-- Ordenação -->
              <div class="flex items-center gap-2">
                <span class="text-[#8e95a5] text-[11px] uppercase">ORDENAR:</span>
                <select id="sort-select" class="bg-[#07090e] border border-[#1d2332] text-white px-2.5 py-1 text-xs font-mono focus:border-[#e21b23] focus:outline-none">
                  <option value="circle-asc" ${this.sortBy === 'circle-asc' ? 'selected' : ''}>Círculo (1º ➔ 4º)</option>
                  <option value="circle-desc" ${this.sortBy === 'circle-desc' ? 'selected' : ''}>Círculo (4º ➔ 1º)</option>
                  <option value="rare-first" ${this.sortBy === 'rare-first' ? 'selected' : ''}>Mais Raros Primeiro</option>
                  <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Alfabético (A ➔ Z)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        <!-- ============================================================ -->
        <!-- 2. CORPO PRINCIPAL: BARRA LATERAL (SIDEBAR) + ESTANTE        -->
        <!-- ============================================================ -->
        <div class="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
          
          <!-- BARRA LATERAL DE FILTROS (GAVETEIRO ARCANO) -->
          <aside class="w-full lg:w-72 xl:w-80 flex-shrink-0 grimoire-sidebar p-4 sm:p-5 space-y-6 rounded-sm">
            
            <div class="flex items-center justify-between border-b border-[#1c2231] pb-2">
              <span class="text-xs font-mono font-bold text-white uppercase tracking-wider">
                GAVETEIRO DE FILTROS
              </span>
              ${(this.selectedEmotion !== 'all' || this.selectedCircle !== 'all' || this.selectedExecution !== 'all' || this.searchQuery) ? `
                <button id="reset-all-filters-btn" class="text-[10px] font-mono text-[#e21b23] hover:underline font-bold">
                  [ PURGAR × ]
                </button>
              ` : ''}
            </div>

            <!-- GAVETA 1: CÍRCULOS & RARIDADE -->
            <div class="space-y-2">
              <div class="sidebar-section-title">
                <span>CÍRCULO LITÚRGICO</span>
                <span class="text-[9px] text-[#8e95a5]">PODER / PE</span>
              </div>
              <div class="space-y-1">
                <button class="sidebar-filter-btn circle-chip ${this.selectedCircle === 'all' ? 'active' : ''}" data-circle="all">
                  <span>Todos os Círculos</span>
                  <span class="text-[10px] text-[#8e95a5]">200</span>
                </button>
                <button class="sidebar-filter-btn circle-chip ${this.selectedCircle === '1' ? 'active' : ''}" data-circle="1">
                  <span>1º Círculo • Despertar</span>
                  <span class="text-[10px] text-[#8e95a5]">1 PE</span>
                </button>
                <button class="sidebar-filter-btn circle-chip ${this.selectedCircle === '2' ? 'active' : ''}" data-circle="2">
                  <span>2º Círculo • Domínio</span>
                  <span class="text-[10px] text-[#8e95a5]">3 PE</span>
                </button>
                <button class="sidebar-filter-btn circle-chip ${this.selectedCircle === '3' ? 'active' : ''}" data-circle="3">
                  <span class="flex items-center gap-1.5 text-[#ff555d] font-bold">
                    <img src="${ICONS8.starLight}" class="w-3 h-3 object-contain" alt="" />
                    <span>3º Círculo • Raro</span>
                  </span>
                  <span class="text-[10px] text-[#ff555d] font-bold">6 PE</span>
                </button>
                <button class="sidebar-filter-btn circle-chip ${this.selectedCircle === '4' ? 'active' : ''}" data-circle="4">
                  <span class="flex items-center gap-1.5 text-[#e21b23] font-black">
                    <img src="${ICONS8.skull}" class="w-3 h-3 object-contain" alt="" />
                    <span>4º Círculo • Proibido</span>
                  </span>
                  <span class="text-[10px] text-[#e21b23] font-black">10 PE</span>
                </button>
              </div>
            </div>

            <!-- GAVETA 2: AS 10 EMOÇÕES CÓSMICAS -->
            <div class="space-y-2">
              <div class="sidebar-section-title">
                <span>AS 10 EMOÇÕES</span>
                <span class="text-[9px] text-[#8e95a5]">SELOS</span>
              </div>
              <div class="space-y-1 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
                <button class="sidebar-filter-btn emotion-sidebar-btn ${this.selectedEmotion === 'all' ? 'active' : ''}" data-emotion="all">
                  <span class="flex items-center gap-2">
                    <img src="${ICONS8.allEmotions}" class="w-3.5 h-3.5 object-contain" alt="" />
                    <span>Todas as Emoções</span>
                  </span>
                  <span class="text-[10px] text-[#8e95a5]">200</span>
                </button>

                ${EMOTIONS_DATA.map(e => `
                  <button class="sidebar-filter-btn emotion-sidebar-btn ${this.selectedEmotion === e.id ? 'active' : ''}" data-emotion="${e.id}">
                    <span class="flex items-center gap-2 min-w-0">
                      <img src="${ICONS8.emotions[e.id]}" class="w-4 h-4 flex-shrink-0 object-contain" alt="${e.name}" />
                      <span class="truncate" style="color: ${this.selectedEmotion === e.id ? '#ffffff' : e.color}">${e.name}</span>
                    </span>
                    <span class="text-[10px] text-[#8e95a5] flex-shrink-0">20</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- GAVETA 3: TEMPO DE EXECUÇÃO -->
            <div class="space-y-2">
              <div class="sidebar-section-title">
                <span>AÇÃO / TEMPO</span>
                <span class="text-[9px] text-[#8e95a5]">VELOCIDADE</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5 text-xs font-mono">
                ${['all', 'Padrão', 'Movimento', 'Reação', 'Livre', 'Completa'].map(act => `
                  <button class="sidebar-filter-btn exec-chip justify-center text-[10px] py-1 ${this.selectedExecution === act ? 'active' : ''}" data-exec="${act}">
                    ${act === 'all' ? 'Qualquer' : act}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Aviso Litúrgico -->
            <div class="p-3 bg-[#080a0f] border border-[#191f2c] text-[10px] font-liturgical italic text-[#8e95a5] leading-relaxed">
              "A conjuração consome Pontos de Esforço (PE) e exige o desenho do selo com cinzas, sangue ou foco místico."
            </div>

          </aside>

          <!-- PALCO PRINCIPAL DAS ESTANTES DO GRIMÓRIO -->
          <main class="flex-1 min-w-0 space-y-6">
            
            ${rituals.length === 0 ? `
              <div class="p-12 border-2 border-dashed border-[#242833] bg-[#07080c] text-center space-y-3">
                <img src="${ICONS8.skull}" class="w-10 h-10 mx-auto block mb-2 object-contain" alt="" />
                <h3 class="text-xl font-serif font-black text-white">Nenhum Manuscrito Localizado</h3>
                <p class="text-xs font-sans text-[#8e95a5] max-w-md mx-auto">
                  Os critérios de busca não correspondem a nenhuma das 200 fórmulas arcanas catalogadas no acervo.
                </p>
                <button id="empty-clear-filters-btn" class="px-4 py-1.5 bg-[#e21b23] text-black font-mono font-bold text-xs">
                  [ RESTAURAR BIBLIOTECA COMPLETA ]
                </button>
              </div>
            ` : this.viewMode === 'cards' ? this.renderCardsView(rituals) : this.renderListView(rituals)}

          </main>

        </div>

      </div>
    `;

    this.attachEventListeners();
  }

  renderCardsView(rituals) {
    const visibleRituals = rituals.slice(0, this.visibleCount);
    const hasMore = rituals.length > this.visibleCount;
    const char = this.getCharacterDossier();
    const boundSet = new Set((char.customRituals || []).map(x => x.id));
    const boundNameSet = new Set((char.customRituals || []).map(x => x.name));

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 xl:gap-6 items-start">
        ${visibleRituals.map((r, index) => {
          const isRare = r.circle === 3;
          const isForbidden = r.circle === 4;
          const archNote = ARCHIVIST_NOTES[index % ARCHIVIST_NOTES.length];
          const isBound = boundSet.has(r.id) || boundNameSet.has(r.name);

          let cardClass = "ritual-grimoire-card cursor-pointer group ritual-item";
          let spanClass = "";

          if (isForbidden) {
            cardClass += " ritual-card-forbidden";
            spanClass = "md:col-span-2";
          } else if (isRare) {
            cardClass += " ritual-card-rare";
          }

          return `
            <div class="${cardClass} ${spanClass}" data-id="${r.id}">
              
              <!-- Mancha de Tinta Vermelha de Fundo -->
              <div class="blood-ink-blot">
                <svg viewBox="0 0 100 100" fill="#e21b23">
                  <path d="M50 0 C70 10 90 30 90 50 C90 80 70 100 40 90 C20 80 0 60 10 30 C20 10 30 0 50 0 Z"/>
                </svg>
              </div>

              <!-- Topo da Carta: Selo da Emoção + Círculo + Custo de PE -->
              <div>
                <div class="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-[#181e2b]">
                  
                  <!-- Selo da Emoção + Nome da Emoção -->
                  <div class="flex items-center gap-2.5">
                    <div class="ritual-wax-seal bg-[#0d0708]" title="Selo Cósmico: ${r.emotionName}">
                      <img src="${ICONS8.emotions[r.emotion]}" loading="lazy" decoding="async" class="w-6 h-6 object-contain filter drop-shadow-[0_0_6px_rgba(226,27,35,0.6)]" alt="${r.emotionName}" />
                    </div>
                    <div>
                      <span class="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8e95a5] block">
                        ${r.emotionName}
                      </span>
                      <h3 class="text-lg sm:text-xl font-serif font-black text-white group-hover:text-[#e21b23] transition-colors leading-tight">
                        ${r.name}
                      </h3>
                    </div>
                  </div>

                  <!-- Tag do Círculo & Custo -->
                  <div class="text-right flex-shrink-0">
                    <span class="text-xs font-mono font-black ${isForbidden ? 'text-[#ff333d]' : isRare ? 'text-[#e21b23]' : 'text-white'} block">
                      ${r.circle}º CÍRCULO
                    </span>
                    <span class="text-[10px] font-mono font-bold text-[#8e95a5] border border-[#212738] px-1.5 py-0.5 bg-[#040508] inline-block mt-0.5">
                      ${r.peCost} PE
                    </span>
                  </div>

                </div>

                <!-- Chips Técnicos de Conjuração -->
                <div class="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#8e95a5] mb-3">
                  <span class="border border-[#1d2332] px-2 py-0.5 bg-[#050609] text-white flex items-center gap-1">
                    <img src="${ICONS8.clock}" loading="lazy" decoding="async" class="w-3 h-3 object-contain" alt="" />
                    <span>${r.execution}</span>
                  </span>
                  <span class="border border-[#1d2332] px-2 py-0.5 bg-[#050609] text-[#cbd0dc] flex items-center gap-1">
                    <img src="${ICONS8.target}" loading="lazy" decoding="async" class="w-3 h-3 object-contain" alt="" />
                    <span>${r.range}</span>
                  </span>
                  <span class="border border-[#1d2332] px-2 py-0.5 bg-[#050609] text-[#cbd0dc] flex items-center gap-1">
                    <img src="${ICONS8.hourglass}" loading="lazy" decoding="async" class="w-3 h-3 object-contain" alt="" />
                    <span>${r.duration}</span>
                  </span>
                  ${r.save !== 'Nenhuma' ? `
                    <span class="border border-[#e21b23]/30 px-2 py-0.5 bg-[#140809] text-[#e21b23] flex items-center gap-1">
                      <img src="${ICONS8.shield}" loading="lazy" decoding="async" class="w-3 h-3 object-contain" alt="" />
                      <span>${r.save}</span>
                    </span>
                  ` : ''}
                </div>

                <!-- Efeito Principal em Tipografia Litúrgica -->
                <p class="text-xs font-serif text-[#cbd0dc] leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
                  ${r.effect}
                </p>
              </div>

              <!-- Ampliação Especial (+PE) em Caixa de Tinta Vermelha -->
              <div class="space-y-3 pt-2">
                <div class="p-2.5 bg-[#0a0506] border-l-2 border-[#e21b23] border-t border-r border-b border-[#1f1516] text-[11px] font-mono text-[#e21b23] leading-relaxed">
                  <strong class="font-black mr-1">[ AMPLIAÇÃO ]:</strong>
                  <span class="text-[#cbd0dc] font-sans">${r.amplification}</span>
                </div>

                <!-- Rodapé da Carta: Assinatura do Manuscrito + Lupa de Inspeção + Vincular à Ficha -->
                <div class="flex items-center justify-between pt-2 border-t border-[#131722] text-[10px] gap-2">
                  <span class="signature-italic truncate max-w-[130px] sm:max-w-xs text-[#64748b]">
                    ${archNote}
                  </span>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button class="quick-bind-ritual-btn px-2.5 py-0.5 ${isBound ? 'bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4]' : 'bg-[#e21b23]/15 border-[#e21b23]/50 text-[#ff4d58] hover:bg-[#e21b23] hover:text-black'} border font-mono text-[9px] font-bold transition-all cursor-pointer rounded-xs" data-id="${r.id}" title="${isBound ? 'Desvincular da Ficha' : 'Vincular à Ficha'}">
                      ${isBound ? '✓ NA FICHA' : '+ NA FICHA'}
                    </button>
                    <span class="font-mono text-[#e21b23] font-bold group-hover:underline flex-shrink-0 cursor-pointer">
                      [ EXAMINAR ]
                    </span>
                  </div>
                </div>
              </div>

            </div>
          `;
        }).join('')}

        ${hasMore ? `
          <div id="grimoire-load-more-sentinel" class="col-span-1 md:col-span-2 text-center py-6">
            <button id="grimoire-load-more-btn" class="px-6 py-3 bg-[#0c0507] hover:bg-[#1a080b] border border-[#e21b23] text-[#ffffff] hover:text-[#ff333d] font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(226,27,35,0.3)] cursor-pointer">
              [ CARREGAR MAIS RITUAIS (${rituals.length - this.visibleCount} RESTANTES) ⮞ ]
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderListView(rituals) {
    const visibleRituals = rituals.slice(0, this.visibleCount);
    const hasMore = rituals.length > this.visibleCount;
    const char = this.getCharacterDossier();
    const boundSet = new Set((char.customRituals || []).map(x => x.id));
    const boundNameSet = new Set((char.customRituals || []).map(x => x.name));

    return `
      <div class="space-y-2">
        <div class="flex items-center justify-between text-[10px] font-mono uppercase text-[#8e95a5] px-3 py-1 border-b border-[#1f2536]">
          <span>TOMO // EMOÇÃO</span>
          <span>CÍRCULO / CUSTO / EXECUÇÃO / FICHA</span>
        </div>

        <div class="space-y-2">
          ${visibleRituals.map(r => {
            const isRare = r.circle === 3;
            const isForbidden = r.circle === 4;
            const isBound = boundSet.has(r.id) || boundNameSet.has(r.name);

            return `
              <div class="arcane-list-row p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer ritual-item group" data-id="${r.id}">
                <div class="flex items-start gap-3 min-w-0">
                  <div class="w-7 h-7 flex-shrink-0 mt-0.5 p-1 bg-[#090b10] border border-[#1f2537] rounded-full flex items-center justify-center">
                    <img src="${ICONS8.emotions[r.emotion]}" loading="lazy" decoding="async" class="w-4 h-4 object-contain" alt="${r.emotionName}" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <h4 class="text-sm font-serif font-black text-white group-hover:text-[#e21b23] transition-colors truncate">
                        ${r.name}
                      </h4>
                      <span class="text-[9px] font-mono text-[#8e95a5] uppercase">
                        // ${r.emotionName}
                      </span>
                    </div>
                    <p class="text-xs font-serif text-[#8e95a5] truncate mt-0.5 max-w-xl">
                      ${r.effect}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2.5 font-mono text-xs flex-shrink-0 self-end md:self-center">
                  <span class="${isForbidden ? 'text-[#ff333d] font-black' : isRare ? 'text-[#e21b23] font-bold' : 'text-white'}">
                    ${r.circle}º Círculo
                  </span>
                  <span class="text-[#8e95a5] border border-[#212636] px-1.5 py-0.5 bg-[#040508]">
                    ${r.peCost} PE
                  </span>
                  <span class="text-[#cbd0dc] text-[11px] hidden sm:inline">
                    ${r.execution}
                  </span>
                  <button class="quick-bind-ritual-btn px-2 py-1 ${isBound ? 'bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4]' : 'bg-[#e21b23]/15 border-[#e21b23]/50 text-[#ff4d58] hover:bg-[#e21b23] hover:text-black'} border text-[10px] font-bold transition-all cursor-pointer rounded-xs" data-id="${r.id}" title="${isBound ? 'Desvincular da Ficha' : 'Vincular à Ficha'}">
                    ${isBound ? '✓ NA FICHA' : '+ NA FICHA'}
                  </button>
                  <button class="px-2.5 py-1 bg-[#090b10] border border-[#1f2537] text-[#e21b23] group-hover:border-[#e21b23] text-[10px] font-bold">
                    [ EXAMINAR ]
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${hasMore ? `
          <div id="grimoire-load-more-sentinel" class="text-center py-6">
            <button id="grimoire-load-more-btn" class="px-6 py-3 bg-[#0c0507] hover:bg-[#1a080b] border border-[#e21b23] text-[#ffffff] hover:text-[#ff333d] font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(226,27,35,0.3)] cursor-pointer">
              [ CARREGAR MAIS RITUAIS (${rituals.length - this.visibleCount} RESTANTES) ⮞ ]
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  attachEventListeners() {
    // Input de busca
    const searchInput = this.container.querySelector('#grimoire-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.visibleCount = 24;
        this.render();
        const updatedInput = this.container.querySelector('#grimoire-search');
        if (updatedInput) {
          updatedInput.focus();
          updatedInput.setSelectionRange(updatedInput.value.length, updatedInput.value.length);
        }
      });
    }

    // Botão limpar busca
    this.container.querySelector('#clear-search-btn')?.addEventListener('click', () => {
      this.searchQuery = "";
      this.visibleCount = 24;
      this.render();
    });

    // Alternar Visualização Cards / Lista
    this.container.querySelector('#view-cards-btn')?.addEventListener('click', () => {
      soundFX.playRuneClick();
      this.viewMode = 'cards';
      this.render();
    });
    this.container.querySelector('#view-list-btn')?.addEventListener('click', () => {
      soundFX.playRuneClick();
      this.viewMode = 'list';
      this.render();
    });

    // Ordenação
    const sortSelect = this.container.querySelector('#sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        soundFX.playRuneClick();
        this.sortBy = e.target.value;
        this.visibleCount = 24;
        this.render();
      });
    }

    // Filtros de Círculo
    this.container.querySelectorAll('.circle-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.selectedCircle = btn.getAttribute('data-circle');
        this.visibleCount = 24;
        this.render();
      });
    });

    // Filtros de Emoção
    this.container.querySelectorAll('.emotion-sidebar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.selectedEmotion = btn.getAttribute('data-emotion');
        this.visibleCount = 24;
        this.render();
      });
    });

    // Filtros de Execução
    this.container.querySelectorAll('.exec-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.selectedExecution = btn.getAttribute('data-exec');
        this.visibleCount = 24;
        this.render();
      });
    });

    // Resetar todos os filtros
    const resetBtn = this.container.querySelector('#reset-all-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.searchQuery = "";
        this.selectedEmotion = "all";
        this.selectedCircle = "all";
        this.selectedExecution = "all";
        this.visibleCount = 24;
        this.render();
      });
    }

    const emptyResetBtn = this.container.querySelector('#empty-clear-filters-btn');
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.searchQuery = "";
        this.selectedEmotion = "all";
        this.selectedCircle = "all";
        this.selectedExecution = "all";
        this.visibleCount = 24;
        this.render();
      });
    }

    // Carregar Mais Rituais (Botão Manual + Infinite Scroll)
    const loadMoreBtn = this.container.querySelector('#grimoire-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.visibleCount += 24;
        this.render();
      });
    }

    const sentinel = this.container.querySelector('#grimoire-load-more-sentinel');
    if (sentinel && window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          this.visibleCount += 24;
          this.render();
        }
      }, { rootMargin: '250px' });
      observer.observe(sentinel);
    }

    // Delegação de evento única para os 200 rituais (render instantâneo sem congelamento)
    if (!this.hasCardListener) {
      this.hasCardListener = true;
      this.container.addEventListener('click', (e) => {
        const bindBtn = e.target.closest('.quick-bind-ritual-btn');
        if (bindBtn) {
          e.stopPropagation();
          const rId = bindBtn.getAttribute('data-id');
          const ritual = RITUALS_DATA.find(x => x.id === rId);
          if (ritual) {
            const isNowBound = this.toggleBindRitual(ritual);
            bindBtn.textContent = isNowBound ? '✓ NA FICHA' : '+ NA FICHA';
            bindBtn.className = `quick-bind-ritual-btn px-2.5 py-0.5 ${isNowBound ? 'bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4]' : 'bg-[#e21b23]/15 border-[#e21b23]/50 text-[#ff4d58] hover:bg-[#e21b23] hover:text-black'} border font-mono text-[9px] font-bold transition-all cursor-pointer rounded-xs`;
            bindBtn.title = isNowBound ? 'Desvincular da Ficha' : 'Vincular à Ficha';
          }
          return;
        }

        const item = e.target.closest('.ritual-item');
        if (item) {
          const ritualId = item.getAttribute('data-id');
          this.openRitualModal(ritualId);
        }
      });
    }
  }

  renderModal() {
    if (!this.activeRitualModal) return;
    const r = this.activeRitualModal;
    const isRare = r.circle === 3;
    const isForbidden = r.circle === 4;
    const isBound = this.isRitualBound(r.id, r.name);

    const existing = document.getElementById('ritual-detail-modal');
    if (existing) existing.remove();

    const modalHtml = `
      <div id="ritual-detail-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md transition-opacity">
        <div class="max-w-2xl w-full p-6 sm:p-8 bg-[#07090e] border-2 ${isForbidden ? 'border-[#e21b23] shadow-[0_0_50px_rgba(226,27,35,0.45)]' : 'border-[#262e42] shadow-[0_0_35px_rgba(0,0,0,0.95)]'} relative overflow-hidden max-h-[92vh] flex flex-col rounded-sm">
          
          <!-- Selo Superior de Arquivo -->
          <div class="flex items-start justify-between gap-4 border-b border-[#212838] pb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 p-1.5 rounded-lg bg-[#0e0608] border border-[#e21b23]/50 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(226,27,35,0.5)]">
                <img src="${ICONS8.emotions[r.emotion]}" class="w-9 h-9 object-contain" alt="${r.emotionName}" />
              </div>
              <div>
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-xs font-mono font-bold text-[#e21b23]">
                    [ ${r.circle}º CÍRCULO • ${r.peCost} PE ]
                  </span>
                  <span class="px-2 py-0.2 bg-[#e21b23]/20 border border-[#e21b23]/40 text-[#ffffff] text-[9px] font-mono font-bold uppercase">
                    ${r.emotionName}
                  </span>
                  ${isForbidden ? `<span class="inline-flex items-center gap-1 text-[9px] font-mono text-[#ff333d] font-black uppercase"><img src="${ICONS8.skullRed}" class="w-3 h-3 object-contain" alt="" /> CÓDICE PROIBIDO</span>` : isRare ? `<span class="inline-flex items-center gap-1 text-[9px] font-mono text-[#e21b23] font-bold uppercase"><img src="${ICONS8.starLight}" class="w-3 h-3 object-contain" alt="" /> RITUAL RARO</span>` : ''}
                </div>
                <h3 class="text-2xl sm:text-3xl font-serif font-black text-white">
                  ${r.name}
                </h3>
              </div>
            </div>

            <button id="close-modal-btn" class="text-[#8e95a5] hover:text-[#e21b23] p-1.5 font-mono font-bold text-sm">
              [ × ]
            </button>
          </div>

          <!-- Métricas Rápidas -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-xs">
            <div class="bg-[#050608] border border-[#191e2b] p-2.5">
              <span class="text-[9px] font-mono uppercase text-[#e21b23] font-bold flex items-center gap-1 mb-1">
                <img src="${ICONS8.clock}" class="w-3 h-3 object-contain" alt="" />
                <span>Execução</span>
              </span>
              <span class="font-bold text-white font-sans">${r.execution}</span>
            </div>
            <div class="bg-[#050608] border border-[#191e2b] p-2.5">
              <span class="text-[9px] font-mono uppercase text-[#e21b23] font-bold flex items-center gap-1 mb-1">
                <img src="${ICONS8.target}" class="w-3 h-3 object-contain" alt="" />
                <span>Alcance</span>
              </span>
              <span class="font-bold text-white font-sans">${r.range}</span>
            </div>
            <div class="bg-[#050608] border border-[#191e2b] p-2.5">
              <span class="text-[9px] font-mono uppercase text-[#e21b23] font-bold flex items-center gap-1 mb-1">
                <img src="${ICONS8.hourglass}" class="w-3 h-3 object-contain" alt="" />
                <span>Duração</span>
              </span>
              <span class="font-bold text-white font-sans">${r.duration}</span>
            </div>
            <div class="bg-[#050608] border border-[#191e2b] p-2.5">
              <span class="text-[9px] font-mono uppercase text-[#e21b23] font-bold flex items-center gap-1 mb-1">
                <img src="${ICONS8.shield}" class="w-3 h-3 object-contain" alt="" />
                <span>Resistência</span>
              </span>
              <span class="font-bold text-white font-sans">${r.save}</span>
            </div>
          </div>

          <!-- Conteúdo com Rolagem -->
          <div class="overflow-y-auto pr-1 space-y-4 flex-1 no-scrollbar">
            
            <div class="bg-[#040508] border border-[#191e2b] p-4">
              <span class="text-[10px] font-mono uppercase text-[#e21b23] font-bold block mb-1.5">
                [ FÓRMULA & EFEITO RITUALÍSTICO ]
              </span>
              <p class="text-xs sm:text-sm text-[#cbd0dc] font-serif leading-relaxed">
                ${r.effect}
              </p>
            </div>

            <div class="bg-[#0c0607] border-l-3 border-[#e21b23] border-t border-r border-b border-[#211618] p-4 shadow-[0_0_15px_rgba(226,27,35,0.25)]">
              <span class="text-[10px] font-mono uppercase text-[#e21b23] font-black block mb-1">
                [ AMPLIAÇÃO ESPECIAL (+PE) ]
              </span>
              <p class="text-xs text-[#cbd0dc] font-mono leading-relaxed">
                ${r.amplification}
              </p>
            </div>

            <div class="p-3 bg-[#040508] border border-[#191e2b] flex items-center justify-between text-xs font-mono text-[#8e95a5]">
              <span>TIPO DE DANO: <strong class="text-[#e21b23]">${r.dmgType}</strong></span>
              <span>CÁLCULO DE CD: <strong>10 + ATRIBUTO + TREINO</strong></span>
            </div>

          </div>

          <!-- Rodapé do Modal -->
          <div class="border-t border-[#1f2537] pt-4 mt-4 flex flex-wrap items-center justify-between gap-3">
            <span class="text-[10px] font-liturgical italic text-[#8e95a5]">
              "O ritual molda o Avesso através da intenção manifesta."
            </span>
            <div class="flex items-center gap-2.5">
              <button id="modal-bind-ritual-btn" class="px-4 py-2 ${isBound ? 'bg-[#06b6d4] text-black hover:bg-white' : 'bg-[#e21b23] text-black hover:bg-white'} font-mono font-black text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer">
                <span>${isBound ? '✓ VINCULADO À FICHA' : '+ VINCULAR À FICHA'}</span>
              </button>
              <button id="copy-ritual-btn" class="px-3.5 py-2 bg-[#090d15] border border-[#273248] text-white hover:text-[#e21b23] hover:border-[#e21b23] font-mono font-bold text-xs transition-colors cursor-pointer">
                [ COPIAR ]
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('close-modal-btn')?.addEventListener('click', () => this.closeRitualModal());
    document.getElementById('ritual-detail-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'ritual-detail-modal') this.closeRitualModal();
    });

    document.getElementById('modal-bind-ritual-btn')?.addEventListener('click', () => {
      const nowBound = this.toggleBindRitual(r);
      const btn = document.getElementById('modal-bind-ritual-btn');
      if (btn) {
        btn.className = `px-4 py-2 ${nowBound ? 'bg-[#06b6d4] text-black hover:bg-white' : 'bg-[#e21b23] text-black hover:bg-white'} font-mono font-black text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer`;
        btn.innerHTML = `<span>${nowBound ? '✓ VINCULADO À FICHA' : '+ VINCULAR À FICHA'}</span>`;
      }
      this.container.querySelectorAll(`.quick-bind-ritual-btn[data-id="${r.id}"]`).forEach(b => {
        b.textContent = nowBound ? '✓ NA FICHA' : '+ NA FICHA';
        b.className = `quick-bind-ritual-btn px-2.5 py-0.5 ${nowBound ? 'bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4]' : 'bg-[#e21b23]/15 border-[#e21b23]/50 text-[#ff4d58] hover:bg-[#e21b23] hover:text-black'} border font-mono text-[9px] font-bold transition-all cursor-pointer rounded-xs`;
        b.title = nowBound ? 'Desvincular da Ficha' : 'Vincular à Ficha';
      });
    });

    document.getElementById('copy-ritual-btn')?.addEventListener('click', () => {
      const textToCopy = `[PAROXISMO] ${r.name} (${r.circle}º Círculo • ${r.peCost} PE • ${r.emotionName})\nExecução: ${r.execution} | Alcance: ${r.range} | Duração: ${r.duration} | Resistência: ${r.save}\nEfeito: ${r.effect}\nAmpliação: ${r.amplification}`;
      navigator.clipboard.writeText(textToCopy);
      soundFX.playRuneClick();
      showLiturgicalToast({
        title: "GRIMÓRIO COPIADO",
        subtitle: r.name,
        message: "Fórmula do ritual copiada para a área de transferência.",
        type: "success"
      });
    });
  }
}
