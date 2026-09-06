/**
 * PAROXISMO - SRD COMPENDIUM
 * Componente: Rolador de Dados Virtuais & Gerador de Surtos/Cicatrizes (Sistema d20)
 * 100% Livre de Emojis
 */

import { RULES_DATA } from '../data/rules.js';
import { DiceAnimator } from '../utils/dice-animator.js?v=phys_v12';

export class DiceRoller {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.history = [];
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  roll(sides, modifier = 0, label = "Rolagem") {
    DiceAnimator.roll({
      sides,
      label: label || `d${sides}`
    }).then(({ rolledValue, isCrit, isFumble }) => {
      const total = rolledValue + modifier;
      const rollEntry = {
        id: Date.now(),
        sides,
        roll: rolledValue,
        modifier,
        total,
        label,
        isCrit,
        isFumble,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      this.history.unshift(rollEntry);
      if (this.history.length > 15) this.history.pop();
      this.render();
    });
  }

  rollSurge() {
    DiceAnimator.roll({
      sides: 20,
      label: `SURTO EMOCIONAL`
    }).then(({ rolledValue, isCrit, isFumble }) => {
      const surge = RULES_DATA.emotionalSurgesTable.find(s => s.d20 === rolledValue) || RULES_DATA.emotionalSurgesTable[0];
      this.history.unshift({
        id: Date.now(),
        sides: 20,
        roll: rolledValue,
        modifier: 0,
        total: rolledValue,
        label: `SURTO EMOCIONAL (d20 = ${rolledValue}): ${surge.title}`,
        extraText: surge.effect,
        isCrit,
        isFumble,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      if (this.history.length > 15) this.history.pop();
      this.render();
    });
  }

  rollScar() {
    DiceAnimator.roll({
      sides: 20,
      label: `CICATRIZ DO ESTRONDO`
    }).then(({ rolledValue, isCrit, isFumble }) => {
      const scar = RULES_DATA.scarsOfTheEstrondoTable.find(s => s.d20 === rolledValue) || RULES_DATA.scarsOfTheEstrondoTable[0];
      this.history.unshift({
        id: Date.now(),
        sides: 20,
        roll: rolledValue,
        modifier: 0,
        total: rolledValue,
        label: `CICATRIZ DO ESTRONDO (d20 = ${rolledValue}): ${scar.title}`,
        extraText: scar.effect,
        isCrit,
        isFumble,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      if (this.history.length > 15) this.history.pop();
      this.render();
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="space-y-5 text-xs font-mono">
        
        <!-- Dados Rápidos -->
        <div class="space-y-2">
          <span class="rune-tag-gold block">Dados Poliédricos</span>
          <div class="grid grid-cols-3 gap-2">
            ${[4, 6, 8, 10, 12, 20, 100].map(d => `
              <button class="roll-quick-btn py-2 bg-[#000] hover:bg-[#121622] border border-[#222736] hover:border-[#d4af37] text-white font-bold transition-all text-xs" data-sides="${d}">
                d${d}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Roladores Especiais de Tabelas do Avesso -->
        <div class="space-y-2 border-t border-[#181d2a] pt-3">
          <span class="rune-tag-red block">Tabelas Dinâmicas (1d20)</span>
          <div class="space-y-1.5">
            <button id="roll-surge-btn" class="w-full py-2 bg-[#120507] hover:bg-[#20090d] border border-rose-900 text-rose-300 font-bold transition-all text-left px-3 flex items-center justify-between">
              <span>Rolar Surto Emocional</span>
              <span>[ 1d20 ]</span>
            </button>
            <button id="roll-scar-btn" class="w-full py-2 bg-[#090b14] hover:bg-[#121828] border border-sky-900 text-sky-300 font-bold transition-all text-left px-3 flex items-center justify-between">
              <span>Rolar Cicatriz do Estrondo</span>
              <span>[ 1d20 ]</span>
            </button>
          </div>
        </div>

        <!-- Histórico de Rolagens -->
        <div class="space-y-2 border-t border-[#181d2a] pt-3">
          <div class="flex items-center justify-between">
            <span class="rune-tag-gold block">Registro de Sorte</span>
            ${this.history.length > 0 ? `
              <button id="clear-dice-history" class="text-[10px] text-[#64748b] hover:text-white">[ Limpar ]</button>
            ` : ''}
          </div>

          <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
            ${this.history.length === 0 ? `
              <div class="p-4 text-center text-[#64748b] font-serif italic bg-[#000] border border-[#1b202d]">
                Nenhuma rolagem efetuada nesta sessão.
              </div>
            ` : this.history.map(item => `
              <div class="p-2.5 bg-[#000] border ${item.isCrit ? 'border-amber-500' : item.isFumble ? 'border-rose-600' : 'border-[#1b202d]'}">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[10px] text-[#94a3b8] truncate max-w-[200px] font-bold">${item.label}</span>
                  <span class="text-[9px] text-[#64748b]">${item.timestamp}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-base font-black ${item.isCrit ? 'text-amber-400' : item.isFumble ? 'text-rose-500' : 'text-white'}">
                    ${item.total}
                  </span>
                  <span class="text-[10px] text-[#64748b]">d${item.sides}: ${item.roll} ${item.modifier ? `(${item.modifier > 0 ? '+' : ''}${item.modifier})` : ''}</span>
                </div>
                ${item.extraText ? `
                  <p class="text-[10px] text-[#cbd5e1] font-serif italic mt-1 pt-1 border-t border-[#1a1f2b] leading-tight">
                    ${item.extraText}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    this.container.querySelectorAll('.roll-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sides = parseInt(btn.getAttribute('data-sides'));
        this.roll(sides, 0, `Rolagem d${sides}`);
      });
    });

    this.container.querySelector('#roll-surge-btn')?.addEventListener('click', () => this.rollSurge());
    this.container.querySelector('#roll-scar-btn')?.addEventListener('click', () => this.rollScar());
    this.container.querySelector('#clear-dice-history')?.addEventListener('click', () => {
      this.history = [];
      this.render();
    });
  }
}
