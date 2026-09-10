/**
 * PAROXISMO - SRD COMPENDIUM
 * Módulo: Gerador de Dossiê Impresso de Alta Fidelidade (1800x2546 A4 AAA Collector's Edition)
 * Direção de Arte Sênior: Dossiê Governamental Confidencial & Grimório Ocultista
 * Inspirações: Signalis, Control, Hunt: Showdown, Darkest Dungeon, Diablo IV, Persona 5, Alien Isolation
 */

import { SKILLS_DATA } from '../data/skills-origins.js';

export class SheetImageGenerator {
  static generate(character, stats) {
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 2546;
    const ctx = canvas.getContext('2d');

    // ============================================================
    // 1. BASE TEXTURIZADA DE PAPEL CARTÃO PRETO & MARCAS DE IMPRESSÃO
    // ============================================================
    this.drawBackgroundAtmosphere(ctx, canvas.width, canvas.height);

    // ============================================================
    // 2. CABEÇALHO DO DOSSIÊ (CLASSIFICAÇÃO, PROTOCOLOS, CARIMBOS)
    // ============================================================
    this.drawDossierHeader(ctx, canvas.width, character, stats);

    // ============================================================
    // 3. CARTÃO DE IDENTIDADE MILITAR DO AGENTE (ID CARD DOSSIÊ)
    // ============================================================
    this.drawAgentIdentityCard(ctx, 70, 195, 1660, 140, character, stats);

    // ============================================================
    // 4. MATRIZ RITUALÍSTICA DOS 5 ATRIBUTOS (LADO ESQUERDO)
    // ============================================================
    this.drawRitualAttributeMatrix(ctx, 460, 640, 205, character.attributes);

    // ============================================================
    // 5. INSTRUMENTOS FÍSICOS & PLACAS VITAIS (LADO DIREITO)
    // ============================================================
    this.drawVitalInstruments(ctx, 890, 360, 840, 560, character, stats);

    // ============================================================
    // 6. TARJAS DE RISCO ELEMENTAL // EMOÇÕES DUAIS E FUSÃO
    // ============================================================
    this.drawHazardEmotions(ctx, 70, 945, 1660, 145, character, stats);

    // ============================================================
    // 7. ATLAS DE PERÍCIAS // 5 DISCIPLINAS EM CHECKLIST DE CAMPO
    // ============================================================
    this.drawSkillsFieldReport(ctx, 70, 1115, 1660, 645, character, stats);

    // ============================================================
    // 8. ARSENAL BÉLICO // MANIFESTO DE ARMAS DO AVESSO
    // ============================================================
    this.drawArmoryManifest(ctx, 70, 1785, 1660, 675, character, stats);

    // ============================================================
    // 9. RODAPÉ TÉCNICO LITÚRGICO
    // ============================================================
    this.drawTechnicalFooter(ctx, canvas.width, canvas.height, character, stats);

    return canvas.toDataURL('image/png');
  }

  // ------------------------------------------------------------
  // 1. ATMOSFERA E BORDAS TÉCNICAS DE IMPRESSÃO
  // ------------------------------------------------------------
  static drawBackgroundAtmosphere(ctx, w, h) {
    ctx.save();

    // Fundo preto profundo e texturizado
    ctx.fillStyle = '#06070a';
    ctx.fillRect(0, 0, w, h);

    // Iluminação sombria radial
    const rad = ctx.createRadialGradient(900, 1273, 150, 900, 1273, 1300);
    rad.addColorStop(0, '#101420');
    rad.addColorStop(0.45, '#080a11');
    rad.addColorStop(0.85, '#040508');
    rad.addColorStop(1, '#020204');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);

    // Ruído/Hachuras sutis e linhas milimétricas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let x = 70; x < w; x += 140) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 70; y < h; y += 140) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Moldura Dupla Militar
    ctx.strokeStyle = '#22293a';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, w - 72, h - 72);

    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(46, 46, w - 92, h - 92);

    // Marcas de Registro e Corte Gráfico nos 4 Cantos (Crop Marks)
    this.drawCropMark(ctx, 46, 46);
    this.drawCropMark(ctx, w - 46, 46);
    this.drawCropMark(ctx, 46, h - 46);
    this.drawCropMark(ctx, w - 46, h - 46);

    // Régua Milimétrica Tática no Topo
    ctx.fillStyle = '#475569';
    ctx.font = "700 8px 'JetBrains Mono', monospace";
    for (let i = 80; i < w - 80; i += 20) {
      const isMajor = (i - 80) % 100 === 0;
      ctx.strokeStyle = isMajor ? '#e21b23' : '#334155';
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(i, 46);
      ctx.lineTo(i, isMajor ? 58 : 52);
      ctx.stroke();
      if (isMajor && i < w - 120) {
        ctx.fillText(`${(i - 80) / 10}mm`, i + 2, 66);
      }
    }

    // Micro-tipografia Vertical na Margem Esquerda
    ctx.save();
    ctx.translate(22, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#475569';
    ctx.font = "800 9px 'JetBrains Mono', monospace";
    ctx.letterSpacing = '3px';
    ctx.textAlign = 'center';
    ctx.fillText("CLASSIFIED DOCUMENT // PAROXISMO ARCHIVE OMEGA-0921-A // DEMIURGE PROPERTY // STRICT RETENTION", 0, 0);
    ctx.restore();

    ctx.restore();
  }

  static drawCropMark(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 18, y);
    ctx.lineTo(x + 18, y);
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y + 18);
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------
  // 2. CABEÇALHO DO DOSSIÊ MILITAR
  // ------------------------------------------------------------
  static drawDossierHeader(ctx, w, char, stats) {
    ctx.save();

    // Código de Barras Militar no Canto Superior Esquerdo
    const bx = 70;
    const by = 80;
    ctx.fillStyle = '#ffffff';
    let barX = bx;
    const barPattern = [3,1,2,4,1,3,2,1,4,2,3,1,2,1,4,2,1,3,1,2,3,4,1,2,1,3,2];
    barPattern.forEach((pw, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#cbd0dc' : '#06070a';
      ctx.fillRect(barX, by, pw * 2.5, 32);
      barX += pw * 2.5;
    });
    ctx.fillStyle = '#e21b23';
    ctx.font = "800 9px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText("PRT-990-OMEGA // SEC-CLEARANCE-VI", bx, by + 46);

    // Título Central Brutalista Monumental: PAROXISMO
    const cx = w / 2;
    ctx.fillStyle = '#ffffff';
    ctx.font = "900 56px 'Cinzel', serif";
    ctx.textAlign = 'center';
    ctx.letterSpacing = '8px';
    ctx.shadowColor = 'rgba(226, 27, 35, 0.4)';
    ctx.shadowBlur = 20;
    ctx.fillText("PAROXISMO", cx, 115);
    ctx.shadowBlur = 0;

    // Faixa Vermelha Litúrgica
    ctx.fillStyle = '#e21b23';
    ctx.font = "800 11px 'JetBrains Mono', monospace";
    ctx.letterSpacing = '3px';
    ctx.fillText("FICHA DE AGENTE DESPERTO // DOSSIÊ DE CONTENÇÃO // SISTEMA D20", cx, 142);

    // Carimbo Vermelho de "CLASSIFICADO" Angulado à Direita
    ctx.save();
    ctx.translate(1560, 110);
    ctx.rotate(-0.1);
    ctx.fillStyle = '#e21b23';
    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-130, -26, 260, 52);
    ctx.font = "900 14px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText("CLASSIFICADO", 0, -2);
    ctx.font = "800 8px 'JetBrains Mono', monospace";
    ctx.fillText("DESTRUIÇÃO IMEDIATA PÓS-LEITURA", 0, 16);
    ctx.restore();

    // Linha Divisória com Miras Técnicas
    ctx.strokeStyle = '#222938';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(70, 172);
    ctx.lineTo(w - 70, 172);
    ctx.stroke();

    ctx.restore();
  }

  // ------------------------------------------------------------
  // 3. CARTÃO DE IDENTIDADE MILITAR (ID CARD DOSSIÊ)
  // ------------------------------------------------------------
  static drawAgentIdentityCard(ctx, x, y, w, h, char, stats) {
    ctx.save();

    // Caixa de Aço Chanfrada
    ctx.fillStyle = '#0a0d15';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#263045';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Detalhe de Chanfro no Canto Superior Esquerdo
    ctx.fillStyle = '#e21b23';
    ctx.fillRect(x, y, 6, h);

    // 1. Moldura de Retrato / Silhueta do Agente
    const photoW = 105;
    const photoH = h - 20;
    const px = x + 18;
    const py = y + 10;
    ctx.fillStyle = '#050609';
    ctx.fillRect(px, py, photoW, photoH);
    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, py, photoW, photoH);

    // Clipe de Fixação Metálico
    ctx.fillStyle = '#64748b';
    ctx.fillRect(px + photoW / 2 - 8, py - 6, 16, 12);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + photoW / 2 - 8, py - 6, 16, 12);

    // Carimbo interno na foto
    ctx.fillStyle = '#8e95a5';
    ctx.font = "800 8px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText("RETRATO", px + photoW / 2, py + photoH / 2 - 8);
    ctx.fillStyle = '#e21b23';
    ctx.font = "900 10px 'JetBrains Mono', monospace";
    ctx.fillText(`NV 0${char.level}`, px + photoW / 2, py + photoH / 2 + 10);

    // 2. Informações de Identidade em Linhas Militares
    const infoX = px + photoW + 24;

    // Linha 1: Nome Monumental do Agente
    ctx.fillStyle = '#8e95a5';
    ctx.font = "800 10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText("// NOME DE REGISTRO DO SUJEITO:", infoX, y + 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 28px 'Cinzel', serif";
    ctx.letterSpacing = '1px';
    ctx.fillText((char.name || "AGENTE NÃO IDENTIFICADO").toUpperCase(), infoX, y + 68);

    // Linha 2: Quatro Colunas de Dados Técnicos
    const colY = y + 92;
    const colW = (w - (infoX - x) - 40) / 4;

    const dataCols = [
      { label: "CLASSE & ARQUÉTIPO", val: `${stats.cls.name.toUpperCase()} (NÍVEL ${char.level})`, color: '#ff333d' },
      { label: "PAPEL TÁTICO", val: stats.cls.tacticalRole.toUpperCase(), color: '#cbd0dc' },
      { label: "ORIGEM PRE-ESTRONDO", val: stats.orig.name.toUpperCase(), color: '#cbd0dc' },
      { label: "JOGADOR / CONDUTOR", val: (char.player || "JOGADOR").toUpperCase(), color: '#8e95a5' }
    ];

    dataCols.forEach((col, idx) => {
      const cx = infoX + idx * colW;
      ctx.fillStyle = '#64748b';
      ctx.font = "800 9px 'JetBrains Mono', monospace";
      ctx.fillText(col.label, cx, colY);

      ctx.fillStyle = col.color;
      ctx.font = "800 12px 'JetBrains Mono', monospace";
      ctx.fillText(col.val, cx, colY + 22);
    });

    ctx.restore();
  }

  // ------------------------------------------------------------
  // 4. MATRIZ RITUALÍSTICA DOS ATRIBUTOS (DISPOSITIVO DE ANÁLISE)
  // ------------------------------------------------------------
  static drawRitualAttributeMatrix(ctx, cx, cy, radius, attrs) {
    ctx.save();

    // Título do Dispositivo de Análise
    ctx.fillStyle = '#e21b23';
    ctx.font = "900 13px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText("[ MATRIZ RITUALÍSTICA // TRANSMUTAÇÃO CORPORAL ]", cx, cy - radius - 45);

    // Círculos Técnicos Graduados (0° a 360°)
    ctx.strokeStyle = 'rgba(226, 27, 35, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2);
    ctx.stroke();

    // Graduação em Ticks a cada 15°
    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 45 === 0;
      const r1 = radius + 20;
      const r2 = isMajor ? radius + 32 : radius + 26;
      ctx.strokeStyle = isMajor ? '#e21b23' : '#334155';
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + r1 * Math.cos(rad), cy + r1 * Math.sin(rad));
      ctx.lineTo(cx + r2 * Math.cos(rad), cy + r2 * Math.sin(rad));
      ctx.stroke();
    }

    // Os 5 Eixos Cardinais
    const axisConfig = [
      { key: 'agi', label: 'AGI', latin: 'AGILITAS', angle: -90 },
      { key: 'int', label: 'INT', latin: 'INTELLECTUS', angle: -18 },
      { key: 'vig', label: 'VIG', latin: 'VIGOR', angle: 54 },
      { key: 'pre', label: 'PRE', latin: 'PRAESENTIA', angle: 126 },
      { key: 'for', label: 'FOR', latin: 'FORTITUDO', angle: 198 }
    ];

    const pts = axisConfig.map(a => {
      const rad = (a.angle * Math.PI) / 180;
      return {
        x: cx + radius * Math.cos(rad),
        y: cy + radius * Math.sin(rad),
        ...a
      };
    });

    // Linhas Estelares Conectadas com Brilho Carmesim
    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#e21b23';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    const starOrder = [0, 2, 4, 1, 3, 0];
    starOrder.forEach((idx, i) => {
      if (i === 0) ctx.moveTo(pts[idx].x, pts[idx].y);
      else ctx.lineTo(pts[idx].x, pts[idx].y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Polígono Interno Escuro de Tensão
    ctx.fillStyle = 'rgba(226, 27, 35, 0.12)';
    ctx.beginPath();
    starOrder.forEach((idx, i) => {
      if (i === 0) ctx.moveTo(pts[idx].x, pts[idx].y);
      else ctx.lineTo(pts[idx].x, pts[idx].y);
    });
    ctx.fill();

    // 5 Placas Metálicas Circulares Gravadas nos Vértices
    pts.forEach(pt => {
      const nodeR = 48;

      // Placa externa de ferro escuro
      ctx.fillStyle = '#080a12';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, nodeR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#e21b23';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Anel interno gravado com rebites
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, nodeR - 6, 0, Math.PI * 2);
      ctx.stroke();

      // Nome do Atributo & Latim
      ctx.fillStyle = '#ff333d';
      ctx.font = "900 13px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(pt.label, pt.x, pt.y - 14);

      ctx.fillStyle = '#64748b';
      ctx.font = "700 7px 'JetBrains Mono', monospace";
      ctx.fillText(pt.latin, pt.x, pt.y - 4);

      // Valor Numérico Gigante em Tipografia Stencil / Cinzel
      ctx.fillStyle = '#ffffff';
      ctx.font = "900 32px 'Cinzel', serif";
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.fillText(String(attrs[pt.key] || 0), pt.x, pt.y + 26);
      ctx.shadowBlur = 0;
    });

    // Runa Central do Avesso
    ctx.fillStyle = '#050609';
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 12px 'Cinzel', serif";
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center';
    ctx.fillText("AVESSO", cx, cy + 4);

    ctx.restore();
  }

  // ------------------------------------------------------------
  // 5. INSTRUMENTOS FÍSICOS & PLACAS VITAIS (PV, PE, DEFESA, CD)
  // ------------------------------------------------------------
  static drawVitalInstruments(ctx, x, y, w, h, char, stats) {
    ctx.save();

    // 1. Estandarte / Placa de PV (Pontos de Vida)
    const pvW = 265;
    const pvH = 340;
    const pvx = x;
    const pvy = y;

    this.drawMilitaryPlate(ctx, pvx, pvy, pvW, pvH, '#e21b23');

    ctx.fillStyle = '#e21b23';
    ctx.font = "900 12px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText("[ VITALIDADE BIOLÓGICA ]", pvx + pvW / 2, pvy + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 48px 'Cinzel', serif";
    ctx.fillText("PV", pvx + pvW / 2, pvy + 82);

    ctx.fillStyle = '#8e95a5';
    ctx.font = "700 9px 'JetBrains Mono', monospace";
    ctx.fillText("PONTOS DE VIDA (VIGOR + CLASSE)", pvx + pvW / 2, pvy + 104);

    // Valor Gigante
    ctx.fillStyle = '#ffffff';
    ctx.font = "900 56px 'JetBrains Mono', monospace";
    ctx.fillText(String(char.currentPv), pvx + pvW / 2, pvy + 180);

    ctx.fillStyle = '#ff333d';
    ctx.font = "800 16px 'JetBrains Mono', monospace";
    ctx.fillText(`/ ${stats.maxPv} MÁX`, pvx + pvW / 2, pvy + 214);

    // Barra física de fluido vital
    const barW = pvW - 48;
    const barH = 14;
    const barX = pvx + 24;
    const barY = pvy + 235;
    ctx.fillStyle = '#030406';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    const fillRatio = Math.max(0, Math.min(1, char.currentPv / stats.maxPv));
    ctx.fillStyle = '#e21b23';
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * fillRatio, barH - 4);

    ctx.fillStyle = '#64748b';
    ctx.font = "700 9px 'JetBrains Mono', monospace";
    ctx.fillText(`LIMIAR DE MORTE: -${char.attributes.vig || 0} PV`, pvx + pvW / 2, pvy + 285);
    ctx.fillText("RECUPERAÇÃO: DESCANSO EM CAMPO", pvx + pvW / 2, pvy + 305);

    // 2. Estandarte / Placa de PE (Pontos de Esforço)
    const peW = 265;
    const peH = 340;
    const pex = x + 285;
    const pey = y;

    this.drawMilitaryPlate(ctx, pex, pey, peW, peH, '#06b6d4');

    ctx.fillStyle = '#06b6d4';
    ctx.font = "900 12px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText("[ CONDENSADOR ARCANO ]", pex + peW / 2, pey + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 48px 'Cinzel', serif";
    ctx.fillText("PE", pex + peW / 2, pey + 82);

    ctx.fillStyle = '#8e95a5';
    ctx.font = "700 9px 'JetBrains Mono', monospace";
    ctx.fillText("PONTOS DE ESFORÇO (PRESENÇA)", pex + peW / 2, pey + 104);

    // Valor Gigante
    ctx.fillStyle = '#06b6d4';
    ctx.font = "900 56px 'JetBrains Mono', monospace";
    ctx.fillText(String(char.currentPe), pex + peW / 2, pey + 180);

    ctx.fillStyle = '#e0f2fe';
    ctx.font = "800 16px 'JetBrains Mono', monospace";
    ctx.fillText(`/ ${stats.maxPe} MÁX`, pex + peW / 2, pey + 214);

    // Barra física de fluido arcano
    const peFill = Math.max(0, Math.min(1, char.currentPe / stats.maxPe));
    ctx.fillStyle = '#030406';
    ctx.fillRect(pex + 24, barY, barW, barH);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.strokeRect(pex + 24, barY, barW, barH);

    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(pex + 26, barY + 2, (barW - 4) * peFill, barH - 4);

    ctx.fillStyle = '#64748b';
    ctx.font = "700 9px 'JetBrains Mono', monospace";
    ctx.fillText(`LIMITE/RODADA: ${stats.peLimit} PE`, pex + peW / 2, pey + 285);
    ctx.fillText("CONSUMIDO EM RITUAIS E TALENTOS", pex + peW / 2, pey + 305);

    // 3. Escudo Heráldico de Defesa / AC
    const defW = 270;
    const defH = 340;
    const defX = x + 570;
    const defY = y;

    this.drawMilitaryPlate(ctx, defX, defY, defW, defH, '#e21b23');

    // Escudo Gravado
    const sx = defX + defW / 2;
    const sy = defY + 140;
    const sw = 130;
    const sh = 150;

    ctx.beginPath();
    ctx.moveTo(sx - sw / 2, sy - sh / 2);
    ctx.lineTo(sx + sw / 2, sy - sh / 2);
    ctx.lineTo(sx + sw / 2, sy + 15);
    ctx.quadraticCurveTo(sx + sw / 2, sy + sh / 2, sx, sy + sh / 2 + 15);
    ctx.quadraticCurveTo(sx - sw / 2, sy + sh / 2, sx - sw / 2, sy + 15);
    ctx.closePath();
    ctx.fillStyle = '#0e121c';
    ctx.fill();
    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#e21b23';
    ctx.font = "900 12px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText("[ ARMOR CLASS // DEFESA ]", defX + defW / 2, defY + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 62px 'JetBrains Mono', monospace";
    ctx.fillText(String(stats.defense), sx, sy + 18);

    ctx.fillStyle = '#8e95a5';
    ctx.font = "800 10px 'JetBrains Mono', monospace";
    ctx.fillText("DEFESA PASSIVA", sx, sy + 44);

    ctx.fillStyle = '#cbd0dc';
    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillText(`PROTEÇÃO: ${stats.protName.toUpperCase()}`, defX + defW / 2, defY + 285);
    ctx.fillStyle = '#64748b';
    ctx.fillText("FÓRMULA: 10 + AGI + BLINDAGEM", defX + defW / 2, defY + 305);

    // 4. Três Mostradores Inferiores (Iniciativa, CD Rituais, Corrupção)
    const subY = y + 360;
    const subH = 125;

    // Iniciativa
    this.drawSubGauge(ctx, x, subY, pvW, subH, "INICIATIVA DE COMBATE", `+${stats.initiativeBonus}`, "TESTE: 1d20 + AGI", '#ffffff');

    // CD Rituais
    this.drawSubGauge(ctx, pex, subY, peW, subH, "CD DOS RITUAIS", `CD ${stats.ritualDc}`, "10 + ATRIBUTO + TREINO", '#ffffff');

    // Corrupção
    this.drawSubGauge(ctx, defX, subY, defW, subH, "PAROXISMO // CORRUPÇÃO", stats.paroxismoPct, `CAPACIDADE DE CARGA: ${stats.cargoCapacity}`, '#ff333d');

    ctx.restore();
  }

  static drawMilitaryPlate(ctx, x, y, w, h, borderColor) {
    ctx.fillStyle = '#080a12';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#1e2638';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Cantos chanfrados em detalhe
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  }

  static drawSubGauge(ctx, x, y, w, h, label, val, sub, valColor) {
    ctx.fillStyle = '#080a12';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#1e2638';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = '#8e95a5';
    ctx.font = "800 9px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(`// ${label}`, x + w / 2, y + 26);

    ctx.fillStyle = valColor;
    ctx.font = "900 32px 'JetBrains Mono', monospace";
    ctx.fillText(val, x + w / 2, y + 72);

    ctx.fillStyle = '#64748b';
    ctx.font = "700 8px 'JetBrains Mono', monospace";
    ctx.fillText(sub, x + w / 2, y + 102);
  }

  // ------------------------------------------------------------
  // 6. TARJAS DE RISCO ELEMENTAL // EMOÇÕES DUAIS
  // ------------------------------------------------------------
  static drawHazardEmotions(ctx, x, y, w, h, char, stats) {
    ctx.save();

    const boxW = (w - 30) / 2;

    // Tarja 1: Emoção Dominante
    ctx.fillStyle = '#0a0d15';
    ctx.fillRect(x, y, boxW, h);
    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, boxW, h);

    ctx.fillStyle = '#e21b23';
    ctx.fillRect(x, y, 8, h);

    ctx.fillStyle = '#e21b23';
    ctx.font = "900 11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText("[ LAUDO DE CONTENÇÃO // 1ª EMOÇÃO DOMINANTE ]", x + 24, y + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 24px 'Cinzel', serif";
    ctx.fillText(stats.primaryEmoObj.name.toUpperCase(), x + 24, y + 66);

    ctx.fillStyle = '#cbd0dc';
    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillText(`DANO ELEMENTAL: ${stats.primaryEmoObj.dmgType.toUpperCase()}`, x + 24, y + 94);

    ctx.fillStyle = '#8e95a5';
    ctx.font = "italic 10px 'Cinzel', serif";
    ctx.fillText(`"${stats.primaryEmoObj.subtitles}"`, x + 24, y + 120);

    // Tarja 2: Emoção Latente & Fusão Híbrida
    const x2 = x + boxW + 30;
    ctx.fillStyle = '#0a0d15';
    ctx.fillRect(x2, y, boxW, h);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(x2, y, boxW, h);

    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(x2, y, 8, h);

    ctx.fillStyle = '#06b6d4';
    ctx.font = "900 11px 'JetBrains Mono', monospace";
    ctx.fillText("[ MATRIZ HÍBRIDA // 2ª EMOÇÃO LATENTE ]", x2 + 24, y + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 24px 'Cinzel', serif";
    const fusionName = stats.fusion ? ` • FUSÃO: ${stats.fusion.name.toUpperCase()}` : '';
    ctx.fillText(`${stats.secondaryEmoObj.name.toUpperCase()}${fusionName}`, x2 + 24, y + 66);

    ctx.fillStyle = '#cbd0dc';
    ctx.font = "700 10px 'JetBrains Mono', monospace";
    const fusionDesc = stats.fusion ? stats.fusion.desc : stats.secondaryEmoObj.subtitles;
    ctx.fillText(`REPERCUSSÃO TÁTICA: ${fusionDesc.substring(0, 75)}...`, x2 + 24, y + 94);

    ctx.fillStyle = '#8e95a5';
    ctx.font = "italic 10px 'Cinzel', serif";
    ctx.fillText(`REQUISITO MÁGICO: 200 RITUAIS COMPATÍVEIS NO GRIMÓRIO`, x2 + 24, y + 120);

    ctx.restore();
  }

  // ------------------------------------------------------------
  // 7. ATLAS DE PERÍCIAS // 5 DISCIPLINAS EM CHECKLIST DE CAMPO
  // ------------------------------------------------------------
  static drawSkillsFieldReport(ctx, x, y, w, h, char, stats) {
    ctx.save();

    // Quadro Geral do Atlas
    ctx.fillStyle = '#07090e';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#232b3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Barra Superior do Atlas
    ctx.fillStyle = '#0e121c';
    ctx.fillRect(x, y, w, 36);
    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 12px 'Cinzel', serif";
    ctx.textAlign = 'left';
    ctx.fillText("ATLAS DE CONHECIMENTOS & PERÍCIAS DE INVESTIGAÇÃO (D20)", x + 24, y + 24);

    ctx.fillStyle = '#e21b23';
    ctx.font = "800 11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'right';
    ctx.fillText(`[ BÔNUS DE TREINAMENTO ATUAL: ${stats.trainingBonus} ]`, x + w - 24, y + 24);

    // Os 5 Grupos Canônicos de Perícias
    const categories = [
      { id: "Combate", tag: "CBT", skills: ["luta", "pontaria", "iniciativa"] },
      { id: "Física", tag: "FIS", skills: ["acrobacia", "atletismo", "fortitude", "furtividade", "pilotagem", "reflexos"] },
      { id: "Social", tag: "SOC", skills: ["adestramento", "artes", "diplomacia", "enganacao", "intimidacao", "intuicao"] },
      { id: "Intelectual", tag: "INT", skills: ["atualidades", "ciencias", "investigacao", "profissao", "sobrevivencia", "tatica", "tecnologia"] },
      { id: "Paranormal", tag: "PAR", skills: ["medicina", "ocultismo", "percepcao", "religiao", "vontade", "crime"] }
    ];

    const colW = (w - 40) / 5;
    const colTop = y + 50;

    categories.forEach((cat, cIdx) => {
      const colX = x + 10 + cIdx * (colW + 5);

      // Divisória de Coluna
      ctx.fillStyle = '#0a0d15';
      ctx.fillRect(colX, colTop, colW, h - 65);
      ctx.strokeStyle = '#181e2b';
      ctx.lineWidth = 1;
      ctx.strokeRect(colX, colTop, colW, h - 65);

      // Cabeçalho da Disciplina
      ctx.fillStyle = '#e21b23';
      ctx.font = "900 10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText(`[ ${cat.tag} ] ${cat.id.toUpperCase()}`, colX + 12, colTop + 24);

      // Linha separadora
      ctx.strokeStyle = '#222a3a';
      ctx.beginPath();
      ctx.moveTo(colX + 10, colTop + 34);
      ctx.lineTo(colX + colW - 10, colTop + 34);
      ctx.stroke();

      // Perícias da Disciplina
      let rowY = colTop + 56;
      cat.skills.forEach(skillId => {
        const skill = SKILLS_DATA.find(s => s.id === skillId);
        if (!skill) return;

        const isTrained = char.trainedSkills.includes(skill.id);
        const baseAttr = skill.attr.toLowerCase().split('/')[0].trim();
        const attrMod = char.attributes[baseAttr] || 0;
        const totalBonus = isTrained ? (attrMod + stats.trainingBonusVal) : 0;
        const signBonus = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

        // Marcador Checkbox Stencil
        if (isTrained) {
          ctx.fillStyle = '#e21b23';
          ctx.fillRect(colX + 12, rowY - 10, 10, 10);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(colX + 12, rowY - 10, 10, 10);
        } else {
          ctx.strokeStyle = '#384259';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(colX + 12, rowY - 10, 10, 10);
        }

        // Nome da Perícia
        ctx.fillStyle = isTrained ? '#ffffff' : '#94a3b8';
        ctx.font = isTrained ? "800 11px 'JetBrains Mono', monospace" : "600 11px 'JetBrains Mono', monospace";
        ctx.fillText(skill.name.toUpperCase(), colX + 28, rowY);

        // Atributo e Modificador
        ctx.fillStyle = isTrained ? '#ff333d' : '#cbd0dc';
        ctx.font = isTrained ? "900 11px 'JetBrains Mono', monospace" : "700 10px 'JetBrains Mono', monospace";
        ctx.textAlign = 'right';
        ctx.fillText(signBonus, colX + colW - 12, rowY);
        ctx.textAlign = 'left';

        // Sublinhado para treinada
        if (isTrained) {
          ctx.strokeStyle = 'rgba(226, 27, 35, 0.4)';
          ctx.beginPath();
          ctx.moveTo(colX + 28, rowY + 4);
          ctx.lineTo(colX + colW - 12, rowY + 4);
          ctx.stroke();
        }

        rowY += 28;
      });
    });

    ctx.restore();
  }

  // ------------------------------------------------------------
  // 8. ARSENAL BÉLICO // MANIFESTO DE ARMAS DO AVESSO
  // ------------------------------------------------------------
  static drawArmoryManifest(ctx, x, y, w, h, char, stats) {
    ctx.save();

    // Quadro do Arsenal
    ctx.fillStyle = '#07090e';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#232b3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Barra de Cabeçalho
    ctx.fillStyle = '#0e121c';
    ctx.fillRect(x, y, w, 36);
    ctx.strokeStyle = '#e21b23';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 12px 'Cinzel', serif";
    ctx.textAlign = 'left';
    ctx.fillText("ARSENAL BÉLICO // MANIFESTO DE ARMAS EMPUNHADAS", x + 24, y + 24);

    ctx.fillStyle = '#8e95a5';
    ctx.font = "800 11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'right';
    ctx.fillText("AUTORIZAÇÃO LITÚRGICA DEMIURGO", x + w - 24, y + 24);

    // Tiras Horizontais de Equipamento
    const weapons = char.customWeapons || [];
    const stripH = 135;
    const stripYStart = y + 54;

    weapons.forEach((wpn, idx) => {
      const sy = stripYStart + idx * (stripH + 18);

      // Caixa da Arma
      ctx.fillStyle = '#0a0d15';
      ctx.fillRect(x + 16, sy, w - 32, stripH);
      ctx.strokeStyle = '#232a3d';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 16, sy, w - 32, stripH);

      // Borda vermelha de arma equipada
      ctx.fillStyle = '#e21b23';
      ctx.fillRect(x + 16, sy, 6, stripH);

      // Slot Compartimento
      const slotBoxW = 100;
      const slotX = x + 34;
      const slotY = sy + 16;
      ctx.fillStyle = '#040508';
      ctx.fillRect(slotX, slotY, slotBoxW, stripH - 32);
      ctx.strokeStyle = '#1e2638';
      ctx.lineWidth = 1;
      ctx.strokeRect(slotX, slotY, slotBoxW, stripH - 32);

      ctx.fillStyle = '#e21b23';
      ctx.font = "900 10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(`SLOT 0${idx + 1}`, slotX + slotBoxW / 2, slotY + 24);
      ctx.fillStyle = '#8e95a5';
      ctx.font = "800 8px 'JetBrains Mono', monospace";
      ctx.fillText(`[ ${wpn.type.toUpperCase()} ]`, slotX + slotBoxW / 2, slotY + 44);

      // Nome e Especificações da Arma
      const baseAttr = wpn.hitMod.toLowerCase().trim();
      const attrMod = char.attributes[baseAttr] || 0;
      const isTrainedInCombat = wpn.type.toLowerCase().includes('manifestada') || wpn.type.toLowerCase().includes('branca')
        ? char.trainedSkills.includes('luta')
        : char.trainedSkills.includes('pontaria');
      const hitBonus = attrMod + (isTrainedInCombat ? stats.trainingBonusVal : 0);
      const signHit = hitBonus >= 0 ? `+${hitBonus}` : `${hitBonus}`;

      const textX = slotX + slotBoxW + 28;

      ctx.fillStyle = '#ffffff';
      ctx.font = "900 24px 'Cinzel', serif";
      ctx.textAlign = 'left';
      ctx.fillText(wpn.name.toUpperCase(), textX, sy + 44);

      // 4 Colunas de Métricas Militares
      const metricY = sy + 82;
      const metricCols = [
        { label: "TESTE DE ATAQUE", val: `1d20 ${signHit}`, color: '#ff333d' },
        { label: "DANO", val: wpn.dmgDice, color: '#ffffff' },
        { label: "CRÍTICO", val: wpn.crit, color: '#cbd0dc' },
        { label: "ALCANCE OPERACIONAL", val: wpn.range.toUpperCase(), color: '#8e95a5' }
      ];

      const mw = (w - (textX - x) - 40) / 4;
      metricCols.forEach((m, mIdx) => {
        const mx = textX + mIdx * mw;
        ctx.fillStyle = '#64748b';
        ctx.font = "800 9px 'JetBrains Mono', monospace";
        ctx.fillText(`// ${m.label}`, mx, metricY);

        ctx.fillStyle = m.color;
        ctx.font = "900 18px 'JetBrains Mono', monospace";
        ctx.fillText(m.val, mx, metricY + 24);
      });
    });

    ctx.restore();
  }

  // ------------------------------------------------------------
  // 9. RODAPÉ TÉCNICO LITÚRGICO
  // ------------------------------------------------------------
  static drawTechnicalFooter(ctx, w, h, char, stats) {
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.font = "800 10px 'JetBrains Mono', monospace";
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center';
    ctx.fillText("ORDEM DO PAROXISMO // DOCUMENTO CONFIDENCIAL MILITAR // SISTEMA D20 // IMPRESSÃO OFICIAL AAA", w / 2, h - 68);
    ctx.restore();
  }
}
