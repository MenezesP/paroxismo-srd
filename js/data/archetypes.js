/**
 * PAROXISMO - SRD COMPENDIUM
 * O LIVRO DOS 45 ARQUÉTIPOS HÍBRIDOS (FUSÕES DE EMOÇÕES NÍVEL 1 E 2)
 * Manual Oficial de Ressonância Emocional, Poderes Híbridos & Custos do Paroxismo
 * Fonte: Documento Oficial de Regras Expandidas
 */

export const ARCHETYPES_RULES = {
  title: "O LIVRO DOS 45 ARQUÉTIPOS HÍBRIDOS",
  subtitle: "Manual Oficial de Ressonância Emocional, Poderes Híbridos & Custos do Paroxismo",
  chapter1: {
    title: "CAPÍTULO 1: A NATUREZA DAS FUSÕES EMOCIONAIS",
    text: "No universo de PAROXISMO, a alma de um indivíduo desperto não é estática. A sobrevivência e o combate contra as entidades do Avesso exigem a comunhão entre duas facetas fundamentais da psique humana:",
    points: [
      {
        title: "A Emoção Dominante (Primária)",
        desc: "Define o núcleo da afinidade elemental, o tipo de dano principal, o ritual nato e a postura espiritual básica do agente."
      },
      {
        title: "A Emoção Latente (Secundária)",
        desc: "Emerge conforme o personagem vivencia o horror e aprofunda seu Grau de Paroxismo, colidindo com a primeira para gerar um Arquétipo Híbrido Exclusivo."
      }
    ]
  },
  chapter2: {
    title: "CAPÍTULO 2: A REGRA DA EVOLUÇÃO DAS FUSÕES (NÍVEL 1 & NÍVEL 2)",
    text: "Diferente de sistemas que dispersam poderes em múltiplas ramificações rasas, o sistema de Alinhamento do PAROXISMO aprofunda a mesma conexão emocional ao longo da campanha:",
    levels: [
      {
        tier: "NÍVEL 1 — O DESPERTAR DA FUSÃO",
        unlock: "Desbloqueado no Estágio II — Nível 4 do Agente",
        cost: "2 Pontos de Esforço (PE)",
        desc: "Representa o primeiro entrelaçamento consciente entre as duas emoções do portador. Concede uma habilidade ativa, reativa ou de área equilibrada, com custo moderado de PE, permitindo que o personagem imponha condições táticas, dano combinado e manipulação do ambiente."
      },
      {
        tier: "NÍVEL 2 — A APOTEOSE DA FUSÃO",
        unlock: "Desbloqueado no Estágio V — Nível 16 do Agente",
        cost: "5 a 6 Pontos de Esforço (PE)",
        desc: "No Estágio V, ao invés de escolher uma terceira emoção desconexa, o portador eleva a sua fusão original ao ápice do Paroxismo. Concede uma habilidade de poder monumental — uma verdadeira arma de destruição em massa ou controle absoluto capaz de enfrentar entidades e Titãs Primordiais."
      }
    ],
    paroxismWarning: {
      title: "O PRINCÍPIO DO EQUILÍBRIO PAROXÍSTICO (A Desvantagem Mecânica do Nível 2)",
      text: "Tocar o ápice das emoções humanas cobra um preço inevitável da carne e da sanidade. Toda habilidade de Nível 2 possui uma Desvantagem Mecânica Severa (perda de PV temporário, restrição de defesas, vulnerabilidades temporárias ou estresse de recursos). O jogador deve ponderar com cautela o momento exato de liberar o Nível 2 da sua fusão."
    }
  },
  chapter3: {
    title: "CAPÍTULO 3: COMO CALCULAR A CLASSE DE DIFICULDADE (CD) E TESTES DE RESISTÊNCIA",
    formula: "CD = 10 + Atributo-Chave + Bônus de Treinamento",
    baseFixa: 10,
    keyAttributes: [
      { emo: "O Rancor", attr: "Vigor (VIG) ou Força (FOR)" },
      { emo: "O Vazio", attr: "Presença (PRE) ou Intelecto (INT)" },
      { emo: "A Ambição", attr: "Presença (PRE)" },
      { emo: "A Inveja", attr: "Intelecto (INT)" },
      { emo: "A Soberba", attr: "Presença (PRE)" },
      { emo: "O Pavor", attr: "Presença (PRE)" },
      { emo: "O Desespero", attr: "Vigor (VIG) ou Intelecto (INT)" },
      { emo: "A Melancolia", attr: "Presença (PRE) ou Vigor (VIG)" },
      { emo: "A Luxúria", attr: "Presença (PRE) ou Vigor (VIG)" },
      { emo: "A Culpa", attr: "Presença (PRE)" }
    ],
    trainingScaling: [
      { range: "Níveis 1 a 4 (Estágios I e II)", bonus: "+2 (Treinado)", cdExpected: "CD média entre 14 e 16" },
      { range: "Níveis 5 a 14 (Estágios III e IV)", bonus: "+5 (Veterano)", cdExpected: "CD média entre 18 e 21" },
      { range: "Níveis 15 a 20 (Estágios V e VI)", bonus: "+8 (Expert)", cdExpected: "CD média entre 22 e 26" }
    ],
    example: "Um agente de Nível 4 com Emoção Dominante Ambição (Presença 3) ativa o Nível 1 do Vórtice Dourado. Sua CD será: 10 + 3 (PRE) + 2 (Treinamento) = CD 15. Qualquer monstro na área precisa tirar 15 ou mais em seu teste para resistir.",
    saves: [
      {
        name: "Teste de Vontade",
        attr: "PRE ou INT",
        targets: "Efeitos mentais, pavor, fascínio, controle psíquico, ilusões, confusão e dor moral.",
        pass: "Sofre apenas metade do dano psíquico/moral e anula condições mentais (ou fica apenas Abalado em vez de Aterrorizado).",
        fail: "Sofre o dano integral e a condição mental completa (Aterrorizado, Paralisado, Confuso ou Silenciado)."
      },
      {
        name: "Teste de Vigor",
        attr: "VIG",
        targets: "Necrose, venenos, toxinas carnais, frio extremo, queimaduras contínuas e sufocamento.",
        pass: "Reduz o dano pela metade e anula condições físicas (não fica Lento, Envenenado ou Sangrando).",
        fail: "Sofre dano total e a condição física debilitante por toda a duração indicada."
      },
      {
        name: "Teste de Acrobacia / Reflexos",
        attr: "AGI",
        targets: "Implosões gravitacionais, ondas de choque sônicas, explosões de fogo e desabamentos de área.",
        pass: "Esquiva parcial rápida: sofre metade do dano e mantém-se de pé (não é derrubado nem arremessado).",
        fail: "Sofre dano total, é arremessado ou cai na condição Caído (-5 em ataques corpo a corpo e alvo fácil)."
      },
      {
        name: "Teste de Atletismo / Força",
        attr: "FOR",
        targets: "Correntes de ferro em brasa, fios dourados de marionete, tentáculos e amarras físicas.",
        pass: "O monstro quebra ou escapa das amarras e pode se mover normalmente.",
        fail: "Fica sob a condição Agarrado (Deslocamento 0 e -2 na Defesa Passiva) ou Imobilizado."
      }
    ],
    criticalSuccess: "20 Natural no Dado de Resistência (Sucesso Crítico): O alvo resiste com perfeição inabalável. Anula 100% do dano e de qualquer efeito secundário da habilidade.",
    criticalFailure: "1 Natural no Dado de Resistência (Desastre / Falha Crítica): A mente ou carne do alvo cede ao Paroxismo. Sofre dano máximo garantido (sem precisar rolar os dados de dano) e a duração da condição negativa é dobrada.",
    breakFreeRule: "Testes de Liberação a Cada Rodada (Escapando de Efeitos Contínuos): Para habilidades que prendem o alvo por várias rodadas (como Agarrado, Fios Presos, Envenenado ou Em Chamas): No início de cada um dos seus turnos, o alvo afetado pode gastar 1 Ação Padrão (ou Movimento, se especificado) para realizar um novo Teste de Resistência contra a CD original do portador. Se passar, livra-se imediatamente da condição e pode agir no restante do combate.",
    bidirectionalRule: "Como Isso Afeta os Personagens dos Jogadores: Essa regra funciona de forma bidirecional: quando uma aberração, criatura do Bestiário ou Titã do Avesso usa uma habilidade híbrida contra os investigadores, são os jogadores que rolam seus respectivos testes de Vontade, Vigor, Acrobacia ou Atletismo contra a CD da criatura, utilizando essas mesmas regras de mitigação de dano e condições."
  }
};

export const ARCHETYPES_DATA = [
  {
    "id": 1,
    "name": "Cinzas Negras",
    "slug": "cinzas-negras",
    "e1": "vazio",
    "e1Name": "O Vazio",
    "e2": "rancor",
    "e2Name": "O Rancor",
    "quote": "A queima gélida da ausência misturada à fúria incandescente. Fumaça cinzenta corrosiva que calcina e silencia.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Cena (Área de 3m)",
      "roll": "Ataque ou Teste de Ocultismo (PRE)",
      "effect": "Manifesta uma névoa densa de cinzas sufocantes ao redor do portador. Concede Camuflagem (+2 na Defesa contra ataques à distância) e adiciona +1d6 de dano de Fogo/Entropia em todos os ataques corpo a corpo.",
      "enemy": "Inimigos que entrarem ou iniciarem o turno na área sofrem 2d6 de dano e ficam sob a condição 'Abalado' (-2 em testes), sendo incapazes de se curar dentro da névoa."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "Cena (Área de 9m)",
      "roll": "Teste de Vontade dos Inimigos (CD 10 + PRE + Treinamento)",
      "extremePower": "A fumaça expande para 9m e torna-se um vórtice de fuligem que devora oxigênio. Ataques do portador ignoram 10 pontos de RD física e causam +3d8 de dano misto de Fogo e Entropia.",
      "enemy": "Inimigos que falharem no teste de Vontade ficam 'Silenciados' (incapazes de conjurar rituais) e sofrem 3d6 de dano contínuo de queimadura entrópica no início de cada rodada.",
      "penaltyName": "Custo de Cinzas",
      "penaltyDesc": "O portador inala a própria fuligem. Perde 6 PV na ativação e fica impedido de recuperar PV por rituais ou itens médicos até o final da cena."
    }
  },
  {
    "id": 2,
    "name": "Vórtice Dourado",
    "slug": "vortice-dourado",
    "e1": "vazio",
    "e1Name": "O Vazio",
    "e2": "ambicao",
    "e2Name": "A Ambição",
    "quote": "A fome insaciável de poder que suga a energia do cosmos para alimentar a própria supremacia.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Instantânea (Alcance Médio - 18m)",
      "roll": "Teste de Ocultismo (INT/PRE) vs Vontade do Alvo",
      "effect": "Abre uma fenda gravitacional dourada aos pés do alvo. Causa 2d8 de dano radiante e o portador recupera 1 PE se o teste for bem-sucedido.",
      "enemy": "O alvo é puxado 6 metros em direção ao centro do vórtice e sofre a condição 'Lento' até o fim do próximo turno dele."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "3 Rodadas (Área de 6m)",
      "roll": "Teste de Vontade em Área a cada rodada",
      "extremePower": "Um poço gravitacional de ouro líquido drena a essência vital dos presentes. Todo dano causado pelo vórtice (4d8 de dano radiante por rodada) recupera PE para o portador (1 PE a cada 15 de dano total causado).",
      "enemy": "Inimigos na área são 'Agarrados' por correntes douradas (Defesa -2 e Deslocamento 0) e têm 1 PE drenado por rodada que permanecerem presos.",
      "penaltyName": "Cobiça Desmedida",
      "penaltyDesc": "A mente do portador entra em colapso ganancioso. Enquanto o Vórtice Nível 2 estiver ativo, o portador não pode usar reações de Esquiva ou Bloqueio (Defesa restrita à base sem bônus)."
    }
  },
  {
    "id": 3,
    "name": "Solidão Voraz",
    "slug": "solidao-voraz",
    "e1": "vazio",
    "e1Name": "O Vazio",
    "e2": "luxuria",
    "e2Name": "A Luxúria",
    "quote": "A atração carnal irresistível que isola a presa em uma câmara de privação sensorial e drenagem de vida.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Instantânea (Toque)",
      "roll": "Ataque de Luta (FOR/AGI) ou Toque",
      "effect": "Desfere um toque predatório com garras espectrais. Causa 2d6 de dano de Entropia/Tóxico e o portador recupera PV igual à metade do dano causado.",
      "enemy": "O inimigo tocado fica momentaneamente 'Fascinado' (impossibilitado de realizar reações até o início do próximo turno dele)."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "2 Rodadas (Alcance Curto - 9m)",
      "roll": "Teste de Vontade do Alvo vs Ocultismo do Portador",
      "extremePower": "Envolve o alvo em um casulo de vácuo pulsante. O portador drena 4d8 de dano contínuo por rodada e converte 100% do dano em Pontos de Vida temporários para si mesmo.",
      "enemy": "O alvo fica em isolamento sensorial absoluto: sofre as condições 'Cego', 'Surdo' e 'Paralisado'. Qualquer ataque desferido contra o alvo considera-o Desprevenido.",
      "penaltyName": "Crise de Abstinência",
      "penaltyDesc": "O portador desenvolve dependência imediata da energia vital da presa. Quando o casulo se encerra ou o alvo morre, o portador sofre tremores incontroláveis, ficando 'Abalado' (-2 em tudo) pelo restante da cena."
    }
  },
  {
    "id": 4,
    "name": "Abismo Silencioso",
    "slug": "abismo-silencioso",
    "e1": "vazio",
    "e1Name": "O Vazio",
    "e2": "pavor",
    "e2Name": "O Pavor",
    "quote": "O pânico primário do desconhecido na escuridão absoluta onde o som e a orientação deixam de existir.",
    "level1": {
      "activation": "Ação de Movimento (2 PE)",
      "durationRange": "Cena",
      "roll": "Teste de Furtividade (AGI) com +5 de bônus",
      "effect": "O portador apaga totalmente seu som, odor e calor corporal. Consegue se camuflar mesmo sem cobertura em áreas de penumbra.",
      "enemy": "Inimigos a até 6m não conseguem localizar o portador por audição ou sensores térmicos, sofrendo desvantagem para detectá-lo."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas (Área de 9m)",
      "roll": "Teste de Vontade dos Inimigos (CD base)",
      "extremePower": "Ergue uma cúpula de escuridão impenetrável de 9m. O portador enxerga perfeitamente e seus ataques partindo da escuridão causam +3d10 de dano de Terror Sombrio.",
      "enemy": "Inimigos que falharem no teste ficam sob as condições 'Aterrorizado' e 'Cego' simultaneamente, gastando seus turnos tateando às cegas para tentar sair da área.",
      "penaltyName": "Paranoia Solitária",
      "penaltyDesc": "A escuridão corrói a sanidade do conjurador. Enquanto a cúpula estiver ativa, o portador rejeita qualquer ajuda: não pode receber curas, bônus ou comandos táticos de aliados."
    }
  },
  {
    "id": 5,
    "name": "Oblívio Penitente",
    "slug": "oblivio-penitente",
    "e1": "vazio",
    "e1Name": "O Vazio",
    "e2": "culpa",
    "e2Name": "A Culpa",
    "quote": "O desejo de apagar a própria existência para expiar erros, transformando o dano recebido em reflexão moral ao agressor.",
    "level1": {
      "activation": "Reação (2 PE)",
      "durationRange": "1 Ataque Sofrido",
      "roll": "Passiva Reativa ao sofrer dano",
      "effect": "Ao ser atingido, dissipa parte do impacto no vácuo, recebendo Resistência a Dano (RD) 5 contra o golpe.",
      "enemy": "O agressor sofre 1d8 de Dano Verdadeiro refletido em sua mente pelo remorso do ataque."
    },
    "level2": {
      "activation": "Reação (5 PE)",
      "durationRange": "1 Rodada Inteira",
      "roll": "Passiva Reativa",
      "extremePower": "O portador torna-se semi-etéreo, ganhando RD 15 contra todos os tipos de dano até o início do seu próximo turno.",
      "enemy": "100% de todo dano mitigado pela RD é devolvido diretamente ao agressor como Dano Verdadeiro. O inimigo deve passar em teste de Vontade ou fica 'Paralisado' pelo peso da própria culpa.",
      "penaltyName": "Erosão da Presença",
      "penaltyDesc": "O portador quase apaga sua presença do mundo. Seu limite máximo de PE por rodada é reduzido pela metade pelo restante da sessão de jogo."
    }
  },
  {
    "id": 6,
    "name": "Erosão da Alma",
    "slug": "erosao-da-alma",
    "e1": "vazio",
    "e1Name": "O Vazio",
    "e2": "inveja",
    "e2Name": "A Inveja",
    "quote": "A dissolução das virtudes e poderes alheios; apagar as vantagens do oponente e drenar sua competência.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "2 Rodadas (Alcance Curto - 9m)",
      "roll": "Teste de Ocultismo (INT) vs Vontade do Alvo",
      "effect": "Dispara um feixe cinzento corrosivo que anula uma resistência elemental à escolha do portador na criatura.",
      "enemy": "O alvo perde sua maior Resistência a Dano (RD) por 2 rodadas e sofre 2d6 de dano de Ácido Entrópico."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "Cena (Alcance Médio - 18m)",
      "roll": "Teste de Ocultismo (INT) vs Vontade do Alvo",
      "extremePower": "Purga todas as auras, bônus e condições benéficas ativas no monstro e transfere o maior modificador numérico do inimigo (+Ataque ou +Defesa) para o portador.",
      "enemy": "O alvo sofre a condição 'Corrosão Total' (-4 na Defesa Passiva e perde todas as imunidades a condições mentais) e sofre 4d8 de dano corrosivo.",
      "penaltyName": "Mimetismo Degenerativo",
      "penaltyDesc": "O corpo do portador apodrece temporariamente ao assimilar a carne aberrante. Fica com desvantagem em todos os testes de Vigor até receber tratamento médico em descanso."
    }
  },
  {
    "id": 7,
    "name": "Colapso Entrópico",
    "slug": "colapso-entropico",
    "e1": "vazio",
    "e1Name": "O Vazio",
    "e2": "desespero",
    "e2Name": "O Desespero",
    "quote": "A implosão violenta da matéria; vácuo repentino que esmaga estruturas e gera ondas de choque devastadoras.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Instantânea (Área de 4,5m)",
      "roll": "Teste de Atletismo ou Vigor dos inimigos (CD base)",
      "effect": "Detona uma implosão de vácuo. Causa 2d10 de dano Trovejante/Entrópico em todos os alvos na área.",
      "enemy": "Inimigos que falharem no teste são puxados 4,5m para o ponto central da explosão e caem na condição 'Caído'."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "Instantânea (Área de 9m)",
      "roll": "Teste de Vigor dos alvos (CD base)",
      "extremePower": "Uma micro-singularidade gravitacional implode a matéria da sala. Causa 6d10 de dano massivo em área e destrói coberturas e paredes frágeis.",
      "enemy": "Inimigos que falharem sofrem dano total e ficam 'Confusos' e 'Surdos' por 2 rodadas. Mesmo com sucesso, sofrem metade do dano e são arremessados 6m para trás.",
      "penaltyName": "Recuo Sísmico",
      "penaltyDesc": "A força gravitacional racha as articulações do próprio conjurador. O portador sofre 12 de dano de impacto imediato e fica sob a condição 'Lento' por 1 rodada."
    }
  },
  {
    "id": 8,
    "name": "Isolamento Tirânico",
    "slug": "isolamento-tiranico",
    "e1": "vazio",
    "e1Name": "O Vazio",
    "e2": "soberba",
    "e2Name": "A Soberba",
    "quote": "A exclusão absoluta dos inferiores; um monólito de silêncio e autoridade onde apenas o portador dita as regras.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "2 Rodadas",
      "roll": "Ação Padrão",
      "effect": "Ergue uma barreira cilíndrica de vácuo de 3m ao redor do portador. Projéteis à distância que cruzarem a barreira sofrem -5 no teste de ataque e têm o dano reduzido pela metade.",
      "enemy": "Inimigos adjacentes são empurrados 3m para trás pela força repulsiva do isolamento."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "3 Rodadas (Área de 6m)",
      "roll": "Teste de Vontade de quem tentar se aproximar",
      "extremePower": "Cria a 'Cúpula da Exclusão'. Nenhum inimigo pode entrar na área a menos que passe em teste de Vontade. Dentro da cúpula, os rituais do portador têm custo reduzido em 1 PE e seus ataques recebem +2 na margem de crítico.",
      "enemy": "Inimigos presentes na área quando a cúpula surge são ejetados com força, sofrendo 4d8 de dano de impacto e ficando impossibilitados de usar Reações enquanto a cúpula durar.",
      "penaltyName": "Arrogância Solitária",
      "penaltyDesc": "A exclusão corta o vínculo com a equipe. Aliados também não conseguem entrar na cúpula nem conceder auxílio ou bônus táticos ao portador."
    }
  },
  {
    "id": 9,
    "name": "Inverno Eterno",
    "slug": "inverno-eterno",
    "e1": "vazio",
    "e1Name": "O Vazio",
    "e2": "melancolia",
    "e2Name": "A Melancolia",
    "quote": "A entropia gélida e o luto que congelam o tempo, a esperança e o movimento molecular.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Cena (Área de 6m)",
      "roll": "Teste de Vigor dos alvos",
      "effect": "Cobre o chão de gelo negro e névoa fúnebre. Transforma a área em terreno difícil para todos os inimigos.",
      "enemy": "Inimigos que falharem no teste sofrem 2d6 de dano de Gelo Negro e ficam sob a condição 'Lento' (deslocamento reduzido pela metade)."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas (Área de 12m)",
      "roll": "Teste de Vigor dos alvos a cada rodada (CD base)",
      "extremePower": "A temperatura cai para zero absoluto paranormal. O ar congela e cristais negros cobrem armas. Ataques do portador contra alvos congelados causam +2d8 de dano extra.",
      "enemy": "Inimigos na área sofrem 3d8 de dano de Gelo Negro por rodada. Se falharem em dois testes consecutivos, ficam 'Paralisados/Congelados' em blocos de gelo escuro (Defesa reduzida para 10). Rituais inimigos custam +2 PE.",
      "penaltyName": "Hipotermia da Alma",
      "penaltyDesc": "O sangue do portador congela lentamente. A cada rodada que mantiver o Inverno Nível 2 ativo, perde 1m de Deslocamento e sofre 4 de dano de frio inevitável."
    }
  },
  {
    "id": 10,
    "name": "Tirano de Ferro",
    "slug": "tirano-de-ferro",
    "e1": "rancor",
    "e1Name": "O Rancor",
    "e2": "ambicao",
    "e2Name": "A Ambição",
    "quote": "A imposição implacável da vontade por meio de correntes em brasa e força destrutiva esmagadora.",
    "level1": {
      "activation": "Ação de Movimento (2 PE)",
      "durationRange": "Cena",
      "roll": "Ataques de Luta ou Pontaria",
      "effect": "Imbui armas com correntes de ferro em brasa. Cada golpe acertado no mesmo inimigo acumula +2 de dano adicional contínuo (máximo de +6 de dano).",
      "enemy": "O alvo atingido sofre 1d6 de dano de fogo extra e tem sua Defesa Passiva reduzida em -1 para cada acerto consecutivo."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas",
      "roll": "Ataques e Testes de Força (FOR)",
      "extremePower": "O portador manifesta a armadura e o mangual do Tirano. Recebe RD 5 a dano físico e seus ataques corpo a corpo causam +3d8 de dano de fogo, quebrando proteções pesadas.",
      "enemy": "Inimigos atingidos ficam 'Agarrados' por correntes incandescentes (sofrimento de 2d8 de dano de fogo no início do turno deles) e sofrem a condição 'Abalado' pela presença autoritária.",
      "penaltyName": "Obsessão Autocrática",
      "penaltyDesc": "O portador é tomado por delírio de comando tirânico. Deve gastar todas as suas ações atacando o inimigo mais poderoso da cena, ficando incapaz de recuar ou proteger aliados feridos."
    }
  },
  {
    "id": 11,
    "name": "Febre Escarlate",
    "slug": "febre-escarlate",
    "e1": "rancor",
    "e1Name": "O Rancor",
    "e2": "luxuria",
    "e2Name": "A Luxúria",
    "quote": "A fúria passional e selvagem; prazer extraído do calor da batalha que cicatriza feridas através do massacre.",
    "level1": {
      "activation": "Ação Livre (2 PE)",
      "durationRange": "Cena",
      "roll": "Ataques Corpo a Corpo",
      "effect": "Entra em estado de êxtase febril. Concede +2 em testes de ataque e +1d6 no dano de armas brancas.",
      "enemy": "Ao acertar um golpe crítico, o portador recupera 1d8 Pontos de Vida imediatos através do sangue derramado."
    },
    "level2": {
      "activation": "Ação Livre (5 PE)",
      "durationRange": "3 Rodadas",
      "roll": "Ataques Corpo a Corpo com Margem de Crítico Aprimorada",
      "extremePower": "A febre queima as veias com poder inumano. Concede 1 Ataque Adicional por rodada, margem de crítico aprimorada em +2 e regenera 5 PV no início de cada turno.",
      "enemy": "Inimigos atingidos sofrem ferimentos inflamados que aplicam a condição 'Sangrando' (3d6 por rodada) e ficam 'Desorientados' pelo calor sensorial (-2 em testes).",
      "penaltyName": "Exaustão Térmica",
      "penaltyDesc": "O corpo queima rápido demais. Ao término das 3 rodadas, a temperatura despenca e o portador cai na condição 'Lento' e 'Fatigado' (não pode correr nem gastar mais de 2 PE por rodada) até o fim da cena."
    }
  },
  {
    "id": 12,
    "name": "Fúria Acuada",
    "slug": "furia-acuada",
    "e1": "rancor",
    "e1Name": "O Rancor",
    "e2": "pavor",
    "e2Name": "O Pavor",
    "quote": "A agressividade extrema de quem está à beira da morte; o pânico que se converte em instinto assassino letal.",
    "level1": {
      "activation": "Passiva / Reativa (2 PE)",
      "durationRange": "Cena",
      "roll": "Ativação quando os PV caem abaixo de 50%",
      "effect": "Quando ferido gravemente, o pavor de morrer dispara fúria incontrolável. Recebe +3 em testes de ataque, +1d8 no dano e +2m de Deslocamento.",
      "enemy": "Inimigos que errarem ataques contra o portador acuado provocam um contra-ataque imediato como Reação."
    },
    "level2": {
      "activation": "Reação (5 PE)",
      "durationRange": "Cena",
      "roll": "Ativação quando os PV caem abaixo de 25%",
      "extremePower": "O desespero de sobrevivência ativa um transe violento. O portador recebe +5 em testes de ataque, seus golpes causam dano dobrado e seus ataques corpo a corpo empurram alvos 3m para trás.",
      "enemy": "Inimigos que presenciarem a fúria desesperada devem passar em Vontade ou ficam 'Aterrorizados' por 1 rodada.",
      "penaltyName": "Frenesi Cego",
      "penaltyDesc": "O portador perde a capacidade de distinguir alvos com precisão. Se não houver inimigos ao alcance corpo a corpo, deve atacar o obstáculo ou criatura mais próxima (incluindo aliados adjacentes se não passar em Vontade CD 15)."
    }
  },
  {
    "id": 13,
    "name": "Flagelo Vingativo",
    "slug": "flagelo-vingativo",
    "e1": "rancor",
    "e1Name": "O Rancor",
    "e2": "culpa",
    "e2Name": "A Culpa",
    "quote": "A retaliação absoluta; a dor física e o remorso acumulados que explodem de volta contra os agressores.",
    "level1": {
      "activation": "Reação (2 PE)",
      "durationRange": "1 Rodada",
      "roll": "Passiva Reativa ao sofrer dano",
      "effect": "Sempre que sofrer dano corpo a corpo, fragmentos incandescentes explodem do peito, causando 1d8 de dano de Fogo/Verdadeiro ao atacante.",
      "enemy": "O agressor sofre penalidade de -2 no próximo teste de ataque que realizar na rodada."
    },
    "level2": {
      "activation": "Reação (5 PE)",
      "durationRange": "Cena",
      "roll": "Passiva Reativa",
      "extremePower": "O portador canaliza toda a dor sofrida em uma fornalha de penitência. Todo dano sofrido é armazenado em uma reserva (até o máximo de 30 pontos). O portador pode descarregar essa reserva no próximo ataque como Dano Verdadeiro adicional.",
      "enemy": "Inimigos atingidos pela descarga são envoltos em arame farpado incandescente: sofrem a condição 'Em Chamas' e ficam 'Imobilizados' por 1 rodada.",
      "penaltyName": "Cicatriz Kármica",
      "penaltyDesc": "A dor absorvida deixa marcas permanentes no corpo. Ao descarregar a reserva, o portador sofre 25% do valor total descarregado como dano inevitável a si mesmo."
    }
  },
  {
    "id": 14,
    "name": "Chamas da Cobiça",
    "slug": "chamas-da-cobica",
    "e1": "rancor",
    "e1Name": "O Rancor",
    "e2": "inveja",
    "e2Name": "A Inveja",
    "quote": "O ódio por aquilo que não possui; chamas ácidas que destroem armas, equipamentos e vantagens do inimigo.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "2 Rodadas (Alcance Curto - 9m)",
      "roll": "Teste de Pontaria ou Ocultismo",
      "effect": "Dispara labaredas esverdeadas que grudam nos equipamentos do alvo. Causa 2d6 de dano de Fogo/Ácido.",
      "enemy": "O alvo tem a Defesa da sua proteção/armadura reduzida em -2 e suas armas de ataque causam -2 de dano durante 2 rodadas."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "Cena (Alcance Médio - 18m)",
      "roll": "Teste de Vigor do Inimigo",
      "extremePower": "As chamas ácidas incineram e derretem a carapaça do alvo. O portador absorve as propriedades destruídas, ganhando bônus de Defesa e Dano iguais aos que o inimigo perdeu.",
      "enemy": "O monstro sofre a quebra de sua blindagem: perde 10 pontos de RD física e sofre 3d8 de dano corrosivo contínuo por rodada.",
      "penaltyName": "Corrupção Caústica",
      "penaltyDesc": "As cinzas ácidas queimam as mãos e olhos do próprio portador. Fica sob a condição 'Abalado' e sofre -2 em testes de Percepção e Pontaria até o fim do combate."
    }
  },
  {
    "id": 15,
    "name": "Histeria Incandescente",
    "slug": "histeria-incandescente",
    "e1": "rancor",
    "e1Name": "O Rancor",
    "e2": "desespero",
    "e2Name": "O Desespero",
    "quote": "A explosão descontrolada de raiva e pânico; uma torrente de ataques imprevisíveis em alta velocidade.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Instantânea",
      "roll": "Teste de Ataque com -2 de penalidade",
      "effect": "Realiza dois ataques consecutivos com a mesma arma na mesma ação, cada um causando o dano normal + 1d6 de fogo.",
      "enemy": "Inimigos atingidos são empurrados 3 metros para trás pelo impacto frenético."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "2 Rodadas",
      "roll": "Múltiplos Ataques",
      "extremePower": "O portador entra em sobrecarga histerica: pode realizar três ataques com Ação Padrão, todos recebendo +2d8 de dano de fogo/trovejante e derrubando os alvos.",
      "enemy": "Inimigos na área sofrem a condição 'Confuso' pelo bombardeio violento e ensurdecedor das explosões.",
      "penaltyName": "Colapso Muscular",
      "penaltyDesc": "A intensidade sobre-humana rasga as fibras musculares do portador. Ao término do efeito, o portador sofre 10 de dano de estresse físico e perde sua Ação de Movimento no turno seguinte."
    }
  },
  {
    "id": 16,
    "name": "Orgulho Sangrento",
    "slug": "orgulho-sangrento",
    "e1": "rancor",
    "e1Name": "O Rancor",
    "e2": "soberba",
    "e2Name": "A Soberba",
    "quote": "A recusa inabalável em se curvar; a fúria aristocrática que pune qualquer tentativa de desrespeito.",
    "level1": {
      "activation": "Passiva (2 PE)",
      "durationRange": "Cena",
      "roll": "Testes de Vontade e Iniciativa",
      "effect": "O portador torna-se imune à condição Abalado e ganha +2 em testes de Vontade. Quando um inimigo o ataca e erra, o portador ganha +2 no próximo ataque contra ele.",
      "enemy": "O inimigo que errou o ataque fica momentaneamente desmoralizado (-2 na Defesa contra o próximo golpe do portador)."
    },
    "level2": {
      "activation": "Ação Livre (5 PE)",
      "durationRange": "3 Rodadas",
      "roll": "Aura de Comando Furioso",
      "extremePower": "A presença do portador torna-se monumental. Seus ataques recebem +3d8 de dano de fogo e qualquer inimigo que causar dano a ele provoca um contra-ataque imediato automático com margem de crítico aprimorada em +1.",
      "enemy": "Inimigos a até 6m devem passar em Vontade ou não conseguem olhar diretamente para o portador, sofrendo penalidade de -5 para atacá-lo.",
      "penaltyName": "Vulnerabilidade à Humilhação",
      "penaltyDesc": "Se o portador for derrubado ('Caído') ou tiver um ataque cancelado, seu ego racha: sofre 8 de dano mental e perde todos os bônus do Orgulho Sangrento até o fim da cena."
    }
  },
  {
    "id": 17,
    "name": "Brasas da Ruína",
    "slug": "brasas-da-ruina",
    "e1": "rancor",
    "e1Name": "O Rancor",
    "e2": "melancolia",
    "e2Name": "A Melancolia",
    "quote": "O fogo que não se apaga; brasas lentas sob cinzas frias que corroem feridas e impedem a cicatrização.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Cena",
      "roll": "Ataques com Arma Manifestada",
      "effect": "Imbui a arma com brasas fúnebres. Seus ataques causam +1d6 de dano de fogo e aplicam ferimentos necróticos.",
      "enemy": "O alvo fica sob a condição 'Sangrando/Queimando' (1d6 por rodada) e não pode recuperar PV por habilidades naturais ou regeneração por 2 rodadas."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas (Alcance Curto - 9m)",
      "roll": "Teste de Vigor do Inimigo",
      "extremePower": "Aquece o sangue do alvo com calor cadavérico. Causa 4d8 de dano de fogo negro que ignora resistências a dano.",
      "enemy": "O monstro sofre queima interna contínua (2d8 por rodada) e tem sua velocidade de deslocamento reduzida pela metade ('Lento'), sendo incapaz de regenerar vida pelo restante do combate.",
      "penaltyName": "Entorpecimento das Cinzas",
      "penaltyDesc": "A melancolia das cinzas arrefece o coração do portador. Cada rodada com o poder ativo custa 1 PE adicional involuntário de manutenção."
    }
  },
  {
    "id": 18,
    "name": "Sedutor Dourado",
    "slug": "sedutor-dourado",
    "e1": "ambicao",
    "e1Name": "A Ambição",
    "e2": "luxuria",
    "e2Name": "A Luxúria",
    "quote": "O fascínio hipnótico da riqueza e do prazer; controle mental exercido através do desejo incontrolável.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "1 Rodada (Alcance Curto - 9m)",
      "roll": "Teste de Vontade do Alvo vs Diplomacia/Ocultismo (PRE)",
      "effect": "Projeta uma aura dourada de tentação irresistível. O alvo fascinado não pode atacar o portador voluntariamente por 1 rodada.",
      "enemy": "Se o alvo for atacado por qualquer aliado do portador, a ilusão quebra, mas o primeiro ataque contra ele considera-o Desprevenido."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "3 Rodadas (Alcance Médio - 18m)",
      "roll": "Teste de Vontade do Alvo (CD base)",
      "extremePower": "O portador assume controle psíquico sobre a mente ou instintos do monstro/inimigo através de fios dourados invisíveis.",
      "enemy": "O alvo dominado deve gastar seu turno atacando um lacaio ou aliado dele próprio escolhido pelo portador. Enquanto estiver sob controle, sofre 2d8 de dano mental por rodada pelo atrito cerebral.",
      "penaltyName": "Drenagem da Vaidade",
      "penaltyDesc": "O elo mental é recíproco. Se o alvo dominado sofrer dano enquanto controlado, o portador sofre 25% desse dano como dor empática reflexa."
    }
  },
  {
    "id": 19,
    "name": "Paranoia do Trono",
    "slug": "paranoia-do-trono",
    "e1": "ambicao",
    "e1Name": "A Ambição",
    "e2": "pavor",
    "e2Name": "O Pavor",
    "quote": "O medo constante da traição e perda do poder; vigilância extrema que antecipa qualquer ameaça com violência preventiva.",
    "level1": {
      "activation": "Reação (2 PE)",
      "durationRange": "Cena",
      "roll": "Iniciativa e Percepção",
      "effect": "O portador não pode ser surpreendido e ganha +5 na Iniciativa. Recebe +2 na Defesa Passiva contra ataques pelas costas ou de emboscada.",
      "enemy": "Inimigos que tentarem atacar o portador a partir da furtividade têm sua posição revelada imediatamente para todo o grupo."
    },
    "level2": {
      "activation": "Ação de Movimento (5 PE)",
      "durationRange": "3 Rodadas",
      "roll": "Defesa Reativa e Contra-Ataques",
      "extremePower": "Fios dourados e sombras defensivas cercam o portador em raio de 3m. Qualquer inimigo que entrar nesse perímetro ou declarar um ataque provoca um ataque de oportunidade imediato do portador com +2d10 de dano.",
      "enemy": "Inimigos atacados pelo contra-ataque ficam sob a condição 'Aterrorizado' e devem interromper seu movimento imediatamente.",
      "penaltyName": "Delírio Persecutório",
      "penaltyDesc": "A mente do portador enxerga traição em tudo. Não pode ficar adjacente a aliados (se um aliado terminar o turno a 1,5m dele, o portador deve se afastar ou sofre a condição 'Confuso')."
    }
  },
  {
    "id": 20,
    "name": "Tributo das Almas",
    "slug": "tributo-das-almas",
    "e1": "ambicao",
    "e1Name": "A Ambição",
    "e2": "culpa",
    "e2Name": "A Culpa",
    "quote": "A cobrança de dívidas morais; forçar os inimigos a pagarem com sangue pelo direito de atacar.",
    "level1": {
      "activation": "Ação de Movimento (2 PE)",
      "durationRange": "Cena",
      "roll": "Aura de Cobrança (6m)",
      "effect": "Inimigos na área que atacarem o portador ou seus aliados devem gastar 1 PE extra para cada ataque ou ação ofensiva.",
      "enemy": "Se o inimigo não tiver PE para pagar o tributo, sofre 2d6 de Dano Verdadeiro imediatamente antes de rolar o golpe."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas (Área de 9m)",
      "roll": "Cobrança Imperial de Pecados",
      "extremePower": "Ergue uma balança áurea no centro da sala. Sempre que um inimigo causar dano a qualquer membro do grupo, o monstro sofre 50% desse dano de volta como Dano Verdadeiro.",
      "enemy": "O inimigo com maior dano na rodada é marcado pelo 'Tributo Mortal': tem suas ações de movimento canceladas no turno seguinte.",
      "penaltyName": "Peso da Cobrança",
      "penaltyDesc": "O portador carrega o fardo da ganância punitiva. Ao ativar o Tributo Nível 2, tem seu Deslocamento reduzido para 3m enquanto a balança estiver erguida."
    }
  },
  {
    "id": 21,
    "name": "Usurpador Oculto",
    "slug": "usurpador-oculto",
    "e1": "ambicao",
    "e1Name": "A Ambição",
    "e2": "inveja",
    "e2Name": "A Inveja",
    "quote": "O roubo da grandeza alheia; copiar perfeitamente os poderes do monstro e usá-los com superioridade.",
    "level1": {
      "activation": "Reação (2 PE)",
      "durationRange": "1 Uso",
      "roll": "Teste de Ocultismo (INT)",
      "effect": "Quando um inimigo usar uma habilidade especial ou ritual na cena, o portador memoriza o efeito e pode replicá-lo no seu próximo turno usando seus próprios atributos.",
      "enemy": "O monstro sofre desvantagem na próxima vez que tentar usar essa mesma habilidade na cena."
    },
    "level2": {
      "activation": "Reação (6 PE)",
      "durationRange": "Cena",
      "roll": "Roubo Permanente de Traço de Monstro",
      "extremePower": "O portador rouba temporariamente uma ação lendária, habilidade passiva ou resistência do monstro e adiciona à sua própria ficha durante todo o combate.",
      "enemy": "A criatura perde totalmente a habilidade roubada pelo restante da cena e sofre 4d8 de dano corrosivo.",
      "penaltyName": "Rejeição da Carne",
      "penaltyDesc": "O corpo humano não foi feito para abrigar poderes aberrantes roubados. A cada turno em que utilizar a habilidade roubada, o portador perde 4 PV inevitáveis."
    }
  },
  {
    "id": 22,
    "name": "Aposta Desesperada",
    "slug": "aposta-desesperada",
    "e1": "ambicao",
    "e1Name": "A Ambição",
    "e2": "desespero",
    "e2Name": "O Desespero",
    "quote": "A ganância de tudo ou nada; apostar a própria integridade física para conseguir sucessos e danos críticos devastadores.",
    "level1": {
      "activation": "Ação Livre (2 PE)",
      "durationRange": "1 Teste",
      "roll": "Rolagem de d20",
      "effect": "Ao realizar um teste de ataque ou perícia, o portador sacrifica 5 PV para rolar dois dados d20 e escolher o melhor resultado.",
      "enemy": "Se acertar o ataque, o dano da arma recebe +1d10 de bônus."
    },
    "level2": {
      "activation": "Ação Livre (5 PE)",
      "durationRange": "1 Ataque",
      "roll": "Aposta Crítica Máxima",
      "extremePower": "O portador aposta 15 PV em um único golpe. Se o ataque acertar, ele é considerado automaticamente um Acerto Crítico com multiplicador aumentado em +1 (ex: x2 vira x3) e causa +4d10 de dano.",
      "enemy": "O inimigo atingido sofre trauma severo e tem um membro quebrado/deformado (-2 em todos os ataques até o fim do combate).",
      "penaltyName": "Falha da Roleta",
      "penaltyDesc": "Se o ataque errar a Defesa do inimigo, o portador sofre o dano integral que pretendia causar de volta em si mesmo como Dano Verdadeiro."
    }
  },
  {
    "id": 23,
    "name": "Coroa Monolítica",
    "slug": "coroa-monolitica",
    "e1": "ambicao",
    "e1Name": "A Ambição",
    "e2": "soberba",
    "e2Name": "A Soberba",
    "quote": "A supremacia absoluta; decretar a lei no campo de batalha e paralisar a audácia dos oponentes.",
    "level1": {
      "activation": "Ação de Movimento (2 PE)",
      "durationRange": "2 Rodadas",
      "roll": "Aura de Majestade (6m)",
      "effect": "O portador manifesta uma coroa dourada radiante. Inimigos na área sofrem -2 em testes de ataque e Defesa.",
      "enemy": "Inimigos lacaios ou inferiores ficam impedidos de usar Ações de Movimento para se aproximar do portador."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "3 Rodadas (Área de 9m)",
      "roll": "Teste de Vontade vs Presença",
      "extremePower": "Decreto Imperial: O portador emite uma ordem soberana. Inimigos que falharem no teste de Vontade perdem sua Ação Padrão no próximo turno, podendo apenas recuar ou se defender.",
      "enemy": "Inimigos na área sofrem 4d8 de dano radiante por rodada pela pressão gravitacional da majestade e têm suas Reações anuladas.",
      "penaltyName": "Rigidez Real",
      "penaltyDesc": "A soberba torna o portador estático e orgulhoso demais para se esquivar. Enquanto a Coroa Nível 2 estiver ativa, sua Defesa cai em -4 contra ataques pelas costas ou de flanco."
    }
  },
  {
    "id": 24,
    "name": "Herança Maldita",
    "slug": "heranca-maldita",
    "e1": "ambicao",
    "e1Name": "A Ambição",
    "e2": "melancolia",
    "e2Name": "A Melancolia",
    "quote": "A acumulação de relíquias e recursos à custa da decomposição e do envelhecimento precoce dos inimigos.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Cena (Alcance Curto - 9m)",
      "roll": "Teste de Vigor do Alvo",
      "effect": "Marca um inimigo com uma pátina fúnebre dourada. Cada acerto contra o alvo gera 1 PE para quem acertou o golpe (limite 1x/rodada).",
      "enemy": "O alvo tem seu deslocamento reduzido em -3m e sofre 1d8 de dano de decomposição contínuo a cada rodada."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "Cena (Alcance Médio - 18m)",
      "roll": "Teste de Vigor do Inimigo",
      "extremePower": "Acelera a decadência temporal do alvo. O monstro envelhece séculos em segundos: perde 15 de RD física e sofre 4d8 de dano necrótico.",
      "enemy": "Toda vez que o monstro marcado errar um ataque, metade do dano que causaria é convertido em cura direta para o grupo de investigadores.",
      "penaltyName": "Peso da Herança",
      "penaltyDesc": "O tempo roubado apodrece o vigor do portador. Ele perde 2 espaços máximos de inventário e sofre -2 em testes físicos de Força e Atletismo até o fim da cena."
    }
  },
  {
    "id": 25,
    "name": "Pesadelo Carnal",
    "slug": "pesadelo-carnal",
    "e1": "luxuria",
    "e1Name": "A Luxúria",
    "e2": "pavor",
    "e2Name": "O Pavor",
    "quote": "A atração pelo grotesco; tentáculos, bocas e formas carnais que causam terror e devoram a determinação da presa.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Instantânea (Alcance Curto - 9m)",
      "roll": "Teste de Vontade do Alvo",
      "effect": "Projeta extensões carnais com bocas sussurrantes. Causa 2d6 de dano psíquico/tóxico.",
      "enemy": "O alvo que falhar fica 'Aterrorizado' e é puxado 3m em direção ao portador pelos tentáculos carmesins."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas (Área de 6m)",
      "roll": "Teste de Vontade a cada rodada",
      "extremePower": "O chão e as paredes tornam-se uma massa viva de bocas e olhos carnosos. Inimigos na área sofrem 3d8 de dano biológico por rodada e têm suas defesas reduzidas em -3.",
      "enemy": "Inimigos que falharem no teste entram em choque histérico: ficam 'Paralisados' por fascínio e medo, incapazes de agir enquanto as bocas devoram sua sanidade.",
      "penaltyName": "Fome Insaciável",
      "penaltyDesc": "A carne exige sustento. Se ao término das 3 rodadas o poder não tiver abatido nenhum inimigo, o portador sofre 10 de dano de fome carnal em seus próprios PV."
    }
  },
  {
    "id": 26,
    "name": "Espinhos da Penitência",
    "slug": "espinhos-da-penitencia",
    "e1": "luxuria",
    "e1Name": "A Luxúria",
    "e2": "culpa",
    "e2Name": "A Culpa",
    "quote": "O alívio através do martírio compartilhado; curar ferimentos de aliados absorvendo a dor e o sangramento para si.",
    "level1": {
      "activation": "Ação de Movimento (2 PE)",
      "durationRange": "Instantânea (Alcance Curto - 9m)",
      "roll": "Ação de Toque ou Alcance",
      "effect": "O portador absorve as dores de um aliado ferido. Cura 3d6 de PV no aliado e sofre metade do valor curado como dano inevitável em si mesmo.",
      "enemy": "O aliado curado remove qualquer condição de Abalado, Sangrando ou Envenenado imediatamente."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "Cena",
      "roll": "Aura de Penitência Compartilhada (6m)",
      "extremePower": "O portador cria um elo de espinhos carmesim com até 3 aliados. Todo dano que esses aliados sofrerem é reduzido em 50%, e o dano mitigado é transferido para o portador como dano dividido.",
      "enemy": "Inimigos que causarem dano a qualquer um dos aliados vinculados sofrem 2d8 de Dano Verdadeiro de retaliação.",
      "penaltyName": "Estigma de Mártir",
      "penaltyDesc": "O excesso de dor acumulada ameaça o colapso cardíaco. Se o portador cair a 0 PV enquanto o vínculo estiver ativo, entra no estado Morrendo com 1 falha automática no teste de Vigor."
    }
  },
  {
    "id": 27,
    "name": "Fascínio Parasitário",
    "slug": "fascinio-parasitario",
    "e1": "luxuria",
    "e1Name": "A Luxúria",
    "e2": "inveja",
    "e2Name": "A Inveja",
    "quote": "A criação de clones sedutores e duplicatas atrativas que drenam a energia e a atenção dos oponentes.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "2 Rodadas",
      "roll": "Enganação ou Ocultismo (PRE)",
      "effect": "Cria uma duplicata ilusória e sedutora de si mesmo a até 6m. A cópia possui 10 PV e atrai o primeiro ataque inimigo da rodada.",
      "enemy": "Quando um inimigo ataca a cópia, ela explode em fluido cáustico, causando 2d6 de dano de ácido e cegando o atacante por 1 rodada."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas",
      "roll": "Manifestação de Clones Múltiplos",
      "extremePower": "Gera 3 duplicatas perfeitas. O portador pode trocar de posição com qualquer clone como Reação livre ao ser atacado, fazendo o ataque errar automaticamente.",
      "enemy": "Inimigos a até 3m dos clones sofrem dreno contínuo: perdem 1 PE e 2d6 PV por rodada, transferindo a energia para o portador.",
      "penaltyName": "Fragilidade Narcísica",
      "penaltyDesc": "A dispersão da alma entre os clones enfraquece o corpo real. Enquanto os 3 clones estiverem ativos, o portador sofre +50% de dano de qualquer ataque em área que o atinja."
    }
  },
  {
    "id": 28,
    "name": "Frenesi Selvagem",
    "slug": "frenesi-selvagem",
    "e1": "luxuria",
    "e1Name": "A Luxúria",
    "e2": "desespero",
    "e2Name": "O Desespero",
    "quote": "A perda total da inibição; velocidade frenética e sede de sangue que ignora o perigo em troca de chacina.",
    "level1": {
      "activation": "Ação Livre (2 PE)",
      "durationRange": "2 Rodadas",
      "roll": "Ataques Rápidos",
      "effect": "O portador ganha +1 Ação de Movimento extra por rodada e +3m de deslocamento. Seus ataques recebem +1d6 de dano de corte/perfuração.",
      "enemy": "O portador sofre -2 na Defesa Passiva pela postura desprovida de cautela."
    },
    "level2": {
      "activation": "Ação Livre (5 PE)",
      "durationRange": "2 Rodadas",
      "roll": "Frenesi Assassino Total",
      "extremePower": "O portador torna-se um borrão carmesim de violência pura. Ganha 1 Ação Padrão extra por rodada e margem de crítico aprimorada em +2 em todas as armas.",
      "enemy": "Inimigos atacados durante o frenesi sofrem a condição 'Sangrando Grave' (3d8 de dano por turno) e ficam impossibilitados de realizar ataques de oportunidade.",
      "penaltyName": "Vulnerabilidade Crítica",
      "penaltyDesc": "A guarda fica 100% aberta no frenesi. A Defesa Passiva do portador cai para 10 fixos e qualquer ataque que o atinja causa dano crítico automático."
    }
  },
  {
    "id": 29,
    "name": "Narcisismo Perfeito",
    "slug": "narcisismo-perfeito",
    "e1": "luxuria",
    "e1Name": "A Luxúria",
    "e2": "soberba",
    "e2Name": "A Soberba",
    "quote": "A contemplação da própria beleza inatingível; uma aura magnética que força oponentes a hesitarem diante da perfeição.",
    "level1": {
      "activation": "Ação de Movimento (2 PE)",
      "durationRange": "Cena",
      "roll": "Aura Pessoal (3m)",
      "effect": "O portador emana fascínio avassalador. Inimigos que tentarem atacá-lo sofrem -3 no teste de ataque a menos que passem em Vontade.",
      "enemy": "Se o ataque do inimigo errar, o agressor fica 'Fascinado' e perde sua Ação de Movimento no próximo turno."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "3 Rodadas (Área de 6m)",
      "roll": "Teste de Vontade vs Presença",
      "extremePower": "A perfeição do portador cega os sentidos das criaturas. Qualquer inimigo na área que declarar um ataque contra o portador deve rolar um teste de Vontade (CD base): se falhar, o ataque é cancelado e o monstro ataca a si mesmo.",
      "enemy": "Inimigos na área sofrem 3d8 de dano radiante/mental por rodada pelo choque estético da soberba.",
      "penaltyName": "Vaidade Frágil",
      "penaltyDesc": "Se o portador sofrer uma cicatriz, queimadura ou perder mais de 20 PV em um único golpe, seu transe quebra em fúria desesperada: sofre a condição 'Confuso' por 1 rodada inteira."
    }
  },
  {
    "id": 30,
    "name": "Abraço da Decomposição",
    "slug": "abraco-da-decomposicao",
    "e1": "luxuria",
    "e1Name": "A Luxúria",
    "e2": "melancolia",
    "e2Name": "A Melancolia",
    "quote": "O toque suave que traz apodrecimento; transformar o afeto em velhice, ferrugem e dissolução carnal.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Instantânea (Toque)",
      "roll": "Ataque Desarmado ou Toque",
      "effect": "Um toque delicado que desfaz a carne e corrói tecidos. Causa 2d8 de dano de Necrose/Tóxico.",
      "enemy": "O alvo tocado tem sua Força e Agilidade reduzidas em -1 temporariamente e fica sob a condição 'Lento' por 2 rodadas."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "Cena (Alcance Curto - 9m)",
      "roll": "Teste de Vigor do Inimigo",
      "extremePower": "O portador projeta um beijo espectral de decomposição acelerada. O alvo sofre 4d8 de dano necrótico e sua armadura/pele perde 10 pontos de RD.",
      "enemy": "A cada início de turno, a podridão se espalha, causando 2d8 de dano contínuo e transferindo metade desse dano como cura de PV para o portador.",
      "penaltyName": "Contaminação Necrótica",
      "penaltyDesc": "O toque da podridão deixa resíduos no corpo do portador. Ele não pode se beneficiar de poções, adrenalinas ou itens estimulantes até que tome um banho e faça descanso longo."
    }
  },
  {
    "id": 31,
    "name": "Assombração do Remorso",
    "slug": "assombracao-do-remorso",
    "e1": "pavor",
    "e1Name": "O Pavor",
    "e2": "culpa",
    "e2Name": "A Culpa",
    "quote": "Os pecados que ganham corpo; sombras aterrorizantes que projetam os piores crimes e remorsos na mente do alvo.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Instantânea (Alcance Médio - 18m)",
      "roll": "Teste de Vontade do Alvo",
      "effect": "Manifesta espectros dos erros passados do alvo ao redor dele. Causa 2d8 de dano de Terror Psíquico.",
      "enemy": "O alvo que falhar no teste de Vontade fica 'Abalado' e solta qualquer item que esteja segurando nas mãos."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas (Alcance Médio - 18m)",
      "roll": "Teste de Vontade a cada rodada (CD base)",
      "extremePower": "O alvo é cercado por visões aterrorizantes de todas as vidas que destruiu. Sofre 4d8 de dano mental direto por rodada.",
      "enemy": "Se o monstro falhar em dois testes, fica sob a condição 'Aterrorizado' e entra em autoflagelo, desferindo um ataque com suas próprias garras contra seu peito a cada rodada.",
      "penaltyName": "Eco de Culpa",
      "penaltyDesc": "O portador também é assombrado pelos seus próprios remorsos ao abrir o canal psíquico. Sofre -2 em testes de Iniciativa e Vontade pelo restante da cena."
    }
  },
  {
    "id": 32,
    "name": "Perseguidor Sombrio",
    "slug": "perseguidor-sombrio",
    "e1": "pavor",
    "e1Name": "O Pavor",
    "e2": "inveja",
    "e2Name": "A Inveja",
    "quote": "A sombra que sempre segue atrás; o terror de ser caçado por alguém que quer arrancar a sua identidade.",
    "level1": {
      "activation": "Ação de Movimento (2 PE)",
      "durationRange": "Cena",
      "roll": "Furtividade e Deslocamento",
      "effect": "Permite que o portador se teletransporte instantaneamente para a sombra de qualquer inimigo a até 9m de distância como parte do movimento.",
      "enemy": "O ataque realizado imediatamente após o teletransporte causa +1d8 de dano extra e considera o alvo Desprevenido."
    },
    "level2": {
      "activation": "Reação (5 PE)",
      "durationRange": "Cena",
      "roll": "Teletransporte de Perseguição",
      "extremePower": "Sempre que um inimigo tentar se afastar, recuar ou fugir do portador, o portador se teletransporta instantaneamente para as costas dele e desfere um ataque de oportunidade com crítico garantido.",
      "enemy": "O inimigo atingido sofre 3d8 de dano perfurante e fica 'Paralisado' pelo susto de ter a sombra colada aos seus calcanhares.",
      "penaltyName": "Fobia da Luz",
      "penaltyDesc": "O portador fica hipersensível à iluminação. Se for exposto a lanternas de alta potência, holofotes UV ou rituais de luz, sofre a condição 'Cego' e 'Abalado' por 1 rodada."
    }
  },
  {
    "id": 33,
    "name": "Frenesi do Pânico",
    "slug": "frenesi-do-panico",
    "e1": "pavor",
    "e1Name": "O Pavor",
    "e2": "desespero",
    "e2Name": "O Desespero",
    "quote": "A histeria descontrolada do terror em massa; gritos e pânico coletivo que desarticulam esquadrões inteiros de monstros.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Instantânea (Cone de 6m)",
      "roll": "Teste de Vontade dos Inimigos",
      "effect": "Emite um grito de pânico ultrassônico que estilhaça vidros e ouvidos. Causa 2d8 de dano Trovejante em todos os alvos no cone.",
      "enemy": "Inimigos que falharem ficam sob a condição 'Aterrorizado' e devem largar armas de duas mãos ou objetos que seguram."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "2 Rodadas (Área de 12m)",
      "roll": "Teste de Vontade dos Inimigos (CD base)",
      "extremePower": "O portador desencadeia uma tempestade psíquica de desespero absoluto. Todos os inimigos na área sofrem 5d8 de dano trovejante/psíquico.",
      "enemy": "Inimigos que falharem entram em pânico cego: gastam todos os seus movimentos fugindo desorientados e colidindo contra paredes (sofrendo 2d6 de dano de impacto adicional por colisão).",
      "penaltyName": "Espasmo Traumático",
      "penaltyDesc": "O grito rompe os tímpanos e cordas vocais do próprio conjurador. O portador fica 'Surdo' e 'Mudo' (incapaz de falar ou conjurar rituais com voz) por 2 rodadas completas."
    }
  },
  {
    "id": 34,
    "name": "Manto do Pesadelo",
    "slug": "manto-do-pesadelo",
    "e1": "pavor",
    "e1Name": "O Pavor",
    "e2": "soberba",
    "e2Name": "A Soberba",
    "quote": "Transformar o medo dos outros em poder pessoal; alimentar a própria armadura e imponência com o terror dos inimigos.",
    "level1": {
      "activation": "Ação de Movimento (2 PE)",
      "durationRange": "Cena",
      "roll": "Aura Pessoal",
      "effect": "O portador se agiganta em sombras aterrorizantes. Ganha +2 na Defesa Passiva para cada inimigo na cena que estiver sob as condições Abalado ou Aterrorizado (máximo de +6).",
      "enemy": "Inimigos a até 3m têm desvantagem em testes de Vontade para resistir a medo."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas",
      "roll": "Armadura de Pesadelo",
      "extremePower": "O portador absorve o medo de todos os presentes, manifestando uma carapaça de sombras titânica. Ganha +20 PV temporários e RD 10 contra todo tipo de dano.",
      "enemy": "Inimigos que olharem diretamente para o Manto devem fazer teste de Vontade: se falharem, ficam 'Paralisados' por 1 rodada inteira. Cada ataque do portador causa +3d8 de dano de medo.",
      "penaltyName": "Cegueira da Superioridade",
      "penaltyDesc": "O portador fica tão confiante na sua invulnerabilidade que ignora armadilhas e riscos ambientais, sofrendo desvantagem automática em testes de Percepção e Acrobacia."
    }
  },
  {
    "id": 35,
    "name": "Sombra Asfixiante",
    "slug": "sombra-asfixiante",
    "e1": "pavor",
    "e1Name": "O Pavor",
    "e2": "melancolia",
    "e2Name": "A Melancolia",
    "quote": "A névoa fria da depressão e do medo que retira o ar dos pulmões e sufoca a vontade de viver.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Cena (Área de 6m)",
      "roll": "Teste de Vigor dos Alvos",
      "effect": "Libera uma névoa espessa e escura que apaga qualquer fonte de luz comum e sufoca a área.",
      "enemy": "Inimigos na área sofrem -2 em testes de ataque e têm o alcance de seus ataques e rituais reduzidos pela metade."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas (Área de 9m)",
      "roll": "Teste de Vigor a cada rodada (CD base)",
      "extremePower": "O oxigênio e a temperatura da névoa caem a níveis letais. Inimigos na área sofrem 3d8 de dano de sufocamento/frio por rodada.",
      "enemy": "Inimigos que falharem no teste de Vigor começam a se asfixiar: ficam 'Lentos' e sofrem a condição 'Confuso' pela falta de ar no cérebro. Se passarem 2 rodadas dentro da névoa, caem Inconscientes.",
      "penaltyName": "Sufocamento Mútuo",
      "penaltyDesc": "O portador também tem seus pulmões resfriados pela névoa. Não pode correr e perde 1 PE no início de cada turno em que mantiver a Sombra Nível 2 ativa."
    }
  },
  {
    "id": 36,
    "name": "Olhar da Miséria",
    "slug": "olhar-da-miseria",
    "e1": "culpa",
    "e1Name": "A Culpa",
    "e2": "inveja",
    "e2Name": "A Inveja",
    "quote": "A transferência da própria desgraça; forçar o oponente a carregar todas as dores, ferimentos e penalidades do portador.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Instantânea (Alcance Curto - 9m)",
      "roll": "Teste de Vontade do Alvo",
      "effect": "O portador transfere uma condição negativa que esteja sofrendo (ex: Abalado, Lento, Envenenado) diretamente para o alvo.",
      "enemy": "O alvo recebe a condição transferida e sofre 2d6 de dano de ácido moral."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "Instantânea (Alcance Médio - 18m)",
      "roll": "Teste de Vontade do Alvo (CD base)",
      "extremePower": "O portador equaliza sua desgraça com o inimigo. Calcula a porcentagem de vida perdida do portador e aplica essa mesma porcentagem como dano direto de Dano Verdadeiro na criatura.",
      "enemy": "O alvo sofre todas as penalidades e ferimentos do portador por 2 rodadas e fica sob a condição 'Abalado' severo (-4 em todos os testes).",
      "penaltyName": "Eco do Ressentimento",
      "penaltyDesc": "Se o inimigo for bem-sucedido no teste de Vontade, o feitiço ricocheteia: o portador sofre 10 de dano mental e mantém todas as suas condições."
    }
  },
  {
    "id": 37,
    "name": "Mártir do Caos",
    "slug": "martir-do-caos",
    "e1": "culpa",
    "e1Name": "A Culpa",
    "e2": "desespero",
    "e2Name": "O Desespero",
    "quote": "A redenção pelo sacrifício explosivo; a determinação extrema de cair em batalha salvando todos os companheiros.",
    "level1": {
      "activation": "Reação (2 PE)",
      "durationRange": "Instantânea",
      "roll": "Ativação ao receber golpe letal",
      "effect": "Ao sofrer um ataque que o reduziria a 0 PV, o portador recusa-se a cair imediatamente e permanece de pé com 1 PV até o final da rodada.",
      "enemy": "Aliados a até 6m ganham +2 de Defesa Passiva inspirados pelo ato heroico do portador."
    },
    "level2": {
      "activation": "Reação (6 PE)",
      "durationRange": "Instantânea (Área de 9m)",
      "roll": "Ativação ao cair a 0 PV",
      "extremePower": "Ao sofrer dano que o derrubaria a 0 PV, o portador detona uma supernova de energia espiritual carmesim e dourada.",
      "enemy": "Todos os aliados a até 9m são curados em 4d10 de PV e recuperam 3 PE. Todos os inimigos na área sofrem 6d10 de Dano Verdadeiro pela explosão cataclísmica da culpa.",
      "penaltyName": "Coma do Sacrifício",
      "penaltyDesc": "O portador não morre instantaneamente, mas cai em estado de 'Coma Traumático' com 2 falhas automáticas de morte na ficha (precisa de atendimento médico urgente para não falecer)."
    }
  },
  {
    "id": 38,
    "name": "Inquisição Sagrada",
    "slug": "inquisicao-sagrada",
    "e1": "culpa",
    "e1Name": "A Culpa",
    "e2": "soberba",
    "e2Name": "A Soberba",
    "quote": "O tribunal da retidão absoluta; julgar e punir com autoridade inquestionável aqueles que causaram sofrimento.",
    "level1": {
      "activation": "Ação de Movimento (2 PE)",
      "durationRange": "Cena (Alcance Médio - 18m)",
      "roll": "Marcação de Alvo",
      "effect": "Marca um inimigo como 'Pecador'. Todos os ataques do portador contra o alvo marcado ignoram 5 pontos de RD.",
      "enemy": "Se o alvo marcado atacar qualquer aliado do portador, sofre 1d8 de Dano Verdadeiro imediatamente."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "3 Rodadas",
      "roll": "Julgamento Sumário do Tribunal",
      "extremePower": "O portador manifesta o martelo e a estaca do Inquisidor. Todo ataque contra o alvo marcado causa dano crítico com multiplicador aumentado em +1 e adiciona +3d10 de dano moral.",
      "enemy": "O alvo tem suas resistências elementais anuladas e fica impedido de recuperar vida ou usar habilidades de cura enquanto o julgamento durar.",
      "penaltyName": "Fanatismo Cego",
      "penaltyDesc": "O portador fica obcecado pela execução do réu. Não pode mudar de alvo até que o monstro marcado esteja morto, sofrendo -5 de Defesa contra ataques vindos de outros inimigos."
    }
  },
  {
    "id": 39,
    "name": "Cadeias do Luto",
    "slug": "cadeias-do-luto",
    "e1": "culpa",
    "e1Name": "A Culpa",
    "e2": "melancolia",
    "e2Name": "A Melancolia",
    "quote": "As correntes dos mortos; laços de ferro e lágrimas que prendem o monstro pelo peso das vidas que ele ceifou.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "2 Rodadas (Alcance Curto - 9m)",
      "roll": "Teste de Atletismo ou FOR do Alvo",
      "effect": "Correntes de ferro negro brotam do chão e agarram as pernas do inimigo. Causa 2d6 de dano de necrose.",
      "enemy": "O alvo fica sob a condição 'Agarrado' (deslocamento 0 e -2 na Defesa) e sofre 1d6 de dano por turno se tentar se mover."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas (Alcance Médio - 18m)",
      "roll": "Teste de Força vs Ocultismo do Portador",
      "extremePower": "Correntes colossais pesando toneladas de luto e remorso despencam do teto, esmagando o monstro contra o solo. Causa 4d8 de dano de esmagamento necrótico.",
      "enemy": "O monstro fica completamente 'Imobilizado/Preso' ao chão por 3 rodadas, sendo incapaz de voar, saltar ou usar deslocamento rápido. Cada rodada preso drena 2 PE ou 15 PV da criatura.",
      "penaltyName": "Fardo Compartilhado",
      "penaltyDesc": "As correntes estão ligadas à alma do portador. A cada rodada em que o monstro estiver preso, o portador tem seu próprio deslocamento reduzido pela metade pelo peso das almas."
    }
  },
  {
    "id": 40,
    "name": "Roubo Frenético",
    "slug": "roubo-frenetico",
    "e1": "inveja",
    "e1Name": "A Inveja",
    "e2": "desespero",
    "e2Name": "O Desespero",
    "quote": "O saque impulsivo de oportunidades; roubar turnos, movimentos e energia de quem fraqueja no combate.",
    "level1": {
      "activation": "Reação (2 PE)",
      "durationRange": "Instantânea",
      "roll": "Ativação quando um inimigo erra um ataque",
      "effect": "Quando um inimigo a até 6m falha em um teste de ataque, o portador rouba o ímpeto da ação, ganhando 1 Ação de Movimento imediata como Reação.",
      "enemy": "O inimigo que errou fica desequilibrado e sofre a condição 'Vulnerável' (-2 de Defesa) até o próximo turno dele."
    },
    "level2": {
      "activation": "Reação (5 PE)",
      "durationRange": "Instantânea",
      "roll": "Ativação quando um inimigo falha em teste de resistência",
      "extremePower": "O portador rouba a ação do oponente: ganha 1 Ação Padrão extra no seu próximo turno e restaura 3 PE.",
      "enemy": "O inimigo que teve a ação roubada perde sua próxima Ação Padrão no turno dele, ficando apenas com Ação de Movimento.",
      "penaltyName": "Instabilidade de Cleptomania",
      "penaltyDesc": "O excesso de adrenalina roubada sobrecarrega o sistema nervoso. No turno seguinte ao Roubo Frenético, o portador sofre tremores incontroláveis (-2 em todos os testes de perícia)."
    }
  },
  {
    "id": 41,
    "name": "Pretensão Absoluta",
    "slug": "pretensao-absoluta",
    "e1": "inveja",
    "e1Name": "A Inveja",
    "e2": "soberba",
    "e2Name": "A Soberba",
    "quote": "A recusa em aceitar que alguém seja melhor; anular a superioridade alheia e reivindicar para si o topo da cadeia.",
    "level1": {
      "activation": "Passiva (2 PE)",
      "durationRange": "Cena",
      "roll": "Reação a Críticos",
      "effect": "Sempre que um inimigo tirar um acerto crítico na cena, o portador cancela o crítico gastando 2 PE, transformando o golpe em um acerto comum.",
      "enemy": "O portador recebe +2 no próximo teste de ataque que realizar contra esse inimigo."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "3 Rodadas",
      "roll": "Quebra da Hierarquia",
      "extremePower": "O portador reivindica o status de predador supremo da cena. Todas as estatísticas do monstro (Defesa, Dano e Testes de Ataque) que forem superiores às do portador são reduzidas para se igualarem às do portador.",
      "enemy": "O monstro perde qualquer bônus de tamanho grande ou líder de matilha e sofre a condição 'Abalado' pela quebra do seu domínio.",
      "penaltyName": "Complexo de Impostor",
      "penaltyDesc": "A pressão mental de sustentar a pretensão racha a mente do agente. Se o monstro não for derrotado durante as 3 rodadas, o portador sofre um surto emocional automático (rolagem na tabela de Surtos d20)."
    }
  },
  {
    "id": 42,
    "name": "Cobiça Pútrida",
    "slug": "cobica-putrida",
    "e1": "inveja",
    "e1Name": "A Inveja",
    "e2": "melancolia",
    "e2Name": "A Melancolia",
    "quote": "A inveja corrosiva que prefere destruir e apodrecer o que não pode ter; envelhecer e quebrar os trunfos do oponente.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Cena (Alcance Curto - 9m)",
      "roll": "Teste de Vigor do Inimigo",
      "effect": "Lança uma névoa corrosiva cinzenta sobre uma arma ou membro de ataque do monstro. Causa 2d6 de dano de ácido.",
      "enemy": "O membro ou arma atacada sofre ferrugem/necrose rápida, reduzindo o dano desse ataque específico em -1 dado pelo restante da cena."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "Cena (Alcance Médio - 18m)",
      "roll": "Teste de Vigor do Inimigo (CD base)",
      "extremePower": "O portador apodrece todos os armamentos, garras e carapaças da criatura. Causa 4d8 de dano corrosivo contínuo.",
      "enemy": "Todas as armas e ataques naturais do monstro têm seus dados de dano reduzidos pela metade e o monstro perde 10 pontos de RD física permanentemente na cena.",
      "penaltyName": "Contaminação por Inveja",
      "penaltyDesc": "O cheiro de podridão afeta o próprio conjurador. Ele sofre enjoo violento, sendo incapaz de se alimentar, consumir poções ou receber cura por 2 rodadas."
    }
  },
  {
    "id": 43,
    "name": "Titã Indomável",
    "slug": "tita-indomavel",
    "e1": "desespero",
    "e1Name": "O Desespero",
    "e2": "soberba",
    "e2Name": "A Soberba",
    "quote": "A recusa monumental em aceitar a derrota; lutar com ferocidade titânica mesmo com o corpo despedaçado.",
    "level1": {
      "activation": "Reação (2 PE)",
      "durationRange": "1 Rodada",
      "roll": "Ativação ao chegar a 0 PV",
      "effect": "Ao invés de cair inconsciente, o portador permanece de pé por pura soberba, podendo realizar seu próximo turno normalmente com 0 PV.",
      "enemy": "Durante essa rodada, todos os seus ataques recebem +1d8 de dano de impacto heroico."
    },
    "level2": {
      "activation": "Reação (6 PE)",
      "durationRange": "3 Rodadas",
      "roll": "Modo Titânico Pós-Morte",
      "extremePower": "O portador torna-se imune à inconsciência e à morte durante 3 rodadas completas, mesmo sofrendo dano massivo além de 0 PV. Ganha tamanho Grande, +5 em testes de Força e seus ataques causam +3d10 de dano de impacto sísmico.",
      "enemy": "Inimigos atingidos são arremessados 9m contra paredes e estruturas, sofrendo dano de impacto dobrado.",
      "penaltyName": "A Conta do Destino",
      "penaltyDesc": "As leis da biologia cobram o preço acumulado. Ao término das 3 rodadas, todo o dano que o portador sofreu enquanto estava em 0 PV é somado; se o valor ultrapassar seu PV máximo negativo, ele morre instantaneamente sem testes de estabilização."
    }
  },
  {
    "id": 44,
    "name": "Lamento do Fim",
    "slug": "lamento-do-fim",
    "e1": "desespero",
    "e1Name": "O Desespero",
    "e2": "melancolia",
    "e2Name": "A Melancolia",
    "quote": "O choro cataclísmico que reverbera o Estrondo; uma onda de choque sonora e depressiva que devora a vontade de lutar.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Instantânea (Área de 6m)",
      "roll": "Teste de Vontade dos Inimigos",
      "effect": "Emite um lamento sônico fúnebre. Causa 2d8 de dano Trovejante/Frio em todos os inimigos ao redor.",
      "enemy": "Inimigos que falharem sofrem a condição 'Abalado' e têm seu deslocamento reduzido pela metade por 1 rodada."
    },
    "level2": {
      "activation": "Ação Padrão (6 PE)",
      "durationRange": "Instantânea (Área de 12m)",
      "roll": "Teste de Vigor e Vontade dos Inimigos",
      "extremePower": "Uma onda de choque sônica colossal estilhaça tímpanos, estruturas e almas em raio de 12m. Causa 6d8 de dano sônico/necrótico massivo.",
      "enemy": "Inimigos que falharem caem 'Incapacitados/Paralisados' por 1 rodada pelo colapso de tristeza e choque sônico. Mesmo com sucesso, ficam 'Surdos' e 'Lentos' por 3 rodadas.",
      "penaltyName": "Vazio nos Pulmões",
      "penaltyDesc": "A força do lamento colapsa os brônquios do portador. Ele cospe sangue, perde 10 PV e fica impossibilitado de falar ou conjurar rituais com voz por 2 rodadas."
    }
  },
  {
    "id": 45,
    "name": "Ruína Aristocrática",
    "slug": "ruina-aristocratica",
    "e1": "soberba",
    "e1Name": "A Soberba",
    "e2": "melancolia",
    "e2Name": "A Melancolia",
    "quote": "A decadência dos impérios caídos; o peso da glória passada que impõe envelhecimento e drena a autoridade dos monstros.",
    "level1": {
      "activation": "Ação Padrão (2 PE)",
      "durationRange": "Cena (Alcance Médio - 18m)",
      "roll": "Teste de Vontade do Líder Inimigo",
      "effect": "Aponta para o chefe ou criatura líder da cena. O alvo sofre o peso de séculos de ruína, perdendo 2 de Defesa Passiva.",
      "enemy": "Lacaios e criaturas menores ao redor do alvo perdem a coragem de defendê-lo, recusando-se a intervir em ataques direcionados ao chefe."
    },
    "level2": {
      "activation": "Ação Padrão (5 PE)",
      "durationRange": "3 Rodadas (Alcance Médio - 18m)",
      "roll": "Teste de Vontade vs Presença",
      "extremePower": "O portador manifesta o trono decaído da Ruína. A criatura mais poderosa da cena tem seu bônus de acerto reduzido em -5 e perde qualquer ação extra por rodada.",
      "enemy": "O monstro sofre 4d8 de dano de decomposição temporal por rodada e tem sua Resistência a Dano (RD) reduzida a zero.",
      "penaltyName": "Melancolia do Trono",
      "penaltyDesc": "O portador é invadido pela tristeza de todas as dinastias que pereceram. Sofre -3 em todos os testes de iniciativa e fica impossibilitado de usar a Ação de Corrida pelo restante do combate."
    }
  }
];
