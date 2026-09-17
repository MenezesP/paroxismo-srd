/**
 * PAROXISMO — Sincronização em Tempo Real de Rolagens para Discord Activity
 * Transmite e recebe rolagens de dados instantaneamente entre todos
 * os participantes do mesmo canal de voz no Discord via WebSocket e MQTT.
 * Alinhado 100% com a Mesa Virtual (SessionSync) usando o mesmo tópico.
 */

import { soundFX } from './sound-fx.js?v=sound_v2';
import { RealtimeTransport } from './realtime-transport.js?v=rt_v1';

export class ActivitySync {
  constructor(roomId, user) {
    const params = new URLSearchParams(window.location.search);
    const resolved = roomId || params.get('channel_id') || params.get('instance_id') || window.PAROXISMO_INSTANCE_ID || 'mesa_principal';
    this.roomId = resolved.startsWith('discord_') ? resolved : ('discord_' + resolved);
    this.user = user || { id: 'anon', name: 'Agente' };
    this.topic = 'parox_mesa_' + this.sanitizeTopic(this.roomId);
    this.mqttTopic = 'paroxismo/vtt/' + this.sanitizeTopic(this.roomId);
    this.transport = RealtimeTransport.getShared();
    this.isConnected = false;
    this.unsubscribe = null;
  }

  sanitizeTopic(id) {
    const clean = String(id || 'mesa_principal').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
    return clean || 'mesa_principal';
  }

  connect() {
    console.log('[Activity Sync] Conectado ao tópico unificado: ' + this.mqttTopic);

    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = this.transport.subscribe(this.mqttTopic, (message) => {
      this.handleIncoming(message);
    });

    this.isConnected = true;

    // Escuta evento global de rolagem disparado pelo jogo (fora da Mesa)
    window.addEventListener('paroxismo:roll_broadcast', (e) => {
      this.broadcastRoll(e.detail);
    });
  }

  broadcastRoll(rollData) {
    if (!rollData) return;
    // Se a Mesa Virtual (SessionViewer) estiver ativa, o SessionSync já transmite
    if (document.body.classList.contains('vtt-view-active')) return;

    const rollId = 'roll_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const totalVal = rollData.result !== undefined ? rollData.result : (rollData.total !== undefined ? rollData.total : rollData.rolledValue);

    const message = {
      type: 'roll',
      sessionId: this.roomId,
      senderId: this.user.id,
      senderName: this.user.global_name || this.user.username || this.user.name || 'Agente',
      senderAvatar: this.user.avatar || null,
      characterName: localStorage.getItem('paroxismo_character_name') || this.user.name || 'Agente',
      isGm: false,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      createdAt: Date.now(),
      payload: {
        id: rollId,
        label: rollData.label || 'Rolagem de Dados',
        formula: rollData.details || rollData.formula || '1d20',
        rolls: rollData.rolls || [totalVal],
        modifier: rollData.modifier || 0,
        total: totalVal,
        isCrit: Boolean(rollData.isCrit),
        isFumble: Boolean(rollData.isFumble),
        visibility: 'public'
      }
    };

    try {
      this.transport.publish(this.mqttTopic, message);
    } catch (e) {
      console.warn('[Activity Sync] Erro no envio:', e);
    }
  }

  handleIncoming(msg) {
    if (!msg) return;

    // Processa rolagens de dados
    if (msg.type === 'roll' && msg.payload) {
      // Não replica rolagens próprias
      if (msg.senderId === this.user.id) return;

      // Se estiver com o SessionViewer ativo (VTT), o chat da mesa já processa
      if (document.body.classList.contains('vtt-view-active')) return;

      const p = msg.payload;
      if (p.visibility === 'gm_only') return;

      const rollItem = {
        id: p.id || ('roll_' + Date.now()),
        label: p.label || 'Rolagem',
        details: p.formula,
        result: p.total !== undefined ? p.total : (p.rolls?.[0] ?? 0),
        isCrit: Boolean(p.isCrit),
        isFumble: Boolean(p.isFumble),
        timestamp: msg.timestamp || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        author: {
          id: msg.senderId,
          name: msg.characterName || msg.senderName || 'Agente',
          avatar: msg.senderAvatar
        }
      };

      // Toca som de dados e mostra toast flutuante no HUD do compêndio
      soundFX.playDiceRoll();
      this.showRemoteRollToast(rollItem);
    }
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
