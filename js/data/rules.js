/**
 * PAROXISMO - SRD COMPENDIUM
 * Módulo de Regras Básicas, Combate, Medo, Cosmologia e Progressão Oficial
 * Fonte: "PAROXISMO — O COMPÊNDIO SUPREMO & RESUMO OFICIAL DE REGRAS"
 */

export const RULES_DATA = {
  // ============================================================
  // CAPÍTULO 1: COSMOLOGIA, O ESTRONDO & OS DESPERTOS
  // ============================================================
  cosmology: {
    title: "Cosmologia, O Estrondo & Os Despertos",
    subtitle: "A Metafísica dos Sentimentos e a Ruptura da Realidade",
    intro: "No universo de PAROXISMO, a realidade divide-se em dois planos fundamentais e sofreu um cataclismo cósmico irreversível:",
    planes: [
      {
        name: "O Tecido",
        tag: "Plano Físico & Material",
        desc: "O mundo físico da matéria, da ciência e da vida cotidiana humana. É a casca frágil da realidade em que a humanidade construiu sua civilização."
      },
      {
        name: "O Avesso",
        tag: "Plano Metafísico Subjacente",
        desc: "Uma dimensão metafísica subjacente, atemporal e caótica, composta puramente pela matéria-prima dos sentimentos, pulsões e dores reprimidas de toda a história da humanidade."
      }
    ],
    cataclysm: {
      title: "O Cataclismo: \"O Estrondo\"",
      anjoStory: "Por milênios, uma entidade cósmica e celestial pura — o Anjo da Esperança — velava pela humanidade nos céus, sustentando o equilíbrio entre o Tecido e o Avesso. Contudo, ao absorver séculos ininterruptos de guerras, massacres, ódio e maldade humana, a mente divina do Anjo colapsou sob o peso insuportável do sofrimento.",
      ruinDesc: "O Anjo enlouqueceu e transformou-se na própria encarnação do Desespero Primordial. Seu grito de dor divina rasgou o firmamento em relâmpagos dourados e cianos, gerando O Estrondo: um estrondo metafísico e físico que abalou todo o planeta. No momento do Estrondo, os piores sentimentos da humanidade romperam o Tecido e materializaram-se fisicamente como Aberrações e Titãs do Avesso."
    },
    awakenedSouls: {
      title: "Os Agentes Despertos e as Duas Emoções",
      desc: "Os personagens dos jogadores começam como pessoas comuns vivenciando suas rotinas. Quando o Estrondo reverbera no mundo, a mente de certos indivíduos entra em combustão espiritual, despertando duas facetas emocionais latentes:",
      dominant: "A Emoção Dominante (Primária): Define o núcleo da afinidade elemental do personagem, seu tipo de dano místico, seu ritual inato e suas vantagens e vulnerabilidades no ciclo de oposição.",
      latent: "A Emoção Latente (Secundária): Um sentimento reprimido que se funde à Emoção Dominante no Nível 4 (Estágio II), criando um Arquétipo Híbrido Exclusivo com habilidades singulares."
    }
  },

  // ============================================================
  // CAPÍTULO 2: A MECÂNICA CENTRAL DE DADOS & OS 5 ATRIBUTOS
  // ============================================================
  coreMechanic: {
    title: "A Mecânica Central de Dados (Sistema d20)",
    formula: "1d20 + Atributo Base + Bônus de Treinamento",
    description: "Toda ação com chance de falha, perigo ou combate é resolvida com o dado de 20 faces (1d20): Resultado = 1d20 + Atributo Base + Bônus de Treinamento. O resultado final é comparado contra uma Classe de Dificuldade (CD) estipulada pelo Mestre ou contra a Defesa Passiva do alvo em caso de ataques. Se o resultado for igual ou maior que a CD/Defesa, o teste é um Sucesso.",
    trainingRanks: [
      { rank: "Não Treinado", bonus: "+0", levels: "Qualquer nível", desc: "Rola apenas 1d20 + Atributo." },
      { rank: "Treinado", bonus: "+2", levels: "Níveis 1 a 4", desc: "Competência prática básica na área." },
      { rank: "Veterano", bonus: "+5", levels: "Níveis 5 a 14", desc: "Experiência de campo consolidada contra o Avesso." },
      { rank: "Expert", bonus: "+8", levels: "Níveis 15 a 20", desc: "Maestria quase sobrenatural na perícia." }
    ],
    difficultyClasses: [
      { level: "Fácil", cd: 10, example: "Arrombar uma porta velha de madeira, encontrar pista óbvia em sala iluminada." },
      { level: "Média", cd: 15, example: "Hackear um computador com senha simples, primeiros socorros sob chuva, notar alguém te seguindo." },
      { level: "Difícil", cd: 20, example: "Desativar um sistema de alarme militar, decifrar inscrições antigas do Avesso, resistir ao pavor de uma aberração." },
      { level: "Extrema", cd: 25, example: "Realizar cirurgia de emergência no escuro, escapar de escombros em desabamento rápido." },
      { level: "Sobrenatural", cd: "30+", example: "Resistir à presença direta de um Titã Primordial, quebrar selos de contenção milenares." }
    ],
    criticalRules: {
      natural20: "20 Natural no d20 (Acerto Crítico Automático): O golpe atinge o alvo com precisão absoluta (independente da Defesa do inimigo) e multiplica os dados de dano conforme a arma. Em testes de perícia, representa um sucesso excepcional.",
      natural1: "1 Natural no d20 (Desastre / Falha Crítica): Falha automática e irremediável, que pode gerar complicações narrativas graves ou quebra momentânea de postura.",
      threatRange: "Margem de Ameaça de Armas (ex.: 19/x2): Se uma arma possui margem 19/x2, rolagens de 19 ou 20 no dado ativam o crítico. Se o multiplicador for x3, os dados de dano da arma são multiplicados por 3."
    },
    attributeCreationRule: {
      rule: "Distribuição na Criação de Personagem",
      desc: "Os 5 atributos variam de 0 a 5. Na criação de personagem (Nível 1), todos começam em 1 com 6 pontos bônus para distribuir livremente, com valor máximo de 3 no Nível 1."
    }
  },

  // Os 5 Atributos Principais
  attributes: [
    {
      code: "AGI",
      name: "Agilidade",
      desc: "Coordenação motora, reflexos, iniciativa, velocidade de reação, testes de esquiva, furtividade e ataques à distância com armas de fogo (Pontaria).",
      keyStats: ["Iniciativa", "Defesa Passiva", "Pontaria & Esquiva"]
    },
    {
      code: "FOR",
      name: "Força",
      desc: "Potência física pura, atletismo, ataques corpo a corpo (Luta), dano extra de armas brancas e capacidade máxima de carga no inventário (5 + FOR espaços).",
      keyStats: ["Ataque Corpo a Corpo (Luta)", "Capacidade de Carga (5+FOR)", "Atletismo"]
    },
    {
      code: "INT",
      name: "Intelecto",
      desc: "Raciocínio lógico, dedução investigativa, tecnologia, medicina, conhecimentos científicos, memória e conjuração técnica de rituais.",
      keyStats: ["Investigação & Hacking", "Medicina", "Conjuração Técnica"]
    },
    {
      code: "PRE",
      name: "Presença",
      desc: "Força de vontade inabalável, liderança, lábia social, pontos de esforço (PE), percepção interpessoal e resistência mental contra o pavor (Vontade).",
      keyStats: ["Pontos de Esforço (PE)", "Testes de Vontade", "Percepção Interpessoal"]
    },
    {
      code: "VIG",
      name: "Vigor",
      desc: "Constituição biológica, saúde física, resistência a venenos e frio/calor, testes de estabilização contra a morte e cálculo de Pontos de Vida (PV).",
      keyStats: ["Pontos de Vida (PV)", "Absorção no Bloqueio", "Testes de Morte"]
    }
  ],

  // ============================================================
  // CAPÍTULO 3: PERÍCIAS, ORIGENS & INVENTÁRIO
  // ============================================================
  skillRules: {
    title: "Quantas Perícias o Jogador Recebe na Criação (Nível 1)",
    formula: "Total de Perícias = Perícias da Classe + 2 Perícias da Origem",
    classBreakdown: [
      {
        group: "Maioria das Classes (9 Classes)",
        classes: "Combate, Ocultista, Tático, Infiltrador, Metamaturgo, Duelista do Avesso, Flagelador, Receptáculo, Liturgista",
        calc: "5 da Classe + 2 da Origem = 7 Perícias Treinadas no total"
      },
      {
        group: "O Investigador (Perito)",
        classes: "O Investigador",
        calc: "7 da Classe + 2 da Origem = 9 Perícias Treinadas no total"
      }
    ]
  },

  originsSystem: {
    title: "Sistema de Origens (O Passado Humano)",
    desc: "A Origem define a profissão ou estilo de vida do personagem antes do Estrondo. Toda Origem concede estritamente: 2 Perícias Treinadas coerentes com a profissão + 1 Poder de Origem (habilidade passiva leve ou bônus circunstancial de +2)."
  },

  inventorySystem: {
    title: "Sistema de Carga e Inventário por Espaços",
    rule: "Para evitar contagem burocrática de quilos, o sistema utiliza o conceito de Espaços de Inventário:",
    capacityFormula: "Capacidade de Carga = 5 + Força (FOR) Espaços",
    categories: [
      {
        size: "Item Pequeno (1 Espaço)",
        examples: "Facas, pistolas 9mm, munição extra, lanterna UV, medidor EMF, algemas."
      },
      {
        size: "Item Médio (2 Espaços)",
        examples: "Submetralhadoras, escopetas, coletes leves, kits médicos, kits de arrombamento."
      },
      {
        size: "Item Pesado (5 Espaços)",
        examples: "Fuzis de assalto, coletes pesados, escudos táticos blindados, geradores portáteis."
      }
    ],
    overburdened: "Sobrecarregado: Ultrapassar o limite impõe -2m de deslocamento e penalidade de -2 em testes de Agilidade e Força."
  },

  // ============================================================
  // CAPÍTULO 4: RECURSOS VITAIS, MORTE & COMBATE
  // ============================================================
  resources: {
    pv: {
      name: "Pontos de Vida (PV) e Morte",
      initial: "PV Inicial (Nível 1): Definido pela Classe + Vigor (ex.: Combate = 20 + VIG; Ocultista = 12 + VIG).",
      perLevel: "Ganho por Nível (Nível 2 em diante): Soma-se o valor da classe + Vigor a cada nível que o personagem sobe.",
      dyingRule: {
        title: "Regra de 0 PV (Estado Morrendo)",
        desc: "Ao chegar a 0 PV, o personagem cai Inconsciente e entra no estado Morrendo. No início de cada um dos seus turnos, deve fazer um Teste de Vigor (CD 15) puro:",
        rules: [
          "3 Sucessos: O personagem se estabiliza (continua inconsciente com 0 PV, mas para de morrer).",
          "3 Falhas: O personagem morre definitivamente.",
          "20 Natural no teste de Vigor: Estabiliza imediatamente e acorda com 1 PV.",
          "1 Natural no teste de Vigor: Conta como duas falhas imediatas."
        ]
      }
    },
    pe: {
      name: "Pontos de Esforço (PE)",
      initial: "PE Inicial (Nível 1): Definido pela Classe + Presença (ex.: Ocultista = 6 + PRE; Combate = 2 + PRE).",
      perLevel: "Ganho por Nível: Soma-se o valor da classe + Presença a cada novo nível.",
      limit: "Limite de PE por Rodada: Um personagem nunca pode gastar mais PE em uma única rodada (ou em um único ritual/habilidade) do que o valor do seu Nível Atual (ex.: no Nível 4, o gasto máximo por rodada é de 4 PE).",
      extraEffort: "Esforço Extra: Qualquer agente pode gastar 1 PE para receber +2 em um teste de perícia OU realizar uma Ação de Movimento extra no seu turno."
    }
  },

  combat: {
    initiative: "Iniciativa = 1d20 + Agilidade (rolada no início do combate).",
    defense: {
      formula: "Defesa Passiva = 10 + Agilidade (AGI) + Bônus de Proteção (Colete/Armadura)",
      desc: "Ataques inimigos que igualarem ou superarem a Defesa Passiva acertam o alvo."
    },
    economy: [
      { type: "1 Ação Padrão", desc: "Atacar, conjurar um ritual padrão, usar um kit médico, arrombar uma porta, desativar um terminal." },
      { type: "1 Ação de Movimento", desc: "Mover-se até 9 metros (seu deslocamento), sacar ou guardar uma arma, levantar-se do chão." },
      { type: "1 Reação por Rodada", desc: "Utilizada fora do seu turno para Esquivar, Bloquear, Contra-Atacar ou conjurar rituais de reação." },
      { type: "Ações Livres", desc: "Falar frases curtas, soltar um objeto das mãos, ativar habilidades de ação livre." }
    ],
    reactions: [
      {
        name: "Esquiva",
        requirement: "Gasta 1 Reação da Rodada",
        mechanism: "Soma o Bônus de Treinamento em Acrobacia (+2 / +5 / +8) diretamente à sua Defesa contra aquele ataque.",
        outcome: "Se o ataque do inimigo não alcançar a nova Defesa, o golpe erra completamente e o personagem não sofre nenhum dano."
      },
      {
        name: "Bloqueio",
        requirement: "Gasta 1 Reação da Rodada",
        mechanism: "O personagem absorve a pancada usando a arma ou o colete. Ganha Resistência a Dano (RD) temporária igual a Vigor + Bônus de Proteção.",
        outcome: "O ataque é comparado contra a Defesa normal, mas o dano que passar da RD é reduzido antes de atingir os Pontos de Vida."
      },
      {
        name: "Contra-Ataque",
        requirement: "Gasta 1 Reação da Rodada (Arma Branca Corpo a Corpo)",
        mechanism: "Exclusivo contra ataques corpo a corpo e empunhando arma branca. O defensor aceita a Defesa Passiva normal e desfere um ataque corpo a corpo imediato de volta logo após o golpe do inimigo.",
        outcome: "Se o ataque do inimigo errar a Defesa Passiva, o agressor fica desequilibrado e o contra-ataque do personagem recebe +2 no teste de ataque."
      }
    ]
  },

  fearSystem: {
    title: "Mecânica de Medo & Horror (Sem Barra de Sanidade)",
    concept: "No PAROXISMO, não existe contabilidade de pontos de sanidade que caem aos poucos. O horror é dinâmico, visceral e resolvido na hora do confronto:",
    check: "Presença Perturbadora: Ao ver uma aberração ou revelação cósmica, o Mestre exige um Teste de Vontade (PRE ou INT) contra a CD da criatura.",
    conditions: [
      {
        name: "Abalado",
        tag: "Penalidade Ampla",
        effect: "Sofre -2 em todas as jogadas e testes durante a cena inteira."
      },
      {
        name: "Aterrorizado",
        tag: "Pânico de Fuga",
        effect: "Entra em pânico; não pode se aproximar da fonte de medo e deve usar seu turno para fugir."
      },
      {
        name: "Paralisado",
        tag: "Choque Extremo",
        effect: "Fica congelado pelo choque e perde a primeira ação do seu próximo turno."
      },
      {
        name: "Confuso",
        tag: "Pane Psíquica",
        effect: "Fica atordoado, incapaz de gastar PE ou conjurar rituais por 1 rodada."
      }
    ]
  },

  // ============================================================
  // CAPÍTULO 5: O GUIA DAS 10 CLASSES DE PERSONAGEM (RESUMO)
  // ============================================================
  classesGuideSummary: [
    {
      name: "O Combate",
      pv: "20 + VIG (+4+VIG/nível)",
      pe: "2 + PRE (+1+PRE/nível)",
      prof: "Armas Simples, Táticas e Proteções Leves e Pesadas",
      skills: "Luta ou Pontaria, Atletismo, Vontade + 2 à escolha (Total 5)",
      initialPower: "Ataque Especial: Gasta 1 PE para somar +2 no ataque OU +1d6 no dano."
    },
    {
      name: "O Investigador",
      pv: "16 + VIG (+3+VIG/nível)",
      pe: "4 + PRE (+2+PRE/nível)",
      prof: "Armas Simples e Proteções Leves",
      skills: "Investigação, Percepção, Tecnologia ou Medicina + 4 à escolha (Total 7)",
      initialPower: "Especialista: Escolhe 2 perícias; gasta 1 PE para somar +1d6 no teste delas."
    },
    {
      name: "O Ocultista",
      pv: "12 + VIG (+2+VIG/nível)",
      pe: "6 + PRE (+3+PRE/nível)",
      prof: "Armas Simples",
      skills: "Ocultismo, Vontade + 3 à escolha (Total 5)",
      initialPower: "Escolhido pelo Paranormal: Inicia com 3 rituais de 1º Círculo e reduz seu custo em 1 PE (mínimo 1)."
    },
    {
      name: "O Tático",
      pv: "16 + VIG (+3+VIG/nível)",
      pe: "4 + PRE (+2+PRE/nível)",
      prof: "Armas Simples, Táticas e Proteções Leves",
      skills: "Diplomacia ou Intimidação, Percepção, Pontaria + 2 à escolha (Total 5)",
      initialPower: "Ordem de Comando: Gasta 1 PE e 1 Movimento para dar reação de ação ou +2 a um aliado."
    },
    {
      name: "O Infiltrador",
      pv: "16 + VIG (+3+VIG/nível)",
      pe: "3 + PRE (+2+PRE/nível)",
      prof: "Armas Simples, Leves/Distância e Proteções Leves",
      skills: "Furtividade, Acrobacia ou Atletismo, Percepção + 2 à escolha (Total 5)",
      initialPower: "Ataque Furtivo: Causa +1d8 de dano extra em alvos desprevenidos ou analisados (1 PE)."
    },
    {
      name: "O Metamaturgo",
      pv: "14 + VIG (+3+VIG/nível)",
      pe: "4 + PRE (+2+PRE/nível)",
      prof: "Armas Simples e Proteções Leves",
      skills: "Tecnologia, Ciências, Investigação ou Ocultismo + 2 à escolha (Total 5)",
      initialPower: "Aparato Científico: Gasta 1 PE para ativar Varredura EMF, Foco UV ou Disruptor de Campo (-2 no monstro)."
    },
    {
      name: "O Duelista do Avesso",
      pv: "16 + VIG (+3+VIG/nível)",
      pe: "5 + PRE (+2+PRE/nível)",
      prof: "Armas Simples, Táticas e Proteções Leves",
      skills: "Luta ou Pontaria, Ocultismo, Vontade + 3 à escolha (Total 5)",
      initialPower: "Golpe Encantado: Conjura um ritual como parte de um ataque com arma, aplicando ambos no acerto."
    },
    {
      name: "O Flagelador",
      pv: "18 + VIG (+4+VIG/nível)",
      pe: "4 + PRE (+2+PRE/nível)",
      prof: "Armas Simples e Proteções Leves",
      skills: "Ocultismo, Vontade, Fortitude/Atletismo + 3 à escolha (Total 5)",
      initialPower: "Poder do Sacrifício: Converte 2 PV para cada 1 PE de custo em rituais; rituais dão +1d6 de dano abaixo de 50% PV."
    },
    {
      name: "O Receptáculo",
      pv: "16 + VIG (+3+VIG/nível)",
      pe: "5 + PRE (+2+PRE/nível)",
      prof: "Armas Simples e Proteções Leves",
      skills: "Ocultismo, Luta, Vontade + 3 à escolha (Total 5)",
      initialPower: "Manifestação Física: Reduz rituais de mutação corporal em 1 PE e ganha +2 de Defesa transformado."
    },
    {
      name: "O Liturgista",
      pv: "12 + VIG (+2+VIG/nível)",
      pe: "6 + PRE (+3+PRE/nível)",
      prof: "Armas Simples",
      skills: "Ocultismo, Vontade, Diplomacia, Percepção + 3 à escolha (Total 5)",
      initialPower: "Círculo Sagrado/Profano: Gasta +1 PE para fixar rituais como auras circulares de 4,5m no solo por 1 cena."
    }
  ],

  // ============================================================
  // CAPÍTULO 6: O SISTEMA DAS 10 EMOÇÕES & DANO ELEMENTAL
  // ============================================================
  elementalSystem: {
    title: "O Sistema das 10 Emoções & Dano Elemental",
    definition: "O Dano Elemental é a energia pura do Avesso manifestada através de rituais e armas da alma. Diferente do dano físico (corte, perfuração e impacto), o Dano Elemental ignora a Resistência a Dano Físico (RD) que a maioria das aberrações possui.",
    emotionsTable: [
      {
        emotion: "O Rancor",
        dmgType: "Fogo / Incandescente",
        critCondition: "Em Chamas: Sofre 1d6 de dano de fogo no início de cada turno (Teste de VIG/Acrobacia apaga)."
      },
      {
        emotion: "O Vazio",
        dmgType: "Entropia / Negação",
        critCondition: "Silenciado: Perde 1 PE e fica incapaz de falar ou conjurar rituais com voz por 1 rodada."
      },
      {
        emotion: "A Ambição",
        dmgType: "Corte Áureo / Radiante",
        critCondition: "Fios Presos (Agarrado): Deslocamento 0 e Defesa -2 (Teste de FOR/Atletismo arrebenta)."
      },
      {
        emotion: "A Inveja",
        dmgType: "Ácido / Necrose",
        critCondition: "Corrosão: Derrete carapaça: -2 na Defesa Passiva e -5 de RD por 2 rodadas."
      },
      {
        emotion: "A Soberba",
        dmgType: "Impacto Sísmico",
        critCondition: "Caído & Ofuscado: O alvo é derrubado no solo e fica cego por 1 rodada."
      },
      {
        emotion: "O Pavor",
        dmgType: "Terror Psíquico",
        critCondition: "Aterrorizado: Fuga obrigatória por 1 rodada inteira (Teste de Vontade evita)."
      },
      {
        emotion: "O Desespero",
        dmgType: "Trovejante / Sônico",
        critCondition: "Confuso & Surdo: Incapaz de gastar PE ou usar rituais por 1 rodada pelo estrondo sonoro."
      },
      {
        emotion: "A Melancolia",
        dmgType: "Gelo Negro",
        critCondition: "Lento & Entorpecido: Deslocamento pela metade e habilidades custam +1 PE extra por 2 rodadas."
      },
      {
        emotion: "A Luxúria",
        dmgType: "Biológico / Tóxico",
        critCondition: "Envenenado & Fascinado: Sofre 1d8 de dano por turno e não pode atacar o conjurador por 1 rodada."
      },
      {
        emotion: "A Culpa",
        dmgType: "Dano Verdadeiro",
        critCondition: "Estigma do Penitente: Se o alvo causar dano no próximo turno, sofre metade desse dano de volta em si mesmo."
      }
    ],
    oppositionWheel: {
      title: "A Roda de Oposição Decagonal (Quem Vence Quem)",
      ruleDesc: "Em combate contra entidades do Avesso, apenas a Emoção Dominante determina as fraquezas e resistências elementais:",
      advantage: "Vantagem Elemental (Atingir Fraqueza): Causa +1d6 de Dano Elemental extra (escalando para +2d6 no Nível 8 e +3d6 no Nível 16) e o monstro sofre -2 em testes de resistência contra o ataque/ritual.",
      disadvantage: "Desvantagem Elemental (Atacar com Elemento Ineficaz): O alvo ganha Resistência a Dano (RD 5) contra aquele golpe.",
      cycle: [
        "Rancor vence Vazio",
        "Vazio vence Ambição",
        "Ambição vence Inveja",
        "Inveja vence Soberba",
        "Soberba vence Pavor",
        "Pavor vence Desespero",
        "Desespero vence Melancolia",
        "Melancolia vence Luxúria",
        "Luxúria vence Culpa",
        "Culpa vence Rancor"
      ]
    }
  },

  // ============================================================
  // CAPÍTULO 7: COMO FUNCIONAM OS RITUAIS NA PRÁTICA
  // ============================================================
  ritualsPractical: {
    title: "Como Funcionam os Rituais na Prática",
    instantRule: {
      title: "Tempo de Conjuração: Rituais são Instantâneos em Combate!",
      coreRule: "REGRA FUNDAMENTAL: O jogador NÃO precisa passar uma rodada inteira desenhando círculos no chão em combate. Na grande maioria dos casos, rituais ofensivos ou de suporte gastam 1 Ação Padrão e ativam IMEDIATAMENTE no mesmo turno.",
      methods: [
        { name: "1. Símbolo no Ar", desc: "Traçado rápido do glifo no ar com os dedos brilhando em energia elemental." },
        { name: "2. Tatuagens e Cicatrizes", desc: "Tocar o símbolo cravado na própria carne para descarregar o PE." },
        { name: "3. Inscrição na Arma", desc: "O símbolo está entalhado na lâmina ou no cano do revólver, ativando no momento do disparo." }
      ]
    },
    circlesBudget: [
      { circle: "1º Círculo", cost: "1 PE", unlock: "Nível 1", desc: "Efeitos simples, dano de 2d6 a 2d8, área curta de 3m." },
      { circle: "2º Círculo", cost: "3 PE", unlock: "Nível 7", desc: "Efeitos intermediários, dano de 4d6 a 4d8, áreas de 6m ou múltiplos alvos." },
      { circle: "3º Círculo", cost: "6 PE", unlock: "Nível 13", desc: "Efeitos avançados, dano de 6d8 a 6d10, áreas amplas de 9m a 12m." },
      { circle: "4º Círculo", cost: "10 PE", unlock: "Nível 19", desc: "Apoteóticos, dano de 10d8 a 10d10, cataclismos de 18m+." }
    ],
    amplificationRule: {
      title: "Ampliação (+PE)",
      desc: "Qualquer ritual pode ser conjurado em sua forma básica ou ampliada: pagando PE adicional (geralmente +2 PE no 1º círculo ou +3 PE no 2º círculo), o conjurador aumenta o dano em dados extras ou expande a área/alvos."
    }
  },

  // ============================================================
  // CAPÍTULO 8: CÁLCULO DE CD & TESTES DE RESISTÊNCIA
  // ============================================================
  resistanceRules: {
    title: "Como Calcular a Classe de Dificuldade (CD) e Testes de Resistência",
    formula: "CD = 10 + Atributo-Chave + Bônus de Treinamento",
    baseFixa: 10,
    keyAttributesDesc: "Atributo-Chave: O atributo da Emoção Dominante do portador ou o atributo de conjuração da classe (Rancor: VIG/FOR; Vazio, Ambição, Soberba, Pavor, Culpa: PRE; Inveja: INT; Desespero: VIG/INT; Melancolia, Luxúria: PRE/VIG).",
    trainingScalingDesc: "Bônus de Treinamento: Escala por Nível (+2 nos Níveis 1-4; +5 nos Níveis 5-14; +8 nos Níveis 15-20).",
    saveTypes: [
      {
        name: "Teste de Vontade",
        attr: "PRE ou INT",
        targets: "Efeitos mentais, pavor, fascínio, controle psíquico, ilusões, confusão e dor moral.",
        pass: "Sofre apenas metade do dano e anula a condição mental.",
        fail: "Sofre dano total e a condição mental completa (Aterrorizado, Paralisado, Confuso)."
      },
      {
        name: "Teste de Vigor",
        attr: "VIG",
        targets: "Necrose, venenos, toxinas carnais, frio extremo, queimaduras contínuas e sufocamento.",
        pass: "Reduz o dano pela metade e anula condições físicas.",
        fail: "Sofre dano total e a condição física debilitante (Lento, Envenenado, Em Chamas)."
      },
      {
        name: "Teste de Acrobacia",
        attr: "AGI",
        targets: "Implosões gravitacionais, ondas de choque sônicas, explosões de fogo e desabamentos de área.",
        pass: "Esquiva parcial: sofre metade do dano e mantém-se de pé.",
        fail: "Sofre dano total, é arremessado ou cai na condição Caído (-5 em ataques)."
      },
      {
        name: "Teste de Atletismo",
        attr: "FOR",
        targets: "Correntes de ferro em brasa, fios dourados de marionete, tentáculos e amarras físicas.",
        pass: "O alvo quebra ou escapa das amarras e move-se normalmente.",
        fail: "Fica sob a condição Agarrado (Deslocamento 0 e -2 na Defesa) ou Imobilizado."
      }
    ],
    criticalSuccess: "20 Natural no Dado de Resistência: Sucesso absoluto. O alvo anula 100% do dano e qualquer efeito secundário da magia/habilidade.",
    criticalFailure: "1 Natural no Dado de Resistência: Falha crítica desastrosa. Sofre o dano máximo garantido (sem rolar dados) e a duração da condição é dobrada.",
    breakFree: "Testes de Liberação por Rodada: Alvos presos por efeitos contínuos podem gastar 1 Ação Padrão no início do seu turno para rolar um novo teste contra a CD e tentar se libertar.",
    bidirectional: "Regra Bidirecional: Jogadores rolam testes contra rituais de monstros, e monstros rolam contra rituais dos jogadores com a mesma mecânica."
  },

  // ============================================================
  // CAPÍTULO 9: TABELA DE PROGRESSÃO & OS 6 ESTÁGIOS (NÍVEL 1 AO 20)
  // ============================================================
  progressionTableOfficial: [
    { level: 1, paroxismo: "5%", training: "+2", peLimit: 1, attr: "-", ritualCircle: "1º Círculo", general: "Estágio I: O Despertar (Arma Manifestada Grau 1 + 1º Poder)" },
    { level: 2, paroxismo: "10%", training: "+2", peLimit: 2, attr: "-", ritualCircle: "1º Círculo", general: "Habilidade de Classe" },
    { level: 3, paroxismo: "15%", training: "+2", peLimit: 3, attr: "-", ritualCircle: "1º Círculo", general: "Habilidade de Classe" },
    { level: 4, paroxismo: "20%", training: "+2", peLimit: 4, attr: "+1 Atributo", ritualCircle: "1º Círculo", general: "Estágio II: Ressonância (Fusão Híbrida Nível 1 das 2 Emoções)" },
    { level: 5, paroxismo: "25%", training: "+3", peLimit: 5, attr: "-", ritualCircle: "1º Círculo", general: "Arma Manifestada Grau 2 (+1 acerto, +1d6 elemental)" },
    { level: 6, paroxismo: "30%", training: "+3", peLimit: 6, attr: "-", ritualCircle: "1º Círculo", general: "Habilidade de Classe" },
    { level: 7, paroxismo: "35%", training: "+3", peLimit: 7, attr: "-", ritualCircle: "2º Círculo", general: "Desbloqueio de Rituais de 2º Círculo (Custo 3 PE)" },
    { level: 8, paroxismo: "40%", training: "+3", peLimit: 8, attr: "+1 Atributo", ritualCircle: "2º Círculo", general: "Estágio III: Catalisação (Arma ganha +1 margem de crítico)" },
    { level: 9, paroxismo: "45%", training: "+4", peLimit: 9, attr: "-", ritualCircle: "2º Círculo", general: "Habilidade de Classe" },
    { level: 10, paroxismo: "50%", training: "+4", peLimit: 10, attr: "-", ritualCircle: "2º Círculo", general: "Arma Manifestada Grau 3 (+2 acerto, +2d6 elemental)" },
    { level: 11, paroxismo: "55%", training: "+4", peLimit: 11, attr: "-", ritualCircle: "2º Círculo", general: "Habilidade de Classe" },
    { level: 12, paroxismo: "60%", training: "+4", peLimit: 12, attr: "+1 Atributo", ritualCircle: "2º Círculo", general: "Estágio IV: Paroxismo Menor (Sobrecarga de Aura Emocional)" },
    { level: 13, paroxismo: "65%", training: "+5", peLimit: 13, attr: "-", ritualCircle: "3º Círculo", general: "Desbloqueio de Rituais de 3º Círculo (Custo 6 PE)" },
    { level: 14, paroxismo: "68%", training: "+5", peLimit: 14, attr: "-", ritualCircle: "3º Círculo", general: "Habilidade de Classe" },
    { level: 15, paroxismo: "70%", training: "+5", peLimit: 15, attr: "-", ritualCircle: "3º Círculo", general: "Arma Manifestada Grau 4 (+3 acerto, +3d8 elemental, Explosão)" },
    { level: 16, paroxismo: "75%", training: "+5", peLimit: 16, attr: "+1 Atributo", ritualCircle: "3º Círculo", general: "Estágio V: Apoteose (Fusão Híbrida Nível 2 + Custo do Paroxismo)" },
    { level: 17, paroxismo: "80%", training: "+6", peLimit: 17, attr: "-", ritualCircle: "3º Círculo", general: "Habilidade de Classe" },
    { level: 18, paroxismo: "85%", training: "+6", peLimit: 18, attr: "-", ritualCircle: "3º Círculo", general: "Poder Avançado de Alinhamento" },
    { level: 19, paroxismo: "90%", training: "+6", peLimit: 19, attr: "+1 Atributo", ritualCircle: "4º Círculo", general: "Desbloqueio de Rituais de 4º Círculo (Custo 10 PE)" },
    { level: 20, paroxismo: "99%", training: "+6", peLimit: 20, attr: "-", ritualCircle: "4º Círculo", general: "Estágio VI: Paroxismo Total (Forma de Avatar da Emoção por 1d4+1 rodadas)" }
  ],

  fusionsEvolutionRule: {
    title: "A Regra Sagrada do Nível 1 e Nível 2 das Fusões",
    text: "No Nível 4 (Estágio II), o personagem desbloqueia o Nível 1 da sua Fusão Híbrida. No Nível 16 (Estágio V), ele não escolhe uma terceira emoção; ele aprimora a mesma fusão para o Nível 2, ganhando um poder extremo acompanhado de uma Desvantagem Mecânica Severa (O Custo do Paroxismo)."
  },

  // ============================================================
  // CAPÍTULO 10: O MAPA DOS 6 DOCUMENTOS OFICIAIS DO SISTEMA
  // ============================================================
  documentsMap: [
    { num: 1, title: "Livro Básico de Regras & Livro dos Jogadores", content: "Regras fundamentais, criação de personagens, atributos, combate e resumo das classes." },
    { num: 2, title: "Guia do Mestre & Aventura", content: "Regras confidenciais do Mestre, fichas do Bestiário inicial, ficha de agente oficial e a aventura de abertura PAROXISMO: O Despertar." },
    { num: 3, title: "Tabela de Progressão & Alinhamento Emocional", content: "Manual de Nível 1 ao 20, matriz das 45 fusões e as 150 habilidades de classe (15 para cada classe)." },
    { num: 4, title: "Guia de Classes, Perícias & Criação de Personagens", content: "Detalhamento aprofundado das 10 classes, perícias e passo a passo de criação de ficha." },
    { num: 5, title: "O Livro das 10 Emoções & Matriz de Interações", content: "Filosofia das 10 Emoções, Roda de Oposição Decagonal, tipos de dano elemental e condições especiais." },
    { num: 6, title: "O Grimório das 10 Emoções (200 Rituais)", content: "Todos os 200 rituais do 1º ao 4º círculo categorizados pelas 10 emoções." }
  ],

  // Mantendo compatibilidade com código existente
  progressionTable: [
    { level: 1, paroxismo: "5%", training: "+2", peLimit: 1, attr: "-", ritualCircle: "1º Círculo", general: "Estágio I: O Despertar (Arma Grau 1, 1º Poder Emoção Primária)" },
    { level: 2, paroxismo: "10%", training: "+2", peLimit: 2, attr: "-", ritualCircle: "1º Círculo", general: "Habilidade de Classe" },
    { level: 3, paroxismo: "15%", training: "+2", peLimit: 3, attr: "-", ritualCircle: "1º Círculo", general: "Habilidade de Classe" },
    { level: 4, paroxismo: "20%", training: "+2", peLimit: 4, attr: "+1 Atributo", ritualCircle: "1º Círculo", general: "Estágio II: Ressonância Híbrida (1ª Fusão de Poder)" },
    { level: 5, paroxismo: "25%", training: "+3", peLimit: 5, attr: "-", ritualCircle: "1º Círculo", general: "Arma Manifestada Grau 2 (+1d6 dano elemental)" },
    { level: 6, paroxismo: "30%", training: "+3", peLimit: 6, attr: "-", ritualCircle: "1º Círculo", general: "Habilidade de Classe" },
    { level: 7, paroxismo: "35%", training: "+3", peLimit: 7, attr: "-", ritualCircle: "2º Círculo", general: "Desbloqueio de 2º Círculo (Custo 3 PE)" },
    { level: 8, paroxismo: "40%", training: "+3", peLimit: 8, attr: "+1 Atributo", ritualCircle: "2º Círculo", general: "Estágio III: Catalisação da Alma (+1 Crítico na Arma)" },
    { level: 9, paroxismo: "45%", training: "+4", peLimit: 9, attr: "-", ritualCircle: "2º Círculo", general: "Habilidade de Classe" },
    { level: 10, paroxismo: "50%", training: "+4", peLimit: 10, attr: "-", ritualCircle: "2º Círculo", general: "Arma Manifestada Grau 3 (+2 acerto, +2d6 dano elemental)" },
    { level: 11, paroxismo: "55%", training: "+4", peLimit: 11, attr: "-", ritualCircle: "2º Círculo", general: "Habilidade de Classe" },
    { level: 12, paroxismo: "60%", training: "+4", peLimit: 12, attr: "+1 Atributo", ritualCircle: "2º Círculo", general: "Estágio IV: Paroxismo Menor (Sobrecarga de Aura Emocional)" },
    { level: 13, paroxismo: "65%", training: "+5", peLimit: 13, attr: "-", ritualCircle: "3º Círculo", general: "Desbloqueio de 3º Círculo (Custo 6 PE)" },
    { level: 14, paroxismo: "68%", training: "+5", peLimit: 14, attr: "-", ritualCircle: "3º Círculo", general: "Habilidade de Classe" },
    { level: 15, paroxismo: "70%", training: "+5", peLimit: 15, attr: "-", ritualCircle: "3º Círculo", general: "Arma Manifestada Grau 4 (+3 acerto, +3d8 elemental, Explosão)" },
    { level: 16, paroxismo: "75%", training: "+5", peLimit: 16, attr: "+1 Atributo", ritualCircle: "3º Círculo", general: "Estágio V: Apoteose (Fusão Nível 2 + Custo do Paroxismo)" },
    { level: 17, paroxismo: "80%", training: "+6", peLimit: 17, attr: "-", ritualCircle: "3º Círculo", general: "Habilidade de Classe" },
    { level: 18, paroxismo: "85%", training: "+6", peLimit: 18, attr: "-", ritualCircle: "3º Círculo", general: "Habilidade de Classe" },
    { level: 19, paroxismo: "90%", training: "+6", peLimit: 19, attr: "+1 Atributo", ritualCircle: "4º Círculo", general: "Desbloqueio de 4º Círculo (Custo 10 PE)" },
    { level: 20, paroxismo: "99%", training: "+6", peLimit: 20, attr: "-", ritualCircle: "4º Círculo", general: "Estágio VI: Paroxismo Total (Avatar da Emoção por 1d4+1 rodadas)" }
  ],

  stages: [
    {
      stage: "Estágio I: O Despertar",
      level: "Nível 1 (Paroxismo 5% a 15%)",
      desc: "A alma manifesta sua primeira ferramenta de defesa. O personagem ganha sua Arma Manifestada (Grau 1) e o 1º Poder da Emoção Primária."
    },
    {
      stage: "Estágio II: Ressonância Híbrida",
      level: "Nível 4 (Paroxismo 20% a 35%)",
      desc: "A barreira entre a consciência e o subconsciente enfraquece. Ativa-se a Emoção Secundária e o personagem recebe sua 1ª Fusão de Poder Híbrido."
    },
    {
      stage: "Estágio III: Catalisação da Alma",
      level: "Nível 8 (Paroxismo 40% a 55%)",
      desc: "A conexão emocional torna-se letal. A Arma Manifestada evolui, recebendo bônus de +1d6 de dano elemental e sua Margem de Crítico é aprimorada em +1."
    },
    {
      stage: "Estágio IV: Paroxismo Menor",
      level: "Nível 12 (Paroxismo 60% a 70%)",
      desc: "A presença do portador distorce a realidade ao redor. Desbloqueia a Sobrecarga de Aura Emocional: todos os inimigos em raio de 6m sofrem penalidades."
    },
    {
      stage: "Estágio V: Apoteose Emocional",
      level: "Nível 16 (Paroxismo 75% a 85%)",
      desc: "O ápice do poder. Desbloqueia o Nível 2 da Fusão Híbrida original com poder destrutivo monumental e sua respectiva Desvantagem Severa (Custo do Paroxismo)."
    },
    {
      stage: "Estágio VI: Paroxismo Total / Avatar",
      level: "Nível 20 (Paroxismo 99%)",
      desc: "O limite final da existência. O portador entra na forma de Avatar da Emoção por 1d4+1 rodadas, tornando-se uma entidade cósmica temporária."
    }
  ],

  manifestedWeaponsProgression: [
    { rank: "Grau 1: Comum", minLevel: 1, bonusHit: "+0", extraDmg: "-", special: "Manifestação básica da alma conectada à emoção primária." },
    { rank: "Grau 2: Desperta", minLevel: 5, bonusHit: "+1", extraDmg: "+1d6", special: "A arma ganha propriedade elemental ativa da emoção (+1d6)." },
    { rank: "Grau 3: Catalisada", minLevel: 10, bonusHit: "+2", extraDmg: "+2d6", special: "Aumenta o acerto em +2 e soma +2d6 de dano elemental." },
    { rank: "Grau 4: Paroxística", minLevel: 15, bonusHit: "+3", extraDmg: "+3d8", special: "Acerto +3, +3d8 elemental e propriedade 'Explosão' em acertos críticos." }
  ],

  equipment: {
    inventoryLimit: "5 + Força Espaços de inventário.",
    spaces: "Pequeno = 1 espaço | Médio = 2 espaços | Grande = 5 espaços.",
    weapons: [
      { name: "Faca / Canivete", type: "Simples", dmg: "1d4 + FOR", crit: "19/x2", range: "Curto", spaces: 1 },
      { name: "Bastão / Cassetete", type: "Simples", dmg: "1d6 + FOR", crit: "20/x2", range: "Curto", spaces: 1 },
      { name: "Pistola 9mm", type: "Simples", dmg: "1d8", crit: "19/x2", range: "Médio", spaces: 1 },
      { name: "Revólver .38", type: "Simples", dmg: "1d10", crit: "20/x3", range: "Médio", spaces: 1 },
      { name: "Espingarda Cal. 12", type: "Tática", dmg: "2d6", crit: "20/x3", range: "Curto", spaces: 2 },
      { name: "Submetralhadora", type: "Tática", dmg: "1d10", crit: "19/x2", range: "Médio", spaces: 2 },
      { name: "Fuzil de Assalto", type: "Tática", dmg: "2d8", crit: "19/x3", range: "Longo", spaces: 5 }
    ],
    protections: [
      { name: "Jaqueta Reforçada", effect: "+1 Defesa", spaces: 1 },
      { name: "Colete Leve", effect: "+2 Defesa", spaces: 2 },
      { name: "Colete Tático Pesado", effect: "+5 Defesa, -2 em Furtividade/Acrobacia", spaces: 5 }
    ],
    items: [
      { name: "Kit Médico", effect: "Permite curar PV com a perícia Medicina.", spaces: 2 },
      { name: "Kit de Invasão", effect: "+2 em Tecnologia para arrombamento e fechaduras.", spaces: 2 },
      { name: "Lanterna UV / Alta Potência", effect: "Ilumina e revela rastros e entidades sobrenaturais.", spaces: 1 },
      { name: "Medidor EMF", effect: "Detecta presença paranormal em até 15m.", spaces: 1 },
      { name: "Injeção de Adrenalina", effect: "Concede +10 PV temporários e remove a condição Lento.", spaces: 1 }
    ]
  },

  emotionalSurges: [
    { roll: 1, name: "Fúria Cega", effect: "Ataca o alvo mais próximo (aliado ou inimigo) com força total." },
    { roll: 2, name: "Paralisia Catatônica", effect: "Congela em pânico total, revivendo traumas do Estrondo durante 1d4 rodadas." },
    { roll: 3, name: "Risada Histérica", effect: "Fica impossibilitado de falar ou usar rituais por 1d4 rodadas." },
    { roll: 4, name: "Autoflagelo Devoto", effect: "Causa 2d6 de dano a si mesmo para alimentar seus poderes emocionais." },
    { roll: 5, name: "Fuga Desesperada", effect: "Deve gastar todas as suas ações correndo para a direção oposta do perigo." },
    { roll: 6, name: "Mutismo Absoluto", effect: "Perde a capacidade de se comunicar ou conjurar rituais com componentes verbais." },
    { roll: 7, name: "Alucinação da Ambição", effect: "Enxerga aliados como monstros tentando usurpar seus poderes." },
    { roll: 8, name: "Sede de Sangue", effect: "Não consegue recuar ou defender até que o alvo esteja morto." },
    { roll: 9, name: "Apatia Gélida", effect: "Não sente dor, mas fica impossibilitado de gastar PE por 1d4 rodadas." },
    { roll: 10, name: "Vozes do Estrondo", effect: "Ouve sussurros ensurdecedores que impõem -5 em todos os testes mentais." },
    { roll: 11, name: "Tremor Incontrolável", effect: "Deixa cair qualquer item que esteja segurando nas mãos imediatamente." },
    { roll: 12, name: "Sobrecarga de Energia", effect: "Libera uma onda de choque de 3m que atinge amigos e inimigos com 2d8 de dano." },
    { roll: 13, name: "Obsessão Compulsiva", effect: "Fica fixado em pegar um objeto específico no campo de batalha a qualquer custo." },
    { roll: 14, name: "Visão do Fim", effect: "Fica cego para o presente, enxergando apenas ruínas e chamas apocalípticas." },
    { roll: 15, name: "Espasmo Paroxístico", effect: "Perde o controle motor e cai no chão indefeso por 1 rodada." },
    { roll: 16, name: "Choro Desesperado", effect: "Sofre desvantagem em todos os testes de iniciativa e ataques." },
    { roll: 17, name: "Fissura de Realidade", effect: "Pequenos cortes espaciais se abrem ao redor do corpo, causando 1d6 de dano a quem se aproximar." },
    { roll: 18, name: "Drenagem Empática", effect: "Absorve involuntariamente as dores e condições de todos os aliados a até 6m." },
    { roll: 19, name: "Colapso da Identidade", effect: "Esquece o próprio nome e a missão durante o combate por 1d4 rodadas." },
    { roll: 20, name: "Paroxismo Crítico", effect: "Entra em transe com o dobro de dano em todos os golpes, mas perde 5 PV no início de cada turno." }
  ],

  scarsOfEstrondo: [
    { roll: 1, name: "Olhos Monocromáticos", effect: "A esclera e as pupilas tornam-se pretas ou douradas como vidro." },
    { roll: 2, name: "Marcas de Fissura", effect: "Veias saltadas que brilham na cor da emoção primária sob a pele." },
    { roll: 3, name: "Voz Bissonora", effect: "A fala do personagem ganha um eco duplo de duas vozes simultâneas." },
    { roll: 4, name: "Temperatura Anômala", effect: "A pele torna-se permanentemente gélida como cadáver ou quente como brasa." },
    { roll: 5, name: "Unhas de Ferro", effect: "As unhas engrossam e viram garras pretas afiadas." },
    { roll: 6, name: "Sombra Distorcida", effect: "A sombra do personagem não imita seus movimentos, agindo com raiva ou medo próprios." },
    { roll: 7, name: "Cicatrizes de Espinhos", effect: "Marcas circulares de coroas de espinhos gravadas nos pulsos e pescoço." },
    { roll: 8, name: "Mudez Parcial", effect: "A língua adquire pigmentação preta e a voz falha em sussurros ocasionais." },
    { roll: 9, name: "Respiração de Cinzas", effect: "O hálito do personagem exala fumaça tênue sem cheiro." },
    { roll: 10, name: "Pele de Porcelana", effect: "Manchas esbranquiçadas e rachadas como máscaras quebradas no rosto ou braços." },
    { roll: 11, name: "Coração de Metal", effect: "O batimento cardíaco soa como uma engrenagem mecânica audível no peito." },
    { roll: 12, name: "Cabelos Grisalhos Precoces", effect: "Mechas ou todo o cabelo embranquecem instantaneamente." },
    { roll: 13, name: "Visão Espectral", effect: "Enxerga a aura emocional das pessoas ao redor, mas perde a visão colorida normal." },
    { roll: 14, name: "Ecos nos Ouvidos", effect: "Um zumbido suave constante de metal e vento que nunca cessa." },
    { roll: 15, name: "Fios sob a Carne", effect: "Linhas douradas visíveis sob a pele dos antebraços." },
    { roll: 16, name: "Dentes Afiados", effect: "Caninos pontiagudos e serrilhados como os das aberrações." },
    { roll: 17, name: "Sangue Escuro", effect: "O sangue torna-se preto, viscoso e queima levemente ao tocar o solo." },
    { roll: 18, name: "Insônia Paranormal", effect: "Pesadelos recorrentes com o Estrondo; o personagem nunca dorme profundamente." },
    { roll: 19, name: "Magnetismo Oculto", effect: "Pequenos objetos metálicos vibram quando o personagem se irrita." },
    { roll: 20, name: "Estigma do Apocalipse", effect: "Um símbolo rúnico gravado a fogo nas costas que arde na presença de chefes." }
  ]
};
