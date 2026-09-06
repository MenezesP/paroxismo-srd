/**
 * PAROXISMO - SRD COMPENDIUM
 * Motor de Busca Global Inteligente (Global Search & Command Palette Indexer)
 * Suporta: Normalização sem acentos, Sintaxe "+", Fuzzy Matching, e Navegação Direta
 */

import { RULES_DATA } from '../data/rules.js';
import { CLASSES_DATA } from '../data/classes.js';
import { SKILLS_DATA, ORIGINS_DATA } from '../data/skills-origins.js';
import { EMOTIONS_DATA } from '../data/emotions.js';
import { ARCHETYPES_DATA } from '../data/archetypes.js';
import { RITUALS_DATA } from '../data/rituals.js';
import { BESTIARY_DATA } from '../data/bestiary.js';
import { ADVENTURE_DATA } from '../data/adventure.js';

export function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[«»""''`´]/g, "")
    .trim();
}

function levenshteinDistance(s1, s2) {
  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const v0 = new Array(s2.length + 1);
  const v1 = new Array(s2.length + 1);

  for (let i = 0; i <= s2.length; i++) v0[i] = i;

  for (let i = 0; i < s1.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < s2.length; j++) {
      const cost = s1[i] === s2[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= s2.length; j++) v0[j] = v1[j];
  }

  return v1[s2.length];
}

export class SearchEngine {
  constructor() {
    this.index = [];
    this.buildIndex();
  }

  buildIndex() {
    this.index = [];

    // 1. Os 45 Arquétipos Híbridos Canônicos (Prioridade Máxima)
    ARCHETYPES_DATA.forEach(arc => {
      this.index.push({
        id: `arch-${arc.id}`,
        category: "Arquétipo Híbrido",
        categoryTag: `#${String(arc.id).padStart(2, '0')} | ${arc.e1Name} + ${arc.e2Name}`,
        badgeColor: "#e21b23",
        title: arc.name,
        subtitle: `Fusão: ${arc.e1Name} ＋ ${arc.e2Name}`,
        content: `${arc.name} ${arc.slug} ${arc.e1Name} ${arc.e2Name} ${arc.e1} ${arc.e2} ${arc.quote} ${arc.level1.effect} ${arc.level1.enemy} ${arc.level2.extremePower} ${arc.level2.enemy} ${arc.level2.penaltyName} ${arc.level2.penaltyDesc}`,
        data: arc,
        targetTab: "arquetipos",
        navParams: { archetypeId: arc.id },
        e1: arc.e1,
        e2: arc.e2,
        e1Name: arc.e1Name,
        e2Name: arc.e2Name
      });
    });

    // 2. Rituais Arcanos (200 Rituais)
    RITUALS_DATA.forEach(ritual => {
      this.index.push({
        id: `ritual-${ritual.id}`,
        category: "Ritual",
        categoryTag: `${ritual.circle}º Círculo | ${ritual.emotionName}`,
        badgeColor: "#06b6d4",
        title: ritual.name,
        subtitle: `Custo: ${ritual.peCost} PE • Execução: ${ritual.execution} • Alcance: ${ritual.range}`,
        content: `${ritual.name} ${ritual.emotionName} ${ritual.dmgType} ${ritual.effect} ${ritual.amplification}`,
        data: ritual,
        targetTab: "grimorio",
        navParams: { ritualId: ritual.id, ritualName: ritual.name }
      });
    });

    // 3. Classes de Agente (10) e Habilidades (150)
    CLASSES_DATA.forEach(cls => {
      this.index.push({
        id: `class-${cls.id}`,
        category: "Classe",
        categoryTag: "Classe de Agente",
        badgeColor: "#f59e0b",
        title: cls.name,
        subtitle: `${cls.subtitle} • PV: ${cls.pvInitial} • PE: ${cls.peInitial}`,
        content: `${cls.name} ${cls.subtitle} ${cls.tacticalRole} ${cls.proficiencies} ${cls.initialSkills}`,
        data: cls,
        targetTab: "classes",
        navParams: { classId: cls.id }
      });

      cls.abilities.forEach(ability => {
        this.index.push({
          id: `ability-${cls.id}-${ability.num}`,
          category: "Habilidade de Classe",
          categoryTag: `${cls.name} (Nível ${ability.num})`,
          badgeColor: "#f59e0b",
          title: ability.name,
          subtitle: `Custo: ${ability.cost} • Tipo: ${ability.type}`,
          content: `${ability.name} ${ability.desc} ${cls.name}`,
          data: { ...ability, className: cls.name, classId: cls.id },
          targetTab: "classes",
          navParams: { classId: cls.id }
        });
      });
    });

    // 4. As 10 Emoções Formadoras
    EMOTIONS_DATA.forEach(emo => {
      this.index.push({
        id: `emo-${emo.id}`,
        category: "Emoção",
        categoryTag: "Catalisador Primordial",
        badgeColor: emo.color,
        title: emo.name,
        subtitle: `${emo.subtitles} • Dano: ${emo.dmgType}`,
        content: `${emo.name} ${emo.subtitles} ${emo.logic} ${emo.visual} ${emo.playstyle} ${emo.nativeRitual}`,
        data: emo,
        targetTab: "emocoes",
        navParams: { emotion: emo.id }
      });
    });

    // 5. Perícias (16+)
    SKILLS_DATA.forEach(skill => {
      this.index.push({
        id: `skill-${skill.name.toLowerCase()}`,
        category: "Perícia",
        categoryTag: `Atributo ${skill.attr} | ${skill.category}`,
        badgeColor: "#10b981",
        title: skill.name,
        subtitle: `Atributo Base: ${skill.attr}`,
        content: `${skill.name} ${skill.attr} ${skill.category} ${skill.desc}`,
        data: skill,
        targetTab: "pericias",
        navParams: { targetAnchor: `skill-${skill.name.toLowerCase()}` }
      });
    });

    // 6. Origens Pré-Estrondo (4 Canônicas)
    ORIGINS_DATA.forEach(orig => {
      this.index.push({
        id: `origin-${orig.id}`,
        category: "Origem",
        categoryTag: "Dossiê Pré-Estrondo",
        badgeColor: "#8b5cf6",
        title: orig.name,
        subtitle: `Poder: ${orig.power.name} • Perícias: ${orig.skills.join(', ')}`,
        content: `${orig.name} ${orig.desc} ${orig.power.name} ${orig.power.desc}`,
        data: orig,
        targetTab: "pericias",
        navParams: { targetAnchor: `origin-${orig.id}` }
      });
    });

    // 7. Bestiário do Avesso (4 Ameaças)
    BESTIARY_DATA.forEach(monster => {
      this.index.push({
        id: `monster-${monster.id}`,
        category: "Ameaça / Monstro",
        categoryTag: `VD ${monster.vd} | ${monster.element}`,
        badgeColor: "#dc2626",
        title: monster.name,
        subtitle: `VD ${monster.vd} • PV: ${monster.pv} • Defesa: ${monster.defense}`,
        content: `${monster.name} ${monster.desc} ${monster.element} ${monster.resistances} ${monster.vulnerabilities} ${monster.investigativeWeakness.title} ${monster.investigativeWeakness.desc}`,
        data: monster,
        targetTab: "bestiario",
        navParams: { monsterId: monster.id }
      });
    });

    // 8. Regras & Condições Mentais
    RULES_DATA.fearSystem.conditions.forEach(cond => {
      this.index.push({
        id: `cond-${cond.name.toLowerCase()}`,
        category: "Condição Mental",
        categoryTag: "Regras de Medo",
        badgeColor: "#cbd0dc",
        title: `Condição: ${cond.name}`,
        subtitle: cond.tag,
        content: `${cond.name} ${cond.tag} ${cond.effect}`,
        data: cond,
        targetTab: "regras",
        navParams: { ruleAnchor: "regras-medo" }
      });
    });

    RULES_DATA.combat.reactions.forEach(react => {
      this.index.push({
        id: `react-${react.name.toLowerCase()}`,
        category: "Reação em Combate",
        categoryTag: "Regras de Combate",
        badgeColor: "#cbd0dc",
        title: `Reação: ${react.name}`,
        subtitle: react.requirement,
        content: `${react.name} ${react.requirement} ${react.mechanism} ${react.outcome}`,
        data: react,
        targetTab: "regras",
        navParams: { ruleAnchor: "regras-combate" }
      });
    });

    // Capítulos Expandidos do Compêndio Supremo
    const expandedRuleTopics = [
      { id: "regra-cosmologia", title: "Cosmologia: O Tecido, O Avesso & O Estrondo", tag: "Capítulo 1 • Cosmologia", anchor: "sec-cosmologia", desc: "O Tecido físico, O Avesso dos traumas, o colapso do Anjo da Esperança e o Desespero Primordial" },
      { id: "regra-atributos", title: "Criação de Atributos & Regras de Crítico", tag: "Capítulo 2 • Mecânica d20", anchor: "sec-dados-atributos", desc: "Começam em 1 com 6 pontos bônus, máximo 3 no Nível 1. 20 Natural crítico automático e 1 Natural desastre" },
      { id: "regra-inventario", title: "Inventário por Espaços (5 + FOR) & Perícias Iniciais", tag: "Capítulo 3 • Perícias & Carga", anchor: "sec-pericias-inventario", desc: "Capacidade 5+FOR, itens 1, 2 e 5 espaços. 7 perícias na criação (9 para Investigador)" },
      { id: "regra-morrendo", title: "Regra de 0 PV (Estado Morrendo) & Limite de PE", tag: "Capítulo 4 • Recursos & Morte", anchor: "sec-recursos-combate", desc: "Teste de Vigor CD 15 puro com 3 sucessos ou 3 falhas. Limite de PE por rodada igual ao Nível" },
      { id: "regra-dano-elemental", title: "Dano Elemental & Roda de Oposição Decagonal", tag: "Capítulo 6 • Emoções & Dano", anchor: "sec-emocoes-dano", desc: "Dano elemental ignora RD física. Vantagem elemental +1d6 e ciclo de vitória das 10 emoções" },
      { id: "regra-rituais-pratica", title: "Rituais na Prática: Instantâneos em Combate & Círculos", tag: "Capítulo 7 • Rituais Práticos", anchor: "sec-rituais-pratica", desc: "Gastam 1 Ação Padrão, ativam imediatamente. Círculos do 1º ao 4º (1, 3, 6, 10 PE) e ampliação" },
      { id: "regra-calculo-cd", title: "Cálculo Oficial da CD & Os 4 Testes de Resistência", tag: "Capítulo 8 • CD & Resistência", anchor: "sec-cd-resistencias", desc: "CD = 10 + Atributo-Chave + Treino. Testes de Vontade, Vigor, Acrobacia e Atletismo" },
      { id: "regra-tabela-progressao", title: "Tabela de Progressão do Nível 1 ao 20 & Os 6 Estágios", tag: "Capítulo 9 • Progressão", anchor: "sec-tabela-progressao", desc: "Graus de Paroxismo 5% a 99%, Estágios I ao VI, Arma Manifestada Graus 1-4, Fusão Nível 1 e Nível 2" },
      { id: "regra-mapa-documentos", title: "O Mapa dos 6 Documentos Oficiais do Sistema", tag: "Capítulo 10 • Biblioteca", anchor: "sec-mapa-documentos", desc: "Guia da biblioteca dos 6 livros e manuais canônicos de Paroxismo" }
    ];

    expandedRuleTopics.forEach(rt => {
      this.index.push({
        id: rt.id,
        category: "Regra Fundamental",
        categoryTag: rt.tag,
        badgeColor: "#eab308",
        title: rt.title,
        subtitle: rt.desc,
        content: `${rt.title} ${rt.tag} ${rt.desc}`,
        data: rt,
        targetTab: "regras",
        navParams: { ruleAnchor: rt.anchor }
      });
    });

    // 9. A Forja do Desperto
    const forgeSections = [
      { id: "forja-armas", subtab: "armas", title: "A Forja: Criar Armas", sub: "Criar armas brancas, táticas e manifestadas com balanceamento oficial", content: "armas forja customizacao dano critico simples tatica manifestada grau" },
      { id: "forja-rituais", subtab: "rituais", title: "A Forja: Ateliê de Rituais", sub: "Criar rituais originais balanceados por Círculo (1º ao 4º) e PE", content: "rituais forja circulo orcamento dano cura pe ampliacao magia" },
      { id: "forja-origens", subtab: "origens", title: "A Forja: Bancada de Origens", sub: "Criar profissões pré-estrondo (2 perícias + 1 poder)", content: "origens profissao pre-estrondo criacao pericias poder passivo" },
      { id: "forja-mods", subtab: "mods", title: "A Forja: Oficina de Modificações Táticas", sub: "Mira telescópica, silenciador, cano estendido, lâmina serrilhada", content: "modificacoes armas silenciador mira cano empunhadura cinza ocultista acoplamento" },
      { id: "forja-manual", subtab: "manual", title: "A Forja: Diretrizes & Manual do Mestre", sub: "Regras de ouro do Mestre: Custo, Coerência e Oportunidade", content: "regras mestre balanceamento custo emocao coerencia oportunidade" }
    ];

    forgeSections.forEach(fs => {
      this.index.push({
        id: fs.id,
        category: "A Forja",
        categoryTag: "Criação & Customização",
        badgeColor: "#f43f5e",
        title: fs.title,
        subtitle: fs.sub,
        content: `${fs.title} ${fs.sub} ${fs.content}`,
        data: fs,
        targetTab: "criacao",
        navParams: { subtab: fs.subtab }
      });
    });
  }

  search(query, categoryFilter = "all", limit = 15) {
    if (!query || query.trim() === "") return [];

    const normQuery = normalizeText(query);
    const hasPlus = normQuery.includes('+');

    // -------------------------------------------------------------
    // CASO ESPECIAL: SINTAXE "+" (ex: "Pavor + rancor" ou "Pavor+rancor")
    // OU DUAS EMOÇÕES ESPECIFICADAS NA BUSCA
    // -------------------------------------------------------------
    let emotionA = null;
    let emotionB = null;

    if (hasPlus) {
      const parts = normQuery.split('+').map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length >= 2) {
        emotionA = parts[0];
        emotionB = parts[1];
      }
    } else {
      // Verifica se a query contém duas palavras que correspondem a emoções
      const words = normQuery.split(/\s+/);
      if (words.length === 2 || (words.length === 3 && (words[1] === 'e' || words[1] === 'com' || words[1] === 'x'))) {
        const candidateA = words[0];
        const candidateB = words[words.length - 1];
        const emotionKeys = ['rancor', 'vazio', 'ambicao', 'inveja', 'soberba', 'pavor', 'desespero', 'melancolia', 'luxuria', 'culpa'];
        const isEmoA = emotionKeys.some(k => k.includes(candidateA) || candidateA.includes(k));
        const isEmoB = emotionKeys.some(k => k.includes(candidateB) || candidateB.includes(k));
        if (isEmoA && isEmoB) {
          emotionA = candidateA;
          emotionB = candidateB;
        }
      }
    }

    // Separação em tokens limpos para busca textual
    const cleanTokens = normQuery
      .replace(/[\+\,\-\/]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);

    const scoredMatches = [];

    for (const item of this.index) {
      if (categoryFilter !== "all" && item.category !== categoryFilter && item.targetTab !== categoryFilter) {
        continue;
      }

      const normTitle = normalizeText(item.title);
      const normSubtitle = normalizeText(item.subtitle);
      const normContent = normalizeText(item.content);
      const normTag = normalizeText(item.categoryTag);

      let score = 0;

      // 1. CHECAGEM DE FUSÃO EXATA DE DUAS EMOÇÕES (ex: Pavor + Rancor)
      if (emotionA && emotionB && item.category === "Arquétipo Híbrido") {
        const normE1 = normalizeText(item.e1Name);
        const normE2 = normalizeText(item.e2Name);
        const id1 = normalizeText(item.e1);
        const id2 = normalizeText(item.e2);

        const match1 = (normE1.includes(emotionA) || id1.includes(emotionA)) && (normE2.includes(emotionB) || id2.includes(emotionB));
        const match2 = (normE1.includes(emotionB) || id1.includes(emotionB)) && (normE2.includes(emotionA) || id2.includes(emotionA));

        if (match1 || match2) {
          score += 15000; // Super bônus: O arquétipo exato dessa combinação de emoções!
        }
      }

      // 2. CORRESPONDÊNCIA EXATA NO TÍTULO
      if (normTitle === normQuery) {
        score += 5000;
      } else if (normTitle.startsWith(normQuery)) {
        score += 2500;
      } else if (normTitle.includes(normQuery)) {
        score += 1500;
      }

      // 3. PONTUAÇÃO POR TOKENS
      let allTokensInTitle = true;
      let allTokensFound = true;
      let tokenMatchesCount = 0;

      for (const token of cleanTokens) {
        let tokenInItem = false;

        if (normTitle.includes(token)) {
          score += 600;
          tokenInItem = true;
        } else {
          allTokensInTitle = false;
        }

        if (normSubtitle.includes(token)) {
          score += 250;
          tokenInItem = true;
        }

        if (normTag.includes(token)) {
          score += 200;
          tokenInItem = true;
        }

        if (normContent.includes(token)) {
          score += 100;
          tokenInItem = true;
        }

        // Fuzzy match em títulos para tolerância a pequenos erros de digitação
        if (!tokenInItem && token.length >= 4) {
          const titleWords = normTitle.split(/\s+/);
          for (const tw of titleWords) {
            if (tw.length >= 4) {
              const dist = levenshteinDistance(token, tw);
              if (dist <= 1) {
                score += 350;
                tokenInItem = true;
                break;
              } else if (dist === 2 && token.length >= 6) {
                score += 150;
                tokenInItem = true;
                break;
              }
            }
          }
        }

        if (tokenInItem) {
          tokenMatchesCount++;
        } else {
          allTokensFound = false;
        }
      }

      if (cleanTokens.length > 1 && allTokensInTitle) {
        score += 1000;
      }

      if (cleanTokens.length > 1 && allTokensFound) {
        score += 800;
      }

      // Se ao menos um token relevante pontuou ou se é uma combinação de emoção
      if (score > 0 && (tokenMatchesCount > 0 || (emotionA && emotionB))) {
        scoredMatches.push({ item, score });
      }
    }

    // Ordenação decrescente de pontuação
    scoredMatches.sort((a, b) => b.score - a.score);

    return scoredMatches.slice(0, limit).map(m => m.item);
  }
}
