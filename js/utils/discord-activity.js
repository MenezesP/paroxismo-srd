/**
 * PAROXISMO — Integração Nativa de Discord Activity (Embedded App SDK)
 * Permite que o site funcione perfeitamente dentro de canais de voz do Discord
 * como uma Activity, mantendo 100% de compatibilidade fora do Discord.
 */

import { DiscordSDK, patchUrlMappings } from '../vendor/discord-sdk.mjs';

export class DiscordActivity {
  constructor() {
    this.params = new URLSearchParams(window.location.search);
    this.isDiscord = this.params.has('frame_id') || 
                     window.location.hostname.includes('discordsays.com') ||
                     window.location.search.includes('instance_id');
    this.instanceId = this.params.get('instance_id') || 'paroxismo_main';
    this.channelId = this.params.get('channel_id') || null;
    this.sdk = null;
    this.user = null;
    this.auth = null;
  }

  async init() {
    if (!this.isDiscord) {
      console.log('[Discord Activity] Executando em navegador regular (Modo SRD Standalone).');
      return { isDiscord: false };
    }

    console.log('[Discord Activity] Ambiente Discord Activity detectado!');
    document.documentElement.classList.add('discord-activity-mode');
    document.body.classList.add('discord-activity-mode');

    // Identifica o Client ID da aplicação
    let clientId = this.params.get('client_id');
    if (!clientId && window.location.hostname.includes('.discordsays.com')) {
      clientId = window.location.hostname.split('.')[0];
    }
    if (!clientId) {
      clientId = window.PAROXISMO_DISCORD_CLIENT_ID || '1547469610616623174';
    }

    try {
      this.sdk = new DiscordSDK(clientId);
      console.log('[Discord Activity] Inicializando DiscordSDK...');
      await this.sdk.ready();

      // Redireciona chamadas /api pelo proxy interno do Discord
      try {
        patchUrlMappings([{ prefix: '/api', target: window.location.host }]);
      } catch (e) {
        console.warn('[Discord Activity] patchUrlMappings aviso:', e);
      }

      // Autenticação OAuth2 transparente com Discord
      try {
        const { code } = await this.sdk.commands.authorize({
          client_id: clientId,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify', 'guilds', 'rpc.activities.write']
        });

        const tokenRes = await fetch('/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        if (tokenRes.ok) {
          const { access_token } = await tokenRes.json();
          this.auth = await this.sdk.commands.authenticate({ access_token });
          this.user = this.auth.user;
          console.log(`[Discord Activity] Conectado como ${this.user.username}!`);
        }
      } catch (authErr) {
        console.warn('[Discord Activity] Autenticação OAuth2 não concluída, usando perfil local:', authErr);
      }

      // Se não autenticou com OAuth2, usa fallback com ID da sessão
      if (!this.user) {
        const tempId = this.params.get('user_id') || ('agente_' + Math.floor(Math.random() * 1000));
        this.user = {
          id: tempId,
          username: 'Agente_' + tempId.slice(-4),
          global_name: 'Agente do Avesso',
          avatar: null
        };
      }

      // Expõe dados de sessão globalmente
      window.PAROXISMO_USER_ID = this.user.id;
      window.PAROXISMO_USER_NAME = this.user.global_name || this.user.username;
      window.PAROXISMO_IS_DISCORD = true;
      window.PAROXISMO_INSTANCE_ID = this.instanceId;

      this.injectDiscordBadge();

      return { isDiscord: true, user: this.user, instanceId: this.instanceId };
    } catch (err) {
      console.error('[Discord Activity] Erro na inicialização do SDK:', err);
      return { isDiscord: true, error: err.message };
    }
  }

  getAvatarUrl() {
    if (!this.user || !this.user.avatar) {
      return 'https://cdn.discordapp.com/embed/avatars/0.png';
    }
    return `https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatar}.png?size=64`;
  }

  injectDiscordBadge() {
    const existing = document.getElementById('discord-activity-hud-badge');
    if (existing) existing.remove();

    const badge = document.createElement('div');
    badge.id = 'discord-activity-hud-badge';
    badge.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 9990; display: flex; align-items: center; gap: 8px; background: rgba(7,9,14,0.95); border: 1px solid rgba(88,101,242,0.7); padding: 4px 10px; font-family: monospace; font-size: 11px; white-space: nowrap; box-shadow: 0 0 15px rgba(88,101,242,0.4);';

    badge.innerHTML = `
      <img src="${this.getAvatarUrl()}" style="width: 18px; height: 18px; min-width: 18px; max-width: 18px; max-height: 18px; border-radius: 9999px; object-fit: cover; border: 1px solid #5865F2;" />
      <span style="color: #ffffff; font-weight: bold;">${this.user.global_name || this.user.username}</span>
      <span style="color: #5865F2; font-size: 9px; font-weight: 900; letter-spacing: 0.1em;">[ 🎮 DISCORD ATIVO ]</span>
    `;

    document.body.appendChild(badge);
  }
}