/**
 * PAROXISMO — Realtime WebSocket Transport (MQTT 3.1.1)
 * 
 * Fornece sincronização em tempo real ultra-rápida e bidirecional
 * diretamente no navegador e no Discord Activity via WebSockets.
 * 
 * - Sem dependências externas (puro JS / TextEncoder / TextDecoder / Uint8Array)
 * - Brokers públicos globais de alta disponibilidade (HiveMQ / EMQX)
 * - Sem limites de quota diária (evita o erro HTTP 429 do ntfy.sh)
 * - Suporte a múltiplos tópicos com pub/sub desacoplado
 * - Reconexão automática com backoff exponencial e failover de broker
 * - Heartbeat keep-alive (PINGREQ / PINGRESP)
 * - Fila de mensagens offline
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function encodeString(str) {
  const bytes = encoder.encode(str);
  const buf = new Uint8Array(2 + bytes.length);
  buf[0] = (bytes.length >> 8) & 0xff;
  buf[1] = bytes.length & 0xff;
  buf.set(bytes, 2);
  return buf;
}

function concatBytes(...arrays) {
  const totalLength = arrays.reduce((acc, a) => acc + a.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function encodeVarLength(len) {
  const bytes = [];
  do {
    let digit = len % 128;
    len = Math.floor(len / 128);
    if (len > 0) digit |= 0x80;
    bytes.push(digit);
  } while (len > 0);
  return new Uint8Array(bytes);
}

function decodeVarLength(bytes, offset) {
  let multiplier = 1;
  let value = 0;
  let digit = 0;
  let pos = offset;
  do {
    if (pos >= bytes.length) break;
    digit = bytes[pos++];
    value += (digit & 127) * multiplier;
    multiplier *= 128;
  } while ((digit & 128) !== 0);
  return { length: value, bytesRead: pos - offset };
}

function makeConnectPacket(clientId) {
  const protocolName = encodeString('MQTT');
  const protocolLevel = new Uint8Array([0x04]); // 3.1.1
  const connectFlags = new Uint8Array([0x02]); // CleanSession
  const keepAlive = new Uint8Array([0x00, 0x3C]); // 60s
  const payload = encodeString(clientId);
  const varPayload = concatBytes(protocolName, protocolLevel, connectFlags, keepAlive, payload);
  const lenBytes = encodeVarLength(varPayload.length);
  return concatBytes(new Uint8Array([0x10]), lenBytes, varPayload);
}

function makeSubscribePacket(topic, packetId = 1) {
  const idBuf = new Uint8Array([(packetId >> 8) & 0xff, packetId & 0xff]);
  const topicBuf = encodeString(topic);
  const qosBuf = new Uint8Array([0x00]); // QoS 0
  const varPayload = concatBytes(idBuf, topicBuf, qosBuf);
  const lenBytes = encodeVarLength(varPayload.length);
  return concatBytes(new Uint8Array([0x82]), lenBytes, varPayload);
}

function makePublishPacket(topic, messageStr) {
  const topicBuf = encodeString(topic);
  const msgBuf = encoder.encode(messageStr);
  const varPayload = concatBytes(topicBuf, msgBuf);
  const lenBytes = encodeVarLength(varPayload.length);
  return concatBytes(new Uint8Array([0x30]), lenBytes, varPayload);
}

function makePingPacket() {
  return new Uint8Array([0xC0, 0x00]);
}

export class RealtimeTransport {
  static _sharedInstance = null;

  static getShared() {
    if (!RealtimeTransport._sharedInstance) {
      RealtimeTransport._sharedInstance = new RealtimeTransport();
      RealtimeTransport._sharedInstance.connect();
    }
    return RealtimeTransport._sharedInstance;
  }

  constructor(options = {}) {
    this.brokers = options.brokers || [
      'wss://broker.hivemq.com:8884/mqtt',
      'wss://broker.emqx.io:8084/mqtt'
    ];
    this.brokerIndex = 0;
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.subscriptions = new Map(); // topic -> Set<callback>
    this.outbox = [];
    this.packetId = 1;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.clientId = 'parox_' + Math.random().toString(36).slice(2, 9);
    this.statusListeners = new Set();
  }

  getCurrentBroker() {
    return this.brokers[this.brokerIndex % this.brokers.length];
  }

  connect() {
    if (this.isConnected || this.isConnecting) return;
    this.isConnecting = true;

    const brokerUrl = this.getCurrentBroker();
    console.log('[RealtimeTransport] Conectando ao broker: ' + brokerUrl);

    try {
      this.ws = new WebSocket(brokerUrl, 'mqtt');
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        console.log('[RealtimeTransport] WebSocket aberto, enviando CONNECT...');
        try {
          this.ws.send(makeConnectPacket(this.clientId));
        } catch (e) {
          console.warn('[RealtimeTransport] Falha ao enviar CONNECT:', e);
        }
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.warn('[RealtimeTransport] Erro no broker ' + brokerUrl + ':', err);
      };

      this.ws.onclose = (event) => {
        console.log('[RealtimeTransport] Conexão encerrada (código ' + event.code + ')');
        this.handleDisconnect();
      };
    } catch (err) {
      console.error('[RealtimeTransport] Falha ao iniciar WebSocket:', err);
      this.handleDisconnect();
    }
  }

  handleDisconnect() {
    this.isConnected = false;
    this.isConnecting = false;
    this.stopPing();
    this.notifyStatus('disconnected');

    if (!this.reconnectTimer) {
      this.reconnectAttempts++;
      if (this.reconnectAttempts % 2 === 0) {
        this.brokerIndex = (this.brokerIndex + 1) % this.brokers.length;
        console.log('[RealtimeTransport] Alternando para broker alternativo: ' + this.getCurrentBroker());
      }

      const delay = Math.min(1000 * Math.pow(1.5, Math.min(this.reconnectAttempts, 6)), 10000);
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, delay);
    }
  }

  handleMessage(data) {
    const bytes = new Uint8Array(data);
    let pos = 0;

    while (pos < bytes.length) {
      const firstByte = bytes[pos];
      const packetType = firstByte >> 4;
      const { length: remLen, bytesRead } = decodeVarLength(bytes, pos + 1);
      const packetEnd = pos + 1 + bytesRead + remLen;
      if (packetEnd > bytes.length) break;

      if (packetType === 2) { // CONNACK
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        console.log('[RealtimeTransport] MQTT Conectado e Autenticado com Sucesso!');
        this.notifyStatus('connected');
        this.startPing();
        this.resubscribeAll();
        this.flushOutbox();
      } else if (packetType === 3) { // PUBLISH
        let innerPos = pos + 1 + bytesRead;
        const topicLen = (bytes[innerPos] << 8) | bytes[innerPos + 1];
        innerPos += 2;
        const topic = decoder.decode(bytes.subarray(innerPos, innerPos + topicLen));
        innerPos += topicLen;
        const payloadStr = decoder.decode(bytes.subarray(innerPos, packetEnd));

        let parsed;
        try {
          parsed = JSON.parse(payloadStr);
        } catch (e) {
          parsed = payloadStr;
        }

        this.dispatchTopicMessage(topic, parsed);
      } else if (packetType === 9) { // SUBACK
        // Subscrição confirmada
      } else if (packetType === 13) { // PINGRESP
        // Heartbeat respondido
      }

      pos = packetEnd;
    }
  }

  dispatchTopicMessage(topic, payload) {
    const subs = this.subscriptions.get(topic);
    if (subs) {
      for (const cb of subs) {
        try {
          cb(payload);
        } catch (err) {
          console.error('[RealtimeTransport] Erro no listener do tópico ' + topic + ':', err);
        }
      }
    }
  }

  startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === 1) {
        try {
          this.ws.send(makePingPacket());
        } catch (e) {}
      }
    }, 25000);
  }

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  resubscribeAll() {
    if (!this.isConnected || !this.ws || this.ws.readyState !== 1) return;
    for (const topic of this.subscriptions.keys()) {
      try {
        this.ws.send(makeSubscribePacket(topic, this.nextPacketId()));
      } catch (e) {
        console.warn('[RealtimeTransport] Falha ao reinscrever em ' + topic + ':', e);
      }
    }
  }

  flushOutbox() {
    if (!this.isConnected || !this.ws || this.ws.readyState !== 1) return;
    while (this.outbox.length > 0) {
      const item = this.outbox.shift();
      try {
        const msgStr = typeof item.message === 'string' ? item.message : JSON.stringify(item.message);
        this.ws.send(makePublishPacket(item.topic, msgStr));
      } catch (e) {
        console.warn('[RealtimeTransport] Falha ao enviar mensagem da outbox:', e);
      }
    }
  }

  nextPacketId() {
    this.packetId = (this.packetId + 1) & 0xffff;
    return this.packetId === 0 ? 1 : this.packetId;
  }

  subscribe(topic, callback) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
      if (this.isConnected && this.ws && this.ws.readyState === 1) {
        try {
          this.ws.send(makeSubscribePacket(topic, this.nextPacketId()));
        } catch (e) {
          console.warn('[RealtimeTransport] Falha ao subscrever em ' + topic + ':', e);
        }
      }
    }
    this.subscriptions.get(topic).add(callback);

    if (!this.isConnected && !this.isConnecting) {
      this.connect();
    }

    return () => this.unsubscribe(topic, callback);
  }

  unsubscribe(topic, callback) {
    const subs = this.subscriptions.get(topic);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        this.subscriptions.delete(topic);
      }
    }
  }

  publish(topic, message) {
    if (this.isConnected && this.ws && this.ws.readyState === 1) {
      try {
        const msgStr = typeof message === 'string' ? message : JSON.stringify(message);
        this.ws.send(makePublishPacket(topic, msgStr));
      } catch (e) {
        console.warn('[RealtimeTransport] Erro ao publicar pacote, enfileirando:', e);
        this.queueMessage(topic, message);
      }
    } else {
      this.queueMessage(topic, message);
      if (!this.isConnected && !this.isConnecting) {
        this.connect();
      }
    }
  }

  queueMessage(topic, message) {
    if (this.outbox.length > 60) {
      this.outbox.shift();
    }
    this.outbox.push({ topic, message });
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.isConnected ? 'connected' : (this.isConnecting ? 'connecting' : 'disconnected'));
    return () => this.statusListeners.delete(callback);
  }

  notifyStatus(status) {
    for (const cb of this.statusListeners) {
      try { cb(status); } catch (e) {}
    }
  }

  disconnect() {
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    this.notifyStatus('disconnected');
  }
}
