/**
 * ============================================================
 * ACHIEVEMENT DATA
 * ============================================================
 *
 * Arquivo responsável por centralizar todas as conquistas
 * oficiais do Mangás Drops.
 *
 * Cada categoria contém os marcos de progressão associados
 * às raridades:
 *
 * Bronze
 * Prata
 * Ouro
 * Platina
 * Esmeralda
 * Diamante
 * Épico
 * Mítico
 * Ultimate
 *
 * Categorias atuais:
 * - Volumes
 * - Coleções
 * - Extras
 * - Nível
 * - Fidelidade
 *
 * A categoria "Especiais" é dinâmica e será utilizada para
 * eventos, conquistas secretas, apoiadores, campanhas e
 * futuras funcionalidades do projeto.
 *
 * Este arquivo define apenas as regras e requisitos das
 * conquistas. O progresso dos usuários é calculado em tempo
 * real através dos dados da coleção, nível e fidelidade.
 *
 * ============================================================
 */

export const RARITY_COLORS = {
  wood: "#38220c",
  bronze: "#CD7F32",
  silver: "#D1D5DB",
  gold: "#FACC15",
  platinum: "#6ee5bf",
  emerald: "#1ca44e",
  diamond: "#38BDF8",
  epic: "#A855F7",
  mythic: "#971515",
  ultimate: "#FF4D94",
};

export function getRarityColor(rarity) {
  return RARITY_COLORS[rarity] || "#FFFFFF";
}

export const VOLUME_ACHIEVEMENTS = [
  {
    rarity: "wood",
    title: "Começando a coleção",
    requirement: 0,
  },
  {
    rarity: "bronze",
    title: "Primeira Estante • 25 Volumes",
    requirement: 25,
  },
  {
    rarity: "silver",
    title: "Coleção em Crescimento • 50 Volumes",
    requirement: 50,
  },
  {
    rarity: "gold",
    title: "Biblioteca Pessoal • 100 Volumes",
    requirement: 100,
  },
  {
    rarity: "platinum",
    title: "Colecionador Dedicado • 200 Volumes",
    requirement: 200,
  },
  {
    rarity: "emerald",
    title: "Guardião dos Mangás • 300 Volumes",
    requirement: 300,
  },
  {
    rarity: "diamond",
    title: "Mestre da Coleção • 500 Volumes",
    requirement: 500,
  },
  {
    rarity: "epic",
    title: "Lenda das Estantes • 750 Volumes",
    requirement: 750,
  },
  {
    rarity: "mythic",
    title: "Mil Histórias • 1000 Volumes",
    requirement: 1000,
  },
  {
    rarity: "ultimate",
    title: "Biblioteca Arcana • 1250 Volumes",
    requirement: 1250,
  },
];

export const COLLECTION_ACHIEVEMENTS = [
  {
    rarity: "wood",
    title: "Completando sua primeira obra",
    requirement: 0,
  },
  {
    rarity: "bronze",
    title: "Primeira Saga • 1 Coleção",
    requirement: 1,
  },
  {
    rarity: "silver",
    title: "Caçador de Histórias • 3 Coleções",
    requirement: 3,
  },
  {
    rarity: "gold",
    title: "Biblioteca em Expansão • 5 Coleções",
    requirement: 5,
  },
  {
    rarity: "platinum",
    title: "Mestre das Estantes • 10 Coleções",
    requirement: 10,
  },
  {
    rarity: "emerald",
    title: "Guardião das Obras • 20 Coleções",
    requirement: 20,
  },
  {
    rarity: "diamond",
    title: "Arquivista Lendário • 30 Coleções",
    requirement: 30,
  },
  {
    rarity: "epic",
    title: "Senhor das Coleções • 50 Coleções",
    requirement: 50,
  },
  {
    rarity: "mythic",
    title: "Lenda dos Mangás • 70 Coleções",
    requirement: 70,
  },
  {
    rarity: "ultimate",
    title: "Biblioteca Infinita • 100 Coleções",
    requirement: 100,
  },
];

export const EXTRA_ACHIEVEMENTS = [
  {
    rarity: "wood",
    title: "Expandindo o Universo",
    requirement: 0,
  },
  {
    rarity: "bronze",
    title: "Primeira Relíquia • 1 Extra",
    requirement: 1,
  },
  {
    rarity: "silver",
    title: "Caçador de Extras • 5 Extras",
    requirement: 5,
  },
  {
    rarity: "gold",
    title: "Tesouros da Coleção • 10 Extras",
    requirement: 10,
  },
  {
    rarity: "platinum",
    title: "Guardião das Relíquias • 20 Extras",
    requirement: 20,
  },
  {
    rarity: "emerald",
    title: "Arquivo Especial • 30 Extras",
    requirement: 30,
  },
  {
    rarity: "diamond",
    title: "Colecionador de Raridades • 40 Extras",
    requirement: 40,
  },
  {
    rarity: "epic",
    title: "Mestre dos Extras • 60 Extras",
    requirement: 60,
  },
  {
    rarity: "mythic",
    title: "Curador de Relíquias • 80 Extras",
    requirement: 80,
  },
  {
    rarity: "ultimate",
    title: "Tesouro Arcano • 100 Extras",
    requirement: 100,
  },
];

export const LEVEL_ACHIEVEMENTS = [
  {
    rarity: "wood",
    title: "Iniciante",
    requirement: 0,
  },
  {
    rarity: "bronze",
    title: "Aprendiz • Nível 3",
    requirement: 2,
  },
  {
    rarity: "silver",
    title: "Aventureiro • Nível 5",
    requirement: 5,
  },
  {
    rarity: "gold",
    title: "Especialista • Nível 10",
    requirement: 10,
  },
  {
    rarity: "platinum",
    title: "Veterano • Nível 20",
    requirement: 20,
  },
  {
    rarity: "emerald",
    title: "Mestre Colecionador • Nível 35",
    requirement: 35,
  },
  {
    rarity: "diamond",
    title: "Grande Mestre • Nível 60",
    requirement: 60,
  },
  {
    rarity: "epic",
    title: "Lenda Viva • Nível 80",
    requirement: 80,
  },
  {
    rarity: "mythic",
    title: "Arquimestre • Nível 100",
    requirement: 100,
  },
  {
    rarity: "ultimate",
    title: "Colecionador Supremo • Nível 120",
    requirement: 120,
  },
];

export const LOYALTY_ACHIEVEMENTS = [
  {
    rarity: "wood",
    title: "Ganhando Confiança",
    requirement: 0,
  },
  {
    rarity: "bronze",
    title: "Visitante Frequente • Nível 1",
    requirement: 1,
  },
  {
    rarity: "silver",
    title: "Colecionador Fiel • Nível 2",
    requirement: 2,
  },
  {
    rarity: "gold",
    title: "Membro Dedicado • Nível 3",
    requirement: 3,
  },
  {
    rarity: "platinum",
    title: "Aliado da Biblioteca • Nível 4",
    requirement: 4,
  },
  {
    rarity: "emerald",
    title: "Guardião da Comunidade • Nível 5",
    requirement: 5,
  },
  {
    rarity: "diamond",
    title: "Veterano do Drops • Nível 6",
    requirement: 6,
  },
  {
    rarity: "epic",
    title: "Lenda da Biblioteca • Nível 7",
    requirement: 7,
  },
  {
    rarity: "mythic",
    title: "Símbolo da Comunidade • Nível 8",
    requirement: 8,
  },
  {
    rarity: "ultimate",
    title: "Pioneiro",
    requirement: 8,
    founderOnly: true,
  },
];
