/**
 * PAROXISMO — UNIFIED CHARACTER STORAGE ENGINE
 * Gerencia persistência atômica, migração e sincronização resiliente
 * da Ficha de Personagem entre sessões normais e Discord Activity.
 */

export function getDefaultCharacter() {
  return {
    name: "Agente Não Identificado",
    player: "Jogador",
    concept: "Sobrevivente do Metrô",
    level: 1,
    classId: "combate",
    originId: "forca-lei",
    primaryEmo: "rancor",
    secondaryEmo: "vazio",
    attributes: {
      agi: 2,
      for: 2,
      int: 1,
      pre: 1,
      vig: 2
    },
    currentPv: 22,
    currentPe: 3,
    protectionId: "jaqueta",
    trainedSkills: ["luta", "atletismo", "vontade", "pontaria", "percepcao"],
    skillRanks: {},
    customWeapons: [
      { id: "wpn-default-1", name: "Arma Manifestada (Grau 1)", type: "Manifestada", hitMod: "FOR", dmgDice: "1d8+FOR", crit: "19/x2", range: "Curto", grip: "media", mods: [] },
      { id: "wpn-default-2", name: "Pistola 9mm Tática", type: "Fogo", hitMod: "AGI", dmgDice: "1d8", crit: "19/x2", range: "Médio", grip: "leve", mods: [] }
    ],
    customRituals: [],
    customOrigin: null,
    conditions: [],
    customAvatar: null,
    lastUpdated: Date.now()
  };
}

// Cache em memória para ambientes onde localStorage é restrito ou bloqueado (ex: iframes do Discord)
const __memoryStorage = {};

export function getCharacterDossier() {
  const defaultChar = getDefaultCharacter();

  // Lista de todas as chaves possíveis em ordem de checagem
  const candidateKeys = [
    'paroxismo_character_dossier_v1',
    'paroxismo_character_data_v1'
  ];
  if (typeof window !== 'undefined' && window.PAROXISMO_USER_ID) {
    candidateKeys.unshift('paroxismo_character_' + window.PAROXISMO_USER_ID);
  }

  let candidates = [];

  for (const key of candidateKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          candidates.push({ key, data: parsed, time: parsed.lastUpdated || 0 });
        }
      }
    } catch (e) {}

    // Checa memória se não achou no localStorage
    if (__memoryStorage[key]) {
      try {
        const parsed = JSON.parse(__memoryStorage[key]);
        if (parsed && typeof parsed === 'object') {
          candidates.push({ key, data: parsed, time: parsed.lastUpdated || 0 });
        }
      } catch (e) {}
    }
  }

  // Fallback para sessionStorage
  try {
    const sessionRaw = sessionStorage.getItem('paroxismo_character_backup_v1');
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed && typeof parsed === 'object') {
        candidates.push({ key: 'session', data: parsed, time: parsed.lastUpdated || 0 });
      }
    }
  } catch (e) {}

  if (candidates.length === 0) {
    return defaultChar;
  }

  // Ordena pelo mais recente
  candidates.sort((a, b) => (b.time || 0) - (a.time || 0));
  const best = candidates[0].data;

  // Realiza merge profundo e seguro
  const merged = {
    ...defaultChar,
    ...best,
    attributes: {
      ...defaultChar.attributes,
      ...(best.attributes || {})
    },
    trainedSkills: Array.isArray(best.trainedSkills) ? best.trainedSkills : defaultChar.trainedSkills,
    customWeapons: Array.isArray(best.customWeapons) ? best.customWeapons : defaultChar.customWeapons,
    customRituals: Array.isArray(best.customRituals) ? best.customRituals : [],
    customOrigin: best.customOrigin || null,
    customAvatar: best.customAvatar || null,
    currentPv: (typeof best.currentPv === 'number' && !isNaN(best.currentPv)) ? best.currentPv : defaultChar.currentPv,
    currentPe: (typeof best.currentPe === 'number' && !isNaN(best.currentPe)) ? best.currentPe : defaultChar.currentPe,
    level: parseInt(best.level, 10) || 1,
    classId: (best.classId || 'combate').toLowerCase(),
    originId: best.originId || 'forca-lei',
    primaryEmo: (best.primaryEmo || 'rancor').toLowerCase(),
    secondaryEmo: (best.secondaryEmo || 'vazio').toLowerCase(),
    protectionId: best.protectionId || 'jaqueta'
  };

  return merged;
}

export function saveCharacterDossier(char) {
  if (!char || typeof char !== 'object') return;

  char.lastUpdated = Date.now();
  const json = JSON.stringify(char);

  // Salva no cache em memória para garantia em iframes
  __memoryStorage['paroxismo_character_dossier_v1'] = json;
  __memoryStorage['paroxismo_character_data_v1'] = json;
  if (typeof window !== 'undefined' && window.PAROXISMO_USER_ID) {
    __memoryStorage['paroxismo_character_' + window.PAROXISMO_USER_ID] = json;
  }

  // Salva em todas as chaves unificadas para máxima resiliência
  try {
    localStorage.setItem('paroxismo_character_dossier_v1', json);
    localStorage.setItem('paroxismo_character_data_v1', json);

    if (typeof window !== 'undefined' && window.PAROXISMO_USER_ID) {
      localStorage.setItem('paroxismo_character_' + window.PAROXISMO_USER_ID, json);
    }

    sessionStorage.setItem('paroxismo_character_backup_v1', json);
  } catch (e) {
    console.warn('[CharacterStorage] Erro ao gravar no storage (usando fallback em memória):', e);
  }

  // Dispara evento global de sincronização para outros componentes no DOM
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('paroxismo:character_saved', { detail: char }));

    // Atualiza a instância ativa da ficha de personagem se ela existir
    if (window.ParoxismoApp?.components?.characterSheet) {
      const sheet = window.ParoxismoApp.components.characterSheet;
      if (sheet.character !== char) {
        sheet.character = char;
        sheet.render();
      }
    }
  }
}
