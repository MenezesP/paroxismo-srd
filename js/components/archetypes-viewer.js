/**
 * PAROXISMO - SRD COMPENDIUM
 * Componente: ArchetypesViewer (O Livro dos 45 Arquétipos Híbridos)
 * Manual Oficial de Ressonância Emocional, Poderes Híbridos & Custos do Paroxismo
 * Design AAA Militar Paranormal (Destiny 2, Control, Cyberpunk 2077, Dead Space)
 */

import { ARCHETYPES_DATA, ARCHETYPES_RULES } from '../data/archetypes.js?v=rules_supreme_v1';
import { EMOTIONS_DATA } from '../data/emotions.js';
import { soundFX } from '../utils/sound-fx.js';
import { ICONS8 } from '../utils/icons8.js?v=icons8_v1';
import { normalizeText } from '../utils/search-engine.js';

export class ArchetypesViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.searchQuery = "";
    this.selectedEmotion = "all";
    this.activeTabLevel = "both"; // "both", "lvl1", "lvl2"
    this.viewMode = "dossier"; // "dossier" ou "archive"
    this.activeArchetypeId = 1; // Padrão: Cinzas Negras (#01)
    this.rulesOpen = false;
    this.keyboardBound = false;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="space-y-8 animate-fadeIn pb-24 tactical-grid-bg">
        
        <!-- ============================================================ -->
        <!-- 1. BARRA DE TELEMETRIA SUPERIOR DA ORDO LITÚRGICA (HUD AAA)  -->
        <!-- ============================================================ -->
        <div class="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 bg-[#07090e] border-b border-white/[0.08] text-[11px] font-mono text-[#8e95a5]">
          <div class="flex items-center gap-3">
            <span class="inline-block w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4] animate-pulse"></span>
            <span class="text-white font-bold tracking-wider">TERMINAL ORDO LITÚRGICA // SEC-ARCH-45</span>
            <span class="hidden sm:inline text-white/20">|</span>
            <span class="hidden sm:inline text-white/60">PROTOCOLO: ORD-HYBRID-v4.9</span>
            <span class="hidden md:inline text-white/20">|</span>
            <span class="hidden md:inline text-[#e21b23] font-black uppercase">ACESSO RESTRITO // GRAU DE SEGURANÇA 7</span>
          </div>

          <div class="flex items-center gap-4 text-right">
            <div class="hidden sm:flex items-center gap-2">
              <span class="text-white/40">RESSONÂNCIA PSÍQUICA:</span>
              <span class="text-[#06b6d4] font-bold">99.4% [ESTÁVEL]</span>
            </div>
            <!-- Botão do Guia de Campo / Regras dos Capítulos 1 & 2 -->
            <button id="toggle-rules-btn" class="px-3 py-1 bg-[#10141f] hover:bg-[#e21b23] text-white hover:text-black border border-white/10 hover:border-[#e21b23] transition-all font-bold flex items-center gap-1.5 cursor-pointer">
              <span class="text-[#e21b23] hover:text-black">✠</span>
              <span id="toggle-rules-text">GUIA DE CAMPO: REGRAS DE FUSÃO</span>
              <span id="toggle-rules-icon" class="text-[9px]">▼</span>
            </button>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- 2. PAINEL DESDOBRÁVEL: GUIA DE CAMPO (CAPÍTULOS 1 & 2)       -->
        <!-- ============================================================ -->
        <div id="archetypes-rules-panel" class="${this.rulesOpen ? 'block' : 'hidden'} mx-4 sm:mx-6 p-6 bg-[#07090e]/95 border border-[#e21b23]/30 shadow-[0_0_30px_rgba(0,0,0,0.9)] space-y-6">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span class="text-[10px] font-mono text-[#e21b23] font-bold tracking-widest uppercase">REGULAMENTO CANÔNICO DE FUSÕES</span>
              <h2 class="text-xl sm:text-2xl font-serif font-black text-white tracking-wider">
                ${ARCHETYPES_RULES.title}
              </h2>
            </div>
            <span class="text-xs font-mono text-white/40">ORD-MANUAL-REF // 45 FUSÕES</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- CAPÍTULO 1 -->
            <div class="p-4 bg-[#0a0d15] border-l-2 border-l-[#e21b23] space-y-3">
              <h3 class="text-xs font-mono font-black text-[#e21b23] uppercase tracking-wider">
                ${ARCHETYPES_RULES.chapter1.title}
              </h3>
              <p class="text-xs text-[#cbd0dc] leading-relaxed font-sans">
                ${ARCHETYPES_RULES.chapter1.text}
              </p>
              <div class="space-y-2 pt-1">
                ${ARCHETYPES_RULES.chapter1.points.map(pt => `
                  <div class="p-2.5 bg-[#05060a] border-l border-white/10 text-xs">
                    <strong class="text-white block font-sans">${pt.title}</strong>
                    <span class="text-[#8e95a5] text-[11px] leading-relaxed block mt-0.5">${pt.desc}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- CAPÍTULO 2 -->
            <div class="p-4 bg-[#0a0d15] border-l-2 border-l-[#06b6d4] space-y-3">
              <h3 class="text-xs font-mono font-black text-[#06b6d4] uppercase tracking-wider">
                ${ARCHETYPES_RULES.chapter2.title}
              </h3>
              <p class="text-xs text-[#cbd0dc] leading-relaxed font-sans">
                ${ARCHETYPES_RULES.chapter2.text}
              </p>
              <div class="space-y-2 pt-1">
                ${ARCHETYPES_RULES.chapter2.levels.map(lvl => `
                  <div class="p-2.5 bg-[#05060a] border-l border-white/10 text-xs">
                    <div class="flex items-center justify-between gap-2">
                      <strong class="text-white font-mono text-[11px]">${lvl.tier}</strong>
                      <span class="text-[10px] font-mono text-[#06b6d4] font-bold">${lvl.cost}</span>
                    </div>
                    <span class="text-[#06b6d4]/80 text-[10px] font-mono block">${lvl.unlock}</span>
                    <p class="text-[#8e95a5] text-[11px] leading-relaxed mt-1">${lvl.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- AVISO DE EQUILÍBRIO PAROXÍSTICO (HAZARD) -->
          <div class="paroxysm-hazard-banner p-4 flex items-start gap-4">
            <img src="${ICONS8.skull('FF333D', 28)}" alt="" class="w-7 h-7 object-contain flex-shrink-0 mt-0.5" />
            <div>
              <h4 class="text-xs font-mono font-black text-[#ff333d] uppercase tracking-widest flex items-center gap-2">
                <span>⚠️ ALERTA DE EQUILÍBRIO PAROXÍSTICO // DESVANTAGEM MECÂNICA</span>
              </h4>
              <p class="text-xs text-[#fecaca] font-serif italic leading-relaxed mt-1">
                ${ARCHETYPES_RULES.chapter2.paroxismWarning.text}
              </p>
            </div>
          </div>

          <!-- ============================================================ -->
          <!-- CAPÍTULO 3: CLASSE DE DIFICULDADE (CD) & TESTES DE RESISTÊNCIA -->
          <!-- ============================================================ -->
          <div class="p-5 bg-[#0a0d15] border-l-2 border-l-[#eab308] space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span class="text-[10px] font-mono text-[#eab308] font-bold tracking-widest uppercase block">[ MATRIZ MATEMÁTICA OFICIAL ]</span>
                <h3 class="text-sm sm:text-base font-serif font-black text-white uppercase tracking-wider">
                  ${ARCHETYPES_RULES.chapter3.title}
                </h3>
              </div>
              <div class="px-3 py-1 bg-black/60 border border-[#eab308]/40 text-[#eab308] font-mono font-black text-xs tracking-wider">
                ${ARCHETYPES_RULES.chapter3.formula}
              </div>
            </div>

            <!-- Exemplo e Atributos-Chave -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="p-3.5 bg-[#05060a] border border-white/10 space-y-2">
                <span class="text-[10px] font-mono font-bold text-[#eab308] uppercase block">ATRIBUTO-CHAVE DA EMOÇÃO DOMINANTE:</span>
                <div class="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  ${ARCHETYPES_RULES.chapter3.keyAttributes.map(k => `
                    <div class="flex justify-between border-b border-white/5 py-0.5">
                      <span class="text-white/80">${k.emo}:</span>
                      <span class="text-[#06b6d4] font-bold">${k.attr}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="p-3.5 bg-[#05060a] border border-white/10 space-y-2 flex flex-col justify-between">
                <div>
                  <span class="text-[10px] font-mono font-bold text-[#eab308] uppercase block">ESCALA DE TREINAMENTO POR NÍVEL:</span>
                  <div class="space-y-1.5 mt-2 text-[11px] font-mono">
                    ${ARCHETYPES_RULES.chapter3.trainingScaling.map(t => `
                      <div class="flex items-center justify-between p-1 bg-black/40 border border-white/5">
                        <span class="text-white/70">${t.range}</span>
                        <span class="text-[#e21b23] font-bold">${t.bonus}</span>
                        <span class="text-[#8e95a5] text-[10px]">${t.cdExpected}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <p class="text-[11px] text-[#cbd0dc] font-serif italic border-l border-[#eab308] pl-2 mt-2">
                  "${ARCHETYPES_RULES.chapter3.example}"
                </p>
              </div>
            </div>

            <!-- Os 4 Testes de Resistência -->
            <div>
              <span class="text-[10px] font-mono font-bold text-white/60 uppercase tracking-wider block mb-2">
                OS 4 TESTES DE RESISTÊNCIA (O QUE A VÍTIMA ROLA: 1d20 + Atributo + Treinamento vs CD):
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                ${ARCHETYPES_RULES.chapter3.saves.map(s => `
                  <div class="p-3 bg-[#05060a] border border-white/10 space-y-2 text-xs flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between gap-1 mb-1">
                        <strong class="text-white font-serif font-bold text-[11px] uppercase">${s.name}</strong>
                        <span class="text-[9px] font-mono text-[#06b6d4] font-bold bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-1 py-0.2">${s.attr}</span>
                      </div>
                      <p class="text-[10px] text-[#8e95a5] leading-relaxed mb-2">${s.targets}</p>
                    </div>
                    <div class="space-y-1 pt-2 border-t border-white/5 text-[10px]">
                      <div class="text-[#86efac]"><strong class="font-mono">SE PASSAR:</strong> ${s.pass}</div>
                      <div class="text-[#fca5a5]"><strong class="font-mono">SE FALHAR:</strong> ${s.fail}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Críticos e Regras Especiais de Resistência -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] font-mono">
              <div class="p-2.5 bg-black/50 border border-green-500/30 text-white/90">
                <strong class="text-green-400 block mb-0.5 font-bold">✦ 20 NATURAL NA RESISTÊNCIA:</strong>
                ${ARCHETYPES_RULES.chapter3.criticalSuccess}
              </div>
              <div class="p-2.5 bg-black/50 border border-red-500/30 text-white/90">
                <strong class="text-red-400 block mb-0.5 font-bold">✦ 1 NATURAL NA RESISTÊNCIA:</strong>
                ${ARCHETYPES_RULES.chapter3.criticalFailure}
              </div>
            </div>

            <div class="p-3 bg-black/60 border border-white/10 text-[11px] font-mono text-[#cbd0dc] space-y-1">
              <p><strong class="text-[#06b6d4]">LIBERAÇÃO POR RODADA:</strong> ${ARCHETYPES_RULES.chapter3.breakFreeRule}</p>
              <p class="pt-1 border-t border-white/5"><strong class="text-[#e21b23]">BIDIRECIONALIDADE:</strong> ${ARCHETYPES_RULES.chapter3.bidirectionalRule}</p>
            </div>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- 3. BARRA DE COMANDO & FILTROS DIEGÉTICOS (HUD CAD)           -->
        <!-- ============================================================ -->
        <div class="mx-4 sm:mx-6 space-y-4">
          
          <!-- Linha Superior: Busca Rápida + Alternador de Visualização + Níveis -->
          <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-[#080b12] border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            
            <!-- Campo de Busca HUD -->
            <div class="flex-1 relative">
              <div class="flex items-center bg-[#040508] border border-white/[0.12] focus-within:border-[#06b6d4] transition-colors px-3 py-2">
                <span class="text-white/40 mr-2 font-mono text-xs">⌕</span>
                <input 
                  type="text" 
                  id="archetype-search-input"
                  placeholder="Buscar por codinome, efeito, condição (ex: Silenciado, Sangrando, Vazio)..."
                  value="${this.searchQuery}"
                  class="w-full bg-transparent text-xs text-white placeholder-white/30 outline-none font-mono"
                />
                ${this.searchQuery ? `
                  <button id="clear-search-btn" class="text-white/40 hover:text-white text-xs px-1 cursor-pointer" title="Limpar busca">✕</button>
                ` : ''}
              </div>
            </div>

            <!-- Controles de Exibição de Nível (Segmented Pills) -->
            <div class="flex items-center gap-1 bg-[#040508] p-1 border border-white/[0.08]">
              <span class="text-[9px] font-mono text-white/40 px-2 font-bold uppercase tracking-wider">FILTRO NÍVEL:</span>
              <button class="level-tab-btn px-2.5 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${this.activeTabLevel === 'both' ? 'bg-[#06b6d4] text-black font-black' : 'text-white/60 hover:text-white'}" data-level="both">
                AMBOS
              </button>
              <button class="level-tab-btn px-2.5 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${this.activeTabLevel === 'lvl1' ? 'bg-[#06b6d4] text-black font-black' : 'text-white/60 hover:text-white'}" data-level="lvl1">
                NÍVEL 1 (NV 4)
              </button>
              <button class="level-tab-btn px-2.5 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${this.activeTabLevel === 'lvl2' ? 'bg-[#e21b23] text-black font-black' : 'text-white/60 hover:text-white'}" data-level="lvl2">
                NÍVEL 2 (NV 16)
              </button>
            </div>

            <!-- Alternador de Modo: Dossiê de Foco vs Grade Geral -->
            <div class="flex items-center gap-1 bg-[#040508] p-1 border border-white/[0.08]">
              <span class="text-[9px] font-mono text-white/40 px-2 font-bold uppercase tracking-wider">MODO:</span>
              <button class="view-mode-btn px-3 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${this.viewMode === 'dossier' ? 'bg-[#e21b23] text-black font-black' : 'text-white/60 hover:text-white'}" data-mode="dossier">
                DOSSIÊ DE COMBATE
              </button>
              <button class="view-mode-btn px-3 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${this.viewMode === 'archive' ? 'bg-[#e21b23] text-black font-black' : 'text-white/60 hover:text-white'}" data-mode="archive">
                ARQUIVO GERAL (GRADE)
              </button>
            </div>

          </div>

          <!-- Filtro Visual pelas 10 Emoções Formadoras (Catalisadores Rúnicos) -->
          <div class="p-3 bg-[#06080d] border border-white/[0.05] space-y-2">
            <div class="flex items-center justify-between text-[10px] font-mono text-white/40 uppercase tracking-wider">
              <span>SINTONIZAR POR CATALISADOR EMOCIONAL:</span>
              <span id="results-count-badge" class="text-[#06b6d4] font-bold">45 ARQUÉTIPOS CANÔNICOS</span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button class="emotion-filter-pill px-3 py-1.5 text-[11px] font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${this.selectedEmotion === 'all' ? 'bg-white text-black border-white font-black shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'bg-[#090c14] border-white/10 text-[#8e95a5] hover:border-white/30 hover:text-white'}" data-emo="all">
                <span>TODAS (45)</span>
              </button>

              ${EMOTIONS_DATA.map(emo => {
                const count = ARCHETYPES_DATA.filter(a => a.e1 === emo.id || a.e2 === emo.id).length;
                const isSelected = this.selectedEmotion === emo.id;
                return `
                  <button class="emotion-filter-pill px-2.5 py-1 text-[11px] font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${isSelected ? 'bg-[#121622] border-[#06b6d4] text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#090c14] border-white/10 text-[#8e95a5] hover:border-white/30 hover:text-white'}" data-emo="${emo.id}">
                    <img src="${emo.iconUrl}" class="w-4 h-4 object-contain filter drop-shadow-[0_0_4px_${emo.color}80]" alt="" />
                    <span>${emo.name.replace('O ', '').replace('A ', '')}</span>
                    <span class="text-[9px] text-white/40">(${count})</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

        </div>

        <!-- ============================================================ -->
        <!-- 4. PALCO PRINCIPAL: MODO DOSSIÊ OU MODO GRADE                -->
        <!-- ============================================================ -->
        <div id="archetypes-main-stage" class="mx-4 sm:mx-6">
          ${this.viewMode === 'dossier' ? this.renderDossierView() : this.renderArchiveView()}
        </div>

      </div>

      <!-- MODAL DE DETALHES COMPLETOS / EXPORTAÇÃO (SE USADO NO MODO GRADE) -->
      <div id="archetype-detail-modal-container"></div>
    `;

    this.setupEvents();
    this.setupKeyboardNavigation();
  }

  getFilteredArchetypes() {
    return ARCHETYPES_DATA.filter(arc => {
      if (this.selectedEmotion !== 'all') {
        if (arc.e1 !== this.selectedEmotion && arc.e2 !== this.selectedEmotion) {
          return false;
        }
      }

      if (this.searchQuery && this.searchQuery.trim()) {
        const normQ = normalizeText(this.searchQuery);

        // 1. Sintaxe "+" (ex: "Pavor + Rancor" ou "pavor+rancor")
        if (normQ.includes('+')) {
          const parts = normQ.split('+').map(p => p.trim()).filter(p => p.length > 0);
          if (parts.length >= 2) {
            const p1 = parts[0];
            const p2 = parts[1];
            const normE1 = normalizeText(arc.e1Name);
            const normE2 = normalizeText(arc.e2Name);
            const id1 = normalizeText(arc.e1);
            const id2 = normalizeText(arc.e2);

            const match1 = (normE1.includes(p1) || id1.includes(p1)) && (normE2.includes(p2) || id2.includes(p2));
            const match2 = (normE1.includes(p2) || id1.includes(p2)) && (normE2.includes(p1) || id2.includes(p1));
            return match1 || match2;
          }
        }

        // 2. Duas palavras correspondendo a emoções (ex: "pavor rancor" ou "pavor e rancor")
        const words = normQ.split(/\s+/);
        if (words.length === 2 || (words.length === 3 && (words[1] === 'e' || words[1] === 'com' || words[1] === 'x'))) {
          const w1 = words[0];
          const w2 = words[words.length - 1];
          const normE1 = normalizeText(arc.e1Name);
          const normE2 = normalizeText(arc.e2Name);
          const id1 = normalizeText(arc.e1);
          const id2 = normalizeText(arc.e2);

          const matchPair = (
            ((normE1.includes(w1) || id1.includes(w1)) && (normE2.includes(w2) || id2.includes(w2))) ||
            ((normE1.includes(w2) || id1.includes(w2)) && (normE2.includes(w1) || id2.includes(w1)))
          );
          if (matchPair) return true;
        }

        // 3. Busca padrão normalizada (sem acentos) por nome, emoções, citação, efeitos e penalidades
        const normName = normalizeText(arc.name);
        const normE1 = normalizeText(arc.e1Name);
        const normE2 = normalizeText(arc.e2Name);
        const normQuote = normalizeText(arc.quote);
        const normLvl1 = normalizeText(`${arc.level1.effect} ${arc.level1.enemy} ${arc.level1.activation} ${arc.level1.durationRange} ${arc.level1.roll}`);
        const normLvl2 = normalizeText(`${arc.level2.extremePower} ${arc.level2.enemy} ${arc.level2.penaltyName} ${arc.level2.penaltyDesc}`);

        const tokens = normQ.replace(/[\+\,\-\/]/g, ' ').split(/\s+/).filter(t => t.length > 0);

        return tokens.every(t => 
          normName.includes(t) || normE1.includes(t) || normE2.includes(t) || 
          normQuote.includes(t) || normLvl1.includes(t) || normLvl2.includes(t)
        );
      }

      return true;
    });
  }

  // ============================================================
  // RENDERIZAÇÃO: MODO DOSSIÊ DE COMBATE (HERO PRESENTATION)
  // ============================================================
  renderDossierView() {
    const filtered = this.getFilteredArchetypes();
    if (filtered.length === 0) {
      return this.renderEmptyState();
    }

    // Garante que o arquétipo ativo seja um dos filtrados
    let arc = filtered.find(a => a.id === this.activeArchetypeId);
    if (!arc) {
      arc = filtered[0];
      this.activeArchetypeId = arc.id;
    }

    const currentIndex = filtered.findIndex(a => a.id === arc.id);
    const prevArc = filtered[(currentIndex - 1 + filtered.length) % filtered.length];
    const nextArc = filtered[(currentIndex + 1) % filtered.length];

    const emo1 = EMOTIONS_DATA.find(e => e.id === arc.e1) || { color: '#e21b23', iconUrl: 'assets/images/Rancor.png' };
    const emo2 = EMOTIONS_DATA.find(e => e.id === arc.e2) || { color: '#06b6d4', iconUrl: 'assets/images/Vazio.png' };

    const showLvl1 = this.activeTabLevel === 'both' || this.activeTabLevel === 'lvl1';
    const showLvl2 = this.activeTabLevel === 'both' || this.activeTabLevel === 'lvl2';

    return `
      <div class="space-y-8 animate-dossier-reveal" style="--e1-color: ${emo1.color}; --e2-color: ${emo2.color};">
        
        <!-- ============================================================ -->
        <!-- CABEÇALHO CINEMATOGRÁFICO DO ARQUÉTIPO (HERO STAGE)          -->
        <!-- ============================================================ -->
        <article class="p-6 sm:p-10 bg-[#06080d] border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.85)] relative overflow-hidden">
          
          <!-- Cantoneiras Táticas Militares nos 4 Vértices -->
          <div class="absolute top-2 left-2 text-white/20 font-mono text-xs select-none">+</div>
          <div class="absolute top-2 right-2 text-white/20 font-mono text-xs select-none">+</div>
          <div class="absolute bottom-2 left-2 text-white/20 font-mono text-xs select-none">+</div>
          <div class="absolute bottom-2 right-2 text-white/20 font-mono text-xs select-none">+</div>

          <!-- Faixa de Micro-HUD Superior -->
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-8 text-[11px] font-mono">
            <div class="flex items-center gap-3">
              <span class="px-2 py-0.5 bg-[#e21b23] text-black font-black uppercase tracking-widest text-[10px]">
                DOSSIÊ #${String(arc.id).padStart(2, '0')}
              </span>
              <span class="text-white/60 uppercase tracking-wider">CODEX: ARCH-${String(arc.id).padStart(2, '0')} // FUSÃO HÍBRIDA CANÔNICA</span>
            </div>
            <div class="flex items-center gap-4 text-white/40">
              <span>AMEAÇA: <strong class="text-[#ff333d]">CLASSE-OMEGA</strong></span>
              <span class="hidden sm:inline">|</span>
              <span class="hidden sm:inline">COORD: 23°54'S 46°38'W</span>
              <span class="hidden sm:inline">|</span>
              <span class="text-[#06b6d4] font-bold">DESCRIPTOGRAFADO</span>
            </div>
          </div>

          <!-- CORPO HERO: NOME MONUMENTAL + CITAÇÃO + NÚCLEO DE SÍNTESE -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <!-- Coluna Esquerda/Centro: Identificação e Citação (7 Colunas) -->
            <div class="lg:col-span-7 space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" style="background-color: ${emo1.color}"></span>
                <span class="text-xs font-mono font-bold tracking-widest uppercase text-white/60">
                  RESSONÂNCIA DUAL: <span style="color: ${emo1.color}">${arc.e1Name}</span> ＋ <span style="color: ${emo2.color}">${arc.e2Name}</span>
                </span>
              </div>

              <!-- O NOME DO ARQUÉTIPO COMO ELEMENTO PRINCIPAL DA TELA -->
              <h1 class="dossier-hero-title text-4xl sm:text-5xl lg:text-6xl leading-none">
                ${arc.name}
              </h1>

              <!-- Citação Literária e Conceito em Destaque Editorial -->
              <div class="pt-2">
                <div class="border-l-2 border-[#e21b23] pl-4 py-1">
                  <p class="text-base sm:text-lg font-liturgical italic text-[#e2e8f0] leading-relaxed">
                    "${arc.quote}"
                  </p>
                </div>
              </div>
            </div>

            <!-- Coluna Direita: Núcleo de Síntese de Emoções (5 Colunas) -->
            <div class="lg:col-span-5 p-6 bg-[#040508] border border-white/[0.08] relative">
              <div class="text-center mb-4">
                <span class="text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold">
                  CATALISADORES DE RESSONÂNCIA EMOCIONAL
                </span>
              </div>

              <!-- Síntese Visual: Emoção 1 + Vetor + Emoção 2 -->
              <div class="flex items-center justify-between gap-4">
                
                <!-- Catalisador 1 (Dominante) -->
                <div class="flex flex-col items-center gap-2 flex-shrink-0">
                  <div class="catalyst-emblem-container" style="box-shadow: 0 0 25px ${emo1.color}40; border-color: ${emo1.color}60;">
                    <img src="${emo1.iconUrl}" class="w-12 h-12 object-contain filter drop-shadow-[0_0_8px_${emo1.color}]" alt="${arc.e1Name}" />
                  </div>
                  <div class="text-center">
                    <span class="text-[9px] font-mono text-white/40 uppercase block">DOMINANTE</span>
                    <strong class="text-xs font-mono font-bold block" style="color: ${emo1.color}">${arc.e1Name}</strong>
                  </div>
                </div>

                <!-- Vetor Central de Fusão -->
                <div class="catalyst-vector-line my-auto">
                  <div class="catalyst-vector-spark">
                    <span>⇄ FUSÃO ANÔMALA ⇄</span>
                  </div>
                </div>

                <!-- Catalisador 2 (Latente) -->
                <div class="flex flex-col items-center gap-2 flex-shrink-0">
                  <div class="catalyst-emblem-container" style="box-shadow: 0 0 25px ${emo2.color}40; border-color: ${emo2.color}60;">
                    <img src="${emo2.iconUrl}" class="w-12 h-12 object-contain filter drop-shadow-[0_0_8px_${emo2.color}]" alt="${arc.e2Name}" />
                  </div>
                  <div class="text-center">
                    <span class="text-[9px] font-mono text-white/40 uppercase block">LATENTE</span>
                    <strong class="text-xs font-mono font-bold block" style="color: ${emo2.color}">${arc.e2Name}</strong>
                  </div>
                </div>

              </div>

              <!-- Micro-descrição do vetor de fusão -->
              <div class="mt-4 pt-3 border-t border-white/[0.06] text-center">
                <span class="text-[11px] font-mono text-[#8e95a5]">
                  Alinhamento do Agente no Estágio II (Nv 4) e Apoteose no Estágio V (Nv 16)
                </span>
              </div>

            </div>

          </div>

        </article>

        <!-- ============================================================ -->
        <!-- SEÇÃO DE HABILIDADES ASSIMÉTRICAS: NÍVEL 1 (CIANO) & NÍVEL 2 (VERMELHO) -->
        <!-- ============================================================ -->
        <div class="grid grid-cols-1 ${showLvl1 && showLvl2 ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-8">
          
          <!-- ============================================================ -->
          <!-- NÍVEL 1 — O DESPERTAR HÍBRIDO (CIANO)                         -->
          <!-- ============================================================ -->
          ${showLvl1 ? `
            <section class="beacon-cyan-rail p-6 sm:p-8 bg-[#07090e] border border-white/[0.06] space-y-6">
              
              <!-- Cabeçalho do Nível 1 -->
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#06b6d4]/20 pb-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 bg-[#06b6d4]/20 text-[#06b6d4] text-[10px] font-mono font-bold uppercase tracking-wider">
                      ESTÁGIO II // NÍVEL 4 DO AGENTE
                    </span>
                  </div>
                  <h3 class="text-xl sm:text-2xl font-serif font-black text-white tracking-wider">
                    ✦ NÍVEL 1: O DESPERTAR HÍBRIDO
                  </h3>
                </div>

                <div class="text-right">
                  <span class="px-3 py-1 bg-[#06b6d4] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                    ${arc.level1.activation}
                  </span>
                </div>
              </div>

              <!-- Parâmetros Operacionais (Duração & Rolagem) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-b border-white/[0.06] text-xs font-mono">
                <div>
                  <span class="text-white/40 uppercase block text-[10px] tracking-wider">DURAÇÃO & ALCANCE</span>
                  <span class="text-[#cbd0dc] font-bold text-xs mt-0.5 block">${arc.level1.durationRange}</span>
                </div>
                <div>
                  <span class="text-white/40 uppercase block text-[10px] tracking-wider">ROLAGEM OU TESTE</span>
                  <span class="text-[#06b6d4] font-bold text-xs mt-0.5 block">${arc.level1.roll}</span>
                </div>
              </div>

              <!-- Blocos de Informação Estruturados (Sem Caixas Confinantes) -->
              <div class="space-y-4 pt-1">
                
                <!-- Vetor Ativo: O Que Você Ganha -->
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-[#06b6d4] rounded-full"></span>
                    <span class="text-[11px] font-mono font-black text-[#06b6d4] uppercase tracking-widest">
                      [ VETOR ATIVO // BENEFÍCIO DO PORTADOR ]
                    </span>
                  </div>
                  <p class="text-sm text-white font-sans leading-relaxed pl-3.5">
                    ${arc.level1.effect}
                  </p>
                </div>

                <!-- Vetor Hostil: No Inimigo / Alvo -->
                <div class="space-y-1 pt-2">
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                    <span class="text-[11px] font-mono font-black text-[#cbd0dc] uppercase tracking-widest">
                      [ VETOR HOSTIL // SUPRESSÃO DO INIMIGO ]
                    </span>
                  </div>
                  <p class="text-sm text-[#94a3b8] font-sans leading-relaxed pl-3.5">
                    ${arc.level1.enemy}
                  </p>
                </div>

              </div>

              <!-- Rodapé Técnico Nível 1 -->
              <div class="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>CUSTO BALANCEADO: 2 PE</span>
                <span>STATUS: OPERAÇÃO CONTROLADA</span>
              </div>

            </section>
          ` : ''}

          <!-- ============================================================ -->
          <!-- NÍVEL 2 — A APOTEOSE HÍBRIDA (VERMELHO)                      -->
          <!-- ============================================================ -->
          ${showLvl2 ? `
            <section class="beacon-red-rail p-6 sm:p-8 bg-[#090305] border border-white/[0.06] space-y-6">
              
              <!-- Cabeçalho do Nível 2 -->
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#e21b23]/30 pb-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 bg-[#e21b23]/20 text-[#ff333d] text-[10px] font-mono font-bold uppercase tracking-wider">
                      ESTÁGIO V // NÍVEL 16 DO AGENTE
                    </span>
                  </div>
                  <h3 class="text-xl sm:text-2xl font-serif font-black text-white tracking-wider">
                    ✦ NÍVEL 2: A APOTEOSE DA FUSÃO
                  </h3>
                </div>

                <div class="text-right">
                  <span class="px-3 py-1 bg-[#e21b23] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(226,27,35,0.6)]">
                    ${arc.level2.activation}
                  </span>
                </div>
              </div>

              <!-- Parâmetros Operacionais (Duração & Rolagem) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-b border-white/[0.06] text-xs font-mono">
                <div>
                  <span class="text-white/40 uppercase block text-[10px] tracking-wider">DURAÇÃO & ALCANCE</span>
                  <span class="text-[#cbd0dc] font-bold text-xs mt-0.5 block">${arc.level2.durationRange}</span>
                </div>
                <div>
                  <span class="text-white/40 uppercase block text-[10px] tracking-wider">ROLAGEM OU TESTE</span>
                  <span class="text-[#ff333d] font-bold text-xs mt-0.5 block">${arc.level2.roll}</span>
                </div>
              </div>

              <!-- Blocos de Informação Estruturados -->
              <div class="space-y-4 pt-1">
                
                <!-- Cataclisma: Poder Extremo -->
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-[#ff333d] rounded-full"></span>
                    <span class="text-[11px] font-mono font-black text-[#ff333d] uppercase tracking-widest">
                      [ CATACLISMA // PODER MONUMENTAL ]
                    </span>
                  </div>
                  <p class="text-sm text-white font-sans font-medium leading-relaxed pl-3.5">
                    ${arc.level2.extremePower}
                  </p>
                </div>

                <!-- Condenação: No Inimigo / Alvo -->
                <div class="space-y-1 pt-2">
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                    <span class="text-[11px] font-mono font-black text-[#cbd0dc] uppercase tracking-widest">
                      [ CONDENAÇÃO // SUPRESSÃO DE INIMIGOS & TITÃS ]
                    </span>
                  </div>
                  <p class="text-sm text-[#cbd0dc] font-sans leading-relaxed pl-3.5">
                    ${arc.level2.enemy}
                  </p>
                </div>

              </div>

              <!-- CUSTO DO PAROXISMO: ALERTA CRÍTICO MILITAR (DEAD SPACE / CONTROL) -->
              <div class="paroxysm-hazard-banner p-4 sm:p-5 mt-4 space-y-2">
                <div class="flex items-center justify-between gap-2 border-b border-[#e21b23]/30 pb-2">
                  <div class="flex items-center gap-2">
                    <img src="${ICONS8.skull('FF333D', 20)}" class="w-5 h-5 object-contain" alt="" />
                    <span class="text-xs font-mono font-black text-[#ff333d] uppercase tracking-widest animate-pulse">
                      ⚠️ ALERTA DE COLAPSO PAROXÍSTICO // DESVANTAGEM SEVERA
                    </span>
                  </div>
                  <span class="px-2 py-0.5 bg-[#e21b23]/30 text-[#ff8088] text-[9px] font-mono font-bold uppercase tracking-widest">
                    ${arc.level2.penaltyName.toUpperCase()}
                  </span>
                </div>

                <p class="text-xs sm:text-sm text-[#fecaca] font-serif italic leading-relaxed pt-1">
                  "${arc.level2.penaltyDesc}"
                </p>

                <div class="flex items-center justify-between text-[9px] font-mono text-white/40 pt-2 border-t border-white/[0.06]">
                  <span>CONDUTA IRREVERSÍVEL</span>
                  <span class="text-[#ff333d]">PREÇO EXIGIDO DA CARNE E DA SANIDADE</span>
                </div>
              </div>

            </section>
          ` : ''}

        </div>

        <!-- ============================================================ -->
        <!-- BARRA DE NAVEGAÇÃO TÁTICA ENTRE OS 45 ARQUÉTIPOS (BOTTOM HUD) -->
        <!-- ============================================================ -->
        <div class="p-4 bg-[#07090e] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
          
          <!-- Navegação Anterior / Próximo com Teclado -->
          <div class="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
            <button id="prev-archetype-btn" class="px-4 py-2 bg-[#10141f] hover:bg-[#e21b23] text-white hover:text-black border border-white/10 hover:border-[#e21b23] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer" data-id="${prevArc.id}" title="Atalho: Seta Esquerda (←)">
              <span>←</span>
              <span class="hidden sm:inline">ANTERIOR:</span>
              <span class="text-[#06b6d4] group-hover:text-black font-black">#${String(prevArc.id).padStart(2, '0')} ${prevArc.name}</span>
            </button>

            <button id="next-archetype-btn" class="px-4 py-2 bg-[#10141f] hover:bg-[#e21b23] text-white hover:text-black border border-white/10 hover:border-[#e21b23] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer" data-id="${nextArc.id}" title="Atalho: Seta Direita (→)">
              <span class="hidden sm:inline">PRÓXIMO:</span>
              <span class="text-[#06b6d4] font-black">#${String(nextArc.id).padStart(2, '0')} ${nextArc.name}</span>
              <span>→</span>
            </button>
          </div>

          <!-- Seletor Rápido Numérico de Arquétipo -->
          <div class="flex items-center gap-2 text-xs font-mono text-white/60">
            <span>IR PARA:</span>
            <select id="quick-archetype-select" class="bg-[#030406] border border-white/20 text-white px-2 py-1 text-xs font-mono outline-none cursor-pointer">
              ${ARCHETYPES_DATA.map(a => `
                <option value="${a.id}" ${a.id === arc.id ? 'selected' : ''}>
                  #${String(a.id).padStart(2, '0')} — ${a.name} (${a.e1Name} + ${a.e2Name})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Ações Táticas: Equipar na Ficha & Copiar Regras -->
          <div class="flex items-center gap-3 w-full md:w-auto justify-end">
            <button id="dossier-transmit-btn" class="px-4 py-2 bg-[#06b6d4] hover:bg-[#22d3ee] text-black font-mono font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)]" data-id="${arc.id}">
              <span>✠</span>
              <span>[ TRANSMITIR À FICHA ]</span>
            </button>

            <button id="dossier-copy-btn" class="px-4 py-2 bg-[#181d2a] hover:bg-[#e21b23] text-white hover:text-black border border-white/10 hover:border-[#e21b23] font-mono font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer" data-id="${arc.id}">
              <img src="${ICONS8.copy('FFFFFF', 12)}" class="w-3.5 h-3.5 object-contain" alt="" />
              <span>[ COPIAR DOSSIÊ ]</span>
            </button>
          </div>

        </div>

      </div>
    `;
  }

  // ============================================================
  // RENDERIZAÇÃO: MODO ARQUIVO COMPLETO (GRADE 45 AAA)
  // ============================================================
  renderArchiveView() {
    const filtered = this.getFilteredArchetypes();
    if (filtered.length === 0) {
      return this.renderEmptyState();
    }

    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-dossier-reveal">
        ${filtered.map(arc => this.renderArchiveCard(arc)).join('')}
      </div>
    `;
  }

  renderArchiveCard(arc) {
    const emo1 = EMOTIONS_DATA.find(e => e.id === arc.e1) || { color: '#e21b23', iconUrl: 'assets/images/Rancor.png' };
    const emo2 = EMOTIONS_DATA.find(e => e.id === arc.e2) || { color: '#06b6d4', iconUrl: 'assets/images/Vazio.png' };

    const showLvl1 = this.activeTabLevel === 'both' || this.activeTabLevel === 'lvl1';
    const showLvl2 = this.activeTabLevel === 'both' || this.activeTabLevel === 'lvl2';

    return `
      <article class="p-6 bg-[#07090e] border border-white/[0.08] hover:border-[#06b6d4]/50 transition-all flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.7)] group relative overflow-hidden">
        
        <div>
          <!-- Header do Cartão de Arquivo -->
          <div class="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4 mb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 bg-white/10 text-[10px] font-mono text-white/60 font-bold">
                  #${String(arc.id).padStart(2, '0')}
                </span>
                <span class="text-[10px] font-mono uppercase tracking-widest text-[#06b6d4] font-bold">
                  FUSÃO CANÔNICA
                </span>
              </div>
              
              <h2 class="text-2xl font-serif font-black text-white group-hover:text-[#06b6d4] transition-colors leading-tight">
                ${arc.name}
              </h2>

              <div class="flex items-center gap-2 text-xs font-mono">
                <span class="font-bold" style="color: ${emo1.color}">${arc.e1Name}</span>
                <span class="text-white/40 font-black">＋</span>
                <span class="font-bold" style="color: ${emo2.color}">${arc.e2Name}</span>
              </div>
            </div>

            <!-- Catalisadores de Emoção Centrais (Médios) -->
            <div class="flex items-center gap-2 bg-[#040508] p-2 border border-white/10 rounded-sm flex-shrink-0">
              <img src="${emo1.iconUrl}" class="w-8 h-8 object-contain filter drop-shadow-[0_0_6px_${emo1.color}]" title="${arc.e1Name}" alt="${arc.e1Name}" />
              <span class="text-xs text-white/40 font-black">⇄</span>
              <img src="${emo2.iconUrl}" class="w-8 h-8 object-contain filter drop-shadow-[0_0_6px_${emo2.color}]" title="${arc.e2Name}" alt="${arc.e2Name}" />
            </div>
          </div>

          <!-- Citação Conceitual -->
          <div class="border-l border-[#e21b23] pl-3 py-1 mb-4">
            <p class="text-xs font-liturgical italic text-[#cbd0dc] leading-relaxed">
              "${arc.quote}"
            </p>
          </div>

          <!-- Seção de Habilidades (Nível 1 & Nível 2) -->
          <div class="space-y-4 mb-4">
            
            <!-- Nível 1 -->
            ${showLvl1 ? `
              <div class="beacon-cyan-rail p-3.5 bg-[#090d16] border border-white/[0.05] space-y-2 text-xs">
                <div class="flex items-center justify-between gap-2 border-b border-[#06b6d4]/20 pb-1.5">
                  <span class="text-[11px] font-mono font-black text-[#06b6d4] uppercase tracking-wider">
                    ✦ NÍVEL 1 // DESPERTAR HÍBRIDO (ESTÁGIO II)
                  </span>
                  <span class="text-[10px] font-mono font-bold text-white px-2 py-0.5 bg-[#040508]">
                    ${arc.level1.activation}
                  </span>
                </div>

                <div class="text-[11px] font-mono text-white/50">
                  <span>${arc.level1.durationRange} | ${arc.level1.roll}</span>
                </div>

                <p class="text-white text-xs font-sans leading-relaxed">
                  <strong class="text-[#06b6d4] font-mono text-[10px] uppercase block mb-0.5">[ VETOR ATIVO ]:</strong>
                  ${arc.level1.effect}
                </p>

                <p class="text-[#94a3b8] text-xs font-sans leading-relaxed pt-1">
                  <strong class="text-white/40 font-mono text-[10px] uppercase block mb-0.5">[ NO INIMIGO ]:</strong>
                  ${arc.level1.enemy}
                </p>
              </div>
            ` : ''}

            <!-- Nível 2 -->
            ${showLvl2 ? `
              <div class="beacon-red-rail p-3.5 bg-[#0d0406] border border-white/[0.05] space-y-2 text-xs">
                <div class="flex items-center justify-between gap-2 border-b border-[#e21b23]/30 pb-1.5">
                  <span class="text-[11px] font-mono font-black text-[#ff333d] uppercase tracking-wider">
                    ✦ NÍVEL 2 // APOTEOSE (ESTÁGIO V)
                  </span>
                  <span class="text-[10px] font-mono font-bold text-white px-2 py-0.5 bg-[#040508]">
                    ${arc.level2.activation}
                  </span>
                </div>

                <div class="text-[11px] font-mono text-white/50">
                  <span>${arc.level2.durationRange} | ${arc.level2.roll}</span>
                </div>

                <p class="text-white text-xs font-sans font-medium leading-relaxed">
                  <strong class="text-[#ff333d] font-mono text-[10px] uppercase block mb-0.5">[ PODER MONUMENTAL ]:</strong>
                  ${arc.level2.extremePower}
                </p>

                <!-- Custo do Paroxismo -->
                <div class="paroxysm-hazard-banner p-2.5 mt-2 space-y-1">
                  <div class="flex items-center gap-1.5 text-[10px] font-mono font-black text-[#ff333d] uppercase">
                    <img src="${ICONS8.skull('FF333D', 12)}" class="w-3 h-3 object-contain" alt="" />
                    <span>⚠️ CUSTO DO PAROXISMO: ${arc.level2.penaltyName.toUpperCase()}</span>
                  </div>
                  <p class="text-[11px] font-serif text-[#fecaca] italic leading-relaxed">
                    ${arc.level2.penaltyDesc}
                  </p>
                </div>
              </div>
            ` : ''}

          </div>
        </div>

        <!-- Rodapé do Cartão com Ações -->
        <div class="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
          <button class="open-in-dossier-btn text-[#06b6d4] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-bold" data-id="${arc.id}">
            <span>✠</span>
            <span>ABRIR EM DOSSIÊ DE COMBATE</span>
          </button>

          <button class="copy-archetype-btn text-white/40 hover:text-[#e21b23] transition-colors flex items-center gap-1 cursor-pointer" data-id="${arc.id}">
            <img src="${ICONS8.copy('8E95A5', 12)}" class="w-3 h-3 object-contain" alt="" />
            <span>[ COPIAR ]</span>
          </button>
        </div>

      </article>
    `;
  }

  renderEmptyState() {
    return `
      <div class="p-16 text-center bg-[#07090e] border border-white/[0.08] space-y-4">
        <span class="text-4xl text-[#e21b23] block">✠</span>
        <h3 class="text-xl font-serif font-black text-white">Nenhum Arquétipo Localizado</h3>
        <p class="text-xs text-[#8e95a5] font-mono max-w-md mx-auto">
          Nenhuma fusão emocional corresponde aos parâmetros de busca e filtros selecionados. Tente ajustar os termos ou restaurar a sintonização total.
        </p>
        <button id="reset-filters-btn" class="px-4 py-2 bg-[#e21b23] hover:bg-[#ff333d] text-black font-mono font-bold text-xs transition-colors cursor-pointer">
          RESTAURAR TODOS OS 45 ARQUÉTIPOS
        </button>
      </div>
    `;
  }

  // ============================================================
  // EVENTOS E INTERATIVIDADE DIEGÉTICA
  // ============================================================
  setupEvents() {
    // Alternar painel de regras dos Capítulos 1 & 2
    const toggleBtn = document.getElementById('toggle-rules-btn');
    const rulesPanel = document.getElementById('archetypes-rules-panel');
    const toggleText = document.getElementById('toggle-rules-text');
    const toggleIcon = document.getElementById('toggle-rules-icon');

    toggleBtn?.addEventListener('click', () => {
      this.rulesOpen = !this.rulesOpen;
      soundFX.playRuneClick();
      if (rulesPanel) rulesPanel.classList.toggle('hidden', !this.rulesOpen);
      if (toggleText) toggleText.textContent = this.rulesOpen ? 'OCULTAR REGRAS DE FUSÃO' : 'GUIA DE CAMPO: REGRAS DE FUSÃO';
      if (toggleIcon) toggleIcon.textContent = this.rulesOpen ? '▲' : '▼';
    });

    // Campo de busca
    const searchInput = document.getElementById('archetype-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.updateStage();
    });

    const clearSearchBtn = document.getElementById('clear-search-btn');
    clearSearchBtn?.addEventListener('click', () => {
      this.searchQuery = "";
      if (searchInput) searchInput.value = "";
      this.updateStage();
    });

    // Reset de filtros caso caia em estado vazio
    document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
      soundFX.playRuneClick();
      this.searchQuery = "";
      this.selectedEmotion = "all";
      this.activeTabLevel = "both";
      this.render();
    });

    // Alternador de níveis (both, lvl1, lvl2)
    document.querySelectorAll('.level-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.activeTabLevel = btn.dataset.level;
        document.querySelectorAll('.level-tab-btn').forEach(b => {
          const isSelected = b.dataset.level === this.activeTabLevel;
          if (b.dataset.level === 'lvl2') {
            b.className = `level-tab-btn px-2.5 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${isSelected ? 'bg-[#e21b23] text-black font-black' : 'text-white/60 hover:text-white'}`;
          } else {
            b.className = `level-tab-btn px-2.5 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${isSelected ? 'bg-[#06b6d4] text-black font-black' : 'text-white/60 hover:text-white'}`;
          }
        });
        this.updateStage();
      });
    });

    // Alternador de modo de exibição (dossier / archive)
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.viewMode = btn.dataset.mode;
        document.querySelectorAll('.view-mode-btn').forEach(b => {
          b.className = `view-mode-btn px-3 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${b.dataset.mode === this.viewMode ? 'bg-[#e21b23] text-black font-black' : 'text-white/60 hover:text-white'}`;
        });
        this.updateStage();
      });
    });

    // Pílulas de filtro por emoção formadora
    document.querySelectorAll('.emotion-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.selectedEmotion = btn.dataset.emo;
        document.querySelectorAll('.emotion-filter-pill').forEach(b => {
          const isSelected = b.dataset.emo === this.selectedEmotion;
          if (b.dataset.emo === 'all') {
            b.className = `emotion-filter-pill px-3 py-1.5 text-[11px] font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${isSelected ? 'bg-white text-black border-white font-black shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'bg-[#090c14] border-white/10 text-[#8e95a5] hover:border-white/30 hover:text-white'}`;
          } else {
            b.className = `emotion-filter-pill px-2.5 py-1 text-[11px] font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${isSelected ? 'bg-[#121622] border-[#06b6d4] text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#090c14] border-white/10 text-[#8e95a5] hover:border-white/30 hover:text-white'}`;
          }
        });
        this.updateStage();
      });
    });

    this.bindStageEvents();
  }

  updateStage() {
    const stage = document.getElementById('archetypes-main-stage');
    const badge = document.getElementById('results-count-badge');
    if (!stage) return;

    const filtered = this.getFilteredArchetypes();
    if (badge) {
      badge.textContent = `${filtered.length} ARQUÉTIPO${filtered.length === 1 ? '' : 'S'} SINTONIZADO${filtered.length === 1 ? '' : 'S'}`;
    }

    if (filtered.length > 0 && !filtered.some(a => a.id === this.activeArchetypeId)) {
      this.activeArchetypeId = filtered[0].id;
    }

    stage.innerHTML = this.viewMode === 'dossier' ? this.renderDossierView() : this.renderArchiveView();
    this.bindStageEvents();
  }

  bindStageEvents() {
    // Botões de navegação anterior/próximo
    const prevBtn = document.getElementById('prev-archetype-btn');
    const nextBtn = document.getElementById('next-archetype-btn');

    prevBtn?.addEventListener('click', () => {
      soundFX.playRuneClick();
      this.activeArchetypeId = parseInt(prevBtn.dataset.id, 10);
      this.updateStage();
    });

    nextBtn?.addEventListener('click', () => {
      soundFX.playRuneClick();
      this.activeArchetypeId = parseInt(nextBtn.dataset.id, 10);
      this.updateStage();
    });

    // Seletor rápido de arquétipo
    const quickSelect = document.getElementById('quick-archetype-select');
    quickSelect?.addEventListener('change', (e) => {
      soundFX.playRuneClick();
      this.activeArchetypeId = parseInt(e.target.value, 10);
      this.updateStage();
    });

    // Botão de Transmitir à Ficha de Personagem (#ficha)
    const transmitBtn = document.getElementById('dossier-transmit-btn');
    transmitBtn?.addEventListener('click', () => {
      const arc = ARCHETYPES_DATA.find(a => a.id === parseInt(transmitBtn.dataset.id, 10));
      if (arc) {
        this.transmitToSheet(arc, transmitBtn);
      }
    });

    // Botão de Copiar Dossiê Completo
    const copyBtn = document.getElementById('dossier-copy-btn');
    copyBtn?.addEventListener('click', () => {
      const arc = ARCHETYPES_DATA.find(a => a.id === parseInt(copyBtn.dataset.id, 10));
      if (arc) {
        this.copyArchetypeText(arc, copyBtn);
      }
    });

    // Ações na grade: abrir em dossiê
    document.querySelectorAll('.open-in-dossier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.activeArchetypeId = parseInt(btn.dataset.id, 10);
        this.viewMode = 'dossier';
        document.querySelectorAll('.view-mode-btn').forEach(b => {
          b.className = `view-mode-btn px-3 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${b.dataset.mode === 'dossier' ? 'bg-[#e21b23] text-black font-black' : 'text-white/60 hover:text-white'}`;
        });
        this.updateStage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Ações na grade: copiar
    document.querySelectorAll('.copy-archetype-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const arc = ARCHETYPES_DATA.find(a => a.id === parseInt(btn.dataset.id, 10));
        if (arc) {
          this.copyArchetypeText(arc, btn);
        }
      });
    });
  }

  setupKeyboardNavigation() {
    if (this.keyboardBound) return;
    this.keyboardBound = true;

    window.addEventListener('keydown', (e) => {
      // Ignora se o usuário estiver digitando em um input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (this.viewMode !== 'dossier') return;

      const filtered = this.getFilteredArchetypes();
      if (filtered.length <= 1) return;

      const currentIndex = filtered.findIndex(a => a.id === this.activeArchetypeId);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        soundFX.playRuneClick();
        const prev = filtered[(currentIndex - 1 + filtered.length) % filtered.length];
        this.activeArchetypeId = prev.id;
        this.updateStage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        soundFX.playRuneClick();
        const next = filtered[(currentIndex + 1) % filtered.length];
        this.activeArchetypeId = next.id;
        this.updateStage();
      }
    });
  }

  // ============================================================
  // INTEGRAÇÃO: TRANSMITIR À FICHA DE PERSONAGEM (#ficha)
  // ============================================================
  getCharacterDossier() {
    try {
      const saved = localStorage.getItem('paroxismo_character_data_v1') || localStorage.getItem('paroxismo_character_dossier_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: "Agente Não Identificado",
      player: "Jogador",
      concept: "Sobrevivente do Metrô",
      level: 1,
      classId: "combate",
      originId: "forca-lei",
      primaryEmo: "rancor",
      secondaryEmo: "vazio",
      attributes: { agi: 2, for: 2, int: 1, pre: 1, vig: 2 },
      currentPv: 22,
      currentPe: 3,
      protectionId: "jaqueta",
      trainedSkills: ["luta", "atletismo", "vontade", "pontaria", "percepcao"],
      skillRanks: {},
      customWeapons: [],
      customRituals: []
    };
  }

  saveCharacterDossier(char) {
    const json = JSON.stringify(char);
    localStorage.setItem('paroxismo_character_data_v1', json);
    localStorage.setItem('paroxismo_character_dossier_v1', json);
  }

  transmitToSheet(arc, btnElement) {
    const char = this.getCharacterDossier();
    char.primaryEmo = arc.e1;
    char.secondaryEmo = arc.e2;
    char.archetypeId = arc.id;
    char.archetypeName = arc.name;
    this.saveCharacterDossier(char);

    soundFX.playDiceRoll();
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = `<span>✓</span><span>TRANSMITIDO COM SUCESSO!</span>`;
    btnElement.classList.remove('bg-[#06b6d4]', 'text-black');
    btnElement.classList.add('bg-white', 'text-black', 'font-black');

    setTimeout(() => {
      btnElement.innerHTML = originalText;
      btnElement.classList.remove('bg-white', 'text-black', 'font-black');
      btnElement.classList.add('bg-[#06b6d4]', 'text-black');
    }, 2500);
  }

  copyArchetypeText(arc, btnElement) {
    const text = `===========================================================
DOSSIÊ SECRETO ORDO LITÚRGICA // CODEX ARCH-${String(arc.id).padStart(2, '0')}
ARQUÉTIPO CANÔNICO: ${arc.name.toUpperCase()}
RESSONÂNCIA DUAL: ${arc.e1Name.toUpperCase()} (DOMINANTE) ＋ ${arc.e2Name.toUpperCase()} (LATENTE)
"${arc.quote}"
===========================================================

✦ NÍVEL 1 — O DESPERTAR HÍBRIDO (ESTÁGIO II — NÍVEL 4)
• Ativação: ${arc.level1.activation}
• Duração & Alcance: ${arc.level1.durationRange}
• Rolagem / Teste: ${arc.level1.roll}
• Vetor Ativo (Efeito): ${arc.level1.effect}
• Vetor Hostil (No Inimigo): ${arc.level1.enemy}

✦ NÍVEL 2 — A APOTEOSE DA FUSÃO (ESTÁGIO V — NÍVEL 16)
• Ativação: ${arc.level2.activation}
• Duração & Alcance: ${arc.level2.durationRange}
• Rolagem / Teste: ${arc.level2.roll}
• Cataclisma (Poder Monumental): ${arc.level2.extremePower}
• Condenação (Supressão do Inimigo): ${arc.level2.enemy}

⚠️ CUSTO DO PAROXISMO — ALERTA CRÍTICO: ${arc.level2.penaltyName.toUpperCase()}
${arc.level2.penaltyDesc}
===========================================================
`;

    navigator.clipboard.writeText(text).then(() => {
      soundFX.playDiceRoll();
      const originalText = btnElement.innerHTML;
      btnElement.innerHTML = `<span>COPIADO COM SUCESSO!</span>`;
    }).catch(() => {
      btnElement.innerHTML = `<span>ERRO AO COPIAR</span>`;
      setTimeout(() => {
        btnElement.innerHTML = originalText;
      }, 2000);
    });
  }
}
