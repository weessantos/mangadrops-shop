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

export const VOLUME_ACHIEVEMENTS = [
  {
    rarity: "wood",
    title: "Começando a coleção",
    requirement: 0,
  },
  {
    rarity: "bronze",
    title: "25 Volumes",
    requirement: 25,
  },
  {
    rarity: "silver",
    title: "50 Volumes",
    requirement: 50,
  },
  {
    rarity: "gold",
    title: "100 Volumes",
    requirement: 100,
  },
  {
    rarity: "platinum",
    title: "200 Volumes",
    requirement: 200,
  },
  {
    rarity: "emerald",
    title: "300 Volumes",
    requirement: 300,
  },
  {
    rarity: "diamond",
    title: "500 Volumes",
    requirement: 500,
  },
  {
    rarity: "epic",
    title: "750 Volumes",
    requirement: 750,
  },
  {
    rarity: "mythic",
    title: "1000 Volumes",
    requirement: 1000,
  },
  {
    rarity: "ultimate",
    title: "1250 Volumes",
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
    title: "Primeira Coleção",
    requirement: 1,
  },
  {
    rarity: "silver",
    title: "3 Coleções",
    requirement: 3,
  },
  {
    rarity: "gold",
    title: "5 Coleções",
    requirement: 5,
  },
  {
    rarity: "platinum",
    title: "10 Coleções",
    requirement: 10,
  },
  {
    rarity: "emerald",
    title: "20 Coleções",
    requirement: 20,
  },
  {
    rarity: "diamond",
    title: "30 Coleções",
    requirement: 30,
  },
  {
    rarity: "epic",
    title: "50 Coleções",
    requirement: 50,
  },
  {
    rarity: "mythic",
    title: "70 Coleções",
    requirement: 70,
  },
  {
    rarity: "ultimate",
    title: "100 Coleções",
    requirement: 100,
  },
];

export const EXTRA_ACHIEVEMENTS = [
  {
    rarity: "wood",
    title: "Expandindo o universo",
    requirement: 0,
  },
  {
    rarity: "bronze",
    title: "Primeiro Extra",
    requirement: 1,
  },
  {
    rarity: "silver",
    title: "5 Extras",
    requirement: 5,
  },
  {
    rarity: "gold",
    title: "10 Extras",
    requirement: 10,
  },
  {
    rarity: "platinum",
    title: "20 Extras",
    requirement: 20,
  },
  {
    rarity: "emerald",
    title: "30 Extras",
    requirement: 30,
  },
  {
    rarity: "diamond",
    title: "40 Extras",
    requirement: 40,
  },
  {
    rarity: "epic",
    title: "60 Extras",
    requirement: 60,
  },
  {
    rarity: "mythic",
    title: "80 Extras",
    requirement: 80,
  },
  {
    rarity: "ultimate",
    title: "100 Extras",
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
    title: "Nível 3",
    requirement: 2,
  },
  {
    rarity: "silver",
    title: "Nível 5",
    requirement: 5,
  },
  {
    rarity: "gold",
    title: "Nível 10",
    requirement: 10,
  },
  {
    rarity: "platinum",
    title: "Nível 20",
    requirement: 20,
  },
  {
    rarity: "emerald",
    title: "Nível 35",
    requirement: 35,
  },
  {
    rarity: "diamond",
    title: "Nível 60",
    requirement: 60,
  },
  {
    rarity: "epic",
    title: "Nível 80",
    requirement: 80,
  },
  {
    rarity: "mythic",
    title: "Nível 100",
    requirement: 100,
  },
  {
    rarity: "ultimate",
    title: "Nível 120",
    requirement: 120,
  },
];

export const LOYALTY_ACHIEVEMENTS = [
  {
    rarity: "wood",
    title: "Ganhando confiança",
    requirement: 0,
  },
  {
    rarity: "bronze",
    title: "Nível 1",
    requirement: 1,
  },
  {
    rarity: "silver",
    title: "Nível 2",
    requirement: 2,
  },
  {
    rarity: "gold",
    title: "Nível 3",
    requirement: 3,
  },
  {
    rarity: "platinum",
    title: "Nível 4",
    requirement: 4,
  },
  {
    rarity: "emerald",
    title: "Nível 5",
    requirement: 5,
  },
  {
    rarity: "diamond",
    title: "Nível 6",
    requirement: 6,
  },
  {
    rarity: "epic",
    title: "Nível 7",
    requirement: 7,
  },
  {
    rarity: "mythic",
    title: "Nível 8",
    requirement: 8,
  },
  {
    rarity: "ultimate",
    title: "Pioneiro",
    requirement: 8,
    founderOnly: true,
  },
];
