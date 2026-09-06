/**
 * PAROXISMO - SRD COMPENDIUM
 * Componente: Matriz de Fusões Híbridas (45 Combinações de Emoções)
 * 100% Livre de Emojis
 */

import { EMOTIONS_DATA, HYBRID_FUSIONS } from '../data/emotions.js';

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

  getCurrentFusion() {
    if (this.primaryEmo === this.secondaryEmo) return null;
    return HYBRID_FUSIONS.find(f => 
      (f.e1 === this.primaryEmo && f.e2 === this.secondaryEmo) ||
      (f.e1 === this.secondaryEmo && f.e2 === this.primaryEmo)
    );
  }

  render() {
    const currentFusion = this.getCurrentFusion();
    const pEmo = EMOTIONS_DATA.find(e => e.id === this.primaryEmo) || EMOTIONS_DATA[0];
    const sEmo = EMOTIONS_DATA.find(e => e.id === this.secondaryEmo) || EMOTIONS_DATA[1];

    const filteredFusions = HYBRID_FUSIONS.filter(f => {
      if (this.searchQuery.trim() === "") return true;
      const q = this.searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || 
             f.sub.toLowerCase().includes(q) || 
             f.resonance.toLowerCase().includes(q) ||
             f.manifestation.toLowerCase().includes(q);
    });

    this.container.innerHTML = `
      <div class="gothic-box p-6 space-y-6">
        
        <div class="border-b border-[#1b202d] pb-3 flex items-center justify-between">
          <div>
            <span class="rune-tag-gold block">Despertar Duplo</span>
            <h2 class="text-xl font-serif font-black text-white">Calculadora das 45 Fusões Híbridas</h2>
          </div>
          <span class="text-xs font-mono text-[#64748b]">[ 1 DOMINANTE + 1 LATENTE ]</span>
        </div>

        <!-- Seletores de Emoções -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-[#050608] border border-[#1b202d] p-3.5 space-y-2">
            <span class="text-[10px] font-mono uppercase text-[#d4af37] font-bold block">1. Emoção Dominante (Primária)</span>
            <select id="matrix-primary-select" class="w-full bg-[#000] border border-[#222736] px-3 py-2 text-xs font-serif text-white focus:border-[#d4af37] focus:outline-none">
              ${EMOTIONS_DATA.map(e => `
                <option value="${e.id}" ${e.id === this.primaryEmo ? 'selected' : ''}>${e.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="bg-[#050608] border border-[#1b202d] p-3.5 space-y-2">
            <span class="text-[10px] font-mono uppercase text-[#d4af37] font-bold block">2. Emoção Latente (Secundária)</span>
            <select id="matrix-secondary-select" class="w-full bg-[#000] border border-[#222736] px-3 py-2 text-xs font-serif text-white focus:border-[#d4af37] focus:outline-none">
              ${EMOTIONS_DATA.map(e => `
                <option value="${e.id}" ${e.id === this.secondaryEmo ? 'selected' : ''}>${e.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Resultado da Fusão -->
        ${currentFusion ? `
          <div class="bg-[#07090f] border-2 border-[#d4af37] p-6 space-y-4 shadow-xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b202d] pb-3">
              <div>
                <span class="text-[9px] font-mono uppercase text-[#d4af37] tracking-widest block">Arquétipo Híbrido Resultante</span>
                <h3 class="text-2xl font-serif font-black text-white">${currentFusion.name}</h3>
                <span class="text-xs font-serif italic text-[#cbd5e1]">${currentFusion.sub}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 bg-[#000] border border-[#222736] text-[10px] font-mono text-white">
                  ${pEmo.name.replace("O ", "").replace("A ", "")} + ${sEmo.name.replace("O ", "").replace("A ", "")}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="bg-[#050608] border border-[#181d2a] p-3">
                <span class="text-[9px] font-mono uppercase text-rose-400 font-bold block mb-1">Manifestação Visual:</span>
                <p class="text-[#cbd5e1] font-serif leading-relaxed">${currentFusion.manifestation}</p>
              </div>

              <div class="bg-[#050608] border border-[#181d2a] p-3">
                <span class="text-[9px] font-mono uppercase text-[#d4af37] font-bold block mb-1">Ressonância Mecânica:</span>
                <p class="text-[#cbd5e1] font-serif leading-relaxed">${currentFusion.resonance}</p>
              </div>
            </div>
          </div>
        ` : `
          <div class="p-6 bg-[#0c0507] border border-rose-900 text-center text-xs font-serif text-rose-300">
            Selecione duas emoções diferentes para calcular o arquétipo de fusão.
          </div>
        `}

        <!-- Catálogo de Todas as 45 Fusões -->
        <div class="border-t border-[#1b202d] pt-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span class="rune-tag-gold block">Compêndio Completo (45 Fusões)</span>
            <input type="text" id="fusion-search" value="${this.searchQuery}" placeholder="Filtrar fusões por nome..." 
                   class="bg-[#000] border border-[#222736] px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37] w-full sm:w-64" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${filteredFusions.map(f => `
              <div class="bg-[#050608] border border-[#1b202d] p-3.5 space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-serif font-bold text-white">${f.name}</h4>
                  <span class="text-[9px] font-mono text-[#d4af37] uppercase">${f.sub}</span>
                </div>
                <p class="text-[11px] text-[#94a3b8] font-serif leading-relaxed line-clamp-2">${f.manifestation}</p>
                <div class="text-[10px] font-mono text-emerald-400 pt-1 border-t border-[#141824]">
                  ${f.resonance}
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
