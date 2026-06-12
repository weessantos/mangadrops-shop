import { useState } from "react";
import { useLockBodyScroll } from "../../hooks/my-collection-hooks/useLockBodyScroll";

import {
  updateAvatar,
  updateBanner,
} from "../../hooks/my-collection-hooks/profileImages";

import { showError, showSuccess, showWarning } from "../../utils/alertFeedback";

import {
  getUnlockedAvatars,
  getUnlockedBanners,
} from "../../utils/my-collection/collectorRank";

import "../../styles/my-collection/my-profile-modal.css";

const avatars = Array.from(
  { length: 105 },
  (_, index) =>
    `/assets/my-collection/avatars/avatar${String(index + 1).padStart(2, "0")}.png`,
);

const banners = Array.from(
  { length: 50 },
  (_, index) =>
    `/assets/my-collection/banners/banner${String(index + 1).padStart(2, "0")}.webp`,
);

export default function AvatarModal({
  onClose,
  onSaved,

  collectorRank,
  investmentRank,
}) {
  const unlockedAvatars = getUnlockedAvatars(
    collectorRank.levelValue,
    collectorRank.rank === "ARCANISTA_SUPREMO",
  );

  const unlockedBanners = getUnlockedBanners(
    investmentRank.levelValue,
    collectorRank.rank === "ARCANISTA_SUPREMO",
  );

  const [activeTab, setActiveTab] = useState("avatar");

  useLockBodyScroll();

  async function handleSelectAvatar(avatarUrl) {
    try {
      await updateAvatar(avatarUrl);

      onSaved();
    } catch (error) {
      console.error(error);

      showWarning("Erro ao atualizar avatar.");
    }
  }

  async function handleSelectBanner(bannerUrl) {
    try {
      await updateBanner(bannerUrl);

      onSaved();
    } catch (error) {
      console.error(error);

      showWarning("Erro ao atualizar banner.");
    }
  }

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal tablet-scale" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-modal-header">
          <h2>Editar Perfil</h2>

          <button className="avatar-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="avatar-modal-subtitle">
          Colecione volumes, evolua seus ranks e desbloqueie novas
          personalizações.
        </p>

        <div className="profile-tabs">
          <button
            className={activeTab === "avatar" ? "active" : ""}
            onClick={() => setActiveTab("avatar")}
          >
            Avatar
          </button>

          <button
            className={activeTab === "banner" ? "active" : ""}
            onClick={() => setActiveTab("banner")}
          >
            Banner
          </button>
        </div>

        {activeTab === "avatar" && (
          <>
            <div className="profile-unlock-info">
              Avatares desbloqueados • {unlockedAvatars}/{avatars.length}
            </div>
            <div className="avatar-content">
              <div className="avatar-grid">
                {avatars.map((avatar, index) => {
                  const unlocked = index < unlockedAvatars;

                  return (
                    <button
                      key={avatar}
                      className={`avatar-option ${!unlocked ? "locked" : ""}`}
                      disabled={!unlocked}
                      onClick={() => unlocked && handleSelectAvatar(avatar)}
                    >
                      <img src={avatar} alt={`Avatar ${index + 1}`} />

                      {!unlocked && <div className="avatar-lock">🔒</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === "banner" && (
          <>
            <div className="profile-unlock-info">
              Banners desbloqueados • {unlockedBanners}/{banners.length}
            </div>
            <div className="banner-content">
              <div className="banner-grid">
                {banners.map((banner, index) => {
                  const unlocked = index < unlockedBanners;

                  return (
                    <button
                      key={banner}
                      className={`banner-option ${!unlocked ? "locked" : ""}`}
                      disabled={!unlocked}
                      onClick={() => unlocked && handleSelectBanner(banner)}
                    >
                      <img src={banner} alt={`Banner ${index + 1}`} />

                      {!unlocked && <div className="avatar-lock">🔒</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
