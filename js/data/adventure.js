/**
 * PAROXISMO - SRD COMPENDIUM
 * Módulo da Aventura Introdutória: "O Despertar" (One-Shot Oficial)
 */

export const ADVENTURE_DATA = {
  title: "PAROXISMO: O Despertar",
  type: "Aventura Introdutória (One-Shot)",
  duration: "5 a 6 horas",
  recommendedLevel: "Nível 1 (Pessoas Comuns Despertas)",
  players: "3 a 5 agentes",
  summary: "Esta aventura serve como introdução visceral ao mundo de Paroxismo, levando os agentes — inicialmente pessoas comuns do cotidiano — a investigarem e sobreviverem a uma estação de metrô selada e corrompida desde o primeiro momento do Estrondo.",
  acts: [
    {
      act: "Ato I",
      title: "Prólogo & O Incidente (~1h)",
      location: "Último Vagão do Metrô — Linha Mais Profunda da Metrópole",
      sections: [
        {
          heading: "1. Vidas Cotidianas",
          content: "Madrugada fria e chuvosa. Os personagens dos jogadores iniciam como pessoas comuns vivendo suas rotinas exaustivas (estudantes, enfermeiros, eletricistas, seguranças, motoboys). Eles dividem o mesmo último vagão na linha mais profunda do metrô metropolitano."
        },
        {
          heading: "2. O Estrondo & A Ruptura da Realidade",
          content: "Sem aviso, um estrondo ensurdecedor — como o estalo de um tecido cósmico se rompendo com violência — ecoa por toda a cidade. O trem descarrila violentamente a 40 metros de profundidade, colidindo contra os túneis abandonados da mítica 'Estação Terminal 0'. As luzes morrem e a escuridão se torna absoluta."
        },
        {
          heading: "3. O Despertar das Emoções",
          content: "Entre os escombros e os gemidos dos passageiros feridos, as sombras dos mortos começam a se contorcer e a se alimentar do pânico. Nesse instante de choque mortal, as 2 Emoções Latentes escolhidas por cada jogador despertam com força total: suas Armas Manifestadas materializam-se em suas mãos e seus primeiros poderes emocionais entram em ignição."
        }
      ]
    },
    {
      act: "Ato II",
      title: "A Estação 0 — Confinamento Hexatomb (~2h30m)",
      location: "Complexo Militar Subterrâneo Brutalista dos Anos 50",
      sections: [
        {
          heading: "O Objetivo Central",
          content: "A única rota de fuga para a superfície é um Elevador de Carga Industrial de alta tonelagem. Porém, o gerador mestre está desarmado e exige a ativação de 3 disjuntores mestres distribuídos em três setores selados e temáticos:"
        },
        {
          heading: "Setor 1 — Pátio dos Vagões Fantasma (Elemento: O Pavor)",
          content: "Um cemitério de carcaças de trens retorcidos mergulhados em névoa negra. Sombras esguias caçam pelo menor som de respiração e passos no chão. Os agentes devem usar testes de Furtividade e Acrobacia para contornar armadilhas e reativar o primeiro disjuntor sem atrair o bando de espectros."
        },
        {
          heading: "Setor 2 — Galeria de Quarentena (Elemento: O Vazio)",
          content: "Celas de concreto maciço onde a própria física parece desbotada: todo som e luz são absorvidos por fissuras cinzentas. Aqui, os agentes enfrentam um Rastejador do Vazio (VD 40) e precisam resolver um enigma de ressonância de frequência sonora para sincronizar o disjuntor de energia."
        },
        {
          heading: "Setor 3 — Usina de Caldeiras (Elemento: O Rancor)",
          content: "Uma fornalha industrial subterrânea em chamas. Tubulações de vapor fervente e brasas soltas criam um ambiente hostil. Espectros do Rancor (VD 20) atacam em ondas com retaliação de fogo. Os agentes precisam cortar o fluxo de gás inflamável e acionar a alavanca mestre."
        }
      ]
    },
    {
      act: "Ato III",
      title: "O Confronto Final & O Mímico da Cobiça (~1h30m)",
      location: "Plataforma Central do Poço do Elevador",
      sections: [
        {
          heading: "O Confronto com o Chefe do Subsolo",
          content: "Ao religarem os três disjuntores e retornarem ao poço do elevador, a passagem é bloqueada por uma massa colossal de metal retorcido e sombras esmeralda: O Mímico da Cobiça (VD 60). A criatura mimetiza as formas e rituais mais poderosos dos jogadores."
        },
        {
          heading: "Dinâmica do Combate",
          content: "Os jogadores devem identificar sua fraqueza investigativa (focar fontes de luz ultravioleta e holofotes para cegar os múltiplos olhos do monstro) e usar suas vantagens elementais para destruir o Mímico antes que o poço colapse por completo."
        }
      ]
    },
    {
      act: "Epílogo",
      title: "O Despertar do Titã (~30m)",
      location: "Superfície da Metrópole em Ruínas",
      sections: [
        {
          heading: "A Subida Veloz",
          content: "Com o Mímico destruído, o grupo aciona o elevador de carga industrial, que sobe velozmente enquanto o complexo subterrâneo da Estação 0 desmorona sob toneladas de entulho."
        },
        {
          heading: "A Revelação Apocalíptica",
          content: "Ao alcançarem os portões da superfície, a luz solar foi substituída por um céu avermelhado carregado de cinzas. Os prédios do centro financeiro estão em ruínas. No horizonte, entre os arranha-céus colapsados, ergue-se a silhueta colossal e titânica de A AMBIÇÃO, estendendo fios de ouro por toda a cidade e marcando o início da campanha principal."
        },
        {
          heading: "Evolução dos Personagens",
          content: "Os sobreviventes avançam imediatamente para o Nível 2 (Paroxismo 10%), recebendo novos PV, PE e habilidades de classe, consagrando-se como os primeiros Agentes Despertos da resistência."
        }
      ]
    }
  ]
};
