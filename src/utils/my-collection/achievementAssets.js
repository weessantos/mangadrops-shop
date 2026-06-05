export const ACHIEVEMENT_RARITIES = [
  { id: "wood", title: "Madeira" },
  { id: "bronze", title: "Bronze" },
  { id: "silver", title: "Prata" },
  { id: "gold", title: "Ouro" },
  { id: "platinum", title: "Platina" },
  { id: "emerald", title: "Esmeralda" },
  { id: "diamond", title: "Diamante" },
  { id: "epic", title: "Épico" },
  { id: "mythic", title: "Mítico" },
  { id: "ultimate", title: "Ultimate" },
];

export const ACHIEVEMENT_CATEGORIES = {
  volumes: {
    title: "Volumes",
    icon: "book",
  },
  collections: {
    title: "Coleções",
    icon: "book-group",
  },
  extras: {
    title: "Extras",
    icon: "extras",
  },
  level: {
    title: "Nível",
    icon: "star",
  },
  loyalty: {
    title: "Fidelidade",
    icon: "loyalty",
  },
  special: {
    title: "Especiais",
    icon: "gift",
  },
};

export function getAchievementAssets(category, rarity) {
  return {
    badge: `/assets/my-collection/icons/achievements/badge-${rarity}.svg`,
    icon: `/assets/my-collection/icons/achievements/${ACHIEVEMENT_CATEGORIES[category].icon}.png`,
  };
}
