/**
 * PAROXISMO - SRD COMPENDIUM
 * Bestiário, Ameaças & Área do Mestre
 */

export const BESTIARY_DATA = [
  {
    id: "espectro-rancor",
    name: "Espectro do Rancor",
    vd: 20,
    type: "Criatura Menor",
    element: "O Rancor",
    elementId: "rancor",
    color: "#dc2626",
    desc: "Um vulto trêmulo envolto em fumaça espessa, cinzas e brasas incandescentes, nascido de uma morte violenta tomada pelo ódio puro.",
    stats: {
      agi: 2,
      for: 3,
      int: 1,
      pre: 2,
      vig: 3
    },
    defense: 14,
    pv: 35,
    movement: "9m",
    resistances: "Resistência a Fogo 10",
    vulnerabilities: "A Culpa (Dano Verdadeiro / Sacrifício)",
    fearPresence: {
      cd: 12,
      attr: "Vontade",
      failure: "Fica sob a condição Abalado (-2 em todos os testes até o fim da primeira rodada)."
    },
    actions: [
      {
        name: "Garras em Brasa",
        type: "Ação Padrão (Corpo a Corpo)",
        test: "d20 + 5",
        dmg: "1d8 + 3 (Corte) + 1d6 (Dano de Rancor / Fogo)",
        desc: "Golpeia a vítima com garras incandescentes que deixam queimaduras fumegantes na carne."
      },
      {
        name: "Retaliação Amarga",
        type: "Passiva",
        test: "-",
        dmg: "3 de dano de fogo/rancor",
        desc: "Ao sofrer dano corpo a corpo, estilhaços de brasa explodem do espectro causando 3 de dano de fogo de volta ao agressor."
      }
    ],
    investigativeWeakness: {
      title: "Fraqueza Investigativa: Calma Absoluta",
      desc: "O espectro é alimentado diretamente pela fúria e pelo medo dos presentes. Se o grupo permanecer em calma absoluta (sem gritar, se desesperar ou fazer movimentos violentos impulsivos), a criatura perde sua habilidade de Retaliação Amarga e sofre -2 na Defesa."
    }
  },
  {
    id: "rastejador-vazio",
    name: "Rastejador do Vazio",
    vd: 40,
    type: "Caçador Furtivo",
    element: "O Vazio",
    elementId: "vazio",
    color: "#64748b",
    desc: "Uma criatura esguia, cinzenta e sem feições faciais. Por onde passa, as cores do ambiente desbotam e todo o som desaparece em um silêncio sufocante.",
    stats: {
      agi: 4,
      for: 2,
      int: 2,
      pre: 3,
      vig: 2
    },
    defense: 16,
    pv: 55,
    movement: "12m",
    resistances: "Imunidade a condições mentais; Invisibilidade constante em áreas de sombra.",
    vulnerabilities: "O Rancor (Fogo e Luz Incandescente)",
    fearPresence: {
      cd: 15,
      attr: "Vontade",
      failure: "Fica sob a condição Paralisado por 1 rodada devido ao choque do silêncio absoluto."
    },
    actions: [
      {
        name: "Toque Desvanecente",
        type: "Ação Padrão (Corpo a Corpo)",
        test: "d20 + 6",
        dmg: "1d10 + 4 (Perfurante Entrópico) + Drena 1 PE do alvo",
        desc: "Atinge a vítima com apêndices translúcidos que apagam a memória e a energia espiritual do alvo."
      },
      {
        name: "Apagar Rastro",
        type: "Ação de Movimento",
        test: "-",
        dmg: "-",
        desc: "A criatura se dissolve no ar e reaparece instantaneamente em qualquer ponto com sombra a até 9m de distância."
      }
    ],
    investigativeWeakness: {
      title: "Fraqueza Investigativa: Âncora de Memória Afetiva",
      desc: "O apego a lembranças fortes afasta a criatura. Exibir fotografias antigas, relíquias de família ou objetos de forte memória afetiva cria um raio de 3m onde o monstro não consegue entrar ou atacar."
    }
  },
  {
    id: "mimico-cobica",
    name: "O Mímico da Cobiça",
    vd: 60,
    type: "Chefe do Subsolo",
    element: "A Inveja",
    elementId: "inveja",
    color: "#10b981",
    desc: "Uma massa amorfa de sombras líquidas e metal retorcido que assume formas humanas familiares e objetos valiosos para enganar suas presas antes de atacar com precisão letal.",
    stats: {
      agi: 3,
      for: 3,
      int: 3,
      pre: 3,
      vig: 3
    },
    defense: 16,
    pv: 90,
    movement: "12m (Escalar paredes e teto 12m)",
    resistances: "Resistência a Dano Físico 5",
    vulnerabilities: "O Pavor (Terror e Sombras)",
    fearPresence: {
      cd: 15,
      attr: "Vontade",
      failure: "Fica sob a condição Abalado (-2 em todos os testes por 1 cena)."
    },
    actions: [
      {
        name: "Garras Mimetizadas",
        type: "Ação Padrão (Corpo a Corpo)",
        test: "d20 + 6",
        dmg: "1d10 + 3 (Corte/Perfuração)",
        desc: "Ataca com lâminas que imitam as armas empunhadas pelos próprios jogadores."
      },
      {
        name: "Mimetismo Hostil",
        type: "Reação (1 PE)",
        test: "-",
        dmg: "-",
        desc: "Sempre que um jogador usar uma habilidade, ritual ou ataque especial contra o Mímico ou perto dele, o monstro copia a habilidade e pode executá-la no seu próprio turno."
      },
      {
        name: "Roubo de Perícia",
        type: "Ação Padrão (Alcance 6m)",
        test: "Teste de Vontade CD 15 do alvo",
        dmg: "-",
        desc: "Em caso de falha, o jogador perde seu bônus de treinamento em 1 perícia por 2 rodadas e o Mímico recebe esse bônus somado aos seus testes."
      }
    ],
    investigativeWeakness: {
      title: "Fraqueza Investigativa: Sobrecarga UV / Holofotes",
      desc: "Holofotes de alta potência ou feixes de luz ultravioleta direta ofuscam os múltiplos olhos esmeralda do monstro, desativando seu Mimetismo Hostil e reduzindo sua Defesa para 14 por 1 rodada."
    }
  },
  {
    id: "marionetista-ambicao",
    name: "Marionetista da Ambição",
    vd: 80,
    type: "Chefe Supremo",
    element: "A Ambição",
    elementId: "ambicao",
    color: "#d4af37",
    desc: "Uma figura alta em trajes aristocráticos empoeirados e máscara de porcelana rachada. Dos seus dedos brotam fios dourados reluzentes que se conectam aos corpos e às mentes ao redor.",
    stats: {
      agi: 2,
      for: 2,
      int: 4,
      pre: 4,
      vig: 4
    },
    defense: 17,
    pv: 110,
    movement: "9m",
    resistances: "Resistência a Dano Físico 5",
    vulnerabilities: "O Pavor (Medo e Paranoia)",
    fearPresence: {
      cd: 18,
      attr: "Vontade",
      failure: "Fica sob a condição Aterrorizado (deve gastar seu turno se afastando ou tentando negociar submissão)."
    },
    actions: [
      {
        name: "Açoite de Fios Dourados",
        type: "Ação Padrão (Médio — 9m)",
        test: "d20 + 7",
        dmg: "2d8 + 4 (Corte)",
        desc: "Fios cortantes laçam o alvo, causando dano severo e impondo a condição Agarrado (CD 16 de Atletismo para soltar-se)."
      },
      {
        name: "Voz da Ganância",
        type: "Ação Padrão (Alcance 9m)",
        test: "Teste de Vontade CD 16",
        dmg: "Controle Mental",
        desc: "Um agente em até 9m deve passar em Vontade (CD 16). Se falhar, é forçado a atacar o aliado mais próximo com sua arma básica no próximo turno."
      },
      {
        name: "Espelhos do Orgulho",
        type: "Passiva",
        test: "-",
        dmg: "Reflexão de 50% do dano",
        desc: "Se um ataque errar o Marionetista por 4 ou mais pontos de diferença da sua Defesa, metade do dano pretendido é refletido de volta ao atirador."
      }
    ],
    investigativeWeakness: {
      title: "Enigma de Medo: O Relicário da Moeda Amaldiçoada",
      desc: "A criatura guarda no peito um relicário antigo com uma moeda dourada amaldiçoada. Caso os agentes façam um ataque focado no relicário (Defesa 19) e o destruam, o monstro perde a habilidade Voz da Ganância e todas as suas resistências a dano permanentemente."
    }
  }
];

export const VD_BALANCE_GUIDE = {
  title: "Guia de Balanceamento por VD (Valor de Desafio)",
  rules: [
    { title: "VD do Grupo", desc: "Um grupo padrão de 4 agentes de Nível 1 possui VD de Grupo = 20." },
    { title: "Encontro Fácil", desc: "VD 10 a 15 (ex.: 1 Espectro enfraquecido ou lacaios menores)." },
    { title: "Encontro Desafiador", desc: "VD 20 (ex.: 1 Espectro do Rancor completo para 4 agentes N1)." },
    { title: "Encontro Mortal / Chefe", desc: "VD 40 a 80 (ex.: 1 Rastejador do Vazio ou o Marionetista da Ambição)." },
    { title: "Fórmula de Escalonamento", desc: "Para grupos de níveis superiores: VD do Grupo = (Soma dos Níveis dos 4 Agentes) × 5." }
  ]
};
