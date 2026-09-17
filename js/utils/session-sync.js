/**
 * PAROXISMO — Sincronização em Tempo Real da Mesa Virtual (SessionSync)
 * Comunicação bidirecional via WebSocket e MQTT (HiveMQ / EMQX / Discord Activity)
 * Gerencia chat persistente, rolagens com visibilidade segura, iniciativa,
 * handouts e modo cinemático.
 * 
 * - Singleton de listener global para evitar disparos múltiplos
 * - Janela de deduplicação e debounce de rolagens
 * - Suporte à fase de iniciativa com rolagens individuais dos players e mestre
 * - Suporte nativo aos participantes conectados na chamada de voz do Discord
 */

import { soundFX } from './sound-fx.js?v=sound_v2';
import { RealtimeTransport } from './realtime-transport.js?v=rt_v1';

export class SessionSync {
  static activeInstance = null;
  static _globalListenerInitialized = false;

  /**
   * Registra um listener global ÚNICO no window para evitar que múltiplas
   * instâncias de SessionSync criem ouvintes duplicados no paroxismo:roll_broadcast
   */
  static initGlobalListener() {
    if (SessionSync._globalListenerInitialized) return;
    SessionSync._globalListenerInitialized = true;

    window.addEventListener('paroxismo:roll_broadcast', (e) => {
      if (e.detail && !e.detail._fromSession) {
        if (SessionSync.activeInstance) {
          SessionSync.activeInstance.handleGlobalRoll(e.detail);
        }
      }
    });
  }

  constructor(sessionId, user, character, isGm = false) {
    // Se já havia uma instância anterior ativa nesta aba, desconecta com segurança
    if (SessionSync.activeInstance && SessionSync.activeInstance !== this) {
      try { SessionSync.activeInstance.disconnect(); } catch (e) {}
    }
    SessionSync.activeInstance = this;
    SessionSync.initGlobalListener();

    this.sessionId = sessionId || 'paroxismo_mesa_oficial';
    this.user = user || { id: 'anon_' + Math.random().toString(36).slice(2, 7), name: 'Agente' };
    this.character = character || { name: 'Agente do Avesso' };
    this.isGm = Boolean(isGm);
    this.topic = 'parox_mesa_' + this.sanitizeTopic(this.sessionId);
    this.mqttTopic = 'paroxismo/vtt/' + this.sanitizeTopic(this.sessionId);
    
    this.transport = RealtimeTransport.getShared();
    this.unsubscribeTransport = null;
    this.isConnected = false;
    this.heartbeatTimer = null;
    
    // Callbacks registrados
    this.listeners = {
      chat: [],
      roll: [],
      initiative: [],
      initiative_roll: [],
      handout: [],
      scene: [],
      presence: [],
      typing: [],
      state: [],
      system: []
    };
    
    // Registro de participantes ativos { [userId]: { user, character, isGm, lastSeen, status, fromDiscordCall } }
    this.participants = new Map();
    this._seenIds = new Set();
    this._lastGlobalRollSig = null;
    this._lastGlobalRollTime = 0;

    // Registra imediatamente o participante local
    this.registerLocalParticipant();
  }

  sanitizeTopic(id) {
    const clean = String(id || 'mesa_principal').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
    return clean || 'mesa_principal';
  }

  registerLocalParticipant() {
    const curPv = (this.character && typeof this.character.currentPv === 'number' && !isNaN(this.character.currentPv)) ? this.character.currentPv : 20;
    const maxPv = (this.character && typeof this.character.maxPv === 'number' && !isNaN(this.character.maxPv)) ? this.character.maxPv : (this.character?.pv || 20);
    const curPe = (this.character && typeof this.character.currentPe === 'number' && !isNaN(this.character.currentPe)) ? this.character.currentPe : 3;
    const maxPe = (this.character && typeof this.character.maxPe === 'number' && !isNaN(this.character.maxPe)) ? this.character.maxPe : (this.character?.pe || 3);

    this.participants.set(this.user.id, {
      user: {
        id: this.user.id,
        name: this.user.global_name || this.user.username || this.user.name || (this.isGm ? 'Condutor' : 'Agente'),
        avatar: this.user.avatar || null,
        role: this.isGm ? 'GM' : 'PLAYER'
      },
      character: {
        name: this.character?.name || (this.isGm ? 'Condutor' : 'Agente'),
        concept: this.character?.concept || 'Sobrevivente',
        classId: this.character?.classId || 'combate',
        level: this.character?.level || 1,
        currentPv: curPv,
        maxPv: maxPv,
        currentPe: curPe,
        maxPe: maxPe,
        customAvatar: this.character?.customAvatar || null,
        attributes: this.character?.attributes || null
      },
      isGm: this.isGm,
      lastSeen: Date.now(),
      status: 'online'
    });
  }

  /**
   * Sincroniza participantes obtidos nativamente da chamada de voz do Discord
   */
  updateDiscordParticipants(discordList) {
    if (!Array.isArray(discordList)) return;
    let changed = false;

    for (const dUser of discordList) {
      if (!dUser || !dUser.id) continue;
      if (dUser.id === this.user.id) continue; // Usuário local já gerenciado

      const existing = this.participants.get(dUser.id);
      const discordAvatar = dUser.avatar ? `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png?size=128` : null;
      const displayName = dUser.global_name || dUser.username || 'Agente Discord';

      if (!existing) {
        this.participants.set(dUser.id, {
          user: {
            id: dUser.id,
            name: displayName,
            avatar: discordAvatar,
            role: 'PLAYER'
          },
          character: {
            name: displayName,
            concept: 'Agente da Ordem',
            classId: 'combate',
            level: 1,
            currentPv: 20,
            maxPv: 20,
            currentPe: 3,
            maxPe: 3,
            customAvatar: discordAvatar
          },
          isGm: false,
          lastSeen: Date.now(),
          status: 'online',
          fromDiscordCall: true
        });
        changed = true;
      } else if (existing.fromDiscordCall) {
        if (discordAvatar && !existing.user.avatar) {
          existing.user.avatar = discordAvatar;
          existing.character.customAvatar = discordAvatar;
          changed = true;
        }
        existing.lastSeen = Date.now();
      }
    }

    if (changed) {
      this.triggerListeners('presence', Array.from(this.participants.values()));
    }
  }

  /**
   * Recebe disparos de rolagem do dossiê com debounce rígido para eliminar duplicações
   */
  handleGlobalRoll(detail) {
    if (!detail) return;
    const sig = `${detail.label || ''}_${detail.result}_${detail.details || ''}`;
    const now = Date.now();
    if (this._lastGlobalRollSig === sig && (now - this._lastGlobalRollTime) < 1500) {
      return;
    }
    this._lastGlobalRollSig = sig;
    this._lastGlobalRollTime = now;

    this.sendDiceRoll({
      label: detail.label || 'Rolagem do Dossiê',
      formula: detail.details || '1d20',
      rolls: [detail.result],
      total: detail.result,
      isCrit: Boolean(detail.isCrit),
      isFumble: Boolean(detail.isFumble),
      visibility: 'public'
    });
  }

  connect() {
    console.log(`[SessionSync] Conectando à Mesa Virtual: ${this.mqttTopic}`);

    // Registra listener no canal MQTT compartilhado
    if (this.unsubscribeTransport) {
      this.unsubscribeTransport();
    }

    this.unsubscribeTransport = this.transport.subscribe(this.mqttTopic, (message) => {
      this.handleIncoming(message);
    });

    this.isConnected = true;
    this.registerLocalParticipant();
    this.broadcastPresence('online');
    this.startHeartbeat();
  }

  disconnect() {
    this.stopHeartbeat();
    if (SessionSync.activeInstance === this) {
      SessionSync.activeInstance = null;
    }
    if (this.unsubscribeTransport) {
      try {
        this.broadcastPresence('offline');
        this.unsubscribeTransport();
      } catch (e) {}
      this.unsubscribeTransport = null;
    }
    this.isConnected = false;
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.broadcastPresence('online');
        this.cleanStaleParticipants();
      }
    }, 15000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  cleanStaleParticipants() {
    const now = Date.now();
    let changed = false;
    for (const [id, p] of this.participants.entries()) {
      // Nunca remove o usuário local
      if (id === this.user.id) continue;

      // Se for participante da chamada do Discord, mantém ativo se a chamada estiver ativa
      if (p.fromDiscordCall && window.PAROXISMO_DISCORD_PARTICIPANTS?.some(dp => dp.id === id)) {
        continue;
      }

      if ((now - p.lastSeen) > 45000) {
        this.participants.delete(id);
        changed = true;
      }
    }
    if (changed) {
      this.triggerListeners('presence', Array.from(this.participants.values()));
    }
  }

  // ----------------------------------------------------
  // EVENT SUBSCRIPTION (PUB/SUB INTERNO)
  // ----------------------------------------------------
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  triggerListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error(e); }
      });
    }
  }

  // Envio para a sala via WebSocket MQTT
  async broadcast(type, payload) {
    const curPv = (this.character && typeof this.character.currentPv === 'number' && !isNaN(this.character.currentPv)) ? this.character.currentPv : 20;
    const maxPv = (this.character && typeof this.character.maxPv === 'number' && !isNaN(this.character.maxPv)) ? this.character.maxPv : (this.character?.pv || 20);
    const curPe = (this.character && typeof this.character.currentPe === 'number' && !isNaN(this.character.currentPe)) ? this.character.currentPe : 3;
    const maxPe = (this.character && typeof this.character.maxPe === 'number' && !isNaN(this.character.maxPe)) ? this.character.maxPe : (this.character?.pe || 3);

    const safeCharacter = {
      name: this.character?.name || 'Agente',
      concept: this.character?.concept || 'Sobrevivente',
      classId: this.character?.classId || 'combate',
      level: this.character?.level || 1,
      currentPv: curPv,
      maxPv: maxPv,
      currentPe: curPe,
      maxPe: maxPe,
      customAvatar: this.character?.customAvatar || null,
      attributes: this.character?.attributes || null
    };

    const message = {
      type,
      sessionId: this.sessionId,
      senderId: this.user.id,
      senderName: this.user.global_name || this.user.username || this.user.name || (this.isGm ? 'Condutor' : 'Agente'),
      senderAvatar: this.user.avatar || null,
      character: safeCharacter,
      characterName: this.character?.name || 'Agente',
      isGm: this.isGm,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      createdAt: Date.now(),
      payload
    };

    // Disparo local imediato (Zero-latency / Offline-first)
    this.handleIncoming(message);

    // Transmissão via RealtimeTransport
    try {
      this.transport.publish(this.mqttTopic, message);
    } catch (e) {
      console.warn('[SessionSync] Erro no broadcast MQTT:', e);
    }

    return message;
  }

  // ----------------------------------------------------
  // MÉTODOS DE NEGÓCIO ESPECÍFICOS
  // ----------------------------------------------------

  // 1. Presença & Heartbeat
  broadcastPresence(status = 'online') {
    const curPv = (this.character && typeof this.character.currentPv === 'number' && !isNaN(this.character.currentPv)) ? this.character.currentPv : 20;
    const maxPv = (this.character && typeof this.character.maxPv === 'number' && !isNaN(this.character.maxPv)) ? this.character.maxPv : (this.character?.pv || 20);
    const curPe = (this.character && typeof this.character.currentPe === 'number' && !isNaN(this.character.currentPe)) ? this.character.currentPe : 3;
    const maxPe = (this.character && typeof this.character.maxPe === 'number' && !isNaN(this.character.maxPe)) ? this.character.maxPe : (this.character?.pe || 3);

    this.broadcast('presence', {
      user: {
        id: this.user.id,
        name: this.user.global_name || this.user.username || this.user.name || 'Agente',
        avatar: this.user.avatar || null,
        isGm: this.isGm
      },
      character: {
        name: this.character?.name || 'Agente',
        concept: this.character?.concept || 'Sobrevivente',
        classId: this.character?.classId || 'combate',
        level: this.character?.level || 1,
        currentPv: curPv,
        maxPv: maxPv,
        currentPe: curPe,
        maxPe: maxPe,
        customAvatar: this.character?.customAvatar || null,
        attributes: this.character?.attributes || null
      },
      status
    });
  }

  // 2. Chat
  sendChatMessage(text, messageType = 'normal', visibility = 'public', targetRecipientId = null) {
    if (!text || !text.trim()) return;

    return this.broadcast('chat', {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      text: text.trim(),
      messageType, // 'normal', 'gm_narrative', 'whisper', 'system'
      visibility, // 'public', 'private_gm', 'gm_only'
      targetRecipientId
    });
  }

  // 3. Digitando
  sendTypingIndicator(isTyping = true) {
    return this.broadcast('typing', {
      userId: this.user.id,
      name: this.character?.name || this.user.name || 'Agente',
      isTyping
    });
  }

  // 4. Rolagem de Dados com Segurança
  sendDiceRoll(rollData) {
    const visibility = rollData.visibility || 'public';
    
    let payload = {
      id: 'roll_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      label: rollData.label || 'Rolagem de Dados',
      formula: rollData.formula || '1d20',
      rolls: rollData.rolls || [],
      modifier: rollData.modifier || 0,
      total: rollData.total,
      isCrit: Boolean(rollData.isCrit),
      isFumble: Boolean(rollData.isFumble),
      visibility // 'public', 'private_gm', 'gm_only', 'blind'
    };

    if (visibility === 'blind') {
      payload.blindTotal = rollData.total;
      payload.blindFormula = rollData.formula;
      payload.isMasked = true;
    }

    return this.broadcast('roll', payload);
  }

  // 5. Iniciativa (Atualização de lista ou transição de fase/rodada)
  sendInitiativeUpdate(initiativeList, activeIndex = 0, combatActive = false, round = 1, phase = 'turns') {
    return this.broadcast('initiative', {
      list: initiativeList,
      activeIndex,
      combatActive,
      round,
      phase,
      updatedAt: Date.now()
    });
  }

  // 5.1 Rolagem de Iniciativa Individual de um Agente ou Monstro
  sendInitiativeRoll(actorId, initiative, rawRoll, bonus, actorName) {
    return this.broadcast('initiative_roll', {
      actorId,
      initiative,
      rawRoll,
      bonus,
      actorName,
      updatedAt: Date.now()
    });
  }

  // 6. Handout Compartilhado
  sendHandout(handoutData, action = 'show') {
    return this.broadcast('handout', {
      action, // 'show', 'hide'
      handout: handoutData
    });
  }

  // 7. Apresentação Cinemática de Cena
  sendScenePresentation(sceneData, active = true) {
    return this.broadcast('scene', {
      active,
      scene: sceneData // { title, url, description, mood }
    });
  }

  // 8. Mensagem de Sistema / Evento Litúrgico
  sendSystemEvent(eventText) {
    return this.broadcast('system', {
      id: 'sys_' + Date.now(),
      text: eventText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
  }

  // 9. Estado da Sessão (Pausar / Iniciar / Notas)
  sendSessionState(state) {
    return this.broadcast('state', state);
  }

  // ----------------------------------------------------
  // RECEBIMENTO E ROTEAMENTO
  // ----------------------------------------------------
  handleIncoming(msg) {
    if (!msg || !msg.type) return;

    // Deduplicação de mensagens
    const msgKey = msg.payload?.id || (msg.type + '_' + msg.senderId + '_' + (msg.createdAt || msg.timestamp));
    if (msgKey) {
      if (this._seenIds.has(msgKey)) return;
      this._seenIds.add(msgKey);
      if (this._seenIds.size > 300) {
        const first = this._seenIds.values().next().value;
        this._seenIds.delete(first);
      }
    }

    const isMe = msg.senderId === this.user.id;

    // 1. Processa Presença
    if (msg.type === 'presence' && msg.payload) {
      const { user, character, status } = msg.payload;
      if (user && user.id) {
        const isNewParticipant = !this.participants.has(user.id);
        this.participants.set(user.id, {
          user,
          character,
          isGm: Boolean(user.isGm || msg.isGm),
          lastSeen: Date.now(),
          status: status || 'online',
          fromDiscordCall: false
        });
        this.triggerListeners('presence', Array.from(this.participants.values()));

        // Se for um novo participante que anunciou presença, responde com a presença local (sem loop)
        if (isNewParticipant && !isMe) {
          const now = Date.now();
          if (now - (this._lastPresenceReplyTime || 0) > 2500) {
            this._lastPresenceReplyTime = now;
            setTimeout(() => {
              if (this.isConnected) this.broadcastPresence('online');
            }, 300);
          }
        }
      }
      return;
    }

    // 2. Digitando
    if (msg.type === 'typing' && msg.payload) {
      if (!isMe) {
        this.triggerListeners('typing', msg.payload);
      }
      return;
    }

    // 3. Mensagens de Chat
    if (msg.type === 'chat' && msg.payload) {
      const p = msg.payload;
      
      // Checagem de visibilidade privada / sussurro
      if (p.visibility === 'private_gm') {
        if (!isMe && !this.isGm) return;
      }
      if (p.visibility === 'gm_only' && !this.isGm) {
        return;
      }
      if (p.targetRecipientId && p.targetRecipientId !== this.user.id && !isMe && !this.isGm) {
        return;
      }

      if (!isMe) {
        soundFX.playRuneClick();
      }

      this.triggerListeners('chat', {
        ...p,
        author: {
          id: msg.senderId,
          name: msg.senderName,
          avatar: msg.senderAvatar,
          characterName: msg.characterName,
          isGm: msg.isGm
        },
        timestamp: msg.timestamp
      });
      return;
    }

    // 4. Rolagem de Dados
    if (msg.type === 'roll' && msg.payload) {
      let r = { ...msg.payload };

      if (r.visibility === 'gm_only' && !this.isGm) {
        return;
      }
      if (r.visibility === 'private_gm') {
        if (!isMe && !this.isGm) return;
      }
      if (r.visibility === 'blind') {
        if (!this.isGm && !isMe) {
          r.isMasked = true;
          r.total = null;
          r.rolls = null;
          r.formula = '???';
        }
      }

      if (!isMe) {
        soundFX.playDiceRoll();
      }

      this.triggerListeners('roll', {
        ...r,
        author: {
          id: msg.senderId,
          name: msg.senderName,
          avatar: msg.senderAvatar,
          characterName: msg.characterName,
          isGm: msg.isGm
        },
        timestamp: msg.timestamp
      });
      return;
    }

    // 5. Iniciativa (Geral)
    if (msg.type === 'initiative' && msg.payload) {
      this.triggerListeners('initiative', msg.payload);
      return;
    }

    // 5.1 Rolagem Individual de Iniciativa
    if (msg.type === 'initiative_roll' && msg.payload) {
      this.triggerListeners('initiative_roll', msg.payload);
      return;
    }

    // 6. Handouts
    if (msg.type === 'handout' && msg.payload) {
      if (!isMe) {
        soundFX.playRuneClick();
      }
      this.triggerListeners('handout', msg.payload);
      return;
    }

    // 7. Cena Cinemática
    if (msg.type === 'scene' && msg.payload) {
      this.triggerListeners('scene', msg.payload);
      return;
    }

    // 8. Evento do Sistema
    if (msg.type === 'system' && msg.payload) {
      this.triggerListeners('system', msg.payload);
      return;
    }

    // 9. Estado da Sessão
    if (msg.type === 'state' && msg.payload) {
      this.triggerListeners('state', msg.payload);
      return;
    }
  }
}
