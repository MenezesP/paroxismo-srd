/**
 * PAROXISMO - SRD COMPENDIUM
 * Módulo de Perícias e Origens — Atlas de Conhecimentos
 */

export const SKILLS_DATA = [
  // ============================================================
  // 1. COMBATE — A ARTE DA VIOLÊNCIA DIRIGIDA
  // ============================================================
  {
    id: "luta",
    name: "Luta",
    attr: "FOR",
    category: "Combate",
    code: "REF: CBT-01",
    desc: "A maestria no confronto corpo a corpo direto, seja com punhos cerrados, armas brancas de lâmina curta ou impacto pesado e manobras corporais.",
    commonUses: [
      "Desferir ataques com armas brancas corpo a corpo (facas, machados, espadas, bastões)",
      "Executar manobras de agarrar, derrubar, empurrar ou desarmar oponentes",
      "Manter um alvo imobilizado no chão sob controle físico",
      "Executar a reação ativa de Contra-Ataque após aparar um golpe"
    ],
    examples: [
      { cd: "15", desc: "Desarmar um cultista armado com uma faca ritualística antes que ele atinja um refém." },
      { cd: "20", desc: "Derrubar e imobilizar uma aberração bípede média em terreno enlameado." },
      { cd: "25", desc: "Quebrar a postura de um monstro encouraçado com um golpe devastador na articulação." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <circle cx="40" cy="40" r="36" stroke="#262c3a" stroke-width="1.5" stroke-dasharray="3 3"/>
      <path d="M22 58 L58 22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M22 22 L58 58" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="58,16 64,22 58,28 52,22" fill="currentColor"/>
      <polygon points="16,58 22,64 28,58 22,52" fill="currentColor"/>
      <circle cx="40" cy="40" r="6" fill="#08090d" stroke="#cbd0dc" stroke-width="2"/>
      <line x1="40" y1="20" x2="40" y2="28" stroke="#8e95a5" stroke-width="1.5"/>
      <line x1="40" y1="52" x2="40" y2="60" stroke="#8e95a5" stroke-width="1.5"/>
      <line x1="20" y1="40" x2="28" y2="40" stroke="#8e95a5" stroke-width="1.5"/>
      <line x1="52" y1="40" x2="60" y2="40" stroke="#8e95a5" stroke-width="1.5"/>
    </svg>`
  },
  {
    id: "pontaria",
    name: "Pontaria",
    attr: "AGI",
    category: "Combate",
    code: "REF: CBT-02",
    desc: "A precisão balística e a capacidade de calcular trajetórias sob estresse extremo, operando pistolas, revólveres, fuzis e projéteis arremessados.",
    commonUses: [
      "Disparar armas de fogo de curto, médio e longo alcance",
      "Arremessar facas de combate, frascos incendiários ou explosivos táticos",
      "Realizar tiros visados em órgãos vulneráveis ou pontos de contenção",
      "Fogo de cobertura para suprimir inimigos atrás de trincheiras"
    ],
    examples: [
      { cd: "15", desc: "Acertar o pneu de um furgão em fuga a 30 metros sob chuva torrencial." },
      { cd: "20", desc: "Atingir o olho exposto de uma quimera aberrante em movimento rápido." },
      { cd: "25", desc: "Desferir um tiro perfeito através do vão de uma porta blindada semiaberta." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <circle cx="40" cy="40" r="32" stroke="#262c3a" stroke-width="1.5"/>
      <circle cx="40" cy="40" r="20" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 2"/>
      <circle cx="40" cy="40" r="6" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="40" y1="4" x2="40" y2="76" stroke="currentColor" stroke-width="1.5"/>
      <line x1="4" y1="40" x2="76" y2="40" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="40" cy="40" r="2" fill="#e21b23"/>
      <path d="M26 26 L22 22 M54 26 L58 22 M26 54 L22 58 M54 54 L58 58" stroke="#8e95a5" stroke-width="1.5"/>
    </svg>`
  },

  // ============================================================
  // 2. INVESTIGAÇÃO — FORENSE, CIÊNCIA & DEDUÇÃO
  // ============================================================
  {
    id: "investigacao",
    name: "Investigação",
    attr: "INT",
    category: "Investigação",
    code: "REF: INV-01",
    desc: "A capacidade de vasculhar minuciosamente ambientes caóticos, conectar indícios fragmentados, desvendar cifras e reconstruir fatos através de evidências materiais.",
    commonUses: [
      "Processar cenas de crime e rituais em busca de vestígios microscópicos",
      "Decifrar diários criptografados, memorandos rasgados e relatórios corrompidos",
      "Localizar cofres ocultos, alçapões camuflados e paredes falsas",
      "Reconstruir a cronologia exata de um homicídio ou colapso dimensional"
    ],
    examples: [
      { cd: "15", desc: "Encontrar o compartimento secreto sob a escrivaninha de um diplomata assassinado." },
      { cd: "20", desc: "Decifrar o código alfanumérico que tranca o cofre de contenção de relíquias." },
      { cd: "25", desc: "Descobrir a identidade do traidor cruzando 40 páginas de registros financeiros forjados." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <circle cx="34" cy="34" r="22" stroke="currentColor" stroke-width="2"/>
      <circle cx="34" cy="34" r="14" stroke="#262c3a" stroke-width="1.5" stroke-dasharray="2 2"/>
      <line x1="50" y1="50" x2="72" y2="72" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <line x1="58" y1="58" x2="68" y2="68" stroke="#ffffff" stroke-width="1.5"/>
      <path d="M26 34 Q34 26 42 34" stroke="#8e95a5" stroke-width="1.5"/>
      <circle cx="34" cy="34" r="3" fill="#e21b23"/>
    </svg>`
  },
  {
    id: "percepcao",
    name: "Percepção",
    attr: "PRE",
    category: "Investigação",
    code: "REF: INV-02",
    desc: "A acuidade dos cinco sentidos somada à atenção instintiva, permitindo notar perigos iminentes, cheiros anômalos, sussurros e alterações mínimas no ambiente.",
    commonUses: [
      "Detectar emboscadas, silhuetas camufladas e predadores à espreita",
      "Ouvir conversas abafadas do outro lado de uma parede ou passos no teto",
      "Notar cheiro de ozônio, decomposição ou enxofre indicando anomalias",
      "Detectar microexpressões faciais que revelam pânico ou fingimento"
    ],
    examples: [
      { cd: "15", desc: "Ouvir o gotejar de sangue do teto antes de pisar sob a criatura camuflada." },
      { cd: "20", desc: "Notar o tremor quase invisível no gatilho do suspeito antes do primeiro disparo." },
      { cd: "25", desc: "Enxergar a anomalia óptica ondulante na escuridão total a 25 metros." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <path d="M8 40 Q40 10 72 40 Q40 70 8 40 Z" stroke="currentColor" stroke-width="2" fill="#08090d"/>
      <circle cx="40" cy="40" r="14" stroke="#8e95a5" stroke-width="1.5"/>
      <circle cx="40" cy="40" r="7" fill="currentColor"/>
      <circle cx="43" cy="37" r="2" fill="#ffffff"/>
      <line x1="40" y1="18" x2="40" y2="12" stroke="#cbd0dc" stroke-width="1.5"/>
      <line x1="40" y1="62" x2="40" y2="68" stroke="#cbd0dc" stroke-width="1.5"/>
    </svg>`
  },
  {
    id: "medicina",
    name: "Medicina",
    attr: "INT",
    category: "Investigação",
    code: "REF: INV-03",
    desc: "O conhecimento clínico, anatômico e cirúrgico indispensável para manter operacionais vivos, diagnosticar infecções orgânicas e conduzir necropsias forenses.",
    commonUses: [
      "Estabilizar agentes caídos com 0 Pontos de Vida (estancamento de hemorragias)",
      "Curar ferimentos graves utilizando kits de trauma entre cenas de combate",
      "Realizar necropsias em cadáveres mundanos ou espécimes do Avesso",
      "Identificar venenos, toxinas biológicas e patógenos parasitários"
    ],
    examples: [
      { cd: "15", desc: "Estabilizar um companheiro à beira da morte em meio a um tiroteio." },
      { cd: "20", desc: "Extrair um parasita do Avesso alojado no tórax sem perfurar o pulmão." },
      { cd: "25", desc: "Sintetizar o antídoto correto para uma neurotoxina desconhecida em 10 minutos." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <circle cx="40" cy="40" r="32" stroke="#262c3a" stroke-width="1.5"/>
      <rect x="33" y="16" width="14" height="48" fill="currentColor" rx="2"/>
      <rect x="16" y="33" width="48" height="14" fill="currentColor" rx="2"/>
      <path d="M40 22 L40 58 M22 40 L58 40" stroke="#08090d" stroke-width="2"/>
      <circle cx="40" cy="40" r="4" fill="#ffffff"/>
    </svg>`
  },
  {
    id: "tecnologia",
    name: "Tecnologia",
    attr: "INT",
    category: "Investigação",
    code: "REF: INV-04",
    desc: "A habilidade técnica de interagir com infraestrutura digital e eletromecânica: invasão de redes, bypass de travas magnéticas, reprogramação e recuperação de dados.",
    commonUses: [
      "Invadir redes de segurança, desligar câmeras e travar portas blindadas",
      "Recuperar arquivos deletados ou corrompidos em servidores industriais",
      "Operar equipamentos especializados de campo (detectores EMF, drones, sensores térmicos)",
      "Desarmar bombas cronometradas e dispositivos eletrônicos de detonação"
    ],
    examples: [
      { cd: "15", desc: "Desativar o alarme silencioso de um laboratório farmacêutico clandestino." },
      { cd: "20", desc: "Burlar o firewall de uma corporação de biotecnologia antes do rastreio." },
      { cd: "25", desc: "Reprogramar o sistema de refrigeração de uma câmara de contenção em colapso." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <rect x="16" y="18" width="48" height="34" rx="3" stroke="currentColor" stroke-width="2" fill="#08090d"/>
      <line x1="28" y1="52" x2="20" y2="66" stroke="currentColor" stroke-width="2"/>
      <line x1="52" y1="52" x2="60" y2="66" stroke="currentColor" stroke-width="2"/>
      <line x1="16" y1="66" x2="64" y2="66" stroke="currentColor" stroke-width="2"/>
      <path d="M26 30 L34 35 L26 40" stroke="#8e95a5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="38" y1="40" x2="48" y2="40" stroke="#e21b23" stroke-width="2"/>
    </svg>`
  },
  {
    id: "ciencias",
    name: "Ciências",
    attr: "INT",
    category: "Investigação",
    code: "REF: INV-05",
    desc: "O domínio rigoroso dos pilares científicos mundanos: química, física, biologia celular e geologia, permitindo analisar amostras e prever fenômenos naturais.",
    commonUses: [
      "Identificar compostos químicos industriais, ácidos e combustíveis voláteis",
      "Analisar amostras de sangue mutado e determinar sua linhagem biológica",
      "Calcular a estabilidade estrutural de prédios em ruínas ou pontes danificadas",
      "Sintetizar solventes para abrir fechaduras químicas ou dissolver tecidos aberrantes"
    ],
    examples: [
      { cd: "15", desc: "Descobrir qual agente químico foi utilizado para acelerar a queima de um galpão." },
      { cd: "20", desc: "Determinar a composição da carapaça de um monstro para identificar vulnerabilidades físicas." },
      { cd: "25", desc: "Criar uma reação endotérmica de emergência para congelar uma gosma viva." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <path d="M34 14 L46 14 M40 14 L40 32 L20 62 C16 68 20 72 28 72 L52 72 C60 72 64 68 60 62 L40 32" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <line x1="26" y1="54" x2="54" y2="54" stroke="#8e95a5" stroke-width="1.5" stroke-dasharray="3 2"/>
      <circle cx="36" cy="62" r="3" fill="#e21b23"/>
      <circle cx="45" cy="58" r="2" fill="#e21b23"/>
      <circle cx="32" cy="46" r="1.5" fill="#ffffff"/>
    </svg>`
  },

  // ============================================================
  // 3. SOCIAL — PSICOLOGIA, COAÇÃO & DIPLOMACIA
  // ============================================================
  {
    id: "diplomacia",
    name: "Diplomacia",
    attr: "PRE",
    category: "Social",
    code: "REF: SOC-01",
    desc: "A arte do diálogo, etiqueta e persuasão lógica. Constrói acordos entre facções antagônicas, apazigua civis em pânico e assegura suporte oficial.",
    commonUses: [
      "Persuadir testemunhas hesitantes a prestar depoimento oficial",
      "Negociar tréguas temporárias com corporações ou autoridades policiais",
      "Acalmar multidões enfurecidas ou desesperadas diante de anomalias",
      "Obter acesso legal a zonas de quarentena militarizadas sem conflito"
    ],
    examples: [
      { cd: "15", desc: "Convencer o capitão da polícia a isolar o quarteirão sem acionar a imprensa." },
      { cd: "20", desc: "Fazer um culto fanático libertar reféns civis durante negociação de crise." },
      { cd: "25", desc: "Firmar um pacto de cooperação mútua entre duas facções criminosas rivais." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <circle cx="40" cy="40" r="32" stroke="#262c3a" stroke-width="1.5"/>
      <path d="M22 46 L32 36 L40 44 L58 26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="22" cy="46" r="3" fill="#ffffff"/>
      <circle cx="58" cy="26" r="3" fill="#e21b23"/>
      <path d="M26 60 Q40 52 54 60" stroke="#8e95a5" stroke-width="1.5"/>
    </svg>`
  },
  {
    id: "enganacao",
    name: "Enganação",
    attr: "PRE",
    category: "Social",
    code: "REF: SOC-02",
    desc: "A manipulação das aparências e da verdade: fabricar mentiras verossímeis, encenar papéis falsos, forjar crachás de acesso e blefar sob suspeita.",
    commonUses: [
      "Mentir com naturalidade impassível durante interrogatórios severos",
      "Adotar disfarces completos e imitar o linguajar de seguranças ou cientistas",
      "Criar distrações verbais para desviar a atenção de sentinelas",
      "Falsificar assinaturas, mandados de busca e crachás biométricos"
    ],
    examples: [
      { cd: "15", desc: "Passar pela guarita de um prédio comercial usando um crachá de faxineiro falso." },
      { cd: "20", desc: "Enganar um detetive experiente durante um interrogatório formal de 2 horas." },
      { cd: "25", desc: "Convencer o líder de uma seita de que você é o emissário prometido do Avesso." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <path d="M24 20 Q40 10 56 20 Q64 48 40 70 Q16 48 24 20 Z" stroke="currentColor" stroke-width="2" fill="#08090d"/>
      <path d="M30 32 L38 36 M50 32 L42 36" stroke="#ffffff" stroke-width="2"/>
      <path d="M30 52 Q40 44 50 52" stroke="#e21b23" stroke-width="2"/>
      <line x1="40" y1="20" x2="40" y2="70" stroke="#262c3a" stroke-width="1.5" stroke-dasharray="2 2"/>
    </svg>`
  },
  {
    id: "intimidacao",
    name: "Intimidação",
    attr: "FOR / PRE",
    category: "Social",
    code: "REF: SOC-03",
    desc: "A imposição de autoridade através do terror: seja por presença física esmagadora, ameaças calculadas de tortura ou frieza psicológica aterradora.",
    commonUses: [
      "Forçar suspeitos reticentes a confessar esconderijos e códigos",
      "Fazer soldados inimigos hesitarem ou debandarem de suas posições",
      "Impor silêncio absoluto em ambientes hostis por pura dominação moral",
      "Coagir informantes relutantes a cooperar sob promessa de destruição"
    ],
    examples: [
      { cd: "15", desc: "Fazer um capanga de rua entregar o endereço da fábrica clandestina em segundos." },
      { cd: "20", desc: "Quebrar a resistência de um assassino profissional sem desferir um único soco." },
      { cd: "25", desc: "Forçar um grupo de saqueadores armados a largarem suas armas e fugirem." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <circle cx="40" cy="36" r="20" stroke="currentColor" stroke-width="2" fill="#08090d"/>
      <path d="M28 32 L34 36 M52 32 L46 36" stroke="#e21b23" stroke-width="2.5"/>
      <path d="M32 46 Q40 40 48 46" stroke="#ffffff" stroke-width="2"/>
      <path d="M22 56 L12 72 M58 56 L68 72" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <line x1="40" y1="12" x2="40" y2="4" stroke="#8e95a5" stroke-width="2"/>
    </svg>`
  },
  {
    id: "intuicao",
    name: "Intuição",
    attr: "PRE",
    category: "Social",
    code: "REF: SOC-04",
    desc: "O sexto sentido interpessoal: leitura da respiração, tensão nos ombros e desvios de olhar que delatam mentiras, segundas intenções e ciladas iminentes.",
    commonUses: [
      "Sentir quando um NPC está omitindo fatos cruciais ou mentindo descaradamente",
      "Pressentir que uma proposta amigável esconde uma emboscada letal",
      "Avaliar a sanidade e o equilíbrio emocional de um sobrevivente traumatizado",
      "Identificar quem é a verdadeira autoridade oculta dentro de um grupo estranho"
    ],
    examples: [
      { cd: "15", desc: "Perceber que o cientista está apontando a saída errada de propósito." },
      { cd: "20", desc: "Descobrir qual dos três guardas foi subornado pelo culto do Avesso." },
      { cd: "25", desc: "Discernir a entidade metamórfica oculta sob o rosto de um aliado querido." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <circle cx="40" cy="40" r="10" stroke="currentColor" stroke-width="2"/>
      <circle cx="40" cy="40" r="3" fill="#e21b23"/>
      <path d="M22 28 Q40 16 58 28" stroke="#8e95a5" stroke-width="1.5" stroke-dasharray="3 3"/>
      <path d="M16 20 Q40 4 64 20" stroke="#262c3a" stroke-width="1.5"/>
      <path d="M22 52 Q40 64 58 52" stroke="#8e95a5" stroke-width="1.5" stroke-dasharray="3 3"/>
      <line x1="40" y1="18" x2="40" y2="8" stroke="currentColor" stroke-width="2"/>
    </svg>`
  },
  {
    id: "adestramento",
    name: "Adestramento",
    attr: "PRE",
    category: "Social",
    code: "REF: SOC-05",
    desc: "A comunicação não verbal e comando de animais: acalmar bestas assustadas pelo Estrondo, comandar cães táticos de faro e subjugar predadores selvagens.",
    commonUses: [
      "Acalmar cães de guarda agressivos para passar despercebido por cercas",
      "Comandar cães farejadores em buscas por drogas, pólvora ou sobreviventes",
      "Controlar cavalos ou animais de transporte em estradas devastadas",
      "Fazer um predador ferido recuar para a floresta sem precisar abatê-lo"
    ],
    examples: [
      { cd: "15", desc: "Impedir que dois rottweilers de segurança latam ao avistar seu esquadrão." },
      { cd: "20", desc: "Fazer um cão policial rastrear o cheiro de um cultista após 12 horas de chuva." },
      { cd: "25", desc: "Domar temporariamente uma fera mundana enlouquecida pela proximidade do Avesso." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <path d="M24 56 L34 26 L48 26 L58 56 Z" stroke="currentColor" stroke-width="2" fill="#08090d"/>
      <polygon points="30,26 22,14 36,20" fill="currentColor"/>
      <polygon points="52,26 60,14 46,20" fill="currentColor"/>
      <circle cx="36" cy="38" r="2.5" fill="#e21b23"/>
      <circle cx="46" cy="38" r="2.5" fill="#e21b23"/>
      <polygon points="41,46 39,49 43,49" fill="#ffffff"/>
      <path d="M20 66 C30 60 52 60 62 66" stroke="#8e95a5" stroke-width="2"/>
    </svg>`
  },

  // ============================================================
  // 4. FÍSICA — MOTRICIDADE & CINÉTICA OPERACIONAL
  // ============================================================
  {
    id: "acrobacia",
    name: "Acrobacia",
    attr: "AGI",
    category: "Física",
    code: "REF: FIS-01",
    desc: "A coordenação motora, flexibilidade e reflexo cinético. Permite amortecer quedas letais, equilibrar-se sobre vigas estreitas e executar a Reação de Esquiva.",
    commonUses: [
      "Executar a reação ativa de Esquiva em combate (adicionando bônus na Defesa)",
      "Amortecer o impacto de quedas de grandes alturas com rolamentos",
      "Equilibrar-se em cordas, beirais de prédios e superfícies congeladas",
      "Contorcer-se para escapar de amarras de corda, correntes ou algemas"
    ],
    examples: [
      { cd: "15", desc: "Saltar de um telhado de 6 metros de altura rolando para anular o dano de queda." },
      { cd: "20", desc: "Correr sobre uma viga de metal enferrujada durante um tiroteio no galpão." },
      { cd: "25", desc: "Desvencilhar-se de algemas de aço cirúrgico deslocando o polegar sem hesitar." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <circle cx="40" cy="22" r="7" stroke="currentColor" stroke-width="2"/>
      <path d="M22 34 Q40 40 58 34" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M40 29 L40 50 L26 68 M40 50 L54 68" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M16 68 Q40 58 64 68" stroke="#8e95a5" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle cx="40" cy="22" r="2" fill="#e21b23"/>
    </svg>`
  },
  {
    id: "atletismo",
    name: "Atletismo",
    attr: "FOR",
    category: "Física",
    code: "REF: FIS-02",
    desc: "A potência muscular e a resistência física pura: arrombar barreiras sólidas, correr sprints prolongados, escalar paredões e nadar contra torrentes violentas.",
    commonUses: [
      "Arrombar portas de madeira maciça, portões de ferro ou grades emperradas",
      "Escalar muros de tijolos, encostas rochosas e cabos de aço",
      "Nadar através de rios turbulentos ou esgotos subterrâneos inundados",
      "Carregar companheiros inconscientes nos ombros em velocidade máxima"
    ],
    examples: [
      { cd: "15", desc: "Derrubar uma porta trancada de madeira com um ombro certeiro em 1 segundo." },
      { cd: "20", desc: "Escalar a fachada de um prédio de 4 andares sem cordas ou equipamentos." },
      { cd: "25", desc: "Segurar uma viga de concreto desabando tempo suficiente para o esquadrão fugir." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <path d="M20 68 L32 42 L46 48 L60 16" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="60,12 66,20 54,20" fill="currentColor"/>
      <line x1="16" y1="68" x2="68" y2="68" stroke="#262c3a" stroke-width="2"/>
      <circle cx="46" cy="48" r="4" fill="#e21b23"/>
      <path d="M28 28 L40 18 L52 28" stroke="#8e95a5" stroke-width="1.5" stroke-dasharray="2 2"/>
    </svg>`
  },
  {
    id: "furtividade",
    name: "Furtividade",
    attr: "AGI",
    category: "Física",
    code: "REF: FIS-03",
    desc: "O domínio da invisibilidade urbana e ambiental: passos mudos, camuflagem na escuridão, dissolução no cenário e execução de ataques de emboscada.",
    commonUses: [
      "Mover-se sem emitir nenhum som sobre vidros quebrados ou cascalho",
      "Esconder-se em sombras, dutos de ar, arbustos e cantos cegos",
      "Seguir alvos em áreas públicas ou corredores fechados sem levantar suspeitas",
      "Desferir Ataques Furtivos letais contra criaturas ou guardas desprevenidos"
    ],
    examples: [
      { cd: "15", desc: "Passar por trás de uma dupla de guardas sonolentos em um corredor iluminado." },
      { cd: "20", desc: "Infiltrar-se na mansão do culto através do jardim vigiado por holofotes móveis." },
      { cd: "25", desc: "Desaparecer diante dos olhos de uma criatura ao jogar uma granada de fumaça." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <path d="M18 56 Q40 24 62 56" stroke="currentColor" stroke-width="2" fill="#08090d"/>
      <path d="M26 44 Q40 34 54 44" stroke="#8e95a5" stroke-width="1.5"/>
      <circle cx="34" cy="42" r="2" fill="#e21b23"/>
      <circle cx="46" cy="42" r="2" fill="#e21b23"/>
      <path d="M12 68 Q40 64 68 68" stroke="#262c3a" stroke-width="2"/>
      <line x1="40" y1="12" x2="40" y2="24" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
    </svg>`
  },
  {
    id: "pilotagem",
    name: "Pilotagem",
    attr: "AGI",
    category: "Física",
    code: "REF: FIS-04",
    desc: "A destreza na condução extrema de máquinas motorizadas: carros de interceptação tática, motocicletas de alta velocidade, helicópteros e embarcações pesadas.",
    commonUses: [
      "Conduzir veículos em perseguições perigosas em alta velocidade pelo trânsito",
      "Executar manobras evasivas como cavalo-de-pau, frenagens e batidas controladas",
      "Manter o controle de veículos com pneus furados ou sob fogo cruzado",
      "Pilotar lanchas rápidas ou veículos blindados em terrenos acidentados"
    ],
    examples: [
      { cd: "15", desc: "Ultrapassar um bloqueio policial pela contramão em uma avenida movimentada." },
      { cd: "20", desc: "Executar um drift perfeito para encurralar o blindado inimigo contra um poste." },
      { cd: "25", desc: "Aterrisar um helicóptero com rotor de cauda danificado sobre um heliporto no meio de um temporal." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <circle cx="40" cy="40" r="30" stroke="currentColor" stroke-width="2"/>
      <circle cx="40" cy="40" r="10" stroke="#8e95a5" stroke-width="2" fill="#08090d"/>
      <line x1="40" y1="10" x2="40" y2="30" stroke="currentColor" stroke-width="3"/>
      <line x1="14" y1="52" x2="33" y2="45" stroke="currentColor" stroke-width="3"/>
      <line x1="66" y1="52" x2="47" y2="45" stroke="currentColor" stroke-width="3"/>
      <circle cx="40" cy="40" r="3" fill="#e21b23"/>
    </svg>`
  },

  // ============================================================
  // 5. PARANORMAL — O VÉU, O MEDO & O AVESSO
  // ============================================================
  {
    id: "ocultismo",
    name: "Ocultismo",
    attr: "INT / PRE",
    category: "Paranormal",
    code: "REF: PAR-01",
    desc: "A compreensão teórica e prática das leis anômalas do Avesso: as 10 Emoções Cósmicas, os círculos de rituais, selos de contenção e identificação de relíquias.",
    commonUses: [
      "Conjurar rituais místicos do 1º ao 4º Círculo consumindo Pontos de Esforço",
      "Decifrar inscrições antigas, pergaminhos heréticos e círculos de invocação",
      "Identificar as fraquezas emocionais e imunidades de monstros do Avesso",
      "Desenhar selos protetores para impedir a travessia de entidades através de portais"
    ],
    examples: [
      { cd: "15", desc: "Identificar qual Emoção Primária alimentou a criatura que chacinou a sala." },
      { cd: "20", desc: "Desativar um círculo ritual de sangue ativo antes que a criatura se materialize." },
      { cd: "25", desc: "Compreender a funcionalidade de uma Relíquia Maior sem ser corrompido instantaneamente." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <circle cx="40" cy="40" r="32" stroke="currentColor" stroke-width="1.5"/>
      <polygon points="40,12 48,28 66,32 52,44 56,62 40,52 24,62 28,44 14,32 32,28" stroke="currentColor" stroke-width="1.5" fill="#08090d"/>
      <circle cx="40" cy="40" r="8" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="40" cy="40" r="3" fill="#e21b23"/>
      <line x1="40" y1="4" x2="40" y2="12" stroke="#8e95a5" stroke-width="1.5"/>
      <line x1="40" y1="68" x2="40" y2="76" stroke="#8e95a5" stroke-width="1.5"/>
    </svg>`
  },
  {
    id: "vontade",
    name: "Vontade",
    attr: "PRE / INT",
    category: "Paranormal",
    code: "REF: PAR-02",
    desc: "A fortaleza mental inquebrável da consciência humana: resistência ao pânico sobrenatural, rejeição de alucinações místicas e sobrevivência à Presença Perturbadora.",
    commonUses: [
      "Resistir ao teste de Medo/Terror imposto pela Presença Perturbadora de aberrações",
      "Manter o autocontrole e evitar condições de Abalado, Apavorado ou Fascinado",
      "Resistir a rituais de manipulação mental, paralisia psíquica e possessão",
      "Superar dores físicas lancinantes para continuar agindo no turno"
    ],
    examples: [
      { cd: "15", desc: "Não congelar de pavor ao testemunhar a manifestação da forma colossal de um monstro." },
      { cd: "20", desc: "Expulsar a voz sussurrada de uma entidade que tenta controlar seus movimentos." },
      { cd: "25", desc: "Olhar diretamente no olho de um Titã do Avesso e manter a mente lúcida e combativa." }
    ],
    svgIllustration: `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" class="w-full h-full text-[#e21b23]">
      <path d="M40 12 L64 24 L64 48 Q40 72 40 72 Q40 72 16 48 L16 24 Z" stroke="currentColor" stroke-width="2" fill="#08090d"/>
      <path d="M40 22 L40 60" stroke="#e21b23" stroke-width="2"/>
      <circle cx="40" cy="38" r="8" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="40" cy="38" r="3" fill="#e21b23"/>
      <line x1="26" y1="38" x2="54" y2="38" stroke="#8e95a5" stroke-width="1.5"/>
    </svg>`
  }
];

export const ORIGINS_DATA = [
  {
    id: "forca-lei",
    name: "Força da Lei",
    code: "ORIGEM #01",
    tagline: "Protocolo & Resposta Armada",
    desc: "Policial militar, detetive civil, segurança privado ou militar de choque acostumado a protocolos de contenção armada e respostas rápidas sob fogo cruzado.",
    skills: ["Pontaria", "Percepção"],
    power: {
      name: "Prontidão Operacional",
      desc: "Você recebe +2 em Iniciativa e +2 na Defesa Passiva durante a 1ª rodada de qualquer combate."
    }
  },
  {
    id: "socorrista",
    name: "Socorrista",
    code: "ORIGEM #02",
    tagline: "Trauma Clínico & Triagem de Sangue",
    desc: "Médico de pronto-socorro, enfermeiro de UTI, paramédico ou bombeiro civil treinado para manter a frieza diante de traumas viscerais e salvar vidas.",
    skills: ["Medicina", "Ciências"],
    power: {
      name: "Cuidados Críticos",
      desc: "Ao usar um kit médico para curar ferimentos em um aliado, adiciona +1d6 PV ao total restaurado."
    }
  },
  {
    id: "academico",
    name: "Acadêmico",
    code: "ORIGEM #03",
    tagline: "Dedução Lógica & Rigor Científico",
    desc: "Pesquisador universitário, professor, perito forense ou engenheiro focado no método científico e resolução dedutiva de quebra-cabeças complexos.",
    skills: ["Investigação", "Tecnologia"],
    power: {
      name: "Mente Racional",
      desc: "Uma vez por cena, você pode rolar novamente qualquer teste baseado em Intelecto (ficando com o melhor resultado)."
    }
  },
  {
    id: "vitima-emocoes",
    name: "Vítima das Emoções",
    code: "ORIGEM #04",
    tagline: "Trauma Sobrevivido & Ressonância do Avesso",
    desc: "Alguém que já vivenciou um contato traumático prévio com anomalias do Avesso ou sobreviveu no epicentro do Estrondo original.",
    skills: ["Ocultismo", "Vontade"],
    power: {
      name: "Cicatriz Psíquica",
      desc: "Você recebe +2 em testes de Vontade contra efeitos de medo, Presença Perturbadora e rituais mentais."
    }
  }
];
