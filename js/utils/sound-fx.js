/**
 * PAROXISMO - AAA RITUAL UI AUDIO ENGINE
 * Sintetizador Procedural Diegético via Web Audio API (Zero dependências externas)
 * Produz micro-clicks mecânicos, ressonâncias graves e atrito de pergaminho
 */

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('paroxismo_audio_muted') === 'true';
    this.initialized = false;
  }

  initAudio() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.initialized = true;
      }
    } catch (e) {
      console.warn("Web Audio não suportado ou bloqueado:", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('paroxismo_audio_muted', this.isMuted ? 'true' : 'false');
    if (!this.isMuted) {
      this.initAudio();
      this.playRuneClick();
    }
    return this.isMuted;
  }

  // Click metálico de trinco / medalhão (Iron Latch)
  playRuneClick() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {}
  }

  // Ressonância mística ao trocar de capítulo (Rune Resonate)
  playChapterTransition() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(185, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);

      sub.type = 'triangle';
      sub.frequency.setValueAtTime(55, now);
      sub.frequency.exponentialRampToValueAtTime(35, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      sub.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.36);
      sub.stop(now + 0.36);
    } catch (e) {}
  }

  // Atrito tátil suave ao passar o mouse sobre cards físicos (Hover Rustle)
  playCardHover() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.03);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }

  // Quebra do Selo do Demiurgo (Modo Mestre Ativado)
  playSealBreak() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(60, now + 0.45);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(120, now);
      osc2.frequency.exponentialRampToValueAtTime(25, now + 0.6);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } catch (e) {}
  }

  // Rolagem de dados táteis (Dice clatter de resina/osso)
  playDiceRoll() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.04, 0.09, 0.15].forEach((t, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650 + Math.random() * 350, now + t);
        osc.frequency.exponentialRampToValueAtTime(140, now + t + 0.03);

        const vol = 0.07 - (i * 0.012);
        gain.gain.setValueAtTime(vol, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + 0.035);
      });
    } catch (e) {}
  }
}

export const soundFX = new SoundFX();
