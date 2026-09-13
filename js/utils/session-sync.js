/**
 * PAROXISMO — Sincronização em Tempo Real da Mesa Virtual (SessionSync)
 * Comunicação bidirecional via WebSocket (ntfy.sh / Discord Activity)
 * Gerencia chat persistente, rolagens com visibilidade segura, iniciativa,
 * handouts e modo cinemático.
 */

import { soundFX } from './sound-fx.js?v=sound_v2';

export class SessionSync {
  constructor(sessionId, user, character, isGm = false) {
    this.sessionId = sessionId || 'paroxismo_mesa_oficial';
    this.user = user || { id: 'anon_' + Math.random().toString(36).slice(2, 7), name: 'Agente' };
    this.character = character || { name: 'Agente do Avesso' };
    this.isGm = Boolean(isGm);
    this.topic = 'parox_mesa_' + this.sanitizeTopic(this.sessionId);
    
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.heartbeatTimer = null;
    
    // Callbacks registrados
    this.listeners = {
      chat: [],
      roll: [],
      initiative: [],
      handout: [],
      scene: [],
      presence: [],
      typing: [],
      state: [],
      system: []
    };
    
    // Registro de participantes ativos { [userId]: { user, character, isGm, lastSeen, status } }
    this.participants = new Map();
    this._seenIds = new Set();
  }

  sanitizeTopic(id) {
    let hash = 0;
    const str = String(id || 'paroxismo_mesa_default');
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  connect() {
    const wsUrl = `wss://ntfy.sh/${this.topic}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log(`[SessionSync] Conectado à Mesa Virtual: ${this.topic}`);
        
        // Emite presença inicial e inicia heartbeat a cada 15 segundos
        this.broadcastPresence('online');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'message' && data.message) {
            const payload = JSON.parse(data.message);
            this.handleIncoming(payload);
          }
        } catch (e) {
          // Ignora mensagens malformadas
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        if (this.reconnectAttempts < 6) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 15000);
          setTimeout(() => this.connect(), delay);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[SessionSync] WebSocket erro:', err);
      };

      // Escuta rolagens disparadas globalmente pela Ficha de Personagem ou Dado Rápido
      if (!this._globalRollListener) {
        this._globalRollListener = (e) => {
          if (e.detail && !e.detail._fromSession) {
            this.sendDiceRoll({
              label: e.detail.label || 'Rolagem do Dossiê',
              formula: e.detail.details || '1d20',
              rolls: [e.detail.result],
              total: e.detail.result,
              isCrit: Boolean(e.detail.isCrit),
              isFumble: Boolean(e.detail.isFumble),
              visibility: 'public'
            });
          }
        };
        window.addEventListener('paroxismo:roll_broadcast', this._globalRollListener);
      }
    } catch (e) {
      console.warn('[SessionSync] Falha ao instanciar WebSocket:', e);
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this._globalRollListener) {
      window.removeEventListener('paroxismo:roll_broadcast', this._globalRollListener);
      this._globalRollListener = null;
    }
    if (this.ws) {
      try {
        this.broadcastPresence('offline');
        this.ws.close();
      } catch (e) {}
      this.ws = null;
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
    for (const [userId, participant] of this.participants.entries()) {
      if (now - participant.lastSeen > 45000) {
        participant.status = 'offline';
        changed = true;
      } else if (now - participant.lastSeen > 25000 && participant.status === 'online') {
        participant.status = 'away';
        changed = true;
      }
    }
    if (changed) {
      this.triggerListeners('presence', Array.from(this.participants.values()));
    }
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
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

  // Envio genérico para a sala
  async broadcast(type, payload) {
    const message = {
      type,
      sessionId: this.sessionId,
      senderId: this.user.id,
      senderName: this.user.global_name || this.user.username || this.user.name || 'Agente',
      senderAvatar: this.user.avatar || null,
      characterName: this.character?.name || 'Agente',
      isGm: this.isGm,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      createdAt: Date.now(),
      payload
    };

    // Disparo local imediato (Zero-latency / Offline-first)
    this.handleIncoming(message);

    try {
      await fetch(`https://ntfy.sh/${this.topic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (e) {
      console.warn('[SessionSync] Erro no broadcast HTTP:', e);
    }

    return message;
  }

  // ----------------------------------------------------
  // MÉTODOS DE NEGÓCIO ESPECÍFICOS
  // ----------------------------------------------------

  // 1. Presença & Heartbeat
  broadcastPresence(status = 'online') {
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
        currentPv: this.character?.currentPv || 20,
        currentPe: this.character?.currentPe || 3
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
    // rollData: { label, formula, rolls, modifier, total, isCrit, isFumble, visibility }
    const visibility = rollData.visibility || 'public';
    
    // Se a rolagem for Oculta (blind) e enviada por quem não quer vazar dados para jogadores normais:
    // O payload geral transmitirá apenas os metadados de que houve rolagem oculta.
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
      // Se for rolagem oculta, guardamos o valor original no GM mas no broadcast enviamos mascarado
      payload.blindTotal = rollData.total;
      payload.blindFormula = rollData.formula;
      // Para quem não for o mestre, o total virá nulo
      payload.isMasked = true;
    }

    return this.broadcast('roll', payload);
  }

  // 5. Iniciativa (apenas Mestre ou jogador com permissão)
  sendInitiativeUpdate(initiativeList, activeIndex = 0, combatActive = false) {
    return this.broadcast('initiative', {
      list: initiativeList,
      activeIndex,
      combatActive,
      updatedAt: Date.now()
    });
  }

  // 6. Handout Compartilhado
  sendHandout(handoutData, action = 'show') {
    return this.broadcast('handout', {
      action, // 'show' ou 'close'
      handout: handoutData
    });
  }

  // 7. Cena Cinemática
  sendScenePresentation(sceneData, active = true) {
    return this.broadcast('scene', {
      active,
      scene: sceneData // { title, url, description }
    });
  }

  // 8. Evento do Sistema
  sendSystemEvent(message) {
    return this.broadcast('system', {
      id: 'sys_' + Date.now(),
      message
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

    // Deduplicação de mensagens para evitar duplicatas vindas do WebSocket echo
    const msgKey = msg.payload?.id || (msg.type + '_' + msg.senderId + '_' + (msg.createdAt || msg.timestamp));
    if (msgKey) {
      if (this._seenIds.has(msgKey)) return;
      this._seenIds.add(msgKey);
      if (this._seenIds.size > 200) {
        const first = this._seenIds.values().next().value;
        this._seenIds.delete(first);
      }
    }

    const isMe = msg.senderId === this.user.id;

    // 1. Processa Presença
    if (msg.type === 'presence' && msg.payload) {
      const { user, character, status } = msg.payload;
      if (user && user.id) {
        this.participants.set(user.id, {
          user,
          character,
          isGm: Boolean(user.isGm || msg.isGm),
          lastSeen: Date.now(),
          status: status || 'online'
        });
        this.triggerListeners('presence', Array.from(this.participants.values()));
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
        // Apenas o autor e o Mestre podem ler
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

      // Checagem de segurança para rolagens
      if (r.visibility === 'gm_only' && !this.isGm) {
        return; // Não exibe para jogadores
      }
      if (r.visibility === 'private_gm') {
        if (!isMe && !this.isGm) {
          return;
        }
      }
      if (r.visibility === 'blind') {
        // Se for rolagem oculta e quem está lendo NÃO for o Mestre nem o autor:
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

    // 5. Iniciativa
    if (msg.type === 'initiative' && msg.payload) {
      this.triggerListeners('initiative', msg.payload);
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
      if (!isMe) {
        soundFX.playPactOfDemiurge();
      }
      this.triggerListeners('scene', msg.payload);
      return;
    }

    // 8. Evento do Sistema
    if (msg.type === 'system' && msg.payload) {
      this.triggerListeners('system', {
        ...msg.payload,
        timestamp: msg.timestamp
      });
      return;
    }

    // 9. Estado da Sessão
    if (msg.type === 'state' && msg.payload) {
      this.triggerListeners('state', msg.payload);
      return;
    }
  }
}
