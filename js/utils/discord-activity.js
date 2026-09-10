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

    // Identifica o Client ID da aplicação
    let clientId = this.params.get('client_id');
    if (!clientId && window.location.hostname.includes('.discordsays.com')) {
      clientId = window.location.hostname.split('.')[0];
    }
    if (!clientId) {
      clientId = window.PAROXISMO_DISCORD_CLIENT_ID || '1348508498877546517';
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
    badge.className = 'fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-[#07090e]/95 border border-[#5865F2]/70 px-3 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(88,101,242,0.4)] text-xs font-mono select-none pointer-events-auto rounded-none';

    badge.innerHTML = `
      <img src="${this.getAvatarUrl()}" class="w-4 h-4 rounded-full border border-[#5865F2]" />
      <span class="text-white font-bold tracking-wider">${this.user.global_name || this.user.username}</span>
      <span class="text-[#5865F2] text-[10px] font-black tracking-widest">[ 🎮 DISCORD ATIVO ]</span>
    `;

    document.body.appendChild(badge);
  }
}