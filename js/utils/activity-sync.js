/**
 * PAROXISMO — Sincronização em Tempo Real de Rolagens para Discord Activity
 * Transmite e recebe rolagens de dados instantaneamente entre todos
 * os participantes do mesmo canal de voz no Discord via WebSocket e MQTT.
 */

import { soundFX } from './sound-fx.js?v=sound_v2';
import { RealtimeTransport } from './realtime-transport.js?v=rt_v1';

export class ActivitySync {
  constructor(roomId, user) {
    this.roomId = roomId || 'paroxismo_main';
    this.user = user || { id: 'anon', name: 'Agente' };
    this.topic = 'parox_srd_' + this.sanitizeTopic(this.roomId);
    this.mqttTopic = 'paroxismo/rolls/' + this.sanitizeTopic(this.roomId);
    this.transport = RealtimeTransport.getShared();
    this.isConnected = false;
    this.unsubscribe = null;
  }

  sanitizeTopic(id) {
    let hash = 0;
    const str = String(id || 'paroxismo_default');
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  connect() {
    console.log('[Activity Sync] Conectado à sala de rolagens: ' + this.mqttTopic);

    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = this.transport.subscribe(this.mqttTopic, (rollPayload) => {
      this.handleIncomingRoll(rollPayload);
    });

    this.isConnected = true;

    // Escuta evento global de rolagem disparado pelo jogo
    window.addEventListener('paroxismo:roll_broadcast', (e) => {
      this.broadcastRoll(e.detail);
    });
  }

  broadcastRoll(rollData) {
    if (!rollData) return;

    const payload = {
      ...rollData,
      id: 'roll_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      author: {
        id: this.user.id,
        name: this.user.global_name || this.user.username || this.user.name || 'Agente',
        avatar: this.user.avatar
      },
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    try {
      this.transport.publish(this.mqttTopic, payload);
    } catch (e) {
      console.warn('[Activity Sync] Erro no envio:', e);
    }
  }

  handleIncomingRoll(payload) {
    if (!payload) return;

    // Não replica rolagens próprias
    if (payload.author && payload.author.id === this.user.id) {
      return;
    }

    // Se estiver com o SessionViewer ativo (VTT), ele já processa no chat da mesa
    if (document.body.classList.contains('vtt-view-active')) {
      return;
    }

    // Toca som de dados
    soundFX.playDiceRoll();

    // Notificação flutuante no HUD
    this.showRemoteRollToast(payload);
  }

  showRemoteRollToast(roll) {
    const toastId = 'discord-remote-roll-' + roll.id;
    const existing = document.getElementById(toastId);
    if (existing) return;

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.style.cssText = 'position: fixed; top: 64px; right: 16px; z-index: 99999; min-width: 280px; max-width: 360px; font-family: monospace; backdrop-filter: blur(8px);';
    toast.className = 'p-3.5 bg-[#07090e]/95 border-2 ' +
      (roll.isCrit ? 'border-[#06b6d4] shadow-[0_0_25px_rgba(6,182,212,0.6)]' :
       roll.isFumble ? 'border-[#ff333d] shadow-[0_0_25px_rgba(255,51,61,0.6)]' :
       'border-[#e21b23] shadow-[0_0_25px_rgba(226,27,35,0.4)]') +
      ' animate-fadeIn flex flex-col gap-1.5 text-white select-none';

    const authorName = roll.author?.name || 'Agente';
    const avatarUrl = roll.author?.avatar
      ? (roll.author.avatar.startsWith('http') ? roll.author.avatar : 'https://cdn.discordapp.com/avatars/' + roll.author.id + '/' + roll.author.avatar + '.png?size=32')
      : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const displayResult = roll.result !== undefined ? roll.result : (roll.total !== undefined ? roll.total : roll.rolledValue);

    toast.innerHTML = [
      '<div class="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1">',
      '  <div class="flex items-center gap-2">',
      '    <img src="' + avatarUrl + '" class="w-4 h-4 rounded-full border border-[#e21b23] object-cover" onerror="this.src=\'https://cdn.discordapp.com/embed/avatars/0.png\'" />',
      '    <span class="text-[11px] font-bold text-[#8e95a5]">' + authorName + '</span>',
      '  </div>',
      '  <span class="text-[9px] text-white/50">' + (roll.timestamp || '') + '</span>',
      '</div>',
      '<div class="flex items-center justify-between gap-3">',
      '  <span class="text-xs font-serif font-bold text-white tracking-wide truncate">' + (roll.label || 'Rolagem') + '</span>',
      '  <div class="flex items-center gap-1.5">',
      roll.details ? '    <span class="text-[10px] text-white/50">' + roll.details + '</span>' : '',
      '    <span class="text-lg font-black ' + (roll.isCrit ? 'text-[#06b6d4]' : roll.isFumble ? 'text-[#ff333d]' : 'text-[#e21b23]') + '">',
      '      ' + displayResult,
      '    </span>',
      '  </div>',
      '</div>',
      roll.isCrit ? '<div class="text-[9px] font-black text-[#06b6d4] tracking-widest uppercase">★ ACERTO CRÍTICO! ★</div>' : '',
      roll.isFumble ? '<div class="text-[9px] font-black text-[#ff333d] tracking-widest uppercase">☠ FALHA CRÍTICA! ☠</div>' : ''
    ].filter(Boolean).join('\n');

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 400);
    }, 6000);
  }
}
