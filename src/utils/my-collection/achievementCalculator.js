// achievementCalculator.js

export function calculateCategory(value, achievements) {
  const unlocked = achievements.filter(
    (achievement) => value >= achievement.requirement,
  );

  const currentProgress = unlocked[unlocked.length - 1];

  const next = achievements.find(
    (achievement) => value < achievement.requirement,
  );

  const currentRequirement = currentProgress.requirement;

  const previousRequirement =
    unlocked.length > 1 ? unlocked[unlocked.length - 2].requirement : 0;

  const progress = value - currentRequirement;

  const nextRequirement = next
    ? next.requirement - currentRequirement
    : currentRequirement;

  const percentage = next
    ? nextRequirement > 0
      ? Math.min(100, Math.round((progress / nextRequirement) * 100))
      : 0
    : 100;

  return {
    currentProgress,
    next,

    value,

    currentRequirement,
    previousRequirement,

    progress,
    nextRequirement,

    percentage,

    unlockedCount: Math.max(0, unlocked.length - 1),

    totalCount: achievements.length - 1,

    completed: !next,
  };
}

import {
  VOLUME_ACHIEVEMENTS,
  COLLECTION_ACHIEVEMENTS,
  EXTRA_ACHIEVEMENTS,
  LEVEL_ACHIEVEMENTS,
  LOYALTY_ACHIEVEMENTS,
} from "./achievementData";

//CONQUISTA: Calculo dos volumes
export function calculateVolumeAchievements(totalVolumes) {
  return calculateCategory(totalVolumes, VOLUME_ACHIEVEMENTS);
}

//CONQUISTA: Calculo das coleções
export function calculateCollectionAchievements(completedCollections) {
  return calculateCategory(completedCollections, COLLECTION_ACHIEVEMENTS);
}

//CONQUISTA: Calculo dos volumes extras

export function calculateExtraAchievements(totalExtras) {
  return calculateCategory(totalExtras, EXTRA_ACHIEVEMENTS);
}

//CONQUISTA: Calculo do level

export function calculateLevelAchievements(totalLevel) {
  return calculateCategory(totalLevel, LEVEL_ACHIEVEMENTS);
}

//CONQUISTA: Calculo da fidelidade

export function calculateLoyaltyAchievements(loyaltyLevel, memberSince) {
  const founder = loyaltyLevel >= 8 && memberSince?.includes("2026");

  if (founder) {
    const ultimateAchievement = LOYALTY_ACHIEVEMENTS.find(
      (achievement) => achievement.founderOnly,
    );

    return {
      currentProgress: ultimateAchievement,

      next: null,

      value: loyaltyLevel,

      currentRequirement: ultimateAchievement.requirement,

      progress: 100,
      nextTarget: 100,

      percentage: 100,

      unlockedCount: LOYALTY_ACHIEVEMENTS.length - 1,

      totalCount: LOYALTY_ACHIEVEMENTS.length - 1,

      completed: true,
    };
  }

  const loyaltyAchievements = LOYALTY_ACHIEVEMENTS.filter(
    (achievement) => !achievement.founderOnly,
  );

  return calculateCategory(loyaltyLevel, loyaltyAchievements);
}

//CONQUISTA: Total de conquistas

