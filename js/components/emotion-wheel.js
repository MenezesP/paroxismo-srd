/**
 * PAROXISMO - SRD COMPENDIUM
 * Componente: Arena Orbital das 10 Emoções (Estilo Inscryption / Roguelike Deckbuilder)
 * Mecânica: Cartas físicas em órbita elíptica 3D ao redor do Abismo do Avesso com rotação dinâmica ao clicar.
 */

import { EMOTIONS_DATA, ELEMENTAL_CONDITIONS } from '../data/emotions.js';
import { soundFX } from '../utils/sound-fx.js';

export class EmotionWheel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedEmotionId = 'rancor';
    this.currentRotation = 90; // 90° posiciona o índice 0 na frente (centro inferior)
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  selectEmotion(id, playSound = true) {
    if (playSound) soundFX.playRuneClick();
    
    const targetIdx = EMOTIONS_DATA.findIndex(e => e.id === id);
    if (targetIdx === -1) return;

    // Calcula a rotação necessária para que a carta targetIdx vá para a posição frontal (90°)
    const targetRotation = 90 - (targetIdx * 36);

    // Calcula o menor caminho angular (delta entre -180° e +180°)
    let diff = (targetRotation - this.currentRotation) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    this.currentRotation += diff;
    this.selectedEmotionId = id;

    this.updateCardPositions();
    this.updateCenterChasm();
    this.updateDetailsPanel();
  }

  spinStep(direction = 1) {
    const currentIdx = EMOTIONS_DATA.findIndex(e => e.id === this.selectedEmotionId);
    let nextIdx = (currentIdx + direction) % EMOTIONS_DATA.length;
    if (nextIdx < 0) nextIdx += EMOTIONS_DATA.length;
    this.selectEmotion(EMOTIONS_DATA[nextIdx].id, true);
  }

  updateCardPositions() {
    const arena = document.getElementById('orbital-arena');
    if (!arena) return;

    const cards = arena.querySelectorAll('.orbital-emotion-card');
    if (!cards || cards.length === 0) return;

    // Mede a largura real do contêiner ou calcula com base na viewport (evita bug de initial render com 0px)
    const winWidth = window.innerWidth || 1200;
    const isDesktop = winWidth >= 1024;
    const isMobile = winWidth < 640;
    const isTiny = winWidth < 380;

    let arenaWidth = arena.clientWidth;
    if (!arenaWidth || arenaWidth <= 0) {
      arenaWidth = isDesktop ? 580 : Math.max(280, Math.min(winWidth - 32, 580));
    }

    // Dimensões responsivas do cartão
    const cardW = isTiny ? 56 : (isMobile ? 60 : 84);
    const cardH = isTiny ? 76 : (isMobile ? 80 : 108);

    // Centro da elipse
    const cx = (arenaWidth / 2) - (cardW / 2);
    const cy = isTiny ? 112 : (isMobile ? 122 : 166);

    // Raios da elipse responsivos (nunca deixa os cartões vazarem para fora da tela)
    const maxAllowedRadiusX = (arenaWidth / 2) - (cardW / 2) - 8;
    const rx = isMobile ? Math.min(maxAllowedRadiusX, isTiny ? 116 : 130) : 210;
    const ry = isTiny ? 60 : (isMobile ? 68 : 125);

    cards.forEach(card => {
      const idx = parseInt(card.getAttribute('data-idx'));
      const emoId = card.getAttribute('data-id');
      const isActive = emoId === this.selectedEmotionId;

      // Ângulo da carta em graus e radianos
      const thetaDeg = (idx * 36) + this.currentRotation;
      const rad = thetaDeg * (Math.PI / 180);

      // Posição na elipse
      const x = cx + rx * Math.cos(rad);
      const y = cy + ry * Math.sin(rad);

      // Fator de profundidade: 0 (fundo/topo) a 1 (frente/baixo)
      const depth = (Math.sin(rad) + 1) / 2;
      const minScale = isMobile ? 0.65 : 0.72;
      const scaleRange = isMobile ? 0.30 : 0.38;
      const baseScale = minScale + (scaleRange * depth);
      const activeMult = isMobile ? 1.15 : 1.22;
      const scale = isActive ? (baseScale * activeMult) : baseScale;
      const opacity = 0.40 + (0.60 * depth);
      const zIndex = Math.round(depth * 30) + (isActive ? 60 : 0);
      const brightness = 0.65 + (0.35 * depth);

      card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(2);
      card.style.zIndex = zIndex;
      card.style.filter = `brightness(${brightness.toFixed(2)})`;

      if (isActive) {
        card.classList.add('active-focus');
      } else {
        card.classList.remove('active-focus');
      }
    });
  }

  updateCenterChasm() {
    const chasm = document.getElementById('orbital-chasm');
    if (!chasm) return;

    const selected = EMOTIONS_DATA.find(e => e.id === this.selectedEmotionId) || EMOTIONS_DATA[0];

    chasm.innerHTML = `
      <div class="space-y-0.5 sm:space-y-1 select-none pointer-events-none px-2 sm:px-4">
        <span class="text-[8px] sm:text-[9px] font-mono text-[#e21b23] uppercase tracking-widest font-black block animate-pulse">
          [ ABISMO DO AVESSO ]
        </span>
        <h4 class="text-base sm:text-lg font-serif font-black text-white tracking-wider truncate">
          ${selected.name.toUpperCase()}
        </h4>
        <div class="text-[9.5px] sm:text-[11px] font-mono space-y-0.5 pt-0.5">
          <div class="text-[#cbd0dc]">Vence: <strong class="text-white">${selected.beatsName}</strong></div>
          <div class="text-[#ff333d]">Vulnerável: <strong class="text-[#ff333d]">${selected.vulnerableToName}</strong></div>
        </div>
        <span class="text-[7.5px] sm:text-[8px] font-mono text-[#8e95a5] block pt-0.5 tracking-wider uppercase font-bold">
          VANTAGEM: +1d6 DANO • CD -2
        </span>
      </div>
    `;
  }

  updateDetailsPanel() {
    const panel = document.getElementById('emotion-details-panel');
    if (!panel) return;

    const selected = EMOTIONS_DATA.find(e => e.id === this.selectedEmotionId) || EMOTIONS_DATA[0];

    panel.innerHTML = `
      <div class="p-4 bg-[#000000] border-2 border-[#ff1e27] shadow-[0_0_20px_rgba(255,30,39,0.3)]">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <img src="${selected.iconUrl}" class="w-12 sm:w-14 h-12 sm:h-14 object-contain p-1.5 bg-[#0b0507] border border-[#ff1e27]/50 rounded-lg filter drop-shadow-[0_0_15px_rgba(226,27,35,0.6)]" alt="${selected.name}" />
            <div>
              <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#ff1e27] font-bold block">[ EMOÇÃO EM FOCO FRONTAL ]</span>
              <h3 class="text-2xl sm:text-3xl font-serif font-black text-white">${selected.name}</h3>
            </div>
          </div>
          <span class="text-[11px] sm:text-xs font-mono font-black px-2.5 py-1 bg-[#ff1e27] text-[#000000] self-start sm:self-auto whitespace-nowrap">
            ${selected.dmgType.toUpperCase()}
          </span>
        </div>
        <p class="text-xs text-[#ffffff] font-serif italic mt-2.5 leading-relaxed">
          "${selected.subtitles}"
        </p>
      </div>

      <!-- Relação Tática de Vantagem / Vulnerabilidade -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div class="p-3 bg-[#000000] border-2 border-[#ffffff]">
          <span class="text-[10px] uppercase text-[#ffffff] font-bold block mb-1">Subjuga / Vence:</span>
          <span class="font-serif font-black text-[#ffffff] text-sm">${selected.beatsName}</span>
          <span class="text-[10px] text-[#888888] block mt-1">${selected.logic.split(';')[0]}</span>
        </div>

        <div class="p-3 bg-[#000000] border-2 border-[#ff1e27] shadow-[0_0_15px_rgba(255,30,39,0.2)]">
          <span class="text-[10px] uppercase text-[#ff1e27] font-bold block mb-1">É Vulnerável a:</span>
          <span class="font-serif font-black text-[#ff1e27] text-sm">${selected.vulnerableToName}</span>
          <span class="text-[10px] text-[#ff1e27] block mt-1">${selected.logic.split(';')[1] || selected.logic}</span>
        </div>
      </div>

      <!-- Especificações Elementais -->
      <div class="bg-[#000000] border border-[#ffffff] p-3 text-xs space-y-2 font-mono">
        <div><strong class="text-[#ff1e27]">Arma Manifestada:</strong> <span class="text-white">${selected.weaponManifest}</span></div>
        <div><strong class="text-[#ff1e27]">Ritual Nativo:</strong> <span class="text-white font-bold">${selected.nativeRitual}</span></div>
        <div><strong class="text-[#ff1e27]">Estilo de Jogo:</strong> <span class="text-white">${selected.playstyle}</span></div>
      </div>

      <button onclick="window.ParoxismoApp.navigateTo('grimorio', { emotion: '${selected.id}' })" class="w-full btn-nadir-red text-center block">
        [ CONSULTAR RITUAIS DE ${selected.name.toUpperCase()} → ]
      </button>
    `;
  }

  render() {
    const selected = EMOTIONS_DATA.find(e => e.id === this.selectedEmotionId) || EMOTIONS_DATA[0];

    this.container.innerHTML = `
      <div class="nadir-frame p-6 space-y-6">
        
        <!-- Cabeçalho com Botões de Giro Manual -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#ff1e27] pb-3">
          <div>
            <span class="text-xs font-mono font-bold text-[#ff1e27] uppercase block">[ CICLO DECAGONAL // ARENA ORBITAL ]</span>
            <h2 class="text-xl font-serif font-black text-white">A Roda das 10 Emoções</h2>
          </div>

          <div class="flex items-center gap-2">
            <button id="spin-prev-btn" class="orbital-spin-btn" title="Girar para a Emoção Anterior">
              [ ◀ GIRAR ESQUERDA ]
            </button>
            <button id="spin-next-btn" class="orbital-spin-btn" title="Girar para a Próxima Emoção">
              [ GIRAR DIREITA ▶ ]
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Coluna Esquerda: Arena Orbital 3D de Cartas Físicas -->
          <div class="lg:col-span-6 flex flex-col items-center justify-center relative">
            
            <div class="orbital-arena-container" id="orbital-arena">
              
              <!-- O Abismo Central (Fosso do Avesso com Névoa e Dados) -->
              <div class="orbital-abyss-chasm" id="orbital-chasm">
                <!-- Preenchido dinamicamente por updateCenterChasm() -->
              </div>

              <!-- As 10 Cartas Físicas da Órbita -->
              ${EMOTIONS_DATA.map((emo, idx) => `
                <div class="orbital-emotion-card ${emo.id === selected.id ? 'active-focus' : ''}" 
                     data-id="${emo.id}" data-idx="${idx}" title="Clique para girar para ${emo.name}">
                  <span class="orbital-card-bracket bracket-tl">⌜</span>
                  <span class="orbital-card-bracket bracket-tr">⌝</span>
                  <span class="orbital-card-bracket bracket-bl">⌞</span>
                  <span class="orbital-card-bracket bracket-br">⌟</span>

                  <!-- Topo da Carta -->
                  <div class="flex items-center justify-between text-[8px] font-mono leading-none">
                    <span class="font-bold text-[#8e95a5]">#0${idx + 1}</span>
                    <span class="text-[7px] font-mono uppercase px-1 py-0.2 rounded" style="color: ${emo.color}; border: 1px solid ${emo.color}40;">
                      ${emo.id.substring(0, 3)}
                    </span>
                  </div>

                  <!-- Centro: Imagem Oficial da Emoção sem Fundo -->
                  <div class="flex items-center justify-center py-0.5">
                    <img src="${emo.iconUrl}" class="w-11 h-11 object-contain filter drop-shadow-[0_0_10px_rgba(226,27,35,0.7)]" alt="${emo.name}" />
                  </div>

                  <!-- Base da Carta: Nome em Destaque -->
                  <div class="text-center border-t border-[#1a202e] pt-1">
                    <span class="text-[9px] font-serif font-black tracking-wider uppercase block truncate text-white">
                      ${emo.name.replace('O ', '').replace('A ', '')}
                    </span>
                  </div>
                </div>
              `).join('')}

            </div>

            <!-- Dica Tática de Navegação -->
            <div class="flex items-center gap-4 text-xs font-mono mt-3 font-bold">
              <span class="text-[#8e95a5] italic">Clique em qualquer carta da órbita para girar a roda até ela</span>
            </div>

          </div>

          <!-- Coluna Direita: Painel de Detalhes da Emoção Selecionada -->
          <div class="lg:col-span-6 space-y-4" id="emotion-details-panel">
            <!-- Preenchido dinamicamente por updateDetailsPanel() -->
          </div>

        </div>

      </div>
    `;

    // Posiciona as cartas e preenche os painéis
    this.updateCardPositions();
    this.updateCenterChasm();
    this.updateDetailsPanel();

    // Eventos: Clique nas cartas para girar a roda até a carta clicada
    this.container.querySelectorAll('.orbital-emotion-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        this.selectEmotion(id, true);
      });
    });

    // Eventos: Botões táteis de giro manual
    this.container.querySelector('#spin-prev-btn')?.addEventListener('click', () => this.spinStep(-1));
    this.container.querySelector('#spin-next-btn')?.addEventListener('click', () => this.spinStep(1));

    // Suporte a giro com scroll do mouse e toque/swipe no celular
    const arenaEl = this.container.querySelector('#orbital-arena');
    if (arenaEl) {
      let touchStartX = 0;
      let touchStartY = 0;

      arenaEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      arenaEl.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          const diffX = e.changedTouches[0].clientX - touchStartX;
          const diffY = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0) {
              this.spinStep(1); // Swipe esquerda -> gira para próxima emoção
            } else {
              this.spinStep(-1); // Swipe direita -> gira para emoção anterior
            }
          }
        }
      }, { passive: true });

      arenaEl.addEventListener('wheel', (e) => {
        e.preventDefault();
        const dir = e.deltaY > 0 ? 1 : -1;
        this.spinStep(dir);
      }, { passive: false });
    }

    // Recalcula posições das cartas ao redimensionar a tela
    window.addEventListener('resize', () => {
      this.updateCardPositions();
    });

    // Observa redimensionamento direto do contêiner e garante cálculo no frame de layout
    if (window.ResizeObserver && arenaEl) {
      if (this.resizeObserver) this.resizeObserver.disconnect();
      this.resizeObserver = new ResizeObserver(() => {
        this.updateCardPositions();
      });
      this.resizeObserver.observe(arenaEl);
    }

    requestAnimationFrame(() => this.updateCardPositions());
    setTimeout(() => this.updateCardPositions(), 50);
  }
}
