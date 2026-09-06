/**
 * PAROXISMO - SRD COMPENDIUM
 * GUIA OFICIAL DE CRIAÇÃO & CUSTOMIZAÇÃO
 * Manual de Criação de Armas, Rituais, Origens, Equipamentos e Poderes para Jogadores e Mestres
 */

export const FORGE_RULES = {
  intro: {
    title: "A LIBERDADE DO DESPERTO",
    desc: "Este guia foi elaborado para dar total autonomia aos jogadores para criarem seus próprios conteúdos sem quebrar o equilíbrio do jogo. Ele contém tabelas de parâmetros matemáticos, passos estruturados, fórmulas de balanceamento e modelos prontos de preenchimento."
  },

  weapons: {
    categories: [
      {
        id: "simples",
        name: "Arma Simples",
        desc: "Acessível a todas as classes. Fácil de manusear, mas com dano e crítico mais moderados."
      },
      {
        id: "tatica",
        name: "Arma Tática",
        desc: "Exige treinamento de classes marciais (O Combate, O Tático ou O Duelista). Possui dano superior, alcance estendido ou propriedades táticas."
      }
    ],
    grips: [
      {
        id: "leve",
        name: "Leve (1 Mão)",
        slots: 1,
        desc: "Ocupa 1 Espaço. Pode ser arremessada ou disparada com uma mão (ex.: facas, canivetes, pistolas 9mm, revólveres leves)."
      },
      {
        id: "media",
        name: "Média (1 Mão / Versátil)",
        slots: 2,
        desc: "Ocupa 2 Espaços. Pode ser usada em duas mãos para dano aprimorado (ex.: espadas táticas, cassetetes pesados, submetralhadoras, escopetas curtas)."
      },
      {
        id: "pesada",
        name: "Pesada (2 Mãos Obrigatórias)",
        slots: 5,
        desc: "Ocupa 5 Espaços. Exige duas mãos para manuseio (ex.: fuzis de assalto, rifles de precisão, machados de demolição, escudos balísticos)."
      }
    ],
    balancedTable: [
      {
        category: "Simples (Corpo a Corpo Leve)",
        type: "Branca Leve",
        baseDamage: "1d4 + FOR",
        critMargin: "19 ou 20",
        multiplier: "x2",
        range: "Curto (corpo a corpo / 9m arremesso)",
        slots: 1
      },
      {
        category: "Simples (Corpo a Corpo Média)",
        type: "Branca Média",
        baseDamage: "1d6 + FOR",
        critMargin: "20",
        multiplier: "x2",
        range: "Curto (corpo a corpo)",
        slots: 2
      },
      {
        category: "Simples (À Distância / Fogo)",
        type: "Fogo Simples",
        baseDamage: "1d8 ou 1d10",
        critMargin: "19/x2 ou 20/x3",
        multiplier: "x2 ou x3",
        range: "Médio (18 metros)",
        slots: 2
      },
      {
        category: "Tática (Corpo a Corpo Pesada)",
        type: "Branca Pesada",
        baseDamage: "1d10 + FOR ou 2d6 + FOR",
        critMargin: "19/x2 ou 20/x3",
        multiplier: "x2 ou x3",
        range: "Curto (corpo a corpo)",
        slots: 5
      },
      {
        category: "Tática (Disparo Pesado / Fuzil)",
        type: "Fogo Tático",
        baseDamage: "2d8",
        critMargin: "19/x3 ou 20/x3",
        multiplier: "x3",
        range: "Longo (36 metros)",
        slots: 5
      }
    ],
    properties: [
      {
        id: "automatica",
        name: "Automática",
        desc: "Permite gastar 1 PE para disparar uma rajada que atinge até 2 alvos adjacentes com o mesmo teste de ataque."
      },
      {
        id: "precisa",
        name: "Precisa",
        desc: "Adiciona +2 em testes de ataque caso o personagem gaste uma Ação de Movimento para mirar."
      },
      {
        id: "alongada",
        name: "Alongada",
        desc: "Permite atacar alvos a até 3m de distância sem estar adjacente corpo a corpo."
      },
      {
        id: "silenciada",
        name: "Silenciada / Furtiva",
        desc: "Disparar a arma a partir da furtividade não revela a posição do atirador automaticamente."
      }
    ],
    manifestedScaling: [
      {
        grau: 1,
        level: "Nível 1",
        name: "Grau 1 (Despertar)",
        desc: "Dano padrão da categoria escolhida (ex.: 1d8 de uma mão). É considerada mágica para superar resistências comuns."
      },
      {
        grau: 2,
        level: "Nível 5",
        name: "Grau 2 (Harmonização)",
        desc: "Ganha +1 no teste de ataque e soma +1d6 de Dano Elemental da sua Emoção Dominante."
      },
      {
        grau: 3,
        level: "Nível 10",
        name: "Grau 3 (Ressonância)",
        desc: "Ganha +2 no teste de ataque, +2d6 de Dano Elemental e sua Margem de Crítico melhora em +1 (ex.: 20 vira 19; 19 vira 18)."
      },
      {
        grau: 4,
        level: "Nível 15",
        name: "Grau 4 (Apoteose Bélica)",
        desc: "Ganha +3 no teste de ataque, +3d8 de Dano Elemental e ativa Explosão Elemental em acertos críticos (aplica a Condição Especial da Emoção automaticamente sem teste de resistência)."
      }
    ]
  },

  rituals: {
    circlesBudget: [
      {
        circle: 1,
        name: "1º Círculo",
        costPe: 1,
        minLevel: "Nível 1",
        avgDamageHeal: "2d6 a 2d8",
        targetArea: "1 Alvo ou Área de 3m",
        duration: "Instantânea, 1 Rodada ou Cena pessoal",
        amplification: "+2 PE para aumentar dano em +1d6/+1d8 ou aumentar alvos em +1"
      },
      {
        circle: 2,
        name: "2º Círculo",
        costPe: 3,
        minLevel: "Nível 7",
        avgDamageHeal: "4d6 a 4d8",
        targetArea: "Área de 6m ou até 3 Alvos",
        duration: "Cena ou 2 a 3 Rodadas com concentração",
        amplification: "+3 PE para dobrar o alcance ou aumentar o dano em +2d8"
      },
      {
        circle: 3,
        name: "3º Círculo",
        costPe: 6,
        minLevel: "Nível 13",
        avgDamageHeal: "6d8 a 6d10",
        targetArea: "Área de 9m a 12m",
        duration: "Cena sustentada ou impacto imediato",
        amplification: "+4 PE para aumentar a área em 50% ou dano em +3d8"
      },
      {
        circle: 4,
        name: "4º Círculo",
        costPe: 10,
        minLevel: "Nível 19",
        avgDamageHeal: "10d8 a 10d10",
        targetArea: "Área colossal (18m+) ou Cena inteira",
        duration: "Transformação apoteótica ou colapso da sala",
        amplification: "Poder colossal de cataclismo paranormal"
      }
    ],
    executions: [
      { id: "padrao", name: "Ação Padrão", desc: "Para a grande maioria dos rituais ofensivos ou de suporte." },
      { id: "movimento", name: "Ação de Movimento", desc: "Para rituais de auto-aprimoramento, posturas ou auras menores." },
      { id: "reacao", name: "Reação", desc: "Para rituais estritamente defensivos ativados ao sofrer ataque (barreiras, esquivas sobrenaturais)." },
      { id: "livre", name: "Ação Livre", desc: "Reservado para rituais que aprimoram um ataque no mesmo turno." }
    ],
    dcFormula: "CD = 10 + Presença ou Intelecto do Conjurador + Bônus de Treinamento em Ocultismo"
  },

  origins: {
    models: [
      {
        id: "especialista",
        name: "Modelo Especialista",
        rule: "+2 fixo em um tipo específico de teste",
        example: "Testes de Iniciativa, ou testes de Medicina para curar, ou testes de Tecnologia para desarmar fechaduras."
      },
      {
        id: "segunda-chance",
        name: "Modelo Segunda Chance",
        rule: "1x por cena, gasta 1 PE para rolar novamente um teste falhado",
        example: "Rola novamente um teste falhado de uma perícia específica da sua profissão."
      },
      {
        id: "resistencia",
        name: "Modelo Resistência Temática",
        rule: "+2 em testes de resistência contra um perigo específico",
        example: "Contra toxinas/veneno, ou contra quedas/impacto, ou contra calor/fogo."
      },
      {
        id: "recurso",
        name: "Modelo Recurso Inicial",
        rule: "Começa com +1 espaço de inventário OU equipamento de ofício",
        example: "Ganha +1 espaço extra sem penalidade ou um kit técnico de ofício aprimorado."
      }
    ],
    canonicalExamples: [
      {
        name: "Eletricista de Alta Tensão",
        skills: ["Tecnologia", "Acrobacia"],
        powerName: "Isolamento de Choque",
        powerDesc: "Recebe Resistência 5 a dano elétrico/trovejante e soma +2 em testes de Tecnologia para desarmar armadilhas energizadas ou religar geradores."
      },
      {
        name: "Psicólogo Forense",
        skills: ["Intuição", "Diplomacia"],
        powerName: "Leitura Comportamental",
        powerDesc: "Uma vez por cena, pode gastar 1 PE e uma Ação de Movimento para analisar um NPC ou criatura inteligente e descobrir qual é a sua Emoção Dominante."
      }
    ]
  },

  modifications: [
    {
      id: "mira",
      name: "Mira Telescópica / Óptica",
      compat: "Armas de Fogo Longas",
      effect: "Ao gastar uma Ação de Movimento mirando, aumenta o alcance em +18m e a margem de crítico em +1."
    },
    {
      id: "silenciador",
      name: "Silenciador / Supressor",
      compat: "Pistolas e Submetralhadoras",
      effect: "Disparos não emitem barulho estridente. Permite atacar de emboscada sem alertar a sala vizinha."
    },
    {
      id: "cano-alongado",
      name: "Cano Alongado / Estriado",
      compat: "Armas de Fogo",
      effect: "Soma +2 no dano de disparos à queima-roupa ou alcance médio."
    },
    {
      id: "cabo-anatomico",
      name: "Cabo Anatômico / Empunhadura Tática",
      compat: "Armas Brancas ou de Fogo",
      effect: "Concede +2 em testes de iniciativa e impede que o personagem seja desarmado facilmente (+5 para resistir a desarmar)."
    },
    {
      id: "lamina-serrilhada",
      name: "Lâmina Serrilhada / Fio de Navalha",
      compat: "Facas, Espadas e Machados",
      effect: "Acertos críticos impõem a condição Sangrando (1d6 de dano contínuo por rodada)."
    },
    {
      id: "inscricao-cinzas",
      name: "Inscrição Oculta de Cinzas",
      compat: "Qualquer Arma",
      effect: "Custa 1 Espaço extra. A arma pode ser usada como catalisador ritual, reduzindo o custo de rituais de toque em 1 PE."
    }
  ],

  masterGuidelines: [
    {
      title: "1. Consistência de Custo",
      desc: "O dano e os efeitos respeitam o teto da tabela de círculos e níveis? (Nenhum ritual de 1º Círculo deve causar 5d10 de dano)."
    },
    {
      title: "2. Coerência com a Emoção",
      desc: "O efeito visual e a condição combinam com o sentimento escolhido?"
    },
    {
      title: "3. Custo de Oportunidade",
      desc: "Se a habilidade for muito forte, ela exige uma Ação Padrão e teste de resistência do alvo para ser justa."
    }
  ]
};
