/**
 * ==========================================================
 * RANKS DO PERFIL
 * ==========================================================
 *
 * RESPONSABILIDADES:
 *
 * - Definir ranks.
 * - Calcular progresso.
 * - Expor metadados para modais/cards.
 *
 * ==========================================================
 */

// ==========================================
// HELPERS
// ==========================================

export function getRankProgress(currentValue, rank) {
  if (!rank.nextRankValue) {
    return 100;
  }

  return Math.min(
    100,
    Math.max(
      0,
      ((currentValue - rank.requiredValue) /
        (rank.nextRankValue - rank.requiredValue)) *
        100,
    ),
  );
}

// ==========================================
// COLLECTOR RANK
// ==========================================

export function getCollectorRank(totalVolumes, loyaltyLevel, isAdmin = false) {
  const ranks = [
    {
      rank: "APRENDIZ",
      title: "Aprendiz",
      levelValue: 0,
      description: "Toda grande coleção começa com o primeiro volume.",
      badge: "/assets/my-collection/icons/badges/badges_raw/badge_raw01.png",
      color: "#ffb87d",
      requiredValue: 0,
      requiredLoyalty: 0,
      nextRankTitle: "Leitor",
      nextRankValue: 15,
      nextRankLoyalty: 2,
    },

    {
      rank: "LEITOR",
      title: "Leitor",
      levelValue: 1,
      description: "Os primeiros tomos já ocupam espaço na sua biblioteca.",
      badge: "/assets/my-collection/icons/badges/badges_raw/badge_raw02.png",
      color: "#7a7a7a",
      requiredValue: 15,
      requiredLoyalty: 2,
      nextRankTitle: "Colecionador",
      nextRankValue: 50,
      nextRankLoyalty: 3,
    },

    {
      rank: "COLECIONADOR",
      title: "Colecionador",
      levelValue: 2,
      description: "Sua estante começa a ganhar forma e personalidade própria.",
      badge: "/assets/my-collection/icons/badges/badges_raw/badge_raw03.png",
      color: "#ba7b33",
      requiredValue: 50,
      requiredLoyalty: 3,
      nextRankTitle: "Curador",
      nextRankValue: 100,
      nextRankLoyalty: 4,
    },

    {
      rank: "CURADOR",
      title: "Curador",
      levelValue: 3,
      description:
        "Cada obra em sua coleção foi escolhida com critério e dedicação.",
      badge: "/assets/my-collection/icons/badges/badges_raw/badge_raw04.png",
      color: "#cacaca",
      requiredValue: 100,
      requiredLoyalty: 4,
      nextRankTitle: "Arquivista",
      nextRankValue: 150,
      nextRankLoyalty: 5,
    },

    {
      rank: "ARQUIVISTA",
      title: "Arquivista",
      levelValue: 4,
      description:
        "Seu acervo já merece ser catalogado entre as grandes coleções.",
      badge: "/assets/my-collection/icons/badges/badges_raw/badge_raw05.png",
      color: "#27d72a",
      requiredValue: 150,
      requiredLoyalty: 5,
      nextRankTitle: "Bibliotecário Arcano",
      nextRankValue: 250,
      nextRankLoyalty: 6,
    },

    {
      rank: "BIBLIOTECARIO_ARCANO",
      title: "Bibliotecário Arcano",
      levelValue: 5,
      description:
        "Conhecedor dos segredos escondidos entre os tomos e das obras mais raras.",
      badge: "/assets/my-collection/icons/badges/badges_raw/badge_raw06.png",
      color: "#eb3d3d",
      requiredValue: 250,
      requiredLoyalty: 6,
      nextRankTitle: "Mestre da Estante",
      nextRankValue: 350,
      nextRankLoyalty: 7,
    },

    {
      rank: "MESTRE_DA_ESTANTE",
      title: "Mestre da Estante",
      levelValue: 6,
      description: "Sua biblioteca já inspira outros colecionadores.",
      badge: "/assets/my-collection/icons/badges/badges_raw/badge_raw07.png",
      color: "#3a43ed",
      requiredValue: 350,
      requiredLoyalty: 7,
      nextRankTitle: "Guardião dos Tomos",
      nextRankValue: 500,
      nextRankLoyalty: 8,
    },

    {
      rank: "GUARDIAO_DOS_TOMOS",
      title: "Guardião dos Tomos",
      levelValue: 7,
      description: "Protege e preserva uma coleção lendária.",
      badge: "/assets/my-collection/icons/badges/badges_raw/badge_raw08.png",
      color: "#8f33d1",
      requiredValue: 500,
      requiredLoyalty: 8,
      nextRankTitle: null,
      nextRankValue: null,
      nextRankLoyalty: null,
    },
  ];

  if (isAdmin) {
    return {
      type: "collector",
      category: "Rank de Colecionador",

      rank: "ARCANISTA_SUPREMO",
      title: "Arcanista Supremo",
      levelValue: 10,

      description: "A mais alta autoridade do Acervo.",

      badge: "/assets/my-collection/icons/badges/badges_raw/badge_raw09.png",

      color: "#baf1fd",

      requiredValue: null,
      requiredLoyalty: null,

      nextRankTitle: null,
      nextRankValue: null,
      nextRankLoyalty: null,

      maxTitle: "👑 Fundador do Acervo",
    };
  }

  const currentRank = [...ranks]
    .reverse()
    .find(
      (rank) =>
        totalVolumes >= rank.requiredValue &&
        loyaltyLevel >= rank.requiredLoyalty,
    );

  return {
    type: "collector",
    category: "Rank de Colecionador",

    maxTitle: "👑 Fundador do Acervo",

    nextRankBadge: currentRank.nextRankTitle
      ? ranks.find((r) => r.title === currentRank.nextRankTitle)?.badge
      : null,

    nextRankRequiredValue: currentRank.nextRankValue,
    nextRankRequiredLoyalty: currentRank.nextRankLoyalty,

    ...currentRank,
  };
}

// ==========================================
// INVESTMENT RANK
// ==========================================

export function getInvestmentRank(totalSpent, loyaltyLevel) {
  const ranks = [
    {
      rank: "APOIADOR",
      title: "Apoiador",
      levelValue: 0,
      description: "Primeiros passos na construção do acervo.",
      badge: "/assets/my-collection/icons/badges/coins/coin01.png",
      color: "#9ca3af",
      requiredValue: 0,
      requiredLoyalty: 0,
      nextRankTitle: "Patrono",
      nextRankValue: 100,
      nextRankLoyalty: 2,
    },

    {
      rank: "PATRONO",
      title: "Patrono",
      levelValue: 1,
      description: "Seu investimento começa a dar forma à coleção.",
      badge: "/assets/my-collection/icons/badges/coins/coin02.png",
      color: "#94a3b8",
      requiredValue: 100,
      requiredLoyalty: 2,
      nextRankTitle: "Colecionador Dedicado",
      nextRankValue: 250,
      nextRankLoyalty: 2,
    },

    {
      rank: "COLECIONADOR_DEDICADO",
      title: "Colecionador Dedicado",
      levelValue: 2,
      description: "A biblioteca cresce volume após volume.",
      badge: "/assets/my-collection/icons/badges/coins/coin03.png",
      color: "#14b8a6",
      requiredValue: 250,
      requiredLoyalty: 2,
      nextRankTitle: "Curador",
      nextRankValue: 500,
      nextRankLoyalty: 3,
    },

    {
      rank: "CURADOR",
      title: "Curador",
      levelValue: 3,
      description: "Uma coleção organizada começa a surgir.",
      badge: "/assets/my-collection/icons/badges/coins/coin04.png",
      color: "#22c55e",
      requiredValue: 500,
      requiredLoyalty: 3,
      nextRankTitle: "Guardião",
      nextRankValue: 1000,
      nextRankLoyalty: 3,
    },

    {
      rank: "GUARDIAO",
      title: "Guardião",
      levelValue: 4,
      description: "Seu acervo já merece reconhecimento.",
      badge: "/assets/my-collection/icons/badges/coins/coin05.png",
      color: "#3b82f6",
      requiredValue: 1000,
      requiredLoyalty: 3,
      nextRankTitle: "Arquivista",
      nextRankValue: 1500,
      nextRankLoyalty: 4,
    },

    {
      rank: "ARQUIVISTA",
      title: "Arquivista",
      levelValue: 5,
      description: "O conhecimento acumulado ganha valor.",
      badge: "/assets/my-collection/icons/badges/coins/coin06.png",
      color: "#8b5cf6",
      requiredValue: 1500,
      requiredLoyalty: 4,
      nextRankTitle: "Grande Curador",
      nextRankValue: 2500,
      nextRankLoyalty: 4,
    },

    {
      rank: "GRANDE_CURADOR",
      title: "Grande Curador",
      levelValue: 6,
      description: "Uma coleção respeitável toma forma.",
      badge: "/assets/my-collection/icons/badges/coins/coin07.png",
      color: "#a855f7",
      requiredValue: 2500,
      requiredLoyalty: 4,
      nextRankTitle: "Grande Mecenas",
      nextRankValue: 4000,
      nextRankLoyalty: 5,
    },

    {
      rank: "GRANDE_MECENAS",
      title: "Grande Mecenas",
      levelValue: 7,
      description: "Seu apoio ao hobby é notável.",
      badge: "/assets/my-collection/icons/badges/coins/coin08.png",
      color: "#f97316",
      requiredValue: 4000,
      requiredLoyalty: 5,
      nextRankTitle: "Lorde da Biblioteca",
      nextRankValue: 5000,
      nextRankLoyalty: 6,
    },

    {
      rank: "LORDE_DA_BIBLIOTECA",
      title: "Lorde da Biblioteca",
      levelValue: 8,
      description: "Poucos colecionadores chegam tão longe.",
      badge: "/assets/my-collection/icons/badges/coins/coin09.png",
      color: "#fb923c",
      requiredValue: 5000,
      requiredLoyalty: 6,
      nextRankTitle: "Magnata do Acervo",
      nextRankValue: 7500,
      nextRankLoyalty: 7,
    },

    {
      rank: "MAGNATA_DO_ACERVO",
      title: "Magnata do Acervo",
      levelValue: 9,
      description: "Seu acervo impressiona qualquer visitante.",
      badge: "/assets/my-collection/icons/badges/coins/coin10.png",
      color: "#facc15",
      requiredValue: 7500,
      requiredLoyalty: 7,
      nextRankTitle: "Conservador Imperial",
      nextRankValue: 10000,
      nextRankLoyalty: 8,
    },

    {
      rank: "CONSERVADOR_IMPERIAL",
      title: "Conservador Imperial",
      levelValue: 10,
      description: "Uma coleção digna de exposição.",
      badge: "/assets/my-collection/icons/badges/coins/coin11.png",
      color: "#fde047",
      requiredValue: 10000,
      requiredLoyalty: 8,
      nextRankTitle: "Patrono Supremo",
      nextRankValue: 15000,
      nextRankLoyalty: 8,
    },

    {
      rank: "PATRONO_SUPREMO",
      title: "Patrono Supremo",
      levelValue: 11,
      description: "Seu legado como colecionador é evidente.",
      badge: "/assets/my-collection/icons/badges/coins/coin12.png",
      color: "#fef08a",
      requiredValue: 15000,
      requiredLoyalty: 8,
      nextRankTitle: "Imperador das Coleções",
      nextRankValue: 25000,
      nextRankLoyalty: 8,
    },

    {
      rank: "IMPERADOR_DAS_COLECOES",
      title: "Imperador das Coleções",
      levelValue: 12,
      description: "O mais alto nível de dedicação ao hobby.",
      badge: "/assets/my-collection/icons/badges/coins/coin13.png",
      color: "#baf1fd",
      requiredValue: 25000,
      requiredLoyalty: 8,
      nextRankTitle: null,
      nextRankValue: null,
      nextRankLoyalty: null,
    },
  ];

  const currentRank = [...ranks]
    .reverse()
    .find(
      (rank) =>
        totalSpent >= rank.requiredValue &&
        loyaltyLevel >= rank.requiredLoyalty,
    );

  return {
    type: "investment",
    category: "Elo de Investimento",

    maxTitle: "💎 Imperador das Coleções",

    nextRankBadge: currentRank.nextRankTitle
      ? ranks.find((r) => r.title === currentRank.nextRankTitle)?.badge
      : null,

    nextRankRequiredValue: currentRank.nextRankValue,
    nextRankRequiredLoyalty: currentRank.nextRankLoyalty,

    ...currentRank,
  };
}

// ==========================================
// AVATAR RANK UNLOCKED
// ==========================================
export function getUnlockedAvatars(rankLevel, isAdmin = false) {
  if (isAdmin) {
    return 105;
  }

  const limits = {
    1: 30,
    2: 35,
    3: 45,
    4: 50,
    5: 60,
    6: 75,
    7: 85,
    8: 100,
  };

  return limits[rankLevel] || 20;
}

// ==========================================
// BANNER RANK UNLOCKED
// ==========================================
export function getUnlockedBanners(level) {
  const limits = {
    1: 10,
    2: 12,
    3: 14,
    4: 16,
    5: 19,
    6: 22,
    7: 25,
    8: 29,
    9: 33,
    10: 37,
    11: 41,
    12: 45,
    13: 50,
  };

  return limits[level] || 10;
}
