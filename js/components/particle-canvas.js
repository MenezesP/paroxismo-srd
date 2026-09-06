/**
 * PAROXISMO - AAA ATMOSPHERIC PARTICLE & SMOKE ENGINE
 * Renderiza névoa volumétrica e fuligem cósmica em suspensão a 60fps (Z-Index 0)
 * Desliga automaticamente se a aba perder foco (Page Visibility API)
 */

export class AtmosphericCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.isMobile = window.innerWidth < 1024;
    this.particles = [];
    this.maxParticles = this.isMobile ? 12 : 38;
    this.animationFrameId = null;
    this.isRunning = false;

    this.init();
  }

  init() {
    this.resize();
    let resizeTimeout = null;
    window.addEventListener('resize', () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.isMobile = window.innerWidth < 1024;
        this.maxParticles = this.isMobile ? 12 : 38;
        this.resize();
      }, 120);
    });

    // Cria as partículas iniciais
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    // No celular, pausa o canvas durante o gesto de scroll para dar 100% de fluidez à rolagem do DOM
    let scrollPauseTimer = null;
    window.addEventListener('scroll', () => {
      if (!this.isMobile) return;
      if (this.isRunning) {
        this.stop();
      }
      if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
      scrollPauseTimer = setTimeout(() => {
        if (!document.hidden) this.start();
      }, 160);
    }, { passive: true });

    this.start();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle(randomY = false) {
    const isEmber = Math.random() < 0.28; // 28% fuligem incandescente de sangue
    return {
      x: Math.random() * (this.canvas ? this.canvas.width : window.innerWidth),
      y: randomY ? Math.random() * (this.canvas ? this.canvas.height : window.innerHeight) : (this.canvas ? this.canvas.height + 10 : window.innerHeight + 10),
      radius: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.45,
      vy: -(Math.random() * 0.55 + 0.25),
      alpha: Math.random() * 0.55 + 0.15,
      maxAlpha: Math.random() * 0.65 + 0.2,
      fadeSpeed: Math.random() * 0.004 + 0.001,
      isEmber: isEmber,
      oscillation: Math.random() * Math.PI * 2,
      oscSpeed: Math.random() * 0.02 + 0.005
    };
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = () => {
      this.update();
      this.draw();
      if (this.isRunning) {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  update() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.oscillation += p.oscSpeed;
      p.x += p.vx + Math.sin(p.oscillation) * 0.3;
      p.y += p.vy;
      p.alpha += p.fadeSpeed;

      if (p.alpha > p.maxAlpha || p.alpha < 0.05) {
        p.fadeSpeed = -p.fadeSpeed;
      }

      if (p.y < -15 || p.x < -20 || p.x > w + 20) {
        this.particles[i] = this.createParticle(false);
      }
    }
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      if (p.isEmber) {
        this.ctx.fillStyle = `rgba(226, 27, 35, ${Math.max(0, p.alpha)})`;
        if (this.isMobile) {
          this.ctx.shadowBlur = 0;
        } else {
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = '#e21b23';
        }
      } else {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.alpha * 0.45)})`;
        this.ctx.shadowBlur = 0;
      }

      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0;
  }
}
