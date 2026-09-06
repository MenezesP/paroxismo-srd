/**
 * PAROXISMO — ROTARY SELECTION WHEEL CONTROLLER
 * Interface de Roda de Seleção de Jogo Dinâmica e Rotativa
 * Inspirada em menus radiais de seleção de armas/habilidades e astrolábios rúnicos
 */

import { soundFX } from '../utils/sound-fx.js';

export class RotaryWheel {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.track = document.getElementById('rotary-nodes-track');
    this.dialSvg = document.getElementById('rotary-dial-svg');
    this.prevBtn = document.getElementById('rotary-prev-btn');
    this.nextBtn = document.getElementById('rotary-next-btn');

    this.onSelect = options.onSelect || (() => {});
    this.isGmActive = options.isGmActive || false;

    // Elementos da Gaveta Retrátil (Mobile / Desktop)
    this.backdrop = document.getElementById('rotary-backdrop');
    this.drawerToggleBtn = document.getElementById('rotary-drawer-toggle-btn');
    this.drawerBadge = document.getElementById('rotary-drawer-badge');
    this.drawerLabel = document.getElementById('rotary-drawer-label');
    this.drawerArrow = document.getElementById('rotary-drawer-arrow');
    
    // No celular (< 1024px) inicia recolhido para não tampar a visão
    this.isCollapsed = window.innerWidth < 1024;

    this.baseItems = [
      { id: 'home', num: '00', label: 'CÓDICE' },
      { id: 'regras', num: 'I', label: 'O TECIDO' },
      { id: 'classes', num: 'II', label: 'A CARNE' },
      { id: 'pericias', num: 'III', label: 'A TÉCNICA' },
      { id: 'emocoes', num: 'IV', label: 'O ABISMO' },
      { id: 'arquetipos', num: 'V', label: 'ARQUÉTIPOS' },
      { id: 'criacao', num: 'VI', label: 'A FORJA' },
      { id: 'grimorio', num: 'VII', label: 'GRIMÓRIO' },
      { id: 'ficha', num: 'VIII', label: 'O DOSSIER' }
    ];

    this.gmItems = [
      { id: 'bestiario', num: 'IX', label: 'AMEAÇAS', isGm: true },
      { id: 'aventura', num: 'X', label: 'O ESTRONDO', isGm: true }
    ];

    this.items = [...this.baseItems];
    if (this.isGmActive) {
      this.items.push(...this.gmItems);
    }

    this.activeIndex = 0;
    this.isRotating = false;

    // Configurações Geométricas do MEIO CÍRCULO (Arco lateral esquerdo)
    this.radius = 175;
    this.centerX = 15;
    this.centerY = 280;
    this.angleStepDeg = 28; // Ângulo entre opções na borda do meio círculo

    this.init();
  }

  init() {
    this.renderNodes();
    this.updateLayout(false);
    this.applyDrawerState();
    this.setupEventListeners();
  }

  toggleDrawer(forceClose = null) {
    if (forceClose !== null) {
      this.isCollapsed = forceClose;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
    this.applyDrawerState();
    soundFX.playRuneClick();
  }

  applyDrawerState() {
    if (window.innerWidth >= 1024) {
      this.container?.classList.remove('collapsed');
      this.backdrop?.classList.remove('active');
      return;
    }

    if (this.isCollapsed) {
      this.container?.classList.add('collapsed');
      this.backdrop?.classList.remove('active');
      if (this.drawerLabel) this.drawerLabel.textContent = 'MENU';
      if (this.drawerArrow) this.drawerArrow.textContent = '❯';
    } else {
      this.container?.classList.remove('collapsed');
      this.backdrop?.classList.add('active');
      if (this.drawerLabel) this.drawerLabel.textContent = 'FECHAR';
      if (this.drawerArrow) this.drawerArrow.textContent = '❮';
    }
  }

  setGmMode(active) {
    this.isGmActive = active;
    const currentId = this.items[this.activeIndex]?.id || 'home';
    this.items = [...this.baseItems];
    if (active) {
      this.items.push(...this.gmItems);
    }
    this.renderNodes();
    this.setActiveTab(currentId, false);
  }

  renderNodes() {
    if (!this.track) return;
    this.track.innerHTML = '';

    this.items.forEach((item, idx) => {
      const nodeEl = document.createElement('div');
      nodeEl.className = 'rotary-node';
      nodeEl.setAttribute('data-id', item.id);
      nodeEl.setAttribute('data-index', idx);

      const gmClass = item.isGm ? 'text-[#e21b23] border-[#e21b23]' : '';

      nodeEl.innerHTML = `
        <div class="rotary-node-medallion ${gmClass}">
          <span class="font-mono font-bold text-xs">${item.num}</span>
        </div>
        <span class="rotary-node-label ${gmClass}">${item.label}</span>
      `;

      nodeEl.addEventListener('click', () => {
        this.rotateToIndex(idx);
      });

      this.track.appendChild(nodeEl);
    });
  }

  setupEventListeners() {
    // Botão Gaveta para Puxar / Esconder a Roda
    this.drawerToggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDrawer();
    });

    // Backdrop Escuro (Fecha a Gaveta no Celular ao Clicar Fora)
    this.backdrop?.addEventListener('click', () => {
      this.toggleDrawer(true);
    });

    // Ajuste ao redimensionar tela
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth < 1024;
      if (!isMobile && this.isCollapsed) {
        this.isCollapsed = false;
        this.applyDrawerState();
      }
    });

    // Botões de rotação
    this.prevBtn?.addEventListener('click', () => this.rotate(-1));
    this.nextBtn?.addEventListener('click', () => this.rotate(1));

    // Scroll do mouse sobre a roda ("Roda de Opções")
    let wheelCooldown = false;
    this.container?.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (wheelCooldown) return;
      wheelCooldown = true;
      setTimeout(() => { wheelCooldown = false; }, 180);

      if (e.deltaY > 0) {
        this.rotate(1);
      } else if (e.deltaY < 0) {
        this.rotate(-1);
      }
    }, { passive: false });

    // Arraste vertical (Mouse Drag & Touch Swipe)
    let startY = 0;
    let startX = 0;
    let isDragging = false;

    const startDrag = (clientX, clientY) => {
      // Se no celular a roda estiver recolhida, JAMAIS inicia o arraste da roda
      if (window.innerWidth < 1024 && this.isCollapsed) {
        return;
      }
      startX = clientX;
      startY = clientY;
      isDragging = true;
    };

    const moveDrag = (clientX, clientY) => {
      if (!isDragging) return;
      const diffY = clientY - startY;
      const diffX = clientX - startX;

      // Se no celular arrastar expressivamente para a esquerda, fecha a gaveta
      if (window.innerWidth < 1024 && !this.isCollapsed && diffX < -45 && Math.abs(diffX) > Math.abs(diffY)) {
        isDragging = false;
        this.toggleDrawer(true);
        return;
      }

      if (Math.abs(diffY) > 35) {
        if (diffY < 0) {
          this.rotate(1);
        } else {
          this.rotate(-1);
        }
        startY = clientY;
      }
    };

    const endDrag = () => {
      isDragging = false;
    };

    this.container?.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', endDrag);

    this.container?.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    window.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    window.addEventListener('touchend', endDrag);

    // Teclado (Setas para cima e para baixo quando a roda estiver em foco)
    window.addEventListener('keydown', (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.rotate(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.rotate(-1);
      }
    });
  }

  rotate(direction) {
    const newIndex = this.activeIndex + direction;
    if (newIndex >= 0 && newIndex < this.items.length) {
      soundFX.playRuneClick();
      this.rotateToIndex(newIndex);
    }
  }

  rotateToIndex(targetIndex) {
    if (targetIndex < 0 || targetIndex >= this.items.length) return;

    const prevIndex = this.activeIndex;
    this.activeIndex = targetIndex;

    this.updateLayout(true);

    if (prevIndex !== targetIndex) {
      soundFX.playChapterTransition();
      const selected = this.items[this.activeIndex];
      if (selected) {
        // Desacopla o render da página do início da animação para garantir 60 FPS
        requestAnimationFrame(() => {
          this.onSelect(selected.id);
        });
      }
    }

    // Se estiver no celular (< 1024px), fecha a gaveta automaticamente após selecionar a opção
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        this.toggleDrawer(true);
      }, 150);
    }
  }

  setActiveTab(tabId, triggerCallback = false) {
    const idx = this.items.findIndex(item => item.id === tabId);
    if (idx !== -1 && idx !== this.activeIndex) {
      this.activeIndex = idx;
      this.updateLayout(true);
      if (triggerCallback) {
        this.onSelect(tabId);
      }
    }
  }

  updateLayout(animate = true) {
    const nodeElements = this.track?.querySelectorAll('.rotary-node');
    if (!nodeElements) return;

    // Atualiza deslocamento sutil do arco do meio círculo
    if (this.dialSvg) {
      const dialOffset = (this.activeIndex - 3) * 2;
      this.dialSvg.style.transform = `translateY(${dialOffset}px)`;
    }

    nodeElements.forEach((nodeEl, idx) => {
      const delta = idx - this.activeIndex;
      const angleDeg = delta * this.angleStepDeg;
      const angleRad = (angleDeg * Math.PI) / 180;

      // Coordenadas polares em torno de (centerX, centerY)
      const x = this.centerX + this.radius * Math.cos(angleRad);
      const y = this.centerY + this.radius * Math.sin(angleRad);

      const absDelta = Math.abs(delta);

      let scale = 1;
      let opacity = 1;
      let zIndex = 1;

      if (delta === 0) {
        nodeEl.classList.add('active');
        scale = 1.25;
        opacity = 1.0;
        zIndex = 10;
      } else {
        nodeEl.classList.remove('active');
        if (absDelta === 1) {
          scale = 0.95;
          opacity = 0.85;
          zIndex = 7;
        } else if (absDelta === 2) {
          scale = 0.80;
          opacity = 0.60;
          zIndex = 5;
        } else if (absDelta === 3) {
          scale = 0.68;
          opacity = 0.35;
          zIndex = 3;
        } else {
          scale = 0.55;
          opacity = 0.15;
          zIndex = 1;
        }
      }

      nodeEl.style.left = `${Math.round(x)}px`;
      nodeEl.style.top = `${Math.round(y)}px`;
      nodeEl.style.opacity = `${opacity}`;
      nodeEl.style.zIndex = `${zIndex}`;
      nodeEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
      nodeEl.style.pointerEvents = absDelta > 4 ? 'none' : 'auto';
    });

    // Atualiza o indicador numérico no botão da gaveta
    if (this.drawerBadge && this.items[this.activeIndex]) {
      this.drawerBadge.textContent = this.items[this.activeIndex].num;
    }
  }
}
