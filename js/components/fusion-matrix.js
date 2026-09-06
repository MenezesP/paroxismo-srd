/**
 * PAROXISMO - SRD COMPENDIUM
 * Componente: Matriz de Fusões Híbridas (45 Combinações de Emoções)
 * Integrado com o Códice Oficial dos 45 Arquétipos Híbridos
 * 100% Livre de Emojis e Otimizado para Mobile
 */

import { EMOTIONS_DATA, HYBRID_FUSIONS } from '../data/emotions.js';
import { ARCHETYPES_DATA } from '../data/archetypes.js';
import { soundFX } from '../utils/sound-fx.js';

export class FusionMatrix {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.primaryEmo = 'rancor';
    this.secondaryEmo = 'vazio';
    this.searchQuery = "";
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  getEnrichedFusions() {
    return HYBRID_FUSIONS.map(f => {
      const arch = ARCHETYPES_DATA.find(a => a.id === f.id || a.name.toLowerCase() === f.name.toLowerCase()) || {};
      const e1Data = EMOTIONS_DATA.find(e => e.id === f.e1) || { name: f.e1 };
      const e2Data = EMOTIONS_DATA.find(e => e.id === f.e2) || { name: f.e2 };

      const e1Clean = e1Data.name.replace("O ", "").replace("A ", "");
      const e2Clean = e2Data.name.replace("O ", "").replace("A ", "");

      return {
        id: f.id,
        name: f.name,
        e1: f.e1,
        e2: f.e2,
        e1Name: e1Clean,
        e2Name: e2Clean,
        pairing: `${e1Clean} + ${e2Clean}`,
        desc: f.desc || arch.quote || "Manifestação oculta do abismo de emoções combinadas.",
        quote: arch.quote || f.desc || "",
        level1: arch.level1 || {
          activation: "Ação Padrão (2 PE)",
          effect: f.desc || "Manifestação primordial da fusão híbrida."
        },
        level2: arch.level2 || null,
        archId: arch.id || f.id
      };
    });
  }

  getCurrentFusion() {
    if (this.primaryEmo === this.secondaryEmo) return null;
    const all = this.getEnrichedFusions();
    return all.find(f => 
      (f.e1 === this.primaryEmo && f.e2 === this.secondaryEmo) ||
      (f.e1 === this.secondaryEmo && f.e2 === this.primaryEmo)
    );
  }

  render() {
    const currentFusion = this.getCurrentFusion();
    const pEmo = EMOTIONS_DATA.find(e => e.id === this.primaryEmo) || EMOTIONS_DATA[0];
    const sEmo = EMOTIONS_DATA.find(e => e.id === this.secondaryEmo) || EMOTIONS_DATA[1];
    const allFusions = this.getEnrichedFusions();

    const filteredFusions = allFusions.filter(f => {
      if (this.searchQuery.trim() === "") return true;
      const q = this.searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || 
             f.pairing.toLowerCase().includes(q) || 
             f.desc.toLowerCase().includes(q) ||
             (f.level1 && f.level1.effect && f.level1.effect.toLowerCase().includes(q));
    });

    this.container.innerHTML = `
      <div class="gothic-box p-4 sm:p-6 space-y-6">
        
        <div class="border-b border-[#1b202d] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span class="rune-tag-gold block">[ DESPERTAR DUAL ]</span>
            <h2 class="text-xl sm:text-2xl font-serif font-black text-white">Calculadora das 45 Fusões Híbridas</h2>
          </div>
          <span class="text-xs font-mono text-[#8e95a5] border border-[#222736] px-2.5 py-1 bg-[#050608] self-start sm:self-center">
            1 DOMINANTE + 1 LATENTE
          </span>
        </div>

        <!-- Seletores de Emoções -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-[#050608] border border-[#1b202d] p-3.5 space-y-2">
            <span class="text-[10px] font-mono uppercase text-[#e21b23] font-bold block">[ 1. EMOÇÃO DOMINANTE (PRIMÁRIA) ]</span>
            <select id="matrix-primary-select" class="w-full bg-[#000] border border-[#222736] px-3 py-2.5 text-xs font-mono text-white focus:border-[#e21b23] focus:outline-none cursor-pointer">
              ${EMOTIONS_DATA.map(e => `
                <option value="${e.id}" ${e.id === this.primaryEmo ? 'selected' : ''}>${e.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="bg-[#050608] border border-[#1b202d] p-3.5 space-y-2">
            <span class="text-[10px] font-mono uppercase text-[#06b6d4] font-bold block">[ 2. EMOÇÃO LATENTE (SECUNDÁRIA) ]</span>
            <select id="matrix-secondary-select" class="w-full bg-[#000] border border-[#222736] px-3 py-2.5 text-xs font-mono text-white focus:border-[#06b6d4] focus:outline-none cursor-pointer">
              ${EMOTIONS_DATA.map(e => `
                <option value="${e.id}" ${e.id === this.secondaryEmo ? 'selected' : ''}>${e.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Resultado da Fusão -->
        ${currentFusion ? `
          <div class="bg-[#07090f] border border-[#e21b23] p-4 sm:p-6 space-y-4 shadow-[0_0_30px_rgba(226,27,35,0.2)]">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#1b202d] pb-3">
              <div>
                <span class="text-[9px] font-mono uppercase text-[#e21b23] tracking-widest block font-bold">// ARQUÉTIPO HÍBRIDO RESULTANTE</span>
                <h3 class="text-2xl sm:text-3xl font-serif font-black text-white">${currentFusion.name}</h3>
                <p class="text-xs font-liturgical italic text-[#cbd5e1] mt-0.5">"${currentFusion.desc}"</p>
              </div>
              <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
                <span class="px-3 py-1 bg-[#120507] border border-[#e21b23] text-xs font-mono font-bold text-white">
                  ${currentFusion.pairing}
                </span>
                <button class="goto-archetype-btn px-3 py-1 bg-[#090b14] hover:bg-[#121828] border border-[#06b6d4] text-[10px] font-mono text-[#06b6d4] font-bold transition-all cursor-pointer" data-id="${currentFusion.archId}">
                  [ DOSSIÊ COMPLETO ⮞ ]
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <!-- Poder Nível 1 -->
              <div class="bg-[#050608] border-l-2 border-[#06b6d4] border-t border-r border-b border-[#181d2a] p-3.5 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-mono uppercase text-[#06b6d4] font-black tracking-wider">[ NÍVEL 1: DESPERTAR ]</span>
                  <span class="text-[9px] text-[#8e95a5]">${currentFusion.level1.activation || 'Ação Padrão (2 PE)'}</span>
                </div>
                <p class="text-xs text-[#cbd5e1] font-sans leading-relaxed pt-1">
                  ${currentFusion.level1.effect || currentFusion.desc || ''}
                </p>
                ${currentFusion.level1.enemy ? `
                  <div class="text-[11px] text-[#93c5fd] pt-1.5 border-t border-[#131e2e]">
                    <span class="font-bold font-mono uppercase text-[9px] text-[#38bdf8]">[ EFEITO NO ALVO ]:</span> ${currentFusion.level1.enemy}
                  </div>
                ` : ''}
              </div>

              <!-- Poder Nível 2 -->
              ${currentFusion.level2 ? `
                <div class="bg-[#050608] border-l-2 border-[#e21b23] border-t border-r border-b border-[#181d2a] p-3.5 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-mono uppercase text-[#e21b23] font-black tracking-wider">[ NÍVEL 2: PAROXISMO ]</span>
                    <span class="text-[9px] text-[#8e95a5]">${currentFusion.level2.activation || 'Ação Padrão (5 PE)'}</span>
                  </div>
                  <p class="text-xs text-[#cbd5e1] font-sans leading-relaxed pt-1">
                    ${currentFusion.level2.extremePower || currentFusion.level2.effect || 'Poder paroxístico supremo da fusão elemental.'}
                  </p>
                  ${currentFusion.level2.penaltyName ? `
                    <div class="text-[10px] text-[#ff7875] pt-1.5 border-t border-[#2d1519] font-mono">
                      <span class="bg-[#e21b23]/20 border border-[#e21b23]/40 px-1 py-0.5 mr-1 font-bold text-[#e21b23]">[ CUSTO: ${currentFusion.level2.penaltyName} ]</span>
                      <span class="text-[#cbd0dc] font-sans">${currentFusion.level2.penaltyDesc || ''}</span>
                    </div>
                  ` : ''}
                </div>
              ` : `
                <div class="bg-[#050608] border border-[#181d2a] p-3.5 flex items-center justify-center text-[#8e95a5] italic text-xs">
                  Aprofunde o Grau de Paroxismo para desbloquear a transcendência.
                </div>
              `}
            </div>
          </div>
        ` : `
          <div class="p-6 bg-[#0c0507] border border-[#e21b23] text-center text-xs font-mono text-[#ff555d]">
            [ ALERTA ] Selecione duas emoções diferentes para calcular o arquétipo de fusão.
          </div>
        `}

        <!-- Catálogo de Todas as 45 Fusões -->
        <div class="border-t border-[#1b202d] pt-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="text-[10px] font-mono uppercase text-[#8e95a5] block font-bold">// CÓDICE COMPLETO</span>
              <h4 class="text-base sm:text-lg font-serif font-black text-white">Catálogo das 45 Fusões do Avesso</h4>
            </div>
            <input type="text" id="fusion-search" value="${this.searchQuery}" placeholder="Filtrar por nome ou emoção (ex: Rancor + Vazio)..." 
                   class="bg-[#000] border border-[#222736] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#e21b23] w-full sm:w-80 placeholder-white/30" />
          </div>

          <!-- Grade das 45 Fusões com content-visibility para alta performance no celular -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${filteredFusions.map(f => `
              <div class="bg-[#050608] border border-[#1b202d] hover:border-[#e21b23] p-3.5 space-y-2 transition-all cursor-pointer group fusion-card-item rounded-xs" 
                   data-id="${f.archId}"
                   style="content-visibility: auto; contain-intrinsic-size: 0 110px;">
                
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-sm font-serif font-black text-white group-hover:text-[#e21b23] transition-colors leading-tight">
                    ${f.name}
                  </h4>
                  <span class="text-[9px] font-mono text-[#06b6d4] uppercase font-bold border border-[#06b6d4]/30 px-1.5 py-0.5 bg-[#080d16] flex-shrink-0">
                    ${f.pairing}
                  </span>
                </div>

                <p class="text-xs text-[#8e95a5] font-liturgical italic leading-relaxed line-clamp-2">
                  ${f.desc}
                </p>

                <div class="text-[11px] font-mono text-[#cbd5e1] pt-1.5 border-t border-[#141824] flex items-center justify-between">
                  <span class="text-[#8e95a5] text-[10px]">${f.level1.activation}</span>
                  <span class="text-[10px] text-[#e21b23] group-hover:underline font-bold">[ VER DETALHES → ]</span>
                </div>

              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    this.container.querySelector('#matrix-primary-select')?.addEventListener('change', (e) => {
      this.primaryEmo = e.target.value;
      this.render();
    });

    this.container.querySelector('#matrix-secondary-select')?.addEventListener('change', (e) => {
      this.secondaryEmo = e.target.value;
      this.render();
    });

    // Clique em qualquer card de fusão navega direto para o arquétipo
    this.container.querySelectorAll('.fusion-card-item, .goto-archetype-btn').forEach(card => {
      card.addEventListener('click', (e) => {
        const archId = card.getAttribute('data-id');
        if (archId && window.ParoxismoApp) {
          soundFX.playRuneClick();
          window.ParoxismoApp.navigateTo('arquetipos', { id: archId });
        }
      });
    });

    const searchInput = this.container.querySelector('#fusion-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
        const updatedInput = this.container.querySelector('#fusion-search');
        if (updatedInput) {
          updatedInput.focus();
          updatedInput.setSelectionRange(updatedInput.value.length, updatedInput.value.length);
        }
      });
    }
  }
}

