/**
 * ============================================================
 * MY COLLECTION - ACHIEVEMENTS PAGE
 * ============================================================
 *
 * Responsabilidades:
 *
 * - Carregar estatísticas da coleção do usuário
 * - Calcular o progresso das conquistas
 * - Renderizar o Hero de Conquistas
 * - Exibir os cards de progresso das categorias
 * - Fornecer os dados necessários para o modal
 *   de evolução das conquistas
 *
 * Categorias suportadas:
 *
 * - Volumes
 * - Coleções
 * - Extras
 * - Nível
 * - Fidelidade
 *
 * Estruturas auxiliares:
 *
 * achievementDefinitions:
 * Mapeia cada categoria para sua árvore completa
 * de conquistas, permitindo exibir facilmente:
 *
 * - Conquistas desbloqueadas
 * - Conquista atual
 * - Próximas conquistas
 * - Modal de progressão
 *
 * ============================================================
 */
import { useState } from "react";

import {
  ACHIEVEMENT_RARITIES,
  ACHIEVEMENT_CATEGORIES,
  getAchievementAssets,
} from "../../utils/my-collection/achievementAssets.js";

import {
  VOLUME_ACHIEVEMENTS,
  COLLECTION_ACHIEVEMENTS,
  EXTRA_ACHIEVEMENTS,
  LEVEL_ACHIEVEMENTS,
  LOYALTY_ACHIEVEMENTS,
} from "../../utils/my-collection/achievementData.js";

import Loader from "../../components/Loader.jsx";
import MyCollectionHeader from "../../components/my-collection/MyCollectionHeader";

import { useLockBodyScroll } from "../../hooks/my-collection-hooks/useLockBodyScroll";
import { useCollectionStats } from "../../hooks/my-collection-hooks/useCollectionStats";
import { useLogout } from "../../hooks/my-collection-hooks/useLogout";

import "../../styles/my-collection/my-collection-achievements.css";

import {
  calculateVolumeAchievements,
  calculateCollectionAchievements,
  calculateExtraAchievements,
  calculateLevelAchievements,
  calculateLoyaltyAchievements,
} from "../../utils/my-collection/achievementCalculator";

/**
 * ============================================================
 * ACHIEVEMENT DEFINITIONS
 * ============================================================
 *
 * Mapeia cada categoria para sua lista oficial
 * de conquistas.
 *
 * Utilizado por:
 *
 * - Cards
 * - Modal de progresso
 * - Exibição de badges bloqueadas
 * - Timeline de evolução
 *
 * ============================================================
 */

const achievementDefinitions = {
  volumes: VOLUME_ACHIEVEMENTS,

  collections: COLLECTION_ACHIEVEMENTS,

  extras: EXTRA_ACHIEVEMENTS,

  level: LEVEL_ACHIEVEMENTS,

  loyalty: LOYALTY_ACHIEVEMENTS,
};

/**
 * ============================================================
 * LOGOUT
 * ============================================================
 */

const handleLogout = useLogout();

export default function MyCollectionAchievements() {
  const {
    loading,
    userName,
    bannerUrl,
    avatarUrl,
    totalOwnedVolumes,
    completedCollections,
    totalExtras,
    collectorLevel,
    memberSince,
    loyaltyLevel,
  } = useCollectionStats();

  const volumeData = calculateVolumeAchievements(totalOwnedVolumes);

  const collectionData = calculateCollectionAchievements(completedCollections);

  const extraData = calculateExtraAchievements(totalExtras);

  const levelData = calculateLevelAchievements(collectorLevel);

  const loyaltyData = calculateLoyaltyAchievements(loyaltyLevel, memberSince);

  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useLockBodyScroll(selectedAchievement !== null);

  const achievementCards = [
    {
      key: "volumes",
      title: "Volumes",
      data: volumeData,
    },
    {
      key: "collections",
      title: "Coleções",
      data: collectionData,
    },
    {
      key: "extras",
      title: "Extras",
      data: extraData,
    },
    {
      key: "level",
      title: "Nível",
      data: levelData,
    },
    {
      key: "loyalty",
      title: "Fidelidade",
      data: loyaltyData,
    },
  ];

  const achievementTree = selectedAchievement
    ? achievementDefinitions[selectedAchievement.key]
    : [];

  const getRarityTitle = (rarityId) =>
    ACHIEVEMENT_RARITIES.find((rarity) => rarity.id === rarityId)?.title;

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <MyCollectionHeader onLogout={handleLogout} currentPage="achievements" />

      <main className="achievementsPage">
        {/* HERO */}
        <section
          className="achievementsHero"
          style={{
            backgroundImage: `url(${bannerUrl})`,
          }}
        >
          <div className="heroOverlay">
            <div className="heroContainer">
              <h1>Conquistas</h1>

              <div className="heroProfile">
                <img
                  src={
                    avatarUrl?.trim()
                      ? avatarUrl
                      : "/assets/my-collection/default-avatar.png"
                  }
                  alt={userName}
                  className="heroAvatar"
                />

                <div className="heroInfo">
                  <h2>{userName}</h2>

                  <div className="heroSince">📅 Membro desde {memberSince}</div>
                </div>

                <div className="heroStats">
                  <div className="heroStat">
                    <img
                      src={getAchievementAssets("volumes", "bronze").icon}
                      alt=""
                    />

                    <strong>{totalOwnedVolumes}</strong>

                    <span>Volumes</span>
                  </div>

                  <div className="heroStat">
                    <img
                      src={getAchievementAssets("collections", "bronze").icon}
                      alt=""
                    />

                    <strong>{completedCollections}</strong>

                    <span>Coleções</span>
                  </div>

                  <div className="heroStat">
                    <img
                      src={getAchievementAssets("extras", "bronze").icon}
                      alt=""
                    />

                    <strong>{totalExtras}</strong>

                    <span>Extras</span>
                  </div>

                  <div className="heroStat">
                    <img
                      src={getAchievementAssets("level", "bronze").icon}
                      alt=""
                    />

                    <strong>{collectorLevel}</strong>

                    <span>Nível</span>
                  </div>

                  <div className="heroStat">
                    <img
                      src={getAchievementAssets("loyalty", "bronze").icon}
                      alt=""
                    />

                    <strong>{loyaltyLevel}</strong>

                    <span>Fidelidade</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CARDS */}
        <section className="categoriesGrid">
          {achievementCards.map((achievement) => (
            <article
              key={achievement.key}
              className="achievementCard"
              onClick={() => setSelectedAchievement(achievement)}
            >
              <h2 className="cardTitle">{achievement.title}</h2>

              <div className="cardBadge" data-achievement={achievement.key}>
                <div className="achievementBadge large">
                  <img
                    className="badgeFrame"
                    src={
                      getAchievementAssets(
                        achievement.key,
                        achievement.data.currentProgress.rarity,
                      ).badge
                    }
                    alt=""
                  />

                  <img
                    className="badgeIcon"
                    src={
                      getAchievementAssets(
                        achievement.key,
                        achievement.data.currentProgress.rarity,
                      ).icon
                    }
                    alt=""
                  />
                </div>
              </div>

              <div className="cardStatus">
                <div>
                  <span>Atual</span>

                  <strong>
                    {getRarityTitle(
                      achievement.data.currentProgress.rarity,
                    )?.toUpperCase() || "INICIANTE"}
                  </strong>

                  <small>
                    {achievement.data.currentProgress.title.split(" • ")?.[0]}
                  </small>
                </div>

                {!achievement.data.completed && (
                  <div>
                    <span>Próxima</span>

                    <strong>
                      {getRarityTitle(
                        achievement.data.next.rarity,
                      ).toUpperCase()}
                    </strong>

                    <small>{achievement.data.next.title.split(" • ")[0]}</small>
                  </div>
                )}
              </div>
              <div className="cardProgress">
                <div className="progressBar">
                  <div
                    className="progressFill"
                    style={{
                      width: `${achievement.data.percentage}%`,
                    }}
                  />
                </div>

                <div className="cardBottom">
                  <div className="cardCurrentValue">
                    {achievement.data.value} /{" "}
                    {achievement.data.completed
                      ? achievement.data.currentRequirement
                      : achievement.data.next.requirement}
                  </div>

                  <div className="cardPercent">
                    {achievement.data.percentage}%
                  </div>
                </div>
              </div>

              <div className="cardUnlocked">
                {achievement.data.unlockedCount} de 9 conquistas
              </div>
            </article>
          ))}

          <article className="achievementCard specialCard">
            <div className="cardTitle">ESPECIAIS</div>

            <div className="cardBadge">
              <div className="achievementBadge large">
                <img
                  className="badgeFrame"
                  src={getAchievementAssets("special", "gold").badge}
                  alt=""
                />

                <img
                  className="badgeIcon"
                  src={getAchievementAssets("special", "gold").icon}
                  alt=""
                />
              </div>
            </div>

            <div className="specialContent">
              Conquistas exclusivas de eventos, apoiadores, campanhas e futuras
              funcionalidades do Mangás Drops.
            </div>
          </article>
        </section>
        {selectedAchievement && (
          <div
            className="achievementModalOverlay"
            onClick={() => setSelectedAchievement(null)}
          >
            <div
              className="achievementModal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="achievementModalHeader">
                <div className="achievementBadge large">
                  <img
                    className="badgeFrame"
                    src={
                      getAchievementAssets(
                        selectedAchievement.key,
                        selectedAchievement.data.currentProgress.rarity,
                      ).badge
                    }
                    alt=""
                  />

                  <img
                    className="badgeIcon"
                    src={
                      getAchievementAssets(
                        selectedAchievement.key,
                        selectedAchievement.data.currentProgress.rarity,
                      ).icon
                    }
                    alt=""
                  />
                </div>

                <h2>{selectedAchievement.title}</h2>

                <div className="modalCurrentRarity">
                  {getRarityTitle(
                    selectedAchievement.data.currentProgress.rarity,
                  ).toUpperCase()}
                </div>

                <div className="modalProgress">
                  {selectedAchievement.data.value} /{" "}
                  {selectedAchievement.data.completed
                    ? selectedAchievement.data.currentRequirement
                    : selectedAchievement.data.next.requirement}
                </div>
              </div>
              <button
                className="modalClose"
                onClick={() => setSelectedAchievement(null)}
              >
                ✕
              </button>

              <div className="achievementTreeGrid">
                {achievementTree.map((tier) => {
                  const unlocked =
                    selectedAchievement.data.value >= tier.requirement;

                  const current =
                    tier.rarity ===
                    selectedAchievement.data.currentProgress.rarity;

                  const next =
                    !unlocked &&
                    tier.rarity === selectedAchievement.data.next?.rarity;

                  const [title, requirement] = tier.title.split(" • ");

                  return (
                    <div
                      key={tier.rarity}
                      className={`
                        achievementTier
                        ${unlocked ? "unlocked" : "locked"}
                        ${current ? "current" : ""}
                      `}
                    >
                      {!unlocked && !next ? (
                        <>
                          <div className="tierHiddenLock">🔒</div>

                          <div className="tierHiddenTitle">?????</div>
                        </>
                      ) : (
                        <>
                          {!unlocked && <div className="tierLock">🔒</div>}

                          <div className="achievementBadge">
                            <img
                              className="badgeFrame"
                              src={
                                getAchievementAssets(
                                  selectedAchievement.key,
                                  tier.rarity,
                                ).badge
                              }
                              alt=""
                            />

                            <img
                              className="badgeIcon"
                              src={
                                getAchievementAssets(
                                  selectedAchievement.key,
                                  tier.rarity,
                                ).icon
                              }
                              alt=""
                            />
                          </div>

                          <div className="tierRarity">
                            {getRarityTitle(tier.rarity)}
                          </div>
                          <div className="tierTitle">
                            <div className="tierName">{title}</div>

                            <div className="tierDivider" />

                            <div className="tierRequirement">{requirement}</div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <footer className="achievementsFooter">
          Complete desafios e desbloqueie todas as badges do Mangás Drops.
        </footer>
      </main>
    </>
  );
}
