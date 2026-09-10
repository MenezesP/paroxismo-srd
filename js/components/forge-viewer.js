/**
 * PAROXISMO - SRD COMPENDIUM
 * Componente: ForgeViewer (A Forja do Desperto — Estação de Engenharia Paranormal AAA)
 * Interface avançada inspirada em terminais militares, CAD de pesquisa oculta e interfaces como Destiny 2 e Control.
 * Suporta criação dinâmica em tempo real de Armas Convencionais & Manifestadas, Rituais Litúrgicos, Origens e Modificações,
 * com pré-visualização tática interativa e integração com a Ficha de Personagem (#ficha).
 */

import { FORGE_RULES } from '../data/forge-rules.js';
import { EMOTIONS_DATA } from '../data/emotions.js';
import { SKILLS_DATA } from '../data/skills-origins.js';
import { soundFX } from '../utils/sound-fx.js?v=sound_v2';
import { ICONS8 } from '../utils/icons8.js?v=icons8_v1';
import { ImageOptimizer } from '../utils/image-optimizer.js?v=img_v1';
import { showLiturgicalConfirm, showLiturgicalToast } from '../utils/liturgical-modal.js?v=modal_v1';

export class ForgeViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeSubTab = 'armas'; // 'armas', 'rituais', 'origens', 'mods', 'manual'
    this.weaponTypeMode = 'convencional'; // 'convencional' ou 'manifestada'
    this.currentWeaponImage = null;
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem('paroxismo_custom_forge')) {
      const initial = {
        weapons: [],
        rituals: [],
        origins: []
      };
      localStorage.setItem('paroxismo_custom_forge', JSON.stringify(initial));
    }
  }

  getCustomData() {
    try {
      return JSON.parse(localStorage.getItem('paroxismo_custom_forge')) || { weapons: [], rituals: [], origins: [] };
    } catch (e) {
      return { weapons: [], rituals: [], origins: [] };
    }
  }

  saveCustomData(data) {
    localStorage.setItem('paroxismo_custom_forge', JSON.stringify(data));
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="cad-workstation-container min-h-screen text-[#f3f4f6] font-sans pb-20 select-none animate-fadeIn">
        
        <!-- ============================================================ -->
        <!-- 1. BARRA DE TELEMETRIA OPERACIONAL & STATUS DO SISTEMA -->
        <!-- ============================================================ -->
        <div class="border-b border-white/[0.08] bg-[#030508]/90 backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono gap-4">
          
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]"></span>
              <span class="text-white font-bold tracking-wider">TERMINAL ORDO LITÚRGICA // SEC-07</span>
            </div>
            <span class="text-white/20 hidden sm:inline">|</span>
            <div class="text-[#8e95a5] flex items-center gap-1.5">
              <span>PROTOCOLO:</span>
              <span class="text-[#cbd0dc] font-bold">ORD-PAROXISMO-v4.9</span>
            </div>
            <span class="text-white/20 hidden sm:inline">|</span>
            <div class="text-[#8e95a5] flex items-center gap-1.5">
              <span>NÚCLEO TÉRMICO:</span>
              <span class="text-[#f59e0b] font-bold">1,420°K [ESTÁVEL]</span>
            </div>
          </div>

          <div class="flex items-center gap-4 flex-wrap">
            <div class="text-[#8e95a5] flex items-center gap-2">
              <span>RESSONÂNCIA ETÉREA:</span>
              <div class="w-16 h-2 bg-[#0a0d15] border border-white/10 rounded-xs overflow-hidden flex">
                <div class="w-[94%] bg-[#e21b23] shadow-[0_0_6px_#e21b23]"></div>
              </div>
              <span class="text-white font-bold text-[10px]">94.8%</span>
            </div>
            <span class="text-white/20 hidden sm:inline">|</span>
            <a href="#ficha" class="px-2.5 py-1 bg-[#10141f] hover:bg-[#e21b23] text-[#cbd0dc] hover:text-black border border-white/10 hover:border-[#e21b23] transition-all font-bold flex items-center gap-1.5 rounded-xs">
              <img src="${ICONS8.badge('CBD0DC', 12)}" class="w-3 h-3 object-contain" alt="" />
              <span>[ TRANSMITIR À FICHA ]</span>
            </a>
          </div>

        </div>

        <!-- ============================================================ -->
        <!-- 2. CABEÇALHO DA ESTAÇÃO & TÍTULO DIEGÉTICO -->
        <!-- ============================================================ -->
        <header class="px-6 py-6 border-b border-white/[0.06] relative overflow-hidden bg-gradient-to-b from-[#090d16]/70 to-transparent">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e21b23] font-black">
                  DIVISÃO DE BELIGERÂNCIA & PESQUISA ANÔMALA
                </span>
                <span class="text-[9px] font-mono px-1.5 py-0.5 bg-white/5 text-[#8e95a5] border border-white/10 rounded-xs">
                  ACESSO NÍVEL 4
                </span>
              </div>
              <h1 class="text-3xl sm:text-4xl font-serif font-black text-white tracking-wider flex items-center gap-3">
                <span>A FORJA DO DESPERTO</span>
              </h1>
              <p class="text-xs sm:text-sm text-[#8e95a5] font-serif italic mt-1.5 max-w-3xl leading-relaxed">
                "${FORGE_RULES.intro.desc}"
              </p>
            </div>

            <!-- Identificador de Registro -->
            <div class="font-mono text-right hidden lg:block text-[10px] text-[#8e95a5]">
              <div>ESTAÇÃO: CAD-FORGE-ESOTERIC</div>
              <div class="text-[#cbd0dc]">ARQUIVOS VIVOS: LOCAL_STORAGE</div>
              <div class="text-[#e21b23]">ENCRIPTADO // GRAU DE SEGURANÇA 7</div>
            </div>
          </div>

          <!-- ============================================================ -->
          <!-- 3. ABAS COMO CAPÍTULOS TÉCNICOS COM NUMERAIS ROMANOS & BARRA -->
          <!-- ============================================================ -->
          <div class="max-w-7xl mx-auto mt-6 pt-4 border-t border-white/[0.06]">
            <nav class="flex flex-wrap items-center gap-1 sm:gap-2">
              
              <button class="cad-chapter-tab ${this.activeSubTab === 'armas' ? 'active' : ''}" data-tab="armas">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono font-bold ${this.activeSubTab === 'armas' ? 'text-[#e21b23]' : 'text-[#8e95a5]'}">CAP. I</span>
                  <span class="text-xs font-serif font-black tracking-wide ${this.activeSubTab === 'armas' ? 'text-white' : 'text-[#cbd0dc]'}">FORJA BÉLICA</span>
                </div>
                <span class="text-[9px] font-mono text-[#8e95a5] tracking-wider uppercase">ARMAMENTOS & ALMAS</span>
              </button>

              <button class="cad-chapter-tab ${this.activeSubTab === 'rituais' ? 'active' : ''}" data-tab="rituais">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono font-bold ${this.activeSubTab === 'rituais' ? 'text-[#e21b23]' : 'text-[#8e95a5]'}">CAP. II</span>
                  <span class="text-xs font-serif font-black tracking-wide ${this.activeSubTab === 'rituais' ? 'text-white' : 'text-[#cbd0dc]'}">ATELIÊ RITUALÍSTICO</span>
                </div>
                <span class="text-[9px] font-mono text-[#8e95a5] tracking-wider uppercase">LITURGIAS & FEITIÇOS</span>
              </button>

              <button class="cad-chapter-tab ${this.activeSubTab === 'origens' ? 'active' : ''}" data-tab="origens">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono font-bold ${this.activeSubTab === 'origens' ? 'text-[#e21b23]' : 'text-[#8e95a5]'}">CAP. III</span>
                  <span class="text-xs font-serif font-black tracking-wide ${this.activeSubTab === 'origens' ? 'text-white' : 'text-[#cbd0dc]'}">BANCADA DE ORIGENS</span>
                </div>
                <span class="text-[9px] font-mono text-[#8e95a5] tracking-wider uppercase">DOSSIÊS PRÉ-ESTRONDO</span>
              </button>

              <button class="cad-chapter-tab ${this.activeSubTab === 'mods' ? 'active' : ''}" data-tab="mods">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono font-bold ${this.activeSubTab === 'mods' ? 'text-[#e21b23]' : 'text-[#8e95a5]'}">CAP. IV</span>
                  <span class="text-xs font-serif font-black tracking-wide ${this.activeSubTab === 'mods' ? 'text-white' : 'text-[#cbd0dc]'}">OFICINA TÁTICA</span>
                </div>
                <span class="text-[9px] font-mono text-[#8e95a5] tracking-wider uppercase">ACOPLAMENTOS & MODS</span>
              </button>

              <button class="cad-chapter-tab ${this.activeSubTab === 'manual' ? 'active' : ''}" data-tab="manual">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono font-bold ${this.activeSubTab === 'manual' ? 'text-[#e21b23]' : 'text-[#8e95a5]'}">CAP. V</span>
                  <span class="text-xs font-serif font-black tracking-wide ${this.activeSubTab === 'manual' ? 'text-white' : 'text-[#cbd0dc]'}">DIRETRIZES SRD</span>
                </div>
                <span class="text-[9px] font-mono text-[#8e95a5] tracking-wider uppercase">BALANÇO & PARÂMETROS</span>
              </button>

            </nav>
          </div>
        </header>

        <!-- ============================================================ -->
        <!-- 4. PALCO PRINCIPAL DO TERMINAL (MODULAR CAD STAGE) -->
        <!-- ============================================================ -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
          
          <div id="forge-workshop-content">
            <!-- Renderizado dinamicamente -->
          </div>

          <!-- ============================================================ -->
          <!-- 5. ACERVO LOCAL / COFRE DE CRIAÇÕES (VAULT) -->
          <!-- ============================================================ -->
          <div id="forge-vault-container">
            <!-- Renderizado dinamicamente -->
          </div>

        </main>

      </div>
    `;

    this.renderWorkshop();
    this.renderVault();
    this.setupEvents();
  }

  renderWorkshop() {
    const container = document.getElementById('forge-workshop-content');
    if (!container) return;

    switch (this.activeSubTab) {
      case 'armas':
        this.renderWeaponsWorkshop(container);
        break;
      case 'rituais':
        this.renderRitualsWorkshop(container);
        break;
      case 'origens':
        this.renderOriginsWorkshop(container);
        break;
      case 'mods':
        this.renderModsWorkshop(container);
        break;
      case 'manual':
        this.renderManualWorkshop(container);
        break;
    }
  }

  // ============================================================
  // CAPÍTULO I — FORJA BÉLICA (ARMAS CONVENCIONAIS & MANIFESTADAS)
  // ============================================================
  renderWeaponsWorkshop(container) {
    const isManifest = this.weaponTypeMode === 'manifestada';

    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- ============================================================ -->
        <!-- COLUNA ESQUERDA: CONSOLE CAD DE PARÂMETROS BÉLICOS (7 COLS) -->
        <!-- ============================================================ -->
        <div class="lg:col-span-7 cad-panel cad-panel-accent p-6 sm:p-7 space-y-6">
          <span class="cad-cross-tl">+</span>
          <span class="cad-cross-tr">+</span>
          <span class="cad-cross-bl">+</span>
          <span class="cad-cross-br">+</span>

          <!-- Cabeçalho do Módulo CAD -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-[#e21b23] font-bold">[ SEC-01 // ENGENHARIA BÉLICA ]</span>
                <span class="text-[9px] font-mono text-[#8e95a5]">PARAM_INPUT_ACTIVE</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-serif font-black text-white tracking-wide">
                ${isManifest ? 'Matriz da Arma Manifestada (Alma)' : 'Especificação de Armamento Convencional'}
              </h2>
            </div>

            <!-- Segmented Switch Tático -->
            <div class="cad-segmented-switch">
              <button id="weapon-mode-conv" class="cad-segmented-btn ${!isManifest ? 'active' : ''}">
                CONVENCIONAL
              </button>
              <button id="weapon-mode-manif" class="cad-segmented-btn ${isManifest ? 'active' : ''}">
                MANIFESTADA
              </button>
            </div>
          </div>

          <!-- CAMPOS DE ARMA CONVENCIONAL -->
          ${!isManifest ? `
            <div class="space-y-4 font-mono">
              
              <!-- Nome da Arma -->
              <div class="cad-field-group">
                <div class="flex items-center justify-between text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.01] // IDENTIFICAÇÃO DO MODELO (NOME)</span>
                  <span class="text-white/40">OBRIGATÓRIO</span>
                </div>
                <input type="text" id="w-name" placeholder="Ex.: Sabre de Monofilamento, Espingarda Autocarregável, Fuzil Silenciado..." class="cad-control w-full px-3.5 py-2.5 rounded-xs" />
              </div>

              <!-- Categoria & Empunhadura -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="cad-field-group">
                  <div class="flex items-center justify-between text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                    <span>[PARAM.02] // CATEGORIA DE TREINO</span>
                  </div>
                  <select id="w-category" class="cad-control w-full px-3 py-2.5 rounded-xs">
                    <option value="simples">Simples (Todas as Classes)</option>
                    <option value="tatica">Tática (Classes Marciais)</option>
                  </select>
                </div>

                <div class="cad-field-group">
                  <div class="flex items-center justify-between text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                    <span>[PARAM.03] // EMPUNHADURA & CARGA</span>
                  </div>
                  <select id="w-grip" class="cad-control w-full px-3 py-2.5 rounded-xs">
                    <option value="leve">Leve (1 Mão — 1 Espaço)</option>
                    <option value="media" selected>Média / Versátil (1 ou 2 Mãos — 2 Espaços)</option>
                    <option value="pesada">Pesada (2 Mãos Obrigatórias — 5 Espaços)</option>
                  </select>
                </div>
              </div>

              <!-- Dano, Crítico & Alcance -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="cad-field-group">
                  <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                    <span>[PARAM.04] // DANO BASE</span>
                  </div>
                  <select id="w-damage" class="cad-control w-full px-2.5 py-2 rounded-xs">
                    <option value="1d4 + FOR">1d4 + FOR (Leve)</option>
                    <option value="1d6 + FOR" selected>1d6 + FOR (Média)</option>
                    <option value="1d8">1d8 (Disparo Médio)</option>
                    <option value="1d10 + FOR">1d10 + FOR (Pesada)</option>
                    <option value="2d6 + FOR">2d6 + FOR (Pesada Brutal)</option>
                    <option value="2d8">2d8 (Fuzil Tático Pesado)</option>
                  </select>
                </div>

                <div class="cad-field-group">
                  <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                    <span>[PARAM.05] // MARGEM CRÍTICA</span>
                  </div>
                  <select id="w-crit" class="cad-control w-full px-2.5 py-2 rounded-xs">
                    <option value="20/x2">20/x2 (Padrão)</option>
                    <option value="19/x2" selected>19/x2 (Afiada)</option>
                    <option value="20/x3">20/x3 (Letal)</option>
                    <option value="19/x3">19/x3 (Pesada Superior)</option>
                  </select>
                </div>

                <div class="cad-field-group">
                  <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                    <span>[PARAM.06] // ALCANCE EFETIVO</span>
                  </div>
                  <select id="w-range" class="cad-control w-full px-2.5 py-2 rounded-xs">
                    <option value="Curto (corpo a corpo)" selected>Curto (Corpo a Corpo)</option>
                    <option value="Curto (corpo a corpo / 9m arremesso)">Curto (Arremessável 9m)</option>
                    <option value="Médio (18 metros)">Médio (18 metros)</option>
                    <option value="Longo (36 metros)">Longo (36 metros)</option>
                  </select>
                </div>
              </div>

              <!-- Propriedade Especial -->
              <div class="cad-field-group">
                <div class="flex items-center justify-between text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.07] // PROPRIEDADE ESPECIAL DE ENGENHARIA</span>
                  <span class="text-[#e21b23] text-[9px]">// ORÇAMENTO CONTROLADO</span>
                </div>
                <select id="w-prop" class="cad-control w-full px-3 py-2.5 rounded-xs">
                  <option value="nenhuma">Nenhuma (Armamento Padrão de Linha)</option>
                  <option value="Automática">Automática (Gasta 1 PE para rajada em 2 alvos adjacentes)</option>
                  <option value="Precisa">Precisa (+2 no teste de ataque ao gastar Movimento mirando)</option>
                  <option value="Alongada">Alongada (Permite golpear alvos até 3m de distância)</option>
                  <option value="Silenciada / Furtiva">Silenciada / Furtiva (Disparos da furtividade não revelam posição)</option>
                </select>
              </div>

              <!-- Descrição Técnica -->
              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.08] // ESPECIFICAÇÕES VISUAIS & MATERIAIS</span>
                </div>
                <textarea id="w-desc" rows="2" placeholder="Acabamento oxidado, empunhadura revestida em fita térmica, trilho picatinny tático..." class="cad-control w-full px-3 py-2 rounded-xs text-xs"></textarea>
              </div>

            </div>
          ` : `
            <!-- CAMPOS DE ARMA MANIFESTADA -->
            <div class="space-y-4 font-mono">
              
              <!-- Nome da Manifestação -->
              <div class="cad-field-group">
                <div class="flex items-center justify-between text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.01] // NOME DA ARMA DA ALMA</span>
                  <span class="text-[#e21b23]">FORJADA NO ABISMO</span>
                </div>
                <input type="text" id="wm-name" placeholder="Ex.: Lâmina do Rancor Insone, Ceifador de Vidro Negro, Pistola de Fumaça..." class="cad-control w-full px-3.5 py-2.5 rounded-xs" />
              </div>

              <!-- Emoção & Ataque Base -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="cad-field-group">
                  <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                    <span>[PARAM.02] // AFINIDADE DA ALMA (EMOÇÃO)</span>
                  </div>
                  <select id="wm-emotion" class="cad-control w-full px-3 py-2.5 rounded-xs">
                    ${EMOTIONS_DATA.map(e => `
                      <option value="${e.id}">${e.name} (${e.dmgType.split('/')[0].trim()})</option>
                    `).join('')}
                  </select>
                </div>

                <div class="cad-field-group">
                  <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                    <span>[PARAM.03] // VETOR DE IMPACTO (ATRIBUTO)</span>
                  </div>
                  <select id="wm-atk-base" class="cad-control w-full px-3 py-2.5 rounded-xs">
                    <option value="Luta (FOR)">Luta (FOR) — Corpo a Corpo</option>
                    <option value="Pontaria (AGI)">Pontaria (AGI) — Projéteis / Arremesso</option>
                  </select>
                </div>
              </div>

              <!-- Grau & Dano Base -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="cad-field-group">
                  <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                    <span>[PARAM.04] // GRAU DE EVOLUÇÃO ATUAL</span>
                  </div>
                  <select id="wm-grau" class="cad-control w-full px-3 py-2.5 rounded-xs">
                    <option value="1" selected>Grau 1 (Nível 1) — Dano padrão mágica</option>
                    <option value="2">Grau 2 (Nível 5) — +1 ataque e +1d6 elemental</option>
                    <option value="3">Grau 3 (Nível 10) — +2 ataque, +2d6 elemental, +1 margem</option>
                    <option value="4">Grau 4 (Nível 15) — +3 ataque, +3d8 elemental, Explosão</option>
                  </select>
                </div>

                <div class="cad-field-group">
                  <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                    <span>[PARAM.05] // ESTRUTURA FÍSICA BASE</span>
                  </div>
                  <select id="wm-damage" class="cad-control w-full px-3 py-2.5 rounded-xs">
                    <option value="1d8">1d8 (Uma Mão — Ágil)</option>
                    <option value="1d10">1d10 (Versátil — Híbrida)</option>
                    <option value="2d6">2d6 (Duas Mãos — Devastadora)</option>
                  </select>
                </div>
              </div>

              <!-- Forma Física -->
              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.06] // ANOMALIA VISUAL & FORMA MATERIAL</span>
                </div>
                <textarea id="wm-form" rows="2" placeholder="Lâmina negra que parece absorver luz ambiente, goteja líquido viscoso incandescente..." class="cad-control w-full px-3 py-2 rounded-xs text-xs"></textarea>
              </div>

            </div>
          `}

          <!-- ============================================================ -->
          <!-- UPLOAD CAD DE ILUSTRAÇÃO BÉLICA -->
          <!-- ============================================================ -->
          <div class="border border-white/[0.08] bg-[#05080e] p-4 rounded-xs space-y-3">
            <div class="flex items-center justify-between text-[10px] font-mono">
              <span class="text-[#8e95a5] uppercase font-bold flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#e21b23]"></span>
                <span>[DADOS FOTOGRÁFICOS] // ESQUEMA VISUAL DO ARMAMENTO</span>
              </span>
              <span class="text-[#e21b23] font-bold">COMPRESSÃO AUTOMÁTICA ATIVA</span>
            </div>

            <div class="flex items-center gap-4">
              <div id="forge-weapon-img-preview-box" class="w-20 h-20 bg-[#020408] border border-white/10 rounded-xs flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                ${this.currentWeaponImage ? `
                  <img src="${this.currentWeaponImage}" class="w-full h-full object-cover" alt="Esquema da Arma" />
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span class="text-[9px] font-mono text-white">CARREGADA</span>
                  </div>
                ` : `
                  <div class="text-center p-2">
                    <img src="${ICONS8.sword('8E95A5', 24)}" class="w-6 h-6 object-contain opacity-30 mx-auto" alt="" />
                    <span class="text-[8px] font-mono text-white/30 block mt-1">SEM IMAGEM</span>
                  </div>
                `}
              </div>

              <div class="flex flex-col gap-2 flex-1">
                <label class="px-4 py-2 bg-[#0c121e] hover:bg-[#162033] border border-white/10 hover:border-[#e21b23] text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer w-fit rounded-xs">
                  <img src="${ICONS8.save('CBD0DC', 12)}" class="w-3.5 h-3.5 object-contain" alt="" />
                  <span>[ CARREGAR ARQUIVO DE IMAGEM ]</span>
                  <input type="file" id="forge-weapon-img-input" accept="image/*" class="hidden" />
                </label>

                <div class="flex items-center gap-3">
                  ${this.currentWeaponImage ? `
                    <button type="button" id="forge-weapon-img-remove-btn" class="text-[10px] font-mono text-[#ff333d] hover:underline cursor-pointer">
                      ✕ Remover Imagem
                    </button>
                  ` : ''}
                  <span class="text-[10px] font-mono text-[#8e95a5]">A imagem será indexada ao dossiê de impressão e ao inventário tático.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- BOTÕES DE TRANSMISSÃO E GRAVAÇÃO -->
          <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.07]">
            <button id="forge-weapon-save-btn" class="px-5 py-3 bg-[#e21b23] hover:bg-[#ff333d] text-black font-mono font-black text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(226,27,35,0.4)] rounded-xs cursor-pointer">
              <img src="${ICONS8.save('000000', 14)}" class="w-4 h-4 object-contain" alt="" />
              <span>[ REGISTRAR NO ACERVO DA FORJA ]</span>
            </button>
            <button id="forge-weapon-equip-btn" class="px-5 py-3 bg-[#0d131f] hover:bg-[#162034] border border-white/15 hover:border-[#e21b23] text-white font-mono font-bold text-xs transition-all flex items-center gap-2 rounded-xs cursor-pointer">
              <img src="${ICONS8.sword('FFFFFF', 14)}" class="w-4 h-4 object-contain" alt="" />
              <span>[ EQUIPAR IMEDIATAMENTE NA FICHA ]</span>
            </button>
          </div>

        </div>

        <!-- ============================================================ -->
        <!-- COLUNA DIREITA: PRÉ-VISUALIZAÇÃO DINÂMICA RICA (5 COLS) -->
        <!-- ============================================================ -->
        <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          
          <!-- CARTÃO HOLOGRÁFICO TÁTICO DE INSPEÇÃO -->
          <div class="cad-panel p-5 sm:p-6 space-y-5 border-t-2 border-[#e21b23] relative">
            <span class="cad-cross-tl">+</span>
            <span class="cad-cross-tr">+</span>
            <span class="cad-cross-bl">+</span>
            <span class="cad-cross-br">+</span>

            <!-- Topo da Prévia com Telemetria e ID -->
            <div class="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#e21b23] animate-ping"></span>
                <span class="text-[10px] font-mono text-[#e21b23] font-black uppercase tracking-widest">
                  // TELEMETRIA DE INSPEÇÃO BÉLICA
                </span>
              </div>
              <span id="preview-weapon-serial" class="text-[10px] font-mono text-[#8e95a5]">
                REF: WPN-9942
              </span>
            </div>

            <!-- Visor da Arma (Imagem ou Blueprint) -->
            <div class="cad-preview-viewport h-44 rounded-xs flex items-center justify-center relative">
              <div class="cad-reticle"></div>
              
              <div id="preview-viewport-content" class="w-full h-full flex items-center justify-center overflow-hidden">
                ${this.currentWeaponImage ? `
                  <img src="${this.currentWeaponImage}" class="w-full h-full object-cover" alt="Esquema da Arma" />
                ` : `
                  <div class="text-center p-4 relative z-10">
                    <div class="w-12 h-12 mx-auto mb-2 border border-white/10 rounded-full flex items-center justify-center bg-white/[0.02]">
                      <img src="${ICONS8.sword('E21B23', 28)}" class="w-7 h-7 object-contain opacity-60" alt="" />
                    </div>
                    <span class="text-[10px] font-mono text-[#8e95a5] uppercase block tracking-wider">
                      PLANTA TÁTICA DIGITALIZADA
                    </span>
                    <span class="text-[9px] font-mono text-white/30 block">CAD-GRID 1:1 // TELEMETRIA PRONTA</span>
                  </div>
                `}
              </div>

              <!-- Tag de Categoria flutuante no visor -->
              <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#cbd0dc]">
                <span id="preview-tag-mode">${!isManifest ? 'ARMAMENTO CONVENCIONAL' : 'ARMA MANIFESTADA'}</span>
              </div>
            </div>

            <!-- Identificação Nominal da Arma -->
            <div>
              <h3 id="preview-weapon-name" class="text-2xl font-serif font-black text-white tracking-wide uppercase break-words leading-tight">
                NOME DO ARMAMENTO
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <span id="preview-weapon-cat" class="text-[11px] font-mono text-[#e21b23] font-bold">
                  SIMPLES (TODAS AS CLASSES)
                </span>
                <span class="text-white/20">•</span>
                <span id="preview-weapon-grip" class="text-[11px] font-mono text-[#8e95a5]">
                  MÉDIA (2 ESPAÇOS)
                </span>
              </div>
            </div>

            <!-- BARRAS DE ESTATÍSTICA TÁTICA EM TEMPO REAL -->
            <div class="space-y-3.5 pt-2 border-t border-white/[0.06] font-mono text-[11px]">
              
              <!-- Potencial de Dano -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[#8e95a5]">POTENCIAL DE DANO:</span>
                  <span id="preview-stat-dmg-val" class="text-white font-bold">1d6 + FOR</span>
                </div>
                <div class="cad-stat-track rounded-xs">
                  <div id="preview-stat-dmg-bar" class="cad-stat-fill" style="width: 50%;"></div>
                </div>
              </div>

              <!-- Margem Crítica -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[#8e95a5]">MARGEM DE CRÍTICO:</span>
                  <span id="preview-stat-crit-val" class="text-white font-bold">19/x2 (AFIADA)</span>
                </div>
                <div class="cad-stat-track rounded-xs">
                  <div id="preview-stat-crit-bar" class="cad-stat-fill bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" style="width: 65%;"></div>
                </div>
              </div>

              <!-- Vetor de Alcance -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[#8e95a5]">ALCANCE OPERACIONAL:</span>
                  <span id="preview-stat-range-val" class="text-white font-bold">CURTO</span>
                </div>
                <!-- 4 estágios de alcance -->
                <div class="grid grid-cols-4 gap-1">
                  <div id="preview-range-step-1" class="h-1.5 bg-[#e21b23] rounded-xs shadow-[0_0_4px_#e21b23]"></div>
                  <div id="preview-range-step-2" class="h-1.5 bg-white/10 rounded-xs"></div>
                  <div id="preview-range-step-3" class="h-1.5 bg-white/10 rounded-xs"></div>
                  <div id="preview-range-step-4" class="h-1.5 bg-white/10 rounded-xs"></div>
                </div>
              </div>

              <!-- Orçamento de Carga / Espaços no Inventário -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[#8e95a5]">CARGA NO INVENTÁRIO:</span>
                  <span id="preview-stat-slots-val" class="text-white font-bold">2 ESPAÇOS</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div id="preview-slot-1" class="h-2 flex-1 bg-[#e21b23] rounded-xs shadow-[0_0_4px_#e21b23]"></div>
                  <div id="preview-slot-2" class="h-2 flex-1 bg-[#e21b23] rounded-xs shadow-[0_0_4px_#e21b23]"></div>
                  <div id="preview-slot-3" class="h-2 flex-1 bg-white/10 rounded-xs"></div>
                  <div id="preview-slot-4" class="h-2 flex-1 bg-white/10 rounded-xs"></div>
                  <div id="preview-slot-5" class="h-2 flex-1 bg-white/10 rounded-xs"></div>
                </div>
              </div>

            </div>

            <!-- Efeito Especial ou Descrição Formatada -->
            <div id="preview-special-block" class="p-3 bg-[#05080e] border border-white/[0.06] rounded-xs font-mono text-[11px] space-y-1">
              <span class="text-[#e21b23] font-bold block text-[10px] uppercase">// RELATÓRIO DE CAMPO</span>
              <p id="preview-special-text" class="text-[#cbd0dc] leading-relaxed italic text-xs">
                Nenhuma modificação especial acoplada.
              </p>
            </div>

          </div>

          <!-- QUADRO DE DIRETRIZES RÁPIDAS DE BALANCEAMENTO -->
          <div class="cad-panel p-4 space-y-2.5 font-mono text-[11px] border border-white/[0.06]">
            <div class="flex items-center justify-between text-[#8e95a5] text-[10px] uppercase font-bold">
              <span>[REGRA DE OURO SRD]</span>
              <span class="text-[#e21b23]">CAPÍTULO 1</span>
            </div>
            <div class="text-[#cbd0dc] space-y-1.5 text-xs">
              <div class="flex items-start gap-2">
                <span class="text-[#e21b23]">▪</span>
                <span>Armas de 1 Espaço: Dano 1d4 a 1d6 (Ágeis e arremessáveis).</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-[#e21b23]">▪</span>
                <span>Armas de 2 Espaços: Dano 1d6 a 1d8 (Equilíbrio clássico).</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-[#e21b23]">▪</span>
                <span>Armas de 5 Espaços: Dano 1d10 a 2d8 (Devastadoras de 2 mãos).</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindWeaponPreviewEvents();
  }

  bindWeaponPreviewEvents() {
    const isManifest = this.weaponTypeMode === 'manifestada';

    const updatePreview = () => {
      if (!isManifest) {
        const nameVal = document.getElementById('w-name')?.value.trim() || 'NOME DO ARMAMENTO';
        const catVal = document.getElementById('w-category')?.value || 'simples';
        const gripVal = document.getElementById('w-grip')?.value || 'media';
        const dmgVal = document.getElementById('w-damage')?.value || '1d6 + FOR';
        const critVal = document.getElementById('w-crit')?.value || '19/x2';
        const rangeVal = document.getElementById('w-range')?.value || 'Curto (corpo a corpo)';
        const propVal = document.getElementById('w-prop')?.value || 'nenhuma';
        const descVal = document.getElementById('w-desc')?.value.trim() || '';

        // Título & Categoria
        const elName = document.getElementById('preview-weapon-name');
        if (elName) elName.textContent = nameVal;

        const elCat = document.getElementById('preview-weapon-cat');
        if (elCat) elCat.textContent = catVal === 'simples' ? 'SIMPLES (TODAS AS CLASSES)' : 'TÁTICA (CLASSES MARCIAIS)';

        const elGrip = document.getElementById('preview-weapon-grip');
        if (elGrip) {
          if (gripVal === 'leve') elGrip.textContent = 'LEVE (1 ESPAÇO)';
          else if (gripVal === 'pesada') elGrip.textContent = 'PESADA (5 ESPAÇOS)';
          else elGrip.textContent = 'MÉDIA / VERSÁTIL (2 ESPAÇOS)';
        }

        // Stats
        const elDmg = document.getElementById('preview-stat-dmg-val');
        if (elDmg) elDmg.textContent = dmgVal;

        const elDmgBar = document.getElementById('preview-stat-dmg-bar');
        if (elDmgBar) {
          let pct = 50;
          if (dmgVal.includes('1d4')) pct = 30;
          else if (dmgVal.includes('1d6')) pct = 50;
          else if (dmgVal.includes('1d8')) pct = 65;
          else if (dmgVal.includes('1d10')) pct = 80;
          else if (dmgVal.includes('2d6') || dmgVal.includes('2d8')) pct = 95;
          elDmgBar.style.width = `${pct}%`;
        }

        const elCrit = document.getElementById('preview-stat-crit-val');
        if (elCrit) elCrit.textContent = critVal;

        const elCritBar = document.getElementById('preview-stat-crit-bar');
        if (elCritBar) {
          let pct = 60;
          if (critVal.includes('19/x3')) pct = 95;
          else if (critVal.includes('20/x3') || critVal.includes('19/x2')) pct = 75;
          else pct = 45;
          elCritBar.style.width = `${pct}%`;
        }

        const elRange = document.getElementById('preview-stat-range-val');
        if (elRange) elRange.textContent = rangeVal.split('(')[0].trim().toUpperCase();

        // Range meter
        const r1 = document.getElementById('preview-range-step-1');
        const r2 = document.getElementById('preview-range-step-2');
        const r3 = document.getElementById('preview-range-step-3');
        const r4 = document.getElementById('preview-range-step-4');
        if (r1 && r2 && r3 && r4) {
          const activeClass = 'h-1.5 bg-[#e21b23] rounded-xs shadow-[0_0_4px_#e21b23]';
          const inactiveClass = 'h-1.5 bg-white/10 rounded-xs';
          r1.className = activeClass;
          r2.className = rangeVal.includes('Arremessável') || rangeVal.includes('Médio') || rangeVal.includes('Longo') ? activeClass : inactiveClass;
          r3.className = rangeVal.includes('Médio') || rangeVal.includes('Longo') ? activeClass : inactiveClass;
          r4.className = rangeVal.includes('Longo') ? activeClass : inactiveClass;
        }

        // Slots meter
        let slotsCount = 2;
        if (gripVal === 'leve') slotsCount = 1;
        if (gripVal === 'pesada') slotsCount = 5;

        const elSlotsVal = document.getElementById('preview-stat-slots-val');
        if (elSlotsVal) elSlotsVal.textContent = `${slotsCount} ESPAÇO${slotsCount > 1 ? 'S' : ''}`;

        for (let i = 1; i <= 5; i++) {
          const slotPip = document.getElementById(`preview-slot-${i}`);
          if (slotPip) {
            slotPip.className = i <= slotsCount 
              ? 'h-2 flex-1 bg-[#e21b23] rounded-xs shadow-[0_0_4px_#e21b23]' 
              : 'h-2 flex-1 bg-white/10 rounded-xs';
          }
        }

        // Special / Description
        const elSpecText = document.getElementById('preview-special-text');
        if (elSpecText) {
          if (propVal !== 'nenhuma') {
            elSpecText.innerHTML = `<strong class="text-white">[${propVal.toUpperCase()}]:</strong> ${descVal || 'Propriedade tática de engenharia.'}`;
          } else {
            elSpecText.textContent = descVal || 'Nenhum detalhe adicional inserido.';
          }
        }
      } else {
        // Manifested Weapon
        const nameVal = document.getElementById('wm-name')?.value.trim() || 'ARMA DA ALMA';
        const emoVal = document.getElementById('wm-emotion')?.value || 'rancor';
        const atkVal = document.getElementById('wm-atk-base')?.value || 'Luta (FOR)';
        const grauVal = parseInt(document.getElementById('wm-grau')?.value || '1', 10);
        const dmgVal = document.getElementById('wm-damage')?.value || '1d8';
        const formVal = document.getElementById('wm-form')?.value.trim() || '';

        const emoObj = EMOTIONS_DATA.find(e => e.id === emoVal) || EMOTIONS_DATA[0];

        const elName = document.getElementById('preview-weapon-name');
        if (elName) elName.textContent = nameVal;

        const elCat = document.getElementById('preview-weapon-cat');
        if (elCat) elCat.textContent = `MANIFESTADA // GRAU ${grauVal}`;

        const elGrip = document.getElementById('preview-weapon-grip');
        if (elGrip) elGrip.textContent = `EMOÇÃO: ${emoObj.name.toUpperCase()}`;

        const elDmg = document.getElementById('preview-stat-dmg-val');
        const bonusDmg = grauVal === 2 ? ' + 1d6 Elemental' : grauVal === 3 ? ' + 2d6 Elemental' : grauVal === 4 ? ' + 3d8 Elemental' : '';
        if (elDmg) elDmg.textContent = `${dmgVal}${bonusDmg}`;

        const elCrit = document.getElementById('preview-stat-crit-val');
        const critStr = grauVal >= 3 ? '19/x2' : '20/x2';
        if (elCrit) elCrit.textContent = `${critStr} ${grauVal === 4 ? '(EXPLOSÃO)' : ''}`;

        const elRange = document.getElementById('preview-stat-range-val');
        if (elRange) elRange.textContent = atkVal.includes('Pontaria') ? 'MÉDIO (18M)' : 'CURTO (CORPO A CORPO)';

        const elSpecText = document.getElementById('preview-special-text');
        if (elSpecText) {
          elSpecText.innerHTML = `
            <span class="text-[10px] text-[#e21b23] block">// FORMAÇÃO DA ALMA:</span>
            ${formVal || 'Materializada a partir das cicatrizes emocionais do hospedeiro.'}
          `;
        }
      }
    };

    // Eventos de escuta reativa em tempo real
    const fieldIds = ['w-name', 'w-category', 'w-grip', 'w-damage', 'w-crit', 'w-range', 'w-prop', 'w-desc', 'wm-name', 'wm-emotion', 'wm-atk-base', 'wm-grau', 'wm-damage', 'wm-form'];
    fieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updatePreview);
        el.addEventListener('change', updatePreview);
      }
    });

    updatePreview();
  }

  // ============================================================
  // CAPÍTULO II — ATELIÊ RITUALÍSTICO (LITURGIAS & FEITIÇOS)
  // ============================================================
  renderRitualsWorkshop(container) {
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- FORMULÁRIO CAD DE RITUAL (7 COLS) -->
        <div class="lg:col-span-7 cad-panel cad-panel-accent p-6 sm:p-7 space-y-6">
          <span class="cad-cross-tl">+</span>
          <span class="cad-cross-tr">+</span>
          <span class="cad-cross-bl">+</span>
          <span class="cad-cross-br">+</span>

          <div class="border-b border-white/[0.07] pb-4">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-[#e21b23] font-bold">[ SEC-02 // ATELIÊ LITÚRGICO ]</span>
              <span class="text-[9px] font-mono text-[#8e95a5]">RITUAL_FORGE_READY</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-serif font-black text-white tracking-wide">
              Composição de Ritual Litúrgico
            </h2>
            <p class="text-xs text-[#8e95a5] font-serif italic mt-1">
              "Estruture novas liturgias e fórmulas arcanas respeitando o limite e orçamento de Pontos de Esforço (PE)."
            </p>
          </div>

          <div class="space-y-4 font-mono">
            
            <!-- Nome do Ritual -->
            <div class="cad-field-group">
              <div class="flex items-center justify-between text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                <span>[PARAM.01] // TÍTULO DO RITUAL</span>
                <span class="text-[#e21b23]">OBRIGATÓRIO</span>
              </div>
              <input type="text" id="r-name" placeholder="Ex.: Chamas do Rancor Primal, Vórtice de Vidro Escuro, Pavor Incessante..." class="cad-control w-full px-3.5 py-2.5 rounded-xs" />
            </div>

            <!-- Emoção & Círculo -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.02] // MATRIZ EMOCIONAL FORMADORA</span>
                </div>
                <select id="r-emotion" class="cad-control w-full px-3 py-2.5 rounded-xs">
                  ${EMOTIONS_DATA.map(e => `
                    <option value="${e.id}">${e.name} (${e.dmgType.split('/')[0].trim()})</option>
                  `).join('')}
                </select>
              </div>

              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.03] // CÍRCULO ARCANO (ORÇAMENTO)</span>
                </div>
                <select id="r-circle" class="cad-control w-full px-3 py-2.5 rounded-xs">
                  <option value="1" selected>1º Círculo (1 PE • Nível 1 • 2d6 a 2d8)</option>
                  <option value="2">2º Círculo (3 PE • Nível 7 • 4d6 a 4d8)</option>
                  <option value="3">3º Círculo (6 PE • Nível 13 • 6d8 a 6d10)</option>
                  <option value="4">4º Círculo (10 PE • Nível 19 • 10d8 a 10d10)</option>
                </select>
              </div>
            </div>

            <!-- Execução, Alcance & Duração -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.04] // TEMPO DE CONJURAÇÃO</span>
                </div>
                <select id="r-exec" class="cad-control w-full px-2.5 py-2 rounded-xs">
                  <option value="Ação Padrão" selected>Ação Padrão</option>
                  <option value="Ação de Movimento">Ação de Movimento</option>
                  <option value="Reação">Reação</option>
                  <option value="Ação Livre">Ação Livre</option>
                </select>
              </div>

              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.05] // ALCANCE</span>
                </div>
                <select id="r-range" class="cad-control w-full px-2.5 py-2 rounded-xs">
                  <option value="Curto (9m)" selected>Curto (9 metros)</option>
                  <option value="Pessoal">Pessoal</option>
                  <option value="Toque">Toque</option>
                  <option value="Médio (18m)">Médio (18 metros)</option>
                  <option value="Longo (36m)">Longo (36 metros)</option>
                </select>
              </div>

              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.06] // DURAÇÃO</span>
                </div>
                <select id="r-duration" class="cad-control w-full px-2.5 py-2 rounded-xs">
                  <option value="Instantânea" selected>Instantânea</option>
                  <option value="1 Rodada">1 Rodada</option>
                  <option value="Cena">Cena</option>
                  <option value="Sustentada (Concentração)">Sustentada</option>
                </select>
              </div>
            </div>

            <!-- Resistência & Ampliação -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.07] // TESTE DE RESISTÊNCIA DO ALVO</span>
                </div>
                <select id="r-save" class="cad-control w-full px-3 py-2.5 rounded-xs">
                  <option value="Vontade (CD 10 + PRE/INT + Treino)" selected>Vontade (Mente / Pavor)</option>
                  <option value="Vigor (CD 10 + PRE/INT + Treino)">Vigor (Físico / Veneno / Necrose)</option>
                  <option value="Reflexos (CD 10 + PRE/INT + Treino)">Reflexos (Áreas / Explosões)</option>
                  <option value="Nenhuma">Nenhuma</option>
                </select>
              </div>

              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.08] // EFEITO DE AMPLIAÇÃO (+PE)</span>
                </div>
                <input type="text" id="r-amplification" placeholder="Ex.: +2 PE: aumenta o dano em +1d8 ou atinge +1 alvo adicional..." class="cad-control w-full px-3 py-2 rounded-xs text-xs" />
              </div>
            </div>

            <!-- Efeito Principal -->
            <div class="cad-field-group">
              <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                <span>[PARAM.09] // EFEITO MECÂNICO & CONDICIONAL LITÚRGICO</span>
              </div>
              <textarea id="r-effect" rows="3" placeholder="Descreva os danos causados, condições impostas (ex.: cego, em chamas, imobilizado) e manifestação visual..." class="cad-control w-full px-3 py-2 rounded-xs text-xs"></textarea>
            </div>

          </div>

          <!-- Botões de Ação -->
          <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.07]">
            <button id="forge-ritual-save-btn" class="px-5 py-3 bg-[#e21b23] hover:bg-[#ff333d] text-black font-mono font-black text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(226,27,35,0.4)] rounded-xs cursor-pointer">
              <img src="${ICONS8.save('000000', 14)}" class="w-4 h-4 object-contain" alt="" />
              <span>[ SALVAR RITUAL NO ATELIÊ ]</span>
            </button>
            <button id="forge-ritual-equip-btn" class="px-5 py-3 bg-[#0d131f] hover:bg-[#162034] border border-white/15 hover:border-[#e21b23] text-white font-mono font-bold text-xs transition-all flex items-center gap-2 rounded-xs cursor-pointer">
              <img src="${ICONS8.scroll('FFFFFF', 14)}" class="w-4 h-4 object-contain" alt="" />
              <span>[ GRAVAR DIRETO NO MEU GRIMÓRIO ]</span>
            </button>
          </div>

        </div>

        <!-- PRÉVIA DINÂMICA DO RITUAL & ORÇAMENTO (5 COLS) -->
        <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          
          <!-- CARTÃO TÁTICO LITÚRGICO -->
          <div class="cad-panel p-6 space-y-5 border-t-2 border-[#e21b23] relative">
            <span class="cad-cross-tl">+</span>
            <span class="cad-cross-tr">+</span>
            <span class="cad-cross-bl">+</span>
            <span class="cad-cross-br">+</span>

            <div class="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <span class="text-[10px] font-mono text-[#e21b23] font-black uppercase tracking-widest">
                // GRIMÓRIO DE OPERAÇÃO ESOTÉRICA
              </span>
              <span id="preview-ritual-cost" class="px-2 py-0.5 bg-[#e21b23] text-black font-mono font-black text-xs rounded-xs">
                1 PE
              </span>
            </div>

            <!-- Visualizador Arcano -->
            <div class="cad-preview-viewport p-5 rounded-xs flex items-center justify-between">
              <div>
                <span id="preview-ritual-circle-badge" class="text-[10px] font-mono text-[#8e95a5] block">CÍRCULO I</span>
                <h3 id="preview-ritual-name" class="text-xl font-serif font-black text-white tracking-wide">
                  TÍTULO DO RITUAL
                </h3>
                <span id="preview-ritual-emo-name" class="text-xs font-mono text-[#e21b23] font-bold">
                  EMOÇÃO: O RANCOR
                </span>
              </div>

              <div id="preview-ritual-emo-icon-box" class="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                <img src="${ICONS8.scroll('E21B23', 28)}" class="w-7 h-7 object-contain" alt="" />
              </div>
            </div>

            <!-- Dados Rápidos de Combate -->
            <div class="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div class="p-2.5 bg-[#05080e] border border-white/[0.06] rounded-xs">
                <span class="text-[#8e95a5] text-[10px] block">EXECUÇÃO:</span>
                <span id="preview-ritual-exec" class="text-white font-bold">Ação Padrão</span>
              </div>
              <div class="p-2.5 bg-[#05080e] border border-white/[0.06] rounded-xs">
                <span class="text-[#8e95a5] text-[10px] block">ALCANCE:</span>
                <span id="preview-ritual-range" class="text-white font-bold">Curto (9m)</span>
              </div>
              <div class="p-2.5 bg-[#05080e] border border-white/[0.06] rounded-xs">
                <span class="text-[#8e95a5] text-[10px] block">DURAÇÃO:</span>
                <span id="preview-ritual-duration" class="text-white font-bold">Instantânea</span>
              </div>
              <div class="p-2.5 bg-[#05080e] border border-white/[0.06] rounded-xs">
                <span class="text-[#8e95a5] text-[10px] block">RESISTÊNCIA:</span>
                <span id="preview-ritual-save" class="text-white font-bold">Vontade</span>
              </div>
            </div>

            <!-- Efeito Principal formatado -->
            <div class="p-3 bg-[#05080e] border border-white/[0.06] rounded-xs font-mono text-[11px] space-y-1">
              <span class="text-[#e21b23] font-bold text-[10px] block">// MANIFESTAÇÃO & DANO:</span>
              <p id="preview-ritual-effect" class="text-[#cbd0dc] leading-relaxed italic text-xs">
                Descreva os efeitos mecânicos e visuais no formulário ao lado.
              </p>
            </div>

            <!-- Ampliação -->
            <div id="preview-ritual-amp-box" class="p-3 bg-[#110507] border border-[#e21b23]/30 rounded-xs font-mono text-[11px]">
              <span class="text-[#e21b23] font-bold text-[10px] block uppercase">// AMPLIAÇÃO ARCANA:</span>
              <span id="preview-ritual-amp" class="text-[#f3f4f6] text-xs">Nenhum efeito de ampliação configurado.</span>
            </div>

          </div>

          <!-- TABELA MATEMÁTICA DE CÍRCULOS -->
          <div class="cad-panel p-4 space-y-3 font-mono text-[11px] border border-white/[0.06]">
            <span class="text-[10px] text-[#e21b23] font-bold uppercase block">// PARÂMETROS MATEMÁTICOS DE BALANCEAMENTO:</span>
            <div class="space-y-2">
              ${FORGE_RULES.rituals.circlesBudget.map(cb => `
                <div class="p-2 bg-[#05080e] border border-white/[0.05] flex items-center justify-between rounded-xs">
                  <div>
                    <strong class="text-white">${cb.name}</strong>
                    <span class="text-[#8e95a5] text-[10px] block">${cb.avgDamageHeal} • ${cb.targetArea}</span>
                  </div>
                  <span class="px-2 py-0.5 bg-white/5 border border-white/10 text-white font-bold text-xs rounded-xs">${cb.costPe} PE</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindRitualPreviewEvents();
  }

  bindRitualPreviewEvents() {
    const updatePreview = () => {
      const nameVal = document.getElementById('r-name')?.value.trim() || 'TÍTULO DO RITUAL';
      const emoVal = document.getElementById('r-emotion')?.value || 'rancor';
      const circleVal = parseInt(document.getElementById('r-circle')?.value || '1', 10);
      const execVal = document.getElementById('r-exec')?.value || 'Ação Padrão';
      const rangeVal = document.getElementById('r-range')?.value || 'Curto (9m)';
      const durVal = document.getElementById('r-duration')?.value || 'Instantânea';
      const saveVal = document.getElementById('r-save')?.value || 'Vontade';
      const ampVal = document.getElementById('r-amplification')?.value.trim() || '';
      const effectVal = document.getElementById('r-effect')?.value.trim() || '';

      const peCosts = [1, 3, 6, 10];
      const cost = peCosts[circleVal - 1] || 1;

      const emoObj = EMOTIONS_DATA.find(e => e.id === emoVal) || EMOTIONS_DATA[0];

      const elName = document.getElementById('preview-ritual-name');
      if (elName) elName.textContent = nameVal;

      const elCost = document.getElementById('preview-ritual-cost');
      if (elCost) elCost.textContent = `${cost} PE`;

      const elCircle = document.getElementById('preview-ritual-circle-badge');
      const romanCircles = ['I', 'II', 'III', 'IV'];
      if (elCircle) elCircle.textContent = `CÍRCULO ${romanCircles[circleVal - 1] || 'I'}`;

      const elEmo = document.getElementById('preview-ritual-emo-name');
      if (elEmo) elEmo.textContent = `EMOÇÃO: ${emoObj.name.toUpperCase()}`;

      const elExec = document.getElementById('preview-ritual-exec');
      if (elExec) elExec.textContent = execVal;

      const elRange = document.getElementById('preview-ritual-range');
      if (elRange) elRange.textContent = rangeVal;

      const elDur = document.getElementById('preview-ritual-duration');
      if (elDur) elDur.textContent = durVal;

      const elSave = document.getElementById('preview-ritual-save');
      if (elSave) elSave.textContent = saveVal.split('(')[0].trim();

      const elEffect = document.getElementById('preview-ritual-effect');
      if (elEffect) elEffect.textContent = effectVal || 'Descreva os efeitos mecânicos e visuais no formulário ao lado.';

      const elAmp = document.getElementById('preview-ritual-amp');
      if (elAmp) elAmp.textContent = ampVal || 'Nenhum efeito de ampliação configurado.';
    };

    ['r-name', 'r-emotion', 'r-circle', 'r-exec', 'r-range', 'r-duration', 'r-save', 'r-amplification', 'r-effect'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updatePreview);
        el.addEventListener('change', updatePreview);
      }
    });

    updatePreview();
  }

  // ============================================================
  // CAPÍTULO III — BANCADA DE ORIGENS PRÉ-ESTRONDO
  // ============================================================
  renderOriginsWorkshop(container) {
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- FORMULÁRIO (7 COLS) -->
        <div class="lg:col-span-7 cad-panel cad-panel-accent p-6 sm:p-7 space-y-6">
          <span class="cad-cross-tl">+</span>
          <span class="cad-cross-tr">+</span>
          <span class="cad-cross-bl">+</span>
          <span class="cad-cross-br">+</span>

          <div class="border-b border-white/[0.07] pb-4">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-[#e21b23] font-bold">[ SEC-03 // ARQUIVO BIOGRÁFICO ]</span>
              <span class="text-[9px] font-mono text-[#8e95a5]">ORIGIN_BUILDER_READY</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-serif font-black text-white tracking-wide">
              Bancada de Origens Pré-Estrondo
            </h2>
            <p class="text-xs text-[#8e95a5] font-serif italic mt-1">
              "Regra canônica de balanço: Toda Origem concede estritamente 2 Perícias Treinadas + 1 Poder Passivo ou de Baixo Custo."
            </p>
          </div>

          <div class="space-y-4 font-mono">
            
            <!-- Nome da Origem -->
            <div class="cad-field-group">
              <div class="flex items-center justify-between text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                <span>[PARAM.01] // PROFISSÃO OU OCUPAÇÃO PRÉ-ESTRONDO</span>
                <span class="text-[#e21b23]">OBRIGATÓRIO</span>
              </div>
              <input type="text" id="o-name" placeholder="Ex.: Engenheiro de Minas, Detetive Particular, Químico Forense, Parapsicólogo..." class="cad-control w-full px-3.5 py-2.5 rounded-xs" />
            </div>

            <!-- Passado -->
            <div class="cad-field-group">
              <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                <span>[PARAM.02] // HISTÓRICO & MEMÓRIA RESIDUAL</span>
              </div>
              <textarea id="o-desc" rows="2" placeholder="O que você fazia antes do mundo colapsar sob a loucura do Estrondo? Qual era sua rotina?" class="cad-control w-full px-3 py-2 rounded-xs text-xs"></textarea>
            </div>

            <!-- Perícias Treinadas -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.03] // 1ª PERÍCIA TREINADA</span>
                </div>
                <select id="o-skill-1" class="cad-control w-full px-3 py-2.5 rounded-xs">
                  ${SKILLS_DATA.map(s => `<option value="${s.id}">${s.name} (${s.attr})</option>`).join('')}
                </select>
              </div>

              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>[PARAM.04] // 2ª PERÍCIA TREINADA</span>
                </div>
                <select id="o-skill-2" class="cad-control w-full px-3 py-2.5 rounded-xs">
                  ${SKILLS_DATA.slice(2).concat(SKILLS_DATA.slice(0, 2)).map(s => `<option value="${s.id}">${s.name} (${s.attr})</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Poder da Origem -->
            <div class="p-4 bg-[#05080e] border border-white/[0.08] rounded-xs space-y-3">
              <div class="flex items-center justify-between text-[10px] uppercase font-bold">
                <span class="text-[#e21b23]">// PODER DE OFÍCIO (BALANÇO MATEMÁTICO)</span>
                <span class="text-[#8e95a5]">LIMITE: 1 HABILIDADE</span>
              </div>

              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>MODELO DE EQUILÍBRIO RECOMENDADO</span>
                </div>
                <select id="o-model" class="cad-control w-full px-3 py-2 rounded-xs text-xs">
                  ${FORGE_RULES.origins.models.map(m => `
                    <option value="${m.id}">${m.name} (${m.rule})</option>
                  `).join('')}
                </select>
              </div>

              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>NOME DO PODER</span>
                </div>
                <input type="text" id="o-power-name" placeholder="Ex.: Isolamento Térmico, Olho Clínico de Perito, Sobrevivente Urbano..." class="cad-control w-full px-3 py-2 rounded-xs text-xs" />
              </div>

              <div class="cad-field-group">
                <div class="text-[10px] text-[#8e95a5] uppercase font-bold mb-1">
                  <span>EFEITO MECÂNICO EXATO</span>
                </div>
                <textarea id="o-power-desc" rows="2" placeholder="Ex.: Concede +2 em testes de Percepção para encontrar pistas e não sofre penalidades em luz fraca..." class="cad-control w-full px-3 py-2 rounded-xs text-xs"></textarea>
              </div>
            </div>

          </div>

          <!-- Ações -->
          <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.07]">
            <button id="forge-origin-save-btn" class="px-5 py-3 bg-[#e21b23] hover:bg-[#ff333d] text-black font-mono font-black text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(226,27,35,0.4)] rounded-xs cursor-pointer">
              <img src="${ICONS8.save('000000', 14)}" class="w-4 h-4 object-contain" alt="" />
              <span>[ SALVAR ORIGEM NA BANCADA ]</span>
            </button>
            <button id="forge-origin-equip-btn" class="px-5 py-3 bg-[#0d131f] hover:bg-[#162034] border border-white/15 hover:border-[#e21b23] text-white font-mono font-bold text-xs transition-all flex items-center gap-2 rounded-xs cursor-pointer">
              <img src="${ICONS8.badge('FFFFFF', 14)}" class="w-4 h-4 object-contain" alt="" />
              <span>[ ATRIBUIR COMO MINHA ORIGEM NA FICHA ]</span>
            </button>
          </div>

        </div>

        <!-- PRÉVIA DO DOSSIÊ DE ORIGEM (5 COLS) -->
        <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          
          <div class="cad-panel p-6 space-y-5 border-t-2 border-[#e21b23] relative">
            <span class="cad-cross-tl">+</span>
            <span class="cad-cross-tr">+</span>
            <span class="cad-cross-bl">+</span>
            <span class="cad-cross-br">+</span>

            <div class="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <span class="text-[10px] font-mono text-[#e21b23] font-black uppercase tracking-widest">
                // ARQUIVO CONFIDENCIAL DESCLASSIFICADO
              </span>
              <span class="px-2 py-0.5 bg-white/10 text-[#cbd0dc] font-mono text-[10px] rounded-xs">
                DOSSIÊ CIVIL
              </span>
            </div>

            <div>
              <span class="text-[10px] font-mono text-[#8e95a5] block uppercase">IDENTIFICAÇÃO CIVIL PRÉ-ESTRONDO:</span>
              <h3 id="preview-origin-name" class="text-2xl font-serif font-black text-white tracking-wide uppercase">
                ORIGEM DO AGENTE
              </h3>
              <p id="preview-origin-desc" class="text-xs text-[#cbd0dc] font-serif italic mt-1 leading-relaxed">
                Nenhum histórico civil cadastrado.
              </p>
            </div>

            <!-- Perícias Treinadas em Destaque -->
            <div class="space-y-2 pt-2 border-t border-white/[0.06] font-mono text-xs">
              <span class="text-[10px] text-[#8e95a5] uppercase font-bold block">COMPETÊNCIAS PROFISSIONAIS TREINADAS (+2 / +5):</span>
              <div class="grid grid-cols-2 gap-2">
                <div class="p-2.5 bg-[#05080e] border border-white/[0.06] rounded-xs flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  <span id="preview-origin-skill-1" class="text-white font-bold">LUTA (FOR)</span>
                </div>
                <div class="p-2.5 bg-[#05080e] border border-white/[0.06] rounded-xs flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  <span id="preview-origin-skill-2" class="text-white font-bold">PERCEPÇÃO (PRE)</span>
                </div>
              </div>
            </div>

            <!-- Poder de Origem Formatado -->
            <div class="p-3.5 bg-[#05080e] border border-white/[0.06] rounded-xs font-mono text-xs space-y-1.5">
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-[#e21b23] font-bold uppercase">// HABILIDADE ESPECIAL DE ORIGEM:</span>
                <span id="preview-origin-model-tag" class="text-[#8e95a5]">ESPECIALISTA</span>
              </div>
              <strong id="preview-origin-power-name" class="text-white font-serif text-sm block">
                NOME DO PODER
              </strong>
              <p id="preview-origin-power-desc" class="text-[#cbd0dc] text-xs leading-relaxed italic">
                Descreva os bônus e efeitos concedidos ao lado.
              </p>
            </div>

          </div>

          <!-- EXEMPLOS CANÔNICOS -->
          <div class="cad-panel p-4 space-y-3 font-mono text-[11px] border border-white/[0.06]">
            <span class="text-[10px] text-[#e21b23] font-bold uppercase block">// EXEMPLOS DO LIVRO BÁSICO PARA CONSULTA:</span>
            <div class="space-y-2.5">
              ${FORGE_RULES.origins.canonicalExamples.map(ex => `
                <div class="p-2.5 bg-[#05080e] border border-white/[0.05] space-y-1 rounded-xs">
                  <div class="flex items-center justify-between">
                    <strong class="text-white font-serif text-xs">${ex.name}</strong>
                    <span class="text-[9px] text-[#e21b23]">${ex.skills.join(', ')}</span>
                  </div>
                  <p class="text-[#8e95a5] text-[10px] leading-relaxed"><strong class="text-[#cbd0dc]">${ex.powerName}:</strong> ${ex.powerDesc}</p>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindOriginPreviewEvents();
  }

  bindOriginPreviewEvents() {
    const updatePreview = () => {
      const nameVal = document.getElementById('o-name')?.value.trim() || 'ORIGEM DO AGENTE';
      const descVal = document.getElementById('o-desc')?.value.trim() || 'Nenhum histórico civil cadastrado.';
      const s1Val = document.getElementById('o-skill-1')?.value || 'luta';
      const s2Val = document.getElementById('o-skill-2')?.value || 'percepcao';
      const modelVal = document.getElementById('o-model')?.value || 'especialista';
      const pNameVal = document.getElementById('o-power-name')?.value.trim() || 'NOME DO PODER';
      const pDescVal = document.getElementById('o-power-desc')?.value.trim() || 'Descreva os bônus e efeitos concedidos ao lado.';

      const s1Obj = SKILLS_DATA.find(s => s.id === s1Val) || { name: s1Val, attr: 'FOR' };
      const s2Obj = SKILLS_DATA.find(s => s.id === s2Val) || { name: s2Val, attr: 'PRE' };

      const elName = document.getElementById('preview-origin-name');
      if (elName) elName.textContent = nameVal;

      const elDesc = document.getElementById('preview-origin-desc');
      if (elDesc) elDesc.textContent = `"${descVal}"`;

      const elS1 = document.getElementById('preview-origin-skill-1');
      if (elS1) elS1.textContent = `${s1Obj.name.toUpperCase()} (${s1Obj.attr})`;

      const elS2 = document.getElementById('preview-origin-skill-2');
      if (elS2) elS2.textContent = `${s2Obj.name.toUpperCase()} (${s2Obj.attr})`;

      const elModel = document.getElementById('preview-origin-model-tag');
      if (elModel) elModel.textContent = modelVal.toUpperCase();

      const elPName = document.getElementById('preview-origin-power-name');
      if (elPName) elPName.textContent = pNameVal;

      const elPDesc = document.getElementById('preview-origin-power-desc');
      if (elPDesc) elPDesc.textContent = pDescVal;
    };

    ['o-name', 'o-desc', 'o-skill-1', 'o-skill-2', 'o-model', 'o-power-name', 'o-power-desc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updatePreview);
        el.addEventListener('change', updatePreview);
      }
    });

    updatePreview();
  }

  // ============================================================
  // CAPÍTULO IV — OFICINA DE MODIFICAÇÕES TÁTICAS
  // ============================================================
  renderModsWorkshop(container) {
    container.innerHTML = `
      <div class="cad-panel cad-panel-accent p-6 sm:p-8 space-y-6">
        <span class="cad-cross-tl">+</span>
        <span class="cad-cross-tr">+</span>
        <span class="cad-cross-bl">+</span>
        <span class="cad-cross-br">+</span>

        <div class="border-b border-white/[0.07] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-[#e21b23] font-bold">[ SEC-04 // ACOPLAMENTOS BÉLICOS ]</span>
              <span class="text-[9px] font-mono text-[#8e95a5]">SOCKET_UPGRADE_READY</span>
            </div>
            <h2 class="text-2xl font-serif font-black text-white tracking-wide">
              Oficina de Modificações Táticas de Armas
            </h2>
            <p class="text-xs text-[#8e95a5] font-serif italic mt-1 max-w-2xl">
              "Personagens podem acoplar até 2 modificações em cada arma convencional. As modificações aprimoram atributos e concedem vantagens em combate."
            </p>
          </div>

          <div class="px-3 py-1.5 bg-[#05080e] border border-white/10 rounded-xs text-[11px] font-mono text-[#cbd0dc]">
            <span>LIMITE POR ARMA:</span>
            <strong class="text-[#e21b23] ml-1">MÁXIMO 2 MODS</strong>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${FORGE_RULES.modifications.map(mod => `
            <div class="cad-panel p-5 flex flex-col justify-between space-y-4 rounded-xs hover:border-[#e21b23] transition-all group">
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5 font-mono">
                  <span class="text-[9px] text-[#e21b23] font-bold uppercase tracking-wider">[ ACOPLAMENTO TÁTICO ]</span>
                  <span class="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 text-[#8e95a5] rounded-xs">${mod.compat}</span>
                </div>
                <h3 class="text-base font-serif font-black text-white group-hover:text-[#e21b23] transition-colors">${mod.name}</h3>
                <p class="text-xs text-[#cbd0dc] mt-2.5 leading-relaxed font-sans">${mod.effect}</p>
              </div>

              <button class="apply-mod-quick-btn w-full py-2.5 bg-[#0b101a] hover:bg-[#e21b23] text-white hover:text-black font-mono text-xs font-bold transition-all border border-white/10 hover:border-[#e21b23] rounded-xs cursor-pointer flex items-center justify-center gap-1.5" data-mod="${mod.name}">
                <img src="${ICONS8.gear('CBD0DC', 12)}" class="w-3 h-3 object-contain group-hover:invert" alt="" />
                <span>[ ACOPLAR EM ARMA DA FICHA ]</span>
              </button>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }

  // ============================================================
  // CAPÍTULO V — DIRETRIZES DO CONDUTOR & REGRAS DE OURO SRD
  // ============================================================
  renderManualWorkshop(container) {
    container.innerHTML = `
      <div class="cad-panel cad-panel-accent p-6 sm:p-8 space-y-8">
        <span class="cad-cross-tl">+</span>
        <span class="cad-cross-tr">+</span>
        <span class="cad-cross-bl">+</span>
        <span class="cad-cross-br">+</span>

        <div class="border-b border-white/[0.07] pb-4">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono text-[#e21b23] font-bold">[ SEC-05 // DIRETRIZES DO MESTRE ]</span>
            <span class="text-[9px] font-mono text-[#8e95a5]">SRD_BALANCE_GUIDE</span>
          </div>
          <h2 class="text-2xl font-serif font-black text-white tracking-wide">
            Manual Completo & O Papel do Condutor
          </h2>
          <p class="text-xs text-[#8e95a5] font-serif italic mt-1 max-w-3xl">
            "A liberdade e criatividade dos jogadores em Paroxismo são incentivadas ao máximo. Ao arbitrar novos conteúdos, o Condutor deve avaliar coerência, custo e impacto narrativo."
          </p>
        </div>

        <!-- 3 Regras de Ouro -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          ${FORGE_RULES.masterGuidelines.map((g, i) => `
            <div class="p-5 bg-[#05080e] border-l-2 border-l-[#e21b23] border border-white/[0.06] space-y-2.5 rounded-xs">
              <span class="text-[10px] font-mono text-[#e21b23] font-bold uppercase tracking-wider">REGRA DE OURO ${i + 1}</span>
              <h3 class="text-sm font-mono font-black text-white">${g.title}</h3>
              <p class="text-xs text-[#cbd0dc] leading-relaxed font-sans">${g.desc}</p>
            </div>
          `).join('')}
        </div>

        <!-- Tabela Comparativa de Armas Balanceadas -->
        <div class="space-y-3 font-mono text-xs">
          <span class="text-[11px] font-bold text-[#e21b23] uppercase tracking-wider block">// TABELA REFERENCIAL DE DANO POR CARGA (SRD)</span>
          <div class="overflow-x-auto">
            <table class="w-full border border-white/[0.08] text-left">
              <thead class="bg-[#030508] text-[10px] text-[#8e95a5] uppercase">
                <tr>
                  <th class="p-3 border-b border-white/[0.08]">Categoria</th>
                  <th class="p-3 border-b border-white/[0.08]">Tipo</th>
                  <th class="p-3 border-b border-white/[0.08]">Dano Base</th>
                  <th class="p-3 border-b border-white/[0.08]">Margem Crítica</th>
                  <th class="p-3 border-b border-white/[0.08]">Alcance</th>
                  <th class="p-3 border-b border-white/[0.08]">Espaços</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04] text-[11px]">
                ${FORGE_RULES.weapons.balancedTable.map(row => `
                  <tr class="hover:bg-white/[0.02]">
                    <td class="p-3 text-white font-bold">${row.category}</td>
                    <td class="p-3 text-[#cbd0dc]">${row.type}</td>
                    <td class="p-3 text-[#e21b23] font-bold">${row.baseDamage}</td>
                    <td class="p-3 text-[#f59e0b]">${row.critMargin} (${row.multiplier})</td>
                    <td class="p-3 text-[#8e95a5]">${row.range}</td>
                    <td class="p-3 text-white">${row.slots} Espaço${row.slots > 1 ? 's' : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // ============================================================
  // COFRE DO ACERVO PESSOAL FORJADO (LOCAL VAULT)
  // ============================================================
  renderVault() {
    const container = document.getElementById('forge-vault-container');
    if (!container) return;

    const data = this.getCustomData();
    const totalCount = data.weapons.length + data.rituals.length + data.origins.length;

    container.innerHTML = `
      <div class="cad-panel p-6 sm:p-7 space-y-6">
        <span class="cad-cross-tl">+</span>
        <span class="cad-cross-tr">+</span>
        <span class="cad-cross-bl">+</span>
        <span class="cad-cross-br">+</span>

        <div class="flex items-center justify-between border-b border-white/[0.07] pb-4">
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-mono text-[#e21b23] font-bold uppercase tracking-widest">[ ARQUIVO LOCAL ]</span>
            <h3 class="text-xl font-serif font-black text-white">Acervo Pessoal de Criações (${totalCount})</h3>
          </div>

          ${totalCount > 0 ? `
            <button id="clear-vault-btn" class="text-[11px] font-mono text-[#8e95a5] hover:text-[#e21b23] transition-colors cursor-pointer">
              [ Limpar Todo o Acervo ]
            </button>
          ` : ''}
        </div>

        ${totalCount === 0 ? `
          <div class="py-12 px-6 text-center bg-[#05080e] border border-white/[0.05] rounded-xs space-y-2">
            <img src="${ICONS8.anvil('8E95A5', 32)}" alt="" class="w-8 h-8 object-contain mx-auto opacity-40" />
            <p class="text-xs text-[#8e95a5] font-mono">Nenhum armamento, ritual ou origem customizada gravada nesta sessão.</p>
            <span class="text-[10px] font-mono text-white/30 block">Utilize os módulos acima para forjar e registrar novas patentes.</span>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            
            <!-- Armas Gravadas -->
            <div class="space-y-3">
              <div class="flex items-center justify-between text-[11px] border-b border-white/[0.08] pb-1.5">
                <span class="font-bold text-[#e21b23] uppercase">ARMAS FORJADAS (${data.weapons.length})</span>
              </div>
              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${data.weapons.length === 0 ? `
                  <span class="text-[10px] text-[#8e95a5] italic block">Nenhuma arma salva.</span>
                ` : data.weapons.map((w, idx) => `
                  <div class="p-3 bg-[#05080e] border border-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between rounded-xs group">
                    <div class="flex items-center gap-3">
                      ${w.imageUrl ? `
                        <img src="${w.imageUrl}" class="w-9 h-9 object-cover rounded-xs border border-white/10 flex-shrink-0" alt="" />
                      ` : `
                        <div class="w-9 h-9 bg-white/5 border border-white/10 rounded-xs flex items-center justify-center flex-shrink-0">
                          <img src="${ICONS8.sword('8E95A5', 16)}" class="w-4 h-4 object-contain opacity-40" alt="" />
                        </div>
                      `}
                      <div>
                        <strong class="text-white block font-serif text-xs">${w.name}</strong>
                        <span class="text-[10px] text-[#8e95a5] block">${w.dmgDice || w.damage} • ${w.range}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button class="equip-vault-weapon-btn text-[10px] font-mono text-[#cbd0dc] hover:text-[#e21b23] cursor-pointer" data-idx="${idx}" title="Equipar na Ficha">
                        [EQUIPAR]
                      </button>
                      <button class="delete-weapon-btn text-[#8e95a5] hover:text-[#e21b23] text-xs p-1 cursor-pointer" data-idx="${idx}" title="Apagar">✕</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Rituais Gravados -->
            <div class="space-y-3">
              <div class="flex items-center justify-between text-[11px] border-b border-white/[0.08] pb-1.5">
                <span class="font-bold text-[#06b6d4] uppercase">RITUAIS FORJADOS (${data.rituals.length})</span>
              </div>
              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${data.rituals.length === 0 ? `
                  <span class="text-[10px] text-[#8e95a5] italic block">Nenhum ritual salvo.</span>
                ` : data.rituals.map((r, idx) => `
                  <div class="p-3 bg-[#05080e] border border-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between rounded-xs">
                    <div>
                      <strong class="text-white block font-serif text-xs">${r.name}</strong>
                      <span class="text-[10px] text-[#8e95a5] block">${r.circle}º Círculo • ${r.peCost} PE</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button class="equip-vault-ritual-btn text-[10px] font-mono text-[#cbd0dc] hover:text-[#06b6d4] cursor-pointer" data-idx="${idx}" title="Gravar no Grimório">
                        [GRAVAR]
                      </button>
                      <button class="delete-ritual-btn text-[#8e95a5] hover:text-[#e21b23] text-xs p-1 cursor-pointer" data-idx="${idx}">✕</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Origens Gravadas -->
            <div class="space-y-3">
              <div class="flex items-center justify-between text-[11px] border-b border-white/[0.08] pb-1.5">
                <span class="font-bold text-[#fbbf24] uppercase">ORIGENS FORJADAS (${data.origins.length})</span>
              </div>
              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${data.origins.length === 0 ? `
                  <span class="text-[10px] text-[#8e95a5] italic block">Nenhuma origem salva.</span>
                ` : data.origins.map((o, idx) => `
                  <div class="p-3 bg-[#05080e] border border-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between rounded-xs">
                    <div>
                      <strong class="text-white block font-serif text-xs">${o.name}</strong>
                      <span class="text-[10px] text-[#8e95a5] block">${o.skills.join(', ')}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button class="equip-vault-origin-btn text-[10px] font-mono text-[#cbd0dc] hover:text-[#fbbf24] cursor-pointer" data-idx="${idx}" title="Atribuir na Ficha">
                        [ATRIBUIR]
                      </button>
                      <button class="delete-origin-btn text-[#8e95a5] hover:text-[#e21b23] text-xs p-1 cursor-pointer" data-idx="${idx}">✕</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>
        `}
      </div>
    `;

    // Eventos de Deleção e Re-equipamento
    document.querySelectorAll('.delete-weapon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        data.weapons.splice(idx, 1);
        this.saveCustomData(data);
        soundFX.playRuneClick();
        this.renderVault();
      });
    });

    document.querySelectorAll('.delete-ritual-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        data.rituals.splice(idx, 1);
        this.saveCustomData(data);
        soundFX.playRuneClick();
        this.renderVault();
      });
    });

    document.querySelectorAll('.delete-origin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        data.origins.splice(idx, 1);
        this.saveCustomData(data);
        soundFX.playRuneClick();
        this.renderVault();
      });
    });

    // Equipar a partir do Acervo
    document.querySelectorAll('.equip-vault-weapon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const wpn = data.weapons[idx];
        if (!wpn) return;
        const char = this.getCharacterDossier();
        char.customWeapons = char.customWeapons || [];
        char.customWeapons.push(wpn);
        this.saveCharacterDossier(char);
        soundFX.playDiceRoll();
        showLiturgicalToast({
          title: "BANCADA DA FORJA",
          subtitle: wpn.name,
          message: "Arma equipada na sua Ficha de Personagem!",
          type: "success"
        });
      });
    });

    document.querySelectorAll('.equip-vault-ritual-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const rit = data.rituals[idx];
        if (!rit) return;
        const char = this.getCharacterDossier();
        char.customRituals = char.customRituals || [];
        char.customRituals.push(rit);
        this.saveCharacterDossier(char);
        soundFX.playDiceRoll();
        showLiturgicalToast({
          title: "ATELIÊ DA FORJA",
          subtitle: rit.name,
          message: "Ritual gravado na sua Ficha de Personagem!",
          type: "success"
        });
      });
    });

    document.querySelectorAll('.equip-vault-origin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const orig = data.origins[idx];
        if (!orig) return;
        const char = this.getCharacterDossier();
        char.customOrigin = orig;
        char.originId = orig.id;
        char.origin = orig.id;
        char.trainedSkills = char.trainedSkills || [];
        orig.skills.forEach(s => {
          if (!char.trainedSkills.includes(s)) char.trainedSkills.push(s);
        });
        this.saveCharacterDossier(char);
        soundFX.playDiceRoll();
        showLiturgicalToast({
          title: "ARQUIVO DE IDENTIDADE",
          subtitle: orig.name,
          message: "Origem atribuída à sua Ficha!",
          type: "success"
        });
      });
    });

    document.getElementById('clear-vault-btn')?.addEventListener('click', () => {
      showLiturgicalConfirm({
        title: "EXPURGAR ACERVO",
        subtitle: "[ LIMPEZA TOTAL DA FORJA ]",
        message: "Tem certeza que deseja expurgar todos os armamentos, rituais e origens do seu acervo local?",
        confirmText: "EXPURGAR TUDO",
        cancelText: "CANCELAR",
        danger: true,
        onConfirm: () => {
          this.saveCustomData({ weapons: [], rituals: [], origins: [] });
          soundFX.playRuneClick();
          this.renderVault();
          showLiturgicalToast({
            title: "ACERVO EXPURGADO",
            message: "Todos os artefatos locais foram removidos.",
            type: "info"
          });
        }
      });
    });
  }

  // ============================================================
  // EVENTOS GERAIS DA ESTAÇÃO CAD
  // ============================================================
  setupEvents() {
    // 1. Alternador de Capítulos Técnicos
    document.querySelectorAll('.cad-chapter-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        this.activeSubTab = btn.dataset.tab;
        document.querySelectorAll('.cad-chapter-tab').forEach(b => {
          b.classList.toggle('active', b.dataset.tab === this.activeSubTab);
        });
        this.renderWorkshop();
        this.setupWorkshopSubEvents();
      });
    });

    this.setupWorkshopSubEvents();
  }

  setupWorkshopSubEvents() {
    // Alternador Convencional vs Manifestada
    const convBtn = document.getElementById('weapon-mode-conv');
    const manifBtn = document.getElementById('weapon-mode-manif');

    convBtn?.addEventListener('click', () => {
      soundFX.playRuneClick();
      this.weaponTypeMode = 'convencional';
      this.renderWorkshop();
      this.setupWorkshopSubEvents();
    });

    manifBtn?.addEventListener('click', () => {
      soundFX.playRuneClick();
      this.weaponTypeMode = 'manifestada';
      this.renderWorkshop();
      this.setupWorkshopSubEvents();
    });

    // Salvar / Equipar Arma
    document.getElementById('forge-weapon-save-btn')?.addEventListener('click', () => this.handleSaveWeapon(false));
    document.getElementById('forge-weapon-equip-btn')?.addEventListener('click', () => this.handleSaveWeapon(true));

    // Upload de Foto da Arma com Validação e Otimização
    const weaponImgInput = document.getElementById('forge-weapon-img-input');
    weaponImgInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        this.currentWeaponImage = await ImageOptimizer.optimizeWeaponImage(file);
        soundFX.playRuneClick();
        this.renderWorkshop();
        this.setupWorkshopSubEvents();
      } catch (err) {
        showLiturgicalToast({
          title: "ERRO DE IMAGEM",
          message: err.message || "Erro ao processar imagem da arma.",
          type: "error"
        });
      }
    });

    const removeImgBtn = document.getElementById('forge-weapon-img-remove-btn');
    removeImgBtn?.addEventListener('click', () => {
      this.currentWeaponImage = null;
      soundFX.playRuneClick();
      this.renderWorkshop();
      this.setupWorkshopSubEvents();
    });

    // Salvar / Gravar Ritual
    document.getElementById('forge-ritual-save-btn')?.addEventListener('click', () => this.handleSaveRitual(false));
    document.getElementById('forge-ritual-equip-btn')?.addEventListener('click', () => this.handleSaveRitual(true));

    // Salvar / Atribuir Origem
    document.getElementById('forge-origin-save-btn')?.addEventListener('click', () => this.handleSaveOrigin(false));
    document.getElementById('forge-origin-equip-btn')?.addEventListener('click', () => this.handleSaveOrigin(true));

    // Aplicar Modificação Rápida
    document.querySelectorAll('.apply-mod-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modName = btn.dataset.mod;
        this.applyModToCharacterSheet(modName);
      });
    });
  }

  // ============================================================
  // LOGICA DE EQUIPAR / INTEGRAR COM FICHA (#ficha)
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
      customWeapons: [
        { name: "Arma Manifestada (Grau 1)", type: "Manifestada", hitMod: "FOR", dmgDice: "1d8+FOR", crit: "19/x2", range: "Curto", mods: [] },
        { name: "Pistola 9mm Tática", type: "Fogo", hitMod: "AGI", dmgDice: "1d8", crit: "19/x2", range: "Médio", mods: [] }
      ],
      customRituals: []
    };
  }

  saveCharacterDossier(char) {
    const json = JSON.stringify(char);
    localStorage.setItem('paroxismo_character_data_v1', json);
    localStorage.setItem('paroxismo_character_dossier_v1', json);
  }

  handleSaveWeapon(equipInSheet) {
    const isManifest = this.weaponTypeMode === 'manifestada';
    let weaponObj = null;

    if (!isManifest) {
      const name = document.getElementById('w-name')?.value.trim() || "Arma Customizada";
      const category = document.getElementById('w-category')?.value || "simples";
      const grip = document.getElementById('w-grip')?.value || "media";
      const dmg = document.getElementById('w-damage')?.value || "1d6 + FOR";
      const crit = document.getElementById('w-crit')?.value || "19/x2";
      const range = document.getElementById('w-range')?.value || "Curto";
      const prop = document.getElementById('w-prop')?.value || "nenhuma";
      const desc = document.getElementById('w-desc')?.value.trim() || "";

      weaponObj = {
        id: 'cust-wpn-' + Date.now(),
        name,
        type: category === 'simples' ? 'Branca' : 'Tática',
        dmgDice: dmg,
        crit,
        range,
        hitMod: dmg.includes('FOR') ? 'for' : 'agi',
        special: prop !== 'nenhuma' ? prop : desc,
        grip,
        imageUrl: this.currentWeaponImage || null
      };
    } else {
      const name = document.getElementById('wm-name')?.value.trim() || "Arma da Alma";
      const emo = document.getElementById('wm-emotion')?.value || "rancor";
      const atkBase = document.getElementById('wm-atk-base')?.value || "Luta (FOR)";
      const grau = parseInt(document.getElementById('wm-grau')?.value || "1", 10);
      const baseDmg = document.getElementById('wm-damage')?.value || "1d8";
      const form = document.getElementById('wm-form')?.value.trim() || "";

      const grauBonuses = [
        { hit: 0, dmg: "", crit: "20/x2" },
        { hit: 1, dmg: " + 1d6 Elemental", crit: "20/x2" },
        { hit: 2, dmg: " + 2d6 Elemental", crit: "19/x2" },
        { hit: 3, dmg: " + 3d8 Elemental", crit: "19/x2 (Explosão)" }
      ];
      const g = grauBonuses[grau - 1] || grauBonuses[0];

      weaponObj = {
        id: 'manif-wpn-' + Date.now(),
        name,
        type: 'Manifestada (Grau ' + grau + ')',
        dmgDice: baseDmg + g.dmg,
        crit: g.crit,
        range: atkBase.includes('Pontaria') ? 'Médio (18m)' : 'Curto (corpo a corpo)',
        hitMod: atkBase.includes('FOR') ? 'for' : 'agi',
        special: `Emoção: ${emo.toUpperCase()} • ${form || 'Arma forjada pela essência da alma'}`,
        imageUrl: this.currentWeaponImage || null
      };
    }

    const forgeData = this.getCustomData();
    forgeData.weapons.push(weaponObj);
    this.saveCustomData(forgeData);

    if (equipInSheet) {
      const char = this.getCharacterDossier();
      char.customWeapons = char.customWeapons || [];
      char.customWeapons.push(weaponObj);
      this.saveCharacterDossier(char);
      soundFX.playDiceRoll();
      showLiturgicalToast({
        title: "BANCADA DA FORJA",
        subtitle: weaponObj.name,
        message: "Arma salva na Forja e EQUIPADA na sua Ficha de Personagem!",
        type: "success"
      });
    } else {
      soundFX.playRuneClick();
      showLiturgicalToast({
        title: "BANCADA DA FORJA",
        subtitle: weaponObj.name,
        message: "Arma salva com sucesso no seu Acervo da Forja!",
        type: "success"
      });
    }

    this.currentWeaponImage = null;
    this.renderWorkshop();
    this.setupWorkshopSubEvents();
    this.renderVault();
  }

  handleSaveRitual(equipInSheet) {
    const name = document.getElementById('r-name')?.value.trim() || "Ritual Customizado";
    const emotion = document.getElementById('r-emotion')?.value || "rancor";
    const circle = parseInt(document.getElementById('r-circle')?.value || "1", 10);
    const execution = document.getElementById('r-exec')?.value || "Ação Padrão";
    const range = document.getElementById('r-range')?.value || "Curto (9m)";
    const duration = document.getElementById('r-duration')?.value || "Instantânea";
    const save = document.getElementById('r-save')?.value || "Vontade";
    const amplification = document.getElementById('r-amplification')?.value.trim() || "";
    const effect = document.getElementById('r-effect')?.value.trim() || "Efeito ritualístico personalizado.";

    const peCosts = [1, 3, 6, 10];
    const peCost = peCosts[circle - 1] || 1;

    const ritualObj = {
      id: 'cust-rit-' + Date.now(),
      name,
      emotion,
      circle,
      peCost,
      execution,
      range,
      duration,
      save,
      amplification,
      effect
    };

    const forgeData = this.getCustomData();
    forgeData.rituals.push(ritualObj);
    this.saveCustomData(forgeData);

    if (equipInSheet) {
      const char = this.getCharacterDossier();
      char.customRituals = char.customRituals || [];
      char.customRituals.push(ritualObj);
      this.saveCharacterDossier(char);
      soundFX.playDiceRoll();
      showLiturgicalToast({
        title: "ATELIÊ DA FORJA",
        subtitle: ritualObj.name,
        message: "Ritual salvo e GRAVADO na sua Ficha de Personagem!",
        type: "success"
      });
    } else {
      soundFX.playRuneClick();
      showLiturgicalToast({
        title: "ATELIÊ DA FORJA",
        subtitle: ritualObj.name,
        message: "Ritual salvo no Ateliê da Forja!",
        type: "success"
      });
    }

    this.renderVault();
  }

  handleSaveOrigin(equipInSheet) {
    const name = document.getElementById('o-name')?.value.trim() || "Origem Customizada";
    const desc = document.getElementById('o-desc')?.value.trim() || "";
    const skill1 = document.getElementById('o-skill-1')?.value || "luta";
    const skill2 = document.getElementById('o-skill-2')?.value || "percepcao";
    const model = document.getElementById('o-model')?.value || "especialista";
    const powerName = document.getElementById('o-power-name')?.value.trim() || "Poder de Ofício";
    const powerDesc = document.getElementById('o-power-desc')?.value.trim() || "";

    const originObj = {
      id: 'cust-orig-' + Date.now(),
      name,
      desc,
      skills: [skill1, skill2],
      model,
      powerName,
      powerDesc
    };

    const forgeData = this.getCustomData();
    forgeData.origins.push(originObj);
    this.saveCustomData(forgeData);

    if (equipInSheet) {
      const char = this.getCharacterDossier();
      char.customOrigin = originObj;
      char.originId = originObj.id;
      char.origin = originObj.id;
      char.trainedSkills = char.trainedSkills || [];
      if (!char.trainedSkills.includes(skill1)) char.trainedSkills.push(skill1);
      if (!char.trainedSkills.includes(skill2)) char.trainedSkills.push(skill2);
      this.saveCharacterDossier(char);
      soundFX.playDiceRoll();
      showLiturgicalToast({
        title: "ARQUIVO DE IDENTIDADE",
        subtitle: originObj.name,
        message: `Origem atribuída à sua Ficha com as perícias ${skill1} e ${skill2}!`,
        type: "success"
      });
    } else {
      soundFX.playRuneClick();
      showLiturgicalToast({
        title: "ARQUIVO DE IDENTIDADE",
        subtitle: originObj.name,
        message: "Origem salva na Bancada da Forja!",
        type: "success"
      });
    }

    this.renderVault();
  }

  applyModToCharacterSheet(modName) {
    const char = this.getCharacterDossier();
    char.customWeapons = char.customWeapons || [];
    if (char.customWeapons.length === 0) {
      showLiturgicalToast({
        title: "MODIFICAÇÃO TÁTICA",
        message: "Você não possui armas na ficha ainda. Crie ou equipe uma arma na Forja primeiro!",
        type: "warning"
      });
      return;
    }

    const lastWpn = char.customWeapons[char.customWeapons.length - 1];
    lastWpn.mods = lastWpn.mods || [];
    if (lastWpn.mods.length >= 2) {
      showLiturgicalToast({
        title: "LIMITE ALCANÇADO",
        subtitle: lastWpn.name,
        message: "A arma já possui o limite máximo de 2 modificações táticas!",
        type: "warning"
      });
      return;
    }

    lastWpn.mods.push(modName);
    this.saveCharacterDossier(char);
    soundFX.playDiceRoll();
    showLiturgicalToast({
      title: "MODIFICAÇÃO INSTALADA",
      subtitle: lastWpn.name,
      message: `Modificação "${modName}" instalada com sucesso na arma "${lastWpn.name}" da sua ficha!`,
      type: "success"
    });
  }
}
