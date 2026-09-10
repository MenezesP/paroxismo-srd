/**
 * PAROXISMO - SRD COMPENDIUM
 * Componente: Dossiê de Agente Litúrgico — Ficha de Personagem AAA
 * Inspirações: Persona 5, Darkest Dungeon, Diablo IV, Monster Hunter Guild Card, Baldur's Gate
 * Estilo: Dossiê Militar Confidencial, Papel Rasgado, Selos Alquímicos, Barras Físicas e Cartas de Inventário
 */

import { CLASSES_DATA } from '../data/classes.js';
import { EMOTIONS_DATA, HYBRID_FUSIONS } from '../data/emotions.js';
import { SKILLS_DATA, ORIGINS_DATA } from '../data/skills-origins.js';
import { RULES_DATA } from '../data/rules.js';
import { soundFX } from '../utils/sound-fx.js?v=sound_v2';
import { SheetImageGenerator } from '../utils/sheet-image-generator.js?v=aaa_collector_v1';
import { ICONS8 } from '../utils/icons8.js?v=icons8_v1';
import { ImageOptimizer } from '../utils/image-optimizer.js?v=img_v1';
import { DiceAnimator } from '../utils/dice-animator.js?v=phys_v12';

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

const ICONS8_SHEET = {
  diceWhite: 'https://img.icons8.com/?id=6569&format=png&size=32&color=FFFFFF',
  diceRed: 'https://img.icons8.com/?id=6569&format=png&size=32&color=FF1E27',
  diceBlack: 'https://img.icons8.com/?id=6569&format=png&size=32&color=000000',
  sword: 'https://img.icons8.com/?id=5336&format=png&size=48&color=E21B23',
  firearm: 'https://img.icons8.com/?id=1304&format=png&size=48&color=E21B23',
  shield: 'https://img.icons8.com/?id=852&format=png&size=48&color=E21B23',
  skull: 'https://img.icons8.com/?id=4009&format=png&size=32&color=FF333D',
  lock: 'https://img.icons8.com/?id=94&format=png&size=32&color=8E95A5',
  book: 'https://img.icons8.com/?id=42763&format=png&size=32&color=8E95A5'
};

const SKILL_CATEGORIES = [
  { id: "Combate", tag: "CBT", desc: "Violência física, manobras letais e pontaria tática" },
  { id: "Investigação", tag: "INV", desc: "Percepção forense, tecnologia e raciocínio científico" },
  { id: "Social", tag: "SOC", desc: "Manipulação, liderança, coerção e diplomacia" },
  { id: "Física", tag: "FIS", desc: "Acrobacia, vigor motor, furtividade e condução" },
  { id: "Paranormal", tag: "PAR", desc: "Ocultismo, medicina de campo e força de vontade" }
];

export class CharacterSheet {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.storageKey = window.PAROXISMO_USER_ID 
      ? `paroxismo_character_${window.PAROXISMO_USER_ID}` 
      : "paroxismo_character_data_v1";
    this.character = this.loadCharacter();
    if (window.PAROXISMO_USER_NAME && (!this.character.player || this.character.player === "Jogador")) {
      this.character.player = window.PAROXISMO_USER_NAME;
    }
    this.init();
  }

  getDefaultCharacter() {
    return {
      name: "Agente Não Identificado",
      player: "Jogador",
      concept: "Sobrevivente do Metrô",
      level: 1,
      classId: "combate",
      originId: "forca-lei",
      primaryEmo: "rancor",
      secondaryEmo: "vazio",
      attributes: {
        agi: 2,
        for: 2,
        int: 1,
        pre: 1,
        vig: 2
      },
      currentPv: 22,
      currentPe: 3,
      protectionId: "jaqueta",
      trainedSkills: ["luta", "atletismo", "vontade", "pontaria", "percepcao"],
      skillRanks: {},
      customWeapons: [
        { id: "wpn-default-1", name: "Arma Manifestada (Grau 1)", type: "Manifestada", hitMod: "FOR", dmgDice: "1d8+FOR", crit: "19/x2", range: "Curto", grip: "media", mods: [] },
        { id: "wpn-default-2", name: "Pistola 9mm Tática", type: "Fogo", hitMod: "AGI", dmgDice: "1d8", crit: "19/x2", range: "Médio", grip: "leve", mods: [] }
      ],
      customRituals: [],
      conditions: [],
      customAvatar: null
    };
  }

  loadCharacter() {
    try {
      const saved = localStorage.getItem(this.storageKey) || localStorage.getItem('paroxismo_character_dossier_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...this.getDefaultCharacter(),
          ...parsed,
          customWeapons: parsed.customWeapons || this.getDefaultCharacter().customWeapons,
          customRituals: parsed.customRituals || [],
          customAvatar: parsed.customAvatar || null
        };
      }
    } catch (e) {
      console.warn("Erro ao carregar ficha:", e);
    }
    return this.getDefaultCharacter();
  }

  saveCharacter() {
    try {
      const json = JSON.stringify(this.character);
      localStorage.setItem(this.storageKey, json);
      localStorage.setItem('paroxismo_character_dossier_v1', json);
    } catch (e) {
      console.warn("Erro ao salvar ficha:", e);
    }
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  calculateStats() {
    const char = this.character;
    const cls = CLASSES_DATA.find(c => c.id === char.classId) || CLASSES_DATA[0];

    // Carrega origens customizadas criadas na Forja
    let customOrigins = [];
    try {
      const forgeData = JSON.parse(localStorage.getItem('paroxismo_custom_forge') || '{}');
      if (Array.isArray(forgeData.origins)) customOrigins = forgeData.origins;
    } catch (e) {}

    let orig = ORIGINS_DATA.find(o => o.id === char.originId) || customOrigins.find(o => o.id === char.originId);
    if (!orig) orig = ORIGINS_DATA[0];

    // Formata objeto de origem garantindo campos
    const origObj = {
      id: orig.id,
      name: orig.name,
      skills: orig.skills || [],
      model: orig.model || 'oficial',
      desc: orig.desc || '',
      power: orig.power || { name: orig.powerName || "Poder de Ofício", desc: orig.powerDesc || orig.desc || "" }
    };

    const prog = RULES_DATA.progressionTable.find(p => p.level === char.level) || RULES_DATA.progressionTable[0];

    let baseInitialPv = 20;
    let baseGainPv = 4;
    if (char.classId === 'combate') { baseInitialPv = 20; baseGainPv = 4; }
    else if (char.classId === 'flagelador') { baseInitialPv = 18; baseGainPv = 4; }
    else if (['investigador', 'tatico', 'infiltrador', 'duelista', 'receptaculo'].includes(char.classId)) { baseInitialPv = 16; baseGainPv = 3; }
    else if (char.classId === 'metamaturgo') { baseInitialPv = 14; baseGainPv = 3; }
    else if (['ocultista', 'liturgista'].includes(char.classId)) { baseInitialPv = 12; baseGainPv = 2; }

    const maxPv = (baseInitialPv + char.attributes.vig) + (char.level - 1) * (baseGainPv + char.attributes.vig);

    let baseInitialPe = 2;
    let baseGainPe = 1;
    if (char.classId === 'combate') { baseInitialPe = 2; baseGainPe = 1; }
    else if (char.classId === 'infiltrador') { baseInitialPe = 3; baseGainPe = 2; }
    else if (['investigador', 'tatico', 'metamaturgo', 'flagelador'].includes(char.classId)) { baseInitialPe = 4; baseGainPe = 2; }
    else if (['duelista', 'receptaculo'].includes(char.classId)) { baseInitialPe = 5; baseGainPe = 2; }
    else if (['ocultista', 'liturgista'].includes(char.classId)) { baseInitialPe = 6; baseGainPe = 3; }

    const maxPe = (baseInitialPe + char.attributes.pre) + (char.level - 1) * (baseGainPe + char.attributes.pre);

    let protBonus = 0;
    let protName = "Nenhuma";
    if (char.protectionId === 'jaqueta') { protBonus = 1; protName = "Jaqueta (+1)"; }
    else if (char.protectionId === 'colete_leve') { protBonus = 2; protName = "Colete Leve (+2)"; }
    else if (char.protectionId === 'colete_pesado') { protBonus = 5; protName = "Colete Pesado (+5)"; }

    let defense = 10 + char.attributes.agi + protBonus;
    if (char.classId === 'combate' && char.protectionId !== 'colete_pesado') {
      defense += char.attributes.vig;
    }

    let initiativeBonus = char.attributes.agi;
    if (char.originId === 'forca-lei') initiativeBonus += 2;

    const cargoCapacity = 5 + char.attributes.for;
    const trainingBonusVal = parseInt(prog.training.replace('+', '')) || 2;
    const conjAttr = Math.max(char.attributes.pre, char.attributes.int);
    const ritualDc = 10 + conjAttr + (char.trainedSkills.includes('ocultismo') ? trainingBonusVal : 0);

    const primaryEmoObj = EMOTIONS_DATA.find(e => e.id === char.primaryEmo) || EMOTIONS_DATA[0];
    const secondaryEmoObj = EMOTIONS_DATA.find(e => e.id === char.secondaryEmo) || EMOTIONS_DATA[1];

    const fusion = HYBRID_FUSIONS.find(f => 
      (f.e1 === char.primaryEmo && f.e2 === char.secondaryEmo) ||
      (f.e1 === char.secondaryEmo && f.e2 === char.primaryEmo)
    );

    return {
      maxPv,
      maxPe,
      peLimit: char.level,
      defense,
      protBonus,
      protName,
      initiativeBonus,
      cargoCapacity,
      trainingBonus: prog.training,
      trainingBonusVal,
      paroxismoPct: prog.paroxismo,
      ritualCircle: prog.ritualCircle,
      ritualDc,
      primaryEmoObj,
      secondaryEmoObj,
      fusion,
      cls,
      orig: origObj,
      customOrigins
    };
  }

  // Grande Gráfico Pentagonal Demoníaco inspirado na Home
  renderDemonicPentagram(attrs) {
    const size = 320;
    const center = size / 2;
    const maxRadius = 105;
    const maxVal = 5;

    const axisConfig = [
      { key: 'agi', label: 'AGI', full: 'Agilidade', angle: -90 },
      { key: 'for', label: 'FOR', full: 'Força', angle: -18 },
      { key: 'int', label: 'INT', full: 'Intelecto', angle: 54 },
      { key: 'pre', label: 'PRE', full: 'Presença', angle: 126 },
      { key: 'vig', label: 'VIG', full: 'Vigor', angle: 198 }
    ];

    // Círculos e teias concêntricas
    let concentricWeb = "";
    [0.2, 0.4, 0.6, 0.8, 1.0].forEach((ratio, idx) => {
      const r = maxRadius * ratio;
      const pts = axisConfig.map(a => {
        const rad = (a.angle * Math.PI) / 180;
        return `${center + r * Math.cos(rad)},${center + r * Math.sin(rad)}`;
      }).join(' ');
      const strokeCol = idx === 4 ? "#e21b23" : "#232b3d";
      const strokeWidth = idx === 4 ? "1.8" : "1";
      const strokeDash = idx % 2 === 0 ? "3,4" : "none";
      concentricWeb += `<polygon points="${pts}" fill="none" stroke="${strokeCol}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" opacity="${0.4 + idx * 0.15}"/>`;
    });

    // Espinhos e Eixos Cardinais
    let axesSvg = "";
    axisConfig.forEach(a => {
      const rad = (a.angle * Math.PI) / 180;
      const x2 = center + maxRadius * Math.cos(rad);
      const y2 = center + maxRadius * Math.sin(rad);
      const spikeX = center + (maxRadius + 14) * Math.cos(rad);
      const spikeY = center + (maxRadius + 14) * Math.sin(rad);
      const lx = center + (maxRadius + 28) * Math.cos(rad);
      const ly = center + (maxRadius + 28) * Math.sin(rad);

      axesSvg += `
        <line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="#e21b23" stroke-width="1.2" stroke-dasharray="2,3" opacity="0.6"/>
        <line x1="${x2}" y1="${y2}" x2="${spikeX}" y2="${spikeY}" stroke="#e21b23" stroke-width="2"/>
        <text x="${lx}" y="${ly}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" filter="drop-shadow(0 2px 4px #000)">
          ${a.label}
        </text>
      `;
    });

    // Polígono de Atributos do Personagem
    const polyPoints = axisConfig.map(a => {
      const val = Math.max(0, Math.min(maxVal, attrs[a.key] || 0));
      const r = (val / maxVal) * maxRadius;
      const rad = (a.angle * Math.PI) / 180;
      return `${center + r * Math.cos(rad)},${center + r * Math.sin(rad)}`;
    }).join(' ');

    return `
      <div class="relative w-[320px] h-[320px] mx-auto select-none">
        <svg viewBox="0 0 ${size} ${size}" class="w-full h-full pointer-events-none filter drop-shadow-[0_0_18px_rgba(226,27,35,0.4)]">
          <circle cx="${center}" cy="${center}" r="${maxRadius + 24}" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="4,8" opacity="0.2"/>
          <circle cx="${center}" cy="${center}" r="${maxRadius + 12}" fill="none" stroke="#e21b23" stroke-width="1" opacity="0.35"/>
          
          ${concentricWeb}
          ${axesSvg}

          <polygon points="${polyPoints}" fill="rgba(226, 27, 35, 0.35)" stroke="#e21b23" stroke-width="2.5" />

          ${axisConfig.map(a => {
            const val = Math.max(0, Math.min(maxVal, attrs[a.key] || 0));
            const r = (val / maxVal) * maxRadius;
            const rad = (a.angle * Math.PI) / 180;
            const vx = center + r * Math.cos(rad);
            const vy = center + r * Math.sin(rad);
            return `<circle cx="${vx}" cy="${vy}" r="4.5" fill="#ff1e27" stroke="#ffffff" stroke-width="1.5" />`;
          }).join('')}

          <circle cx="${center}" cy="${center}" r="22" fill="#06070a" stroke="#e21b23" stroke-width="2" filter="drop-shadow(0 0 8px rgba(226,27,35,0.8))"/>
          <text x="${center}" y="${center + 4}" font-family="'Cinzel', serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">AVESSO</text>
        </svg>
      </div>
    `;
  }

  rollDice(sides, bonus = 0, label = "Rolagem") {
    soundFX.playRuneClick();
    const roll = Math.floor(Math.random() * sides) + 1;
    const total = roll + bonus;
    const sign = bonus >= 0 ? `+${bonus}` : `${bonus}`;
    
    let isCrit = sides === 20 && roll === 20;
    let isFumble = sides === 20 && roll === 1;

    let message = `[${label.toUpperCase()}] — Total: ${total} (Dado d${sides}: ${roll} ${bonus !== 0 ? sign : '+0'})`;
    if (isCrit) message += " [ CRÍTICO NATURAL (20)! SUCESSO DEVASTADOR ]";
    if (isFumble) message += " [ FALHA CRÍTICA (1)! PAROXISMO INSTÁVEL ]";

    alert(message);
  }

  render() {
    const stats = this.calculateStats();
    const char = this.character;
    const heroImage = char.customAvatar || CLASS_IMAGES[char.classId] || 'assets/images/Combate.png';

    const totalPvCells = 20;
    const filledPvCells = Math.max(0, Math.min(totalPvCells, Math.round((char.currentPv / stats.maxPv) * totalPvCells)));

    const totalPeCells = Math.min(12, stats.maxPe);
    const filledPeCells = Math.max(0, Math.min(totalPeCells, char.currentPe));

    this.container.innerHTML = `
      <div class="max-w-[1460px] mx-auto space-y-8 pb-16 print:p-0">

        <!-- TOPO // BARRA DE CARIMBOS E AÇÕES MILITARES -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#232938] pb-4 print:hidden">
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 bg-[#10131d] border border-[#263047] text-[10px] font-mono font-bold text-[#e21b23] tracking-widest uppercase">
              CONFIDENCIAL // DEMIURGO
            </span>
            <span class="text-xs font-mono text-[#8e95a5]">
              ARQUIVO N° <strong>#PAR-${char.classId.toUpperCase().substring(0, 3)}-${String(char.level).padStart(2, '0')}</strong>
            </span>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <a href="#criacao" class="px-3 py-1.5 bg-[#e21b23]/10 hover:bg-[#e21b23] text-[#ff333d] hover:text-black border border-[#e21b23] font-mono font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer">
              <img src="${ICONS8.anvil('FF333D', 14)}" class="w-3.5 h-3.5 object-contain" alt="" />
              <span>A FORJA DE CRIAÇÃO</span>
            </a>
            <button id="export-sheet-btn" class="dossier-step-btn px-3 py-1.5 text-xs">
              [ EXPORTAR JSON ]
            </button>
            <label class="dossier-step-btn px-3 py-1.5 text-xs cursor-pointer">
              [ IMPORTAR JSON ]
              <input type="file" id="import-sheet-input" accept=".json" class="hidden" />
            </label>
            <button id="print-sheet-btn" class="px-3 py-1.5 bg-[#e21b23] hover:bg-white text-black font-mono font-bold text-xs transition-colors">
              [ IMPRIMIR DOSSIÊ ]
            </button>
            <button id="reset-sheet-btn" class="dossier-step-btn px-3 py-1.5 text-xs text-[#ff333d] hover:border-[#ff333d]">
              [ RESET ]
            </button>
          </div>
        </div>

        <!-- BLOCO 1 // CABEÇALHO DO DOSSIÊ (RETRATO, IDENTIDADE & FUSÃO) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          <!-- Retrato Fotográfico de Arquivo Militar -->
          <div class="lg:col-span-4 xl:col-span-3 space-y-3">
            <div class="dossier-photo-frame aspect-[3/4] w-full max-w-[280px] mx-auto lg:mx-0 group relative overflow-hidden">
              <div class="paper-clip-marker"></div>
              <div class="confidential-stamp">CLASSIFICADO</div>
              <img id="agent-portrait-img" src="${heroImage}" alt="${stats.cls.name}" class="w-full h-full object-cover object-top filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500" />
              
              <!-- Overlay Interativo de Upload de Retrato -->
              <label for="custom-avatar-input" class="absolute inset-0 bg-[#07090e]/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center gap-2 cursor-pointer z-20">
                <img src="${ICONS8.badge('E21B23', 28)}" class="w-7 h-7 object-contain" alt="" />
                <span class="text-xs font-mono font-black text-white uppercase">[ CARREGAR RETRATO ]</span>
                <span class="text-[10px] font-mono text-[#8e95a5]">Máx 5MB • Otimização Auto</span>
              </label>

              <input type="file" id="custom-avatar-input" accept="image/*" class="hidden" />

              <div class="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                <span class="text-xs font-serif font-black tracking-widest text-white uppercase drop-shadow-[0_2px_8px_#000]">
                  ${stats.cls.name}
                </span>
                <span class="text-[10px] font-mono text-[#e21b23] font-bold drop-shadow-[0_0_6px_#e21b23]">
                  NV ${char.level}
                </span>
              </div>
            </div>

            <!-- Botões Rápidos de Troca/Reset de Retrato -->
            <div class="flex items-center justify-between gap-2 px-1 text-[10px] font-mono">
              <label for="custom-avatar-input" class="text-[#cbd0dc] hover:text-[#e21b23] cursor-pointer flex items-center gap-1 transition-colors">
                <img src="${ICONS8.badge('E21B23', 12)}" class="w-3 h-3 object-contain" alt="" />
                <span>Alterar Foto</span>
              </label>
              ${char.customAvatar ? `
                <button id="reset-avatar-btn" class="text-[#8e95a5] hover:text-[#ff333d] cursor-pointer underline transition-colors">
                  [ Usar Imagem da Classe ]
                </button>
              ` : `
                <span class="text-[#64748b] text-[9px] uppercase">Retrato Oficial</span>
              `}
            </div>

            <!-- Dados do Arquétipo -->
            <div class="p-3 bg-[#06080d] border border-[#1a202d] text-center space-y-1">
              <span class="text-[9px] font-mono text-[#8e95a5] uppercase block font-bold">PAPEL TÁTICO:</span>
              <span class="text-xs font-serif font-bold text-white block">${stats.cls.tacticalRole}</span>
              <span class="text-[10px] font-liturgical italic text-[#8e95a5] block">${stats.cls.subtitle}</span>
            </div>
          </div>

          <!-- Campos de Identidade Datilografados & Emoções -->
          <div class="lg:col-span-8 xl:col-span-9 space-y-6">
            
            <!-- Nome Monumental do Agente -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono uppercase tracking-widest text-[#e21b23] font-bold">
                  // NOME DE REGISTRO DO AGENTE
                </span>
                <span class="text-[10px] font-mono text-[#8e95a5]">
                  NÍVEL ATUAL: <strong class="text-[#e21b23]">${char.level}</strong> • TREINAMENTO: <strong class="text-white">${stats.trainingBonus}</strong>
                </span>
              </div>
              <input type="text" id="char-name" value="${char.name}" 
                     class="dossier-typewriter-input w-full px-4 py-2.5 text-2xl sm:text-3xl text-white font-black tracking-wide" 
                     placeholder="Nome do Agente" />
            </div>

            <!-- Conceito & Jogador -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-mono uppercase text-[#8e95a5] font-bold mb-1">Conceito Pré-Estrondo</label>
                <input type="text" id="char-concept" value="${char.concept}" 
                       class="dossier-typewriter-input w-full px-3 py-2 text-xs text-white" 
                       placeholder="Ex: Detetive Forense, Médico de Guerra" />
              </div>
              <div>
                <label class="block text-[10px] font-mono uppercase text-[#8e95a5] font-bold mb-1">Condutor / Jogador</label>
                <input type="text" id="char-player" value="${char.player}" 
                       class="dossier-typewriter-input w-full px-3 py-2 text-xs text-white" 
                       placeholder="Nome do Jogador" />
              </div>
            </div>

            <!-- Seletores de Classe, Origem e Nível -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div class="p-3 bg-[#06080d] border border-[#1a202d] space-y-1">
                <span class="text-[9px] font-mono uppercase text-[#e21b23] font-bold block">1. CLASSE</span>
                <select id="char-class" class="dossier-meta-select w-full px-2 py-1 font-bold">
                  ${CLASSES_DATA.map(c => `
                    <option value="${c.id}" ${c.id === char.classId ? 'selected' : ''}>${c.name}</option>
                  `).join('')}
                </select>
              </div>

              <div class="p-3 bg-[#06080d] border border-[#1a202d] space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-mono uppercase text-[#e21b23] font-bold block">2. ORIGEM</span>
                  <a href="#criacao" class="text-[9px] font-mono text-[#8e95a5] hover:text-[#e21b23]">[ + FORJA ]</a>
                </div>
                <select id="char-origin" class="dossier-meta-select w-full px-2 py-1 font-bold">
                  <optgroup label="Origens Oficiais">
                    ${ORIGINS_DATA.map(o => `
                      <option value="${o.id}" ${o.id === char.originId ? 'selected' : ''}>${o.name}</option>
                    `).join('')}
                  </optgroup>
                  ${stats.customOrigins && stats.customOrigins.length > 0 ? `
                    <optgroup label="Origens Forjadas (Custom)">
                      ${stats.customOrigins.map(o => `
                        <option value="${o.id}" ${o.id === char.originId ? 'selected' : ''}>${o.name} [Forjada]</option>
                      `).join('')}
                    </optgroup>
                  ` : ''}
                </select>
              </div>

              <div class="p-3 bg-[#06080d] border border-[#1a202d] space-y-1">
                <span class="text-[9px] font-mono uppercase text-[#e21b23] font-bold block">3. PROGRESSÃO</span>
                <select id="char-level" class="dossier-meta-select w-full px-2 py-1 font-bold">
                  ${Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => `
                    <option value="${lvl}" ${lvl === char.level ? 'selected' : ''}>Nível ${lvl} (${RULES_DATA.progressionTable[lvl - 1]?.paroxismo} Paroxismo)</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Resumo da Origem Selecionada & Poder Pré-Estrondo -->
            <div class="p-3.5 bg-[#05060a] border-l-2 border-[#e21b23] border border-[#181f2f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-mono text-[#e21b23] font-bold uppercase tracking-wider">[ PODER: ${stats.orig.power.name} ]</span>
                  <span class="text-[9px] font-mono text-[#8e95a5]">PASSIVA</span>
                </div>
                <p class="text-[11px] text-[#cbd0dc] leading-relaxed font-sans">${stats.orig.power.desc}</p>
                <div class="flex items-center gap-2 pt-0.5">
                  <span class="text-[9px] font-mono text-[#8e95a5]">Perícias Nativas:</span>
                  ${stats.orig.skills.map(s => `<span class="px-1.5 py-0.2 bg-[#121824] border border-[#2b3952] text-[9px] font-mono text-[#ff333d] uppercase">${s}</span>`).join('')}
                </div>
              </div>
              <a href="#criacao" class="px-3 py-1.5 bg-[#0a0e16] hover:bg-[#e21b23] hover:text-black border border-[#252f44] text-[10px] font-mono text-white transition-all whitespace-nowrap self-start sm:self-center flex items-center gap-1.5">
                <img src="${ICONS8.badge('CBD0DC', 12)}" class="w-3 h-3 object-contain" alt="" />
                <span>[ BANCADA DE ORIGENS ]</span>
              </a>
            </div>

            <!-- As Duas Emoções & Banner da Fusão Híbrida -->
            <div class="p-4 bg-[#08090e] border border-[#232a3b] space-y-3">
              <div class="flex items-center justify-between border-b border-[#1b202c] pb-2">
                <span class="text-[10px] font-mono uppercase text-[#e21b23] font-black tracking-wider">
                  [ O DESPERTAR DUAL DAS EMOÇÕES ]
                </span>
                <span class="text-[9px] font-mono text-[#8e95a5]">200 RITUAIS COMPATÍVEIS</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Emoção Dominante -->
                <div class="flex items-center gap-3 p-2 bg-[#050609] border border-[#1a202d]">
                  <img src="${stats.primaryEmoObj.iconUrl}" class="w-10 h-10 object-contain filter drop-shadow-[0_0_10px_rgba(226,27,35,0.6)]" alt="${stats.primaryEmoObj.name}" />
                  <div class="flex-1 min-w-0">
                    <span class="text-[9px] font-mono text-[#e21b23] uppercase block font-bold">1ª DOMINANTE</span>
                    <select id="char-primary-emo" class="dossier-meta-select w-full py-0.5 text-xs font-bold">
                      ${EMOTIONS_DATA.map(e => `
                        <option value="${e.id}" ${e.id === char.primaryEmo ? 'selected' : ''}>${e.name}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>

                <!-- Emoção Latente -->
                <div class="flex items-center gap-3 p-2 bg-[#050609] border border-[#1a202d]">
                  <img src="${stats.secondaryEmoObj.iconUrl}" class="w-10 h-10 object-contain filter drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]" alt="${stats.secondaryEmoObj.name}" />
                  <div class="flex-1 min-w-0">
                    <span class="text-[9px] font-mono text-[#06b6d4] uppercase block font-bold">2ª LATENTE</span>
                    <select id="char-secondary-emo" class="dossier-meta-select w-full py-0.5 text-xs font-bold">
                      ${EMOTIONS_DATA.map(e => `
                        <option value="${e.id}" ${e.id === char.secondaryEmo ? 'selected' : ''}>${e.name}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>
              </div>

              <!-- Banner de Fusão Híbrida Resultante -->
              ${stats.fusion ? `
                <div class="p-3 bg-[#0d070a] border-l-2 border-[#e21b23] border-t border-r border-b border-[#24171a] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span class="text-[9px] font-mono text-[#e21b23] uppercase font-black block tracking-widest">
                      FUSÃO HÍBRIDA: ${stats.fusion.name.toUpperCase()}
                    </span>
                    <p class="text-xs font-liturgical italic text-[#cbd0dc] leading-tight mt-0.5">
                      "${stats.fusion.desc}"
                    </p>
                  </div>
                  <button onclick="window.ParoxismoApp.navigateTo('emocoes')" class="text-[10px] font-mono text-[#e21b23] hover:underline uppercase whitespace-nowrap font-bold">
                    [ VER MATRIZ → ]
                  </button>
                </div>
              ` : ''}

            </div>

          </div>

        </div>

        <!-- BLOCO 2 // MONÓLITO DOS ATRIBUTOS & MEDIDORES FÍSICOS -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-b border-[#1f2537] py-8">
          
          <!-- Coluna Esquerda: O Grande Gráfico Pentagonal Demoníaco -->
          <div class="lg:col-span-5 flex flex-col items-center justify-center">
            <div class="text-center mb-2">
              <span class="text-[10px] font-mono uppercase text-[#e21b23] font-bold tracking-widest block">[ DIAGRAMA DE FORÇA DO AVESSO ]</span>
              <h4 class="text-lg font-serif font-black text-white">Constelação dos 5 Atributos</h4>
            </div>
            ${this.renderDemonicPentagram(char.attributes)}
          </div>

          <!-- Coluna Direita: Controles Táteis de Atributos & Barras Físicas -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- Os 5 Atributos Táteis com Ajuste + / - -->
            <div>
              <span class="text-[10px] font-mono uppercase text-[#8e95a5] font-bold block mb-2">
                PARÂMETROS CORPORAIS (ESCALA 0 A 5)
              </span>
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                ${[
                  { key: 'agi', label: 'AGI', full: 'Agilidade' },
                  { key: 'for', label: 'FOR', full: 'Força' },
                  { key: 'int', label: 'INT', full: 'Intelecto' },
                  { key: 'pre', label: 'PRE', full: 'Presença' },
                  { key: 'vig', label: 'VIG', full: 'Vigor' }
                ].map(attr => `
                  <div class="p-3 bg-[#06080d] border border-[#1e2535] text-center space-y-1.5 hover:border-[#384259] transition-colors">
                    <span class="text-xs font-mono font-black text-[#e21b23] block">${attr.label}</span>
                    <span class="text-[9px] font-sans text-[#8e95a5] block truncate">${attr.full}</span>
                    <div class="flex items-center justify-center gap-1 pt-1">
                      <button class="attr-step-btn dossier-step-btn w-6 h-6 flex items-center justify-center text-xs" data-attr="${attr.key}" data-delta="-1">-</button>
                      <span class="text-lg font-mono font-black text-white w-6 text-center">${char.attributes[attr.key]}</span>
                      <button class="attr-step-btn dossier-step-btn w-6 h-6 flex items-center justify-center text-xs" data-attr="${attr.key}" data-delta="1">+</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Medidores Físicos de PV e PE -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <!-- Pontos de Vida (PV) -->
              <div class="p-4 bg-[#08090e] border-2 border-[#e21b23] shadow-[0_0_20px_rgba(226,27,35,0.25)] space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono uppercase text-[#e21b23] font-black tracking-wider">
                    PONTOS DE VIDA (PV)
                  </span>
                  <span class="text-xs font-mono text-[#8e95a5]">MÁX: <strong>${stats.maxPv}</strong></span>
                </div>

                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-mono font-black text-white">${char.currentPv}</span>
                  <span class="text-xs font-mono text-[#8e95a5]">/ ${stats.maxPv} PV</span>
                </div>

                <!-- Barra Física Segmentada de PV -->
                <div class="vital-meter-track" title="Vitalidade Física: ${char.currentPv} / ${stats.maxPv}">
                  ${Array.from({ length: totalPvCells }, (_, i) => `
                    <div class="vital-meter-cell ${i < filledPvCells ? 'filled-pv' : ''}"></div>
                  `).join('')}
                </div>

                <!-- Interruptores Analógicos Táteis -->
                <div class="flex items-center justify-between gap-1 pt-1">
                  <button class="pv-step-btn dossier-step-btn flex-1 py-1 text-xs" data-delta="-5">-5</button>
                  <button class="pv-step-btn dossier-step-btn flex-1 py-1 text-xs" data-delta="-1">-1</button>
                  <button class="pv-step-btn dossier-step-btn flex-1 py-1 text-xs" data-delta="1">+1</button>
                  <button class="pv-step-btn dossier-step-btn flex-1 py-1 text-xs" data-delta="5">+5</button>
                </div>
              </div>

              <!-- Pontos de Esforço (PE) -->
              <div class="p-4 bg-[#08090e] border-2 border-[#1f2a3e] space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono uppercase text-[#06b6d4] font-black tracking-wider">
                    PONTOS DE ESFORÇO (PE)
                  </span>
                  <span class="text-xs font-mono text-[#8e95a5]">MÁX: <strong>${stats.maxPe}</strong></span>
                </div>

                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-mono font-black text-[#06b6d4]">${char.currentPe}</span>
                  <span class="text-xs font-mono text-[#8e95a5]">/ ${stats.maxPe} PE</span>
                </div>

                <!-- Barra Física Segmentada de PE -->
                <div class="vital-meter-track" title="Energia Mística: ${char.currentPe} / ${stats.maxPe}">
                  ${Array.from({ length: totalPeCells }, (_, i) => `
                    <div class="vital-meter-cell ${i < filledPeCells ? 'filled-pe' : ''}"></div>
                  `).join('')}
                </div>

                <!-- Limite & Interruptores de PE -->
                <div class="flex items-center justify-between gap-2 pt-1">
                  <span class="text-[9px] font-mono text-[#8e95a5] uppercase">LIMITE/RODADA: <strong class="text-white">${stats.peLimit} PE</strong></span>
                  <div class="flex items-center gap-1">
                    <button class="pe-step-btn dossier-step-btn px-3 py-1 text-xs" data-delta="-1">-1</button>
                    <button class="pe-step-btn dossier-step-btn px-3 py-1 text-xs" data-delta="1">+1</button>
                  </div>
                </div>
              </div>

            </div>

            <!-- Mostradores Rápidos de Combate & Proteção -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <!-- Defesa Passiva -->
              <div class="p-3 bg-[#06080d] border border-[#1e2535] space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-mono text-[#8e95a5] uppercase font-bold">DEFESA</span>
                  <img src="${ICONS8_SHEET.shield}" class="w-3 h-3 object-contain" alt="" />
                </div>
                <div class="text-2xl font-mono font-black text-white">${stats.defense}</div>
                <select id="char-protection" class="dossier-meta-select w-full py-0.5 text-[10px]">
                  <option value="nenhuma" ${char.protectionId === 'nenhuma' ? 'selected' : ''}>Nenhuma (+0)</option>
                  <option value="jaqueta" ${char.protectionId === 'jaqueta' ? 'selected' : ''}>Jaqueta (+1)</option>
                  <option value="colete_leve" ${char.protectionId === 'colete_leve' ? 'selected' : ''}>Colete Leve (+2)</option>
                  <option value="colete_pesado" ${char.protectionId === 'colete_pesado' ? 'selected' : ''}>Colete Pesado (+5)</option>
                </select>
              </div>

              <!-- Iniciativa -->
              <div class="p-3 bg-[#06080d] border border-[#1e2535] space-y-1">
                <span class="text-[9px] font-mono text-[#8e95a5] uppercase font-bold block">INICIATIVA</span>
                <button class="roll-btn text-lg font-mono font-black text-[#e21b23] hover:underline flex items-center gap-1.5 cursor-pointer"
                        data-sides="20" data-bonus="${stats.initiativeBonus}" data-label="Iniciativa">
                  <img src="${ICONS8_SHEET.diceRed}" class="w-3.5 h-3.5 object-contain" alt="" />
                  <span>+${stats.initiativeBonus}</span>
                </button>
                <span class="text-[9px] font-mono text-[#8e95a5] block truncate">1d20 + ${stats.initiativeBonus}</span>
              </div>

              <!-- CD Rituais -->
              <div class="p-3 bg-[#06080d] border border-[#1e2535] space-y-1">
                <span class="text-[9px] font-mono text-[#8e95a5] uppercase font-bold block">CD RITUAIS</span>
                <div class="text-2xl font-mono font-black text-white">CD ${stats.ritualDc}</div>
                <span class="text-[9px] font-mono text-[#8e95a5] block truncate">10 + Atributo + Treino</span>
              </div>

              <!-- Carga & Paroxismo -->
              <div class="p-3 bg-[#06080d] border border-[#1e2535] space-y-1">
                <span class="text-[9px] font-mono text-[#8e95a5] uppercase font-bold block">CORRUPÇÃO</span>
                <div class="text-2xl font-mono font-black text-[#ff333d]">${stats.paroxismoPct}</div>
                <span class="text-[9px] font-mono text-[#8e95a5] block truncate">Carga: ${stats.cargoCapacity} Espaços</span>
              </div>

            </div>

          </div>

        </div>

        <!-- BLOCO 3 // ATLAS DE PERÍCIAS (5 PAINÉIS CATEGORIZADOS) -->
        <div class="space-y-6">
          
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#232938] pb-3">
            <div>
              <span class="text-[10px] font-mono uppercase text-[#e21b23] font-black tracking-wider block">
                [ ATLAS DE CONHECIMENTOS & PERÍCIAS D20 ]
              </span>
              <h3 class="text-2xl font-serif font-black text-white">Treinamento & Perícias de Campo</h3>
            </div>
            <span class="text-xs font-mono text-[#8e95a5]">
              BÔNUS DE TREINO ATUAL: <strong class="text-[#e21b23]">${stats.trainingBonus}</strong>
            </span>
          </div>

          <!-- Os 5 Grupos de Perícias -->
          <div class="space-y-8">
            ${SKILL_CATEGORIES.map(category => {
              const groupSkills = SKILLS_DATA.filter(s => s.category === category.id);
              const trainedInGroup = groupSkills.filter(s => char.trainedSkills.includes(s.id)).length;

              return `
                <div class="p-5 bg-[#06070b] border border-[#1c2230] space-y-4">
                  
                  <!-- Cabeçalho da Categoria -->
                  <div class="flex items-center justify-between border-b border-[#181d2a] pb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-mono font-black text-[#e21b23]">[ ${category.tag} ]</span>
                      <h4 class="text-sm font-serif font-black text-white uppercase tracking-wider">${category.id}</h4>
                      <span class="text-xs font-liturgical italic text-[#8e95a5] hidden md:inline">— ${category.desc}</span>
                    </div>
                    <span class="text-[10px] font-mono ${trainedInGroup > 0 ? 'text-[#e21b23]' : 'text-[#8e95a5]'} font-bold">
                      ${trainedInGroup}/${groupSkills.length} TREINADAS
                    </span>
                  </div>

                  <!-- Cartões das Perícias do Grupo -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    ${groupSkills.map(skill => {
                      const isTrained = char.trainedSkills.includes(skill.id);
                      const baseAttr = skill.attr.toLowerCase().split('/')[0].trim();
                      const attrMod = char.attributes[baseAttr] || 0;
                      // Regra Oficial Paroxismo: Teste = 1d20 + Atributo Base + Bônus de Treinamento (Seção 2.1)
                      // Se Não Treinado: Bônus de Treino = +0 (Rola 1d20 + Atributo, Seção 2.4)
                      // Se Treinado: Bônus de Treino = +stats.trainingBonusVal (+2 nos Níveis 1 a 4)
                      const trainingBonusNum = isTrained ? stats.trainingBonusVal : 0;
                      const totalBonus = attrMod + trainingBonusNum;
                      const signBonus = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

                      return `
                        <div class="dossier-skill-card ${isTrained ? 'is-trained' : ''} p-3 flex flex-col justify-between">
                          
                          <div>
                            <!-- Linha Superior: Checkbox + Código de Arquivo -->
                            <div class="flex items-start justify-between gap-2 mb-2">
                              <label class="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" class="skill-check w-4 h-4 rounded bg-[#040508] border border-[#2e374d] text-[#e21b23] focus:ring-0 cursor-pointer"
                                       data-skill="${skill.id}" ${isTrained ? 'checked' : ''} />
                                <span class="text-xs font-serif font-black ${isTrained ? 'text-white' : 'text-[#c8cbd2]'}">
                                   ${skill.name}
                                </span>
                              </label>
                              <span class="text-[9px] font-mono text-[#8e95a5] uppercase">
                                (${skill.attr})
                              </span>
                            </div>

                            <!-- Código e Fita de Treino com Bônus Explícito -->
                            <div class="flex items-center justify-between text-[9px] font-mono mb-2">
                              <span class="text-[#64748b]">${skill.code}</span>
                              ${isTrained ? `
                                <span class="skill-trained-ribbon">[ TREINADO +${stats.trainingBonusVal} ]</span>
                              ` : `
                                <span class="text-[#475569]">[ LEIGO +0 ]</span>
                              `}
                            </div>

                            <!-- Decomposição Matemática Clara (Atributo + Treino) -->
                            <div class="flex items-center justify-between text-[8px] font-mono px-1.5 py-1 bg-[#040508] border border-[#161a24] text-[#8e95a5] mb-2">
                              <span>${skill.attr}: <strong class="text-white">${attrMod >= 0 ? '+' + attrMod : attrMod}</strong></span>
                              <span>TREINO: <strong class="${isTrained ? 'text-[#e21b23]' : 'text-[#64748b]'}">${isTrained ? '+' + stats.trainingBonusVal : '+0'}</strong></span>
                            </div>
                          </div>

                          <!-- Gatilho de Rolagem d20 com Total do Teste -->
                          <div class="pt-2 border-t border-[#161a24] flex items-center justify-between">
                            <div>
                              <span class="text-[8px] font-mono text-[#8e95a5] block leading-tight">TOTAL DO TESTE</span>
                              <span class="text-[7px] font-mono text-[#64748b]">1d20 + ${totalBonus}</span>
                            </div>
                            <button class="roll-btn px-2.5 py-1 bg-[#0b0e16] hover:bg-[#e21b23] hover:text-black border ${isTrained ? 'border-[#e21b23] text-[#ff333d]' : 'border-[#242b3a] text-white'} text-xs font-mono font-black transition-colors flex items-center gap-1.5 cursor-pointer"
                                    data-sides="20" data-bonus="${totalBonus}" data-label="Teste de ${skill.name}">
                              <img src="${isTrained ? ICONS8_SHEET.diceRed : ICONS8_SHEET.diceWhite}" class="w-3 h-3 object-contain" alt="" />
                              <span>${signBonus}</span>
                            </button>
                          </div>

                        </div>
                      `;
                    }).join('')}
                  </div>

                </div>
              `;
            }).join('')}
          </div>

        </div>

        <!-- BLOCO 4 // ARSENAL DE COMBATE (GRANDES CARTAS DE INVENTÁRIO) -->
        <div class="space-y-4">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232938] pb-2">
            <div>
              <span class="text-[10px] font-mono uppercase text-[#e21b23] font-black tracking-wider block">
                [ INVENTÁRIO BÉLICO // ARMAS EMPUNHADAS ]
              </span>
              <h3 class="text-2xl font-serif font-black text-white">Arsenal Tático de Campo</h3>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-[#8e95a5]">
                ESPAÇOS DE ARMAS: <strong class="text-white">${char.customWeapons.reduce((acc, w) => acc + (w.grip === 'pesada' ? 5 : w.grip === 'leve' ? 1 : 2), 0)}</strong> / ${stats.cargoCapacity}
              </span>
              <a href="#criacao" class="px-3 py-1 bg-[#1a1315] hover:bg-[#e21b23] hover:text-black border border-[#e21b23]/50 text-xs font-mono font-bold text-[#ff333d] transition-all flex items-center gap-1.5 cursor-pointer">
                <img src="${ICONS8.sword('FF333D', 14)}" class="w-3.5 h-3.5 object-contain" alt="" />
                <span>FORJAR ARMA</span>
              </a>
            </div>
          </div>

          ${char.customWeapons.length === 0 ? `
            <div class="p-8 bg-[#06070c] border border-dashed border-[#263145] text-center space-y-3">
              <img src="${ICONS8.sword('8E95A5', 32)}" alt="" class="w-8 h-8 object-contain mx-auto mb-1 opacity-60" />
              <p class="text-xs text-[#8e95a5] font-mono">Nenhuma arma equipada no seu arsenal. Crie ou forje uma arma no menu A Forja.</p>
              <a href="#criacao" class="inline-flex items-center gap-2 px-4 py-2 bg-[#e21b23] text-black font-mono font-bold text-xs">
                <img src="${ICONS8.anvil('000000', 14)}" class="w-3.5 h-3.5 object-contain" alt="" />
                <span>[ ABRIR A FORJA ]</span>
              </a>
            </div>
          ` : `
            <!-- Grade de Cartas Horizontais -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              ${char.customWeapons.map((wpn, wIdx) => {
                const baseAttr = (wpn.hitMod || 'for').toLowerCase().trim();
                const attrMod = char.attributes[baseAttr] || 0;
                const isTrainedInCombat = (wpn.type || '').toLowerCase().includes('manifestada') || (wpn.type || '').toLowerCase().includes('branca')
                  ? char.trainedSkills.includes('luta')
                  : char.trainedSkills.includes('pontaria');
                const hitBonus = attrMod + (isTrainedInCombat ? stats.trainingBonusVal : 0);
                const signHit = hitBonus >= 0 ? `+${hitBonus}` : `${hitBonus}`;

                const weaponIcon = (wpn.type || '').toLowerCase().includes('fogo') ? ICONS8_SHEET.firearm : ICONS8_SHEET.sword;

                return `
                  <div class="dossier-weapon-card p-4 flex flex-col justify-between gap-4">
                    
                    <!-- Topo: Slot de Inventário com Ícone e Descrição -->
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex items-start gap-3">
                        <div class="dossier-weapon-slot flex-shrink-0 relative overflow-hidden w-14 h-14 bg-[#040508] border border-[#232b3c] flex items-center justify-center">
                          ${wpn.imageUrl ? `
                            <img src="${wpn.imageUrl}" class="w-full h-full object-cover" alt="${wpn.name}" />
                          ` : `
                            <img src="${weaponIcon}" class="w-8 h-8 object-contain" alt="${wpn.name}" />
                          `}
                        </div>

                        <div class="space-y-1">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="px-2 py-0.2 bg-[#e21b23]/20 border border-[#e21b23]/50 text-[9px] font-mono font-bold text-[#ff333d] uppercase">
                              ${wpn.type}
                            </span>
                            <span class="text-[9px] font-mono text-[#8e95a5]">SLOT N° ${wIdx + 1} (${wpn.grip === 'pesada' ? '5 Espaços' : wpn.grip === 'leve' ? '1 Espaço' : '2 Espaços'})</span>
                          </div>
                          <h4 class="text-base font-serif font-black text-white leading-tight">${wpn.name}</h4>
                          
                          <!-- Especificações Técnicas Militares -->
                          <div class="flex items-center gap-2 text-xs font-mono pt-1 text-[#c8cbd2] flex-wrap">
                            <span>DANO: <strong class="text-[#e21b23]">${wpn.dmgDice}</strong></span>
                            <span>•</span>
                            <span>CRÍTICO: <strong>${wpn.crit}</strong></span>
                            <span>•</span>
                            <span>ALCANCE: <strong>${wpn.range}</strong></span>
                          </div>

                          ${wpn.special ? `
                            <div class="text-[10px] font-mono text-[#8e95a5] pt-0.5">${wpn.special}</div>
                          ` : ''}

                          ${wpn.mods && wpn.mods.length > 0 ? `
                            <div class="flex items-center gap-1.5 flex-wrap pt-1">
                              <span class="text-[9px] font-mono text-[#06b6d4] font-bold">[ MODS ]:</span>
                              ${wpn.mods.map(m => `<span class="px-1.5 py-0.2 bg-[#081522] border border-[#06b6d4]/40 text-[9px] font-mono text-[#67e8f9] flex items-center gap-1"><img src="${ICONS8.gear('06B6D4', 10)}" class="w-2.5 h-2.5 object-contain" alt="" />${m}</span>`).join('')}
                            </div>
                          ` : ''}
                        </div>
                      </div>

                      <button class="remove-weapon-btn text-[10px] font-mono text-[#8e95a5] hover:text-[#e21b23] p-1 cursor-pointer" data-widx="${wIdx}" title="Desequipar Arma">
                        ✕
                      </button>
                    </div>

                    <!-- Botões de Ação: Ataque Tático d20 & Rolagem de Dano -->
                    <div class="flex items-center gap-2 pt-2 border-t border-[#1a202d] flex-wrap">
                      <button class="roll-btn flex-1 py-2.5 bg-[#e21b23] hover:bg-white text-black font-mono font-black text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(226,27,35,0.4)] whitespace-nowrap cursor-pointer"
                              data-sides="20" data-bonus="${hitBonus}" data-label="Ataque com ${wpn.name}">
                        <img src="${ICONS8_SHEET.diceBlack}" class="w-3.5 h-3.5 object-contain" alt="" />
                        <span>[ TESTAR ATAQUE (${signHit}) ]</span>
                      </button>

                      <button class="roll-btn px-4 py-2.5 bg-[#0a0d15] hover:bg-[#e21b23] hover:text-black border border-[#26334a] text-white font-mono font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                              data-sides="formula" data-formula="${wpn.dmgDice}" data-label="Dano de ${wpn.name}">
                        <img src="${ICONS8_SHEET.diceRed}" class="w-3.5 h-3.5 object-contain" alt="" />
                        <span>[ ROLAR DANO ]</span>
                      </button>
                    </div>

                  </div>
                `;
              }).join('')}
            </div>
          `}

        </div>

        <!-- BLOCO 5 // GRIMÓRIO PESSOAL // RITUAIS FORJADOS & VINCULADOS -->
        <div class="space-y-4">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232938] pb-2">
            <div>
              <span class="text-[10px] font-mono uppercase text-[#e21b23] font-black tracking-wider block">
                [ GRIMÓRIO DE CAMPO // RITUAIS PESSOAIS & FORJADOS ]
              </span>
              <h3 class="text-2xl font-serif font-black text-white">Rituais Vinculados à Alma</h3>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-[#8e95a5]">RITUAIS VINCULADOS: <strong class="text-white">${char.customRituals.length}</strong></span>
              <a href="#criacao" class="px-3 py-1 bg-[#1a1315] hover:bg-[#e21b23] hover:text-black border border-[#e21b23]/50 text-xs font-mono font-bold text-[#ff333d] transition-all flex items-center gap-1.5 cursor-pointer">
                <img src="${ICONS8.scroll('FF333D', 14)}" class="w-3.5 h-3.5 object-contain" alt="" />
                <span>FORJAR NOVO RITUAL</span>
              </a>
            </div>
          </div>

          ${char.customRituals.length === 0 ? `
            <div class="p-8 bg-[#06070c] border border-dashed border-[#263145] text-center space-y-3">
              <div class="w-12 h-12 mx-auto rounded-full bg-[#121826] border border-[#e21b23]/40 flex items-center justify-center">
                <img src="${ICONS8.scroll('E21B23', 24)}" class="w-6 h-6 object-contain" alt="" />
              </div>
              <div class="space-y-1">
                <h4 class="text-base font-serif font-bold text-white uppercase">Nenhum Ritual Forjado ou Vinculado</h4>
                <p class="text-xs font-liturgical italic text-[#8e95a5] max-w-lg mx-auto">
                  Crie rituais originais e balanceados com custos precisos em PE, círculos (1º ao 4º) e efeitos na Forja (Aba VI) e vincule diretamente à sua ficha.
                </p>
              </div>
              <a href="#criacao" class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e21b23] hover:bg-white text-black font-mono font-bold text-xs transition-colors shadow-[0_0_15px_rgba(226,27,35,0.4)]">
                <img src="${ICONS8.anvil('000000', 14)}" class="w-3.5 h-3.5 object-contain" alt="" />
                <span>[ ABRIR ATELIÊ DE RITUAIS ]</span>
              </a>
            </div>
          ` : `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              ${char.customRituals.map((rit, rIdx) => {
                return `
                  <div class="dossier-weapon-card p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 bg-[#e21b23]/20 border border-[#e21b23]/50 text-[9px] font-mono font-bold text-[#ff333d] uppercase">
                              ${rit.circle}º CÍRCULO • ${rit.peCost} PE
                            </span>
                            <span class="text-[9px] font-mono text-[#06b6d4] uppercase font-bold">
                              [ ${(rit.emotion || 'Avesso').toUpperCase()} ]
                            </span>
                          </div>
                          <h4 class="text-lg font-serif font-black text-white leading-tight">${rit.name}</h4>
                        </div>
                        <button class="remove-ritual-btn text-xs text-[#8e95a5] hover:text-[#e21b23] p-1 font-mono cursor-pointer" data-ridx="${rIdx}" title="Desvincular Ritual">
                          ✕
                        </button>
                      </div>

                      <div class="flex items-center gap-2 text-xs font-mono text-[#8e95a5] border-y border-[#181f2e] py-1.5 my-2 flex-wrap">
                        <span>EXEC: <strong class="text-white">${rit.execution}</strong></span>
                        <span>•</span>
                        <span>ALCANCE: <strong class="text-white">${rit.range}</strong></span>
                        <span>•</span>
                        <span>DURAÇÃO: <strong class="text-white">${rit.duration}</strong></span>
                        <span>•</span>
                        <span>RESISTÊNCIA: <strong class="text-white">${rit.save}</strong></span>
                      </div>

                      <p class="text-xs text-[#cbd0dc] font-sans leading-relaxed">
                        ${rit.effect}
                      </p>

                      ${rit.amplification ? `
                        <div class="mt-2 p-2 bg-[#05060a] border-l-2 border-[#06b6d4] text-[11px] font-sans text-[#8e95a5]">
                          <strong class="text-[#06b6d4] font-mono">AMPLIAÇÃO:</strong> ${rit.amplification}
                        </div>
                      ` : ''}
                    </div>

                    <div class="flex items-center justify-between gap-2 pt-2 border-t border-[#181f2e] flex-wrap">
                      <button class="cast-ritual-btn px-4 py-2 bg-[#101420] hover:bg-[#e21b23] text-white hover:text-black font-mono font-bold text-xs border border-[#2b374d] transition-all flex items-center gap-1.5 cursor-pointer"
                              data-name="${rit.name}" data-cost="${rit.peCost}">
                        <img src="${ICONS8.bolt('06B6D4', 14)}" class="w-3.5 h-3.5 object-contain" alt="" />
                        <span>[ CONJURAR (-${rit.peCost} PE) ]</span>
                      </button>

                      ${rit.dmgDice ? `
                        <button class="roll-btn px-3 py-2 bg-[#0c1018] hover:bg-white text-[#ff333d] hover:text-black font-mono font-bold text-xs border border-[#e21b23]/40 transition-all flex items-center gap-1.5 cursor-pointer"
                                data-sides="formula" data-formula="${rit.dmgDice}" data-label="Efeito de ${rit.name}">
                          <img src="${ICONS8_SHEET.diceRed}" class="w-3.5 h-3.5 object-contain" alt="" />
                          <span>[ ROLAR ${rit.dmgDice} ]</span>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}

        </div>

      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    ['name', 'concept', 'player'].forEach(field => {
      const el = this.container.querySelector('#char-' + field);
      if (el) {
        el.addEventListener('input', (e) => {
          this.character[field] = e.target.value;
          this.saveCharacter();
        });
      }
    });

    const levelEl = this.container.querySelector('#char-level');
    if (levelEl) {
      levelEl.addEventListener('change', (e) => {
        this.character.level = parseInt(e.target.value);
        this.saveCharacter();
        this.render();
      });
    }

    const classEl = this.container.querySelector('#char-class');
    if (classEl) {
      classEl.addEventListener('change', (e) => {
        this.character.classId = e.target.value;
        this.saveCharacter();
        this.render();
      });
    }

    const originEl = this.container.querySelector('#char-origin');
    if (originEl) {
      originEl.addEventListener('change', (e) => {
        this.character.originId = e.target.value;
        this.saveCharacter();
        this.render();
      });
    }

    const primaryEmoEl = this.container.querySelector('#char-primary-emo');
    if (primaryEmoEl) {
      primaryEmoEl.addEventListener('change', (e) => {
        this.character.primaryEmo = e.target.value;
        this.saveCharacter();
        this.render();
      });
    }

    const secondaryEmoEl = this.container.querySelector('#char-secondary-emo');
    if (secondaryEmoEl) {
      secondaryEmoEl.addEventListener('change', (e) => {
        this.character.secondaryEmo = e.target.value;
        this.saveCharacter();
        this.render();
      });
    }

    const protEl = this.container.querySelector('#char-protection');
    if (protEl) {
      protEl.addEventListener('change', (e) => {
        this.character.protectionId = e.target.value;
        this.saveCharacter();
        this.render();
      });
    }

    this.container.querySelectorAll('.attr-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        const attrKey = btn.getAttribute('data-attr');
        const delta = parseInt(btn.getAttribute('data-delta'));
        this.character.attributes[attrKey] = Math.max(0, Math.min(10, this.character.attributes[attrKey] + delta));
        this.saveCharacter();
        this.render();
      });
    });

    this.container.querySelectorAll('.pv-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        const delta = parseInt(btn.getAttribute('data-delta'));
        const stats = this.calculateStats();
        this.character.currentPv = Math.max(0, Math.min(stats.maxPv, this.character.currentPv + delta));
        this.saveCharacter();
        this.render();
      });
    });

    this.container.querySelectorAll('.pe-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playRuneClick();
        const delta = parseInt(btn.getAttribute('data-delta'));
        const stats = this.calculateStats();
        this.character.currentPe = Math.max(0, Math.min(stats.maxPe, this.character.currentPe + delta));
        this.saveCharacter();
        this.render();
      });
    });

    this.container.querySelectorAll('.skill-check').forEach(chk => {
      chk.addEventListener('change', () => {
        soundFX.playRuneClick();
        const skillKey = chk.getAttribute('data-skill');
        if (chk.checked) {
          if (!this.character.trainedSkills.includes(skillKey)) {
            this.character.trainedSkills.push(skillKey);
          }
        } else {
          this.character.trainedSkills = this.character.trainedSkills.filter(s => s !== skillKey);
        }
        this.saveCharacter();
        this.render();
      });
    });

    this.container.querySelectorAll('.roll-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sides = btn.getAttribute('data-sides');
        const formula = btn.getAttribute('data-formula');
        const bonus = parseInt(btn.getAttribute('data-bonus')) || 0;
        const label = btn.getAttribute('data-label') || 'Rolagem';
        if (sides === 'formula' || formula) {
          this.rollDice(0, 0, label, formula);
        } else {
          this.rollDice(parseInt(sides) || 20, bonus, label);
        }
      });
    });

    this.container.querySelectorAll('.remove-weapon-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wIdx = parseInt(btn.getAttribute('data-widx'), 10);
        const wName = this.character.customWeapons[wIdx]?.name || "Arma";
        if (confirm(`Deseja desequipar a arma "${wName}"?`)) {
          soundFX.playRuneClick();
          this.character.customWeapons.splice(wIdx, 1);
          this.saveCharacter();
          this.render();
        }
      });
    });

    this.container.querySelectorAll('.cast-ritual-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cost = parseInt(btn.getAttribute('data-cost'), 10) || 1;
        const name = btn.getAttribute('data-name') || 'Ritual';
        if (this.character.currentPe < cost) {
          soundFX.playSealBreak();
          alert(`Pontos de Esforço insuficientes! O ritual "${name}" requer ${cost} PE (disponível: ${this.character.currentPe} PE).`);
          return;
        }
        soundFX.playSealBreak();
        this.character.currentPe -= cost;
        this.saveCharacter();
        this.render();
        this.showRollToast(`Conjuração: ${name}`, `-${cost} PE`, `Energia restante: ${this.character.currentPe} PE`, true, false);
      });
    });

    this.container.querySelectorAll('.remove-ritual-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rIdx = parseInt(btn.getAttribute('data-ridx'), 10);
        const rName = this.character.customRituals[rIdx]?.name || "Ritual";
        if (confirm(`Deseja desvincular o ritual "${rName}" da sua ficha?`)) {
          soundFX.playRuneClick();
          this.character.customRituals.splice(rIdx, 1);
          this.saveCharacter();
          this.render();
        }
      });
    });

    this.container.querySelector('#export-sheet-btn')?.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.character, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", this.character.name.toLowerCase().replace(/\s+/g, '_') + '_paroxismo.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    const importInput = this.container.querySelector('#import-sheet-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            this.character = { ...this.getDefaultCharacter(), ...imported };
            this.saveCharacter();
            this.render();
            alert('Dossiê de agente carregado com sucesso.');
          } catch (err) {
            alert('Erro ao importar arquivo JSON.');
          }
        };
        reader.readAsText(file);
      });
    }

    // Upload de Retrato Personalizado com Otimização em Canvas
    const avatarInput = this.container.querySelector('#custom-avatar-input');
    if (avatarInput) {
      avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
          const optimizedUrl = await ImageOptimizer.optimizeAvatar(file);
          this.character.customAvatar = optimizedUrl;
          this.saveCharacter();
          soundFX.playRuneClick();
          this.render();
        } catch (err) {
          alert(err.message || "Erro ao processar imagem de retrato.");
        }
      });
    }

    // Resetar Retrato para o Padrão da Classe
    this.container.querySelector('#reset-avatar-btn')?.addEventListener('click', () => {
      this.character.customAvatar = null;
      this.saveCharacter();
      soundFX.playRuneClick();
      this.render();
    });

    this.container.querySelector('#print-sheet-btn')?.addEventListener('click', () => {
      soundFX.playRuneClick();
      this.openExportImageModal();
    });

    this.container.querySelector('#reset-sheet-btn')?.addEventListener('click', () => {
      if (confirm('Deseja restaurar o dossiê para os padrões iniciais?')) {
        this.character = this.getDefaultCharacter();
        this.saveCharacter();
        this.render();
      }
    });
  }

  rollDice(sides, bonus, label, formula = null) {
    let result = 0;
    let details = "";
    let isCrit = false;
    let isFumble = false;
    let animSides = sides || 20;

    if (formula) {
      let cleanFormula = formula
        .replace(/\bFOR\b/gi, this.character.attributes.for || 0)
        .replace(/\bAGI\b/gi, this.character.attributes.agi || 0)
        .replace(/\bINT\b/gi, this.character.attributes.int || 0)
        .replace(/\bPRE\b/gi, this.character.attributes.pre || 0)
        .replace(/\bVIG\b/gi, this.character.attributes.vig || 0);

      const regex = /(\d+)d(\d+)/g;
      let dSides = 20;
      const firstMatch = cleanFormula.match(/(\d+)d(\d+)/);
      if (firstMatch) {
        dSides = parseInt(firstMatch[2], 10);
      }
      animSides = dSides;

      // ARREMESSO FÍSICO REAL DO DADO 3D (Estilo Foundry VTT)
      DiceAnimator.roll({
        sides: animSides,
        label: label
      }).then(({ rolledValue, isCrit, isFumble }) => {
        let evaluatedExpr = cleanFormula;
        let rollBreakdowns = [];
        let replacedFirst = false;
        let match;

        while ((match = regex.exec(cleanFormula)) !== null) {
          const count = parseInt(match[1], 10);
          const sidesMatched = parseInt(match[2], 10);
          let diceRolls = [];
          for (let i = 0; i < count; i++) {
            if (!replacedFirst) {
              diceRolls.push(rolledValue);
              replacedFirst = true;
            } else {
              diceRolls.push(Math.floor(Math.random() * sidesMatched) + 1);
            }
          }
          const diceSum = diceRolls.reduce((a, b) => a + b, 0);
          rollBreakdowns.push(`${match[0]} [${diceRolls.join(', ')}]`);
          evaluatedExpr = evaluatedExpr.replace(match[0], `${diceSum}`);
        }

        let result = 0;
        try {
          const sanitized = evaluatedExpr.replace(/[^0-9+\-*]/g, '');
          result = Function(`'use strict'; return (${sanitized})`)();
        } catch (e) {
          result = 0;
        }

        const details = `${formula} ➔ ${rollBreakdowns.join(' + ')}`;

        if (window.ParoxismoApp && window.ParoxismoApp.components && window.ParoxismoApp.components.diceRoller) {
          window.ParoxismoApp.components.diceRoller.addCustomRoll?.(label, result, details);
        }
        this.showRollToast(label, result, details, isCrit, isFumble);
      });
      return;
    }

    // ARREMESSO FÍSICO REAL DO DADO 3D (Estilo Foundry VTT)
    // O valor do teste é lido DIRETAMENTE da face superior física após o repouso absoluto!
    DiceAnimator.roll({
      sides: animSides,
      label: label
    }).then(({ rolledValue, isCrit, isFumble }) => {
      const result = rolledValue + bonus;
      const sign = bonus >= 0 ? `+${bonus}` : `${bonus}`;
      const details = `1d${animSides} (${rolledValue}) ${sign}`;

      if (window.ParoxismoApp && window.ParoxismoApp.components && window.ParoxismoApp.components.diceRoller) {
        window.ParoxismoApp.components.diceRoller.addCustomRoll?.(label, result, details);
      }
      this.showRollToast(label, result, details, isCrit, isFumble);
    });
  }

  showRollToast(label, result, details, isCrit = false, isFumble = false) {
    document.getElementById('dossier-roll-toast')?.remove();

    const toast = document.createElement('div');
    toast.id = 'dossier-roll-toast';
    toast.className = 'fixed bottom-6 right-6 z-[999] bg-[#07090e] border-2 ' + 
      (isCrit ? 'border-[#06b6d4] shadow-[0_0_30px_rgba(6,182,212,0.6)]' : isFumble ? 'border-[#ff333d] shadow-[0_0_30px_rgba(255,51,61,0.6)]' : 'border-[#e21b23] shadow-[0_0_25px_rgba(226,27,35,0.4)]') +
      ' p-4 min-w-[280px] max-w-[360px] animate-fadeIn flex flex-col gap-2 font-mono';

    toast.innerHTML = `
      <div class="flex items-center justify-between border-b border-[#222a3d] pb-1.5">
        <span class="text-[10px] uppercase font-bold ${isCrit ? 'text-[#06b6d4]' : isFumble ? 'text-[#ff333d]' : 'text-[#e21b23]'}">[ ${isCrit ? 'CRÍTICO DECISIVO' : isFumble ? 'FALHA DESASTROSA' : 'TESTE REALIZADO'} ]</span>
        <button id="close-toast-btn" class="text-xs text-[#8e95a5] hover:text-white cursor-pointer">✕</button>
      </div>
      <div class="flex items-baseline justify-between gap-3">
        <span class="text-xs font-serif font-bold text-white truncate">${label}</span>
        <span class="text-3xl font-black ${isCrit ? 'text-[#06b6d4]' : isFumble ? 'text-[#ff333d]' : 'text-white'}">${result}</span>
      </div>
      <div class="text-[10px] text-[#8e95a5] truncate">${details}</div>
    `;

    document.body.appendChild(toast);
    toast.querySelector('#close-toast-btn')?.addEventListener('click', () => toast.remove());
    setTimeout(() => toast.remove(), 6000);

    // Dispara broadcast de rolagem para sincronização no Discord Activity
    try {
      window.dispatchEvent(new CustomEvent('paroxismo:roll_broadcast', {
        detail: {
          label,
          result,
          details,
          isCrit,
          isFumble
        }
      }));
    } catch (e) {}
  }

  async openExportImageModal() {
    const stats = this.calculateStats();
    const dataUrl = await SheetImageGenerator.generate(this.character, stats);

    document.getElementById('sheet-image-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'sheet-image-modal';
    modal.className = 'fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto';

    modal.innerHTML = `
      <div class="relative max-w-5xl w-full bg-[#07090f] border-2 border-[#e21b23] shadow-[0_0_50px_rgba(226,27,35,0.4)] p-6 space-y-4 max-h-[96vh] flex flex-col">
        
        <!-- Cabeçalho do Modal -->
        <div class="flex items-center justify-between border-b border-[#222a3d] pb-3">
          <div>
            <span class="text-[10px] font-mono font-bold text-[#e21b23] uppercase tracking-widest block">
              [ FICHA GÓTICA DO AGENTE GERADA COM SUCESSO ]
            </span>
            <h3 class="text-xl font-serif font-black text-white">
              Imagem de Alta Resolução // ${this.character.name}
            </h3>
          </div>
          <button id="close-image-modal-btn" class="text-white hover:text-[#e21b23] text-2xl font-mono px-3 py-1 cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Pré-visualização da Imagem Gerada (Alta Resolução) -->
        <div class="flex-1 overflow-auto text-center p-3 bg-[#030406] border border-[#1a202d] rounded flex items-center justify-center">
          <img id="generated-sheet-img" src="${dataUrl}" class="max-h-[66vh] w-auto mx-auto shadow-2xl border border-[#263045]" alt="Ficha Gerada" />
        </div>

        <!-- Barra de Ações: Download & Impressão -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#222a3d]">
          <div class="text-xs font-mono text-[#8e95a5]">
            Formato: <strong class="text-white">1240 × 1754 px (A4 High-Res 150 DPI)</strong>
          </div>

          <div class="flex items-center gap-3">
            <button id="download-sheet-img-btn" class="px-5 py-2.5 bg-[#e21b23] hover:bg-white text-black font-mono font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(226,27,35,0.4)]">
              <img src="${ICONS8.download('000000', 14)}" class="w-3.5 h-3.5 object-contain" alt="" />
              <span>[ BAIXAR IMAGEM PNG ]</span>
            </button>
            <button id="print-sheet-img-btn" class="dossier-step-btn px-5 py-2.5 text-xs font-mono font-black flex items-center gap-2 cursor-pointer">
              <img src="${ICONS8.print('CBD0DC', 14)}" class="w-3.5 h-3.5 object-contain" alt="" />
              <span>[ IMPRIMIR FICHA ]</span>
            </button>
            <button id="close-modal-footer-btn" class="dossier-step-btn px-4 py-2.5 text-xs">
              [ FECHAR ]
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector('#close-image-modal-btn')?.addEventListener('click', closeModal);
    modal.querySelector('#close-modal-footer-btn')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    modal.querySelector('#download-sheet-img-btn')?.addEventListener('click', () => {
      soundFX.playRuneClick();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${(this.character.name || 'agente').toLowerCase().replace(/\\s+/g, '_')}_ficha_paroxismo.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    modal.querySelector('#print-sheet-img-btn')?.addEventListener('click', () => {
      soundFX.playRuneClick();
      const printWin = window.open('', '_blank');
      if (!printWin) {
        alert('Por favor, autorize popups no navegador para imprimir.');
        return;
      }
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ficha de Agente - ${this.character.name}</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; padding: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
            img { width: 100%; height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();window.close();" />
        </body>
        </html>
      `);
      printWin.document.close();
    });
  }
}
