import { useState } from "react";

import { getRankProgress } from "../../utils/my-collection/collectorRank";
import "../../styles/my-collection/my-collector-rank-modal.css";
import { useLockBodyScroll } from "../../hooks/my-collection-hooks/useLockBodyScroll";

export default function CollectorRankModal({
  userName,
  avatarUrl,

  collectorLevel,
  loyaltyLevel,
  loyaltyEnabled,
  loyaltyLoginDays,
  memberSince,

  totalVolumes,

  completedCollections,
  collectingCollections,

  totalMedals,

  collectorRank,
  investmentRank,

  totalSpent,

  onClose,
  onEditProfile,
}) {
  const progress = getRankProgress(totalVolumes, collectorRank);

  const isMaxCollectorRank = !collectorRank.nextRankTitle;
  const isMaxInvestmentRank = !investmentRank.nextRankTitle;

  const missingVolumes = Math.max(
    0,
    (collectorRank.nextRankValue || 0) - totalVolumes,
  );

  const missingLoyalty = Math.max(
    0,
    (collectorRank.nextRankLoyalty || 0) - loyaltyLevel,
  );

  let nextRankMessage = "";

  if (missingVolumes > 0 && missingLoyalty > 0) {
    nextRankMessage = `Faltam ${missingVolumes} volumes e Fidelidade ${collectorRank.nextRankLoyalty}`;
  } else if (missingVolumes > 0) {
    nextRankMessage = `Faltam ${missingVolumes} volumes`;
  } else if (missingLoyalty > 0) {
    nextRankMessage = `Necessário Fidelidade ${collectorRank.nextRankLoyalty}`;
  }

  const missingInvestment = Math.max(
    0,
    (investmentRank.nextRankValue || 0) - totalSpent,
  );

  const missingInvestmentLoyalty = Math.max(
    0,
    (investmentRank.nextRankLoyalty || 0) - loyaltyLevel,
  );

  let nextInvestmentMessage = "";

  if (missingInvestment > 0 && missingInvestmentLoyalty > 0) {
    nextInvestmentMessage = `Faltam R$ ${missingInvestment.toLocaleString(
      "pt-BR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )} e Fidelidade ${investmentRank.nextRankLoyalty}`;
  } else if (missingInvestment > 0) {
    nextInvestmentMessage = `Faltam R$ ${missingInvestment.toLocaleString(
      "pt-BR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  } else if (missingInvestmentLoyalty > 0) {
    nextInvestmentMessage = `Necessário Fidelidade ${investmentRank.nextRankLoyalty}`;
  }

  const nextLoyaltyLevel = Math.min(8, loyaltyLevel + 1);

  let loyaltyMessage = "";

  if (!loyaltyEnabled) {
    loyaltyMessage =
      "A fidelidade será desbloqueada após 30 dias de conta e 5 dias de login.";
  } else if (loyaltyLevel >= 8) {
    loyaltyMessage = "Nível máximo de fidelidade alcançado.";
  } else {
    let remainingLoyaltyDays = 5 - (loyaltyLoginDays % 5);

    if (remainingLoyaltyDays === 0) {
      remainingLoyaltyDays = 5;
    }

    loyaltyMessage = `Faltam ${remainingLoyaltyDays} dias de login`;
  }

  const [showLoyaltyInfo, setShowLoyaltyInfo] = useState(false);

  const collectorProgress = getRankProgress(totalVolumes, collectorRank);

  const investmentProgress = getRankProgress(totalSpent, investmentRank);

  const remainingInvestment = investmentRank.nextRankValue
    ? investmentRank.nextRankValue - totalSpent
    : 0;

  useLockBodyScroll();

  console.log(investmentRank);

  return (
    <div className="rank-modal-overlay" onClick={onClose}>
      <div className="rank-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rank-modal-grid">
          {/* ==========================================
            PERFIL
        ========================================== */}

          <div className="rank-card profile-card">
            <div
              className="rank-avatar-wrapper"
              onClick={() => {
                onClose();
                onEditProfile();
              }}
            >
              <img src={avatarUrl} alt={userName} className="profile-avatar" />

              <div className="rank-avatar-edit">
                <img
                  src="/assets/my-collection/icons/editar-perfil.png"
                  alt="Editar perfil"
                />
              </div>
            </div>

            <h3>{userName}</h3>
            <p className="collector-member-since">
              📅 Membro desde {memberSince}
            </p>

            <div className="profile-badges">
              <div>
                <button className="profile-level">
                  Nível {collectorLevel}{" "}
                </button>
              </div>

              <div className="loyalty-wrapper">
                <button
                  className="profile-loyalty"
                  onClick={() => setShowLoyaltyInfo(!showLoyaltyInfo)}
                >
                  Fidelidade {loyaltyLevel}
                </button>

                {showLoyaltyInfo && (
                  <div className="loyalty-tooltip">
                    <div className="loyalty-tooltip-title">
                      <img
                        src="/assets/my-collection/icons/loyalty.png"
                        alt="Fidelidade"
                        className="loyalty-tooltip-icon"
                      />
                      Fidelidade
                    </div>

                    <div className="loyalty-tooltip-current">
                      <span className="loyalty-tooltip-label">Nível Atual</span>

                      <strong className="loyalty-tooltip-level">
                        {loyaltyLevel}
                      </strong>
                    </div>

                    <div className="loyalty-tooltip-divider" />

                    <div className="loyalty-tooltip-next">
                      <span className="loyalty-tooltip-label">
                        Próximo Marco
                      </span>

                      <strong className="loyalty-tooltip-next-level">
                        Fidelidade {nextLoyaltyLevel}
                      </strong>
                    </div>

                    <div className="loyalty-tooltip-message">
                      {loyaltyMessage}
                    </div>

                    <div className="loyalty-tooltip-divider" />

                    <div className="loyalty-tooltip-footer">
                      A constância é o caminho para os maiores títulos da
                      Biblioteca Arcana.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="profile-stat-item stat-volumes">
                <img
                  src="/assets/my-collection/icons/stats/volumes.png"
                  alt="Volumes"
                  className="profile-stat-icon"
                />

                <strong>{totalVolumes}</strong>

                <span>Volumes</span>
              </div>

              <div className="profile-stat-item stat-completed">
                <img
                  src="/assets/my-collection/icons/stats/completed.png"
                  alt="Coleções completas"
                  className="profile-stat-icon"
                />

                <strong>{completedCollections}</strong>

                <span>Completas</span>
              </div>

              <div className="profile-stat-item stat-collecting">
                <img
                  src="/assets/my-collection/icons/stats/collecting.png"
                  alt="Coleções em andamento"
                  className="profile-stat-icon"
                />

                <strong>{collectingCollections}</strong>

                <span>Em andamento</span>
              </div>

              <div className="profile-stat-item stat-medals">
                <img
                  src="/assets/my-collection/icons/stats/medals.png"
                  alt="Medalhas"
                  className="profile-stat-icon"
                />

                <strong>{totalMedals}</strong>

                <span>Medalhas</span>
              </div>
            </div>
          </div>

          {/* ==========================================
            RANK DE COLECIONADOR
        ========================================== */}

          <div className="rank-card">
            <div className="rank-card-main">
              <span className="rank-card-section-title">
                Rank de Colecionador
              </span>

              <img
                src={collectorRank.badge}
                alt={collectorRank.title}
                className="rank-card-badge"
              />

              <h3
                style={{
                  color: collectorRank.color,
                }}
              >
                {collectorRank.title}
              </h3>

              <p className="rank-card-description">
                {collectorRank.description}
              </p>

              <div
                className="rank-progress-bar"
                style={{
                  "--rank-color": collectorRank.color,
                }}
              >
                <div
                  className="rank-progress-fill"
                  style={{
                    width: `${collectorProgress}%`,
                  }}
                />
              </div>

              <div className="rank-progress-percentage">
                {Math.round(collectorProgress)}%
              </div>
            </div>

            {!isMaxCollectorRank && (
              <div className="rank-next-section">
                <span className="next-rank-label">Próximo Rank</span>

                <div className="next-rank-content">
                  <strong className="next-rank-title">
                    {collectorRank.nextRankTitle}
                  </strong>

                  <small className="next-rank-remaining">
                    {nextRankMessage}
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* ==========================================
            RANK DE INVESTIMENTO
        ========================================== */}

          <div className="rank-card">
            <div className="rank-card-main">
              <span className="rank-card-section-title">
                Rank de Investimento
              </span>

              <img
                src={investmentRank.badge}
                alt={investmentRank.title}
                className="rank-card-badge investment"
              />

              <h3
                style={{
                  color: investmentRank.color,
                }}
              >
                {investmentRank.title}
              </h3>

              <p className="rank-card-description">
                {investmentRank.description}
              </p>

              <div
                className="rank-progress-bar"
                style={{
                  "--rank-color": investmentRank.color,
                }}
              >
                <div
                  className="rank-progress-fill"
                  style={{
                    width: `${investmentProgress}%`,
                  }}
                />
              </div>

              <div className="rank-progress-percentage">
                {Math.round(investmentProgress)}%
              </div>
            </div>

            {!isMaxInvestmentRank && (
              <div className="rank-next-section">
                <span className="next-rank-label">Próximo Elo</span>

                <div className="next-rank-content">
                  <strong className="next-rank-title">
                    {investmentRank.nextRankTitle}
                  </strong>

                  <small className="next-rank-remaining">
                    {nextInvestmentMessage}
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="rank-modal-close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
